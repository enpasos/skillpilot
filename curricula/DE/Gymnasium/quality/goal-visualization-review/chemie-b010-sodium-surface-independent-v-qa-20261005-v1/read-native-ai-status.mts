// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../..')
const { aiApprovalStatus } = await import(pathToFileURL(resolve(root, 'app/src/utils/goalVisualizationQaStatus.ts')).href)
const input = JSON.parse(readFileSync(resolve(own, 'native-v-fields.candidate.json'), 'utf8'))
console.log(JSON.stringify({scope: 'one inactive reviewed candidate image field record only', rows: input.records.map((r: Record<string, unknown>) => ({goalId:r.goalId,nativeAiStatus:aiApprovalStatus(r)})), activeQaChanged:false, currentGoalPageBindingApproved:false, fullNativeCoverageClaimed:false, humanApproval:false},null,2))
