import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import Ajv from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

const root=process.cwd(), own=path.relative(root,path.dirname(new URL(import.meta.url).pathname))
const read=async(p:string)=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'))
const save=async(n:string,v:any)=>{const target=path.join(root,own,n);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,JSON.stringify(v,null,2)+'\n',{flag:'wx'})}
const assert=(v:any,m:string)=>{if(!v)throw Error(m)}
const eq=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b)
const cfg=await read(own+'/P18.whole-original-independent-b.config.json')
const land=await read(cfg.landscapePath), ledger=await read(cfg.semanticKindLedgerPath)
const rows=(await fs.readFile(path.join(root,cfg.reviewPath),'utf8')).trim().split('\n').map(x=>JSON.parse(x))
const source=await read(own+'/input-snapshots/author/eighteen-whole-primary-source-duty-and-operative-binding-proposals.author.json')
const cases=await read(own+'/input-snapshots/author/eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json')
const authorRows=(await fs.readFile(path.join(root,own,'input-snapshots/author/P18.whole-current-author.review.jsonl'),'utf8')).trim().split('\n').map(x=>JSON.parse(x))
const ajv=new Ajv({strict:true,allErrors:true});addFormats(ajv)
const validator=ajv.compile(await read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const goals=new Map(land.goals.map((g:any)=>[g.id,g])), kinds=new Map(ledger.decisions.map((x:any)=>[x.goalId,x]))
assert(rows.length===18&&cases.wholeCases.length===36,'complete18/36')
const results=rows.map((r:any,i:number)=>{
  const g=goals.get(r.goalId) as any,k=kinds.get(r.goalId) as any
  const valid=validator(r), schemaErrors=structuredClone(validator.errors)
  const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(r,g,{},k.semanticKind)
  assert(valid&&semanticErrors.length===0,'native schema/semantics '+r.goalId)
  assert(k.decisionStatus==='authoritative'&&k.sourceFingerprint===fingerprintSemanticKindSourceGoal(g),'current source-kind '+r.goalId)
  assert(eq(r.profile,authorRows[i].profile),'whole author profile preserved '+r.goalId)
  assert(eq(g,cases.wholeGoalBodies[i])&&eq(g,source.wholeSourceNotes[i].wholeCurrentGoal),'whole goal context/source proposals '+r.goalId)
  assert(r.status==='needs_human_review'&&r.reviewAuthority==='ai_candidate'&&r.evidenceLevel==='E1'&&r.maximumClaimScope==='G1'&&r.reviewRunIds.length===0,'AI bounds '+r.goalId)
  return {goalId:r.goalId,nativeClosedSchemaValid:valid,schemaErrors,nativeSemanticErrors:semanticErrors,wholeProfileExact:true,wholeGoalExact:true,currentSemanticKindFingerprint:true,operativeSourceAccepted:false}
})
await save('P18.independent-closed-native-schema-and-semantics.actual.json',{checkedAt:new Date().toISOString(),results,closedSchemas:18,nativeSemanticErrors:0,wholeProfiles:18,wholeCases:36,scienceJudgment:'first-whole-source-science-judgment.independent-b.json',technicalPassDoesNotOverrideSourceHolds:true,approved:0,needsHumanReview:18,activeWrites:0,imagesInspected:0,humanApproval:false})

// Genuine targeted semantic judgments were made on the complete before/after
// competencies. This creates isolated corrected input; no active ledger edits.
const proposal=await read(own+'/input-snapshots/author/proposed-eighteen-whole-DEEN-bodies.targeted-two-goal-wording-author.json')
const changedIds=new Set(proposal.patches.map((p:any)=>p.goalId))
assert(changedIds.size===2&&proposal.patches.length===3,'exact2goals/3fields')
const patched=structuredClone(land), afterBy=new Map(proposal.proposedWholeGoals.map((g:any)=>[g.id,g]))
const actualChanges:any[]=[]
patched.goals=patched.goals.map((g:any)=>{
  const after=afterBy.get(g.id) as any
  if(!after)return g
  if(!changedIds.has(g.id)){assert(eq(g,after),'unchanged16 body '+g.id);return g}
  const fields=Object.keys(g).filter(k=>!eq(g[k],after[k]))
  assert(fields.length===proposal.patches.filter((p:any)=>p.goalId===g.id).length,'bounded fields '+g.id)
  actualChanges.push({goalId:g.id,fields,wholeBefore:g,wholeAfter:after,atomicityReason:g.id.startsWith('302c')?'One integrated evidential description of human fossil history, hypothetical phylogeny and dispersal. Precise English tree wording preserves the one inferential goal.':'One application of phylogenetic reconstruction with complementary morphological/molecular evidence. Corrected spelling and phylogenetic wording preserve the one inferential competence.',memoryReason:'Understanding and reasoned interpretation/reconstruction supply the performance. No new compact mandatory recall item or memory deck is created by these wording corrections.'})
  return after
})
await save('targeted-two-wording/whole-canonical.inactive.json',patched)
const newKinds=structuredClone(ledger)
newKinds.sourceLandscapePath=own+'/targeted-two-wording/whole-canonical.inactive.json'
newKinds.decisions=newKinds.decisions.map((d:any)=>changedIds.has(d.goalId)?{...d,sourceFingerprint:fingerprintSemanticKindSourceGoal(afterBy.get(d.goalId) as any),decisionBasis:'independent-b-whole-corrected-goal-semantic-kind-review',semanticKind:'curricularAtomic',decisionStatus:'authoritative'}:d)
await save('targeted-two-wording/semantic-kinds.inactive.json',newKinds)
await save('targeted-two-wording/genuine-targeted-A-M-source-kind-judgments.independent-b.json',{recordedAt:new Date().toISOString(),reviewer:'codex-evolution18-independent-b',actualChanges,newSemanticKinds:2,atomicity:'atomic',memory:'no_memory_needed',unchangedWholeBodies:16,retainedPriorValidAMFor16:true,classificationAuthorityIsNotHumanApproval:true,sourceIntegrationHoldsRemain:true,activeWrites:0,humanApproval:false})

const normalize=(s:any)=>typeof s==='string'?s.replace(/\s+/g,' ').trim():''
const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}':JSON.stringify(v)
const amFingerprint=(g:any,ruleVersion:string)=>'sha256:'+createHash('sha256').update(stable({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalize(g.title),titleEn:normalize(g.titleEn),description:normalize(g.description),descriptionEn:normalize(g.descriptionEn),phase:normalize(g.dimensionTags?.phase),area:normalize(g.dimensionTags?.area),topicCode:normalize(g.dimensionTags?.topicCode),nodeKind:normalize(g.nodeKind)})).digest('hex')
for(const lane of ['A18','M18']){
 const records=(await fs.readFile(path.join(root,own,'input-snapshots/author/'+lane+'.exact-retained-current.review.jsonl'),'utf8')).trim().split('\n').map(x=>JSON.parse(x))
 for(const r of records)assert(r.fingerprint===amFingerprint(goals.get(r.goalId),r.ruleVersion),'native original fingerprint reproduction '+r.goalId)
 const targeted=records.filter((r:any)=>changedIds.has(r.goalId)).map((r:any)=>({...r,fingerprint:amFingerprint(afterBy.get(r.goalId),r.ruleVersion),reviewedAt:new Date().toISOString(),reviewer:'codex-evolution18-independent-b-targeted-whole-wording-review',reason:actualChanges.find(x=>x.goalId===r.goalId)[lane==='A18'?'atomicityReason':'memoryReason']}))
 await fs.writeFile(path.join(root,own,'targeted-two-wording/'+lane.slice(0,1)+'2.review.jsonl'),targeted.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx'})
 const laneCfg=await read(own+'/'+lane+'.retained-native.config.json')
 laneCfg.landscapePath=own+'/targeted-two-wording/whole-canonical.inactive.json';laneCfg.reviewPath=own+'/targeted-two-wording/'+lane.slice(0,1)+'2.review.jsonl'
 laneCfg.scope={label:'Only two complete scientifically reviewed wording corrections',leafGoalIds:[...changedIds]}
 if(laneCfg.reportPath)laneCfg.reportPath=own+'/targeted-two-wording/'+lane.slice(0,1)+'2.native-report.actual.md'
 await save('targeted-two-wording/'+lane.slice(0,1)+'2.config.json',laneCfg)
}
const correctedCfg=structuredClone(cfg)
correctedCfg.landscapePath=own+'/targeted-two-wording/whole-canonical.inactive.json'
correctedCfg.semanticKindLedgerPath=own+'/targeted-two-wording/semantic-kinds.inactive.json'
correctedCfg.reviewPath=own+'/targeted-two-wording/P18.corrected.review.jsonl'
await save('targeted-two-wording/P18.corrected.config.json',correctedCfg)
console.log(JSON.stringify({nativeSchemas18:18,nativeSemanticErrors:0,exactFullProfiles:18,correctedWholeGoals:2,unchangedWholeGoals:16,targetedGenuineAMJudgments:4,targetedGenuineClassifications:2,activeWrites:0}))
