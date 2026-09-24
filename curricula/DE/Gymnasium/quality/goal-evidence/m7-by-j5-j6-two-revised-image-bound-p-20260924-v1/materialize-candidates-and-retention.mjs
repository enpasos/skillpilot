import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-by-j5-j6-two-revised-image-bound-p-20260924-v1'
const sourceBase = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-002-current-v2.retained-before-m7-current-bundle39-20260920-v1'
const sourcePaths = {
  config: `${sourceBase}.config.json`,
  review: `${sourceBase}.review.jsonl`,
}
const sourceSha256 = {
  config: '9f19df4063f2dcfd3ca4c01591daec18cee60dbf31d870a500fbb81a5d5a279b',
  review: '4ea0ee04ad6927583811ed9f2b646ce0ed3139be8b7060da4e5310654126fb16',
}
const reviewId = 'canonical-math-p-v2-m7-by-j5-j6-two-revised-image-bound-20260924-v1'
const movedIds = [
  'a4c2b831-02f0-5d55-a300-7823a71352c4',
  'd658e26a-e351-4bca-824e-f346deaa87c5',
]
const sourceProfileFingerprints = {
  [movedIds[0]]: 'sha256:32e95b4899c0480e38bc0022b944a5e1c3c4a364bc484329a25d9085da34fe58',
  [movedIds[1]]: 'sha256:2f25663180cd0f0a8f82816e6a35181864e60f3035f01ffbed09410953136611',
}
const imageSha256 = {
  [movedIds[0]]: '393832d99f4a954b0f9fda45d4495f768a5f22996f6eb3c50ed99e538995b8ac',
  [movedIds[1]]: 'e91b845cb55c589c1338da7782246233fa411b33be5ed9ca801642d40119a98f',
}
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(repositoryRoot, path)
const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const pinnedRead = async (path, expectedSha) => {
  const bytes = await readFile(at(path))
  if (sha256(bytes) !== expectedSha) throw new Error(`Pinned source changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  const destination = at(path)
  await mkdir(dirname(destination), { recursive: true })
  try {
    await writeFile(destination, bytes, { flag: 'wx' })
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    const existing = await readFile(destination)
    if (!existing.equals(bytes)) throw new Error(`Generated file differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha256(bytes)}`)
}

const sourceConfig = JSON.parse(await pinnedRead(sourcePaths.config, sourceSha256.config))
const sourceReview = (await pinnedRead(sourcePaths.review, sourceSha256.review)).toString('utf8')
const sourceLines = sourceReview.trimEnd().split('\n')
const sourceRecords = sourceLines.map((line) => JSON.parse(line))
if (sourceRecords.length !== 24 || sourceConfig.scope.goalIds.length !== 24) {
  throw new Error('Expected 24 records in the pinned batch-002 P owner')
}
if (!sourceRecords.every((record, index) => record.goalId === sourceConfig.scope.goalIds[index] && record.reviewId === sourceConfig.reviewId)) {
  throw new Error('Pinned batch-002 record identity or order changed')
}
if (!movedIds.every((id) => sourceConfig.scope.goalIds.includes(id))) {
  throw new Error('Both moved IDs must belong to the pinned batch-002 P owner')
}
if (!sourceRecords.every((record) => record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate' && record.reviewRunIds.length === 0)) {
  throw new Error('Pinned batch-002 records unexpectedly claim review approval')
}
const movedRecords = new Map(sourceRecords.filter((record) => movedIds.includes(record.goalId)).map((record) => [record.goalId, record]))
for (const goalId of movedIds) {
  if (movedRecords.get(goalId)?.profileFingerprint !== sourceProfileFingerprints[goalId]) {
    throw new Error(`${goalId}: pinned substantive P profile changed`)
  }
}

const retainedIds = sourceConfig.scope.goalIds.filter((goalId) => !movedIds.includes(goalId))
const retainedLines = sourceLines.filter((line, index) => !movedIds.includes(sourceRecords[index].goalId))
if (retainedIds.length !== 22 || retainedLines.length !== 22) throw new Error('Expected exactly 22 unaffected records')
const retainedConfigPath = `${packagePath}/retained-batch-002-unaffected-22.config.json`
const retainedReviewPath = `${packagePath}/retained-batch-002-unaffected-22.review.jsonl`
const retainedConfig = {
  ...sourceConfig,
  reviewPath: retainedReviewPath,
  scope: {
    label: '22 unaffected AI-candidate P-v2 records retained byte-for-byte from the SHA-pinned batch-002 owner after the two-goal J5 rebind',
    goalIds: retainedIds,
  },
}
await put(retainedConfigPath, jsonBytes(retainedConfig))
await put(retainedReviewPath, Buffer.from(`${retainedLines.join('\n')}\n`))

const landscapePath = sourceConfig.landscapePath
const landscape = JSON.parse(await readFile(at(landscapePath), 'utf8'))
const goals = new Map(landscape.goals.map((goal) => [goal.id, goal]))
for (const goalId of movedIds) {
  const goal = goals.get(goalId)
  const links = goal?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  if (links.length !== 1 || links[0].url !== `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`) {
    throw new Error(`${goalId}: expected exactly one current JPG visualization`)
  }
  const actualSha = sha256(await readFile(at(`app/public${links[0].url}`)))
  if (actualSha !== imageSha256[goalId]) throw new Error(`${goalId}: current JPG bytes changed`)
}
const primeGoal = goals.get(movedIds[0])
const powerGoal = goals.get(movedIds[1])
if (primeGoal?.description !== 'Die lernende Person kann natürliche Zahlen größer als 1 schrittweise vollständig in Primfaktoren zerlegen, die Zerlegung durch Rückmultiplikation prüfen und an verschiedenen Zerlegungswegen zeigen, dass bis auf die Reihenfolge dieselben Primfaktoren entstehen.' ||
    primeGoal?.descriptionEn !== 'The learner can factor natural numbers greater than 1 completely into primes step by step, check the factorization by multiplying back, and use different factorization paths to show that the same prime factors result, up to order.' ||
    powerGoal?.description !== 'Die lernende Person kann bei Potenzen a^n mit ganzzahliger Basis a und natürlichem Exponenten n ≥ 1 Basis und Exponent unterscheiden, a^n als Produkt aus n gleichen Faktoren deuten, den Wert berechnen und das Ergebnis an der Faktorstruktur prüfen.' ||
    powerGoal?.descriptionEn !== "For powers a^n with integer base a and natural exponent n ≥ 1, the learner can distinguish base and exponent, interpret a^n as a product of n equal factors, calculate its value, and check the result against the factor structure.") {
  throw new Error('Current bilingual canonical goal wording differs from the reviewed two-goal scope')
}

const priorPower = movedRecords.get(movedIds[1]).profile
const revisedPower = {
  ...priorPower,
  expectations: [
    {
      ...priorPower.expectations[0],
      essentialUnderstandingDe: 'Für eine ganzzahlige Basis a und einen natürlichen Exponenten n ≥ 1 bezeichnet a^n ein Produkt aus genau n gleichen Faktoren a; die Basis bestimmt den wiederholten Faktor, der Exponent seine Anzahl.',
      essentialUnderstandingEn: 'For an integer base a and a natural exponent n ≥ 1, a^n denotes a product of exactly n equal factors a; the base determines the repeated factor and the exponent its count.',
      observablePerformanceDe: 'Die lernende Person übersetzt neue Potenzen mit ganzzahliger Basis in Produkte und umgekehrt, benennt Basis und Exponent und grenzt a^n begründet von a·n ab.',
      observablePerformanceEn: 'The learner translates new powers with integer bases into products and vice versa, identifies base and exponent, and explains the distinction between a^n and a·n.',
    },
    {
      ...priorPower.expectations[1],
      essentialUnderstandingDe: 'Der Wert einer Potenz mit ganzzahliger Basis entsteht durch die vollständige wiederholte Multiplikation; Faktoranzahl, Zwischenprodukte, Betrag und gegebenenfalls Vorzeichen ermöglichen eine strukturelle Kontrolle.',
      essentialUnderstandingEn: 'The value of a power with an integer base comes from complete repeated multiplication; the factor count, intermediate products, magnitude, and, where applicable, sign enable a structural check.',
      observablePerformanceDe: 'Die lernende Person berechnet eine unbekannte Potenz mit ganzzahliger Basis schrittweise und prüft ein angebotenes Ergebnis anhand von Faktor, Faktoranzahl, Betrag und gegebenenfalls Vorzeichen.',
      observablePerformanceEn: 'The learner calculates an unfamiliar power with an integer base step by step and checks a proposed result using the factor, factor count, magnitude, and, where applicable, sign.',
    },
  ],
  variationAxes: [
    priorPower.variationAxes[0],
    {
      id: 'integer-base-sign',
      textDe: 'Positive gegenüber negativer ganzzahliger Basis; Vorzeichenprüfung am wiederholten Faktorprodukt',
      textEn: 'Positive versus negative integer base; checking the sign from the repeated-factor product',
    },
  ],
  applicationCaseBriefs: [
    priorPower.applicationCaseBriefs[0],
    {
      id: 'negative-base-reverse-product-and-check',
      taskDemandDe: 'Das Produkt (−3)·(−3)·(−3) ist als Potenz mit geklammerter Basis zu schreiben. Berechne seinen Wert und prüfe die Behauptung (−3)^3 = +27 anhand der drei Faktoren.',
      taskDemandEn: 'Write the product (−3)·(−3)·(−3) as a power with a parenthesized base. Calculate its value and check the claim (−3)^3 = +27 using the three factors.',
      expectedPerformanceDe: 'Die lernende Person schreibt (−3)^3, zählt drei Faktoren −3 und berechnet (−3)·(−3)·(−3) = −27; +27 wird wegen des Vorzeichens bei drei negativen Faktoren verworfen.',
      expectedPerformanceEn: 'The learner writes (−3)^3, counts three factors of −3, and calculates (−3)·(−3)·(−3) = −27; +27 is rejected because the product of three negative factors is negative.',
      understandingFocusDe: 'Der Richtungswechsel zu einem negativen ganzzahligen Faktor prüft eigenständig Potenzschreibweise, Faktoranzahl, Betrag und Vorzeichen; die positive Bildpotenz liefert die Antwort nicht.',
      understandingFocusEn: 'Reversing direction with a negative integer factor independently tests power notation, factor count, magnitude, and sign; the positive power in the image does not supply the answer.',
    },
  ],
}

const newConfigPath = `${packagePath}/positive-evidence.config.json`
const newCandidatesPath = `${packagePath}/positive-evidence.candidates.json`
const newConfig = {
  ...sourceConfig,
  reviewId,
  reviewPath: `${packagePath}/positive-evidence.review.jsonl`,
  reviewedResourceTypes: ['goal-visualization'],
  scope: {
    label: 'Two current J5 Math P-v2 AI candidates bound to revised bilingual prime-factor and integer-base power goals and their original JPG images',
    goalIds: movedIds,
  },
}
const candidates = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-23T22:39:02.000Z',
  reviewer: 'Codex AI candidate author /root/by_ten_d_round_a (exact model identifier unavailable)',
  goals: [
    {
      goalId: movedIds[0],
      reason: 'DE: Der aktuelle DE/EN-Zieltext nennt nun ausdrücklich vollständige Zerlegung, Rückprobe und Wegunabhängigkeit. Das unveränderte JPG zeigt nur einen Faktorbaum für 72. Das geprüfte P-v2-Profil bleibt fachlich passend: Zwei Wege für 756 und eine unvollständige Zerlegung von 168 verlangen eigenständige Primfaktorprüfung und können nicht aus dem Bild abgeschrieben werden. EN: The current bilingual goal now explicitly includes complete factorization, multiplication back, and path independence. The unchanged JPG shows only one factor tree for 72. The existing P-v2 profile still fits: two paths for 756 and an incomplete factorization of 168 require independent prime-factor checks rather than copying the image. AI candidate only; no human approval.',
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [],
      profile: movedRecords.get(movedIds[0]).profile,
    },
    {
      goalId: movedIds[1],
      reason: 'DE: Der aktuelle DE/EN-Zieltext beschränkt a auf ganzzahlige Basen und n auf natürliche Exponenten ab 1. Das unveränderte JPG zeigt nur 3^4 mit positiver Basis. Das P-v2-Profil nennt jetzt den ganzzahligen Bereich ausdrücklich und verlangt zwei unabhängige Leistungen: 4^3 als Produkt/Wert sowie den umgekehrten Transfer von drei Faktoren −3 zu (−3)^3 = −27 samt Vorzeichenprüfung. Weder die neue Zahl noch das Vorzeichen lassen sich aus dem Bild ablesen. EN: The current bilingual goal restricts a to integer bases and n to natural exponents at least 1. The unchanged JPG only illustrates 3^4 with a positive base. The P-v2 profile now states the integer domain and uses two independent demonstrations: interpret and calculate 4^3, then transfer from three factors of −3 to (−3)^3 = −27 with a sign check. The image supplies neither fresh result. AI candidate only; no human approval.',
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [],
      profile: revisedPower,
    },
  ],
}
await put(newConfigPath, jsonBytes(newConfig))
await put(newCandidatesPath, jsonBytes(candidates))

const provenance = {
  schemaVersion: 1,
  purpose: 'SHA-pinned split of the active 24-record batch-002 P-v2 owner: 22 unaffected raw records retained, two current image-bound AI candidates materialized separately',
  sourceFiles: Object.entries(sourcePaths).map(([kind, path]) => ({ path, sha256: `sha256:${sourceSha256[kind]}` })),
  movedGoalIds: movedIds,
  retainedGoalCount: retainedIds.length,
  sourceProfileFingerprints,
  currentImageSha256ByGoalId: Object.fromEntries(Object.entries(imageSha256).map(([goalId, digest]) => [goalId, `sha256:${digest}`])),
  outputPaths: [retainedConfigPath, retainedReviewPath, newConfigPath, newCandidatesPath],
}
await put(`${packagePath}/provenance.json`, jsonBytes(provenance))
