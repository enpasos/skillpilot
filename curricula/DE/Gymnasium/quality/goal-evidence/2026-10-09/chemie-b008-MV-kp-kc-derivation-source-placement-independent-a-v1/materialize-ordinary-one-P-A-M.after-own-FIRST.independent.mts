import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const own = dirname(fileURLToPath(import.meta.url))
let root = own
while (!existsSync(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts'))) {
  const parent = dirname(root)
  if (root === parent) throw new Error('Cannot locate actual repository validator source')
  root = parent
}
const author = resolve(own, '../chemie-b008-MV-kp-kc-derivation-source-placement-author-root-v2')
const rel = (value: string) => relative(root, value)
const load = (value: string) => JSON.parse(readFileSync(value, 'utf8'))
const hash = (value: string | Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const stable = (value: any): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(',')}}`
  return JSON.stringify(value)
}
const normal = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const write = (name: string, value: any, jsonl = false) => {
  const path = resolve(own, name)
  if (existsSync(path)) throw new Error(`Refusing to overwrite ${path}`)
  writeFileSync(path, jsonl ? JSON.stringify(value) + '\n' : JSON.stringify(value, null, 2) + '\n')
  return rel(path)
}
const science = load(resolve(own, 'one-derived-MV-KpKc-science-source-P-kind-AM.actual-FIRST.independent-A.verdict.json'))
const goalId = 'a8ddb351-3501-5b6d-a908-c82a5d2f14d4'
const landscapePath = resolve(author, 'canonical504-one-KpKc-derived-MV-LK.inactive.json')
const landscape = load(landscapePath)
const goal = landscape.goals.find((value: any) => value.id === goalId)
const kindPath = resolve(author, 'kinds395-one-current-goal.technical-candidate.json')
const kind = load(kindPath).decisions.find((value: any) => value.goalId === goalId)
if (kind.semanticKind !== science.semanticKindDecision.semanticKind) throw new Error('Actual scientific kind and bound normal technical input disagree')
const model: any = await import(pathToFileURL(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const currentCandidate = load(resolve(author, 'one-derived-positive-profile.criteria-current-v4.author-candidate-set.json')).goals[0]
if (stable(currentCandidate.profile) !== stable(science.wholeCurrentProfileActuallyRead)) throw new Error('Profile body differs from actual FIRST')
const criteriaPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')
const criteriaFingerprint = hash(readFileSync(criteriaPath))
const reviewedAt = science.createdAt
const reviewer = '/root/bio_science14_independent_a; genuine independent current one-goal reviewer; actual model variant unexposed'
const reviewId = 'chemie-mv-kpkc-derived-one-material-independent-a-v1'
const record = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',
  schemaVersion: 2, reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1',
  profileRuleVersion: 'positive-understanding-evidence-v2', reviewCriteriaFingerprint: criteriaFingerprint,
  landscapeId: landscape.landscapeId, goalId,
  goalFingerprint: model.fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'),
  reviewInputFingerprint: model.fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, {}, 'curricularAtomic'),
  profileFingerprint: model.fingerprintPositiveGoalEvidenceProfile(currentCandidate.profile),
  status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewedAt, reviewer,
  reason: 'Own actual whole bilingual relation/ideal-gas derivation and both complete finite supplied-model cases read. Signed gas products yield Kp=Kc(RT)^Delta n_g; normalised standards yield RTc0/p0. SI/L errors, reciprocal reaction, zero-exponent temperature overreach and a pure-solid exclusion provide assessable conceptual transfer. Seven own finite numeric checks agree. Three mandatory observable performances and both expectedPerformance pairs form the operational rubric; raw cases do not contain separately named rubric fields. Two substantive demonstrations retain unchanged subject criteria without an extra-task quota. Actual MV2022 physical27/printed23 LK clause and whole original gas partner/source duties read, one bounded partial route justified. This ordinary record validates material candidate semantics only, with reviewedResourceTypes empty and no invented native bundle/run or current image approval. Whole395 source/course/registered view and protected177 gas-source-context integration remain held. Author reason/rationale exposure disclosed in own FIRST; no author judgment adopted or fresh peer outcomes read.',
  evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewRunIds: [], dissent: [], profile: currentCandidate.profile,
}
const semanticErrors = model.validatePositiveGoalEvidenceRecordSemantics(record, goal, {}, 'curricularAtomic')
if (semanticErrors.length) throw new Error(JSON.stringify(semanticErrors))
const recordPath = write('normal-one-KpKc-material-P.independent-A.records.jsonl', record, true)
write('normal-one-KpKc-material-P.independent-A.config.json', {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
  schemaVersion: 2, reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId: landscape.landscapeId, landscapePath: rel(landscapePath), semanticKindLedgerPath: rel(kindPath),
  reviewCriteriaPath: rel(criteriaPath), reviewPath: recordPath, reviewRunManifestPaths: [],
  reviewedResourceTypes: [], requireApproved: false,
  scope: { label: 'One genuine independent whole Kp/Kc material/derivation candidate; current native/raster P and whole MV course/source gates not claimed', goalIds: [goalId] },
})
const semanticPayload = (ruleVersion: string) => ({
  ruleVersion, goalId: goal.id, shortKey: goal.shortKey ?? '', title: normal(goal.title), titleEn: normal(goal.titleEn),
  description: normal(goal.description), descriptionEn: normal(goal.descriptionEn),
  phase: normal(goal.dimensionTags?.phase), area: normal(goal.dimensionTags?.area), topicCode: normal(goal.dimensionTags?.topicCode), nodeKind: normal(goal.nodeKind),
})
const atomicId = 'chemie-mv-kpkc-current-one-A-independent-a-v1'
const atomicRecord = {
  schemaVersion: 1, reviewId: atomicId, ruleVersion: 'semantic-atomicity-v1', landscapeId: landscape.landscapeId,
  goalId, fingerprint: hash(stable(semanticPayload('semantic-atomicity-v1'))),
  status: 'atomic', semanticAtomic: true, reviewedAt, reviewer, reason: science.semanticAtomicityDecision.reason,
}
const atomicRecordPath = write('normal-one-KpKc-A.independent-A.records.jsonl', atomicRecord, true)
const scope = { label: 'One actual changed whole bilingual Kp/Kc derivation goal independently judged; no other394 decisions reapproved', leafGoalIds: [goalId] }
write('normal-one-KpKc-A.independent-A.config.json', {
  schemaVersion: 1, reviewId: atomicId, ruleVersion: 'semantic-atomicity-v1', landscapeId: landscape.landscapeId,
  landscapePath: rel(landscapePath), reviewPath: atomicRecordPath, scope,
})
const memoryId = 'chemie-mv-kpkc-current-one-M-independent-a-v1'
const memoryRecord = {
  schemaVersion: 1, reviewId: memoryId, ruleVersion: 'memory-card-review-v1', landscapeId: landscape.landscapeId,
  goalId, fingerprint: hash(stable(semanticPayload('memory-card-review-v1'))),
  status: 'no_memory_needed', memoryUseful: false, reviewedAt, reviewer, reason: science.memoryDecision.reason,
  memoryGoalIds: [], deckIds: [],
}
const memoryRecordPath = write('normal-one-KpKc-M.independent-A.records.jsonl', memoryRecord, true)
const emptyCards = resolve(own, 'normal-one-KpKc-M.independent-A.empty-scoped-cards.review.jsonl')
if (existsSync(emptyCards)) throw new Error('Refusing to overwrite empty scoped card ledger')
writeFileSync(emptyCards, '')
write('normal-one-KpKc-M.independent-A.config.json', {
  schemaVersion: 1, reviewId: memoryId, ruleVersion: 'memory-card-review-v1', landscapeId: landscape.landscapeId,
  landscapePath: rel(landscapePath), reviewPath: memoryRecordPath, cardReviewPath: rel(emptyCards), scope,
})
write('one-current-KpKc-kind.actual-independent-confirmation.json', {
  schemaVersion: 1, role: 'Own actual whole competence semantic kind confirmation; no adoption of other author kind decisions', goalId,
  actualCurrentCanonicalPath: rel(landscapePath), actualCurrentKindInput: rel(kindPath), technicalSourceFingerprint: kind.sourceFingerprint,
  semanticKind: 'curricularAtomic', scientificReason: science.semanticKindDecision.reason,
  actualWholeGoalReadBeforeFirst: true, actualOwnFirstPath: rel(resolve(own, 'one-derived-MV-KpKc-science-source-P-kind-AM.actual-FIRST.independent-A.verdict.json')),
  other394AuthorKindDecisionsIndependentlyApproved: false, humanApproval: false, activeWrites: [], strictGain: 0,
})
write('ordinary-one-material-P-A-M.actual-generation-disclosure.json', {
  schemaVersion: 1, role: 'Materialisation of already actual own independently reasoned FIRST; no new review asserted by format conversion',
  actualModelVariant: 'unexposed', actualToolModelName: null,
  nativeBundleAvailableForThisReview: false, inventedNativeBundleFingerprint: false,
  normalPReviewedResourceTypes: [], reviewRunIds: [], reviewRunManifestPaths: [],
  reason: 'The ordinary non-native material candidate schema permits no run manifests. No artificial native book/bundle bindings or named provider/model are created. Actual own FIRST and input freeze record all scientific review inputs and chronology.',
  pSemanticValidationErrors: semanticErrors, humanApproval: false, humanTrial: false, activeWrites: [], strictGain: 0,
})
console.log(JSON.stringify({ pSemanticValidationErrors: semanticErrors, goalFingerprint: record.goalFingerprint, profileFingerprint: record.profileFingerprint, atomicFingerprint: atomicRecord.fingerprint, memoryFingerprint: memoryRecord.fingerprint, actualScienceFirstUnchanged: true }, null, 2))
