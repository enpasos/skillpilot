// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../..')
const { aiApprovalStatus } = await import(pathToFileURL(resolve(root, 'app/src/utils/goalVisualizationQaStatus.ts')).href)
const input = JSON.parse(readFileSync(resolve(own, 'native-v-fields.candidate.json'), 'utf8'))
console.log(JSON.stringify({
  scope: 'eight inactive exact Q1 candidate field records only',
  rows: input.records.map((record: Record<string, unknown>) => ({ goalId: record.goalId, nativeAiStatus: aiApprovalStatus(record) })),
  activeQaChanged: false,
  fullNativeCoverageClaimed: false,
  humanApproval: false,
}, null, 2))
