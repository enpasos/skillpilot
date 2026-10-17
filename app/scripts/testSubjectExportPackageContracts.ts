import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SKILLPILOT_DATA_LICENSE_CATEGORY,
  SKILLPILOT_LICENSE_SCOPE_PATH,
  buildPackageLicense,
  buildSubjectExportLicensePolicy,
  licenseCategoryForRepoSource,
  sanitizeJsonForPackage,
  subjectExportLicenseEntries,
} from './buildSkillpilotExportPackage'
import {
  isKnownSubjectExportLicenseCategory,
  subjectExportLicenseIssues,
  unresolvedCompositionGoalReferences,
} from './validateSubjectExportPackages'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readJson = (path: string) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))

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
let checkedViews = 0
for (const file of readdirSync(resolve(repoRoot, physicsViewDir)).filter((file) => file.endsWith('.view.json'))) {
  assert.deepEqual(unresolvedCompositionGoalReferences(
    readJson(`${physicsViewDir}/${file}`), physicsIds, declaredPhysicsDependencies,
  ), [], `${file}: every composition reference must be local or declared external`)
  checkedViews += 1
}
assert(checkedViews > 0)
process.stdout.write(`Subject export contracts passed: own-work licensing, retained third-party terms, sanitation, unresolved-reference negatives, current Mathematics, ${checkedViews} Physics views.\n`)
