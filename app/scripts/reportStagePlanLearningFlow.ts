// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyStagePlanMaterialization, buildStagePlanMaterialization, resolveStagePlanPath, STAGE_PLAN_INDEX_PATH,
  type RawStagePlanSource,
} from './lib/stagePlanCatalog'
import { diagnoseStagePlanLearningFlow } from '../src/utils/stagePlanReport'
import type { StagePlanGoal } from '../src/utils/stagePlan'

const digest = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
export function reportStagePlanLearningFlow(args: string[], repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')) {
  let inventoryPath: string | undefined, outputPath = 'docs/qa-ci/status/stage-plan-learning-flow.json'
  let mode: 'write' | 'check' | undefined, requireNoBackflow = false
  for (let index = 0; index < args.length; index++) {
    const argument = args[index]
    if (argument === '--write' || argument === '--check') {
      if (mode) throw new Error('Choose exactly one of --write and --check.')
      mode = argument === '--write' ? 'write' : 'check'
    } else if (argument === '--inventory' || argument === '--output') {
      const value = args[++index]
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}.`)
      if (argument === '--inventory') {
        if (inventoryPath) throw new Error('Duplicate --inventory.')
        inventoryPath = value
      } else outputPath = value
    } else if (argument === '--require-no-backflow') requireNoBackflow = true
    else throw new Error(`Unknown stage-plan report argument: ${argument}`)
  }
  if (!inventoryPath || !mode) throw new Error('Usage: reportStagePlanLearningFlow.ts --inventory <activation.json> (--write|--check) [--output <report.json>] [--require-no-backflow]')
  if ((!outputPath.startsWith('docs/qa-ci/status/') && !outputPath.startsWith('tmp/')) || !outputPath.endsWith('.json')) {
    throw new Error('Stage-plan report output must be a JSON file under docs/qa-ci/status/ or tmp/.')
  }
  if (outputPath === inventoryPath) throw new Error('Stage-plan report cannot overwrite its activation authority.')
  const materialized = buildStagePlanMaterialization({ repositoryRoot, inventoryPath })
  // An out-of-date runtime projection cannot underpin a current-state report.
  applyStagePlanMaterialization(repositoryRoot, materialized, 'check')
  const readBound = (source: RawStagePlanSource) => {
    const bytes = readFileSync(resolveStagePlanPath(repositoryRoot, source.path))
    if (digest(bytes) !== source.sha256) throw new Error(`Stage-plan report input changed: ${source.path}`)
    return JSON.parse(bytes.toString('utf8'))
  }
  const goals = new Map<string, StagePlanGoal>()
  for (const source of materialized.index.canonicalSources) {
    const landscape = readBound(source) as { landscapeId: string; goals: StagePlanGoal[] }
    for (const goal of landscape.goals) {
      goals.set(goal.id, goal)
      goals.set(`${landscape.landscapeId}:${goal.id}`, goal)
    }
  }
  const diagnosis = diagnoseStagePlanLearningFlow({
    plans: materialized.index.plans.map(entry => entry.plan),
    views: materialized.index.views.map(entry => readBound(entry.source)), goals,
  })
  const report = {
    ...diagnosis,
    authority: { path: STAGE_PLAN_INDEX_PATH, sha256: digest(materialized.artifacts.get(STAGE_PLAN_INDEX_PATH)!),
      revision: materialized.index.catalog.revision, canonicalDomain: materialized.index.canonicalDomain },
  }
  const bytes = `${JSON.stringify(report, null, 2)}\n`
  applyStagePlanMaterialization(repositoryRoot, materialized, 'check')
  const output = resolveStagePlanPath(repositoryRoot, outputPath)
  if (mode === 'check') {
    if (!existsSync(output) || readFileSync(output, 'utf8') !== bytes) throw new Error(`Stage-plan learning-flow report is missing or stale: ${outputPath}`)
  } else {
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, bytes)
  }
  if (diagnosis.status === 'invalid-input') throw new Error('Stage-plan learning-flow report has invalid input; no plan acceptance is claimed.')
  if (requireNoBackflow && diagnosis.status !== 'no-stage-backflows') throw new Error('Stage-plan learning-flow report contains prerequisite backflows.')
  console.log(`Stage-plan learning-flow report: ${diagnosis.scopes.length} profile combinations; ${diagnosis.status}.`)
  return report
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { reportStagePlanLearningFlow(process.argv.slice(2)) }
  catch (error) { console.error((error as Error).message); process.exitCode = 1 }
}
