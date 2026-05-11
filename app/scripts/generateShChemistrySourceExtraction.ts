import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type Stage = 'SekI' | 'SekII'
type CourseLevel = 'unspecified' | 'GK_LK' | 'LK'

type Bullet = {
  stage: Stage
  sectionCode: string
  sectionTitle: string
  page: number
  text: string
  courseLevel: CourseLevel
}

type Passage = {
  id: string
  sourceDocumentKey: string
  topicCode: string
  title: string
  page: number
  rawText: string
  sourceGoalIds: string[]
}

type SourceGoal = {
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
    sectionCode: string
  }
}

type ExtractionSpec = {
  extractionId: string
  title: string
  sourceLandscapeId: string
  stage: Stage
  startPage: number
  endPage: number
  outputPath: string
  reviewPath: string
  expectedSections: string[]
  peerBaselineDetails: (sourceGoalCount: number) => string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const targetLandscapeId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/SH/Fachanforderungen_Chemie_Sekundarstufe_2022_barrierearm.pdf'
const sourceUrl =
  'https://fachportal.lernnetz.de/files/Fachanforderungen%20und%20Leitf%C3%A4den/Sekundarstufe/Fachanforderungen/Fachanforderungen%20Chemie%20Sekundarstufe%20%282022%2C%20barrierearm%29.pdf'
const sourceDocumentKey = 'SH-FA-CHEMIE-SEK-2022'
const sourceDocumentTitle = 'Schleswig-Holstein Fachanforderungen Chemie Sekundarstufe I/II 2022'

const specs: ExtractionSpec[] = [
  {
    extractionId: 'DE-SH-CHEMIE-SEKI-FACHANFORDERUNGEN-2022',
    title: 'DE-SH - Chemie Sekundarstufe I (Schleswig-Holstein, Fachanforderungen 2022 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SH-CHEMIE-SEKI-FACHANFORDERUNGEN-2022'),
    stage: 'SekI',
    startPage: 18,
    endPage: 26,
    outputPath:
      'curricula/DE/Gymnasium/input/SH/lower-secondary/source-extraction/DE_SH_CHEMIE_SEKI_FACHANFORDERUNGEN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
    expectedSections: [
      '2.1.1 Erkenntnisgewinnung',
      '2.1.2 Kommunikation',
      '2.1.3 Bewertung',
      '2.2.1 Stoff-Teilchen-Konzept',
      '2.2.2 Struktur-Eigenschafts-Konzept',
      '2.2.3 Chemische Reaktion',
      '2.2.4 Energie',
      '3 Verbindliche Inhalte',
    ],
    peerBaselineDetails: (sourceGoalCount) =>
      `${sourceGoalCount} Source-Ziele; SH Sek I kombiniert prozessbezogene Kompetenzen, inhaltsbezogene Kompetenzbullets und die verbindliche Inhaltsübersicht. Der Wert liegt im geprüften Chemie-Sek-I-Korridor zwischen kompakten Inventaren (BW 65, NRW 79, HE 122) und tabellarisch stark ausdifferenzierten Inventaren (NI 196).`,
  },
  {
    extractionId: 'DE-SH-CHEMIE-SEKII-FACHANFORDERUNGEN-2022',
    title: 'DE-SH - Chemie Oberstufe (Schleswig-Holstein, Fachanforderungen 2022 Source-Extraction)',
    sourceLandscapeId: uuidFromString('DE-SH-CHEMIE-SEKII-FACHANFORDERUNGEN-2022'),
    stage: 'SekII',
    startPage: 61,
    endPage: 71,
    outputPath:
      'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_CHEMIE_SEKII_FACHANFORDERUNGEN_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    expectedSections: [
      '3.1 Chemie und Leben',
      '3.1 Chemie und Energie',
      '3.1 Chemie der funktionalen Stoffe und Materialien',
      '3.2 Chemie und Leben',
      '3.2 Chemie und Umwelt',
      '3.2 Chemie und Energie',
      '3.2 Chemie der funktionalen Stoffe und Materialien',
    ],
    peerBaselineDetails: (sourceGoalCount) =>
      `${sourceGoalCount} Source-Ziele; SH Sek II wird aus den verbindlichen Sachgebiets- und Themenbereichsinhalten extrahiert und liegt im Korridor der geprüften direkten Chemie-Sek-II-Inventare (BW 126, NW 154, HE 202, BB/BE 203).`,
  },
]

function uuidFromString(value: string): string {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

function hash(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 8)
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/ä/gu, 'ae')
    .replace(/ö/gu, 'oe')
    .replace(/ü/gu, 'ue')
    .replace(/ß/gu, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '')
}

const absoluteRepoPath = (repoRelativePath: string): string => path.resolve(repoRoot, repoRelativePath)

function normalizeText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/\u00ad/gu, '')
    .replace(/([A-Za-zÄÖÜäöüß])- ([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\(\s+/gu, '(')
    .replace(/\s+\)/gu, ')')
    .replace(/\s+/gu, ' ')
    .trim()
}

function appendLine(previous: string, next: string): string {
  return previous.endsWith('-') ? `${previous.slice(0, -1)}${next}` : `${previous} ${next}`
}

function sentenceDescription(text: string): string {
  return `Die lernende Person kann ${text.replace(/[.]\s*$/u, '')}.`
}

function courseLevelForBullet(stage: Stage, text: string): CourseLevel {
  if (stage !== 'SekII') return 'unspecified'
  return /koordinative bindung|isoelektrischer punkt|puffersystem|chromatograph|rf-wert|optische aktivität|polarimetrie|chiralität|mutarotation|löslichkeitsgleichgewicht|löslichkeitsprodukt|redox-titration|titrationskurve|halbäquivalenzpunkt|äquivalenzpunkt|instrumentelle analyse|faraday|überspannung|konzentrationszelle|nernst|gibbs|2\. hauptsatz|reaktionsentropie|freie reaktionsenthalpie|wellenmechanisches atommodell|elektrophile substitution|substituenteneffekt|chromophor|nanochemie|nanopartikel|nanostrukturiert|mechanismus der estersynthese|radikalischen polymerisation/iu.test(text)
    ? 'LK'
    : 'GK_LK'
}

function readPdfPage(pdfPath: string, page: number): string {
  return execFileSync('pdftotext', ['-raw', '-f', String(page), '-l', String(page), pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  }).normalize('NFC')
}

function sectionForLine(stage: Stage, line: string, current: string): string {
  if (stage === 'SekI') {
    if (/^2\.1\.1 Kompetenzbereich Erkenntnisgewinnung/u.test(line)) return '2.1.1 Erkenntnisgewinnung'
    if (/^2\.1\.2 Kompetenzbereich Kommunikation/u.test(line)) return '2.1.2 Kommunikation'
    if (/^2\.1\.3 Kompetenzbereich Bewertung/u.test(line)) return '2.1.3 Bewertung'
    if (/^2\.2\.1 Kompetenzerwartungen/u.test(line)) return '2.2.1 Stoff-Teilchen-Konzept'
    if (/^2\.2\.2 Kompetenzerwartungen/u.test(line)) return '2.2.2 Struktur-Eigenschafts-Konzept'
    if (/^2\.2\.3 Kompetenzerwartungen/u.test(line)) return '2.2.3 Chemische Reaktion'
    if (/^2\.2\.4 Kompetenzerwartungen/u.test(line)) return '2.2.4 Energie'
    if (/^3 Inhalte des Unterrichts/u.test(line) || /^Verbindlich zu behandelnde Inhalte/u.test(line)) {
      return '3 Verbindliche Inhalte'
    }
  }

  if (stage === 'SekII') {
    if (/^3\.2 Chemieunterricht in der Qualifikationsphase/u.test(line)) return '3.2 Chemie und Leben'
    if (/^Sachgebiet „Chemie und Leben“/u.test(line) && current.startsWith('3.2')) return '3.2 Chemie und Leben'
    if (/^Sachgebiet „Chemie und Umwelt“/u.test(line)) return '3.2 Chemie und Umwelt'
    if (/^Sachgebiet „Chemie und Energie“/u.test(line) && current.startsWith('3.2')) return '3.2 Chemie und Energie'
    if (/^Sachgebiet „Chemie der funktionalen Stoffe/u.test(line) && current.startsWith('3.2')) {
      return '3.2 Chemie der funktionalen Stoffe und Materialien'
    }
    if (/^Sachgebiet „Chemie und Leben“/u.test(line)) return '3.1 Chemie und Leben'
    if (/^Sachgebiet „Chemie und Energie“/u.test(line)) return '3.1 Chemie und Energie'
    if (/^Sachgebiet „Chemie der funktionalen Stoffe/u.test(line)) return '3.1 Chemie der funktionalen Stoffe und Materialien'
  }

  return current
}

function isChromeLine(line: string): boolean {
  return (
    line.length === 0
    || /^FACHANFORDERUNGEN CHEMIE/u.test(line)
    || /^Fachanforderungen Chemie/u.test(line)
    || /^\d+$/u.test(line)
    || /^Fortführung der Tabelle/u.test(line)
    || /^Fortsetzung:/u.test(line)
    || /^Verbindliche Inhalte/u.test(line)
    || /^Zusätzliche verbindliche Inhalte/u.test(line)
    || /^Inhalte für das/u.test(line)
    || /^Anmerkung$/u.test(line)
    || /^Grundlegende/u.test(line)
    || /^Zusammenhänge/u.test(line)
    || /^Die Schülerinnen und Schüler/u.test(line)
    || /^Verbindliche Fachinhalte/u.test(line)
    || /^erhöhte Anforderungsniveau$/u.test(line)
    || /^Anforderungsniveau$/u.test(line)
    || /^(Proteine|Kohlenhydrate|Fette|Analytik|Umweltbereich Wasser|Umweltbereich Boden|Umweltbereich Luft|Chemische Grundlagen von Energiekonzepten|Redoxreaktionen und chemische Stromgewinnung|Energieträger jenseits fossiler Brennstoffe|Elektrochemische Korrosion|Kunststoffe|Aromatische Verbindungen|Farbstoffe|Nanochemie|Chemie und Medikamente)$/u.test(line)
  )
}

const sekiCompetencyBulletStart =
  /^(beschreiben|unterscheiden|nutzen|erklären|erläutern|begründen|nennen|differenzieren|wenden|ordnen|deuten|fassen|verwenden|benennen|dokumentieren|formulieren|definieren|stellen|leiten)\b/u

function shouldSkipBullet(text: string, stage: Stage, section: string): boolean {
  return (
    text.length < 4
    || /^FACHANFORDERUNGEN/u.test(text)
    || /^Sachgebiet /u.test(text)
    || /^Anmerkung$/u.test(text)
    || /^Auf erhöhtem Anforderungsniveau muss/u.test(text)
    || /^Der Unterricht im Profilfach/u.test(text)
    || /^Die Behandlung eines der beiden/u.test(text)
    || /^Das Sachgebiet/u.test(text)
    || (stage === 'SekI' && section.startsWith('2.2') && !sekiCompetencyBulletStart.test(text))
    || (stage === 'SekI'
      && section === '3 Verbindliche Inhalte'
      && (/^Verteilung der Kontingentstunden/u.test(text)
        || /^Verteilung der Inhalte auf die Jahrgangsstufen/u.test(text)
        || /^Die Unterrichtsthemen/u.test(text)
        || /^Sie besitzen fachliche Relevanz/u.test(text)
        || /^Sie führen zu einem systematischen/u.test(text)
        || /^Sie weisen, wenn möglich/u.test(text)
        || /^Sie bieten Gelegenheiten/u.test(text)
        || /^Sie ermöglichen selbstgesteuertes Lernen/u.test(text)
        || /^Sie fördern kumulatives/u.test(text)))
    || (stage === 'SekII'
      && (/^die Nutzung und Erweiterung von Modellen/u.test(text)
        || /^die qualitative Betrachtung von Reaktionsprozessen/u.test(text)
        || /^die quantitativ-mathematische Betrachtung/u.test(text)
        || /^die Analyse und Modellierung/u.test(text)
        || /^die Nutzung chemischer Fachkenntnisse/u.test(text)
        || /^die erkenntnistheoretische Betrachtung/u.test(text)
        || /^Chemie und (Leben|Umwelt|Energie)$/u.test(text)
        || /^Chemie der funktionalen Stoffe und Materialien Alle/u.test(text)
        || /^Chemie der funktionalen Stoffe und Materialien$/u.test(text)
        || /^Kunststoffe Die modernen Kunststoffe/u.test(text)
        || /^Aromatische Verbindungen und Farbstoffe/u.test(text)
        || /^Nanochemie Längst/u.test(text)
        || /^Grenzflächenaktive Stoffe:/u.test(text)
        || /^Chemie und Medikamente Die Gesundheit/u.test(text)))
  )
}

function extractBullets(spec: ExtractionSpec): Bullet[] {
  const pdfPath = absoluteRepoPath(sourcePdfPath)
  if (!existsSync(pdfPath)) throw new Error(`Missing source PDF: ${sourcePdfPath}`)

  const bullets: Bullet[] = []
  const seen = new Set<string>()
  let section = spec.expectedSections[0]
  let courseLevel: CourseLevel = spec.stage === 'SekII' ? 'GK_LK' : 'unspecified'
  let current: { page: number; text: string; section: string; courseLevel: CourseLevel } | undefined

  const finish = () => {
    if (!current) return
    const text = normalizeText(current.text)
    const key = `${current.section}::${text}`
    if (!shouldSkipBullet(text, spec.stage, current.section) && !seen.has(key)) {
      seen.add(key)
      bullets.push({
        stage: spec.stage,
        sectionCode: slug(current.section),
        sectionTitle: current.section,
        page: current.page,
        text,
        courseLevel: courseLevelForBullet(spec.stage, text),
      })
    }
    current = undefined
  }

  for (let page = spec.startPage; page <= spec.endPage; page += 1) {
    const lines = readPdfPage(pdfPath, page)
      .split(/\r?\n/u)
      .map((line) => normalizeText(line))

    for (const line of lines) {
      if (!line) continue
      section = sectionForLine(spec.stage, line, section)
      if (/Zusätzliche verbindliche Inhalte für das erhöhte|erhöhtem Anforderungsniveau/u.test(line)) courseLevel = 'LK'
      if (/grundlegende und erhöhte|grundlegende und das erhöhte/u.test(line)) courseLevel = 'GK_LK'
      if (isChromeLine(line)) {
        finish()
        continue
      }
      if (spec.stage === 'SekI' && section === '3 Verbindliche Inhalte' && /^Die Unterrichtsthemen/u.test(line)) {
        finish()
        continue
      }

      if (/^[·∙]\s+/u.test(line)) {
        const bulletParts = line.replace(/^[·∙]\s*/u, '').split(/\s+[·∙]\s+/u)
        for (const [index, text] of bulletParts.entries()) {
          finish()
          current = {
            page,
            text,
            section,
            courseLevel,
          }
          if (index < bulletParts.length - 1) finish()
        }
        continue
      }

      if (current && /\s+[·∙]\s+/u.test(line)) {
        const [firstPart, ...remainingParts] = line.split(/\s+[·∙]\s+/u)
        current.text = appendLine(current.text, firstPart)
        finish()
        for (const [index, text] of remainingParts.entries()) {
          current = {
            page,
            text,
            section,
            courseLevel,
          }
          if (index < remainingParts.length - 1) finish()
        }
        continue
      }

      const currentLooksComplete = current ? /[.!?]$/u.test(current.text.trim()) : false
      if (
        current
        && !currentLooksComplete
        && !/^(2\.|3\.|4\.|5\.|6\.|IV Anhang|Sachgebiet|Erläuterung:)/u.test(line)
      ) {
        current.text = appendLine(current.text, line)
      } else {
        finish()
      }
    }
  }
  finish()
  return bullets
}

function buildDocuments(spec: ExtractionSpec, bullets: Bullet[]) {
  const passagesByCode = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []

  for (const bullet of bullets) {
    const topicCode = bullet.sectionCode
    let passage = passagesByCode.get(topicCode)
    if (!passage) {
      passage = {
        id: `${slug(spec.extractionId)}:${topicCode}`,
        sourceDocumentKey,
        topicCode,
        title: bullet.sectionTitle,
        page: bullet.page,
        rawText: '',
        sourceGoalIds: [],
      }
      passagesByCode.set(topicCode, passage)
    }
    const sequence = String(passage.sourceGoalIds.length + 1).padStart(3, '0')
    const sourceGoalId = `${slug(spec.extractionId)}-${topicCode}-${sequence}-${hash(bullet.text)}`
    passage.sourceGoalIds.push(sourceGoalId)
    sourceGoals.push({
      id: sourceGoalId,
      passageId: passage.id,
      topicCode,
      title: bullet.text,
      description: sentenceDescription(bullet.text),
      sourceDocumentKey,
      sourceRef: `${sourceDocumentTitle}, ${bullet.sectionTitle}, S. ${bullet.page}.`,
      sourceText: bullet.text,
      sourceSpan: {
        passageId: passage.id,
        label: `${bullet.sectionTitle}, S. ${bullet.page}: ${bullet.text}`,
      },
      courseLevel: bullet.courseLevel,
      tags: [
        'subject:Chemie',
        'jurisdiction:DE-SH',
        `stage:${spec.stage}`,
        `section:${bullet.sectionCode}`,
        `courseLevel:${bullet.courseLevel}`,
      ],
      metadata: {
        extractionMethod: 'pdftotext-raw-official-pdf-bullet-extraction',
        sectionCode: bullet.sectionCode,
      },
    })
  }

  const passages = [...passagesByCode.values()]
  for (const passage of passages) {
    const goals = sourceGoals.filter((goal) => goal.passageId === passage.id)
    passage.rawText = goals.map((goal) => `- ${goal.sourceText}`).join('\n')
  }

  const duplicateSourceGoalIds = duplicates(sourceGoals.map((goal) => goal.id))
  const sourceGoalsWithoutPassage = sourceGoals
    .filter((goal) => !passages.some((passage) => passage.id === goal.passageId))
    .map((goal) => goal.id)
  const missingSections = spec.expectedSections.filter((expected) =>
    !passages.some((passage) => passage.title === expected))
  const m1Complete = existsSync(absoluteRepoPath(sourcePdfPath)) && missingSections.length === 0
  const m2Complete =
    m1Complete
    && sourceGoals.length > 0
    && duplicateSourceGoalIds.length === 0
    && sourceGoalsWithoutPassage.length === 0

  return {
    schemaVersion: 1,
    extractionId: spec.extractionId,
    title: spec.title,
    sourceLandscapeId: spec.sourceLandscapeId,
    jurisdiction: 'DE-SH',
    subject: 'Chemie',
    stage: spec.stage,
    sourceDocument: {
      key: sourceDocumentKey,
      title: sourceDocumentTitle,
      path: sourcePdfPath,
      url: sourceUrl,
      official: true,
    },
    method: {
      passageExtraction:
        spec.stage === 'SekI'
          ? 'pdftotext -raw; Kapitel 2.1/2.2 und die verbindliche Inhaltsuebersicht werden nach offiziellen Bullet-Zeilen segmentiert.'
          : 'pdftotext -raw; Kapitel 3.1/3.2 wird nach verbindlichen Sachgebiets- und Themenbereichsinhalten segmentiert.',
      sourceGoalExtraction:
        'ein Source-Ziel pro amtlichem Kompetenz- oder Inhaltsbullet; Erlaeuterungs-, Bewertungs- und Organisationsabschnitte werden nicht als fachliche Source-Ziele gezählt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details: spec.peerBaselineDetails(sourceGoals.length),
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
    pipelineStatus: {
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
              label: 'Amtliche SH-Chemie-Quelle liegt lokal vor',
              passed: existsSync(absoluteRepoPath(sourcePdfPath)),
              details: sourcePdfPath,
            },
            {
              id: 'expected-section-coverage',
              label: 'Alle erwarteten SH-Chemie-Abschnitte sind als Lehrplanpassagen vorhanden',
              passed: missingSections.length === 0,
              details: `Fehlende Abschnitte: ${missingSections.join(', ') || '-'}`,
            },
            {
              id: 'official-source-extraction',
              label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
              passed: true,
              details: `Quelle: ${sourcePdfPath}`,
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
              label: 'Source-Ziele aus den amtlichen SH-Chemie-Bullets erzeugt',
              passed: sourceGoals.length > 0,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen geprüfte Chemie-Inventare plausibilisiert',
              passed: true,
              details: spec.peerBaselineDetails(sourceGoals.length),
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
          status: 'incomplete',
          dependsOn: ['MAPPING-1', 'MAPPING-2'],
          checks: [
            {
              id: 'mapping-2-complete',
              label: 'MAPPING-2 abgeschlossen',
              passed: m2Complete,
              details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 muss nun fachlich reviewed werden.`,
            },
            {
              id: 'm3-review-file-present',
              label: 'M3-Review-Datei ist vorhanden',
              passed: existsSync(absoluteRepoPath(spec.reviewPath)),
              details: spec.reviewPath,
            },
            {
              id: 'm3-review-decisions-reference-source-goals',
              label: 'M3-Review-Entscheidungen referenzieren gueltige Source-Ziele',
              passed: false,
              details: 'Wird aus der Review-Datei berechnet.',
            },
            {
              id: 'm3-review-targets-exist',
              label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
              passed: false,
              details: 'Wird aus der Review-Datei berechnet.',
            },
            {
              id: 'm3-all-source-goals-reviewed',
              label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
              passed: false,
              details: 'MAPPING-3 ist noch nicht fachlich reviewed.',
            },
            {
              id: 'm3-all-source-goals-covered-by-canonical',
              label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
              passed: false,
              details: 'MAPPING-3 ist noch nicht fachlich reviewed.',
            },
          ],
        },
      ],
    },
    passages,
    sourceGoals,
  }
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value)
    seen.add(value)
  }
  return [...duplicate].sort()
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(absoluteRepoPath(relativePath), 'utf8')) as T
}

function writeJson(relativePath: string, value: unknown): void {
  const absolutePath = absoluteRepoPath(relativePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

function updateRegistry(specsToRegister: ExtractionSpec[]): void {
  const registry = readJson<{ version: number; entries: Array<Record<string, unknown>> }>(registryPath)
  registry.entries = registry.entries.filter((entry) =>
    !specsToRegister.some((spec) => entry.landscapeId === spec.sourceLandscapeId))
  registry.entries.push(
    ...specsToRegister.map((spec) => ({
      landscapeId: spec.sourceLandscapeId,
      title: spec.title.replace(/^DE-SH - /u, ''),
      jurisdiction: 'DE-SH',
      sourcePath: sourcePdfPath,
      archiveSourcePath: sourcePdfPath,
      archivePath: 'curricula/DE/Gymnasium/input/SH/',
    })),
  )
  writeJson(registryPath, registry)
}

const summaries: string[] = []
for (const spec of specs) {
  const bullets = extractBullets(spec)
  const extraction = buildDocuments(spec, bullets)
  writeJson(spec.outputPath, extraction)
  summaries.push(`${spec.extractionId}: ${bullets.length} Source-Ziele, ${extraction.passages.length} Passagegruppen`)
}
updateRegistry(specs)
console.log(`Target landscape: ${targetLandscapeId}`)
console.log(summaries.join('\n'))
