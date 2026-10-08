#!/usr/bin/env python3
"""Bounded author shape/binding/equation guard, never independent scientific approval."""
import pathlib,json,hashlib,subprocess
from datetime import datetime,timezone
OWN=pathlib.Path(__file__).resolve().parent
ROOT=OWN.parents[6]
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dg(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def bind(p):return{'path':str(p.relative_to(ROOT))if p.is_relative_to(ROOT)else str(p),'sha256':sha(p),'bytes':p.stat().st_size}
assert not(OWN/'four-ion-intentions-whole-source-author-v4.first.freeze.json').exists()
manifest=read(OWN/'declared-current-input-bindings.author-v4.json');inputs=manifest['inputBindings']
for b in inputs:assert bind(ROOT/b['path'])==b,b['path']
cases=read(OWN/'three-operative-new-whole-DEEN-ion-source-cases.manifest.author-v4.json')['wholeCases']
assert len(cases)==3 and {c['intentionSpecies']for c in cases}=={'Br−','CO3²−','NH4+'}
for c in cases:
 assert c['canonicalWitnessCandidateGoalId']=='a44af1fa-5988-5b7d-b206-691c6bbf7dd4'
 assert c['actualLearnerOrExperimentEvidence'] is False
 assert c['reviewAuthority']=='ai_candidate' and c['humanReviewStatus']=='needs_human_review'
 assert c['evidenceLevel']=='E1' and c['maximumClaimScope']=='G1'
 for lang in ['de','en']:
  assert len(c['material'][lang])==2 and all(c['material'][lang])
  assert c['learnerTask'][lang] and c['modelAnswer'][lang]
  assert c['transfer'][lang]['task'] and c['transfer'][lang]['expected']
 assert c['materialAndSourceLimits'] and all(c['positiveUnderstandingEdge'].values())
plan=read(OWN/'two-source-row-operative-current-scope-union-plan.pending-two-real-reviews.author-v4.json')
source=read(OWN/'two-whole-BBBE-original-source-goals-decisions-and-edges.exact.json')['rows']
assert len(plan['rows'])==2
for row in plan['rows']:
 original=next(x for x in source if x['sourceGoalId']==row['sourceGoalId'])
 assert row['wholeOriginalDecisionBefore']==original['wholeOriginalDecision']
 assert row['wholeOriginalEdgesBefore']==original['wholeOriginalMappingEdges']
 assert row['wholeOriginalSourceGoalDigest']==dg(original['wholeOriginalSourceGoal'])
 mp=ROOT/row['mappingPath'];d=read(mp)
 assert d['decisions'][original['decisionIndex']]==row['wholeOriginalDecisionBefore']
 assert row['candidateAfter']==['1c1420c2-a8e2-520f-8015-6df637a973bd','fd309753-4d48-5570-a4ec-09dfeb20ff9c','a44af1fa-5988-5b7d-b206-691c6bbf7dd4']
 assert len(row['candidateNewEdges'])==3 and row['activeApply'] is False
assert plan['currentApplicabilityChanges']==0 and plan['newCandidateViewFiles']==0 and plan['currentRequiresChanges']==0
assert plan['machineStrictNetGain']==0 and plan['twoNewIndependentReviewersRequired'] is True
mapping=read(OWN/'four-original-ion-intentions-operative-current-scope-witness-map.author-v4.json')
assert {x['originalIntentSpecies']for x in mapping['rows']}=={'Cl−','Br−','CO3²−','NH4+'}
assert all(x['currentCanonicalWitnessGoalId']=='a44af1fa-5988-5b7d-b206-691c6bbf7dd4' for x in mapping['rows'])
assert mapping['newWholeSourceCases']==3 and mapping['retainedWholeChlorideCases']==2
native=read(OWN/'native-retained-P-three-and-current-four-BBBE-scope-check.actual.json')
assert native['actualTerminalExitCode']==0 and len(native['pChecks'])==3 and len(native['scopeChecks'])==4
assert all(all(w['currentTargetVisible']and w['actualBBBEApplicability']for w in s['witnesses'])for s in native['scopeChecks'])
for c in native['pChecks']:
 inputs.extend([bind(ROOT/c['canonicalAssetPath']),bind(ROOT/c['publicAssetPath'])])
inputs.extend([bind(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'),bind(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),
 bind(ROOT/'app/scripts/positiveGoalEvidenceProfileModel.ts'),bind(ROOT/'app/scripts/goalEvidenceProfileModel.ts'),bind(ROOT/'app/scripts/goalBookModel.ts'),
 bind(ROOT/'app/src/utils/authoring/canonicalAuthoring.ts'),bind(ROOT/'app/src/utils/authoring/compositionViewAuthoring.ts')])

# Formal equations are counted from the stated species, not inferred by a string match.
species={
 'Ag+':({'Ag':1},1),'Br-':({'Br':1},-1),'Cl-':({'Cl':1},-1),'AgBr':({'Ag':1,'Br':1},0),'AgCl':({'Ag':1,'Cl':1},0),
 'CO3--':({'C':1,'O':3},-2),'H3O+':({'H':3,'O':1},1),'CO2':({'C':1,'O':2},0),'H2O':({'H':2,'O':1},0),
 'HCO3-':({'H':1,'C':1,'O':3},-1),'CaOH2':({'Ca':1,'O':2,'H':2},0),'CaCO3':({'Ca':1,'C':1,'O':3},0),'Ca++':({'Ca':1},2),
 'NH4+':({'N':1,'H':4},1),'OH-':({'O':1,'H':1},-1),'NH3':({'N':1,'H':3},0)}
equations=[('AgBr',[('Ag+',1),('Br-',1)],[('AgBr',1)]),('AgCl',[('Ag+',1),('Cl-',1)],[('AgCl',1)]),
 ('carbonate acid',[('CO3--',1),('H3O+',2)],[('CO2',1),('H2O',3)]),('hydrogencarbonate acid',[('HCO3-',1),('H3O+',1)],[('CO2',1),('H2O',2)]),
 ('limewater',[('CO2',1),('CaOH2',1)],[('CaCO3',1),('H2O',1)]),('excess CO2',[('CaCO3',1),('CO2',1),('H2O',1)],[('Ca++',1),('HCO3-',2)]),
 ('ammonium hydroxide',[('NH4+',1),('OH-',1)],[('NH3',1),('H2O',1)]),('ammonia water',[('NH3',1),('H2O',1)],[('NH4+',1),('OH-',1)])]
def count(side):
 atoms={};charge=0
 for s,n in side:
  a,q=species[s];charge+=q*n
  for el,v in a.items():atoms[el]=atoms.get(el,0)+v*n
 return dict(sorted(atoms.items())),charge
eqchecks=[]
for name,left,right in equations:
 assert count(left)==count(right),name
 eqchecks.append({'equationModel':name,'atomsAndChargeEqual':True,'leftTotals':count(left),'rightTotals':count(right)})
pages=[]
for jur in ['BB','BE']:
 p=ROOT/f'curricula/DE/Gymnasium/input/{jur}/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf'
 for number in [26,44,45,46]:
  t=subprocess.run(['pdftotext','-f',str(number),'-l',str(number),'-layout',str(p),'-'],capture_output=True,check=True).stdout
  pages.append({'jurisdiction':'DE-'+jur,'primaryPdfBinding':bind(p),'physicalAndPrintedPage':number,'wholeLayoutTextDigest':hashlib.sha256(t).hexdigest(),'actuallyWholeReadByAuthor':True,'fullExtractedTextCommitted':False})
inputs=list({x['path']:x for x in inputs}.values())
out={'role':'Actual author binding/whole-case shape/equation preservation check only; no independent review or whole-source approval','observedAtUTC':datetime.now(timezone.utc).isoformat(),
 'actualTerminalExitCode':0,'inputBindings':inputs,'wholeNewCaseChecks':[{'caseLocalKey':c['caseLocalKey'],'wholeCaseDigest':dg(c),'fullDEENMaterialTaskModelTransferPresent':True,'pendingIndependentReview':True}for c in cases],
 'formalEquationChecks':eqchecks,'wholeOriginalPrimaryPageReadBindings':pages,'operativeSourceRows':2,'sourceIdentityCourseStagePreserved':True,
 'retainedOriginalBScienceSealUnchanged':True,'currentWholePProfilesChanged':0,'currentGoalBodiesChanged':0,'currentScopeViewFilesChanged':0,
 'oldAcceptedScienceReReviews':0,'newIndependentReviews':0,'wholeSourceClosureApproved':False,'nativeWholeGoalPApprovals':0,'activeWrites':0,'humanApproval':False}
(OWN/'operative-three-whole-source-cases-and-retention-check.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'actualExitCode':0,'exactInputs':len(inputs),'wholeNewCases':3,'formalBalancedEquations':8,'wholeBBBEPrimaryPages':8,'newSourceOrWholeGoalApprovals':0}))
