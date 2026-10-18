import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {dirname, resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts';
const out=dirname(fileURLToPath(import.meta.url));
const root=resolve(out,'../../../../../../../..');
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>({path:relative(root,p),sha256:sha(readFileSync(p)),bytes:readFileSync(p).length});
const write=(name:string,o:any)=>writeFileSync(resolve(out,name),JSON.stringify(o,null,2)+'\n');
const plan=read(relative(root,resolve(out,'P442.namespace-and-stock-writer.plan.json')));
const selected=readFileSync(resolve(root,plan.selectedWriterInput.path),'utf8').trim().split('\n').map(s=>JSON.parse(s));
const canonical=read(plan.canonical.path);
const goals=new Map(canonical.goals.map((g:any)=>[g.id,g]));
const semantic=read(plan.semantic.path);
const kinds=new Map(semantic.decisions.filter((r:any)=>r.decisionStatus==='authoritative').map((r:any)=>[r.goalId,r.semanticKind]));
const assetsSelectionPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-V114-portable-exact-asset-input-selection-technical-20261017-v1/V114.source-and-independent-review-input-selection.json';
const v114=read(assetsSelectionPath);
const selectedAssets=new Map(v114.records.map((r:any)=>[r.imageUrl,r]));
const candidates=new Map<number,any>();
const configs=new Map<number,any>();
for(const ns of plan.namespaces){
  const cfg=read(ns.config.path),set=read(ns.candidates.path);
  if(sha(readFileSync(resolve(root,ns.config.path)))!==ns.config.sha256||sha(readFileSync(resolve(root,ns.candidates.path)))!==ns.candidates.sha256)throw Error('Namespace pin drift');
  configs.set(ns.ordinal,cfg);candidates.set(ns.ordinal,set);
}
const assetRows:any[]=[];
for(const row of v114.records){
 const p=resolve(root,row.selectedPNG.path);if(!existsSync(p)||sha(readFileSync(p))!==row.selectedPNG.sha256)throw Error('SelectedPNG pin mismatch '+row.goalId);
 const app=resolve(root,'app/public',row.imageUrl.slice(1));
 assetRows.push({goalId:row.goalId,imageUrl:row.imageUrl,selectedPNG:row.selectedPNG,normalAppPath:relative(root,app),normalAppExists:existsSync(app),normalAppMatchesSelected:existsSync(app)&&sha(readFileSync(app))===row.selectedPNG.sha256});
}
const measurements:any[]=[];
const nativeRecords:any[]=[];
const semanticErrors:string[]=[];
const resources:any[]=[];
for(const row of selected){
 const goal:any=goals.get(row.goalId);if(!goal||kinds.get(row.goalId)!=='curricularAtomic')throw Error('Missing authoritative current goal '+row.goalId);
 const cfg=configs.get(row.namespaceOrdinal),set=candidates.get(row.namespaceOrdinal);
 const spec=set.goals.find((g:any)=>g.goalId===row.goalId);
 const criteriaFingerprint='sha256:'+sha(readFileSync(resolve(root,cfg.reviewCriteriaPath)));
 const resourceDigests:Record<string,string>={};
 if(cfg.reviewedResourceTypes.includes('goal-visualization')){
  for(const link of goal.resourceLinks??[]){
   if(link.type!=='goal-visualization')continue;
   const normal=resolve(root,'app/public',link.url.slice(1));
   const chosen:any=selectedAssets.get(link.url);
   const source=chosen?resolve(root,chosen.selectedPNG.path):normal;
   if(!existsSync(source))throw Error('No real source asset '+row.goalId+' '+source);
   const digest=sha(readFileSync(source));
   if(chosen&&digest!==chosen.selectedPNG.sha256)throw Error('V114 selected asset mismatch');
   if(existsSync(normal)&&sha(readFileSync(normal))!==digest)throw Error('Normal image differs from selected source '+row.goalId);
   resourceDigests[link.url]='sha256:'+digest;
   resources.push({goalId:row.goalId,url:link.url,digest:'sha256:'+digest,realByteSource:relative(root,source),selectedVia:chosen?'V114 exact portable selected PNG':'existing normal app asset',normalAssetExists:existsSync(normal),normalAssetMatches:existsSync(normal)&&sha(readFileSync(normal))===digest});
  }
 }
 const record={
  $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,
  reviewId:cfg.reviewId,goalFingerprintRuleVersion:cfg.goalFingerprintRuleVersion,profileRuleVersion:cfg.profileRuleVersion,
  reviewCriteriaFingerprint:criteriaFingerprint,landscapeId:cfg.landscapeId,goalId:row.goalId,
  goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),
  reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFingerprint,resourceDigests,'curricularAtomic'),
  profileFingerprint:fingerprintPositiveGoalEvidenceProfile(row.profile),
  status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:set.reviewedAt,reviewer:set.reviewer,
  reason:spec.reason,evidenceLevel:spec.evidenceLevel,maximumClaimScope:spec.maximumClaimScope,reviewRunIds:[],dissent:spec.dissent??[],profile:row.profile,
 };
 semanticErrors.push(...validatePositiveGoalEvidenceRecordSemantics(record as any,goal,resourceDigests,'curricularAtomic'));
 const old=row.baselineRecord;
 measurements.push({goalId:row.goalId,namespaceOrdinal:row.namespaceOrdinal,reviewId:cfg.reviewId,wholeProfileSource:row.profileSource,
  profileChangedBySelection:row.profileChangedBySelection,newGoal:row.newGoal,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope,
  oldFingerprints:old?{goalFingerprint:old.goalFingerprint,reviewInputFingerprint:old.reviewInputFingerprint,profileFingerprint:old.profileFingerprint}:null,
  currentFingerprints:{goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint},
  delta:old?{goalFingerprint:old.goalFingerprint!==record.goalFingerprint,reviewInputFingerprint:old.reviewInputFingerprint!==record.reviewInputFingerprint,profileFingerprint:old.profileFingerprint!==record.profileFingerprint}:null,
  exactWholeProfileUnchanged:old?JSON.stringify(old.profile)===JSON.stringify(row.profile):false,
 });
 nativeRecords.push(record);
}
if(semanticErrors.length)throw Error(semanticErrors.join('\n'));
const old=measurements.filter(r=>!r.newGoal);
const counts={selected442:nativeRecords.length,baseline439:old.length,new3:measurements.filter(r=>r.newGoal).length,wholeProfileOverrides:old.filter(r=>r.profileChangedBySelection).length,unchangedWholeBaselineProfiles:old.filter(r=>r.exactWholeProfileUnchanged).length,
 goalFingerprintDelta:old.filter(r=>r.delta.goalFingerprint).length,reviewInputFingerprintDelta:old.filter(r=>r.delta.reviewInputFingerprint).length,profileFingerprintDelta:old.filter(r=>r.delta.profileFingerprint).length,
 anyFingerprintDelta:old.filter(r=>Object.values(r.delta).some(Boolean)).length,allThreeFingerprintsUnchanged:old.filter(r=>!Object.values(r.delta).some(Boolean)).length,
 E0:nativeRecords.filter(r=>r.evidenceLevel==='E0').length,E1:nativeRecords.filter(r=>r.evidenceLevel==='E1').length,
 realVisualizationByteBindings:resources.length,V114SourceAssetsVerified:assetRows.length,V114NormalAppBytesMatch:assetRows.filter(r=>r.normalAppMatchesSelected).length,missingNormalAppResources:resources.filter(r=>!r.normalAssetExists).length,recordSemanticErrors:semanticErrors.length};
writeFileSync(resolve(out,'P442.stock-helper-current-record-candidates.NOT-final-materializer.jsonl'),nativeRecords.map(r=>JSON.stringify(r)).join('\n')+'\n');
write('CHECK.P442.actual-stock-fingerprints-and-real-asset-inputs.json',{artifactType:'Actual P442 current binding measurement with unchanged stock fingerprint/semantic exports; not final stock materializer run or new science',canonical:plan.canonical,semantic:plan.semantic,selectedWriterInput:pin(resolve(root,plan.selectedWriterInput.path)),V114Selection:pin(resolve(root,assetsSelectionPath)),stockCode:[pin(resolve(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')),pin(resolve(root,'app/scripts/goalEvidenceProfileModel.ts'))],counts,measurements,resources,V114AssetChecks:assetRows,semanticErrors,normalMutation:false,assetCopyPerformed:false,finalStockMaterializerRun:false,newScientificJudgment:false,HumanApproval:false,M7Claim:false});
console.log(JSON.stringify(counts,null,2));
