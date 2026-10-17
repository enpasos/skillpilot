import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { reviewPositiveGoalEvidenceConfig } from '/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/app/scripts/positiveGoalEvidenceReview.ts';
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/app/scripts/goalBookModel.ts';
const R='/home/enpasos/projects/skillpilot';
const H=resolve(R,'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1');
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-fourteen-current-positive-eight-intrinsic-supported-normal-bindings-technical-20261016-v1';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const pin=(p:string)=>{const b=readFileSync(p);return{path:p.slice(R.length+1),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length};};
const selection=read(resolve(R,O,'P14.group-selection.reason-metadata-bounded-v2.finite.json'));
const expected=read(resolve(R,O,'inputs/P14.whole-supported-author-rows-current-whole-goals-and-direct-prerequisites.json'));
const cfg=O+'/P14.all-fourteen-current-stock.normal.config.json';
const result=reviewPositiveGoalEvidenceConfig(cfg);assert.deepEqual(result.errors,[]);assert.equal(result.records.length,14);
const canonicalPath=resolve(H,result.config.landscapePath);const canonical=read(canonicalPath);
const kindsPath=resolve(H,result.config.semanticKindLedgerPath);const kinds=read(kindsPath);
const before=read(resolve(R,expected.canonical.path));
const changedOther=[];
for(const g of canonical.goals){const b=before.goals.find((x:any)=>x.id===g.id);if(JSON.stringify(g)!==JSON.stringify(b))changedOther.push(g.id);}
assert.equal(canonical.goals.length,593);
const candidates=new Map<string,any>();
for(const group of selection.sets){const set=read(resolve(R,group.candidateSet.path));for(const candidate of set.goals)candidates.set(candidate.goalId,{candidate,group:group.group});}
const checks=[];
for(const item of expected.rows){
 const id=item.goalId;const goal=canonical.goals.find((g:any)=>g.id===id);assert.deepEqual(goal,item.wholeCurrentGoal);
 const ledgerRow=kinds.decisions.find((g:any)=>g.goalId===id);assert(ledgerRow);assert.equal(ledgerRow.semanticKind,'curricularAtomic');assert.equal(ledgerRow.decisionStatus,'authoritative');
 assert.equal(fingerprintSemanticKindSourceGoal(goal),ledgerRow.sourceFingerprint);
 const row=result.records.find((r:any)=>r.goalId===id)!;assert(row);assert.equal(row.status,'needs_human_review');assert.equal(row.reviewAuthority,'ai_candidate');assert.equal(row.evidenceLevel,'E0');assert.equal(row.maximumClaimScope,'G0');
 assert.deepEqual(row.profile,candidates.get(id).candidate.profile); assert.equal(row.reason,candidates.get(id).candidate.reason);
 const original=structuredClone(item.wholeAuthorRow.profile);for(const b of original.applicationCaseBriefs)b.id=b.id.toLowerCase();assert.deepEqual(original,row.profile);
 assert.equal(row.reviewRunIds.length,0);assert(row.dissent.length>0);
 checks.push({goalId:id,wholeCurrentGoalMatchesFrozenProfileContext:true,authoritativeKindMatchesActualStockSourceFingerprint:true,profileWholeScientificFieldsRetained:true,onlyAllowedMetadataNormalization:'D124 EVAL brief IDs lowercased; other IDs already closed-schema slugs',goalFingerprint:row.goalFingerprint,reviewInputFingerprint:row.reviewInputFingerprint,profileFingerprint:row.profileFingerprint,normalStatus:row.status,evidenceLevel:row.evidenceLevel,maximumClaimScope:row.maximumClaimScope,actualClosedSchemaAndStockSemanticErrors:[],scientificAuthorityGroup:candidates.get(id).group});
}
assert.deepEqual(new Set(result.records.map(x=>x.goalId)),new Set(selection.allIds));
assert(!result.records.some(x=>x.goalId==='413c5ee5-7826-549f-ad76-63743c59b188'));
const target=resolve(H,O,'CHECK.P14.actual-scoped-current-H-stock-closed-schema-semantics-and-retention.v2.json');assert(!existsSync(target));
writeFileSync(target,JSON.stringify({role:'Actual scoped14 normal positive-v2 closed-schema parser plus unchanged stock semantic/resource checks; no new independent science',normalCanonicalActuallyRead:pin(canonicalPath),normalKindLedgerActuallyRead:pin(kindsPath),frozenCanonicalInput:expected.canonical,whole593ObjectDifferenceIdsFromFrozenInput:changedOther,currentP14WholeGoalsExactDespiteOtherDisjointChanges:true,configActuallyUsed:pin(resolve(H,cfg)),normalP14:pin(resolve(H,O,'P14.all-fourteen-current-stock.normal.review.jsonl')),count:14,stockErrors:result.errors,counts:result.counts,checks,stockModules:['app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/goalBookModel.ts'].map(p=>pin(resolve(H,p))),closedSchema:pin(resolve(H,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')),scope:'Four authority groups, exactly14 real authoritative ordinary atoms; other421 P owners are untouched and not re-reviewed. All material/science bindings remain pinned upstream.',newWholePOrAOrSourceOrDVotes:0,normalAdoptionByThisTask:false,humanApproval:false,humanTrial:false,M7Claim:false},null,2)+'\n');
console.log(JSON.stringify({actualScopedClosedSchemaP14Pass:true,checked:14,errors:0,allP14WholeBodiesExact:true,currentKindSourceFPsMatch:true,all14ProspectiveE0G0:true,otherWholeBodyChanges:changedOther}));
