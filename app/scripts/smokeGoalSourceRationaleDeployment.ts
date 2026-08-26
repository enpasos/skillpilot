import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parsePackageGoalSourceEvidencePayload,
  type PackageGoalSourceEvidenceRequest,
} from '../src/utils/packageGoalSourceEvidence'
import {
  parseRuntimeCurriculumCatalog,
  type RuntimeCatalogSourceEvidence,
} from '../src/utils/runtimeCurriculumCatalog'

const defaultBaseUrl = 'https://skillpilot.com'
const catalogPath = '/api/ui/curriculum-catalog'

interface RuntimePayloadConfig {
  id: 'math' | 'physics'
  label: string
  publicPath: string
  jurisdiction: string
  minimumItemCount: number
  requiredMemPocGoals: string[]
}

const runtimePayloads: RuntimePayloadConfig[] = [
  {
    id: 'math',
    label: 'Mathematik',
    publicPath: '/data/goal-source-rationales-math-public.json',
    jurisdiction: 'DE-BY',
    minimumItemCount: 600,
    requiredMemPocGoals: [
      '339a7bf5-f1df-5d5a-9ec4-41f471f0c111',
      '02013455-72a0-5213-9509-ed77f7ede62b',
      '09f47964-2cd0-410e-93ee-9632b582fc91',
      'b1dcc191-d046-50de-984a-ee5c17157628',
    ],
  },
  {
    id: 'physics',
    label: 'Physik',
    publicPath: '/data/goal-source-rationales-physics-public.json',
    jurisdiction: 'DE-HE',
    minimumItemCount: 350,
    requiredMemPocGoals: [],
  },
]

interface Options {
  baseUrl: string
}

export interface GoalSourceRationaleDeploymentSmokeResult {
  mode: 'repository' | 'package'
  resultLines: string[]
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

async function fetchResponse(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      accept: 'application/json',
      'cache-control': 'no-cache',
    },
  })
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetchResponse(url)
  if (!response.ok) {
    throw new Error(`${url}: HTTP ${response.status}`)
  }
  return response.json() as Promise<unknown>
}

function validateRepositoryPayload(config: RuntimePayloadConfig, rawPayload: unknown): string[] {
  const failures: string[] = []
  const payload = asRecord(rawPayload)
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

async function smokeRepositoryMode(baseUrl: string): Promise<string[]> {
  const resultLines: string[] = []
  for (const config of runtimePayloads) {
    const assetUrl = urlFor(baseUrl, config.publicPath)
    const payload = await fetchJson(assetUrl)
    const failures = validateRepositoryPayload(config, payload)
    if (failures.length > 0) throw new Error(failures.join('\n'))

    const rawItems = asRecord(payload).items
    const items = Array.isArray(rawItems) ? rawItems.length : 0
    resultLines.push(`${config.label} ${assetUrl} items=${items}`)
  }
  return resultLines
}

function evidenceRequest(
  baseUrl: string,
  discovery: RuntimeCatalogSourceEvidence,
  generationSha256: string,
): PackageGoalSourceEvidenceRequest {
  const goal = discovery.goals[0]
  const jurisdiction = goal?.jurisdictions[0]
  if (!goal || !jurisdiction) {
    throw new Error(
      `${discovery.packageId}@${discovery.packageVersion}: source-evidence discovery has no testable goal jurisdiction`,
    )
  }

  const query = new URLSearchParams({ generation: generationSha256, jurisdiction })
  const href = `${urlFor(baseUrl, discovery.href)}/${encodeURIComponent(goal.goalId)}?${query.toString()}`
  return Object.freeze({
    discovery,
    generationSha256,
    goalId: goal.goalId,
    jurisdiction,
    href,
  })
}

async function smokePackageMode(baseUrl: string, rawCatalog: unknown): Promise<string[]> {
  const catalog = parseRuntimeCurriculumCatalog(rawCatalog)
  if (catalog.sourceEvidence.length === 0) {
    throw new Error(`${urlFor(baseUrl, catalogPath)}: package catalog has no sourceEvidence discovery entries`)
  }

  const resultLines: string[] = []
  for (const discovery of catalog.sourceEvidence) {
    const request = evidenceRequest(baseUrl, discovery, catalog.generationSha256)
    const rawPayload = await fetchJson(request.href)
    const payload = parsePackageGoalSourceEvidencePayload(rawPayload, request)
    resultLines.push(
      `${payload.packageId}@${payload.packageVersion}`
      + ` landscape=${payload.targetLandscapeId}`
      + ` goal=${payload.goalId}`
      + ` jurisdiction=${payload.jurisdiction}`,
    )
  }
  return resultLines
}

export async function runGoalSourceRationaleDeploymentSmoke(
  baseUrl: string,
): Promise<GoalSourceRationaleDeploymentSmokeResult> {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/u, '')
  const catalogUrl = urlFor(normalizedBaseUrl, catalogPath)
  const catalogResponse = await fetchResponse(catalogUrl)

  if (catalogResponse.status === 404) {
    return {
      mode: 'repository',
      resultLines: await smokeRepositoryMode(normalizedBaseUrl),
    }
  }
  if (catalogResponse.status !== 200) {
    throw new Error(`${catalogUrl}: expected HTTP 200 or 404, received HTTP ${catalogResponse.status}`)
  }

  return {
    mode: 'package',
    resultLines: await smokePackageMode(normalizedBaseUrl, await catalogResponse.json()),
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const result = await runGoalSourceRationaleDeploymentSmoke(options.baseUrl)
  console.log(`Deployment smoke check passed (${result.mode} mode): ${result.resultLines.join('; ')}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
    process.exitCode = 1
  })
}
