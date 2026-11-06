// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { createVisualizationContextVerifier, type VisualizationCurrentContext } from './goalVisualizationReviewedContext'

const root = resolve(import.meta.dirname, '../..')
const anchor = 'd99bd8db5d15e7eab4e49446312208fa1f09ca32'
const path = 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-diagram-b-qualification/qualification.candidate.json'
const raw = readFileSync(resolve(root, path)), hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const receipt = JSON.parse(raw.toString())
const verify = createVisualizationContextVerifier({ acceptedRepositoryCommit: anchor })
const ref = { path, sha256: hash(raw) }
const candidate = JSON.parse(readFileSync(resolve(root, receipt.originalInput.path), 'utf8'))
const source = JSON.parse(readFileSync(resolve(root, receipt.ownerSource.path), 'utf8'))
const original = source.goals.find((goal: any) => goal.id === receipt.context.goalId)
const context = (goal: any): VisualizationCurrentContext => {
  const primary = goal.resourceLinks.filter((link: any) => link.type === 'goal-visualization' && (!link.role || link.role === 'primary'))
  assert.equal(primary.length, 1)
  const imageUrl = primary[0].url
  return { landscapeId: source.landscapeId, goalId: goal.id, subject: 'mathematik', title: goal.title,
    description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
    demandLevel: goal.dimensionTags?.demandLevel, assetSha256: 'sha256:' + hash(readFileSync(resolve(root, 'app/public' + imageUrl))),
    imageUrl, publicAssetPath: 'app/public' + imageUrl,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length) }
}
const currentB = context(candidate)
assert.notEqual(candidate.description, original.description, 'The actual independent B review must exercise the changed text, not today\'s original A.')
assert.equal(verify(ref, currentB).ok, true, JSON.stringify(verify(ref, currentB)))
let negatives = 0
const denied = (reference: unknown, current = currentB, reason?: RegExp) => {
  const result = verify(reference, current)
  assert.equal(result.ok, false)
  if (!result.ok && reason) assert.match(result.issues.join(' '), reason)
  negatives++
}
denied(undefined, currentB, /Missing immutable/u)
denied(ref, context(original), /Current goal\/image context differs/u)
denied(ref, { ...currentB, description: currentB.description + ' Unreviewed extension.' }, /Current goal\/image context differs/u)
denied(ref, { ...currentB, descriptionEn: currentB.descriptionEn + ' Unreviewed extension.' }, /Current goal\/image context differs/u)
denied(ref, { ...currentB, assetSha256: 'sha256:' + '0'.repeat(64) }, /Current goal\/image context differs/u)
const scratch = mkdtempSync(resolve(root, 'qa-artifacts/ci-contract-audit/2026-11-06/v-b-context-temporary-test-'))
try {
  const changed = (mutate: (value: any) => void) => {
    const value = structuredClone(receipt)
    mutate(value)
    const bytes = Buffer.from(JSON.stringify(value)), output = resolve(scratch, 'changed.json')
    writeFileSync(output, bytes)
    return { path: relative(root, output), sha256: hash(bytes) }
  }
  denied(changed(value => { value.reviewer = 'invented-current-reviewer' }), currentB, /Original decision\/reviewer\/time\/reason differs/u)
  denied(changed(value => { value.reviewedAt = value.qualification.qualifiedAt }), currentB, /Original decision\/reviewer\/time\/reason differs/u)
  denied(changed(value => { value.originalReview = value.originalInput }), currentB, /Original review goal differs/u)
  denied(changed(value => { value.context.description = original.description }), context(original), /not the actual original reviewed context/u)
  denied(changed(value => { value.context.landscapeId = 'not-the-original-owner' }), currentB, /owner\/goal\/subject association/u)
} finally { rmSync(scratch, { recursive: true, force: true }) }
console.log(`Fresh B immutable context passed: actual d99/98bee/bdb6/55e0 review chain positive, ${negatives} negatives; original A and metadata-only historical approval remain unqualified.`)
