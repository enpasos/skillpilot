#!/usr/bin/env python3
"""Verify finite byte identity and bindings; stock tools alone check P/A contracts."""
import hashlib
import json
from pathlib import Path

OWN = Path(__file__).resolve().parent
REPO = OWN.parents[6]

def load(path):
    return json.loads(path.read_text())

def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def main():
    seal = load(OWN / 'FILES.finite-informed-pa.seal.json')
    for row in seal['ownFiles']:
        data = (OWN / row['path']).read_bytes()
        assert sha(data) == row['sha256'] and len(data) == row['bytes'], row['path']
    for row in seal['externalInputs']:
        data = (REPO / row['path']).read_bytes()
        assert sha(data) == row['sha256'] and len(data) == row['bytes'], row['path']
    source = REPO / seal['sourceRoot']
    first = load(OWN / 'PA.FIRST.independent-informed-science.json')
    profile_map = {p['goalId']: p['profile'] for p in load(source / 'blind-scientific-inputs/fifteen-current-E0G0-scientific-profiles.json')['profiles']}
    native = {g['goalId']: g['reviewContext']['evidenceProfile'] for g in load(source / 'native15/round-b/description-review-input.json')['goals']}
    p = [json.loads(line) for line in (OWN / 'P15.current-E1G1.ai-candidate.jsonl').read_text().splitlines()]
    a = [json.loads(line) for line in (OWN / 'A15.current-semantic-atomicity.ai-candidate.jsonl').read_text().splitlines()]
    ids = [j['goalId'] for j in first['judgments']]
    assert [r['goalId'] for r in p] == [r['goalId'] for r in a] == ids
    assert len(ids) == len(set(ids)) == 15
    assert sum(len(j['caseReviews']) for j in first['judgments']) == 30
    for record in p:
        goal_id = record['goalId']
        assert record['profile'] == profile_map[goal_id] == native[goal_id]['profile']
        for field in ['goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint']:
            assert record[field] == native[goal_id][field], (goal_id, field)
        assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
        assert record['reviewAuthority'] == 'ai_candidate' and record['status'] == 'needs_human_review'
    assert all(r['status'] == 'atomic' and r['semanticAtomic'] is True for r in a)
    receipts = load(OWN / 'CHECK.stock-PA.actual.receipts.json')
    assert len(receipts['commands']) == 5
    assert all(c['exitCode'] == 0 for c in receipts['commands'])
    for command in receipts['commands']:
        assert sha((REPO / command['actualOutputPath']).read_bytes()) == command['actualOutputSha256']
    assert receipts['separateFirstSha256'] == sha((OWN / 'PA.FIRST.independent-informed-science.json').read_bytes())
    print('PASS: finite own P/A seal;15 exact current profile bodies and native input/profile fingerprints;30 individually reviewed cases;15 semantic-atomicity candidates;5 stock command exits0. No human approval/trial or M7 award.')

if __name__ == '__main__':
    main()
