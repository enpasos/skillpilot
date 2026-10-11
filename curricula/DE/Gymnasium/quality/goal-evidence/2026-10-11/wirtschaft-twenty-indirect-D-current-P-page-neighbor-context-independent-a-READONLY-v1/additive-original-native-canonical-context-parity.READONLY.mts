import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { buildGoalDescriptionCanonicalContext } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { stableGoalBookJson } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot/'
const src='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-four-current-D56-native-owner-context-scoping-AUTHOR-INERT-c-v1/current-root-P15-QA346-qualified-native-followers-v2/'
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-twenty-indirect-D-current-P-page-neighbor-context-independent-a-READONLY-v1/'
const hashes=new Map<string,string>()
const read=(p:string)=>{const b=readFileSync(root+p);hashes.set(p,createHash('sha256').update(b).digest('hex'));return JSON.parse(b.toString())}
const manifest=read(src+'actual20-indirect-current-ID-original-two-review-P-page-source-context-manifest.AUTHOR-INERT.json')
const canon=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const byId=new Map(canon.goals.map((g:any)=>[g.id,g]))
const rows=manifest.goals.map((i:any)=>{
 const d=read(i.wholeContextArtifact.path)
 const ctx=buildGoalDescriptionCanonicalContext(byId.get(i.goalId) as any)
 for(const r of d.wholeOriginalRegisteredBothInputs) assert.equal(stableGoalBookJson(r.wholeOriginalInputGoal.canonicalContext),stableGoalBookJson(ctx))
 return {goalId:i.goalId,wholeCanonicalContextOriginalNativeParityBothRounds:true,canonicalContext:ctx}
})
assert.equal(rows.length,20)
for(const [p,h]of hashes)assert.equal(createHash('sha256').update(readFileSync(root+p)).digest('hex'),h)
for(const p of ['app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/goalBookModel.ts']) hashes.set(p,createHash('sha256').update(readFileSync(root+p)).digest('hex'))
writeFileSync(root+out+'additive-original-native-canonical-context-parity20-40.READONLY.json',JSON.stringify({status:'native-context-parity-PASS-only-not-D-science',actualUTC:new Date().toISOString(),rows,originalMethod:'buildGoalDescriptionCanonicalContext + stableGoalBookJson; unchanged original modules',activeWrites:0,inputEndguards:[...hashes].map(([path,sha256])=>({path,sha256}))},null,2)+'\n',{flag:'wx'})
