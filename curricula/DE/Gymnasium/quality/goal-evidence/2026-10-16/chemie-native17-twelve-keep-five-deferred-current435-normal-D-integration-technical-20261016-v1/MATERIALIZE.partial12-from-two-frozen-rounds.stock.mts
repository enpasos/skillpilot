import { readFile, writeFile, lstat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, join, relative, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

// Technical serializer only. Both independent scientific rounds are already
// frozen. Current revise findings are explicitly deferred, never rejected.
const host = resolve(process.argv[2] ?? '')
const ownerRoot = resolve(process.argv[3] ?? '')
if (!process.argv[2] || !process.argv[3]) throw new Error('Pass existing H and this new technical owner root')
const configPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-seventeen-pending-description-native-technical-20261016-v1/native-seventeen.complete-QS-v2.stock.config.json'
const loadStock = (file: string) => import(pathToFileURL(join(host, 'app/scripts', file)).href)
const rollout = await loadStock('materializeGoalDescriptionRolloutBatch.ts')
const res = await loadStock('validateGoalDescriptionDualRoundResolution.ts')
const man = await loadStock('validateGoalDescriptionRolloutSynthesisDecisionManifest.ts')
const syn = await loadStock('goalDescriptionRolloutResolutionSynthesis.ts')
const sha = (b: Buffer | string) => `sha256:${createHash('sha256').update(b).digest('hex')}`
const bytes = (v: unknown) => Buffer.from(`${JSON.stringify(v, null, 2)}\n`)
const safeNew = async (p: string, data: Buffer) => {
 let q = dirname(p)
 while (q !== host && q.startsWith(`${host}/`)) {
  if ((await lstat(q)).isSymbolicLink()) throw new Error(`Refuse symlink parent: ${q}`)
  q = dirname(q)
 }
 await writeFile(p, data, { flag: 'wx' })
}
const dual = await rollout.materializeGoalDescriptionRolloutBatchDualSummary(configPath, true)
const input = dual.first.input
const selected = dual.summary.goals.filter((g: any) => g.firstDecision === 'keep' && g.secondDecision === 'keep')
const deferred = dual.summary.goals.filter((g: any) => !(g.firstDecision === 'keep' && g.secondDecision === 'keep'))
if (selected.length !== 12 || deferred.length !== 5) throw new Error('Actual frozen rounds do not yield12keep/keep +5deferrals')
const extract = (artifacts: any, id: string, label: string) => {
 const out = res.extractGoalDescriptionDualRoundResolutionSource({ artifacts, goalId: id, label })
 if (out.errors.length || !out.source) throw new Error(JSON.stringify(out.errors))
 return out.source
}
const sources = new Map(input.goals.map((g: any) => [g.goalId, {
 first: extract(dual.first, g.goalId, 'first'), second: extract(dual.second, g.goalId, 'second'),
}]))
const firstSource: any = sources.get(input.goals[0].goalId)
const canonicalPath = join(host, dual.prepared.manifest.source.landscapePath)
const canonicalBytes = await readFile(canonicalPath)
const runTimes = [...dual.first.resultPairs, ...dual.second.resultPairs].map((p: any) => Date.parse(p.run.completedAt))
const synthesizedAt = new Date(Math.max(...runTimes) + 1000).toISOString()
const prepared = dual.prepared.manifest
const payload: any = {
 $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
 schemaVersion: 1, synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
 manifestId: 'chemie-native17-twelve-keep-five-deferred-current435-technical-selection-20261016-v1',
 authority: 'ai_synthesis',
 synthesizedBy: 'Technical combination of frozen independent rounds A and B; no third scientific reviewer',
 synthesizedAt,
 batch: {
  batchId: prepared.batchId,
  batchManifestDigest: sha(await readFile(join(dual.prepared.outputDirectory, 'batch-manifest.json'))),
  configDigest: prepared.configDigest, bundleFingerprint: prepared.artifacts.bundleFingerprint,
  bookDigest: input.bookDigest, reviewInputFingerprint: input.reviewInputFingerprint,
  dualSummaryDigest: sha(dual.bytes), canonicalLandscapeDigest: sha(canonicalBytes),
 },
 rounds: {
  first: man.buildGoalDescriptionRolloutSynthesisRoundBinding(firstSource.first.binding, prepared.artifacts.rounds.first.batchInputFingerprint),
  second: man.buildGoalDescriptionRolloutSynthesisRoundBinding(firstSource.second.binding, prepared.artifacts.rounds.second.batchInputFingerprint),
 },
 decisions: selected.map((summary: any) => {
  const current = input.goals.find((g: any) => g.goalId === summary.goalId)
  const pair: any = sources.get(summary.goalId)
  return {
   decisionId: `native17-partial12-${summary.goalId}`, goalId: summary.goalId,
   effectiveSemanticKind: 'curricularAtomic',
   goalFingerprint: current.goalFingerprint, pageFingerprint: current.pageFingerprint,
   goalReviewContextFingerprint: res.fingerprintGoalDescriptionReviewContext(current),
   finalText: { titleDe: current.currentTitleDe, titleEn: current.currentTitleEn, descriptionDe: current.currentDescriptionDe, descriptionEn: current.currentDescriptionEn },
   resolutionDecision: 'keep_current', evidenceRound: 'first',
   records: {
    first: { recordId: pair.first.binding.recordId, recordDigest: pair.first.binding.recordDigest },
    second: { recordId: pair.second.binding.recordId, recordDigest: pair.second.binding.recordDigest },
   },
   rationaleDe: `Beide unabhängig eingefrorenen aktuellen Runden behalten den ganzen Wortlaut von „${current.currentTitleDe}“ bei. Die technische Zusammenführung übernimmt die vollständige Verständnis-/Leistungs-/Transferfassung aus Runde A; Runde B bleibt mit ganzer Zeile und Befund gebunden. Unterschiedliche Formulierungen werden damit nicht als identische Stimmen oder neue dritte Fachprüfung ausgegeben. ${pair.first.record.rationale}`,
   rationaleEn: `Both independently frozen current rounds retain the whole wording of “${current.currentTitleEn}”. This technical combination selects the complete understanding, performance and transfer formulation from round A; the whole round-B record and reasoning remain bound. Different formulations are not portrayed as identical votes or a new third scientific review. No source/course completeness, actual learner experiment or human approval is added.`,
  }
 }),
 deferredGoals: deferred.map((g: any) => ({
  goalId: g.goalId, firstDecision: g.firstDecision, secondDecision: g.secondDecision,
  rationaleDe: `Mindestens eine aktuelle unabhängige Runde fordert eine lokale Revision (${g.firstDecision}/${g.secondDecision}). Die vorhandenen vollständigen Vorschläge bleiben offen und unverändert erhalten; keine Mehrheitsentscheidung, kein Zurückweisen eines Revisionsbefunds und kein D-Abschluss für dieses Ziel.`,
  rationaleEn: `At least one current independent round requests a local revision (${g.firstDecision}/${g.secondDecision}). The complete proposals remain open and unchanged; there is no majority ruling, rejection of a revision finding or D closure for this goal.`,
 })),
}
const manifest = { ...payload, manifestFingerprint: man.fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload) }
const structure = await man.validateGoalDescriptionRolloutSynthesisDecisionManifestStructure(manifest)
if (structure.errors.length) throw new Error(JSON.stringify(structure.errors))
const manifestName = 'synthesis-decision-manifest.partial12-deferred5.json'
const manifestBytes = bytes(manifest)
await safeNew(join(dual.prepared.outputDirectory, manifestName), manifestBytes)
for (const decision of manifest.decisions) {
 const pair: any = sources.get(decision.goalId)
 const summaryGoal = dual.summary.goals.find((g: any) => g.goalId === decision.goalId)
 const synthesis = syn.buildGoalDescriptionRolloutResolutionSynthesis({ batchId: prepared.batchId, manifest, decision, summaryGoal, firstSource: pair.first, secondSource: pair.second })
 const resolution = res.buildGoalDescriptionDualRoundResolution({
  resolutionId: `native17-d12-${decision.goalId}`, goalId: decision.goalId, effectiveSemanticKind: 'curricularAtomic',
  decision: 'keep_current', synthesis, dualSummaryBytes: dual.bytes, currentInput: input,
  firstSource: pair.first, secondSource: pair.second,
  synthesisDecisionManifest: { contract: 'goal-description-rollout-synthesis-decision-v1', manifestPath: manifestName, manifestId: manifest.manifestId, manifestDigest: sha(manifestBytes), manifestFingerprint: manifest.manifestFingerprint, decisionId: decision.decisionId },
 })
 await safeNew(join(dual.prepared.outputDirectory, 'resolutions', `${decision.goalId}.resolution.json`), bytes(resolution))
}
const final = await rollout.materializeGoalDescriptionRolloutBatchResolutionIndex(configPath, true)
if (final.index.resolutions.length !== 12 || final.index.deferredGoalIds.length !== 5) throw new Error('Unexpected final index partition')
const receipt = {
 role: 'Actual stock dual-summary/builders/scoped-resolution/finalize materialization of12independentkeep/keep;5explicitly deferred',
 host: 'Existing isolated H; no new host, no normal canonical/kinds/P/A/M/source/registry mutation',
 configPath, canonicalLandscapeSHA256: sha(canonicalBytes),
 currentNodeCount: JSON.parse(canonicalBytes.toString()).goals.length,
 finalizedIndex: relative(host, join(dual.prepared.outputDirectory, 'resolution-index.json')),
 outputIndexSHA256: sha(await readFile(join(dual.prepared.outputDirectory, 'resolution-index.json'))),
 resolvedGoalIds: final.index.resolutions.map((x: any) => x.goalId), deferredGoalIds: final.index.deferredGoalIds,
 recordCounts: { first: 17, second: 17 },
 newStrictDescriptionCompletions: 12, centralRun: false, M7Claim: false, HumanApproval: false,
 timingPolicy: 'synthesizedAt is the stock-required deterministic maximum completed-run timestamp plus1000ms, not an invented third model generation time.',
 preservedIndependentScience: true,
}
await writeFile(join(ownerRoot, 'MATERIALIZE.actual-stock-partial12-deferred5.receipt.json'), bytes(receipt), { flag: 'wx' })
console.log(JSON.stringify(receipt, null, 2))
