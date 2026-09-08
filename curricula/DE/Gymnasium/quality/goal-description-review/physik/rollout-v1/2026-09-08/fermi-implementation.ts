// Read-only current-field candidate; prints a minimal apply_patch, never writes files.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {fermiGoalId,fermiAssessmentId,fermiAssessment} from './fermi-assessment.mjs'
import {normalizeCanonicalLandscape} from '../../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../../app/scripts/goalBookModel.ts'
const cp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',kp='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8')),before=read(cp),after=structuredClone(before),kb=read(kp),ka=structuredClone(kb)
assert(!after.goals.some((g:any)=>g.id===fermiAssessmentId),'Fermi task already present; no replay')
const changed:any[]=[]
for(const id of ['0f5346d6-de1b-5e38-aaba-68db205e594b','4a58df57-f791-502f-8b8d-9ba155e46035']){
 const g=after.goals.find((g:any)=>g.id===id);assert(g.requires.includes(fermiGoalId)&&g.examData.coveredGoalIds.includes(fermiGoalId))
 g.requires=g.requires.filter((x:string)=>x!==fermiGoalId);g.examData.coveredGoalIds=g.examData.coveredGoalIds.filter((x:string)=>x!==fermiGoalId);changed.push(g)
}
const parent=after.goals.find((g:any)=>g.id==='85bbad98-2f48-5d64-85c4-ab6cf67f24c2');parent.contains.push(fermiAssessmentId);changed.push(parent)
after.goals.unshift(fermiAssessment)
for(const g of changed)ka.decisions.find((d:any)=>d.goalId===g.id).sourceFingerprint=fingerprintSemanticKindSourceGoal(g)
const kd={goalId:fermiAssessmentId,semanticKind:'practiceAssessment',sourceFingerprint:fingerprintSemanticKindSourceGoal(fermiAssessment),decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-practice-assessment'}
ka.decisions.push(kd);ka.decisions.sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId));ka.counts.practiceAssessment++;ka.counts.total++
const decorate=(raw:any,k:any)=>({...normalizeCanonicalLandscape(raw),goals:normalizeCanonicalLandscape(raw).goals.map((g:any)=>({...g,semanticKind:k.decisions.find((d:any)=>d.goalId===g.id)?.semanticKind}))})
const lb=decorate(before,kb),la=decorate(after,ka),extras=fs.readdirSync('curricula/DE/Gymnasium/canonical').filter(f=>f.endsWith('.json')&&!f.includes('CANONICAL_PHYSIK.')).flatMap(f=>normalizeCanonicalLandscape(read('curricula/DE/Gymnasium/canonical/'+f)).goals)
const ub={...lb,goals:[...lb.goals,...extras]},ua={...la,goals:[...la.goals,...extras]},allBefore=new Map(ub.goals.map((g:any)=>[g.id,g])),allAfter=new Map(ua.goals.map((g:any)=>[g.id,g]))
const enc=(x:any,indent=0)=>JSON.stringify(x,null,2).split('\n').map(l=>' '.repeat(indent)+l).join('\n')
let patch='*** Begin Patch\n*** Update File: '+cp+'\n@@\n   "goals": [\n'+(enc(fermiAssessment,4)+',').split('\n').map(l=>'+'+l).join('\n')+'\n'
for(const g of changed){const comma=before.goals.at(-1).id===g.id?'':',';patch+='@@\n'+enc(before.goals.find((x:any)=>x.id===g.id),4).split('\n').map(l=>'-'+l).join('\n')+comma+'\n'+enc(g,4).split('\n').map(l=>'+'+l).join('\n')+comma+'\n'}
patch+='*** Update File: '+kp+'\n@@\n'+enc(kb.counts,2).replace(/^  \{/,'  "counts": {').split('\n').map(l=>'-'+l).join('\n')+',\n'+enc(ka.counts,2).replace(/^  \{/,'  "counts": {').split('\n').map(l=>'+'+l).join('\n')+',\n'
for(const g of changed){const b=kb.decisions.find((d:any)=>d.goalId===g.id),a=ka.decisions.find((d:any)=>d.goalId===g.id);patch+='@@\n'+enc(b,4).split('\n').map(l=>'-'+l).join('\n')+',\n'+enc(a,4).split('\n').map(l=>'+'+l).join('\n')+',\n'}
const following=ka.decisions[ka.decisions.findIndex((d:any)=>d.goalId===fermiAssessmentId)+1];assert(following)
patch+='@@\n'+(enc(kd,4)+',').split('\n').map(l=>'+'+l).join('\n')+'\n'+enc(following,4).split('\n').map(l=>' '+l).join('\n')+',\n'
const proof:any[]=[]
for(const filename of fs.readdirSync('curricula/DE/Gymnasium/composition-views/physik').filter(f=>f.endsWith('.view.json'))){
 const p='curricula/DE/Gymnasium/composition-views/physik/'+filename,b=read(p),a=structuredClone(b),r=collectCompositionProjectionRoleGoalIds(b.rootNodes,allBefore),target=r.targetGoalIds.has(fermiGoalId)
 let now=collectCompositionProjectionRoleGoalIds(a.rootNodes,allAfter);const structures:any[]=[]
 const walk=(ns:any[])=>ns.forEach(n=>{if(n.kind==='structure')structures.push(n);walk(n.children??[])});walk(a.rootNodes)
 if(target!==now.targetGoalIds.has(fermiAssessmentId)){
   const anchor=structures.find(n=>n.id==='physics-q4')??structures.find(n=>/sekii/.test(n.id))??structures[0];assert(anchor)
   anchor.children.push({kind:'goalEntry',goalId:fermiAssessmentId,...(!target?{projectionRole:'prerequisiteOnly'}:{})})
 }
 const compilation=compileCompositionView(normalizeCompositionView(a),la,ua),errors=compilation.findings.filter((x:any)=>x.severity==='error');assert.deepEqual(errors,[],p)
 now=collectCompositionProjectionRoleGoalIds(a.rootNodes,allAfter);assert.equal(now.targetGoalIds.has(fermiAssessmentId),target,p)
 assert.deepEqual([...now.targetGoalIds].filter(x=>x!==fermiAssessmentId).sort(),[...r.targetGoalIds].sort(),p+' changed content targets')
 proof.push({path:p,fermiTarget:target,taskTarget:now.targetGoalIds.has(fermiAssessmentId),errors:0})
 if(JSON.stringify(a)!==JSON.stringify(b)){
  const bs=enc(b).split('\n'),as=enc(a).split('\n');let s=0,e=0;while(bs[s]===as[s])s++;while(bs[bs.length-1-e]===as[as.length-1-e])e++;
  patch+='*** Update File: '+p+'\n@@\n'+bs.slice(Math.max(0,s-3),s).map(l=>' '+l).join('\n')+'\n'+bs.slice(s,bs.length-e).map(l=>'-'+l).join('\n')+'\n'+as.slice(s,as.length-e).map(l=>'+'+l).join('\n')+'\n'+bs.slice(bs.length-e,bs.length-e+3).map(l=>' '+l).join('\n')+'\n'
 }
}
const receipt={schemaVersion:1,reviewedAt:new Date().toISOString(),decision:'released_after_individual_informed_counterreview',humanApproval:false,goalId:fermiGoalId,assessmentId:fermiAssessmentId,bodySha256:'sha256:'+createHash('sha256').update(JSON.stringify(fermiAssessment.examData)).digest('hex'),sourceCorrection:'Q4.3 rejected; verified Q4.5 printed pp.46-47 in Hessen KC Physics 2024',removedUnsupportedCoverageOnlyFrom:changed.slice(0,2).map(g=>g.id),unchangedOtherHistoricalClaimsNotEndorsed:true,viewProof:proof}
patch+='*** Add File: curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/fermi-implementation.receipt.json\n'+enc(receipt).split('\n').map(l=>'+'+l).join('\n')+'\n*** End Patch\n'
// apply_patch searches hunks forward in each file. Sort exact old-text leases
// before emission; omit empty separator lines (JSON content blanks are prefixed).
const ordered=patch.split(/(?=^\*\*\* (?:Update|Add) File: )/m).map(section=>{
 if(!section.startsWith('*** Update File: '))return section
 const end=section.indexOf('\n'),path=section.slice(17,end),raw=fs.readFileSync(path,'utf8')
 const hunks=section.slice(end+1).split(/(?=^@@\n)/m).filter(Boolean).map(h=>{
  const old=h.split('\n').slice(1).filter(l=>l.startsWith('-')||l.startsWith(' ')).map(l=>l.slice(1)).join('\n')
  const position=raw.indexOf(old);assert(position>=0,'Missing exact field hunk: '+path)
  return {h,position}
 }).sort((a,b)=>a.position-b.position)
 return section.slice(0,end+1)+hunks.map(x=>x.h).join('')
}).join('').split('\n').filter(l=>l!=='').join('\n')+'\n'
process.stdout.write(ordered)
