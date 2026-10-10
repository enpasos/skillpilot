import {readFileSync,writeFileSync} from 'node:fs'
import {loadGoalBookBuildInputs,stableGoalBookJson,parseAndValidateGoalBookModel} from './goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot'
const parent='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
const own=parent+'/seven-explicit-profile-support-and-full-fixedpoint-scope-author-v14'
const previous=parent+'/four-reviewed-profile-materials-and-explicit-five-support-scope-author-v13'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const main=async()=>{
 const meta=read(root+'/'+own+'/actual-new-CAN407-exact-seven-profile-support-scope-isolate.author.receipt.json')
 const before=parseAndValidateGoalBookModel(read(root+'/'+previous+'/whole-current311-after-reviewed407-preserved-all-P311.book-model.json'))
 const after=(await loadGoalBookBuildInputs(previous+'/book-config.current311-reviewed407-preserved-all-P311.inert.json',meta.physicalIsolate)).model
 const wholeEqual=stableGoalBookJson(before)===stableGoalBookJson(after)
 const by=new Map(before.pages.map(p=>[p.goalId,p]))
 const changed=after.pages.filter(p=>stableGoalBookJson(by.get(p.goalId))!==stableGoalBookJson(p)).map(p=>p.goalId)
 if(!wholeEqual||changed.length)throw Error('National support-role change unexpectedly changed the complete canonical book')
 writeFileSync(root+'/'+own+'/actual-V13-to-V14-whole-native-P311-book-and-all311-ownerpages-exact.json',JSON.stringify({schemaVersion:1,kind:'actual-native-view-only-support-successor-book-model-retention',beforeDigest:before.digest,afterDigest:after.digest,wholeNativeModelExact:wholeEqual,allWhole311OwnerpagesExact:true,changedOwnerIds:changed,currentCurricularAtomicDenominator:311,originalRouteImpactAgainstV10StillSevenAnd304Exact:true,ownDescriptionOrCourseApproval:false,pendingRootP8Union:true,newStrictClosures:0,liveWrites:[]},null,2)+'\n')
 console.log(JSON.stringify({wholeModelExact:wholeEqual,digest:after.digest,wholeOwnerpages:after.pages.length,changedOwnerIds:changed}))
}
main().catch(e=>{console.error(e);process.exitCode=1})
