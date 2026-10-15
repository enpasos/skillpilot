"""Additive author correction of one already identified P-design gap; no approval. Apache-2.0."""
from pathlib import Path
import json,copy,hashlib,datetime
ROOT=Path(__file__).resolve().parents[7]
OWN=Path(__file__).resolve().parent
BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1'
B=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-two-child-source-A-M-P-independent-b-20261013-v1'
GOAL='a96e9b3d-a02d-54f8-a3d3-318e0ea5180c'
def rel(p):return str(p.relative_to(ROOT))
def load(p):return json.loads(p.read_text())
def bind(p):b=p.read_bytes();return {'path':rel(p),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def write(name,o):p=OWN/name;p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return p
def object_bytes(o):return (json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode()
def object_sha(o):return 'sha256:'+hashlib.sha256(object_bytes(o)).hexdigest()
casepath=BASE/'positive/four-whole-child-cases.DEEN.author.json';profilepath=BASE/'positive/two-complete-positive-v2-child-profiles.DEEN.author.json'
cases=load(casepath);beforeCases=copy.deepcopy(cases)
profiles=load(profilepath);beforeProfiles=copy.deepcopy(profiles)
case=next(c for c in cases['cases'] if c['caseId']=='e560-formation-case-2');beforeCase=copy.deepcopy(case)
case['taskDe']=case['taskDe'].replace('2. Vergleiche die Molekülbauprinzipien mit PE.','2. Vergleiche die Molekülbauprinzipien mit PE und ausdrücklich die beobachteten Eigenschaften unter denselben Prüfbedingungen: rückstellendes vernetztes PDMS gegenüber bleibend verformtem PE. Erkläre, was dieser Fallvergleich zeigt und was die Rückgratbezeichnung allein nicht beweist.')
case['taskEn']=case['taskEn'].replace('2. Compare molecular building principles with PE.','2. Compare molecular building principles with PE and explicitly compare observed properties under the same testing conditions: recovering crosslinked PDMS versus permanently deformed PE. Explain what this case comparison shows and what the backbone label alone does not establish.')
sentence=' Im gegebenen direkten Eigenschaftsvergleich stellt das vernetzte PDMS nach Dehnung zurück, während die PE-Probe unter denselben Prüfbedingungen bleibende Formänderung zeigt. Die Daten belegen diesen Unterschied der beiden konkreten Proben; das C–C-Rückgrat allein wird nicht als Ursache jeder PE-Verformung oder als Beweis eines allgemeinen Eigenschaftsurteils ausgegeben.'
sentenceEn=' In the supplied direct property comparison, crosslinked PDMS recovers after extension while the PE specimen shows permanent deformation under the same testing conditions. The data establish this difference between the two particular specimens; the C–C backbone alone is not treated as the cause of every PE deformation or as proof of a general property conclusion.'
case['modelAnswerDe']=case['modelAnswerDe'].replace('Zusätzliche kovalente Verbindungen zwischen Ketten',sentence.strip()+' Zusätzliche kovalente Verbindungen zwischen Ketten')
case['modelAnswerEn']=case['modelAnswerEn'].replace('Additional covalent links between chains',sentenceEn.strip()+' Additional covalent links between chains')
r=next(r for r in case['rubric'] if r['expectationId']=='e2')
extraDe=' Vergleicht außerdem die beobachtete PDMS-Rückstellung ausdrücklich mit bleibender PE-Verformung unter gleichen Prüfbedingungen und begrenzt den Befund auf diese Proben; das Rückgrat allein erklärt nicht jede PE-Eigenschaft.'
extraEn=' Also explicitly compares observed PDMS recovery with permanent PE deformation under equal testing conditions and bounds the observation to these specimens; the backbone alone does not explain every PE property.'
for k in ['criterionDe','fullCreditDe']:r[k]+=extraDe
for k in ['criterionEn','fullCreditEn']:r[k]+=extraEn
r['partialCreditDe']+=' Oder der Strukturvergleich ist richtig, aber der ausdrücklich geforderte beobachtete Eigenschaftsvergleich zwischen PDMS und PE fehlt.'
r['partialCreditEn']+=' Or the structural comparison is correct but the required observed PDMS-versus-PE property comparison is missing.'
r['zeroCreditDe']+=' Oder aus C–C allein wird jede PE-Verformung abgeleitet beziehungsweise der gegebene beobachtete Unterschied wird geleugnet.'
r['zeroCreditEn']+=' Or every PE deformation is inferred from C–C alone, or the supplied observed difference is denied.'
g=next(g for g in profiles['goals'] if g['goalId']==GOAL);beforeGoalSpec=copy.deepcopy(g)
e=next(e for e in g['profile']['expectations'] if e['id']=='e2')
e['observablePerformanceDe']+=' Vergleicht zusätzlich die bereitgestellten Eigenschaftsbeobachtungen von rückstellendem vernetztem PDMS und bleibend verformtem PE bei gleichen Bedingungen; leitet keine universelle Eigenschaft allein aus der Rückgratbezeichnung ab.'
e['observablePerformanceEn']+=' Also compares supplied property observations of recovering crosslinked PDMS and permanently deformed PE under equal conditions; infers no universal property solely from the backbone label.'
brief=next(b for b in g['profile']['applicationCaseBriefs'] if b['id']==case['caseId'])
for target,key in [('taskDemandDe','taskDe'),('taskDemandEn','taskEn'),('expectedPerformanceDe','modelAnswerDe'),('expectedPerformanceEn','modelAnswerEn')]:brief[target]=case[key]
brief['understandingFocusDe']=' / '.join(r['criterionDe'] for r in case['rubric'])
brief['understandingFocusEn']=' / '.join(r['criterionEn'] for r in case['rubric'])
g['reason']='Targeted unreviewed author successor for the independent B property-comparison finding. Complete case 2 now explicitly demands and grades observed PDMS recovery versus PE permanent deformation under equal test conditions, while preserving formation, balanced tetramer, molecular comparison, network reasoning and bounded conclusions. Exact case 1 remains a bounded supporting case, not the sole full property-comparison demonstration. The unchanged child2 whole profile/cases and original source/goal/image bodies retain their previous bindings. E0/G0 remains design only; independent A/B acceptance is required.'
for old,new in zip(beforeCases['cases'],cases['cases']):
 if old['caseId']!=case['caseId']:assert object_bytes(old)==object_bytes(new)
for k in beforeCase:
 if k not in ['taskDe','taskEn','modelAnswerDe','modelAnswerEn','rubric']:assert beforeCase[k]==case[k]
assert beforeCase['rubric'][0]==case['rubric'][0];assert beforeCase['rubric'][2]==case['rubric'][2]
assert beforeCases['cases'][0]==cases['cases'][0]
assert object_bytes(beforeProfiles['goals'][1])==object_bytes(profiles['goals'][1])
assert beforeGoalSpec['profile']['applicationCaseBriefs'][0]==g['profile']['applicationCaseBriefs'][0]
afterCaseCarrier=write('candidate/four-whole-cases.property-comparison-author-successor.json',cases)
afterProfileCarrier=write('candidate/two-whole-profiles.property-comparison-author-successor.json',profiles)
cas=write('CAS.one-whole-case-two-carriers-and-child1-profile.author.json',{'schemaVersion':1,'status':'HOLD targeted author successor pending independent A/B','finding':bind(B/'P.two-child-design-decisions.independent-b.actual.json'),'beforeCaseCarrier':bind(casepath),'afterCaseCarrier':bind(afterCaseCarrier),'beforeProfileCarrier':bind(profilepath),'afterProfileCarrier':bind(afterProfileCarrier),'changedCaseId':case['caseId'],'beforeWholeCase':beforeCase,'afterWholeCase':case,'beforeWholeChild1ProfileSpec':beforeGoalSpec,'afterWholeChild1ProfileSpec':g,'wholeCase1ExactSerializedSHA256':object_sha(cases['cases'][0]),'unchangedWholeChild2ProfileSpecSHA256':object_sha(profiles['goals'][1]),'unchangedChild2WholeCases':[{'caseId':c['caseId'],'sha256':object_sha(c)} for c in cases['cases'][2:]],'case1CoverageBoundary':'The old exact case1 author design claim is retained as historical unchanged content; this successor expressly does not use case1 alone as evidence of the full carbon-polymer property comparison. The corrected whole case2 is the full-demand design for that facet.','case2AllOriginalDataBalanceAndOtherRubricsUnchanged':True,'goalSourceGraphSemanticMemoryOrImagesChanged':False,'newStrictCompletions':0,'newIndependentVotes':0,'humanApproval':False,'activeWrites':False})
inputs=[casepath,profilepath,BASE/'SEAL.finite-e560-two-child-source-preserving-author.actual.json',BASE/'candidate/two-whole-children-and-exact-parent-terminal-CAS.author.json',B/'P.two-child-design-decisions.independent-b.actual.json',B/'SEAL.finite-independent-b-source-A-M-P.actual.json']
write('INPUT.exact-original-case-profile-and-finding-bindings.json',{'schemaVersion':1,'inputBindings':[bind(p) for p in inputs],'oldAuthorRootOverwritten':False})
print(json.dumps({'status':'HOLD author correction only','childGoalId':GOAL,'caseId':case['caseId'],'case1ByteContentPreserved':True,'child2WholeContentPreserved':True,'independentVotes':0,'newStrictGain':0}))
