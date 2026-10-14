# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib
R=Path('/home/enpasos/projects/skillpilot');O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-NAT9-current419-isolated-integration-technical-20261014-v1');P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-NAT31-nine-reviewed-children-four-parent-clusters-current414-minimal-author-integration-proposal-20261014-v1');E12=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
def read(p):return json.loads((R/p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256((R/p).read_bytes()).hexdigest()
def bind(p):return {'path':str(p),'sha256':sha(p),'bytes':(R/p).stat().st_size}
def diff(a,b,path=''):
 if type(a)!=type(b):return [{'path':path,'before':a,'after':b}]
 if isinstance(a,dict):return [d for k in sorted(set(a)|set(b)) for d in diff(a.get(k),b.get(k),path+'/'+k)]
 if isinstance(a,list):
  if len(a)!=len(b):return [{'path':path,'before':a,'after':b}]
  return [d for i,(aa,bb) in enumerate(zip(a,b)) for d in diff(aa,bb,path+'/'+str(i))]
 return [] if a==b else [{'path':path,'before':a,'after':b}]
current=read(O/'native-nine-current/bundle/book-model.json');cur={p['goalId']:p for p in current['pages']}
oldmodels=[E12/'chemie-q2-naturstoffe-current402-author-20261012-v2/native'/f'batch-{i}/book-model.json' for i in [1,2]]+[E12/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6/native'/f'targeted-batch-{i}/book-model.json' for i in [1,2]]
rows=[]
for p in oldmodels:
 old=read(p)
 for page in old['pages']:
  if page['goalId'] not in cur:continue
  now=cur[page['goalId']];deltas=diff(page,now)
  rows.append({'goalId':page['goalId'],'originalModel':bind(p),'originalGoalFingerprint':page['goalFingerprint'],'currentGoalFingerprint':now['goalFingerprint'],'originalPageFingerprint':page['pageFingerprint'],'currentPageFingerprint':now['pageFingerprint'],'wholeCurrentPageExact':page==now,'allExactFieldDeltas':deltas,'wholeOriginalPage':page,'wholeCurrentPage':now})
# Bind full actual original runs/streams in owned manifest; don't slice or rewrite originals.
hist=read(P/'history/whole-original-native-A-B-v2-v3-run-record-bindings.NO-CURRENT-D-CLAIM.json')
for b in hist['fullOriginalFiles']:assert sha(b['path'])==b['sha256'],b['path']
(R/O/'history/full-sixteen-original-native-run-record-bindings.verified-unsliced.actual.json').write_text(json.dumps(hist,ensure_ascii=False,indent=2)+'\n')
result={'schemaVersion':1,'technicalOnly':True,'originalCurrentPageContextComparison':rows,'currentNativeNineModel':bind(O/'native-nine-current/bundle/book-model.json'),'allOriginalSixteenFilesPreservedUnmodified':True,'currentDescriptionVotesCreated':0,'wholeCurrentPageExactCount':sum(r['wholeCurrentPageExact'] for r in rows),'boundedCurrentDReviewRequiredForNonidenticalContext':True,'noOldHashesRetagged':True}
(R/O/'checks/D9.original-v2-v3-versus-current419.whole-native-context-exact-deltas.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
for r in rows:print(r['goalId'][:8],r['originalModel']['path'].split('/')[-2],len(r['allExactFieldDeltas']),sorted(set('/'.join(d['path'].split('/')[:2]) for d in r['allExactFieldDeltas'])))
