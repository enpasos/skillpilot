import { readFileSync, writeFileSync, existsSync, mkdirSync, lstatSync } from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

// READONLY native binding probe. Every write is restricted to this new evidence
// directory; no active config, ledger, asset, CAN, report or runtime is changed.
const R = process.cwd();
const O = join(R, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-14-qualified-PNG-native-import-QA-and-binding-path-independent-a-READONLY-v1');
const out = join(O, 'inert-native-followers');
if (existsSync(out)) throw new Error('Refuse to overwrite an existing follower package');
mkdirSync(out);
const req = createRequire(join(R, 'app/package.json'));
const esbuild = req('esbuild');
const Module = req('node:module');
const guards = new Map<string, string>();
const sha = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const rp = (p: string) => resolve(R, p);
const rel = (p: string) => relative(R, p).split('\\').join('/');
const read = (p: string) => { const b=readFileSync(rp(p)); guards.set(rel(rp(p)), sha(b)); return b.toString('utf8'); };
const fileDigest = (p: string) => { const b=readFileSync(rp(p)); const s=sha(b);guards.set(rel(rp(p)),s);return s; };
const json = (p: string) => JSON.parse(read(p));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const assert = (ok: unknown, message: string) => { if (!ok) throw new Error(message); };
const write = (name: string, value: unknown, raw = false) => {
  const p=join(out,name); assert(p.startsWith(out+'/'),'Output escaped own directory');
  mkdirSync(dirname(p), {recursive:true}); assert(!existsSync(p), 'Existing output '+p);
  writeFileSync(p,raw?String(value):JSON.stringify(value,null,2)+'\n'); return rel(p);
};
const head = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const native = (p: string, exports: string[], removeFinalMain = false) => {
  const original = rp(p); let source=read(p);
  if (removeFinalMain) {
    assert(/\nmain\(\)\s*$/.test(source), 'Unexpected native main boundary '+p);
    source=source.replace(/\nmain\(\)\s*$/, '\n');
  }
  source+='\nexport { '+exports.join(', ')+' };\n';
  const transformed=esbuild.transformSync(source,{format:'cjs',platform:'node',target:'node20',loader:'ts',define:{'import.meta.url':JSON.stringify(pathToFileURL(original).href)}}).code;
  const m=new Module(original);m.filename=original;m.paths=Module._nodeModulePaths(dirname(original));m._compile(transformed,original);return m.exports;
};
const P = await import(rp('app/scripts/positiveGoalEvidenceProfileModel.ts'));
const B = await import(rp('app/scripts/goalBookModel.ts'));
const D = await import(rp('app/scripts/validateGoalDescriptionReviewCampaign.ts'));
const A = native('app/scripts/semanticAtomicityReview.ts',['fingerprintGoal'],true);
const M = native('app/scripts/memoryCardReview.ts',['fingerprintGoal'],true);
const Q = native('app/scripts/generateGoalVisualizationQaLedgers.ts',['createDefaultRecord','normalizeExistingRecord','serializeLedger'],true);
for(const p of ['app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/goalBookModel.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','scripts/import_goal_visualization.mjs','scripts/goal_visualization_common.mjs']) read(p);
const CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';
const REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
const configPath='app/scripts/config/goal-books/de-gym-economics-current-canonical.json';
const qaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json';
const before=json(rel(join(O,'before702.whole-active-CAN-before14-import.EXACT.json')));
const current=json(CAN); const byId=new Map(current.goals.map((g:any)=>[g.id,g]));
const registry=json(REG);const economics=registry.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften');
const bc=json(configPath);const sem=json(economics.semanticKindLedgerPath);
const kinds=new Map(sem.decisions.map((d:any)=>[d.goalId,d.semanticKind]));
const assetPlan=json(rel(join(O,'actual14-selected-reviewed-assets-prompts-and-root-command-argv.READONLY.json')));
const imports=new Map(assetPlan.records.map((x:any)=>[x.goalId,x]));
const dd='dd38fc6c-9b11-5e79-b4bc-ec6c5eb6c7ad';
const actualChanged:any[]=[];
for(const g of before.goals){
  const n:any=byId.get(g.id); assert(n,'Lost goal '+g.id);
  const fields=[...new Set([...Object.keys(g),...Object.keys(n)])].filter(k=>!same(g[k],n[k]));
  if(fields.length){assert(same(fields,['resourceLinks']),'Non-resource mutation '+g.id);actualChanged.push({goalId:g.id,fields,beforeResourceLinks:g.resourceLinks,currentResourceLinks:n.resourceLinks});}
}
assert(current.goals.length===before.goals.length && current.goals.length===702,'Whole goal count changed');
assert(actualChanged.length===15,'Expected exactly Root-authorized15 ResourceLinks changes');
assert(assetPlan.records.every((x:any)=>actualChanged.some(y=>y.goalId===x.goalId)),'An imported goal did not change');
const extra=actualChanged.filter(x=>!imports.has(x.goalId));assert(extra.length===1,'Unexpected extra ResourceLinks mutations');
assert(String((byId.get(extra[0].goalId) as any).title).includes('Arbeitszeit'),'Extra mutation is not dd38');
const ordinary=sem.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId);
assert(ordinary.length===346,'Wrong ordinary denominator');
const actualUnapprovedNativeQa=json(qaPath);
const oldQa=json('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-first-M7-D9-and14-qualified-integration-root-v1/standard-qa-before14-current434.EXACT.json');
assert(oldQa.records.length===336 && actualUnapprovedNativeQa.records.length===346,'Expected historical336/current346 native QA states');
const oldQaById=new Map(oldQa.records.map((x:any)=>[x.goalId,x]));
const qaRows:any[]=[];const assetDigests:Record<string,string>={}; const actualAssets:any[]=[];
for(const id of ordinary){
  const g:any=byId.get(id);const links=(g.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization'&&l.role==='primary');
  assert(links.length===1,'Wrong global primary count '+id);const link=links[0];
  const pub='app/public'+link.url;const src='curricula/DE/Gymnasium/visualizations/'+link.url.split('/assets/goal-visualizations/')[1];
  const backend='backend/src/main/resources/static'+link.url;
  const digest=fileDigest(pub);assert(digest===fileDigest(src),'Canonical/public pixel mismatch '+id);assert(digest===fileDigest(backend),'Backend pixel mismatch '+id);
  assetDigests[link.url]=digest;
  if(imports.has(id)){
    const input:any=imports.get(id);assert(digest==='sha256:'+input.actualImageSha256,'Imported reviewed PNG mismatch '+id);
    assert(link.reviewStatus==='pilot'&&link.lang==='de'&&link.provider==='OpenAI Codex image_gen','Import metadata mismatch '+id);
    assert(sha(read(input.actualPromptPath))==='sha256:'+input.actualPromptSha256,'Prompt changed '+id);
    actualAssets.push({goalId:id,digest,paths:[src,pub,backend],outputAliasState:[src,pub,backend].map(p=>({path:p,nlink:lstatSync(rp(p)).nlink,isSymlink:lstatSync(rp(p)).isSymbolicLink()}))});
  }
  const generated=Q.createDefaultRecord({goalId:id,title:g.title.replace(/\s+/g,' ').trim(),description:g.description.replace(/\s+/g,' ').trim(),subject:'wirtschaftswissenschaften',landscapeId:current.landscapeId,landscapePath:CAN,visualizationState:'available',missingReason:'',imageUrl:link.url,publicAssetPath:pub,canonicalAssetPath:src,assetSha256:digest});
  const row=Q.normalizeExistingRecord(generated,oldQaById.get(id));
  if(imports.has(id)){
    const input:any=imports.get(id);
    assert(row.aiApproved!=='yes','Replaced/new pixels unexpectedly retained old AI approval '+id);
    Object.assign(row,{aiApproved:'yes',aiApprovedAssetSha256:digest,aiReviewedAt:input.reviewedAtHistorical,aiReviewer:input.actualReviewAuthority,aiNotes:'Existing actual original/360/680 current-goal visual KEEP: '+input.actualReviewPath+'. Root imported exact reviewed pixels; no new visual review or human approval in this binding probe.'});
  }
  qaRows.push(row);
}
qaRows.sort((a,b)=>a.title.localeCompare(b.title,'de-DE',{numeric:true,sensitivity:'base'})||a.goalId.localeCompare(b.goalId));
const qaLedger={schemaVersion:1,subject:'wirtschaftswissenschaften',source:oldQa.source,records:qaRows};
const candidateQa=write('qa346.native-default-normalization-plus14-prior-visual-KEEP.INERT.json',Q.serializeLedger(qaLedger),true);
const combinedPath=bc.evidenceReviewPaths[0];assert(bc.evidenceReviewPaths.length===1,'Unexpected combined profile ownership');
const combinedRaw=read(combinedPath);const combinedLines=combinedRaw.split('\n').filter(Boolean);assert(combinedLines.length===346,'Wrong combined P line count');
const following=new Map<string,string>();const pChanges:any[]=[];const semanticChanges:any[]=[];
for(const line of combinedLines){
  const rec=JSON.parse(line);const g:any=byId.get(rec.goalId);const kind:any=kinds.get(rec.goalId);
  const digestMap=Object.fromEntries((g.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,assetDigests[l.url]]));
  const expected=P.fingerprintPositiveGoalEvidenceReviewInput(g,rec.reviewCriteriaFingerprint,digestMap,kind);
  assert(P.fingerprintGoalForPositiveEvidence(g,kind)===rec.goalFingerprint,'Goal scientific fingerprint changed '+rec.goalId);
  assert(P.fingerprintPositiveGoalEvidenceProfile(rec.profile)===rec.profileFingerprint,'Profile body fingerprint changed '+rec.goalId);
  let successor=line;
  if(expected!==rec.reviewInputFingerprint){
    assert(actualChanged.some(x=>x.goalId===rec.goalId),'Unrelated P stale '+rec.goalId);
    const old=rec.reviewInputFingerprint;assert(line.split(old).length===2,'Ambiguous raw fingerprint replacement');successor=line.replace(old,expected);
    pChanges.push({goalId:rec.goalId,beforeReviewInputFingerprint:old,currentReviewInputFingerprint:expected,wholeOtherRecordFieldsExact:true});
  }
  const next=JSON.parse(successor);const errors=P.validatePositiveGoalEvidenceRecordSemantics(next,g,digestMap,kind);assert(errors.length===0,errors.join('\n'));
  following.set(rec.goalId,successor);
}
assert(pChanges.length===15,'Actual native P follower scope differs from Root15 mutation');
const candidateCombined=write('whole346.only15-current-resource-input-native-followers.INERT.jsonl',combinedLines.map(l=>following.get(JSON.parse(l).goalId)).join('\n')+'\n',true);
const configurations:any[]=[];
for(const [index,p] of economics.positiveEvidenceConfigPaths.entries()){
  const cfg=json(p);const raw=read(cfg.reviewPath);let count=0;
  const next=raw.split('\n').map((line:string)=>{if(!line.trim())return line;const v=JSON.parse(line);const successor=following.get(v.goalId);assert(successor,'Unexpected P goal in config '+v.goalId);const complete=JSON.parse(successor!);assert(same({...v,reviewInputFingerprint:complete.reviewInputFingerprint},complete),'Per-config and whole combined P content differs '+v.goalId);if(v.reviewInputFingerprint===complete.reviewInputFingerprint)return line;count++;assert(line.split(v.reviewInputFingerprint).length===2,'Ambiguous config P line');return line.replace(v.reviewInputFingerprint,complete.reviewInputFingerprint);}).join('\n');
  if(!count){configurations.push({originalConfig:p,affectedRecords:0,reuseWholeOriginalConfigAndReview:true});continue;}
  const review=write('positive/'+String(index+1).padStart(2,'0')+'.whole-qualified-bodies-only-resource-input-follower.INERT.jsonl',next,true);
  const cfgOut=write('configs/'+String(index+1).padStart(2,'0')+'.only-review-path-current-resource-followers.INERT.config.json',{...cfg,reviewPath:review});
  configurations.push({originalConfig:p,candidateConfig:cfgOut,originalReview:cfg.reviewPath,candidateReview:review,affectedRecords:count,allOriginalScopesAndCriteriaAndStatusWholeExact:true,allowedConfigDelta:['reviewPath']});
}
for(const change of actualChanged){
  const old=before.goals.find((g:any)=>g.id===change.goalId);const currentGoal:any=byId.get(change.goalId);
  assert(B.fingerprintSemanticKindSourceGoal(old)===B.fingerprintSemanticKindSourceGoal(currentGoal),'SEM changed');
  assert(A.fingerprintGoal(old,'probe-resource-only')===A.fingerprintGoal(currentGoal,'probe-resource-only'),'A changed');
  assert(M.fingerprintGoal(old,'probe-resource-only')===M.fingerprintGoal(currentGoal,'probe-resource-only'),'M changed');
  assert(same(D.buildGoalDescriptionCanonicalContext(old),D.buildGoalDescriptionCanonicalContext(currentGoal)),'D canonicalContext changed');
  semanticChanges.push({goalId:change.goalId,SEMSourceFingerprintUnchanged:true,atomicityFingerprintUnchanged:true,memoryFingerprintUnchanged:true,wholeDescriptionCanonicalContextUnchanged:true});
}
const bookConfig={...bc,goalVisualizationQaPath:candidateQa,evidenceReviewPaths:[candidateCombined],outputPath:rel(join(out,'book346.current15-native-followers.INERT.model.json'))};
const candidateBookConfig=write('book346.only-current-QA-and-P-pointers.INERT.config.json',bookConfig);
const model=B.buildGoalBookModel({landscape:current,compositionView:json(bc.compositionViewPath),semanticKindLedger:sem,goalVisualizationQa:qaLedger,goalVisualizationAssetDigests:assetDigests,evidenceReviewSources:[{path:candidateCombined,text:read(candidateCombined)}],config:bookConfig});
assert(model.pages.length===346,'Native candidate Book page count changed');B.parseAndValidateGoalBookModel(model);
const prior=json(bc.outputPath);const currentPages=new Map(model.pages.map((p:any)=>[p.goalId,p]));const pageDelta:any[]=[];
for(const page of prior.pages){const n:any=currentPages.get(page.goalId);assert(n,'Missing page');const fields=[...new Set([...Object.keys(page),...Object.keys(n)])].filter(k=>!same(page[k],n[k]));if(fields.length)pageDelta.push({goalId:page.goalId,fields,hasResourceOnlyMutation:actualChanged.some(x=>x.goalId===page.goalId)});}
assert(pageDelta.every(x=>x.hasResourceOnlyMutation),'Unrelated native Book page delta');assert(pageDelta.length===15,'Expected15 current Book page changes');
write('book346.current15-native-followers.INERT.model.json',model);
const approvalFields=['aiApproved','aiApprovedAssetSha256','aiReviewedAt','aiReviewer','aiNotes','humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer','umlautsCorrectChatGpt','contentApprovedChatGpt','chatGptReviewedAt','chatGptReviewer','chatGptNotes'];
const oldApprovalExact=oldQa.records.filter((v:any)=>!imports.has(v.goalId)).every((v:any)=>{const n=qaRows.find(x=>x.goalId===v.goalId);return approvalFields.every(k=>same(v[k],n[k]));});assert(oldApprovalExact,'Changed historical approval metadata');
const historicalInventory=json('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-current346-visual336-plus10-inventory-independent-a-READONLY-v1/actual336-current-assets-individual-KEEP-history-and-binding-deltas.READONLY.json');
const reuse324=historicalInventory.records.filter((x:any)=>!x.newActualVisualReviewNeededForChangedDescription).map((x:any)=>{const n=qaRows.find(v=>v.goalId===x.goalId);assert(n.assetSha256===x.actualAssetSha256,'Reusable image changed');const old:any=oldQaById.get(x.goalId);assert(approvalFields.every(k=>same(old[k],n[k])),'Reusable approval changed');return {goalId:x.goalId,assetSha256:n.assetSha256,allHistoricalApprovalFieldsExact:true,existingSightReviewEvidence:x.existingSightReviewEvidence};});assert(reuse324.length===324,'Wrong historical reuse scope');
const end=[...guards].map(([p,s])=>({path:p,beforeSha256:s,endSha256:sha(readFileSync(rp(p))),exact:s===sha(readFileSync(rp(p)))}));assert(end.every(x=>x.exact),'Input changed during probe');assert(head===execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),'HEAD changed');
write('actual-native-15-resource-mutations-P15-Book15-and324-historical-visual-reuse.READONLY.json',{status:'READONLY-NATIVE-INERT-FOLLOWERS-not-active-P-or-QA-approval',actualUTC:new Date().toISOString(),HEAD:head,nativeNode:process.version,wholeGoals:702,ordinaryGoals:346,activeMutationsByProbe:0,originalNativeFunctionCalls:true,nativeMainsInvoked:false,wholeGlobalChecksInvoked:false,actualResourceOnlyChangedGoals:actualChanged,actuallyImportedReviewedAssets:actualAssets,positiveFollowers:pChanges,wholePositiveRecordsUnchangedExceptInputFingerprint:346,unchangedRawPositiveLines:346-pChanges.length,positiveConfigFollowers:configurations,sourceSEMAtomicityMemoryAndDescriptionContextConsequences:semanticChanges,nativeBookPages:346,actuallyChangedBookPages:pageDelta,unchangedWholeBookPageObjects:346-pageDelta.length,historical324ActualSightReviewsReusedWithoutNewReview:reuse324,all332ExistingSameAssetApprovalBlocksPreserved:oldApprovalExact,QAHasCurrent346AvailableRows:qaRows.length,QAApprovalBindingsUsePriorActualVisualReviewsNotThisProbe:true,candidateQA:candidateQa,candidateBookConfig,candidateCombinedPositive:candidateCombined,remainingBoundaries:['Root must independently guard and decide exact-asset AI QA qualification and pointer activation.','All new/replacement canonical reviewStatus stays pilot; human approval remains separate.','Changed15 D review page/P bindings require explicit current qualification, no automatic science projection.','D62 three neighbour-title questions and23 indirect candidates remain open.'],inputEndGuards:end,humanApproval:false,M7Claim:false});
console.log(JSON.stringify({output:rel(out),nativePFollowers:pChanges.length,affectedPConfigs:configurations.filter(x=>x.affectedRecords>0).length,nativeBookPages:model.pages.length,changedNativeBookPages:pageDelta.length,reusedHistoricalSightReviews:reuse324.length,endGuards:end.length,activeWrites:0}));
