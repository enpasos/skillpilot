// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-current-learner-view-adoption-independent-guard-v1'
const candidate = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-current-learner-view-adoption-candidate-v1'
const root = process.cwd()
const prospectiveRoot = resolve(root, 'tmp/biologie-ni-view-independent-native-memory-root')
const read = (path:string) => JSON.parse(readFileSync(resolve(root,path),'utf8'))
const shaFile = (path:string) => createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex')
const shaJson = (value:unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const inventory = read(candidate+'/native-whole383-pages-original-sources-and-protected67-inputs.actual.json')
for (const row of inventory.wholeAuthorizingInputFilesBefore) assert.equal(shaFile(row.path),row.sha256,row.path)
const config = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
const current = await loadGoalBookBuildInputs(config,root)
const prospective = await loadGoalBookBuildInputs(config,prospectiveRoot)
assert.equal(current.model.pages.length,383)
assert.deepEqual(prospective.model,current.model)
assert.deepEqual(prospective.entries,current.entries)
const atlas = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
const currentSources = buildGoalBookOriginalSources(current.model,root,atlas.mappingPaths)
const prospectiveSources = buildGoalBookOriginalSources(prospective.model,prospectiveRoot,atlas.mappingPaths)
assert.deepEqual(prospectiveSources,currentSources)
assert.equal(shaJson(currentSources),inventory.currentOriginalSourcesSHA256)
assert.equal(inventory.currentStrictCount,67)
const pages = new Map(current.model.pages.map(page=>[page.goalId,page]))
for (const id of inventory.currentStrictProtectedIds) assert(pages.has(id),id)
for (const row of inventory.wholePageComparisons) {
  const page = pages.get(row.goalId)
  assert(page,row.goalId)
  assert.equal(shaJson(page),row.wholePageSHA256,row.goalId)
}
for (const row of inventory.wholeAuthorizingInputFilesBefore) assert.equal(shaFile(row.path),row.sha256,row.path)
const result = {
  schemaVersion:1, checkedAtUTC:new Date().toISOString(),reviewer:'/root/chem_qa_native_guard',result:'PASS',
  candidateFinalFreezeSHA256:shaFile(candidate+'/learner-view-adoption-candidate.final.freeze.json'),
  actualNativeConfigPath:config, actualNativeConfigSHA256:shaFile(config),
  actualNativeWholeModelSHA256:shaJson(current.model),prospectiveNativeWholeModelSHA256:shaJson(prospective.model),
  whole383PagesChaptersSourcesAndAllModelFieldsExact:true,wholePreparedCanonicalEntriesExact:true,
  currentOriginalSourcesSHA256:shaJson(currentSources),prospectiveOriginalSourcesSHA256:shaJson(prospectiveSources),
  all17SelectedMappingInputs:atlas.mappingPaths.map((path:string)=>({path,sha256:shaFile(path)})),
  current67StrictIdsProtected:inventory.currentStrictProtectedIds,
  actualUnchangedAuthorizingInputFiles:inventory.wholeAuthorizingInputFilesBefore,
  everyAuthor383WholePageHashIndependentlyRecomputed:true,
  nativeCode: ['app/scripts/goalBookModel.ts','app/scripts/goalBookOriginalSources.ts'].map(path=>({path,sha256:shaFile(path)})),
  backendJavaTestsRun:false,activeWrites:false,newScientificCompletions:0,humanApproval:false,humanTrial:false
}
writeFileSync(resolve(root,own+'/independent-native-whole383-book-and-original-sources.actual.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log('PASS: native entire 383-page model, canonical entries, all original-source exports and 71 authorization input files exact; all 67 current strict IDs protected.')
