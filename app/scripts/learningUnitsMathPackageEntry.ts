import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest, mathCanonicalPath } from './learningUnitsMathAuthoring'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export function derivePackageEntry(overview: any, mathematics: any, config: any) {
  assert.equal(config.schemaVersion, 1); assert.notEqual(config.entryLandscapeId, overview.landscapeId)
  assert.notEqual(config.entryLandscapeId, mathematics.landscapeId)
  assert.equal(mathematics.landscapeId, config.mathematicsLandscapeId)
  assert.ok(mathematics.goals.some((goal: any) => goal.id === config.mathematicsRootGoalId))
  assert.equal(overview.goals.length, 1); assert.notEqual(config.entryRootGoalId, overview.goals[0].id)
  assert.ok(!mathematics.goals.some((goal: any) => goal.id === config.entryRootGoalId), 'Entry root collides with an existing Mathematics identity')
  const entry = structuredClone(overview)
  entry.landscapeId = config.entryLandscapeId
  entry.frameworkId = 'canonical-gymnasium-mathematics-entry-v1'
  entry.subject = 'Mathematik'
  entry.title = 'Gymnasium Mathematik – Einstieg'; entry.titleEn = 'Gymnasium Mathematics – Entry'
  entry.description = 'Einstieg in die unveränderte Gymnasium-Mathematik mit ausdrücklicher Auswahl von Bundesland, Lernstufe, Dauer und Kursprofil.'
  entry.descriptionEn = 'Entry into unchanged Gymnasium Mathematics with explicit jurisdiction, stage, duration and course profile selection.'
  const rewrite = (value: any): any => {
    if (Array.isArray(value)) return value.map(rewrite)
    if (!value || typeof value !== 'object') return value
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key,
      key === 'landscapeIds' ? [config.mathematicsLandscapeId]
        : ['landscapeId', 'targetLandscapeId'].includes(key) && item === overview.landscapeId ? config.entryLandscapeId : rewrite(item)]))
  }
  entry.personalizationFlow = rewrite(overview.personalizationFlow)
  const goal = structuredClone(overview.goals[0])
  goal.id = config.entryRootGoalId; goal.shortKey = 'gymnasium_mathematics_package_entry'
  goal.title = entry.title; goal.titleEn = entry.titleEn; goal.description = entry.description; goal.descriptionEn = entry.descriptionEn
  goal.type = 'cluster'; delete goal.nodeKind; goal.semanticKind = 'programStructure'
  goal.contains = [config.mathematicsRootGoalId]; goal.requires = []
  goal.weight = mathematics.goals.filter((item: any) => !item.contains?.length).length
  goal.tags = ['root', 'canonical', 'school:Gymnasium']
  goal.dimensionTags = { framework: entry.frameworkId, demandLevel: 'AB2', processCompetencies: [], guidingIdeas: [], phase: 'Programm', area: 'Mathematik', topicCode: 'CANONICAL.GYMNASIUM.MATHEMATICS.ENTRY' }
  goal.sourceRef = `curricula/${config.originalOverviewPath}`; delete goal.extendedData
  entry.goals = [goal]
  assert.deepEqual(entry.filters, overview.filters, 'Entry filters must retain the exact reviewed original')
  return entry
}
function main() {
  const config = JSON.parse(readFileSync(resolve(root, 'app/scripts/config/learning-units/math-package-entry.json'), 'utf8'))
  const original = readFileSync(resolve(root, 'curricula', config.originalOverviewPath), 'utf8')
  const mathematics = JSON.parse(readFileSync(resolve(root, mathCanonicalPath), 'utf8'))
  const entry = derivePackageEntry(JSON.parse(original), mathematics, config)
  const entryBytes = `${JSON.stringify(entry, null, 2)}\n`
  const derivation = { schemaVersion: 1, semantics: 'reviewed-mathematics-package-entry-v1',
    originalOverviewPath: config.originalOverviewPath, originalOverviewSha256: digest(original),
    entryPath: config.entryPath, entrySha256: digest(entryBytes), entryLandscapeId: config.entryLandscapeId,
    entryRootGoalId: config.entryRootGoalId, mathematicsLandscapeId: config.mathematicsLandscapeId,
    mathematicsRootGoalId: config.mathematicsRootGoalId, reviewRef: config.reviewRef }
  for (const [path, bytes] of [[config.entryPath, entryBytes], [config.derivationPath, `${JSON.stringify(derivation, null, 2)}\n`]]) {
    const destination = resolve(root, 'curricula', path)
    if (process.argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), bytes, `Package entry drift ${path}`)
    else { mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, bytes) }
  }
  console.log(JSON.stringify(derivation))
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
