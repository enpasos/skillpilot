"""Replay reviewed marks only; this is not an automated semantic grader."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
source = here / 'independent-whole-counterworks.json'
target = here / 'actual-eight-independent-whole-counterwork-score-replays.json'
if target.exists():
    raise RuntimeError('Immutable independent output exists')
works = json.loads(source.read_text())['counterworks']
results = []
for work in works:
    assert len(work['sections']) == 4
    assert [x['id'] for x in work['sections']] == ['s1', 's2', 's3', 's4']
    assert all(0 <= x['marks'] <= 6 for x in work['sections'])
    raw = sum(x['marks'] for x in work['sections'])
    assert raw == work['rawPoints']
    assert (work['v1RestrictedPoints'] >= 15) == work['v1Pass']
    restricted = min(raw, 14) if work['v2Restriction'] else raw
    assert restricted == work['v2RestrictedPoints']
    assert (restricted >= 15) == work['v2Pass']
    results.append({'id':work['id'], 'rawPoints':raw, 'v1Points':work['v1RestrictedPoints'], 'v1Pass':work['v1Pass'], 'v2Points':restricted, 'v2Pass':work['v2Pass'], 'actualManualRestrictionReason':work['v2Restriction']})
assert len(works) == 8
assert sum(r['v1Pass'] and not r['v2Pass'] for r in results) == 4
assert sum(r['v2Pass'] for r in results) == 4
target.write_text(json.dumps({'method':'Numeric sum/restriction replay of independently reviewed whole synthetic submissions. Semantic marks and core findings are manual machine-QS reviewer decisions in the input, not automatically inferred.', 'allPassed':True, 'count':len(results), 'results':results},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'wholeSyntheticSubmissions':8,'actualV1FalsePassesBlockedByV2':4,'validWholeAndPartialV2Passes':4,'allScoreReplaysPassed':True}))
