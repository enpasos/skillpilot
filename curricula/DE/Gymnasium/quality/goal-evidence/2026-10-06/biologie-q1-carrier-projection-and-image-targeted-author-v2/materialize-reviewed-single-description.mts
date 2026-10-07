// SPDX-License-Identifier: Apache-2.0
// Use native generic campaign/dual-round/resolution contracts without rerendering reviewed pages.
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import {
  loadGoalDescriptionReviewCampaignResultDirectories,
} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
import { validateGoalDescriptionReviewDualRound } from '../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound'
import {
  buildGoalDescriptionDualRoundResolution, extractGoalDescriptionDualRoundResolutionSource,
  validateGoalDescriptionDualRoundResolution, fingerprintGoalDescriptionReviewCampaign,
} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding, fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
} from '../../../../../../../app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest'
import { buildGoalDescriptionRolloutResolutionSynthesis } from '../../../../../../../app/scripts/goalDescriptionRolloutResolutionSynthesis'

const repo = resolve('.')
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own = base + 'biologie-q1-carrier-projection-and-image-targeted-author-v2'
const prepared = own
const output = own + '/native-d-one'
const sha = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const read = (path: string): any => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const bytes = (path: string) => readFileSync(resolve(repo, path))
const write = (path: string, value: unknown) => { mkdirSync(dirname(resolve(repo, path)), { recursive: true }); writeFileSync(resolve(repo, path), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' }) }
const pins = read(own + '/independent-current-single-page-freeze-pins.json')
const frozen: [string, string][] = pins.freezes.map((item: any) => [item.path, item.sha256.replace(/^sha256:/, '')])
for (const [path, digest] of frozen) {
  if (sha(bytes(path)) !== 'sha256:' + digest) throw new Error('Changed reviewed freeze ' + path)
  const freeze = read(path)
  for (const item of freeze.files ?? freeze.ownFiles ?? freeze.ownOutputs) {
    const target = item.path.startsWith('curricula/') ? item.path : dirname(path) + '/' + item.path
    if (sha(bytes(target)) !== 'sha256:' + item.sha256.replace(/^sha256:/, '')) throw new Error('Changed reviewed artifact ' + target)
  }
}
if (existsSync(resolve(repo, output))) throw new Error('Use a new continuation after materialization')
mkdirSync(resolve(repo, output))
const exactCopies: any[] = []
cpSync(resolve(repo, prepared, 'bundle'), resolve(repo, output, 'bundle'), { recursive: true })
const rounds: any = {}
for (const suffix of ['a', 'b']) {
  const round = 'round-' + suffix
  cpSync(resolve(repo, prepared, round), resolve(repo, output, round), { recursive: true })
  const resultSource = (suffix === 'a' ? base + 'biologie-q1-carrier-image-user-correction-independent-a-v1' : base + 'biologie-q1-carrier-image-and-projection-independent-b-v1') + '/results/'
  for (const extension of ['records.jsonl', 'run.json']) {
    const name = 'independent-' + suffix + '.batch-001.' + extension
    cpSync(resolve(repo, resultSource, name), resolve(repo, output, round, 'results', name))
    const source = resultSource + name
    const target = output + '/' + round + '/results/' + name
    if (!bytes(source).equals(bytes(target))) throw new Error('Reviewed result copy changed')
    exactCopies.push({ source, target, sha256: sha(bytes(target)) })
  }
  const campaign = read(output + '/' + round + '/description-review-campaign.json')
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({ campaign, batchesDirectory: resolve(repo, output, round, 'batches'), resultsDirectory: resolve(repo, output, round, 'results') })
  if (loaded.errors.length) throw new Error(loaded.errors.join('\n'))
  rounds[suffix] = { campaign, bundle: read(output + '/' + round + '/review-bundle-manifest.json'), input: read(output + '/' + round + '/description-review-input.json'), resultPairs: loaded.resultPairs }
}
const dual = await validateGoalDescriptionReviewDualRound({ first: rounds.a, second: rounds.b })
if (dual.errors.length) throw new Error(dual.errors.join('\n'))
write(output + '/dual-summary.json', dual.summary)
const dualBytes = bytes(output + '/dual-summary.json')
const input = rounds.a.input
const model = read(output + '/bundle/book-model.json')
const fullModel = read(prepared + '/current.full-390.book-model.json')
const ids = input.goals.map((g: any) => g.goalId)
const batchId = 'biologie-carrier-user-geometry-reviewed-20261006-v2'
const configPath = own + '/single.batch.config.json'
const config = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json', schemaVersion: 1,
  batchId, subject: 'biologie', subjectLabel: 'Biologie', bookId: model.book.id, title: model.book.title,
  baseGoalBookConfigPath: 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json', goalIds: ids, outputDirectory: output,
  feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback',
  promptPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
  criteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md', printDerivativeProfile: 'bounded-atlas',
}
write(configPath, config)
const roundBinding = (suffix: string) => {
  const c = rounds[suffix].campaign
  return { directory: 'round-' + suffix, campaignId: c.campaignId, campaignDigest: fingerprintGoalDescriptionReviewCampaign(c), roundId: c.roundId, independenceGroupId: c.independenceGroupId, batchId: c.batches[0].batchId, batchInputFingerprint: c.batches[0].batchInputFingerprint }
}
const batch = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json', schemaVersion: 1, validationContract: 'goal-description-rollout-batch-v1',
  batchId, subject: 'biologie', subjectLabel: 'Biologie', configPath, configDigest: sha(bytes(configPath)), goalIds: ids, curriculumAtomicDenominatorAtPreparation: 390,
  source: { baseGoalBookConfigPath: config.baseGoalBookConfigPath, landscapePath: model.source.landscapePath, landscapeId: model.book.landscapeId, baseBookDigest: fullModel.digest },
  artifacts: { bundleDirectory: 'bundle', bookModelPath: 'bundle/book-model.json', bookModelDigest: model.digest, bundleManifestPath: 'bundle/manifest.json', bundleFingerprint: input.bundleFingerprint, reviewInputFingerprint: input.reviewInputFingerprint, rounds: { first: roundBinding('a'), second: roundBinding('b') } },
  reviewPolicy: { oneBatchPerRound: true, blindIndependentFirstPass: true, aiRecordsAreCandidatesOnly: true, automaticAcceptance: false },
}
write(output + '/batch-manifest.json', batch)
const rationale: Record<string, [string, string]> = {
  ac9e824f: ['Zwei voneinander unabhängige gezielte Reviews haben die tatsächlich neu gerenderte Lernzielseite samt korrigierter DNA-Geometrie, Genmarkierung, Alttext und unveränderten vollständigen Materialien geprüft. Der gemeldete räumliche Fehler des Genabschnitts ist behoben: Zwei durchgehende Rückgrate behalten Kreuzungsfolge und Verwindung, die Genmarkierung liegt ausschließlich außerhalb dieser Geometrie. Die Zieltexte, Verständnisanforderungen und beide Materialfälle bleiben gültig. Direkte Quellen bleiben BE/BB; die sechs geprüften Landesansichten kodieren den Carrier in den zusätzlich benötigten vier Ländern ausdrücklich als prerequisiteOnly und erhalten sämtliche übrigen Targets. Die zweite Verständnisfassung wird mit aktueller Seiten-/Bild-/Kontextbindung gewählt. Dies stellt eine fachlich geprüfte Wiederherstellung bestehender Bindungen dar, keinen neuen fachlichen Abschluss und keine menschliche Freigabe.', 'Two independent targeted reviews inspected the actual newly rendered goal page, corrected DNA geometry, gene marking, alt text and unchanged complete materials. The reported spatial gene-section defect is corrected: two continuous backbones preserve the crossing sequence and twist, with the gene marking entirely outside that geometry. The goal texts, understanding demands and both material cases remain valid. Direct sources remain BE/BB; six reviewed country views explicitly assign the carrier prerequisiteOnly in the four additional consuming jurisdictions and preserve every other target. The second understanding formulation is selected with current page/image/context bindings. This is a substantively reviewed restoration of existing bindings, no new scientific completion or human approval.'],
}
const sources = ids.map((goalId: string) => {
  const a = extractGoalDescriptionDualRoundResolutionSource({ artifacts: rounds.a, goalId, label: 'First' })
  const b = extractGoalDescriptionDualRoundResolutionSource({ artifacts: rounds.b, goalId, label: 'Second' })
  if (a.errors.length || b.errors.length || !a.source || !b.source || a.source.decision !== 'keep' || b.source.decision !== 'keep') throw new Error('Unresolved review ' + goalId)
  const g = input.goals.find((g: any) => g.goalId === goalId)
  return { goalId, effectiveSemanticKind: 'curricularAtomic' as const, goalFingerprint: g.goalFingerprint, pageFingerprint: g.pageFingerprint, goalReviewContextFingerprint: a.source.binding.goalReviewContextFingerprint, finalText: { titleDe: g.currentTitleDe, titleEn: g.currentTitleEn, descriptionDe: g.currentDescriptionDe, descriptionEn: g.currentDescriptionEn }, firstSource: a.source, secondSource: b.source }
})
const manifestId = batchId + '-root-synthesis'
const expected = {
  batch: { batchId, batchManifestDigest: sha(bytes(output + '/batch-manifest.json')), configDigest: batch.configDigest, bundleFingerprint: input.bundleFingerprint, bookDigest: input.bookDigest, reviewInputFingerprint: input.reviewInputFingerprint, dualSummaryDigest: sha(dualBytes), canonicalLandscapeDigest: sha(bytes('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')) },
  rounds: { first: buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].firstSource.binding, batch.artifacts.rounds.first.batchInputFingerprint), second: buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].secondSource.binding, batch.artifacts.rounds.second.batchInputFingerprint) },
  synthesizedAt: new Date().toISOString(), goals: sources,
}
const payload: any = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json', schemaVersion: 1, synthesisContract: 'goal-description-rollout-synthesis-decision-v1', manifestId, authority: 'ai_synthesis', synthesizedBy: 'Codex Root after two independent actual single-page image/context reviews; machine synthesis only', synthesizedAt: expected.synthesizedAt, batch: expected.batch, rounds: expected.rounds,
  decisions: sources.map((g: any, i: number) => ({ decisionId: manifestId + '-decision-' + String(i + 1).padStart(3, '0'), goalId: g.goalId, effectiveSemanticKind: g.effectiveSemanticKind, goalFingerprint: g.goalFingerprint, pageFingerprint: g.pageFingerprint, goalReviewContextFingerprint: g.goalReviewContextFingerprint, finalText: g.finalText, resolutionDecision: 'keep_current', evidenceRound: 'second', records: { first: { recordId: g.firstSource.binding.recordId, recordDigest: g.firstSource.binding.recordDigest }, second: { recordId: g.secondSource.binding.recordId, recordDigest: g.secondSource.binding.recordDigest } }, rationaleDe: rationale[g.goalId.slice(0, 8)][0], rationaleEn: rationale[g.goalId.slice(0, 8)][1] })),
}
const synthesis = { ...payload, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload) }
const synthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesis, expected })
if (synthesisValidation.errors.length) throw new Error(synthesisValidation.errors.join('\n'))
write(output + '/synthesis-decisions.json', synthesis)
mkdirSync(resolve(repo, output, 'resolutions'))
const landscape = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const rows: any[] = []
for (const [i, goalId] of ids.entries()) {
  const g = sources[i]
  const decision = synthesis.decisions[i]
  const summaryGoal = dual.summary.goals.find((g: any) => g.goalId === goalId)!
  const resolution = buildGoalDescriptionDualRoundResolution({ resolutionId: batchId + '-resolution-' + goalId, goalId, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current', synthesis: buildGoalDescriptionRolloutResolutionSynthesis({ batchId, manifest: synthesis, decision, summaryGoal, firstSource: g.firstSource, secondSource: g.secondSource }), dualSummaryBytes: dualBytes, currentInput: input, firstSource: g.firstSource, secondSource: g.secondSource, synthesisDecisionManifest: { contract: synthesis.synthesisContract, manifestPath: 'synthesis-decisions.json', manifestId, manifestDigest: sha(bytes(output + '/synthesis-decisions.json')), manifestFingerprint: synthesis.manifestFingerprint, decisionId: decision.decisionId } })
  const validation = await validateGoalDescriptionDualRoundResolution({ resolution, dualSummary: dual.summary, dualSummaryBytes: dualBytes, currentInput: input, landscape, first: rounds.a, second: rounds.b, synthesisDecisionManifestArtifact: { manifest: synthesis, manifestBytes: bytes(output + '/synthesis-decisions.json'), manifestPath: 'synthesis-decisions.json' } })
  if (validation.errors.length || !validation.strictDescriptionComplete) throw new Error(goalId + ': ' + validation.errors.join('\n'))
  const path = 'resolutions/' + goalId + '.resolution.json'
  write(output + '/' + path, resolution)
  rows.push({ goalId, titleDe: resolution.goal.finalText.titleDe, groupId: batchId, decision: resolution.decision, resolutionPath: path, resolutionDigest: sha(bytes(output + '/' + path)), resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true })
}
const index = { $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json', schemaVersion: 2, indexContract: 'goal-description-standalone-batch-resolution-index-v1', artifactSetId: batchId + '-strict-resolutions', subject: 'Biologie', semanticKind: 'curricularAtomic', batchGoalIds: ids, groups: [{ groupId: batchId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: sha(dualBytes), campaignGoalCount: 1, resolvedGoalCount: 1 }], resolutions: rows }
const ajv = new Ajv2020({ allErrors: true, strict: true })
for (const [name, data] of [['goal-description-rollout-batch-config', config], ['goal-description-rollout-batch-manifest', batch], ['goal-description-standalone-batch-resolution-index', index]] as const) {
  const validate = ajv.compile(read('contracts/goal-description-review/v1/' + name + '.schema.json'))
  if (!validate(data)) throw new Error(name + ': ' + ajv.errorsText(validate.errors))
}
write(output + '/resolution-index.json', index)
write(own + '/exact-reviewed-native-single-description-synthesis.actual.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'actual unchanged native generic campaign/dual-round/synthesis/resolution validation on one independently reviewed corrected-image page', inputFreezePins: frozen, exactReviewerResultCopies: exactCopies, dualSummaryCounts: dual.summary.counts, nativeResolutionCount: rows.length, strictCurrentCandidateDCount: rows.length, authority: 'ai_synthesis', humanApproval: false, humanTrial: false, activeWrites: false, strictNetGain: 0,
  checkedProductionHelpers: ['validateGoalDescriptionReviewCampaignResults', 'validateGoalDescriptionReviewDualRound', 'validateGoalDescriptionRolloutSynthesisDecisionManifest', 'buildGoalDescriptionDualRoundResolution', 'validateGoalDescriptionDualRoundResolution'],
  orchestrationScope: 'Reviewed single-goal campaigns retain their exact native batchSize1 and all byte bindings. Generic native validators support this size; the optional standalone prepare wrapper assumes batchSize20 and was not used or claimed as passed. No product checker or quality limit was changed.',
})
console.log(JSON.stringify({ nativeDualReview: 'PASS1', nativeSynthesisAndCurrentResolution: 'PASS1', independentCurrentPageReviewRounds: 2, activeWrites: false, strictNetGain: 0 }))
