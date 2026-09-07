// Narrow orchestration of native generators and a HEAD -> current evidence delta.
// Does not author curricula, approvals, review records or source provenance.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseAndValidateGoalBookModel, stableGoalBookJson, writeGoalBookModel } from '../../../../../../../../../app/scripts/goalBookModel'
import { buildGoalBookOriginalSources, serializeGoalBookOriginalSources } from '../../../../../../../../../app/scripts/goalBookOriginalSources'
import { parseGoalBookOriginalSources } from '../../../../../../../../../app/src/utils/goalBookOriginalSources'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewContext } from '../../../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../../..')
const snapshotRoot = resolve(root, 'tmp/goal-books/b038-derived-snapshot')
const headCommit = 'e1017e9f8bc2d1d9b5b9e28990445b74b33a0426'
const subjects = { math: 'mathematik', physics: 'physik' } as const
const sha = (value: string | Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const semanticSha = (value: unknown) => sha(stableGoalBookJson(value))
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const json = (path: string) => JSON.parse(read(path))
const head = (path: string) => execFileSync('git', ['show', `${headCommit}:${path}`], { cwd: root, maxBuffer: 128 * 1024 * 1024, encoding: 'utf8' })
const serialize = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const [mode, selected, label = 'b038'] = process.argv.slice(2)
assert(['snapshot', 'snapshot-artifacts', 'delta', 'source-delta', 'publish'].includes(mode), 'Usage: snapshot|snapshot-artifacts|delta|source-delta|publish math|physics [label]')
assert(selected in subjects)
const subject = selected as keyof typeof subjects
const stem = `de-gym-${subjects[subject]}-bundesweit`
const modelPath = `tmp/goal-books/${stem}.book-model.json`
const publicModelPath = `app/public/lernzielbuch/${stem}.book-model.json`
const model = parseAndValidateGoalBookModel(read(modelPath))
const canonicalPath = model.source.landscapePath
const snapshotCanonicalPath = resolve(snapshotRoot, `${subject}-b038.canonical.json`)
const canonical = mode === 'delta' && label === 'b038' && existsSync(snapshotCanonicalPath)
  ? JSON.parse(readFileSync(snapshotCanonicalPath, 'utf8')) : json(canonicalPath)
const modelDigest = model.digest

const immutable = (path: string, bytes: string) => {
  if (existsSync(path)) assert.equal(readFileSync(path, 'utf8'), bytes, `${path}: immutable snapshot differs`)
  else writeFileSync(path, bytes, { flag: 'wx' })
}
const context = (page: any, goal: any) => ({
  goalId: page.goalId, goalFingerprint: page.goalFingerprint, pageFingerprint: page.pageFingerprint,
  currentTitleDe: goal.title ?? '', currentTitleEn: goal.titleEn ?? '',
  currentDescriptionDe: goal.description ?? '', currentDescriptionEn: goal.descriptionEn ?? '',
  canonicalContext: buildGoalDescriptionCanonicalContext(goal),
  reviewContext: { page, evidenceProfile: null },
})
const delta = (beforeModel: any, afterModel: any, beforeCanonical: any, afterCanonical: any) => {
  const beforePages = new Map<string, any>(beforeModel.pages.map((page: any) => [page.goalId, page]))
  const beforeGoals = new Map<string, any>(beforeCanonical.goals.map((goal: any) => [goal.id, goal]))
  const afterGoals = new Map<string, any>(afterCanonical.goals.map((goal: any) => [goal.id, goal]))
  const changed = afterModel.pages.flatMap((page: any) => {
    const old = beforePages.get(page.goalId)
    if (!old) return [{ goalId: page.goalId, added: true }]
    const oldContext = context(old, beforeGoals.get(page.goalId))
    const newContext = context(page, afterGoals.get(page.goalId))
    const oldFingerprint = fingerprintGoalDescriptionReviewContext(oldContext)
    const newFingerprint = fingerprintGoalDescriptionReviewContext(newContext)
    if (oldFingerprint === newFingerprint) return []
    const changedPageFields = [...new Set([...Object.keys(old), ...Object.keys(page)])]
      .filter(key => stableGoalBookJson(old[key] ?? null) !== stableGoalBookJson(page[key] ?? null))
    const beforeGoal = beforeGoals.get(page.goalId)
    const afterGoal = afterGoals.get(page.goalId)
    const changedCanonicalFields = [...new Set([...Object.keys(beforeGoal), ...Object.keys(afterGoal)])]
      .filter(key => stableGoalBookJson(beforeGoal[key] ?? null) !== stableGoalBookJson(afterGoal[key] ?? null))
    return [{
      goalId: page.goalId, title: page.title, changedPageFields, changedCanonicalFields,
      goalFingerprint: { before: old.goalFingerprint, after: page.goalFingerprint },
      pageFingerprint: { before: old.pageFingerprint, after: page.pageFingerprint },
      goalReviewContextFingerprint: { before: oldFingerprint, after: newFingerprint },
      actualPageDelta: Object.fromEntries(changedPageFields.filter(key => !key.endsWith('Fingerprint')).map(key => [key, { before: old[key] ?? null, after: page[key] ?? null }])),
    }]
  })
  return {
    beforeModelDigest: beforeModel.digest, afterModelDigest: afterModel.digest,
    beforeCanonicalDigest: semanticSha(beforeCanonical), afterCanonicalDigest: semanticSha(afterCanonical),
    goalFingerprintChangedGoalIds: changed.filter((record: any) => record.goalFingerprint?.before !== record.goalFingerprint?.after).map((record: any) => record.goalId),
    pageFingerprintChangedGoalIds: changed.filter((record: any) => record.pageFingerprint?.before !== record.pageFingerprint?.after).map((record: any) => record.goalId),
    contextFingerprintChangedGoalIds: changed.map((record: any) => record.goalId),
    removedGoalIds: beforeModel.pages.filter((page: any) => !afterGoals.has(page.goalId)).map((page: any) => page.goalId),
    changes: changed,
  }
}

async function main() {
  if (mode === 'source-delta') {
    const originalPath = `app/public/lernzielbuch/${stem}.original-sources.json`
    const before = JSON.parse(head(originalPath)), after = json(originalPath)
    const expanded = (index: any) => {
      const documents = new Map(index.documents.map(({ id, ...value }: any) => [id, value]))
      const evidence = new Map(index.evidence.map(({ id, documentId, ...value }: any) => [id, { ...value, document: documents.get(documentId) }]))
      return Object.fromEntries(Object.entries(index.goals).map(([goalId, rows]: any) => [goalId, rows.map(({ evidenceIds, ...row }: any) => ({
        ...row, evidence: evidenceIds.map((id: string) => evidence.get(id)).sort((a: any, b: any) => stableGoalBookJson(a).localeCompare(stableGoalBookJson(b))),
      }))]))
    }
    const a = expanded(before), b = expanded(after)
    const sourceChanges = Object.keys(b).filter(id => stableGoalBookJson(a[id] ?? null) !== stableGoalBookJson(b[id] ?? null)).map(goalId => ({
      goalId, beforeFingerprint: semanticSha(a[goalId] ?? null), afterFingerprint: semanticSha(b[goalId]),
      beforeRowCount: a[goalId]?.length ?? 0, afterRowCount: b[goalId].length,
    }))
    const rationalePath = `app/public/data/goal-source-rationales-${subject === 'math' ? 'math' : 'physics'}-public.json`
    const ra = JSON.parse(head(rationalePath)), rb = json(rationalePath)
    const beforeRationales = new Map(ra.items.map((item: any) => [item.goal.goalId ?? item.goal.id, item]))
    const rationaleChanges = rb.items.filter((item: any) => stableGoalBookJson(beforeRationales.get(item.goal.goalId ?? item.goal.id)) !== stableGoalBookJson(item)).map((item: any) => ({
      goalId: item.goal.goalId ?? item.goal.id, beforeFingerprint: semanticSha(beforeRationales.get(item.goal.goalId ?? item.goal.id)),
      afterFingerprint: semanticSha(item), beforeStatus: (beforeRationales.get(item.goal.goalId ?? item.goal.id) as any).sourceRationaleStatus, afterStatus: item.sourceRationaleStatus,
    }))
    const report = { schemaVersion: 1, status: 'GENERATED_SOURCE_DELTA_NOT_SOURCE_APPROVAL', headCommit, subject, label,
      method: 'Original-source rows compared after resolving evidence/document IDs; avoids falsely counting native sequential-ID renumbering as source changes. Existing partial/context-only evidence stays partial/context-only.',
      originalSources: { beforeSha256: sha(head(originalPath)), afterSha256: sha(read(originalPath)), beforeDocuments: before.documents.length, afterDocuments: after.documents.length,
        beforeEvidence: before.evidence.length, afterEvidence: after.evidence.length, sourceChanges },
      rationale: { beforeSummary: ra.summary, afterSummary: rb.summary, changes: rationaleChanges },
    }
    const out = resolve(here, `derived-${subject}-${label}-sources-delta.json`)
    immutable(out, serialize(report))
    console.log(JSON.stringify({ path: relative(root, out), originalSourceChangedGoalIds: sourceChanges.map((x: any) => x.goalId), rationaleChangedGoalIds: rationaleChanges.map((x: any) => x.goalId) }, null, 2))
    return
  }
  if (mode === 'snapshot-artifacts') {
    const snapshotModel = JSON.parse(readFileSync(resolve(snapshotRoot, `${subject}-${label}.book-model.json`), 'utf8'))
    const manifest = json(`app/public/lernzielbuch/${stem}.pdf.render-manifest.json`)
    assert.equal(manifest.modelDigest, snapshotModel.digest)
    for (const suffix of ['pdf', 'pdf.render-manifest.json']) {
      const path = resolve(snapshotRoot, `${subject}-${label}.${suffix}`)
      assert(!existsSync(path), 'Snapshot artifact already preserved')
      copyFileSync(resolve(root, `app/public/lernzielbuch/${stem}.${suffix}`), path)
    }
    console.log(`Captured rendered ${subject}/${label} PDF and manifest`)
    return
  }
  if (mode === 'snapshot') {
    assert.equal(semanticSha(canonical), model.source.landscapeDigest, 'Model must bind the captured current canonical bytes')
    mkdirSync(snapshotRoot, { recursive: true })
    immutable(resolve(snapshotRoot, `${subject}-${label}.book-model.json`), read(modelPath))
    immutable(resolve(snapshotRoot, `${subject}-${label}.canonical.json`), read(canonicalPath))
    console.log(`Captured ${subject}/${label}: ${modelDigest}`)
    return
  }
  if (mode === 'delta') {
    assert.equal(semanticSha(canonical), model.source.landscapeDigest, 'Rebuild model before comparing against current canonical')
    const beforeModel = parseAndValidateGoalBookModel(head(publicModelPath))
    const beforeCanonical = JSON.parse(head(canonicalPath))
    const report: any = {
      schemaVersion: 1, scope: 'GENERATED_LAYER_A_DELTA_NOT_REVIEW_APPROVAL', headCommit, subject, label,
      contract: 'Native goal/page fingerprints and goal-description-review-context-v1, with atlas pages and evidenceProfile=null (public models bind no positive profiles); not a rebind of historical review subsets.',
      headToCurrent: delta(beforeModel, model, beforeCanonical, canonical),
    }
    const snapshotModelPath = resolve(snapshotRoot, `${subject}-b038.book-model.json`)
    if (label !== 'b038' && existsSync(snapshotModelPath)) {
      report.b038ToCurrent = delta(JSON.parse(readFileSync(snapshotModelPath, 'utf8')), model,
        JSON.parse(readFileSync(resolve(snapshotRoot, `${subject}-b038.canonical.json`), 'utf8')), canonical)
    }
    const out = resolve(here, `derived-${subject}-${label}-head-delta.json`)
    immutable(out, serialize(report))
    console.log(JSON.stringify({ path: relative(root, out), ...Object.fromEntries(Object.entries(report).filter(([key]) => key.endsWith('Current')).map(([key, value]: any) => [key, { goal: value.goalFingerprintChangedGoalIds, page: value.pageFingerprintChangedGoalIds, context: value.contextFingerprintChangedGoalIds }])) }, null, 2))
    return
  }
  assert.equal(semanticSha(canonical), model.source.landscapeDigest, 'Do not publish stale canonical input')
  const publicRoot = resolve(root, 'app/public/lernzielbuch')
  const manifestPath = resolve(publicRoot, `${stem}.pdf.render-manifest.json`)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  assert.equal(manifest.modelDigest, modelDigest, 'PDF must have been freshly rendered from this exact model')
  const originals = buildGoalBookOriginalSources(model)
  parseGoalBookOriginalSources(originals, model)
  const originalBytes = serializeGoalBookOriginalSources(originals)
  await writeGoalBookModel(model, resolve(root, publicModelPath))
  const originalsPath = resolve(publicRoot, `${stem}.original-sources.json`)
  if (readFileSync(originalsPath, 'utf8') !== originalBytes) writeFileSync(originalsPath, originalBytes)
  const indexPath = resolve(publicRoot, 'index.json')
  const index = JSON.parse(readFileSync(indexPath, 'utf8'))
  const entry = index.books.find((entry: any) => entry.bookId === model.book.id)
  assert(entry)
  entry.pageCount = model.pages.length
  entry.model.sha256 = sha(read(publicModelPath))
  entry.model.modelDigest = modelDigest
  entry.pdf.sha256 = sha(readFileSync(resolve(publicRoot, `${stem}.pdf`)))
  entry.pdf.renderManifestSha256 = sha(readFileSync(manifestPath))
  writeFileSync(indexPath, serialize(index))
  console.log(`Synchronized generated public model/original sources/index for ${subject}: ${modelDigest}`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
