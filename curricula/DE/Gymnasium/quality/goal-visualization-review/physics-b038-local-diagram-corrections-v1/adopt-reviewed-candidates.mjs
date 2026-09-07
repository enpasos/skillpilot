import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// One-shot, six-goal adoption. Manual JSON/Markdown edits are emitted for apply_patch.
// The import phase only invokes the repository-native importer and moves two exact
// rejected public copies into their recoverable archive. No generation or QA sweep.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../..')
process.chdir(root)
const base = 'curricula/DE/Gymnasium/'
const archive = base + 'quality/goal-visualization-review/physics-b038-local-diagram-corrections-v1/'
const canonicalPath = base + 'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const qaPath = base + 'quality/goal-visualization-qa/physik.qa.json'
const preparedPath = archive + 'pre-import-state.json'
const receiptPath = archive + 'image-qa-adoption-receipt-v1.json'
const helperPath = archive + 'adopt-reviewed-candidates.mjs'
const sha = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const read = p => fs.readFileSync(p)
const json = p => JSON.parse(read(p))
const encode = obj => JSON.stringify(obj, null, 2) + '\n'
const normalize = x => String(x ?? '').replace(/\s+/g, ' ').trim()
const one = (rows, field, id) => { const hits = rows.filter(x => x[field] === id); assert.equal(hits.length, 1, id); return hits[0] }
const primary = g => one(g.resourceLinks ?? [], 'role', 'primary')
const choices = [
  ['c0205f47-185c-5e27-b89c-c3ff8809b1d1', 3, 'ec9f43f8ebd14b3d6430f460d4a855264baaf7cb293eec3e32d6aba8b2de588b', 'Gemeinsamer positiver statischer Startwert; keine Kurvenschnitte; schwache Dämpfung mit höherem schmalem Gipfel, starke Dämpfung mit niedrigerem breiterem und leicht nach links versetztem Gipfel. Qualitative Illustration, keine vollständige quantitative Aufgabe.'],
  ['a844895e-2cdc-4665-aad2-a49c62f11759', 2, '4b1d8b2c705ee46671a6e3a2c4633bbbcb2cc312f8ec625eae1f93e90e15323d', 'Zeitnotation und Vorzeichen sind mit den expliziten x-, q- und Strom-Konventionen konsistent. Energieformeln Dx²/2, mv²/2, q²/(2C), LI²/2 und Analogien sind fachlich korrekt; die Formelregressionen aus Kandidat 1 sind behoben.'],
  ['5da7d4d0-878e-44fd-b398-1b1de8b636a4', 1, '2406367b71adc03eca78a0f6de8b4e30e68c3669a744e71b47b1ad75e0d53e18', 'Die obere Kondensatorplatte ist nun innen und außen positiv, die untere negativ. Der bisherige Ladungswiderspruch ist behoben; die übrige lockere LC-Dipol-Skizze bleibt erhalten.'],
  ['5c57dbc7-d258-4aad-a84c-e773f3c493ae', 1, 'e323ef71e0c708d05bde17b39b4110e25881c0e43f3a47bd57282fe57c916b4f', 'Drei hervorgehobene Dichtebänder passen zu drei Wahrscheinlichkeitsgipfeln mit zentralem Maximum; die Achsen lauten Ort x und p(x). Qualitative Dichte, kein exaktes Histogramm: diffuse äußere Treffer bei nicht verschwindenden Ausläufern sind kein belegter Fehler.'],
  ['c64820e1-c0ee-4342-9225-f981650f0c52', 1, 'ab0ebcc0f082ae7c8e789d765e99b16121522ffb517b8a7910d3750cbeae045c', 'Für Einzelspaltminima steht jetzt ausdrücklich m=±1,±2,… (m≠0). Der zentrale Doppelspalt-Maximumsfall m=0 bleibt korrekt erhalten.'],
].map(([goalId, candidateNumber, digest, rationaleDe]) => ({ goalId, candidateNumber, digest: 'sha256:' + digest, rationaleDe }))
const deferredId = 'a7255b83-336c-4d42-ba5c-bc2f6248ea36'
const ids = [...choices.map(x => x.goalId), deferredId]
const selectedIds = new Set(choices.map(x => x.goalId))
const paths = id => {
  const url = `/assets/goal-visualizations/physik/${id}/${id}.jpg`
  return [base + `visualizations/physik/${id}/${id}.jpg`, 'app/public' + url, 'backend/src/main/resources/static' + url]
}
const protectedCanonical = c => {
  const copy = structuredClone(c)
  for (const id of ids) delete one(copy.goals, 'id', id).resourceLinks
  return sha(encode(copy))
}
const protectedQa = q => sha(encode({ ...q, records: q.records.filter(x => !ids.includes(x.goalId)) }))
const protectHuman = q => {
  for (const key of ['humanApproved', 'humanIssueIdentified']) assert.equal(q[key], 'no')
  assert.equal(q.humanIssueDescription, ''); assert.equal(q.humanReviewedAt, null); assert.equal(q.humanReviewer, '')
}
const candidates = choices.map(choice => {
  const receipt = json(archive + `${choice.goalId}/candidate-${choice.candidateNumber}/archive-receipt.json`)
  assert.equal(receipt.goalId, choice.goalId); assert.equal(receipt.candidateNumber, choice.candidateNumber)
  for (const f of [...receipt.originalFiles, ...receipt.candidateFiles]) { assert.equal(read(f.path).length, f.bytes); assert.equal(sha(read(f.path)), f.sha256, f.path) }
  const exact = suffix => { const f = receipt.candidateFiles.filter(x => x.path.endsWith(suffix)); assert.equal(f.length, 1); return f[0].path }
  const candidatePath = exact('.jpg')
  assert.equal(sha(read(candidatePath)), choice.digest)
  return { ...choice, provider: receipt.provider, candidatePath, promptPath: exact('/nano-banana-prompt.de.md'), reconstructionPromptPath: exact('.image-reconstruction-prompt.de.md'), originalPath: archive + `${choice.goalId}/original/${choice.goalId}.jpg` }
})
const addPatch = (p, obj) => `*** Add File: ${p}\n` + encode(obj).trimEnd().split('\n').map(l => '+' + l).join('\n') + '\n'
const emit = content => process.stdout.write('*** Begin Patch\n' + content + '*** End Patch\n')
const replacements = (p, old, beforeRows, nextRows, key) => {
  let patch = ''
  for (let i = 0; i < beforeRows.length; i++) {
    if (JSON.stringify(beforeRows[i]) === JSON.stringify(nextRows[i])) continue
    assert.ok(ids.includes(beforeRows[i][key]), 'Unexpected record mutation')
    const serial = row => JSON.stringify(row, null, 2).split('\n').map(l => '    ' + l).join('\n') + (i < beforeRows.length - 1 ? ',' : '')
    const before = serial(beforeRows[i]), after = serial(nextRows[i])
    assert.equal(old.split(before).length, 2)
    patch += '@@\n' + before.split('\n').map(l => '-' + l).join('\n') + '\n' + after.split('\n').map(l => '+' + l).join('\n') + '\n'
  }
  return patch ? `*** Update File: ${p}\n${patch}` : ''
}
const mode = process.argv[2]
if (mode === 'prepare-patch') {
  assert.equal(fs.existsSync(preparedPath), false); assert.equal(fs.existsSync(receiptPath), false)
  const c = json(canonicalPath), q = json(qaPath)
  const snapshots = ids.map(id => {
    const goal = one(c.goals, 'id', id), qa = one(q.records, 'goalId', id), link = primary(goal)
    protectHuman(qa); assert.equal(link.type, 'goal-visualization'); assert.equal(link.lang, 'de')
    const originalPath = archive + `${id}/original/${id}.jpg`, digest = sha(read(originalPath))
    assert.equal(qa.assetSha256, digest)
    const files = paths(id).map(p => { assert.equal(sha(read(p)), digest, p); return { path: p, sha256: digest, bytes: read(p).length } })
    return { goalId: id, goal, qa, originalPath, files }
  })
  emit(addPatch(preparedPath, { schemaVersion: 1, preparedAt: new Date().toISOString(), canonicalPath, qaPath, canonicalSha256: sha(read(canonicalPath)), qaSha256: sha(read(qaPath)), protectedCanonicalSha256: protectedCanonical(c), protectedQaSha256: protectedQa(q), qaOrder: q.records.map(x => x.goalId), snapshots, authority: 'root-authorized six-goal AI image adoption only', humanApprovalClaimed: false }))
} else if (mode === 'import') {
  const state = json(preparedPath)
  assert.equal(fs.existsSync(receiptPath), false)
  assert.equal(sha(read(canonicalPath)), state.canonicalSha256); assert.equal(sha(read(qaPath)), state.qaSha256)
  for (const candidate of candidates) {
    const old = one(state.snapshots, 'goalId', candidate.goalId), link = primary(old.goal)
    for (const f of old.files) assert.equal(sha(read(f.path)), f.sha256)
    const args = ['scripts/import_goal_visualization.mjs', candidate.goalId, candidate.candidatePath, '--landscape', canonicalPath, '--subject', 'physik', '--provider', candidate.provider, '--review-status', link.reviewStatus, '--license', link.license, '--description', link.description, '--alt-text', link.altText, '--prompt', candidate.promptPath, '--reconstruction-prompt', candidate.reconstructionPromptPath]
    execFileSync(process.execPath, args, { stdio: 'inherit' })
    for (const p of paths(candidate.goalId)) assert.equal(sha(read(p)), candidate.digest)
    const current = one(json(canonicalPath).goals, 'id', candidate.goalId)
    assert.deepEqual({ ...primary(current), provider: link.provider }, link, 'Native importer changed metadata other than provider')
    assert.equal(protectedCanonical(json(canonicalPath)), state.protectedCanonicalSha256)
  }
  assert.equal(sha(read(qaPath)), state.qaSha256)
  process.stdout.write('PASS five native imports; QA unchanged; all source/public/backend hashes verified.\n')
} else if (mode === 'adoption-patch') {
  const state = json(preparedPath)
  assert.equal(fs.existsSync(receiptPath), false)
  const c = json(canonicalPath), q = json(qaPath), beforeC = structuredClone(c), beforeQ = structuredClone(q)
  assert.equal(protectedCanonical(c), state.protectedCanonicalSha256); assert.equal(sha(read(qaPath)), state.qaSha256)
  const now = new Date().toISOString()
  for (const choice of candidates) {
    const goal = one(c.goals, 'id', choice.goalId), row = one(q.records, 'goalId', choice.goalId)
    protectHuman(row)
    for (const p of paths(choice.goalId)) assert.equal(sha(read(p)), choice.digest)
    assert.equal(primary(goal).provider, choice.provider)
    Object.assign(row, { title: normalize(goal.title), description: normalize(goal.description), visualizationState: 'available', missingReason: '', assetSha256: choice.digest, umlautsCorrectChatGpt: 'no', contentApprovedChatGpt: 'no', chatGptReviewedAt: null, chatGptReviewer: '', chatGptNotes: '', aiApproved: 'yes', aiApprovedAssetSha256: choice.digest, aiReviewedAt: now, aiReviewer: 'codex-parent-and-physics-b038-image-audit', aiNotes: choice.rationaleDe + ' Root und physics_b038_image_audit haben genau diesen archivierten Kandidaten tatsächlich visuell geprüft. Hashgebundene AI-Annahme; der Zeitstempel bezeichnet den QA-Eintrag. Keine menschliche Einzelabnahme oder Quellenfreigabe.' })
  }
  const deferredGoal = one(c.goals, 'id', deferredId), deferredQa = one(q.records, 'goalId', deferredId)
  const oldDeferred = one(state.snapshots, 'goalId', deferredId)
  assert.deepEqual(deferredGoal, oldDeferred.goal); protectHuman(deferredQa)
  for (const f of oldDeferred.files) assert.equal(sha(read(f.path)), f.sha256)
  deferredGoal.resourceLinks = deferredGoal.resourceLinks.filter(x => !(x.type === 'goal-visualization' && x.role === 'primary' && x.lang === 'de'))
  assert.equal(deferredGoal.resourceLinks.length, oldDeferred.goal.resourceLinks.length - 1)
  Object.assign(deferredQa, { title: normalize(deferredGoal.title), description: normalize(deferredGoal.description), visualizationState: 'missing', missingReason: 'deferred_provider_limitation', imageUrl: '', publicAssetPath: '', canonicalAssetPath: '', assetSha256: '', umlautsCorrectChatGpt: 'no', contentApprovedChatGpt: 'no', chatGptReviewedAt: null, chatGptReviewer: '', chatGptNotes: '' })
  for (const key of ['aiApproved', 'aiApprovedAssetSha256', 'aiReviewedAt', 'aiReviewer', 'aiNotes']) delete deferredQa[key]
  assert.equal(protectedCanonical(c), state.protectedCanonicalSha256); assert.equal(protectedQa(q), state.protectedQaSha256)
  assert.deepEqual(q.records.map(x => x.goalId), state.qaOrder)
  const changed = (before, after) => Object.fromEntries([...new Set([...Object.keys(before), ...Object.keys(after)])].filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k])).map(k => [k, { before: before[k] ?? null, after: after[k] ?? null }]))
  const receipt = { schemaVersion: 1, artifactType: 'physics-b038-image-qa-adoption-v1', recordedAt: now, authority: 'ai_candidate', humanApprovalClaimed: false, sourceApprovalGranted: false, approvalBasis: 'Actual independent complete-image inspections by Root and physics_b038_image_audit, documented in independent-candidate-1/2/3-review.md.', timestampSemantics: 'aiReviewedAt is the actual QA-entry timestamp, not a fabricated human inspection timestamp.', nativeImporter: { path: 'scripts/import_goal_visualization.mjs', sha256: sha(read('scripts/import_goal_visualization.mjs')) }, helper: { path: helperPath, sha256: sha(read(helperPath)) }, preImportState: { path: preparedPath, sha256: sha(read(preparedPath)) }, selectedImages: candidates.map(choice => ({ ...choice, license: primary(one(state.snapshots, 'goalId', choice.goalId).goal).license, assetPaths: paths(choice.goalId), changedQaFields: changed(one(beforeQ.records, 'goalId', choice.goalId), one(q.records, 'goalId', choice.goalId)) })), deferred: { goalId: deferredId, status: 'deferred_provider_limitation', attemptsRejected: [1, 2, 3], rationaleDe: 'Die blaue als E_C=E_0 cos²(ωt) bezeichnete Kurve beginnt trotz q(0)=Q_0 bei null; die grüne E_L=E_0 sin²(ωt) bei Maximum. Alle drei Nano-Versuche behielten diesen Widerspruch. Keine vierte Generierung und kein Ersatz durch SVG.', changedQaFields: changed(one(beforeQ.records, 'goalId', deferredId), deferredQa), removedLink: primary(oldDeferred.goal), retainedCanonicalSource: oldDeferred.files[0], recoveryOriginal: oldDeferred.originalPath, exactCopiesToRecoverablyMove: oldDeferred.files.slice(1).map((f, i) => ({ ...f, recoveryPath: archive + `${deferredId}/original/withdrawn-${i === 0 ? 'public' : 'backend'}.jpg` })) }, fileDigests: [{ path: canonicalPath, beforeSha256: state.canonicalSha256, afterSha256: sha(encode(c)) }, { path: qaPath, beforeSha256: state.qaSha256, afterSha256: sha(encode(q)) }], boundaries: ['Only five native image/prompt imports with provider metadata, six exact QA records, and one rejected primary link withdrawal.', 'Every previous license and human=no field is retained; obsolete old-byte ChatGPT triage is reset, never transferred. Deferred has no AI approval.', 'All other canonical fields, EN translations, goal IDs, edges, applicability, mappings, memory/atomicity records, QA order and other QA records are unchanged.', 'No registry, in-flight, global status/report/inventory, runtime, contract, deployment or human approval writes.'], recovery: 'The pre-import snapshot and immutable original/candidate archive bind exact before bytes. The final verify command emits actual after hashes and confirms recoverable removal; do not claim completion from this planned receipt alone.' }
  emit(replacements(canonicalPath, read(canonicalPath).toString(), beforeC.goals, c.goals, 'id') + replacements(qaPath, read(qaPath).toString(), beforeQ.records, q.records, 'goalId') + addPatch(receiptPath, receipt))
} else if (mode === 'withdraw-public-copies') {
  const receipt = json(receiptPath)
  const goal = one(json(canonicalPath).goals, 'id', deferredId)
  assert.equal(goal.resourceLinks.some(x => x.type === 'goal-visualization'), false)
  for (const f of receipt.deferred.exactCopiesToRecoverablyMove) {
    assert.equal(fs.existsSync(f.recoveryPath), false)
    assert.equal(sha(read(f.path)), f.sha256); assert.equal(sha(read(receipt.deferred.recoveryOriginal)), f.sha256)
  }
  for (const f of receipt.deferred.exactCopiesToRecoverablyMove) {
    fs.renameSync(f.path, f.recoveryPath)
    assert.equal(fs.existsSync(f.path), false); assert.equal(sha(read(f.recoveryPath)), f.sha256)
    process.stdout.write(`Recoverably withdrew ${f.path} -> ${f.recoveryPath}\n`)
  }
} else if (mode === 'verify') {
  const state = json(preparedPath), receipt = json(receiptPath), c = json(canonicalPath), q = json(qaPath)
  assert.equal(protectedCanonical(c), state.protectedCanonicalSha256); assert.equal(protectedQa(q), state.protectedQaSha256)
  assert.deepEqual(q.records.map(x => x.goalId), state.qaOrder)
  for (const f of receipt.fileDigests) assert.equal(sha(read(f.path)), f.afterSha256)
  for (const choice of candidates) {
    const row = one(q.records, 'goalId', choice.goalId), goal = one(c.goals, 'id', choice.goalId)
    protectHuman(row); assert.equal(row.aiApproved, 'yes'); assert.equal(row.aiApprovedAssetSha256, choice.digest); assert.equal(row.assetSha256, choice.digest)
    assert.equal(primary(goal).provider, choice.provider); assert.equal(primary(goal).license, primary(one(state.snapshots, 'goalId', choice.goalId).goal).license)
    for (const p of paths(choice.goalId)) assert.equal(sha(read(p)), choice.digest)
  }
  const row = one(q.records, 'goalId', deferredId), goal = one(c.goals, 'id', deferredId)
  protectHuman(row); assert.equal(row.visualizationState, 'missing'); assert.equal(row.missingReason, 'deferred_provider_limitation')
  assert.equal(row.aiApproved, undefined); assert.equal(row.assetSha256, ''); assert.equal(goal.resourceLinks.some(x => x.type === 'goal-visualization'), false)
  for (const f of receipt.deferred.exactCopiesToRecoverablyMove) { assert.equal(fs.existsSync(f.path), false); assert.equal(sha(read(f.recoveryPath)), f.sha256) }
  const canonicalSource = receipt.deferred.retainedCanonicalSource
  const canonicalRecoveryPath = archive + `${deferredId}/original/withdrawn-canonical.jpg`
  // Root subsequently approved relocation of the canonical JPG as well because
  // the unchanged asset gate rejects orphan JPGs in all three active roots.
  // Source/reconstruction prompts stay in place; exact source bytes stay archived.
  assert.equal(fs.existsSync(canonicalSource.path), false)
  assert.equal(sha(read(canonicalRecoveryPath)), canonicalSource.sha256)
  process.stdout.write(encode({ status: 'PASS', fiveImportedHashTriples: candidates.map(x => ({ goalId: x.goalId, sha256: x.digest })), sixQaRecordsOnly: true, humanApprovalClaimed: false, allOtherCanonicalFieldsIncludingEnPreserved: true, deferredMissingWithNoApproval: deferredId, publicCopiesRecoverablyRemoved: receipt.deferred.exactCopiesToRecoverablyMove, canonicalAndQaAfterDigests: receipt.fileDigests.map(({ beforeSha256, ...f }) => f) }))
} else throw new Error('Use prepare-patch, import, adoption-patch, withdraw-public-copies, or verify')
