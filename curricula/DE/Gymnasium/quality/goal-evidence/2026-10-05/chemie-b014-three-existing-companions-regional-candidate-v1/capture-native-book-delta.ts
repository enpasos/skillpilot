import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {buildGoalBookModel,fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
const repo='/home/enpasos/projects/skillpilot'
const iso='/tmp/skillpilot-chem-b014-companions-regional-v1'
const own=`${repo}/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-three-existing-companions-regional-candidate-v1`
const prior=`${repo}/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-eleven-source-remediation-independent-a-v1`
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const config=read(`${repo}/app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json`)
const source=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',iso),iso)
const manifest=JSON.parse(source.outputs[config.compositionViewManifestPath])
const qa=read(`${repo}/${config.goalVisualizationQaPath}`)
const assetDigests:Record<string,string>={}
for(const r of qa.records){if(r.imageUrl){const path=`${repo}/${r.publicAssetPath??`app/public${r.imageUrl}`}`;assetDigests[r.imageUrl]=sha(path)}}
const make=(landscape:any)=>{
 const ledger=read(`${repo}/${config.semanticKindLedgerPath}`),map=new Map(landscape.goals.map((g:any)=>[g.id,g]))
 for(const d of ledger.decisions)d.sourceFingerprint=fingerprintSemanticKindSourceGoal(map.get(d.goalId) as any)
 return buildGoalBookModel({landscape,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:JSON.parse(source.outputs[path])})),navigationView:JSON.parse(source.outputs[manifest.navigationViewPath]),durationModelPolicy:read(`${iso}/${manifest.durationModelPolicyPath}`),semanticKindLedger:ledger,goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,evidenceReviewSources:[],config})
}
const before=make(read(`${prior}/eight-full-runtime.validation-snapshot.json`))
const after=make(read(`${iso}/${canon}`))
assert.equal(before.pages.length,after.pages.length)
const changed=after.pages.flatMap((p:any,i:number)=>JSON.stringify(p)===JSON.stringify(before.pages[i])?[]:[{goalId:p.goal?.id??p.goalId??null,pageKind:p.kind??p.type,pageNumber:p.pageNumber??p.logicalPageNumber??i+1,before:before.pages[i],after:p}])
const report={observedAt:new Date().toISOString(),status:'native_review_book_model_only_not_prepared_finalbook',base:'immutable eight-goal author candidate, not accepted final D/P',candidateBookDigest:after.digest,baseBookDigest:before.digest,pageCount:after.pages.length,changedPageCount:changed.length,changedPages:changed,allOtherNativePageRecordsByteEquivalent:true,sourceClauseClosure:'HOLD SHE',publicationMode:config.publicationMode,assetsReadFromActualCurrentBytes:true,finalPDFPrepared:false,newDReview:false,newPReview:false,strictClosureAdded:0,humanApproved:false}
writeFileSync(`${own}/native-book-page-deltas.receipt.json`,JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({status:report.status,pageCount:after.pages.length,changedPages:changed.map(r=>({goalId:r.goalId,pageNumber:r.pageNumber,pageKind:r.pageKind})),candidateBookDigest:after.digest,strictClosureAdded:0}))
