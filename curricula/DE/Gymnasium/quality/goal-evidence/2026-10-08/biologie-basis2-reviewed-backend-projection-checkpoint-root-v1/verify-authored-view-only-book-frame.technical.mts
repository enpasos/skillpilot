// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs, stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
const own=dirname(fileURLToPath(import.meta.url)), root=resolve('.')
const {model}=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)
assert.equal(model.pages.length,394)
const frame={pageCount:model.pages.length,modelDigest:model.digest,wholePageSha256:createHash('sha256').update(stableGoalBookJson(model.pages)).digest('hex')}
if(process.argv.includes('--before')) {
  writeFileSync(resolve(own,'whole394-national-book-frame.before-view-completion.actual.json'),JSON.stringify(frame,null,2)+'\n',{flag:'wx'})
} else {
  const before=JSON.parse(readFileSync(resolve(own,'whole394-national-book-frame.before-view-completion.actual.json'),'utf8'))
  assert.deepEqual(frame,before)
  writeFileSync(resolve(own,'whole394-national-book-frame.after-view-completion.exact.actual.json'),JSON.stringify({schemaVersion:1,all394WholePageAndSourceAndResourceContextsExact:true,before,after:frame,newScientificReview:false,humanApproval:false},null,2)+'\n',{flag:'wx'})
}
console.log(JSON.stringify(frame))
