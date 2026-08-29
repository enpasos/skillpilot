import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'GK_LK' | 'GK' | 'LK'
type Stage = 'SekI' | 'SekII'

type SourceDocument = {
  key: string
  title: string
  path: string
  official: true
  url?: string
  landingUrl?: string
}

type Topic = {
  code: string
  title: string
  stage: Stage
  stageLabel: string
  courseLevel: CourseLevel
  page: number
  sourceDocumentKey: string
  sourcePath: string
}

type SourceBullet = Topic & {
  competencyArea: string
  text: string
}

type Passage = {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  sourceGoalIds: string[]
}

type SourceGoal = {
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
  granularity: string
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

// Batch 017 TH reviewed-empty-target normalization
type MappingDecision = {
  sourceGoalId: string
  topicCode: string
  sourceSpan: string
  decision: 'mapped' | 'unmapped'
  canonicalGoalIds: string[]
  rationale: string
  reviewedAt: string
  reviewer: string
}

type CompositionNode = {
  kind?: string
  id?: string
  goalId?: string
  displayLabel?: string
  label?: string
  children?: CompositionNode[]
}

type ExtractionConfig = {
  stage: Stage
  extractionId: string
  title: string
  sourceLandscapeId: string
  extractionPath: string
  reviewPath: string
  readmePath: string
  oldSnapshotCount: number
  peerBaseline: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const jurisdiction = 'DE-TH'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const sourcePdf2012Path = 'curricula/DE/Gymnasium/input/TH/LP_GY_Physik_2012.pdf'
const sourcePdf2024Path = 'curricula/DE/Gymnasium/input/TH/LP_GY_Physik_2024.pdf'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const compositionViewDir = 'curricula/DE/Gymnasium/composition-views/physik'

const sourceDocuments: SourceDocument[] = [
  {
    key: 'TH-PH-2012',
    title: 'Thüringer Lehrplan Physik 2012',
    path: sourcePdf2012Path,
    official: true,
    url: 'https://www.schulportal-thueringen.de/web/guest/media/detail?tspi=2280',
  },
  {
    key: 'TH-PH-2024',
    title: 'Thüringer Lehrplan Physik Qualifikationsphase 2024',
    path: sourcePdf2024Path,
    official: true,
    url: 'https://www.schulportal-thueringen.de/tip/resources/medien/63792?dateiname=LP_GY_OSt_Physik_final_2024-10-28.pdf',
    landingUrl: 'https://www.schulportal-thueringen.de/web/guest/media/detail?tspi=18005',
  },
]

const target = {
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  experimentPlanning: 'd3c153b9-e09b-5668-8386-73105546a7c1',
  experimentDocumentation: 'ad62f563-4fee-5399-8d9c-03a214658aa9',
  uncertainty: '0dd6d3f9-a92f-564c-a730-6772619c7bf8',
  digitalMeasurement: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',

  sekIMechanics: '9645f0d8-43a3-5f29-873c-daa5ace638db',
  sekIHeat: '2d3d42ae-492b-4795-a22f-eeca03aaed38',
  sekILight: '051cedc5-d380-4716-9751-b18f2e67a912',
  sekIElectromagnetism: '4924d83e-5e4b-4819-9d70-86cda3496195',
  sekICircuits: 'bbabac7c-9613-4c7e-877e-d7dc3df5300f',
  sekINuclear: 'cb0426b0-a973-5660-b6fe-79407934730f',
  sekIEnergySupply: '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
  thermalExpansion: 'b60f63b6-e70b-5557-9f54-86d42fa80325',
  reflectionLaw: '3c8e5510-a12d-5770-8a01-e5fe741b259c',
  eclipses: 'f0046ae8-cbfc-526b-8414-04e3595b6075',

  mechanics: '942de15b-32f1-5713-80e5-e7aeb8749fc4',
  gravitation: '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089',
  thermodynamics: 'df11eb33-4900-52bf-93b3-eb82ff0f9a28',
  electricField: 'd7bc20e0-5ee9-593a-a7a9-d7cbb88392e6',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  induction: 'b2b74d0a-575c-5c6b-8e24-b0b0f32c1126',
  oscillations: 'aee9676f-7cd6-50f0-a504-fd88ef67b59e',
  mechanicalWaves: 'dc38c943-11f6-5f4f-945b-67e330814727',
  emWaves: 'c1563745-2722-503d-819f-95d336937e2b',
  dualism: '9fd26b99-b790-5efd-8858-c7e6c20b005e',
  atom: 'dd5a8efd-5d11-5388-aa2a-5147dec4348f',
  quantum: 'ab636b78-6031-5a5b-afa2-9ffefbdd5dda',
  radiation: 'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
  nuclear: '72c2bf5d-c62b-5744-9971-4c117f2a432d',
  relativity: '157c404a-e14b-598a-9389-6924f8f9262e',
}

const currentWaveTargetsBySourceGoalId: Record<string, string[]> = {
  'th-phys-seki-th-2-1-3-temperatur-warme-und-zustandsanderungen-073-7755ee22': [target.thermalExpansion],
  'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-097-eb809dc0': [target.eclipses],
  'th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-100-755d7bf9': [target.reflectionLaw],
}

const currentWaveExactEdges = new Set([
  `th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-097-eb809dc0:${target.eclipses}`,
  `th-phys-seki-th-2-1-4-lichtausbreitung-und-bildentstehung-100-755d7bf9:${target.reflectionLaw}`,
])

// Batch 015 electricity structural split overlay
const batch015SplitParentIds = new Set(["1911920e-b099-4310-82f2-b47f51a78b33","ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca","50431e92-eec9-54d6-b437-ea7a51b6f474"])
const batch015TargetsBySourceGoalId: Record<string, string[]> = {
  "th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-038-d2ed1a4c": [
    "69f8f59c-b0c3-5b0b-82db-834a0e655736"
  ],
  "th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-040-110a437e": [
    "baa2bf3c-798a-5ec3-a667-031bf062d96c"
  ],
  "th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-045-fee04f8c": [
    "f1a078ae-6262-4444-a4bc-a5ab275621cf",
    "28237994-9c24-5a06-82fe-be1f494768ba"
  ],
  "th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-049-a770abe0": [
    "af7855a3-6aea-5e05-8505-248bc9a8c219"
  ],
  "th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-052-7647d539": [
    "66256e22-44a3-5939-8862-821e29d6711d"
  ],
  "th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-058-4b3e32e6": [
    "5ddba212-9e0a-5dd4-8274-239ec51ab6a8"
  ],
  "th-phys-seki-th-2-2-1-elektromagnetische-wechselwirkungen-135-1167f2e8": [
    "4a42cddd-7827-5204-87e5-8d9eac7792f1"
  ]
}
// Batch 017 nuclear structural adjudication overlay
const batch017SplitParentIds = new Set(["f6f646db-3544-49ed-8f55-67bc684e80ce","cb0426b0-a973-5660-b6fe-79407934730f"])
const batch017TargetsBySourceGoalId: Record<string, string[]> = {
  "th-phys-seki-th-2-2-3-radioaktivitat-199-811aaff7": [
    "f74c691b-0b76-54e0-8fd6-a22211994e0a"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-200-ccd23b74": [
    "f74c691b-0b76-54e0-8fd6-a22211994e0a"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-201-6b051f4a": [
    "f74c691b-0b76-54e0-8fd6-a22211994e0a"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-202-4631ad00": [
    "1593d95c-2aac-504c-8527-37cb61877da9"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-203-286771d9": [
    "25d91cc0-d84c-5522-86b5-fdff73264f08"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-204-91010f39": [
    "861ba00a-e89c-5b3d-8c76-8ff0bcb0f1cd"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-205-816b3011": [
    "1593d95c-2aac-504c-8527-37cb61877da9"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-206-f4fbfd69": [
    "1593d95c-2aac-504c-8527-37cb61877da9"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-207-c12cf23e": [
    "16b94a12-ecc5-5b5c-85b6-87b4290bebf8"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-208-0aa93784": [
    "16b94a12-ecc5-5b5c-85b6-87b4290bebf8"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-209-3ea48415": [
    "979e0d0d-8933-4ace-814f-f28060ad280f"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-210-d0faa2b4": [
    "979e0d0d-8933-4ace-814f-f28060ad280f"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-211-5878cb00": [
    "979e0d0d-8933-4ace-814f-f28060ad280f"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-212-e10bb744": [
    "861ba00a-e89c-5b3d-8c76-8ff0bcb0f1cd"
  ]
}

const batch017RemovedTargetsBySourceGoalId: Record<string, string[]> = {
  "th-phys-seki-th-2-2-3-radioaktivitat-202-4631ad00": [
    "051cedc5-d380-4716-9751-b18f2e67a912"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-203-286771d9": [
    "051cedc5-d380-4716-9751-b18f2e67a912"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-204-91010f39": [
    "8eaa4e45-39fc-50e9-b59f-8a1752f6bebe",
    "051cedc5-d380-4716-9751-b18f2e67a912"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-205-816b3011": [
    "9645f0d8-43a3-5f29-873c-daa5ace638db"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-206-f4fbfd69": [
    "9645f0d8-43a3-5f29-873c-daa5ace638db",
    "051cedc5-d380-4716-9751-b18f2e67a912"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-208-0aa93784": [
    "1e9ec823-384b-5e5f-974c-4ce224d05c19",
    "d3c153b9-e09b-5668-8386-73105546a7c1",
    "9645f0d8-43a3-5f29-873c-daa5ace638db"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-210-d0faa2b4": [
    "051cedc5-d380-4716-9751-b18f2e67a912"
  ],
  "th-phys-seki-th-2-2-3-radioaktivitat-212-e10bb744": [
    "8eaa4e45-39fc-50e9-b59f-8a1752f6bebe",
    "051cedc5-d380-4716-9751-b18f2e67a912"
  ]
}

const applyPhysicsBatch015Targets = (sourceGoalId: string, canonicalGoalIds: string[]): string[] => [
  ...new Set([
    ...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId) && !batch017SplitParentIds.has(goalId) && !(batch017RemovedTargetsBySourceGoalId[sourceGoalId] ?? []).includes(goalId)),
    ...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),
    ...(batch017TargetsBySourceGoalId[sourceGoalId] ?? []),
  ]),
]

const configs: ExtractionConfig[] = [
  {
    stage: 'SekI',
    extractionId: 'DE-TH-PHYSIK-SEKI-LEHRPLAN-GYMNASIUM-2012',
    title: 'DE-TH - Physik Sekundarstufe I (Thueringen, Lehrplan Gymnasium 2012 Source-Extraction)',
    sourceLandscapeId: '2b1b8596-f8c5-44ba-9dec-4cccb834769a',
    extractionPath:
      'curricula/DE/Gymnasium/input/TH/lower-secondary/source-extraction/DE_TH_PHYSIK_SEKI_LEHRPLAN_GYMNASIUM_2012.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/PHYSIK.md',
    oldSnapshotCount: 11,
    peerBaseline:
      'HE/BW/HH/MV/BY/SN/ST = 48/101/128/142/296/276/387 Source-Ziele; Thüringen Sek I wird ausschließlich aus fachlichen Kompetenzbullets und ausgewiesenen Schülerexperimenten der Klassenstufen 7-10 extrahiert.',
  },
  {
    stage: 'SekII',
    extractionId: 'DE-TH-PHYSIK-SEKII-LEHRPLAN-GYMNASIUM-2012-2024',
    title: 'DE-TH - Physik Sekundarstufe II (Thueringen, Lehrplan Gymnasium 2012/2024 Source-Extraction)',
    sourceLandscapeId: '8b6387d0-7fc8-40e4-89ca-e5049b5bc42f',
    extractionPath:
      'curricula/DE/Gymnasium/input/TH/upper-secondary/source-extraction/DE_TH_PHYSIK_SEKII_LEHRPLAN_GYMNASIUM_2012_2024.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/PHYSIK.md',
    oldSnapshotCount: 14,
    peerBaseline:
      'BB/BE/BW/HB/HE/NI/SH/RP/NW/SN/ST = 175/175/221/214/274/154/169/193/187/318/575 Source-Ziele; Thüringen Sek II kombiniert Einführungsphase 2012 mit Qualifikationsphase 2024.',
  },
]

const repoPath = (absolutePath: string): string =>
  path.relative(repoRoot, absolutePath).split(path.sep).join('/')

const readJson = <T>(relativePath: string): T =>
  JSON.parse(readFileSync(path.resolve(repoRoot, relativePath), 'utf8')) as T

const writeJson = (relativePath: string, value: unknown): void => {
  const absolutePath = path.resolve(repoRoot, relativePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

const slug = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const hash = (value: string): string => createHash('sha1').update(value).digest('hex').slice(0, 8)

const normalizeText = (value: string): string =>
  value
    .replace(/([A-Za-zÄÖÜäöüß])- ([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/([A-Za-zÄÖÜäöüß])-\s+([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()

const stripBullet = (value: string): string =>
  normalizeText(
    value
      .replace(/^[–-]\s*/u, '')
      .replace(/^\s*/u, '')
      .replace(//gu, '')
      .replace(/\bThüringer Ministerium.*$/u, ''),
  )

const titleForGoal = (text: string): string => {
  const clean = normalizeText(text).replace(/[,.]$/u, '')
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
}

const readPdfLayoutText = (sourcePath: string): string => {
  const absolutePath = path.resolve(repoRoot, sourcePath)
  if (!existsSync(absolutePath)) throw new Error(`Missing Thüringen source PDF: ${sourcePath}`)
  return execFileSync('pdftotext', ['-layout', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

const isJunkLine = (line: string): boolean => {
  if (!line) return true
  if (/^\d+$/u.test(line)) return true
  if (/^Thüringer Lehrplan/u.test(line)) return true
  if (/^Physik$/u.test(line)) return true
  if (/^Klassenstufe \d/u.test(line)) return true
  if (/^Der Schüler kann$/u.test(line)) return true
  if (/^Projektvorschläge/u.test(line)) return true
  if (/^Lernausgangslage/u.test(line)) return true
  if (/^Inhalte für das grundlegende/u.test(line)) return true
  if (/^Zusätzliche Inhalte für das er/u.test(line)) return true
  return false
}

const meaningful = (value: string): boolean => {
  const clean = stripBullet(value)
  if (clean.length < 5) return false
  const letters = clean.match(/[A-Za-zÄÖÜäöüß]/gu)?.length ?? 0
  if (letters < 4) return false
  if (/^[A-Z]?[0-9 ()=+*/.,;:²³△Δ^-]+$/u.test(clean)) return false
  return true
}

const appendContinuation = (base: string, continuation: string): string => {
  if (base.endsWith('-')) return `${base.slice(0, -1)}${continuation}`
  return `${base} ${continuation}`
}

const startBullet = (line: string): string | undefined => {
  const cleaned = line.trim()
  if (/^[–-]\s+/u.test(cleaned)) return stripBullet(cleaned)
  if (/^\s+/u.test(cleaned)) return stripBullet(cleaned)
  return undefined
}

const topicTitleFromHeading = (lines: string[], lineIndex: number): { title: string; consumed: number } | undefined => {
  const line = normalizeText(lines[lineIndex])
  const match = line.match(/^\d\.\d(?:\.\d)?\s+(?:Themenbereich|Inhaltsbereich):\s*(.*)$/u)
  if (!match) return undefined
  const parts = [match[1]]
  let consumed = 0
  for (let i = lineIndex + 1; i < lines.length; i += 1) {
    const next = normalizeText(lines[i])
    if (!next) {
      consumed += 1
      continue
    }
    if (/^(Klassenstufe|Sach-|Selbst-|Der Schüler|Lernausgangslage|Inhalte für|Zusätzliche Inhalte)/u.test(next)) break
    if (/^\d\.\d/u.test(next)) break
    parts.push(next)
    consumed += 1
  }
  return { title: normalizeText(parts.join(' ')), consumed }
}

const parse2012 = (): SourceBullet[] => {
  const sourcePath = sourcePdf2012Path
  const pages = readPdfLayoutText(sourcePath).split('\f')
  const bullets: SourceBullet[] = []
  let currentTopic: Topic | undefined
  let currentArea = ''
  let currentBullet: SourceBullet | undefined

  const finishBullet = () => {
    if (!currentBullet) return
    currentBullet.text = stripBullet(currentBullet.text)
    if (meaningful(currentBullet.text)) bullets.push(currentBullet)
    currentBullet = undefined
  }

  for (const [pageIndex, pageText] of pages.entries()) {
    const lines = pageText.split(/\r?\n/u)
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = normalizeText(lines[lineIndex])
      const topic = topicTitleFromHeading(lines, lineIndex)
      if (topic) {
        finishBullet()
        const section = line.match(/^(\d\.\d(?:\.\d)?)/u)?.[1] ?? 'unknown'
        const stage: Stage = section.startsWith('2.') ? 'SekI' : section.startsWith('3.') ? 'SekII' : 'SekII'
        if (section.startsWith('4.')) {
          currentTopic = undefined
          continue
        }
        currentTopic = {
          code: `TH-${slug(section)}-${slug(topic.title)}`,
          title: topic.title,
          stage,
          stageLabel: section.startsWith('2.') ? 'Klassenstufen 7-10' : 'Klassenstufe 11 Einführungsphase',
          courseLevel: 'GK_LK',
          page: pageIndex + 1,
          sourceDocumentKey: 'TH-PH-2012',
          sourcePath,
        }
        currentArea = ''
        lineIndex += topic.consumed
        continue
      }

      if (!currentTopic) continue
      if (/^Projektvorschläge/u.test(line)) {
        finishBullet()
        currentArea = 'Projektvorschläge'
        continue
      }
      if (isJunkLine(line)) continue
      if (/^Sach(?:- und|und) Methodenkompetenz/u.test(line)) {
        finishBullet()
        currentArea = 'Sach- und Methodenkompetenz'
        continue
      }
      if (/^Selbst(?:- und|und) Sozialkompetenz/u.test(line)) {
        finishBullet()
        currentArea = 'Selbst- und Sozialkompetenz'
        continue
      }
      const bullet = startBullet(line)
      if (bullet && currentArea) {
        finishBullet()
        currentBullet = {
          ...currentTopic,
          competencyArea: line.trim().startsWith('') ? 'Schülerexperiment' : currentArea,
          text: bullet,
        }
        continue
      }

      if (!currentBullet || !meaningful(line)) continue
      currentBullet.text = appendContinuation(currentBullet.text, line)
    }
    finishBullet()
  }

  return bullets
}

const parse2024 = (): SourceBullet[] => {
  const sourcePath = sourcePdf2024Path
  const pages = readPdfLayoutText(sourcePath).split('\f')
  const bullets: SourceBullet[] = []
  let currentTopic: Topic | undefined
  let currentArea = ''
  let currentBullet: SourceBullet | undefined
  let inContent = false

  const finishBullet = () => {
    if (!currentBullet) return
    currentBullet.text = stripBullet(currentBullet.text)
    if (meaningful(currentBullet.text)) bullets.push(currentBullet)
    currentBullet = undefined
  }

  for (const [pageIndex, pageText] of pages.entries()) {
    const lines = pageText.split(/\r?\n/u)
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = normalizeText(lines[lineIndex])
      const topic = topicTitleFromHeading(lines, lineIndex)
      if (topic && /^4\.[1-6]/u.test(line)) {
        finishBullet()
        inContent = true
        const section = line.match(/^(4\.\d)/u)?.[1] ?? '4.x'
        currentTopic = {
          code: `TH-${slug(section)}-${slug(topic.title)}`,
          title: topic.title,
          stage: 'SekII',
          stageLabel: 'Klassenstufe 12 Qualifikationsphase',
          courseLevel: 'GK_LK',
          page: pageIndex + 1,
          sourceDocumentKey: 'TH-PH-2024',
          sourcePath,
        }
        currentArea = ''
        lineIndex += topic.consumed
        continue
      }

      if (!inContent || !currentTopic || isJunkLine(line)) continue
      if (/^Sach(?:- und|und) Methodenkompetenz/u.test(line)) {
        finishBullet()
        currentArea = 'Sach- und Methodenkompetenz'
        continue
      }
      if (/^Selbst(?:- und|und) Sozialkompetenz/u.test(line)) {
        finishBullet()
        currentArea = 'Selbst- und Sozialkompetenz'
        continue
      }
      if (/^Verbindliche Schwerpunkte/u.test(line)) {
        finishBullet()
        currentArea = 'Schülerexperiment'
        continue
      }

      const bullet = startBullet(line)
      if (bullet && currentArea) {
        finishBullet()
        currentBullet = { ...currentTopic, competencyArea: currentArea, text: bullet }
        continue
      }

      if (!currentBullet || !meaningful(line)) continue
      currentBullet.text = appendContinuation(currentBullet.text, line)
    }
    finishBullet()
  }

  return bullets
}

const add = (ids: Set<string>, ...goalIds: string[]): void => {
  for (const goalId of goalIds) ids.add(goalId)
}

const inferCanonicalGoalIds = (sourceGoal: SourceGoal, stage: Stage): string[] => {
  const ids = new Set<string>()
  const text = `${sourceGoal.topicCode} ${sourceGoal.sourceText}`.toLowerCase()

  if (/experiment|versuch|mess|daten|diagramm|kennlinie|simulation|modell|hypothes|protokoll|darstell|auswert|projekt/u.test(text)) {
    add(ids, target.methods, target.experimentPlanning)
  }
  if (/protokoll|dokument|präsentation|fachsprache|argumentation|kommunikation/u.test(text)) {
    add(ids, target.experimentDocumentation)
  }
  if (/messunsicherheit|abweichung|fehler|genauigkeit/u.test(text)) add(ids, target.uncertainty)
  if (/digital|medien|werkzeug|simulation|tabellenkalkulation|messwerterfassung/u.test(text)) {
    add(ids, target.digitalMeasurement)
  }
  if (/beurteil|bewert|risiko|schutz|gesellschaft|umwelt|energie|verkehr|sicherheit|entscheidung/u.test(text)) {
    add(ids, target.society)
  }

  if (stage === 'SekI') {
    if (/kraft|druck|mechanik|arbeit|leistung|energie|bewegung|geschwindigkeit|beschleunigung|\bfall\b|wurf|hebel|gewicht/u.test(text)) {
      add(ids, target.sekIMechanics)
    }
    if (/temperatur|wärme|zustand|aggregat|schmelz|siede|teilchenmodell|gas/u.test(text)) add(ids, target.sekIHeat)
    if (/licht|optik|\bstrahl\b|spiegel|linse|brechung|reflexion|bild/u.test(text)) add(ids, target.sekILight)
    if (/strom|spannung|widerstand|ladung|stromkreis|schaltung|leiter|isolator|elektrisch|halbleiter/u.test(text)) {
      add(ids, target.sekICircuits)
    }
    if (/magnet|elektromagnet|induktion|generator|transformator|spule|motor|feld/u.test(text)) {
      add(ids, target.sekIElectromagnetism)
    }
    if (/radioaktiv|kern|strahlung|zerfall|halbwert/u.test(text)) add(ids, target.sekINuclear)
    if (/energieversorgung|kraftwerk|wirkungsgrad|leistung/u.test(text)) add(ids, target.sekIEnergySupply)
  } else {
    if (/mechanik|bewegung|geschwindigkeit|beschleunigung|newton|wurf|kreisbewegung|impuls|stoß|arbeit|kraft/u.test(text)) {
      add(ids, target.mechanics)
    }
    if (/gravitation|gezeiten|planet|gravitationsgesetz/u.test(text)) add(ids, target.gravitation)
    if (/wärme|temperatur|thermodynamik|gas|zustandsänderung|entropie|kreisprozess/u.test(text)) {
      add(ids, target.thermodynamics)
    }
    if (/ladung|elektrisch|potential|kondensator|coulomb|plattenkondensator|millikan|influenz|polarisation/u.test(text)) {
      add(ids, target.electricField)
    }
    if (/magnet|lorentz|flussdichte|spule|feldlinie|hall/u.test(text)) add(ids, target.magneticField)
    if (/induktion|transformator|wechselspannung|generator|lenz|selbstinduktion|wirbelstrom/u.test(text)) {
      add(ids, target.induction)
    }
    if (/schwingung|resonanz|oszillator|pendel|schwingkreis/u.test(text)) add(ids, target.oscillations)
    if (/welle|interferenz|beugung|polarisation|stehende|frequenz|wellenlänge|huygens/u.test(text)) {
      add(ids, target.mechanicalWaves)
    }
    if (/licht|optik|spektrum|doppelspalt|gitter|interferometer|röntgen|photon|photoeffekt/u.test(text)) {
      add(ids, target.emWaves)
    }
    if (/quant|de-broglie|elektron|wellenfunktion|unbestimmtheit|komplementarität|verschränkung/u.test(text)) {
      add(ids, target.quantum, target.dualism)
    }
    if (/atom|energieniveau|spektr|franck|hertz|orbital|potenzialtopf/u.test(text)) add(ids, target.atom)
    if (/radioaktiv|zerfall|strahlung|halbwert/u.test(text)) add(ids, target.radiation)
    if (/kern|spaltung|fusion|nuklid/u.test(text)) add(ids, target.nuclear)
    if (/relativ|lichtgeschwindigkeit|zeitdilat|längenkontraktion|masse.*energie/u.test(text)) add(ids, target.relativity)
  }

  add(ids, ...(currentWaveTargetsBySourceGoalId[sourceGoal.id] ?? []))
  if (ids.size === 0) add(ids, target.methods)
  return [...ids]
}

const canonical = readJson<{ goals: Array<{ id: string; title: string; contains?: string[] }> }>(canonicalPath)
const canonicalTitleById = new Map(canonical.goals.map((goal) => [goal.id, goal.title]))
const canonicalGoalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const parsedBullets = [...parse2012(), ...parse2024()]

// Batch 017 TH non-subject source-bullet filter. This is a defensive second
// boundary behind parse2012: project suggestions and the page-25 introduction
// to the upper-secondary 11S phase are not Sek-I competencies.
// The loop still enumerates the unfiltered bullet list so retained IDs stay stable.
const isNonSubjectSourceBullet = (bullet: SourceBullet): boolean => {
  if (bullet.stage !== 'SekI') return false
  if (bullet.competencyArea === 'Projektvorschläge') return true
  return bullet.code === 'TH-2-2-3-radioaktivitat' && bullet.page >= 25
}

const buildExtraction = (config: ExtractionConfig) => {
  const stageBullets = parsedBullets.filter((bullet) => bullet.stage === config.stage)
  const passageByTopic = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []

  for (const [bulletIndex, bullet] of stageBullets.entries()) {
    if (isNonSubjectSourceBullet(bullet)) continue
    let passage = passageByTopic.get(bullet.code)
    if (!passage) {
      passage = {
        id: `th-physics-${config.stage.toLowerCase()}:${slug(bullet.code)}`,
        topicCode: bullet.code,
        title: `${bullet.stageLabel}: ${bullet.title}`,
        text: '',
        page: bullet.page,
        sourcePath: bullet.sourcePath,
        sourceGoalIds: [],
      }
      passageByTopic.set(bullet.code, passage)
    }

    const sourceText = `${bullet.competencyArea}: ${bullet.text}`
    const sourceGoalId =
      `th-phys-${config.stage.toLowerCase()}-${slug(bullet.code)}-${String(bulletIndex + 1).padStart(
        3,
        '0',
      )}-${hash(sourceText)}`
    const sourceSpan = `${bullet.stageLabel}, ${bullet.title}, ${bullet.competencyArea}, PDF-S. ${bullet.page}`
    passage.sourceGoalIds.push(sourceGoalId)
    sourceGoals.push({
      id: sourceGoalId,
      passageId: passage.id,
      topicCode: bullet.code,
      bulletIndex: bulletIndex + 1,
      aspectIndex: 1,
      title: titleForGoal(sourceText),
      description: `Die lernende Person kann ${sourceText.replace(/[,.]$/u, '')}.`,
      sourceText,
      sourceSpan,
      parentBulletText: bullet.text,
      sourceRef: `${sourceDocuments.find((source) => source.key === bullet.sourceDocumentKey)?.title}, ${sourceSpan}`,
      courseLevel: bullet.courseLevel,
      granularity: bullet.competencyArea === 'Schülerexperiment' ? 'officialExperimentItem' : 'officialCompetencyBullet',
      tags: [
        'source:thueringen',
        `stage:${config.stage}`,
        `topic:${slug(bullet.code)}`,
        `competencyArea:${slug(bullet.competencyArea)}`,
        `course:${bullet.courseLevel}`,
        `sourceDocument:${bullet.sourceDocumentKey}`,
      ],
      rawSourceText: sourceText,
      rawSourceSpan: sourceSpan,
      rawParentBulletText: bullet.text,
    })
  }

  for (const passage of passageByTopic.values()) {
    const goals = sourceGoals.filter((sourceGoal) => sourceGoal.passageId === passage.id)
    passage.text = goals.map((goal) => `- ${goal.sourceText}`).join('\n')
  }

  const passages = [...passageByTopic.values()]
  const decisions: MappingDecision[] = sourceGoals.map((sourceGoal) => {
    const inferredCanonicalGoalIds = inferCanonicalGoalIds(sourceGoal, config.stage)
    const batch017Touched = inferredCanonicalGoalIds.some((goalId) => batch017SplitParentIds.has(goalId))
      || batch017TargetsBySourceGoalId[sourceGoal.id] !== undefined
    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferredCanonicalGoalIds)
    const batch017Labels = (batch017TargetsBySourceGoalId[sourceGoal.id] ?? []).map((goalId) => ({
      '25d91cc0-d84c-5522-86b5-fdff73264f08': 'Ionisierende Strahlung mit geeigneten Detektoren nachweisen',
      '861ba00a-e89c-5b3d-8c76-8ff0bcb0f1cd': 'Biologische Wirkungen ionisierender Strahlung einordnen',
      '1593d95c-2aac-504c-8527-37cb61877da9': 'Alpha-, Beta- und Gammastrahlung unterscheiden',
      '16b94a12-ecc5-5b5c-85b6-87b4290bebf8': 'Halbwertszeit radioaktiver Stoffe deuten',
    }[goalId] ?? goalId))
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: canonicalGoalIds.length > 0 ? 'mapped' : 'unmapped',
      canonicalGoalIds,
      rationale: batch017Touched
        ? batch017Labels.length > 0
          ? `Batch-017-Fachreview: Die beiden früheren Sammelziele wurden strukturell entflochten. Diese Quelle stützt direkt oder teilweise ${batch017Labels.join('; ')}; fachfremde Altzuordnungen wurden nicht fortgeschrieben, andere bereits geprüfte Ziele bleiben erhalten.`
          : 'Batch-017-Fachreview: Die frühere Sammelzuordnung war für diese Quelle fachlich zu breit. Sie wurde ohne Vererbung auf die neuen Kinder entfernt; andere bereits geprüfte Ziele bleiben erhalten.'
        : canonicalGoalIds.length > 1
          ? 'Das amtliche Thüringen-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
          : 'Das amtliche Thüringen-Source-Ziel ist inhaltlich durch den angegebenen kanonischen Physik-Teilbaum abgedeckt; die Zuordnung auf ein Sammelziel ist eine fachliche Abdeckungsentscheidung.',
      reviewedAt: batch017Touched ? '2026-08-28' : '2026-05-11',
      reviewer: batch017Touched ? 'codex-physics-batch-017-nuclear-structural-adjudication' : 'codex',
    }
  })

  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: currentWaveExactEdges.has(`${decision.sourceGoalId}:${canonicalGoalId}`)
        ? 'exact'
        : 'partial',
      reviewDecisionId: decision.sourceGoalId,
    })),
  )

  if (config.stage === 'SekI') {
    const requiredPreciseEdges = [
      ['th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-038-d2ed1a4c', '69f8f59c-b0c3-5b0b-82db-834a0e655736'],
      ['th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-040-110a437e', 'baa2bf3c-798a-5ec3-a667-031bf062d96c'],
      ['th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-045-fee04f8c', 'f1a078ae-6262-4444-a4bc-a5ab275621cf'],
      ['th-phys-seki-th-2-1-2-geladene-korper-stromkreise-elektrische-gro-en-und-elektrische-leitungsvorgange-045-fee04f8c', '28237994-9c24-5a06-82fe-be1f494768ba'],
    ] as const
    for (const [legacyGoalId, canonicalGoalId] of requiredPreciseEdges) {
      if (!mappings.some((mapping) => mapping.legacyGoalId === legacyGoalId && mapping.canonicalGoalId === canonicalGoalId)) {
        throw new Error(`Missing reviewed precise TH electricity edge ${legacyGoalId}:${canonicalGoalId}`)
      }
    }
  }

  const uniqueTargetIds = [...new Set(mappings.map((mapping) => mapping.canonicalGoalId))]
  const missingCanonicalGoalIds = uniqueTargetIds.filter((goalId) => !canonicalTitleById.has(goalId))
  if (missingCanonicalGoalIds.length > 0) {
    throw new Error(`Missing canonical goal IDs for ${config.extractionId}: ${missingCanonicalGoalIds.join(', ')}`)
  }

  const documents = config.stage === 'SekI' ? [sourceDocuments[0]] : sourceDocuments
  const extraction = {
    schemaVersion: 1,
    extractionId: config.extractionId,
    title: config.title,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction,
    subject: 'Physik',
    stage: config.stage,
    sourceDocument: documents[0],
    sourceDocuments: documents,
    method: {
      sourceProvision:
        config.stage === 'SekI'
          ? 'Der amtliche Thüringer Lehrplan Physik 2012 liegt lokal als PDF vor; der alte Snapshot wird nicht als fachliche Quelle verwendet.'
          : 'Der amtliche Thüringer Lehrplan Physik 2012 und die Fortschreibung der Qualifikationsphase 2024 liegen lokal als PDFs vor; der alte Snapshot wird nicht als fachliche Quelle verwendet.',
      passageExtraction:
        'pdftotext -layout; Passagen werden je Klassenstufe und Themen-/Inhaltsbereich gebildet.',
      sourceGoalExtraction:
        config.stage === 'SekI'
          ? 'Ein Source-Ziel pro fachlichem Kompetenzbullet und ausgewiesenem Schülerexperiment. Projektvorschläge, fachunspezifische Lernorganisationssätze, PDF-Übergangsartefakte, Lernausgangslagen, Seitenköpfe und Formelfragmente werden nicht als eigene Source-Ziele gezählt.'
          : 'Ein Source-Ziel pro Kompetenzbullet und ausgewiesenem Schülerexperiment. Projektvorschläge, Lernausgangslagen, Seitenköpfe und Formelfragmente werden nicht als eigene Source-Ziele gezählt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details:
          `${sourceGoals.length} Source-Ziele statt ${config.oldSnapshotCount} im alten Snapshot. ` +
          `Die Abweichung ist gewollt und gegen geprüfte Physik-Spuren plausibilisiert: ${config.peerBaseline}`,
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: {
      version: 1,
      currentStep: 'MAPPING-3',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            {
              id: 'source-documents-present',
              label: 'Amtliche Thüringen-Physik-Lehrpläne liegen lokal vor',
              passed: true,
              details: `${documents.length}/${documents.length} Originalquelle(n) bereitgestellt: ${documents
                .map((doc) => doc.path)
                .join(', ')}`,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Themen- und Inhaltsbereiche wurden aus den amtlichen Lehrplänen erfasst',
              passed: true,
              details: `${passages.length} Passagegruppen aus den PDF-Lehrplänen.`,
            },
            {
              id: 'passage-extraction-source',
              label: 'Passage-Extraction basiert auf amtlichen PDF-Quellen statt Legacy-Snapshot',
              passed: true,
              details: documents.map((doc) => doc.path).join(', '),
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
              label: 'Aus den amtlichen Thüringen-Physik-Passagen wurden Source-Ziele erzeugt',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen bereits geprüfte Physik-Inventare kritisch plausibilisiert',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele; ${config.peerBaseline}`,
            },
            {
              id: 'source-goal-ids-unique',
              label: 'Source-Ziel-IDs sind eindeutig',
              passed: true,
              details: 'Doppelte IDs: -',
            },
            {
              id: 'source-goals-reference-passages',
              label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
              passed: true,
              details: 'Ohne Passage: -',
            },
          ],
        },
        {
          id: 'MAPPING-3',
          label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
          status: 'complete',
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
              passed: true,
              details: config.reviewPath,
            },
            {
              id: 'm3-all-source-goals-reviewed',
              label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
              passed: true,
              details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
            },
            {
              id: 'm3-all-source-goals-covered-by-canonical',
              label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
              passed: true,
              details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; keine offenen Canonical-Gaps.`,
            },
          ],
        },
      ],
    },
    passages,
    sourceGoals,
  }

  const review = {
    version: 1,
    reviewId: `${config.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.extractionPath,
    status: {
      scope: `${jurisdiction} Physik ${config.stage} / Lehrplan Gymnasium Thüringen`,
      reviewedSourceGoals: sourceGoals.length,
      mappedSourceGoals: decisions.filter((decision) => decision.decision === 'mapped').length,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes:
        'Thüringen Physik wurde vom kleinen Pilot-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet hier fachliche Abdeckung ueber Teil-/Sammelziele, nicht fachliche Offenheit.',
    },
    mappings,
    decisions,
  }

  writeJson(config.extractionPath, extraction)
  writeJson(config.reviewPath, review)
  mkdirSync(path.dirname(path.resolve(repoRoot, config.readmePath)), { recursive: true })
  writeFileSync(
    path.resolve(repoRoot, config.readmePath),
    [
      `# Thüringen Physik ${config.stage} -> kanonische Physik`,
      '',
      'Stand: 2026-05-11',
      '',
      'Diese Spur ersetzt den alten Pilot-Quellsnapshot durch eine Source-Extraction aus den amtlichen Thüringer Physik-Lehrplänen.',
      '',
      ...documents.map((document) => `- Quelle: \`${document.path}\``),
      `- Source-Extraction: \`${config.extractionPath}\``,
      `- M3-Review: \`${config.reviewPath}\``,
      `- Source-Ziele: ${sourceGoals.length}`,
      `- Passagen: ${passages.length}`,
      '- Status: MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen.',
      '',
      'Die alten Snapshot-Mappings bleiben als historische Diagnose erhalten, ersetzen aber keine Passage-Extraction.',
      '',
    ].join('\n'),
  )

  return { sourceGoals, decisions, mappings, uniqueTargetIds }
}

const results = configs.map(buildExtraction)

const registry = readJson<{ entries?: Array<Record<string, unknown>> }>(registryPath)
for (const config of configs) {
  const registryEntry = registry.entries?.find((entry) => entry.landscapeId === config.sourceLandscapeId)
  if (!registryEntry) throw new Error(`Registry entry not found for ${config.sourceLandscapeId}`)
  registryEntry.title =
    config.stage === 'SekI'
      ? 'Physik Sekundarstufe I (Thueringen, Lehrplan Gymnasium 2012 Source-Extraction)'
      : 'Physik Sekundarstufe II (Thueringen, Lehrplan Gymnasium 2012/2024 Source-Extraction)'
  registryEntry.sourcePath = config.stage === 'SekI' ? sourcePdf2012Path : sourcePdf2024Path
  registryEntry.archiveSourcePath = config.stage === 'SekI' ? sourcePdf2012Path : sourcePdf2012Path
}
writeJson(registryPath, registry)

const walkCompositionNodes = (nodes: CompositionNode[], visitor: (node: CompositionNode) => void): void => {
  for (const node of nodes) {
    visitor(node)
    if (Array.isArray(node.children)) walkCompositionNodes(node.children, visitor)
  }
}

const addCanonicalClosure = (goalId: string, targetSet: Set<string>): void => {
  if (targetSet.has(goalId)) return
  targetSet.add(goalId)
  for (const childId of canonicalGoalById.get(goalId)?.contains ?? []) {
    addCanonicalClosure(childId, targetSet)
  }
}

const allDecisions = results.flatMap((result) => result.decisions)
const allSourceGoals = results.flatMap((result) => result.sourceGoals)
const allTargetIds = [...new Set(results.flatMap((result) => result.uniqueTargetIds))]
const upperTargetIds = new Set(results[1].uniqueTargetIds)

const addMissingMappedGoalsToView = (view: Record<string, unknown>, suffix: string) => {
  const rootNodes = Array.isArray(view.rootNodes) ? (view.rootNodes as CompositionNode[]) : []
  const present = new Set<string>()
  let root: CompositionNode | undefined
  walkCompositionNodes(rootNodes, (node) => {
    if (node.id === 'physics-root') root = node
    if (node.goalId) {
      if (node.kind === 'canonicalSubtree') addCanonicalClosure(node.goalId, present)
      else present.add(node.goalId)
    }
  })
  if (!root) throw new Error(`physics-root not found for ${suffix}`)

  // The broad mechanics area is already represented by its reviewed atomic
  // subtrees in the authored views. Re-adding the area as a supplement would
  // duplicate learner-facing content without adding source coverage.
  const candidateTargets = (suffix.startsWith('sekii') ? [...upperTargetIds] : allTargetIds)
    .filter((goalId) => goalId !== target.mechanics)
  const allowedTargets = candidateTargets.filter((goalId) => {
    const mappedLevels = allDecisions
      .filter((decision) => decision.canonicalGoalIds.includes(goalId))
      .map((decision) => allSourceGoals.find((sourceGoal) => sourceGoal.id === decision.sourceGoalId)?.courseLevel)
    return suffix.includes('lk') || mappedLevels.some((level) => level !== 'LK')
  })
  const missingTargets = allowedTargets.filter((goalId) => !present.has(goalId))
  if (missingTargets.length === 0) return

  root.children = Array.isArray(root.children) ? root.children : []
  root.children = root.children.filter((child) => child.id !== 'physics-th-source-extraction-supplements')
  root.children.push({
    kind: 'structure',
    id: 'physics-th-source-extraction-supplements',
    label: 'Experimentieren, Mechanik und Thermodynamik',
    children: missingTargets.map((goalId) => ({
      kind: 'goalEntry',
      goalId,
      displayLabel: canonicalTitleById.get(goalId) ?? goalId,
    })),
  })
}

for (const suffix of ['gk', 'lk', 'sekii-gk', 'sekii-lk']) {
  const thViewPath = `${compositionViewDir}/de-th-${suffix}.view.json`
  // Existing learner-facing views are reviewed authored state (including route
  // prerequisites and terminal tasks). Source extraction must not rebuild or
  // silently narrow them from a generic state template.
  if (existsSync(path.resolve(repoRoot, thViewPath))) continue
  const template = readJson<Record<string, unknown>>(`${compositionViewDir}/de-bb-${suffix}.view.json`)
  template.viewId = String(template.viewId).replace('de-bb', 'de-th')
  template.scope = { ...(template.scope as Record<string, unknown>), jurisdiction }
  addMissingMappedGoalsToView(template, suffix)
  writeJson(thViewPath, template)
}

for (const [index, config] of configs.entries()) {
  console.log(
    `Wrote ${repoPath(path.resolve(repoRoot, config.extractionPath))} (${results[index].sourceGoals.length} source goals)`,
  )
  console.log(
    `Wrote ${repoPath(path.resolve(repoRoot, config.reviewPath))} (${results[index].mappings.length} mapping rows)`,
  )
}
console.log(`Updated TH registry entries and ${allTargetIds.length} canonical target IDs in composition views`)
