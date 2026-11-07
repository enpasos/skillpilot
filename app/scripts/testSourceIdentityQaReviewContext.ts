// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { gunzipSync } from 'node:zlib'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  collectMemoryDeckEvidence, collectMemoryVisibilityReport, evaluateMemoryCardReview,
  evaluateSemanticAtomicity, fingerprintGoal, validateMemoryCardRecordShape, validateMemoryCardReviewCardRecordShape,
} from './generateCurriculumQualityStatus'
import { candidateIdForQaReference, candidateQaReviewRows, createSourceIdentityQaReviewSlice,
  originalDefinitionForQaFingerprint, type SourceIdentityQaReviewSliceInput } from './lib/sourceIdentityQaReviewContext'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const base = 'db9c71155997842ebb7cf48dda413ff6196f1a9f'
const accepted = 'a145fe393296cd8d6fa703e9661ddc84c1a09fd364e2a6ef199df44c9ff2ea3a'
const archive = 'qa-artifacts/ci-contract-audit/2026-11-06/source-bijection-db9c711559-2026-11-06.proposal.json.gz'
const raw = gunzipSync(readFileSync(resolve(root, archive)))
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
assert.equal(digest(raw), accepted)
const manifest = JSON.parse(raw.toString('utf8')) as { rules: Array<{ landscapeId: string; sourceGoalId: string; targetGoalId: string }> }
const temporary = mkdtempSync('/dev/shm/skillpilot-source-a-am-tests-')
const controls: string[] = []
const summaries: Record<string, unknown>[] = []
const check = (name: string, run: () => void) => { run(); controls.push(name) }
const original = (path: string): Buffer => execFileSync('git', ['--no-replace-objects', '-C', root, 'show', `${base}:${path}`],
  { maxBuffer: 16 * 1024 * 1024, env: { ...process.env, GIT_NO_REPLACE_OBJECTS: '1', GIT_GRAFT_FILE: '/dev/null' } })
const json = <T>(bytes: Buffer): T => JSON.parse(bytes.toString('utf8')) as T
const manifestPath = resolve(temporary, 'source-a.json'); writeFileSync(manifestPath, raw)
// Fixture production is the real unchanged kernel, not a second ID replacer.
const project = (path: string, before: Buffer): Buffer => execFileSync('python3', ['-B', '-c', [
  'import copy,pathlib,sys', 'sys.path.insert(0,sys.argv[1])', 'import canonical_goal_identity_migration as k',
  'p=k.parse_json(pathlib.Path(sys.argv[2]).read_bytes())', 'before=k.parse_json(sys.stdin.buffer.read())',
  'matches=[d for d in p["documents"] if d["path"]==sys.argv[3]]',
  'd=matches[0] if matches else None', 'after=copy.deepcopy(before)',
  'if d is not None and d["handling"]=="explicit-pointer-projection":',
  ' for f in d["fields"]: k.set_field(after,f)',
  ' k.require(k.digest(k.stable(after))==d["hypotheticalCanonicalSha256"],"fixture projection digest differs")',
  ' k.inverse_proof(before,after,d["fields"])', 'sys.stdout.buffer.write(k.stable(after))',
].join('\n'), resolve(root, 'scripts'), manifestPath, path], { input: before, maxBuffer: 16 * 1024 * 1024 })

try {
  for (const family of ['politics-economics', 'economics'] as const) {
    const stem = `canonical-${family}-full`
    const configPath = family === 'economics'
      ? json<{ subjects: Array<{ subject: string; memoryReviewConfigPath: string }> }>(original(
        'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'))
        .subjects.find(subject => subject.subject === 'wirtschaftswissenschaften')!.memoryReviewConfigPath
      : `curricula/DE/Gymnasium/quality/memory-card-review/${stem}.config.json`
    const config = json<Parameters<typeof evaluateMemoryCardReview>[1][number]>(original(configPath))
    const sourcePath = (config as unknown as { landscapePath: string }).landscapePath
    const owner = config.landscapeId, before = original(sourcePath), after = project(sourcePath, before)
    const initial = json<SkillLandscape>(before), candidate = json<SkillLandscape>(after)
    const goalEvidencePath = config.reviewPath
    const goalEvidence = original(goalEvidencePath)
    const evidence: SourceIdentityQaReviewSliceInput['evidence'][number][] = [
      { path: goalEvidencePath, kind: 'memory-goal', bytes: goalEvidence },
    ]
    const aConfigPath = `curricula/DE/Gymnasium/quality/semantic-atomicity/${stem}.config.json`
    const aConfig = family === 'politics-economics'
      ? json<Parameters<typeof evaluateSemanticAtomicity>[1][number]>(original(aConfigPath)) : undefined
    if (aConfig) evidence.push({ path: aConfig.reviewPath, kind: 'atomicity', bytes: original(aConfig.reviewPath) })
    if (family === 'politics-economics') evidence.push({ path: config.cardReviewPath!, kind: 'memory-card', bytes: original(config.cardReviewPath!) })
    const input: SourceIdentityQaReviewSliceInput = { manifestBytes: raw, acceptedManifestSha256: accepted,
      expectedBaseCommit: base, owner, sourcePath, originalSourceBytes: before, candidateSourceBytes: after, evidence }
    const context = createSourceIdentityQaReviewSlice(input)
    const candidateMap = new Map(candidate.goals.map(goal => [goal.id, goal]))
    const originals = json<SkillLandscape>(before)
    const originalGoalRows = goalEvidence.toString('utf8').trim().split('\n').map(line => JSON.parse(line))
    const rows = candidateQaReviewRows(context, owner, goalEvidencePath, 'memory-goal')
    const goalRows = rows as unknown as Parameters<typeof collectMemoryVisibilityReport>[2]
    const nativeOriginalM = evaluateMemoryCardReview(initial, [config])
    check(`${family}: real original CQR302 criteria pass`, () => assert.equal(nativeOriginalM.status, 'pass', JSON.stringify(nativeOriginalM)))
    if (family === 'economics') check('Wirtschaft: actual stale historical predecessor remains invalid', () => {
      const predecessor = json<Parameters<typeof evaluateMemoryCardReview>[1][number]>(original(
        'curricula/DE/Gymnasium/quality/memory-card-review/canonical-economics-full.config.json'))
      const invalid = evaluateMemoryCardReview(initial, [predecessor])
      assert.equal(invalid.status, 'warn'); assert.equal(invalid.metrics?.stale, 300); assert.equal(invalid.metrics?.missing, 46)
    })
    const nativeUnadapted = evaluateMemoryCardReview(candidate, [config])
    check(`${family}: ordinary candidate evaluator still exposes missing transport`, () => assert.equal(nativeUnadapted.status, 'warn'))
    check(`${family}: every transported goal fingerprint uses the exact original definition`, () => {
      for (const row of rows) {
        const current = candidateMap.get(row.goalId!)!
        assert.ok(current)
        assert.equal(fingerprintGoal(originalDefinitionForQaFingerprint(context, owner, current), config.ruleVersion), row.fingerprint)
      }
    })
    check(`${family}: only typed goal/reference fields differ`, () => {
      rows.forEach((row, index) => {
        const old = originalGoalRows[index], actual = structuredClone(row)
        actual.goalId = old.goalId
        if (old.memoryGoalIds !== undefined) actual.memoryGoalIds = old.memoryGoalIds
        assert.deepEqual(actual, old)
      })
      assert.equal(digest(goalEvidence), digest(original(goalEvidencePath)))
    })
    const decks = collectMemoryDeckEvidence(candidate)
    check(`${family}: actual primary deck bytes are unchanged Git inputs`, () => {
      for (const source of new Set(decks.primaryCards.map(card => card.source))) {
        const relative = source.startsWith('/data/') ? `app/public${source}` : source.replace(/^\//u, '')
        assert.equal(digest(readFileSync(resolve(root, relative))), digest(original(relative)))
      }
    })
    check(`${family}: native record/deck criteria accept all transported rows`, () => {
      assert.deepEqual(decks.errors, [])
      for (const row of goalRows) assert.deepEqual(validateMemoryCardRecordShape(row, config, candidateMap, decks), [])
    })
    check(`${family}: native invalid original decision/empty reason remains rejected`, () => {
      const invalid = { ...goalRows[0], reason: '', status: 'needs_developer_review' as const, memoryUseful: true }
      assert.ok(validateMemoryCardRecordShape(invalid, config, candidateMap, decks).some(error => error.includes('reason is required')))
      assert.ok(validateMemoryCardRecordShape(invalid, config, candidateMap, decks).some(error => error.includes('memoryUseful null')))
    })
    // These are actual existing view bytes, projected with the exact kernel.
    // Only the test's path transport changes; native scope/filter functions run unchanged.
    const relocated = structuredClone(config)
    for (const [index, scope] of (relocated.visibilityScopes ?? []).entries()) {
      const bytes = project(scope.viewPath, original(scope.viewPath))
      const path = resolve(temporary, family, `view-${index}.json`)
      mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes)
      scope.viewPath = path
    }
    check(`${family}: native candidate view/scope checks keep real candidate IDs`, () => {
      const visibility = collectMemoryVisibilityReport(relocated, candidateMap, goalRows)
      assert.deepEqual(visibility.errors, [])
      assert.equal(visibility.missingVisibleMemoryGoals, 0)
      assert.ok(visibility.scopes > 0 && visibility.checkedMemoryRequiredGoals > 0)
    })
    if (aConfig) {
      const nativeA = evaluateSemanticAtomicity(initial, [aConfig])
      check('PoWi: complete real original CQR301 criteria pass', () => assert.equal(nativeA.status, 'pass'))
      check('PoWi: unchanged native candidate CQR301 remains red without adapter', () => {
        const result = evaluateSemanticAtomicity(candidate, [aConfig])
        assert.equal(result.status, 'warn'); assert.equal(result.metrics?.missing, 134); assert.equal(result.metrics?.obsolete, 134)
      })
      const aRows = candidateQaReviewRows(context, owner, aConfig.reviewPath, 'atomicity')
      check('PoWi: all 134 real A joins retain native fingerprints and original decisions', () => {
        let changed = 0
        const oldRows = evidence.find(entry => entry.kind === 'atomicity')!.bytes
        const originals = Buffer.from(oldRows).toString('utf8').trim().split('\n').map(line => JSON.parse(line))
        aRows.forEach((row, index) => {
          if (row.goalId !== originals[index].goalId) changed++
          assert.equal(row.status, originals[index].status)
          assert.equal(fingerprintGoal(originalDefinitionForQaFingerprint(context, owner, candidateMap.get(row.goalId!)!), aConfig.ruleVersion), row.fingerprint)
        })
        assert.equal(changed, 134)
      })
      const cards = candidateQaReviewRows(context, owner, config.cardReviewPath!, 'memory-card')
      check('PoWi: native card-origin criteria use transported IDs without card fingerprint changes', () => {
        const currentRecords = new Map(goalRows.map(row => [row.goalId, row]))
        const oldCards = Buffer.from(evidence.find(entry => entry.kind === 'memory-card')!.bytes).toString('utf8').trim().split('\n').map(line => JSON.parse(line))
        cards.forEach((row, index) => {
          assert.equal(row.fingerprint, oldCards[index].fingerprint)
          const restored = { ...row, originGoalIds: oldCards[index].originGoalIds }
          assert.deepEqual(restored, oldCards[index])
          assert.deepEqual(validateMemoryCardReviewCardRecordShape(row as unknown as Parameters<typeof validateMemoryCardReviewCardRecordShape>[0], config, candidateMap, currentRecords), [])
        })
      })
    }
    const changedRule = manifest.rules.find(rule => rule.landscapeId === owner && candidateMap.has(rule.targetGoalId))!
    const actual = candidateMap.get(changedRule.targetGoalId)!
    check(`${family}: original IDs map only within their owner and valid IDs stay identical`, () => {
      assert.equal(candidateIdForQaReference(context, owner, changedRule.sourceGoalId), changedRule.targetGoalId)
      assert.equal(candidateIdForQaReference(context, owner, `${owner}:${changedRule.sourceGoalId}`), `${owner}:${changedRule.targetGoalId}`)
      const unchanged = candidate.goals.find(goal => originals.goals.some(old => old.id === goal.id))!
      assert.equal(candidateIdForQaReference(context, owner, unchanged.id), unchanged.id)
      assert.throws(() => candidateIdForQaReference(context, owner, 'missing-original-key'), /no definition/u)
    })
    check(`${family}: exact foreign/uppercase owner is rejected`, () => {
      assert.throws(() => originalDefinitionForQaFingerprint(context, 'foreign-owner', actual), /Exact owner/u)
      assert.throws(() => candidateIdForQaReference(context, owner.toUpperCase(), changedRule.sourceGoalId), /Exact owner/u)
      assert.throws(() => candidateIdForQaReference(context, owner, `foreign:${changedRule.sourceGoalId}`), /Foreign/u)
    })
    check(`${family}: semantic mutation cannot use an original fingerprint`, () => {
      assert.throws(() => originalDefinitionForQaFingerprint(context, owner, { ...actual, description: `${actual.description} changed` }), /candidate definition differs/u)
    })
    check(`${family}: immutable result/caller-buffer isolation`, () => {
      const result = originalDefinitionForQaFingerprint(context, owner, actual)
      assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(rows)); assert.ok(Object.isFrozen(rows[0]))
      assert.throws(() => { rows[0].reason = 'changed' }, TypeError)
      assert.equal(originalDefinitionForQaFingerprint(context, owner, actual).description, result.description)
      const firstEvidenceByte = evidence[0].bytes[0], firstSourceByte = before[0]
      try {
        evidence[0].bytes[0] ^= 1; before[0] ^= 1
        assert.deepEqual(candidateQaReviewRows(context, owner, goalEvidencePath, 'memory-goal'), rows)
        assert.equal(originalDefinitionForQaFingerprint(context, owner, actual).description, result.description)
      } finally { evidence[0].bytes[0] = firstEvidenceByte; before[0] = firstSourceByte }
    })
    check(`${family}: forged capability and unbound evidence reject`, () => {
      assert.throws(() => originalDefinitionForQaFingerprint({ ...context }, owner, actual), /factory-minted/u)
      assert.throws(() => candidateQaReviewRows(context, owner, 'unbound.review.jsonl', 'memory-goal'), /Unbound/u)
    })
    check(`${family}: original/candidate source mutations reject before any join`, () => {
      const invalidOriginal = Buffer.from(JSON.stringify({ ...initial, title: 'changed' }))
      assert.throws(() => createSourceIdentityQaReviewSlice({ ...input, originalSourceBytes: invalidOriginal }), /Original canonical source differs/u)
      const invalidCandidate = structuredClone(candidate); invalidCandidate.goals[0].description += ' changed'
      assert.throws(() => createSourceIdentityQaReviewSlice({ ...input, candidateSourceBytes: Buffer.from(JSON.stringify(invalidCandidate)) }), /exact kernel identity projection/u)
    })
    check(`${family}: modified original review bytes cannot be qualified`, () => {
      assert.throws(() => createSourceIdentityQaReviewSlice({ ...input, evidence: [{ ...evidence[0], bytes: Buffer.from(goalEvidence.toString().replace('"reason":', '"changedReason":')) }] }), /Original review evidence differs/u)
    })
    summaries.push({ family, owner, originalSourceSha256: digest(before), candidateSourceSha256: digest(after),
      originalNativeMemoryStatus: nativeOriginalM.status, unadaptedCandidateMemoryStatus: nativeUnadapted.status,
      transportedGoalRows: rows.length, originalGoalCount: originals.goals.length,
      candidateGoalCount: candidate.goals.length, candidateViewCount: relocated.visibilityScopes?.length ?? 0,
      storedEvidenceBytesChanged: false })
  }
  console.log(JSON.stringify({ status: 'bounded-mechanics-pass', sourceBase: base, manifestRawSha256: accepted,
    controls: controls.length, cases: controls, summaries, completeProducerIntegration: false,
    completeSourceInventoryRecomputed: false, producerReadScopeAuthenticated: false,
    candidateQaApproved: false, runtimeActivationAllowed: false }, null, 2))
} finally { rmSync(temporary, { recursive: true, force: true }) }
