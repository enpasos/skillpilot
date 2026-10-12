import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const own=dirname(fileURLToPath(import.meta.url));
const root='/home/enpasos/projects/skillpilot';
const nativeRead=fs.readFileSync;
const hash=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const receipt=JSON.parse(nativeRead(resolve(own,'FOUR.flat-projection-diff-and-CAS.receipt.json'),'utf8'));
const baseline=new Map(),candidate=new Map(),cache=new Map(),reads={baseline:new Map(),candidate:new Map()};
for(const a of receipt.adoptions){
 const cb=nativeRead(resolve(root,a.candidatePath));assert.equal(hash(cb),a.candidateSha256);
 const b=JSON.parse(cb);
 for(const o of [...receipt.operations.filter(o=>o.targetPath===a.targetPath)].reverse()){
  if(o.kind==='append'){assert.deepEqual(b.mappings[o.index],o.after);b.mappings.splice(o.index,1);}
  else{assert.deepEqual(b.mappings[o.index],o.after);b.mappings[o.index]=o.before;}
 }
 const bb=Buffer.from(JSON.stringify(b,null,2)+'\n');assert.equal(hash(bb),a.expectedCurrentSha256);
 baseline.set(resolve(root,a.targetPath),bb);candidate.set(resolve(root,a.targetPath),cb);
}
let phase='baseline';
fs.readFileSync=function(path,options){
 const abs=typeof path==='string'?resolve(path):path instanceof URL?fileURLToPath(path):null;
 if(abs&&abs.startsWith(resolve(root,'curricula')+'/')){
  let b=(phase==='baseline'?baseline:candidate).get(abs);
  if(!b){if(!cache.has(abs))cache.set(abs,nativeRead(path));b=cache.get(abs);}
  reads[phase].set(abs,hash(b));
  const encoding=typeof options==='string'?options:options?.encoding;
  return encoding?b.toString(encoding):Buffer.from(b);
 }
 return nativeRead(path,options);
};
syncBuiltinESMExports();
const compiler=await import(pathToFileURL(resolve(root,'app/scripts/applicabilityCompiler.ts')).href);
const times={};
let start=performance.now();const before=compiler.buildApplicabilityCompilation();times.baselineMs=Math.round(performance.now()-start);
phase='candidate';start=performance.now();const after=compiler.buildApplicabilityCompilation();times.candidateMs=Math.round(performance.now()-start);
fs.readFileSync=nativeRead;syncBuiltinESMExports();
const landscapeId='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0';
const reportBefore=before.reports.find(r=>r.landscapeId===landscapeId),reportAfter=after.reports.find(r=>r.landscapeId===landscapeId);
assert(reportBefore&&reportAfter);
const gibbs='dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5',hess='4a08f31f-204c-5339-9d9f-5d2af28d5d5c';
const oldG=reportBefore.goals.find(g=>g.goalId===gibbs),newG=reportAfter.goals.find(g=>g.goalId===gibbs);assert(oldG&&newG);
assert(newG.compiledApplicability.jurisdiction.includes('DE-NW'));
for(const jurisdiction of ['DE-HE','DE-HH','DE-NW'])assert(newG.evidence.some(e=>e.kind==='mapping'&&e.value===jurisdiction&&receipt.adoptions.some(a=>a.targetPath===e.source)));
const inputChanges=[];
for(const [p,d] of reads.baseline){if(reads.candidate.get(p)!==d)inputChanges.push({path:relative(root,p),before:d,after:reads.candidate.get(p)});}
// Module-initialization reads may occur only in baseline; compare the actual build inputs present in both phases.
assert.equal(inputChanges.filter(x=>x.after).length,3);assert.deepEqual(inputChanges.filter(x=>x.after).map(x=>x.path).sort(),receipt.adoptions.map(x=>x.targetPath).sort());
const changedGoals=[];
for(const ar of after.reports){const br=before.reports.find(r=>r.landscapeId===ar.landscapeId);for(const ag of ar.goals){const bg=br.goals.find(g=>g.goalId===ag.goalId);if(JSON.stringify(bg)!==JSON.stringify(ag))changedGoals.push({landscapeId:ar.landscapeId,goalId:ag.goalId,before:bg.compiledApplicability,after:ag.compiledApplicability});}}
const result={schemaVersion:1,role:'Normal unmodified applicability compiler executed against private read-only baseline/candidate buffers for exactly three live mapping paths',createdAt:new Date().toISOString(),productionCompiler:{path:'app/scripts/applicabilityCompiler.ts',sha256:hash(nativeRead(resolve(root,'app/scripts/applicabilityCompiler.ts')))},transport:{method:'Scoped node:fs readFileSync overlay; normal compiler module unchanged; baseline buffers reconstruct exact CAS bytes, candidate buffers are own regular files; unchanged curriculum file reads cached byte exact between runs',baselineAndCandidateUniqueReadCounts:[reads.baseline.size,reads.candidate.size],changedInputs:inputChanges.filter(x=>x.after),baselineOnlyModuleInitializationInputs:inputChanges.filter(x=>!x.after),writeApplicabilityReportsInvoked:false,activeWrites:false},timings:times,baselineSummary:before.summary,candidateSummary:after.summary,gibbsBefore:oldG,gibbsAfter:newG,hessAfter:reportAfter.goals.find(g=>g.goalId===hess),changedGoals,assertions:{candidateGibbsNWApplicable:true,allThreePromotedMappingPathsContributeGibbs:true,onlyThreeMappedInputReadsChanged:true,scientificVotesCreated:false,humanApproval:false},publicationTestRun:false};
fs.writeFileSync(resolve(own,'NORMAL.applicability-private-overlay.actual.receipt.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',timings:times,readFiles:reads.baseline.size,baselineErrors:before.summary.errors,candidateErrors:after.summary.errors,gibbsJurisdictionsBefore:oldG.compiledApplicability.jurisdiction,gibbsJurisdictionsAfter:newG.compiledApplicability.jurisdiction,changedGoals:changedGoals.length}));
