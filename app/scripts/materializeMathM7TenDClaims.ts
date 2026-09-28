import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const target = 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-ten-independent-png-20260927-v1'
const dConfigPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-ten-current-png-20260927-v1.config.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'
const oldLedgerPath = `${target}/previous/in-flight-work-ledger.before-ten-png.json`
const ids = [
  '70efdec0-110c-5564-849b-bc05cfff0f6a',
  '2041f4ec-620d-4a20-9922-6ebf16f8f8fa',
  '0408ac7f-0530-5de5-b248-cf581c9b5a17',
  '27bdc580-ba17-5399-bf02-48f354846d1d',
  'e02b994f-376d-5a8e-a14c-c4acacae57cf',
  '909d8b16-5156-528b-a300-d9aee5405ba0',
  '18be713b-7d90-4f01-b60a-5582ac4df0e8',
  'f2a12269-6bcb-564a-9fdb-45cfdbd704fc',
  '3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6',
  '7156558c-57f1-4372-9ba7-0640c3f7cb3a',
] as const
const goalSet = new Set<string>(ids)
const suffix = '-retained-after-ten-png-20260927-v1'
const sha256 = (value: Buffer | string): string => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const readJson = async <T>(path: string): Promise<T> => JSON.parse(await readFile(join(root, path), 'utf8')) as T
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message) }
const writeOrCheck = async (path: string, bytes: Buffer, write: boolean): Promise<void> => {
  const absolute = join(root, path)
  if (write) { await mkdir(dirname(absolute), { recursive: true }); await writeFile(absolute, bytes, { flag: 'wx' }) }
  else assert((await readFile(absolute)).equals(bytes), `${path}: changed or stale`)
}

type BatchConfig = {
  batchId: string
  bookId: string
  title: string
  goalIds: string[]
  outputDirectory: string
  [key: string]: unknown
}
type Registry = { subjects: Array<{ subject: string; resolutionIndexPaths: string[] }> }
type Ledger = { activeBatchConfigPaths: string[]; [key: string]: unknown }

const main = async (): Promise<void> => {
  const mode = process.argv[2]
  assert(mode === '--write' || mode === '--check', 'Usage: tsx app/scripts/materializeMathM7TenDClaims.ts --write|--check')
  const write = mode === '--write'
  const oldLedgerBytes = await readFile(join(root, oldLedgerPath))
  const oldLedger = JSON.parse(oldLedgerBytes.toString('utf8')) as Ledger
  const dConfig = await readJson<BatchConfig>(dConfigPath)
  assert(dConfig.goalIds.length === ids.length && dConfig.goalIds.every((id, index) => id === ids[index]), 'Ten-goal current D bundle order changed')
  const book = await readJson<{ pages: Array<{ goalId: string; pageFingerprint: string; visualization?: { originalDigest?: string } | null }> }>(`${dConfig.outputDirectory}/bundle/book-model.json`)
  const qa = await readJson<{ records: Array<{ goalId: string; aiApprovedAssetSha256?: string }> }>('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json')
  const pages = ids.map((id) => {
    const page = book.pages.find((row) => row.goalId === id)
    const imageSha256 = qa.records.find((row) => row.goalId === id)?.aiApprovedAssetSha256
    assert(page?.visualization?.originalDigest === imageSha256 && imageSha256?.startsWith('sha256:'), `${id}: D page not bound to current AI-reviewed image`)
    return { goalId: id, pageFingerprint: page.pageFingerprint, imageSha256 }
  })
  const registry = await readJson<Registry>('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
  const math = registry.subjects.find((subject) => subject.subject === 'mathematik')
  assert(math, 'Math registry absent')
  const activeResolved = new Map<string, string>()
  for (const path of math.resolutionIndexPaths) {
    const index = await readJson<{ resolutions: Array<{ goalId: string; strictDescriptionComplete: boolean }> }>(path)
    for (const row of index.resolutions) if (goalSet.has(row.goalId) && row.strictDescriptionComplete) activeResolved.set(row.goalId, path)
  }
  assert(activeResolved.size === 0, `Current D HOLD requires no active old strict resolutions: ${[...activeResolved.keys()].join(',')}`)
  const sourceClaims: Array<{ sourceConfigPath: string; sourceConfigSha256: string; removedGoalIds: string[]; retainedGoalIds: string[]; retainedConfigPath: string | null }> = []
  const newPaths: string[] = [dConfigPath]
  const seen = new Set<string>()
  for (const path of oldLedger.activeBatchConfigPaths) {
    const configBytes = await readFile(join(root, path))
    const config = JSON.parse(configBytes.toString('utf8')) as BatchConfig
    const removed = config.goalIds.filter((id) => goalSet.has(id))
    if (!removed.length) { newPaths.push(path); continue }
    for (const id of removed) { assert(!seen.has(id), `${id}: duplicate old in-flight claim`); seen.add(id) }
    const remaining = config.goalIds.filter((id) => !goalSet.has(id))
    const retainedPath = remaining.length ? path.replace(/\.config\.json$/, `${suffix}.config.json`) : null
    if (retainedPath) {
      assert(retainedPath !== path, `${path}: invalid source config extension`)
      const retained: BatchConfig = {
        ...config,
        batchId: `${config.batchId}${suffix}`,
        bookId: `${config.bookId}${suffix}`,
        title: `${config.title} — unveränderte Ziele nach Auslagerung der zehn Bildseiten`,
        goalIds: remaining,
        outputDirectory: `${config.outputDirectory}${suffix}`,
      }
      await writeOrCheck(retainedPath, jsonBytes(retained), write)
      newPaths.push(retainedPath)
    }
    sourceClaims.push({ sourceConfigPath: path, sourceConfigSha256: sha256(configBytes), removedGoalIds: removed, retainedGoalIds: remaining, retainedConfigPath: retainedPath })
  }
  assert(seen.size === ids.length && ids.every((id) => seen.has(id)), `Expected ten exactly once in old in-flight claims; found ${seen.size}`)
  const newLedger: Ledger = { ...oldLedger, activeBatchConfigPaths: newPaths }
  const expectedLedgerBytes = jsonBytes(newLedger)
  await writeOrCheck(`${target}/expected-in-flight-work-ledger.json`, expectedLedgerBytes, write)
  if (!write) assert((await readFile(join(root, ledgerPath))).equals(expectedLedgerBytes), 'Active in-flight ledger not switched to new ten-bundle claims')
  const receipt = {
    schemaVersion: 1,
    recordedAt: '2026-09-27',
    currentDStatus: 'hold_pending_two_independent_exact_page_reviews',
    activeOldStrictDResolutionCount: 0,
    historicalReviewsPreserved: true,
    humanApproved: false,
    oldInFlightLedgerSha256: sha256(oldLedgerBytes),
    newInFlightLedgerSha256: sha256(expectedLedgerBytes),
    newBatchConfigPath: dConfigPath,
    sourceClaims,
    pages,
    note: 'The old active in-flight batches had unreviewed or previous-image pages, not strict D resolutions. Their other goals remain claimed in new filtered configs. The ten current-image pages require fresh independent rounds and synthesis.',
  }
  await writeOrCheck(`${target}/d-hold-and-claims-receipt.json`, jsonBytes(receipt), write)
  console.log(`${write ? 'Wrote' : 'Verified'} ten current-image D HOLDS; ${sourceClaims.length} old claims split, no active old strict D resolution.`)
}

void main()
