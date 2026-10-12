// SPDX-License-Identifier: Apache-2.0
// Pure source build; outputs are written only inside this diagnostic directory.
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs';
const out=dirname(fileURLToPath(import.meta.url)),repo=resolve(out,'../../../../../../..');
const b='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-e81-793-current407-two-real-remedies-root-preparation-20261012-v4';
const path=b+'/configs/source32-one-HE-context-removal.measured387.book-local.inputs.json';
const config=readGoalBookSourceAtlasInputConfig(path,repo);
const {receipt}=buildGoalBookSourceAtlasInputs(config,repo);
const selected=(JSON.parse(await readFile(resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-current407-remediation24-fresh-independent-b-20261012-v3/bounded-source-ownership-and-readiness.json'),'utf8'))).sourceReadinessHolds;
const gm=new Map<string,any>((JSON.parse(await readFile(resolve(repo,config.landscapePath),'utf8'))).goals.map((g:any)=>[g.id,g]));
const parents=new Map<string,string[]>();for(const g of gm.values())for(const id of g.contains??[])parents.set(id,[...(parents.get(id)??[]),g.id]);
const effective=(id:string,visited=new Set<string>()):Set<string>=>{if(visited.has(id))throw Error('contains cycle');visited.add(id);const g=gm.get(id),out=new Set<string>(g.requires??[]);for(const p of parents.get(id)??[])for(const q of effective(p,new Set(visited)))if(q!==id)out.add(q);return out;};
const scopeMap=new Map(receipt.scopes.map(s=>[s.key,s]));
const inspected=selected.map((h:any,holdOrdinal:number)=>{
 const scope:any=scopeMap.get(h.scopeKey),target=new Set(scope.goalIds),goal=gm.get(h.goalId);
 return {holdOrdinal,scopeKey:h.scopeKey,goalId:h.goalId,targetPresent:target.has(h.goalId),
  currentDirectRequires:goal.requires??[],currentEffectiveRequires:[...effective(h.goalId)],
  currentMissingFromSourceTarget:[...effective(h.goalId)].filter(q=>!target.has(q)),
  currentWholeWitnesses:scope.witnesses.filter((w:any)=>w.goalId===h.goalId),
  originalHoldRetainedAsHistorical:true,newReadinessApproval:false};
});
const mm='c245d5fd-ce46-5b45-ab2e-e610547b5f7c';
const original=JSON.parse(await readFile(resolve(repo,b+'/atlas/current-source-union.normal-original-sources.json'),'utf8'));
const ids=new Set<string>((original.goals[mm]??[]).flatMap((r:any)=>r.evidenceIds));
const result={artifactRole:'informed pure-current-source diagnostic, no scientific vote',
 config:{path,sha256:'sha256:'+createHash('sha256').update(await readFile(resolve(repo,path))).digest('hex')},
 counts:receipt.counts,claims:receipt.claims,inputBindings:receipt.inputBindings,
 original147Comparison:inspected,
 originalHoldsStillHaveTargetAndMissing:inspected.filter((h:any)=>h.targetPresent&&h.currentMissingFromSourceTarget.length).length,
 originalHoldsNowWithoutTarget:inspected.filter((h:any)=>!h.targetPresent).map((h:any)=>h.holdOrdinal),
 currentMMScopeWitnesses:receipt.scopes.flatMap((s:any)=>s.witnesses.filter((w:any)=>w.goalId===mm).map((w:any)=>({scopeKey:s.key,...w}))),
 currentMMWholePublishedOriginalSourceEvidence:original.evidence.filter((e:any)=>ids.has(e.id)),
 generatedOutputFilesWritten:0,newScientificVotes:0,grantsM7Closure:false};
await writeFile(resolve(out,'current-root-successor-source-only.actual.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({counts:receipt.counts,originalHoldsStillHaveTargetAndMissing:result.originalHoldsStillHaveTargetAndMissing,originalHoldsNowWithoutTarget:result.originalHoldsNowWithoutTarget,mmWitnesses:result.currentMMScopeWitnesses.length,generatedOutputFilesWritten:0}));
