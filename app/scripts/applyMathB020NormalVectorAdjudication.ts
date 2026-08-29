import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  linkSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

// The bounded curriculum ledgers predate one shared TypeScript schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = {
  path: string
  bytes: string
  beforeSha256: string
  afterSha256: string
  mode: number
  state: 'before' | 'after'
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2)
  .filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const goalId = 'ec6447d1-97da-5b77-94ae-4973b43f094e'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const reviewedAt = '2026-08-29'
const reviewedAtIso = '2026-08-29T05:15:00.000Z'
const reviewer = 'codex-math-b020-normal-vector-adjudication-2026-08-29'
const expectedPlanSha256 = 'c00b08deb365573f562e2392c4c2a4921a0af385e968f70fd10ece220b2a7f10'
const publishedFileMode = 0o644

const beforeDescriptionDe =
  'Die lernende Person kann einen Normalenvektor zu einer Ebene bestimmen und seine Bedeutung für Orthogonalität und Lage interpretieren.'
const beforeDescriptionEn =
  'The learner can determine a normal vector of a plane and interpret its meaning for orthogonality and position.'
const finalDescriptionDe =
  'Die lernende Person kann einen von null verschiedenen Normalenvektor zu einer Ebene bestimmen, ihn als zu allen Richtungsvektoren der Ebene orthogonalen Vektor deuten und für die Beschreibung ihrer Orientierung nutzen.'
const finalDescriptionEn =
  'The learner can determine a nonzero normal vector of a plane, interpret it as a vector orthogonal to every direction vector in the plane, and use it to describe the plane\'s orientation.'
const titleDe = 'Normalenvektor einer Ebene bestimmen und nutzen'
const titleEn = 'Determine and use a normal vector of a plane'

const batchRoot = (
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/'
  + '2026-08-29/batch-020-q2-lines-planes-and-reverse-context-13-v1'
)
const roundPrefix = (
  'mathematik-rollout-v1-batch-020-q2-lines-planes-and-reverse-context-13-v1-'
  + '20260829-first-pass'
)
const paths = {
  config: `${batchRoot}.config.json`,
  batchManifest: `${batchRoot}/batch-manifest.json`,
  bookModel: `${batchRoot}/bundle/book-model.json`,
  bundleManifest: `${batchRoot}/bundle/manifest.json`,
  bundleReviewInput: `${batchRoot}/bundle/review-input.json`,
  bundleReviewInputJsonl: `${batchRoot}/bundle/review-input.jsonl`,
  dualSummary: `${batchRoot}/dual-summary.json`,
  roundARun: `${batchRoot}/round-a/results/${roundPrefix}-a.batch-001.run.json`,
  roundARecords: `${batchRoot}/round-a/results/${roundPrefix}-a.batch-001.records.jsonl`,
  roundBRun: `${batchRoot}/round-b/results/${roundPrefix}-b.batch-001.run.json`,
  roundBRecords: `${batchRoot}/round-b/results/${roundPrefix}-b.batch-001.records.jsonl`,
  adjudication: `${batchRoot}/third-adjudication/adjudication.json`,
  canonical:
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semanticKinds:
    'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomicity:
    'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  goalMemory:
    'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  visualQa:
    'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  visualReview:
    'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-batch-219.md',
  canonicalImage:
    `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.jpg`,
  publicImage:
    `app/public/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`,
  backendImage:
    `backend/src/main/resources/static/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`,
  prompt:
    `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/prompt.de.md`,
} as const

const expectedInputHashes: Record<string, string> = {
  [paths.config]: '8e735562e57cac117c8f488c92784a88af49fc7d7d633108b9c651d655b5ec9c',
  [paths.batchManifest]: 'feb0679cac4c95828779ee4e87c6122b9315eceaab722ded8bda27ac151389cc',
  [paths.bookModel]: '86d0ebccf27843e74824cb1919b2000d760a50ba48848e5d942f462b8be77402',
  [paths.bundleManifest]: '0bd631c7f73ed2ff7a3efcc88f6b4cea12aad336bac04d9342b516320c67eeff',
  [paths.bundleReviewInput]: 'ff15bdfac4f300f42270f773a3ffc8c39e8476d749996b20e8083d1b418a5452',
  [paths.bundleReviewInputJsonl]: 'b49b7c2468eaa917f473d024d5eca17a754166be70ef7a9106a0a5c0426cadd1',
  [paths.dualSummary]: 'efcb246292683bdcabfc4b5b4576ec7a9be7ff426bf5652474adac55999a492c',
  [paths.roundARun]: 'd609269a99fdf64d3cae0a9f2c66f6d2ff3dda80fa9fc76e0c86b49abd99306f',
  [paths.roundARecords]: '76e09b4b783e3111c41798c7f79f67a24e839683fef0a44dd57f3b9754d947ba',
  [paths.roundBRun]: '394f4dbb58dd0f343f0dd7a3036e5a2a999347ff8379ba5c6644a598e282bc53',
  [paths.roundBRecords]: '600079264d4960d749bd8d0eaf26891686559458c97a193f1b4a543d36474265',
  [paths.adjudication]: 'b44d6cb1bfa60251d0d6ce5266fd9e58b7ed6f6dc56a724a52ac7e02352d2839',
}
const protectedHashes: Record<string, string> = {
  [paths.canonicalImage]: '3bc44a3d365cc865e418893aa3e36a67b218271f0d2291b8e7bcfb275782cc4e',
  [paths.publicImage]: '3bc44a3d365cc865e418893aa3e36a67b218271f0d2291b8e7bcfb275782cc4e',
  [paths.backendImage]: '3bc44a3d365cc865e418893aa3e36a67b218271f0d2291b8e7bcfb275782cc4e',
  [paths.prompt]: '1879bc05ff536a645d5376bfbde9d63d25e825bfe3e1875e850cd37ffd2ace1f',
}
const expectedBeforeHashes: Record<string, string> = {
  [paths.canonical]: 'b0b9e06c17430e98748d69533091ff14cfb0fa7d1946a21d8ca698f61cb1af7c',
  [paths.semanticKinds]: '674fcbe3b671abdc02a48f63d57c90df7a04146303d13d9139477d4671092e5c',
  [paths.atomicity]: '940eb0635aaba72e7462fef95e8df7ce7a1c227472dcfdf97fa2705ded11c8cb',
  [paths.goalMemory]: '269a3d368804107de7ac3536023dd4e27b40e842e4898971cd06a34884c6da62',
  [paths.visualQa]: '1bffb5408c79c8d910977ce1d239b38fe387ddd0dc2e968153b6b80f88981f5b',
  [paths.visualReview]: 'ABSENT',
}
const expectedAfterHashes: Record<string, string> = {
  [paths.canonical]: '228a15eac60ec00257f25d021c1fa3ef93b873257e220b05d5756a878169f9d0',
  [paths.semanticKinds]: '87d8ed2cd0a0712303caee5bbcb24ca55211f24a20536cbc2d5eb7d002a5abd9',
  [paths.atomicity]: '1c9b8a66bb4ab6550db1f77126f716307b01d996cc5c4acd61119c8971e4f471',
  [paths.goalMemory]: '74e7c182a352cc26d12ae0b57ba2a7414c8da8ddcd18bc5123d76711d4821ff6',
  [paths.visualQa]: 'acfd282c9e9a988b5145b05967791e4498c7c44ff6a2b723dcdd2e829abfb7fe',
  [paths.visualReview]: 'e518e0b8ee1aa4e3f807a74a31419569143855325f7102ea03805db065bd7801',
}
const outputPaths = [
  paths.canonical,
  paths.semanticKinds,
  paths.atomicity,
  paths.goalMemory,
  paths.visualQa,
  paths.visualReview,
] as const

const absolute = (path: string): string => resolve(repoRoot, path)
const sha256 = (value: string | Uint8Array): string =>
  createHash('sha256').update(value).digest('hex')
const digest = (value: string | Uint8Array): string => `sha256:${sha256(value)}`
const readJson = (path: string): JsonRecord =>
  JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] =>
  readFileSync(absolute(path), 'utf8').split(/\r?\n/u)
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as JsonRecord)
const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`
const serializeJsonl = (records: JsonRecord[]): string =>
  `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const mode = (path: string): number => statSync(path).mode & 0o777
const exactArray = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left) === JSON.stringify(right)
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}
const normalizeText = (value: unknown): string =>
  String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonRecord)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}
const reviewFingerprint = (goal: JsonRecord, ruleVersion: string): string =>
  digest(stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText(goal.titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText(goal.descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText(goal.nodeKind),
  }))

const assertBoundInputs = (): void => {
  for (const [path, expected] of Object.entries({
    ...expectedInputHashes,
    ...protectedHashes,
  })) {
    assert(existsSync(absolute(path)), `Missing bound input: ${path}`)
    const actual = sha256(readFileSync(absolute(path)))
    assert(actual === expected, `Input drifted: ${path}; ${actual} != ${expected}`)
  }
}

const stagingPath = (path: string): string =>
  `${absolute(path)}.b020-normal-vector.staging`
const lockPath = absolute('app/scripts/.applyMathB020NormalVectorAdjudication.lock')
assert(!existsSync(lockPath), `Existing or stale lock: ${lockPath}`)
for (const path of outputPaths) {
  assert(!existsSync(stagingPath(path)), `Existing or stale staging: ${stagingPath(path)}`)
}
assertBoundInputs()

const config = readJson(paths.config)
const manifest = readJson(paths.batchManifest)
const dual = readJson(paths.dualSummary)
const adjudication = readJson(paths.adjudication)
assert(
  config.batchId === adjudication.batchId
    && manifest.batchId === adjudication.batchId
    && dual.goalCount === 13
    && adjudication.campaignGoalCount === 13
    && exactArray(adjudication.acceptedRevisionGoalIds, [goalId])
    && exactArray(adjudication.requiredFreshReviewGoalIds, [goalId])
    && adjudication.newStableClaimGoalIds.length === 11
    && exactArray(adjudication.preexistingOwnedGoalIds, [
      '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
    ])
    && adjudication.materialized === false
    && adjudication.noProgressClaim === true,
  'B020 adjudication identity, scope, ownership, or no-progress contract drifted',
)
const decision = (adjudication.decisions as JsonRecord[])
  .find((candidate) => candidate.goalId === goalId)
assert(
  decision?.resolutionDecision === 'adopt_round_b_revision_then_fresh_dual_review'
    && decision.roundA?.decision === 'revise'
    && decision.roundB?.decision === 'revise'
    && decision.finalText?.titleDe === titleDe
    && decision.finalText?.titleEn === titleEn
    && decision.finalText?.descriptionDe === finalDescriptionDe
    && decision.finalText?.descriptionEn === finalDescriptionEn,
  'B020 accepted normal-vector revision drifted',
)

const canonical = clone(readJson(paths.canonical))
assert(canonical.landscapeId === landscapeId, 'Unexpected Mathematics landscape')
const goal = (canonical.goals as JsonRecord[]).find((candidate) => candidate.id === goalId)
assert(goal, `${goalId}: canonical goal missing`)
assert(
  goal.title === titleDe
    && goal.titleEn === titleEn
    && (exactArray(
      [goal.description, goal.descriptionEn],
      [beforeDescriptionDe, beforeDescriptionEn],
    ) || exactArray(
      [goal.description, goal.descriptionEn],
      [finalDescriptionDe, finalDescriptionEn],
    ))
    && exactArray(goal.contains, [])
    && exactArray(goal.requires, ['9460c3ff-e72d-4107-bc73-087d217200aa'])
    && goal.semanticAtomic === true,
  `${goalId}: canonical identity, topology, or bounded text drifted`,
)
const beforeGoal = clone(goal)
beforeGoal.description = beforeDescriptionDe
beforeGoal.descriptionEn = beforeDescriptionEn
const finalGoal = clone(goal)
finalGoal.description = finalDescriptionDe
finalGoal.descriptionEn = finalDescriptionEn
const links = (goal.resourceLinks as JsonRecord[] | undefined) ?? []
assert(links.length === 1, `${goalId}: expected one retained visualization`)
const link = links[0]
const beforeAlt = `Didaktische Visualisierung zum Lernziel "${titleDe}". ${beforeDescriptionDe}`
const finalAlt = `Didaktische Visualisierung zum Lernziel "${titleDe}". ${finalDescriptionDe}`
assert(
  link.type === 'goal-visualization'
    && link.provider === 'Google Gemini / Nano Banana Pro (gemini-3-pro-image)'
    && link.url === `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`
    && link.title === `Visualisierung: ${titleDe}`
    && (link.altText === beforeAlt || link.altText === finalAlt),
  `${goalId}: retained Nano Banana Pro link drifted`,
)
const beforeLink = (beforeGoal.resourceLinks as JsonRecord[])[0]
const finalLink = (finalGoal.resourceLinks as JsonRecord[])[0]
beforeLink.altText = beforeAlt
finalLink.altText = finalAlt
goal.description = finalDescriptionDe
goal.descriptionEn = finalDescriptionEn
link.altText = finalAlt

const semanticKinds = clone(readJson(paths.semanticKinds))
const semanticKind = (semanticKinds.decisions as JsonRecord[])
  .find((candidate) => candidate.goalId === goalId)
assert(
  semanticKind?.semanticKind === 'curricularAtomic'
    && semanticKind.decisionStatus === 'authoritative',
  `${goalId}: semantic-kind authority drifted`,
)
const beforeSemanticKind = fingerprintSemanticKindSourceGoal(beforeGoal)
const finalSemanticKind = fingerprintSemanticKindSourceGoal(finalGoal)
assert(
  semanticKind.sourceFingerprint === beforeSemanticKind
    || semanticKind.sourceFingerprint === finalSemanticKind,
  `${goalId}: semantic-kind fingerprint outside bounded states`,
)
semanticKind.sourceFingerprint = finalSemanticKind

const atomicity = clone(readJsonl(paths.atomicity))
const memory = clone(readJsonl(paths.goalMemory))
const atomicityRecord = atomicity.find((candidate) => candidate.goalId === goalId)
const memoryRecord = memory.find((candidate) => candidate.goalId === goalId)
assert(
  atomicityRecord?.ruleVersion === 'semantic-atomicity-v1'
    && atomicityRecord.status === 'atomic'
    && atomicityRecord.semanticAtomic === true
    && exactArray(atomicityRecord.suggestedSplit, []),
  `${goalId}: atomicity decision drifted`,
)
assert(
  memoryRecord?.ruleVersion === 'memory-card-review-v1'
    && memoryRecord.status === 'no_memory_needed'
    && memoryRecord.memoryUseful === false,
  `${goalId}: memory decision drifted`,
)
for (const record of [atomicityRecord, memoryRecord]) {
  const before = reviewFingerprint(beforeGoal, record.ruleVersion)
  const after = reviewFingerprint(finalGoal, record.ruleVersion)
  assert(
    record.fingerprint === before || record.fingerprint === after,
    `${goalId}: ${record.ruleVersion} fingerprint outside bounded states`,
  )
  record.fingerprint = after
  record.reviewedAt = reviewedAt
  record.reviewer = reviewer
}
atomicityRecord.reason = (
  'B020-Review: Die Präzisierung auf einen von null verschiedenen, zu allen '
  + 'Ebenenrichtungen orthogonalen Vektor beschreibt weiterhin genau eine '
  + 'zusammenhängende und in Aufgaben prüfbare Kompetenz.'
)
memoryRecord.reason = (
  'B020-Review: Die Kompetenz wird durch Herleitung, Orthogonalitätsnachweis, '
  + 'geometrische Deutung und Transfer verankert; ein eigenes Memory-Deck ist '
  + 'weiterhin nicht erforderlich.'
)

const visualQa = clone(readJson(paths.visualQa))
const qa = (visualQa.records as JsonRecord[])
  .find((candidate) => candidate.goalId === goalId)
const assetDigest = `sha256:${protectedHashes[paths.canonicalImage]}`
assert(
  qa
    && qa.title === titleDe
    && (qa.description === beforeDescriptionDe || qa.description === finalDescriptionDe)
    && qa.visualizationState === 'available'
    && qa.assetSha256 === assetDigest
    && qa.aiApprovedAssetSha256 === assetDigest
    && qa.contentApprovedChatGpt === 'yes'
    && qa.umlautsCorrectChatGpt === 'yes'
    && qa.aiApproved === 'yes',
  `${goalId}: visualization QA identity or exact asset approval drifted`,
)
qa.description = finalDescriptionDe
qa.chatGptReviewedAt = reviewedAtIso
qa.chatGptReviewer = reviewer
qa.chatGptNotes = (
  'B020 compatibility review: The retained Nano Banana Pro image remains '
  + 'mathematically compatible. It shows a nonzero cross-product normal '
  + 'vector, verifies orthogonality to both spanning vectors, and depicts the '
  + 'normal direction perpendicular to the plane. It does not claim that the '
  + 'normal vector fixes the plane\'s absolute position.'
)
qa.aiReviewedAt = reviewedAtIso
qa.aiReviewer = reviewer
qa.aiNotes = qa.chatGptNotes

const visualReview = [
  '# Mathematik goal visualization review – Batch 219',
  '',
  'Review date: 2026-08-29',
  '',
  'Scope: exact compatibility recheck of the retained Nano Banana Pro asset after',
  'the bounded B020 normal-vector description correction. No image or historical',
  'generator-prompt byte is changed.',
  '',
  '| Goal ID | Decision | Asset SHA-256 | Concrete compatibility finding |',
  '|---|---|---|---|',
  `| \`${goalId}\` | \`keep_current_nano_banana_pro_bytes\` | \`${assetDigest}\` | The image computes a nonzero cross-product normal vector, verifies both required dot products, and shows the vector perpendicular to the plane. It does not assign the plane an absolute position from the normal vector alone. |`,
  '',
  'The canonical, public, and backend raster copies remain byte-identical. The',
  'historical Nano Banana Pro prompt remains byte-identical. Only the canonical',
  'bilingual goal description, derived fingerprints, resource alt text, and QA',
  'compatibility text are updated.',
  '',
].join('\n')

const outputs = new Map<string, string>([
  [paths.canonical, serializeJson(canonical)],
  [paths.semanticKinds, serializeJson(semanticKinds)],
  [paths.atomicity, serializeJsonl(atomicity)],
  [paths.goalMemory, serializeJsonl(memory)],
  [paths.visualQa, serializeJson(visualQa)],
  [paths.visualReview, visualReview],
])
assert(outputs.size === outputPaths.length, 'B020 output count drifted')
assert(exactArray([...outputs.keys()], outputPaths), 'B020 output boundary drifted')

const plan: PlannedFile[] = outputPaths.map((path) => {
  const bytes = outputs.get(path)!
  const beforeSha256 = expectedBeforeHashes[path]
  const afterSha256 = sha256(bytes)
  const expectedAfter = expectedAfterHashes[path]
  if (expectedAfter !== 'PENDING') {
    assert(afterSha256 === expectedAfter, `${path}: planned after hash drifted`)
  }
  const target = absolute(path)
  const currentSha256 = existsSync(target)
    ? sha256(readFileSync(target))
    : 'ABSENT'
  assert(
    currentSha256 === beforeSha256 || currentSha256 === afterSha256,
    `${path}: current file is outside exact before/after states`,
  )
  if (existsSync(target)) {
    assert(mode(target) === publishedFileMode, `${path}: expected mode 0644`)
  }
  return {
    path,
    bytes,
    beforeSha256,
    afterSha256,
    mode: publishedFileMode,
    state: currentSha256 === afterSha256 ? 'after' : 'before',
  }
})

const boundedPlan = {
  schemaVersion: 1,
  contract: 'math-b020-normal-vector-adjudication-plan-v1',
  adjudicationSha256: expectedInputHashes[paths.adjudication],
  inputBindings: Object.entries(expectedInputHashes)
    .sort(([left], [right]) => left.localeCompare(right, 'en'))
    .map(([path, hash]) => ({ path, sha256: hash })),
  protectedByteBindings: Object.entries(protectedHashes)
    .sort(([left], [right]) => left.localeCompare(right, 'en'))
    .map(([path, hash]) => ({ path, sha256: hash })),
  outputBindings: plan.map(({ path, beforeSha256, afterSha256, mode: fileMode }) => ({
    path,
    beforeSha256,
    afterSha256,
    mode: fileMode,
  })),
  revisedGoalId: goalId,
  finalText: { titleDe, titleEn, descriptionDe: finalDescriptionDe, descriptionEn: finalDescriptionEn },
  immutableGoalFields: {
    id: goalId,
    titleDe,
    titleEn,
    contains: [],
    requires: ['9460c3ff-e72d-4107-bc73-087d217200aa'],
  },
  progressContract: {
    strictProgressGranted: false,
    freshIndependentDualReviewRequired: true,
    newStableB020ClaimsHandledSeparately: 11,
    preexistingB018ClaimNotDuplicated: '858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
  },
  exclusions: [
    'all other goal descriptions, IDs, titles, contains, requires, and structure',
    'visualization and historical prompt bytes',
    'mappings, composition views, provenance, assessments, cards, and decks',
    'B020 resolutions, evidence candidates, central ownership, and progress counts',
    'OpenAI V1 package, MCP, OAuth, tools, schemas, UI, fixtures, and freeze records',
  ],
}
const planSha256 = sha256(stableJson(boundedPlan))

console.log(`MODE ${writeMode ? 'WRITE' : checkMode ? 'CHECK' : 'PLAN'}`)
console.log(`PLAN_SHA256 ${planSha256}`)
console.log(
  'SCOPE descriptions=1 semanticKinds=1 atomicity=1 memory=1 visualQa=1 '
  + 'visualReview=1 images=0 prompts=0 topology=0 progress=0 outputs=6',
)
for (const item of plan) {
  console.log(
    `${item.state === 'after' ? 'KEEP' : 'UPDATE'} ${item.path} `
    + `${item.beforeSha256} -> ${item.afterSha256}`,
  )
}

if (checkMode) {
  assert(
    Object.values(expectedAfterHashes).every((hash) => hash !== 'PENDING'),
    'CHECK blocked: exact after hashes are PENDING',
  )
  assert(expectedPlanSha256 !== 'PENDING', 'CHECK blocked: plan pin is PENDING')
  assert(planSha256 === expectedPlanSha256, 'CHECK plan pin drifted')
  assert(plan.every(({ state }) => state === 'after'), 'CHECK requires exact after-state')
  assertBoundInputs()
  console.log('CHECK PASS')
} else if (writeMode) {
  assert(
    Object.values(expectedAfterHashes).every((hash) => hash !== 'PENDING'),
    'WRITE blocked: exact after hashes are PENDING',
  )
  assert(expectedPlanSha256 !== 'PENDING', 'WRITE blocked: plan pin is PENDING')
  assert(planSha256 === expectedPlanSha256, 'WRITE plan pin drifted')
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  const lockPayload = `pid=${process.pid}\nplan=${planSha256}\n`
  let lockOwned = false
  let activeStaging: string | undefined
  try {
    writeFileSync(lockPath, lockPayload, { flag: 'wx', mode: 0o600 })
    lockOwned = true
    assert(mode(lockPath) === 0o600, 'B020 write-lock mode drifted')
    assertBoundInputs()
    for (const item of plan) {
      const target = absolute(item.path)
      const current = existsSync(target) ? sha256(readFileSync(target)) : 'ABSENT'
      const expected = item.state === 'before' ? item.beforeSha256 : item.afterSha256
      assert(current === expected, `${item.path}: drifted before lock-bound write`)
    }
    for (const item of plan.filter(({ state }) => state === 'before')) {
      const target = absolute(item.path)
      activeStaging = stagingPath(item.path)
      const current = existsSync(target) ? sha256(readFileSync(target)) : 'ABSENT'
      assert(current === item.beforeSha256, `${item.path}: before-state drifted`)
      writeFileSync(activeStaging, item.bytes, { flag: 'wx', mode: item.mode })
      assert(mode(activeStaging) === item.mode, `${item.path}: staging mode drifted`)
      assert(
        sha256(readFileSync(activeStaging)) === item.afterSha256,
        `${item.path}: staging hash drifted`,
      )
      const recheck = existsSync(target) ? sha256(readFileSync(target)) : 'ABSENT'
      assert(recheck === item.beforeSha256, `${item.path}: target changed during staging`)
      if (item.beforeSha256 === 'ABSENT') {
        linkSync(activeStaging, target)
        rmSync(activeStaging)
      } else {
        renameSync(activeStaging, target)
      }
      activeStaging = undefined
      assert(sha256(readFileSync(target)) === item.afterSha256, `${item.path}: publish failed`)
      assert(mode(target) === item.mode, `${item.path}: published mode drifted`)
    }
    assertBoundInputs()
    console.log('WRITE PASS')
  } finally {
    if (activeStaging && existsSync(activeStaging)) rmSync(activeStaging)
    if (lockOwned) {
      assert(
        readFileSync(lockPath, 'utf8') === lockPayload,
        'B020 write-lock ownership changed',
      )
      rmSync(lockPath)
    }
  }
} else {
  console.log('PLAN ONLY; no files written.')
}
