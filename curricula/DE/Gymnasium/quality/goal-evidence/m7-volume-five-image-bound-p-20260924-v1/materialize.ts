import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs } from '../../../../../../app/scripts/goalBookModel'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from '../../../../../../app/scripts/positiveGoalEvidenceReview'
import type { PositiveGoalEvidenceProfile, PositiveGoalEvidenceReviewRecord } from '../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const source = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-bodies-volume-keep9-p-20260923-v1'
const output = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-volume-five-image-bound-p-20260924-v1'
const reviewId = 'canonical-math-positive-understanding-evidence-m7-volume-five-image-bound-20260924-v1'
const configPath = `${output}/current-five.config.json`
const candidatesPath = `${output}/current-five.candidates.json`
const reviewPath = `${output}/current-five.review.jsonl`

const specs = [
  {
    goalId: '1e77bb2f-0cd6-5961-b0fb-230317c73fce',
    title: 'Volumen von Prismen aus Grundfläche und Höhe bestimmen',
    descriptionDe: 'Die lernende Person kann den Zusammenhang V = G · h geometrisch erklären und nutzen, um Volumina von Prismen aus Skizzen oder Koordinaten zu bestimmen und Einheiten korrekt anzugeben.',
    descriptionEn: 'The learner can explain the geometric relationship V = G · h and use it to determine prism volumes from sketches or coordinates and state units correctly.',
    notationReview: 'V = G · h replaces TeX V = G \\cdot h in DE and EN. It is the same product of base area and perpendicular height; geometric layer argument, sketch/coordinate transfer and cubic units remain required by the P profile.',
    legacyGoalId: 'ad673b1a-651d-4d0b-b762-05608c65ff43',
    imageSha: 'sha256:a1b47a5101c3cbdc74ac97cfb165c445525984740bccc7fa3d580c0258f6d67d',
    expectedCases: ['right-triangular-prism', 'oblique-coordinate-prism'],
    reason: 'DE: Das aktuelle Comic-PNG zeigt G=20 cm², h=7 cm und gleich große Prismenschichten; die sichtbaren 5 cm und 4 cm erklären G, 140 cm³ ist konsistent. Die unabhängigen P-Fälle verwenden ein Dreiecksprisma und ein schiefes Koordinatenprisma; beide verlangen Begründung des Schichtprinzips, senkrechte Höhe und Einheiten, ohne die Bildzahlen zu übernehmen. Kein Verweis auf eine Formelsammlung. EN: The current comic correctly depicts equal prism cross-sections; fresh triangular and oblique-coordinate prisms require explanation, perpendicular height, and units independently of the image. AI candidate only.',
  },
  {
    goalId: '288633c1-f61c-5b48-af7e-a80357f96cad',
    title: 'Volumen von Pyramiden aus Grundfläche und Höhe bestimmen',
    descriptionDe: 'Die lernende Person kann den Faktor 1/3 als Verhältnis zum entsprechenden Prisma deuten und den Zusammenhang V = (G · h)/3 nutzen, um Volumina von Pyramiden aus Skizzen oder Koordinaten zu bestimmen.',
    descriptionEn: 'The learner can interpret the factor 1/3 as the volume ratio to the corresponding prism and use V = (G · h)/3 to determine pyramid volumes from sketches or coordinates.',
    notationReview: 'Plain 1/3 and V = (G · h)/3 replace TeX fraction notation in DE and EN without changing the one-third ratio for a matched prism. The profile still requires matching base and perpendicular height, not merely copying a formula.',
    legacyGoalId: '81f954f9-7031-4985-8d94-66e489fe6ce4',
    imageSha: 'sha256:10fc4e45edd3c4708b0466b2a7a3cb806ab72973eb265500fa6154342def165a',
    expectedCases: ['rectangular-pyramid-comparison', 'offset-apex-coordinate-pyramid'],
    reason: 'DE: Das aktuelle Comic-PNG vergleicht fachlich korrekt eine Pyramide mit dem Prisma gleicher quadratischer Grundfläche G=36 cm² und senkrechter Höhe h=9 cm; 108 cm³ ist ein Drittel von 324 cm³. Der neue P-Fall nutzt stattdessen 6×4 cm und h=12 cm, der zweite ein Koordinatendreieck mit versetzter Spitze. Beide prüfen das passende Vergleichsprisma, den senkrechten Ebenenabstand und die Begründung des Drittels. Kein Bild-Ablesen, keine Formelsammlung. EN: The image’s matching square-base comparison is sound; independent rectangular and offset-coordinate cases test the one-third relationship without reusing its answer. AI candidate only.',
  },
  {
    goalId: 'c71ae268-f28e-59f0-982d-91db8f963378',
    title: 'Volumen von Zylindern aus Radius und Höhe bestimmen',
    descriptionDe: 'Die lernende Person kann die Kreisfläche als Grundfläche eines Zylinders deuten und den Zusammenhang V = πr²h nutzen, um Volumina aus Skizzen oder Koordinaten zu bestimmen.',
    descriptionEn: 'The learner can interpret the circular area as the base of a cylinder and use V = πr²h to determine volumes from sketches or coordinates.',
    notationReview: 'V = πr²h replaces TeX V = \\pi r^2 h in DE and EN. The circular base area G = πr², perpendicular height and the fresh diameter/coordinate demonstrations have unchanged mathematical scope.',
    legacyGoalId: 'bec4e2c8-6b36-4718-9e4a-1e0eb8c259f6',
    imageSha: 'sha256:cd58c981faa6708374b0d25bfa30b953d975e16db4e8c9cac406432fd057eb2f',
    expectedCases: ['diameter-sketch-cylinder', 'coordinate-cylinder'],
    reason: 'DE: Das aktuelle Comic-PNG zeigt r=3 cm, h=10 cm, G=9π cm² und V=90π cm³ mit gleich großen Kreisquerschnitten; Zahlen, senkrechte Höhe und Einheiten sind stimmig. Die P-Fälle verlangen unabhängig davon einen Radius aus Durchmesser und aus Raumkoordinaten sowie Kreisfläche, Volumen und deren Einheiten. Kein Formelsammlungsrahmen. EN: The image correctly connects circle area with equal cylinder cross-sections; fresh diameter and coordinate cases test radius, perpendicular height, area, volume, and units. AI candidate only.',
  },
  {
    goalId: 'e8237315-654e-5150-97de-49c4cb49b3d1',
    title: 'Volumen von Kegeln aus Radius und Höhe bestimmen',
    descriptionDe: 'Die lernende Person kann den Faktor 1/3 als Verhältnis zum entsprechenden Zylinder deuten und den Zusammenhang V = (πr²h)/3 nutzen, um Volumina von Kegeln aus Skizzen oder Koordinaten zu bestimmen.',
    descriptionEn: 'The learner can interpret the factor 1/3 as the volume ratio to the corresponding cylinder and use V = (πr²h)/3 to determine cone volumes from sketches or coordinates.',
    notationReview: 'Plain 1/3 and V = (πr²h)/3 replace TeX fraction notation in DE and EN. The ratio is still to a cylinder with the same circle base and perpendicular height; the P sketch/coordinate cases remain independent.',
    legacyGoalId: 'e02b165a-04e6-451c-8bdf-3d5d5232fce4',
    imageSha: 'sha256:cc856d368af2a51ed0376c680f514606fcd68cf03bdeb7086b298e4e4f81b9d6',
    expectedCases: ['matched-cylinder-sketch', 'coordinate-cone'],
    reason: 'DE: Das aktuelle Comic-PNG vergleicht Kegel und Zylinder mit r=3 cm und senkrechter h=12 cm; 36π cm³ ist ein Drittel von 108π cm³. Die P-Fälle nutzen andere Maße r=4 cm, h=9 cm und danach Koordinaten mit r=5 cm; sie fordern die Wahl des passenden Zylinders, die Unterscheidung senkrechter Höhe von Mantellinie und Einheiten. Kein Bild-Ablesen, keine Formelsammlung. EN: The image’s matching cone-cylinder volumes are consistent; fresh sketch and coordinate cases require independent one-third reasoning and correct height. AI candidate only.',
  },
  {
    goalId: '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda',
    title: 'Volumen von Kugeln aus dem Radius bestimmen',
    descriptionDe: 'Die lernende Person kann die kubische Abhängigkeit des Kugelvolumens vom Radius beschreiben und den Zusammenhang V = (4/3)πr³ nutzen, um Kugelvolumina aus Skizzen oder Koordinaten zu bestimmen.',
    descriptionEn: 'The learner can describe the cubic dependence of sphere volume on the radius and use V = (4/3)πr³ to determine sphere volumes from sketches or coordinates.',
    notationReview: 'V = (4/3)πr³ replaces TeX fraction/power notation in DE and EN. Radius, cubic dependence, coordinate distance and units have identical meaning; the P profile tests 3/2 scaling independently of the image.',
    legacyGoalId: '4dfd5efe-05a8-4a9d-b53d-8f1e6633e1aa',
    imageSha: 'sha256:25ba62f5e8e573f6a22b28b1aec1ffa11776a3ed4a6034387a7da32ead1ed891',
    expectedCases: ['diameter-and-three-halves', 'coordinate-radius'],
    reason: 'DE: Das aktuelle Comic-PNG zeigt Kugelradien 3 und 6 cm, Volumina 36π und 288π cm³ und damit die korrekte kubische Skalierung 1:8. Der neue P-Fall beginnt mit Durchmesser 8 cm und skaliert den Radius auf 6 cm (Faktor 3/2, Volumenfaktor 27/8); der zweite ermittelt r räumlich aus Koordinaten. Beide prüfen die kubische Beziehung unabhängig vom Bild. Kein Formelsammlungsrahmen. EN: The image correctly illustrates doubling radius and eightfold volume; fresh 3/2 scaling and coordinate-radius cases demand independent cubic reasoning. AI candidate only.',
  },
] as const

const historicalSha = {
  config: 'sha256:d91b5bbc547219bf9c5c0f6ef1bd8c076cb7ba33f22a3beb7d200a14858ac962',
  candidates: 'sha256:491eaf30d0de0d433443396cdb7f3d4e3fe02873e9c618f5ddc80d14cfa9a59c',
  review: 'sha256:8b8cae94331974897367ef42e6e6aef9afdb7a5550da3fb6c7be433686ba4048',
} as const

// Immutable fingerprint snapshot of the image-bound P review before the five
// canonical DE/EN descriptions changed from TeX to plain Unicode notation.
// The former review is not registered as current evidence after this rebind.
const priorCurrentReviewSha = 'sha256:e87d8f5e799d58ed1e201437be25be9ddff1d5ece92ae362aadfcebe4db2873d'
const priorCurrentFingerprints: Record<string, { goal: string; input: string; profile: string }> = {
  '1e77bb2f-0cd6-5961-b0fb-230317c73fce': { goal: 'sha256:f872807fd39211a578386e526b1305c28d30c2f24c155ca004d5d42c5a19d9aa', input: 'sha256:411174daf2e9c342fa3cd4fa1ac9db651343c88259616f46fdd685fec3adcdc3', profile: 'sha256:a474e0ef5fba6b8ef5d0f40764f85dacc862cefb89f307038a19dfb34f075fa1' },
  '288633c1-f61c-5b48-af7e-a80357f96cad': { goal: 'sha256:4bf22f444746da313d26217d79b2dbf66be3c9d4a6e2d9a92538184039e966ee', input: 'sha256:47c7901b67ce9a42f49dc07902a32cfe1f2abfe22f2a67ea589f3a5da23d171a', profile: 'sha256:776b9c4d65f3ea7e4b27df7d6913934e90047f2491841361cf58bb2dbb0971e1' },
  'c71ae268-f28e-59f0-982d-91db8f963378': { goal: 'sha256:c43e4f2cfc633c7e8865ccb6847639640a574ccdfeb965d205c30fa64035f6ce', input: 'sha256:38ca3a6f93a6e91f8e372845691dd8490131523139cabbe1d2e233168fa9480b', profile: 'sha256:aea8eb70e0a974666f2706ef211fc0b4c23e3bc38df3b064ea16bf31ac14af9d' },
  'e8237315-654e-5150-97de-49c4cb49b3d1': { goal: 'sha256:5532a3ba6e01ec310e19f30efbea95e23803157950dd7e707cd6a227ed314fe8', input: 'sha256:21c92eeef487c7dced5505ad457cdd684b1c41dbd1a2a081a0a3428ba20295bf', profile: 'sha256:4b6455806bc1ac14283771ca006ea21960601ce531344b6ec1204ad08114fe2a' },
  '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda': { goal: 'sha256:75bd067f3d29af1c19b5e002826aa961e651af3802c480ddde91ef80e897a6c5', input: 'sha256:573b4a6aaeff5aa58f506283c62eba1447d09741f8604be9718e27552440d2c9', profile: 'sha256:e1ed61bf36bd3fb14e1e1a3cfe78f5eae413aa95309d79daec5cee0bb46ebd49' },
}

const sha256 = (data: Buffer | string) => `sha256:${createHash('sha256').update(data).digest('hex')}`
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message) }
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(join(root, path), 'utf8')) as T
const readOptional = async (path: string): Promise<Buffer | null> => {
  try { return await readFile(join(root, path)) } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
const verifyOrWrite = async (path: string, expected: Buffer, write: boolean) => {
  assert(path.startsWith(`${output}/`), `Refusing to write outside this new P package: ${path}`)
  const previous = await readOptional(path)
  if (previous?.equals(expected)) return
  assert(write, `${path}: generated evidence missing or differs`)
  if (previous) await writeFile(join(root, path), expected)
  else {
    await mkdir(dirname(join(root, path)), { recursive: true })
    await writeFile(join(root, path), expected, { flag: 'wx' })
  }
}
const caseById = (profile: PositiveGoalEvidenceProfile, id: string) => {
  const applicationCase = profile.applicationCaseBriefs.find((entry) => entry.id === id)
  assert(applicationCase, `Historical P case missing: ${id}`)
  return applicationCase
}

function freshProfile(goalId: string, historical: PositiveGoalEvidenceProfile): PositiveGoalEvidenceProfile {
  const profile = structuredClone(historical)
  if (goalId === specs[1].goalId) {
    const axis = profile.variationAxes.find(({ id }) => id === 'base-and-apex-information')
    assert(axis, 'Pyramid variation axis missing')
    axis.textDe = 'Rechteckige Grundfläche mit direkt gegebener Höhe gegenüber koordinatengegebenem Dreiecksgrundriss und seitlich versetzter Spitze.'
    axis.textEn = 'Rectangular base with directly given height versus a coordinate-given triangular base and laterally offset apex.'
    const task = caseById(profile, 'square-pyramid-comparison')
    task.id = 'rectangular-pyramid-comparison'
    task.taskDemandDe = 'Eine Pyramide hat eine rechteckige Grundfläche mit Seiten 6 cm und 4 cm sowie die senkrechte Höhe 12 cm. Bestimme die Volumina der Pyramide und des passenden Prismas; erläutere das Verhältnis und die Einheiten.'
    task.taskDemandEn = 'A pyramid has a rectangular base measuring 6 cm by 4 cm and a perpendicular height of 12 cm. Find the volumes of the pyramid and matching prism; explain their ratio and units.'
    task.expectedPerformanceDe = 'G=6·4=24 cm². Das passende Prisma mit gleicher Grundfläche und Höhe hat V=24·12=288 cm³; die Pyramide hat ein Drittel davon, also 96 cm³. Die Volumeneinheit entsteht aus cm²·cm.'
    task.expectedPerformanceEn = 'G=6·4=24 cm². The matching prism with the same base and height has V=24·12=288 cm³; the pyramid has one third of that, 96 cm³. The volume unit comes from cm²·cm.'
    task.understandingFocusDe = 'Das Drittelverhältnis gilt für das Prisma mit genau derselben rechteckigen Grundfläche und senkrechten Höhe; Flächen- und Längeneinheit ergeben cm³.'
    task.understandingFocusEn = 'The one-third ratio applies to a prism with exactly the same rectangular base and perpendicular height; area and length units yield cm³.'
  } else if (goalId === specs[3].goalId) {
    const task = caseById(profile, 'matched-cylinder-sketch')
    task.taskDemandDe = 'Ein gerader Kegel hat Radius 4 cm und senkrechte Höhe 9 cm. Bestimme das Volumen des Zylinders mit gleicher Grundfläche und Höhe und daraus das Kegelvolumen; erkläre den Faktor und gib die Einheit an.'
    task.taskDemandEn = 'A right cone has radius 4 cm and perpendicular height 9 cm. Find the volume of a cylinder with the same base and height and from it the cone volume; explain the factor and state the unit.'
    task.expectedPerformanceDe = 'G=π·4²=16π cm² und das passende Zylindervolumen ist 16π·9=144π cm³. Der Kegel fasst ein Drittel davon, V=48π cm³. Die Höhe ist senkrecht, nicht die Mantellinie.'
    task.expectedPerformanceEn = 'G=π·4²=16π cm² and the matching cylinder volume is 16π·9=144π cm³. The cone holds one third, V=48π cm³. Height is perpendicular, not the slant edge.'
  } else if (goalId === specs[4].goalId) {
    const axis = profile.variationAxes.find(({ id }) => id === 'radius-representation-and-scale')
    assert(axis, 'Sphere variation axis missing')
    axis.textDe = 'Radius aus einer Durchmesser-Skizze und Skalierung um Faktor 3/2 gegenüber Radius als räumlichem Mittelpunkt-Oberflächen-Abstand aus Koordinaten.'
    axis.textEn = 'Radius from a diameter sketch and scaling by a factor of 3/2 versus radius as a spatial center-to-surface distance from coordinates.'
    const task = caseById(profile, 'diameter-and-doubling')
    task.id = 'diameter-and-three-halves'
    task.taskDemandDe = 'Eine Skizze zeigt eine Kugel mit Durchmesser 8 cm. Bestimme ihr Volumen exakt. Eine zweite Kugel hat den 1,5-fachen Radius. Bestimme ihr Volumen und begründe den Volumenfaktor ohne nur zwei Ergebnisse zu vergleichen.'
    task.taskDemandEn = 'A sketch shows a sphere with diameter 8 cm. Find its exact volume. A second sphere has 1.5 times the radius. Find its volume and justify the volume factor without merely comparing two numerical answers.'
    task.expectedPerformanceDe = 'Der erste Radius ist r=4 cm, daher V=(4/3)π·4³=(256/3)π cm³. Der zweite Radius ist 6 cm und V=(4/3)π·6³=288π cm³. Weil r³ skaliert wird, ist der Volumenfaktor (3/2)³=27/8.'
    task.expectedPerformanceEn = 'The first radius is r=4 cm, so V=(4/3)π·4³=(256/3)π cm³. The second radius is 6 cm and V=(4/3)π·6³=288π cm³. Since r³ scales, the volume factor is (3/2)³=27/8.'
    task.understandingFocusDe = 'Durchmesser und Radius werden unterschieden; die Kubik der veränderten Längenskala erklärt den Faktor 27/8 unabhängig von den Zahlen im Bild.'
    task.understandingFocusEn = 'Diameter and radius are distinguished; cubing the changed length scale explains the 27/8 factor independently of the image’s numbers.'
  }
  return profile
}

async function main() {
  const args = process.argv.slice(2)
  assert(args.length === 1 && ['--write', '--check'].includes(args[0]), 'Usage: tsx curricula/DE/Gymnasium/quality/goal-evidence/m7-volume-five-image-bound-p-20260924-v1/materialize.ts --write|--check')
  const write = args[0] === '--write'
  const historical = await Promise.all([
    readFile(join(root, source, 'text-only-six.config.json')),
    readFile(join(root, source, 'text-only-six.candidates.json')),
    readFile(join(root, source, 'text-only-six.review.jsonl')),
  ])
  assert(sha256(historical[0]) === historicalSha.config && sha256(historical[1]) === historicalSha.candidates && sha256(historical[2]) === historicalSha.review, 'Historical P inputs changed; stop and review before reusing their profiles')
  const oldConfig = JSON.parse(historical[0].toString('utf8')) as PositiveGoalEvidenceReviewConfig
  const oldCandidates = JSON.parse(historical[1].toString('utf8')) as { goals: Array<{ goalId: string; profile: PositiveGoalEvidenceProfile }> }
  const oldReviews = historical[2].toString('utf8').trimEnd().split('\n').map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord)
  const priorCurrentReviewBytes = await readOptional(reviewPath)
  assert(oldConfig.scope.goalIds.length === 6 && oldConfig.reviewedResourceTypes.length === 0 && oldReviews.length === 6, 'Expected historical six text-only AI candidates')
  assert(specs.every(({ goalId }) => oldConfig.scope.goalIds.includes(goalId)), 'Historical P scope no longer covers all five goals')
  assert(oldReviews.every((record) => record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate'), 'Historical P authority unexpectedly changed')
  assert(priorCurrentReviewBytes && Object.keys(priorCurrentFingerprints).length === 5, 'Expected existing five-goal image-bound P evidence before notation re-review')
  const mapping = await readJson<{ mappings: Array<{ legacyGoalId: string; canonicalGoalId: string; matchType: string }> }>('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json')
  const landscape = await readJson<{ goals: Array<{ id: string; title: string; description: string; descriptionEn: string; sourceRef?: string; resourceLinks?: Array<{ type: string; role?: string; resourceType?: string; skillpilotId?: string; url: string; altText?: string }> }> }>('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
  const qa = await readJson<{ records: Array<{ goalId: string; imageUrl: string; assetSha256: string; aiApproved?: string; aiApprovedAssetSha256?: string; publicAssetPath: string; canonicalAssetPath: string }> }>('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json')
  const base = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-math-national-atlas.json', root)
  assert(base.config.evidenceReviewPaths.length === 0, 'Expected base GoalBook without embedded P reviews')
  const bindings: Array<Record<string, unknown>> = []
  for (const spec of specs) {
    const goal = landscape.goals.find(({ id }) => id === spec.goalId)
    const page = base.model.pages.find(({ goalId }) => goalId === spec.goalId)
    const old = oldReviews.find(({ goalId }) => goalId === spec.goalId)
    const priorCurrent = priorCurrentFingerprints[spec.goalId]
    const oldCandidate = oldCandidates.goals.find(({ goalId }) => goalId === spec.goalId)
    const imageQa = qa.records.find(({ goalId }) => goalId === spec.goalId)
    const imageUrl = `/assets/goal-visualizations/mathematik/${spec.goalId}/${spec.goalId}.png`
    const link = goal?.resourceLinks?.find(({ type, role }) => type === 'goal-visualization' && role === 'primary')
    assert(goal?.title === spec.title && goal.description === spec.descriptionDe && goal.descriptionEn === spec.descriptionEn, `${spec.goalId}: current DE/EN goal meaning or notation changed beyond reviewed wording`)
    assert(page?.title === spec.title && page.description === goal.description && old?.goalFingerprint !== page.goalFingerprint && priorCurrent?.goal !== page.goalFingerprint, `${spec.goalId}: expected exactly a new current goal/page fingerprint after formula-notation change`)
    assert(priorCurrent?.profile && priorCurrent.input, `${spec.goalId}: prior image-bound P profile missing`)
    assert(goal.sourceRef === undefined, `${spec.goalId}: direct sourceRef changed; review source provenance`)
    assert(mapping.mappings.some((entry) => entry.legacyGoalId === spec.legacyGoalId && entry.canonicalGoalId === spec.goalId && entry.matchType === 'exact'), `${spec.goalId}: HE exact source mapping changed`)
    assert(oldCandidate && old?.profileFingerprint && oldCandidate.profile.applicationCaseBriefs.length === 2, `${spec.goalId}: historical independent P profile missing`)
    assert(link?.url === imageUrl && link.resourceType === 'image' && link.skillpilotId === spec.goalId && link.altText && !/formelsammlung/i.test(link.altText), `${spec.goalId}: current image URL, owner, or alt text changed`)
    assert(page.visualization?.url === imageUrl && page.visualization.altText === link.altText && page.visualization.originalDigest === spec.imageSha, `${spec.goalId}: rendered page image/alt/bytes changed`)
    assert(page.visualization.qaStatus === 'review_candidate' && page.visualization.approvedForPublication === false, `${spec.goalId}: page image review status unexpectedly changed`)
    assert(imageQa?.imageUrl === imageUrl && imageQa.assetSha256 === spec.imageSha && imageQa.aiApproved === 'yes' && imageQa.aiApprovedAssetSha256 === spec.imageSha, `${spec.goalId}: current AI V decision/hash not complete`)
    const copies = await Promise.all([
      readFile(join(root, imageQa.publicAssetPath)),
      readFile(join(root, imageQa.canonicalAssetPath)),
      readFile(join(root, 'backend/src/main/resources/static', imageUrl)),
    ])
    assert(copies.every((bytes) => sha256(bytes) === spec.imageSha), `${spec.goalId}: current PNG copies differ`)
    const profile = freshProfile(spec.goalId, oldCandidate.profile)
    assert(profile.applicationCaseBriefs.map(({ id }) => id).join('|') === spec.expectedCases.join('|'), `${spec.goalId}: independent transfer case IDs changed`)
    bindings.push({
      goalId: spec.goalId,
      title: goal.title,
      descriptionDe: goal.description,
      descriptionEn: goal.descriptionEn,
      notationReview: spec.notationReview,
      sourceRef: null,
      sourceSupport: { mappingPath: 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json', legacyGoalId: spec.legacyGoalId, matchType: 'exact', limitation: 'No direct sourceRef on the current canonical goal; mapping and independent D/source review are separate, not inferred from this P profile.' },
      pageNumber: page.pageNumber,
      breadcrumbs: page.breadcrumbs,
      goalFingerprint: page.goalFingerprint,
      pageFingerprint: page.pageFingerprint,
      imageUrl,
      imageAltText: link.altText,
      imageSha256: spec.imageSha,
      pageQaStatus: page.visualization.qaStatus,
      pageApprovedForPublication: page.visualization.approvedForPublication,
      historicalPReviewInputFingerprint: old.reviewInputFingerprint,
      historicalPProfileFingerprint: old.profileFingerprint,
      priorCurrentPGoalFingerprint: priorCurrent.goal,
      priorCurrentPReviewInputFingerprint: priorCurrent.input,
      priorCurrentPProfileFingerprint: priorCurrent.profile,
      transferCaseIds: spec.expectedCases,
    })
  }
  const config: PositiveGoalEvidenceReviewConfig = {
    ...oldConfig,
    reviewId,
    reviewPath,
    reviewedResourceTypes: ['goal-visualization'],
    scope: { label: 'Five current image-bound mathematics volume P-v2 AI candidates with independent transfer', goalIds: specs.map(({ goalId }) => goalId) },
  }
  const reviewedAt = '2026-09-24T03:05:18Z'
  const candidates = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId,
    reviewedAt,
    reviewer: 'Codex five-volume current-pixel, DE/EN formula-notation, and independent-transfer P-v2 re-review /root/math_p_gap',
    goals: specs.map((spec) => {
      const old = oldCandidates.goals.find(({ goalId }) => goalId === spec.goalId)!
      return { goalId: spec.goalId, reason: `${spec.reason} Current DE/EN notation re-review: ${spec.notationReview}`, evidenceLevel: 'E1' as const, maximumClaimScope: 'G1' as const, dissent: [], profile: freshProfile(spec.goalId, old.profile) }
    }),
  }
  const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })
  assert(records.length === 5, 'Expected exactly five image-bound P records')
  for (const record of records) {
    const old = oldReviews.find(({ goalId }) => goalId === record.goalId)!
    const priorCurrent = priorCurrentFingerprints[record.goalId]
    assert(priorCurrent, `${record.goalId}: prior image-bound P profile missing`)
    assert(record.goalFingerprint !== old.goalFingerprint && record.goalFingerprint !== priorCurrent.goal && record.reviewInputFingerprint !== priorCurrent.input, `${record.goalId}: current DE/EN text was not freshly rebound`)
    assert(record.profileFingerprint === priorCurrent.profile, `${record.goalId}: transfer profile changed beyond reviewed notation-only delta`)
    assert(record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate' && record.evidenceLevel === 'E1' && record.maximumClaimScope === 'G1' && record.reviewRunIds.length === 0, `${record.goalId}: AI-only authority was overstated`)
    Object.assign(bindings.find(({ goalId }) => goalId === record.goalId)!, {
      currentPReviewInputFingerprint: record.reviewInputFingerprint,
      currentPProfileFingerprint: record.profileFingerprint,
      retainedTransferProfileAfterNotationReview: record.profileFingerprint === priorCurrent.profile,
      profileChangedFromHistoricalTextOnly: record.profileFingerprint !== old.profileFingerprint,
    })
  }
  const files = [
    { path: configPath, bytes: jsonBytes(config) },
    { path: candidatesPath, bytes: jsonBytes(candidates) },
    { path: reviewPath, bytes: Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`) },
    { path: `${output}/binding-review.json`, bytes: jsonBytes({
      schemaVersion: 1,
      reviewId,
      reviewedAt,
      reviewer: candidates.reviewer,
      authority: 'ai_candidate',
      humanApproved: false,
      historicalInputs: { config: `${source}/text-only-six.config.json`, candidateSet: `${source}/text-only-six.candidates.json`, review: `${source}/text-only-six.review.jsonl`, sha256: historicalSha, priorImageBoundReviewSha256: priorCurrentReviewSha, disposition: 'Historical text-only six remain unmodified and unregistered; their stale image-unaware review inputs are not reused as current P evidence. The preceding image-bound P fingerprints are retained above solely as an audit baseline.' },
      currentBookDigest: base.model.digest,
      digestDisposition: 'Whole-book digest is provenance only. Each P claim binds the exact current goal, rendered page, source mapping, PNG and independent transfer cases below.',
      changedGoals: bindings,
      limit: 'Current P-v2 AI candidates only. This is not human approval, learner performance, source-review approval, V acceptance, or a claim that D/P/A/M/V is complete.',
    }) },
  ]
  assert([priorCurrentReviewSha, sha256(files[2].bytes)].includes(sha256(priorCurrentReviewBytes)), 'Current five-volume P review changed outside this notation re-review; stop before overwriting')
  for (const file of files) await verifyOrWrite(file.path, file.bytes, write)
  const check = reviewPositiveGoalEvidenceConfig(configPath)
  assert(check.errors.length === 0, `${configPath}: ${check.errors.join(' | ')}`)
  console.log(`${write ? 'Wrote' : 'Verified'} five current image-bound P-v2 AI candidates; no historical or human approval implied.`)
}

void main()
