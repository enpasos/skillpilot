const defaultBaseUrl = 'https://skillpilot.com'

const sourceRationaleAssetPattern = /\/assets\/goal-source-rationales-(math|physics)-public-[A-Za-z0-9_-]+\.json/gu
const legacySourceRationalePathPattern = /\/data\/goal-source-rationales-[A-Za-z0-9._-]+\.json/gu
const jsAssetPattern = /(?:src=|url:)"?\/?(assets\/[^"')]+\.js)/gu

interface RuntimePayloadConfig {
  id: 'math' | 'physics'
  label: string
  jurisdiction: string
  minimumItemCount: number
  requiredMemPocGoals: string[]
}

const runtimePayloads: RuntimePayloadConfig[] = [
  {
    id: 'math',
    label: 'Mathematik',
    jurisdiction: 'DE-BY',
    minimumItemCount: 600,
    requiredMemPocGoals: [
      'a075ae99-7669-563d-807a-f91b119c020a',
      '09f47964-2cd0-410e-93ee-9632b582fc91',
      'b1dcc191-d046-50de-984a-ee5c17157628',
    ],
  },
  {
    id: 'physics',
    label: 'Physik',
    jurisdiction: 'DE-HE',
    minimumItemCount: 350,
    requiredMemPocGoals: [],
  },
]

interface Options {
  baseUrl: string
}

interface AssetSearchResult {
  assetPathsById: Map<RuntimePayloadConfig['id'], string>
  scannedJsAssetCount: number
  legacyDataPaths: string[]
}

function parseArgs(args: string[]): Options {
  let baseUrl = defaultBaseUrl

  args.forEach((arg) => {
    if (arg.startsWith('--base-url=')) {
      baseUrl = arg.slice('--base-url='.length)
    }
  })

  return { baseUrl: baseUrl.replace(/\/+$/u, '') }
}

function urlFor(baseUrl: string, path: string): string {
  return new URL(path.replace(/^\/+/u, ''), `${baseUrl}/`).toString()
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/javascript,text/javascript,application/json;q=0.9,*/*;q=0.8',
      'cache-control': 'no-cache',
    },
  })
  if (!response.ok) {
    throw new Error(`${url}: HTTP ${response.status}`)
  }
  return response.text()
}

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'cache-control': 'no-cache',
    },
  })
  if (!response.ok) {
    throw new Error(`${url}: HTTP ${response.status}`)
  }
  const parsed = await response.json() as unknown
  return asRecord(parsed)
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function collectJsAssetPaths(text: string): string[] {
  const result = new Set<string>()
  let match: RegExpExecArray | null
  jsAssetPattern.lastIndex = 0
  while ((match = jsAssetPattern.exec(text)) !== null) {
    const assetPath = match[1]
    if (assetPath) result.add(`/${assetPath}`)
  }
  return [...result].sort((left, right) => left.localeCompare(right, 'en'))
}

function collectSourceRationaleAssetPaths(text: string): Map<RuntimePayloadConfig['id'], string> {
  const result = new Map<RuntimePayloadConfig['id'], string>()
  sourceRationaleAssetPattern.lastIndex = 0
  const matches = text.matchAll(sourceRationaleAssetPattern)
  for (const match of matches) {
    const id = match[1]
    const path = match[0]
    if ((id === 'math' || id === 'physics') && path) {
      result.set(id, path)
    }
  }
  return result
}

function collectLegacySourceRationalePaths(text: string): string[] {
  const result = new Set<string>()
  let match: RegExpExecArray | null
  legacySourceRationalePathPattern.lastIndex = 0
  while ((match = legacySourceRationalePathPattern.exec(text)) !== null) {
    const legacyPath = match[0]
    if (legacyPath) result.add(legacyPath)
  }
  return [...result].sort((left, right) => left.localeCompare(right, 'en'))
}

async function fetchStatus(url: string): Promise<number | string> {
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json,*/*;q=0.8',
        'cache-control': 'no-cache',
      },
    })
    return response.status
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

function hasAllRequiredAssets(assetPathsById: Map<RuntimePayloadConfig['id'], string>): boolean {
  return runtimePayloads.every((config) => assetPathsById.has(config.id))
}

async function findSourceRationaleAssets(baseUrl: string, seedTexts: string[]): Promise<AssetSearchResult> {
  const legacyDataPaths = new Set(seedTexts.flatMap(collectLegacySourceRationalePaths))
  const assetPathsById = new Map<RuntimePayloadConfig['id'], string>()

  seedTexts.forEach((text) => {
    collectSourceRationaleAssetPaths(text).forEach((path, id) => assetPathsById.set(id, path))
  })

  if (hasAllRequiredAssets(assetPathsById)) {
    return {
      assetPathsById,
      scannedJsAssetCount: 0,
      legacyDataPaths: [...legacyDataPaths],
    }
  }

  const jsAssetPaths = new Set(seedTexts.flatMap(collectJsAssetPaths))
  let scannedJsAssetCount = 0
  for (const jsAssetPath of jsAssetPaths) {
    const jsText = await fetchText(urlFor(baseUrl, jsAssetPath))
    scannedJsAssetCount += 1
    collectLegacySourceRationalePaths(jsText).forEach((legacyPath) => legacyDataPaths.add(legacyPath))
    collectSourceRationaleAssetPaths(jsText).forEach((path, id) => assetPathsById.set(id, path))
    if (hasAllRequiredAssets(assetPathsById)) break
  }

  return {
    assetPathsById,
    scannedJsAssetCount,
    legacyDataPaths: [...legacyDataPaths],
  }
}

function validatePayload(config: RuntimePayloadConfig, payload: Record<string, unknown>): string[] {
  const failures: string[] = []
  const request = asRecord(payload.request)
  const summary = asRecord(payload.summary)
  const items = Array.isArray(payload.items) ? payload.items.map(asRecord) : []

  if (request.jurisdiction !== config.jurisdiction) {
    failures.push(`${config.label}: runtime index must use ${config.jurisdiction} as the source-route preference`)
  }
  if (request.goalSelection !== 'source-backed-relevant-leaves') {
    failures.push(`${config.label}: runtime index was not generated with source-backed relevant leaf goal selection`)
  }
  if (items.length < config.minimumItemCount) {
    failures.push(`${config.label}: runtime index has only ${items.length} items; expected at least ${config.minimumItemCount}`)
  }
  if (summary.goalsWithoutClassicSourceRoute !== 0) {
    failures.push(`${config.label}: runtime index contains classic source gaps`)
  }

  const itemsByGoalId = new Map<string, Record<string, unknown>>()
  items.forEach((item) => {
    const goalId = asRecord(item.goal).id
    if (typeof goalId === 'string') itemsByGoalId.set(goalId, item)
  })

  config.requiredMemPocGoals.forEach((goalId) => {
    const item = itemsByGoalId.get(goalId)
    if (!item) {
      failures.push(`${config.label}: runtime index misses required MEM/FWU PoC goal ${goalId}`)
      return
    }
    if (item.sourceRationaleStatus !== 'classic_source_reviewed') {
      failures.push(`${config.label}: ${goalId}: classic source route is not reviewed`)
    }
    if (asRecord(item.memSparqlRoute).status !== 'mem_sparql_consistent') {
      failures.push(`${config.label}: ${goalId}: MEM/FWU route is not consistent`)
    }
  })

  return failures
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const indexHtml = await fetchText(urlFor(options.baseUrl, '/index.html'))
  let serviceWorker = ''
  try {
    serviceWorker = await fetchText(urlFor(options.baseUrl, '/sw.js'))
  } catch {
    serviceWorker = ''
  }

  const searchResult = await findSourceRationaleAssets(options.baseUrl, [indexHtml, serviceWorker])
  const missingConfigs = runtimePayloads.filter((config) => !searchResult.assetPathsById.has(config.id))
  if (missingConfigs.length > 0) {
    const details = [
      `${options.baseUrl}: missing built goal-source-rationale JSON asset(s): ${missingConfigs.map((config) => config.label).join(', ')}`,
      `scanned JS assets: ${searchResult.scannedJsAssetCount}`,
    ]
    if (searchResult.legacyDataPaths.length > 0) {
      const legacyStatuses = await Promise.all(searchResult.legacyDataPaths.map(async (path) => {
        const status = await fetchStatus(urlFor(options.baseUrl, path))
        return `${path} -> ${status}`
      }))
      details.push(`legacy /data references found: ${legacyStatuses.join(', ')}`)
      details.push('deployed app likely still serves an older bundle or a bundle without the Vite asset import')
    }
    throw new Error(details.join('\n'))
  }

  const resultLines: string[] = []
  for (const config of runtimePayloads) {
    const assetPath = searchResult.assetPathsById.get(config.id)
    if (!assetPath) continue
    const payload = await fetchJson(urlFor(options.baseUrl, assetPath))
    const failures = validatePayload(config, payload)
    if (failures.length > 0) {
      throw new Error(failures.join('\n'))
    }

    const items = Array.isArray(payload.items) ? payload.items.length : 0
    resultLines.push(`${config.label} ${urlFor(options.baseUrl, assetPath)} items=${items}`)
  }

  console.log(`Deployment smoke check passed: ${resultLines.join('; ')}`)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
