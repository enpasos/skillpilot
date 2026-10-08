// SPDX-License-Identifier: Apache-2.0
// Real whole392 candidate loader and affected-page inspection; no approval.
import assert from 'node:assert/strict'
import {writeFileSync, readFileSync, existsSync} from 'node:fs'
import {dirname, resolve, relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadGoalBookBuildInputs, stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
const root=resolve('.'), own=dirname(fileURLToPath(import.meta.url))
const before=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)
const after=await loadGoalBookBuildInputs(relative(root,resolve(own,'source-atlas/book.source-only.inactive-v2.config.json')),root)
assert.equal(before.model.pages.length,392);assert.equal(after.model.pages.length,392)
const entry=JSON.parse(readFileSync(resolve(own,'../biologie-stoffwechsel-resume-author-20261008-v1/neutral-author-continuation.entry.json'),'utf8'))
const selected=new Set(entry.goalIds)
const changes=before.model.pages.flatMap(page=>{
 const next=after.model.pages.find(p=>p.goalId===page.goalId)!;assert.ok(next)
 if(stableGoalBookJson(page)===stableGoalBookJson(next))return []
 const changedFields=Object.keys(page).filter(k=>stableGoalBookJson((page as any)[k])!==stableGoalBookJson((next as any)[k]))
 return [{goalId:page.goalId,selected:selected.has(page.goalId),changedFields,before:page.pageFingerprint,after:next.pageFingerprint}]
})
const write=(name:string,value:any)=>{const path=resolve(own,name);assert.equal(existsSync(path),false);writeFileSync(path,JSON.stringify(value,null,2)+'\n')}
write('source-atlas/full392.before.actual-book-model.json',before.model)
write('source-atlas/full392.source-only.actual-book-model.json',after.model)
write('source-atlas/actual392-source-atlas-page-impact.technical.json',{
 schemaVersion:1,role:'Actual standard loader inspection, not source/scientific approval',
 fullBefore392:true,fullAfter392:true,selected19:entry.goalIds,actualPageChanges:changes,
 unchangedPageCount:392-changes.length,unselectedPageChanges:changes.filter(c=>!c.selected),
 activeWrites:0,strictGain:0,humanApproval:false,humanTrial:false,
})
console.log(JSON.stringify({before:392,after:392,pageChanges:changes.length,unselectedChanges:changes.filter(c=>!c.selected).length}))
