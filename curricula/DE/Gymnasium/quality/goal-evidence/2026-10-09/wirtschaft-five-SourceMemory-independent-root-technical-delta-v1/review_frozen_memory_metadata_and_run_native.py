"""Independent bounded metadata checks; scientific KEEP history is reused unchanged."""
import copy
import datetime
import hashlib
import importlib.util
import json
import pathlib
import shutil
import subprocess
import tempfile

R = pathlib.Path(__file__).resolve().parents[7]
O = pathlib.Path(__file__).resolve().parent
A = O.parent / 'wirtschaft-four-SourceMemory-current-origin-AM-card-and-BE-visibility-technical-binding-v1'


def read(p):
    return json.loads(pathlib.Path(p).read_text())


def info(p):
    p = pathlib.Path(p)
    return {'path': str(p.relative_to(R)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'wholeBytes': p.stat().st_size}


def put(name, obj):
    p = O / name
    assert not p.exists(), p
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return info(p)


def rows(p):
    return [json.loads(x) for x in pathlib.Path(p).read_text().splitlines() if x.strip()]


index = read(A / 'actual-portable-whole-five-memory-eleven-origin-fourteen-card-and-108-placement-Root-review-index.json')
guards = index['ownWholeReviewInputs'] + index['validHistoricalScienceBindings'] + index['actualNativeImplementationBindings']
for g in guards:
    assert info(R / g['path']) == g, g['path']
put('actual-independent-frozen-whole-input-before-guard.json', guards)
candidate = read(A / 'whole-CAN485-only-one-new-BB2-memory-node-and-one-source-navigation-child.inert-author-candidate.json')
base = read(R / read(A / 'actual-author-current-AM-bridge-review-input-and-delta-summary.json')['base']['path'])
old = {g['id']: g for g in base['goals']}
new = {g['id']: g for g in candidate['goals']}
science = read(A / 'one-additional-BB2-definitions-memory-node.exact-two-foreign-KEEP-DE-cards.author-candidate.json')
sid = science['id']
nav = '9658d512-618c-56ab-aecf-14aaec1005f4'
assert len(old) == 484 and len(new) == 485
assert set(new) - set(old) == {sid}
assert new[sid] == science
assert all(new[i] == g for i, g in old.items() if i != nav)
expected_nav = copy.deepcopy(old[nav]); expected_nav['contains'].append(sid)
assert new[nav] == expected_nav
assert science['requires'] == science['contains'] == []
assert science['nodeKind'] == 'memory' and science['dimensionTags']['demandLevel'] == 'AB1'
assert science['dimensionTags']['courseLevels'] == ['GK', 'LK']
decks = read(A / 'four-decks-twelve-whole-DEEN-cards-exact-portable-input-and-target-index.json')
decks.append({'memoryGoalId': sid, 'input': info(R / science['extendedData']['authorCandidate']['deckDraftBinding']['path']), 'wholeDeck': read(R / science['extendedData']['authorCandidate']['deckDraftBinding']['path']), 'publicTargetPath': 'app/public/data/de_gymnasium_economics_science_disciplines_recall.de.json'})
assert decks[-1]['wholeDeck']['cards'] == read(R / decks[-1]['wholeDeck']['provenance']['originalCards']['path'])
assert len(decks[-1]['wholeDeck']['cards']) == 2
assert not any(c.get('frontEn') or c.get('backEn') for c in decks[-1]['wholeDeck']['cards'])
am = rows(A / 'memory-full336.review.jsonl')
source_am = rows(A / 'memory-source25-only.review.jsonl')
cards = rows(A / 'memory-full-current.cards.review.jsonl')
assert len(am) == len({x['goalId'] for x in am}) == 336
assert len(source_am) == 25 and sum(x['status'] == 'memory_required' for x in source_am) == 11
assert len(cards) == len({(x['deckId'], x['cardId']) for x in cards}) == 66
root_config = read(R / read(A / 'actual-author-current-AM-bridge-review-input-and-delta-summary.json')['rootConfig']['path'])
root_am = rows(R / root_config['reviewPath'])
prior_am = {x['goalId']: x for x in rows(R / read(A / 'actual-author-current-AM-bridge-review-input-and-delta-summary.json')['elevenPreviouslyIndependentlyReviewedWholeRecordsReused']['path'])}
am_by = {x['goalId']: x for x in am}
unchanged = sum(am_by[x['goalId']] == x for x in root_am)
reused = sum(am_by[x['goalId']] != x and am_by[x['goalId']] == prior_am[x['goalId']] for x in root_am)
assert unchanged == 300 and reused == 11
assert cards[:52] == rows(R / root_config['cardReviewPath'])
individual = []
for d in decks:
    goal = new[d['memoryGoalId']]; deck = d['wholeDeck']
    assert goal['extendedData']['vocabularySource'] == '/data/' + deck['deckId'] + '.de.json'
    assert 'srs-deck:' + deck['deckId'] in goal['tags']
    origins = goal['extendedData']['authorCandidate']['originGoalIds']
    assert set(origins) == {x for c in deck['cards'] for x in c['originGoalIds']}
    for origin in origins:
        assert am_by[origin]['status'] == 'memory_required'
        assert d['memoryGoalId'] in am_by[origin]['memoryGoalIds']
        assert deck['deckId'] in am_by[origin]['deckIds']
    assert goal['requires'] == []
    individual.append({'goalId': goal['id'], 'wholeGoal': goal, 'deckInput': d['input'], 'wholeOrigins': [new[i] for i in origins], 'wholeCards': deck['cards'], 'decision': 'KEEP bounded node/deck/origin metadata; earlier independent necessity and scientific card judgments retained', 'independentReasonDe': 'Der Abrufknoten enthält genau die kurzen Begriffskerne der erforderlichen gewöhnlichen Ursprungsziele. Fallbegründung, Berechnung, Rechtsanwendung und Prozessanalyse bleiben in gewöhnlichen Zielen. Keine zusätzliche fachliche Zugangsvoraussetzung; Deck-ID, SRS-Tag, tatsächliche Kartenursprünge und Memory-Entscheidungen stimmen überein. Die vier alten Knoten und zwölf DE/EN-Karten bleiben unverändert; der neue Definitionsknoten bindet allein zwei unveränderte DE-Karten und behauptet keine frühere EN-Prüfung.'})
assert sum(len(d['wholeDeck']['cards']) for d in decks) == 14
vi = read(A / '108-explicit-BE-course-variant-memory-only-placement-successors.portable-index.json')
variant_decisions = []
for v in vi['variants']:
    before = read(R / v['before']['path']); after = read(R / v['after']['path'])
    check = copy.deepcopy(after); added = check['rootNodes'][0]['children'].pop()
    assert check == before
    chosen = [x['goalId'] for x in added['children']]
    assert chosen == v['addedMemoryTargets']
    assert all(x['kind'] == 'goalEntry' and x['projectionRole'] == 'target' for x in added['children'])
    assert len(chosen) == (3 if v['courseProfile'] == 'GK' else 5)
    variant_decisions.append({'variantId': v['variantId'], 'before': v['before'], 'after': v['after'], 'ordinaryAndPrerequisiteRolesWholeExact': True, 'addedMemoryTargets': chosen, 'decision': 'KEEP only bounded five-memory placement delta in unpublished review catalog; complete BE course visibility remains unapproved'})

# Fresh native execution capsule: exact current checker and regular candidate inputs.
cap = pathlib.Path(tempfile.mkdtemp(prefix='skillpilot-root-SourceMemory-native-'))
def copy_to(src, target):
    dest = cap / target; dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)

copy_to(R / 'app/scripts/memoryCardReview.ts', 'app/scripts/memoryCardReview.ts')
copy_to(A / 'whole-CAN485-only-one-new-BB2-memory-node-and-one-source-navigation-child.inert-author-candidate.json', 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
for g in candidate['goals']:
    if g.get('nodeKind') != 'memory':
        continue
    sources = g.get('extendedData', {}).get('vocabularySource')
    if not sources:
        continue
    sources = sources if isinstance(sources, list) else [sources]
    for source in sources:
        target = 'app/public/' + source.lstrip('/')
        if g.get('extendedData', {}).get('authorCandidate', {}).get('deckDraftBinding'):
            src = R / g['extendedData']['authorCandidate']['deckDraftBinding']['path']
        else:
            src = R / target
        copy_to(src, target)
commands = []
for name, expected_exit in [('memory-full-current-origin-only.native-author.successor-v2.config.json', 0), ('memory-source25-only.native-author.config.json', 0), ('memory-full-current.native-author.config.json', 1)]:
    config_path = A / name; config = read(config_path)
    copy_to(config_path, str(config_path.relative_to(R)))
    for field in ['reviewPath', 'cardReviewPath']:
        copy_to(R / config[field], config[field])
    for view in config.get('visibilityScopes', []):
        copy_to(R / view['viewPath'], view['viewPath'])
    command = [str(R / 'app/node_modules/.bin/tsx'), 'app/scripts/memoryCardReview.ts', '--config=' + str(config_path.relative_to(R)), '--mode=check']
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    run = subprocess.run(command, cwd=cap, text=True, capture_output=True)
    assert not (O / (name + '.actual-independent-native-output.txt')).exists()
    raw = O / (name + '.actual-independent-native-output.txt'); raw.write_text(run.stdout + run.stderr)
    commands.append({'command': command, 'executionCapsule': str(cap), 'startedAt': started, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'actualExitCode': run.returncode, 'expectedExitCode': expected_exit, 'rawOutput': info(raw), 'scope': 'Current origin and narrow Source25 visibility checks; retained whole-BE diagnostic is expected to fail and is not approval'})
    assert run.returncode == expected_exit, raw
    if expected_exit:
        assert '1836' in run.stdout
put('actual-three-independent-current-native-memory-commands.receipt.json', commands)
put('actual-five-whole-node-origin-card-independent-metadata-KEEP-decisions.json', individual)
put('actual-108-whole-review-view-narrow-memory-delta-independent-decisions.json', variant_decisions)
put('actual-independent-canonical-AM-and-card-exact-history-checks.json', {'currentGoals': 485, 'oldWholeGoalsExact': 483, 'changedExistingNavigation': 1, 'newMemoryNodes': 1, 'newOrdinaryGoals': 0, 'ordinaryAM': 336, 'oldRootWholeRecordsExact': unchanged, 'previouslyQualifiedWholeSuccessorsExact': reused, 'source25': 25, 'sourceMemoryRequired': 11, 'sourceNoMemory': 14, 'allCurrentCards': 66, 'oldWholeCardRecordsExact': 52, 'newBindingCardRecords': 14, 'historicalDEENCardsExact': 12, 'originalDEOnlyScienceCardsExact': 2, 'newScientificClosures': 0, 'strictNetGain': 0})
for g in guards:
    assert info(R / g['path']) == g
put('actual-independent-frozen-whole-input-after-guard.json', guards)
schema = read(R / 'docs/landscape-runtime.schema.json')
import jsonschema
runtime_errors = [e.message for e in jsonschema.Draft202012Validator(schema).iter_errors(candidate)]
view_schema = read(R / 'contracts/curriculum-package/v1/composition-view.schema.json')
view_errors = [e.message for v in vi['variants'] for e in jsonschema.Draft202012Validator(view_schema).iter_errors(read(R / v['after']['path']))]
spec = importlib.util.spec_from_file_location('skillpilot_root_memory_schema', R / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(str(R))
parse_errors = []
for f in O.rglob('*'):
    if f.suffix == '.json':
        read(f)
    if f.is_file():
        assert not f.is_symlink() and b'\r' not in f.read_bytes(), f
assert not runtime_errors and not view_errors and not symlink_errors
put('actual-independent-runtime108-schema-whole-JSON-LF-and-curriculum-symlink-check.json', {'runtime485Errors': runtime_errors, 'reviewView108Errors': view_errors, 'wholeJSONParseErrors': parse_errors, 'curriculum_symlink_errors': symlink_errors, 'actualLFErrors': [], 'scope': 'Bounded actual frozen inputs and own evidence; no full build or human approval'})
print(json.dumps({'independentMetadataKEEP': 5, 'exactHistoricalDEENCards': 12, 'exactHistoricalDEOnlyCards': 2, 'narrowViewDeltas': 108, 'actualNativeChecksPASS': 2, 'expectedWholeBEFailureRetained': 1, 'strictGain': 0, 'capsule': str(cap)}))
