import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  canonicalJson,
  compareGoalFeedbackWithLocalRepository,
  FEEDBACK_EXPORT_POLICY,
  sha256Digest,
  type GoalFeedbackExportBatch,
  validateGoalFeedbackExportBatch,
  verifyGoalFeedbackInbox,
  writeGoalFeedbackInbox,
} from './goalFeedbackInbox'
import {
  parsePullGoalFeedbackArgs,
  pullGoalFeedback,
  validateGoalFeedbackBaseUrl,
} from './pullGoalFeedback'
import { validateGoalFeedbackInbox } from './validateGoalFeedbackInbox'

const OPERATOR_TOKEN = 'fixture-operator-token-that-must-never-be-persisted'
const DIGEST = (character: string) => `sha256:${character.repeat(64)}`

const envelope = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-public-feedback.schema.json',
  schemaVersion: 2,
  context: {
    goalId: 'fixture-goal',
    goalFingerprint: DIGEST('a'),
    pageFingerprint: DIGEST('b'),
    bookId: 'fixture-book',
    bookEdition: 'fixture-edition-v1',
    bookDigest: DIGEST('c'),
    locale: 'de-DE',
    scopeLabel: 'Fixture scope',
    pageNumber: 7,
    canonicalUrl: 'https://skillpilot.com/lernzielbuch#goal-fixture-goal',
    publicationManifestFingerprint: DIGEST('d'),
  },
  feedback: {
    category: 'chapter_structure',
    observation: 'Das Lernziel erscheint in diesem Kapitel fachlich unpassend.',
    evidence: 'Die benachbarten Ziele behandeln einen anderen fachlichen Zusammenhang.',
    proposedImprovement: 'Die kanonische Kapitelzuordnung unabhängig prüfen.',
    reviewerRole: 'teacher',
  },
  privacyNoticeVersion: '2026-08-30.1',
  privacyNoticeLocale: 'de',
  privacyAcknowledged: true,
  automatedProcessingAcknowledged: true,
}

const serverTrustedContext = (exportedEnvelope: typeof envelope) => ({
  schemaVersion: 1 as const,
  context: exportedEnvelope.context,
  goal: {
    title: 'Fixture-Lernziel',
    description: 'Die lernende Person kann den Fixture-Zusammenhang fachlich begründet darstellen.',
    breadcrumbs: ['Fixture-Fach', 'Fixture-Kapitel'],
  },
  submissionEndpoint: '/api/public/goal-feedback/v1/submissions' as const,
})

const buildBatch = (
  exportId: string,
  overrides: Partial<GoalFeedbackExportBatch['payload']['records'][number]> = {},
): GoalFeedbackExportBatch => {
  const exportedEnvelope = overrides.envelope ?? envelope
  const record = {
    feedbackId: 'feedback-001',
    receivedAt: '2026-08-30T08:01:00.000Z',
    bindingStatus: 'exact_current' as const,
    envelopeDigest: sha256Digest(canonicalJson(exportedEnvelope)),
    envelope: exportedEnvelope,
    serverTrustedContext: serverTrustedContext(exportedEnvelope as typeof envelope),
    ...overrides,
  }
  const payload = {
    schemaVersion: 1 as const,
    exportId,
    createdAt: '2026-08-30T08:02:00.000Z',
    recordCount: 1,
    policy: FEEDBACK_EXPORT_POLICY,
    records: [record],
  }
  return {
    payloadDigest: sha256Digest(canonicalJson(payload)),
    payload,
  }
}

const batchBytes = (batch: GoalFeedbackExportBatch): Buffer => Buffer.from(
  `${JSON.stringify(batch, null, 2)}\n`,
  'utf8',
)

const deletionReceiptBytes = (batch: GoalFeedbackExportBatch): Buffer => Buffer.from(JSON.stringify({
  schemaVersion: 1,
  exportId: batch.payload.exportId,
  payloadDigest: batch.payloadDigest,
  recordCount: batch.payload.recordCount,
  status: 'DELETED',
  deletedAt: '2026-08-30T08:03:00.000Z',
}))

type RequestHandler = (request: IncomingMessage, response: ServerResponse) => void

const json = (response: ServerResponse, status: number, bytes: Buffer): void => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': String(bytes.length),
  })
  response.end(bytes)
}

const withServer = async <T>(handler: RequestHandler, run: (baseUrl: string) => Promise<T>): Promise<T> => {
  const server = createServer(handler)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  try {
    return await run(`http://127.0.0.1:${address.port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

const writeLocalPublicationFixture = async (root: string): Promise<string> => {
  const directory = join(root, 'local-public', 'lernzielbuch')
  await mkdir(directory, { recursive: true })
  const model = {
    schemaVersion: '1.1.0',
    book: {
      id: envelope.context.bookId,
      edition: envelope.context.bookEdition,
    },
    pages: [{
      goalId: envelope.context.goalId,
      title: 'Fixture-Lernziel',
      description: 'Die lernende Person kann den Fixture-Zusammenhang fachlich begründet darstellen.',
      breadcrumbs: ['Fixture-Fach', 'Fixture-Kapitel'],
      goalFingerprint: envelope.context.goalFingerprint,
      pageFingerprint: envelope.context.pageFingerprint,
      pageNumber: envelope.context.pageNumber,
    }],
    digest: envelope.context.bookDigest,
  }
  const modelBytes = Buffer.from(`${JSON.stringify(model, null, 2)}\n`, 'utf8')
  const modelName = 'fixture-book.book-model.json'
  await writeFile(join(directory, modelName), modelBytes)
  const index = {
    schemaVersion: 1,
    books: [{
      bookId: envelope.context.bookId,
      model: {
        url: `/lernzielbuch/${modelName}`,
        sha256: sha256Digest(modelBytes),
        modelDigest: envelope.context.bookDigest,
      },
      pdf: {
        renderManifestSha256: envelope.context.publicationManifestFingerprint,
      },
    }],
  }
  const indexPath = join(directory, 'index.json')
  await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`)
  return indexPath
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'skillpilot-goal-feedback-'))
try {
  const localIndexPath = await writeLocalPublicationFixture(temporaryRoot)

  const successBatch = buildBatch('export-success-001')
  const successBytes = batchBytes(successBatch)
  let successDeleteCount = 0
  const successRequests: Array<{ method: string; path: string; authorization?: string; ifMatch?: string }> = []
  const successLogs: string[] = []
  const success = await withServer((request, response) => {
    successRequests.push({
      method: request.method ?? '',
      path: request.url ?? '',
      authorization: request.headers.authorization,
      ifMatch: request.headers['if-match'],
    })
    if (request.method === 'POST' && request.url === '/api/operations/goal-feedback/v1/export-batches?limit=25') {
      json(response, 200, successBytes)
      return
    }
    if (request.method === 'DELETE' && request.url === '/api/operations/goal-feedback/v1/export-batches/export-success-001') {
      successDeleteCount += 1
      json(response, 200, deletionReceiptBytes(successBatch))
      return
    }
    response.writeHead(404)
    response.end()
  }, async (baseUrl) => pullGoalFeedback({
    baseUrl,
    operatorToken: OPERATOR_TOKEN,
    limit: 25,
    outputRoot: join(temporaryRoot, 'success-inbox'),
    log: (message) => successLogs.push(message),
  }))
  assert.equal(success.status, 'downloaded')
  assert.equal(success.deletedOnline, true)
  assert.equal(successDeleteCount, 1)
  assert.deepEqual(successRequests.map(({ method }) => method), ['POST', 'DELETE'])
  assert.ok(successRequests.every(({ authorization }) => authorization === `Bearer ${OPERATOR_TOKEN}`))
  assert.equal(successRequests[1]?.ifMatch, `"${successBatch.payloadDigest}"`)
  assert.deepEqual(await readFile(join(success.inboxDirectory, 'bundle.json')), successBytes)
  const validation = await validateGoalFeedbackInbox(success.inboxDirectory, localIndexPath)
  assert.equal(validation.localDifferenceCount, 0)
  assert.equal((await readFile(validation.candidatePath)).length, 0)
  const comparison = await readFile(validation.comparisonPath, 'utf8')
  assert.match(comparison, /"comparisonStatus":"production_current\/local_match"/u)
  const untrusted = await readFile(join(success.inboxDirectory, 'untrusted-feedback.jsonl'), 'utf8')
  assert.match(untrusted, /"trustBoundary":"untrusted_external_input"/u)
  assert.match(untrusted, /"privacyNoticeVersion":"2026-08-30\.1"/u)
  assert.match(untrusted, /"privacyNoticeLocale":"de"/u)
  const trusted = await readFile(join(success.inboxDirectory, 'trusted-context.jsonl'), 'utf8')
  assert.match(trusted, /"serverTrustedContext"/u)
  assert.match(trusted, /"title":"Fixture-Lernziel"/u)
  assert.match(trusted, /"breadcrumbs":\["Fixture-Fach","Fixture-Kapitel"\]/u)
  const receipt = await readFile(join(success.inboxDirectory, 'delete-receipt.json'), 'utf8')
  assert.equal(receipt, deletionReceiptBytes(successBatch).toString('utf8'))
  assert.match(receipt, /"status":"DELETED"/u)
  const persistedContents = await Promise.all([
    'bundle.json',
    'manifest.json',
    'trusted-context.jsonl',
    'untrusted-feedback.jsonl',
    'CRITICAL_REVIEW_INSTRUCTIONS.md',
    'delete-receipt.json',
    'local-context-comparison.jsonl',
    'triage-candidates.jsonl',
  ].map((name) => readFile(join(success.inboxDirectory, name), 'utf8')))
  assert.ok(persistedContents.every((content) => !content.includes(OPERATOR_TOKEN)))
  assert.ok(successLogs.every((message) => !message.includes(OPERATOR_TOKEN)))

  const historicalEnvelope = {
    ...envelope,
    context: { ...envelope.context, goalFingerprint: DIGEST('e') },
  }
  const historicalBatch = buildBatch('export-historical-001', {
    bindingStatus: 'exact_historical',
    envelope: historicalEnvelope,
    envelopeDigest: sha256Digest(canonicalJson(historicalEnvelope)),
  })
  const historicalComparison = await compareGoalFeedbackWithLocalRepository(historicalBatch, localIndexPath)
  assert.equal(historicalComparison[0]?.comparisonStatus, 'production_historical/local_different')
  assert.deepEqual(
    historicalComparison[0]?.reasons,
    ['local_goal_fingerprint_different'],
  )
  assert.equal(historicalComparison[0]?.productionBindingStatus, 'exact_historical')
  assert.equal(historicalComparison[0]?.localComparisonStatus, 'local_different')
  assert.equal(historicalComparison[0]?.productionContext.goalFingerprint, DIGEST('e'))
  assert.equal(historicalComparison[0]?.productionSnapshot.goal.title, 'Fixture-Lernziel')
  assert.equal(historicalComparison[0]?.localContext?.goalFingerprint, DIGEST('a'))

  const mismatchedSnapshotBatch = buildBatch('export-snapshot-mismatch-001', {
    serverTrustedContext: {
      ...serverTrustedContext(envelope),
      context: { ...envelope.context, goalId: 'different-goal' },
    },
  })
  let mismatchedSnapshotDeletes = 0
  await withServer((request, response) => {
    if (request.method === 'DELETE') mismatchedSnapshotDeletes += 1
    if (request.method === 'POST') {
      json(response, 200, batchBytes(mismatchedSnapshotBatch))
      return
    }
    response.writeHead(404)
    response.end()
  }, async (baseUrl) => {
    await assert.rejects(
      pullGoalFeedback({
        baseUrl,
        operatorToken: OPERATOR_TOKEN,
        outputRoot: join(temporaryRoot, 'snapshot-mismatch-inbox'),
        log: () => undefined,
      }),
      /serverTrustedContext does not match/u,
    )
  })
  assert.equal(mismatchedSnapshotDeletes, 0)

  const extraKeyBatch = buildBatch('export-extra-key-001')
  const extraKeyPayload = {
    ...extraKeyBatch.payload,
    records: [{
      ...extraKeyBatch.payload.records[0],
      exactDuplicateKey: 'server-internal-deduplication-material-must-not-be-exported',
    }],
  }
  const extraKeyBytes = Buffer.from(JSON.stringify({
    payloadDigest: sha256Digest(canonicalJson(extraKeyPayload)),
    payload: extraKeyPayload,
  }))
  await assert.rejects(
    validateGoalFeedbackExportBatch(extraKeyBytes),
    /Feedback export record has unexpected or missing properties/u,
  )

  const wrongNoticeBatch = buildBatch('export-wrong-notice-001', {
    envelope: { ...envelope, privacyNoticeVersion: '2026-08-30.0' },
  })
  await assert.rejects(
    validateGoalFeedbackExportBatch(batchBytes(wrongNoticeBatch)),
    /Feedback export envelope violates the V2 contract/u,
  )

  const badDigestBatch = { ...buildBatch('export-bad-digest-001'), payloadDigest: DIGEST('f') }
  let badDigestDeletes = 0
  let badDigestError = ''
  await withServer((request, response) => {
    if (request.method === 'DELETE') badDigestDeletes += 1
    if (request.method === 'POST') {
      json(response, 200, batchBytes(badDigestBatch))
      return
    }
    response.writeHead(404)
    response.end()
  }, async (baseUrl) => {
    try {
      await pullGoalFeedback({
        baseUrl,
        operatorToken: OPERATOR_TOKEN,
        outputRoot: join(temporaryRoot, 'bad-digest-inbox'),
        log: () => undefined,
      })
      assert.fail('Digest mismatch unexpectedly succeeded.')
    } catch (error) {
      badDigestError = error instanceof Error ? error.message : String(error)
    }
  })
  assert.match(badDigestError, /payload digest does not match/u)
  assert.ok(!badDigestError.includes(OPERATOR_TOKEN))
  assert.equal(badDigestDeletes, 0)

  const conflictBatch = buildBatch('export-write-conflict-001')
  const conflictRoot = join(temporaryRoot, 'conflict-inbox')
  await mkdir(join(conflictRoot, conflictBatch.payload.exportId), { recursive: true, mode: 0o700 })
  let conflictDeletes = 0
  await withServer((request, response) => {
    if (request.method === 'DELETE') conflictDeletes += 1
    if (request.method === 'POST') {
      json(response, 200, batchBytes(conflictBatch))
      return
    }
    response.writeHead(404)
    response.end()
  }, async (baseUrl) => {
    await assert.rejects(
      pullGoalFeedback({
        baseUrl,
        operatorToken: OPERATOR_TOKEN,
        outputRoot: conflictRoot,
        log: () => undefined,
      }),
      /EEXIST/u,
    )
  })
  assert.equal(conflictDeletes, 0)

  const symlinkBatch = buildBatch('export-symlink-root-001')
  const symlinkTarget = join(temporaryRoot, 'symlink-target')
  const symlinkRoot = join(temporaryRoot, 'symlink-inbox-root')
  await mkdir(symlinkTarget, { mode: 0o700 })
  await symlink(symlinkTarget, symlinkRoot, 'dir')
  let symlinkDeletes = 0
  await withServer((request, response) => {
    if (request.method === 'DELETE') symlinkDeletes += 1
    if (request.method === 'POST') {
      json(response, 200, batchBytes(symlinkBatch))
      return
    }
    response.writeHead(404)
    response.end()
  }, async (baseUrl) => {
    await assert.rejects(
      pullGoalFeedback({
        baseUrl,
        operatorToken: OPERATOR_TOKEN,
        outputRoot: symlinkRoot,
        log: () => undefined,
      }),
      /must be a real directory|must not contain symlinks/u,
    )
  })
  assert.equal(symlinkDeletes, 0)
  await assert.rejects(readFile(join(symlinkTarget, symlinkBatch.payload.exportId, 'bundle.json')), /ENOENT/u)

  const fileSymlinkBatch = buildBatch('export-file-symlink-001')
  const fileSymlinkRoot = join(temporaryRoot, 'file-symlink-inbox')
  const { inboxDirectory: fileSymlinkInbox } = await writeGoalFeedbackInbox(
    fileSymlinkRoot,
    fileSymlinkBatch,
    batchBytes(fileSymlinkBatch),
  )
  const trustedContextPath = join(fileSymlinkInbox, 'trusted-context.jsonl')
  await rm(trustedContextPath)
  await symlink('bundle.json', trustedContextPath)
  await assert.rejects(
    verifyGoalFeedbackInbox(fileSymlinkInbox),
    /ELOOP|symbolic link/u,
  )

  const oversizedChunkedRoot = join(temporaryRoot, 'oversized-chunked-inbox')
  const oversizedChunk = Buffer.alloc(1024 * 1024, 0x78)
  let oversizedChunkedDeletes = 0
  let oversizedChunksSent = 0
  await withServer((request, response) => {
    if (request.method === 'DELETE') {
      oversizedChunkedDeletes += 1
      response.writeHead(500)
      response.end()
      return
    }
    if (request.method !== 'POST') {
      response.writeHead(404)
      response.end()
      return
    }
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    })
    let closed = false
    response.on('close', () => {
      closed = true
    })
    const writeNextChunk = (): void => {
      if (closed) return
      if (oversizedChunksSent >= 64) {
        response.end()
        return
      }
      oversizedChunksSent += 1
      if (response.write(oversizedChunk)) {
        setImmediate(writeNextChunk)
      } else {
        response.once('drain', writeNextChunk)
      }
    }
    writeNextChunk()
  }, async (baseUrl) => {
    await assert.rejects(
      pullGoalFeedback({
        baseUrl,
        operatorToken: OPERATOR_TOKEN,
        outputRoot: oversizedChunkedRoot,
        log: () => undefined,
      }),
      /response exceeds the local size limit/u,
    )
  })
  assert.equal(oversizedChunkedDeletes, 0)
  assert.ok(oversizedChunksSent > 16 && oversizedChunksSent < 64)
  await assert.rejects(readFile(oversizedChunkedRoot), /ENOENT/u)

  const invalidReceiptBatch = buildBatch('export-invalid-receipt-001')
  let invalidReceiptDeletes = 0
  let invalidReceiptInbox = ''
  await withServer((request, response) => {
    if (request.method === 'POST') {
      json(response, 200, batchBytes(invalidReceiptBatch))
      return
    }
    if (request.method === 'DELETE') {
      invalidReceiptDeletes += 1
      const invalidReceipt = JSON.parse(deletionReceiptBytes(invalidReceiptBatch).toString('utf8')) as Record<string, unknown>
      invalidReceipt.recordCount = 2
      json(response, 200, Buffer.from(JSON.stringify(invalidReceipt)))
      return
    }
    response.writeHead(404)
    response.end()
  }, async (baseUrl) => {
    try {
      await pullGoalFeedback({
        baseUrl,
        operatorToken: OPERATOR_TOKEN,
        outputRoot: join(temporaryRoot, 'invalid-receipt-inbox'),
        log: () => undefined,
      })
      assert.fail('Invalid deletion receipt unexpectedly succeeded.')
    } catch (error) {
      assert.match(error instanceof Error ? error.message : String(error), /recordCount does not match/u)
      invalidReceiptInbox = join(temporaryRoot, 'invalid-receipt-inbox', invalidReceiptBatch.payload.exportId)
    }
  })
  assert.equal(invalidReceiptDeletes, 1)
  await assert.rejects(readFile(join(invalidReceiptInbox, 'delete-receipt.json')), /ENOENT/u)

  const redownloadBatch = buildBatch('export-redownload-001')
  const redownloadMethods: string[] = []
  const redownload = await withServer((request, response) => {
    redownloadMethods.push(request.method ?? '')
    if (request.method === 'GET' && request.url === '/api/operations/goal-feedback/v1/export-batches/export-redownload-001') {
      json(response, 200, batchBytes(redownloadBatch))
      return
    }
    response.writeHead(404)
    response.end()
  }, async (baseUrl) => pullGoalFeedback({
    baseUrl,
    operatorToken: OPERATOR_TOKEN,
    batchId: redownloadBatch.payload.exportId,
    outputRoot: join(temporaryRoot, 'redownload-inbox'),
    keepOnline: true,
    log: () => undefined,
  }))
  assert.equal(redownload.status, 'downloaded')
  if (redownload.status !== 'downloaded') assert.fail('Expected a downloaded re-download batch.')
  assert.equal(redownload.deletedOnline, false)
  assert.deepEqual(redownloadMethods, ['GET'])

  await assert.rejects(
    validateGoalFeedbackInbox(redownload.inboxDirectory, localIndexPath),
    /no verified online deletion receipt/u,
  )
  const openValidation = await validateGoalFeedbackInbox(
    redownload.inboxDirectory,
    localIndexPath,
    { allowOpen: true },
  )
  assert.equal(openValidation.recordCount, 1)

  const resumeRequests: Array<{ method: string; ifMatch?: string }> = []
  const resumed = await withServer((request, response) => {
    resumeRequests.push({
      method: request.method ?? '',
      ifMatch: request.headers['if-match'],
    })
    if (request.method === 'DELETE'
      && request.url === '/api/operations/goal-feedback/v1/export-batches/export-redownload-001') {
      json(response, 200, deletionReceiptBytes(redownloadBatch))
      return
    }
    response.writeHead(404)
    response.end()
  }, async (baseUrl) => {
    const first = await pullGoalFeedback({
      baseUrl,
      operatorToken: OPERATOR_TOKEN,
      resumeInbox: redownload.inboxDirectory,
      log: () => undefined,
    })
    const repeated = await pullGoalFeedback({
      baseUrl,
      operatorToken: OPERATOR_TOKEN,
      resumeInbox: redownload.inboxDirectory,
      log: () => undefined,
    })
    return { first, repeated }
  })
  assert.equal(resumed.first.status, 'downloaded')
  assert.equal(resumed.repeated.status, 'downloaded')
  assert.deepEqual(resumeRequests.map(({ method }) => method), ['DELETE', 'DELETE'])
  assert.ok(resumeRequests.every(({ ifMatch }) => ifMatch === `"${redownloadBatch.payloadDigest}"`))
  assert.deepEqual(
    await readFile(join(redownload.inboxDirectory, 'delete-receipt.json')),
    deletionReceiptBytes(redownloadBatch),
  )
  await validateGoalFeedbackInbox(redownload.inboxDirectory, localIndexPath)

  const tamperedReceipt = JSON.parse(deletionReceiptBytes(redownloadBatch).toString('utf8')) as Record<string, unknown>
  tamperedReceipt.recordCount = 2
  await writeFile(join(redownload.inboxDirectory, 'delete-receipt.json'), JSON.stringify(tamperedReceipt))
  await assert.rejects(
    validateGoalFeedbackInbox(redownload.inboxDirectory, localIndexPath, { allowOpen: true }),
    /recordCount does not match/u,
  )

  const emptyLogs: string[] = []
  const empty = await withServer((_request, response) => {
    response.writeHead(204)
    response.end()
  }, async (baseUrl) => pullGoalFeedback({
    baseUrl,
    operatorToken: OPERATOR_TOKEN,
    outputRoot: join(temporaryRoot, 'empty-inbox'),
    log: (message) => emptyLogs.push(message),
  }))
  assert.deepEqual(empty, { status: 'empty' })
  assert.match(emptyLogs.join('\n'), /No goal-feedback export batch/u)
  assert.ok(emptyLogs.every((message) => !message.includes(OPERATOR_TOKEN)))

  assert.equal(validateGoalFeedbackBaseUrl('https://skillpilot.com').origin, 'https://skillpilot.com')
  assert.equal(validateGoalFeedbackBaseUrl('http://localhost:8080').origin, 'http://localhost:8080')
  assert.throws(() => validateGoalFeedbackBaseUrl('http://skillpilot.com'), /credentials may be sent only/u)
  assert.throws(() => validateGoalFeedbackBaseUrl('https://staging.skillpilot.com'), /credentials may be sent only/u)
  assert.throws(() => parsePullGoalFeedbackArgs(['--token', 'forbidden']), /Unknown feedback pull option/u)
  assert.throws(
    () => parsePullGoalFeedbackArgs(['--resume-inbox', '/tmp/inbox', '--limit', '1']),
    /cannot be combined/u,
  )
  assert.equal(canonicalJson({ z: 1, a: ['x', true] }), '{"a":["x",true],"z":1}')

  let shortTokenRequests = 0
  await withServer((_request, response) => {
    shortTokenRequests += 1
    response.writeHead(500)
    response.end()
  }, async (baseUrl) => {
    await assert.rejects(
      pullGoalFeedback({
        baseUrl,
        operatorToken: 'x'.repeat(31),
        outputRoot: join(temporaryRoot, 'short-token-inbox'),
        log: () => undefined,
      }),
      /OPERATOR_TOKEN has an invalid format/u,
    )
  })
  assert.equal(shortTokenRequests, 0)

  console.log('Goal-feedback pull, local verification, deletion, and failure-path tests passed.')
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}
