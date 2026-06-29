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
  'prompt-append-file',
]
const TEMPORARY_PROVIDER_FAILURE_EXIT_CODE = 75

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
    '                              Temporary provider quota/rate-limit errors still stop the batch.',
    '  --max <n>                  Process at most n goals.',
    '  --resume-file <path>       Pending-goals file written after temporary provider failure.',
    '                              Default: <batch-file>.resume.txt or tmp/goal-visualization-resume-after-provider-failure.txt.',
    '  --prompt-append-file <path> Shared extra provider instruction read from a UTF-8 text/Markdown file.',
    '  --prompt-append-dir <path>  Directory with per-goal prompt append files named <goal-id>.md or <goal-id>.txt.',
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
  const goalPromptAppendFile = findGoalPromptAppendFile(args, goal)

  for (const option of FORWARDED_OPTIONS) {
    const value = getStringArg(args, option)
    if (value && !(option === 'prompt-append-file' && goalPromptAppendFile)) {
      forwarded.push(`--${option}=${value}`)
    }
  }

  if (goalPromptAppendFile) {
    forwarded.push(`--prompt-append-file=${goalPromptAppendFile}`)
  }

  if (getBooleanArg(args, 'dry-run')) {
    forwarded.push('--dry-run')
  }
  if (getBooleanArg(args, 'no-import')) {
    forwarded.push('--no-import')
  }

  return forwarded
}

function findGoalPromptAppendFile(args, goal) {
  const promptAppendDir = getStringArg(args, 'prompt-append-dir')
  if (!promptAppendDir) {
    return undefined
  }

  const fullDir = resolveProjectPath(promptAppendDir)
  const candidates = [
    path.join(fullDir, `${goal}.md`),
    path.join(fullDir, `${goal}.txt`),
    path.join(fullDir, `${goal}.prompt.md`),
    path.join(fullDir, `${goal}.prompt.txt`),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate))
}

function defaultResumeFilePath(args) {
  const resumeFile = getStringArg(args, 'resume-file')
  if (resumeFile) {
    return resolveProjectPath(resumeFile)
  }

  const goalsFromFile = getStringArg(args, 'file')
  if (goalsFromFile) {
    const batchPath = resolveProjectPath(goalsFromFile)
    if (path.basename(batchPath).includes('.resume.')) {
      return batchPath
    }
    const ext = path.extname(batchPath)
    if (ext) {
      return path.join(path.dirname(batchPath), `${path.basename(batchPath, ext)}.resume${ext}`)
    }
    return `${batchPath}.resume.txt`
  }

  return path.join(ROOT_DIR, 'tmp/goal-visualization-resume-after-provider-failure.txt')
}

function writeResumeFile(args, goals, failedIndex, status) {
  const resumeFilePath = defaultResumeFilePath(args)
  const pendingGoals = goals.slice(failedIndex)
  const lines = [
    '# Goal visualization batch resume file',
    `# Created: ${new Date().toISOString()}`,
    `# Reason: temporary provider failure, exit code ${status}`,
    '# Retry with:',
    `# npm --prefix app run visualization:generate:nano-banana:batch -- --file ${path.relative(ROOT_DIR, resumeFilePath).replace(/\\/g, '/')} --continue-on-error`,
    '',
    ...pendingGoals,
    '',
  ]

  fs.mkdirSync(path.dirname(resumeFilePath), { recursive: true })
  fs.writeFileSync(resumeFilePath, lines.join('\n'), 'utf-8')
  return resumeFilePath
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
      if (result.status === TEMPORARY_PROVIDER_FAILURE_EXIT_CODE) {
        const resumeFilePath = writeResumeFile(args, goals, index, result.status)
        throw new Error(
          `Batch stopped after temporary provider failure for goal "${goal}" (exit code ${result.status}). ` +
            `Retry later from ${path.relative(ROOT_DIR, resumeFilePath).replace(/\\/g, '/')}; remaining goals were not requested.`,
        )
      }
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
