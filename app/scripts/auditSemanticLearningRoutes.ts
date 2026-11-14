// SPDX-License-Identifier: Apache-2.0
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGraphValidationLandscapes } from './lib/graphValidationInventory'
import { validateHardDirectAtomicRoutes } from './lib/hardLearningRouteValidation'
import { loadSemanticRouteInventory } from './lib/semanticRouteInventory'

export async function auditSemanticLearningRoutes(repositoryRoot: string) {
  const inventory = await loadSemanticRouteInventory(repositoryRoot,
    loadGraphValidationLandscapes(resolve(repositoryRoot, 'curricula')))
  const scopes = inventory.policy.scopes.map(scope => {
    const profile = inventory.profiles.find(profile => profile.profileId === scope.scopeId)
    if (!profile) return { ...scope, outcome: 'unavailable' as const, selectedCurricularGoals: null, findings: null }
    const findings = validateHardDirectAtomicRoutes(inventory.goals, inventory.semanticKindByGoalId, profile)
    return {
      ...scope,
      outcome: findings.length ? 'fail' as const : 'pass' as const,
      selectedCurricularGoals: inventory.goals.filter(profile.goalSelector).length,
      findings,
    }
  })
  // The established global lane is not the complete learner-facing subtree
  // union. Report that separate alignment debt instead of hiding it behind the
  // explicit-placement repair or silently widening the protected CQR lane.
  const scopeAlignmentDebt = inventory.profiles.flatMap(profile => {
    const broader = inventory.scopeAlignmentProfiles.find(candidate => candidate.profileId === profile.profileId)!
    const additionalInheritedTargetGoalIds = inventory.goals.filter(goal => broader.goalSelector(goal) && !profile.goalSelector(goal))
      .map(goal => goal.id).sort()
    if (!additionalInheritedTargetGoalIds.length) return []
    const additionalIds = new Set(additionalInheritedTargetGoalIds)
    const findings = validateHardDirectAtomicRoutes(inventory.goals, inventory.semanticKindByGoalId, broader)
      .filter(finding => finding.goalId && additionalIds.has(finding.goalId))
    return [{
      profileId: profile.profileId,
      status: 'scope-alignment-debt',
      semantics: 'Inherited national stage-subtree targets beyond the established global route lane; diagnostic only, not covered by the explicit goalEntry selector override.',
      additionalInheritedTargetGoalIds,
      broaderSelectedCurricularGoals: inventory.goals.filter(broader.goalSelector).length,
      findings,
    }]
  })
  // Re-read the exact bytes after route evaluation; a mixed-time report is an
  // error even when both versions would independently satisfy the hard gate.
  inventory.assertInputsCurrent()
  const inputBindings = [...inventory.inputBindings].sort((a, b) => a.path.localeCompare(b.path, 'en'))
  return {
    schemaVersion: 1,
    domain: 'canonical Gymnasium shared QA scopes',
    rule: 'GVR-012',
    semantics: 'Authored direct atomic prerequisites and authoritative node kinds; Mathematics retains its established stage-bound route nodes, other scopes may use canonical prerequisite intermediates. Selected ordinary goals and required terminal paths remain bound to the shared QA scope.',
    summary: {
      registeredScopes: scopes.length,
      directlyRequiredScopes: scopes.filter(scope => scope.status === 'required').length,
      ledgerBackedScopes: inventory.profiles.length,
      passingScopes: scopes.filter(scope => scope.outcome === 'pass').length,
      failingScopes: scopes.filter(scope => scope.outcome === 'fail').length,
      unavailableScopes: scopes.filter(scope => scope.outcome === 'unavailable').length,
      routeFindings: scopes.reduce((sum, scope) => sum + (scope.findings?.length ?? 0), 0),
    },
    ledgerSources: inventory.policy.ledgerSources.map(source => {
      const ownedGoals = inventory.goals.filter(goal => inventory.ownerByGoalId.get(goal.id) === source.landscapeId)
      const profiles = inventory.profiles.filter(profile => profile.landscapeId === source.landscapeId)
      const curricularGoals = ownedGoals.filter(goal => inventory.semanticKindByGoalId.get(goal.id) === 'curricularAtomic')
      return {
        ...source,
        currentGoals: ownedGoals.length,
        currentCurricularAtomicGoals: curricularGoals.length,
        curricularGoalsOutsideRegisteredScopes: curricularGoals.filter(goal => !profiles.some(profile => profile.goalSelector(goal))).map(goal => goal.id).sort(),
      }
    }),
    historicalReviewDiagnostic: inventory.historicalReviewDiagnostic ?? null,
    coverageBaseline: inventory.coverageBaseline,
    inputBindings,
    scopes,
    scopeAlignmentDebt,
  }
}

async function main() {
  const args = process.argv.slice(2)
  let outputPath: string | undefined
  let reportOnly = false
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--report-only' && !reportOnly) reportOnly = true
    else if (args[index] === '--output' && !outputPath && args[index + 1]) outputPath = resolve(args[++index]!)
    else throw new Error('usage: auditSemanticLearningRoutes.ts [--report-only] [--output <path>]')
  }
  const report = await auditSemanticLearningRoutes(resolve(dirname(fileURLToPath(import.meta.url)), '../..'))
  if (outputPath) writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Semantic learning routes: ${report.summary.directlyRequiredScopes}/${report.summary.registeredScopes} directly required; ${report.summary.passingScopes} passing, ${report.summary.failingScopes} failing, ${report.summary.unavailableScopes} without a current ledger; ${report.summary.routeFindings} findings.`)
  for (const scope of report.scopes) console.log(`${scope.scopeId}: ${scope.outcome}; ${scope.findings?.length ?? 'unavailable'} findings (${scope.status})`)
  // This diagnostic command checks every ledger-backed candidate. Its named
  // report mode never changes validate:graph or the required scope policy.
  if (!reportOnly && (report.summary.failingScopes || report.summary.unavailableScopes)) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1 })
}
