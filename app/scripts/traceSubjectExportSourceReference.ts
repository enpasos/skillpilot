import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  parseSubjectExportSourceReferences,
  type SourceReferenceMatch,
} from './subjectExportSourceReferences'

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

type CliOptions = {
  zipPath: string | null
  sourceGoalId: string | null
  sourceArtifactPath: string | null
  canonicalGoalId: string | null
  limit: number
  format: 'markdown' | 'json'
  help: boolean
}

type SourceGoalEvidence = {
  artifactPath: string | null
  extractionId: string
  sourceLandscapeId: string | null
  jurisdiction: string | null
  subject: string | null
  stage: string | null
  sourceGoalId: string
  title: string | null
  description: string | null
  topicCode: string | null
  sourceText: string
  sourceTextSha256: string | null
  sourceSpan: string | null
  parentBulletText: string | null
  sourceRef: string | null
  sourcePage: number | null
  sourceLine: number | null
  sourceDocumentKey: string | null
  sourceDocumentTitle: string | null
  sourceDocumentUrl: string | null
  sourceDocumentLandingUrl: string | null
}

type MappingEvidence = {
  mappingPath: string
  reviewId: string | null
  sourceLandscapeId: string | null
  targetLandscapeId: string | null
  legacyGoalId: string | null
  reviewDecisionId: string | null
  sourceGoalId: string | null
  canonicalGoalId: string | null
  matchType: string | null
  jurisdiction: string | null
  stage: string | null
}

type CanonicalGoal = {
  id: string
  title: string | null
  description: string | null
  phase: string | null
  area: string | null
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const ZIP_COMMAND_MAX_BUFFER_BYTES = 512 * 1024 * 1024

const usage = () => `Usage:
  npm run export:subject-package:trace-source -- --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip --source-goal-id he-math-sekii-e-1-b01-a01-376ffbbc
  npm run export:subject-package:trace-source -- --zip tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip --canonical-goal-id 502ecaa7-cca6-5c51-a1cc-da09a7b2382c

Options:
  --zip <path>                 Subject export ZIP inside this repository.
  --source-goal-id <id>        Source goal ID from data/mappings/*.review.json legacyGoalId/reviewDecisionId.
  --source-artifact-path <path> Exact data/sources/... JSON path when an ID occurs in multiple authored source versions.
  --canonical-goal-id <id>     Canonical goal ID from a mapping entry or canonical landscape.
  --limit <n>                  Maximum mapping/source rows to print. Default: 20.
  --format <markdown|json>     Output format. Default: markdown.
  --help                       Show this help.
`

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    zipPath: null,
    sourceGoalId: null,
    sourceArtifactPath: null,
    canonicalGoalId: null,
    limit: 20,
    format: 'markdown',
    help: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      options.help = true
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

    if (arg === '--zip') {
      options.zipPath = resolveInsideRepo(readValue(arg))
      continue
    }
    if (arg === '--source-goal-id') {
      options.sourceGoalId = readValue(arg)
      continue
    }
    if (arg === '--source-artifact-path') {
      options.sourceArtifactPath = readValue(arg)
      continue
    }
    if (arg === '--canonical-goal-id') {
      options.canonicalGoalId = readValue(arg)
      continue
    }
    if (arg === '--limit') {
      options.limit = positiveInteger(readValue(arg), arg)
      continue
    }
    if (arg === '--format') {
      const format = readValue(arg)
      if (format !== 'markdown' && format !== 'json') {
        throw new Error(`Unsupported format: ${format}`)
      }
      options.format = format
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

const positiveInteger = (value: string, name: string) => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer, got: ${value}`)
  }
  return parsed
}

const isInsideRepo = (absolutePath: string) => {
  const relativePath = relative(repoRoot, absolutePath)
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))
}

const resolveInsideRepo = (inputPath: string) => {
  const candidates = [resolve(repoRoot, inputPath), resolve(process.cwd(), inputPath)]
  const absolutePath = candidates.find(isInsideRepo)
  if (!absolutePath) {
    throw new Error(`Path must be inside the repository: ${inputPath}`)
  }
  return absolutePath
}

const toPosixPath = (path: string) => path.split(sep).join('/')

const repoRelative = (absolutePath: string) => {
  const relativePath = toPosixPath(relative(repoRoot, absolutePath))
  if (relativePath === '' || relativePath.startsWith('..')) {
    throw new Error(`Path is outside the repository: ${absolutePath}`)
  }
  return relativePath
}

const isJsonObject = (value: JsonValue): value is Record<string, JsonValue> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
)

const jsonObject = (value: JsonValue, context: string): Record<string, JsonValue> => {
  if (!isJsonObject(value)) {
    throw new Error(`Expected JSON object: ${context}`)
  }
  return value
}

const optionalString = (value: unknown) => (
  typeof value === 'string' && value.trim() ? value.trim() : null
)

const optionalNumber = (value: unknown) => (
  typeof value === 'number' && Number.isFinite(value) ? value : null
)

const listZipEntries = (zipPath: string) => execFileSync('zipinfo', ['-1', zipPath], {
  encoding: 'utf8',
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})
  .split(/\r?\n/u)
  .filter(Boolean)

const readZipEntryJson = (zipPath: string, entryPath: string) => JSON.parse(execFileSync('unzip', ['-p', zipPath, entryPath], {
  encoding: 'utf8',
  maxBuffer: ZIP_COMMAND_MAX_BUFFER_BYTES,
  stdio: ['ignore', 'pipe', 'pipe'],
})) as JsonValue

const archiveRootFrom = (entries: string[]) => {
  const roots = new Set(entries.map((entry) => entry.split('/')[0]).filter(Boolean))
  return roots.size === 1 ? [...roots][0] : null
}

const sourceGoalIdFromMapping = (mapping: Record<string, JsonValue>) => (
  optionalString(mapping.sourceGoalId)
    ?? optionalString(mapping.legacyGoalId)
    ?? optionalString(mapping.reviewDecisionId)
)

const sourceGoalEvidence = ({ source, goal, artifactPath }: SourceReferenceMatch): SourceGoalEvidence => ({
  artifactPath,
  extractionId: optionalString(source.extractionId) ?? '(unknown-extraction)',
  sourceLandscapeId: optionalString(source.sourceLandscapeId),
  jurisdiction: optionalString(source.jurisdiction),
  subject: optionalString(source.subject),
  stage: optionalString(source.stage),
  sourceGoalId: String(goal.sourceGoalId),
  title: optionalString(goal.title),
  description: optionalString(goal.description),
  topicCode: optionalString(goal.topicCode),
  sourceText: typeof goal.sourceText === 'string' ? goal.sourceText : '',
  sourceTextSha256: optionalString(goal.sourceTextSha256),
  sourceSpan: optionalString(goal.sourceSpan),
  parentBulletText: optionalString(goal.parentBulletText),
  sourceRef: optionalString(goal.sourceRef),
  sourcePage: optionalNumber(goal.sourcePage),
  sourceLine: optionalNumber(goal.sourceLine),
  sourceDocumentKey: optionalString(goal.sourceDocumentKey),
  sourceDocumentTitle: optionalString(goal.sourceDocumentTitle),
  sourceDocumentUrl: optionalString(goal.sourceDocumentUrl),
  sourceDocumentLandingUrl: optionalString(goal.sourceDocumentLandingUrl),
})

export const selectSourceTraceEvidence = (
  sourceGoalReferences: unknown,
  mappings: MappingEvidence[],
  query: Pick<CliOptions, 'sourceGoalId' | 'sourceArtifactPath' | 'canonicalGoalId'>,
  packagePaths: { artifactPaths?: ReadonlySet<string>; mappingPaths?: ReadonlySet<string> } = {},
) => {
  const parsed = parseSubjectExportSourceReferences(sourceGoalReferences, packagePaths)
  if (parsed.issues.length > 0) throw new Error(`Invalid source-goal reference index: ${parsed.issues.join('; ')}`)
  if (query.sourceArtifactPath && parsed.schemaVersion !== 2) {
    throw new Error('--source-artifact-path requires a version 2 source-goal reference index')
  }
  if (query.sourceArtifactPath && !parsed.sources.some((source) => source.artifactPath === query.sourceArtifactPath)) {
    throw new Error(`Unknown source artifact path: ${query.sourceArtifactPath}`)
  }
  const byId = new Map<string, SourceGoalEvidence[]>()
  parsed.sources.forEach((source) => source.sourceGoals.forEach((goal) => {
    const evidence = sourceGoalEvidence({ artifactPath: source.artifactPath, source, goal })
    byId.set(evidence.sourceGoalId, [...(byId.get(evidence.sourceGoalId) ?? []), evidence])
  }))
  let selectedSourceGoals: SourceGoalEvidence[] = []
  if (query.sourceGoalId) {
    const candidates = byId.get(query.sourceGoalId) ?? []
    if (!query.sourceArtifactPath && candidates.length > 1) {
      throw new Error(`Ambiguous source goal ID ${query.sourceGoalId}; use --source-artifact-path with one of: ${candidates.map((goal) => goal.artifactPath).join(', ')}`)
    }
    selectedSourceGoals = candidates.filter((goal) => !query.sourceArtifactPath || goal.artifactPath === query.sourceArtifactPath)
    if (query.sourceArtifactPath && selectedSourceGoals.length === 0) {
      throw new Error(`No source goal ${query.sourceGoalId} in source artifact ${query.sourceArtifactPath}`)
    }
  }
  const matchingMappings = mappings
    .filter((mapping) => (!query.sourceGoalId || mapping.sourceGoalId === query.sourceGoalId)
      && (!query.canonicalGoalId || mapping.canonicalGoalId === query.canonicalGoalId))
    .flatMap((mapping) => {
      const matches = mapping.sourceGoalId ? parsed.resolveMapping(mapping.mappingPath, mapping.sourceGoalId) : []
      if (mapping.sourceGoalId && matches.length === 0) {
        throw new Error(`Unresolved source goal ${mapping.sourceGoalId} in mapping ${mapping.mappingPath}`)
      }
      const selected = matches.filter((match) => !query.sourceArtifactPath || match.artifactPath === query.sourceArtifactPath)
      if (query.sourceArtifactPath && selected.length === 0) return []
      if (!query.sourceGoalId) selectedSourceGoals.push(...selected.map(sourceGoalEvidence))
      return [{ ...mapping, sourceArtifactPaths: [...new Set(selected.map((match) => match.artifactPath))] }]
    })
  const sourceGoals = new Map(selectedSourceGoals.map((goal) => [JSON.stringify([goal.artifactPath, goal.sourceGoalId]), goal]))
  return { sourceGoals: [...sourceGoals.values()], mappings: matchingMappings }
}

const buildCanonicalGoalIndex = (canonicalLandscape: JsonValue) => {
  const data = jsonObject(canonicalLandscape, 'canonical landscape')
  const goals = Array.isArray(data.goals) ? data.goals.map((goal) => jsonObject(goal, 'canonical goal')) : []
  return new Map(goals.flatMap((goal) => {
    const id = optionalString(goal.id)
    if (!id) return []
    return [[id, {
      id,
      title: optionalString(goal.title),
      description: optionalString(goal.description),
      phase: optionalString(goal.phase),
      area: optionalString(goal.area),
    } satisfies CanonicalGoal]]
  }))
}

const mappingEvidenceFromZip = (zipPath: string, mappingEntries: string[]) => mappingEntries.flatMap((entryPath) => {
  const data = jsonObject(readZipEntryJson(zipPath, entryPath), entryPath)
  const records = Array.isArray(data.decisions) ? data.decisions : Array.isArray(data.mappings) ? data.mappings : []
  const mappings = records.map((mapping) => jsonObject(mapping, `${entryPath}:mapping`))
  return mappings.flatMap((mapping) => {
    const canonicalGoalId = optionalString(mapping.canonicalGoalId)
    const canonicalGoalIds = canonicalGoalId ? [canonicalGoalId]
      : Array.isArray(mapping.canonicalGoalIds) ? mapping.canonicalGoalIds.map(optionalString).filter((id): id is string => id !== null) : []
    return (canonicalGoalIds.length > 0 ? canonicalGoalIds : [null]).map((targetId) => ({
      mappingPath: entryPath.split('/').slice(1).join('/'),
      reviewId: optionalString(data.reviewId),
      sourceLandscapeId: optionalString(data.sourceLandscapeId),
      targetLandscapeId: optionalString(data.targetLandscapeId),
      legacyGoalId: optionalString(mapping.legacyGoalId),
      reviewDecisionId: optionalString(mapping.reviewDecisionId),
      sourceGoalId: sourceGoalIdFromMapping(mapping),
      canonicalGoalId: targetId,
      matchType: optionalString(mapping.matchType),
      jurisdiction: optionalString(data.jurisdiction) ?? entryPath.match(/\/data\/mappings\/(DE-[A-Z]{2})\//u)?.[1] ?? null,
      stage: optionalString(data.stage) ?? entryPath.match(/\/data\/mappings\/DE-[A-Z]{2}\/([^/]+)\//u)?.[1] ?? null,
    } satisfies MappingEvidence))
  })
})

const truncate = (value: string | null, maxLength = 360) => {
  if (!value) return ''
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}...`
}

const escapeTableCell = (value: string | null) => (value ?? '').replace(/\|/gu, '\\|').replace(/\r?\n/gu, '<br>')

const buildMarkdown = (result: {
  zipPath: string
  archiveRoot: string
  sourceGoalId: string | null
  sourceArtifactPath: string | null
  canonicalGoalId: string | null
  sourceGoals: SourceGoalEvidence[]
  mappings: MappingEvidence[]
  canonicalGoals: CanonicalGoal[]
  limit: number
}) => {
  const sourceGoalSections = result.sourceGoals.length === 0
    ? 'No source-goal evidence found for the requested source goal ID.'
    : result.sourceGoals.map((sourceGoal) => `### Source Goal \`${sourceGoal.sourceGoalId}\`

| Field | Value |
| --- | --- |
| Extraction | \`${sourceGoal.extractionId}\` |
| Source artifact | ${sourceGoal.artifactPath ? `\`${sourceGoal.artifactPath}\`` : '(legacy globally unique ID)'} |
| Jurisdiction | ${sourceGoal.jurisdiction ?? ''} |
| Subject / stage | ${[sourceGoal.subject, sourceGoal.stage].filter(Boolean).join(' / ')} |
| Topic | ${sourceGoal.topicCode ?? ''} |
| Title | ${escapeTableCell(sourceGoal.title)} |
| Source span | ${escapeTableCell(sourceGoal.sourceSpan)} |
| Source ref | ${escapeTableCell(sourceGoal.sourceRef)} |
| Page / line | ${[sourceGoal.sourcePage, sourceGoal.sourceLine].filter((value) => value !== null).join(' / ')} |
| Source text SHA-256 | \`${sourceGoal.sourceTextSha256 ?? ''}\` |
| Official document | ${escapeTableCell(sourceGoal.sourceDocumentTitle)} |
| Official URL | ${sourceGoal.sourceDocumentUrl ?? ''} |

Source text:

\`\`\`text
${sourceGoal.sourceText}
\`\`\``).join('\n\n')

  const canonicalRows = result.canonicalGoals.slice(0, result.limit)
    .map((goal) => `| \`${goal.id}\` | ${escapeTableCell(goal.title)} | ${escapeTableCell(goal.phase)} | ${escapeTableCell(goal.area)} | ${escapeTableCell(truncate(goal.description, 180))} |`)
    .join('\n')
  const mappingRows = result.mappings.slice(0, result.limit)
    .map((mapping) => `| \`${mapping.sourceGoalId ?? ''}\` | \`${mapping.canonicalGoalId ?? ''}\` | ${escapeTableCell(mapping.matchType)} | ${escapeTableCell(mapping.jurisdiction)} | ${escapeTableCell(mapping.stage)} | \`${mapping.mappingPath}\` |`)
    .join('\n')

  return `# Source Trace

ZIP: \`${result.zipPath}\`

Archive root: \`${result.archiveRoot}\`

Query:

- Source goal ID: ${result.sourceGoalId ? `\`${result.sourceGoalId}\`` : '-'}
- Source artifact path: ${result.sourceArtifactPath ? `\`${result.sourceArtifactPath}\`` : '-'}
- Canonical goal ID: ${result.canonicalGoalId ? `\`${result.canonicalGoalId}\`` : '-'}

## Source Evidence

${sourceGoalSections}

## Canonical Goal${result.canonicalGoals.length === 1 ? '' : 's'}

${result.canonicalGoals.length === 0 ? 'No canonical goal found for this trace.' : `| Canonical ID | Title | Phase | Area | Description |
| --- | --- | --- | --- | --- |
${canonicalRows}`}

## Mapping Evidence

${result.mappings.length === 0 ? 'No review mapping found for this trace.' : `Showing ${Math.min(result.limit, result.mappings.length)} of ${result.mappings.length} mapping record(s).

| Source goal ID | Canonical goal ID | Match | Jurisdiction | Stage | Mapping file |
| --- | --- | --- | --- | --- | --- |
${mappingRows}`}
`
}

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    process.stdout.write(usage())
    return
  }
  if (!options.zipPath) {
    throw new Error('Missing required --zip')
  }
  if (!existsSync(options.zipPath)) {
    throw new Error(`ZIP does not exist: ${repoRelative(options.zipPath)}`)
  }
  if (!options.sourceGoalId && !options.canonicalGoalId) {
    throw new Error('Provide --source-goal-id or --canonical-goal-id')
  }

  const entries = listZipEntries(options.zipPath)
  const archiveRoot = archiveRootFrom(entries)
  if (!archiveRoot) {
    throw new Error('ZIP must have exactly one archive root.')
  }

  const sourceGoalReferencesPath = entries.find((entry) => entry.endsWith('/data/sources/source-goal-references.json'))
  const canonicalPath = entries.find((entry) => entry.startsWith(`${archiveRoot}/data/canonical/`) && entry.endsWith('.landscape.json'))
  const mappingEntries = entries
    .filter((entry) => entry.startsWith(`${archiveRoot}/data/mappings/`) && entry.endsWith('.review.json'))
    .sort((left, right) => left.localeCompare(right))

  if (!sourceGoalReferencesPath) {
    throw new Error('Missing data/sources/source-goal-references.json')
  }
  if (!canonicalPath) {
    throw new Error('Missing data/canonical/*.landscape.json')
  }

  const canonicalGoalIndex = buildCanonicalGoalIndex(readZipEntryJson(options.zipPath, canonicalPath))
  const mappingEvidence = mappingEvidenceFromZip(options.zipPath, mappingEntries)
  const trace = selectSourceTraceEvidence(
    readZipEntryJson(options.zipPath, sourceGoalReferencesPath),
    mappingEvidence,
    options,
    {
      artifactPaths: new Set(entries.map((entry) => entry.slice(archiveRoot.length + 1))),
      mappingPaths: new Set(mappingEntries.map((entry) => entry.slice(archiveRoot.length + 1))),
    },
  )
  const matchingMappings = trace.mappings
  const canonicalGoalIds = new Set([
    ...(options.canonicalGoalId ? [options.canonicalGoalId] : []),
    ...matchingMappings.flatMap((mapping) => (mapping.canonicalGoalId ? [mapping.canonicalGoalId] : [])),
  ])
  const sourceGoals = trace.sourceGoals.slice(0, options.limit)
  const canonicalGoals = [...canonicalGoalIds]
    .flatMap((canonicalGoalId) => {
      const goal = canonicalGoalIndex.get(canonicalGoalId)
      return goal ? [goal] : []
    })
    .slice(0, options.limit)

  const result = {
    zipPath: repoRelative(options.zipPath),
    archiveRoot,
    query: {
      sourceGoalId: options.sourceGoalId,
      sourceArtifactPath: options.sourceArtifactPath,
      canonicalGoalId: options.canonicalGoalId,
    },
    sourceGoals,
    canonicalGoals,
    mappings: matchingMappings.slice(0, options.limit),
    counts: {
      sourceGoals: sourceGoals.length,
      canonicalGoals: canonicalGoals.length,
      mappings: matchingMappings.length,
    },
  }

  if (options.format === 'json') {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  process.stdout.write(buildMarkdown({
    zipPath: result.zipPath,
    archiveRoot,
    sourceGoalId: options.sourceGoalId,
    sourceArtifactPath: options.sourceArtifactPath,
    canonicalGoalId: options.canonicalGoalId,
    sourceGoals,
    mappings: matchingMappings,
    canonicalGoals,
    limit: options.limit,
  }))
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}
