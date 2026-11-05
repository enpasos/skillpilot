import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const outputDir = resolve(repoRoot, 'tmp/math-learning-units')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const oldRef = '802f333f80c58d3409ab5d9fb3e9913fecafbf54'
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const stable = (value: unknown): string => JSON.stringify(value, (_key, item: unknown) => (
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.entries(item).sort(([left], [right]) => left.localeCompare(right, 'en')))
    : item
))
const read = (path: string) => readFileSync(resolve(repoRoot, path), 'utf8')
const git = (...args: string[]) => execFileSync('git', ['-c', 'core.trustctime=false', ...args], {
  cwd: repoRoot, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
})
const json = (path: string) => JSON.parse(read(path))
const write = (path: string, value: unknown) => writeFileSync(resolve(outputDir, path), `${JSON.stringify(JSON.parse(stable(value)), null, 2)}\n`)

interface Goal {
  id: string; title: string; contains?: string[]; requires?: string[]; nodeKind?: string
  semanticKind?: string; tags?: string[]; extendedData?: Record<string, unknown>
  examData?: { coveredGoalIds?: string[]; reviewStatus?: string; taskContent?: string; solutionContent?: string; scoring?: unknown }
}
interface NativeScope {
  scopeId: string; offeredByNativePlanner: boolean; declaredByRepositoryGui: boolean
  projectionResolved: boolean; prerequisiteCompilationResolved?: boolean
  projectionError?: string; prerequisiteCompilationError?: string
  targetAtomicGoalIds?: string[]; targetGoalIds?: string[]; prerequisiteOnlyGoalIds?: string[]
  assessmentGoalIds?: string[]; recallGoalIds?: string[]; orientationGoalIds?: string[]
  externalSupportAtomicGoalIds?: string[]; atomicPrerequisites?: Record<string, string[]>
  duplicateVisibleGoalPaths?: Record<string, string[]>; missingVisibleGoalIds?: string[]
  compositionViewIds?: string[]
}

export function requireNativeInventory(value: unknown): asserts value is {
  schemaVersion: number; scopes: NativeScope[]; nativeMapperInputSha256: Record<string, string>
  plannerScopeIds: string[]; declaredScopeIds: string[]; discoveryFailures: unknown[]
  publicMathModules: Array<Record<string, unknown>>; [key: string]: unknown
} {
  assert.ok(value && typeof value === 'object', 'Missing native inventory')
  const report = value as Record<string, unknown>
  assert.equal(report.schemaVersion, 1, 'Unknown native inventory schema')
  assert.equal(report.measurement, 'actual-backend-planner-and-learner-projection')
  assert.ok(Array.isArray(report.scopes) && report.scopes.length > 0, 'Native scope discovery is empty')
  assert.ok(report.nativeMapperInputSha256 && typeof report.nativeMapperInputSha256 === 'object', 'Native inputs are unbound')
  assert.ok(Object.entries(report.nativeMapperInputSha256).length > 0, 'Native inputs are empty')
  for (const [path, digest] of Object.entries(report.nativeMapperInputSha256)) {
    assert.ok(path && typeof digest === 'string' && /^[0-9a-f]{64}$/.test(digest), 'Malformed native input binding')
  }
  const seen = new Set<string>()
  for (const scope of report.scopes as NativeScope[]) {
    assert.ok(scope.scopeId && !seen.has(scope.scopeId), `Missing/duplicate scope identity ${scope.scopeId}`)
    seen.add(scope.scopeId)
    assert.equal(typeof scope.projectionResolved, 'boolean', `Missing resolution result: ${scope.scopeId}`)
    assert.ok(scope.offeredByNativePlanner || scope.declaredByRepositoryGui, `Invented offer: ${scope.scopeId}`)
    if (scope.projectionResolved) {
      assert.ok(scope.targetAtomicGoalIds?.length, `Resolved offering has no targets: ${scope.scopeId}`)
      assert.ok(scope.compositionViewIds?.length, `Resolved offering has no authored views: ${scope.scopeId}`)
      for (const key of ['assessmentGoalIds', 'recallGoalIds', 'orientationGoalIds'] as const) {
        for (const id of scope[key] ?? []) assert.ok(scope.targetAtomicGoalIds.includes(id), `${key} contains a foreign target ${id}`)
      }
      assert.equal(typeof scope.prerequisiteCompilationResolved, 'boolean', `Missing prerequisite result: ${scope.scopeId}`)
      if (!scope.prerequisiteCompilationResolved) assert.ok(scope.prerequisiteCompilationError)
    } else assert.ok(scope.projectionError, `Failed scope lost its cause: ${scope.scopeId}`)
  }
  const expected = new Set([...(report.plannerScopeIds as string[]), ...(report.declaredScopeIds as string[])])
  assert.deepEqual([...seen].sort(), [...expected].sort(), 'An offered entry point was silently omitted')
}

function filesBelow(path: string): string[] {
  if (!existsSync(resolve(repoRoot, path))) return []
  return readdirSync(resolve(repoRoot, path), { withFileTypes: true }).flatMap(entry => (
    entry.isDirectory() ? filesBelow(`${path}/${entry.name}`) : [`${path}/${entry.name}`]
  )).sort()
}

function closure(start: Iterable<string>, prerequisites: Record<string, string[]>): Set<string> {
  const reached = new Set<string>()
  const pending = [...start]
  while (pending.length) {
    const id = pending.pop()!
    if (reached.has(id)) continue
    reached.add(id)
    pending.push(...(prerequisites[id] ?? []))
  }
  return reached
}

function main() {
  mkdirSync(outputDir, { recursive: true })
  if (!process.argv.includes('--report-only')) {
    execFileSync('./gradlew', ['--no-daemon', '--max-workers=1', '--init-script',
      '../app/scripts/learningUnits/nativeMathInventory.init.gradle', 'nativeMathOfferingInventory'], {
      cwd: resolve(repoRoot, 'backend'), stdio: 'inherit',
      env: { ...process.env, GRADLE_USER_HOME: process.env.GRADLE_USER_HOME ?? resolve(repoRoot, 'tmp/chatgpt-coach-gradle-user-home') },
    })
  }
  const raw = json('tmp/math-learning-units/native-backend.raw.json')
  requireNativeInventory(raw)
  for (const [path, expected] of Object.entries(raw.nativeMapperInputSha256)) {
    assert.equal(hash(readFileSync(resolve(repoRoot, path))), expected, `Native runtime input changed: ${path}; rerun the native adapter`)
  }
  const current = json(canonicalPath) as { landscapeId: string; goals: Goal[]; programUnits: unknown[]; goalPlacements: unknown[] }
  const ledger = json(ledgerPath) as { decisions: Array<{ goalId: string; semanticKind: string }>; counts: Record<string, number> }
  const kinds = new Map(ledger.decisions.map(decision => [decision.goalId, decision.semanticKind]))
  const goals = new Map(current.goals.map(goal => [goal.id, goal]))
  const allTargets = new Set(raw.scopes.flatMap(scope => scope.targetAtomicGoalIds ?? []))
  const curricularTargets = [...allTargets].filter(id => kinds.get(id) === 'curricularAtomic').sort()
  const scopeRows = raw.scopes.map(scope => {
    const curricular = (scope.targetAtomicGoalIds ?? []).filter(id => kinds.get(id) === 'curricularAtomic')
    const reachableFromQ = closure(scope.assessmentGoalIds ?? [], scope.atomicPrerequisites ?? {})
    return { ...scope,
      curricularAtomicTargetGoalIds: curricular,
      // This is a route-inventory diagnostic, never task/rubric or unit-contract approval.
      curricularTargetsOutsideAssessmentDemand: curricular.filter(id => !reachableFromQ.has(id)),
    }
  })
  const sourcePaths = [canonicalPath, ledgerPath, 'app/src/generated/gymnasiumDurationOfferings.ts',
    'curricula/curriculum_manifest.json', 'app/scripts/config/curriculum-maturity-floor-policy.json',
    'docs/qa-ci/status/curriculum-quality-status.json',
    ...filesBelow('backend/src/main/java').filter(path => path.endsWith('.java')),
    ...filesBelow('app/scripts/learningUnits'), 'app/scripts/learningUnitsNativeMathInventory.ts']
  const inputSha256 = { ...raw.nativeMapperInputSha256,
    ...Object.fromEntries([...new Set(sourcePaths)].sort().map(path => [path, hash(readFileSync(resolve(repoRoot, path)))])),
  }
  const qa = json('docs/qa-ci/status/curriculum-quality-status.json')
  const qualitySnapshot = qa.curricula.find((entry: { landscapeId: string }) => entry.landscapeId === current.landscapeId)
  const summary = {
    scopeCount: scopeRows.length,
    plannerScopeCount: raw.plannerScopeIds.length,
    declaredGuiScopeCount: raw.declaredScopeIds.length,
    failedProjectionScopes: scopeRows.filter(scope => !scope.projectionResolved).map(scope => scope.scopeId),
    failedPrerequisiteScopes: scopeRows.filter(scope => !scope.prerequisiteCompilationResolved).map(scope => scope.scopeId),
    duplicateHierarchyScopes: scopeRows.filter(scope => Object.keys(scope.duplicateVisibleGoalPaths ?? {}).length).map(scope => scope.scopeId),
    missingHierarchyScopes: scopeRows.filter(scope => scope.missingVisibleGoalIds?.length).map(scope => scope.scopeId),
    targetAtomicGoalCount: allTargets.size, curricularAtomicTargetCount: curricularTargets.length,
    canonicalGoalCount: current.goals.length, canonicalProgramUnitCount: current.programUnits.length,
    canonicalGoalPlacementCount: current.goalPlacements.length,
    countries: [...new Set(scopeRows.map(scope => scope.scopeId.split('/')[0]).filter(id => id !== 'ALL'))].sort(),
    nativeDiscoveryFailures: raw.discoveryFailures,
  }
  const content = { ...raw, scopes: scopeRows, summary, inputSha256,
    repositoryHead: git('rev-parse', 'HEAD').trim(),
    status: 'inventory-only; no new unit/task/rubric/source QA, M7, deployment or host acceptance',
    qualitySnapshot: { generatedAt: qa.generatedAt, rulesVersion: qa.rulesVersion, record: qualitySnapshot },
    curricularAtomicTargetGoalIds: curricularTargets,
  }
  write('native-math-inventory.json', { ...content, inventorySha256: hash(stable(content)) })

  const parents = new Map<string, string[]>()
  for (const goal of current.goals) for (const child of goal.contains ?? []) parents.set(child, [...(parents.get(child) ?? []), goal.id])
  const ancestry = (id: string): string[] => [...closure(parents.get(id) ?? [], Object.fromEntries(parents))].sort()
  const clusterPackets = current.goals.filter(goal => (goal.contains?.length ?? 0) > 0).map(goal => {
    const direct = (goal.contains ?? []).filter(id => curricularTargets.includes(id))
    return { canonicalClusterId: goal.id, title: goal.title,
      semanticKind: kinds.get(goal.id), candidateOnly: true,
      directCurricularTargetGoalIds: direct,
      directAssessmentGoalIds: (goal.contains ?? []).filter(id => goals.get(id)?.examData || goals.get(id)?.nodeKind === 'exam'),
      ancestorClusterIds: ancestry(goal.id),
      note: 'Authoring work packet, not an approved unit role or inferred ownership. Calendar/program headings need an explicit educational promise.',
    }
  }).filter(packet => packet.directCurricularTargetGoalIds.length)
  write('math-authoring-work-packets.json', {
    schemaVersion: 1, status: 'proposal-only; no curriculum changes',
    programUnits: current.programUnits, goalPlacements: current.goalPlacements,
    clusterPackets,
    curricularTargets: curricularTargets.map(id => ({ id, title: goals.get(id)?.title,
      directCanonicalParentIds: parents.get(id) ?? [], ancestorClusterIds: ancestry(id),
      nativeScopeIds: scopeRows.filter(scope => scope.targetAtomicGoalIds?.includes(id)).map(scope => scope.scopeId),
    })),
    recallGoals: current.goals.filter(goal => kinds.get(goal.id) === 'memory').map(goal => ({ ...goal,
      policy: 'Keep existing explicit duty. Broad decks cannot be moved to parent or treated as support to hide child recall.',
    })),
    ownAssessmentCoverageStatus: 'Not yet authored: existing requires/coveredGoalIds are candidate evidence only; each final Own ordinary target needs its own reviewed normal Q claim.',
  })

  const old = JSON.parse(git('show', `${oldRef}:${canonicalPath}`)) as typeof current
  const oldById = new Map(old.goals.map(goal => [goal.id, goal]))
  const newAssessments = old.goals.filter(goal => !goals.has(goal.id))
  const retyped = old.goals.filter(goal => goals.has(goal.id) && goal.nodeKind === 'exam' && goals.get(goal.id)?.nodeKind !== 'exam')
  const changed = git('diff', '--name-status', 'HEAD', oldRef, '--', 'curricula/DE/Gymnasium/assessments/mathematik',
    'curricula/DE/Gymnasium/quality/assessment-completion', 'app/scripts/mathStageScopePolicy.ts',
    'app/scripts/mathReviewedAssessmentPlacements.ts', 'app/scripts/mathContextualTerminalPlacements.ts',
    'app/scripts/mathQ3WholeScopePlacements.ts', 'app/scripts/generateMathCountrySekICompositionViews.ts',
    'app/scripts/generateMathDurationCompositionViews.ts').trim().split('\n').filter(Boolean).map(line => {
      const [change, path] = line.split('\t'); return { change, path }
    })
  const artifactsFor = (id: string) => changed.filter(file => file.path.includes(id)).map(file => file.path)
  const reuse = {
    schemaVersion: 1, currentHead: git('rev-parse', 'HEAD').trim(), oldRemoteHead: oldRef,
    oldLocalCheckpoint: '4f1241b634c7e399c7651b90425b556acd4610f6',
    localVsRemoteChangedFiles: git('diff', '--name-only', oldRef, '4f1241b634c7e399c7651b90425b556acd4610f6').trim().split('\n').filter(Boolean),
    newAssessmentCount: newAssessments.length, ordinaryToExamRetypingCount: retyped.length,
    newAssessments: newAssessments.map(goal => ({ id: goal.id, title: goal.title, requires: goal.requires,
      coveredGoalIds: goal.examData?.coveredGoalIds, artifactPaths: artifactsFor(goal.id),
      decision: 'Candidate material; bind correct Own unit and independently review ordinary pass before reuse.' })),
    ordinaryToExamRetypings: retyped.map(goal => ({ id: goal.id, title: goal.title,
      originalGoalSha256: hash(stable(goals.get(goal.id))), oldCandidateGoalSha256: hash(stable(oldById.get(goal.id))),
      artifactPaths: artifactsFor(goal.id),
      decision: 'Preserve original ordinary goal/result meaning. Reuse stronger task with new stable assessment identity unless full historical equivalence is independently established.' })),
    reusableFileCandidates: changed,
    semanticsExcluded: ['stop at explicitly mastered intermediates', 'scope-local discharge as global recognition',
      'Full-PC ownership', 'card-only application coverage', '35 ordinary IDs retyped directly', 'historical 161/154 as acceptance denominator'],
  }
  write('pr79-reuse-inventory.json', reuse)
  if (process.argv.includes('--publish-snapshot')) {
    const membership = (key: 'targetAtomicGoalIds' | 'prerequisiteOnlyGoalIds') => {
      const ids = [...new Set(scopeRows.flatMap(scope => scope[key] ?? []))].sort()
      return ids.map(goalId => ({ goalId,
        scopeIndices: scopeRows.flatMap((scope, index) => scope[key]?.includes(goalId) ? [index] : []),
      }))
    }
    const publicCatalogGroups = [...new Set(raw.publicMathModules.map(module => module.baseCurriculumId))].map(baseId => {
      const modules = raw.publicMathModules.filter(module => module.baseCurriculumId === baseId)
      return { baseCurriculumId: baseId, baseTitle: modules[0].baseTitle,
        entryPoint: 'LandscapeService.getBaseCurricula(false); public catalog root',
        scopeDisposition: baseId === 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
          ? 'included: canonical Gymnasium Mathematics and all measured native entry-point scopes'
          : 'outside this Gymnasium correction; separately selectable base curriculum; no conversion/acceptance claimed',
        mathematicsSearchModuleCandidates: modules.map(module => ({ ...module,
          qualitySnapshotMaturity: module.landscapeId === current.landscapeId ? qualitySnapshot.maturity : 'not present in canonical Gymnasium QA status',
          matchMeaning: String(module.subject).includes('Physik') ? 'title/subject search match within Physics, not a separately offered Mathematics subject' : 'module within this base curriculum; not an independent catalog-root offer',
        })),
      }
    })
    const snapshot = {
      schemaVersion: 1, date: '2026-11-05', repositoryHead: content.repositoryHead,
      inventoryRole: 'fixed initial denominator for the canonical Gymnasium Mathematics learning-unit conversion; no new unit or M7 acceptance',
      landscapeId: current.landscapeId, baseCurriculumId: 'a0e13c56-c25f-4742-9272-3a1a603ee52e', summary,
      sourceDigests: {
        canonicalSha256: inputSha256[canonicalPath], semanticKindLedgerSha256: inputSha256[ledgerPath],
        guiOfferingDeclarationsSha256: inputSha256['app/src/generated/gymnasiumDurationOfferings.ts'],
        catalogManifestSha256: inputSha256['curricula/curriculum_manifest.json'],
        qualityStatusSha256: inputSha256['docs/qa-ci/status/curriculum-quality-status.json'],
        maturityFloorPolicySha256: inputSha256['app/scripts/config/curriculum-maturity-floor-policy.json'],
        nativeMapperInputCount: Object.keys(raw.nativeMapperInputSha256).length,
        nativeMapperInputManifestSha256: hash(stable(raw.nativeMapperInputSha256)),
        nativeMeasurementPayloadSha256: hash(stable(raw)),
        measurementSourceSha256: hash(stable(Object.fromEntries(Object.entries(inputSha256).filter(([path]) => path.startsWith('backend/src/main/java') || path.startsWith('app/scripts/learningUnits'))))),
      },
      scopes: scopeRows.map(scope => ({ scopeId: scope.scopeId, offeredByNativePlanner: scope.offeredByNativePlanner,
        declaredByRepositoryGui: scope.declaredByRepositoryGui, projectionResolved: scope.projectionResolved,
        prerequisiteCompilationResolved: scope.prerequisiteCompilationResolved,
        targetAtomicCount: scope.targetAtomicGoalIds?.length, prerequisiteOnlyCount: scope.prerequisiteOnlyGoalIds?.length,
        targetSetSha256: hash(stable(scope.targetAtomicGoalIds)), assessmentGoalIds: scope.assessmentGoalIds,
        recallGoalIds: scope.recallGoalIds, compositionViewIds: scope.compositionViewIds,
        duplicateVisibleGoalIds: Object.keys(scope.duplicateVisibleGoalPaths ?? {}),
      })),
      targetAtomicMembership: membership('targetAtomicGoalIds'), prerequisiteOnlyMembership: membership('prerequisiteOnlyGoalIds'),
      membershipSemantics: 'scopeIndices index the scopes array; roles come from the backend projection. This is lossless membership, not inferred ownership.',
      qualitySnapshot: { generatedAt: qa.generatedAt, rulesVersion: qa.rulesVersion,
        maturity: qualitySnapshot.maturity, rules: qualitySnapshot.rules.map((rule: { id: string; status: string }) => ({ id: rule.id, status: rule.status })) },
      publicCatalogGroups,
      legacyBoundary: 'Historical Hessen SekI/SekII and Bayern Gymnasium roots remain hidden/compatibility entries under the native default catalog; not new active base offers. Their immutable history is preserved.',
      pr79: { oldRemoteHead: oldRef, addedAssessmentGoalIds: newAssessments.map(goal => goal.id).sort(),
        historicalOrdinaryGoalIdsToPreserve: retyped.map(goal => goal.id).sort() },
      reproduction: 'cd app && npx tsx scripts/learningUnitsNativeMathInventory.ts --publish-snapshot',
      limitations: ['Read-only native measurement with unsaved learner fixture and mocked repositories',
        'Existing dated M7 status is source evidence, not fresh machine QA or human review',
        'Requires reachability and coveredGoalIds do not prove independent normal-pass application',
        'No new ownership, task/rubric/unit review, deployment, publication or host acceptance'],
    }
    writeFileSync(resolve(repoRoot, 'docs/dev/learning-units-mathematics-offering-inventory.json'), `${JSON.stringify(snapshot, null, 2)}\n`)
  }
  const byCountry = new Map<string, number>()
  for (const scope of scopeRows) byCountry.set(scope.scopeId.split('/')[0], (byCountry.get(scope.scopeId.split('/')[0]) ?? 0) + 1)
  const md = `# Native Mathematics offering inventory\n\n` +
    `Head: \`${content.repositoryHead}\`. Deterministic inventory digest is recorded in native-math-inventory.json.\n\n` +
    `The measured scope union contains **${summary.scopeCount}** offers: ${summary.declaredGuiScopeCount} repository GUI declarations and ${summary.plannerScopeCount} actual native planner completions. Each row retains both entry-point flags, exact config, native target/support/Q/K IDs, resolved views, every visible path and expanded atomic prerequisite edges. This is a fresh measurement, not reuse of historical counts.\n\n` +
    `Projection failures: ${summary.failedProjectionScopes.length}; prerequisite compiler failures: ${summary.failedPrerequisiteScopes.length}; duplicate visible hierarchies: ${summary.duplicateHierarchyScopes.length}; missing visible hierarchies: ${summary.missingHierarchyScopes.length}. Failures remain explicit in the JSON.\n\n` +
    `The union has ${summary.targetAtomicGoalCount} atomic Mathematics targets, including ${summary.curricularAtomicTargetCount} curricular atoms. Canonical data has ${summary.canonicalGoalCount} goals, ${summary.canonicalProgramUnitCount} program units and ${summary.canonicalGoalPlacementCount} placements. Existing machine-QA status is retained as a dated snapshot; this run does not refresh M7 or approve new unit content.\n\n` +
    `| Jurisdiction | Measured scope union |\n| --- | ---: |\n${[...byCountry].map(([key, count]) => `| ${key} | ${count} |`).join('\n')}\n\n` +
    `PR #79 supplies ${newAssessments.length} added assessment IDs and ${retyped.length} ordinary-to-exam changes. Tasks/rubrics, content reviews, generator and scope fixtures are indexed separately in pr79-reuse-inventory.json. The original ordinary IDs remain ordinary; stronger assessments need separate identities.\n\n` +
    `math-authoring-work-packets.json lists existing canonical clusters, parents, placements, applicable native scopes and broad card duties. These are work packets, not automatically approved units. Every final Own ordinary target still needs its own normal assessment claim and independent counterexample review.\n\n` +
    `Public catalog Mathematics modules outside the canonical Gymnasium graph are listed in publicMathModules. This inventory does not silently mark them converted or exclude them from a claimed all-Mathematics milestone; the release boundary must name them.\n\n` +
    `Reproduce from app/: \`npx tsx scripts/learningUnitsNativeMathInventory.ts\`. Existing raw measurement only: append \`--report-only\`; bound inputs are checked for drift. No database or learner write, portal/publication/deployment action or external host test is performed.\n`
  writeFileSync(resolve(outputDir, 'native-math-inventory.md'), md)
  console.log(JSON.stringify(summary, null, 2))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
