import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SKILLPILOT_DATA_LICENSE_CATEGORY,
  SKILLPILOT_LICENSE_SCOPE_PATH,
  GOAL_VISUALIZATION_INDEX_SCHEMA,
  selectGoalVisualizationAssets,
  buildPackageLicense,
  collectExternalGoalReferences,
  buildSubjectExportLicensePolicy,
  licenseCategoryForRepoSource,
  sanitizeJsonForPackage,
  subjectExportLicenseEntries,
} from './buildSkillpilotExportPackage'
import {
  declaredCanonicalExternalGoalIds,
  declaredExternalGoalIdsForView,
  isKnownSubjectExportLicenseCategory,
  subjectExportLicenseIssues,
  unresolvedCompositionGoalReferences,
  collectCanonicalGoalVisualizations,
} from './validateSubjectExportPackages'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readJson = (path: string) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))

const trafficId = '4a2bf015-052b-4af0-aed7-324259fa1a8a'
const trafficGoal = readJson('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
  .goals.find((goal: { id: string }) => goal.id === trafficId)
const trafficUrl = `/assets/goal-visualizations/physik/${trafficId}/model-boundaries-v2/${trafficId}.png`
const nestedGoal = structuredClone(trafficGoal)
nestedGoal.resourceLinks.find((link: { type: string }) => link.type === 'goal-visualization').url = trafficUrl
const nestedCanonical = { goals: [nestedGoal] }
const packageErrors: string[] = []
const selectedAssets = selectGoalVisualizationAssets(nestedCanonical, 'physik', packageErrors)
assert.deepEqual(packageErrors, [], 'versioned actual asset passes export selection and file-signature/hash inspection')
assert.equal(selectedAssets.length, 1)
assert.equal(selectedAssets[0].record.packagePath, trafficUrl.slice(1))
assert.equal(selectedAssets[0].record.publicUrl, trafficUrl)
assert.equal(selectedAssets[0].record.mediaType, 'image/png')
assert.equal(selectedAssets[0].record.sha256, 'b61d17e625e12d1a28108c92baa63743b223f5947b02fc7b5ad4ed03b52c6dd0')
assert.deepEqual(collectCanonicalGoalVisualizations(nestedCanonical, 'physik').issues, [])
const schemaProperties = GOAL_VISUALIZATION_INDEX_SCHEMA.properties.assets.items.properties
for (const [property, value] of [['packagePath', trafficUrl.slice(1)], ['publicUrl', trafficUrl]] as const) {
  const pattern = new RegExp(schemaProperties[property].pattern, 'u')
  assert(pattern.test(value), 'export index schema accepts the same nested path')
  for (const unsafe of [value + '\n', value + '?x=1', value + '#x', value.replace('/model-boundaries-v2/', '/../'), value.replace('/model-boundaries-v2/', '/%2e%2e/')]) {
    assert.equal(pattern.test(unsafe), false, `index schema rejects ${JSON.stringify(unsafe)}`)
  }
}
for (const badUrl of [trafficUrl.replace('/physik/', '/mathematik/'), trafficUrl.replace(`/${trafficId}/`, '/wrong-owner/'), trafficUrl.replace(`${trafficId}.png`, 'wrong-name.png'), trafficUrl.replace('/model-boundaries-v2/', '/%252e%252e/'), trafficUrl + '\n']) {
  const badGoal = structuredClone(nestedGoal)
  badGoal.resourceLinks.find((link: { type: string }) => link.type === 'goal-visualization').url = badUrl
  const errors: string[] = []
  assert.equal(selectGoalVisualizationAssets({ goals: [badGoal] }, 'physik', errors).length, 0)
  assert(errors.length > 0, 'export builder preserves path safety/subject/goal/filename ownership')
  assert(collectCanonicalGoalVisualizations({ goals: [badGoal] }, 'physik').issues.length > 0, 'package validator uses the same safe path and owner boundaries')
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
assert.equal(
  sanitizeJsonForPackage('Unsupported asset: app/public/other.json', 'canonical-landscape'),
  'Unsupported asset: app/public/other.json',
  'Unsupported local paths must remain visible to the fail-closed package validator',
)

// A declaration resolves a legacy cross-subject dependency, not an arbitrary
// typo. Cover nested views, direct entries and subtree roots, and keep missing
// local/foreign IDs blocking even when another foreign goal is declared.
const view: Parameters<typeof unresolvedCompositionGoalReferences>[0] = {
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
const physicsViewDir = 'curricula/DE/Gymnasium/composition-views/physik'
const physicsViewFiles = readdirSync(resolve(repoRoot, physicsViewDir)).filter((file) => file.endsWith('.view.json'))
const dependencyErrors: string[] = []
const declaredRecords = collectExternalGoalReferences(
  resolve(repoRoot, canonicalDir, 'DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), physics, dependencyErrors,
  physicsViewFiles.map((file) => readJson(`${physicsViewDir}/${file}`)),
) as Array<{ relation: string, fromGoalId?: string, fromViewId?: string, targetGoalId: string }>
assert.deepEqual(dependencyErrors, [])
const declaredPhysicsDependencies = new Set(declaredRecords.map((record) => record.targetGoalId))
const viewOnlyRecord = declaredRecords.find((record) => record.relation === 'composition-view' && record.targetGoalId === 'e4f3a846-d2b8-4ee5-b0a2-4dc2833b2ecb')
assert(viewOnlyRecord?.fromViewId, 'View-only external definitions must be explicitly declared')
assert(!viewOnlyRecord.fromGoalId, 'A composition declaration must not invent a canonical edge')
assert(!declaredCanonicalExternalGoalIds([viewOnlyRecord]).has(viewOnlyRecord.targetGoalId), 'View declaration cannot authorize a canonical edge')
const supportView = { viewId: viewOnlyRecord.fromViewId, rootNodes: [{ kind: 'goalEntry', goalId: viewOnlyRecord.targetGoalId, projectionRole: 'prerequisiteOnly' }] }
assert(declaredExternalGoalIdsForView(supportView, [viewOnlyRecord]).has(viewOnlyRecord.targetGoalId))
assert(!declaredExternalGoalIdsForView({ ...supportView, viewId: 'another-view' }, [viewOnlyRecord]).has(viewOnlyRecord.targetGoalId))
assert(!declaredExternalGoalIdsForView({ ...supportView, rootNodes: [{ kind: 'goalEntry', goalId: viewOnlyRecord.targetGoalId }] }, [viewOnlyRecord]).has(viewOnlyRecord.targetGoalId))
assert(!declaredExternalGoalIdsForView(supportView, [{ ...viewOnlyRecord, projectionRole: 'target' }]).has(viewOnlyRecord.targetGoalId))
assert(!declaredExternalGoalIdsForView({ ...supportView, rootNodes: [...supportView.rootNodes, { kind: 'goalEntry', goalId: viewOnlyRecord.targetGoalId }] }, [viewOnlyRecord]).has(viewOnlyRecord.targetGoalId), 'A support declaration must not authorize a second target occurrence')
const unknownErrors: string[] = []
collectExternalGoalReferences(resolve(repoRoot, canonicalDir, 'DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), physics, unknownErrors,
  [{ viewId: 'negative-view', rootNodes: [{ kind: 'goalEntry', goalId: 'unknown-definition', projectionRole: 'prerequisiteOnly' }] }])
assert(unknownErrors.some((error) => error.includes('Unresolved external composition-view reference')))
const targetErrors: string[] = []
const forbiddenTargetRecords = collectExternalGoalReferences(resolve(repoRoot, canonicalDir, 'DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), physics, targetErrors,
  [{ viewId: 'foreign-target-negative', rootNodes: [{ kind: 'goalEntry', goalId: 'e4f3a846-d2b8-4ee5-b0a2-4dc2833b2ecb' }] }]) as Array<{ relation: string }>
assert(targetErrors.some((error) => error.includes('External composition-view target is unsupported')))
assert(!forbiddenTargetRecords.some((record) => record.relation === 'composition-view'))
const missingIdErrors: string[] = []
collectExternalGoalReferences(resolve(repoRoot, canonicalDir, 'DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), physics, missingIdErrors, [{ rootNodes: [] }])
assert(missingIdErrors.some((error) => error.includes('missing its viewId')))
const foreignGoalIds = new Set(readdirSync(resolve(repoRoot, canonicalDir))
  .filter((file) => file.endsWith('.json') && file !== 'DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
  .flatMap((file) => (readJson(`${canonicalDir}/${file}`).goals as Goal[]).map((goal) => goal.id)))
for (const id of declaredPhysicsDependencies) {
  assert(foreignGoalIds.has(id), `External Physics dependency must have a canonical owner: ${id}`)
}
let checkedViews = 0
for (const file of readdirSync(resolve(repoRoot, physicsViewDir)).filter((file) => file.endsWith('.view.json'))) {
  assert.deepEqual(unresolvedCompositionGoalReferences(
    readJson(`${physicsViewDir}/${file}`), physicsIds, declaredExternalGoalIdsForView(readJson(`${physicsViewDir}/${file}`), declaredRecords),
  ), [], `${file}: every composition reference must be local or declared external`)
  checkedViews += 1
}
assert(checkedViews > 0)
process.stdout.write(`Subject export contracts passed: own-work licensing, retained third-party terms, sanitation, unresolved-reference negatives, current Mathematics, ${checkedViews} Physics views.\n`)
