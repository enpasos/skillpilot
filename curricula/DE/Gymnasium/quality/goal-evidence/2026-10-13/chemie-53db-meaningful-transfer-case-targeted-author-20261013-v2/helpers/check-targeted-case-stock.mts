import { readFileSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js';
import addFormats from '../../../../../../../../app/node_modules/ajv-formats/dist/index.js';
const R=process.cwd(),T='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-53db-meaningful-transfer-case-targeted-author-20261013-v2';
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(R,p))).digest('hex');
const write=(p:string,x:any)=>writeFileSync(resolve(R,p),JSON.stringify(x,null,2)+'\n');
const stock=await import(resolve(R,'app/scripts/positiveGoalEvidenceProfileModel.ts'));
const schema=read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json');
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);
const profileValidator=ajv.compile({$schema:schema.$schema,$defs:schema.$defs,...schema.properties.profile});
const profile=read(T+'/candidate/PROFILE.complete53db-targeted-after.DEEN.author.json').profile;
if(!profileValidator(profile))throw Error(ajv.errorsText(profileValidator.errors));
const old=read(T+'/inputs/exact-current406-original53db-P4-record.json');
const goal=read(T+'/inputs/exact-current406-whole53db-goal.json');
const refs=read(T+'/INPUTS.exact-existing-finding-case-profile-goal-image.bindings.json');
const asset=refs.original53dbImageBinding;
const digests:any={[asset.url]:sha(asset.source.path)};
const before=stock.fingerprintPositiveGoalEvidenceProfile(old.profile);
if(before!==old.profileFingerprint)throw Error('Original profile fingerprint mismatch');
const after=stock.fingerprintPositiveGoalEvidenceProfile(profile);
if(before===after)throw Error('No actual targeted profile change');
const goalFP=stock.fingerprintGoalForPositiveEvidence(goal,'curricularAtomic');
if(goalFP!==old.goalFingerprint)throw Error('Goal bytes/meaning have drifted');
const inputFP=stock.fingerprintPositiveGoalEvidenceReviewInput(goal,old.reviewCriteriaFingerprint,digests,'curricularAtomic');
if(inputFP!==old.reviewInputFingerprint)throw Error('Goal/resource input drift');
const guardOnly={...old,profile,profileFingerprint:after,reason:'Schema/semantic guard object for unreviewed targeted author correction only; no P or D acceptance'};
const semanticErrors=stock.validatePositiveGoalEvidenceRecordSemantics(guardOnly,goal,digests,'curricularAtomic');
if(semanticErrors.length)throw Error(semanticErrors.join('; '));
const c=read(T+'/candidate/CASE2.complete-targeted-after.DEEN.author.json');
const b=profile.applicationCaseBriefs.find((x:any)=>x.id===c.caseId)!;
for(const lang of ['De','En']){
 if(b['taskDemand'+lang]!==c['data'+lang]+'\n'+c['task'+lang])throw Error('Brief task/data join mismatch '+lang);
 if(b['expectedPerformance'+lang]!==c['modelAnswer'+lang])throw Error('Brief answer join mismatch '+lang);
 for(const row of c.rubric){
  const span=row['taskSpan'+lang];
  if(c['task'+lang].slice(span.start,span.end)!==row['taskClause'+lang])throw Error('Task span mismatch '+lang);
 }
}
write(T+'/checks/STOCK.profile-schema-fingerprints-and-case-joins.actual.json',{
 profileSchemaFragmentValid:true,stockSemanticGuardErrors:semanticErrors,
 originalProfileFingerprint:before,proposedProfileFingerprint:after,
 goalFingerprint:goalFP,goalFingerprintUnchanged:true,reviewInputFingerprint:inputFP,
 goalAndActualImageResourceInputFingerprintUnchanged:true,
 bothDataTaskBriefAndModelAnswerJoinsExact:true,bothOriginalAndNewRubricSpansExact:true,
 guardObjectWasNotWrittenAsReviewRecord:true,newPApproval:false,newDApproval:false,humanApproval:false,
 stockModule:{path:'app/scripts/positiveGoalEvidenceProfileModel.ts',sha256:sha('app/scripts/positiveGoalEvidenceProfileModel.ts')},
 stockSchema:{path:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',sha256:sha('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')}
});
console.log('Stock profile schema/semantic guard PASS; unchanged goal/image input; exact bilingual case joins and rubric spans. No P/D acceptance.');
