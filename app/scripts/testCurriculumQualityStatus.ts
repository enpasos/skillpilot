import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import type { CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import {
  collectRenderedAtomicGoalIdsFromCompositionView,
  collectWholeMaterialPrerequisiteClosure,
  compositionStageAuthorityProjectionSetsAgree,
} from './generateCurriculumQualityStatus'

const fixtureParent = resolve(import.meta.dirname, '../node_modules/.tmp')
mkdirSync(fixtureParent, { recursive: true })
const fixture = mkdtempSync(resolve(fixtureParent, 'cqr-stage-role-specificity-'))
try {
  const goal = (id: string, contains: string[] = []): LearningGoal => ({
    id, title: id, type: contains.length > 0 ? 'cluster' : 'atomic', contains, requires: [],
  } as LearningGoal)
  const landscape = {
    landscapeId: 'cqr-stage-fixture', title: 'Stage role specificity',
    goals: [
      { ...goal('root', ['lower', 'support-family']), tags: ['root'] },
      goal('lower'), goal('support-family', ['upper', 'real-support']), goal('upper'),
      { ...goal('real-support'), phase: 'Q1' },
    ],
  } as SkillLandscape
  const view = (broadSupport: boolean): CompositionView => ({
    viewId: broadSupport ? 'broad-support' : 'direct-support', landscapeId: landscape.landscapeId,
    scope: { schoolForm: 'Gymnasium', stage: 'CrossStage' },
    rootNodes: [
      { kind: 'structure', id: 'subject', label: 'Subject', children: [
        { kind: 'structure', id: 'seki', label: 'Sekundarstufe I', children: [
          { kind: 'goalEntry', goalId: 'lower' },
        ] },
        { kind: 'structure', id: 'sekii', label: 'Sekundarstufe II', children: [
          { kind: 'goalEntry', goalId: 'upper' },
        ] },
      ] },
      broadSupport
        ? { kind: 'canonicalSubtree', goalId: 'support-family', projectionRole: 'prerequisiteOnly' }
        : { kind: 'goalEntry', goalId: 'real-support', projectionRole: 'prerequisiteOnly' },
    ],
  })
  let nextFile = 0
  const collect = (candidate: CompositionView, source = landscape) => {
    const file = resolve(fixture, `view-${nextFile++}.json`)
    writeFileSync(file, JSON.stringify(candidate))
    return {
      targetGoalIds: collectRenderedAtomicGoalIdsFromCompositionView(source, file, [], false, 'SekI'),
      visibleGoalIds: collectRenderedAtomicGoalIdsFromCompositionView(source, file, [], true, 'SekI'),
    }
  }
  const broad = collect(view(true)), direct = collect(view(false))
  assert.deepEqual([...broad.targetGoalIds].sort(), ['lower'])
  assert.deepEqual([...broad.visibleGoalIds].sort(), ['lower', 'real-support'],
    'a specific Sek-II target must not leak into Sek-I support through its broad prerequisite-only ancestor')
  assert.equal(compositionStageAuthorityProjectionSetsAgree([broad, direct]), true,
    'equivalent stage authorities agree despite different broad support references')

  const subtreeTarget = view(true)
  const subject = subtreeTarget.rootNodes[0]
  assert.equal(subject.kind, 'structure')
  if (subject.kind !== 'structure') throw new Error('Expected fixture subject')
  const upperStage = subject.children[1]
  assert.equal(upperStage.kind, 'structure')
  if (upperStage.kind !== 'structure') throw new Error('Expected fixture upper stage')
  upperStage.children = [{ kind: 'canonicalSubtree', goalId: 'upper' }]
  assert.deepEqual([...collect(subtreeTarget).visibleGoalIds].sort(), ['lower', 'real-support'],
    'a nearer target subtree also wins over a broader prerequisite-only subtree')

  const missingSupport = view(false)
  missingSupport.rootNodes.pop()
  assert.equal(compositionStageAuthorityProjectionSetsAgree([direct, collect(missingSupport)]), false,
    'a genuine prerequisite-only support difference remains ambiguous')
  const differentTargets = view(false)
  const differentSubject = differentTargets.rootNodes[0]
  if (differentSubject.kind !== 'structure' || differentSubject.children[0].kind !== 'structure') {
    throw new Error('Expected fixture lower stage')
  }
  differentSubject.children[0].children = [{ kind: 'goalEntry', goalId: 'lower', projectionRole: 'prerequisiteOnly' }]
  const targetConflict = collect(differentTargets)
  assert.deepEqual([...targetConflict.visibleGoalIds].sort(), [...direct.visibleGoalIds].sort())
  assert.equal(compositionStageAuthorityProjectionSetsAgree([direct, targetConflict]), false,
    'different stage targets fail even when the visible support universe is identical')

  const requiredOutsideTarget = structuredClone(landscape)
  requiredOutsideTarget.goals.find((candidate) => candidate.id === 'lower')!.requires = ['upper']
  const scoped = collect(view(true), requiredOutsideTarget)
  const closure = collectWholeMaterialPrerequisiteClosure(requiredOutsideTarget, 'lower')
  assert.deepEqual(requiredOutsideTarget.goals.find((candidate) => candidate.id === 'lower')!.requires, ['upper'])
  assert.deepEqual([...closure.atomicGoalIds].filter((id) => !scoped.visibleGoalIds.has(id)), ['upper'],
    'a required outside-stage target stays a missing prerequisite, rather than becoming implicit support or route-complete')
  console.log('Curriculum quality stage-role specificity: resolved support, strict authority and missing-prerequisite controls passed.')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
