import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const base = 'curricula/DE/Gymnasium/quality/goal-evidence'
const outputDir = `${base}/m7-three-description-text-delta-p-20260923-v1`
const sourceFiles = {
  tangent: `${base}/m7-vready-geometry-trig-nine-20260923-v1/positive-evidence.review.jsonl`,
  normal: `${base}/m7-upper-sec-next20-p-20260923-v1/text-only-eleven.review.jsonl`,
  altitude: `${base}/m7-unregistered-eight-seki-j10-q4-p-20260923-v1/text-only-six.review.jsonl`,
}
const ids = {
  tangent: '4cba85d3-2e25-5c4b-9c4c-37e5b201dce7',
  normal: 'b431148b-526c-4bde-b04b-48d23101d0d3',
  altitude: 'd051857c-0707-544f-ae7a-f20690d182b2',
}
const fail = (message) => { throw new Error(message) }
const readRecords = async (path) => (await readFile(resolve(root, path), 'utf8')).trim().split('\n').map((line) => JSON.parse(line))
const source = {}
for (const [key, path] of Object.entries(sourceFiles)) {
  const records = await readRecords(path)
  source[key] = records.find((entry) => entry.goalId === ids[key]) ?? fail(`Missing source ${key}`)
}
const tangent = structuredClone(source.tangent.profile)
tangent.expectations[0] = {
  id: 'relation-derivation',
  essentialUnderstandingDe: 'Ein frei gewählter anschaulicher oder rechnerischer Herleitungsweg muss die gesamte Domäne cos α≠0 tragen: etwa vorzeichenrichtige Koordinaten am Schenkel oder ein Dreiecksansatz, dessen Quotienten über Bezugswinkel und Quadrantenvorzeichen ausdrücklich verallgemeinert werden. Ein spitzes Einzeldreieck allein beweist nur den spitzen Fall.',
  essentialUnderstandingEn: 'One chosen visual or computational derivation must cover the full domain cos α≠0: for example, signed ray coordinates or a triangle argument explicitly generalized through reference angles and quadrant signs. One acute triangle alone proves only the acute case.',
  observablePerformanceDe: 'Die lernende Person leitet die Beziehung mit einem nachvollziehbaren eigenen Weg für alle Winkel mit cos α≠0 her und erklärt die nötige Verallgemeinerung, falls sie mit einem spitzen Dreieck beginnt.',
  observablePerformanceEn: 'The learner derives the relation by one comprehensible chosen route for all angles with cos α≠0 and explains the required generalization if starting with an acute triangle.',
}
tangent.expectations[1] = {
  id: 'domain-and-sign-transfer',
  essentialUnderstandingDe: 'Die hergeleitete Beziehung gilt auch außerhalb des spitzen Winkels, solange cos α≠0. Vorzeichen von sin α und cos α bestimmen das Quotientenvorzeichen; bei cos α=0 ist weder dieser Quotient noch der Tangens definiert.',
  essentialUnderstandingEn: 'The derived relation also holds beyond acute angles whenever cos α≠0. Signs of sin α and cos α determine the quotient sign; at cos α=0 neither this quotient nor tangent is defined.',
  observablePerformanceDe: 'Die lernende Person prüft die Beziehung an einem nichtspitzen Winkel und erklärt Vorzeichen sowie Definitionsgrenze, ohne einen zweiten Herleitungsweg vorführen zu müssen.',
  observablePerformanceEn: 'The learner checks the relation at a non-acute angle and explains sign and domain boundary without having to present a second derivation method.',
}
tangent.coverageExpectations.requiredExpectationIds = ['relation-derivation', 'domain-and-sign-transfer']
tangent.variationAxes[1] = {
  id: 'angle-domain',
  textDe: 'spitzer Winkel im rechtwinkligen Dreieck gegenüber nichtspitzem Winkel mit Vorzeichen und Ausschluss von cos α=0',
  textEn: 'acute angle in a right triangle versus a non-acute angle with sign and exclusion of cos α=0',
}
tangent.variationAxes[0] = {
  id: 'derivation-to-application',
  textDe: 'allgemeine symbolische Herleitung mit selbst gewählter Darstellung gegenüber konkretem nichtspitzem Transfer und Definitionsgrenze',
  textEn: 'general symbolic derivation using a chosen representation versus concrete non-acute transfer and domain boundary',
}
tangent.applicationCaseBriefs[0] = {
  id: 'general-domain-derivation',
  taskDemandDe: 'Leite tan α=sin α/cos α für beliebige Winkel mit cos α≠0 mit einem selbst gewählten anschaulichen oder rechnerischen Weg her. Wenn du mit einem rechtwinkligen Dreieck beginnst, erkläre ausdrücklich, wie die Beziehung samt Vorzeichen auf nichtspitze Winkel übergeht.',
  taskDemandEn: 'Derive tan α=sin α/cos α for arbitrary angles with cos α≠0 using one visual or computational route of your choice. If you start with a right triangle, explicitly explain how the relation and signs extend to non-acute angles.',
  expectedPerformanceDe: 'Ein möglicher Weg: Für einen Schenkelpunkt (x,y) mit r=√(x²+y²)>0 gelten sin α=y/r, cos α=x/r und bei x≠0 tan α=y/x. Daher (y/r)/(x/r)=y/x=tan α. Die Vorzeichen von x und y gelten in jedem Quadranten; x=0 ist genau cos α=0 und ausgeschlossen. Ein gleichwertiger Dreiecksweg benötigt die explizite Bezugswinkel-/Vorzeichenerweiterung.',
  expectedPerformanceEn: 'One possible route: for a ray point (x,y) with r=√(x²+y²)>0, sin α=y/r, cos α=x/r, and when x≠0 tan α=y/x. Thus (y/r)/(x/r)=y/x=tan α. Signs of x and y apply in every quadrant; x=0 is exactly cos α=0 and is excluded. An equivalent triangle route needs explicit reference-angle/sign extension.',
  understandingFocusDe: 'Herleitung der ganzen angegebenen Domäne statt bloßer Bestätigung an einem spitzen Einzelfall; Wahl des Beweiswegs bleibt frei.',
  understandingFocusEn: 'Derivation across the entire stated domain rather than confirmation at one acute example; method choice remains free.',
}
tangent.applicationCaseBriefs[1] = {
  id: 'quadrant-two-transfer',
  taskDemandDe: 'Ein Strahl vom Ursprung verläuft durch P=(−2,5); sein Winkel α zur positiven x-Achse ist nicht spitz. Bestimme sin α, cos α und tan α, begründe ihre Vorzeichen und erläutere, warum tan α=sin α/cos α gilt. Was wäre bei einem Punkt auf der positiven y-Achse anders?',
  taskDemandEn: 'A ray from the origin passes through P=(−2,5); its angle α from the positive x-axis is not acute. Find sin α, cos α, and tan α, explain their signs, and why tan α=sin α/cos α. What changes for a point on the positive y-axis?',
  expectedPerformanceDe: 'r=√29, sin α=5/√29, cos α=−2/√29 und tan α=−5/2; die Normierung kürzt sich, der Quotient hat das Vorzeichen der Steigung y/x. Auf der y-Achse ist x=0 und damit cos α=0; tan α und der Quotient sind dort nicht definiert.',
  expectedPerformanceEn: 'r=√29, sin α=5/√29, cos α=−2/√29, and tan α=−5/2; normalization cancels, and the quotient has the sign of slope y/x. On the y-axis x=0 and cos α=0, so tangent and the quotient are undefined.',
  understandingFocusDe: 'Der Koordinatentransfer zeigt die Beziehung außerhalb des im Bild illustrierten spitzen Winkels und testet die tatsächliche Definitionsbedingung.',
  understandingFocusEn: 'Coordinate transfer establishes the relationship beyond the acute angle illustrated in the image and tests the actual domain condition.',
}

const normal = structuredClone(source.normal.profile)
normal.expectations = [
  {
    id: 'model-structure',
    essentialUnderstandingDe: 'Viele vergleichbare, hinreichend unabhängige Beiträge oder ein Binomialmodell mit ausreichend großen Werten von np und n(1−p) können eine annähernd symmetrische Glockenform plausibel machen; die bloße Zahl der Versuche genügt nicht.',
    essentialUnderstandingEn: 'Many comparable, sufficiently independent contributions or a binomial model with sufficiently large np and n(1−p) can make an approximately symmetric bell shape plausible; a large trial count alone is insufficient.',
    observablePerformanceDe: 'Die lernende Person erkennt in einer neuen Situation die relevanten Modellannahmen und erläutert, weshalb eine Normalnäherung plausibel sein kann, ohne eine Wahrscheinlichkeit zu berechnen.',
    observablePerformanceEn: 'The learner identifies relevant model assumptions in a new situation and explains why a normal approximation may be plausible, without calculating a probability.',
  },
  {
    id: 'counterevidence',
    essentialUnderstandingDe: 'Seltene Treffer, starke Schiefe, eine nahe Randlage oder ausgeprägte Abhängigkeiten sprechen gegen die unkritische Normalnäherung; eine bekannte Glockenform darf nicht allein aus n abgeleitet werden.',
    essentialUnderstandingEn: 'Rare hits, strong skew, a nearby boundary, or pronounced dependence argue against an uncritical normal approximation; a bell shape cannot be inferred from n alone.',
    observablePerformanceDe: 'Die lernende Person unterscheidet einen plausiblen von einem ungeeigneten Fall und nennt das entscheidende Gegenargument aus Form, Rand oder Abhängigkeit.',
    observablePerformanceEn: 'The learner distinguishes a plausible from an unsuitable case and gives the decisive counterargument from shape, boundary, or dependence.',
  },
]
normal.coverageExpectations.requiredExpectationIds = ['model-structure', 'counterevidence']
normal.applicationCaseBriefs[0] = {
  id: 'suitable-binomial',
  taskDemandDe: 'Bei X~Bin(100;0,4): Ist eine Normalnäherung der Trefferzahl plausibel? Begründe allein anhand des Entstehungsmodells und der zu erwartenden Form, ohne Wahrscheinlichkeiten oder Flächen zu berechnen.',
  taskDemandEn: 'For X~Bin(100,0.4), is a normal approximation of the hit count plausible? Justify from the generating model and expected shape only, without calculating probabilities or areas.',
  expectedPerformanceDe: 'Bei unabhängigen Bernoulli-Versuchen sind np=40 und n(1−p)=60 beide groß; die Verteilung liegt nicht dicht an einem Rand und ist nicht extrem schief. Eine annähernde Glockenform ist plausibel, aber nicht exakt normalverteilt.',
  expectedPerformanceEn: 'With independent Bernoulli trials, np=40 and n(1−p)=60 are both large; the distribution is not near a boundary or extremely skewed. An approximate bell shape is plausible, but the count is not exactly normally distributed.',
  understandingFocusDe: 'Normalnäherung als begründete Erkennung einer Situation, nicht als Intervall- oder Stetigkeitskorrekturrechnung.',
  understandingFocusEn: 'Normal approximation as justified recognition of a situation, not an interval or continuity-correction calculation.',
}
normal.applicationCaseBriefs[1].understandingFocusDe = 'Gegenbeispiel zur bloßen n-Regel: seltene Treffer und Randlage verhindern die Glockenform.'
normal.applicationCaseBriefs[1].understandingFocusEn = 'Counterexample to an n-only rule: rare hits and a boundary prevent a bell shape.'

const altitude = structuredClone(source.altitude.profile)
altitude.applicationCaseBriefs[1] = {
  id: 'obtuse-all-three',
  taskDemandDe: 'Für das stumpfwinklige Dreieck A(0,0), B(4,0), C(−1,2): Konstruiere alle drei Höhen zu den jeweiligen gegenüberliegenden Seitengeraden. Markiere die Lotfüße, erkläre die nötigen Seitenverlängerungen und prüfe jede Höhe mit Eckpunkt- und Rechtwinkelbedingung.',
  taskDemandEn: 'For the obtuse triangle A(0,0), B(4,0), C(−1,2), construct all three altitudes to their respective opposite side lines. Mark their feet, explain the needed side extensions, and verify each altitude by its vertex and right-angle conditions.',
  expectedPerformanceDe: 'h_C ist x=−1 mit Lotfuß (−1,0) links von A; h_B steht auf AC senkrecht und trifft dessen Verlängerung im Punkt (4/5,−8/5); h_A steht auf BC senkrecht und trifft BC bei (16/29,40/29). Alle drei Geraden gehen durch den jeweils zugeordneten Eckpunkt; zwei Lotfüße liegen außerhalb der gegenüberliegenden Seitenstücke.',
  expectedPerformanceEn: 'h_C is x=−1 with foot (−1,0) left of A; h_B is perpendicular to AC and meets its extension at (4/5,−8/5); h_A is perpendicular to BC and meets BC at (16/29,40/29). Each line passes through its assigned vertex; two feet lie outside their opposite side segments.',
  understandingFocusDe: 'Die Regel für jede der drei Höhen bleibt auch beim stumpfen Dreieck und bei äußeren Lotfüßen gültig.',
  understandingFocusEn: 'The rule for each of the three altitudes remains valid in an obtuse triangle with external feet.',
}

const candidate = (entry, profile, reason) => ({
  goalId: entry.goalId,
  reason,
  profile,
  evidenceLevel: 'E1',
  maximumClaimScope: 'G1',
  dissent: [],
})
const authoring = (reviewId, goals) => ({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-23T14:30:00Z',
  reviewer: 'codex-math-m7-three-current-text-delta-ai-candidate',
  goals,
})
const outputs = [
  {
    path: `${outputDir}/tangent-current.candidates.json`,
    value: authoring('canonical-math-p-v2-m7-tangent-current-text-20260923-v1', [
      candidate(source.tangent, tangent, 'DE: Neu präzisierte Beziehung gilt für cos α≠0, nicht nur für spitze Winkel. Bild zeigt einen spitzen Fall; zusätzlicher nichtspitzer Transfer mit Vorzeichen und Nullnenner ist daher fachlich nötig. EN: The current relation applies whenever cos α≠0, not only to acute angles; image is acute only, so a non-acute sign-and-domain transfer is essential.'),
    ]),
  },
  {
    path: `${outputDir}/normal-altitudes-text-current.candidates.json`,
    value: authoring('canonical-math-p-v2-m7-normal-altitudes-current-text-20260923-v1', [
      candidate(source.normal, normal, 'DE: Das aktuelle Ziel verlangt begründetes Erkennen plausibler Normalnäherung, keine Stetigkeitskorrektur oder Intervallfläche. Altes JPG bleibt wegen der 55/55,5-Abweichung und eines Tippfehlers SHA-spezifisch V-HOLD; text-only AI candidate. EN: Current goal asks for justified recognition, not continuity correction or interval area. Old JPG remains SHA-specific V-HOLD for 55/55.5 mismatch and typo; text-only AI candidate.'),
      candidate(source.altitude, altitude, 'DE: Das aktuelle Ziel fordert jede der drei Höhen zur gegenüberliegenden Seitengeraden. Beide neuen Fälle konstruieren alle drei, einschließlich äußerer Lotfüße; es ist weiterhin kein freigegebenes Bild vorhanden. EN: Current goal requires all three altitudes to opposite side lines. Both cases construct all three, including external feet; no approved image is available.'),
    ]),
  },
]
const retainedSource = await readRecords(sourceFiles.tangent)
const retainedIds = new Set((JSON.parse(await readFile(resolve(root, `${outputDir}/geometry-trig-retained-eight.config.json`), 'utf8'))).scope.goalIds)
const retained = retainedSource.filter((entry) => retainedIds.has(entry.goalId))
if (retained.length !== 8 || retainedSource.length !== 9) fail('Expected exact eight-of-nine retained profile subset')
const retainedPath = `${outputDir}/geometry-trig-retained-eight.review.jsonl`
const outputBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const expected = [
  ...outputs.map(({ path, value }) => ({ path, bytes: outputBytes(value) })),
  { path: retainedPath, bytes: Buffer.from(`${retained.map((row) => JSON.stringify(row)).join('\n')}\n`) },
]
for (const { path, bytes } of expected) {
  let current
  try { current = await readFile(resolve(root, path)) } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  if (current && !current.equals(bytes) && !(process.argv[2] === '--refresh-tangent' && path.endsWith('/tangent-current.candidates.json'))) {
    fail(`Existing file differs: ${path}`)
  }
  if (!current && process.argv[2] === '--write') await writeFile(resolve(root, path), bytes, { flag: 'wx' })
  if (current && !current.equals(bytes) && process.argv[2] === '--refresh-tangent') await writeFile(resolve(root, path), bytes)
  if (!current && process.argv[2] !== '--write') fail(`Missing generated file: ${path}`)
  console.log(path)
}
