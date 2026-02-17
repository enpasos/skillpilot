import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, basename, resolve } from 'node:path'
import type { LearningLandscape } from '../src/landscapeTypes'
import { convertLearningGoal, type UiGoal } from '../src/goalTypes'

type DecisionStatus = 'ok' | 'not_ok' | 'pending'

interface GoalDecision {
  status: DecisionStatus
  problem?: string
  proposal?: string
}

interface DecisionsFile {
  goals?: Record<string, GoalDecision>
}

interface GoalReviewData {
  goal: UiGoal
  decision?: GoalDecision
}

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag)
  if (idx < 0 || idx + 1 >= process.argv.length) return undefined
  return process.argv[idx + 1]
}

function usage(): never {
  console.error(
    [
      'Usage:',
      '  tsx scripts/generateAtomicReport.ts --input <curriculum.json> [--decisions <decisions.json>] [--output <report.md>] [--init-decisions]',
      '',
      'Flags:',
      '  --init-decisions   If set, populates the decisions file with all atomic goals (status: pending). Requires --decisions.',
      '',
      'Decisions file schema:',
      '  {',
      '    "goals": {',
      '      "<goalId>": { "status": "ok" },',
      '      "<goalId>": { "status": "not_ok", "problem": "...", "proposal": "..." },',
      '      "<goalId>": { "status": "pending" }',
      '    }',
      '  }',
    ].join('\n'),
  )
  process.exit(1)
}

function escapePipes(text: string): string {
  return text.replaceAll('|', '\\|')
}

function renderReport(
  landscape: LearningLandscape,
  reviews: GoalReviewData[],
  inputPath: string,
): string {
  const totalAtomic = reviews.length
  const reviewedOk = reviews.filter((r) => r.decision?.status === 'ok').length
  const reviewedNotOk = reviews.filter((r) => r.decision?.status === 'not_ok').length
  const pending = reviews.filter((r) => !r.decision || r.decision.status === 'pending').length
  const reviewed = reviewedOk + reviewedNotOk
  const now = new Date().toISOString()

  const lines: string[] = []
  lines.push('# Atomic Findings Report')
  lines.push('')
  lines.push(`Curriculum: \`${inputPath}\``)
  lines.push(`Landscape: \`${landscape.landscapeId}\` (${landscape.title})`)
  lines.push(`Generated: ${now}`)
  lines.push('')
  lines.push('## Summary')
  lines.push(`- Atomic goals total: ${totalAtomic}`)
  lines.push(`- Reviewed: ${reviewed}`)
  lines.push(`- atomic ok: ${reviewedOk}`)
  lines.push(`- atomic nicht ok: ${reviewedNotOk}`)
  lines.push(`- Pending review: ${pending}`)
  lines.push('')
  lines.push('## Findings (atomic nicht ok)')

  if (reviewedNotOk === 0) {
    lines.push('- Keine Findings mit Status `atomic nicht ok` erfasst.')
  } else {
    let idx = 1
    for (const review of reviews.filter((r) => r.decision?.status === 'not_ok')) {
      lines.push(`${idx}. goalId: \`${review.goal.id}\``)
      lines.push(`   title: ${review.goal.title}`)
      lines.push(`   problem: ${review.decision?.problem ?? '(fehlt)'}`)
      lines.push(`   proposal: ${review.decision?.proposal ?? '(fehlt)'}`)
      idx += 1
    }
  }

  lines.push('')
  lines.push('## Appendix (all atomic goals)')
  lines.push('| goalId | title | status | problem | proposal |')
  lines.push('|---|---|---|---|---|')

  for (const review of reviews) {
    let statusString = 'pending'
    if (review.decision?.status === 'ok') statusString = 'atomic ok'
    if (review.decision?.status === 'not_ok') statusString = 'atomic nicht ok'

    lines.push(
      `| \`${review.goal.id}\` | ${escapePipes(review.goal.title)} | ${statusString} | ${escapePipes(
        review.decision?.problem ?? '',
      )} | ${escapePipes(review.decision?.proposal ?? '')} |`,
    )
  }

  return lines.join('\n') + '\n'
}

function main() {
  const input = parseArg('--input')
  if (!input) usage()

  const decisionsPath = parseArg('--decisions')
  const output = parseArg('--output')
  const initDecisions = process.argv.includes('--init-decisions')

  const inputAbs = resolve(process.cwd(), input)
  const raw = readFileSync(inputAbs, 'utf8')
  const landscape = JSON.parse(raw) as LearningLandscape

  if (!landscape.landscapeId || !Array.isArray(landscape.goals)) {
    throw new Error(`Invalid curriculum JSON: ${inputAbs}`)
  }

  const goals = landscape.goals.map((goal) =>
    convertLearningGoal(goal, { landscapeId: landscape.landscapeId }),
  )
  const atomicGoals = goals.filter((g) => (g.contains ?? []).length === 0)

  let decisions: DecisionsFile = {}

  if (initDecisions) {
    if (!decisionsPath) {
      console.error('Error: --decisions <path> is required when using --init-decisions')
      process.exit(1)
    }

    const decisionsAbs = resolve(process.cwd(), decisionsPath)
    if (existsSync(decisionsAbs)) {
      decisions = JSON.parse(readFileSync(decisionsAbs, 'utf8')) as DecisionsFile
    }

    if (!decisions.goals) {
      decisions.goals = {}
    }

    let addedCount = 0
    for (const goal of atomicGoals) {
      if (!decisions.goals[goal.id]) {
        decisions.goals[goal.id] = { status: 'pending' }
        addedCount += 1
      }
    }

    if (addedCount > 0 || !existsSync(decisionsAbs)) {
      writeFileSync(decisionsAbs, JSON.stringify(decisions, null, 2), 'utf8')
      console.log(`Updated decisions file: ${decisionsAbs}`)
      console.log(`Added ${addedCount} pending goals.`)
    } else {
      console.log(`Decisions file is up to date: ${decisionsAbs}`)
    }
  } else if (decisionsPath) {
    const decisionsAbs = resolve(process.cwd(), decisionsPath)
    if (!existsSync(decisionsAbs)) {
      throw new Error(`Decisions file not found: ${decisionsAbs}`)
    }
    decisions = JSON.parse(readFileSync(decisionsAbs, 'utf8')) as DecisionsFile
  }

  const reviews: GoalReviewData[] = atomicGoals
    .map((goal) => ({
      goal,
      decision: decisions.goals?.[goal.id],
    }))
    .sort((a, b) => a.goal.title.localeCompare(b.goal.title, 'de-DE', { sensitivity: 'base' }))

  const defaultOutputName = `atomic_findings_${basename(inputAbs).replace(/\\.json$/i, '')}.md`
  const outputAbs = resolve(process.cwd(), output ?? `../tmp/${defaultOutputName}`)

  mkdirSync(dirname(outputAbs), { recursive: true })
  const report = renderReport(landscape, reviews, input)
  writeFileSync(outputAbs, report, 'utf8')

  const totalAtomic = reviews.length
  const reviewedOk = reviews.filter((r) => r.decision?.status === 'ok').length
  const reviewedNotOk = reviews.filter((r) => r.decision?.status === 'not_ok').length
  const pending = reviews.filter((r) => !r.decision || r.decision.status === 'pending').length

  console.log(`Report written: ${outputAbs}`)
  console.log(`Atomic goals: ${totalAtomic}`)
  console.log(`Reviewed ok: ${reviewedOk}`)
  console.log(`Reviewed not_ok: ${reviewedNotOk}`)
  console.log(`Pending: ${pending}`)
}

main()
