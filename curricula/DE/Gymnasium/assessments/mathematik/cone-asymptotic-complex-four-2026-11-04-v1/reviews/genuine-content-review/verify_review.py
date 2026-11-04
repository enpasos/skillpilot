from pathlib import Path
import json,hashlib
O=Path(__file__).resolve().parent
I=O.parent/'cone-asymptotic-complex-four-whole-forms-20261104-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
r=json.loads((O/'review-report.json').read_text())
assert r['status']=='PASS_CONTENT_CONDITIONAL' and not r['blockingContentFindings']
assert sha(I/'content-review-handoff.json')==r['input']['handoffSha256']
assert sha(I/'review-input-manifest.json')==r['input']['manifestSha256']
m=json.loads((I/'review-input-manifest.json').read_text())
for e in m['files']:assert sha(I/e['path'])==e['sha256'],e['path']
a=json.loads((O/'independent-mathematics.json').read_text());assert a['count']==65 and len(a['checks'])==65 and a['manualArgumentCount']==2
c=json.loads((O/'independent-rubric-countercases.json').read_text());assert c['count']==16
for e in c['cases']:
 raw=sum(e['reviewerMarksByRubricRow']);assert raw==e['rawTotal']
 total=min(raw,14) if e['wholeCoreActionAbsent'] else raw
 assert total==e['ordinaryTotalAfterCap'] and (total>=15)==e['passesSingle15PointThreshold']
v=json.loads((O/'independent-rendering.json').read_text());assert len(v['results'])==16 and v['visualInspection']['all16ScreenshotsActuallyViewed']
assert sum(e['math'] for e in v['results'])==283
assert sum(e['errors'] for e in v['results'])==0
assert sum(len(e['images']) for e in v['results'] if e['field'].startswith('task'))==0
assert sum(len(e['images']) for e in v['results'])==2
for fn in ['A.content-conditional.jsonl','M.content-conditional.jsonl']:
 rows=[json.loads(s) for s in (O/fn).read_text().splitlines()];assert len(rows)==4
 for e in rows:assert e['approvalScope']=='CONTENT-CONDITIONAL' and e['activationPermitted'] is False
 if fn.startswith('M'):
  assert sum(e['candidateRowForUnchangedContract']['status']=='memory_required' for e in rows)==2
out=O/'review-output-manifest.json'
if out.exists():
 for e in json.loads(out.read_text())['files']:assert sha(O/e['path'])==e['sha256'],e['path']
print(json.dumps({'status':'PASS_BOUNDED_REVIEW_INTEGRITY','authorFrozenFiles':len(m['files']),'contentForms':4,'independentExecutableChecks':65,'independentMathematicalArguments':2,'rubricCases':16,'visuallyInspectedExactFieldScreenshots':16,'conditionalAMEnvelopes':8,'activation':False}))
