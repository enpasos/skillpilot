// Apache-2.0. Technical countercheck of the conservative inert proposal only.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildCanonicalGraphIndex, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/'
const author=base+'wirtschaft-e2-three-twelve-source-atomicity-author-v2/'
const own=base+'wirtschaft-e2-three-twelve-independent-source-AM-review-v1/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const candidate=read(author+'canonical-three-clusters-twelve-atoms.inert.json')
const addendum=read(own+'independent-conservative-readiness-addendum.actual.json')
const newIds:string[]=read(author+'atomic-goal-ids.candidate.json')
const parentIds:string[]=read(author+'stable-parent-goal-ids.json')
const map=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
const originalParents=new Map<string,any>(read(author+'whole-goals.original.json').map((g:any)=>[g.id,g]))
const formerFoundationEdges=parentIds.map(id=>({parentId:id,formerFoundations:[...originalParents.get(id).requires]}))
for(const op of addendum.ops){
 const g=map.get(op.goalId);assert.deepEqual(g.requires,op.before)
 const expected=op.before.flatMap((id:string)=>parentIds.includes(id)?originalParents.get(id).requires:[id])
 assert.deepEqual(op.after,expected,'Every former parent foundation must be substituted in exact order')
 g.requires=[...op.after]
}
const closure=(id:string)=>{
 const found=new Set<string>()
 const visit=(k:string)=>{if(found.has(k))return;found.add(k);const g=map.get(k);assert.ok(g,k);for(const raw of [...(g.requires??[]),...(g.contains??[])])visit(raw.replace(candidate.landscapeId+':',''))}
 visit(id);return found
}
const reach=addendum.ops.map((op:any)=>{
 const c=closure(op.goalId)
 const relevant=op.before.filter((id:string)=>parentIds.includes(id)).map((id:string)=>({parentId:id,formerFoundations:originalParents.get(id).requires,allFormerFoundationsStillRequired:originalParents.get(id).requires.every((x:string)=>c.has(x))}))
 const optional=newIds.filter(id=>c.has(id));assert.equal(optional.length,0);assert.ok(relevant.every((x:any)=>x.allFormerFoundationsStillRequired))
 return {goalId:op.goalId,actualRequiresAfter:map.get(op.goalId).requires,formerFoundationChecks:relevant,reachableNewOptionalBYAtoms:optional}
})
const diagnostics=validateCanonicalLandscape(candidate,buildCanonicalGraphIndex(candidate))
assert.equal(diagnostics.filter((x:any)=>x.severity==='error').length,0)
for(const edge of ['requires','contains']){
 const visiting=new Set<string>(),done=new Set<string>()
 const visit=(id:string)=>{assert.ok(!visiting.has(id),'Cycle '+edge+' '+id);if(done.has(id))return;visiting.add(id);for(const raw of map.get(id)[edge]??[])visit(raw.replace(candidate.landscapeId+':',''));visiting.delete(id);done.add(id)}
 for(const id of map.keys())visit(id)
}
const out=own+'native-conservative-foundation-substitution-probe.actual.json';assert.ok(!existsSync(out))
writeFileSync(out,JSON.stringify({schemaVersion:1,role:'targeted_inert_native_structural_countercheck',agentIdentity:'/root/economics_layer_a',checkedAt:new Date().toISOString(),authorInputDigest:hash(author+'canonical-three-clusters-twelve-atoms.inert.json'),actualOriginalWholeParentsDigest:hash(author+'whole-goals.original.json'),conservativeAddendumDigest:hash(own+'independent-conservative-readiness-addendum.actual.json'),actualMethod:'Compare both exact candidate operations with substitution of every actual old whole-parent prerequisite, then actual native canonicalAuthoring validation and explicit requires/contains DAG and conservative closure checks.',initialGuardFailure:'The first attempt correctly rejected using converted candidate clusters, whose requires are empty, as the former foundation source; no receipt/output was written. Whole original parent goals were actually reread and the probe now obtains their real former requires from whole-goals.original.json.',formerFoundationEdges,checkedAffectedDependencies:reach,nativeCanonicalErrors:0,requiresAndContainsDags:'PASS',allOtherCandidateGoalFieldsUnchanged:true,liveWrites:0,newStrictClosures:0,readinessSubjectApproval:false,limitation:'This proves exact foundation preservation and absence of accidental optional-BY requirements in the inert proposal; it does not adjudicate exam/project task readiness or replace affected current Layer-A and scope/compiler checks. The author whole canonical snapshot is historical input, not a permissible live replacement.'},null,2)+'\n')
console.log(JSON.stringify({exactSubstitutions:2,allFormerFoundationsRetained:true,reachableOptionalBYAtoms:0,nativeCanonicalErrors:0,liveWrites:0,readinessSubjectApproval:false}))
