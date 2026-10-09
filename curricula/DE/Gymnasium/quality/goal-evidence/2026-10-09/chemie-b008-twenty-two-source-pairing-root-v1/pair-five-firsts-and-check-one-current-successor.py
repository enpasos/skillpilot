# SPDX-License-Identifier: Apache-2.0
"""Conservative pairing of actual firsts plus exact affected successor evidence."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = next(p for p in OWN.parents if (p / '.git').exists() and (p / 'AGENTS.md').is_file())
BASE = OWN.parent
A = BASE / 'chemie-b008-twenty-two-source-routes-independent-a-root-v1'
B = BASE / 'chemie-b008-twenty-two-bounded-source-routes-independent-b-v1'
AUTHOR = BASE / 'chemie-b008-current-twenty-six-native-preparation-author-v1'
V1 = AUTHOR / 'twenty-two-bounded-source-routes-author-v1'
V2 = AUTHOR / 'twenty-two-bounded-source-routes-author-v2'
CHECKED = {}


def read(p):
    return json.loads(p.read_text())


def bind(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(v):
    p = ROOT / v['path']
    actual = bind(p)
    assert actual['sha256'] == v['sha256'].removeprefix('sha256:'), p
    assert 'bytes' not in v or actual['bytes'] == v['bytes'], p
    CHECKED[v['path']] = actual
    return p


def verify_tree(v):
    if isinstance(v, dict):
        if isinstance(v.get('path'), str) and isinstance(v.get('sha256'), str):
            verify(v)
        for child in v.values():
            verify_tree(child)
    elif isinstance(v, list):
        for child in v:
            verify_tree(child)


def put(p, v):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')


a_path = A / 'five-new-lower-source-roles.whole-science.independent-A.first.verdict.json'
b_entry = B / 'completed-source22-whole-bounded-routes.independent-b.review.entry.json'
ae = read(a_path)
be = read(b_entry)
verify_tree(ae)
verify_tree(be)
b_path = verify(be['actualFirstVerdict'])
bd = read(b_path)
verify_tree(bd)
aa = {r['goalId']: r for r in ae['records']}
bb = {r['goalId']: r for r in bd['newFiveGoalResults']}
assert set(aa) == set(bb) and len(aa) == 5
bad_goal = '5b1bb5d9-07b1-5ba9-b320-cc97be917c60'
assert ae['finding']['goalId'] == bd['concreteNewFindings'][0]['goalId'] == bad_goal
assert ae['finding']['scopedSourceGoalId'] == bd['concreteNewFindings'][0]['scopedSourceGoalId']
pair_rows = []
for gid in aa:
    assert 'HOLD' in aa[gid]['decision'] if gid == bad_goal else 'ACCEPT' in aa[gid]['decision']
    assert 'HOLD' in bb[gid]['decision'] if gid == bad_goal else 'ACCEPT' in bb[gid]['decision']
    pair_rows.append({'goalId': gid, 'independentA': bind(a_path), 'independentB': bind(b_path),
                     'decision': 'HOLD_ONE_WRONG_SOURCE_ROUTE' if gid == bad_goal else 'ACCEPT_BOUNDED_PARTIAL_ROLE_ONLY',
                     'independentAReason': aa[gid]['ownScientificReasonDe'], 'independentBReason': bb[gid]['ownReason']})
pair_path = OWN / 'five-new-lower-source-roles.conservative-independent-first-pair.actual.json'
put(pair_path, {'schemaVersion': 1, 'pairedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Technical pairing after genuine separate immutable scientific firsts',
    'records': pair_rows, 'independentAFirst': bind(A / 'five-new-lower-source-roles.whole-science.independent-A.first.freeze.json'),
    'independentBFirst': bind(verify(be['actualFirstFreeze'])), 'exactCheckedBindings': list(CHECKED.values()),
    'wholeSourceClausesAndPartnersActuallyReadByBoth': True,
    'newBoundedPartialEdges': 20, 'wrongClauseHolds': 1, 'unmodifiedHistoricalRolesReused': 17,
    'sourceMetadataAndNationalAtlasAndNativeContextGatesRemainSeparate': True,
    'newScientificClosures': 0, 'restoredM7Bindings': 0, 'strictGain': 0, 'activeWrites': 0,
    'humanApproval': False, 'humanTrial': False})
put(OWN / 'five-new-lower-source-roles.conservative-first-pair.freeze.json',
    {'schemaVersion': 1, 'role': 'Immutable first technical pairing', 'pair': bind(pair_path)})

entry = V2 / 'neutral-twenty-two-whole-bounded-source-routes.author-independent-review.entry.json'
new = read(entry)
verify_tree(new)
input_first = OWN / 'one-actual-C9-source-successor.independent-A.input.first.freeze.json'
put(input_first, {'schemaVersion': 1, 'role': 'Actual targeted v2 input before own followup verdict; no new peer v2 verdict read',
    'authorEntry': bind(entry), 'files': list(CHECKED.values()), 'oldSeparateFirstPair': bind(pair_path),
    'createdAt': datetime.now(timezone.utc).isoformat(), 'freshPeerFollowupRead': False})
old = read(V1 / entry.name)
ex1, ex2 = [read(verify(e['newOrdinarySourceExtraction'])) for e in (old, new)]
mp1, mp2 = [read(verify(e['newOrdinaryMapping'])) for e in (old, new)]
mat1, mat2 = [read(verify(e['whole22SourceRoleAndPartnerInput'])) for e in (old, new)]
delta = read(verify(new['exactOneClauseRemediationFromImmutableV1']))
verify_tree(delta)
old_id = 'by-chem-b008-scope-97b4c9fa-f168-51e4-8ac8-eea11e602f60'
new_id = 'by-chem-b008-scope-a39a75ae-310a-5bc7-8822-983cd289d3a1'
old_clauses = {r['id']: r for r in ex1['sourceGoals']}
new_clauses = {r['id']: r for r in ex2['sourceGoals']}
assert len(old_clauses) == len(new_clauses) == 49
assert set(old_clauses) - set(new_clauses) == {old_id}
assert set(new_clauses) - set(old_clauses) == {new_id}
assert all(old_clauses[k] == new_clauses[k] for k in set(old_clauses) & set(new_clauses))
old_decisions = {r['sourceGoalId']: r for r in mp1['decisions']}
new_decisions = {r['sourceGoalId']: r for r in mp2['decisions']}
assert all(old_decisions[k] == new_decisions[k] for k in set(old_clauses) & set(new_clauses))
edge_key = lambda r: (r['legacyGoalId'], r['canonicalGoalId'])
edges1, edges2 = [{edge_key(r): r for r in m['mappings']} for m in (mp1, mp2)]
assert len(edges1) == len(edges2) == 59
assert set(edges1) - set(edges2) == {(old_id, bad_goal)}
assert set(edges2) - set(edges1) == {(new_id, bad_goal)}
assert all(edges1[k] == edges2[k] for k in set(edges1) & set(edges2))
assert mat1['wholeSelectedGoals'] == mat2['wholeSelectedGoals']
correct = new_clauses[new_id]
assert correct['sourceSpan'] == 'C9-HG_SG_MUG_WWG_SWG.1.11'
assert correct['sourceOccurrences'][0]['sourceGoalId'] == 'd79d7aa5-4c6d-5734-98ae-b932fa93dca8'
assert correct['extendedData']['scopedWholeOriginalClauseRole']['originalSourceGoalId'] == '582de4c8-0b88-5191-b6d6-7cd73c5c069d'
assert correct['sourceText'] == 'beantworten chemische Fragestellungen, indem sie vorgegebene, auf einfachen Texten und wenigen Darstellungsformen beruhende Quellen auswerten.'
primary = verify(delta['actualRetainedOfficialPrimary'])
assert ' '.join(correct['sourceText'].split()) in ' '.join(primary.read_text().split())
original_ex = read(verify(delta['originalBYExtraction']))
original_mp = read(verify(delta['originalBYMapping']))
assert next(r for r in original_ex['sourceGoals'] if r['id'] == '49d7ff04-469d-59d8-a4df-5b7be048cd37') == delta['originalSymbolLanguageWholeSourceGoalUnchanged']
assert next(r for r in original_mp['decisions'] if r['sourceGoalId'] == '49d7ff04-469d-59d8-a4df-5b7be048cd37') == delta['originalSymbolLanguageWholeDecisionUnchanged']
assert [r for r in original_mp['mappings'] if r['legacyGoalId'] == '49d7ff04-469d-59d8-a4df-5b7be048cd37'] == delta['originalSymbolLanguageAllPartnerEdgesUnchanged']
partners_old, partners_new = [read(verify(e['whole18CurrentAndProspectivePartnerBodies'])) for e in (old, new)]
assert partners_old['partners'] == partners_new['partners'] and len(partners_new['partners']) == 18
proof = OWN / 'one-C9-successor.exact-scientific-input-and-preservation.independent-A.actual.json'
put(proof, {'schemaVersion': 1, 'actualInputFirst': bind(input_first), 'actualCorrectWholeClause': correct,
    'all22GoalsValueExact': True, 'other48WholeClausesAndDecisionsValueExact': True, 'other58PartialEdgesValueExact': True,
    'all18OriginalPartnerBodiesValueExact': True, 'originalSymbolWholeClauseDecisionAnd95dc_e7cEdgesValueExact': True,
    'actualWholeOfficialPrimaryClauseFound': True, 'actualCheckedBindings': list(CHECKED.values()),
    'scienceReviewIsNotMerelyHashChange': True, 'humanApproval': False, 'strictGain': 0})
print(json.dumps({'pairedFive': 5, 'newCompatibleEdges': 20, 'oldWrongRouteHeld': 1,
    'targetedV2InputAndWholeClauseVerified': True, 'pair': bind(pair_path), 'proof': bind(proof)}))
