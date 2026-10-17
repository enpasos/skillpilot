import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from '../../../app/scripts/goalBookModel.ts'
import { collectCompositionProjectionRoleGoalIds as roles } from '../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { convertLearningGoal } from '../../../app/src/goalTypes.ts'
import { goalMatchesFilters } from '../../../app/src/utils/goalFilters.ts'

const root = resolve('.')
const tmp = resolve(root, 'tmp/chemie-m7-resumed-20261016')
const out = resolve(tmp, 'root-fuel-comparison-prior-author-v1')
const capsule = resolve(tmp, 'chemie-shared640-recycling-native-author-capsule-L6-v1')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex')
const pin = (p: string) => ({ path: relative(root, p), sha256: sha(p) })
const write = (name: string, value: unknown) => {
  const path = resolve(out, name)
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
  return pin(path)
}
const oldSha = sha(resolve(capsule, canonicalPath))
assert.equal(oldSha, 'sha256:67174768b375fffa851e4fa23b27d64065aadd7fa7641734896fffe39451ea36')
const canonical = read(resolve(capsule, canonicalPath))
const by = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const id = '0cf2ffe1-a988-5ffb-ab37-0ac7d58b23dd'
const broad = 'ecce0306-13dc-5563-a097-afe69805a8d6'
const narrow = 'b759d50d-0e82-5b10-89a2-fe5271106e50'
const firstLaw = '4928d5d1-e790-5883-9349-3b03a1c63b99'
const before = by.get(id)
assert.deepEqual(before.requires, [broad, firstLaw])
const after = structuredClone(before)
after.requires = [narrow, firstLaw]
const pPath = resolve(capsule, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current438-HE-BY-reviewed-P6-private-L6-technical-20261016-v1/P438.selected-whole-current-records.for-native-model.jsonl')
const selected = readFileSync(pPath, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse)
  .filter((row: any) => [id, broad, narrow, firstLaw].includes(row.goalId))
assert.equal(selected.length, 4)
const fullCasePath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json')
const fullCases = read(fullCasePath).cases.filter((row: any) => row.goalId === id)
assert.deepEqual(fullCases.map((c: any) => c.id), ['energy20-10-a', 'energy20-10-b'])
const input = write('INPUT.four-whole-goals-current-P-and-two-full-comparison-cases.json', {
  role: 'Whole actual frozen inputs; prior reviewer metadata remains history, not this author vote',
  canonical: pin(resolve(capsule, canonicalPath)),
  wholeGoals: [id, broad, narrow, firstLaw].map((key) => by.get(key)),
  wholeCurrentProfiles: selected, fullCasesSource: pin(fullCasePath), fullCases,
})
const science = write('AUTHOR.science-before-mechanics.frozen.json', {
  role: 'Informed root AUTHOR proposal; not an independent or blind description vote',
  createdAtUTC: new Date().toISOString(), input,
  actualWholeInputReading: 'Root read the complete four goal definitions, full comparison/current fuel-cell profiles and complete DE/EN comparison materials, worked reasoning, transfers and observable rubrics. Historical ecce/BY absence finding informed this bounded author work.',
  finding: 'The comparative goal and its two complete cases need an H2/O2 fuel-cell conversion principle plus system-boundary energy accounting. They never require the separate acid-versus-alkaline comparison or carbonate operating hypothesis assessed by the whole ecce profile.',
  proposedCorrection: 'Use existing b759 (H2/O2 electrode reactions, external electrons, internal proton route, stored carrier versus converter) instead of the broader ecce as the universal direct acquisition prerequisite. Retain existing4928 unchanged. Retain ecce itself, its whole profiles, all source cells and all existing placements unchanged.',
  actualCaseA: { output: '1 kWh electricity', FCInputHydrogenKWh: 1 / 0.5,
    FCUpstreamElectricityKWh: (1 / 0.5) / 0.7, FCUpstreamKgCO2e: ((1 / 0.5) / 0.7) * 0.4,
    gasKgCO2e: (1 / 0.55) * 0.2 + 0.05,
    variedFCUpstreamKgCO2e: ((1 / 0.5) / 0.7) * 0.03,
    judgement: 'Given supply mix reverses carbon ranking without establishing economic/social ranking; outer electron work differs from the heat-work route. No acid/alkaline distinction is needed.' },
  actualCaseB: { winterFC: (5 + 2) / 10, winterCombustion: (3 + 2) / 10,
    summerFC: 5 / 10, summerCombustion: 3 / 10,
    judgement: 'Count used heat, not nominal surplus. Costs and maintenance remain competing criteria; upstream carbon is absent. Heat-network transfer needs an explicit equal-service boundary. No acid/alkaline distinction is needed.' },
  sourceBoundary: 'The already captured official BY C12 elevated primary text states the multiperspective comparison and fuel cell/combustion energy conversion. No new source mapping, acid/alkaline full-coverage claim or new course target is created.',
  noTaskSolutionRubricDescriptionOrAssetChange: true,
  noIndependentD_P_A_M_VVote: true, HumanApproval: false, M7Claim: false,
})
const cas = write('CAS.one-whole-comparison-goal.narrow-actual-acquisition.AUTHOR.inactive.json', {
  role: 'Inactive whole goal CAS; science approval and affected current bindings required',
  sourceCanonical: canonicalPath, beforeCanonical: oldSha,
  operations: [{ goalId: id, before, after }],
  allOther639GoalsUnchanged: true,
  broadGoalSourceAndPAndPlacementsUnchanged: true,
})
const semPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const sem = read(resolve(capsule, semPath))
const oldDecision = sem.decisions.find((r: any) => r.goalId === id)
assert.equal(oldDecision.sourceFingerprint, fingerprintSemanticKindSourceGoal(before))
const semCAS = write('CAS.one-semantic-source-binding.technical-only.json', {
  role: 'Mechanical source-binding proposal only; no new semantic classification vote', sourceLedgerPath: semPath,
  operations: [{ goalId: id, before: oldDecision,
    after: { ...oldDecision, sourceFingerprint: fingerprintSemanticKindSourceGoal(after) } }],
})
const contexts: unknown[] = []
for (const filename of readdirSync(resolve(capsule, 'curricula/DE/Gymnasium/composition-views/chemie'))) {
  if (!filename.endsWith('.json')) continue
  const viewPath = `curricula/DE/Gymnasium/composition-views/chemie/${filename}`
  const view = read(resolve(capsule, viewPath))
  const projection = roles(view.rootNodes, by)
  const target = (key: string) => projection.targetGoalIds.has(key)
    && goalMatchesFilters(convertLearningGoal(by.get(key), { landscapeId: canonical.landscapeId }), [view.scope.courseProfile])
  if (!target(id)) continue
  const role = target(narrow) ? 'target' : projection.prerequisiteOnlyGoalIds.has(narrow) ? 'prerequisiteOnly' : 'missing'
  contexts.push({ viewPath, scope: view.scope, narrowPriorRole: role,
    broadPriorTarget: target(broad), broadPriorSupport: projection.prerequisiteOnlyGoalIds.has(broad) })
  assert.notEqual(role, 'missing', `Actual narrower acquisition missing in ${filename}`)
}
assert.equal(contexts.length, 25)
const edges = new Map(canonical.goals.map((g: any) => [g.id, g.id === id ? after.requires : g.requires ?? []]))
const visiting = new Set<string>(), done = new Set<string>()
const visit = (key: string) => {
  assert(!visiting.has(key), `Cycle ${key}`)
  if (done.has(key)) return
  visiting.add(key)
  for (const prior of (edges.get(key) as string[] ?? [])) if (edges.has(prior)) visit(prior)
  visiting.delete(key); done.add(key)
}
for (const key of edges.keys()) visit(key as string)
assert.equal(sha(resolve(capsule, canonicalPath)), oldSha)
const checks = write('CHECK.actual25-existing-acquisition-roles-and-DAG.readonly.json', {
  actualContexts: contexts, newMissingPriorContexts: 0, requiresCycleCount: 0,
  allDescriptionsProfilesCasesImagesCardsAndViewFilesUnchanged: true,
  normalWrites: 0, capsuleWrites: 0, fullTransitiveCourseClearance: false,
})
const selector = write('OUTPUTS.one-whole-fuel-comparison-prior.AUTHOR.selector.json', {
  role: 'Finite inactive author proposal for independent whole-context review',
  input, science, wholeGoalCAS: cas, semanticSourceCAS: semCAS, boundedActualChecks: checks,
  newOrdinaryGoals: 0, newStrictClosures: 0, actualIndependentVotes: 0,
  PCurrentContextFollowupRequired: true, DCurrentContextFollowupRequired: true,
  normalWrites: 0, capsuleWrites: 0, HumanApproval: false, M7Claim: false,
})
console.log(JSON.stringify(selector))
