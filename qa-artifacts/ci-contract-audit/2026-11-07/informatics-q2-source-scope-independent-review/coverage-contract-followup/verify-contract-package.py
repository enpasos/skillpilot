from pathlib import Path
import hashlib,json,gzip,datetime,sys
HERE=Path(__file__).resolve().parent
PARENT=HERE.parent
ROOT=HERE.parents[4]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text())
contract=read(HERE/'execution-contract.json');inventory=read(HERE/'history-inventory.json')
raw=gzip.decompress((HERE/'historical-informatics-source.json.gz').read_bytes());source=json.loads(raw)
assert hashlib.sha256(raw).hexdigest()==contract['history']['sourceRawSha256']==inventory['historicalRawSourceSha256']
assert sha(HERE/'historical-informatics-source.json.gz')==contract['history']['sourceArchiveSha256']
assert sha(HERE/'history-inventory.json')==contract['history']['inventorySha256']
goals={g['id']:g for g in source['goals']};exams={i:g for i,g in goals.items()if 'examData'in g}
rows=inventory['definitions'];assert len(rows)==24 and len({r['goalId']for r in rows})==24
assert set(exams)=={r['goalId']for r in rows}
parent=read(PARENT/'coverage-gate-counterchecks.json');baseline={r['id']:r for r in parent['baseline']}
for row in rows:
 original=exams[row['goalId']]['examData'];coverage=row['coverage'];has='coveredGoalIds'in original
 assert has==(coverage['state']=='declared')
 if has:
  assert coverage['references']==original['coveredGoalIds']
  assert coverage['resolvedAtomicGoalIds']==baseline[row['goalId']]['resolvedAtomicGoalIds']
 else: assert 'resolvedAtomicGoalIds' not in coverage and 'references'not in coverage
assert sum(r['coverage']['state']=='declared'for r in rows)==14
assert sum(r['coverage']['state']=='undeclared'for r in rows)==10
assert len(contract['testGroups'])==21 and len({r['id']for r in contract['testGroups']})==21
assert len(parent['cases'])==2 and all(c['proposedHardInvariantRejected'] for c in parent['cases'])
assert parent['correctPinPositive']['all24Stable']
assert len(parent['originalNative']['structure']['assessmentValidation']['failingGoalIds'])==6
assert parent['correctPinPositive']['remainingUnrelatedPlaceholderFailures']==5
pins=read(HERE/'input-bindings.json')
for pin in pins['inputs']:assert sha(ROOT/pin['path'])==pin['sha256'],pin['path']
for pin in pins['parentBindings']:assert sha(PARENT/pin['path'])==pin['sha256'],pin['path']
parentseal=read(PARENT/'review-seal.json');assert sha(PARENT/'review-inventory.json')==parentseal['inventorySha256']
for pin in read(PARENT/'review-inventory.json')['files']:assert sha(PARENT/pin['path'])==pin['sha256'],pin['path']
output={'atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'kind':'private package/inventory consistency only; not installed CI or QA acceptance','historyDefinitions':24,'declared':14,'undeclared':10,'unknownNeverNormalizedToEmpty':True,'parentNativeNegatives':2,'parentNativeCoveragePositive':1,'historicalPlaceholderFailuresRetained':6,'candidateOtherPlaceholderFailuresRetained':5,'plannedNotExecutedIntegrationTestGroups':21,'parent23SealedReviewFilesUnchanged':True,'allBoundSourceAndNormInputsExact':True,'activeInformaticsSourceUnchanged':sha(ROOT/inventory['sourcePath'])==inventory['historicalRawSourceSha256']}
if '--write-result' in sys.argv: (HERE/'package-check.json').write_text(json.dumps(output,indent=2)+'\n')
print(json.dumps(output))
