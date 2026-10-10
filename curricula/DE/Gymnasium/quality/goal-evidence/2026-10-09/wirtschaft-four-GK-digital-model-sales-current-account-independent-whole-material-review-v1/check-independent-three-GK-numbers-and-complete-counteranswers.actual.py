from decimal import Decimal, getcontext
from pathlib import Path
import json, hashlib
getcontext().prec = 40
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
candidate_rel = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/eight-current-national-GK-terminal-rests-material-author-v1/whole-seven-new-GK-materials-and-one-existing-current-account-tag-proposal.DRAFT.readable-and-platform-country-author-successor-v2.json'
candidate_path = ROOT / candidate_rel
candidate_bytes = candidate_path.read_bytes()
assert hashlib.sha256(candidate_bytes).hexdigest() == '21c805434845f7b0eaf3477d848b15bada1f9677e5cb0e967eb967106127e64c'
goals = {g['id']:g for g in json.loads(candidate_bytes)['materials'][4:7]}
checks = []
def check(name, actual, expected, meaning):
    actual = Decimal(actual); expected = Decimal(expected)
    row = {'name':name, 'actual':str(actual), 'expected':str(expected), 'pass':actual == expected, 'meaning':meaning}
    checks.append(row)
    assert row['pass'], row
D = Decimal
check('design payout', D(100)-D(10), 90, 'Agreed customer price100 minus platform fee10, before other costs; not profit.')
check('customer price is not net payout', 100, D(90)+D(10), 'Original price100 remains distinct from net receipt90.')
check('local driver receipt', D(50)-D(5), 45, 'A local ride can have international intermediation; this receipt is before other costs.')
check('backup extra cost margin change', -D(2), -2, 'With other costs fixed, margin falls2; this is not a reduction of customer price or platform payout.')
check('payout unchanged after backup alternative', D(100)-D(10), 90, 'The separately paid technical cost2 does not change the supplied customer/platform settlement.')
check('no-import demand multiplier', D(1)/(D(1)-D('.8')), 5, 'Supplied closed simplified model, not an empirical forecast.')
check('no-import model income impulse million', D(12)/(D(1)-D('.8')), 60, 'Conditional model value cannot establish real next-month output under full construction capacity.')
check('import-extended multiplier', D(1)/(D(1)-D('.8')+D('.2')), D('2.5'), 'Separate specified extended scenario under unchanged other assumptions.')
check('import-extended impulse million', D(12)/(D(1)-D('.8')+D('.2')), 30, 'A model comparison, not observed halving.')
check('fully appropriate trainees', 20, 20, 'Maximum assumed completed and appropriately qualified persons in full-completion scenario.')
check('alternative appropriate completers', D(20)*D('.8'), 16, 'Given fictional80percent completion; not a measured actual completion rate.')
check('full annual capacity upper bound', D(20)*D(10), 200, 'At most200 units of annual capacity with equipment, after training; no guaranteed sales.')
check('alternative annual capacity upper bound', D(20)*D('.8')*D(10), 160, 'At most160 annual capacity units with equipment; demand remains unknown.')
check('continuous digital provision year2 within agreed3', D(3)-D(2), 1, 'Required year2 update lies within agreed three-year digital-provision period; not a lifetime claim.')
for gid,g in goals.items():
    scoring=g['examData']['scoring']
    check(gid+' rubric maximum', sum(s['points'] for s in scoring['steps']), scoring['maxPoints'], 'Actual frozen step totals equal the supplied maximum.')
    assert scoring['passingPoints'] < scoring['maxPoints']
counter_path=HERE/'actual-six-complete-independent-counteranswers-and-individual-rubric-marks.json'
counter_bytes=counter_path.read_bytes()
raw=json.loads(counter_bytes)
graded=[]
for r in raw['counteranswers']:
    g=goals[r['goalId']]
    scoring=g['examData']['scoring']
    assert len(r['answerParts']) == len(scoring['steps']) == len(r['marks']) == 3
    for mark,step in zip(r['marks'],scoring['steps']):
        assert mark['stepId']==step['id']
        assert mark['max']==step['points']
        assert sum(c[1] for c in mark['components'])==mark['awarded']
        assert sum(c[2] for c in mark['components'])==mark['max']
        assert all(0 <= c[1] <= c[2] for c in mark['components'])
    total=sum(m['awarded'] for m in r['marks'])
    graded.append({'caseId':r['caseId'],'goalId':r['goalId'],'individualStepMarks':[m['awarded'] for m in r['marks']], 'total':total,'maximum':scoring['maxPoints'],'passingThreshold':scoring['passingPoints'],'actualPass':total >= scoring['passingPoints'],'observedLearner':False})
report={'role':'actual independent Decimal and fully written counteranswer scoring checks','candidatePath':candidate_rel,'candidateSHA256':hashlib.sha256(candidate_bytes).hexdigest(),'counteranswersPath':str(counter_path.relative_to(ROOT)),'counteranswersSHA256':hashlib.sha256(counter_bytes).hexdigest(),'decimalChecks':checks,'decimalErrorCount':sum(not r['pass'] for r in checks),'independentCounteranswerScores':graded,'counterexampleBypasses':sum(r['actualPass'] for r in graded),'noNewScienceReviewOfOriginal6a5':True}
(HERE/'actual-independent-number-and-counteranswer-scoring-checks.result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'decimalChecks':len(checks),'decimalErrors':report['decimalErrorCount'],'counteranswerScores':graded,'actualBypasses':report['counterexampleBypasses']},ensure_ascii=False,indent=2))

