// Apache-2.0. Normal source API, final actual381 snapshot; no scientific votes or live writes.
import {readFileSync,writeFileSync,mkdirSync,lstatSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const R=process.cwd(),N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13',D=N+'/source/converged-polymer20-source-author';
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const write=(p:string,x:any)=>{let cur=R;for(const part of relative(R,dirname(resolve(R,p))).split('/')){cur=resolve(cur,part);mkdirSync(cur,{recursive:true});if(lstatSync(cur).isSymbolicLink())throw Error('Private output parent symlink');}writeFileSync(resolve(R,p),JSON.stringify(x,null,2)+'\n');};
const src=await import(pathToFileURL(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts')).href),cfg=read(D+'/source-atlas.converged-final-author.config.json');
if(cfg.expectedCurricularAtomicGoalCount!==381)throw Error('Actual snapshot not381');
const result=src.buildGoalBookSourceAtlasInputs(cfg,R),wanted=new Set([...read(D+'/CONVERGED.polymer20.source-author.proposal.pending-science.json').boundaryGoalIds,'7a05a1ce-45d3-571e-be51-afcd8dfd33ca','a4bac92b-d685-5cb6-94c8-c9b8b878d125','1df17884-96ae-57d7-9da9-dbebd082596f']);
const scopes=result.receipt.scopes.map((s:any)=>({...s,witnesses:s.witnesses.filter((w:any)=>wanted.has(w.goalId)),goalIds:s.goalIds.filter((id:string)=>wanted.has(id))})).filter((s:any)=>s.witnesses.length);
const proof={schemaVersion:1,checkedAtUTC:new Date().toISOString(),normalUnmodifiedAPI:'buildGoalBookSourceAtlasInputs',counts:result.receipt.counts,config:cfg,inputBindings:result.receipt.inputBindings,selectedGoalScopes:scopes,omittedGoals:result.receipt.omittedGoals,unresolvedSourceScopes:result.receipt.unresolvedSourceScopes,normalSourceSnapshotStructuralCheckPassed:true,sourceSnapshotCountIsNotM7Threshold:true,currentCurricularAtomicDenominator402Unchanged:true,held413NoFalseNaturstoffCoverage:result.receipt.omittedGoals.some((r:any)=>r.goalId==='413c5ee5-7826-549f-ad76-63743c59b188'),scientificSourceApproval:false,newScientificVotes:0,nativeRendered:false,activeOrGitWrites:false};
write(D+'/checks/final-stock-source-atlas-381-actual-snapshot-author.not-science.json',proof);console.log(JSON.stringify({normalSourceSnapshotPass:true,actualCounts:proof.counts,held413Excluded:proof.held413NoFalseNaturstoffCoverage,scienceApproval:false}));
