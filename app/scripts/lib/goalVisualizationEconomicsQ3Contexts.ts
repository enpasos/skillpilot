// SPDX-License-Identifier: Apache-2.0
import type { VisualizationContextQualification, VisualizationReviewArtifact } from '../goalVisualizationReviewedContext'

const base = 'curricula/DE/Gymnasium/quality/goal-visualization-review/'
const embedded = base + 'wirtschaft-q3-twenty-three-image-author-20261008-v1/'
const trade = base + 'wirtschaft-q3-trade-finance-sixteen-independent-image-review-20261008-v1/'
const tradeAssets = base + 'wirtschaft-q3-trade-finance-sixteen-image-author-20261008-v1/'
const tradeInputs = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q3-trade-finance-sixteen-bilingual-positive-author-v1/'
const owner = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const subject = 'wirtschaftswissenschaften'
const source = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const requireValue: (value: unknown, message: string) => asserts value = (value, message) => { if (!value) throw new Error(message) }
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const object = (value: unknown): Record<string, unknown> => { requireValue(isObject(value), 'Original Q3 object is missing'); return value }
const objects = (value: unknown): Record<string, unknown>[] => { requireValue(Array.isArray(value), 'Original Q3 array is missing'); return value.map(object) }
const supplied = (value: unknown): string => { requireValue(typeof value === 'string', 'Original Q3 supplied text is missing'); return value }
const text = (value: unknown): string => typeof value === 'string' ? value.replace(/\s+/gu, ' ').trim() : ''
const hash = (value: unknown): string => {
  requireValue(typeof value === 'string' && /^(sha256:)?[0-9a-f]{64}$/u.test(value), 'Invalid original Q3 artifact hash')
  return String(value).replace(/^sha256:/u, '')
}
const dimensions = (raw: Buffer): [number, number] => {
  requireValue(raw.length >= 24 && raw.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && raw.subarray(12, 16).toString() === 'IHDR', 'Original Q3 inspection is not the bound PNG')
  return [raw.readUInt32BE(16), raw.readUInt32BE(20)]
}

/** Two fixed historical families, not a configurable field-path or current-ledger reader. */
export function readEconomicsQ3Context(receipt: VisualizationContextQualification, review: Record<string, unknown>, assetRaw: Buffer,
  artifact: (binding: VisualizationReviewArtifact, requireCurrentCopy?: boolean) => Buffer,
  parseJson: (raw: Buffer) => unknown) {
  const first = receipt.reviewProfile === 'economics-q3-embedded-v1'
  const commit = first ? '42095f427223545968e452d494e4f982c196c7e2' : '6fe35a6b0fa807e5a97475b34f3715dc16a89c00'
  const goal = receipt.context.goalId
  requireValue(receipt.originalReview.gitCommit === commit && receipt.context.landscapeId === owner
    && receipt.ownerSource.path === source, 'Q3 original family/commit/owner differs')
  requireValue(['path', 'gitCommit', 'sha256'].every(key => receipt.originalInput[key as keyof VisualizationReviewArtifact]
    === receipt.originalReview[key as keyof VisualizationReviewArtifact]), 'Q3 embedded context must come from the exact original review')
  requireValue(typeof review.reviewedAt === 'string' && /^\d{4}-\d\d-\d\dT/u.test(review.reviewedAt)
    && Number.isFinite(Date.parse(review.reviewedAt)), 'Q3 original review has no actual complete timestamp')
  const read = (path: string, sha256: unknown): unknown => parseJson(artifact({ path, sha256: hash(sha256), gitCommit: commit }))
  const image = (path: string, sha256: unknown): Buffer => artifact({ path, sha256: hash(sha256), gitCommit: commit })
  const originalSize = dimensions(assetRaw)
  let native: VisualizationContextQualification['context'], reviewer: string, reason: string, assetPath: string
  if (first) {
    const corrected = review.correctedCandidateVersion === 'correction-v2', suffix = corrected ? 'correction-v2/' : ''
    const reviewDir = embedded + 'independent-review/' + goal + '/' + suffix
    assetPath = embedded + goal + '/' + suffix + goal + '.png'
    requireValue(receipt.originalReview.path === reviewDir + 'independent-image-review.receipt.json'
      && review.assetPath === assetPath && receipt.reviewedAsset.path === assetPath, 'Q3 embedded fixed review/asset path differs')
    requireValue(review.schemaVersion === 1 && review.decision === 'KEEP' && review.machineApproval === 'Reviewed AI'
      && text(review.independentReviewer) && review.imageAuthorIsReviewer === false && review.humanApproved === false
      && review.generationIsApproval === false && review.goalSemanticSource === source
      && Array.isArray(review.blockingFindings) && review.blockingFindings.length === 0,
    'Q3 embedded original is not a positive independent AI review')
    const declaredSize = object(review.actualDimensions)
    requireValue(review.reviewDate === review.reviewedAt.slice(0, 10) && review.actualFormat === 'PNG'
      && declaredSize.width === originalSize[0] && declaredSize.height === originalSize[1]
      && review.nativeMetadataCurrentGermanTextParity === true, 'Q3 embedded original input/format bindings differ')
    const inspection = object(review.actualInspection)
    requireValue(inspection.nativeViewed === true && inspection.width360Viewed === true && inspection.width680Viewed === true
      && ['fachlichePruefung', 'phone', 'desktop', 'actorPerspective', 'style'].every(key => text(inspection[key]))
      && inspection.mandatorySmallPrint === false, 'Q3 embedded actual inspection is incomplete')
    const derivatives = objects(review.derivatives)
    requireValue(derivatives.length === 2
      && [360, 680].every(width => derivatives.filter(row => row.width === width).length === 1),
    'Q3 embedded inspection derivative manifest differs')
    for (const width of [360, 680]) {
      const row = derivatives.find(row => row.width === width)!
      const path = reviewDir + goal + '.width-' + width + '.png'
      requireValue(row.path === path, 'Q3 embedded derivative path differs')
      requireValue(dimensions(image(path, row.sha256))[0] === width, 'Q3 embedded actual derivative width differs')
    }
    if (corrected) {
      const priorPath = embedded + 'independent-review/' + goal + '/independent-image-review.receipt.json'
      requireValue(review.preservedOriginalIndependentReceiptPath === priorPath && text(review.actualCorrectionReview)
        && review.nativeBeforeCorrectionActuallyVerified === true, 'Q3 corrected original review binding is incomplete')
      const prior = object(read(priorPath, review.preservedOriginalReceiptSha256))
      requireValue(prior.goalId === goal && prior.decision === 'REJECT' && prior.machineApproval === 'Rejected AI'
        && Array.isArray(prior.blockingFindings) && prior.blockingFindings.length > 0
        && prior.goalTitle === review.goalTitle && prior.goalDescription === review.goalDescription
        && hash(prior.assetSha256) === hash(review.referencedOriginalAssetSha256)
        && hash(review.actualSourceAssetSha256) === receipt.reviewedAsset.sha256,
      'Q3 corrected review does not retain its actual rejected original/context')
    } else requireValue(review.nativeBeforeGenerationActuallyVerified === true
      && review.generationActualReceiptValidatedAgainstAsset === true, 'Q3 original native input was not bound')
    native = { landscapeId: owner, goalId: goal, subject, title: supplied(review.goalTitle), description: supplied(review.goalDescription),
      assetSha256: 'sha256:' + hash(review.assetSha256) }
    reviewer = supplied(review.independentReviewer); reason = supplied(inspection.fachlichePruefung)
  } else {
    const corrected = receipt.originalReview.path === trade + goal + '/correction-v2/independent-corrected-image-review.receipt.json'
    const suffix = corrected ? 'correction-v2/' : '', reviewDir = trade + goal + '/' + suffix
    assetPath = tradeAssets + goal + '/' + suffix + goal + '.png'
    requireValue(receipt.originalReview.path === reviewDir + (corrected ? 'independent-corrected-image-review.receipt.json' : 'independent-original-image-review.receipt.json')
      && review.candidatePath === assetPath && receipt.reviewedAsset.path === assetPath, 'Trade/finance fixed review/asset path differs')
    const actor = object(review.reviewer)
    requireValue(review.schemaVersion === 1 && review.decision === 'KEEP' && review.aiApproved === 'yes'
      && review.machineQaStatus === (corrected ? 'approved_ai_candidate' : 'ai_approved')
      && actor.authority === 'ai_candidate' && actor.independentOfImageAuthor === true
      && text(actor.agentIdentity) && review.generationIsNotApproval === true && review.actualWholeDeEnGoalRead === true
      && review.humanApprovalClaimed === false && review.learnerPerformanceClaimed === false
      && review.liveWrites === 0 && review.newStrictGoalClosures === 0
      && Array.isArray(review.openFindings) && review.openFindings.length === 0
      && text(review.actualSubjectReview) && text(review.actualActorPerspectiveAndReadabilityReview),
    'Trade/finance original is not a positive independent AI review')
    const format = object(review.formatDecision)
    requireValue(hash(review.aiApprovedAssetSha256) === hash(review.assetSha256)
      && format.format === 'PNG' && Array.isArray(format.nativeDimensions) && format.nativeDimensions[0] === originalSize[0]
      && format.nativeDimensions[1] === originalSize[1], 'Trade/finance original asset bindings differ')
    const metadataPath = corrected ? tradeAssets + goal + '/correction-v2/fresh-native-preparation/metadata.json'
      : tradeInputs + 'native-image-preparation/' + goal + '/metadata.json'
    requireValue(review.nativeMetadataPath === metadataPath && review.wholeGoalCandidatePath === tradeInputs + 'whole-goals.candidate.json',
      'Trade/finance fixed original input path differs')
    const metadata = object(read(metadataPath, review.nativeMetadataSha256)), whole = read(tradeInputs + 'whole-goals.candidate.json', review.wholeGoalCandidateSha256)
    const goals = objects(whole).filter(row => row.id === goal)
    requireValue(goals.length === 1 && metadata.skillpilotId === goal && metadata.subjectPath === subject
      && metadata.lang === 'de' && metadata.title === review.currentTitleDe && metadata.description === review.currentDescriptionDe
      && ['title', 'description', 'titleEn', 'descriptionEn'].every(key => text(goals[0][key])
        && goals[0][key] === review[({ title: 'currentTitleDe', description: 'currentDescriptionDe', titleEn: 'currentTitleEn', descriptionEn: 'currentDescriptionEn' } as Record<string, string>)[key]]),
    'Trade/finance complete original goal/metadata bindings contradict')
    const inspections = objects(review.inspections)
    requireValue(inspections.length === 3, 'Trade/finance actual inspections are incomplete')
    for (const [kind, width] of [[corrected ? 'native-corrected' : 'native-original', originalSize[0]], ['uncropped-inspection-360', 360], ['uncropped-inspection-680', 680]] as const) {
      const rows = inspections.filter(row => row.kind === kind)
      requireValue(rows.length === 1 && rows[0].actualViewImage === true && rows[0].width === width, 'Trade/finance actual inspection is missing')
      const row = rows[0], expected = kind.startsWith('native-') ? assetPath : reviewDir + 'inspection-' + width + '.png'
      requireValue(row.path === expected, 'Trade/finance fixed inspection path differs')
      const size = dimensions(image(expected, row.sha256))
      requireValue(size[0] === row.width && size[1] === row.height
        && (!kind.startsWith('native-') || hash(row.sha256) === receipt.reviewedAsset.sha256), 'Trade/finance inspected bytes/size differ')
    }
    if (corrected) {
      const priorPath = trade + goal + '/independent-original-image-review.receipt.json'
      requireValue(review.priorIndependentReceiptPath === priorPath && review.historicalOriginalReceiptUnmodified === true,
        'Trade/finance corrected prior review is unbound')
      const prior = object(read(priorPath, review.priorIndependentReceiptSha256)), priorActor = object(prior.reviewer)
      const open = objects(prior.openFindings), closed = objects(review.closedFindings)
      requireValue(prior.goalId === goal && prior.decision === 'REJECT' && prior.aiApproved === 'no'
        && priorActor.agentIdentity === actor.agentIdentity
        && ['currentTitleDe', 'currentDescriptionDe', 'currentTitleEn', 'currentDescriptionEn'].every(key => prior[key] === review[key])
        && open.length > 0 && closed.length === open.length
        && open.every(finding => closed.filter(item => item.findingId === finding.findingId
          && item.originalFinding === finding.actualFinding && item.status === 'closed_by_actual_corrected_image_inspection'
          && text(item.actualCorrectionReview) && hash(item.assetSha256) === receipt.reviewedAsset.sha256).length === 1),
      'Trade/finance corrected review does not retain its actual rejected findings/context')
    }
    native = { landscapeId: owner, goalId: goal, subject, title: supplied(review.currentTitleDe), description: supplied(review.currentDescriptionDe),
      titleEn: supplied(review.currentTitleEn), descriptionEn: supplied(review.currentDescriptionEn), assetSha256: 'sha256:' + hash(review.assetSha256) }
    reviewer = supplied(actor.agentIdentity); reason = supplied(review.actualSubjectReview)
  }
  return { native, decision: review.decision, reviewedAt: review.reviewedAt, reviewer, reason, assetPath }
}
