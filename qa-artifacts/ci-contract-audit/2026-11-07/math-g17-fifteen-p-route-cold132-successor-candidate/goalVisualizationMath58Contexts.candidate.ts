// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import type { VisualizationContextQualification, VisualizationCurrentContext, VisualizationReviewArtifact, VisualizationReviewedContext } from '../goalVisualizationReviewedContext'

export const MATH58_PIN_PATH = 'contracts/goal-visualization-context/v1/math58-current-supplement-pins-g17-fifteen-2026-11-07.candidate.json'
export const MATH58_PIN_SHA256 = '521de7276ac11ad26ae3ed471e4672a88dc85b2509e929b2beacf8ded3d56658'
export const isMath58Profile = (profile: string): boolean => profile === 'math-current62-with-current-viewports-v1' || profile === 'math-independent-ten-with-current-viewports-v1'
export interface BoundCurrentEvidence { path: string; sha256: string; bytes?: number }
export type ReadBoundCurrentEvidence = (binding: BoundCurrentEvidence, fromRepository?: boolean) => Buffer
const insist: (condition: unknown, message: string) => asserts condition = (condition, message) => { if (!condition) throw new Error(message) }
const object = (value: unknown): Record<string, unknown> => { insist(!!value && typeof value === 'object' && !Array.isArray(value), 'Math58 expected object'); return value as Record<string, unknown> }
const array = (value: unknown): unknown[] => { insist(Array.isArray(value), 'Math58 expected array'); return value }
const string = (value: unknown): string => { insist(typeof value === 'string' && value.trim(), 'Math58 supplied text missing'); return value }
const sha = (value: unknown): string => string(value).replace(/^sha256:/u, '')
const hash = (raw: Buffer): string => createHash('sha256').update(raw).digest('hex')
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical((value as Record<string, unknown>)[key])).join(',') + '}'
  return JSON.stringify(value)
}
const same = (left: unknown, right: unknown): boolean => canonical(left) === canonical(right)
const row = (value: unknown, goalId: string): Record<string, unknown> => {
  const found = array(value).map(object).filter(candidate => candidate.goalId === goalId || candidate.id === goalId)
  insist(found.length === 1, 'Math58 missing/duplicate goal row'); return found[0]
}
const ref = (value: unknown): BoundCurrentEvidence => { const v = object(value); return { path: string(v.path), sha256: string(v.sha256), ...(typeof v.bytes === 'number' ? { bytes: v.bytes } : {}) } }
const time = (value: unknown): number => { const t = Date.parse(string(value)); insist(Number.isFinite(t), 'Math58 invalid actual time'); return t }

/** Two finite original readers preserve original field availability and attribution.
 * The current supplement is a separately attributed, byte-bound review, never an old viewport claim. */
export const readMath58Context = (
  receipt: VisualizationContextQualification,
  review: Record<string, unknown>, input: Record<string, unknown>,
  current: VisualizationCurrentContext,
  readCurrent: ReadBoundCurrentEvidence,
  readOriginal: (binding: VisualizationReviewArtifact, currentCopyRequired?: boolean) => Buffer,
  parse: (raw: Buffer) => unknown,
): { native: VisualizationReviewedContext; decision: unknown; reviewedAt: unknown; reviewer: unknown; reason: unknown; assetPath: unknown } => {
  const parsed = (binding: unknown, repository = false): Record<string, unknown> => object(parse(readCurrent(ref(binding), repository)))
  const pins = parsed({ path: MATH58_PIN_PATH, sha256: MATH58_PIN_SHA256 }, true)
  insist(pins.kind === 'private-math58-closed-original-and-current-evidence-bindings-v1', 'Math58 fixed dataset kind differs')
  const selection = parsed(pins.selection)
  insist(same(array(selection.goals).map(object).map(goal => goal.goalId), object(pins.selection).goalIds)
    && array(pins.goalBindings).length === 58, 'Math58 finite source/goal set differs')
  const binding = row(pins.goalBindings, receipt.context.goalId)
  insist(binding.profile === receipt.reviewProfile && ['originalReview', 'originalInput', 'ownerSource', 'reviewedAsset'].every(key =>
    same(binding[key], receipt[key as 'originalReview' | 'originalInput' | 'ownerSource' | 'reviewedAsset'])), 'Math58 receipt leaves its finite original binding')
  insist(same(receipt.currentSupplement, { path: object(binding.currentReview).path, sha256: object(binding.currentReview).sha256 }), 'Math58 current supplement reference differs')
  const original = row(review.records, receipt.context.goalId)
  let oldGoal: Record<string, unknown>, originalAssetPath: unknown, originalAssetSha: unknown, oldReason: unknown, oldTime: unknown
  if (receipt.reviewProfile === 'math-current62-with-current-viewports-v1') {
    insist(review.schemaVersion === 1 && ['current-image-only-review', 'current-goal-visualization-review'].includes(String(review.kind)) && review.reviewAuthority === 'ai_candidate'
      && review.humanApproved === false && original.inspected === true && original.decision === 'accept_current_asset'
      && array(original.findings).length === 0 && review.inputPath === receipt.originalInput.path
      && sha(review.inputSha256) === receipt.originalInput.sha256, 'Math58 original current62 review is not positive inspected evidence')
    insist(input.kind === 'current-image-only-review-input' && input.reviewId === review.reviewId, 'Math58 original input differs')
    oldGoal = row(input.records, receipt.context.goalId)
    insist(!('titleEn' in oldGoal) && !('demandLevel' in oldGoal) && !('level' in oldGoal), 'Math58 original field availability differs')
    originalAssetPath = original.assetPath; originalAssetSha = original.assetSha256; oldReason = original.rationale; oldTime = review.actualReviewedAt
    insist(oldGoal.assetPath === originalAssetPath && sha(oldGoal.assetSha256) === sha(originalAssetSha)
      && oldGoal.title === original.title, 'Math58 original row/input asset association differs')
  } else {
    insist(review.schemaVersion === 1 && review.authority === 'ai_candidate' && review.humanApproved === false
      && original.actualViewed === true && original.decision === 'accepted_pilot'
      && !array(review.heldGoalIds).includes(receipt.context.goalId)
      && same(receipt.originalInput, receipt.originalReview), 'Math58 original correction review is not independent positive evidence')
    oldGoal = object(original.previousGoal); insist(oldGoal.id === receipt.context.goalId, 'Math58 original correction goal differs')
    originalAssetPath = original.candidatePath; originalAssetSha = original.candidateSha256; oldReason = original.independentChecks; oldTime = review.reviewedAt
    // Prompt is historical context, authenticated with the same existing raw-Git reader.
    readOriginal({ path: string(original.promptPath), sha256: sha(original.promptSha256), gitCommit: receipt.originalReview.gitCommit })
  }
  insist(originalAssetPath === receipt.reviewedAsset.path && sha(originalAssetSha) === receipt.reviewedAsset.sha256
    && original.decision === binding.originalDecision && review.reviewer === binding.originalReviewer
    && oldTime === binding.originalReviewedAt && oldReason === binding.originalReason, 'Math58 original attribution/asset differs')
  const currentReview = parsed(binding.currentReview), currentInput = parsed(binding.currentInput), browser = parsed(binding.browser)
  const corrected = binding.boxplotV2 === true
  const sight = corrected ? currentReview : row(currentReview.rows, receipt.context.goalId)
  const inputGoal = corrected ? object(currentReview.wholeCurrentGoal) : object(row(currentInput.rows, receipt.context.goalId).wholeCurrentGoal)
  const sourceBinding = object(pins.source), source = parsed(sourceBinding, true)
  const actualGoal = row(source.goals, receipt.context.goalId)
  insist(source.landscapeId === receipt.context.landscapeId && sourceBinding.landscapeId === receipt.context.landscapeId
    && same(inputGoal, actualGoal)
    && hash(Buffer.from(canonical(actualGoal))) === binding.wholeCurrentGoalCanonicalSha256
    && sight.wholeCurrentGoalCanonicalSha256 === binding.wholeCurrentGoalCanonicalSha256, 'Math58 whole current goal/source differs')
  for (const field of ['title', 'description', 'descriptionEn']) insist(oldGoal[field] === actualGoal[field], 'Math58 original/current supplied goal text differs')
  if ('titleEn' in oldGoal) insist(oldGoal.titleEn === actualGoal.titleEn, 'Math58 original EN title differs')
  const tags = object(actualGoal.dimensionTags)
  insist(same(sight.fullCurrentDE, { title: actualGoal.title, description: actualGoal.description })
    && same(sight.fullCurrentEN, { title: actualGoal.titleEn, description: actualGoal.descriptionEn })
    && sight.currentDemandLevel === tags.demandLevel && sight.currentPhase === tags.phase
    && sight.currentLevel === (actualGoal.level ?? null)
    && (!('level' in current) || (current as unknown as Record<string, unknown>).level === actualGoal.level), 'Math58 current DE/EN/demand/level/phase differs')
  insist(sight.reviewer === binding.currentReviewer && sight.reviewedAtActualUTC === binding.currentReviewedAt
    && sight.decision === binding.currentDecision && sight.humanApproved === false && sight.imageAuthorIsReviewer === false
    && (corrected || (currentReview.actor === sight.reviewer && string(sight.independenceBasis)
      && array(sight.findings).length === 0 && currentReview.actualSightCompletedAtUTC)), 'Math58 current actor/time/decision/independence differs')
  insist(time(binding.currentReviewedAt) > time(binding.originalReviewedAt), 'Math58 current sight predates original review')
  if (binding.firstTimeClarification) {
    const clarification = parsed(binding.firstTimeClarification)
    insist(clarification.kind === 'prior-first20-sight-time-label-clarification'
      && clarification.priorReviewSha256 === object(corrected ? binding.normalReviewForAudit : binding.currentReview).sha256
      && clarification.immutablePriorReviewChanged === false, 'Math58 first20 time clarification missing/different')
  }
  if (!corrected) {
    insist(object(currentReview.inputReference).sha256 === object(binding.currentInput).sha256
      && object(currentReview.browserReceipt).sha256 === object(binding.browser).sha256, 'Math58 current supplement input/browser differs')
    insist(array(sight.currentAssets).length === 2 && array(sight.currentAssets).map(object).every(asset =>
      [binding.publicAssetPath, binding.canonicalAssetPath].includes(asset.path) && asset.sha256 === binding.assetSha256), 'Math58 current asset pair differs')
  } else {
    insist(currentReview.kind === 'independent-private-boxplot-v2-visual-review' && currentReview.decision === 'PASS'
      && object(currentReview.candidate).sha256 === binding.assetSha256
      && object(currentReview.nativeSight).candidateActuallyViewed === true && object(currentReview.nativeSight).originalActuallyViewed === true
      && object(currentReview.nativeSight).candidateHash === binding.assetSha256
      && object(currentReview.nativeSight).originalHash === receipt.reviewedAsset.sha256, 'Math58 new boxplot native review missing')
    const generation = parsed(binding.generationReceipt)
    insist(generation.editor === currentReview.imageAuthor && currentReview.imageAuthor !== sight.reviewer, 'Math58 boxplot editor/reviewer identity differs')
    insist(object(currentReview.generationReceipt).sha256 === object(binding.generationReceipt).sha256, 'Math58 boxplot generation receipt differs')
    const attempts = array(generation.attempts).map(object).filter(attempt => object(attempt.savedCandidate).sha256 === binding.assetSha256)
    insist(attempts.length === 1 && attempts[0].version === 2 && attempts[0].generatedImageDisplayed === true
      && object(generation.selectedForIndependentReview).sha256 === binding.assetSha256 && string(object(generation.importNotRun).reason), 'Math58 boxplot selected generation differs')
    readCurrent(ref(attempts[0].prompt))
    const preparation = object(generation.preparation)
    for (const key of ['metadata', 'preparedPrompt']) readCurrent(ref(preparation[key]))
    readCurrent(ref(currentReview.candidate))
    const oldHold = row(parsed(binding.normalReviewForAudit).rows, receipt.context.goalId)
    insist(oldHold.decision === 'HOLD' && object(currentReview.historicalHoldReference).originalAssetRemainsHeldInThatImmutableReview === true, 'Math58 original boxplot hold was not preserved')
  }
  const renderer = object(currentInput.rendererBasis ?? browser.rendererBasis)
  for (const rendererRef of array(pins.rendererReferences)) readCurrent(ref(rendererRef), true)
  const rendererRefs = array(pins.rendererReferences).map(object)
  insist(rendererRefs.some(r => r.path === renderer.productionComponent && r.sha256 === renderer.productionComponentSha256)
    && rendererRefs.some(r => r.path === renderer.path && r.sha256 === renderer.sha256), 'Math58 production renderer binding differs')
  insist(renderer.actualImageClass === 'block h-auto max-h-[28rem] w-full object-contain'
    && renderer.isolatedGoalCardImageCss === true && renderer.fullAppOrRealPhoneHostAcceptance === false
    && browser.fullAppReviewed === false && browser.realPhoneHostReviewed === false && browser.screenshotGenerationIsSight === false
    && browser.deviceScaleFactor === 1, 'Math58 display scope/CSS differs')
  if (!corrected) insist(browser.inputSha256 === object(binding.currentInput).sha256, 'Math58 browser current input differs')
  const views = array(sight.currentViewportEvidence).map(object), expectedViews = array(binding.views).map(object)
  insist(views.length === 2 && expectedViews.length === 2 && new Set(views.map(v => v.widthCSS)).size === 2, 'Math58 two distinct current viewports required')
  for (const width of [360, 680]) {
    const view = views.find(v => v.widthCSS === width), expected = expectedViews.find(v => v.widthCSS === width)
    insist(view && expected, 'Math58 required viewport missing')
    const screenshot = object(view.screenshot), metrics = object(view.metrics)
    const browserView = array(browser.views).map(object).filter(v => v.goalId === receipt.context.goalId && v.requestedImageWidthCSS === width)
    insist(browserView.length === 1, 'Math58 native browser viewport missing/duplicate')
    const captured = browserView[0], reportedScreenshot = object(captured.screenshot), htmlRef = object(captured.html)
    insist(view.actualViewed === true && view.sightedBy === binding.currentReviewer
      && (view.sightedAtActualUTC ?? view.reviewedAtActualUTC) === binding.currentReviewedAt
      && time(binding.currentReviewedAt) >= time(view.capturedAtActualUTC)
      && captured.capturedAtActualUTC === view.capturedAtActualUTC && captured.assetSha256 === binding.assetSha256
      && same(captured.metrics, metrics) && reportedScreenshot.path === expected.reportedScreenshotPath
      && screenshot.path === expected.reportedScreenshotPath && screenshot.sha256 === object(expected.screenshot).sha256
      && reportedScreenshot.sha256 === object(expected.screenshot).sha256
      && htmlRef.path === expected.reportedHtmlPath && htmlRef.sha256 === object(expected.html).sha256,
    'Math58 viewport asset/actor/time/screenshot/browser binding differs')
    insist(metrics.viewportWidth === width && metrics.imageBoxWidth === width && metrics.bodyScrollWidth === width
      && metrics.maxHeight === '448px' && metrics.objectFit === 'contain' && metrics.rootFontSize === '16px'
      && metrics.devicePixelRatio === 1 && typeof metrics.paintWidth === 'number' && metrics.paintWidth > 0
      && typeof metrics.paintHeight === 'number' && metrics.paintHeight > 0 && metrics.paintHeight <= 448
      && typeof metrics.imageBoxHeight === 'number' && metrics.imageBoxHeight <= 448, 'Math58 actual GoalCard CSS metrics differ')
    const png = readCurrent(ref(expected.screenshot)), html = readCurrent(ref(expected.html)).toString('utf8')
    insist(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && png.readUInt32BE(16) === width
      && png.readUInt32BE(20) >= Math.floor(Number(metrics.imageBoxHeight)) && png.readUInt32BE(20) <= Math.ceil(Number(metrics.imageBoxHeight)) + 1 && html.includes('object-fit:contain') && html.includes('max-height:28rem'), 'Math58 screenshot/HTML geometry differs')
  }
  if (binding.contactSheet) {
    insist(object(sight.contactSheet).sha256 === object(binding.contactSheet).sha256, 'Math58 actual sight pair differs')
    readCurrent(ref(binding.contactSheet))
  }
  const native: VisualizationReviewedContext = { landscapeId: receipt.context.landscapeId, goalId: receipt.context.goalId, subject: receipt.context.subject,
    title: string(actualGoal.title), description: string(actualGoal.description), titleEn: string(actualGoal.titleEn), descriptionEn: string(actualGoal.descriptionEn),
    demandLevel: string(tags.demandLevel), assetSha256: 'sha256:' + string(binding.assetSha256) }
  return { native, decision: original.decision, reviewedAt: oldTime, reviewer: review.reviewer, reason: oldReason, assetPath: originalAssetPath }
}
