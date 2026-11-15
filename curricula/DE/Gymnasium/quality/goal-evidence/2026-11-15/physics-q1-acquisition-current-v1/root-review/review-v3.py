import datetime, hashlib, itertools, json
from pathlib import Path

D = Path('tmp/physics-q1-root-nine-review-20261115')
old_path = Path('tmp/physics-q1-current-acquisition-20261115-v1/content-candidate.json')
new_path = Path('tmp/physics-q1-current-acquisition-20261115-v3/content-candidate.json')
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(new_path) == '9bf270c86a09fd40cfe577fc7a0bf11c1016be95faccc62315adbc62c028a3b9'
old, new = [json.loads(p.read_text())['tasks'] for p in [old_path,new_path]]
initial = json.loads((D/'review-v1.actual.json').read_text())
checks = []
for index in range(9):
    a,b = old[index],new[index]
    assert {k:v for k,v in a.items() if k!='examData'} == {k:v for k,v in b.items() if k!='examData'}
    ea,eb = a['examData'],b['examData']
    for key in ea:
        if key not in {'taskContent','taskContentEn','solutionContent','solutionContentEn','scoring','reviewNote'}:
            assert ea[key] == eb[key], (index,key)
    for key in ['taskContent','taskContentEn']:
        if index not in [1,5]:
            assert ea[key] == eb[key]
    for key in ['solutionContent','solutionContentEn']:
        original_body = ea[key].split('\n\nBewertung:')[0].split('\n\nScoring:')[0]
        current_body = eb[key].split('\n\nDE-Schrittregel:')[0].split('\n\nEN step rule:')[0]
        if index == 7:
            original_body = original_body.replace('1,761','1,760').replace('1.761','1.760')
        assert original_body == current_body, (index,key)
    sa,sb = ea['scoring'],eb['scoring']
    assert sa['maxPoints'] == sb['maxPoints'] and sa['passingPoints'] == sb['passingPoints']
    assert len(sa['steps']) == len(sb['steps'])
    for position,(before,after) in enumerate(zip(sa['steps'],sb['steps'])):
        assert before['id'] == after['id'] and before['points'] == after['points'] == 4
        prior_criterion = before['description'].split('\n',1)[1] if before['description'].startswith('Bewertung:') else before['description']
        assert prior_criterion == after['description'].split('\nDE-Schrittregel:',1)[0]
        assert 'höchstens 1 von 4 Punkten' in after['description']
        assert 'AT MOST 1 of 4 points in THIS STEP' in after['description']
        assert 'GESAMTPUNKTZAHL' not in after['description'] and 'cap the TOTAL' not in after['description']
        scores = list(itertools.product(*[range(2) if j==position else range(5) for j in range(len(sb['steps']))]))
        largest = max(map(sum,scores))
        assert largest < sb['passingPoints']
        assert sb['maxPoints']-1 >= sb['passingPoints']
        checks.append({'taskId':b['id'],'stepId':after['id'],'allAdmissibleVectors':len(scores),
                       'maximumWithEssentialOmission':largest,'passingPoints':sb['passingPoints'],
                       'oneMinorErrorWithAllCoresPasses':True})

assert 'Zentrum im Ursprung' in new[1]['examData']['taskContent'] and '(3a,0)' in new[1]['examData']['taskContent']
assert 'centred at the origin' in new[1]['examData']['taskContentEn']
assert 'senkrechte Geschwindigkeitskomponente nach +x' in new[5]['examData']['taskContent']
assert 'perpendicular velocity component points +x' in new[5]['examData']['taskContentEn']
assert f'{900/(.001**2*.0715**2):.3e}' == '1.760e+11'
report = {
    'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer':'/root, independent informed AI content reviewer; not the author of the tasks or v3 implementation',
    'verdict':'ACCEPT_EXACT_NINE_TASK_CONTENT',
    'inputPins':[{'path':str(p),'sha256':sha(p)} for p in [old_path,new_path,D/'review-v1.actual.json']],
    'reviewMethod':'Full original DE/EN/solution/rubric review and eleven whole-goal profiles, followed by exact successor delta inspection. Unchanged main solution text, unchanged individual substantive rubric criteria and unchanged ordinary requires were checked independently.',
    'resolvedFindings':[
        'All essential omissions are limited within the affected runtime scoring step; no independent global-cap operation is assumed.',
        'Separate spherical configurations share their specified centre and observation point, making vector-field comparison determinate.',
        'Both helical-entry cases now specify the initial transverse direction; the stated absolute force direction follows.',
        'Tube run B is correctly rounded to 1.760e11 C/kg in both solutions.'
    ],
    'rows':[{**r,'currentVerdict':'accept'} for r in initial['rows']],
    'independentOmissionSumChecks':checks,
    'independentOriginalNumericalChecks':initial['independentNumericalChecks'],
    'limits':['Only task indices 0-8; tasks 9-26 require the other independent reviewer.',
              'Content acceptance does not prove current CQR, every Land/course acquisition route, plan placement, learner performance or CI.',
              'No old assessment identity, stimulus, scoring or learner result is transferred to these new tasks.'],
    'activeWrites':0,'learnerResultWrites':0
}
(D/'review-v3.ACCEPT.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'acceptedTasks':9,'independentScoringSteps':len(checks),
                  'admissibleIntegerVectors':sum(c['allAdmissibleVectors'] for c in checks),
                  'candidateSha256':sha(new_path),'reviewSha256':sha(D/'review-v3.ACCEPT.actual.json')}))
