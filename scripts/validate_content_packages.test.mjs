import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { canonicalInventory, checkPublicLinks, loadPackages, validateCatalog, validatePackage, validatePublicUrl } from './validate_content_packages.mjs'

const packages = loadPackages()
const goals = canonicalInventory().goalIds
const physics = packages.find((pkg) => pkg.packageId === 'physik-libre-gymnasium')
assert.ok(physics, 'active Physik Libre package remains available')

test('expanded package retains the deployed selection and the four pilot materials', () => {
  const pilot = JSON.parse(readFileSync(new URL('../content/physik-libre/1.0.0/package.json', import.meta.url)))
  const current = physics
  assert.equal(current.packageId, pilot.packageId, 'existing stored opt-in must remain valid')
  assert.notEqual(current.version, pilot.version, 'deployed package bytes must not be replaced in place')
  assert.ok(current.materials.length > pilot.materials.length)
  assert.equal(current.aiUsage, 'link-only')
  for (const old of pilot.materials) {
    const retained = current.materials.find((material) => material.id === old.id)
    assert.ok(retained, old.id)
    assert.equal(retained.url, old.url)
    assert.ok(old.goalIds.every((id) => retained.goalIds.includes(id)))
  }
})

test('expanded mappings stay within physics content goals and the resolver output limit', () => {
  const ledger = JSON.parse(readFileSync(new URL('../curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json', import.meta.url)))
  const contentGoals = new Set(ledger.decisions.filter((item) => item.semanticKind === 'curricularAtomic').map((item) => item.goalId))
  const goalUrls = new Map()
  for (const material of physics.materials) {
    for (const id of material.goalIds) {
      assert.ok(contentGoals.has(id), `not a current Physics content goal: ${id}`)
      const urls = goalUrls.get(id) ?? new Set()
      assert.ok(!urls.has(material.url), `duplicate material URL for ${id}`)
      urls.add(material.url)
      assert.ok(urls.size <= 4, `resolver would truncate materials for ${id}`)
      goalUrls.set(id, urls)
    }
  }
  for (const id of [
    '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd', // motion (retained pilot)
    'a6e48b88-51ed-5942-bdb8-8d2192652e0d', // charge
    '37b33812-d428-5953-852e-57a53a4347fe', // kinetic gas theory
    'd05a146f-7fcd-56ae-b9b9-b54203328579', // quantum well
  ]) assert.ok(goalUrls.has(id), `expanded topic missing: ${id}`)
})

test('provider and subject do not create runtime schema variants', () => {
  const another = structuredClone(physics)
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
    const fixture = structuredClone(physics)
    mutate(fixture)
    assert.throws(() => validatePackage(fixture, goals))
  }
})

test('package and material can be withdrawn independently', () => {
  const fixture = structuredClone(physics)
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
    const fixture = structuredClone(physics)
    mutate(fixture)
    assert.throws(() => validatePackage(fixture, goals))
  }
  const fixture = structuredClone(physics)
  const maximum = Array.from({ length: 64 }, (_, index) => `goal-${index}`)
  const syntheticGoals = new Set([...goals, ...maximum, 'goal-extra'])
  fixture.materials[0].goalIds = maximum
  assert.doesNotThrow(() => validatePackage(fixture, syntheticGoals))
  fixture.materials[0].goalIds.push('goal-extra')
  assert.throws(() => validatePackage(fixture, syntheticGoals), /goalIds: invalid array/)
})

test('runtime-supported empty collections and optional localized labels remain valid', () => {
  const fixture = structuredClone(physics)
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
  const pkg = structuredClone(physics)
  const material = pkg.materials.find((item) => item.id === 'motion-video-analysis')
  pkg.materials = [material, { ...material, id: 'second-reference' }]
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

test('one curated package may declare each material provider without weakening host binding', () => {
  const fixture = structuredClone(physics)
  fixture.packageId = 'independent-curator'
  fixture.curator = { name: 'Curator', url: 'https://curator.example/' }
  fixture.materials = fixture.materials.slice(0, 2).map((material, index) => ({
    ...material,
    url: `https://provider-${index}.example/activity`,
    provider: { name: `Provider ${index}`, url: `https://provider-${index}.example/`, relationship: 'independent-mapping' },
  }))
  assert.equal(validatePackage(fixture, goals), fixture)
  for (const mutate of [
    (pkg) => { delete pkg.materials[0].provider },
    (pkg) => { pkg.materials[0].provider = null },
    (pkg) => { pkg.materials[0].provider.url = pkg.curator.url },
    (pkg) => { pkg.materials[0].provider.url = 'https://elsewhere.example/' },
    (pkg) => { pkg.materials[0].provider.url += '?learnerId=private' },
    (pkg) => { pkg.materials[0].provider.url = 'http://provider-0.example/' },
    (pkg) => { pkg.materials[0].provider.url = 'https://user:secret@provider-0.example/' },
    (pkg) => { pkg.materials[0].provider.name = '' },
    (pkg) => { pkg.materials[0].provider.name = 'p'.repeat(201) },
    (pkg) => { pkg.materials[0].provider.relationship = 'official-partner' },
    (pkg) => { pkg.materials[0].provider.skillpilotId = 'private-id' },
    (pkg) => { pkg.materials[0].provider = [] },
    (pkg) => { pkg.materials[0].provider = {} },
    (pkg) => { pkg.materials[0].provider = false },
  ]) {
    const invalid = structuredClone(fixture)
    mutate(invalid)
    assert.throws(() => validatePackage(invalid, goals))
  }
  const legacy = structuredClone(physics)
  legacy.materials[0].provider = null
  assert.doesNotThrow(() => validatePackage(legacy, goals), 'null keeps the existing package-provider fallback')
})

test('curator metadata is optional and never replaces material provider validation', () => {
  const fixture = structuredClone(physics)
  fixture.curator = { name: 'enpasos', url: 'https://enpasos.com/' }
  assert.doesNotThrow(() => validatePackage(fixture, goals))
  for (const mutate of [
    (pkg) => { pkg.curator.name = '' },
    (pkg) => { pkg.curator.name = 'c'.repeat(201) },
    (pkg) => { pkg.curator.url = 'http://enpasos.com/' },
    (pkg) => { pkg.curator.url = 'https://enpasos.com/?learnerId=private' },
    (pkg) => { pkg.curator.skillpilotId = 'private' },
    (pkg) => { pkg.curator.relationship = 'official-partner' },
    (pkg) => { pkg.curator = [] },
    (pkg) => { pkg.curator = {} },
    (pkg) => { pkg.materials[0].url = pkg.curator.url },
  ]) {
    const invalid = structuredClone(fixture)
    mutate(invalid)
    assert.throws(() => validatePackage(invalid, goals))
  }
  fixture.curator = null
  assert.doesNotThrow(() => validatePackage(fixture, goals))
})

test('curated upper-secondary mathematics pilot stays optional and mapped only to math content goals', () => {
  const mathematics = packages.find((pkg) => pkg.packageId === 'enpasos-mathe-oberstufe')
  assert.ok(mathematics)
  assert.equal(mathematics.version, '1.0.0')
  assert.equal(mathematics.curator.name, 'enpasos')
  assert.notEqual(mathematics.provider.name, 'enpasos')
  assert.equal(mathematics.aiUsage, 'link-only')
  assert.ok(mathematics.materials.length >= 6)
  const ledger = JSON.parse(readFileSync(new URL('../curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json', import.meta.url)))
  const contentGoals = new Set(ledger.decisions.filter((item) => item.semanticKind === 'curricularAtomic').map((item) => item.goalId))
  const goalUrls = new Map()
  const hosts = mathematics.materials.map((material) => new URL(material.url).hostname)
  assert.equal(hosts.filter((host) => host === 'www.geogebra.org').length, 5)
  assert.equal(hosts.filter((host) => host === 'www.desmos.com').length, 1)
  for (const material of mathematics.materials) {
    assert.equal(material.resourceType, 'simulation')
    assert.equal(new URL((material.provider ?? mathematics.provider).url).hostname, new URL(material.url).hostname)
    for (const id of material.goalIds) {
      assert.ok(contentGoals.has(id), `not a current Math content goal: ${id}`)
      const urls = goalUrls.get(id) ?? new Set()
      assert.ok(!urls.has(material.url), `duplicate material URL for ${id}`)
      urls.add(material.url)
      assert.ok(urls.size <= 4, `resolver would truncate materials for ${id}`)
      goalUrls.set(id, urls)
    }
  }
})

test('authored PhET pilot uses four reviewed public simulations and fits the combined material limit', () => {
  // This records the selected authoring scope, not a runtime provider allowlist or
  // a license/permission claim inferred from a URL. No Studio or PhET-iO entry is selected.
  const expected = [
    {
      packageId: 'enpasos-mathe-oberstufe', subject: 'mathematik', materialCount: 7,
      simulations: {
        'phet-graphing-quadratics': 'https://phet.colorado.edu/sims/html/graphing-quadratics/latest/graphing-quadratics_de.html',
      },
    },
    {
      packageId: 'enpasos-physik', subject: 'physik', materialCount: 3,
      simulations: {
        'phet-forces-and-motion-basics': 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_de.html',
        'phet-circuit-construction-kit-dc': 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_de.html',
        'phet-energy-skate-park': 'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_de.html',
      },
    },
  ]
  for (const scope of expected) {
    const pkg = packages.find((item) => item.packageId === scope.packageId)
    assert.ok(pkg, scope.packageId)
    assert.equal(pkg.status, 'active')
    assert.equal(pkg.access, 'public-link')
    assert.equal(pkg.aiUsage, 'link-only')
    assert.equal(pkg.materials.length, scope.materialCount)
    assert.deepEqual(pkg.curator, { name: 'enpasos', url: 'https://github.com/enpasos' })
    const ledger = JSON.parse(readFileSync(new URL(
      `../curricula/DE/Gymnasium/quality/release-model/${scope.subject}.semantic-kinds.json`, import.meta.url)))
    const contentGoals = new Set(ledger.decisions
      .filter((item) => item.semanticKind === 'curricularAtomic' && goals.has(item.goalId))
      .map((item) => item.goalId))
    for (const material of pkg.materials) {
      for (const goalId of material.goalIds) {
        assert.ok(contentGoals.has(goalId), `${pkg.packageId}/${material.id}: not a current ${scope.subject} content goal`)
      }
    }
    const simulations = pkg.materials.filter((material) => new URL(material.url).hostname === 'phet.colorado.edu')
    assert.deepEqual(simulations.map((material) => material.id).sort(), Object.keys(scope.simulations).sort())
    for (const material of simulations) {
      assert.equal(material.url, scope.simulations[material.id])
      assert.equal(material.status, 'active')
      assert.equal(material.resourceType, 'simulation')
      assert.equal(material.language, 'de')
      assert.deepEqual(material.provider ?? pkg.provider, {
        name: 'PhET Interactive Simulations – University of Colorado Boulder',
        url: 'https://phet.colorado.edu/', relationship: 'independent-mapping',
      })
      assert.doesNotMatch(material.url, /studio|phet-io|register|registration|login|search/i)
      assert.equal(new URL(material.url).search, '')
      assert.equal(new URL(material.url).hash, '')
    }
  }

  // All active packages may be selected together, including Physik Libre. Count
  // actual material entries, as the runtime resolver limits those rather than URLs.
  const referencesByGoal = new Map()
  for (const pkg of packages.filter((item) => item.status === 'active')) {
    for (const material of pkg.materials.filter((item) => item.status === 'active')) {
      for (const goalId of material.goalIds) {
        const references = referencesByGoal.get(goalId) ?? []
        assert.ok(!references.includes(material.url), `duplicate selected material URL for ${goalId}`)
        references.push(material.url)
        assert.ok(references.length <= 4, `combined selected packages would truncate materials for ${goalId}`)
        referencesByGoal.set(goalId, references)
      }
    }
  }
})

test('authored LabXchange pilot keeps two direct English articles separate from their curator', () => {
  const pkg = packages.find((item) => item.packageId === 'enpasos-labxchange-physik')
  assert.ok(pkg)
  assert.equal(pkg.version, '1.0.0')
  assert.equal(pkg.status, 'active')
  assert.equal(pkg.access, 'public-link')
  assert.equal(pkg.aiUsage, 'link-only')
  assert.deepEqual(pkg.curator, { name: 'enpasos', url: 'https://github.com/enpasos' })
  assert.deepEqual(pkg.provider, {
    name: 'LabXchange / OpenStax', url: 'https://www.labxchange.org/', relationship: 'independent-mapping',
  })
  const expected = {
    'labxchange-kinetic-theory': {
      url: 'https://www.labxchange.org/library/items/lb:LabXchange:f862c35e-afbd-3c70-a08f-2a94684cd4c8:html:1',
      goalId: '37b33812-d428-5953-852e-57a53a4347fe',
    },
    'labxchange-refraction': {
      url: 'https://www.labxchange.org/library/items/lb:LabXchange:25a05b36-6e13-372a-9422-374c7c3f8292:html:1',
      goalId: '6a4c6042-052b-502b-a39a-0ed8941247ac',
    },
  }
  const ledger = JSON.parse(readFileSync(new URL(
    '../curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json', import.meta.url)))
  const contentGoals = new Set(ledger.decisions
    .filter((item) => item.semanticKind === 'curricularAtomic' && goals.has(item.goalId))
    .map((item) => item.goalId))
  assert.deepEqual(pkg.materials.map((material) => material.id).sort(), Object.keys(expected).sort())
  for (const material of pkg.materials) {
    assert.equal(material.url, expected[material.id].url)
    assert.deepEqual(material.goalIds, [expected[material.id].goalId])
    assert.ok(contentGoals.has(material.goalIds[0]), `${material.id}: not a current Physics content goal`)
    assert.equal(material.status, 'active')
    assert.equal(material.resourceType, 'article')
    assert.equal(material.language, 'en', 'English source articles must not be presented as German materials')
    assert.deepEqual(material.provider ?? pkg.provider, pkg.provider)
    assert.equal(new URL(material.url).search, '')
    assert.equal(new URL(material.url).hash, '')
  }
})

test('authored oPhysics pilot stays within the reviewed simulations and their actual physics scope', () => {
  const pkg = packages.find((item) => item.packageId === 'enpasos-ophysics')
  assert.ok(pkg)
  assert.equal(pkg.version, '1.0.0')
  assert.equal(pkg.status, 'active')
  assert.equal(pkg.access, 'public-link')
  assert.equal(pkg.aiUsage, 'link-only')
  assert.deepEqual(pkg.curator, { name: 'enpasos', url: 'https://github.com/enpasos' })
  assert.deepEqual(pkg.provider, {
    name: 'oPhysics – Tom Walsh', url: 'https://ophysics.com/', relationship: 'independent-mapping',
  })
  const expected = {
    'ophysics-double-slit': {
      url: 'https://ophysics.com/l4.html',
      goalIds: ['6270e558-d657-5363-a6b2-e49a032a453b', 'c64820e1-c0ee-4342-9225-f981650f0c52'],
    },
    'ophysics-hydrogen-energy-levels': {
      url: 'https://ophysics.com/m1.html', goalIds: ['d7244ce4-5409-58d1-a1b4-bfae35f391e1'],
    },
    'ophysics-electron-fields': {
      url: 'https://ophysics.com/em2a.html', goalIds: ['8c9394cb-f54a-508d-9750-4c49e31b3fa9'],
    },
  }
  const ledger = JSON.parse(readFileSync(new URL(
    '../curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json', import.meta.url)))
  const contentGoals = new Set(ledger.decisions
    .filter((item) => item.semanticKind === 'curricularAtomic' && goals.has(item.goalId))
    .map((item) => item.goalId))
  assert.deepEqual(pkg.materials.map((material) => material.id).sort(), Object.keys(expected).sort())
  for (const material of pkg.materials) {
    assert.equal(material.url, expected[material.id].url)
    assert.deepEqual(material.goalIds, expected[material.id].goalIds)
    for (const goalId of material.goalIds) {
      assert.ok(contentGoals.has(goalId), `${material.id}: not a current Physics content goal`)
    }
    assert.equal(material.status, 'active')
    assert.equal(material.resourceType, 'simulation')
    assert.equal(material.language, 'en')
    assert.deepEqual(material.provider ?? pkg.provider, pkg.provider)
    assert.equal(new URL(material.url).search, '')
    assert.equal(new URL(material.url).hash, '')
  }
  const mapped = new Set(pkg.materials.flatMap((material) => material.goalIds))
  assert.ok(!mapped.has('966782e5-690d-4fae-bbab-fa3fa30525c3'), 'Thomson setup is not the Fadenstrahlrohr experiment')
  assert.ok(!mapped.has('b1f00a6d-1a03-496c-b1bd-c1f2259f59a8'), 'energy-level animation does not model orbital probability')
})
