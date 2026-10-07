import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../native-root/app/scripts/goalBookModel'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../native-root')
const canon=JSON.parse(readFileSync(resolve(root,'candidate/canonical.final-image-candidate.json'),'utf8'))
const ledger=JSON.parse(readFileSync(resolve(root,'inputs/semantic-kinds.v2.exact.json'),'utf8'))
const byId=new Map(canon.goals.map((x: {id:string})=>[x.id,x]))
ledger.sourceLandscapePath='candidate/canonical.final-image-candidate.json'
const changes=[]
for (const row of ledger.decisions) {
  const next=fingerprintSemanticKindSourceGoal(byId.get(row.goalId))
  if(next!==row.sourceFingerprint) changes.push({goalId:row.goalId,before:row.sourceFingerprint,after:next})
  row.sourceFingerprint=next
}
writeFileSync(resolve(root,'candidate/semantic-kinds.final-image-candidate.json'),JSON.stringify(ledger,null,2)+'\n')
writeFileSync(resolve(root,'../receipts/semantic-kind-mechanical-binding.json'),JSON.stringify({role:'Exact existing classifications rebound with unchanged native API',newClassificationDecisions:0,changes,activeWrites:false},null,2)+'\n')
console.log(JSON.stringify({decisions:ledger.decisions.length,changed:changes.length}))
