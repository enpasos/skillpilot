export type MaterialLanguage = 'de' | 'en'

export interface ContentPackage {
  packageId: string
  version: string
  title: string
  description: string
  providerName: string
  providerUrl: string
  curatorName?: string
  curatorUrl?: string
  access: string
  aiUsage: string
  materialCount: number
}

export interface ContentSelection {
  revision: number
  selectedPackageIds: string[]
  packages: ContentPackage[]
}

export interface ResolvedMaterial {
  title: string
  url: string
  provider: string
  resourceType: string
  language: string
  sections: string[]
  access: string
  aiUsage: string
}

export class ContentMaterialsApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Content materials request failed (${status})`)
    this.name = 'ContentMaterialsApiError'
    this.status = status
  }
}

interface RequestOptions {
  apiBase?: string
  fetcher?: typeof fetch
  signal?: AbortSignal
}

const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid content materials response')
  }
  return value as Record<string, unknown>
}

const text = (value: unknown): string => {
  if (typeof value !== 'string') throw new Error('Invalid content materials text')
  return value
}

/** Public material links are never interpreted as HTML or script destinations. */
export const safeMaterialUrl = (value: unknown): string => {
  const candidate = text(value)
  const parsed = new URL(candidate)
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error('Invalid material URL')
  }
  return candidate
}

const stringArray = (value: unknown): string[] => {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error('Invalid content package selection')
  }
  return value as string[]
}

export const parseContentSelection = (value: unknown): ContentSelection => {
  const source = record(value)
  if (!Number.isSafeInteger(source.revision) || Number(source.revision) < 0 || !Array.isArray(source.packages)) {
    throw new Error('Invalid content selection revision or packages')
  }
  return {
    revision: Number(source.revision),
    selectedPackageIds: stringArray(source.selectedPackageIds),
    packages: source.packages.map((entry) => {
      const item = record(entry)
      if (!Number.isSafeInteger(item.materialCount) || Number(item.materialCount) < 0) {
        throw new Error('Invalid content material count')
      }
      return {
        packageId: text(item.packageId),
        version: text(item.version),
        title: text(item.title),
        description: text(item.description),
        providerName: text(item.providerName),
        providerUrl: safeMaterialUrl(item.providerUrl),
        ...(item.curatorName == null ? {} : { curatorName: text(item.curatorName) }),
        ...(item.curatorUrl == null ? {} : { curatorUrl: safeMaterialUrl(item.curatorUrl) }),
        access: text(item.access),
        aiUsage: text(item.aiUsage),
        materialCount: Number(item.materialCount),
      }
    }),
  }
}

const endpoint = (skillpilotId: string, suffix: string, options: RequestOptions): string => {
  if (!skillpilotId.trim()) throw new Error('Missing learner context')
  const base = (options.apiBase ?? import.meta.env?.VITE_API_BASE ?? '').replace(/\/+$/, '')
  return `${base}/api/ui/learners/${encodeURIComponent(skillpilotId)}/${suffix}`
}

const responseJson = async (response: Response): Promise<unknown> => {
  if (!response.ok) throw new ContentMaterialsApiError(response.status)
  return response.json()
}

export const getContentSelection = async (
  skillpilotId: string,
  language: MaterialLanguage,
  options: RequestOptions = {},
): Promise<ContentSelection> => {
  const response = await (options.fetcher ?? fetch)(
    `${endpoint(skillpilotId, 'content-selection', options)}?lang=${language}`,
    { cache: 'no-store', signal: options.signal, referrerPolicy: 'no-referrer' },
  )
  return parseContentSelection(await responseJson(response))
}

export const saveContentSelection = async (
  skillpilotId: string,
  language: MaterialLanguage,
  expectedRevision: number,
  selectedPackageIds: string[],
  options: RequestOptions = {},
): Promise<ContentSelection> => {
  const response = await (options.fetcher ?? fetch)(
    `${endpoint(skillpilotId, 'content-selection', options)}?lang=${language}`,
    {
      method: 'PUT',
      cache: 'no-store',
      signal: options.signal,
      referrerPolicy: 'no-referrer',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedRevision, selectedPackageIds }),
    },
  )
  return parseContentSelection(await responseJson(response))
}

export const parseResolvedMaterials = (value: unknown): ResolvedMaterial[] => {
  if (!Array.isArray(value) || value.length > 4) throw new Error('Invalid material list')
  return value.map((entry) => {
    const item = record(entry)
    return {
      title: text(item.title),
      url: safeMaterialUrl(item.url),
      provider: text(item.provider),
      resourceType: text(item.resourceType),
      language: text(item.language),
      sections: stringArray(item.sections),
      access: text(item.access),
      aiUsage: text(item.aiUsage),
    }
  })
}

export const getGoalAdditionalMaterials = async (
  skillpilotId: string,
  goalId: string,
  language: MaterialLanguage,
  options: RequestOptions = {},
): Promise<ResolvedMaterial[]> => {
  const query = new URLSearchParams({ goalId, lang: language })
  const response = await (options.fetcher ?? fetch)(
    `${endpoint(skillpilotId, 'content-materials', options)}?${query}`,
    { cache: 'no-store', signal: options.signal, referrerPolicy: 'no-referrer' },
  )
  return parseResolvedMaterials(await responseJson(response))
}
