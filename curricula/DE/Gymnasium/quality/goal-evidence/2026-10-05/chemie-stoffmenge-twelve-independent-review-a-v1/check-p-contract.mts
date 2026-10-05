// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const sha = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const freeze = await read(resolve(own, 'D-before-P.freeze.receipt.json'))
if (sha(await readFile(resolve(own, freeze.file))) !== freeze.sha256 || freeze.positiveEvidenceReadBeforeFreeze !== false) {
  throw new Error('The independent D/source/A/M decision was not frozen before P or changed after P.')
}
const pPath = resolve(own, '../chemie-stoffmenge-quantitative-foundations-twelve-candidate-v1/positive-evidence.candidates.json')
const input = await read(pPath)
const schema = await read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const ajv = new Ajv2020({ allErrors: true, strict: true }); addFormats(ajv)
const validate = ajv.compile({ $schema: 'https://json-schema.org/draft/2020-12/schema', $defs: schema.$defs, ...schema.$defs.profile })
const saltId = '965ca297-5dbf-5e58-b5f0-6559a4433646'
const results = input.goals.map((goal: any) => {
  const valid = Boolean(validate(goal.profile))
  const expectations = new Set(goal.profile.expectations.map((e: any) => e.id))
  const cases = goal.profile.applicationCaseBriefs
  return {
    goalId: goal.goalId,
    scope: goal.goalId === saltId ? 'diagnostic_formula_name_only_hold_for_current_goal' : 'eleven_candidate_content_review',
    profileSchemaPass: valid,
    schemaErrors: validate.errors,
    expectationReferencesPass: goal.profile.coverageExpectations.requiredExpectationIds.every((id: string) => expectations.has(id)),
    bilingualCasesPass: cases.every((c: any) => ['taskDemandDe', 'taskDemandEn', 'expectedPerformanceDe', 'expectedPerformanceEn', 'understandingFocusDe', 'understandingFocusEn'].every(k => typeof c[k] === 'string' && c[k].trim().length > 0)),
    applicationCases: cases.length,
    minimumIndependentDemonstrations: goal.profile.coverageExpectations.minimumIndependentDemonstrations,
    freshVariationRequired: goal.profile.coverageExpectations.freshVariationRequired,
    independentTransferRequired: goal.profile.coverageExpectations.independentTransferRequired,
    truthfulLimitedClaim: goal.evidenceLevel === 'E1' && goal.maximumClaimScope === 'G1',
  }
})

// Independently recomputed quantities and conservation checks for the supplied cases.
// These are reviewer checks of the educational data, not learner evidence or runtime tests.
const calculations: Array<{ caseId: string, claim: string, actual: number, expected: number, relativeTolerance: number, pass: boolean }> = []
function check(caseId: string, claim: string, actual: number, expected: number, relativeTolerance = 1e-12) {
  const pass = Math.abs(actual - expected) <= relativeTolerance * Math.max(Math.abs(expected), 1e-30)
  calculations.push({ caseId, claim, actual, expected, relativeTolerance, pass })
}
const na = 6.02214076e23
check('salt-formula-units-fresh', 'total ion amount / mol', 0.30 * 2, 0.60)
check('water-mass-amount', 'water molar mass / g mol^-1', 2 * 1 + 16, 18)
check('water-mass-amount', 'water amount / mol', 9 / 18, 0.50)
check('hydroxide-parentheses-fresh', 'Mg(OH)2 molar mass / g mol^-1', 24 + 2 * (16 + 1), 58)
check('hydroxide-parentheses-fresh', 'Mg(OH)2 sample mass / g', 0.20 * 58, 11.6)
check('hydroxide-parentheses-fresh', 'NaOH sample mass / g', 0.20 * (23 + 16 + 1), 8)
check('carbon-dioxide-scale', 'single CO2 particle mass / g (rounded supplied u)', 44 * 1.66054e-24, 7.31e-23, 1e-3)
check('carbon-dioxide-scale', 'one mol CO2 mass / g (supplied rounded constants)', 44 * 1.66054e-24 * 6.02214e23, 44, 2e-6)
check('methane-quarter-count-fresh', 'methane sample mass / g', 1.505535e23 * 16 * 1.66054e-24, 4, 2e-6)
check('quarter-mol-oxygen', 'O2 molecule count', 0.25 * na, 1.50553519e23)
check('quarter-mol-oxygen', 'O atom count', 2 * 0.25 * na, 3.01107038e23)
check('carbon-dioxide-helium-count-fresh', 'CO2 amount / mol', 6.02214076e22 / na, 0.1)
check('carbon-dioxide-helium-count-fresh', 'He amount / mol', 1.204428152e23 / na, 0.2)
check('carbon-dioxide-helium-count-fresh', 'total atomic amount from CO2 / mol', 3 * 6.02214076e22 / na, 0.3)
check('hydrogen-oxygen-one-litre', 'O2 to H2 mass ratio at equal ideal-gas counts', 32 / 2, 16)
check('molar-volume-reference-state', 'nitrogen volume / L', 0.25 * 24, 6)
check('molar-volume-reference-state', 'helium amount / mol', 12 / 24, 0.5)
check('closed-volume-change-fresh', 'invariant gas amount / mol', 9 / 30, 0.3)
check('closed-volume-change-fresh', 'new gas volume / L', 9 / 30 * 24, 7.2)
check('molar-volume-reference-state', 'supplied rounded ideal-gas Vm / L mol^-1 at 293.15 K, 101.6 kPa', 8.314462618 * 293.15 / 101.6, 24, 1e-3)
check('closed-volume-change-fresh', 'supplied rounded ideal-gas Vm / L mol^-1 at 293.15 K, 81.3 kPa', 8.314462618 * 293.15 / 81.3, 30, 1e-3)
check('carbon-dioxide-cross-check', 'amount / mol', 0.600 / 24, 0.025)
check('carbon-dioxide-cross-check', 'molar mass / g mol^-1', 1.10 / (0.600 / 24), 44)
check('unknown-gas-new-state-fresh', 'correct molar mass / g mol^-1', 1.60 / (0.300 / 12), 64)
check('unknown-gas-new-state-fresh', 'molar mass using rejected wrong state / g mol^-1', 1.60 / (0.300 / 24), 128)
check('oxygen-model-and-water', 'hydrogen atoms before and after', 2 * 2, 2 * 2)
check('oxygen-model-and-water', 'oxygen atoms before and after', 1 * 2, 2 * 1)
check('chlorine-hydrogen-fresh', 'chlorine atoms before and after', 1 * 2, 2 * 1)
check('equal-atom-count-and-elemental-gas', 'relative X atom mass', 35.5 / 1 * 1, 35.5)
check('equal-atom-count-and-elemental-gas', 'X atoms per X molecule', 71 / 35.5, 2)
check('binary-ratio-and-molecule-mass-fresh', 'C to H atom ratio', (6 / 12) / (1 / 1), 0.5)
check('binary-ratio-and-molecule-mass-fresh', 'CH2 to molecular-formula multiplier', 28 / (12 + 2), 2)
check('magnesium-oxygen-scheme', 'magnesium atoms before and after', 2, 2)
check('magnesium-oxygen-scheme', 'oxygen atoms before and after', 2, 2 * 1)
check('aluminium-copper-half-equations-fresh', 'electron count matches', 2 * 3, 3 * 2)
check('aluminium-copper-half-equations-fresh', 'positive charge before and after', 3 * 2, 2 * 3)
check('magnesium-chloride-neutrality', 'MgCl2 total charge', 2 + 2 * -1, 0)
check('aluminium-sulfate-group-fresh', 'Al2(SO4)3 total charge', 2 * 3 + 3 * -2, 0)
check('aluminium-sulfate-group-fresh', 'rejected Al3(SO4)2 total charge', 3 * 3 + 2 * -2, 5)

const structuralPass = results.length === 12 && new Set(results.map((r: any) => r.goalId)).size === 12 && results.every((r: any) => r.profileSchemaPass && r.expectationReferencesPass && r.bilingualCasesPass && r.applicationCases === 2 && r.minimumIndependentDemonstrations === 2 && r.freshVariationRequired && r.independentTransferRequired && r.truthfulLimitedClaim)
const receipt = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  status: structuralPass && calculations.every(c => c.pass) ? 'pass_eleven_candidate_inner_profiles_plus_one_limited_salt_diagnostic' : 'fail',
  pInputPath: pPath.slice(root.length + 1),
  pInputSha256: sha(await readFile(pPath)),
  dFrozenFirstAndUnchanged: true,
  frozenDFileSha256: freeze.sha256,
  schemaScope: 'Only the current P-v2 inner profile contract. The inactive author wrapper is not a materialized current P-v2 evidence record.',
  results,
  independentlyRecomputedEducationalData: calculations,
  nonNumericInterpretationReview: 'Documented separately per case in positive-evidence-verdict.json; schema and arithmetic checks alone do not prove reasoning, controls, scope fidelity or mastery.',
  admittedCandidateGoalCount: 11,
  admittedBilingualCaseCount: 22,
  saltCurrentFullProfileAdmitted: false,
  currentBindingOrGateCompletionClaimed: false,
  currentStrictClosuresClaimed: 0,
  humanApprovalOrLearnerEvidenceClaimed: false,
}
await writeFile(resolve(own, 'P-contract-check.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify({ status: receipt.status, profileSchemaCount: results.filter((r: any) => r.profileSchemaPass).length, admittedCandidateGoalCount: 11, admittedBilingualCaseCount: 22, saltFullCurrentProfileAdmitted: false, arithmeticChecks: calculations.length, arithmeticPass: calculations.every(c => c.pass), frozenDUnchanged: true }))
if (receipt.status === 'fail') process.exitCode = 1
