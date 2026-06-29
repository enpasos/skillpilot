import fs from 'node:fs'
import path from 'node:path'

import {
  DEFAULT_LANDSCAPE_PATH,
  ROOT_DIR,
  createVisualizationPrompt,
  findGoalOrThrow,
  getBooleanArg,
  getStringArg,
  parseCliArgs,
  readLandscape,
  resolveProjectPath,
  toProjectPath,
} from './goal_visualization_common.mjs'

function usage() {
  return [
    'Usage:',
    '  npm --prefix app run visualization:check-prompt-appends -- --file tmp/goal-batch.txt --prompt-append-dir tmp/prompts',
    '',
    'Options:',
    `  --landscape <path>         Landscape JSON. Default: ${DEFAULT_LANDSCAPE_PATH}`,
    '  --file <path>              Batch file with one goal ID or title fragment per line.',
    '  --prompt-append-dir <path> Directory with per-goal prompt append files.',
    '  --allow-missing            Do not fail if a goal has no prompt append file.',
    '  --no-require-sections      Do not require Pflichtinhalt/Vermeiden style sections.',
  ].join('\n')
}

function readGoalsFromFile(filePath) {
  const fullPath = resolveProjectPath(filePath)
  return fs
    .readFileSync(fullPath, 'utf-8')
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean)
}

function findPromptAppendFile(promptAppendDir, goalId) {
  const candidates = [
    path.join(promptAppendDir, `${goalId}.md`),
    path.join(promptAppendDir, `${goalId}.txt`),
    path.join(promptAppendDir, `${goalId}.prompt.md`),
    path.join(promptAppendDir, `${goalId}.prompt.txt`),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate))
}

function containsAnyGoalId(text, goalIds) {
  return goalIds.find((goalId) => text.includes(goalId))
}

function hasRequiredSections(text) {
  return /(?:^|\n)\s*(Pflichtinhalt|Must show|Required content)\s*:/i.test(text) &&
    /(?:^|\n)\s*(Vermeiden|Avoid)\s*:/i.test(text)
}

function main() {
  const args = parseCliArgs()
  if (getBooleanArg(args, 'help')) {
    console.log(usage())
    return
  }

  const file = getStringArg(args, 'file')
  const promptAppendDirRaw = getStringArg(args, 'prompt-append-dir')
  if (!file || !promptAppendDirRaw) {
    throw new Error(`${usage()}\n\nMissing --file or --prompt-append-dir.`)
  }

  const landscapePath = getStringArg(args, 'landscape', DEFAULT_LANDSCAPE_PATH) ?? DEFAULT_LANDSCAPE_PATH
  const landscape = readLandscape(landscapePath)
  const goalQueries = readGoalsFromFile(file)
  const goals = goalQueries.map((query) => findGoalOrThrow(landscape, query))
  const goalIds = goals.map((goal) => goal.id)
  const promptAppendDir = resolveProjectPath(promptAppendDirRaw)
  const allowMissing = getBooleanArg(args, 'allow-missing')
  const requireSections = !getBooleanArg(args, 'no-require-sections')

  const issues = []
  const checked = []

  for (const goal of goals) {
    const promptAppendFile = findPromptAppendFile(promptAppendDir, goal.id)
    if (!promptAppendFile) {
      if (!allowMissing) {
        issues.push(`${goal.id}: missing prompt append file`)
      }
      continue
    }

    const promptAppend = fs.readFileSync(promptAppendFile, 'utf-8').trim()
    if (!promptAppend) {
      issues.push(`${goal.id}: prompt append file is empty`)
      continue
    }

    if (requireSections && !hasRequiredSections(promptAppend)) {
      issues.push(`${goal.id}: prompt append file should contain Pflichtinhalt and Vermeiden sections`)
    }

    const providerPrompt = `${createVisualizationPrompt(goal)}\n\nZusatzanweisung:\n${promptAppend}`
    const leakedGoalId = containsAnyGoalId(providerPrompt, goalIds)
    if (leakedGoalId) {
      issues.push(`${goal.id}: provider prompt contains goal ID ${leakedGoalId}`)
    }
    if (providerPrompt.includes('SkillPilot')) {
      issues.push(`${goal.id}: provider prompt contains SkillPilot`)
    }

    checked.push({
      goalId: goal.id,
      title: goal.title,
      file: toProjectPath(promptAppendFile),
    })
  }

  if (issues.length > 0) {
    console.error(`Prompt append check failed with ${issues.length} issue(s):`)
    for (const issue of issues) {
      console.error(`- ${issue}`)
    }
    process.exit(1)
  }

  console.log(`Prompt append check passed for ${checked.length}/${goals.length} goal(s).`)
  for (const entry of checked) {
    console.log(`${entry.goalId} | ${entry.title} | ${entry.file}`)
  }
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
