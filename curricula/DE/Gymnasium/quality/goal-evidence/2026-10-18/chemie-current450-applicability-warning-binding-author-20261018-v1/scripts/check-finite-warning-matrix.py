import json
import hashlib
import sys
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone

BASE = Path(__file__).resolve().parent.parent
ROOT = Path.cwd()

def read(p):
    return json.loads(Path(p).read_text())

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def objsha(x):
    return hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def resolve(value, pointer):
    if pointer == '':
        return value
    for token in pointer.split('/')[1:]:
        token = token.replace('~1', '/').replace('~0', '~')
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value

cache = {}
checked_pins = set()
checked_locators = set()

def check_pin(pin):
    key = (pin['path'], pin['sha256'])
    if key not in checked_pins:
        p = Path(pin['path'])
        assert p.is_file() and not p.is_symlink(), str(p)
        assert sha(p) == pin['sha256'], str(p)
        if 'bytes' in pin:
            assert p.stat().st_size == pin['bytes'], str(p)
        checked_pins.add(key)

def check_locator(locator):
    check_pin(locator)
    key = (locator['path'], locator['jsonPointer'], locator.get('objectSHA256'))
    if key in checked_locators:
        return
    if locator['path'] not in cache:
        cache[locator['path']] = read(locator['path'])
    value = resolve(cache[locator['path']], locator['jsonPointer'])
    if 'objectSHA256' in locator:
        assert objsha(value) == locator['objectSHA256'], str(key)
    checked_locators.add(key)

candidate = read(BASE/'CANDIDATE.current87-221-warning-context-decisions.json')
goals = read(BASE/'inputs/current87-whole-goals.json')
ap = read(BASE/'inputs/current87-existing-applicability-facts.json')
registry = read(BASE/'inputs/current-chemistry-override-registry.json')['landscape']['goalApplicabilityOverrides']
views = read(BASE/'inputs/current-whole-view-objects.json')['views']
contexts = read(BASE/'inputs/current87-authored-view-contexts.json')['contexts']
history = read(BASE/'inputs/previous-reviewed-whole-scope-excerpts.json')['rows']
profiles = read(BASE/'inputs/current85-profile-index.json')
portable = read(BASE/'portable-original-evidence-map.json')['copies']

assert candidate['status'] == 'AUTHOR_CANDIDATE_PENDING_INDEPENDENT_BINDING_REVIEW'
assert candidate['normalRegistration'] is False and candidate['newScientificReviewerVote'] is False
assert len(candidate['warningDecisions']) == 87 and len(candidate['pairDecisions']) == 221
assert len({q['warningKey'] for q in candidate['warningDecisions']}) == 87
assert len({(q['goalId'],q['jurisdiction']) for q in candidate['pairDecisions']}) == 221
assert all(q['code']=='APV-201' for q in ap['findings'])
assert [q['exactCurrentWarning'] for q in candidate['warningDecisions']] == ap['findings']

goal_map = {g['id']:g for g in goals['goals']}
expected_pairs = set()
for gid, goal in goal_map.items():
    values = set(registry.get(gid,{}).get('jurisdiction',[])) | set(goal.get('extendedData',{}).get('applicabilityOverrides',{}).get('jurisdiction',[]))
    expected_pairs.update((gid,j) for j in values)
assert expected_pairs == {(q['goalId'],q['jurisdiction']) for q in candidate['pairDecisions']}

for p in read(BASE/'inputs/current-input-pins.json')['pins']:
    check_pin(p)
for view in views:
    check_pin(view['source'])
    assert read(view['source']['path']) == view['rawWholeView']
for copy in portable:
    check_pin(copy['original']); check_pin(copy['portableExactCopy'])
    assert Path(copy['original']['path']).read_bytes() == Path(copy['portableExactCopy']['path']).read_bytes()
for row in history:
    check_pin(row['source'])
    if row['source']['path'] not in cache:
        cache[row['source']['path']] = read(row['source']['path'])
    assert resolve(cache[row['source']['path']], row['jsonPointer']) == row['wholeGoal']
    assert objsha(row['wholeGoal']) == row['wholeGoalObjectSHA256']

check_pin(profiles['source'])
source_lines = Path(profiles['source']['path']).read_bytes().splitlines(keepends=True)
selected_lines = (BASE/'inputs/current85-exact-profile-records.jsonl').read_bytes().splitlines(keepends=True)
assert len(selected_lines)==85
for row in profiles['records']:
    selected = selected_lines[row['candidateLineOneBased']-1]
    assert selected == source_lines[row['sourceLineOneBased']-1]
    value = json.loads(selected)
    assert value['goalId']==row['goalId']
    assert objsha(value['profile'])==row['profileObjectSHA256']

for row in candidate['pairDecisions']:
    gid=row['goalId']; jur=row['jurisdiction']
    assert objsha(goal_map[gid])==row['currentGoalObjectSHA256']
    assert row['officialWholeSourceCoverageClaim'] is False
    assert row['wholeHETerminalRouteApproval'] is False
    assert row['newDPAMVReview'] is False and row['humanApproval'] is False
    assert row['authorDecision'] in ['PROPOSE_ACCEPT_BOUNDED_CONTEXT','HOLD']
    assert bool(row['holds'])==(row['authorDecision']=='HOLD')
    for c in row['actualAuthoredViewContexts']:
        original=resolve({'contexts':contexts}, c['sourceContextPointer'])
        assert {k:v for k,v in c.items() if k!='sourceContextPointer'}==original
        assert original['goalId']==gid and original['scope'].get('jurisdiction')==jur
    for proof in row['existingScientificScopeDecisions']:
        assert proof['newScienceVote'] is False
        for loc in proof['actualDecisionLocators']:
            check_locator(loc)
    for loc in row['currentScopeDelta']['specificSuccessorDecisions']:
        check_locator(loc)
    successor=row.get('specificCurrentProfileSuccessorBinding')
    if successor:
        assert row['currentProfile']['profileObjectSHA256']==successor['expectedCurrentProfileObjectSHA256']
        for loc in successor['locators']:
            check_locator(loc)

# Check the exact current warning key, including the deliberately empty value.
for row in candidate['warningDecisions']:
    f=row['exactCurrentWarning']
    key='|'.join([f['code'],f['landscapeId'],f['goalId'],f.get('dimension',''),f.get('value','')])
    assert row['warningKey']==key
    owned=[candidate['pairDecisions'][i-1] for i in row['pairOrdinals']]
    assert all(q['goalId']==f['goalId'] for q in owned)
    assert row['exactCurrentOverrideJurisdictions']==sorted(q['jurisdiction'] for q in owned)
    assert (row['authorDecision']=='HOLD')==any(q['authorDecision']=='HOLD' for q in owned)

report={'role':'Finite author-packet consistency check only; not a scientific review or a normal gate run',
    'checkedAtUTC':datetime.now(timezone.utc).isoformat(),'status':'PASS',
    'warningKeys':87,'pairs':221,'exactProfileRows':85,'wholeCurrentViewObjects':len(views),
    'portableTemporaryOriginalFiles':len(portable),'uniqueFilePinsChecked':len(checked_pins),
    'uniqueScientificLocatorsChecked':len(checked_locators),
    'candidateDecisionCounts':dict(Counter(q['authorDecision'] for q in candidate['pairDecisions'])),
    'applicabilityCompilerRun':False,'wholeReportOrFiveGateOrSchemaOrBuildRun':False,
    'normalFileMutations':False,'humanApproval':False,'newScientificVote':False}
if '--no-write' not in sys.argv:
    (BASE/'CHECK.finite-current87-221-bindings.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False))
