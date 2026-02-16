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
  directRequires: string[]
  effectiveRequires: Array<{ ref: string; sourceGoalIds: string[] }>
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
      '  tsx scripts/generateRequiresReport.ts --input <curriculum.json> [--decisions <decisions.json>] [--output <report.md>] [--init-decisions]',
      '',
      'Flags:',
      '  --init-decisions   If set, populates the decisions file with all atomic goals (status: pending). Requires --decisions.',
      '',
      'Decisions file schema:',
      '  {',
      '    "goals": {',
      '      "<goalId>": { "status": "ok" },',
      '      "<goalId>": { "status": "not_ok", "problem": "...", "proposal": "..." }',
      '    }',
      '  }',
    ].join('\n'),
  )
  process.exit(1)
}

function parseRef(rawRef: string, currentLandscapeId: string): { landscapeId: string; goalId: string } {
  if (rawRef.includes(':')) {
    const [landscapeId, goalId] = rawRef.split(':', 2)
    return { landscapeId: landscapeId || currentLandscapeId, goalId }
  }
  return { landscapeId: currentLandscapeId, goalId: rawRef }
}

function formatRefTitle(
  ref: string,
  currentLandscapeId: string,
  localGoalMap: Map<string, UiGoal>,
): string {
  const parsed = parseRef(ref, currentLandscapeId)
  if (parsed.landscapeId === currentLandscapeId) {
    return localGoalMap.get(parsed.goalId)?.title ?? '(unbekannt)'
  }
  return `external:${parsed.landscapeId}:${parsed.goalId}`
}

function buildParentMap(goals: UiGoal[], currentLandscapeId: string): Map<string, string[]> {
  const parentMap = new Map<string, string[]>()
  for (const goal of goals) {
    for (const childRef of goal.contains ?? []) {
      const parsed = parseRef(childRef, currentLandscapeId)
      if (parsed.landscapeId !== currentLandscapeId) continue
      const childId = parsed.goalId
      if (!childId) continue
      const parents = parentMap.get(childId) ?? []
      parents.push(goal.id)
      parentMap.set(childId, parents)
    }
  }
  return parentMap
}

function computeEffectiveRequires(
  goalId: string,
  goalsById: Map<string, UiGoal>,
  parentMap: Map<string, string[]>,
  memo: Map<string, Map<string, Set<string>>>,
  visiting: Set<string>,
): Map<string, Set<string>> {
  const cached = memo.get(goalId)
  if (cached) return cached
  if (visiting.has(goalId)) return new Map<string, Set<string>>()

  visiting.add(goalId)
  const sourcesByRef = new Map<string, Set<string>>()
  const goal = goalsById.get(goalId)

  for (const req of goal?.requires ?? []) {
    const sourceSet = sourcesByRef.get(req) ?? new Set<string>()
    sourceSet.add(goalId)
    sourcesByRef.set(req, sourceSet)
  }

  for (const parentId of parentMap.get(goalId) ?? []) {
    const inherited = computeEffectiveRequires(parentId, goalsById, parentMap, memo, new Set(visiting))
    for (const [ref, sourceIds] of inherited.entries()) {
      const sourceSet = sourcesByRef.get(ref) ?? new Set<string>()
      sourceIds.forEach((sid) => sourceSet.add(sid))
      sourcesByRef.set(ref, sourceSet)
    }
  }

  visiting.delete(goalId)
  memo.set(goalId, sourcesByRef)
  return sourcesByRef
}

function escapePipes(text: string): string {
  return text.replaceAll('|', '\\|')
}

function renderReport(
  landscape: LearningLandscape,
  goals: UiGoal[],
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
  lines.push('# Requires Findings Report')
  lines.push('')
  lines.push(`Curriculum: \`${inputPath}\``)
  lines.push(`Landscape: \`${landscape.landscapeId}\` (${landscape.title})`)
  lines.push(`Generated: ${now}`)
  lines.push('')
  lines.push('## Summary')
  lines.push(`- Atomic goals total: ${totalAtomic}`)
  lines.push(`- Reviewed: ${reviewed}`)
  lines.push(`- requires ok: ${reviewedOk}`)
  lines.push(`- requires nicht ok: ${reviewedNotOk}`)
  lines.push(`- Pending review: ${pending}`)
  lines.push('')
  lines.push('## Findings (requires nicht ok)')
  if (reviewedNotOk === 0) {
    lines.push('- Keine Findings mit Status `requires nicht ok` erfasst.')
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
  lines.push('| goalId | title | status | problem | proposal | direct requires | effective requires |')
  lines.push('|---|---|---|---|---|---|---|')

  for (const review of reviews) {
    let statusString = 'pending'
    if (review.decision?.status === 'ok') statusString = 'requires ok'
    if (review.decision?.status === 'not_ok') statusString = 'requires nicht ok'

    const direct = review.directRequires
      .map((ref) => {
        const title = formatRefTitle(ref, landscape.landscapeId, new Map(goals.map((g) => [g.id, g])))
        return `${ref} (${title})`
      })
      .join('<br>')

    const effective = review.effectiveRequires
      .map((entry) => {
        const title = formatRefTitle(entry.ref, landscape.landscapeId, new Map(goals.map((g) => [g.id, g])))
        const src = entry.sourceGoalIds
          .map((id) => goals.find((g) => g.id === id)?.title ?? id)
          .join(', ')
        return `${entry.ref} (${title}) [from: ${src}]`
      })
      .join('<br>')

    lines.push(
      `| \`${review.goal.id}\` | ${escapePipes(review.goal.title)} | ${statusString} | ${escapePipes(
        review.decision?.problem ?? '',
      )} | ${escapePipes(review.decision?.proposal ?? '')} | ${escapePipes(direct)} | ${escapePipes(effective)} |`,
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
  const goalsById = new Map(goals.map((g) => [g.id, g]))
  const atomicGoals = goals.filter((g) => (g.contains ?? []).length === 0)
  const parentMap = buildParentMap(goals, landscape.landscapeId)
  const memo = new Map<string, Map<string, Set<string>>>()

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
        addedCount++
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
    .map((goal) => {
      const effectiveMap = computeEffectiveRequires(goal.id, goalsById, parentMap, memo, new Set<string>())
      const effectiveRequires = Array.from(effectiveMap.entries())
        .map(([ref, sources]) => ({
          ref,
          sourceGoalIds: Array.from(sources).sort(),
        }))
        .sort((a, b) => a.ref.localeCompare(b.ref))

      return {
        goal,
        directRequires: [...goal.requires].sort(),
        effectiveRequires,
        decision: decisions.goals?.[goal.id],
      }
    })
    .sort((a, b) => a.goal.title.localeCompare(b.goal.title, 'de-DE', { sensitivity: 'base' }))

  const defaultOutputName = `requires_findings_${basename(inputAbs).replace(/\\.json$/i, '')}.md`
  const outputAbs = resolve(process.cwd(), output ?? `../tmp/${defaultOutputName}`)
  mkdirSync(dirname(outputAbs), { recursive: true })
  const report = renderReport(landscape, goals, reviews, input)
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
