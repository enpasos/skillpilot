import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-j5-units-source-bound-p-20260924-v1'
const sourceBase = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-by-j5-j6-two-revised-image-bound-p-20260924-v1/retained-batch-002-unaffected-22'
const sourcePaths = { config: `${sourceBase}.config.json`, review: `${sourceBase}.review.jsonl` }
const sourceSha256 = {
  config: '70e3cda511047b81ae0e91dd0f4b8797cb5c77da70fa186e20ea586afda101d5',
  review: '8bfb840242a134a257b498bbf87b933161cf88cb0d5655f4af1bceaf4fc6b6b1',
}
const goalId = 'f2e42af5-67a6-477e-82ea-e65b09cc6cb3'
const sourceProfileFingerprint = 'sha256:428ac43cc30e0e313a18d4eb51df3b241d919ffa007a37db4ca207be86d8b19f'
const sourceGoalFingerprint = 'sha256:23041be80ac0e2a1a6e140e7c061e62fd364e856734c0cb0872bbb93c6c7192c'
const imageSha256 = 'd38294eb4db797cd97bbee6350babe425d2fd25575f09e9317e1ee615c1d9197'
const reviewId = 'canonical-math-p-v2-m7-j5-units-source-bound-20260924-v1'
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
    if (!(await readFile(destination)).equals(bytes)) throw new Error(`Generated file differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha256(bytes)}`)
}

const sourceConfig = JSON.parse(await pinnedRead(sourcePaths.config, sourceSha256.config))
const sourceLines = (await pinnedRead(sourcePaths.review, sourceSha256.review)).toString('utf8').trimEnd().split('\n')
const sourceRecords = sourceLines.map((line) => JSON.parse(line))
if (sourceConfig.scope.goalIds.length !== 22 || sourceRecords.length !== 22) {
  throw new Error('Expected the pinned 22-record P owner')
}
if (!sourceRecords.every((record, index) =>
  record.goalId === sourceConfig.scope.goalIds[index] &&
  record.reviewId === sourceConfig.reviewId &&
  record.status === 'needs_human_review' &&
  record.reviewAuthority === 'ai_candidate' &&
  record.reviewRunIds.length === 0)) {
  throw new Error('Pinned source order or AI-candidate authority changed')
}
const sourceRecord = sourceRecords.find((record) => record.goalId === goalId)
if (!sourceRecord ||
    sourceRecord.profileFingerprint !== sourceProfileFingerprint ||
    sourceRecord.goalFingerprint !== sourceGoalFingerprint) {
  throw new Error('Pinned unit profile or goal binding changed')
}

const retainedIds = sourceConfig.scope.goalIds.filter((id) => id !== goalId)
const retainedLines = sourceLines.filter((_, index) => sourceRecords[index].goalId !== goalId)
if (retainedIds.length !== 21 || retainedLines.length !== 21) throw new Error('Expected 21 unaffected records')
const retainedConfigPath = `${packagePath}/retained-batch-002-unaffected-21.config.json`
const retainedReviewPath = `${packagePath}/retained-batch-002-unaffected-21.review.jsonl`
await put(retainedConfigPath, jsonBytes({
  ...sourceConfig,
  reviewPath: retainedReviewPath,
  scope: {
    label: '21 unaffected AI-candidate P-v2 records retained byte-for-byte from the SHA-pinned 22-record batch-002 owner after the BY J5 unit-profile correction',
    goalIds: retainedIds,
  },
}))
await put(retainedReviewPath, Buffer.from(`${retainedLines.join('\n')}\n`))

const landscape = JSON.parse(await readFile(at(sourceConfig.landscapePath), 'utf8'))
const goal = landscape.goals.find((item) => item.id === goalId)
if (goal?.description !== 'Die lernende Person kann für alltagsnahe Größen passende Einheiten auswählen, Größenangaben sicher in gleichartige Einheiten umrechnen, dabei anhand des Einheitenverhältnisses begründen, warum die dargestellte Größe unverändert bleibt, und Messergebnisse in einer gemeinsamen Einheit sinnvoll vergleichen.' ||
    goal?.descriptionEn !== 'The learner can choose suitable units for everyday quantities, reliably convert measurements into equivalent units, justify the unchanged quantity from the relationship between the units, and compare measurement results meaningfully in a common unit.') {
  throw new Error('Current bilingual unit-goal description changed')
}
const links = goal.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
if (links.length !== 1 || links[0].url !== `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`) {
  throw new Error('Expected exactly one current units JPG')
}
if (sha256(await readFile(at(`app/public${links[0].url}`))) !== imageSha256) {
  throw new Error('Current units JPG bytes changed')
}

const prior = sourceRecord.profile
if (prior.expectations.length !== 2 ||
    prior.applicationCaseBriefs.length !== 2 ||
    prior.applicationCaseBriefs[0].id !== 'mixed-lengths' ||
    prior.applicationCaseBriefs[1].id !== 'volume-factor-check' ||
    prior.coverageExpectations.minimumIndependentDemonstrations !== 2) {
  throw new Error('Pinned source P shape differs from the reviewed correction')
}
const revisedProfile = {
  ...prior,
  expectations: [
    {
      ...prior.expectations[0],
      essentialUnderstandingDe: 'Eine Einheit muss zur Größenart und Größenordnung passen; beim Umrechnen bleibt die Größe gleich, während Zahlenwert und Größe der Einheit sich entsprechend dem Einheitenverhältnis gegensinnig ändern.',
      essentialUnderstandingEn: 'A unit must suit the type and scale of a quantity; conversion preserves the quantity while the numerical value and the size of the unit change inversely according to the unit relationship.',
    },
    prior.expectations[1],
  ],
  variationAxes: [
    {
      id: 'quantity-type',
      textDe: 'Geld, Länge, Masse oder Zeit im BY-J5-Bereich',
      textEn: 'Money, length, mass, or time in the Bavaria year-5 scope',
    },
    {
      id: 'unit-relation-and-notation',
      textDe: 'Dezimale Längenumrechnung gegenüber dem 60er-Verhältnis und gemischter Schreibweise bei Zeit',
      textEn: 'Decimal length conversion versus the factor of 60 and mixed-unit notation for time',
    },
  ],
  applicationCaseBriefs: [
    prior.applicationCaseBriefs[0],
    {
      id: 'mixed-time-sixty-factor-check',
      taskDemandDe: 'Zwei Fahrten dauern 1 h 20 min und 75 min. Eine automatische Anzeige behauptet 1 h 20 min = 120 min. Prüfe diese Angabe, stelle beide Dauern in Minuten dar und vergleiche sie.',
      taskDemandEn: 'Two journeys take 1 h 20 min and 75 min. An automated display claims 1 h 20 min = 120 min. Check the claim, express both durations in minutes, and compare them.',
      expectedPerformanceDe: 'Die lernende Person verwendet 1 h = 60 min, erhält 1 h 20 min = 80 min, verwirft 120 min und begründet, dass die erste Fahrt 5 min länger dauert, ohne ihre Dauer durch das Umrechnen zu verändern.',
      expectedPerformanceEn: 'The learner uses 1 h = 60 min, obtains 1 h 20 min = 80 min, rejects 120 min, and explains that the first journey lasts 5 min longer without conversion changing its duration.',
      understandingFocusDe: 'Die nichtdezimale Zeitbeziehung und die gemischte Schreibweise verlangen einen eigenständigen Transfer: Einheitenverhältnis, Werterhaltung und Vergleich in gemeinsamer Einheit bleiben maßgeblich.',
      understandingFocusEn: 'The non-decimal time relationship and mixed-unit notation require independent transfer: the unit relationship, unchanged quantity, and comparison in a common unit remain decisive.',
    },
  ],
}
const newConfigPath = `${packagePath}/positive-evidence.config.json`
const candidatesPath = `${packagePath}/positive-evidence.candidates.json`
await put(newConfigPath, jsonBytes({
  ...sourceConfig,
  reviewId,
  reviewPath: `${packagePath}/positive-evidence.review.jsonl`,
  reviewedResourceTypes: ['goal-visualization'],
  scope: {
    label: 'One current BY J5 units P-v2 AI candidate with source-bound money, length, mass, and time transfer and current JPG binding',
    goalIds: [goalId],
  },
}))
await put(candidatesPath, jsonBytes({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-23T23:02:00.000Z',
  reviewer: 'Codex AI candidate author /root/by_ten_d_round_a (exact model identifier unavailable)',
  goals: [{
    goalId,
    reason: 'DE: Die aktuelle BY-J5-Quelle M5.4.1 nennt Geld, Länge, Masse und Zeit, nicht das im alten Pflichtfall verlangte Liter-Volumen. Das P-v2-Profil verlangt weiter zwei unabhängige Demonstrationen: neue Längen in gemeinsamer Einheit ordnen und eine gemischte Fahrtdauer mit 1 h = 60 min gegen eine falsche 120-min-Angabe prüfen und vergleichen. Das Bild zeigt nur eine Bandlänge; die neue Zeitrelation und der Vergleich sind daraus nicht abschreibbar. Die Einheiteninvariante ist mathematisch präzisiert. EN: Bavaria year-5 source M5.4.1 names money, length, mass, and time, not the litre-volume case previously required. The P-v2 profile still requires two independent demonstrations: ordering fresh lengths in a common unit and checking a mixed journey duration using 1 h = 60 min against a false 120-minute claim before comparing durations. The image depicts only a ribbon length; it does not supply the new time relation or comparison. The quantity invariant is stated more precisely. AI candidate only; no human approval.',
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    dissent: [],
    profile: revisedProfile,
  }],
}))
await put(`${packagePath}/provenance.json`, jsonBytes({
  schemaVersion: 1,
  purpose: 'SHA-pinned split of the active 22-record batch-002 P-v2 owner: 21 unaffected raw records retained and one BY J5 source-bound current-image AI candidate materialized separately',
  sourceFiles: Object.entries(sourcePaths).map(([kind, path]) => ({ path, sha256: `sha256:${sourceSha256[kind]}` })),
  movedGoalIds: [goalId],
  retainedGoalCount: 21,
  sourceProfileFingerprint,
  sourceGoalFingerprint,
  currentImageSha256ByGoalId: { [goalId]: `sha256:${imageSha256}` },
  outputPaths: [retainedConfigPath, retainedReviewPath, newConfigPath, candidatesPath],
}))
