import assert from 'node:assert/strict'
import { fingerprint, proposeCompleteForeignRequires, type RequiresDecision } from './lib/crossSubjectRequiresInventory'
import { validateRequiresAction, validateRequiresDecisions, type IndependentReview } from './lib/crossSubjectRequiresReview'

const reviewInput = { semanticSha256: fingerprint({ title: 'dependent' }),
  prerequisitesSha256: fingerprint([]), scopeSha256: fingerprint({ jurisdiction: ['DE-HE'] }) }
const occurrence = { key: 'physics:p', selected: true, technicalRole: 'leaf', semanticKind: 'curricularAtomic', directRequires: [] as string[], reviewInput }
const inventory = { families: [{ familyId: 'gym', goals: [
  { goalId: 'p', reviewRequired: true, occurrences: [occurrence] },
  { goalId: 'm', reviewRequired: false, occurrences: [{ ...occurrence, key: 'math:m' }] },
  { goalId: 'cluster', reviewRequired: false, occurrences: [{ ...occurrence, key: 'math:cluster', technicalRole: 'cluster', semanticKind: 'curricularArea' }] },
] }] }
const decision: RequiresDecision = { decisionId: 'review-p', familyId: 'gym', dependentGoalId: 'p',
  prerequisiteGoalIds: ['m'], decision: 'add', rationale: 'Concrete necessary procedure for the dependent goal.',
  evidenceKind: 'didacticSequencing', sourceRefs: [{ path: 'curricula/math.json', recordId: 'm', supports: 'goalSemantics' }],
  applicability: { universality: 'allDependentScopes', scopes: [], alternatives: ['No prerequisite for optional advanced variant.'] },
  author: 'author', reviewInput }
const independentReview: IndependentReview = { authorLedgerSha256: 'author-hash', inventorySha256: 'inventory-hash',
  decisions: [{ decisionId: 'review-p', reviewer: 'reviewer', rationale: 'Checked actual content and applicability.',
    decision: 'approved', reviewInput }] }
const options = { requireComplete: true, independentReview, authorLedgerSha256: 'author-hash', inventorySha256: 'inventory-hash' }
assert.equal(validateRequiresDecisions(inventory, { decisions: [decision] }, options).errors.length, 0)
assert.equal(validateRequiresDecisions(inventory, { decisions: [decision] }, options).reviewed, 1)
assert.equal(validateRequiresDecisions(inventory, {}, options).open, 1)
for (const field of ['semanticSha256', 'prerequisitesSha256', 'scopeSha256'] as const) {
  const changed = { ...decision, reviewInput: { ...reviewInput, [field]: 'stale' } }
  assert(validateRequiresDecisions(inventory, { decisions: [changed] }, options).errors.some(error => error.includes('Stale')))
}
assert(validateRequiresDecisions(inventory, { decisions: [decision, decision] }, options).errors.some(error => error.includes('Duplicate')))
assert(validateRequiresDecisions(inventory, { decisions: [{ ...decision, prerequisiteGoalIds: ['cluster'] }] }, options).errors.some(error => error.includes('Non-curricular-atomic')))
assert(validateRequiresDecisions(inventory, { decisions: [{ ...decision, evidenceKind: 'directSourceStatement' }] }, options).errors.some(error => error.includes('Direct-source')))
assert(validateRequiresDecisions(inventory, { decisions: [decision] }, { ...options, authorLedgerSha256: 'other' }).errors.some(error => error.includes('hash mismatch')))
assert.equal(validateRequiresDecisions(inventory, { decisions: [decision] }, {
  ...options, independentReview: { ...independentReview, decisions: [{ ...independentReview.decisions[0], reviewer: 'author' }] },
}).reviewed, 0)
assert.equal(validateRequiresDecisions(inventory, { decisions: [decision] }, {
  ...options, independentReview: { ...independentReview, decisions: [independentReview.decisions[0], independentReview.decisions[0]] },
}).reviewed, 0)
assert.equal(validateRequiresDecisions(inventory, { decisions: [{ ...decision, decision: 'scope_gap', applicability: {
  ...decision.applicability, universality: 'unresolved' }, rationale: 'Current goal has incompatible scope.' }] }, options).reviewed, 0)
assert.notEqual(fingerprint({ a: 1, b: 2 }), fingerprint({ a: 2, b: 1 }))
assert.equal(fingerprint({ a: 1, b: 2 }), fingerprint({ b: 2, a: 1 }))

const proposedInput = { ...reviewInput, prerequisitesSha256: fingerprint(['m']) }
const proposedDecision = { ...decision, proposalBinding: {
  baseline: reviewInput, proposed: proposedInput, baselineRequires: [], proposedRequires: ['m'],
  changesSha256: fingerprint({ dependentGoalId: 'p', baselineRequires: [], proposedRequires: ['m'] }),
  prerequisiteInputs: [{ goalId: 'm', semanticSha256: reviewInput.semanticSha256, scopeSha256: reviewInput.scopeSha256 }],
} }
const proposalReview = { ...independentReview, decisions: [{ ...independentReview.decisions[0],
  proposalBindingSha256: fingerprint(proposedDecision.proposalBinding) }] }
const proposalOptions = { ...options, independentReview: proposalReview, reviewedInventorySha256: 'inventory-hash', inventorySha256: 'implemented-inventory-hash' }
assert.equal(validateRequiresDecisions(inventory, { decisions: [proposedDecision] }, proposalOptions).reviewed, 1)
const implementedInventory = { families: inventory.families.map(family => ({ ...family,
  goals: family.goals.map(goal => goal.goalId === 'p' ? { ...goal, occurrences: [{ ...occurrence,
    directRequires: ['m'], reviewInput: proposedInput }] } : goal) })) }
assert.equal(validateRequiresDecisions(implementedInventory, { decisions: [proposedDecision] }, proposalOptions).errors.length, 0)
const driftedInventory = { families: implementedInventory.families.map(family => ({ ...family,
  goals: family.goals.map(goal => goal.goalId === 'm' ? { ...goal, occurrences: [{ ...occurrence,
    reviewInput: { ...reviewInput, semanticSha256: 'changed-prerequisite' } }] } : goal) })) }
assert(validateRequiresDecisions(driftedInventory, { decisions: [proposedDecision] }, proposalOptions).errors.some(error => error.includes('Stale proposed prerequisite')))
assert.equal(validateRequiresDecisions(inventory, { decisions: [proposedDecision] }, options).reviewed, 0)
assert(validateRequiresDecisions(inventory, { decisions: [{ ...proposedDecision,
  proposalBinding: { ...proposedDecision.proposalBinding, baselineRequires: ['old'],
    changesSha256: fingerprint({ dependentGoalId: 'p', baselineRequires: ['old'], proposedRequires: ['m'] }) } }] }, proposalOptions)
  .errors.some(error => error.includes('silently removes')))

const replacement = proposeCompleteForeignRequires(['physics-internal', 'math:legacy-cluster', 'math:retained-atom'],
  ['retained-atom', 'new-atom'], new Set(['legacy-cluster', 'retained-atom', 'new-atom']))
assert.deepEqual(replacement, ['physics-internal', 'math:retained-atom', 'new-atom'])
assert.equal(validateRequiresAction('replace', ['physics-internal', 'math:legacy-cluster', 'math:retained-atom'], replacement).length, 0)
assert(validateRequiresAction('add', ['physics-internal', 'math:legacy-cluster', 'math:retained-atom'], replacement).some(error => error.includes('silently removes')))
assert.equal(validateRequiresAction('replace', [], ['new-atom']).length, 1)
assert.equal(validateRequiresAction('replace', ['old-atom'], []).length, 1)

for (const malformed of [undefined, 'm', 42, { id: 'm' }]) {
  const candidate = { ...proposedDecision, prerequisiteGoalIds: malformed } as unknown as RequiresDecision
  const result = validateRequiresDecisions(inventory, { decisions: [candidate] }, proposalOptions)
  assert.equal(result.reviewed, 0)
  assert(result.errors.some(error => error.includes('malformed prerequisite')))
}
for (const malformed of ['not-an-array', { path: 'curricula/math.json' }]) {
  const candidate = { ...proposedDecision, sourceRefs: malformed } as unknown as RequiresDecision
  const result = validateRequiresDecisions(inventory, { decisions: [candidate] }, proposalOptions)
  assert.equal(result.reviewed, 0)
  assert(result.errors.some(error => error.includes('malformed sourceRefs')))
}
const inconsistentSet = { ...proposedDecision, prerequisiteGoalIds: [] }
const inconsistentReview = { ...proposalReview, decisions: [{ ...proposalReview.decisions[0],
  proposalBindingSha256: fingerprint(inconsistentSet.proposalBinding) }] }
const inconsistentResult = validateRequiresDecisions(inventory, { decisions: [inconsistentSet] }, {
  ...proposalOptions, independentReview: inconsistentReview,
})
assert.equal(inconsistentResult.reviewed, 0)
assert(inconsistentResult.errors.some(error => error.includes('complete foreign-subject set')))
const conflictInventory = { families: inventory.families.map(family => ({ ...family,
  goals: family.goals.map(goal => goal.goalId === 'm' ? { ...goal, definitionStatus: 'conflictingOccurrences' } : goal) })) }
const conflictResult = validateRequiresDecisions(conflictInventory, { decisions: [proposedDecision] }, proposalOptions)
assert.equal(conflictResult.reviewed, 0)
assert(conflictResult.errors.some(error => error.includes('conflicting prerequisite owner')))
const sameOwnerInventory = { families: inventory.families.map(family => ({ ...family,
  goals: family.goals.map(goal => goal.goalId === 'm' ? { ...goal, occurrences: [{ ...occurrence, key: 'physics:m' }] } : goal) })) }
assert(validateRequiresDecisions(sameOwnerInventory, { decisions: [proposedDecision] }, proposalOptions).errors
  .some(error => error.includes('foreign subject context')))
const changedInternal = { ...proposedDecision, decision: 'replace' as const, proposalBinding: {
  ...proposedDecision.proposalBinding, baselineRequires: ['p'], proposedRequires: ['m'],
  changesSha256: fingerprint({ dependentGoalId: 'p', baselineRequires: ['p'], proposedRequires: ['m'] }),
} }
assert(validateRequiresDecisions(inventory, { decisions: [changedInternal] }, proposalOptions).errors
  .some(error => error.includes('preserve internal edges')))
assert.equal(validateRequiresDecisions(inventory, { decisions: [decision] }, {
  ...options, independentReview: { ...independentReview, decisions: [{ ...independentReview.decisions[0], reviewer: ' AUTHOR ' }] },
}).reviewed, 0)
assert(validateRequiresDecisions(inventory, { decisions: [{ ...decision, evidenceKind: 'directSourceStatement',
  sourceRefs: [{ path: 'curricula/math.json', supports: 'prerequisite', recordId: true }] } as unknown as RequiresDecision] }).errors
  .some(error => error.includes('Direct-source')))
console.log('Cross-subject review tests passed (coverage, stale bindings, independent review, evidence roles, gaps, atomic references).')
