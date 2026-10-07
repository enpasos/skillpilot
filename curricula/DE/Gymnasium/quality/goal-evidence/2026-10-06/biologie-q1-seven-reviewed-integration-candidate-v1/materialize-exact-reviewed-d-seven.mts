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
const own = base + 'biologie-q1-seven-reviewed-integration-candidate-v1'
const prepared = base + 'biologie-q1-seven-final-native-review-inputs-author-v1'
const output = own + '/native-d-seven'
const sha = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const read = (path: string): any => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const bytes = (path: string) => readFileSync(resolve(repo, path))
const write = (path: string, value: unknown) => { mkdirSync(dirname(resolve(repo, path)), { recursive: true }); writeFileSync(resolve(repo, path), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' }) }
const frozen = [
  [prepared + '/final-native-review-inputs.author-v1.freeze.json', '7594c80e665828238463b965f12b18df845a3c17fbfe19dc17e1ed35a5247d70'],
  [base + 'biologie-q1-seven-final-native-d-independent-a-v1/independent-d-a.final.freeze.json', '5a145212d6a28432d16f3e5a90e1d1ed954ec81d4a25b51d787c771ff31a805e'],
  [base + 'biologie-q1-seven-final-native-d-independent-b-v1/native-d-independent-b.final.freeze.json', 'cabe0e8086badbf29488f7c18184f8669f07d5cf67a7dfca9f6acebf8bf4aadf'],
] as const
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
  const resultSource = base + 'biologie-q1-seven-final-native-d-independent-' + suffix + '-v1/results/'
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
const fullModel = read(prepared + '/qa-artifacts/full-390.book-model.json')
const ids = input.goals.map((g: any) => g.goalId)
const batchId = 'biologie-q1-seven-final-reviewed-20261006-v1'
const configPath = own + '/seven.batch.config.json'
const config = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json', schemaVersion: 1,
  batchId, subject: 'biologie', subjectLabel: 'Biologie', bookId: model.book.id, title: model.book.title,
  baseGoalBookConfigPath: prepared + '/inputs/book-390.config.json', goalIds: ids, outputDirectory: output,
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
  ac9e824f: ['Beide unabhängigen Reviews bestätigen die begründete Material-Abschnitt-Träger-Beziehung am einfachen Modell. Direkte Quelle bleibt BE/BB; die übrigen Länder erhalten ausschließlich die ausdrücklich begrenzte Voraussetzungverfügbarkeit. Die zweite Verständnisfassung wird gewählt; Benennung allein ist kein Leistungsnachweis.', 'Both independent reviews confirm the justified material-section-carrier relationship in a simple model. Direct source scope remains BE/BB; other jurisdictions retain only the explicitly bounded prerequisite availability. The second understanding formulation is selected; naming alone is no performance evidence.'],
  '5eb7c923': ['Beide Reviews bestätigen eine gemeinsame begründete Ebenenklassifikation mit belegten Ursachen und unmittelbaren Informationsfolgen. SN Klasse10/Lernbereich1 und TH2.2.1.3 bleiben die begrenzten Quellen. Die zweite Verständnisfassung bewahrt den vollständigen Erklärungsoperator ohne erfundene Krankheitsprognose.', 'Both reviews confirm a unified justified classification of levels with evidenced causes and immediate information effects. SN grade10/topic1 and TH2.2.1.3 remain the bounded sources. The second understanding formulation preserves the full explanation demand without inventing a disease prediction.'],
  bfb5dfb6: ['Beide Reviews bestätigen den positionsweisen Vergleich von Basenpaarsubstitution und Chromosomenzahländerung. ST3.5 ist gemeinsame Einführungsphase; GK/LK sind technische Projektionen und keine amtlichen Quellbezeichnungen. Die zweite Verständnisfassung wird gewählt; das Ziel wird keinem reinen SekI-Zielset zugeordnet.', 'Both reviews confirm the positional comparison of base-pair substitution and chromosome-number change. ST3.5 is the common entry phase; GK/LK are technical projections rather than official source labels. The second understanding formulation is selected; this goal is excluded from pure lower-secondary target sets.'],
  '3a0d6c82': ['Beide Reviews bestätigen die zusammenhängende datenbelegte Risiko- und Schutzentscheidung einschließlich Kriterien, Abwägung und Grenzen. Vier unveränderte Materialien tragen UV- und Umweltkontexte; das UV-Bild allein deckt sie nicht ab. Die zweite Verständnisfassung wird gewählt; kein Nullrisiko oder reale Gesundheitsleistung wird behauptet.', 'Both reviews confirm the unified evidence-based risk and protection decision including criteria, trade-offs and limits. Four unchanged materials support UV and environmental contexts; the UV image alone does not cover them. The second understanding formulation is selected; neither zero risk nor real health performance is claimed.'],
  '9d830422': ['Beide Reviews bestätigen die begründete Zellstammbaumroutine aus Zeitpunkt, betroffener Zelllinie und bedingter Keimzellweitergabe im bereitgestellten Modell. MV-Klasse10 bleibt die begrenzte Quelle. Die zweite Verständnisfassung wird gewählt; somatische Nichtvererbung wird nicht universalisiert und Keimzelländerung nicht als sichere Weitergabe ausgegeben.', 'Both reviews confirm the justified lineage routine combining timing, affected cell lineage and conditional germline transmission in a supplied model. MV grade10 remains the bounded source. The second understanding formulation is selected; somatic non-inheritance is not universalised and germline change is not treated as certain transmission.'],
  d0c3e6a7: ['Beide Reviews bestätigen die kontrollierte kriterienbezogene Unterscheidung von Mutation und Modifikation mit ausdrücklich begrenzten Schlussmöglichkeiten. Die vier einzelnen Länderkomponenten bleiben Teilaspekte. Die zweite Verständnisfassung wird gewählt; Merkmalsunterschied allein belegt keine Mutation und Modellvorgaben sind keine Messbefunde.', 'Both reviews confirm the controlled criterion-based distinction between mutation and modification with explicit inference limits. The four jurisdiction components remain partial aspects. The second understanding formulation is selected; a trait difference alone establishes no mutation and model stipulations are no measured results.'],
  aab2a358: ['Beide Reviews bestätigen die begründete Fehlerkontroll- und Reparaturfunktion zur Informationserhaltung im vorgegebenen Kopiermodell mit ihren Grenzen. TH2.2.1.3 bleibt die begrenzte Quelle. Die zweite Verständnisfassung wird gewählt; eine Fehlpaarung ist keine sichere bleibende Mutation und eine vollständige Enzymroutine wird nicht hinzugefügt.', 'Both reviews confirm the justified error-checking and repair function for preserving information in a supplied copying model, including its limits. TH2.2.1.3 remains the bounded source. The second understanding formulation is selected; a mismatch is no certain permanent mutation and no complete enzyme routine is added.'],
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
  batch: { batchId, batchManifestDigest: sha(bytes(output + '/batch-manifest.json')), configDigest: batch.configDigest, bundleFingerprint: input.bundleFingerprint, bookDigest: input.bookDigest, reviewInputFingerprint: input.reviewInputFingerprint, dualSummaryDigest: sha(dualBytes), canonicalLandscapeDigest: sha(bytes(own + '/canonical-390.integration-candidate.json')) },
  rounds: { first: buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].firstSource.binding, batch.artifacts.rounds.first.batchInputFingerprint), second: buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].secondSource.binding, batch.artifacts.rounds.second.batchInputFingerprint) },
  synthesizedAt: new Date().toISOString(), goals: sources,
}
const payload: any = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json', schemaVersion: 1, synthesisContract: 'goal-description-rollout-synthesis-decision-v1', manifestId, authority: 'ai_synthesis', synthesizedBy: 'Codex Root after both independently frozen current seven-page reviews; machine synthesis only', synthesizedAt: expected.synthesizedAt, batch: expected.batch, rounds: expected.rounds,
  decisions: sources.map((g: any, i: number) => ({ decisionId: manifestId + '-decision-' + String(i + 1).padStart(3, '0'), goalId: g.goalId, effectiveSemanticKind: g.effectiveSemanticKind, goalFingerprint: g.goalFingerprint, pageFingerprint: g.pageFingerprint, goalReviewContextFingerprint: g.goalReviewContextFingerprint, finalText: g.finalText, resolutionDecision: 'keep_current', evidenceRound: 'second', records: { first: { recordId: g.firstSource.binding.recordId, recordDigest: g.firstSource.binding.recordDigest }, second: { recordId: g.secondSource.binding.recordId, recordDigest: g.secondSource.binding.recordDigest } }, rationaleDe: rationale[g.goalId.slice(0, 8)][0], rationaleEn: rationale[g.goalId.slice(0, 8)][1] })),
}
const synthesis = { ...payload, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload) }
const synthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest: synthesis, expected })
if (synthesisValidation.errors.length) throw new Error(synthesisValidation.errors.join('\n'))
write(output + '/synthesis-decisions.json', synthesis)
mkdirSync(resolve(repo, output, 'resolutions'))
const landscape = read(own + '/canonical-390.integration-candidate.json')
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
const index = { $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json', schemaVersion: 2, indexContract: 'goal-description-standalone-batch-resolution-index-v1', artifactSetId: batchId + '-strict-resolutions', subject: 'Biologie', semanticKind: 'curricularAtomic', batchGoalIds: ids, groups: [{ groupId: batchId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: sha(dualBytes), campaignGoalCount: 7, resolvedGoalCount: 7 }], resolutions: rows }
const ajv = new Ajv2020({ allErrors: true, strict: true })
for (const [name, data] of [['goal-description-rollout-batch-config', config], ['goal-description-rollout-batch-manifest', batch], ['goal-description-standalone-batch-resolution-index', index]] as const) {
  const validate = ajv.compile(read('contracts/goal-description-review/v1/' + name + '.schema.json'))
  if (!validate(data)) throw new Error(name + ': ' + ajv.errorsText(validate.errors))
}
write(output + '/resolution-index.json', index)
write(own + '/qa-artifacts/exact-reviewed-native-description-synthesis.actual.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'actual unchanged native generic campaign/dual-round/synthesis/resolution validation on seven independently reviewed pages', inputFreezePins: frozen, exactReviewerResultCopies: exactCopies, dualSummaryCounts: dual.summary.counts, nativeResolutionCount: rows.length, strictCurrentCandidateDCount: rows.length, authority: 'ai_synthesis', humanApproval: false, humanTrial: false, activeWrites: false, strictNetGain: 0,
  checkedProductionHelpers: ['validateGoalDescriptionReviewCampaignResults', 'validateGoalDescriptionReviewDualRound', 'validateGoalDescriptionRolloutSynthesisDecisionManifest', 'buildGoalDescriptionDualRoundResolution', 'validateGoalDescriptionDualRoundResolution'],
  orchestrationScope: 'Reviewed seven-goal campaigns retain their exact original batchSize7 and all byte bindings. Generic native validators support this size; the optional standalone prepare wrapper assumes batchSize20 and was not used or claimed as passed. No product checker or quality limit was changed.',
})
console.log(JSON.stringify({ nativeDualReview: 'PASS7', nativeSynthesisAndCurrentResolution: 'PASS7', independentCurrentPageReviewRounds: 2, activeWrites: false, strictNetGain: 0 }))
