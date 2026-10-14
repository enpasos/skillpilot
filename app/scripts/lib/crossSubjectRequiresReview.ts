import { decisionStates, fingerprint, proposeCompleteForeignRequires, stableJson, type RequiresDecision } from './crossSubjectRequiresInventory'

interface Occurrence {
  key: string
  selected: boolean
  technicalRole: string
  semanticKind: string | null
  reviewInput: RequiresDecision['reviewInput']
  directRequires?: string[]
}
interface ReviewInventory {
  families: Array<{ familyId: string; goals: Array<{ goalId: string; reviewRequired: boolean; definitionStatus?: string; occurrences: Occurrence[] }> }>
}
export interface IndependentReview {
  authorLedgerSha256: string
  inventorySha256: string
  decisions: Array<{ decisionId: string; decision: 'approved' | 'rejected' | 'pending'; reviewer: string;
    rationale: string; reviewInput: RequiresDecision['reviewInput']; proposalBindingSha256?: string }>
}
interface Options {
  familyIds?: string[]
  requireComplete?: boolean
  independentReview?: IndependentReview
  authorLedgerSha256?: string
  inventorySha256?: string
  reviewedInventorySha256?: string
  sourcePathExists?: (path: string) => boolean
}

const recordValue = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const stringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string' && item.length > 0)
const reviewInputValue = (value: unknown): value is RequiresDecision['reviewInput'] =>
  recordValue(value) && ['semanticSha256', 'prerequisitesSha256', 'scopeSha256']
    .every(field => typeof value[field] === 'string')
const ownerOf = (key: string) => key.slice(0, key.lastIndexOf(':'))

export function validateRequiresAction(decision: RequiresDecision['decision'], before: string[], after: string[]): string[] {
  const added = after.filter(id => !before.includes(id))
  const removed = before.filter(id => !after.includes(id))
  if (decision === 'add' && removed.length) return ['Add decision silently removes prerequisites']
  if (decision === 'remove' && added.length) return ['Remove decision silently adds prerequisites']
  if (decision === 'retain' && (added.length || removed.length)) return ['Retain decision changes prerequisites']
  if (decision === 'replace' && (!added.length || !removed.length)) return ['Replace decision requires both an addition and a removal']
  return []
}

/** Technical evidence binding and coverage only. Rationale quality and source
 * support require a separate substantive review; passing this is no approval. */
export function validateRequiresDecisions(inventory: ReviewInventory,
  ledger: { decisions?: RequiresDecision[] }, options: Options = {}) {
  const errors: string[] = []
  const families = inventory.families.filter(family => !options.familyIds || options.familyIds.includes(family.familyId))
  for (const id of options.familyIds ?? []) if (!families.some(family => family.familyId === id)) errors.push(`Unknown family ${id}`)
  const required = new Map<string, { family: string; goalId: string; definitionStatus?: string; occurrences: Occurrence[] }>()
  const allGoalIds = new Set(inventory.families.flatMap(family => family.goals.map(goal => goal.goalId)))
  for (const family of families) for (const goal of family.goals) if (goal.reviewRequired) {
    required.set(`${family.familyId}:${goal.goalId}`, { family: family.familyId, goalId: goal.goalId,
      definitionStatus: goal.definitionStatus, occurrences: goal.occurrences })
  }
  const decisions = new Map<string, RequiresDecision>()
  const invalidDecisionKeys = new Set<string>()
  const decisionIds = new Set<string>()
  if (ledger.decisions !== undefined && !Array.isArray(ledger.decisions)) {
    errors.push('Author ledger decisions must be an array.')
    return { errors, required: required.size, reviewed: 0, open: required.size }
  }
  for (const decision of ledger.decisions ?? []) {
    if (!recordValue(decision)) { errors.push('Malformed author decision record.'); continue }
    if (options.familyIds && !options.familyIds.includes(decision.familyId)) continue
    const key = `${decision.familyId}:${decision.dependentGoalId}`
    const priorErrorCount = errors.length
    if (decisions.has(key)) errors.push(`Duplicate decision for ${key}`)
    if (typeof decision.decisionId !== 'string' || !decision.decisionId || decisionIds.has(decision.decisionId)) errors.push(`Missing/duplicate decisionId for ${key}`)
    decisionIds.add(decision.decisionId)
    decisions.set(key, decision)
    const goal = required.get(key)
    if (!goal) { errors.push(`Decision outside review universe: ${key}`); continue }
    if (goal.definitionStatus === 'conflictingOccurrences'
      && ['add', 'retain', 'remove', 'replace', 'no_cross_subject_required'].includes(decision.decision)) {
      errors.push(`Unresolved conflicting owner definitions for ${key}`)
    }
    if (!decisionStates.includes(decision.decision)) errors.push(`Unknown decision state for ${key}`)
    if (typeof decision.rationale !== 'string' || !decision.rationale.trim()) errors.push(`Missing individual rationale for ${key}`)
    if (typeof decision.author !== 'string' || !decision.author.trim()) errors.push(`Missing author for ${key}`)
    if (!stringArray(decision.prerequisiteGoalIds)) {
      errors.push(`Missing or malformed prerequisite IDs for ${key}`)
      invalidDecisionKeys.add(key)
      continue
    }
    if (new Set(decision.prerequisiteGoalIds).size !== decision.prerequisiteGoalIds.length) {
      errors.push(`Duplicate prerequisite IDs for ${key}`)
    }
    if (!Array.isArray(decision.sourceRefs) || decision.sourceRefs.some(ref => !recordValue(ref)
      || typeof ref.path !== 'string' || typeof ref.supports !== 'string')) {
      errors.push(`Missing or malformed sourceRefs for ${key}`)
      invalidDecisionKeys.add(key)
      continue
    }
    const current = goal.occurrences.filter(occurrence => occurrence.selected)
    const proposal = decision.proposalBinding
    if (proposal && (!recordValue(proposal) || !reviewInputValue(proposal.baseline)
      || !reviewInputValue(proposal.proposed) || !stringArray(proposal.baselineRequires)
      || !stringArray(proposal.proposedRequires) || !Array.isArray(proposal.prerequisiteInputs)
      || proposal.prerequisiteInputs.some(input => !recordValue(input) || typeof input.goalId !== 'string'
        || typeof input.semanticSha256 !== 'string' || typeof input.scopeSha256 !== 'string'))) {
      errors.push(`Malformed proposal binding for ${key}`)
      invalidDecisionKeys.add(key)
      continue
    }
    const matchesBaseline = current.some(occurrence => stableJson(occurrence.reviewInput) === stableJson(decision.reviewInput))
    const matchesProposed = proposal && current.some(occurrence => stableJson(occurrence.reviewInput) === stableJson(proposal.proposed)
      && stableJson(occurrence.directRequires) === stableJson(proposal.proposedRequires))
    if (!matchesBaseline && !matchesProposed) {
      errors.push(`Stale or missing semantic/prerequisite/scope input binding for ${key}`)
    }
    if (proposal) {
      if (stableJson(proposal.baseline) !== stableJson(decision.reviewInput)) errors.push(`Proposal baseline binding differs for ${key}`)
      if (proposal.changesSha256 !== fingerprint({ dependentGoalId: decision.dependentGoalId,
        baselineRequires: proposal.baselineRequires, proposedRequires: proposal.proposedRequires })) errors.push(`Proposal change hash mismatch for ${key}`)
      if (matchesBaseline && !current.some(occurrence => stableJson(occurrence.directRequires) === stableJson(proposal.baselineRequires))) errors.push(`Proposal baseline requires mismatch for ${key}`)
      for (const issue of validateRequiresAction(decision.decision, proposal.baselineRequires, proposal.proposedRequires)) errors.push(`${issue} for ${key}`)
      const dependentOwner = current[0] && ownerOf(current[0].key)
      const foreignGoalIds = new Set(inventory.families.flatMap(family => family.goals)
        .filter(goal => !goal.occurrences.some(occurrence => ownerOf(occurrence.key) === dependentOwner)
          && goal.occurrences.some(occurrence => occurrence.selected && ownerOf(occurrence.key) !== dependentOwner))
        .map(goal => goal.goalId))
      if (decision.prerequisiteGoalIds.some(id => !foreignGoalIds.has(id))) {
        errors.push(`Proposed prerequisite is not in an unambiguous foreign subject context for ${key}`)
      }
      const expectedRequires = proposeCompleteForeignRequires(proposal.baselineRequires,
        decision.prerequisiteGoalIds, foreignGoalIds)
      if (stableJson(proposal.proposedRequires) !== stableJson(expectedRequires)) {
        errors.push(`Proposed requires does not match the complete foreign-subject set or preserve internal edges for ${key}`)
      }
      for (const input of proposal.prerequisiteInputs ?? []) {
        const target = inventory.families.flatMap(family => family.goals).find(goal => goal.goalId === input.goalId)
        if (!target?.occurrences.some(occurrence => occurrence.reviewInput.semanticSha256 === input.semanticSha256
          && occurrence.reviewInput.scopeSha256 === input.scopeSha256)) errors.push(`Stale proposed prerequisite semantics/scope ${input.goalId} for ${key}`)
      }
      if (decision.prerequisiteGoalIds.some(id => !proposal.prerequisiteInputs?.some(input => input.goalId === id))) errors.push(`Unbound proposed prerequisite semantics for ${key}`)
      if (proposal.prerequisiteInputs.some(input => !decision.prerequisiteGoalIds.includes(input.goalId))
        || new Set(proposal.prerequisiteInputs.map(input => input.goalId)).size !== proposal.prerequisiteInputs.length) {
        errors.push(`Extra or duplicate proposed prerequisite input bindings for ${key}`)
      }
    }
    if (!Array.isArray(decision.prerequisiteGoalIds)) errors.push(`Missing prerequisite IDs for ${key}`)
    else for (const id of decision.prerequisiteGoalIds) {
      if (!allGoalIds.has(id)) errors.push(`Unknown prerequisite ${id} for ${key}`)
      else if (inventory.families.some(family => family.goals.some(goal => goal.goalId === id
        && goal.definitionStatus === 'conflictingOccurrences'))) {
        errors.push(`Unresolved conflicting prerequisite owner definitions ${id} for ${key}`)
      }
      else if (!inventory.families.some(family => family.goals.some(goal => goal.goalId === id
        && goal.occurrences.some(occurrence => occurrence.technicalRole === 'leaf'
          && (occurrence.semanticKind === null || occurrence.semanticKind === 'curricularAtomic'))))) {
        errors.push(`Non-curricular-atomic prerequisite ${id} for ${key}`)
      }
    }
    if (decision.decision === 'no_cross_subject_required' && decision.prerequisiteGoalIds?.length) {
      errors.push(`No-cross-subject decision still declares prerequisites for ${key}`)
    }
    if (!['didacticSequencing', 'directSourceStatement'].includes(decision.evidenceKind)) errors.push(`Missing evidence distinction for ${key}`)
    if (decision.evidenceKind === 'directSourceStatement'
      && !decision.sourceRefs.some(ref => ref.supports === 'prerequisite'
        && ((typeof ref.recordId === 'string' && ref.recordId.trim())
          || (typeof ref.locator === 'string' && ref.locator.trim())))) {
      errors.push(`Direct-source prerequisite statement lacks anchored reference for ${key}`)
    }
    if (!Array.isArray(decision.sourceRefs)) errors.push(`Missing sourceRefs for ${key}`)
    else if (decision.decision !== 'pending' && !decision.sourceRefs.length) errors.push(`Unanchored decision for ${key}`)
    for (const ref of decision.sourceRefs ?? []) {
      if (!ref.path || (options.sourcePathExists && !options.sourcePathExists(ref.path))) errors.push(`Missing source artifact ${ref.path} for ${key}`)
      if (!['goalSemantics', 'scope', 'prerequisite'].includes(ref.supports)) errors.push(`Missing source evidence role for ${key}`)
    }
    if (!decision.applicability || !['allDependentScopes', 'boundedScopes', 'unresolved'].includes(decision.applicability.universality)
      || !Array.isArray(decision.applicability.scopes) || !Array.isArray(decision.applicability.alternatives)) errors.push(`Missing universality/alternatives analysis for ${key}`)
    else if (decision.applicability.universality === 'boundedScopes' && !decision.applicability.scopes.length) errors.push(`Bounded scope lacks explicit scope for ${key}`)
    if (errors.length > priorErrorCount) invalidDecisionKeys.add(key)
  }
  const review = options.independentReview
  const reviewedInventorySha256 = options.reviewedInventorySha256 ?? options.inventorySha256
  if (review && (review.authorLedgerSha256 !== options.authorLedgerSha256 || review.inventorySha256 !== reviewedInventorySha256)) {
    errors.push('Independent review input artifact hash mismatch.')
  }
  const reviews = new Map<string, IndependentReview['decisions'][number]>()
  const invalidReviewIds = new Set<string>()
  if (review && !Array.isArray(review.decisions)) errors.push('Independent review decisions must be an array.')
  for (const record of Array.isArray(review?.decisions) ? review.decisions : []) {
    if (!recordValue(record) || typeof record.decisionId !== 'string' || typeof record.reviewer !== 'string'
      || typeof record.rationale !== 'string') { errors.push('Malformed independent review record.'); continue }
    if (reviews.has(record.decisionId)) {
      errors.push(`Duplicate independent review ${record.decisionId}`)
      invalidReviewIds.add(record.decisionId)
    }
    reviews.set(record.decisionId, record)
  }
  let reviewed = 0
  for (const [key] of required) {
    const decision = decisions.get(key)
    const record = decision && reviews.get(decision.decisionId)
    const resolved = decision && ['add', 'retain', 'remove', 'replace', 'no_cross_subject_required'].includes(decision.decision)
      && decision.applicability?.universality !== 'unresolved'
    const approved = resolved && !invalidDecisionKeys.has(key) && !invalidReviewIds.has(decision.decisionId)
      && record?.decision === 'approved' && record.reviewer?.trim()
      && record.reviewer.trim().toLowerCase() !== decision.author.trim().toLowerCase() && record.rationale?.trim()
      && stableJson(record.reviewInput) === stableJson(decision.reviewInput)
      && (!decision.proposalBinding || record.proposalBindingSha256 === fingerprint(decision.proposalBinding))
      && review?.authorLedgerSha256 === options.authorLedgerSha256 && review?.inventorySha256 === reviewedInventorySha256
    if (approved) reviewed++
    else if (options.requireComplete) errors.push(`Open or unreviewed decision ${key}`)
  }
  return { errors, required: required.size, reviewed, open: required.size - reviewed }
}
