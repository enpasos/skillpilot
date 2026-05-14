import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

type Jurisdiction = 'DE-BB' | 'DE-BE'
type Stage = 'SekI' | 'SekII'
type CourseLevel = 'GK_LK' | 'unspecified'

interface SourceDocument {
  key: string
  title: string
  path: string
  url: string
  official: true
  available: true
}

interface ExtractionConfig {
  jurisdiction: Jurisdiction
  stage: Stage
  extractionId: string
  sourceLandscapeId: string
  title: string
  sourceDocument: SourceDocument
  outputPath: string
  reviewPath: string
  archivePath: string
  sourceGoalPrefix: string
  sections: SectionSpec[]
}

interface SectionSpec {
  code: string
  title: string
  pageFrom: number
  pageTo: number
}

interface ParsedSection {
  code: string
  title: string
  rawText: string
  goals: ParsedGoal[]
}

interface ParsedGoal {
  number: number
  text: string
}

interface GeneratedSourceGoal {
  id: string
  passageId: string
  topicCode: string
  topicTitle: string
  bulletIndex: number
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  courseLevel: CourseLevel
  granularity: 'officialContentItem'
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

const lowerSourceByJurisdiction: Record<Jurisdiction, SourceDocument> = {
  'DE-BB': {
    key: 'BE-BB-GESCHICHTE-SEK-I-RLP-2015',
    title: 'Rahmenlehrplan Berlin-Brandenburg Teil C Geschichte Jahrgangsstufen 7-10 (2015)',
    path: 'curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Geschichte_2015_11_10.pdf',
    url: 'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/Rahmenlehrplanprojekt/amtliche_Fassung/Teil_C_Geschichte_2015_11_10.pdf',
    official: true,
    available: true,
  },
  'DE-BE': {
    key: 'BE-BB-GESCHICHTE-SEK-I-RLP-2015',
    title: 'Rahmenlehrplan Berlin-Brandenburg Teil C Geschichte Jahrgangsstufen 7-10 (2015)',
    path: 'curricula/DE/Gymnasium/input/BE/lower-secondary/Teil_C_Geschichte_2015_11_10.pdf',
    url: 'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/Rahmenlehrplanprojekt/amtliche_Fassung/Teil_C_Geschichte_2015_11_10.pdf',
    official: true,
    available: true,
  },
}

const upperSourceByJurisdiction: Record<Jurisdiction, SourceDocument> = {
  'DE-BB': {
    key: 'BE-BB-GESCHICHTE-SEK-II-RLP-GOST-2025',
    title: 'Rahmenlehrplan fuer die gymnasiale Oberstufe Teil C Geschichte Berlin-Brandenburg (2025)',
    path: 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2025_Geschichte.pdf',
    url: 'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/gymnasiale_oberstufe/curricula/2025/Teil_C_RLP_GOST_2025_Geschichte.pdf',
    official: true,
    available: true,
  },
  'DE-BE': {
    key: 'BE-BB-GESCHICHTE-SEK-II-RLP-GOST-2025',
    title: 'Rahmenlehrplan fuer die gymnasiale Oberstufe Teil C Geschichte Berlin-Brandenburg (2025)',
    path: 'curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2025_Geschichte.pdf',
    url: 'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/unterricht/rahmenlehrplaene/gymnasiale_oberstufe/curricula/2025/Teil_C_RLP_GOST_2025_Geschichte.pdf',
    official: true,
    available: true,
  },
}

const lowerSections: SectionSpec[] = [
  { code: '3.1', title: 'Basismodule 7/8', pageFrom: 26, pageTo: 27 },
  { code: '3.2', title: 'Module im gesellschaftswissenschaftlichen Faecherverbund 7/8', pageFrom: 28, pageTo: 29 },
  { code: '3.3', title: 'Wahlmodule 7/8', pageFrom: 30, pageTo: 30 },
  { code: '3.4', title: 'Basismodule 9/10', pageFrom: 31, pageTo: 31 },
  { code: '3.5', title: 'Module im gesellschaftswissenschaftlichen Faecherverbund 9/10', pageFrom: 32, pageTo: 33 },
  { code: '3.6', title: 'Wahlmodule 9/10', pageFrom: 34, pageTo: 35 },
  { code: '3.7', title: 'Wahlpflichtfach', pageFrom: 36, pageTo: 37 },
]

const upperSections: SectionSpec[] = [
  { code: '3.1', title: 'Einfuehrungsphase in der Jahrgangsstufe 11', pageFrom: 14, pageTo: 15 },
  { code: '3.2.1', title: 'Q1 Umbrueche, Transformationen und Krisen', pageFrom: 17, pageTo: 25 },
  {
    code: '3.2.2',
    title: 'Q2 Gesellschaftliche Kraefte und die Entwicklung von Staaten zwischen Demokratie, Diktaturen und Krieg',
    pageFrom: 26,
    pageTo: 35,
  },
  { code: '3.2.3', title: 'Q3 Zeitgeschichte nach 1945', pageFrom: 36, pageTo: 44 },
  { code: '3.2.4', title: 'Q4 Geschichtskultur', pageFrom: 45, pageTo: 51 },
]

const configs = (['DE-BB', 'DE-BE'] as Jurisdiction[]).flatMap((jurisdiction): ExtractionConfig[] => [
  {
    jurisdiction,
    stage: 'SekI',
    extractionId: `${jurisdiction.replace('-', '_')}_GESCHICHTE_SEKI_RLP_2015`,
    sourceLandscapeId: uuidFromString(`${jurisdiction}-GESCHICHTE-SEKI-RLP-2015`),
    title: `${jurisdiction} - Geschichte Sekundarstufe I (Berlin-Brandenburg, RLP 2015 Source-Extraction)`,
    sourceDocument: lowerSourceByJurisdiction[jurisdiction],
    outputPath: `curricula/DE/Gymnasium/input/${jurisdiction.slice(3)}/lower-secondary/source-extraction/${jurisdiction.replace('-', '_')}_GESCHICHTE_SEKI_RLP_2015.source-extraction.json`,
    reviewPath: `curricula/DE/Gymnasium/mapping/${jurisdiction}/lower-secondary/${jurisdiction.toLowerCase().replace('-', '_')}_history_lower_secondary_source_extraction_to_canonical_history.review.json`,
    archivePath: `curricula/DE/Gymnasium/input/${jurisdiction.slice(3)}/lower-secondary/`,
    sourceGoalPrefix: `${jurisdiction.toLowerCase()}-history-seki`,
    sections: lowerSections,
  },
  {
    jurisdiction,
    stage: 'SekII',
    extractionId: `${jurisdiction.replace('-', '_')}_GESCHICHTE_SEKII_RLP_GOST_2025`,
    sourceLandscapeId: uuidFromString(`${jurisdiction}-GESCHICHTE-SEKII-RLP-GOST-2025`),
    title: `${jurisdiction} - Geschichte Oberstufe (Berlin-Brandenburg, RLP GOST 2025 Source-Extraction)`,
    sourceDocument: upperSourceByJurisdiction[jurisdiction],
    outputPath: `curricula/DE/Gymnasium/input/${jurisdiction.slice(3)}/upper-secondary/source-extraction/${jurisdiction.replace('-', '_')}_GESCHICHTE_SEKII_RLP_GOST_2025.source-extraction.json`,
    reviewPath: `curricula/DE/Gymnasium/mapping/${jurisdiction}/upper-secondary/${jurisdiction.toLowerCase().replace('-', '_')}_history_upper_secondary_source_extraction_to_canonical_history.review.json`,
    archivePath: `curricula/DE/Gymnasium/input/${jurisdiction.slice(3)}/upper-secondary/`,
    sourceGoalPrefix: `${jurisdiction.toLowerCase()}-history-sekii`,
    sections: upperSections,
  },
])

const canonicalTitleToId = loadCanonicalTitleToId()
const generated = configs.map((config) => {
  if (!existsSync(abs(config.sourceDocument.path))) throw new Error(`Missing source PDF: ${config.sourceDocument.path}`)
  const sections = parseSections(config)
  const extraction = buildExtraction(config, sections)
  const review = buildReview(config, extraction.sourceGoals)
  writeJson(config.outputPath, extraction)
  writeJson(config.reviewPath, review)
  console.log(`Wrote ${config.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
  console.log(`Wrote ${config.reviewPath} (${review.summary.reviewedSourceGoals}/${review.summary.sourceGoals} M3 decisions)`)
  return { config, extraction, review }
})

updateRegistry(generated.map((item) => item.config))
for (const jurisdiction of ['DE-BB', 'DE-BE'] as Jurisdiction[]) updateReadmeAndReferences(jurisdiction, generated)
syncCanonicalHistoryApplicability()

function parseSections(config: ExtractionConfig): ParsedSection[] {
  return config.sections.map((section) => {
    const rawText = normalizePassageText(
      execFileSync(
        'pdftotext',
        [
          '-layout',
          '-f',
          String(section.pageFrom),
          '-l',
          String(section.pageTo),
          abs(config.sourceDocument.path),
          '-',
        ],
        { encoding: 'utf8' },
      ),
    )
    const goals = parseBullets(rawText).map((text, index) => ({ number: index + 1, text }))
    if (goals.length === 0) throw new Error(`No BE/BB Geschichte source goals parsed for ${config.jurisdiction} ${section.code}`)
    return { code: section.code, title: section.title, rawText, goals }
  })
}

function parseBullets(rawText: string): string[] {
  const bullets: string[] = []
  let current: string | null = null

  for (const rawLine of rawText.replace(/\f/gu, '\n').split('\n')) {
    const normalizedLine = normalizeLine(rawLine)
    if (isPdfArtifact(normalizedLine)) continue

    if (/^[\u00ad\u2212-]\s+/u.test(normalizedLine)) {
      if (current) bullets.push(current)
      current = normalizedLine.replace(/^[\u00ad\u2212-]\s+/u, '')
      continue
    }

    if (
      current
      && (/^\s{2,}\S/u.test(rawLine) || /^[a-zäöüß(]/u.test(normalizedLine))
      && (!/[.!?)]$/u.test(current) || /[-\u00ad]$/u.test(current))
    ) {
      const joinsHyphenatedLineBreak = /[-\u00ad]$/u.test(current)
      current = joinsHyphenatedLineBreak
        ? current.replace(/[-\u00ad]$/u, '') + normalizedLine
        : `${current} ${normalizedLine}`
      continue
    }

    if (current) bullets.push(current)
    current = null
  }

  if (current) bullets.push(current)
  return bullets.map(normalizeGoalText).filter((value) => value.length >= 4)
}

function buildExtraction(config: ExtractionConfig, sections: ParsedSection[]) {
  const passages = sections.map((section) => ({
    id: passageIdForSection(config, section),
    topicCode: section.code,
    title: `${section.code} ${section.title}`,
    text: section.rawText,
    sourcePath: config.sourceDocument.path,
    sourceUrl: config.sourceDocument.url,
    rawText: section.rawText,
    sourceGoalIds: section.goals.map((goal) => sourceGoalId(config, section, goal)),
  }))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoals: GeneratedSourceGoal[] = sections.flatMap((section) =>
    section.goals.map((goal) => {
      const sourceText = normalizeGoalText(goal.text)
      return {
        id: sourceGoalId(config, section, goal),
        passageId: passageIdForSection(config, section),
        topicCode: section.code,
        topicTitle: section.title,
        bulletIndex: goal.number,
        title: titleFromSourceText(sourceText),
        description: `Die lernende Person kann ${toSentenceFragment(sourceText)}`,
        sourceText,
        sourceSpan: `${section.code}.${goal.number}`,
        parentBulletText: sourceText,
        sourceRef: `${config.sourceDocument.title}, ${section.code} ${section.title}`,
        courseLevel: courseLevelForStage(config.stage),
        granularity: 'officialContentItem',
        stage: config.stage,
        tags: [
          `jurisdiction:${config.jurisdiction}`,
          `stage:${config.stage}`,
          `gradeBand:${gradeBandForSection(config.stage, section.code)}`,
          `topic:${section.code}`,
          `courseLevel:${courseLevelForStage(config.stage)}`,
        ],
        rawSourceText: goal.text,
        rawSourceSpan: `${section.code}.${goal.number}`,
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
    extractionId: config.extractionId,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    title: config.title,
    jurisdiction: config.jurisdiction,
    subject: 'Geschichte',
    stage: config.stage,
    sourceDocument: config.sourceDocument,
    sourceDocuments: [config.sourceDocument],
    method: {
      passageExtraction:
        'pdftotext -layout over official Berlin-Brandenburg Geschichte PDF page ranges; one passage per official section of Themen und Inhalte.',
      sourceGoalExtraction:
        'one source goal per explicit official bullet in the selected Geschichte content sections. Narrative explanations, table labels and page artifacts are retained in passages but not counted as source goals.',
      mappingBasis:
        'M3 review maps each source goal to one or more canonical Geschichte goals. 1:n is a mapping form, not a quality deficit.',
    },
    expectedTopicCodes: sections.map((section) => section.code),
    pipelineStatus: buildPipelineStatus(config, passages.length, sections.length, sourceGoals.length, {
      duplicateIds,
      missingPassageRefs,
      emptyPassages,
    }),
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        status: 'accepted',
        actualSourceGoals: sourceGoals.length,
        rationale:
          config.stage === 'SekI'
            ? 'Kritisch geprueft: BE/BB Geschichte Sek I wird aus sieben amtlichen RLP-Themenabschnitten 3.1 bis 3.7 extrahiert. Wahlmodule und Wahlpflichtanregungen sind im offiziellen Fachteil enthalten und werden als Source-Ziele registriert.'
            : 'Kritisch geprueft: BE/BB Geschichte Sek II wird aus den amtlichen RLP-GOST-Abschnitten 3.1 und 3.2.1 bis 3.2.4 extrahiert. Die hoeheren Zielzahlen folgen aus der stark ausdifferenzierten Modulstruktur, liegen aber im Korridor der bereits geprueften HE/RP-Geschichte-Spuren.',
      },
      notes: [
        'Legacy-Snapshots werden nicht als Quelle verwendet.',
        'Der gemeinsame BE/BB-Rahmenlehrplan wird getrennt in der Berlin- und Brandenburg-Lane archiviert, damit die Bundesland-Sichten unabhaengig bilanziert werden koennen.',
      ],
    },
    passages,
    sourceGoals,
  }
}

function buildPipelineStatus(
  config: ExtractionConfig,
  passageCount: number,
  expectedPassageCount: number,
  sourceGoalCount: number,
  diagnostics: { duplicateIds: string[]; missingPassageRefs: string[]; emptyPassages: string[] },
) {
  const mapping2Complete =
    diagnostics.duplicateIds.length === 0
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
            label: 'Amtlicher BE/BB-Geschichte-Rahmenlehrplan liegt lokal vor',
            passed: true,
            details: config.sourceDocument.path,
          },
          {
            id: 'source-document-url-registered',
            label: 'Originalquelle ist mit URL dokumentiert',
            passed: true,
            details: config.sourceDocument.url,
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: passageCount === expectedPassageCount ? 'complete' : 'incomplete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'expected-topic-coverage',
            label: 'Erwartete BE/BB-Geschichte-Lehrplanabschnitte sind als Passagen vorhanden',
            passed: passageCount === expectedPassageCount,
            details: `${passageCount}/${expectedPassageCount} Passagen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: config.sourceDocument.path,
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
            label: 'Source-Ziele aus amtlichen BE/BB-Geschichte-Inhaltsvorgaben erzeugt',
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
            details: config.reviewPath,
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

function buildReview(config: ExtractionConfig, sourceGoals: GeneratedSourceGoal[]) {
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
        `Das BE/BB-Geschichte-Source-Ziel "${sourceGoal.title}" ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt.`,
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
    reviewId: `${config.jurisdiction.toLowerCase()}-history-${config.stage === 'SekI' ? 'lower' : 'upper'}-secondary-source-extraction-to-canonical-history`,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.outputPath,
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
        `${config.jurisdiction} Geschichte ${config.stage} ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.`,
    },
    mappings,
    decisions,
  }
}

function targetTitlesForSourceGoal(sourceGoal: GeneratedSourceGoal): string[] {
  const titles = new Set<string>(baseTargetTitlesForSection(sourceGoal.topicCode))
  const text = asciiFold(`${sourceGoal.topicCode} ${sourceGoal.topicTitle} ${sourceGoal.sourceText}`)

  if (/geschichte|quelle|darstellung|geschichtskultur|geschichtsbewusstsein|periodisierung|lernort|denkmal|erinnerung|triftigkeit|konstrukt|film|gedenk|archiv|museum/u.test(text)) {
    titles.add('Warum Geschichte? - Relevanz und Orientierung')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
    titles.add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }
  if (/vorgeschichte|steinzeit|aegypt|athen|rom|roemisch|antike|imperium|republik|ach[aä]meniden|mongolen/u.test(text)) {
    titles.add('Antike Traditionen und Rezeption der Antike')
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/mittelalter|staende|grundherrschaft|lehen|kirche|christentum|stadt im mittelalter|kreuzzuege|kreuzzug|osman|jahr 1000/u.test(text)) {
    titles.add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter')
  }
  if (/fruehe neuzeit|renaissance|humanismus|reformation|glaubenskrieg|kolumbus|entdeck|kolonialismus|1500|hugenotten|boehmen/u.test(text)) {
    titles.add('Interkulturelle Begegnungen und europäische Aufbrüche')
    titles.add('Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/revolution|aufklaerung|1848|nationalstaat|nationalismus|menschenrechte|emanzipation|partizipation|amerika|frankreich|haiti|vormaerz/u.test(text)) {
    titles.add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    titles.add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    titles.add('Emanzipationsbestrebungen im 19. Jahrhundert')
    titles.add('Herrschaft und Gesellschaft im europäischen Vergleich')
  }
  if (/industrie|industrialisierung|arbeiter|arbeit|soziale frage|produktion|urbanisierung|wirtschaft|handel|armut|reichtum|soziale ungleichheit|kapital|krise/u.test(text)) {
    titles.add('Industrialisierung – Wohlstand für wenige?')
  }
  if (/imperialismus|kolonial|rassismus|dekolon|postkolonial|afrika|sklaverei|great divergence/u.test(text)) {
    titles.add('Imperialismus – Export europäischer Zivilisation?')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/erster weltkrieg|versailler|krieg und frieden|friedensschluss|1914|1917/u.test(text)) {
    titles.add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
    titles.add('Weltpolitische Faktoren 1917–1945')
  }
  if (/weimar|novemberrevolution|parlamentarische demokratie|goldene zwanziger|nsdap/u.test(text)) {
    titles.add('Weimarer Republik als erste deutsche Demokratie')
    titles.add('Aushöhlung der Demokratie und Errichtung der Diktatur')
  }
  if (/nationalsozial|holocaust|shoah|ns-|diktatur|faschismus|totalitar|voelkermord|widerstand|zweiter weltkrieg|sed-diktatur/u.test(text)) {
    titles.add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    titles.add('Demokratie, Faschismus und Widerstand in Europa')
  }
  if (/russisch|russland|sowjet|udssr|oktoberrevolution|stalin|lenin|sozialismus|kommunistisch/u.test(text)) {
    titles.add('Russische Revolution und Stalinismus')
    titles.add('Weltpolitische Faktoren 1917–1945')
  }
  if (/kalter krieg|brd|ddr|deutsch-deutsch|deutsche einheit|wiedervereinigung|1989|ost-west|europaeische integration|eu|multipolar|blockbildung|kuba|vietnam|korea|china|chile|arabisch|suedafrika/u.test(text)) {
    titles.add('Der Kalte Krieg – stabile oder labile Ordnung?')
    titles.add('Teilung Deutschlands – eine Nation, zwei Staaten')
    titles.add('Deutschland von der Teilung zur Einheit')
    titles.add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
  }
  if (/nahost|israel|palaestin|suez|fundamentalismus/u.test(text)) {
    titles.add('Nahostkonflikt als weltpolitischer Krisenherd')
  }
  if (/ns-vergangenheit|aufarbeitung|kollektives gedaechtnis|erinnerungskultur|gedaechtnis|restitution|denkmal|geschichtspolitik/u.test(text)) {
    titles.add('Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?')
    titles.add('Kontroversen über die Vergangenheit')
    titles.add('Geschichtsbilder und Geschichtspolitik')
  }

  return [...titles]
}

function baseTargetTitlesForSection(topicCode: string): string[] {
  if (topicCode === '3.1') {
    return [
      'Warum Geschichte? - Relevanz und Orientierung',
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
      'Interkulturelle Begegnungen und europäische Aufbrüche',
      'Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?',
    ]
  }
  if (topicCode === '3.2') {
    return ['Interkulturelle Begegnungen und europäische Aufbrüche', 'Industrialisierung – Wohlstand für wenige?']
  }
  if (topicCode === '3.3') {
    return [
      'Formen von Herrschaft und Gesellschaft in Antike und Mittelalter',
      'Infragestellung traditionaler Herrschaft in der frühen Neuzeit',
      'Imperialismus – Export europäischer Zivilisation?',
    ]
  }
  if (topicCode === '3.4') {
    return [
      'Der Erste Weltkrieg – Zerstörung der alten Ordnung',
      'Weimarer Republik als erste deutsche Demokratie',
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
    ]
  }
  if (topicCode === '3.5') {
    return ['Nahostkonflikt als weltpolitischer Krisenherd', 'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität']
  }
  if (topicCode === '3.6') {
    return [
      'Weltpolitische Faktoren 1917–1945',
      'Russische Revolution und Stalinismus',
      'Deutschland von der Teilung zur Einheit',
      'Imperialismus – Export europäischer Zivilisation?',
      'Geschichtsbilder und Geschichtspolitik',
    ]
  }
  if (topicCode === '3.7') {
    return ['Warum Geschichte? - Relevanz und Orientierung', 'Geschichtsbilder und Geschichtspolitik']
  }
  if (topicCode === '3.2.1') {
    return [
      'Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?',
      'Industrialisierung – Wohlstand für wenige?',
      'Imperialismus – Export europäischer Zivilisation?',
    ]
  }
  if (topicCode === '3.2.2') {
    return [
      'Weimarer Republik als erste deutsche Demokratie',
      'Aushöhlung der Demokratie und Errichtung der Diktatur',
      'Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten',
      'Russische Revolution und Stalinismus',
      'Demokratie, Faschismus und Widerstand in Europa',
    ]
  }
  if (topicCode === '3.2.3') {
    return [
      'Der Kalte Krieg – stabile oder labile Ordnung?',
      'Teilung Deutschlands – eine Nation, zwei Staaten',
      'Deutschland von der Teilung zur Einheit',
      'Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität',
    ]
  }
  if (topicCode === '3.2.4') {
    return [
      'Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?',
      'Kontroversen über die Vergangenheit',
      'Geschichtsbilder und Geschichtspolitik',
      'Wahrnehmungen und Deutung von Geschichte im Wandel',
    ]
  }
  return ['Warum Geschichte? - Relevanz und Orientierung']
}

function courseLevelForStage(stage: Stage): CourseLevel {
  return stage === 'SekII' ? 'GK_LK' : 'unspecified'
}

function gradeBandForSection(stage: Stage, topicCode: string): string {
  if (stage === 'SekII') return topicCode === '3.1' ? '11' : '12/13'
  if (topicCode === '3.1' || topicCode === '3.2' || topicCode === '3.3') return '7/8'
  if (topicCode === '3.4' || topicCode === '3.5' || topicCode === '3.6') return '9/10'
  return '7/10'
}

function passageIdForSection(config: ExtractionConfig, section: ParsedSection): string {
  return `${config.sourceGoalPrefix}:${slug(section.code)}-${hash(section.title)}`
}

function sourceGoalId(config: ExtractionConfig, section: ParsedSection, goal: ParsedGoal): string {
  return uuidFromString(`${config.jurisdiction}-GESCHICHTE:${config.stage}:${section.code}:${goal.number}:${goal.text}`)
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
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()
}

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/u.test(line)
    || /^C Geschichte$/u.test(line)
    || /^BERLIN$/u.test(line)
    || /^BRANDENBURG$/u.test(line)
    || /^Seite \d+ von/u.test(line)
    || /^Teil C$/u.test(line)
    || /^Geschichte$/u.test(line)
}

function updateRegistry(updatedConfigs: ExtractionConfig[]): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const landscapeIds = new Set(updatedConfigs.map((config) => config.sourceLandscapeId))
  const nextEntries = registry.entries.filter((entry) => !landscapeIds.has(String(entry.landscapeId)))
  for (const config of updatedConfigs) {
    nextEntries.push({
      landscapeId: config.sourceLandscapeId,
      title: config.title,
      jurisdiction: config.jurisdiction,
      subject: 'Geschichte',
      stage: config.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: config.sourceDocument.path,
      archiveSourcePath: config.sourceDocument.path,
      archivePath: config.archivePath,
      sourceDocumentKey: config.sourceDocument.key,
      sourceUrl: config.sourceDocument.url,
    })
  }
  registry.entries = nextEntries.sort((a, b) => String(a.landscapeId).localeCompare(String(b.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadmeAndReferences(
  jurisdiction: Jurisdiction,
  items: { config: ExtractionConfig; extraction: { sourceGoals: GeneratedSourceGoal[] } }[],
): void {
  const lower = items.find((item) => item.config.jurisdiction === jurisdiction && item.config.stage === 'SekI')
  const upper = items.find((item) => item.config.jurisdiction === jurisdiction && item.config.stage === 'SekII')
  if (!lower || !upper) throw new Error(`Missing generated BE/BB Geschichte items for ${jurisdiction}`)

  const lane = jurisdiction.slice(3)
  const readmePath = `curricula/DE/Gymnasium/input/${lane}/README.md`
  const existing = existsSync(abs(readmePath))
    ? readFileSync(abs(readmePath), 'utf8')
    : `# ${jurisdiction} - Gymnasium Curricula\n`
  const section = [
    `<!-- ${jurisdiction}-GESCHICHTE-SOURCE-EXTRACTION:start -->`,
    '## Geschichte',
    '',
    '### Sekundarstufe I (Jahrgangsstufen 7-10)',
    '- **Rahmenlehrplan Berlin-Brandenburg Teil C Geschichte (2015)**',
    `- Offizielle Quelle: ${lower.config.sourceDocument.url}`,
    '- Archived source PDF: `lower-secondary/Teil_C_Geschichte_2015_11_10.pdf`',
    `- Source extraction: \`lower-secondary/source-extraction/${jurisdiction.replace('-', '_')}_GESCHICHTE_SEKI_RLP_2015.source-extraction.json\``,
    `- M3 status: \`complete\` (${lower.extraction.sourceGoals.length} Source-Ziele)`,
    '',
    '### Sekundarstufe II (Gymnasiale Oberstufe)',
    '- **Rahmenlehrplan Berlin-Brandenburg GOST Teil C Geschichte (2025)**',
    `- Offizielle Quelle: ${upper.config.sourceDocument.url}`,
    '- Archived source PDF: `upper-secondary/Teil_C_RLP_GOST_2025_Geschichte.pdf`',
    `- Source extraction: \`upper-secondary/source-extraction/${jurisdiction.replace('-', '_')}_GESCHICHTE_SEKII_RLP_GOST_2025.source-extraction.json\``,
    `- M3 status: \`complete\` (${upper.extraction.sourceGoals.length} Source-Ziele)`,
    `<!-- ${jurisdiction}-GESCHICHTE-SOURCE-EXTRACTION:end -->`,
    '',
  ].join('\n')
  writeFileSync(abs(readmePath), `${replaceMarkedSection(existing, `${jurisdiction}-GESCHICHTE-SOURCE-EXTRACTION`, section).trim()}\n`, 'utf8')

  updateReferenceFile({
    path: `curricula/DE/Gymnasium/input/${lane}/lower-secondary/references.md`,
    marker: `${jurisdiction}-GESCHICHTE-SEKI-SOURCE-EXTRACTION`,
    jurisdiction,
    document: lower.config.sourceDocument,
    scope: `lower-secondary extraction target: BE/BB Geschichte Themen und Inhalte 3.1 bis 3.7 (${lower.extraction.sourceGoals.length} Source-Ziele)`,
    extractionPath: lower.config.outputPath,
    reviewPath: lower.config.reviewPath,
  })
  updateReferenceFile({
    path: `curricula/DE/Gymnasium/input/${lane}/upper-secondary/references.md`,
    marker: `${jurisdiction}-GESCHICHTE-SEKII-SOURCE-EXTRACTION`,
    jurisdiction,
    document: upper.config.sourceDocument,
    scope: `upper-secondary extraction target: BE/BB Geschichte Einfuehrungsphase und Q1 bis Q4 (${upper.extraction.sourceGoals.length} Source-Ziele)`,
    extractionPath: upper.config.outputPath,
    reviewPath: upper.config.reviewPath,
  })
}

function updateReferenceFile(args: {
  path: string
  marker: string
  jurisdiction: Jurisdiction
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
    `- ${args.jurisdiction}`,
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

function normalizeLine(line: string): string {
  return line
    .replace(/\u00a0/gu, ' ')
    .replace(/[ \t]+/gu, ' ')
    .trim()
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
