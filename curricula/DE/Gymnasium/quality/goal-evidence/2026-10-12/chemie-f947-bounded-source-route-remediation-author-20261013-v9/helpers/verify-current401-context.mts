// Apache-2.0. Final normal model/context check; reuses completed source/compiler phases.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const R = process.cwd(), E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const F = `${E}/chemie-f947-bounded-source-route-remediation-author-20261013-v9`, O = `${E}/chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1`
const G = 'f947cd04-952a-5a9d-9445-3ffc70e02c3c', canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const read = (p: string): any => JSON.parse(readFileSync(resolve(R, p), 'utf8'))
const bytes = (p: string) => readFileSync(resolve(R, p))
const sha = (b: Buffer | string) => `sha256:${createHash('sha256').update(b).digest('hex')}`
const write = (p: string, value: any) => { mkdirSync(dirname(resolve(R, p)), { recursive: true }); writeFileSync(resolve(R, p), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' }) }
const [modelApi, evidenceApi, contextApi, normalizationApi] = await Promise.all(['app/scripts/goalBookModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/validateGoalDescriptionReviewCampaign.ts', 'app/src/utils/authoring/canonicalAuthoring.ts'].map(p => import(pathToFileURL(resolve(R, p)).href)))
const plan = read(`${F}/SOURCE_ROUTE_PLAN.only-f947-components-author-pending.json`)
assert.equal(sha(bytes(canonicalPath)), plan.currentCanonical.sha256)
const oldCan = read(canonicalPath), finalCan = read(`${F}/candidate/canonical523-current402.boundary-and-derived-eight-scopes.author.json`)
const config = read(`${O}/configs/whole402.normal-base.config.json`)
const oldLedger = read(config.semanticKindLedgerPath), ledger = structuredClone(oldLedger)
const candidateLandscapePath = `${F}/candidate/canonical523-current402.boundary-and-derived-eight-scopes.author.json`
const candidateLedgerPath = `${F}/candidate/semantic523.normalized-book-same-decisions.author-input-path.json`
ledger.sourceLandscapePath = candidateLandscapePath
const candidateConfig = { ...config, landscapePath: candidateLandscapePath, semanticKindLedgerPath: candidateLedgerPath }
const normalizedFuture = JSON.parse(JSON.stringify(normalizationApi.normalizeCanonicalLandscape(structuredClone(finalCan))))
for (const decision of ledger.decisions) decision.sourceFingerprint = modelApi.fingerprintSemanticKindSourceGoal(normalizedFuture.goals.find((g: any) => g.id === decision.goalId))
write(candidateLedgerPath, ledger)
const qa = read(config.goalVisualizationQaPath), digests: Record<string, string> = {}
for (const q of qa.records) if (q.visualizationState === 'available') { const actual = sha(bytes(q.publicAssetPath)); assert.equal(actual, q.assetSha256); digests[q.imageUrl] = actual }
const evidenceSources = config.evidenceReviewPaths.map((path: string) => ({ path, text: bytes(path).toString() }))
const build = (landscape: any, semantic: any, selectedConfig: any) => modelApi.buildGoalBookModel({ landscape: structuredClone(landscape), compositionView: read(config.compositionViewPath), semanticKindLedger: semantic, goalVisualizationQa: qa, goalVisualizationAssetDigests: digests, evidenceReviewSources: evidenceSources, config: selectedConfig })
const oldBook = build(oldCan, oldLedger, config), newBook = build(finalCan, ledger, candidateConfig)
modelApi.parseAndValidateGoalBookModel(oldBook); modelApi.parseAndValidateGoalBookModel(newBook)
assert.equal(newBook.pages.length, 402)
const changedPages = newBook.pages.filter((p: any) => modelApi.stableGoalBookJson(p) !== modelApi.stableGoalBookJson(oldBook.pages.find((o: any) => o.goalId === p.goalId))).map((p: any) => p.goalId)
assert.ok(changedPages.every((id: string) => id === G))
const changedWholeGoals = finalCan.goals.filter((g: any) => modelApi.stableGoalBookJson(g) !== modelApi.stableGoalBookJson(oldCan.goals.find((o: any) => o.id === g.id))).map((g: any) => g.id)
assert.deepEqual(changedWholeGoals, [G])
const finalGoal = finalCan.goals.find((g: any) => g.id === G), oldGoal = oldCan.goals.find((g: any) => g.id === G)
assert.equal(evidenceApi.fingerprintGoalForEvidence(finalGoal, 'goal-evidence-v1', 'curricularAtomic'), evidenceApi.fingerprintGoalForEvidence(oldGoal, 'goal-evidence-v1', 'curricularAtomic'))
const changedContexts = finalCan.goals.filter((g: any) => modelApi.stableGoalBookJson(contextApi.buildGoalDescriptionCanonicalContext(g)) !== modelApi.stableGoalBookJson(contextApi.buildGoalDescriptionCanonicalContext(oldCan.goals.find((o: any) => o.id === g.id)))).map((g: any) => g.id)
assert.deepEqual(changedContexts, [G])
const protectedTuple = read(`${O}/checks/protected231-full-current-tuple-and-registry-bindings.actual.json`)
for (const b of protectedTuple.currentActiveADPRegistryInputBindings) assert.equal(sha(bytes(b.path)), b.sha256)
for (const { goalId } of protectedTuple.protectedCurrentTuples) assert.equal(modelApi.stableGoalBookJson(newBook.pages.find((g: any) => g.goalId === goalId)), modelApi.stableGoalBookJson(oldBook.pages.find((g: any) => g.goalId === goalId)))
const changedSemanticInputs = ledger.decisions.filter((d: any) => d.sourceFingerprint !== oldLedger.decisions.find((o: any) => o.goalId === d.goalId).sourceFingerprint).map((d: any) => d.goalId)
assert.ok(changedSemanticInputs.every((id: string) => id === G))
write(`${F}/checks/current401-protected231-and-one-D-context-impact.actual.json`, { schemaVersion: 1, normalModuleBindings: ['app/scripts/goalBookModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/validateGoalDescriptionReviewCampaign.ts'].map(path => ({ path, sha256: sha(bytes(path)) })), currentCanonicalBase: plan.currentCanonical, changedWholeCanonicalGoalIds: changedWholeGoals, unchangedOther522WholeCanonicalGoals: true, unchangedOther401CurricularAtomicGoals: true, changedNormalFull402Pages: changedPages, changedCanonicalDContexts: changedContexts, unchangedProtected231WholePages: true, verifiedProtectedActiveRegistryInputBindings: protectedTuple.currentActiveADPRegistryInputBindings.length, existingPGoalFingerprintUnchanged: true, changedSemanticKindSourceFingerprintGoalIds: changedSemanticInputs, allSemanticClassificationsRetainedExactly: true, sourceMetadataTechnicalBindingIsNotScientificReview: true, heldF947NeedsFreshFinalSourceAndCanonicalContextJudgment: true, authorCandidatePStatusRemainsUnaccepted: true, activeWrites: false, newStrictCompletions: 0, humanApproval: false })
write(`${F}/models/whole402.sameP231.source-metadata-author-inactive.json`, newBook)
assert.equal(sha(bytes(canonicalPath)), plan.currentCanonical.sha256)
for (const p of plan.authorProposedSourceChanges) assert.equal(sha(bytes(p.originalLiveBinding.path)), p.originalLiveBinding.sha256)
console.log(JSON.stringify({ normalModel402: true, current401WholePagesExact: true, protected231Exact: true, changedCanonicalDContextOnly: G, actualChangedPrintedPages: changedPages, noAcceptedProofRebound: true, newScientificVotes: 0, activeWrites: false }))
