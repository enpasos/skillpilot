import json, hashlib, math
from pathlib import Path
import jsonschema
R=Path('/home/enpasos/projects/skillpilot'); E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
A=E/'chemie-seven-HE-historical-exam-atomic-interface-and-material-author-successor-20261016-v1'; O=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
first=O/'FIRST.seven-whole-exam-science-and-interface.independent-a.frozen.json'
assert sha(first)=='sha256:1c680b291f8184fb14e14bcd5b1512e20960427aa5793147fc0340c12e55e78c'
source=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert sha(source)=='sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9'
base=read(source); before={g['id']:g for g in base['goals']}; merged=dict(before)
schema=read(R/'docs/landscape-runtime.schema.json'); validator=jsonschema.Draft202012Validator({'$ref':'#/$defs/goal','$defs':schema['$defs']})
rows=[]
for op in read(A/'CAS.seven-WHOLE-exams.current639.AUTHOR.inactive.json')['operations']:
 old,new=op['before'],op['after']; assert before[op['goalId']]==old
 assert new==read(R/op['afterFile']['path'])
 assert not list(validator.iter_errors(new))
 assert old['tags']==new['tags'] and old['applicability']==new['applicability']
 assert old['extendedData']['provenance']==new['extendedData']['provenance']
 os,ns=old['examData']['scoring'],new['examData']['scoring']
 assert os['maxPoints']==ns['maxPoints']==30 and os['passingPoints']==ns['passingPoints']==18
 assert [s['points'] for s in os['steps']]==[s['points'] for s in ns['steps']]
 assert sum(s['points'] for s in ns['steps'])==30 and new['examData']['reviewStatus']=='draft'
 assert set(new['requires'])<=before.keys() and new['requires']
 merged[new['id']]=new;rows.append({'goalId':new['id'],'schemaErrors':0,'points':[s['points'] for s in ns['steps']],'maxPass':[30,18],'courseJurisdictionProvenanceExact':True,'requires':new['requires'],'coveredGoalIds':new['examData']['coveredGoalIds'],'draft':True})
for edge in ['requires','contains']:
 done=set(); stack=set()
 def walk(i):
  assert i not in stack
  if i in done:return
  stack.add(i)
  for n in merged[i].get(edge,[]):walk(n)
  stack.remove(i);done.add(i)
 for i in merged:walk(i)
assert sum(merged[i]!=before[i] for i in before)==7
values={'detergentAnnualKWh':(1.10-.55)*250,'detergentAnnualKg':[18*250/1000,30*250/1000],'detergentAnnualEuro':[.22*250,.25*250],'zincMol':.65/65.4,'maxElectronMol':2*.65/65.4,'referenceAcidMol':.100*.0248,'referenceAcidM':.100*.0248/.025,'acidLimitPercentMargin':(.100-.0992)/.100*100,'referenceEsterKc':(.6/2)**2/(.4/2)**2,'ammoniaTrialMol':{'N2':1-.4,'H2':3-3*.4,'NH3':2*.4},'ABSRecoveryPercent':96/120*100,'linearTrimer':{'lacticAcidUnits':3,'esterLinks':2,'waterMolecules':2,'leftAtomCounts':{'C':9,'H':18,'O':9},'rightChainPlus2WaterAtomCounts':{'C':9,'H':18,'O':9}},'oldLacticAcidModelInitialpH':-math.log10((-10**-3.86+math.sqrt(10**-7.72+4*10**-3.86*.0992))/2)}
result={'role':'Independent finite mechanical checks after immutable seven-exam science FIRST; not a full matrix','firstScienceSHA256':sha(first),'schemasAndScores':rows,'DAGRequiresContainsAcyclic':True,'other632WholeGoalsExact':True,'ownIndependentCalculations':values,'nativeDExamCount':0,'executedJavaSession':False,'normalInputWrites':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False}
p=O/'CHECK.independent-seven-schemas-exact-wholes-and-calculations.json';p.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'schemas':7,'scoresEveryExam':[30,18],'other632Exact':True,'DAGcycles':0,'firstExact':True}))
