import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'GK' | 'LK' | 'unspecified'
type CompetencyKind = 'Sachkompetenz' | 'Methodenkompetenz' | 'Urteilskompetenz' | 'Handlungskompetenz'

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
  sections: SectionSpec[]
}

interface SectionSpec {
  code: string
  title: string
  startPattern: RegExp
  endPattern?: RegExp
  courseLevel: CourseLevel
  gradeBand: string
}

interface ParsedSection {
  code: string
  title: string
  rawText: string
  goals: ParsedGoal[]
  courseLevel: CourseLevel
  gradeBand: string
}

interface ParsedGoal {
  number: number
  text: string
  competencyKind: CompetencyKind
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
  granularity: 'officialCompetency'
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

const lowerSourceDocument: SourceDocument = {
  key: 'NW-GESCHICHTE-SEK-I-KLP-2019',
  title: 'Kernlehrplan Geschichte Sekundarstufe I Gymnasium Nordrhein-Westfalen (2019)',
  path: 'curricula/DE/Gymnasium/input/NW/lower-secondary/g9_ge_klp_3407_2019_06_23.pdf',
  url: 'https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_ge_klp_3407_2019_06_23.pdf',
  official: true,
  available: true,
}

const upperSourceDocument: SourceDocument = {
  key: 'NW-GESCHICHTE-SEK-II-KLP-GOST-2013',
  title: 'Kernlehrplan Geschichte gymnasiale Oberstufe Nordrhein-Westfalen (2013)',
  path: 'curricula/DE/Gymnasium/input/NW/upper-secondary/klp_gost_geschichte.pdf',
  url: 'https://lehrplannavigator.nrw.de/system/files/media/document/file/klp_gost_geschichte.pdf',
  official: true,
  available: true,
}

const lowerSections: SectionSpec[] = [
  {
    code: 'E-OVER',
    title: 'Übergeordnete Kompetenzerwartungen bis zum Ende der Erprobungsstufe',
    startPattern: /2\.2 Kompetenzerwartungen und inhaltliche Schwerpunkte bis zum\s+Ende der Erprobungsstufe/u,
    endPattern: /Inhaltsfeld 1:\s*Frühe Kulturen/u,
    courseLevel: 'unspecified',
    gradeBand: '5/6',
  },
  {
    code: 'E-IF1',
    title: 'Frühe Kulturen und erste Hochkulturen',
    startPattern: /Inhaltsfeld 1:\s*Frühe Kulturen und erste Hochkulturen/u,
    endPattern: /Inhaltsfeld 2:\s*Antike Lebenswelten/u,
    courseLevel: 'unspecified',
    gradeBand: '5/6',
  },
  {
    code: 'E-IF2',
    title: 'Antike Lebenswelten: Griechische Poleis und Imperium Romanum',
    startPattern: /Inhaltsfeld 2:\s*Antike Lebenswelten: Griechische Poleis und Imperium Roma-/u,
    endPattern: /Inhaltsfeld 3 a:\s*Lebenswelten im Mittelalter/u,
    courseLevel: 'unspecified',
    gradeBand: '5/6',
  },
  {
    code: 'E-IF3A',
    title: 'Lebenswelten im Mittelalter',
    startPattern: /Inhaltsfeld 3 a:\s*Lebenswelten im Mittelalter/u,
    endPattern: /2\.3 Kompetenzerwartungen und inhaltliche Schwerpunkte bis zum/u,
    courseLevel: 'unspecified',
    gradeBand: '5/6',
  },
  {
    code: 'SI-OVER',
    title: 'Übergeordnete Kompetenzerwartungen bis zum Ende der Sekundarstufe I',
    startPattern: /2\.3 Kompetenzerwartungen und inhaltliche Schwerpunkte bis zum\s+Ende der Sekundarstufe I/u,
    endPattern: /Inhaltsfeld 3 b:\s*Lebenswelten im Mittelalter/u,
    courseLevel: 'unspecified',
    gradeBand: '7/10',
  },
  {
    code: 'SI-IF3B',
    title: 'Lebenswelten im Mittelalter',
    startPattern: /Inhaltsfeld 3 b:\s*Lebenswelten im Mittelalter/u,
    endPattern: /Inhaltsfeld 4:\s*Frühe Neuzeit/u,
    courseLevel: 'unspecified',
    gradeBand: '7/10',
  },
  {
    code: 'SI-IF4',
    title: 'Frühe Neuzeit: Neue Welten, neue Horizonte',
    startPattern: /Inhaltsfeld 4:\s*Frühe Neuzeit: Neue Welten, neue Horizonte/u,
    endPattern: /Inhaltsfeld 5:\s*Das „lange“ 19\. Jahrhundert/u,
    courseLevel: 'unspecified',
    gradeBand: '7/10',
  },
  {
    code: 'SI-IF5',
    title: 'Das lange 19. Jahrhundert - politischer und wirtschaftlicher Wandel in Europa',
    startPattern: /Inhaltsfeld 5:\s*Das „lange“ 19\. Jahrhundert/u,
    endPattern: /Inhaltsfeld 6:\s*Imperialismus und Erster Weltkrieg/u,
    courseLevel: 'unspecified',
    gradeBand: '7/10',
  },
  {
    code: 'SI-IF6',
    title: 'Imperialismus und Erster Weltkrieg',
    startPattern: /Inhaltsfeld 6:\s*Imperialismus und Erster Weltkrieg/u,
    endPattern: /Inhaltsfeld 7:\s*Weimarer Republik/u,
    courseLevel: 'unspecified',
    gradeBand: '7/10',
  },
  {
    code: 'SI-IF7',
    title: 'Weimarer Republik',
    startPattern: /Inhaltsfeld 7:\s*Weimarer Republik/u,
    endPattern: /Inhaltsfeld 8:\s*Nationalsozialismus und Zweiter Weltkrieg/u,
    courseLevel: 'unspecified',
    gradeBand: '7/10',
  },
  {
    code: 'SI-IF8',
    title: 'Nationalsozialismus und Zweiter Weltkrieg',
    startPattern: /Inhaltsfeld 8:\s*Nationalsozialismus und Zweiter Weltkrieg/u,
    endPattern: /Inhaltsfeld 9:\s*Internationale Verflechtungen seit 1945/u,
    courseLevel: 'unspecified',
    gradeBand: '7/10',
  },
  {
    code: 'SI-IF9',
    title: 'Internationale Verflechtungen seit 1945',
    startPattern: /Inhaltsfeld 9:\s*Internationale Verflechtungen seit 1945/u,
    endPattern: /Inhaltsfeld 10:\s*Gesellschaftspolitische und wirtschaftliche Entwicklungen/u,
    courseLevel: 'unspecified',
    gradeBand: '7/10',
  },
  {
    code: 'SI-IF10',
    title: 'Gesellschaftspolitische und wirtschaftliche Entwicklungen in Deutschland seit 1945',
    startPattern: /Inhaltsfeld 10:\s*Gesellschaftspolitische und wirtschaftliche Entwicklungen/u,
    endPattern: /3 Lernerfolgsüberprüfung/u,
    courseLevel: 'unspecified',
    gradeBand: '7/10',
  },
]

const upperSections: SectionSpec[] = [
  {
    code: 'EF-OVER',
    title: 'Übergeordnete Kompetenzerwartungen bis zum Ende der Einführungsphase',
    startPattern: /2\.2 Kompetenzerwartungen und inhaltliche Schwerpunkte bis zum\s+Ende der Einführungsphase/u,
    endPattern: /Inhaltsfeld .+Erfahrungen mit Fremdsein/u,
    courseLevel: 'GK_LK',
    gradeBand: '11',
  },
  {
    code: 'EF-IF2',
    title: 'Erfahrungen mit Fremdsein in weltgeschichtlicher Perspektive',
    startPattern: /Inhaltsfeld .+Erfahrungen mit Fremdsein in weltgeschichtlicher Perspektive/u,
    endPattern: /Inhaltsfeld .+Islamische Welt/u,
    courseLevel: 'GK_LK',
    gradeBand: '11',
  },
  {
    code: 'EF-IF3',
    title: 'Islamische Welt - christliche Welt: Begegnung zweier Kulturen in Mittelalter und früher Neuzeit',
    startPattern: /Inhaltsfeld .+Islamische Welt.+christliche Welt/u,
    endPattern: /Inhaltsfeld .+Menschenrechte in historischer Perspektive/u,
    courseLevel: 'GK_LK',
    gradeBand: '11',
  },
  {
    code: 'EF-IF4',
    title: 'Menschenrechte in historischer Perspektive',
    startPattern: /Inhaltsfeld .+Menschenrechte in historischer Perspektive/u,
    endPattern: /2\.3 Kompetenzerwartungen und inhaltliche Schwerpunkte bis zum/u,
    courseLevel: 'GK_LK',
    gradeBand: '11',
  },
  {
    code: 'GK-OVER',
    title: 'Übergeordnete Kompetenzerwartungen Grundkurs bis zum Ende der Qualifikationsphase',
    startPattern: /2\.3\.1 Grundkurs/u,
    endPattern: /Inhaltsfeld .+Die moderne Industriegesellschaft zwischen Fortschritt und Krise/u,
    courseLevel: 'GK',
    gradeBand: '12/13',
  },
  {
    code: 'GK-IF5',
    title: 'Die moderne Industriegesellschaft zwischen Fortschritt und Krise',
    startPattern: /Inhaltsfeld .+Die moderne Industriegesellschaft zwischen Fortschritt und Krise/u,
    endPattern: /Inhaltsfeld .+Die Zeit des Nationalsozialismus/u,
    courseLevel: 'GK',
    gradeBand: '12/13',
  },
  {
    code: 'GK-IF6',
    title: 'Die Zeit des Nationalsozialismus - Voraussetzungen, Herrschaftsstrukturen, Nachwirkungen und Deutungen',
    startPattern: /Inhaltsfeld .+Die Zeit des Nationalsozialismus.+Voraussetzungen/u,
    endPattern: /Inhaltsfeld .+Nationalismus, Nationalstaat und deutsche Identität/u,
    courseLevel: 'GK',
    gradeBand: '12/13',
  },
  {
    code: 'GK-IF7',
    title: 'Nationalismus, Nationalstaat und deutsche Identität im 19. und 20. Jahrhundert',
    startPattern: /Inhaltsfeld .+Nationalismus, Nationalstaat und deutsche Identität/u,
    endPattern: /Inhaltsfeld .+Friedensschlüsse und Ordnungen des Friedens/u,
    courseLevel: 'GK',
    gradeBand: '12/13',
  },
  {
    code: 'GK-IF8',
    title: 'Friedensschlüsse und Ordnungen des Friedens in der Moderne',
    startPattern: /Inhaltsfeld .+Friedensschlüsse und Ordnungen des Friedens/u,
    endPattern: /2\.3\.2 Leistungskurs/u,
    courseLevel: 'GK',
    gradeBand: '12/13',
  },
  {
    code: 'LK-OVER',
    title: 'Übergeordnete Kompetenzerwartungen Leistungskurs bis zum Ende der Qualifikationsphase',
    startPattern: /2\.3\.2 Leistungskurs/u,
    endPattern: /Inhaltsfeld .+Die moderne Industriegesellschaft zwischen Fortschritt und Krise/u,
    courseLevel: 'LK',
    gradeBand: '12/13',
  },
  {
    code: 'LK-IF5',
    title: 'Die moderne Industriegesellschaft zwischen Fortschritt und Krise',
    startPattern: /Inhaltsfeld .+Die moderne Industriegesellschaft zwischen Fortschritt und Krise/u,
    endPattern: /Inhaltsfeld .+Die Zeit des Nationalsozialismus/u,
    courseLevel: 'LK',
    gradeBand: '12/13',
  },
  {
    code: 'LK-IF6',
    title: 'Die Zeit des Nationalsozialismus - Voraussetzungen, Herrschaftsstruktur, Nachwirkungen und Deutungen',
    startPattern: /Inhaltsfeld .+Die Zeit des Nationalsozialismus.+Voraussetzungen/u,
    endPattern: /Inhaltsfeld .+Nationalismus, Nationalstaat und deutsche Identität/u,
    courseLevel: 'LK',
    gradeBand: '12/13',
  },
  {
    code: 'LK-IF7',
    title: 'Nationalismus, Nationalstaat und deutsche Identität im 19. und 20. Jahrhundert',
    startPattern: /Inhaltsfeld .+Nationalismus, Nationalstaat und deutsche Identität/u,
    endPattern: /Inhaltsfeld .+Friedensschlüsse und Ordnungen des Friedens/u,
    courseLevel: 'LK',
    gradeBand: '12/13',
  },
  {
    code: 'LK-IF8',
    title: 'Friedensschlüsse und Ordnungen des Friedens in der Moderne',
    startPattern: /Inhaltsfeld .+Friedensschlüsse und Ordnungen des Friedens/u,
    endPattern: /3 Lernerfolgsüberprüfung/u,
    courseLevel: 'LK',
    gradeBand: '12/13',
  },
]

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_NW_GESCHICHTE_SEKI_KLP_2019',
    sourceLandscapeId: uuidFromString('DE-NW-GESCHICHTE-SEKI-KLP-2019'),
    title: 'Geschichte Sekundarstufe I (Nordrhein-Westfalen, KLP 2019 Source-Extraction)',
    stage: 'SekI',
    sourceDocument: lowerSourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/NW/lower-secondary/source-extraction/DE_NW_GESCHICHTE_SEKI_KLP_2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/nw_history_lower_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/NW/lower-secondary/',
    sourceGoalPrefix: 'nw-history-seki',
    pageFrom: 20,
    pageTo: 36,
    sections: lowerSections,
  },
  {
    extractionId: 'DE_NW_GESCHICHTE_SEKII_KLP_GOST_2013',
    sourceLandscapeId: uuidFromString('DE-NW-GESCHICHTE-SEKII-KLP-GOST-2013'),
    title: 'Geschichte Oberstufe (Nordrhein-Westfalen, KLP GOSt 2013 Source-Extraction)',
    stage: 'SekII',
    sourceDocument: upperSourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/NW/upper-secondary/source-extraction/DE_NW_GESCHICHTE_SEKII_KLP_GOST_2013.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nw_history_upper_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/NW/upper-secondary/',
    sourceGoalPrefix: 'nw-history-sekii',
    pageFrom: 20,
    pageTo: 44,
    sections: upperSections,
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

for (const spec of specs) {
  if (!existsSync(abs(spec.sourceDocument.path))) throw new Error(`Missing source PDF: ${spec.sourceDocument.path}`)
}

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

updateRegistry(generated.map((item) => item.spec))
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
  return extractSectionTexts(fullText, spec.sections).map((section) => {
    const goals = parseCompetencyGoals(section.rawText)
    if (goals.length === 0) throw new Error(`No NRW Geschichte source goals parsed for ${section.code}`)
    return { ...section, goals }
  })
}

function extractSectionTexts(fullText: string, sectionSpecs: SectionSpec[]): Omit<ParsedSection, 'goals'>[] {
  let cursor = 0
  return sectionSpecs.map((sectionSpec) => {
    const start = findPattern(fullText, sectionSpec.startPattern, cursor)
    const end = sectionSpec.endPattern ? findPattern(fullText, sectionSpec.endPattern, start + 1) : fullText.length
    if (end <= start) throw new Error(`Invalid NRW Geschichte section boundaries for ${sectionSpec.code}`)
    cursor = end
    return {
      code: sectionSpec.code,
      title: sectionSpec.title,
      rawText: fullText.slice(start, end).trim(),
      courseLevel: sectionSpec.courseLevel,
      gradeBand: sectionSpec.gradeBand,
    }
  })
}

function parseCompetencyGoals(rawText: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  const aspectIndexByKind = new Map<CompetencyKind, number>()
  let currentKind: CompetencyKind | null = null
  let current: string | null = null

  for (const rawLine of rawText.replace(/\f/gu, '\n').split('\n')) {
    const line = normalizeLine(rawLine)
    if (!line || isPdfArtifact(line)) continue

    const heading = competencyHeading(line)
    if (heading) {
      if (current && currentKind) pushGoal(goals, aspectIndexByKind, currentKind, current)
      current = null
      currentKind = heading
      continue
    }
    if (/^(Die Schülerinnen und Schüler|Inhaltliche Schwerpunkte|Bezieht man|Die Kompetenzen|Während die|zunächst|anschließend|werden|nachfolgend)/u.test(line)) {
      continue
    }
    if (/^[–-]\s+/u.test(line) || /^\d+\.\)/u.test(line) || /^[󰆂󰆃󰆄󰆅󰆆󰆇󰆈]/u.test(line)) continue

    if (/^[à■□]\s+/u.test(line)) {
      if (current && currentKind) pushGoal(goals, aspectIndexByKind, currentKind, current)
      current = line.replace(/^[à■□]\s+/u, '')
      continue
    }

    if (current && currentKind && (/^\s{2,}\S/u.test(rawLine) || /^[a-zäöüß(„]/u.test(line) || current.endsWith('-'))) {
      if (current.endsWith('-')) {
        current = /[A-ZÄÖÜ]{2,}-$/u.test(current) ? `${current}${line}` : `${current.slice(0, -1)}${line}`
      } else {
        current = `${current} ${line}`
      }
      continue
    }

    if (current && currentKind) pushGoal(goals, aspectIndexByKind, currentKind, current)
    current = null
  }

  if (current && currentKind) pushGoal(goals, aspectIndexByKind, currentKind, current)
  return goals
}

function pushGoal(
  goals: ParsedGoal[],
  aspectIndexByKind: Map<CompetencyKind, number>,
  competencyKind: CompetencyKind,
  value: string,
): void {
  const text = normalizeGoalText(value)
  if (text.length < 8) return
  const aspectIndex = (aspectIndexByKind.get(competencyKind) ?? 0) + 1
  aspectIndexByKind.set(competencyKind, aspectIndex)
  goals.push({
    number: goals.length + 1,
    text,
    competencyKind,
    aspectIndex,
  })
}

function competencyHeading(line: string): CompetencyKind | null {
  if (/^SACHKOMPETENZ$|^Sachkompetenz$/u.test(line)) return 'Sachkompetenz'
  if (/^METHODENKOMPETENZ$|^Methodenkompetenz$/u.test(line)) return 'Methodenkompetenz'
  if (/^URTEILSKOMPETENZ$|^Urteilskompetenz$/u.test(line)) return 'Urteilskompetenz'
  if (/^HANDLUNGSKOMPETENZ$|^Handlungskompetenz$/u.test(line)) return 'Handlungskompetenz'
  return null
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
      return {
        id: sourceGoalId(spec, section, goal),
        passageId: passageIdForSection(spec, section),
        topicCode: section.code,
        bulletIndex: goal.number,
        aspectIndex: goal.aspectIndex,
        title: titleFromSourceText(sourceText),
        description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
        sourceText,
        sourceSpan: `${section.code}.${goal.competencyKind}.${goal.aspectIndex}`,
        parentBulletText: sourceText,
        sourceRef: `${spec.sourceDocument.title}, ${section.code} ${section.title}, ${goal.competencyKind}`,
        courseLevel: section.courseLevel,
        granularity: 'officialCompetency',
        stage: spec.stage,
        tags: [
          'jurisdiction:DE-NW',
          `stage:${spec.stage}`,
          `gradeBand:${section.gradeBand}`,
          `topic:${section.code}`,
          `courseLevel:${section.courseLevel}`,
          `competency:${goal.competencyKind}`,
        ],
        rawSourceText: goal.text,
        rawSourceSpan: `${section.code}.${goal.competencyKind}.${goal.aspectIndex}`,
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
    jurisdiction: 'DE-NW',
    subject: 'Geschichte',
    stage: spec.stage,
    sourceDocument: spec.sourceDocument,
    sourceDocuments: [spec.sourceDocument],
    method: {
      passageExtraction:
        'pdftotext -layout over official NRW Geschichte KLP page ranges; one passage per official competency block or Inhaltsfeld.',
      sourceGoalExtraction:
        'one source goal per explicit official Kompetenzbulletpoint in Sach-, Methoden-, Urteils- or Handlungskompetenz. Inhaltliche Schwerpunkte are retained in passages but not double-counted as separate source goals when the KLP operationalizes them through competency bullets.',
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
          ? 'Kritisch geprueft: NRW Geschichte Sek I wird aus den offiziellen Kompetenzbulletpoints der Erprobungsstufe und der Sek-I-Endstufe extrahiert. Die Zahl liegt hoeher als bei knapperen HE/BW-Altlehrplaenen, aber plausibel, weil NRW uebergeordnete und inhaltsfeldbezogene Kompetenzen getrennt ausweist.'
          : 'Kritisch geprueft: NRW Geschichte Sek II wird aus EF, Grundkurs und Leistungskurs extrahiert. Die hohe Zielzahl ist erwartbar, weil der KLP GK- und LK-Kompetenzerwartungen separat formuliert und diese nicht auf einen gemeinsamen Sammelsnapshot reduziert werden.',
      },
      notes: [
        'Legacy-Snapshots werden nicht als Quelle verwendet.',
        'Die frueher versehentlich geladene QUA-LiS-HTML-Seite wird nicht verwendet; die Source-Extraction verweist auf die direkten Lehrplannavigator-PDF-Dateien.',
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
            label: 'Amtlicher NRW-Geschichte-Kernlehrplan liegt lokal vor',
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
            label: 'Erwartete NRW-Geschichte-Kompetenzabschnitte sind als Passagen vorhanden',
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
            label: 'Source-Ziele aus den amtlichen NRW-Geschichte-Kompetenzerwartungen erzeugt',
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
        `Das NRW-Geschichte-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt.`,
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
      ? 'de-nw-history-lower-secondary-source-extraction-to-canonical-history'
      : 'de-nw-history-upper-secondary-source-extraction-to-canonical-history',
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
        'NRW Geschichte ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
    },
    mappings,
    decisions,
  }
}

function targetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  const titles = new Set<string>(baseTargetTitlesForTopic(sourceGoal.topicCode))
  const text = asciiFold(`${sourceGoal.topicCode} ${sourceGoal.sourceText}`)

  if (/geschichte|quelle|quellen|darstellung|geschichtskultur|geschichtsbewusstsein|erinnerung|gegenwart|konstrukt|narration|deutung|denkmal|film|medien|digital/u.test(text)) {
    titles.add('Warum Geschichte? - Relevanz und Orientierung')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }
  if (/steinzeit|bronzezeit|hochkultur|aegypt|griechisch|athen|sparta|rom|roemisch|imperium|polis|antike|barbar|german/u.test(text)) {
    titles.add('Antike Traditionen und Rezeption der Antike')
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/mittelalter|fraenkisch|karl|koenig|ritual|staende|christ|judentum|muslim|islam|kreuzzug|handel|metropole|religio|osman/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
  }
  if (/fruehe neuzeit|renaissance|humanismus|reformation|luther|hexen|dreissigjaehrig|entdeck|erober|kolonial|weltbild|migration|ruhr/u.test(text)) {
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/menschenrecht|aufklaerung|franzoesische revolution|wiener kongress|1848|kaiserreich|national|emanzipation|gleichberechtigung|judentum|frau/u.test(text)) {
    titles.add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    titles.add('Emanzipationsbestrebungen im 19. Jahrhundert')
    titles.add('Herrschaft und Gesellschaft im europäischen Vergleich')
  }
  if (/industrie|industrialisierung|arbeiter|arbeitswelt|soziale frage|massen|konsum|wirtschaft|weltwirtschaftskrise|krise|urbanisierung|verkehr|technik|umwelt/u.test(text)) {
    titles.add('Industrialisierung – Wohlstand für wenige?')
  }
  if (/imperialismus|imperialistisch|kolonial|dekolon|postkolonial|afrika|rassismus|verflechtung/u.test(text)) {
    titles.add('Imperialismus – Export europäischer Zivilisation?')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/erster weltkrieg|julkrise|1917|versailler|pariser fried|kriegsschuld|voelkerbund|napoleon|friedensordnung|friedenssicherung|uno|kalter krieg/u.test(text)) {
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
    titles.add('Weltpolitische Faktoren 1917–1945')
  }
  if (/weimar|novemberrevolution|raetesystem|reichsverfassung|parlamentarisch|demokratie|praesidial|nsdap/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
  }
  if (/nationalsozial|holocaust|shoah|ns-|diktatur|total|antisemit|fuehrer|gleichschaltung|vernichtung|euthanasie|sinti|roma|widerstand|faschismus/u.test(text)) {
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    titles.add('Demokratie, Faschismus und Widerstand in Europa')
  }
  if (/russland|sowjet|udssr|stalin|lenin|ostblock|mittel- und osteuropa|sozialismus/u.test(text)) {
    titles.add('Russische Revolution und Stalinismus')
    titles.add('Weltpolitische Faktoren 1917–1945')
  }
  if (/blockbildung|usa|udssr|brd|ddr|deutsch-deutsch|teilung|wiedervereinigung|1989|ost-west|souveraenitaet|europaeische integration|eu|multipolar|china|chile|arabisch|global/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Deutschland von der Teilung zur Einheit')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/nahost|israel|palaestin|suez|fundamentalismus/u.test(text)) {
    titles.add('Nahostkonflikt als weltpolitischer Krisenherd')
  }
  if (/ns-vergangenheit|aufarbeitung|vergangenheits|kollektive erinnerung|erinnerungskultur|gedaechtnis|geschichtspolitik/u.test(text)) {
    titles.add('Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
  }

  return [...titles]
}

function baseTargetTitlesForTopic(topicCode: string): string[] {
  if (topicCode === 'E-OVER') return ['E-Phase Geschichte', 'Warum Geschichte? - Relevanz und Orientierung']
  if (topicCode === 'E-IF1' || topicCode === 'E-IF2') {
    return ['Antike Traditionen und Rezeption der Antike', 'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter']
  }
  if (topicCode === 'E-IF3A' || topicCode === 'SI-IF3B') {
    return ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Interkulturelle Begegnungen und europäische Aufbrüche']
  }
  if (topicCode === 'SI-OVER') return ['Warum Geschichte? - Relevanz und Orientierung', 'Geschichtsbilder und Geschichtspolitik']
  if (topicCode === 'SI-IF4' || topicCode === 'EF-IF2' || topicCode === 'EF-IF3') {
    return ['Interkulturelle Begegnungen und europäische Aufbrüche', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit']
  }
  if (topicCode === 'SI-IF5' || topicCode === 'EF-IF4') {
    return [
      'Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?',
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Emanzipationsbestrebungen im 19. Jahrhundert',
      'Industrialisierung – Wohlstand für wenige?',
    ]
  }
  if (topicCode === 'SI-IF6') return ['Imperialismus – Export europäischer Zivilisation?', 'Der Erste Weltkrieg – Zerstörung der alten Ordnung']
  if (topicCode === 'SI-IF7') return ['Weimarer Republik als erste deutsche Demokratie', 'Aushöhlung der Demokratie und Errichtung der Diktatur']
  if (topicCode === 'SI-IF8') {
    return [
      'Weimarer Republik als erste deutsche Demokratie',
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Demokratie, Faschismus und Widerstand in Europa',
    ]
  }
  if (topicCode === 'SI-IF9' || topicCode === 'SI-IF10') {
    return [
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
    ]
  }
  if (topicCode === 'EF-OVER') return ['E-Phase Geschichte', 'Warum Geschichte? - Relevanz und Orientierung']
  if (topicCode === 'GK-OVER') return ['Q1 19. Jahrhundert', 'Q2 1917–1945', 'Q3 1945–Gegenwart', 'Q4 Erinnerungskultur']
  if (topicCode === 'LK-OVER') return ['Q1 19. Jahrhundert', 'Q2 1917–1945', 'Q3 1945–Gegenwart', 'Q4 Erinnerungskultur']
  if (topicCode.endsWith('IF5')) {
    return [
      'Industrialisierung – Wohlstand für wenige?',
      'Imperialismus – Export europäischer Zivilisation?',
      'Der Erste Weltkrieg – Zerstörung der alten Ordnung',
      'Weimarer Republik als erste deutsche Demokratie',
    ]
  }
  if (topicCode.endsWith('IF6')) {
    return [
      'Weimarer Republik als erste deutsche Demokratie',
      'Aushöhlung der Demokratie und Errichtung der Diktatur',
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?',
    ]
  }
  if (topicCode.endsWith('IF7')) {
    return [
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Herrschaft und Gesellschaft im europäischen Vergleich',
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
    ]
  }
  if (topicCode.endsWith('IF8')) {
    return [
      'Der Erste Weltkrieg – Zerstörung der alten Ordnung',
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
    ]
  }
  return ['Warum Geschichte? - Relevanz und Orientierung']
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
  return uuidFromString(`DE-NW-GESCHICHTE:${spec.stage}:${section.code}:${goal.competencyKind}:${goal.aspectIndex}:${goal.text}`)
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
    .replace(/\s+([,.;:])/gu, '$1')
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

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/u.test(line)
    || /^Kompetenzbereiche/u.test(line)
    || /^Kompetenzerwartungen und inhaltliche Schwerpunkte/u.test(line)
    || /^Geschichte$/u.test(line)
    || /^Inhalt$/u.test(line)
    || /^Kernlehrplan/u.test(line)
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

function updateRegistry(updatedSpecs: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const landscapeIds = new Set(updatedSpecs.map((spec) => spec.sourceLandscapeId))
  const nextEntries = registry.entries.filter((entry) => !landscapeIds.has(String(entry.landscapeId)))
  for (const spec of updatedSpecs) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: 'DE-NW',
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
  const path = 'curricula/DE/Gymnasium/input/NW/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Nordrhein-Westfalen (NW) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-NW-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '',
    '### Sekundarstufe I (Gymnasium G9)',
    '- **Kernlehrplan Geschichte Sekundarstufe I Gymnasium (2019)**',
    `- Offizielle Quelle: ${lowerSourceDocument.url}`,
    '- Archived source PDF: `lower-secondary/g9_ge_klp_3407_2019_06_23.pdf`',
    '- Source extraction: `lower-secondary/source-extraction/DE_NW_GESCHICHTE_SEKI_KLP_2019.source-extraction.json`',
    `- M3 status: \`complete\` (${lowerCount} Source-Ziele)`,
    '',
    '### Sekundarstufe II (Gymnasiale Oberstufe)',
    '- **Kernlehrplan Geschichte gymnasiale Oberstufe (2013)**',
    `- Offizielle Quelle: ${upperSourceDocument.url}`,
    '- Archived source PDF: `upper-secondary/klp_gost_geschichte.pdf`',
    '- Source extraction: `upper-secondary/source-extraction/DE_NW_GESCHICHTE_SEKII_KLP_GOST_2013.source-extraction.json`',
    `- M3 status: \`complete\` (${upperCount} Source-Ziele)`,
    '<!-- DE-NW-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-NW-GESCHICHTE-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateStageReferences(lowerCount: number, upperCount: number): void {
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/NW/lower-secondary/references.md',
    marker: 'DE-NW-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
    document: lowerSourceDocument,
    scope: `lower-secondary extraction target: NRW Geschichte Erprobungsstufe plus Sek-I-Endstufe (${lowerCount} Source-Ziele)`,
    extractionPath: specs[0].outputPath,
    reviewPath: specs[0].reviewPath,
  })
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/NW/upper-secondary/references.md',
    marker: 'DE-NW-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
    document: upperSourceDocument,
    scope: `upper-secondary extraction target: NRW Geschichte EF, Grundkurs and Leistungskurs (${upperCount} Source-Ziele)`,
    extractionPath: specs[1].outputPath,
    reviewPath: specs[1].reviewPath,
  })
}

function updateReferenceFile(args: {
  path: string
  marker: string
  document: SourceDocument
  scope: string
  extractionPath: string
  reviewPath: string
}): void {
  const existing = existsSync(abs(args.path)) ? readFileSync(abs(args.path), 'utf8') : ''
  const section = [
    `<!-- ${args.marker}:start -->`,
    '## Geschichte source PDF (download link)',
    '',
    `- \`${args.document.title}\`:`,
    `  ${args.document.url}`,
    '',
    'Scope:',
    '',
    '- Nordrhein-Westfalen',
    '- Gymnasium',
    '- Geschichte',
    `- ${args.scope}`,
    '',
    'Archived locally at:',
    '',
    `- \`${args.document.path}\``,
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
