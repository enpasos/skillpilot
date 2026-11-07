import sys,json,hashlib,copy,gzip
from pathlib import Path
W=Path(__file__).parent;J=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode();H=lambda b:hashlib.sha256(b).hexdigest();read=lambda f:json.loads((W/f).read_bytes());a=read('baseline-native-scope.json');b=read('candidate-native-scope.json');p=read('proposal.json');d0=read('baseline.json');d1=read('candidate.json');expectedIds={x['guardGoalId']for x in p['operations']}
deltas=[]
for i,(u,v)in enumerate(zip(d0['goals'],d1['goals'])):
 if u!=v:
  assert u['id']==v['id'] and u['id']in expectedIds
  aa=copy.deepcopy(u);aa['requires']=v['requires'];assert aa==v
  assert v['requires']==[r for r in u['requires']if r!='b76a024a-55a6-5c77-85cd-b37ef10e5197']
  deltas.append({'goalId':u['id'],'index':i,'field':'requires','before':u['requires'],'after':v['requires']})
assert len(deltas)==6 and len(d0['goals'])==len(d1['goals'])==512
s0=copy.deepcopy(d0);s0['goals']=d1['goals'];assert s0==d1
held=p['heldCase']['goalId'];assert next(x for x in d0['goals']if x['id']==held)==next(x for x in d1['goals']if x['id']==held)
assert a['views']==b['views'];assert a['foreignApplicability']==b['foreignApplicability'];assert a['routes']==b['routes'];assert a['atomicity']==b['atomicity'];assert a['memory']==b['memory'];assert a['fingerprints']==b['fingerprints'];assert a['codePins']==b['codePins']
# Exact finding identity comparison, while preserving witnesses separately in original reports.
identity=lambda row:{k:v for k,v in row.items()if k!='witness'}
key=lambda row:json.dumps(identity(row),ensure_ascii=False,sort_keys=True)
af={key(r):r for r in a['strict']['findings']};bf={key(r):r for r in b['strict']['findings']};removed=[af[k]for k in sorted(af.keys()-bf.keys())];added=[bf[k]for k in sorted(bf.keys()-af.keys())];assert not added and len(removed)==6 and {r['goalId']for r in removed}==expectedIds and all(r['ruleId']=='G17'for r in removed)
counts=lambda report:{check['id']:{'status':check['status'],'findings':check['findingCount']}for check in report['checks']}
ca,cb=counts(a['strict']),counts(b['strict']);assert ca['G17']['findings']==122 and cb['G17']['findings']==116;assert ca['G01a']==cb['G01a'];assert all(ca[k]==cb[k]for k in ca if k!='G17')
app0,app1=a['applicability'],b['applicability'];assert app0['findings']==app1['findings'];go0={r['goalId']:r for r in app0['goals']};go1={r['goalId']:r for r in app1['goals']};evChanges=[]
for gid in go0:
 u,v=go0[gid],go1[gid];assert {k:z for k,z in u.items()if k!='evidence'}=={k:z for k,z in v.items()if k!='evidence'}
 if u['evidence']!=v['evidence']:
  assert gid=='b76a024a-55a6-5c77-85cd-b37ef10e5197';k0={json.dumps(r,sort_keys=True):r for r in u['evidence']};k1={json.dumps(r,sort_keys=True):r for r in v['evidence']};assert not k1.keys()-k0.keys();removedEv=[k0[k]for k in sorted(k0.keys()-k1.keys())];assert len(removedEv)==96 and all(r['kind']=='requires-closure'for r in removedEv);evChanges.append({'goalId':gid,'removedEvidenceRows':len(removedEv),'addedEvidenceRows':0,'removed':removedEv})
assert len(evChanges)==1
foreign0={r['landscapeId']:r for r in a['foreignStrict']};foreign1={r['landscapeId']:r for r in b['foreignStrict']};foreignChanges=[];unchanged=[]
for oid,u in foreign0.items():
 v=foreign1[oid]
 if u==v:unchanged.append(oid);continue
 assert oid=='a0e13c56-c25f-4742-9272-3a1a603ee52e';f0={json.dumps(r,sort_keys=True):r for r in u['findings']};f1={json.dumps(r,sort_keys=True):r for r in v['findings']};loss=[f0[k]for k in sorted(f0.keys()-f1.keys())];gain=[f1[k]for k in sorted(f1.keys()-f0.keys())];assert len(loss)==6 and not gain and {r['goalId']for r in loss}==expectedIds;foreignChanges.append({'landscapeId':oid,'removedIdentities':loss,'addedIdentities':gain,'checksBefore':u['checks'],'checksAfter':v['checks']})
assert len(unchanged)==19 and len(foreignChanges)==1
sameWitness=sum(af[k].get('witness')==bf[k].get('witness')for k in af.keys()&bf.keys());changedWitnesses=[{'identity':identity(af[k]),'before':af[k].get('witness'),'after':bf[k].get('witness')}for k in sorted(af.keys()&bf.keys())if af[k].get('witness')!=bf[k].get('witness')]
result={'sourceBeforeSha256':H((W/'baseline.json').read_bytes()),'sourceAfterSha256':H((W/'candidate.json').read_bytes()),'sourceGoalCount':512,'onlySixRequiresArraysChanged':True,'fieldDeltas':deltas,'heldFifthWholeGoalUnchanged':True,'sixNativeRemovedFindingIdentities':removed,'nativeAddedFindingIdentities':added,'nativeChecksBefore':ca,'nativeChecksAfter':cb,'remainingFindingWitnessesUnchanged':sameWitness,'remainingWitnessChanges':changedWitnesses,'nativeViews':len(a['views']),'nativeFilterCases':sum(len(v['variants'])for v in a['views']),'allViewsTargetsSupportTreesCompilerFindingsAndDirectGuardsExactlyEqual':True,'all512ApplicabilityValuesExactlyEqual':len(go0)==512,'applicabilityFindingsUnchanged':True,'applicabilityEvidenceDelta':evChanges,'allForeignApplicabilityEqual':True,'foreignGraphReportsExactlyUnchanged':unchanged,'foreignGraphReportChanges':foreignChanges,'routeProfileResultsExactlyEqual':True,'atomicityExactlyEqual':True,'memoryExactlyEqual':True,'selectedFingerprintsExactlyEqual':True,'codePinsEqual':True,'runtimeLimit':'Native TS composition/applicability/filter/route/strict-auditor execution only; no new LearnerService scope census or M6/M7 pass.'}
(W/'native-comparison.json').write_bytes(J(result));print(json.dumps({'sourceAfterSha256':result['sourceAfterSha256'],'findingsBefore':len(af),'findingsAfter':len(bf),'removed':len(removed),'added':len(added),'G17':[ca['G17'],cb['G17']],'G01a':ca['G01a'],'views':result['nativeViews'],'filterCases':result['nativeFilterCases'],'foreignExact':len(unchanged),'remainingWitnessChanges':len(changedWitnesses)}))
