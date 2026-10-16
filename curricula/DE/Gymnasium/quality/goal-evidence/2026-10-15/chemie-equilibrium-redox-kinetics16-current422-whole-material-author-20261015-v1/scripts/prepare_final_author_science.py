# SPDX-License-Identifier: Apache-2.0
import copy,json,hashlib,datetime,math
from pathlib import Path
R=Path(__file__).resolve().parents[1];REPO=Path.cwd();E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15');A=E/'chemie-kinetic-mechanism-one-actual-GBS-image-correction-author-root-20261015-v1';V=E/'chemie-kinetic-mechanism-one-mobile-v2-current-context-independent-V-20261015-v1'
def j(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(REPO) if p.is_absolute() else p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):
 (R/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
# Source draft and failed automatic output remain history; only manual text is eligible.
for old in [R/'materials/thirty-two-whole-DE-EN-cases.readable.author.json',R/'science/sixteen-profile-understanding-specifications.readable.author.json']:
 if old.exists():old.rename(R/'history'/('unselected-failed-spacing-v2.'+old.name))
manual=j(R/'materials/thirty-two-whole-DE-EN-cases.manual-whole-prose.author.json');final=copy.deepcopy(manual);corrections=[]
for c in final['cases']:
 before=copy.deepcopy(c);why=None
 if c['id']=='eqrk16-10-b':
  for k in ['workedReasoningDe','workedReasoningEn']:
   c[k]=c[k].replace('−0,05584','−0,05546').replace('−0.05584','−0.05546').replace('−0,70660','−0,70622').replace('−0.70660','−0.70622')
  why='Correct arithmetic: −0.440 + 0.02958(−15+28) = −0.05546 V; at pH11 the boundary is −0.70622 V. At pH9.5 both boundaries equal −0.61748 V exactly for the supplied rounded constants.'
 if c['id']=='eqrk16-11-a':
  for k in ['workedReasoningDe','workedReasoningEn']:c[k]=c[k].replace('1,55','1,54').replace('1.55','1.54')
  for r in c['criterionToObservableRubric']:
   for k in ['observableDe','observableEn']:r[k]=r[k].replace('1,55','1,54').replace('1.55','1.54')
  why='Use unrounded logK=2.200/0.05916=37.1872887086 before exponentiation: K=1.5391775e37, rounded1.54e37, not exponentiating rounded37.19.'
 if c['id']=='eqrk16-11-b':
  for k in ['workedReasoningDe','workedReasoningEn']:
   for a,b in [('1,22885','1,22884'),('1.22885','1.22884'),('1,62885','1,62884'),('1.62885','1.62884'),('1,50385','1,50384'),('1.50385','1.50384')]:c[k]=c[k].replace(a,b)
  for r in c['criterionToObservableRubric']:
   for k in ['observableDe','observableEn']:r[k]=r[k].replace('1,22885','1,22884').replace('1.22885','1.22884')
  why='Correct last-place rounding:237130/(2*96485)=1.22884386174V, rounding1.22884V; add0.400/0.275V consistently.'
 if why:corrections.append({'id':c['id'],'scientificReason':why,'wholeBeforeCase':before,'wholeCorrectedCase':c})
write('materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json',final)
write('checks/CAS.three-numerical-author-corrections.whole-cases.json',{'role':'Real whole-case scientific corrections separate from manual prose revision','casesCorrected':3,'other29WholeManualCasesExact':True,'rows':corrections})
spec=j(R/'science/sixteen-profile-understanding-specifications.author.json')
en={
10:['pE and Eh describe redox conditions; stability boundaries follow defined activities and equilibria.','Horizontal, vertical and sloping boundaries express different electron and proton balances.','Pourbaix regions are thermodynamic model domains, not direct predictions of rates or complete corrosion protection.'],
11:['Electrolysis drives redox conversion against its thermodynamically preferred direction using electrical work.','E, ΔrG and Q/K must refer to the same written reaction direction.','Local electrode equilibrium, open circuit and global chemical equilibrium are different.'],
12:['A rate law constrains compatible mechanisms but generally does not identify a unique one.','Elementary steps, intermediates and pre-equilibria must reproduce stoichiometry and the observed law.','Mechanistic hypotheses need changed conditions or additional observations to distinguish them.'],
13:['Homogeneous and heterogeneous catalysis differ in phase relationships, not by a fixed barrier reduction.','Enzymes use binding and transition-state stabilisation and can work in solution or immobilised.','Activation, transport, deactivation and equilibrium require distinct judgments in a comparison.'],
14:['A catalyst opens a faster path and is regenerated in the cycle; stoichiometry and equilibrium remain unchanged.','Technical environmental evaluation needs equal service, conversion, energy and lifetime.','Selectivity, toxicity, resources and source quality can change an energy-only judgment.'],
15:['Le Chatelier and Q link activity changes to the thermodynamic driving force of a galvanic reaction.','Optimisation needs an objective such as reversible voltage; electrode amount and open-circuit voltage are different quantities.','Complexation, losses and resource costs can change apparently favourable concentration choices.'],
16:['The standard hydrogen half-cell defines a reference state for relative electrode potentials.','Platinum surface, hydrogen, proton activity and ionic/electronic paths fulfil distinct roles.','Zero volts is a reference convention; reaction direction and nonstandard conditions require explicit reasoning.']}
for n,s in enumerate(spec['specifications'],1):
 if s['archetype']=='investigation':s['archetype']='experiment'
 if n in en:
  for i,pair in enumerate(s['essentialPairs']):pair[1]=en[n][i]
write('science/sixteen-understanding-specifications.final-manual.author.json',spec)
routebase=Path('tmp/chemie-m7-resumed-20261015/equilibrium16-current338-routing-v1');routing=j(routebase/'INPUTS.equilibrium16.current338.whole-source-routing.technical.json')
canpath=A/'candidate-v2/canonical560.current422.one-mechanism-description-and-PNG.author-v2.json';sempath=A/'candidate-v2/semantic560.one-mechanism-description-source-binding.author-v2.json';can=j(canpath);G={g['id']:g for g in can['goals']};ids=routing['goalIds'];base=E/'chemie-energy-three-wording-four-alt-bounded-author-root-20261015-v1/candidate/canonical560.current422.three-wording-four-alt.author.json';oldG={g['id']:g for g in j(base)['goals']};changed=[i for i in G if G[i]!=oldG[i]];assert changed==['13838147-c26d-54ca-b9be-5f2f0b8e9de5']
contexts=copy.deepcopy(routing['wholeCurrentGoalsAndContext'])
for r in contexts:
 r['goal']=G[r['goal']['id']]
 for k in ['wholeDirectPrerequisites','wholeTransitivePrerequisites','wholeDirectParents','wholeAncestorParents','wholeDirectDependents']:r[k]=[G[g['id']] for g in r[k]]
write('inputs/sixteen-whole-final-contexts.exact.json',{'role':'Exact final author contexts, one bounded138successor; no D vote','rows':contexts})
compact=[]
for r in routing['selectedSourceMappingAndExtractionRows']:
 compact.append({k:r[k] for k in ['mapping','extraction','jurisdiction','matchingEdges','wholeSourceGoals','wholeSourceCellUnionEdges','wholeCanonicalPartnerGoals','wholeSelectedPassageCellUnionEdges','sourceDocumentFileBindings','useBoundary']})
write('sources/whole-source-cells-and-canonical-partner-unions.exact.json',{'role':'Current23namedroutes,179selectedwholecellsandwholepartnerunions;sourcejudgmentsnotupgraded','routes':compact,'primaryDocuments':routing['primaryDocumentFileBindings'],'selectionBoundary':routing['selectionBoundary']})
assets=j(R/'inputs/fifteen-current-image-assets-KEEP.exact.json')['assets'];currentassets=[]
for row in assets:
 if row['goalId'].startswith('13838147'):
  p=A/'candidate-v2/visualizations/chemie/13838147-c26d-54ca-b9be-5f2f0b8e9de5/13838147-c26d-54ca-b9be-5f2f0b8e9de5.png';currentassets.append({'goalId':row['goalId'],**bind(p),'policy':'Exact separately authoredV2PNG; author has viewed it; genuine external V1 remains external'})
 else:currentassets.append({**row,'policy':'KEEP exact existing bytes; no new V vote'})
write('inputs/fifteen-final-assets.exact-bindings.json',{'role':'Actual author-used final visuals; no image in f0f2c5f8; fourteen JPGKEEPandoneexternalPNGsuccessor','assets':currentassets,'missingImageGoalIds':['f0f2c5f8-06f1-5774-a176-d96505727acf']})
sourcegaps=[r['goal']['id'] for r in contexts if not r['directSourceEdgesInSelectedCurrentNamedReviewFiles']]
write('sources/AUTHOR.exact-source-course-and-model-boundaries.json',{'role':'Author limits, not independent source/course/atomicity approval','readSuppliedWholePassages':87,'distinctTextBodies':81,'bothRawTextAndTextRead':True,'textOnlyPassagesNotDiscarded':50,'selectedDirectEdges':183,'selectedWholeSourceCells':179,'primaryDocumentsBound':24,'actualPrimaryReading':'Targeted complete HE pages46–48 and BW pages24/30/39 only; supplied structuredBYunits and87wholepassages read; not all24wholeprimarydocuments','goalsWithoutSelectedDirectNamedRoute':sourcegaps,'sourceGapMeaning':'Absence of a selected direct mapping is not proof of curricular absence. RP7.5mentionsKp; carbonate/coupling and electrolysis/redox are present in related passages but are not silently promoted into exact full route or course approval.','HELimits':'HE Q3.3 requires Nernst concentration calculations without pH/temperature dependence. Supplied pH transfer is labelled optional model transfer, not a new HE obligation. HE Q3.5 explicitly includes oxalate/permanganate autocatalysis and enzyme temperature; its full page does not itself establish general mechanism reconstruction or the five enrichment scopes.','broadCells':'Only each goal clause is used. Thermometry does not absorb all electrical work/entropy/energytechnology clauses. Corrosion explanation does not certify every source experiment or ecological judgment of partnergoals.','courseSelection':'Current canonical tags/applicability and partners preserved; no whole-GK/LK/nationwide projection audit or clearance. Solubility and hydrogen electrode course placement must be evaluated with actual state views, not inferred from canonical tags alone.','atomicity':'Author identifies integrated cores and boundaries below; broadcoupled-equilibrium scope remains for developer/source review. No atomic status or A ledger created.','experimentalEvidence':'Explicit futureobservableprotocols assess conduct when actuallyperformed. Blank records and suppliedfictionaldatadonotclaimactuallearners/labtrials. PriorhumantrialsarenotmachineM7prerequisites.','visual00c647e8':'KEEP/openauthorvisualcontext:theliteralphrase“KatalysatorsenktAktivierungsenergie(Ea),bleibtunverändert”canrefergrammaticallytothecatalyst;donotquoteitas“Eableibtunverändert”.Particle/endstateandcomparable-pathdrawingremaininterpretationlimits;authorcreatesnoVveto.','visual138':'OldJPGandfailedV1remainhistory;finalV2PNGandboundedtextnowread;externalV1acceptanceselectedonlyasexternalprovenance.','newIndependentVotes':0,'PAGrants':False,'HumanApproval':False,'sourceCourseClearance':False})
# The original scientific FIRST includes the actual final material before production fingerprints.
first=[]
for n,s in enumerate(spec['specifications'],1):
 id=s['goalId'];cc=[c for c in final['cases'] if c['goalId']==id];assert len(cc)==2
 first.append({'goalId':id,'wholeFinalGoal':G[id],'authorRole':'Material/profile designer, not an independent reviewer','essentialUnderstandingDe':' '.join(p[0] for p in s['essentialPairs']),'essentialUnderstandingEn':' '.join(p[1] for p in s['essentialPairs']),'observablePerformanceDe':' '.join(c['taskDe'] for c in cc),'observablePerformanceEn':' '.join(c['taskEn'] for c in cc),'transferExpectationDe':' '.join(c['freshIndependentTransferDe'] for c in cc),'transferExpectationEn':' '.join(c['freshIndependentTransferEn'] for c in cc),'authorCompetenceCore':s['essentialPairs'][0][0],'prerequisiteUse':[{'goalId':i,'title':G[i]['title'],'descriptionDe':G[i]['description'],'descriptionEn':G[i].get('descriptionEn','')} for i in G[id]['requires']],'boundedCaseIds':[c['id'] for c in cc],'sourceBoundary':'No direct selected named route: unresolved exact source/course scope.' if id in sourcegaps else 'Only actual source clauses and shared partner duties support this author design; no whole-course approval.','authorProfileLevel':'E0/G0; unreviewed design','unobservedLearnerPerformance':True,'independentDecision':None})
firstdoc={'schemaVersion':1,'authoredAtUTC':now,'role':'Own original whole-material science on final16contexts before profile binder; not D/P/A/M/V decisions','finalCanonical':bind(canpath),'finalSemantic':bind(sempath),'originalRoutingSelector':bind(routebase/'SELECTION.equilibrium16-current338-routing.technical.json'),'materials':bind(R/'materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json'),'actualFinal138Read':True,'actualImagesUsed':'All15initialassetsviewed;14JPGkept,current138V2PNGalsoactuallyviewed;f0f2hasnoasset. All32casesstandindependentlyofvisuals.','actualScientificInputRead':'All16wholegoals,currentdirect/transitiveprerequisiteandpartnersemantics,87wholepassagesincluding50text-only,6actualtargetedprimaryPDFpages,final138wholeDEEN/ALT/PNG. No whole24-document/courseapproval.','goalJudgments':first,'original138Proposal':bind(R/'science/FIRST.13838147-bounded-description-author-proposal.json'),'newScientificIndependentVotes':0,'profileFingerprintsYetCreated':False,'newDPAApprovals':0}
write('science/FIRST.sixteen-whole-material-understanding.author.json',firstdoc)
write('science/FILES.FIRST-author-science.seal.json',{'schemaVersion':1,'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Author science before profile fingerprints; no independent approval','files':[bind(R/'science/FIRST.sixteen-whole-material-understanding.author.json'),bind(R/'science/FIRST.13838147-bounded-description-author-proposal.json'),bind(R/'materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json'),bind(R/'science/sixteen-understanding-specifications.final-manual.author.json')],'productionProfileBinderNotYetRun':True})
write('inputs/final-author-physical-inputs.json',{'schemaVersion':1,'goalIds':ids,'canonical':bind(canpath),'semantic':bind(sempath),'criteria':bind('curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'),'originalRoutingSelector':bind(routebase/'SELECTION.equilibrium16-current338-routing.technical.json'),'originalRoutingSeal':bind(routebase/'FILES.equilibrium16-current338-routing.seal.json'),'finalExternalVSelector':bind(V/'SELECTION.final-exact-context-normal-V1.json'),'finalExternalVSeal':bind(V/'FILES.finite-final-exact-context-normal-V1.seal.json'),'FIRST':bind(R/'science/FILES.FIRST-author-science.seal.json')})
print('Own16scienceFIRSTwrittenbeforebinder;sourcegaps',len(sourcegaps))
