// Apache-2.0. Actual entire twelve native pages compared; no source-locator lane invented.
import{readFile,writeFile}from'node:fs/promises'
import{loadGoalBookBuildInputs}from'../../../../../../../app/scripts/goalBookModel.ts'
import{buildGoalDescriptionRolloutSubsetModel}from'../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const iso="/tmp/skillpilot-wirtschaft-q3-site-one-native-ivd5iuag",own="curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q3-site-one-correction-native-preparation-technical-20261008-v2",prior="curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q3-twenty-three-native-preparation-technical-20261008-v1",gid="7f8f6648-6faa-52c5-9793-3654ef9dc36d"
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const comparisons:any[]=[]
for(const name of ['native-d-q3-global-currency-seventeen.final.batch.config.json','native-d-q3-europe-integration-six.final.batch.config.json']){
 const c=await read(prior+'/'+name),old=await read(c.outputDirectory+'/bundle/book-model.json'),base=await loadGoalBookBuildInputs(c.baseGoalBookConfigPath,iso)
 const current=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:c.goalIds,bookId:c.bookId,title:c.title})
 comparisons.push(...old.pages.map((p:any,i:number)=>({goalId:p.goalId,title:p.title,oldPageFingerprint:p.pageFingerprint,currentPageFingerprint:current.pages[i].pageFingerprint,entirePageByteEquivalent:JSON.stringify(p)===JSON.stringify(current.pages[i]),changedFields:Object.keys(p).filter(k=>JSON.stringify(p[k])!==JSON.stringify(current.pages[i][k]))})))
}
if(comparisons.length!==23)throw Error('Expected actual whole23 pages')
const changed=comparisons.filter((x:any)=>!x.entirePageByteEquivalent)
if(changed.length!==1||changed[0].goalId!==gid)throw Error(JSON.stringify(comparisons))
await writeFile(own+'/actual-one-corrected-and-twenty-two-unchanged-native-pages.receipt.json',JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),physicalIsolate:iso,currentRootStrictBaseline:125,wholePagesCompared:23,unchangedWholePages:22,changedWholePageGoalIds:[gid],actualComparisons:comparisons,source2Lane:'Actual current source2 correction independently reviewed and integrated by root; native D-v3 page contract contains no original sourceRef locators. Source-binding actual impact is separately retained.',independentSubstantiveReviewClaim:false,activeWrites:0},null,2)+String.fromCharCode(10),{flag:'wx'})
console.log('Actual native whole23 comparison: only7f page changed,22 byteequivalent.')
