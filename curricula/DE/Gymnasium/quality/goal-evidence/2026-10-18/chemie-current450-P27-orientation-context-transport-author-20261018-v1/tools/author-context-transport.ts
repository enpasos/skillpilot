// SPDX-License-Identifier: Apache-2.0
// Explicit, additive context serialization only; no scientific verdicts or normal writes.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {isDeepStrictEqual} from 'node:util'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-P27-orientation-context-transport-author-20261018-v1'
const R='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-twenty-seven-orientation-entry-author-20261018-v1/AUTHOR.27-orientation-entry-requires-only.pending.json'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-reviewed-orientation-normal-integration-technical-20261018-v1'
const assert=(v:unknown,s:string)=>{if(!v)throw Error(s)}
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(v:Buffer|string)=>createHash('sha256').update(v).digest('hex'),pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length}}
const save=(p:string,d:unknown)=>writeFileSync(O+'/'+p,JSON.stringify(d,null,2)+'\n',{flag:'wx'})
const registry=read(R),sub=registry.subjects.find((s:any)=>s.subject==='chemie'),c=read(sub.landscapePath),sem=read(sub.semanticKindLedgerPath),by=new Map<string,any>(c.goals.map((g:any)=>[g.id,g])),kinds=new Map<string,string>(sem.decisions.map((r:any)=>[r.goalId,r.semanticKind])),author=read(A),beforeBy=new Map<string,any>(author.records.map((r:any)=>[r.goalId,r.beforeWholeGoal])),affected=new Set<string>(beforeBy.keys())
const guards=new Map<string,any>(),guard=(p:string)=>{if(!guards.has(p))guards.set(p,pin(p));return guards.get(p)}
for(const p of [R,sub.landscapePath,sub.semanticKindLedgerPath,A,'app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v2/goal-evidence-profile.schema.json',E+'/RECEIPT.actual-reviewed-orientation-normal-integration.json',E+'/SEAL.reviewed-orientation-normal-integration.json',E+'/BEFORE.canonical.exact.json.snapshot','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-orientation-entry-independent-a-20261018-v1/REVIEW.independent-a.27-deltas-and-anchor-v2.json','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-orientation-entry-independent-a-20261018-v1/SEAL.independent-a.actual.json','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-orientation-entry-informed-independent-b-20261018-v1/FIRST.independent-B.json','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-orientation-entry-informed-independent-b-20261018-v1/SEAL.first-independent-B.json'])guard(p)
assert(affected.size===27,'Expected exact27 accepted orientation goals')
// Parent-before and accepted full before/current goals retained, not merely ID digests.
const beforeIntegration=read(E+'/BEFORE.canonical.exact.json.snapshot');const frozenBefore=new Map<string,any>(beforeIntegration.goals.map((g:any)=>[g.id,g]));
const allRows:any[]=[],owned=new Map<string,string>(),replacements:any[]=[],transportRows:any[]=[],originalRows:any[]=[],wholeGoals:any[]=[],selection:any[]=[],outputConfigs:string[]=[],rawAggregate:string[]=[]
mkdirSync(O+'/records',{recursive:true});mkdirSync(O+'/configs',{recursive:true})
function resourceDigests(goal:any,cfg:any){const digests:Record<string,string>={};if(cfg.reviewedResourceTypes.includes('goal-visualization'))for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization'){const path='app/public'+link.url;digests[link.url]='sha256:'+guard(path).sha256}return digests}
function configFor(cfg:any,records:any[],reviewPath:string){const next=structuredClone(cfg);next.reviewPath=reviewPath;next.scope.goalIds=cfg.scope.goalIds.filter((id:string)=>records.some(r=>r.goalId===id));const runIds=new Set(records.flatMap(r=>r.reviewRunIds??[]));next.reviewRunManifestPaths=(cfg.reviewRunManifestPaths??[]).filter((path:string)=>{guard(path);return runIds.has(read(path).runId)});assert(next.scope.goalIds.length===records.length,'Config rows/scope differ');return next}
for(const [ix,path] of sub.positiveEvidenceConfigPaths.entries()){
 guard(path);const cfg=read(path),review=guard(cfg.reviewPath),raw=readFileSync(cfg.reviewPath,'utf8'),lines=raw.split(/\r?\n/).filter(Boolean),rows=lines.map(s=>JSON.parse(s)),scope=new Set<string>(cfg.scope.goalIds)
 assert(rows.length===scope.size&&rows.every((r:any)=>scope.has(r.goalId)),'Original scope/rows differ '+path)
 guard(cfg.reviewCriteriaPath)
 const changed:any[]=[],unchanged:any[]=[],changedRaw:string[]=[],unchangedRaw:string[]=[]
 for(const [n,row] of rows.entries()){
  assert(!owned.has(row.goalId),'Duplicate current P owner '+row.goalId);owned.set(row.goalId,path)
  const goal=by.get(row.goalId),kind=kinds.get(row.goalId),digests=resourceDigests(goal,cfg)
  assert(kind==='curricularAtomic','Nonordinary P goal '+row.goalId)
  assert(row.goalFingerprint===fingerprintGoalForPositiveEvidence(goal,kind),'Goal FP stale '+row.goalId)
  assert(row.profileFingerprint===fingerprintPositiveGoalEvidenceProfile(row.profile),'Whole profile FP stale '+row.goalId)
  const actual=fingerprintPositiveGoalEvidenceReviewInput(goal,row.reviewCriteriaFingerprint,digests,kind)
  allRows.push({goalId:row.goalId,configPath:path,reviewPath:cfg.reviewPath,reviewId:row.reviewId,recordUnchangedExceptContext:affected.has(row.goalId),storedReviewInputFingerprint:row.reviewInputFingerprint,actualReviewInputFingerprint:actual})
  if(!affected.has(row.goalId)){assert(actual===row.reviewInputFingerprint,'Unexpected extra stale P '+row.goalId);unchanged.push(row);unchangedRaw.push(lines[n]);continue}
  const before=beforeBy.get(row.goalId),baseline=frozenBefore.get(row.goalId)
  assert(isDeepStrictEqual(before,baseline),'Author/normal full before differ '+row.goalId)
  const keys=[...new Set([...Object.keys(before),...Object.keys(goal)])].filter(k=>!isDeepStrictEqual(before[k],goal[k])).sort()
  assert(isDeepStrictEqual(keys,['requires']),'More than requires changed '+row.goalId)
  assert(isDeepStrictEqual(goal.requires,[...before.requires,author.orientationAnchorGoalId]),'Not exact accepted requires append '+row.goalId)
  assert(row.reviewInputFingerprint===fingerprintPositiveGoalEvidenceReviewInput(before,row.reviewCriteriaFingerprint,digests,kind),'Original P context does not bind accepted before '+row.goalId)
  assert(actual!==row.reviewInputFingerprint,'Expected stale context '+row.goalId)
  const oldLiteral=JSON.stringify(row.reviewInputFingerprint),newLiteral=JSON.stringify(actual)
  assert(lines[n].split(oldLiteral).length===2,'Ambiguous fingerprint replacement '+row.goalId)
  const updatedLine=lines[n].replace(oldLiteral,newLiteral),updated=JSON.parse(updatedLine),rest={...updated,reviewInputFingerprint:row.reviewInputFingerprint}
  assert(isDeepStrictEqual(rest,row),'Unexpected record mutation '+row.goalId)
  changed.push(updated);changedRaw.push(updatedLine);rawAggregate.push(updatedLine);transportRows.push(updated);originalRows.push(row);wholeGoals.push({goalId:goal.id,beforeWholeGoal:before,currentWholeGoal:goal,changedTopLevelFields:keys,sourceConfig:path,sourceReviewPath:cfg.reviewPath,originalReviewId:row.reviewId,originalReviewInputFingerprint:row.reviewInputFingerprint,newReviewInputFingerprint:actual})
 }
 if(!changed.length){selection.push({originalConfigPath:path,selectedConfigPaths:[path],unchanged:true});continue}
 const key='P'+String(ix+1).padStart(3,'0'),tp=O+'/records/'+key+'.transported.review.jsonl',tc=O+'/configs/'+key+'.transported.config.json'
 writeFileSync(tp,changedRaw.join('\n')+'\n',{flag:'wx'});writeFileSync(tc,JSON.stringify(configFor(cfg,changed,tp),null,2)+'\n',{flag:'wx'});outputConfigs.push(tc)
 const selected=[tc];let residual:any=null
 if(unchanged.length){const rp=O+'/records/'+key+'.residual.review.jsonl',rc=O+'/configs/'+key+'.residual.config.json';writeFileSync(rp,unchangedRaw.join('\n')+'\n',{flag:'wx'});writeFileSync(rc,JSON.stringify(configFor(cfg,unchanged,rp),null,2)+'\n',{flag:'wx'});selected.push(rc);outputConfigs.push(rc);residual={configPath:rc,reviewPath:rp,goalIds:unchanged.map(r=>r.goalId),rawRecordLinesPreserved:true}}
 replacements.push({originalConfig:pin(path),originalReview:review,originalReviewId:cfg.reviewId,originalGoalIds:cfg.scope.goalIds,transported:{configPath:tc,reviewPath:tp,goalIds:changed.map(r=>r.goalId)},residual,selectedConfigPaths:selected});selection.push({originalConfigPath:path,selectedConfigPaths:selected,unchanged:false})
}
assert(owned.size===450&&transportRows.length===27&&replacements.length===19,'Unexpected exact scope')
const proposed=selection.flatMap(r=>r.selectedConfigPaths)
save('INPUT.whole27-before-current-goals-and-original-owner-bindings.exact.json',wholeGoals)
writeFileSync(O+'/INPUT.original27.whole-records.exact.jsonl',originalRows.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
writeFileSync(O+'/AUTHOR.transported27.whole-records.exact.jsonl',rawAggregate.join('\n')+'\n',{flag:'wx'})
save('PROPOSAL.sparse-P-owner-registry-array-CAS.pending.json',{role:'AUTHOR_CONTEXT_TRANSPORT_CANDIDATE_NOT_SCIENTIFIC_OR_NATIVE_REVIEW',registryPath:R,subject:'chemie',property:'positiveEvidenceConfigPaths',beforeExact:sub.positiveEvidenceConfigPaths,proposedExact:proposed,replacements,untouchedConfigCount:selection.filter(r=>r.unchanged).length,originalConfigCount:sub.positiveEvidenceConfigPaths.length,proposedConfigCount:proposed.length,transportedRecords:27,ordinaryCount:450,newConfigPaths:outputConfigs})
save('CHECK.actual-record-field-preservation-and-owner-partition.json',{role:'MECHANICAL_CONTEXT_SERIALIZATION_FACTS_NOT_VERDICT',baselineCanonical:pin(sub.landscapePath),baselineSemanticKinds:pin(sub.semanticKindLedgerPath),baselineRegistry:pin(R),ordinaryCount:owned.size,affectedGoalCount:transportRows.length,affectedConfigCount:replacements.length,newConfigCount:outputConfigs.length,residualRecordCount:replacements.reduce((n,r)=>n+(r.residual?.goalIds.length??0),0),wholeProfileGoalAndAllOtherRecordFieldsUnchanged:true,onlyChangedRecordField:'reviewInputFingerprint',originalStatusCounts:originalRows.reduce((a:any,r)=>(a[r.status]=(a[r.status]??0)+1,a),{}),originalAuthorityCounts:originalRows.reduce((a:any,r)=>(a[r.reviewAuthority]=(a[r.reviewAuthority]??0)+1,a),{}),selectedOwnership:allRows,normalWrites:0,newScientificOrNativeVotes:0})
for(const p of guards.values())assert(pin(p.path).sha256===p.sha256,'Concurrent input drift '+p.path)
save('INPUT.current-original-owner-resource-and-accepted-orientation-pins.json',{role:'EXACT_READ_ONLY_INPUT_AND_ACCEPTED_CONTEXT_BINDINGS',files:[...guards.values()],allOriginal138ConfigsAnd450CurrentProfilesChecked:true,normalWrites:0})
console.log(JSON.stringify({created:true,transported:transportRows.length,affectedOwners:replacements.length,newConfigs:outputConfigs.length,newSelectedConfigCount:proposed.length,residualRecords:replacements.reduce((n,r)=>n+(r.residual?.goalIds.length??0),0),normalWrites:0},null,2))
