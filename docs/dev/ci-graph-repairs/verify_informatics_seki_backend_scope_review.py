"""Read-only replay of archived native projection evidence; no Java/source writes."""
from pathlib import Path
import gzip,hashlib,json
root=Path.cwd();base=root/'docs/dev/ci-graph-repairs';review=json.loads((base/'informatics-seki-backend-scope-independent-review-2026-11-06.json').read_bytes())
def digest(raw):return hashlib.sha256(raw).hexdigest()
for item in review['nativeProducerBindings']:
 assert digest((root/item['path']).read_bytes())==item['sha256'],item['path']
storage=review['nativeStorageInventory'];assert digest((root/storage['path']).read_bytes())==storage['sha256'];inventory=json.loads((root/storage['path']).read_bytes());data={}
for item in inventory['contexts']:
 packed=(root/item['path']).read_bytes();assert digest(packed)==item['gzipSha256'];raw=gzip.decompress(packed);assert len(raw)==item['rawBytes'] and digest(raw)==item['rawSha256'];data[item['context']]=json.loads(raw)
tables={name:{r['key']:r for r in value['rows']} for name,value in data.items()};before=tables['before39-5921'];after=tables['remote93a'];active=tables['active-f95'];assert len(before)==112 and set(before)==set(after)==set(active)
changes=[];stale=[]
for key,b in before.items():
 a=after[key];c=active[key];assert b['countedAtomicTotal']==b['expectedTotal']
 for row in [b,a,c]:assert row['countedAtomicTotal']==len(set(row['countedAtomicTargetGoalIds']))
 for field in ['targetGoalIds','prerequisiteOnlyGoalIds','compositionViewIds','countedAtomicTargetGoalIds','countedAtomicTotal','structuralAtomicTargetGoalIds','structuralAtomicTotal']:assert a[field]==c[field]
 assert b['prerequisiteOnlyGoalIds']==a['prerequisiteOnlyGoalIds'];assert b['compositionViewIds']==a['compositionViewIds']
 lost=set(b['targetGoalIds'])-set(a['targetGoalIds']);gain=set(a['targetGoalIds'])-set(b['targetGoalIds'])
 if lost or gain:
  assert b['subject']=='Informatik';changes.append(key)
  for goalId in lost|gain:assert goalId in {'ca2469f3-3712-5d92-ae7c-ee61d8607efa','dbad1333-5783-57b5-8715-92d725f5c303'}
  for goalId in lost:assert 'memorization' in data['before39-5921']['goalDefinitions'][goalId]['tags']
 if c['countedAtomicTotal']!=c['expectedTotal']:stale.append(key)
assert len(changes)==12 and len(stale)==10
for row in review['allRows']:
 key=row['key'];b=before[key];a=active[key];assert row['removedTargetGoalIds']==sorted(set(b['targetGoalIds'])-set(a['targetGoalIds']));assert row['addedTargetGoalIds']==sorted(set(a['targetGoalIds'])-set(b['targetGoalIds']));assert row['nativeCurrentTotal']==a['countedAtomicTotal']
print(json.dumps({'requestsPerContext':112,'contexts':3,'baselineFixtureMatches':112,'changedTargetSets':len(changes),'staleTotals':len(stale),'ordinaryTargetLosses':0,'93aToF95SetChanges':0,'boundary':'Archived native evidence replay only; no new HTTP/persistence/integration-suite or maturity acceptance.'}))
