// SPDX-License-Identifier: Apache-2.0
// Independent native application projection by /root; portable transcription by /root/sachsen.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import {
  normalizeCanonicalLandscape,
  resolveCanonicalNodeType,
  type CanonicalAuthoringGoal,
} from '../../../../app/src/utils/authoring/canonicalAuthoring'
import {
  collectCompositionProjectionRoleGoalIds,
  normalizeCompositionView,
} from '../../../../app/src/utils/authoring/compositionViewAuthoring'

const repositoryRoot = new URL('../../../../', import.meta.url)
const viewPath = 'curricula/DE/Gymnasium/composition-views/physik/de-rp-seki.view.json'
const canonicalDirectory = 'curricula/DE/Gymnasium/canonical'
const revisions = [
  '8df38a054a15a6c3fc4036c35324c277bf68f628',
  'aa5ac41808a97c6f7ca1c2886382a4a98b61693b',
]

function git(...arguments_: string[]): string {
  return execFileSync('git', arguments_, {
    cwd: repositoryRoot,
    maxBuffer: 64 * 1024 * 1024,
    encoding: 'utf8',
  })
}

function readHistoricalJson(revision: string, path: string): unknown {
  return JSON.parse(git('show', `${revision}:${path}`))
}

function appliesToRhinelandPalatinate(goal: CanonicalAuthoringGoal): boolean {
  // This is the Sek I view: no GK/LK selection is needed. Match the explicit
  // jurisdiction membership used by the independent native diagnostic.
  const jurisdictions = [
    ...(goal.tags ?? []),
    ...Object.values(goal.applicability ?? {}).flat(),
  ].filter((value): value is string => typeof value === 'string' && /^DE-[A-Z]{2}$/u.test(value))
  return jurisdictions.length === 0 || jurisdictions.includes('DE-RP')
}

function tracePrerequisites(
  seed: string,
  goalsById: ReadonlyMap<string, CanonicalAuthoringGoal>,
): Map<string, string[]> {
  const paths = new Map<string, string[]>([[seed, [seed]]])
  const pending = [seed]
  for (let index = 0; index < pending.length; index++) {
    const goalId = pending[index]
    const goal = goalsById.get(goalId)
    if (!goal || resolveCanonicalNodeType(goal) !== 'atomic') {
      throw new Error(`Non-atomic or unresolved prerequisite: ${goalId}`)
    }
    for (const reference of goal.requires ?? []) {
      const prerequisiteId = reference.split(':').at(-1)!
      if (!paths.has(prerequisiteId)) {
        paths.set(prerequisiteId, [...paths.get(goalId)!, prerequisiteId])
        pending.push(prerequisiteId)
      }
    }
  }
  return paths
}

function inspectRevision(rev: string) {
  const goalsById = new Map<string, CanonicalAuthoringGoal>()
  const mathematicsAtoms = new Set<string>()
  const canonicalPaths = git('ls-tree', '-r', '--name-only', rev, '--', canonicalDirectory)
    .trim().split('\n').filter(path => path.endsWith('.de.json'))
  for (const path of canonicalPaths) {
    const landscape = normalizeCanonicalLandscape(readHistoricalJson(rev, path))
    for (const goal of landscape.goals) {
      goalsById.set(goal.id, goal)
      if (path.endsWith('_MATHEMATIK.de.json') && resolveCanonicalNodeType(goal) === 'atomic') {
        mathematicsAtoms.add(goal.id)
      }
    }
  }
  const view = normalizeCompositionView(readHistoricalJson(rev, viewPath))
  const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, goalsById)
  const seeds = [...targetGoalIds].filter(goalId => {
    const goal = goalsById.get(goalId)!
    return resolveCanonicalNodeType(goal) === 'atomic' && appliesToRhinelandPalatinate(goal)
  }).sort()
  const paths = new Map(seeds.map(seed => [seed, tracePrerequisites(seed, goalsById)]))
  const mathIds = [...new Set([...paths.values()].flatMap(prerequisites =>
    [...prerequisites.keys()].filter(goalId => mathematicsAtoms.has(goalId)),
  ))].sort()
  return { rev, seeds, mathIds, paths }
}

const results = revisions.map(inspectRevision)
const [prior, current] = results
const removed = prior.mathIds.filter(goalId => !current.mathIds.includes(goalId))
const added = current.mathIds.filter(goalId => !prior.mathIds.includes(goalId))
const consumers = removed.map(goalId => ({
  math: goalId,
  previous: prior.seeds.filter(seed => prior.paths.get(seed)!.has(goalId)).map(seed => ({
    seed,
    oneShortestPath: prior.paths.get(seed)!.get(goalId),
  })),
  current: current.seeds.filter(seed => current.paths.get(seed)!.has(goalId)),
}))

if (removed.length !== 3 || added.length !== 0 || prior.seeds.length !== 143
    || JSON.stringify(prior.seeds) !== JSON.stringify(current.seeds)) {
  throw new Error('Unverified transition in the RP Sek I scope')
}

const record = {
  viewPath,
  method: 'Current application composition role collector with scope-specific RP membership; separately traversed full canonical atomic graph at both revisions.',
  results: results.map(({ paths: _paths, ...values }) => values),
  removed,
  added,
  consumers,
}
writeFileSync(new URL('./native-rp-closure.actual.json', import.meta.url), `${JSON.stringify(record, null, 2)}\n`)
console.log(results.map(result => [result.seeds.length, result.mathIds.length]),
  consumers.map(consumer => [consumer.math, consumer.previous.length, consumer.current.length]))
