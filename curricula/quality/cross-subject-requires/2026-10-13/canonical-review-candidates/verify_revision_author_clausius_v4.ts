// SPDX-License-Identifier: Apache-2.0
// Profile-only structural verification. Never materialize a native review row.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import {
  buildRequiresInventory, assertFreshRequiresInventory, fingerprint,
  bytesFingerprint, stableJson,
} from '../../app/scripts/lib/crossSubjectRequiresInventory'
import { validateRequiresDecisions } from '../../app/scripts/lib/crossSubjectRequiresReview'

const root = resolve(process.cwd(), '..')
const prefix = 'tmp/cross-subject-requires/physics-clausius-revision-author-20261013-v4'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const sha = (path: string) => bytesFingerprint(readFileSync(resolve(root, path)))
const pythonJson = (value: any): string => Array.isArray(value)
  ? `[${value.map(pythonJson).join(',')}]`
  : value && typeof value === 'object'
    ? `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${pythonJson(value[k])}`).join(',')}}`
    : JSON.stringify(value)
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv = require('ajv/dist/2020').default
const formats = require('ajv-formats').default
const ajv = new Ajv({ strict: false, allErrors: true })
formats(ajv)
const schemaPath = 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
const schema = read(schemaPath)
const validateProfile = ajv.compile({ $schema: schema.$schema, $defs: schema.$defs, $ref: '#/$defs/profile' })
const packet = read(prefix + '.proposal-candidate.json')
const author = read(prefix + '.author-decisions.json')
const amendments = read(prefix + '.profile-amendments.candidate.json')
const context = read(prefix + '.context.exact.json')
const physicsPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const mathPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const physics = new Map(read(physicsPath).goals.map((g: any) => [g.id, g]))
const math = new Map(read(mathPath).goals.map((g: any) => [g.id, g]))
const failures: string[] = []
const checks: any[] = []
const frozenChanges: any[] = []
for (const input of context.frozenInputs) if (sha(input.path) !== input.sha256) {
  frozenChanges.push({ path: input.path, expected: input.sha256, actual: sha(input.path) })
  failures.push(`Frozen input changed ${input.path}`)
}
if (packet.sourceAuthorSha256 !== sha(prefix + '.author-decisions.json')) failures.push('Author artifact binding mismatch')
if (author.sourceContextFileSha256 !== sha(prefix + '.context.exact.json')) failures.push('Author context binding mismatch')
if (amendments.sourceContextFileSha256 !== author.sourceContextFileSha256) failures.push('Amendment context binding mismatch')
if (packet.decisions.length !== 1 || amendments.amendments.length !== 1 || context.records.length !== 1) failures.push('Wrong goal count')
for (const decision of packet.decisions) {
  const gid = decision.dependentGoalId
  const input = context.records.find((r: any) => r.goalId === gid)
  const amendment = amendments.amendments.find((a: any) => a.goalId === gid)
  const errors: string[] = []
  const current: any = physics.get(gid)
  const old = input.actualNativePRecord.profile
  const profile = amendment.proposedProfile
  if (fingerprint(current) !== input.currentCanonicalGoalSha256) errors.push('Current canonical goal changed')
  if (sha(input.actualNativePReviewPath) !== input.actualNativePReviewFileSha256) errors.push('Current native P bytes changed')
  const currentNative = readFileSync(resolve(root, input.actualNativePReviewPath), 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)).find(r => r.goalId === gid)
  if (!currentNative || pythonJson(currentNative) !== pythonJson(input.actualNativePRecord)) errors.push('Current native full row differs from captured original')
  if (bytesFingerprint(pythonJson(input.actualNativePRecord)) !== input.actualNativePRecordSha256) errors.push('Original row digest mismatch')
  if (fingerprint(old) !== input.actualNativePBodySha256) errors.push('Original P body digest mismatch')
  if (fingerprint(profile) !== amendment.proposedProfileBodySha256 || fingerprint(profile) !== decision.profileAmendmentProposedBodySha256) errors.push('Proposed P body digest mismatch')
  if (pythonJson(amendment.oldProfileFullDeEn) !== pythonJson(old)) errors.push('Old bilingual body missing or altered')
  if (!validateProfile(profile)) errors.push(...validateProfile.errors.map((e: any) => `Profile schema ${e.instancePath}: ${e.message}`))
  for (const e of old.expectations) {
    const newer = profile.expectations.find((x: any) => x.id === e.id)
    if (!newer || newer.essentialUnderstandingDe !== e.essentialUnderstandingDe || newer.essentialUnderstandingEn !== e.essentialUnderstandingEn) errors.push(`Existing essential understanding changed ${e.id}`)
  }
  for (const key of ['expectations', 'variationAxes', 'applicationCaseBriefs']) {
    const ids = profile[key].map((x: any) => x.id)
    if (new Set(ids).size !== ids.length) errors.push(`Duplicate ${key} ID`)
  }
  const expectationIds = new Set(profile.expectations.map((x: any) => x.id))
  const coverage = profile.coverageExpectations
  for (const id of [...coverage.requiredExpectationIds, ...coverage.alternativeExpectationGroups.flat()]) if (!expectationIds.has(id)) errors.push(`Unresolved coverage ${id}`)
  for (const id of old.coverageExpectations.requiredExpectationIds) if (!coverage.requiredExpectationIds.includes(id)) errors.push(`Old mandatory coverage lost ${id}`)
  if (coverage.minimumIndependentDemonstrations < old.coverageExpectations.minimumIndependentDemonstrations || coverage.freshVariationRequired !== true || coverage.independentTransferRequired !== true) errors.push('Coverage thresholds weakened')
  const caseIds = profile.applicationCaseBriefs.map((x: any) => x.id)
  for (const c of old.applicationCaseBriefs) if (!caseIds.includes(c.id)) errors.push(`Old application case ID lost ${c.id}`)
  if (decision.authorAgentCanonicalName !== '/root/physics_pending5_revision' || !decision.independentReviewRequiredFromDifferentAgent) errors.push('Author role boundary missing')
  const oldInternal = current.requires.filter((id: string) => !math.has(id.split(':').at(-1)))
  const newInternal = decision.proposalBinding.proposedRequires.filter((id: string) => !math.has(id.split(':').at(-1)))
  if (stableJson(oldInternal) !== stableJson(newInternal)) errors.push('Internal prerequisite changed')
  if (decision.decision === 'granularity_gap' && stableJson(decision.proposalBinding.baselineRequires) !== stableJson(decision.proposalBinding.proposedRequires)) errors.push('Unresolved record mutated baseline prerequisites')
  checks.push({ goalId: gid, sourceIndex: decision.sourceIndex, authorAction: decision.decision, profileBodySha256: fingerprint(profile), profileSchemaValid: validateProfile(profile), oldEssentialAndIdsPreserved: errors.length === 0, errors })
  failures.push(...errors.map(e => `${gid}: ${e}`))
}
const mathChecks: any[] = []
for (const [gid, owner] of Object.entries(context.mathematicsFullDescriptionsAndActualCurrentNativePRead) as any[]) {
  const errors: string[] = []
  if (fingerprint(math.get(gid)) !== owner.goalSha256 || fingerprint(owner.goal) !== owner.goalSha256) errors.push('Current whole Math goal mismatch')
  if (sha(owner.configPath) !== owner.configFileSha256 || sha(owner.reviewPath) !== owner.reviewFileSha256) errors.push('Current Math owner bytes mismatch')
  const row = readFileSync(resolve(root, owner.reviewPath), 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)).find(r => r.goalId === gid)
  if (!row || pythonJson(row) !== pythonJson(owner.record)) errors.push('Full current Math native row mismatch')
  if (bytesFingerprint(pythonJson(owner.record)) !== owner.recordSha256PythonCodepointJson || fingerprint(owner.record.profile) !== owner.profileBodySha256) errors.push('Math row/body hash mismatch')
  if (!validateProfile(owner.record.profile)) errors.push('Current Math profile schema error')
  mathChecks.push({ goalId: gid, configPath: owner.configPath, reviewPath: owner.reviewPath, profileBodySha256: owner.profileBodySha256, errors })
  failures.push(...errors.map(e => `${gid}: ${e}`))
}
// Verify exact explicit official/legacy record anchors, not only file existence.
for (const decision of packet.decisions) for (const ref of decision.sourceRefs) {
  if (ref.recordId && ref.locator?.startsWith('sourceGoals[id=')) {
    if (!read(ref.path).sourceGoals.some((g: any) => g.id === ref.recordId)) failures.push(`False official source record ${ref.recordId}`)
  }
  if (ref.recordId && ref.path.endsWith('.snapshot') && ref.locator?.startsWith('goals[id=')) {
    if (!read(ref.path).goals.some((g: any) => g.id === ref.recordId)) failures.push(`False own legacy record ${ref.recordId}`)
  }
}

const v3Profile = context.oldV3ProfileFullDeEn
const v4Profile = context.newV4ProfileFullDeEn
const replaceFourChangedFields = JSON.parse(JSON.stringify(v4Profile))
for (const change of context.exactFieldChanges) {
  const before = v3Profile.applicationCaseBriefs.find((c: any) => c.id === change.caseId)
  const after = v4Profile.applicationCaseBriefs.find((c: any) => c.id === change.caseId)
  if (before[change.field] !== change.old || after[change.field] !== change.new) failures.push('V4 exact field-change record mismatch')
  replaceFourChangedFields.applicationCaseBriefs.find((c: any) => c.id === change.caseId)[change.field] = change.old
}
if (context.exactFieldChanges.length !== 4 || stableJson(replaceFourChangedFields) !== stableJson(v3Profile)) failures.push('V4 modified more than the four mathematical helper fields')
if (fingerprint(v3Profile) !== context.oldV3ProfileBodySha256 || fingerprint(v4Profile) !== context.newV4ProfileBodySha256) failures.push('Old/new V4 context profile hash mismatch')
if (stableJson(amendments.amendments[0].v3ProfileFullDeEn) !== stableJson(v3Profile)) failures.push('V3 bilingual profile missing from V4 amendment')
if (sha(context.actualFinalV3PeerReceiptRead.path) !== context.actualFinalV3PeerReceiptRead.sha256) failures.push('Final V3 peer receipt bytes changed')
if (stableJson(v4Profile) !== stableJson(amendments.amendments[0].proposedProfile)) failures.push('Exact new V4 profile disagreement')

const config = read('curricula/quality/cross-subject-requires/math-physics.config.json')
const inventory = buildRequiresInventory(root, config)
const inventorySha = assertFreshRequiresInventory(inventory, resolve(root, 'curricula/quality/cross-subject-requires/math-physics.inventory.json'))
if (packet.baselineInventorySha256 !== inventorySha) failures.push('Packet inventory hash mismatch')
const requiresValidation = validateRequiresDecisions(inventory, packet, { sourcePathExists: path => existsSync(resolve(root, path)) })
failures.push(...requiresValidation.errors)
if (packet.proposedGraphCycles.length) failures.push('Proposed global cycle')
const report = {
  schemaVersion: 1, status: failures.length ? 'author_technical_validation_failed' : 'author_technical_validation_passed_no_substantive_approval',
  author: '/root/physics_pending5_revision', role: 'revision_author', completedAt: new Date().toISOString(),
  authorityBoundary: 'Profile-only JSON schema and exact byte/body/graph checks. No synthetic native D/P record, no review run, no independent scientific approval, no active graph edit.',
  schema: { path: schemaPath, sha256: sha(schemaPath), selectedSchema: '#/$defs/profile' },
  nativeRecordDigestMethod: 'Captured original native rows use Python Unicode-codepoint sorted JSON; current rows are compared in full. Profile-only digests are verified with the repository fingerprint helper.',
  inputs: ['context.exact.json', 'author-decisions.json', 'profile-amendments.candidate.json', 'proposal-candidate.json'].map(suffix => ({ path: prefix + '.' + suffix, sha256: sha(prefix + '.' + suffix) })),
  frozenInputCount: context.frozenInputs.length, frozenChanges, checks, mathChecks, requiresValidation,
  proposedGlobalCycleCount: packet.proposedGraphCycles.length,
  authorRemainingGapGoalIds: packet.decisions.filter((d: any) => d.decision === 'granularity_gap').map((d: any) => d.dependentGoalId),
  independentlyApprovedNewInputCount: 0, failures,
}
const output = resolve(root, prefix + '.author-technical-validation.json')
writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ output, outputSha256: sha(prefix + '.author-technical-validation.json'), profileChecks: checks.length, fullCurrentMathProfiles: mathChecks.length, frozenInputs: context.frozenInputs.length, failures }, null, 2))
if (failures.length) process.exitCode = 1
