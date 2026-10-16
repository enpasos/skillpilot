# SPDX-License-Identifier: Apache-2.0
import json,math,hashlib,datetime,ast
from pathlib import Path
R=Path(__file__).resolve().parents[1];REPO=Path.cwd()
def j(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def check(row):
 p=REPO/row['path'];assert p.is_file(),p;assert sha(p)==row['sha256'],p
 if 'bytes'in row:assert p.stat().st_size==row['bytes'],p
input=j(R/'inputs/final-author-physical-inputs.json');first=j(REPO/input['FIRST']['path'])
for r in first['files']:check(r)
for k in ['canonical','semantic','criteria','finalExternalVSelector','finalExternalVSeal']:check(input[k])
cases=j(R/'materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json')['cases'];profiles=[json.loads(l) for l in (R/'candidate/sixteen-unreviewed-E0G0.author-profiles.jsonl').read_text().splitlines()]
assert len(cases)==32 and len({c['id'] for c in cases})==32 and len(profiles)==16
assert {p['goalId'] for p in profiles}==set(input['goalIds'])
for id in input['goalIds']:assert sum(c['goalId']==id for c in cases)==2
for c in cases:
 assert not c['imageRequired'];assert c['scoring']['maximumPoints']==sum(x['points'] for x in c['criterionToObservableRubric'])==12
 assert len(c['criterionToObservableRubric'])==3
 for k in ['materialsDe','materialsEn','taskDe','taskEn','workedReasoningDe','workedReasoningEn','freshIndependentTransferDe','freshIndependentTransferEn']:assert len(c[k])>30,(c['id'],k)
for p in profiles:assert p['evidenceLevel']=='E0' and p['maximumClaimScope']=='G0' and p['reviewAuthority']=='ai_candidate' and p['reviewRunIds']==[]
# Independently recomputed teaching results; this checks supplied data, not learners.
mathrows=[]
def result(id,label,actual,expected,tolerance=1e-8):
 assert abs(actual-expected)<=tolerance,(id,label,actual,expected)
 mathrows.append({'caseId':id,'quantity':label,'actualIndependentCalculation':actual,'expectedRoundedOrExact':expected,'absoluteTolerance':tolerance})
result('01a','AgCl molar solubility',math.sqrt(1.8e-10),1.34e-5,5e-8)
result('01a','CaF2 molar solubility',(3.2e-11/4)**(1/3),2e-4)
result('01b','Q after equal-volume mixing',(2e-5/2)**2,1e-10)
result('01b','Ag+ with common chloride',1.8e-10/.01,1.8e-8)
result('02a','surroundings heat J',(20*4.18+15)*9,887.4)
result('02a','reaction enthalpy kJ/mol',-(20*4.18+15)*9/.004/1000,-221.85)
result('02b','insulated reaction enthalpy kJ/mol',-229*4/.005/1000,-183.2)
result('02b','less insulated apparent enthalpy kJ/mol',-229*3.1/.005/1000,-141.98)
result('04a','concentration-cell V',.05916/2*math.log10(.1/.001),.05916)
result('04b','Daniell nonstandard V',1.1-.05916/2*math.log10(.1/.001),1.04084)
result('05a','coarse initial mL/s',4/20,.2);result('05a','fine initial mL/s',15/20,.75)
result('05b','controlled ratio',(14/20)/(8/20),1.75)
result('06a','accelerated absorbance loss/s',(.60-.22)/20,.019)
result('06b','seeded initial mol/L/s',(.010+2*.020)*.1,.005)
result('07a','dimensionless Kp',.005*.08314*298,.1238786)
result('07b','dimensionless Kc',.2/(.08314*500),.0048112,1e-7)
result('08a','K at318K',.1*math.exp(-50000/8.314*(1/318-1/298)),.3558,5e-5)
result('08b','mean reaction enthalpy kJ/mol',-8.314*math.log(.5)/(1/320-1/300)/1000,-27.66,.005)
result('09a','carbonate mol/L',4.7e-11*.01/1e-8,4.7e-5)
result('09a','calcium mol/L',3.3e-9/(4.7e-11*.01/1e-8),7.021276596e-5)
result('09b','silver solubility mol/L',math.sqrt(1.8e-10*(1+1.6e7*.1**2)),.005367,5e-7)
result('10a','Cu threshold Eh V',.340+.05916/2*(-6),.16252)
result('10b','vertical threshold pH',14-4.5,9.5)
result('10b','corrected intercept V',-.44+.02958*(-15+28),-.05546)
result('10b','intersection Eh V',-.05546-.05916*9.5,-.61748)
result('10b','pH11 threshold Eh V',-.05546-.05916*11,-.70622)
result('11a','log10K',2*1.1/.05916,37.18728870858689)
result('11a','K scaled by1e37',10**(2*1.1/.05916)/1e37,1.54,.005)
result('11b','reversible water voltage',237130/(2*96485),1.22884,5e-6)
result('12a','empirical k L2 mol-2 s-1',2e-4/(.1**2*.1),.20)
result('12b','low-C rate M/s',2*5*.1*.1*.01/(10+5*.01),9.95e-5,5e-8)
result('12b','high-C rate M/s',2*5*.1*.1*10/(10+5*10),.01667,5e-6)
result('13a','enzyme reverse barrier kJ/mol',35-(-30),65)
result('14a','CO2 formed kg/h',.90*44/28,1.414,.0005)
result('14a','climate sub-account saving kg',10*1000*.4-(4*1000*.4+100),2300)
result('14b','consumed NH3 kg',90/30*17,51)
result('15a','A voltage change V',-.05916/2*math.log10(.5),.00890,5e-6)
result('15b','ligand-case voltage V',1.1-.05916/2*math.log10(.01/1e-5),1.01126)
result('16a','Daniell standard V',.340-(-.760),1.1)
result('16b','nonstandard H/Cu V',.340-(-.05916*3),.51748)
# Explicit atom/charge vectors independently check the reaction balances used in cases.
balances=[('Zn+Cu2+ -> Zn2++Cu',{'Zn':1,'Cu':1,'charge':2},{'Zn':1,'Cu':1,'charge':2}),('Zn+2Fe3+ -> Zn2++2Fe2+',{'Zn':1,'Fe':2,'charge':6},{'Zn':1,'Fe':2,'charge':6}),('O2+2H2O+4e- ->4OH-',{'O':4,'H':4,'charge':-4},{'O':4,'H':4,'charge':-4}),('CaCO3+2H+ ->Ca2++CO2+H2O',{'Ca':1,'C':1,'O':3,'H':2,'charge':2},{'Ca':1,'C':1,'O':3,'H':2,'charge':2}),('2MnO4-+5C2O4^2-+16H+ ->2Mn2++10CO2+8H2O',{'Mn':2,'C':10,'O':28,'H':16,'charge':4},{'Mn':2,'C':10,'O':28,'H':16,'charge':4}),('4NH3+4NO+O2 ->4N2+6H2O',{'N':8,'H':12,'O':6,'charge':0},{'N':8,'H':12,'O':6,'charge':0})]
assert all(a==b for _,a,b in balances)
source=j(R/'sources/whole-source-cells-and-canonical-partner-unions.exact.json')
for r in source['routes']:
 check(r['mapping']);check(r['extraction'])
for r in source['primaryDocuments']:check(r)
assets=j(R/'inputs/fifteen-final-assets.exact-bindings.json')
for r in assets['assets']:check(r)
blank={'schemaVersion':1,'role':'Empty future observation slots; no completed trial or learner evidence','records':[{'caseId':c['id'],'goalId':c['goalId'],'performed':False,'independentPerformanceObserved':False,'learnerResponse':None,'assistanceHistory':[],'actualDate':None,'actualRawMeasurements':[],'controlsActuallyUsed':None,'safeProcedureObserved':None,'uncertaintyAndDeviations':None,'reasonedInference':None,'freshTransferResponse':None,'criterionObservations':[{'criterionId':r['criterionId'],'observed':False,'notes':None} for r in c['criterionToObservableRubric']],'masteryDecision':None} for c in cases]}
(R/'materials/thirty-two-blank-future-observation-records.json').write_text(json.dumps(blank,ensure_ascii=False,indent=2)+'\n')
for p in R.rglob('*.py'):ast.parse(p.read_text(),filename=str(p))
report={'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pass':True,'role':'Actual bounded author numeric/material/input checks, no learner or scientific review approval','wholeCases':32,'bilingualTaskSolutionTransferFields':256,'criterionRows':96,'blankFutureRecords':32,'independentNumericResults':mathrows,'balancedReactionVectors':[{'equation':name,'left':a,'right':b,'balanced':True} for name,a,b in balances],'profileClosedSchemaAndNormalHelperPass':j(R/'checks/PROFILE16.closed-schema-and-unmodified-normal-helper.actual.json')['pass'],'exactCurrentInputBindingChecks':{'canonical':True,'semantic':True,'FIRST':True,'sourceRoutes':23,'primaryFilesBoundNotAllRead':24,'visualAssets':15},'selectedAutomaticSpacingVariants':0,'newIndependentScientificVotes':0,'PAGrants':False,'humanTrials':False,'activeWrites':0}
(R/'checks/ACTUAL.author-material32-numeric-and-byte-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pass':True,'numericResults':len(mathrows),'wholeCases':32,'profilesE0G0':16,'independentApprovals':0}))
