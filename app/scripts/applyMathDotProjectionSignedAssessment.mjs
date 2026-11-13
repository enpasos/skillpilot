// SPDX-License-Identifier: Apache-2.0
// Places the stronger assessment of the learning unit `math-dot-product-projection` in
// canonical Mathematics and binds its reviewed coverage (unit validity rule R2).
//
// The assessment text lives in one source file. This tool derives everything else from it:
// the assessment goal with a new ID, its place in the Q2 practice cluster, the semantic-kind
// decision, and the unit's ownership and coverage review. The earlier assessment keeps its
// ID and stays in the catalog; it is no longer an own assessment of the unit.
//
// Usage (from app/): node --import tsx scripts/applyMathDotProjectionSignedAssessment.mjs [--write]
// Without --write the tool checks that the committed files equal what it would write.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'
import { assessmentReviewRevisions } from './lib/learningUnitContracts.ts'

const root = resolve(import.meta.dirname, '../..')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const sourcePath = 'curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/dot-projection-signed-20261113-v1/tasks.md'
const reviewPath = 'curricula/DE/Gymnasium/quality/learning-units/math-dot-product-projection-2026-11-13.md'
const sectionKey = 'dot-projection-signed'
const shortKey = 'canonical_math_sek2_q2_unit_dot_projection_signed'
const unitId = 'math-dot-product-projection'
const unitRevision = '2026-11-13-v2'
const coveredGoalId = '3016ec37-1c2e-47db-83f5-e767923bc97e'
const earlierAssessmentId = 'e98672c6-871a-5d0b-889c-5afc51040f0d'
const q2PracticeId = '14b19ee4-364e-50bd-b6a3-499471356ef3'
const areaId = '98dcf9bd-d119-5eb1-835c-7d719f67b485'
const rootId = 'c01b1ce9-a667-4a46-b251-ec33ae602b15'

const write = process.argv.includes('--write')
assert(process.argv.slice(2).every((arg) => arg === '--write'), 'Only --write is supported')
const readText = (path) => readFileSync(resolve(root, path), 'utf8')
const serialize = (value) => JSON.stringify(value, null, 2) + '\n'
const hex = createHash('sha1').update(`DE-GYM-CANONICAL-MATH:${shortKey}`).digest('hex')
const assessmentId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`

// The source file: one assessment section with task and solution, and one rubric table.
const source = readText(sourcePath)
const block = source.split(`## ${sectionKey}\n`)[1]?.split('\n## ')[0]
assert(block, `Missing assessment section ${sectionKey}`)
const taskContent = block.split('### Aufgabe\n')[1]?.split('\n### Lösung')[0]?.trim()
const solutionContent = block.split('### Lösung\n')[1]?.trim()
assert(taskContent && solutionContent, 'Missing task or solution')
const rubric = source.split('\n## Bewertung\n')[1]
assert(rubric, 'Missing rubric section')
const steps = [...rubric.matchAll(/^\| (\d+) \| (\d+) \| (.+) \|$/gmu)].map(([, number, points, description]) => ({
  id: `q2_unit_dot_projection_signed_${number}`, points: Number(points), description: description.trim(),
}))
assert(steps.length > 0 && steps.every((step, index) => step.id.endsWith(`_${index + 1}`)), 'Rubric steps must be numbered from 1')
const totals = rubric.match(/Erreichbar sind (\d+) BE\. Bestanden ist die Prüfung mit (\d+) BE\./u)
assert(totals, 'Missing point totals')
const maxPoints = Number(totals[1]), passingPoints = Number(totals[2])
assert.equal(steps.reduce((sum, step) => sum + step.points, 0), maxPoints, 'Rubric points differ from the stated total')
for (const [index, step] of steps.entries())
  assert(taskContent.includes(`\n${index + 1}. `) && taskContent.split(`\n${index + 1}. `)[1].split('\n')[0].endsWith(`(${step.points} BE)`),
    `Task part ${index + 1} states other points than the rubric`)
const sectionHash = createHash('sha256').update(`${taskContent}\n### Lösung\n${solutionContent}`).digest('hex')

const canonical = JSON.parse(readText(canonicalPath))
const semantic = JSON.parse(readText(semanticPath))
const before = { canonical: serialize(canonical), semantic: serialize(semantic) }
const byId = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const decisionById = new Map(semantic.decisions.map((decision) => [decision.goalId, decision]))
assert(byId.size === canonical.goals.length && decisionById.size === semantic.decisions.length, 'Duplicate goal or decision ID')
const covered = byId.get(coveredGoalId), q2Practice = byId.get(q2PracticeId)
assert(covered?.type === 'atomic' && !covered.examData, 'Unexpected covered goal')
assert(q2Practice?.title === 'Übungen Q2' && byId.get(areaId)?.contains?.includes(q2PracticeId)
  && byId.get(rootId)?.contains?.includes(areaId), 'Unexpected Q2 practice ancestry')

const assessment = {
  id: assessmentId,
  shortKey,
  title: 'Skalarprodukt über die orthogonale Projektion begründen',
  titleEn: 'Justify the dot product through orthogonal projection',
  description: 'Die lernende Person kann in einer Q2-Prüfungsaufgabe die orthogonale Projektion eines Vektors auf eine beliebige Richtung bestimmen, daraus die geometrische Bedeutung des Skalarprodukts einschließlich seines Vorzeichens herleiten und fachsprachlich begründen.',
  descriptionEn: 'The learner can, in a Q2 assessment, determine the orthogonal projection of a vector onto an arbitrary direction, derive from it the geometric meaning of the dot product including its sign, and justify it in mathematical language.',
  core: true,
  weight: 1,
  tags: ['GK', 'LK', 'Practice', 'Assessment', 'ExamTask', 'canonical', 'phase:Q2'],
  applicability: { jurisdiction: [...covered.applicability.jurisdiction] },
  extendedData: { applicabilityFromRequires: true, applicabilityMappingInheritance: 'boundary' },
  sourceRef: sourcePath,
  dimensionTags: {
    framework: 'canonical-gymnasium-math', demandLevel: 'AB3',
    processCompetencies: [...covered.dimensionTags.processCompetencies], guidingIdeas: ['L3'],
    phase: 'Q2', area: 'LinearAlgebra', topicCode: 'CANONICAL.MATH.SEK2.Q2.UNIT.DOT_PROJECTION_SIGNED',
  },
  requires: [coveredGoalId],
  contains: [],
  examples: [],
  resourceLinks: [],
  examData: {
    reviewStatus: 'released',
    reviewNote: `Machine-only content, calculation and unit coverage review, 2026-11-13; source section SHA-256 ${sectionHash}. Every rubric step is required because the backend enforces only total points; the grading note inside the sample solution says what costs no points. Review record: ${reviewPath}. No human review, learner trial or publication claimed.`,
    coveredGoalIds: [coveredGoalId],
    coveredStrands: ['L3'],
    demandLevels: ['AB1', 'AB2', 'AB3'],
    sourceArtifactPath: sourcePath,
    taskContent,
    solutionContent,
    scoring: { maxPoints, passingPoints, steps },
  },
  phase: 'Q2',
  type: 'atomic',
  nodeKind: 'exam',
}

// Catalog: the assessment goal, its cluster membership and the weights of its ancestors.
const existing = byId.get(assessmentId)
if (existing) canonical.goals[canonical.goals.indexOf(existing)] = assessment
else {
  canonical.goals.push(assessment)
  q2Practice.contains.push(assessmentId)
  for (const id of [q2PracticeId, areaId, rootId]) byId.get(id).weight += 1
}
byId.set(assessmentId, assessment)
assert(q2Practice.contains.includes(assessmentId) && q2Practice.contains.length === q2Practice.weight, 'Q2 practice membership or weight is off')

// Semantic-kind ledger: one decision for the assessment, current fingerprints for its ancestors.
const decision = { goalId: assessmentId, sourceFingerprint: fingerprintSemanticKindSourceGoal(assessment),
  semanticKind: 'practiceAssessment', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-practice-assessment' }
if (decisionById.has(assessmentId)) Object.assign(decisionById.get(assessmentId), decision)
else {
  semantic.decisions.push(decision)
  semantic.counts.practiceAssessment += 1
  semantic.counts.total += 1
  semantic.decisions.sort((a, b) => a.goalId.localeCompare(b.goalId))
}
for (const id of [q2PracticeId, areaId, rootId]) {
  const ancestor = semantic.decisions.find((entry) => entry.goalId === id)
  assert(ancestor, `Missing semantic decision for ancestor ${id}`)
  ancestor.sourceFingerprint = fingerprintSemanticKindSourceGoal(byId.get(id))
}
assert(semantic.counts.curricularAtomic === 807, 'Curricular denominator changed')
assert(semantic.counts.total === canonical.goals.length, 'Semantic ledger count differs from the catalog')

// Learning unit: it owns the goal and the new assessment, and carries the reviewed coverage.
assert(existsSync(resolve(root, reviewPath)), `Missing review record ${reviewPath}`)
const unit = canonical.programUnits.find((entry) => entry.id === unitId && entry.kind === 'learningUnit')
assert(unit, `Missing learning unit ${unitId}`)
unit.revision = unitRevision
unit.coverageReviews = [{ assessmentGoalId: assessmentId, goalIds: [coveredGoalId], reference: reviewPath,
  ...assessmentReviewRevisions(assessment) }]
const own = (goalId) => ({ goalId, unitId, relation: 'own' })
const ownsEarlier = canonical.goalPlacements.findIndex((entry) => entry.unitId === unitId && entry.relation === 'own' && entry.goalId === earlierAssessmentId)
if (ownsEarlier >= 0) canonical.goalPlacements[ownsEarlier] = own(assessmentId)
assert.deepEqual(canonical.goalPlacements.filter((entry) => entry.unitId === unitId), [own(coveredGoalId), own(assessmentId)],
  'The unit owns exactly its goal and the new assessment')

const after = { canonical: serialize(canonical), semantic: serialize(semantic) }
const changed = after.canonical !== before.canonical || after.semantic !== before.semantic
if (write && changed) {
  writeFileSync(resolve(root, canonicalPath), after.canonical)
  writeFileSync(resolve(root, semanticPath), after.semantic)
} else {
  assert(!changed, 'Committed catalog or ledger differs from the assessment source; run with --write')
}
console.log(JSON.stringify({ status: write && changed ? 'written' : 'checked', assessmentId, sourceSectionSha256: sectionHash,
  maxPoints, passingPoints, steps: steps.length, unitRevision, ...unit.coverageReviews[0] }, null, 2))
