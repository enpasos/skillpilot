import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { createHash } from 'node:crypto'

async function main() {
  const root = process.cwd()
  const out = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current693-bounded-surrogate-source-bindings-INERT-author-a-v1')
  const { buildApplicabilityCompilation } = await import(resolve(root, 'app/scripts/applicabilityCompiler.ts'))
  const { createReviewedRequiresClosureCoverageChecker, sourceCoverageSurrogateKey, hasDirectSourceCoverageEvidence } = await import(resolve(root, 'app/scripts/sourceCoverageEvidence.ts'))
  const { collectAuthoritativeTargetAtomicGoalIds } = await import(resolve(root, 'app/scripts/compositionViewSourceCoverage.ts'))
  const canPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
  const regPath = 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'
  const can = JSON.parse(readFileSync(resolve(root, canPath), 'utf8'))
  const reg = JSON.parse(readFileSync(resolve(root, regPath), 'utf8'))
  const goals = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
  const report = buildApplicabilityCompilation().reports.find((r: any) => r.landscapeId === can.landscapeId)!
  const viewDir = resolve(root, 'curricula/DE/Gymnasium/composition-views/wirtschaft')
  const views = readdirSync(viewDir).filter(p => p.endsWith('.view.json')).sort().map(p => ({ path: 'curricula/DE/Gymnasium/composition-views/wirtschaft/' + p, raw: JSON.parse(readFileSync(resolve(viewDir, p), 'utf8')) }))
  const targets = views.map(v => ({ ...v, ids: collectAuthoritativeTargetAtomicGoalIds(can, v.raw) }))
  const canonicalIds = new Set<string>(targets.filter(v => basename(v.path).startsWith('de-de')).flatMap(v => [...v.ids]))
  // Exact production isCurriculumSourceCoverageGoal policy: memory, Practice,
  // Assessment, Motivation, Orientation and examData cannot be source carriers.
  const eligible = (g: any) => !!g && g.nodeKind !== 'memory' && !(g.tags ?? []).some((t: string) => t === 'memorization' || t.startsWith('srs-deck:') || ['Practice','Assessment','Motivation','Orientation'].includes(t)) && !g.examData
  const entriesByKey = new Map<string, any[]>()
  for (const e of reg.entries) {
    if (e.status !== 'accepted' || e.evidenceType !== 'requires-closure' || typeof e.rationale !== 'string' || !e.rationale.trim()) continue
    const key = sourceCoverageSurrogateKey(e.landscapeId, e.goalId, e.jurisdiction)
    entriesByKey.set(key, [...(entriesByKey.get(key) ?? []), e])
  }
  const unsupported: any[] = []
  const allCoverage: any[] = []
  for (const projection of report.projections) {
    const country = projection.value
    const inCountry = targets.filter(v => basename(v.path).startsWith(country.toLowerCase()))
    const ids = new Set(inCountry.flatMap(v => [...v.ids]))
    const checker = createReviewedRequiresClosureCoverageChecker({ landscapeId: can.landscapeId, jurisdiction: country, goals: report.goals, canonicalGoalById: goals, surrogateEntriesByKey: entriesByKey, isEligibleCanonicalGoal: eligible })
    const visible = report.goals.filter((g: any) => g.goalType === 'atomic' && ids.has(g.goalId) && canonicalIds.has(g.goalId) && eligible(goals.get(g.goalId)))
    const fails = visible.filter(g => !checker.hasCoverageBackedJurisdictionEvidence(g))
    allCoverage.push({ jurisdiction: country, visible: visible.length, supported: visible.length-fails.length, unsupported: fails.length })
    for (const g of fails) {
      const oldEntries = reg.entries.filter((e: any) => e.landscapeId === can.landscapeId && e.goalId === g.goalId && e.jurisdiction === country)
      const countryEvidence = g.evidence.filter(e => e.value === country)
      const actualCarriers = countryEvidence.filter(e => e.kind === 'requires-closure').map(e => e.source.replace(/^required by /, '')).map(id => {
        const carrier = goals.get(id)
        const carrierReport = report.goals.find(g => g.goalId === id)
        return { goalId: id, title: carrier?.title, eligible: eligible(carrier), type: carrierReport?.goalType, directRequires: (carrier?.requires ?? []).includes(g.goalId), sourceBacked: !!carrierReport && checker.hasCoverageBackedJurisdictionEvidence(carrierReport), directSourceBacked: !!carrierReport && hasDirectSourceCoverageEvidence(carrierReport, country), sourceEvidence: carrierReport?.evidence.filter(e => e.value === country && (e.kind === 'mapping' || e.kind === 'provenance')), wholeCarrier: carrier }
      })
      unsupported.push({ jurisdiction: country, goalId: g.goalId, title: g.title, wholeCurrentGoal: goals.get(g.goalId), countryEvidence, oldEntries, actualCarriers, targetViews: inCountry.filter(v => v.ids.has(g.goalId)).map(v => v.path) })
    }
  }
  const inputPaths = [canPath, regPath, ...views.map(v => v.path), 'app/scripts/sourceCoverageEvidence.ts', 'app/scripts/applicabilityCompiler.ts', 'app/scripts/compositionViewSourceCoverage.ts', 'app/scripts/generateCurriculumQualityStatus.ts']
  const guards = inputPaths.map(path => ({ path, sha256: createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex') }))
  writeFileSync(resolve(out, 'actual-current693-Economics-native-applicability-only.READONLY.json'), JSON.stringify(report,null,2)+'\n')
  writeFileSync(resolve(out, 'actual-current693-native32-unsupported-individual-IDs-carriers-and-causes.READONLY.json'), JSON.stringify({ actualAt:new Date().toISOString(), landscapeId:can.landscapeId, canonicalWholeGoals:can.goals.length, wholeRegistryRows:reg.entries.length, EconomicsRegistryRows:reg.entries.filter((e:any)=>e.landscapeId===can.landscapeId).length, fingerprintBindingInNativeSurrogateContract:false, actualCoverage:allCoverage, unsupportedOccurrences:unsupported.length, distinctUnsupportedIds:new Set(unsupported.map(e=>e.goalId)).size, unsupported, inputGuards:guards, activeWrites:0 },null,2)+'\n')
  console.log(JSON.stringify({ count:unsupported.length, ids:[...new Set(unsupported.map(g=>g.goalId))], coverage:allCoverage }))
}
main().catch(e => { console.error(e); process.exit(1) })
