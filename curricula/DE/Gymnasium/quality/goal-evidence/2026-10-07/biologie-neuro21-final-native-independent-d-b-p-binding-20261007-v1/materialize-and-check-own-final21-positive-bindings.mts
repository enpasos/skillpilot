import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js';
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js';
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts';
const root='/home/enpasos/projects/skillpilot';
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-final-native-independent-d-b-p-binding-20261007-v1';
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-final-reviewed-images-native-preparation-20261007-v1';
const load=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const first=load(out+'/final21.first-pass.independent-d-b-p-binding.raw.json');
if(first.newRootDAJudgmentsRead!==false||first.verdict!=='KEEP_CURRENT_FINAL_BOUND_INPUTS')throw new Error('Unsealed independent first pass');
const raw=load(base+'/final21-whole-native-image-page-context-source-material-binding-review-input.author.raw.json');
const config=load(base+'/candidate-scaffolds/positive21.final-image-candidate.config.json');
const landscape=load(config.landscapePath);
const ledger=load(config.semanticKindLedgerPath);
const criteria=sha(readFileSync(resolve(root,config.reviewCriteriaPath)));
const ajv=new Ajv2020({allErrors:true});addFormats(ajv);
const validate=ajv.compile(load('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));
const goalBound:any[]=[];const imageBound:any[]=[];const actualBindings:any[]=[];const errors:string[]=[];
for(const r of raw.records){
 const finding=first.records.find((f:any)=>f.goalId===r.goalId);
 if(!finding)throw new Error('No actual first-pass finding');
 const goal=landscape.goals.find((g:any)=>g.id===r.goalId);
 if(!isDeepStrictEqual(goal,r.wholeFinalImageCandidateGoal))throw new Error('Actual current final goal mismatch');
 const kind=ledger.decisions.find((d:any)=>d.goalId===r.goalId);
 if(kind.semanticKind!=='curricularAtomic'||kind.decisionStatus!=='authoritative')throw new Error('Unexpected semantic kind');
 const profile=r.positiveCurrentFinalProfileBody;
 if(!isDeepStrictEqual(profile,r.positiveFinalTechnicalCandidateRecord.profile))throw new Error('Current complete profile mismatch');
 const now=new Date().toISOString();
 const rec={...r.positiveFinalTechnicalCandidateRecord,reviewId:'bio-neuro21-final-native-independent-b-goal-binding',reviewCriteriaFingerprint:criteria,
 goalFingerprint:fingerprintGoalForPositiveEvidence(goal,kind.semanticKind),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,{},kind.semanticKind),
 profileFingerprint:fingerprintPositiveGoalEvidenceProfile(profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:now,
 reviewer:'Codex independent targeted D-B/P-binding /root/bio_ce19_v2_visual_b; exact serving model not exposed',
 reason:finding.ownReason+' Actual final native page and exact image bytes reviewed before rebinding. Unchanged science reused within retained source limits.',
 evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],
 dissent:['Whole original source/country-scope holds remain intact.','Image is orientation, not empirical or independently produced learner evidence; human approval and trial remain absent.','This is a targeted final binding review retaining 20 exact P bodies and separately reviewed 080b v4; no active import, release, practical trial or strict gain.'],profile};
 const link=goal.resourceLinks.find((l:any)=>l.type==='goal-visualization');
 const path=raw.privatePublicRootForNativeHtmlAndPdf+'/'+link.url.replace(/^\//,'');
 const digest=sha(readFileSync(resolve(root,path)));
 if(digest!=='sha256:'+finding.selectedExactOriginal.sha256)throw new Error('Actual image bytes changed');
 const resourceDigests={[link.url]:digest};
 const imgRec={...rec,reviewId:'bio-neuro21-final-native-independent-b-image-binding',reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resourceDigests,kind.semanticKind)};
 for(const [mode,record,digests] of [['goal',rec,{}],['image',imgRec,resourceDigests]] as const){
  if(!validate(record))errors.push(r.goalId+' '+mode+': '+ajv.errorsText(validate.errors));
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(record,goal,digests,kind.semanticKind).map(e=>mode+': '+e));
 }
 if(rec.profileFingerprint!==r.positiveFinalTechnicalCandidateRecord.profileFingerprint)throw new Error('Exact profile changed');
 goalBound.push(rec);imageBound.push(imgRec);
 actualBindings.push({goalId:r.goalId,nativeSubsetName:r.nativeFinalSubsetName,pdfPhysicalPage:r.actualPdfPhysicalPageNumber,goalFingerprint:r.nativeFinalSubsetDInput.goalFingerprint,pageFingerprint:r.nativeFinalSubsetDInput.pageFingerprint,contextFingerprint:r.nativeFinalSubsetDContextFingerprint,positiveGoalFingerprint:imgRec.goalFingerprint,positiveImageBoundReviewInputFingerprint:imgRec.reviewInputFingerprint,positiveProfileFingerprint:imgRec.profileFingerprint,resourceDigests,actualImagePath:path,actualView:finding.actualPageViewedViaViewImage});
}
writeFileSync(resolve(root,out,'positive21.final-goal-binding.actual.jsonl'),goalBound.map(r=>JSON.stringify(r)).join('\n')+'\n');
writeFileSync(resolve(root,out,'positive21.final-image-binding.actual.jsonl'),imageBound.map(r=>JSON.stringify(r)).join('\n')+'\n');
writeFileSync(resolve(root,out,'positive21.final-goal-binding.native.config.json'),JSON.stringify({...config,reviewId:'bio-neuro21-final-native-independent-b-goal-binding',reviewPath:out+'/positive21.final-goal-binding.actual.jsonl',scope:{label:'Independent final21 goal/link-bound P candidates after actual native page/image review; image digest API check separately bound',goalIds:raw.exactSelected21GoalIds}},null,2)+'\n');
const report={role:'existing-native-positive-v2-schema-and-image-digest-semantics-check',reviewedResourceTypes:['goal-visualization'],nativeFunction:'validatePositiveGoalEvidenceRecordSemantics',nativeSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',currentGoalCount:goalBound.length,imageBoundGoalCount:imageBound.length,errors,records:actualBindings,standardConfigCliLimitation:'Standard CLI resolves raster bytes only from active app/public; own ordinary config checks current final goal/link bindings with reviewedResourceTypes=[], while this existing native API check supplies exact reviewed isolated raster digests to the same fingerprint and semantic functions.',humanApproval:false,humanTrial:false,strictGain:0};
writeFileSync(resolve(root,out,'positive21.current-page-image-bindings.native-api-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({goalBoundCount:goalBound.length,imageBoundCount:imageBound.length,nativeSchemaAndImageSemanticsErrors:errors.length,approved:0,needsHumanReview:21},null,2));
if(errors.length)process.exitCode=1;
