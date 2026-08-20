import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import {
  normalizeCanonicalLandscape,
  resolveCanonicalNodeType,
  type CanonicalAuthoringGoal,
} from '../src/utils/authoring/canonicalAuthoring'
import {
  compileCompositionView,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { parseSubjectDurationModelPolicy } from './goalBookModel'

type SemanticKind =
  | 'curricularAtomic'
  | 'curricularArea'
  | 'practiceAssessment'
  | 'programStructure'
  | 'memory'
  | 'runtimeSupport'
  | 'orientation'

interface SemanticKindDecision {
  goalId: string
  sourceFingerprint: string
  semanticKind: SemanticKind
  decisionStatus: string
  decisionBasis: string
}

interface SemanticKindLedger {
  documentType: string
  ledgerFormatVersion: number
  ledgerId: string
  profileId: string
  profileVersion: string
  sourceLandscapeId: string
  sourceLandscapePath: string
  sourceFingerprintContractId: string
  reviewMethod: string
  counts: Record<SemanticKind | 'total', number>
  decisions: SemanticKindDecision[]
}

interface AtomicityReviewRecord {
  schemaVersion: number
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  fingerprint: string
  status: string
  semanticAtomic: boolean | null
}

interface SourceFingerprintContract {
  contractId: string
  algorithm: string
  domain: string
  canonicalJsonProfile: string
  canonicalJsonProfileVersion: string
  canonicalJsonProfilePath: string
  canonicalJsonProfileSha256: string
  pointers: string[]
}

interface PhysicsDurationDecision {
  subject?: string
  jurisdiction?: string
  stage?: string
  sourceExtractionPath?: string
  status?: string
  decision?: string
  durationModels?: string[]
  learnerFacingProjection?: string
  compositionViewIds?: string[]
  evidenceSources?: string[]
  rationale?: string
}

interface SourceManifest {
  schemaVersion: number
  manifestId: string
  landscapeId: string
  navigationOwnership: string
  expectedJurisdictions: string[]
  durationModelPolicyPath: string
  expectedCurricularAtomicGoalCount: number
  sourcePaths: string[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const LANDSCAPE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const ATOMICITY_CONFIG_PATH = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.config.json'
const ATOMICITY_REVIEW_PATH = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl'
const LEDGER_PATH = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const MATH_PROFILE_PATH = 'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json'
const MATH_LANDSCAPE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const LEDGER_SCHEMA_PATH = 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'
const SOURCE_MANIFEST_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-source-manifest.schema.json'
const SOURCE_MANIFEST_PATH = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
const CONFIG_PATH = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json'
const DURATION_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/gymnasium-physics-duration-model-policy.json'
const SHARED_DURATION_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
const COMPOSITION_VIEW_DIRECTORY = 'curricula/DE/Gymnasium/composition-views/physik'

const EXPECTED_JURISDICTIONS = [
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
] as const

const EXPECTED_COUNTS: SemanticKindLedger['counts'] = {
  curricularAtomic: 426,
  curricularArea: 76,
  practiceAssessment: 75,
  programStructure: 1,
  memory: 5,
  runtimeSupport: 4,
  orientation: 1,
  total: 588,
}

const EXPECTED_DURATION_DECISIONS = new Map<string, {
  stage: 'SekI' | 'SekI+SekII'
  decision: 'single-duration-source' | 'duration-neutral-projection'
  durationModels: Array<'G8' | 'G9'>
}>([
  ['DE-BB', { stage: 'SekI+SekII', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-BE', { stage: 'SekI+SekII', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-BW', { stage: 'SekI', decision: 'duration-neutral-projection', durationModels: ['G8', 'G9'] }],
  ['DE-BY', { stage: 'SekI+SekII', decision: 'single-duration-source', durationModels: ['G9'] }],
  ['DE-HB', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-HE', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G9'] }],
  ['DE-HH', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-MV', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-NI', { stage: 'SekI+SekII', decision: 'single-duration-source', durationModels: ['G9'] }],
  ['DE-NW', { stage: 'SekI+SekII', decision: 'duration-neutral-projection', durationModels: ['G8', 'G9'] }],
  ['DE-RP', { stage: 'SekI+SekII', decision: 'duration-neutral-projection', durationModels: ['G8', 'G9'] }],
  ['DE-SH', { stage: 'SekI+SekII', decision: 'duration-neutral-projection', durationModels: ['G8', 'G9'] }],
  ['DE-SL', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G9'] }],
  ['DE-SN', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-ST', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
  ['DE-TH', { stage: 'SekI', decision: 'single-duration-source', durationModels: ['G8'] }],
])

const EXPECTED_SHARED_PHYSICS_JURISDICTIONS = [
  'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH',
  'DE-MV', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
] as const

const readJson = <T>(repositoryPath: string): T => (
  JSON.parse(readFileSync(resolve(repoRoot, repositoryPath), 'utf8')) as T
)

const readJsonLines = <T>(repositoryPath: string): T[] => (
  readFileSync(resolve(repoRoot, repositoryPath), 'utf8')
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T)
)

const compareCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0) ?? 0)
  const rightPoints = Array.from(right, (value) => value.codePointAt(0) ?? 0)
  const length = Math.min(leftPoints.length, rightPoints.length)
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index]
  }
  return leftPoints.length - rightPoints.length
}

const canonicalJson = (value: unknown): string => {
  if (value === null) return 'null'
  if (typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number') {
    assert(Number.isFinite(value), 'canonical JSON rejects non-finite numbers')
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  assert.equal(typeof value, 'object', 'canonical JSON received an unsupported value')
  assert(value, 'canonical JSON received undefined')
  const members = Object.keys(value as Record<string, unknown>)
    .sort(compareCodePoints)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`)
  return `{${members.join(',')}}`
}

const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')

const sourceFingerprint = (
  goal: Record<string, unknown>,
  contract: SourceFingerprintContract,
): string => {
  const fields = contract.pointers.map((pointer) => {
    assert.match(pointer, /^\/[A-Za-z]+$/u, `unsupported source-fingerprint pointer ${pointer}`)
    const key = pointer.slice(1)
    if (!Object.prototype.hasOwnProperty.call(goal, key)) return { path: pointer, state: 'missing' }
    let value = structuredClone(goal[key])
    if (pointer === '/tags') {
      assert(Array.isArray(value) && value.every((entry) => typeof entry === 'string'), `invalid tags on ${String(goal.id)}`)
      assert.equal(new Set(value).size, value.length, `duplicate tags on ${String(goal.id)}`)
      value = [...value].sort(compareCodePoints)
    }
    return { path: pointer, state: 'value', value }
  })
  return `sha256:${sha256(canonicalJson({ domain: contract.domain, fields }))}`
}

const normalizeAtomicityText = (value: unknown): string => String(value ?? '')
  .normalize('NFKC')
  .replace(/\s+/gu, ' ')
  .trim()

const stableAtomicityJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableAtomicityJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableAtomicityJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const atomicityFingerprint = (goal: CanonicalAuthoringGoal, ruleVersion: string): string => {
  const dimensionTags = goal.dimensionTags as Record<string, unknown> | undefined
  const payload = {
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeAtomicityText(goal.title),
    titleEn: normalizeAtomicityText(goal.titleEn),
    description: normalizeAtomicityText(goal.description),
    descriptionEn: normalizeAtomicityText(goal.descriptionEn),
    phase: normalizeAtomicityText(dimensionTags?.phase),
    area: normalizeAtomicityText(dimensionTags?.area),
    topicCode: normalizeAtomicityText(dimensionTags?.topicCode),
    nodeKind: normalizeAtomicityText(goal.nodeKind),
  }
  return `sha256:${sha256(stableAtomicityJson(payload))}`
}

const explicitClassification = (
  goal: CanonicalAuthoringGoal,
  reviewedAtomicGoalIds: ReadonlySet<string>,
  goalsById: ReadonlyMap<string, CanonicalAuthoringGoal>,
  parentIdsByChild: ReadonlyMap<string, string[]>,
): Pick<SemanticKindDecision, 'semanticKind' | 'decisionBasis'> => {
  if (reviewedAtomicGoalIds.has(goal.id)) {
    return {
      semanticKind: 'curricularAtomic',
      decisionBasis: 'reviewed-current-pilot-curricular-atomic',
    }
  }
  if (
    goal.type === 'cluster'
    && goal.contains.length > 0
  ) {
    if (goal.tags?.includes('root')) {
      return {
        semanticKind: 'programStructure',
        decisionBasis: 'reviewed-current-pilot-program-structure',
      }
    }
    if ((goal.release as { kind?: string } | undefined)?.kind === 'offer') {
      return {
        semanticKind: 'practiceAssessment',
        decisionBasis: 'reviewed-current-pilot-practice-assessment',
      }
    }
    const parentGoals = (parentIdsByChild.get(goal.id) ?? [])
      .map((goalId) => goalsById.get(goalId))
    if (parentGoals.some((parent) => (
      (parent?.release as { kind?: string } | undefined)?.kind === 'offer'
    ))) {
      return {
        semanticKind: 'runtimeSupport',
        decisionBasis: 'reviewed-current-pilot-runtime-support',
      }
    }
    if (goal.contains.every((goalId) => goalsById.get(goalId)?.examData !== undefined)) {
      return {
        semanticKind: 'practiceAssessment',
        decisionBasis: 'reviewed-current-pilot-practice-assessment',
      }
    }
    return {
      semanticKind: 'curricularArea',
      decisionBasis: 'reviewed-current-pilot-curricular-area',
    }
  }
  if (
    goal.type === 'atomic'
    && goal.contains.length === 0
    && goal.examData !== undefined
    && goal.nodeKind === undefined
  ) {
    return {
      semanticKind: 'practiceAssessment',
      decisionBasis: 'reviewed-current-pilot-practice-assessment',
    }
  }
  if (
    goal.type === 'atomic'
    && goal.contains.length === 0
    && goal.examData === undefined
    && goal.nodeKind === 'memory'
  ) {
    return {
      semanticKind: 'memory',
      decisionBasis: 'reviewed-current-pilot-memory',
    }
  }
  if (
    goal.type === 'atomic'
    && goal.contains.length === 0
    && goal.examData === undefined
    && goal.nodeKind === undefined
    && goal.tags?.includes('Motivation')
    && goal.tags.includes('Orientation')
  ) {
    return {
      semanticKind: 'orientation',
      decisionBasis: 'reviewed-current-pilot-orientation',
    }
  }
  assert.fail(`goal ${goal.id} has no explicit authoritative Physics semantic-kind basis`)
}

const collectAtomicGoalIds = (
  nodes: CompiledCompositionPreviewNode[],
  goalById: ReadonlyMap<string, CanonicalAuthoringGoal>,
): Set<string> => {
  const result = new Set<string>()
  const visit = (node: CompiledCompositionPreviewNode) => {
    if (node.kind === 'goal' && node.sourceGoalId) {
      const goal = goalById.get(node.sourceGoalId)
      assert(goal, `compiled view references unknown goal ${node.sourceGoalId}`)
      if (resolveCanonicalNodeType(goal) === 'atomic') result.add(goal.id)
    }
    node.children.forEach(visit)
  }
  nodes.forEach(visit)
  return result
}

const rawLandscape = readJson<Record<string, unknown> & { goals: Array<Record<string, unknown>> }>(LANDSCAPE_PATH)
const landscape = normalizeCanonicalLandscape(rawLandscape)
assert.equal(landscape.landscapeId, LANDSCAPE_ID)
assert.equal(rawLandscape.subject, 'Physik')
assert.equal(landscape.goals.length, EXPECTED_COUNTS.total)
const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const parentIdsByChild = new Map<string, string[]>()
landscape.goals.forEach((goal) => goal.contains.forEach((childId) => {
  const parents = parentIdsByChild.get(childId) ?? []
  parents.push(goal.id)
  parentIdsByChild.set(childId, parents)
}))
const rawGoalById = new Map(rawLandscape.goals.map((goal) => [String(goal.id), goal]))
assert.equal(goalById.size, EXPECTED_COUNTS.total, 'canonical Physics goal IDs must be unique')

const atomicityConfig = readJson<{
  reviewId: string
  ruleVersion: string
  landscapeId: string
  landscapePath: string
  reviewPath: string
}>(ATOMICITY_CONFIG_PATH)
assert.equal(atomicityConfig.landscapeId, LANDSCAPE_ID)
assert.equal(atomicityConfig.landscapePath, LANDSCAPE_PATH)
assert.equal(atomicityConfig.reviewPath, ATOMICITY_REVIEW_PATH)
const atomicityRecords = readJsonLines<AtomicityReviewRecord>(ATOMICITY_REVIEW_PATH)
assert.equal(atomicityRecords.length, EXPECTED_COUNTS.curricularAtomic)
const reviewedAtomicGoalIds = new Set<string>()
atomicityRecords.forEach((record) => {
  assert.equal(record.schemaVersion, 1)
  assert.equal(record.reviewId, atomicityConfig.reviewId)
  assert.equal(record.ruleVersion, atomicityConfig.ruleVersion)
  assert.equal(record.landscapeId, LANDSCAPE_ID)
  assert.equal(record.status, 'atomic', `${record.goalId} is not an approved atomic goal`)
  assert.equal(record.semanticAtomic, true, `${record.goalId} is not marked semanticAtomic`)
  assert(!reviewedAtomicGoalIds.has(record.goalId), `duplicate atomicity record ${record.goalId}`)
  const goal = goalById.get(record.goalId)
  assert(goal, `obsolete atomicity record ${record.goalId}`)
  assert.equal(record.fingerprint, atomicityFingerprint(goal, record.ruleVersion), `stale atomicity record ${record.goalId}`)
  reviewedAtomicGoalIds.add(record.goalId)
})

const mathProfile = readJson<{
  semanticKindDecisions: { sourceFingerprint: SourceFingerprintContract }
}>(MATH_PROFILE_PATH)
const fingerprintContract = mathProfile.semanticKindDecisions.sourceFingerprint
assert.equal(fingerprintContract.contractId, 'semantic-kind-source-fingerprint-v1')
assert.equal(fingerprintContract.algorithm, 'sha-256-over-skillpilot-canonical-json-v1')
assert.equal(fingerprintContract.domain, 'skillpilot:semantic-kind-source-fingerprint:v1')
assert.equal(fingerprintContract.canonicalJsonProfile, 'semantic-normal-form-v1')
assert.equal(fingerprintContract.canonicalJsonProfileVersion, '1.0.0')
assert.equal(
  fingerprintContract.canonicalJsonProfileSha256,
  sha256(readFileSync(resolve(repoRoot, fingerprintContract.canonicalJsonProfilePath), 'utf8')),
)
const mathLandscape = readJson<{ goals: Array<Record<string, unknown>> }>(MATH_LANDSCAPE_PATH)
const mathGoalIds = new Set(mathLandscape.goals.map(({ id }) => String(id)))
const foreignContainsEdges: Array<{ ownerId: string; goalId: string }> = []
const foreignRequiresEdges: Array<{ ownerId: string; goalId: string }> = []
rawLandscape.goals.forEach((goal) => {
  for (const relation of ['contains', 'requires'] as const) {
    const references = Array.isArray(goal[relation]) ? goal[relation] as unknown[] : []
    references.forEach((reference) => {
      const goalId = typeof reference === 'string'
        ? reference
        : String((reference as { goalId?: unknown }).goalId ?? '')
      if (rawGoalById.has(goalId)) return
      const edge = { ownerId: String(goal.id), goalId }
      if (relation === 'contains') foreignContainsEdges.push(edge)
      else foreignRequiresEdges.push(edge)
    })
  }
})
assert.deepEqual(foreignContainsEdges, [], 'Physics canonical contains must remain subject-internal')
assert.equal(foreignRequiresEdges.length, 10, 'Physics must retain exactly ten cross-subject prerequisites')
assert.equal(
  new Set(foreignRequiresEdges.map(({ goalId }) => goalId)).size,
  8,
  'Physics cross-subject prerequisites must resolve to exactly eight mathematics goals',
)
foreignRequiresEdges.forEach(({ goalId }) => {
  assert(mathGoalIds.has(goalId), `Physics cross-subject prerequisite ${goalId} is not canonical mathematics`)
})
assert(!foreignRequiresEdges.some(({ goalId }) => goalId === '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'))
const mathFixtureGoal = mathLandscape.goals.find(({ id }) => id === '000b2764-c5d9-5521-b39e-fc15a4aa72e2')
assert(mathFixtureGoal, 'known mathematics source-fingerprint fixture is missing')
assert.equal(
  sourceFingerprint(mathFixtureGoal, fingerprintContract),
  'sha256:3f3ae251b2b2d66a0dc22eb0ec76584c9c3b5902a0ea9376aae5f3accc5a1d0a',
  'semantic-kind source-fingerprint implementation drifted from the reviewed mathematics fixture',
)

const ledger = readJson<SemanticKindLedger>(LEDGER_PATH)
const ledgerSchema = readJson<Record<string, unknown>>(LEDGER_SCHEMA_PATH)
const ledgerAjv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ledgerAjv)
const validateLedger = ledgerAjv.compile(ledgerSchema)
assert(validateLedger(ledger), ledgerAjv.errorsText(validateLedger.errors, { separator: '; ' }))
assert.equal(ledger.documentType, 'semantic-kind-ledger')
assert.equal(ledger.ledgerFormatVersion, 1)
assert.equal(ledger.ledgerId, 'de-gymnasium-physik-semantic-kinds-v1')
assert.equal(
  ledger.profileId,
  ledger.ledgerId,
  'Physics profileId is the embedded decision-profile identity, not a phantom ontology profile',
)
assert.equal(ledger.profileVersion, '1.0.0')
assert.equal(ledger.sourceLandscapeId, LANDSCAPE_ID)
assert.equal(ledger.sourceLandscapePath, LANDSCAPE_PATH)
assert.equal(ledger.sourceFingerprintContractId, fingerprintContract.contractId)
assert.equal(ledger.reviewMethod, 'one-time-reviewed-pilot-migration-v1')
assert.deepEqual(ledger.counts, EXPECTED_COUNTS)
assert.equal(ledger.decisions.length, EXPECTED_COUNTS.total)
assert.deepEqual(
  ledger.decisions.map(({ goalId }) => goalId),
  [...ledger.decisions.map(({ goalId }) => goalId)].sort(compareCodePoints),
  'Physics semantic-kind decisions must stay sorted by goal ID',
)
const decisionByGoalId = new Map<string, SemanticKindDecision>()
const actualCounts: SemanticKindLedger['counts'] = {
  curricularAtomic: 0,
  curricularArea: 0,
  practiceAssessment: 0,
  programStructure: 0,
  memory: 0,
  runtimeSupport: 0,
  orientation: 0,
  total: 0,
}
ledger.decisions.forEach((decision) => {
  assert(!decisionByGoalId.has(decision.goalId), `duplicate semantic-kind decision ${decision.goalId}`)
  const goal = goalById.get(decision.goalId)
  const rawGoal = rawGoalById.get(decision.goalId)
  assert(goal && rawGoal, `obsolete semantic-kind decision ${decision.goalId}`)
  assert.equal(decision.decisionStatus, 'authoritative')
  assert.equal(decision.sourceFingerprint, sourceFingerprint(rawGoal, fingerprintContract), `stale source fingerprint ${decision.goalId}`)
  assert.deepEqual(
    { semanticKind: decision.semanticKind, decisionBasis: decision.decisionBasis },
    explicitClassification(goal, reviewedAtomicGoalIds, goalById, parentIdsByChild),
    `semantic-kind decision lacks its explicit reviewed Physics basis for ${decision.goalId}`,
  )
  actualCounts[decision.semanticKind] += 1
  actualCounts.total += 1
  decisionByGoalId.set(decision.goalId, decision)
})
assert.equal(decisionByGoalId.size, goalById.size, 'semantic-kind ledger must bind every Physics goal exactly once')
assert.deepEqual(actualCounts, EXPECTED_COUNTS)

const config = readJson<Record<string, unknown>>(CONFIG_PATH)
assert.deepEqual(config, {
  schemaVersion: 1,
  bookId: 'de-gym-physik-bundesweit',
  title: 'Lernzielbuch Physik – Gymnasium bundesweit',
  landscapePath: LANDSCAPE_PATH,
  compositionViewManifestPath: SOURCE_MANIFEST_PATH,
  semanticKindLedgerPath: LEDGER_PATH,
  goalVisualizationQaPath: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
  externalLandscapePaths: [MATH_LANDSCAPE_PATH],
  publicationMode: 'review',
  atlasBaseUrl: 'https://skillpilot.com/lernzielbuch',
  evidenceReviewPaths: [],
  outputPath: 'tmp/goal-books/de-gym-physik-bundesweit.book-model.json',
})

const sourceManifest = readJson<SourceManifest>(SOURCE_MANIFEST_PATH)
const sourceManifestSchema = readJson<Record<string, unknown>>(SOURCE_MANIFEST_SCHEMA_PATH)
const sourceManifestAjv = new Ajv2020({ allErrors: true, strict: true })
const validateSourceManifest = sourceManifestAjv.compile(sourceManifestSchema)
assert(validateSourceManifest(sourceManifest), sourceManifestAjv.errorsText(validateSourceManifest.errors, { separator: '; ' }))
assert.equal(sourceManifest.manifestId, 'de-gym-physics-national-atlas')
assert.equal(sourceManifest.landscapeId, LANDSCAPE_ID)
assert.equal(sourceManifest.navigationOwnership, 'common-topic-suffix-v1')
assert.deepEqual(sourceManifest.expectedJurisdictions, EXPECTED_JURISDICTIONS)
assert.equal(sourceManifest.durationModelPolicyPath, DURATION_POLICY_PATH)
assert.equal(sourceManifest.expectedCurricularAtomicGoalCount, EXPECTED_COUNTS.curricularAtomic)
assert.equal(sourceManifest.sourcePaths.length, 64)
assert.deepEqual(
  sourceManifest.sourcePaths,
  [...sourceManifest.sourcePaths].sort(compareCodePoints),
  'Physics atlas source paths must stay sorted',
)
const discoveredStateViewPaths = readdirSync(resolve(repoRoot, COMPOSITION_VIEW_DIRECTORY))
  .filter((fileName) => /^(?:de-[a-z]{2})-(?:gk|lk|sekii-gk|sekii-lk)\.view\.json$/u.test(fileName))
  .map((fileName) => `${COMPOSITION_VIEW_DIRECTORY}/${fileName}`)
  .sort(compareCodePoints)
assert.deepEqual(sourceManifest.sourcePaths, discoveredStateViewPaths, 'Physics atlas manifest must bind all and only the 64 state views')

const landscapeWithSemanticKinds = {
  ...landscape,
  goals: landscape.goals.map((goal) => ({
    ...goal,
    semanticKind: decisionByGoalId.get(goal.id)?.semanticKind,
  })),
}
const semanticGoalById = new Map(landscapeWithSemanticKinds.goals.map((goal) => [goal.id, goal]))
const atlasCurricularAtomicGoalIds = new Set<string>()
const sourceViews: Array<{
  viewId: string
  jurisdiction: string
  stage: string
  courseProfile: string | null
  durationModel: string | null
}> = []
const roleCountByJurisdiction = new Map<string, Set<string>>()
sourceManifest.sourcePaths.forEach((sourcePath) => {
  assert(existsSync(resolve(repoRoot, sourcePath)), `missing Physics atlas source ${sourcePath}`)
  const view = normalizeCompositionView(readJson(sourcePath))
  assert.equal(view.landscapeId, LANDSCAPE_ID)
  assert(EXPECTED_JURISDICTIONS.includes(view.scope.jurisdiction as typeof EXPECTED_JURISDICTIONS[number]))
  assert(view.scope.stage === 'CrossStage' || view.scope.stage === 'SekII')
  assert(view.scope.courseProfile === 'GK' || view.scope.courseProfile === 'LK')
  assert.equal(view.scope.durationModel, undefined, `${view.viewId} must stay duration-neutral`)
  const expectedRole = sourcePath.endsWith('-sekii-gk.view.json')
    ? 'SekII:GK'
    : sourcePath.endsWith('-sekii-lk.view.json')
      ? 'SekII:LK'
      : sourcePath.endsWith('-gk.view.json')
        ? 'CrossStage:GK'
        : 'CrossStage:LK'
  assert.equal(`${view.scope.stage}:${view.scope.courseProfile}`, expectedRole, `${sourcePath} has the wrong state-view role`)
  const roleSet = roleCountByJurisdiction.get(view.scope.jurisdiction!) ?? new Set<string>()
  assert(!roleSet.has(expectedRole), `${view.scope.jurisdiction} has duplicate ${expectedRole} views`)
  roleSet.add(expectedRole)
  roleCountByJurisdiction.set(view.scope.jurisdiction!, roleSet)
  const compilation = compileCompositionView(view, landscapeWithSemanticKinds)
  const errors = compilation.findings.filter(({ severity }) => severity === 'error')
  assert.deepEqual(errors, [], `invalid Physics atlas source ${sourcePath}`)
  collectAtomicGoalIds(compilation.compiledRootNodes, semanticGoalById).forEach((goalId) => {
    if (decisionByGoalId.get(goalId)?.semanticKind === 'curricularAtomic') {
      atlasCurricularAtomicGoalIds.add(goalId)
    }
  })
  sourceViews.push({
    viewId: view.viewId,
    jurisdiction: view.scope.jurisdiction!,
    stage: view.scope.stage!,
    courseProfile: view.scope.courseProfile ?? null,
    durationModel: view.scope.durationModel ?? null,
  })
})
EXPECTED_JURISDICTIONS.forEach((jurisdiction) => {
  assert.deepEqual(
    [...(roleCountByJurisdiction.get(jurisdiction) ?? [])].sort(compareCodePoints),
    ['CrossStage:GK', 'CrossStage:LK', 'SekII:GK', 'SekII:LK'],
    `${jurisdiction} must contribute exactly four Physics atlas roles`,
  )
})
assert.equal(atlasCurricularAtomicGoalIds.size, EXPECTED_COUNTS.curricularAtomic)
assert.deepEqual(
  [...reviewedAtomicGoalIds].filter((goalId) => !atlasCurricularAtomicGoalIds.has(goalId)),
  [],
  'all reviewed curricular Physics atoms must be visible in the nationwide atlas union',
)

const durationPolicy = readJson<{
  schemaVersion: number
  updatedAt: string
  decisions: PhysicsDurationDecision[]
}>(DURATION_POLICY_PATH)
assert.equal(durationPolicy.schemaVersion, 1)
assert.equal(durationPolicy.updatedAt, '2026-08-20')
const physicsDurationDecisions = durationPolicy.decisions.filter(({ subject }) => subject === 'Physik')
assert.equal(physicsDurationDecisions.length, EXPECTED_JURISDICTIONS.length)
const physicsDurationDecisionByJurisdiction = new Map<string, PhysicsDurationDecision>()
physicsDurationDecisions.forEach((decision) => {
  assert(decision.jurisdiction, 'Physics duration decision lacks jurisdiction')
  assert(!physicsDurationDecisionByJurisdiction.has(decision.jurisdiction), `duplicate Physics duration decision ${decision.jurisdiction}`)
  const expected = EXPECTED_DURATION_DECISIONS.get(decision.jurisdiction)
  assert(expected, `unexpected Physics duration jurisdiction ${decision.jurisdiction}`)
  assert.equal(decision.status, 'reviewed')
  assert.equal(decision.stage, expected.stage)
  assert.equal(decision.decision, expected.decision)
  assert.deepEqual(decision.durationModels, expected.durationModels)
  assert.equal(decision.learnerFacingProjection, 'duration-neutral-composition-view')
  assert.equal(decision.compositionViewIds, undefined, `${decision.jurisdiction} must not invent duration-specific Physics views`)
  assert(decision.sourceExtractionPath && existsSync(resolve(repoRoot, decision.sourceExtractionPath)), `missing source extraction for ${decision.jurisdiction}`)
  const extraction = readJson<{ subject?: string; jurisdiction?: string; sourceDocument?: { official?: boolean } }>(decision.sourceExtractionPath)
  assert.equal(extraction.subject, 'Physik')
  assert.equal(extraction.jurisdiction, decision.jurisdiction)
  assert.equal(extraction.sourceDocument?.official, true, `${decision.jurisdiction} must bind an official Physics extraction`)
  physicsDurationDecisionByJurisdiction.set(decision.jurisdiction, decision)
})
assert.deepEqual(
  [...physicsDurationDecisionByJurisdiction.keys()].sort(compareCodePoints),
  [...EXPECTED_JURISDICTIONS],
)
for (const jurisdiction of ['DE-BB', 'DE-BE', 'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH']) {
  const decision = physicsDurationDecisionByJurisdiction.get(jurisdiction)
  assert(decision)
  assert.equal(decision.stage, 'SekI+SekII')
  assert.equal(decision.evidenceSources?.length, 1, `${jurisdiction} must bind one reviewed official duration source`)
  assert.match(decision.evidenceSources![0], /^https:\/\//u)
  assert.match(decision.rationale ?? '', /reviewed on 2026-08-20/u)
  assert.match(decision.rationale ?? '', /Physics (?:extraction|source)/u)
}
parseSubjectDurationModelPolicy(
  durationPolicy,
  'Physik',
  [...EXPECTED_JURISDICTIONS],
  sourceViews,
)

const sharedDurationPolicy = readJson<{ decisions: PhysicsDurationDecision[] }>(
  SHARED_DURATION_POLICY_PATH,
)
const sharedPhysicsDecisions = sharedDurationPolicy.decisions
  .filter(({ subject }) => subject === 'Physik')
const sharedPhysicsJurisdictions = sharedPhysicsDecisions
  .map(({ jurisdiction }) => jurisdiction ?? '')
  .sort(compareCodePoints)
assert.deepEqual(
  sharedPhysicsJurisdictions,
  [...EXPECTED_SHARED_PHYSICS_JURISDICTIONS],
  'the shared legacy policy must retain exactly its ten byte-frozen Physics decisions',
)
sharedPhysicsDecisions.forEach((sharedDecision) => {
  const snapshotDecision = physicsDurationDecisionByJurisdiction.get(sharedDecision.jurisdiction!)
  assert(snapshotDecision, `Physics snapshot lacks shared decision ${sharedDecision.jurisdiction}`)
  assert.equal(
    canonicalJson(snapshotDecision),
    canonicalJson(sharedDecision),
    `${sharedDecision.jurisdiction} drifted between the shared legacy policy and Physics atlas snapshot`,
  )
})

console.log(
  `Physics goal-book inputs verified: ${EXPECTED_COUNTS.total} semantic-kind decisions; `
  + `${EXPECTED_COUNTS.curricularAtomic} curricular atoms in 64 state views; `
  + `${EXPECTED_JURISDICTIONS.length} reviewed duration decisions.`,
)
