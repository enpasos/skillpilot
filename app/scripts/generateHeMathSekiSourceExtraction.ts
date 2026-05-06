import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')
const sourceLandscapeId = 'b167b4cd-4b78-4c84-a721-6b2adbbcab3c'

const kcPdfPath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/input/HE/lower-secondary/kerncurriculum_mathematik_gymnasium.pdf')
const g9PdfPath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-mathematik.pdf')
const leitfadenPdfPath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/input/HE/lower-secondary/leitfaden_mathematik_sekundarstufe_i.pdf')
const outputPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G9.source-extraction.json',
)
const canonicalMathPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const mappingReviewPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json',
)

type PipelineState = 'complete' | 'incomplete' | 'blocked'

type SourceDocumentKey = 'KC' | 'G9' | 'LEITFADEN'

type Passage = {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  sourceDocumentKey: SourceDocumentKey
  goalBearing: boolean
}

type SourceGoal = {
  id: string
  passageId: string
  topicCode: string
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  granularity: 'officialContentFocus' | 'legacyGradeTopicFocus' | 'competencyExpectation'
  tags: string[]
  requires: string[]
  contains: string[]
  type: 'atomic'
}

type PipelineCheck = {
  id: string
  label: string
  passed: boolean
  details: string
}

type PipelineStep = {
  id: 'MAPPING-1' | 'MAPPING-2' | 'MAPPING-3'
  label: string
  status: PipelineState
  dependsOn: string[]
  checks: PipelineCheck[]
}

type KcContentPassageSpec = {
  rowCode: string
  rowTitle: string
  stage: 'J5_6' | 'J7_8' | 'J9_10'
  stageLabel: string
  page: number
  items: string[]
}

type KcCompetencySpec = {
  section: 'KC-7.1' | 'KC-7.2' | 'KC-6'
  stage: 'J5_6' | 'J7_8' | 'J9_10'
  stageLabel: string
  page: number
  area: string
  items: string[]
}

type MappingReviewDecision = {
  sourceGoalId?: unknown
  decision?: unknown
  canonicalGoalIds?: unknown
}

type MappingReviewDocument = {
  decisions?: MappingReviewDecision[]
  mappings?: Array<{
    legacyGoalId?: unknown
    canonicalGoalId?: unknown
  }>
}

type CanonicalMathDocument = {
  goals?: Array<{
    id?: unknown
  }>
}

const toPosix = (value: string): string => value.split(path.sep).join('/')
const repoPath = (absolutePath: string): string => toPosix(path.relative(repoRoot, absolutePath))
const mappingReviewRelativePath = repoPath(mappingReviewPath)

const readJsonIfExists = <T>(filePath: string): T | null => {
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T
  } catch {
    return null
  }
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : []

const sourceDocuments = [
  {
    key: 'KC',
    title: 'Kerncurriculum Mathematik - Sekundarstufe I (Gymnasium)',
    path: repoPath(kcPdfPath),
    role: 'binding-core',
    url: 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf',
  },
  {
    key: 'G9',
    title: 'Lehrplan Gymnasium G9 Mathematik',
    path: repoPath(g9PdfPath),
    role: 'legacy-grade-sequencing-reference',
    url: 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf',
  },
  {
    key: 'LEITFADEN',
    title: 'Leitfaden Mathematik - Sekundarstufe I',
    path: repoPath(leitfadenPdfPath),
    role: 'implementation-guide',
    url: 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/leitfaden_mathematik_sekundarstufe_i.pdf',
  },
] as const

const normalizeGermanText = (value: string): string =>
  value
    .replace(/Ã„/gu, 'Ä')
    .replace(/Ã–/gu, 'Ö')
    .replace(/Ãœ/gu, 'Ü')
    .replace(/Ã¤/gu, 'ä')
    .replace(/Ã¶/gu, 'ö')
    .replace(/Ã¼/gu, 'ü')
    .replace(/ÃŸ/gu, 'ß')
    .replace(/â€“/gu, '–')
    .replace(/â€”/gu, '—')
    .replace(/â€ž/gu, '„')
    .replace(/â€œ/gu, '“')
    .replace(/â€™/gu, '’')
    .replace(/Â/gu, '')
    .normalize('NFC')

const normalizeLine = (value: string): string =>
  normalizeGermanText(value)
    .replace(/\u00a0/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()

const normalizeForSearch = (value: string): string =>
  normalizeGermanText(value)
    .replace(/(\p{L})-\s+(\p{Ll})/gu, '$1$2')
    .replace(/\s+/gu, ' ')
    .trim()

const latexify = (value: string): string =>
  normalizeGermanText(value)
    .replace(/2×2/gu, String.raw`$2\times2$`)
    .replace(/\bπ\b/gu, String.raw`$\pi$`)
    .replace(/\bsin\b/gu, String.raw`$\sin$`)
    .replace(/\bcos\b/gu, String.raw`$\cos$`)
    .replace(/\btan\b/gu, String.raw`$\tan$`)

const ensurePdf = (pdfPath: string, url: string): void => {
  if (existsSync(pdfPath)) return
  mkdirSync(path.dirname(pdfPath), { recursive: true })
  execFileSync('curl', ['-L', '--fail', '--silent', '--show-error', '-o', pdfPath, url], { stdio: 'inherit' })
}

const readPdfText = (pdfPath: string, url: string): string => {
  ensurePdf(pdfPath, url)
  return normalizeGermanText(execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' }))
}

const compactTitle = (value: string): string => {
  const cleaned = latexify(value)
    .replace(/\s+/gu, ' ')
    .replace(/[.;,]\s*$/u, '')
    .trim()
  return cleaned.length <= 95 ? cleaned : `${cleaned.slice(0, 92).trim()}...`
}

const slug = (value: string): string =>
  normalizeGermanText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/ß/gu, 'ss')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')

const stableSourceGoalId = (passageId: string, index: number, sourceText: string): string => {
  const digest = createHash('sha1')
    .update(`${sourceLandscapeId}:${passageId}:${index}:${sourceText}`)
    .digest('hex')
    .slice(0, 8)
  return `he-math-seki-${slug(passageId).slice(0, 42)}-${String(index + 1).padStart(2, '0')}-${digest}`
}

const kcContentSpecs: KcContentPassageSpec[] = [
  {
    rowCode: 'ZAHLEN',
    rowTitle: 'Zahlen',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 26,
    items: [
      'Natürliche Zahlen',
      'Vorstellungsaufbau im Bereich der negativen Zahlen',
      'Brüche als Teil eines Ganzen, als Teil mehrerer Ganzer, als Maßzahl und zur Beschreibung von Verhältnissen',
      'Dezimalbrüche (abbrechend, periodisch) und Begründung für Abbruch bzw. Periodizität',
      'Einfache Prozentangaben',
      'Vergleichen, Ordnen von natürlichen und gebrochenen Zahlen (gewöhnliche Brüche, Dezimalbrüche)',
      'Runden von natürlichen Zahlen und Dezimalbrüchen',
      'Teilbarkeit, Teiler und Vielfache (ggT, kgV, Primzahlen)',
      'Darstellungen (Zahlenstrahl, Kreisdiagramm)',
    ],
  },
  {
    rowCode: 'ZAHLEN',
    rowTitle: 'Zahlen',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 26,
    items: [
      'Rationale Zahlen',
      'Reelle Zahlen (Wurzeln und die Zahl π als Proportionalitätsfaktor)',
      'Darstellungen (Zahlengerade, Dezimalbrüche)',
      'Vergleichen, Ordnen und Runden von rationalen und reellen Zahlen',
      'Orientierung im zweidimensionalen Koordinatensystem',
    ],
  },
  {
    rowCode: 'OPERATIONEN',
    rowTitle: 'Operationen und ihre Eigenschaften',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 26,
    items: [
      'Grundrechenarten und Rechengesetze für natürliche und gebrochene Zahlen',
      'Strategien zum vorteilhaften Rechnen',
      'Grundaufgaben der Bruchrechnung und der Prozentrechnung',
    ],
  },
  {
    rowCode: 'OPERATIONEN',
    rowTitle: 'Operationen und ihre Eigenschaften',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 27,
    items: [
      'Rechenverfahren, Rechengesetze und deren Verknüpfungen im Bereich der rationalen und reellen Zahlen',
      'Klammern, Binome',
      'Potenzen mit rationalen Exponenten',
      'Terme und Variable',
      'Grundaufgaben der Prozent- und Zinsrechnung',
      'Prozentrechnen mit erhöhtem und vermindertem Grundwert',
      'Prozente von Prozenten',
    ],
  },
  {
    rowCode: 'EBENE-FIGUREN',
    rowTitle: 'Ebene Figuren',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 27,
    items: [
      'Grundfiguren (Quadrat, Rechteck, Dreieck, Kreis) und zusammengesetzte Flächen',
      'Konstruktion von Figuren und Mustern',
      'Symmetrieeigenschaften (Achsen- und Drehsymmetrie) von Grundfiguren',
      'Kartesisches Koordinatensystem im ersten Quadranten',
    ],
  },
  {
    rowCode: 'EBENE-FIGUREN',
    rowTitle: 'Ebene Figuren',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 27,
    items: [
      'Grundfiguren (Parallelogramm, Trapez, Raute, Drachen, Kreis)',
      'Haus der Vierecke',
      'Konstruktionen mit Zeichengeräten und dynamischer Geometriesoftware',
      'Symmetrieeigenschaften von Figuren',
      'Kartesisches Koordinatensystem in allen vier Quadranten',
    ],
  },
  {
    rowCode: 'KOERPER',
    rowTitle: 'Körper',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 27,
    items: [
      'Grundkörper (Quader, Würfel) und zusammengesetzte Körper',
      'Beschreibung von Volumen und Oberflächeninhalt der Grundkörper',
      'Modelle, Schrägbilder und Netze der Grundkörper',
    ],
  },
  {
    rowCode: 'KOERPER',
    rowTitle: 'Körper',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 27,
    items: [
      'Grundkörper (Prisma, Kreiszylinder)',
      'Beschreibung von Volumen und Oberflächeninhalt beim Prisma',
      'Modelle, Schrägbilder und Netze bekannter Körper',
    ],
  },
  {
    rowCode: 'KOERPER',
    rowTitle: 'Körper',
    stage: 'J9_10',
    stageLabel: 'Jahrgangsstufe 9/10',
    page: 27,
    items: [
      'Grundkörper (Pyramide, Kegel, Kugel)',
      'Körper aus der Technik und der Lebensumwelt',
      'Beschreibung von Volumen und Oberflächeninhalt bei Pyramide, Kegel, Kugel',
      'Modelle, Schrägbilder und Netze bekannter Körper',
    ],
  },
  {
    rowCode: 'BEZIEHUNGEN-GEOMETRISCHER-OBJEKTE',
    rowTitle: 'Beziehungen zwischen geometrischen Objekten',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 27,
    items: [
      'Fachbegriffe parallel, senkrecht, Abstand',
      'Bewegungen von Figuren: Drehungen, Spiegelungen, Verschiebungen',
    ],
  },
  {
    rowCode: 'BEZIEHUNGEN-GEOMETRISCHER-OBJEKTE',
    rowTitle: 'Beziehungen zwischen geometrischen Objekten',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 27,
    items: [
      'Fachbegriffe (Kongruenz, Symmetrie)',
      'Satz des Pythagoras und seine Umkehrung einschließlich exemplarischer vollständiger Beweise',
      'Satz des Thales',
      'Ähnlichkeit, zentrische Streckungen, Strahlensätze',
    ],
  },
  {
    rowCode: 'BEZIEHUNGEN-GEOMETRISCHER-OBJEKTE',
    rowTitle: 'Beziehungen zwischen geometrischen Objekten',
    stage: 'J9_10',
    stageLabel: 'Jahrgangsstufe 9/10',
    page: 27,
    items: [
      'Trigonometrischen Beziehungen (sin, cos, tan) bei rechtwinkligen und allgemeinen Dreiecken',
    ],
  },
  {
    rowCode: 'UMGANG-MIT-GROESSEN',
    rowTitle: 'Umgang mit Größen',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 28,
    items: [
      'Größenvorstellungen',
      'Einheitsquadrat, Einheitswürfel',
      'Repräsentanten, Schätzungen und Überschlagsrechnungen',
      'Runden',
      'Umrechnung von Größen',
      'Vorsilben von Einheiten',
    ],
  },
  {
    rowCode: 'UMGANG-MIT-GROESSEN',
    rowTitle: 'Umgang mit Größen',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 28,
    items: [
      'Zusammengesetzte Figuren',
      'Größen von Winkeln (Minuten, Sekunden)',
      'Winkelsummensatz und die Winkelsätze an Geradenkreuzungen',
    ],
  },
  {
    rowCode: 'MESSVORGAENGE',
    rowTitle: 'Messvorgänge',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 28,
    items: [
      'Länge',
      'Masse/Gewichte',
      'Währung/Geld',
      'Zeitspanne',
      'Winkel',
      'Flächeninhalt und Umfang von Quadrat und Rechteck',
      'Volumen und Oberflächeninhalt der Grundkörper',
    ],
  },
  {
    rowCode: 'MESSVORGAENGE',
    rowTitle: 'Messvorgänge',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 28,
    items: [
      'Flächeninhalt und Umfang von Dreieck, Parallelogramm, Trapez, Raute, Drachen, Kreis',
      'Volumen und Oberflächeninhalt beim Prisma',
    ],
  },
  {
    rowCode: 'MESSVORGAENGE',
    rowTitle: 'Messvorgänge',
    stage: 'J9_10',
    stageLabel: 'Jahrgangsstufe 9/10',
    page: 28,
    items: [
      'Berechnungen in Dreiecken und Vielecken (Anwendungen aus Technik und Physik)',
      'Volumen und Oberflächeninhalt bei Pyramide, Kegel, Zylinder, Kugel',
    ],
  },
  {
    rowCode: 'ZUORDNUNGEN',
    rowTitle: 'Zuordnungen und ihre Darstellungen',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 28,
    items: [
      'Grundvorstellungen zu Zuordnungen von Größen',
      'Darstellung der Zuordnungen in Schaubildern und Tabellen und in sprachlicher Form',
    ],
  },
  {
    rowCode: 'ZUORDNUNGEN',
    rowTitle: 'Zuordnungen und ihre Darstellungen',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 28,
    items: [
      'Proportionale und antiproportionale Zuordnungen und ihre Eigenschaften',
      'Dreisatzmethoden',
      'Darstellung der proportionalen und antiproportionalen Zuordnungen in sprachlicher, tabellarischer und graphischer Form',
    ],
  },
  {
    rowCode: 'ZUORDNUNGEN',
    rowTitle: 'Zuordnungen und ihre Darstellungen',
    stage: 'J9_10',
    stageLabel: 'Jahrgangsstufe 9/10',
    page: 28,
    items: [
      'Grundvorstellungen zu nicht-proportionalen funktionalen Zusammenhängen',
      'Darstellung der Zuordnungen in sprachlicher, tabellarischer oder graphischer Form',
    ],
  },
  {
    rowCode: 'FUNKTIONEN-GLEICHUNGEN',
    rowTitle: 'Funktionen und Gleichungen',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 29,
    items: [
      'Lösen von linearen Gleichungen',
      'Vergleich des Vorgehens beim Lösen von linearen Gleichungen',
      'Lineare Funktionen und ihre Eigenschaften',
      'Lösen von Ungleichungen',
    ],
  },
  {
    rowCode: 'FUNKTIONEN-GLEICHUNGEN',
    rowTitle: 'Funktionen und Gleichungen',
    stage: 'J9_10',
    stageLabel: 'Jahrgangsstufe 9/10',
    page: 29,
    items: [
      'Lösen von quadratischen Gleichungen',
      'Lösen von linearen 2×2-Gleichungssystemen',
      'Einfache Potenzfunktionen',
      'Exponentialfunktionen',
      'Sinusfunktion und ihre wesentlichen Eigenschaften',
      'Darstellung von Funktionen (Funktionsgleichung, Tabelle, Graph)',
    ],
  },
  {
    rowCode: 'STATISTISCHE-ERHEBUNGEN',
    rowTitle: 'statistische Erhebungen und ihre Auswertung',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 29,
    items: [
      'Umfragen und Erhebungen (Planung, Durchführung und statistische Auswertung)',
      'Kenngrößen (Häufigkeiten, Median, arithmetisches Mittel, Spannweite)',
      'Darstellung von Daten (Listen und Diagramme)',
    ],
  },
  {
    rowCode: 'STATISTISCHE-ERHEBUNGEN',
    rowTitle: 'statistische Erhebungen und ihre Auswertung',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 29,
    items: [
      'Darstellung von Daten in Diagrammen (Boxplot, Säulendiagramm, Kreisdiagramm) und Tabellen',
      'Lage- und Streumaße',
    ],
  },
  {
    rowCode: 'UMGANG-ZUFALL',
    rowTitle: 'Umgang mit dem Zufall',
    stage: 'J5_6',
    stageLabel: 'Jahrgangsstufe 5/6',
    page: 29,
    items: [
      'Zufallserscheinungen in alltäglichen Situationen',
      'Verschiedene Vorstellungen vom Wahrscheinlichkeitsbegriff',
      'Absolute und relative Häufigkeiten',
    ],
  },
  {
    rowCode: 'UMGANG-ZUFALL',
    rowTitle: 'Umgang mit dem Zufall',
    stage: 'J7_8',
    stageLabel: 'Jahrgangsstufe 7/8',
    page: 29,
    items: [
      'Zweistufige Zufallsexperimente',
      'Baumdiagramme und Vierfeldertafeln',
      'Pfadregeln',
    ],
  },
  {
    rowCode: 'UMGANG-ZUFALL',
    rowTitle: 'Umgang mit dem Zufall',
    stage: 'J9_10',
    stageLabel: 'Jahrgangsstufe 9/10',
    page: 29,
    items: [
      'Mehrstufige Zufallsexperimente',
    ],
  },
]

const kcCompetencySpecs: KcCompetencySpec[] = [
  {
    section: 'KC-7.1',
    stage: 'J5_6',
    stageLabel: 'Ende der Jahrgangsstufe 6',
    page: 22,
    area: 'Darstellen',
    items: [
      'erkennen Grundstrukturen und Grundmuster in der Lebensumwelt wieder und stellen sie sachgerecht dar',
      'entwickeln Darstellungen',
      'verwenden unterschiedliche Darstellungsformen und beschreiben Beziehungen zwischen ihnen',
      'vergleichen Darstellungen miteinander und bewerten diese',
    ],
  },
  {
    section: 'KC-7.1',
    stage: 'J5_6',
    stageLabel: 'Ende der Jahrgangsstufe 6',
    page: 22,
    area: 'Kommunizieren',
    items: [
      'beschreiben Vorgehensweisen',
      'vollziehen mathematische Argumentationen anderer nach und überprüfen sie',
      'präsentieren, erläutern und überprüfen Arbeitsergebnisse sowie die zugrunde liegenden Überlegungen und Strategien',
      'verwenden die eingeführten Fachbegriffe und Darstellungen',
    ],
  },
  {
    section: 'KC-7.1',
    stage: 'J5_6',
    stageLabel: 'Ende der Jahrgangsstufe 6',
    page: 22,
    area: 'Argumentieren',
    items: [
      'hinterfragen und verdeutlichen mathematische Sachverhalte und überprüfen diese',
      'äußern begründete Vermutungen über mathematische Zusammenhänge und stellen Vergleiche an',
      'setzen mathematische Begriffe und deren anschauliche Konkretisierung zueinander in Beziehung',
      'beschreiben, vergleichen und bewerten unterschiedliche Verfahren, Lösungswege und Argumentationen',
    ],
  },
  {
    section: 'KC-7.1',
    stage: 'J5_6',
    stageLabel: 'Ende der Jahrgangsstufe 6',
    page: 23,
    area: 'Umgehen mit symbolischen, formalen und technischen Elementen',
    items: [
      'deuten Variable als Platzhalter in Gleichungen zur symbolischen Darstellung mathematischer Probleme und von Sachsituationen',
      'übersetzen in Sachzusammenhängen Fachsprache in Umgangssprache und umgekehrt und verwenden geeignete Symbole',
      'erstellen einfache Tabellen und Diagramme und entnehmen diesen Daten und Werte',
      'führen Lösungs- und Kontrollverfahren aus',
      'nutzen angemessen die Werkzeugkiste mit Messgeräten, Lineal, Geodreieck und Zirkel',
    ],
  },
  {
    section: 'KC-7.1',
    stage: 'J5_6',
    stageLabel: 'Ende der Jahrgangsstufe 6',
    page: 23,
    area: 'Problemlösen',
    items: [
      'erfassen in Problemsituationen mögliche mathematische Fragestellungen, formulieren diese in eigenen Worten und entwickeln Lösungsideen',
      'wenden heuristische Problemlösestrategien und mathematische Verfahren zur Lösung einfacher Alltagsprobleme an',
      'entnehmen einer anwendungsbezogenen Problemstellung die zu ihrer Lösung relevanten Daten',
      'interpretieren Ergebnisse mit Blick auf das zu lösende Problem',
      'reflektieren Lösungswege',
    ],
  },
  {
    section: 'KC-7.1',
    stage: 'J5_6',
    stageLabel: 'Ende der Jahrgangsstufe 6',
    page: 23,
    area: 'Modellieren',
    items: [
      'entnehmen Sachtexten und Darstellungen aus der Lebenswirklichkeit Informationen',
      'übersetzen Sachprobleme der Realität in mathematische Modelle',
      'arbeiten innerhalb des gewählten mathematischen Modells',
      'interpretieren die im mathematischen Modell gewonnenen Lösungen in der Realsituation und überprüfen sie',
      'bewerten das gewählte Modell',
      'formulieren zu Termen, Gleichungen und bildlichen Darstellungen Sachaufgaben',
    ],
  },
  {
    section: 'KC-7.2',
    stage: 'J7_8',
    stageLabel: 'Ende der Jahrgangsstufe 8',
    page: 24,
    area: 'Darstellen',
    items: [
      'erkennen Grundstrukturen und Grundmuster in der Lebensumwelt wieder und stellen sie sachgerecht dar',
      'entwickeln Darstellungen',
      'erstellen differenzierte und übersichtliche Darstellungsformen und wechseln zwischen ihnen',
      'vergleichen Darstellungen miteinander und bewerten diese',
    ],
  },
  {
    section: 'KC-7.2',
    stage: 'J7_8',
    stageLabel: 'Ende der Jahrgangsstufe 8',
    page: 24,
    area: 'Kommunizieren',
    items: [
      'beschreiben Vorgehensweisen',
      'vergleichen, diskutieren und bewerten unterschiedliche Lösungswege, Argumentationen und Ergebnisse sachgerecht',
      'präsentieren, erläutern und überprüfen Arbeitsergebnisse sowie die zugrunde liegenden Überlegungen und Strategien',
      'verwenden die eingeführten Fachbegriffe und Darstellungen',
    ],
  },
  {
    section: 'KC-7.2',
    stage: 'J7_8',
    stageLabel: 'Ende der Jahrgangsstufe 8',
    page: 24,
    area: 'Argumentieren',
    items: [
      'begründen mathematische Sachverhalte, Regeln und Rechenverfahren und überprüfen diese',
      'äußern begründete Vermutungen über mathematische Zusammenhänge und stellen Vergleiche an',
      'setzen mathematische Begriffe und deren anschauliche Konkretisierung zueinander in Beziehung',
      'vollziehen mathematische Argumentationen nach, bewerten sie und begründen sachgerecht',
    ],
  },
  {
    section: 'KC-7.2',
    stage: 'J7_8',
    stageLabel: 'Ende der Jahrgangsstufe 8',
    page: 25,
    area: 'Umgehen mit symbolischen, formalen und technischen Elementen',
    items: [
      'stellen einfache Sachzusammenhänge durch Funktionen dar',
      'übersetzen in Sachzusammenhängen Fachsprache in Umgangssprache und umgekehrt und verwenden geeignete Symbole',
      'nutzen Software zur Darstellung und Manipulation funktionaler Zusammenhänge',
      'führen Lösungs- und Kontrollverfahren aus',
      'setzen mathematische Werkzeuge sinnvoll und verständig ein',
    ],
  },
  {
    section: 'KC-7.2',
    stage: 'J7_8',
    stageLabel: 'Ende der Jahrgangsstufe 8',
    page: 25,
    area: 'Problemlösen',
    items: [
      'erfassen in Problemsituationen mögliche mathematische Fragestellungen, formulieren diese in eigenen Worten und entwickeln Lösungsideen',
      'wenden heuristische Problemlösestrategien und mathematische Verfahren bewusst zur Lösung einfacher Alltagsprobleme an',
      'nutzen unterschiedliche Darstellungsformen und Verfahrensweisen zur Problemlösung',
      'entnehmen einer anwendungsbezogenen Problemstellung die zu ihrer Lösung relevanten Daten',
      'interpretieren Ergebnisse mit Blick auf das zu lösende Problem',
      'reflektieren Lösungswege',
    ],
  },
  {
    section: 'KC-7.2',
    stage: 'J7_8',
    stageLabel: 'Ende der Jahrgangsstufe 8',
    page: 25,
    area: 'Modellieren',
    items: [
      'entnehmen Sachtexten und Darstellungen aus der Lebenswirklichkeit relevante Informationen',
      'übersetzen Realsituationen in mathematische Modelle',
      'arbeiten innerhalb des gewählten mathematischen Modells',
      'interpretieren die im mathematischen Modell gewonnenen Lösungen in der Realsituation und modifizieren ggf. das verwendete Modell',
      'bewerten das gewählte Modell',
      'geben für mathematische Modelle typische Realsituationen an',
    ],
  },
  {
    section: 'KC-6',
    stage: 'J9_10',
    stageLabel: 'Ende der Jahrgangsstufe 9/10',
    page: 17,
    area: 'Darstellen',
    items: [
      'wählen die Darstellungsform adressatengerecht und sachangemessen aus und bereiten sie präsentationsgerecht auf',
      'entwickeln Darstellungen',
      'erkennen Beziehungen zwischen verschiedenen Darstellungsformen und wechseln zwischen ihnen',
      'interpretieren und bewerten Darstellungen',
    ],
  },
  {
    section: 'KC-6',
    stage: 'J9_10',
    stageLabel: 'Ende der Jahrgangsstufe 9/10',
    page: 17,
    area: 'Kommunizieren',
    items: [
      'beschreiben Vorgehensweisen',
      'stellen unterschiedliche Lösungswege vor, erläutern, vergleichen und bewerten diese',
      'dokumentieren Überlegungen, Lösungswege bzw. Ergebnisse, stellen diese adressatengerecht dar und präsentieren sie, auch unter Nutzung geeigneter Medien',
      'verwenden die Fachsprache adressatengerecht',
    ],
  },
  {
    section: 'KC-6',
    stage: 'J9_10',
    stageLabel: 'Ende der Jahrgangsstufe 9/10',
    page: 17,
    area: 'Argumentieren',
    items: [
      'stellen Fragen nach Verallgemeinerung und Spezifikation mathematischer Sachverhalte und prüfen diese auf Korrektheit',
      'äußern begründete Vermutungen über mathematische Zusammenhänge und stellen Vergleiche an',
      'analysieren, erläutern und begründen mathematische Aussagen und Verfahren auch durch mehrschrittige Argumentationsketten',
      'vollziehen mathematische Argumentationen nach, bewerten sie und begründen sachgerecht',
    ],
  },
  {
    section: 'KC-6',
    stage: 'J9_10',
    stageLabel: 'Ende der Jahrgangsstufe 9/10',
    page: 17,
    area: 'Umgehen mit symbolischen, formalen und technischen Elementen',
    items: [
      'arbeiten formal mit Variablen, Termen und Gleichungen',
      'übersetzen in Sachzusammenhängen Fachsprache in Umgangssprache und umgekehrt und verwenden geeignete Symbole',
      'erstellen Tabellen und Diagramme und entnehmen diesen Daten und Werte',
      'führen Lösungs- und Kontrollverfahren aus',
      'setzen mathematische Werkzeuge wie Formelsammlungen, Taschenrechner, Software, Messgeräte sinnvoll und verständig ein',
    ],
  },
  {
    section: 'KC-6',
    stage: 'J9_10',
    stageLabel: 'Ende der Jahrgangsstufe 9/10',
    page: 18,
    area: 'Problemlösen',
    items: [
      'erfassen in Problemsituationen mögliche mathematische Fragestellungen, formulieren diese in eigenen Worten und entwickeln Lösungsideen',
      'wählen geeignete heuristische Hilfsmittel, Strategien und Prinzipien zum Problemlösen aus, wenden sie an und bewerten Lösungswege',
      'nutzen unterschiedliche Darstellungsformen und Verfahrensweisen zur Problemlösung',
      'entnehmen Problemstellungen die relevanten Größen und beschreiben die Abhängigkeit zwischen ihnen',
      'interpretieren Ergebnisse mit Blick auf das zu lösende Problem',
      'reflektieren Lösungswege',
    ],
  },
  {
    section: 'KC-6',
    stage: 'J9_10',
    stageLabel: 'Ende der Jahrgangsstufe 9/10',
    page: 18,
    area: 'Modellieren',
    items: [
      'entnehmen Informationen aus komplexen, nicht vertrauten Situationen und aus unterschiedlichen Informationsquellen',
      'übersetzen mit Hilfe mathematischer Begriffe den Bereich oder die Situation, die modelliert werden soll, in bekannte mathematische Strukturen und Zusammenhänge unter Berücksichtigung von Einflussfaktoren und Abhängigkeiten',
      'arbeiten innerhalb des gewählten mathematischen Modells und übersetzen die Ergebnisse zurück in die Realsituation',
      'prüfen und interpretieren Ergebnisse in Realsituationen unter Einbeziehung einer kritischen Einschätzung des gewählten Modells',
      'bewerten das gewählte Modell',
      'geben für mathematische Modelle typische Realsituationen an',
    ],
  },
]

const kcPassageId = (spec: KcContentPassageSpec): string => `kc-7-3-${slug(spec.rowCode)}-${spec.stage.toLowerCase()}`
const kcTopicCode = (spec: KcContentPassageSpec): string => `KC-7.3.${spec.rowCode}.${spec.stage}`

const buildKcContentPassages = (): Passage[] =>
  kcContentSpecs.map((spec) => ({
    id: kcPassageId(spec),
    topicCode: kcTopicCode(spec),
    title: `KC 7.3 ${spec.rowTitle} · ${spec.stageLabel}`,
    text: [
      `Inhaltsfeld: ${spec.rowTitle}`,
      `Schwerpunktsetzung: ${spec.stageLabel}`,
      '',
      ...spec.items.map((item) => `- ${latexify(item)}`),
    ].join('\n'),
    page: spec.page,
    sourcePath: repoPath(kcPdfPath),
    sourceDocumentKey: 'KC',
    goalBearing: true,
  }))

const buildKcContentSourceGoals = (): SourceGoal[] =>
  kcContentSpecs.flatMap((spec) => {
    const passageId = kcPassageId(spec)
    return spec.items.map((item, index) => {
      const renderedItem = latexify(item)
      return {
        id: stableSourceGoalId(passageId, index, item),
        passageId,
        topicCode: kcTopicCode(spec),
        title: compactTitle(item),
        description: `Die lernende Person kann den im Kerncurriculum ausgewiesenen Schwerpunkt "${renderedItem}" im Kontext ${spec.rowTitle} (${spec.stageLabel}) fachgerecht bearbeiten.`,
        sourceText: renderedItem,
        sourceSpan: renderedItem,
        parentBulletText: renderedItem,
        sourceRef: `Kerncurriculum Mathematik Sek I Gymnasium, Kap. 7.3, ${spec.rowTitle}, ${spec.stageLabel}`,
        granularity: 'officialContentFocus',
        tags: [
          'source:DE-HE',
          'sourceDocument:KC',
          'subject:Mathematik',
          'stage:SekI',
          `kc:7.3`,
          `contentField:${slug(spec.rowTitle)}`,
          `gradeBand:${spec.stage}`,
        ],
        requires: [],
        contains: [],
        type: 'atomic',
      } satisfies SourceGoal
    })
  })

const kcCompetencyPassageId = (spec: KcCompetencySpec): string =>
  `kc-${spec.section.toLowerCase().replace(/^kc-/u, '').replace(/\./gu, '-')}-${slug(spec.area)}`
const kcCompetencyTopicCode = (spec: KcCompetencySpec): string =>
  `${spec.section}.${slug(spec.area).toUpperCase()}.${spec.stage}`

const buildKcCompetencyPassages = (): Passage[] =>
  kcCompetencySpecs.map((spec) => ({
    id: kcCompetencyPassageId(spec),
    topicCode: kcCompetencyTopicCode(spec),
    title: `${spec.section} ${spec.area} · ${spec.stageLabel}`,
    text: [
      `Kompetenzbereich: ${spec.area}`,
      `Kompetenzerwartung: ${spec.stageLabel}`,
      '',
      ...spec.items.map((item) => `- ${latexify(item)}`),
    ].join('\n'),
    page: spec.page,
    sourcePath: repoPath(kcPdfPath),
    sourceDocumentKey: 'KC',
    goalBearing: true,
  }))

const buildKcCompetencySourceGoals = (): SourceGoal[] =>
  kcCompetencySpecs.flatMap((spec) => {
    const passageId = kcCompetencyPassageId(spec)
    return spec.items.map((item, index) => {
      const renderedItem = latexify(item)
      return {
        id: stableSourceGoalId(passageId, index, item),
        passageId,
        topicCode: kcCompetencyTopicCode(spec),
        title: compactTitle(item),
        description: `Die lernende Person kann die im Kerncurriculum ausgewiesene prozessbezogene Kompetenzerwartung "${renderedItem}" im Bereich ${spec.area} (${spec.stageLabel}) fachgerecht ausführen.`,
        sourceText: renderedItem,
        sourceSpan: renderedItem,
        parentBulletText: renderedItem,
        sourceRef: `Kerncurriculum Mathematik Sek I Gymnasium, ${spec.section}, ${spec.area}, ${spec.stageLabel}`,
        granularity: 'competencyExpectation',
        tags: [
          'source:DE-HE',
          'sourceDocument:KC',
          'subject:Mathematik',
          'stage:SekI',
          `kc:${spec.section.replace(/^KC-/u, '')}`,
          `competencyArea:${slug(spec.area)}`,
          `gradeBand:${spec.stage}`,
        ],
        requires: [],
        contains: [],
        type: 'atomic',
      } satisfies SourceGoal
    })
  })

const isG9SourceGoalLine = (line: string): boolean =>
  line.length >= 14
  && !line.includes('Bildungsgang Gymnasium')
  && !line.includes('Unterrichtsfach Mathematik')
  && !g9ChromeLinePattern.test(line)

const compactG9SourceGoalLines = (text: string): string[] => {
  const lines = text
    .split(/\n/u)
    .map(normalizeLine)
    .filter(isG9SourceGoalLine)
  const chunks: string[] = []

  for (const line of lines) {
    const previous = chunks[chunks.length - 1]
    const shouldJoin = Boolean(previous)
      && (
        /^[a-zäöüß(]/u.test(line)
        || /^[-–]/u.test(line)
        || line.length < 22
        || /[,(/-]\s*$/u.test(previous ?? '')
      )
    if (shouldJoin) {
      chunks[chunks.length - 1] = `${previous} ${line}`
    } else {
      chunks.push(line)
    }
  }

  return chunks
}

const buildG9SourceGoals = (passagesToExtract: Passage[]): SourceGoal[] =>
  passagesToExtract.flatMap((passage) => {
    const grade = passage.topicCode.match(/^G9-(\d+)/u)?.[1] ?? 'unknown'
    return compactG9SourceGoalLines(passage.text).map((line, index) => {
      const renderedLine = latexify(line)
      return {
        id: stableSourceGoalId(passage.id, index, line),
        passageId: passage.id,
        topicCode: passage.topicCode,
        title: compactTitle(line),
        description: `Die lernende Person kann den im G9-Lehrplan ausgewiesenen Schwerpunkt "${renderedLine}" im Kontext ${passage.title} fachgerecht bearbeiten.`,
        sourceText: renderedLine,
        sourceSpan: renderedLine,
        parentBulletText: renderedLine,
        sourceRef: `Lehrplan Gymnasium G9 Mathematik, ${passage.title}`,
        granularity: 'legacyGradeTopicFocus',
        tags: [
          'source:DE-HE',
          'sourceDocument:G9',
          'subject:Mathematik',
          'stage:SekI',
          'legacy:G9',
          `grade:${grade}`,
        ],
        requires: [],
        contains: [],
        type: 'atomic',
      } satisfies SourceGoal
    })
  })

const g9HeadingPattern = /^\s*((?:[5-9]|10)\.\d+)\s+(.+?)\s+Std\.\s*:\s*(\d+)\s*$/u
const g9ChromeLinePattern = /^(?:Bildungsgang Gymnasium|Unterrichtsfach Mathematik|\d+)$/u

const cleanG9TopicText = (lines: string[]): string => {
  const normalizedLines = lines
    .map((line) => line.replace(/\r/gu, ''))
    .map((line) => normalizeGermanText(line))
  const startIndex = normalizedLines.findIndex((line) => line.includes('Verbindliche Unterrichtsinhalte/Aufgaben'))
  if (startIndex < 0) return ''
  const endIndex = normalizedLines.findIndex((line, index) =>
    index > startIndex
    && (
      line.includes('Fakultative Unterrichtsinhalte/Aufgaben')
      || line.includes('Arbeitsmethoden der Schülerinnen und Schüler')
      || line.includes('Querverweise:')
    ))
  const relevant = normalizedLines.slice(startIndex + 1, endIndex > startIndex ? endIndex : undefined)
    .join('\n')
    .replace(/(\p{L})-\s*\n\s*(\p{Ll})/gu, '$1$2')
    .split(/\n/u)
    .map(normalizeLine)
    .filter((line) => line && !g9ChromeLinePattern.test(line))

  return relevant.join('\n')
}

const extractG9Passages = (pdfText: string): Passage[] => {
  const passages: Passage[] = []
  let current: { topicCode: string; title: string; page: number; lines: string[] } | null = null

  const flush = () => {
    if (!current) return
    const text = cleanG9TopicText(current.lines)
    if (text.length > 80) {
      passages.push({
        id: `g9-${current.topicCode.replace(/\./gu, '-')}`,
        topicCode: `G9-${current.topicCode}`,
        title: `G9 ${current.topicCode} ${current.title}`,
        text,
        page: current.page,
        sourcePath: repoPath(g9PdfPath),
        sourceDocumentKey: 'G9',
        goalBearing: true,
      })
    }
    current = null
  }

  pdfText.split(/\f/u).forEach((page, pageIndex) => {
    for (const line of page.split(/\n/u)) {
      const match = line.match(g9HeadingPattern)
      if (match) {
        flush()
        current = {
          topicCode: match[1] ?? '',
          title: normalizeLine(match[2] ?? ''),
          page: pageIndex + 1,
          lines: [],
        }
        continue
      }
      if (current) current.lines.push(line)
    }
  })
  flush()

  const byTopic = new Map<string, Passage>()
  for (const passage of passages) {
    if (!byTopic.has(passage.topicCode)) byTopic.set(passage.topicCode, passage)
  }
  return [...byTopic.values()].sort((left, right) =>
    left.topicCode.localeCompare(right.topicCode, 'de-DE', { numeric: true }))
}

const buildLeitfadenPassages = (): Passage[] => [
  {
    id: 'leitfaden-kc-fachcurriculum-relation',
    topicCode: 'LEITFADEN-KC-FACHCURRICULUM',
    title: 'Leitfaden: Verhältnis Kerncurriculum, Fachcurriculum und Unterrichtsgestaltung',
    text: [
      'Der Leitfaden beschreibt das Kerncurriculum als hessenweit verbindlichen Bezugspunkt und das Fachcurriculum als schulintern verbindliche Konkretisierung.',
      '',
      '- Kerncurriculum – hessenweit verbindlich',
      '- Fachcurriculum – schulintern verbindlich',
      '- Auswählen und Verknüpfen: Welche Kompetenzen sollen Lernende im Fach erwerben? Was müssen sie dazu wissen und können?',
      '- Konkretisieren und Sequenzieren – bezogen auf Jahrgangsstufen/Doppeljahrgangsstufen',
    ].join('\n'),
    page: 7,
    sourcePath: repoPath(leitfadenPdfPath),
    sourceDocumentKey: 'LEITFADEN',
    goalBearing: false,
  },
  {
    id: 'leitfaden-kc-was-ist-neu',
    topicCode: 'LEITFADEN-WAS-IST-NEU',
    title: 'Leitfaden: Kompetenzorientierung statt reine Themenliste',
    text: [
      'Der Leitfaden grenzt den bisherigen Lehrplan mit jahrgangsbezogenen Unterrichtsthemen vom Kerncurriculum ab.',
      '',
      '- Im Kerncurriculum stehen Kompetenzen als Könnensstandbeschreibungen im Vordergrund.',
      '- Die Kapitel 7.1, 7.2 und 7.3 dienen der detaillierten Orientierung für die Unterrichtsgestaltung.',
      '- Die Verknüpfung von Kompetenzbereichen und fachlichen Inhalten ist Aufgabe der Fachkonferenzen.',
    ].join('\n'),
    page: 15,
    sourcePath: repoPath(leitfadenPdfPath),
    sourceDocumentKey: 'LEITFADEN',
    goalBearing: false,
  },
]

const hasEncodingArtifact = (value: string): boolean => /(?:�|Ã|â€|Â)/u.test(value)

const sourceTextPresenceDetails = (kcText: string, goals: SourceGoal[]): string[] => {
  const searchableKcText = normalizeForSearch(kcText)
  return goals
    .filter((goal) => {
      const plainSource = goal.sourceText
        .replace(/\$\\pi\$/gu, 'π')
        .replace(/\$\\sin\$/gu, 'sin')
        .replace(/\$\\cos\$/gu, 'cos')
        .replace(/\$\\tan\$/gu, 'tan')
        .replace(/\$2\\times2\$/gu, '2×2')
      const tokens = normalizeForSearch(plainSource)
        .replace(/[^\p{L}\p{N}×]+/gu, ' ')
        .split(/\s+/u)
        .filter((token) => token.length >= 4 || /^(ggT|kgV|sin|cos|tan|2×2)$/u.test(token))
      if (tokens.length === 0) return false
      const presentTokens = tokens.filter((token) => searchableKcText.includes(token))
      return presentTokens.length / tokens.length < 0.6
    })
    .map((goal) => `${goal.id}: ${goal.sourceText}`)
}

const plainSourceText = (value: string): string =>
  value
    .replace(/\$\\pi\$/gu, 'π')
    .replace(/\$\\sin\$/gu, 'sin')
    .replace(/\$\\cos\$/gu, 'cos')
    .replace(/\$\\tan\$/gu, 'tan')
    .replace(/\$2\\times2\$/gu, '2×2')

const sourceGoalsMissingInReferencedPassages = (allPassages: Passage[], goals: SourceGoal[]): string[] => {
  const passageById = new Map(allPassages.map((passage) => [passage.id, passage]))
  return goals
    .filter((goal) => {
      const passage = passageById.get(goal.passageId)
      if (!passage) return false
      const searchablePassageText = normalizeForSearch(passage.text)
      const tokens = normalizeForSearch(plainSourceText(goal.sourceText))
        .replace(/[^\p{L}\p{N}×]+/gu, ' ')
        .split(/\s+/u)
        .filter((token) => token.length >= 4 || /^(ggT|kgV|sin|cos|tan|2×2)$/u.test(token))
      if (tokens.length === 0) return false
      const presentTokens = tokens.filter((token) => searchablePassageText.includes(token))
      return presentTokens.length / tokens.length < 0.6
    })
    .map((goal) => `${goal.id}: ${goal.passageId}`)
}

const buildCheck = (id: string, label: string, passed: boolean, details: string): PipelineCheck => ({
  id,
  label,
  passed,
  details,
})

const kcText = readPdfText(kcPdfPath, sourceDocuments[0].url)
const g9Text = readPdfText(g9PdfPath, sourceDocuments[1].url)
const leitfadenText = readPdfText(leitfadenPdfPath, sourceDocuments[2].url)

const kcContentPassages = buildKcContentPassages()
const kcCompetencyPassages = buildKcCompetencyPassages()
const g9Passages = extractG9Passages(g9Text)
const leitfadenPassages = buildLeitfadenPassages()
const sourceGoals = [
  ...buildKcContentSourceGoals(),
  ...buildKcCompetencySourceGoals(),
  ...buildG9SourceGoals(g9Passages),
]
const passages = [...kcContentPassages, ...kcCompetencyPassages, ...g9Passages, ...leitfadenPassages]

const expectedG9TopicCodes = [
  'G9-5.1',
  'G9-5.2',
  'G9-5.3',
  'G9-6.1',
  'G9-6.2',
  'G9-7.1',
  'G9-7.2',
  'G9-7.3',
  'G9-7.4',
  'G9-8.1',
  'G9-8.2',
  'G9-8.3',
  'G9-8.4',
  'G9-9.1',
  'G9-9.2',
  'G9-9.3',
  'G9-9.4',
  'G9-9.5',
  'G9-9.6',
  'G9-9.7',
  'G9-10.1',
  'G9-10.2',
  'G9-10.3',
  'G9-10.4',
  'G9-10.5',
]
const expectedKcContentTopicCodes = kcContentSpecs.map(kcTopicCode)
const expectedKcCompetencyTopicCodes = kcCompetencySpecs.map(kcCompetencyTopicCode)
const expectedKcTopicCodes = [...expectedKcContentTopicCodes, ...expectedKcCompetencyTopicCodes]
const passageTopicCodes = new Set(passages.map((passage) => passage.topicCode))
const missingG9TopicCodes = expectedG9TopicCodes.filter((topicCode) => !passageTopicCodes.has(topicCode))
const missingKcContentTopicCodes = expectedKcContentTopicCodes.filter((topicCode) => !passageTopicCodes.has(topicCode))
const missingKcCompetencyTopicCodes = expectedKcCompetencyTopicCodes.filter((topicCode) => !passageTopicCodes.has(topicCode))
const duplicateSourceGoalIds = [...new Set(sourceGoals
  .map((goal) => goal.id)
  .filter((goalId, index, all) => all.indexOf(goalId) !== index))]
const passageIds = new Set(passages.map((passage) => passage.id))
const sourceGoalsWithoutPassage = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
const kcContentSourceGoals = sourceGoals.filter((goal) => goal.granularity === 'officialContentFocus')
const kcCompetencySourceGoals = sourceGoals.filter((goal) => goal.granularity === 'competencyExpectation')
const g9SourceGoals = sourceGoals.filter((goal) => goal.granularity === 'legacyGradeTopicFocus')
const goalBearingPassagesWithoutSourceGoals = passages
  .filter((passage) => passage.goalBearing)
  .filter((passage) => !sourceGoals.some((goal) => goal.passageId === passage.id))
  .map((passage) => passage.id)
const sourceGoalsMissingInKcText = sourceTextPresenceDetails(kcText, [...kcContentSourceGoals, ...kcCompetencySourceGoals])
const sourceGoalsMissingInPassages = sourceGoalsMissingInReferencedPassages(passages, sourceGoals)
const competencyCoverageKeys = new Set(kcCompetencySourceGoals.map((goal) => {
  const areaTag = goal.tags.find((tag) => tag.startsWith('competencyArea:')) ?? ''
  const gradeBandTag = goal.tags.find((tag) => tag.startsWith('gradeBand:')) ?? ''
  return `${goal.topicCode}:${areaTag}:${gradeBandTag}`
}))
const missingCompetencySpecs = kcCompetencySpecs
  .filter((spec) => !competencyCoverageKeys.has(`${kcCompetencyTopicCode(spec)}:competencyArea:${slug(spec.area)}:gradeBand:${spec.stage}`))
  .map((spec) => `${spec.section} ${spec.area} ${spec.stage}`)
const encodingArtifacts = [
  ...passages.filter((passage) => hasEncodingArtifact(`${passage.title}\n${passage.text}`)).map((passage) => passage.id),
  ...sourceGoals.filter((goal) => hasEncodingArtifact(`${goal.title}\n${goal.description}\n${goal.sourceText}`)).map((goal) => goal.id),
]

const sourceDocumentsPresent = [kcPdfPath, g9PdfPath, leitfadenPdfPath].every((pdfPath) => existsSync(pdfPath))
const leitfadenPolicyPresent = normalizeForSearch(leitfadenText).includes('Kerncurriculum – hessenweit verbindlich')
  || normalizeForSearch(leitfadenText).includes('Kerncurriculum - hessenweit verbindlich')

const mapping1Checks = [
  buildCheck(
    'source-documents-present',
    'Alle offiziellen Sek-I-Quelldokumente liegen lokal vor',
    sourceDocumentsPresent,
    sourceDocuments.map((document) => `${document.key}: ${document.path}`).join('; '),
  ),
  buildCheck(
    'kc-content-passages-present',
    'KC 7.3 Schwerpunktsetzungen sind als Passagen erfasst',
    missingKcContentTopicCodes.length === 0,
    `Erfasst: ${expectedKcContentTopicCodes.length - missingKcContentTopicCodes.length}/${expectedKcContentTopicCodes.length}; fehlend: ${missingKcContentTopicCodes.join(', ') || '-'}`,
  ),
  buildCheck(
    'kc-competency-passages-present',
    'KC 7.1/7.2/6 Kompetenzerwartungen sind als Passagen erfasst',
    missingKcCompetencyTopicCodes.length === 0,
    `Erfasst: ${expectedKcCompetencyTopicCodes.length - missingKcCompetencyTopicCodes.length}/${expectedKcCompetencyTopicCodes.length}; fehlend: ${missingKcCompetencyTopicCodes.join(', ') || '-'}`,
  ),
  buildCheck(
    'g9-topic-passages-present',
    'G9-Jahrgangsthemen 5.1 bis 10.5 sind als Originalpassagen erfasst',
    missingG9TopicCodes.length === 0,
    `Erfasst: ${expectedG9TopicCodes.length - missingG9TopicCodes.length}/${expectedG9TopicCodes.length}; fehlend: ${missingG9TopicCodes.join(', ') || '-'}`,
  ),
  buildCheck(
    'leitfaden-processing-policy-present',
    'Leitfaden-Beleg fuer Kerncurriculum/Fachcurriculum-Verhältnis ist erfasst',
    leitfadenPolicyPresent,
    'Leitfadenpassagen werden als Verarbeitungs- und Plausibilisierungsquelle geführt, nicht als eigenständige Lernzielquelle.',
  ),
  buildCheck(
    'passage-encoding-clean',
    'Umlaute/Encoding und mathematische Anzeigezeichen sind bereinigt',
    encodingArtifacts.length === 0,
    `Auffällige Artefakte: ${encodingArtifacts.slice(0, 10).join(', ') || '-'}`,
  ),
]
const mapping1Complete = mapping1Checks.every((check) => check.passed)

const mapping2Checks = [
  buildCheck(
    'kc-content-source-goals-created',
    'Aus KC-7.3-Schwerpunktsetzungen wurden Source-Ziele erzeugt',
    kcContentSourceGoals.length === kcContentSpecs.reduce((sum, spec) => sum + spec.items.length, 0),
    `${kcContentSourceGoals.length} KC-Inhalts-Source-Ziele`,
  ),
  buildCheck(
    'source-goal-ids-unique',
    'Source-Ziel-IDs sind eindeutig',
    duplicateSourceGoalIds.length === 0,
    `Doppelte IDs: ${duplicateSourceGoalIds.join(', ') || '-'}`,
  ),
  buildCheck(
    'source-goals-reference-passages',
    'Jedes Source-Ziel referenziert eine vorhandene Originalpassage',
    sourceGoalsWithoutPassage.length === 0,
    `Ohne Passage: ${sourceGoalsWithoutPassage.slice(0, 10).join(', ') || '-'}`,
  ),
  buildCheck(
    'source-goals-verbatim-in-passages',
    'Source-Ziele sind in ihren Originalpassagen wiederauffindbar',
    sourceGoalsMissingInPassages.length === 0,
    `Nicht in Passage gefunden: ${sourceGoalsMissingInPassages.slice(0, 8).join('; ') || '-'}`,
  ),
  buildCheck(
    'source-goals-verbatim-in-kc',
    'KC-Source-Ziele sind im Kerncurriculum-Text wiederauffindbar',
    sourceGoalsMissingInKcText.length === 0,
    `Nicht wiedergefunden: ${sourceGoalsMissingInKcText.slice(0, 8).join('; ') || '-'}`,
  ),
  buildCheck(
    'g9-source-goals-created',
    'Aus G9-Jahrgangspassagen wurden granulare Source-Ziele erzeugt',
    goalBearingPassagesWithoutSourceGoals.filter((id) => id.startsWith('g9-')).length === 0 && g9SourceGoals.length > 0,
    `G9-Source-Ziele: ${g9SourceGoals.length}; Passagen ohne Source-Ziele: ${goalBearingPassagesWithoutSourceGoals.filter((id) => id.startsWith('g9-')).slice(0, 12).join(', ') || '-'}`,
  ),
  buildCheck(
    'competency-source-goals-created',
    'Kompetenzerwartungen aus KC 7.1/7.2/6 wurden als Source-Ziele erzeugt',
    missingCompetencySpecs.length === 0 && kcCompetencySourceGoals.length > 0,
    `Kompetenz-Source-Ziele: ${kcCompetencySourceGoals.length}; fehlend: ${missingCompetencySpecs.join(', ') || '-'}`,
  ),
]
const mapping2Complete = mapping1Complete && mapping2Checks.every((check) => check.passed)

const mappingReview = readJsonIfExists<MappingReviewDocument>(mappingReviewPath)
const canonicalMath = readJsonIfExists<CanonicalMathDocument>(canonicalMathPath)
const sourceGoalIdSet = new Set(sourceGoals.map((goal) => goal.id))
const canonicalGoalIdSet = new Set(
  (canonicalMath?.goals ?? [])
    .map((goal) => goal.id)
    .filter((goalId): goalId is string => typeof goalId === 'string' && goalId.trim().length > 0),
)
const mappingReviewDecisions = (mappingReview?.decisions ?? [])
  .filter((decision) => typeof decision.sourceGoalId === 'string')
  .map((decision) => ({
    sourceGoalId: String(decision.sourceGoalId),
    decision: String(decision.decision ?? ''),
    canonicalGoalIds: asStringArray(decision.canonicalGoalIds),
  }))
const validMappingReviewDecisions = mappingReviewDecisions
  .filter((decision) => sourceGoalIdSet.has(decision.sourceGoalId))
const reviewedSourceGoalIds = new Set(validMappingReviewDecisions.map((decision) => decision.sourceGoalId))
const mappedSourceGoalIds = new Set(
  validMappingReviewDecisions
    .filter((decision) => decision.decision === 'mapped' && decision.canonicalGoalIds.length > 0)
    .map((decision) => decision.sourceGoalId),
)
const needsCanonicalGoalIds = validMappingReviewDecisions
  .filter((decision) => decision.decision === 'needs_canonical_goal')
  .map((decision) => decision.sourceGoalId)
const needsViewPlacementReviewIds = validMappingReviewDecisions
  .filter((decision) => decision.decision === 'needs_view_placement_review')
  .map((decision) => decision.sourceGoalId)
const duplicateMappingReviewDecisionIds = Array.from(
  mappingReviewDecisions.reduce((counts, decision) => {
    counts.set(decision.sourceGoalId, (counts.get(decision.sourceGoalId) ?? 0) + 1)
    return counts
  }, new Map<string, number>()),
)
  .filter(([, count]) => count > 1)
  .map(([sourceGoalId]) => sourceGoalId)
const invalidMappingReviewSourceGoalIds = mappingReviewDecisions
  .map((decision) => decision.sourceGoalId)
  .filter((sourceGoalId) => !sourceGoalIdSet.has(sourceGoalId))
const invalidMappingReviewTargetGoalIds = Array.from(new Set(
  validMappingReviewDecisions
    .flatMap((decision) => decision.canonicalGoalIds)
    .filter((canonicalGoalId) => !canonicalGoalIdSet.has(canonicalGoalId)),
))
const mappingEntries = mappingReview?.mappings ?? []
const invalidMappingEntrySourceGoalIds = Array.from(new Set(
  mappingEntries
    .map((entry) => String(entry.legacyGoalId ?? ''))
    .filter((goalId) => !sourceGoalIdSet.has(goalId)),
))
const invalidMappingEntryTargetGoalIds = Array.from(new Set(
  mappingEntries
    .map((entry) => String(entry.canonicalGoalId ?? ''))
    .filter((goalId) => !canonicalGoalIdSet.has(goalId)),
))
const mapping3Checks = [
  buildCheck(
    'mapping-2-complete',
    'MAPPING-2 ist vollständig abgeschlossen',
    mapping2Complete,
    mapping2Complete
      ? 'Source-Ziel-Basis ist bereit für Mapping auf SkillPilot-Ziele.'
      : 'Mapping auf SkillPilot-Ziele bleibt blockiert, bis alle Source-Ziele vollständig erzeugt sind.',
  ),
  buildCheck(
    'm3-review-file-present',
    'M3-Review-Datei ist vorhanden',
    mappingReview !== null,
    mappingReview !== null ? mappingReviewRelativePath : `Fehlt: ${mappingReviewRelativePath}`,
  ),
  buildCheck(
    'm3-review-decisions-reference-source-goals',
    'M3-Review-Entscheidungen referenzieren gültige Source-Ziele',
    duplicateMappingReviewDecisionIds.length === 0 && invalidMappingReviewSourceGoalIds.length === 0,
    `Doppelte Entscheidungen: ${duplicateMappingReviewDecisionIds.join(', ') || '-'}; unbekannte Source-Ziele: ${invalidMappingReviewSourceGoalIds.slice(0, 8).join(', ') || '-'}`,
  ),
  buildCheck(
    'm3-review-targets-exist',
    'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
    invalidMappingReviewTargetGoalIds.length === 0 && invalidMappingEntryTargetGoalIds.length === 0,
    `Unbekannte Review-Targets: ${invalidMappingReviewTargetGoalIds.slice(0, 8).join(', ') || '-'}; unbekannte Mapping-Targets: ${invalidMappingEntryTargetGoalIds.slice(0, 8).join(', ') || '-'}`,
  ),
  buildCheck(
    'm3-mapping-entries-reference-source-goals',
    'Persistierte Mapping-Einträge referenzieren gültige Source-Ziele',
    invalidMappingEntrySourceGoalIds.length === 0,
    `Unbekannte Mapping-Source-Ziele: ${invalidMappingEntrySourceGoalIds.slice(0, 8).join(', ') || '-'}`,
  ),
  buildCheck(
    'm3-all-source-goals-reviewed',
    'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
    reviewedSourceGoalIds.size === sourceGoals.length,
    `${reviewedSourceGoalIds.size}/${sourceGoals.length} Source-Ziele reviewed; gemappt: ${mappedSourceGoalIds.size}; Canonical-Lücken: ${needsCanonicalGoalIds.length}; Placement-Review: ${needsViewPlacementReviewIds.length}`,
  ),
  buildCheck(
    'm3-all-source-goals-covered-by-canonical',
    'Alle akzeptierten Source-Ziele sind durch SkillPilot-Ziele abgedeckt',
    mappedSourceGoalIds.size === sourceGoals.length
      && needsCanonicalGoalIds.length === 0
      && needsViewPlacementReviewIds.length === 0,
    `Abgedeckt: ${mappedSourceGoalIds.size}/${sourceGoals.length}; offene Canonical-Lücken: ${needsCanonicalGoalIds.slice(0, 8).join(', ') || '-'}; Placement-Review: ${needsViewPlacementReviewIds.slice(0, 8).join(', ') || '-'}`,
  ),
]
const mapping3Complete = mapping2Complete && mapping3Checks.every((check) => check.passed)

const pipelineSteps: PipelineStep[] = [
  {
    id: 'MAPPING-1',
    label: 'Original-Lehrplanpassagen extrahiert',
    status: mapping1Complete ? 'complete' : 'incomplete',
    dependsOn: [],
    checks: mapping1Checks,
  },
  {
    id: 'MAPPING-2',
    label: 'Source-Ziele aus Lehrplanpassagen erstellt',
    status: mapping1Complete ? (mapping2Complete ? 'complete' : 'incomplete') : 'blocked',
    dependsOn: ['MAPPING-1'],
    checks: mapping2Checks,
  },
  {
    id: 'MAPPING-3',
    label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
    status: mapping2Complete ? (mapping3Complete ? 'complete' : 'incomplete') : 'blocked',
    dependsOn: ['MAPPING-1', 'MAPPING-2'],
    checks: mapping3Checks,
  },
]

const output = {
  schemaVersion: 1,
  extractionId: 'DE-HE-MATHEMATIK-SEKI-KC-G9',
  sourceLandscapeId,
  jurisdiction: 'DE-HE',
  subject: 'Mathematik',
  stage: 'SekI',
  sourceDocument: sourceDocuments[0],
  sourceDocuments,
  method: {
    passageExtraction: 'pdftotext -layout; KC 7.3 content-field cells are persisted as goal-bearing original passages; G9 topic blocks 5.1-10.5 are extracted from verbindliche Unterrichtsinhalte; Leitfaden passages document the processing policy.',
    sourceGoalExtraction: 'extracts one source goal per literal KC 7.3 content focus, one source goal per KC 7.1/7.2/6 competency expectation bullet, and granular source goals from the verbindliche G9 topic lines.',
  },
  expectedTopicCodes: [...expectedKcTopicCodes, ...expectedG9TopicCodes],
  pipelineStatus: {
    version: 1,
    currentStep: pipelineSteps.find((step) => step.status !== 'complete')?.id ?? '',
    steps: pipelineSteps,
  },
  passages,
  sourceGoals,
}

mkdirSync(path.dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`)

console.log(`Wrote ${passages.length} passages and ${sourceGoals.length} source goals to ${repoPath(outputPath)}`)
console.log(`Pipeline: ${pipelineSteps.map((step) => `${step.id}:${step.status}`).join(', ')}`)
