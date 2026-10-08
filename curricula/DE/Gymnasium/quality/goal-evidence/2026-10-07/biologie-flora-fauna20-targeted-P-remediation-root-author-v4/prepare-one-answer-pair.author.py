# SPDX-License-Identifier: Apache-2.0
"""Complete the one independently identified missing leaf-feature justification."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
root = Path.cwd()
own = Path(__file__).resolve().parent
old = own.parent / 'biologie-flora-fauna20-targeted-P-remediation-root-author-v3'
def read(p): return json.loads(p.read_text())
def write(name, value):
    with (own / name).open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
seal = read(old / 'targeted-author-remediation.exact-input-output.freeze.json')
for r in seal['frozenFiles']:
    assert hashlib.sha256((root / r['path']).read_bytes()).hexdigest() == r['sha256']
before_m = read(old / 'twenty-whole-goals-forty-common-DEEN-cases.author-v3.json')
before_p = read(old / 'P20.targeted-two-profiles.author-v3.candidates.json')
m, p = copy.deepcopy(before_m), copy.deepcopy(before_p)
case = m['goals'][8]['cases'][1]
case['modelAnswer']['de'] = case['modelAnswer']['de'].replace('Y zur Linde', 'Y aufgrund der herzförmigen Blattfläche zur Linde')
case['modelAnswer']['en'] = case['modelAnswer']['en'].replace('Y linden', 'Y to linden through its heart-shaped blade')
assert case['modelAnswer'] != before_m['goals'][8]['cases'][1]['modelAnswer']
brief = p['goals'][8]['profile']['applicationCaseBriefs'][1]
brief['expectedPerformanceDe'] = case['modelAnswer']['de']
brief['expectedPerformanceEn'] = case['modelAnswer']['en']
p['reviewId'] = 'biologie-flora-fauna20-current391-targeted-p-author-v4'
p['reviewedAt'] = datetime.now(timezone.utc).isoformat()
assert all(m['goals'][i] == before_m['goals'][i] for i in range(20) if i != 8)
assert all(p['goals'][i] == before_p['goals'][i] for i in range(20) if i != 8)
assert m['goals'][8]['cases'][0] == before_m['goals'][8]['cases'][0]
write('twenty-whole-goals-forty-common-DEEN-cases.author-v4.json', m)
write('P20.targeted-one-answer.author-v4.candidates.json', p)
config = read(old / 'P20.targeted-two-profiles.author-v3.config.json')
config['reviewId'] = p['reviewId']
config['reviewPath'] = str((own / 'P20.targeted-one-answer.author-v4.review.jsonl').relative_to(root))
write('P20.targeted-one-answer.author-v4.config.json', config)
write('one-answer-pair.author-remediation.receipt.json', {
 'role':'root author targeted follow-up to actual independent B residual finding',
 'previousAuthorSeal': str((old / 'targeted-author-remediation.exact-input-output.freeze.json').relative_to(root)),
 'caseId': case['id'], 'changedFields':['modelAnswer.de','modelAnswer.en','expectedPerformanceDe','expectedPerformanceEn'],
 'actualCorrection': 'Explicitly justify specimen Y as linden by its heart-shaped leaf, as demanded by the unchanged task',
 'unchangedOtherWholeCases':39, 'unchangedOtherWholeProfiles':19,
 'unchangedWholeGoals':20, 'unchangedTasksAndMaterials':40,
 'sourceChoiceDissentAndConditionalFish': 'unchanged', 'activeWrites':0,
 'strictGainClaimed':0, 'humanApproval':False, 'independentRecheck':'pending'})
print('Prepared one answer pair and its exact native P expectation; all other39 cases unchanged.')
