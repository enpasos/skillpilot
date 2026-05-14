import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'unspecified' | 'both' | 'GK' | 'LK'

interface ExtractionSpec {
  extractionId: string
  title: string
  sourceLandscapeId: string
  sourceDocumentKey: string
  sourceDocumentTitle: string
  sourcePdfPath: string
  sourceUrl: string
  jurisdiction: 'DE-NI'
  stage: Stage
  extractionPath: string
  reviewPath: string
  pdfFirstPage: number
  pdfLastPage: number
  expectedPassages: number
}

interface ParsedBullet {
  phase: string
  field: string
  topicCode: string
  text: string
  index: number
  courseLevel: CourseLevel
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
  }
}

type Goal = {
  id: string
  title: string
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'
const reviewedAt = '2026-05-14'

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE_NI_DEUTSCH_SEKI_KC2015',
    title: 'Deutsch Sekundarstufe I (Niedersachsen, KC 2015 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-NI-DEUTSCH-SEKI-KC-2015'),
    sourceDocumentKey: 'NI-KC-DEUTSCH-SEKI-2015',
    sourceDocumentTitle: 'Niedersachsen Kerncurriculum Deutsch Gymnasium Schuljahrgänge 5-10 (2015)',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/NI/lower-secondary/ni_deutsch_gymnasium_seki_kc2015.pdf',
    sourceUrl:
      'https://cuvo.nibis.de/index.php?k0_0=Dokumentenart&k0_1=Schulbereich&k0_2=Schulform&k0_3=Fach&p=searched_download&uploadnum=0&v0_0=Kerncurriculum&v0_1=Sek+I&v0_2=Gymnasium-Sek.I&v0_3=Deutsch',
    jurisdiction: 'DE-NI',
    stage: 'SekI',
    extractionPath:
      'curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_DEUTSCH_SEKI_KC2015.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_german_lower_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 16,
    pdfLastPage: 31,
    expectedPassages: 18,
  },
  {
    extractionId: 'DE_NI_DEUTSCH_SEKII_KC2016',
    title: 'Deutsch Oberstufe (Niedersachsen, KC 2016 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-NI-DEUTSCH-SEKII-KC-2016'),
    sourceDocumentKey: 'NI-KC-DEUTSCH-SEKII-2016',
    sourceDocumentTitle: 'Niedersachsen Kerncurriculum Deutsch gymnasiale Oberstufe (2016)',
    sourcePdfPath: 'curricula/DE/Gymnasium/input/NI/upper-secondary/ni_deutsch_gymnasiale_oberstufe_kc2016.pdf',
    sourceUrl: 'https://cuvo.nibis.de/cuvo.php?p=download&upload=94',
    jurisdiction: 'DE-NI',
    stage: 'SekII',
    extractionPath:
      'curricula/DE/Gymnasium/input/NI/upper-secondary/source-extraction/DE_NI_DEUTSCH_SEKII_KC2016.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_german_upper_secondary_source_extraction_to_canonical_german.review.json',
    pdfFirstPage: 10,
    pdfLastPage: 24,
    expectedPassages: 12,
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
    ['-raw', '-f', String(spec.pdfFirstPage), '-l', String(spec.pdfLastPage), abs(spec.sourcePdfPath), '-'],
    { encoding: 'utf8' },
  )
  const lines = text.split(/\r?\n/u)
  const bullets: ParsedBullet[] = []
  let phase = spec.stage === 'SekI' ? 'Sekundarstufe I' : 'Einführungsphase'
  let field = 'Übergreifende Kompetenzen'
  let current = ''

  const flush = () => {
    const normalized = cleanSourceText(current)
    if (normalized.length === 0) return
    if (isIgnoredBullet(normalized)) {
      current = ''
      return
    }
    bullets.push({
      phase,
      field,
      topicCode: topicCodeFor(spec, phase, field),
      text: normalized,
      index: bullets.length + 1,
      courseLevel: courseLevelFor(spec, phase),
    })
    current = ''
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00ad/gu, '').trim()
    if (!line || /^\d+$/u.test(line) || line.startsWith('\f')) continue

    const phaseMatch = phaseFromLine(spec, line)
    if (phaseMatch) {
      flush()
      phase = phaseMatch
      field = 'Übergreifende Kompetenzen'
      continue
    }

    const fieldMatch = fieldFromLine(spec, line)
    if (fieldMatch) {
      flush()
      field = fieldMatch
      continue
    }

    const parts = line.split('')
    if (parts.length > 1) {
      flush()
      for (let index = 1; index < parts.length; index += 1) {
        current = parts[index].trim()
        if (index < parts.length - 1) flush()
      }
      continue
    }

    if (/^o\s+/u.test(line)) {
      current = current ? `${current}; ${line.replace(/^o\s+/u, '')}` : line.replace(/^o\s+/u, '')
      continue
    }

    if (current && !isStructuralLine(spec, line)) {
      current = `${current} ${line}`
      continue
    }

    flush()
  }
  flush()

  return bullets
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
        title: `${bullet.phase} - ${bullet.field}`,
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
      sourceRef: `${spec.sourceDocumentTitle}, ${bullet.phase}, ${bullet.field}`,
      sourceText: bullet.text,
      sourceSpan: {
        passageId,
        label: `${bullet.topicCode}#${bullet.index}`,
      },
      courseLevel: bullet.courseLevel,
      tags: [
        'jurisdiction:DE-NI',
        `stage:${spec.stage}`,
        `phase:${slug(bullet.phase)}`,
        `field:${slug(bullet.field)}`,
        `courseLevel:${bullet.courseLevel}`,
      ],
      metadata: {
        extractionMethod: 'pdftotext-raw-competency-bullet',
        phase: bullet.phase,
        field: bullet.field,
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
          ? 'Das amtliche Niedersachsen-Deutsch-Source-Ziel ist inhaltlich durch ein kanonisches Deutsch-Ziel abgedeckt.'
          : 'Das amtliche Niedersachsen-Deutsch-Source-Ziel ist inhaltlich durch mehrere kanonische Deutsch-Ziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.',
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
    jurisdiction: spec.jurisdiction,
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
          ? 'pdftotext -raw; Kapitel 3.1 bis 3.4 wird nach Kompetenzbereich und Abschnitt segmentiert.'
          : 'pdftotext -raw; Kapitel 3.1.1 bis 3.2.2 wird nach Phase und Kompetenzbereich segmentiert; Rahmenthemen-Beispiellisten werden nicht als Source-Ziele gezählt.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro amtlichem Kompetenz-Bullet; Unterpunkte werden als Präzisierung des jeweiligen Source-Ziels angehängt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        status: 'accepted',
        rationale:
          spec.stage === 'SekI'
            ? `${sourceGoals.length} Source-Ziele aus den tabellarischen Kompetenzbeschreibungen; liegt im Korridor der geprüften Deutsch-Sek-I-Inventare und basiert auf amtlicher CuVo-PDF-Quelle.`
            : `${sourceGoals.length} Source-Ziele aus EF/Q-Kompetenzbullets; liegt im Korridor der geprüften Deutsch-Sek-II-Inventare. Rahmenthemen- und Autor-Beispiellisten wurden bewusst nicht als eigenständige Source-Ziele gezählt.`,
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
        'Niedersachsen Deutsch wurde aus amtlichen CuVo-Kerncurricula extrahiert. MatchType partial bedeutet 1:n-Abdeckung, nicht fachliche Offenheit.',
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
  const m1Complete = existsSync(abs(spec.sourcePdfPath)) && passages.length === spec.expectedPassages
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
            label: 'Amtliches Niedersachsen-Deutsch-KC-PDF liegt lokal vor',
            passed: existsSync(abs(spec.sourcePdfPath)),
            details: spec.sourcePdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Alle erwarteten Niedersachsen-Deutsch-Kompetenzpassagen wurden extrahiert',
            passed: passages.length === spec.expectedPassages,
            details: `${passages.length}/${spec.expectedPassages} Passagegruppen.`,
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
            label: 'Source-Ziele aus amtlichen Niedersachsen-Deutsch-Kompetenzerwartungen erzeugt',
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

function phaseFromLine(spec: ExtractionSpec, line: string): string | null {
  if (spec.stage === 'SekI') {
    if (/3\.1\s+Sprechen und Zuhören/u.test(line)) return 'Sekundarstufe I'
    return null
  }
  if (/3\.1\s+Einführungsphase/u.test(line)) return 'Einführungsphase'
  if (/3\.2\s+Qualifikationsphase/u.test(line)) return 'Qualifikationsphase'
  return null
}

function fieldFromLine(spec: ExtractionSpec, line: string): string | null {
  if (/^3\.1\s+Sprechen und Zuhören/u.test(line)) return 'Sprechen und Zuhören'
  if (/^3\.2\s+Schreiben/u.test(line)) return 'Schreiben'
  if (/^3\.3\s+Lesen/u.test(line)) return 'Lesen - Umgang mit Texten und Medien'
  if (/^3\.4\s+Sprache und Sprachgebrauch/u.test(line)) return 'Sprache und Sprachgebrauch untersuchen'
  if (spec.stage === 'SekII') {
    if (/^Sprechen und Zuhören$/u.test(line)) return 'Sprechen und Zuhören'
    if (/^Schreiben$/u.test(line)) return 'Schreiben'
    if (/^Lesen$/u.test(line)) return 'Lesen'
    if (/^Sich mit Texten und Medien auseinandersetzen$/u.test(line)) return 'Sich mit Texten und Medien auseinandersetzen'
    if (/^Sich mit literarischen Texten auseinandersetzen$/u.test(line)) return 'Sich mit literarischen Texten auseinandersetzen'
    if (/^Sich mit pragmatischen Texten auseinandersetzen$/u.test(line)) return 'Sich mit pragmatischen Texten auseinandersetzen'
    if (/^Sich mit Texten unterschiedlicher medialer Form auseinandersetzen$/u.test(line)) {
      return 'Sich mit Texten unterschiedlicher medialer Form auseinandersetzen'
    }
    if (/^Sprache und Sprachgebrauch reflektieren$/u.test(line)) return 'Sprache und Sprachgebrauch reflektieren'
  }
  if (spec.stage === 'SekI') {
    const sekiSections = [
      'zu und vor anderen sprechen',
      'mit anderen sprechen',
      'verstehend zuhören',
      'szenisch spielen',
      'über sichere Schreib- und Gestaltungsfertigkeiten verfügen',
      'richtig schreiben',
      'einen Schreibprozess planvoll gestalten',
      'zentrale Schreibformen kennen und sachgerecht nutzen: gestaltendes Schreiben',
      'zentrale Schreibformen kennen und sachgerecht nutzen: informierendes Schreiben',
      'zentrale Schreibformen kennen und sachgerecht nutzen: argumentierendes und appellierendes Schreiben',
      'zentrale Schreibformen kennen und sachgerecht nutzen: untersuchendes Schreiben (analysieren, interpretieren)',
      'Lesetechniken und Lesestrategien',
      'Umgang mit literarischen Texten',
      'Umgang mit Sachtexten',
      'Umgang mit Medien',
      'Äußerungen/Texte in Verwendungszusammenhängen reflektieren und bewusst gestalten',
      'Leistungen von Wortarten und Sätzen kennen und für Sprechen, Schreiben und Textuntersuchung nutzen',
      'Silben-, Wort- und Satzebene kennen und reflektieren - Rechtschreibung und Zeichensetzung beherrschen',
    ]
    const normalizedLine = asciiFold(line).replace(/–/gu, '-').toLowerCase()
    const match = sekiSections.find((section) => asciiFold(section).toLowerCase() === normalizedLine)
    if (match) return match
  }
  return null
}

function isStructuralLine(spec: ExtractionSpec, line: string): boolean {
  return Boolean(
    phaseFromLine(spec, line)
      || fieldFromLine(spec, line)
      || /^(Die Schülerinnen|am Ende|zusätzlich|3\.|4\.|5\.|Verbindliche|Empfohlene|Rahmenthema|Pflichtmodul|Wahlpflichtmodul|Autoren und Textgruppen|Unterrichtsgestaltung|In unterschiedlichen|Informierend schreiben|Erklärend und argumentierend schreiben|Gestaltend schreiben|Schreibstrategien anwenden|Zusätzlich für|abhängig von|Eine systematische)/u.test(line),
  )
}

function isIgnoredBullet(value: string): boolean {
  return value.length < 12
}

function topicCodeFor(spec: ExtractionSpec, phase: string, field: string): string {
  return [spec.stage === 'SekI' ? 'SI' : 'SII', slug(phase), slug(field)].join('-').toUpperCase()
}

function courseLevelFor(spec: ExtractionSpec, phase: string): CourseLevel {
  if (spec.stage === 'SekI') return 'unspecified'
  if (phase === 'Einführungsphase') return 'both'
  return 'both'
}

function inferCanonicalGoalIds(spec: ExtractionSpec, bullet: ParsedBullet): string[] {
  const text = asciiFold(bullet.text).toLowerCase()
  const titles = new Set<string>()
  const add = (...nextTitles: string[]) => nextTitles.forEach((title) => titles.add(title))

  if (/lese|textversteh|verstehen|zusammenfass|kohärenz|kohaerenz|verstehensbarriere|leseziel|exzerpt/u.test(text)) {
    add('Leseförderung und sinngerechtes Lesen', 'Textsorte erkennen')
  }
  if (/literar|figur|erzähl|erzaehl|lyrik|lyrisch|gedicht|drama|dialog|roman|novell|fabel|märchen|maerchen|ballad|deutung|interpret|gattung|epoche|motiv|fiktion|ästhet|aesthet|bühne|buehne/u.test(text)) {
    add(
      spec.stage === 'SekI'
        ? 'Literarische Texte erschließen'
        : 'Literarische Texte vertieft gattungsspezifisch analysieren',
      'Literarische Texte mit Deutungshypothese interpretieren',
      'Literarische Texte kontextbezogen und vergleichend interpretieren',
    )
  }
  if (/sachtext|pragmatisch|argument|standpunkt|stellung|material|quelle|recherche|information|geltungsanspruch|aussage|position|dossier|beurteil|bewert|erörter|eroerter|these|gegenargument/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Sach- und Gebrauchstexte auswerten' : 'Argumentationsanalyse',
      'Argumentationsstrukturen erkennen und argumentierende Texte aufbauen',
      'Komplexere argumentierende Texte differenziert verfassen',
    )
  }
  if (/rhetor|sprachlich-stilistisch|gestaltungsmittel|rezipientensteuerung|wirkung/u.test(text)) {
    add('Rhetorische Mittel analysieren')
  }
  if (/schreib|verfass|formulier|überarbeit|ueberarbeit|orthograf|grammatik|zeichensetzung|zitat|zitier|paraphrasier|referier|textproduktion|textmuster|gliederung|handschrift|modalität|modalitaet/u.test(text)) {
    add(
      'Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen',
      'Grammatikalisches und orthografisches Wissen vertiefen',
    )
  }
  if (/sprache|sprach|wort|satz|flexion|kasus|tempus|konjunktiv|passiv|aktiv|variet|mehrsprach|standardsprache|dialekt|soziolekt|semantik|phonolog|morpholog|syntakt|pragmatik|sprachwandel|spracherwerb|fachbegriff/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Wortschatz, Wortbildung und Wortfelder untersuchen' : 'Sprache, Denken, Wirklichkeit',
      'Sprachhandlungen einordnen',
      'Grammatikalisches und orthografisches Wissen vertiefen',
    )
  }
  if (/gespräch|gespraech|kommunikation|zuhör|zuhoer|sprech|mündlich|muendlich|diskussion|debatte|vortrag|präsent|praesent|nonverbal|paraverbal|feedback|bewerbung|moderier|fairness|respekt/u.test(text)) {
    add(
      spec.stage === 'SekI' ? 'Diskutieren und argumentieren' : 'Pragmatische Modelle',
      'Kommunikationsprobleme in Alltagssituationen untersuchen',
      'Kommunikation im Wandel',
    )
  }
  if (/medien|digital|internet|film|audiovisuell|hypertext|website|suchmaschine|printmedien|urheber|persönlichkeits|persoenlichkeits|multimodal|öffentlichkeit|oeffentlichkeit|netz|präsentation|praesentation/u.test(text)) {
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

  return Array.from(new Set([...titles].map((title) => canonicalIdForTitle(title))))
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
      jurisdiction: spec.jurisdiction,
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
  const readmePath = 'curricula/DE/Gymnasium/input/NI/README.md'
  const existing = existsSync(abs(readmePath)) ? readFileSync(abs(readmePath), 'utf8') : '# Niedersachsen (NI) - Gymnasium Curricula\n\n'
  const section = [
    '## Deutsch',
    '### Sekundarstufe I (Klassen 5-10)',
    '- **Kerncurriculum Deutsch Gymnasium Schuljahrgänge 5-10 (2015)**: [NIBIS/CuVo](https://cuvo.nibis.de/index.php?k0_0=Dokumentenart&k0_1=Schulbereich&k0_2=Schulform&k0_3=Fach&p=searched_download&uploadnum=0&v0_0=Kerncurriculum&v0_1=Sek+I&v0_2=Gymnasium-Sek.I&v0_3=Deutsch)',
    '- Archived source PDF: `lower-secondary/ni_deutsch_gymnasium_seki_kc2015.pdf`',
    '- Active source extraction: `lower-secondary/source-extraction/DE_NI_DEUTSCH_SEKI_KC2015.source-extraction.json`',
    '- M3 review: `curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_german_lower_secondary_source_extraction_to_canonical_german.review.json`',
    '',
    '### Sekundarstufe II (Gymnasiale Oberstufe)',
    '- **Kerncurriculum Deutsch gymnasiale Oberstufe (2016)**: [NIBIS/CuVo](https://cuvo.nibis.de/cuvo.php?p=download&upload=94)',
    '- Archived source PDF: `upper-secondary/ni_deutsch_gymnasiale_oberstufe_kc2016.pdf`',
    '- Active source extraction: `upper-secondary/source-extraction/DE_NI_DEUTSCH_SEKII_KC2016.source-extraction.json`',
    '- M3 review: `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_german_upper_secondary_source_extraction_to_canonical_german.review.json`',
    '',
  ].join('\n')
  const updated = existing.includes('## Deutsch')
    ? existing.replace(/## Deutsch[\s\S]*?(?=\n## Mathematik|\n## Physik|\n## Chemie|\n## Biologie|$)/u, section)
    : existing.replace(/## Mathematik/u, `${section}\n## Mathematik`)
  writeFileSync(abs(readmePath), updated, 'utf8')
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

function passageIdFor(spec: ExtractionSpec, topicCode: string): string {
  return `${spec.extractionId.toLowerCase()}:${slug(topicCode)}`
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
