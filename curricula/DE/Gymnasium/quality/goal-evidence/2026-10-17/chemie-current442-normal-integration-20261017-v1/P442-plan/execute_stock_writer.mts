// Prepared replay only. Requires an explicit --execute; preparation does not invoke it.
import {readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {buildPositiveGoalEvidenceCandidateRecords, replaceFileAtomically} from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates.ts';
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../../app/scripts/positiveGoalEvidenceReview.ts';
const out=dirname(fileURLToPath(import.meta.url));
const root=resolve(out,'../../../../../../../..');
if(process.argv.slice(2).join(' ')!=='--execute')throw Error('Prepared only. Invoke --execute after Root authorizes the final stock materializer.');
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
const verify=(p:any)=>{const b=readFileSync(resolve(root,p.path));if(sha(b)!==p.sha256||b.length!==p.bytes)throw Error('Input pin drift '+p.path);};
const plan=read(relative(root,resolve(out,'P442.namespace-and-stock-writer.plan.json')));
const check=read(relative(root,resolve(out,'CHECK.P442.actual-stock-fingerprints-and-real-asset-inputs.json')));
verify(plan.canonical);verify(plan.semantic);verify(plan.selectedWriterInput);
const normalCanonical=readFileSync(resolve(root,plan.normalCanonicalInstallationGuard.path));
if(sha(normalCanonical)!==plan.normalCanonicalInstallationGuard.expectedSHA256||normalCanonical.length!==plan.normalCanonicalInstallationGuard.expectedBytes)throw Error('Install the exact selected C653 at its normal canonical path before the final stock writer.');
for(const row of check.resources){const p=resolve(root,'app/public',row.url.slice(1));if(!existsSync(p)||'sha256:'+sha(readFileSync(p))!==row.digest)throw Error('Install exact real normal asset before stock writer: '+row.url);}
const selected=readFileSync(resolve(root,plan.selectedWriterInput.path),'utf8').trim().split('\n').map(s=>JSON.parse(s));
const expected=new Map(readFileSync(resolve(out,'P442.stock-helper-current-record-candidates.NOT-final-materializer.jsonl'),'utf8').trim().split('\n').map(s=>{const r=JSON.parse(s);return[r.goalId,r];}));
const actual=new Map<string,any>();
const steps:any[]=[];
for(const ns of plan.namespaces){
 verify(ns.config);verify(ns.candidates);verify(ns.exactCriteria);
 const cfg=read(ns.config.path),candidateSet=read(ns.candidates.path);
 const records=await buildPositiveGoalEvidenceCandidateRecords({config:cfg,candidateSet});
 for(const record of records){if(actual.has(record.goalId))throw Error('Duplicate owner output '+record.goalId);if(JSON.stringify(record)!==JSON.stringify(expected.get(record.goalId)))throw Error('Stock writer differs from measured helper candidate '+record.goalId);actual.set(record.goalId,record);}
 const target=resolve(root,cfg.reviewPath);mkdirSync(dirname(target),{recursive:true});
 await replaceFileAtomically(target,Buffer.from(records.map(r=>JSON.stringify(r)).join('\n')+'\n'));
 const reviewed=reviewPositiveGoalEvidenceConfig(ns.config.path);
 if(reviewed.errors.length)throw Error(reviewed.errors.join('\n'));
 steps.push({ordinal:ns.ordinal,reviewId:ns.reviewId,recordCount:records.length,stockReviewErrors:reviewed.errors,outputPath:cfg.reviewPath,sha256:sha(readFileSync(target))});
}
const ordered=selected.map(r=>{const value=actual.get(r.goalId);if(!value)throw Error('Missing stock writer output '+r.goalId);return value;});
if(ordered.length!==442||actual.size!==442)throw Error('Whole442 writer selection changed');
const aggregate=resolve(out,'../P442.review.jsonl');
await replaceFileAtomically(aggregate,Buffer.from(ordered.map(r=>JSON.stringify(r)).join('\n')+'\n'));
writeFileSync(resolve(out,'EXECUTION.actual-final-stock-writer.json'),JSON.stringify({artifactType:'Actual stock materializer run; technical serialization only',createdAtUTC:new Date().toISOString(),steps,recordCount:442,aggregatePath:relative(root,aggregate),aggregateSHA256:sha(readFileSync(aggregate)),allOutputsEqualPreviouslyMeasuredStockHelperRecords:true,E0:ordered.filter(r=>r.evidenceLevel==='E0').length,E1:ordered.filter(r=>r.evidenceLevel==='E1').length,newScientificJudgments:0,normalCurriculumFilesChanged:false,assetCopiesPerformed:false,HumanApproval:false,M7Claim:false},null,2)+'\n');
console.log(JSON.stringify({namespaces:steps.length,profiles:442,aggregatePath:relative(root,aggregate),sha256:sha(readFileSync(aggregate))},null,2));
