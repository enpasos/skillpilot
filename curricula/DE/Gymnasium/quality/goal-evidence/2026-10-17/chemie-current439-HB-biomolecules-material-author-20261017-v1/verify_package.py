#!/usr/bin/env python3
"""Read-only pin and exact-retention verification. Technical code: Apache-2.0."""
import hashlib
import json
from pathlib import Path

here = Path(__file__).resolve().parent
root = next(p for p in here.parents if (p/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json').is_file())
selector = json.loads((here/'SELECTOR.biomolecules-author.sealed.json').read_text())
count = 0
for pin in selector['inputs'] + selector['outputs']:
    path = root/pin['path']
    data = path.read_bytes()
    assert len(data) == pin['bytes'] and hashlib.sha256(data).hexdigest() == pin['sha256'], str(path)
    count += 1
records = json.loads((here/'AUTHOR.whole-profiles.pending.json').read_text())['records']
for r in records:
    old, new = r['originalProfileRecord']['profile'], r['profile']
    for field in ('expectations','applicationCaseBriefs','variationAxes'):
        assert new[field][:len(old[field])] == old[field], (r['goalId'],field)
    for key,value in old['coverageExpectations'].items():
        actual = new['coverageExpectations'][key]
        assert (actual[:len(value)] == value if key == 'requiredExpectationIds' else actual == value), (r['goalId'],key)
    for case in new['applicationCaseBriefs']:
        assert all(len(s) <= 2000 for s in case.values() if isinstance(s,str)), (r['goalId'],case['id'])
assert len(records) == 11 and sum(len(r['addedCaseIds']) for r in records) == 15
print(json.dumps(dict(technicalOnly=True,pinsChecked=count,wholeProfiles=11,newWholeCases=15,
    originalArraysAndCoverageRetained=True,allCaseBriefFieldsWithin2000=True,scientificApproval=False,M7Claim=False)))
