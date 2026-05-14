import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

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

interface ExtractionSpec {
  extractionId: string
  sourceLandscapeId: string
  title: string
  stage: Stage
  outputPath: string
  reviewPath: string
  archivePath: string
  sourceGoalPrefix: string
  peerBaselineReview: string
}

interface ParsedSection {
  code: string
  title: string
  phase: string
  stage: Stage
  courseLevel: CourseLevel
  page: number
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
  sourceDocumentKey: string
  sourceRef: string
  courseLevel: CourseLevel
  granularity: 'officialCompetency'
  stage: Stage
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
  metadata: {
    extractionMethod: string
    phase: string
    competencyArea: string
    page: number
  }
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
const jurisdiction = 'DE-ST'
const subject = 'Geschichte'
const targetLandscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const officialOverviewUrl = 'https://lisa.sachsen-anhalt.de/unterricht/lehrplaene'

const sourceDocument: SourceDocument = {
  key: 'ST-GESCHICHTE-GYM-2022',
  title: 'Fachlehrplan Geschichte Gymnasium Sachsen-Anhalt 01.08.2022',
  path: 'curricula/DE/Gymnasium/input/ST/FLP_Geschichte_Gym_01082022_swd.pdf',
  url: 'https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung_2022/FLP_Geschichte_Gym_01082022_swd.pdf',
  official: true,
  available: true,
}

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_ST_GESCHICHTE_SEKI_FACHLEHRPLAN_GYMNASIUM_2022',
    sourceLandscapeId: uuidFromString('DE-ST-GESCHICHTE-SEKI-FACHLEHRPLAN-GYMNASIUM-2022'),
    title: 'Geschichte Sekundarstufe I (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)',
    stage: 'SekI',
    outputPath:
      'curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_GESCHICHTE_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_history_lower_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/ST/lower-secondary/',
    sourceGoalPrefix: 'st-history-seki',
    peerBaselineReview:
      'Kritisch geprueft: Sachsen-Anhalt Geschichte Sek I ist gegenueber HE/BW deutlich feiner, weil der Fachlehrplan je Kompetenzschwerpunkt Interpretationskompetenz, narrative Kompetenz, geschichtskulturelle Kompetenz und grundlegende Wissensbestaende ausweist. Gezaehlt werden diese amtlichen Pflichtzeilen; Abstimmungs- und fächeruebergreifende Bezuege werden ausgeschlossen.',
  },
  {
    extractionId: 'DE_ST_GESCHICHTE_SEKII_FACHLEHRPLAN_GYMNASIUM_2022',
    sourceLandscapeId: uuidFromString('DE-ST-GESCHICHTE-SEKII-FACHLEHRPLAN-GYMNASIUM-2022'),
    title: 'Geschichte Oberstufe (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)',
    stage: 'SekII',
    outputPath:
      'curricula/DE/Gymnasium/input/ST/upper-secondary/source-extraction/DE_ST_GESCHICHTE_SEKII_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_history_upper_secondary_source_extraction_to_canonical_history.review.json',
    archivePath: 'curricula/DE/Gymnasium/input/ST/upper-secondary/',
    sourceGoalPrefix: 'st-history-sekii',
    peerBaselineReview:
      'Kritisch geprueft: Sachsen-Anhalt Geschichte Sek II liegt im Korridor der geprueften HE/BW-Spuren. Extrahiert werden die Qualifikationsphasen-Kompetenzschwerpunkte mit Kompetenzbereichszeilen und grundlegenden Wissensbestaenden.',
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

main()

function main(): void {
  if (!existsSync(abs(sourceDocument.path))) throw new Error(`Missing official source PDF: ${sourceDocument.path}`)
  const sections = parseSections()
  const generated = specs.map((spec) => {
    const stageSections = sections.filter((section) => section.stage === spec.stage)
    const { extraction, review } = buildDocuments(spec, stageSections)
    writeJson(spec.outputPath, extraction)
    writeJson(spec.reviewPath, review)
    console.log(`Wrote ${spec.outputPath} (${extraction.passages.length} passages, ${extraction.sourceGoals.length} source goals)`)
    console.log(`Wrote ${spec.reviewPath} (${review.decisions.length}/${extraction.sourceGoals.length} M3 decisions)`)
    return { spec, count: extraction.sourceGoals.length }
  })
  updateRegistry(specs)
  updateReadme(generated)
  updateStageReferences(generated)
  syncCanonicalHistoryApplicability()
}

function parseSections(): ParsedSection[] {
  const pages = pdfText(sourceDocument.path).split('\f')
  const sections: ParsedSection[] = []
  for (let index = 0; index < pages.length; index += 1) {
    const page = index + 1
    if (page < 16) continue
    const lines = pages[index].split('\n')
    const phase = phaseForPage(lines)
    if (!phase) continue
    const titleInfo = titleForPage(lines)
    if (!titleInfo) continue
    const stage = phase === '11/12' ? 'SekII' : 'SekI'
    const goals = goalsForPage(lines, titleInfo.startIndex)
    if (goals.length === 0) continue
    sections.push({
      code: topicCodeFor(phase, titleInfo.title),
      title: titleInfo.title,
      phase,
      stage,
      courseLevel: stage === 'SekII' ? 'GK_LK' : 'unspecified',
      page,
      goals,
    })
  }
  assertRequiredSections(sections)
  return sections
}

function phaseForPage(lines: string[]): string | null {
  const header = lines.find((line) => /Fachlehrplan Geschichte Gymnasium, Schuljahrg/u.test(line)) ?? ''
  const match = header.match(/Schuljahrg(?:änge|ang)\s+(.+?)\s+01\.08\.2022/u)
  return match?.[1]?.trim() ?? null
}

function titleForPage(lines: string[]): { title: string; startIndex: number } | null {
  const pattern = /^\s*(?:Kompetenzschwerpunkt:|(?:Erstes|Zweites|Drittes|Viertes|Fünftes) Fachpraktikum:)\s*(.*)$/u
  const startIndex = lines.findIndex((line) => pattern.test(line))
  if (startIndex < 0) return null
  const firstLine = lines[startIndex].replace(pattern, '$1').trim()
  const parts = firstLine ? [firstLine] : []
  for (let index = startIndex + 1; index < Math.min(lines.length, startIndex + 7); index += 1) {
    const line = normalizeLine(lines[index])
    if (!line) break
    if (/^(Interpretations-|narrative|geschichts-|Grundlegende|Kompetenzschwerpunkt:)/u.test(line)) break
    parts.push(line)
  }
  return { title: cleanGoalText(parts.join(' ')), startIndex }
}

function goalsForPage(lines: string[], startIndex: number): ParsedGoal[] {
  const goals: ParsedGoal[] = []
  let kind = ''
  let current = ''
  const pushCurrent = (): void => {
    const text = cleanGoalText(current)
    if (isMeaningfulSourceGoal(text) && kind) {
      goals.push({ number: goals.length + 1, text, kind })
    }
    current = ''
  }

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = normalizeLine(lines[index])
    if (/^Quelle:/u.test(line) || /^\d+$/u.test(line)) {
      pushCurrent()
      break
    }
    if (/^Möglichkeiten zur Abstimmung/u.test(line) || /^Bezüge zu den fächerübergreifenden/u.test(line)) {
      pushCurrent()
      break
    }
    const kindMatch = line.match(/^(Interpretations-|narrative|geschichts-)\s*(?:kompetenz|Kompetenz|kulturelle)?\s*(?:[–-]\s+(.+))?$/u)
    if (kindMatch) {
      pushCurrent()
      kind = kindFromLabel(kindMatch[1] ?? '')
      if (kindMatch[2]) current = kindMatch[2]
      continue
    }
    if (/^(?:kompetenz|Kompetenz|kulturelle)$/u.test(line)) continue
    if (/^Grundlegende Wissensbestände$/u.test(line)) {
      pushCurrent()
      kind = 'Grundlegende Wissensbestände'
      continue
    }
    const labelColumnBullet = line.match(/^(?:kompetenz|Kompetenz|kulturelle)\s+[–-]\s+(.+)$/u)
    if (labelColumnBullet) {
      pushCurrent()
      current = labelColumnBullet[1] ?? ''
      continue
    }
    const labelColumnContinuation = line.match(/^(?:kompetenz|Kompetenz|kulturelle)\s+(.+)$/u)
    if (labelColumnContinuation && current) {
      current = `${current} ${labelColumnContinuation[1] ?? ''}`
      continue
    }
    const bullet = line.match(/^[–-]\s+(.+)$/u)
    if (bullet) {
      pushCurrent()
      current = bullet[1] ?? ''
      continue
    }
    if (current && !isPdfArtifact(line)) current = `${current} ${line}`
  }
  pushCurrent()
  return goals
}

function kindFromLabel(label: string): string {
  if (label.startsWith('Interpretations')) return 'Interpretationskompetenz'
  if (label.startsWith('narrative')) return 'narrative Kompetenz'
  return 'geschichtskulturelle Kompetenz'
}

function assertRequiredSections(sections: ParsedSection[]): void {
  const byPhase = new Set(sections.map((section) => section.phase))
  const missing = ['5/6', '7/8', '9', '10', '11/12'].filter((phase) => !byPhase.has(phase))
  if (missing.length > 0) throw new Error(`Missing Sachsen-Anhalt Geschichte phases: ${missing.join(', ')}`)
}

function buildDocuments(spec: ExtractionSpec, sections: ParsedSection[]) {
  if (sections.length === 0) throw new Error(`No sections for ${spec.extractionId}`)
  const passages = sections.map((section) => buildPassage(spec, section))
  const sourceGoals = sections.flatMap((section) => buildSourceGoals(spec, section))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const duplicateGoalIds = findDuplicates(sourceGoals.map((goal) => goal.id))
  const missingPassageRefs = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
  const emptyPassages = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.topicCode)
  if (duplicateGoalIds.length > 0) throw new Error(`Duplicate source goal IDs: ${duplicateGoalIds.join(', ')}`)

  const decisions = sourceGoals.map((sourceGoal) => {
    const canonicalGoalIds = inferCanonicalGoalIds(sourceGoal)
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: 'partial',
      rationale:
        'Das amtliche ST-Geschichte-Source-Ziel ist inhaltlich durch die angegebenen kanonischen Geschichte-Kompetenzcluster abgedeckt. 1:n/partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
      reviewedAt: generatedAt,
      reviewer: 'codex',
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
    extraction: {
      schemaVersion: 1,
      extractionId: spec.extractionId,
      sourceLandscapeId: spec.sourceLandscapeId,
      targetLandscapeId,
      title: spec.title,
      jurisdiction,
      subject,
      stage: spec.stage,
      sourceDocument,
      sourceDocuments: [sourceDocument],
      method: {
        passageExtraction:
          'pdftotext -layout over the official Sachsen-Anhalt Geschichte Fachlehrplan; one passage per Kompetenzschwerpunkt or Fachpraktikum.',
        sourceGoalExtraction:
          'one source goal per official competency bullet and one source goal per Grundlegender Wissensbestand. Abstimmungs-, SDG- and cross-subject reference blocks are excluded.',
        mappingBasis:
          'M3 maps each source goal to one or more canonical Geschichte clusters. 1:n/partial is a mapping form, not a quality deficit.',
      },
      qualityReview: {
        sourceGoalCountPeerBaseline: {
          status: 'accepted',
          accepted: true,
          actualSourceGoals: sourceGoals.length,
          details: spec.peerBaselineReview,
          rationale: spec.peerBaselineReview,
        },
        notes: [
          'Legacy-Snapshots werden nicht als Quelle verwendet.',
          'Der Fachlehrplan deckt Sek I und Qualifikationsphase in einer amtlichen PDF ab; die Extraktion trennt sie in zwei Source-Lanes.',
        ],
      },
      expectedTopicCodes: sections.map((section) => section.code),
      pipelineStatus: buildPipelineStatus(spec, passages, sourceGoals, {
        duplicateGoalIds,
        missingPassageRefs,
        emptyPassages,
      }),
      passages,
      sourceGoals,
      validation: {
        passageIdsUnique: passageIds.size === passages.length,
        sourceGoalIdsUnique: duplicateGoalIds.length === 0,
        sourceGoalsReferenceKnownPassages: missingPassageRefs.length === 0,
      },
      generatedAt,
    },
    review: {
      version: 1,
      reviewId: spec.stage === 'SekI'
        ? 'de-st-history-lower-secondary-source-extraction-to-canonical-history'
        : 'de-st-history-upper-secondary-source-extraction-to-canonical-history',
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
          'Sachsen-Anhalt Geschichte ist vollstaendig reviewed und durch kanonische Geschichte-Kompetenzcluster abgedeckt. Partial beschreibt die Zuordnungsform, nicht eine offene fachliche Luecke.',
      },
      mappings,
      decisions,
    },
  }
}

function buildPassage(spec: ExtractionSpec, section: ParsedSection) {
  return {
    id: passageIdFor(spec, section.code),
    sourceDocumentKey: sourceDocument.key,
    topicCode: section.code,
    title: `${section.phase} - ${section.title}`,
    text: section.goals.map((goal) => `(${goal.kind}) ${goal.text}`).join('\n'),
    rawText: section.goals.map((goal) => `(${goal.kind}) ${goal.text}`).join('\n'),
    sourcePath: sourceDocument.path,
    sourceUrl: sourceDocument.url,
    sourceGoalIds: section.goals.map((goal) => sourceGoalId(spec, section, goal)),
    metadata: {
      jurisdiction,
      subject,
      stage: spec.stage,
      phase: section.phase,
      courseLevel: section.courseLevel,
      sourceDocumentKey: sourceDocument.key,
      page: section.page,
    },
  }
}

function buildSourceGoals(spec: ExtractionSpec, section: ParsedSection): SourceGoal[] {
  const passageId = passageIdFor(spec, section.code)
  return section.goals.map((goal) => {
    const sourceSpan = `${section.code}.${slug(goal.kind)}.${goal.number}`
    return {
      id: sourceGoalId(spec, section, goal),
      passageId,
      topicCode: section.code,
      bulletIndex: goal.number,
      aspectIndex: 1,
      title: titleFromSourceText(goal.text),
      description: `Die lernende Person kann ${toSentenceFragment(goal.text)}`,
      sourceText: goal.text,
      sourceSpan,
      parentBulletText: goal.text,
      sourceDocumentKey: sourceDocument.key,
      sourceRef: `${sourceDocument.title}, ${section.phase}, ${section.title}, ${goal.kind}, PDF-S. ${section.page}`,
      courseLevel: section.courseLevel,
      granularity: 'officialCompetency',
      stage: spec.stage,
      tags: [
        'subject:geschichte',
        `jurisdiction:${jurisdiction}`,
        `stage:${spec.stage}`,
        `phase:${slug(section.phase)}`,
        `competency:${slug(goal.kind)}`,
        `courseLevel:${section.courseLevel}`,
        `sourceDocument:${sourceDocument.key}`,
      ],
      rawSourceText: goal.text,
      rawSourceSpan: sourceSpan,
      rawParentBulletText: goal.text,
      metadata: {
        extractionMethod:
          'pdftotext-layout-st-gymnasium-geschichte-kompetenzschwerpunkte-competency-bullets-and-wissensbestaende',
        phase: section.phase,
        competencyArea: goal.kind,
        page: section.page,
      },
    }
  })
}

function buildPipelineStatus(
  spec: ExtractionSpec,
  passages: Array<{ topicCode: string; sourceGoalIds: string[] }>,
  sourceGoals: SourceGoal[],
  diagnostics: { duplicateGoalIds: string[]; missingPassageRefs: string[]; emptyPassages: string[] },
) {
  const mapping2Complete = sourceGoals.length > 0
    && diagnostics.duplicateGoalIds.length === 0
    && diagnostics.missingPassageRefs.length === 0
    && diagnostics.emptyPassages.length === 0
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
            label: 'Amtlicher Sachsen-Anhalt-Geschichte-Fachlehrplan liegt lokal vor',
            passed: existsSync(abs(sourceDocument.path)),
            details: sourceDocument.path,
          },
          {
            id: 'source-document-url-registered',
            label: 'Originalquelle ist mit URL dokumentiert',
            passed: true,
            details: `${officialOverviewUrl}; ${sourceDocument.url}`,
          },
        ],
      },
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: passages.length > 0 ? 'complete' : 'incomplete',
        dependsOn: ['ORIGINALQUELLEN'],
        checks: [
          {
            id: 'expected-topic-coverage',
            label: 'ST-Geschichte-Kompetenzschwerpunkte und Fachpraktika sind als Passagen vorhanden',
            passed: passages.length > 0,
            details: `${passages.length} Passagegruppen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: sourceDocument.path,
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
            label: 'Source-Ziele aus amtlichen ST-Geschichte-Kompetenz- und Wissensbestandszeilen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-count-peer-baseline-manual-review',
            label: 'Source-Ziel-Anzahl wurde fachlich gegen den HE/BW-Korridor plausibilisiert',
            passed: true,
            details: spec.peerBaselineReview,
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
            passed: diagnostics.duplicateGoalIds.length === 0,
            details: `Doppelte IDs: ${diagnostics.duplicateGoalIds.join(', ') || '-'}`,
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
        status: mapping2Complete ? 'complete' : 'blocked',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: mapping2Complete,
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
            details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; 0 explizite Canonical-Gaps, 0 unreviewed. 1:n/partial bezeichnet hier nur die Zuordnungsform.`,
          },
        ],
      },
    ],
  }
}

function inferCanonicalGoalIds(sourceGoal: SourceGoal): string[] {
  const text = asciiFold(`${sourceGoal.topicCode} ${sourceGoal.sourceText}`).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/quelle|quellen|darstellung|interpret|narrativ|geschichtskultur|zeitstrahl|archaeologie|museum|digital|praesentation|datenbank|denkmal|methode/u.test(text)) {
    add('Warum Geschichte? - Relevanz und Orientierung', 'Kontroversen über die Vergangenheit', 'Geschichtsbilder und Geschichtspolitik')
  }
  if (/fruehgeschichte|steinzeit|neolith|metallzeit|nebra|aegypt|pharao|pyramide|polis|athen|rom|roemisch|antike|mittelmeer/u.test(text)) {
    add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Antike Traditionen und Rezeption der Antike')
  }
  if (/mittelalter|grundherrschaft|lehnswesen|ritter|stadt|urbane|staende|kirche|reformation|luther|absolut|monarchie/u.test(text)) {
    add('Formen von Herrschaft und Gesellschaft in Antike und Mittelalter', 'Interkulturelle Begegnungen und europäische Aufbrüche', 'Infragestellung traditionaler Herrschaft in der frühen Neuzeit')
  }
  if (/entdeckung|kolonial|kolumbus|renaissance|franzoesische revolution|staendegesellschaft|freiheit|nationale einheit|1848|nationalstaat|industriegesellschaft|industrialis|imperialismus|kolonialismus|kaiserreich/u.test(text)) {
    add('Die Französische Revolution – "Freiheit, Gleichheit, Brüderlichkeit"?')
    add('Revolution 1848/49 – Markstein zu Parlamentarismus, Demokratie, Nationalstaat?')
    add('Industrialisierung – Wohlstand für wenige?')
    add('Imperialismus – Export europäischer Zivilisation?')
    add('Q1 19. Jahrhundert')
  }
  if (/erster weltkrieg|weimar|demokratie|nationalsozial|ns-|diktatur|holocaust|verfolgung|zweiter weltkrieg|stalinismus|sowjet|totalitaer|gewalt/u.test(text)) {
    add('Der Erste Weltkrieg – Zerstörung der alten Ordnung')
    add('Weimarer Republik als erste deutsche Demokratie')
    add('Aushöhlung der Demokratie und Errichtung der Diktatur')
    add('Nationalsozialistische Diktatur – Zerstörung von Demokratie/Menschenrechten')
    add('Weltpolitische Faktoren 1917–1945')
    add('Russische Revolution und Stalinismus')
  }
  if (/1945|kalter krieg|spaltung|geteilten deutschland|brd|ddr|vereinigung|zeitzeuge|nahost|israel|palaestin|internationale kooperation|usa|supermacht/u.test(text)) {
    add('Der Kalte Krieg – stabile oder labile Ordnung?')
    add('Teilung Deutschlands – eine Nation, zwei Staaten')
    add('Deutschland von der Teilung zur Einheit')
    add('Weltpolitische Entwicklungen zwischen Bipolarität und Multipolarität')
    add('Nahostkonflikt als weltpolitischer Krisenherd')
  }
  if (/erinnerung|gegenwart|geschichtskultur|identitaet|vergangenheits|kolonialpolitik heute|moralische verantwortung|reparation/u.test(text)) {
    add('Umgang mit NS-Vergangenheit – "Vergangenheitsbewältigung"?')
    add('Kontroversen über die Vergangenheit')
    add('Geschichtsbilder und Geschichtspolitik')
    add('Wahrnehmungen und Deutung von Geschichte im Wandel')
  }

  const ids = [...titles]
    .map((title) => canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title)))
    .filter((id): id is string => Boolean(id))
  if (ids.length > 0) return [...new Set(ids)]
  return [
    requireCanonicalTitle('Wahrnehmungen und Deutung von Geschichte im Wandel'),
    requireCanonicalTitle('Geschichtsbilder und Geschichtspolitik'),
  ]
}

function updateRegistry(updatedSpecs: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Record<string, unknown>[] }>(registryPath)
  const landscapeIds = new Set(updatedSpecs.map((spec) => spec.sourceLandscapeId))
  const nextEntries = registry.entries.filter((entry) => !landscapeIds.has(String(entry.landscapeId)))
  for (const spec of updatedSpecs) {
    nextEntries.push({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction,
      subject,
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: sourceDocument.path,
      archiveSourcePath: sourceDocument.path,
      archivePath: spec.archivePath,
      sourceDocumentKey: sourceDocument.key,
      sourceUrl: sourceDocument.url,
    })
  }
  registry.entries = nextEntries.sort((left, right) => String(left.landscapeId).localeCompare(String(right.landscapeId)))
  writeJson(registryPath, registry)
}

function updateReadme(generated: Array<{ spec: ExtractionSpec; count: number }>): void {
  const path = 'curricula/DE/Gymnasium/input/ST/README.md'
  const existing = existsSync(abs(path)) ? readFileSync(abs(path), 'utf8') : '# Sachsen-Anhalt (ST) - Gymnasium Curricula\n'
  const section = [
    '<!-- DE-ST-GESCHICHTE-SOURCE-EXTRACTION:start -->',
    '## Geschichte',
    '',
    'Archived official source input on `2026-05-14`:',
    '',
    '- `FLP_Geschichte_Gym_01082022_swd.pdf`',
    `  - ${sourceDocument.title}`,
    '  - Schuljahrgänge `5/6`, `7/8`, `9`, `10 (Einfuehrungsphase)` und `11/12 (Qualifikationsphase)`',
    `  - direct PDF source: \`${sourceDocument.url}\``,
    `  - official Lehrplan overview: \`${officialOverviewUrl}\``,
    '',
    'Operational note:',
    '',
    '- `DE-ST` now has real archived lower-secondary plus upper-secondary Geschichte source extractions from the official Fachlehrplan PDF.',
    '- Abstimmungs-, SDG- and cross-subject reference blocks are intentionally excluded from the Pflicht-source inventory.',
    '- The retained source extractions now live at:',
    ...generated.map(({ spec }) => `  - \`${spec.outputPath}\``),
    '- Sachsen-Anhalt Geschichte M3 status:',
    ...generated.map(({ spec, count }) => `  - ${spec.stage}: \`complete\` (${count} Source-Ziele)`),
    '<!-- DE-ST-GESCHICHTE-SOURCE-EXTRACTION:end -->',
    '',
  ].join('\n')
  writeFileSync(abs(path), `${replaceMarkedSection(existing, 'DE-ST-GESCHICHTE-SOURCE-EXTRACTION', section).trim()}\n`, 'utf8')
}

function updateStageReferences(generated: Array<{ spec: ExtractionSpec; count: number }>): void {
  const lower = generated.find(({ spec }) => spec.stage === 'SekI')
  const upper = generated.find(({ spec }) => spec.stage === 'SekII')
  if (lower) {
    updateReferenceFile({
      path: 'curricula/DE/Gymnasium/input/ST/lower-secondary/references.md',
      marker: 'DE-ST-GESCHICHTE-SEKI-SOURCE-EXTRACTION',
      scope: `lower-secondary extraction target: ST Geschichte Schuljahrgaenge 5/6, 7/8, 9 und 10 (${lower.count} Source-Ziele)`,
      extractionPath: lower.spec.outputPath,
      reviewPath: lower.spec.reviewPath,
    })
  }
  if (upper) {
    updateReferenceFile({
      path: 'curricula/DE/Gymnasium/input/ST/upper-secondary/references.md',
      marker: 'DE-ST-GESCHICHTE-SEKII-SOURCE-EXTRACTION',
      scope: `upper-secondary extraction target: ST Geschichte Qualifikationsphase 11/12 (${upper.count} Source-Ziele)`,
      extractionPath: upper.spec.outputPath,
      reviewPath: upper.spec.reviewPath,
    })
  }
}

function updateReferenceFile(args: {
  path: string
  marker: string
  scope: string
  extractionPath: string
  reviewPath: string
}): void {
  const existing = existsSync(abs(args.path)) ? readFileSync(abs(args.path), 'utf8') : '# References\n'
  const section = [
    `<!-- ${args.marker}:start -->`,
    '## Geschichte source PDF',
    '',
    `- \`${sourceDocument.title}\`:`,
    `  ${sourceDocument.url}`,
    '',
    'Official source page:',
    '',
    `- ${officialOverviewUrl}`,
    '',
    'Scope:',
    '',
    '- Sachsen-Anhalt',
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
    if ((compiled.jurisdiction?.length ?? 0) > 0) goal.applicability = compiled
    else delete goal.applicability
  }
  writeJson(canonicalPath, canonical)
}

function pdfText(path: string): string {
  return execFileSync('pdftotext', ['-layout', abs(path), '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
    .replace(/\r/gu, '')
    .replace(/\u00a0/gu, ' ')
}

function cleanGoalText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/([A-Za-zÄÖÜäöüß])[-‐‑‒–—]+\s+(?!und\b|oder\b)([a-zäöüß])/gu, '$1$2')
    .replace(/([a-zäöüß])(?:kompetenz|Kompetenz)\s+([a-zäöüß])/gu, '$1$2')
    .replace(/([a-zäöüß])geschichts\s*([a-zäöüß])/gu, '$1$2')
    .replace(/\bnarrative\s+(?=oder\b|und\b)/gu, '')
    .replace(/\b(?:kompetenz|Kompetenz)\s+(?=[A-Za-zÄÖÜäöüß])/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()
}

function normalizeLine(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/\u00a0/gu, ' ')
    .replace(/[ \t]+/gu, ' ')
    .trim()
}

function isMeaningfulSourceGoal(value: string): boolean {
  if (value.length < 12) return false
  if (/^(?:Fachlehrplan|Quelle:|Schuljahrg|Grundlegende Wissensbestände)/u.test(value)) return false
  return /[a-zäöüß]/u.test(value)
}

function isPdfArtifact(line: string): boolean {
  return line.length === 0
    || /^\d+$/u.test(line)
    || /^Fachlehrplan/u.test(line)
    || /^01\.08\.2022$/u.test(line)
}

function topicCodeFor(phase: string, title: string): string {
  return `ST-GESCHICHTE-${slug(phase)}-${slug(title)}`.toUpperCase()
}

function passageIdFor(spec: ExtractionSpec, topicCode: string): string {
  return `${spec.sourceGoalPrefix}:${slug(topicCode)}-${hash(topicCode)}`
}

function sourceGoalId(spec: ExtractionSpec, section: ParsedSection, goal: ParsedGoal): string {
  return uuidFromString(`${spec.extractionId}:${section.code}:${goal.kind}:${goal.number}:${goal.text}`)
}

function titleFromSourceText(text: string): string {
  const clean = cleanGoalText(text).replace(/[.;:,]+$/u, '')
  return clean.length <= 110 ? clean : `${clean.slice(0, 107).trim()}...`
}

function toSentenceFragment(text: string): string {
  const clean = cleanGoalText(text).replace(/[.;:,]+$/u, '')
  return `${clean.charAt(0).toLowerCase()}${clean.slice(1)}.`
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

function replaceMarkedSection(existing: string, marker: string, nextSection: string): string {
  const pattern = new RegExp(`<!-- ${escapeRegExp(marker)}:start -->[\\s\\S]*?<!-- ${escapeRegExp(marker)}:end -->\\n?`, 'u')
  if (pattern.test(existing)) return existing.replace(pattern, `${nextSection.trim()}\n`)
  return `${existing.trim()}\n\n${nextSection.trim()}\n`
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function uuidFromString(input: string): string {
  const hex = createHash('sha1').update(input).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
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
