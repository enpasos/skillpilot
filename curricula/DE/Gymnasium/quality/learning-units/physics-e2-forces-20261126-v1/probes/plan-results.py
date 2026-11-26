"""Reduce the H2 probe outputs to the observable plan contract. Takes the Gradle scratch directory."""
import json
import sys
from pathlib import Path

folder = Path(sys.argv[1])
mixed = '22561c66-3957-5d55-b07a-25de1f359930'
policy = []
for file in sorted(folder.glob('*-pilot-*-explicit-*.actual.json')):
    case = json.loads(file.read_bytes())
    old = case['before']['blocks'][0]['atomicGoalIds']
    effective = case['after']['blocks'][0]['atomicGoalIds']
    fresh = case['freshSaved']['blocks'][0]['atomicGoalIds']
    lost = sorted(set(old) - set(effective))
    changes_old_plan = case['course'] == 'GK' and case['pilot'] and not case['explicitExamSelection']
    assert lost == ([mixed] if changes_old_plan else [])
    assert set(effective) == set(case['afterDue']) == set(fresh)
    assert set(old) == set(case['beforeDue'])
    assert case['persistedBytesEqual'] and case['persistedRevisionEqual'] and case['backupLearningPlansEqual']
    assert not case['before']['stale'] and not case['after']['stale']
    policy.append({'course':case['course'], 'unitPilot':case['pilot'], 'explicitExam':case['explicitExamSelection'],
                   'originalCount':len(old),'existingEffectiveCount':len(effective),'existingDueCount':len(case['afterDue']),
                   'freshSavedCount':len(fresh),'mixedInFreshPlan':mixed in fresh,'lostFromExistingPlan':lost,
                   'storedBytesRevisionAndBackupEqual':True,'existingPlanStale':False})

controls = []
for file in sorted(folder.glob('selection-only-*.actual.json')):
    case = json.loads(file.read_bytes())
    old = case['oldRead']['blocks'][0]['atomicGoalIds']
    fresh = case['fresh']['blocks'][0]['atomicGoalIds']
    explicit = case['explicitOffer']['blocks'][0]['atomicGoalIds']
    assert set(old) == set(explicit) == set(fresh) | {mixed}
    assert (len(old),len(fresh),len(explicit)) == (32,31,32)
    assert case['fullResolverStillContainsMixed']
    controls.append({'unitPilot':case['pilot'],'autoPilot':case['autoPilot'], 'oldCount':len(old),
                     'callerFilteredFreshCount':len(fresh),'explicitCount':len(explicit),
                     'fullResolverStillContainsMixed':True})
assert len(policy)==6 and len(controls)==4
print(json.dumps({'mixedExam':mixed,'historicalRead':policy,'newSelectionOnlyControls':controls},indent=2))
