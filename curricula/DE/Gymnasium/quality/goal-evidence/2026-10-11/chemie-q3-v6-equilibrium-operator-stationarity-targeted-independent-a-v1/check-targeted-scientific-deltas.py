import pathlib,json,hashlib,datetime
B=pathlib.Path(__file__).resolve().parent
S=B.parent/'chemie-q3-equilibrium-operator-stationarity-targeted-author-20261011-v6'
V5=B.parent/'chemie-q3-potential-interval-transfer-boundary-P3-native-author-successor-20261011-v5'
def read(p):return json.loads(p.read_text())
def diff(a,b,p=''):
 if a==b:return []
 if isinstance(a,dict) and isinstance(b,dict):return [d for k in sorted(set(a)|set(b)) for d in diff(a.get(k),b.get(k),p+'/'+k)]
 if isinstance(a,list) and isinstance(b,list) and len(a)==len(b):return [d for i,(x,y) in enumerate(zip(a,b)) for d in diff(x,y,p+'/'+str(i))]
 return [{'path':p,'before':a,'after':b}]
j=read(S/'inputs/neutral-whole-three-goals398-P3-sixcases-plus-chemical-evidence.author.join.json')
old={c['caseId']:c for c in read(V5/'cases6.current398.whole-science-current-PNG-context.json')['cases']}
new=[c for g in j['goals'] for c in g['completeSixCases']]
assert len(new)==6
changes=[]
for c in new:
 a={k:v for k,v in old[c['caseId']].items() if k!='wholeCurrentGoal'};b={k:v for k,v in c.items() if k!='wholeCurrentGoal'}
 ds=diff(a,b)
 if c['caseId']!='q3-01-b':assert not ds,c['caseId']
 changes += [dict(d,caseId=c['caseId']) for d in ds]
assert {d['caseId'] for d in changes}=={'q3-01-b'}
assert len(changes)==6
c884=j['goals'][2]
assert c884['completeSixCases']==[old['q3-12-a'],old['q3-12-b']]
oldP={r['goalId']:r for r in [json.loads(l) for l in (V5/'positive/P3.current398-three-PNG.author.pending.review.jsonl').read_text().splitlines()]}
for g in j['goals'][1:]:assert g['completePositiveRecord']['profile']==oldP[g['wholeProposedGoal']['id']]['profile']
c=j['goals'][0]['additionalWholeChemicalEvidenceCase']
assert c['experimentalEvidenceContract']['authenticDocumentedChemicalEvidenceSupplied'] is False
assert c['experimentalEvidenceContract']['performedExperiment'] is False
assert c['sourceDutyBoundary']['sourceOperatorCompleted'] is False
assert c['scoring']['maximumPoints']==sum(r['points'] for r in c['scoring']['criteria'])==12
profile=j['goals'][0]['completePositiveRecord']['profile']
assert 'duty-chemical-experimental-evidence' in profile['coverageExpectations']['requiredExpectationIds']
for lang in ['De','En']:
 b=next(r for r in profile['applicationCaseBriefs'] if r['id']=='q3-01-a')
 assert ('Routine' in b['understandingFocusDe'] if lang=='De' else 'routine recheck' in b['understandingFocusEn'])
x={'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'result':'PASS','oldWholeSixCasesActualBoundPath':str(V5/'cases6.current398.whole-science-current-PNG-context.json'),'wholeFiveOtherScientificCaseBodiesExact':True,'wholeC884BothCasesExactIncludingGoalWrapper':True,'whole8beProfileScientificBodyExact':True,'wholeC884ProfileScientificBodyExact':True,'onlyExistingCaseScientificDeltaId':'q3-01-b','sixActualChangedFields':changes,'additionalChemicalEvidenceCaseHasTwelvePointScoring':True,'authenticMethodProcedureObservationsSupplied':False,'performedExperiment':False,'q3_01_aRoutineOnly':True,'syntheticMaximumScoreCannotCloseExperimentalOperator':True,'sourceUnionApproval':False,'humanApproval':False}
(B/'checks.independent-targeted-full-case-profile-deltas.actual.json').write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
print('PASS five unchanged scientific case bodies, exact battery cases, exact voltage/battery profiles; six q3-01-b field deltas, explicit routine/authentic boundaries.')
