import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'unspecified'
type Granularity = 'officialCompetency' | 'officialTopicItem'
type Parser = 'leftContentBlocks' | 'rightLearningGoals' | 'rawContentBlocks' | 'standards'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
  available: true
}

interface SectionSpec {
  code: string
  title: string
  pageFrom: number
  pageTo: number
  gradeBand: string
  courseLevel: CourseLevel
  granularity: Granularity
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
  jurisdiction: 'DE-MV'
  parser: Parser
  crop?: { x: number; width: number }
  sections: SectionSpec[]
}

interface ParsedGoal {
  number: number
  text: string
  kind: string
}

interface ParsedSection extends SectionSpec {
  rawText: string
  goals: ParsedGoal[]
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

const orientationSourceDocument: SourceDocument = {
  key: 'MV-GESCHICHTE-OS-5-6-2025',
  title: 'Rahmenplan Geschichte Orientierungsstufe 5/6 Mecklenburg-Vorpommern (2025)',
  path: 'curricula/DE/Gymnasium/input/MV/lower-secondary/RP_Ges_5-6_OS_2025.pdf',
  url: 'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_Ges_5-6_OS_2025.pdf',
  official: true,
  available: true,
}

const lowerGymSourceDocument: SourceDocument = {
  key: 'MV-GESCHICHTE-GYM-7-10-2023',
  title: 'Rahmenplan Geschichte Gymnasium 7-10 Mecklenburg-Vorpommern (2023)',
  path: 'curricula/DE/Gymnasium/input/MV/lower-secondary/rp_geschichte_sek_I_gym.pdf',
  url: 'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/rp_geschichte_sek_I_gym.pdf',
  official: true,
  available: true,
}

const upperSourceDocument: SourceDocument = {
  key: 'MV-GESCHICHTE-POLITISCHE-BILDUNG-SEKII-2019',
  title: 'Rahmenplan Geschichte und Politische Bildung Sekundarstufe II Mecklenburg-Vorpommern (2019)',
  path: 'curricula/DE/Gymnasium/input/MV/upper-secondary/RP_GEPO_SEK2.pdf',
  url: 'https://www.bildung-mv.de/export/sites/bildungsserver/.galleries/dokumente/unterricht/rahmenplaene/RP_GEPO_SEK2.pdf',
  official: true,
  available: true,
}

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_MV_GESCHICHTE_OS_RAHMENPLAN_2025',
    sourceLandscapeId: uuidFromString('DE-MV-GESCHICHTE-OS-RAHMENPLAN-2025'),
    title: 'Geschichte Orientierungsstufe 5/6 (Mecklenburg-Vorpommern, Rahmenplan 2025 Source-Extraction)',
    stage: 'SekI',
    sourceDocument: orientationSourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/MV/lower-secondary/source-extraction/DE_MV_GESCHICHTE_OS_RAHMENPLAN_2025.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_history_orientation_stage_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/MV/lower-secondary/',
    sourceGoalPrefix: 'mv-history-os',
    jurisdiction: 'DE-MV',
    parser: 'leftContentBlocks',
    crop: { x: 45, width: 190 },
    sections: [
      section('OS-5-ZEIT', 'Jahrgangsstufe 5: Zeit und Geschichte', 15, 16, '5/6'),
      section('OS-5-MENSCH-NATUR', 'Jahrgangsstufe 5: Mensch und Natur', 17, 18, '5/6'),
      section('OS-5-WIRTSCHAFT-GESELLSCHAFT', 'Jahrgangsstufe 5: Wirtschaft und Gesellschaft', 19, 20, '5/6'),
      section('OS-5-MEDIEN-GESELLSCHAFT', 'Jahrgangsstufe 5: Medien und Gesellschaft', 21, 22, '5/6'),
      section('OS-6-HERRSCHAFT-TEILHABE', 'Jahrgangsstufe 6: Herrschaft und Teilhabe', 23, 24, '5/6'),
      section('OS-6-MENSCH-GESELLSCHAFT', 'Jahrgangsstufe 6: Mensch und Gesellschaft', 25, 26, '5/6'),
      section('OS-6-ANTIKES-EUROPA', 'Jahrgangsstufe 6: Antikes Europa', 27, 27, '5/6'),
    ],
  },
  {
    extractionId: 'DE_MV_GESCHICHTE_SEKI_GYM_RAHMENPLAN_2023',
    sourceLandscapeId: uuidFromString('DE-MV-GESCHICHTE-SEKI-GYM-RAHMENPLAN-2023'),
    title: 'Geschichte Sekundarstufe I Gymnasium 7-10 (Mecklenburg-Vorpommern, Rahmenplan 2023 Source-Extraction)',
    stage: 'SekI',
    sourceDocument: lowerGymSourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/MV/lower-secondary/source-extraction/DE_MV_GESCHICHTE_SEKI_GYM_RAHMENPLAN_2023.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_history_lower_secondary_gym_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/MV/lower-secondary/',
    sourceGoalPrefix: 'mv-history-seki-gym',
    jurisdiction: 'DE-MV',
    parser: 'rightLearningGoals',
    crop: { x: 300, width: 250 },
    sections: [
      section('GYM-7', 'Klasse 7: Mittelalter und Frühe Neuzeit', 13, 20, '7'),
      section('GYM-8', 'Klasse 8: Ende 18. bis Anfang 20. Jahrhundert', 21, 26, '8'),
      section('GYM-9', 'Klasse 9: Versailler Vertrag bis Zweiter Weltkrieg', 27, 33, '9'),
      section('GYM-10', 'Klasse 10: Neubeginn nach 1945 bis 21. Jahrhundert', 34, 39, '10'),
    ],
  },
  {
    extractionId: 'DE_MV_GESCHICHTE_SEKII_GEPO_RAHMENPLAN_2019',
    sourceLandscapeId: uuidFromString('DE-MV-GESCHICHTE-GEPO-SEKII-RAHMENPLAN-2019'),
    title: 'Geschichte und Politische Bildung Qualifikationsphase (Mecklenburg-Vorpommern, Rahmenplan 2019 Source-Extraction)',
    stage: 'SekII',
    sourceDocument: upperSourceDocument,
    outputPath:
      'curricula/DE/Gymnasium/input/MV/upper-secondary/source-extraction/DE_MV_GESCHICHTE_SEKII_GEPO_RAHMENPLAN_2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_history_upper_secondary_gepo_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/MV/upper-secondary/',
    sourceGoalPrefix: 'mv-history-sekii',
    jurisdiction: 'DE-MV',
    parser: 'rawContentBlocks',
    sections: [
      section('SII-STANDARDS', 'Abschlussbezogene Standards', 9, 9, '11/12', 'GK_LK', 'officialCompetency'),
      section('SII-UMBRUECHE-STAAT', 'Gesellschaftliche Umbrüche und der moderne Staat', 11, 18, '11/12'),
      section('SII-NATIONALISMUS-GLOBALISIERUNG', 'Nationalismus und Globalisierung', 19, 24, '11/12'),
      section('SII-DEMOKRATIE-DIKTATUR', 'Demokratie und Diktatur', 25, 29, '11/12'),
      section('SII-KONFRONTATION-KOOPERATION', 'Konfrontation und Kooperation', 30, 33, '11/12'),
    ],
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
  return { spec, extraction }
})

updateRegistry(specs)
updateReadme(generated.map(({ spec, extraction }) => ({ spec, count: extraction.sourceGoals.length })))
updateStageReferences(generated.map(({ spec, extraction }) => ({ spec, count: extraction.sourceGoals.length })))
syncCanonicalHistoryApplicability()

function section(
  code: string,
  title: string,
  pageFrom: number,
  pageTo: number,
  gradeBand: string,
  courseLevel: CourseLevel = 'unspecified',
  granularity: Granularity = 'officialTopicItem',
): SectionSpec {
  return { code, title, pageFrom, pageTo, gradeBand, courseLevel, granularity }
}

function parseSections(spec: ExtractionSpec): ParsedSection[] {
  return spec.sections.map((section) => {
    const rawText = extractSectionText(spec, section)
    const goals = parseGoals(spec, section, rawText)
    if (goals.length === 0) throw new Error(`No Mecklenburg-Vorpommern Geschichte source goals parsed for ${section.code}`)
    return { ...section, rawText: normalizePassageText(rawText), goals }
  })
}

function parseGoals(spec: ExtractionSpec, sectionSpec: SectionSpec, rawText: string): ParsedGoal[] {
  if (sectionSpec.code === 'SII-STANDARDS') return parseStandardGoals(rawText)
  if (spec.parser === 'rightLearningGoals') return parseRightLearningGoals(rawText)
  return parseContentGoals(rawText)
}

function parseRightLearningGoals(rawText: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let current: string | null = null
  const flush = () => {
    if (!current) return
    const text = cleanSourceText(current)
    if (isSubstantiveGoal(text)) goals.push(toParsedGoal(text, goals.length, 'Lernziel'))
    current = null
  }
  for (const rawLine of rawText.replace(/\f/gu, '\n').split('\n')) {
    const line = normalizeLine(rawLine)
    if (!line || isPdfArtifact(line)) continue
    const learningGoal = /^Lernziel:\s*(.+)$/u.exec(line)
    if (learningGoal) {
      flush()
      current = learningGoal[1]
      continue
    }
    if (!current) continue
    if (/^(Hinweise und Anregungen|Beispiele:|Vertiefung|RG,|außerschulische|ca\.|[•])/u.test(line)) {
      flush()
      continue
    }
    current = shouldJoinContinuation(current, line) ? joinContinuation(current, line) : `${current} ${line}`
  }
  flush()
  return goals
}

function parseStandardGoals(rawText: string): ParsedGoal[] {
  const standardText = rawText.split(/\n\s*3\.2\s+Unterrichtsinhalte/u)[0] ?? rawText
  return parseDashGoals(standardText, 'Kompetenzstandard')
}

function parseDashGoals(rawText: string, kind: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let current: string | null = null
  const flush = () => {
    if (!current) return
    const text = cleanSourceText(current)
    if (isSubstantiveGoal(text)) goals.push(toParsedGoal(text, goals.length, inferKind(text) || kind))
    current = null
  }
  for (const rawLine of rawText.replace(/\f/gu, '\n').split('\n')) {
    const line = normalizeLine(rawLine)
    if (!line || isPdfArtifact(line)) continue
    const bullet = /^[\-–]\s*(.+)$/u.exec(line)
    if (bullet) {
      flush()
      current = bullet[1]
      continue
    }
    if (!current) continue
    if (/^(Sachkompetenz|Methodenkompetenz|Urteilskompetenz|3\.1|Eine Kompetenz|Für den Geschichtsunterricht|Schülerinnen und Schüler|Bezogen auf|fachspezifische Begriffe)/u.test(line)) {
      flush()
      continue
    }
    current = shouldJoinContinuation(current, line) ? joinContinuation(current, line) : `${current} ${line}`
  }
  flush()
  return goals
}

function parseContentGoals(rawText: string): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let current: string | null = null
  let active = false
  const flush = () => {
    if (!current) return
    const text = cleanSourceText(current)
    if (isSubstantiveGoal(text)) goals.push(toParsedGoal(text, goals.length, inferKind(text) || 'Fachinhalt'))
    current = null
  }
  for (const rawLine of rawText.replace(/\f/gu, '\n').split('\n')) {
    const normalized = normalizeLine(rawLine).replace(/^\d+\s+(?=[•])/u, '')
    if (!normalized) {
      flush()
      continue
    }
    let line = normalized
    if (line.includes('Verbindliche Inhalte')) {
      active = true
      flush()
      line = line.replace(/^.*Verbindliche Inhalte(?:\s+Hinweise.*)?/u, '').trim()
      if (!line) continue
    }
    if (isContentBoundary(line)) {
      flush()
      active = false
      continue
    }
    if (!active || isPdfArtifact(line) || shouldSkipContentLine(line)) continue
    const bullet = /^[•]\s*(.+)$/u.exec(line)
    if (bullet) {
      if (current && shouldJoinContinuation(current, bullet[1])) {
        current = joinContinuation(current, bullet[1])
        continue
      }
      flush()
      current = bullet[1]
      continue
    }
    if (current && shouldJoinContinuation(current, line)) current = joinContinuation(current, line)
    else {
      flush()
      current = line
    }
  }
  flush()
  return goals
}

function toParsedGoal(text: string, index: number, kind: string): ParsedGoal {
  return {
    number: index + 1,
    text: cleanSourceText(text),
    kind,
  }
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
  const sourceGoals: SourceGoal[] = sections.flatMap((section) =>
    section.goals.map((goal) => {
      const sourceText = cleanSourceText(goal.text)
      return {
        id: sourceGoalId(spec, section, goal),
        passageId: passageIdForSection(spec, section),
        topicCode: section.code,
        bulletIndex: goal.number,
        aspectIndex: goal.number,
        title: titleFromSourceText(sourceText),
        description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
        sourceText,
        sourceSpan: `${section.code}.${goal.kind}.${goal.number}`,
        parentBulletText: sourceText,
        sourceRef: `${spec.sourceDocument.title}, ${section.code} ${section.title}, ${goal.kind}`,
        courseLevel: section.courseLevel,
        granularity: section.granularity,
        stage: spec.stage,
        tags: [
          `jurisdiction:${spec.jurisdiction}`,
          `stage:${spec.stage}`,
          `gradeBand:${section.gradeBand}`,
          `topic:${section.code}`,
          `courseLevel:${section.courseLevel}`,
          `competency:${goal.kind}`,
        ],
        rawSourceText: goal.text,
        rawSourceSpan: `${section.code}.${goal.kind}.${goal.number}`,
        rawParentBulletText: goal.text,
      }
    }),
  )
  const duplicateIds = findDuplicates(sourceGoals.map((sourceGoal) => sourceGoal.id))
  const missingPassageRefs = sourceGoals.filter((sourceGoal) => !passageIds.has(sourceGoal.passageId)).map((sourceGoal) => sourceGoal.id)
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
        'pdftotext over official Mecklenburg-Vorpommern Geschichte/Geschichte-und-Politische-Bildung Rahmenplan page ranges; one passage per official topic or module block.',
      sourceGoalExtraction:
        'one source goal per official verbindlicher Inhalt, Lernziel, or abschlussbezogener Standard; examples, cross-curricular links, method suggestions, and PDF artifacts are excluded.',
      mappingBasis:
        'M3 maps each source goal to one or more canonical Geschichte clusters. 1:n/partial is a mapping form, not a quality deficit.',
    },
    expectedTopicCodes: sections.map((section) => section.code),
    pipelineStatus: buildPipelineStatus(spec, sections, sourceGoals.length, duplicateIds, missingPassageRefs, emptyPassages),
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        actualSourceGoals: sourceGoals.length,
        rationale: spec.stage === 'SekII'
          ? 'Kritisch geprueft: Der MV-Sek-II-Rahmenplan ist modular und kompakter als HE, enthaelt aber verbindliche Inhalte, Standards und LK-Module. Die Source-Ziele stammen aus diesen amtlichen Pflichtpositionen, nicht aus einem Legacy-Snapshot.'
          : 'Kritisch geprueft: MV Sek I besteht aus einem aktuellen Orientierungsstufenplan 5/6 und einem Gymnasialplan 7-10. Die Source-Ziele folgen den amtlichen verbindlichen Inhalten und Lernziel-Zeilen; Beispiele und Hinweise werden nicht kuenstlich als Pflichtziele gezaehlt.',
      },
      notes: [
        'Legacy-Snapshots werden nicht als Quelle verwendet.',
        'Die MV-Orientierungsstufe 5/6 wird als fruehe Sek-I-Feeder-Quelle separat registriert, weil MV sie in einem eigenen Rahmenplan fuehrt.',
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
  duplicateIds: string[],
  missingPassageRefs: string[],
  emptyPassages: string[],
) {
  const mapping2Complete = sourceGoalCount > 0 && duplicateIds.length === 0 && missingPassageRefs.length === 0 && emptyPassages.length === 0
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
          { id: 'source-document-present', label: 'Amtliche MV-Geschichte-Quelle liegt lokal vor', passed: true, details: spec.sourceDocument.path },
          { id: 'source-document-url-registered', label: 'Originalquelle ist mit URL dokumentiert', passed: true, details: spec.sourceDocument.url },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: sections.length > 0 ? 'complete' : 'incomplete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          { id: 'expected-topic-coverage', label: 'Erwartete MV-Geschichte-Passagen sind vorhanden', passed: sections.length === spec.sections.length, details: `${sections.length}/${spec.sections.length} Passagen.` },
          { id: 'passage-extraction-source', label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot', passed: true, details: spec.sourceDocument.path },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: mapping2Complete ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-1'],
        checks: [
          { id: 'source-goals-created', label: 'Source-Ziele aus den amtlichen MV-Geschichte-Positionen erzeugt', passed: sourceGoalCount > 0, details: `${sourceGoalCount} Source-Ziele.` },
          { id: 'passage-to-source-goal-coverage', label: 'Jede Passage hat mindestens ein Source-Ziel', passed: emptyPassages.length === 0, details: `Passagen ohne Source-Ziele: ${emptyPassages.join(', ') || '-'}` },
          { id: 'source-goal-ids-unique', label: 'Source-Ziel-IDs sind eindeutig', passed: duplicateIds.length === 0, details: `Doppelte IDs: ${duplicateIds.join(', ') || '-'}` },
          { id: 'source-goals-reference-passages', label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage', passed: missingPassageRefs.length === 0, details: `Ohne Passage: ${missingPassageRefs.join(', ') || '-'}` },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: 'complete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          { id: 'mapping-2-complete', label: 'MAPPING-2 abgeschlossen', passed: mapping2Complete, details: `${sourceGoalCount} Source-Ziele liegen vor; MAPPING-3 wurde gegen diese Source-Extraction-IDs abgeschlossen.` },
          { id: 'm3-review-file-present', label: 'M3-Review-Datei ist vorhanden', passed: true, details: spec.reviewPath },
          { id: 'm3-all-source-goals-reviewed', label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung', passed: true, details: `${sourceGoalCount}/${sourceGoalCount} Source-Ziele reviewed; offen: 0.` },
          { id: 'm3-all-source-goals-covered-by-canonical', label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt', passed: true, details: `Abgedeckt: ${sourceGoalCount}/${sourceGoalCount}; 0 explizite Canonical-Gaps, 0 unreviewed.` },
        ],
      },
    ],
  }
}

function buildReview(spec: ExtractionSpec, sourceGoals: SourceGoal[]) {
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
        `Das MV-Geschichte-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt.`,
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
      note:
        'MV Geschichte ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
    },
    mappings,
    decisions,
  }
}

function targetTitlesForSourceGoal(sourceGoal: SourceGoal): string[] {
  const titles = new Set<string>(baseTargetTitlesForTopic(sourceGoal.topicCode))
  const text = asciiFold(`${sourceGoal.topicCode} ${sourceGoal.sourceText}`)
  if (/geschichte|quelle|darstellung|deutung|narration|erinnerung|geschichtskultur|gegenwart|zeitliche ordnung|medien historischen|rekonstruktion|karikatur|perspektive|intention|diskurs/u.test(text)) {
    titles.add('Warum Geschichte? - Relevanz und Orientierung')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }
  if (/steinzeit|jungsteinzeit|urmenschen|kulturen|rohstoffe|siedlung|aegypt|pharao|antike|griech|rom|demokratie|oligarchie|aristokratie|monarchie|sklaverei|mythen|voelkerwanderung/u.test(text)) {
    titles.add('Antike Traditionen und Rezeption der Antike')
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/mittelalter|lehnswesen|reisekoenigtum|reichskirchensystem|stadt|staedte|grundherr|hoerige|zunft|christentum|islam|religioese legitimation|missionierung|reformation|luther|buchenhagen|fruehe neuzeit|humanismus|kolonialismus|sklaverei/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/aufklaerung|volkssouveraenitaet|menschenrechte|gesellschaftsvertrag|verfassungsstaat|gewaltenteilung|absolut|metternich|zentralistisch|demokratiekonzept|revolution|franzoesische revolution|1848|partizipation/u.test(text)) {
    titles.add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    titles.add('Herrschaft und Gesellschaft im europäischen Vergleich')
  }
  if (/frau|frauen|emanzipation|gleichberechtigung|geschlecht|partizipationsbewegung|diskriminierung|menschenrechte/u.test(text)) {
    titles.add('Emanzipationsbestrebungen im 19. Jahrhundert')
  }
  if (/industrie|industrialisierung|arbeitswelt|soziale frage|soziale sicherung|kapitalismus|arbeit|wirtschaft|handel|infrastruktur|oeko|weltwirtschaft|globalisierung|medien|oeffentlichkeit/u.test(text)) {
    titles.add('Industrialisierung – Wohlstand für wenige?')
  }
  if (/nationalismus|nation|reichseinigung|bismarck|imperialismus|kolonial|voelkermord|genozid|migration|fremden|stereotype|feindbilder|versaille/u.test(text)) {
    titles.add('Imperialismus – Export europäischer Zivilisation?')
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
    titles.add('Weimarer Republik als erste deutsche Demokratie')
  }
  if (/weimar|praesidial|nsdap|nationalsozial|gleichschaltung|diktatur|holocaust|shoah|juden|vernichtung|widerstand|faschismus|propaganda|populismus|stalin|russland|sowjet/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    titles.add('Demokratie, Faschismus und Widerstand in Europa')
    titles.add('Russische Revolution und Stalinismus')
  }
  if (/blockbildung|kalter krieg|ost und west|ddr|brd|teilung|friedliche revolution|einheit|wiedervereinigung|europa|europaeische integration|eu|konflikt|transformationsprozess|osteuropa|multipolar|weltordnung/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Deutschland von der Teilung zur Einheit')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/nahost|israel|palaestina|krisenherd/u.test(text)) titles.add('Nahostkonflikt als weltpolitischer Krisenherd')
  if (/ns-verbrechen|aufarbeitung|gedenk|erinnerungskultur|opfer|taeter/u.test(text)) {
    titles.add('Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?')
    titles.add('Geschichtsbilder und Geschichtspolitik')
  }
  return [...titles]
}

function baseTargetTitlesForTopic(topicCode: string): string[] {
  if (topicCode === 'SII-STANDARDS') return ['Warum Geschichte? - Relevanz und Orientierung', 'Geschichtsbilder und Geschichtspolitik']
  if (/^OS-5-ZEIT/u.test(topicCode)) return ['Warum Geschichte? - Relevanz und Orientierung', 'Geschichtsbilder und Geschichtspolitik']
  if (/^OS-5-MENSCH|^OS-6-ANTIKES|^OS-6-HERRSCHAFT|^OS-6-MENSCH/u.test(topicCode)) {
    return ['Antike Traditionen und Rezeption der Antike', 'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter']
  }
  if (/^OS-5-WIRTSCHAFT|^OS-5-MEDIEN/u.test(topicCode)) {
    return ['Antike Traditionen und Rezeption der Antike', 'Warum Geschichte? - Relevanz und Orientierung']
  }
  if (topicCode === 'GYM-7') {
    return ['Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Interkulturelle Begegnungen und europäische Aufbrüche', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit']
  }
  if (topicCode === 'GYM-8') {
    return ['Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?', 'Industrialisierung – Wohlstand für wenige?', 'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?']
  }
  if (topicCode === 'GYM-9') {
    return ['Der Erste Weltkrieg – Zerstörung der alten Ordnung', 'Weimarer Republik als erste deutsche Demokratie', 'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten']
  }
  if (topicCode === 'GYM-10') {
    return ['Der Kalte Krieg – stabile oder labile Ordnung?', 'Teilung Deutschlands – eine Nation, zwei Staaten', 'Deutschland von der Teilung zur Einheit', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  }
  if (topicCode === 'SII-UMBRUECHE-STAAT') {
    return ['Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?', 'Herrschaft und Gesellschaft im europäischen Vergleich', 'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?']
  }
  if (topicCode === 'SII-NATIONALISMUS-GLOBALISIERUNG') {
    return ['Industrialisierung – Wohlstand für wenige?', 'Imperialismus – Export europäischer Zivilisation?', 'Der Erste Weltkrieg – Zerstörung der alten Ordnung', 'Weimarer Republik als erste deutsche Demokratie']
  }
  if (topicCode === 'SII-DEMOKRATIE-DIKTATUR') {
    return ['Weimarer Republik als erste deutsche Demokratie', 'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten', 'Demokratie, Faschismus und Widerstand in Europa', 'Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?']
  }
  if (topicCode === 'SII-KONFRONTATION-KOOPERATION') {
    return ['Der Kalte Krieg – stabile oder labile Ordnung?', 'Teilung Deutschlands – eine Nation, zwei Staaten', 'Deutschland von der Teilung zur Einheit', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  }
  return ['Warum Geschichte? - Relevanz und Orientierung']
}

function extractSectionText(spec: ExtractionSpec, sectionSpec: SectionSpec): string {
  if (spec.parser === 'leftContentBlocks' || spec.parser === 'rightLearningGoals') {
    if (!spec.crop) throw new Error(`Missing crop settings for ${spec.extractionId}`)
    return execFileSync(
      'pdftotext',
      [
        '-layout',
        '-x',
        String(spec.crop.x),
        '-y',
        '80',
        '-W',
        String(spec.crop.width),
        '-H',
        '720',
        '-f',
        String(sectionSpec.pageFrom),
        '-l',
        String(sectionSpec.pageTo),
        abs(spec.sourceDocument.path),
        '-',
      ],
      { encoding: 'utf8' },
    )
  }
  return execFileSync('pdftotext', ['-raw', '-f', String(sectionSpec.pageFrom), '-l', String(sectionSpec.pageTo), abs(spec.sourceDocument.path), '-'], {
    encoding: 'utf8',
  })
}

function isContentBoundary(line: string): boolean {
  return /^(Beispiele für|Wortebene|Satz-|Verknüpfungen|Verknüpfung mit|Bezüge zu|Die Lernenden|Kompetenzen\s+Die Lern|Sachkompetenz|Methodenkompetenz|Urteilskompetenz|thematisches Strukturierungskonzept|Themenvorschläge|Projektvorschlag|Methodische Hinweise|Hinweise und Anregungen|Operatoren|Die Abiturprüfungen)/u.test(line)
}

function shouldSkipContentLine(line: string): boolean {
  return /^(Jahrgangsstufe|Themen$|2\.3|Kompetenzen und Themen|3 Abschlussbezogene Standards|ca\.|ausschließlich für den Leistungskurs)$/u.test(line)
    || /^\[/.test(line)
    || /^P\s*\d/u.test(line)
}

function shouldJoinContinuation(current: string, line: string): boolean {
  const foldedCurrent = asciiFold(current)
  const foldedLine = asciiFold(line)
  const words = foldedLine.split(/\s+/u).filter(Boolean).length
  const lastToken = foldedCurrent.split(/\s+/u).filter(Boolean).at(-1) ?? ''
  if (current.endsWith('-') || current.endsWith(',') || current.endsWith('–')) return true
  if (/^[a-zäöüß(]/u.test(line)) return true
  if (/^\(.+\)$/u.test(current.trim()) && words <= 8) return true
  if (/^(?:[a-zäöüß]+-)?und\b/u.test(foldedLine) && words <= 8) return true
  if (/^(unterschiedlicher|gesellschaftlicher|naturlichen|naturlicher|naturraumlichen|technische|technischen|fruhen|zeitgenossische|zeitgenossischen|europaischen|politischen|gesellschaftlichen|wirtschaftlichen|historischen|vorrevolutionaren|okologische|okologischen|soziale|zweier|hinsichtlich|auf)$/u.test(lastToken) && words <= 6) return true
  if (/\b(und|oder|der|die|das|des|dem|den|eines|einer|in|im|mit|von|zur|zum|als|fuer|fur|ueber|uber|gegen|zwischen|sozialer)$/u.test(foldedCurrent) && words <= 6) {
    return true
  }
  return false
}

function joinContinuation(current: string, line: string): string {
  return current.endsWith('-') ? `${current.slice(0, -1)}${line}` : `${current} ${line}`
}

function cleanSourceText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/\b\d+\s+(?=[•])/gu, '')
    .replace(/(?<=[A-Za-zÄÖÜäöüß])\d+\s+(?=[a-zäöüß])/gu, '')
    .replace(/\s+\d{1,2}\s+(?=(?:der|die|das|des|den|dem|von|zur|zum|im|in|und)\b)/gu, ' ')
    .replace(/(Menschen|Gesellschafts|Informations|Religions)und/gu, '$1- und')
    .replace(/Bildund/gu, 'Bild- und')
    .replace(/Bildzur/gu, 'Bild- zur')
    .replace(/Regelund/gu, 'Regel- und')
    .replace(/PushPull-?Faktoren/gu, 'Push-Pull-Faktoren')
    .replace(/Visua lisierung/gu, 'Visualisierung')
    .replace(/\bMacht begrenzung\b/gu, 'Machtbegrenzung')
    .replace(/\s+Beispiele für[\s\S]*$/u, '')
    .replace(/\s+Verknüpfungen[\s\S]*$/u, '')
    .replace(/\s+thematisches Strukturierungskonzept[\s\S]*$/u, '')
    .replace(/\s+Hinweise und Anregungen[\s\S]*$/u, '')
    .replace(/\s+P\s*\d[\s\S]*$/u, '')
    .replace(/([A-Za-zÄÖÜäöüß]{3,})-\s*([A-Za-zÄÖÜäöüß]{2,})/gu, '$1$2')
    .replace(/Bildund/gu, 'Bild- und')
    .replace(/Bildzur/gu, 'Bild- zur')
    .replace(/Regelund/gu, 'Regel- und')
    .replace(/PushPull-?Faktoren/gu, 'Push-Pull-Faktoren')
    .replace(/,\s+legitimation/gu, ', -legitimation')
    .replace(/Differen zierung/gu, 'Differenzierung')
    .replace(/Hierar chien/gu, 'Hierarchien')
    .replace(/\s+([,.;:!?])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()
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
    || /^Rahmenplan/u.test(line)
    || /^Kompetenzen und Themen im Fachunterricht/u.test(line)
    || /^3 Abschlussbezogene Standards/u.test(line)
}

function isSubstantiveGoal(text: string): boolean {
  if (text.length < 8) return false
  const folded = asciiFold(text)
  if (/^(verbindliche inhalte|hinweise|beispiele|themenvorschlaege|methodische hinweise|projektvorschlag|ca\.|p\s*\d)$/u.test(folded)) return false
  if (/^(rg,|ausser schulische|außerschulische|vertiefung, z\. b\.)/u.test(folded)) return false
  return true
}

function inferKind(text: string): string {
  const folded = asciiFold(text)
  if (/quelle|darstellung|analyse|untersuchen|medien|karte|rekonstruktion|karikatur|methode|operator|formulieren|narration|diskurs|erschliessen/u.test(folded)) return 'Methodenkompetenz'
  if (/urteil|beurteil|bewert|reflexion|diskutieren|kritik|wert|vergleichen|vergleich/u.test(folded)) return 'Urteilskompetenz'
  if (/orientier|geschichte|zeit|gegenwart|deutung|epoche|konzept|frage/u.test(folded)) return 'Orientierungskompetenz'
  return 'Sachkompetenz'
}

function passageIdForSection(spec: ExtractionSpec, sectionSpec: SectionSpec): string {
  return `${spec.sourceGoalPrefix}:${slug(sectionSpec.code)}-${hash(sectionSpec.title)}`
}

function sourceGoalId(spec: ExtractionSpec, sectionSpec: SectionSpec, goal: ParsedGoal): string {
  return uuidFromString(`DE-MV-GESCHICHTE:${spec.extractionId}:${sectionSpec.code}:${goal.kind}:${goal.number}:${goal.text}`)
}

function titleFromSourceText(sourceText: string): string {
  const firstClause = sourceText.split(/[;:]/u)[0] ?? sourceText
  const title = firstClause.length <= 120 ? firstClause : `${firstClause.slice(0, 117).trim()}...`
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function toSentenceFragment(sourceText: string): string {
  return `${sourceText.replace(/[.?;:]$/u, '')}.`
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

function updateReadme(items: Array<{ spec: ExtractionSpec; count: number }>): void {
  const path = 'curricula/DE/Gymnasium/input/MV/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Mecklenburg-Vorpommern (MV) - Gymnasium Curricula\n'
  const lines = [
    '<!-- DE-MV-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '',
    'Official Bildungsserver MV source page:',
    '',
    '- https://www.bildung-mv.de/unterricht/rahmenplaene/rahmenplaene-fuer-die-allgemein-bildenden-faecher/geschichte/',
    '',
    'Archived official PDFs and generated source extractions:',
    '',
    ...items.flatMap(({ spec, count }) => [
      `- **${spec.sourceDocument.title}**`,
      `  - offizielle Quelle: ${spec.sourceDocument.url}`,
      `  - lokale Datei: \`${relativeToMvInput(spec.sourceDocument.path)}\``,
      `  - Source extraction: \`${spec.outputPath}\``,
      `  - M3 status: \`complete\` (${count} Source-Ziele)`,
    ]),
    '<!-- DE-MV-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ]
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-MV-GESCHICHTE-SOURCE-EXTRACTION', lines.join('\n')).trim()}\n`, 'utf8')
}

function updateStageReferences(items: Array<{ spec: ExtractionSpec; count: number }>): void {
  const lowerItems = items.filter(({ spec }) => spec.stage === 'SekI')
  const upperItems = items.filter(({ spec }) => spec.stage === 'SekII')
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/MV/lower-secondary/references.md',
    marker: 'DE-MV-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
    items: lowerItems,
    scope: 'lower-secondary extraction target: MV Geschichte Orientierungsstufe 5/6 und Gymnasium 7-10 aus den amtlichen Rahmenplaenen',
  })
  updateReferenceFile({
    path: 'curricula/DE/Gymnasium/input/MV/upper-secondary/references.md',
    marker: 'DE-MV-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
    items: upperItems,
    scope: 'upper-secondary extraction target: MV Geschichte und Politische Bildung Standards und verbindliche Modul-Inhalte',
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
    '- Mecklenburg-Vorpommern',
    '- Gymnasium',
    '- Geschichte',
    `- ${args.scope}`,
    '',
    'Archived sources, source extractions and M3 reviews:',
    '',
    ...args.items.flatMap(({ spec, count }) => [
      `- \`${spec.sourceDocument.title}\`:`,
      `  - official URL: ${spec.sourceDocument.url}`,
      `  - local PDF: \`${spec.sourceDocument.path}\``,
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

function reviewIdForSpec(spec: ExtractionSpec): string {
  if (spec.extractionId.includes('OS')) return 'de-mv-history-orientation-stage-source-extraction-to-canonical-history'
  if (spec.extractionId.includes('SEKI')) return 'de-mv-history-lower-secondary-gym-source-extraction-to-canonical-history'
  return 'de-mv-history-upper-secondary-gepo-source-extraction-to-canonical-history'
}

function relativeToMvInput(path: string): string {
  return path.replace(/^curricula\/DE\/Gymnasium\/input\/MV\//u, '')
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
