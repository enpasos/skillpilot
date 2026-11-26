import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates.ts'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../../app/scripts/positiveGoalEvidenceReview.ts'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { fingerprintSemanticKindSourceGoal, stableGoalBookJson } from '../../../../../../../../app/scripts/goalBookModel.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../..')
const evidence = 'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/quality/image-arrow-successor-20261125-v1'
const output = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-11-25/e2-arrow-media-context-v5'
const ids = ['53afbda1-5776-502b-8867-471975d7b766', 'ecbaa101-cb10-5da3-9368-ae40ff587d74', 'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20', '839ecc8f-3a60-418b-bc92-64bfeef33824']
const hash = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const json = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const same = (left: unknown, right: unknown) => stableGoalBookJson(left) === stableGoalBookJson(right)
const assert = (condition: unknown, message: string): asserts condition => { if (!condition) throw new Error(message) }
const read = (path: string) => readFileSync(join(root, path))
const readJson = (path: string) => JSON.parse(read(path).toString('utf8'))
const pin = (path: string) => { const bytes = read(path); return { path, sha256: hash(bytes), bytes: bytes.length } }
const checkPin = (entry: any) => { const actual = pin(entry.path); assert(actual.sha256 === entry.sha256 && actual.bytes === entry.bytes, `${entry.path}: pinned source changed`) }
const stripMedia = (goal: any) => { const { resourceLinks: ignored, ...scientific } = goal; return scientific }
const args = process.argv.slice(2)
assert(args.length === 1 && ['--write', '--check'].includes(args[0]), 'Usage: materialize-current-context.mts --write|--check')
const write = args[0] === '--write'
const before = readJson(`${evidence}/before.actual.json`)
const freeze = readJson(`${evidence}/media-review-input.actual.json`)
assert(before.contract === 'e2-four-arrow-media-only-successor-baseline-v1', 'Wrong predecessor contract')
assert(freeze.contract === 'e2-four-arrow-current-media-review-v1' && same(freeze.goals.map((g: any) => g.goalId), ids), 'Wrong frozen media scope/order')
assert(same(before.goals.map((g: any) => g.goalId), ids), 'Wrong predecessor goal order')
for (const source of before.sourcePins) { checkPin(source.config); checkPin(source.review) }
for (const source of freeze.actualQaEvidence) checkPin(source)
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json'
const goals = new Map(readJson(canonicalPath).goals.map((g: any) => [g.id, g]))
const qa = new Map(readJson(qaPath).records.map((g: any) => [g.goalId, g]))
const oldRecords = new Map(before.goals.map((g: any) => [g.goalId, g.record]))
const rows: any[] = []
for (const spec of freeze.goals) {
  const current: any = goals.get(spec.goalId)
  const prior = before.goals.find((g: any) => g.goalId === spec.goalId)
  const currentQa: any = qa.get(spec.goalId)
  assert(current && prior && same(stripMedia(current), stripMedia(prior.beforeCanonicalGoal)), `${spec.goalId}: non-media canonical change needs its own review`)
  assert(same(current.resourceLinks, spec.resourceLinks), `${spec.goalId}: frozen link/alt changed`)
  assert(same(currentQa, spec.currentQaRecord), `${spec.goalId}: frozen QA record changed`)
  const link = current.resourceLinks.find((l: any) => l.type === 'goal-visualization' && l.role === 'primary')
  assert(link?.url === currentQa?.imageUrl && currentQa.assetSha256 === spec.assetSha256 && currentQa.aiApproved === 'yes' && currentQa.aiApprovedAssetSha256 === spec.assetSha256, `${spec.goalId}: current QA not bound to approved current pixels`)
  for (const path of [currentQa.publicAssetPath, currentQa.canonicalAssetPath, `backend/src/main/resources/static${link.url}`]) assert(hash(read(path)) === spec.assetSha256, `${spec.goalId}: asset mirror differs at ${path}`)
  assert(spec.nativeAndPhoneInspected === true && typeof spec.compatibilityReason === 'string' && spec.compatibilityReason.length > 40 && spec.compatibilityReason.length <= 2000, `${spec.goalId}: missing bounded actual inspection`)
  assert(same(buildGoalDescriptionCanonicalContext(current), buildGoalDescriptionCanonicalContext(prior.beforeCanonicalGoal)), `${spec.goalId}: D canonical context changed`)
  assert(fingerprintSemanticKindSourceGoal(current) === fingerprintSemanticKindSourceGoal(prior.beforeCanonicalGoal), `${spec.goalId}: semantic-kind source changed`)
  rows.push({ goalId: spec.goalId, priorConfigPath: prior.sourceConfig, priorReviewPath: prior.sourceReview, priorGoalFingerprint: prior.record.goalFingerprint, priorProfileFingerprint: prior.record.profileFingerprint, priorReviewInputFingerprint: prior.record.reviewInputFingerprint, currentImageSha256: spec.assetSha256, imageUrl: link.url, altText: link.altText, dCanonicalContextUnchanged: true, semanticKindSourceUnchanged: true, compatibilityReason: spec.compatibilityReason })
}
const template = readJson(before.goals[0].sourceConfig)
const reviewId = 'physics-e2-arrow-media-context-20261125-v5'
const currentConfigPath = `${output}/current-four.config.json`
const currentReviewPath = `${output}/current-four.review.jsonl`
const currentConfig = { ...template, reviewId, reviewPath: currentReviewPath, reviewRunManifestPaths: [], scope: { label: 'Vier reine Bild-/Alt-Kontextnachfolger mit exakt unveränderten fachlichen P-Körpern; aktuelle explizite KI-Bildkompatibilitätsprüfung', goalIds: ids } }
const candidates = { schemaVersion: 1 as const, authoringContract: 'positive-understanding-evidence-candidates-v1' as const, reviewId, reviewedAt: freeze.reviewedAt, reviewer: 'OpenAI Codex; actual current image and alt compatibility inspection; prior independent scientific profile bodies retained without new blind votes', goals: freeze.goals.map((g: any) => ({ goalId: g.goalId, reason: g.compatibilityReason, evidenceLevel: 'E1' as const, maximumClaimScope: 'G1' as const, dissent: (oldRecords.get(g.goalId) as any).dissent, profile: (oldRecords.get(g.goalId) as any).profile })) }
const records = await buildPositiveGoalEvidenceCandidateRecords({ config: currentConfig, candidateSet: candidates })
for (const record of records) {
  const old: any = oldRecords.get(record.goalId)
  assert(record.goalFingerprint === old.goalFingerprint && record.profileFingerprint === old.profileFingerprint && same(record.profile, old.profile), `${record.goalId}: scientific profile drift`)
  assert(record.reviewInputFingerprint !== old.reviewInputFingerprint, `${record.goalId}: expected actual image context delta`)
  assert(record.reviewAuthority === 'ai_candidate' && record.status === 'needs_human_review' && record.reviewRunIds.length === 0, `${record.goalId}: authority escalation`)
  Object.assign(rows.find(r => r.goalId === record.goalId), { currentGoalFingerprint: record.goalFingerprint, currentProfileFingerprint: record.profileFingerprint, currentReviewInputFingerprint: record.reviewInputFingerprint })
}
const priorFourSource = before.sourcePins.find((s: any) => s.config.path.endsWith('/accepted-four.config.json'))
const priorFourConfig = readJson(priorFourSource.config.path)
const priorLines = read(priorFourSource.review.path).toString('utf8').trimEnd().split('\n')
const retainedIds = before.retainedGoalIds
const retainedLines = priorLines.filter((line: string) => retainedIds.includes(JSON.parse(line).goalId))
assert(same(retainedLines.map((line: string) => JSON.parse(line).goalId), retainedIds), 'Retained RATE-I/f524 order differs')
const retainedConfigPath = `${output}/retained-ratei-proof.config.json`
const retainedReviewPath = `${output}/retained-ratei-proof.review.jsonl`
const retainedConfig = { ...priorFourConfig, reviewPath: retainedReviewPath, scope: { label: 'Zwei vollständig unveränderte aktuelle RATE-I-/Herleitungs-Records nach dem reinen Vier-Bilder-Split', goalIds: retainedIds } }
const outputs = new Map<string, Buffer>([
  [currentConfigPath, json(currentConfig)], [`${output}/current-four.candidates.json`, json(candidates)], [currentReviewPath, Buffer.from(`${records.map(record => JSON.stringify(record)).join('\n')}\n`)],
  [retainedConfigPath, json(retainedConfig)], [retainedReviewPath, Buffer.from(`${retainedLines.join('\n')}\n`)],
  [`${evidence}/current-media-context-binding.actual.json`, json({ schemaVersion: 1, contract: 'e2-four-image-only-native-p-context-successor-v1', reviewedAt: freeze.reviewedAt, sourcePins: before.sourcePins, actualMediaReviewInput: pin(`${evidence}/media-review-input.actual.json`), changes: rows, retainedGoalIds: retainedIds, retainedRecordLinesSha256: hash(`${retainedLines.join('\n')}\n`), currentConfigPath, retainedConfigPath, noNewBlindScientificVote: true, historicalDAndVisualVotesUnchanged: true, newImagesApprovedByPriorVisualVotes: false, humanApproved: false, learnerMasteryWritten: false, nativeQualityGateChanged: false, interpretation: 'Current P records retain exact independently reviewed scientific profile bodies and bind the actual new media/alt context through a separate explicit AI compatibility inspection. Historical visual verdicts remain limited to their originally inspected asset digests. D/A/M/kind scientific bindings do not depend on the replaced JPEG bytes or resource links.' })],
])
for (const [path, bytes] of outputs) {
  const absolute = join(root, path)
  if (existsSync(absolute)) {
    assert(readFileSync(absolute).equals(bytes), `${path}: refusing to overwrite different successor evidence`)
  } else {
    assert(write, `${path}: missing generated evidence`)
    await mkdir(dirname(absolute), { recursive: true }); await writeFile(absolute, bytes, { flag: 'wx' })
  }
}
for (const path of [currentConfigPath, retainedConfigPath]) {
  const result = reviewPositiveGoalEvidenceConfig(path)
  assert(result.errors.length === 0, `${path}: ${result.errors.join(' | ')}`)
}
console.log(JSON.stringify({ contract: 'e2-four-image-only-native-p-context-successor-v1', currentImageContexts: 4, retainedScientificProfileBodies: 4, unchangedRecordLines: 2, newBlindScientificVotes: 0, humanApprovals: 0, nativePConfigChecks: 2, activeRegistryModifiedByHelper: false }, null, 2))
