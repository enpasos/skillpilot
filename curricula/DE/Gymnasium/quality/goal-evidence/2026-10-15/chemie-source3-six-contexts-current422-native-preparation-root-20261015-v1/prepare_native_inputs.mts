// SPDX-License-Identifier: Apache-2.0
// Native preparation only. The explicit semantic-kind classifications below
// classify the source author's whole objects, not their D/P/A/M/V completion.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const repo = path.resolve(process.cwd(), '..')
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-preparation-root-20261015-v1'
const e14 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/'
const e15 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
const author = e15 + 'chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/'
const oldNative = e15 + 'chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1/'
const base = e14 + 'chemie-acid7-two-description-one-image-current419-native-successor-technical-20261014-v3/candidate/'
const old422 = e14 + 'chemie-source-three-goals-materials-and-images-review-selector-root-20261014-v1/candidate/'
const load = (p: string) => JSON.parse(readFileSync(path.join(repo, p), 'utf8'))
const digest = (b: Buffer) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const binding = (p: string) => { const b = readFileSync(path.join(repo, p)); return { path: p, sha256: digest(b), bytes: b.length } }
const save = (p: string, data: unknown) => {
  const dest = path.join(repo, own, p)
  mkdirSync(path.dirname(dest), { recursive: true })
  writeFileSync(dest, JSON.stringify(data, null, 2) + '\n')
  assert.deepEqual(JSON.parse(readFileSync(dest, 'utf8')), data)
}
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(path.join(repo, 'app/scripts/goalBookModel.ts')).href)
const oldCanonicalPath = base + 'canonical551.current419.three-author-deltas.exact.json'
const oldKindPath = base + 'semantic551.current419.only-two-kind-source-bindings.stock-helper.json'
const oldCanonical = load(oldCanonicalPath)
const canonical = load(old422 + 'canonical554.prospective422.three-source-goals-plus-current-acid-deltas.inactive.json')
const three = load(author + 'candidate/three-whole-goals.bounded-author.json')
const threeIds = three.map((g: any) => g.id)
assert.equal(new Set(threeIds).size, 3)
for (const goal of three) {
  assert.equal(goal.type, 'atomic')
  assert.deepEqual(goal.contains, [])
  const index = canonical.goals.findIndex((g: any) => g.id === goal.id)
  assert.ok(index >= 0)
  canonical.goals[index] = goal
}
const goals = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const parentId = 'd11fc507-4fae-5f2f-bd84-c3dbc9c43daf'
assert.equal(goals.size, 554)
for (const goal of oldCanonical.goals) {
  if (goal.id !== parentId) assert.deepEqual(goals.get(goal.id), goal)
}
assert.equal(goals.get(parentId).type, 'cluster')
assert.deepEqual(goals.get(parentId).contains, [...oldCanonical.goals.find((g: any) => g.id === parentId).contains, ...threeIds])
save('candidate/canonical554.prospective422.exact-author-successor.json', canonical)

const kindRationales: Record<string, string> = {
  [threeIds[0]]: 'Ordinary assessable chemistry content: explain isolation using substance properties and distinguish extract, enrichment and unchanged active molecules. This is not personal orientation, recall training, a programme unit, or a terminal practice/examination goal. The separate atomicity, source, practical/acquisition and evidence decisions remain open.',
  [threeIds[1]]: 'Ordinary assessable chemistry content: explain the relationship of analysis, synthesis and molecular modelling and their limits in active-ingredient research. A supplied research case is an assessment context for the enduring competence, not a programme or examination node. This classification does not decide atomicity or the unresolved prerequisite/acquisition and source holds.',
  [threeIds[2]]: 'Ordinary assessable chemistry content: explain application-oriented dye research across historical, present and prospective perspectives using chemical evidence. Future research questions are content to justify, not a personal motivation/orientation flow or terminal exam. Source-choice and course holds remain separate.',
  [parentId]: 'The existing multi-source, mixed-stage supplement collection remains programStructure, as in the reviewed base ledger. Its title and description organize explicitly identified source obligations rather than define one homogeneous chemistry area. Its children now include the three proposed ordinary goals. This retained structural classification gives no source, course or D/P/A/M/V approval to any child.',
}
const ledger = load(oldKindPath)
const oldRows = new Map<string, any>(ledger.decisions.map((r: any) => [r.goalId, r]))
const classifications: any[] = []
for (const id of [...threeIds, parentId]) {
  const semanticKind = id === parentId ? oldRows.get(id).semanticKind : 'curricularAtomic'
  const row = { goalId: id, sourceFingerprint: fingerprintSemanticKindSourceGoal(goals.get(id)), semanticKind, decisionStatus: 'authoritative', decisionBasis: id === parentId ? oldRows.get(id).decisionBasis : 'reviewed-current-pilot-curricular-atomic' }
  if (oldRows.has(id)) ledger.decisions[ledger.decisions.findIndex((r: any) => r.goalId === id)] = row
  else ledger.decisions.push(row)
  classifications.push({ goalId: id, wholeGoal: goals.get(id), semanticKind, rationale: kindRationales[id], sourceFingerprint: row.sourceFingerprint })
}
ledger.ledgerId = 'chemie-source3-current422-native-scope-classifications-root-20261015-v1'
ledger.counts.curricularAtomic = 422
ledger.counts.total = 554
for (const row of ledger.decisions) assert.equal(row.sourceFingerprint, fingerprintSemanticKindSourceGoal(goals.get(row.goalId)))
assert.equal(ledger.decisions.length, 554)
save('candidate/semantic554.prospective422.classifications.json', ledger)
save('SCOPE.explicit-three-kind-classifications-and-retained-parent.json', {
  schemaVersion: 1, role: 'Root semantic-kind classification author; not independent D/P/A/M/V reviewer',
  sourceWholeAuthorObjects: binding(author + 'candidate/three-whole-goals.bounded-author.json'),
  priorWholeCanonical: binding(oldCanonicalPath), priorKindLedger: binding(oldKindPath),
  classifications, ordinaryCompetenceClassificationsAdded: 3, existingStructureClassificationRetainedAfterOwnWholeObjectReview: 1,
  authoritativeScope: 'Isolated prospective native preparation only; no active registry or current denominator change.',
  scientificGateApprovals: 0, newStrictClosures: 0, humanApproval: false, humanTrial: false,
})

const map = load(oldNative + 'checks/REBUILD.current419-sparse-native-ten.physical-map.actual.json')
const qaPath = map.aliases.find((a: any) => a.normalHostAlias === 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json').physicalRepositorySource.path
const qa = load(qaPath)
const imageRows = load(author + 'IMAGES.exact-KEEP.references.json').rows
for (const goal of three) {
  const img = imageRows.find((r: any) => r.goalId === goal.id).exactAsset
  assert.deepEqual(binding(img.path), img)
  const imageUrl = goal.resourceLinks.find((r: any) => r.type === 'goal-visualization').url
  assert.ok(!qa.records.some((r: any) => r.goalId === goal.id))
  qa.records.push({ goalId: goal.id, title: goal.title, description: goal.description, subject: 'chemie', landscapeId: canonical.landscapeId,
    landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
    visualizationState: 'available', imageUrl, assetSha256: img.sha256,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/chemie/' + goal.id + '/' + goal.id + '.png',
    publicAssetPath: 'app/public' + imageUrl, humanApproved: 'no', humanIssueIdentified: 'no', aiApproved: 'no',
    aiNotes: 'Native-review image availability only. No new visualization approval, independent decision or human evidence is created here.' })
}
save('candidate/QA438.existing435-plus-three-unapproved-image-bindings.json', qa)
const affected = load(author + 'CHECK.context-union.actual.json').currentB07ToRemediated422
const pending = new Set<string>([...affected.map((r: any) => r.goalId), ...threeIds])
const ids: string[] = []
while (pending.size) {
  const ready = [...pending].find((id) => goals.get(id).requires.every((required: string) => !pending.has(required)))
  assert.ok(ready, 'Selected review goals contain a prerequisite cycle')
  pending.delete(ready)
  ids.push(ready)
}
assert.equal(new Set(ids).size, 9)
for (const row of map.selectedCurrentAssetRows) row.publicMustBePhysicalWithinHostPublicRoot = ids.includes(row.goalId)
for (const goal of three) {
  const img = imageRows.find((r: any) => r.goalId === goal.id).exactAsset
  map.selectedCurrentAssetRows.push({ goalId: goal.id, physicalRepositorySource: img,
    normalCanonicalDestination: 'curricula/DE/Gymnasium/visualizations/chemie/' + goal.id + '/' + goal.id + '.png',
    normalPublicDestination: 'app/public/assets/goal-visualizations/chemie/' + goal.id + '/' + goal.id + '.png',
    publicMustBePhysicalWithinHostPublicRoot: true, publicMaterialization: 'selected review input, physical public leaf' })
}
const overrides: Record<string, string> = {
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json': own + '/candidate/canonical554.prospective422.exact-author-successor.json',
  'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json': own + '/candidate/semantic554.prospective422.classifications.json',
  'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json': own + '/candidate/QA438.existing435-plus-three-unapproved-image-bindings.json',
}
for (const alias of map.aliases) if (overrides[alias.normalHostAlias]) alias.physicalRepositorySource = binding(overrides[alias.normalHostAlias])
map.role = 'Physical sparse reconstruction for three proposed source goals and six affected current contexts; no new gate science'
map.executionHost = 'tmp/chemie-m7-resumed-20261015/source3-six-native-host'
map.physicalPublicSelectedCount = map.selectedCurrentAssetRows.filter((r: any) => r.publicMustBePhysicalWithinHostPublicRoot).length
map.physicalPublicSelectedBytes = map.selectedCurrentAssetRows.filter((r: any) => r.publicMustBePhysicalWithinHostPublicRoot).reduce((n: number, r: any) => n + r.physicalRepositorySource.bytes, 0)
map.unselectedPublicLeaves = map.selectedCurrentAssetRows.length - map.physicalPublicSelectedCount
map.normalStockCommands = []
assert.equal(map.physicalPublicSelectedCount, 9)
save('checks/REBUILD.prospective422-nine.physical-map.json', map)
const fullBase = load(oldNative + 'config/whole419.current-normal.stock-base.config.json')
fullBase.bookId = 'chemie-source3-six-contexts-prospective422-full-base-20261015-v1'
fullBase.title = 'Chemie – prospektiver Gesamtgraph für drei Quellenziele und sechs betroffene Kontexte'
fullBase.outputPath = own + '/not-built-full-book-model.json'
save('config/full422.stock-base.config.json', fullBase)
const batch = load(oldNative + 'config/native10.current419.normal-prepare-only.config.json')
batch.batchId = 'chemie-source3-six-contexts-current422-native-20261015-v1'
batch.bookId = batch.batchId
batch.title = 'Chemie – drei prospektive Quellenziele und sechs gezielte Kontextprüfungen'
batch.baseGoalBookConfigPath = own + '/config/full422.stock-base.config.json'
batch.goalIds = ids
batch.outputDirectory = own + '/native-nine'
save('config/native9.normal-prepare-only.config.json', batch)
save('checks/INPUT.preparation-delta-and-gate-boundaries.json', {
  schemaVersion: 1, oldCurrentCanonical: binding(oldCanonicalPath), authorSuccessor: binding(author + 'candidate/three-whole-goals.bounded-author.json'),
  targetGoalIds: ids, newGoalIds: threeIds, affectedExistingContextIds: affected.map((r: any) => r.goalId),
  oldExistingWholeBodyChanges: [parentId], newGoalCount: 3, proposedCurricularAtomic: 422,
  scientificGateApprovals: 0, currentActiveGoalCountChanged: false, strictGain: 0,
  canonicalContentAuthor: 'Separate sealed source3 author packet; root only transports its exact whole objects and previously proposed parent insertion.',
  newKindClassifications: 'Explicit separately documented root classifications; no A/D/P/M/V approval.',
  newImageBindings: 'Three unapproved review candidates; valid preexisting image approvals remain exact.',
  sourceCourseAcquisitionHoldsRemainOpen: true, nativeCampaignsMustRemainEmptyUntilIndependentReview: true,
})
console.log(JSON.stringify({ wholeObjects: goals.size, prospectiveCurricularAtomic: 422, selectedNativePages: ids.length, physicalPublicLeaves: map.physicalPublicSelectedCount, gateApprovals: 0 }))
