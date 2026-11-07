import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  normalizeCanonicalLandscape,
  normalizeGoalRef,
  validateCanonicalLandscape,
} from '../src/utils/authoring/canonicalAuthoring'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  normalizeCompositionView,
  type CompositionView,
} from '../src/utils/authoring/compositionViewAuthoring'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readText = (path: string) => readFileSync(resolve(repoRoot, path), 'utf8')
const readJson = (path: string) => JSON.parse(readText(path))
const digest = (path: string) => `sha256:${createHash('sha256').update(readText(path)).digest('hex')}`
const archive = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-22/m7-coordinate-rotation-lk-endpoint-v1'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const raw = readJson(canonicalPath) as SkillLandscape
const snapshot = readJson(`${archive}/before-scope-canonical.json`) as {
  sourcePath: string, sourceSha256: string, landscape: SkillLandscape
}
const beforeRaw = snapshot.landscape
const landscape = normalizeCanonicalLandscape(raw)
const before = normalizeCanonicalLandscape(beforeRaw)
const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const beforeById = new Map(before.goals.map((goal) => [goal.id, goal]))
const rawById = new Map(raw.goals.map((goal) => [goal.id, goal]))
const beforeRawById = new Map(beforeRaw.goals.map((goal) => [goal.id, goal]))
const receipt = readJson(`${archive}/integration.receipt.json`) as {
  beforeCanonicalSha256: string
  beforeSemanticKindSha256: string
  views: Array<{ file: string, beforeSha256: string }>
}
type KindLedger = {
  decisions: Array<{ goalId: string, semanticKind: string, decisionStatus: string, decisionBasis: string, sourceFingerprint: string }>
}
const beforeKinds = readJson(`${archive}/before-scope-semantic-kinds.json`) as KindLedger
const kinds = readJson('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json') as KindLedger
// Match goalBookModel's native K7 validation: fingerprints alone cannot reject
// an invented decisionBasis or another violation of the closed ledger schema.
const k7Ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(k7Ajv)
const validateK7 = k7Ajv.compile(readJson('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'))
assert(validateK7(kinds), `Invalid native K7 ledger: ${k7Ajv.errorsText(validateK7.errors)}`)
assert.equal(snapshot.sourcePath, canonicalPath)
assert.equal(snapshot.sourceSha256, receipt.beforeCanonicalSha256, 'Wrong pre-repair graph provenance')
assert.equal(`sha256:${createHash('sha256').update(`${JSON.stringify(beforeRaw, null, 2)}\n`).digest('hex')}`, receipt.beforeCanonicalSha256, 'Wrong pre-repair graph fixture')
assert.equal(digest(`${archive}/before-scope-semantic-kinds.json`), receipt.beforeSemanticKindSha256, 'Wrong pre-repair semantic-kind fixture')

const rotation = '7bd8f022-5002-5610-994c-a9cec1890558'
const assessment = '42752317-6022-47f2-8b34-160db5ef01fb'
const cluster = '6b0d2a97-cf9c-4778-9c68-16bb82b7afde'
const q25 = 'b3d2284c-21e0-5af8-942a-a4c11390c84a'
const centralDilation = '7d37513b-fa1a-54cc-9e2a-9279a381f0f0'
const sharedAssessment = '81823f27-0c92-5444-ac4e-32b83169f318'
const markovAssessment = 'e4656e83-3f33-5bda-b0bc-d4b63ec4653e'
// KC HE pp. 43/44 put long-term matrix powers/limits and axis rotations in LK.
// Fixed states themselves remain GK. The old Markov exam also requires the LK
// long-term goals and cannot be retained as a hidden GK prerequisite.
const excludedContent = new Set([
  '0de1e45c-aea9-5e53-932a-027dcf509efa',
  '922d89fc-1cbd-56e9-ac5d-5cb59085de6c',
  '4bc6cc77-3d20-5d27-a74a-8efb0a038d17',
  rotation,
])
// A separate Q4 scope correction keeps this pure-LK modeling branch available
// for prerequisite checks while removing its three atoms from HE-GK targets.
const q4LkPrerequisites = new Set([
  '74f28ce7-e568-5d6e-b946-17445b344fcc',
  '163dd583-8308-53f0-b60d-34588787988d',
  '519660d0-85e5-57a6-a219-d0a253336649',
])
// This archived September 22 fixture predates later, independent source-scope
// corrections. Keep their current HE-GK removals explicit, so a new removal
// cannot be mistaken for part of the original Q2.4/Q2.5 repair.
const laterByOnlyContent = new Set([
  '0b162cb0-8507-5ac2-b9d6-57f40f4d3f35',
  '71fe4a39-38e8-5c6a-8eef-ff4783fe70c2',
  'dc12f281-f161-572b-a973-8405ae9b2498',
  '9b339361-7719-573d-a913-432246c502ee',
])
const laterLkOnlyContent = new Set([
  '803d910d-96d1-5118-b9ca-29e93d0da76d',
  'd3c42193-f1b7-5c6d-a991-bf034d99359f',
])
const knownLaterScopeRemovals = new Set([...laterByOnlyContent, ...laterLkOnlyContent])
// September 28-30 decisions postdate the archived September 22 graph. These
// are explicit HE-GK support roles, not global LK reclassifications: SL-GK
// continues to target the scalar triple product and its volume application.
const laterHeGkSupport = new Set([
  '944dd479-9f30-5acb-ab32-3ea0b6dc8e06',
  'a594dec0-3977-5c43-9432-d4254a7f6130',
  'e9181209-1506-59df-9053-17f36b91bb06',
])
// These later source decisions concern whole atoms that are not HE targets.
// Their support role is kept separately from the HE-only Q2 course decision.
const laterOtherJurisdictionSupport = new Map([
  ['06bdbecb-53e0-5ac3-992f-d6fd20555b59', ['DE-BB', 'DE-BE', 'DE-BW', 'DE-SH']],
  ['b43a1e45-f05c-4d78-8453-f6fa677dc24c', ['DE-BW', 'DE-SH']],
  ['ad66009f-55fb-563f-ace0-dbfeae7c76c3', ['DE-BW', 'DE-HH', 'DE-SH']],
  ['b025df0c-994c-4807-9c5f-2d548905b73f', ['DE-BW']],
  ['ba343971-10e5-4b05-b005-405b9c1ce447', ['DE-BW']],
])
// Exact reviewed aggregate retirements. Do not ignore arbitrary goals merely
// because their current type changed: every listed replacement stays required.
const retiredAggregates = [
  {
    id: '1ea06c0c-5c60-45cd-8f31-638de98820b4', kind: 'curricularArea', crossStageOnly: true,
    children: ['7b01d3d8-1fff-5924-b133-5a4825dc742e', 'baea3966-5d10-53bf-8193-3fcda7b1e73f', 'bb227e31-0b0b-544a-b5e0-548256a70dec'],
    heTargets: ['7b01d3d8-1fff-5924-b133-5a4825dc742e', 'bb227e31-0b0b-544a-b5e0-548256a70dec'],
  },
  {
    id: '80956a2c-5811-4021-863e-95675bec31f5', kind: 'curricularArea', crossStageOnly: true,
    children: ['4d78bbcc-89b8-47f0-aa45-516199e4da5d', '3a69dab2-3fe8-5076-a980-5b7ac1bd1127', '487ec508-f421-5a5a-a84c-98f88a8fb3e5', '6a3502ee-b616-5db7-88fc-8951f33c9f63', '081c9802-6da7-5ae8-b78e-f99c2b2dbb14'],
    heTargets: ['4d78bbcc-89b8-47f0-aa45-516199e4da5d', '487ec508-f421-5a5a-a84c-98f88a8fb3e5', '6a3502ee-b616-5db7-88fc-8951f33c9f63', '081c9802-6da7-5ae8-b78e-f99c2b2dbb14'],
  },
  {
    id: '809ef78a-f282-5593-89be-0f2cb95570ac', kind: 'runtimeSupport', crossStageOnly: false,
    children: ['23c8b5f9-ab35-4071-a3d4-b76a669a0995', 'ece68088-71a8-466b-874c-09e6baac19fc', 'c1c80b80-733f-599d-a2fc-f4dc50eabde2'],
    heTargets: ['23c8b5f9-ab35-4071-a3d4-b76a669a0995', 'ece68088-71a8-466b-874c-09e6baac19fc', 'c1c80b80-733f-599d-a2fc-f4dc50eabde2'],
  },
  {
    id: 'f37b0a72-9e23-51c7-aad5-438c17a56899', kind: 'runtimeSupport', crossStageOnly: false,
    children: ['c63bbffd-8d1c-5fe2-a428-db194e6fe592', '571793bd-34f1-539e-969c-dfcc2dfa96b3'],
    heTargets: ['c63bbffd-8d1c-5fe2-a428-db194e6fe592', '571793bd-34f1-539e-969c-dfcc2dfa96b3'],
  },
  {
    id: '1a18dbb3-f350-4766-9c8b-20ca018ccef1', kind: 'curricularArea', crossStageOnly: false,
    children: ['5518ceb3-f668-5b52-a9b1-57653b16ca98', '2850e8f6-2330-50d3-a577-d519540d9924'],
    heTargets: ['2850e8f6-2330-50d3-a577-d519540d9924'],
  },
  {
    id: 'a8ff2666-8df3-4253-8021-3efe42114e40', kind: 'runtimeSupport', crossStageOnly: false,
    children: ['fb7a4fa0-03b5-53b4-bd86-608480b748a1', '68d4faef-1a56-5898-9c31-80b7d5d2e430', 'bea0e5a0-4833-5337-b6f1-7251b8cf8089'],
    heTargets: ['fb7a4fa0-03b5-53b4-bd86-608480b748a1', '68d4faef-1a56-5898-9c31-80b7d5d2e430'],
  },
] as const
const retiredAggregateIds = new Set<string>(retiredAggregates.map(item => item.id))
const sharedOperationArea = '1bc118c3-1f05-5f2a-b125-418017180d75'
// The G9 view dropped duplicate J9 placements in September 29's source/stage
// repair. These bindings retain their entire content in the existing SekII
// targets; they are neither mastery aliases nor evidence transfers.
const g9SpatialReplacements = new Map([
  ['235ae698-369f-4dbe-b46f-87e8b65bb03d', ['525b1da9-7fdd-4a70-9f30-ff01d7511b04']],
  ['f242a3e8-55a3-492e-8354-b81b24cdbb78', ['075f1ef2-6860-4b20-9df2-878157eb395e']],
  ['d1352ce0-9502-5039-9af6-318fe385b6fd', ['54cfe5ce-693e-5d4a-ac1b-009570fbbc11']],
  ['57f6d5e4-7c24-4e70-9cf6-737f01d79914', ['075f1ef2-6860-4b20-9df2-878157eb395e', '525b1da9-7fdd-4a70-9f30-ff01d7511b04', '7680701b-35e3-519e-beaa-09753e733756']],
])
const spatialDefinitionSha256 = new Map([
  ['075f1ef2-6860-4b20-9df2-878157eb395e', '5b35c15b4ed20d918b4e98f3ba70af3a56d1eb2a3154141093bbb7b9dba2d719'],
  ['525b1da9-7fdd-4a70-9f30-ff01d7511b04', 'f66389bf054ca80ca6df826d0b30931a77817109151375ad19b3242a57954cb7'],
  ['54cfe5ce-693e-5d4a-ac1b-009570fbbc11', '0389649189101cb7405df1b304fded16bbe6665c674fbe78e54209765350cb59'],
  ['7680701b-35e3-519e-beaa-09753e733756', '63e3e84373305ec6580220988fb16d3c0c4cbe84317afea9012316cff5cd5d78'],
])
assert.equal(createHash('sha256').update(readFileSync(resolve(repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf'))).digest('hex'),
'd53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953', 'Recheck HE original pp.41-43 before changing the scope/whole-performance bindings')
for (const [id, expected] of spatialDefinitionSha256) {
  const goal = rawById.get(id)! as SkillLandscape['goals'][number] & { titleEn?: string, descriptionEn?: string }
  const definition = { id: goal.id, title: goal.title, titleEn: goal.titleEn, description: goal.description, descriptionEn: goal.descriptionEn }
  assert.equal(createHash('sha256').update(JSON.stringify(definition)).digest('hex'), expected,
    `${id}: recheck the whole bilingual replacement performance against HE pp.41/42`)
}
for (const [id, jurisdictions] of laterOtherJurisdictionSupport) {
  assert.deepEqual(rawById.get(id)?.applicability?.jurisdiction, jurisdictions, `${id}: changed reviewed whole-atom source scope`)
}
assert.equal(rawById.get(sharedOperationArea)?.type, 'cluster')
assert.equal(kinds.decisions.find(entry => entry.goalId === sharedOperationArea)?.semanticKind, 'curricularArea')
assert.deepEqual(new Set(rawById.get(sharedOperationArea)?.contains), new Set(retiredAggregates[3].children))
const excludedGk = new Set([...excludedContent, markovAssessment, assessment, cluster])
const fixedStates = '8d893e63-d7de-52d9-8bcb-f48f47d1ccbf'
const heGkFiles = new Set(['de-he-sekii-gk.view.json', 'de-he-gk.view.json', 'de-he-gk-g8.view.json', 'de-he-gk-g9.view.json'])
const oldContent = new Set(beforeKinds.decisions
  .filter((entry) => entry.decisionStatus === 'authoritative' && entry.semanticKind === 'curricularAtomic')
  .map((entry) => entry.goalId))
for (const id of excludedContent) assert(oldContent.has(id), `${id}: excluded item must be an ordinary content goal`)
for (const id of q4LkPrerequisites) assert(oldContent.has(id), `${id}: Q4 LK-only prerequisite must be an ordinary content goal`)
for (const id of knownLaterScopeRemovals) assert(oldContent.has(id), `${id}: later source-scope change must concern an old content goal`)
for (const retired of retiredAggregates) {
  assert(oldContent.has(retired.id), `${retired.id}: historical fixture must contain the old atom`)
  const goal = rawById.get(retired.id)!
  assert.equal(goal.type, 'cluster', `${retired.id}: reviewed retirement must remain structural`)
  assert.deepEqual(new Set(goal.contains), new Set(retired.children), `${retired.id}: changed replacement content`)
  const decisions = kinds.decisions.filter(entry => entry.goalId === retired.id)
  assert.equal(decisions.length, 1)
  assert.equal(decisions[0].decisionStatus, 'authoritative')
  assert.equal(decisions[0].semanticKind, retired.kind)
  assert.equal(decisions[0].sourceFingerprint, fingerprintSemanticKindSourceGoal(goal as unknown as Record<string, unknown>))
  if (retired.kind === 'runtimeSupport') {
    assert.equal(goal.extendedData?.compatibilityOnly, true)
    assert.equal(goal.extendedData?.applicabilityProjection, 'excluded')
  }
  for (const id of retired.heTargets) {
    assert.equal(rawById.get(id)?.type, 'atomic', `${id}: replacement competence must remain assessable`)
    assert.equal(kinds.decisions.find(entry => entry.goalId === id)?.semanticKind, 'curricularAtomic')
  }
}

const projectionRoles = (view: CompositionView) => collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
const withRole = (view: CompositionView, goalId: string, projectionRole: 'target' | 'prerequisiteOnly') => {
  const copy = structuredClone(view)
  const visit = (nodes: CompositionView['rootNodes']) => {
    for (const node of nodes) {
      if (node.kind === 'structure') visit(node.children)
      else if ('goalId' in node && node.goalId === goalId) node.projectionRole = projectionRole
    }
  }
  visit(copy.rootNodes)
  copy.rootNodes.unshift({ kind: 'goalEntry', goalId, projectionRole })
  return copy
}
const assertReplacementContent = (name: string, view: CompositionView) => {
  const { targetGoalIds } = projectionRoles(view)
  for (const retired of retiredAggregates) {
    if (retired.kind === 'runtimeSupport') {
      assert(!targetGoalIds.has(retired.id), `${name}: excluded compatibility aggregate returned as target ${retired.id}`)
    }
    const expected = retired.crossStageOnly && view.scope.stage === 'SekII' ? [] : retired.heTargets
    for (const id of expected) assert(targetGoalIds.has(id), `${name}: missing reviewed replacement target ${id}`)
    for (const id of retired.children) {
      if (!(expected as readonly string[]).includes(id)) assert(!targetGoalIds.has(id), `${name}: out-of-scope replacement target ${id}`)
    }
  }
}
const assertQ2RegionalRoles = (name: string, view: CompositionView) => {
  const { targetGoalIds, prerequisiteOnlyGoalIds } = projectionRoles(view)
  if (view.scope.jurisdiction === 'DE-HE') {
    for (const id of laterHeGkSupport) {
      if (view.scope.courseProfile === 'GK') {
        assert(prerequisiteOnlyGoalIds.has(id) && !targetGoalIds.has(id), `${name}: HE-GK support role lost ${id}`)
        assert(view.rootNodes.some(node => node.kind === 'goalEntry' && node.goalId === id && node.projectionRole === 'prerequisiteOnly'), `${name}: missing authored direct HE-GK support role ${id}`)
      } else assert(targetGoalIds.has(id) && !prerequisiteOnlyGoalIds.has(id), `${name}: HE-LK target lost ${id}`)
    }
  } else if (view.scope.jurisdiction === 'DE-SL' && view.scope.courseProfile === 'GK') {
    for (const id of [...laterHeGkSupport].slice(0, 2)) assert(targetGoalIds.has(id), `${name}: SL-GK target lost ${id}`)
    assert(!targetGoalIds.has('e9181209-1506-59df-9053-17f36b91bb06'), `${name}: LK volume derivation leaked into SL-GK`)
  }
}
const assertLaterSourceRoles = (name: string, view: CompositionView) => {
  const { targetGoalIds, prerequisiteOnlyGoalIds } = projectionRoles(view)
  for (const id of laterOtherJurisdictionSupport.keys()) {
    assert(!targetGoalIds.has(id), `${name}: non-HE whole atom returned as target ${id}`)
    assert.equal(prerequisiteOnlyGoalIds.has(id), view.scope.stage === 'CrossStage', `${name}: changed authored source-support placement ${id}`)
  }
}
const assertG9SpatialContent = (name: string, view: CompositionView) => {
  const { targetGoalIds } = projectionRoles(view)
  for (const [oldId, replacements] of g9SpatialReplacements) {
    assert(!targetGoalIds.has(oldId), `${name}: duplicate J9 placement returned ${oldId}`)
    for (const id of replacements) assert(targetGoalIds.has(id), `${name}: missing full spatial replacement ${oldId} -> ${id}`)
  }
}
const assertOnlyReviewedOldContentRemoved = (name: string, oldTargets: Set<string>, targets: Set<string>) => {
  const removed = [...oldTargets].filter(id => oldContent.has(id) && !targets.has(id) && !retiredAggregateIds.has(id))
  const sourceRemovals = [...laterOtherJurisdictionSupport.keys()].filter(id => oldTargets.has(id))
  const g9Removals = name === 'de-he-gk-g9.view.json' ? [...g9SpatialReplacements.keys()] : []
  assert.deepEqual(removed.sort(), [...excludedContent, ...q4LkPrerequisites, ...knownLaterScopeRemovals, ...laterHeGkSupport, ...sourceRemovals, ...g9Removals].sort(), `${name}: unrelated old content removed`)
}
for (const id of laterByOnlyContent) {
  assert.deepEqual(rawById.get(id)?.applicability?.jurisdiction, ['DE-BY'], `${id}: later HE exclusion must remain BY-only`)
}
for (const id of laterLkOnlyContent) {
  const scope = rawById.get(id)?.applicability
  assert(scope?.jurisdiction?.includes('DE-HE'), `${id}: later LK-only goal must still apply in HE`)
  assert.deepEqual(scope.courseProfile, ['LK'], `${id}: later HE-GK exclusion must remain LK-only`)
}

// Use the native local graph validator, then check requires too (the authoring
// validator checks contains). Do not import validateGraph: it runs full-repo QS.
assert.equal(raw.goals.length, rawById.size, 'Duplicate canonical goal IDs')
assert.deepEqual(validateCanonicalLandscape(landscape), [], 'Invalid canonical Mathematics graph')
for (const edge of ['contains', 'requires'] as const) {
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (id: string) => {
    assert(goalById.has(id), `${edge}: missing goal ${id}`)
    assert(!visiting.has(id), `${edge}: cycle at ${id}`)
    if (visited.has(id)) return
    visiting.add(id)
    for (const ref of goalById.get(id)![edge]) visit(normalizeGoalRef(ref))
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of goalById.keys()) visit(id)
}

assert.deepEqual(rawById.get(cluster)?.contains, [assessment], 'Rotation exam folder must contain only its actual endpoint')
assert.deepEqual(rawById.get(cluster)?.requires, [], 'Do not impose cluster-wide prerequisites')
assert.deepEqual(raw.goals.filter((goal) => goal.contains.includes(cluster)).map((goal) => goal.id), [q25], 'Place the endpoint inside Q2.5, not a broad Q2 ancestor')
const q25Children = rawById.get(q25)?.contains ?? []
assert.equal(q25Children.filter((id) => id === centralDilation).length, 1, 'Place the HE-LK central-dilation application in Q2.5 exactly once')
assert.equal(q25Children.indexOf(centralDilation), q25Children.indexOf('35558905-753d-5fcb-b25e-7f85ffdbff56') + 1, 'Place the application directly after its central-dilation foundation')
assert.deepEqual(q25Children.filter((id) => id !== centralDilation), [...beforeRawById.get(q25)!.contains, cluster], 'Preserve the existing Q2.5 children apart from the separately reviewed central-dilation application')
for (const id of [cluster, assessment]) {
  const entries = kinds.decisions.filter((entry) => entry.goalId === id)
  assert.equal(entries.length, 1, `${id}: expected one semantic classification`)
  assert.equal(entries[0].decisionStatus, 'authoritative')
  assert.equal(entries[0].semanticKind, 'practiceAssessment', `${id}: endpoint must not become a new content atom`)
  assert.equal(entries[0].sourceFingerprint, fingerprintSemanticKindSourceGoal(rawById.get(id)! as unknown as Record<string, unknown>), `${id}: stale classification binding`)
  const invalidLedger = structuredClone(kinds)
  const index = invalidLedger.decisions.findIndex((entry) => entry.goalId === id)
  invalidLedger.decisions[index].decisionBasis = 'free-text-is-not-an-authorized-decision-basis'
  assert.equal(validateK7(invalidLedger), false, `${id}: native K7 must reject an invented decision basis even with a valid fingerprint`)
  assert(validateK7.errors?.some((error) => error.instancePath === `/decisions/${index}/decisionBasis`), `${id}: negative control must fail on decisionBasis`)
}
for (const script of ['validateGraph.ts', 'generateCurriculumQualityStatus.ts']) {
  const declaration = readText(`app/scripts/${script}`).match(/const CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS = \[([\s\S]*?)\]/u)
  assert(declaration, `${script}: missing native terminal-cluster selector`)
  const ids = [...declaration[1].matchAll(/'([^']+)'/gu)].map((match) => match[1])
  assert.equal(ids.filter((id) => id === cluster).length, 1, `${script}: rotation endpoint missing from native route/assessment checks`)
}

const examGoal = rawById.get(assessment)
assert(examGoal?.examData, 'Actual rotation exam is missing')
const exam = examGoal.examData
assert.equal(examGoal.nodeKind, 'exam')
assert.deepEqual(examGoal.contains, [])
assert.deepEqual(examGoal.requires, [rotation])
assert.deepEqual(exam.coveredGoalIds, [rotation], 'Do not claim broader matrix or geometry coverage')
assert.equal(examGoal.extendedData?.applicabilityFromRequires, true)
assert.equal(examGoal.extendedData?.applicabilityMappingInheritance, 'boundary')
assert.equal(exam.reviewStatus, 'released', 'Machine-reviewed content release is not human approval')
assert.equal(exam.scoring.maxPoints, 20)
assert.equal(exam.scoring.passingPoints, 10)
assert.equal(exam.scoring.steps?.length, 13)
assert.equal(new Set(exam.scoring.steps!.map((step) => step.id)).size, 13)
assert(exam.scoring.steps!.every((step) => Number.isInteger(step.points) && step.points > 0))
assert.equal(exam.scoring.steps!.reduce((sum, step) => sum + step.points, 0), 20)
for (const [part, points] of [[1, 6], [2, 5], [3, 5], [4, 4]]) {
  assert.equal(exam.scoring.steps!.filter((step) => step.id.startsWith(`rotation_${part}_`)).reduce((sum, step) => sum + step.points, 0), points, `Part ${part}: incorrect point allocation`)
}

const reviewedCandidate = readJson(`${archive}/candidate.json`) as { assessmentGoal: typeof examGoal }
const artifactDir = 'curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/coordinate-axis-rotation-lk-v1'
assert.equal(exam.sourceArtifactPath, `${artifactDir}/task.de.md`)
for (const [language, task, solution] of [
  ['de', 'taskContent', 'solutionContent'], ['en', 'taskContentEn', 'solutionContentEn'],
] as const) {
  const artifact = readText(`${artifactDir}/task.${language}.md`)
  for (const field of [task, solution]) {
    assert(exam[field]?.trim(), `${language}: missing ${field}`)
    assert.equal(exam[field], reviewedCandidate.assessmentGoal.examData![field], `${field}: independent content review must be renewed after substantive changes`)
    assert(artifact.includes(exam[field]!), `${language}: canonical exam and source artifact diverge`)
  }
  assert.equal([...exam[task]!.matchAll(/^\d\. /gmu)].length, 4, `${language}: expected four actual task parts`)
  // Check the mathematics in both stored solutions, rather than approving a
  // snapshot merely because its bytes match. Active column-vector rotations:
  // Rz(+90)e1=e2, Rz(+90)e2=-e1; Rx(-90)e2=-e3, Rx(-90)e3=e2.
  const matrices = new Map([...exam[solution]!.matchAll(/([AB])=\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/gu)]
    .map((match) => [match[1], match[2].split('\\\\').map((row) => row.split('&').map(Number))]))
  const apply = (matrix: number[][], vector: number[]) => matrix.map((row) => row.reduce((sum, value, i) => sum + value * vector[i], 0))
  const a = matrices.get('A')
  const b = matrices.get('B')
  assert(a && b, `${language}: missing rotation matrices`)
  assert.deepEqual(a, [[0, -1, 0], [1, 0, 0], [0, 0, 1]])
  assert.deepEqual(b, [[1, 0, 0], [0, 0, 1], [0, -1, 0]])
  assert.deepEqual(apply(a, [2, -1, 3]), [1, 2, 3])
  assert.deepEqual(apply(b, [2, -1, 3]), [2, 3, 1])
  const cMatch = exam[task]!.match(/C=\\begin\{pmatrix\}([\s\S]*?)\\end\{pmatrix\}/u)
  assert(cMatch, `${language}: counterexample task missing`)
  const c = cMatch[1].split('\\\\').map((row) => row.split('&').map(Number))
  assert.deepEqual(c, [[0, 1, 0], [-1, 0, 0], [0, 0, 1]])
  assert.deepEqual(apply(c, [1, 0, 0]), [0, -1, 0], 'Fixed axis and norm do not prove the requested positive angle')
}

const oldShared = beforeRawById.get(sharedAssessment)!
const shared = rawById.get(sharedAssessment)!
assert(oldShared.examData && shared.examData)
const oldCoverage = oldShared.examData.coveredGoalIds
assert(oldCoverage, 'Snapshot must contain shared-assessment coverage')
assert(oldCoverage.includes(rotation), 'Snapshot must contain the known false rotation coverage')
assert(oldShared.requires.includes(rotation), 'Snapshot must contain the known false rotation prerequisite')
assert.deepEqual(shared.requires, oldShared.requires.filter((id) => id !== rotation))
assert.deepEqual(shared.examData.coveredGoalIds, oldCoverage.filter((id) => id !== rotation))
for (const field of ['taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn', 'scoring'] as const) {
  assert.deepEqual(shared.examData[field], oldShared.examData[field], `Shared assessment ${field} must remain unchanged`)
}

const viewDir = 'curricula/DE/Gymnasium/composition-views/mathematik'
const files = readdirSync(resolve(repoRoot, viewDir)).filter((name) => name.endsWith('.view.json')).sort()
const root = raw.goals.find((goal) => goal.tags?.includes('root'))
assert(root, 'Canonical root missing')
const roots = new Map([[raw.landscapeId, root.id]])
let heGkCount = 0
let heLkCount = 0
let endpointCount = 0
let otherGkEndpointCount = 0
let replacementLossControls = 0
let regionalRoleControls = 0
let sourceRoleControls = 0
let g9SpatialLossControls = 0
for (const name of files) {
  const view = normalizeCompositionView(readJson(`${viewDir}/${name}`))
  assert.deepEqual(compileCompositionView(view, landscape).findings, [], `${name}: invalid current composition`)
  const { targetGoalIds: targets, prerequisiteOnlyGoalIds: prerequisites } = collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById, roots)
  if ((view.scope.jurisdiction === 'DE-HE' || view.scope.jurisdiction === 'DE-SL')
    && ['GK', 'LK'].includes(view.scope.courseProfile ?? '') && view.scope.stage !== 'SekI') {
    assertQ2RegionalRoles(name, view)
    const expectedTargets = view.scope.jurisdiction === 'DE-HE' && view.scope.courseProfile === 'LK'
      ? [...laterHeGkSupport]
      : view.scope.jurisdiction === 'DE-SL' && view.scope.courseProfile === 'GK' ? [...laterHeGkSupport].slice(0, 2) : []
    for (const id of expectedTargets) {
      assert.throws(() => assertQ2RegionalRoles(name, withRole(view, id, 'prerequisiteOnly')), /target lost/u)
      regionalRoleControls++
    }
    if (view.scope.courseProfile === 'GK') {
      const forbidden = view.scope.jurisdiction === 'DE-HE' ? [...laterHeGkSupport] : ['e9181209-1506-59df-9053-17f36b91bb06']
      for (const id of forbidden) {
        assert.throws(() => assertQ2RegionalRoles(name, withRole(view, id, 'target')), /support role lost|leaked into SL-GK/u)
        regionalRoleControls++
      }
    }
  }
  const hasRotation = targets.has(rotation)
  assert.equal(targets.has(assessment), hasRotation, `${name}: real endpoint must follow the rotation target exactly`)
  assert.equal(targets.has(cluster), hasRotation, `${name}: assessment folder must follow the rotation target exactly`)
  assert(!prerequisites.has(assessment) && !prerequisites.has(cluster), `${name}: assessment must not be hidden as prerequisite-only`)
  if (hasRotation) {
    endpointCount += 1
    assert(targets.has(sharedAssessment), `${name}: preserve the previous shared endpoint alongside the truthful rotation endpoint`)
    if (view.scope.jurisdiction !== 'DE-HE' && view.scope.courseProfile === 'GK') otherGkEndpointCount += 1
    if (view.scope.jurisdiction === 'DE-HE') {
      assert.equal(view.scope.courseProfile, 'LK')
      heLkCount += 1
      for (const id of excludedContent) assert(targets.has(id), `${name}: LK content was over-pruned`)
      assert(targets.has(markovAssessment), `${name}: LK Markov endpoint lost`)
    }
  }
  if (!heGkFiles.has(name)) {
    // The same existing view over the old graph must already select rotation.
    // This guards accidental competence expansion by the new placement.
    const oldTargets = collectCompositionProjectionRoleGoalIds(view.rootNodes, beforeById, roots).targetGoalIds
    assert.equal(hasRotation, oldTargets.has(rotation), `${name}: new endpoint changed the existing rotation choice`)
    continue
  }
  heGkCount += 1
  assert.equal(view.scope.jurisdiction, 'DE-HE')
  assert.equal(view.scope.courseProfile, 'GK')
  const snapshotPath = `${archive}/${name}.before.json`
  const archived = receipt.views.find((entry) => entry.file === `${viewDir}/${name}`)
  assert(archived, `${name}: missing integration provenance`)
  assert.equal(digest(snapshotPath), archived.beforeSha256, `${name}: wrong pre-repair view fixture`)
  const oldView = normalizeCompositionView(readJson(snapshotPath))
  const oldTargets = collectCompositionProjectionRoleGoalIds(oldView.rootNodes, beforeById, roots).targetGoalIds
  for (const id of excludedContent) assert(oldTargets.has(id), `${name}: fixture must reproduce the original scope fault`)
  for (const id of q4LkPrerequisites) assert(oldTargets.has(id), `${name}: fixture must reproduce the previous Q4 target projection`)
  assertReplacementContent(name, view)
  assertLaterSourceRoles(name, view)
  for (const id of laterOtherJurisdictionSupport.keys()) {
    assert.throws(() => assertLaterSourceRoles(name, withRole(view, id, 'target')), /non-HE whole atom returned as target/u)
    sourceRoleControls++
  }
  if (name === 'de-he-gk-g9.view.json') {
    assertG9SpatialContent(name, view)
    for (const replacements of g9SpatialReplacements.values()) {
      for (const id of replacements) {
        assert.throws(() => assertG9SpatialContent(name, withRole(view, id, 'prerequisiteOnly')), /missing full spatial replacement/u)
        g9SpatialLossControls++
      }
    }
  }
  for (const retired of retiredAggregates) {
    if (retired.crossStageOnly && view.scope.stage === 'SekII') continue
    for (const id of retired.heTargets) {
      assert.throws(() => assertReplacementContent(name, withRole(view, id, 'prerequisiteOnly')), /missing reviewed replacement target/u)
      replacementLossControls++
    }
  }
  assertOnlyReviewedOldContentRemoved(name, oldTargets, targets)
  assert(oldContent.has(fixedStates), 'Unrelated-loss counterexample must use an old content atom')
  assert.throws(() => assertOnlyReviewedOldContentRemoved(name, oldTargets,
    projectionRoles(withRole(view, fixedStates, 'prerequisiteOnly')).targetGoalIds), /unrelated old content removed/u)
  const oldContentAdded = [...targets].filter((id) => oldContent.has(id) && !oldTargets.has(id))
  assert.deepEqual(oldContentAdded, view.scope.stage === 'SekII' ? [sharedOperationArea] : [], `${name}: unrelated old content added`)
  assert(targets.has(fixedStates), `${name}: GK fixed-state competence must stay available`)
  for (const id of q4LkPrerequisites) {
    assert(!targets.has(id), `${name}: Q4 LK-only atom returned as GK target: ${id}`)
    assert(prerequisites.has(id), `${name}: Q4 LK-only atom lost its prerequisite-only projection: ${id}`)
  }
  for (const id of excludedGk) {
    assert(!targets.has(id), `${name}: excluded LK content/assessment returned as target: ${id}`)
    assert(!prerequisites.has(id), `${name}: excluded LK content/assessment returned as prerequisite-only: ${id}`)
  }
}
assert.equal(files.length, 88, 'Update scope regression deliberately when the view catalog changes')
assert.equal(heGkCount, 4)
assert.equal(heLkCount, 4)
assert.equal(endpointCount, 72)
// These pre-existing GK choices outside HE are intentionally not reclassified.
// This endpoint is HE-LK-only, not globally LK-only across the canonical views.
assert.equal(otherGkEndpointCount, 34)
console.log(`HE Q2.4/Q2.5 regression passed: ${files.length} valid views, ${heGkCount} HE-GK scopes; six aggregate retirements retain their reviewed competencies (${replacementLossControls} real projection loss controls), three HE-GK support roles retain HE-LK/SL targets (${regionalRoleControls} scope controls), five later whole-atom source decisions (${sourceRoleControls} role controls), four G9 spatial substitutions (${g9SpatialLossControls} whole-performance loss controls); ${endpointCount} exact rotation/endpoint placements including ${otherGkEndpointCount} existing non-HE/national GK views; unrelated content loss, DAGs, coverage, native binders and bilingual 20-point/13-rubric exam checked.`)
