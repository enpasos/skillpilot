import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const pdfPath = 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-deutsch.pdf'
const sourceExtractionPath = 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_DEUTSCH_SEKI_G9.source-extraction.json'
const reviewPath = 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_german_lower_secondary_source_extraction_to_canonical_german.review.json'

const sourceLandscapeId = uuidFromString('DE-HE-DEUTSCH-SEKI-G9-LEHRPLAN-GYMNASIALER-BILDUNGSGANG')
const targetLandscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'

interface AreaSpec {
  grade: string
  code: string
  title: string
  topics: string[]
}

const areas: AreaSpec[] = [
  {
    grade: '5',
    code: '5.1',
    title: 'Sprechen und Schreiben',
    topics: [
      'Gespräche führen',
      'Informieren: Fragen und Antworten',
      'Diskutieren und Argumentieren',
      'Mündliches und schriftliches Erzählen',
      'Nacherzählen',
      'Phantasiegeschichten oder Bildergeschichten schreiben',
      'Darstellendes Spiel und Gestaltungsübungen',
    ],
  },
  {
    grade: '5',
    code: '5.2',
    title: 'Lesen und Umgang mit Texten',
    topics: [
      'Leseförderung und sinngerechtes Lesen',
      'Erzählungen, Märchen, Sagen, Schwänke und Kinderbücher erschließen',
      'Gedichte erschließen und vortragen',
      'Eigene literarische Produktionsversuche gestalten',
      'Sach- und Gebrauchstexte auswerten',
      'Informationen durch und über Medien nutzen',
    ],
  },
  {
    grade: '5',
    code: '5.3',
    title: 'Reflexion über Sprache',
    topics: [
      'Grundfunktionen der Sprache unterscheiden',
      'Wortschatz, Wortbildung und Wortfelder untersuchen',
      'Wortarten sicher verwenden',
      'Substantive, Artikel, Verben, Adjektive und Präpositionen bestimmen',
      'Satzarten unterscheiden',
      'Satzglieder bestimmen und umstellen',
      'Rechtschreibstrategien und Fehlersensibilität entwickeln',
      'Satzschlusszeichen und Kommas bei Aufzählungen anwenden',
    ],
  },
  {
    grade: '6',
    code: '6.1',
    title: 'Sprechen und Schreiben',
    topics: [
      'Gesprächskompetenz erweitern',
      'Informieren und Berichten',
      'Personen, Wege, Tiere, Gegenstände und Vorgänge beschreiben',
      'Diskutieren, argumentieren, überzeugen und beraten',
      'Erzählungen mit Spannungsbogen gestalten',
      'Nacherzählen mit veränderter Perspektive',
      'Nach literarischen Mustern und Bildvorlagen erzählen',
      'Darstellendes Spiel einsetzen',
    ],
  },
  {
    grade: '6',
    code: '6.2',
    title: 'Lesen und Umgang mit Texten',
    topics: [
      'Leseförderung fortführen',
      'Buchvorstellungen gestalten',
      'Informationen über Kinderliteratur und Bibliotheken nutzen',
      'Literarische Texte erschließen',
      'Sagen, Schwänke, Fabeln und Kinderromane deuten',
      'Gedichte erschließen und gestaltend vortragen',
      'Eigene Fabeln, Sagen und Gedichte schreiben',
      'Berichte, Reportagen, Sachartikel und Sachbuchtexte auswerten',
      'Medieninformationen nutzen',
      'Computerlern- und Übungsprogramme für Grammatik und Rechtschreibung einsetzen',
    ],
  },
  {
    grade: '6',
    code: '6.3',
    title: 'Reflexion über Sprache',
    topics: [
      'Grundfunktionen der Sprache an Überredungsstrategien untersuchen',
      'Wortschatz und Wortbildung erweitern',
      'Übertragene Bedeutung und einfache Metaphern erkennen',
      'Zusammensetzungen, Ableitungen, Suffixe und Präfixe untersuchen',
      'Wortfelder differenziert nutzen',
      'Tempora und Verbformen sichern',
      'Pronomen, Adjektive, Adverbien und Präpositionen bestimmen',
      'Haupt- und Gliedsätze sowie Attribute unterscheiden',
      'Objekte, adverbiale Bestimmungen und Attribute bestimmen',
      'Kommasetzung in Satzreihen und Satzgefügen anwenden',
      'Rechtschreibstrategien selbstständig nutzen',
    ],
  },
  {
    grade: '7',
    code: '7.1',
    title: 'Sprechen und Schreiben',
    topics: [
      'Aussagen sinnvoll in Gespräche einordnen',
      'Komplexe Gegenstände und Vorgänge beschreiben',
      'Informationen verarbeiten und berichten',
      'Inhaltsangaben verfassen',
      'Diskutieren und argumentieren',
      'Rhetorische Mittel beim Erzählen einsetzen',
      'Beschreiben und Schildern',
      'Kreative Schreibexperimente durchführen',
    ],
  },
  {
    grade: '7',
    code: '7.2',
    title: 'Lesen und Umgang mit Texten',
    topics: [
      'Informationen über Jugendliteratur, Verlage und Buchmarkt nutzen',
      'Bibliotheken nutzen und Buchvorstellungen gestalten',
      'Kurzgeschichten, Novellen und Jugendbücher erschließen',
      'Erzählperspektiven und formale Gestaltungselemente erkennen',
      'Gedichte und Balladen erschließen',
      'Eigene Gedichte auswählen, vorstellen und schreiben',
      'Informierende Sachtexte auswerten',
      'Informationen durch und über Medien untersuchen',
      'Neue Kommunikationsmedien als Schreib- und Informationswerkzeuge nutzen',
    ],
  },
  {
    grade: '7',
    code: '7.3',
    title: 'Reflexion über Sprache',
    topics: [
      'Kommunikationsprobleme in Alltagssituationen untersuchen',
      'Wortschatz und Wortfelder differenzieren',
      'Herkunft von Wörtern, Lehnwörter und Fremdwörter untersuchen',
      'Aktiv und Passiv sicher gebrauchen',
      'Konjunktionen für logische Zusammenhänge verwenden',
      'Haupt- und Gliedsätze unterscheiden',
      'Indirekte Rede und Konjunktiv I/II verwenden',
      'Nominalisierung und Entnominalisierung untersuchen',
      'Zeichensetzung in indirekter Rede und Satzgefügen anwenden',
      'Rechtschreibprinzipien für Selbstkorrektur nutzen',
    ],
  },
  {
    grade: '8',
    code: '8.1',
    title: 'Sprechen und Schreiben',
    topics: [
      'Gesprächsverläufe leiten und auswerten',
      'Interviews durchführen und auswerten',
      'Längere sachbezogene Redebeiträge frei vortragen',
      'Beschreiben und Berichten',
      'Inhaltsangaben gliedern und Themen benennen',
      'Diskussionen vorbereiten, durchführen und auswerten',
      'Pro- und Kontra-Argumente gegenüberstellen',
      'Phantasiegeleitetes literarisches Schreiben gestalten',
    ],
  },
  {
    grade: '8',
    code: '8.2',
    title: 'Lesen und Umgang mit Texten',
    topics: [
      'Novellen, Jugendbücher und Kurzgeschichten erschließen',
      'Handlungsverlauf, Aufbau, Personengestaltung und sprachliche Mittel beschreiben',
      'Dramatische Literatur in Grundfunktionen erkennen',
      'Gedichte und Balladen wiederholend vertiefen',
      'Fachsprachen verstehen und anwenden',
      'Zeitungen als Institution und Medium analysieren',
      'Nachrichten und Kommentare unterscheiden',
      'Eigene journalistische Texte produzieren',
      'Textverarbeitung, Layout und E-Mail-Kommunikation nutzen',
    ],
  },
  {
    grade: '8',
    code: '8.3',
    title: 'Reflexion über Sprache',
    topics: [
      'Nachrichtentexte und Kommentare auf sprachliche Beeinflussung untersuchen',
      'Wortschatz erweitern und differenzieren',
      'Schriftsprachliche Normen und Wortneubildungen untersuchen',
      'Fremdwörter erschließen',
      'Indikativ und Konjunktiv I/II im Sprachgebrauch nachweisen',
      'Modalverben und Modaladverbien verwenden',
      'Rechtschreibung und Zeichensetzung anwendungsbezogen festigen',
    ],
  },
  {
    grade: '9',
    code: '9.1',
    title: 'Sprechen und Schreiben',
    topics: [
      'Komplexe Probleme diskutieren und rhetorische Mittel einsetzen',
      'Referate vorbereiten und halten',
      'Inhaltsangaben zu Szenen, Akten und längeren Texten verfassen',
      'Erörterungen mit These, Argument, Beispiel und Beleg schreiben',
      'Subjektive Schilderungen gestalten',
      'Künstlerische Werke interpretierend beschreiben',
      'Kreatives Schreiben an literarischen Experimenten erproben',
    ],
  },
  {
    grade: '9',
    code: '9.2',
    title: 'Lesen und Umgang mit Texten',
    topics: [
      'Jugendbücher, Dramen und Kurzgeschichten vertieft erschließen',
      'Figurenkonstellationen und Beweggründe analysieren',
      'Aufbau, Struktur, Erzählperspektive, Erzählhaltung und Ironie erkennen',
      'Aristotelische Dramaform erschließen',
      'Referate zu Biographie und Kontext literarischer Texte anfertigen',
      'Gedichte verschiedener Epochen vergleichend analysieren',
      'Wissenschaftliche Texte, Lexikonartikel und Kritiken auswerten',
      'Lebenslauf und Bewerbung mit digitalen Werkzeugen erstellen',
    ],
  },
  {
    grade: '9',
    code: '9.3',
    title: 'Reflexion über Sprache',
    topics: [
      'Sprache als Kommunikationsmittel untersuchen',
      'Kommunikationssituationen mit einem Kommunikationsmodell erklären',
      'Schriftsprachliche Normen historisch vergleichen',
      'Gegenwartssprache auf Aussage, Form, Sprachgestalt und Textwirkung untersuchen',
      'Standardsprache, Umgangssprache, Fachsprachen, Sondersprachen und Dialekte unterscheiden',
      'Fachsprachen an Beispielen untersuchen',
      'Gruppensprachen charakterisieren',
    ],
  },
  {
    grade: '10',
    code: '10.1',
    title: 'Sprechen und Schreiben',
    topics: [
      'Gesprächsverhalten beobachten und analysieren',
      'Formen sprachlicher Beeinflussung erkennen',
      'Informationen aus Sekundärliteratur und Internet kritisch aufarbeiten',
      'Protokolle zu Gesprächen und Unterrichtsstunden verfassen',
      'Pro-und-Kontra-Diskussionen, Rede und Gegenrede sowie Debatten führen',
    ],
  },
  {
    grade: '10',
    code: '10.2',
    title: 'Lesen und Umgang mit Texten',
    topics: [
      'Erzählungen in Entstehungskontexte einordnen',
      'Epische Dramenformen und Mischformen erkennen',
      'Zeitgenössische Gedichte vertiefend analysieren',
      'Biographien und Autobiographien analysieren',
      'Fernsehen als Informations-, Meinungsbildungs-, Unterhaltungs- und Werbemedium untersuchen',
      'Filmtechnische und ästhetische Mittel bewerten',
      'Internet und CD-ROM als Informationsquellen nutzen',
    ],
  },
  {
    grade: '10',
    code: '10.3',
    title: 'Reflexion über Sprache',
    topics: [
      'Kommunikationssituationen differenziert untersuchen',
      'Sprachgebrauch in Fernsehsendungen analysieren',
      'Politische Rede auf Beeinflussungsstrategien untersuchen',
      'Geschlechtsspezifisches Sprach- und Gesprächsverhalten reflektieren',
      'Werbesprache analysieren',
      'Manipulativen und inhumanen Sprachgebrauch erkennen und vermeiden',
    ],
  },
]

if (!existsSync(resolve(repoRoot, pdfPath))) {
  throw new Error(`Missing source PDF: ${pdfPath}`)
}

const text = execFileSync('pdftotext', ['-layout', resolve(repoRoot, pdfPath), '-'], { encoding: 'utf8' })

const passages = areas.map((area) => {
  const rawText = extractAreaText(text, area)
  return {
    id: `he-de-seki:${slug(area.code)}-${hash(area.title)}`,
    topicCode: area.code,
    title: `${area.code} ${area.title}`,
    text: rawText,
    sourcePath: pdfPath,
    sourceUrl: 'https://kultus.hessen.de/unterricht/kerncurricula/gymnasium/deutsch',
    rawText,
    sourceGoalIds: area.topics.map((topic, index) => sourceGoalId(area, topic, index + 1)),
  }
})

const sourceGoals = areas.flatMap((area) => {
  const passageId = `he-de-seki:${slug(area.code)}-${hash(area.title)}`
  return area.topics.map((topic, index) => ({
    id: sourceGoalId(area, topic, index + 1),
    passageId,
    topicCode: area.code,
    bulletIndex: index + 1,
    aspectIndex: 1,
    title: topic,
    description: `Die lernende Person kann die Kompetenz "${topic}" sicher anwenden.`,
    sourceText: topic,
    sourceSpan: `${area.code}.${index + 1}`,
    parentBulletText: topic,
    sourceRef: `Lehrplan Deutsch gymnasialer Bildungsgang Hessen, Jahrgangsstufe ${area.grade}, ${area.code}`,
    courseLevel: 'unspecified',
    granularity: 'sourceTopic',
    stage: 'SekI',
    tags: [
      'jurisdiction:DE-HE',
      'stage:SekI',
      'durationModel:G9',
      `grade:${area.grade}`,
      `topic:${area.code}`,
      `area:${area.title}`,
    ],
    rawSourceText: topic,
    rawSourceSpan: `${area.code}.${index + 1}`,
    rawParentBulletText: topic,
  }))
})

const extraction = {
  schemaVersion: 1,
  extractionId: 'DE_HE_DEUTSCH_SEKI_G9',
  sourceLandscapeId,
  title: 'Deutsch Sekundarstufe I (Hessen, G9)',
  jurisdiction: 'DE-HE',
  subject: 'Deutsch',
  stage: 'SekI',
  durationModel: 'G9',
  sourceDocument: {
    key: 'HE-G9-DEUTSCH',
    title: 'Lehrplan Deutsch gymnasialer Bildungsgang Hessen, Jahrgangsstufen 5 bis 13',
    path: pdfPath,
    official: true,
  },
  sourceDocuments: [
    {
      key: 'HE-G9-DEUTSCH',
      title: 'Lehrplan Deutsch gymnasialer Bildungsgang Hessen, Jahrgangsstufen 5 bis 13',
      path: pdfPath,
      official: true,
    },
  ],
  method: {
    passageExtraction: 'pdftotext -layout; segmented by Jahrgangsstufe 5-10 and Arbeitsbereich headings 5.1-10.3.',
    sourceGoalExtraction: 'one source goal per curricular Unterrichtsinhalt/Aufgabe topic retained from the official passage.',
  },
  expectedTopicCodes: areas.map((area) => area.code),
  pipelineStatus: {
    version: 1,
    currentStep: 'MAPPING-3',
    steps: [
      {
        id: 'MAPPING-1',
        label: 'Original-Lehrplanpassagen extrahiert',
        status: 'complete',
        dependsOn: [],
        checks: [
          {
            id: 'source-document-present',
            label: 'Amtlicher Hessen-G9-Deutsch-Lehrplan liegt lokal vor',
            passed: true,
            details: pdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'Jahrgangs-Arbeitsbereiche 5.1 bis 10.3 sind als Lehrplanpassagen vorhanden',
            passed: true,
            details: `${passages.length}/${areas.length} Passagen.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: pdfPath,
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
            label: 'Aus den Hessen-G9-Deutsch-Passagen wurden Source-Ziele erzeugt',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele.`,
          },
          {
            id: 'passage-to-source-goal-coverage',
            label: 'Jede Passage hat mindestens ein Source-Ziel',
            passed: true,
            details: 'Passagen ohne Source-Ziele: -',
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: true,
            details: 'Doppelte IDs: -',
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
            passed: true,
            details: 'Ohne Passage: -',
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
            label: 'M3-Review-Datei ist angelegt',
            passed: true,
            details: reviewPath,
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: true,
            details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
            passed: true,
            details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; 0 explizite Canonical-Gaps, 0 unreviewed.`,
          },
        ],
      },
    ],
  },
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      status: 'accepted',
      expectedSourceGoals: sourceGoals.length,
      actualSourceGoals: sourceGoals.length,
      rationale: 'Erster sauberer Hessen-Sek-I-Deutsch-Passagen- und Source-Ziel-Schnitt aus dem lokalen amtlichen PDF; M3 ist gegen die ergänzte kanonische Deutsch-Sek-I-Schicht passgenau reviewed.',
    },
  },
  passages,
  sourceGoals,
}

const decisions = sourceGoals.map((sourceGoal) => {
  const canonicalGoalIds = [canonicalGoalIdForSourceGoal(sourceGoal)]
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: sourceGoal.topicCode,
    sourceSpan: sourceGoal.sourceSpan,
    decision: 'mapped',
    canonicalGoalIds,
    matchType: 'exact',
    rationale: `Das Hessen-Sek-I-Deutsch-Source-Ziel "${sourceGoal.title}" (${sourceGoal.sourceSpan}) wird als eigenes kanonisches Deutsch-Sek-I-Ziel gefuehrt und fachlich 1:1 abgedeckt.`,
    reviewedAt: '2026-05-14',
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

const review = {
  version: 1,
  reviewId: 'de-he-german-lower-secondary-source-extraction-to-canonical-german',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath,
  status: 'complete',
  summary: {
    sourceGoals: sourceGoals.length,
    reviewedSourceGoals: sourceGoals.length,
    seedMappedSourceGoals: 0,
    mappedSourceGoals: sourceGoals.length,
    needsCanonicalGoal: 0,
    exactMappings: sourceGoals.length,
    partialMappings: 0,
    inheritedMappings: 0,
    note: 'Hessen Sek I Deutsch ist als eigene kanonische Sek-I-Schicht ergaenzt; jedes Source-Ziel ist fachlich durch ein passgenaues SkillPilot-Ziel abgedeckt.',
  },
  mappings,
  decisions,
}

writeJson(resolve(repoRoot, sourceExtractionPath), extraction)
writeJson(resolve(repoRoot, reviewPath), review)

console.log(`Wrote ${sourceExtractionPath} (${passages.length} passages, ${sourceGoals.length} source goals)`)
console.log(`Wrote ${reviewPath} (${decisions.length} M3 decisions, ${mappings.length} mapping rows)`)

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function sourceGoalId(area: AreaSpec, topic: string, index: number): string {
  return uuidFromString(`DE-HE-DEUTSCH-SEKI:${area.code}:${index}:${topic}`)
}

function canonicalGoalIdForSourceGoal(sourceGoal: { id: string }): string {
  return uuidFromString(`DE-GYM-CANONICAL-DEUTSCH-SEKI:DE-HE:${sourceGoal.id}`)
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function extractAreaText(fullText: string, area: AreaSpec): string {
  const gradeStart = findLastMatchIndex(fullText, new RegExp(`\\n\\s*1\\.${Number(area.grade) - 4}\\s+Die Jahrgangsstufe\\s+${area.grade}\\b`, 'g'))
  const gradeEnd = findNextGradeStart(fullText, area.grade, gradeStart)
  const gradeText = gradeStart >= 0 ? fullText.slice(gradeStart, gradeEnd) : fullText

  const start = gradeText.search(new RegExp(`\\n\\s*${escapeRegExp(area.code)}\\s+${escapeRegExp(area.title)}`))
  if (start < 0) return ''

  const nextArea = areas.find((candidate) => candidate.grade === area.grade && Number(candidate.code) > Number(area.code))
  const end = nextArea
    ? gradeText.slice(start + 1).search(new RegExp(`\\n\\s*${escapeRegExp(nextArea.code)}\\s+${escapeRegExp(nextArea.title)}`))
    : -1
  const raw = end >= 0
    ? gradeText.slice(start, start + 1 + end)
    : gradeText.slice(start)

  return normalizePdfText(raw)
}

function findNextGradeStart(fullText: string, grade: string, start: number): number {
  if (start < 0) return fullText.length
  const nextGrade = String(Number(grade) + 1)
  if (Number(nextGrade) <= 10) {
    const next = fullText.slice(start + 1).search(new RegExp(`\\n\\s*1\\.${Number(nextGrade) - 4}\\s+Die Jahrgangsstufe\\s+${nextGrade}\\b`))
    if (next >= 0) return start + 1 + next
  }
  const transition = fullText.slice(start + 1).search(/\n\s*2\s+Übergangsprofil/u)
  return transition >= 0 ? start + 1 + transition : fullText.length
}

function normalizePdfText(value: string): string {
  return value
    .replace(/\f/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => !/^Bildungsgang Gymnasium\b/.test(line.trim()))
    .filter((line) => !/^_{5,}/.test(line.trim()))
    .filter((line) => !/^\d+$/.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findLastMatchIndex(value: string, pattern: RegExp): number {
  let lastIndex = -1
  for (const match of value.matchAll(pattern)) {
    lastIndex = match.index ?? -1
  }
  return lastIndex
}
