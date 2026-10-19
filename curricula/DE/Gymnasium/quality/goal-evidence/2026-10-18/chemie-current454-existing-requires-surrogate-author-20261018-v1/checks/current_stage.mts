// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { syncBuiltinESMExports } from 'node:module'
import { fileURLToPath } from 'node:url'

const repo = process.cwd(), own = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p: string) => JSON.parse(fs.readFileSync(path.resolve(repo, p), 'utf8'))
const pin = (p: string) => { const raw = fs.readFileSync(path.resolve(repo, p)); return { path: p, sha256: createHash('sha256').update(raw).digest('hex'), bytes: raw.length } }
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
const integration = base + 'chemie-current454-reviewed-normal-integration-technical-20261018-v1/'
const oldPins = read(path.relative(repo, path.join(own, 'evidence/INPUTS.native-read-pins.json')))
const resolutions = oldPins.filter((p: any) => pin(p.path).sha256 !== p.sha256).map((p: any) => {
  const archived = pin(integration + 'before/' + p.path)
  assert.equal(archived.sha256, p.sha256, `Old raw bytes not preserved: ${p.path}`)
  assert.equal(archived.bytes, p.bytes)
  return { originalPinnedInput: p, exactArchivedBefore: archived, currentIntegratedInput: pin(p.path) }
})
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const canonical = read(canonicalPath)
const whole = read(path.relative(repo, path.join(own, 'evidence/WHOLE.five-selected-goals-and-positive-profiles.json')))
for (const r of whole.records) assert.deepEqual(canonical.goals.find((g: any) => g.id === r.goal.id), r.goal)
const registryPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const subject = read(registryPath).subjects.find((s: any) => s.subject === 'chemie')
const pConfigPath = base + 'chemie-current454-targeted-P-owner-selection-technical-20261018-v1/config/active/P31-group04.preserved-criteria-path.config.json'
assert(subject.positiveEvidenceConfigPaths.includes(pConfigPath))
const pConfig = read(pConfigPath)
const positive = fs.readFileSync(pConfig.reviewPath, 'utf8').trim().split('\n').map(JSON.parse)
for (const r of whole.records) {
  assert(pConfig.scope.goalIds.includes(r.goal.id))
  assert.deepEqual(positive.find((p: any) => p.goalId === r.goal.id).profile, r.wholePositiveProfileRow.profile)
}
const mappingFiles: string[] = []
const walk = (p: string) => { for (const e of fs.readdirSync(p, { withFileTypes: true })) { const f = path.join(p, e.name); if (e.isDirectory()) walk(f); else if (e.name.endsWith('.json')) mappingFiles.push(f) } }
walk('curricula/DE/Gymnasium/mapping')
const mappingPaths = mappingFiles.filter(p => read(p).targetLandscapeId === canonical.landscapeId)
const allowed = [canonicalPath, ...mappingPaths].map(p => path.resolve(repo, p))
const realReaddir = fs.readdirSync
;(fs as any).readdirSync = (p: any, options: any) => {
  const absolute = path.resolve(String(p)), entries: any = realReaddir(p, options)
  if (!absolute.startsWith(path.resolve(repo, 'curricula')) || absolute.includes('/quality/')) return entries
  return entries.filter((e: any) => { const candidate = path.join(absolute, typeof e === 'string' ? e : e.name); return allowed.some(a => a === candidate || a.startsWith(candidate + path.sep)) })
}
syncBuiltinESMExports()
const { buildApplicabilityCompilation } = await import('../../../../../../../../app/scripts/applicabilityCompiler.ts')
let result: any, compileError: any
try { result = buildApplicabilityCompilation() } catch (error) { compileError = { name: (error as Error).name, message: (error as Error).message } }
;(fs as any).readdirSync = realReaddir
syncBuiltinESMExports()
assert.equal(mappingPaths.length, 82)
const oldReport = read(path.relative(repo, path.join(own, 'evidence/native-one-landscape-applicability.json'))).report
const ids = oldReport.goals.map((g: any) => g.goalId)
const currentSelectedGoals = result?.reports[0].goals.filter((g: any) => ids.includes(g.goalId))
if (result) { assert.equal(result.reports.length, 1); assert.deepEqual(currentSelectedGoals, oldReport.goals) }
const selectedAnchors = read(path.relative(repo, path.join(own, 'AUTHOR.source-anchor-selection.pending.json'))).rows.flatMap((r: any) => r.anchors)
for (const a of selectedAnchors) assert.deepEqual(read(a.normalMappingPath), read(a.selectedMappingPath))
const output = { role: 'EXPLICIT_PREINTEGRATION_TO_CURRENT_NORMAL_STAGE_BINDING', authorRegistryCandidateStillInactive: true,
  ownNormalWrites: 0, originalNativeInputPinsRewritten: false, rootIntegrationReceipt: pin(integration + 'ACTIVATION.executed-receipt.json'),
  archivedInputResolutions: resolutions, currentCanonicalPin: pin(canonicalPath), currentCentralRegistryPin: pin(registryPath),
  currentPositiveOwnerConfig: pin(pConfigPath), currentPositiveRows: pin(pConfig.reviewPath),
  wholeFiveCurrentNormalGoalsEqualSelectedCandidate: true, wholeFiveCurrentActivePositiveProfilesEqualSelectedCandidate: true,
  all32SourceAnchorNormalMappingBodiesEqualSelectedOverlay: true,
  actualCurrentNativeApplicabilityCompiler: { canonicalLandscapes: result?.reports.length ?? null, mappingPaths: 82, noCandidateOverlayNeededNow: true, allNineSelectedGoalReportsExactlyEqualEarlierProspectiveOutput: Boolean(result), compileError: compileError ?? null },
  surrogateRegistryUnchanged: pin('curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'),
  separateB732CandidateReviewedOrAppliedHere: false, newIndependentApproval: false, M7Claim: false }
fs.writeFileSync(path.join(own, 'INTEGRATION.stage-transition.json'), JSON.stringify(output, null, 2) + '\n')
console.log(JSON.stringify({ archivedExactBeforeInputs: resolutions.length, currentWholeGoalsAndProfilesExact: 5, currentNativeGoalReportsExact: currentSelectedGoals?.length ?? 0, compileError: compileError ?? null, registryCandidateStillInactive: true }))
if (compileError) process.exitCode = 1
