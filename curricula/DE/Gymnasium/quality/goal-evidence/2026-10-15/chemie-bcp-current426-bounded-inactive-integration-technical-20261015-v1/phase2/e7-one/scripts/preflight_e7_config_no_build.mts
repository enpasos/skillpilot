// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const own = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let repo = own
while (!existsSync(resolve(repo, 'AGENTS.md'))) repo = dirname(repo)
const read = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'))
const plan = read(resolve(own, 'INPUTS.one-required-proper-e7-native.root-authorized.json'))
const host = resolve(repo, plan.readOnlyExecutionHost)
const mod = (n: string) => import(pathToFileURL(resolve(host, 'app/scripts', n + '.ts')).href)
const { loadGoalDescriptionRolloutBatchConfig, buildGoalDescriptionRolloutSubsetModel } = await mod('materializeGoalDescriptionRolloutBatch')
const { parseAndValidateGoalBookModel } = await mod('goalBookModel')
const loaded = await loadGoalDescriptionRolloutBatchConfig(plan.nativeConfig.path)
const full = parseAndValidateGoalBookModel(read(plan.savedFull426Model.path))
const base = read(loaded.config.baseGoalBookConfigPath)
if (full.pages.length !== 426 || full.source.landscapePath !== base.landscapePath) throw new Error('Saved exact full426 base mismatch')
const semantic = read(base.semanticKindLedgerPath)
if (semantic.sourceLandscapePath !== base.landscapePath) throw new Error('Semantic source addressing mismatch')
const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: full, goalIds: loaded.config.goalIds,
  bookId: loaded.config.bookId, title: loaded.config.title })
if (subset.pages.length !== 1 || subset.pages[0].goalId !== plan.goalId || subset.pages[0].evidenceReview !== null) throw new Error('D1 scope/null-profile mismatch')
for (const p of [base.landscapePath, base.compositionViewPath, base.semanticKindLedgerPath,
  base.goalVisualizationQaPath, ...base.evidenceReviewPaths, loaded.config.promptPath, loaded.config.criteriaPath]) {
  if (!existsSync(resolve(host, p))) throw new Error('Missing existing exact input: ' + p)
}
if (existsSync(loaded.outputDirectory)) throw new Error('D1 output already exists')
const p = resolve(own, 'PREFLIGHT.actual-stock-e7-config-and-subset.no-build.json')
if (existsSync(p)) throw new Error('Refusing overwrite')
writeFileSync(p, JSON.stringify({ role: 'Required actual unchanged stock preflight before the single authorized D1 render',
  closedConfigValidation: 'PASS', actualStockSubsetValidation: 'PASS', goalId: plan.goalId,
  savedFull426Digest: full.digest, prospectiveStockSubsetDigest: subset.digest,
  evidenceProfile: null, fullModelBuilds: 0, rendererRuns: 0, FIRSTsRead: false }, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ config: 'PASS', subset: 'PASS', goalCount: 1, evidenceProfile: null, fullModelBuilds: 0 }))
