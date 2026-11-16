import datetime, hashlib, json, math, pathlib

src = pathlib.Path('tmp/pr159-by-electrical-acquisition-20261115')
out = pathlib.Path('tmp/pr159-by-electrical-acquisition-independent-20261115')
candidate = json.loads((src / 'candidate-tasks-v1.json').read_text())
old = {g['id']: g for g in json.loads((src / 'original-input-goals.json').read_text())}
profiles = json.loads((src / 'whole-profiles.json').read_text())
checks = []
def check(name, result, evidence):
    checks.append({'id': name, 'pass': bool(result), 'evidence': evidence})

check('exact-candidate-file-binding', hashlib.sha256((src / 'candidate-tasks-v1.json').read_bytes()).hexdigest() == '223b84c86ae48b6064b4dd10c55916f79f9c11b14bacd68b4ebc2ea77c8f5644', 'Raw file SHA256')
g1, g2 = candidate['goals']
check('exact-assigned-order', [g['id'] for g in candidate['goals']] == ['28884133-b448-5eb2-a589-8907a78d7687', 'd96479ce-5d3e-57e9-83f4-a8ba2e7ddaa8'], 'Candidate order and identities')
check('needs-review-preserved', all(g['examData']['reviewStatus'] == 'needs_review' for g in candidate['goals']), 'No release mutation')
check('narrow-current-bindings', g1['examData']['coveredGoalIds'] == g1['requires'] == ['bbee4c52-4e95-5529-990f-706aa99316a3'] and g2['examData']['coveredGoalIds'] == g2['requires'] == ['1730c01d-8c85-57df-b031-c11e2a0511b1'], 'Only intended whole competency per task')
check('288-task-body-unchanged-except-point-labels', all(g1['examData'][k] == old[g1['id']]['examData'][k].replace('(10 BE)', '(8 BE)').replace('(10 points)', '(8 points)') for k in ['taskContent','taskContentEn']), 'Exact DE/EN string comparison')
check('288-original-solutions-preserved-before-scoring-paragraph', all(g1['examData'][k].startswith(old[g1['id']]['examData'][k] + '\n\n') for k in ['solutionContent','solutionContentEn']), 'Exact DE/EN prefix comparison')
check('288-other-goal-fields-unchanged', {k:v for k,v in g1.items() if k != 'examData'} == {k:v for k,v in old[g1['id']].items() if k != 'examData'}, 'Exact structured comparison')

calculations = {
 '288_A': {'I_2_5_A': (11-5)/(5-2), 'I_5_7_A':(7-11)/(7-5), 'I_2_7_A':(7-5)/(7-2), 'net_charge_2_7_C':7-5},
 '288_B': {'P_pulse_A':6/2,'P_cycle_A':6/(2+4),'R_pulse_A':6/1,'R_cycle_A':6/(1+2),'P_complete_cycles':30/6,'P_elapsed_complete_cycle_s':30/6*(2+4),'R_charge_12_s_C':12/(1+2)*6},
 'd964_A': {'U_BA_V':-240*.25,'phi_B_V':10-240*.25,'positive_deltaE_uJ':2e-6*(-240*.25)*1e6,'positive_W_uJ':-2e-6*(-240*.25)*1e6,'negative_deltaE_uJ':-2e-6*(-240*.25)*1e6,'negative_W_uJ':2e-6*(-240*.25)*1e6,'reverse_U_AB_V':240*.25,'reverse_positive_deltaE_uJ':2e-6*(240*.25)*1e6,'reverse_positive_W_uJ':-2e-6*(240*.25)*1e6,'shifted_phi_A_V':10+80,'shifted_phi_B_V':10-240*.25+80},
 'd964_B': {'straight_distance_m':math.hypot(.06,.08),'parallel_distance_m':.06,'U_QP_V':-1500*.06,'phi_Q_V':-1500*.06,'negative_deltaE_uJ':-4e-6*(-1500*.06)*1e6,'negative_W_uJ':4e-6*(-1500*.06)*1e6,'wrong_full_distance_voltage_magnitude_V':1500*.1,'perpendicular_U_V':-1500*0,'perpendicular_W_uJ':-(-4e-6)*(-1500*0)*1e6},
}
expected = {'288_A':[2,-2,.4,2],'288_B':[3,1,6,2,5,30,24],'d964_A':[-60,-50,-120,120,120,-120,60,120,-120,90,30],'d964_B':[.1,.06,-90,-90,360,-360,150,0,0]}
for key, values in calculations.items():
    check('independent-calculation-'+key, all(math.isclose(a,b,rel_tol=1e-12,abs_tol=1e-12) for a,b in zip(values.values(),expected[key])), values)

counterexamples = []
missing = {
 g1['id']: [
  'Uses counter readings divided by absolute clock times instead of matching net differences and interval durations.',
  'States that negative interval current must be replaced by its magnitude, or omits reference-direction reversal entirely.',
  'Omits the pulse-versus-cycle distinction or excludes the pause when finding cycle averages.',
  'Omits the new unknown charge/time calculation or the complete-cycle limitation.',
 ],
 g2['id']: [
  'Claims field work equals potential-energy change or omits the negative-charge sign decision entirely.',
  'Claims that adding80V to all potentials changes voltage/work, or omits reversal/reference reasoning.',
  'Uses the full10cm to claim150V without field-parallel projection, or omits the independent oblique case.',
  'Omits the perpendicular endpoint prediction or extends one constant E unchanged to a non-uniform field.',
 ],
}
for g in candidate['goals']:
    scoring = g['examData']['scoring']
    check('rubric-step-sum-'+g['id'], sum(s['points'] for s in scoring['steps']) == scoring['maxPoints'] == 16 and scoring['passingPoints'] == 14, 'Four4-point steps; pass14/16')
    for i, statement in enumerate(missing[g['id']]):
        points = [4,4,4,4]; points[i] = 1
        counterexamples.append({'taskId':g['id'],'kind':'constructed-missing-core-upper-bound','step':'k'+str(i+1),'constructedResponseDefect':statement,'maximumStepScores':points,'maximumTotal':sum(points),'passes':sum(points)>=scoring['passingPoints'],'meaning':'Reviewer-constructed counterexample, not an actual learner result; absent whole evidence can receive0, so1 is a conservative bound.'})
    for context, scores in [('A',[0,0,4,4]),('B',[4,4,0,0])]:
        counterexamples.append({'taskId':g['id'],'kind':'constructed-independent-context-omitted','context':context,'maximumStepScores':scores,'maximumTotal':sum(scores),'passes':sum(scores)>=14,'meaning':'No checkable own evidence for two omitted context steps.'})
    for i in range(4):
        scores=[4,4,4,4]; scores[i]=3
        counterexamples.append({'taskId':g['id'],'kind':'constructed-one-minor-error-all-cores-present','step':'k'+str(i+1),'stepScores':scores,'total':sum(scores),'passes':sum(scores)>=14,'meaning':'Only an isolated minor slip; no explicit misconception; consistent follow-through not penalised twice.'})
check('all-missing-core-upper-bounds-fail', all(not x['passes'] for x in counterexamples if x['kind'].startswith('constructed-missing')), 'Every capped step totals at most13<14')
check('either-independent-context-omitted-fails', all(not x['passes'] for x in counterexamples if x['kind']=='constructed-independent-context-omitted'), 'At most8/16')
check('single-minor-error-can-pass-every-step', all(x['passes'] for x in counterexamples if x['kind']=='constructed-one-minor-error-all-cores-present'), '15/16, with all cores present')

for g, filename in [(g1,'charge-pulses-v4.md'),(g2,'voltage-without-capacitance.md')]:
    md=(src/filename).read_text()
    check('md-task-solution-rubric-matches-json-'+g['id'], all(g['examData'][k] in md for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']) and all(s['description'] in md for s in g['examData']['scoring']['steps']), 'All four full texts and all complete bilingual step descriptions contained exactly')

before=json.loads((out/'input-pins.before.json').read_text())
after={'atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'meaning':'After full text review, own calculations and counterexample construction.','files':[]}
for row in before['files']:
    actual=hashlib.sha256(pathlib.Path(row['path']).read_bytes()).hexdigest()
    after['files'].append({'path':row['path'],'sha256':actual,'unchanged':actual==row['sha256']})
check('all-nine-sealed-inputs-unchanged', all(x['unchanged']for x in after['files']), 'Before/after raw-byte hashes')
(out/'input-pins.after.json').write_text(json.dumps(after,indent=2)+'\n')
(out/'calculations-and-counterexamples.actual.json').write_text(json.dumps({'kind':'Reviewer calculations and constructed rubric examples; not learner results','calculations':calculations,'counterexamples':counterexamples},ensure_ascii=False,indent=2)+'\n')
(out/'validation.json').write_text(json.dumps({'atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'allChecksPass':all(x['pass']for x in checks),'checkCount':len(checks),'limits':'Checks substantiate own informed content review; not curriculum projection, official-source, human, learner-result or release acceptance.'},ensure_ascii=False,indent=2)+'\n')
assert all(x['pass']for x in checks)
print(json.dumps({'checks':len(checks),'allPass':True,'constructedCounterexamples':len(counterexamples),'unchangedInputs':len(after['files'])}))
