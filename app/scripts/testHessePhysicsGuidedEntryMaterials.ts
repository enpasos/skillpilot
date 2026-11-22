// SPDX-License-Identifier: Apache-2.0
// Bind independent content/image decisions to the exact authored pilot.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fingerprintCurrentCurriculumDocument } from './currentCurriculumCatalog'
import { buildApplicabilityCompilation } from './applicabilityCompiler'

const root = new URL('../../', import.meta.url)
const read = (path: string) => JSON.parse(readFileSync(new URL(path, root), 'utf8'))
const bytes = (path: string) => readFileSync(new URL(path, root))
const hash = (value: unknown) => fingerprintCurrentCurriculumDocument(value).slice(7)
const imageHash = (path: string) => createHash('sha256').update(bytes(path)).digest('hex')
const landscape = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const review = read('curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-guided-entry-2026-11-22/review.json')
const experimentReview = read('curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-individual-experiments-2026-11-21/review.json')
const expected = new Map([
  ['physics-e1-motion', 'a4d4efe1-7d30-526b-ac9c-806113da4363'],
  ['physics-e1-accelerated-and-free-fall', 'b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e'],
])
type ViewNode = { id?: string; goalId?: string; children?: ViewNode[] }
const descendants = (nodes: ViewNode[]): ViewNode[] => nodes.flatMap(node => [node, ...descendants(node.children ?? [])])
assert.equal(review.scope.openings.length, 2)
assert.deepEqual(review.requiredCorrections, [])
for (const opening of review.scope.openings) {
  const material = read(opening.materialPath)
  const goal = landscape.goals.find((entry: { id: string }) => entry.id === opening.goalId)
  assert.equal(material.schemaVersion, 2)
  assert.equal(expected.get(material.unit.compositionNodeId), opening.goalId)
  assert.equal(material.unit.orientationGoalId, opening.goalId)
  assert.equal(hash(goal), opening.goalSha256, 'Orientation changed since its independent content review')
  assert.equal(hash({ unit: material.unit, intro: material.intro }), opening.materialSha256,
    'Unit introduction changed since its independent bilingual review')
  assert.equal(imageHash(opening.imagePath), opening.imageSha256, 'Image changed since its actual visual review')
  assert.equal(goal.type, 'atomic')
  assert.equal(goal.semanticKind, 'orientation')
  assert.deepEqual(goal.contains, [])
  assert.deepEqual(goal.requires, [])
  assert.equal(goal.examData, undefined, 'Orientation never certifies subject knowledge')
  for (const exercise of material.exercises ?? []) {
    const approved = experimentReview.scope.exercises.find((entry: { goalId: string }) => entry.goalId === exercise.goalId)
    if (approved) assert.equal(hash(exercise), approved.exerciseSha256,
      'A practical task shared with the nearer child unit must retain its independently reviewed exact stimulus')
  }
  assert(landscape.goalPlacements.some((entry: { goalId: string }) => entry.goalId === goal.id))
  for (const language of ['de', 'en']) {
    const intro = material.intro[language]
    assert.equal(intro.imageUrl, '/' + opening.imagePath.replace(/^app\/public\//u, ''))
    assert.equal(goal.resourceLinks[0].url, intro.imageUrl)
    const source = `curricula/DE/Gymnasium/visualizations/physik/${goal.id}/${goal.id}.png`
    assert.equal(imageHash(source), opening.imageSha256, 'Source and public scene must retain exact bytes')
    assert(intro.question && intro.promise && intro.scene && intro.imageAlt && intro.topics.length)
  }
  assert(landscape.goals.every((entry: { requires?: string[]; examData?: { coveredGoalIds?: string[] } }) =>
    !entry.requires?.includes(goal.id) && !entry.examData?.coveredGoalIds?.includes(goal.id)),
  'New orientation must not widen historical prerequisites or assessment recognition')
  for (const course of ['gk', 'lk']) for (const suffix of ['', '-g8', '-g9', '-sekii']) {
    const name = suffix === '-sekii' ? `de-he-sekii-${course}` : `de-he-${course}${suffix}`
    const view = read(`curricula/DE/Gymnasium/composition-views/physik/${name}.view.json`)
    const nodes = descendants(view.rootNodes)
    const unit = nodes.find(node => node.id === material.unit.compositionNodeId)
    assert(unit, `${view.viewId}: pilot unit is present`)
    assert.equal(unit.children?.[0].goalId, goal.id, `${view.viewId}: own orientation appears first`)
    assert.equal(nodes.filter(node => node.goalId === goal.id).length, 1, `${view.viewId}: no duplicate orientation`)
  }
}
assert.equal(new Set(review.scope.openings.map((entry: { goalId: string }) => entry.goalId)).size, 2)
const pilotIds = new Set(expected.values())
const compilation = buildApplicabilityCompilation()
const pilotApplicability = compilation.reports.flatMap(report => report.goals)
  .filter(goal => pilotIds.has(goal.goalId))
assert.equal(pilotApplicability.length, 2)
for (const goal of pilotApplicability) assert.deepEqual(goal.compiledApplicability, { jurisdiction: ['DE-HE'] },
  'A Hessen-only orientation must not inherit sixteen Länder mappings from its content cluster')
const pilotFindings = compilation.reports.flatMap(report => report.findings)
  .filter(finding => pilotIds.has(finding.goalId ?? ''))
assert(pilotFindings.every(finding => finding.code === 'APV-201' && finding.severity === 'warning'
  && finding.dimension === 'jurisdiction' && finding.message === 'Goal uses applicability override for DE-HE.'),
'Only the independently reviewed explicit Hessen overrides are allowed; mismatches and source claims remain failures')
assert.equal(new Set(pilotFindings.map(finding => finding.goalId)).size, 2)
const accepted = read('docs/qa-ci/applicability-accepted-warnings.json').acceptedWarnings
for (const opening of review.scope.openings) {
  const bindings = accepted.filter((entry: { code: string; goalId: string; landscapeId: string }) =>
    entry.code === 'APV-201' && entry.goalId === opening.goalId && entry.landscapeId === landscape.landscapeId)
  assert.equal(bindings.length, 1, 'The explicit pilot scope needs one independent warning review')
  assert.equal(bindings[0].evidence?.canonicalGoalInputSha256, opening.goalSha256)
  assert.equal(bindings[0].evidence?.reviewPath,
    'curricula/DE/Gymnasium/quality/learning-units/physics-he-e1-guided-entry-2026-11-22/fachreview.md')
  assert.equal(bindings[0].evidence.reviewFileSha256, imageHash(bindings[0].evidence.reviewPath))
  assert.equal(bindings[0].evidence.exactWarningKey,
    `APV-201|${landscape.landscapeId}|${opening.goalId}|jurisdiction|`)
  assert.deepEqual(bindings[0].evidence.authoredJurisdictions, ['DE-HE'])
  assert.deepEqual(bindings[0].evidence.compiledJurisdictions, ['DE-HE'])
}
console.log('Hessen Physics guided-entry materials PASS: two real orientations, eight views, exact independent bilingual/image bindings, retained assessment claims.')
