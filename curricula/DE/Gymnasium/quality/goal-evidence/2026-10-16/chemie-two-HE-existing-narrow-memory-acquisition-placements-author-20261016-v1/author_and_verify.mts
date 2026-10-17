import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

// Finite AUTHOR preparation. This program does not write the source capsule or
// normal inputs, invent a new M decision, or grant an independent review.
const R = resolve('.')
const E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const output = `${E}/chemie-two-HE-existing-narrow-memory-acquisition-placements-author-20261016-v1`
const prior = `${E}/chemie-HE-transitive-course-prerequisites-targeted-author-successor-20261016-v1`
const K = resolve('tmp/chemie-m7-resumed-20261016/he-transitive-course-stock-capsule')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const viewsPath = 'curricula/DE/Gymnasium/composition-views/chemie'
const mReviewPath = `${prior}/author-prospective-M436/M436.author-candidate.review.jsonl`
const deckPath = 'app/public/data/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const stable = (value: any): string => JSON.stringify(value, (_key, x) =>
  x && typeof x === 'object' && !Array.isArray(x)
    ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x)
const stableSha = (x: any) => `sha256:${createHash('sha256').update(stable(x)).digest('hex')}`
const save = (name: string, value: any) => {
  const p = resolve(output, name)
  if (existsSync(p)) {
    assert.equal(stable(read(p)), stable(value), `Refusing to overwrite different previous author artifact ${p}`)
    return { path: `${output}/${name}`, sha256: sha(p) }
  }
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n')
  return { path: `${output}/${name}`, sha256: sha(p) }
}
assert.equal(sha(`${K}/${canonicalPath}`), 'sha256:8ee85c5a6e6cc9de4a65cea2583dcfba6764f25f2febdf68162a188d9083d974')
const beforeCanonicalPin = sha(`${K}/${canonicalPath}`)
const landscape = read(`${K}/${canonicalPath}`)
const by = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
const existingMRecords = readFileSync(mReviewPath, 'utf8').trim().split(/\r?\n/).map(x => JSON.parse(x))
const oldProof = read(`${prior}/VERIFY.actual-full82-stock-and39views.before-after.author.json`)
const applicabilityModule = `${K}/app/scripts/applicabilityCompiler.ts`
const discoveryModule = `${K}/app/scripts/memoryCardReviewConfigDiscovery.ts`
const { buildApplicabilityCompilation, getAllJsonFiles } = await import(applicabilityModule)
const { compileCompositionView, collectCompositionProjectionRoleGoalIds, normalizeCompositionView } =
  await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const { applyCompositionViewProjection } = await import(`${K}/app/src/utils/compositionViewRuntime.ts`)
const { convertLearningGoal } = await import(`${K}/app/src/goalTypes.ts`)
const { goalMatchesFilters } = await import(`${K}/app/src/utils/goalFilters.ts`)
const { buildDirectChildrenMap, getRenderedChildIds } = await import(`${K}/app/src/utils/treeProjectionRuntime.ts`)
const { getSrsFilterTags } = await import(`${K}/app/src/utils/srsTags.ts`)

const subjects = [
  { origin: 'ac1bcf34-169c-5339-92ba-efe8c3022560', memory: 'be848fa1-8f52-5099-923f-79b776f07f2f',
    card: 'chem_eq_q3_011', profile: 'GK', files: ['de-he-gk.view.json', 'de-he-sekii-gk.view.json'],
    reason: 'Das vorhandene Ziel erfordert Löslichkeitsgleichgewichte und den Ausdruck des Löslichkeitsprodukts. Die bereits vorhandene enge Einheit ruft nur dessen Grundidee und die stöchiometrischen Exponenten ab; sie ersetzt weder Deutung noch Rechnung. Sie benötigt nur das schon sichtbare fachliche Ursprungsziel.' },
  { origin: 'e62c6c58-b688-59c3-8ac5-2cfc26ac22d7', memory: '50ea4d12-6da8-5a56-a79f-f518e105efd7',
    card: 'chem_eq_q3_010', profile: 'LK', files: ['de-he-lk.view.json', 'de-he-sekii-lk.view.json'],
    reason: 'Das vorhandene LK-Ziel bestimmt Aktivierungsenergien aus Temperaturdaten. Die enge vorhandene Einheit ruft nur Arrhenius-Form und negative Steigungsbeziehung ab; Achsen-/Einheitenprüfung, dimensionsloser Logarithmusbezug und Modellannahmen bleiben Verstehensleistung. Eine GK-Arrheniuspflicht wird nicht ergänzt.' },
]
const drill = readFileSync(`${K}/app/src/components/srs/FlashcardDrill.tsx`, 'utf8')
const fragment = drill.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/)
assert.ok(fragment, 'Actual current SRS filter must be found; do not substitute an authored filter')
const actualPredicate = new Function('card', 'filterTags', `return ${fragment[1]}`)
const deck = read(`${K}/${deckPath}`)
const subjectInputs = subjects.map(s => {
  const memory = by.get(s.memory)
  const record = existingMRecords.find((r: any) => r.goalId === s.origin)
  assert.equal(record.status, 'memory_required')
  assert.ok(record.memoryGoalIds.includes(s.memory), 'No new M judgment or reference needed')
  assert.deepEqual(memory.requires, [s.origin], 'No broader prerequisite acquisition obligation')
  const filters = getSrsFilterTags(memory.tags)
  const cards = deck.cards.filter((card: any) => actualPredicate(card, filters))
  assert.deepEqual(cards.map((card: any) => card.id), [s.card])
  return { ...s, ordinaryGoalWhole: by.get(s.origin), existingMemoryGoalWhole: memory,
    unchangedMemoryDecisionWhole: record, actualFilterTags: filters,
    actualSelectedWholeCards: cards, independentJudgmentGrantedByThisAuthor: false }
})
const operations: any[] = []
const replacements = new Map<string, any>()
for (const s of subjects) for (const file of s.files) {
  const path = `${viewsPath}/${file}`
  const before = read(`${K}/${path}`)
  const after = structuredClone(before)
  assert.equal(before.scope.jurisdiction, 'DE-HE')
  assert.equal(before.scope.courseProfile, s.profile)
  let changed = 0
  const visit = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.kind === 'structure' && node.id === `${before.viewId}-course-matched-q3-recall`) {
        assert.ok(!node.children.some((child: any) => child.goalId === s.memory))
        node.children.push({ kind: 'goalEntry', goalId: s.memory, projectionRole: 'target' })
        changed++
      }
      visit(node.children ?? [])
    }
  }
  visit(after.rootNodes)
  assert.equal(changed, 1)
  const beforeFile = save(`views/${file}.before.exact.json`, before)
  const afterFile = save(`views/${file}.after.author-inactive.json`, after)
  operations.push({ operation: 'replaceWholeViewIfExactBefore', normalPath: path,
    beforeStableWholeViewSha256: stableSha(before), afterStableWholeViewSha256: stableSha(after),
    beforeFile, afterFile, beforeWhole: before, afterWhole: after,
    addedEntry: { kind: 'goalEntry', goalId: s.memory, projectionRole: 'target' }, originGoalId: s.origin,
    reason: s.reason, independentReviewStatus: 'pending', humanApproval: false, humanTrial: false })
  replacements.set(file, after)
}
const maps = getAllJsonFiles(`${K}/curricula/DE/Gymnasium/mapping`)
  .filter((path: string) => read(path).targetLandscapeId === landscape.landscapeId)
assert.equal(maps.length, 82)
const started = performance.now()
const compilation = buildApplicabilityCompilation()
const report = compilation.reports.find((r: any) => r.landscapeId === landscape.landscapeId)
assert.ok(report)
assert.equal(report.findings.filter((f: any) => f.severity === 'error').length, 0)
const app = new Map<string, any>(report.goals.map((g: any) => [g.goalId, g.compiledApplicability]))
for (const s of subjects) assert.ok(app.get(s.memory).jurisdiction.includes('DE-HE'))
// The 39 acquisition views intentionally do not enumerate every national
// ordinary goal. The complete 436 M-origin ledger is the kind universe.
const ordinaryIds = new Set(existingMRecords.map((r: any) => r.goalId))
assert.equal(ordinaryIds.size, 436)
const memoryIds = new Set(landscape.goals.filter((g: any) => g.nodeKind === 'memory' || g.tags?.includes('memorization')).map((g: any) => g.id))
assert.equal(memoryIds.size, 58)
function audit(file: string, viewInput: any) {
  const view = normalizeCompositionView(viewInput)
  const preview = compileCompositionView(view, landscape)
  assert.equal(preview.findings.filter((f: any) => f.severity === 'error').length, 0, file)
  const input = { meta: landscape, goals: landscape.goals.map((g: any) =>
    convertLearningGoal({ ...g, applicability: { ...g.applicability, ...app.get(g.id) } }, { landscapeId: landscape.landscapeId })) }
  const projected = applyCompositionViewProjection([input], view)[0]
  const pby = new Map<string, any>(projected.goals.map((g: any) => [g.id, g]))
  const children = buildDirectChildrenMap(pby)
  const filters = [view.scope.courseProfile, view.scope.jurisdiction].filter(Boolean)
  children.forEach((ids: string[], parent: string) =>
    children.set(parent, ids.filter(id => pby.has(id) && goalMatchesFilters(pby.get(id), filters))))
  const visible = new Set<string>()
  const todo = projected.goals.filter((g: any) => g.tags?.includes('root')).map((g: any) => g.id)
  while (todo.length) {
    const id = todo.pop()!
    if (visible.has(id)) continue
    visible.add(id)
    todo.push(...getRenderedChildIds(id, pby, children))
  }
  const atomic = [...visible].filter(id => by.has(id) && !by.get(id).contains?.length)
  const targets = atomic.filter(id => ordinaryIds.has(id)).sort()
  const memories = atomic.filter(id => memoryIds.has(id)).sort()
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, by)
  const missing = existingMRecords.filter((r: any) => r.status === 'memory_required' && targets.includes(r.goalId) &&
    !r.memoryGoalIds.some((id: string) => memories.includes(id))).map((r: any) => r.goalId).sort()
  const ordinarySupport = [...roles.prerequisiteOnlyGoalIds].filter(id => ordinaryIds.has(id)).sort()
  const memorySupport = [...roles.prerequisiteOnlyGoalIds].filter(id => memoryIds.has(id)).sort()
  return { file, viewId: view.viewId, scope: view.scope, ordinaryTargetIds: targets, memoryTargetIds: memories,
    ordinaryPrerequisiteOnlyIds: ordinarySupport, memoryPrerequisiteOnlyIds: memorySupport,
    actualMissingMemoryGoalIds: missing, compileErrorCount: 0 }
}
const views = readdirSync(`${K}/${viewsPath}`).filter(x => x.endsWith('.json')).sort()
assert.equal(views.length, 39)
const before = views.map(file => audit(file, read(`${K}/${viewsPath}/${file}`)))
const after = views.map(file => audit(file, replacements.get(file) ?? read(`${K}/${viewsPath}/${file}`)))
const comparisons = before.map((b, i) => {
  const a = after[i]
  assert.deepEqual(a.ordinaryTargetIds, b.ordinaryTargetIds, `Ordinary targets changed in ${b.file}`)
  assert.deepEqual(a.ordinaryPrerequisiteOnlyIds, b.ordinaryPrerequisiteOnlyIds)
  assert.deepEqual(a.memoryPrerequisiteOnlyIds, b.memoryPrerequisiteOnlyIds)
  assert.ok(b.memoryTargetIds.every((id: string) => a.memoryTargetIds.includes(id)))
  const added = a.memoryTargetIds.filter((id: string) => !b.memoryTargetIds.includes(id))
  const expected = operations.filter(op => op.normalPath.endsWith(`/${b.file}`)).map(op => op.addedEntry.goalId).sort()
  assert.deepEqual(added, expected, `Unexpected Memory expansion in ${b.file}`)
  return { file: b.file, scope: b.scope, ordinaryTargetsExact: true, ordinarySupportExact: true,
    memorySupportExact: true, noPriorMemoryTargetRemoved: true, addedMemoryTargetIds: added,
    beforeMissingMemoryGoalIds: b.actualMissingMemoryGoalIds, afterMissingMemoryGoalIds: a.actualMissingMemoryGoalIds }
})
assert.equal(before.flatMap(v => v.actualMissingMemoryGoalIds).length, 4)
assert.equal(after.flatMap(v => v.actualMissingMemoryGoalIds).length, 0)
assert.equal(sha(`${K}/${canonicalPath}`), beforeCanonicalPin, 'Source capsule must remain unchanged')
const inputs = [canonicalPath, deckPath, 'app/scripts/applicabilityCompiler.ts',
  'app/scripts/memoryCardReviewConfigDiscovery.ts', 'app/src/utils/srsTags.ts',
  'app/src/components/srs/FlashcardDrill.tsx', 'app/src/utils/authoring/compositionViewAuthoring.ts',
  'app/src/utils/compositionViewRuntime.ts', 'app/src/utils/goalFilters.ts',
  'app/src/utils/treeProjectionRuntime.ts', 'app/src/goalTypes.ts'].map(path => ({ capsulePath: path, sha256: sha(`${K}/${path}`) }))
save('INPUT.exact-existing-goals-cards-M-decisions-and-stock-pins.json', { role: 'Finite AUTHOR input, no new reviewer votes',
  capsule: K, inputs, existingMReview: { path: mReviewPath, sha256: sha(mReviewPath) },
  priorTechnicalProof: { path: `${prior}/VERIFY.actual-full82-stock-and39views.before-after.author.json`,
    sha256: sha(`${prior}/VERIFY.actual-full82-stock-and39views.before-after.author.json`) }, subjectInputs })
save('CAS.four-whole-views-existing-narrow-memory-placement.author-inactive.json', {
  role: 'Inactive additive AUTHOR placements only; independent review pending', baseCanonicalSha256: beforeCanonicalPin,
  operations, changesCanonicalGoalObjects: false, changesOrdinaryTargets: false, changesMemoryDecisions: false,
  changesCards: false, MachineM7Pass: false, HumanApproval: false, HumanTrial: false })
save('CHECK.actual-stock82-compiled-applicability-and39-runtime-views.author.json', {
  role: 'Actual unchanged stock applicability and composition/runtime helpers. AUTHOR diagnostic, no independent approval.',
  checkedAt: new Date().toISOString(), capsuleCanonicalSha256: beforeCanonicalPin,
  fullChemistryMappingInputCount: maps.length, inputModulePins: inputs, actualStockElapsedSeconds: (performance.now() - started) / 1000,
  chemistryStockErrorCount: 0, mappingPins: maps.sort().map((path: string) => ({ path: path.slice(K.length + 1), sha256: sha(path) })),
  relevantCompiledApplicability: report.goals.filter((g: any) => subjects.some(s => [s.origin, s.memory].includes(g.goalId))),
  wholeGoals: landscape.goals.length, ordinaryGoalCount: ordinaryIds.size, memoryGoalCount: memoryIds.size,
  actualRuntimeCardPredicate: fragment[1], before, after, comparisons,
  beforeActualMissingMemoryBindings: 4, afterActualMissingMemoryBindings: 0,
  unchangedAll39OrdinaryTargets: true, unchangedAll39OrdinaryPrerequisiteOnly: true,
  unchangedAll39MemoryPrerequisiteOnly: true, noMemoryTargetsRemoved: true,
  newCards: 0, newCanonicalGoals: 0, sourceCapsuleUnchanged: true,
  unresolvedRawCourseFilterFalsePositives: 'Separate QA-code issue owned by another agent; this package makes no full stock M pass claim.',
  MachineM7Pass: false, HumanApproval: false, HumanTrial: false })
console.log(JSON.stringify({ output, canonicalUnchanged: beforeCanonicalPin, maps: 82, views: 39,
  actualMemoryHolesBefore: 4, actualMemoryHolesAfter: 0, viewOperations: 4, newCards: 0, ordinaryTargetsUnchanged: true }))
