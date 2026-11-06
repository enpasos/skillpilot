// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  createVisualizationContextVerifier, hasVerifiedVisualizationContext, parseVisualizationReviewJson,
  type VisualizationContextQualification, type VisualizationCurrentContext,
} from './goalVisualizationReviewedContext'

const root = resolve(import.meta.dirname, '../..')
const packet = resolve(root, 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-first-two-families')
const census = JSON.parse(readFileSync(resolve(packet, 'family-census.json'), 'utf8'))
const verify = createVisualizationContextVerifier({ acceptedRepositoryCommit: census.acceptedRepositoryCommit })
const sha = (raw: Buffer): string => createHash('sha256').update(raw).digest('hex')
const actualContext = (receipt: VisualizationContextQualification): VisualizationCurrentContext => {
  const name = receipt.context.subject === 'mathematik' ? 'MATHEMATIK' : 'WIRTSCHAFT'
  const source = JSON.parse(readFileSync(resolve(root, `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`), 'utf8'))
  const goal = source.goals.find((goal: any) => goal.id === receipt.context.goalId)
  assert.ok(goal)
  const primary = goal.resourceLinks.filter((link: any) => link.type === 'goal-visualization' && (!link.role || link.role === 'primary'))
  assert.equal(primary.length, 1)
  const imageUrl = primary[0].url
  const publicAssetPath = 'app/public' + imageUrl
  return { landscapeId: source.landscapeId, goalId: goal.id, subject: receipt.context.subject,
    title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
    demandLevel: goal.dimensionTags?.demandLevel, imageUrl, publicAssetPath,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length),
    assetSha256: 'sha256:' + sha(readFileSync(resolve(root, publicAssetPath))) }
}
const selected = census.candidateReceipts.map((entry: any) => ({ ref: { path: entry.path, sha256: entry.sha256 },
  receipt: JSON.parse(readFileSync(resolve(root, entry.path), 'utf8')) as VisualizationContextQualification }))
assert.equal(selected.length, 18, 'The real finite independently qualified family examples must be present.')
const matrix = selected.find((row: any) => row.receipt.reviewProfile === 'matrix-candidate-v1')!
const economics = selected.find((row: any) => row.receipt.reviewProfile === 'economics-native-v1')!

if (process.argv.includes('--private-original-byte-probe') || process.argv.includes('--private-current-asset-probe')) {
  const context = actualContext(matrix.receipt)
  if (process.argv.includes('--private-current-asset-probe')) context.assetSha256 = matrix.receipt.context.assetSha256
  const result = verify(matrix.ref, context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.issues.join(' '), process.argv.includes('--private-original-byte-probe')
    ? /Original input bytes changed/u : /Current actual image bytes differ/u)
  console.log('Actual private byte mutation correctly rejected.')
} else {
  let positives = 0, negatives = 0
  for (const { ref, receipt } of selected) {
    const current = actualContext(receipt), result = verify(ref, current)
    assert.equal(result.ok, true, JSON.stringify({ goalId: receipt.context.goalId, result }))
    if (result.ok) {
      assert.equal(hasVerifiedVisualizationContext(result.capability, current), true)
      assert.equal(Object.isFrozen(result.capability), true)
      assert.equal(Object.isFrozen(result.capability.context), true)
    }
    positives++
  }
  const current = actualContext(matrix.receipt)
  const deny = (reference: unknown, context = current, pattern?: RegExp) => {
    const result = verify(reference, context)
    assert.equal(result.ok, false)
    if (!result.ok && pattern) assert.match(result.issues.join(' '), pattern)
    negatives++
  }
  deny(undefined, current, /Missing immutable/u)
  deny({ verified: true, contextFingerprint: sha(Buffer.from(JSON.stringify(current))) }, current, /Invalid context receipt reference/u)
  deny({ ...matrix.ref, sha256: '0'.repeat(64) }, current, /receipt byte hash/u)
  for (const patch of [
    { description: current.description + ' Zusätzlich eine neue Leistung.' },
    { title: current.title + ' erweitert' },
    { descriptionEn: current.descriptionEn + ' Extra new skill.' },
    { demandLevel: 'AB1' },
    { landscapeId: current.landscapeId.toUpperCase() },
    { goalId: economics.receipt.context.goalId },
    { subject: 'wirtschaftswissenschaften' },
    { assetSha256: 'sha256:' + '0'.repeat(64) },
  ]) deny(matrix.ref, { ...current, ...patch }, /Current goal\/image context differs/u)
  const scratch = mkdtempSync(resolve(root, 'qa-artifacts/ci-contract-audit/2026-11-06/v-context-temporary-test-'))
  try {
    const edited = (mutate: (receipt: VisualizationContextQualification & Record<string, any>) => void) => {
      const receipt = structuredClone(matrix.receipt)
      mutate(receipt)
      const raw = Buffer.from(JSON.stringify(receipt)), path = resolve(scratch, 'qualification.json')
      writeFileSync(path, raw)
      return { path: relative(root, path), sha256: sha(raw) }
    }
    deny(edited(receipt => { receipt.verified = true }), current, /Closed context receipt schema/u)
    deny(edited(receipt => { receipt.context.description = current.description + ' Neue Leistung.' }), current, /actual original reviewed context/u)
    deny(edited(receipt => { receipt.reviewer = 'newly-copied-reviewer' }), current, /decision\/reviewer\/time\/reason/u)
    deny(edited(receipt => { receipt.originalInput = economics.receipt.originalReview }), current, /Matrix context must/u)
    deny(edited(receipt => { receipt.originalReview.sha256 = '0'.repeat(64) }), current, /Original Git evidence hash/u)
    deny(edited(receipt => { receipt.originalReview.gitCommit = '0'.repeat(40) }), current, /accepted history/u)
    deny(edited(receipt => { receipt.ownerSource.path = '../../outside.json' }), current, /Unsafe visualization evidence path/u)
    deny(edited(receipt => { receipt.originalReview.path = 'missing-original-review.json' }), current, /absent or ambiguous/u)
    deny(edited(receipt => { receipt.context.landscapeId = economics.receipt.context.landscapeId }), current, /owner\/goal\/subject association/u)
    deny(edited(receipt => { receipt.context.titleEn = 'Invented untranslated goal' }), current, /actual original reviewed context/u)
    const duplicate = resolve(scratch, 'duplicate.json')
    const raw = Buffer.from(JSON.stringify(matrix.receipt).replace('"schemaVersion":1', '"schemaVersion":1,"schemaVersion":1'))
    writeFileSync(duplicate, raw)
    deny({ path: relative(root, duplicate), sha256: sha(raw) }, current, /Duplicate JSON property/u)
    assert.throws(() => parseVisualizationReviewJson(Buffer.from('{"a":1,"\\u0061":2}')), /Duplicate JSON property/u)
    assert.equal(hasVerifiedVisualizationContext({ context: current, receiptSha256: matrix.ref.sha256, originalReviewSha256: matrix.receipt.originalReview.sha256 }, current), false)
    negatives += 2
    // Real path overlays alter only private copies; neither historical artifacts nor current images are written.
    for (const [flag, target, bytes] of [
      ['--private-original-byte-probe', matrix.receipt.originalReview.path, Buffer.from('{"fake":"generation is not review"}')],
      ['--private-current-asset-probe', current.publicAssetPath, Buffer.from('different image bytes')],
    ] as const) {
      const replacement = resolve(scratch, 'replacement.bin')
      writeFileSync(replacement, bytes)
      const result = spawnSync('bwrap', ['--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev',
        '--tmpfs', '/tmp',
        '--ro-bind', replacement, resolve(root, target), '--chdir', resolve(root, 'app'), '--', './node_modules/.bin/tsx', 'scripts/testGoalVisualizationReviewedContext.ts', flag], { encoding: 'utf8' })
      assert.equal(result.status, 0, result.stderr)
      negatives++
    }
  } finally { rmSync(scratch, { recursive: true, force: true }) }
  // Irrelevant scheduling/reference metadata does not become an undeclared whole-goal fingerprint.
  const extra = verify(matrix.ref, { ...current, requires: ['unrelated-reference'], weight: 99 } as VisualizationCurrentContext)
  assert.equal(extra.ok, true)
  // Economics originals bind DE only; today's EN text is not retrospectively claimed as reviewed.
  const econContext = actualContext(economics.receipt)
  assert.equal(verify(economics.ref, { ...econContext, descriptionEn: 'Not part of the original supplied DE-only context.' }).ok, true)
  console.log(`Immutable visualization-context core passed: ${positives} actual historical positives, ${negatives} negative controls, private-byte overlays and explicit DE/EN scope.`)
}
