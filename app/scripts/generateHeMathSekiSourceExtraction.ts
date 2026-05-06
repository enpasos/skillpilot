import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
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
  granularity: 'officialContentFocus'
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

const toPosix = (value: string): string => value.split(path.sep).join('/')
const repoPath = (absolutePath: string): string => toPosix(path.relative(repoRoot, absolutePath))

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

const buildCheck = (id: string, label: string, passed: boolean, details: string): PipelineCheck => ({
  id,
  label,
  passed,
  details,
})

const kcText = readPdfText(kcPdfPath, sourceDocuments[0].url)
const g9Text = readPdfText(g9PdfPath, sourceDocuments[1].url)
const leitfadenText = readPdfText(leitfadenPdfPath, sourceDocuments[2].url)

const kcPassages = buildKcContentPassages()
const g9Passages = extractG9Passages(g9Text)
const leitfadenPassages = buildLeitfadenPassages()
const sourceGoals = buildKcContentSourceGoals()
const passages = [...kcPassages, ...g9Passages, ...leitfadenPassages]

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
const expectedKcTopicCodes = kcContentSpecs.map(kcTopicCode)
const passageTopicCodes = new Set(passages.map((passage) => passage.topicCode))
const missingG9TopicCodes = expectedG9TopicCodes.filter((topicCode) => !passageTopicCodes.has(topicCode))
const missingKcTopicCodes = expectedKcTopicCodes.filter((topicCode) => !passageTopicCodes.has(topicCode))
const duplicateSourceGoalIds = [...new Set(sourceGoals
  .map((goal) => goal.id)
  .filter((goalId, index, all) => all.indexOf(goalId) !== index))]
const passageIds = new Set(passages.map((passage) => passage.id))
const sourceGoalsWithoutPassage = sourceGoals.filter((goal) => !passageIds.has(goal.passageId)).map((goal) => goal.id)
const goalBearingPassagesWithoutSourceGoals = passages
  .filter((passage) => passage.goalBearing)
  .filter((passage) => !sourceGoals.some((goal) => goal.passageId === passage.id))
  .map((passage) => passage.id)
const sourceGoalsMissingInKcText = sourceTextPresenceDetails(kcText, sourceGoals)
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
    missingKcTopicCodes.length === 0,
    `Erfasst: ${expectedKcTopicCodes.length - missingKcTopicCodes.length}/${expectedKcTopicCodes.length}; fehlend: ${missingKcTopicCodes.join(', ') || '-'}`,
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
    sourceGoals.length > 0,
    `${sourceGoals.length} KC-Inhalts-Source-Ziele`,
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
    'source-goals-verbatim-in-kc',
    'KC-Source-Ziele sind im Kerncurriculum-Text wiederauffindbar',
    sourceGoalsMissingInKcText.length === 0,
    `Nicht wiedergefunden: ${sourceGoalsMissingInKcText.slice(0, 8).join('; ') || '-'}`,
  ),
  buildCheck(
    'g9-source-goals-created',
    'Aus G9-Jahrgangspassagen wurden granulare Source-Ziele erzeugt',
    goalBearingPassagesWithoutSourceGoals.filter((id) => id.startsWith('g9-')).length === 0,
    `G9-Passagen ohne Source-Ziele: ${goalBearingPassagesWithoutSourceGoals.filter((id) => id.startsWith('g9-')).slice(0, 12).join(', ') || '-'}`,
  ),
  buildCheck(
    'competency-source-goals-created',
    'Kompetenzerwartungen aus KC 7.1/7.2/6 wurden als Source-Ziele erzeugt',
    false,
    'Noch offen: Prozess-/Kompetenzbereiche Darstellen, Kommunizieren, Argumentieren, Umgehen mit Symbolen/Werkzeugen, Problemlösen, Modellieren.',
  ),
]
const mapping2Complete = mapping1Complete && mapping2Checks.every((check) => check.passed)

const mapping3Checks = [
  buildCheck(
    'mapping-2-complete',
    'MAPPING-2 ist vollständig abgeschlossen',
    mapping2Complete,
    mapping2Complete
      ? 'Source-Ziel-Basis ist bereit für Mapping auf SkillPilot-Ziele.'
      : 'Mapping auf SkillPilot-Ziele bleibt blockiert, bis alle Source-Ziele vollständig erzeugt sind.',
  ),
]

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
    status: mapping2Complete ? 'incomplete' : 'blocked',
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
    sourceGoalExtraction: 'current pass extracts one source goal per literal KC 7.3 content focus; G9 topic granulation and KC process-competency source goals are intentionally still open.',
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
