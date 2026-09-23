import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'

/**
 * A quality hold must preserve the exact rejected image as evidence. A bare
 * Markdown decision is not sufficient to make a missing image documented.
 */
export const assertQualityDeferralEvidence = (
  reviewRoot: string,
  goalId: string,
  row: string,
): void => {
  const columns = row.match(
    /\|\s*`deferred_quality_review`\s*\|\s*`(sha256:[0-9a-f]{64})`\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\s*\|\s*$/u,
  )
  if (!columns) throw new Error(`${goalId}: quality deferral needs an exact SHA-256, archived original, and concrete finding`)

  const [, expectedHash, relativeArchivePath, finding] = columns
  if (!finding?.trim() || finding.trim().length < 20) {
    throw new Error(`${goalId}: quality deferral has no concrete finding`)
  }
  const normalizedPath = relativeArchivePath?.replaceAll('\\', '/') ?? ''
  if (!new RegExp(`^[a-z0-9][a-z0-9-]*/assets/${goalId}/${goalId}\\.(?:png|jpe?g|webp)$`, 'u').test(normalizedPath)) {
    throw new Error(`${goalId}: quality-deferral archive path does not identify the exact goal image`)
  }

  const absoluteRoot = resolve(reviewRoot)
  const absoluteAsset = resolve(absoluteRoot, normalizedPath)
  if (!absoluteAsset.startsWith(`${absoluteRoot}${sep}`) || !existsSync(absoluteAsset)) {
    throw new Error(`${goalId}: quality-deferral archived original is missing or outside the review root`)
  }
  const actualHash = `sha256:${createHash('sha256').update(readFileSync(absoluteAsset)).digest('hex')}`
  if (actualHash !== expectedHash) {
    throw new Error(`${goalId}: quality-deferral archived original does not match ${expectedHash}`)
  }
}
