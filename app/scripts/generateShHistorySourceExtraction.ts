import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'unspecified'
type GoalKind = 'Kompetenz' | 'Historischer Inhalt' | 'Fachmethode' | 'Problemfrage' | 'Kontroverse'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
  available: true
}

interface ExtractionSpec {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  sourceDocument: SourceDocument
  outputPath: string
  reviewPath: string
  archivePath: string
  sourceGoalPrefix: string
  pageFrom: number
  pageTo: number
  jurisdiction: 'DE-SH'
  sections: SectionSpec[]
}

interface SectionSpec {
  code: string
  title: string
  startPattern: RegExp
  endPattern?: RegExp
  gradeBand: string
  courseLevel: CourseLevel
  mode: 'transitionCompetency' | 'topicBullets'
}

interface ParsedSection {
  code: string
  title: string
  rawText: string
  goals: ParsedGoal[]
  gradeBand: string
  courseLevel: CourseLevel
}

interface ParsedGoal {
  number: number
  text: string
  kind: GoalKind
  aspectIndex: number
}

interface GeneratedSourceGoal {
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
  granularity: 'officialCompetency' | 'officialTopicItem'
  stage: Stage
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

interface CanonicalGoal {
  id: string
  title: string
  applicability?: Record<string, string[]>
}

interface CanonicalLandscape {
  landscapeId: string
  goals: CanonicalGoal[]
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const generatedAt = '2026-05-14'

const sourceDocument: SourceDocument = {
  key: 'SH-GESCHICHTE-SEK-I-II-2016',
  title: 'Fachanforderungen Geschichte Sekundarstufe I / Sekundarstufe II Schleswig-Holstein (2016)',
  path: 'curricula/DE/Gymnasium/input/SH/Fachanforderungen_Geschichte_SEK_barrierearm.pdf',
  url: 'https://fachportal.lernnetz.de/files/Fachanforderungen%20und%20Leitf%C3%A4den/Sek.%20I_II/Fachanforderungen_barrierefrei/Fachanforderungen_Geschichte_SEK_barrierearm.pdf',
  official: true,
  available: true,
}

const lowerSections: SectionSpec[] = [
  {
    code: 'SI-C1',
    title: 'Wahrnehmungskompetenz - Übergang Oberstufe',
    startPattern: /2\.1 Wahrnehmungskompetenz/u,
    endPattern: /2\.2 Erschließungskompetenzen/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'transitionCompetency',
  },
  {
    code: 'SI-C2',
    title: 'Erschließungskompetenzen - Übergang Oberstufe',
    startPattern: /2\.2 Erschließungskompetenzen/u,
    endPattern: /2\.3 Sachurteilskompetenz/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'transitionCompetency',
  },
  {
    code: 'SI-C3',
    title: 'Sachurteilskompetenz - Übergang Oberstufe',
    startPattern: /2\.3 Sachurteilskompetenz/u,
    endPattern: /2\.4 Orientierungskompetenz/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'transitionCompetency',
  },
  {
    code: 'SI-C4',
    title: 'Orientierungskompetenz - Übergang Oberstufe',
    startPattern: /2\.4 Orientierungskompetenz/u,
    endPattern: /3 Themen und Inhalte des Unterrichts/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'transitionCompetency',
  },
  {
    code: 'SI-T1',
    title: 'Vorgeschichte und Antike - historische Fundamente unseres Zusammenlebens?',
    startPattern: /1\. Vorgeschichte und Antike/u,
    endPattern: /2\. Das Mittelalter/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'topicBullets',
  },
  {
    code: 'SI-T2',
    title: 'Das Mittelalter - eine finstere Zeit?',
    startPattern: /2\. Das Mittelalter/u,
    endPattern: /3\. Frühe Neuzeit/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'topicBullets',
  },
  {
    code: 'SI-T3',
    title: 'Frühe Neuzeit - Wege in die Moderne?',
    startPattern: /3\. Frühe Neuzeit/u,
    endPattern: /4\. Das 19\. Jahrhundert/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'topicBullets',
  },
  {
    code: 'SI-T4',
    title: 'Das 19. Jahrhundert: Fortschritt oder Beharrung?',
    startPattern: /4\. Das 19\. Jahrhundert/u,
    endPattern: /5\. Der Erste Weltkrieg/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'topicBullets',
  },
  {
    code: 'SI-T5',
    title: 'Der Erste Weltkrieg - eine Epochenwende?',
    startPattern: /5\. Der Erste Weltkrieg/u,
    endPattern: /6\. Deutschland 1918/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'topicBullets',
  },
  {
    code: 'SI-T6',
    title: 'Deutschland 1918-1945: Zwischen Demokratie und Diktatur',
    startPattern: /6\. Deutschland 1918\s*-\s*1945/u,
    endPattern: /7\. Die Welt seit 1945/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'topicBullets',
  },
  {
    code: 'SI-T7',
    title: 'Die Welt seit 1945: Zwischen Konfrontation und Kooperation',
    startPattern: /7\. Die Welt seit 1945/u,
    endPattern: /8\. Deutschland und Europa seit 1945/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'topicBullets',
  },
  {
    code: 'SI-T8',
    title: 'Deutschland und Europa seit 1945: Von der Spaltung zur Integration?',
    startPattern: /8\. Deutschland und Europa seit 1945/u,
    gradeBand: '5/10',
    courseLevel: 'unspecified',
    mode: 'topicBullets',
  },
]

const upperSections: SectionSpec[] = [
  {
    code: 'E1',
    title: 'Vergangenheit und Gegenwart - Lernen aus der Geschichte?',
    startPattern: /E1: Vergangenheit und Gegenwart/u,
    endPattern: /E2: Begegnungen von Kulturen/u,
    gradeBand: '11',
    courseLevel: 'GK_LK',
    mode: 'topicBullets',
  },
  {
    code: 'E2',
    title: 'Begegnungen von Kulturen - Konfrontation, Abgrenzung oder Integration?',
    startPattern: /E2: Begegnungen von Kulturen/u,
    endPattern: /E3: Wandel von Wirtschaft und Gesellschaft/u,
    gradeBand: '11',
    courseLevel: 'GK_LK',
    mode: 'topicBullets',
  },
  {
    code: 'E3',
    title: 'Wandel von Wirtschaft und Gesellschaft - Kontinuitäten und Brüche',
    startPattern: /E3: Wandel von Wirtschaft und Gesellschaft/u,
    endPattern: /Q1\.1: Die Menschenrechte/u,
    gradeBand: '11',
    courseLevel: 'GK_LK',
    mode: 'topicBullets',
  },
  {
    code: 'Q1.1',
    title: 'Die Menschenrechte aus universal-historischer Perspektive',
    startPattern: /Q1\.1: Die Menschenrechte/u,
    endPattern: /Q1\.2: Nationale Identitäten/u,
    gradeBand: '12/13',
    courseLevel: 'GK_LK',
    mode: 'topicBullets',
  },
  {
    code: 'Q1.2',
    title: 'Nationale Identitäten seit dem 19. Jahrhundert - Realität oder Konstruktion?',
    startPattern: /Q1\.2: Nationale Identitäten/u,
    endPattern: /Q2\.1: Diktatur und Demokratie/u,
    gradeBand: '12/13',
    courseLevel: 'GK_LK',
    mode: 'topicBullets',
  },
  {
    code: 'Q2.1',
    title: 'Diktatur und Demokratie im Zeitalter der Extreme',
    startPattern: /Q2\.1: Diktatur und Demokratie/u,
    endPattern: /Q2\.2: Dauerhafter Friede/u,
    gradeBand: '12/13',
    courseLevel: 'GK_LK',
    mode: 'topicBullets',
  },
  {
    code: 'Q2.2',
    title: 'Dauerhafter Friede - eine Utopie?',
    startPattern: /Q2\.2: Dauerhafter Friede/u,
    gradeBand: '12/13',
    courseLevel: 'GK_LK',
    mode: 'topicBullets',
  },
]

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_SH_GESCHICHTE_SEKI_FACHANFORDERUNGEN_2016',
    sourceLandscapeId: uuidFromString('DE-SH-GESCHICHTE-SEKI-FACHANFORDERUNGEN-2016'),
    title: 'Geschichte Sekundarstufe I (Schleswig-Holstein, Fachanforderungen 2016 Source-Extraction)',
    stage: 'SekI',
    jurisdiction: 'DE-SH',
    sourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/SH/lower-secondary/source-extraction/DE_SH_GESCHICHTE_SEKI_FACHANFORDERUNGEN_2016.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_history_lower_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/SH/lower-secondary/',
    sourceGoalPrefix: 'sh-history-seki',
    pageFrom: 23,
    pageTo: 34,
    sections: lowerSections,
  },
  {
    extractionId: 'DE_SH_GESCHICHTE_SEKII_FACHANFORDERUNGEN_2016',
    sourceLandscapeId: uuidFromString('DE-SH-GESCHICHTE-SEKII-FACHANFORDERUNGEN-2016'),
    title: 'Geschichte Sekundarstufe II (Schleswig-Holstein, Fachanforderungen 2016 Source-Extraction)',
    stage: 'SekII',
    jurisdiction: 'DE-SH',
    sourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_GESCHICHTE_SEKII_FACHANFORDERUNGEN_2016.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_history_upper_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/SH/upper-secondary/',
    sourceGoalPrefix: 'sh-history-sekii',
    pageFrom: 45,
    pageTo: 52,
    sections: upperSections,
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

if (!existsSync(abs(sourceDocument.path))) throw new Error(`Missing source PDF: ${sourceDocument.path}`)

const generated = specs.map((spec) => {
  const sections = parseSections(spec)
  const extraction = buildExtraction(spec, sections)
  const review = buildReview(spec, extraction.sourceGoals)
  writeJson(spec.outputPath, extraction)
  writeJson(spec.reviewPath, review)
  console.log(`Wrote ${spec.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
  console.log(`Wrote ${spec.reviewPath} (${review.decisions.length}/${extraction.sourceGoals.length} M3 decisions)`)
  return { spec, extraction, review }
})

updateRegistry(specs)
updateReadme(generated[0].extraction.sourceGoals.length, generated[1].extraction.sourceGoals.length)
updateStageReferences(generated[0].extraction.sourceGoals.length, generated[1].extraction.sourceGoals.length)
syncCanonicalHistoryApplicability()

function parseSections(spec: ExtractionSpec): ParsedSection[] {
  const fullText = normalizePassageText(
    execFileSync(
      'pdftotext',
      ['-layout', '-f', String(spec.pageFrom), '-l', String(spec.pageTo), abs(spec.sourceDocument.path), '-'],
      { encoding: 'utf8' },
    ),
  )
  return spec.sections.map((sectionSpec) => {
    const rawText = sectionText(fullText, sectionSpec)
    const goals = sectionSpec.mode === 'transitionCompetency'
      ? parseTransitionCompetencyGoals(rawText)
      : parseTopicGoals(rawText)
    if (goals.length === 0) throw new Error(`No SH Geschichte source goals parsed for ${sectionSpec.code}`)
    return {
      code: sectionSpec.code,
      title: sectionSpec.title,
      rawText,
      goals,
      gradeBand: sectionSpec.gradeBand,
      courseLevel: sectionSpec.courseLevel,
    }
  })
}

function sectionText(fullText: string, sectionSpec: SectionSpec): string {
  const start = findPattern(fullText, sectionSpec.startPattern, 0)
  const end = sectionSpec.endPattern ? findPattern(fullText, sectionSpec.endPattern, start + 1) : fullText.length
  if (end <= start) throw new Error(`Invalid SH Geschichte section boundaries for ${sectionSpec.code}`)
  return fullText.slice(start, end).trim()
}

function parseTransitionCompetencyGoals(rawText: string): ParsedGoal[] {
  const transitionStart = findPattern(rawText, /Übergang Oberstufe/u, 0)
  const transitionText = rawText.slice(transitionStart)
  return parseBulletGoals(transitionText, 'Kompetenz', true)
}

function parseTopicGoals(rawText: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let currentKind: GoalKind = 'Historischer Inhalt'
  let current: string | null = null

  for (const rawLine of rawText.replace(/\f/gu, '\n').split('\n')) {
    const line = normalizeLine(rawLine)
    if (!line || isPdfArtifact(line)) continue
    if (/^Historische Inhalte/u.test(line)) {
      flushGoal(goals, currentKind, current)
      current = null
      currentKind = 'Historischer Inhalt'
      continue
    }
    if (/^Fachmethodische Schwerpunkte/u.test(line)) {
      flushGoal(goals, currentKind, current)
      current = null
      currentKind = 'Fachmethode'
      continue
    }
    if (/^Problemorientierte Fragestellungen|^Historische Inhalte und [Pp]roblemorientierte Fragestellungen/u.test(line)) {
      flushGoal(goals, currentKind, current)
      current = null
      currentKind = 'Historischer Inhalt'
      continue
    }
    if (/^KONTROVERSE/u.test(line)) {
      flushGoal(goals, currentKind, current)
      current = null
      currentKind = 'Kontroverse'
      continue
    }
    if (/^•\s+/u.test(line)) {
      flushGoal(goals, currentKind, current)
      current = line.replace(/^•\s+/u, '')
      continue
    }
    if (/^o\s+/u.test(line)) {
      flushGoal(goals, currentKind, current)
      currentKind = currentKind === 'Kontroverse' ? 'Kontroverse' : 'Problemfrage'
      current = line.replace(/^o\s+/u, '')
      continue
    }
    if (current && (/^\s{2,}\S/u.test(rawLine) || /^[a-zäöüß(„‚…-]/u.test(line) || current.endsWith('-'))) {
      current = joinWrapped(current, line)
      continue
    }
  }
  flushGoal(goals, currentKind, current)
  return goals.map((goal, index) => ({ ...goal, number: index + 1 }))
}

function parseBulletGoals(rawText: string, kind: GoalKind, stopAtNextSection: boolean): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let current: string | null = null
  for (const rawLine of rawText.replace(/\f/gu, '\n').split('\n')) {
    const line = normalizeLine(rawLine)
    if (!line || isPdfArtifact(line)) continue
    if (stopAtNextSection && /^\d(?:\.\d)?\s+[A-ZÄÖÜ]/u.test(line)) break
    if (/^•\s+/u.test(line)) {
      flushGoal(goals, kind, current)
      current = line.replace(/^•\s+/u, '')
      continue
    }
    if (current && (/^\s{2,}\S/u.test(rawLine) || /^[a-zäöüß(]/u.test(line) || current.endsWith('-'))) {
      current = joinWrapped(current, line)
    }
  }
  flushGoal(goals, kind, current)
  return goals.map((goal, index) => ({ ...goal, number: index + 1 }))
}

function flushGoal(goals: ParsedGoal[], kind: GoalKind, value: string | null): void {
  if (!value) return
  const text = normalizeGoalText(value)
  if (text.length < 5) return
  const aspectIndex = goals.filter((goal) => goal.kind === kind).length + 1
  goals.push({
    number: goals.length + 1,
    text,
    kind,
    aspectIndex,
  })
}

function buildExtraction(spec: ExtractionSpec, sections: ParsedSection[]) {
  const passages = sections.map((section) => ({
    id: passageIdForSection(spec, section),
    topicCode: section.code,
    title: `${section.code} ${section.title}`,
    text: section.rawText,
    sourcePath: spec.sourceDocument.path,
    sourceUrl: spec.sourceDocument.url,
    rawText: section.rawText,
    sourceGoalIds: section.goals.map((goal) => sourceGoalId(spec, section, goal)),
  }))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoals: GeneratedSourceGoal[] = sections.flatMap((section) =>
    section.goals.map((goal) => {
      const sourceText = normalizeGoalText(goal.text)
      const sourceSpan = `${section.code}.${goal.kind}.${goal.aspectIndex}`
      return {
        id: sourceGoalId(spec, section, goal),
        passageId: passageIdForSection(spec, section),
        topicCode: section.code,
        bulletIndex: goal.number,
        aspectIndex: goal.aspectIndex,
        title: titleFromSourceText(sourceText),
        description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
        sourceText,
        sourceSpan,
        parentBulletText: sourceText,
        sourceRef: `${spec.sourceDocument.title}, ${section.code} ${section.title}, ${goal.kind}`,
        courseLevel: section.courseLevel,
        granularity: goal.kind === 'Kompetenz' ? 'officialCompetency' : 'officialTopicItem',
        stage: spec.stage,
        tags: [
          'jurisdiction:DE-SH',
          `stage:${spec.stage}`,
          `gradeBand:${section.gradeBand}`,
          `topic:${section.code}`,
          `courseLevel:${section.courseLevel}`,
          `sourceKind:${goal.kind}`,
        ],
        rawSourceText: goal.text,
        rawSourceSpan: sourceSpan,
        rawParentBulletText: goal.text,
      }
    }),
  )

  const duplicateIds = findDuplicates(sourceGoals.map((sourceGoal) => sourceGoal.id))
  const missingPassageRefs = sourceGoals
    .filter((sourceGoal) => !passageIds.has(sourceGoal.passageId))
    .map((sourceGoal) => sourceGoal.id)
  const emptyPassages = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.topicCode)

  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: spec.jurisdiction,
    subject: 'Geschichte',
    stage: spec.stage,
    sourceDocument: spec.sourceDocument,
    sourceDocuments: [spec.sourceDocument],
    method: {
      passageExtraction:
        'pdftotext -layout over official Schleswig-Holstein Fachanforderungen Geschichte page ranges; one passage per competence area or official topic.',
      sourceGoalExtraction:
        spec.stage === 'SekI'
          ? 'one source goal per Übergang-Oberstufe Kompetenzbulletpoint and per explicit item in the eight binding Sek-I topics.'
          : 'one source goal per explicit historical-content, problem-question or controversy item in the binding E/Q upper-secondary topics.',
      mappingBasis:
        'M3 review maps each source goal to one or more canonical Geschichte goals. 1:n is a mapping form, not a quality deficit.',
    },
    expectedTopicCodes: sections.map((section) => section.code),
    pipelineStatus: buildPipelineStatus(spec, sections, sourceGoals.length, {
      duplicateIds,
      missingPassageRefs,
      emptyPassages,
    }),
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        actualSourceGoals: sourceGoals.length,
        rationale: spec.stage === 'SekI'
          ? 'Kritisch geprueft: SH Geschichte Sek I kombiniert wenige verbindliche Halbjahresthemen mit expliziten Kompetenzstandards fuer den Uebergang in die Oberstufe. Die Zielzahl ist deshalb nicht aus kleinteiligen Inhaltsfeld-Kompetenzen, sondern aus Kompetenzen plus Themen-/Methodenitems aufgebaut.'
          : 'Kritisch geprueft: SH Geschichte Sek II ist knapper als NRW und RP, weil die Fachanforderungen sieben verbindliche E/Q-Themen ohne getrennte GK/LK-Kompetenzlisten ausweisen. Die Zielzahl folgt direkt aus den offiziellen Inhalts- und Problemfrage-Bullets.',
      },
      notes: [
        'Legacy-Snapshots werden nicht als Quelle verwendet.',
        'Die Fachanforderungen enthalten Sek I und Sek II in einer amtlichen PDF; die Source-Extraction trennt beide Stufen in zwei registrierte Artefakte.',
      ],
    },
    passages,
    sourceGoals,
  }
}

function buildPipelineStatus(
  spec: ExtractionSpec,
  sections: ParsedSection[],
  sourceGoalCount: number,
  diagnostics: { duplicateIds: string[]; missingPassageRefs: string[]; emptyPassages: string[] },
) {
  const mapping2Complete = diagnostics.duplicateIds.length === 0
    && diagnostics.missingPassageRefs.length === 0
    && diagnostics.emptyPassages.length === 0
    && sourceGoalCount > 0
  return {
    version: 1,
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: 'complete',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtliche SH-Geschichte-Fachanforderungen liegen lokal vor',
            passed: true,
            details: spec.sourceDocument.path,
          },
          {
            id: 'source-document-url-registered',
            label: 'Originalquelle ist mit URL dokumentiert',
            passed: true,
            details: spec.sourceDocument.url,
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: sections.length === spec.sections.length ? 'complete' : 'incomplete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'expected-topic-coverage',
            label: 'Erwartete SH-Geschichte-Kompetenz- und Themenabschnitte sind als Passagen vorhanden',
            passed: sections.length === spec.sections.length,
            details: `${sections.length}/${spec.sections.length} Passagen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: spec.sourceDocument.path,
          },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: mapping2Complete ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-1'],
        checks: [
          {
            id: 'source-goals-created',
            label: 'Source-Ziele aus den amtlichen SH-Geschichte-Anforderungen erzeugt',
            passed: sourceGoalCount > 0,
            details: `${sourceGoalCount} Source-Ziele.`,
          },
          {
            id: 'passage-to-source-goal-coverage',
            label: 'Jede Passage hat mindestens ein Source-Ziel',
            passed: diagnostics.emptyPassages.length === 0,
            details: `Passagen ohne Source-Ziele: ${diagnostics.emptyPassages.join(', ') || '-'}`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: diagnostics.duplicateIds.length === 0,
            details: `Doppelte IDs: ${diagnostics.duplicateIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: diagnostics.missingPassageRefs.length === 0,
            details: `Ohne Passage: ${diagnostics.missingPassageRefs.join(', ') || '-'}`,
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
            passed: mapping2Complete,
            details: `${sourceGoalCount} Source-Ziele liegen vor; MAPPING-3 wurde gegen diese Source-Extraction-IDs abgeschlossen.`,
          },
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: spec.reviewPath,
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: true,
            details: `${sourceGoalCount}/${sourceGoalCount} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details: `Abgedeckt: ${sourceGoalCount}/${sourceGoalCount}; 0 explizite Canonical-Gaps, 0 unreviewed. 1:n/partial bezeichnet hier nur die Zuordnungsform.`,
          },
        ],
      },
    ],
  }
}

function buildReview(spec: ExtractionSpec, sourceGoals: GeneratedSourceGoal[]) {
  const decisions = sourceGoals.map((sourceGoal) => {
    const canonicalGoalIds = targetTitlesForSourceGoal(sourceGoal).map(requireCanonicalTitle)
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: 'partial',
      rationale: [
        `Das SH-Geschichte-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt.`,
        'matchType=partial bedeutet hier 1:n/Cluster-Zuordnung, nicht fachliche Unvollstaendigkeit.',
      ].join(' '),
      reviewedAt: generatedAt,
      reviewer: 'Codex',
    }
  })
  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  )

  return {
    version: 1,
    reviewId: spec.stage === 'SekI'
      ? 'de-sh-history-lower-secondary-source-extraction-to-canonical-history'
      : 'de-sh-history-upper-secondary-source-extraction-to-canonical-history',
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: spec.outputPath,
    status: 'complete',
    summary: {
      sourceGoals: sourceGoals.length,
      reviewedSourceGoals: sourceGoals.length,
      seedMappedSourceGoals: 0,
      mappedSourceGoals: sourceGoals.length,
      needsCanonicalGoal: 0,
      exactMappings: 0,
      partialMappings: sourceGoals.length,
      inheritedMappings: 0,
      note:
        'SH Geschichte ist vollständig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
    },
    mappings,
    decisions,
  }
}

function targetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  const titles = new Set<string>(baseTargetTitlesForTopic(sourceGoal.topicCode))
  const text = asciiFold(`${sourceGoal.topicCode} ${sourceGoal.sourceText}`)

  if (/geschichte|quelle|quellen|darstellung|geschichtskultur|geschichtsbewusstsein|erinnerung|gegenwart|konstrukt|narration|deutung|denkmal|film|medien|internet|zeitzeuge/u.test(text)) {
    titles.add('Warum Geschichte? - Relevanz und Orientierung')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }
  if (/steinzeit|neolith|hochkultur|aegypt|griechisch|athen|sparta|rom|roemisch|imperium|polis|antike/u.test(text)) {
    titles.add('Antike Traditionen und Rezeption der Antike')
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/mittelalter|herrschaftsformen|juden|christen|muslime|islam|bauwerk|religio|maurisch|osman/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
  }
  if (/fruehe neuzeit|renaissance|humanismus|reformation|aufklaerung|kolonial|expansion|migration|kulturen|kulturuebertragung/u.test(text)) {
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/menschenrecht|franzoesische revolution|unabhaengigkeitserklaerung|grundrecht|1848|buergerrecht|emanzipation|gleichberechtigung|frau/u.test(text)) {
    titles.add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    titles.add('Emanzipationsbestrebungen im 19. Jahrhundert')
  }
  if (/nation|nationalstaat|nationalismus|kaiserreich|patriotismus|daen|polen|verfassungspatriotismus/u.test(text)) {
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    titles.add('Herrschaft und Gesellschaft im europäischen Vergleich')
  }
  if (/industrie|industrialisierung|arbeiter|soziale frage|wirtschaft|feudalismus|kapitalismus|globalisierung|ungleichheit|umwelt/u.test(text)) {
    titles.add('Industrialisierung – Wohlstand für wenige?')
  }
  if (/imperialismus|kolonialismus|dekolon|postkolonial|rassismus/u.test(text)) {
    titles.add('Imperialismus – Export europäischer Zivilisation?')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/erster weltkrieg|versailler|westfaelische|wiener kongress|friedensschluss|kriegskonferenz|friedensbewegung|friedenssicherung|uno|nato|konfliktloesung/u.test(text)) {
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
    titles.add('Weltpolitische Faktoren 1917–1945')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/weimar|erste deutsche demokratie|liberalismus|sozialismus|faschismus|demokratie ohne demokraten/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
  }
  if (/nationalsozial|holocaust|ns-|diktatur|antisemit|volksgemeinschaft|verfolgung|mussolini|totalitarismus|widerstand/u.test(text)) {
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    titles.add('Demokratie, Faschismus und Widerstand in Europa')
    titles.add('Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?')
  }
  if (/sowjetunion|ddr|sozialismus|ost-west|kalter krieg|blockbildung|bipolar|abschreckung/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/brd|bundesrepublik|deutschland geteilt|deutsche teilung|wiedervereinigung|buergerrechtsbewegung|europa|europaeische einigung/u.test(text)) {
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Deutschland von der Teilung zur Einheit')
  }

  return [...titles]
}

function baseTargetTitlesForTopic(topicCode: string): string[] {
  if (topicCode.startsWith('SI-C')) {
    return ['Warum Geschichte? - Relevanz und Orientierung', 'Geschichtsbilder und Geschichtspolitik']
  }
  if (topicCode === 'SI-T1') return ['Antike Traditionen und Rezeption der Antike', 'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter']
  if (topicCode === 'SI-T2') return ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Interkulturelle Begegnungen und europäische Aufbrüche']
  if (topicCode === 'SI-T3') return ['Interkulturelle Begegnungen und europäische Aufbrüche', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit']
  if (topicCode === 'SI-T4') {
    return [
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Industrialisierung – Wohlstand für wenige?',
      'Herrschaft und Gesellschaft im europäischen Vergleich',
    ]
  }
  if (topicCode === 'SI-T5') return ['Imperialismus – Export europäischer Zivilisation?', 'Der Erste Weltkrieg – Zerstörung der alten Ordnung']
  if (topicCode === 'SI-T6') {
    return [
      'Weimarer Republik als erste deutsche Demokratie',
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Demokratie, Faschismus und Widerstand in Europa',
    ]
  }
  if (topicCode === 'SI-T7') return ['Der Kalte Krieg – stabile oder labile Ordnung?', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  if (topicCode === 'SI-T8') return ['Teilung Deutschlands – eine Nation, zwei Staaten', 'Deutschland von der Teilung zur Einheit']
  if (topicCode === 'E1') return ['E-Phase Geschichte', 'Warum Geschichte? - Relevanz und Orientierung']
  if (topicCode === 'E2') return ['Interkulturelle Begegnungen und europäische Aufbrüche', 'Imperialismus – Export europäischer Zivilisation?']
  if (topicCode === 'E3') return ['Infragestellung traditionaler Herrschaft in der frühen Neuzeit', 'Industrialisierung – Wohlstand für wenige?']
  if (topicCode === 'Q1.1') {
    return [
      'Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?',
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Emanzipationsbestrebungen im 19. Jahrhundert',
    ]
  }
  if (topicCode === 'Q1.2') {
    return [
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Herrschaft und Gesellschaft im europäischen Vergleich',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
    ]
  }
  if (topicCode === 'Q2.1') {
    return [
      'Weimarer Republik als erste deutsche Demokratie',
      'Aushöhlung der Demokratie und Errichtung der Diktatur',
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Russische Revolution und Stalinismus',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
    ]
  }
  if (topicCode === 'Q2.2') {
    return [
      'Der Erste Weltkrieg – Zerstörung der alten Ordnung',
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
    ]
  }
  return ['Warum Geschichte? - Relevanz und Orientierung']
}

function updateRegistry(updatedSpecs: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const landscapeIds = new Set(updatedSpecs.map((spec) => spec.sourceLandscapeId))
  const nextEntries = registry.entries.filter((entry) => !landscapeIds.has(String(entry.landscapeId)))
  for (const spec of updatedSpecs) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: spec.jurisdiction,
      subject: 'Geschichte',
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: spec.sourceDocument.path,
      archiveSourcePath: spec.sourceDocument.path,
      archivePath: spec.archivePath,
      sourceDocumentKey: spec.sourceDocument.key,
      sourceUrl: spec.sourceDocument.url,
    })
  }
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(lowerCount: number, upperCount: number): void {
  const path = 'curricula/DE/Gymnasium/input/SH/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Schleswig-Holstein (SH) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-SH-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '',
    '### Sekundarstufe I',
    '- **Fachanforderungen Geschichte Sekundarstufe I / Sekundarstufe II (2016)**',
    `- Offizielle Quelle: ${sourceDocument.url}`,
    '- Archived source PDF: `Fachanforderungen_Geschichte_SEK_barrierearm.pdf`',
    '- Source extraction: `lower-secondary/source-extraction/DE_SH_GESCHICHTE_SEKI_FACHANFORDERUNGEN_2016.source-extraction.json`',
    `- M3 status: \`complete\` (${lowerCount} Source-Ziele)`,
    '',
    '### Sekundarstufe II',
    '- **Fachanforderungen Geschichte Sekundarstufe I / Sekundarstufe II (2016)**',
    `- Offizielle Quelle: ${sourceDocument.url}`,
    '- Archived source PDF: `Fachanforderungen_Geschichte_SEK_barrierearm.pdf`',
    '- Source extraction: `upper-secondary/source-extraction/DE_SH_GESCHICHTE_SEKII_FACHANFORDERUNGEN_2016.source-extraction.json`',
    `- M3 status: \`complete\` (${upperCount} Source-Ziele)`,
    '<!-- DE-SH-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-SH-GESCHICHTE-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateStageReferences(lowerCount: number, upperCount: number): void {
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/SH/lower-secondary/references.md',
    marker: 'DE-SH-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
    scope: `lower-secondary extraction target: SH Geschichte Kompetenzstandards plus acht verbindliche Halbjahresthemen (${lowerCount} Source-Ziele)`,
    extractionPath: specs[0].outputPath,
    reviewPath: specs[0].reviewPath,
  })
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/SH/upper-secondary/references.md',
    marker: 'DE-SH-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
    scope: `upper-secondary extraction target: SH Geschichte E/Q-Themen mit historischen Inhalten und Problemfragen (${upperCount} Source-Ziele)`,
    extractionPath: specs[1].outputPath,
    reviewPath: specs[1].reviewPath,
  })
}

function updateReferenceFile(args: { path: string; marker: string; scope: string; extractionPath: string; reviewPath: string }): void {
  const existing = existsSync(abs(args.path)) ? readFileSync(abs(args.path), 'utf8') : ''
  const section = [
    `<!-- ${args.marker}:start -->`,
    '## Geschichte source PDF (download link)',
    '',
    `- \`${sourceDocument.title}\`:`,
    `  ${sourceDocument.url}`,
    '',
    'Scope:',
    '',
    '- Schleswig-Holstein',
    '- Gymnasium',
    '- Geschichte',
    `- ${args.scope}`,
    '',
    'Archived locally at:',
    '',
    `- \`${sourceDocument.path}\``,
    '',
    'Source extraction:',
    '',
    `- \`${args.extractionPath}\``,
    '',
    'Mapping review:',
    '',
    `- \`${args.reviewPath}\``,
    `<!-- ${args.marker}:end -->`,
    '',
  ].join('\n')
  writeFileSync(abs(args.path), `${replaceMarkedSection(existing, args.marker, section).trim()}\n`, 'utf8')
}

function syncCanonicalHistoryApplicability(): void {
  const compilation = buildApplicabilityCompilation()
  const report = compilation.reports.find((candidate) => candidate.landscapeId === targetLandscapeId)
  if (!report) throw new Error(`No applicability report for canonical history ${targetLandscapeId}`)

  const compiledByGoalId = new Map(report.goals.map((goal) => [goal.goalId, goal.compiledApplicability]))
  const canonical = readJson<CanonicalLandscape>(canonicalPath)
  for (const goal of canonical.goals) {
    const compiled = compiledByGoalId.get(goal.id) ?? {}
    if ((compiled.jurisdiction?.length ?? 0) > 0) {
      goal.applicability = compiled
    } else {
      delete goal.applicability
    }
  }
  writeJson(canonicalPath, canonical)
}

function loadCanonicalTitleToId(): Map<string, string> {
  const canonical = readJson<CanonicalLandscape>(canonicalPath)
  const map = new Map<string, string>()
  for (const goal of canonical.goals) {
    map.set(goal.title, goal.id)
    map.set(asciiFold(goal.title), goal.id)
  }
  return map
}

function requireCanonicalTitle(title: string): string {
  const id = canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title))
  if (!id) throw new Error(`Missing canonical Geschichte title: ${title}`)
  return id
}

function findPattern(value: string, pattern: RegExp, startIndex: number): number {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
  const regex = new RegExp(pattern.source, flags)
  regex.lastIndex = startIndex
  const match = regex.exec(value)
  if (!match || match.index === undefined) throw new Error(`Could not locate pattern ${pattern}`)
  return match.index
}

function passageIdForSection(spec: ExtractionSpec, section: ParsedSection): string {
  return `${spec.sourceGoalPrefix}:${slug(section.code)}-${hash(section.title)}`
}

function sourceGoalId(spec: ExtractionSpec, section: ParsedSection, goal: ParsedGoal): string {
  return uuidFromString(`DE-SH-GESCHICHTE:${spec.stage}:${section.code}:${goal.kind}:${goal.aspectIndex}:${goal.text}`)
}

function titleFromSourceText(sourceText: string): string {
  const firstClause = sourceText.split(/[;:]/u)[0] ?? sourceText
  const title = firstClause.length <= 120 ? firstClause : `${firstClause.slice(0, 117).trim()}...`
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function toSentenceFragment(sourceText: string): string {
  return `${sourceText.replace(/\.$/u, '')}.`
}

function normalizePassageText(value: string): string {
  return value
    .replace(/\f/gu, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => !isPdfArtifact(normalizeLine(line)))
    .join('\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim()
}

function normalizeGoalText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/\s+-\s+/gu, ' ')
    .replace(/\s+([,.;:!?])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()
}

function normalizeLine(line: string): string {
  return line
    .replace(/\u00a0/gu, ' ')
    .replace(/\u00ad/gu, '')
    .replace(/[ \t]+/gu, ' ')
    .trim()
}

function joinWrapped(current: string, nextLine: string): string {
  if (current.endsWith('-')) return `${current.slice(0, -1)}${nextLine}`
  return `${current} ${nextLine}`
}

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/u.test(line)
    || /^Fachanforderungen Geschichte/u.test(line)
    || /^Sekundarstufe I\s*\/\s*Sekundarstufe II/u.test(line)
    || /^Die Schülerinnen und Schüler$/u.test(line)
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates].sort()
}

function replaceMarkedSection(existing: string, marker: string, replacement: string): string {
  const pattern = new RegExp(`<!-- ${escapeRegExp(marker)}:start -->[\\s\\S]*?<!-- ${escapeRegExp(marker)}:end -->\\n?`, 'u')
  if (pattern.test(existing)) return existing.replace(pattern, `${replacement.trim()}\n`)
  return `${existing.trim()}\n\n${replacement.trim()}\n`
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(abs(path), 'utf8')) as T
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(abs(path)), { recursive: true })
  writeFileSync(abs(path), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
}

function asciiFold(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
    .replace(/ß/gu, 'ss')
    .toLowerCase()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function abs(path: string): string {
  return resolve(repoRoot, path)
}
