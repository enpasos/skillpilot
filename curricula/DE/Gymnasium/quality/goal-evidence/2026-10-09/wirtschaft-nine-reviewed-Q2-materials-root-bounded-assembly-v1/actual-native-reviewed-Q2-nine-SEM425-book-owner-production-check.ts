import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
// Execution copies this script alongside these exact repository-native inputs
// in a temporary capsule outside curricula; no production source is patched.
import { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs, writeGoalBookModel, stableGoalBookJson } from './goalBookModel.ts'
import { evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, routeProfiles } from './actual-current-production-unmodified-route-profile-export-for-E40.ts'
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts'

const [root, iso, navigationReceiptPath] = process.argv.slice(2)
if (!root || !iso || !navigationReceiptPath) throw Error('Need repository, isolated input root and actual independent navigation receipt')
const rel = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-nine-reviewed-Q2-materials-root-bounded-assembly-v1'
const previous = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-nine-reviewed-E40-materials-root-integration-candidate-v1/one-existing5317-schema-and-reviewed-description-bounded-successor-v2'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const write = (name: string, data: any) => {
  const path = join(root, rel, name)
  if (existsSync(path)) throw Error('Preserve immutable output: ' + path)
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
  read(path)
  return { path: rel + '/' + name, sha256: hash(path) }
}

async function main() {
  const assembly = read(join(root, rel, 'actual-final-nine-reviewed-Q2-materials-and-independent-kind-with-bounded-navigation-author-candidate.receipt.json'))
  for (const b of assembly.frozenInputs) if (hash(join(root, b.path)) !== b.sha256) throw Error('Frozen review input changed ' + b.path)
  // This actual foreign receipt is a required review input, never the author's
  // assembly or a synthetic replacement for independent description review.
  const navReview = read(join(root, navigationReceiptPath))
  if (navReview.decision !== 'KEEP' || navReview.author !== '/root' || navReview.reviewer === '/root' || navReview.reviewedWholeNavigationGoalId !== '5982abda-0b0e-51a5-930f-1f58bd757f30' || navReview.authorFrozenHandoff.sha256 !== hash(join(root, rel, 'actual-final-nine-reviewed-Q2-materials-and-independent-kind-with-bounded-navigation-author-candidate.receipt.json'))) throw Error('Actual independent exact navigation KEEP absent')
  const can = read(join(root, rel, 'whole-CAN425-reviewed-E9-plus-reviewed-Q2-nine-and-one-navigation-candidate.inert.json'))
  const material = read(join(root, rel, 'whole-nine-Q2-materials.actual-independent-reviewed-machine-release.candidate.json'))
  const kinds = read(join(root, rel, 'nine-individual-independent-whole-Q2-semantic-kind-practiceAssessment-decisions.json'))
  const sem = read(join(root, previous, 'semantic416.only-nine-actual-reviewed-material-input-bindings.inert.json'))
  const oldSem = structuredClone(sem)
  const nav = can.goals.find((g: any) => g.id === '5982abda-0b0e-51a5-930f-1f58bd757f30')
  const navDecision = sem.decisions.find((r: any) => r.goalId === nav.id)
  if (navDecision.semanticKind !== 'practiceAssessment' || navDecision.decisionStatus !== 'authoritative' || nav.requires.length !== 0 || nav.contains.length !== 11) throw Error('Existing whole navigation kind/prerequisite contract changed')
  const navOldFingerprint = navDecision.sourceFingerprint
  navDecision.sourceFingerprint = fingerprintSemanticKindSourceGoal(nav)
  for (const k of kinds) {
    const goal = material.find((g: any) => g.id === k.goalId)
    if (!goal || k.semanticKind !== 'practiceAssessment' || k.decisionStatus !== 'authoritative' || sem.decisions.some((r: any) => r.goalId === k.goalId)) throw Error('Wrong actual independent new practice decision')
    sem.decisions.push({ goalId: k.goalId, sourceFingerprint: fingerprintSemanticKindSourceGoal(goal), semanticKind: k.semanticKind, decisionStatus: k.decisionStatus, decisionBasis: k.decisionBasis })
  }
  sem.counts.practiceAssessment += 9
  sem.counts.total += 9
  if (sem.decisions.length !== 425 || sem.counts.curricularAtomic !== 311 || sem.counts.practiceAssessment !== 75 || sem.counts.total !== 425) throw Error('Current semantic universe mismatch')
  for (const r of oldSem.decisions) {
    const current = sem.decisions.find((n: any) => n.goalId === r.goalId)
    const old = structuredClone(r)
    if (r.goalId === nav.id) old.sourceFingerprint = current.sourceFingerprint
    if (stableGoalBookJson(old) !== stableGoalBookJson(current)) throw Error('Old semantic decision mutated')
  }
  const ledger = write('semantic425.nine-actual-independent-practice-decisions-and-one-nav-input.inert.json', sem)
  const config = read(join(root, previous, 'book-config.current311-nine-reviewed-E40-materials.frozen-P311624.inert.json'))
  config.semanticKindLedgerPath = ledger.path
  config.outputPath = rel + '/whole-current311-after-reviewed-Q2-nine.native-book-model.json'
  const configBinding = write('book-config.current311-reviewed-Q2-nine.frozen-P311624.inert.json', config)
  for (const b of [ledger, configBinding]) {
    const target = join(iso, b.path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, readFileSync(join(root, b.path)))
  }
  const model = (await loadGoalBookBuildInputs(configBinding.path, iso)).model
  if (model.pages.length !== 311) throw Error('Ordinary page universe changed')
  await writeGoalBookModel(model, join(root, config.outputPath))
  const oldModel = read(join(root, previous, 'whole-current311-after-nine-reviewed-E40-materials.native-book-model.json'))
  const pages = new Map(model.pages.map(p => [p.goalId, p]))
  const owners = oldModel.pages.map((p: any) => ({ goalId: p.goalId, wholeExact: stableGoalBookJson(p) === stableGoalBookJson(pages.get(p.goalId)), actualChangedFields: Object.keys(p).filter(k => stableGoalBookJson(p[k]) !== stableGoalBookJson((pages.get(p.goalId) as any)[k])) }))
  const d46 = read(join(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/final-thirteen-released-current311-P311-native-preparation-v10/whole-current311-after-final403-with-all-P311.book-model.json'))
  const d46Owners = d46.pages.map((p: any) => ({ goalId: p.goalId, wholeExact: stableGoalBookJson(p) === stableGoalBookJson(pages.get(p.goalId)) }))
  const records = config.evidenceReviewPaths.flatMap((p: string) => readFileSync(join(root, p), 'utf8').trim().split('\n').map(s => JSON.parse(s)))
  if (records.length !== 311 || records.some((r: any) => r.status !== 'needs_human_review' || r.reviewAuthority !== 'ai_candidate' || r.evidenceLevel !== 'E1' || r.maximumClaimScope !== 'G1')) throw Error('Positive universe or truthful status changed')
  const cases = records.reduce((n: number, r: any) => n + r.profile.applicationCaseBriefs.length, 0)
  if (cases !== 624) throw Error('Old whole cases changed')
  const profile = routeProfiles.find((p: any) => p.profileId === 'canonical-economics-crossstage')!
  const priorNative = read(join(root, previous, 'actual-native-CAN416-nine-reviewed-E40-ordinary311-P311624-owner-and-production-route.result.json'))
  if (stableGoalBookJson(profile) !== stableGoalBookJson(priorNative.originalUnmodifiedProductionProfile)) throw Error('Current production profile changed')
  const graph = evaluateGraphIntegrity(can, new Set(can.goals.map((g: any) => g.id)))
  const type = evaluateTypeConsistency(can)
  const route = evaluateRouteProfile(can, profile, buildApplicabilityCompilation())
  const result = write('actual-native-CAN425-reviewed-Q2-nine-ordinary311-P311624-owner-current-production.result.json', { independentNavigationReceipt: { path: navigationReceiptPath, sha256: hash(join(root, navigationReceiptPath)) }, navigationReview: navReview, semanticLedger: ledger, actualNewIndependentPracticeKinds: 9, existingNavigationKindExact: navDecision.semanticKind, actualNavigationOnlyInputBinding: { before: navOldFingerprint, after: navDecision.sourceFingerprint }, actualAllOther416PriorWholeSemanticDecisionsExactExceptNavInput: true, actualCurrentNativeBook: config.outputPath, actualNativeBookDigest: model.digest, actualOwnerRowsAgainstReviewedE9: owners, changedOwnerCountAgainstE9: owners.filter((r: any) => !r.wholeExact).length, originalD46OwnerRows: d46Owners, changedOwnerCountAgainstOriginalD46: d46Owners.filter((r: any) => !r.wholeExact).length, ordinaryPages: model.pages.length, positiveProfiles: records.length, retainedWholeCases: cases, status: 'E1/G1 ai_candidate needs_human_review', actualUnchangedProductionProfile: profile, graph, type, actualCurrentProductionRules: route, noSource125WholeCourseOwnerPageDualDOrHumanApproval: true, strictBefore: { closed: 300, total: 311 }, strictAfter: { closed: 300, total: 311 }, strictNetGain: 0, liveWrites: false })
  for (const b of assembly.frozenInputs) if (hash(join(root, b.path)) !== b.sha256) throw Error('Frozen review input changed after native run')
  console.log(JSON.stringify({ result, ordinaryPages: model.pages.length, positiveProfiles: records.length, wholeCases: cases, changedOwnersAgainstE9: owners.filter((r: any) => !r.wholeExact).length, changedOwnersSinceD46: d46Owners.filter((r: any) => !r.wholeExact).length, graph: graph.status, type: type.status, actualUnchangedProductionRules: route.rules.map((r: any) => ({ id: r.id, status: r.status, metrics: r.metrics })), strictNetGain: 0 }, null, 2))
}
main().catch(e => { console.error(e); process.exitCode = 1 })
