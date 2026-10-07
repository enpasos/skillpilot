// Apache-2.0. Reuse exact reviewed P content and measure the actual changed inputs.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-orbital-nano-targeted-author-v3'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v2'
const load = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const write = (name: string, value: unknown) => writeFileSync(resolve(root, own, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
const model = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const positive = await import(pathToFileURL(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const canonPath = own + '/canonical.targeted-final-complete-alttext.candidate.json'
const canonical = load(canonPath)
const goals = new Map(canonical.goals.map((g: any) => [g.id, g]))
const kinds = load(own + '/semantic-kinds.targeted-final-native-bindings.candidate.json')
for (const row of kinds.decisions) assert.equal(row.sourceFingerprint, model.fingerprintSemanticKindSourceGoal(goals.get(row.goalId)))
const kindById = new Map(kinds.decisions.map((r: any) => [r.goalId, r.semanticKind]))
const oldRecords = readFileSync(resolve(root, author, 'positive-evidence.twenty-five.final-native-author-candidates.review.jsonl'), 'utf8').trim().split('\n').map((line: string) => JSON.parse(line))
const records = structuredClone(oldRecords)
const goalChanged: string[] = [], inputChanged: string[] = []
for (const row of records) {
  const goal: any = goals.get(row.goalId)
  const digests = Object.fromEntries((goal.resourceLinks ?? []).filter((l: any) => l.type === 'goal-visualization').map((l: any) => [l.url, 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, 'app/public', l.url.slice(1)))).digest('hex')]))
  const fp = positive.fingerprintGoalForPositiveEvidence(goal, kindById.get(row.goalId))
  const input = positive.fingerprintPositiveGoalEvidenceReviewInput(goal, row.reviewCriteriaFingerprint, digests, kindById.get(row.goalId))
  if (row.goalFingerprint !== fp) goalChanged.push(row.goalId)
  if (row.reviewInputFingerprint !== input) inputChanged.push(row.goalId)
  assert.equal(row.profileFingerprint, positive.fingerprintPositiveGoalEvidenceProfile(row.profile))
  row.goalFingerprint = fp; row.reviewInputFingerprint = input
  // Metadata records preparation truthfully. This is not an extra scientific pass.
  row.reviewId = 'chemie-next25-targeted-final-bindings-author-v3'
  row.reviewedAt = new Date().toISOString()
  row.reviewer = 'Codex ROOT native exact-content binding preparer; independent current review pending'
  row.reason = 'Exact whole P profile and two DE/EN cases retained from final author-v2, separately scientifically reviewed. Only the proven orbital wording/alt-text correction changes native P input; metadata preparation is not another scientific review or human approval.'
}
const orbital = '0acc8cd2-be6d-567e-a023-1d9e90475510'
assert.deepEqual(goalChanged, [orbital]); assert.deepEqual(inputChanged, [orbital])
for (const [index, row] of records.entries()) assert.deepEqual(row.profile, oldRecords[index].profile)
writeFileSync(resolve(root, own, 'positive25.exact-content-final-bindings.author-candidate.review.jsonl'), records.map((row: any) => JSON.stringify(row)).join('\n') + '\n', { flag: 'wx' })
const config = load(author + '/positive-evidence.twenty-five.final-native-author-candidates.config.json')
config.reviewId = records[0].reviewId
config.landscapePath = canonPath
config.semanticKindLedgerPath = own + '/semantic-kinds.targeted-final-native-bindings.candidate.json'
config.reviewPath = own + '/positive25.exact-content-final-bindings.author-candidate.review.jsonl'
config.scope.label = 'Same25 independently reviewed P contents at targeted current wording and unchanged exact images; independent orbital followup and operative integration pending'
write('positive25.exact-content-final-bindings.author-candidate.config.json', config)
const full = await model.loadGoalBookBuildInputs(own + '/full378.targeted-final-complete-alttext.book.config.json', root)
const old = load(author + '/qa-artifacts/full-prospective378.book-model.json')
const oldPages = new Map(old.pages.map((p: any) => [p.goalId, p]))
const deltas = full.model.pages.filter((p: any) => model.stableGoalBookJson(p) !== model.stableGoalBookJson(oldPages.get(p.goalId)))
assert.equal(full.model.pages.length, 378)
assert.deepEqual(deltas.map((p: any) => p.goalId), [orbital])
write('full378.targeted-final-complete-alttext.book-model.json', full.model)
write('actual25-exact-profile-content-one-input-and-one-page-deltas.author.json', {
  documentType: 'native exact-content and changed binding measurement, not new science approval',
  changedGoalFingerprints: goalChanged, changedPositiveInputFingerprints: inputChanged,
  exactWholeProfileBodies: 25, exactCaseBodies: 50,
  exactNativeWholePagesToFinalAuthorV2: 377, changedWholePages: deltas,
  all479KindSourceFingerprintsCurrent: true,
  candidateOnly: true, independentTargetedReviewPending: true,
  activeWrites: false, strictNetGain: 0, humanApproval: false, humanTrial: false,
})
console.log('PASS25 whole profile bodies and50 cases exact; only orbital P goal/input and one full page change. Source metadata correction is no new performance.')
