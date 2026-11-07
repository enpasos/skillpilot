// SPDX-License-Identifier: Apache-2.0
// Genuine private-Git regressions adapted from the preserved independent counterprobe.
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { basename, resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { deflateSync } from 'node:zlib'
import { createVisualizationContextVerifier } from './goalVisualizationReviewedContext'

const root = resolve(import.meta.dirname, '../..')
const census = JSON.parse(readFileSync(resolve(root, 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-first-two-families/family-census.json'), 'utf8'))
const row = census.candidateReceipts.map((r: any) => ({ ...r, receipt: JSON.parse(readFileSync(resolve(root, r.path), 'utf8')) }))
  .find((r: any) => r.receipt.reviewProfile === 'matrix-candidate-v1')
const original = row.receipt
const scratch = mkdtempSync('/dev/shm/skillpilot-v-context-peer-')
const sha = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const outputRows: any[] = []
const local = (p: string, raw: Buffer | string) => { mkdirSync(dirname(resolve(scratch, p)), { recursive: true }); writeFileSync(resolve(scratch, p), raw) }
const git = (...args: string[]): Buffer => {
  const p = spawnSync('git', ['-C', scratch, ...args], { maxBuffer: 16 * 1024 * 1024 })
  if (p.status !== 0) throw new Error(String(p.stderr))
  return p.stdout
}
const commit = (message: string) => {
  git('add', '.')
  git('-c', 'user.name=Isolated review fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', message)
  return git('rev-parse', 'HEAD').toString().trim()
}
const oldSource = spawnSync('git', ['--no-replace-objects', '-C', root, 'show', original.ownerSource.gitCommit + ':' + original.ownerSource.path], { maxBuffer: 16 * 1024 * 1024 }).stdout
const originalReview = readFileSync(resolve(root, original.originalReview.path))
const actualSource = JSON.parse(readFileSync(resolve(root, original.ownerSource.path), 'utf8'))
const goal = actualSource.goals.find((g: any) => g.id === original.context.goalId)
const primary = goal.resourceLinks.filter((l: any) => l.type === 'goal-visualization' && (!l.role || l.role === 'primary'))
if (primary.length !== 1) throw new Error('Ambiguous actual primary asset')
const imageUrl = primary[0].url
const current: any = { ...original.context, imageUrl, publicAssetPath: 'app/public' + imageUrl,
  canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length) }
const receiptAt = (base: string) => {
  const receipt = structuredClone(original)
  for (const key of ['originalReview', 'originalInput', 'ownerSource', 'reviewedAsset']) receipt[key].gitCommit = base
  return receipt
}
const run = (id: string, label: string, anchor: string, receipt: any, context: any, expectedOk: boolean) => {
  const raw = Buffer.from(JSON.stringify(receipt))
  local('peer/receipt.json', raw)
  let result: any
  try {
    result = createVisualizationContextVerifier({ repositoryRoot: scratch, acceptedRepositoryCommit: anchor })({ path: 'peer/receipt.json', sha256: sha(raw) }, context)
  } catch (error) {
    result = { ok: false, status: 'invalid-anchor', issues: [error instanceof Error ? error.message : String(error)] }
  }
  outputRows.push({ id, label, expectedOk, actualOk: result.ok, result: result.ok ? { ok: true, context: result.capability.context } : result })
}
try {
  git('init', '-q')
  local(original.originalReview.path, originalReview)
  local(original.ownerSource.path, oldSource)
  for (const p of [original.reviewedAsset.path, current.publicAssetPath, current.canonicalAssetPath]) local(p, readFileSync(resolve(root, p)))
  const base = commit('Private original fixture: exact genuine original review and asset bytes')
  const receipt = receiptAt(base)
  run('VCTX-PEER-CONTROL', 'Genuine original review and image bytes in an isolated committed fixture', base, receipt, current, true)

  const foreign = JSON.parse(oldSource.toString())
  foreign.landscapeId = '11111111-2222-4333-8444-555555555555'
  const foreignRaw = Buffer.from(JSON.stringify(foreign))
  const foreignPath = 'qa-artifacts/foreign-owner-copy.json'
  local(foreignPath, foreignRaw)
  const foreignCommit = commit('Private archival copy with a different owner, not the original reviewed owner')
  const wrongOwner = structuredClone(receipt)
  wrongOwner.context.landscapeId = foreign.landscapeId
  wrongOwner.ownerSource = { path: foreignPath, gitCommit: foreignCommit, sha256: sha(foreignRaw) }
  run('VCTX-PEER-01A', 'An unrelated archived source copy must not supply the original review owner', foreignCommit, wrongOwner,
    { ...current, landscapeId: foreign.landscapeId }, false)

  local(original.ownerSource.path, foreignRaw)
  const movedOwnerCommit = commit('Private later canonical owner change, without a new image review')
  const laterOwner = structuredClone(wrongOwner)
  laterOwner.ownerSource = { path: original.ownerSource.path, gitCommit: movedOwnerCommit, sha256: sha(foreignRaw) }
  run('VCTX-PEER-01B', 'A later canonical owner must not rewrite an earlier review association', movedOwnerCommit, laterOwner,
    { ...current, landscapeId: foreign.landscapeId }, false)

  const shiftedTogether = receiptAt(movedOwnerCommit)
  shiftedTogether.context.landscapeId = foreign.landscapeId
  shiftedTogether.ownerSource.sha256 = sha(foreignRaw)
  run('VCTX-PEER-01C', 'Moving all original refs together cannot reassign the reviewed canonical owner', movedOwnerCommit,
    shiftedTogether, { ...current, landscapeId: foreign.landscapeId }, false)

  // The externally supplied base commit must keep its actual original tree even
  // when a local Git replacement ref redirects Git's ordinary object traversal.
  local(original.ownerSource.path, oldSource)
  const forgedReview = JSON.parse(originalReview.toString())
  forgedReview.goalSnapshot.description += ' Zusätzlich eine nie begutachtete neue Leistung.'
  const forgedRaw = Buffer.from(JSON.stringify(forgedReview))
  local(original.originalReview.path, forgedRaw)
  const substitute = commit('Private contradictory replacement object, never the accepted base')
  const forgedReceipt = receiptAt(base)
  forgedReceipt.context.description = forgedReview.goalSnapshot.description
  forgedReceipt.originalReview.sha256 = sha(forgedRaw)
  forgedReceipt.originalInput.sha256 = sha(forgedRaw)
  const forgedCurrent = { ...current, description: forgedReview.goalSnapshot.description }
  run('VCTX-PEER-02-CONTROL', 'Changed original review is rejected without a replacement ref', base, forgedReceipt, forgedCurrent, false)
  git('replace', base, substitute)
  run('VCTX-PEER-02', 'A local replacement must not change the externally pinned accepted commit content', base, forgedReceipt, forgedCurrent, false)
  git('replace', '-d', base)

  const graftedReceipt = receiptAt(substitute)
  graftedReceipt.context.description = forgedReview.goalSnapshot.description
  graftedReceipt.originalReview.sha256 = sha(forgedRaw)
  graftedReceipt.originalInput.sha256 = sha(forgedRaw)
  run('VCTX-GRAFT-CONTROL', 'An unaccepted later review commit is not an ancestor of the accepted base', base,
    graftedReceipt, forgedCurrent, false)
  local('.git/info/grafts', base + ' ' + substitute + '\n')
  run('VCTX-GRAFT', 'A local graft cannot authenticate a never-accepted review history', base,
    graftedReceipt, forgedCurrent, false)
  rmSync(resolve(scratch, '.git/info/grafts'))

  run('VCTX-ODB-CONTROL', 'The same forged context is rejected while all original object bytes remain intact', base,
    forgedReceipt, forgedCurrent, false)
  const replaceLooseBytes = (objectId: string, kind: string, bytes: Buffer, operation: () => void) => {
    const path = resolve(scratch, '.git/objects', objectId.slice(0, 2), objectId.slice(2))
    const originalCompressed = readFileSync(path)
    try {
      chmodSync(path, 0o644)
      writeFileSync(path, deflateSync(Buffer.concat([Buffer.from(`${kind} ${bytes.length}\0`), bytes])))
      operation()
    } finally { writeFileSync(path, originalCompressed); chmodSync(path, 0o444) }
  }
  const originalBlobOid = git('rev-parse', base + ':' + original.originalReview.path).toString().trim()
  const forgedBlobOid = git('rev-parse', substitute + ':' + original.originalReview.path).toString().trim()
  replaceLooseBytes(originalBlobOid, 'blob', forgedRaw, () =>
    run('VCTX-ODB-BLOB', 'A different review payload under the accepted blob OID is never authentic', base, forgedReceipt, forgedCurrent, false))
  const treeOid = git('rev-parse', base + ':' + dirname(original.originalReview.path)).toString().trim()
  const tree = Buffer.from(git('cat-file', 'tree', treeOid))
  const selector = Buffer.concat([Buffer.from(' ' + basename(original.originalReview.path) + '\0'), Buffer.from(originalBlobOid, 'hex')])
  const position = tree.indexOf(selector)
  if (position < 0) throw new Error('Actual original tree entry is absent')
  Buffer.from(forgedBlobOid, 'hex').copy(tree, position + selector.length - 20)
  replaceLooseBytes(treeOid, 'tree', tree, () =>
    run('VCTX-ODB-TREE', 'A forged path tree cannot redirect the accepted review to a different valid blob', base, forgedReceipt, forgedCurrent, false))
  const substituteTree = git('rev-parse', substitute + '^{tree}').toString().trim()
  const commitBytes = Buffer.from(git('cat-file', 'commit', base).toString().replace(/^tree [0-9a-f]{40}\n/u, 'tree ' + substituteTree + '\n'))
  replaceLooseBytes(base, 'commit', commitBytes, () =>
    run('VCTX-ODB-COMMIT', 'The external anchor cannot select a different valid tree through counterfeit commit bytes', base, forgedReceipt, forgedCurrent, false))

  const result = { schemaVersion: 1, scope: 'Small private Git fixtures only; exact real review/asset bytes are reused for the positive control, and deliberate mutants do not create new reviews.',
    coreSha256: sha(readFileSync(resolve(root, 'app/scripts/goalVisualizationReviewedContext.ts'))),
    codePins: ['app/scripts/goalVisualizationReviewedContext.ts', 'app/scripts/testGoalVisualizationReviewedContext.ts', 'contracts/goal-visualization-context/v1/qualification.schema.json'].map(path => ({ path, sha256: sha(readFileSync(resolve(root, path))) })),
    originalExampleReceipt: { path: row.path, sha256: row.sha256 }, results: outputRows,
    unexpectedAccepts: outputRows.filter(r => !r.expectedOk && r.actualOk).length,
    activeSourceOrQaWrites: false, newReviewOrFullQaClaimed: false }
  console.log(JSON.stringify({ count: outputRows.length, unexpectedAccepts: result.unexpectedAccepts,
    results: outputRows.map(({ id, expectedOk, actualOk, result }) => ({ id, expectedOk, actualOk, issues: result.issues ?? [] })) }))
  if (outputRows.some(r => r.expectedOk !== r.actualOk)
    || outputRows.some(r => ['VCTX-ODB-BLOB', 'VCTX-ODB-TREE', 'VCTX-ODB-COMMIT'].includes(r.id)
      && !r.actualOk && !JSON.stringify(r.result).includes('object OID differs'))) process.exitCode = 1
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
