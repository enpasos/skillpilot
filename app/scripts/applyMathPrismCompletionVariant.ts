import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { applyReviewedMathAssessmentVariants } from './mathAssessmentScopeVariants'

type Goal = Record<string, unknown> & {
  id: string; title?: string; weight: number; contains?: string[]; examData?: Record<string, unknown>
}
type SemanticDecision = {
  goalId: string; sourceFingerprint: string; semanticKind: string; decisionStatus: string; decisionBasis: string
}

const repositoryRoot = resolve(import.meta.dirname, '../..')
const folder = process.argv.find(argument => argument.startsWith('--candidate-dir='))?.slice('--candidate-dir='.length)
  ?? 'curricula/DE/Gymnasium/assessments/mathematik/completion-integrity-2026-11-01/prism-volume-surface-v1'
assert(folder.startsWith('curricula/DE/Gymnasium/assessments/mathematik/completion-integrity-2026-11-01/')
  && !folder.split('/').includes('..'), 'Use a repository-owned reviewed completion assessment candidate')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const viewDirectory = 'curricula/DE/Gymnasium/composition-views/mathematik'
const policyPath = 'app/scripts/config/math-duration-split-spanning-tree-policy.json'
const shouldWrite = process.argv.includes('--write')
const read = (path: string) => JSON.parse(readFileSync(resolve(repositoryRoot, path), 'utf8'))
const bytes = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const normalized = (value: unknown): unknown => Array.isArray(value) ? value.map(normalized)
  : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, nested]) => [key, normalized(nested)])) : value

const receipt = read(`${folder}/review.receipt.json`)
assert.equal(receipt.verdict, 'PASS')
assert.equal(receipt.authorIndependent, true)
for (const file of receipt.files) {
  assert.equal(digest(readFileSync(resolve(repositoryRoot, file.path))), file.sha256, `Reviewed input changed: ${file.path}`)
}
const candidate = read(`${folder}/candidate.goal.json`)
assert.equal(candidate.id, receipt.candidateGoalId)
const integrated = structuredClone(candidate)
integrated.examData.reviewStatus = 'released'
integrated.examData.reviewNote = `Independent machine content review PASS on 2026-11-01; exact task, solution, rubric, prerequisites and coverage bound in ${basename(folder)}/review.receipt.json. Explicit replacement placements are checked separately. No human approval, learner trial or host acceptance.`
const selection = read(`${folder}/composition-selection.json`)
assert.equal(selection.variantGoalId, integrated.id)

const canonical = read(canonicalPath)
const semantic = read(semanticPath)
const goalById = new Map<string, Goal>(canonical.goals.map((goal: Goal) => [goal.id, goal]))
const decisionById = new Map<string, SemanticDecision>(semantic.decisions.map((decision: SemanticDecision) => [decision.goalId, decision]))
for (const binding of receipt.canonicalGoalBindings.goals) {
  const goal = goalById.get(binding.id)
  assert(goal, `Missing reviewed original competency or task: ${binding.id}`)
  assert.equal(digest(JSON.stringify(normalized(goal))), binding.normalizedSha256,
    `Reviewed original competency or task changed: ${binding.id}`)
}
const originalGoal = goalById.get(selection.originalGoalId)
assert(originalGoal)
assert.equal(originalGoal.examData?.reviewStatus, 'released')
const existing = goalById.get(integrated.id)
if (existing) assert.deepEqual(existing, integrated, 'Existing variant changed after content review')
else {
  canonical.goals.push(integrated)
  goalById.set(integrated.id, integrated)
  const parent = goalById.get(selection.parentGoalId)
  assert(parent && parent.title === `Prüfungen Jahrgangsstufe ${candidate.phase.slice(1)}` && parent.contains)
  parent.contains.push(integrated.id)
  const ancestors = new Set<string>([parent.id])
  let previousSize = 0
  while (previousSize !== ancestors.size) {
    previousSize = ancestors.size
    for (const goal of goalById.values()) {
      if ((goal.contains ?? []).some((id: string) => ancestors.has(id))) ancestors.add(goal.id)
    }
  }
  for (const id of ancestors) {
    const goal = goalById.get(id)!
    goal.weight += 1
    const decision = decisionById.get(id)
    assert(decision, `Missing authoritative ancestor classification: ${id}`)
    decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  }
  semantic.decisions.push({
    goalId: integrated.id,
    sourceFingerprint: fingerprintSemanticKindSourceGoal(integrated),
    semanticKind: 'practiceAssessment',
    decisionStatus: 'authoritative',
    decisionBasis: 'reviewed-current-pilot-practice-assessment',
  })
  semantic.decisions.sort((a: SemanticDecision, b: SemanticDecision) => a.goalId.localeCompare(b.goalId))
  semantic.counts.practiceAssessment += 1
  semantic.counts.total += 1
}
assert.equal(semantic.counts.curricularAtomic, 807, 'The established curricularAtomic denominator must remain unchanged')
assert.equal(canonical.goals.length, semantic.counts.total)
const outputs = new Map<string, string>([[canonicalPath, bytes(canonical)], [semanticPath, bytes(semantic)]])
for (const fileName of readdirSync(resolve(repositoryRoot, viewDirectory)).filter(name => name.endsWith('.view.json'))) {
  const path = `${viewDirectory}/${fileName}`
  const view = read(path)
  outputs.set(path, bytes(applyReviewedMathAssessmentVariants(view, goalById, repositoryRoot)))
}
const policy = read(policyPath)
policy.inputs.canonical.sha256 = digest(outputs.get(canonicalPath)!)
outputs.set(policyPath, bytes(policy))
const changed = [...outputs].filter(([path, value]) => readFileSync(resolve(repositoryRoot, path), 'utf8') !== value)
if (shouldWrite) for (const [path, value] of changed) writeFileSync(resolve(repositoryRoot, path), value)
else assert.equal(changed.length, 0, `Run --write to materialize reviewed assessment content and explicit candidate placements: ${changed.map(([path]) => path).join(', ')}`)
console.log(`Math assessment variant ${basename(folder)} ${shouldWrite ? 'WRITE' : 'CHECK'}: ${changed.length} changed files; content reviewed, placement acceptance separate.`)
