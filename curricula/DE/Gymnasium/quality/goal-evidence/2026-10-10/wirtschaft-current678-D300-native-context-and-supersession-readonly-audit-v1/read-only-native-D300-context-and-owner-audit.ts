import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { buildGoalDescriptionCanonicalContext } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { stableGoalBookJson } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
import { buildResolutionSupersessionChains, hasIntactResolutionSupersessionChain } from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts'

const ROOT = '/home/enpasos/projects/skillpilot'
const OUT = path.dirname(fileURLToPath(import.meta.url))
const rel = (p: string) => path.relative(ROOT, p)
const digest = (b: Buffer | string) => `sha256:${crypto.createHash('sha256').update(b).digest('hex')}`
const read = (p: string) => JSON.parse(fs.readFileSync(path.resolve(ROOT, p), 'utf8'))
const binding = (p: string) => {
 const absolute = path.resolve(ROOT, p), b = fs.readFileSync(absolute)
 return { path: rel(absolute), sha256: digest(b), bytes: b.length }
}
const write = (name: string, data: unknown) => {
 const p = path.join(OUT, name)
 fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' })
 return binding(p)
}
const REG = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const REPORT = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-M6-floor-and-current-D-diagnostic-root-v1/actual-current678-full-Economics-DPAMV-report-with-all336-IDs187-complete149-open.json'
const PLAN = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current336-actual173-native-description-input-preparation-technical-v1/actual173-native-batch-configs-and336-freeze.preparation-plan.json'
const rootA = '/tmp/economics-current678-D149-readonly-final-handoff-a.json'
const rootAMatrix = '/tmp/economics-current678-D-readonly-inventory-a.actual.json'
const s = read(REG).subjects.find((x: any) => x.subject === 'wirtschaftswissenschaften')
const report = read(REPORT).subjects[0]
const beforeCANBytes = fs.readFileSync(path.resolve(ROOT, s.landscapePath))
if (digest(beforeCANBytes) !== 'sha256:237c9bfd2730d916e5e1a453eeb0822113a8a48d2391f8e721c6e693edc6f452') throw Error('The original237c diagnostic binding changed')
if (binding(REPORT).sha256 !== 'sha256:febb23012064f295c6954f349465882049a31a5d9be44dc135d32798b61cea46') throw Error('Full report changed')
const goals = new Map(read(s.landscapePath).goals.map((g: any) => [g.id, g])) as Map<string, any>
const edges = s.resolutionSupersessions
const supersededByIndex = new Map<string, Set<string>>()
for (const e of edges) {
 if (!supersededByIndex.has(e.supersededIndexPath)) supersededByIndex.set(e.supersededIndexPath, new Set())
 supersededByIndex.get(e.supersededIndexPath)!.add(e.goalId)
}
const inputEndguards = new Map<string, any>()
const remember = (p: string) => {
 const b = binding(p)
 inputEndguards.set(b.path, b)
 return b
}
[REG, REPORT, PLAN, s.landscapePath,
 'app/scripts/validateGoalDescriptionReviewCampaign.ts', 'app/scripts/validateGoalDescriptionDualRoundResolution.ts',
 'app/scripts/reportDeepUnderstandingRollout.ts', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts',
 'app/scripts/goalBookModel.ts'].forEach(remember)
const indexes = new Map<string, any>()
const owners = new Map<string, any>()
const allHistoricalRows: any[] = []
const fieldCounts: Record<string, number> = {}
const compare = (a: any, b: any, p = ''): any[] => {
 if (stableGoalBookJson(a) === stableGoalBookJson(b)) return []
 if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap(k => compare(a[k], b[k], p + '/' + k))
 }
 return [{ field: p, wholeBeforeValue: a, wholeCurrentValue: b }]
}
let resolutionDigestErrors = 0, dualDigestErrors = 0
for (const ip of s.resolutionIndexPaths) {
 const indexBinding = remember(ip), index = read(ip)
 const contexts = new Map<string, any>(), groupInputs: any[] = []
 for (const group of index.groups) {
  const gd = path.resolve(ROOT, path.dirname(ip), group.artifactDirectory)
  const inpath = path.join(gd, 'round-a/description-review-input.json')
  const inputBinding = remember(inpath), input = read(inpath)
  groupInputs.push({ groupId: group.groupId, firstInputBinding: inputBinding, schemaVersion: input.schemaVersion, bookDigest: input.bookDigest })
  for (const row of input.goals) contexts.set(row.goalId, row)
  const dp = path.resolve(ROOT, path.dirname(ip), group.dualSummaryPath), db = remember(dp)
  if (db.sha256 !== group.dualSummaryDigest) dualDigestErrors++
 }
 const skipped = supersededByIndex.get(ip) ?? new Set<string>()
 const directChangedGoalIds: string[] = []
 for (const entry of index.resolutions) {
  const rp = path.resolve(ROOT, path.dirname(ip), entry.resolutionPath), rb = remember(rp)
  if (rb.sha256 !== entry.resolutionDigest) resolutionDigestErrors++
  allHistoricalRows.push({ indexPath: ip, wholeOriginalIndexEntry: entry, wholeResolutionFileBinding: rb, originalHistoricalClaimPresent: true, currentClaimSuppressedByExistingSupersession: skipped.has(entry.goalId) })
  if (skipped.has(entry.goalId)) continue
  if (owners.has(entry.goalId)) throw Error('Duplicate current owner: ' + entry.goalId)
  const inputRow = contexts.get(entry.goalId)
  if (!inputRow) throw Error('Missing original current input row: ' + entry.goalId)
  const currentContext = buildGoalDescriptionCanonicalContext(goals.get(entry.goalId))
  const differences = compare(inputRow.canonicalContext, currentContext)
  if (differences.length) directChangedGoalIds.push(entry.goalId)
  for (const d of differences) fieldCounts[d.field] = (fieldCounts[d.field] ?? 0) + 1
  owners.set(entry.goalId, { goalId: entry.goalId, terminalOwnerIndexPath: ip, originalResolutionFileBinding: rb, wholeOriginalIndexEntry: entry, wholeOriginalCanonicalContext: inputRow.canonicalContext, wholeCurrentCanonicalContext: currentContext, actualContextDeltas: differences, originalGoalFingerprint: inputRow.goalFingerprint, originalPageFingerprint: inputRow.pageFingerprint, originalReviewContextFingerprint: inputRow.reviewContextFingerprint ?? null, nativeConstructedCurrentContextExact: differences.length === 0 })
 }
 const scope = `${s.subject}:${index.artifactSetId || ip}: `
 const boundNativeIndexIssues = report.issues.filter((x: string) => x.startsWith(scope))
 indexes.set(ip, { indexBinding, artifactSetId: index.artifactSetId, groupInputs, directChangedGoalIds, currentClaimedGoalIds: index.resolutions.map((r: any) => r.goalId).filter((id: string) => !skipped.has(id)), historicalClaimedGoalIds: index.resolutions.map((r: any) => r.goalId), boundNativeIndexIssues })
}
if (resolutionDigestErrors || dualDigestErrors || allHistoricalRows.length !== 335 || owners.size !== 300) throw Error('Historical binding mismatch')
const chains = buildResolutionSupersessionChains(edges, s.resolutionIndexPaths, new Set(report.currentGoalIds))
if (chains.issues.length || chains.chains.length !== 31) throw Error('Nonlinear/invalid original chains')
const issueGoalIds = (phrase: string) => report.issues.filter((x: string) => x.includes(phrase)).map((x: string) => x.match(/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/)![0])
const contextIds = new Set(issueGoalIds('Current V3 context'))
const fingerprintIds = new Set(issueGoalIds('Current V3 goalFingerprint'))
const independentlyChanged = [...owners.values()].filter(x => !x.nativeConstructedCurrentContextExact).map(x => x.goalId)
if (stableGoalBookJson([...contextIds].sort()) !== stableGoalBookJson(independentlyChanged.sort())) throw Error('Native context comparison differs from whole diagnostic')
const validationViews = [...indexes.entries()].map(([ip, d]) => ({ path: ip, historicalClaimedGoalIds: new Set(d.historicalClaimedGoalIds), claimedGoalIds: new Set(d.currentClaimedGoalIds), ready: new Set(d.currentClaimedGoalIds.filter((id: string) => !contextIds.has(id) && !fingerprintIds.has(id))), issues: d.boundNativeIndexIssues }))
const chainRows = chains.chains.map(chain => {
 const owner = owners.get(chain.goalId)
 const terminalPath = chain.indexPaths.at(-1)
 if (owner.terminalOwnerIndexPath !== terminalPath) throw Error('Terminal owner mismatch')
 return {
  goalId: chain.goalId, wholeLinearIndexPaths: chain.indexPaths,
  nativeExistingChainIntegrity: hasIntactResolutionSupersessionChain(chain, validationViews),
  ownTerminalContextExact: owner.nativeConstructedCurrentContextExact,
  ownTerminalActualDeltas: owner.actualContextDeltas,
  wholeTerminalOwner: owner,
  wholeMemberIndexes: chain.indexPaths.map(ip => ({ path: ip, ...indexes.get(ip) })),
  causalClassification: owner.nativeConstructedCurrentContextExact ? 'Own terminal context exact; native chain fails on issues of other current members in a whole registered index' : 'Own terminal context actually changed, plus whole-index issue dependency',
 }
})
if (chainRows.some(x => x.nativeExistingChainIntegrity)) throw Error('Whole diagnostic expected all31 old-chain failures')
const exactCascade = chainRows.filter(x => x.ownTerminalContextExact)
if (exactCascade.length !== 27) throw Error('Unexpected cascade count')
const open = report.currentGoalIds.filter((id: string) => !report.strictCompleteGoalIds.includes(id))
const noOwner = report.currentGoalIds.filter((id: string) => !owners.has(id))
if (open.length !== 149 || noOwner.length !== 36) throw Error('Current scope mismatch')
const plan = read(PLAN), selected = new Set(plan.nativeOrderGoalIds173)
const matrix = write('actual-300-terminal-owners-whole-native-contexts86-deltas-and335-historical-claims.READONLY.json', {
 authority: 'Read-only evidence and native pure-function context comparison, not review decisions, validation of new resolutions, or science approval',
 currentCAN: remember(s.landscapePath), originalFullNativeReport: remember(REPORT),
 whole335HistoricalResolutionRows: allHistoricalRows, whole300TerminalOwners: [...owners.values()],
 whole27IndexBindingsAndOriginalCurrentIssues: [...indexes.entries()].map(([ip, d]) => ({ indexPath: ip, ...d })),
 actualContextDifferentGoalIds86: independentlyChanged.sort(), currentContextDifferenceFieldCounts: fieldCounts,
 actual6GoalFingerprintDifferentGoalIds: [...fingerprintIds],
 whole35ExistingSupersessionEdges: edges, whole31NativeLinearChainsAndIndividualFailureCauses: chainRows,
 noRegisteredHistoricalTerminalOwnerGoalIds36: noOwner,
 exactCurrent187StrictGoalIdsRetained: report.strictCompleteGoalIds,
 current149OpenGoalIds: open,
 openInside173: open.filter((id: string) => selected.has(id)), openOutside173: open.filter((id: string) => !selected.has(id)),
 notCurrentOwnerPageApproval: 'Fresh post15Fields production book not yet supplied; original page contexts are historical provenance and require targeted latest-page comparison.'
})
const recommendation = write('actual-native-supersession-skip-contract-and-qualified-targeted-successor-recommendation.READONLY.json', {
 authority: 'Technical recommendation; future qualification remains required, no new review records or current replacement acceptance',
 sourceMethods: { chainShape: 'reportDeepUnderstandingRollout.ts:1285', chainIndexIssues: 'reportDeepUnderstandingRollout.ts:1346', exactWholeHistoricalDigestThenSkipCurrent: 'reportDeepUnderstandingRollout.ts:1185', currentV3Context: 'validateGoalDescriptionDualRoundResolution.ts:676', originalReadyAuditOnly: 'reportDeepUnderstandingRollout.ts:1442' },
 causalCounts: { fullReportIssues: 123, contextIssues86: 86, fingerprintIssues6AlsoUnderContext86: 6, umbrellaChainIssues31: 31, changedIndividualTerminalOwners86: 86, ownTerminalExactCascadeOwners27: 27, union113IssueOwners: 113, unownedCurrentGoals36: 36, historicalResolution335DigestErrors: 0, historicalDualSummary27DigestErrors: 0 },
 minimalExistingValidatorRepair: [
  'Keep all27 original indices, all335 original resolution files, all27 dualsummary files and the35 original supersession edges registered byte-exact.',
  'After fresh post15Field book/current canonical comparison, qualify only genuinely changed current input/text/page/evidence/source/image contexts through two independent nonauthor rounds and individual synthesis. Preserve exact valid prior evidence and do not equate pagination or a changed global book digest with changed goal science.',
  'Append each actually qualified new resolution index; for a changed existing owner, append one edge from that goal\'s current terminalOwnerIndexPath to its new replacement. Do not fork or supersede an older nonterminal owner. New source goals without a historical owner get one current claim and no invented historical edge.',
  'loadDescriptionReadyGoals constructs supersededByIndex by outgoing edge. validateResolutionIndex verifies the historical resolution digest and entry, then skips current-canonical binding validation only for that exact supersededGoal in that index. Other entries continue current validation. A legitimate replacement of all86 actual stale contexts therefore removes their old current-binding errors while retaining original claim-byte verification.',
  'For the27 exact-terminal cascade cases, all relevant old index issues must vanish; then the existing hasIntactResolutionSupersessionChain can pass using their unchanged actual own-terminal records. No27 new scientific rounds are required merely by that index cascade. If a new consolidated113-owner package is operationally chosen, those27 require a separately justified exact-evidence technical owner adapter and linear supersession, not invented new independent reviews.',
  'Fresh native resolution/batch/deep-understanding checks remain the acceptance proof. This audit does not manufacture any future ready state, override unresolved REVISE/BLOCK, modify validation, or claim that all149 need new science.'
 ],
 unresolvedLaterFinding: { goalPrefix: '04809186', earlierCurrentDReportedValid: true, laterA04REVISE: 'Must be reconciled explicitly; later in-flight record is not silently registered or dismissed.' },
 futureCommandsFromRepoRoot: [
  'npm --prefix app run quality:goal-description-rollout-batch -- prepare --config <new-reviewed-scope-batch.config.json>',
  'npm --prefix app run quality:goal-description-rollout-batch -- check --config <new-reviewed-scope-batch.config.json>',
  'npm --prefix app run quality:goal-description-rollout-batch -- summarize --config <new-reviewed-scope-batch.config.json> --write',
  'npm --prefix app run quality:goal-description-rollout-manifest -- --config <new-reviewed-scope-batch.config.json> --authoring <individual-synthesis-authoring.json> --write',
  'npm --prefix app run quality:goal-description-rollout-batch -- finalize --config <new-reviewed-scope-batch.config.json> --write',
  'npm --prefix app run quality:deep-understanding-rollout -- --config=<Economics-only-registry-slice> --format=json',
  'npm --prefix app run quality:deep-understanding-rollout -- --config=<Economics-only-registry-slice> --mode=check'
 ],
 commandsAreFuturePlanOnly: true, commandsExecutedByThisAudit: 'Native pure-context constructors and chain predicates only; no prepare/review/synthesis/finalize/validator or book build.'
})
if (fs.existsSync(rootA)) remember(rootA)
if (fs.existsSync(rootAMatrix)) remember(rootAMatrix)
for (const b of inputEndguards.values()) if (binding(b.path).sha256 !== b.sha256) throw Error('Input changed mid-read: ' + b.path)
const endguards = write('actual-whole-historical-current-input-endguards.READONLY.json', { endguards: [...inputEndguards.values()], allReadBytesExact: true, activeWrites: 0, reviewRecordsCreated: 0 })
const handoff = write('actual-final-D300-native86-context31-chain27-cascade-readonly.handoff.json', {
 documentType: 'current678-D300-native-context-and-supersession-readonly-audit',
 originalCurrentBinding: remember(s.landscapePath), originalFullNativeReport: remember(REPORT),
 wholeMatrix: matrix, nativeContractRecommendation: recommendation, wholeEndguards: endguards,
 counts: { historicalIndices: 27, historicalResolutionRows: 335, distinctTerminalOwners: 300, currentDValid: 187, currentDOpen: 149, actualDirectContextDeltas: 86, actualGoalFPDeltas: 6, chainUmbrellaFailures: 31, ownChangedChainTerminals: 4, ownExactChainTerminalsIndexCascade: 27, missingCurrentHistoricalOwner: 36 },
 originalHistoricalReviewAuthorityStatusesUnaffected: true, sourceCodeUnmodified: true,
 noCurrentOwnerPageAcceptanceClaimed: true, noScienceOrReviewRecords: true, noActiveWrites: true,
 post15FieldsRebindRequired: 'This actual diagnostic is237c; phase9/context plus c6Requires follow-up belongs to the already isolated15Fields candidate and must be current-recomputed by Root/A after qualified integration, not silently folded into this original history.',
 at: new Date().toISOString(), strictNetGain: 0,
})
console.log(JSON.stringify({ handoff, matrix, recommendation, endguards, nativePureAudit: 'PASS', activeWrites: 0, reviewRecords: 0 }))
