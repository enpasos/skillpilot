import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const base="curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-036-function-representations-7-v1";
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const selected=json(base+'/selection-audit.json').selected;
const ids=new Set<string>(selected.map((g:any)=>g.goalId));
const current=new Map<string,any>(selected.map((g:any)=>[g.goalId,g]));
function rg(args:string[]){try{return execFileSync('rg',args,{encoding:'utf8',maxBuffer:100_000_000}).trim().split('\n').filter(Boolean)}catch(e:any){if(e.status===1)return [];throw e}}
const dRoots=['curricula/DE/Gymnasium/quality/goal-description-review','tmp/goal-description-reviews','tmp/goal-description-pilots','tmp/goal-books'];
const dFiles=rg(['--files','-uu',...dRoots,'-g','*records*.jsonl','-g','*.resolution.json','-g','*.review.jsonl']);
const records:any[]=[],resolutions:any[]=[],ignoredOtherLaneRecords:any[]=[],errors:any[]=[];
for(const file of dFiles){
 const text=readFileSync(file,'utf8');
 if(![...ids].some(id=>text.includes(id)))continue;
 const lines=file.endsWith('.jsonl')?text.split('\n'):[text];
 for(const [i,line]of lines.entries()){if(!line.trim())continue;let r:any;try{r=JSON.parse(line)}catch(e:any){errors.push({file,line:i+1,error:String(e)});continue}
 const gid=r.goalId??r.goal?.goalId;
 if(!ids.has(gid))continue;
 if(!file.endsWith('.resolution.json') && !(typeof r.recordId==='string' && typeof r.decision==='string' && typeof r.pageFingerprint==='string')){ignoredOtherLaneRecords.push({file,line:i+1,goalId:gid,reason:'Not a Description record; separate atomicity/memory/other ledger'});continue;}
 const c=current.get(gid);
 const meta={file,line:i+1,goalId:gid,recordId:r.recordId??null,runId:r.runId??null,schema:r.$schema??null,recordDigest:sha(line),goalFingerprint:r.goalFingerprint??r.goal?.goalFingerprint??null,pageFingerprint:r.pageFingerprint??r.goal?.pageFingerprint??null,
 currentGoalFingerprint:c.goalFingerprint,currentAtlasPageFingerprint:c.pageFingerprint,
 goalFingerprintMatches:(r.goalFingerprint??r.goal?.goalFingerprint)===c.goalFingerprint,
 atlasPageFingerprintMatches:(r.pageFingerprint??r.goal?.pageFingerprint)===c.pageFingerprint,
 decision:r.descriptionDecision??r.descriptionReview?.decision??r.decision??null,keys:Object.keys(r)};
 if(file.endsWith('.resolution.json'))resolutions.push(meta);else records.push(meta);
 }
}
const pRoots=['curricula/DE/Gymnasium/quality','tmp'];
const pFiles=rg(['-l','-uu','--glob','*.json','--glob','*.jsonl','--glob','!**/node_modules/**','--glob','!**/curriculum-release-model/**','--glob','!**/deploy/**','--glob','!**/package-store*/**','"essentialUnderstandingDe"',...pRoots]);
const profiles:any[]=[];
for(const file of pFiles){
 const text=readFileSync(file,'utf8');if(![...ids].some(id=>text.includes(id)))continue;
 let docs:any[];try{docs=file.endsWith('.jsonl')?text.split('\n').filter(Boolean).map(JSON.parse):[JSON.parse(text)]}catch(e:any){errors.push({file,error:String(e)});continue}
 for(const [line,doc]of docs.entries()){
 for(const r of [doc,...(Array.isArray(doc.goals)?doc.goals:[])]){
  const profile=r.profile??r;if(!ids.has(r.goalId)||!Array.isArray(profile.expectations)||!Array.isArray(profile.applicationCaseBriefs))continue;
  profiles.push({file,line:file.endsWith('.jsonl')?line+1:null,goalId:r.goalId,reviewId:r.reviewId??doc.reviewId??null,schema:r.$schema??null,status:r.status??null,authority:r.reviewAuthority??null,goalFingerprint:r.goalFingerprint??null,profileFingerprint:r.profileFingerprint??null,reviewInputFingerprint:r.reviewInputFingerprint??null,cases:profile.applicationCaseBriefs.length,bound:typeof r.reviewInputFingerprint==='string'});
 }
 }
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),grantsProgress:false,selectedGoalIds:[...ids],searched:{descriptionRoots:dRoots,descriptionFiles:dFiles.length,positiveRoots:pRoots,positiveFiles:pFiles.length,positiveExcludedCopies:['node_modules','curriculum-release-model','deploy','package-store*']},records,resolutions,profiles,ignoredOtherLaneRecords,parseErrors:errors,notes:['Only direct own-goal records counted; context mentions do not count.','Current atlas page mismatch alone is not proof of obsolete competence: old standalone book context may differ.','P candidates without binding are not counted as current records.']},null,2));
