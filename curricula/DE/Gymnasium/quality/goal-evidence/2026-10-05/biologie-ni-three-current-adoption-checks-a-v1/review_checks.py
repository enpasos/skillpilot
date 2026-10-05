# Apache-2.0. Targeted independent candidate review; writes only this folder.
from pathlib import Path
from collections import Counter
import datetime, hashlib, json, shutil

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05'
OUT = BASE / 'biologie-ni-three-current-adoption-checks-a-v1'
ROUTE = BASE / 'biologie-ni-current-source-integration-route-v1'
STAGE = BASE / 'biologie-q1-ni-consolidated-integration-candidate-v1/staged/ni-three-targeted-root-preparation-v1'
read = lambda p: json.loads(p.read_text())
digest = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
rel = lambda p: str(p.relative_to(ROOT))
now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
write = lambda name, value: (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

source_path = ROUTE / 'versioned-replacements/ni.current-source.review-pending.json'
mapping_path = ROUTE / 'versioned-replacements/ni.current-mapping.review-pending.json'
source, mapping = read(source_path), read(mapping_path)
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canonical, before_canonical = read(STAGE / 'canonical.biologie.candidate.json'), read(canonical_path)
source_delta = read(ROUTE / 'source-five-cells-and-one-retirement.delta.json')
mapping_delta = read(ROUTE / 'mapping-six-groups.delta.json')
units = read(ROUTE / 'canonical-current-membership.and-kind-review.units.json')
native = read(OUT / 'native-membership-and-fingerprint.check.receipt.json')
inventory = read(ROUTE / 'current-state.inventory.json')
before_source_path = ROOT / source_delta['beforeBinding']['path']
before_source = read(before_source_path)
before_mapping_path = ROOT / mapping_delta['predecessorBindings'][1]['path']
before_mapping = read(before_mapping_path)

goals = {g['id']: g for g in canonical['goals']}
before_goals = {g['id']: g for g in before_canonical['goals']}
sg = {g['id']: g for g in source['sourceGoals']}
before_sg = {g['id']: g for g in before_source['sourceGoals']}
passages = {p['id']: p for p in source['passages']}
decisions = {d['sourceGoalId']: d for d in mapping['decisions']}
selected = {x['sourceGoalId'] for x in source_delta['sourceGoals']}
changed = {x['sourceGoalId'] for x in source_delta['sourceGoals'] if x['after'] is not None}
retired = 'ni-biology-seki-kc2015-fw6-003-fd1495c5'
new_ids = {x['goalId'] for x in units['newGoalUnits']}
parent_ids = {x['goalId'] for x in units['changedParentUnits']}

assert len(sg) == len(source['sourceGoals']) == 123
assert len(passages) == len(source['passages']) == len(source['expectedTopicCodes']) == 18
assert {p['topicCode'] for p in passages.values()} == set(source['expectedTopicCodes'])
assert len(decisions) == len(mapping['decisions']) == 123 and set(decisions) == set(sg)
assert len(mapping['mappings']) == 334
assert retired not in sg and retired not in decisions
assert set(before_sg) - set(sg) == {retired} and not (set(sg) - set(before_sg))
assert {i for i in sg if sg[i] != before_sg[i]} == changed and len(changed) == 5
assert len(sg.keys() - changed) == 118
assert [x for x in before_source['sourceGoals'] if x['id'] not in selected] == [x for x in source['sourceGoals'] if x['id'] not in selected]
assert [x for x in before_mapping['decisions'] if x['sourceGoalId'] not in selected] == [x for x in mapping['decisions'] if x['sourceGoalId'] not in selected]
unchanged_rows = [x for x in mapping['mappings'] if x['legacyGoalId'] not in selected]
assert len(unchanged_rows) == 328
assert [x for x in before_mapping['mappings'] if x['legacyGoalId'] not in selected] == unchanged_rows
assert len(set((r['legacyGoalId'], r['canonicalGoalId']) for r in mapping['mappings'])) == 334
source_target_cache_mismatches = []
for g in sg.values():
    assert g['passageId'] in passages and g['sourceSpan']['passageId'] == g['passageId']
    assert g['sourceDocumentKey'] == source['sourceDocument']['key']
    assert all(g.get(k) for k in ['headingTitle', 'sourceRef', 'sourceText', 'sourceSpanText'])
    assert g['sourceSpan']['label'] and g['metadata']['sourcePage'] in range(75, 93)
    assert g['topicCode'] == passages[g['passageId']]['topicCode']
    d = decisions[g['id']]
    assert d['id'] == g['id'] and d['status'] == d['decision'] == 'mapped'
    assert d['canonicalGoalIds'] and d.get('rationale') and d.get('reviewer') and d.get('reviewedAt')
    rows = [r for r in mapping['mappings'] if r['legacyGoalId'] == g['id']]
    assert rows and {r['canonicalGoalId'] for r in rows} == set(d['canonicalGoalIds'])
    if set(d['canonicalGoalIds']) != set(g['metadata']['canonicalTargets']):
        assert g['id'] not in changed
        source_target_cache_mismatches.append({'sourceGoalId': g['id'], 'authoritativeMappingTargets': d['canonicalGoalIds'], 'preservedSourceMetadataTargets': g['metadata']['canonicalTargets'], 'status': 'inherited_advisory_cache_mismatch', 'operationalReaderFinding': 'No canonicalTargets read in inspected generateCurriculumQualityStatus.ts or goalBookSourceAtlasInputs.ts; current mapping rows/decisions are the operative route.'})
    if g['id'] in changed:
        assert set(d['canonicalGoalIds']) == set(g['metadata']['canonicalTargets'])
for row in mapping['mappings']:
    assert row['legacyGoalId'] in sg and row['canonicalGoalId'] in goals
    assert row['reviewDecisionId'] == row['legacyGoalId']
    assert row['matchType'] in ['partial', 'exact']
for delta in source_delta['sourceGoals']:
    assert before_sg[delta['sourceGoalId']] == delta['before']
    assert sg.get(delta['sourceGoalId']) == delta['after']
for delta in mapping_delta['groups']:
    i = delta['sourceGoalId']
    assert [x for x in mapping['mappings'] if x['legacyGoalId'] == i] == delta['afterRows']
    assert [x for x in before_mapping['mappings'] if x['legacyGoalId'] == i] == delta['beforeRows']
    assert decisions.get(i) == delta['afterDecision']
assert set(goals) - set(before_goals) == new_ids and not (set(before_goals) - set(goals))
assert {i for i in before_goals if before_goals[i] != goals[i]} == parent_ids
for i in parent_ids:
    assert {k for k in set(before_goals[i]) | set(goals[i]) if before_goals[i].get(k) != goals[i].get(k)} == {'contains'}
    assert goals[i]['contains'][:len(before_goals[i]['contains'])] == before_goals[i]['contains']
    assert len(goals[i]['contains']) == len(set(goals[i]['contains']))
for i in new_ids:
    assert goals[i]['contains'] == [] and goals[i]['type'] == 'atomic' and goals[i]['weight'] == 1
    assert all(r in goals for r in goals[i]['requires'])
    assert goals[i]['applicability']['jurisdiction'] == ['DE-NI']
    assert goals[i]['extendedData']['applicabilityMappingInheritance'] == 'boundary'
assert native['currentLedgerAtomCount'] == 363 and native['proposedAtomSetCount'] == 366
assert len(goals) == 444 and len(before_goals) == 441
for edge in ['contains', 'requires']:
    visiting, visited = set(), set()
    def dfs(i):
        assert i not in visiting, (edge, i)
        if i in visited: return
        visiting.add(i)
        for j in goals[i].get(edge, []):
            assert j in goals, (edge, i, j)
            dfs(j)
        visiting.remove(i); visited.add(i)
    for i in goals: dfs(i)

active_checks = []
for b in inventory['bindings']:
    p = ROOT / b['path']; actual = digest(p)
    assert actual == b['sha256'], (b['path'], actual)
    active_checks.append({'path': b['path'], 'expectedDigest': b['sha256'], 'actualDigest': actual, 'unchanged': True})
pdf_path = ROOT / source['sourceDocument']['path']
assert digest(pdf_path) == inventory['retainedPrimaryPdf']['sha256']
assert read(STAGE / 'ni.source-extraction.candidate.json')['sourceGoals'] == source['sourceGoals']
assert read(STAGE / 'ni.mapping.candidate.json')['mappings'] == mapping['mappings']
assert read(STAGE / 'ni.mapping.candidate.json')['decisions'] == mapping['decisions']

evidence = {
 'source-goals-created': '123 current Source-IDs = 124 predecessor IDs minus unsupported FW6-003; exactly five records changed and 118 records preserved byte-for-byte as parsed records. Five actual official table cells on pages 87-89 inspected visually and in extracted text.',
 'passage-to-source-goal-coverage': '18/18 expected topic passages exist and each has at least one current Source goal; counts: ' + json.dumps(dict(Counter(g['topicCode'] for g in sg.values())), ensure_ascii=False, sort_keys=True),
 'source-goal-ids-unique': '123 records and 123 distinct nonempty Source-IDs; retirement absent and no new fabricated Source-ID.',
 'source-goals-reference-passages': '123/123 passageId and sourceSpan.passageId resolve to the same existing passage; topic codes and sourceDocumentKey agree.',
 'source-goal-trace-complete': '123/123 have nonempty headingTitle, sourceText, sourceSpan.label, sourceSpanText, sourceRef and a sourcePage within the retained competence-table window 75-92. Selected page/cell/grade columns independently checked on actual PDF87-89.',
 'source-goal-count-peer-baseline-local-audit': 'Targeted count reconciliation: 118 unchanged previously decided groups + five corrected table-cell groups = 123. FW6-003 is an introduction-derived synthetic competence and is retired, not counted as an extra bullet. Existing peer-baseline exception preserved; no new global peer or whole-PDF audit is claimed.',
 'current-selected-source-adoption-review': 'PASS targeted AI adoption candidate: FW6-004 (p87, additional end grade10) maps exactly to bounded chromosomal mitotic-identity target, plus existing mitosis description as partial; FW6-010/011 (p88, additional end grade10) jointly support nonmolecular gene-product-trait model; FW7-001/002 (p89, end grade6) jointly support observable unguided variation. FW6-003 and its three rows retire. No molecular mechanism inferred.',
 'mapping-2-complete': 'All seven MAPPING-2 candidate checks PASS in this independent targeted review. Completion metadata may be adopted only together with these exact source, mapping and canonical bytes plus active predecessor archival; live source is unchanged and still pending.',
 'm3-review-file-present': 'Actual versioned current-mapping candidate is present; sourceLandscapeId and targetLandscapeId agree with source/canonical. sourceExtractionPath names the exact proposed current source successor. Staged rows and decisions are identical.',
 'm3-review-decisions-reference-source-goals': '123/123 unique mapped decisions refer to current Source-IDs; zero unknown/retired Source-IDs. 334/334 rows resolve to those decisions; zero duplicate source-target pairs.',
 'm3-review-targets-exist': '334/334 mapped Canonical targets exist in the 444-record staged canonical successor; zero invalid targets. Three newly introduced targets and their two additive parents are independently reviewed here.',
 'm3-all-source-goals-reviewed': '123/123 mapped decisions with rationale/reviewer/time and nonempty valid targets; 118 unchanged historical decisions preserved exactly, five selected decisions independently adopted as current AI candidates. Zero unreviewed decision records or needsCanonicalGoal statuses. Preserved FW6-008 rationale explicitly leaves an independent recombination-principles witness open. Reviewed/decided is therefore distinguished from fully covered. This is not a fresh substantive approval of all118 historical cells.',
 'm3-all-source-goals-covered-by-canonical': 'HOLD for substantive complete coverage, while structural123/123 mapped coverage passes. Preserved current decision ni-biology-seki-kc2015-fw6-008-d14910ea expressly leaves an independent witness of recombination principles open after the unsupported trisomy target was removed. The actual p87 FW6.2 bullet requires recombination principles based on meiosis; remaining generic mitosis/meiosis descriptions do not resolve the documented gap. Do not relabel it as complete. 334 rows =328 preserved +six current selected rows. Three unchanged source metadata target caches still contain removed0dd838...; current mapping decisions are the operative route. The five targeted groups and retirement pass independently.',
}
checks = []
for step in source['pipelineStatus']['steps']:
    if step['id'] not in ['MAPPING-2', 'MAPPING-3']: continue
    assert len(step['checks']) == 7
    for check in step['checks']:
        assert check['id'] in evidence
        passed = check['id'] != 'm3-all-source-goals-covered-by-canonical'
        checks.append({'stepId': step['id'], 'checkId': check['id'], 'label': check['label'], 'verdict': 'PASS' if passed else 'HOLD', 'passed': passed, 'details': evidence[check['id']], 'scope': 'candidate adoption of the exact NI3 package; active integration remains HOLD'})

bindings = []
for p in [source_path, mapping_path, STAGE / 'canonical.biologie.candidate.json', STAGE / 'ni.source-extraction.candidate.json', STAGE / 'ni.mapping.candidate.json', ROUTE / 'source-five-cells-and-one-retirement.delta.json', ROUTE / 'mapping-six-groups.delta.json', ROUTE / 'canonical-current-membership.and-kind-review.units.json', canonical_path, pdf_path]:
    bindings.append({'path': rel(p), 'digest': digest(p), 'bytes': p.stat().st_size})

report = {'reviewId': 'biologie-ni-three-current-adoption-checks-a-v1', 'status': 'candidate', 'reviewAuthority': 'ai_candidate', 'frozenAt': now, 'independentSourceVerdict': 'PASS', 'independentTargetDescriptionVerdict': 'KEEP_THREE', 'activeIntegrationVerdict': 'HOLD_PENDING_ROOT_ADOPTION', 'fullMapping3Verdict': 'HOLD_PRESERVED_RECOMBINATION_COVERAGE_FINDING', 'humanApproval': False, 'pContentsRead': False, 'wholePdfReReviewClaimed': False, 'checks': checks, 'counts': {'currentSourceGoals': 123, 'passages': 18, 'fullyDecidedSourceGroups': 123, 'mappingRows': 334, 'unchangedSourceRecords': 118, 'unchangedDecisions': 118, 'unchangedMappingRows': 328, 'selectedMappingRowsBefore': 20, 'selectedMappingRowsAfter': 6, 'changedSourceCells': 5, 'retiredSyntheticSourceGoals': 1, 'newCanonicalAtoms': 3, 'changedCanonicalParents': 2, 'currentCurricularAtomic': 363, 'futureCurricularAtomic': 366, 'futureCanonicalTotal': 444}, 'rowMatchTypes': dict(Counter(r['matchType'] for r in mapping['mappings'])), 'decisionMatchTypes': dict(Counter(d['matchType'] for d in decisions.values())), 'preservedSourceTargetCacheMismatches': source_target_cache_mismatches, 'bindings': bindings, 'activePreservationChecks': active_checks, 'activeWrites': 0, 'machineClosures': 0}
write('mapping-2-3.independent-checks.frozen.json', report)

proposed_pipeline = json.loads(json.dumps(source['pipelineStatus']))
proposed_pipeline['currentStep'] = 'MAPPING-3'
for step in proposed_pipeline['steps']:
    if step['id'] not in ['MAPPING-2', 'MAPPING-3']: continue
    step['status'] = 'complete' if step['id'] == 'MAPPING-2' else 'blocked'
    for check in step['checks']:
        check['passed'] = check['id'] != 'm3-all-source-goals-covered-by-canonical'; check['details'] = evidence[check['id']]
quality_review = json.loads(json.dumps(source['qualityReview']))
quality_review.update({'status': 'targeted_current_source_adoption_ai_reviewed', 'reviewedBy': 'OpenAI Codex independent NI3 adoption review A; exact model unexposed', 'reviewedAt': now, 'notes': ['Independent targeted candidate review of the five actual cells on original PDF pages87-89, FW6-003 retirement, three bounded canonical atoms and two additive parents.', '118 unchanged source records and decisions, and 328 unchanged mapping rows, preserved from the actual current predecessor. No whole-PDF re-review or human/source-rights/legal approval claimed.', 'MAPPING-2 complete and MAPPING-3 blocked are proposed candidate adoption metadata only after coupled source/canonical/mapping integration and byte archival outside active scanners. The preserved current FW6-008 recombination-principles coverage finding remains open; three inherited source metadata target caches differ from the operative current mapping.', 'MAPPING-3 must remain blocked: generateCurriculumQualityStatus.ts normalizes nonblocked M3 from structural mapped/decided counts and would otherwise turn the documented substantive gap into complete. Structural123/123 mapping coverage may be shown only as preliminary.']})
quality_review['sourceGoalCountPeerBaseline']['details'] = 'Targeted current reconciliation: 118 unchanged historic structured Source records plus five corrected actual table cells =123; introduction-derived synthetic FW6-003 removed. Existing NI Biologie EG1-EG4, KK, BW, FW1-FW8 table-window basis preserved; no new whole-PDF or global peer approval claimed.'
write('allowed-source-evidence-metadata.delta.candidate.json', {'status': 'candidate', 'reviewAuthority': 'ai_candidate', 'activeWrites': 0, 'humanApproval': False, 'bindingDigest': digest(source_path), 'targetCurrentPath': source_delta['afterCurrentPath'], 'allowedReplacementsOnly': {'qualityReview': quality_review, 'pipelineStatus': proposed_pipeline}, 'requiresCoupledRootAdoption': True, 'unchangedFields': 'Every other source-document, passage and sourceGoal field must equal the versioned current-source candidate.'})
write('allowed-mapping-evidence-metadata.delta.candidate.json', {'status': 'candidate', 'reviewAuthority': 'ai_candidate', 'humanApproval': False, 'bindingDigest': digest(mapping_path), 'targetCurrentPath': mapping_delta['currentSuccessorPath'], 'allowedReplacementsOnly': {'status': 'reviewed-targeted-current-source-adoption'}, 'mustKeep': {'sourceLandscapeId': mapping['sourceLandscapeId'], 'targetLandscapeId': mapping['targetLandscapeId'], 'sourceExtractionPath': mapping['sourceExtractionPath'], 'summary': mapping['summary']}, 'unchangedFields': 'All334 mappings and123 decisions must remain exactly equal to the versioned current-mapping candidate; no historic reviewer or timestamp is relabeled.'})

for n in ['087', '088', '089']:
    shutil.copyfile(Path('/tmp/biologie-ni-three-current-adoption-checks-a-v1') / ('source-page-' + n + '.png'), OUT / ('source-page-' + n + '.png'))
print(json.dumps({'status': 'TARGETED_SOURCE_PASS_FULL_M3_HOLD', 'checks': len(checks), 'pass': sum(c['passed'] for c in checks), 'hold': sum(not c['passed'] for c in checks), 'sourceGroups': 123, 'mappingRows': 334, 'unchangedSourceAndDecisions': 118, 'unchangedMappingRows': 328, 'futureAtoms': 366, 'reportDigest': digest(OUT / 'mapping-2-3.independent-checks.frozen.json')}, ensure_ascii=False))
