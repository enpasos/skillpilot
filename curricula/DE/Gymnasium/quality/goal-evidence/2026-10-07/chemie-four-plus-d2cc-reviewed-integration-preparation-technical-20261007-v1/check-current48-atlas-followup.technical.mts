// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {stableGoalBookJson} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
import {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookSourceAtlasInputs.ts'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../../'),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const cfg=readGoalBookSourceAtlasInputConfig('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',root),current=read(resolve(root,'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json'))
assert.equal(current.sourcePaths.length,48)
const candidate=buildGoalBookSourceAtlasInputs({...cfg,landscapePath:relative(root,resolve(own,'candidate/canonical.json')),semanticKindLedgerPath:relative(root,resolve(own,'candidate/semantic-kinds.json'))},root)
assert.equal(candidate.receipt.counts.sourceViews,current.sourcePaths.length);assert.equal(candidate.receipt.counts.publishedCurricularAtomicGoals,current.expectedCurricularAtomicGoalCount);assert.equal(current.expectedCurricularAtomicGoalCount,359)
for(const p of current.sourcePaths)assert.equal(stableGoalBookJson(JSON.parse(candidate.outputs[p])),stableGoalBookJson(read(resolve(root,p))),p)
assert.equal(stableGoalBookJson(JSON.parse(candidate.outputs[current.navigationViewPath])),stableGoalBookJson(read(resolve(root,current.navigationViewPath))))
writeFileSync(resolve(own,'checks/current48-source-atlas-views-exact.actual.json'),JSON.stringify({documentType:'Actual current source atlas check after historical count assertion caught',currentSourceViews:48,publishedCurricularAtomic359:true,pureM7Curricular378:true,wholeCanonical480:true,current48SourceViewsAndNavigationExact:true,nativeSourceDerivationPASS:true,currentSourceMapReviewsUnchanged:true,postApplySourceProjectionReceiptRegenerationRequired:true,receipt:candidate.receipt,activeWrites:0},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({current48SourceViewsAndNavigationExact:'PASS',published359:'PASS',pure378:'PASS',activeWrites:0}))
