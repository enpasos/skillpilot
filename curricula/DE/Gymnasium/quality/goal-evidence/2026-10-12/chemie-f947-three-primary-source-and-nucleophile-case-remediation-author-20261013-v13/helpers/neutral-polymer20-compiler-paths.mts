// Apache-2.0. Unmodified compiler path data for source-first independent audit.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const R=process.cwd(),D='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13/source/converged-polymer20-source-author';
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8')),p=read(D+'/CONVERGED.polymer20.source-author.proposal.pending-science.json');
const mod=await import(pathToFileURL(resolve(R,'app/scripts/applicabilityCompiler.ts')).href),built=mod.buildApplicabilityCompilation(),can=read(D+'/candidate/canonical523.current402.polymer20-converged-source.compiled.author.json'),report=built.reports.find((r:any)=>r.landscapeId===can.landscapeId);
const ids=new Set([...p.boundaryGoalIds,'7a05a1ce-45d3-571e-be51-afcd8dfd33ca','a4bac92b-d685-5cb6-94c8-c9b8b878d125','1df17884-96ae-57d7-9da9-dbebd082596f']);
const rows=report.goals.filter((r:any)=>ids.has(r.goalId));const same=rows.every((r:any)=>JSON.stringify(r.compiledApplicability)===JSON.stringify(can.goals.find((g:any)=>g.id===r.goalId).applicability??{}));
if(!same)throw Error('Compiler prospective country drift after source freeze');
writeFileSync(resolve(R,D+'/neutral/actual-compiled-polymer20-and-three-protected-goal-evidence-paths.json'),JSON.stringify({schemaVersion:1,normalAPI:'buildApplicabilityCompilation',sameFinalCompiledCountrySets:true,sourceCompilerAlsoReadsAllActiveCompatibilityAliases:true,rows,scientificSourceApproval:false,newVotes:0,wholeSourceUnionApproved:false},null,2)+'\n');
console.log(JSON.stringify({compiledNeutralRows:rows.length,currentFinalCountrySetsExact:same,scientificApproval:false}));
