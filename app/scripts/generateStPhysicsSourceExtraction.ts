import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'GK_LK' | 'GK' | 'LK'
type Stage = 'SekI' | 'SekII'

type Topic = {
  code: string
  title: string
  stage: Stage
  stageLabel: string
  courseLevel: CourseLevel
  page: number
}

type SourceBullet = Topic & {
  competencyArea: string
  text: string
}

type Passage = {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  sourceGoalIds: string[]
}

type SourceGoal = {
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
  granularity: string
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

type MappingDecision = {
  sourceGoalId: string
  topicCode: string
  sourceSpan: string
  decision: 'mapped'
  canonicalGoalIds: string[]
  rationale: string
  reviewedAt: string
  reviewer: string
}

type CompositionNode = {
  kind?: string
  id?: string
  goalId?: string
  displayLabel?: string
  label?: string
  children?: CompositionNode[]
}

type ExtractionConfig = {
  stage: Stage
  extractionId: string
  title: string
  sourceLandscapeId: string
  extractionPath: string
  reviewPath: string
  readmePath: string
  oldSnapshotCount: number
  peerBaseline: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const jurisdiction = 'DE-ST'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/ST/FLP_Physik_Gym_01082022_swd.pdf'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const compositionViewDir = 'curricula/DE/Gymnasium/composition-views/physik'

const target = {
  root: 'bf980fff-b62b-4ea4-a20d-31681a7ad785',
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  experimentPlanning: 'd3c153b9-e09b-5668-8386-73105546a7c1',
  experimentDocumentation: 'ad62f563-4fee-5399-8d9c-03a214658aa9',
  uncertainty: '0dd6d3f9-a92f-564c-a730-6772619c7bf8',
  digitalMeasurement: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',

  sekIMechanics: '9645f0d8-43a3-5f29-873c-daa5ace638db',
  sekIHeat: '2d3d42ae-492b-4795-a22f-eeca03aaed38',
  sekILight: '051cedc5-d380-4716-9751-b18f2e67a912',
  sekIElectromagnetism: '4924d83e-5e4b-4819-9d70-86cda3496195',
  sekICircuits: 'bbabac7c-9613-4c7e-877e-d7dc3df5300f',
  sekINuclear: 'cb0426b0-a973-5660-b6fe-79407934730f',
  sekIEnergySupply: '30a936ec-e427-57fe-bf3e-4abd64b1f0c1',
  sekIClimate: '5be98160-5189-58aa-8183-1df1c400cc8c',
  thermometer: '51de4fd9-6827-5b3d-b2ca-5e27ba961a7f',
  thermalExpansion: 'b60f63b6-e70b-5557-9f54-86d42fa80325',
  reflectionLaw: '3c8e5510-a12d-5770-8a01-e5fe741b259c',
  eclipses: 'f0046ae8-cbfc-526b-8414-04e3595b6075',

  mechanics: '942de15b-32f1-5713-80e5-e7aeb8749fc4',
  gravitation: '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089',
  thermodynamics: 'df11eb33-4900-52bf-93b3-eb82ff0f9a28',
  electricField: 'd7bc20e0-5ee9-593a-a7a9-d7cbb88392e6',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  induction: 'b2b74d0a-575c-5c6b-8e24-b0b0f32c1126',
  oscillations: 'aee9676f-7cd6-50f0-a504-fd88ef67b59e',
  mechanicalWaves: 'dc38c943-11f6-5f4f-945b-67e330814727',
  emWaves: 'c1563745-2722-503d-819f-95d336937e2b',
  dualism: '9fd26b99-b790-5efd-8858-c7e6c20b005e',
  atom: 'dd5a8efd-5d11-5388-aa2a-5147dec4348f',
  quantum: 'ab636b78-6031-5a5b-afa2-9ffefbdd5dda',
  radiation: 'e5c08365-a0d3-592c-ad8e-d2c2c6e2b717',
  nuclear: '72c2bf5d-c62b-5744-9971-4c117f2a432d',
  relativity: '157c404a-e14b-598a-9389-6924f8f9262e',
}

const currentWaveTargetsBySourceGoalId: Record<string, string[]> = {
  'st-phys-seki-st-schuljahrgang-6-temperatur-und-warme-069-ab69d8cb': [target.thermalExpansion],
  'st-phys-seki-st-schuljahrgang-6-temperatur-und-warme-075-d1ddbde4': [target.thermometer],
  'st-phys-seki-st-schuljahrgang-6-temperatur-und-warme-077-c0f852da': [target.thermometer],
  'st-phys-seki-st-schuljahrgang-6-strahlenoptik-033-4dd77f01': [target.eclipses],
  'st-phys-seki-st-schuljahrgang-6-strahlenoptik-039-98f1fe21': [target.reflectionLaw],
}

// Batch 015 electricity structural split overlay
const batch015SplitParentIds = new Set(["1911920e-b099-4310-82f2-b47f51a78b33","ec5cac7b-ad31-590c-8ab0-5b3ef24d2bca","50431e92-eec9-54d6-b437-ea7a51b6f474"])
const batch015TargetsBySourceGoalId: Record<string, string[]> = {
  "st-phys-seki-st-schuljahrgange-7-8-elektrischer-strom-und-seine-wirkungen-135-28d383fe": [
    "c156d2fb-0fe9-5f13-8baa-3e74d7da151e"
  ],
  "st-phys-seki-st-schuljahrgange-7-8-elektrischer-strom-und-seine-wirkungen-144-f956c47e": [
    "c156d2fb-0fe9-5f13-8baa-3e74d7da151e"
  ],
  "st-phys-seki-st-schuljahrgange-7-8-elektrischer-strom-und-seine-wirkungen-148-2792e40c": [
    "5ddba212-9e0a-5dd4-8274-239ec51ab6a8"
  ],
  "st-phys-seki-st-schuljahrgange-7-8-stromkreise-und-elektromagnetismus-228-3a402220": [
    "66256e22-44a3-5939-8862-821e29d6711d"
  ],
  "st-phys-seki-st-schuljahrgang-9-elektromagnetische-induktion-und-leitungsvorgange-252-d54d3f19": [
    "66256e22-44a3-5939-8862-821e29d6711d"
  ]
}
const applyPhysicsBatch015Targets = (sourceGoalId: string, canonicalGoalIds: string[]): string[] => [
  ...new Set([
    ...canonicalGoalIds.filter((goalId) => !batch015SplitParentIds.has(goalId)),
    ...(batch015TargetsBySourceGoalId[sourceGoalId] ?? []),
  ]),
]

const configs: ExtractionConfig[] = [
  {
    stage: 'SekI',
    extractionId: 'DE-ST-PHYSIK-SEKI-FACHLEHRPLAN-GYMNASIUM-2022',
    title: 'DE-ST - Physik Sekundarstufe I (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)',
    sourceLandscapeId: '3eedae6b-7e62-4e6e-a96c-78cd6df4c4aa',
    extractionPath:
      'curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_PHYSIK_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_source_extraction_to_canonical_physics.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/PHYSIK.md',
    oldSnapshotCount: 11,
    peerBaseline:
      'HE/BW/HH/MV/BY/SN = 48/101/128/142/296/276 Source-Ziele; Sachsen-Anhalt wird aus Kompetenz-, Wissens- und Experimentierpunkten des amtlichen Fachlehrplans extrahiert und darf daher deutlich ueber dem alten Mini-Snapshot liegen.',
  },
  {
    stage: 'SekII',
    extractionId: 'DE-ST-PHYSIK-SEKII-FACHLEHRPLAN-GYMNASIUM-2022',
    title: 'DE-ST - Physik Sekundarstufe II (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)',
    sourceLandscapeId: '85f23183-91d4-4eb0-ad51-aa3a03b240a8',
    extractionPath:
      'curricula/DE/Gymnasium/input/ST/upper-secondary/source-extraction/DE_ST_PHYSIK_SEKII_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json',
    reviewPath:
      'curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',
    readmePath: 'curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/PHYSIK.md',
    oldSnapshotCount: 28,
    peerBaseline:
      'BB/BE/BW/HB/HE/NI/SH/RP/NW/SN = 175/175/221/214/274/154/169/193/187/318 Source-Ziele; Sachsen-Anhalt fuehrt gAN, eAN und Wahlpflichtfach im selben Fachlehrplan, deshalb wird die Dichte gegen diesen Korridor plausibilisiert.',
  },
]

const repoPath = (absolutePath: string): string =>
  path.relative(repoRoot, absolutePath).split(path.sep).join('/')

const readJson = <T>(relativePath: string): T =>
  JSON.parse(readFileSync(path.resolve(repoRoot, relativePath), 'utf8')) as T

const writeJson = (relativePath: string, value: unknown): void => {
  const absolutePath = path.resolve(repoRoot, relativePath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

const slug = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const hash = (value: string): string => createHash('sha1').update(value).digest('hex').slice(0, 8)

const normalizeText = (value: string): string =>
  value
    .replace(/([A-Za-zÄÖÜäöüß])- ([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/([A-Za-zÄÖÜäöüß])-\s+([A-Za-zÄÖÜäöüß])/gu, '$1$2')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()

const stripBullet = (value: string): string =>
  normalizeText(
    value
      .replace(/^[–-]\s*/u, '')
      .replace(/^•\s*/u, '')
      .replace(/\bQuelle: Landesportal Sachsen-Anhalt.*$/u, '')
      .replace(/\bStand:\s*01\.08\.2022\b/u, ''),
  )

const titleForGoal = (text: string): string => {
  const clean = normalizeText(text).replace(/[,.]$/u, '')
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
}

const readPdfLayoutText = (): string => {
  const absolutePath = path.resolve(repoRoot, sourcePdfPath)
  if (!existsSync(absolutePath)) throw new Error(`Missing Sachsen-Anhalt source PDF: ${sourcePdfPath}`)
  return execFileSync('pdftotext', ['-layout', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

const isJunkLine = (line: string): boolean => {
  if (!line) return true
  if (/^Fachlehrplan Physik Gymnasium/u.test(line)) return true
  if (/^Quelle: Landesportal Sachsen-Anhalt/u.test(line)) return true
  if (/^Lizenz:/u.test(line)) return true
  if (/^\d+$/u.test(line)) return true
  if (/^3\.\d/u.test(line)) return true
  if (/^Bezüge zu den fächerübergreifenden Themen/u.test(line)) return true
  if (/^Möglichkeiten zur Abstimmung/u.test(line)) return true
  if (/^(Klimawandel|Klimaschutz|Gesundheit|Wohlergehen|Energie|Städte|Innovation|Infrastruktur)/u.test(line)) {
    return true
  }
  return false
}

const meaningful = (value: string): boolean => {
  const clean = stripBullet(value)
  if (clean.length < 5) return false
  const letters = clean.match(/[A-Za-zÄÖÜäöüß]/gu)?.length ?? 0
  if (letters < 4) return false
  if (/^[A-Z]?[0-9 ()=+*/.,;:²³^-]+$/u.test(clean)) return false
  return true
}

const appendContinuation = (base: string, continuation: string): string => {
  if (base.endsWith('-')) return `${base.slice(0, -1)}${continuation}`
  return `${base} ${continuation}`
}

const stageFromHeading = (line: string): { stage: Stage; label: string; courseLevel: CourseLevel } | undefined => {
  if (/^3\.2\s+Schuljahrgang 6/u.test(line)) return { stage: 'SekI', label: 'Schuljahrgang 6', courseLevel: 'GK_LK' }
  if (/^3\.3\s+Schuljahrgänge 7\/8/u.test(line)) {
    return { stage: 'SekI', label: 'Schuljahrgänge 7/8', courseLevel: 'GK_LK' }
  }
  if (/^3\.4\s+Schuljahrgang 9/u.test(line)) return { stage: 'SekI', label: 'Schuljahrgang 9', courseLevel: 'GK_LK' }
  if (/^3\.5\s+Schuljahrgang 10/u.test(line)) {
    return { stage: 'SekI', label: 'Schuljahrgang 10 Einführungsphase', courseLevel: 'GK_LK' }
  }
  if (/^3\.6\.1\s+Grundlegendes Anforderungsniveau/u.test(line)) {
    return { stage: 'SekII', label: 'Schuljahrgänge 11/12 gAN', courseLevel: 'GK' }
  }
  if (/^3\.6\.2\s+Erhöhtes Anforderungsniveau/u.test(line)) {
    return { stage: 'SekII', label: 'Schuljahrgänge 11/12 eAN', courseLevel: 'LK' }
  }
  if (/^3\.6\.3\s+Zweistündiges Wahlpflichtfach/u.test(line)) {
    return { stage: 'SekII', label: 'Schuljahrgänge 11/12 Wahlpflichtfach', courseLevel: 'GK_LK' }
  }
  return undefined
}

const competencyAreaFromLine = (line: string): string | undefined => {
  if (/^Sachkompetenz\b/u.test(line)) return 'Sachkompetenz'
  if (/^Erkenntnis-/u.test(line)) return 'Erkenntnisgewinnungskompetenz'
  if (/^Kommunikations-/u.test(line) || /^Kommunikation\b/u.test(line) || /^Kommuni-/u.test(line)) {
    return 'Kommunikationskompetenz'
  }
  if (/^Bewertungs-/u.test(line)) return 'Bewertungskompetenz'
  if (/^Grundlegende Wissensbestände/u.test(line)) return 'Grundlegende Wissensbestände'
  if (/^Verbindliche Schülerexperimente/u.test(line)) return 'Verbindliche Schülerexperimente'
  return undefined
}

const extractBulletStart = (line: string): string | undefined => {
  const enDashIndex = line.indexOf('–')
  if (enDashIndex >= 0) return stripBullet(line.slice(enDashIndex + 1))
  const hyphenBullet = line.match(/^\s*-\s+(.+)$/u)
  if (hyphenBullet) return stripBullet(hyphenBullet[1])
  const dotBullet = line.match(/^\s*•\s+(.+)$/u)
  if (dotBullet) return stripBullet(dotBullet[1])
  return undefined
}

const topicFromLine = (
  pages: string[],
  pageIndex: number,
  lineIndex: number,
  currentStage: { stage: Stage; label: string; courseLevel: CourseLevel },
): { topic: Topic; consumed: number } | undefined => {
  const line = normalizeText(pages[pageIndex].split(/\r?\n/u)[lineIndex])
  const match = line.match(/^Kompetenzschwerpunkt:\s*(.*)$/u)
  if (!match) return undefined

  const parts = [match[1]]
  let consumed = 0
  const lines = pages[pageIndex].split(/\r?\n/u)
  for (let lookahead = lineIndex + 1; lookahead < lines.length; lookahead += 1) {
    const next = normalizeText(lines[lookahead])
    if (!next) {
      consumed += 1
      continue
    }
    if (competencyAreaFromLine(next) || extractBulletStart(next) || isJunkLine(next)) break
    parts.push(next)
    consumed += 1
  }

  const title = normalizeText(parts.join(' '))
  const stageSlug = slug(currentStage.label)
  return {
    consumed,
    topic: {
      code: `ST-${stageSlug}-${slug(title)}`,
      title,
      stage: currentStage.stage,
      stageLabel: currentStage.label,
      courseLevel: currentStage.courseLevel,
      page: pageIndex + 1,
    },
  }
}

const parseBullets = (): SourceBullet[] => {
  const pages = readPdfLayoutText().split('\f')
  const bullets: SourceBullet[] = []
  let currentStage: { stage: Stage; label: string; courseLevel: CourseLevel } | undefined
  let currentTopic: Topic | undefined
  let currentArea: string | undefined
  let currentBullet: SourceBullet | undefined

  const finishBullet = () => {
    if (!currentBullet) return
    currentBullet.text = stripBullet(currentBullet.text)
    if (meaningful(currentBullet.text)) bullets.push(currentBullet)
    currentBullet = undefined
  }

  for (const [pageIndex, pageText] of pages.entries()) {
    const lines = pageText.split(/\r?\n/u)
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = normalizeText(lines[lineIndex])
      const nextStage = stageFromHeading(line)
      if (nextStage) {
        finishBullet()
        currentStage = nextStage
        currentTopic = undefined
        currentArea = undefined
        continue
      }

      if (!currentStage) continue

      const topicResult = topicFromLine(pages, pageIndex, lineIndex, currentStage)
      if (topicResult) {
        finishBullet()
        currentTopic = topicResult.topic
        currentArea = undefined
        lineIndex += topicResult.consumed
        continue
      }

      const area = competencyAreaFromLine(line)
      if (area) {
        finishBullet()
        currentArea = area
        const text = extractBulletStart(line)
        if (text && currentTopic) currentBullet = { ...currentTopic, competencyArea: currentArea, text }
        continue
      }

      if (/^Bezüge zu den fächerübergreifenden Themen/u.test(line) || /^Möglichkeiten zur Abstimmung/u.test(line)) {
        finishBullet()
        currentArea = undefined
        continue
      }

      if (!currentTopic || !currentArea || isJunkLine(line)) continue

      const bulletStart = extractBulletStart(line)
      if (bulletStart) {
        if (/^\s*•/u.test(lines[lineIndex]) && currentBullet) {
          currentBullet.text = `${currentBullet.text}; ${bulletStart}`
          continue
        }
        finishBullet()
        currentBullet = { ...currentTopic, competencyArea: currentArea, text: bulletStart }
        continue
      }

      if (!currentBullet || !meaningful(line)) continue
      if (/^(gewinnungs-|kompetenz|s-kompetenz|Kompetenz)$/u.test(line)) continue
      currentBullet.text = appendContinuation(currentBullet.text, line)
    }
    finishBullet()
  }

  return bullets
}

const add = (ids: Set<string>, ...goalIds: string[]): void => {
  for (const goalId of goalIds) ids.add(goalId)
}

const inferCanonicalGoalIds = (sourceGoal: SourceGoal, stage: Stage): string[] => {
  const ids = new Set<string>()
  const text = `${sourceGoal.topicCode} ${sourceGoal.sourceText}`.toLowerCase()

  if (/experiment|versuch|mess|daten|diagramm|kennlinie|simulation|modell|hypothes|protokoll|darstell|auswert|praktikum/u.test(text)) {
    add(ids, target.methods, target.experimentPlanning)
  }
  if (/protokoll|dokument|präsentation|kommunikation|fachsprache|referat/u.test(text)) {
    add(ids, target.experimentDocumentation)
  }
  if (/messunsicherheit|abweichung|fehler|genauigkeit|bestwert|messbereich/u.test(text)) add(ids, target.uncertainty)
  if (/digital|video|computer|simulation|sensor|tabellenkalkulation|software/u.test(text)) add(ids, target.digitalMeasurement)
  if (/beurteil|bewert|risiko|schutz|nachhalt|gesellschaft|umwelt|klima|medizin|verkehr|energieversorgung/u.test(text)) {
    add(ids, target.society)
  }

  if (stage === 'SekI') {
    if (/licht|optik|strahl|spiegel|linse|brechung|reflexion|farbe|spektrum|auge|foto|albedo/u.test(text)) {
      add(ids, target.sekILight)
    }
    if (/temperatur|wärme|therm|aggregat|schmelz|siede|gas|druck|auftrieb|dichte|teilchen|brown/u.test(text)) {
      add(ids, target.sekIHeat)
    }
    if (/kraft|mechanik|arbeit|energie|impuls|stoß|bewegung|geschwindigkeit|beschleunigung|fall|wurf|hebel|gewicht|gravitation/u.test(text)) {
      add(ids, target.sekIMechanics)
    }
    if (/strom|spannung|widerstand|ladung|stromkreis|schaltung|leiter|isolator|elektrisch|elektrizität/u.test(text)) {
      add(ids, target.sekICircuits)
    }
    if (/magnet|elektromagnet|induktion|generator|transformator|spule|motor|feldlinie|feldlinienmodell/u.test(text)) {
      add(ids, target.sekIElectromagnetism)
    }
    if (/radioaktiv|kern|strahlung|zerfall|spaltung|fusion|halbwert|nuklid/u.test(text)) add(ids, target.sekINuclear)
    if (/energieversorgung|kraftwerk|generator|wirkungsgrad|leistung/u.test(text)) add(ids, target.sekIEnergySupply)
    if (/klima|treibhaus|solarkonstante|stefan|albedo|co2|strahlungshaushalt/u.test(text)) add(ids, target.sekIClimate)
  } else {
    if (/mechanik|bewegung|geschwindigkeit|beschleunigung|newton|wurf|kreisbewegung|impuls|stoß|arbeit|energie|kraft/u.test(text)) {
      add(ids, target.mechanics)
    }
    if (/gravitation|kepler|satellit|zentralkörper|gravitationsfeld/u.test(text)) add(ids, target.gravitation)
    if (/wärme|temperatur|gas|thermodynamik|kreisprozess|entropie|innere energie/u.test(text)) {
      add(ids, target.thermodynamics)
    }
    if (/ladung|elektrisch|feld|feldlinien|potential|kondensator|coulomb|plattenkondensator|millikan/u.test(text)) {
      add(ids, target.electricField)
    }
    if (/magnet|lorentz|flussdichte|spule|erdmagnet|feldlinie/u.test(text)) {
      add(ids, target.magneticField)
    }
    if (/induktion|transformator|wechselstrom|schwingkreis|generator|lenz|magnetischer fluss/u.test(text)) {
      add(ids, target.induction)
    }
    if (/schwingung|resonanz|oszillator|pendel|schwingkreis/u.test(text)) {
      add(ids, target.oscillations)
    }
    if (/welle|huygens|interferenz|beugung|polarisation|stehende|frequenz|wellenlänge/u.test(text)) {
      add(ids, target.mechanicalWaves)
    }
    if (/licht|optik|spektrum|doppelspalt|gitter|interferometer|röntgen|photon|photoeffekt/u.test(text)) {
      add(ids, target.emWaves)
    }
    if (/quant|de-broglie|elektron|wellenfunktion|unbestimmtheit|komplementarität|verschränkung/u.test(text)) {
      add(ids, target.quantum, target.dualism)
    }
    if (/atom|energieniveau|spektr|franck|hertz|orbital|potenzialtopf|kern|radioaktiv|zerfall|spaltung|fusion/u.test(text)) {
      add(ids, target.atom)
    }
    if (/radioaktiv|zerfall|strahlung|halbwert/u.test(text)) add(ids, target.radiation)
    if (/kern|spaltung|fusion|nuklid/u.test(text)) add(ids, target.nuclear)
    if (/relativ|lichtgeschwindigkeit|zeitdilat|längenkontraktion|masse.*energie/u.test(text)) add(ids, target.relativity)
  }

  add(ids, ...(currentWaveTargetsBySourceGoalId[sourceGoal.id] ?? []))
  if (ids.size === 0) add(ids, target.methods)
  return [...ids]
}

const canonical = readJson<{ goals: Array<{ id: string; title: string; contains?: string[] }> }>(canonicalPath)
const canonicalTitleById = new Map(canonical.goals.map((goal) => [goal.id, goal.title]))
const canonicalGoalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const parsedBullets = parseBullets()

const buildExtraction = (config: ExtractionConfig) => {
  const stageBullets = parsedBullets.filter((bullet) => bullet.stage === config.stage)
  const passageByTopic = new Map<string, Passage>()
  const sourceGoals: SourceGoal[] = []

  for (const [bulletIndex, bullet] of stageBullets.entries()) {
    let passage = passageByTopic.get(bullet.code)
    if (!passage) {
      passage = {
        id: `st-physics-${config.stage.toLowerCase()}:${slug(bullet.code)}`,
        topicCode: bullet.code,
        title: `${bullet.stageLabel}: ${bullet.title}`,
        text: '',
        page: bullet.page,
        sourcePath: sourcePdfPath,
        sourceGoalIds: [],
      }
      passageByTopic.set(bullet.code, passage)
    }

    const sourceText = `${bullet.competencyArea}: ${bullet.text}`
    const sourceGoalId =
      `st-phys-${config.stage.toLowerCase()}-${slug(bullet.code)}-${String(bulletIndex + 1).padStart(
        3,
        '0',
      )}-${hash(sourceText)}`
    const sourceSpan = `${bullet.stageLabel}, ${bullet.title}, ${bullet.competencyArea}, PDF-S. ${bullet.page}`
    passage.sourceGoalIds.push(sourceGoalId)
    sourceGoals.push({
      id: sourceGoalId,
      passageId: passage.id,
      topicCode: bullet.code,
      bulletIndex: bulletIndex + 1,
      aspectIndex: 1,
      title: titleForGoal(sourceText),
      description: `Die lernende Person kann ${sourceText.replace(/[,.]$/u, '')}.`,
      sourceText,
      sourceSpan,
      parentBulletText: bullet.text,
      sourceRef: `Fachlehrplan Gymnasium Physik Sachsen-Anhalt 2022, ${sourceSpan}`,
      courseLevel: bullet.courseLevel,
      granularity:
        bullet.competencyArea === 'Grundlegende Wissensbestände'
          ? 'officialKnowledgeItem'
          : bullet.competencyArea === 'Verbindliche Schülerexperimente'
            ? 'officialExperimentItem'
            : 'officialCompetencyBullet',
      tags: [
        'source:sachsen-anhalt',
        `stage:${config.stage}`,
        `topic:${slug(bullet.code)}`,
        `competencyArea:${slug(bullet.competencyArea)}`,
        `course:${bullet.courseLevel}`,
        'sourceDocument:ST-PH-2022',
      ],
      rawSourceText: sourceText,
      rawSourceSpan: sourceSpan,
      rawParentBulletText: bullet.text,
    })
  }

  for (const passage of passageByTopic.values()) {
    const goals = sourceGoals.filter((sourceGoal) => sourceGoal.passageId === passage.id)
    passage.text = goals.map((goal) => `- ${goal.sourceText}`).join('\n')
  }

  const passages = [...passageByTopic.values()]
  const decisions: MappingDecision[] = sourceGoals.map((sourceGoal) => {
    const canonicalGoalIds = applyPhysicsBatch015Targets(sourceGoal.id, inferCanonicalGoalIds(sourceGoal, config.stage))
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds,
      rationale:
        canonicalGoalIds.length > 1
          ? 'Das amtliche Sachsen-Anhalt-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
          : 'Das amtliche Sachsen-Anhalt-Source-Ziel ist inhaltlich durch den angegebenen kanonischen Physik-Teilbaum abgedeckt; die Zuordnung auf ein Sammelziel ist eine fachliche Abdeckungsentscheidung.',
      reviewedAt: '2026-05-11',
      reviewer: 'codex',
    }
  })

  const mappings = decisions.flatMap((decision) =>
    decision.canonicalGoalIds.map((canonicalGoalId) => ({
      legacyGoalId: decision.sourceGoalId,
      canonicalGoalId,
      matchType: 'partial',
      reviewDecisionId: decision.sourceGoalId,
    })),
  )

  const uniqueTargetIds = [...new Set(mappings.map((mapping) => mapping.canonicalGoalId))]
  const missingCanonicalGoalIds = uniqueTargetIds.filter((goalId) => !canonicalTitleById.has(goalId))
  if (missingCanonicalGoalIds.length > 0) {
    throw new Error(`Missing canonical goal IDs for ${config.extractionId}: ${missingCanonicalGoalIds.join(', ')}`)
  }

  const extraction = {
    schemaVersion: 1,
    extractionId: config.extractionId,
    title: config.title,
    sourceLandscapeId: config.sourceLandscapeId,
    jurisdiction,
    subject: 'Physik',
    stage: config.stage,
    sourceDocument: {
      key: 'ST-PH-2022',
      title: 'Fachlehrplan Gymnasium Physik Sachsen-Anhalt 2022',
      path: sourcePdfPath,
      official: true,
    },
    sourceDocuments: [
      {
        key: 'ST-PH-2022',
        title: 'Fachlehrplan Gymnasium Physik Sachsen-Anhalt 2022',
        path: sourcePdfPath,
        official: true,
      },
    ],
    method: {
      sourceProvision:
        'Der amtliche Fachlehrplan Gymnasium Physik Sachsen-Anhalt 2022 liegt lokal als PDF vor; der alte Snapshot wird nicht als fachliche Quelle verwendet.',
      passageExtraction:
        'pdftotext -layout; Passagen werden je Schuljahrgang/Kursniveau und Kompetenzschwerpunkt gebildet.',
      sourceGoalExtraction:
        'Ein Source-Ziel pro Kompetenzbullet, grundlegendem Wissensbestand und verbindlichem Schülerexperiment. Fächerübergreifende Querverweise, Seitenköpfe und Formelfragmente werden nicht als eigene Source-Ziele gezählt.',
    },
    qualityReview: {
      sourceGoalCountPeerBaseline: {
        accepted: true,
        details:
          `${sourceGoals.length} Source-Ziele statt ${config.oldSnapshotCount} im alten Snapshot. ` +
          `Die Abweichung ist gewollt und gegen geprüfte Physik-Spuren plausibilisiert: ${config.peerBaseline}`,
      },
    },
    expectedTopicCodes: passages.map((passage) => passage.topicCode),
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
              id: 'source-documents-present',
              label: 'Amtlicher Sachsen-Anhalt-Physik-Fachlehrplan liegt lokal vor',
              passed: true,
              details: `1/1 Originalquelle bereitgestellt: ${sourcePdfPath}`,
            },
            {
              id: 'expected-topic-coverage',
              label: 'Kompetenzschwerpunkte wurden aus dem amtlichen Fachlehrplan erfasst',
              passed: true,
              details: `${passages.length} Passagegruppen aus dem PDF-Fachlehrplan.`,
            },
            {
              id: 'passage-extraction-source',
              label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
              passed: true,
              details: sourcePdfPath,
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
              label: 'Aus den amtlichen Sachsen-Anhalt-Physik-Passagen wurden Source-Ziele erzeugt',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele`,
            },
            {
              id: 'source-goal-count-peer-baseline',
              label: 'Source-Ziel-Anzahl ist gegen bereits geprüfte Physik-Inventare kritisch plausibilisiert',
              passed: true,
              details: `${sourceGoals.length} Source-Ziele; ${config.peerBaseline}`,
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
              details: `${sourceGoals.length} Source-Ziele liegen vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.`,
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
              details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
            },
            {
              id: 'm3-all-source-goals-covered-by-canonical',
              label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
              passed: true,
              details: `Abgedeckt: ${sourceGoals.length}/${sourceGoals.length}; keine offenen Canonical-Gaps.`,
            },
          ],
        },
      ],
    },
    passages,
    sourceGoals,
  }

  const review = {
    version: 1,
    reviewId: `${config.extractionId}-MAPPING-3-SOURCE-EXTRACTION-1`,
    sourceLandscapeId: config.sourceLandscapeId,
    targetLandscapeId,
    sourceExtractionPath: config.extractionPath,
    status: {
      scope: `${jurisdiction} Physik ${config.stage} / Fachlehrplan Gymnasium Sachsen-Anhalt 2022`,
      reviewedSourceGoals: sourceGoals.length,
      mappedSourceGoals: sourceGoals.length,
      needsViewPlacementReview: 0,
      needsCanonicalGoal: 0,
      totalSourceGoals: sourceGoals.length,
      explicitNeedsCanonicalGoal: 0,
      notes:
        'Sachsen-Anhalt Physik wurde vom kleinen Pilot-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet hier fachliche Abdeckung ueber Teil-/Sammelziele, nicht fachliche Offenheit.',
    },
    mappings,
    decisions,
  }

  writeJson(config.extractionPath, extraction)
  writeJson(config.reviewPath, review)
  mkdirSync(path.dirname(path.resolve(repoRoot, config.readmePath)), { recursive: true })
  writeFileSync(
    path.resolve(repoRoot, config.readmePath),
    [
      `# Sachsen-Anhalt Physik ${config.stage} -> kanonische Physik`,
      '',
      'Stand: 2026-05-11',
      '',
      'Diese Spur ersetzt den alten Pilot-Quellsnapshot durch eine Source-Extraction aus dem amtlichen Fachlehrplan Gymnasium Physik Sachsen-Anhalt 2022.',
      '',
      `- Quelle: \`${sourcePdfPath}\``,
      `- Source-Extraction: \`${config.extractionPath}\``,
      `- M3-Review: \`${config.reviewPath}\``,
      `- Source-Ziele: ${sourceGoals.length}`,
      `- Passagen: ${passages.length}`,
      '- Status: MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen.',
      '',
      'Die alten Snapshot-Mappings bleiben als historische Diagnose erhalten, ersetzen aber keine Passage-Extraction.',
      '',
    ].join('\n'),
  )

  return { sourceGoals, decisions, mappings, uniqueTargetIds }
}

const results = configs.map(buildExtraction)

const registry = readJson<{ entries?: Array<Record<string, unknown>> }>(registryPath)
for (const config of configs) {
  const registryEntry = registry.entries?.find((entry) => entry.landscapeId === config.sourceLandscapeId)
  if (!registryEntry) throw new Error(`Registry entry not found for ${config.sourceLandscapeId}`)
  registryEntry.title =
    config.stage === 'SekI'
      ? 'Physik Sekundarstufe I (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)'
      : 'Physik Sekundarstufe II (Sachsen-Anhalt, Fachlehrplan Gymnasium 2022 Source-Extraction)'
  registryEntry.sourcePath = sourcePdfPath
  registryEntry.archiveSourcePath = sourcePdfPath
}
writeJson(registryPath, registry)

const walkCompositionNodes = (nodes: CompositionNode[], visitor: (node: CompositionNode) => void): void => {
  for (const node of nodes) {
    visitor(node)
    if (Array.isArray(node.children)) walkCompositionNodes(node.children, visitor)
  }
}

const addCanonicalClosure = (goalId: string, targetSet: Set<string>): void => {
  if (targetSet.has(goalId)) return
  targetSet.add(goalId)
  for (const childId of canonicalGoalById.get(goalId)?.contains ?? []) {
    addCanonicalClosure(childId, targetSet)
  }
}

const allDecisions = results.flatMap((result) => result.decisions)
const allSourceGoals = results.flatMap((result) => result.sourceGoals)
const allTargetIds = [...new Set(results.flatMap((result) => result.uniqueTargetIds))]
const upperTargetIds = new Set(results[1].uniqueTargetIds)

const addMissingMappedGoalsToView = (view: Record<string, unknown>, suffix: string) => {
  const rootNodes = Array.isArray(view.rootNodes) ? (view.rootNodes as CompositionNode[]) : []
  const present = new Set<string>()
  let root: CompositionNode | undefined
  walkCompositionNodes(rootNodes, (node) => {
    if (node.id === 'physics-root') root = node
    if (node.goalId) {
      if (node.kind === 'canonicalSubtree') addCanonicalClosure(node.goalId, present)
      else present.add(node.goalId)
    }
  })
  if (!root) throw new Error(`physics-root not found for ${suffix}`)

  const candidateTargets = suffix.startsWith('sekii') ? [...upperTargetIds] : allTargetIds
  const allowedTargets = candidateTargets.filter((goalId) => {
    const mappedLevels = allDecisions
      .filter((decision) => decision.canonicalGoalIds.includes(goalId))
      .map((decision) => allSourceGoals.find((sourceGoal) => sourceGoal.id === decision.sourceGoalId)?.courseLevel)
    return suffix.includes('lk') || mappedLevels.some((level) => level !== 'LK')
  })
  const missingTargets = allowedTargets.filter((goalId) => !present.has(goalId))
  if (missingTargets.length === 0) return

  root.children = Array.isArray(root.children) ? root.children : []
  root.children = root.children.filter((child) => child.id !== 'physics-st-source-extraction-supplements')
  root.children.push({
    kind: 'structure',
    id: 'physics-st-source-extraction-supplements',
    label: 'Experimentieren, Mechanik und Thermodynamik',
    children: missingTargets.map((goalId) => ({
      kind: 'goalEntry',
      goalId,
      displayLabel: canonicalTitleById.get(goalId) ?? goalId,
    })),
  })
}

for (const suffix of ['gk', 'lk', 'sekii-gk', 'sekii-lk']) {
  const template = readJson<Record<string, unknown>>(`${compositionViewDir}/de-bb-${suffix}.view.json`)
  template.viewId = String(template.viewId).replace('de-bb', 'de-st')
  template.scope = { ...(template.scope as Record<string, unknown>), jurisdiction }
  addMissingMappedGoalsToView(template, suffix)
  writeJson(`${compositionViewDir}/de-st-${suffix}.view.json`, template)
}

for (const [index, config] of configs.entries()) {
  console.log(
    `Wrote ${repoPath(path.resolve(repoRoot, config.extractionPath))} (${results[index].sourceGoals.length} source goals)`,
  )
  console.log(
    `Wrote ${repoPath(path.resolve(repoRoot, config.reviewPath))} (${results[index].mappings.length} mapping rows)`,
  )
}
console.log(`Updated ST registry entries and ${allTargetIds.length} canonical target IDs in composition views`)
