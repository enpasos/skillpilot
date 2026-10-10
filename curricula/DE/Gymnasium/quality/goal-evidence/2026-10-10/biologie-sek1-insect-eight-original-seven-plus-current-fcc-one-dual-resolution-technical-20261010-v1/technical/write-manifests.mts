import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { materializeGoalDescriptionRolloutBatchDualSummary } = await import(pathToFileURL(resolve('app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const { extractGoalDescriptionDualRoundResolutionSource } = await import(pathToFileURL(resolve('app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href)
const { buildGoalDescriptionRolloutSynthesisRoundBinding, fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest } = await import(pathToFileURL(resolve('app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts')).href)

const out = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-original-seven-plus-current-fcc-one-dual-resolution-technical-20261010-v1'
const fcc = 'fcc20f50-8eb3-5d6c-b37f-5be13c7d314e'
const sha = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const notes = JSON.parse(await readFile(join(out, 'technical/actual-goalwise-bilingual-synthesis-notes.json'), 'utf8'))
const groups = JSON.parse(await readFile(join(out, 'native-groups.technical.json'), 'utf8'))
const comparisons = []

for (const group of groups) {
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(group.configPath, true)
  const goals = dual.prepared.manifest.goalIds.map((goalId: string) => {
    const a = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const b = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (a.errors.length || b.errors.length || !a.source || !b.source) throw Error([...a.errors, ...b.errors].join(' | '))
    const current = dual.first.input.goals.find((goal: any) => goal.goalId === goalId)
    return { goalId, effectiveSemanticKind: 'curricularAtomic', goalFingerprint: current.goalFingerprint,
      pageFingerprint: current.pageFingerprint, goalReviewContextFingerprint: a.source.binding.goalReviewContextFingerprint,
      finalText: { titleDe: current.currentTitleDe, titleEn: current.currentTitleEn,
        descriptionDe: current.currentDescriptionDe, descriptionEn: current.currentDescriptionEn },
      firstSource: a.source, secondSource: b.source }
  })
  const synthesizedAt = new Date(Math.max(...[...dual.first.resultPairs, ...dual.second.resultPairs]
    .map((pair: any) => Date.parse(pair.run.completedAt))) + 1000).toISOString()
  const batch = { batchId: dual.prepared.manifest.batchId,
    batchManifestDigest: sha(await readFile(join(dual.prepared.outputDirectory, 'batch-manifest.json'))),
    configDigest: dual.prepared.manifest.configDigest, bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
    bookDigest: dual.first.input.bookDigest, reviewInputFingerprint: dual.first.input.reviewInputFingerprint,
    dualSummaryDigest: sha(dual.bytes), canonicalLandscapeDigest: sha(await readFile(dual.prepared.manifest.source.landscapePath)) }
  const rounds = {
    first: buildGoalDescriptionRolloutSynthesisRoundBinding(goals[0].firstSource.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),
    second: buildGoalDescriptionRolloutSynthesisRoundBinding(goals[0].secondSource.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint),
  }
  const decisions = []
  const deferredGoals = []
  for (const goal of goals) {
    const originalDeferred = goal.goalId === fcc && group.group.startsWith('original-eight')
    const key = goal.goalId.slice(0, 8) + (goal.goalId === fcc ? originalDeferred ? '-original-deferred' : '-current' : '')
    const note = notes[key]
    if (!note) throw Error(`Missing actual goal-specific A/B comparison: ${key}`)
    const first = goal.firstSource, second = goal.secondSource
    if (originalDeferred) {
      if (first.decision !== 'block' || second.decision !== 'keep') throw Error('Original FCC must remain actual Ablock/Bkeep')
      deferredGoals.push({ goalId: goal.goalId, firstDecision: first.decision, secondDecision: second.decision,
        rationaleDe: note[0], rationaleEn: note[1] })
    } else {
      if (first.decision !== 'keep' || second.decision !== 'keep') throw Error(`Actual two KEEP required: ${goal.goalId}`)
      decisions.push({ decisionId: `${group.group}-technical-dual-${goal.goalId}`, goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind, goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint, goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText, resolutionDecision: 'keep_current', evidenceRound: 'first',
        records: { first: { recordId: first.binding.recordId, recordDigest: first.binding.recordDigest },
          second: { recordId: second.binding.recordId, recordDigest: second.binding.recordDigest } },
        rationaleDe: `Explizite technische Synthese nach tatsächlichem Vergleich beider versiegelten unabhängigen Records durch den bestehenden A-Reviewer, keine dritte Fachprüfung. Beide aktuell KEEP; die sechs bilingualen A-Nachweisfelder werden wörtlich ausgewählt. ${note[0]} Ganze B-Records einschließlich konkreter Fallgrenzen bleiben exakt gebunden. Unveränderte Beschreibung; technische Autoren-P7/P1-ReviewIds werden nicht durch ergänzende unabhängige P-Urteile ersetzt. Kein neuer Whole-Quellen-/Kurs-/A/M- oder Human-Gate und kein aktiver Fortschrittszuwachs.`,
        rationaleEn: `Explicit technical synthesis after actual comparison of both sealed independent records by the existing A reviewer, not a third subject review. Both currently KEEP; all six bilingual A evidence fields are selected literally. ${note[1]} Whole B records and their specific case limitations remain exactly bound. Description unchanged; operative technical-author P7/P1 review IDs are not replaced by supplementary independent P judgments. No new whole-source/course/A/M/human gate and no active progress gain.` })
    }
    const firstEvidence = first.record.understandingEvidence, secondEvidence = second.record.understandingEvidence
    comparisons.push({ group: group.group, goalId: goal.goalId, firstDecision: first.decision, secondDecision: second.decision,
      firstRecordId: first.binding.recordId, secondRecordId: second.binding.recordId,
      firstWholeRecordDigest: first.binding.recordDigest, secondWholeRecordDigest: second.binding.recordDigest,
      actualUnderstandingEvidenceFieldsDifferent: Object.keys(firstEvidence).filter(key => firstEvidence[key] !== secondEvidence[key]),
      firstWholeEvidence: firstEvidence, secondWholeEvidence: secondEvidence,
      firstRationale: first.record.rationale, secondRationale: second.record.rationale,
      selectedEvidenceRound: originalDeferred ? null : 'first', selectedEvidenceCopiedLiteral: !originalDeferred,
      disposition: originalDeferred ? 'historical_original_deferred' : 'keep_current',
      ownActualComparisonDe: note[0], ownActualComparisonEn: note[1] })
  }
  const bare = { $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1, synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId: `${group.group}-explicit-technical-dual-synthesis-20261010-v1`, authority: 'ai_synthesis',
    synthesizedBy: 'Codex existing independent A reviewer as technical synthesizer after sealed A/B; no third subject review',
    synthesizedAt, batch, rounds, decisions, ...(deferredGoals.length ? { deferredGoals } : {}) }
  const manifest = { ...bare, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(bare) }
  const validation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest,
    expected: { batch, rounds, synthesizedAt, goals } })
  if (validation.errors.length) throw Error(validation.errors.join(' | '))
  await writeFile(join(dual.prepared.outputDirectory, 'synthesis-decisions.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })
  console.log(`PASS normal prepared/dual/synthesis manifest ${group.group}: strict=${decisions.length}/${goals.length}; deferred=${deferredGoals.length}; ${manifest.manifestFingerprint}`)
}

await writeFile(join(out, 'actual-both-records-comparison-and-explicit-evidence-selection.technical.json'), JSON.stringify({
  schemaVersion: 1, actualTechnicalPerformedAt: new Date().toISOString(),
  synthesisTimestampMeaning: 'Normal deterministic current-run timestamp: latest sealed completedAt plus1000ms; actual technical time recorded separately',
  role: 'Existing independent A reviewer now technically synthesizing both sealed independent rounds; no third scientific review',
  goalComparisons: comparisons, operativeAuthorPositiveReviewIdsUnchanged: true,
  exactModelVersion: 'unknown', samplingParameters: 'unknown', modelDiversityClaim: false,
  automaticAcceptance: false, humanApproval: false, humanTrial: false,
  wholeSourceOrCourseApproval: false, activeWrites: 0, strictNetGain: 0,
}, null, 2) + '\n', { flag: 'wx' })
