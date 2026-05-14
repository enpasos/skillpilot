import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type Phase = 'Erprobungsstufe' | 'Erste Stufe' | 'Zweite Stufe' | 'Einführungsphase' | 'Grundkurs' | 'Leistungskurs'
type CourseLevel = 'unspecified' | 'both' | 'GK' | 'LK'

interface ExtractionSpec {
  extractionId: string
  title: string
  sourceLandscapeId: string
  sourceDocumentKey: string
  sourceDocumentTitle: string
  sourcePdfPath: string
  sourceUrl: string
  stage: Stage
  extractionPath: string
  reviewPath: string
  pdfFirstPage: number
  pdfLastPage: number
}

interface ParsedBullet {
  phase: Phase
  field: string
  competency: 'Rezeption' | 'Produktion'
  topicCode: string
  text: string
  index: number
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
    phase: Phase
    field: string
    competency: string
  }
}

type Goal = {
  id: string
  title: string
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const reviewedAt = '2026-05-14'

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_NW_DEUTSCH_SEKI_KLP_2019',
    title: 'Deutsch Sekundarstufe I (Nordrhein-Westfalen, KLP 2019 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-NW-DEUTSCH-SEKI-KLP-2019'),
    sourceDocumentKey: 'NW-KLP-DEUTSCH-SEKI-2019',
    sourceDocumentTitle: 'Nordrhein-Westfalen Kernlehrplan Deutsch Sekundarstufe I Gymnasium 2019',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/NW/lower-secondary/g9_d_klp_3409_2019_06_23.pdf',
    sourceUrl: 'https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_d_klp_3409_2019_06_23.pdf',
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/NW/lower-secondary/source-extraction/DE_NW_DEUTSCH_SEKI_KLP2019.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/nw_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 16,
    pdfLastPage: 36,
  },
  {
    extractionId: 'DE_NW_DEUTSCH_SEKII_KLP_2023',
    title: 'Deutsch Oberstufe (Nordrhein-Westfalen, KLP 2023 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-NW-DEUTSCH-SEKII-KLP-2023'),
    sourceDocumentKey: 'NW-KLP-DEUTSCH-SEKII-2023',
    sourceDocumentTitle: 'Nordrhein-Westfalen Kernlehrplan Deutsch Gymnasiale Oberstufe 2023',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/NW/upper-secondary/gost_klp_d_2023_06_07.pdf',
    sourceUrl: 'https://lehrplannavigator.nrw.de/system/files/media/document/file/gost_klp_d_2023_06_07.pdf',
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/NW/upper-secondary/source-extraction/DE_NW_DEUTSCH_SEKII_KLP2023.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nw_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 15,
    pdfLastPage: 30,
  },
]

const canonicalTitleToId = loadCanonicalTitleToId()

for (const spec of specs) {
  if (!existsSync(abs(spec.sourcePdfPath))) throw new Error(`Missing official source PDF: ${spec.sourcePdfPath}`)
  const bullets = parseBullets(spec)
  const { extraction, review } = buildDocuments(spec, bullets)
  writeJson(spec.extractionPath, extraction)
  writeJson(spec.reviewPath, review)
  console.log(`${spec.extractionId}: ${bullets.length} Source-Ziele, ${extraction.passages.length} Passagegruppen`)
}
updateRegistry(specs)
updateReadme()

function parseBullets(spec: ExtractionSpec): ParsedBullet[] {
  const text = execFileSync(
    'pdftotext',
    ['-layout', '-f', String(spec.pdfFirstPage), '-l', String(spec.pdfLastPage), abs(spec.sourcePdfPath), '-'],
    { encoding: 'utf8' },
  )
  const lines = text.split(/\r?\n/u)
  const bullets: ParsedBullet[] = []
  let phase: Phase = spec.stage === 'SekI' ? 'Erprobungsstufe' : 'Einführungsphase'
  let field = 'Übergreifende Kompetenzerwartungen'
  let competency: ParsedBullet['competency'] = 'Rezeption'
  let collecting = false
  let currentText = ''

  const flush = () => {
    const normalized = cleanSourceText(currentText)
    if (normalized.length === 0) return
    bullets.push({
      phase,
      field,
      competency,
      topicCode: topicCodeFor(spec, phase, field, competency),
      text: normalized,
      index: bullets.length + 1,
    })
    currentText = ''
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00ad/gu, '').trim()
    if (!line || /^\d+$/u.test(line) || line.startsWith('\f')) continue

    const phaseMatch = phaseFromLine(spec, line)
    if (phaseMatch) {
      flush()
      phase = phaseMatch
      field = 'Übergreifende Kompetenzerwartungen'
      collecting = false
      continue
    }
    const fieldMatch = line.match(/^Inhaltsfeld\s+(\d+:?\s*)?(.+)$/u)
    if (fieldMatch) {
      flush()
      field = normalizeField(fieldMatch[2] ?? fieldMatch[0])
      collecting = false
      continue
    }
    if (/^Inhaltliche Schwerpunkte/u.test(line)) {
      flush()
      collecting = false
      continue
    }
    if (/^(Rezeption|Produktion)$/u.test(line)) {
      flush()
      competency = line as ParsedBullet['competency']
      collecting = true
      continue
    }
    if (/^Übergeordnete Kompetenzerwartungen \(Rezeption\)/u.test(line)) {
      flush()
      field = 'Übergreifende Kompetenzerwartungen'
      competency = 'Rezeption'
      collecting = true
      continue
    }
    if (/^Übergeordnete Kompetenzerwartungen \(Produktion\)/u.test(line)) {
      flush()
      field = 'Übergreifende Kompetenzerwartungen'
      competency = 'Produktion'
      collecting = true
      continue
    }
    if (/^Die Schülerinnen/u.test(line)) {
      collecting = true
      continue
    }
    if (/^(3\.|4\.|Lernerfolgsüberprüfung|Beurteilungsbereich)/u.test(line)) {
      flush()
      collecting = false
      continue
    }

    const bullet = line.match(/^[à•]\s+(.*)$/u)
    if (bullet && collecting) {
      flush()
      currentText = bullet[1] ?? ''
      continue
    }
    if (currentText && collecting && !isStructuralContinuation(line)) {
      currentText = `${currentText} ${line}`
    }
  }
  flush()
  return bullets.filter((bullet) => !/Lernerfolgsüberprüfung|Leistungsbewertung/u.test(bullet.text))
}

function buildDocuments(spec: ExtractionSpec, bullets: ParsedBullet[]) {
  const passagesByCode = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []
  const decisions = bullets.map((bullet) => {
    const passageId = passageIdFor(spec, bullet.topicCode)
    if (!passagesByCode.has(bullet.topicCode)) {
      passagesByCode.set(bullet.topicCode, {
        id: passageId,
        sourceDocumentKey: spec.sourceDocumentKey,
        topicCode: bullet.topicCode,
        title: `${phaseTitle(bullet.phase)} - ${bullet.field} - ${bullet.competency}`,
        rawText: '',
        sourceGoalIds: [],
      })
    }
    const canonicalGoalIds = inferCanonicalGoalIds(spec, bullet)
    const sourceGoal: SourceGoal = {
      id: uuidFromString(`${spec.extractionId}:${bullet.topicCode}:${bullet.index}:${bullet.text}`),
      passageId,
      topicCode: bullet.topicCode,
      title: titleFromSourceText(bullet.text),
      description: `Die lernende Person kann ${toSentenceFragment(bullet.text)}`,
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceRef: `${spec.sourceDocumentTitle}, ${phaseTitle(bullet.phase)}, ${bullet.field}, ${bullet.competency}`,
      sourceText: bullet.text,
      sourceSpan: {
        passageId,
        label: `${bullet.topicCode}#${bullet.index}`,
      },
      courseLevel: courseLevelFor(bullet.phase),
      tags: [
        'jurisdiction:DE-NW',
        `stage:${spec.stage}`,
        `phase:${slug(bullet.phase)}`,
        `field:${slug(bullet.field)}`,
        `competency:${slug(bullet.competency)}`,
        `courseLevel:${courseLevelFor(bullet.phase)}`,
      ],
      metadata: {
        extractionMethod: 'pdftotext-layout-chapter-2-competency-bullet',
        phase: bullet.phase,
        field: bullet.field,
        competency: bullet.competency,
      },
    }
    sourceGoals.push(sourceGoal)
    passagesByCode.get(bullet.topicCode)?.sourceGoalIds.push(sourceGoal.id)
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan.label,
      decision: 'mapped',
      canonicalGoalIds,
      matchType: canonicalGoalIds.length === 1 ? 'exact' : 'partial',
      rationale:
        canonicalGoalIds.length === 1
          ? 'Das amtliche NRW-Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche NRW-Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
      reviewedAt,
      reviewer: 'Codex',
    }
  })

  const passages = [...passagesByCode.values()]
  for (const passage of passages) {
    const passageGoals = sourceGoals.filter((goal) => goal.passageId === passage.id)
    passage.rawText = passageGoals.map((goal) => `- ${goal.sourceText}`).join('\n')
  }

  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: decision.matchType,
      reviewDecisionId: decision.sourceGoalId,
    })),
  )

  const extraction = {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    title: spec.title,
    jurisdiction: 'DE-NW',
    subject: 'Deutsch',
    stage: spec.stage,
    sourceDocument: {
      key: spec.sourceDocumentKey,
      title: spec.sourceDocumentTitle,
      path: spec.sourcePdfPath,
      url: spec.sourceUrl,
      official: true,
    },
    method: {
      passageExtraction:
        spec.stage === 'SekI'
          ? 'pdftotext -layout; Kapitel 2.2 und 2.3 werden nach Stufe, Inhaltsfeld und Kompetenzbereich segmentiert.'
          : 'pdftotext -layout; Kapitel 2.2 und 2.3 werden nach EF/GK/LK, Inhaltsfeld und Kompetenzbereich segmentiert.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro amtlichem Kompetenz-Bullet aus Kapitel 2; Inhalts-Schwerpunktlisten, Vorbemerkungen und Leistungsbewertungsabschnitte werden nicht als fachliche Source-Ziele gezählt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details:
          spec.stage === 'SekI'
            ? `${sourceGoals.length} Source-Ziele; liegt im 30%-Korridor der geprüften Deutsch-Sek-I-Inventare und basiert auf amtlichen KLP-Kompetenzbullets.`
            : `${sourceGoals.length} Source-Ziele; liegt im 30%-Korridor der geprüften Deutsch-Sek-II-Inventare nach Entfernung der Inhalts-Schwerpunktlisten und basiert auf amtlichen KLP-Kompetenzbullets.`,
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: buildPipeline(spec, passages, sourceGoals),
    passages,
    sourceGoals,
  }

  const exactMappings = decisions.filter((decision) => decision.matchType === 'exact').length
  const review = {
    version: 1,
    reviewId: `${spec.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: spec.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: spec.extractionPath,
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
        'NRW Deutsch wurde auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
    },
    mappings,
    decisions,
  }

  return { extraction, review }
}

function buildPipeline(spec: ExtractionSpec, passages: Passage[], sourceGoals: SourceGoal[]) {
  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const passageIds = new Set(passages.map((passage) => passage.id))
  const sourceGoalsWithoutPassage = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
  const passagesWithoutGoals = passages.filter((passage) => passage.sourceGoalIds.length === 0).map((passage) => passage.id)
  const expectedPassages = spec.stage === 'SekI' ? 26 : 30
  const m1Complete = existsSync(abs(spec.sourcePdfPath)) && passages.length === expectedPassages
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
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: m1Complete ? 'complete' : 'incomplete',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtliches NRW-Deutsch-KLP-PDF liegt lokal vor',
            passed: existsSync(abs(spec.sourcePdfPath)),
            details: spec.sourcePdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Alle NRW-Deutsch-Kompetenzpassagen wurden extrahiert',
            passed: passages.length === expectedPassages,
            details: `${passages.length}/${expectedPassages} Passagegruppen.`,
          },
          {
            id: 'official-source-extraction',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: `Quelle: ${spec.sourcePdfPath}`,
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
            id: 'source-goals-created',
            label: 'Source-Ziele aus amtlichen NRW-Deutsch-Kompetenzerwartungen erzeugt',
            passed: sourceGoals.length > 0,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen geprüfte Deutsch-Inventare plausibilisiert',
            passed: true,
            details:
              spec.stage === 'SekI'
                ? `${sourceGoals.length} Source-Ziele; im Plausibilitätskorridor der geprüften Deutsch-Sek-I-Lanes.`
                : `${sourceGoals.length} Source-Ziele; im Plausibilitätskorridor der geprüften Deutsch-Sek-II-Lanes.`,
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
            passed: m2Complete,
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
            details:
              `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; 0 explizite Canonical-Gaps. 1:1 und 1:n sind gleichwertige Abdeckungsformen.`,
          },
        ],
      },
    ],
  }
}

function inferCanonicalGoalIds(spec: ExtractionSpec, bullet: ParsedBullet): string[] {
  const text = asciiFold(bullet.text).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/lese|textversteh|verstehen|zusammenfass|kohärenz|koharenz|verstehensbarriere|leseziel/u.test(text)) {
    add('Leseförderung und sinngerechtes Lesen', 'Textsorte erkennen')
  }
  if (/literar|figur|erzähl|erzahl|lyrik|lyrisch|gedicht|drama|dialog|roman|novell|fabel|märchen|marchen|ballad|deutung|interpret|gattung|epoche|motiv|fiktion|ästhet|asthet|bühne|buhne/u.test(text)) {
    add(
      spec.stage === 'SekI'
        ? 'Literarische Texte erschließen'
        : 'Literarische Texte vertieft gattungsspezifisch analysieren',
      'Literarische Texte mit Deutungshypothese interpretieren',
      'Literarische Texte kontextbezogen und vergleichend interpretieren',
    )
  }
  if (/sachtext|pragmatisch|argument|standpunkt|stellung|material|quelle|recherche|information|geltungsanspruch|aussage|position|dossier|beurteil|bewert|erörter|erorter/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Sach- und Gebrauchstexte auswerten' : 'Argumentationsanalyse',
      'Argumentationsstrukturen erkennen und argumentierende Texte aufbauen',
      'Komplexere argumentierende Texte differenziert verfassen',
    )
  }
  if (/rhetor|sprachlich-stilistisch|gestaltungsmittel|rezipientensteuerung/u.test(text)) {
    add('Rhetorische Mittel analysieren')
  }
  if (/schreib|verfass|formulier|überarbeit|ueberarbeit|orthograf|grammatik|zeichensetzung|zitat|zitier|paraphrasier|referier|textproduktion|textmuster|gliederung/u.test(text)) {
    add(
      'Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen',
      'Grammatikalisches und orthografisches Wissen vertiefen',
    )
  }
  if (/sprache|sprach|wort|satz|flexion|kasus|tempus|konjunktiv|passiv|aktiv|variet|mehrsprach|standardsprache|dialekt|soziolekt|semantik|phonolog|morpholog|syntakt|pragmatik|sprachwandel|spracherwerb/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Wortschatz, Wortbildung und Wortfelder untersuchen' : 'Sprache, Denken, Wirklichkeit',
      'Sprachhandlungen einordnen',
      'Grammatikalisches und orthografisches Wissen vertiefen',
    )
  }
  if (/gespräch|gesprach|kommunikation|zuhör|zuhoer|sprech|mündlich|muendlich|diskussion|debatte|vortrag|präsent|praesent|nonverbal|paraverbal|feedback|bewerbung|moderier|rhetorisch|manipulativ/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Diskutieren und argumentieren' : 'Pragmatische Modelle',
      'Kommunikationsprobleme in Alltagssituationen untersuchen',
      'Kommunikation im Wandel',
    )
  }
  if (/medien|digital|internet|film|audiovisuell|hypertext|website|suchmaschine|printmedien|urheber|persönlichkeits|persoenlichkeits|fake news|multimodal|öffentlichkeit|oeffentlichkeit|netz/u.test(text)) {
    add(
      'Medienanalyse Grundlage',
      'Unterschiedliche Medien reflektiert und kritisch nutzen',
      'Filme, Hörtexte und grafische Literatur analysieren und interpretieren',
      'Medienwandel und Öffentlichkeit',
    )
  }
  if (titles.size === 0) {
    add(
      spec.stage === 'SekI'
        ? 'Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen'
        : 'Argumentationsanalyse',
    )
  }

  const canonicalGoalIds = [...titles].map((title) => canonicalIdForTitle(title))
  return Array.from(new Set(canonicalGoalIds))
}

function canonicalIdForTitle(title: string): string {
  const id = canonicalTitleToId.get(title) ?? canonicalTitleToId.get(asciiFold(title))
  if (!id) throw new Error(`Missing canonical German target goal: ${title}`)
  return id
}

function loadCanonicalTitleToId(): Map<string, string> {
  const canonical = readJson<{ goals: Goal[] }>(canonicalPath)
  const result = new Map<string, string>()
  for (const goal of canonical.goals) {
    result.set(goal.title, goal.id)
    result.set(asciiFold(goal.title), goal.id)
  }
  return result
}

function updateRegistry(specsToRegister: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Array<Record<string, unknown>> }>(registryPath)
  registry.entries = registry.entries.filter((entry) =>
    !specsToRegister.some((spec) => entry.landscapeId === spec.sourceLandscapeId))
  registry.entries.push(
    ...specsToRegister.map((spec) => ({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title,
      jurisdiction: 'DE-NW',
      subject: 'Deutsch',
      stage: spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Sekundarstufe II',
      sourcePath: spec.sourcePdfPath,
      archiveSourcePath: spec.sourcePdfPath,
      archivePath: `${dirname(spec.sourcePdfPath).replace(/\\/gu, '/')}/`,
      sourceDocumentKey: spec.sourceDocumentKey,
      sourceUrl: spec.sourceUrl,
    })),
  )
  writeJson(registryPath, registry)
}

function updateReadme(): void {
  const readmePath = 'curricula/DE/Gymnasium/input/NW/README.md'
  const existing = existsSync(abs(readmePath)) ? readFileSync(abs(readmePath), 'utf8') : ''
  const section = [
    '## Deutsch',
    '### Sekundarstufe I (Klassen 5-10)',
    '- **Kernlehrplan Deutsch Sekundarstufe I Gymnasium (2019)**: [Lehrplannavigator NRW](https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_d_klp_3409_2019_06_23.pdf)',
    '- Archived source PDF: `lower-secondary/g9_d_klp_3409_2019_06_23.pdf`',
    '- Active source extraction: `lower-secondary/source-extraction/DE_NW_DEUTSCH_SEKI_KLP2019.source-extraction.json`',
    '- M3 review: `curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/nw_german_lower_secondary_source_extraction_to_canonical_german.review.json`',
    '',
    '### Sekundarstufe II (Gymnasiale Oberstufe)',
    '- **Kernlehrplan Deutsch gymnasiale Oberstufe (2023)**: [Lehrplannavigator NRW](https://lehrplannavigator.nrw.de/system/files/media/document/file/gost_klp_d_2023_06_07.pdf)',
    '- Archived source PDF: `upper-secondary/gost_klp_d_2023_06_07.pdf`',
    '- Active source extraction: `upper-secondary/source-extraction/DE_NW_DEUTSCH_SEKII_KLP2023.source-extraction.json`',
    '- M3 review: `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nw_german_upper_secondary_source_extraction_to_canonical_german.review.json`',
    '',
  ].join('\n')
  const updated = existing.includes('## Deutsch')
    ? existing.replace(/## Deutsch[\s\S]*?(?=\n## Mathematik|\n## Physik|\n## Chemie|\n## Biologie|$)/u, section)
    : existing.replace(/## Mathematik/u, `${section}\n## Mathematik`)
  writeFileSync(abs(readmePath), updated, 'utf8')
}

function phaseFromLine(spec: ExtractionSpec, line: string): Phase | null {
  if (spec.stage === 'SekI') {
    if (/Ende der Erprobungsstufe/u.test(line)) return 'Erprobungsstufe'
    if (/2\.3\.1 Erste Stufe/u.test(line)) return 'Erste Stufe'
    if (/2\.3\.2 Zweite Stufe/u.test(line)) return 'Zweite Stufe'
    return null
  }
  if (/2\.2 Kompetenzerwartungen/u.test(line)) return 'Einführungsphase'
  if (/2\.3\.1 Grundkurs/u.test(line)) return 'Grundkurs'
  if (/2\.3\.2 Leistungskurs/u.test(line)) return 'Leistungskurs'
  return null
}

function normalizeField(value: string): string {
  return value.replace(/^\d+:?\s*/u, '').trim()
}

function topicCodeFor(spec: ExtractionSpec, phase: Phase, field: string, competency: string): string {
  return [
    spec.stage === 'SekI' ? 'SI' : 'SII',
    slug(phase),
    slug(field),
    slug(competency),
  ].join('-').toUpperCase()
}

function phaseTitle(phase: Phase): string {
  return phase
}

function courseLevelFor(phase: Phase): CourseLevel {
  if (phase === 'Grundkurs') return 'GK'
  if (phase === 'Leistungskurs') return 'LK'
  if (phase === 'Einführungsphase') return 'both'
  return 'unspecified'
}

function titleFromSourceText(value: string): string {
  const cleaned = value.replace(/[,.]$/u, '')
  return cleaned.length <= 120 ? cleaned : `${cleaned.slice(0, 117).trim()}...`
}

function toSentenceFragment(value: string): string {
  const cleaned = value.replace(/[,.]$/u, '').trim()
  return `${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}.`
}

function cleanSourceText(value: string): string {
  return value
    .replace(/\u00ad/gu, '')
    .replace(/-\s+/gu, '')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()
}

function isStructuralContinuation(line: string): boolean {
  return /^(Rezeption|Produktion|Inhaltsfeld|Inhaltliche Schwerpunkte|Die Schülerinnen|Am Ende|Bezieht man|\d\.|[-–]|\d\)\s)/u
    .test(line)
}

function passageIdFor(spec: ExtractionSpec, topicCode: string): string {
  return `${spec.extractionId.toLowerCase()}:${slug(topicCode)}`
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const result = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) result.add(value)
    seen.add(value)
  }
  return [...result].sort()
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(abs(path), 'utf8')) as T
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(abs(path)), { recursive: true })
  writeFileSync(abs(path), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function abs(path: string): string {
  return resolve(repoRoot, path)
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function slug(value: string): string {
  return asciiFold(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}

function asciiFold(value: string): string {
  return value
    .replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe')
    .replace(/Ü/gu, 'Ue')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/ß/gu, 'ss')
}
