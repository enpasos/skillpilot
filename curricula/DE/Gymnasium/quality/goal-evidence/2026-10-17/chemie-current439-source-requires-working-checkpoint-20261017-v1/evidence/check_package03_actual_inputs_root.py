import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('/mnt/e/skillpilot-chemie-L7-20261017')
AUTHOR = BASE / 'surfactants-softeners-retained-target-scope-author-v1'
OUT = BASE / 'surfactants-softeners-informed-root-review-v1'
OUT.mkdir(exist_ok=True)

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def verify(pin):
    p = Path(pin['path'])
    assert sha(p) == pin['sha256'], str(p)
    assert p.stat().st_size == pin['bytes'], str(p)
    return p

selector = json.loads((AUTHOR / 'SELECTOR.clean-content-for-two-other-reviewers.json').read_text())
inp = verify(selector['reviewInput'])
cas_path = verify(selector['wholeGuardedCAS'])
d = json.loads(inp.read_text())
cas = d['guardedWholeObjectProposal']
p439 = verify(cas['originalP439'])
records = {q['goalId']: q for q in map(json.loads, p439.read_text().splitlines())}
assert len(records) == 439
profiles = d['wholeCurrentPositiveProfilesContentOnly']
assert len(profiles) == 33
assert all(records[q['goalId']]['profile'] == q['wholeProfile'] for q in profiles)
current_path = BASE / 'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json'
current = json.loads(current_path.read_text())
goals = {g['id']: g for g in current['goals']}
assert len(goals) == 650
assert len(cas['canonicalWholeGoalChanges']) == 2
for change in cas['canonicalWholeGoalChanges']:
    assert goals[change['goalId']] == change['before']
    before, after = change['before'], change['after']
    assert {k:v for k,v in before.items() if k != 'extendedData'} == {k:v for k,v in after.items() if k != 'extendedData'}
    assert set(after['extendedData']) - set(before['extendedData']) == {'applicabilityOverrides', 'skillPilotAcquisitionExtensions'}
    assert all(after['extendedData'][k] == v for k,v in before['extendedData'].items())
context_diff = []
for old in d['wholeCurrentOrdinaryGoalsAndRelatedContext']:
    now = goals[old['id']]
    if old != now:
        context_diff.append({'goalId': old['id'], 'changedTopLevelKeys': [k for k in set(old)|set(now) if old.get(k) != now.get(k)]})
profile_change = cas['positiveProfileWholeBodyChange']
before_profile = profile_change['before']
after_profile = profile_change['after']
assert before_profile == records[profile_change['goalId']]['profile']
assert after_profile == d['wholeProposedChangedPositiveProfileContentOnly']['wholeProfile']

def changes(a, b, prefix=''):
    if isinstance(a, dict) and isinstance(b, dict):
        result = []
        for key in sorted(set(a)|set(b)):
            result.extend(changes(a.get(key), b.get(key), prefix + '/' + key))
        return result
    if isinstance(a, list) and isinstance(b, list) and len(a)==len(b):
        return sum((changes(x,y,prefix+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))), [])
    return [] if a == b else [{'path': prefix, 'before': a, 'after': b}]

leaf_changes = changes(before_profile, after_profile)
assert len(leaf_changes) == 8
pages = []
for source in d['wholePrimarySourcesAndPages']:
    pdf = verify(source['actualOriginalPDF'])
    for page in source['wholePrimaryPages']:
        number = page['physicalPDFPage']
        actual = subprocess.check_output(['pdftotext','-layout','-f',str(number),'-l',str(number),str(pdf),'-']).decode()
        normalized = lambda text: text.replace('\f', '').strip()
        assert normalized(actual) == normalized(page['literalWholeLayoutText']), (source['jurisdiction'], number)
        pages.append({'jurisdiction':source['jurisdiction'], 'physicalPDFPage':number, 'pdfSha256':sha(pdf), 'freshLayoutTextSha256':hashlib.sha256(actual.encode()).hexdigest()})
deck_cards = {}
for pin in d['allSevenUnchangedActualDeckPins']:
    p = verify(pin)
    obj = json.loads(p.read_text())
    cards = obj['cards'] if isinstance(obj,dict) else obj
    for card in cards:
        assert card['id'] not in deck_cards
        deck_cards[card['id']] = card
assert all(deck_cards[card['id']] == card for card in d['actualSelectedRelevantWholeCards'])
assert len(d['all67UnchangedActualMemorySelections']) == 67
memory_unchanged = []
for row in d['all67UnchangedActualMemorySelections']:
    goal = goals[row['goalId']]
    wanted = row['actualFilterTags']
    assert all(tag in goal['tags'] for tag in wanted)
    p = verify(row['actualDeckPin'])
    obj = json.loads(p.read_text()); cards = obj['cards'] if isinstance(obj,dict) else obj
    selected = [card['id'] for card in cards if any(t in card.get('tags',[]) for t in wanted)]
    assert selected == row['selectedCardIds'], goal['id']
    memory_unchanged.append(goal['id'])
result = {
    'atUTC':datetime.now(timezone.utc).isoformat(),
    'role':'Actual bounded input and rebase checks supporting an informed independent root content review; not formal native description votes or final stock applicability acceptance',
    'reviewInput':selector['reviewInput'], 'wholeGuardedCAS':selector['wholeGuardedCAS'],
    'currentPost20Canonical':{'path':str(current_path),'sha256':sha(current_path)},
    'wholeTwoCASBeforeObjectsMatchCurrentPost20':True,
    'whole33ContextProfilesMatchActualP35':True,
    'whole41ContextMetadataDifferencesFromPost20':context_diff,
    'onlyOrdinaryGoalExtendedDataAcquisitionScopeChanges':True,
    'actualEightProfileLeafChanges':leaf_changes,
    'actualOriginalPDFs':len(d['wholePrimarySourcesAndPages']),
    'freshActualOriginalPDFLayoutPages':pages,
    'all26ProvidedWholeCardsMatchSevenPinnedActualDecks':True,
    'all67ExistingSelectionsUnchangedByOwnORFilterComparison':True,
    'selectionCheckBoundary':'Own direct comparison, not a new invocation of the TypeScript stock selector; prior stock selector executions retain their separate evidence. No new Memory science votes or all-origin prerequisites.',
    'M7':False,'HumanApproval':False,'normalWrites':0,
}
target = OUT / 'CHECK.actual-P35-C20-PDFs-cards-and-bounded-CAS.json'
assert not target.exists()
target.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'path':str(target),'sha256':sha(target),'sourcePDFs':len(d['wholePrimarySourcesAndPages']),'sourcePages':len(pages),'profiles':len(profiles),'contextMetadataDifferences':context_diff,'leafChanges':len(leaf_changes),'cards':len(d['actualSelectedRelevantWholeCards']),'selectors':len(memory_unchanged)}))
