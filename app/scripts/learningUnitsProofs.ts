import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest } from './learningUnitsMathAuthoring'
import { compactScalarArrays } from './learningUnits/compactJson'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const work = resolve(repo, 'tmp/math-learning-units')
const args = process.argv.slice(2)
const mode = args.shift()
assert.ok(mode === 'admission' || mode === 'performance' || mode === 'installed-offers', 'Usage: learningUnitsProofs.ts installed-offers --store <provisioned-store> [--native-inventory <report>] | admission --model <root> | performance [--native-inventory <json>] [--canonical <json>] [--publish-report]')
const option = (name: string, fallback?: string) => {
  const index = args.indexOf(name)
  if (index < 0) return fallback
  assert.ok(args[index + 1] && !args[index + 1].startsWith('--'), `Missing value after ${name}`)
  return args[index + 1]
}
const inputPath = (name: string, fallback?: string) => {
  const value = option(name, fallback)
  assert.ok(value, `Pass ${name}`)
  const path = resolve(process.cwd(), value)
  assert.ok(existsSync(path), `Missing input: ${path}`)
  return path
}
const output = resolve(process.cwd(), option('--output', resolve(work, mode === 'admission' ? 'actual-produced-runtime12-admission.json' : mode === 'installed-offers' ? 'actual-installed-offer-182-parity.json' : 'prerequisite-performance.json'))!)
mkdirSync(dirname(output), { recursive: true })
const propertyArguments: string[] = []
if (mode === 'admission') propertyArguments.push(`-PlearningUnitModelRoot=${inputPath('--model')}`, `-PlearningUnitAdmissionOutput=${output}`)
else if (mode === 'installed-offers') propertyArguments.push(`-PlearningUnitPackageStore=${inputPath('--store')}`,
  `-PlearningUnitNativeInventory=${inputPath('--native-inventory', resolve(work, 'native-backend.raw.json'))}`,
  `-PlearningUnitInstalledOfferOutput=${output}`)
else propertyArguments.push(`-PlearningUnitNativeInventory=${inputPath('--native-inventory', resolve(work, 'native-backend.raw.json'))}`,
  `-PlearningUnitCanonicalSource=${inputPath('--canonical', resolve(repo, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))}`,
  `-PlearningUnitBenchmarkOutput=${output}`)
if (!args.includes('--reports-only')) {
  execFileSync('./gradlew', ['--no-daemon', '--max-workers=1', '--init-script', '../app/scripts/learningUnits/proofs.init.gradle',
    mode === 'admission' ? 'actualProducedLearningUnitAdmission' : mode === 'installed-offers' ? 'actualInstalledLearningUnitOffers' : 'learningUnitPrerequisiteBenchmark', ...propertyArguments], {
    cwd: resolve(repo, 'backend'), stdio: 'inherit', env: { ...process.env,
      GRADLE_USER_HOME: process.env.GRADLE_USER_HOME ?? resolve(repo, 'tmp/chatgpt-coach-gradle-user-home') },
  })
}
const rawBytes = readFileSync(output)
const report = JSON.parse(rawBytes.toString('utf8'))
assert.equal(report.schemaVersion, 1)
assert.ok(report.javaVersion && report.javaVendor && report.productionClassSha256, 'Proof omits executed JDK or compiled production-class bindings')
const shared = {
  schemaVersion: 1,
  measurement: 'local in-process proof; no HTTP, DB, browser, provider-host or CI performance acceptance',
  javaVersion: report.javaVersion, javaVendor: report.javaVendor,
  rawReportSha256: digest(rawBytes), productionClassSha256: report.productionClassSha256,
  harnessSourceSha256: digest(readFileSync(resolve(repo, 'app/scripts/learningUnits', mode === 'admission'
    ? 'ActualProducedLearningUnitAdmission.java' : mode === 'installed-offers' ? 'ActualInstalledLearningUnitOffers.java' : 'LearningUnitPrerequisiteBenchmark.java'))),
}
let publicReport: Record<string, unknown>
if (mode === 'installed-offers') {
  assert.equal(report.proof, 'actual-installed-learning-unit-offers-182-native-parity')
  assert.equal(report.repositoryNativeScopeCount, 182)
  assert.equal(report.actualPackageScopeCount, 182)
  assert.equal(report.all182ActualNativeProjectionsEqual, true)
  assert.deepEqual(report.quarantinedContracts, {})
  assert.ok(report.scopes.every((scope: {exactActualProjectionParity: boolean}) => scope.exactActualProjectionParity))
  publicReport = { ...shared, proof: report.proof, packageGenerationSha256: report.packageGenerationSha256,
    packages: report.packages, repositoryNativeReportSha256: report.repositoryNativeReportSha256,
    repositoryNativeScopeCount: report.repositoryNativeScopeCount, actualPackageScopeCount: report.actualPackageScopeCount,
    all182ActualNativeProjectionsEqual: true, admittedContractCount: report.admittedContractCount,
    quarantinedContracts: report.quarantinedContracts, scopes: report.scopes,
    installedEntryView: report.installedEntryView, installedEntryDefaultOffering: report.installedEntryDefaultOffering,
    entryNavigationController: report.entryNavigationController,
    unresolvedEntryProjectionCases: report.unresolvedEntryProjectionCases,
    directMathCanonicalDefaultRetained: report.directMathCanonicalDefaultRetained,
    publishedPersonalizationFlow: report.publishedPersonalizationFlow,
    operationalNativeMappingInputSha256: report.operationalNativeMappingInputSha256,
    operationalNativeMappingTupleCount: report.operationalNativeMappingTupleCount,
    operationalNativeMappingTupleSha256: report.operationalNativeMappingTupleSha256,
    compiledReviewEvidenceMappingTupleCount: report.compiledReviewEvidenceMappingTupleCount,
    coherentPublicMastery: report.coherentPublicMastery, directMathOfferStatus: report.directMathOfferStatus,
    measurement: report.measurement,
    evidenceBoundary: 'Exact provisioned ZIP loaded by the real JsonCurriculumPackageLoader and native services under its own Entry; all182 projections compared to actual repository outputs. Repositories mocked; no HTTP/SQL or host acceptance claim.',
    reproduction: 'cd app && npx tsx scripts/learningUnitsProofs.ts installed-offers --store <provisioned-store> --native-inventory <actual-repository-report>' }
} else if (mode === 'admission') {
  assert.equal(report.proof, 'actual-produced-runtime-1.2-cold-java-admission')
  assert.deepEqual(report.quarantinedContracts, {})
  assert.deepEqual(report.coldEmptyMasteryRecognition, [])
  assert.deepEqual(report.recognizedGoalIds, ['3016ec37-1c2e-47db-83f5-e767923bc97e'])
  assert.ok(report.actualModelInputSha256 && Object.keys(report.actualModelInputSha256).length > 0)
  publicReport = { ...shared, proof: report.proof, contentDigest: report.contentDigest,
    compiledLandscapeCount: report.compiledLandscapeCount, compiledViewCount: report.compiledViewCount,
    actualUnitWrapperCount: report.actualUnitWrapperCount,
    actualModelInputCount: Object.keys(report.actualModelInputSha256).length,
    actualModelInputManifestSha256: digest(canonicalJson(report.actualModelInputSha256)),
    admittedContracts: report.admittedContracts, quarantinedContracts: report.quarantinedContracts,
    explicitMastery: report.explicitMastery, coldEmptyMasteryRecognition: report.coldEmptyMasteryRecognition,
    recognizedGoalIds: report.recognizedGoalIds, derivedComplete: report.derivedComplete,
    compiledSemanticKindsPreserved: report.compiledSemanticKindsPreserved,
    evidenceBoundary: 'Actual producer canonical, views and immutable unit wrappers loaded by the real Java package-admission catalog. This proof does not install or serve a ZIP.',
    reproduction: 'cd app && npx tsx scripts/learningUnitsProofs.ts admission --model <compiled-model-root> --publish-report' }
} else {
  assert.equal(report.proof, 'independent-full-transitive-BFS-parity-and-local-timing')
  assert.equal(report.rows.length, 16, 'Expected four graph inputs and four mastery/focus cases')
  assert.ok(report.rows.every((row: { exactReferenceParity: boolean }) => row.exactReferenceParity))
  assert.ok(report.inputSha256 && Object.keys(report.inputSha256).length === 2)
  publicReport = { ...shared, proof: report.proof, availableProcessors: report.availableProcessors,
    inputSha256: report.inputSha256, rule: report.rule, timingUnit: report.timingUnit,
    timingBoundary: report.timingBoundary, warmupIterations: report.warmupIterations,
    cases: report.rows, exactReferenceParityCases: report.rows.length,
    percentileMeaning: 'Observed p50/p95 of repeated local calls. Static samples construct fresh graph instances; first-call measurements are separate. No service-level timing threshold or acceptance limit is inferred.',
    reproduction: 'cd app && npx tsx scripts/learningUnitsProofs.ts performance --native-inventory <native-inventory.json> --canonical <canonical-math.json> --publish-report' }
}
if (args.includes('--publish-report')) {
  const path = resolve(repo, `docs/dev/learning-units-mathematics-${mode === 'admission' ? 'produced-model-admission' : mode === 'installed-offers' ? 'installed-offer-parity' : 'local-performance'}.json`)
  writeFileSync(path, `${compactScalarArrays(publicReport)}\n`)
  console.log(`Published local ${mode} proof: ${path}`)
} else console.log(JSON.stringify({ mode, proof: report.proof, rawReport: output }))
