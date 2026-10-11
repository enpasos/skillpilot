import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {buildGoalDescriptionCanonicalContext} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {stableGoalBookJson} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot/'
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-three-changed-neighbor-contexts-current-D-science-reuse-independent-a-READONLY-v1/'
const hashes=new Map<string,string>();const read=(p:string)=>{const b=readFileSync(root+p);hashes.set(p,createHash('sha256').update(b).digest('hex'));return JSON.parse(b.toString())}
const can=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');const byId=new Map(can.goals.map((g:any)=>[g.id,g]));const ids=['cb21bcbe-755d-5b0d-b02a-be22c9d26e43','04809186-3f65-579d-b300-af9ed3e100c1','4fef149e-84c0-59af-b056-0a0bf97dbecd'];const rows=[]
for(const id of ids){const d=read(out+id+'.actual-selected-whole-inputs.READONLY.json');const ctx=buildGoalDescriptionCanonicalContext(byId.get(id) as any);for(const r of d.wholeOriginalDualReviews){assert.equal(stableGoalBookJson(r.wholeOriginalInputGoal.canonicalContext),stableGoalBookJson(ctx));assert.equal(stableGoalBookJson(r.wholeOriginalInputGoal.reviewContext.evidenceProfile),stableGoalBookJson(d.wholeCurrentPRecord))} rows.push({goalId:id,actualWholeOriginalNativeCanonicalContextParityBothRounds:true,actualWholePRecordParityBothRounds:true,canonicalContext:ctx})}
for(const p of ['app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/goalBookModel.ts'])hashes.set(p,createHash('sha256').update(readFileSync(root+p)).digest('hex'))
for(const [p,h]of hashes)assert.equal(createHash('sha256').update(readFileSync(root+p)).digest('hex'),h)
writeFileSync(root+out+'actual-three-original-native-context-parity.PASS.READONLY.json',JSON.stringify({status:'PASS-native-parity-not-science',actualUTC:new Date().toISOString(),rows,activeWrites:0,inputEndguards:[...hashes].map(([path,sha256])=>({path,sha256}))},null,2)+'\n',{flag:'wx'});console.log('PASS original native canonicalContext6 + whole currentP6')
