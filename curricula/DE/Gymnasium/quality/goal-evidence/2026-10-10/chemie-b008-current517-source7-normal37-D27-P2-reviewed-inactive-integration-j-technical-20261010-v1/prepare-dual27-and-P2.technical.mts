// SPDX-License-Identifier: Apache-2.0
// Technical integration after separately sealed A/B first subject reviews.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { loadGoalDescriptionReviewCampaignResultDirectories } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import { validateGoalDescriptionReviewDualRound } from '../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound.ts'
import { buildGoalDescriptionDualRoundResolution, extractGoalDescriptionDualRoundResolutionSource, validateGoalDescriptionDualRoundResolution } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import { validateStandaloneResolutionIndexSchema, validateStandaloneResolutionIndexStructure } from '../../../../../../../app/scripts/reportDeepUnderstandingRollout.ts'
const root=resolve('.'), own=dirname(fileURLToPath(import.meta.url))
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8'))
const write=(p:string,v:any)=>{assert.ok(p.startsWith(own+'/'));mkdirSync(dirname(p),{recursive:true});writeFileSync(p, typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'})}
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>({path:relative(root,p),sha256:sha(readFileSync(p)),bytes:readFileSync(p).length})
const inputs=read(resolve(own,'technical-inputs.json')), candidate=read(resolve(root,inputs.candidateLandscape)), whole398=read(resolve(root,inputs.whole398Model))
const modelIds=new Set<string>(whole398.pages.map((g:any)=>g.goalId));assert.equal(modelIds.size,398)
// Explicit per-target selection following actual comparison of every A/B
// rationale and six-field evidence. This is selection, not a third review.
const choices:Record<string,[string,string]>={
 'f4d5a02d':['b','Die zweite Evidenz konkretisiert Vergleichsmessung und Bedingungen; die vorhandene Bild-Deferral bleibt ausdrücklich offen. Die divergierende optionale P-Empfehlung erzeugt keinen neuen P-Nachweis.'],
 '2fdd759f':['a','Die erste Evidenz nennt die tatsächliche sichere Titration und die Redoxbegründung gemeinsam. Die optionale P-Empfehlung ist keine neue praktische Freigabe.'],
 '75e2eff1':['b','Die zweite Evidenz macht überprüfbare Befunde und mögliche Widerlegung der einfachen Hypothese konkret.'],
 '503dedcb':['a','Die erste Evidenz hält Theorie, Hypothese und Gegenbefund zusammen und grenzt die Oberstufenleistung vom unteren Vorgänger ab.'],
 'e81a4aed':['a','Die erste Evidenz verlangt ausdrücklich tatsächliche sichere Durchführung und eigene Beobachtung.'],
 '42391b16':['b','Die zweite Evidenz konkretisiert begründete Planung und kontrollierte qualitative beziehungsweise quantitative Durchführung.'],
 'f79f15c0':['a','Die erste Evidenz erhält theoriegestützte Verfahrenswahl und tatsächliche sichere Durchführung ohne Ersatz durch Modellrechnung.'],
 '9fc800d1':['b','Die zweite Evidenz trennt Datenherkunft, Beobachtung und Deutung im nachvollziehbaren Protokoll.'],
 '7d9fcc7f':['b','Die zweite Evidenz bindet Datenanalyse an die überprüfte Hypothese und die jeweiligen Untersuchungsbedingungen.'],
 '9e3fae29':['a','Die erste Evidenz erhält geeignete mathematische und digitale Auswertung sowie die Theorieprüfung.'],
 '4aa3a130':['b','Die zweite Evidenz konkretisiert Reichweite, Störgrößen und Unsicherheit als begründetes Gültigkeitsurteil.'],
 'a8800c36':['a','Die erste Evidenz beschreibt den gegebenen Erkenntnisweg und unterscheidet ihn von eigener Prozessreflexion.'],
 '99d41b0f':['a','Die erste Evidenz hält eigenes Vorgehen, Unsicherheit und passende Verbesserung zusammen.'],
 '5b1bb5d9':['b','Die zweite Evidenz konkretisiert Informationenauswahl, strukturierte Antwort und nachvollziehbare Herkunft.'],
 'ac8b6c0f':['a','Die erste Evidenz erhält selbständige Recherche in analogen und digitalen Medien sowie Quellenkennzeichnung.'],
 '36666b4a':['b','Die zweite Evidenz bindet Urheberschaft, Absicht und Vertrauenswürdigkeit an die konkrete chemische Frage.'],
 '431a0f03':['b','Die zweite Evidenz konkretisiert das gewichtete Abwägen belegter Argumente und geänderter Kriterien.'],
 '31781d00':['a','Die erste Evidenz erhält chemische Aussage und Teilchenbilanz bei begründeter Darstellungsumwandlung.'],
 '38e30bb9':['a','Die erste Evidenz verlangt das eigene Präsentationsprodukt mit passenden analogen UND digitalen Medien.'],
 '7f140b34':['b','Die zweite Evidenz verknüpft konkrete chemische Anwendungen mit Betroffenen und gesellschaftlichen Folgen.'],
 '6c9adc36':['a','Die erste Evidenz erhält einen freiwilligen begründeten Orientierungsvergleich ohne private Berufswahl zu bewerten.'],
 '1df17884':['b','Die zweite Evidenz konkretisiert gewichtete Handlungsoptionen, Chancen, Risiken und geänderte Kriterien.'],
 'e5a5dcd8':['b','Die zweite Evidenz grenzt gesellschaftlichen Einfluss von empirischer Gültigkeit ab. Der bereits exakt geerbte P-Nachweis bleibt; die optionale P-Empfehlung und C11-HOLD werden nicht als neue Kursfreigabe behandelt.'],
 '9f892457':['b','Die zweite Evidenz konkretisiert ökologische, ökonomische und soziale Folgen sowie Handlungsmöglichkeiten.'],
 '1f354a60':['a','Die erste Evidenz fordert tatsächliche Partnerantwort und ausdrückliche Standpunktprüfung; kein synthetischer Dialog wird anerkannt.'],
 '6c7ce93c':['a','Die erste Evidenz erhält analoges ODER digitales Modell und Modellkritik. Feinbau-/Softwarepflichten in eigenen Quellenkontexten bleiben separat verbindlich.'],
 '86d34f1f':['b','Die zweite Evidenz erhält sämtliche Modellbereiche und tatsächlich analoge UND digitale Produkte sowie Aussagegrenzen.']
}
const actual:any[]=[]
for(const group of ['affected20-1','affected7-2']){
 const dir=resolve(own,group)
 const load=async(label:string)=>{const d=resolve(dir,'round-'+label);const campaign=read(resolve(d,'description-review-campaign.json'));const loaded=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(d,'batches'),resultsDirectory:resolve(d,'results')});assert.deepEqual(loaded.errors,[]);return {bundle:read(resolve(d,'review-bundle-manifest.json')),input:read(resolve(d,'description-review-input.json')),campaign,resultPairs:loaded.resultPairs}}
 const [first,second]=await Promise.all([load('a'),load('b')]);assert.equal(stableGoalBookJson(first.input),stableGoalBookJson(second.input))
 const dual=await validateGoalDescriptionReviewDualRound({first,second});assert.deepEqual(dual.errors,[]);assert.ok(dual.summary)
 const dualBytes=Buffer.from(JSON.stringify(dual.summary,null,2)+'\n');write(resolve(dir,'dual-summary.json'),dualBytes.toString())
 const entries:any[]=[];const ids=first.input.goals.map((g:any)=>g.goalId),gid='chemie-current517-source7-normal37-dual27-j-'+group
 for(const goalId of ids){
  const a=extractGoalDescriptionDualRoundResolutionSource({artifacts:first,goalId,label:'Separately sealed genuine A'}),b=extractGoalDescriptionDualRoundResolutionSource({artifacts:second,goalId,label:'Separately sealed genuine B'});assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);assert.ok(a.source?.record&&b.source?.record);assert.equal(a.source.decision,'keep');assert.equal(b.source.decision,'keep')
  const [selected,note]=choices[goalId.slice(0,8)];assert.ok(note);const chosen=selected==='a'?a.source:b.source;const comparison=dual.summary!.goals.find((g:any)=>g.goalId===goalId)!;const differs=a.source.record.evidenceProfileRecommendation!==b.source.record.evidenceProfileRecommendation
  const rationaleDe=note+' Beide vollständigen unabhängig versiegelten Records sind fachlich kompatibel und behalten ihre Grenzen. Die ausgewählte sechsfach bilinguale Verständnisevidenz wird unverändert übernommen; beide vollständigen Records bleiben erhalten. Dies ist technische Auswahl ohne dritte Fachprüfung, neue SOURCE-/Kursfreigabe, Lernendenleistung oder menschliche Freigabe.'
  const rationaleEn='Individual technical selection of the unchanged '+(selected==='a'?'first':'second')+' six-field bilingual evidence after reading both complete independently sealed records. Both KEEP judgments are compatible; all original source, practical and media limits remain. '+(differs?'The differing optional profile-creation recommendation creates no profile or practical clearance; existing independently reviewed profiles and deferrals remain. ':'')+'This is no third scientific review, course or source clearance, learner-performance claim or human approval.'
  const synthesis={synthesisId:gid+'-'+goalId,authority:'ai_synthesis' as const,synthesizedBy:'Codex technical J integrator after own sealed independent B and separately sealed A; no third scientific review',synthesizedAt:new Date().toISOString(),rationaleDe,rationaleEn,understandingEvidence:structuredClone(chosen.record.understandingEvidence),dissent:comparison.agreement==='disagreement'?[{dissentId:gid+'-difference-'+goalId,source:'both' as const,textDe:'Der normale Vergleich zeigt '+comparison.disagreementFields.join(', ')+'. '+note+(differs?' A empfiehlt none und B create; dies ist ein ausdrücklicher Empfehlungsunterschied, keine Textrevision. P36 bleiben exakt geerbt; neue P-Erstellung folgt daraus nicht.':''),textEn:'Normal comparison reports '+comparison.disagreementFields.join(', ')+'. Both KEEP decisions remain compatible. '+(differs?'A recommends none and B create: an explicit recommendation difference, not a text revision. This does not create a profile. ':'')+'The individually selected evidence remains unchanged and both complete source records are retained.',disposition:selected==='a'?'accepted_first' as const:'accepted_second' as const}]:[],humanAttestation:null}
  const resolution=buildGoalDescriptionDualRoundResolution({resolutionId:gid+'-resolution-'+goalId,goalId,effectiveSemanticKind:'curricularAtomic',decision:'keep_current',synthesis,dualSummaryBytes:dualBytes,currentInput:first.input,firstSource:a.source,secondSource:b.source});const valid=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:dual.summary!,dualSummaryBytes:dualBytes,currentInput:first.input,landscape:candidate,first,second});assert.deepEqual(valid.errors,[]);assert.equal(valid.strictDescriptionComplete,true)
  const p=resolve(dir,'resolutions',goalId+'.resolution.json');write(p,resolution);entries.push({goalId,titleDe:resolution.goal.finalText.titleDe,groupId:gid,decision:'keep_current',resolutionPath:'resolutions/'+goalId+'.resolution.json',resolutionDigest:bind(p).sha256,resolutionFingerprint:resolution.resolutionFingerprint,strictDescriptionComplete:true})
  actual.push({goalId,selectedUnchangedEvidence:selected,individualSelectionReasonDe:note,normalComparison:comparison,firstBinding:a.source.binding,secondBinding:b.source.binding,firstWholeRecord:a.source.record,secondWholeRecord:b.source.record,normalValidation:valid,newScientificReviewClaimed:false,newPProfileCreated:false})
 }
 const index:any={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',schemaVersion:2,indexContract:'goal-description-standalone-batch-resolution-index-v1',artifactSetId:gid+'-strict-resolutions',subject:'Chemie',semanticKind:'curricularAtomic',batchGoalIds:ids,groups:[{groupId:gid,artifactDirectory:'.',dualSummaryPath:'dual-summary.json',dualSummaryDigest:sha(dualBytes),campaignGoalCount:ids.length,resolvedGoalCount:entries.length}],resolutions:entries}
 assert.deepEqual(validateStandaloneResolutionIndexSchema(index),[]);assert.deepEqual(validateStandaloneResolutionIndexStructure(index,modelIds),[]);write(resolve(dir,'resolution-index.json'),index)
}
assert.equal(actual.length,27);write(resolve(own,'checks/dual27-both-whole-records-and-individual-selection.actual.json'),{schemaVersion:1,rows:actual,all27ActualNormalDualAndResolutionValid:true,newScientificReviews:0,humanApproval:false})
const AFirst=read(resolve(root,inputs.A,'FIRST.current517-source7-normal37-D27-P2.independent-A.entry.json')),BFirst=read(resolve(root,inputs.B,'P2.first.independent-b.json'))
const templates=readFileSync(resolve(own,'positive/two-current-context.template.exact.jsonl'),'utf8').trim().split('\n').map(l=>JSON.parse(l)),pProof:any[]=[]
const pRecords=templates.map((r:any)=>{const a=AFirst.P2CurrentRouteFollowup.find((x:any)=>x.goalId===r.goalId),b=BFirst.rows.find((x:any)=>x.goalId===r.goalId);assert.equal(a.decision,'accept_current_route_binding_with_whole_unchanged_profile');assert.equal(b.decision,'approve_current_route_context_rebinding');assert.equal(stableGoalBookJson(r.profile),stableGoalBookJson(b.wholeScientificProfileBody));const original=structuredClone(r);r.reviewId='chemie-current517-p2-current-routes-reviewed-j-technical-v1';r.reviewer='Codex technical J integrator of separately sealed genuine current A and B P2 route reviews; no third science review';r.reviewedAt=new Date().toISOString();r.reason='Complete scientific body inherited exactly. The changed direct orientation/context was actually reviewed by separately sealed A and B, both accepting it while preserving the original content prerequisite and full original performance. Technical current binding after those reviews; E1/G1 needs_human_review ai_candidate, approved0. No source/course clearance, laboratory or learner-performance claim.';r.dissent=['Both actual independently sealed current route decisions and original whole scientific bodies remain bound in the companion provenance.','Orientation is motivational, never content mastery. Dialogue requires actual response; the upper model leaf requires analogue AND digital products and all declared model contexts.','C11 source/course HOLD and all20 Atlas omissions /496 unresolved decisions remain open.'];assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');pProof.push({goalId:r.goalId,originalTemplate:original,currentRecord:r,wholeBodyExact:true,originalProfileFingerprintUnchanged:r.profileFingerprint===original.profileFingerprint,currentNativeGoalFingerprint:b.nativeGoalFingerprint,currentNativePageFingerprint:b.nativePageFingerprint,firstA:bind(resolve(root,inputs.A,'FIRST.current517-source7-normal37-D27-P2.independent-A.entry.json')),firstB:bind(resolve(root,inputs.B,'FIRST.independent-b.entry.json')),aRouteVerdictUnchanged:a,bRouteVerdictUnchanged:b,newWholeScienceReviewClaim:false});return r})
write(resolve(own,'positive/two-current-route-context.paired-reviewed.records.jsonl'),pRecords.map(r=>JSON.stringify(r)).join('\n')+'\n');write(resolve(own,'checks/P2-current-rebinding-and-whole-body-exact.actual.json'),{schemaVersion:1,rows:pProof,wholeScientificBodiesChanged:0,actualLearnerPerformance:false,humanApproval:false,newScienceReviews:0})
console.log(JSON.stringify({normalDual27:'PASS',normalStandaloneIndexes:2,individualCurrentStrictResolutions:27,P2BodiesExact:true,activeWrites:0,newScientificReviews:0}))
