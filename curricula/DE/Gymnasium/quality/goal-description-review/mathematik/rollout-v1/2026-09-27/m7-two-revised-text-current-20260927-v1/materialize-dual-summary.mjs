#!/usr/bin/env node
// Reproduce the dual-round validation result without accepting AI reviews automatically.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-two-revised-text-current-20260927-v1/'
const runner = resolve(root, 'app/node_modules/.bin/tsx')
const validator = resolve(root, 'app/scripts/validateGoalDescriptionReviewDualRound.ts')
const options = []
for (const [label, round] of [['first', 'round-a'], ['second', 'round-b']]) {
  options.push(
    `--${label}-bundle`, `${base}bundle/manifest.json`,
    `--${label}-input`, `${base}${round}/description-review-input.json`,
    `--${label}-campaign`, `${base}${round}/description-review-campaign.json`,
    `--${label}-batches-dir`, `${base}${round}/batches`,
    `--${label}-results-dir`, `${base}${round}/results`,
  )
}
options.push('--diversity-policy', 'report_only')
const output = execFileSync(runner, [validator, ...options], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 1024 * 1024,
})
const summary = JSON.parse(output)
if (summary.goalCount !== 2 || summary.counts.unavailable !== 0 || summary.automaticAcceptance !== false) {
  throw new Error('Unexpected two-goal dual-round summary')
}
const target = resolve(root, `${base}dual-summary.json`)
const bytes = `${JSON.stringify(summary, null, 2)}\n`
const mode = process.argv.slice(2).join(' ')
if (mode === '--write') {
  writeFileSync(target, bytes, { flag: 'wx' })
  console.log(`Wrote ${target}`)
} else if (mode === '--refresh') {
  readFileSync(target, 'utf8')
  writeFileSync(target, bytes)
  console.log(`Refreshed ${target}`)
} else if (process.argv.length === 2) {
  if (readFileSync(target, 'utf8') !== bytes) throw new Error('Dual-summary bytes differ from current validated rounds')
  console.log(`Verified ${target}`)
} else {
  throw new Error('Usage: node materialize-dual-summary.mjs [--write|--refresh]')
}
