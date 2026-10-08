import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = process.cwd()
const output = 'curricula/DE/Gymnasium/quality/goal-description-review/wirtschaftswissenschaften/2026-10-08/m7-bootstrap-v1'
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const atomicityPath = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-economics-full.review.jsonl'
const memoryPath = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-economics-full.review.jsonl'
const cardsPath = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-economics-full.cards.review.jsonl'
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const landscape = JSON.parse(readFileSync(resolve(root, landscapePath), 'utf8'))
const atomicIds = new Set(readFileSync(resolve(root, atomicityPath), 'utf8').trim().split('\n').map((line) => JSON.parse(line).goalId))
const rootId = '96183c48-b499-54d7-8530-578f6ff40207'
const memoryBundleId = 'de_gymnasium_economics_memory_cards'
const orientationId = '6bf2d1cc-e745-50dd-a617-71c06a6c6945'
const assessmentClusterIds = new Set([
  '14c05eec-87af-5fd6-832a-4f5d9d280e66', '1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc',
  'a1c0e891-cb5b-56ef-9aa7-ac782e2099c3', '0fb8833c-4017-5052-819a-ecb5f6ebb36f',
  '5113c64b-405d-5f4b-bae9-70fe530b5e69', 'd7f40fca-bdde-5a07-9c37-c892c2588177',
  'a068e975-4dae-56ba-b510-f26532d6de0b',
])
const areaIds = new Set([
  '464e91ba-1aa4-56d1-bc00-818b5673a163', 'f14dcf9f-66c5-5907-9e06-08f59a9a0e13',
  '968172f6-cd1c-5733-ba76-aa59817735eb', 'e6889216-722e-57a8-beba-a389fddd59e2',
  '78e1c6b3-06c1-54b6-ae94-a61ab598bf4a', 'f72eef5b-97dc-52b2-8879-838a7c6600be',
  '3dd3102b-ce1f-5d7d-a766-496deddedaec', '849bcfc8-5133-51fe-88de-e3c690ba0826',
  'e547677e-17ec-5b89-9ff6-28e36ac64c1f', '27c157f8-a357-5cec-b054-efd3c65a1fe7',
  'fa43671d-393b-5663-a7e6-cceed3f466f7', 'a073b7ae-687a-5b46-8d81-713bc61f573b',
  'a8e25ae5-2b21-5974-9008-f775baa0e47e', '6f428330-81ad-56f9-a998-521eea7a216d',
  '067ee96c-97ae-5576-9f61-27a022914f87', '72920fcb-4afb-5ba4-88c1-b1c8af2f9ca5',
  '47e3e4b9-d5df-51cc-ba14-8ed9ecf70d70', '3e0d8fbc-f383-5505-a30e-7c4f125342bb',
  '40f72858-337d-5f96-973d-e8041c112b12', 'e6de0097-f2fb-5063-9eb2-af91a5aa44b0',
  'a08fcb48-f38d-5acc-b8c1-1502daaada7e', 'd0ad0bbf-93ab-52f4-adda-9bb4e3571928',
  '42b3f1db-023f-50ac-8a15-76619b8c0866', '169c87f8-536c-50f6-86d7-ef4567706cec',
  '9d4ca8c5-9190-5698-8e95-8a9b4e7ea5d6', '3489941f-3f99-5c7c-8bc7-b5228fbe5e76',
  '4413d3b1-be94-5675-88b1-8993d1984bab', '40a49531-6fdd-5e91-8473-84c4577b2e54',
])
const counts = { curricularAtomic: 0, curricularArea: 0, practiceAssessment: 0, programStructure: 0, memory: 0, runtimeSupport: 0, orientation: 0, total: landscape.goals.length }
const basisByKind = {
  curricularAtomic: 'reviewed-current-pilot-curricular-atomic', curricularArea: 'reviewed-current-pilot-curricular-area',
  practiceAssessment: 'reviewed-current-pilot-practice-assessment', programStructure: 'reviewed-current-pilot-program-structure',
  memory: 'reviewed-current-pilot-memory', runtimeSupport: 'reviewed-current-pilot-runtime-support', orientation: 'reviewed-current-pilot-orientation',
}
const nonContentInspection = []
const decisions = landscape.goals.map((goal) => {
  let semanticKind
  let reason
  if (atomicIds.has(goal.id)) {
    if (goal.contains?.length || goal.examData || goal.nodeKind === 'memory') throw new Error(`Existing atomic ID is not ordinary content: ${goal.id}`)
    semanticKind = 'curricularAtomic'
    reason = 'Current ordinary content leaf already covered by the unchanged current A and M ledgers; type classification creates no additional fachliche review.'
  } else if (goal.id === rootId) {
    semanticKind = 'programStructure'
    reason = 'Canonical landscape root organizes all branches; it is not an independently assessable competency.'
  } else if (goal.id === memoryBundleId) {
    semanticKind = 'runtimeSupport'
    reason = 'Navigation bundle for five independently traced SRS decks; the bundle neither tests recall nor states an ordinary content competence.'
  } else if (goal.id === orientationId) {
    semanticKind = 'orientation'
    reason = 'Explicit motivation/orientation anchor without subject assessment; separate orientation completion rules apply.'
  } else if (goal.nodeKind === 'memory') {
    if (goal.contains?.length || !goal.tags.some((tag) => tag.startsWith('srs-deck:'))) throw new Error(`Invalid memory leaf: ${goal.id}`)
    semanticKind = 'memory'
    reason = 'Named SRS deck leaf, memorization tagged, already traced through required goals and kept cards in the current M ledger.'
  } else if (goal.examData || assessmentClusterIds.has(goal.id)) {
    semanticKind = 'practiceAssessment'
    reason = goal.examData
      ? 'Complete assessment attempt/Abitur proposal with examData; learner work is graded as a whole and this is outside ordinary-content atomicity.'
      : 'Explicit phase-local practice or Abitur navigation cluster containing assessment attempts, not an ordinary content learning goal.'
  } else if (areaIds.has(goal.id)) {
    if (!goal.contains?.length) throw new Error(`Area is not an aggregation: ${goal.id}`)
    semanticKind = 'curricularArea'
    reason = 'Topic-bearing fachliche aggregation of ordinary competencies; phase in the title is compatibility metadata, not a distinct assessable atom. The Berufs-/Studienorientierung area teaches a substantive decision process and is not the motivation anchor.'
  } else throw new Error(`Uninspected remaining goal: ${goal.id}`)
  counts[semanticKind] += 1
  if (!atomicIds.has(goal.id)) nonContentInspection.push({ goalId: goal.id, title: goal.title, semanticKind, reason, childGoalIds: goal.contains ?? [], hasExamData: Boolean(goal.examData) })
  return { goalId: goal.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(goal), semanticKind, decisionStatus: 'authoritative', decisionBasis: basisByKind[semanticKind] }
}).sort((a, b) => a.goalId.localeCompare(b.goalId))
if (counts.curricularAtomic !== 303 || counts.curricularArea !== 28 || counts.practiceAssessment !== 31 || counts.programStructure !== 1 || counts.memory !== 5 || counts.runtimeSupport !== 1 || counts.orientation !== 1 || nonContentInspection.length !== 67) throw new Error(`Unexpected classification ${JSON.stringify(counts)}`)
const write = (relativePath, value) => {
  const absolutePath = resolve(root, relativePath); mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' })
}
write(`${output}/wirtschaftswissenschaften.semantic-kinds.json`, {
  $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/curriculum-ontology-profile.schema.json',
  documentType: 'semantic-kind-ledger', ledgerFormatVersion: 1,
  ledgerId: 'de-gymnasium-wirtschaftswissenschaften-semantic-kinds-author-20261008-v1',
  profileId: 'de-gymnasium-wirtschaftswissenschaften-semantic-kinds-author-20261008-v1', profileVersion: '1.0.0',
  sourceLandscapeId: landscape.landscapeId, sourceLandscapePath: landscapePath,
  sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1', reviewMethod: 'one-time-reviewed-pilot-migration-v1', counts, decisions,
})
write(`${output}/node-type-author-inspection.receipt.json`, {
  schemaVersion: 1, purpose: 'native-review-goal-book-node-type-classification', status: 'author_candidate', date: '2026-10-08',
  author: 'OpenAI Codex economics_visual_memory_audit', humanApprovalClaimed: false, independentReviewClaimed: false,
  scope: 'Complete current node types only. The authoritative token is the native book-ledger node-type contract inside this isolated candidate; it grants no description, positive-understanding, visualization, source-coverage, maturity, human approval or live adoption.',
  canonicalBytesChanged: false, runtimeSemanticsChanged: false, existingAtomicityAndMemoryLedgersChanged: false,
  sourceBindings: [landscapePath, atomicityPath, memoryPath, cardsPath].map((path) => ({ path, sha256: `sha256:${createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')}` })),
  counts, nonContentInspection,
})
write(`${output}/review-full-canonical.view.json`, {
  viewId: 'de-gym-wirtschaftswissenschaften-m7-full-canonical-review-20261008-v1', landscapeId: landscape.landscapeId,
  scope: { schoolForm: 'Gymnasium', stage: 'CrossStage' }, rootNodes: [{ kind: 'structure', id: 'wirtschaftswissenschaften-m7-review-root', label: 'Wirtschaftswissenschaften – kanonische M7-Prüfsicht', children: [{ kind: 'canonicalSubtree', goalId: rootId }] }],
})
write(`${output}/visualization-input.empty.json`, { schemaVersion: 1, subject: 'wirtschaftswissenschaften', source: { canonicalRoot: 'curricula/DE/Gymnasium/canonical', publicAssetRoot: 'app/public/assets/goal-visualizations' }, records: [] })
write(`${output}/review-book-full.config.json`, {
  schemaVersion: 1, bookId: 'de-gym-wirtschaftswissenschaften-m7-full-canonical-review-20261008-v1',
  title: 'Lernziel-Review Wirtschaftswissenschaften – aktueller kanonischer Gesamtumfang', landscapePath,
  compositionViewPath: `${output}/review-full-canonical.view.json`, semanticKindLedgerPath: `${output}/wirtschaftswissenschaften.semantic-kinds.json`,
  goalVisualizationQaPath: `${output}/visualization-input.empty.json`, publicationMode: 'review', atlasBaseUrl: 'https://skillpilot.com/lernzielbuch', evidenceReviewPaths: [],
  outputPath: `${output}/native/full-current303.book-model.json`,
})
const firstCluster = landscape.goals.find((goal) => goal.id === '464e91ba-1aa4-56d1-bc00-818b5673a163')
const firstIds = [...firstCluster.contains]
if (firstIds.length !== 17 || firstIds.some((id) => !atomicIds.has(id))) throw new Error('E1 complete coherent package changed')
write(`${output}/batch-001-e1-social-change-current17.config.json`, {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json', schemaVersion: 1,
  batchId: 'wirtschaftswissenschaften-b001-e1-social-change-current17-author-20261008-v1', subject: 'wirtschaftswissenschaften', subjectLabel: 'Wirtschaftswissenschaften',
  bookId: 'de-gym-wirtschaftswissenschaften-b001-e1-social-change-current17-20261008-v1', title: 'Wirtschaftswissenschaften B001 – Gesellschaftlicher Wandel (E1)',
  baseGoalBookConfigPath: `${output}/review-book-full.config.json`, goalIds: firstIds,
  outputDirectory: `${output}/native/batch-001-e1-social-change-current17`, feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback',
  promptPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
  criteriaPath: `${output}/economics-review-criteria-v1.md`, printDerivativeProfile: 'bounded-atlas',
})
console.log(JSON.stringify({ output, counts, firstBatchCount: firstIds.length }, null, 2))
