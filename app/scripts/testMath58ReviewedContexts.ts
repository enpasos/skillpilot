// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { closeSync, copyFileSync, existsSync, fsyncSync, linkSync, mkdirSync, mkdtempSync, openSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { createVisualizationContextVerifier, hasVerifiedVisualizationContext,
  type VisualizationContextReceiptReference, type VisualizationContextValidation,
  type VisualizationCurrentContext } from './goalVisualizationReviewedContext'
import { MATH58_PIN_PATH, MATH58_PIN_SHA256 } from './lib/goalVisualizationMath58Contexts'

// This test derives callers from current canonical goals and QA rows. The only
// history it uses is the same finite capsule available in a shallow CI checkout.
const repositoryRoot = resolve(import.meta.dirname, '../..')
const indexPath = 'contracts/goal-visualization-context/v1/qualified-context-index-math58-132-2026-11-07.candidate.json'
const indexSha256 = '441b710b8965f529c231f046bbde6ade4be17d2c0bd4a43baf46829ee0287803'
const legacyIndexPath = 'contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json'
const legacyIndexSha256 = '234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785'
const acceptedRepositoryCommit = '25a6f2164a81a7e6ae50db3557d20521fecf5124'
const sha = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
type JsonObject = Record<string, unknown>
const object = (value: unknown): JsonObject => {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value))
  return value as JsonObject
}
const rows = (value: unknown): JsonObject[] => {
  assert.ok(Array.isArray(value))
  return value.map(object)
}
const json = (path: string): JsonObject => object(JSON.parse(readFileSync(path, 'utf8')))
interface IndexRow { landscapeId: string; goalId: string; receipt: VisualizationContextReceiptReference }
const readIndex = (path: string, digest: string): IndexRow[] => {
  const raw = readFileSync(resolve(repositoryRoot, path))
  assert.equal(sha(raw), digest)
  return (JSON.parse(raw.toString('utf8')) as { rows: IndexRow[] }).rows
}
const index = readIndex(indexPath, indexSha256)
const legacy = readIndex(legacyIndexPath, legacyIndexSha256)
assert.equal(index.length, 132)
assert.equal(legacy.length, 74)
const legacyKeys = new Set(legacy.map(row => `${row.landscapeId}:${row.goalId}`))
assert.deepEqual(index.filter(row => legacyKeys.has(`${row.landscapeId}:${row.goalId}`)), legacy,
  'The original 74 receipt references must stay exact and in their original order.')
const additions = index.filter(row => !legacyKeys.has(`${row.landscapeId}:${row.goalId}`))
assert.equal(additions.length, 58)

const currentContexts = new Map<string, VisualizationCurrentContext>()
interface QaRow { goalId: string; imageUrl: string; publicAssetPath: string; canonicalAssetPath: string; assetSha256: string }
for (const [subject, sourceName] of [['mathematik', 'MATHEMATIK'], ['wirtschaftswissenschaften', 'WIRTSCHAFT']]) {
  const source = json(resolve(repositoryRoot, `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${sourceName}.de.json`)) as unknown as SkillLandscape
  const qa = json(resolve(repositoryRoot, `curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`)) as unknown as { records: QaRow[] }
  for (const entry of index.filter(row => row.landscapeId === source.landscapeId)) {
    const goal = source.goals.find(goal => goal.id === entry.goalId) as (LearningGoal & { titleEn?: string; descriptionEn?: string }) | undefined
    const record = qa.records.find(row => row.goalId === entry.goalId)
    assert.ok(goal && record, entry.goalId)
    currentContexts.set(`${entry.landscapeId}:${entry.goalId}`, {
      landscapeId: source.landscapeId, goalId: goal.id, subject, title: goal.title, description: goal.description,
      ...(goal.titleEn ? { titleEn: goal.titleEn } : {}), ...(goal.descriptionEn ? { descriptionEn: goal.descriptionEn } : {}),
      ...(goal.dimensionTags?.demandLevel ? { demandLevel: goal.dimensionTags.demandLevel } : {}),
      imageUrl: record.imageUrl, publicAssetPath: record.publicAssetPath,
      canonicalAssetPath: record.canonicalAssetPath, assetSha256: record.assetSha256,
    })
  }
}
const currentFor = (row: IndexRow): VisualizationCurrentContext => {
  const current = currentContexts.get(`${row.landscapeId}:${row.goalId}`)
  assert.ok(current)
  return current
}

const temporary = mkdtempSync(resolve(tmpdir(), 'skillpilot-math58-reader-test-'))
const root = resolve(temporary, 'originals')
try {
  const materialized = spawnSync('python3', ['-B', resolve(repositoryRoot, 'scripts/visualization_qualified_context_capsule.py'), 'materialize',
    '--repository-root', repositoryRoot, '--accepted-commit', acceptedRepositoryCommit,
    '--accepted-census-sha256', indexSha256, '--census-path', indexPath,
    '--capsule', resolve(repositoryRoot, 'qa-artifacts/ci-contract-audit/2026-11-07/math58-active-integration/capsule-132'),
    '--accepted-capsule-sha256', 'bf797d97d48d3ebb436037cfcf487189e06455e9cf2120a4d385f7921b20b0bf',
    '--output', root, '--maximum-working-bytes', String(308 * 1024 * 1024),
    '--maximum-object-bytes', String(282 * 1024 * 1024), '--maximum-embedded-bytes', String(14 * 1024 * 1024)],
  { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 })
  assert.equal(materialized.status, 0, materialized.stderr || materialized.error?.message || materialized.stdout)
  // Legacy transport inventories historical inputs. Its current public asset
  // pairs are still read from the caller's repository by the real verifier.
  const ownCurrentAssets = new Map<string, string>()
  for (const current of currentContexts.values()) for (const path of [current.publicAssetPath, current.canonicalAssetPath]) {
    const expected = current.assetSha256.replace(/^sha256:/u, ''), destination = resolve(root, path)
    assert.equal(sha(readFileSync(resolve(repositoryRoot, path))), expected)
    if (!existsSync(destination)) {
      mkdirSync(dirname(destination), { recursive: true })
      const ownCopy = ownCurrentAssets.get(expected)
      if (ownCopy) linkSync(ownCopy, destination)
      else copyFileSync(resolve(repositoryRoot, path), destination)
    }
    assert.equal(sha(readFileSync(destination)), expected)
    ownCurrentAssets.set(expected, destination)
  }
  const verify = createVisualizationContextVerifier({ repositoryRoot: root, acceptedRepositoryCommit })
  const accepts = (row: IndexRow) => {
    const current = currentFor(row), result = verify(row.receipt, current)
    assert.equal(result.ok, true, JSON.stringify({ goalId: row.goalId, result }))
    if (!result.ok) throw new Error('Expected a native capability')
    assert.equal(hasVerifiedVisualizationContext(result.capability, current), true)
    assert.ok(Object.isFrozen(result.capability) && Object.isFrozen(result.capability.context))
    return result.capability
  }
  for (const row of legacy) accepts(row)
  for (const row of additions) {
    const capability = accepts(row)
    const receipt = json(resolve(root, row.receipt.path))
    assert.equal(capability.currentSupplementSha256, object(receipt.currentSupplement).sha256)
  }

  const entry = additions.find(row => row.goalId === 'b41cb496-dad5-596e-9c23-cdcbdab3ec2e')
  assert.ok(entry, 'Use a newly qualified goal for every current-context negative.')
  const current = currentFor(entry)
  let rejected = 0
  const denies = (name: string, result: VisualizationContextValidation, pattern?: RegExp) => {
    assert.equal(result.ok, false, name)
    if (result.ok) throw new Error(name + ' unexpectedly qualified')
    assert.ok(result.issues.length > 0, name)
    if (pattern) assert.match(result.issues.join(' '), pattern, name)
    rejected++
  }
  const inventedScalar: VisualizationCurrentContext & { level: number } = { ...current, level: 2 }
  for (const [name, changed] of [
    ['current DE description', { ...current, description: current.description + ' Neue Kompetenz.' }],
    ['current EN title', { ...current, titleEn: current.titleEn + ' changed' }],
    ['current demand', { ...current, demandLevel: 'AB9' }],
    ['current image', { ...current, assetSha256: 'sha256:' + '0'.repeat(64) }],
    ['invented scalar level', inventedScalar],
  ] as const) denies(name, verify(entry.receipt, changed), /Current goal\/image context differs|Math58 current DE\/EN\/demand\/level\/phase differs/u)
  denies('missing receipt', verify(undefined, current), /Missing immutable reviewed-context receipt/u)
  const nativeCapability = accepts(entry)
  for (const forged of [{ context: current }, { ...nativeCapability }, structuredClone(nativeCapability), Object.create(nativeCapability) as unknown]) {
    assert.equal(hasVerifiedVisualizationContext(forged, current), false)
  }
  assert.equal(hasVerifiedVisualizationContext(nativeCapability, { ...current, goalId: 'foreign-goal' }), false)
  assert.equal(rejected, 6)

  // Each forgery gets a new, correctly hashed receipt. Updating caller hashes
  // cannot change the separately pinned historical/current attribution.
  const receipt = json(resolve(root, entry.receipt.path))
  const writeJson = (path: string, value: unknown): VisualizationContextReceiptReference => {
    const raw = Buffer.from(JSON.stringify(value, null, 2) + '\n')
    mkdirSync(dirname(resolve(root, path)), { recursive: true })
    writeFileSync(resolve(root, path), raw, { flag: 'wx' })
    return { path, sha256: sha(raw) }
  }
  const negativePrefix = 'test-negative-receipts/'
  const receiptMutations: Array<[string, (value: JsonObject) => void]> = [
    ['original actor', value => { value.reviewer = 'invented' }],
    ['original time', value => { value.reviewedAt = '2026-11-07T00:00:00Z' }],
    ['original reason', value => { value.originalReason = 'invented' }],
    ['missing supplement', value => { delete value.currentSupplement }],
    ['invented original viewport', value => { value.originalViewport360 = true }],
    ['omitted EN title', value => { delete object(value.context).titleEn }],
    ['invented receipt level', value => { object(value.context).level = 2 }],
  ]
  for (const [name, change] of receiptMutations) {
    const forged = structuredClone(receipt)
    change(forged)
    denies(name, verify(writeJson(negativePrefix + name + '.json', forged), current))
  }
  const pins = json(resolve(root, MATH58_PIN_PATH))
  assert.equal(sha(readFileSync(resolve(root, MATH58_PIN_PATH))), MATH58_PIN_SHA256)
  const binding = rows(pins.goalBindings).find(row => row.goalId === entry.goalId)
  assert.ok(binding)
  const review = json(resolve(root, String(object(binding.currentReview).path)))
  const reviewMutations: Array<[string, (value: JsonObject) => void]> = [
    ['actor', value => { value.reviewer = 'invented' }],
    ['time', value => { value.reviewedAtActualUTC = '2025-01-01T00:00:00Z' }],
    ['viewport', value => { rows(value.currentViewportEvidence)[0].widthCSS = 361 }],
    ['actual sight', value => { rows(value.currentViewportEvidence)[0].actualViewed = false }],
    ['DE', value => { object(value.fullCurrentDE).description = 'invented' }],
    ['EN title', value => { object(value.fullCurrentEN).title = 'invented' }],
    ['demand', value => { value.currentDemandLevel = 'AB9' }],
    ['asset', value => { rows(value.currentAssets)[0].sha256 = '0'.repeat(64) }],
    ['human claim', value => { value.humanApproved = true }],
    ['self review', value => { value.imageAuthorIsReviewer = true }],
  ]
  for (const [name, change] of reviewMutations) {
    const forgedReview = structuredClone(review)
    const goal = rows(forgedReview.rows).find(row => row.goalId === entry.goalId)
    assert.ok(goal)
    change(goal)
    const forged = structuredClone(receipt)
    forged.currentSupplement = writeJson(negativePrefix + 'proof-' + name + '.json', forgedReview)
    denies('rebound current ' + name, verify(writeJson(negativePrefix + 'rebound-' + name + '.json', forged), current),
      /Math58 current supplement reference differs/u)
  }
  assert.equal(rejected, 6 + 17)

  // The mini-repository owns its immutable files. Rename and restore rather
  // than writing through a deduplicated read-only inode or changing the host.
  const withChangedBytes = (path: string, replacement: Buffer | undefined, action: () => void) => {
    const absolute = resolve(root, path), backup = absolute + '.test-original'
    renameSync(absolute, backup)
    try {
      if (replacement) {
        writeFileSync(absolute, replacement, { flag: 'wx' })
        const descriptor = openSync(absolute, 'r')
        try { fsyncSync(descriptor) } finally { closeSync(descriptor) }
      }
      action()
    } finally {
      rmSync(absolute, { force: true })
      renameSync(backup, absolute)
    }
  }
  const view = rows(binding.views)[0]
  const faults: Array<[string, JsonObject]> = [
    ['current review', object(binding.currentReview)], ['current input', object(binding.currentInput)],
    ['browser', object(binding.browser)], ['first time clarification', object(binding.firstTimeClarification)],
    ['screenshot', object(view.screenshot)], ['HTML', object(view.html)],
    ['source', object(pins.source)], ['renderer CSS', rows(pins.rendererReferences)[0]],
    ['pins', { path: MATH58_PIN_PATH }], ['contact pair', object(binding.contactSheet)],
  ]
  for (const [name, reference] of faults) {
    const path = String(reference.path), raw = readFileSync(resolve(root, path))
    withChangedBytes(path, Buffer.concat([raw, Buffer.from('\n')]), () =>
      denies('changed ' + name, verify(entry.receipt, current), /Bound current evidence bytes differ/u))
    accepts(entry)
  }
  withChangedBytes(String(object(binding.currentInput).path), undefined, () =>
    denies('missing current input', verify(entry.receipt, current), /ENOENT/u))
  accepts(entry)
  assert.equal(rejected, 6 + 17 + 11)
  console.log('Math58 portable reader: old74 unchanged + new58 native passes; 6 caller, 17 rebound-forgery, 11 actual-byte negatives; forged capabilities rejected.')
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
