"""Finish portable neutral author handoff; freeze once, no approvals."""
import hashlib
import json
import math
import subprocess
from datetime import datetime,timezone
from pathlib import Path
R=Path.cwd();O=Path(__file__).resolve().parent;REL=str(O.relative_to(R));STAMP=datetime.now(timezone.utc).isoformat()
def b(p):
 p=Path(p);v=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(v).hexdigest(),'bytes':len(v)}
def w(n,d):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return p
assert not (O/'eighteen-whole-science-material-author.first.freeze.json').exists()
intake=json.loads((O/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json').read_text())
body=json.loads((O/'eighteen-whole36-bilingual-cases-and-P.author-candidate.json').read_text());ids=intake['selectedGoalIds']
canon=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';current=json.loads(canon.read_text());by={g['id']:g for g in current['goals']}
snapshot=json.loads((O/'input/current-canonical479-root23-successor.snapshot.json').read_text())
assert current==snapshot
assert all(by[e['goalId']]==e['wholeCurrentGoal'] for e in body['entries'])
assert len(body['entries'])==18 and sum(len(e['newAuthoredWholeCases']) for e in body['entries'])==36
required=['materialDe','materialEn','taskDe','taskEn','workedResponseDe','workedResponseEn','freshTransferTaskDe','freshTransferTaskEn','workedFreshTransferDe','workedFreshTransferEn']
caseids=[]
for e in body['entries']:
 assert e['status']=='needs_human_review' and e['reviewAuthority']=='ai_candidate'
 assert e['evidenceLevel']=='E1' and e['maximumClaimScope']=='G1'
 assert not e['actualExperimentPerformed'] and not e['actualLearnerPerformance'] and not e['humanApproval']
 for c in e['newAuthoredWholeCases']:
  assert all(isinstance(c[k],str) and len(c[k])>=55 for k in required)
  assert not c['actualExperimentPerformed'] and not c['actualLearnerPerformance']
  assert c['materialStatus']=='constructed_synthetic_didactic_material';caseids.append(c['caseId'])
  assert all(z['rubricScope']=='pair_reference_not_single_case_quota' for z in c['rubric'])
assert len(caseids)==len(set(caseids))==36
# Actual recomputation of the finite authored numerical inputs; independent scientific QA remains pending.
tests=[]
def check(case,claim,actual,expected):
 ok=math.isclose(actual,expected,rel_tol=1e-9,abs_tol=1e-9)
 tests.append({'caseId':case,'claim':claim,'recomputedFromSuppliedModelInputs':actual,'expectedAuthorWorkedValue':expected,'matches':ok})
 assert ok,(case,claim,actual,expected)
check('synthetic-ga-island-interplay','founder allele frequency',14/(14+6),0.7)
check('synthetic-ea-primate-gene-flow','weighted frequency',0.8*0.2+0.2*0.8,0.32)
check('fitness-related-helping','sibling rB-C',0.5*3-1,0.5)
check('fitness-related-helping','changed benefit',0.5*1-1,-0.5)
check('fitness-parental-effort-tradeoff','intensive lifetime',4+1,5)
check('fitness-parental-effort-tradeoff','low lifetime',2+4,6)
check('fitness-parental-effort-tradeoff','weather intensive',6+1,7)
for label,t in [('A',{'F':4,'K':2,'D':1,'P':2,'R':1}),('B',{'F':2,'K':3,'D':1,'P':3,'R':1})]:
 check('behavior-ga-ethogram-cost-benefit',label+' sum minutes',sum(t.values()),10)
 gain=t['F']*3+t['K']*4;cost=t['F']+t['K']*1.5+t['D']*2+t['P']*2+t['R']*0.5
 check('behavior-ga-ethogram-cost-benefit',label+' net energy',gain-cost,6.5 if label=='A' else 3)
check('behavior-ga-parental-choice-and-aggression','X net model',12-4-2*3,2)
check('behavior-ga-parental-choice-and-aggression','Y net model',9-2-2*1,5)
check('behavior-ga-parental-choice-and-aggression','changed X',12-4-2*0.5,7)
for label,t in [('A',{'K':2,'D':1,'F':4,'P':3}),('B',{'K':3,'D':2,'F':2,'P':3})]:
 check('behavior-ea-signal-response-and-budget',label+' sum minutes',sum(t.values()),10)
 gain=t['F']*3+t['K']*4;cost=t['F']+t['K']*1.5+t['D']*2+t['P']*2
 check('behavior-ea-signal-response-and-budget',label+' net energy',gain-cost,5 if label=='A' else 1.5)
check('behavior-ea-signal-response-and-budget','S response',16/20,0.8)
check('behavior-ea-signal-response-and-budget','no-S response',4/20,0.2)
events=[(1,1),(1,0),(0,0),(1,1),(0,1),(1,0),(0,0),(1,1)]
check('behavior-ea-signal-deception-and-reproduction','true warnings',sum(a==1 and g==1 for a,g in events),3)
check('behavior-ea-signal-deception-and-reproduction','false warnings',sum(a==1 and g==0 for a,g in events),2)
check('behavior-ea-signal-deception-and-reproduction','unannounced danger',sum(a==0 and g==1 for a,g in events),1)
check('history-life-scaled-timeline','human mm at100cm/4600Ma',0.3/4600*100*10,0.06521739130434782)
check('history-life-scaled-timeline','human fraction percent',0.3/4600*100,0.006521739130434782)
check('history-life-scaled-timeline','human mm at100cm/600Ma',0.3/600*100*10,0.5)
check('history-earth-day-representation','human seconds',0.3/4600*86400,5.634782608695652)
check('history-earth-day-representation','23h lookback Ma',4600/24,191.66666666666666)
check('fossil-ash-bracketing','conservative younger bound',1.8-0.1,1.7)
check('fossil-ash-bracketing','conservative older bound',2.4+0.1,2.5)
check('fossil-half-life-and-tree-limits','half lives',-math.log2(1/(1+3)),2)
check('gene-flow-weighted-migrants','equal contributions',0.8*0.25+0.2*0.75,0.35)
check('gene-flow-weighted-migrants','half immigrant contribution',(80*0.25+10*0.75)/90,0.3055555555555556)
check('gene-flow-corridor-no-reproduction','successful source gametes',0.9*0.1+0.1*0.9,0.18)
w('checks/whole18-cases36-author-numeric-and-contract-consistency.actual.json',{'schemaVersion':1,'role':'author finite-material consistency, not an independent review','tests':tests,
 'whole18ExactCurrent':True,'whole36BilingualFieldPresence':True,'profile18SchemaErrors':0,
 'whole479InactiveSnapshotExactCurrent':True,'rubricPairTruth':True,'source35WholeOriginalBodiesRetained':True,
 'partner30WholeOriginalAndCurrentBodiesRetained':True,'humanApproval':False,'strictGain':0})
orig=json.loads((O/'primary/ten-original-primary-topic-contexts.actual-bindings.json').read_text())
for r in orig['rows']:r['textRead']=True
w('primary/ten-original-primary-topic-contexts.author-reading.receipt.json',{**orig,'role':'actual whole affected original topic texts read by author, no whole-course/source QA','author':'bio_science14_independent_a','createdAt':STAMP})
sources=[
 {'goalIds':[ids[15]],'holdId':'EVO18-SOURCE-001','originalDuty':'source-duty-0182','originalSpan':'Q1.1.9',
  'actualPrimary':'primary/HE-current2025.actual-official.pdf','actualPhysicalPages':[33,38,42],
  'findingDe':'Der Legacy-Extrakt formuliert Migration/Genfluss als Q1.1.9. Die ganze aktuelle amtliche Q1.1-Spalte S.38 nennt DNA/Proteinbiosynthese/Genmutation sowie Rekombination/Mutation;keine neunte Genflussklausel und im LK keine dort ausgewiesenen Zusatzinhalte. Q2.1 S.42 trägt den übergeordneten synthetischen Evolutionsmechanismus,aber keinen ausdrücklichen Genflussoperator. Material ist ein didaktischer eigener Transfer zur aktuellen kanonischen Kompetenz;keine exakte amtliche Q1.1.9-Deckung behaupten. Originalmapping bleibt unangetastet.',
  'status':'HOLD_exact_source_span_and_course_binding','materialAuthoringBlocked':False},
 {'goalIds':[ids[16]],'holdId':'EVO18-SOURCE-002','originalDuty':'source-duty-0213','originalSpan':'Q2.2.7',
  'actualPrimary':'primary/HE-current2025.actual-official.pdf','actualPhysicalPages':[33,40,42],
  'findingDe':'Der Legacy-Extrakt verortet Hox-/Entwicklungsgenetik in Q2.2.7. Amtlich S.40 stehen Homöobox-Gene und Entwicklungsphasen-Regulation ausdrücklich im erhöhten Niveau von Q1.5. Q1.5 gehört nicht zu den verbindlichen Q1-Themenfeldern1–3;Q2.2 S.42 enthält Ethik/Wissenschaft-Religion/Missbrauch. Teilrolle für eigenes Evo-Devo-Transfermaterial ist begrenzbar,aber nicht automatisch verpflichtende Q2.2.7- oder GK-Deckung. Originaledges erhalten.',
  'status':'HOLD_original_span_and_optional_LK_route','materialAuthoringBlocked':False},
 {'goalIds':[ids[14]],'holdId':'EVO18-SOURCE-003','originalDuty':'source-duty-0210','originalSpan':'Q2.1.6',
  'actualPrimary':'primary/HE-current2025.actual-official.pdf','actualPhysicalPages':[41,42],
  'findingDe':'Amtlich Q2.1-LK S.42 verlangt Ursprung/Fossilgeschichte/hypothetische Stammbäume/Verbreitung des Menschen;eine nummerierte Q2.1.6-Klausel für Datierungsmethoden ist dort nicht wörtlich ausgewiesen. Die Fallmethoden sind eigenes verständnisorientiertes Fossilevidenzmaterial;keine allgemeine amtliche Methodenpflicht oder alle Länder-/Sek-I-Kurse behaupten. Die ganzen BB/BE/BW/NW/RP/SH/SN/ST/TH-Partnerpflichten bleiben erhalten.',
  'status':'HOLD_exact_literal_scope','materialAuthoringBlocked':False},
 {'goalIds':[ids[17]],'holdId':'EVO18-SOURCE-004','originalDuty':'source-duty-0211','originalSpan':'Q2.2.1',
  'actualPrimary':'primary/HE-current2025.actual-official.pdf','actualPhysicalPages':[33,42],
  'findingDe':'Darwin/Neodarwinismus-Kontrast ist eine kanonische Kompetenz und BY-B12 nennt Darwin/Lamarck explizit. Die aktuelle HE-Q2.2-Grundniveau-Spalte S.42 nennt ethische Herausforderungen und Wissenschaft/Religion;synthetische Theorie und Abgrenzung sind unter Q2.1. Keine Legacy-Spannummer als wortgetreue HE-Klausel verwenden,keine neue Mappingsouveränität aus AuthorP ableiten.',
  'status':'HOLD_exact_original_HE_span','materialAuthoringBlocked':False},
 {'goalIds':[ids[j] for j in [0,1,2,3,4,5,11,12,13,14,17]],'holdId':'EVO18-SOURCE-005','originalDuty':'source-duty-0321',
  'actualPrimary':'curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf','actualPhysicalPages':[44,45],
  'findingDe':'Die ganze ST-Sek-I-Evolutionspflicht enthält Beobachtung an Naturobjekten,Dokumentation,Modell-Nachbildung von Fossilien,Schüler-Modellexperiment zur Selektion (S.45 ausdrücklich verbindlich) und Anwendung von Simulationssoftware. Die36 konstruierte Materialfälle sind keine behauptete reale Durchführung oder tatsächliche Softwareausführung. Alle18historischen Partner dieser Sourceentscheidung bleiben exakt;deren praktische/mediale Ausführung darf durch dieses Teilpaket nicht als erfüllt gelten.',
  'status':'HOLD_whole_practical_digital_and_partner_operators','materialAuthoringBlocked':False},
 {'goalIds':[ids[11],ids[12],ids[13],ids[14]],'holdId':'EVO18-SOURCE-006','originalDuty':['source-duty-0259','source-duty-0260','source-duty-0275','source-duty-0276','source-duty-0277'],
  'actualPrimary':'curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_I_Biologie_Physik_Chemie_2014.pdf','actualPhysicalPages':[28,48],
  'findingDe':'Ganze Original-TF2/TF12 gelesen: aktuelle Originalseiten drucken26 und46 bei physischen28/48;Legacy-sourceRefs nennen25/45. Operative Chronologie/Verwandtschaft/kulturelle Einflüsse sind im Material thematisiert. WholeTF2/TF12,alle übrigen Partner,Experimente und Medienpflichten bleiben getrennt;keine vollständige Source-/Coursefreigabe oder Seitenkorrektur am aktiven Mapping.',
  'status':'HOLD_original_page_metadata_and_whole_topic_scope','materialAuthoringBlocked':False}
]
w('whole-source-course-operator-boundaries.author-candidate.json',{'schemaVersion':1,'role':'author exact-source support/limits for independent review, not source decisions',
 'primaryIntake':b(O/'primary/actual-four-primary-routing.receipt.json'),'otherWholeOriginalPrimaries':b(O/'primary/ten-original-primary-topic-contexts.author-reading.receipt.json'),
 'wholeOriginalFrame':b(O/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json'),
 'boundedBYSupport':{'actualURLs':['https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/biologie'],
  'wholeContextsActuallyRead':['B12 GA3.1+3.2+4 and wholeGA/EA LB1 process conditions','B12 EA3.1+3.2+4','B10 LB4 and LB1 conditions'],
  'durationContexts':['GA LB3 ca18h,LB4 ca15h','EA LB3 ca30h,LB4 ca24h','B10 LB4 ca7h'],
  'courseLimits':'GA and EA whole source occurrences retained separately;canonical GK/LK labels do not replace actual GA/EA/stage conditions. EA primate/culture/environment/communication/critical-social extensions are not universal GA extras.',
  'originalFlattenedSpansRetained':'Original B12-EA/GA.3 bullet spans unchanged;actual official page now shows3.1/3.2 subdivisions. No invented literal numbering or active mapping edit.'},
 'concreteHolds':sources,
 'generalLimits':['All35original decisions/edges and30whole partner goals are retained exactly,including out-of-package partners.','Cross-jurisdiction broad source goals and current applicability are inputs,not approved by lexical overlap or canonical tags.','BY/HE/process research,actual digital recording/analysis,lab/field tools and independent inquiry obligations remain on their original goals;constructed analysis does not assert their real execution.','Other original primary excerpts are actual whole affected topic pages;whole courses/current-year validity and whole country source atlas are not reviewed/approved.','No physical model experiment,animal intervention,learner work or clinical/medical efficacy is reported.'],
 'newMappings':[],'activeWrites':[],'wholeSourceApproval':False,'wholeCourseApproval':False,'strictGain':0})
w('scientific-reference-and-synthetic-material-limits.author.json',{'schemaVersion':1,'role':'supplementary actual primary scientific reference reading, not added curricular duty',
 'references':[{'url':'https://humanorigins.si.edu/evidence/human-fossils/species/homo-sapiens','scope':'Rounded about300000-year Homo-sapiens reference;not exact origin moment or clinical datum.'},
 {'url':'https://humanorigins.si.edu/education/introduction-human-evolution','scope':'Branching descent and multiple anatomical/genetic evidence;not direct ancestry of living apes.'},
 {'url':'https://pubs.usgs.gov/gip/fossils/numeric.html','scope':'Rounded Earth/early-fossil time scale and numeric age uncertainty.'},
 {'url':'https://pubs.usgs.gov/gip/geotime/radiometric.html','scope':'Radioisotope half-life/radiometric-rock limitations and short-lived14C distinction.'},
 {'url':'https://stratigraphy.org/chart/','scope':'Rounded Cambrian-scale reference;case540Ma is a deliberately rounded reference,not exact ICSboundary.'}],
 'syntheticMechanismMaterials':'All allele counts,Hox perturbations,molecular comparisons,behavioural logs,fossil-type labels and radiometric exercise values are explicitly constructed model inputs,not published observations.',
 'ownedContentLicense':'CC-BY-4.0','primarySourceRights':'Third-party original sources retain their own rights/licenses;the own-content label does not relicense them.',
 'actualExperimentPerformed':False,'actualLearnerPerformance':False,'humanApproval':False,'clinicalProof':False})
imageRows=[{'goalId':e['goalId'],'wholeCurrentGoal':e['wholeCurrentGoal'],'currentPrimaryResourceLinks':e['wholeCurrentGoal'].get('resourceLinks',[]),
 'documentedDefect':'missing primary image link and no named goal raster found in canonical/public input inventory',
 'existingGoodImagesPolicy':'KEEP if a valid existing image is subsequently located;no replacement based on provider or format alone',
 'nextAuthorizedImageWork':'Separate actual PNG candidate for this exact goal,16:9 approachable comic style,actual original/360/680 review by two independent reviewers;generation never approval',
 'generationPerformed':False,'imageCandidateCreated':False,'nativeVClaim':False} for e in body['entries']]
w('eighteen-images-documented-missing-primary-links.separate-open-list.json',{'schemaVersion':1,'role':'separate image production/QA work,not a stop requiring new user authorization','rows':imageRows,
 'inventoryRoots':['curricula/DE/Gymnasium','app/public'],'inventoryMethod':'rg --files filtered for18 exact UUID prefixes and raster extensions;0matches',
 'priorUserAuthorizationRetained':True,'newImagesGenerated':0,'existingGoodImagesReplaced':0,'imageApproval':False,'strictGain':0})
# Portable bundle: ordinary repo scripts,regular source files,relative repository paths,no capsule/no symlink.
bad=[]
for p in O.rglob('*'):
 if p.is_symlink():bad.append(str(p.relative_to(R)))
assert not bad
technical={'schemaVersion':1,'createdAt':STAMP,'role':'scoped author technical checks; not scientific/native acceptance',
 'actualResults':{'profiles18':18,'wholeBilingualCases36':36,'ordinaryP18Exit':0,'ordinaryP18Approved':0,'ordinaryP18NeedsHuman':18,
 'ordinaryP18BlockingIssues':0,'existingA18ReuseExit':0,'existingM18ReuseExit':0,'existingAMissingStaleObsolete':0,
 'authorNumericComparisons':len(tests),'numericMismatches':0,'wholeCurrent479SnapshotExact':True,'whole18Exact':True,
 'source35Partner30OriginalsRetained':True,'portableSymlinkDefects':0},
 'noWholeQAOrBuildExecuted':True,'runtimeWrites':[],'activeWrites':[],'independentApprovals':0,'humanApproval':False,'humanTrial':False,'strictGain':0}
w('checks/eighteen-author-scoped-technical-summary.actual.json',technical)
outputs=[b(p) for p in sorted(O.rglob('*')) if p.is_file() and '__pycache__' not in p.parts]
seal=w('eighteen-whole-science-material-author.first.freeze.json',{'schemaVersion':1,'role':'immutable author FIRST18/36 on actual Root23-successor base;independent QA pending','createdAt':STAMP,
 'selectedGoalIds':ids,'files':outputs,'wholeGoals':18,'wholeProfiles':18,'wholeBilingualCases':36,'sourceDuties':35,'wholePartners':30,
 'status':'ai_candidate_needs_human_review','humanApproval':False,'humanTrial':False,'activeWrites':[],'strictGain':0})
entry=w('neutral-whole18-source35-partners30-P18-cases36.author-independent-review.entry.json',{
 'schemaVersion':1,'role':'neutral complete author handoff for genuine independent whole science/source/scope/P/A/M review',
 'createdAt':STAMP,'selectedGoalIds':ids,'selection':'18 current open coherent Evolution/Systematics/Behavior goals,disjoint protected299 and molecular23',
 'authorInputFirst':b(O/'eighteen-whole-author.input.first.freeze.json'),'authorFirstSeal':b(seal),
 'inputWholeGoalsSourcePartners':b(O/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json'),
 'actualRoot23SuccessorRebase':b(O/'root23-active-baseline-successor.exact-additive-rebase.receipt.json'),
 'currentWhole479InactiveCanonical':b(O/'input/current-canonical479-root23-successor.snapshot.json'),
 'wholeCurrentKinds394':b(O/'input/current-kinds394-root23-successor.snapshot.json'),
 'wholeMaterialsP18Cases36':b(O/'eighteen-whole36-bilingual-cases-and-P.author-candidate.json'),
 'normalCandidateSet':b(O/'eighteen-whole-positive-profile-candidate-set.author.json'),
 'normalP18Config':b(O/'eighteen-whole-positive.author-candidate.config.json'),'normalP18Records':b(O/'eighteen-whole-positive.author-candidate.review.jsonl'),
 'sourceCourseOperatorBoundaries':b(O/'whole-source-course-operator-boundaries.author-candidate.json'),
 'actualPrimaryFour':b(O/'primary/actual-four-primary-routing.receipt.json'),
 'actualOtherPrimaryWholeTopics':b(O/'primary/ten-original-primary-topic-contexts.author-reading.receipt.json'),
 'supplementaryMechanismReferences':b(O/'scientific-reference-and-synthetic-material-limits.author.json'),
 'authorSemanticAMCandidates':b(O/'eighteen-semantic-kind-atomicity-memory.author-candidates.json'),
 'unchangedValidAMReuse':{'Aconfig':b(O/'A18-existing-records.exact-reuse.config.json'),'Mconfig':b(O/'M18-existing-records.exact-reuse.config.json'),
 'newIndependentAMReview':False},
 'imageWorkSeparateOpenList':b(O/'eighteen-images-documented-missing-primary-links.separate-open-list.json'),
 'technicalSummary':b(O/'checks/eighteen-author-scoped-technical-summary.actual.json'),
 'requiredNextQA':['Two genuine independent whole scientific/source/operator/P reviews; author cannot self-approve own materials.','Existing A/M394 retained; review own proposed A/M reasoning only if a concrete semantic issue warrants it.','18 actual missing-image candidates and two independent original/360/680 V reviews per goal;good existing assets KEEP if found.','Normal current resource/native DE/EN/page/context D/P/V reviews after actual candidates;source/course boundaries remain explicit.','Root integration with protected299/current394 checks only after genuine current proofs;net0until integration.'],
 'pending':['independentScience','sourceScopeReview','wholeCourseReview','imageCandidatesAndV','currentNativeD/P/V','rootIntegration'],
 'authorOpinionIsNotIndependentInputVerdict':True,'evidenceLevel':'E1','maximumClaimScope':'G1',
 'actualExperimentPerformed':False,'actualLearnerPerformance':False,'humanApproval':False,'humanTrial':False,'strictGain':0,'activeWrites':[]})
w('eighteen-author-completed-handoff.final.freeze.json',{'schemaVersion':1,'role':'additive final handoff seal,author FIRST unchanged','files':[b(seal),b(entry)],
 'humanApproval':False,'strictGain':0,'activeWrites':[]})
print(json.dumps({'entry':b(entry),'authorFIRST':b(seal),'finalSeal':b(O/'eighteen-author-completed-handoff.final.freeze.json'),'technical':technical['actualResults']},ensure_ascii=False))
