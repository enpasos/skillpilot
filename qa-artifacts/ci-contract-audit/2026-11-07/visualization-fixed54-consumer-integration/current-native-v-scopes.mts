// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const deep = await import(pathToFileURL(resolve(root, 'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const configs = deep.loadDeepUnderstandingRolloutConfig().subjects
const inputs = configs.map((config: { landscapePath: string; visualizationQaPath: string }) => ({
  source: config.landscapePath, sourceSha256: createHash('sha256').update(readFileSync(resolve(root, config.landscapePath))).digest('hex'),
  qa: config.visualizationQaPath, qaSha256: createHash('sha256').update(readFileSync(resolve(root, config.visualizationQaPath))).digest('hex'),
  landscapeId: JSON.parse(readFileSync(resolve(root, config.landscapePath), 'utf8')).landscapeId,
}))
const scopes = deep.readCurrentCurriculumVisualizationScopes(inputs.map((row: { landscapeId: string }) => row.landscapeId))
console.log(JSON.stringify({ inputs, scopes: [...scopes.values()] }, null, 2))
