import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts';
import {fingerprintSemanticKindSourceGoal} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts';
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/';
const author=base+'biologie-molecular-genetics-twenty-three-native-preparation-author-v1/';
const own=base+'biologie-molecular-genetics-twenty-three-native-independent-b-v1/';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const write=(p:string,d:any)=>writeFileSync(p,JSON.stringify(d,null,2)+'\n',{flag:'wx'});
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const first=read(own+'native23-actual-D-P-and-splice-AM.independent-b.scientific-first.verdict.json');
const semantic=read(own+'one-current-splice-kind-A-M.independent-b.scientific-first.verdict.json');
const input=read(author+'neutral-twenty-three-native-independent-review.entry.json');
const material=read(input.wholeCaseMaterialsPath);
const canonical=read(input.candidateCanonicalPath);
const goals=new Map(canonical.goals.map((g:any)=>[g.id,g]));
const bodies=new Map(material.entries.map((e:any)=>[e.goalId,e]));
const template=read(input.positiveConfigPath);
const criteriaDigest=digest(template.reviewCriteriaPath);
const metadata=own+'actual-native23-generation-parameters.disclosure.json';
const receipts:any[]=[];const bindings:any[]=[];const now=new Date().toISOString();
for(const part of [1,2]){
 const n=author+`native-twenty-three/part-${part}/`; const campaign=read(n+'round-b/description-review-campaign.json');
 const batch=campaign.batches[0]; const ids=batch.goalIds;const directory=own+`positive-normal/part-${part}-current-native/`;mkdirSync(directory,{recursive:true});
 const configPath=directory+'profiles.independent-b.config.json';const recordPath=directory+'profiles.independent-b.jsonl';const runPath=directory+'profiles.independent-b.run.json';
 const reviewId=`biologie-molecular-genetics-native23-part-${part}-positive-independent-b-v1`;const runId=reviewId+'.actual-native-review';
 const dRecords=readFileSync(own+`part-${part}-normal-D-results/${batch.batchId}.records.jsonl`,'utf8').trim().split('\n').map(JSON.parse);const dById=new Map(dRecords.map((r:any)=>[r.goalId,r]));
 const records=ids.map((id:string)=>{
  const g:any=goals.get(id);const e:any=bodies.get(id); const dr:any=dById.get(id);const decision=first.goalDecisions.find((d:any)=>d.goalId===id);
  if(JSON.stringify(g)!==JSON.stringify(e.wholeCurrentGoalWithResources))throw Error('actual whole goal differs '+id);
  const raster=input.rasterBindings.find((r:any)=>r.goalId===id);const dg=digest(raster.actualOriginalImage.path);
  if(dg!==raster.actualOriginalImage.sha256 || digest(raster.portableAlias.path)!==dg)throw Error('Actual original/portable PNG mismatch '+id);
  const resourceDigests={[raster.resourceLinkCandidate.url]:dg};
  const dissent:string[]=[];
  if(id==='22711af8-1184-584c-9707-1192799bfa22')dissent.push('BIO23B-PROSA-V6-001: two actual current EN case criteria still contain 1–22/X/Ytypes. Profile prose is readable; source case-rubric text needs a separately bound successor.');
  if(id==='183f3c47-ec20-5b98-8024-77ebd1c48abf')dissent.push('Actual native goal15 page remains blocked for its direct chromatid-to-butterfly evolutionary bridge; current finite profile mechanism is not a native visual approval.');
  const record:any={ $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteriaDigest,landscapeId:template.landscapeId,goalId:id,goalFingerprint:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,criteriaDigest,resourceDigests,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(e.wholeProfile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:first.reviewedAt,reviewer:'Codex independent B /root/bio_science14_independent_b',reason:`Current whole DE/EN, whole profile and both finite case bodies use the independently frozen whole23 science and targeted v4/v6 model/text judgments only where actual values match. Actual part ${part} physical page ${decision.actualPhysicalPage} and HTML/context/resource bindings were read now. Essential understanding: ${dr.understandingEvidence.essentialUnderstandingEn} Fresh evidence: ${dr.understandingEvidence.transferExpectationEn} Candidate scope: authored finite explanation/transfer, E1/G1; no observed learner performance, physical experiment, source/course or whole-V approval. ${dissent.join(' ')}`.trim(),evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[runId],dissent,profile:e.wholeProfile};
  const errors=validatePositiveGoalEvidenceRecordSemantics(record,g,resourceDigests,'curricularAtomic');if(errors.length)throw Error(errors.join('\n'));
  receipts.push({goalId:id,actualOriginal:raster.actualOriginalImage,portableAlias:raster.portableAlias,resourceDigests,normalSemanticApi:'validatePositiveGoalEvidenceRecordSemantics',errors,scientificFirstDecision:decision.PbodyDecision,profileValueExact:true,currentCaseTextHoldRetained:dissent.some(x=>x.startsWith('BIO23B-PROSA'))});return record;
 });
 writeFileSync(recordPath,records.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'});
 const cfg={...template,reviewId,reviewPath:recordPath,reviewRunManifestPaths:[runPath],scope:{label:`Independent B actual current native part ${part}; E1/G1 finite candidate, separate text/pixel/source holds retained`,goalIds:ids}};write(configPath,cfg);
 const nativeRun=read(own+`part-${part}-normal-D-results/${batch.batchId}.run.json`);
 const run={...nativeRun,runId,promptFamilyId:'biology-positive-understanding-evidence-profile-v1',promptFingerprint:criteriaDigest,criteriaFingerprint:criteriaDigest,goalIds:ids,inputArtifacts:[{role:'book_model',digest:nativeRun.bookDigest},...nativeRun.inputArtifacts.filter((x:any)=>['book_pdf','book_pdf_render_manifest','book_html','book_html_render_manifest','description_review_batch_input_jsonl'].includes(x.role)),{role:'review_prompt',digest:criteriaDigest},{role:'review_criteria',digest:criteriaDigest}],completedAt:now,outputDigest:digest(recordPath),toolchainVersion:'codex-independent-b-native23-positive-v1'};
 delete run.campaignId;delete run.roundId;delete run.batchId;delete run.batchInputFingerprint;
 write(runPath,run);bindings.push({part,configPath,recordPath,runPath,profileCount:records.length,wholeProfileBodiesExact:true,bookModelArtifactDigestIsSemanticBookDigest:true});
}
const amDir=own+'splice-normal/';mkdirSync(amDir,{recursive:true});
const pending=read(input.genuineSpliceKindAMConfirmationInputPath);const goal:any=goals.get(semantic.wholeCandidateGoal.id);
const norm=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim();
const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}':JSON.stringify(v);
const amFP=(rule:string)=>'sha256:'+createHash('sha256').update(stable({ruleVersion:rule,goalId:goal.id,shortKey:goal.shortKey??'',title:norm(goal.title),titleEn:norm(goal.titleEn),description:norm(goal.description),descriptionEn:norm(goal.descriptionEn),phase:norm(goal.dimensionTags?.phase),area:norm(goal.dimensionTags?.area),topicCode:norm(goal.dimensionTags?.topicCode),nodeKind:norm(goal.nodeKind)})).digest('hex');
for(const [name,rule,status,reason,flag] of [['atomicity','semantic-atomicity-v1','atomic',semantic.atomicityReason,'semanticAtomic'],['memory','memory-card-review-v1','no_memory_needed',semantic.memoryReason,'memoryUseful']]){
 const reviewId=`biologie-molecular-genetics-current-splice-${name}-independent-b-v1`;const recordPath=amDir+`${name}.independent-b.review.jsonl`;const configPath=amDir+`${name}.independent-b.config.json`;
 const record={schemaVersion:1,reviewId,ruleVersion:rule,landscapeId:template.landscapeId,goalId:goal.id,fingerprint:amFP(rule),status,[flag]:name==='atomicity',reviewedAt:semantic.reviewedAt,reviewer:'Codex independent B /root/bio_science14_independent_b',reason};writeFileSync(recordPath,JSON.stringify(record)+'\n',{flag:'wx'});
 const cfg:any={schemaVersion:1,reviewId,ruleVersion:rule,landscapeId:template.landscapeId,landscapePath:input.candidateCanonicalPath,reviewPath:recordPath,scope:{label:'Current splice semantic clarification only; other393 historical scope retained',leafGoalIds:[goal.id]}};
 if(name==='memory'){cfg.cardReviewPath=amDir+'memory.independent-b.cards.review.jsonl';writeFileSync(cfg.cardReviewPath,'',{flag:'wx'});cfg.visibilityScopeCoverageRequired=false;cfg.visibilityScopes=[];}
 write(configPath,cfg);bindings.push({role:name,configPath,recordPath});
}
const kindReceipt={schemaVersion:1,role:'existing_normal_kind_fingerprint_countercheck_after_genuine_semantic_FIRST',goalId:goal.id,beforeSourceFingerprint:fingerprintSemanticKindSourceGoal(pending.wholeBeforeGoal),currentSourceFingerprint:fingerprintSemanticKindSourceGoal(goal),candidateKindRow:pending.candidateKind,genuineSemanticFirstPath:own+'one-current-splice-kind-A-M.independent-b.scientific-first.verdict.json',genuineSemanticKind:semantic.kindDecision,kindReason:semantic.kindReason,normalHelper:'fingerprintSemanticKindSourceGoal',other393FreshClassificationClaimed:false,activeWrites:false,humanApproval:false,strictGain:0};
if(kindReceipt.beforeSourceFingerprint!==pending.beforeKind.sourceFingerprint || kindReceipt.currentSourceFingerprint!==pending.candidateKind.sourceFingerprint)throw Error('Kind source FP differs');write(amDir+'one-current-splice-kind.normal-helper.actual.receipt.json',kindReceipt);
write(own+'normal-current-P23-and-splice-AM.materialization.actual.receipt.json',{schemaVersion:1,createdAt:now,scientificFirstAlreadyFrozen:true,newScientificReviewClaimed:false,bindings,portableExistingNormalSemantics:receipts,actualOriginalPortableAliasDigestsEqual:true,normalActivePublicAssetsCheck:'pending ordinary CLI; no fs alias, monkeypatch or reviewed-resource relaxation',status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',humanApproval:false,activeWrites:false,strictGain:0});
console.log(JSON.stringify({normalPRecords:receipts.length,actualPortableSemanticErrors:receipts.flatMap(r=>r.errors),bindings},null,2));
