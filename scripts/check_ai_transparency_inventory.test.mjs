import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Run the actual scanner in an isolated repository-shaped fixture. Synthetic
// container markers exercise only the documented shallow scan, not C2PA validity.
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skillpilot-ai-inventory-test-'))
const inventoryPath = 'docs/legal/ai-transparency-inventory.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/fixture.json'
const deckPath = 'curricula/DE/Gymnasium/memory-decks/fixture.json'
const fixtureScript = path.join(fixtureRoot, 'scripts/check_ai_transparency_inventory.mjs')
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex')
function write(relativePath, content) {
  const file = path.join(fixtureRoot, relativePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}
function json(relativePath, content) {
  write(relativePath, `${JSON.stringify(content, null, 2)}\n`)
}
function copies(url, content) {
  write(`app/public${url}`, content)
  write(`backend/src/main/resources/static${url}`, content)
}
function check(...args) {
  return spawnSync(process.execPath, [fixtureScript, ...args], { encoding: 'utf8' })
}
function assertPass(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout)
}
function assertBlocked(result, label) {
  assert.equal(result.status, 1, result.stderr || result.stdout)
  assert.ok(result.stderr.includes(label), result.stderr)
  assert.ok(!result.stdout.includes('*** Begin Patch'), 'No partial patch on failure')
}
function patchInventory() {
  const before = fs.readFileSync(path.join(fixtureRoot, inventoryPath), 'utf8')
  const result = check('--emit-layer-a-patch')
  assertPass(result)
  assert.equal(fs.readFileSync(path.join(fixtureRoot, inventoryPath), 'utf8'), before,
    'Patch emission must not mutate the inventory')
  const lines = result.stdout.trimEnd().split('\n')
  assert.equal(lines[0], '*** Begin Patch')
  assert.equal(lines[1], `*** Update File: ${inventoryPath}`)
  assert.equal(lines[2], '@@')
  assert.equal(lines.at(-1), '*** End Patch')
  const removed = lines.filter((line) => line.startsWith('-')).map((line) => line.slice(1))
  assert.equal(`${removed.join('\n')}\n`, before, 'Patch leases exact current bytes')
  const added = lines.filter((line) => line.startsWith('+')).map((line) => line.slice(1))
  return JSON.parse(added.join('\n'))
}

try {
  write('scripts/check_ai_transparency_inventory.mjs', fs.readFileSync(
    new URL('./check_ai_transparency_inventory.mjs', import.meta.url),
  ))
  for (const directory of ['docs/whitepaper', 'app/public/whitepaper',
    'app/public/audio', 'backend/src/main/resources/static/audio']) {
    fs.mkdirSync(path.join(fixtureRoot, directory), { recursive: true })
  }
  const jpg = '/assets/goal-visualizations/physik/a/a.jpg'
  const png = '/assets/goal-visualizations/physik/b/b.png'
  const replacement = '/assets/goal-visualizations/physik/a/a.png'
  const goals = [
    { id: 'a', resourceLinks: [{ type: 'goal-visualization', url: jpg, provider: 'Nano Banana Pro' }] },
    { id: 'b', resourceLinks: [{ type: 'goal-visualization', url: png, provider: 'Native SVG' }] },
  ]
  copies(jpg, 'synthetic JPEG c2pa jumb markers')
  copies(png, 'synthetic PNG without provenance marker')
  json(canonicalPath, { goals })
  json(deckPath, { cards: [{ id: 'same-card', lang: 'de' }, { id: 'same-card', lang: 'en' }] })
  const narrativePath = 'docs/comic/fixed.png'
  const narrativeBytes = 'unchanged non-Layer-A illustration'
  write(narrativePath, narrativeBytes)
  const inventory = {
    schemaVersion: 1,
    snapshot: { asOf: 'fixed-date', sourceRevision: 'fixed-revision', policy: 'Intentional update only' },
    artifactClasses: {
      goalVisualizations: {
        canonicalLandscapeFiles: 1, canonicalGoalCount: 2, count: 2,
        fileExtensions: { jpg: 1, png: 1 },
        providerCounts: { 'Nano Banana Pro': 1, 'Native SVG': 1 },
        c2paStructure: {
          method: 'Shallow markers only', detected: 1, notDetectedUrls: [png],
          cryptographicallyValidated: false, complianceConclusion: 'Not a verified credential',
        },
      },
      canonicalLearningContent: {
        memoryDeckFiles: 1, cardRecords: 2, uniqueCardIds: 1,
        humanReviewPolicy: 'No inventory-derived human approval',
      },
      narrativeIllustrations: { collections: [{
        id: 'fixed', sourceDir: 'docs/comic', sourceFiles: ['fixed.png'],
        sourceDigestSha256: sha(`${narrativePath}\0${sha(narrativeBytes)}\n`),
        runtimeFiles: [], runtimeDigestSha256: sha(''),
      }] },
      whitepaperRasterFigures: { sourceDir: 'docs/whitepaper', runtimeDir: 'app/public/whitepaper', sourceFiles: [] },
      podcastAudio: { provenanceStatus: 'Unchanged audio claim', files: [] },
      providerHostedCoach: { currentProductionReference: 'Frozen provider contract value' },
    },
  }
  json(inventoryPath, inventory)
  assertPass(check())

  // Same active link count, but JPG -> PNG, provider and marker changes: the
  // precise four-field deployment regression, including a retained old JPG.
  goals[0].resourceLinks[0] = { type: 'goal-visualization', url: replacement, provider: 'Native SVG' }
  copies(replacement, 'synthetic replacement PNG without provenance marker')
  json(canonicalPath, { goals })
  const stale = check()
  assert.equal(stale.status, 1)
  for (const label of ['fileExtensions', 'providerCounts', 'c2paStructure.detected', 'c2paStructure.notDetectedUrls']) {
    assert.ok(stale.stderr.includes(`goalVisualizations.${label}:`), stale.stderr)
  }
  assert.ok(stale.stderr.includes('4 issue(s)'), stale.stderr)
  const updated = patchInventory()
  const expected = structuredClone(inventory)
  Object.assign(expected.artifactClasses.goalVisualizations, {
    fileExtensions: { png: 2 }, providerCounts: { 'Native SVG': 2 },
  })
  Object.assign(expected.artifactClasses.goalVisualizations.c2paStructure, {
    detected: 0, notDetectedUrls: [replacement, png],
  })
  assert.deepEqual(updated, expected, 'Only measured drift fields change; every policy/claim/hash stays identical')
  json(inventoryPath, updated)
  assertPass(check())
  const noop = check('--emit-layer-a-patch')
  assertPass(noop)
  assert.equal(noop.stdout, '*** Begin Patch\n*** End Patch\n', 'Refresh is idempotent')

  // Intentional Layer-A refresh covers current counts as well as format changes.
  goals.push({ id: 'new-goal' })
  json(canonicalPath, { goals })
  json(deckPath, { cards: [{ id: 'new-card' }] })
  const counts = patchInventory()
  assert.equal(counts.artifactClasses.goalVisualizations.canonicalGoalCount, 3)
  assert.equal(counts.artifactClasses.goalVisualizations.count, 2)
  assert.equal(counts.artifactClasses.canonicalLearningContent.cardRecords, 1)
  assert.equal(counts.artifactClasses.canonicalLearningContent.uniqueCardIds, 1)
  json(inventoryPath, counts)
  assertPass(check())

  write(`backend/src/main/resources/static${replacement}`, 'different bytes')
  assertBlocked(check(), 'frontend and backend copies differ')
  assertBlocked(check('--emit-layer-a-patch'), 'frontend and backend copies differ')
  fs.unlinkSync(path.join(fixtureRoot, `backend/src/main/resources/static${replacement}`))
  assertBlocked(check('--emit-layer-a-patch'), 'expected a file')
  copies(replacement, 'synthetic replacement PNG without provenance marker')
  write(narrativePath, 'unauthorized changed fixed media')
  assertBlocked(check('--emit-layer-a-patch'), 'narrativeIllustrations.fixed.sourceDigestSha256')
  write(narrativePath, narrativeBytes)
  counts.schemaVersion = 2
  json(inventoryPath, counts)
  assertBlocked(check('--emit-layer-a-patch'), 'schemaVersion: expected 1')
  assert.equal(check('--write').status, 2, 'No implicit write/unknown-option mode')
  console.log('AI transparency inventory regression PASS: active-link JPG/PNG/provider/C2PA drift, count refresh, exact patch lease, no-op, unchanged claims, copy/hash/schema fail-closed checks.')
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
}
