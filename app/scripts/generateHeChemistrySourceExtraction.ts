import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'LK' | 'unspecified'

interface SourceDocument {
  key: string
  title: string
  path: string
  official: true
}

interface TopicSpec {
  code: string
  sourceCode?: string
  title: string
  page: number
  courseLevel: CourseLevel
}

interface Passage {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  rawText: string
  sourceGoalIds: string[]
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
  bulletIndex: number
  aspectIndex: number
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  courseLevel: CourseLevel
  granularity: 'officialCompetencyAspect' | 'officialContentRowAspect'
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

interface PipelineCheck {
  id: string
  label: string
  passed: boolean
  details: string
}

interface PipelineStep {
  id: 'MAPPING-1' | 'MAPPING-2' | 'MAPPING-3'
  label: string
  status: 'complete' | 'incomplete' | 'blocked'
  dependsOn: string[]
  checks: PipelineCheck[]
}

interface ExtractionConfig {
  extractionId: string
  sourceLandscapeId: string
  jurisdiction: 'DE-HE'
  subject: 'Chemie'
  stage: Stage
  title: string
  sourceDocument: SourceDocument
  expectedTopics: TopicSpec[]
  outputPath: string
  reviewPath: string
  passageExtractionMethod: string
  sourceGoalExtractionMethod: string
}

interface ParsedTopic {
  spec: TopicSpec
  rawText: string
  sourceGoalTexts: Array<{
    parentBulletText: string
    sourceText: string
    courseLevel: CourseLevel
  }>
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(appRoot, '..')

const toPosix = (value: string) => value.split(path.sep).join('/')
const repoPath = (absolutePath: string) => toPosix(path.relative(repoRoot, absolutePath))

const configs: ExtractionConfig[] = [
  {
    extractionId: 'DE-HE-CHEMIE-SEKI-G9',
    sourceLandscapeId: 'bea90c22-b9c5-4c0c-9b10-89d875f50772',
    jurisdiction: 'DE-HE',
    subject: 'Chemie',
    stage: 'SekI',
    title: 'Chemie Sekundarstufe I (Hessen, G9 Source-Extraction)',
    sourceDocument: {
      key: 'G9',
      title: 'Lehrplan Chemie Gymnasium Hessen G9',
      path: 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',
      official: true,
    },
    expectedTopics: [
      { code: '8.1', title: 'Stoffe - Strukturen - Eigenschaften', page: 11, courseLevel: 'unspecified' },
      { code: '8.2', title: 'Die chemische Reaktion - Stoffumsatz und Energieumsatz', page: 14, courseLevel: 'unspecified' },
      { code: '9.1', title: 'Einführung in die chemische Symbolsprache und ihre Anwendung', page: 16, courseLevel: 'unspecified' },
      { code: '9.2', title: 'Elementgruppen', page: 18, courseLevel: 'unspecified' },
      { code: '9.3', title: 'Elektrolyse und Ionenbegriff', page: 20, courseLevel: 'unspecified' },
      { code: '10.1', title: 'Atombau, Periodensystem und Ionenbindung', page: 21, courseLevel: 'unspecified' },
      { code: '10.2', title: 'Elektronenpaarbindung / Atombindung', page: 23, courseLevel: 'unspecified' },
      { code: '10.3', title: 'Säuren, Laugen, Salze / Protolysereaktionen', page: 24, courseLevel: 'unspecified' },
      { code: '10.4', title: 'Brennstoffe: Erdöl und Erdgas', page: 26, courseLevel: 'unspecified' },
    ],
    outputPath: 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_CHEMIE_SEKI_G9.source-extraction.json',
    reviewPath: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    passageExtractionMethod: 'pdftotext -layout; segmented by official Hessen G9 Chemie topic headings 8.1-10.4',
    sourceGoalExtractionMethod: 'one source goal per official verbindliche Unterrichtsinhalts row aspect; original row text retained in parentBulletText',
  },
  {
    extractionId: 'DE-HE-CHEMIE-SEKII-KC2024',
    sourceLandscapeId: '2f391ba2-ba1e-40e4-a8d2-dff049516c13',
    jurisdiction: 'DE-HE',
    subject: 'Chemie',
    stage: 'SekII',
    title: 'Chemie Oberstufe (Hessen, KC 2024 Source-Extraction)',
    sourceDocument: {
      key: 'KC2024',
      title: 'Kerncurriculum Chemie gymnasiale Oberstufe Hessen 2024',
      path: 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf',
      official: true,
    },
    expectedTopics: [
      { code: 'E.1', title: 'Redoxreaktionen', page: 35, courseLevel: 'GK_LK' },
      { code: 'E.2', title: 'Protolysereaktionen', page: 35, courseLevel: 'GK_LK' },
      { code: 'E.3', title: 'Einführung in die Chemie organischer Verbindungen', page: 36, courseLevel: 'GK_LK' },
      { code: 'E.4', title: 'Erdöl und Erdgas - Brennstoffe in der Diskussion', page: 36, courseLevel: 'GK_LK' },
      { code: 'E.5', title: 'Mobile Energiewandler', page: 36, courseLevel: 'GK_LK' },
      { code: 'Q1.1', title: 'Chemische Bindung und Strukturen ausgewählter anorganischer und organischer Stoffe', page: 38, courseLevel: 'GK_LK' },
      { code: 'Q1.2', title: 'Alkanole und Carbonylverbindungen', page: 39, courseLevel: 'GK_LK' },
      { code: 'Q1.3', title: 'Alkansäuren und ihre Derivate', page: 39, courseLevel: 'GK_LK' },
      { code: 'Q1.4', title: 'Seifen', page: 40, courseLevel: 'GK_LK' },
      { code: 'Q1.5', title: 'Konservierungsstoffe', page: 40, courseLevel: 'GK_LK' },
      { code: 'Q2.1', title: 'Naturstoffe', page: 42, courseLevel: 'GK_LK' },
      { code: 'Q2.2', title: 'Grundlagen der Kunststoffchemie', page: 43, courseLevel: 'GK_LK' },
      { code: 'Q2.3', title: 'Chemie der Aromaten', page: 43, courseLevel: 'GK_LK' },
      { code: 'Q2.4', title: 'Organische Werkstoffe', page: 44, courseLevel: 'GK_LK' },
      { code: 'Q3.1', title: 'Chemische Gleichgewichte und ihre Einstellung', page: 46, courseLevel: 'GK_LK' },
      { code: 'Q3.2', title: 'Protolysegleichgewichte', page: 46, courseLevel: 'GK_LK' },
      { code: 'Q3.3', title: 'Redoxgleichgewichte', page: 47, courseLevel: 'GK_LK' },
      { code: 'Q3.4', title: 'Puffersysteme - Säure-Base-Puffer', page: 48, courseLevel: 'GK_LK' },
      { code: 'Q3.5', title: 'Geschwindigkeit chemischer Reaktionen', page: 48, courseLevel: 'GK_LK' },
      { code: 'Q4.1', title: 'Energetische und kinetische Aspekte chemischer Reaktionen', page: 49, courseLevel: 'GK_LK' },
      { code: 'Q4.2', title: 'Nachhaltige Chemie und Energieumwandlung in der Technik', page: 50, courseLevel: 'GK_LK' },
      { code: 'Q4.3', sourceCode: 'Q.4.3', title: 'Nachhaltige Chemie am Beispiel eines modernen Waschmittels', page: 50, courseLevel: 'GK_LK' },
    ],
    outputPath: 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json',
    reviewPath: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    passageExtractionMethod: 'pdftotext -layout; segmented by official Chemie topic-field headings E.*, Q1.* to Q4.*',
    sourceGoalExtractionMethod: 'one source goal per official bullet aspect in each topic passage; original bullet text retained in parentBulletText',
  },
]

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 8)
}

function topicSlug(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function readPdfText(sourceDocument: SourceDocument): string {
  const pdfPath = path.resolve(repoRoot, sourceDocument.path)
  return execFileSync('pdftotext', ['-layout', pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
    .replace(/\r/g, '')
    .replace(/\u00ad\s*\n\s*/g, '')
    .replace(/\u00ad/g, '')
}

function normalizeInline(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/([A-Za-zÄÖÜäöüß])- ([a-zäöüß]{2,})/g, (match, prefix: string, suffix: string) =>
      /^(und|oder)$/.test(suffix) ? `${prefix}- ${suffix}` : `${prefix}${suffix}`)
    .replace(/,\s*(?=[A-Za-zÄÖÜäöüß])/g, ', ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()
}

function appendInline(base: string, addition: string): string {
  const normalizedAddition = normalizeInline(addition)
  if (!base) return normalizedAddition
  if (!normalizedAddition) return base
  if (/[A-Za-zÄÖÜäöüß]-$/.test(base) && /^[a-zäöüß]/.test(normalizedAddition)) {
    return `${base.slice(0, -1)}${normalizedAddition}`
  }
  return `${base} ${normalizedAddition}`.trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function lineOffsets(text: string): Array<{ line: string; offset: number }> {
  const lines: Array<{ line: string; offset: number }> = []
  let offset = 0
  text.split(/\n/).forEach((line) => {
    lines.push({ line, offset })
    offset += line.length + 1
  })
  return lines
}

function findSekITopicStarts(text: string, topics: TopicSpec[]): Array<{ spec: TopicSpec; start: number }> {
  const lines = lineOffsets(text)
  return topics.map((spec) => {
    const codePattern = new RegExp(`^\\s*${escapeRegExp(spec.sourceCode ?? spec.code)}\\s+`)
    const match = lines.find(({ line }) => codePattern.test(line) && line.includes('Std.:'))
    if (!match) {
      throw new Error(`Could not find Sek I Chemie topic heading ${spec.code}`)
    }
    return { spec, start: match.offset }
  }).sort((left, right) => left.start - right.start)
}

function findSekIITopicStarts(text: string, topics: TopicSpec[]): Array<{ spec: TopicSpec; start: number }> {
  const lines = lineOffsets(text)
  return topics.map((spec) => {
    const codePattern = new RegExp(`^\\s*${escapeRegExp(spec.sourceCode ?? spec.code)}\\s+`)
    const match = lines.findLast(({ line }) => codePattern.test(line))
    if (!match) {
      throw new Error(`Could not find Sek II Chemie topic heading ${spec.code}`)
    }
    return { spec, start: match.offset }
  }).sort((left, right) => left.start - right.start)
}

function topicSegments(
  text: string,
  starts: Array<{ spec: TopicSpec; start: number }>,
): Array<{ spec: TopicSpec; segment: string }> {
  return starts.map((entry, index) => ({
    spec: entry.spec,
    segment: text.slice(entry.start, starts[index + 1]?.start ?? text.length),
  }))
}

function splitTableLine(raw: string): { left: string; right: string } {
  const body = raw.trim()
  const match = body.match(/^(.*?)\s{2,}(.+)$/)
  return match
    ? { left: normalizeInline(match[1]), right: normalizeInline(match[2]) }
    : { left: normalizeInline(body), right: '' }
}

function isSekITableContinuation(raw: string): boolean {
  return /^\s{35,}\S/.test(raw)
}

function skipSekITableLine(value: string): boolean {
  return !value
    || /^\d+$/.test(value)
    || /^Bildungsgang/.test(value)
    || /^Querverweise/.test(value)
    || /^Berücksichtigung/.test(value)
    || /^Arbeitsmethoden/.test(value)
    || /^Begründung/.test(value)
    || /^Verbindliche/.test(value)
    || /^Fakultative/.test(value)
    || /^Der Unterricht/.test(value)
    || /^1\s+Die/.test(value)
    || /^1\.\d\s+Die Jahrgangsstufe/.test(value)
    || /^2\s+Übergangsprofil/.test(value)
}

function startsSekITableRow(raw: string): boolean {
  if (isSekITableContinuation(raw)) return false
  if (!/^\s{0,12}\S/.test(raw)) return false
  const trimmed = raw.trim()
  if (skipSekITableLine(trimmed)) return false
  return !/^zu\s+/.test(trimmed)
}

function shouldMergeBrokenLeftColumn(currentLeft: string, nextLeft: string): boolean {
  if (!currentLeft || !nextLeft) return false
  if (/^\d/.test(nextLeft)) return false
  if (currentLeft.endsWith('-') && /^[a-zäöüß]/.test(nextLeft)) return true
  if (/\b(wässrigen|wässrige|chemischen|organischen|anorganischen)$/.test(currentLeft)) return true
  return /\b(der|des|den|dem|von|und|oder|einer|eines|eine|einen)$/.test(currentLeft)
    && nextLeft.length <= 40
}

function repairKnownSekIRowArtifacts(value: string): string {
  return value
    .replace(
      /Größe und Masse von Atomen 6,023 ⋅ 1023\), Stoffmenge und ihre Einheit, molare Masse Masseneinheiten \(u, g\) und Proportionalitätsfaktor \(L =/,
      'Größe und Masse von Atomen; Stoffmenge und ihre Einheit; molare Masse; Masseneinheiten (u, g); Proportionalitätsfaktor L = 6,023 * 10^23',
    )
    .replace(/\(Umsetzungen der bisherigen Reaktionsschemata; vgl\. ([^)]+)\)/g, '(Umsetzungen der bisherigen Reaktionsschemata; vgl. $1)')
}

function pushSekITableRow(
  rows: string[],
  row: { left: string; rights: string[] } | null,
): void {
  if (!row) return
  const rightText = row.rights.join(' ')
  const sourceText = repairKnownSekIRowArtifacts(normalizeInline([row.left, rightText].filter(Boolean).join(' ')))
  if (rightText.trim().length > 0 && sourceText.length > 12) {
    rows.push(sourceText)
  }
}

function parseSekIRows(segment: string): string[] {
  const start = segment.indexOf('Verbindliche Unterrichtsinhalte/Aufgaben:')
  const end = segment.indexOf('Fakultative Unterrichtsinhalte/Aufgaben:')
  if (start < 0 || end < 0 || end <= start) return []

  const rows: string[] = []
  let currentRow: { left: string; rights: string[] } | null = null
  const block = segment.slice(start, end)

  block.split(/\n/).forEach((rawLine) => {
    const raw = rawLine.replace(/\f/g, '').trimEnd()
    const trimmed = raw.trim()
    if (skipSekITableLine(trimmed)) return

    if (isSekITableContinuation(raw)) {
      if (currentRow) {
        const last = currentRow.rights.pop() ?? ''
        currentRow.rights.push(appendInline(last, trimmed))
      }
      return
    }

    if (startsSekITableRow(raw)) {
      const { left, right } = splitTableLine(raw)
      if (currentRow && shouldMergeBrokenLeftColumn(currentRow.left, left)) {
        currentRow.left = currentRow.left.endsWith('-')
          ? `${currentRow.left.slice(0, -1)}${left}`
          : `${currentRow.left} ${left}`
        if (right) currentRow.rights.push(right)
        return
      }

      pushSekITableRow(rows, currentRow)
      currentRow = { left, rights: right ? [right] : [] }
      return
    }

    if (currentRow) {
      const { left, right } = splitTableLine(raw)
      if (left) {
        const last = currentRow.rights.pop() ?? ''
        currentRow.rights.push(appendInline(last, left))
      }
      if (right) currentRow.rights.push(right)
    }
  })

  pushSekITableRow(rows, currentRow)
  return rows
}

function isUpperNoiseLine(value: string): boolean {
  return !value
    || /^\d+$/.test(value)
    || /^HMKB\b/.test(value)
    || /^Chemie\b/.test(value)
    || /^Kerncurriculum\b/.test(value)
    || /^gymnasiale Oberstufe\b/.test(value)
    || /^Themenfelder\b/.test(value)
    || /^verbindlich:/.test(value)
    || /^je nach Länge/.test(value)
    || /^Aufgreifen von Inhalten/.test(value)
    || /^Erweiterung und Vertiefung/.test(value)
}

function parseSekIIBullets(segment: string, defaultCourseLevel: CourseLevel): Array<{
  parentBulletText: string
  sourceText: string
  courseLevel: CourseLevel
}> {
  const result: Array<{ parentBulletText: string; sourceText: string; courseLevel: CourseLevel }> = []
  let currentBullet = ''
  let currentLevel = defaultCourseLevel
  let bulletLevel = currentLevel
  let stopped = false

  const finishBullet = () => {
    if (!currentBullet) return
    splitSourceAspects(currentBullet).forEach((sourceText) => {
      result.push({
        parentBulletText: currentBullet,
        sourceText,
        courseLevel: bulletLevel,
      })
    })
    currentBullet = ''
  }

  segment.split(/\n/).forEach((rawLine) => {
    if (stopped) return
    const line = rawLine.replace(/\f/g, '').trimEnd()
    const trimmed = normalizeInline(line)
    if (!trimmed) return

    if (/^Hessisches Ministerium\b/.test(trimmed)) {
      finishBullet()
      stopped = true
      return
    }
    if (/^Q[1-4]\s+\S/.test(trimmed) && !/^Q[1-4]\.\d/.test(trimmed)) {
      finishBullet()
      stopped = true
      return
    }

    if (/^grundlegendes Niveau/.test(trimmed)) {
      finishBullet()
      currentLevel = 'GK_LK'
      return
    }
    if (/^erhöhtes Niveau/.test(trimmed) || /^erhoehtes Niveau/.test(trimmed)) {
      finishBullet()
      currentLevel = 'LK'
      return
    }
    if (isUpperNoiseLine(trimmed)) return
    if (/^(E\.\d|Q\d\.\d|Q\.4\.3)\s+/.test(trimmed)) return

    if (/^[–-]\s+/.test(trimmed)) {
      finishBullet()
      currentBullet = normalizeInline(trimmed.replace(/^[–-]\s+/, ''))
      bulletLevel = currentLevel
      return
    }

    if (currentBullet) {
      currentBullet = appendInline(currentBullet, trimmed)
    }
  })

  finishBullet()
  return result
}

function splitSourceAspects(sourceText: string): string[] {
  const normalized = normalizeInline(sourceText)
  const semicolonParts = normalized.split(/;\s+/).map((part) => part.trim()).filter(Boolean)
  const mergedSemicolonParts: string[] = []
  semicolonParts.forEach((part) => {
    if (
      mergedSemicolonParts.length > 0
      && (/^vgl\./i.test(part) || /^\(?z\.\s?B\./i.test(part) || /^\)?$/.test(part))
    ) {
      mergedSemicolonParts[mergedSemicolonParts.length - 1] = `${mergedSemicolonParts[mergedSemicolonParts.length - 1]}; ${part}`
      return
    }
    mergedSemicolonParts.push(part)
  })
  const firstPass = mergedSemicolonParts.length > 1 ? mergedSemicolonParts : [normalized]

  return firstPass.flatMap((part) => {
    const colonMatch = part.match(/^(.{6,90}?:)\s+(.+)$/)
    if (!colonMatch) return [part]

    const prefix = colonMatch[1]
    if (/\b(Beispiele|z\.\s?B\.)\s*:$/i.test(prefix)) return [part]
    const items = splitTopLevelCommas(colonMatch[2])
    const shortList = items.length >= 4 && items.every((entry) => entry.length <= 90)
    return shortList ? items.map((entry) => `${prefix} ${entry}`) : [part]
  })
}

function splitTopLevelCommas(value: string): string[] {
  const items: string[] = []
  let current = ''
  let parenDepth = 0

  for (const char of value) {
    if (char === '(') parenDepth += 1
    if (char === ')') parenDepth = Math.max(0, parenDepth - 1)
    if (char === ',' && parenDepth === 0) {
      if (current.trim()) items.push(current.trim())
      current = ''
      continue
    }
    current += char
  }

  if (current.trim()) items.push(current.trim())
  return items
}

function parseTopics(config: ExtractionConfig, text: string): ParsedTopic[] {
  const starts = config.stage === 'SekI'
    ? findSekITopicStarts(text, config.expectedTopics)
    : findSekIITopicStarts(text, config.expectedTopics)

  return topicSegments(text, starts).map(({ spec, segment }) => {
    if (config.stage === 'SekI') {
      return {
        spec,
        rawText: segment.trim(),
        sourceGoalTexts: parseSekIRows(segment)
          .flatMap((row) => splitSourceAspects(row).map((sourceText) => ({
            parentBulletText: row,
            sourceText,
            courseLevel: spec.courseLevel,
          }))),
      }
    }

    return {
      spec,
      rawText: segment.trim(),
      sourceGoalTexts: parseSekIIBullets(segment, spec.courseLevel),
    }
  })
}

function sourceGoalTitle(sourceText: string): string {
  const normalized = normalizeInline(sourceText)
  return normalized.length <= 96 ? normalized : `${normalized.slice(0, 93).trim()}...`
}

function buildPassagesAndSourceGoals(
  config: ExtractionConfig,
  topics: ParsedTopic[],
): { passages: Passage[]; sourceGoals: SourceGoal[] } {
  const sourceGoals: SourceGoal[] = []
  const passages: Passage[] = topics.map((topic) => {
    const passageId = `he-chem-${config.stage.toLowerCase()}:${topic.spec.code}`
    const sourceGoalIds: string[] = []

    topic.sourceGoalTexts.forEach((entry, index) => {
      const parentBulletIndex = topic.sourceGoalTexts
        .slice(0, index + 1)
        .filter((candidate) => candidate.parentBulletText === entry.parentBulletText)
        .length
      const bulletIndex = new Set(topic.sourceGoalTexts.slice(0, index + 1).map((candidate) =>
        candidate.parentBulletText)).size
      const aspectIndex = parentBulletIndex
      const id = [
        `he-chem-${config.stage.toLowerCase()}`,
        topicSlug(topic.spec.code),
        `b${String(bulletIndex).padStart(2, '0')}`,
        `a${String(aspectIndex).padStart(2, '0')}`,
        hash(`${config.extractionId}:${topic.spec.code}:${entry.sourceText}`),
      ].join('-')

      sourceGoalIds.push(id)
      sourceGoals.push({
        id,
        passageId,
        topicCode: topic.spec.code,
        bulletIndex,
        aspectIndex,
        title: sourceGoalTitle(entry.sourceText),
        description: `Source-Ziel aus ${topic.spec.code}: ${entry.sourceText}`,
        sourceText: entry.sourceText,
        sourceSpan: `${topic.spec.code}#B${String(bulletIndex).padStart(2, '0')}A${String(aspectIndex).padStart(2, '0')}`,
        parentBulletText: entry.parentBulletText,
        sourceRef: `${config.sourceDocument.title}, ${topic.spec.code} ${topic.spec.title}`,
        courseLevel: entry.courseLevel,
        granularity: config.stage === 'SekI' ? 'officialContentRowAspect' : 'officialCompetencyAspect',
        tags: [
          `jurisdiction:${config.jurisdiction}`,
          `subject:${config.subject}`,
          `stage:${config.stage}`,
          `topic:${topic.spec.code}`,
          `courseLevel:${entry.courseLevel}`,
        ],
        rawSourceText: entry.sourceText,
        rawSourceSpan: `${topic.spec.code}#B${String(bulletIndex).padStart(2, '0')}A${String(aspectIndex).padStart(2, '0')}`,
        rawParentBulletText: entry.parentBulletText,
      })
    })

    return {
      id: passageId,
      topicCode: topic.spec.code,
      title: `${topic.spec.code} ${topic.spec.title}`,
      text: topic.sourceGoalTexts.map((entry) => `- ${entry.sourceText}`).join('\n'),
      page: topic.spec.page,
      sourcePath: config.sourceDocument.path,
      rawText: topic.rawText,
      sourceGoalIds,
    }
  })

  return { passages, sourceGoals }
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicateValues = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) duplicateValues.add(value)
    seen.add(value)
  })
  return Array.from(duplicateValues).sort()
}

function buildPipeline(
  config: ExtractionConfig,
  passages: Passage[],
  sourceGoals: SourceGoal[],
): { currentStep: string; steps: PipelineStep[] } {
  const sourceDocumentPath = path.resolve(repoRoot, config.sourceDocument.path)
  const topicCodes = passages.map((passage) => passage.topicCode)
  const duplicateTopicCodes = duplicates(topicCodes)
  const missingTopics = config.expectedTopics
    .map((topic) => topic.code)
    .filter((topicCode) => !topicCodes.includes(topicCode))
  const unexpectedTopics = topicCodes.filter((topicCode) =>
    !config.expectedTopics.some((topic) => topic.code === topicCode))
  const duplicateSourceGoalIds = duplicates(sourceGoals.map((sourceGoal) => sourceGoal.id))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoalsWithoutPassage = sourceGoals
    .filter((sourceGoal) => !passageIds.has(sourceGoal.passageId))
    .map((sourceGoal) => sourceGoal.id)
  const passagesWithoutSourceGoals = passages
    .filter((passage) => passage.sourceGoalIds.length === 0)
    .map((passage) => passage.topicCode)
  const incompleteSourceGoals = sourceGoals
    .filter((sourceGoal) =>
      !sourceGoal.sourceSpan
      || !sourceGoal.parentBulletText
      || !sourceGoal.sourceRef)
    .map((sourceGoal) => sourceGoal.id)
  const suspiciousEncoding = sourceGoals
    .filter((sourceGoal) => /[\uE000-\uF8FF]|\uFFFD/.test(sourceGoal.sourceText))
    .map((sourceGoal) => sourceGoal.id)
  const suspiciousFragments = sourceGoals
    .filter((sourceGoal) =>
      /^vgl\./i.test(sourceGoal.sourceText)
      || /^\)/.test(sourceGoal.sourceText)
      || /\bL\s=$/.test(sourceGoal.sourceText)
      || ((sourceGoal.sourceText.match(/\(/g)?.length ?? 0) > (sourceGoal.sourceText.match(/\)/g)?.length ?? 0)))
    .map((sourceGoal) => sourceGoal.id)

  const rawSteps: PipelineStep[] = [
    {
      id: 'MAPPING-1',
      label: 'Original-Lehrplanpassagen extrahiert',
      status: 'complete',
      dependsOn: [],
      checks: [
        {
          id: 'source-document-present',
          label: 'Amtliche Chemie-Quelle liegt lokal vor',
          passed: existsSync(sourceDocumentPath),
          details: config.sourceDocument.path,
        },
        {
          id: 'expected-topic-coverage',
          label: 'Alle erwarteten Chemie-Themenfelder sind als Lehrplanpassagen vorhanden',
          passed: missingTopics.length === 0 && unexpectedTopics.length === 0,
          details: `${topicCodes.length}/${config.expectedTopics.length} Themenfelder; fehlend: ${missingTopics.join(', ') || '-'}; unerwartet: ${unexpectedTopics.join(', ') || '-'}`,
        },
        {
          id: 'unique-topic-passages',
          label: 'Jedes Themenfeld hat genau eine Passage',
          passed: duplicateTopicCodes.length === 0,
          details: `Doppelte Themenfelder: ${duplicateTopicCodes.join(', ') || '-'}`,
        },
        {
          id: 'passage-text-present',
          label: 'Jede Passage enthält offiziellen Text',
          passed: passages.every((passage) => passage.rawText.trim().length > 0),
          details: `Passagen ohne Text: ${passages.filter((passage) => passage.rawText.trim().length === 0).map((passage) => passage.topicCode).join(', ') || '-'}`,
        },
        {
          id: 'passage-extraction-source',
          label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
          passed: true,
          details: `Quelle: ${config.sourceDocument.path}`,
        },
      ],
    },
    {
      id: 'MAPPING-2',
      label: 'Source-Ziele aus Lehrplanpassagen erstellt',
      status: 'complete',
      dependsOn: ['MAPPING-1'],
      checks: [
        {
          id: 'source-goals-created',
          label: 'Aus den Chemie-Lehrplanpassagen wurden granulare Source-Ziele erzeugt',
          passed: sourceGoals.length > 0,
          details: `${sourceGoals.length} Source-Ziele`,
        },
        {
          id: 'passage-to-source-goal-coverage',
          label: 'Jede Passage hat mindestens ein Source-Ziel',
          passed: passagesWithoutSourceGoals.length === 0,
          details: `Passagen ohne Source-Ziele: ${passagesWithoutSourceGoals.join(', ') || '-'}`,
        },
        {
          id: 'source-goal-ids-unique',
          label: 'Source-Ziel-IDs sind eindeutig',
          passed: duplicateSourceGoalIds.length === 0,
          details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
        },
        {
          id: 'source-goals-reference-passages',
          label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
          passed: sourceGoalsWithoutPassage.length === 0,
          details: `Ohne Passage: ${sourceGoalsWithoutPassage.join(', ') || '-'}`,
        },
        {
          id: 'source-goal-trace-complete',
          label: 'Jedes Source-Ziel hat Source-Span, Parent-Bullet und Quellenreferenz',
          passed: incompleteSourceGoals.length === 0,
          details: `Unvollständige Source-Ziele: ${incompleteSourceGoals.join(', ') || '-'}`,
        },
        {
          id: 'source-goal-encoding-clean',
          label: 'Source-Ziele enthalten keine kaputten Umlaute oder PDF-Private-Use-Zeichen',
          passed: suspiciousEncoding.length === 0,
          details: `Auffällige Source-Ziele: ${suspiciousEncoding.join(', ') || '-'}`,
        },
        {
          id: 'source-goal-no-fragments',
          label: 'Source-Ziele sind keine isolierten PDF-/Querverweis-Fragmente',
          passed: suspiciousFragments.length === 0,
          details: `Fragmentverdacht: ${suspiciousFragments.join(', ') || '-'}`,
        },
      ],
    },
    {
      id: 'MAPPING-3',
      label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
      status: 'incomplete',
      dependsOn: ['MAPPING-1', 'MAPPING-2'],
      checks: [
        {
          id: 'mapping-2-complete',
          label: 'MAPPING-2 abgeschlossen',
          passed: true,
          details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.`,
        },
        {
          id: 'm3-review-file-present',
          label: 'M3-Review-Datei ist vorhanden',
          passed: false,
          details: config.reviewPath,
        },
        {
          id: 'm3-review-decisions-reference-source-goals',
          label: 'M3-Review-Entscheidungen referenzieren gültige Source-Ziele',
          passed: false,
          details: 'M3-Review steht aus.',
        },
        {
          id: 'm3-review-targets-exist',
          label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
          passed: false,
          details: 'M3-Review steht aus.',
        },
        {
          id: 'm3-all-source-goals-reviewed',
          label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
          passed: false,
          details: `0/${sourceGoals.length} Source-Ziele reviewed; offen: ${sourceGoals.length}.`,
        },
        {
          id: 'm3-all-source-goals-covered-by-canonical',
          label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
          passed: false,
          details: `Abgedeckt: 0/${sourceGoals.length}; M3-Review steht aus.`,
        },
      ],
    },
  ]

  const steps = rawSteps.map((step) => {
    if (step.id === 'MAPPING-3') return step
    return {
      ...step,
      status: step.checks.every((check) => check.passed) ? 'complete' : 'incomplete',
    }
  })

  return { currentStep: 'MAPPING-3', steps }
}

function buildExtraction(config: ExtractionConfig) {
  const pdfText = readPdfText(config.sourceDocument)
  const topics = parseTopics(config, pdfText)
  const { passages, sourceGoals } = buildPassagesAndSourceGoals(config, topics)
  const pipelineStatus = buildPipeline(config, passages, sourceGoals)

  return {
    schemaVersion: 1,
    extractionId: config.extractionId,
    sourceLandscapeId: config.sourceLandscapeId,
    title: config.title,
    jurisdiction: config.jurisdiction,
    subject: config.subject,
    stage: config.stage,
    sourceDocument: config.sourceDocument,
    method: {
      passageExtraction: config.passageExtractionMethod,
      sourceGoalExtraction: config.sourceGoalExtractionMethod,
    },
    expectedTopicCodes: config.expectedTopics.map((topic) => topic.code),
    pipelineStatus,
    passages,
    sourceGoals,
  }
}

configs.forEach((config) => {
  const extraction = buildExtraction(config)
  const outputPath = path.resolve(repoRoot, config.outputPath)
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(extraction, null, 2)}\n`)
  console.log(
    `Wrote ${repoPath(outputPath)} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`,
  )
})
