import test from 'node:test'
import assert from 'node:assert/strict'
import { canonicalInventory, checkPublicLinks, loadPackages, validateCatalog, validatePackage, validatePublicUrl } from './validate_content_packages.mjs'

const packages = loadPackages()
const goals = canonicalInventory().goalIds

test('pilot maps four existing goals without importing curriculum or learner state', () => {
  assert.equal(packages.length, 1)
  assert.equal(packages[0].materials.length, 4)
  assert.equal(new Set(packages[0].materials.flatMap((material) => material.goalIds)).size, 4)
  assert.equal(packages[0].aiUsage, 'link-only')
})

test('provider and subject do not create runtime schema variants', () => {
  const another = structuredClone(packages[0])
  another.packageId = 'another-independent-provider'
  another.provider = { name: 'Other provider', url: 'https://example.org/', relationship: 'independent-mapping' }
  for (const material of another.materials) {
    const url = new URL(material.url)
    material.url = `https://example.org${url.pathname}${url.hash}`
  }
  const mathId = canonicalInventory().links.find((link) => link.file.includes('MATHEMATIK')).goalId
  another.materials[0].goalIds = [mathId]
  assert.equal(validatePackage(another, goals), another)
})

test('unknown goals, duplicate mappings and private/free-text additions fail closed', () => {
  for (const mutate of [
    (pkg) => { pkg.materials[0].goalIds = ['not-a-goal'] },
    (pkg) => { pkg.materials[0].goalIds.push(pkg.materials[0].goalIds[0]) },
    (pkg) => { pkg.skillpilotId = 'private-id' },
    (pkg) => { pkg.materials[0].transcript = 'private chat' },
    (pkg) => { pkg.aiUsage = 'read-all-content' },
    (pkg) => { pkg.provider.relationship = 'official-partner' },
    (pkg) => { delete pkg.packageId },
    (pkg) => { delete pkg.materials[0].id },
  ]) {
    const fixture = structuredClone(packages[0])
    mutate(fixture)
    assert.throws(() => validatePackage(fixture, goals))
  }
})

test('package and material can be withdrawn independently', () => {
  const fixture = structuredClone(packages[0])
  fixture.status = 'inactive'
  fixture.materials[0].status = 'inactive'
  assert.doesNotThrow(() => validatePackage(fixture, goals))
})

test('only uncredentialed HTTPS links without query identifiers are accepted', () => {
  for (const url of ['http://example.org/', 'javascript:alert(1)', 'https://user:secret@example.org/',
    'https://example.org/?skillpilotId=abc', 'https://localhost/', 'https://127.0.0.1/',
    'https://[::1]/', 'https://example.org:8443/', 'https://example.org:443/',
    'https://example.org/?', ' https://example.org/', 'https://example.org/a b',
    'https://example.org/%not-encoded', 'https://example.org/a\\b', 'https://-invalid.example/',
    'https://example.org/\nprivate', 'https://example.org/#a#b']) assert.throws(() => validatePublicUrl(url), url)
  assert.doesNotThrow(() => validatePublicUrl('https://example.org/chapter.html#section'))
})

test('catalog path and package count match the bounded Java runtime loader', () => {
  assert.doesNotThrow(() => validateCatalog({ schemaVersion: 1, packages: [] }))
  const twenty = Array.from({ length: 20 }, (_, index) => `provider-${index}/1.0.0/package.json`)
  assert.doesNotThrow(() => validateCatalog({ schemaVersion: 1, packages: twenty }))
  assert.throws(() => validateCatalog({ schemaVersion: 1, packages: [...twenty, 'extra/1.0.0/package.json'] }))
  for (const relative of ['../package.json', 'provider/package.json', 'provider/v1/package.json',
    'provider/1.0.0/other.json', 'provider/1.0.0/package.json/extra', '/provider/1.0.0/package.json']) {
    assert.throws(() => validateCatalog({ schemaVersion: 1, packages: [relative] }), relative)
  }
  assert.throws(() => validateCatalog({ schemaVersion: 1, packages: [twenty[0], twenty[0]] }))
})

test('authoring does not approve metadata rejected by runtime catalog validation', () => {
  for (const mutate of [
    (pkg) => { pkg.materials[0].url = 'https://different-provider.example/lesson' },
    (pkg) => { pkg.materials[0].resourceType = 'video' },
    (pkg) => { pkg.materials[0].resourceType = 'book' },
    (pkg) => { pkg.materials[0].resourceType = 'tool' },
    (pkg) => { pkg.materials[0].resourceType = 'notes' },
    (pkg) => { pkg.title = 't'.repeat(201) },
    (pkg) => { pkg.titleEn = 't'.repeat(201) },
    (pkg) => { pkg.description = 'd'.repeat(1001) },
    (pkg) => { pkg.descriptionEn = 'd'.repeat(1001) },
    (pkg) => { pkg.provider.name = 'p'.repeat(201) },
    (pkg) => { pkg.materials[0].title = 't'.repeat(301) },
    (pkg) => { pkg.materials[0].titleEn = 't'.repeat(301) },
    (pkg) => { pkg.materials[0].sections = ['s'.repeat(301)] },
    (pkg) => { pkg.materials[0].sections = Array.from({ length: 21 }, () => 'Section') },
    (pkg) => { pkg.materials[0].review.checkedAt = '2026-02-30' },
    (pkg) => { pkg.materials[0].review.rationale = 'r'.repeat(2001) },
    (pkg) => { pkg.materials[0].title = 'Title\nWith control characters' },
    (pkg) => { pkg.materials[0].review.rationale = 'Review\u202ehidden direction' },
  ]) {
    const fixture = structuredClone(packages[0])
    mutate(fixture)
    assert.throws(() => validatePackage(fixture, goals))
  }
  const fixture = structuredClone(packages[0])
  const maximum = Array.from({ length: 64 }, (_, index) => `goal-${index}`)
  const syntheticGoals = new Set([...goals, ...maximum, 'goal-extra'])
  fixture.materials[0].goalIds = maximum
  assert.doesNotThrow(() => validatePackage(fixture, syntheticGoals))
  fixture.materials[0].goalIds.push('goal-extra')
  assert.throws(() => validatePackage(fixture, syntheticGoals), /goalIds: invalid array/)
})

test('runtime-supported empty collections and optional localized labels remain valid', () => {
  const fixture = structuredClone(packages[0])
  delete fixture.titleEn
  fixture.descriptionEn = null
  fixture.materials[0].titleEn = 'Optional English label'
  fixture.materials[0].sections = []
  fixture.materials[0].resourceType = 'simulation'
  fixture.materials[0].review.checkedAt = '2024-02-29'
  assert.doesNotThrow(() => validatePackage(fixture, goals))
  fixture.materials = []
  assert.doesNotThrow(() => validatePackage(fixture, goals))
})

test('optional authoring link check validates HTML anchors and does not fetch per learner', async () => {
  let count = 0
  const pkg = structuredClone(packages[0])
  pkg.materials = [pkg.materials[0], { ...pkg.materials[0], id: 'second-reference' }]
  const fetched = await checkPublicLinks([pkg], async () => {
    count++
    return new Response('<h2 id="motion-analysis">Section</h2>', { headers: { 'content-type': 'text/html' } })
  })
  assert.equal(count, 1)
  assert.equal(fetched, 1)
  await assert.rejects(() => checkPublicLinks([pkg], async () =>
    new Response('<h2 id="other">Changed page</h2>', { headers: { 'content-type': 'text/html' } })), /missing anchor/)
  await assert.rejects(() => checkPublicLinks([pkg], async () =>
    new Response('Not found', { status: 404 })), /HTTP 404/)
})
