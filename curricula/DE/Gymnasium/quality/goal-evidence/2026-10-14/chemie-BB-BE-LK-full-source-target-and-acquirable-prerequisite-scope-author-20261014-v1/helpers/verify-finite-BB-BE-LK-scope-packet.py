from pathlib import Path
import json,hashlib
root=Path.cwd()
r=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-BB-BE-LK-full-source-target-and-acquirable-prerequisite-scope-author-20261014-v1'
seal=json.load(open(r/'SEAL.finite-BB-BE-LK-source-scope-author-DRAFT-HOLD.actual.json'))
for x in seal['files']:
 p=root/x['path'];assert p.is_file();assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==x['rawSHA256']
source=json.load(open(r/'AUTHOR.all406-original-source-duties-with-whole-target-contributions-and-choice-conditions.actual.json'))['sourceCells'];assert len(source)==406;assert len({(x['jurisdiction'],x['sourceGoalId']) for x in source})==406
for state in ['DE-BB','DE-BE']:
 rows=[x for x in source if x['jurisdiction']==state];assert len(rows)==203;assert sum(x['wholeOriginalSourceCell']['topicCode'].startswith('3.2.') for x in rows)==138
actual=json.load(open(r/'checks/actual-stock-Java-DRAFT-HOLD-target-and-prerequisite-paths.json'))['scopeMeasurements'];assert len(actual)==4
for x in actual:
 assert not x['missingDirectCanonicalRequirements'];assert not x['f85Target'];assert not x['f85PrerequisiteOnly']
 for c in x['existingClusterPrerequisiteAcquisition']:assert c['allDirectChildrenActualTarget'] and c['actualAggregateMasteryIfAllTargetChildrenMastered']==1.0 and c['syntheticScenarioOnlyNotLearnerEvidence']
f=json.load(open(r/'FINAL.finite-BB-BE-LK-scope-DRAFT-and-real-source-HOLDs.actual.json'));assert f['status'].startswith('SOURCE/WHOLE COURSE SCIENCE HOLD');assert f['newIndependentVotes']==0;assert f['activeWrites']==False
print(json.dumps({'filesVerified':len(seal['files']),'originalCells':406,'mandatoryQPerState':138,'conditionalEPerState':65,'actualScopeCases':4,'missingDirectRequires':0,'scientificStatus':'HOLD','sourceOrNativeVotes':0}))
