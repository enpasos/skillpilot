import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SKILLPILOT_DATA_LICENSE_CATEGORY,
  SKILLPILOT_LICENSE_SCOPE_PATH,
  buildPackageLicense,
  buildSubjectExportLicensePolicy,
  canonicalGoalIndex,
  collectExternalCompositionGoalReferences,
  licenseCategoryForRepoSource,
  sanitizeJsonForPackage,
  selectGoalVisualizationAssets,
  subjectExportLicenseEntries,
} from './buildSkillpilotExportPackage'
import {
  isKnownSubjectExportLicenseCategory,
  subjectExportLicenseIssues,
  unresolvedCompositionGoalReferences,
  validateExternalCompositionGoalReferences,
} from './validateSubjectExportPackages'
import { SUBJECT_EXPORT_MEMORY_CARD_REVIEW_CONFIGS } from './runSubjectExportReleaseGate'
import {
  isSubjectExportGoalVisualizationPath,
  legacySubjectExportGoalVisualizationPath,
  subjectExportGoalVisualizationPath,
  subjectExportMappingFileName,
  subjectExportSourceArtifactFileName,
} from './subjectExportPackagePaths'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readJson = (path: string) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))

const activeMemoryReviews = readJson(
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
).subjects as Array<{ landscapePath: string; memoryReviewConfigPath: string }>
for (const subject of activeMemoryReviews) {
  const landscapeId = readJson(subject.landscapePath).landscapeId
  const matching = SUBJECT_EXPORT_MEMORY_CARD_REVIEW_CONFIGS.filter(
    ({ configPath }) => readJson(configPath).landscapeId === landscapeId,
  )
  assert.equal(matching.length, 1, 'each export subject uses exactly one current memory review')
  assert.equal(matching[0].configPath, subject.memoryReviewConfigPath,
    'export release checks and report freshness follow the active evidence registry, preserving historical reviews')
}

const licensePolicy = buildSubjectExportLicensePolicy()
assert.equal(licensePolicy.defaultSkillpilotDataLicense, 'CC-BY-4.0')
assert.equal(licensePolicy.defaultSoftwareLicense, 'Apache-2.0')
assert.equal(licensePolicy.projectScopePath, SKILLPILOT_LICENSE_SCOPE_PATH)
for (const category of ['canonical-landscape', 'composition-view', 'mapping', 'provenance', 'card-deck', 'memory-card-review-audit']) {
  assert.equal(licenseCategoryForRepoSource('synthetic.json', category), SKILLPILOT_DATA_LICENSE_CATEGORY)
}
assert.equal(licenseCategoryForRepoSource('original.json', 'source-extraction'), 'official-source-provenance-only')
assert.equal(isKnownSubjectExportLicenseCategory(SKILLPILOT_DATA_LICENSE_CATEGORY), true)
assert.equal(isKnownSubjectExportLicenseCategory('skillpilot-data-apache-2.0'), true, 'Keep historical packages readable without rewriting them')
assert.equal(isKnownSubjectExportLicenseCategory('unknown-license'), false)
const licenseText = readFileSync(resolve(repoRoot, 'LICENSE'), 'utf8')
const contentLicenseText = readFileSync(resolve(repoRoot, 'LICENSES/CC-BY-4.0.txt'), 'utf8')
const scopeText = readFileSync(resolve(repoRoot, 'LICENSING.md'), 'utf8')
const licenseEntries = subjectExportLicenseEntries('synthetic-export', licenseText, contentLicenseText, scopeText)
assert.equal(licenseEntries[0].packagePath, 'synthetic-export/licenses/APACHE-2.0.txt')
assert.equal(licenseEntries[0].content?.toString('utf8'), licenseText)
assert.equal(licenseEntries[1].packagePath, 'synthetic-export/licenses/CC-BY-4.0.txt')
assert.equal(licenseEntries[1].content?.toString('utf8'), contentLicenseText)
assert.equal(licenseEntries[2].packagePath, `synthetic-export/${SKILLPILOT_LICENSE_SCOPE_PATH}`)
assert.equal(licenseEntries[2].content?.toString('utf8'), scopeText.replaceAll('(LICENSE)', '(APACHE-2.0.txt)').replaceAll('(LICENSES/CC-BY-4.0.txt)', '(CC-BY-4.0.txt)'))
const licensePaths = new Set(licenseEntries.map((entry) => entry.packagePath.replace('synthetic-export/', '')))
assert.deepEqual(subjectExportLicenseIssues(licensePolicy, licensePaths), [])
assert.equal(subjectExportLicenseIssues(licensePolicy, new Set()).length, 3)
assert.equal(subjectExportLicenseIssues({ ...licensePolicy, projectScopePath: 'missing.md' }, licensePaths).length, 1)
assert.deepEqual(subjectExportLicenseIssues({ defaultSkillpilotDataLicense: 'CC-BY-4.0' }, new Set()), [])
assert.deepEqual(subjectExportLicenseIssues({ defaultSkillpilotDataLicense: 'Apache-2.0' }, new Set()), [])
assert.deepEqual(subjectExportLicenseIssues({ ...licensePolicy, defaultSkillpilotDataLicense: 'Apache-2.0' }, new Set([
  'licenses/APACHE-2.0.txt', 'licenses/SKILLPILOT-LICENSING.md',
])), [])
const packageLicense = buildPackageLicense({ packageId: 'synthetic-export', publicationProfile: 'release' })
assert(packageLicense.includes('SPDX-License-Identifier: Apache-2.0'))
assert(packageLicense.includes('SPDX-License-Identifier: CC-BY-4.0'))
assert(packageLicense.includes('licenses/CC-BY-4.0.txt'))
assert(packageLicense.includes('Official curriculum source material remains attributable to its original publishers and is not relicensed'))
assert(packageLicense.includes('not inferred from generator, provider or curation labels'))
assert(packageLicense.includes('no review or approval is advanced by this export'))
const thirdPartyImage = { provider: 'External artist', license: 'CC-BY-SA-4.0', reviewStatus: 'pilot', url: 'https://example.org/image.png' }
assert.deepEqual(sanitizeJsonForPackage({ resourceLinks: [thirdPartyImage] }, 'canonical-landscape'), { resourceLinks: [thirdPartyImage] })

const note = 'Focused AI correction review: see curricula/DE/Gymnasium/assessments/math/review.md. No human approval claimed.'
const input = {
  goals: [{
    id: 'local',
    description: 'Interpret \\(x\\) and explain the model limit.',
    examData: { reviewNote: note },
    sourceRef: 'curricula/DE/Gymnasium/assessments/math/draft.md#task-1',
    vocabularySource: '/data/math_deck.json',
    sourceExtractionPath: 'curricula/DE/Gymnasium/input/source.json',
  }],
}
const original = JSON.stringify(input)
assert.deepEqual(sanitizeJsonForPackage(input, 'canonical-landscape'), {
  goals: [{
    id: 'local',
    description: input.goals[0].description,
    examData: { reviewNote: 'Focused AI correction review: see review.md. No human approval claimed.' },
    sourceRef: 'draft.md#task-1',
    vocabularySource: 'data/cards/math_deck.json',
  }],
})
assert.equal(JSON.stringify(input), original, 'Export sanitation must not mutate authoring data')
assert.equal(
  sanitizeJsonForPackage('See [review](curricula/DE/Gymnasium/assessments/math/review.md#finding); then `app/public/data/deck.json`.', 'canonical-landscape'),
  'See [review](review.md#finding); then `data/cards/deck.json`.',
)
assert.equal(
  sanitizeJsonForPackage('Use \\(x\\); see curricula\\DE\\Gymnasium\\assessments\\review.md and /home/author/review.json.', 'canonical-landscape'),
  'Use \\(x\\); see review.md and review.json.',
)
assert.equal(
  sanitizeJsonForPackage('See curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/math.review.json', 'canonical-landscape'),
  'See data/mappings/DE-HE/upper/math.review.json',
)
const officialUrl = 'Original: https://example.org/curricula/DE/Gymnasium/curriculum.pdf'
assert.equal(sanitizeJsonForPackage(officialUrl, 'canonical-landscape'), officialUrl, 'Official links must not be rewritten as repository paths')
const longMappingSource = 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.q1-atomic-split-author-proposal-20261005-v1.q4-four-bounded-reviewed-20261013-v1.review.json'
const compactMappingName = subjectExportMappingFileName(basename(longMappingSource))
assert(compactMappingName.length <= 72 && compactMappingName.endsWith('.review.json'))
assert.equal(subjectExportMappingFileName(basename(longMappingSource)), compactMappingName,
  'long package filenames are deterministic and retain the review classifier')
assert.notEqual(subjectExportMappingFileName(`${'same-prefix-'.repeat(20)}a.review.json`),
  subjectExportMappingFileName(`${'same-prefix-'.repeat(20)}b.review.json`),
  'truncated names retain distinct source identities through a content-independent path hash')
assert.equal(sanitizeJsonForPackage(`${longMappingSource}#finding`, 'canonical-landscape'),
  `data/mappings/DE-HE/upper/${compactMappingName}#finding`,
  'internal mapping references use the exact shortened entry path and preserve fragments')
assert(`skillpilot-de-gymnasium-chemie-v0.1.0/data/mappings/DE-HE/upper/${compactMappingName}`.length <= 180)
const sourceArtifactName = subjectExportSourceArtifactFileName('curricula/DE/Gymnasium/input/DE-HE/upper/source.json')
assert.equal(sourceArtifactName.length, 76)
assert.equal(subjectExportSourceArtifactFileName('curricula\\DE\\Gymnasium\\input\\DE-HE\\upper\\source.json'), sourceArtifactName,
  'source artifact identities normalize separators and remain independent of the checkout root')
assert.notEqual(subjectExportSourceArtifactFileName('curricula/DE/Gymnasium/input/DE-BY/upper/source.json'), sourceArtifactName,
  'identical source basenames from different authored collections retain different artifact identities')
assert(`skillpilot-de-gymnasium-wirtschaftswissenschaften-v0.1.0/data/sources/DE-HE/upper/${sourceArtifactName}`.length <= 180)
for (const unsafeSourcePath of ['/home/author/source.json', '../source.json', 'C:\\source.json']) {
  assert.throws(() => subjectExportSourceArtifactFileName(unsafeSourcePath), /repository-relative/u)
}

const economics = readJson('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const visualGoal = economics.goals.find((goal: { resourceLinks?: Array<{ type?: string }> }) =>
  goal.resourceLinks?.some((link) => link.type === 'goal-visualization'))
assert(visualGoal, 'the actual Economics landscape contains an active visualization')
const visualInput = { goals: [visualGoal] }
const originalVisualInput = JSON.stringify(visualInput)
const visualizationErrors: string[] = []
const [visualAsset] = selectGoalVisualizationAssets(visualInput, 'wirtschaftswissenschaften', visualizationErrors)
assert.deepEqual(visualizationErrors, [])
assert(visualAsset)
assert.equal(visualAsset.record.packagePath,
  subjectExportGoalVisualizationPath('wirtschaftswissenschaften', visualGoal.id, '.png'))
assert(`skillpilot-de-gymnasium-wirtschaftswissenschaften-v0.1.0/${visualAsset.record.packagePath}`.length <= 180,
  'the actual Economics visualization fits the unchanged Windows extraction-path limit')
const sourceVisualBytes = readFileSync(visualAsset.sourcePath)
assert.equal(visualAsset.record.bytes, sourceVisualBytes.length)
assert.equal(visualAsset.record.sha256, createHash('sha256').update(sourceVisualBytes).digest('hex'),
  'only the package path changes; the exact source asset remains hash-bound')
const rewrittenVisual = sanitizeJsonForPackage(visualInput, 'canonical-landscape', undefined,
  new Map([[visualAsset.sourcePublicUrl, visualAsset.record.publicUrl]])) as typeof visualInput
assert.equal(rewrittenVisual.goals[0].resourceLinks[visualAsset.record.order].url, visualAsset.record.publicUrl,
  'the copied canonical link and visualization index point to the same compact binary path')
assert.equal(JSON.stringify(visualInput), originalVisualInput, 'source links and authored metadata remain unchanged')
for (const path of [visualAsset.record.packagePath,
  legacySubjectExportGoalVisualizationPath('wirtschaftswissenschaften', visualGoal.id, '.png')]) {
  assert(isSubjectExportGoalVisualizationPath(path, 'wirtschaftswissenschaften', visualGoal.id, '.png'),
    'validation recognizes the exact compact and historical deterministic layouts')
}
assert.equal(isSubjectExportGoalVisualizationPath(visualAsset.record.packagePath.replace('image.png', 'arbitrary.png'),
  'wirtschaftswissenschaften', visualGoal.id, '.png'), false, 'unrecognized asset layouts remain invalid')
assert.equal(
  sanitizeJsonForPackage('Unsupported asset: app/public/other.json', 'canonical-landscape'),
  'Unsupported asset: app/public/other.json',
  'Unsupported local paths must remain visible to the fail-closed package validator',
)

// A declaration resolves a legacy cross-subject dependency, not an arbitrary
// typo. Cover nested views, direct entries and subtree roots, and keep missing
// local/foreign IDs blocking even when another foreign goal is declared.
const view: Parameters<typeof unresolvedCompositionGoalReferences>[0] = {
  viewId: 'fixture-physics-view',
  landscapeId: 'fixture-physics',
  rootNodes: [{ kind: 'structure', id: 'root', children: [
    { kind: 'goalEntry', goalId: 'local' },
    { kind: 'goalEntry', goalId: 'external-entry', projectionRole: 'prerequisiteOnly' },
    { kind: 'canonicalSubtree', goalId: 'external-subtree', projectionRole: 'prerequisiteOnly' },
  ] }],
}
const local = new Set(['local'])
const external = new Set(['external-entry', 'external-subtree'])
assert.deepEqual(unresolvedCompositionGoalReferences(view, local, external), [])
assert.deepEqual(unresolvedCompositionGoalReferences(view, local, new Set()), ['external-entry', 'external-subtree'])
assert.deepEqual(unresolvedCompositionGoalReferences(view, local, new Set(['external-entry'])), ['external-subtree'])
assert.deepEqual(unresolvedCompositionGoalReferences(
  { rootNodes: [{ kind: 'goalEntry', goalId: 'undeclared' }] }, local, external,
), ['undeclared'])
assert.deepEqual(unresolvedCompositionGoalReferences(
  { rootNodes: [{ kind: 'goalEntry', goalId: 'local-typo' }] }, local, external,
), ['local-typo'])

const externalOwners = new Map([...external].map((goalId) => [goalId, {
  goalId, targetLandscapeId: 'fixture-mathematics', targetFrameworkId: null,
  targetSubject: 'Mathematik', targetTitle: goalId,
}]))
const fixtureViews = [{ path: 'data/views/fixture.view.json', data: view }]
const compositionErrors: string[] = []
const viewReferences = collectExternalCompositionGoalReferences(fixtureViews, local, externalOwners, compositionErrors)
assert.deepEqual(compositionErrors, [])
assert.equal(viewReferences.length, 2, 'explicit entries and subtree roots receive separate source-bound declarations')
const validatedViewReferences = validateExternalCompositionGoalReferences(viewReferences, fixtureViews, local)
assert.deepEqual(validatedViewReferences.issues, [])
assert.deepEqual([...validatedViewReferences.byViewPath.get(fixtureViews[0].path) ?? []], [...external])
for (const replacement of [
  { fromViewId: 'another-view' },
  { fromViewPath: 'data/views/another.view.json' },
  { targetGoalId: 'unknown-goal' },
  { targetLandscapeId: null },
  { nodeKind: 'canonicalSubtree' },
  { projectionRole: 'target' },
]) {
  const invalid = structuredClone(viewReferences)
  Object.assign(invalid[0] as Record<string, unknown>, replacement)
  assert(validateExternalCompositionGoalReferences(invalid, fixtureViews, local).issues.length > 0,
    'invalid view ownership, goal, role and node-kind declarations must fail closed')
}
for (const conflictingNode of [
  { kind: 'goalEntry', goalId: 'external-entry', projectionRole: 'target' },
  { kind: 'canonicalSubtree', goalId: 'external-entry', projectionRole: 'prerequisiteOnly' },
]) {
  const conflictingView = {
    ...view,
    rootNodes: [...(Array.isArray(view.rootNodes) ? view.rootNodes : []), conflictingNode],
  }
  const checked = validateExternalCompositionGoalReferences(
    viewReferences, [{ path: fixtureViews[0].path, data: conflictingView }], local,
  )
  assert(checked.issues.length > 0,
    'one legitimate prerequisite occurrence cannot authorize a second target or undeclared node-kind occurrence')
  assert.equal(checked.byViewPath.get(fixtureViews[0].path)?.has('external-entry'), false,
    'a mixed external goal is excluded from the declared composition closure')
}
const unknownViewErrors: string[] = []
collectExternalCompositionGoalReferences([{ path: 'data/views/unknown.view.json', data: {
  viewId: 'unknown', rootNodes: [{ kind: 'goalEntry', goalId: 'unknown', projectionRole: 'prerequisiteOnly' }],
} }], local, externalOwners, unknownViewErrors)
assert.equal(unknownViewErrors.length, 1, 'unknown canonical owners cannot be declared as external prerequisites')

// Exercise the current regressions with the actual production sanitizer and
// view resolver. These checks only read the curricula; no QA state is written.
const canonicalDir = 'curricula/DE/Gymnasium/canonical'
const math = readJson(`${canonicalDir}/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`)
const sanitizedMath = JSON.stringify(sanitizeJsonForPackage(math, 'canonical-landscape'))
assert(!sanitizedMath.includes('curricula/DE/Gymnasium/'), 'Exported Mathematics must not contain repository-local paths')

type Goal = { id: string, contains?: string[], requires?: string[] }
const physics = readJson(`${canonicalDir}/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`) as { goals: Goal[] }
const sanitizedPhysics = JSON.stringify(sanitizeJsonForPackage(
  readJson(`${canonicalDir}/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`), 'canonical-landscape',
))
assert(!sanitizedPhysics.includes('curricula/DE/Gymnasium/'), 'Exported Physics must not contain repository-local paths')
const physicsIds = new Set(physics.goals.map((goal) => goal.id))
const declaredPhysicsDependencies = new Set(physics.goals.flatMap((goal) => [
  ...(goal.contains ?? []), ...(goal.requires ?? []),
]).filter((id) => !physicsIds.has(id)))
const foreignGoalIds = new Set(readdirSync(resolve(repoRoot, canonicalDir))
  .filter((file) => file.endsWith('.json') && file !== 'DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
  .flatMap((file) => (readJson(`${canonicalDir}/${file}`).goals as Goal[]).map((goal) => goal.id)))
for (const id of declaredPhysicsDependencies) {
  assert(foreignGoalIds.has(id), `External Physics dependency must have a canonical owner: ${id}`)
}
const physicsViewDir = 'curricula/DE/Gymnasium/composition-views/physik'
const physicsViews = readdirSync(resolve(repoRoot, physicsViewDir))
  .filter((file) => file.endsWith('.view.json'))
  .map((file) => ({ path: `data/views/${file}`, data: readJson(`${physicsViewDir}/${file}`) }))
const physicsViewErrors: string[] = []
const physicsViewReferences = collectExternalCompositionGoalReferences(
  physicsViews, physicsIds, canonicalGoalIndex(resolve(repoRoot, `${canonicalDir}/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`)), physicsViewErrors,
)
assert.deepEqual(physicsViewErrors, [], 'all external Physics composition prerequisites have canonical owners')
const validatedPhysicsViewReferences = validateExternalCompositionGoalReferences(physicsViewReferences, physicsViews, physicsIds)
assert.deepEqual(validatedPhysicsViewReferences.issues, [])
const bbViewPrerequisites = validatedPhysicsViewReferences.byViewPath.get('data/views/de-bb-gk.view.json')
assert(bbViewPrerequisites?.has('09f47964-2cd0-410e-93ee-9632b582fc91'),
  'the source-bound Mathematics function concept is retained even without a direct Physics prerequisite edge')
let checkedViews = 0
for (const { path, data } of physicsViews) {
  assert.deepEqual(unresolvedCompositionGoalReferences(
    data, physicsIds, new Set([...declaredPhysicsDependencies, ...(validatedPhysicsViewReferences.byViewPath.get(path) ?? [])]),
  ), [], `${path}: every composition reference must be local or declared external`)
  checkedViews += 1
}
assert(checkedViews > 0)
process.stdout.write(`Subject export contracts passed: own-work licensing, retained third-party terms, sanitation, unresolved-reference negatives, current Mathematics, ${checkedViews} Physics views.\n`)
