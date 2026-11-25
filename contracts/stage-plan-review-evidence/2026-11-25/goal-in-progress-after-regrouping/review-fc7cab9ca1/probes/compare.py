"""Compare the unchanged H2 method outputs across all three exact revisions."""
import hashlib
import json
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

root = Path(__file__).resolve().parents[1]
first = root.parent
base = "53fd44c88b4da1380297112d3e2f67b1bab65980"
initial = "1431a79dbea806dfed00a268b0b2bec4e58f7faa"
final = "fc7cab9ca11e795a982081af293eff3e357f5551"
def read_json(path):
    return json.loads(path.read_bytes())
def write_json(name, obj):
    (root / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
def xml_samples(probe, marker, cases, measurements):
    path, = (root / 'raw/functional').glob('*.' + probe + '.xml')
    suite = ET.parse(path).getroot()
    assert int(suite.get("tests")) == cases
    assert all(int(suite.get(k)) == 0 for k in ('errors', 'failures', 'skipped'))
    rows = [json.loads(line.split(marker, 1)[1]) for line in suite.findtext("system-out", "").splitlines() if marker in line]
    assert len(rows) == measurements
    return rows

previous = first / 'independent-review.actual.json'
assert hashlib.sha256(previous.read_bytes()).hexdigest() == '328c49d0315d86786371f3b0bb1811258a61271662dc908a6b318faf5b178d34'
for artifact in read_json(previous)['artifacts']:
    data = (first / artifact['path']).read_bytes()
    assert len(data) == artifact['bytes'] and hashlib.sha256(data).hexdigest() == artifact['sha256']
new = xml_samples("ProgressReviewProbe", "REVIEWB_TASK_E ", 8, 8)
surfaces = xml_samples("FocusSurfacesProbe", "GOAL_SURFACE_MEASUREMENT=", 2, 4)
def normalize(r):
    result = dict(r)
    c = result.pop('completion') or {}
    card = result.pop('cardStep') or {}
    result.update(completionSummary={k:v for k,v in c.items() if k in ('status','profileId','directAssessmentRunning','mode','route')},
        completionOptions=[o.get('id') or o.get('profileId') for o in c.get('profileOptions',[])],
        completionCounts={k:c.get(k) for k in ('pendingTargetCount','requiredAssessmentCount','targetCount','planningCreditGoalIds') if c},
        assessmentOrder=[a.get('goalId') or a.get('assessmentGoalId') for a in c.get('assessments',[])],
        cardNumbers={k:card.get(k) for k in ('boxCards','dueCards','proposeCheck')},cardStepKeys=sorted(card),
        coachState={k:v for k,v in (result['coachState'] or {}).items() if k in ('requiredAction','state')})
    return result
surfaces = [normalize(r) for r in surfaces]
for rows in (new, surfaces):
    strip_pilot = lambda p: sorted(json.dumps({k:v for k,v in r.items() if k != 'pilot'},sort_keys=True) for r in rows if r['pilot'] == p)
    assert strip_pilot(False) == strip_pilot(True)
write_json("runtime.actual.json", {'commit': final, 'tests':8, 'pilotOutcomesEqual':True,'samples':new})
write_json("surfaces.actual.json", {final:{'testCases':2, 'pilotOutcomesEqual':True, 'rows':surfaces}})
old_runtime = read_json(first / 'reviewer-b/runtime.actual.json')
old_surfaces = read_json(first / 'surfaces.actual.json')
comparisons = {}
for key, rows, sur in ((base, old_runtime['parent']['samples'], old_surfaces[base]['rows']),
                       (initial, old_runtime['candidate']['samples'], old_surfaces[initial]['rows']),
                       (final, new, surfaces)):
    rows = [r for r in rows if r['pilot'] is False]
    both = [r for r in sur if not r['pilot']]
    moved, control = [next(r for r in both if (r['storedCursor'] != 'none') is flag) for flag in (True,False)]
    direct = next(r for r in rows if r['case']=='direct-and-backup')
    stale = next(r for r in rows if r['case']=='global-and-ordinary-backup')
    comparisons[key] = {
      'movedOrdinary': {r['goal']:{'coachState':r['coach']['state'], 'cockpitActive':r['cockpit']['active'],
            'chosen':r['cockpit']['goalList'],'freshStartRejected':r['freshStartRejected'],'passAfterCockpit':r['coachPassAfterCockpit'],
            'mastery':r['masteryAfterCockpitThenPass'],'activeAfterPassAttempt':r['afterPassAttempt']['storedActive']}
           for r in rows if r['case']=='moved'},
      'directAssessment':{k:direct[k] for k in ('focus','goal','sourceStoredFocus','exportedFocus','restoredFocus','restoredActive','foreignEvaluationDenied')},
      'directOwner':direct['owner']['active'],'directForeign':direct['foreign']['active'],'activeAfterLeave':direct['afterLeave']['active'],
      'backupMoved':{'sourceStored':stale['storedFocusWhenBackedUp'],'export':stale['exportedFocus'],
           'restored':stale['restored']['storedFocus'],'firstRestoredStateActive':stale['restored']['active']},
      'unboundGlobal':{'visible':stale['globalVisible'],'inE1':stale['globalUnderE1'],'coach':stale['globalCoach']['active'],'afterState':stale['globalCockpit']['storedActive']},
      'visible':{k:moved[k] for k in ('storedFocus','learnerStateFocus','effectiveFocus','navigation','completionOptions','assessmentOrder','completionCounts','cardNumbers','requiredOrientationForMoved')},
      'matchesNoCursor':{k:moved[k]==control[k] for k in ('storedFocus','learnerStateFocus','effectiveFocus','navigation','completionOptions','assessmentOrder','completionCounts','cardNumbers','requiredOrientationForMoved')},
      'controlMatchesBase': None,
    }
    base_control = next(r for r in old_surfaces[base]['rows'] if r['storedCursor']=='none' and r['pilot'] is False)
    comparisons[key]['controlMatchesBase'] = control==base_control
write_json('comparison.actual.json', comparisons)

basis, prior, corrected = (comparisons[k] for k in (base, initial, final))
for item in (basis, prior, corrected):
    assert item['controlMatchesBase']
    assert item['directOwner'] == item['directAssessment']['goal'] and item['directForeign'] is None
    assert item['directAssessment']['foreignEvaluationDenied'] and item['activeAfterLeave'] is None
    assert item['visible']['assessmentOrder'] == basis['visible']['assessmentOrder']
    assert len(item['visible']['assessmentOrder']) == 95
    assert item['visible']['completionCounts'] == basis['visible']['completionCounts']
    assert item['visible']['cardNumbers'] == basis['visible']['cardNumbers']
    assert item['visible']['requiredOrientationForMoved'] is None
    assert all(row['freshStartRejected'] for row in item['movedOrdinary'].values())
assert corrected['directAssessment']==basis['directAssessment'] and corrected['backupMoved']==basis['backupMoved']
assert len(prior['directAssessment']['exportedFocus'])==2 and len(prior['backupMoved']['restored'])==2
assert corrected['visible']==basis['visible']
assert [len(x['visible']['navigation']) for x in (basis,prior,corrected)] == [4,5,4]
assert [len(x['visible']['completionOptions']) for x in (basis,prior,corrected)] == [6,7,6]
assert corrected['unboundGlobal']==basis['unboundGlobal'] and corrected['unboundGlobal']['afterState'] is None
assert prior['unboundGlobal']['afterState']==prior['unboundGlobal']['coach'] and prior['unboundGlobal']['coach'] is not None
for goal in corrected['movedOrdinary']:
    assert not basis['movedOrdinary'][goal]['passAfterCockpit']
    for item in (prior,corrected):
        row=item['movedOrdinary'][goal]
        assert row['coachState']=='TEACHING' and row['cockpitActive']==goal
        assert row['passAfterCockpit'] and row['mastery']==1.0 and row['activeAfterPassAttempt'] is None
