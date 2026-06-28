import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  defaultMemoryCardReviewConfigDir,
  discoverMemoryCardReviewConfigs,
} from './memoryCardReviewConfigDiscovery'

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

type CliOptions = {
  subject: string
  subjectSlug?: string
  version?: string
  outputDir: string
  compositionDir?: string
  mappingTokens: string[]
  publicationProfile: PublicationProfile
  allowMissingStates: boolean
  help: boolean
}

type PublicationProfile = 'release'

type PackageEntry = {
  packagePath: string
  content: Buffer
  category: string
  licenseCategory: string
}

type SubjectPreset = {
  subject: string
  subjectSlug: string
  compositionDir: string
  mappingTokens: string[]
}

type GitInfo = {
  commit: string | null
  shortCommit: string | null
  commitDate: string | null
  dirty: boolean | null
}

type ValidationReport = {
  generatedAt: string
  subject: string
  checks: Array<{
    id: string
    passed: boolean
    details: string
  }>
  counts: Record<string, number>
  stateCoverage: {
    expectedStates: string[]
    mappingStates: string[]
    missingMappingStates: string[]
  }
  warnings: string[]
  errors: string[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const EXPECTED_DE_STATES = [
  'DE-BB',
  'DE-BE',
  'DE-BW',
  'DE-BY',
  'DE-HB',
  'DE-HE',
  'DE-HH',
  'DE-MV',
  'DE-NI',
  'DE-NW',
  'DE-RP',
  'DE-SH',
  'DE-SL',
  'DE-SN',
  'DE-ST',
  'DE-TH',
]

const WINDOWS_SAFE_ARCHIVE_PATH_LIMIT = 180

const SUBJECT_PRESETS: Record<string, SubjectPreset> = {
  biologie: {
    subject: 'Biologie',
    subjectSlug: 'biologie',
    compositionDir: 'biologie',
    mappingTokens: ['biology', 'biologie'],
  },
  chemie: {
    subject: 'Chemie',
    subjectSlug: 'chemie',
    compositionDir: 'chemie',
    mappingTokens: ['chemistry', 'chemie'],
  },
  deutsch: {
    subject: 'Deutsch',
    subjectSlug: 'deutsch',
    compositionDir: 'deutsch',
    mappingTokens: ['german', 'deutsch'],
  },
  geschichte: {
    subject: 'Geschichte',
    subjectSlug: 'geschichte',
    compositionDir: 'geschichte',
    mappingTokens: ['history', 'geschichte'],
  },
  informatik: {
    subject: 'Informatik',
    subjectSlug: 'informatik',
    compositionDir: 'informatik',
    mappingTokens: ['informatics', 'informatik'],
  },
  latein: {
    subject: 'Latein',
    subjectSlug: 'latein',
    compositionDir: 'latein',
    mappingTokens: ['latin', 'latein'],
  },
  mathematik: {
    subject: 'Mathematik',
    subjectSlug: 'mathematik',
    compositionDir: 'mathematik',
    mappingTokens: ['math', 'mathe', 'mathematik'],
  },
  physik: {
    subject: 'Physik',
    subjectSlug: 'physik',
    compositionDir: 'physik',
    mappingTokens: ['physics', 'physik'],
  },
  politikundwirtschaft: {
    subject: 'Politik und Wirtschaft',
    subjectSlug: 'politik-und-wirtschaft',
    compositionDir: 'politik-und-wirtschaft',
    mappingTokens: ['politics-economics', 'politikwirtschaft', 'politik'],
  },
  wirtschaftswissenschaften: {
    subject: 'Wirtschaftswissenschaften',
    subjectSlug: 'wirtschaftswissenschaften',
    compositionDir: 'wirtschaft',
    mappingTokens: ['wirtschaft', 'economics'],
  },
  wirtschaft: {
    subject: 'Wirtschaftswissenschaften',
    subjectSlug: 'wirtschaftswissenschaften',
    compositionDir: 'wirtschaft',
    mappingTokens: ['wirtschaft', 'economics'],
  },
}

const EXPORT_MANIFEST_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://skillpilot.local/schema/export-manifest.schema.json',
  title: 'SkillPilot subject export manifest',
  type: 'object',
  required: ['packageId', 'packageVersion', 'subject', 'createdAt', 'files'],
  additionalProperties: true,
  properties: {
    packageId: { type: 'string' },
    packageVersion: { type: 'string' },
    subject: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    sourceRepository: {
      type: 'object',
      additionalProperties: true,
      properties: {
        commit: { type: ['string', 'null'] },
        dirty: { type: ['boolean', 'null'] },
      },
    },
    files: {
      type: 'array',
      items: {
        type: 'object',
        required: ['path', 'sha256', 'bytes', 'category'],
    additionalProperties: true,
        properties: {
          path: { type: 'string' },
          sha256: { type: 'string', pattern: '^[a-f0-9]{64}$' },
          bytes: { type: 'integer', minimum: 0 },
          category: { type: 'string' },
          licenseCategory: { type: 'string' },
        },
      },
    },
  },
}

const COMPOSITION_VIEW_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://skillpilot.local/schema/composition-view.schema.json',
  title: 'SkillPilot composition view',
  type: 'object',
  required: ['viewId', 'landscapeId', 'scope', 'rootNodes'],
  additionalProperties: true,
  properties: {
    viewId: { type: 'string', minLength: 1 },
    landscapeId: { type: 'string', minLength: 1 },
    title: { type: 'string' },
    scope: {
      type: 'object',
      additionalProperties: { type: 'string' },
      properties: {
        schoolForm: { type: 'string' },
        jurisdiction: { type: 'string' },
        stage: { type: 'string' },
        courseProfile: { type: 'string' },
        durationModel: { type: 'string' },
      },
    },
    rootNodes: {
      type: 'array',
      items: { $ref: '#/$defs/node' },
    },
  },
  $defs: {
    node: {
      type: 'object',
      required: ['id', 'kind', 'label'],
      additionalProperties: true,
      properties: {
        id: { type: 'string', minLength: 1 },
        kind: {
          type: 'string',
          enum: ['structure', 'canonicalSubtree', 'goalEntry', 'landscapeEntry'],
        },
        label: { type: 'string', minLength: 1 },
        goalId: { type: 'string' },
        landscapeId: { type: 'string' },
        rootGoalId: { type: 'string' },
        children: {
          type: 'array',
          items: { $ref: '#/$defs/node' },
        },
      },
    },
  },
}

const MAPPING_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://skillpilot.local/schema/canonical-mapping.schema.json',
  title: 'SkillPilot canonical mapping or mapping review',
  type: 'object',
  required: ['sourceLandscapeId', 'targetLandscapeId', 'mappings'],
  additionalProperties: true,
  properties: {
    version: { type: ['integer', 'string'] },
    reviewId: { type: 'string' },
    sourceLandscapeId: { type: 'string', minLength: 1 },
    targetLandscapeId: { type: 'string', minLength: 1 },
    status: { type: 'object', additionalProperties: true },
    mappings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['legacyGoalId', 'canonicalGoalId'],
        additionalProperties: true,
        properties: {
          legacyGoalId: { type: 'string', minLength: 1 },
          canonicalGoalId: { type: 'string', minLength: 1 },
          matchType: { type: 'string' },
          reviewDecisionId: { type: 'string' },
        },
      },
    },
  },
}

const SOURCE_EXTRACTION_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://skillpilot.local/schema/source-extraction.schema.json',
  title: 'SkillPilot curriculum source extraction',
  type: 'object',
  required: ['schemaVersion', 'extractionId', 'jurisdiction', 'subject'],
  additionalProperties: true,
  properties: {
    schemaVersion: { type: ['integer', 'string'] },
    extractionId: { type: 'string', minLength: 1 },
    sourceLandscapeId: { type: 'string' },
    jurisdiction: { type: 'string', pattern: '^DE-[A-Z]{2}$' },
    subject: { type: 'string', minLength: 1 },
    stage: { type: 'string' },
    sourceDocument: { type: 'object', additionalProperties: true },
    sourceDocuments: {
      type: 'array',
      items: { type: 'object', additionalProperties: true },
    },
    sourceGoals: {
      type: 'array',
      items: { type: 'object', additionalProperties: true },
    },
  },
}

const SOURCE_GOAL_REFERENCES_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://skillpilot.local/schema/source-goal-references.schema.json',
  title: 'SkillPilot source-goal reference index',
  type: 'object',
  required: ['schemaVersion', 'sourceGoalReferenceCount', 'sources'],
  additionalProperties: true,
  properties: {
    schemaVersion: { type: ['integer', 'string'] },
    note: { type: 'string' },
    sourceGoalReferenceCount: { type: 'integer', minimum: 0 },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        required: ['extractionId', 'sourceGoals'],
        additionalProperties: true,
        properties: {
          extractionId: { type: 'string', minLength: 1 },
          sourceLandscapeId: { type: ['string', 'null'] },
          jurisdiction: { type: ['string', 'null'] },
          subject: { type: ['string', 'null'] },
          stage: { type: ['string', 'null'] },
          sourceDocuments: {
            type: 'array',
            items: {
              type: 'object',
              required: ['url'],
              additionalProperties: true,
              properties: {
                key: { type: ['string', 'null'] },
                title: { type: ['string', 'null'] },
                role: { type: ['string', 'null'] },
                official: { type: ['boolean', 'null'] },
                url: { type: ['string', 'null'] },
                landingUrl: { type: ['string', 'null'] },
              },
            },
          },
          sourceGoals: {
            type: 'array',
            items: {
              type: 'object',
              required: ['sourceGoalId', 'sourceText', 'sourceTextSha256', 'sourceDocumentUrl'],
              additionalProperties: true,
              properties: {
                sourceGoalId: { type: ['string', 'null'] },
                passageId: { type: ['string', 'null'] },
                topicCode: { type: ['string', 'null'] },
                title: { type: ['string', 'null'] },
                description: { type: ['string', 'null'] },
                sourceText: { type: 'string' },
                sourceTextSha256: { type: 'string', pattern: '^[a-f0-9]{64}$' },
                sourceSpan: { type: ['string', 'null'] },
                parentBulletText: { type: ['string', 'null'] },
                sourceRef: { type: ['string', 'null'] },
                sourcePage: { type: ['integer', 'null'] },
                sourceLine: { type: ['integer', 'null'] },
                sourceDocumentKey: { type: ['string', 'null'] },
                sourceDocumentTitle: { type: ['string', 'null'] },
                sourceDocumentUrl: { type: ['string', 'null'] },
                sourceDocumentLandingUrl: { type: ['string', 'null'] },
                granularity: { type: ['string', 'null'] },
                category: { type: ['string', 'null'] },
                phase: { type: ['string', 'null'] },
                courseLevel: { type: ['string', 'null'] },
              },
            },
          },
        },
      },
    },
  },
}

const FLASHCARD_DECK_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://skillpilot.local/schema/flashcard-deck.schema.json',
  title: 'SkillPilot flashcard deck',
  type: 'object',
  required: ['deckId', 'title', 'cards'],
  additionalProperties: true,
  properties: {
    deckId: { type: 'string', minLength: 1 },
    title: { type: 'string', minLength: 1 },
    cards: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'front', 'back'],
        additionalProperties: true,
        properties: {
          id: { type: 'string', minLength: 1 },
          front: { type: 'string', minLength: 1 },
          back: { type: 'string', minLength: 1 },
          category: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
  },
}

const usage = () => `Usage:
  npm run export:subject-package -- --subject Mathematik [--version 0.1.0]

Options:
  --subject <name>            Subject label. Default: Mathematik.
  --subject-slug <slug>       Package slug. Defaults to a normalized subject.
  --version <version>         Package version. Defaults to 0.1.0+git.<shortSha>.
  --output-dir <path>         Output directory. Default: ../tmp/exports from app/.
  --composition-dir <dir>     Directory under curricula/DE/Gymnasium/composition-views.
  --mapping-token <token>     Mapping filename token. Can be repeated or comma-separated.
  --publication-profile <p>   Legacy compatibility only. Accepted values: release or public.
  --public                    Legacy compatibility alias for the single release package.
  --allow-missing-states      Build even if one of the 16 DE state mapping lanes is missing.
  --help                      Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    subject: 'Mathematik',
    outputDir: resolve(repoRoot, 'tmp/exports'),
    mappingTokens: [],
    publicationProfile: 'release',
    allowMissingStates: false,
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg === '--allow-missing-states') {
      options.allowMissingStates = true
      continue
    }
    if (arg === '--public') {
      options.publicationProfile = 'release'
      continue
    }

    const nextValue = argv[index + 1]
    const readValue = (name: string) => {
      if (!nextValue || nextValue.startsWith('--')) {
        throw new Error(`Missing value for ${name}`)
      }
      index += 1
      return nextValue
    }

    if (arg === '--subject') {
      options.subject = readValue(arg)
      continue
    }
    if (arg === '--subject-slug') {
      options.subjectSlug = readValue(arg)
      continue
    }
    if (arg === '--version') {
      options.version = readValue(arg)
      continue
    }
    if (arg === '--output-dir') {
      options.outputDir = resolve(repoRoot, readValue(arg))
      continue
    }
    if (arg === '--composition-dir') {
      options.compositionDir = readValue(arg)
      continue
    }
    if (arg === '--mapping-token') {
      options.mappingTokens.push(...readValue(arg).split(',').map((token) => token.trim()).filter(Boolean))
      continue
    }
    if (arg === '--publication-profile') {
      const publicationProfile = readValue(arg)
      if (publicationProfile !== 'release' && publicationProfile !== 'public') {
        throw new Error(`Unsupported publication profile: ${publicationProfile}`)
      }
      options.publicationProfile = 'release'
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  const preset = SUBJECT_PRESETS[normalizeToken(options.subject)]
  if (preset) {
    options.subject = preset.subject
    options.subjectSlug ??= preset.subjectSlug
    options.compositionDir ??= preset.compositionDir
    if (options.mappingTokens.length === 0) {
      options.mappingTokens = preset.mappingTokens
    }
  }

  options.subjectSlug ??= slugify(options.subject)
  if (options.mappingTokens.length === 0) {
    options.mappingTokens = [options.subjectSlug]
  }

  return options
}

const normalizeToken = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '')

const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'subject'

const sanitizeVersionForPath = (version: string) => version.replace(/[^a-zA-Z0-9._+-]/g, '_')

const toPosixPath = (path: string) => path.split(sep).join('/')

const repoRelative = (absolutePath: string) => {
  const relativePath = toPosixPath(relative(repoRoot, absolutePath))
  if (relativePath.startsWith('..') || relativePath === '') {
    throw new Error(`Path is outside the repository: ${absolutePath}`)
  }
  return relativePath
}

const shortenStage = (stage: string) => stage
  .replace(/^lower-secondary$/u, 'lower')
  .replace(/^upper-secondary$/u, 'upper')

const mappingPackageFileName = (fileName: string) => fileName
  .replace(/lower_secondary/gu, 'lower')
  .replace(/upper_secondary/gu, 'upper')
  .replace(/source_extraction/gu, 'src')
  .replace(/full_src/gu, 'fullsrc')
  .replace(/to_canonical/gu, 'to')
  .replace(/politics_economics/gu, 'powi')
  .replace(/politik_wirtschaftslehre/gu, 'powi')
  .replace(/wirtschaftswissenschaft/gu, 'wirtschaft')

const packagePathForRepoSource = (sourcePath: string, category: string, subjectSlug: string) => {
  const fileName = basename(sourcePath)

  if (category === 'canonical-landscape') {
    return `data/canonical/${subjectSlug}.landscape.json`
  }

  if (category === 'composition-view') {
    return `data/views/${fileName}`
  }

  if (category === 'mapping') {
    const match = sourcePath.match(/^curricula\/DE\/Gymnasium\/mapping\/(DE-[A-Z]{2})\/([^/]+)\/(.+)$/u)
    if (match) {
      return `data/mappings/${match[1]}/${shortenStage(match[2])}/${mappingPackageFileName(match[3])}`
    }
    return `data/mappings/${mappingPackageFileName(fileName)}`
  }

  if (category === 'source-extraction') {
    const match = sourcePath.match(/^curricula\/DE\/Gymnasium\/input\/([^/]+)(?:\/([^/]+))?(?:\/source-extraction)?\/([^/]+)$/u)
    if (match) {
      const state = match[1]
      const stage = match[2] ? `${shortenStage(match[2])}/` : ''
      return `data/sources/${state}/${stage}${match[3]}`
    }
    return `data/sources/${fileName}`
  }

  if (category === 'card-deck') {
    return `data/cards/${fileName}`
  }

  if (category === 'provenance') {
    return `data/provenance/${fileName}`
  }

  if (category === 'repository-license') {
    return 'licenses/APACHE-2.0.txt'
  }

  return `data/files/${fileName}`
}

const licenseCategoryForRepoSource = (sourcePath: string, category: string) => {
  if (category === 'canonical-landscape'
    || category === 'composition-view'
    || category === 'mapping'
    || category === 'provenance'
    || category === 'card-deck'
    || category === 'memory-card-review-audit') {
    return 'skillpilot-data-cc-by-4.0'
  }

  if (category === 'source-extraction') {
    return 'official-source-provenance-only'
  }

  if (category === 'repository-license') {
    if (basename(sourcePath) === 'LICENSE') {
      return 'skillpilot-software-apache-2.0'
    }
  }

  return 'generated-package-metadata'
}

const resolveRepoPath = (repoPath: string) => {
  const absolutePath = resolve(repoRoot, repoPath)
  const relativePath = relative(repoRoot, absolutePath)
  if (relativePath.startsWith('..') || relativePath === '') {
    throw new Error(`Repository path is outside the repository: ${repoPath}`)
  }
  return absolutePath
}

const readJson = (absolutePath: string): JsonValue => JSON.parse(readFileSync(absolutePath, 'utf8')) as JsonValue

const stableSortJson = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    return value.map(stableSortJson)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableSortJson(child)]),
    )
  }
  return value
}

const stableJson = (value: JsonValue) => `${JSON.stringify(stableSortJson(value), null, 2)}\n`

const sha256 = (content: Buffer) => createHash('sha256').update(content).digest('hex')

const jsonObject = (value: JsonValue): Record<string, JsonValue> => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const isJsonObject = (value: JsonValue): value is Record<string, JsonValue> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
)

const optionalString = (value: JsonValue | undefined) => (
  typeof value === 'string' && value.trim() ? value.trim() : null
)

const hasUsableOfficialSourceUrl = (value: JsonValue | undefined): value is string => {
  if (typeof value !== 'string' || !value.trim()) return false
  try {
    const parsed = new URL(value.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const hostname = parsed.hostname.toLowerCase()
    return ![
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
    ].includes(hostname)
      && !hostname.endsWith('.local')
      && !hostname.includes('example.')
  } catch {
    return false
  }
}

const sourceDocumentsFromExtraction = (data: Record<string, JsonValue>): JsonValue[] => {
  if (Array.isArray(data.sourceDocuments) && data.sourceDocuments.length > 0) {
    return data.sourceDocuments
  }
  return data.sourceDocument ? [data.sourceDocument] : []
}

const sourceDocumentTitle = (document: JsonValue, fallback: string) => {
  if (typeof document === 'string' && document.trim()) return document.trim()
  if (!isJsonObject(document)) return fallback
  const title = document.title
  if (typeof title === 'string' && title.trim()) return title.trim()
  const key = document.key
  if (typeof key === 'string' && key.trim()) return key.trim()
  return fallback
}

const sourceExtractionOriginalUrlIssues = (absolutePath: string) => {
  const data = jsonObject(readJson(absolutePath))
  const documents = sourceDocumentsFromExtraction(data)
  if (documents.length === 0) {
    return [`Missing original source document metadata in ${repoRelative(absolutePath)}`]
  }

  return documents.flatMap((document, index) => {
    const fallback = `source document #${index + 1}`
    if (!isJsonObject(document)) {
      return [`Original source metadata is not structured in ${repoRelative(absolutePath)}: ${sourceDocumentTitle(document, fallback)}`]
    }
    if (!hasUsableOfficialSourceUrl(document.url)) {
      return [`Missing usable official HTTP(S) URL in ${repoRelative(absolutePath)}: ${sourceDocumentTitle(document, fallback)}`]
    }
    return []
  })
}

const countSourceDocumentsWithUrls = (sourceExtractionFiles: string[]) => sourceExtractionFiles
  .reduce((sum, file) => {
    const documents = sourceDocumentsFromExtraction(jsonObject(readJson(file)))
    return sum + documents.filter((document) => (
      isJsonObject(document) && hasUsableOfficialSourceUrl(document.url)
    )).length
  }, 0)

const PACKAGE_INTERNAL_LINK_KEYS = new Set([
  'absolutePath',
  'filePath',
  'localPath',
  'path',
  'repoPath',
  'repositoryPath',
  'sourceExtractionPath',
  'sourceExtractionPaths',
  'sourcePath',
])

const PACKAGE_SOURCE_EVIDENCE_KEYS = new Set([
  'originalText',
  'passageText',
  'quote',
  'quotes',
  'rationale',
  'sourceDocument',
  'sourceDocuments',
  'sourceSpan',
  'sourceSpans',
  'sourceText',
  'text',
])

const PACKAGE_JSON_CATEGORIES = new Set([
  'canonical-landscape',
  'composition-view',
  'mapping',
  'provenance',
])

const packageCardPathFromRuntimePath = (value: string) => {
  const match = value.match(/^\/data\/([^/?#]+)$/u)
  return match ? `data/cards/${match[1]}` : value
}

const rewriteRepoLocalString = (value: string) => {
  const normalized = value.split('\\').join('/')

  if (normalized.startsWith('curricula/DE/Gymnasium/mapping/')) {
    return packagePathForRepoSource(normalized, 'mapping', 'subject')
  }

  if (normalized.startsWith('app/public/data/')) {
    return `data/cards/${basename(normalized)}`
  }

  if (normalized.startsWith('curricula/') || normalized.startsWith('/home/')) {
    return basename(normalized)
  }

  return value
}

const shouldOmitPackageJsonKey = (key: string, category: string) => {
  if (PACKAGE_INTERNAL_LINK_KEYS.has(key)) {
    return true
  }
  if (category === 'mapping' && key === 'notes') {
    return true
  }
  return PACKAGE_SOURCE_EVIDENCE_KEYS.has(key)
}

const sanitizeJsonForPackage = (
  value: JsonValue,
  category: string,
  parentKey?: string,
): JsonValue => {
  if (typeof value === 'string') {
    if (parentKey === 'vocabularySource' || parentKey === 'vocabularySourceEn') {
      return packageCardPathFromRuntimePath(value)
    }
    return rewriteRepoLocalString(value)
  }

  if (Array.isArray(value)) {
    return value.map((child) => sanitizeJsonForPackage(child, category, parentKey))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !shouldOmitPackageJsonKey(key, category))
        .map(([key, child]) => [key, sanitizeJsonForPackage(child, category, key)]),
    )
  }

  return value
}

const packageContentForRepoSource = (absolutePath: string, category: string) => {
  if (extname(absolutePath).toLowerCase() === '.json' && PACKAGE_JSON_CATEGORIES.has(category)) {
    return Buffer.from(stableJson(sanitizeJsonForPackage(readJson(absolutePath), category)), 'utf8')
  }
  return readFileSync(absolutePath)
}

const stripOfficialText = (value: JsonValue): JsonValue => {
  if (typeof value === 'string') {
    return rewriteRepoLocalString(value)
  }

  if (Array.isArray(value)) {
    return value.map(stripOfficialText)
  }
  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => ![
        'absolutePath',
        'description',
        'filePath',
        'localPath',
        'originalText',
        'passageText',
        'path',
        'quote',
        'quotes',
        'rationale',
        'repoPath',
        'repositoryPath',
        'sourcePath',
        'sourceSpan',
        'sourceText',
        'text',
      ].includes(key))
      .map(([key, child]) => [key, stripOfficialText(child)]),
  )
}

const sourceExtractionIndexRecord = (absolutePath: string) => {
  const data = jsonObject(readJson(absolutePath))
  const sourcePassages = Array.isArray(data.sourcePassages) ? data.sourcePassages : []
  const passages = Array.isArray(data.passages) ? data.passages : []
  const sourceGoals = Array.isArray(data.sourceGoals) ? data.sourceGoals : []

  return {
    extractionId: data.extractionId ?? null,
    sourceLandscapeId: data.sourceLandscapeId ?? null,
    jurisdiction: data.jurisdiction ?? null,
    subject: data.subject ?? null,
    stage: data.stage ?? null,
    sourceDocument: data.sourceDocument ? stripOfficialText(data.sourceDocument) : null,
    sourceDocuments: data.sourceDocuments ? stripOfficialText(data.sourceDocuments) : null,
    expectedTopicCodes: data.expectedTopicCodes ?? null,
    counts: {
      sourcePassages: sourcePassages.length,
      passages: passages.length,
      sourceGoals: sourceGoals.length,
    },
  }
}

const sourceDocumentRecord = (document: JsonValue) => {
  const data = jsonObject(document)
  return {
    key: optionalString(data.key),
    title: optionalString(data.title),
    role: optionalString(data.role),
    official: typeof data.official === 'boolean' ? data.official : null,
    url: optionalString(data.url),
    landingUrl: optionalString(data.landingUrl),
  }
}

const sourceDocumentKeyFromGoal = (goal: Record<string, JsonValue>) => {
  const direct = optionalString(goal.sourceDocumentKey)
  if (direct) return direct
  const tags = Array.isArray(goal.tags) ? goal.tags : []
  const tag = tags.find((item): item is string => typeof item === 'string' && item.startsWith('sourceDocument:'))
  return tag ? tag.slice('sourceDocument:'.length) : null
}

const sourceDocumentsByKey = (documents: JsonValue[]) => new Map(
  documents
    .map(sourceDocumentRecord)
    .filter((document) => document.key)
    .map((document) => [document.key as string, document]),
)

const sourceGoalReferenceIndexRecord = (absolutePath: string) => {
  const data = jsonObject(readJson(absolutePath))
  const rawDocuments = sourceDocumentsFromExtraction(data)
  const documentRecords = rawDocuments.map(sourceDocumentRecord)
  const documentMap = sourceDocumentsByKey(rawDocuments)
  const fallbackDocument = documentRecords[0] ?? null
  const passages = Array.isArray(data.passages) ? data.passages.filter(isJsonObject) : []
  const passageIndex = new Map(passages
    .filter((passage) => typeof passage.id === 'string')
    .map((passage) => [passage.id as string, {
      passageId: passage.id as string,
      topicCode: optionalString(passage.topicCode),
      title: optionalString(passage.title),
      sourceRef: optionalString(passage.sourceRef),
      sourcePage: typeof passage.page === 'number' ? passage.page : null,
      sourceDocumentKey: optionalString(passage.sourceDocumentKey),
    }]))
  const sourceGoals = Array.isArray(data.sourceGoals) ? data.sourceGoals.filter(isJsonObject) : []

  return {
    extractionId: optionalString(data.extractionId) ?? basename(absolutePath, '.source-extraction.json'),
    sourceLandscapeId: optionalString(data.sourceLandscapeId),
    jurisdiction: optionalString(data.jurisdiction),
    subject: optionalString(data.subject),
    stage: optionalString(data.stage),
    sourceDocuments: documentRecords,
    sourceGoals: sourceGoals.map((goal) => {
      const passageId = optionalString(goal.passageId)
      const passage = passageId ? passageIndex.get(passageId) : undefined
      const sourceText = optionalString(goal.sourceText)
        ?? optionalString(goal.rawSourceText)
        ?? optionalString(goal.parentBulletText)
        ?? optionalString(goal.description)
        ?? ''
      const documentKey = sourceDocumentKeyFromGoal(goal) ?? passage?.sourceDocumentKey ?? null
      const document = documentKey ? documentMap.get(documentKey) ?? fallbackDocument : fallbackDocument

      return {
        sourceGoalId: optionalString(goal.id),
        passageId,
        topicCode: optionalString(goal.topicCode) ?? passage?.topicCode ?? null,
        title: optionalString(goal.title),
        description: optionalString(goal.description),
        sourceText,
        sourceTextSha256: sha256(sourceText),
        sourceSpan: optionalString(goal.sourceSpan) ?? optionalString(goal.rawSourceSpan),
        parentBulletText: optionalString(goal.parentBulletText) ?? optionalString(goal.rawParentBulletText),
        sourceRef: optionalString(goal.sourceRef) ?? passage?.sourceRef ?? null,
        sourcePage: typeof goal.sourcePage === 'number' ? goal.sourcePage : passage?.sourcePage ?? null,
        sourceLine: typeof goal.sourceLine === 'number' ? goal.sourceLine : null,
        sourceDocumentKey: document?.key ?? documentKey,
        sourceDocumentTitle: document?.title ?? null,
        sourceDocumentUrl: document?.url ?? null,
        sourceDocumentLandingUrl: document?.landingUrl ?? null,
        passage: passage ? {
          passageId: passage.passageId,
          topicCode: passage.topicCode,
          title: passage.title,
          sourceRef: passage.sourceRef,
          sourcePage: passage.sourcePage,
        } : null,
        granularity: optionalString(goal.granularity),
        category: optionalString(goal.category),
        phase: optionalString(goal.phase),
        courseLevel: optionalString(goal.courseLevel),
      }
    }),
  }
}

const sourceGoalReferenceIndex = (sourceExtractionJsonFiles: string[]) => {
  const sources = sourceExtractionJsonFiles
    .map(sourceGoalReferenceIndexRecord)
    .sort((left, right) => left.extractionId.localeCompare(right.extractionId))
  return {
    schemaVersion: 1,
    note: 'Source-goal reference index. Review mapping source IDs in data/mappings resolve here to official source documents, source text anchors, and source locators.',
    sourceGoalReferenceCount: sources.reduce((sum, source) => sum + source.sourceGoals.length, 0),
    sources,
  }
}

const sourceGoalIdFromMapping = (mapping: Record<string, JsonValue>) => (
  optionalString(mapping.sourceGoalId)
    ?? optionalString(mapping.legacyGoalId)
    ?? optionalString(mapping.reviewDecisionId)
)

const reviewMappingSourceGoalReferences = (mappingFiles: string[]) => mappingFiles
  .filter((file) => basename(file).endsWith('.review.json'))
  .flatMap((file) => {
    const mappingData = jsonObject(readJson(file))
    const mappings = Array.isArray(mappingData.mappings) ? mappingData.mappings.filter(isJsonObject) : []
    return mappings.flatMap((mapping) => {
      const sourceGoalId = sourceGoalIdFromMapping(mapping)
      return sourceGoalId ? [{
        mappingPath: packagePathForRepoSource(repoRelative(file), 'mapping', 'subject'),
        sourceGoalId,
      }] : []
    })
  })

const walkFiles = (absoluteDirectory: string): string[] => {
  if (!existsSync(absoluteDirectory)) {
    return []
  }
  return readdirSync(absoluteDirectory)
    .sort((left, right) => left.localeCompare(right))
    .flatMap((entryName) => {
      const absolutePath = join(absoluteDirectory, entryName)
      const stat = statSync(absolutePath)
      if (stat.isDirectory()) {
        return walkFiles(absolutePath)
      }
      if (stat.isFile()) {
        return [absolutePath]
      }
      return []
    })
}

const gitInfo = (): GitInfo => {
  const run = (args: string[]) => {
    try {
      return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim()
    } catch {
      return null
    }
  }

  const commit = run(['rev-parse', 'HEAD'])
  const shortCommit = run(['rev-parse', '--short=12', 'HEAD'])
  const commitDate = run(['show', '-s', '--format=%cI', 'HEAD'])
  const status = run(['status', '--porcelain'])

  return {
    commit,
    shortCommit,
    commitDate,
    dirty: status === null ? null : status.length > 0,
  }
}

const sourceDate = (git: GitInfo) => {
  const sourceDateEpoch = process.env.SOURCE_DATE_EPOCH
  if (sourceDateEpoch) {
    const parsedEpoch = Number(sourceDateEpoch)
    if (!Number.isFinite(parsedEpoch)) {
      throw new Error(`SOURCE_DATE_EPOCH must be a Unix timestamp, got: ${sourceDateEpoch}`)
    }
    return new Date(parsedEpoch * 1000)
  }
  if (git.commitDate) {
    return new Date(git.commitDate)
  }
  return new Date('1980-01-01T00:00:00Z')
}

const findCanonicalLandscape = (subject: string) => {
  const canonicalDirectory = resolveRepoPath('curricula/DE/Gymnasium/canonical')
  const candidates = walkFiles(canonicalDirectory)
    .filter((path) => extname(path).toLowerCase() === '.json')

  const normalizedSubject = normalizeToken(subject)
  const parsedCandidates = candidates.map((absolutePath) => ({
    absolutePath,
    data: readJson(absolutePath) as Record<string, JsonValue>,
  }))

  const exactSubjectMatch = parsedCandidates.find(({ data }) => (
    typeof data.subject === 'string' && normalizeToken(data.subject) === normalizedSubject
  ))
  if (exactSubjectMatch) {
    return exactSubjectMatch.absolutePath
  }

  const filenameMatch = parsedCandidates.find(({ absolutePath }) => normalizeToken(basename(absolutePath)).includes(normalizedSubject))
  if (filenameMatch) {
    return filenameMatch.absolutePath
  }

  throw new Error(`No canonical Gymnasium landscape found for subject "${subject}"`)
}

const selectCompositionFiles = (compositionDir: string | undefined) => {
  if (!compositionDir) {
    return []
  }
  const compositionRoot = resolveRepoPath(`curricula/DE/Gymnasium/composition-views/${compositionDir}`)
  return walkFiles(compositionRoot)
    .filter((path) => extname(path).toLowerCase() === '.json')
    .sort((left, right) => repoRelative(left).localeCompare(repoRelative(right)))
}

const targetLandscapeIdFrom = (value: JsonValue): string | null => (
  value && typeof value === 'object' && !Array.isArray(value) && typeof value.targetLandscapeId === 'string'
    ? value.targetLandscapeId
    : null
)

const selectMappingFiles = (mappingTokens: string[], targetLandscapeId?: string) => {
  const normalizedTokens = mappingTokens.map(normalizeToken)
  const mappingRoot = resolveRepoPath('curricula/DE/Gymnasium/mapping')
  const candidates = walkFiles(mappingRoot)
    .filter((path) => extname(path).toLowerCase() === '.json')

  const exactTargetMatches = targetLandscapeId
    ? candidates.filter((path) => targetLandscapeIdFrom(readJson(path)) === targetLandscapeId)
    : []
  if (exactTargetMatches.length > 0) {
    return exactTargetMatches.sort((left, right) => repoRelative(left).localeCompare(repoRelative(right)))
  }

  return candidates
    .filter((path) => {
      const fileToken = normalizeToken(basename(path))
      return normalizedTokens.some((token) => fileToken.includes(token))
    })
    .sort((left, right) => repoRelative(left).localeCompare(repoRelative(right)))
}

const selectProvenanceFiles = () => [] as string[]

const collectSourceExtractionPaths = (value: JsonValue): string[] => {
  const paths: string[] = []

  const visit = (child: JsonValue) => {
    if (Array.isArray(child)) {
      child.forEach(visit)
      return
    }
    if (!child || typeof child !== 'object') {
      return
    }
    for (const [key, nested] of Object.entries(child)) {
      if (key === 'sourceExtractionPath' && typeof nested === 'string') {
        paths.push(nested)
      } else if (key === 'sourceExtractionPaths' && Array.isArray(nested)) {
        nested.forEach((item) => {
          if (typeof item === 'string') {
            paths.push(item)
          } else {
            visit(item)
          }
        })
      } else {
        visit(nested)
      }
    }
  }

  visit(value)
  return paths
}

const selectSourceExtractionFiles = (mappingFiles: string[], warnings: string[], errors: string[]) => {
  const selected = new Set<string>()

  mappingFiles
    .filter((path) => basename(path).endsWith('.review.json'))
    .forEach((mappingFile) => {
      const sourcePaths = [...new Set(collectSourceExtractionPaths(readJson(mappingFile)))]
      sourcePaths.forEach((sourcePath) => {
        const absoluteSourcePath = resolveRepoPath(sourcePath)
        if (!existsSync(absoluteSourcePath)) {
          errors.push(`Missing source extraction referenced from ${repoRelative(mappingFile)}: ${sourcePath}`)
          return
        }

        selected.add(absoluteSourcePath)
      })
    })

  if (selected.size === 0) {
    warnings.push('No source extraction files were selected from mapping review files.')
  }

  return [...selected].sort((left, right) => repoRelative(left).localeCompare(repoRelative(right)))
}

const collectCardRuntimePaths = (value: JsonValue): string[] => {
  const paths: string[] = []

  const visit = (child: JsonValue) => {
    if (Array.isArray(child)) {
      child.forEach(visit)
      return
    }
    if (!child || typeof child !== 'object') {
      return
    }
    Object.entries(child).forEach(([key, nested]) => {
      if ((key === 'vocabularySource' || key === 'vocabularySourceEn') && typeof nested === 'string') {
        paths.push(nested)
        return
      }
      visit(nested)
    })
  }

  visit(value)
  return [...new Set(paths)].sort((left, right) => left.localeCompare(right))
}

const selectCardDeckFiles = (canonicalData: JsonValue, errors: string[]) => {
  const runtimePaths = collectCardRuntimePaths(canonicalData)
  if (runtimePaths.length === 0) {
    return []
  }

  const searchDirectories = [
    resolveRepoPath('app/public/data'),
    resolveRepoPath('curricula/DE/Gymnasium/memory-decks'),
    resolveRepoPath('curricula/DE/Gymnasium/input/HE/upper-secondary/source-json'),
  ]

  const selected = new Map<string, string>()
  runtimePaths.forEach((runtimePath) => {
    const fileName = basename(runtimePath)
    const absolutePath = searchDirectories
      .map((directory) => join(directory, fileName))
      .find((candidate) => existsSync(candidate) && statSync(candidate).isFile())
    if (!absolutePath) {
      errors.push(`Missing card deck referenced by canonical landscape: ${fileName}`)
      return
    }
    selected.set(fileName, absolutePath)
  })

  return [...selected.values()].sort((left, right) => basename(left).localeCompare(basename(right)))
}

type MemoryCardReviewAudit = {
  reviewId: string
  ruleVersion: string | null
  configPath: string
  reviewPath: string
  cardReviewPath: string
  reportPath: string
  scope: JsonValue
}

const memoryCardReviewPackageBase = (reviewId: string) => `metadata/quality/memory-card-review/${slugify(reviewId)}`

const selectMemoryCardReviewAudits = (landscapeId: string | undefined, errors: string[]) => {
  if (!landscapeId) {
    return [] as MemoryCardReviewAudit[]
  }

  return discoverMemoryCardReviewConfigs(defaultMemoryCardReviewConfigDir, { allowEmpty: true })
    .flatMap((configPath): MemoryCardReviewAudit[] => {
      const absoluteConfigPath = resolveRepoPath(configPath.configPath)
      const config = jsonObject(readJson(absoluteConfigPath))
      if (config.landscapeId !== landscapeId) {
        return []
      }

      const reviewId = optionalString(config.reviewId)
      const reviewPath = optionalString(config.reviewPath)
      const reportPath = optionalString(config.reportPath)
      const cardReviewPath = optionalString(config.cardReviewPath)
        ?? reviewPath?.replace(/\.review\.jsonl$/iu, '.cards.review.jsonl')

      if (!reviewId || !reviewPath || !reportPath || !cardReviewPath) {
        errors.push(`Incomplete memory-card review config: ${repoRelative(absoluteConfigPath)}`)
        return []
      }

      const resolvedReviewPath = resolveRepoPath(reviewPath)
      const resolvedCardReviewPath = resolveRepoPath(cardReviewPath)
      const resolvedReportPath = resolveRepoPath(reportPath)
      ;[
        ['goal ledger', resolvedReviewPath],
        ['card ledger', resolvedCardReviewPath],
        ['audit report', resolvedReportPath],
      ].forEach(([label, absolutePath]) => {
        if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
          errors.push(`Missing memory-card review ${label} for ${reviewId}: ${repoRelative(absolutePath)}`)
        }
      })

      return [{
        reviewId,
        ruleVersion: optionalString(config.ruleVersion),
        configPath: absoluteConfigPath,
        reviewPath: resolvedReviewPath,
        cardReviewPath: resolvedCardReviewPath,
        reportPath: resolvedReportPath,
        scope: config.scope ?? null,
      }]
    })
    .sort((left, right) => left.reviewId.localeCompare(right.reviewId))
}

const memoryCardReviewPackagePaths = (audit: MemoryCardReviewAudit) => {
  const base = memoryCardReviewPackageBase(audit.reviewId)
  return {
    config: `${base}.config.json`,
    goalLedger: `${base}.review.jsonl`,
    cardLedger: `${base}.cards.review.jsonl`,
    report: `${base}.md`,
  }
}

const packageMemoryCardReviewReport = (
  audit: MemoryCardReviewAudit,
  subjectSlug: string,
) => {
  const paths = memoryCardReviewPackagePaths(audit)
  return readFileSync(audit.reportPath, 'utf8')
    .replace(
      'Dieser Report ist eine menschenlesbare Audit-Sicht auf die Memory-Review-Ledger. Die verbindlichen Prüfdaten bleiben die JSONL-Ledger; dieser Report wird daraus reproduzierbar erzeugt.',
      'Dieser Report ist eine menschenlesbare Audit-Sicht auf die Memory-Review-Ledger. Die paketbezogenen Prüfdaten liegen direkt neben diesem Report und werden reproduzierbar aus dem SkillPilot-Review erzeugt.',
    )
    .replace(
      /curricula\/DE\/Gymnasium\/quality\/memory-card-review\/[^`\s|)]+\.config\.json/gu,
      paths.config,
    )
    .replace(
      /curricula\/DE\/Gymnasium\/quality\/memory-card-review\/[^`\s|)]+\.cards\.review\.jsonl/gu,
      paths.cardLedger,
    )
    .replace(
      /curricula\/DE\/Gymnasium\/quality\/memory-card-review\/[^`\s|)]+\.review\.jsonl/gu,
      paths.goalLedger,
    )
    .replace(
      /curricula\/DE\/Gymnasium\/canonical\/[^`\s|)]+\.json/gu,
      `data/canonical/${subjectSlug}.landscape.json`,
    )
    .replace(/- Landscape: `[^`]+`/u, `- Landscape: \`data/canonical/${subjectSlug}.landscape.json\``)
    .replace(/- Goal ledger: `[^`]+`/u, `- Goal ledger: \`${paths.goalLedger}\``)
    .replace(/- Card ledger: `[^`]+`/u, `- Card ledger: \`${paths.cardLedger}\``)
    .replace(
      /curricula\/DE\/Gymnasium\/composition-views\/[^`\s|)]+\/([^`\s|)]+\.view\.json)/gu,
      'data/views/$1',
    )
}

const addMemoryCardReviewAuditEntries = (
  entriesByPath: Map<string, PackageEntry>,
  packageRoot: string,
  audit: MemoryCardReviewAudit,
  subjectSlug: string,
) => {
  const paths = memoryCardReviewPackagePaths(audit)
  const category = 'memory-card-review-audit'
  const licenseCategory = 'skillpilot-data-cc-by-4.0'
  addEntry(entriesByPath, generatedEntry(packageRoot, paths.config, {
    schemaVersion: 1,
    reviewId: audit.reviewId,
    ruleVersion: audit.ruleVersion,
    landscapePackagePath: `data/canonical/${subjectSlug}.landscape.json`,
    goalLedgerPackagePath: paths.goalLedger,
    cardLedgerPackagePath: paths.cardLedger,
    reportPackagePath: paths.report,
    scope: audit.scope,
  }, category, licenseCategory))
  addEntry(entriesByPath, generatedEntry(
    packageRoot,
    paths.goalLedger,
    readFileSync(audit.reviewPath, 'utf8'),
    category,
    licenseCategory,
  ))
  addEntry(entriesByPath, generatedEntry(
    packageRoot,
    paths.cardLedger,
    readFileSync(audit.cardReviewPath, 'utf8'),
    category,
    licenseCategory,
  ))
  addEntry(entriesByPath, generatedEntry(
    packageRoot,
    paths.report,
    packageMemoryCardReviewReport(audit, subjectSlug),
    category,
    licenseCategory,
  ))
}

const cardDeckIndexRecord = (absolutePath: string) => {
  const data = jsonObject(readJson(absolutePath))
  const cards = Array.isArray(data.cards) ? data.cards : []
  const fileName = basename(absolutePath)

  return {
    deckId: data.deckId ?? null,
    title: data.title ?? null,
    language: fileName.endsWith('_en.json') || fileName.endsWith('.en.json') ? 'en' : 'de',
    packagePath: `data/cards/${fileName}`,
    cardCount: cards.length,
  }
}

const canonicalGoalIndex = (currentCanonicalPath: string) => {
  const canonicalDirectory = resolveRepoPath('curricula/DE/Gymnasium/canonical')
  const index = new Map<string, {
    goalId: string
    targetLandscapeId: string | null
    targetFrameworkId: string | null
    targetSubject: string | null
    targetTitle: string | null
  }>()

  walkFiles(canonicalDirectory)
    .filter((path) => extname(path).toLowerCase() === '.json')
    .filter((path) => path !== currentCanonicalPath)
    .forEach((absolutePath) => {
      const landscape = jsonObject(readJson(absolutePath))
      const goals = Array.isArray(landscape.goals) ? landscape.goals : []
      goals.forEach((goal) => {
        if (!isJsonObject(goal) || typeof goal.id !== 'string') {
          return
        }
        index.set(goal.id, {
          goalId: goal.id,
          targetLandscapeId: typeof landscape.landscapeId === 'string' ? landscape.landscapeId : null,
          targetFrameworkId: typeof landscape.frameworkId === 'string' ? landscape.frameworkId : null,
          targetSubject: typeof landscape.subject === 'string' ? landscape.subject : null,
          targetTitle: typeof goal.title === 'string' ? goal.title : null,
        })
      })
    })

  return index
}

const collectExternalGoalReferences = (
  currentCanonicalPath: string,
  canonicalData: Record<string, JsonValue>,
  errors: string[],
) => {
  const goals = Array.isArray(canonicalData.goals) ? canonicalData.goals : []
  const localGoalIds = new Set(goals
    .filter(isJsonObject)
    .flatMap((goal) => (typeof goal.id === 'string' ? [goal.id] : [])))
  const externalIndex = canonicalGoalIndex(currentCanonicalPath)
  const references = new Map<string, JsonValue>()

  goals.forEach((goal) => {
    if (!isJsonObject(goal) || typeof goal.id !== 'string') {
      return
    }

    ;(['contains', 'requires'] as const).forEach((relation) => {
      const targetIds = Array.isArray(goal[relation])
        ? goal[relation].filter((targetId): targetId is string => typeof targetId === 'string')
        : []
      targetIds
        .filter((targetGoalId) => !localGoalIds.has(targetGoalId))
        .forEach((targetGoalId) => {
          const target = externalIndex.get(targetGoalId)
          if (!target) {
            errors.push(`Unresolved external ${relation} reference from ${goal.id} to ${targetGoalId}`)
          }
          const key = `${goal.id}|${relation}|${targetGoalId}`
          references.set(key, {
            fromGoalId: goal.id,
            relation,
            targetGoalId,
            targetLandscapeId: target?.targetLandscapeId ?? null,
            targetFrameworkId: target?.targetFrameworkId ?? null,
            targetSubject: target?.targetSubject ?? null,
            targetTitle: target?.targetTitle ?? null,
          })
        })
    })
  })

  return [...references.values()].sort((left, right) => {
    const leftKey = isJsonObject(left) ? `${left.fromGoalId ?? ''}|${left.relation ?? ''}|${left.targetGoalId ?? ''}` : ''
    const rightKey = isJsonObject(right) ? `${right.fromGoalId ?? ''}|${right.relation ?? ''}|${right.targetGoalId ?? ''}` : ''
    return leftKey.localeCompare(rightKey)
  })
}

const stateFromMappingPath = (absolutePath: string) => {
  const match = repoRelative(absolutePath).match(/^curricula\/DE\/Gymnasium\/mapping\/(DE-[A-Z]{2})\//u)
  return match?.[1]
}

const createZip = (entries: PackageEntry[], mtime: Date) => {
  const sortedEntries = [...entries].sort((left, right) => left.packagePath.localeCompare(right.packagePath))
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0
  const { dosTime, dosDate } = toDosDateTime(mtime)

  sortedEntries.forEach((entry) => {
    const name = Buffer.from(entry.packagePath, 'utf8')
    const data = entry.content
    const crc = crc32(data)

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(0x04034b50, 0)
    localHeader.writeUInt16LE(20, 4)
    localHeader.writeUInt16LE(0x0800, 6)
    localHeader.writeUInt16LE(0, 8)
    localHeader.writeUInt16LE(dosTime, 10)
    localHeader.writeUInt16LE(dosDate, 12)
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(data.length, 18)
    localHeader.writeUInt32LE(data.length, 22)
    localHeader.writeUInt16LE(name.length, 26)
    localHeader.writeUInt16LE(0, 28)

    localParts.push(localHeader, name, data)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0x0800, 8)
    centralHeader.writeUInt16LE(0, 10)
    centralHeader.writeUInt16LE(dosTime, 12)
    centralHeader.writeUInt16LE(dosDate, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(data.length, 20)
    centralHeader.writeUInt32LE(data.length, 24)
    centralHeader.writeUInt16LE(name.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38)
    centralHeader.writeUInt32LE(offset, 42)
    centralParts.push(centralHeader, name)

    offset += localHeader.length + name.length + data.length
  })

  const centralDirectory = Buffer.concat(centralParts)
  const centralOffset = offset
  const centralSize = centralDirectory.length

  const endOfCentralDirectory = Buffer.alloc(22)
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0)
  endOfCentralDirectory.writeUInt16LE(0, 4)
  endOfCentralDirectory.writeUInt16LE(0, 6)
  endOfCentralDirectory.writeUInt16LE(sortedEntries.length, 8)
  endOfCentralDirectory.writeUInt16LE(sortedEntries.length, 10)
  endOfCentralDirectory.writeUInt32LE(centralSize, 12)
  endOfCentralDirectory.writeUInt32LE(centralOffset, 16)
  endOfCentralDirectory.writeUInt16LE(0, 20)

  return Buffer.concat([...localParts, centralDirectory, endOfCentralDirectory])
}

const toDosDateTime = (date: Date) => {
  const year = Math.max(1980, date.getUTCFullYear())
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = Math.floor(date.getUTCSeconds() / 2)

  return {
    dosTime: (hours << 11) | (minutes << 5) | seconds,
    dosDate: ((year - 1980) << 9) | (month << 5) | day,
  }
}

const CRC_TABLE = new Uint32Array(256)
for (let index = 0; index < 256; index += 1) {
  let crc = index
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1)
  }
  CRC_TABLE[index] = crc >>> 0
}

const crc32 = (content: Buffer) => {
  let crc = 0xffffffff
  for (const byte of content) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const addEntry = (entriesByPath: Map<string, PackageEntry>, entry: PackageEntry) => {
  const existing = entriesByPath.get(entry.packagePath)
  if (existing) {
    if (!existing.content.equals(entry.content)) {
      throw new Error(`Package path collision with different content: ${entry.packagePath}`)
    }
    return
  }
  entriesByPath.set(entry.packagePath, entry)
}

const addRepoFile = (
  entriesByPath: Map<string, PackageEntry>,
  packageRoot: string,
  absolutePath: string,
  category: string,
  subjectSlug: string,
) => {
  const sourcePath = repoRelative(absolutePath)
  addEntry(entriesByPath, {
    packagePath: `${packageRoot}/${packagePathForRepoSource(sourcePath, category, subjectSlug)}`,
    content: packageContentForRepoSource(absolutePath, category),
    category,
    licenseCategory: licenseCategoryForRepoSource(sourcePath, category),
  })
}

const generatedEntry = (
  packageRoot: string,
  packagePath: string,
  value: string | JsonValue,
  category: string,
  licenseCategory = 'generated-package-metadata',
): PackageEntry => ({
  packagePath: `${packageRoot}/${packagePath}`,
  content: Buffer.from(typeof value === 'string' ? value : stableJson(value), 'utf8'),
  category,
  licenseCategory,
})

const fileRecords = (entries: PackageEntry[]) => entries
  .map((entry) => ({
    path: entry.packagePath,
    sha256: sha256(entry.content),
    bytes: entry.content.length,
    category: entry.category,
    licenseCategory: entry.licenseCategory,
  }))
  .sort((left, right) => left.path.localeCompare(right.path))

const buildReadme = (params: {
  packageId: string
  archiveRoot: string
  version: string
  subject: string
  publicationProfile: PublicationProfile
  git: GitInfo
  createdAt: string
  mappingStates: string[]
  cardDeckCount: number
  memoryCardReviewAuditCount: number
  sourceGoalReferenceCount: number
}) => `# ${params.packageId}

SkillPilot subject export package for ${params.subject}.

This package is a reproducible release artifact for the SkillPilot Gymnasium knowledge landscape. It contains the canonical subject landscape, learner-facing composition views, state-to-canonical mapping files, declared cross-subject goal references, referenced card decks, memory-card review audit data where configured, source references with text anchors, schemas, a manifest, a validation report, and SHA-256 checksums.

## Package metadata

- Package version: ${params.version}
- Publication profile: ${params.publicationProfile}
- Created at: ${params.createdAt}
- Source commit: ${params.git.commit ?? 'unknown'}
- Source tree dirty: ${params.git.dirty === null ? 'unknown' : String(params.git.dirty)}
- Archive root: \`${params.archiveRoot}\`
- Canonical landscape: \`data/canonical/\`
- Covered mapping jurisdictions: ${params.mappingStates.join(', ')}
- Included card decks: ${params.cardDeckCount}
- Memory-card review audits: ${params.memoryCardReviewAuditCount}
- Source-goal references: ${params.sourceGoalReferenceCount}

## Layout

- \`data/canonical/\` contains the canonical landscape.
- \`data/views/\` contains learner-facing composition views.
- \`data/mappings/\` contains state-to-canonical mapping and review files.
- \`data/cards/\` contains card decks referenced by SRS/memorization goals.
- \`data/dependencies/external-goal-references.json\` declares cross-subject goal references outside this subject scope.
- \`data/sources/source-index.json\` lists the referenced official source documents and URLs.
- \`data/sources/source-goal-references.json\` resolves review mapping source IDs to official source-goal text, source anchors, source locators, and document URLs.
- \`metadata/quality/memory-card-review/\` contains package-local memory-card review reports and JSONL decision ledgers where configured.
- \`schemas/\` contains the JSON schema files needed to interpret the exported data.
- \`metadata/manifest.json\` lists every exported file with byte size, checksum, category, and license category.
- \`metadata/validation-report.json\` records export-time coverage checks.
- \`metadata/provenance-report.md\` summarizes the source-trace invariants and counts for reviewer handoff.
- \`metadata/SHA256SUMS\` can be used for an integrity check after download.
- \`LICENSE.md\` and \`NOTICE.md\` describe the package-level license split.

Official curriculum documents are referenced by stable URL in the source indexes. Internal repository paths and learner state are not part of the release package.

## Source Trace

Review mapping entries in \`data/mappings/**/*.review.json\` use \`legacyGoalId\` and \`reviewDecisionId\` as source IDs. The same ID resolves as \`sourceGoalId\` in \`data/sources/source-goal-references.json\`.

With the SkillPilot repository available, a single source ID can be traced from the ZIP:

\`\`\`bash
cd app
npm run export:subject-package:trace-source -- --zip ../tmp/exports/${params.packageId}.zip --source-goal-id <sourceGoalId>
\`\`\`

Without the repository tooling, inspect \`data/sources/source-goal-references.json\` and select the matching \`sourceGoalId\`; the record contains the official document URL, source text, source span, source locator, and source text hash.

## Reproduce

From the repository root:

\`\`\`bash
cd app
npm run export:subject-package -- --subject ${params.subject} --version ${params.version}
\`\`\`

For byte-stable rebuilds across machines, set \`SOURCE_DATE_EPOCH\` before running the command.
`

const buildPackageLicense = (params: {
  packageId: string
  publicationProfile: PublicationProfile
}) => `# License

This package uses layered licensing. The per-file category is listed in \`metadata/manifest.json\` as \`licenseCategory\`.

## SkillPilot software and export tooling

SPDX-License-Identifier: Apache-2.0

The SkillPilot source code and export tooling are licensed under the Apache License 2.0. See \`licenses/APACHE-2.0.txt\` for the repository license text.

## SkillPilot-authored curriculum data

SPDX-License-Identifier: CC-BY-4.0

Files marked \`skillpilot-data-cc-by-4.0\` are SkillPilot-authored data, modelling, mapping, composition, and provenance decisions. They may be shared and adapted under Creative Commons Attribution 4.0 International.

Suggested attribution:

\`\`\`text
SkillPilot curriculum data package ${params.packageId}, generated from the SkillPilot project.
\`\`\`

## Official curriculum source material

Files marked \`official-source-provenance-only\` are not relicensed by SkillPilot. They refer to official curriculum sources and may be subject to statutory rules, source-specific terms, or quotation limits.

The \`${params.publicationProfile}\` package includes source-reference indexes that resolve mapping IDs to official source documents, source-goal text anchors, and source locators. Official curriculum source material remains attributable to its original publishers and is not relicensed by SkillPilot.
`

const buildNotice = (params: {
  packageId: string
  publicationProfile: PublicationProfile
  mappingStates: string[]
  git: GitInfo
  cardDeckCount: number
  memoryCardReviewAuditCount: number
}) => `# Notice

Package: ${params.packageId}
Publication profile: ${params.publicationProfile}
Source commit: ${params.git.commit ?? 'unknown'}

This package contains SkillPilot-authored competence-graph data for German Gymnasium mathematics, including the canonical landscape, learner-facing composition views, state-to-canonical mapping decisions, and source-reference indexes for the official curriculum documents.

Represented mapping jurisdictions:

- ${params.mappingStates.join(', ')}

Included card decks: ${params.cardDeckCount}

Included memory-card review audits: ${params.memoryCardReviewAuditCount}

Official curriculum documents are referenced by URL. No learner state and no personally identifying learner data are included.
`

const buildLegal = (publicationProfile: PublicationProfile) => `# Legal and provenance notes

This SkillPilot package contains SkillPilot-authored JSON data, mapping decisions, composition views, card decks, generated schemas, and source-reference metadata.

This ${publicationProfile} package resolves review mapping source IDs through \`data/sources/source-goal-references.json\`. The reference index carries official document URLs, source-goal text anchors, source locators, and checksums for traceability. Official curriculum source material remains attributable to its original publishers and is not relicensed by SkillPilot. Downstream publication should review the applicable source licenses and quotation limits for the intended distribution channel.

No learner state and no personally identifying learner data are included.
`

const buildEmbeddedProvenanceReport = (params: {
  packageId: string
  subject: string
  version: string
  createdAt: string
  validationReport: ValidationReport
}) => {
  const counts = params.validationReport.counts
  const checkRows = params.validationReport.checks
    .map((check) => `| \`${check.id}\` | ${check.passed ? 'pass' : 'fail'} | ${check.details.replace(/\|/gu, '\\|')} |`)
    .join('\n')

  return `# Provenance report: ${params.packageId}

Generated at: ${params.createdAt}

Subject: ${params.subject}

Version: ${params.version}

## Source Trace Contract

This package carries the complete source-trace bridge needed for mapping review:

\`\`\`text
data/mappings/*.review.json legacyGoalId/reviewDecisionId
  -> data/sources/source-goal-references.json sourceGoalId
  -> sourceText/sourceSpan/sourceRef/sourcePage/sourceDocumentUrl/sourceTextSha256
\`\`\`

For each review mapping source ID, the package contains the matching source-goal reference record. The source-goal record carries the official document URL, source text anchor, source locator, and text checksum used for traceability.

## Reviewer Workflow

1. Open a review mapping file under \`data/mappings/\`.
2. Read the mapping source ID from \`legacyGoalId\` or \`reviewDecisionId\`.
3. Find the same value as \`sourceGoalId\` in \`data/sources/source-goal-references.json\`.
4. Compare the mapped canonical target with the referenced \`sourceText\`, \`sourceSpan\`, \`sourceRef\`, official document URL, and \`sourceTextSha256\`.

## Counts

| Metric | Value |
| --- | ---: |
| Represented DE state lanes | ${params.validationReport.stateCoverage.mappingStates.length}/${params.validationReport.stateCoverage.expectedStates.length} |
| Source reference collections | ${counts.sourceExtractionJsonFiles ?? 0} |
| Official source URLs | ${counts.sourceOriginalUrls ?? 0} |
| Source-goal references | ${counts.sourceGoalReferences ?? 0} |
| Review mapping source references | ${counts.reviewMappingSourceGoalReferences ?? 0} |
| Unresolved review mapping source references | ${counts.unresolvedReviewMappingSourceGoalReferences ?? 0} |
| Source-goal URL issues | ${counts.sourceGoalReferenceUrlIssues ?? 0} |
| Source-goal text issues | ${counts.sourceGoalReferenceTextIssues ?? 0} |
| Memory-card review audits | ${counts.memoryCardReviewAudits ?? 0} |

## Export-Time Checks

| Check | Status | Details |
| --- | --- | --- |
${checkRows}

## Boundaries

Official curriculum documents are referenced through their source URLs. No learner state and no personally identifying learner data are included.
`
}

const buildReleaseReport = (params: {
  packageId: string
  archiveRoot: string
  subject: string
  version: string
  publicationProfile: PublicationProfile
  createdAt: string
  git: GitInfo
  zipFileName: string
  zipSha256: string
  zipBytes: number
  packageFileCount: number
  validationReport: ValidationReport
}) => {
  const failedChecks = params.validationReport.checks.filter((check) => !check.passed)
  const checkRows = params.validationReport.checks
    .map((check) => `| \`${check.id}\` | ${check.passed ? 'pass' : 'fail'} | ${check.details} |`)
    .join('\n')

  return `# Release report: ${params.packageId}

## Artifact

| Field | Value |
| --- | --- |
| Subject | ${params.subject} |
| Version | ${params.version} |
| Publication profile | ${params.publicationProfile} |
| Created at | ${params.createdAt} |
| Archive root | \`${params.archiveRoot}\` |
| ZIP file | \`${params.zipFileName}\` |
| ZIP SHA-256 | \`${params.zipSha256}\` |
| ZIP bytes | ${params.zipBytes} |
| Package files | ${params.packageFileCount} |
| Source commit | ${params.git.commit ?? 'unknown'} |
| Source tree dirty | ${params.git.dirty === null ? 'unknown' : String(params.git.dirty)} |

## Coverage

| Metric | Value |
| --- | ---: |
| Canonical goals | ${params.validationReport.counts.canonicalGoals ?? 0} |
| Composition views | ${params.validationReport.counts.compositionFiles ?? 0} |
| Mapping files | ${params.validationReport.counts.mappingFiles ?? 0} |
| Represented DE state lanes | ${params.validationReport.stateCoverage.mappingStates.length}/${params.validationReport.stateCoverage.expectedStates.length} |
| Source extraction records checked | ${params.validationReport.counts.sourceExtractionJsonFiles ?? 0} |
| Official source URLs | ${params.validationReport.counts.sourceOriginalUrls ?? 0} |
| Source-goal references | ${params.validationReport.counts.sourceGoalReferences ?? 0} |
| Review mapping source references | ${params.validationReport.counts.reviewMappingSourceGoalReferences ?? 0} |
| Unresolved review mapping source references | ${params.validationReport.counts.unresolvedReviewMappingSourceGoalReferences ?? 0} |
| Source URL issues | ${params.validationReport.counts.sourceOriginalUrlIssues ?? 0} |
| Card decks | ${params.validationReport.counts.cardDeckFiles ?? 0} |
| Memory-card review audits | ${params.validationReport.counts.memoryCardReviewAudits ?? 0} |
| Max archive path length | ${params.validationReport.counts.maxPackagePathLength ?? 0} |

## Validation Checks

| Check | Status | Details |
| --- | --- | --- |
${checkRows}

## Release Verdict

${failedChecks.length === 0 && params.validationReport.errors.length === 0
  ? 'Release package passed all export-time validation checks.'
  : `Release package has ${failedChecks.length} failed check(s) and ${params.validationReport.errors.length} error(s).`}

## Notes

- Official curriculum documents are referenced by URL in \`data/sources/source-index.json\`.
- Review mapping source IDs resolve through \`data/sources/source-goal-references.json\`.
- Internal repository paths and learner state are excluded from the release package.
- No learner state and no personally identifying learner data are included.
`
}

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }

  const git = gitInfo()
  const packageDate = sourceDate(git)
  const createdAt = packageDate.toISOString()
  const version = options.version ?? `0.1.0+git.${git.shortCommit ?? 'local'}`
  const packageId = `skillpilot-de-gymnasium-${options.subjectSlug}-v${sanitizeVersionForPath(version)}`
  const archiveRoot = packageId

  const warnings: string[] = []
  const errors: string[] = []
  const entriesByPath = new Map<string, PackageEntry>()

  const canonicalPath = findCanonicalLandscape(options.subject)
  const canonicalData = readJson(canonicalPath) as Record<string, JsonValue>
  const canonicalLandscapeId = typeof canonicalData.landscapeId === 'string' ? canonicalData.landscapeId : undefined
  const compositionFiles = selectCompositionFiles(options.compositionDir)
  const mappingFiles = selectMappingFiles(options.mappingTokens, canonicalLandscapeId)
  const provenanceFiles = selectProvenanceFiles()
  const sourceExtractionFiles = selectSourceExtractionFiles(mappingFiles, warnings, errors)
  const sourceExtractionJsonFiles = sourceExtractionFiles
    .filter((file) => basename(file).endsWith('.source-extraction.json'))
  const cardDeckFiles = selectCardDeckFiles(canonicalData, errors)
  const memoryCardReviewAudits = selectMemoryCardReviewAudits(canonicalLandscapeId, errors)
  const externalGoalReferences = collectExternalGoalReferences(canonicalPath, canonicalData, errors)
  const sourceOriginalUrlIssues = sourceExtractionJsonFiles.flatMap(sourceExtractionOriginalUrlIssues)
  errors.push(...sourceOriginalUrlIssues)
  const sourceGoalReferences = sourceGoalReferenceIndex(sourceExtractionJsonFiles)
  const sourceGoalReferenceIds = new Set(sourceGoalReferences.sources
    .flatMap((source) => source.sourceGoals)
    .flatMap((goal) => (goal.sourceGoalId ? [goal.sourceGoalId] : [])))
  const reviewMappingReferences = reviewMappingSourceGoalReferences(mappingFiles)
  const unresolvedReviewMappingReferences = reviewMappingReferences
    .filter((reference) => !sourceGoalReferenceIds.has(reference.sourceGoalId))
  const sourceGoalReferenceUrlIssues = sourceGoalReferences.sources.flatMap((source) => source.sourceGoals
    .filter((goal) => !hasUsableOfficialSourceUrl(goal.sourceDocumentUrl))
    .map((goal) => `${source.extractionId}:${goal.sourceGoalId ?? '(missing-id)'}`))
  const sourceGoalReferenceTextIssues = sourceGoalReferences.sources.flatMap((source) => source.sourceGoals
    .filter((goal) => typeof goal.sourceText !== 'string' || goal.sourceText.trim().length === 0)
    .map((goal) => `${source.extractionId}:${goal.sourceGoalId ?? '(missing-id)'}`))
  errors.push(
    ...unresolvedReviewMappingReferences.map((reference) => (
      `Unresolved review mapping source-goal reference in ${reference.mappingPath}: ${reference.sourceGoalId}`
    )),
    ...sourceGoalReferenceUrlIssues.map((issue) => `Missing source document URL for source-goal reference: ${issue}`),
    ...sourceGoalReferenceTextIssues.map((issue) => `Missing source text for source-goal reference: ${issue}`),
  )

  const mappingStates = [...new Set(mappingFiles.map(stateFromMappingPath).filter((state): state is string => !!state))]
    .sort((left, right) => left.localeCompare(right))
  const missingMappingStates = EXPECTED_DE_STATES.filter((state) => !mappingStates.includes(state))
  if (missingMappingStates.length > 0 && !options.allowMissingStates) {
    errors.push(`Missing mapping files for DE states: ${missingMappingStates.join(', ')}`)
  }

  if (compositionFiles.length === 0) {
    errors.push(`No composition view files found for directory: ${options.compositionDir ?? '(none)'}`)
  }
  if (mappingFiles.length === 0) {
    errors.push(`No mapping files found for tokens: ${options.mappingTokens.join(', ')}`)
  }

  addRepoFile(entriesByPath, archiveRoot, canonicalPath, 'canonical-landscape', options.subjectSlug)
  compositionFiles.forEach((file) => addRepoFile(entriesByPath, archiveRoot, file, 'composition-view', options.subjectSlug))
  mappingFiles.forEach((file) => addRepoFile(entriesByPath, archiveRoot, file, 'mapping', options.subjectSlug))
  provenanceFiles.forEach((file) => addRepoFile(entriesByPath, archiveRoot, file, 'provenance', options.subjectSlug))
  cardDeckFiles.forEach((file) => addRepoFile(entriesByPath, archiveRoot, file, 'card-deck', options.subjectSlug))
  memoryCardReviewAudits.forEach((audit) => addMemoryCardReviewAuditEntries(entriesByPath, archiveRoot, audit, options.subjectSlug))

  addEntry(entriesByPath, generatedEntry(
    archiveRoot,
    'data/cards/card-index.json',
    {
      note: 'Card decks referenced by the canonical landscape. Package paths are relative to the archive root.',
      decks: cardDeckFiles.map(cardDeckIndexRecord),
    },
    'card-index',
    'skillpilot-data-cc-by-4.0',
  ))

  addEntry(entriesByPath, generatedEntry(
    archiveRoot,
    'data/dependencies/external-goal-references.json',
    {
      note: 'Cross-subject goal references used by this subject landscape. Target metadata is informational and points outside this subject package.',
      references: externalGoalReferences,
    },
    'external-dependencies',
    'skillpilot-data-cc-by-4.0',
  ))

  addEntry(entriesByPath, generatedEntry(
    archiveRoot,
    'data/sources/source-index.json',
    {
      publicationProfile: options.publicationProfile,
      note: 'Official source document index. Review mapping source IDs resolve through data/sources/source-goal-references.json.',
      sourceGoalReferenceIndexPath: 'data/sources/source-goal-references.json',
      sourceGoalReferenceCount: sourceGoalReferences.sourceGoalReferenceCount,
      sourceCollectionIds: sourceExtractionJsonFiles.map((file) => (
        String(jsonObject(readJson(file)).extractionId ?? basename(file).replace(/\.source-extraction\.json$/u, ''))
      )),
      sources: sourceExtractionJsonFiles.map(sourceExtractionIndexRecord),
    },
    'source-index',
    'official-source-provenance-only',
  ))
  addEntry(entriesByPath, generatedEntry(
    archiveRoot,
    'data/sources/source-goal-references.json',
    sourceGoalReferences as unknown as JsonValue,
    'source-goal-reference-index',
    'official-source-provenance-only',
  ))

  const apacheLicensePath = resolveRepoPath('LICENSE')
  if (existsSync(apacheLicensePath)) {
    addRepoFile(entriesByPath, archiveRoot, apacheLicensePath, 'repository-license', options.subjectSlug)
  }

  const runtimeSchemaPath = resolveRepoPath('docs/landscape-runtime.schema.json')
  if (existsSync(runtimeSchemaPath)) {
    addEntry(entriesByPath, {
      packagePath: `${archiveRoot}/schemas/landscape-runtime.schema.json`,
      content: readFileSync(runtimeSchemaPath),
      category: 'schema',
      licenseCategory: 'skillpilot-software-apache-2.0',
    })
  } else {
    errors.push('Missing docs/landscape-runtime.schema.json')
  }

  addEntry(entriesByPath, generatedEntry(archiveRoot, 'schemas/export-manifest.schema.json', EXPORT_MANIFEST_SCHEMA, 'schema', 'skillpilot-software-apache-2.0'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'schemas/composition-view.schema.json', COMPOSITION_VIEW_SCHEMA, 'schema', 'skillpilot-software-apache-2.0'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'schemas/canonical-mapping.schema.json', MAPPING_SCHEMA, 'schema', 'skillpilot-software-apache-2.0'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'schemas/source-extraction.schema.json', SOURCE_EXTRACTION_SCHEMA, 'schema', 'skillpilot-software-apache-2.0'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'schemas/source-goal-references.schema.json', SOURCE_GOAL_REFERENCES_SCHEMA, 'schema', 'skillpilot-software-apache-2.0'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'schemas/flashcard-deck.schema.json', FLASHCARD_DECK_SCHEMA, 'schema', 'skillpilot-software-apache-2.0'))

  const goals = Array.isArray(canonicalData.goals) ? canonicalData.goals : []
  const longestPackagePath = [...entriesByPath.keys()]
    .sort((left, right) => right.length - left.length || left.localeCompare(right))[0] ?? ''
  const maxPackagePathLength = longestPackagePath.length
  if (maxPackagePathLength > WINDOWS_SAFE_ARCHIVE_PATH_LIMIT) {
    errors.push(
      `Archive path too long for Windows-safe package target: ${maxPackagePathLength} > ${WINDOWS_SAFE_ARCHIVE_PATH_LIMIT}: ${longestPackagePath}`,
    )
  }

  const validationReport: ValidationReport = {
    generatedAt: createdAt,
    subject: options.subject,
    counts: {
      canonicalLandscapes: 1,
      canonicalGoals: goals.length,
      cardDeckFiles: cardDeckFiles.length,
      memoryCardReviewAudits: memoryCardReviewAudits.length,
      memoryCardReviewAuditFiles: memoryCardReviewAudits.length * 4,
      compositionFiles: compositionFiles.length,
      mappingFiles: mappingFiles.length,
      provenanceFiles: provenanceFiles.length,
      externalGoalReferences: externalGoalReferences.length,
      sourceExtractionFiles: sourceExtractionFiles.length,
      sourceExtractionJsonFiles: sourceExtractionJsonFiles.length,
      sourceGoalReferences: sourceGoalReferences.sourceGoalReferenceCount,
      reviewMappingSourceGoalReferences: reviewMappingReferences.length,
      unresolvedReviewMappingSourceGoalReferences: unresolvedReviewMappingReferences.length,
      sourceGoalReferenceUrlIssues: sourceGoalReferenceUrlIssues.length,
      sourceGoalReferenceTextIssues: sourceGoalReferenceTextIssues.length,
      sourceOriginalUrls: countSourceDocumentsWithUrls(sourceExtractionJsonFiles),
      sourceOriginalUrlIssues: sourceOriginalUrlIssues.length,
      maxPackagePathLength,
    },
    stateCoverage: {
      expectedStates: EXPECTED_DE_STATES,
      mappingStates,
      missingMappingStates,
    },
    warnings,
    errors,
    checks: [
      {
        id: 'canonical-landscape-present',
        passed: true,
        details: `data/canonical/${options.subjectSlug}.landscape.json`,
      },
      {
        id: 'composition-views-present',
        passed: compositionFiles.length > 0,
        details: `${compositionFiles.length} file(s)`,
      },
      {
        id: 'mapping-files-present',
        passed: mappingFiles.length > 0,
        details: `${mappingFiles.length} file(s)`,
      },
      {
        id: 'all-de-state-mapping-lanes-present',
        passed: missingMappingStates.length === 0 || options.allowMissingStates,
        details: missingMappingStates.length === 0
          ? 'All 16 DE state mapping lanes are represented.'
          : `Missing: ${missingMappingStates.join(', ')}`,
      },
      {
        id: 'source-reference-inputs-present',
        passed: !errors.some((error) => error.startsWith('Missing source extraction')),
        details: `${sourceExtractionFiles.filter((file) => basename(file).endsWith('.json')).length} source reference collection(s)`,
      },
      {
        id: 'source-goal-references-present',
        passed: sourceGoalReferences.sourceGoalReferenceCount > 0 && sourceGoalReferenceTextIssues.length === 0,
        details: `${sourceGoalReferences.sourceGoalReferenceCount} source-goal reference(s); ${sourceGoalReferenceTextIssues.length} missing source text`,
      },
      {
        id: 'review-mapping-source-goals-resolve',
        passed: unresolvedReviewMappingReferences.length === 0,
        details: unresolvedReviewMappingReferences.length === 0
          ? `${reviewMappingReferences.length} review mapping source reference(s) resolve.`
          : `${unresolvedReviewMappingReferences.length} unresolved source-goal reference(s).`,
      },
      {
        id: 'official-source-urls-present',
        passed: sourceOriginalUrlIssues.length === 0 && sourceGoalReferenceUrlIssues.length === 0,
        details: sourceOriginalUrlIssues.length === 0 && sourceGoalReferenceUrlIssues.length === 0
          ? `${countSourceDocumentsWithUrls(sourceExtractionJsonFiles)} official source URL(s) and ${sourceGoalReferences.sourceGoalReferenceCount} source-goal URL reference(s) are present.`
          : `${sourceOriginalUrlIssues.length + sourceGoalReferenceUrlIssues.length} source document URL issue(s).`,
      },
      {
        id: 'external-goal-references-declared',
        passed: !errors.some((error) => error.startsWith('Unresolved external ')),
        details: `${externalGoalReferences.length} external goal reference(s) declared in data/dependencies/external-goal-references.json`,
      },
      {
        id: 'referenced-card-decks-present',
        passed: cardDeckFiles.length === collectCardRuntimePaths(canonicalData).length,
        details: `${cardDeckFiles.length} card deck file(s)`,
      },
      {
        id: 'memory-card-review-audits-present',
        passed: memoryCardReviewAudits.every((audit) => {
          const paths = Object.values(memoryCardReviewPackagePaths(audit))
          return paths.every((packagePath) => entriesByPath.has(`${archiveRoot}/${packagePath}`))
        }),
        details: memoryCardReviewAudits.length === 0
          ? 'No memory-card review audit is configured for this subject.'
          : `${memoryCardReviewAudits.length} audit(s), ${memoryCardReviewAudits.length * 4} package file(s)`,
      },
      {
        id: 'windows-safe-archive-path-lengths',
        passed: maxPackagePathLength <= WINDOWS_SAFE_ARCHIVE_PATH_LIMIT,
        details: `Longest archive path has ${maxPackagePathLength} characters: ${longestPackagePath}`,
      },
    ],
  }

  addEntry(
    entriesByPath,
    generatedEntry(archiveRoot, 'metadata/validation-report.json', validationReport as unknown as JsonValue, 'metadata'),
  )
  addEntry(
    entriesByPath,
    generatedEntry(archiveRoot, 'metadata/provenance-report.md', buildEmbeddedProvenanceReport({
      packageId,
      subject: options.subject,
      version,
      createdAt,
      validationReport,
    }), 'metadata'),
  )

  if (errors.length > 0) {
    process.stderr.write(`${stableJson(validationReport as unknown as JsonValue)}\n`)
    throw new Error(`Export package build failed with ${errors.length} error(s).`)
  }

  addEntry(entriesByPath, generatedEntry(archiveRoot, 'README.md', buildReadme({
    packageId,
    archiveRoot,
    version,
    subject: options.subject,
    publicationProfile: options.publicationProfile,
    git,
    createdAt,
    mappingStates,
    cardDeckCount: cardDeckFiles.length,
    memoryCardReviewAuditCount: memoryCardReviewAudits.length,
    sourceGoalReferenceCount: sourceGoalReferences.sourceGoalReferenceCount,
  }), 'package-documentation'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'LICENSE.md', buildPackageLicense({
    packageId,
    publicationProfile: options.publicationProfile,
  }), 'package-documentation'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'NOTICE.md', buildNotice({
    packageId,
    publicationProfile: options.publicationProfile,
    mappingStates,
    git,
    cardDeckCount: cardDeckFiles.length,
    memoryCardReviewAuditCount: memoryCardReviewAudits.length,
  }), 'package-documentation'))
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'LEGAL.md', buildLegal(options.publicationProfile), 'package-documentation'))

  const entriesBeforeManifest = [...entriesByPath.values()]
  const manifest = {
    packageId,
    archiveRoot,
    packageVersion: version,
    publicationProfile: options.publicationProfile,
    subject: options.subject,
    subjectSlug: options.subjectSlug,
    createdAt,
    reproducibility: {
      sourceDateEpoch: process.env.SOURCE_DATE_EPOCH ?? null,
      zipCompression: 'store',
      zipEntryOrder: 'lexicographic by package path',
      zipEntryMode: '0644',
      pathLayout: 'windows-safe-short-paths-v1',
      maxArchivePathLength: maxPackagePathLength,
      maxArchivePathLimit: WINDOWS_SAFE_ARCHIVE_PATH_LIMIT,
    },
    licensePolicy: {
      defaultSoftwareLicense: 'Apache-2.0',
      defaultSkillpilotDataLicense: 'CC-BY-4.0',
      fileLicenseField: 'licenseCategory',
      note: 'Official curriculum source material is not relicensed by SkillPilot.',
    },
    sourceRepository: {
      commit: git.commit,
      shortCommit: git.shortCommit,
      commitDate: git.commitDate,
      dirty: git.dirty,
    },
    coverage: {
      country: 'DE',
      schoolForm: 'Gymnasium',
      expectedJurisdictions: EXPECTED_DE_STATES,
      representedMappingJurisdictions: mappingStates,
      missingMappingJurisdictions: missingMappingStates,
    },
    sourceSelection: {
      canonicalLandscapePackagePath: `${archiveRoot}/data/canonical/${options.subjectSlug}.landscape.json`,
      cardDeckCount: cardDeckFiles.length,
      memoryCardReviewAuditCount: memoryCardReviewAudits.length,
      memoryCardReviewAuditPackagePaths: memoryCardReviewAudits.map((audit) => {
        const paths = memoryCardReviewPackagePaths(audit)
        return {
          reviewId: audit.reviewId,
          config: `${archiveRoot}/${paths.config}`,
          goalLedger: `${archiveRoot}/${paths.goalLedger}`,
          cardLedger: `${archiveRoot}/${paths.cardLedger}`,
          report: `${archiveRoot}/${paths.report}`,
        }
      }),
      compositionScope: options.compositionDir ?? null,
      mappingTokens: options.mappingTokens,
      provenanceRecordCount: provenanceFiles.length,
      externalGoalReferenceCount: externalGoalReferences.length,
      sourceGoalReferenceIndexPackagePath: `${archiveRoot}/data/sources/source-goal-references.json`,
      sourceGoalReferenceCount: sourceGoalReferences.sourceGoalReferenceCount,
      reviewMappingSourceGoalReferenceCount: reviewMappingReferences.length,
      unresolvedReviewMappingSourceGoalReferenceCount: unresolvedReviewMappingReferences.length,
      sourceCollectionIds: sourceExtractionJsonFiles.map((file) => (
        String(jsonObject(readJson(file)).extractionId ?? basename(file).replace(/\.source-extraction\.json$/u, ''))
      )),
    },
    files: fileRecords(entriesBeforeManifest),
  }

  const manifestEntry = generatedEntry(archiveRoot, 'metadata/manifest.json', manifest as JsonValue, 'metadata')
  addEntry(entriesByPath, manifestEntry)

  const checksumLines = fileRecords([...entriesByPath.values()])
    .map((record) => `${record.sha256}  ${record.path}`)
    .join('\n')
  addEntry(entriesByPath, generatedEntry(archiveRoot, 'metadata/SHA256SUMS', `${checksumLines}\n`, 'metadata'))

  mkdirSync(options.outputDir, { recursive: true })
  const zipPath = resolve(options.outputDir, `${archiveRoot}.zip`)
  const zipContent = createZip([...entriesByPath.values()], packageDate)
  writeFileSync(zipPath, zipContent)
  const zipSha256 = sha256(zipContent)
  const releaseReportPath = resolve(options.outputDir, `${archiveRoot}-release-report.md`)
  writeFileSync(releaseReportPath, buildReleaseReport({
    packageId,
    archiveRoot,
    subject: options.subject,
    version,
    publicationProfile: options.publicationProfile,
    createdAt,
    git,
    zipFileName: basename(zipPath),
    zipSha256,
    zipBytes: zipContent.length,
    packageFileCount: entriesByPath.size,
    validationReport,
  }))

  const summary = {
    zipPath: repoRelative(zipPath),
    releaseReportPath: repoRelative(releaseReportPath),
    sha256: zipSha256,
    bytes: zipContent.length,
    packageId,
    archiveRoot,
    version,
    publicationProfile: options.publicationProfile,
    files: entriesByPath.size,
    mappingStates: mappingStates.length,
    warnings,
  }
  process.stdout.write(`${stableJson(summary as unknown as JsonValue)}`)
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exitCode = 1
}
