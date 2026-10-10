import copy
import datetime
import hashlib
import json
import uuid
from pathlib import Path

R = Path('/home/enpasos/projects/skillpilot')
O = Path(__file__).resolve().parent
N = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1'
E8 = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
E9 = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
M18 = E8 / 'wirtschaft-BE18-whole-P36-tax-AM-and-eleven-cards-independent-review-20261009-v1'
B21 = E8 / 'wirtschaft-BE21-ground-procedure-split-power-P2-and-source125-bounded-author-successor-v1'
PRODUCT = E8 / 'wirtschaft-BE-two-gaps-f0-and-Berlin-BB2-independent-bounded-need-P-AM-M-review-20261009-v1'
ROOT21 = E9 / 'wirtschaft-BE21-independent-root-P6-ground-procedure-source125-and-purpose-origin-delta-v1'
BB = E8 / 'wirtschaft-BB-two-foundations-bounded-author-20261008-v2'
BB_KEEP = E8 / 'wirtschaft-BB-two-foundations-independent-a-content-source-AM-review-v1/actual-independent-whole-two-BB-goals-P4-source-tax-AM-and-V3V4-closure.receipt.json'
FAB = E9 / 'wirtschaft-BE-P13-P26-Montan-independent-whole-positive-source-need-atomicity-memory-review-v1/actual-new-Montan-individual-whole-Need-AM-tax-minimal-prerequisite-and-memory-review.json'
DIRECTOR = E9 / 'wirtschaft-BE-three-source-rests-director-cycle-EU-independent-whole-performance-need-review-v1/actual-independent-one-new-director-whole-Need-atomicity-AB2-minimal-requires-and-memory-KEEP.json'
MEM_IDS = ['0746be0f-e98c-5062-8e22-5571f8439d4b', '8dcc6254-214c-5d3c-9d74-821b3e8091bd', 'be56c504-992d-5d63-b36b-ae94e24ca50e', 'adb8664a-8185-5ec6-a99f-db779d31aa37']

def load(p):
    return json.loads(Path(p).read_text())

def rel(p):
    return str(Path(p).relative_to(R))

def info(p):
    p = Path(p)
    return {'path': rel(p), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'wholeBytes': p.stat().st_size}

def write(name, obj):
    p = O / name
    p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.exists(), p
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return info(p)

def compact_hash(obj):
    return hashlib.sha256(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

base_path = N / 'whole-CAN484-reviewed-eight-Source25-six-bounded-GK-tags-two-source-navigation-placements.author-v8.json'
base = load(base_path)
goals = {g['id']: g for g in base['goals']}
four = [copy.deepcopy(goals[i]) for i in MEM_IDS]
origins = list(dict.fromkeys(o for g in four for o in g['extendedData']['authorCandidate']['originGoalIds']))
assert len(origins) == 9
write('four-whole-existing-memory-nodes-and-nine-current-whole-origins.exact.snapshot.json', {'memoryNodes': four, 'ordinaryOrigins': [goals[i] for i in origins]})

deck_index = []
cards = []
for m in four:
    binding = m['extendedData']['authorCandidate']['deckDraftBinding']
    p = R / binding['path']
    assert info(p)['sha256'] == binding['sha256'].removeprefix('sha256:')
    d = load(p)
    deck_index.append({'memoryGoalId': m['id'], 'input': info(p), 'canonicalTargetPath': 'curricula/DE/Gymnasium/memory-decks/' + p.name, 'publicTargetPath': 'app/public/data/' + p.name, 'vocabularySource': m['extendedData']['vocabularySource'], 'wholeDeck': d})
    cards += [{'deckId': d['deckId'], 'wholeCard': c} for c in d['cards']]
assert len(cards) == 12
assert all(c['wholeCard'].get('frontEn') and c['wholeCard'].get('backEn') for c in cards)
assert all(c['wholeCard']['id'] != 'economics-cash-stress-insolvency-ground' for c in cards)
write('four-decks-twelve-whole-DEEN-cards-exact-portable-input-and-target-index.json', deck_index)

bb_cards = load(BB / 'two-memory-cards.candidate.json')
assert len(bb_cards) == 2
bb_origins = [c['originGoalIds'][0] for c in bb_cards]
bb_deck_id = 'de_gymnasium_economics_science_disciplines_recall'
bb_mem_id = str(uuid.uuid5(uuid.NAMESPACE_URL, 'skillpilot:de-gymnasium-economics:memory:science-disciplines-recall'))
bb_deck = {'schemaVersion': 1, 'deckId': bb_deck_id, 'landscapeId': base['landscapeId'], 'title': 'Wirtschaftswissenschaftliche Einordnung und Disziplinperspektiven: Abrufanker', 'description': 'Zwei kompakte Begriffskerne; begründete Einordnung und Falltransfer verbleiben an den gewöhnlichen Lernzielen.', 'subject': 'Wirtschaftswissenschaften', 'language': 'de', 'stage': ['Sekundarstufe II'], 'schoolType': 'Gymnasium', 'provenance': {'type': 'canonical-skillpilot-memory-deck-author-candidate', 'license': 'CC-BY-4.0', 'sourceLandscape': 'DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', 'originalCards': info(BB / 'two-memory-cards.candidate.json'), 'retainedIndependentCardJudgment': info(BB_KEEP), 'newNativeBindingIndependentReview': 'pending; no new substantive card approval or historical English approval claimed', 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}, 'cards': copy.deepcopy(bb_cards)}
deck_file = write('memory-deck-drafts/' + bb_deck_id + '.de.json', bb_deck)
bb_mem = {'id': bb_mem_id, 'type': 'atomic', 'nodeKind': 'memory', 'title': 'Abrufanker: Wirtschaftswissenschaftliche Disziplinen', 'description': 'Die lernende Person ruft die knappen Begriffskerne zur sozialwissenschaftlichen Einordnung und zur VWL-/BWL-Perspektive ab; begründete Fallzuordnung wird an den zugeordneten gewöhnlichen Zielen geprüft.', 'weight': 1, 'contains': [], 'requires': [], 'tags': ['memorization', 'srs-deck:' + bb_deck_id, 'subject:economics', 'GK', 'LK'], 'applicability': {'jurisdiction': ['DE-BB', 'DE-BE']}, 'dimensionTags': {'framework': 'canonical-gymnasium-economics', 'demandLevel': 'AB1', 'phase': 'E', 'courseLevels': ['GK', 'LK'], 'processCompetencies': [], 'guidingIdeas': []}, 'extendedData': {'vocabularySource': '/data/' + bb_deck_id + '.de.json', 'authorCandidate': {'active': False, 'originGoalIds': bb_origins, 'deckDraftBinding': deck_file, 'retainedIndependentCardJudgment': info(BB_KEEP), 'independentNewNodeOriginOrVisibilityApproval': False, 'onlyOriginalTwoDECards': True, 'historicalEnglishCardApprovalClaimed': False}}, 'sourceRef': 'Canonical SkillPilot memory author candidate for two independently retained compact discipline definitions; applicability derives through actual reviewed ordinary origins.'}
write('one-additional-BB2-definitions-memory-node.exact-two-foreign-KEEP-DE-cards.author-candidate.json', bb_mem)
working = copy.deepcopy(base)
working['goals'].append(bb_mem)
nav = next(g for g in working['goals'] if g['id'] == '9658d512-618c-56ab-aecf-14aaec1005f4')
assert bb_mem_id not in nav['contains']
nav['contains'].append(bb_mem_id)
can_file = write('whole-CAN485-only-one-new-BB2-memory-node-and-one-source-navigation-child.inert-author-candidate.json', working)
assert len(working['goals']) == 485
assert all(goals[g['id']] == g for g in working['goals'] if g['id'] not in [bb_mem_id, nav['id']])
write('five-whole-memory-kinds-deck-SRS-and-origin-author-boundaries.json', {'fourUnchangedMemoryKinds': [{'goalId': g['id'], 'nativeExplicitNodeKind': 'memory', 'semanticKindProposal': 'memorization', 'ordinaryCurriculumDenominator': False, 'wholeGoal': g} for g in four], 'oneNewMemoryKindProposal': {'goalId': bb_mem_id, 'semanticKindProposal': 'memorization', 'newIndependentReview': 'pending', 'ordinaryCurriculumDenominator': False, 'wholeGoal': bb_mem}, 'sourcePrerequisiteGKHold': 'Six experimental GK tag proposals in source author base remain unapproved; this memory bridge changes none.'})

view_index = load(N / 'actual-full125-catalog-108-author-variants-closed-schema-and-official-GK-ambiguity-successor-v2.json')
variants = []
for v in view_index['variants']:
    p = R / v['view']['path']
    view = load(p)
    after = copy.deepcopy(view)
    selected = MEM_IDS[:2] + [bb_mem_id] if v['courseProfile'] == 'GK' else MEM_IDS + [bb_mem_id]
    old_nodes = copy.deepcopy(after['rootNodes'])
    after['rootNodes'][0]['children'].append({'kind': 'structure', 'id': v['variantId'] + '-required-memory', 'label': 'Abrufanker für erforderliche Begriffe', 'children': [{'kind': 'goalEntry', 'goalId': i, 'projectionRole': 'target'} for i in selected]})
    after_file = write('memory-course-placement-successors/' + p.name, after)
    check = copy.deepcopy(after)
    check['rootNodes'][0]['children'].pop()
    assert check == view
    variants.append({'variantId': v['variantId'], 'courseProfile': v['courseProfile'], 'before': info(p), 'after': after_file, 'ordinaryTargetsAndPrerequisiteOnlyRolesWholeExact': True, 'addedMemoryTargets': selected, 'wholeBeforeScope': view['scope'], 'actualLearnerSelection': None})
write('108-explicit-BE-course-variant-memory-only-placement-successors.portable-index.json', {'originalClosedSchemaIndex': info(N / 'actual-full125-catalog-108-author-variants-closed-schema-and-official-GK-ambiguity-successor-v2.json'), 'variants': variants, 'GK': 36, 'LK': 72, 'addedGKMemoryTargetsPerVariant': 3, 'addedLKMemoryTargetsPerVariant': 5, 'ordinaryTargetAndPrerequisiteSetsChanged': False, 'defaultDiscoveryInstallationApproved': False, 'officialGKAmbiguityUnresolved': True, 'newIndependentMemoryPlacementReview': 'pending'})

fp = load(O / 'actual-native-current-goal-card-fingerprints-and-existing311-staleness.json')
root_config_path = E8 / 'wirtschaft-final-nineteen-current311-after-methods20-native-preparation-20261008-v1/memory.config.json'
c = load(root_config_path)
old_lines = (R / c['reviewPath']).read_text().splitlines()
old_rows = [json.loads(x) for x in old_lines if x.strip()]
reused11 = load(O / 'actual-eleven-existing-foreign-KEEP-current-AM-record-reuse.check.json')
assert all(x['matches'] for x in reused11['rows']) and len(reused11['rows']) == 11
replacement11 = {x['goalId']: x['wholeRecord'] for x in reused11['rows']}
retained311 = [replacement11.get(x['goalId'], x) for x in old_rows]
assert sum(x != y for x, y in zip(retained311, old_rows)) == 11

am21 = load(B21 / 'twenty-one-memory-decisions-only-ground-none-procedure-purpose-origin-successor.proposal.json')
source25 = []
for x in am21:
    goal_id = x['goalId']
    if goal_id in ['2790f704-116b-577d-aca7-b502d57a21f6', 'f0b1bd59-a2ce-562b-bb63-6927f590dce2', '4c9b844f-a5fb-595b-935f-27cbc66610ae']:
        science = ROOT21 / 'actual-three-individual-whole-P6-AM-atomicity-and-source-scope-delta-decisions.json'
    elif goal_id == '0489aa68-7059-51dd-92bb-6d801c568449':
        science = PRODUCT / 'three-individual-independent-whole-need-P2-tax-atomicity-memory-and-source-facet-judgments.json'
    else:
        science = M18 / 'eighteen-individual-independent-whole-positive-P36-tax-atomicity-and-current-memory-judgments.json'
    source25.append({'schemaVersion': 1, 'reviewId': c['reviewId'], 'ruleVersion': c['ruleVersion'], 'landscapeId': c['landscapeId'], 'goalId': goal_id, 'fingerprint': fp['goals'][goal_id], 'status': x['decisionProposal'], 'memoryUseful': x['decisionProposal'] == 'memory_required', 'memoryGoalIds': x.get('memoryGoalIds', []), 'deckIds': x.get('deckIds', []), 'reviewedAt': '2026-10-09', 'reviewer': 'Retained independent original memory judgment; /root/economics_independent_continuation_a technical current-origin binder', 'reason': x['rationaleDe'] + ' Retain actual scientific decision: ' + rel(science) + '. New native envelope/origin/view binding is a technical author candidate pending independent delta review; no new card science or human approval.'})
for i in bb_origins:
    d = next(x for x in load(BB_KEEP)['goalDecisions'] if x['goalId'] == i)
    assert d['memoryDecision'] == 'memory_required'
    source25.append({'schemaVersion': 1, 'reviewId': c['reviewId'], 'ruleVersion': c['ruleVersion'], 'landscapeId': c['landscapeId'], 'goalId': i, 'fingerprint': fp['goals'][i], 'status': 'memory_required', 'memoryUseful': True, 'memoryGoalIds': [bb_mem_id], 'deckIds': [bb_deck_id], 'reviewedAt': '2026-10-09', 'reviewer': 'Retained original independent A memory decision; new native author envelope pending Root delta review', 'reason': d['ownReasonDe'] + ' Scientific source: ' + rel(BB_KEEP) + '. New narrow memory node/deck/origin placement author proposal; original market-order deck proposal fails current topic/advanced-prerequisite fit. Original two DE cards exact; no historical EN approval.'})
for p in [FAB, DIRECTOR]:
    x = load(p)
    source25.append({'schemaVersion': 1, 'reviewId': c['reviewId'], 'ruleVersion': c['ruleVersion'], 'landscapeId': c['landscapeId'], 'goalId': x['goalId'], 'fingerprint': fp['goals'][x['goalId']], 'status': 'no_memory_needed', 'memoryUseful': False, 'memoryGoalIds': [], 'deckIds': [], 'reviewedAt': '2026-10-09', 'reviewer': 'Retained independent source-need memory judgment; technical current binder', 'reason': x['memoryReasonDe'] + ' Retained actual individual independent decision: ' + rel(p) + '. No new scientific judgment or human approval.'})
assert len(source25) == 25 and len({x['goalId'] for x in source25}) == 25
assert sum(x['status'] == 'memory_required' for x in source25) == 11

for name, rows in [('memory-source25-only.review.jsonl', source25), ('memory-full336.review.jsonl', retained311 + source25)]:
    p = O / name
    assert not p.exists()
    p.write_text('\n'.join(json.dumps(x, ensure_ascii=False) for x in rows) + '\n')

old_card_bytes = (R / c['cardReviewPath']).read_bytes()
card_keep = load(M18 / 'eleven-individual-independent-whole-card-correctness-comprehensibility-and-necessity-judgments.json')
card_rows = []
for row in cards:
    card = row['wholeCard']
    old = next((x for x in card_keep if x['cardId'] == card['id']), None)
    if old:
        scientific_path = M18 / 'eleven-individual-independent-whole-card-correctness-comprehensibility-and-necessity-judgments.json'
        reason = old['independentNecessityReasonDe']
    else:
        scientific_path = PRODUCT / 'two-whole-product-card-and-memory-node-independent-minimum-necessity-judgments.json'
        old = next(x for x in load(scientific_path)['cards'] if x['cardId'] == card['id'])
        reason = old['necessityDe']
    if card['id'] == 'economics-insolvency-collective-creditors':
        assert card['originGoalIds'] == ['2790f704-116b-577d-aca7-b502d57a21f6']
        reason += ' Exact unchanged purpose content; current 2790 procedure origin independently accepted in ' + rel(ROOT21 / 'actual-three-individual-whole-P6-AM-atomicity-and-source-scope-delta-decisions.json') + '.'
    card_rows.append({'schemaVersion': 1, 'reviewId': c['reviewId'], 'ruleVersion': c['ruleVersion'], 'landscapeId': c['landscapeId'], 'deckId': row['deckId'], 'cardId': card['id'], 'fingerprint': fp['cards'][row['deckId'] + '::' + card['id']], 'status': 'kept', 'necessary': True, 'originGoalIds': card['originGoalIds'], 'reviewedAt': '2026-10-09', 'reviewer': 'Retained independent whole card KEEP; technical native current-origin binder', 'reason': reason + ' Retained scientific card judgment: ' + rel(scientific_path) + '. New native binding pending independent delta review; no historical content restart or human approval.'})
write('twelve-retained-scientific-card-keeps.native-author-envelopes.json', card_rows)
write('BB2-two-original-DE-cards.new-deck-native-fingerprint-inputs.json', {'deckId': bb_deck_id, 'cards': bb_cards})
write('actual-author-current-AM-bridge-review-input-and-delta-summary.json', {'base': info(base_path), 'wholeCandidate': can_file, 'rootConfig': info(root_config_path), 'root311Records': info(R / c['reviewPath']), 'unchangedRoot300Records': 300, 'elevenPreviouslyIndependentlyReviewedWholeRecordsReused': info(R / reused11['sourcePath']), 'Source25': 25, 'Source25MemoryRequired': 11, 'Source25NoMemoryNeeded': 14, 'fourExistingMemoryNodes': 4, 'nineExistingOrdinaryOrigins': 9, 'twelveExistingBilingualCards': 12, 'additionalBB2MemoryNode': bb_mem_id, 'additionalBB2OriginalDECards': 2, 'newOrdinaryGoals': 0, 'sixGKIntegrationProposalsStillHold': True, 'newScienceReviews': 0, 'strictClosures': 0, 'humanApproval': False})
print(json.dumps({'ordinaryMemoryRecords': 336, 'existingSourceMemories': 4, 'newBB2MemoryNode': bb_mem_id, 'existingBilingualCards': 12, 'BB2ExactDECards': 2, 'explicitReviewVariants': len(variants), 'Source25MemoryRequired': 11}))
