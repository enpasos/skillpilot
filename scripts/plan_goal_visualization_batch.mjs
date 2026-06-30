import fs from 'node:fs'
import path from 'node:path'

import {
  DEFAULT_LANDSCAPE_PATH,
  ROOT_DIR,
  getBooleanArg,
  getStringArg,
  parseCliArgs,
  readLandscape,
  toProjectPath,
} from './goal_visualization_common.mjs'

function usage() {
  return [
    'Usage:',
    '  npm --prefix app run visualization:plan-batch',
    '',
    'Options:',
    '  --count <n>              Number of goals to select. Default: 10.',
    '  --phase <phase>          Optional phase filter, e.g. J5, J6, E, Q1.',
    `  --landscape <path>       Landscape JSON. Default: ${DEFAULT_LANDSCAPE_PATH}`,
    '  --output <path>          Output batch file. Default: tmp/goal-visualization-next-batch.txt.',
    '  --include-deferred       Also include goals marked deferred_provider_limitation in review ledgers.',
  ].join('\n')
}

function hasVisualization(goal) {
  return (goal.resourceLinks ?? []).some((link) => {
    return link.type === 'goal-visualization' || link.resourceType === 'goal-visualization'
  })
}

function hasChildren(goal) {
  return Array.isArray(goal.contains) && goal.contains.length > 0
}

function isAtomicVisualizationGoal(goal) {
  const tags = goal.tags ?? []
  return !hasChildren(goal)
    && goal.nodeKind !== 'memory'
    && goal.nodeKind !== 'exam'
    && goal.nodeKind !== 'tutor'
    && goal.examData === undefined
    && !tags.includes('memorization')
    && !tags.some((tag) => tag.startsWith('srs-deck:'))
}

function readDeferredGoalIds() {
  const reviewDir = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/quality/goal-visualization-review')
  if (!fs.existsSync(reviewDir)) {
    return new Set()
  }

  const deferredIds = new Set()
  for (const entry of fs.readdirSync(reviewDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue

    const content = fs.readFileSync(path.join(reviewDir, entry.name), 'utf-8')
    const rowPattern = /^\|\s*`(?<goalId>[^`]+)`\s*\|[^\n]*\|\s*`deferred_provider_limitation`\s*\|/gm
    for (const match of content.matchAll(rowPattern)) {
      const goalId = match.groups?.goalId?.trim()
      if (goalId) {
        deferredIds.add(goalId)
      }
    }
  }

  return deferredIds
}

function main() {
  const args = parseCliArgs()
  if (getBooleanArg(args, 'help')) {
    console.log(usage())
    return
  }

  const landscapePath = getStringArg(args, 'landscape', DEFAULT_LANDSCAPE_PATH) ?? DEFAULT_LANDSCAPE_PATH
  const countRaw = getStringArg(args, 'count', '10') ?? '10'
  const count = Number.parseInt(countRaw, 10)
  if (!Number.isFinite(count) || count < 1) {
    throw new Error(`Invalid --count value: ${countRaw}`)
  }

  const phase = getStringArg(args, 'phase')
  const outputPath = path.resolve(ROOT_DIR, getStringArg(args, 'output', 'tmp/goal-visualization-next-batch.txt') ?? 'tmp/goal-visualization-next-batch.txt')
  const includeDeferred = getBooleanArg(args, 'include-deferred')
  const deferredGoalIds = includeDeferred ? new Set() : readDeferredGoalIds()

  const landscape = readLandscape(landscapePath)
  const selected = (landscape.goals ?? [])
    .filter((goal) => goal.type === 'atomic')
    .filter(isAtomicVisualizationGoal)
    .filter((goal) => !phase || goal.phase === phase)
    .filter((goal) => !hasVisualization(goal))
    .filter((goal) => !deferredGoalIds.has(goal.id))
    .slice(0, count)

  if (selected.length === 0) {
    throw new Error('No matching atomic goals without visualization found.')
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(
    outputPath,
    `${selected.map((goal) => `${goal.id} # ${goal.title}`).join('\n')}\n`,
    'utf-8',
  )

  console.log(`Selected ${selected.length} goal(s).`)
  console.log(`Batch file: ${toProjectPath(outputPath)}`)
  console.log('')
  for (const goal of selected) {
    console.log(`${goal.id} | ${goal.title}`)
  }
  console.log('')
  console.log('Run:')
  console.log(`npm --prefix app run visualization:generate:nano-banana:batch -- --file ${toProjectPath(outputPath)} --continue-on-error`)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
