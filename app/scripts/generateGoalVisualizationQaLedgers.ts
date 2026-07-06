import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type YesNo = 'yes' | 'no'

interface GoalVisualizationQaRecord {
  goalId: string
  title: string
  description: string
  subject: string
  landscapeId: string
  landscapePath: string
  imageUrl: string
  publicAssetPath: string
  canonicalAssetPath: string
  assetSha256: string
  umlautsCorrectChatGpt: YesNo
  contentApprovedChatGpt: YesNo
  humanApproved: YesNo
  humanIssueIdentified: YesNo
  humanIssueDescription: string
  chatGptReviewedAt: string | null
  chatGptReviewer: string
  chatGptNotes: string
  humanReviewedAt: string | null
  humanReviewer: string
}

interface GoalVisualizationQaLedger {
  schemaVersion: 1
  subject: string
  source: {
    canonicalRoot: string
    publicAssetRoot: string
  }
  records: GoalVisualizationQaRecord[]
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../..')
const canonicalRoot = path.join(repoRoot, 'curricula/DE/Gymnasium/canonical')
const publicAssetRoot = path.join(repoRoot, 'app/public/assets/goal-visualizations')
const canonicalAssetRoot = path.join(repoRoot, 'curricula/DE/Gymnasium/visualizations')
const qaRoot = path.join(repoRoot, 'curricula/DE/Gymnasium/quality/goal-visualization-qa')

const toPosixPath = (value: string): string => value.split(path.sep).join('/')
const repoRelative = (absolutePath: string): string => toPosixPath(path.relative(repoRoot, absolutePath))
const normalizeText = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim()
const normalizeYesNo = (value: unknown): YesNo => value === 'yes' ? 'yes' : 'no'

const parseArgs = (argv = process.argv.slice(2)): Record<string, string | boolean> => {
  const args: Record<string, string | boolean> = {}
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) continue
    const eq = arg.indexOf('=')
    if (eq > 2) {
      args[arg.slice(2, eq)] = arg.slice(eq + 1)
      continue
    }
    const key = arg.slice(2)
    const next = argv[index + 1]
    if (next && !next.startsWith('--')) {
      args[key] = next
      index += 1
    } else {
      args[key] = true
    }
  }
  return args
}

const collectFiles = (directory: string, predicate: (fileName: string) => boolean, result: string[] = []): string[] => {
  if (!existsSync(directory)) return result
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      collectFiles(absolutePath, predicate, result)
      continue
    }
    if (entry.isFile() && predicate(entry.name)) {
      result.push(absolutePath)
    }
  }
  return result
}

const hashFile = (absolutePath: string): string => {
  if (!existsSync(absolutePath)) return ''
  return `sha256:${createHash('sha256').update(readFileSync(absolutePath)).digest('hex')}`
}

const isGoalVisualizationLink = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const link = value as Record<string, unknown>
  return link.type === 'goal-visualization' || link.resourceType === 'goal-visualization'
}

const subjectFromImageUrl = (url: string): string => {
  const match = url.match(/^\/assets\/goal-visualizations\/([^/]+)\//u)
  return match?.[1] ?? ''
}

const publicAssetPathFromUrl = (url: string): string => {
  const relativeUrl = url.replace(/^\/+/, '')
  return path.join(repoRoot, 'app/public', relativeUrl.replace(/^assets\//u, 'assets/'))
}

const canonicalAssetPathFromUrl = (url: string): string => {
  const match = url.match(/^\/assets\/goal-visualizations\/([^/]+)\/([^/]+)\/([^/]+)$/u)
  if (!match) return ''
  return path.join(canonicalAssetRoot, match[1] ?? '', match[2] ?? '', match[3] ?? '')
}

const readExistingLedger = (subject: string): GoalVisualizationQaLedger | null => {
  const ledgerPath = path.join(qaRoot, `${subject}.qa.json`)
  if (!existsSync(ledgerPath)) return null
  const parsed = JSON.parse(readFileSync(ledgerPath, 'utf8')) as Partial<GoalVisualizationQaLedger>
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.records)) return null
  return parsed as GoalVisualizationQaLedger
}

const createDefaultRecord = (row: Omit<GoalVisualizationQaRecord,
  | 'umlautsCorrectChatGpt'
  | 'contentApprovedChatGpt'
  | 'humanApproved'
  | 'humanIssueIdentified'
  | 'humanIssueDescription'
  | 'chatGptReviewedAt'
  | 'chatGptReviewer'
  | 'chatGptNotes'
  | 'humanReviewedAt'
  | 'humanReviewer'
>): GoalVisualizationQaRecord => ({
  ...row,
  umlautsCorrectChatGpt: 'no',
  contentApprovedChatGpt: 'no',
  humanApproved: 'no',
  humanIssueIdentified: 'no',
  humanIssueDescription: '',
  chatGptReviewedAt: null,
  chatGptReviewer: '',
  chatGptNotes: '',
  humanReviewedAt: null,
  humanReviewer: '',
} as GoalVisualizationQaRecord)

const normalizeExistingRecord = (
  current: GoalVisualizationQaRecord,
  existing: (Partial<GoalVisualizationQaRecord> & Record<string, unknown>) | undefined,
): GoalVisualizationQaRecord => {
  if (!existing || existing.assetSha256 !== current.assetSha256) {
    return current
  }

  return {
    ...current,
    umlautsCorrectChatGpt: normalizeYesNo(existing.umlautsCorrectChatGpt ?? existing.umlauteRichtigChatGpt),
    contentApprovedChatGpt: normalizeYesNo(existing.contentApprovedChatGpt ?? existing.inhaltlichApprovedChatGpt),
    humanApproved: normalizeYesNo(existing.humanApproved ?? existing.approvedHuman),
    humanIssueIdentified: normalizeYesNo(existing.humanIssueIdentified ?? existing.fehlerIdentifiziertHuman),
    humanIssueDescription: normalizeText(existing.humanIssueDescription ?? existing.fehlerbeschreibungHuman),
    chatGptReviewedAt: typeof existing.chatGptReviewedAt === 'string' && existing.chatGptReviewedAt.trim()
      ? existing.chatGptReviewedAt.trim()
      : null,
    chatGptReviewer: normalizeText(existing.chatGptReviewer),
    chatGptNotes: normalizeText(existing.chatGptNotes),
    humanReviewedAt: typeof existing.humanReviewedAt === 'string' && existing.humanReviewedAt.trim()
      ? existing.humanReviewedAt.trim()
      : null,
    humanReviewer: normalizeText(existing.humanReviewer),
  } as GoalVisualizationQaRecord
}

const buildLedgers = (subjects: Set<string> | null): GoalVisualizationQaLedger[] => {
  const rowsBySubject = new Map<string, GoalVisualizationQaRecord[]>()
  const canonicalFiles = collectFiles(canonicalRoot, (fileName) => /\.json$/iu.test(fileName)).sort()

  for (const absoluteLandscapePath of canonicalFiles) {
    const landscape = JSON.parse(readFileSync(absoluteLandscapePath, 'utf8')) as Record<string, unknown>
    if (typeof landscape.landscapeId !== 'string' || !Array.isArray(landscape.goals)) continue

    for (const rawGoal of landscape.goals) {
      if (!rawGoal || typeof rawGoal !== 'object' || Array.isArray(rawGoal)) continue
      const goal = rawGoal as Record<string, unknown>
      const goalId = normalizeText(goal.id)
      if (!goalId) continue
      const links = Array.isArray(goal.resourceLinks) ? goal.resourceLinks.filter(isGoalVisualizationLink) : []
      for (const link of links) {
        if (link.role && link.role !== 'primary') continue
        const imageUrl = normalizeText(link.url)
        const subject = subjectFromImageUrl(imageUrl)
        if (!subject || (subjects && !subjects.has(subject))) continue
        const publicAssetPath = publicAssetPathFromUrl(imageUrl)
        const canonicalAssetPath = canonicalAssetPathFromUrl(imageUrl)
        const row = createDefaultRecord({
          goalId,
          title: normalizeText(goal.title),
          description: normalizeText(goal.description),
          subject,
          landscapeId: normalizeText(landscape.landscapeId),
          landscapePath: repoRelative(absoluteLandscapePath),
          imageUrl,
          publicAssetPath: repoRelative(publicAssetPath),
          canonicalAssetPath: canonicalAssetPath ? repoRelative(canonicalAssetPath) : '',
          assetSha256: hashFile(publicAssetPath),
        })
        const rows = rowsBySubject.get(subject) ?? []
        rows.push(row)
        rowsBySubject.set(subject, rows)
      }
    }
  }

  return [...rowsBySubject.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([subject, records]) => {
      const existingLedger = readExistingLedger(subject)
      const existingByGoalAndUrl = new Map(
        (existingLedger?.records ?? []).map((record) => [`${record.goalId}\n${record.imageUrl}`, record] as const),
      )
      const deduped = new Map<string, GoalVisualizationQaRecord>()
      records.forEach((record) => {
        const key = `${record.goalId}\n${record.imageUrl}`
        const existing = existingByGoalAndUrl.get(key)
        deduped.set(key, normalizeExistingRecord(record, existing))
      })
      return {
        schemaVersion: 1,
        subject,
        source: {
          canonicalRoot: 'curricula/DE/Gymnasium/canonical',
          publicAssetRoot: 'app/public/assets/goal-visualizations',
        },
        records: [...deduped.values()].sort((left, right) =>
          left.title.localeCompare(right.title, 'de-DE', { numeric: true, sensitivity: 'base' })
          || left.goalId.localeCompare(right.goalId)),
      }
    })
}

const serializeLedger = (ledger: GoalVisualizationQaLedger): string => `${JSON.stringify(ledger, null, 2)}\n`

const main = () => {
  const args = parseArgs()
  const checkMode = args.check === true
  const rawSubjects = typeof args.subjects === 'string'
    ? args.subjects
    : typeof args.subject === 'string'
      ? args.subject
      : ''
  const subjects = rawSubjects
    ? new Set(rawSubjects.split(',').map((entry) => entry.trim()).filter(Boolean))
    : null

  const ledgers = buildLedgers(subjects)
  if (ledgers.length === 0) {
    throw new Error('No goal visualization links found for the selected subject scope.')
  }

  mkdirSync(qaRoot, { recursive: true })
  const staleFiles: string[] = []
  ledgers.forEach((ledger) => {
    const outputPath = path.join(qaRoot, `${ledger.subject}.qa.json`)
    const nextContent = serializeLedger(ledger)
    if (checkMode) {
      const currentContent = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : ''
      if (currentContent !== nextContent) {
        staleFiles.push(repoRelative(outputPath))
      }
      return
    }
    writeFileSync(outputPath, nextContent, 'utf8')
    console.log(`Wrote ${repoRelative(outputPath)} (${ledger.records.length} records)`)
  })

  if (checkMode && staleFiles.length > 0) {
    console.error(`Goal visualization QA ledger(s) are stale:\n${staleFiles.map((file) => `- ${file}`).join('\n')}`)
    process.exit(1)
  }
  if (checkMode) {
    console.log(`Goal visualization QA ledgers are up to date (${ledgers.length} subject file(s)).`)
  }
}

main()
