# SPDX-License-Identifier: Apache-2.0
"""Actual one-clause successor proof; original symbolic-language duty retained."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BEFORE = OWN / 'twenty-two-bounded-source-routes-author-v1'
AFTER = OWN / 'twenty-two-bounded-source-routes-author-v2'
def read(p): return json.loads(p.read_text())
def bind(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def verify(b):
    current = bind(ROOT / b['path'])
    assert current['sha256'] == b['sha256'].removeprefix('sha256:') and current['bytes'] == b['bytes'], b['path']
    return current

source_name = 'BY-twenty-two-whole-clause-bounded-routes.source-extraction.author-candidate.json'
map_name = 'BY-twenty-two-partial-source-routes.ordinary-mapping.author-candidate.json'
old_source, new_source = read(BEFORE / source_name), read(AFTER / source_name)
old_map, new_map = read(BEFORE / map_name), read(AFTER / map_name)
old_id = 'by-chem-b008-scope-97b4c9fa-f168-51e4-8ac8-eea11e602f60'
new_id = 'by-chem-b008-scope-a39a75ae-310a-5bc7-8822-983cd289d3a1'
old_sources = {s['id']: s for s in old_source['sourceGoals']}
new_sources = {s['id']: s for s in new_source['sourceGoals']}
assert old_sources.keys() - new_sources.keys() == {old_id}
assert new_sources.keys() - old_sources.keys() == {new_id}
shared = old_sources.keys() & new_sources.keys()
assert len(shared) == 48 and all(old_sources[k] == new_sources[k] for k in shared)
old_decisions = {d['sourceGoalId']: d for d in old_map['decisions']}
new_decisions = {d['sourceGoalId']: d for d in new_map['decisions']}
assert all(old_decisions[k] == new_decisions[k] for k in shared)
old_edges = [m for m in old_map['mappings'] if m['legacyGoalId'] != old_id]
new_edges = [m for m in new_map['mappings'] if m['legacyGoalId'] != new_id]
assert old_edges == new_edges and len(old_edges) == 58
assert len(old_map['mappings']) == len(new_map['mappings']) == 59
old_only = [m for m in old_map['mappings'] if m['legacyGoalId'] == old_id]
new_only = [m for m in new_map['mappings'] if m['legacyGoalId'] == new_id]
assert len(old_only) == len(new_only) == 1
assert old_only[0]['canonicalGoalId'] == new_only[0]['canonicalGoalId'] == '5b1bb5d9-07b1-5ba9-b320-cc97be917c60'
correct = new_sources[new_id]
assert correct['sourceSpan'] == 'C9-HG_SG_MUG_WWG_SWG.1.11'
assert correct['sourceOccurrences'][0]['sourceGoalId'] == 'd79d7aa5-4c6d-5734-98ae-b932fa93dca8'
assert correct['extendedData']['scopedWholeOriginalClauseRole']['originalSourceGoalId'] == '582de4c8-0b88-5191-b6d6-7cd73c5c069d'
source_text = 'beantworten chemische Fragestellungen, indem sie vorgegebene, auf einfachen Texten und wenigen Darstellungsformen beruhende Quellen auswerten.'
assert correct['sourceText'] == source_text
primary_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/primary-inputs/by9-ch.actual-main.txt'
assert re.sub(r'\s+', ' ', source_text) in re.sub(r'\s+', ' ', primary_path.read_text())
whole_new = read(AFTER / 'whole-twenty-two-source-route-operator-scope-and-partner.neutral-input.json')
whole_old = read(BEFORE / 'whole-twenty-two-source-route-operator-scope-and-partner.neutral-input.json')
assert whole_new['wholeSelectedGoals'] == whole_old['wholeSelectedGoals']
assert whole_new['exact22GoalIds'] == whole_old['exact22GoalIds']
original_bindings = [verify(b) for b in whole_new['originalAllMappingInputsUnchanged']]
by_path = ROOT / 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
bymap_path = ROOT / 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json'
by, bymap = read(by_path), read(bymap_path)
symbol_id = '49d7ff04-469d-59d8-a4df-5b7be048cd37'
symbol = next(s for s in by['sourceGoals'] if s['id'] == symbol_id)
symbol_decision = next(d for d in bymap['decisions'] if d['sourceGoalId'] == symbol_id)
symbol_edges = [m for m in bymap['mappings'] if m['legacyGoalId'] == symbol_id]
assert {'95dc0ee5-a0af-5682-af32-d66e36fbeb50', 'e7c363d4-e02d-4895-8750-ba62c2eb63fe'} <= set(symbol_decision['canonicalGoalIds'])
old_full_symbol = next(r['wholeOriginalSourceGoal'] for r in whole_old['wholeOriginalClausesPassagesDecisionsAndAllPartnerEdges'] if r['wholeOriginalSourceGoal']['id'] == symbol_id)
assert symbol == old_full_symbol
old_seal_path = BEFORE / 'twenty-two-bounded-source-routes-author.first.freeze.json'
old_seal = read(old_seal_path)
for b in old_seal['files']: verify(b)
old_partners = {i for r in whole_old['wholeOriginalClausesPassagesDecisionsAndAllPartnerEdges'] for i in r['wholeOriginalDecision']['canonicalGoalIds']}
new_partners = {i for r in whole_new['wholeOriginalClausesPassagesDecisionsAndAllPartnerEdges'] for i in r['wholeOriginalDecision']['canonicalGoalIds']}
assert len(old_partners) == 18 and len(new_partners) == 17 and new_partners <= old_partners
out_path = AFTER / 'actual-one-C9-nonNTG-whole-clause-remediation-and-original-preservation.json'
assert not out_path.exists()
out_path.write_text(json.dumps({
    'schemaVersion': 1, 'actualChangedRoutineGoalId': '5b1bb5d9-07b1-5ba9-b320-cc97be917c60',
    'beforeFirstSealedInput': bind(BEFORE / 'neutral-twenty-two-whole-bounded-source-routes.author-independent-review.entry.json'),
    'beforeFirstSealVerifiedUnchanged': bind(old_seal_path),
    'beforeWrongScopedWholeClause': old_sources[old_id],
    'afterCorrectScopedWholeClause': correct,
    'correctedOccurrenceSourceGoalId': 'd79d7aa5-4c6d-5734-98ae-b932fa93dca8',
    'actualDeduplicatedOriginalSourceGoalId': '582de4c8-0b88-5191-b6d6-7cd73c5c069d',
    'actualRetainedOfficialPrimary': bind(primary_path),
    'wholeClauseExactWhitespaceNormalizedSubstring': True,
    'shared48SourceGoalsAndDecisionsExact': True, 'other58PartialEdgesExact': True,
    'all22WholeGoalObjectsExact': True,
    'originalAll32AndReviewedSLMappingsByteExact': original_bindings,
    'originalBYExtraction': bind(by_path), 'originalBYMapping': bind(bymap_path),
    'originalSymbolLanguageWholeSourceGoalUnchanged': symbol,
    'originalSymbolLanguageWholeDecisionUnchanged': symbol_decision,
    'originalSymbolLanguageAllPartnerEdgesUnchanged': symbol_edges,
    'original18PartnerBodiesRemainReviewableFromBeforeEntry': True,
    'currentSelected49ClauseOriginalPartnerGoalIds': sorted(new_partners),
    'historicalOnlyPartnerBodiesRetainedAdditionally': sorted(old_partners - new_partners),
    'sourceInformationRoleOnlyGivenSimpleSourcesAtThisOccurrence': True,
    'noSelfResearchOrWholeSourceOrPracticalApproval': True,
    'C11UnspecifiedCourseHoldUnchanged': 'e5a5dcd8-053c-55fd-b5c7-bba93779da53',
    'newIndependentTargetedSourceAndCurrentOperativeAdoption': 'PENDING',
    'activeWrites': [], 'netStrictGain': 0, 'humanApproval': False}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'proof': bind(out_path), 'exactSourceGoals': 48, 'exactOtherEdges': 58,
                  'currentSelectedPartners': 17, 'allHistoricalPartnerBodiesRetained': 18, 'netStrictGain': 0}))
