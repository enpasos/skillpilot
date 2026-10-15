// SPDX-License-Identifier: Apache-2.0
// Informed integration only: never an independent review or a human attestation.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join,relative} from 'node:path';
const repo=process.cwd();
const own=resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-acid10-current419-paired-native-inactive-integration-root-20261015-v1');
const host=resolve(repo,'tmp/chemie-m7-resumed-20261015/acid10-current419-integration-host');
const cfg=relative(repo,join(own,'config/native10.exact-bundle-transport.config.json'));
const batch=await import(join(host,'app/scripts/materializeGoalDescriptionRolloutBatch.ts'));
const resolution=await import(join(host,'app/scripts/validateGoalDescriptionDualRoundResolution.ts'));
const synth=await import(join(host,'app/scripts/goalDescriptionRolloutResolutionSynthesis.ts'));
const contract=await import(join(host,'app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts'));
const digest=(x:any)=>'sha256:'+createHash('sha256').update(x).digest('hex');
const dual=await batch.materializeGoalDescriptionRolloutBatchDualSummary(cfg,false);
const dir=dual.prepared.outputDirectory;
const manifestBytes=await readFile(join(dir,'batch-manifest.json'));
const keeperIds=['ba621c67-b750-5e45-ab37-a51ea45e3ccf','dc0470f1-0676-5949-a5cc-02783d478406','9fef5c29-62bc-5ada-b96b-6885bcb049cb'];
const reasons:any={
 'ba621c67-b750-5e45-ab37-a51ea45e3ccf':[
 'Beide ursprünglichen unabhängigen Reviews bestätigen den zusammenhängenden fotometrischen Analysevorgang. A2 erläutert das auflösungsbegrenzte Maximum, B die Blank-/Arbeitsbereichskontrolle; beide trennen Wiederholstreuung und Richtigkeit, bestätigen die Kontrollabweichungen und halten den fehlerhaften zweiten Gehalt zurück. Die ausführlichere Evidence-Fassung von A2 wird gewählt. Dessen none-Empfehlung und Bs create-Empfehlung waren Empfehlungen zum P-Profil; das gültige ursprüngliche B-P10-Profil wird separat eingebunden. Dies ist keine beobachtete Labor- oder Lernleistung und keine nationale Quellen-/Kursfreigabe.',
 'Both original independent reviews confirm one integrated photometric assay. A2 explains the resolution-limited maximum and B the blank/working-range controls; both distinguish scatter from trueness, confirm control deviations and withhold the second biased result. The fuller A2 evidence is selected. Its none recommendation and B’s create recommendation concerned the P profile; the valid original B-P10 profile is bound separately. This is neither observed laboratory or learner performance nor national source/course clearance.'],
 'dc0470f1-0676-5949-a5cc-02783d478406':[
 'Beide ursprünglichen unabhängigen Reviews bestätigen die einheitliche Modellkompetenz mehrstufiger Protolyse. Die eigenen unabhängigen Rechnungen beider Reviewer bestätigen den Phosphatwechsel und den korrigierten ersten Glycin-Halbpunkt; keine exakte universelle Halbpunktregel wird behauptet. A2s ausführlichere Evidence zu Stufenwahl, Bilanz und Näherung wird gewählt; Bs create- und A2s none-Empfehlung ersetzen nicht das separat validierte ursprüngliche P-Profil. Die nationale Quellen-/View-Gesamtprüfung bleibt getrennt.',
 'Both original independent reviews confirm the coherent competence of modelling successive protolysis. Their independent calculations confirm the phosphate change and corrected first glycine halfpoint; no universally exact halfpoint rule is claimed. A2’s fuller evidence on stage selection, balance and approximation is selected; B’s create and A2’s none recommendations do not replace the separately validated original P profile. Whole national source/view validation remains separate.'],
 '9fef5c29-62bc-5ada-b96b-6885bcb049cb':[
 'Beide ursprünglichen unabhängigen Reviews bestätigen den geschlossenen Phosphatpuffer als ein Erklärmodell. Beide prüfen gegenläufige Impulse, endliche und unsymmetrische Reserven sowie weitere Stufen nach Paarerschöpfung; überschüssige Basenäquivalente werden nicht mit exakt freiem Hydroxid gleichgesetzt. Die ausführliche A2-Evidence wird gewählt. Die unterschiedlichen none/create-P-Empfehlungen sind durch ein separat originales, validiertes B-P-Profil beantwortet; sie sind keine gegensätzlichen Beschreibungsentscheidungen. Keine menschliche oder tatsächliche Ausführungsfreigabe wird behauptet.',
 'Both original independent reviews confirm the closed phosphate buffer as one explanatory model. Both check opposite pulses, finite asymmetric reserves and additional stages after pair exhaustion; excess base equivalents are not equated with exactly free hydroxide. The fuller A2 evidence is selected. Different none/create P recommendations are addressed by a separately original validated B-P profile and are not contrary description decisions. No human approval or actual execution is claimed.']};
const holds:any={
 'e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f':['EDTA: BB/BE leitfähigkeits-/fällungstitrimetrische Quellenbindung belegt den ganzen Komplexometrieoperator noch nicht.','EDTA: the BB/BE conductivity/precipitation source binding does not establish the whole complexometric operator.'],
 '25729c34-33d5-553a-a723-046113a7da47':['BW quantitative Pufferpflicht und BY gezielte Recherche sowie Kurs-/Erwerbsbindung bleiben offen.','BW quantitative buffer duties, BY targeted research and course/acquisition binding remain open.'],
 '28c90c6a-3020-5c51-ac40-d802f3f12d2d':['Unaufgelöste Überlappung des ganzen Kurvenziels mit 29742; Datenverbesserung ist kein Minimalitätsabschluss.','Whole curve-goal overlap with 29742 is unresolved; better data does not close minimality.'],
 'a449e874-6fec-502b-9667-6f078adc4d64':['HH-Überlappung mit d746 bleibt ungelöst; ursprüngliche Karte chem_eq_q3_006 bleibt exakt erhalten.','HH overlap with d746 remains unresolved; original chem_eq_q3_006 card remains exact.'],
 '29742d91-732f-5da5-bc46-e963885f9a4a':['Ganze Kurvenkompetenz überlappt 28c90; kein Auslagern der GK-Pflicht in einen LK-Ast.','Whole curve competence overlaps 28c90; no relocation of a GK duty to an LK-only branch.'],
 '5a58126e-0c51-5808-be9e-8faa9dae0c32':['Beide Reviews halten die HE-Kurs-/Quellenbindung offen. Ohne kompilierte effektive Projektion wird kein tatsächliches Runtime-Leck behauptet.','Both reviews retain the HE course/source boundary hold. No actual runtime leak is claimed without compiled effective projection.'],
 '13877340-1370-5278-bb80-31cf382dd6f5':['A2 blockiert die noch unbelegte ganze Quellen-/Erwerbsbindung des Konstruktionsoperators, B behält den rechnerisch stimmigen Text. Kein Mehrheits- oder Umdeutungsabschluss; der ganze Befund bleibt offen. Tatsächliche Lernenden-/Laborausführung ist kein maschinelles M7-Gate.','A2 blocks the unestablished whole source/acquisition binding of the construction operator; B keeps the numerically sound text. No majority or reinterpretation clearance: the full finding remains open. Actual learner/laboratory execution is not a machine M7 gate.']};
const pairs=new Map();
for(const id of dual.prepared.manifest.goalIds){
 const first=resolution.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId:id,label:'First'});
 const second=resolution.extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId:id,label:'Second'});
 if(first.errors.length||second.errors.length||!first.source||!second.source)throw Error(JSON.stringify([first.errors,second.errors]));
 pairs.set(id,{first:first.source,second:second.source});
}
const any=pairs.values().next().value;
const completed=[...dual.first.resultPairs,...dual.second.resultPairs].map((p:any)=>Date.parse(p.run.completedAt));
const synthesizedAt=new Date(Math.max(...completed)+1000).toISOString();
const decisions=dual.prepared.manifest.goalIds.filter((id:string)=>keeperIds.includes(id)).map((id:string,i:number)=>{
 const {first,second}=pairs.get(id); if(first.decision!=='keep'||second.decision!=='keep')throw Error('not actual paired keep');
 const r=first.record;
 return {decisionId:'acid10-original-paired-three-20261015-v1-'+String(i+1).padStart(3,'0'),goalId:id,effectiveSemanticKind:'curricularAtomic',goalFingerprint:r.goalFingerprint,pageFingerprint:r.pageFingerprint,goalReviewContextFingerprint:first.binding.goalReviewContextFingerprint,finalText:{titleDe:r.currentTitleDe,titleEn:r.currentTitleEn,descriptionDe:r.currentDescriptionDe,descriptionEn:r.currentDescriptionEn},resolutionDecision:'keep_current',evidenceRound:'first',records:{first:{recordId:first.binding.recordId,recordDigest:first.binding.recordDigest},second:{recordId:second.binding.recordId,recordDigest:second.binding.recordDigest}},rationaleDe:reasons[id][0],rationaleEn:reasons[id][1]};
});
const manifest:any={
 $schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',schemaVersion:1,synthesisContract:'goal-description-rollout-synthesis-decision-v1',manifestId:'chemie-acid10-actual-paired-three-informed-20261015-v1',authority:'ai_synthesis',synthesizedBy:'Codex root informed integrator; no independent scientific vote; original native A2 and B provide the votes',synthesizedAt,
 batch:{batchId:dual.prepared.manifest.batchId,batchManifestDigest:digest(manifestBytes),configDigest:dual.prepared.manifest.configDigest,bundleFingerprint:dual.prepared.manifest.artifacts.bundleFingerprint,bookDigest:dual.first.input.bookDigest,reviewInputFingerprint:dual.first.input.reviewInputFingerprint,dualSummaryDigest:digest(dual.bytes),canonicalLandscapeDigest:digest(await readFile(join(host,dual.prepared.manifest.source.landscapePath)))},
 rounds:{first:contract.buildGoalDescriptionRolloutSynthesisRoundBinding(any.first.binding,dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint),second:contract.buildGoalDescriptionRolloutSynthesisRoundBinding(any.second.binding,dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint)},decisions,
 deferredGoals:dual.prepared.manifest.goalIds.filter((id:string)=>!keeperIds.includes(id)).map((id:string)=>({goalId:id,firstDecision:pairs.get(id).first.decision,secondDecision:pairs.get(id).second.decision,rationaleDe:holds[id][0],rationaleEn:holds[id][1]}))};
manifest.manifestFingerprint=contract.fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifest);
const bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
const structure=await contract.validateGoalDescriptionRolloutSynthesisDecisionManifestStructure(manifest);if(structure.errors.length)throw Error(structure.errors.join(' | '));
await writeFile(join(dir,'synthesis-decisions.json'),bytes);await mkdir(join(dir,'resolutions'),{recursive:true});
for(const decision of decisions){const id=decision.goalId;const {first,second}=pairs.get(id);const summaryGoal=dual.summary.goals.find((g:any)=>g.goalId===id);const synthesis=synth.buildGoalDescriptionRolloutResolutionSynthesis({batchId:dual.prepared.manifest.batchId,manifest,decision,summaryGoal,firstSource:first,secondSource:second});const result=resolution.buildGoalDescriptionDualRoundResolution({resolutionId:'acid10-original-paired-three-20261015-v1-'+id,goalId:id,effectiveSemanticKind:'curricularAtomic',decision:'keep_current',synthesis,dualSummaryBytes:dual.bytes,currentInput:dual.first.input,firstSource:first,secondSource:second,synthesisDecisionManifest:{contract:'goal-description-rollout-synthesis-decision-v1',manifestPath:'synthesis-decisions.json',manifestId:manifest.manifestId,manifestDigest:digest(bytes),manifestFingerprint:manifest.manifestFingerprint,decisionId:decision.decisionId}});if(result.status!=='resolved')throw Error('unresolved '+id);await writeFile(join(dir,'resolutions',id+'.resolution.json'),JSON.stringify(result,null,2)+'\n');}
await batch.materializeGoalDescriptionRolloutBatchResolutionIndex(cfg,true);
console.log(JSON.stringify({role:'informed synthesis, not independent scientific review',pairedKeep:decisions.length,deferred:manifest.deferredGoals.length,actualExecutionUTC:new Date().toISOString(),logicalSynthesisTimestampRequiredByStockContract:synthesizedAt}));
