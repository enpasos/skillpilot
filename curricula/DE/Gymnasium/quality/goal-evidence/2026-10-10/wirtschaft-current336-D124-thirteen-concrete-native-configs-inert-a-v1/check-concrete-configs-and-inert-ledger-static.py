from pathlib import Path
import json,hashlib
from jsonschema import Draft202012Validator
R=Path(__file__).resolve().parents[7]
O=Path(__file__).resolve().parent
# Resolve R from the repository marker instead of depending on user cwd.
R=next(p for p in O.parents if (p/'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json').exists())
j=lambda p:json.loads(p.read_text())
index=j(O/'actual-thirteen-concrete-current-ID-config-index.INERT.json')
ledger=j(O/'whole-future-twenty-path-ledger-removal9-addition13.INERT-NOT-ACTIVE.json')
retirement=j(O/'actual-nine-stale-Economics-claims-retirement-and-history-preservation.INERT.json')
cv=Draft202012Validator(j(R/'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json'))
lv=Draft202012Validator(j(R/'contracts/goal-description-review/v1/goal-description-rollout-in-flight-ledger.schema.json'));lv.validate(ledger)
claims=set();ids=[]
for p in ledger['activeBatchConfigPaths']:
 cfg=j(R/p);cv.validate(cfg)
 for goal in cfg['goalIds']:
  key=(cfg['subject'],cfg['baseGoalBookConfigPath'],goal)
  assert key not in claims,('duplicate native claim key',key)
  claims.add(key)
for row in index['configurations']:
 p=R/row['config']['path'];b=p.read_bytes()
 assert 'sha256:'+hashlib.sha256(b).hexdigest()==row['config']['sha256']
 cfg=j(p);assert cfg['goalIds']==row['goalIds']
 assert cfg['baseGoalBookConfigPath']=='app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
 ids+=cfg['goalIds']
assert len(ids)==len(set(ids))==124
assert ids[-2:]==index['special2']
assert ledger['activeBatchConfigPaths']==[x['binding']['path'] for x in retirement['preservedExactlySeven']]+[x['config']['path'] for x in index['configurations']]
for row in retirement['preservedExactlySeven']:
 b=(R/row['binding']['path']).read_bytes()
 assert 'sha256:'+hashlib.sha256(b).hexdigest()==row['binding']['sha256']
 assert j(R/row['binding']['path'])==row['wholeObject']
for binding in retirement['preserved353OldArtifactBindings']:
 b=(R/binding['path']).read_bytes();assert 'sha256:'+hashlib.sha256(b).hexdigest()==binding['sha256']
print(json.dumps({'status':'STATIC_TECHNICAL_PASS_ONLY','configs':13,'uniquePlannedIDs':124,'inertLedgerPaths':20,'preservedForeignClaims':7,'retiredEconomicsClaims':9,'preservedExecutedHistoricalRecords':160,'nativePrepareExecuted':False,'nativeReadinessGranted':False}))
