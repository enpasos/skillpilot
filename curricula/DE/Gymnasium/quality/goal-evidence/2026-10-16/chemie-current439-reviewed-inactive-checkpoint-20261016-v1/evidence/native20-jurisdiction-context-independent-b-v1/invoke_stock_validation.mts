import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
const config = JSON.parse(await readFile(process.argv[2], 'utf8'))
const stock = await import(pathToFileURL(config.validatorModule).href)
const bundle = JSON.parse(await readFile(config.bundle, 'utf8'))
const input = JSON.parse(await readFile(config.input, 'utf8'))
const campaign = JSON.parse(await readFile(config.campaign, 'utf8'))
const result = await stock.validateGoalDescriptionReviewCampaignResultDirectories({ bundle, input, campaign, batchesDirectory: config.batchesDirectory, resultsDirectory: config.resultsDirectory })
const report = { api: 'validateGoalDescriptionReviewCampaignResultDirectories', validatorModule: config.validatorModule, errorCount: result.errors.length, errors: result.errors, recordsValidated: result.records.length, ownGoalIds: result.records.map((record: { goalId: string }) => record.goalId) }
await writeFile(config.apiReportPath, JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report))
if (result.errors.length > 0 || result.records.length !== 20) process.exitCode = 1
