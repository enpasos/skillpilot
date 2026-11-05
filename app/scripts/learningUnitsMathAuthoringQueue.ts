import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { atomicRelation, canonicalJson, digest, mathCanonicalPath, reachable, type MathGoal } from './learningUnitsMathAuthoring'
import { compactScalarArrays } from './learningUnits/compactJson'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const baselineRef = '0ce5a8d791eeb9783a919195fd8590bfb79f3595'
const oldRef = '802f333f80c58d3409ab5d9fb3e9913fecafbf54'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const show = (ref: string, path: string) => JSON.parse(execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${ref}:${path}`],
  { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }))

function main() {
  const original = show(baselineRef, mathCanonicalPath) as { goals: MathGoal[] }
  const source = read(mathCanonicalPath) as { goals: MathGoal[]; goalPlacements: Array<{ goalId: string; unitId: string; acquisition?: boolean }> }
  const old = show(oldRef, mathCanonicalPath) as { goals: MathGoal[] }
  const originalIds = new Set(original.goals.map(goal => goal.id))
  const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
  const ledger = read(ledgerPath)
  const kinds = new Map<string, string>(ledger.decisions.map((entry: { goalId: string; semanticKind: string }) => [entry.goalId, entry.semanticKind]))
  const originalOrdinary = original.goals.filter(goal => kinds.get(goal.id) === 'curricularAtomic')
  const originalAtoms = original.goals.filter(goal => !goal.contains?.length)
  assert.equal(originalOrdinary.length, 807)
  assert.equal(originalAtoms.length, 978)
  const inventoryPath = 'docs/dev/learning-units-mathematics-offering-inventory.json'
  const inventory = read(inventoryPath)
  assert.equal(inventory.scopes.length, 182)
  const nativeMembership = new Map<string, number[]>(inventory.targetAtomicMembership.map((entry: { goalId: string; scopeIndices: number[] }) => [entry.goalId, entry.scopeIndices]))
  const parents = new Map<string, string[]>()
  for (const goal of original.goals) for (const child of goal.contains ?? []) parents.set(child, [...(parents.get(child) ?? []), goal.id])
  const assessments = original.goals.filter(goal => goal.examData)
  const relation = atomicRelation(original.goals)
  const assessmentReach = new Map(assessments.map(goal => [goal.id, reachable(goal.requires ?? [], relation)]))
  const manifest = read('curricula/DE/Gymnasium/learning-units/catalog.json')
  const definitions = manifest.contracts.map((entry: { path: string }) => read(`curricula/${entry.path}`))
  const claimed = new Set(assessments.flatMap(goal => (goal.examData!.coveredGoalIds as string[] | undefined) ?? []))
  const kind = (id: string) => kinds.get(id)
  const packets = original.goals.filter(goal => kind(goal.id) === 'curricularArea' && (goal.contains ?? []).some(id => originalOrdinary.some(atom => atom.id === id)))
  const packetIds = new Set(packets.map(goal => goal.id))
  let missingNativeConsumerCount = 0
  const goals = originalOrdinary.map(goal => {
    const consumers = assessments.filter(q => assessmentReach.get(q.id)?.has(goal.id)).map(q => q.id).sort()
    const claimQs = assessments.filter(q => (q.examData!.coveredGoalIds as string[] | undefined)?.includes(goal.id))
    const targetIndices = nativeMembership.get(goal.id) ?? []
    const missingConsumerScopes = targetIndices.filter(index => !consumers.some(q => nativeMembership.get(q)?.includes(index)))
    if (missingConsumerScopes.length) missingNativeConsumerCount++
    const contracts = definitions.filter((definition: { ownGoalIds: string[] }) => definition.ownGoalIds.includes(goal.id))
    const acquisitions = source.goalPlacements.filter(placement => placement.goalId === goal.id && placement.acquisition)
    return { goalId: goal.id, title: goal.title,
      status: contracts.length ? 'bound-ai-reviewed-contract-awaiting-integrated-native-acceptance' : 'pending-own-unit-and-normal-pass-review',
      candidatePacketIds: (parents.get(goal.id) ?? []).filter(id => packetIds.has(id)),
      allDirectCanonicalParentIds: parents.get(goal.id) ?? [],
      ownerDecisionRequired: (parents.get(goal.id)?.length ?? 0) > 1,
      authoredAcquisitionUnitIds: acquisitions.map(placement => placement.unitId),
      boundContractRefs: contracts.map((definition: { contractId: string; revision: string; reviewRef: string }) => ({
        contractId: definition.contractId, revision: definition.revision, reviewRef: definition.reviewRef,
      })),
      nativeTargetScopeIndices: targetIndices,
      scopeIndicesWithoutOfferedAssessmentConsumer: missingConsumerScopes,
      candidateAssessmentIdsWithRequiresRoute: consumers,
      explicitClaimCandidates: claimQs.map(q => ({ assessmentGoalId: q.id,
        taskRevision: digest(canonicalJson({ taskContent: q.examData!.taskContent, solutionContent: q.examData!.solutionContent })),
        rubricRevision: digest(canonicalJson(q.examData!.scoring)),
        hasTranslatedVariant: Boolean(q.examData!.taskContentEn || q.examData!.solutionContentEn),
        reviewStatus: 'candidate-metadata-only; normal passing release patterns not yet independently reviewed for this unit',
      })),
      contentDecision: !claimQs.length ? 'Match an actual task or author a justified assessment; requires reachability alone is insufficient.'
        : 'Review exact own-local D(a), normal pass patterns and recall before admitting the unit; preserve legitimate task tolerances.',
    }
  })
  const recallPackets = original.goals.filter(goal => kind(goal.id) === 'memory').map(goal => {
    const file = String(goal.extendedData?.vocabularySource).split('/').at(-1)!
    const path = `curricula/DE/Gymnasium/memory-decks/${file}`
    const deck = read(path)
    const cards = deck.cards ?? deck.entries ?? []
    return { goalId: goal.id, title: goal.title, sourcePath: path, sourceSha256: digest(readFileSync(resolve(root, path))),
      cardIds: cards.map((card: { id: string }) => card.id), cardCount: cards.length,
      status: 'pending-reviewed-acquisition-and-card-duty-binding',
      decision: 'Keep explicit existing recall and stable card identities. No broad deck reassignment or split without its own review.' }
  })
  const newCandidateQs = old.goals.filter(goal => !originalIds.has(goal.id))
  const extractedCandidates = old.goals.filter(goal => originalIds.has(goal.id) && goal.nodeKind === 'exam'
    && original.goals.find(original => original.id === goal.id)?.nodeKind !== 'exam')
  const materialCandidates = [...newCandidateQs.map(goal => ({ goal, identityDecision: 'unpublished new Q identity may be reused after normal-pass review' })),
    ...extractedCandidates.map(goal => ({ goal, identityDecision: 'preserve this original ordinary A identity; extract stronger task into a new assessment identity' }))]
    .map(({ goal, identityDecision }) => ({ sourceGoalId: goal.id, title: goal.title, identityDecision,
      sourceArtifactPath: goal.examData?.sourceArtifactPath ?? null,
      taskRevision: digest(canonicalJson({ taskContent: goal.examData?.taskContent, solutionContent: goal.examData?.solutionContent })),
      rubricRevision: digest(canonicalJson(goal.examData?.scoring)), status: 'pending-bounded-task-rubric-review-and-own-placement' }))
  const newSourceGoals = source.goals.filter(goal => !originalIds.has(goal.id))
  const artifact = {
    schemaVersion: 1, semantics: 'finite-authoring-queue-not-recognition-approval', baselineRef, oldMaterialRef: oldRef,
    sourceBindings: { initialOfferingInventorySha256: digest(readFileSync(resolve(root, inventoryPath))),
      originalCanonicalContentSha256: digest(canonicalJson(original)), semanticKindLedgerSha256: digest(readFileSync(resolve(root, ledgerPath))) },
    summary: { originalAtomicTargets: 978, originalCurricularAtoms: 807, offeredScopes: 182,
      substantiveCandidatePackets: packets.length, multipleDirectParentDecisions: goals.filter(goal => goal.ownerDecisionRequired).length,
      existingAssessments: assessments.length, missingExplicitClaimAtoms: originalOrdinary.filter(goal => !claimed.has(goal.id)).length,
      atomsMissingOfferedAssessmentConsumerSomewhere: missingNativeConsumerCount,
      existingRecallGoals: recallPackets.length, existingCards: recallPackets.reduce((sum, packet) => sum + packet.cardCount, 0),
      boundOrdinaryCandidateAtoms: goals.filter(goal => goal.boundContractRefs.length).length,
      newAssessmentDelta: newSourceGoals.filter(goal => goal.examData || goal.nodeKind === 'exam').map(goal => goal.id),
      removedOriginalGoalIds: [...originalIds].filter(id => !source.goals.some(goal => goal.id === id)),
    },
    scopeIds: inventory.scopes.map((scope: { scopeId: string }) => scope.scopeId),
    originalAtomicGoalIds: originalAtoms.map(goal => goal.id).sort(),
    nextBoundedPackets: [
      { name: 'projection', contractId: 'math-dot-product-projection', status: 'bound-candidate; integration acceptance tracked separately' },
      { name: 'prisms', ordinaryGoalIds: ['68fb0e78-34f2-5572-8db6-e7f5ebcff70f', 'f1348d40-3872-5e44-8892-3600c811796f'],
        candidateAssessmentId: 'e5494c67-aed6-5710-8ae3-51ae147c10e9', status: 'independent-strategy-positive; actual-source-placement-and-contract-review-next' },
      { name: 'monotonicity', ordinaryGoalIds: ['2850e8f6-2330-50d3-a577-d519540d9924'], candidateAssessmentId: '010c133c-dcf1-5530-8305-61bc638017bc',
        status: 'independent-strategy-positive; actual-source-placement-and-contract-review-next' },
    ],
    packets: packets.map(goal => ({ candidatePacketId: goal.id, title: goal.title,
      ordinaryGoalIds: (goal.contains ?? []).filter(id => originalOrdinary.some(goal => goal.id === id)),
      status: 'pending-promise-own-q-k-and-required-child-review; not automatically a learning unit' })),
    ordinaryGoals: goals, recallPackets, pr79MaterialCandidates: materialCandidates,
    completionRule: 'S4 remains open until every applicable acquisition path covers all original 978 targets, all 807 ordinary IDs have one authoritative direct owner and reviewed own Q, Q/K remain explicit, new Q deltas are accounted for, and required native/QA/release acceptance passes.',
  }
  assert.equal(goals.length, 807); assert.equal(new Set(goals.map(goal => goal.goalId)).size, 807)
  assert.equal(artifact.summary.substantiveCandidatePackets, 210)
  assert.equal(artifact.summary.multipleDirectParentDecisions, 74)
  assert.equal(artifact.summary.missingExplicitClaimAtoms, 282)
  assert.equal(artifact.summary.atomsMissingOfferedAssessmentConsumerSomewhere, 498)
  assert.equal(materialCandidates.length, 74)
  assert.deepEqual(artifact.summary.removedOriginalGoalIds, [])
  const destination = resolve(root, 'curricula/DE/Gymnasium/learning-units/authoring/mathematics-queue.json')
  const bytes = `${compactScalarArrays(artifact)}\n`
  if (process.argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), bytes, 'Finite authoring queue drift')
  else { mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, bytes) }
  console.log(JSON.stringify(artifact.summary))
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
