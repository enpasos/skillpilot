#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Fail closed on stale current-view hashes or inconsistent SN source boundaries."""
import hashlib
import json
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=next(p for p in HERE.parents if (p/'scripts/generate_laender_physics_stage_views.py').exists())
def read(path):return json.loads(path.read_bytes())
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
    policy_path=ROOT/'scripts/generate_laender_physics_stage_views.sources.json'
    policy=read(policy_path);policy_sha=digest(policy_path)
    exceptions=read(HERE/'source-demand-place-exceptions.actual.json')
    assert exceptions['currentSourcePlanSha256']==policy_sha
    checked=0
    for row in exceptions['records']:
        for place in row['actualTargetPlaces']:
            assert place['sha256']==digest(ROOT/place['file']),place['file']
            checked+=1
    witness=read(HERE/'source-placement-witnesses.actual.json')
    assert witness['sourcePolicySha256']==policy_sha
    sn={r['goalId']:r for r in policy['reviewedMomentumBindings']['targets'] if r['state']=='SN'}
    prefixes={r['goalId'].split('-')[0]:r for r in sn.values()}
    assert prefixes['53afbda1']['pages']==[57]
    assert not any(word in prefixes['53afbda1']['boundary'].lower() for word in ['tangent','differential'])
    assert prefixes['ecbaa101']['pages']==[57,58]
    assert prefixes['059c1adc']['pages']==[58] and 'tangent' in prefixes['059c1adc']['boundary'].lower()
    rows=0
    for entry in witness['views']:
        if entry['file'] not in ['de-sn-lk.view.json','de-sn-sekii-lk.view.json']:continue
        declared={r['goalId']:r for r in entry['reviewedMomentumBindings'] if r['goalId'] in sn}
        assert set(declared)==set(sn)
        for goal,source in sn.items():
            for key in ['pages','boundary','sourceSha256','sourcePath']:
                assert declared[goal][key]==source[key],(entry['file'],goal,'reviewedMomentumBindings',key)
            passages=entry['sourceAssignments'][goal]['sourcePassages']
            assert len(passages)==1
            for key in ['pages','boundary','sourceSha256','sourcePath']:
                assert passages[0][key]==source[key],(entry['file'],goal,'sourceAssignments',key)
            rows+=1
    assert rows==6
    heading=read(HERE/'final-heading-delta-v2.actual.json')
    for entry in heading['changedViews']:
        assert entry['sha256']==digest(ROOT/entry['path']),entry['path']
        assert entry['allOtherTargetAndAcquisitionReferencePlacesUnchanged'] is True
    pins={p.name:dict(path=p.name,sha256=digest(p)) for p in [HERE/'source-demand-place-exceptions.actual.json',HERE/'source-placement-witnesses.actual.json',HERE/'final-heading-delta-v2.actual.json']}
    result=dict(schemaVersion=1,status='PASS',checkedCurrentExceptionViewHashes=checked,checkedSNGoalBindingsInBothForms=rows,
        currentSourcePolicy=dict(path=str(policy_path.relative_to(ROOT)),sha256=policy_sha),currentCompanions=pins,
        snGoalSpecificBoundaries=[dict(goalId=r['goalId'],pages=r['pages'],boundary=r['boundary']) for r in sn.values()],
        boundary='This is a literal current-input consistency check, not a new source-review vote. Sealed earlier review packets and rejected intermediates remain untouched.')
    (HERE/'current-source-binding.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
