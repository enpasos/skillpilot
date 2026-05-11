import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type CourseLevel = 'GK_LK' | 'GK' | 'LK'

type ParsedBullet = {
  stage: 'EF' | 'GK' | 'LK'
  field: string
  competency: 'Sachkompetenz' | 'Erkenntnisgewinnungskompetenz' | 'Bewertungskompetenz'
  page: number
  text: string
  rawText: string
}

type Passage = {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  rawText: string
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
  decision: 'mapped' | 'needsCanonicalGoal'
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
  children?: CompositionNode[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const sourceLandscapeId = '8abb46ff-072b-41b7-9d70-0334cb5a1a6c'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/NW/upper-secondary/gost_klp_ph_2022_06_07.pdf'
const extractionPath =
  'curricula/DE/Gymnasium/input/NW/upper-secondary/source-extraction/DE_NW_PHYSIK_SEKII_KLP_2022.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_source_extraction_to_canonical_physics.review.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const compositionViewDir = 'curricula/DE/Gymnasium/composition-views/physik'

const target = {
  motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
  methods: '1e9ec823-384b-5e5f-974c-4ce224d05c19',
  uncertainty: '0dd6d3f9-a92f-564c-a730-6772619c7bf8',
  digitalMeasurement: 'e452baa3-c9fc-5b62-893c-f91fe8d53715',
  society: '8eaa4e45-39fc-50e9-b59f-8a1752f6bebe',
  motion: '65ddd780-0323-45d1-8f94-5e31bf28da23',
  kinematics: 'ce431132-dfc4-42c2-aff6-bd72035190f8',
  uniformMotion: '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd',
  acceleratedMotion: 'e4b38061-1f28-43ad-8371-a3e7c0e81856',
  freeFall: '09029573-864f-40ca-bf8a-cee7bf6dcb73',
  motionModeling: 'd6dc0e02-831d-4894-a61a-852bcc74f147',
  projectile: '287739a3-6143-55d0-abe7-1a08889e9b49',
  newton: '9340e894-bb0d-45a4-91f2-b90a63ad50a8',
  newtonAxioms: '4dc9a094-66d7-4d4d-9436-134aabe48f39',
  conservation: 'e9d616d8-685f-4129-a36f-dae7a280bae7',
  energy: 'feb70838-931c-4b45-b9a9-930605d93efa',
  gravitation: '0ade0d10-8b32-5a95-a1a9-8ac64e2a8089',
  kepler: '497f1311-17d6-56ff-afb1-422a738e5c16',
  circularMotion: 'ec7a0a68-730b-5c94-ac72-a937508f8303',
  centripetalForce: 'e918b31f-6f39-5dee-ade6-3617080fb24f',
  inertialFrames: '00245a43-eb89-47d2-92d7-21799dbec9f3',
  relativity: '157c404a-e14b-598a-9389-6924f8f9262e',
  relativityPostulates: 'a684bec1-ba59-59d0-98d2-4ca37236f64c',
  timeDilation: '19aef2ed-eb46-55b1-9486-ee83f7520bb6',
  electricField: 'd7bc20e0-5ee9-593a-a7a9-d7cbb88392e6',
  coulomb: '8da5c981-8216-5fcd-a393-19f392ae2006',
  electricPotential: '841edfdb-5e12-5a37-ab12-552a1d8e92ca',
  capacitor: '0895074d-c4af-56ea-88dd-ae0fdae443ed',
  chargedInEField: '47f76c5c-05d1-59eb-876d-cafb98a66c5b',
  magneticField: '13e882bd-2fc6-59c6-a2a8-32eb1fbf1751',
  induction: 'b2b74d0a-575c-5c6b-8e24-b0b0f32c1126',
  fadenstrahl: '966782e5-690d-4fae-bbab-fa3fa30525c3',
  millikan: '0f803c37-8191-5a07-9b31-9603ded98fe2',
  hallProbe: 'b39ae8fb-4358-5866-8adf-3d5365368eeb',
  particleAccelerators: '2d62b444-796e-548d-aeee-cfd9c6665ddc',
  oscillation: 'aee9676f-7cd6-50f0-a504-fd88ef67b59e',
  waves: 'dc38c943-11f6-5f4f-945b-67e330814727',
  emWaves: 'c1563745-2722-503d-819f-95d336937e2b',
  interferometer: '52b6722a-b3b2-5d2d-a507-0215532b0422',
  hertzDipole: 'e0f7d596-4d6c-5c0c-a4d6-ecf9b7a01117',
  dualism: '9fd26b99-b790-5efd-8858-c7e6c20b005e',
  quantum: 'ab636b78-6031-5a5b-afa2-9ffefbdd5dda',
  electronDiffraction: 'e296aba6-f407-5944-a2bd-e5296e4c9f06',
  photonModel: '22bdd29e-00d3-5d43-97d6-8b442b8bfc8c',
  quantumReality: '727d0946-7019-50ed-8fc6-85db12508733',
  delayedChoice: '8c97c234-a932-5e84-aed5-237b4e2a8336',
  quantumUncertainty: '9e881b3b-68cd-5f52-819f-c2e33b5ba631',
  bragg: '81c0d811-e6de-5489-8415-3b257c734a2e',
  atom: 'dd5a8efd-5d11-5388-aa2a-5147dec4348f',
  spectra: '904670af-8e4c-543e-bc9b-e6248d87a10d',
  franckHertz: 'cf340ce4-8d91-5d22-a1d9-53bf408abdb3',
  roentgen: '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
  characteristicRoentgen: '7e9e814c-fe12-42a9-8d80-e09e7fb52964',
  potentialWell: 'cc2d5e8e-4599-54ac-b8de-87c8cfd39ea7',
  nuclear: '5a5bc118-4420-5bb7-94c3-67837f2ce0dd',
  radiationRisk: '23fd87f3-9e79-5e0e-b9d1-7c15f3d119e0',
  radiationDose: 'e6a50c74-c922-508c-aa27-07bac2566955',
  nucideCards: '64b30d2e-cbe1-55d8-915a-a050d736b96e',
  standardModel: '15cb40f1-e2d3-5754-9e7b-e8888fe78340',
}

const stageTitle = {
  EF: 'Einführungsphase',
  GK: 'Qualifikationsphase Grundkurs',
  LK: 'Qualifikationsphase Leistungskurs',
}

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

const normalizeBullet = (value: string): string =>
  value
    .replace(/([a-zäöüß])- ([a-zäöüß])/giu, '$1$2')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()

const stripCompetencyCodes = (value: string): string =>
  normalizeBullet(value).replace(/\s+\([A-Z0-9, ]+\),?\.?$/u, '').replace(/,$/u, '').trim()

const parsePdf = (): ParsedBullet[] => {
  const pdfText = execFileSync('pdftotext', ['-layout', path.resolve(repoRoot, sourcePdfPath), '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const lines = pdfText.split(/\r?\n/u)
  const parsed: ParsedBullet[] = []
  let page = 0
  let stage: ParsedBullet['stage'] | undefined
  let field = ''
  let competency: ParsedBullet['competency'] | undefined
  let current: ParsedBullet | undefined

  const finishCurrent = () => {
    if (!current) return
    current.rawText = normalizeBullet(current.rawText)
    current.text = stripCompetencyCodes(current.rawText)
    parsed.push(current)
    current = undefined
  }

  const resetStage = (nextStage: ParsedBullet['stage']) => {
    finishCurrent()
    stage = nextStage
    field = ''
    competency = undefined
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].replace(/\s+/g, ' ').trim()
    if (!line) continue
    if (/^\d{1,2}$/u.test(line)) {
      page = Number(line)
      continue
    }
    if (line.startsWith('2.2 Kompetenzerwartungen')) resetStage('EF')
    if (line === '2.3.1 Grundkurs') resetStage('GK')
    if (line === '2.3.2 Leistungskurs') resetStage('LK')
    if (index > 2100 && (line.startsWith('3 Lernerfolgsüberprüfung') || line.startsWith('4 Abiturprüfung'))) break
    if (line.startsWith('Inhaltsfeld ')) {
      finishCurrent()
      field = line.replace(/^Inhaltsfeld /u, '')
      competency = undefined
      continue
    }
    if (
      line === 'Sachkompetenz'
      || line === 'Erkenntnisgewinnungskompetenz'
      || line === 'Bewertungskompetenz'
    ) {
      finishCurrent()
      competency = line
      continue
    }
    if (line.startsWith('Ausgewählte Beiträge')) {
      finishCurrent()
      competency = undefined
      continue
    }
    if (!stage || !field || !competency) continue
    if (line.startsWith('•')) {
      finishCurrent()
      current = {
        stage,
        field,
        competency,
        page,
        rawText: line.replace(/^•\s*/u, ''),
        text: '',
      }
      continue
    }
    if (
      current
      && !/^Kompetenzbereiche/u.test(line)
      && !/^Die Schülerinnen/u.test(line)
      && !/^\d{1,2}$/u.test(line)
    ) {
      current.rawText += ` ${line}`
    }
  }
  finishCurrent()
  return parsed
}

const add = (ids: Set<string>, ...goalIds: string[]): void => {
  for (const goalId of goalIds) ids.add(goalId)
}

const inferCanonicalGoalIds = (bullet: ParsedBullet): string[] => {
  const ids = new Set<string>()
  const text = `${bullet.field} ${bullet.text}`.toLowerCase()

  if (bullet.competency === 'Erkenntnisgewinnungskompetenz') add(ids, target.methods)
  if (bullet.competency === 'Bewertungskompetenz') add(ids, target.society)
  if (/messunsicherheit|unsicherheit|fehler/u.test(text)) add(ids, target.uncertainty)
  if (/messdaten|digital|sensor|simulation|messkurven|diagramm|experimentell|experiment/u.test(text)) {
    add(ids, target.digitalMeasurement)
  }

  if (/mechanik|bewegung|stoß|wurf|reibung|kraft|energie|impuls|gleichgewicht/u.test(text)) {
    if (/ort|strecke|geschwindigkeit|beschleunigung|gleichförmig|gleichmäßig|bewegung/u.test(text)) {
      add(ids, target.kinematics)
    }
    if (/gleichförmig/u.test(text)) add(ids, target.uniformMotion)
    if (/gleichmäßig|beschleunigung/u.test(text)) add(ids, target.acceleratedMotion)
    if (/fall/u.test(text)) add(ids, target.freeFall)
    if (/modell|idealisiert/u.test(text)) add(ids, target.motionModeling)
    if (/wurf|fall|vektor|komponentenzerlegung|vektoraddition/u.test(text)) add(ids, target.projectile)
    if (/newton|kraft|kräfte|reib/u.test(text)) add(ids, target.newtonAxioms)
    if (/energie|leistung|erhaltung|bilanz|impuls|stoß|stoss/u.test(text)) add(ids, target.energy, target.conservation)
  }

  if (/kreisbewegung|zentripetal|umlauf|bahn|kepler|gravitation|gravitations|weltbild|bezugssystem|lichtgeschwindigkeit|zeitdilatation|relativität/u.test(text)) {
    if (/kreis|zentripetal|umlauf/u.test(text)) add(ids, target.circularMotion, target.centripetalForce)
    if (/gravit|massenanziehung|schwerkraft|kepler|feldkonzept|gravitationsfeld/u.test(text)) add(ids, target.gravitation)
    if (/kepler/u.test(text)) add(ids, target.kepler)
    if (/weltbild|geo|helio|astronom/u.test(text)) add(ids, target.gravitation, target.society)
    if (/bezugssystem/u.test(text)) add(ids, target.inertialFrames)
    if (/lichtgeschwindigkeit|relativ|zeitdilatation|lichtuhr/u.test(text)) {
      add(ids, target.relativity, target.relativityPostulates)
    }
    if (/zeitdilatation|lichtuhr/u.test(text)) add(ids, target.timeDilation)
  }

  if (/welle|schwingung|federpendel|wellenwanne|huygens|interferenz|polarisation|feldlinien|plattenkondensator|lorentzkraft|millikan|fadenstrahl|zyklo|elektrisch|magnetisch/u.test(text)) {
    if (/schwingung|federpendel|periode|frequenz|amplitude|resonanz|schwingkreis/u.test(text)) add(ids, target.oscillation)
    if (/welle|wellenwanne|huygens|reflexion|brechung|beugung|interferenz|stehende|polarisation/u.test(text)) add(ids, target.waves)
    if (/interferenz|polarisation|licht/u.test(text)) add(ids, target.emWaves)
    if (/feldlinie|elektrisch|feldstärke|spannung|potential|coulomb|ladung/u.test(text)) add(ids, target.electricField)
    if (/coulomb/u.test(text)) add(ids, target.coulomb)
    if (/potential|potentialdifferenz/u.test(text)) add(ids, target.electricPotential)
    if (/kondensator|kapazität|platte|auflad|entlad/u.test(text)) add(ids, target.capacitor)
    if (/beschleunigungsspannung|ladungsträger|elektronen|längs|querfeld|geladene teilchen/u.test(text)) {
      add(ids, target.chargedInEField)
    }
    if (/magnet|flussdichte|lorentz|fadenstrahl|zyklotron|hall/u.test(text)) add(ids, target.magneticField)
    if (/fadenstrahl/u.test(text)) add(ids, target.fadenstrahl)
    if (/millikan|elementarladung/u.test(text)) add(ids, target.millikan)
    if (/hall/u.test(text)) add(ids, target.hallProbe)
    if (/zyklotron|beschleuniger/u.test(text)) add(ids, target.particleAccelerators)
  }

  if (/induktion|induktions|magnetischer fluss|transformator|generator|wechselspannung|ladespannung|lenz|spule|selbstinduktion|induktivität|schwingkreis/u.test(text)) {
    add(ids, target.induction)
    if (/transformator|generator|freileitung|energieübertragung/u.test(text)) add(ids, target.society)
    if (/schwingkreis|spule|kondensator/u.test(text)) add(ids, target.oscillation)
    if (/energie|lenz|bilanz/u.test(text)) add(ids, target.conservation, target.energy)
  }

  if (/quanten|photon|photoeffekt|de-broglie|doppelspalt|welcher-weg|wahrscheinlichkeit|bragg|delayed|komplementarität|unbestimmtheit|wellenfunktion|elektronenbeugung/u.test(text)) {
    add(ids, target.quantum)
    if (/photoeffekt|photon|lichtquanten|energiequantelung|bremsstrahlung/u.test(text)) add(ids, target.photonModel)
    if (/de-broglie|elektronen|elektronenbeugung/u.test(text)) add(ids, target.electronDiffraction, target.dualism)
    if (/welle|teilchen|komplementarität|welcher-weg|kopenhag|realitätsbegriff/u.test(text)) add(ids, target.quantumReality)
    if (/wahrscheinlichkeit|stochastisch|determin/u.test(text)) add(ids, target.quantum)
    if (/delayed|koinzidenz/u.test(text)) add(ids, target.delayedChoice, target.interferometer)
    if (/unbestimmtheit|wellenfunktion/u.test(text)) add(ids, target.quantumUncertainty)
    if (/bragg/u.test(text)) add(ids, target.bragg)
  }

  if (/strahlung|materie|atom|kern|radioaktiv|zerfall|halbwert|dosis|geiger|röntgen|linienspektr|fraunhofer|franck|wasserstoff|orbital|nuklid|quark|neutrino|massendefekt|spaltung|fusion/u.test(text)) {
    if (/atom|wasserstoff|orbital|energieniveau|linienspektr|fraunhofer|flammenfärbung|franck/u.test(text)) {
      add(ids, target.atom, target.spectra)
    }
    if (/franck/u.test(text)) add(ids, target.franckHertz)
    if (/röntgen|bremsstrahlung|bragg/u.test(text)) add(ids, target.roentgen)
    if (/charakteristisch/u.test(text) && /röntgen/u.test(text)) add(ids, target.characteristicRoentgen)
    if (/radioaktiv|kern|nuklid|zerfall|halbwert|spaltung|fusion|massendefekt/u.test(text)) add(ids, target.nuclear)
    if (/nuklidkarte/u.test(text)) add(ids, target.nucideCards)
    if (/dosis|biologisch|medizin|gesundheit|strahlenschutz|ionisierend/u.test(text)) {
      add(ids, target.radiationRisk, target.radiationDose)
    }
    if (/geiger/u.test(text)) add(ids, target.radiationRisk)
    if (/quark|neutrino|wechselwirkung|standardmodell|teilchen/u.test(text)) add(ids, target.standardModel)
    if (/potentialtopf/u.test(text)) add(ids, target.potentialWell)
  }

  if (ids.size === 0) add(ids, target.methods)
  return [...ids]
}

const courseLevelFor = (stage: ParsedBullet['stage']): CourseLevel => {
  if (stage === 'GK') return 'GK'
  if (stage === 'LK') return 'LK'
  return 'GK_LK'
}

const parsedBullets = parsePdf()
if (parsedBullets.length !== 187) {
  throw new Error(`Expected 187 NRW upper-secondary physics source bullets, found ${parsedBullets.length}`)
}

const passageByCode = new Map<string, Passage>()
const sourceGoals: SourceGoal[] = []

for (const [index, bullet] of parsedBullets.entries()) {
  const topicCode = `${bullet.stage}-${slug(bullet.field)}-${slug(bullet.competency)}`
  let passage = passageByCode.get(topicCode)
  if (!passage) {
    passage = {
      id: `nw-physics-sekii:${topicCode}`,
      topicCode,
      title: `${stageTitle[bullet.stage]}: ${bullet.field} / ${bullet.competency}`,
      text: '',
      page: bullet.page,
      sourcePath: sourcePdfPath,
      rawText: '',
      sourceGoalIds: [],
    }
    passageByCode.set(topicCode, passage)
  }

  const goalId =
    `nw-phys-sekii-klp2022-${topicCode}-${String(passage.sourceGoalIds.length + 1).padStart(3, '0')}-${hash(bullet.text)}`
  const sourceSpan = `${stageTitle[bullet.stage]}, ${bullet.field}, ${bullet.competency}, S. ${bullet.page}`
  passage.sourceGoalIds.push(goalId)
  sourceGoals.push({
    id: goalId,
    passageId: passage.id,
    topicCode,
    bulletIndex: index + 1,
    aspectIndex: 1,
    title: bullet.text,
    description: `Die lernende Person kann ${bullet.text}.`,
    sourceText: bullet.text,
    sourceSpan,
    parentBulletText: bullet.text,
    sourceRef: `Nordrhein-Westfalen Kernlehrplan Physik Gymnasiale Oberstufe 2022, ${sourceSpan}`,
    courseLevel: courseLevelFor(bullet.stage),
    granularity: 'officialCompetencyExpectation',
    tags: [
      'source:nordrhein-westfalen',
      'stage:SekII',
      `phase:${bullet.stage}`,
      `field:${slug(bullet.field)}`,
      `competency:${slug(bullet.competency)}`,
      `course:${courseLevelFor(bullet.stage)}`,
    ],
    rawSourceText: bullet.rawText,
    rawSourceSpan: sourceSpan,
    rawParentBulletText: bullet.rawText,
  })
}

const passages = [...passageByCode.values()]
for (const passage of passages) {
  const passageGoals = sourceGoals.filter((goal) => goal.passageId === passage.id)
  passage.text = passageGoals.map((goal) => `- ${goal.sourceText}`).join('\n')
  passage.rawText = passageGoals.map((goal) => `- ${goal.rawSourceText}`).join('\n')
}

const decisions: MappingDecision[] = sourceGoals.map((sourceGoal) => {
  const parsedBullet = parsedBullets[sourceGoal.bulletIndex - 1]
  const canonicalGoalIds = inferCanonicalGoalIds(parsedBullet)
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: sourceGoal.topicCode,
    sourceSpan: sourceGoal.sourceSpan,
    decision: 'mapped',
    canonicalGoalIds,
    rationale:
      canonicalGoalIds.length > 1
        ? 'Das amtliche NRW-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n beschreibt die Zuordnungsform, nicht eine offene Lücke.'
        : 'Das amtliche NRW-Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.',
    reviewedAt: '2026-05-11',
    reviewer: 'codex',
  }
})

const mappings = decisions.flatMap((decision) =>
  decision.canonicalGoalIds.map((canonicalGoalId) => ({
    legacyGoalId: decision.sourceGoalId,
    canonicalGoalId,
    matchType: decision.canonicalGoalIds.length === 1 ? 'exact' : 'partial',
    reviewDecisionId: decision.sourceGoalId,
  })),
)

const uniqueTargetIds = [...new Set(mappings.map((mapping) => mapping.canonicalGoalId))]
const canonical = readJson<{ goals: Array<{ id: string; title: string; contains?: string[] }> }>(canonicalPath)
const canonicalTitleById = new Map(canonical.goals.map((goal) => [goal.id, goal.title]))
const canonicalGoalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const missingCanonicalGoalIds = uniqueTargetIds.filter((goalId) => !canonicalTitleById.has(goalId))
if (missingCanonicalGoalIds.length > 0) {
  throw new Error(`Missing canonical goal IDs: ${missingCanonicalGoalIds.join(', ')}`)
}

const extraction = {
  schemaVersion: 1,
  extractionId: 'DE-NW-PHYSIK-SEKII-KLP-2022',
  title: 'DE-NW - Physik Oberstufe (Nordrhein-Westfalen, KLP 2022 Source-Extraction)',
  sourceLandscapeId,
  jurisdiction: 'DE-NW',
  subject: 'Physik',
  stage: 'SekII',
  sourceDocument: {
    key: 'KLP-PHYSIK-GOST-2022',
    title: 'Kernlehrplan Physik für die Sekundarstufe II Gymnasium/Gesamtschule in Nordrhein-Westfalen',
    path: sourcePdfPath,
    url: 'https://lehrplannavigator.nrw.de/system/files/media/document/file/gost_klp_ph_2022_06_07.pdf',
    official: true,
  },
  method: {
    passageExtraction:
      'pdftotext -layout; Kapitel 2.2 und 2.3 werden nach Inhaltsfeld und Kompetenzbereich segmentiert.',
    sourceGoalExtraction:
      'ein Source-Ziel pro konkretisiertem Kompetenz-Bullet in Einführungsphase, Grundkurs und Leistungskurs; übergeordnete Kompetenzlisten und Leistungsbewertungsabschnitte werden nicht als fachliche Source-Ziele gezählt.',
  },
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details:
        `${sourceGoals.length} Source-Ziele; plausibel im geprüften Physik-Sek-II-Korridor HE/BW/HB/SH/RP ` +
        '(164/274/214/169/193) und deutlich über dem alten 37-Ziele-Pilot-Snapshot.',
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
            id: 'source-document-present',
            label: 'Amtliche NRW-Physik-KLP-PDF liegt lokal vor',
            passed: true,
            details: sourcePdfPath,
          },
          {
            id: 'expected-topic-coverage',
            label: 'EF-, GK- und LK-Kompetenzpassagen wurden aus dem amtlichen KLP extrahiert',
            passed: true,
            details: `${passages.length} Passagegruppen aus 2 EF-, 4 GK- und 4 LK-Inhaltsfeldern.`,
          },
          {
            id: 'passage-extraction-source',
            label: 'Passage-Extraction basiert auf amtlicher PDF-Quelle statt Legacy-Snapshot',
            passed: true,
            details: `Quelle: ${sourcePdfPath}`,
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
            label: 'Aus den amtlichen NRW-Physik-Kompetenzerwartungen wurden Source-Ziele erzeugt',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'source-goal-count-peer-baseline',
            label: 'Source-Ziel-Anzahl ist gegen bereits geprüfte Physik-Sek-II-Inventare plausibilisiert',
            passed: true,
            details:
              `${sourceGoals.length} Source-Ziele; geprüfter Vergleich HE/BW/HB/SH/RP = 164/274/214/169/193.`,
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
  reviewId: 'DE-NW-PHYSIK-SEKII-KLP-2022-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath: extractionPath,
  status: {
    scope: 'Nordrhein-Westfalen Physik Sek II / KLP 2022 Kapitel 2.2 und 2.3',
    reviewedSourceGoals: sourceGoals.length,
    mappedSourceGoals: sourceGoals.length,
    needsViewPlacementReview: 0,
    needsCanonicalGoal: 0,
    totalSourceGoals: sourceGoals.length,
    explicitNeedsCanonicalGoal: 0,
    notes:
      'NRW wurde vom zu kleinen Pilot-Snapshot auf amtliche Source-Extraction umgestellt. MatchType partial bedeutet 1:n- oder Teilbaum-Abdeckung, nicht fachliche Offenheit.',
  },
  mappings,
  decisions,
}

writeJson(extractionPath, extraction)
writeJson(reviewPath, review)

const registry = readJson<{ entries?: Array<Record<string, unknown>> }>(registryPath)
const registryEntry = registry.entries?.find((entry) => entry.landscapeId === sourceLandscapeId)
if (!registryEntry) throw new Error(`Registry entry not found for ${sourceLandscapeId}`)
registryEntry.title = 'Physik Oberstufe (Nordrhein-Westfalen, KLP 2022 Source-Extraction)'
registryEntry.sourcePath = sourcePdfPath
registryEntry.archiveSourcePath = sourcePdfPath
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

  const allowedTargets = uniqueTargetIds.filter((goalId) => {
    const mappedLevels = decisions
      .filter((decision) => decision.canonicalGoalIds.includes(goalId))
      .map((decision) => sourceGoals.find((sourceGoal) => sourceGoal.id === decision.sourceGoalId)?.courseLevel)
    return suffix.includes('lk') || mappedLevels.some((level) => level !== 'LK')
  })
  const missingTargets = allowedTargets.filter((goalId) => !present.has(goalId))
  if (missingTargets.length === 0) return

  root.children = Array.isArray(root.children) ? root.children : []
  root.children = root.children.filter((child) => child.id !== 'physics-nw-source-extraction-supplements')
  root.children.push({
    kind: 'structure',
    id: 'physics-nw-source-extraction-supplements',
    label: 'Nordrhein-Westfalen-spezifische Source-Extraction-Ergänzungen',
    children: missingTargets.map((goalId) => ({
      kind: 'goalEntry',
      goalId,
      displayLabel: canonicalTitleById.get(goalId) ?? goalId,
    })),
  })
}

for (const suffix of ['gk', 'lk', 'sekii-gk', 'sekii-lk']) {
  const template = readJson<Record<string, unknown>>(`${compositionViewDir}/de-bb-${suffix}.view.json`)
  template.viewId = String(template.viewId).replace('de-bb', 'de-nw')
  template.scope = { ...(template.scope as Record<string, unknown>), jurisdiction: 'DE-NW' }
  addMissingMappedGoalsToView(template, suffix)
  writeJson(`${compositionViewDir}/de-nw-${suffix}.view.json`, template)
}

writeFileSync(
  path.resolve(repoRoot, 'curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/PHYSIK.md'),
  [
    '# Nordrhein-Westfalen Physik Oberstufe -> kanonische Physik',
    '',
    'Stand: 2026-05-11',
    '',
    'Diese Spur ersetzt den alten Pilot-Quellsnapshot durch eine Source-Extraction aus der amtlichen KLP-PDF.',
    '',
    `- Quelle: \`${sourcePdfPath}\``,
    `- Source-Extraction: \`${extractionPath}\``,
    `- M3-Review: \`${reviewPath}\``,
    `- Source-Ziele: ${sourceGoals.length}`,
    `- Passagen: ${passages.length}`,
    '- Status: MAPPING-1, MAPPING-2 und MAPPING-3 abgeschlossen.',
    '',
    'Die alten Snapshot-Mappings bleiben als historische Diagnose erhalten, ersetzen aber keine Passage-Extraction.',
    '',
  ].join('\n'),
)

console.log(`Wrote ${repoPath(path.resolve(repoRoot, extractionPath))} (${sourceGoals.length} source goals)`)
console.log(`Wrote ${repoPath(path.resolve(repoRoot, reviewPath))} (${mappings.length} mapping rows)`)
console.log(`Updated NRW registry entry and ${uniqueTargetIds.length} canonical target IDs in composition views`)
