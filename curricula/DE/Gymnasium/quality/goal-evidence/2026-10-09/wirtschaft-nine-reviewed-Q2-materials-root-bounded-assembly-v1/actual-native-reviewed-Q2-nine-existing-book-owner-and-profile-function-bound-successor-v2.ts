import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { parseAndValidateGoalBookModel, stableGoalBookJson, fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'
import { evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, routeProfiles } from './actual-current-production-unmodified-route-profile-export-for-E40.ts'
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts'

const [root, iso, originalIso] = process.argv.slice(2)
const rel = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-nine-reviewed-Q2-materials-root-bounded-assembly-v1'
const prior = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-nine-reviewed-E40-materials-root-integration-candidate-v1/one-existing5317-schema-and-reviewed-description-bounded-successor-v2'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const bind = (p: string) => ({ path: p.slice(root.length + 1), sha256: hash(p) })
const sourceExport = 'app/scripts/actual-current-production-unmodified-route-profile-export-for-E40.ts'
if (hash(join(iso, sourceExport)) !== hash(join(originalIso, sourceExport))) throw Error('Original actual current-production selectors/source export changed')
const can = read(join(root, rel, 'whole-CAN425-reviewed-E9-plus-reviewed-Q2-nine-and-one-navigation-candidate.inert.json'))
const sem = read(join(root, rel, 'semantic425.nine-actual-independent-practice-decisions-and-one-nav-input.inert.json'))
for (const g of can.goals) {
  const r = sem.decisions.find((r: any) => r.goalId === g.id)
  if (!r || r.sourceFingerprint !== fingerprintSemanticKindSourceGoal(g)) throw Error('Current whole semantic input stale ' + g.id)
}
const config = read(join(root, rel, 'book-config.current311-reviewed-Q2-nine.frozen-P311624.inert.json'))
const book = parseAndValidateGoalBookModel(read(join(root, config.outputPath)))
const original = read(join(root, prior, 'whole-current311-after-nine-reviewed-E40-materials.native-book-model.json'))
const byId = new Map(book.pages.map(p => [p.goalId, p]))
const owners = original.pages.map((p: any) => ({ goalId: p.goalId, wholeExact: stableGoalBookJson(p) === stableGoalBookJson(byId.get(p.goalId)), actualChangedFields: Object.keys(p).filter(k => stableGoalBookJson(p[k]) !== stableGoalBookJson((byId.get(p.goalId) as any)[k])) }))
const d46 = read(join(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/final-thirteen-released-current311-P311-native-preparation-v10/whole-current311-after-final403-with-all-P311.book-model.json'))
const oldOwners = d46.pages.map((p: any) => ({ goalId: p.goalId, wholeExact: stableGoalBookJson(p) === stableGoalBookJson(byId.get(p.goalId)) }))
const records = config.evidenceReviewPaths.flatMap((p: string) => readFileSync(join(root, p), 'utf8').trim().split('\n').map(s => JSON.parse(s)))
const cases = records.reduce((n: number, r: any) => n + r.profile.applicationCaseBriefs.length, 0)
if (records.length !== 311 || cases !== 624 || book.pages.length !== 311 || records.some((r: any) => r.status !== 'needs_human_review' || r.reviewAuthority !== 'ai_candidate' || r.evidenceLevel !== 'E1' || r.maximumClaimScope !== 'G1')) throw Error('Ordinary goal/evidence truthfulness universe changed')
const profile = routeProfiles.find((p: any) => p.profileId === 'canonical-economics-crossstage')!
const nativePrior = read(join(root, prior, 'actual-native-CAN416-nine-reviewed-E40-ordinary311-P311624-owner-and-production-route.result.json'))
// JSON metadata omits the two actual function selectors. Compare exactly that
// serializable metadata AND retain the entire actual executable source bytes,
// rather than falsely comparing function-valued objects with parsed JSON.
const serializable = JSON.parse(JSON.stringify(profile))
if (stableGoalBookJson(serializable) !== stableGoalBookJson(nativePrior.originalUnmodifiedProductionProfile)) throw Error('Current actual production metadata differs')
const functions = Object.keys(profile).filter(k => typeof (profile as any)[k] === 'function').map(k => ({ key: k, source: String((profile as any)[k]), sourceSha256: createHash('sha256').update(String((profile as any)[k])).digest('hex') }))
const graph = evaluateGraphIntegrity(can, new Set(can.goals.map((g: any) => g.id)))
const type = evaluateTypeConsistency(can)
const route = evaluateRouteProfile(can, profile, buildApplicabilityCompilation())
const assembly = read(join(root, rel, 'actual-final-nine-reviewed-Q2-materials-and-independent-kind-with-bounded-navigation-author-candidate.receipt.json'))
for (const b of assembly.frozenInputs) if (hash(join(root, b.path)) !== b.sha256) throw Error('Immutable input drift')
const navPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-existing5982-Q2-eleven-material-navigation-independent-bounded-review-v1/actual-final-independent-whole-5982-DEEN-eleven-material-navigation-KEEP.receipt.json'
const nav = read(join(root, navPath))
if (nav.decision !== 'KEEP' || nav.authorFrozenHandoff.sha256 !== hash(join(root, rel, 'actual-final-nine-reviewed-Q2-materials-and-independent-kind-with-bounded-navigation-author-candidate.receipt.json'))) throw Error('Exact foreign whole navigation KEEP missing')
const result = {
  independentNavigationReceipt: bind(join(root, navPath)), actualSemanticLedger: bind(join(root, rel, 'semantic425.nine-actual-independent-practice-decisions-and-one-nav-input.inert.json')),
  actualCurrentNativeBook: bind(join(root, config.outputPath)), wholeNativeBookFromSuccessfulFirstLoadReusedExactly: true, repeatedBookBuildPerformed: false,
  retainedNegativeFirstAttemptTerminal: bind(join(root, rel, 'actual-native-reviewed-Q2-nine.terminal.json')),
  correctedTechnicalFinding: 'The actual profile contains goalSelector/clusterSelector functions omitted by JSON. Serializable metadata and whole executable source equality are now both separately guarded. No production profile or selector was changed.',
  actualProductionMetadata: serializable, actualPreservedExecutableSelectorFunctions: functions, exactOriginalExecutableProfileSourceSha256: hash(join(iso, sourceExport)),
  all425ActualCurrentSemanticInputFingerprintsMatch: true, ordinaryPages: book.pages.length, positiveProfiles: records.length, retainedWholeCases: cases, positiveStatus: 'E1/G1 ai_candidate needs_human_review',
  actualOwnerRowsAgainstE9: owners, changedOwnerCountAgainstE9: owners.filter((r: any) => !r.wholeExact).length, originalD46OwnerRows: oldOwners, changedOwnerCountAgainstOriginalD46: oldOwners.filter((r: any) => !r.wholeExact).length,
  graph, type, actualCurrentProductionRules: route, actualMachineReviewedNewQ2Materials: 9,
  ownerPagesDualIndependentDGatePassed: false, source125WholeCourseOrTargetRoleApproved: false, humanApproval: false, strictNetGain: 0, liveWrites: false,
}
const out = join(root, rel, 'actual-native-CAN425-reviewed-Q2-nine-ordinary311-P311624-owner-current-production.function-bound-successor-v2.result.json')
writeFileSync(out, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ result: bind(out), ordinaryPages: book.pages.length, positiveProfiles: records.length, wholeCases: cases, changedOwnersAgainstE9: result.changedOwnerCountAgainstE9, changedOwnersSinceD46: result.changedOwnerCountAgainstOriginalD46, graph: graph.status, type: type.status, actualUnchangedProductionRules: route.rules.map((r: any) => ({ id: r.id, status: r.status, metrics: r.metrics })), strictNetGain: 0 }, null, 2))
