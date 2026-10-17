import{readFile,writeFile,mkdir}from'node:fs/promises';
import{createHash}from'node:crypto';
import{join,dirname}from'node:path';
import{fileURLToPath}from'node:url';
import assert from'node:assert/strict';
const O=dirname(fileURLToPath(import.meta.url)),C=join(O,'capsule');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const h=await read(join(O,'HANDOFF.private-P13-preparation-and-conditional-root-ledger-union.json'));
const s=await read(join(O,'SELECTION.actual13-P-only-current-inputs.json'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const pin=async p=>{const b=await readFile(p);return{path:p,sha256:hash(b),bytes:b.length}};
const write=async(name,x)=>writeFile(join(O,name),JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const stock=await import(join(C,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'));
const model=await import(join(C,'app/scripts/goalBookModel.ts'));
const campaigns=await import(join(C,'app/scripts/validateGoalDescriptionReviewCampaign.ts'));
const ledger=await stock.loadGoalDescriptionRolloutInFlightLedger();
const claims=new Map();for(const b of ledger.activeBatches)for(const g of b.config.goalIds){assert(!claims.has(g));claims.set(g,b.configPath)}
assert.equal(claims.size,199);assert.equal(ledger.activeBatches.length,19);
const sourcePins=[...h.sourceGuards,s.canonicalPin,s.P439Pin,s.SEMPin,s.currentModel,s.QARequiredPin];
for(const p of sourcePins)assert.deepEqual(await pin(p.path),p);
await write('CHECK.private-ledger19-199-before-single-prepare.json',{atUTC:new Date().toISOString(),refs:19,claims:199,duplicates:0,sourcePins});
const started=new Date().toISOString(),t=performance.now();
await write('EXECUTION.single-stock-native13-prepare.started.json',{startedAt:started,stockPrepareInvocation:1,config:h.newConfigRelativePath,observationTimeoutRerun:false,newScienceVotes:0});
await stock.prepareGoalDescriptionRolloutBatch(h.newConfigRelativePath);
await write('EXECUTION.single-stock-native13-prepare.completed.json',{startedAt:started,completedAt:new Date().toISOString(),elapsedMilliseconds:performance.now()-t,exitCode:0,stockPrepareInvocation:1,newScienceVotes:0});
const prepared=await stock.validatePreparedGoalDescriptionRolloutBatch(h.newConfigRelativePath);
assert.deepEqual(prepared.manifest.goalIds,s.selectedGoalIds);assert.equal(prepared.manifest.curriculumAtomicDenominatorAtPreparation,439);
const land=await read(s.canonicalPin.path),goals=new Map(land.goals.map(g=>[g.id,g]));
const P=new Map((await readFile(s.P439Pin.path,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>{const r=JSON.parse(x);return[r.goalId,r]}));
const stable=model.stableGoalBookJson;const inputChecks=[];
for(const g of prepared.first.input.goals){
 const current=goals.get(g.goalId),v=g.reviewContext.page.visualization;
 assert.equal(stable(g.canonicalContext),stable(campaigns.buildGoalDescriptionCanonicalContext(current)));
 assert.equal(stable(g.reviewContext.evidenceProfile.profile),stable(P.get(g.goalId).profile));
 assert.equal('sha256:'+(await pin(join(C,'app/public',v.url))).sha256,v.originalDigest);
 assert.equal(g.currentDescriptionDe,current.description);assert.equal(g.currentDescriptionEn,current.descriptionEn);
 inputChecks.push({goalId:g.goalId,currentCanonicalContext:true,wholeCurrentP:true,actualAssetBytes:true,exactDEEN:true});
}
for(const p of sourcePins)assert.deepEqual(await pin(p.path),p);
await write('CHECK.actual-stock-native13-current-bindings.json',{atUTC:new Date().toISOString(),exitCode:0,scope:13,stockPreparedCheckCalls:1,stockPrepareInvocations:1,inputChecks,allSourcePinsUnchanged:true,newScienceVotes:0,humanApproval:false});
const pinRel=async rel=>pin(join(prepared.outputDirectory,rel));
const rounds=[];
for(const r of ['round-a','round-b']){
 const campaign=await read(join(prepared.outputDirectory,r,'description-review-campaign.json'));
 rounds.push({round:r,campaignId:campaign.campaignId,roundId:campaign.roundId,independenceGroupId:campaign.independenceGroupId,
  inputPins:await Promise.all(['review-bundle-manifest.json','description-review-input.json','description-review-campaign.json',...campaign.batches.map(b=>'batches/'+b.batchId+'.input.jsonl')].map(p=>pinRel(r+'/'+p)))});
}
const bundle=await read(join(prepared.outputDirectory,'bundle/manifest.json'));
const selector={schemaVersion:1,role:'Clean current native13 exact review inputs; no historical review verdicts or expected outcomes',status:'REVIEW_INPUTS_PREPARED_NOT_REVIEWED',
 createdAtUTC:new Date().toISOString(),capsule:C,nativeRoot:prepared.outputDirectory,configPin:await pin(join(C,h.newConfigRelativePath)),
 goalIds:s.selectedGoalIds,scope:13,currentAtomicDenominator:439,reviewPolicy:prepared.manifest.reviewPolicy,
 batchManifestPin:await pinRel('batch-manifest.json'),bookDigest:prepared.model.digest,baseBookDigest:prepared.manifest.source.baseBookDigest,
 bundleFingerprint:prepared.bundle.bundleFingerprint,reviewInputFingerprint:prepared.first.input.reviewInputFingerprint,
 commonInputPins:await Promise.all(['batch-manifest.json','bundle/manifest.json','bundle/book-model.json','bundle/book.html','bundle/book.pdf','bundle/review-input.json'].map(pinRel)),
 bundleArtifactPins:await Promise.all(bundle.artifacts.map(a=>pinRel('bundle/'+a.path))),rounds,
 cleanSupplementPins:await Promise.all(['CLEAN.current13-whole-C-whole-P-and-teacher-source-context.json','CLEAN.current13-whole-P-exact-existing-lines.jsonl'].map(p=>pin(join(O,p)))),
 reviewerBoundary:'Review actual current descriptions, whole P profiles and bound pages/context/images independently. Current profiles are supplied data, never predetermined good outcomes. Actual laboratory/research performance must remain required where authored. Raw mapping partners do not establish complete official national coverage. No peer reviews or root decisions are included.',
 technicalValidationPin:await pin(join(O,'CHECK.actual-stock-native13-current-bindings.json')),humanApprovalClaim:false,newScientificVotes:0,reviewResultsCreated:false,applied:false};
await write('SELECTOR.clean-current-native13-reviewer-inputs.sealed.json',selector);
console.log(JSON.stringify({selector:await pin(join(O,'SELECTOR.clean-current-native13-reviewer-inputs.sealed.json')),scope:13,prepareExit:0,newScienceVotes:0}));
