// SPDX-License-Identifier: Apache-2.0
import { readFileSync,readdirSync,writeFileSync,mkdirSync } from 'node:fs'
import { resolve,dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { KnowledgeContextIndex,renderKnowledgeContext } from '../../app/scripts/lib/knowledgeContext.ts'
import { evaluateGraphIntegrity } from '../../app/scripts/curriculumGraphIntegrity.ts'
import { fingerprintSemanticKindSourceGoal } from '../../app/scripts/goalBookModel.ts'
import { fingerprintGoalForEvidence,fingerprintGoalEvidenceReviewInput } from '../../app/scripts/goalEvidenceProfileModel.ts'
const out=dirname(fileURLToPath(import.meta.url));const root=resolve(out,'../..')
const dump=(name:string,value:unknown)=>{const p=resolve(out,name);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(value,null,2)+'\n')}
const files=readdirSync(resolve(out,'inputs/catalog')).filter(x=>x.endsWith('.de.json')).sort()
const catalog=files.map(f=>JSON.parse(readFileSync(resolve(out,'inputs/catalog',f),'utf8')))
const payload=JSON.parse(readFileSync(resolve(out,'candidate-payload.json'),'utf8'))
const old=new Map(catalog.flatMap(d=>d.goals.map((g:any)=>[g.id,{g,owner:d.landscapeId,subject:d.subject}])) as any)
const id=(p:string):string=>{const a=[...old.keys()].filter((x:any)=>x.startsWith(p));if(a.length!==1)throw Error(p);return a[0] as string}
const apply=(include0c:boolean,addNew:boolean)=>{const changed=structuredClone(catalog)
 for(const e of payload.ordinaryGoalEdits){if(!include0c&&e.goalId.startsWith('0c2d'))continue
  for(const d of changed)for(let j=0;j<d.goals.length;j++)if(d.goals[j].id===e.goalId)d.goals[j]=structuredClone(e.after)
 }
 if(addNew){const d=changed.find(x=>x.landscapeId==='68a8ac50-f5f5-4e24-8aa9-5e408ca01ced');d.goals.push(...structuredClone(payload.newAssessments));for(const e of payload.parentEdits){const j=d.goals.findIndex((g:any)=>g.id===e.before.id);d.goals[j]=structuredClone(e.after)}}
 return changed}
const before=new KnowledgeContextIndex(catalog);const three=new KnowledgeContextIndex(apply(false,false));const finalCatalog=apply(true,true);const after=new KnowledgeContextIndex(finalCatalog)
const summaries=[]
for(const [name,index] of [['three-only-rejected-missing-0c-arithmetic',three],['four-requires-and-three-new-assessments',after]] as const){
 const affected=[];const redundant=[]
 for(const [goalId,info] of old as Map<string,any>){const key=before.resolveAtomicGoal.bind(before)
  if(info.g.type!=='atomic'&&info.g.contains?.length)continue
  const k=key(goalId);const bk=[...before.graph.reach(k)].sort();const ak=[...index.graph.reach(k)].sort()
  const removed=bk.filter(x=>!ak.includes(x));const added=ak.filter(x=>!bk.includes(x))
  if(removed.length||added.length)affected.push({goalId,title:info.g.title,subject:info.subject,assessment:!!info.g.examData,beforeAll:bk.length,afterAll:ak.length,beforeOrdinary:before.securedKeys(k).length,afterOrdinary:index.securedKeys(k).length,removed:removed.map(x=>({key:x,title:before.graph.goal(x).title,kind:before.graph.kind(x),fullGoal:before.graph.goal(x)})),added:added.map(x=>({key:x,title:index.graph.goal(x).title,kind:index.graph.kind(x),fullGoal:index.graph.goal(x)}))})
  const req=index.graph.directAtomicRequires(k);for(const p of req){const witnesses=req.filter(q=>q!==p&&index.graph.reach(q).has(p));if(witnesses.length)redundant.push({goalId,prerequisite:p,witnesses})}
 }
 for(const g of payload.newAssessments){const k=index===after?index.resolveAtomicGoal(g.id):null;if(!k)continue;const req=index.graph.directAtomicRequires(k);for(const p of req){const witnesses=req.filter(q=>q!==p&&index.graph.reach(q).has(p));if(witnesses.length)redundant.push({goalId:g.id,prerequisite:p,witnesses})}}
 const countsBySubject:Record<string,number>={};for(const a of affected)countsBySubject[a.subject]=(countsBySubject[a.subject]??0)+1
 const counts={existingAffected:affected.length,assessments:affected.filter(x=>x.assessment).length,countsBySubject,redundantDirectEdges:redundant.length,newAssessmentCount:index===after?3:0}
 dump(`${name}.impact.actual.json`,{status:'native-hypothetical-author-evidence-not-content-approval',engine:'KnowledgeContextIndex + UnitGraph',counts,affected,redundant});summaries.push({name,...counts})
}
const contexts=[];mkdirSync(resolve(out,'native-contexts'),{recursive:true})
const targets=[id('f39c49c7'),id('c9df47fa'),id('5e7d5ff2'),id('0c2ddfcd'),id('47c515c9'),...payload.newAssessments.map((x:any)=>x.id)]
for(const goalId of targets)for(const [name,index] of [['current',before],['proposed',after]] as const){if(name==='current'&&!old.has(goalId))continue
 const key=index.resolveAtomicGoal(goalId);const c=index.context(key);dump(`native-contexts/${goalId.slice(0,8)}.${name}.json`,c)
 for(const language of ['de','en'] as const)writeFileSync(resolve(out,`native-contexts/${goalId.slice(0,8)}.${name}.${language}.md`),renderKnowledgeContext(c,{form:'full',language})+'\n')
 contexts.push({goalId,variant:name,securedOrdinaryCount:index.securedKeys(key).length,allAtomicPrerequisiteCount:index.graph.reach(key).size,securedOrdinaryGoals:index.securedKeys(key).map(x=>({key:x,goal:index.graph.goal(x)})),fullGoal:index.graph.goal(key)})
}
const d0=three.resolveAtomicGoal(id('0c2ddfcd'));const arithmetic=id('4eeab7d5');const line=id('f6b13b8e')
const includes=(index:KnowledgeContextIndex,key:string,gid:string)=>index.securedKeys(key).some(x=>index.graph.goal(x).id===gid)
const arithmeticWitness={threeOnlySecuresRationalAddSubtract:includes(three,d0,arithmetic),threeOnlySecuresRationalNumberline:includes(three,d0,line),finalSecuresRationalAddSubtract:includes(after,after.resolveAtomicGoal(id('0c2ddfcd')),arithmetic),threeOnlyDirectRequires:[...three.graph.directAtomicRequires(d0)],finalDirectRequires:[...after.graph.directAtomicRequires(d0)],reason:'Existing active P club-bars demands quantified 9-4=5; rational numberline competence has no subtraction operation. 4ee is absent from native three-only W, so this is a necessary local application prerequisite, not a redundant edge.'}
if(arithmeticWitness.threeOnlySecuresRationalAddSubtract||!arithmeticWitness.finalSecuresRationalAddSubtract)throw Error('invalid arithmetic witness')
dump('native-context-summary.actual.json',contexts);dump('0c-arithmetic-witness.actual.json',arithmeticWitness)
const bind=[]
for(const e of payload.ordinaryGoalEdits){
 const oldGoal=e.before;const newGoal=e.after;const resourceDigests:Record<string,string>={}
 for(const r of newGoal.resourceLinks??[])if(r.type==='goal-visualization'&&r.url?.startsWith('/'))resourceDigests[r.url]='sha256:'+createHash('sha256').update(readFileSync(resolve(root,'app/public'+r.url))).digest('hex')
 bind.push({goalId:e.goalId,semanticSourceBefore:fingerprintSemanticKindSourceGoal(oldGoal),semanticSourceAfter:fingerprintSemanticKindSourceGoal(newGoal),evidenceSemanticBefore:fingerprintGoalForEvidence(oldGoal,'goal-evidence-v1','curricularAtomic'),evidenceSemanticAfter:fingerprintGoalForEvidence(newGoal,'goal-evidence-v1','curricularAtomic'),evidenceInputBefore:fingerprintGoalEvidenceReviewInput(oldGoal,'goal-evidence-v1',resourceDigests,'curricularAtomic'),evidenceInputAfter:fingerprintGoalEvidenceReviewInput(newGoal,'goal-evidence-v1',resourceDigests,'curricularAtomic'),resourceDigests})
}
dump('native-binding-deltas.actual.json',bind)
const graphChecks=finalCatalog.map(d=>({landscapeId:d.landscapeId,subject:d.subject,result:evaluateGraphIntegrity(finalCatalog,d.landscapeId)}));dump('proposed-g17-21-catalog.actual.json',{status:graphChecks.every(x=>x.result.status==='pass')?'pass':'fail',catalogs:graphChecks});if(graphChecks.some(x=>x.result.status!=='pass'))throw Error('Proposed G17 fail');
dump('closure-summary.actual.json',{canonicalCatalogCount:catalog.length,existingGoalCount:old.size,newTotalGoalCount:old.size+3,scenarios:summaries,arithmeticWitness})
console.log(JSON.stringify({canonicalCatalogCount:catalog.length,existingGoalCount:old.size,newTotalGoalCount:old.size+3,scenarios:summaries,arithmeticWitness},null,2))
