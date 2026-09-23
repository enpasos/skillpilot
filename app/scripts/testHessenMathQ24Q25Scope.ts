import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  normalizeCanonicalLandscape,
  normalizeGoalRef,
  validateCanonicalLandscape,
} from '../src/utils/authoring/canonicalAuthoring'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  normalizeCompositionView,
} from '../src/utils/authoring/compositionViewAuthoring'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readText = (path: string) => readFileSync(resolve(repoRoot, path), 'utf8')
const readJson = (path: string) => JSON.parse(readText(path))
const digest = (path: string) => `sha256:${createHash('sha256').update(readText(path)).digest('hex')}`
const archive = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-22/m7-coordinate-rotation-lk-endpoint-v1'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const raw = readJson(canonicalPath) as SkillLandscape
const snapshot = readJson(`${archive}/before-scope-canonical.json`) as {
  sourcePath: string, sourceSha256: string, landscape: SkillLandscape
}
const beforeRaw = snapshot.landscape
const landscape = normalizeCanonicalLandscape(raw)
const before = normalizeCanonicalLandscape(beforeRaw)
const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const beforeById = new Map(before.goals.map((goal) => [goal.id, goal]))
const rawById = new Map(raw.goals.map((goal) => [goal.id, goal]))
const beforeRawById = new Map(beforeRaw.goals.map((goal) => [goal.id, goal]))
const receipt = readJson(`${archive}/integration.receipt.json`) as {
  beforeCanonicalSha256: string
  beforeSemanticKindSha256: string
  views: Array<{ file: string, beforeSha256: string }>
}
type KindLedger = {
  decisions: Array<{ goalId: string, semanticKind: string, decisionStatus: string, decisionBasis: string, sourceFingerprint: string }>
}
const beforeKinds = readJson(`${archive}/before-scope-semantic-kinds.json`) as KindLedger
const kinds = readJson('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json') as KindLedger
// Match goalBookModel's native K7 validation: fingerprints alone cannot reject
// an invented decisionBasis or another violation of the closed ledger schema.
const k7Ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(k7Ajv)
const validateK7 = k7Ajv.compile(readJson('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'))
assert(validateK7(kinds), `Invalid native K7 ledger: ${k7Ajv.errorsText(validateK7.errors)}`)
assert.equal(snapshot.sourcePath, canonicalPath)
assert.equal(snapshot.sourceSha256, receipt.beforeCanonicalSha256, 'Wrong pre-repair graph provenance')
assert.equal(`sha256:${createHash('sha256').update(`${JSON.stringify(beforeRaw, null, 2)}\n`).digest('hex')}`, receipt.beforeCanonicalSha256, 'Wrong pre-repair graph fixture')
assert.equal(digest(`${archive}/before-scope-semantic-kinds.json`), receipt.beforeSemanticKindSha256, 'Wrong pre-repair semantic-kind fixture')

const rotation = '7bd8f022-5002-5610-994c-a9cec1890558'
const assessment = '42752317-6022-47f2-8b34-160db5ef01fb'
const cluster = '6b0d2a97-cf9c-4778-9c68-16bb82b7afde'
const q25 = 'b3d2284c-21e0-5af8-942a-a4c11390c84a'
const sharedAssessment = '81823f27-0c92-5444-ac4e-32b83169f318'
const markovAssessment = 'e4656e83-3f33-5bda-b0bc-d4b63ec4653e'
// KC HE pp. 43/44 put long-term matrix powers/limits and axis rotations in LK.
// Fixed states themselves remain GK. The old Markov exam also requires the LK
// long-term goals and cannot be retained as a hidden GK prerequisite.
const excludedContent = new Set([
  '0de1e45c-aea9-5e53-932a-027dcf509efa',
  '922d89fc-1cbd-56e9-ac5d-5cb59085de6c',
  '4bc6cc77-3d20-5d27-a74a-8efb0a038d17',
  rotation,
])
// A separate Q4 scope correction keeps this pure-LK modeling branch available
// for prerequisite checks while removing its three atoms from HE-GK targets.
const q4LkPrerequisites = new Set([
  '74f28ce7-e568-5d6e-b946-17445b344fcc',
  '163dd583-8308-53f0-b60d-34588787988d',
  '519660d0-85e5-57a6-a219-d0a253336649',
])
const excludedGk = new Set([...excludedContent, markovAssessment, assessment, cluster])
const fixedStates = '8d893e63-d7de-52d9-8bcb-f48f47d1ccbf'
const heGkFiles = new Set(['de-he-sekii-gk.view.json', 'de-he-gk.view.json', 'de-he-gk-g8.view.json', 'de-he-gk-g9.view.json'])
const oldContent = new Set(beforeKinds.decisions
  .filter((entry) => entry.decisionStatus === 'authoritative' && entry.semanticKind === 'curricularAtomic')
  .map((entry) => entry.goalId))
for (const id of excludedContent) assert(oldContent.has(id), `${id}: excluded item must be an ordinary content goal`)
for (const id of q4LkPrerequisites) assert(oldContent.has(id), `${id}: Q4 LK-only prerequisite must be an ordinary content goal`)

// Use the native local graph validator, then check requires too (the authoring
// validator checks contains). Do not import validateGraph: it runs full-repo QS.
assert.equal(raw.goals.length, rawById.size, 'Duplicate canonical goal IDs')
assert.deepEqual(validateCanonicalLandscape(landscape), [], 'Invalid canonical Mathematics graph')
for (const edge of ['contains', 'requires'] as const) {
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (id: string) => {
    assert(goalById.has(id), `${edge}: missing goal ${id}`)
    assert(!visiting.has(id), `${edge}: cycle at ${id}`)
    if (visited.has(id)) return
    visiting.add(id)
    for (const ref of goalById.get(id)![edge]) visit(normalizeGoalRef(ref))
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of goalById.keys()) visit(id)
}

assert.deepEqual(rawById.get(cluster)?.contains, [assessment], 'Rotation exam folder must contain only its actual endpoint')
assert.deepEqual(rawById.get(cluster)?.requires, [], 'Do not impose cluster-wide prerequisites')
assert.deepEqual(raw.goals.filter((goal) => goal.contains.includes(cluster)).map((goal) => goal.id), [q25], 'Place the endpoint inside Q2.5, not a broad Q2 ancestor')
assert.deepEqual(rawById.get(q25)?.contains, [...beforeRawById.get(q25)!.contains, cluster], 'Preserve the existing Q2.5 children')
for (const id of [cluster, assessment]) {
  const entries = kinds.decisions.filter((entry) => entry.goalId === id)
  assert.equal(entries.length, 1, `${id}: expected one semantic classification`)
  assert.equal(entries[0].decisionStatus, 'authoritative')
  assert.equal(entries[0].semanticKind, 'practiceAssessment', `${id}: endpoint must not become a new content atom`)
  assert.equal(entries[0].sourceFingerprint, fingerprintSemanticKindSourceGoal(rawById.get(id)! as unknown as Record<string, unknown>), `${id}: stale classification binding`)
  const invalidLedger = structuredClone(kinds)
  const index = invalidLedger.decisions.findIndex((entry) => entry.goalId === id)
  invalidLedger.decisions[index].decisionBasis = 'free-text-is-not-an-authorized-decision-basis'
  assert.equal(validateK7(invalidLedger), false, `${id}: native K7 must reject an invented decision basis even with a valid fingerprint`)
  assert(validateK7.errors?.some((error) => error.instancePath === `/decisions/${index}/decisionBasis`), `${id}: negative control must fail on decisionBasis`)
}
for (const script of ['validateGraph.ts', 'generateCurriculumQualityStatus.ts']) {
  const declaration = readText(`app/scripts/${script}`).match(/const CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS = \[([\s\S]*?)\]/u)
  assert(declaration, `${script}: missing native terminal-cluster selector`)
  const ids = [...declaration[1].matchAll(/'([^']+)'/gu)].map((match) => match[1])
  assert.equal(ids.filter((id) => id === cluster).length, 1, `${script}: rotation endpoint missing from native route/assessment checks`)
}

const examGoal = rawById.get(assessment)
assert(examGoal?.examData, 'Actual rotation exam is missing')
const exam = examGoal.examData
assert.equal(examGoal.nodeKind, 'exam')
assert.deepEqual(examGoal.contains, [])
assert.deepEqual(examGoal.requires, [rotation])
assert.deepEqual(exam.coveredGoalIds, [rotation], 'Do not claim broader matrix or geometry coverage')
assert.equal(examGoal.extendedData?.applicabilityFromRequires, true)
assert.equal(examGoal.extendedData?.applicabilityMappingInheritance, 'boundary')
assert.equal(exam.reviewStatus, 'released', 'Machine-reviewed content release is not human approval')
assert.equal(exam.scoring.maxPoints, 20)
assert.equal(exam.scoring.passingPoints, 10)
assert.equal(exam.scoring.steps?.length, 13)
assert.equal(new Set(exam.scoring.steps!.map((step) => step.id)).size, 13)
assert(exam.scoring.steps!.every((step) => Number.isInteger(step.points) && step.points > 0))
assert.equal(exam.scoring.steps!.reduce((sum, step) => sum + step.points, 0), 20)
for (const [part, points] of [[1, 6], [2, 5], [3, 5], [4, 4]]) {
  assert.equal(exam.scoring.steps!.filter((step) => step.id.startsWith(`rotation_${part}_`)).reduce((sum, step) => sum + step.points, 0), points, `Part ${part}: incorrect point allocation`)
}

const reviewedCandidate = readJson(`${archive}/candidate.json`) as { assessmentGoal: typeof examGoal }
const artifactDir = 'curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/coordinate-axis-rotation-lk-v1'
assert.equal(exam.sourceArtifactPath, `${artifactDir}/task.de.md`)
for (const [language, task, solution] of [
  ['de', 'taskContent', 'solutionContent'], ['en', 'taskContentEn', 'solutionContentEn'],
] as const) {
  const artifact = readText(`${artifactDir}/task.${language}.md`)
  for (const field of [task, solution]) {
    assert(exam[field]?.trim(), `${language}: missing ${field}`)
    assert.equal(exam[field], reviewedCandidate.assessmentGoal.examData![field], `${field}: independent content review must be renewed after substantive changes`)
    assert(artifact.includes(exam[field]!), `${language}: canonical exam and source artifact diverge`)
  }
  assert.equal([...exam[task]!.matchAll(/^\d\. /gmu)].length, 4, `${language}: expected four actual task parts`)
  // Check the mathematics in both stored solutions, rather than approving a
  // snapshot merely because its bytes match. Active column-vector rotations:
  // Rz(+90)e1=e2, Rz(+90)e2=-e1; Rx(-90)e2=-e3, Rx(-90)e3=e2.
  const matrices = new Map([...exam[solution]!.matchAll(/([AB])=\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/gu)]
    .map((match) => [match[1], match[2].split('\\\\').map((row) => row.split('&').map(Number))]))
  const apply = (matrix: number[][], vector: number[]) => matrix.map((row) => row.reduce((sum, value, i) => sum + value * vector[i], 0))
  const a = matrices.get('A')
  const b = matrices.get('B')
  assert(a && b, `${language}: missing rotation matrices`)
  assert.deepEqual(a, [[0, -1, 0], [1, 0, 0], [0, 0, 1]])
  assert.deepEqual(b, [[1, 0, 0], [0, 0, 1], [0, -1, 0]])
  assert.deepEqual(apply(a, [2, -1, 3]), [1, 2, 3])
  assert.deepEqual(apply(b, [2, -1, 3]), [2, 3, 1])
  const cMatch = exam[task]!.match(/C=\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/u)
  assert(cMatch, `${language}: counterexample task missing`)
  const c = cMatch[1].split('\\\\').map((row) => row.split('&').map(Number))
  assert.deepEqual(c, [[0, 1, 0], [-1, 0, 0], [0, 0, 1]])
  assert.deepEqual(apply(c, [1, 0, 0]), [0, -1, 0], 'Fixed axis and norm do not prove the requested positive angle')
}

const oldShared = beforeRawById.get(sharedAssessment)!
const shared = rawById.get(sharedAssessment)!
assert(oldShared.examData && shared.examData)
const oldCoverage = oldShared.examData.coveredGoalIds
assert(oldCoverage, 'Snapshot must contain shared-assessment coverage')
assert(oldCoverage.includes(rotation), 'Snapshot must contain the known false rotation coverage')
assert(oldShared.requires.includes(rotation), 'Snapshot must contain the known false rotation prerequisite')
assert.deepEqual(shared.requires, oldShared.requires.filter((id) => id !== rotation))
assert.deepEqual(shared.examData.coveredGoalIds, oldCoverage.filter((id) => id !== rotation))
for (const field of ['taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn', 'scoring'] as const) {
  assert.deepEqual(shared.examData[field], oldShared.examData[field], `Shared assessment ${field} must remain unchanged`)
}

const viewDir = 'curricula/DE/Gymnasium/composition-views/mathematik'
const files = readdirSync(resolve(repoRoot, viewDir)).filter((name) => name.endsWith('.view.json')).sort()
const root = raw.goals.find((goal) => goal.tags?.includes('root'))
assert(root, 'Canonical root missing')
const roots = new Map([[raw.landscapeId, root.id]])
let heGkCount = 0
let heLkCount = 0
let endpointCount = 0
let otherGkEndpointCount = 0
for (const name of files) {
  const view = normalizeCompositionView(readJson(`${viewDir}/${name}`))
  assert.deepEqual(compileCompositionView(view, landscape).findings, [], `${name}: invalid current composition`)
  const { targetGoalIds: targets, prerequisiteOnlyGoalIds: prerequisites } = collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById, roots)
  const hasRotation = targets.has(rotation)
  assert.equal(targets.has(assessment), hasRotation, `${name}: real endpoint must follow the rotation target exactly`)
  assert.equal(targets.has(cluster), hasRotation, `${name}: assessment folder must follow the rotation target exactly`)
  assert(!prerequisites.has(assessment) && !prerequisites.has(cluster), `${name}: assessment must not be hidden as prerequisite-only`)
  if (hasRotation) {
    endpointCount += 1
    assert(targets.has(sharedAssessment), `${name}: preserve the previous shared endpoint alongside the truthful rotation endpoint`)
    if (view.scope.jurisdiction !== 'DE-HE' && view.scope.courseProfile === 'GK') otherGkEndpointCount += 1
    if (view.scope.jurisdiction === 'DE-HE') {
      assert.equal(view.scope.courseProfile, 'LK')
      heLkCount += 1
      for (const id of excludedContent) assert(targets.has(id), `${name}: LK content was over-pruned`)
      assert(targets.has(markovAssessment), `${name}: LK Markov endpoint lost`)
    }
  }
  if (!heGkFiles.has(name)) {
    // The same existing view over the old graph must already select rotation.
    // This guards accidental competence expansion by the new placement.
    const oldTargets = collectCompositionProjectionRoleGoalIds(view.rootNodes, beforeById, roots).targetGoalIds
    assert.equal(hasRotation, oldTargets.has(rotation), `${name}: new endpoint changed the existing rotation choice`)
    continue
  }
  heGkCount += 1
  assert.equal(view.scope.jurisdiction, 'DE-HE')
  assert.equal(view.scope.courseProfile, 'GK')
  const snapshotPath = `${archive}/${name}.before.json`
  const archived = receipt.views.find((entry) => entry.file === `${viewDir}/${name}`)
  assert(archived, `${name}: missing integration provenance`)
  assert.equal(digest(snapshotPath), archived.beforeSha256, `${name}: wrong pre-repair view fixture`)
  const oldView = normalizeCompositionView(readJson(snapshotPath))
  const oldTargets = collectCompositionProjectionRoleGoalIds(oldView.rootNodes, beforeById, roots).targetGoalIds
  for (const id of excludedContent) assert(oldTargets.has(id), `${name}: fixture must reproduce the original scope fault`)
  for (const id of q4LkPrerequisites) assert(oldTargets.has(id), `${name}: fixture must reproduce the previous Q4 target projection`)
  const oldContentTargets = [...oldTargets].filter((id) => oldContent.has(id))
  assert.deepEqual(oldContentTargets.filter((id) => !targets.has(id)).sort(), [...excludedContent, ...q4LkPrerequisites].sort(), `${name}: unrelated old content removed`)
  assert.deepEqual([...targets].filter((id) => oldContent.has(id) && !oldTargets.has(id)), [], `${name}: unrelated old content added`)
  assert(targets.has(fixedStates), `${name}: GK fixed-state competence must stay available`)
  for (const id of q4LkPrerequisites) {
    assert(!targets.has(id), `${name}: Q4 LK-only atom returned as GK target: ${id}`)
    assert(prerequisites.has(id), `${name}: Q4 LK-only atom lost its prerequisite-only projection: ${id}`)
  }
  for (const id of excludedGk) {
    assert(!targets.has(id), `${name}: excluded LK content/assessment returned as target: ${id}`)
    assert(!prerequisites.has(id), `${name}: excluded LK content/assessment returned as prerequisite-only: ${id}`)
  }
}
assert.equal(files.length, 88, 'Update scope regression deliberately when the view catalog changes')
assert.equal(heGkCount, 4)
assert.equal(heLkCount, 4)
assert.equal(endpointCount, 72)
// These pre-existing GK choices outside HE are intentionally not reclassified.
// This endpoint is HE-LK-only, not globally LK-only across the canonical views.
assert.equal(otherGkEndpointCount, 34)
console.log(`HE Q2.4/Q2.5 regression passed: ${files.length} valid views, ${heGkCount} corrected HE-GK scopes with only the separately reviewed Q4 LK branch removed from old content targets; ${endpointCount} exact rotation/endpoint placements including ${otherGkEndpointCount} existing non-HE/national GK views; DAGs, coverage, native binders and bilingual 20-point/13-rubric exam checked.`)
