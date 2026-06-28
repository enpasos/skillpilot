import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

import {
  ROOT_DIR,
  getBooleanArg,
  getPositionals,
  getStringArg,
  parseCliArgs,
  resolveProjectPath,
} from './goal_visualization_common.mjs'

const FORWARDED_OPTIONS = [
  'landscape',
  'subject',
  'lang',
  'model',
  'endpoint',
  'aspect-ratio',
  'image-size',
  'mime-type',
  'provider',
  'license',
  'review-status',
  'prompt-append',
]

function usage() {
  return [
    'Usage:',
    '  npm --prefix app run visualization:generate:nano-banana:batch -- <goal-1> <goal-2> <goal-3>',
    '',
    'Alternative:',
    '  npm --prefix app run visualization:generate:nano-banana:batch -- --goals="<goal-1>,<goal-2>,<goal-3>"',
    '  npm --prefix app run visualization:generate:nano-banana:batch -- --file tmp/goal-batch.txt',
    '',
    'Environment:',
    '  GEMINI_API_KEY or GOOGLE_API_KEY must be set unless --dry-run is used.',
    '',
    'Options:',
    '  --dry-run                  Write prompt/request packages only; no API calls.',
    '  --no-import                Save generated images only; do not update canonical JSON.',
    '  --continue-on-error        Continue with later goals after a failed goal.',
    '  --max <n>                  Process at most n goals.',
    '  plus shared single-goal options such as --aspect-ratio, --image-size, --mime-type, --prompt-append.',
  ].join('\n')
}

function splitGoalList(value) {
  return value
    .split(',')
    .map((goal) => goal.trim())
    .filter(Boolean)
}

function readGoalsFromFile(filePath) {
  const fullPath = resolveProjectPath(filePath)
  return fs
    .readFileSync(fullPath, 'utf-8')
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean)
}

function collectGoals(args) {
  const positionals = getPositionals(args)
  const goalsFromArg = getStringArg(args, 'goals')
  const goalsFromFile = getStringArg(args, 'file')

  const goals = [
    ...positionals,
    ...(goalsFromArg ? splitGoalList(goalsFromArg) : []),
    ...(goalsFromFile ? readGoalsFromFile(goalsFromFile) : []),
  ]

  return [...new Set(goals)]
}

function buildForwardedArgs(args, goal) {
  const forwarded = [path.join(ROOT_DIR, 'scripts/generate_goal_visualization_nano_banana.mjs'), goal]

  for (const option of FORWARDED_OPTIONS) {
    const value = getStringArg(args, option)
    if (value) {
      forwarded.push(`--${option}=${value}`)
    }
  }

  if (getBooleanArg(args, 'dry-run')) {
    forwarded.push('--dry-run')
  }
  if (getBooleanArg(args, 'no-import')) {
    forwarded.push('--no-import')
  }

  return forwarded
}

function main() {
  const args = parseCliArgs()

  if (getBooleanArg(args, 'help')) {
    console.log(usage())
    return
  }

  let goals = collectGoals(args)
  const max = getStringArg(args, 'max')
  if (max) {
    const maxCount = Number.parseInt(max, 10)
    if (!Number.isFinite(maxCount) || maxCount < 1) {
      throw new Error(`Invalid --max value: ${max}`)
    }
    goals = goals.slice(0, maxCount)
  }

  if (goals.length === 0) {
    throw new Error(`${usage()}\n\nMissing at least one goal.`)
  }

  const continueOnError = getBooleanArg(args, 'continue-on-error')
  const failures = []

  console.log(`Generating visualizations for ${goals.length} goal(s).`)

  goals.forEach((goal, index) => {
    console.log('')
    console.log(`[${index + 1}/${goals.length}] ${goal}`)

    const result = spawnSync(process.execPath, buildForwardedArgs(args, goal), {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: process.env,
    })

    if (result.status !== 0) {
      failures.push({ goal, status: result.status })
      if (!continueOnError) {
        throw new Error(`Batch stopped after failed goal "${goal}" with exit code ${result.status}.`)
      }
    }
  })

  if (failures.length > 0) {
    throw new Error(`Batch completed with ${failures.length} failure(s): ${failures.map((failure) => failure.goal).join(', ')}`)
  }

  console.log('')
  console.log('Batch completed successfully.')
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
