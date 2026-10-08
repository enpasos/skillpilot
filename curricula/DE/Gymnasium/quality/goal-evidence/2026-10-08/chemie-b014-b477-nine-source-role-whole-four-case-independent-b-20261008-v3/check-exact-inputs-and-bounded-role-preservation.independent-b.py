#!/usr/bin/env python3
"""Exact-input guard only. Scientific decisions are written separately by reviewer B."""
import hashlib
import json
import math
import pathlib
import subprocess
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[7]
OWN = pathlib.Path(__file__).resolve().parent
Q = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
AUTHOR = Q / 'chemie-b014-b477-nine-source-role-continuation-author-v2'
V3 = Q / 'chemie-b014-b477-colorless-reference-targeted-author-root-v3'
SEAL = V3 / 'whole-nine-source-role-current-four-case-author-v3.first.freeze.json'
EXPECTED = 'ed0aa80fa97eb787d0383508c201d7eaf159b9149cf64342631f4587dba49261'
HELD = 'b4777001-f4ed-5fe9-9d98-02319abdea09'
STRICT = '1c1420c2-a8e2-520f-8015-6df637a973bd'

def read(p):
    return json.loads(p.read_text())

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def relative(p):
    return str(p.relative_to(ROOT))

def binding(p):
    return {'path': relative(p), 'sha256': sha(p), 'bytes': p.stat().st_size}

def jd(x):
    return hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def diff(a, b, path=''):
    if type(a) != type(b):
        return [path]
    if isinstance(a, dict):
        return sum((diff(a.get(k), b.get(k), path+'/'+k) for k in sorted(set(a)|set(b))), [])
    if isinstance(a, list):
        return [path] if len(a) != len(b) else sum((diff(x, y, path+'/'+str(i)) for i, (x, y) in enumerate(zip(a, b))), [])
    return [] if a == b else [path]

assert sha(SEAL) == EXPECTED
seal = read(SEAL)
inputs = [binding(SEAL)]
for item in seal['frozenFiles']:
    p = ROOT / item['path']
    assert sha(p) == item['sha256'], item['path']
    assert p.stat().st_size == item['bytes'], item['path']
    inputs.append(binding(p))

roles = read(AUTHOR / 'nine-current-whole-original-source-duties-and-partners.json')['entries']
deltas = read(AUTHOR / 'six-limited-operative-source-role-deltas.inactive.json')['entries']
canonpath = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canon = {g['id']: g for g in read(canonpath)['goals']}
inputs.append(binding(canonpath))
source_checks = []
for r in roles:
    mp = ROOT / r['mappingPath']
    sp = ROOT / r['sourceExtractionPath']
    source = next(x for x in read(sp)['sourceGoals'] if x['id'] == r['sourceGoalId'])
    assert source == r['wholeOriginalSourceGoal'], r['sourceGoalId']
    decision = read(mp)['decisions'][r['decisionIndex']]
    assert decision == r['wholeOriginalDecision'], r['sourceGoalId']
    for g in r['wholeCurrentPartnerGoals']:
        assert canon[g['id']] == g, g['id']
    inputs.extend([binding(mp), binding(sp)])
    source_checks.append({'sourceGoalId': r['sourceGoalId'], 'currentWholeSourceEqual': True,
                          'currentWholeMappingDecisionEqual': True, 'wholeSourceObjectDigest': jd(source),
                          'wholeMappingDecisionDigest': jd(decision)})
for delta in deltas:
    assert len(delta['fieldDeltas']) == 1
    f = delta['fieldDeltas'][0]
    assert f['before'].count(HELD) == 1
    assert f['afterCandidate'] == [x for x in f['before'] if x != HELD]
    assert STRICT in f['afterCandidate']
    assert len(delta['removeOnlyMappingEdges']) == 1
    assert delta['removeOnlyMappingEdges'][0]['canonicalGoalId'] == HELD
    r = next(x for x in roles if x['sourceGoalId'] == delta['sourceGoalId'])
    assert delta['wholeOriginalSourceGoal'] == r['wholeOriginalSourceGoal']
    assert delta['wholeOriginalDecision'] == r['wholeOriginalDecision']
    assert delta['retainedMappingEdges'] == [e for e in r['wholeOriginalMappingEdges'] if e['canonicalGoalId'] != HELD]

reuse = read(AUTHOR / 'current-three-valid-A-M-V-P-exact-binding-reuse.native.actual.json')
retained = []
for row in reuse['entries']:
    assert canon[row['goalId']] == row['wholeUnchangedGoal']
    assert row['currentStrictMachineCompletionRetained'] is True
    assert row['P']['errors'] == []
    p = row['P']['retained']
    assert p['repeatedScientificReview'] is False
    ledger = ROOT / p['reviewPath']
    lines = [json.loads(x) for x in ledger.read_text().splitlines() if x.strip()]
    assert any(x == p['wholeRecord'] for x in lines), row['goalId']
    inputs.append(binding(ledger))
    assert row['P']['newScienceReview'] is False
    retained.append({'goalId': row['goalId'], 'wholeGoalCurrentEqual': True,
                     'wholeGoalDigest': jd(canon[row['goalId']]), 'providedNativeReuseReceiptHasNoPErrors': True,
                     'freshIndependentReviewOfOldCases': False})

old = read(AUTHOR / 'four-new-whole-original-operator-source-witness-cases.de-en.author-candidate.json')
newpath = V3 / 'four-current-whole-source-cases.with-targeted-colorless-reference.author-v3.json'
current = read(newpath)
changed = diff(old, current)
assert changed == ['/cases/1/material/de/0', '/cases/1/material/en/0'], changed
assert len(current['cases']) == 4
for case in current['cases']:
    for lang in ('de', 'en'):
        assert len(case['material'][lang]) >= 2
        assert case['learnerTask'][lang] and case['modelAnswer'][lang]
        assert case['transfer'][lang]['task'] and case['transfer'][lang]['expected']
    assert case['actualLearnerOrExperimentEvidence'] is False
    assert case['status'] == 'inactive_original_source_operator_author_witness_not_goal_approval'

locators = read(AUTHOR / 'actual-primary-whole-page-locators-and-operator-boundaries.json')['readings']
pages = []
for key, item in locators.items():
    p = ROOT / item['primaryBinding']['path']
    assert sha(p) == item['primaryBinding']['sha256']
    inputs.append(binding(p))
    pg = str(item['physicalPage'])
    text = subprocess.run(['pdftotext', '-f', pg, '-l', pg, '-layout', str(p), '-'], capture_output=True, check=True).stdout
    pages.append({'key': key, 'pdfBinding': binding(p), 'physicalPage': item['physicalPage'],
                  'printedPage': item['printedPage'], 'wholeLayoutTextSha256': hashlib.sha256(text).hexdigest(),
                  'wholeExtractedPageTextCommitted': False, 'actuallyReadByReviewerB': True})
extra = [
    ('BB', 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf', [17,26,45,46]),
    ('BE', 'curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf', [17,26,45,46]),
    ('BW', 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf', [26,35,36]),
    ('HE', 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf', [26]),
]
for key, name, numbers in extra:
    for number in numbers:
        text = subprocess.run(['pdftotext','-f',str(number),'-l',str(number),'-layout',str(ROOT/name),'-'],capture_output=True,check=True).stdout
        pages.append({'key': key+'-whole-context-'+str(number), 'pdfBinding':binding(ROOT/name), 'physicalPage':number,
                      'wholeLayoutTextSha256':hashlib.sha256(text).hexdigest(), 'wholeExtractedPageTextCommitted':False,
                      'actuallyReadByReviewerB':True, 'BEReadingBoundary':'same entire bytes as BB checked' if key=='BE' else None})
assert sha(ROOT/extra[0][1]) == sha(ROOT/extra[1][1])
for a,b in [('HB-E-current2026','HB-E-retained'),('HB-Q-current2026','HB-Q-retained')]:
    assert next(x for x in pages if x['key']==a)['wholeLayoutTextSha256'] == next(x for x in pages if x['key']==b)['wholeLayoutTextSha256']

numeric = {'KaChloroacetateAcid':10**-2.9, 'KaAceticAcid':10**-4.8,
           'pKbChloroacetate':14-2.9, 'pKbAcetate':14-4.8, 'pKb3Chloropropionate':14-4.0,
           'case3K':10**(4.8-2.9), 'case3Q':(.001*.008)/(.0001*.0001),
           'case4K':10**(4.8-4.0), 'case4Q':(.002*.004)/(.002*.004)}
assert math.isclose(numeric['case3Q'],800)
assert math.isclose(numeric['case3K'],79.43282347242814)
assert numeric['case3Q'] > numeric['case3K']
assert numeric['case4Q'] < numeric['case4K'] < 63.1
read_ids = set(canon[g]['id'] for g in [HELD,STRICT,'d2ccd1d5-56f7-583f-9724-e97441367f91','fd309753-4d48-5570-a4ec-09dfeb20ff9c',
    '48115ff7-7aca-5d0b-a9e7-7fc6c78434ef','ca216bc6-5205-5b46-abbd-fd5628e4ca5b','277a3c20-6082-5a95-be08-c1e386efe79b',
    '3de28598-672f-5753-8a45-8f559c2f9dc2','08b44b8f-e407-5a1f-82dc-e70e598022cf'])
inputs.append(binding(ROOT/'AGENTS.md'))
inputs = list({x['path']:x for x in inputs}.values())
report = {'role':'Actual exact-input and arithmetic guard; not scientific or human approval',
          'observedAtUTC':datetime.now(timezone.utc).isoformat(), 'authorFirstSealBinding':binding(SEAL),
          'all19AuthorFrozenFilesVerified':True, 'inputBindings':inputs, 'sourceChecks':source_checks,
          'sixRoleDeltasPreserveAllOtherEdgesAndWholeSources':True, 'retainedOldGoalChecks':retained,
          'currentFourCaseChangedPointersOnly':changed, 'wholePrimaryPageReadBindings':pages,
          'independentRecomputedArithmetic':numeric, 'wholeSourceGoalApprovalsFromThisGuard':0,
          'newNativePApprovals':0, 'activeWrites':0, 'humanApproval':False}
(OWN/'exact-inputs-and-bounded-role-preservation.independent-b.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(OWN/'current-nine-whole-goals-read-scope.independent-b.actual.json').write_text(json.dumps({'role':'Whole current bodies actually read for bounded source-role review; existing accepted cases not re-reviewed','goals':[canon[x] for x in sorted(read_ids)]},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'exitCode':0,'verifiedAuthorFiles':19,'actualInputBindings':len(inputs),'sourceRows':9,'boundedRoleDeltas':6,'wholeCases':4,'materialOnlyChanges':2,'wholePrimaryPageReadBindings':len(pages),'newGoalOrPApprovals':0}))
