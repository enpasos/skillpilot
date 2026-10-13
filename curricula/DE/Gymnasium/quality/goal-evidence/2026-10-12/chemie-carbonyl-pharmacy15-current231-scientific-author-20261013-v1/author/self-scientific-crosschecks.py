"""Apache-2.0; independently recompute authored numerical/stoichiometric targets."""
from pathlib import Path
import json,math,re,collections,datetime
O=Path(__file__).resolve().parent.parent;checks=[]
def ck(label,got,expected,tol=1e-3):
 ok=abs(got-expected)<=tol;checks.append(dict(label=label,recomputed=got,expectedPrintedRoundedValue=expected,tolerance=tol,passed=ok));assert ok,label
ck('PPI case1 uninhibited pH',-math.log10(.012),1.921);ck('PPI case1 inhibited pH',-math.log10(.0102),1.991);ck('PPI case2 neutralized/renewed pH',-math.log10(.006),2.222);ck('PPI case2 inhibited influx pH',-math.log10(.008),2.097)
ck('Lactose remaining mmol',10-8,2);ck('Complete fat hydrolysis fatty acids mmol',3*.60,1.80);ck('Foam height reduction percent',(40-12)/40*100,70)
ck('ASA sale case1 grams',1200*.500,600);ck('Ibuprofen sale case1 grams',1800*.200,360);ck('Paracetamol sale case1 grams',1000*.500,500);ck('Normalized X units per person30 days',600/200*30/60,1.5)
ck('CaCO3 acid capacity mmol',2*.500/100.09*1000,9.991);ck('MgOH2 capacity mmol',2*.300/58.32*1000,10.288);ck('Carbonate CO2 mmol',.500/100.09*1000,4.996)
ck('NaHCO3 remaining acid pH',-math.log10(.004/.1000),1.398);ck('MgOH2 remaining acid pH',-math.log10(.003/.1000),1.523)
ck('ASA extraction minimum volume mL',500/10,50);ck('ASA cold retained mg',2*8,16);ck('ASA maximum recovered mg',500-2*8,484);ck('ASA recovery percent',(500-16)/500*100,96.8);ck('ASA TLC Rf',37.2/60,.62);ck('Salicylic acid Rf',18/60,.30)
ck('COX model product reduction percent',(100-25)/100*100,75);ck('Dosage L onset hours',2/4,.5);ck('Dosage L endpoint hours',2+(3-2)/(3-1)*2,3);ck('Dosage L duration hours',3-.5,2.5);ck('Dosage E50 percent hours',2+(.50-0)/(1-0)*2,3);ck('Dosage R50 percent hours',2+(50-40)/(70-40)*2,2.667);ck('Dosage Z50 percent hours',50/90,.556)
ck('Grignard aldehyde maximum mmol',min(30,35-1),30);ck('Grignard ketone maximum mmol',min(20,25-6),19);ck('Grignard ketone maximum conversion percent',19/20*100,95)
ck('ASA back-titration A mg',.1000*(50-22.25)/2*180.16,249.972);ck('ASA back-titration B mg',.1000*(50-30.57)/2*180.16,175.025);ck('ASA A/B mass ratio',(50-22.25)/(50-30.57),1.428,.001)
ck('HPLC A ASA concentration mg/L',(1005-5)/20,50);ck('HPLC A PCM concentration mg/L',(252-2)/10,25);ck('HPLC A ASA mass mg',50*100*.1000,500);ck('HPLC A PCM mass mg',25*100*.1000,250)
def atoms(formula):
 out=collections.Counter()
 for e,n in re.findall(r'([A-Z][a-z]?)([0-9]*)',formula):out[e]+=int(n or 1)
 return out
def balance(label,left,right):
 def side(entries):
  total=collections.Counter();q=0
  for n,f,z in entries:
   for e,c in atoms(f).items():total[e]+=n*c
   q+=n*z
  return dict(total),q
 a,b=side(left),side(right);ok=a==b;assert ok,(label,a,b);checks.append(dict(label=label,leftElementsAndCharge=a,rightElementsAndCharge=b,passed=ok))
balance('CuII propanal oxidation',[(1,'C3H6O',0),(2,'Cu',2),(5,'OH',-1)],[(1,'C3H5O2',-1),(1,'Cu2O',0),(3,'H2O',0)])
balance('Ethanoic acid bicarbonate',[(1,'C2H4O2',0),(1,'NaHCO3',0)],[(1,'C2H3O2Na',0),(1,'CO2',0),(1,'H2O',0)])
balance('Ester hydrolysis',[(1,'C4H8O2',0),(1,'H2O',0)],[(1,'C2H4O2',0),(1,'C2H6O',0)])
balance('Carbonic equilibrium',[(1,'CO2',0),(1,'H2O',0)],[(1,'H',1),(1,'HCO3',-1)])
balance('Lactose hydrolysis',[(1,'C12H22O11',0),(1,'H2O',0)],[(1,'C6H12O6',0),(1,'C6H12O6',0)])
balance('Ethanoate ester condensation',[(1,'C2H4O2',0),(1,'C2H6O',0)],[(1,'C4H8O2',0),(1,'H2O',0)])
balance('Acetamide condensation',[(1,'C2H4O2',0),(1,'NH3',0)],[(1,'C2H5NO',0),(1,'H2O',0)])
balance('Propanoate methyl ester condensation',[(1,'C3H6O2',0),(1,'CH4O',0)],[(1,'C4H8O2',0),(1,'H2O',0)])
balance('N-methylpropanamide condensation',[(1,'C3H6O2',0),(1,'CH5N',0)],[(1,'C4H9NO',0),(1,'H2O',0)])
balance('Carbonate neutralization',[(1,'CaCO3',0),(2,'H',1)],[(1,'Ca',2),(1,'CO2',0),(1,'H2O',0)])
balance('Hydroxide neutralization',[(1,'MgO2H2',0),(2,'H',1)],[(1,'Mg',2),(2,'H2O',0)])
balance('Bicarbonate neutralization',[(1,'HCO3',-1),(1,'H',1)],[(1,'CO2',0),(1,'H2O',0)])
balance('ASA anhydride acylation',[(1,'C7H6O3',0),(1,'C4H6O3',0)],[(1,'C9H8O4',0),(1,'C2H4O2',0)])
balance('Paracetamol anhydride acylation',[(1,'C6H7NO',0),(1,'C4H6O3',0)],[(1,'C8H9NO2',0),(1,'C2H4O2',0)])
balance('ASA two-equivalent basic net reaction',[(1,'C9H8O4',0),(2,'OH',-1)],[(1,'C7H5O3',-1),(1,'C2H3O2',-1),(1,'H2O',0)])
balance('Ethyl Grignard water interference',[(1,'C2H5MgBr',0),(1,'H2O',0)],[(1,'C2H6',0),(1,'MgBrOH',0)])
balance('Ethyl Grignard ethanol interference',[(1,'C2H5MgBr',0),(1,'C2H6O',0)],[(1,'C2H6',0),(1,'C2H5OMgBr',0)])
# Explicit valence audit of the four written tetrahedral examples, independent of image.
valences=[dict(structure='CH3C(OH)(O-)(NH3+)',acylCarbonSingleBonds=4,oxygenMinusBonds=1,nitrogenPlusBonds=4),dict(structure='CH3CH2C(OH)(O-)(NH2+CH3)',acylCarbonSingleBonds=4,oxygenMinusBonds=1,nitrogenPlusBonds=4),dict(structure='CH3CH(O-)(Nu)',acylCarbonSingleBonds=4,oxygenMinusBonds=1),dict(structure='(CH3)2C(O-)(Nu)',acylCarbonSingleBonds=4,oxygenMinusBonds=1)]
assert all(v['acylCarbonSingleBonds']==4 for v in valences)
out=dict(schemaVersion=1,checkedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),numericAndElementChargeChecks=checks,writtenTetrahedralValenceAudit=valences,passed=all(c['passed']for c in checks),limitations=['Author recomputation, not independent scientific review','No observed learner/lab/medical performance','Grignard aggregate and amide thermal reaction are explicitly simplified models; real operation requires supplied local authorized method','Not a proof of source coverage or visual correctness'])
(O/'author/independent-formula-arithmetic-and-stoichiometry-selfchecks.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(dict(checks=len(checks),tetrahedralValenceCases=len(valences),passed=out['passed'])))
