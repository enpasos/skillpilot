import { readFile,writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current336-actual173-native-description-input-preparation-technical-v1'
const model=JSON.parse(await readFile(root+'/freeze/whole-active-current336.normal-production-book-model.json','utf8'))
const landscape=JSON.parse(await readFile(model.source.landscapePath,'utf8'))
const canonicalById=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const rows=model.pages.map((p:any)=>({goalId:p.goalId,goalFingerprint:p.goalFingerprint,
 canonicalContext:buildGoalDescriptionCanonicalContext(canonicalById.get(p.goalId))}))
await writeFile(root+'/private-preparation-evidence/current336-actual-native-canonical-contexts.json',JSON.stringify({
 technicalOnly:true,nativeFunction:'buildGoalDescriptionCanonicalContext',
 landscapePath:model.source.landscapePath,
 landscapeWholeSha256:createHash('sha256').update(await readFile(model.source.landscapePath)).digest('hex'),
 modelDigest:model.digest,rows,
},null,2)+'\n',{flag:'wx'})
console.log('PASS rebuilt336 actual native canonical contexts')

