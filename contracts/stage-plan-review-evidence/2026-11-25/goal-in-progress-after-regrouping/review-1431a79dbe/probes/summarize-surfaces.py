import json
from pathlib import Path
from xml.etree.ElementTree import parse
root=Path(__file__).resolve().parents[1]
result={}
for path in sorted((root/'raw/surfaces').glob('*.xml')):
    tests=parse(path).getroot()
    assert int(tests.attrib['tests'])==2 and all(int(tests.attrib[k])==0 for k in ['failures','errors','skipped'])
    rows=[json.loads(line.split('GOAL_SURFACE_MEASUREMENT=',1)[1]) for line in tests.findtext('system-out','').splitlines() if 'GOAL_SURFACE_MEASUREMENT=' in line]
    assert len(rows)==4
    for row in rows:
        summary=row.pop('completion')
        row['completionSummary']={k:v for k,v in (summary or {}).items() if k in ['status','profileId','directAssessmentRunning','mode','route']}
        row['completionOptions']=[o.get('id') or o.get('profileId') for o in (summary or {}).get('profileOptions',[])]
        row['completionCounts']={k:summary.get(k) for k in ('pendingTargetCount','requiredAssessmentCount','targetCount','planningCreditGoalIds') if summary}
        row['assessmentOrder']=[a.get('goalId') or a.get('assessmentGoalId') for a in (summary or {}).get('assessments',[])]
        card=row.get('cardStep') or {}
        row['cardNumbers']={k:card.get(k) for k in ('boxCards','dueCards','proposeCheck')}
        row['cardStepKeys']=sorted((row.pop('cardStep') or {}).keys())
        row['coachState']={k:v for k,v in (row['coachState'] or {}).items() if k in ('requiredAction','state')}
    result[path.stem]={'testCases':2,'rows':rows}
assert len(result)==2
print(json.dumps(result,indent=2,sort_keys=True))
