import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { testGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/testGoalBookSourceAtlasInputs'
import { expandGoalBookSourceAtlasReceipt } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const binding = (path: string) => {
  const bytes = readFileSync(resolve(root, path))
  return { path, sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`, bytes: bytes.length }
}
const configPaths = ['app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json', 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json']
const datasets = configPaths.map(path => {
  const config = JSON.parse(readFileSync(resolve(root, path), 'utf8'))
  const receiptPath = `${config.outputDirectory}/source-projection.receipt.json`
  const receipt = expandGoalBookSourceAtlasReceipt(JSON.parse(readFileSync(resolve(root, receiptPath), 'utf8')))
  return { path, config, receiptPath, receipt }
})
const paths = [...new Set(['app/scripts/testGoalBookSourceAtlasInputs.ts', 'app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/goalBookModel.ts', ...datasets.flatMap(({ path, config, receiptPath, receipt }) => [path, config.landscapePath, config.semanticKindLedgerPath, config.durationModelPolicyPath, config.navigationViewPath, config.manifestPath, receiptPath, ...receipt.inputBindings.map(row => row.path)])])]
const before = paths.map(binding)
// This is the actual function invocation: import alone is explicitly insufficient.
testGoalBookSourceAtlasInputs()
const after = paths.map(binding)
if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Unexpected active source-atlas input or output change during read-only native assertions')
writeFileSync(resolve(own, 'actual-native-current-390-378-source-scopes-and-assertion-reach.receipt.json'), `${JSON.stringify({ schemaVersion: 1, documentType: 'readonly-actual-native-source-atlas-test-invocation-and-existing-receipt-scope-observation', actualExportedTestFunctionInvoked: 'testGoalBookSourceAtlasInputs()', actualInvocationCount: 1, activeInputsAndGeneratedAtlasByteExactBeforeAfter: before, datasets: datasets.map(({ path, receiptPath, receipt }) => ({ configPath: path, receiptPath, counts: receipt.counts, scopes: receipt.scopes.map(scope => ({ key: scope.key, jurisdiction: scope.jurisdiction, stage: scope.stage, courseProfile: scope.courseProfile, actualGoalCount: scope.goalIds.length, goalIds: scope.goalIds, witnessCount: scope.witnesses.length, witnessCoverageKinds: [...new Set(scope.witnesses.map(w => w.coverage))].sort(), profileBasisKinds: [...new Set(scope.witnesses.map(w => w.profileBasis))].sort() })), omittedGoals: receipt.omittedGoals })), assertionReach: { biology: 'Native current390/390,22 source views, explicit BY/HE/ST scope counts, direct targeted witness scopes and no coarse inherited GK/LK source coverage', chemistry: 'Native current378/published359,48 source views,496 unresolved decisions,19 omitted, HE-only mapped new atoms and BY/HE scope counts, authored-view witnesses limited BB/BE, quantitative-paraben exclusion', shared: 'Existing exact compact/expand roundtrip and clean-checkout identical derivation without PDF downloads; fixture checks reject stale bytes, scope uncertainty, false inheritance and invalid snapshots', notAsserted: 'No new general GK/LK superset theorem, no global source completeness or closure of unresolved components, no new D/P/V science review' }, activeCurriculumWrites: false, technicalTemporaryFixturesActuallyCreatedAndRemovedByUnmodifiedNativeTest: true, humanApproval: false, humanTrial: false }, null, 2)}\n`)
