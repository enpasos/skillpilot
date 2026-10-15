import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import { fingerprintSemanticKindSourceGoal } from '../broad-fivea-two-owner-portable-quality-author-20261015-v1/isolated-root/app/scripts/goalBookModel.ts'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  positiveGoalEvidenceReviewInputPayload,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../broad-fivea-two-owner-portable-quality-author-20261015-v1/isolated-root/app/scripts/positiveGoalEvidenceProfileModel.ts'
import { aiApprovalStatus } from '../broad-fivea-two-owner-portable-quality-author-20261015-v1/isolated-root/app/src/utils/goalVisualizationQaStatus.ts'
import { normalizeGoalVisualizationAiReview } from '../broad-fivea-two-owner-portable-quality-author-20261015-v1/isolated-root/app/scripts/goalVisualizationQaModel.ts'
import { reviewPositiveGoalEvidenceConfig } from './native-validation-root/app/scripts/positiveGoalEvidenceReview.ts'

const O = dirname(fileURLToPath(import.meta.url))
const M = '/home/enpasos/projects/skillpilot'
const R = resolve(O, '../broad-fivea-two-owner-portable-quality-author-20261015-v1/isolated-root')
const B = 'curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/broad-fivea-two-owner-portable-v1'
const N = resolve(O, 'native-validation-root')
const actor = '/root/portable_eight_scope_and_guard_successor_author/two_owner_current_p_kind_v_independent'
const reviewId = 'physics-two-current-whole-p-independent-peer-20261015-v1'
const now = new Date().toISOString()
const T = '4a2bf015-052b-4af0-aed7-324259fa1a8a'
const A = 'e4b38061-1f28-43ad-8371-a3e7c0e81856'
const ids = [T, A]
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/physics-positive-understanding-evidence-profile-criteria-v1.md'
const pPath = 'curricula/DE/Gymnasium/quality/goal-evidence/physik/twenty-explicit-profile-conditions-current-20261015-v1/P.twenty-current.review.jsonl'
const kindPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json'
const sha = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const bind = (p: string) => ({ path: relative(M, p), bytes: statSync(p).size, sha256: sha(readFileSync(p)) })
const out = (name: string, value: unknown) => writeFileSync(resolve(O, name), JSON.stringify(value, null, 2) + '\n')
const rawLandscapeBytes = readFileSync(resolve(R, landscapePath))
const landscape = JSON.parse(rawLandscapeBytes.toString('utf8'))
const goals = ids.map(id => landscape.goals.find((g: any) => g.id === id))
assert(goals.every(Boolean))
assert.deepEqual(goals[0].requires, [A])
assert.deepEqual(goals[1].requires, ['bf8517a9-142b-5789-826a-767f3b277998'])
const baseline = read(resolve(M, 'tmp/cross-subject-requires/broad-fivea-two-owner-minimality-author-20261015-v1/two-current-whole-Goal-P-and-whole-quadratic-cluster-intake.actual.json'))
const originalRows = readFileSync(resolve(R, pPath), 'utf8').trim().split('\n').map(JSON.parse)
const inputP = ids.map(id => originalRows.find((r: any) => r.goalId === id))
inputP.forEach((p, i) => assert.deepEqual(p.profile, baseline.PhysicsRows[i].wholeCurrentPositiveEvidence.record.profile))
const criteriaHash = sha(readFileSync(resolve(R, criteriaPath)))
assert.equal(criteriaHash, 'sha256:8d64a50ede312df08795f6fddec82c1c3bcc8b77e50dad62220c201c819fd460')
const assets = goals.map((g: any) => g.resourceLinks.filter((l: any) => l.type === 'goal-visualization').map((l: any) => {
  const publicPath = resolve(R, 'app/public', l.url.slice(1))
  const canonicalPath = resolve(R, 'curricula/DE/Gymnasium/visualizations', l.url.slice('/assets/goal-visualizations/'.length))
  const backendPath = resolve(R, 'backend/src/main/resources/static', l.url.slice(1))
  assert.equal(sha(readFileSync(publicPath)), sha(readFileSync(canonicalPath)))
  assert.equal(sha(readFileSync(publicPath)), sha(readFileSync(backendPath)))
  return { url: l.url, public: bind(publicPath), canonical: bind(canonicalPath), backend: bind(backendPath) }
}))
assert.equal(assets[0][0].public.sha256, 'sha256:b61d17e625e12d1a28108c92baa63743b223f5947b02fc7b5ad4ed03b52c6dd0')
assert.equal(assets[1][0].public.sha256, 'sha256:fd83544e329cc947ab46a9b49f4ab7a461a168a1c086b4624669a44679aa8fbf')
const digests = assets.map(as => Object.fromEntries(as.map((a: any) => [a.url, a.public.sha256])))

// These are fresh independent subject-matter judgments. The exact profile
// bodies were read in full and are preserved; only review context is new.
const pReasons: Record<string, string> = {
  [T]: 'Fresh independent whole-profile KEEP in the exact two-goal private candidate and actual inspected corrected traffic PNG. The complete modeling profile requires the learner to explain reaction/braking scaling, choose fixed-obstacle versus shared-time relative-gap comparisons, interpret supplied histories, and judge stated reserves and uncertainty. Both bilingual cases are physically consistent and content-bearing variations; exact independent arithmetic confirms all rounded stopping/margin values. Supplied model calculations do not replace the required learner explanations or judgments. No profile-body change, source/Requires/D approval, human approval, or adoption is asserted.',
  [A]: 'Fresh independent whole-profile KEEP in the exact two-goal private candidate and actual inspected acceleration JPG. The complete representation profile requires learner construction/translation and explanation of consistent t-a/t-v/t-s histories, signed direction and displacement versus distance, then transfers to the validity boundary of a braking model. Supplied zero crossing, partial areas and support data leave the physical correspondence and model-limit decisions to the learner; solving equations or new area arithmetic is expressly optional. Both languages preserve the same competence and the profile is independent of the reviewed image layout. No profile-body change, source/Requires/D approval, human approval, or adoption is asserted.',
}
const pRows = inputP.map((p: any, i: number) => ({
  ...p,
  reviewId,
  goalFingerprint: fingerprintGoalForPositiveEvidence(goals[i], 'curricularAtomic'),
  reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goals[i], criteriaHash, digests[i], 'curricularAtomic'),
  profileFingerprint: fingerprintPositiveGoalEvidenceProfile(p.profile),
  status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewedAt: now,
  reviewer: actor, reason: pReasons[p.goalId], evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewRunIds: [], dissent: [],
}))
const errors = pRows.flatMap((p: any, i: number) => validatePositiveGoalEvidenceRecordSemantics(p, goals[i], digests[i], 'curricularAtomic'))
assert.deepEqual(errors, [])
const pJsonl = pRows.map(r => JSON.stringify(r)).join('\n') + '\n'
writeFileSync(resolve(O, 'P.two-independent-peer.review.jsonl'), pJsonl)

const oldKind = read(resolve(R, kindPath))
const kindRows = goals.map((g: any) => ({
  goalId: g.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(g),
  semanticKind: 'curricularAtomic', decisionStatus: 'authoritative',
  decisionBasis: 'reviewed-current-semantic-recheck-curricular-atomic',
}))
const kindLedger = {
  ...oldKind,
  ledgerId: 'physics-two-current-whole-independent-peer-20261015-v1',
  counts: { curricularAtomic: 2, curricularArea: 0, practiceAssessment: 0, programStructure: 0, memory: 0, runtimeSupport: 0, orientation: 0, total: 2 },
  decisions: kindRows,
}
out('Kind.two-independent-peer.rows.json', kindRows)
out('Kind.two-independent-peer.partial-native-ledger.json', kindLedger)

const originalQa = read(resolve(R, B, 'originals/physik.visual-qa.exact.json'))
const humanKeys = ['humanApproved', 'humanIssueIdentified', 'humanIssueDescription', 'humanReviewedAt', 'humanReviewer']
const visualNotes: Record<string, string> = {
  [T]: 'Fresh actual original-resolution independent AI inspection of corrected PNG sha256:b61d17e625e12d1a28108c92baa63743b223f5947b02fc7b5ad4ed03b52c6dd0. Reaction and braking intervals adjoin and sum to stopping distance. The example 50 km/h ≈13.9 m/s, 1 s reaction ≈14 m, braking ≈14 m, total ≈28 m is coherent as one dry-road model. Wet-road braking is longer. Modellgrenzen now distinguishes fixed obstacle (Anhalteweg + Reserve) from a moving lead vehicle (relative separation must be checked); the former universal stopping-distance rule is removed. The caption/alt text correctly points to a shared timeline. Umlauts, labels and units are legible; the friendly schematic style fits the retained original and the goal. It is orientation support, not a full following-vehicle calculation, safety prescription or assessment evidence. Actual tool is OpenAI built-in image_gen edit; serving model/build unobserved. Old JPG and original prompt retained byte-exact. AI approval only; all prior human fields preserved.',
  [A]: 'Fresh actual original-resolution independent AI inspection of unchanged JPG sha256:fd83544e329cc947ab46a9b49f4ab7a461a168a1c086b4624669a44679aa8fbf. Four explicitly schematic, non-scale snapshots give t=0/1/2/3 s, v=0/2/4/6 m/s and s=0/1/4/9 m. The three plots consistently show s=t² m, v=2t m/s and a=2 m/s²; axis units, origin, labels, v0=s0=0 and general constant-acceleration equations agree. No misleading marked coordinate, sign or unit was observed. Text and formulas are legible at original size and approachable cart/diagram style fits the goal. This is one positive-acceleration-from-rest illustration, not evidence of learner understanding or a complete depiction of signed/reversing cases; the full P profile supplies independent transfer cases. Existing provider metadata remains Google Gemini / Nano Banana Pro; no new generation or serving-build claim is made. AI approval only; all human fields preserved.',
}
const qaRows = goals.map((g: any, i: number) => {
  const previous = originalQa.records.find((r: any) => r.goalId === g.id)
  assert(previous)
  const link = g.resourceLinks.find((l: any) => l.type === 'goal-visualization')
  const row = {
    ...previous,
    title: g.title, description: g.description, landscapePath,
    imageUrl: link.url,
    publicAssetPath: 'app/public/' + link.url.slice(1),
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + link.url.slice('/assets/goal-visualizations/'.length),
    assetSha256: assets[i][0].public.sha256,
    visualizationState: 'available', missingReason: '',
    umlautsCorrectChatGpt: 'yes', contentApprovedChatGpt: 'yes',
    chatGptReviewedAt: now, chatGptReviewer: actor, chatGptNotes: visualNotes[g.id],
    aiApproved: 'yes', aiApprovedAssetSha256: assets[i][0].public.sha256,
    aiReviewedAt: now, aiReviewer: actor, aiNotes: visualNotes[g.id],
  }
  humanKeys.forEach(k => assert.deepEqual(row[k], previous[k]))
  assert.equal(aiApprovalStatus(row), 'approved')
  assert.deepEqual(normalizeGoalVisualizationAiReview(row, row.assetSha256), {
    aiApproved: row.aiApproved, aiApprovedAssetSha256: row.aiApprovedAssetSha256,
    aiReviewedAt: row.aiReviewedAt, aiReviewer: row.aiReviewer, aiNotes: row.aiNotes,
  })
  assert.deepEqual(Object.keys(row).sort(), Object.keys(previous).sort())
  return row
})
out('V.two-independent-peer.native-qa-rows.json', qaRows)
out('V.two-independent-peer.partial-native-qa.json', { ...originalQa, records: qaRows })

const config = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
  schemaVersion: 2, reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId: landscape.landscapeId, landscapePath, semanticKindLedgerPath: kindPath,
  reviewCriteriaPath: criteriaPath, reviewPath: B + '/peer/P.two-independent-peer.review.jsonl',
  reviewRunManifestPaths: [], reviewedResourceTypes: ['goal-visualization'], requireApproved: false,
  scope: { label: 'Fresh independent complete unchanged P bodies in frozen two-goal private candidate; actual corrected traffic PNG and unchanged acceleration JPG inspected; AI candidate only', goalIds: ids },
}
out('P.two-independent-peer.portable.config.json', config)
const validationConfig = { ...config, semanticKindLedgerPath: 'review-output/Kind.two-independent-peer.partial-native-ledger.json', reviewPath: 'review-output/P.two-independent-peer.review.jsonl' }
writeFileSync(resolve(N, 'review-output/P.two-independent-peer.review.jsonl'), pJsonl)
writeFileSync(resolve(N, 'review-output/Kind.two-independent-peer.partial-native-ledger.json'), JSON.stringify(kindLedger, null, 2) + '\n')
writeFileSync(resolve(N, 'review-output/P.two-independent-peer.config.json'), JSON.stringify(validationConfig, null, 2) + '\n')
const fullNative = reviewPositiveGoalEvidenceConfig('review-output/P.two-independent-peer.config.json')
assert.deepEqual(fullNative.errors, [])
assert.deepEqual(fullNative.counts, { approved: 0, needsHumanReview: 2, rejected: 0 })
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const kindSchema = read(resolve(R, 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'))
const validateKind = ajv.compile({ ...kindSchema, oneOf: undefined, $ref: '#/$defs/semanticKindLedger' })
assert(validateKind(kindLedger), ajv.errorsText(validateKind.errors))

const previousGoalFields = baseline.PhysicsRows.map((r: any) => r.wholeCurrentGoal)
const frozenFieldChecks = goals.map((g: any, i: number) => {
  const old = previousGoalFields[i]
  const changes = Object.keys({ ...old, ...g }).filter(k => JSON.stringify(old[k]) !== JSON.stringify(g[k]))
  assert.deepEqual(changes.sort(), (i === 0 ? ['requires', 'resourceLinks'] : ['requires']).sort())
  return { goalId: g.id, changedTopLevelFieldsFromActualMain43: changes, profileBodyUnchanged: true }
})
const oldAsset = resolve(R, 'app/public/assets/goal-visualizations/physik', T, T + '.jpg')
const oldPrompt = resolve(R, 'curricula/DE/Gymnasium/visualizations/physik', T, 'prompt.de.md')
assert.equal(sha(readFileSync(oldAsset)), 'sha256:b32148fe300167591782bc6aef2e4dd7ae62fdc24e18ab3092ada282f66110a7')
assert.equal(sha(readFileSync(oldPrompt)), sha(readFileSync(resolve(M, 'curricula/DE/Gymnasium/visualizations/physik', T, 'prompt.de.md'))))
const inputBindings = {
  reviewedAtUTC: now, privateRoot: relative(M, R), actor, configuredModel: 'gpt-6.1-sol', configuredReasoning: 'ultra', servingModelBuild: 'unobserved',
  reportOnly: true, independentOfQualityAuthor: true, blind: false, modelDiverse: false, human: false,
  wholeCandidateLandscape: bind(resolve(R, landscapePath)), originalWholeP20: bind(resolve(R, pPath)),
  criteria: bind(resolve(R, criteriaPath)), frozenFieldChecks,
  nativeMethodFiles: ['app/scripts/goalBookModel.ts', 'app/scripts/positiveGoalEvidenceReview.ts', 'app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/goalVisualizationQaModel.ts', 'app/src/utils/goalVisualizationQaStatus.ts'].map(p => bind(resolve(R, p))),
  nativePValidationCopy: ['positiveGoalEvidenceReview.ts', 'positiveGoalEvidenceProfileModel.ts', 'goalEvidenceProfileModel.ts'].map(p => {
    assert.equal(sha(readFileSync(resolve(R, 'app/scripts', p))), sha(readFileSync(resolve(N, 'app/scripts', p))))
    return bind(resolve(N, 'app/scripts', p))
  }),
  retainedOldTrafficImage: bind(oldAsset), retainedOriginalTrafficPrompt: bind(oldPrompt),
  visualGenerationPrompt: bind(resolve(R, 'curricula/DE/Gymnasium/visualizations/physik', T, 'model-boundaries-v2/prompt.de.md')),
  goals: goals.map((g: any, i: number) => ({
    goalId: g.id, wholeGoal: g, exactGoalJsonSha256: sha(JSON.stringify(g)),
    originalPRecordLineSha256: sha(readFileSync(resolve(R, pPath), 'utf8').trim().split('\n').find((line: string) => JSON.parse(line).goalId === g.id)!),
    nativeGoalFingerprint: pRows[i].goalFingerprint,
    nativeReviewInputFingerprint: pRows[i].reviewInputFingerprint,
    nativeProfileFingerprint: pRows[i].profileFingerprint,
    nativeKindSourceFingerprint: kindRows[i].sourceFingerprint,
    completeNativeReviewInputPayload: positiveGoalEvidenceReviewInputPayload(g, criteriaHash, digests[i], 'curricularAtomic'),
    reviewedAssets: assets[i],
  })),
}
out('whole-input-and-native-bindings.actual.json', inputBindings)
const report = {
  reviewedAtUTC: now, actor, reportOnly: true,
  independence: { separateAgentFromQualityAuthor: true, priorNativeLedgerNotesSeen: true, blind: false, modelDiverse: false, configuredModel: 'gpt-6.1-sol', configuredReasoning: 'ultra', servingModelBuild: 'unobserved', human: false },
  authorityBoundary: 'Bounded fresh P/Kind/V report for the exact frozen two-goal private candidate. No source verification, Requires judgment, D review, semantic-atomicity A ledger, memory M, M7, consent, adoption, Main/Git write, release or human approval. Native Kind decisionStatus=authoritative is the schema-shaped proposed classification row, not a claim of adoption or human review.',
  decisions: [
    {
      goalId: T, positiveProfileDecision: 'keep', completeProfileBodyUnchanged: true,
      positiveProfileRationale: [
        'The complete modeling profile aligns its two required expectations, both complete bilingual case briefs and all three variation axes with interpreting and evaluating reaction/braking behavior under explicit simple-model conditions.',
        'The first case requires physical scaling explanations and a reserve-based judgment, rather than merely ranking the supplied numbers. The second changes both hazard geometry and braking conditions and requires locating maximum relative separation loss on a shared timeline.',
        'Supplied conversions, model values and margins bound the required work truthfully. Independent numerical derivation confirms 23.167438/70.447531 m stopping distances, 25.49/77.50 m upward-rounded 10%-margin minima, and 40.740741 m maximum following-gap loss with 45.75 m final minimum including 5 m reserve.',
        'For the following case, separation loss increases during lead braking and until the rear vehicle stops; the chosen terminal difference is therefore the actual maximum for this case. The supplied counterfactual no-collision continuation is explicitly identified, so an unsafe 40 m gap is not treated as a real collision-free run.',
        'Empirical model values and uncertainty are separated from the stipulated reserve criterion. A moving leader does not make the rear vehicle full stopping distance a universal following-gap rule. No unprovided arithmetic, equation algorithm or exact reviewed-image layout is necessary for the mandatory evidence.',
      ],
      semanticKindDecision: 'curricularAtomic', nativeSourceFingerprint: kindRows[0].sourceFingerprint,
      semanticKindRationale: 'One assessable subject-specific competence: use reaction/braking models and their limits to evaluate safe separation. Reaction and braking are coupled parts of the same stopping/safety judgment. The Context tag does not make this an orientation anchor; it has explicit observable content performance and is neither a cluster, exam endpoint, memory deck nor program unit.',
      visualizationDecision: 'approved_ai', reviewedAssetSha256: assets[0][0].public.sha256,
      visualizationRationale: visualNotes[T],
      materialLimitations: ['No source-fidelity or real-host classroom/road-safety validation was performed.', 'The image motivates one dry-road fixed-obstacle model and flags the moving-leader boundary. It does not depict the full shared-time following solution or prove learner understanding.'],
    },
    {
      goalId: A, positiveProfileDecision: 'keep', completeProfileBodyUnchanged: true,
      positiveProfileRationale: [
        'The complete representation profile joins constant acceleration, linear velocity change and quadratic position change with learner construction/translation of the three histories and explanation of signs, units, slopes and direction.',
        'The signed-displacement expectation is exercised through a reversing ramp cart. A supplied zero crossing and signed partial areas leave the learner to construct t-a/t-s histories and explain v=0 while a is nonzero, cancellation of displacement and accumulation of traveled distance.',
        'The braking case transfers the same representation model to a physically different validity regime: extending constant negative acceleration predicts reverse motion, which describes a ramp cart but ceases to describe ordinary braking after rest. This is a substantive model-boundary decision rather than another numerical substitution.',
        'Both full bilingual cases retain independent explanation/construction despite supplied support values. Variation axes cover signs/initial conditions, starting representation and model interval; the cases can be instantiated without the reviewed image. The two required expectations remain jointly interpretable as the one model-representation competence.',
      ],
      semanticKindDecision: 'curricularAtomic', nativeSourceFingerprint: kindRows[1].sourceFingerprint,
      semanticKindRationale: 'One assessable subject-specific competence: explain a constant-acceleration model consistently across t-a, t-v and t-s representations. The three graphs are linked representations of one physical model, not three unrelated routines. It is an ordinary content goal, not orientation, memory, an assessment endpoint, a cluster or a structural unit.',
      visualizationDecision: 'approved_ai', reviewedAssetSha256: assets[1][0].public.sha256,
      visualizationRationale: visualNotes[A],
      materialLimitations: ['No independent source-fidelity or human approval is asserted.', 'The existing image is one positive-acceleration-from-rest example. Signed and reversing cases require the separate learning/assessment work specified in P.'],
    },
  ],
  openMaterialIssuesInOwnedLanes: [], humanFieldsPreservedExactly: true,
}
out('whole-P-Kind-V-independent-decisions.actual.json', report)
out('native-validation.actual.json', {
  completedAtUTC: new Date().toISOString(),
  mode: 'Report-only; no Main or private candidate mutation',
  perRecordNativePositiveSemantics: { records: 2, errors },
  fullNativePositiveConfigCheck: { exactCopiedNativeSource: true, localValidationRoot: relative(M, N), counts: fullNative.counts, errors: fullNative.errors, reviewedResourceTypes: ['goal-visualization'] },
  nativeKindSchemaCheck: { valid: true, exactNativeSourceFingerprintComputedForEachGoal: true, partialLedgerOnly: true },
  nativeVisualChecks: { rows: 2, aiStatus: qaRows.map(r => ({ goalId: r.goalId, status: aiApprovalStatus(r), assetSha256: r.assetSha256 })), aiNormalizationMatches: true, nativeRowFieldSetsMatchExistingRows: true, humanFieldsPreservedExactly: true, canonicalPublicBackendHashesEqual: true },
  profileBodiesEqualOriginalP20: true, candidateGoalBytesUnchangedDuringReview: sha(readFileSync(resolve(R, landscapePath))) === sha(rawLandscapeBytes),
})
assert.equal(sha(readFileSync(resolve(R, landscapePath))), sha(rawLandscapeBytes))
console.log(JSON.stringify({ reviewId, counts: fullNative.counts, errors: fullNative.errors, bindings: pRows.map((p: any, i: number) => ({ goalId: p.goalId, goalFingerprint: p.goalFingerprint, reviewInputFingerprint: p.reviewInputFingerprint, profileFingerprint: p.profileFingerprint, sourceFingerprint: kindRows[i].sourceFingerprint, assetSha256: assets[i][0].public.sha256 })) }, null, 2))
