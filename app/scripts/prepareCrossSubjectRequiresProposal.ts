import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { assertFreshRequiresInventory, buildRequiresInventory, bytesFingerprint, fingerprint, readActiveLandscapes,
  proposeCompleteForeignRequires, type InventoryConfig, type InventoryGoal, type RequiresDecision } from './lib/crossSubjectRequiresInventory'
import { buildCrossLandscapeGraph, findCrossLandscapeCycles } from './lib/crossLandscapeGraph'
import { validateRequiresAction, validateRequiresDecisions } from './lib/crossSubjectRequiresReview'

const repoRoot = resolve(process.cwd(), '..')
const args = process.argv.slice(2)
const option = (name: string) => args[args.indexOf(name) + 1]
if (!args.includes('--ledger') || !args.includes('--output')) throw new Error('Required: --ledger <candidate> --output <bound-candidate>')
const output = resolve(repoRoot, option('--output'))
if (existsSync(output)) throw new Error(`Refusing to overwrite sealed proposal ${output}. Use a new versioned output path.`)
const ledgerPath = resolve(repoRoot, option('--ledger'))
const config = JSON.parse(readFileSync(resolve(repoRoot,
  'curricula/quality/cross-subject-requires/math-physics.config.json'), 'utf8')) as InventoryConfig
const sourceBytes = readFileSync(ledgerPath)
const source = JSON.parse(sourceBytes.toString('utf8'))
const decisions = (Array.isArray(source) ? source : source.decisions) as RequiresDecision[]
if (!Array.isArray(decisions) || decisions.some(decision => !decision || typeof decision !== 'object')) {
  throw new Error('Author candidate must contain a decisions array of records.')
}
if (decisions.some(decision => decision.proposalBinding)) throw new Error('Refusing to overwrite an existing proposal binding; prepare from the original unreviewed author candidate.')
const baseline = buildRequiresInventory(repoRoot, config)
const baselineInventorySha256 = assertFreshRequiresInventory(baseline,
  resolve(repoRoot, 'curricula/quality/cross-subject-requires/math-physics.inventory.json'))
const landscapes = readActiveLandscapes(repoRoot, config)
const overrides = new Map<string, InventoryGoal>()
const occurrenceFor = (inventory: typeof baseline, familyId: string, goalId: string) => {
  const goal = inventory.families.find(family => family.familyId === familyId)?.goals.find(goal => goal.goalId === goalId)
  if (!goal || goal.definitionStatus !== 'consistent') throw new Error(`Missing/conflicting goal ${familyId}:${goalId}`)
  const occurrences = goal.occurrences.filter(occurrence => occurrence.selected)
  if (occurrences.length !== 1) throw new Error(`An explicit authoring context is required for ${familyId}:${goalId}`)
  return occurrences[0]
}
for (const decision of decisions) {
  if (!Array.isArray(decision.prerequisiteGoalIds)
      || decision.prerequisiteGoalIds.some(id => typeof id !== 'string' || !id)) {
    throw new Error(`${decision.decisionId}: prerequisiteGoalIds must be an array of stable goal IDs.`)
  }
  if (decision.familyId !== 'canonical-gymnasium') throw new Error('Current proposal preparation is scoped to canonical Gymnasium; other families require their ownership/scope review first.')
  const dependent = occurrenceFor(baseline, decision.familyId, decision.dependentGoalId)
  const landscape = landscapes.find(landscape => landscape.file === dependent.path)!
  const original = landscape.goals.find(goal => goal.id === decision.dependentGoalId)!
  const otherSubjectIds = new Set(baseline.families.find(family => family.familyId === decision.familyId)!.goals
    .filter(goal => goal.occurrences.some(occurrence => occurrence.selected && occurrence.landscapeId !== dependent.landscapeId))
    .map(goal => goal.goalId))
  for (const prerequisiteId of decision.prerequisiteGoalIds) {
    if (!otherSubjectIds.has(prerequisiteId)) throw new Error(`${decision.decisionId}: prerequisite ${prerequisiteId} is not in the foreign subject.`)
  }
  const canPropose = ['add', 'retain', 'remove', 'replace', 'no_cross_subject_required', 'review_required'].includes(decision.decision)
  const proposedRequires = canPropose ? proposeCompleteForeignRequires(original.requires ?? [],
    decision.prerequisiteGoalIds, otherSubjectIds) : original.requires ?? []
  const actionIssues = validateRequiresAction(decision.decision, original.requires ?? [], proposedRequires)
  if (actionIssues.length) throw new Error(`${decision.decisionId}: ${actionIssues.join('; ')}`)
  overrides.set(`${dependent.path}:${decision.dependentGoalId}`, { ...original,
    requires: proposedRequires })
}
const proposed = buildRequiresInventory(repoRoot, config, overrides)
for (const decision of decisions) {
  const before = occurrenceFor(baseline, decision.familyId, decision.dependentGoalId)
  const after = occurrenceFor(proposed, decision.familyId, decision.dependentGoalId)
  decision.reviewInput = before.reviewInput
  decision.proposalBinding = { baseline: before.reviewInput, proposed: after.reviewInput,
    baselineRequires: before.directRequires, proposedRequires: after.directRequires,
    changesSha256: fingerprint({ dependentGoalId: decision.dependentGoalId,
      baselineRequires: before.directRequires, proposedRequires: after.directRequires }),
    prerequisiteInputs: decision.prerequisiteGoalIds.map(goalId => {
      const prerequisite = occurrenceFor(proposed, decision.familyId, goalId)
      if (prerequisite.technicalRole !== 'leaf' || prerequisite.semanticKind !== 'curricularAtomic') throw new Error(`Non-curricular-atomic prerequisite ${goalId}`)
      return { goalId, semanticSha256: prerequisite.reviewInput.semanticSha256, scopeSha256: prerequisite.reviewInput.scopeSha256 }
    }) }
}
// Review selection excludes retired authoring snapshots, but global reference
// closure matches validateGraph: live overview nodes may still contain retained
// compatibility definitions. These do not become reviewed subject nominees.
const graphLandscapes = readActiveLandscapes(repoRoot, { ...config, excludedDirectories: ['quality'] })
const proposedLandscapes = graphLandscapes.map(landscape => ({ ...landscape,
  goals: landscape.goals.map(goal => overrides.get(`${landscape.file}:${goal.id}`) ?? goal) }))
const candidateGraph = buildCrossLandscapeGraph(proposedLandscapes)
const invalidReferences = candidateGraph.diagnostics.filter(issue => issue.code === 'missing_reference' || issue.code === 'ambiguous_reference')
if (invalidReferences.length) throw new Error(`Proposed graph has unresolved references: ${invalidReferences.map(issue => issue.message).join('; ')}`)
const validation = validateRequiresDecisions(baseline, { decisions }, {
  sourcePathExists: path => existsSync(resolve(repoRoot, path)),
})
if (validation.errors.length) throw new Error(`Invalid author proposal: ${validation.errors.join('; ')}`)
const cycles = findCrossLandscapeCycles(candidateGraph)
if (cycles.length) throw new Error(`Proposed graph has global cycles: ${cycles.map(issue => issue.message).join('; ')}`)
const packet = { schemaVersion: 1, status: 'author_candidate_pending_independent_review',
  bindingMethod: 'exact-baseline-and-proposed-inputs-no-substantive-approval',
  sourceAuthorArtifact: option('--ledger'), sourceAuthorSha256: bytesFingerprint(sourceBytes),
  baselineInventorySha256,
  proposedStateSha256: fingerprint(decisions.map(decision => ({ decisionId: decision.decisionId,
    proposalBinding: decision.proposalBinding }))),
  proposedGraphCycles: cycles, decisions }
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(packet, null, 2)}\n`, { flag: 'wx' })
console.log(`Prepared ${decisions.length} unreviewed proposals with baseline/proposed bindings; ${cycles.length} proposed global cycles. Wrote ${output}`)
