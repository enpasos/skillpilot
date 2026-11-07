// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { normalizeGoalVisualizationSubject } from '../../scripts/goal_visualization_scope.mjs'
import { createAuthenticatedGitEvidenceReader, validateGitEvidencePath } from './lib/authenticatedGitEvidence'
import { readEconomicsQ3Context } from './lib/goalVisualizationEconomicsQ3Contexts'

export interface VisualizationReviewArtifact { path: string; gitCommit: string; sha256: string }
export interface VisualizationReviewedContext {
  landscapeId: string; goalId: string; subject: string; title: string; description: string; assetSha256: string
  titleEn?: string; descriptionEn?: string; demandLevel?: string
}
export interface VisualizationCurrentContext extends VisualizationReviewedContext {
  imageUrl: string; publicAssetPath: string; canonicalAssetPath: string
}
export interface VisualizationContextReceiptReference { path: string; sha256: string }
export interface VisualizationContextQualification {
  schemaVersion: 1; kind: 'visualization-reviewed-context-qualification'
  normalization: 'skillpilot-visualization-display-whitespace-v1'
  reviewProfile: 'matrix-candidate-v1' | 'economics-native-v1' | 'diagram-current-b-v1' | 'economics-q3-embedded-v1' | 'economics-q3-trade-finance-v1'
  context: VisualizationReviewedContext
  originalReview: VisualizationReviewArtifact; originalInput: VisualizationReviewArtifact
  ownerSource: VisualizationReviewArtifact; reviewedAsset: VisualizationReviewArtifact
  originalDecision: 'keep' | 'KEEP' | 'yes'; reviewedAt: string; reviewer: string; originalReason: string
  qualification: { qualifiedAt: string; qualifier: string; reason: string }
}
export interface VerifiedVisualizationContext {
  readonly context: Readonly<VisualizationReviewedContext>
  readonly receiptSha256: string
  readonly originalReviewSha256: string
}
export type VisualizationContextValidation =
  | { ok: true; capability: VerifiedVisualizationContext }
  | { ok: false; status: 'missing' | 'invalid' | 'stale'; issues: string[] }

const capabilities = new WeakSet<object>()
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const schema = JSON.parse(readFileSync(resolve(repoRoot, 'contracts/goal-visualization-context/v1/qualification.schema.json'), 'utf8'))
const ajv = new Ajv2020({ strict: true, allErrors: true })
addFormats(ajv)
const validateSchema = ajv.compile(schema)
const hash = (raw: Buffer): string => createHash('sha256').update(raw).digest('hex')
const text = (value: unknown): string => String(value ?? '').replace(/\s+/gu, ' ').trim()
const requireValue: (value: unknown, message: string) => asserts value = (value, message) => { if (!value) throw new Error(message) }
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const record = (value: unknown): Record<string, unknown> => {
  requireValue(isRecord(value), 'Expected object')
  return value
}
const suppliedString = (value: unknown): string => { requireValue(typeof value === 'string', 'Original supplied text must be a string'); return value }
const sha = (value: unknown): string => {
  requireValue(typeof value === 'string' && /^(?:sha256:)?[0-9a-f]{64}$/u.test(value), 'Invalid original asset hash')
  return String(value).replace(/^sha256:/u, '')
}

/** JSON.parse validates syntax; the second walk rejects otherwise ambiguous duplicate keys. */
export const parseVisualizationReviewJson = (raw: Buffer): unknown => {
  const source = raw.toString('utf8'), parsed = JSON.parse(source)
  let index = 0
  const space = () => { while (/\s/u.test(source[index] ?? '') && index < source.length) index++ }
  const string = (): string => {
    const start = index++
    while (index < source.length) {
      if (source[index++] === '\\') index++
      else if (source[index - 1] === '"') return JSON.parse(source.slice(start, index))
    }
    throw new Error('Unterminated JSON string')
  }
  const value = (): void => {
    space()
    if (source[index] === '{') {
      index++; space(); const keys = new Set<string>()
      if (source[index] !== '}') while (true) {
        space(); const key = string()
        requireValue(!keys.has(key), 'Duplicate JSON property: ' + key); keys.add(key)
        space(); index++; value(); space()
        if (source[index] !== ',') break
        index++
      }
      index++
    } else if (source[index] === '[') {
      index++; space()
      if (source[index] !== ']') while (true) { value(); space(); if (source[index] !== ',') break; index++ }
      index++
    } else if (source[index] === '"') string()
    else while (index < source.length && !/[\s,}\]]/u.test(source[index])) index++
  }
  value()
  return parsed
}

const contextKeys = ['landscapeId', 'goalId', 'subject', 'title', 'description', 'assetSha256', 'titleEn', 'descriptionEn', 'demandLevel'] as const
// These versioned readers describe exact existing canonical review formats.
// A freely selected later source snapshot cannot grant a different namespace.
const reviewOwners = {
  'matrix-candidate-v1': { landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', subject: 'mathematik',
    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json' },
  'economics-native-v1': { landscapeId: '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', subject: 'wirtschaftswissenschaften',
    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' },
  'diagram-current-b-v1': { landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', subject: 'mathematik',
    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json' },
  'economics-q3-embedded-v1': { landscapeId: '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', subject: 'wirtschaftswissenschaften',
    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' },
  'economics-q3-trade-finance-v1': { landscapeId: '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', subject: 'wirtschaftswissenschaften',
    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' },
} as const
const sameContext = (left: VisualizationReviewedContext, right: VisualizationReviewedContext): boolean =>
  contextKeys.every(key => !(key in left) || (key === 'landscapeId' || key === 'goalId' || key === 'subject' || key === 'assetSha256'
    ? left[key] === right[key] : text(left[key]) === text(right[key])))

/** Capabilities cannot be manufactured by supplying a boolean or a copied digest. */
export const hasVerifiedVisualizationContext = (capability: unknown, current: VisualizationReviewedContext): boolean =>
  !!capability && typeof capability === 'object' && capabilities.has(capability)
  && sameContext((capability as VerifiedVisualizationContext).context, current)

export const createVisualizationContextVerifier = (options: {
  repositoryRoot?: string
  originalEvidenceRepositoryRoot?: string
  acceptedRepositoryCommit?: string
  onAuthenticatedOriginalRead?: (binding: Readonly<VisualizationReviewArtifact>, currentCopyRequired: boolean) => void
} = {}) => {
  const root = realpathSync(options.repositoryRoot ?? repoRoot)
  const originalsRoot = realpathSync(options.originalEvidenceRepositoryRoot ?? root)
  const originalGit = createAuthenticatedGitEvidenceReader({ repositoryRoot: originalsRoot, acceptedRepositoryCommit: options.acceptedRepositoryCommit })
  const safePath = validateGitEvidencePath
  return (reference: unknown, current: VisualizationCurrentContext): VisualizationContextValidation => {
    if (!reference) return { ok: false, status: 'missing', issues: ['Missing immutable reviewed-context receipt'] }
    try {
      const captures = new Map<string, Buffer>()
      const capturedBytes = (base: string, path: string): Buffer => {
        path = safePath(path)
        const key = base + '\0' + path
        if (!captures.has(key)) {
          const absolute = realpathSync(resolve(base, path)), local = relative(base, absolute)
          requireValue(local && !local.startsWith('../') && !isAbsolute(local), 'Evidence file escapes repository')
          captures.set(key, Buffer.from(readFileSync(absolute)))
        }
        return captures.get(key)!
      }
      const currentBytes = (path: string): Buffer => capturedBytes(root, path)
      const ref = record(reference)
      requireValue(Object.keys(ref).sort().join(',') === 'path,sha256' && typeof ref.path === 'string'
        && typeof ref.sha256 === 'string' && /^[0-9a-f]{64}$/u.test(ref.sha256), 'Invalid context receipt reference')
      const receiptRaw = currentBytes(ref.path)
      requireValue(hash(receiptRaw) === ref.sha256, 'Context receipt byte hash differs')
      const parsed = parseVisualizationReviewJson(receiptRaw)
      requireValue(validateSchema(parsed), 'Closed context receipt schema failed: ' + ajv.errorsText(validateSchema.errors))
      const receipt = parsed as VisualizationContextQualification
      const artifact = (binding: VisualizationReviewArtifact, requireCurrentCopy = true): Buffer => {
        const path = safePath(binding.path)
        const raw = originalGit.readArtifact(binding)
        if (requireCurrentCopy) requireValue(hash(capturedBytes(originalsRoot, path)) === binding.sha256, 'Original input bytes changed')
        options.onAuthenticatedOriginalRead?.(Object.freeze({ ...binding }), requireCurrentCopy)
        return raw
      }
      // Capture all supplied originals before interpreting any claims from them.
      const reviewRaw = artifact(receipt.originalReview), inputRaw = artifact(receipt.originalInput)
      const sourceRaw = artifact(receipt.ownerSource, false), assetRaw = artifact(receipt.reviewedAsset)
      const review = record(parseVisualizationReviewJson(reviewRaw)), input = record(parseVisualizationReviewJson(inputRaw))
      const source = record(parseVisualizationReviewJson(sourceRaw))
      const profileOwner = reviewOwners[receipt.reviewProfile]
      requireValue(receipt.context.landscapeId === profileOwner.landscapeId && receipt.context.subject === profileOwner.subject
        && receipt.ownerSource.path === profileOwner.sourcePath && receipt.ownerSource.gitCommit === receipt.originalReview.gitCommit,
      'Original owner/goal/subject association differs from the closed review profile')
      const originals = Array.isArray(source.goals) ? source.goals.filter((goal: unknown) => isRecord(goal) && goal.id === receipt.context.goalId) : []
      requireValue(originals.length === 1 && source.landscapeId === receipt.context.landscapeId
        && normalizeGoalVisualizationSubject(source.subject) === receipt.context.subject, 'Original owner/goal/subject association differs')
      requireValue(review.goalId === receipt.context.goalId, 'Original review goal differs')
      let native: VisualizationReviewedContext
      let decision: unknown, reviewedAt: unknown, reviewer: unknown, reason: unknown, assetPath: unknown
      if (receipt.reviewProfile === 'matrix-candidate-v1') {
        const candidate = record(review.candidate), scopeFit = record(review.scopeFit)
        requireValue(review.schemaVersion === 1 && review.kind === 'independent-goal-visualization-candidate-review'
          && review.reviewAuthority === 'ai_candidate' && review.decision === 'keep'
          && Array.isArray(review.blockingFindings) && review.blockingFindings.length === 0
          && candidate.actuallyViewed === true && scopeFit.outcome === 'pass', 'Original matrix review is not an actual positive AI content review')
        requireValue(['path', 'gitCommit', 'sha256'].every(key =>
          receipt.originalInput[key as keyof VisualizationReviewArtifact] === receipt.originalReview[key as keyof VisualizationReviewArtifact]),
        'Matrix context must come from the original review itself')
        const snapshot = record(input.goalSnapshot)
        native = { landscapeId: receipt.context.landscapeId, goalId: receipt.context.goalId, subject: receipt.context.subject,
          title: suppliedString(snapshot.title), description: suppliedString(snapshot.description), assetSha256: 'sha256:' + sha(candidate.sha256),
          ...(snapshot.titleEn ? { titleEn: suppliedString(snapshot.titleEn) } : {}), ...(snapshot.descriptionEn ? { descriptionEn: suppliedString(snapshot.descriptionEn) } : {}),
          ...(snapshot.demandLevel ? { demandLevel: suppliedString(snapshot.demandLevel) } : {}) }
        decision = review.decision; reviewedAt = review.reviewedAt; reviewer = review.reviewer; reason = scopeFit.evidenceDe; assetPath = candidate.path
      } else if (receipt.reviewProfile === 'economics-native-v1') {
        const reviewActor = record(review.reviewer), binding = record(review.nativeBeforeAndGenerationTechnicalBinding)
        const viewed = record(review.actualViewedAsset)
        requireValue(review.schemaVersion === 1 && review.decision === 'KEEP' && reviewActor.status === 'ai_candidate'
          && reviewActor.humanApproved === false && review.generationIsApproval === false
          && review.actualWholeDEENGoalRead === true && review.actualNativeBeforeMetadataAndDidacticPromptRead === true
          && typeof review.actualWholeNative360680Views === 'number' && Number.isInteger(review.actualWholeNative360680Views) && review.actualWholeNative360680Views > 0
          && binding.sourceBytesMatchPreservedOriginalGeneratedImage === true,
        'Original Economics review is not an actual positive AI content review')
        requireValue(binding.nativeBeforeMetadataSha256 === receipt.originalInput.sha256,
          'Original review does not bind these exact original metadata bytes')
        requireValue(input.skillpilotId === review.goalId && binding.goalId === review.goalId
          && normalizeGoalVisualizationSubject(input.subjectPath) === receipt.context.subject, 'Original input identity differs')
        requireValue(sha(viewed.sha256) === sha(binding.originalSha256), 'Original reviewed asset bindings contradict')
        native = { landscapeId: receipt.context.landscapeId, goalId: receipt.context.goalId, subject: receipt.context.subject,
          title: suppliedString(input.title), description: suppliedString(input.description), assetSha256: 'sha256:' + sha(viewed.sha256) }
        decision = review.decision; reviewedAt = review.actualCompletedAt; reviewer = reviewActor.agentIdentity
        reason = review.actualGoalSpecificSubjectFormatAccessibilityAndPerspectiveReason; assetPath = viewed.path
      } else if (receipt.reviewProfile === 'economics-q3-embedded-v1' || receipt.reviewProfile === 'economics-q3-trade-finance-v1') {
        ;({ native, decision, reviewedAt, reviewer, reason, assetPath } = readEconomicsQ3Context(receipt, review, assetRaw, artifact, parseVisualizationReviewJson))
      } else {
        const inspection = record(review.visualInspection), bound = record(review.boundGoal)
        const candidate = record(bound.candidate), originalSource = record(bound.sourceOriginal)
        requireValue(review.schemaVersion === 1
          && review.kind === 'independent-fresh-visualization-content-review-for-exact-diagram-description-B'
          && inspection.judgment === 'appropriate instructional visualization for current B goal'
          && text(inspection.method) && Array.isArray(inspection.observations)
          && inspection.observations.length > 0, 'Original B review is not an actual positive image/context inspection')
        requireValue(review.landscapeId === source.landscapeId && input.id === review.goalId,
          'Original B review/input identity differs')
        requireValue(candidate.path === receipt.originalInput.path
          && candidate.sha256 === receipt.originalInput.sha256,
        'Original B review does not bind these exact candidate goal bytes')
        requireValue(originalSource.path === receipt.ownerSource.path
          && originalSource.sha256 === receipt.ownerSource.sha256,
        'Original B review does not bind this original owner source')
        requireValue(Array.isArray(review.assets) && review.assets.length === 2
          && review.assets.every((asset: unknown) => isRecord(asset) && asset.sha256 === receipt.reviewedAsset.sha256)
          && review.assets.some((asset: unknown) => isRecord(asset) && asset.path === receipt.reviewedAsset.path), 'Original B asset pair differs')
        const rowBinding = record(review.candidateRow)
        const originalRowRef = { path: suppliedString(rowBinding.path), sha256: suppliedString(rowBinding.sha256),
          gitCommit: receipt.originalReview.gitCommit }
        requireValue(typeof originalRowRef.path === 'string' && /^[0-9a-f]{64}$/u.test(originalRowRef.sha256),
          'Original B review must bind the actual fresh reviewer row')
        const originalRow = record(parseVisualizationReviewJson(artifact(originalRowRef)))
        requireValue(originalRow.goalId === input.id && originalRow.landscapeId === source.landscapeId
          && originalRow.subject === receipt.context.subject && originalRow.aiApproved === 'yes'
          && originalRow.aiReviewedAt === review.reviewedAt && text(originalRow.aiReviewer) && text(originalRow.aiNotes),
        'Original B reviewer attribution/decision differs')
        requireValue(text(input.description) === text(bound.descriptionDe)
          && text(input.descriptionEn) === text(bound.descriptionEn)
          && text(originalRow.title) === text(input.title) && text(originalRow.description) === text(input.description)
          && sha(originalRow.aiApprovedAssetSha256) === receipt.reviewedAsset.sha256
          && sha(originalRow.assetSha256) === receipt.reviewedAsset.sha256, 'Original B row/context/image bindings contradict')
        const tags = input.dimensionTags === undefined ? {} : record(input.dimensionTags)
        native = { landscapeId: receipt.context.landscapeId, goalId: receipt.context.goalId, subject: receipt.context.subject,
          title: suppliedString(input.title), description: suppliedString(input.description), assetSha256: 'sha256:' + receipt.reviewedAsset.sha256,
          ...(input.titleEn ? { titleEn: suppliedString(input.titleEn) } : {}), ...(input.descriptionEn ? { descriptionEn: suppliedString(input.descriptionEn) } : {}),
          ...(tags.demandLevel ? { demandLevel: suppliedString(tags.demandLevel) } : {}) }
        decision = originalRow.aiApproved; reviewedAt = originalRow.aiReviewedAt; reviewer = originalRow.aiReviewer
        reason = originalRow.aiNotes; assetPath = receipt.reviewedAsset.path
      }
      requireValue(typeof native.title === 'string' && text(native.title) && typeof native.description === 'string' && text(native.description), 'Original complete reviewed text is missing')
      requireValue(sameContext(receipt.context, native) && Object.keys(receipt.context).sort().join(',') === Object.keys(native).sort().join(','), 'Receipt context is not the actual original reviewed context')
      requireValue(receipt.originalDecision === decision && receipt.reviewedAt === reviewedAt && receipt.reviewer === reviewer
        && receipt.originalReason === reason, 'Original decision/reviewer/time/reason differs')
      const historicalPrefix = '/home/enpasos/projects/skillpilot/'
      if (typeof assetPath === 'string' && assetPath.startsWith(historicalPrefix)) assetPath = assetPath.slice(historicalPrefix.length)
      requireValue(safePath(assetPath) === receipt.reviewedAsset.path && hash(assetRaw) === sha(native.assetSha256), 'Original viewed asset path/bytes differ')
      if (!sameContext(native, current)) return { ok: false, status: 'stale', issues: ['Current goal/image context differs from the original actually reviewed context'] }
      requireValue(current.imageUrl.startsWith('/assets/goal-visualizations/')
        && current.publicAssetPath === 'app/public' + current.imageUrl
        && current.canonicalAssetPath === 'curricula/DE/Gymnasium/visualizations/' + current.imageUrl.slice('/assets/goal-visualizations/'.length),
      'Current primary asset paths differ')
      requireValue(hash(currentBytes(current.publicAssetPath)) === sha(native.assetSha256)
        && hash(currentBytes(current.canonicalAssetPath)) === sha(native.assetSha256), 'Current actual image bytes differ')
      const capability = Object.freeze({ context: Object.freeze({ ...native }), receiptSha256: ref.sha256, originalReviewSha256: receipt.originalReview.sha256 })
      capabilities.add(capability)
      return { ok: true, capability }
    } catch (error) { return { ok: false, status: 'invalid', issues: [error instanceof Error ? error.message : String(error)] } }
  }
}
