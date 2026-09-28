import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const newtonId = '0c7bbd3f-0a04-4f0e-888b-40ab7841fb76'
const parallelId = '2231c29b-eb4e-51ae-9cb1-eb033bf16099'
const cases = [
  {
    id: newtonId,
    directory: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-038-derivative-applications-and-exponentials-20-v1',
    inputName: 'resolution-index.current-carryover-v1.json',
    outputName: 'resolution-index.retained-before-newton-png-20260927-v1.json',
    expectedOldPageFingerprint: 'sha256:1f750db8559a9db3f42d8cbc47b7480111ea6c5a04c3ea3a816d48318515770d',
    expectedOldImageDigest: null,
  },
  {
    id: parallelId,
    directory: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-001-final-20-v2',
    inputName: 'resolution-index.retained-before-j5-d2-20260924-v1.json',
    outputName: 'resolution-index.retained-before-parallel-png-20260927-v1.json',
    expectedOldPageFingerprint: 'sha256:be19b92cb58c815be875f78fd5a422a63d7980aa78551c398b5c38da1c58fbf5',
    expectedOldImageDigest: 'sha256:3134219308a97f309ed96be2af09940adc90025ecb2bf94d0d360e51826c2322',
  },
] as const

const sha256 = (value: Buffer | string): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const main = async (): Promise<void> => {
  const mode = process.argv[2]
  assert(mode === '--write' || mode === '--check', 'Usage: tsx app/scripts/materializeMathM7NewtonParallelDHolds.ts --write|--check')
  const write = mode === '--write'
  const receipt: Array<Record<string, unknown>> = []
  for (const item of cases) {
    const inputPath = join(root, item.directory, item.inputName)
    const outputPath = join(root, item.directory, item.outputName)
    const indexBytes = await readFile(inputPath)
    const index = JSON.parse(indexBytes.toString('utf8')) as {
      artifactSetId: string
      strictDescriptionReviewCompleteCount: number
      curriculumAtomicDenominator: number
      descriptionReviewPercentage: number
      groups: Array<{ resolvedGoalCount: number }>
      resolutions: Array<{ goalId: string; strictDescriptionComplete: boolean }>
    }
    const matches = index.resolutions.filter((row) => row.goalId === item.id)
    assert(matches.length === 1 && matches[0]?.strictDescriptionComplete === true, `${item.id}: old strict D resolution missing or duplicated`)
    assert(index.groups.length === 1 && index.groups[0]?.resolvedGoalCount === index.resolutions.length, `${item.id}: old index counts changed`)
    const model = JSON.parse((await readFile(join(root, item.directory, 'bundle/book-model.json'))).toString('utf8')) as {
      pages: Array<{ goalId: string; pageFingerprint: string; visualization?: { originalDigest?: string } | null }>
    }
    const oldPage = model.pages.find((page) => page.goalId === item.id)
    assert(oldPage?.pageFingerprint === item.expectedOldPageFingerprint, `${item.id}: old D page fingerprint changed`)
    assert((oldPage.visualization?.originalDigest ?? null) === item.expectedOldImageDigest, `${item.id}: old D image binding changed`)
    const filtered = {
      ...index,
      artifactSetId: `${index.artifactSetId}-retained-before-current-png-20260927-v1`,
      strictDescriptionReviewCompleteCount: index.strictDescriptionReviewCompleteCount - 1,
      descriptionReviewPercentage: Math.round(((index.strictDescriptionReviewCompleteCount - 1) / index.curriculumAtomicDenominator) * 1000) / 10,
      groups: index.groups.map((group) => ({ ...group, resolvedGoalCount: group.resolvedGoalCount - 1 })),
      resolutions: index.resolutions.filter((row) => row.goalId !== item.id),
    }
    assert(filtered.resolutions.length === index.resolutions.length - 1, `${item.id}: did not remove exactly one D row`)
    const expected = Buffer.from(`${JSON.stringify(filtered, null, 2)}\n`)
    if (write) await writeFile(outputPath, expected, { flag: 'wx' })
    else assert((await readFile(outputPath)).equals(expected), `${item.outputName}: filtered D index changed`)
    receipt.push({
      goalId: item.id,
      sourceIndexPath: `${item.directory}/${item.inputName}`,
      sourceIndexSha256: sha256(indexBytes),
      retainedIndexPath: `${item.directory}/${item.outputName}`,
      retainedIndexSha256: sha256(expected),
      oldPageFingerprint: oldPage.pageFingerprint,
      oldDVisualizationDigest: item.expectedOldImageDigest,
      currentDStatus: 'hold_pending_two_independent_current_page_reviews',
    })
  }
  const receiptPath = join(root, 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-newton-parallel-two-png-20260927-v1/d-hold-receipt.json')
  const receiptBytes = Buffer.from(`${JSON.stringify({ schemaVersion: 1, recordedAt: '2026-09-27', goals: receipt, historicalResolutionsPreserved: true, humanApproved: false }, null, 2)}\n`)
  if (write) await writeFile(receiptPath, receiptBytes, { flag: 'wx' })
  else assert((await readFile(receiptPath)).equals(receiptBytes), 'D hold receipt changed')
  console.log(`${write ? 'Wrote' : 'Verified'} exact two-goal D HOLD; historical reviews untouched.`)
}

void main()
