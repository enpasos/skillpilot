// Apache-2.0. Actual entire twenty-seven native pages compared; accepted bounded source/course impact kept explicit.
import{readFile,writeFile}from'node:fs/promises'
import{loadGoalBookBuildInputs}from'../../../../../../../app/scripts/goalBookModel.ts'
import{buildGoalDescriptionRolloutSubsetModel}from'../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const iso="/tmp/skillpilot-wirtschaft-q4-sixde-scope-image-one-current164-knrvavt0",own="curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q4-migration-scope-image-one-native-preparation-technical-20261008-v3",prior="curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q4-twenty-seven-native-preparation-technical-20261008-v1",gid="6de44afa-7f91-5fa4-9292-ec06e86e97a4"
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const comparisons:any[]=[]
for(const name of ['native-d-q4-development-seventeen.final.batch.config.json','native-d-q4-ethics-development-ten.final.batch.config.json']){
 const c=await read(prior+'/'+name),old=await read(c.outputDirectory+'/bundle/book-model.json'),base=await loadGoalBookBuildInputs(c.baseGoalBookConfigPath,iso)
 const current=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:c.goalIds,bookId:c.bookId,title:c.title})
 comparisons.push(...old.pages.map((p:any,i:number)=>({goalId:p.goalId,title:p.title,oldPageFingerprint:p.pageFingerprint,currentPageFingerprint:current.pages[i].pageFingerprint,entirePageByteEquivalent:JSON.stringify(p)===JSON.stringify(current.pages[i]),changedFields:Object.keys(p).filter(k=>JSON.stringify(p[k])!==JSON.stringify(current.pages[i][k]))})))
}
if(comparisons.length!==27)throw Error('Expected actual whole27 pages')
const changed=comparisons.filter((x:any)=>!x.entirePageByteEquivalent)
if(changed.length!==1||changed[0].goalId!==gid)throw Error(JSON.stringify(comparisons))
await writeFile(own+'/actual-one-corrected-and-twenty-six-unchanged-native-pages.receipt.json',JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),physicalIsolate:iso,currentRootStrictBaseline:164,wholePagesCompared:27,unchangedWholePages:26,changedWholePageGoalIds:[gid],actualComparisons:comparisons,acceptedScopeSourceLane:'Independent root and B whole source/course/readiness acceptance v2; actual new6de image KEEP. Native whole page comparison measures combined current effects; original source-row/pointer proof is separate.',independentSubstantiveReviewClaim:false,activeWrites:0},null,2)+String.fromCharCode(10),{flag:'wx'})
console.log('Actual native whole27 comparison: only6de page changed,26 byteequivalent.')
