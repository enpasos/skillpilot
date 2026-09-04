export const CLAUDE_PLUGIN_PUBLICATION_INDEX_URL = '/api/public/claude/plugins/index.json'
export const CLAUDE_MARKETPLACE_REPOSITORY_URL = 'https://github.com/enpasos/skillpilot-claude-marketplace'
export const CLAUDE_CONNECTOR_PRIVACY_URL = 'https://mcp-claude-v1.skillpilot.com/privacy'
export const CLAUDE_PLUGIN_CURRENT_VERSION = '1.1.0'
// The public marketplace repository still contains the historical 1.0.4
// package. Keep it out of the first-party guide until the exact 1.1.0
// repository revision has been published and accepted.
export const CLAUDE_MARKETPLACE_INSTALLATION_ENABLED = false

export interface ClaudePluginRequirements {
  minimumAge: number
  plan: string
  installSurface: string
  testedSurfaces: string[]
  voiceMode: boolean
}

export const CLAUDE_PLUGIN_BETA_REQUIREMENTS = {
  minimumAge: 18,
  plan: 'claude-pro',
  installSurface: 'claude-web',
  testedSurfaces: [],
  voiceMode: false,
} satisfies ClaudePluginRequirements

export interface ClaudePluginPublication {
  id: string
  name: string
  version: string
  status: string
  filename: string
  bytes: number
  sha256: string
  downloadUrl: string
  sourceUrl: string
  privacyUrl: string
  termsUrl: string
  supportEmail: string
  requirements: ClaudePluginRequirements
}

export interface ClaudePluginPublicationIndex {
  schemaVersion: 1
  channel: 'beta'
  preparedAt: string
  plugins: ClaudePluginPublication[]
}

const publicationError = (message: string): never => {
  throw new Error(`Invalid Claude plugin publication index: ${message}`)
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
)

const assertExactKeys = (
  record: Record<string, unknown>,
  expectedKeys: readonly string[],
  path: string,
) => {
  const actualKeys = Object.keys(record).sort()
  const expected = [...expectedKeys].sort()
  if (
    actualKeys.length !== expected.length
    || actualKeys.some((key, index) => key !== expected[index])
  ) {
    return publicationError(`${path} must contain exactly: ${expectedKeys.join(', ')}`)
  }
}

const requiredString = (record: Record<string, unknown>, key: string, path: string) => {
  const value = record[key]
  if (typeof value !== 'string' || !value.trim()) {
    return publicationError(`${path}.${key} must be a non-empty string`)
  }
  return value.trim()
}

const requiredHttpsUrl = (record: Record<string, unknown>, key: string, path: string) => {
  const value = requiredString(record, key, path)

  try {
    const parsed = new URL(value)
    if (parsed.protocol === 'https:' && parsed.hostname && !parsed.username && !parsed.password) {
      return value
    }
  } catch {
    // The shared error below deliberately avoids exposing the complete value.
  }

  return publicationError(`${path}.${key} must be an HTTPS URL without credentials`)
}

const requiredRootRelativeUrl = (record: Record<string, unknown>, key: string, path: string) => {
  const value = requiredString(record, key, path)
  let decoded = ''
  try {
    decoded = decodeURIComponent(value)
  } catch {
    return publicationError(`${path}.${key} must be a canonical root-relative URL`)
  }
  if (
    !value.startsWith('/')
    || value.startsWith('//')
    || value.includes('\\')
    || value.includes('?')
    || value.includes('#')
    || decoded.split('/').includes('..')
  ) {
    return publicationError(`${path}.${key} must be a canonical root-relative URL`)
  }
  return value
}

const parseRequirements = (value: unknown, path: string): ClaudePluginRequirements => {
  if (!isRecord(value)) return publicationError(`${path} must be an object`)
  assertExactKeys(
    value,
    ['minimumAge', 'plan', 'installSurface', 'testedSurfaces', 'voiceMode'],
    path,
  )

  const minimumAge = value.minimumAge
  if (!Number.isSafeInteger(minimumAge) || (minimumAge as number) < 18) {
    return publicationError(`${path}.minimumAge must be a safe integer of at least 18`)
  }

  if (!Array.isArray(value.testedSurfaces)) {
    return publicationError(`${path}.testedSurfaces must be a string array`)
  }
  const testedSurfaces = value.testedSurfaces.map((surface, index) => {
    if (typeof surface !== 'string' || !surface.trim()) {
      return publicationError(`${path}.testedSurfaces[${index}] must be a non-empty string`)
    }
    return surface.trim()
  })
  if (new Set(testedSurfaces).size !== testedSurfaces.length) {
    return publicationError(`${path}.testedSurfaces must not contain duplicates`)
  }

  if (typeof value.voiceMode !== 'boolean') {
    return publicationError(`${path}.voiceMode must be a boolean`)
  }

  return {
    minimumAge: minimumAge as number,
    plan: requiredString(value, 'plan', path),
    installSurface: requiredString(value, 'installSurface', path),
    testedSurfaces,
    voiceMode: value.voiceMode,
  }
}

const parsePlugin = (value: unknown, index: number): ClaudePluginPublication => {
  const path = `plugins[${index}]`
  if (!isRecord(value)) return publicationError(`${path} must be an object`)
  assertExactKeys(
    value,
    [
      'id',
      'name',
      'version',
      'status',
      'filename',
      'bytes',
      'sha256',
      'downloadUrl',
      'sourceUrl',
      'privacyUrl',
      'termsUrl',
      'supportEmail',
      'requirements',
    ],
    path,
  )

  const id = requiredString(value, 'id', path)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) {
    return publicationError(`${path}.id must be a lowercase kebab-case identifier`)
  }
  if (id !== 'skillpilot-coach-v1') {
    return publicationError(`${path}.id must equal skillpilot-coach-v1`)
  }

  const version = requiredString(value, 'version', path)
  if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*)?$/u.test(version)) {
    return publicationError(`${path}.version must be a semantic version`)
  }
  if (version !== CLAUDE_PLUGIN_CURRENT_VERSION) {
    return publicationError(`${path}.version must equal ${CLAUDE_PLUGIN_CURRENT_VERSION}`)
  }

  const status = requiredString(value, 'status', path)
  if (status !== 'beta') {
    return publicationError(`${path}.status must equal beta`)
  }

  const filename = requiredString(value, 'filename', path)
  if (filename !== `${id}-${version}.plugin`) {
    return publicationError(`${path}.filename must equal ${id}-${version}.plugin`)
  }

  const bytes = value.bytes
  if (!Number.isSafeInteger(bytes) || (bytes as number) <= 0 || (bytes as number) > 50 * 1024 * 1024) {
    return publicationError(`${path}.bytes must be a positive safe integer no larger than 50 MiB`)
  }

  const sha256 = requiredString(value, 'sha256', path).toLowerCase()
  if (!/^[a-f0-9]{64}$/u.test(sha256)) {
    return publicationError(`${path}.sha256 must contain 64 hexadecimal characters`)
  }

  const supportEmail = requiredString(value, 'supportEmail', path)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(supportEmail)) {
    return publicationError(`${path}.supportEmail must be an email address`)
  }

  const downloadUrl = requiredRootRelativeUrl(value, 'downloadUrl', path)
  const expectedDownloadUrl = `/api/public/claude/plugins/${id}/${version}/sha256-${sha256}/${filename}`
  if (downloadUrl !== expectedDownloadUrl) {
    return publicationError(`${path}.downloadUrl must match the versioned SHA-256 artifact path`)
  }

  return {
    id,
    name: requiredString(value, 'name', path),
    version,
    status,
    filename,
    bytes: bytes as number,
    sha256,
    downloadUrl,
    sourceUrl: requiredHttpsUrl(value, 'sourceUrl', path),
    privacyUrl: requiredHttpsUrl(value, 'privacyUrl', path),
    termsUrl: requiredHttpsUrl(value, 'termsUrl', path),
    supportEmail,
    requirements: parseRequirements(value.requirements, `${path}.requirements`),
  }
}

export const parseClaudePluginPublicationIndex = (value: unknown): ClaudePluginPublicationIndex => {
  if (!isRecord(value)) return publicationError('root must be an object')
  assertExactKeys(value, ['schemaVersion', 'channel', 'preparedAt', 'plugins'], 'root')
  if (value.schemaVersion !== 1) return publicationError('schemaVersion must equal 1')
  if (value.channel !== 'beta') return publicationError('channel must equal beta')

  const preparedAt = requiredString(value, 'preparedAt', 'root')
  const parsedPreparedAt = new Date(preparedAt)
  if (!Number.isFinite(parsedPreparedAt.getTime()) || parsedPreparedAt.toISOString() !== preparedAt) {
    return publicationError('root.preparedAt must be a canonical UTC date-time')
  }

  if (!Array.isArray(value.plugins) || value.plugins.length !== 1) {
    return publicationError('plugins must contain exactly one plugin')
  }

  return {
    schemaVersion: 1,
    channel: 'beta',
    preparedAt,
    plugins: value.plugins.map(parsePlugin),
  }
}

export const loadClaudePluginPublicationIndex = async (
  signal?: AbortSignal,
): Promise<ClaudePluginPublicationIndex> => {
  const response = await fetch(CLAUDE_PLUGIN_PUBLICATION_INDEX_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  })
  if (!response.ok) {
    throw new Error(`Claude plugin publication index returned HTTP ${response.status}`)
  }
  return parseClaudePluginPublicationIndex(await response.json())
}
