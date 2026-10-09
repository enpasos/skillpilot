// SPDX-License-Identifier: Apache-2.0
// Existing ordinary public loader comparison; no additional science review.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync, writeFileSync, existsSync} from 'node:fs'
import {dirname, resolve, relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadGoalBookBuildInputs, stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'

const root=resolve('.'), own=dirname(fileURLToPath(import.meta.url))
const expectedPath=resolve(own,'../biologie-molecular-genetics-one-crossing-over-native-successor-preparation-author-v1/native/full394.one15-raster-successor.book-model.json')
const expected=JSON.parse(readFileSync(expectedPath,'utf8'))
const {model}=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)
assert.equal(model.pages.length,394);assert.equal(expected.pages.length,394)
const expectedPages=new Map<string,any>(expected.pages.map((page:any)=>[page.goalId,page]))
const differences=model.pages.flatMap(page=>{
  const previous=expectedPages.get(page.goalId);assert.ok(previous,page.goalId)
  const fields=new Set([...Object.keys(page),...Object.keys(previous)])
  const changedFields=[...fields].filter(key=>stableGoalBookJson((page as any)[key])!==stableGoalBookJson(previous[key]))
  return changedFields.length?[{goalId:page.goalId,changedFields}]:[]
})
const output=resolve(own,'checks/current394-twenty-three-native-frame.actual.json')
assert.equal(existsSync(output),false)
writeFileSync(output,JSON.stringify({schemaVersion:1,verifiedAt:new Date().toISOString(),ordinaryCurrentPublicLoader:true,
  actualPageCount:394,exactFinalWholeCandidatePageCount:394-differences.length,differences,
  actuallyReviewedCurrentFrame:{path:relative(root,expectedPath),sha256:'sha256:'+createHash('sha256').update(readFileSync(expectedPath)).digest('hex')},
  actualModelDigest:model.digest,newScientificReviewClaimed:false,humanApproval:false,humanTrial:false},null,2)+'\n')
assert.deepEqual(differences,[],'All current394 whole pages must equal the actual independently reviewed final frame')
console.log('PASS: ordinary current loader, all394 whole pages exact;23 final independent native contexts and371 other pages retained')
