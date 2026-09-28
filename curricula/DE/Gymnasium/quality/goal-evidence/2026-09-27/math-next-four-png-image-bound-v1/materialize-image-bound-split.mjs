import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../..')
const here = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-next-four-png-image-bound-v1'
const sourceConfig = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-more-png-image-bound-v1/retained-p20-nine.config.json'
const sourceReview = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-four-more-png-image-bound-v1/retained-p20-nine.review.jsonl'
const pinnedSources = {
  [sourceConfig]: '6842d399a02c9618beb5b26f6119d1d99dbb355f4ede11f04db7341352d90db7',
  [sourceReview]: '1e49018ad03f5f06c299a3a73ea8ad8c7cb8af1ff18b4f14dbcf2882ec841418',
}
const png = {
  'c97a33d9-d5e4-56c5-ae4c-822bc4f54898': '5757931b056b60db83cbb19b0229d4b33f944c7471c26ec108c5be7529ddfda1',
  '7bb3c312-f714-55e6-a31f-f31605a93760': 'e39e72d0edbec3a1539a4890c429556144f951c9aae436a15a6dd1f0c892db34',
  'a594dec0-3977-5c43-9432-d4254a7f6130': '4df2074e81cb8f34baff4e34b74b0bd2744eef3538b6e6ddc76fa901f682cff2',
  '9b339361-7719-573d-a913-432246c502ee': 'ade268c6b3cdf801f49fdc0587ec8792e73ecbbcbaf648e680e46ed710da46d2',
}
const ids = Object.keys(png)
const reviewId = 'canonical-math-p-v2-m7-next-four-png-image-bound-20260927-v1'
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const pinned = async (path) => {
  const bytes = await readFile(at(path))
  if (sha(bytes) !== pinnedSources[path]) throw new Error(`Pinned source changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  const fullPath = at(path)
  await mkdir(dirname(fullPath), { recursive: true })
  try { await writeFile(fullPath, bytes, { flag: 'wx' }) }
  catch (error) {
    if (error?.code !== 'EEXIST' || !(await readFile(fullPath)).equals(bytes)) throw error
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}

const config = JSON.parse(await pinned(sourceConfig))
const reviewBytes = await pinned(sourceReview)
if (!reviewBytes.toString('utf8').endsWith('\n')) throw new Error('Pinned JSONL has no trailing LF')
const lines = reviewBytes.toString('utf8').trimEnd().split('\n')
const records = lines.map((line) => JSON.parse(line))
if (records.length !== 9 || records.some((row, index) => row.goalId !== config.scope.goalIds[index])) {
  throw new Error('Source P config/review scope mismatch')
}
const byId = new Map(records.map((row) => [row.goalId, row]))
const landscape = JSON.parse(await readFile(at(config.landscapePath), 'utf8'))
const goals = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const qa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
const bindings = {}
for (const id of ids) {
  const source = byId.get(id)
  if (!source || source.status !== 'needs_human_review' || source.reviewAuthority !== 'ai_candidate' ||
      source.evidenceLevel !== 'E1' || source.maximumClaimScope !== 'G1' ||
      source.reviewRunIds.length !== 0 || source.dissent.length !== 0) {
    throw new Error(`${id}: source P authority or claim changed`)
  }
  const url = `/assets/goal-visualizations/mathematik/${id}/${id}.png`
  const links = goals.get(id)?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  const paths = [
    `curricula/DE/Gymnasium/visualizations/mathematik/${id}/${id}.png`,
    `app/public${url}`,
    `backend/src/main/resources/static${url}`,
  ]
  const actualHashes = await Promise.all(paths.map(async (path) => sha(await readFile(at(path)))))
  const qaRow = qa.records.find((row) => row.goalId === id)
  if (links.length !== 1 || links[0].url !== url || links[0].license !== 'CC-BY-4.0' ||
      links[0].reviewStatus !== 'pilot' || actualHashes.some((hash) => hash !== png[id]) ||
      qaRow?.assetSha256 !== `sha256:${png[id]}` || qaRow?.aiApproved !== 'yes' ||
      qaRow?.aiApprovedAssetSha256 !== `sha256:${png[id]}` || qaRow?.humanApproved !== 'no') {
    throw new Error(`${id}: active PNG/link/V-QA binding mismatch`)
  }
  bindings[id] = { url, paths, sha256: `sha256:${png[id]}` }
}

const retained = lines.map((line) => ({ line, row: JSON.parse(line) })).filter(({ row }) => !png[row.goalId])
if (retained.length !== 5) throw new Error('Expected five retained P records')
const retainedConfig = `${here}/retained-p20-five.config.json`
const retainedReview = `${here}/retained-p20-five.review.jsonl`
await put(retainedConfig, jsonBytes({
  ...config,
  reviewPath: retainedReview,
  scope: {
    label: 'Five unaffected P-v2 AI candidate records retained as exact JSONL lines after four current PNGs',
    goalIds: retained.map(({ row }) => row.goalId),
  },
}))
await put(retainedReview, Buffer.from(`${retained.map(({ line }) => line).join('\n')}\n`))

const reviewPath = `${here}/positive-evidence.review.jsonl`
await put(`${here}/positive-evidence.config.json`, jsonBytes({
  ...config,
  reviewId,
  reviewPath,
  reviewRunManifestPaths: [],
  reviewedResourceTypes: ['goal-visualization'],
  requireApproved: false,
  scope: {
    label: 'Four current exact-PNG Mathematics P-v2 AI candidates with independent changed-case tasks',
    goalIds: ids,
  },
}))

const reasons = {
  [ids[0]]: 'DE: Das aktive Bild zeigt die Mehrdeutigkeit von arcsin(1/2) auf [0,π] gegenüber einer einzelnen Tool-Ausgabe. Das Profil verlangt unabhängig die verlorene Betragsbedingung bei √(x²)=x und einen ganz anderen numerischen Suchfehler bei einer doppelten Nullstelle; die Bildantwort lässt sich nicht kopieren. EN: The image teaches arcsin ambiguity, while the independent profile tests a lost absolute-value condition in √(x²)=x and a sign-change root finder missing a double zero. Exact PNG bound; AI candidate only, no human approval.',
  [ids[1]]: 'DE: Das Bild zeigt orthogonale Achsenvektoren a=(2,0,0), b=(0,3,0), die Normale (0,0,6) und Flächen 6/3. Das Profil fragt dagegen ein schiefes Dreieck aus drei Punkten und eine anders geneigte Parameterfläche mit Normale, Ebenengleichung und wechselndem Halbierungsfaktor. EN: The image shows orthogonal axes and areas 6/3; the profile independently assesses an oblique point-defined triangle and a tilted parametric parallelogram with normal, plane condition and area-factor distinction. Exact PNG bound; AI candidate only.',
  [ids[2]]: 'DE: Das Bild erklärt den orthogonalen Spat 2·3·4=24 und das zugehörige Tetraeder 24/6=4. Der erste Profilfall wurde auf drei schiefe Kanten mit Volumen 30/5 umgestellt; der zweite verlangt Kantenbildung aus vier anderen Punkten und das Orientierungsargument. EN: The image shows an orthogonal 24/4 example. The first independent task now uses three oblique edges giving 30/5; the second derives edges from four different vertices and explains orientation. Exact PNG bound; AI candidate only.',
  [ids[3]]: 'DE: Die Bildsilhouette ist ausdrücklich nur schematisch; die belegten Iterationen c=0 und c=1 werden nicht als fertige Antwort übernommen. Das Profil prüft selbstständige Softwaredarstellung und Iterationen für c=−1 und c=2 sowie den komplexen Transfer c=i mit korrekter Lage in der Parameterebene. EN: The silhouette is schematic only. The profile does not reuse the image values c=0 or c=1: learners independently investigate c=−1 and c=2 with software and transfer to c=i in the complex parameter plane. Exact PNG bound; AI candidate only.',
}
const disposition = {}
const candidates = ids.map((goalId) => {
  const source = byId.get(goalId)
  const profile = structuredClone(source.profile)
  if (goalId === ids[2]) {
    const first = profile.applicationCaseBriefs.find((item) => item.id === 'axis-vectors')
    if (!first) throw new Error('Missing pinned axis-vectors case')
    first.taskDemandDe = 'Ein Spat hat vom selben Eckpunkt aus die schiefen Kanten a=(3,0,0), b=(1,2,0), c=(0,1,5) cm. Bestimme mit dem Spatprodukt Spat- und zugehöriges Tetraedervolumen; erkläre, weshalb bloßes Multiplizieren der Vektorlängen nicht genügt.'
    first.taskDemandEn = 'From a common vertex, a parallelepiped has oblique edges a=(3,0,0), b=(1,2,0), c=(0,1,5) cm. Use the scalar triple product to find its volume and that of its associated tetrahedron; explain why multiplying edge lengths alone is insufficient.'
    first.expectedPerformanceDe = 'b×c=(10,−5,1) cm² und |a·(b×c)|=30 cm³; das zugehörige Tetraeder hat 30/6=5 cm³. Die schiefen Kantenlängen allein bilden keine orthogonalen Höhe-Breite-Länge-Maße.'
    first.expectedPerformanceEn = 'b×c=(10,−5,1) cm² and |a·(b×c)|=30 cm³; the associated tetrahedron has 30/6=5 cm³. The oblique edge lengths alone are not perpendicular length-width-height dimensions.'
    first.understandingFocusDe = 'Das skalare Dreifachprodukt erfasst das orientierungsunabhängige Volumen auch bei schiefen Kanten; die Bildrechnung mit Achsenkanten ist nicht übertragbar.'
    first.understandingFocusEn = 'The scalar triple product captures orientation-independent volume for oblique edges; the image calculation with axis-aligned edges cannot be copied.'
    profile.variationAxes[0].textDe = 'Von direkt gegebenen schiefen Kanten zu vier Raumpunkten mit selbst zu wählendem gemeinsamen Eckpunkt und vertauschter Orientierung wechseln.'
    profile.variationAxes[0].textEn = 'Move from directly given oblique edges to four spatial points requiring a common vertex and attention to orientation.'
    disposition[goalId] = 'first case changed from pictured orthogonal 24/4 to oblique 30/5; second point-tetrahedron case retained'
  } else if (goalId === ids[3]) {
    const first = profile.applicationCaseBriefs.find((item) => item.id === 'real-parameters')
    if (!first) throw new Error('Missing pinned real-parameters case')
    first.taskDemandDe = 'Nutze eine Softwaredarstellung von zₙ₊₁=zₙ²+c, z₀=0, und berechne daneben die ersten Glieder für c=−1 und c=2. Ordne beide Parameter begründet zu.'
    first.taskDemandEn = 'Use a software visualization of zₙ₊₁=zₙ²+c, z₀=0, and separately compute early iterates for c=−1 and c=2. Classify both parameters with reasons.'
    first.expectedPerformanceDe = 'Für c=−1 läuft 0,−1,0,−1,… periodisch und beschränkt. Für c=2 läuft 0,2,6,38,… und entweicht; c=2 liegt außerhalb. Die Softwaredarstellung wird an den Iterationen geprüft.'
    first.expectedPerformanceEn = 'For c=−1 the orbit 0,−1,0,−1,… is periodic and bounded. For c=2 the orbit 0,2,6,38,… escapes, so c=2 lies outside. The software display is checked against the iterates.'
    profile.variationAxes[0].textDe = 'Von einer reellen periodischen Bahn und einer entweichenden reellen Bahn zu einer nichtreellen periodischen Bahn und dem Escape-Radius wechseln.'
    profile.variationAxes[0].textEn = 'Move from a real periodic orbit and an escaping real orbit to a non-real periodic orbit and the escape radius.'
    disposition[goalId] = 'first case changed from pictured c=1 to c=2; complex c=i transfer retained'
  } else {
    disposition[goalId] = 'source profile retained after independent image/task comparison'
  }
  return {
    goalId,
    reason: reasons[goalId],
    evidenceLevel: source.evidenceLevel,
    maximumClaimScope: source.maximumClaimScope,
    dissent: source.dissent,
    profile,
  }
})
await put(`${here}/positive-evidence.candidates.json`, jsonBytes({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-27T13:23:12.000Z',
  reviewer: 'Codex Mathematics exact-PNG P-v2 reinspection; AI candidate only',
  goals: candidates,
}))
await put(`${here}/provenance.json`, jsonBytes({
  schemaVersion: 1,
  purpose: 'Pin four newly imported visualization-bound P-v2 candidates while retaining five unaffected records byte-for-byte',
  sourceFiles: Object.entries(pinnedSources).map(([path, hash]) => ({ path, sha256: `sha256:${hash}` })),
  movedGoalIds: ids,
  retainedGoalIds: retained.map(({ row }) => row.goalId),
  retainedRawLineSha256ByGoalId: Object.fromEntries(retained.map(({ line, row }) => [row.goalId, `sha256:${sha(Buffer.from(`${line}\n`))}`])),
  sourceProfileFingerprints: Object.fromEntries(ids.map((id) => [id, byId.get(id).profileFingerprint])),
  profileDisposition: disposition,
  imageBindings: bindings,
  authority: 'ai_candidate; needs_human_review; no human approval',
}))
