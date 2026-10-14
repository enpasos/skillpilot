import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildRequiresInventory, bytesFingerprint, fileFingerprint, stableJson, type InventoryConfig } from './lib/crossSubjectRequiresInventory'
import { validateRequiresDecisions } from './lib/crossSubjectRequiresReview'

const repoRoot = resolve(process.cwd(), '..')
const argumentsList = process.argv.slice(2)
const option = (name: string, fallback?: string) => {
  const index = argumentsList.indexOf(name)
  return index >= 0 ? argumentsList[index + 1] : fallback
}
const configPath = resolve(repoRoot, option('--config', 'curricula/quality/cross-subject-requires/math-physics.config.json')!)
const outputPath = resolve(repoRoot, option('--output', 'curricula/quality/cross-subject-requires/math-physics.inventory.json')!)
const config = JSON.parse(readFileSync(configPath, 'utf8')) as InventoryConfig
const inventory = buildRequiresInventory(repoRoot, config)
if (argumentsList.includes('--write')) {
  mkdirSync(dirname(outputPath), { recursive: true })
  // Compact records keep this global ledger reviewable without repeating the
  // substantial source evidence already held in its hash-bound source files.
  writeFileSync(outputPath, `${JSON.stringify(inventory)}\n`)
  console.log(`Wrote ${outputPath}`)
}
if (argumentsList.includes('--check')) {
  if (!existsSync(outputPath) || stableJson(JSON.parse(readFileSync(outputPath, 'utf8'))) !== stableJson(inventory)) {
    console.error('Inventory is stale or missing. Regenerate it with --write after reviewing the changed input.')
    process.exitCode = 1
  }
}
for (const family of inventory.families) console.log(`${family.familyId}: ${family.counts.stableGoalIds} stable IDs, `
  + `${family.counts.technicalLeaves} technical leaves, ${family.counts.curricularAtomic} curricularAtomic, `
  + `${family.counts.conflictingOccurrences} conflicting occurrences; review pending.`)
console.log(`Active files: ${inventory.activeLandscapeFiles}; definition conflict groups: ${inventory.activeDefinitionConflicts.length}.`)
const ledgerOption = option('--ledger')
if (ledgerOption) {
  const ledgerPath = resolve(repoRoot, ledgerOption)
  const ledgerBytes = readFileSync(ledgerPath)
  const ledger = JSON.parse(ledgerBytes.toString('utf8'))
  const reviewOption = option('--independent-review')
  const review = reviewOption ? JSON.parse(readFileSync(resolve(repoRoot, reviewOption), 'utf8')) : undefined
  const result = validateRequiresDecisions(inventory, ledger, {
    familyIds: option('--family')?.split(','), requireComplete: argumentsList.includes('--require-complete'),
    independentReview: review, authorLedgerSha256: bytesFingerprint(ledgerBytes),
    inventorySha256: existsSync(outputPath) ? fileFingerprint(outputPath) : undefined,
    reviewedInventorySha256: ledger.baselineInventorySha256,
    sourcePathExists: path => existsSync(resolve(repoRoot, path)),
  })
  for (const error of result.errors) console.error(error)
  console.log(`Decision coverage: ${result.reviewed}/${result.required} independently approved; ${result.open} open.`)
  if (result.errors.length) process.exitCode = 1
}
