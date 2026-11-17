// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import type { CompositionView, CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'
import { collectExplicitAtomicSupportReferences, compositionStageAuthorityScopes, materializeCompositionStageMembership, restrictCompositionStageRouteSupport, selectCompositionStageAuthorities } from './lib/compositionStageRouteMembership'
import { shouldRequireCanonicalMathSek1AssessmentEndpoint } from './lib/canonicalMathSek1ReviewedExamRoutes'
import { evaluateRouteProfile } from './generateCurriculumQualityStatus'
import type { ApplicabilityCompilationResult } from './applicabilityCompiler'

const set = (...ids: string[]) => new Set(ids)
const scope = { schoolForm: 'Gymnasium', jurisdiction: 'DE-BW', stage: 'SekI' }
const entry = (id: string, extra: Record<string, string> = {}) => ({ view: {
  viewId: id, landscapeId: 'subject', scope: { ...scope, ...extra },
} })
const neutral = entry('lower'), cross = entry('cross', { stage: 'CrossStage', courseProfile: 'GK' })
const select = (entries: ReturnType<typeof entry>[], extra: Record<string, string> = {}, stage: 'SekI' | 'SekII' = 'SekI') => (
  selectCompositionStageAuthorities(entries, 'subject', { ...scope, ...extra }, stage).map(candidate => candidate.view.viewId)
)
assert.deepEqual(select([cross, neutral], { courseProfile: 'GK' }), ['lower'], 'the explicit stage wins; Sek-I courses are neutral')
assert.deepEqual(select([entry('wrong-land', { jurisdiction: 'DE-NI' }), entry('national', { jurisdiction: '' }), cross]), [])
assert.deepEqual(select([neutral, entry('g8', { durationModel: 'G8' })], { durationModel: 'G8' }), ['g8'])
assert.deepEqual(select([entry('g9', { durationModel: 'G9' })], { durationModel: 'G8' }), [])
const durationEntries = [entry('g8', { durationModel: 'G8' }), entry('g9', { durationModel: 'G9' })]
assert.deepEqual(compositionStageAuthorityScopes(durationEntries, 'subject', scope, 'SekI').map(candidate => candidate.durationModel), ['G8', 'G9'])
assert.deepEqual(compositionStageAuthorityScopes(durationEntries, 'subject', { ...scope, durationModel: 'G8' }, 'SekI').map(candidate => candidate.durationModel), ['G8'])
assert.deepEqual(compositionStageAuthorityScopes([neutral, ...durationEntries], 'subject', scope, 'SekI'), [scope])
assert.deepEqual(select([durationEntries[1]], { durationModel: 'G8' }), [], 'a missing requested G8 authority cannot borrow G9')
assert.deepEqual(select([neutral, entry('wrong-school', { schoolForm: 'Realschule' })]), ['lower'])
assert.deepEqual(select([entry('gk', { stage: 'SekII', courseProfile: 'GK' }), entry('lk', { stage: 'SekII', courseProfile: 'LK' })],
  { courseProfile: 'GK' }, 'SekII'), ['gk'])
assert.deepEqual(select([entry('gk', { stage: 'SekII', courseProfile: 'GK' }), entry('lk', { stage: 'SekII', courseProfile: 'LK' })],
  { courseProfile: 'GK+LK' }, 'SekII').sort(), ['gk', 'lk'], 'combined selection never silently picks only LK')
const exposure = { targetGoalIds: set('lower', 'exam', 'upper'), visibleGoalIds: set('lower', 'exam', 'upper', 'support') }
const authority = { targetGoalIds: set('lower', 'exam'), visibleGoalIds: set('lower', 'exam', 'support') }
const before = structuredClone({ exposure, authority })
assert.deepEqual(materializeCompositionStageMembership(exposure, [authority]).projection, authority)
const missing = materializeCompositionStageMembership({ ...exposure, targetGoalIds: set('lower', 'upper') }, [authority])
assert(!missing.projection.targetGoalIds.has('exam'))
assert(missing.authority!.targetGoalIds.has('exam'), 'independent endpoint membership survives a missing target in the audited full view')
assert(shouldRequireCanonicalMathSek1AssessmentEndpoint({ id: 'exam' }, set('lower'),
  missing.projection.visibleGoalIds, missing.authority!.targetGoalIds), 'a broad support fallback cannot waive that missing required exam')
assert(!shouldRequireCanonicalMathSek1AssessmentEndpoint({ id: 'support' }, set('lower'),
  authority.visibleGoalIds, authority.targetGoalIds), 'honest prerequisite-only support is not an endpoint')
for (const authorities of [[], [authority, { ...authority, targetGoalIds: set('lower') }],
  [authority, { ...authority, visibleGoalIds: set('lower', 'exam') }]]) {
  const result = materializeCompositionStageMembership(exposure, authorities)
  assert(result.errors.length > 0)
  assert.deepEqual(result.projection, exposure, 'an error neither imports nor unions an unbound projection')
}
assert.deepEqual({ exposure, authority }, before, 'input sets remain immutable')
const visibleSupport = set('lower', 'needed-lk', 'unused', 'motivation')
restrictCompositionStageRouteSupport(visibleSupport, set('lower'), new Map([['lower', ['needed-lk']]]), ['motivation'])
assert.deepEqual([...visibleSupport].sort(), ['lower', 'motivation', 'needed-lk'], 'needed support survives without reapplying seed course filters')
const absentSupport = set('lower', 'unused')
restrictCompositionStageRouteSupport(absentSupport, set('lower'), new Map([['lower', ['missing']]]), [])
assert.deepEqual([...absentSupport], ['lower'], 'canonical requires never imports missing support')
assert.deepEqual([...collectExplicitAtomicSupportReferences([
  { kind: 'canonicalSubtree', goalId: 'broad-family', projectionRole: 'prerequisiteOnly' },
  { kind: 'goalEntry', goalId: 'exam', projectionRole: 'prerequisiteOnly' },
], set('exam', 'family-child'))], ['exam'], 'broad support never establishes an atomic endpoint exclusion')

// Actual CQR-104 invocation: the source-stage exam deliberately has its learning
// place inside the upper-stage structure. Its canonical and source membership
// remain lower-stage, and no goal or requires edge is changed by the audit.
const goal = (id: string, requires: string[] = [], contains: string[] = []): LearningGoal => ({
  id, title: id, type: contains.length ? 'cluster' : 'atomic', contains, requires,
} as LearningGoal)
const landscape = { landscapeId: 'source-stage-route-fixture', title: 'Source stage route', goals: [
  { ...goal('root', [], ['motivation', 'lower', 'upper', 'exams']), tags: ['root'] },
  goal('motivation'), goal('lower', ['motivation']), goal('upper', ['motivation']),
  goal('exams', [], ['exam']), { ...goal('exam', ['lower']), nodeKind: 'exam', examData: {} },
] } as SkillLandscape
const structure = (id: string, label: string, children: CompositionViewNode[]): CompositionViewNode => (
  { kind: 'structure', id, label, children, childOrder: { after: [] } }
)
const view = (stage: 'CrossStage' | 'SekI'): CompositionView => ({
  $schema: 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json',
  viewFormatVersion: '1.2', language: 'de', viewId: `fixture-${stage}`, landscapeId: landscape.landscapeId,
  scope: { ...scope, stage }, rootNodes: [structure('subject', 'Subject', [
    structure('lower-stage', 'Sekundarstufe I', [{ kind: 'goalEntry', goalId: 'motivation' }, { kind: 'goalEntry', goalId: 'lower' }]),
    structure('upper-stage', 'Sekundarstufe II', [
      { kind: 'goalEntry', goalId: 'exam' }, ...(stage === 'CrossStage' ? [{ kind: 'goalEntry' as const, goalId: 'upper' }] : []),
    ]),
  ])],
})
const profile = {
  profileId: 'source-stage-route-fixture', landscapeId: landscape.landscapeId, label: 'Source stage route',
  motivationAnchorGoalIds: ['motivation'], terminalAutonomyClusterIds: ['exams'],
  compositionViewStage: 'SekI' as const, compositionViewRoutePathMode: 'visible-atomic' as const,
  goalSelector: (candidate: LearningGoal) => candidate.id === 'lower', clusterSelector: () => false,
}
const applicability = { reports: [], summary: { supportedValues: [] } } as unknown as ApplicabilityCompilationResult
const parent = resolve(import.meta.dirname, '../node_modules/.tmp')
mkdirSync(parent, { recursive: true })
const fixture = mkdtempSync(resolve(parent, 'cqr-source-stage-membership-'))
try {
  let serial = 0
  const invoke = (candidates: CompositionView[], source = landscape, route = profile) => {
    const files = candidates.map(candidate => {
      const file = resolve(fixture, `${serial++}.view.json`)
      writeFileSync(file, JSON.stringify(candidate))
      return file
    })
    return evaluateRouteProfile(source, route, applicability, [source], files).rules.find(rule => rule.id === 'CQR-104')!
  }
  const full = view('CrossStage'), lower = view('SekI')
  const baseline = invoke([full, lower])
  assert.equal(baseline.status, 'pass', JSON.stringify(baseline))
  const withoutExam = (candidate: CompositionView) => {
    const result = structuredClone(candidate)
    const visit = (nodes: CompositionViewNode[]) => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        if (node.kind === 'structure') visit(node.children)
        else if ('goalId' in node && node.goalId === 'exam') nodes.splice(i, 1)
      }
    }
    visit(result.rootNodes)
    return result
  }
  for (const [label, candidates] of [
    ['full view loses required exam', [withoutExam(full), lower]],
    ['stage view loses required exam', [full, withoutExam(lower)]],
  ] as const) {
    const result = invoke([...candidates])
    assert.equal(result.status, 'fail', label)
    assert(result.details?.some(detail => detail.startsWith('Missing terminal autonomy goal(s):') && detail.includes('exam')), label)
    assert.equal(result.metrics?.requiredTerminalAutonomyGoals, baseline.metrics?.requiredTerminalAutonomyGoals, label)
  }
  const noAuthority = invoke([full])
  assert.equal(noAuthority.status, 'fail')
  assert.equal(noAuthority.metrics?.projectionScopesWithInvalidSourceStageAuthority, 1)
  const conflict = { ...withoutExam(lower), viewId: 'conflicting-stage-authority' }
  const ambiguous = invoke([full, lower, conflict])
  assert.equal(ambiguous.status, 'fail')
  assert(ambiguous.details?.some(detail => detail.includes('Conflicting explicit source-stage authorities')))
  const supportOnly = structuredClone(full)
  const markSupport = (nodes: CompositionViewNode[]) => nodes.forEach(node => {
    if (node.kind === 'structure') markSupport(node.children)
    else if ('goalId' in node && node.goalId === 'exam') node.projectionRole = 'prerequisiteOnly'
  })
  markSupport(supportOnly.rootNodes)
  assert.equal(invoke([supportOnly, lower]).status, 'fail', 'prerequisiteOnly never supplies a required target endpoint')
  const durationSource = structuredClone(landscape)
  durationSource.goals.find(candidate => candidate.id === 'exams')!.contains.push('g8-exam', 'g9-exam')
  durationSource.goals.push(...(['G8', 'G9'] as const).map(durationModel => ({
    ...goal(durationModel.toLowerCase() + '-exam', ['lower']), tags: [durationModel], nodeKind: 'exam', examData: {},
  } as LearningGoal)))
  const durationFull = structuredClone(full), durationAuthority = structuredClone(lower)
  durationFull.scope.durationModel = 'G8'
  for (const candidate of [durationFull, durationAuthority]) {
    const subject = candidate.rootNodes[0]
    if (subject.kind !== 'structure' || subject.children[1].kind !== 'structure') throw new Error('Expected stage fixture')
    subject.children[1].children.push({ kind: 'goalEntry', goalId: 'g8-exam' }, { kind: 'goalEntry', goalId: 'g9-exam' })
  }
  const durationResult = invoke([durationFull, durationAuthority], durationSource)
  assert.equal(durationResult.status, 'pass', JSON.stringify(durationResult))
  assert.equal(durationResult.metrics?.projectionScopesWithInvalidSourceStageAuthority, 0,
    'a neutral authority uses the requested G8 filter; its G9 seed is not an invented missing target')
  const wrongDuration = structuredClone(lower)
  wrongDuration.scope.durationModel = 'G9'
  assert.equal(invoke([durationFull, wrongDuration], durationSource).status, 'fail', 'missing G8 never borrows G9')
  const physicsId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
  const supportSource = structuredClone(landscape)
  supportSource.landscapeId = physicsId
  supportSource.goals.find(candidate => candidate.id === 'root')!.contains.push('unused-prerequisite')
  supportSource.goals.find(candidate => candidate.id === 'exams')!.contains.push('unused-exam')
  supportSource.goals.find(candidate => candidate.id === 'exam')!.extendedData = { applicabilityFromRequires: true }
  supportSource.goals.push(goal('unused-prerequisite'), {
    ...goal('unused-exam', ['unused-prerequisite']), nodeKind: 'exam', examData: {},
    extendedData: { applicabilityFromRequires: true },
  } as LearningGoal)
  const supportViews = [structuredClone(full), structuredClone(lower)]
  for (const candidate of supportViews) {
    candidate.landscapeId = physicsId
    candidate.rootNodes.push({ kind: 'goalEntry', goalId: 'unused-prerequisite', projectionRole: 'prerequisiteOnly' },
      { kind: 'goalEntry', goalId: 'unused-exam', projectionRole: 'prerequisiteOnly' })
  }
  const physicsRoute = { ...profile, landscapeId: physicsId }
  const unusedSupportResult = invoke(supportViews, supportSource, physicsRoute)
  assert.equal(unusedSupportResult.status, 'pass', JSON.stringify(unusedSupportResult))
  assert.equal(unusedSupportResult.metrics?.requiredTerminalAutonomyGoals, 1,
    'unused own prerequisiteOnly declarations cannot make an otherwise unselected exam applicable')
  const absentNeeded = structuredClone(supportViews[0])
  const removeNeeded = (nodes: CompositionViewNode[]) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      if (node.kind === 'structure') removeNeeded(node.children)
      else if ('goalId' in node && node.goalId === 'lower') nodes.splice(i, 1)
    }
  }
  removeNeeded(absentNeeded.rootNodes)
  const missingRequiredResult = invoke([absentNeeded, supportViews[1]], supportSource, physicsRoute)
  assert.equal(missingRequiredResult.status, 'fail')
  assert(missingRequiredResult.details?.some(detail => detail.includes('exam->lower')),
    'an actual needed but unexposed prerequisite still fails the independent whole-task route check')
  const mathId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
  const mathSource = structuredClone(landscape)
  mathSource.landscapeId = mathId
  mathSource.goals.find(candidate => candidate.id === 'exams')!.contains.push('always-exam')
  mathSource.goals.push({ ...goal('always-exam', ['lower']), nodeKind: 'exam', examData: {} } as LearningGoal)
  const mathViews = [structuredClone(full), structuredClone(lower)]
  for (const candidate of mathViews) {
    candidate.landscapeId = mathId
    const subject = candidate.rootNodes[0]
    if (subject.kind !== 'structure' || subject.children[1].kind !== 'structure') throw new Error('Expected Math fixture')
    subject.children[1].children.push({ kind: 'goalEntry', goalId: 'always-exam' })
    candidate.rootNodes.push({ kind: 'canonicalSubtree', goalId: 'exams', projectionRole: 'prerequisiteOnly' })
  }
  markSupport(mathViews[0].rootNodes)
  const mathRoute = { ...profile, landscapeId: mathId, profileId: 'canonical-math-sek1' }
  assert.equal(invoke(mathViews, mathSource, mathRoute).status, 'pass',
    'an explicit atomic course exclusion survives a different neutral-stage target membership')
  const broadFallback = structuredClone(mathViews[0])
  const dropAlways = (nodes: CompositionViewNode[]) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      if (node.kind === 'structure') dropAlways(node.children)
      else if ('goalId' in node && node.goalId === 'always-exam') nodes.splice(i, 1)
    }
  }
  dropAlways(broadFallback.rootNodes)
  const broadFallbackFailure = invoke([broadFallback, mathViews[1]], mathSource, mathRoute)
  assert.equal(broadFallbackFailure.status, 'fail')
  assert(broadFallbackFailure.details?.some(detail => detail.includes('Missing terminal autonomy goal(s):') && detail.includes('always-exam')),
    'a removed required Math endpoint remains missing even when its broad support ancestor exposes it')
  assert.deepEqual(full, view('CrossStage'))
  assert.deepEqual(lower, view('SekI'))
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
console.log('Source-stage route membership: exact product matching, independent target/exam obligations, explicit course exclusions without broad fallbacks, duration and actual learning-basis support, 12 actual CQR-104 invocations and immutable inputs passed.')
