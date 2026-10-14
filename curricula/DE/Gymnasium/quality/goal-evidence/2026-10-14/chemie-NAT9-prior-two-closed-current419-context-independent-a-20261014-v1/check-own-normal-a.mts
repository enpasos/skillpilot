// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const own = dirname(fileURLToPath(import.meta.url))
const repo = resolve(own, '../../../../../../..')
const round = resolve(own, '../chemie-NAT9-prior-two-closed-current419-context-impact-preparation-technical-20261014-v1/native-two-current/round-a')
const json = (name: string) => JSON.parse(readFileSync(resolve(round, name), 'utf8'))
const { validateGoalDescriptionReviewBatch } = await import(pathToFileURL(resolve(repo, 'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const stem = 'chemie-NAT9-prior-two-closed-current419-context-20261014-v1-first-pass-a.batch-001'
const result = await validateGoalDescriptionReviewBatch({
  bundle: json('review-bundle-manifest.json'), input: json('description-review-input.json'),
  campaign: json('description-review-campaign.json'), run: json('results/'+stem+'.run.json'),
  batchInputBytes: readFileSync(resolve(round, 'batches/'+stem+'.input.jsonl')),
  recordsBytes: readFileSync(resolve(round, 'results/'+stem+'.records.jsonl')),
})
const report = { schemaVersion: 1, checkedAtUTC: new Date().toISOString(), check: 'Unchanged production validateGoalDescriptionReviewBatch on own A only', firstScientificOutcomeUnchanged: true, records: result.records.length, errors: result.errors, peerOutputsRead: false, wholeDOrPAMVAcceptanceClaimed: false }
writeFileSync(resolve(own, 'CHECK.own-normal-A.stock-validator.actual.json'), JSON.stringify(report, null, 2)+'\n')
console.log(JSON.stringify(report))
if (result.errors.length) process.exitCode = 1
