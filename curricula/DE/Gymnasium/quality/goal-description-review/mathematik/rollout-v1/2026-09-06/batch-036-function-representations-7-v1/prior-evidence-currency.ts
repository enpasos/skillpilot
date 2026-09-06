import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import Ajv2020 from '../../../../../../../../../app/node_modules/ajv/dist/2020';
import {fingerprintGoalForEvidence} from '../../../../../../../../../app/scripts/goalEvidenceProfileModel';
import {loadGoalDescriptionRolloutBatchConfig} from '../../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch';
const base="curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-036-function-representations-7-v1";
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(s:string|Buffer)=>'sha256:'+createHash('sha256').update(s).digest('hex');
const jsha=(p:string)=>sha(readFileSync(p));
function rg(args:string[]){try{return execFileSync('rg',args,{encoding:'utf8',maxBuffer:100_000_000}).trim().split('\n').filter(Boolean)}catch(e:any){if(e.status===1)return [];throw e}}
async function main(){
const selection=json(base+'/selection-audit.json'), ids=new Set<string>(selection.selected.map((r:any)=>r.goalId));
const config=await loadGoalDescriptionRolloutBatchConfig(base+'.config.json');
assert.deepEqual(config.config.goalIds,[...ids]);
const landscape=json(selection.canonicalPath), ledger=json(selection.semanticKindLedgerPath);
assert.equal(jsha(selection.canonicalPath),selection.canonicalDigest,'Math canonical changed after selection');
const currentById=new Map(landscape.goals.filter((g:any)=>ids.has(g.id)).map((g:any)=>[g.id,g]));
const semanticKinds=new Map(ledger.decisions.filter((r:any)=>r.decisionStatus==='authoritative').map((r:any)=>[r.goalId,r.semanticKind]));
const roots=['curricula/DE/Gymnasium/quality/goal-description-review','tmp/goal-description-reviews','tmp/goal-description-pilots','tmp/goal-books'];
const files=rg(['-l','-uu','-F',...[...ids].flatMap(id=>['-e',id]),...roots,'--glob','*.json','--glob','*.jsonl','--glob','!**/contracts/**','--glob','!**/node_modules/**']);
const validateRecord=new Ajv2020({allErrors:true,strict:false}).compile(json('contracts/goal-description-review/v1/goal-description-review-record.schema.json'));
const found:any[]=[],foundResolutions:any[]=[],parseErrors:any[]=[];
const visit=(v:any,file:string,pointer:string,line:number|null)=>{
 if(!v||typeof v!=='object')return;
 if(typeof v.goalId==='string'&&ids.has(v.goalId)&&typeof v.recordId==='string'&&['keep','revise','split_review','block'].includes(v.decision)){
  const g:any=currentById.get(v.goalId),expected=fingerprintGoalForEvidence(g,'goal-evidence-v1',String(semanticKinds.get(v.goalId)));
  const keys=[['currentTitleDe','title'],['currentTitleEn','titleEn'],['currentDescriptionDe','description'],['currentDescriptionEn','descriptionEn']];
  const diffs=keys.filter(([rk,gk])=>v[rk]!==g[gk]).map(([rk,gk])=>({field:rk,old:v[rk],current:g[gk]}));
  const structural=validateRecord(v);
  found.push({file,line,pointer,goalId:v.goalId,recordId:v.recordId,runId:v.runId,decision:v.decision,recordDigest:sha(JSON.stringify(v)),goalFingerprint:v.goalFingerprint,currentGoalFingerprint:expected,goalFingerprintMatches:v.goalFingerprint===expected,recordTextMatchesCurrent:diffs.length===0,textDifferences:diffs,recordSchemaValid:!!structural,schemaErrors:structural?[]:validateRecord.errors,oldBookDigest:v.bookDigest,oldPageFingerprint:v.pageFingerprint,atlasPageFingerprint:selection.selected.find((s:any)=>s.goalId===v.goalId).pageFingerprint,usableAsCurrentStrictEvidence:false,reason:v.goalFingerprint===expected?'Historic single-round record has matching goal definition, but no current V3 contextual input/dual resolution; retain as history, do not silently rebind.':'Goal definition has changed; retain as historic adjudication evidence only.'});
 }
 if(v.goal&&ids.has(v.goal.goalId)&&(v.resolutionFingerprint||String(v.$schema??'').includes('resolution')))foundResolutions.push({file,line,pointer,goalId:v.goal.goalId,resolutionFingerprint:v.resolutionFingerprint??null});
 if(Array.isArray(v))v.forEach((x,i)=>visit(x,file,pointer+'/'+i,line));else Object.entries(v).forEach(([k,x])=>visit(x,file,pointer+'/'+k,line));
};
for(const file of files){if(file.startsWith(base+'/'))continue;const text=readFileSync(file,'utf8');const entries=file.endsWith('.jsonl')?text.split('\n'):[text];for(const [i,line]of entries.entries()){if(!line.trim())continue;try{visit(JSON.parse(line),file,'',file.endsWith('.jsonl')?i+1:null)}catch(e:any){parseErrors.push({file,line:i+1,error:String(e)})}}}
const historicCampaignPath='tmp/goal-description-reviews/math-gymnasium-full-20260816-v1/review-campaign/description-review-campaign.json';
const historicInputPath='tmp/goal-description-reviews/math-gymnasium-full-20260816-v1/review-campaign/description-review-input.json';
const historic=json(historicInputPath),campaign=json(historicCampaignPath);
const cp=json('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').subjects.find((s:any)=>s.subject==='mathematik');
assert.deepEqual(cp.resolutionIndexPaths,selection.indexBindings.map((b:any)=>b.path));
assert.deepEqual(cp.positiveEvidenceConfigPaths,selection.positiveConfigBindings.map((b:any)=>b.path));
selection.indexBindings.concat(selection.positiveConfigBindings).forEach((b:any)=>assert.equal(jsha(b.path),b.digest));
const held=json('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json').activeBatchConfigPaths.map((p:string)=>json(p)).filter((c:any)=>c.subject==='mathematik').flatMap((c:any)=>c.goalIds);
assert.deepEqual([...held].sort(),[...selection.heldGoalIds].sort());
console.log(JSON.stringify({checkedAt:new Date().toISOString(),grantsProgress:false,configSchemaValid:true,checkpointSubjectBindingsStillMatch:true,recordSearch:{roots,matchingJsonOrJsonlFiles:files.length,scope:'Recursive own-goal record objects, including unconventional filenames; inputs/context mentions excluded unless they contain an actual own-goal record object.'},records:found,resolutions:foundResolutions,parseErrors,historicInput:{path:historicInputPath,digest:jsha(historicInputPath),schemaVersion:historic.schemaVersion,selectedGoalsWithCanonicalContext:historic.goals.filter((g:any)=>ids.has(g.goalId)&&g.canonicalContext).length,selectedGoalsWithFullPage:historic.goals.filter((g:any)=>ids.has(g.goalId)&&g.reviewContext?.page).length},historicCampaign:{path:historicCampaignPath,digest:jsha(historicCampaignPath),independenceGroupId:campaign.independenceGroupId,promptFingerprint:campaign.promptFingerprint,criteriaFingerprint:campaign.criteriaFingerprint},currentCriteria:{path:config.config.criteriaPath,digest:jsha(config.config.criteriaPath)},currentPrompt:{path:config.config.promptPath,digest:jsha(config.config.promptPath)},strictCurrentRecordCount:0,strictCurrentResolutionCount:0,profileReviewConfigMatches:rg(['-l','-uu','-F',...[...ids].flatMap(id=>['-e',id]),'curricula/DE/Gymnasium/quality/goal-evidence','--glob','*.config.json'])},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1});
