// SPDX-License-Identifier: Apache-2.0
// Validate both proper finite configs and subset paths before any new Prepare.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const own = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let repo = own
while (!existsSync(resolve(repo, 'AGENTS.md'))) repo = dirname(repo)
const read = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'))
const plan = read(resolve(own, 'checks/INPUTS.two-proper-stock-batches15-and9.technical.json'))
const host = resolve(repo, plan.executionHost)
const mod = (n: string) => import(pathToFileURL(resolve(host, 'app/scripts', n + '.ts')).href)
const { loadGoalDescriptionRolloutBatchConfig, buildGoalDescriptionRolloutSubsetModel } = await mod('materializeGoalDescriptionRolloutBatch')
const { parseAndValidateGoalBookModel } = await mod('goalBookModel')
const full = parseAndValidateGoalBookModel(read(resolve(own, 'full426/book-model.json')))
const semantic = read(plan.semantic.path)
const all: string[] = []
const rows = []
for (const batch of plan.batches) {
  const loaded = await loadGoalDescriptionRolloutBatchConfig(batch.configPath)
  const config = loaded.config
  const base = read(config.baseGoalBookConfigPath)
  for (const p of [config.baseGoalBookConfigPath, config.promptPath, config.criteriaPath,
    base.landscapePath, base.compositionViewPath, base.semanticKindLedgerPath,
    base.goalVisualizationQaPath, ...base.evidenceReviewPaths]) {
    if (!existsSync(resolve(host, p))) throw new Error('Missing exact private-host input: ' + p)
  }
  if (semantic.sourceLandscapePath !== base.landscapePath) throw new Error('Exact semantic address mismatch')
  if (base.landscapePath !== full.source.landscapePath) throw new Error('Saved full426 source path mismatch')
  if (existsSync(loaded.outputDirectory)) throw new Error('Native output already exists')
  const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: full, goalIds: config.goalIds,
    bookId: config.bookId, title: config.title })
  if (subset.pages.length !== batch.expectedGoalCount) throw new Error('Wrong finite subset count')
  all.push(...config.goalIds)
  rows.push({ configPath: batch.configPath, closedStockConfigValidator: 'PASS',
    unmodifiedStockSubsetReferenceAndPrerequisiteCheck: 'PASS', selected: subset.pages.length,
    fullBaseModelDigest: full.digest, actualStockSubsetDigestNoRender: subset.digest })
}
if (all.length !== 24 || new Set(all).size !== 24) throw new Error('Expected exactly24 distinct goals across two legal batches')
const output = resolve(own, 'checks/PREFLIGHT.two-proper-stock-configs-paths-and-subsets.no-build.actual.json')
if (existsSync(output)) throw new Error('Refusing preflight receipt overwrite')
writeFileSync(output, JSON.stringify({ role: 'Actual unchanged closed stock config and subset validation before two Prepare calls',
  rows, allDistinctGoalIds: all, fullModelRebuilds: 0, rendererRuns: 0, scientificVotes: 0 }, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ configValidation: 'PASS', subsetValidation: 'PASS', batches: [15, 9], distinctGoals: 24, fullModelRebuilds: 0, rendererRuns: 0 }))
