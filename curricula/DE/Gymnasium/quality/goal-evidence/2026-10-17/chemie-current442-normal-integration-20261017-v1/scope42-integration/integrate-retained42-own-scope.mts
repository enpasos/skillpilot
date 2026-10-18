import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'

// Finite, guarded integration adapter. Default mode prepares a plan only.
const root = process.cwd()
const n = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17'
const o = `${n}/chemie-current442-normal-integration-20261017-v1`
const authorDir = `${n}/chemie-current442-retained-target42-explicit-own-acquisition-scope-author-20261017-v1`
const ownReviewDir = `${n}/chemie-current442-retained-target42-own-scope-informed-independent-a-20261018-v1`
const outputDir = `${o}/scope42-integration`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const semanticPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json'
const centralPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const authorPath = `${authorDir}/AUTHOR.retained42-explicit-own-acquisition-scope.json`
const ownFirstPath = `${ownReviewDir}/FIRST.informed-own-acquisition-scope42-112.independent-a.json`
const ownSealPath = `${ownReviewDir}/SEAL.FIRST.informed-own-scope42-112.json`
const expected = {
  canonical: '04f20db82543e81c8a5ef5e4e0cc3856f3004ceef6697a1c2078bf72aa5bb15a',
  semantic: '0e460d84905a4781dd300b05f653a999f11f258526637a5f205170137dc27272',
  registry: '894a58e4d65146d40951fe48bd2c7698973dbc184174f521da5732abddd03ee9',
  author: 'be8e06f628063a98f439b1d781fb30ff502d112d07a6c1ce0ffa4a29cee5c773',
  ownFirst: 'e851069f670662e25d0e6597c2f255331e9d4fc8995fd966549f4b3d1eb51a6d',
  ownSeal: 'e3725c52b7d2c00e6675d42fb0d4cd78d3cdd8b2ac7cae6e8163835b88cc34e1',
}
const bytes = (path: string): Buffer => readFileSync(resolve(root, path))
const sha = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const pin = (path: string) => ({ path, sha256: sha(bytes(path)), bytes: bytes(path).length })
const read = (path: string): any => JSON.parse(bytes(path).toString('utf8'))
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const assertPin = (entry: { path: string; sha256: string; bytes?: number }) => {
  assert.equal(sha(bytes(entry.path)), entry.sha256, `Changed input: ${entry.path}`)
  if (entry.bytes !== undefined) assert.equal(bytes(entry.path).length, entry.bytes)
}
const args = process.argv.slice(2)
const execute = args.includes('--execute')
const value = (name: string): string => {
  const i = args.indexOf(name)
  assert(i >= 0 && args[i + 1] && !args[i + 1].startsWith('--'), `Required: ${name} VALUE`)
  return args[i + 1]
}
const centralBefore = pin(centralPath)
for (const [path, hash] of [[canonicalPath, expected.canonical], [semanticPath, expected.semantic],
  [registryPath, expected.registry], [authorPath, expected.author], [ownFirstPath, expected.ownFirst],
  [ownSealPath, expected.ownSeal]]) assertPin({ path, sha256: hash })

const author = read(authorPath)
for (const p of [...author.inputs, ...author.unchangedViewInputs, author.canonicalCandidate,
  author.registryCandidate, author.wholeScopeRows]) assertPin(p)
const before = read(canonicalPath)
const candidate = read(author.canonicalCandidate.path)
const rows = read(author.wholeScopeRows.path).rows
const currentSEM = read(semanticPath)
const sem = structuredClone(currentSEM)
const beforeById = new Map<string, any>(before.goals.map((g: any) => [g.id, g]))
const afterById = new Map<string, any>(candidate.goals.map((g: any) => [g.id, g]))
assert.equal(beforeById.size, 654)
assert.equal(afterById.size, 654)
assert.equal(rows.length, 42)
assert.deepEqual(before.goals.map((g: any) => g.id), candidate.goals.map((g: any) => g.id))
assert.deepEqual({ ...before, goals: null }, { ...candidate, goals: null })
const changedIds = new Set<string>()
const expectedTuples = new Set<string>()
let annotationCount = 0
for (const r of rows) {
  assert(!changedIds.has(r.goalId))
  changedIds.add(r.goalId)
  assert.deepEqual(r.wholeGoalBefore, beforeById.get(r.goalId))
  assert.deepEqual(r.wholeGoalAfter, afterById.get(r.goalId))
  const oldExtensions = r.wholeGoalBefore.extendedData?.skillPilotAcquisitionExtensions ?? []
  const newExtensions = r.wholeGoalAfter.extendedData.skillPilotAcquisitionExtensions
  assert.deepEqual(newExtensions.slice(0, oldExtensions.length), oldExtensions)
  assert.deepEqual(newExtensions.slice(oldExtensions.length), r.jurisdictionDecisions.map((d: any) => d.proposedExtension))
  const stripped = structuredClone(r.wholeGoalAfter)
  if (oldExtensions.length) stripped.extendedData.skillPilotAcquisitionExtensions = oldExtensions
  else delete stripped.extendedData.skillPilotAcquisitionExtensions
  if (!r.wholeGoalBefore.extendedData) delete stripped.extendedData
  assert.deepEqual(stripped, r.wholeGoalBefore, 'Only own acquisition annotations may change')
  assert.equal(JSON.stringify(stripped), JSON.stringify(r.wholeGoalBefore))
  for (const d of r.jurisdictionDecisions) {
    const e = d.proposedExtension
    const key = `${r.goalId}|${e.jurisdiction}`
    assert(!expectedTuples.has(key))
    expectedTuples.add(key)
    annotationCount++
    assert.equal(e.officialWholeSourceCredit, false)
    assert.equal(e.officialRequirementClaim, false)
    assert.equal(e.actualLearnerTopicSelectionClaim, false)
  }
}
assert.equal(annotationCount, 112)
for (const [id, goal] of beforeById) {
  if (!changedIds.has(id)) {
    assert.deepEqual(afterById.get(id), goal)
    assert.equal(JSON.stringify(afterById.get(id)), JSON.stringify(goal))
  }
}

const registryBefore = read(registryPath)
const registryAfter = read(author.registryCandidate.path)
assert.deepEqual(registryAfter.landscapes.slice(0, registryBefore.landscapes.length), registryBefore.landscapes)
assert.equal(registryAfter.landscapes.length, registryBefore.landscapes.length + 1)
assert.equal(registryAfter.version, registryBefore.version)
for (const landscape of registryBefore.landscapes) {
  const exactJSONSpan = JSON.stringify(landscape, null, 2).split('\n').map(line => `    ${line}`).join('\n')
  assert(bytes(registryPath).toString('utf8').includes(exactJSONSpan))
  assert(bytes(author.registryCandidate.path).toString('utf8').includes(exactJSONSpan),
    'Retain exact original other-landscape object bytes, including its five overrides')
}
const chemistryOverrides = registryAfter.landscapes.at(-1)
assert.equal(chemistryOverrides.landscapeId, before.landscapeId)
const registryTuples = new Set<string>()
for (const [id, overrides] of Object.entries<any>(chemistryOverrides.goalApplicabilityOverrides)) {
  assert.deepEqual(Object.keys(overrides), ['jurisdiction'])
  assert.deepEqual(overrides.jurisdiction, [...new Set(overrides.jurisdiction)].sort())
  for (const jurisdiction of overrides.jurisdiction) registryTuples.add(`${id}|${jurisdiction}`)
}
assert.deepEqual([...registryTuples].sort(), [...expectedTuples].sort())

// Use the unmodified, pinned stock semantic fingerprint implementation.
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
assert.equal(sem.sourceLandscapePath, canonicalPath)
assert.equal(sem.sourceLandscapeId, before.landscapeId)
assert.equal(sem.decisions.length, 654)
const fingerprintDeltas: any[] = []
const seenDecisionIds = new Set<string>()
for (const d of sem.decisions) {
  assert(!seenDecisionIds.has(d.goalId))
  seenDecisionIds.add(d.goalId)
  const oldGoal = beforeById.get(d.goalId)
  const newGoal = afterById.get(d.goalId)
  assert(oldGoal && newGoal)
  assert.equal(d.sourceFingerprint, fingerprintSemanticKindSourceGoal(oldGoal), `Preexisting stale SEM: ${d.goalId}`)
  const nextFingerprint = fingerprintSemanticKindSourceGoal(newGoal)
  if (d.sourceFingerprint !== nextFingerprint) {
    assert(changedIds.has(d.goalId))
    fingerprintDeltas.push({ goalId: d.goalId, semanticKind: d.semanticKind,
      sourceFingerprintBefore: d.sourceFingerprint, sourceFingerprintAfter: nextFingerprint,
      onlySourceFieldDelta: '/extendedData/skillPilotAcquisitionExtensions',
      classificationDecisionUnchanged: true, scientificScopeBasis: 'Exact paired own-acquisition scope judgments; no new classification decision.' })
    d.sourceFingerprint = nextFingerprint
  }
}
assert.equal(fingerprintDeltas.length, 42)
assert.deepEqual(sem.decisions.map((d: any) => ({ ...d, sourceFingerprint: null })),
  currentSEM.decisions.map((d: any) => ({ ...d, sourceFingerprint: null })))
assert.deepEqual({ ...sem, decisions: null }, { ...currentSEM, decisions: null })
const kinds = Object.fromEntries(Object.keys(sem.counts).filter(k => k !== 'total').map(k => [k, 0])) as Record<string, number>
for (const d of sem.decisions) kinds[d.semanticKind]++
assert.deepEqual({ ...kinds, total: sem.decisions.length }, sem.counts)
assert.equal(sem.counts.curricularAtomic, 442)
assert.equal(sem.counts.memory, 68)
const requireApp = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = requireApp('ajv/dist/2020.js').default
const addFormats = requireApp('ajv-formats').default
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(read('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'))
assert(validate(sem), ajv.errorsText(validate.errors))

const outputs = [
  { path: canonicalPath, buffer: bytes(author.canonicalCandidate.path), oldSha: expected.canonical },
  { path: semanticPath, buffer: jsonBytes(sem), oldSha: expected.semantic },
  { path: registryPath, buffer: bytes(author.registryCandidate.path), oldSha: expected.registry },
].map(x => ({ ...x, newSha: sha(x.buffer), historyPath: `${o}/history/${x.path}.before-retained42-own-scope-20261018.snapshot` }))
const plan = {
  artifactType: 'Finite three-file Chemistry own-scope integration plan using unmodified stock SEM fingerprints',
  createdAtUTC: new Date().toISOString(), mode: execute ? 'execute' : 'preview-only',
  author: pin(authorPath), ownInformedFirst: pin(ownFirstPath), ownSeal: pin(ownSealPath),
  stockFingerprintImplementation: pin('app/scripts/goalBookModel.ts'),
  stockFingerprintNormalizationProfile: pin('contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json'),
  priorSingleMemoryEnumSyntaxCorrection: pin(`${o}/SEM654.memory68-decisionBasis-schema-correction.actual.json`),
  centralRoutingMustRemainExact: centralBefore,
  files: outputs.map(({ path, oldSha, newSha, historyPath, buffer }) => ({ path, oldSha256: oldSha, newSha256: newSha, bytes: buffer.length, historyPath })),
  counts: { canonical: 654, curricularAtomic: 442, memory: 68, changedWholeGoalMetadata: 42,
    addedOwnScopeAnnotations: 112, addedChemistryRegistryTuples: 112, stockSEMSourceFingerprintChanges: 42,
    unchangedWholeGoals: 612, existingOtherRegistryGoalObjectsPreserved: 5 },
  fingerprintDeltas, semanticSchemaPassed: true, all654BeforeFingerprintsCurrent: true,
  classificationsAndDecisionBasesUnchanged: true, sourceLandscapePathUnchangedAndNormal: true,
  existingOtherLandscapeObjectJSONSpanByteExact: true,
  noNewScientificClassificationDOrPApproval: true, compilerRerun: false, applicabilityApplied: false,
  normalFilesChanged: false, M7Claim: false, HumanApproval: false,
  executionRequires: 'Explicit root GO for the completed peer FIRST hash, then --execute --peer-first PATH --peer-first-sha SHA --peer-seal PATH --peer-seal-sha SHA --root-confirmed-peer-accept',
}
mkdirSync(resolve(root, outputDir), { recursive: true })
if (!execute) {
  const path = `${outputDir}/PLAN.scope42-stock-fingerprints.preview.json`
  writeFileSync(resolve(root, path), jsonBytes(plan))
  console.log(JSON.stringify({ mode: 'preview-only', plan: pin(path), counts: plan.counts, normalFilesChanged: false }))
} else {
  const receiptPath = `${outputDir}/RECEIPT.scope42-three-normal-files.actual-installed.json`
  assert(!existsSync(resolve(root, receiptPath)), 'Do not overwrite an execution receipt')
  assert(args.includes('--root-confirmed-peer-accept'), 'Root must explicitly confirm actual sealed peer ACCEPT')
  const peer = { path: value('--peer-first'), sha256: value('--peer-first-sha') }
  const peerSeal = { path: value('--peer-seal'), sha256: value('--peer-seal-sha') }
  assert(/^[a-f0-9]{64}$/.test(peer.sha256) && /^[a-f0-9]{64}$/.test(peerSeal.sha256))
  assertPin(peer)
  assertPin(peerSeal)
  const peerRecord = read(peer.path)
  const peerSealRecord = read(peerSeal.path)
  assert(JSON.stringify(peerSealRecord).includes(peer.sha256), 'Peer seal must bind exact FIRST bytes')
  assert([expected.author, author.canonicalCandidate.sha256, author.wholeScopeRows.sha256]
    .some(s => JSON.stringify(peerRecord).includes(s)), 'Peer FIRST must bind this exact author proposal')
  for (const x of outputs) assertPin({ path: x.path, sha256: x.oldSha })
  assertPin(centralBefore)
  // Back up every original before replacing any normal file. Never overwrite history.
  for (const x of outputs) {
    const path = resolve(root, x.historyPath)
    mkdirSync(dirname(path), { recursive: true })
    if (existsSync(path)) assertPin({ path: x.historyPath, sha256: x.oldSha })
    else writeFileSync(path, bytes(x.path), { flag: 'wx' })
    assertPin({ path: x.historyPath, sha256: x.oldSha })
  }
  const staged = outputs.map(x => ({ ...x, temporary: `${x.path}.scope42-${process.pid}.pending` }))
  for (const x of staged) {
    writeFileSync(resolve(root, x.temporary), x.buffer, { flag: 'wx' })
    chmodSync(resolve(root, x.temporary), statSync(resolve(root, x.path)).mode)
    assertPin({ path: x.temporary, sha256: x.newSha })
  }
  for (const x of staged) {
    assertPin({ path: x.path, sha256: x.oldSha })
    renameSync(resolve(root, x.temporary), resolve(root, x.path))
    assertPin({ path: x.path, sha256: x.newSha })
  }
  assertPin(centralBefore)
  const receipt = { ...plan, scientificPeerFirst: pin(peer.path), scientificPeerSeal: pin(peerSeal.path),
    rootConfirmedPeerAcceptance: true, normalFilesChanged: true,
    historicalOriginals: outputs.map(x => pin(x.historyPath)),
    actualInstalled: outputs.map(x => pin(x.path)),
    scopeScienceApprovalsReused: 'Own e851069f FIRST plus exact root-confirmed sealed peer FIRST; no new science from this adapter.' }
  writeFileSync(resolve(root, receiptPath), jsonBytes(receipt), { flag: 'wx' })
  console.log(JSON.stringify({ mode: 'executed', receipt: pin(receiptPath), actualInstalled: receipt.actualInstalled,
    applicabilityApplied: false, M7Claim: false }))
}
