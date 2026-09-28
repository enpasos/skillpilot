#!/usr/bin/env node
// Rebind re-inspected, historical P-v2 profiles to the current canonical text.
// The nine source files remain immutable; image evidence is deliberately absent.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/'
const packagePath = `${prefix}2026-09-27/math-p20-text-current-v1/`
const config = JSON.parse(readFileSync(resolve(root, `${packagePath}positive-evidence.config.json`), 'utf8'))
const outputPath = resolve(root, `${packagePath}positive-evidence.candidates.json`)
if (!existsSync(resolve(root, config.landscapePath))) throw new Error('Run from the repository root')

const sources = [
  ['m7-p-gap-first15-20260923-v1/image-bound-14.candidates.json', 'e8ec18c2ec5080d7a60cd7195a706e1e8c598eb55582e9a4c9d40c0b83eb95ba', ['18be713b', '9023226b']],
  ['m7-q4-argumentation-communication-p-20260923-v1/text-only-hold-5.candidates.json', '3d7ce1831e618aed953f764998217da2a04b295feb7789842166cbf059ae7d3f', ['21fa0c22', '27bdc580', '87372f49', '93fc4fbb', 'c97a33d9']],
  ['m7-vready-remainder-six-p-20260923-v1/text-only-hold-one.candidates.json', '6ef85418a72b79953abbdf29b96b913e6ea73fb5abbe719d6dbecd24d4ed737a', ['3d8f5e4c']],
  ['mathematik-q3-model-interpretation-four-20260923-v1/positive-evidence-text-only-1.candidates.json', 'dfe9ae40f57260596e5e848da84bfac5ea022aff81303b62121cad33a5b1e8d8', ['4aa70ad4']],
  ['m7-q4-lk-complex-number-theory-p-20260923-v1/text-only-hold-3.candidates.json', 'f94fb0727fdc0048cc38689705aa0e6def109a8f9931b4fd1e30227b0fd7b513', ['4f64f771', '9b339361', 'a7fb1a7a']],
  ['m7-vready-image-holds-three-text-20260923-v1/positive-evidence.candidates.json', '7f13ebadbb1ecd23433533210dc5d24032ffec1cf5749449bee13f866acb4f50', ['74d29d0c']],
  ['m7-q2-spatial-relations-20-20260923-v1/positive-evidence.candidates.json', '7bd8e271ec8bb9816216d5a4066346e2f1a32c81801121228cf522cb08a21adb', ['7bb3c312']],
  ['m7-p-gap-second16-20260923-v1/text-only-6.candidates.json', '61156fdb7d300640f3cae0403df169d80cdbb0c25af76b13c9747536c7c0541f', ['909d8b16', 'a594dec0', 'b4fd63de', 'bd637a72', 'e02b994f']],
  ['m7-upper-sec-next20-p-20260923-v1/text-only-eleven.candidates.json', 'ec572be2af18642c5f17e1a67e9ab2af1f1ec0e8bb4049b5dde4c8b6ab2ec83f', ['f2a12269']],
]

const reasons = {
  '18be713b': 'Separate line-line and line-plane configurations test vector choice, the actual intersection, and geometric interpretation of the acute angle.',
  '21fa0c22': 'A dependent draw and independent repeated trials require two different correct event constructions from probability terms.',
  '27bdc580': 'The continuous-graph case supports a heuristic existence conclusion, while a jump case tests its precise limit without a formal continuity proof.',
  '3d8f5e4c': 'Unordered draws and ordered codes require distinct sample-space counts and matching favourable events.',
  '4aa70ad4': 'Two independently specified software simulations test complete categories, relative-frequency arithmetic, and chart/table consistency.',
  '4f64f771': 'Static quadrant-aware polar conversion and time-dependent clockwise rotation cover modulus, argument, and angular-speed meaning.',
  '74d29d0c': 'Independent pyramid and cone constructions require geometrically valid nets, oblique drawings, and correct base/lateral terminology.',
  '7bb3c312': 'A point-defined triangle and vector-defined parallelogram distinguish normal construction and the correct half-area factor.',
  '87372f49': 'Diagonal counting and parity use different heuristics, each followed by a mathematical justification rather than a pattern guess.',
  '9023226b': 'Pure quadratic solving by completing the square transfers to an area context using the formula and rejecting a negative length.',
  '909d8b16': 'Parameter revision against conflicting measurement and a capacity constraint expose what the changed model gains and loses.',
  '93fc4fbb': 'Exact symbolic hand work with numeric tool checks is justified separately for a quadratic and an exponential equation.',
  '9b339361': 'Real and imaginary iteration parameters require actual orbit checks and software-supported Mandelbrot visualization, not pixel reading alone.',
  'a594dec0': 'Orthogonal edge vectors transfer to a genuinely oblique point-defined tetrahedron and a different volume factor.',
  'a7fb1a7a': 'The two cases collectively interpret all four complex operations as translations, rotations, and scalings at correct plane points.',
  'b4fd63de': 'A rectangular box and a right square pyramid require different symmetry-plane and rotational-axis inventories.',
  'bd637a72': 'Maximum-area symmetry and odd-number factorization require distinct justified heuristics and independent checks.',
  'c97a33d9': 'A domain-dependent CAS identity and an even-multiplicity root expose separate digital-tool limits with valid safeguards.',
  'e02b994f': 'An integer-bounded optimization and a discrete packaging equation show how different constraints change admissible solutions.',
  'f2a12269': 'A constant-section prism division transfers to a similar-pyramid cut, separating linear height and cubic volume ratios.',
}

const candidatesById = new Map()
for (const [relativePath, expectedHash, prefixes] of sources) {
  const sourcePath = resolve(root, `${prefix}${relativePath}`)
  const bytes = readFileSync(sourcePath)
  const actualHash = createHash('sha256').update(bytes).digest('hex')
  if (actualHash !== expectedHash) throw new Error(`Source changed: ${relativePath}`)
  const source = JSON.parse(bytes.toString('utf8'))
  for (const idPrefix of prefixes) {
    const matches = source.goals.filter(({ goalId }) => goalId.startsWith(idPrefix))
    if (matches.length !== 1 || candidatesById.has(matches[0].goalId)) throw new Error(`Ambiguous historical candidate ${idPrefix}`)
    candidatesById.set(matches[0].goalId, structuredClone(matches[0]))
  }
}

const goals = config.scope.goalIds.map((goalId) => {
  const candidate = candidatesById.get(goalId)
  if (!candidate) throw new Error(`No pinned source candidate for ${goalId}`)
  const reason = reasons[goalId.slice(0, 8)]
  if (!reason) throw new Error(`No current editorial reason for ${goalId}`)
  candidate.reason = `Current DE/EN goal and mathematical cases re-inspected on 2026-09-27. ${reason} Text-only E1/G1 AI candidate: no image was reviewed or approved.`
  candidate.dissent = []
  candidate.evidenceLevel = 'E1'
  candidate.maximumClaimScope = 'G1'
  return candidate
})
if (goals.length !== 20 || candidatesById.size !== 20) throw new Error('Expected exactly 20 disjoint current candidates')

// Three targeted improvements after checking the old example arithmetic and
// the exact current DE/EN goals. Do not silently alter any other case.
const quadratic = goals.find(({ goalId }) => goalId.startsWith('9023226b'))
quadratic.profile.applicationCaseBriefs[1].taskDemandDe = 'Ein Rechteck ist 3 cm länger als breit und hat Fläche 40 cm². Stelle die quadratische Gleichung auf, löse mit einer Lösungsformel und deute beide algebraischen Lösungen.'
quadratic.profile.applicationCaseBriefs[1].taskDemandEn = 'A rectangle is 3 cm longer than it is wide and has area 40 cm². Form the quadratic equation, solve it using a formula, and interpret both algebraic roots.'
quadratic.profile.applicationCaseBriefs[1].expectedPerformanceDe = 'Mit Breite x>0 gilt x(x+3)=40, also x²+3x−40=0. Die Diskriminante ist 3²+160=169; x=(−3±13)/2 liefert 5 und −8. Nur x=5 cm ist zulässig; Länge 8 cm ergibt 40 cm².'
quadratic.profile.applicationCaseBriefs[1].expectedPerformanceEn = 'With width x>0, x(x+3)=40, so x²+3x−40=0. The discriminant is 3²+160=169; x=(−3±13)/2 gives 5 and −8. Only x=5 cm is admissible; length 8 cm gives 40 cm².'

const triple = goals.find(({ goalId }) => goalId.startsWith('a594dec0'))
triple.profile.applicationCaseBriefs[1].taskDemandDe = 'P=(1,0,0), Q=(2,1,0), R=(1,1,2), S=(3,0,2) sind Tetraederecken in einem Koordinatensystem mit Zentimetereinheit. Wähle drei Kanten von P und berechne das Volumen.'
triple.profile.applicationCaseBriefs[1].taskDemandEn = 'P=(1,0,0), Q=(2,1,0), R=(1,1,2), S=(3,0,2) are tetrahedron vertices in a coordinate system measured in centimetres. Choose three edges from P and find the volume.'
triple.profile.applicationCaseBriefs[1].expectedPerformanceDe = 'PQ=(1,1,0), PR=(0,1,2), PS=(2,0,2) cm. PR×PS=(2,4,−2) cm², also |PQ·(PR×PS)|=6 cm³ und V_Tet=1 cm³. Eine Vertauschung ändert nur das Vorzeichen des Spatprodukts.'
triple.profile.applicationCaseBriefs[1].expectedPerformanceEn = 'PQ=(1,1,0), PR=(0,1,2), PS=(2,0,2) cm. PR×PS=(2,4,−2) cm², so |PQ·(PR×PS)|=6 cm³ and tetrahedron volume is 1 cm³. Exchanging two edges changes only the triple product sign.'

const volume = goals.find(({ goalId }) => goalId.startsWith('f2a12269'))
volume.profile.expectations[0].observablePerformanceDe = 'Die lernende Person bestimmt Teilvolumina aus der jeweils passenden räumlichen Struktur und kürzt eine gemeinsame Querschnittsfläche nur, wenn sie tatsächlich vorliegt.'
volume.profile.expectations[0].observablePerformanceEn = 'The learner finds part volumes from the spatial structure that actually applies and cancels a common cross-sectional area only when one is present.'
volume.profile.variationAxes[0].textDe = 'Von prismatischen Abschnitten mit konstantem Querschnitt zu einer parallel zur Grundfläche geschnittenen Pyramide wechseln, deren ähnliche Teilkörper kubisch mit dem Längenmaßstab skalieren.'
volume.profile.variationAxes[0].textEn = 'Move from prismatic sections with constant cross-section to a pyramid cut parallel to its base, whose similar parts scale cubically with the length factor.'
volume.profile.applicationCaseBriefs[1] = {
  id: 'parallel-pyramid-cut',
  taskDemandDe: 'Eine gerade quadratische Pyramide hat Grundkante 6 cm und Höhe 12 cm. Eine Ebene parallel zur Grundfläche schneidet 3 cm unter der Spitze eine kleine Pyramide ab. Bestimme die Volumina beider Teile, ihr Teil-zu-Teil-Verhältnis und den Anteil der kleinen Pyramide am Gesamtvolumen.',
  taskDemandEn: 'A right square pyramid has base side 6 cm and height 12 cm. A plane parallel to the base cuts off a small pyramid 3 cm below the apex. Find both part volumes, their part-to-part ratio, and the small pyramid’s share of the total.',
  expectedPerformanceDe: 'V_gesamt=(1/3)·6²·12=144 cm³. Der Längenmaßstab oben ist 3/12=1/4, also V_klein=(1/4)³·144=2,25 cm³ und V_Rest=141,75 cm³. Damit V_klein:V_Rest=1:63 und V_klein/V_gesamt=1/64; die Höhen allein liefern hier kein Volumenverhältnis.',
  expectedPerformanceEn: 'V_total=(1/3)·6²·12=144 cm³. The top pyramid has length scale 3/12=1/4, so V_small=(1/4)³·144=2.25 cm³ and V_remainder=141.75 cm³. Thus V_small:V_remainder=1:63 and V_small/V_total=1/64; heights alone do not give the volume ratio here.',
  understandingFocusDe: 'Ähnlichkeit und kubische Volumenskalierung statt unzulässiger Gleichsetzung von Höhen- und Volumenverhältnis.',
  understandingFocusEn: 'Similarity and cubic volume scaling rather than incorrectly equating height and volume ratios.',
}

const candidateSet = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: config.reviewId,
  reviewedAt: '2026-09-27T00:55:00.000Z',
  reviewer: 'Codex Math P-v2 current text-only reinspection; AI candidate only',
  goals,
}
const expected = `${JSON.stringify(candidateSet, null, 2)}\n`
if (process.argv.slice(2).join(' ') === '--write') {
  writeFileSync(outputPath, expected, { flag: 'wx' })
  console.log(`Wrote ${outputPath}`)
} else if (process.argv.length === 2) {
  if (readFileSync(outputPath, 'utf8') !== expected) throw new Error('Generated candidate set differs from pinned inputs')
  console.log(`Verified ${outputPath}`)
} else {
  throw new Error('Usage: node materialize-candidates.mjs [--write]')
}
