import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts';
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/';
const author=base+'biologie-molecular-genetics-six-current-native-successor-preparation-author-v1/';
const oldAuthor=base+'biologie-molecular-genetics-twenty-three-native-preparation-author-v1/';
const own=base+'biologie-molecular-genetics-six-current-native-successor-independent-b-v1/';
const prior=base+'biologie-molecular-genetics-twenty-three-native-independent-b-v1/';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const write=(p:string,d:any)=>writeFileSync(p,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const bind=(p:string)=>({path:p,sha256:digest(p),bytes:readFileSync(p).length});
const first=read(own+'native6-actual-current-D-P.independent-b.scientific-first.verdict.json');
const input=read(author+'neutral-six-native-successor-and-two-case-rubrics.independent-review.entry.json');
const oldInput=read(oldAuthor+'neutral-twenty-three-native-independent-review.entry.json');
const material=read(input.wholeCaseMaterialsPath);
const goals=new Map(read(input.candidateCanonicalPath).goals.map((g:any)=>[g.id,g]));
const bodies=new Map(material.entries.map((e:any)=>[e.goalId,e]));
const template=read(input.positiveConfigPath);
const criteriaDigest=digest(template.reviewCriteriaPath);
const currentIDs=new Set(input.goalIds);
const karyo=input.karyogramCaseRubricGoalId;
const now=new Date().toISOString();
const receipts:any[]=[]; const partitions:any[]=[];
const metadata=own+'actual-native6-generation-parameters.disclosure.json';
const oldRecords=new Map<string,any>();
for(const part of [1,2]){
 const cfg=read(prior+`positive-normal/part-${part}-current-native/profiles.independent-b.config.json`);
 readFileSync(cfg.reviewPath,'utf8').trim().split('\n').map(JSON.parse).forEach((r:any)=>oldRecords.set(r.goalId,r));
}
for(const [name,ids] of [['six-current-native',input.goalIds],['one-karyogram-current-v7-case-text',[karyo]]] as [string,string[]][]){
 const directory=own+'positive-normal/'+name+'/';mkdirSync(directory,{recursive:true});
 const reviewId=`biologie-molecular-genetics-${name}-positive-independent-b-v1`;
 const runId=reviewId+'.actual-targeted-review';
 const recordPath=directory+'profiles.independent-b.jsonl';const configPath=directory+'profiles.independent-b.config.json';const runPath=directory+'profiles.independent-b.run.json';
 const native= name==='six-current-native'?author+'native-six/':oldAuthor+'native-twenty-three/part-2/';
 const campaign=read(native+'round-b/description-review-campaign.json');const manifest=read(native+'bundle/review-bundle-manifest.json');
 const records=ids.map((id:string)=>{
  const g:any=goals.get(id);const e:any=bodies.get(id);
  if(JSON.stringify(g)!==JSON.stringify(e.wholeCurrentGoalWithResources))throw Error('Actual whole goal differs '+id);
  const raster=(currentIDs.has(id)?input.rasterBindings:oldInput.rasterBindings).find((r:any)=>r.goalId===id);
  const dg=digest(raster.actualOriginalImage.path);if(dg!==raster.actualOriginalImage.sha256 || digest(raster.portableAlias.path)!==dg)throw Error('Actual PNG mismatch '+id);
  const resourceDigests={[raster.resourceLinkCandidate.url]:dg};
  const dissent=id==='183f3c47-ec20-5b98-8024-77ebd1c48abf'?['BIO23B-V15-CENTRAL-MARKER-001: actual central four chromatids have 1 green and 3 gold/orange lower markers while parental/output marker counts remain 2 and 2; reciprocal recombination must preserve alleles. Current V15 and Native15 resource binding remain HOLD.']:[];
  const decision=first.goalDecisions.find((d:any)=>d.goalId===id);
  const reason=id===karyo?'Targeted actual v7 reading closes only the two English criterionEn 1–22/X/Ytypes word-boundary findings. Whole current profile, goal and native part2 page remain value exact; complete finite matrices and both whole cases were actually read in the own immutable v7 FIRST and rechecked against the current native6 materials. This record uses the original unchanged part2 book context, with actual v7 case-material artifact separately bound. No fresh whole-goal/native review is claimed.':`The actual entire current DE/EN goal, own exact unchanged whole profile/cases, full HTML context and physical native page ${decision.actualPhysicalPage} were read. ${decision.reason} Original own whole23 science and targeted model reviews are reused only by exact whole values. Current six raster digests are independently byte verified.`;
  const r:any={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteriaDigest,landscapeId:template.landscapeId,goalId:id,goalFingerprint:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,criteriaDigest,resourceDigests,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(e.wholeProfile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:first.reviewedAt,reviewer:'Codex independent B /root/bio_science14_independent_b',reason:reason+' Candidate E1/G1 finite explanation and genuine fresh transfer only; no observed learner or real experimental performance, human, source/course, whole-V or M7 approval. '+dissent.join(' '),evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[runId],dissent,profile:e.wholeProfile};
  const errors=validatePositiveGoalEvidenceRecordSemantics(r,g,resourceDigests,'curricularAtomic');if(errors.length)throw Error(errors.join('\n'));
  receipts.push({goalId:id,role:name,actualOriginal:bind(raster.actualOriginalImage.path),portableAlias:bind(raster.portableAlias.path),resourceDigests,profileValueExact:true,normalSemanticAPI:'validatePositiveGoalEvidenceRecordSemantics',errors,currentRasterHold:dissent.length>0});return r;
 });
 writeFileSync(recordPath,records.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'});
 write(configPath,{...template,reviewId,reviewPath:recordPath,reviewRunManifestPaths:[runPath],requireApproved:false,reviewedResourceTypes:['goal-visualization'],scope:{label:`Independent B ${name}; actual finite current inputs, needs human review; source and visual holds separate`,goalIds:ids}});
 const currentCasePath=input.wholeCaseMaterialsPath;
 write(runPath,{$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,runId,bundleFingerprint:campaign.bundleFingerprint,bookDigest:campaign.bookDigest,provider:'OpenAI Codex agent session',model:'Codex; exact provider model identifier not exposed',role:'subject_reviewer',promptFamilyId:'biology-positive-understanding-evidence-profile-v1',promptFingerprint:criteriaDigest,criteriaFingerprint:criteriaDigest,generationParametersFingerprint:digest(metadata),independenceGroupId:campaign.independenceGroupId+'.targeted-current-independent-b',blindToOtherRuns:true,goalIds:ids,inputArtifacts:[{role:'book_model',digest:campaign.bookDigest},...manifest.artifacts.filter((x:any)=>['book_pdf','book_pdf_render_manifest','book_html','book_html_render_manifest'].includes(x.role)).map((x:any)=>({role:x.role,digest:x.digest})),{role:'whole_bilingual_cases_current_v7_json',digest:digest(currentCasePath)},{role:'review_prompt',digest:criteriaDigest},{role:'review_criteria',digest:criteriaDigest}],startedAt:read(own+'native6-actual-current-independent-b.input-first.freeze.json').createdAt,completedAt:now,status:'completed',outputDigest:digest(recordPath),toolchainVersion:'codex-independent-b-native6-positive-targeted-v1'});
 partitions.push({role:name,goalIds:ids,profileCount:records.length,config:bind(configPath),records:bind(recordPath),run:bind(runPath),genuineBookDigest:campaign.bookDigest,genuineBundleFingerprint:campaign.bundleFingerprint,newActualNativePageReview:name==='six-current-native',wholeScienceRestarted:false,karyoTwoCaseStringsActuallyReviewed:ids.includes(karyo)});
}
for(const part of [1,2]){
 const oldCfgPath=prior+`positive-normal/part-${part}-current-native/profiles.independent-b.config.json`;const cfg=read(oldCfgPath);
 const originalLines=readFileSync(cfg.reviewPath,'utf8').split('\n').filter(x=>x.length);
 const lines=originalLines.filter(l=>{const r=JSON.parse(l);return !currentIDs.has(r.goalId)&&r.goalId!==karyo});const ids=lines.map(l=>JSON.parse(l).goalId);
 const directory=own+`positive-normal/literal-original-part-${part}-${ids.length}/`;mkdirSync(directory,{recursive:true});const recordPath=directory+'profiles.literal-independent-b.jsonl';const configPath=directory+'profiles.literal-independent-b.config.json';
 for(const line of lines){
  const r=JSON.parse(line);const g:any=goals.get(r.goalId);const e:any=bodies.get(r.goalId);const raster=oldInput.rasterBindings.find((x:any)=>x.goalId===r.goalId);const dg=digest(raster.actualOriginalImage.path);const resourceDigests={[raster.resourceLinkCandidate.url]:dg};
  if(JSON.stringify(r.profile)!==JSON.stringify(e.wholeProfile))throw Error('Literal reused profile differs '+r.goalId);
  const errors=validatePositiveGoalEvidenceRecordSemantics(r,g,resourceDigests,'curricularAtomic');if(errors.length)throw Error('Literal current semantic errors '+r.goalId+' '+errors.join('\n'));
  receipts.push({goalId:r.goalId,role:'literal_own_original_part_'+part,profileValueExact:true,recordEntireLineByteExact:true,resourceDigests,normalSemanticAPI:'validatePositiveGoalEvidenceRecordSemantics',errors,newReviewClaimed:false});
 }
 writeFileSync(recordPath,lines.join('\n')+'\n',{flag:'wx'});
 write(configPath,{...cfg,landscapePath:input.candidateCanonicalPath,semanticKindLedgerPath:input.candidateKindsPath,reviewPath:recordPath,scope:{label:`Literal own original native part${part} ${ids.length} unchanged current records; original run/book context preserved`,goalIds:ids}});
 partitions.push({role:'literal_original_part_'+part,goalIds:ids,profileCount:ids.length,config:bind(configPath),records:bind(recordPath),originalConfig:bind(oldCfgPath),originalRecords:bind(cfg.reviewPath),originalRuns:cfg.reviewRunManifestPaths.map(bind),recordLinesByteExact:true,originalBookContextPreserved:true,newScientificReviewClaimed:false});
}
const all=partitions.flatMap(x=>x.goalIds);if(all.length!==23||new Set(all).size!==23)throw Error('Actual disjoint partitions must cover exactly23');
write(own+'normal-current-P6-P1-literal-P16.materialization.actual.receipt.json',{schemaVersion:1,role:'normal_record_materialization_after_genuine_own_FIRST_and_existing_semantic_API_portable_candidate_check',createdAt:now,partitions,existingNormalSemanticProbes:receipts,actualDisjointGoalCount:all.length,profileBodies23ValueExact:true,actualCounts:partitions.map(p=>({role:p.role,count:p.profileCount})),normalActivePublicCheck:'pending ordinary CLI against real app/public; no alias or monkeypatch',humanApproval:false,humanTrial:false,strictGain:0,activeWrites:false});
console.log(JSON.stringify({actualCounts:partitions.map(p=>({role:p.role,count:p.profileCount})),portableSemanticErrors:receipts.flatMap(r=>r.errors)},null,2));
