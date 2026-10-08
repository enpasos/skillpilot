// Apache-2.0. Native input binding/schema check, not a substitute for the substantive receipt.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts';
const directory=dirname(fileURLToPath(import.meta.url));const root=resolve(directory,'../../../../../../..');
const source=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e-company-twenty-bilingual-positive-author-v1');
const require=createRequire(resolve(root,'app/package.json'));const Ajv=require('ajv/dist/2020.js').default;const formats=require('ajv-formats').default;
const h=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const read=async(p:string)=>JSON.parse((await readFile(p)).toString());
const schemaBytes=await readFile(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));const schema=JSON.parse(schemaBytes.toString());const ajv=new Ajv({allErrors:true,strict:false});formats(ajv);const check=ajv.compile(schema);
const criteriaBytes=await readFile(resolve(directory,'independent-review.criteria.md'));
const goals=await read(resolve(source,'whole-goals.candidate.json'));const candidates=await read(resolve(source,'positive.schema-corrected.candidates.json'));
const originals=await read(resolve(source,'whole-goals.original.json'));const live=await read(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'));const liveg=new Map(live.goals.map((g:any)=>[g.id,g]));
const registry=await read(resolve(root,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'));const subject=registry.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften');const kind=await read(resolve(root,subject.semanticKindLedgerPath));const kinds=new Map(kind.decisions.filter((d:any)=>d.decisionStatus==='authoritative').map((d:any)=>[d.goalId,d.semanticKind]));
const authorRecords=(await readFile(resolve(source,'positive.schema-smoke.records.inert.jsonl'),'utf8')).trim().split('\n').map(x=>JSON.parse(x));const rows:any[]=[];const errors:any[]=[];
for(let i=0;i<20;i++){
 const g=goals[i],o=originals[i],c=candidates.goals[i],r=authorRecords.find((x:any)=>x.goalId===g.id);
 if(g.id!==o.id||g.id!==c.goalId||kinds.get(g.id)!=='curricularAtomic')throw new Error('Identity/kind mismatch');
 if(JSON.stringify(o)!==JSON.stringify(liveg.get(g.id)))throw new Error('Whole original/live drift '+g.id);
 const delta=[...new Set([...Object.keys(g),...Object.keys(o)])].filter(k=>JSON.stringify(g[k])!==JSON.stringify(o[k])).sort();
 if(JSON.stringify(delta)!==JSON.stringify(['descriptionEn','titleEn']))throw new Error('Wrong target delta');
 if(r.goalFingerprint!==fingerprintGoalForPositiveEvidence(g,'curricularAtomic')||r.profileFingerprint!==fingerprintPositiveGoalEvidenceProfile(c.profile))throw new Error('Native input/profile binding mismatch');
 if(JSON.stringify(r.profile)!==JSON.stringify(c.profile))throw new Error('Profile byte drift');
 if(!check(r))errors.push({goalId:g.id,schemaErrors:structuredClone(check.errors)});
 const se=validatePositiveGoalEvidenceRecordSemantics(r,g,{},'curricularAtomic');if(se.length)errors.push({goalId:g.id,semanticErrors:se});
 rows.push({goalId:g.id,nativeGoalFingerprint:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),nativeProfileFingerprint:fingerprintPositiveGoalEvidenceProfile(c.profile),ownCriteriaInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,h(criteriaBytes),{},'curricularAtomic'),nativeClosedRecordStatus:r.status,actualCandidateCaseIds:c.profile.applicationCaseBriefs.map((x:any)=>x.id),semanticAtomicityMemoryFingerprintUpdatesStillRequired:true,resourceDigestsSupplied:{}});
}
const out={schemaVersion:1,checkedAt:new Date().toISOString(),role:'independent_native_positive_binding_and_closed_schema_check',reviewerAgent:'/root/economics_visual_memory_audit',model:'Codex session; exact serving model identifier not exposed',passed:errors.length===0,errors,goalCount:20,caseCount:40,rows,nativeFunctionsPath:'app/scripts/positiveGoalEvidenceProfileModel.ts',nativeFunctionsSha256:h(await readFile(resolve(root,'app/scripts/positiveGoalEvidenceProfileModel.ts'))),schemaPath:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',schemaSha256:h(schemaBytes),ownCriteriaSha256:h(criteriaBytes),authorCandidatePath:source.replace(root+'/','')+'/positive.schema-corrected.candidates.json',authorCandidateSha256:h(await readFile(resolve(source,'positive.schema-corrected.candidates.json'))),currentRegisteredSemanticKindLedgerPath:subject.semanticKindLedgerPath,currentRegisteredSemanticKindLedgerSha256:h(await readFile(resolve(root,subject.semanticKindLedgerPath))),substantiveReviewReceiptIsSeparate:true,actualResourcesOrImagesInspected:false,finalCurrentResourceBoundPClaimed:false,humanApprovalClaimed:false,learnerPerformanceClaimed:false,newStrictClosures:0,liveWrites:0};
await writeFile(resolve(directory,'native-own-positive-schema-and-binding.actual.receipt.json'),JSON.stringify(out,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({passed:out.passed,goals:20,cases:40,errors}));if(errors.length)process.exit(1);
