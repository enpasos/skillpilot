import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { parseAndValidateGoalBookModel, writeGoalBookModel } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates.ts'

const b = dirname(fileURLToPath(import.meta.url))
const json = async (name: string) => JSON.parse(await readFile(resolve(b, name), 'utf8'))
const ids: string[] = await json('scope20.json')
const base = parseAndValidateGoalBookModel(await json('native/full378.current-native.book-model.json'))
assert.equal(base.pages.length, 378)
const landscape = await json('frozen-inputs/01.DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const goals = new Map<string, any>(landscape.goals.map((goal: any) => [goal.id, goal]))
const selected = new Set(ids)
const nativeOrder = base.pages.filter(page => selected.has(page.goalId)).map(page => page.goalId)
assert.deepEqual(new Set(nativeOrder), selected)
const subset = buildGoalDescriptionRolloutSubsetModel({
  baseModel: base, goalIds: nativeOrder,
  bookId: 'chemie-q3-whole20-native-context-inactive-20261008-v1',
  title: 'Chemie Q3 – ganze 20 aktuelle Ziele im nativen 378-Ziel-Kontext',
})
await writeGoalBookModel(subset, resolve(b, 'native/whole20.subset.book-model.json'))
const basePages = new Map(base.pages.map((page) => [page.goalId, page]))
const entries = ids.map((goalId) => {
  const goal = goals.get(goalId)!
  const page = basePages.get(goalId)!
  assert.equal(page.description, goal.description)
  assert.equal(page.title, goal.title)
  assert.deepEqual(new Set([...page.requires, ...page.externalPrerequisites].map(r => r.goalId)), new Set(goal.requires))
  return {
    goalId,
    currentTitleDe: goal.title,
    currentTitleEn: goal.titleEn,
    currentDescriptionDe: goal.description,
    currentDescriptionEn: goal.descriptionEn,
    fullCurrentNativePage: page,
    subsetPage: subset.pages.find(p => p.goalId === goalId),
    canonicalContext: buildGoalDescriptionCanonicalContext(goal),
    actualRequiresGoals: goal.requires.map((id: string) => goals.get(id)),
    actualParents: landscape.goals.filter((g: any) => g.contains?.includes(goalId)),
  }
})
await writeFile(resolve(b, 'native/whole20.current-native-pure-book-contexts.actual.json'), JSON.stringify({
  status: 'inactive-author-context', basePageCount: 378, selectedPageCount: 20,
  actualBuilder: 'loadGoalBookBuildInputs/buildGoalBookModel',
  actualSubsetBuilder: 'buildGoalDescriptionRolloutSubsetModel',
  actualCanonicalContextBuilder: 'buildGoalDescriptionCanonicalContext',
  baseDigest: base.digest, subsetDigest: subset.digest,
  privateLearnerData: false, publicationClaim: false, descriptionReviewCompleted: false,
  entries,
}, null, 2) + '\n')
const config = await json('native/p20.author-candidate.config.json')
const candidates = await json('native/p20.native-materializer.candidates.json')
const api = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })
const cli = (await readFile(resolve(b, 'native/p20.author-candidate.review.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse)
assert.deepEqual(api, cli)
assert.equal(api.length, 20)
assert.ok(api.every(r => r.schemaVersion === 2 && r.status === 'needs_human_review' && r.reviewAuthority === 'ai_candidate' && r.profile.applicationCaseBriefs.length === 2))
await writeFile(resolve(b, 'native/whole20.native-context-api.actual.json'), JSON.stringify({
  completedAt: new Date().toISOString(), exitCode: 0,
  fullCurrentNativePages: 378, selectedWholeCurrentNativeContexts: 20,
  nativePApiRecords: 20, nativePStandardCliRecords: 20, byteEquivalentRecordObjects: true,
  applicationCases: 40, nativeClosedSchemaVersion: 2,
  allBodiesAndDirectRequiresMatched: true, activeWrite: false,
  independentReviewCompleted: false, humanApproval: false,
}, null, 2) + '\n')
console.log('Actual native context/API check: full378,whole20,closed-v2 P20,40 full cases; CLI/API equal; exit0.')
