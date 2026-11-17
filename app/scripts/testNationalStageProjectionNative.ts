import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { SkillLandscape } from '../src/landscapeTypes'
import type { CompositionView, CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { createRouteProfiles, evaluateRouteProfile } from './generateCurriculumQualityStatus'

const repository = resolve(import.meta.dirname, '../..')
const canonicalDir = resolve(repository, 'curricula/DE/Gymnasium/canonical')
const files = readdirSync(canonicalDir).filter(file => file.endsWith('.json')).map(file => resolve(canonicalDir, file))
const catalog = files.map(file => JSON.parse(readFileSync(file, 'utf8')) as SkillLandscape)
const landscape = catalog.find(candidate => candidate.landscapeId === '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a')!
const applicability = buildApplicabilityCompilation(catalog.map((source, index) => ({ file: files[index], landscape: source })))
// This isolated fixture binds the full exposure and the independent BW stage
// authority. Production
// continues to enumerate all sixteen supported jurisdictions and all real views.
const scopedApplicability = { ...applicability, summary: { ...applicability.summary, supportedValues: ['DE-BW'] } }
const profile = createRouteProfiles().find(candidate => candidate.profileId === 'canonical-physics-sek1')!
const viewDir = resolve(repository, 'curricula/DE/Gymnasium/composition-views/physik')
const national = JSON.parse(readFileSync(resolve(viewDir, 'de-de-gym-physics-gk.view.json'), 'utf8')) as CompositionView
const bw = JSON.parse(readFileSync(resolve(viewDir, 'de-bw-gk.view.json'), 'utf8')) as CompositionView
const bwStage = JSON.parse(readFileSync(resolve(viewDir, 'de-bw-seki.view.json'), 'utf8')) as CompositionView
const fixtureParent = resolve(import.meta.dirname, '../node_modules/.tmp')
mkdirSync(fixtureParent, { recursive: true })
const fixture = mkdtempSync(resolve(fixtureParent, 'cqr-national-stage-native-'))
try {
  const nationalFile = resolve(fixture, 'national.view.json'), bwFile = resolve(fixture, 'bw.view.json')
  const stageFile = resolve(fixture, 'bw-stage.view.json')
  writeFileSync(bwFile, JSON.stringify(bw))
  writeFileSync(stageFile, JSON.stringify(bwStage))
  const invoke = (candidate: CompositionView) => {
    writeFileSync(nationalFile, JSON.stringify(candidate))
    return evaluateRouteProfile(landscape, profile, scopedApplicability, catalog, [nationalFile, bwFile, stageFile])
      .rules.find(rule => rule.id === 'CQR-104')!
  }
  const baseline = invoke(national)
  assert.equal(baseline.status, 'pass', `The real native BW fixture must initially pass: ${JSON.stringify(baseline.details)}`)
  const terminal = 'dfd2628f-b44e-51b3-86e8-99158861be8c'
  const prerequisite = '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2'
  const without = (source: CompositionView, goalId: string, removeContainingSubtrees = false) => {
    const candidate = structuredClone(source)
    const goalById = new Map(landscape.goals.map(goal => [goal.id, goal]))
    const contains = (id: string): boolean => id === goalId || (goalById.get(id)?.contains ?? []).some(contains)
    const remove = (nodes: CompositionViewNode[]) => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        if ((node.kind === 'goalEntry' || node.kind === 'canonicalSubtree') && node.goalId === goalId) nodes.splice(i, 1)
        else if (removeContainingSubtrees && node.kind === 'canonicalSubtree' && contains(node.goalId)) nodes.splice(i, 1)
        else if (node.kind === 'structure') remove(node.children)
      }
    }
    remove(candidate.rootNodes)
    return candidate
  }
  const missingTerminal = invoke(without(national, terminal))
  assert.equal(missingTerminal.status, 'fail')
  assert.equal(missingTerminal.metrics?.minimumRequiredTerminalAutonomyGoals, baseline.metrics?.minimumRequiredTerminalAutonomyGoals)
  assert.equal(missingTerminal.metrics?.requiredTerminalAutonomyGoals, baseline.metrics?.requiredTerminalAutonomyGoals)
  assert(missingTerminal.details?.some(detail => detail.startsWith('Missing terminal autonomy goal(s):') && detail.includes(terminal)),
    'The actual CQR-104 invocation must reject a missing national full-space terminal despite the unchanged BW target')
  const missingPreparation = invoke(without(national, prerequisite, true))
  assert.equal(missingPreparation.status, 'fail')
  assert(missingPreparation.details?.some(detail => detail.startsWith('Explicitly scoped terminal prerequisite(s) missing from projection:')
    && detail.includes(`${terminal}->${prerequisite}`)),
  'The actual CQR-104 invocation must reject missing whole-task preparation despite an intact Land route')
  assert.deepEqual(JSON.parse(readFileSync(resolve(viewDir, 'de-de-gym-physics-gk.view.json'), 'utf8')), national)
  assert.deepEqual(JSON.parse(readFileSync(resolve(viewDir, 'de-bw-gk.view.json'), 'utf8')), bw)
  assert.deepEqual(JSON.parse(readFileSync(resolve(viewDir, 'de-bw-seki.view.json'), 'utf8')), bwStage)
  console.log('Native CQR-104: real BW baseline PASS; missing national terminal FAIL with identical expected counts; missing whole-task preparation FAIL. Active views unchanged.')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
