import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-j6-geometry-image-independent-p-20260924-v1'
const sourceBase = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-006b-j6-split-children-current-v1'
const sourcePaths = {
  config: `${sourceBase}.config.json`,
  review: `${sourceBase}.review.jsonl`,
}
const sourceSha256 = {
  config: '08b24d9765a4a99bee75764a4e13ff1e1540532d99bda16c73cc98100ee50521',
  review: 'a1f519494d83f3cc840537fd612d814e93d4ef1f69c3d55e8ea54def91613b95',
}
const cuboidId = 'cddcdabd-ad58-58ad-bfbd-d9fd8fe2d8fa'
const netId = 'f52e9d72-4995-5c80-91d2-7761ea0cbec0'
const movedIds = [cuboidId, netId]
const sourceProfileFingerprints = {
  [cuboidId]: 'sha256:08c28fcac6a81633f29adbd5cf67a2e2c3a24dfa3ef2384413384317b06e7706',
  [netId]: 'sha256:3ee6664117af7c49abffc8216c436cf7ad13cdab3b5fb0900b3d2a9d20892f48',
}
const imageSha256 = {
  [cuboidId]: '4f851ba6e40d0867ee8f23cd79fd62520c6952d75020a80118cc0e853fe4578d',
  [netId]: '33faa361768fd778065b75ba384dfe6d97e1e00123370f72c78610f6cd540785',
}
const reviewId = 'canonical-math-p-v2-m7-j6-geometry-image-independent-20260924-v1'
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(repositoryRoot, path)
const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const assert = (condition, message) => { if (!condition) throw new Error(message) }
assert(2 * (6 * 4 + 6 * 2) === 72, 'Cuboid distractor arithmetic changed')
assert(2 * (6 * 4 + 6 * 2 + 4 * 2) === 88, 'Cuboid corrected area changed')

const pinnedRead = async (path, expectedSha) => {
  const bytes = await readFile(at(path))
  assert(sha256(bytes) === expectedSha, `Pinned source changed: ${path}`)
  return bytes
}
const put = async (path, bytes) => {
  const destination = at(path)
  await mkdir(dirname(destination), { recursive: true })
  try {
    await writeFile(destination, bytes, { flag: 'wx' })
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error
    assert((await readFile(destination)).equals(bytes), `Generated file differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha256(bytes)}`)
}

// A cube net must be a six-face edge-connected tree whose folds reach all six
// distinct outward normals. This also checks the stated opposite face pairs.
const negate = (vector) => vector.map((component) => -component)
const foldNet = (squares) => {
  const byPosition = new Map(Object.entries(squares).map(([label, point]) => [point.join(','), label]))
  assert(byPosition.size === 6, 'Cube net must have six distinct square positions')
  let edgeCount = 0
  for (const [x, y] of Object.values(squares)) {
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      if (byPosition.has([x + dx, y + dy].join(','))) edgeCount += 1
    }
  }
  assert(edgeCount === 5, 'Cube net must have five uncut shared edges')
  const root = Object.keys(squares)[0]
  const orientations = { [root]: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] }
  const queue = [root]
  while (queue.length) {
    const label = queue.shift()
    const [x, y] = squares[label]
    const [right, down, normal] = orientations[label]
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nextLabel = byPosition.get([x + dx, y + dy].join(','))
      if (!nextLabel) continue
      const next = dx === 1 ? [negate(normal), down, right]
        : dx === -1 ? [normal, down, negate(right)]
          : dy === 1 ? [right, negate(normal), down]
            : [right, normal, negate(down)]
      if (orientations[nextLabel]) {
        assert(JSON.stringify(orientations[nextLabel]) === JSON.stringify(next), 'Inconsistent cube fold')
      } else {
        orientations[nextLabel] = next
        queue.push(nextLabel)
      }
    }
  }
  assert(Object.keys(orientations).length === 6, 'Disconnected cube net')
  assert(new Set(Object.values(orientations).map((frame) => frame[2].join(','))).size === 6, 'Overlapping cube faces')
  return Object.fromEntries(Object.entries(orientations).map(([label, frame]) => [label, frame[2]]))
}
const opposite = (normals, a, b) => JSON.stringify(normals[a]) === JSON.stringify(negate(normals[b]))
const imageNet = { A: [0, 0], B: [1, 0], C: [2, 0], D: [3, 0], E: [1, -1], F: [1, 1] }
const newCandidateNet = { A: [0, 0], B: [1, 0], C: [2, 0], D: [0, -1], E: [1, 1], F: [1, 2] }
const repairedNet = { A: [0, 0], B: [1, 0], C: [2, 0], D: [2, 1], E: [3, 1], F: [4, 1] }
const shapeKey = (squares) => {
  const points = Object.values(squares)
  const variants = []
  for (const [swap, sx, sy] of [[false, 1, 1], [false, 1, -1], [false, -1, 1], [false, -1, -1], [true, 1, 1], [true, 1, -1], [true, -1, 1], [true, -1, -1]]) {
    const transformed = points.map(([x, y]) => swap ? [sx * y, sy * x] : [sx * x, sy * y])
    const minX = Math.min(...transformed.map(([x]) => x))
    const minY = Math.min(...transformed.map(([, y]) => y))
    variants.push(transformed.map(([x, y]) => `${x - minX},${y - minY}`).sort().join(';'))
  }
  return variants.sort()[0]
}
foldNet(imageNet)
const candidateNormals = foldNet(newCandidateNet)
const repairNormals = foldNet(repairedNet)
assert(opposite(candidateNormals, 'A', 'C') && opposite(candidateNormals, 'B', 'F') && opposite(candidateNormals, 'D', 'E'), 'First new net opposite pairs changed')
assert(opposite(repairNormals, 'A', 'C') && opposite(repairNormals, 'B', 'E') && opposite(repairNormals, 'D', 'F'), 'Repair net opposite pairs changed')
assert(shapeKey(imageNet) !== shapeKey(newCandidateNet), 'First new net is only a rotation/reflection of image net')
assert(shapeKey(imageNet) !== shapeKey(repairedNet), 'Repair net is only a rotation/reflection of image net')
assert(shapeKey(newCandidateNet) !== shapeKey(repairedNet), 'New net cases repeat the same shape')

const sourceConfig = JSON.parse(await pinnedRead(sourcePaths.config, sourceSha256.config))
const sourceReview = (await pinnedRead(sourcePaths.review, sourceSha256.review)).toString('utf8')
const sourceLines = sourceReview.trimEnd().split('\n')
const sourceRecords = sourceLines.map((line) => JSON.parse(line))
assert(sourceRecords.length === 5 && sourceConfig.scope.goalIds.length === 5, 'Expected five original J6 P records')
assert(sourceRecords.every((record, index) => record.goalId === sourceConfig.scope.goalIds[index] && record.reviewId === sourceConfig.reviewId), 'Pinned J6 P record identity/order changed')
assert(movedIds.every((id) => sourceConfig.scope.goalIds.includes(id)), 'Both moved IDs must be in original J6 P owner')
assert(sourceRecords.every((record) => record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate' && record.reviewRunIds.length === 0), 'Historical P record unexpectedly claims approval')
const movedRecords = new Map(sourceRecords.filter((record) => movedIds.includes(record.goalId)).map((record) => [record.goalId, record]))
for (const goalId of movedIds) {
  assert(movedRecords.get(goalId)?.profileFingerprint === sourceProfileFingerprints[goalId], `${goalId}: pinned source profile changed`)
}

const retainedIds = sourceConfig.scope.goalIds.filter((goalId) => !movedIds.includes(goalId))
const retainedLines = sourceLines.filter((line, index) => !movedIds.includes(sourceRecords[index].goalId))
assert(retainedIds.length === 3 && retainedLines.length === 3, 'Expected exactly three unaffected J6 P records')
const retainedReviewPath = `${packagePath}/retained-batch-006b-unaffected-3.review.jsonl`
const retainedConfigPath = `${packagePath}/retained-batch-006b-unaffected-3.config.json`
const retainedConfig = {
  ...sourceConfig,
  reviewPath: retainedReviewPath,
  scope: {
    label: 'Three unaffected J6 P-v2 AI-candidate records retained byte-for-byte from the SHA-pinned batch-006b owner',
    goalIds: retainedIds,
  },
}
await put(retainedConfigPath, jsonBytes(retainedConfig))
await put(retainedReviewPath, Buffer.from(`${retainedLines.join('\n')}\n`))

const landscape = JSON.parse(await readFile(at(sourceConfig.landscapePath), 'utf8'))
const goals = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const visualQa = JSON.parse(await readFile(at('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'), 'utf8'))
for (const goalId of movedIds) {
  const goal = goals.get(goalId)
  const links = goal?.resourceLinks?.filter((link) => link.type === 'goal-visualization') ?? []
  assert(links.length === 1 && links[0].url === `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`, `${goalId}: current image link changed`)
  const canonicalPath = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.jpg`
  const publicPath = `app/public${links[0].url}`
  for (const path of [canonicalPath, publicPath]) {
    assert(sha256(await readFile(at(path))) === imageSha256[goalId], `${goalId}: current image bytes changed at ${path}`)
  }
  const qa = visualQa.records.find((record) => record.goalId === goalId)
  assert(qa?.visualizationState === 'available' && qa?.aiApproved === 'yes' && qa?.aiApprovedAssetSha256 === `sha256:${imageSha256[goalId]}` && qa?.description === goal.description, `${goalId}: current image QA is not exact/current`)
}
assert(goals.get(cuboidId)?.description === 'Die lernende Person kann bei einem Quader oder Würfel die Flächeninhalte der sechs Seitenflächen aus den Kantenlängen bestimmen, gleich große Seitenflächen berücksichtigen und sie zum Oberflächeninhalt addieren.', 'Cuboid description changed')
assert(goals.get(netId)?.description === 'Die lernende Person kann aus den sechs Seitenflächen eines Quaders oder Würfels ein vollständiges, zusammenhängendes Netz zeichnen und prüfen, ob es sich ohne Überlappung zum Körper falten lässt.', 'Net description changed')

const oldCuboid = movedRecords.get(cuboidId).profile
const revisedCuboid = {
  ...oldCuboid,
  applicationCaseBriefs: [
    oldCuboid.applicationCaseBriefs[0],
    oldCuboid.applicationCaseBriefs[1],
    {
      id: 'diagnose-missing-face-pair-six-four-two',
      taskDemandDe: 'Für einen Quader mit Kantenlängen 6 cm, 4 cm und 2 cm schlägt jemand 2(6 · 4 + 6 · 2) = 72 cm² als Oberflächeninhalt vor. Prüfe den Ansatz, benenne das fehlende Flächenpaar geometrisch und korrigiere das Ergebnis.',
      taskDemandEn: 'For a cuboid with edge lengths 6 cm, 4 cm, and 2 cm, someone proposes 2(6 times 4 plus 6 times 2) equals 72 square centimetres as its surface area. Check the setup, name the missing pair of faces geometrically, and correct the result.',
      expectedPerformanceDe: 'Die lernende Person erkennt das fehlende Paar der 4 cm × 2 cm großen Seitenflächen. Sie ergänzt 2 · 8 cm² = 16 cm², erhält 88 cm² und begründet dies mit den sechs äußeren Flächen statt nur mit einer erinnerten Formel.',
      expectedPerformanceEn: 'The learner identifies the missing pair of 4 cm by 2 cm faces, adds 2 times 8 square centimetres equals 16 square centimetres, obtains 88 square centimetres, and explains this using the six exterior faces rather than only a memorized formula.',
      understandingFocusDe: 'Die Diagnose bindet einen algebraischen Ansatz an die tatsächlichen Außenflächen eines neuen Quaders; die 4 × 3 × 2-Bildrechnung liefert weder fehlendes Paar noch Ergebnis.',
      understandingFocusEn: 'The diagnosis connects an algebraic setup to the actual exterior faces of a new cuboid; the 4 by 3 by 2 image supplies neither the missing pair nor the result.',
    },
  ],
}

const oldNet = movedRecords.get(netId).profile
const revisedNet = {
  ...oldNet,
  applicationCaseBriefs: [
    {
      id: 'cube-three-row-offset-branch-validity',
      taskDemandDe: 'Zeichne sechs Einheitsquadrate: A, B und C waagerecht nebeneinander, D direkt über A, E direkt unter B und F direkt unter E. Prüfe durch einen nachvollziehbaren Faltweg, ob ein Würfel ohne Lücke oder Überlappung entsteht, und markiere gegenüberliegende Flächen.',
      taskDemandEn: 'Draw six unit squares: A, B, and C in one horizontal row, D directly above A, E directly below B, and F directly below E. Use a traceable folding path to check whether they form a cube without a gap or overlap, and mark opposite faces.',
      expectedPerformanceDe: 'Die lernende Person zeichnet sechs kantenverbundene Quadrate, faltet sie in sechs verschiedene Seitenlagen und erkennt A/C, B/F sowie D/E als Gegenflächenpaare. Sie begründet, warum keine zwei Quadrate dieselbe Würfelseite besetzen.',
      expectedPerformanceEn: 'The learner draws six edge-connected squares, folds them to six distinct face positions, and identifies A/C, B/F, and D/E as opposite pairs. The learner explains why no two squares occupy the same cube face.',
      understandingFocusDe: 'Das gültige Netz besitzt weder die Viererreihe noch die beidseitigen Anhänge am selben Quadrat des Bildes; die Faltbegründung prüft eigenständige räumliche Übertragung.',
      understandingFocusEn: 'This valid net has neither the image’s four-square strip nor its two attachments on the same square; the folding explanation tests independent spatial transfer.',
    },
    oldNet.applicationCaseBriefs[1],
    {
      id: 'repair-two-by-three-rectangle-offset-snake',
      taskDemandDe: 'Sechs Einheitsquadrate bilden ein vollständiges 2-mal-3-Rechteck. Erkläre anhand des Faltens, warum es kein Würfelnetz ist. Verschiebe genau zwei Quadrate, lasse die anderen vier an ihrem Platz und prüfe, ob dein neues zusammenhängendes Netz einen Würfel ohne Überlappung ergibt.',
      taskDemandEn: 'Six unit squares form a complete two-by-three rectangle. Explain by folding why it is not a cube net. Move exactly two squares, leave the other four in place, and check whether your new connected net forms a cube without overlap.',
      expectedPerformanceDe: 'Die lernende Person erkennt, dass ein 2-mal-2-Block vier Flächen an einem vermeintlichen Würfeleck erzwingt und sich beim Falten Flächen überdecken. Eine gültige Reparatur lässt die obere Dreierreihe stehen, behält das untere Quadrat unter deren rechtem Ende und versetzt die beiden anderen unteren Quadrate rechts daneben. So entstehen zwei um zwei Quadrate versetzte Dreierreihen; beim Falten besetzen alle sechs Flächen unterschiedliche Seiten. Andere nachgewiesen gültige Zwei-Quadrat-Reparaturen sind ebenfalls richtig.',
      expectedPerformanceEn: 'The learner recognizes that a two-by-two block would force four faces around a purported cube vertex and leads to overlap on folding. One valid repair keeps the top row of three and the lower square below its rightmost square, then moves the other two lower squares to its right. This gives two rows of three offset by two squares; on folding, all six faces occupy distinct sides. Other justified valid two-square repairs are also correct.',
      understandingFocusDe: 'Die gezielte Zwei-Quadrat-Reparatur eines ungültigen Netzes verlangt Faltprüfung und eine andere Topologie als das Bild; eine bloße Kopie des gezeigten Viererstreifens genügt nicht.',
      understandingFocusEn: 'Repairing the invalid net by moving two squares requires a folding check and a topology different from the image; copying the pictured four-square strip is insufficient.',
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
    label: 'Two J6 geometry P-v2 AI candidates with image-independent cuboid and cube-net transfer cases',
    goalIds: movedIds,
  },
}
const candidates = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId,
  reviewedAt: '2026-09-23T22:48:03.000Z',
  reviewer: 'Codex AI candidate author /root/math_three_v_d_round_a_v2 (exact model identifier unavailable)',
  goals: [
    {
      goalId: cuboidId,
      reason: 'DE: Das aktuelle 4 × 3 × 2-JPG nennt alle Flächenpaare und 52 cm²; der frühere Diagnosefall verwendete exakt dieselben Maße und dasselbe Ergebnis. Nur dieser Fall wurde durch 6 × 4 × 2 mit fehlendem 4 × 2-Flächenpaar und 88 cm² ersetzt. Die anderen zwei Fälle, alle Erwartungen und die drei unabhängigen Nachweise bleiben erhalten. EN: The current 4 by 3 by 2 image gives every face pair and 52 square centimetres; the old diagnosis case repeated those dimensions and answer. Only that case is replaced by 6 by 4 by 2 with a missing 4 by 2 face pair and 88 square centimetres. The other two cases, all expectations, and three independent demonstrations remain. AI candidate only; no human approval.',
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [],
      profile: revisedCuboid,
    },
    {
      goalId: netId,
      reason: 'DE: Das aktuelle JPG zeigt eine Viererreihe mit zwei Anhängen am zweiten Quadrat; der frühere erste Fall verlangte genau dieses Netz, und der dritte nannte es als Reparaturlösung. Beide überlappenden Fälle wurden durch mathematisch geprüfte, voneinander und vom Bild verschiedene Würfelnetze ersetzt. Der Quadernetz-Fall, alle Erwartungen und die drei unabhängigen Nachweise bleiben erhalten. EN: The current image shows a four-square strip with two attachments on the second square; the former first case required exactly that net, and the third named it as a repair. Both overlapping cases are replaced by mathematically checked cube nets distinct from each other and the image. The cuboid-net case, all expectations, and three independent demonstrations remain. AI candidate only; no human approval.',
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [],
      profile: revisedNet,
    },
  ],
}
await put(newConfigPath, jsonBytes(newConfig))
await put(newCandidatesPath, jsonBytes(candidates))

const provenance = {
  schemaVersion: 1,
  purpose: 'SHA-pinned split of active five-record J6 P-v2 owner: three unaffected lines retained byte-for-byte, two image-independent AI candidates materialized separately',
  sourceFiles: Object.entries(sourcePaths).map(([kind, path]) => ({ path, sha256: `sha256:${sourceSha256[kind]}` })),
  movedGoalIds: movedIds,
  retainedGoalIds: retainedIds,
  sourceProfileFingerprints,
  currentImageSha256ByGoalId: Object.fromEntries(Object.entries(imageSha256).map(([goalId, digest]) => [goalId, `sha256:${digest}`])),
  mathematicalChecks: {
    cuboid: '2(6×4 + 6×2 + 4×2) = 88 cm²; omitted pair contributes 16 cm²',
    imageNet: imageNet,
    candidateNet: { squares: newCandidateNet, oppositePairs: ['A/C', 'B/F', 'D/E'] },
    repairedNet: { squares: repairedNet, oppositePairs: ['A/C', 'B/E', 'D/F'] },
    conditions: 'Each new net is a connected six-square tree, folds to six distinct cube-face normals, and is not a rotated/reflected copy of the image net or the other new net.',
  },
  outputPaths: [retainedConfigPath, retainedReviewPath, newConfigPath, newCandidatesPath],
}
await put(`${packagePath}/provenance.json`, jsonBytes(provenance))
