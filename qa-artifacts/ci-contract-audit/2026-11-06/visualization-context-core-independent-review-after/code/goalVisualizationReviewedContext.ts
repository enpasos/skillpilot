// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { normalizeGoalVisualizationSubject } from '../../scripts/goal_visualization_scope.mjs'

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
  reviewProfile: 'matrix-candidate-v1' | 'economics-native-v1'
  context: VisualizationReviewedContext
  originalReview: VisualizationReviewArtifact; originalInput: VisualizationReviewArtifact
  ownerSource: VisualizationReviewArtifact; reviewedAsset: VisualizationReviewArtifact
  originalDecision: 'keep' | 'KEEP'; reviewedAt: string; reviewer: string; originalReason: string
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
const requireValue = (value: unknown, message: string): void => { if (!value) throw new Error(message) }
const record = (value: unknown): Record<string, any> => {
  requireValue(!!value && typeof value === 'object' && !Array.isArray(value), 'Expected object')
  return value as Record<string, any>
}
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
// These versioned readers describe two existing canonical review families.
// A freely selected later source snapshot cannot grant a different namespace.
const reviewOwners = {
  'matrix-candidate-v1': { landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', subject: 'mathematik',
    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json' },
  'economics-native-v1': { landscapeId: '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', subject: 'wirtschaftswissenschaften',
    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' },
} as const
const sameContext = (left: VisualizationReviewedContext, right: VisualizationReviewedContext): boolean =>
  contextKeys.every(key => !(key in left) || (key === 'landscapeId' || key === 'goalId' || key === 'subject' || key === 'assetSha256'
    ? left[key] === right[key] : text(left[key]) === text(right[key])))

/** Capabilities cannot be manufactured by supplying a boolean or a copied digest. */
export const hasVerifiedVisualizationContext = (capability: unknown, current: VisualizationReviewedContext): boolean =>
  !!capability && typeof capability === 'object' && capabilities.has(capability)
  && sameContext((capability as VerifiedVisualizationContext).context, current)

export const createVisualizationContextVerifier = (options: { repositoryRoot?: string; acceptedRepositoryCommit?: string } = {}) => {
  const root = realpathSync(options.repositoryRoot ?? repoRoot)
  const git = (args: string[]): Buffer => {
    const result = spawnSync('git', ['--no-replace-objects', '-C', root, '--literal-pathspecs', ...args], { maxBuffer: 96 * 1024 * 1024 })
    requireValue(result.status === 0, 'Original Git evidence unavailable: ' + args[0])
    return Buffer.from(result.stdout)
  }
  const anchor = options.acceptedRepositoryCommit ?? git(['rev-parse', 'HEAD']).toString().trim()
  requireValue(/^[0-9a-f]{40}$/u.test(anchor), 'An exact external accepted repository commit is required')
  requireValue(git(['cat-file', '-t', anchor]).toString().trim() === 'commit', 'Accepted anchor is not a commit')
  const ancestry = new Set<string>()
  const safePath = (path: unknown): string => {
    requireValue(typeof path === 'string' && path && !isAbsolute(path) && !path.includes('\\') && !path.includes('\0')
      && path.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe visualization evidence path')
    return String(path)
  }
  return (reference: unknown, current: VisualizationCurrentContext): VisualizationContextValidation => {
    if (!reference) return { ok: false, status: 'missing', issues: ['Missing immutable reviewed-context receipt'] }
    try {
      const captures = new Map<string, Buffer>()
      const currentBytes = (path: string): Buffer => {
        path = safePath(path)
        if (!captures.has(path)) {
          const absolute = realpathSync(resolve(root, path)), local = relative(root, absolute)
          requireValue(local && !local.startsWith('../') && !isAbsolute(local), 'Evidence file escapes repository')
          captures.set(path, Buffer.from(readFileSync(absolute)))
        }
        return captures.get(path)!
      }
      const ref = record(reference)
      requireValue(Object.keys(ref).sort().join(',') === 'path,sha256' && /^[0-9a-f]{64}$/u.test(ref.sha256), 'Invalid context receipt reference')
      const receiptRaw = currentBytes(ref.path)
      requireValue(hash(receiptRaw) === ref.sha256, 'Context receipt byte hash differs')
      const parsed = parseVisualizationReviewJson(receiptRaw)
      requireValue(validateSchema(parsed), 'Closed context receipt schema failed: ' + ajv.errorsText(validateSchema.errors))
      const receipt = parsed as VisualizationContextQualification
      const artifact = (binding: VisualizationReviewArtifact, requireCurrentCopy = true): Buffer => {
        const path = safePath(binding.path)
        if (!ancestry.has(binding.gitCommit)) {
          const result = spawnSync('git', ['--no-replace-objects', '-C', root, 'merge-base', '--is-ancestor', binding.gitCommit, anchor])
          requireValue(result.status === 0, 'Original evidence commit is not in accepted history')
          ancestry.add(binding.gitCommit)
        }
        const entries = git(['ls-tree', '-z', binding.gitCommit, '--', path]).toString().split('\0').filter(Boolean)
        requireValue(entries.length === 1, 'Original evidence path is absent or ambiguous')
        const match = /^(100644|100755) blob ([0-9a-f]{40})\t(.+)$/u.exec(entries[0])
        requireValue(match && match[3] === path, 'Original evidence is not the exact regular Git file')
        const raw = git(['cat-file', 'blob', match![2]])
        requireValue(hash(raw) === binding.sha256, 'Original Git evidence hash differs')
        if (requireCurrentCopy) requireValue(hash(currentBytes(path)) === binding.sha256, 'Original input bytes changed')
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
      const originals = Array.isArray(source.goals) ? source.goals.filter((goal: any) => goal?.id === receipt.context.goalId) : []
      requireValue(originals.length === 1 && source.landscapeId === receipt.context.landscapeId
        && normalizeGoalVisualizationSubject(source.subject) === receipt.context.subject, 'Original owner/goal/subject association differs')
      requireValue(review.goalId === receipt.context.goalId, 'Original review goal differs')
      let native: VisualizationReviewedContext
      let decision: unknown, reviewedAt: unknown, reviewer: unknown, reason: unknown, assetPath: unknown
      if (receipt.reviewProfile === 'matrix-candidate-v1') {
        requireValue(review.schemaVersion === 1 && review.kind === 'independent-goal-visualization-candidate-review'
          && review.reviewAuthority === 'ai_candidate' && review.decision === 'keep'
          && Array.isArray(review.blockingFindings) && review.blockingFindings.length === 0
          && review.candidate?.actuallyViewed === true && review.scopeFit?.outcome === 'pass', 'Original matrix review is not an actual positive AI content review')
        requireValue(['path', 'gitCommit', 'sha256'].every(key =>
          receipt.originalInput[key as keyof VisualizationReviewArtifact] === receipt.originalReview[key as keyof VisualizationReviewArtifact]),
        'Matrix context must come from the original review itself')
        const snapshot = record(input.goalSnapshot)
        native = { landscapeId: source.landscapeId, goalId: review.goalId, subject: normalizeGoalVisualizationSubject(source.subject),
          title: snapshot.title, description: snapshot.description, assetSha256: 'sha256:' + sha(review.candidate.sha256),
          ...(snapshot.titleEn ? { titleEn: snapshot.titleEn } : {}), ...(snapshot.descriptionEn ? { descriptionEn: snapshot.descriptionEn } : {}),
          ...(snapshot.demandLevel ? { demandLevel: snapshot.demandLevel } : {}) }
        decision = review.decision; reviewedAt = review.reviewedAt; reviewer = review.reviewer; reason = review.scopeFit.evidenceDe; assetPath = review.candidate.path
      } else {
        requireValue(review.schemaVersion === 1 && review.decision === 'KEEP' && review.reviewer?.status === 'ai_candidate'
          && review.reviewer?.humanApproved === false && review.generationIsApproval === false
          && review.actualWholeDEENGoalRead === true && review.actualNativeBeforeMetadataAndDidacticPromptRead === true
          && Number.isInteger(review.actualWholeNative360680Views) && review.actualWholeNative360680Views > 0
          && review.nativeBeforeAndGenerationTechnicalBinding?.sourceBytesMatchPreservedOriginalGeneratedImage === true,
        'Original Economics review is not an actual positive AI content review')
        requireValue(review.nativeBeforeAndGenerationTechnicalBinding.nativeBeforeMetadataSha256 === receipt.originalInput.sha256,
          'Original review does not bind these exact original metadata bytes')
        requireValue(input.skillpilotId === review.goalId && review.nativeBeforeAndGenerationTechnicalBinding.goalId === review.goalId
          && normalizeGoalVisualizationSubject(input.subjectPath) === receipt.context.subject, 'Original input identity differs')
        requireValue(sha(review.actualViewedAsset?.sha256) === sha(review.nativeBeforeAndGenerationTechnicalBinding.originalSha256), 'Original reviewed asset bindings contradict')
        native = { landscapeId: source.landscapeId, goalId: review.goalId, subject: normalizeGoalVisualizationSubject(source.subject),
          title: input.title, description: input.description, assetSha256: 'sha256:' + sha(review.actualViewedAsset.sha256) }
        decision = review.decision; reviewedAt = review.actualCompletedAt; reviewer = review.reviewer.agentIdentity
        reason = review.actualGoalSpecificSubjectFormatAccessibilityAndPerspectiveReason; assetPath = review.actualViewedAsset.path
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
