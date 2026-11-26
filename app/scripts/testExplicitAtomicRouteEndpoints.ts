// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { explicitAtomicEndpointApplies, resolveExplicitAtomicRouteEndpoints } from './lib/explicitAtomicRouteEndpoints'
import { evaluateDirectAtomicRouteCoverage } from './lib/directAtomicRouteCoverage'
import { validateHardDirectAtomicRoutes, type HardRouteSemanticKind } from './lib/hardLearningRouteValidation'
import { createRouteProfiles, evaluateRouteProfile } from './generateCurriculumQualityStatus'
import type { ApplicabilityCompilationResult } from './applicabilityCompiler'

const root = resolve(import.meta.dirname, '../..')
const physics = JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), 'utf8')) as SkillLandscape
const actualIds = ['a8dc0290-9f80-5763-8943-e16b8d2aa860', 'b34f3e03-bbe7-5ede-941c-3f26c9b07bb8',
  'b3b365f4-4988-57d5-97cd-5d8446483ef7', '3efcce48-2a2d-5d81-958c-aa216eccaea3',
  '3b7b2b62-e39c-5936-b0d8-5406206e57b6',
  '57a03b38-5ec5-5e4f-b71a-4024bab1584c', '797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00',
  '7cfaf48e-e420-5c09-8ec2-932f0dba4d08', '884bd99b-2373-5174-af7c-c6813b91bd93',
  'bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04', 'e6a89922-75ce-53dd-9e7b-3a683398431c',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691', 'f602680f-ea75-5bed-ae87-72f6be34a99b']
// Own lower-stage closing tasks of E.2 (25 November 2026): total momentum of two carts for Hamburg
// and Thuringia, mean resultant force from two momentum measurements for Baden-Württemberg.
const arrowExam = '2569d84a-5bf1-542b-bc43-6ade1df971c4'
const closingIds = ['d8fc6295-d0db-59e5-bd90-080bbc508c3a', 'b50e9903-58b3-520d-96bf-d5bc1fe51ebf', arrowExam]
const byId = new Map(physics.goals.map(goal => [goal.id, goal]))
assert.deepEqual(resolveExplicitAtomicRouteEndpoints([...closingIds, ...actualIds], byId).issues, [])
assert.deepEqual(createRouteProfiles().find(profile => profile.profileId === 'canonical-physics-sek1')!.terminalAutonomyGoalIds,
  [...closingIds, ...actualIds],
  'the lower inventory includes the three subject-owned closing tasks and all thirteen retained endpoints')
assert.equal(createRouteProfiles().find(profile => profile.profileId === 'canonical-physics-sek2')!
  .terminalAutonomyGoalIds?.includes(actualIds[4]) ?? false, false,
  'the lower lens-eye eligibility does not create an additional upper-stage endpoint obligation')
assert.deepEqual(byId.get(arrowExam)!.requires, ['b77a7e93-22f9-5722-a4cc-f18a149ab030'])
assert.deepEqual(byId.get(arrowExam)!.examData!.coveredGoalIds, ['b77a7e93-22f9-5722-a4cc-f18a149ab030'])
assert.ok(!createRouteProfiles().find(profile => profile.profileId === 'canonical-physics-sek2')!
  .terminalAutonomyGoalIds?.includes(arrowExam))
const energyDerivationExam = 'e0085acf-af64-5c73-8abf-85a5bbfbdaa6'
const energyDerivation = '2d3f849e-20b1-5b3e-90d0-63d98c6b2b1b'
const ePhasePractice = '424b07df-bf66-5d7f-99f5-f28b32ad1f22'
const upperPhysicsRoutes = createRouteProfiles().find(profile => profile.profileId === 'canonical-physics-sek2')!
assert.ok(upperPhysicsRoutes.terminalAutonomyClusterIds.includes(ePhasePractice))
assert.ok(byId.get(ePhasePractice)!.contains?.includes(energyDerivationExam))
assert.ok(!upperPhysicsRoutes.terminalAutonomyGoalIds?.includes(energyDerivationExam),
  'K3 already belongs to the upper E-phase terminal cluster')
assert.deepEqual(byId.get(energyDerivationExam)!.requires, [energyDerivation])
assert.deepEqual(byId.get(energyDerivationExam)!.examData!.coveredGoalIds, [energyDerivation])

const lens = byId.get(actualIds[4])!
assert.deepEqual(lens.requires, ['84ddb244-e560-592f-9d43-e84c801fe5b4'])
assert.deepEqual(lens.examData!.coveredGoalIds, ['84ddb244-e560-592f-9d43-e84c801fe5b4'])
const offers: Array<[string, string[]]> = [
  [actualIds[4], ['DE-MV', 'DE-SL']], [actualIds[5], ['DE-SN']], [actualIds[6], ['DE-HH']],
  [actualIds[7], ['DE-SN', 'DE-ST', 'DE-TH']], [actualIds[8], ['DE-HH']],
  [actualIds[9], ['DE-SL', 'DE-SN']], [actualIds[10], ['DE-MV']],
  // Lane 11 independently activated FFX as a voluntary HE E.1 offer while retaining SN J9.
  [actualIds[11], ['DE-HE', 'DE-SN']],
  [actualIds[12], ['DE-SL', 'DE-SN']],
  [closingIds[0], ['DE-HH', 'DE-TH']],
  [closingIds[1], ['DE-BW']],
]
for (const [id, jurisdictions] of offers) {
  const offered = byId.get(id)!
  assert.deepEqual(offered.applicability, { jurisdiction: jurisdictions })
  assert.deepEqual(offered.extendedData, { applicabilityMappingInheritance: 'boundary',
    applicabilityOverrides: { jurisdiction: jurisdictions } },
  'own task offers remain explicitly bounded; FromRequires cannot expand them')
  assert.deepEqual(offered.requires, offered.examData!.coveredGoalIds)
  assert.equal(offered.requires.length, 1)
  const course = (candidate: LearningGoal) => candidate.tags.filter(tag => tag === 'GK' || tag === 'LK').sort()
  assert.deepEqual(course(offered), course(byId.get(offered.requires[0])!),
    'a new task never expands the course profile of its assessed competency')
}
const actual = byId.get(actualIds[0])!
const canonicalLowerProfile = createRouteProfiles().find(profile => profile.profileId === 'canonical-physics-sek1')!
const canonicalLowerSelected = new Set(physics.goals.filter(canonicalLowerProfile.goalSelector).map(goal => goal.id))
assert.equal(explicitAtomicEndpointApplies(actual, canonicalLowerSelected, new Set(byId.keys())), false,
  'a8dc eligibility does not impose its E acceleration task on the canonical lower source scope')
assert.equal(explicitAtomicEndpointApplies(actual, new Set(actual.examData!.coveredGoalIds),
  new Set([...(actual.requires ?? []), ...actual.examData!.coveredGoalIds])), true,
  'the same task becomes applicable where its actual assessed competency and complete demand are selected')
for (const [ids, goals, existing, allowed] of [
  [['missing'], byId, new Set<string>(), undefined],
  [[actual.id, actual.id], byId, new Set<string>(), undefined],
  [[actual.id], byId, new Set([actual.id]), undefined],
  [[actual.id], new Map([[actual.id, { ...actual, type: 'cluster' as const }]]), new Set<string>(), undefined],
  [[actual.id], new Map([[actual.id, { ...actual, contains: ['child'] }]]), new Set<string>(), undefined],
  [[actual.id], new Map([[actual.id, { ...actual, examData: undefined }]]), new Set<string>(), undefined],
  [[actual.id], new Map([[actual.id, { ...actual, examData: { ...actual.examData!, reviewStatus: 'draft' as const } }]]), new Set<string>(), undefined],
  [[actual.id], byId, new Set<string>(), new Set<string>()],
] as const) assert(resolveExplicitAtomicRouteEndpoints(ids, goals, existing, allowed).issues.length > 0)

const goal = (id: string, requires: string[] = [], contains: string[] = []): LearningGoal => ({
  id, title: id, type: contains.length ? 'cluster' : 'atomic', requires, contains,
} as LearningGoal)
const task = (id: string, required: string): LearningGoal => ({ ...goal(id, [required]),
  examData: { reviewStatus: 'released', coveredGoalIds: [required] },
} as LearningGoal)
const directSource = { landscapeId: 'direct-endpoint-fixture', goals: [
  goal('a'), goal('g', ['a']), goal('h', ['a']), task('old', 'h'), task('new', 'g'), goal('folder', [], ['old']),
] } as SkillLandscape
const directProfile = { motivationAnchorGoalIds: ['a'], terminalAutonomyClusterIds: ['folder'],
  terminalAutonomyGoalIds: ['new'], goalSelector: (candidate: LearningGoal) => candidate.id === 'g' || candidate.id === 'h' }
assert.deepEqual(evaluateDirectAtomicRouteCoverage(directSource, directProfile).details, [])
assert.equal(evaluateDirectAtomicRouteCoverage(directSource, { ...directProfile, terminalAutonomyGoalIds: [] }).missingDirectTerminal.length, 1)
const semantic = new Map<string, HardRouteSemanticKind>([['a', 'orientation'], ['g', 'curricularAtomic'], ['h', 'curricularAtomic'],
  ['old', 'practiceAssessment'], ['new', 'practiceAssessment']])
const hardProfile = { scopeLabel: 'direct-endpoint-fixture', motivationAnchorGoalIds: ['a'],
  terminalGoalClusterIds: ['folder'], terminalGoalIds: ['new'], goalSelector: directProfile.goalSelector }
assert.deepEqual(validateHardDirectAtomicRoutes(directSource.goals, semantic, hardProfile), [])
assert(validateHardDirectAtomicRoutes(directSource.goals, semantic, { ...hardProfile, terminalGoalIds: ['missing'] }).length > 0)
assert(validateHardDirectAtomicRoutes(directSource.goals, semantic, { ...hardProfile, terminalGoalIds: ['folder'] }).length > 0)

const fixtureParent = resolve(root, 'app/node_modules/.tmp')
mkdirSync(fixtureParent, { recursive: true })
const fixture = mkdtempSync(resolve(fixtureParent, 'explicit-route-endpoints-'))
try {
  let serial = 0
  const invoke = (required: string, expose: boolean, ids = ['new']) => {
    const source = { landscapeId: 'explicit-cqr-fixture', goals: [
      { ...goal('root', [], ['a', 'g', 'outside', 'folder', 'new']), tags: ['root'] },
      goal('a'), goal('g', ['a']), goal('outside', ['a']), task('old', 'g'), task('new', required), goal('folder', [], ['old']),
    ] } as SkillLandscape
    const children = [{ kind: 'goalEntry', goalId: 'a' }, { kind: 'goalEntry', goalId: 'g' },
      { kind: 'goalEntry', goalId: 'old' }, ...(expose ? [{ kind: 'goalEntry', goalId: 'new' }] : []),
      { kind: 'goalEntry', goalId: 'outside', projectionRole: 'prerequisiteOnly' }]
    const file = resolve(fixture, `${serial++}.view.json`)
    writeFileSync(file, JSON.stringify({ viewId: 'explicit-stage-fixture', landscapeId: source.landscapeId,
      scope: { schoolForm: 'Gymnasium', stage: 'SekI' }, rootNodes: [
        { kind: 'structure', id: 'sek1', label: 'Sekundarstufe I', children },
      ] }))
    const profile = { ...directProfile, profileId: 'explicit-cqr-fixture', landscapeId: source.landscapeId,
      label: 'Explicit endpoint', compositionViewStage: 'SekI' as const,
      compositionViewRoutePathMode: 'visible-atomic' as const, clusterSelector: () => true, terminalAutonomyGoalIds: ids }
    return evaluateRouteProfile(source, profile, { reports: [], summary: { supportedValues: [] } } as unknown as ApplicabilityCompilationResult,
      [source], [file]).rules.find(rule => rule.id === 'CQR-104')!
  }
  assert.equal(invoke('g', true).status, 'pass')
  const missing = invoke('g', false)
  assert.equal(missing.status, 'fail')
  assert(missing.details?.some(detail => detail.includes('Missing terminal autonomy goal(s):') && detail.includes('new')))
  const outside = invoke('outside', false)
  assert.equal(outside.status, 'pass', 'raw unused POnly support cannot enroll an otherwise inapplicable task')
  assert.equal(outside.metrics?.requiredTerminalAutonomyGoals, 1)
  assert.equal(invoke('g', true, ['missing']).status, 'fail', 'an unresolved explicit endpoint cannot disappear behind a working cluster route')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
console.log('Explicit atomic endpoints: 15 released tasks with 11 exact bounded offers, 8 invalid configurations, CQR/direct/hard-semantic consumers, lower-only eligibility, missing task and out-of-basis cases passed.')
