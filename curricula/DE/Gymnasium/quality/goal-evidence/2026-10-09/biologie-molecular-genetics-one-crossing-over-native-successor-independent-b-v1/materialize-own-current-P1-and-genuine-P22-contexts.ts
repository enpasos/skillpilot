import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts';
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/';
const author=base+'biologie-molecular-genetics-one-crossing-over-native-successor-preparation-author-v1/';
const own=base+'biologie-molecular-genetics-one-crossing-over-native-successor-independent-b-v1/';
const prior=base+'biologie-molecular-genetics-six-current-native-successor-independent-b-v1/';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const write=(p:string,v:any)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const bind=(p:string)=>({path:p,sha256:digest(p),bytes:readFileSync(p).length});
const first=read(own+'native-one15-actual-D-P.independent-b.scientific-first.verdict.json');
const input=read(author+'neutral-one15-native-successor-and-whole-case-retention.independent-review.entry.json');
const goalId=input.goalIds[0];
const goals=new Map(read(input.candidateCanonicalPath).goals.map((g:any)=>[g.id,g]));
const bodies=new Map(read(input.wholeCaseMaterialsPath).entries.map((e:any)=>[e.goalId,e]));
const goal:any=goals.get(goalId);const body:any=bodies.get(goalId);
if(JSON.stringify(goal)!==JSON.stringify(body.wholeCurrentGoalWithResources))throw Error('Current full goal differs');
const template=read(input.positiveConfigPath);const criteria=digest(template.reviewCriteriaPath);
const raster=input.rasterBindings[0];const actualDigest=digest(raster.actualOriginalImage.path);
if(actualDigest!==raster.actualOriginalImage.sha256||digest(raster.portableAlias.path)!==actualDigest)throw Error('Actual selected PNG/portable bytes differ');
const resourceDigests={[raster.resourceLinkCandidate.url]:actualDigest};
const directory=own+'positive-normal/one-current-native15/';mkdirSync(directory,{recursive:true});
const reviewId='biologie-molecular-genetics-one15-positive-independent-b-v1';const runId=reviewId+'.actual-targeted-review';
const recordPath=directory+'profiles.independent-b.jsonl';const configPath=directory+'profiles.independent-b.config.json';const runPath=directory+'profiles.independent-b.run.json';
const record:any={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria,landscapeId:template.landscapeId,goalId,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resourceDigests,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(body.wholeProfile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:first.reviewedAt,reviewer:'Codex independent B /root/bio_science14_independent_b',reason:(first.rationale+' Whole positive understanding: independently explain reshuffling existing alleles, conditional heritable population effects across generations, and limits from missing alleles, changed fitness or purely somatic exchange. Full authored whole pair and both fresh-transfer responses were actually read; profile/cases are value exact and the actual selected current raster/native15 resolves the own marker finding. This does not convert the constructed case answers into observed learner work or a real experiment.').trim(),evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[runId],dissent:[],profile:body.wholeProfile};
const errors=validatePositiveGoalEvidenceRecordSemantics(record,goal,resourceDigests,'curricularAtomic');if(errors.length)throw Error(errors.join('\n'));
writeFileSync(recordPath,JSON.stringify(record)+'\n',{flag:'wx'});
write(configPath,{...template,reviewId,reviewPath:recordPath,reviewRunManifestPaths:[runPath],requireApproved:false,reviewedResourceTypes:['goal-visualization'],scope:{label:'Independent B actual current native15 and one corrected raster; finite candidate only, source/course/wholeV separate',goalIds:[goalId]}});
const campaign=read(author+'native-one15/round-b/description-review-campaign.json');const bundle=read(author+'native-one15/bundle/review-bundle-manifest.json');
write(runPath,{$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,runId,bundleFingerprint:campaign.bundleFingerprint,bookDigest:campaign.bookDigest,provider:'OpenAI Codex agent session',model:'Codex; exact provider model identifier not exposed',role:'subject_reviewer',promptFamilyId:'biology-positive-understanding-evidence-profile-v1',promptFingerprint:criteria,criteriaFingerprint:criteria,generationParametersFingerprint:digest(own+'actual-native-one15-generation-parameters.disclosure.json'),independenceGroupId:campaign.independenceGroupId,blindToOtherRuns:true,goalIds:[goalId],inputArtifacts:[{role:'book_model',digest:campaign.bookDigest},...bundle.artifacts.filter((a:any)=>['book_pdf','book_pdf_render_manifest','book_html','book_html_render_manifest'].includes(a.role)).map((a:any)=>({role:a.role,digest:a.digest})),{role:'review_input_json',digest:digest(input.wholeCaseMaterialsPath)},{role:'review_prompt',digest:criteria},{role:'review_criteria',digest:criteria}],startedAt:read(own+'native-one15.actual-independent-b.input-first.freeze.json').createdAt,completedAt:new Date().toISOString(),status:'completed',outputDigest:digest(recordPath),toolchainVersion:'codex-independent-b-native-one15-positive-v1'});
const priorPartitions=read(prior+'normal-current-disjoint-P23.valid-slug-contract-successor.actual.receipt.json').partitions;
const previousSemantic=read(prior+'normal-current-P6-P1-literal-P16.materialization.actual.receipt.json');const semanticById=new Map(previousSemantic.existingNormalSemanticProbes.map((p:any)=>[p.goalId,p]));
const partitions:any[]=[{role:'one_actual_current_native15',goalIds:[goalId],profileCount:1,config:bind(configPath),records:bind(recordPath),run:bind(runPath),genuineBundleFingerprint:campaign.bundleFingerprint,genuineBookDigest:campaign.bookDigest,newActualNativePageReview:true,wholeScienceRestarted:false}];
const reusedProbes:any[]=[];
for(const part of priorPartitions){
 const cfg=read(part.config.path);
 const originalLines=readFileSync(part.records.path,'utf8').split('\n').filter(x=>x.length);
 const lines=originalLines.filter(l=>JSON.parse(l).goalId!==goalId);const ids=lines.map(l=>JSON.parse(l).goalId);
 for(const line of lines){const r=JSON.parse(line);const g:any=goals.get(r.goalId);const e:any=bodies.get(r.goalId);const priorSemantic:any=semanticById.get(r.goalId);if(JSON.stringify(r.profile)!==JSON.stringify(e.wholeProfile))throw Error('Reused body differs '+r.goalId);const errs=validatePositiveGoalEvidenceRecordSemantics(r,g,priorSemantic.resourceDigests,'curricularAtomic');if(errs.length)throw Error('Current reuse semantics differs '+r.goalId+' '+errs.join('\n'));reusedProbes.push({goalId:r.goalId,originalRecordPath:part.records.path,recordEntireLineByteExact:true,resourceDigests:priorSemantic.resourceDigests,normalExistingAPI:'validatePositiveGoalEvidenceRecordSemantics',errors:errs,newScienceReviewClaimed:false});}
 if(part.role==='six-current-native'){
  if(ids.length!==5)throw Error('Expected genuine unchanged5 from Native6');
  const reuseDir=own+'positive-normal/literal-native6-five/';mkdirSync(reuseDir,{recursive:true});const rp=reuseDir+'profiles.literal-independent-b.jsonl';const cp=reuseDir+'profiles.literal-independent-b.config.json';
  writeFileSync(rp,lines.join('\n')+'\n',{flag:'wx'});write(cp,{...cfg,landscapePath:input.candidateCanonicalPath,semanticKindLedgerPath:input.candidateKindsPath,reviewPath:rp,scope:{label:'Literal own actual Native6 other5 normal records; original six-book/run context preserved, no new review',goalIds:ids}});
  partitions.push({...part,role:'literal_original_actual_native6_five',goalIds:ids,profileCount:5,config:bind(cp),records:bind(rp),originalConfig:part.config,originalRecords:part.records,originalRun:part.run,run:part.run,recordLinesByteExact:true,originalSixBookContextPreserved:true,newActualNativePageReview:false});
 }else{partitions.push({...part,newScienceReviewClaimed:false,currentWholeCanonicalGoalObjectsValueExact:true});}
}
const ids=partitions.flatMap(p=>p.goalIds);if(ids.length!==23||new Set(ids).size!==23)throw Error('Disjoint current23 required');
write(own+'normal-current-P1-and-genuine-literal-P22.materialization.actual.receipt.json',{schemaVersion:1,role:'normal_current_one15_P1_and_genuine_literal_P22_contexts_after_own_FIRST',actualCurrentP1:{recordPath,configPath,runPath,resourceDigests,actualOriginal:bind(raster.actualOriginalImage.path),portableAlias:bind(raster.portableAlias.path),existingAPI:'validatePositiveGoalEvidenceRecordSemantics',errors},partitions,actualCurrentDistinctGoals:23,unchanged22ActualOriginalRecordSemanticProbes:reusedProbes,all23WholeProfileBodiesValueExact:true,normalP1RoleBookModelSemanticDigest:true,noOther22RebindingToOneBook:true,normalActivePublicCheckPending:true,noPublicAliasesOrMonkeypatch:true,status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',humanApproval:false,humanTrial:false,strictGain:0,activeWrites:false});
console.log(JSON.stringify({newCurrentP1:1,literalCurrent22:reusedProbes.length,actualPartitionCounts:partitions.map(p=>({role:p.role,count:p.profileCount})),semanticErrors:[...errors,...reusedProbes.flatMap(p=>p.errors)]},null,2));
