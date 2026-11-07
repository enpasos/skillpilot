// SPDX-License-Identifier: Apache-2.0
// PRIVATE PROPOSAL: exact existing 17-goal family; no active reader or authority change.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { VisualizationContextQualification, VisualizationReviewArtifact } from '../goalVisualizationReviewedContext'

const pinRaw = readFileSync(new URL('../../../contracts/goal-visualization-context/v1/economics-q2-monetary-social-original-pins-2026-11-07.json', import.meta.url))
const expectedPinSha256 = 'a2a0930765426e53765863296102164d7e6bd1f5c73cd7f849085ac6cc46475b'
if (createHash('sha256').update(pinRaw).digest('hex') !== expectedPinSha256) throw new Error('Private Q2 external pin bytes differ')
const pins = JSON.parse(pinRaw.toString('utf8')) as {
  acceptedRepositoryCommit: string; originalCommit: string; goalIds: string[]
  originalReferences: Array<VisualizationReviewArtifact & { oid: string; currentCopyRequired: boolean }>
}
const commit = '42095f427223545968e452d494e4f982c196c7e2'
const owner = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', subject = 'wirtschaftswissenschaften'
const source = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const base = 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q2-monetary-social-seventeen-image-author-20261008-v1/'
const inputs = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q2-monetary-social-seventeen-bilingual-positive-author-v1/'
const correctedGoal = '676684da-5ba2-5c2a-ba7e-a8413915c29c'
const requireValue: (value: unknown, message: string) => asserts value = (value, message) => { if (!value) throw new Error(message) }
const object = (value: unknown): Record<string, any> => { requireValue(value && typeof value === 'object' && !Array.isArray(value), 'Q2 object missing'); return value as Record<string, any> }
const array = (value: unknown): Record<string, any>[] => { requireValue(Array.isArray(value), 'Q2 array missing'); return value.map(object) }
const supplied = (value: unknown): string => { requireValue(typeof value === 'string' && value.trim(), 'Q2 supplied text missing'); return value }
const digest = (value: unknown): string => { requireValue(typeof value === 'string' && /^(sha256:)?[a-f0-9]{64}$/u.test(value), 'Q2 hash missing'); return value.replace(/^sha256:/u, '') }
const relative = (path: string) => path.replace(/^\/home\/enpasos\/projects\/skillpilot\//u, '')
const size = (raw: Buffer): [number, number] => {
  requireValue(raw.length >= 24 && raw.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && raw.subarray(12, 16).toString() === 'IHDR', 'Q2 inspected bytes are not the original PNG')
  return [raw.readUInt32BE(16), raw.readUInt32BE(20)]
}
requireValue(pins.originalCommit === commit && pins.goalIds.length === 17 && new Set(pins.goalIds).size === 17,
  'Private Q2 finite original selection differs')
const fixed = new Map(pins.originalReferences.map(row => [row.path, row]))
requireValue(fixed.size === pins.originalReferences.length, 'Private Q2 original paths ambiguous')

/** New closed profile only; the existing five profile branches remain unchanged. */
export function readEconomicsQ2MonetarySocialContext(receipt: VisualizationContextQualification, review: Record<string, unknown>, assetRaw: Buffer,
  artifact: (binding: VisualizationReviewArtifact, requireCurrentCopy?: boolean) => Buffer,
  parseJson: (raw: Buffer) => unknown) {
  const goal = receipt.context.goalId, corrected = goal === correctedGoal, suffix = corrected ? 'correction-v2/' : ''
  const reviewDir = base + 'independent-review/' + goal + '/' + suffix
  const assetPath = base + goal + '/' + suffix + goal + '.png'
  requireValue(pins.goalIds.includes(goal) && receipt.context.landscapeId === owner && receipt.context.subject === subject,
    'Q2 unselected original goal/owner/subject')
  const bound = (ref: VisualizationReviewArtifact) => {
    const expected = fixed.get(ref.path)
    requireValue(expected && ref.gitCommit === commit && expected.sha256 === ref.sha256, 'Q2 original differs from finite external pins')
  }
  for (const ref of [receipt.originalReview, receipt.originalInput, receipt.ownerSource, receipt.reviewedAsset]) bound(ref)
  requireValue(receipt.ownerSource.path === source && receipt.originalReview.path === reviewDir + 'independent-image-review.receipt.json'
    && receipt.reviewedAsset.path === assetPath && receipt.originalInput.path === receipt.originalReview.path
    && receipt.originalInput.sha256 === receipt.originalReview.sha256, 'Q2 fixed original receipt/input/asset association differs')
  const raw = (path: string, sha256?: unknown): Buffer => {
    path = relative(path)
    const expected = fixed.get(path)
    requireValue(expected && expected.gitCommit === commit && (sha256 === undefined || expected.sha256 === digest(sha256)),
      'Q2 dependency absent from finite original pins or exact original hash')
    return artifact({ path, gitCommit: commit, sha256: expected.sha256 }, expected.currentCopyRequired)
  }
  const read = (path: string, sha256?: unknown) => object(parseJson(raw(path, sha256)))
  const r = object(review), inspection = object(r.actualInspection), nativeSize = size(assetRaw)
  requireValue(r.schemaVersion === 1 && r.goalId === goal && r.decision === 'KEEP' && r.machineApproval === 'Reviewed AI'
    && r.independentReviewer === 'OpenAI Codex economics_visual_memory_audit' && r.imageAuthorIsReviewer === false
    && r.humanApproved === false && r.generationIsApproval === false && r.goalSemanticSource === source
    && Array.isArray(r.blockingFindings) && r.blockingFindings.length === 0, 'Q2 original is not a positive independent AI image review')
  requireValue(typeof r.reviewedAt === 'string' && /^\d{4}-\d\d-\d\dT/u.test(r.reviewedAt)
    && Number.isFinite(Date.parse(r.reviewedAt)) && r.reviewDate === r.reviewedAt.slice(0, 10), 'Q2 actual original timestamp missing')
  requireValue(r.assetPath === assetPath && digest(r.assetSha256) === receipt.reviewedAsset.sha256 && r.actualFormat === 'PNG'
    && object(r.actualDimensions).width === nativeSize[0] && object(r.actualDimensions).height === nativeSize[1], 'Q2 original asset/format differs')
  requireValue(inspection.nativeViewed === true && inspection.width360Viewed === true && inspection.width680Viewed === true
    && ['fachlichePruefung', 'phone', 'desktop', 'actorPerspective', 'style'].every(key => supplied(inspection[key]))
    && inspection.mandatorySmallPrint === false, 'Q2 actual native/phone/desktop inspection incomplete')
  const derivatives = array(r.derivatives)
  requireValue(derivatives.length === 2, 'Q2 derivative manifest differs')
  for (const width of [360, 680]) {
    const matches = derivatives.filter(row => row.width === width)
    requireValue(matches.length === 1 && matches[0].path === reviewDir + goal + '.width-' + width + '.png'
      && size(raw(matches[0].path, matches[0].sha256))[0] === width, 'Q2 actual derivative path/bytes/width differs')
  }
  const generationPath = base + goal + '/' + suffix + 'generation.actual.json'
  requireValue(r.generationRecordPath === generationPath, 'Q2 generation path differs')
  const generation = read(generationPath, r.generationRecordSha256)
  requireValue(generation.goalId === goal && generation.candidatePath === assetPath && digest(generation.sha256) === receipt.reviewedAsset.sha256
    && generation.generationIsApproval === false && generation.humanApprovalClaimed === false
    && Number.isFinite(Date.parse(generation.startedAt)) && Date.parse(generation.startedAt) <= Date.parse(generation.completedAt)
    && Date.parse(generation.completedAt) <= Date.parse(r.reviewedAt), 'Q2 original generation receipt contradicts image/review')
  let native: VisualizationContextQualification['context'] = { landscapeId: owner, goalId: goal, subject,
    title: supplied(r.goalTitle), description: supplied(r.goalDescription), assetSha256: 'sha256:' + digest(r.assetSha256) }
  let copies: Record<string, any>[]
  if (!corrected) {
    requireValue(r.authorCandidateBilingualGoalPath === inputs + 'whole-goals.candidate.json'
      && r.nativeBeforeGenerationReceiptPath === inputs + 'native-image-preparation/native-seventeen-preparation.actual.json'
      && generation.nativePreparationReceipt === r.nativeBeforeGenerationReceiptPath
      && r.generationActualStartedAt === generation.startedAt && r.generationActualCompletedAt === generation.completedAt,
      'Q2 fixed bilingual/native original input paths or generation times differ')
    const goals = array(parseJson(raw(r.authorCandidateBilingualGoalPath, r.authorCandidateBilingualGoalSha256))).filter(row => row.id === goal)
    requireValue(goals.length === 1 && goals[0].title === r.goalTitle && goals[0].description === r.goalDescription
      && goals[0].titleEn === r.authorCandidateEnglishTitle && goals[0].descriptionEn === r.authorCandidateEnglishDescription,
      'Q2 complete original bilingual input contradicts original reviewed text')
    native = { ...native, titleEn: supplied(r.authorCandidateEnglishTitle), descriptionEn: supplied(r.authorCandidateEnglishDescription),
      demandLevel: supplied(object(goals[0].dimensionTags).demandLevel) }
    const prep = read(r.nativeBeforeGenerationReceiptPath, r.nativeBeforeGenerationReceiptSha256)
    requireValue(prep.role === 'technical_image_preparer' && prep.currentGoalCount === 17 && prep.nativePreparationOnly === true,
      'Q2 original native preparation manifest differs')
    const commands = array(prep.actualCommands).filter(row => row.goalId === goal)
    requireValue(commands.length === 1 && commands[0].exitCode === 0, 'Q2 actual native preparation command missing')
    copies = array(commands[0].actualMetadataAndPromptCopies)
  } else {
    const priorPath = base + 'independent-review/' + goal + '/independent-image-review.receipt.json'
    requireValue(r.correctedCandidateVersion === 'correction-v2' && r.preservedOriginalIndependentReceiptPath === priorPath
      && supplied(r.actualCorrectionReview) && r.goalTextStatus === 'Actual current canonical German title and description inspected; English authored successor and D/P gates not attested by this image review.',
      'Q2 corrected actual review/scope/prior binding missing')
    const prior = read(priorPath, r.preservedOriginalReceiptSha256)
    requireValue(prior.goalId === goal && prior.decision === 'REJECT' && prior.machineApproval === 'Rejected AI'
      && prior.independentReviewer === r.independentReviewer && prior.imageAuthorIsReviewer === false && prior.humanApproved === false
      && prior.goalTitle === r.goalTitle && prior.goalDescription === r.goalDescription
      && Array.isArray(prior.blockingFindings) && prior.blockingFindings.length > 0, 'Q2 actual rejected original/context not retained')
    requireValue(prior.assetPath === base + goal + '/' + goal + '.png' && relative(generation.referencedImagePath) === prior.assetPath
      && createHash('sha256').update(raw(prior.assetPath, prior.assetSha256)).digest('hex') === digest(prior.assetSha256),
      'Q2 actual prior image binding differs')
    requireValue(r.actualPromptPath === base + goal + '/correction-v2/prompt.actual.txt'
      && raw(r.actualPromptPath, r.actualPromptSha256).length > 0
      && generation.nativePreparationReceipt === base + goal + '/correction-v2/native-before-edit-preparation.actual.json', 'Q2 actual correction prompt/native input missing')
    const prep = read(generation.nativePreparationReceipt)
    requireValue(prep.role === 'actual_native_preparation_before_referenced_image_edit' && prep.goalId === goal
      && prep.exitCode === 0 && prep.generatedOrApprovedByPreparation === false, 'Q2 actual corrected native preparation differs')
    copies = array(prep.nativeCopiedFiles)
  }
  const nativeDir = corrected ? base + goal + '/correction-v2/native-preparation/' : inputs + 'native-image-preparation/' + goal + '/'
  requireValue(copies.length === 2, 'Q2 native metadata/prompt manifest differs')
  for (const suffix of ['metadata.json', 'nano-banana-prompt.de.md']) {
    const matches = copies.filter(row => row.path === nativeDir + suffix)
    requireValue(matches.length === 1, 'Q2 fixed native input path missing')
    const data = raw(matches[0].path, matches[0].sha256)
    if (suffix === 'metadata.json') {
      const metadata = object(parseJson(data))
      requireValue(metadata.skillpilotId === goal && metadata.subjectPath === subject && metadata.lang === 'de'
        && metadata.title === r.goalTitle && metadata.description === r.goalDescription, 'Q2 exact native metadata/context contradicts')
    } else requireValue(data.length > 0, 'Q2 actual native prompt empty')
  }
  return { native, decision: r.decision, reviewedAt: r.reviewedAt, reviewer: r.independentReviewer,
    reason: inspection.fachlichePruefung, assetPath }
}
