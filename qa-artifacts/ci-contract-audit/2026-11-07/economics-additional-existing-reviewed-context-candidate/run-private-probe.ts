// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createVisualizationContextVerifier as unchangedVerifier } from '../../../../app/scripts/goalVisualizationReviewedContext'
import { createVisualizationContextVerifier as privateVerifier } from './goalVisualizationReviewedContext.private'
const out = dirname(fileURLToPath(import.meta.url)), root = resolve(out, '../../../..')
const index = JSON.parse(readFileSync(resolve(out, 'candidate-index.json'), 'utf8'))
const sha = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const json = (value: unknown) => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const emit = (path: string, value: unknown) => { const target = resolve(out, path); mkdirSync(dirname(target), { recursive: true }); const raw = json(value); writeFileSync(target, raw); return { path: target.slice(root.length + 1), sha256: sha(raw) } }
const fixedBefore = index.activeInputPins.map((ref: any) => {
  if (sha(readFileSync(resolve(root, ref.path))) !== ref.sha256) throw new Error('Prepared active input pin no longer matches: ' + ref.path)
  return { ...ref }
})
const liveSource = JSON.parse(readFileSync(resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'), 'utf8'))
const originalReads = new Map<string, unknown>()
const proposed = privateVerifier({ repositoryRoot: root, acceptedRepositoryCommit: index.acceptedRepositoryCommit,
  onAuthenticatedOriginalRead(ref, currentCopyRequired) { originalReads.set(ref.gitCommit + ':' + ref.path, { ...ref, currentCopyRequired }) } })
const currentVerifier = unchangedVerifier({ repositoryRoot: root, acceptedRepositoryCommit: index.acceptedRepositoryCommit })
const profiles = ['matrix-candidate-v1', 'economics-native-v1', 'diagram-current-b-v1', 'economics-q3-embedded-v1', 'economics-q3-trade-finance-v1']
const rows: unknown[] = [], existingAttempts: unknown[] = []
for (let position = 0; position < index.rows.length; position++) {
  const row = index.rows[position], ref = index.candidateReceipts[position]
  const goals = liveSource.goals.filter((goal: any) => goal.id === row.goalId)
  if (goals.length !== 1) throw new Error('Actual current source goal is ambiguous')
  const goal = goals[0], links = (goal.resourceLinks ?? []).filter((link: any) => link.type === 'goal-visualization' && (!link.role || link.role === 'primary'))
  if (links.length !== 1) throw new Error('Actual current primary asset is ambiguous')
  const imageUrl = links[0].url, publicAssetPath = 'app/public' + imageUrl
  const current = { landscapeId: liveSource.landscapeId, goalId: goal.id, subject: 'wirtschaftswissenschaften',
    title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn, demandLevel: goal.dimensionTags?.demandLevel,
    assetSha256: 'sha256:' + sha(readFileSync(resolve(root, publicAssetPath))), imageUrl, publicAssetPath,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length) }
  if (Object.entries(row.current).some(([key, value]) => current[key as keyof typeof current] !== value)) throw new Error('Actual current source/asset context differs from prepared original comparison')
  const original = JSON.parse(readFileSync(resolve(root, ref.path), 'utf8'))
  for (const reviewProfile of profiles) {
    const candidate = { ...original, reviewProfile }
    const probe = emit('unchanged-profile-attempts/' + reviewProfile + '/' + row.goalId + '.json', candidate)
    const checked = currentVerifier(probe, current)
    existingAttempts.push({ goalId: row.goalId, reviewProfile, checked: checked.ok ? { ok: true } : checked })
    if (checked.ok) throw new Error('Unexpected new pass from an unchanged existing profile')
  }
  const checked = proposed({ path: ref.path, sha256: ref.sha256 }, current)
  rows.push({ goalId: row.goalId, checked: checked.ok ? { ok: true, receiptSha256: checked.capability.receiptSha256, originalReviewSha256: checked.capability.originalReviewSha256 } : checked })
}
emit('unchanged-profile-results.json', { profilesUnmodified: true, attempts: existingAttempts.length, newPasses: 0, results: existingAttempts })
if (rows.some((row: any) => !row.checked.ok)) { emit('private-results.json', { activeQualification: false, results: rows }); throw new Error('Private family proposal did not verify every actual original') }
const expectedOriginals = JSON.parse(readFileSync(resolve(out, 'private-family-pins.json'), 'utf8')).originalReferences
const sortOriginals = (refs: any[]) => refs.map(ref => ({ path: ref.path, gitCommit: ref.gitCommit, sha256: ref.sha256, currentCopyRequired: ref.currentCopyRequired }))
  .sort((left, right) => (left.gitCommit + ':' + left.path).localeCompare(right.gitCommit + ':' + right.path))
if (JSON.stringify(sortOriginals([...originalReads.values()])) !== JSON.stringify(sortOriginals(expectedOriginals))) throw new Error('Actual private verifier original read closure differs from complete pinned original closure')
emit('private-results.json', { activeQualification: false, privateProposalPasses: rows.length, actualNewAiReviews: 0, results: rows,
  authenticatedOriginals: [...originalReads.values()] })

// Real receipt/file/context mutations are isolated in RAM; current originals stay read only.
const temporary = mkdtempSync('/dev/shm/skillpilot-economics-q2-negative-')
const first = index.rows[0], originalRef = index.candidateReceipts[0]
const originalReceipt = readFileSync(resolve(root, originalRef.path))
const receipt = JSON.parse(originalReceipt.toString())
for (const path of [first.current.publicAssetPath, first.current.canonicalAssetPath]) {
  mkdirSync(dirname(resolve(temporary, path)), { recursive: true }); copyFileSync(resolve(root, path), resolve(temporary, path))
}
const writeReceipt = (value: unknown) => { const raw = json(value); writeFileSync(resolve(temporary, 'receipt.json'), raw); return { path: 'receipt.json', sha256: sha(raw) } }
const isolated = privateVerifier({ repositoryRoot: temporary, originalEvidenceRepositoryRoot: root, acceptedRepositoryCommit: index.acceptedRepositoryCommit })
const negatives: any[] = []
const check = (name: string, ref: any, current: any, expected: string) => {
  const result = isolated(ref, current)
  const actual = result.ok ? 'ok' : result.status
  negatives.push({ name, expected, actual, issues: result.ok ? [] : result.issues })
  if (actual !== expected) throw new Error(name + ': expected ' + expected + ', got ' + JSON.stringify(result))
}
try {
  const ref = writeReceipt(receipt)
  check('RAM positive control', ref, first.current, 'ok')
  check('current German description changed', ref, { ...first.current, description: first.current.description + ' Nicht im Review.' }, 'stale')
  check('current supplied English description changed', ref, { ...first.current, descriptionEn: first.current.descriptionEn + ' Changed.' }, 'stale')
  check('current originally supplied demand level changed', ref, { ...first.current, demandLevel: 'AB1' }, 'stale')
  check('receipt byte digest changed', { ...ref, sha256: '0'.repeat(64) }, first.current, 'invalid')
  check('receipt self-nominates different original context', writeReceipt({ ...receipt, context: { ...receipt.context, title: 'Unerprüfter Titel' } }), first.current, 'invalid')
  check('receipt self-nominates altered original hash', writeReceipt({ ...receipt, originalReview: { ...receipt.originalReview, sha256: '0'.repeat(64) } }), first.current, 'invalid')
  check('receipt uses a different original commit', writeReceipt({ ...receipt, originalReview: { ...receipt.originalReview, gitCommit: index.acceptedRepositoryCommit } }), first.current, 'invalid')
  check('receipt drops actually supplied bilingual context', writeReceipt({ ...receipt, context: Object.fromEntries(Object.entries(receipt.context).filter(([key]) => key !== 'descriptionEn')) }), first.current, 'invalid')
  check('receipt drops originally supplied demand level', writeReceipt({ ...receipt, context: Object.fromEntries(Object.entries(receipt.context).filter(([key]) => key !== 'demandLevel')) }), first.current, 'invalid')
  check('receipt changes actual reviewer decision', writeReceipt({ ...receipt, originalDecision: 'yes' }), first.current, 'invalid')
  const good = writeReceipt(receipt)
  const canonical = resolve(temporary, first.current.canonicalAssetPath), originalCanonical = readFileSync(canonical)
  writeFileSync(canonical, Buffer.from('changed canonical image'))
  check('physical canonical asset bytes changed', good, first.current, 'invalid')
  writeFileSync(canonical, originalCanonical)
  const publicPath = resolve(temporary, first.current.publicAssetPath), originalPublic = readFileSync(publicPath)
  writeFileSync(publicPath, Buffer.from('changed public image'))
  check('physical public asset bytes changed', good, first.current, 'invalid')
  writeFileSync(publicPath, originalPublic)
  check('public role is not the declared primary URL', good, { ...first.current, publicAssetPath: first.current.canonicalAssetPath }, 'invalid')
  const duplicateRaw = Buffer.from(originalReceipt.toString().replace('"schemaVersion": 1,', '"schemaVersion": 1, "schemaVersion": 1,'))
  writeFileSync(resolve(temporary, 'receipt.json'), duplicateRaw)
  check('duplicate JSON property', { path: 'receipt.json', sha256: sha(duplicateRaw) }, first.current, 'invalid')
  const correctionPosition = index.rows.findIndex((row: any) => row.corrected)
  const correction = JSON.parse(readFileSync(resolve(root, index.candidateReceipts[correctionPosition].path), 'utf8'))
  const correctedRow = index.rows[correctionPosition]
  for (const path of [correctedRow.current.publicAssetPath, correctedRow.current.canonicalAssetPath]) {
    mkdirSync(dirname(resolve(temporary, path)), { recursive: true }); copyFileSync(resolve(root, path), resolve(temporary, path))
  }
  check('corrected DE-only original positive control', writeReceipt(correction), correctedRow.current, 'ok')
  check('receipt invents English review for DE-only correction', writeReceipt({ ...correction, context: { ...correction.context, titleEn: correctedRow.current.titleEn } }), correctedRow.current, 'invalid')
  check('receipt invents demand review for DE-only correction', writeReceipt({ ...correction, context: { ...correction.context, demandLevel: correctedRow.current.demandLevel } }), correctedRow.current, 'invalid')
  check('corrected receipt substitutes prior rejected image', writeReceipt({ ...correction, reviewedAsset: { ...correction.reviewedAsset, path: correction.reviewedAsset.path.replace('/correction-v2/', '/') } }), correctedRow.current, 'invalid')
  emit('negative-results.json', { isolatedInRam: true, sourceFilesMutated: false, cases: negatives.length, results: negatives })
} finally { rmSync(temporary, { recursive: true, force: true }) }
const after = fixedBefore.map((ref: any) => ({ ...ref, actualSha256: sha(readFileSync(resolve(root, ref.path))) }))
if (after.some((ref: any) => ref.sha256 !== ref.actualSha256)) throw new Error('Protected active input changed during private probe')
emit('protected-inputs-after.json', { activeWritesPerformed: false, allMatched: true, refs: after })
console.log(JSON.stringify({ unchangedProfiles: profiles.length, unchangedProfileAttempts: existingAttempts.length, actualExistingProfileNewPasses: 0,
  privateProposalPasses: rows.length, activeNewQualification: 0, negativeCases: negatives.length,
  authenticatedOriginalReferences: originalReads.size, activeInputPinsUnchanged: after.length }))
