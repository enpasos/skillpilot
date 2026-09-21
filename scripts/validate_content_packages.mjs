import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const text = (value, label, max = 2000) => assert(
  typeof value === 'string' && value.trim().length > 0 && value.length <= max
    && !/[\p{Cc}\p{Cf}]/u.test(value),
  `${label}: expected nonempty text of at most ${max} characters`,
)
const optionalText = (value, label, max) => {
  if (value != null) text(value, label, max)
}
const keys = (value, allowed, label) => {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label}: expected object`)
  for (const key of Object.keys(value)) assert(allowed.includes(key), `${label}: unsupported field ${key}`)
}
const array = (value, label, max = 1000, min = 0) => assert(
  Array.isArray(value) && value.length >= min && value.length <= max, `${label}: invalid array`,
)
const status = (value, label) => assert(['active', 'inactive'].includes(value), `${label}: invalid status`)

export function validatePublicUrl(value) {
  text(value, 'URL', 2048)
  // Match ContentCatalog's Java URI checks, not WHATWG's permissive normalization
  // (which would silently strip an explicit :443, whitespace or an empty query).
  assert(value === value.trim() && value.startsWith('https://')
    && !/[\\ <>^`{|}"\[\]]/.test(value) && !/%(?![a-f\d]{2})/i.test(value),
  'URL: expected a static HTTPS URI')
  const authority = value.slice('https://'.length).split(/[/?#]/, 1)[0]
  assert(/^[a-z\d-]+(?:\.[a-z\d-]+)+$/i.test(authority)
    && authority.split('.').every((label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label)),
  'URL: invalid public authority or explicit port')
  assert(!value.split('#', 1)[0].includes('?') && value.split('#').length <= 2,
    'URL: query identifiers and malformed fragments are not permitted')
  const url = new URL(value)
  assert(url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.port,
    'URL: expected HTTPS public link without credentials, query or custom port')
  assert(/^[a-z\d-]+(?:\.[a-z\d-]+)+$/i.test(url.hostname)
    && !url.hostname.endsWith('.localhost') && !url.hostname.endsWith('.local')
    && !/^\d+(?:\.\d+){3}$/.test(url.hostname), 'URL: expected public DNS hostname')
  return url
}

function validateProvider(provider) {
  keys(provider, ['name', 'url', 'relationship'], 'provider')
  text(provider.name, 'provider.name', 200)
  const url = validatePublicUrl(provider.url)
  assert.equal(provider.relationship, 'independent-mapping', 'No implicit provider endorsement')
  return url
}

export function validatePackage(pkg, goalIds) {
  keys(pkg, ['schemaVersion', 'packageId', 'version', 'title', 'titleEn', 'description',
    'descriptionEn', 'provider', 'curator', 'access', 'aiUsage', 'status', 'materials'], 'package')
  assert.equal(pkg.schemaVersion, 1, 'package schema version')
  text(pkg.packageId, 'packageId', 80)
  assert(/^[a-z\d][a-z\d-]{0,79}$/.test(pkg.packageId), 'packageId: invalid identifier')
  assert(/^\d+\.\d+\.\d+$/.test(pkg.version), 'version: expected x.y.z')
  text(pkg.title, 'title', 200)
  optionalText(pkg.titleEn, 'titleEn', 200)
  text(pkg.description, 'description', 1000)
  optionalText(pkg.descriptionEn, 'descriptionEn', 1000)
  const providerUrl = validateProvider(pkg.provider)
  if (pkg.curator != null) {
    keys(pkg.curator, ['name', 'url'], 'curator')
    text(pkg.curator.name, 'curator.name', 200)
    validatePublicUrl(pkg.curator.url)
  }
  assert.equal(pkg.access, 'public-link', 'Only public links in pilot')
  assert.equal(pkg.aiUsage, 'link-only', 'No content access authorization in pilot')
  status(pkg.status, 'package')
  array(pkg.materials, 'materials')
  const seen = new Set()
  for (const material of pkg.materials) {
    keys(material, ['id', 'title', 'titleEn', 'url', 'resourceType', 'language', 'status', 'goalIds',
      'sections', 'review', 'provider'], 'material')
    text(material.id, 'material.id', 80)
    assert(/^[a-z\d][a-z\d-]{0,79}$/.test(material.id), 'material.id: invalid identifier')
    assert(!seen.has(material.id), `Duplicate material ${material.id}`)
    seen.add(material.id)
    text(material.title, 'material.title', 300)
    optionalText(material.titleEn, 'material.titleEn', 300)
    const materialUrl = validatePublicUrl(material.url)
    const effectiveProviderUrl = material.provider == null ? providerUrl : validateProvider(material.provider)
    assert.equal(materialUrl.hostname, effectiveProviderUrl.hostname, 'Material link outside declared provider')
    assert(['article', 'simulation'].includes(material.resourceType),
      'Unsupported material kind')
    assert(/^[a-z]{2}(?:-[A-Z]{2})?$/.test(material.language), 'Invalid material language')
    status(material.status, 'material')
    array(material.goalIds, 'goalIds', 64, 1)
    assert.equal(new Set(material.goalIds).size, material.goalIds.length, 'Duplicate goal mapping')
    for (const id of material.goalIds) {
      assert(typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(id), 'Invalid goal reference')
      assert(goalIds.has(id), `Unknown canonical goal ${id}`)
    }
    array(material.sections, 'sections', 20)
    for (const section of material.sections) text(section, 'section', 300)
    keys(material.review, ['checkedAt', 'authority', 'rationale'], 'review')
    assert(typeof material.review.checkedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(material.review.checkedAt)
      && !Number.isNaN(Date.parse(material.review.checkedAt))
      && new Date(material.review.checkedAt).toISOString().slice(0, 10) === material.review.checkedAt,
    'Invalid review date')
    assert(['ai', 'human'].includes(material.review.authority), 'Invalid review authority')
    text(material.review.rationale, 'review.rationale')
  }
  return pkg
}

export function canonicalInventory(root = ROOT) {
  const directory = path.join(root, 'curricula/DE/Gymnasium/canonical')
  const goalIds = new Set()
  const links = []
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.json')).sort()) {
    for (const goal of JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')).goals ?? []) {
      goalIds.add(goal.id)
      for (const link of goal.resourceLinks ?? []) {
        const category = link.type === 'goal-visualization' ? 'owned-visualization'
          : link.type === 'curriculum' ? 'curriculum-evidence'
            : /^https?:\/\//.test(link.url ?? '') ? 'external-didactic-candidate' : 'needs-classification'
        links.push({ file, goalId: goal.id, goalTitle: goal.title, category, ...link })
      }
    }
  }
  return { goalIds, links }
}

export function loadPackages(root = ROOT) {
  const contentRoot = fs.realpathSync(path.join(root, 'content'))
  const catalog = JSON.parse(fs.readFileSync(path.join(contentRoot, 'catalog.json'), 'utf8'))
  validateCatalog(catalog)
  const goals = canonicalInventory(root).goalIds
  const seen = new Set()
  return catalog.packages.map((relative) => {
    const absolute = fs.realpathSync(path.resolve(contentRoot, relative))
    assert(absolute.startsWith(`${contentRoot}${path.sep}`), 'Package outside content root')
    const pkg = validatePackage(JSON.parse(fs.readFileSync(absolute, 'utf8')), goals)
    assert(!seen.has(pkg.packageId), `Multiple selected versions of ${pkg.packageId}`)
    seen.add(pkg.packageId)
    return pkg
  })
}

/** Same bounded packaged resource paths accepted by the runtime ContentCatalog. */
export function validateCatalog(catalog) {
  keys(catalog, ['schemaVersion', 'packages'], 'catalog')
  assert.equal(catalog.schemaVersion, 1)
  array(catalog.packages, 'catalog.packages', 20)
  assert.equal(new Set(catalog.packages).size, catalog.packages.length, 'Duplicate package path')
  for (const relative of catalog.packages) {
    assert(typeof relative === 'string'
      && /^[a-z\d-]+\/\d+\.\d+\.\d+\/package\.json$/.test(relative), 'Unsafe or unsupported package path')
  }
  return catalog
}

export async function checkPublicLinks(packages, fetcher = fetch) {
  const pages = new Map()
  for (const material of packages.flatMap((pkg) => pkg.materials)) {
    const url = validatePublicUrl(material.url)
    const fragment = decodeURIComponent(url.hash.slice(1))
    url.hash = ''
    if (!pages.has(url.href)) {
      const response = await fetcher(url.href, { signal: AbortSignal.timeout(15000), redirect: 'error' })
      assert(response.ok, `${url.href}: HTTP ${response.status}`)
      assert(response.headers.get('content-type')?.includes('text/html'), `${url.href}: not HTML`)
      pages.set(url.href, await response.text())
    }
    const html = pages.get(url.href)
    assert(!fragment || [...html.matchAll(/\bid=["']([^"']+)["']/g)].some((match) => match[1] === fragment),
      `${material.id}: missing anchor ${fragment}`)
  }
  return pages.size
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2)
  assert(args.every((arg) => ['--inventory', '--check-links'].includes(arg)), 'Unknown argument')
  const packages = loadPackages()
  if (args.includes('--inventory')) {
    const { links } = canonicalInventory()
    const counts = Object.fromEntries([...new Set(links.map((link) => link.category))].map((category) =>
      [category, links.filter((link) => link.category === category).length]))
    console.log(JSON.stringify({ scope: 'DE/Gymnasium/canonical', counts,
      externalDidacticCandidates: links.filter((link) => link.category === 'external-didactic-candidate') }, null, 2))
  }
  if (args.includes('--check-links')) console.log(`Checked ${await checkPublicLinks(packages)} external HTML pages and all mapped anchors`)
  console.log(`Content package validation passed: ${packages.length} package(s), ${packages.reduce((n, pkg) => n + pkg.materials.length, 0)} material(s)`)
}
