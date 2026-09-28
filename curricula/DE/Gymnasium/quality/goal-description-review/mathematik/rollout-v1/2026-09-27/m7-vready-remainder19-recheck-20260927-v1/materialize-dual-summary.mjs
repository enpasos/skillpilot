#!/usr/bin/env node
// Capture and re-verify the current project's bound dual-round validation result.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = dirname(fileURLToPath(import.meta.url))
const root = process.cwd()
const runner = resolve(root, 'app/node_modules/.bin/tsx')
const validator = resolve(root, 'app/scripts/validateGoalDescriptionReviewDualRound.ts')
const options = []
for (const [label, round] of [['first', 'round-a'], ['second', 'round-b']]) {
  options.push(
    '--' + label + '-bundle', join(packageDir, 'bundle/manifest.json'),
    '--' + label + '-input', join(packageDir, round, 'description-review-input.json'),
    '--' + label + '-campaign', join(packageDir, round, 'description-review-campaign.json'),
    '--' + label + '-batches-dir', join(packageDir, round, 'batches'),
    '--' + label + '-results-dir', join(packageDir, round, 'results'),
  )
}
options.push('--diversity-policy', 'report_only')
const output = execFileSync(runner, [validator, ...options], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 1024 * 1024,
})
const summary = JSON.parse(output)
if (summary.goalCount !== 19 || summary.counts.unavailable !== 0 || summary.automaticAcceptance !== false) {
  throw new Error('Unexpected 19-goal dual-round summary')
}
const target = join(packageDir, 'dual-summary.json')
const bytes = JSON.stringify(summary, null, 2) + '\n'
const mode = process.argv.slice(2).join(' ')
if (mode === '--write') {
  writeFileSync(target, bytes, { flag: 'wx' })
  console.log('Wrote ' + target)
} else if (mode === '') {
  if (readFileSync(target, 'utf8') !== bytes) {
    throw new Error('Dual-summary bytes differ from current validated rounds')
  }
  console.log('Verified ' + target)
} else {
  throw new Error('Usage: node materialize-dual-summary.mjs [--write]')
}
