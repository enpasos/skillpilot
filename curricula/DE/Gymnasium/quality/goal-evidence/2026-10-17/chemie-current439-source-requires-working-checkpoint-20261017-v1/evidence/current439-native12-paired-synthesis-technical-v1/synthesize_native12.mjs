import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const O=dirname(fileURLToPath(import.meta.url)),K=join(O,'capsule');
const stage=JSON.parse(await readFile(join(O,'STAGE.actual-native12-original-byte-copies.json'),'utf8'));
const stock=await import(join(K,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'));
const rt=await import(join(K,'app/scripts/validateGoalDescriptionDualRoundResolution.ts'));
const mt=await import(join(K,'app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts'));
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const bytes=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
for(const p of stage.sourceGuards)if(sha(await readFile(p.path))!=='sha256:'+p.sha256)throw Error('Source drift '+p.path);
const dual=await stock.materializeGoalDescriptionRolloutBatchDualSummary(stage.configRelativePath,true),root=dual.prepared.outputDirectory;
const sources=new Map();
for(const goalId of stage.goalIds){
 const a=rt.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId,label:'First'}),b=rt.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId,label:'Second'});
 if(a.errors.length||b.errors.length||a.source?.decision!=='keep'||b.source?.decision!=='keep')throw Error('Not paired keep '+goalId);
 sources.set(goalId,{first:a.source,second:b.source});
}
const first=sources.get(stage.goalIds[0]);
const synthesizedAt=new Date(Math.max(...[...dual.first.resultPairs,...dual.second.resultPairs].map(x=>Date.parse(x.run.completedAt)))+1000).toISOString();
const manifest={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',schemaVersion:1,synthesisContract:'goal-description-rollout-synthesis-decision-v1',manifestId:'chemie-current439-terminal12-actual-native-paired-technical-synthesis-20261017-v1',authority:'ai_synthesis',synthesizedBy:'Codex technical assembler of actual fresh independent native A/B D12; no new scientific review or human attestation',synthesizedAt,batch:{batchId:dual.prepared.manifest.batchId,batchManifestDigest:sha(await readFile(join(root,'batch-manifest.json'))),configDigest:dual.prepared.manifest.configDigest,bundleFingerprint:dual.prepared.manifest.artifacts.bundleFingerprint,bookDigest:dual.first.input.bookDigest,reviewInputFingerprint:dual.first.input.reviewInputFingerprint,dualSummaryDigest:sha(dual.bytes),canonicalLandscapeDigest:sha(await readFile(join(K,dual.prepared.manifest.source.landscapePath)))},rounds:{first:mt.buildGoalDescriptionRolloutSynthesisRoundBinding(first.first.binding,dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),second:mt.buildGoalDescriptionRolloutSynthesisRoundBinding(first.second.binding,dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint)},decisions:stage.goalIds.map(goalId=>{
 const g=dual.first.input.goals.find(x=>x.goalId===goalId),s=sources.get(goalId),p=goalId==='f79f15c0-e848-5e17-9eb5-26753d35c93b';
 return {decisionId:'chemie-current12-native-paired-'+goalId+'-20261017-v1',goalId,effectiveSemanticKind:'curricularAtomic',goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,goalReviewContextFingerprint:rt.fingerprintGoalDescriptionReviewContext(g),finalText:{titleDe:g.currentTitleDe,titleEn:g.currentTitleEn,descriptionDe:g.currentDescriptionDe,descriptionEn:g.currentDescriptionEn},resolutionDecision:'keep_current',evidenceRound:'second',records:{first:{recordId:s.first.binding.recordId,recordDigest:s.first.binding.recordDigest},second:{recordId:s.second.binding.recordId,recordDigest:s.second.binding.recordDigest}},rationaleDe:'Technische Zusammenführung der beiden tatsächlich abgeschlossenen, unabhängigen nativen D-Reviews: Beide behalten den exakten aktuellen deutschen und englischen Zieltext bei. Die Evidence-Fassung der zweiten Runde wird unverändert übernommen; beide Originalrecords bleiben vollständig gebunden. Es entsteht kein neues fachliches Review und keine Freigabe anderer Gates.'+(p?' Die Empfehlung B-P-01 zum inkonsistenten A/B-gegen-B/A-Verhältnis bleibt ausdrücklich OFFEN; das D-keep und seine Stock-Validierung genehmigen kein P-Profil und schließen diese Materialkorrektur nicht. Nach der getrennten P-Korrektur wird ein gezielter neuer D1-Kontextnachfolger benötigt.':''),rationaleEn:'Technical assembly of the two actually completed independent native D reviews: both retain the exact current German and English goal wording. The second round evidence is retained verbatim and both complete original records remain bound. This adds no scientific review and approves no other gate.'+(p?' Recommendation B-P-01 about the inconsistent A/B versus B/A ratio remains explicitly OPEN; D keep and stock validation neither approve a P profile nor close this material correction. The separate P correction requires a targeted new D1 context successor.':'')};
})};
manifest.manifestFingerprint=mt.fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifest);
const check=await mt.validateGoalDescriptionRolloutSynthesisDecisionManifestStructure(manifest);if(check.errors.length)throw Error(check.errors.join(' | '));
await writeFile(join(root,'synthesis-decision-manifest.json'),bytes(manifest),{flag:'wx'});
await writeFile(join(O,'SYNTHESIS.native12-manifest-created.json'),bytes({manifestPath:join(root,'synthesis-decision-manifest.json'),manifestDigest:sha(bytes(manifest)),goals:12,evidenceRound:'second',scientificReviewVotesAdded:0,BP01Open:true}),{flag:'wx'});
console.log(JSON.stringify({manifest:manifest.manifestFingerprint,goalCount:12,BP01Open:true}));
