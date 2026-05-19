import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type RuleStatus = 'pass' | 'warn' | 'fail' | 'not_configured'
type MaturityLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6'

interface RuleResult {
  id: string
  status: RuleStatus
  summary: string
  metrics?: Record<string, number>
  details?: string[]
}

interface SourceDocument {
  title: string
  path?: string
  url?: string
  available?: boolean
  hasUsableUrl?: boolean
}

interface MappingPipelineSource {
  title: string
  jurisdiction: string
  stage: string
  path: string
  sourceDocuments?: SourceDocument[]
  sourceGoals: number
  passages: number
  mappedSourceGoals: number
  exactMappings?: number
  partialMappings?: number
}

interface CurriculumStatus {
  title: string
  subject?: string
  maturity: MaturityLevel
  path: string
  goals: number
  atomicGoals: number
  clusterGoals: number
  jurisdictionCoverage?: {
    totalJurisdictions?: number
    sourceCompleteJurisdictions?: number
    cleanJurisdictions?: number
    sourceOriginalGoals?: number
    sourceFullyCoveredOriginalGoals?: number
    jurisdictions?: Array<{
      jurisdiction: string
      status: string
      sourceOriginalGoals: number
      sourceFullyCoveredOriginalGoals: number
      viewAtomicGoals: number
    }>
  }
  mappingPipeline?: {
    totalSources: number
    completeSources: number
    sources: MappingPipelineSource[]
  }
  rules: RuleResult[]
}

interface StatusDocument {
  generatedAt: string
  rulesVersion: string
  curricula: CurriculumStatus[]
}

interface Args {
  statusPath: string
  outputPath: string
}

interface VerifiedSourceLink {
  role: string
  jurisdictions: string
  stage: string
  title: string
  url: string
  verifiedAt: string
  httpStatus: string
  contentType: string
  contentLength?: string
  lastModified?: string
  note: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const defaultStatusPath = 'docs/qa-ci/status/curriculum-quality-status.json'
const defaultOutputPath = 'docs/qa-ci/status/english-remediation-pilot.md'

const verifiedSourceLinks: VerifiedSourceLink[] = [
  {
    role: 'Primary candidate source',
    jurisdictions: 'DE-BB, DE-BE',
    stage: 'Sek I',
    title: 'Rahmenlehrplan Jahrgangsstufen 1-10, Teil C Moderne Fremdsprachen',
    url: 'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/Rahmenlehrplanprojekt/amtliche_Fassung/Teil_C_Mod_Fremdsprachen_2015_11_16.pdf',
    verifiedAt: '2026-05-17',
    httpStatus: '200 OK',
    contentType: 'application/pdf',
    contentLength: '1209775',
    lastModified: 'Tue, 17 Nov 2015 12:48:57 GMT',
    note: 'Shared Berlin-Brandenburg source for modern foreign languages; extraction must keep generic language standards separate from English-specific mapping decisions.',
  },
  {
    role: 'Candidate source',
    jurisdictions: 'DE-BE',
    stage: 'Sek II',
    title: 'Rahmenlehrplan gymnasiale Oberstufe, Teil C Englisch',
    url: 'https://www.berlin.de/sen/bildung/unterricht/faecher-rahmenlehrplaene/rahmenlehrplaene/rahmenlehrplan-englisch-go-teil-c.pdf?ts=1705017673',
    verifiedAt: '2026-05-17',
    httpStatus: '200 OK',
    contentType: 'application/pdf',
    contentLength: '198672',
    lastModified: 'Wed, 16 Jul 2025 16:03:12 +0200',
    note: 'Verified as a Berlin upper-secondary English PDF. Before treating it as Brandenburg evidence, verify the Brandenburg official publication context separately.',
  },
  {
    role: 'Official index page',
    jurisdictions: 'DE-BE',
    stage: 'Sek I',
    title: 'Berlin Rahmenlehrplaene Klassen 1-10',
    url: 'https://www.berlin.de/sen/bildung/unterricht/faecher-rahmenlehrplaene/rahmenlehrplaene/klasse-1-10/',
    verifiedAt: '2026-05-17',
    httpStatus: '200 OK',
    contentType: 'text/html',
    note: 'Index page used to keep source provenance anchored to an official page, not only to a direct PDF file.',
  },
  {
    role: 'Official index page',
    jurisdictions: 'DE-BE',
    stage: 'Sek II',
    title: 'Berlin Rahmenlehrplaene Oberstufe',
    url: 'https://www.berlin.de/sen/bildung/unterricht/faecher-rahmenlehrplaene/rahmenlehrplaene/oberstufe/',
    verifiedAt: '2026-05-17',
    httpStatus: '200 OK',
    contentType: 'text/html',
    note: 'Index page used to verify the upper-secondary publication context before source extraction work starts.',
  },
]

function parseArgs(argv: string[]): Args {
  const args: Args = {
    statusPath: defaultStatusPath,
    outputPath: defaultOutputPath,
  }

  argv.forEach((arg) => {
    if (arg.startsWith('--status=')) {
      args.statusPath = arg.slice('--status='.length)
    } else if (arg.startsWith('--output=')) {
      args.outputPath = arg.slice('--output='.length)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  })

  return args
}

function readJson<T>(repoPath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, repoPath), 'utf8')) as T
}

function rule(curriculum: CurriculumStatus, id: string): RuleResult | undefined {
  return curriculum.rules.find((candidate) => candidate.id === id)
}

function markdownCell(value: string | number): string {
  return String(value)
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, '<br>')
}

function markdownTable(headers: string[], rows: Array<Array<string | number>>): string[] {
  return [
    `| ${headers.map(markdownCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(' | ')} |`),
  ]
}

function ruleRow(curriculum: CurriculumStatus, id: string): Array<string | number> {
  const result = rule(curriculum, id)
  return [id, result?.status ?? 'missing', result?.summary ?? 'Rule result is missing.']
}

function sourceRows(curriculum: CurriculumStatus): Array<Array<string | number>> {
  return (curriculum.mappingPipeline?.sources ?? []).map((source) => {
    const urls = (source.sourceDocuments ?? [])
      .map((document) => document.url)
      .filter(Boolean)
      .join('<br>') || '-'

    return [
      source.jurisdiction,
      source.stage,
      source.title,
      source.sourceGoals,
      source.passages,
      `${source.mappedSourceGoals}/${source.sourceGoals}`,
      `${source.exactMappings ?? 0}/${source.partialMappings ?? 0}`,
      urls,
    ]
  })
}

function missingJurisdictions(curriculum: CurriculumStatus): string {
  const missing = (curriculum.jurisdictionCoverage?.jurisdictions ?? [])
    .filter((jurisdiction) => jurisdiction.status === 'none')
    .map((jurisdiction) => jurisdiction.jurisdiction)

  return missing.length > 0 ? missing.join(', ') : '-'
}

function verifiedSourceRows(): Array<Array<string | number>> {
  return verifiedSourceLinks.map((source) => [
    source.role,
    source.jurisdictions,
    source.stage,
    source.title,
    source.httpStatus,
    source.contentType,
    source.contentLength ?? '-',
    source.lastModified ?? '-',
    source.url,
  ])
}

function renderReport(status: StatusDocument): string {
  const english = status.curricula.find((curriculum) => curriculum.title === 'Englisch (Gymnasium, DE)')
  if (!english) {
    throw new Error('Could not find Englisch (Gymnasium, DE) in the curriculum quality status document.')
  }

  const coverage = english.jurisdictionCoverage
  const totalJurisdictions = coverage?.totalJurisdictions ?? 16
  const completeJurisdictions = coverage?.sourceCompleteJurisdictions ?? 0
  const sourceOriginalGoals = coverage?.sourceOriginalGoals ?? 0
  const sourceCoveredOriginalGoals = coverage?.sourceFullyCoveredOriginalGoals ?? 0

  const lines: string[] = [
    '# Englisch M0 Remediation Pilot',
    '',
    `Generated from \`${defaultStatusPath}\`; status snapshot generated at ${status.generatedAt}.`,
    '',
    'This pilot is the first concrete follow-up to the generated M0 remediation plan. Its purpose is to move `Englisch (Gymnasium, DE)` out of the vague M0 bucket by defining a reproducible source-expansion slice before any semantic atomicity or memory-card review is introduced.',
    '',
    'Important boundary: this document does not claim a maturity increase. English should remain `M0` until source inventories, source-to-canonical mappings, composition views, route profiles, and semantic atomicity review are complete enough for the dashboard rules to pass.',
    '',
    '## Current Dashboard State',
    '',
    ...markdownTable(
      ['Metric', 'Value'],
      [
        ['Curriculum', english.title],
        ['Path', english.path],
        ['Current maturity', english.maturity],
        ['Goals', english.goals],
        ['Atomic goals', english.atomicGoals],
        ['Cluster goals', english.clusterGoals],
        ['Complete source jurisdictions', `${completeJurisdictions}/${totalJurisdictions}`],
        ['Registered original source goals', sourceOriginalGoals],
        ['Fully covered original source goals', sourceCoveredOriginalGoals],
        ['Mapping sources', `${english.mappingPipeline?.completeSources ?? 0}/${english.mappingPipeline?.totalSources ?? 0}`],
        ['Missing source jurisdictions', missingJurisdictions(english)],
      ],
    ),
    '',
    '## Blocking Rules',
    '',
    ...markdownTable(
      ['Rule', 'Status', 'Summary'],
      [
        ruleRow(english, 'CQR-000'),
        ruleRow(english, 'CQR-003'),
        ruleRow(english, 'CQR-101'),
        ruleRow(english, 'CQR-301'),
        ruleRow(english, 'CQR-302'),
        ruleRow(english, 'CQR-401'),
        ruleRow(english, 'CQR-501'),
      ],
    ),
    '',
    '## Existing Source Base',
    '',
    ...markdownTable(
      ['Jurisdiction', 'Stage', 'Source', 'Source goals', 'Passages', 'Mapped', 'Exact/partial', 'URL'],
      sourceRows(english),
    ),
    '',
    'Interpretation: Hessen and Bayern are complete as currently registered source lanes. They are not enough to leave M0 because 14 declared Bundesländer still have no registered source inventory and there is no learner-facing composition view for English.',
    '',
    '## Verified Candidate Sources For The First Slice',
    '',
    ...markdownTable(
      ['Role', 'Jurisdictions', 'Stage', 'Title', 'HTTP', 'Content type', 'Bytes', 'Last modified', 'URL'],
      verifiedSourceRows(),
    ),
    '',
    'These links were checked on 2026-05-17. The report stores the check result as evidence for planning only; normal CI should not depend on live network access.',
    '',
    '## Pilot Slice',
    '',
    'Recommended first implementation slice: Berlin/Brandenburg English, starting with the shared Sek I modern-foreign-languages source and the Berlin Sek II English source.',
    '',
    '1. Create source-extraction artifacts for the verified official sources. Use explicit `sourceDocuments.url` references; do not bundle PDFs.',
    '2. Keep generic modern-foreign-language standards semantically generic in extraction, then decide during mapping whether and how they justify English canonical goals.',
    '3. Emit separate jurisdiction evidence for `DE-BB` and `DE-BE` where the official source genuinely applies to both; do not infer Brandenburg upper-secondary coverage from the Berlin PDF without official confirmation.',
    '4. Map source goals to the existing canonical CEFR x skill graph. Add canonical goals only if a source obligation is real and cannot be represented by an existing goal.',
    '5. Add composition views and route profiles only after source mappings are reviewable. `CQR-302` remains out of scope for this pilot.',
    '',
    '## Expected Dashboard Behavior',
    '',
    '- After only this planning report: no maturity change is expected.',
    '- After source-extraction files alone: English may still remain M0, because source goals are not enough without reviewed mappings and views.',
    '- After completed BB/BE extraction plus reviewed mappings: `CQR-000` and `CQR-003` should show a smaller gap, but the subject can still remain M0 until the declared 16-jurisdiction coverage model is satisfied or an explicitly reviewed narrower scope is introduced.',
    '- After composition views, route profiles, semantic atomicity, and all source jurisdictions are resolved: English can move through M1-M5. Memory review belongs to M6 only.',
    '',
    '## Risks To Keep Visible',
    '',
    '- The Berlin-Brandenburg Sek I document is a modern-foreign-languages framework; treating every generic statement as an English-specific content claim would overstate the evidence.',
    '- The upper-secondary Berlin PDF is verified as a Berlin source. Brandenburg applicability must be checked before using it for `DE-BB`.',
    '- The current Bayern source lane is very coarse: 9 source goals with 8 partial mappings. It is accepted today, but English remediation should not copy that granularity if a better source extraction is possible.',
    '- CEFR tags in SkillPilot are modeling decisions. Source texts may use Kompetenzbereiche or standards rather than the same CEFR labels, so mapping must stay semantic rather than string-based.',
    '',
    '## Next Concrete Implementation Task',
    '',
    'Build a small BB/BE English source-extraction generator by following the existing German/Latin BB/BE generator pattern, but stop after extraction and review scaffolding if the source text cannot be mapped defensibly in one pass.',
    '',
  ]

  return `${lines.join('\n')}\n`
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const status = readJson<StatusDocument>(args.statusPath)
  const outputPath = resolve(repoRoot, args.outputPath)
  const outputDir = dirname(outputPath)
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })
  writeFileSync(outputPath, renderReport(status))
  console.log(`Wrote ${args.outputPath}`)
}

main()
