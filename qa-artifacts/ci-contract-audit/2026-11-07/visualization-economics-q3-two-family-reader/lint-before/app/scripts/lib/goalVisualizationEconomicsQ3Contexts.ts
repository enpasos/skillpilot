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
const requireValue = (value: unknown, message: string): void => { if (!value) throw new Error(message) }
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
export function readEconomicsQ3Context(receipt: VisualizationContextQualification, review: Record<string, any>, assetRaw: Buffer,
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
  const read = (path: string, sha256: unknown): any => parseJson(artifact({ path, sha256: hash(sha256), gitCommit: commit }))
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
    requireValue(review.reviewDate === review.reviewedAt.slice(0, 10) && review.actualFormat === 'PNG'
      && review.actualDimensions?.width === originalSize[0] && review.actualDimensions?.height === originalSize[1]
      && review.nativeMetadataCurrentGermanTextParity === true, 'Q3 embedded original input/format bindings differ')
    const inspection = review.actualInspection
    requireValue(inspection?.nativeViewed === true && inspection.width360Viewed === true && inspection.width680Viewed === true
      && ['fachlichePruefung', 'phone', 'desktop', 'actorPerspective', 'style'].every(key => text(inspection[key]))
      && inspection.mandatorySmallPrint === false, 'Q3 embedded actual inspection is incomplete')
    requireValue(Array.isArray(review.derivatives) && review.derivatives.length === 2
      && [360, 680].every(width => review.derivatives.filter((row: any) => row.width === width).length === 1),
    'Q3 embedded inspection derivative manifest differs')
    for (const row of review.derivatives) {
      requireValue(row.path === reviewDir + goal + '.width-' + row.width + '.png', 'Q3 embedded derivative path differs')
      requireValue(dimensions(image(row.path, row.sha256))[0] === row.width, 'Q3 embedded actual derivative width differs')
    }
    if (corrected) {
      const priorPath = embedded + 'independent-review/' + goal + '/independent-image-review.receipt.json'
      requireValue(review.preservedOriginalIndependentReceiptPath === priorPath && text(review.actualCorrectionReview)
        && review.nativeBeforeCorrectionActuallyVerified === true, 'Q3 corrected original review binding is incomplete')
      const prior = read(priorPath, review.preservedOriginalReceiptSha256)
      requireValue(prior.goalId === goal && prior.decision === 'REJECT' && prior.machineApproval === 'Rejected AI'
        && Array.isArray(prior.blockingFindings) && prior.blockingFindings.length > 0
        && prior.goalTitle === review.goalTitle && prior.goalDescription === review.goalDescription
        && hash(prior.assetSha256) === hash(review.referencedOriginalAssetSha256)
        && hash(review.actualSourceAssetSha256) === receipt.reviewedAsset.sha256,
      'Q3 corrected review does not retain its actual rejected original/context')
    } else requireValue(review.nativeBeforeGenerationActuallyVerified === true
      && review.generationActualReceiptValidatedAgainstAsset === true, 'Q3 original native input was not bound')
    native = { landscapeId: owner, goalId: goal, subject, title: review.goalTitle, description: review.goalDescription,
      assetSha256: 'sha256:' + hash(review.assetSha256) }
    reviewer = review.independentReviewer; reason = inspection.fachlichePruefung
  } else {
    const corrected = receipt.originalReview.path === trade + goal + '/correction-v2/independent-corrected-image-review.receipt.json'
    const suffix = corrected ? 'correction-v2/' : '', reviewDir = trade + goal + '/' + suffix
    assetPath = tradeAssets + goal + '/' + suffix + goal + '.png'
    requireValue(receipt.originalReview.path === reviewDir + (corrected ? 'independent-corrected-image-review.receipt.json' : 'independent-original-image-review.receipt.json')
      && review.candidatePath === assetPath && receipt.reviewedAsset.path === assetPath, 'Trade/finance fixed review/asset path differs')
    requireValue(review.schemaVersion === 1 && review.decision === 'KEEP' && review.aiApproved === 'yes'
      && review.machineQaStatus === (corrected ? 'approved_ai_candidate' : 'ai_approved')
      && review.reviewer?.authority === 'ai_candidate' && review.reviewer.independentOfImageAuthor === true
      && text(review.reviewer.agentIdentity) && review.generationIsNotApproval === true && review.actualWholeDeEnGoalRead === true
      && review.humanApprovalClaimed === false && review.learnerPerformanceClaimed === false
      && review.liveWrites === 0 && review.newStrictGoalClosures === 0
      && Array.isArray(review.openFindings) && review.openFindings.length === 0
      && text(review.actualSubjectReview) && text(review.actualActorPerspectiveAndReadabilityReview),
    'Trade/finance original is not a positive independent AI review')
    requireValue(hash(review.aiApprovedAssetSha256) === hash(review.assetSha256)
      && review.formatDecision?.format === 'PNG' && review.formatDecision.nativeDimensions?.[0] === originalSize[0]
      && review.formatDecision.nativeDimensions?.[1] === originalSize[1], 'Trade/finance original asset bindings differ')
    const metadataPath = corrected ? tradeAssets + goal + '/correction-v2/fresh-native-preparation/metadata.json'
      : tradeInputs + 'native-image-preparation/' + goal + '/metadata.json'
    requireValue(review.nativeMetadataPath === metadataPath && review.wholeGoalCandidatePath === tradeInputs + 'whole-goals.candidate.json',
      'Trade/finance fixed original input path differs')
    const metadata = read(metadataPath, review.nativeMetadataSha256), whole = read(review.wholeGoalCandidatePath, review.wholeGoalCandidateSha256)
    const goals = Array.isArray(whole) ? whole.filter((row: any) => row?.id === goal) : []
    requireValue(goals.length === 1 && metadata.skillpilotId === goal && metadata.subjectPath === subject
      && metadata.lang === 'de' && metadata.title === review.currentTitleDe && metadata.description === review.currentDescriptionDe
      && ['title', 'description', 'titleEn', 'descriptionEn'].every(key => text(goals[0][key])
        && goals[0][key] === review[({ title: 'currentTitleDe', description: 'currentDescriptionDe', titleEn: 'currentTitleEn', descriptionEn: 'currentDescriptionEn' } as Record<string, string>)[key]]),
    'Trade/finance complete original goal/metadata bindings contradict')
    requireValue(Array.isArray(review.inspections) && review.inspections.length === 3, 'Trade/finance actual inspections are incomplete')
    for (const [kind, width] of [[corrected ? 'native-corrected' : 'native-original', originalSize[0]], ['uncropped-inspection-360', 360], ['uncropped-inspection-680', 680]] as const) {
      const rows = review.inspections.filter((row: any) => row.kind === kind)
      requireValue(rows.length === 1 && rows[0].actualViewImage === true && rows[0].width === width, 'Trade/finance actual inspection is missing')
      const row = rows[0], expected = kind.startsWith('native-') ? assetPath : reviewDir + 'inspection-' + width + '.png'
      requireValue(row.path === expected, 'Trade/finance fixed inspection path differs')
      const size = dimensions(image(row.path, row.sha256))
      requireValue(size[0] === row.width && size[1] === row.height
        && (!kind.startsWith('native-') || hash(row.sha256) === receipt.reviewedAsset.sha256), 'Trade/finance inspected bytes/size differ')
    }
    if (corrected) {
      const priorPath = trade + goal + '/independent-original-image-review.receipt.json'
      requireValue(review.priorIndependentReceiptPath === priorPath && review.historicalOriginalReceiptUnmodified === true,
        'Trade/finance corrected prior review is unbound')
      const prior = read(priorPath, review.priorIndependentReceiptSha256)
      requireValue(prior.goalId === goal && prior.decision === 'REJECT' && prior.aiApproved === 'no'
        && prior.reviewer?.agentIdentity === review.reviewer.agentIdentity
        && ['currentTitleDe', 'currentDescriptionDe', 'currentTitleEn', 'currentDescriptionEn'].every(key => prior[key] === review[key])
        && Array.isArray(prior.openFindings) && Array.isArray(review.closedFindings)
        && prior.openFindings.length > 0 && review.closedFindings.length === prior.openFindings.length
        && prior.openFindings.every((finding: any) => review.closedFindings.filter((closed: any) => closed.findingId === finding.findingId
          && closed.originalFinding === finding.actualFinding && closed.status === 'closed_by_actual_corrected_image_inspection'
          && text(closed.actualCorrectionReview) && hash(closed.assetSha256) === receipt.reviewedAsset.sha256).length === 1),
      'Trade/finance corrected review does not retain its actual rejected findings/context')
    }
    native = { landscapeId: owner, goalId: goal, subject, title: review.currentTitleDe, description: review.currentDescriptionDe,
      titleEn: review.currentTitleEn, descriptionEn: review.currentDescriptionEn, assetSha256: 'sha256:' + hash(review.assetSha256) }
    reviewer = review.reviewer.agentIdentity; reason = review.actualSubjectReview
  }
  return { native, decision: review.decision, reviewedAt: review.reviewedAt, reviewer, reason, assetPath }
}
