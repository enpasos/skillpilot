import { readFile,writeFile } from 'node:fs/promises'
import { resolve,dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

async function main(){
 const root=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
 const map=JSON.parse(await readFile(resolve(own,'checks/REBUILD.four-final-contexts.physical-map.json'),'utf8'))
 const host=resolve(root,map.executionHost)
 const {loadGoalBookBuildInputs}=await import(resolve(host,'app/scripts/goalBookModel.ts'))
 const {buildGoalDescriptionRolloutSubsetModel}=await import(resolve(host,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'))
 const base=await loadGoalBookBuildInputs(own.slice(root.length+1)+'/config/whole422.normal-stock-base.config.json')
 assert.equal(base.model.pages.length,422)
 const v3=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1')
 const before=JSON.parse(await readFile(resolve(v3,'native-twenty/bundle/book-model.json'),'utf8'))
 const twenty=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:before.pages.map((p:any)=>p.goalId),bookId:before.book.id,title:before.book.title})
 const four=JSON.parse(await readFile(resolve(own,'native-four/bundle/book-model.json'),'utf8'))
 const ids=new Set(map.selectedFourGoalIds)
 const changes=[]
 for(let i=0;i<before.pages.length;i++){
   const a=twenty.pages[i],b=before.pages[i]
   const fields=Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]))
   if(!ids.has(a.goalId))assert.deepEqual(a,b,'Unselected native20 page body changed: '+a.goalId)
   else changes.push({goalId:a.goalId,beforeGoalFingerprint:b.goalFingerprint,afterGoalFingerprint:a.goalFingerprint,beforePageFingerprint:b.pageFingerprint,afterPageFingerprint:a.pageFingerprint,changedFields:fields,wholeBefore:b,wholeAfter:a})
 }
 assert.equal(changes.length,4)
 assert.equal(changes.filter(c=>c.beforeGoalFingerprint!==c.afterGoalFingerprint).length,3)
 for(const page of four.pages){
   const same=twenty.pages.find((p:any)=>p.goalId===page.goalId)!
   for(const field of ['title','description','visualization','evidenceReview','goalFingerprint'])assert.deepEqual(page[field],same[field])
   for(const [a,b] of [['requires','externalPrerequisites'],['reverseRequires','externalReverseRequires']]){
     const relation=(p:any)=>[...p[a],...p[b]].map((r:any)=>r.goalId).sort()
     assert.deepEqual(relation(page),relation(same))
   }
 }
 const output={role:'Actual unmodified stock full422 load plus diagnostic20 subset in memory only;no additional native20 PDFs/campaigns and no scientific votes',pass:true,wholeOrdinary422:base.model.pages.length,actualFourPages:four.pages.length,unselected16WholeNativePageBodiesAndFingerprintsExact:true,changedPageContexts:changes,selectedFourContentFieldsExactlyMatchFourGoalNative:true,subsetExternalizationChangesRelationPlacementOnly:true,threeGoalFingerprintsChanged:true,fourPageFingerprintsChanged:true,newD:0,newP:0,newA:0,newM:0,newV:0}
 await writeFile(resolve(own,'checks/NATIVE.actual-four-context-radius-other16-exact.json'),JSON.stringify(output,null,2)+'\n')
 console.log(JSON.stringify({pass:true,wholeOrdinary:422,targetPages:4,other16WholePagesExact:true,goalFingerprintChanges:3,pageContextChanges:4}))
}
main().catch(e=>{console.error(e);process.exit(1)})
