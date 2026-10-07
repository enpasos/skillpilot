import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { isGoalVisualizationAiApproved, normalizeGoalVisualizationAiReview } from '../../../../../../../app/scripts/goalVisualizationQaModel.ts'
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-coordinate-visual-independent-b-v4/'
const patch = JSON.parse(await readFile(base + 'candidate-native-ai-review-field-patch.independent-b.json', 'utf8'))
const record = patch.records[0]
assert.equal(isGoalVisualizationAiApproved(record), true)
assert.deepEqual(normalizeGoalVisualizationAiReview(record, record.assetSha256), Object.fromEntries(Object.entries(record).filter(([key]) => key.startsWith('ai'))))
const oldHash = 'sha256:a94e7c616bf690af967da9eafa375eb4b66d79eef0f1e090c41a3511cc19a481'
assert.equal(isGoalVisualizationAiApproved({...record, assetSha256: oldHash}), false)
assert.equal(normalizeGoalVisualizationAiReview(record, oldHash).aiApproved, 'no')
await writeFile(base + 'existing-native-v-field-check.actual.independent-b.json', JSON.stringify({schemaVersion: 1, role: 'Existing unmodified native V hash/field validation; supplementary to actual independent scientific view', exactInspectedCandidateAccepted: true, currentOldActiveAssetCorrectlyNotApprovedByNewCandidateFields: true, normalizeWrongHashResetsAiApproval: true, humanFieldsChanged: false, currentActiveVApprovalChanged: false, activeWrites: false}, null, 2) + '\n')
console.log('Existing native V candidate field/hash checks PASS; old current hash remains separate')
