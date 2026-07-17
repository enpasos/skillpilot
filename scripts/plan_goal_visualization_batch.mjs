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
import {
  isOrdinaryAtomicGoalForVisualization,
  normalizeGoalVisualizationSubject,
} from './goal_visualization_scope.mjs'

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

function reviewDate(content, fileName) {
  const metadataDate = content.match(/^(?:Review date|Date):\s*(\d{4}-\d{2}-\d{2})\s*$/imu)?.[1]
  return metadataDate ?? fileName.match(/(\d{4}-\d{2}-\d{2})/u)?.[1] ?? ''
}

function reviewDisposition(cells) {
  for (const cell of cells) {
    const value = cell.replace(/^`|`$/gu, '').trim().toLowerCase()
    if (value === 'deferred_provider_limitation') return 'deferred_provider_limitation'
    if (value === 'accepted' || value.startsWith('accepted_') || value === 'approved') return 'accepted'
    if (
      value.startsWith('rejected')
      || value.startsWith('imported')
      || value.startsWith('withdrawn')
      || value.startsWith('removed')
    ) {
      return 'other_final'
    }
  }
  return null
}

function readDeferredGoalIds(subject) {
  const reviewDir = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/quality/goal-visualization-review')
  if (!fs.existsSync(reviewDir)) {
    return new Set()
  }

  const files = fs.readdirSync(reviewDir, { withFileTypes: true })
    .filter((entry) => (
      entry.isFile()
      && entry.name.startsWith(`${subject}-`)
      && entry.name.endsWith('.md')
      && entry.name !== `${subject}-rollout-status.md`
    ))
    .map((entry) => {
      const content = fs.readFileSync(path.join(reviewDir, entry.name), 'utf-8')
      return { name: entry.name, content, date: reviewDate(content, entry.name) }
    })
    .sort((left, right) => (
      left.date.localeCompare(right.date)
      || left.name.localeCompare(right.name, 'en', { numeric: true })
    ))

  const latestDispositionByGoal = new Map()
  for (const { content } of files) {
    for (const line of content.split(/\r?\n/u)) {
      if (!/^\s*\|/u.test(line)) continue
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
      const goalId = cells[0]?.replace(/^`|`$/gu, '').trim() ?? ''
      if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/iu.test(goalId)) continue
      const disposition = reviewDisposition(cells.slice(1))
      if (disposition) latestDispositionByGoal.set(goalId, disposition)
    }
  }

  return new Set(
    [...latestDispositionByGoal.entries()]
      .filter(([, disposition]) => disposition === 'deferred_provider_limitation')
      .map(([goalId]) => goalId),
  )
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
  const landscape = readLandscape(landscapePath)
  const subject = normalizeGoalVisualizationSubject(landscape.subject)
  if (!subject) {
    throw new Error('Landscape has no subject; cannot resolve subject-specific review evidence.')
  }
  const includeDeferred = getBooleanArg(args, 'include-deferred')
  const deferredGoalIds = includeDeferred ? new Set() : readDeferredGoalIds(subject)
  const selected = (landscape.goals ?? [])
    .filter((goal) => goal.type === 'atomic')
    .filter(isOrdinaryAtomicGoalForVisualization)
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
