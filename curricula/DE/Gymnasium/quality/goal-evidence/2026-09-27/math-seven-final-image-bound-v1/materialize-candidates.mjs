import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const output = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-seven-final-image-bound-v1'
const configPath = `${output}/positive-evidence.config.json`
const candidatesPath = `${output}/positive-evidence.candidates.json`
const provenancePath = `${output}/provenance.json`
const ids = [
  '1b67aeb4-2a55-531f-94da-283b4e3df5f1',
  '74d29d0c-80b3-4d46-a5f5-3c2f609e8483',
  '93fc4fbb-72f6-549b-b97a-a48aecb1534d',
  'ae3483e3-4712-56a1-a881-2e1f8a1a8df9',
  'ae483d98-54e0-5985-96d2-fc1351d22e4f',
  '4f64f771-20ba-581a-86ba-bcdb1759e4d2',
  'a7fb1a7a-8315-5bcb-842e-48293293dfcc',
]
const sources = {
  heuristic: {
    config: ['curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-v-quickwins-p-rebind-v1/heuristic-retained.config.json', '235241ff74f209c7ce7bcf22b63b9638ca5019fb22dbfc2a272f2ffe05da750b'],
    review: ['curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-v-quickwins-p-rebind-v1/heuristic-retained.review.jsonl', 'ddaf172419dbc31d245003f41cceb4e46007cddcab8915649be6c6e2a584453c'],
  },
  q3: {
    config: ['curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-v-resumed-png-image-bound-v1/retained-q3-one.config.json', '502f03971d89186762a8b0788bf4a90f048644d1b3bfa81ae22b77af290e7bf2'],
    review: ['curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-v-resumed-png-image-bound-v1/retained-q3-one.review.jsonl', '257392166a67bbb0a9a90dac410edd56cb023828b78dd7e5b0314ccddf8d29c9'],
  },
  power: {
    config: ['curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-second16-20260923-v1/ae348-text-only-after-image-hold.config.json', '9250760ba9a33891b5877fcec690b4bfdde12fd8c746364788bd1a06c71190e2'],
    review: ['curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-second16-20260923-v1/ae348-text-only-after-image-hold.review.jsonl', '79a44cd301aa585362418aa7495312a04eb59b123e9db7f0c1be219a301a6d50'],
  },
  sample: {
    config: ['curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-restored-after-sight-v2/ae483d98.config.json', 'f7b4ff1961b1931912e0a9ecbafc96084e37b07c6700e5ad9c24b84b82c178a7'],
    review: ['curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-restored-after-sight-v2/ae483d98.review.jsonl', '871221108757dacdb5a653b3a4e2e693e90b0fb8c98e44f9ec9866e2ff10aac9'],
  },
}
const sourceKey = {
  [ids[0]]: 'q3',
  [ids[1]]: 'heuristic',
  [ids[2]]: 'heuristic',
  [ids[3]]: 'power',
  [ids[4]]: 'sample',
  [ids[5]]: 'heuristic',
  [ids[6]]: 'heuristic',
}
const imageHashes = {
  [ids[0]]: '2c7088ecfbd1f729d4af897a9ab82629e116e88ec9755d8676d08ec04eabd700',
  [ids[1]]: '1f4092d84a63fd3b693e4ca48bf86bc4dded4ea6197480a6c15be36cdc181c93',
  [ids[2]]: '2d1b32e8599320799766aabb4a900daaa612f071e40d5f1a12473a66ef49aef4',
  [ids[3]]: '3dd10c18021e60bab1dd389c5eb32ccd9ada8ff8d5c51bcf4ed43476c25ef037',
  [ids[4]]: '92ef798d8dc709efe63a6c5195a292e9346cb75e1c5118728073e3ca725ad4ff',
  [ids[5]]: '932dad59399b139d33e3eea6ef66d22033e4a9a1e22e8fcb6d5f21ced59e469d',
  [ids[6]]: 'b8e1d061af3df7b41c59bbf10c4f673ff70b94ea8185741b13d8286bbf00bafe',
}
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const pinned = async ([path, digest]) => {
  const bytes = await readFile(at(path))
  if (sha(bytes) !== digest) throw new Error(`Pinned source changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  try {
    await writeFile(at(path), bytes, { flag: 'wx' })
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    if (!(await readFile(at(path))).equals(bytes)) throw new Error(`Generated artifact differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}

const config = JSON.parse(await readFile(at(configPath), 'utf8'))
if (config.reviewedResourceTypes.length !== 1 || config.reviewedResourceTypes[0] !== 'goal-visualization' ||
    JSON.stringify(config.scope.goalIds) !== JSON.stringify(ids) || config.requireApproved !== false) {
  throw new Error('The versioned P config must contain exactly seven image-bound AI candidates')
}
const records = new Map()
for (const [key, paths] of Object.entries(sources)) {
  const oldConfig = JSON.parse(await pinned(paths.config))
  const lines = (await pinned(paths.review)).toString('utf8').trimEnd().split('\n')
  const oldRecords = lines.map(JSON.parse)
  if (JSON.stringify(oldRecords.map(({ goalId }) => goalId)) !== JSON.stringify(oldConfig.scope.goalIds)) {
    throw new Error(`${key}: source config/review order changed`)
  }
  for (const record of oldRecords) {
    if (records.has(record.goalId) || record.status !== 'needs_human_review' ||
        record.reviewAuthority !== 'ai_candidate' || record.evidenceLevel !== 'E1' ||
        record.maximumClaimScope !== 'G1') throw new Error(`${record.goalId}: source authority or uniqueness changed`)
    records.set(record.goalId, record)
  }
}
if (ids.some((id) => !records.has(id))) throw new Error('A seven-goal source P record is missing')

const landscape = JSON.parse(await readFile(at(config.landscapePath), 'utf8'))
const qa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
for (const id of ids) {
  const goal = goalById.get(id)
  const url = `/assets/goal-visualizations/mathematik/${id}/${id}.png`
  const links = goal?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  const digest = imageHashes[id]
  const publicBytes = await readFile(at(`app/public${url}`))
  const canonicalBytes = await readFile(at(`curricula/DE/Gymnasium/visualizations/mathematik/${id}/${id}.png`))
  const row = qa.records.find((item) => item.goalId === id)
  if (links.length !== 1 || links[0].url !== url || !links[0].altText ||
      sha(publicBytes) !== digest || sha(canonicalBytes) !== digest ||
      row?.imageUrl !== url || row?.assetSha256 !== `sha256:${digest}` ||
      row?.aiApproved !== 'yes' || row?.aiApprovedAssetSha256 !== `sha256:${digest}` ||
      row?.humanApproved !== 'no') {
    throw new Error(`${id}: current image bytes/link or AI-only QA binding changed`)
  }
}

const profiles = Object.fromEntries(ids.map((id) => [id, structuredClone(records.get(id).profile)]))

const combinations = profiles[ids[0]]
const lottery = combinations.applicationCaseBriefs.find(({ id }) => id === 'lottery')
if (!lottery) throw new Error('The pinned combinations profile lost its direct lottery case')
combinations.variationAxes = [{
  id: 'selection-condition',
  textDe: 'Eine freie ungeordnete Sechserauswahl gegenüber einer Viererauswahl mit einer fest vorgeschriebenen Person; n und k der verbleibenden Wahl ändern sich.',
  textEn: 'An unconstrained unordered selection of six versus a selection of four with one specified member required; n and k for the remaining choice change.',
}]
combinations.applicationCaseBriefs = [lottery, {
  id: 'required-member-committee',
  taskDemandDe: 'Aus zehn Personen soll ein gleichberechtigtes Vierergremium gebildet werden; eine bestimmte Person muss dazugehören. Wie viele verschiedene Gremien sind möglich? Begründe, warum die Reihenfolge nicht zählt.',
  taskDemandEn: 'Form a four-person committee with equal roles from ten people; one specified person must be included. How many different committees are possible? Explain why order does not count.',
  expectedPerformanceDe: 'Die fest vorgeschriebene Person ist bereits gewählt; aus den übrigen neun werden ungeordnet drei ohne Wiederholung ausgewählt. Daher (9 über 3)=84 verschiedene Gremien, nicht eine Wahrscheinlichkeit.',
  expectedPerformanceEn: 'The required person is already included; three of the remaining nine are selected without order or replacement. Thus 9 choose 3 equals 84 different committees, a count rather than a probability.',
  understandingFocusDe: 'Eine echte Auswahlbedingung verändert die Grundgesamtheit und die Zahl der noch zu wählenden Plätze.',
  understandingFocusEn: 'A genuine selection constraint changes both the remaining pool and the number of places left to fill.',
}]

const solids = profiles[ids[1]]
solids.expectations[0].observablePerformanceDe += ' Sie erläutert, dass das Netz die Flächenanordnung und das Schrägbild die räumliche Lage sichtbar macht.'
solids.expectations[0].observablePerformanceEn += ' The learner explains that the net reveals the face arrangement while the oblique view conveys spatial placement.'
solids.expectations[1].observablePerformanceDe += ' Sie erläutert den unterschiedlichen Zweck von Netz und Schrägbild.'
solids.expectations[1].observablePerformanceEn += ' The learner explains the different purposes of the net and oblique view.'
const pyramid = solids.applicationCaseBriefs.find(({ id }) => id === 'square-pyramid-net')
const cone = solids.applicationCaseBriefs.find(({ id }) => id === 'cone-sector-net')
if (!pyramid || !cone) throw new Error('The pinned solid cases changed')
pyramid.expectedPerformanceDe = 'Das Netz besitzt ein Quadrat mit Seite 4 cm als Grundfläche und vier gleichschenklige Dreiecke mit Seiten 5,5,4 cm als Mantelflächen, je eines an jeder Quadratseite. Im Schrägbild liegt die Spitze der geraden Pyramide über dem Grundflächenmittelpunkt; verdeckte Kanten sind sinnvoll gestrichelt. Das Netz zeigt die Flächenzuordnung, das Schrägbild die räumliche Lage.'
pyramid.expectedPerformanceEn = 'The net has a square base of side 4 cm and four isosceles lateral faces of sides 5,5,4 cm, one on each square edge. In the oblique view, the right pyramid apex is above the base center and hidden edges are sensibly dashed. The net shows face adjacency; the oblique view shows spatial placement.'
cone.expectedPerformanceDe = 'Das Netz hat einen Grundkreis mit r=3 cm als Grundfläche und einen Kreissektor mit Radius s=5 cm als Mantelfläche. Seine Bogenlänge ist 6π cm und sein Mittelpunktswinkel 216°. Die beiden geraden Radien treffen sich an der Spitze; der Bogen verbindet sich mit dem Grundkreisrand. Im Schrägbild sind Grundkreis, Mantel und Mantellinie zugeordnet.'
cone.expectedPerformanceEn = 'The net has a base disk of radius r=3 cm and a lateral sector of radius s=5 cm. Its arc length is 6π cm and its central angle is 216°. The two straight radii meet at the apex; the arc joins the base-circle rim. The oblique view identifies the base disk, lateral surface, and slant height.'

const hybrid = profiles[ids[2]]
const quadratic = hybrid.applicationCaseBriefs.find(({ id }) => id === 'quadratic-hybrid')
const exponential = hybrid.applicationCaseBriefs.find(({ id }) => id === 'exponential-hybrid')
if (!quadratic || !exponential) throw new Error('The pinned hand/tool cases changed')
quadratic.taskDemandDe = 'Löse 2x²−8x+3=0. Entscheide und begründe selbst, welche Schritte du von Hand und welche mit einem digitalen Werkzeug ausführst; prüfe beide Näherungswerte in der Ausgangsgleichung.'
quadratic.taskDemandEn = 'Solve 2x²−8x+3=0. Choose and justify which steps to do by hand and which to do with a digital tool; check both approximate roots in the original equation.'
quadratic.expectedPerformanceDe = 'Ein möglicher Handweg ergibt 2(x−2)²−5=0 und x=2±√(5/2); ein gleichwertiger exakter Handweg ist zulässig. Ein Tool liefert ungefähr 0,419 und 3,581. Beide Näherungen werden durch Einsetzen in 2x²−8x+3 mit kleinen Rundungsresten geprüft; die Wahl von Hand- und Toolanteil wird begründet.'
quadratic.expectedPerformanceEn = 'One possible hand route gives 2(x−2)²−5=0 and x=2±√(5/2); an equivalent exact hand route is valid. A tool gives about 0.419 and 3.581. Both approximations are checked by substitution into 2x²−8x+3 with small rounding residuals, and the hand/tool split is justified.'
exponential.taskDemandDe = 'Löse 3^(2x−1)=7. Entscheide und begründe selbst, welche symbolischen Schritte du von Hand und welche numerische Auswertung du mit einem Tool ausführst; prüfe die Näherung in der Ausgangsgleichung.'
exponential.taskDemandEn = 'Solve 3^(2x−1)=7. Choose and justify which symbolic steps to do by hand and which numerical evaluation to perform with a tool; check the approximation in the original equation.'
exponential.expectedPerformanceDe = 'Von Hand folgt (2x−1)ln 3=ln 7 und damit x=(1+ln 7/ln 3)/2. Ein Tool kann x≈1,386 auswerten; Einsetzen liefert 3^(2·1,386−1)≈7. Die exakte Umformung bleibt nachvollziehbar und die Toolausgabe wird unabhängig geprüft.'
exponential.expectedPerformanceEn = 'By hand, (2x−1)ln 3=ln 7, hence x=(1+ln 7/ln 3)/2. A tool can evaluate x≈1.386; substitution gives 3^(2·1.386−1)≈7. The exact transformation remains visible and the tool output is checked independently.'

const power = profiles[ids[3]]
const oc = power.applicationCaseBriefs.find(({ id }) => id === 'choose-rule-oc')
const sample = power.applicationCaseBriefs.find(({ id }) => id === 'choose-sample-power')
if (!oc || !sample) throw new Error('The pinned OC/power cases changed')
oc.taskDemandDe = 'Eindeutig als Nichtverwerfungswahrscheinlichkeit gekennzeichnete OC-Graphen für Regeln A/B zeigen bei Nullwert p=0,5 die Werte 0,96/0,92 und bei Alternative p=0,7 die Werte 0,30/0,20. Gefordert sind Fehler 1. Art ≤0,05 und Güte bei p=0,7 ≥0,65. Wähle und begründe.'
oc.taskDemandEn = 'OC graphs clearly labelled as non-rejection probability for rules A/B show 0.96/0.92 at null p=0.5 and 0.30/0.20 at alternative p=0.7. Required are type-I error ≤0.05 and power at p=0.7 ≥0.65. Choose and justify.'
sample.taskDemandDe = 'Eindeutig als Verwerfungswahrscheinlichkeit gekennzeichnete Gütefunktionsgraphen für (n=60, X≥22) und (n=100, X≥33) zeigen bei Nullwert p=0,25 die gerundeten Werte 0,030/0,045 und bei Alternative p=0,39 die Werte 0,690/0,910. Gefordert sind Null-Verwerfung ≤0,05 und Alternativ-Güte ≥0,90. Wähle einen geeigneten Stichprobenumfang und begründe.'
sample.taskDemandEn = 'Power-function graphs clearly labelled as rejection probability for (n=60, X≥22) and (n=100, X≥33) show rounded values 0.030/0.045 at null p=0.25 and 0.690/0.910 at alternative p=0.39. Requirements are null rejection ≤0.05 and alternative power ≥0.90. Choose a suitable sample size and justify.'
sample.expectedPerformanceDe = 'Beide Umfänge erfüllen mit 0,030 bzw. 0,045 die Null-Anforderung; bei p=0,39 erreicht nur n=100 mit 0,910 die geforderte Güte von mindestens 0,90. Daher wird n=100 gewählt. Die Gütewerte sind direkt Verwerfungswahrscheinlichkeiten, nicht OC-Werte.'
sample.expectedPerformanceEn = 'Both sample sizes satisfy the null requirement with 0.030 and 0.045, respectively; at p=0.39 only n=100 reaches the required power of at least 0.90 with 0.910. Thus n=100 is chosen. Power values are rejection probabilities directly, not OC values.'

const polar = profiles[ids[5]]
polar.expectations[0].essentialUnderstandingDe += ' Für z=0 gilt r=0, aber ein Argument ist nicht bestimmt.'
polar.expectations[0].essentialUnderstandingEn += ' For z=0, r=0 but no argument is defined.'
polar.expectations[0].observablePerformanceDe += ' Für z=0 unterscheidet sie den bestimmten Betrag vom nicht bestimmten Argument.'
polar.expectations[0].observablePerformanceEn += ' For z=0, the learner distinguishes its defined modulus from its undefined argument.'
polar.variationAxes = [{
  id: 'structural-transfer',
  textDe: 'Von einem festen Punkt im zweiten Quadranten samt Nullfall zu einer zeitabhängigen Polarform mit positivem Drehsinn und nicht-viertelperiodischen Zwischenlagen wechseln.',
  textEn: 'Move from a fixed point in quadrant II and the zero boundary case to a time-dependent polar form with positive rotation and intermediate positions that are not quarter-period turns.',
}]
const fixed = polar.applicationCaseBriefs.find(({ id }) => id === 'fixed-quadrant-two')
const time = polar.applicationCaseBriefs.find(({ id }) => id === 'clockwise-time')
if (!fixed || !time) throw new Error('The pinned polar cases changed')
fixed.taskDemandDe = 'Stelle z=−3+3√3i und w=0 in der Gaußschen Ebene dar. Bestimme ihre Beträge, für z ein Argument φ in [0,2π) und die Polarform; erkläre, warum für w kein Argument bestimmt ist.'
fixed.taskDemandEn = 'Plot z=−3+3√3i and w=0 in the complex plane. Determine their moduli, an argument φ in [0,2π) and polar form for z, and explain why w has no defined argument.'
fixed.expectedPerformanceDe = 'z liegt bei (−3,3√3), r=√(9+27)=6 und φ=2π/3; z=6(cos(2π/3)+i sin(2π/3))=6e^(2πi/3). w liegt im Ursprung mit Betrag 0, aber ohne bestimmtes Argument.'
fixed.expectedPerformanceEn = 'z is at (−3,3√3), r=√(9+27)=6 and φ=2π/3; z=6(cos(2π/3)+i sin(2π/3))=6e^(2πi/3). w is at the origin with modulus 0 but no defined argument.'
time.id = 'counterclockwise-time'
time.taskDemandDe = 'Deute z(t)=3e^(iπt/3) für t≥0 Sekunden: Gib die Punkte zu t=0,1,2,3 an und erkläre Radius, Drehsinn, Winkelgeschwindigkeit und Periodendauer.'
time.taskDemandEn = 'Interpret z(t)=3e^(iπt/3) for t≥0 seconds: give the points at t=0,1,2,3 and explain radius, rotation direction, angular velocity and period.'
time.expectedPerformanceDe = 'Die Punkte sind (3,0), (3/2,3√3/2), (−3/2,3√3/2), (−3,0); r=3 bleibt konstant, ω=π/3 rad/s bedeutet Drehung gegen den Uhrzeigersinn und T=2π/ω=6 s.'
time.expectedPerformanceEn = 'The points are (3,0), (3/2,3√3/2), (−3/2,3√3/2), (−3,0); r=3 stays constant, ω=π/3 rad/s means counterclockwise rotation and T=2π/ω=6 s.'
time.understandingFocusDe = 'Die positive Winkelgeschwindigkeit und Zwischenlagen jenseits der im Bild gezeigten Vierteldrehungen werden eigenständig gedeutet.'
time.understandingFocusEn = 'The positive angular velocity and intermediate positions beyond the illustrated quarter-turns are interpreted independently.'

const arithmetic = profiles[ids[6]]
const inverse = arithmetic.applicationCaseBriefs.find(({ id }) => id === 'quarter-turn-inverse')
if (!inverse) throw new Error('The pinned complex-division case changed')
inverse.taskDemandDe += ' Erkläre außerdem, warum null nicht als Divisor verwendet werden darf.'
inverse.taskDemandEn += ' Also explain why zero cannot be used as a divisor.'
inverse.expectedPerformanceDe += ' Division durch 0 ist nicht definiert, da 0 kein multiplikatives Inverses besitzt.'
inverse.expectedPerformanceEn += ' Division by zero is undefined because zero has no multiplicative inverse.'

const reasons = {
  [ids[0]]: 'DE: Das aktuelle PNG zeigt korrekt und vollständig nur die Auswahl von drei aus acht mit (8 über 3)=56. Genau diese Antwort wäre keine neue Lernendenleistung; der alte Gremienfall wurde daher durch eine fest vorgeschriebene Person mit (9 über 3)=84 ersetzt. Zusammen mit dem unabhängigen 6-aus-49-Fall prüft das Profil Modellwahl, ungeordnete Zählung und Deutung als Anzahl statt als Wahrscheinlichkeit. Bildbytes und aktueller Alttext sind gebunden; keine menschliche Freigabe. EN: The current PNG correctly shows only choosing three of eight with 8 choose 3 equal to 56. Repeating that answer would not be fresh learner evidence, so the former committee case is replaced by a required-member selection with 9 choose 3 equal to 84. Together with the independent six-from-49 case, the profile tests model choice, unordered counting and interpretation as a count rather than a probability. Image bytes and current alt text are bound; no human approval.',
  [ids[1]]: 'DE: Das neue PNG zeigt eine quadratische Pyramide mit Netz aus Quadrat und vier Dreiecken sowie einen geraden Kegel mit Halbkreissektor s=2, Grundkreis r=1 und übereinstimmendem Rand 2π. Es liefert weder die frische 4/5-Pyramidenkonstruktion noch den Kegel mit r=3,s=5; dort muss der Bogen 6π cm und der Sektorwinkel 216° sein. Das Profil verlangt räumlich richtiges Schrägbild, aufklappbares Netz, Flächenbegriffe und Erklärung des Darstellungszwecks; bloßes Abzeichnen des Beispiels genügt nicht. Die rechten Körper sind prüfbare Schulbeispiele, keine Einschränkung des kanonischen Zieltexts. Bildbytes gebunden, keine menschliche Freigabe. EN: The new PNG shows a square pyramid and its square-plus-four-triangles net, and a right cone with half-sector s=2, base radius r=1 and matching boundary 2π. It supplies neither the fresh 4/5 pyramid construction nor the cone with r=3,s=5, whose arc must be 6π cm and sector angle 216°. The profile requires a spatially correct oblique view, foldable net, face terminology and an explanation of each representation’s purpose; copying the pictured example is insufficient. The right solids are assessable school examples, not a restriction of the canonical goal. Exact image bytes are bound; no human approval.',
  [ids[2]]: 'DE: Das Bild zeigt korrekt die Hand-Umformung von 2^x=5, eine Tool-Näherung und Einsetzprobe. Der frühere P-Fall 2^x=10 war nur ein Zahlentausch und beide Aufgaben gaben die Arbeitsteilung vor. Die revidierten Aufgaben verlangen nun eine eigene begründete Hand-/Tool-Entscheidung, bei der quadratischen Gleichung eine wirkliche Einsetzprüfung beider Wurzeln und als Transfer 3^(2x−1)=7 mit exakter Logarithmenumformung. Tool-Ausgabe oder Bildkopie allein sind keine Evidenz. Bildbytes gebunden, keine menschliche Freigabe. EN: The image correctly shows hand transformation of 2^x=5, a tool approximation and substitution check. The former P case 2^x=10 was merely a number swap and both tasks prescribed the work split. The revised cases require the learner to choose and justify hand versus tool work, truly check both quadratic roots by substitution, and transfer to 3^(2x−1)=7 with exact logarithmic transformation. Tool output or image copying alone is not evidence. Image bytes are bound; no human approval.',
  [ids[3]]: 'DE: Der aktuelle Bild- und Alttextverbund zeigt G(p) als Verwerfungswahrscheinlichkeit für zwei benannte Regeln mit n=40 bzw. n=80; die angegebenen Werte bei p=0,2 und p=0,4 erlauben korrekt nur Regel B. Das Bild allein schreibt die Bedeutung von G(p) nicht aus. Es ist Orientierung, keine selbstständige Auswahlleistung. Das alte P-Profil enthielt bei denselben p-Werten und Umfängen einen strukturell fast gleichen Fall; dieser wurde durch eindeutig beschriftete Gütekurven für n=60/100 bei p=0,25/0,39 ersetzt. Deren auf drei Stellen gerundete Werte stimmen mit den angegebenen Binomialschwellen überein. Ein separater OC-Fall verlangt ausdrücklich die Komplementbildung 1−OC; beide Null- und Alternativanforderungen müssen zugleich gelten. Bildbytes gebunden, keine menschliche Freigabe. EN: The current image-and-alt-text pair presents G(p) as rejection probability for two named rules with n=40 and n=80; the values at p=0.2 and p=0.4 correctly select only rule B. The picture alone does not spell out what G(p) means. It is teaching orientation, not independent selection evidence. The former P profile used the same p values and sample sizes in an almost identical case; this was replaced with clearly labelled power curves for n=60/100 at p=0.25/0.39. Their values rounded to three places agree with the stated binomial thresholds. A separate OC case explicitly requires the complement 1−OC; both null and alternative requirements must hold together. Image bytes are bound; no human approval.',
  [ids[4]]: 'DE: Das neue Bild vergleicht für denselben einseitigen Test n=50 und n=200 bei p1=0,60; die schematischen Balken sind keine Dichten, und die angegebenen β-Werte rund 0,664 bzw. 0,140 illustrieren geringere Nichtverwerfung bei größerem n. Das unveränderte P-Profil verlangt dagegen für n=10 und n=20 die exakte diskrete Ablehnungsgrenze unter α≤0,05 und zeigt, dass gleiche beobachtete 80 % zu verschiedenen Entscheidungen führen können. Bild oder Faustregel ersetzen weder Binomialschwanzrechnung noch Begründung. Bildbytes gebunden, keine menschliche Freigabe. EN: The new image compares n=50 and n=200 for the same one-sided test at p1=0.60; its schematic bars are not densities, and the stated β values around 0.664 and 0.140 illustrate lower non-rejection at larger n. The unchanged P profile instead requires exact discrete rejection cutoffs under α≤0.05 for n=10 and n=20 and shows that the same observed 80% can yield different decisions. Neither the picture nor a heuristic replaces binomial-tail calculation and justification. Image bytes are bound; no human approval.',
  [ids[5]]: 'DE: Das aktive Bild zeigt korrekt z=1+i mit r=√2 und φ=π/4 sowie z(t)=2e^(−iπt/2) als Uhrzeigerdrehung. Der bisherige zeitabhängige P-Fall wiederholte genau dieses Modell und alle vier gezeigten Lagen; er wurde durch die Gegen-Uhrzeiger-Bewegung 3e^(iπt/3) mit anderen Zwischenwinkeln ersetzt. Der feste Fall prüft zusätzlich z=0 mit Betrag 0, aber ohne definiertes Argument. So müssen Lage, Betrag, Winkel, Drehsinn und Periodendauer unabhängig bestimmt werden; das Bild liefert die neuen Antworten nicht. Bildbytes gebunden, keine menschliche Freigabe. EN: The active image correctly shows z=1+i with r=√2 and φ=π/4, plus z(t)=2e^(−iπt/2) as clockwise motion. The former time-dependent P case repeated exactly that model and all four pictured positions; it is replaced by counterclockwise 3e^(iπt/3) with different intermediate angles. The fixed case also tests z=0 with modulus 0 but no defined argument. Position, modulus, angle, direction and period must therefore be determined independently; the image supplies none of the new answers. Exact image bytes are bound; no human approval.',
  [ids[6]]: 'DE: Das neue gleichskalierte Bild zeigt für z=u=1+i rechnerisch korrekt 2+2i, 0, 2i und 1 sowie die jeweiligen Verschiebungen, Drehungen und Streckfaktoren. Das unveränderte Profil prüft andere komplexe Werte und die beiden inversen Vierteldrehungen mit i; ergänzt ist die notwendige Bedingung, dass der Divisor nicht null sein darf. Bloßes Wiederholen der vier Bildpunkte belegt keine geometrische Deutung neuer Fälle. Bildbytes gebunden, keine menschliche Freigabe. EN: The new equally scaled image correctly shows 2+2i, 0, 2i and 1 for z=u=1+i, together with the corresponding translations, rotations and scale factors. The retained profile tests different complex values and inverse quarter-turns with i, now also requiring the nonzero-divisor condition. Repeating the four pictured points alone does not show geometric interpretation in fresh cases. Image bytes are bound; no human approval.',
}

const candidateSet = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: config.reviewId,
  reviewedAt: '2026-09-27T15:30:12.000Z',
  reviewer: 'OpenAI Codex Mathematik current-image P-v2 re-review; exact model identifier not exposed; AI candidate only',
  goals: ids.map((goalId) => ({
    goalId,
    reason: reasons[goalId],
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    dissent: [],
    profile: profiles[goalId],
  })),
}
await put(candidatesPath, json(candidateSet))
await put(provenancePath, json({
  schemaVersion: 1,
  purpose: 'Seven current Mathematics images rebound to content-reviewed AI-only positive-understanding evidence; central registry intentionally untouched',
  sourceFiles: Object.values(sources).flatMap(({ config, review }) => [config, review]).map(([path, digest]) => ({ path, sha256: `sha256:${digest}` })),
  goalIds: ids,
  imageSha256ByGoalId: Object.fromEntries(ids.map((id) => [id, `sha256:${imageHashes[id]}`])),
  sourceProfileFingerprintByGoalId: Object.fromEntries(ids.map((id) => [id, records.get(id).profileFingerprint])),
  profileDisposition: {
    [ids[0]]: 'revised: image repeated the old 8-choose-3 case; now direct and constrained selections',
    [ids[1]]: 'revised: explicit geometric labels, correct right-pyramid apex, and representation purposes',
    [ids[2]]: 'revised: genuine hand/tool choice, substitution checks, and structurally new exponential equation',
    [ids[3]]: 'revised: fresh power-curve sample-size case distinct from the image; OC complement retained',
    [ids[4]]: 'retained profile: exact small-n thresholds and decisions are independent of the image beta example',
    [ids[5]]: 'revised: zero argument boundary and counterclockwise time transfer distinct from the image',
    [ids[6]]: 'revised: nonzero divisor condition added to fresh complex-operation cases',
  },
  outputConfigPath: configPath,
  outputCandidatesPath: candidatesPath,
  outputReviewPath: config.reviewPath,
  authority: 'needs_human_review; ai_candidate; E1/G1; no human approval',
}))
