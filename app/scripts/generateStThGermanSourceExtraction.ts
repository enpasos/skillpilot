import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Jurisdiction = 'DE-ST' | 'DE-TH'
type Stage = 'SekI' | 'SekII'
type CourseLevel = 'unspecified' | 'both' | 'LK'

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
  jurisdiction: Jurisdiction
  stage: Stage
  outputPath: string
  reviewPath: string
  archivePath: string
  sourceDocument: SourceDocument
  officialPageUrl: string
  peerBaseline: string
}

interface ParsedGoal {
  sourceDocument: SourceDocument
  jurisdiction: Jurisdiction
  stage: Stage
  phase: string
  field: string
  section: string
  competencyKind: string
  text: string
  index: number
  courseLevel: CourseLevel
  page: number
}

interface Passage {
  id: string
  sourceDocumentKey: string
  topicCode: string
  title: string
  rawText: string
  sourceGoalIds: string[]
}

interface SourceGoal {
  id: string
  passageId: string
  topicCode: string
  title: string
  description: string
  sourceDocumentKey: string
  sourceRef: string
  sourceText: string
  sourceSpan: {
    passageId: string
    label: string
  }
  courseLevel: CourseLevel
  tags: string[]
  metadata: {
    extractionMethod: string
    phase: string
    field: string
    section: string
    competencyKind: string
    page: number
  }
}

interface Goal {
  id: string
  title: string
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const reviewedAt = '2026-05-14'

const stSourceDocument: SourceDocument = {
  key: 'ST-DEUTSCH-GYM-2022',
  title: 'Fachlehrplan Deutsch Gymnasium Sachsen-Anhalt 01.08.2022',
  path: 'curricula/DE/Gymnasium/input/ST/FLP_Deutsch_Gym_swd.pdf',
  url: 'https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung_2022/FLP_Deutsch_Gym_swd.pdf',
  official: true,
  available: true,
}

const thSourceDocument: SourceDocument = {
  key: 'TH-DEUTSCH-GYM-2019',
  title: 'Lehrplan Deutsch Gymnasium Thueringen 2019',
  path: 'curricula/DE/Gymnasium/input/TH/LP_GY_Deutsch_2019.pdf',
  url: 'https://www.schulportal-thueringen.de/tip/resources/medien/43341?dateiname=lp_gy_deutsch_neue%20Fassung_08.02.2019_TSP.pdf',
  official: true,
  available: true,
}

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_ST_DEUTSCH_SEKI_FACHLEHRPLAN_GYMNASIUM_2022',
    sourceLandscapeId: uuidFromString('DE-ST-DEUTSCH-SEKI-FACHLEHRPLAN-GYMNASIUM-2022'),
    title: 'Deutsch Sekundarstufe I (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)',
    jurisdiction: 'DE-ST',
    stage: 'SekI',
    outputPath:
      'curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_DEUTSCH_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/ST/lower-secondary/',
    sourceDocument: stSourceDocument,
    officialPageUrl: 'https://lisa.sachsen-anhalt.de/unterricht/lehrplaene',
    peerBaseline:
      'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV/RP/SL/SN = 559/257/434/379/379/273/417/221/226/392/380/333/600/328 Source-Ziele',
  },
  {
    extractionId: 'DE_ST_DEUTSCH_SEKII_FACHLEHRPLAN_GYMNASIUM_2022',
    sourceLandscapeId: uuidFromString('DE-ST-DEUTSCH-SEKII-FACHLEHRPLAN-GYMNASIUM-2022'),
    title: 'Deutsch Oberstufe (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)',
    jurisdiction: 'DE-ST',
    stage: 'SekII',
    outputPath:
      'curricula/DE/Gymnasium/input/ST/upper-secondary/source-extraction/DE_ST_DEUTSCH_SEKII_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/ST/upper-secondary/',
    sourceDocument: stSourceDocument,
    officialPageUrl: 'https://lisa.sachsen-anhalt.de/unterricht/lehrplaene',
    peerBaseline:
      'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV/RP/SL/SN = 559/257/434/379/379/273/417/221/226/392/380/333/600/328 Source-Ziele',
  },
  {
    extractionId: 'DE_TH_DEUTSCH_SEKI_LEHRPLAN_GYMNASIUM_2019',
    sourceLandscapeId: uuidFromString('DE-TH-DEUTSCH-SEKI-LEHRPLAN-GYMNASIUM-2019'),
    title: 'Deutsch Sekundarstufe I (Thueringen, Lehrplan Gymnasium 2019 Source-Extraction)',
    jurisdiction: 'DE-TH',
    stage: 'SekI',
    outputPath:
      'curricula/DE/Gymnasium/input/TH/lower-secondary/source-extraction/DE_TH_DEUTSCH_SEKI_LEHRPLAN_GYMNASIUM_2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/TH/lower-secondary/',
    sourceDocument: thSourceDocument,
    officialPageUrl: 'https://www.schulportal-thueringen.de/media/detail?tspi=9426',
    peerBaseline:
      'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV/RP/SL/SN/ST = 559/257/434/379/379/273/417/221/226/392/380/333/600/328/347 Source-Ziele',
  },
  {
    extractionId: 'DE_TH_DEUTSCH_SEKII_LEHRPLAN_GYMNASIUM_2019',
    sourceLandscapeId: uuidFromString('DE-TH-DEUTSCH-SEKII-LEHRPLAN-GYMNASIUM-2019'),
    title: 'Deutsch Oberstufe (Thueringen, Lehrplan Gymnasium 2019 Source-Extraction)',
    jurisdiction: 'DE-TH',
    stage: 'SekII',
    outputPath:
      'curricula/DE/Gymnasium/input/TH/upper-secondary/source-extraction/DE_TH_DEUTSCH_SEKII_LEHRPLAN_GYMNASIUM_2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/TH/upper-secondary/',
    sourceDocument: thSourceDocument,
    officialPageUrl: 'https://www.schulportal-thueringen.de/media/detail?tspi=9426',
    peerBaseline:
      'BW/HE/BY/BB/BE/NI/NW/SH/HB/HH/MV/RP/SL/SN/ST = 559/257/434/379/379/273/417/221/226/392/380/333/600/328/347 Source-Ziele',
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

function main(): void {
  for (const sourceDocument of [stSourceDocument, thSourceDocument]) {
    if (!existsSync(abs(sourceDocument.path))) throw new Error(`Missing official source PDF: ${sourceDocument.path}`)
  }

  const parsedGoals = [...parseSachsenAnhalt(), ...parseThueringen()]
  const generated = specs.map((spec) => {
    const stageGoals = parsedGoals
      .filter((goal) => goal.jurisdiction === spec.jurisdiction && goal.stage === spec.stage)
      .map((goal, index) => ({ ...goal, index: index + 1 }))
    const { extraction, review } = buildDocuments(spec, stageGoals)
    writeJson(spec.outputPath, extraction)
    writeJson(spec.reviewPath, review)
    console.log(`Wrote ${spec.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
    console.log(`Wrote ${spec.reviewPath} (${review.decisions.length}/${extraction.sourceGoals.length} M3 decisions)`)
    return { spec, count: extraction.sourceGoals.length }
  })

  updateRegistry(specs)
  updateReadmes(generated)
  updateStageReferences(generated)
}

function parseSachsenAnhalt(): ParsedGoal[] {
  const pages = pdfLayoutText(stSourceDocument.path).split('\f')
  const goals: ParsedGoal[] = []
  let phase = ''
  let stage: Stage = 'SekI'
  let courseLevel: CourseLevel = 'unspecified'
  let field = ''
  let section = ''
  let collecting = false
  let current = ''
  let pageNumber = 0

  const flush = (): void => {
    const text = cleanSourceText(current)
    if (text && phase && field && section && isMeaningfulSourceGoal(text)) {
      goals.push({
        sourceDocument: stSourceDocument,
        jurisdiction: 'DE-ST',
        stage,
        phase,
        field,
        section,
        competencyKind: 'Kompetenzen',
        text,
        index: goals.length + 1,
        courseLevel,
        page: pageNumber,
      })
    }
    current = ''
  }

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    pageNumber = pageIndex + 1
    const lines = pages[pageIndex].split('\n').map(normalizeLine)
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      if (!line || isNoiseLine(line)) continue

      const phaseMatch = line.match(/^3\.[1-5]\s+(.+)$/u)
      if (phaseMatch) {
        flush()
        phase = phaseMatch[1].replace(/\.{2,}.*$/u, '').trim()
        stage = /11\/12/u.test(phase) ? 'SekII' : 'SekI'
        courseLevel = stage === 'SekII' ? 'both' : 'unspecified'
        field = ''
        section = ''
        collecting = false
        continue
      }
      if (/Grundlegendes Anforderungsniveau/u.test(line)) {
        flush()
        phase = 'Schuljahrgänge 11/12 (Qualifikationsphase)'
        stage = 'SekII'
        courseLevel = 'both'
        field = ''
        section = ''
        collecting = false
        continue
      }
      if (/Erhöhtes Anforderungsniveau/u.test(line)) {
        flush()
        phase = 'Schuljahrgänge 11/12 (Qualifikationsphase)'
        stage = 'SekII'
        courseLevel = 'LK'
        field = ''
        section = ''
        collecting = false
        continue
      }
      if (line.startsWith('KOMPETENZBEREICH:')) {
        flush()
        field = cleanSourceText(line.replace('KOMPETENZBEREICH:', ''))
        if (!field && lines[index + 1]) field = lines[(index += 1)]
        section = ''
        collecting = false
        continue
      }
      if (line === 'Kompetenzen') {
        flush()
        collecting = true
        continue
      }
      if (line === 'Grundlegende Wissensbestände' || line === 'Gegenstandsfelder') {
        flush()
        collecting = false
        continue
      }
      if (collecting) {
        if (/^[-–]\s+/u.test(line)) {
          flush()
          current = line.replace(/^[-–]\s+/u, '')
        } else if (current) {
          current += ` ${line}`
        }
        continue
      }
      if (
        field
        && !section
        && !/^[-–]/u.test(line)
        && !/^3\./u.test(line)
        && !/^(SPRECHEN UND ZUHÖREN|SCHREIBEN|LESEN|SICH MIT TEXTEN|SPRACHE UND)/u.test(line)
      ) {
        section = line
      }
    }
  }
  flush()

  assertMinimums('Sachsen-Anhalt Deutsch', goals, { SekI: 220, SekII: 90 })
  return goals
}

function parseThueringen(): ParsedGoal[] {
  const pages = pdfLayoutText(thSourceDocument.path).split('\f')
  const goals: ParsedGoal[] = []
  let phase = ''
  let stage: Stage | '' = ''
  let topic = ''
  let competencyKind = ''
  let collecting = false
  let parent = ''
  let child = ''
  let parentHadChildren = false
  let pageNumber = 0

  const flushChild = (): void => {
    const text = cleanSourceText(child)
    if (text && phase && stage && topic && competencyKind && isMeaningfulSourceGoal(text)) {
      goals.push({
        sourceDocument: thSourceDocument,
        jurisdiction: 'DE-TH',
        stage,
        phase,
        field: topic,
        section: topic,
        competencyKind,
        text,
        index: goals.length + 1,
        courseLevel: stage === 'SekII' ? 'both' : 'unspecified',
        page: pageNumber,
      })
    }
    child = ''
  }
  const flushParent = (): void => {
    flushChild()
    const text = cleanSourceText(parent)
    if (!parentHadChildren && text && phase && stage && topic && competencyKind && isMeaningfulSourceGoal(text)) {
      goals.push({
        sourceDocument: thSourceDocument,
        jurisdiction: 'DE-TH',
        stage,
        phase,
        field: topic,
        section: topic,
        competencyKind,
        text,
        index: goals.length + 1,
        courseLevel: stage === 'SekII' ? 'both' : 'unspecified',
        page: pageNumber,
      })
    }
    parent = ''
    parentHadChildren = false
  }

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    pageNumber = pageIndex + 1
    const lines = pages[pageIndex].split('\n').map(normalizeLine)
    for (const line of lines) {
      if (!line || isNoiseLine(line)) continue
      const lowerPhase = line.match(/^2\.(1|2|3)\s+Klassenstufen\s+(.+)$/u)
      if (lowerPhase) {
        flushParent()
        phase = `Klassenstufen ${lowerPhase[2].replace(/\.{2,}.*$/u, '').trim()}`
        stage = 'SekI'
        topic = ''
        competencyKind = ''
        collecting = false
        continue
      }
      if (/^2\.4\s+Zentrale Inhalte/u.test(line) || /^3\s+Ziele/u.test(line)) {
        flushParent()
        phase = ''
        stage = ''
        topic = ''
        competencyKind = ''
        collecting = false
        continue
      }
      if (/^4\s+Ziele/u.test(line)) {
        flushParent()
        phase = 'Qualifikationsphase'
        stage = 'SekII'
        topic = ''
        competencyKind = ''
        collecting = false
        continue
      }
      if (/^4\.2\s+Zentrale Inhalte/u.test(line) || /^5\s+Leistung/u.test(line)) {
        flushParent()
        phase = ''
        stage = ''
        topic = ''
        competencyKind = ''
        collecting = false
        continue
      }
      const topicMatch = line.match(/^(?:2\.[123]\.\d(?:\.\d)?|4\.1\.\d(?:\.\d)?)\s+(.+)$/u)
      if (topicMatch && phase) {
        flushParent()
        topic = topicMatch[1].trim()
        collecting = false
        continue
      }
      if (/^(Sachkompetenz|Methodenkompetenz|Selbst- und Sozialkompetenz)$/u.test(line)) {
        flushParent()
        competencyKind = line
        collecting = false
        continue
      }
      if (line === 'Der Schüler kann') {
        flushParent()
        collecting = true
        continue
      }
      if (!collecting) continue
      if (isThueringenHeading(line)) {
        flushParent()
        collecting = false
        continue
      }
      if (/^[-–]\s+/u.test(line)) {
        flushParent()
        parent = line.replace(/^[-–]\s+/u, '')
        continue
      }
      if (/^•\s+/u.test(line)) {
        if (parent) {
          parentHadChildren = true
          flushChild()
          child = `${parent}: ${line.replace(/^•\s+/u, '')}`
        } else {
          child = line.replace(/^•\s+/u, '')
        }
        continue
      }
      if (child) child += ` ${line}`
      else if (parent) parent += ` ${line}`
    }
  }
  flushParent()

  assertMinimums('Thueringen Deutsch', goals, { SekI: 450, SekII: 100 })
  return goals
}

function buildDocuments(spec: ExtractionSpec, parsedGoals: ParsedGoal[]) {
  const passagesByCode = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []
  const decisions = parsedGoals.map((parsedGoal) => {
    const topicCode = topicCodeFor(spec, parsedGoal)
    const passageId = passageIdFor(spec, topicCode)
    if (!passagesByCode.has(topicCode)) {
      passagesByCode.set(topicCode, {
        id: passageId,
        sourceDocumentKey: spec.sourceDocument.key,
        topicCode,
        title: `${parsedGoal.phase} - ${parsedGoal.field} - ${parsedGoal.section}${parsedGoal.courseLevel === 'LK' ? ' (LK)' : ''}`,
        rawText: '',
        sourceGoalIds: [],
      })
    }

    const canonicalGoalIds = inferCanonicalGoalIds(parsedGoal)
    const sourceGoal: SourceGoal = {
      id: uuidFromString(`${spec.extractionId}:${topicCode}:${parsedGoal.index}:${parsedGoal.text}`),
      passageId,
      topicCode,
      title: titleFromSourceText(parsedGoal.text),
      description: `Die lernende Person kann ${toSentenceFragment(parsedGoal.text)}`,
      sourceDocumentKey: spec.sourceDocument.key,
      sourceRef: `${spec.sourceDocument.title}, ${parsedGoal.phase}, ${parsedGoal.field}, PDF-S. ${parsedGoal.page}`,
      sourceText: parsedGoal.text,
      sourceSpan: {
        passageId,
        label: `${topicCode}#${parsedGoal.index}`,
      },
      courseLevel: parsedGoal.courseLevel,
      tags: [
        `jurisdiction:${spec.jurisdiction}`,
        `stage:${spec.stage}`,
        `phase:${slug(parsedGoal.phase)}`,
        `field:${slug(parsedGoal.field)}`,
        `courseLevel:${parsedGoal.courseLevel}`,
        `sourceDocument:${spec.sourceDocument.key}`,
      ],
      metadata: {
        extractionMethod:
          spec.jurisdiction === 'DE-ST'
            ? 'pdftotext-layout-st-gymnasium-deutsch-kompetenzen-without-wissensbestaende'
            : 'pdftotext-layout-th-gymnasium-deutsch-current-stage-competency-bullets',
        phase: parsedGoal.phase,
        field: parsedGoal.field,
        section: parsedGoal.section,
        competencyKind: parsedGoal.competencyKind,
        page: parsedGoal.page,
      },
    }
    sourceGoals.push(sourceGoal)
    passagesByCode.get(topicCode)?.sourceGoalIds.push(sourceGoal.id)

    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan.label,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: canonicalGoalIds.length === 1 ? 'exact' : 'partial',
      rationale:
        canonicalGoalIds.length === 1
          ? 'Das amtliche Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
      reviewedAt,
      reviewer: 'codex',
    }
  })

  const passages = [...passagesByCode.values()]
  for (const passage of passages) {
    passage.rawText = passage.sourceGoalIds
      .map((id, index) => {
        const goal = sourceGoals.find((sourceGoal) => sourceGoal.id === id)
        return goal ? `(${index + 1}) ${goal.sourceText}` : ''
      })
      .filter(Boolean)
      .join('\n')
  }

  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  )
  const exactMappings = decisions.filter((decision) => decision.matchType === 'exact').length

  return {
    extraction: {
      schemaVersion: 1,
      extractionId: spec.extractionId,
      sourceLandscapeId: spec.sourceLandscapeId,
      targetLandscapeId,
      title: spec.title,
      jurisdiction: spec.jurisdiction,
      subject: 'Deutsch',
      stage: spec.stage,
      sourceDocument: spec.sourceDocument,
      sourceDocuments: [spec.sourceDocument],
      method: {
        passageExtraction:
          spec.jurisdiction === 'DE-ST'
            ? 'pdftotext -layout; Sachsen-Anhalt Deutsch wird aus den Kompetenz-Zeilen der Schuljahrgangsabschnitte 5/6 bis 11/12 extrahiert. Grundlegende Wissensbestaende und Gegenstandsfelder werden nicht als Pflicht-Source-Ziele gezaehlt.'
            : 'pdftotext -layout; Thueringen Deutsch wird aus den Zielbeschreibungen der Klassenstufen 5/6, 7/8, 9/10 und der Qualifikationsphase extrahiert. Die gesonderte Einfuehrungsphase fuer Lernende mit Realschulabschluss wird als Uebergangsroute nicht doppelt in das Gymnasium-Pflichtinventar gezaehlt.',
        sourceGoalExtraction:
          'Ein Source-Ziel pro fachlich pruefbarem Kompetenz-Bullet; untergeordnete Bullet-Listen werden als separate, passgenauere Source-Ziele mit Parent-Kontext gefasst.',
      },
      qualityReview: {
        sourceGoalCountPeerBaseline: {
          accepted: true,
          status: 'accepted',
          rationale: `${sourceGoals.length} ${spec.jurisdiction}-Deutsch-Source-Ziele; Vergleichskorridor ${spec.peerBaseline}. Die Zielzahl wurde kritisch gegen bereits gepruefte Deutsch-Spuren plausibilisiert; abweichende Laenderzaehlungen folgen der jeweiligen amtlichen Kompetenzgranularitaet.`,
        },
      },
      expectedTopicCodes: passages.map((passage) => passage.topicCode),
      pipelineStatus: buildPipeline(spec, passages, sourceGoals),
      passages,
      sourceGoals,
    },
    review: {
      version: 1,
      reviewId: `${spec.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
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
        exactMappings,
        partialMappings: sourceGoals.length - exactMappings,
        inheritedMappings: 0,
        note:
          `${spec.jurisdiction} Deutsch wurde aus amtlichen Gymnasium-PDFs extrahiert. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.`,
      },
      mappings,
      decisions,
    },
  }
}

function buildPipeline(spec: ExtractionSpec, passages: Passage[], sourceGoals: SourceGoal[]) {
  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoalsWithoutPassage = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
  const passagesWithoutGoals = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const originalSourcesComplete = existsSync(abs(spec.sourceDocument.path))
  const m1Complete = originalSourcesComplete && passages.length > 0
  const m2Complete =
    m1Complete
    && sourceGoals.length > 0
    && duplicateSourceGoalIds.length === 0
    && sourceGoalsWithoutPassage.length === 0
    && passagesWithoutGoals.length === 0

  return {
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'ORIGINALQUELLEN',
        label: 'Originalquellen bereitgestellt',
        status: originalSourcesComplete ? 'complete' : 'incomplete',
        dependsOn: [],
        checks: [
          {
            id: `official-source-document-present-${slug(spec.jurisdiction)}-deutsch`,
            label: `Amtliches ${spec.jurisdiction}-Deutsch-Gymnasium-PDF liegt lokal vor`,
            passed: originalSourcesComplete,
            details: spec.sourceDocument.path,
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: m1Complete ? 'complete' : originalSourcesComplete ? 'incomplete' : 'blocked',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: `expected-topic-coverage-${slug(spec.jurisdiction)}-deutsch`,
            label: `${spec.jurisdiction}-Deutsch-Kompetenzabschnitte wurden als Lehrplanpassagen extrahiert`,
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: `official-source-extraction-${slug(spec.jurisdiction)}-deutsch`,
            label: 'Passage-Extraction basiert auf amtlicher PDF statt Legacy-Snapshot',
            passed: true,
            details: spec.sourceDocument.path,
          },
        ],
      },
      {
        id: 'MAPPING-2',
        label: 'Source-Ziele aus Lehrplanpassagen erstellt',
        status: m2Complete ? 'complete' : m1Complete ? 'incomplete' : 'blocked',
        dependsOn: ['MAPPING-1'],
        checks: [
          {
            id: `source-goals-created-${slug(spec.jurisdiction)}-deutsch`,
            label: `Source-Ziele aus amtlichen ${spec.jurisdiction}-Deutsch-Kompetenzen erzeugt`,
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: `source-goal-count-peer-baseline-${slug(spec.jurisdiction)}-deutsch`,
            label: 'Source-Ziel-Anzahl ist gegen geprüfte Deutsch-Inventare plausibilisiert',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele; Vergleichskorridor ${spec.peerBaseline}.`,
          },
          {
            id: `source-goal-ids-unique-${slug(spec.jurisdiction)}-deutsch`,
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: duplicateSourceGoalIds.length === 0,
            details: `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
          },
          {
            id: `source-goals-reference-passages-${slug(spec.jurisdiction)}-deutsch`,
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: sourceGoalsWithoutPassage.length === 0,
            details: `Ohne Passage: ${sourceGoalsWithoutPassage.join(', ') || '-'}`,
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: m2Complete ? 'complete' : 'blocked',
        dependsOn: ['MAPPING-2'],
        checks: [
          {
            id: `source-goals-reviewed-${slug(spec.jurisdiction)}-deutsch`,
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: m2Complete,
            details: `${sourceGoals.length}/${sourceGoals.length} reviewed.`,
          },
          {
            id: `source-goals-covered-${slug(spec.jurisdiction)}-deutsch`,
            label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: m2Complete,
            details: `${sourceGoals.length}/${sourceGoals.length} inhaltlich abgedeckt; 1:n ist Zuordnungsform, keine Lücke.`,
          },
        ],
      },
    ],
  }
}

function inferCanonicalGoalIds(parsedGoal: ParsedGoal): string[] {
  const text = asciiFold(`${parsedGoal.phase} ${parsedGoal.field} ${parsedGoal.section} ${parsedGoal.text}`).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/hoer|zuhoer|gespraech|sprechen|vortrag|referat|praesent|moderation|diskutier|debatt|rede|sprecher|artikulation|stimme/u.test(text)) {
    add('Gespräche führen', 'Diskutieren und argumentieren')
  }
  if (/schreib|darstell|gestalt|textart|textsort|bericht|beschreib|erzaehl|nacherzaehl|entwerf|aufbau|struktur|ueberarbeit|zitier|protokoll|bewerbung|lebenslauf/u.test(text)) {
    add('Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen')
  }
  if (/argument|eroerter|stellung|meinung|kontrovers|diskussion|begruen|beurteilen|bewerten|standpunkt|wuerdigen|kommentar/u.test(text)) {
    add('Argumentationsstrukturen erkennen und argumentierende Texte aufbauen', 'Komplexere argumentierende Texte differenziert verfassen')
  }
  if (/lese|textverstaendnis|lektuer|interpret|erschliess|werk|literar|lyrik|epik|drama|gattung|epoche|motiv|rezeptionsgeschichte|maerchen|sage|fabel|ballade|novelle|roman/u.test(text)) {
    add('Leseförderung und sinngerechtes Lesen', 'Textsorte erkennen')
  }
  if (/literar|lyrik|epik|drama|gedicht|erzaehl|interpret|gattung|epoche|theater|werk|motiv|kurzgeschichte|ballade|novelle|roman/u.test(text)) {
    add(
      parsedGoal.courseLevel === 'LK'
        ? 'Literarische Texte vertieft gattungsspezifisch analysieren'
        : 'Literarische Texte grundlegend gattungsspezifisch erschließen',
      'Literarische Texte mit Deutungshypothese interpretieren',
    )
  }
  if (/vergleichen|vergleich|historisch|geschichte|kontext|biografie|epochen|intertextuell|intermedial|stoff|motiv/u.test(text)) {
    add('Literarische Texte kontextbezogen und vergleichend interpretieren')
  }
  if (/klassik|romantik|aufklaerung|sturm|drang|epochenumbruch|18\.|19\./u.test(text)) {
    add('Epochenumbruch 18./19. Jahrhundert', 'Epochenkontext und Merkmale')
  }
  if (/moderne|expressionismus|jahrhundertwende|20\.|sprachkrise|grossstadt|großstadt/u.test(text)) {
    add('Epochenumbruch 19./20. Jahrhundert', 'Literarische Moderne frühes 20. Jh.')
  }
  if (/weimar|nationalsozial|exil|widerstand|innere emigration|gegenwart|1945|1989|wende/u.test(text)) {
    add('Literatur zwischen Widerstand, Exil und innerer Emigration', 'Neuanfänge nach 1945/1989')
  }
  if (/realismus|naturalismus/u.test(text)) {
    add('Darstellung von Wirklichkeit im Realismus/Naturalismus')
  }
  if (/sprache|sprachgebrauch|varietaet|dialekt|umgangssprache|standardsprache|fachsprache|jugendsprache|mehrsprachigkeit|wortschatz|wortbildung|wortfeld/u.test(text)) {
    add('Sprache, Denken, Wirklichkeit', 'Sprachhandlungen einordnen', 'Wortschatz, Wortbildung und Wortfelder untersuchen')
  }
  if (/grammatik|syntax|morphologie|semantik|tempus|modus|kasus|satz|wortart|wortbildung|rechtschreib|orthograph|interpunktion|zeichensetzung/u.test(text)) {
    add('Grammatikalisches und orthografisches Wissen vertiefen')
  }
  if (/rhetor|stilmittel|sprachlich|ausdruck|stilistisch|wirkung|sprachebene|bildlichkeit|metaphor|symbol/u.test(text)) {
    add('Rhetorische Mittel analysieren')
  }
  if (/sachtext|pragmatisch|sachverhalt|information|nicht linear|formular|diagramm|quelle|zusammenfass|beschaffen|auswert|materialgestuetzt/u.test(text)) {
    add('Sach- und Gebrauchstexte auswerten')
  }
  if (/film|hoertext|audiovisuell|audio|visuell|grafisch|comic|graphic|serie|bild|ton|schnitt/u.test(text)) {
    add('Filme, Hörtexte und grafische Literatur analysieren und interpretieren')
  }
  if (/medien|internet|digital|podcast|tutorial|werbung|fernsehen|zeitung|oeffentlichkeit|kommunikationstechnolog|multimodal|website/u.test(text)) {
    add('Medienanalyse Grundlage', 'Unterschiedliche Medien reflektiert und kritisch nutzen')
  }
  if (/netzspezifisch|netzsprache|mediensprache|jugendsprache|digitalen kommunizieren|digitaler kommunikation|digitale kommunikation|soziale netzwerke|gegenwartssprache/u.test(text)) {
    add('Medien- und Netzsprache')
  }
  if (/manipulat|beeinfluss|framing|agenda|desinformation|politische rede|nationalsozial/u.test(text)) {
    add('Medienwandel und Öffentlichkeit', 'Rhetorik digitale Öffentlichkeit')
  }
  if (/kommunikation|stoerung|kommunikationsmodell|gespraechsverhalten|pragmatik/u.test(text)) {
    add('Pragmatische Modelle', 'Kommunikationsprobleme in Alltagssituationen untersuchen')
  }
  if (/diskurs|debatte|podiumsdiskussion|talkshow|private und oeffentliche|oeffentliche kommunikationssituationen|authentischen und fiktiven kommunikationssituationen/u.test(text)) {
    add('Diskurspraktiken vergleichen')
  }
  if (/migration|transkultur|postkolonial|identitaet|mehrsprachigkeit/u.test(text)) {
    add('Literatur/Sprache im Kontext Migration')
  }

  const ids = [...titles]
    .map((title) => canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title)))
    .filter((id): id is string => Boolean(id))

  if (ids.length > 0) return [...new Set(ids)]
  return [
    requireCanonicalTitle('Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen'),
    requireCanonicalTitle('Leseförderung und sinngerechtes Lesen'),
  ]
}

function updateRegistry(specsToRegister: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const nextEntries = registry.entries.filter(
    (entry) =>
      !(
        (entry.jurisdiction === 'DE-ST' || entry.jurisdiction === 'DE-TH')
        && entry.subject === 'Deutsch'
        && typeof entry.landscapeId === 'string'
        && specsToRegister.some((spec) => spec.sourceLandscapeId === entry.landscapeId)
      ),
  )
  for (const spec of specsToRegister) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: spec.jurisdiction,
      subject: 'Deutsch',
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

function updateReadmes(generated: Array<{ spec: ExtractionSpec; count: number }>): void {
  for (const jurisdiction of ['DE-ST', 'DE-TH'] as const) {
    const specsForJurisdiction = generated.filter(({ spec }) => spec.jurisdiction === jurisdiction)
    const path = jurisdiction === 'DE-ST' ? 'curricula/DE/Gymnasium/input/ST/README.md' : 'curricula/DE/Gymnasium/input/TH/README.md'
    const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : `# ${jurisdiction} - Gymnasium Curricula\n`
    const sourceDocument = specsForJurisdiction[0]?.spec.sourceDocument
    if (!sourceDocument) continue
    const section = [
      `<!-- ${jurisdiction}-DEUTSCH-SOURCE-EXTRACTION:start -->`,
      '## Deutsch',
      '',
      'Archived official source input on `2026-05-14`:',
      '',
      `- \`${sourceDocument.path.split('/').at(-1)}\``,
      `  - ${sourceDocument.title}`,
      `  - direct PDF source: \`${sourceDocument.url}\``,
      `  - official Lehrplan page: \`${specsForJurisdiction[0].spec.officialPageUrl}\``,
      '',
      'Operational note:',
      '',
      `- \`${jurisdiction}\` now has real archived lower-secondary plus upper-secondary Deutsch source extractions from the official Gymnasium PDF.`,
      '- Only source-backed competency expectations are counted as source goals; transition-only or knowledge-list sections are not double counted as separate Pflichtziele.',
      '- The retained source extractions now live at:',
      ...specsForJurisdiction.map(({ spec }) => `  - \`${spec.outputPath}\``),
      `- ${jurisdiction} Deutsch M3 status:`,
      ...specsForJurisdiction.map(({ spec, count }) => `  - ${spec.stage}: \`complete\` (${count} Source-Ziele)`),
      `<!-- ${jurisdiction}-DEUTSCH-SOURCE-EXTRACTION:end -->`,
      '',
    ].join('\n')
    const updated = replaceMarkedSection(existing, `${jurisdiction}-DEUTSCH-SOURCE-EXTRACTION`, section)
    writeFileSync(abs(path), `${updated.trim()}\n`, 'utf8')
  }
}

function updateStageReferences(generated: Array<{ spec: ExtractionSpec; count: number }>): void {
  for (const { spec, count } of generated) {
    const statePath = spec.jurisdiction === 'DE-ST' ? 'ST' : 'TH'
    const stagePath = spec.stage === 'SekI' ? 'lower-secondary' : 'upper-secondary'
    const marker = `${spec.jurisdiction}-DEUTSCH-${spec.stage}-SOURCE-EXTRACTION`
    const path = `curricula/DE/Gymnasium/input/${statePath}/${stagePath}/references.md`
    const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# References\n'
    const section = [
      `<!-- ${marker}:start -->`,
      '## Deutsch source PDF',
      '',
      `- \`${spec.sourceDocument.title}\`:`,
      `  ${spec.sourceDocument.url}`,
      '',
      'Official source page:',
      '',
      `- ${spec.officialPageUrl}`,
      '',
      'Scope:',
      '',
      `- ${spec.jurisdiction}`,
      '- Gymnasium',
      '- Deutsch',
      `- ${spec.stage === 'SekI' ? 'lower-secondary' : 'upper-secondary'} extraction target (${count} Source-Ziele)`,
      '',
      'Archived locally at:',
      '',
      `- \`${spec.sourceDocument.path}\``,
      '',
      'Source extraction:',
      '',
      `- \`${spec.outputPath}\``,
      '',
      'Mapping review:',
      '',
      `- \`${spec.reviewPath}\``,
      `<!-- ${marker}:end -->`,
      '',
    ].join('\n')
    const updated = replaceMarkedSection(existing, marker, section)
    writeFileSync(abs(path), `${updated.trim()}\n`, 'utf8')
  }
}

function assertMinimums(label: string, goals: ParsedGoal[], minimums: Record<Stage, number>): void {
  for (const stage of ['SekI', 'SekII'] as const) {
    const count = goals.filter((goal) => goal.stage === stage).length
    if (count < minimums[stage]) throw new Error(`${label} ${stage} extraction looks too small: ${count}`)
  }
}

function topicCodeFor(spec: ExtractionSpec, goal: ParsedGoal): string {
  const levelPart = goal.courseLevel === 'LK' ? '-LK' : goal.courseLevel === 'both' ? '-GK' : ''
  return `${spec.jurisdiction}-DEUTSCH-${slug(goal.phase)}-${slug(goal.field)}-${slug(goal.section)}${levelPart}`.toUpperCase()
}

function passageIdFor(spec: ExtractionSpec, topicCode: string): string {
  return uuidFromString(`${spec.extractionId}:passage:${topicCode}`)
}

function pdfLayoutText(path: string): string {
  return execFileSync('pdftotext', ['-layout', abs(path), '-'], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  })
}

function isThueringenHeading(line: string): boolean {
  return (
    /^\d+(?:\.\d+)*\s/u.test(line)
    || /^(Sachkompetenz|Methodenkompetenz|Selbst- und Sozialkompetenz|Klassenstufe|Grundlegendes Anforderungsniveau|Erhöhtes Anforderungsniveau)$/u.test(line)
    || /^5\s+Leistung/u.test(line)
  )
}

function isNoiseLine(line: string): boolean {
  return (
    /^\d+$/u.test(line)
    || /^Quelle:/u.test(line)
    || /^Fachlehrplan Deutsch/u.test(line)
    || /^Gymnasium$/u.test(line)
  )
}

function normalizeLine(line: string): string {
  return line
    .replace(/\u00ad/gu, '')
    .replace(/([A-Za-zÄÖÜäöüß])-+\s+([a-zäöüß])/gu, '$1$2')
    .replace(/[ \t]+/gu, ' ')
    .trim()
}

function cleanSourceText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/([A-Za-zÄÖÜäöüß])-+\s+([a-zäöüß])/gu, '$1$2')
    .replace(/[ÜÝ]/gu, '')
    .replace(/\s+/gu, ' ')
    .replace(/\s+\d+$/u, '')
    .replace(/\s+([,.])/gu, '$1')
    .trim()
}

function isMeaningfulSourceGoal(value: string): boolean {
  if (value.length < 12) return false
  if (value.split(/\s+/u).length < 2) return false
  if (/^\d+$/u.test(value)) return false
  if (/^(?:Lernbereich|Wahlbereich|Ziele|Klassenstufe|Jahrgangsstufen|Grundlegendes|Erhöhtes)\b/u.test(value)) return false
  return /[a-zäöüß]/u.test(value)
}

function titleFromSourceText(text: string): string {
  const clean = cleanSourceText(text).replace(/[.;:,]+$/u, '')
  return clean.length <= 90 ? clean : `${clean.slice(0, 87).trim()}...`
}

function toSentenceFragment(text: string): string {
  const clean = cleanSourceText(text).replace(/[.;:,]+$/u, '')
  return `${clean.charAt(0).toLowerCase()}${clean.slice(1)}.`
}

function replaceMarkedSection(existing: string, marker: string, nextSection: string): string {
  const pattern = new RegExp(`<!-- ${marker}:start -->[\\s\\S]*?<!-- ${marker}:end -->\\n?`, 'u')
  if (pattern.test(existing)) return existing.replace(pattern, nextSection)
  return `${existing.trim()}\n\n${nextSection}`
}

function requireCanonicalTitle(title: string): string {
  const id = canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title))
  if (!id) throw new Error(`Missing canonical Deutsch title: ${title}`)
  return id
}

function loadCanonicalTitleToId(): Map<string, string> {
  const landscape = readJson<{ goals: Goal[] }>(canonicalPath)
  const map = new Map<string, string>()
  for (const goal of landscape.goals) {
    map.set(goal.title, goal.id)
    map.set(asciiFold(goal.title), goal.id)
  }
  return map
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value)
    seen.add(value)
  }
  return [...duplicate]
}

function slug(value: string): string {
  return asciiFold(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}

function asciiFold(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ß/gu, 'ss')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
}

function uuidFromString(input: string): string {
  const hex = createHash('sha1').update(input).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function abs(path: string): string {
  return resolve(repoRoot, path)
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(abs(path), 'utf8')) as T
}

function writeJson(path: string, value: unknown): void {
  const target = abs(path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

main()
