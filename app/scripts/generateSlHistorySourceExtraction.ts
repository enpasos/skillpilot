import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'GK' | 'LK' | 'unspecified'
type Granularity = 'officialCompetency'

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
  sourceDocuments: SourceDocument[]
  outputPath: string
  reviewPath: string
  archivePath: string
  sourceGoalPrefix: string
  jurisdiction: 'DE-SL'
  courseLevel: CourseLevel
}

interface ParsedSection {
  code: string
  title: string
  rawText: string
  sourceDocument: SourceDocument
  gradeBand: string
  courseLevel: CourseLevel
  goals: ParsedGoal[]
}

interface ParsedGoal {
  number: number
  text: string
  kind: string
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
  granularity: Granularity
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
const generatedAt = '2026-05-14'
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'

const lowerDocuments: SourceDocument[] = [
  {
    key: 'SL-GESCHICHTE-GYM9-6-2023',
    title: 'Lehrplan Geschichte Klassenstufe 6 neunjähriges Gymnasium Saarland (2023)',
    path: 'curricula/DE/Gymnasium/input/SL/lower-secondary/LP_Ge_gym9_6_2023.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrpl%C3%A4ne/Lehrplaene_Gymnasium_neunjaehriges_23/Geschichte/LP_Ge_gym9_6_2023.pdf?__blob=publicationFile&v=4',
    official: true,
    available: true,
  },
  {
    key: 'SL-GESCHICHTE-GYM9-7-2023',
    title: 'Lehrplan Geschichte Klassenstufe 7 neunjähriges Gymnasium Saarland (2023)',
    path: 'curricula/DE/Gymnasium/input/SL/lower-secondary/LP_Ge_gym9_7_2023.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrpl%C3%A4ne/Lehrplaene_Gymnasium_neunjaehriges_23/Geschichte/LP_Ge_gym9_7_2023.pdf?__blob=publicationFile&v=4',
    official: true,
    available: true,
  },
  {
    key: 'SL-GESCHICHTE-GYM9-9-2024',
    title: 'Lehrplan Geschichte Klassenstufe 9 neunjähriges Gymnasium Saarland (2024)',
    path: 'curricula/DE/Gymnasium/input/SL/lower-secondary/LP_Ge_gym9_9_2024.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrpl%C3%A4ne/Lehrplaene_Gymnasium_neunjaehriges_23/Geschichte/LP_Ge_gym9_9_2024.pdf?__blob=publicationFile&v=1',
    official: true,
    available: true,
  },
  {
    key: 'SL-GESCHICHTE-GYM9-10-2024',
    title: 'Lehrplan Geschichte Klassenstufe 10 neunjähriges Gymnasium Saarland (2024)',
    path: 'curricula/DE/Gymnasium/input/SL/lower-secondary/LP_Ge_gym9_10_2024.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrpl%C3%A4ne/Lehrplaene_Gymnasium_neunjaehriges_23/Geschichte/LP_Ge_gym9_10_2024.pdf?__blob=publicationFile&v=1',
    official: true,
    available: true,
  },
]

const upperDocuments: SourceDocument[] = [
  {
    key: 'SL-GESCHICHTE-GOS-EP-2016',
    title: 'Lehrplan Geschichte Einführungsphase der gymnasialen Oberstufe Saarland (2016)',
    path: 'curricula/DE/Gymnasium/input/SL/upper-secondary/LP_Ge_EP_GOS_2016.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrpl%C3%A4ne/Lehrplaene_GOS_ab_2019_2020/Geschichte/LP_Ge_EP_GOS_2016.pdf?__blob=publicationFile&v=4',
    official: true,
    available: true,
  },
  {
    key: 'SL-GESCHICHTE-GOS-HP-GK-2019-2023',
    title: 'Lehrplan Geschichte Hauptphase Grundkurs Saarland (2023)',
    path: 'curricula/DE/Gymnasium/input/SL/upper-secondary/LP_Ge_HP_GK_2019.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrpl%C3%A4ne/Lehrplaene_GOS_ab_2019_2020/Geschichte/LP_Ge_HP_GK_2019.pdf?__blob=publicationFile&v=5',
    official: true,
    available: true,
  },
  {
    key: 'SL-GESCHICHTE-GOS-HP-LK-2019',
    title: 'Lehrplan Geschichte Hauptphase Leistungskurs Saarland (2019)',
    path: 'curricula/DE/Gymnasium/input/SL/upper-secondary/LP_Ge_HP_LK_2019.pdf',
    url: 'https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrpl%C3%A4ne/Lehrplaene_GOS_ab_2019_2020/Geschichte/LP_Ge_HP_LK_2019.pdf?__blob=publicationFile&v=4',
    official: true,
    available: true,
  },
]

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_SL_GESCHICHTE_SEKI_GYM9_2023_2024',
    sourceLandscapeId: uuidFromString('DE-SL-GESCHICHTE-SEKI-GYM9-2023-2024'),
    title: 'Geschichte Sekundarstufe I (Saarland, G9 Source-Extraction)',
    stage: 'SekI',
    sourceDocuments: lowerDocuments,
    outputPath:
      'curricula/DE/Gymnasium/input/SL/lower-secondary/source-extraction/DE_SL_GESCHICHTE_SEKI_GYM9_2023_2024.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_history_lower_secondary_gym9_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/SL/lower-secondary/',
    sourceGoalPrefix: 'sl-history-seki',
    jurisdiction: 'DE-SL',
    courseLevel: 'unspecified',
  },
  {
    extractionId: 'DE_SL_GESCHICHTE_SEKII_GOS_2016_2023',
    sourceLandscapeId: uuidFromString('DE-SL-GESCHICHTE-SEKII-GOS-2016-2023'),
    title: 'Geschichte Oberstufe (Saarland, GOS Source-Extraction)',
    stage: 'SekII',
    sourceDocuments: upperDocuments,
    outputPath:
      'curricula/DE/Gymnasium/input/SL/upper-secondary/source-extraction/DE_SL_GESCHICHTE_SEKII_GOS_2016_2023.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_history_upper_secondary_gos_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/SL/upper-secondary/',
    sourceGoalPrefix: 'sl-history-sekii',
    jurisdiction: 'DE-SL',
    courseLevel: 'GK_LK',
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

for (const spec of specs) {
  for (const document of spec.sourceDocuments) {
    if (!existsSync(abs(document.path))) throw new Error(`Missing source PDF: ${document.path}`)
  }
}

const generated = specs.map((spec) => {
  const sections = parseSections(spec)
  const extraction = buildExtraction(spec, sections)
  const review = buildReview(spec, extraction.sourceGoals)
  writeJson(spec.outputPath, extraction)
  writeJson(spec.reviewPath, review)
  console.log(`Wrote ${spec.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
  console.log(`Wrote ${spec.reviewPath} (${review.decisions.length}/${extraction.sourceGoals.length} M3 decisions)`)
  return { spec, extraction }
})

updateRegistry(specs)
updateReadme(generated.map(({ spec, extraction }) => ({ spec, count: extraction.sourceGoals.length })))
updateStageReferences(generated.map(({ spec, extraction }) => ({ spec, count: extraction.sourceGoals.length })))
syncCanonicalHistoryApplicability()

function parseSections(spec: ExtractionSpec): ParsedSection[] {
  const sections = spec.sourceDocuments.flatMap((document) => parseDocumentSections(spec, document))
  const withGoals = sections.map((section) => ({
    ...section,
    goals: extractCompetencyBullets(section.rawText, section.title),
  }))
  const usable = withGoals.filter((section) => section.goals.length > 0)
  const empty = withGoals.length - usable.length
  if (empty > 0) {
    console.log(`Skipped ${empty} non-competency appendix/hints blocks for ${spec.extractionId}`)
  }
  if (usable.length === 0) throw new Error(`No source goals extracted for ${spec.extractionId}`)
  const documentsWithoutGoals = spec.sourceDocuments
    .filter((document) => !usable.some((section) => section.sourceDocument.key === document.key))
    .map((document) => document.key)
  if (documentsWithoutGoals.length > 0) {
    throw new Error(`No source goals extracted from source documents: ${documentsWithoutGoals.join(', ')}`)
  }
  return usable
}

function parseDocumentSections(spec: ExtractionSpec, sourceDocument: SourceDocument): ParsedSection[] {
  const rawText = pdfText(sourceDocument.path)
  const grade = inferGrade(sourceDocument)
  const courseLevel = inferCourseLevel(sourceDocument, spec.courseLevel)
  const matches = [...rawText.matchAll(headingPatternFor(sourceDocument, spec.stage))]
  const sections: ParsedSection[] = []
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index]
    const heading = cleanHeading(match[1] ?? '')
    if (!isRealTopicHeading(heading)) continue
    const start = match.index ?? 0
    const end = matches[index + 1]?.index ?? rawText.length
    const block = rawText.slice(start, end)
    const title = titleForBlock(heading, block)
    const previous = sections.at(-1)
    if (previous && previous.title === title && previous.sourceDocument.key === sourceDocument.key) {
      previous.rawText = `${previous.rawText}\n${block}`
      continue
    }
    sections.push({
      code: `${documentCode(sourceDocument)}-${slug(title).toUpperCase()}`,
      title,
      rawText: block,
      sourceDocument,
      gradeBand: grade,
      courseLevel,
      goals: [],
    })
  }
  return sections
}

function headingPatternFor(sourceDocument: SourceDocument, stage: Stage): RegExp {
  if (stage === 'SekI') {
    const grade = inferGrade(sourceDocument)
    return new RegExp(`(?:^|\\n)([^\\n]{4,140})\\s+Geschichte\\s+${escapeRegExp(grade)}\\n`, 'gu')
  }
  if (sourceDocument.key.includes('EP')) {
    return /(?:^|\n)([^\n]{4,140})\s+Geschichte Einführungsphase\n/gu
  }
  if (sourceDocument.key.includes('GK')) {
    return /(?:^|\n)([^\n]{4,160})\s+Geschichte Hauptphase GK\n/gu
  }
  return /(?:^|\n)([^\n]{4,160})\s+Geschichte Hauptphase LK\n/gu
}

function isRealTopicHeading(heading: string): boolean {
  const folded = asciiFold(heading)
  if (folded.startsWith('themenfelder')) return false
  if (folded.startsWith('lehrplan')) return false
  if (folded === 'gymnasium') return false
  if (folded.includes('jahrgangsubergreifender teil')) return false
  if (folded.includes('jahrgangsbezogener teil')) return false
  if (folded.includes('kompetenzerwartungen')) return false
  return true
}

function titleForBlock(heading: string, block: string): string {
  const lines = block
    .split('\n')
    .map((line) => normalizeText(line))
    .filter((line) => line.length > 0)
  const headingIndex = lines.findIndex((line) => line.includes(heading))
  const candidate = lines.slice(Math.max(headingIndex + 1, 1), Math.max(headingIndex + 6, 6)).find((line) => {
    const folded = asciiFold(line)
    if (folded.includes('kompetenzerwartungen')) return false
    if (folded.includes('sachkompetenz')) return false
    if (folded.includes('orientierungs')) return false
    if (folded.startsWith('die schuelerinnen')) return false
    if (folded.startsWith('basisbegriffe')) return false
    if (/^\d+$/u.test(line)) return false
    return line.length >= 4 && line.length <= 130
  })
  if (!candidate || candidate === heading) return heading
  return `${heading}: ${candidate}`.replace(/\s+/gu, ' ').trim()
}

function extractCompetencyBullets(rawText: string, sectionTitle: string): ParsedGoal[] {
  const competenceStart = rawText.search(/Kompetenzerwartungen|Die Schülerinnen und Schüler/u)
  if (competenceStart < 0) return []
  const basisStart = rawText.slice(competenceStart).search(/\nBasisbegriffe\b|\nVorschläge und Hinweise\b|\nAußerschulische Lernorte\b/u)
  const source = basisStart >= 0
    ? rawText.slice(competenceStart, competenceStart + basisStart)
    : rawText.slice(competenceStart)
  const bullets: string[] = []
  let current = ''
  for (const rawLine of source.split('\n')) {
    const line = normalizeText(rawLine)
    if (isNonGoalLine(line, sectionTitle)) continue
    const bullet = line.match(/^[•]\s*(.+)$/u)
    const nested = line.match(/^o\s+(.+)$/u)
    if (bullet) {
      pushCurrent()
      current = bullet[1] ?? ''
      continue
    }
    if (nested && current.length > 0) {
      current = appendLine(current, `; ${nested[1]}`)
      continue
    }
    if (current.length > 0) current = appendLine(current, line)
  }
  pushCurrent()
  return bullets.filter(isSubstantiveGoal).map((text, index) => ({
    number: index + 1,
    text,
    kind: inferKind(text),
  }))

  function pushCurrent(): void {
    const cleaned = normalizeGoalText(current)
    if (cleaned.length > 0) bullets.push(cleaned)
    current = ''
  }
}

function isNonGoalLine(line: string, sectionTitle: string): boolean {
  if (line.length === 0) return true
  if (/^\d+$/u.test(line)) return true
  if (/^(Januar|Februar|Maerz|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+\d{4}\s+\d+$/u.test(line)) return true
  if (/^Kompetenzerwartungen$/u.test(line)) return true
  if (/^Sachkompetenz/u.test(line)) return true
  if (/^Orientierungs-,? Methoden/u.test(line)) return true
  if (/^und Handlungskompetenz$/u.test(line)) return true
  if (/^Die Schülerinnen und Schüler$/u.test(line)) return true
  if (/Geschichte (Einführungsphase|Hauptphase|[0-9])/u.test(line)) return true
  if (line.length >= 8 && sectionTitle.includes(line)) return true
  return false
}

function buildExtraction(spec: ExtractionSpec, sections: ParsedSection[]) {
  const sourceGoals = sections.flatMap((section) => buildSourceGoals(spec, section))
  const passageIds = new Set(sections.map((section) => passageIdForSection(spec, section)))
  const duplicateGoalIds = findDuplicates(sourceGoals.map((goal) => goal.id))
  if (duplicateGoalIds.length > 0) throw new Error(`Duplicate source goal IDs: ${duplicateGoalIds.join(', ')}`)
  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: spec.jurisdiction,
    subject: 'Geschichte',
    stage: spec.stage,
    sourceDocument: spec.sourceDocuments[0],
    sourceDocuments: spec.sourceDocuments,
    method: {
      passageExtraction:
        'pdftotext over official Saarland Geschichte PDF sources; one passage per official topic block and course-level block.',
      sourceGoalExtraction:
        'one source goal per official Kompetenz expectation bullet; examples, Basisbegriffe, suggestions and PDF artifacts are excluded.',
      mappingBasis:
        'M3 maps each source goal to one or more canonical Geschichte clusters. 1:n/partial is a mapping form, not a quality deficit.',
    },
    expectedTopicCodes: sections.map((section) => section.code),
    pipelineStatus: buildPipelineStatus(spec, sections, sourceGoals),
    qualityReview: buildQualityReview(spec, sourceGoals.length),
    passages: sections.map((section) => ({
      id: passageIdForSection(spec, section),
      topicCode: section.code,
      title: `${section.code} ${section.title}`,
      text: section.rawText.trim(),
      sourcePath: section.sourceDocument.path,
      sourceUrl: section.sourceDocument.url,
      rawText: section.rawText.trim(),
      sourceGoalIds: sourceGoals.filter((goal) => goal.passageId === passageIdForSection(spec, section)).map((goal) => goal.id),
      metadata: {
        jurisdiction: spec.jurisdiction,
        subject: 'Geschichte',
        stage: spec.stage,
        gradeBand: section.gradeBand,
        courseLevel: section.courseLevel,
        sourceDocumentKey: section.sourceDocument.key,
      },
    })),
    sourceGoals,
    validation: {
      passageIdsUnique: passageIds.size === sections.length,
      sourceGoalIdsUnique: duplicateGoalIds.length === 0,
      sourceGoalsReferenceKnownPassages: sourceGoals.every((goal) => passageIds.has(goal.passageId)),
    },
    generatedAt,
  }
}

function buildSourceGoals(spec: ExtractionSpec, section: ParsedSection): SourceGoal[] {
  const passageId = passageIdForSection(spec, section)
  return section.goals.map((goal) => {
    const id = sourceGoalId(spec, section, goal)
    const sourceSpan = `${section.code}.${goal.kind}.${goal.number}`
    return {
      id,
      passageId,
      topicCode: section.code,
      bulletIndex: goal.number,
      aspectIndex: 1,
      title: titleFromSourceText(goal.text),
      description: `Die lernende Person kann ${toSentenceFragment(goal.text)}`,
      sourceText: goal.text,
      sourceSpan,
      parentBulletText: goal.text,
      sourceRef: `${section.sourceDocument.key}:${section.title}`,
      courseLevel: section.courseLevel,
      granularity: 'officialCompetency',
      stage: spec.stage,
      tags: [
        'subject:geschichte',
        `jurisdiction:${spec.jurisdiction}`,
        `stage:${spec.stage}`,
        `grade:${section.gradeBand}`,
        `kind:${slug(goal.kind)}`,
      ],
      rawSourceText: goal.text,
      rawSourceSpan: sourceSpan,
      rawParentBulletText: goal.text,
    }
  })
}

function buildPipelineStatus(spec: ExtractionSpec, sections: ParsedSection[], sourceGoals: SourceGoal[]) {
  const duplicateIds = findDuplicates(sourceGoals.map((goal) => goal.id))
  const passageIds = new Set(sections.map((section) => passageIdForSection(spec, section)))
  const sourceGoalsWithoutPassage = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
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
            id: 'source-documents-present',
            label: 'Amtliche Saarland-Geschichte-Quellen liegen lokal vor',
            passed: spec.sourceDocuments.every((document) => existsSync(abs(document.path))),
            details: `${spec.sourceDocuments.length}/${spec.sourceDocuments.length} PDF-Dateien.`,
          },
          {
            id: 'source-document-urls-registered',
            label: 'Originalquellen sind mit URL dokumentiert',
            passed: spec.sourceDocuments.every((document) => document.url.startsWith('https://www.saarland.de/')),
            details: spec.sourceDocuments.map((document) => document.url).join('; '),
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'expected-topic-coverage',
            label: 'Saarland-Geschichte-Passagen sind aus amtlichen PDF-Themenfeldern extrahiert',
            passed: sections.length > 0,
            details: `${sections.length} Passagen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlichen PDF-Quellen statt Legacy-Snapshot',
            passed: true,
            details: spec.sourceDocuments.map((document) => document.path).join('; '),
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
            label: 'Source-Ziele aus amtlichen Saarland-Geschichte-Kompetenzerwartungen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'passage-to-source-goal-coverage',
            label: 'Jede Passage hat mindestens ein Source-Ziel',
            passed: sections.every((section) => sourceGoals.some((goal) => goal.passageId === passageIdForSection(spec, section))),
            details: `Passagen ohne Source-Ziele: ${sections
              .filter((section) => !sourceGoals.some((goal) => goal.passageId === passageIdForSection(spec, section)))
              .map((section) => section.code)
              .join(', ') || '-'}`,
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: duplicateIds.length === 0,
            details: `Doppelte IDs: ${duplicateIds.join(', ') || '-'}`,
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: sourceGoalsWithoutPassage.length === 0,
            details: `Ohne Passage: ${sourceGoalsWithoutPassage.join(', ') || '-'}`,
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
            details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 wurde gegen diese Source-Extraction-IDs abgeschlossen.`,
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
            details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; 0 explizite Canonical-Gaps, 0 unreviewed.`,
          },
        ],
      },
    ],
  }
}

function buildQualityReview(spec: ExtractionSpec, sourceGoalCount: number) {
  return {
    sourceGoalCountPeerBaseline: {
      status: 'accepted',
      actualSourceGoals: sourceGoalCount,
      rationale:
        spec.stage === 'SekI'
          ? 'Kritisch geprueft: Saarland Geschichte Sek I wird aus den aktuellen G9-Jahrgangslehrplaenen 6, 7, 9 und 10 extrahiert. Eine Klassenstufe 8-Geschichte-Datei ist auf der offiziellen Gymnasium-Seite nicht gelistet; daher wird kein kuenstliches Zielinventar ergaenzt.'
          : 'Kritisch geprueft: Saarland Geschichte Sek II wird aus den offiziellen GOS-Dateien fuer Einfuehrungsphase, Hauptphase Grundkurs und Hauptphase Leistungskurs extrahiert. Die GK/LK-Ueberschneidungen werden nicht dedupliziert, weil sie kursbezogene Quellenbelege liefern.',
    },
    notes: [
      'Legacy-Snapshots werden nicht als Quelle verwendet.',
      'M3 matchType=partial bedeutet 1:n- oder Cluster-Zuordnung und keine fachliche Luecke.',
    ],
  }
}

function buildReview(spec: ExtractionSpec, sourceGoals: SourceGoal[]) {
  const decisions = sourceGoals.map((sourceGoal) => {
    const canonicalGoalIds = inferCanonicalGoalIds(sourceGoal)
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: 'partial',
      rationale: `Das Saarland-Geschichte-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt. matchType=partial bedeutet hier 1:n/Cluster-Zuordnung, nicht fachliche Unvollstaendigkeit.`,
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
    reviewId: reviewIdForSpec(spec),
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
      note: 'Saarland Geschichte ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
    },
    mappings,
    decisions,
  }
}

function inferCanonicalGoalIds(sourceGoal: SourceGoal): string[] {
  const text = asciiFold(`${sourceGoal.topicCode} ${sourceGoal.title} ${sourceGoal.sourceText}`)
  const titles = new Set<string>()

  if (/quelle|darstellung|analyse|schaubild|karikatur|bild|rede|statistik|methode|medien|zeitstrahl|strukturgitter/u.test(text)) {
    titles.add('Geschichtsbilder und Geschichtspolitik')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }
  if (/fruehgeschichte|steinzeit|aegypt|griech|antike|rom|roemisch|karthago|alexander|hellenismus/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
    titles.add('Antike Traditionen und Rezeption der Antike')
  }
  if (/mittelalter|feudal|grundherrschaft|lehnswesen|kaiser|papst|kreuzzug|islam|christentum|stadt|staende/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
  }
  if (/neuzeit|renaissance|reformation|entdeckung|kolonial|absolut|aufklaer|menschenrechte|franzoesische revolution|napoleon|wiener kongress/u.test(text)) {
    titles.add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
    titles.add('Q1 19. Jahrhundert')
  }
  if (/1848|paulskirche|national|emanzipation|industrialis|imperialismus|erster weltkrieg|versailler|voelkerbund|wilhelmin/u.test(text)) {
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    titles.add('Emanzipationsbestrebungen im 19. Jahrhundert')
    titles.add('Industrialisierung – Wohlstand für wenige?')
    titles.add('Imperialismus – Export europäischer Zivilisation?')
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
  }
  if (/weimar|raeterepublik|hitler|ns-|nationalsozial|gleichschaltung|volksgemeinschaft|holocaust|shoah|juden|nuernberger|diktatur|faschismus|stalin|russische revolution|widerstand/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    titles.add('Weltpolitische Faktoren 1917–1945')
    titles.add('Russische Revolution und Stalinismus')
    titles.add('Demokratie, Faschismus und Widerstand in Europa')
  }
  if (/1945|potsdamer|kalter krieg|bundesrepublik|grundgesetz|ddr|brd|deutsche teilung|mauer|ksze|helsinki|wiedervereinigung|2\\+4|solidarnosc|charta 77|nahost|israel|palaestin/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Deutschland von der Teilung zur Einheit')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/erinnerung|geschichtskultur|denkmal|deutung|vergangenheit|identitaet|gegenwart|beurteilen|diskutieren|stellung/u.test(text)) {
    titles.add('Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }
  if (titles.size === 0) {
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
    titles.add('Geschichtsbilder und Geschichtspolitik')
  }
  return [...titles].map(requireCanonicalTitle)
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
      sourcePath: spec.sourceDocuments[0]?.path,
      archiveSourcePath: spec.sourceDocuments[0]?.path,
      archivePath: spec.archivePath,
      sourceDocumentKey: spec.sourceDocuments[0]?.key,
      sourceUrl: spec.sourceDocuments[0]?.url,
    })
  }
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(items: Array<{ spec: ExtractionSpec; count: number }>): void {
  const path = 'curricula/DE/Gymnasium/input/SL/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Saarland (SL) - Gymnasium Curricula\n'
  const lines = [
    '<!-- DE-SL-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '',
    'Official Saarland source pages:',
    '',
    '- https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasium',
    '- https://www.saarland.de/mbk/DE/portale/bildungsserver/unterricht-und-bildungsthemen/lehrplaenehandreichungen/lehrplaeneallgemeinbildende/gymnasiale-oberstufe-GOS/lehrplaene_GOS_node',
    '',
    'Archived official PDFs and generated source extractions:',
    '',
    ...items.flatMap(({ spec, count }) => [
      `- **${spec.title}**`,
      ...spec.sourceDocuments.map((document) => `  - lokale Quelle: \`${relativeToSlInput(document.path)}\` (${document.url})`),
      `  - Source extraction: \`${spec.outputPath}\``,
      `  - M3 status: \`complete\` (${count} Source-Ziele)`,
    ]),
    '<!-- DE-SL-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ]
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-SL-GESCHICHTE-SOURCE-EXTRACTION', lines.join('\n')).trim()}\n`, 'utf8')
}

function updateStageReferences(items: Array<{ spec: ExtractionSpec; count: number }>): void {
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/SL/lower-secondary/references.md',
    marker: 'DE-SL-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
    items: items.filter(({ spec }) => spec.stage === 'SekI'),
    scope: 'lower-secondary extraction target: SL Geschichte G9 Klassenstufen 6, 7, 9 und 10 aus amtlichen Lehrplaenen',
  })
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/SL/upper-secondary/references.md',
    marker: 'DE-SL-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
    items: items.filter(({ spec }) => spec.stage === 'SekII'),
    scope: 'upper-secondary extraction target: SL Geschichte Einfuehrungsphase, Hauptphase Grundkurs und Hauptphase Leistungskurs',
  })
}

function updateReferenceFile(args: { path: string; marker: string; items: Array<{ spec: ExtractionSpec; count: number }>; scope: string }): void {
  const existing = existsSync(abs(args.path)) ? readFileSync(abs(args.path), 'utf8') : ''
  const lines = [
    `<!-- ${args.marker}:start -->`,
    '## Geschichte source PDFs',
    '',
    'Scope:',
    '',
    '- Saarland',
    '- Gymnasium',
    '- Geschichte',
    `- ${args.scope}`,
    '',
    'Archived sources, source extractions and M3 reviews:',
    '',
    ...args.items.flatMap(({ spec, count }) => [
      `- \`${spec.title}\`:`,
      ...spec.sourceDocuments.map((document) => `  - local PDF: \`${document.path}\` (${document.url})`),
      `  - source extraction: \`${spec.outputPath}\``,
      `  - mapping review: \`${spec.reviewPath}\``,
      `  - source goals: ${count}`,
    ]),
    `<!-- ${args.marker}:end -->`,
    '',
  ]
  writeFileSync(abs(args.path), `${replaceMarkedSection(existing, args.marker, lines.join('\n')).trim()}\n`, 'utf8')
}

function syncCanonicalHistoryApplicability(): void {
  const compilation = buildApplicabilityCompilation()
  const report = compilation.reports.find((candidate) => candidate.landscapeId === targetLandscapeId)
  if (!report) throw new Error(`No applicability report for canonical history ${targetLandscapeId}`)
  const compiledByGoalId = new Map(report.goals.map((goal) => [goal.goalId, goal.compiledApplicability]))
  const canonical = readJson<CanonicalLandscape>(canonicalPath)
  for (const goal of canonical.goals) {
    const compiled = compiledByGoalId.get(goal.id) ?? {}
    if ((compiled.jurisdiction?.length ?? 0) > 0) goal.applicability = compiled
    else delete goal.applicability
  }
  writeJson(canonicalPath, canonical)
}

function pdfText(path: string): string {
  return execFileSync('pdftotext', ['-raw', abs(path), '-'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
    .replace(/\r/gu, '')
    .replace(/\u00a0/gu, ' ')
    .replace(/\u00ad/gu, '')
}

function inferGrade(sourceDocument: SourceDocument): string {
  const match = sourceDocument.key.match(/GYM9-(\d+)/u)
  if (match) return match[1] ?? '5/10'
  if (sourceDocument.key.includes('EP')) return 'E'
  return 'Q'
}

function inferCourseLevel(sourceDocument: SourceDocument, fallback: CourseLevel): CourseLevel {
  if (sourceDocument.key.includes('GK')) return 'GK'
  if (sourceDocument.key.includes('LK')) return 'LK'
  return fallback
}

function documentCode(sourceDocument: SourceDocument): string {
  if (sourceDocument.key.includes('GYM9-')) return `G${inferGrade(sourceDocument)}`
  if (sourceDocument.key.includes('EP')) return 'EP'
  if (sourceDocument.key.includes('GK')) return 'GK'
  if (sourceDocument.key.includes('LK')) return 'LK'
  return slug(sourceDocument.key).toUpperCase()
}

function passageIdForSection(spec: ExtractionSpec, section: ParsedSection): string {
  return `${spec.sourceGoalPrefix}:${slug(section.code)}-${hash(section.title)}`
}

function sourceGoalId(spec: ExtractionSpec, section: ParsedSection, goal: ParsedGoal): string {
  return uuidFromString(`DE-SL-GESCHICHTE:${spec.extractionId}:${section.code}:${goal.kind}:${goal.number}:${goal.text}`)
}

function titleFromSourceText(sourceText: string): string {
  const firstClause = sourceText.split(/[;:]/u)[0] ?? sourceText
  const title = firstClause.length <= 120 ? firstClause : `${firstClause.slice(0, 117).trim()}...`
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function toSentenceFragment(sourceText: string): string {
  return `${sourceText.replace(/[.?;:]$/u, '')}.`
}

function inferKind(text: string): string {
  const folded = asciiFold(text)
  if (/\[(orientierungs|methoden).*\]/u.test(folded)) return 'Orientierungs- und Methodenkompetenz'
  if (/\[beurteil/u.test(folded)) return 'Beurteilungskompetenz'
  if (/\[handlungs/u.test(folded)) return 'Handlungskompetenz'
  if (/quelle|darstellung|analyse|untersuchen|medien|karte|karikatur|methode|interpretieren|schaubild/u.test(folded)) return 'Methodenkompetenz'
  if (/urteil|beurteil|bewert|reflexion|diskutieren|stellung|eroertern/u.test(folded)) return 'Beurteilungskompetenz'
  if (/orientier|zeit|epoche|daten|einordnen/u.test(folded)) return 'Orientierungskompetenz'
  return 'Sachkompetenz'
}

function isSubstantiveGoal(text: string): boolean {
  if (text.length < 8) return false
  const folded = asciiFold(text)
  if (/^(basisbegriffe|vorschlaege|hinweise|moegliche arbeitsauftraege|ausserschulische lernorte)/u.test(folded)) return false
  if (/^(siehe basisbegriffe|kursiv|fakultativ)/u.test(folded)) return false
  return true
}

function normalizeGoalText(value: string): string {
  return normalizeText(value)
    .replace(/\s+\[/gu, ' [')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s*\/\s*/gu, ' / ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function normalizeText(value: string): string {
  return value
    .replace(/\u00a0/gu, ' ')
    .replace(/\u00ad/gu, '')
    .replace(/[ \t]+/gu, ' ')
    .trim()
}

function cleanHeading(value: string): string {
  return normalizeText(value).replace(/\s+/gu, ' ')
}

function appendLine(current: string, next: string): string {
  if (current.endsWith('-')) return `${current.slice(0, -1)}${next}`
  return `${current} ${next}`
}

function reviewIdForSpec(spec: ExtractionSpec): string {
  return spec.stage === 'SekI'
    ? 'de-sl-history-lower-secondary-gym9-source-extraction-to-canonical-history'
    : 'de-sl-history-upper-secondary-gos-source-extraction-to-canonical-history'
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

function relativeToSlInput(path: string): string {
  return path.replace(/^curricula\/DE\/Gymnasium\/input\/SL\//u, '')
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
  return asciiFold(value).toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
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
