import json,pathlib,hashlib,datetime
R=pathlib.Path('.');P=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-atomic-description-positive-gap-author-v1'
def read(p):return json.loads((R/p).read_text())
def bind(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,d):(P/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';s=next(x for x in read(registry)['subjects'] if x['subject']=='chemie')
reportPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-central.stage-1.actual.stdout.json';rep=next(x for x in read(reportPath)['subjects'] if x['subject']=='chemie')
can=read(s['landscapePath']);gs={x['id']:x for x in can['goals']};k=read(s['semanticKindLedgerPath']);atomic={x['goalId'] for x in k['decisions'] if x['semanticKind']=='curricularAtomic' and x['decisionStatus']=='authoritative'}
a={};paths=[registry,s['landscapePath'],s['semanticKindLedgerPath'],s['visualizationQaPath'],s['memoryReviewConfigPath'],reportPath,'AGENTS.md','docs/concept/skill-graph/atomic-goal-visualizations.md','curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json']
for q in s['semanticAtomicityConfigPaths']:
 c=read(q);paths += [q,c['reviewPath']]
 for l in (R/c['reviewPath']).read_text().splitlines():
  if l.strip():
   x=json.loads(l)
   if x.get('status')=='atomic' and x.get('semanticAtomic') is True:a[x['goalId']]={'config':q,'reviewPath':c['reviewPath'],'record':x}
mc=read(s['memoryReviewConfigPath']);paths.append(mc['reviewPath']);m={x['goalId']:x for l in (R/mc['reviewPath']).read_text().splitlines() if l.strip() for x in [json.loads(l)]}
v={x['goalId']:x for x in read(s['visualizationQaPath'])['records'] if x['visualizationState']=='available' and x.get('aiApproved')=='yes' and x.get('aiApprovedAssetSha256')==x.get('assetSha256')}
assert len(atomic)==378 and rep['strictComplete']==112 and len(a)==201
assert rep['gates']=={'currentDescriptionResolutions':112,'currentPositiveEvidenceProfiles':112,'currentSemanticAtomicityDecisions':201,'currentMemoryReviewDecisions':378,'currentVisualizationQaRecords':359}
assert len(atomic&v.keys())==359
allGap=sorted(atomic&a.keys()&m.keys()&v.keys()-set(rep['strictCompleteGoalIds']))
# Current primary HE content, not a blanket national or compulsory-course claim.
selection=[
('dd58c029-176f-5d99-923e-1c1fda6cf58e',[36,38],'E.3; Q1.1','GK_LK','Homologous hydrocarbons, representations and constitutional isomerism; alkynes explicitly Q1.1.'),
('3d3231f9-039d-5ce5-9e8e-af219c7fee08',[36,38,39],'E.3; Q1.1; Q1.2','GK_LK','London interactions in hydrocarbons and hydrogen bonding in alkanols; no universal boiling/melting ranking.'),
('3be2d0b7-c22f-57d4-886a-10fc04a629f5',[36,38],'E.3; Q1.1','GK_LK','Radical alkane bromination, initiation/propagation/termination; no exact product yield prediction.'),
('e1214210-406e-5075-b83c-086b3972ed66',[36],'E.3','GK_LK','Hydroxyl group and resulting ethanol properties; no alcohol-health certification.'),
('448815cc-4127-54b7-96bf-e54b3d2a38c5',[38],'Q1.1','GK_LK','Metallic, ionic and covalent bonding; model limitations distinguish interactions from particle bonds.'),
('5a30273a-98d5-5163-bb16-c250b7ed4e7f',[38,39],'Q1.1; Q1.2; Q1.3','GK_LK','Structure-dependent boiling, solubility and solvent choice; melting predictions need packing evidence.'),
('622f09e5-a5bb-5ccf-919f-bae990c7c116',[38],'Q1.1','GK_LK','Bromination mechanism/bond changes and appropriate evidence. Halide detection after substitution is a separate Q1.2 context.'),
('b8d3b453-d638-5518-aab0-d84ec2e8567c',[38],'Q1.1','LK','Aromatic structure/reactivity and electrophilic substitution; no broad GK obligation.'),
('b92bfa45-b500-5647-8fd2-a14b708aaf59',[42],'Q2.1','GK_LK','Asymmetric carbon/chirality in amino-acid context. Actual current primary location is Q2.1, not Q1.'),
('9decc36b-a69a-5599-a9f0-fcebdf0203d8',[38,42],'Q1.1; Q2.1','E_Z_Q1_LK_enantiomer_Q2_GK_LK','E/Z geometry and enantiomerism in bounded contexts. These locations do not certify all stereochemical subtypes or national grade coverage.'),
('345fdca9-038f-51e2-9bea-b6ac416a734a',[39],'Q1.2','GK_LK','Alkanol structural and skeletal representations; hydroxyl hydrogens and oxygen remain explicit.'),
('973c12d9-d863-5292-8c68-9c80cdacf9e2',[39],'Q1.2','GK_LK','Fehling aldehyde detection versus ordinary simple ketones; reducing sugars/interferences prohibit an unrestricted converse.'),
('3899edf4-a809-54b1-8ee7-4e67aa82dc7c',[39],'Q1.2','LK_mechanism_GK_reaction_type','Electron-pair donor/acceptor description of nucleophilic substitution; SN1/SN2 detail is not mandatory beyond this unchanged goal.'),
('d4928773-3be8-5cf1-907c-ef07c96751e8',[39],'Q1.2','GK_LK','Halogenoalkane/hydroxide reaction equations with specified substitution-favouring conditions, no universal product claim.'),
('363c5740-8a3c-50b8-8c3a-5548c80c36ea',[39],'Q1.2','LK','Copper(II)-tartrate ligand electron-pair donation; no invented unique complex stoichiometry.')]
ids=[x[0] for x in selection];assert len(ids)==15 and set(ids)<=set(allGap)
ledger=read('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json');inflight=[]
for q in ledger['activeBatchConfigPaths']:
 if 'chemie' in q:
  c=read(q);inflight.append({'path':q,'goalIds':c['goalIds'],'currentAMVGapGoalIds':sorted(set(c['goalIds'])&set(allGap)),'selectedGoalIds':sorted(set(c['goalIds'])&set(ids))})
# Bind historical still-open wording proposals, without replaying valid prior science reviews.
hist=[]
for q in s['resolutionIndexPaths']:
 d=read(q);over=set(d.get('batchGoalIds',[]))&set(ids)
 if over:
  hist.append({'index':bind(q),'selectedHistoricalBatchGoalIds':sorted(over),'validCurrentResolutionsForSelectedGoals':[],'note':'No current valid strict resolution for selected IDs; only existing open findings may be consulted.'});paths.append(q)
rows=[]
for id,pages,code,course,limit in selection:
 g=gs[id];vr=v[id];assert vr['title']==g['title'] and vr['description']==g['description']
 for key in ['publicAssetPath','canonicalAssetPath']:
  assert bind(vr[key])['sha256']==vr['assetSha256'];paths.append(vr[key])
 rows.append({'goalId':id,'wholeCurrentGoal':g,'currentAtomicityBinding':a[id],'currentMemoryBinding':m[id],'currentVisualizationBinding':vr,'authorPrimaryScope':{'jurisdiction':'DE-HE','stage':'SekII','physicalPages':pages,'printedPages':pages,'topicCode':code,'courseScope':course,'limit':limit,'sourceDecision':'AUTHOR_SCOPE_INPUT_NOT_INDEPENDENT_SOURCE_APPROVAL','activeSourceMappingsUnchanged':True},'D':'OPEN','P':'OPEN','operativeDescriptionCandidateDecision':'KEEP_UNCHANGED_PENDING_TWO_INDEPENDENT_D_REVIEWS'})
primary='curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf';paths += [primary,'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json','curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json']
write('current-amv-gap-and-selected-fifteen.author-readiness.json',{'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'AUTHOR readiness and exact current input binding; no independent approval','authoritativeReport':bind(reportPath),'subjectGateCounts':rep['gates'],'currentDenominator':378,'strictBaseline':112,'currentAMVWithoutDPGoalIds':allGap,'currentAMVWithoutDPCount':len(allGap),'scopeGoalIds':ids,'rows':rows,'inFlightPriorityInspection':inflight,'existingHistoricalOpenBatches':hist,'excludedKnownSourceHolds':['Grignard synthesis not fully supported by current HE2026 Q1','IR/1H-NMR not fully supported by current HE2026 Q1','generic carbonyl reactivity not fully supported by current HE2026 Q1'],'fullCanonicalReviewPages':378,'nationalSourceAtlasPages':359,'existingScientificReviewsRepeated':0,'newScientificClosures':0,'restoredActiveBindings':0,'strictNetGain':0,'humanApproval':False,'humanTrial':False,'activeWrites':False})
write('actual-inputs.before-native-preparation.json',{'schemaVersion':1,'files':[bind(q) for q in dict.fromkeys(paths)],'protectedStrictGoalIds':rep['strictCompleteGoalIds'],'protected112WholeGoalDigests':{id:'sha256:'+hashlib.sha256(json.dumps(gs[id],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest() for id in rep['strictCompleteGoalIds']}})
base=read('curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json');base['outputPath']=str(P/'qa-artifacts/full-current378.book-model.json');write('full-current378.book.config.json',base)
template=read('curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-09-30/batch-003-q1-bonding-models-current-20-v1.config.json');template.update(batchId='chemie-current-amv-dp-gap-fifteen-20261006-author-v1',bookId='chemie-current-amv-dp-gap-fifteen-20261006-author-v1',title='Chemie – aktuelle organische Struktur- und Reaktionsziele (15 offene D/P-Ziele)',baseGoalBookConfigPath=str(P/'full-current378.book.config.json'),goalIds=ids,outputDirectory=str(P/'native-d-fifteen'));write('native-d-fifteen.batch.config.json',template)
print(json.dumps({'strict':112,'denominator':378,'currentAMVGap':len(allGap),'selected':len(rows),'activeWrites':False}))
