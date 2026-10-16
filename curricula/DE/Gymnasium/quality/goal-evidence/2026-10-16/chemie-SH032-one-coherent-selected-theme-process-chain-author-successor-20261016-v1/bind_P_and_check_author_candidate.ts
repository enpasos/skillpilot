import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'

const root='/home/enpasos/projects/skillpilot'
const out=path.dirname(new URL(import.meta.url).pathname)
const h=root+'/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const hash=(b:Buffer|string)=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex')
const pin=(p:string)=>{const b=fs.readFileSync(p);return {path:path.relative(root,p),sha256:hash(b),bytes:b.length}}
const verificationOnly=process.argv.includes('--verify-composed')
const write=(name:string,obj:any)=>{if(verificationOnly&&!name.startsWith('CHECKS.'))return;if(verificationOnly)name=name.replace('CHECKS.','CHECKS.after-a3bd-composition.');const p=path.join(out,name);assert.ok(!fs.existsSync(p),'No overwrite '+p);fs.writeFileSync(p,JSON.stringify(obj,null,2)+'\n')}
const inputs=read(out+'/INPUTS.actual-H6bed-current-SH-and-four-Source2.author.json')
const goal=read(out+'/candidate/WHOLEGOAL.source032-one-coherent-process-chain.AUTHOR.inactive.json')
const profile=read(out+'/P-v2.whole-profile.AUTHOR.inactive.json')
const materials=read(out+'/materials/TWO.complete-nonisomorphic-DE-EN-cases-and-fresh-transfers.AUTHOR.inactive.json')
const cas=read(out+'/CAS.existing-boundary-parent-whole-before-after.AUTHOR.inactive.json')
const canonical=read(root+'/'+cas.canonicalBase.path)
assert.equal(pin(root+'/'+cas.canonicalBase.path).sha256,cas.canonicalBase.sha256)
const imageRoot='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-one-process-chain-PNG-image-author-20261016-v1'
const imagePath=root+'/'+imageRoot+'/candidate/source/visualizations/chemie/'+goal.id+'/'+goal.id+'.png'
const image=pin(imagePath)
assert.equal(image.sha256,'sha256:cd665cb625e4768188b89295859a3104851112731c237c2b18884a8933dce79d')
const criteriaPath=root+'/curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
const criteria=pin(criteriaPath)
const digests={[goal.resourceLinks[0].url]:image.sha256}
const pRecord=verificationOnly?read(out+'/P-v2.whole-fingerprint-bound.AUTHOR.inactive.json'):{
 $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,
 reviewId:'chemie-sh032-process-chain-author-20261016-v1',goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria.sha256,
 landscapeId:canonical.landscapeId,goalId:goal.id,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria.sha256,digests,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(profile),
 status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'/root/chemie_global145_fresh_exam_review_b_20261016: expressly SOURCE032 AUTHOR; not independent on this successor',
 reason:'AUTHOR draft of a new coherent selected-theme SH032 competency and its positive-understanding-evidence-v2 profile. Whole materials and two nonisomorphic cases with fresh transfer are supplied. Bound to the actual inactive root image only; no independent P, D, A, M, V or source approval, no learner work and no human approval.',evidenceLevel:'E0',maximumClaimScope:'G0',reviewRunIds:[],dissent:['Author-only inactive successor. Earlier independent/read-only work identified the gap; it is not an independent review of this new goal or these materials.','Actual image is an author candidate, reviewStatus pilot; no independent V verdict.'],profile,
}
const ajv=new Ajv2020({strict:false,allErrors:true})
const validate=ajv.compile(read(root+'/contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
assert.ok(validate(pRecord),JSON.stringify(validate.errors))
assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(pRecord as any,goal,digests,'curricularAtomic'),[])
write('P-v2.whole-fingerprint-bound.AUTHOR.inactive.json',pRecord)
if(!verificationOnly){assert.ok(!fs.existsSync(out+'/P-v2.whole-fingerprint-bound.AUTHOR.inactive.jsonl'));fs.writeFileSync(out+'/P-v2.whole-fingerprint-bound.AUTHOR.inactive.jsonl',JSON.stringify(pRecord)+'\n')}

const candidate={...canonical,goals:canonical.goals.map((g:any)=>g.id===cas.before.id?cas.after:g).concat([goal])}
const beforeBy=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
const afterBy=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
assert.ok(!beforeBy.has(goal.id));assert.equal(candidate.goals.length,630)
assert.deepEqual(beforeBy.get(cas.before.id),cas.before)
assert.deepEqual(afterBy.get('4a98bbee-41cb-5aef-91c6-f18d7bf2a214'),inputs.wholeExistingPharmacyCluster)
assert.deepEqual(cas.after.contains,cas.before.contains.concat(goal.id))
assert.equal(cas.after.weight,cas.after.contains.length)
assert.equal(cas.after.extendedData.applicabilityMappingInheritance,'boundary')
for(const r of goal.requires)assert.ok(beforeBy.has(r),'Existing didactic prerequisite '+r)
for(const relation of ['requires','contains']){
 const visiting=new Set<string>(),done=new Set<string>()
 const visit=(id:string)=>{if(done.has(id))return;assert.ok(!visiting.has(id),relation+' cycle '+id);visiting.add(id);for(const r of afterBy.get(id)?.[relation]??[]){const local=r.includes(':')?r.split(':').at(-1):r;if(afterBy.has(local))visit(local)}visiting.delete(id);done.add(id)}
 for(const id of afterBy.keys())visit(id)
}
const ledger=read(h+'/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const atoms=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId));assert.equal(atoms.size,435);atoms.add(goal.id)
assert.ok(sourceAtlasDescendants(cas.after.id,afterBy,atoms,canonical.landscapeId).includes(goal.id))
assert.ok(!sourceAtlasDescendants('4a98bbee-41cb-5aef-91c6-f18d7bf2a214',afterBy,atoms,canonical.landscapeId).includes(goal.id))
assert.ok(!sourceAtlasDescendants('442c31c5-c561-5c7a-90bb-2335d779175c',afterBy,atoms,canonical.landscapeId).includes(goal.id))
const mappingInputs:any[]=[],leaks:any[]=[]
const walk=(dir:string):string[]=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):(e.name.endsWith('.json')?[path.join(dir,e.name)]:[]))
for(const p of walk(h+'/curricula/DE/Gymnasium/mapping')){
 const m=read(p);if(m.targetLandscapeId!==canonical.landscapeId)continue
 mappingInputs.push(pin(p))
 const targets=new Set<string>((m.mappings??[]).map((x:any)=>x.canonicalGoalId).concat((m.decisions??[]).flatMap((d:any)=>d.canonicalGoalIds??[])))
 for(const t of targets){if(!afterBy.has(t))continue;if(sourceAtlasDescendants(t,afterBy,atoms,canonical.landscapeId).includes(goal.id))leaks.push({mappingPath:path.relative(root,p),target:t})}
}
assert.deepEqual(leaks,[],'Existing source mappings must not acquire this new leaf')
for(const row of inputs.fourSource2CurrentActualWholeDecisions){
 const m=read(root+'/'+row.wholeFile.path)
 assert.deepEqual(m.decisions.find((d:any)=>d.sourceGoalId===row.wholeCurrentDecision.sourceGoalId),row.wholeCurrentDecision)
}
const expectations=profile.coverageExpectations.requiredExpectationIds
assert.equal(expectations.length,4);assert.equal(materials.cases.length,2)
for(const c of materials.cases){
 assert.equal(c.maximumPoints,16);assert.equal(c.rubric.reduce((n:number,r:any)=>n+r.maximumPoints,0),16)
 assert.deepEqual(c.rubric.map((r:any)=>r.expectationId),expectations)
 for(const key of ['material','tasks','solution']){assert.ok(c[key].de.length>100);assert.ok(c[key].en.length>100)}
 for(const key of ['newMaterial','task','solution']){assert.ok(c.freshTransfer[key].de.length>20);assert.ok(c.freshTransfer[key].en.length>20)}
 assert.equal(c.actuallyExecuted,false);assert.equal(c.learnerWorkPresent,false)
}
const formula=(s:string)=>Object.fromEntries([...s.matchAll(/([A-Z][a-z]?)([0-9]*)/g)].map(x=>[x[1],Number(x[2]||1)]))
const sum=(ss:string[])=>ss.map(formula).reduce((o:any,f:any)=>{for(const[e,n]of Object.entries(f))o[e]=(o[e]??0)+n;return o},{})
assert.deepEqual(sum(['C7H6O3','C4H6O3']),sum(['C9H8O4','C2H4O2']))
assert.deepEqual(sum(['C9H8O4','H2O']),sum(['C7H6O3','C2H4O2']))
const calculations={yieldPercent:1.5/2*100,heatGenerationScale:1000,wallRemovalScale:100,relativeGenerationRemoval:1000/100,gramsPerPack:20*.5,maxPacks:1000/(20*.5),packsAt600g:600/(20*.5),revenue80:80*3.5,variable80:80*2,unitContribution:3.5-2,totalContribution80:80*(3.5-2),revenue60:60*3.5,variable60:60*2,totalContribution60:60*(3.5-2),supplyShortfall:80-600/10,surveyPercent:80/120*100,qualityImmediate:[{name:'labX',pass:99>=97&&1<=3},{name:'plantX',pass:92>=97&&8<=3},{name:'pilotY',pass:98>=97&&2<=3},{name:'laterY',pass:94>=97&&6<=3}]}
assert.equal(calculations.yieldPercent,75);assert.equal(calculations.relativeGenerationRemoval,10);assert.equal(calculations.maxPacks,100);assert.equal(calculations.totalContribution80,120);assert.equal(calculations.totalContribution60,90);assert.deepEqual(calculations.qualityImmediate.map(x=>x.pass),[true,false,true,false])
write('INPUTS.actual-root-PNG-and-P-resource-binding.AUTHOR.json',{role:'Actual original image author candidate bound without independent V claim',image,actualRootProvenance:pin(root+'/'+imageRoot+'/PROVENANCE.original-built-in-PNG-and-inspection-only-sizes.author.json'),resourceDigests:digests,criteria,wholeGoal:pin(out+'/candidate/WHOLEGOAL.source032-one-coherent-process-chain.AUTHOR.inactive.json'),wholeMaterials:pin(out+'/materials/TWO.complete-nonisomorphic-DE-EN-cases-and-fresh-transfers.AUTHOR.inactive.json'),provider:'OpenAI built-in image_gen',licenseForOwnImage:'CC-BY-4.0',reviewStatus:'pilot',newVisualApproval:false})
write('CHECKS.finite-author-schema-calculation-DAG-and-source-boundary.actual.json',{role:'AUTHOR technical checks, no independent science or release',actualCanonicalBase:cas.canonicalBase,PschemaErrors:0,PstockSemanticsErrors:0,newGoalId:goal.id,baseOrdinaryCount:435,prospectiveOrdinaryCount:436,baseWholeCount:629,prospectiveWholeCount:630,ordinarySemanticKindOnlyAuthorProposal:true,bothDAGRelationsAcyclic:true,threeExistingDirectPrerequisites:true,broadPharmacyClusterExactUnchanged:true,canonicalParent:cas.after.id,onlyParentContainsAppendAndDerivedWeight:true,stockSourceAtlasDescendants:true,existingMappingInputCount:mappingInputs.length,existingMappedTargetsReachingNewLeaf:leaks,existingMappingInputs:mappingInputs,rootBroadMappingCannotCrossExistingBoundary:true,directNewSourceMappingStillFutureAndUnreviewed:true,fourCurrentSource2WholeDecisionsExact:true,caseCount:2,freshTransferCount:2,eachCaseRubricSum:16,calculations,actualImage:image,normalWrites:0,newIndependentDPAMVVotes:0,newSourceApprovals:0,humanApproval:false})
console.log(JSON.stringify({authorChecks:'PASS',PschemaErrors:0,PsemanticsErrors:0,mappingFiles:mappingInputs.length,sourceInheritanceLeaks:0,cases:2,newGoalId:goal.id,newIndependentVotes:0}))
