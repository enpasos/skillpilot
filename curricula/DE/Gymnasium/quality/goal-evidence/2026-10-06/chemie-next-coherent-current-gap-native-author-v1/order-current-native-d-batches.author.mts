import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v1'
const read=(n:string)=>JSON.parse(readFileSync(resolve(own,n),'utf8'))
const scope=read('current25-provisional-scope-and-valid-existing-bindings.author.json')
const full=await loadGoalBookBuildInputs(own+'/full-current378.book.config.json')
assert.equal(full.model.pages.length,378)
const selected=new Set<string>(scope.selected25GoalIds)
const fullPages=full.model.pages.filter(p=>selected.has(p.goalId))
const order:string[]=[];const done=new Set<string>();const pending=[...fullPages]
while(pending.length){const index=pending.findIndex(p=>p.requires.filter(r=>selected.has(r.goalId)).every(r=>done.has(r.goalId)))
 if(index<0)throw new Error('Actual native selected prerequisites contain a cycle')
 const [page]=pending.splice(index,1);order.push(page.goalId);done.add(page.goalId)
}
assert.equal(order.length,25)
for(const [name,ids] of [['twenty',order.slice(0,20)],['five',order.slice(20)]] as const){
 const file='native-d-'+name+'.batch.config.json';const config=read(file)
 writeFileSync(resolve(own,'attempt-'+name+'.prerequisite-order-rejected.batch-config.txt'),JSON.stringify(config,null,2)+'\n')
 config.goalIds=[...ids]
 const model=buildGoalDescriptionRolloutSubsetModel({baseModel:full.model,goalIds:config.goalIds,bookId:config.bookId,title:config.title})
 assert.equal(model.pages.length,ids.length)
 writeFileSync(resolve(own,file),JSON.stringify(config,null,2)+'\n')
}
const attempts=read('native-preparation-attempts.actual.receipt.json')
attempts.attempts.push({mode:'prepare20 before native prerequisite ordering',exitCode:1,error:'a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca precedes 4285d84a-2c9a-4d51-8250-8bed4daf2d2e',actualRejectedInputPath:own+'/attempt-twenty.prerequisite-order-rejected.batch-config.txt',outputWritten:false})
writeFileSync(resolve(own,'native-preparation-attempts.actual.receipt.json'),JSON.stringify(attempts,null,2)+'\n')
writeFileSync(resolve(own,'actual-native-prerequisite-safe-twenty-plus-five.ordering.author.json'),JSON.stringify({role:'AUTHOR native actual full model prerequisites; not review',baseModelDigest:full.model.digest,originalSelected25GoalIds:scope.selected25GoalIds,nativePrerequisiteSafe25GoalIds:order,subset20:order.slice(0,20),subset5:order.slice(20),selectedActualNativePrerequisites:fullPages.map(p=>({goalId:p.goalId,requires:p.requires,externalPrerequisites:p.externalPrerequisites})),nativeUnmodifiedSubsetChecks:'PASS20+5',profileMaterialOrderChanged:false,activeWrites:false},null,2)+'\n')
console.log(JSON.stringify({nativePrerequisiteSafe25GoalIds:order,subsets:[20,5],nativeUnmodifiedSubsetChecks:'PASS20+5'}))
