import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const next = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-v-resumed-png-image-bound-v1'
const sources = {
  p20Config: [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-ten-independent-png-20260927-v1/positive-retained-p20.config.json',
    'edd3a4be85302c5275b6e400c3eaf224e8eb63b1ce018c072429299d32db5c48',
  ],
  p20Review: [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-ten-independent-png-20260927-v1/positive-retained-p20.review.jsonl',
    '5f43aba3e7c45af3566bc7c5aa2dd8476678082ce39aff4caf13272ac7eb40df',
  ],
  q3Config: [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-ten-independent-png-20260927-v1/positive-retained-q3.config.json',
    '70379e13c43eb619a84849c9882b20c2481301b6f7044a548d7cba64755036b8',
  ],
  q3Review: [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-ten-independent-png-20260927-v1/positive-retained-q3.review.jsonl',
    'c20dd3310ee8c93c450cf7f72f39260b8ce6bcf1577a3892344667da786c9fbf',
  ],
  normalConfig: [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-retained-after-user-image-import/2573f888c846.config.json',
    '7ed2a36dd9e35e04cb2ca546ac610d8cc27bfc2b5f00a7cd6813ded05ee0555a',
  ],
  normalReview: [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-retained-after-user-image-import/2573f888c846.review.jsonl',
    '9c02a32bb70718ca0d0224667fca823679d404a02283a9e80e5a6b422e5de6b6',
  ],
  b042Config: [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-retained-after-user-image-import/d0d47fe67d71.config.json',
    '57b6f98dfd646c64a49888d52711c591d9b6923edf217fc013ce7ba0b3e827a2',
  ],
  b042Review: [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-astra-user-prompts-20260924-v1/positive-retained-after-user-image-import/d0d47fe67d71.review.jsonl',
    '2c930c3f9e82870209c42808412a60269f20a9428112041882fd9bf5813d8a64',
  ],
}
const goalIds = [
  '87372f49-c832-50f6-921f-ec9a6804d58a',
  'dc12f281-f161-572b-a973-8405ae9b2498',
  '9de07e13-6a5f-5b49-a6d4-0decefb95784',
  'c406d5a0-e81d-5ce9-b535-6512a38798de',
]
const sourceKeyByGoalId = {
  [goalIds[0]]: 'p20',
  [goalIds[1]]: 'b042',
  [goalIds[2]]: 'q3',
  [goalIds[3]]: 'normal',
}
const imageSha256ByGoalId = {
  [goalIds[0]]: '18fe5d2611fab2d829f3d3a9dd48630003a010de702514ce810174f7cf14af3a',
  [goalIds[1]]: '107ce45905fc8013470e02559d55d8ee9185f620c4401cb337d80e280fdee458',
  [goalIds[2]]: '14fd9e3a28fa9a6b38b6b636e1a1e18a04eacba0104025b81a4e684f8e91e640',
  [goalIds[3]]: '059f180b2159ffb4ba444775a85af37b9d7c1d030483944b8fedefe80b950f4b',
}
const expectedTextByGoalId = {
  [goalIds[0]]: {
    description: 'Die lernende Person kann für eine offene Problemstellung eine passende heuristische Strategie auswählen, anwenden und die Wahl begründen.',
    descriptionEn: 'The learner can choose and apply a suitable heuristic strategy for an open problem and justify the choice.',
  },
  [goalIds[1]]: {
    description: 'Die lernende Person kann in Sachzusammenhängen geeignete Methoden der Differentialrechnung auswählen, anwenden und die Ergebnisse im Kontext interpretieren.',
    descriptionEn: 'The learner can choose and apply suitable differential-calculus methods in contextual problems and interpret the results in context.',
  },
  [goalIds[2]]: {
    description: 'Die lernende Person kann bei vorgegebener Binomialwahrscheinlichkeit systematisch einen unbekannten Wert von $n$, $p$ oder einer Ereignisgrenze $k$ bestimmen und die gefundene Lösung im Kontext prüfen.',
    descriptionEn: 'Given a binomial probability, the learner can systematically determine an unknown value of $n$, $p$, or an event boundary $k$ and check the solution in context.',
  },
  [goalIds[3]]: {
    description: 'Die lernende Person kann bei vorgegebener Normalwahrscheinlichkeit unbekannte Intervallgrenzen oder einen unbekannten Verteilungsparameter systematisch bestimmen und die Lösung im Kontext prüfen.',
    descriptionEn: 'Given a normal probability, the learner can systematically determine unknown interval boundaries or an unknown distribution parameter and check the solution in context.',
  },
}
const sha = (value) => createHash('sha256').update(value).digest('hex')
const at = (path) => resolve(root, path)
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const pinned = async ([path, digest]) => {
  const bytes = await readFile(at(path))
  if (sha(bytes) !== digest) throw new Error(`Pinned source changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  const file = at(path)
  await mkdir(dirname(file), { recursive: true })
  try {
    await writeFile(file, bytes, { flag: 'wx' })
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    if (!(await readFile(file)).equals(bytes)) throw new Error(`Generated file differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}
const rawLines = (bytes) => {
  const text = bytes.toString('utf8')
  if (text.includes('\r')) throw new Error('Pinned JSONL must use LF line endings')
  if (!text.endsWith('\n')) throw new Error('Pinned JSONL must end with a newline')
  return text.trimEnd().split('\n')
}

const blobs = Object.fromEntries(await Promise.all(
  Object.entries(sources).map(async ([key, spec]) => [key, await pinned(spec)]),
))
const states = Object.fromEntries(['p20', 'q3', 'normal', 'b042'].map((key) => {
  const config = JSON.parse(blobs[`${key}Config`])
  const lines = rawLines(blobs[`${key}Review`])
  const records = lines.map(JSON.parse)
  if (records.length !== config.scope.goalIds.length ||
      !records.every((record, index) => record.goalId === config.scope.goalIds[index])) {
    throw new Error(`${key}: pinned config and review order disagree`)
  }
  return [key, { config, lines, records }]
}))
const sourceRecordByGoalId = new Map()
for (const id of goalIds) {
  const state = states[sourceKeyByGoalId[id]]
  const record = state.records.find((candidate) => candidate.goalId === id)
  if (!record || sourceRecordByGoalId.has(id)) throw new Error(`${id}: missing or duplicate source record`)
  if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate' ||
      record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1' || record.reviewRunIds.length !== 0) {
    throw new Error(`${id}: source authority or evidence claim changed`)
  }
  sourceRecordByGoalId.set(id, record)
}

const templateConfig = states.p20.config
const landscape = JSON.parse(await readFile(at(templateConfig.landscapePath), 'utf8'))
const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
for (const id of goalIds) {
  const goal = goalById.get(id)
  const expected = expectedTextByGoalId[id]
  if (!goal || goal.description !== expected.description || goal.descriptionEn !== expected.descriptionEn) {
    throw new Error(`${id}: current bilingual canonical wording differs from reviewed P scope`)
  }
}

const qa = JSON.parse(await readFile(
  at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'),
  'utf8',
))
const bindings = {}
for (const id of goalIds) {
  const goal = goalById.get(id)
  const links = goal.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  const url = `/assets/goal-visualizations/mathematik/${id}/${id}.png`
  const publicPath = `app/public${url}`
  const canonicalPath = `curricula/DE/Gymnasium/visualizations/mathematik/${id}/${id}.png`
  const publicSha = sha(await readFile(at(publicPath)))
  const canonicalSha = sha(await readFile(at(canonicalPath)))
  const qaRow = qa.records.find((row) => row.goalId === id)
  if (links.length !== 1 || links[0].url !== url ||
      publicSha !== imageSha256ByGoalId[id] || canonicalSha !== publicSha ||
      qaRow?.imageUrl !== url || qaRow?.assetSha256 !== `sha256:${publicSha}` ||
      qaRow?.aiApproved !== 'yes' || qaRow?.aiApprovedAssetSha256 !== `sha256:${publicSha}` ||
      qaRow?.humanApproved !== 'no') {
    throw new Error(`${id}: active image, canonical copy, or AI-only QA binding changed`)
  }
  bindings[id] = {
    url,
    publicPath,
    canonicalPath,
    sha256: `sha256:${publicSha}`,
    visualizationReviewAuthority: 'AI only; no human approval',
  }
}

const retainedSpecs = [
  {
    sourceKey: 'p20',
    movedId: goalIds[0],
    configPath: `${next}/retained-p20-thirteen.config.json`,
    reviewPath: `${next}/retained-p20-thirteen.review.jsonl`,
    label: 'Thirteen unaffected text-only P-v2 AI-candidate records retained byte-for-byte from the pinned P20 predecessor after the 87372f49 image-bound split',
  },
  {
    sourceKey: 'q3',
    movedId: goalIds[2],
    configPath: `${next}/retained-q3-one.config.json`,
    reviewPath: `${next}/retained-q3-one.review.jsonl`,
    label: 'One unaffected text-only P-v2 AI-candidate record retained byte-for-byte from the pinned Q3 predecessor after the 9de07e13 image-bound split',
  },
  {
    sourceKey: 'b042',
    movedId: goalIds[1],
    configPath: `${next}/retained-b042-seven.config.json`,
    reviewPath: `${next}/retained-b042-seven.review.jsonl`,
    label: 'Seven unaffected text-only P-v2 AI-candidate records retained byte-for-byte from the pinned B042 predecessor after the dc12f281 image-bound split',
  },
]
const retainedRawLineSha256ByGoalId = {}
const retainedOutputs = []
for (const spec of retainedSpecs) {
  const state = states[spec.sourceKey]
  const pairs = state.lines
    .map((line) => ({ line, record: JSON.parse(line) }))
    .filter(({ record }) => record.goalId !== spec.movedId)
  if (pairs.length !== state.lines.length - 1) throw new Error(`${spec.sourceKey}: split removed the wrong number of records`)
  const retainedGoalIds = pairs.map(({ record }) => record.goalId)
  const reviewBytes = Buffer.from(`${pairs.map(({ line }) => line).join('\n')}\n`)
  const configBytes = json({
    ...state.config,
    reviewPath: spec.reviewPath,
    scope: { label: spec.label, goalIds: retainedGoalIds },
  })
  await put(spec.configPath, configBytes)
  await put(spec.reviewPath, reviewBytes)
  retainedOutputs.push(
    { path: spec.configPath, sha256: `sha256:${sha(configBytes)}` },
    { path: spec.reviewPath, sha256: `sha256:${sha(reviewBytes)}` },
  )
  for (const { line, record } of pairs) {
    retainedRawLineSha256ByGoalId[record.goalId] = `sha256:${sha(Buffer.from(`${line}\n`))}`
  }
}

const revisedNormalProfile = structuredClone(sourceRecordByGoalId.get(goalIds[3]).profile)
revisedNormalProfile.expectations = [
  {
    id: 'inverse-equation',
    essentialUnderstandingDe: 'Eine vorgegebene Normalwahrscheinlichkeit wird als CDF-, Rand- oder Intervallgleichung formuliert; gesucht sein können eine Grenze, der Mittelwert oder die positive Standardabweichung.',
    essentialUnderstandingEn: 'A specified normal probability is expressed as a CDF, tail, or interval equation; the unknown may be a boundary, the mean, or the positive standard deviation.',
    observablePerformanceDe: 'Formuliert zu ein- und zweiseitigen inversen Fragestellungen eine passende Gleichung mit richtiger Flächenseite, richtigen Parametern und den erforderlichen Zulässigkeitsbedingungen.',
    observablePerformanceEn: 'Forms an appropriate equation for one- and two-sided inverse problems with the correct area side, parameters, and required admissibility conditions.',
  },
  {
    id: 'solve-check',
    essentialUnderstandingDe: 'Die inverse Lösung muss zur Richtung und Aufteilung der Fläche sowie zum Wertebereich passen; insbesondere ist eine Standardabweichung positiv, und Quantile oder umgestellte Parameter sind an der Ausgangswahrscheinlichkeit zu prüfen.',
    essentialUnderstandingEn: 'The inverse solution must fit the direction and partition of the area as well as the admissible range; in particular, a standard deviation is positive, and quantiles or rearranged parameters must be checked against the original probability.',
    observablePerformanceDe: 'Bestimmt die Unbekannte, setzt sie zurück ein und erläutert die Lage relativ zu μ, die Flächenaufteilung sowie gegebenenfalls die Positivität von σ.',
    observablePerformanceEn: 'Finds the unknown, substitutes it back, and explains its position relative to μ, the area partition, and, where applicable, the positivity of σ.',
  },
]
revisedNormalProfile.coverageExpectations = {
  requiredExpectationIds: ['inverse-equation', 'solve-check'],
  alternativeExpectationGroups: [],
  minimumIndependentDemonstrations: 3,
  freshVariationRequired: true,
  independentTransferRequired: true,
}
revisedNormalProfile.variationAxes = [
  {
    id: 'structural-transfer',
    textDe: 'zweiseitige symmetrische Intervallgrenzen bei bekannten Parametern gegenüber unbekanntem Mittelwert und unbekannter positiver Standardabweichung',
    textEn: 'two-sided symmetric interval boundaries with known parameters versus an unknown mean and an unknown positive standard deviation',
  },
]
revisedNormalProfile.applicationCaseBriefs = [
  {
    id: 'central-interval',
    taskDemandDe: 'Für X~N(80;6²): Bestimme das um μ symmetrische Intervall [a;b], das 90 % der Werte enthält, und prüfe beide Randflächen.',
    taskDemandEn: 'For X~N(80,6²), find the interval [a,b] symmetric about μ that contains 90% of the values, and check both tail areas.',
    expectedPerformanceDe: 'Außerhalb des zentralen 90-%-Intervalls liegen je 5 %. Mit z₀,₉₅≈1,6449 gilt a=80−1,6449·6≈70,1 und b=80+1,6449·6≈89,9; beide Randflächen sind ungefähr 0,05.',
    expectedPerformanceEn: 'Each tail outside the central 90% interval has area 0.05. With z₀.₉₅≈1.6449, a=80−1.6449·6≈70.1 and b=80+1.6449·6≈89.9; both tail areas are approximately 0.05.',
    understandingFocusDe: 'Eine zweiseitige zentrale Fläche in zwei gleiche Randflächen übersetzen und beide Grenzen bestimmen.',
    understandingFocusEn: 'Translate a two-sided central area into two equal tails and determine both boundaries.',
  },
  sourceRecordByGoalId.get(goalIds[3]).profile.applicationCaseBriefs.find(({ id }) => id === 'unknown-mean'),
  {
    id: 'unknown-standard-deviation',
    taskDemandDe: 'Für X~N(50;σ²) mit σ>0 gilt P(X≥62)≈0,0228. Bestimme σ und prüfe die Randwahrscheinlichkeit.',
    taskDemandEn: 'For X~N(50,σ²) with σ>0, P(X≥62)≈0.0228. Find σ and check the tail probability.',
    expectedPerformanceDe: 'Die obere Randfläche 0,0228 gehört näherungsweise zu z=2. Daher gilt (62−50)/σ=2 und wegen σ>0 folgt σ=6; P(Z≥2)≈0,0228 bestätigt die Lösung.',
    expectedPerformanceEn: 'The upper-tail area 0.0228 corresponds approximately to z=2. Thus (62−50)/σ=2 and, since σ>0, σ=6; P(Z≥2)≈0.0228 confirms the solution.',
    understandingFocusDe: 'Eine positive Standardabweichung aus einer vorgegebenen Randfläche invers bestimmen und zurückprüfen.',
    understandingFocusEn: 'Determine a positive standard deviation from a specified tail area and verify it by substitution.',
  },
]
if (revisedNormalProfile.applicationCaseBriefs.some((item) => !item)) {
  throw new Error('Pinned normal profile no longer contains the unknown-mean case')
}

const reviewId = 'canonical-math-p-v2-m7-four-v-resumed-png-image-bound-20260927-v1'
const configPath = `${next}/positive-evidence.config.json`
const candidatesPath = `${next}/positive-evidence.candidates.json`
const reviewPath = `${next}/positive-evidence.review.jsonl`
const configBytes = json({
  ...templateConfig,
  reviewId,
  reviewPath,
  reviewRunManifestPaths: [],
  reviewedResourceTypes: ['goal-visualization'],
  requireApproved: false,
  scope: {
    label: 'Four current Mathematics P-v2 AI candidates bound to exact active PNG teaching images; fresh evidence tasks remain independent and no human approval is claimed',
    goalIds,
  },
})
await put(configPath, configBytes)

const reasons = {
  [goalIds[0]]: 'DE: Das aktive PNG zeigt für ein Rechteck mit Umfang 40 m korrekt A=x(20−x), die symmetrischen Testwerte 96/99/100/99/96 und ausdrücklich, dass x=10 zunächst nur eine Vermutung und noch kein allgemeiner Beweis ist. Das unveränderte P-v2-Profil verlangt stattdessen zwei frische Strukturen: eine kombinatorische Diagonalenzählung mit abschließender Doppelzählungsbegründung und ein Paritätsinvariant. Das Bild liefert keine dieser Antworten; seine exakten Bytes sind gebunden, ohne menschliche Freigabe. EN: The active PNG correctly shows A=x(20−x) for a rectangle of perimeter 40 m, the symmetric test values 96/99/100/99/96, and explicitly states that x=10 is initially a conjecture rather than a general proof. The unchanged P-v2 profile instead requires two fresh structures: combinatorial diagonal counting with a final double-counting argument and a parity invariant. The image supplies neither answer; its exact bytes are bound without human approval.',
  [goalIds[1]]: 'DE: Das aktive PNG ist für h(t)=1+4t−t² auf [0;4] fachlich konsistent: h(0)=h(4)=1, der Hochpunkt liegt bei (2|5), h′(t)=4−2t und h′(2)=0. Das unveränderte P-v2-Profil prüft unabhängig davon Bestandsmaximum gegenüber maximaler Zunahmerate in einem kubischen Modell sowie Umkehrzeiten über Vorzeichenwechsel der Geschwindigkeit. Damit werden Methodenwahl, Randwerte, Einheiten und Transfer geprüft; das Bild gibt die frischen Lösungen nicht vor. Exakte PNG-Bytes gebunden, keine menschliche Freigabe. EN: The active PNG is mathematically consistent for h(t)=1+4t−t² on [0,4]: h(0)=h(4)=1, the maximum is at (2,5), h′(t)=4−2t, and h′(2)=0. Independently, the unchanged P-v2 profile assesses a stock maximum versus a maximum growth rate in a cubic model and reversal times through sign changes of velocity. This checks method choice, endpoints, units, and transfer; the image does not supply the fresh solutions. Exact PNG bytes are bound without human approval.',
  [goalIds[2]]: 'DE: Das aktive PNG zeigt für X~Bin(10;0,5) korrekt P(X≥6)≈0,377>0,20 und P(X≥7)≈0,172≤0,20, sodass 7 die kleinste passende Grenze ist. Das unveränderte P-v2-Profil prüft mit neuen Aufgaben eine untere kumulierte Grenze sowie getrennt unbekanntes p und diskretes n; Suchrichtung, Zulässigkeit und Rückprüfung bleiben eigenständige Lernendenleistung. Das Bild liefert diese drei Antworten nicht. Exakte PNG-Bytes gebunden, keine menschliche Freigabe. EN: The active PNG correctly shows P(X≥6)≈0.377>0.20 and P(X≥7)≈0.172≤0.20 for X~Bin(10,0.5), so 7 is the smallest qualifying boundary. The unchanged P-v2 profile uses fresh tasks to assess a lower cumulative boundary and, separately, unknown p and discrete n; search direction, admissibility, and substitution checks remain independent learner work. The image supplies none of those three answers. Exact PNG bytes are bound without human approval.',
  [goalIds[3]]: 'DE: Das aktive PNG zeigt für X~N(100;15²) korrekt das einseitige 97,5-%-Quantil z≈1,96, b≈129,4 und den rechten 2,5-%-Rand. Der bisherige erste P-Fall hatte dieselbe einseitige Quantilstruktur nur mit anderen Zahlen und wäre nach Bildbindung kein hinreichend frischer Transfer mehr. Das revidierte Profil verlangt deshalb ein zweiseitiges zentrales Intervall, einen unbekannten Mittelwert und zusätzlich eine positive unbekannte Standardabweichung; alle Lösungen müssen an Flächenrichtung und Ausgangswahrscheinlichkeit geprüft werden. Das Bild gibt diese Antworten nicht vor. Exakte PNG-Bytes gebunden, keine menschliche Freigabe. EN: The active PNG correctly shows the one-sided 97.5% quantile z≈1.96, b≈129.4, and the 2.5% right tail for X~N(100,15²). The former first P case used the same one-sided quantile structure with different numbers, so after binding the image it would no longer provide sufficiently fresh transfer. The revised profile therefore requires a two-sided central interval, an unknown mean, and additionally an unknown positive standard deviation; every solution must be checked against the area direction and original probability. The image supplies none of those answers. Exact PNG bytes are bound without human approval.',
}
const candidateBytes = json({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-27T11:11:57.000Z',
  reviewer: 'Codex Mathematics image-bound P-v2 reinspection; AI candidate only',
  goals: goalIds.map((goalId) => {
    const source = sourceRecordByGoalId.get(goalId)
    return {
      goalId,
      reason: reasons[goalId],
      evidenceLevel: source.evidenceLevel,
      maximumClaimScope: source.maximumClaimScope,
      dissent: source.dissent,
      profile: goalId === goalIds[3] ? revisedNormalProfile : source.profile,
    }
  }),
})
await put(candidatesPath, candidateBytes)

const sourceFiles = Object.values(sources).map(([path, digest]) => ({
  path,
  sha256: `sha256:${digest}`,
}))
const sourceMovedRawLineSha256ByGoalId = Object.fromEntries(goalIds.map((goalId) => {
  const state = states[sourceKeyByGoalId[goalId]]
  const line = state.lines.find((candidate) => JSON.parse(candidate).goalId === goalId)
  return [goalId, `sha256:${sha(Buffer.from(`${line}\n`))}`]
}))
await put(`${next}/provenance.json`, json({
  schemaVersion: 1,
  purpose: 'SHA-pinned image-bound P-v2 successor for four current Mathematics PNGs, with three exact retained splits and no central registry mutation',
  sourceFiles,
  movedGoalIds: goalIds,
  retainedSets: retainedSpecs.map((spec) => ({
    sourceConfigPath: sources[`${spec.sourceKey}Config`][0],
    sourceReviewPath: sources[`${spec.sourceKey}Review`][0],
    retainedConfigPath: spec.configPath,
    retainedReviewPath: spec.reviewPath,
    retainedGoalIds: states[spec.sourceKey].records
      .filter(({ goalId }) => goalId !== spec.movedId)
      .map(({ goalId }) => goalId),
  })),
  retainedRawLineSha256ByGoalId,
  retainedOutputs,
  sourceMovedRawLineSha256ByGoalId,
  sourceProfileFingerprints: Object.fromEntries(goalIds.map((goalId) => [
    goalId,
    sourceRecordByGoalId.get(goalId).profileFingerprint,
  ])),
  profileDisposition: {
    [goalIds[0]]: 'profile byte content unchanged; exact image newly bound',
    [goalIds[1]]: 'profile byte content unchanged; exact image newly bound',
    [goalIds[2]]: 'profile byte content unchanged; exact image newly bound',
    [goalIds[3]]: 'profile revised because the former one-sided quantile case duplicated the newly bound image structurally; replaced by a central interval and extended with unknown positive sigma',
  },
  currentBindings: bindings,
  outputPaths: [
    ...retainedOutputs.map(({ path }) => path),
    configPath,
    candidatesPath,
    reviewPath,
    `${next}/provenance.json`,
  ],
  authority: 'ai_candidate; needs_human_review; no human approval',
}))
