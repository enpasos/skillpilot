// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const expectedPath=resolve(own,'../biologie-stoffwechsel-nineteen-native-technical-20261008-v1/native/full392.current-raster.book-model.json')
const expected=JSON.parse(readFileSync(expectedPath,'utf8'))
const {model}=await loadGoalBookBuildInputs(resolve(root,'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
assert.equal(model.pages.length,392)
assert.equal(stableGoalBookJson(model.pages),stableGoalBookJson(expected.pages),'All whole current392 pages must equal the actually reviewed native frame')
writeFileSync(resolve(own,'actual-active392-whole-page-frame.proof.json'),JSON.stringify({observedAt:new Date().toISOString(),ordinaryCurrentPublicLoader:true,actualPageCount:392,all392WholePageObjectsExactToActualReviewedNativeFrame:true,unselected373WholePagesExact:true,originalReviewedModel:{path:relative(root,expectedPath),sha256:createHash('sha256').update(readFileSync(expectedPath)).digest('hex')},actualActiveModelDigest:model.digest,newScientificReviewByIntegrator:false,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log('PASS: ordinary current public loader; all392 whole pages equal the genuine blind-reviewed native frame')
