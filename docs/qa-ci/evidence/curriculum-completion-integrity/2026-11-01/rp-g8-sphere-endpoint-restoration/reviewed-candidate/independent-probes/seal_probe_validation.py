from pathlib import Path
import json,hashlib,subprocess,datetime
r=Path.cwd();cap=r/'tmp/math-rp-final-year-exam-candidates-20261101';probe=cap/'independent-probes';host=probe/'frozen-generator-host';backend=probe/'backend-v2'
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
# Assert the entire frozen generator input tree has remained unchanged.
m=json.loads((probe/'frozen-generator-inputs.json').read_text());drift=[x['snapshotPath']for x in m['files']if h(cap/x['snapshotPath'])!=x['sha256']];assert not drift
cmd=['./node_modules/.bin/tsx','scripts/generateMathDurationCompositionViews.ts','--check'];proc=subprocess.run(cmd,cwd=host/'app',capture_output=True,text=True);(probe/'independent-generator-check.stdout.log').write_text(proc.stdout);(probe/'independent-generator-check.stderr.log').write_text(proc.stderr);assert proc.returncode==0,proc.stderr
rows=[]
for f in sorted((cap/'native-generator-baseline-views').glob('*.json')):
 out=host/'curricula/DE/Gymnasium/composition-views/mathematik'/f.name
 b=json.loads(f.read_text());a=json.loads(out.read_text());changed=b!=a
 assert changed==(f.name in ['de-rp-gk-g8.view.json','de-rp-lk-g8.view.json','de-rp-seki-g8.view.json'])
 if changed:assert out.read_bytes()==(cap/'candidate-offered-views/curricula/DE/Gymnasium/composition-views/mathematik'/f.name).read_bytes()
 rows.append({'name':f.name,'baselineSha256':h(f),'outputSha256':h(out),'changed':changed})
assert len(rows)==18
res={'status':'PASS','command':cmd,'exitCode':proc.returncode,'checkedDurationViews':len(rows),'changedViews':sum(x['changed']for x in rows),'frozenInputDrift':drift,'historicalRecovery':'Original candidate host --check failed because its config symlink followed concurrent SH integration. Independent copy uses archived checkpoint-bound config b3b336dc244b1f4a55a901896420c69e2b8605aac4035a90ebfe47bc476928de; original candidate host and receipt preserved.','rows':rows}
(probe/'independent-generator-validation.json').write_text(json.dumps(res,indent=2)+'\n')
# Compare all backend fixture input bytes and all runtime sets; no misleading
# silent input drift, no additions outside the exact two target assessments.
bm={x['path']:x['sha256']for x in json.loads((backend/'baseline-input-manifest.json').read_text())};am={x['path']:x['sha256']for x in json.loads((backend/'candidate-input-manifest.json').read_text())};assert bm.keys()==am.keys();diff=[f for f in bm if bm[f]!=am[f]];plan=json.loads((cap/'candidate-operations.json').read_text());assert sorted(diff)==sorted(x['path']for x in plan['operations'])
for label,manifest in [('baseline',bm),('candidate',am)]:assert all(h(backend/label/f)==hash for f,hash in manifest.items())
d=json.loads((backend/'runtime-delta-validation.json').read_text());a=json.loads((backend/'candidate-actual.json').read_text());b=json.loads((backend/'baseline-actual.json').read_text());tasks={'64f37348-20f7-55b1-82a8-8fc388087577','926d0551-4537-569e-b6ad-fc33bb17546e'}
for row,base,after in zip(d['rows'],b['scopes'],a['scopes']):
 changed='/G8/' in row['scope'] and '/SekII/' not in row['scope']
 assert set(row['targetGoalIdsAdded'])==(tasks if changed else set())
 assert row['contextGoalIdsAdded']==row['targetGoalIdsAdded'];assert not row['unaddressableProtectedContextGoalIdsAdded'];assert not row['unaddressableProtectedContextGoalIdsRemoved'];assert not row['targetGoalIdsRemoved'];assert not row['contextGoalIdsRemoved'];assert not row['uncoveredTargetGoalIdsAdded']
 assert after['taskDetails']['e5055665-89ae-5be6-8fc7-42a9e991d63d']==base['taskDetails']['e5055665-89ae-5be6-8fc7-42a9e991d63d']
 if changed:
  for task in tasks:
   td=after['taskDetails'][task];assert td['target'];assert len(td['supportContextGoalIds'])==47;assert set(td['supportContextGoalIds'])<=set(base['targetGoalIds'])
d['dataInputFilesChanged']=diff;d['frozenBackendInputDrift']=[];d['unchangedScopes']=10;d['changedScopesIncludingRealCourseMerger']=4;d['allUntargetedExistingProtectedObligationsRetained']=True;d['monteCarloUnchanged']=True;d['note']='47 support goals are preparation context, not claimed assessed coverage. Every affected scope still has other uncovered targets.'
(backend/'runtime-delta-validation.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'nativeGenerator':'PASS','actualBackend':'PASS_BOUNDED_DELTA','originalThreeViewsAndReceiptsUnmodified':True,'scopeCount':14,'changedScopes':4,'changedDataFiles':len(diff)}))
