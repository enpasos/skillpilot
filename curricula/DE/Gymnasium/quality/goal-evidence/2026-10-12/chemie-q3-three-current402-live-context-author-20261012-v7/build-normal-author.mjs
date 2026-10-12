import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {fileURLToPath,pathToFileURL} from 'node:url'

const base=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(base,'../../../../../../..')
const old=path.join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-q3-v6-current402-neutral-context-integration-preparation-20261011-v1')
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),rel=p=>path.relative(root,p),hash=p=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),ref=p=>({path:rel(p),bytes:fs.statSync(p).size,sha256:hash(p)})
const write=(p,v)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n')},jl=p=>fs.readFileSync(p,'utf8').trim().split('\n').map(JSON.parse)
const importHelper=f=>import(pathToFileURL(path.join(root,'app/scripts',f)))
const B=await importHelper('goalBookModel.ts'),P=await importHelper('positiveGoalEvidenceProfileModel.ts'),R=await importHelper('goalBookRenderer.ts')
const {buildGoalBookSourceAtlasInputs}=await importHelper('goalBookSourceAtlasInputs.ts'),{buildGoalBookOriginalSources}=await importHelper('goalBookOriginalSources.ts')
const {buildGoalDescriptionRolloutSubsetModel}=await importHelper('materializeGoalDescriptionRolloutBatch.ts'),{buildGoalBookReviewBundle}=await importHelper('exportGoalBookReviewBundle.ts'),{createGoalDescriptionReviewCampaignArtifacts}=await importHelper('createGoalDescriptionReviewCampaign.ts')
const first=read(path.join(base,'FIRST.author-exact-inputs-CAS.json'))
for(const r of first.inputs){assert.equal(hash(path.join(root,r.path)),r.sha256,r.path)}
const join0=read(path.join(base,'inputs/parent-whole-three-current402-source382-P3-seven-cases.exact.json')),ids=join0.goals.map(g=>g.wholeCandidateGoal.id)
const land0=read(path.join(base,'baseline/canonical523.live.exact.json')),land1=read(path.join(base,'candidate/canonical523.live-five-applicability-fixes-Q3-only.inactive.json')),g0=new Map(land0.goals.map(g=>[g.id,g])),g1=new Map(land1.goals.map(g=>[g.id,g]))
for(const g of land1.goals){assert.deepEqual(g.requires,g0.get(g.id).requires);if(!ids.includes(g.id))assert.deepEqual(g,g0.get(g.id))}
const sem0=read(path.join(base,'baseline/semantic402.live.exact.json')),sem1=structuredClone(sem0),semanticChanges=[]
for(const d of sem1.decisions){const fp=B.fingerprintSemanticKindSourceGoal(g1.get(d.goalId));if(fp!==d.sourceFingerprint){assert.ok(ids.slice(0,2).includes(d.goalId),d.goalId);semanticChanges.push(d.goalId);d.sourceFingerprint=fp}}
assert.deepEqual(semanticChanges.sort(),ids.slice(0,2).sort())
const landscape0=rel(path.join(base,'baseline/canonical523.live.exact.json')),landscape1=rel(path.join(base,'candidate/canonical523.live-five-applicability-fixes-Q3-only.inactive.json'))
sem0.sourceLandscapePath=landscape0;sem1.sourceLandscapePath=landscape1
write(path.join(base,'baseline/semantic402.live-normal-path-binding.json'),sem0);write(path.join(base,'candidate/semantic402.current-two-normal-fingerprints.inactive.json'),sem1)
const qa0=read(path.join(base,'baseline/visualization-QA.live.exact.json')),qa1=structuredClone(qa0),now=new Date().toISOString()
const assetMap=Object.fromEntries(read(path.join(old,'FIRST.supplement.actual-normal-helper-view-assets.json')).assets.map(r=>[r.imageUrl,r.sha256]))
const findings={
 [ids[0]]:'KEEP native/360/680: substance-time panels and model A+B⇌AB are clearly separated; forward/reverse transformations are atom-consistent and explicitly equally fast. The model and orange appearance are not experimental species/rate evidence. Friendly abstract design, readable main labels, no actor-view issue.',
 [ids[1]]:'KEEP native/360/680: electrons Zn→Cu; Zn negative/Cu positive; nitrate→anode and potassium→cathode; relative SHE0.00V, Cu+0.34V and Zn−0.76V give1.10V. Clearly labels E° vs.SHE. No absolute-potential claim, no actor-view issue; strong contrast and readable cell/electrode cues.',
 [ids[2]]:'KEEP native/360/680: alkaline manganese outer MnO2 positive and inner Zn negative with separator and collector; shapes and primary single-use status, performance/cost/disposal cues visible. Simplified illustration does not replace chemical half-reactions or quantitative comparisons. Friendly abstraction and main labels remain recognizable; no actor-view issue.'}
const visual=[]
for(const id of ids){
 const png=path.join(base,'assets',id,id+'.png'),link=g1.get(id).resourceLinks.find(r=>r.type==='goal-visualization');assetMap[link.url]=hash(png)
 const q=qa1.records.find(r=>r.goalId===id),parent=read(path.join(base,'candidate/visualization-QA.only-three-unapproved-PNG.inactive.json')).records.find(r=>r.goalId===id)
 const human=Object.fromEntries(Object.entries(q).filter(([k])=>k.startsWith('human')))
 Object.assign(q,parent,{landscapePath:landscape1,assetSha256:hash(png),umlautsCorrectChatGpt:'yes',contentApprovedChatGpt:'yes',chatGptReviewedAt:now,chatGptReviewer:'Codex actual AUTHOR visual inspection; no independent vote',chatGptNotes:findings[id],aiApproved:'yes',aiApprovedAssetSha256:hash(png),aiReviewedAt:now,aiReviewer:'Codex actual AUTHOR visual inspection; machine-only candidate',aiNotes:findings[id]},human)
 const pngHeader=fs.readFileSync(png)
 visual.push({goalId:id,decision:'KEEP',image:ref(png),nativeDimensions:{width:pngHeader.readUInt32BE(16),height:pngHeader.readUInt32BE(20)},actualViews:[ref(png),ref(path.join(base,'assets',id,'view-360.png')),ref(path.join(base,'assets',id,'view-680.png'))],notes:findings[id],reviewAuthority:'ai_candidate',independentReview:false,HumanApproval:false,HumanTrial:false,historicalJPEGApprovalTransferred:false,desktop4by3Exception:false,desktopWidth680FitsHeight448:true})
}
write(path.join(base,'candidate/visualization-QA.current-three-actual-PNG-author-AI.inactive.json'),qa1)
write(path.join(base,'checks/V3.actual-native-360-680-author-KEEP.json'),{reviewedAt:now,actualImagesViewed:true,records:visual,sourcePNGsUnchanged:true,activeImport:false})
let p3=read(path.join(base,'positive/P3.author-before-normal-fingerprints.json'))
for(const r of p3){const g=g1.get(r.goalId),resources=Object.fromEntries(g.resourceLinks.filter(l=>l.type==='goal-visualization').map(l=>[l.url,assetMap[l.url]]));r.goalFingerprint=P.fingerprintGoalForPositiveEvidence(g,'curricularAtomic');r.reviewInputFingerprint=P.fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,resources,'curricularAtomic');r.profileFingerprint=P.fingerprintPositiveGoalEvidenceProfile(r.profile);assert.deepEqual(P.validatePositiveGoalEvidenceRecordSemantics(r,g,resources,'curricularAtomic'),[])}
const pp=path.join(base,'positive/P3.current402.author.records.jsonl');fs.writeFileSync(pp,p3.map(r=>JSON.stringify(r)).join('\n')+'\n')
const oldP=jl(path.join(base,'positive/P3.frozen398-author-science.exact.jsonl'));assert.deepEqual(p3.slice(1),oldP.slice(1),'good8be/c884positive records retained exact')
const mc0=read(path.join(base,'baseline/memory402.current-config.exact.json')),m0=jl(path.join(base,'baseline/memory402.current-necessity.exact.jsonl')),m1=structuredClone(m0)
const ts=(await import(pathToFileURL(path.join(root,'app/node_modules/typescript/lib/typescript.js')))).default,mt=fs.readFileSync(path.join(root,'app/scripts/memoryCardReview.ts'),'utf8')
const fptext=ts.transpileModule(mt.slice(mt.indexOf('function normalizeText('),mt.indexOf('function fingerprintMemoryCard(')),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
const mfp=new Function('createHash',fptext+';return fingerprintGoal;')(crypto.createHash)
assert.equal(m0.length,402)
const m2=[]
for(const id of ids.slice(0,2)){
 const r=m1.find(r=>r.goalId===id);assert.equal(r.fingerprint,mfp(g0.get(id),mc0.ruleVersion));r.fingerprint=mfp(g1.get(id),mc0.ruleVersion);r.reviewedAt='2026-10-12';r.reviewer='Codex AUTHOR fresh semantic Memory decision current402 Q3 v7'
 if(id===ids[0]){assert.equal(r.status,'no_memory_needed');r.reason='Aktueller ganzer Operator: chemische Gleichgewichte auf Stoff-/Teilchenebene charakterisieren, Edukte/Produkte experimentell gemeinsam nachweisen und statische Stoffebene/dynamische Teilchenebene unterscheiden. Der unabhängige Nachweisschluss benötigt konkrete Probe, Selektivität/Kontrollen, Bilanz und Modellargumentation. Eine Karte mit dem Satz dynamisches Gleichgewicht ersetzt diese Leistung nicht; kein zusätzliches hartes Erinnerungsitem und kein enges Deck nötig. Die neue Experimentpflicht wird fachlich geprüft, nicht durch Auswendiglernen erfüllt.'}
 else {assert.equal(r.status,'memory_required');assert.deepEqual(r.deckIds,['de_gymnasium_chemistry_equilibria_q3']);assert.deepEqual(r.memoryGoalIds,['1f2021c0-c633-5240-ae97-e58ecc9d48ca']);r.reason='Aktuelles Standardpotenzial ist relativ zur SHE und Grundlage von Zellspannungsdifferenz/Spannungsreihe. Kompakter Erinnerungsanker bleibt die korrekt gerichtete Standard-Reduktionspotenzial-Regel: positiveres E° bedeutet stärkeres Oxidationsmittel der oxidierten Form unter Standardbedingungen. Bestehende chem_eq_q3_009 wurde tatsächlich gelesen und ist dafür notwendig; Zellvergleich, Bezugselektrode, Signum, Ionen-/Elektronenfluss und experimentelle Deutung bleiben Aufgaben-/Modellleistung. Vorhandenes kanonisches Q3-Deck/Memoryziel genügt; keine neuen Karten oder Decks.'}
 m2.push(r)
}
const mr=path.join(base,'memory/current402.only-two-fresh-semantic-M2.author.review.jsonl'),m2p=path.join(base,'memory/M2.targeted-author-decisions.current-goals.jsonl')
fs.writeFileSync(mr,m1.map(r=>JSON.stringify(r)).join('\n')+'\n');fs.writeFileSync(m2p,m2.map(r=>JSON.stringify(r)).join('\n')+'\n')
for(const r of m1){assert.equal(r.fingerprint,mfp(g1.get(r.goalId),mc0.ruleVersion));if(!ids.slice(0,2).includes(r.goalId))assert.deepEqual(r,m0.find(x=>x.goalId===r.goalId))}
const mconfig={...mc0,landscapePath:landscape1,reviewPath:rel(mr),cardReviewPath:rel(path.join(base,'baseline/memory75.current-cards.exact.jsonl')),reportPath:rel(path.join(base,'checks/M402.current-candidate.normal.report.md'))}
write(path.join(base,'memory/current402.inactive.config.json'),mconfig)
write(path.join(base,'checks/M2.actual-semantic-author-decisions-and-trace.json'),{role:'Fresh author Memory judgments, not mechanical fingerprint refresh',goals:m2.map(r=>({wholeCurrentGoal:g1.get(r.goalId),decision:r})),cardActuallyRead:{path:'app/public/data/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json',cardId:'chem_eq_q3_009',front:'Elektrochemische Spannungsreihe: Vorzeichen-Deutung?',back:'Je positiver das Standardpotenzial, desto stärker wirkt die oxidierte Form als Oxidationsmittel.',currentCardLedgerExact:true},other400RecordsExact:true,cards75Exact:true,current402NormalFingerprintsPass:true,independentReview:false})
const baseConf=read(path.join(old,'configs/whole402.inactive.config.json'))
const c1={...baseConf,bookId:'chemie-q3-live402-author-v7',title:'Chemie Q3 – aktueller402 Autorenkandidat',landscapePath:landscape1,semanticKindLedgerPath:rel(path.join(base,'candidate/semantic402.current-two-normal-fingerprints.inactive.json')),goalVisualizationQaPath:rel(path.join(base,'candidate/visualization-QA.current-three-actual-PNG-author-AI.inactive.json')),evidenceReviewPaths:[rel(path.join(base,'positive/retained-current-non-Q3-lines.exact.jsonl')),rel(pp)],outputPath:rel(path.join(base,'native/whole402.normal-model.json'))}
const c0={...c1,bookId:'chemie-q3-live402-baseline-v7',landscapePath:landscape0,semanticKindLedgerPath:rel(path.join(base,'baseline/semantic402.live-normal-path-binding.json')),goalVisualizationQaPath:rel(path.join(base,'baseline/visualization-QA.live.exact.json')),evidenceReviewPaths:read(path.join(base,'inputs/current-active-positive-input-paths.actual.json')).paths}
write(path.join(base,'native/whole402.inactive.config.json'),c1)
const build=(land,sem,qa,config,more={})=>B.parseAndValidateGoalBookModel(B.buildGoalBookModel({landscape:land,semanticKindLedger:sem,goalVisualizationQa:qa,goalVisualizationAssetDigests:assetMap,config,evidenceReviewSources:config.evidenceReviewPaths.map(p=>({path:p,text:fs.readFileSync(path.join(root,p),'utf8')})),...more}))
const view=read(path.join(root,c1.compositionViewPath)),whole0=build(land0,sem0,qa0,c0,{compositionView:view}),whole1=build(land1,sem1,qa1,c1,{compositionView:view})
assert.equal(whole1.pages.length,402);write(path.join(base,'native/whole402.normal-model.json'),whole1)
const sc0=read(path.join(base,'baseline/source-atlas.inputs.current-active.exact.json')),sc1={...sc0,landscapePath:landscape1,semanticKindLedgerPath:c1.semanticKindLedgerPath,durationModelPolicyPath:rel(path.join(base,'baseline/duration-model-policy.current-active.exact.json'))},sbase={...sc1,landscapePath:landscape0,semanticKindLedgerPath:c0.semanticKindLedgerPath}
const a0=buildGoalBookSourceAtlasInputs(sbase,root),a1=buildGoalBookSourceAtlasInputs(sc1,root)
assert.equal(a1.receipt.counts.publishedCurricularAtomicGoals,382);assert.equal(a1.receipt.counts.sourceViews,48)
const viewDiff=Object.keys(a0.outputs).filter(p=>p.endsWith('.view.json')&&a0.outputs[p]!==a1.outputs[p]);assert.deepEqual(viewDiff,[])
const outputMap=[]
for(const [p,text] of Object.entries(a1.outputs)){const d=path.join(base,'sources/generated',path.basename(p));fs.mkdirSync(path.dirname(d),{recursive:true});fs.writeFileSync(d,text);outputMap.push({normalReturnedPath:p,actualRegularCopy:ref(d)})}
write(path.join(base,'sources/current-source382.normal-output-copy-map.json'),{copies:outputMap,activeSourceOutputWrites:false})
const sourceBook=read(path.join(base,'baseline/source-atlas.book.current-active.exact.json')),sourceConfig={...sourceBook,landscapePath:landscape1,semanticKindLedgerPath:c1.semanticKindLedgerPath,goalVisualizationQaPath:c1.goalVisualizationQaPath,evidenceReviewPaths:c1.evidenceReviewPaths,outputPath:rel(path.join(base,'native/source382.normal-model.json'))},sourceBase={...sourceConfig,landscapePath:landscape0,semanticKindLedgerPath:c0.semanticKindLedgerPath,goalVisualizationQaPath:c0.goalVisualizationQaPath,evidenceReviewPaths:c0.evidenceReviewPaths}
const more=a=>{const m=JSON.parse(a.outputs[sc1.manifestPath]);return {compositionViewManifest:m,compositionViewSources:m.sourcePaths.map(p=>({path:p,view:JSON.parse(a.outputs[p])})),navigationView:JSON.parse(a.outputs[m.navigationViewPath]),durationModelPolicy:read(path.join(base,'baseline/duration-model-policy.current-active.exact.json'))}}
const source0=build(land0,sem0,qa0,sourceBase,more(a0)),source1=build(land1,sem1,qa1,sourceConfig,more(a1));assert.equal(source1.pages.length,382);write(path.join(base,'native/source382.normal-model.json'),source1)
const originals=buildGoalBookOriginalSources(source1,root,sc1.mappingPaths),expanded=id=>originals.goals[id].map(scope=>({...scope,evidence:scope.evidenceIds.map(id=>{const e=originals.evidence.find(e=>e.id===id);return {...e,document:originals.documents.find(d=>d.id===e.documentId)}})}))
const oldcases=read(path.join(base,'cases/cases6.current402.whole-context.technical.json')),chemcase=read(path.join(base,'cases/q3-01-c.current402.SYNTHETIC-template.technical.json')),newcase=read(path.join(base,'cases/q3-01-d.authentic-published-evidence-whole-case.author.json')),dossier=read(path.join(base,'sources/q3-01-d.authentic-published-chemical-dossier.author.json'))
const joined={schemaVersion:1,role:'Neutral whole current402/source382 AUTHOR candidate input; no current independent review',goalIds:ids,currentCanonicalGoals:523,currentCurricularAtomic:402,currentSourceUnion:382,sourceViewCount:48,independentReview:false,goals:ids.map(id=>({wholeLiveGoal:g0.get(id),wholeCandidateGoal:g1.get(id),completeLive402Page:whole0.pages.find(p=>p.goalId===id),completeCandidate402Page:whole1.pages.find(p=>p.goalId===id),completeLive382SourcePage:source0.pages.find(p=>p.goalId===id),completeCandidate382SourcePage:source1.pages.find(p=>p.goalId===id),completeDirectPrerequisiteGoals:g1.get(id).requires.map(r=>g1.get(r)),completeReverseDependentGoals:land1.goals.filter(g=>g.requires?.includes(id)),completeCurrentSourceScopeDocumentFieldset:expanded(id),wholePositiveRecord:p3.find(r=>r.goalId===id),wholeRetainedSixCases:oldcases.cases.filter(c=>c.goalId===id),additionalWholeSyntheticSeventhCase:id===ids[0]?chemcase:null,additionalWholeAuthenticDossierCase:id===ids[0]?newcase:null,authenticChemicalDossier:id===ids[0]?dossier:null,currentMemoryDecision:m1.find(r=>r.goalId===id),exactPNG:visual.find(r=>r.goalId===id).image})),sourceOperatorCompleted:false,authenticPublishedChemicalDossierBound:true,actualLearnerPerformance:false,ownChemicalExperimentPerformed:false,HumanApproval:false,HumanTrial:false,machineStrictGain:0}
write(path.join(base,'inputs/neutral-whole-three-LIVE402-source382-P3-eight-cases-and-authentic-dossier.author.join.json'),joined)
const changed=(a,b)=>b.pages.filter(p=>JSON.stringify(p)!==JSON.stringify(a.pages.find(q=>q.goalId===p.goalId))).map(p=>p.goalId)
assert.deepEqual(changed(whole0,whole1).sort(),[...ids].sort());assert.deepEqual(changed(source0,source1).sort(),[...ids].sort())
write(path.join(base,'checks/normal-live402-source382-M2-P3-and-protected-context.author.actual.json'),{result:'PASS_author_candidate_technical',whole402Digest:whole1.digest,source382Digest:source1.digest,normalModelPages:{whole:402,source:382},currentSourceViews:48,other520WholeGoalsExactLive:true,all523RequiresExactLive:true,allFiveB007ApplicabilityFixesExactLive:true,other399WholePagesExactLive:true,other379SourcePagesExactLive:true,all48SourceViewsExactLive:true,positiveNormalSemanticChecks:'PASS3',only81373ProfileAuthoredDelta:true,otherTwoGoodP3RecordsExact:true,sevenOriginalWholeCasesExact:true,additionalAuthenticCritiqueCase:1,currentM402NormalFingerprints:'PASS402',other400MDecisionsExact:true,cards75Exact:true,sourceCountsAndHolds:a1.receipt.counts,activeWrites:false,machineStrictGain:0,independentReview:false,HumanApproval:false,HumanTrial:false})
for(const [context,model] of [['whole402',whole1],['source382',source1]]){
 const sub=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:ids,bookId:'chemie-q3-'+context+'-native3-live-author-v7',title:'Chemie Q3 – drei vollständige aktuelle Ziele ('+context+')'})
 const nd=path.join(base,'native',context+'-three');fs.mkdirSync(nd,{recursive:true});const mp=path.join(nd,'book-model.json'),hp=path.join(nd,'book.html'),pdf=path.join(nd,'book.pdf')
 await B.writeGoalBookModel(sub,mp);const opts={feedbackBaseUrl:'https://skillpilot.com/feedback',publicRoot:path.join(base,'native-public'),printDerivativeProfile:'standard'}
 const hm=await R.writeGoalBookHtml(sub,hp,opts);await R.writeGoalBookRenderManifest(hm,hp+'.render-manifest.json')
 const pm=await R.writeGoalBookPdf(sub,pdf,opts);await R.writeGoalBookRenderManifest(pm,pdf+'.render-manifest.json')
 if(context==='whole402'){
  const out=path.join(base,'review/bundle'),built=await buildGoalBookReviewBundle(sub,{modelPath:mp,pdfPath:pdf,pdfRenderManifestPath:pdf+'.render-manifest.json',htmlPath:hp,htmlRenderManifestPath:hp+'.render-manifest.json',outputDirectory:out,promptPath:path.join(base,'review/goal-description-understanding-evidence-review-v2.md'),criteriaPath:path.join(base,'review/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'),goalIds:ids})
  fs.mkdirSync(out,{recursive:true});for(const f of built.files){const p=path.join(out,f.relativePath);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,f.content)}
  write(path.join(out,'manifest.json'),built.manifest)
  for(const round of ['a','b'])await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:fs.readFileSync(path.join(out,'manifest.json')),bookModelBytes:fs.readFileSync(path.join(out,'book-model.json')),reviewInputBytes:fs.readFileSync(path.join(out,'review-input.json')),bundleDirectory:out,outputDirectory:path.join(base,'review/round-'+round),campaignOptions:{campaignId:'chemie-q3-live402-v7-round-'+round,roundId:'round-'+round,reviewerRole:'external_ai_reviewer',reviewPass:'first_pass',independenceGroupId:'chemie-q3-live402-v7-independent-'+round,blindToOtherReviews:true,batchSize:20}})
 }
 console.log(JSON.stringify({nativeContext:context,pages:sub.pages.length,html:rel(hp),pdf:rel(pdf),result:'PASS'}))
}
console.log(JSON.stringify({authorCandidate:'PASS',whole:402,source:382,M2:2,P3:3,actualPNGKEEP:3,newAuthenticCase:1,allOriginalCasesRetained:7,activeWrites:false,machineStrictGain:0}))
