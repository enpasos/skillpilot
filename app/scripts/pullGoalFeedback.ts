import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  readGoalFeedbackInboxArtifact,
  syncGoalFeedbackInboxDirectory,
  validateDeletionReceipt,
  validateGoalFeedbackExportBatch,
  verifyGoalFeedbackInbox,
  writeDeletionReceipt,
  writeGoalFeedbackInbox,
} from './goalFeedbackInbox'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 500
const MAX_RESPONSE_BYTES = 16 * 1024 * 1024
const DEFAULT_BASE_URL = 'https://skillpilot.com'
const DEFAULT_OUTPUT_ROOT = fileURLToPath(new URL('../../tmp/goal-feedback/inbox/', import.meta.url))
const STABLE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:+-]{0,199}$/u

export interface PullGoalFeedbackOptions {
  baseUrl: string
  operatorToken: string
  limit?: number
  batchId?: string
  outputRoot?: string
  resumeInbox?: string
  keepOnline?: boolean
  fetchImplementation?: typeof fetch
  log?: (message: string) => void
}

export type PullGoalFeedbackResult =
  | { status: 'empty' }
  | {
      status: 'downloaded'
      exportId: string
      payloadDigest: string
      inboxDirectory: string
      deletedOnline: boolean
    }

interface PullCliOptions {
  baseUrl: string
  limit: number
  batchId?: string
  resumeInbox?: string
  outputRoot: string
  keepOnline: boolean
}

const help = `Usage: npm run feedback:pull -- [options]

Options:
  --base-url <url>       Explicit service origin override. Default: https://skillpilot.com.
                         Loopback HTTP is accepted only for tests.
  --limit <1..500>       Maximum records for a new POST batch (default: 100).
  --batch-id <id>        Re-download one existing batch with GET instead of creating one.
  --output-root <path>   Local inbox root (default: ../tmp/goal-feedback/inbox).
  --resume-inbox <dir>   Verify one existing inbox, repeat its idempotent DELETE,
                         and store or verify the exact deletion receipt.
  --keep-online          Verify the local inbox but do not DELETE the online batch.
  --help                 Show this help.

Environment:
  SKILLPILOT_GOAL_FEEDBACK_BASE_URL
  SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN  (required; no CLI token option)
`

const optionValue = (argv: readonly string[], index: number, option: string): { value: string; next: number } => {
  const argument = argv[index]
  if (argument === option) {
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`${option} requires a value.`)
    return { value, next: index + 2 }
  }
  const prefix = `${option}=`
  if (argument?.startsWith(prefix)) {
    const value = argument.slice(prefix.length)
    if (!value) throw new Error(`${option} requires a value.`)
    return { value, next: index + 1 }
  }
  throw new Error('Internal option parser error.')
}

export const parsePullGoalFeedbackArgs = (argv: readonly string[]): PullCliOptions => {
  const parsed: PullCliOptions = {
    baseUrl: process.env.SKILLPILOT_GOAL_FEEDBACK_BASE_URL ?? DEFAULT_BASE_URL,
    limit: DEFAULT_LIMIT,
    outputRoot: DEFAULT_OUTPUT_ROOT,
    keepOnline: false,
  }
  let explicitDownloadOption = false
  let index = 0
  while (index < argv.length) {
    const argument = argv[index]
    if (argument === '--help') {
      process.stdout.write(help)
      return parsed
    }
    if (argument === '--keep-online') {
      parsed.keepOnline = true
      explicitDownloadOption = true
      index += 1
      continue
    }
    if (argument === '--base-url' || argument?.startsWith('--base-url=')) {
      const result = optionValue(argv, index, '--base-url')
      parsed.baseUrl = result.value
      index = result.next
      continue
    }
    if (argument === '--limit' || argument?.startsWith('--limit=')) {
      const result = optionValue(argv, index, '--limit')
      if (!/^[1-9][0-9]*$/u.test(result.value)) throw new Error('--limit must be an integer from 1 to 500.')
      parsed.limit = Number(result.value)
      if (parsed.limit > MAX_LIMIT) throw new Error('--limit must be an integer from 1 to 500.')
      explicitDownloadOption = true
      index = result.next
      continue
    }
    if (argument === '--batch-id' || argument?.startsWith('--batch-id=')) {
      const result = optionValue(argv, index, '--batch-id')
      if (!STABLE_ID_PATTERN.test(result.value)) throw new Error('--batch-id has an invalid format.')
      parsed.batchId = result.value
      explicitDownloadOption = true
      index = result.next
      continue
    }
    if (argument === '--output-root' || argument?.startsWith('--output-root=')) {
      const result = optionValue(argv, index, '--output-root')
      parsed.outputRoot = resolve(result.value)
      explicitDownloadOption = true
      index = result.next
      continue
    }
    if (argument === '--resume-inbox' || argument?.startsWith('--resume-inbox=')) {
      const result = optionValue(argv, index, '--resume-inbox')
      parsed.resumeInbox = resolve(result.value)
      index = result.next
      continue
    }
    throw new Error('Unknown feedback pull option.')
  }
  if (parsed.resumeInbox && explicitDownloadOption) {
    throw new Error('--resume-inbox cannot be combined with --limit, --batch-id, --output-root, or --keep-online.')
  }
  return parsed
}

export const validateGoalFeedbackBaseUrl = (rawBaseUrl: string): URL => {
  let baseUrl: URL
  try {
    baseUrl = new URL(rawBaseUrl)
  } catch {
    throw new Error('Feedback base URL is not a valid absolute URL.')
  }
  const loopback = baseUrl.hostname === '127.0.0.1'
    || baseUrl.hostname === '::1'
    || baseUrl.hostname === 'localhost'
  const production = baseUrl.protocol === 'https:' && baseUrl.origin === 'https://skillpilot.com'
  const loopbackTest = baseUrl.protocol === 'http:' && loopback
  if (!production && !loopbackTest) {
    throw new Error('Feedback credentials may be sent only to https://skillpilot.com or an HTTP loopback test server.')
  }
  if (baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash) {
    throw new Error('Feedback base URL must not contain credentials, query parameters, or a fragment.')
  }
  if (baseUrl.pathname !== '/' && baseUrl.pathname !== '') {
    throw new Error('Feedback base URL must be an origin without a path.')
  }
  return baseUrl
}

const validateOperatorToken = (token: string): void => {
  if (token.length < 32 || token.length > 4096 || /[\r\n]/u.test(token)) {
    throw new Error('SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN has an invalid format.')
  }
}

const endpointUrl = (baseUrl: URL, batchId: string | undefined, limit: number): URL => {
  if (batchId) {
    return new URL(`/api/operations/goal-feedback/v1/export-batches/${encodeURIComponent(batchId)}`, baseUrl)
  }
  const endpoint = new URL('/api/operations/goal-feedback/v1/export-batches', baseUrl)
  endpoint.searchParams.set('limit', String(limit))
  return endpoint
}

const boundedResponseBytes = async (response: Response): Promise<Buffer> => {
  const contentLength = response.headers.get('content-length')
  if (contentLength && (!/^[0-9]+$/u.test(contentLength) || Number(contentLength) > MAX_RESPONSE_BYTES)) {
    await response.body?.cancel().catch(() => undefined)
    throw new Error('Feedback export response exceeds the local size limit.')
  }
  if (!response.body) return Buffer.alloc(0)

  const reader = response.body.getReader()
  const chunks: Buffer[] = []
  let totalBytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value || value.byteLength === 0) continue
      if (value.byteLength > MAX_RESPONSE_BYTES - totalBytes) {
        await reader.cancel().catch(() => undefined)
        throw new Error('Feedback export response exceeds the local size limit.')
      }
      chunks.push(Buffer.from(value))
      totalBytes += value.byteLength
    }
  } finally {
    reader.releaseLock()
  }
  return Buffer.concat(chunks, totalBytes)
}

const requireJsonResponse = (response: Response): void => {
  const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
  if (contentType !== 'application/json') throw new Error('Feedback export response must use application/json.')
}

const assertTokenAbsent = (bytes: Buffer, operatorToken: string): void => {
  if (bytes.includes(Buffer.from(operatorToken, 'utf8'))) {
    throw new Error('Feedback export response improperly contains the operator credential.')
  }
}

const authorizationHeaders = (operatorToken: string): Record<string, string> => ({
  Accept: 'application/json',
  Authorization: `Bearer ${operatorToken}`,
  'Cache-Control': 'no-store',
})

const deletionEtag = (payloadDigest: string): string => `"${payloadDigest}"`

const SOURCE_INBOX_ARTIFACTS = [
  'bundle.json',
  'manifest.json',
  'trusted-context.jsonl',
  'untrusted-feedback.jsonl',
  'CRITICAL_REVIEW_INSTRUCTIONS.md',
] as const

const assertInboxArtifactsDoNotContainToken = async (
  inboxDirectory: string,
  operatorToken: string,
): Promise<void> => {
  for (const name of SOURCE_INBOX_ARTIFACTS) {
    assertTokenAbsent(
      await readGoalFeedbackInboxArtifact(resolve(inboxDirectory, name)),
      operatorToken,
    )
  }
}

const deleteVerifiedOnlineBatch = async ({
  baseUrl,
  operatorToken,
  request,
  inboxDirectory,
  batch,
  log,
}: {
  baseUrl: URL
  operatorToken: string
  request: typeof fetch
  inboxDirectory: string
  batch: Awaited<ReturnType<typeof validateGoalFeedbackExportBatch>>
  log: (message: string) => void
}): Promise<PullGoalFeedbackResult> => {
  await verifyGoalFeedbackInbox(inboxDirectory)
  await syncGoalFeedbackInboxDirectory(inboxDirectory)
  const deleteResponse = await request(
    new URL(`/api/operations/goal-feedback/v1/export-batches/${encodeURIComponent(batch.payload.exportId)}`, baseUrl),
    {
      method: 'DELETE',
      headers: {
        ...authorizationHeaders(operatorToken),
        'If-Match': deletionEtag(batch.payloadDigest),
      },
      redirect: 'error',
    },
  )
  if (deleteResponse.status !== 200) {
    throw new Error(`Feedback batch DELETE failed with HTTP ${deleteResponse.status}; verified local files were retained.`)
  }
  requireJsonResponse(deleteResponse)
  const exactReceiptBytes = await boundedResponseBytes(deleteResponse)
  assertTokenAbsent(exactReceiptBytes, operatorToken)
  validateDeletionReceipt(exactReceiptBytes, batch)
  const receiptPath = await writeDeletionReceipt(inboxDirectory, exactReceiptBytes)
  const persistedReceipt = await readGoalFeedbackInboxArtifact(receiptPath)
  assertTokenAbsent(persistedReceipt, operatorToken)
  validateDeletionReceipt(persistedReceipt, batch)
  await verifyGoalFeedbackInbox(inboxDirectory, { requireDeletionReceipt: true })
  log(`Verified feedback batch ${batch.payload.exportId} locally and acknowledged its online DELETE.`)
  log(`Inbox: ${inboxDirectory}`)
  return {
    status: 'downloaded',
    exportId: batch.payload.exportId,
    payloadDigest: batch.payloadDigest,
    inboxDirectory,
    deletedOnline: true,
  }
}

export const pullGoalFeedback = async (options: PullGoalFeedbackOptions): Promise<PullGoalFeedbackResult> => {
  const baseUrl = validateGoalFeedbackBaseUrl(options.baseUrl)
  validateOperatorToken(options.operatorToken)
  const request = options.fetchImplementation ?? fetch
  const rawLog = options.log ?? console.log
  const log = (message: string): void => rawLog(message.replaceAll(options.operatorToken, '[REDACTED]'))

  if (options.resumeInbox) {
    if (options.batchId || options.keepOnline || options.limit !== undefined || options.outputRoot !== undefined) {
      throw new Error('resumeInbox cannot be combined with batchId, limit, outputRoot, or keepOnline.')
    }
    const inboxDirectory = resolve(options.resumeInbox)
    if (inboxDirectory.includes(options.operatorToken)) {
      throw new Error('Feedback inbox path must not contain the operator credential.')
    }
    const { batch } = await verifyGoalFeedbackInbox(inboxDirectory)
    await assertInboxArtifactsDoNotContainToken(inboxDirectory, options.operatorToken)
    return deleteVerifiedOnlineBatch({
      baseUrl,
      operatorToken: options.operatorToken,
      request,
      inboxDirectory,
      batch,
      log,
    })
  }

  const outputRoot = resolve(options.outputRoot ?? DEFAULT_OUTPUT_ROOT)
  if (outputRoot.includes(options.operatorToken)) {
    throw new Error('Feedback output root must not contain the operator credential.')
  }
  const limit = options.limit ?? DEFAULT_LIMIT
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new Error('Feedback pull limit must be an integer from 1 to 500.')
  }
  if (options.batchId && !STABLE_ID_PATTERN.test(options.batchId)) {
    throw new Error('Feedback batch ID has an invalid format.')
  }
  const response = await request(endpointUrl(baseUrl, options.batchId, limit), {
    method: options.batchId ? 'GET' : 'POST',
    headers: authorizationHeaders(options.operatorToken),
    redirect: 'error',
  })
  if (response.status === 204) {
    log('No goal-feedback export batch is currently available.')
    return { status: 'empty' }
  }
  if (!response.ok) throw new Error(`Feedback export request failed with HTTP ${response.status}.`)
  requireJsonResponse(response)
  const exactBundleBytes = await boundedResponseBytes(response)
  assertTokenAbsent(exactBundleBytes, options.operatorToken)
  const batch = await validateGoalFeedbackExportBatch(exactBundleBytes)
  if (options.batchId && batch.payload.exportId !== options.batchId) {
    throw new Error('Downloaded feedback batch does not match the requested batch ID.')
  }

  const { inboxDirectory } = await writeGoalFeedbackInbox(
    outputRoot,
    batch,
    exactBundleBytes,
  )
  await verifyGoalFeedbackInbox(inboxDirectory)
  await assertInboxArtifactsDoNotContainToken(inboxDirectory, options.operatorToken)

  if (options.keepOnline) {
    log(`Verified feedback batch ${batch.payload.exportId} locally; online batch retained by request.`)
    log(`Inbox: ${inboxDirectory}`)
    return {
      status: 'downloaded',
      exportId: batch.payload.exportId,
      payloadDigest: batch.payloadDigest,
      inboxDirectory,
      deletedOnline: false,
    }
  }

  return deleteVerifiedOnlineBatch({
    baseUrl,
    operatorToken: options.operatorToken,
    request,
    inboxDirectory,
    batch,
    log,
  })
}

const runCli = async (): Promise<void> => {
  const parsed = parsePullGoalFeedbackArgs(process.argv.slice(2))
  if (process.argv.slice(2).includes('--help')) return
  const operatorToken = process.env.SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN
  if (!operatorToken) throw new Error('Set SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN.')
  await pullGoalFeedback(parsed.resumeInbox
    ? {
        baseUrl: parsed.baseUrl,
        operatorToken,
        resumeInbox: parsed.resumeInbox,
      }
    : {
        baseUrl: parsed.baseUrl,
        operatorToken,
        limit: parsed.limit,
        batchId: parsed.batchId,
        outputRoot: parsed.outputRoot,
        keepOnline: parsed.keepOnline,
      })
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  runCli().catch((error: unknown) => {
    const operatorToken = process.env.SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN ?? ''
    const rawMessage = error instanceof Error ? error.message : 'Unknown feedback pull failure.'
    const safeMessage = operatorToken ? rawMessage.replaceAll(operatorToken, '[REDACTED]') : rawMessage
    console.error(`Feedback pull failed: ${safeMessage}`)
    process.exitCode = 1
  })
}
