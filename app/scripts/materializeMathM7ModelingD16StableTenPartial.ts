import { createHash } from 'node:crypto'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, stableGoalBookJson, type GoalBookModel } from './goalBookModel'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import {
  buildGoalDescriptionRolloutSubsetModel,
  materializeGoalDescriptionRolloutBatchDualSummary,
} from './materializeGoalDescriptionRolloutBatch'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewContext,
  validateGoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import { buildGoalDescriptionCanonicalContext } from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisExpectedGoal,
  type GoalDescriptionSynthesisDigest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'
import { validateLegacyResolutionIndexSnapshot } from './reportDeepUnderstandingRollout'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rollout = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23'
const sourceName = 'm7-modeling-process-sixteen-current-v2'
const outputName = 'm7-modeling-d16-stable-ten-partial-20260923-v1'
const source = join(root, rollout, sourceName)
const output = join(root, rollout, outputName)
const sourceConfigPath = join(root, rollout, `${sourceName}.config.json`)
const triagePath = join(source, 'synthesis-triage.md')
const synthesisPath = join(output, 'synthesis-decisions.json')
const indexPath = join(output, 'resolution-index.json')
const receiptPath = join(output, 'compatibility-receipt.json')
const rolloutConfigPath = join(root, 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
const publicRoot = join(root, 'app/public')
const relativeSource = `../${sourceName}`
const manifestId = 'mathematik-m7-modeling-d16-stable-ten-partial-20260923-v1'

const stable = [
  '27542d59-aa1b-569d-8d77-41129bae26e2',
  'bb4569bc-01ac-5bf9-8c85-05df42d70698',
  '8d2021d0-aa14-5023-998b-187356de7986',
  '035b7fc6-830d-5f41-9c5d-2495808c09d4',
  'ae2ca565-928d-55f4-b804-7155cf210120',
  'dd582580-5cd3-55b3-b05e-e1c102533737',
  '4a630596-6e2f-593e-bac6-2a6d8fa58e2f',
  '8d126397-a8b0-528c-8986-614d56fa0749',
  '5836c821-d43b-5c02-9ee5-e86bb87bb054',
  '74f28ce7-e568-5d6e-b946-17445b344fcc',
] as const

const excluded = {
  dBlock: ['07196e72-ba47-54bf-a096-3a79bbb67e23'],
  dRevision: [
    'e03eca28-9a57-5b24-877c-2e63fecee986',
    '163dd583-8308-53f0-b60d-34588787988d',
    '519660d0-85e5-57a6-a219-d0a253336649',
  ],
  vHold: [
    'bfbaedb9-b138-590a-87e8-4d87784dda0e',
    'fb4dcd2a-a6a9-5371-a2fc-95348ee130e0',
  ],
} as const

type Round = 'first' | 'second'
const decisions = new Map<string, {
  evidenceRound: Round
  rationaleDe: string
  rationaleEn: string
  revisionDissent?: { rationaleDe: string; rationaleEn: string }
}>([
  [stable[0], {
    evidenceRound: 'second',
    rationaleDe: 'Die Wahl eines Verfahrens aus Modellstruktur und Zielfrage samt Begründung ist eine prüfbare Kompetenz; die eigentliche Rechnung wird im folgenden Ziel geprüft. Der aktuelle deutsche und englische Wortlaut bleiben passend.',
    rationaleEn: 'Selecting and justifying a method from the model structure and target question is one assessable competence; the actual calculation belongs to the next goal. The current German and English wording remain apt.',
  }],
  [stable[1], {
    evidenceRound: 'second',
    rationaleDe: 'Relevanz, Einheit und die Trennung von gegebenen und gesuchten Größen sind eine zusammenhängende Bestandsaufnahme vor dem Modellaufbau; eine Aufspaltung wäre künstlich.',
    rationaleEn: 'Relevance, units, and distinguishing given from unknown quantities form one coherent inventory before constructing the model; splitting them would be artificial.',
  }],
  [stable[2], {
    evidenceRound: 'second',
    rationaleDe: 'Der aktuelle Text bindet die Rechnung an das aufgestellte Modell und verlangt korrekte Zwischenschritte. Zulässige Bedingungen werden in der Verständnis-Evidenz konkretisiert; der Vorschlag der ersten Runde ist keine erforderliche kanonische Textänderung.',
    rationaleEn: 'The current text binds computation to the formulated model and requires correct intermediate steps. Admissibility conditions are made concrete in understanding evidence; the first round proposal is not a necessary canonical text change.',
    revisionDissent: {
      rationaleDe: 'Die vorgeschlagene Ergänzung zu Modellbedingungen ist fachlich richtig, aber durch „korrekt“ im Bezug auf das aufgestellte Modell gedeckt und als prüfbarer Fall in der Verständnis-Evidenz präziser aufgehoben.',
      rationaleEn: 'The proposed reference to model conditions is sound, but already covered by “correct” in relation to the formulated model and is more precise as an assessment case in the understanding evidence.',
    },
  }],
  [stable[3], {
    evidenceRound: 'second',
    rationaleDe: 'Das Ordnen relevanter Größen und Beziehungen vor der formalen Modellgleichung ist ein einzelner Modellierungsschritt. Die zweisprachigen Beschreibungen bleiben für diesen Schritt hinreichend spezifisch.',
    rationaleEn: 'Organizing relevant quantities and relations before writing the formal model equation is one modelling step. The bilingual descriptions remain sufficiently specific for it.',
  }],
  [stable[4], {
    evidenceRound: 'first',
    rationaleDe: 'Nachvollziehbare Rechenschritte setzen erkennbar zulässige Umformungen voraus. Die zweite Runde liefert wertvolle Konkretisierung für Aufgaben und Verständnis-Evidenz, aber keinen notwendigen neuen kanonischen Umfang.',
    rationaleEn: 'Traceable calculation steps already require recognizable valid transformations. The second round offers useful specificity for tasks and understanding evidence, but no necessary new canonical scope.',
    revisionDissent: {
      rationaleDe: 'Der Ersatztext schreibt die Regelzuordnung bei jedem Schritt ausdrücklich aus; diese Anforderung konkretisiert „nachvollziehbar“, statt eine fehlende Kompetenz im aktuellen Text zu beheben.',
      rationaleEn: 'The replacement explicitly spells out the rule at each step; this specifies “traceable” rather than repairing a missing competence in the current text.',
    },
  }],
  [stable[5], {
    evidenceRound: 'second',
    rationaleDe: 'Die Sachdeutung eines Ergebnisses mit Bezugsgröße und Einheit ist von Rechnung und späterer Realisierbarkeitsprüfung getrennt. Die gewählte zweite Evidenz vermeidet den sachlich falschen Überschuss bei fest negativem Saldo der ersten Runde.',
    rationaleEn: 'Interpreting a result in context with referent and unit is distinct from computation and later feasibility checks. The selected second-round evidence avoids the first round’s incorrect surplus claim for a fixed negative balance.',
  }],
  [stable[6], {
    evidenceRound: 'second',
    rationaleDe: 'Einsetzen, Fehlererkennung und gezielte Korrektur gehören zu einer innermathematischen Probe; die Prüfung des Sachmodells ist ein anderes Ziel. Der gegenwärtige Wortlaut bildet diese Grenze ab.',
    rationaleEn: 'Substitution, error detection, and targeted correction belong to an internal mathematical check; examining the real-world model is a different goal. The present wording captures that boundary.',
  }],
  [stable[7], {
    evidenceRound: 'second',
    rationaleDe: 'Skizze und konsistente Variablenzuordnung bilden gemeinsam eine Repräsentationsleistung; weder eine bloße Zeichnung noch eine ungebundene Variablenliste würde das Ziel erfüllen.',
    rationaleEn: 'The sketch and consistent variable assignment jointly form one representational competence; neither a bare drawing nor an unbound list of variables would meet the goal.',
  }],
  [stable[8], {
    evidenceRound: 'second',
    rationaleDe: 'Die Grenzen der Aussagekraft folgen aus den Modellannahmen und ihrem Gültigkeitsbereich. Das Benennen der Annahme und die Erklärung der Tragweite sind eine kohärente Leistung.',
    rationaleEn: 'Limits on the model’s explanatory power follow from its assumptions and domain. Naming an assumption and explaining its consequence form one coherent performance.',
  }],
  [stable[9], {
    evidenceRound: 'second',
    rationaleDe: 'Das LK-Ziel verlangt zwei plausible Modelle zu demselben Sachverhalt mit unterschiedlichen Annahmen; Gütevergleich und endgültige Auswahl liegen in nachfolgenden Zielen. Der aktuelle Wortlaut bleibt passend.',
    rationaleEn: 'The advanced-course goal calls for two plausible models of the same situation with different assumptions; evaluating fit and making a final choice belong to later goals. The current wording remains apt.',
  }],
])

const sha256 = (value: Buffer | string): GoalDescriptionSynthesisDigest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const same = (left: unknown, right: unknown) => stableGoalBookJson(left) === stableGoalBookJson(right)
const readJson = async <T>(path: string): Promise<T> => JSON.parse((await readFile(path)).toString('utf8')) as T

const assertExactOutput = async (path: string, bytes: Buffer, write: boolean) => {
  let existing: Buffer | null = null
  try {
    existing = await readFile(path)
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (existing) {
    if (!existing.equals(bytes)) throw new Error(`Existing partial artifact is stale: ${relative(root, path)}`)
    return
  }
  if (!write) throw new Error(`Missing partial artifact: ${relative(root, path)}`)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, bytes, { flag: 'wx' })
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length !== 1 || !['--write', '--check'].includes(args[0])) {
    throw new Error('Usage: tsx scripts/materializeMathM7ModelingD16StableTenPartial.ts --write|--check')
  }
  const write = args[0] === '--write'
  const [dual, sourceConfig, sourceModel, triageBytes, registry] = await Promise.all([
    materializeGoalDescriptionRolloutBatchDualSummary(sourceConfigPath, false),
    readJson<{ baseGoalBookConfigPath: string; goalIds: string[]; bookId: string; title: string }>(sourceConfigPath),
    readJson<GoalBookModel>(join(source, 'bundle/book-model.json')),
    readFile(triagePath),
    readJson<{ subjects: Array<{ subject: string; resolutionIndexPaths: string[] }> }>(rolloutConfigPath),
  ])
  const campaignIds = dual.prepared.manifest.goalIds
  const partition = [...stable, ...excluded.dBlock, ...excluded.dRevision, ...excluded.vHold]
  const partitionSet = new Set<string>(partition)
  if (
    campaignIds.length !== 16
    || partitionSet.size !== 16
    || !campaignIds.every((goalId) => partitionSet.has(goalId))
    || stable.length !== 10
    || decisions.size !== 10
    || sourceConfig.goalIds.length !== campaignIds.length
    || !sourceConfig.goalIds.every((goalId, index) => goalId === campaignIds[index])
  ) throw new Error('D16 source partition or authored stable-ten decisions changed')
  const mathRegistry = registry.subjects.find(({ subject }) => subject === 'mathematik')
  if (!mathRegistry) throw new Error('Current rollout registry has no Mathematik subject')
  for (const indexRelativePath of mathRegistry.resolutionIndexPaths) {
    const registered = await readJson<{ resolutions?: Array<{ goalId: string }> }>(join(root, indexRelativePath))
    for (const entry of registered.resolutions ?? []) {
      if (stable.includes(entry.goalId as typeof stable[number])) {
        throw new Error(`${entry.goalId}: already claimed by registered ${indexRelativePath}`)
      }
    }
  }

  const base = await loadGoalBookBuildInputs(sourceConfig.baseGoalBookConfigPath)
  const current = buildGoalDescriptionRolloutSubsetModel({
    baseModel: base.model,
    goalIds: sourceConfig.goalIds,
    bookId: sourceConfig.bookId,
    title: sourceConfig.title,
  })
  if (
    sourceModel.digest !== dual.prepared.manifest.artifacts.bookModelDigest
    || current.pages.length !== 16
    || base.model.pages.length !== dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation
  ) throw new Error('D16 source model or current curricularAtomic scope changed')
  // The only permitted global BookModel drift is a QA downgrade on the two
  // explicitly excluded D16 V-HOLD pages. The ten claimed pages stay byte-for-byte
  // identical; the old sixteen-goal review input and runs are never rebound.
  const allowedQaChangedPageIds = [
    'fb4dcd2a-a6a9-5371-a2fc-95348ee130e0',
    '163dd583-8308-53f0-b60d-34588787988d',
  ]
  const changedPageIds: string[] = []
  for (let index = 0; index < current.pages.length; index += 1) {
    const before = sourceModel.pages[index]
    const after = current.pages[index]
    if (!before || before.goalId !== after.goalId) {
      throw new Error('D16 current page ordering or goal identity changed')
    }
    if (same(before, after)) continue
    changedPageIds.push(after.goalId)
    if (!allowedQaChangedPageIds.includes(after.goalId) || !before.visualization || !after.visualization) {
      throw new Error(`${after.goalId}: page changed outside excluded QA downgrades`)
    }
    const expectedDowngrade = {
      ...before,
      pageFingerprint: after.pageFingerprint,
      visualization: { ...before.visualization, qaStatus: 'rejected' },
    }
    if (
      before.visualization.qaStatus !== 'review_candidate'
      || before.visualization.approvedForPublication !== false
      || after.visualization.approvedForPublication !== false
      || !same(after, expectedDowngrade)
    ) throw new Error(`${after.goalId}: QA page delta exceeds the documented downgrade`)
  }
  if (
    !same(changedPageIds, allowedQaChangedPageIds)
    || base.model.digest === dual.prepared.manifest.source.baseBookDigest
    || current.digest === sourceModel.digest
  ) throw new Error('Expected precisely two excluded QA-downgrade pages and a global BookModel digest drift')
  const normalizedCurrent = structuredClone(current)
  normalizedCurrent.digest = sourceModel.digest
  normalizedCurrent.source.goalVisualizationQaDigest = sourceModel.source.goalVisualizationQaDigest
  if (!normalizedCurrent.navigation.derivedProjection || !sourceModel.navigation.derivedProjection) {
    throw new Error('D16 subset lacks the expected derived GoalBook projection')
  }
  normalizedCurrent.navigation.derivedProjection.baseModelDigest = sourceModel.navigation.derivedProjection.baseModelDigest
  for (const changedId of changedPageIds) {
    const index = current.pages.findIndex(({ goalId }) => goalId === changedId)
    normalizedCurrent.pages[index] = structuredClone(sourceModel.pages[index])
  }
  if (!same(normalizedCurrent, sourceModel)) {
    throw new Error('D16 subset changed beyond the exact excluded QA-downgrade projection')
  }

  const canonicalPath = join(root, dual.prepared.manifest.source.landscapePath)
  const [canonicalBytes, batchManifestBytes] = await Promise.all([
    readFile(canonicalPath),
    readFile(join(source, 'batch-manifest.json')),
  ])
  const landscape = JSON.parse(canonicalBytes.toString('utf8')) as {
    subject: string
    goals: Array<Record<string, unknown>>
  }
  if (landscape.subject !== 'Mathematik') throw new Error('Canonical subject is not Mathematik')
  const expectedGoals: GoalDescriptionRolloutSynthesisExpectedGoal[] = []
  const sources = new Map<string, {
    first: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
    second: NonNullable<ReturnType<typeof extractGoalDescriptionDualRoundResolutionSource>['source']>
  }>()
  const pageBindings: Array<Record<string, unknown>> = []
  for (const goalId of stable) {
    const index = campaignIds.indexOf(goalId)
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId, label: 'First' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId, label: 'Second' })
    if (first.errors.length || second.errors.length || !first.source?.record || !second.source?.record) {
      throw new Error(`${goalId}: missing exact validated source records: ${[...first.errors, ...second.errors].join(' | ')}`)
    }
    const choice = decisions.get(goalId)
    const inputGoal = dual.first.input.goals.find((goal) => goal.goalId === goalId)
    const secondGoal = dual.second.input.goals.find((goal) => goal.goalId === goalId)
    const currentPage = current.pages[index]
    const sourcePage = sourceModel.pages[index]
    const canonicalGoal = landscape.goals.find((goal) => goal.id === goalId)
    const summaryGoal = dual.summary.goals.find((goal) => goal.goalId === goalId)
    if (!choice || !inputGoal || !secondGoal || !canonicalGoal || !summaryGoal || !currentPage || !sourcePage) {
      throw new Error(`${goalId}: incomplete current goal/page/context alignment`)
    }
    const contextFingerprint = fingerprintGoalDescriptionReviewContext(inputGoal)
    if (
      !same(inputGoal, secondGoal)
      || !same(inputGoal.canonicalContext, buildGoalDescriptionCanonicalContext(canonicalGoal))
      || !same(currentPage, sourcePage)
      || !same(currentPage, inputGoal.reviewContext.page)
      || first.source.binding.goalReviewContextFingerprint !== contextFingerprint
      || second.source.binding.goalReviewContextFingerprint !== contextFingerprint
      || !same({
        titleDe: inputGoal.currentTitleDe,
        titleEn: inputGoal.currentTitleEn,
        descriptionDe: inputGoal.currentDescriptionDe,
        descriptionEn: inputGoal.currentDescriptionEn,
      }, {
        titleDe: canonicalGoal.title,
        titleEn: canonicalGoal.titleEn,
        descriptionDe: canonicalGoal.description,
        descriptionEn: canonicalGoal.descriptionEn,
      })
    ) throw new Error(`${goalId}: reviewed current goal/page/context changed; targeted subject review required`)
    const expectedPair = choice.revisionDissent
      ? goalId === stable[2] ? ['revise', 'keep'] : ['keep', 'revise']
      : ['keep', 'keep']
    if (
      first.source.decision !== expectedPair[0]
      || second.source.decision !== expectedPair[1]
      || summaryGoal.firstDecision !== expectedPair[0]
      || summaryGoal.secondDecision !== expectedPair[1]
    ) throw new Error(`${goalId}: dual review decisions changed from triage`)
    const visualization = currentPage.visualization
    if (!visualization?.url || !visualization.originalDigest) {
      throw new Error(`${goalId}: missing bound current visualization`)
    }
    const url = visualization.url
    if (!url.startsWith(`/assets/goal-visualizations/mathematik/${goalId}/`)) {
      throw new Error(`${goalId}: visualization URL is outside its current goal directory`)
    }
    const assetPath = resolve(publicRoot, `.${url}`)
    if (relative(publicRoot, assetPath).startsWith(`..${sep}`)) {
      throw new Error(`${goalId}: visualization asset path escapes public root`)
    }
    const imageDigest = sha256(await readFile(assetPath))
    if (imageDigest !== visualization.originalDigest) {
      throw new Error(`${goalId}: public image bytes disagree with exact reviewed page`)
    }
    const finalText = {
      titleDe: inputGoal.currentTitleDe,
      titleEn: inputGoal.currentTitleEn,
      descriptionDe: inputGoal.currentDescriptionDe,
      descriptionEn: inputGoal.currentDescriptionEn,
    }
    expectedGoals.push({
      goalId,
      effectiveSemanticKind: 'curricularAtomic',
      goalFingerprint: inputGoal.goalFingerprint as GoalDescriptionSynthesisDigest,
      pageFingerprint: inputGoal.pageFingerprint as GoalDescriptionSynthesisDigest,
      goalReviewContextFingerprint: contextFingerprint,
      finalText,
      firstSource: first.source,
      secondSource: second.source,
    })
    sources.set(goalId, { first: first.source, second: second.source })
    pageBindings.push({
      goalId,
      titleDe: finalText.titleDe,
      goalFingerprint: inputGoal.goalFingerprint,
      pageFingerprint: inputGoal.pageFingerprint,
      goalReviewContextFingerprint: contextFingerprint,
      canonicalContextDigest: sha256(stableGoalBookJson(inputGoal.canonicalContext)),
      pageNumberInSourceBatch: index + 1,
      imagePublicPath: relative(root, assetPath),
      imageOriginalDigest: visualization.originalDigest,
      imageActualDigest: imageDigest,
      roundADecision: first.source.decision,
      roundBDecision: second.source.decision,
      selectedUnderstandingRound: choice.evidenceRound,
    })
  }

  const firstGoal = expectedGoals[0]
  if (!firstGoal) throw new Error('Stable-ten selection is empty')
  const times = [...dual.first.resultPairs, ...dual.second.resultPairs]
    .map(({ run }) => Date.parse(run.completedAt))
  if (!times.length || times.some((value) => !Number.isFinite(value))) {
    throw new Error('Validated dual runs lack valid completion timestamps')
  }
  const expected = {
    batch: {
      batchId: dual.prepared.manifest.batchId,
      batchManifestDigest: sha256(batchManifestBytes),
      configDigest: dual.prepared.manifest.configDigest,
      bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
      bookDigest: dual.first.input.bookDigest as GoalDescriptionSynthesisDigest,
      reviewInputFingerprint: dual.first.input.reviewInputFingerprint as GoalDescriptionSynthesisDigest,
      dualSummaryDigest: sha256(dual.bytes),
      canonicalLandscapeDigest: sha256(canonicalBytes),
    },
    rounds: {
      first: buildGoalDescriptionRolloutSynthesisRoundBinding(
        firstGoal.firstSource.binding,
        dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint,
      ),
      second: buildGoalDescriptionRolloutSynthesisRoundBinding(
        firstGoal.secondSource.binding,
        dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint,
      ),
    },
    synthesizedAt: new Date(Math.max(...times) + 1000).toISOString(),
    goals: expectedGoals,
  }
  const synthesisPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1,
    synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId,
    authority: 'ai_synthesis',
    synthesizedBy: 'OpenAI Codex (exact model identifier unavailable); informed D16 synthesis candidate',
    synthesizedAt: expected.synthesizedAt,
    batch: expected.batch,
    rounds: expected.rounds,
    decisions: expectedGoals.map((goal, index) => {
      const source = sources.get(goal.goalId)!
      const choice = decisions.get(goal.goalId)!
      const revisionSource = source.first.decision === 'revise'
        ? { label: 'first' as const, record: source.first.record }
        : source.second.decision === 'revise'
          ? { label: 'second' as const, record: source.second.record }
          : null
      const revisionDissent = choice.revisionDissent && revisionSource?.record
        ? {
            sourceRound: revisionSource.label,
            disposition: 'rejected_keep_current' as const,
            proposedDescriptionDe: revisionSource.record.proposedDescriptionDe ?? '',
            proposedDescriptionEn: revisionSource.record.proposedDescriptionEn ?? '',
            rationaleDe: choice.revisionDissent.rationaleDe,
            rationaleEn: choice.revisionDissent.rationaleEn,
          }
        : undefined
      if (choice.revisionDissent && (!revisionDissent?.proposedDescriptionDe || !revisionDissent.proposedDescriptionEn)) {
        throw new Error(`${goal.goalId}: rejected revision lacks exact bilingual proposed text`)
      }
      return {
        decisionId: `${manifestId}-decision-${String(index + 1).padStart(3, '0')}`,
        goalId: goal.goalId,
        effectiveSemanticKind: goal.effectiveSemanticKind,
        goalFingerprint: goal.goalFingerprint,
        pageFingerprint: goal.pageFingerprint,
        goalReviewContextFingerprint: goal.goalReviewContextFingerprint,
        finalText: goal.finalText,
        resolutionDecision: 'keep_current' as const,
        evidenceRound: choice.evidenceRound,
        records: {
          first: { recordId: source.first.binding.recordId, recordDigest: source.first.binding.recordDigest },
          second: { recordId: source.second.binding.recordId, recordDigest: source.second.binding.recordDigest },
        },
        ...(revisionDissent ? { revisionDissent } : {}),
        rationaleDe: choice.rationaleDe,
        rationaleEn: choice.rationaleEn,
      }
    }),
  }
  const synthesis: GoalDescriptionRolloutSynthesisDecisionManifest = {
    ...synthesisPayload,
    manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(synthesisPayload),
  }
  const synthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: synthesis,
    expected,
  })
  if (synthesisValidation.errors.length) {
    throw new Error(`Partial synthesis validation: ${synthesisValidation.errors.join(' | ')}`)
  }
  const synthesisBytes = jsonBytes(synthesis)

  const resolutionArtifacts: Array<{ path: string; bytes: Buffer }> = []
  const entries: Array<{
    goalId: string
    titleDe: string
    groupId: string
    decision: string
    resolutionPath: string
    resolutionDigest: GoalDescriptionSynthesisDigest
    resolutionFingerprint: string
    strictDescriptionComplete: true
  }> = []
  for (const goal of expectedGoals) {
    const source = sources.get(goal.goalId)!
    const decision = synthesis.decisions.find(({ goalId }) => goalId === goal.goalId)!
    const summaryGoal = dual.summary.goals.find(({ goalId }) => goalId === goal.goalId)!
    const resolutionSynthesis = buildGoalDescriptionRolloutResolutionSynthesis({
      batchId: dual.prepared.manifest.batchId,
      manifest: synthesis,
      decision,
      summaryGoal,
      firstSource: source.first,
      secondSource: source.second,
    })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: `${manifestId}-resolution-${goal.goalId}`,
      goalId: goal.goalId,
      effectiveSemanticKind: 'curricularAtomic',
      decision: 'keep_current',
      synthesis: resolutionSynthesis,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      firstSource: source.first,
      secondSource: source.second,
      synthesisDecisionManifest: {
        contract: synthesis.synthesisContract,
        manifestPath: 'synthesis-decisions.json',
        manifestId: synthesis.manifestId,
        manifestDigest: sha256(synthesisBytes),
        manifestFingerprint: synthesis.manifestFingerprint,
        decisionId: decision.decisionId,
      },
    })
    const validation = await validateGoalDescriptionDualRoundResolution({
      resolution,
      dualSummary: dual.summary,
      dualSummaryBytes: dual.bytes,
      currentInput: dual.first.input,
      landscape,
      first: dual.first,
      second: dual.second,
      synthesisDecisionManifestArtifact: {
        manifest: synthesis,
        manifestBytes: synthesisBytes,
        manifestPath: 'synthesis-decisions.json',
      },
    })
    if (validation.errors.length || !validation.strictDescriptionComplete) {
      throw new Error(`${goal.goalId}: ${validation.errors.join(' | ') || 'not strict D complete'}`)
    }
    const resolutionBytes = jsonBytes(resolution)
    const resolutionPath = `resolutions/${goal.goalId}.resolution.json`
    resolutionArtifacts.push({ path: join(output, resolutionPath), bytes: resolutionBytes })
    entries.push({
      goalId: goal.goalId,
      titleDe: goal.finalText.titleDe,
      groupId: dual.prepared.manifest.batchId,
      decision: resolution.decision,
      resolutionPath,
      resolutionDigest: sha256(resolutionBytes),
      resolutionFingerprint: resolution.resolutionFingerprint,
      strictDescriptionComplete: true,
    })
  }
  const denominator = base.model.pages.length
  const index = {
    schemaVersion: 1 as const,
    artifactSetId: `${manifestId}-partial-group`,
    subject: 'Mathematik',
    semanticKind: 'curricularAtomic',
    strictDescriptionReviewCompleteCount: entries.length,
    curriculumAtomicDenominator: denominator,
    descriptionReviewPercentage: Number(((entries.length / denominator) * 100).toFixed(1)),
    synthesisDecisionManifest: {
      path: 'synthesis-decisions.json',
      digest: sha256(synthesisBytes),
      fingerprint: synthesis.manifestFingerprint,
    },
    groups: [{
      groupId: dual.prepared.manifest.batchId,
      artifactDirectory: relativeSource,
      dualSummaryPath: `${relativeSource}/dual-summary.json`,
      dualSummaryDigest: sha256(dual.bytes),
      campaignGoalCount: dual.summary.goalCount,
      resolvedGoalCount: entries.length,
    }],
    resolutions: entries,
  }
  const indexErrors = validateLegacyResolutionIndexSnapshot(index)
  if (indexErrors.length) throw new Error(`Partial-index validation: ${indexErrors.join(' | ')}`)
  const indexBytes = jsonBytes(index)
  const receipt = {
    schemaVersion: 1,
    receiptId: manifestId,
    status: 'ai_synthesis_candidate_not_registered',
    purpose: 'Exact-current partial D resolution of ten stable goals from the sixteen-goal independent D16 review; no whole-campaign completion claim.',
    authoredBy: 'OpenAI Codex (exact model identifier unavailable); informed synthesis, author of independent Round B',
    sourceBatchId: dual.prepared.manifest.batchId,
    sourceCampaignGoalCount: 16,
    claimedGoalIds: [...stable],
    claimedGoalCount: 10,
    excluded,
    sourceBindings: {
      configPath: relative(root, sourceConfigPath),
      configDigest: sha256(await readFile(sourceConfigPath)),
      batchManifestPath: relative(root, join(source, 'batch-manifest.json')),
      batchManifestDigest: sha256(batchManifestBytes),
      dualSummaryPath: relative(root, join(source, 'dual-summary.json')),
      dualSummaryDigest: sha256(dual.bytes),
      bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint,
      reviewInputFingerprint: dual.prepared.manifest.artifacts.reviewInputFingerprint,
      triagePath: relative(root, triagePath),
      triageDigest: sha256(triageBytes),
    },
    currentBindings: {
      canonicalLandscapePath: relative(root, canonicalPath),
      canonicalLandscapeDigest: sha256(canonicalBytes),
      sourceBaseGoalBookDigest: dual.prepared.manifest.source.baseBookDigest,
      currentBaseGoalBookDigest: base.model.digest,
      sourceSubsetGoalBookDigest: sourceModel.digest,
      currentSubsetGoalBookDigest: current.digest,
      sourceVisualizationQaDigest: sourceModel.source.goalVisualizationQaDigest,
      currentVisualizationQaDigest: current.source.goalVisualizationQaDigest,
      exactChangedSourceBatchPages: changedPageIds,
      changedPageDelta: 'Only visualization.qaStatus review_candidate -> rejected plus derived pageFingerprint on excluded fb4d and 163d pages; no ten claimed page, goal, context, or image bytes changed.',
      currentCurricularAtomicDenominator: denominator,
      perGoal: pageBindings,
    },
    synthesisManifestPath: 'synthesis-decisions.json',
    synthesisManifestDigest: sha256(synthesisBytes),
    resolutionIndexPath: 'resolution-index.json',
    resolutionIndexDigest: sha256(indexBytes),
    resolutionIndexFormat: 'legacy-schema-v1-partial-group',
    noWholeBatchProgressClaim: true,
    noCanonicalOrRegistryOrQaEdits: true,
    noHumanApprovalClaim: true,
    notes: [
      'All ten current canonical bilingual texts, canonical V3 contexts, GoalBook subset pages, page images, two blind source records, and per-goal fingerprints exactly match the reviewed v2 source. The full BookModel digest changed only after the QA downgrade on two excluded D16 pages; this receipt binds and explains that delta without changing old review input or run hashes.',
      'Eight resolutions bind KEEP/KEEP. Two bind KEEP/REVISE and explicitly reject the exact proposed bilingual replacement in a natively validated synthesis manifest; the revised review evidence remains available as evidence only.',
      'The three D revision candidates, one D block, and two further V-HOLD candidates are excluded. D resolution is separate from image QA, source applicability, positive-evidence validation, and M7 intersection.',
      'This unregistered index is a partial candidate; the central rollout registry and quality ledgers remain unchanged.',
    ],
  }
  const artifacts = [
    { path: synthesisPath, bytes: synthesisBytes },
    ...resolutionArtifacts,
    { path: indexPath, bytes: indexBytes },
    { path: receiptPath, bytes: jsonBytes(receipt) },
  ]
  for (const artifact of artifacts) await assertExactOutput(artifact.path, artifact.bytes, write)
  console.log(`${write ? 'Materialized' : 'Verified'} D16 stable-ten partial: strict=${entries.length}/10; sourceCampaign=16; index=${relative(root, indexPath)}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
