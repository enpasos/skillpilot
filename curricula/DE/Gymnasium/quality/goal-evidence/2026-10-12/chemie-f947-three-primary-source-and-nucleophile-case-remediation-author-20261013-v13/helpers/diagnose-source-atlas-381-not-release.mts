// Apache-2.0. Explicit source-loss diagnostic only. Accepted expected382 and denominator402 stay unchanged.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const R=process.cwd(),N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13',D=N+'/source/converged-polymer20-source-author';
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8')),write=(p:string,x:any)=>{mkdirSync(resolve(R,p,'..'),{recursive:true});writeFileSync(resolve(R,p),JSON.stringify(x,null,2)+'\n')};
const mod=await import(pathToFileURL(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts')).href),cfg=read(D+'/source-atlas.converged-final-author.config.json');
if(cfg.expectedCurricularAtomicGoalCount!==382)throw Error('Accepted-count author config unexpectedly changed');
const diag={...cfg,expectedCurricularAtomicGoalCount:381};write(D+'/source-atlas.diagnostic-actual381.not-accepted.config.json',diag);
const liveRoot='/home/enpasos/projects/skillpilot';
const liveRead=(p:string)=>JSON.parse(readFileSync(resolve(liveRoot,p),'utf8'));
const liveConfig=liveRead('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json');
// The exact generated live381/382 inputs reside in the private capsule; no new source verdict is inferred.
const liveIDs=new Set<string>();for(const path of liveRead(liveConfig.manifestPath).sourcePaths){const v=liveRead(path);const walk=(nodes:any[])=>{for(const node of nodes){if(node.goalId)liveIDs.add(node.goalId);if(node.children)walk(node.children);}};walk(v.rootNodes);}
const built=mod.buildGoalBookSourceAtlasInputs(diag,R);
const nowIDs=new Set(built.receipt.scopes.flatMap((s:any)=>s.goalIds));const missing=[...liveIDs].filter(id=>!nowIDs.has(id)),can=read(cfg.landscapePath);
const rows=read(D+'/CONVERGED.polymer20.source-author.proposal.pending-science.json').boundaryGoalIds;const interesting=new Set([...rows,'7a05a1ce-45d3-571e-be51-afcd8dfd33ca','a4bac92b-d685-5cb6-94c8-c9b8b878d125','1df17884-96ae-57d7-9da9-dbebd082596f','e20d205f-03a4-5f96-b456-9b20460605a2']);
write(D+'/checks/stock-source-atlas-381-diagnostic-not-release-382.actual.json',{schemaVersion:1,role:'diagnose removed false source witnesses; release count382 check still fails',counts:built.receipt.counts,currentCanonicalAtomicDenominator402Unchanged:true,expectedAcceptedSourceUnion382Preserved:true,diagnosticExpectedSourceUnion381Only:true,missingLivePublishedGoalIds:missing,missingGoalRows:missing.map(id=>can.goals.find((g:any)=>g.id===id)),inputBindings:built.receipt.inputBindings,selectedGoalScopes:built.receipt.scopes.map((s:any)=>({...s,witnesses:s.witnesses.filter((w:any)=>interesting.has(w.goalId)),goalIds:s.goalIds.filter((id:string)=>interesting.has(id))})).filter((s:any)=>s.witnesses.length),omittedGoals:built.receipt.omittedGoals,newSourceVotes:0,wholeSourceUnionApproved:false,normalReleaseSourceCheckPassed:false,activeOrGitWrites:false});
console.log(JSON.stringify({diagnosticOnly:true,acceptedSource382GatePassed:false,actualSourcePublished:nowIDs.size,canonicalAtomic402Unchanged:true,missingLivePublishedGoals:missing.map(id=>({id,title:can.goals.find((g:any)=>g.id===id)?.title}))}));
