import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type CandidateGoal = {
  goalId: string
  reason: string
  profile: Record<string, unknown>
  evidenceLevel?: string
  maximumClaimScope?: string
  dissent?: string[]
}

type CandidateSet = {
  schemaVersion: 1
  authoringContract: 'positive-understanding-evidence-candidates-v1'
  reviewId: string
  reviewedAt: string
  reviewer: string
  goals: CandidateGoal[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const sourcePath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-08-28/'
    + 'batch-018-fast-measurement-mechanics-energy-18-carryover-11-v1/'
    + 'positive-evidence-keep11-source.candidates.json',
)
const targetPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-physics-positive-understanding-evidence-rollout-v1-'
    + 'fast18-stable-carryover-8-current-v1.candidates.json',
)
const expectedSourceDigest = '63c4c930ae76d4074e6bd82bf7dfb3dd0dd10819c10884869f74860dd5b3dee7'
const targetReviewId = 'canonical-physics-positive-evidence-fast18-stable-carryover-8-current-v1'
const goalIds = [
  '8aff7aac-321b-5172-ac55-877876bfd2cd',
  'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
  'f23fdfa9-38b6-5157-8301-ed302476c456',
  '264dc31c-ec92-5e39-a8b8-16f1d74366d4',
  '75b9ca4c-178e-5df2-adc4-f7f78e9d28e5',
  '691c11d0-fa6a-5d2e-a19c-086e89c3c233',
  '7ead007f-e85a-5cb5-b52d-76aae626119a',
  'e39c83b0-cb4f-5454-a143-b9a159c99cba',
] as const

const sha256 = (value: Buffer): string => createHash('sha256').update(value).digest('hex')
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

  const sourceBytes = await readFile(sourcePath)
  if (sha256(sourceBytes) !== expectedSourceDigest) {
    throw new Error(`Fast18 source candidate digest changed: ${sourcePath}`)
  }
  const source = JSON.parse(sourceBytes.toString('utf8')) as CandidateSet
  if (
    source.schemaVersion !== 1
    || source.authoringContract !== 'positive-understanding-evidence-candidates-v1'
    || source.reviewId !== 'physics-fast18-keep11-positive-evidence-precommit-v1'
  ) {
    throw new Error('Fast18 source candidate identity is invalid')
  }
  const sourceGoalsById = new Map(source.goals.map((goal) => [goal.goalId, goal]))
  const goals = goalIds.map((goalId) => {
    const goal = sourceGoalsById.get(goalId)
    if (!goal) throw new Error(`Fast18 source candidates are missing ${goalId}`)
    return goal
  })
  const target: CandidateSet = {
    ...source,
    reviewId: targetReviewId,
    reviewer: 'codex-physics-fast18-stable-carryover8-positive-evidence-2026-08-28',
    goals,
  }
  const expected = jsonBytes(target)
  const current = await readOptional(targetPath)
  if (current) {
    if (!current.equals(expected)) throw new Error(`Stable Fast18 candidate set is stale: ${targetPath}`)
  } else if (write) {
    await writeFile(targetPath, expected, { flag: 'wx' })
  } else {
    throw new Error(`Stable Fast18 candidate set is missing: ${targetPath}`)
  }
  console.log(
    `${write ? 'Materialized' : 'Verified'} Physics Fast18 stable evidence candidates: ${goals.length}/${goalIds.length}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
