# SPDX-License-Identifier: Apache-2.0
"""C7 P4-preserving technical successor: dry-run by default; an explicit later Root GO is mandatory to write."""
import argparse
import copy
import datetime
import hashlib
import importlib.util
import json
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
A = BASE / 'chemie-current450-eight-constant-composition-general-data-source-author-successor-20261018-v1'
R = BASE / 'chemie-current450-eight-constant-composition-general-data-source-informed-independent-a-20261018-v1'
T = BASE / 'chemie-current450-seven-data-source-reviewed-integration-technical-20261018-v1'
GOAL = 'e0d05c36-eaac-4c75-8ead-3fd5bdafefca'
META = 'c7QuantitativeDataPartialIntegration'
def read(p):
    return json.loads(Path(p).read_text())
def digest(o):
    return hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def pin(p):
    b = Path(p).read_bytes()
    return dict(path=str(p), sha256=hashlib.sha256(b).hexdigest(), bytes=len(b))
def verified_pin(p, expected):
    actual = pin(p)
    assert actual['sha256'] == expected, p
    return actual
def verify_seal(p, expected):
    result = verified_pin(p, expected)
    for f in read(p)['files']:
        assert pin(f['path']) == f, f['path']
    return result

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--apply-after-explicit-root-go', action='store_true')
parser.add_argument('--root-go-receipt', help='Repo-relative JSON record of the actually received later Root GO; never inferred from elapsed time.')
args = parser.parse_args()
if args.apply_after_explicit_root_go:
    assert args.root_go_receipt, 'Root GO receipt required'
    go = read(args.root_go_receipt)
    assert go['rootExplicitGoActuallyReceived'] is True
    assert go['authorizationScope'] == 'C7:5 source inventories +15 mapping aliases only'
    assert go['c40ExclusiveWritePhaseReleased'] is True
    assert go['actualRootMessageText']
    assert not Path(args.root_go_receipt).is_absolute()

author_seal = verify_seal(A / 'SEAL.inactive-eight-general-data-source-author-successor.json', '47f2aa9898e1279f5f4184f421839303c9e374962f0e5254012b412fec88d209')
review_seal = verify_seal(R / 'SEAL.independent-a.C7-seven-quantitative-source-successor.json', 'fdd5b7f42626545589262c1b576871a541674a98ae6818a02c6ab5820ae38c0a')
first_pin = verified_pin(R / 'FIRST.independent-a.seven-quantitative-data-source-contributions.json', '8854fffa6b2ea3f8e37b40ac01d9ff62e9c7fd9dc8f820848ff47910ba6777f4')
first = read(first_pin['path'])
assert [r['decision'] for r in first['records']] == ['APPROVE'] * 7 + ['HOLD']
accepted = read(R / 'INTEGRATION.accepted-seven-partial-source-relations-fifteen-alias-tuples.json')
ops = accepted['acceptedOperations']
inp = read(A / 'INPUT.one-whole-current-goal-and-whole-positive-native-profile.actual.json')
assert next(g for g in read(inp['canonical']['path'])['goals'] if g['id'] == GOAL) == inp['wholeGoal']
owner = inp['wholeCurrentPositiveOwner']
# Explicit post-preparation P4 successor: preserve the accepted C7 profile prefix.
central_path = inp['central']['path']
subject = next(s for s in read(central_path)['subjects'] if s['subject'] == 'chemie')
current_configs = [(p, read(p)) for p in subject['positiveEvidenceConfigPaths'] if GOAL in read(p).get('scope',{}).get('goalIds',[])]
assert len(current_configs) == 1
current_config_path, current_config = current_configs[0]
current_records = [(n+1,json.loads(line)) for n,line in enumerate(Path(current_config['reviewPath']).read_text().splitlines()) if json.loads(line)['goalId'] == GOAL]
assert len(current_records) == 1
current_line, current_record = current_records[0]
old_record = owner['wholeCurrentRecord']; old_profile = old_record['profile']; current_profile = current_record['profile']
for key in ('reviewId','goalFingerprintRuleVersion','profileRuleVersion','reviewCriteriaFingerprint','landscapeId','goalId','goalFingerprint','reviewInputFingerprint','status','reviewAuthority','evidenceLevel','maximumClaimScope','reviewRunIds'):
    assert current_record[key] == old_record[key], key
for key in ('expectations','variationAxes','applicationCaseBriefs'):
    assert current_profile[key][:len(old_profile[key])] == old_profile[key], key
    assert len(current_profile[key]) == len(old_profile[key])+1, key
assert {k:v for k,v in current_profile.items() if k not in ('expectations','variationAxes','applicationCaseBriefs','coverageExpectations')} == {k:v for k,v in old_profile.items() if k not in ('expectations','variationAxes','applicationCaseBriefs','coverageExpectations')}
old_coverage=old_profile['coverageExpectations']; current_coverage=current_profile['coverageExpectations']
assert current_coverage['requiredExpectationIds'] == old_coverage['requiredExpectationIds'] + ['sl-constant-composition-with-supplied-coefficients']
assert {k:v for k,v in current_coverage.items() if k!='requiredExpectationIds'} == {k:v for k,v in old_coverage.items() if k!='requiredExpectationIds'}
assert current_profile['expectations'][-1]['id'] == 'sl-constant-composition-with-supplied-coefficients'
assert current_profile['variationAxes'][-1]['id'] == 'sl-constant-composition-fresh-third-portion'
assert current_profile['applicationCaseBriefs'][-1]['id'] == 'sl-9-constant-composition-coefficient-interpretation'
current_p_binding=dict(currentPositiveConfig=pin(current_config_path),currentNativeRecordFile=pin(current_config['reviewPath']),lineOneBased=current_line,currentWholeNativeRecordObjectSHA256=digest(current_record),currentWholeProfileObjectSHA256=digest(current_profile),acceptedOriginalCuOFeSPrefixExactlyRetained=True,oldCoverageThresholdsAndAllEarlierRequiredIdsRetained=True,onlySeparateSLExpectationVariationAndCaseAppended=True,wholeCurrentProfileAndMetadataActuallyRead=True,newSLRelationInC7=False,actualCentralConfig=pin(central_path),centralPositiveConfigCount=len(subject['positiveEvidenceConfigPaths']))

author = read(A / 'AUTHOR.eight-general-data-source-bindings.successor.pending.json')
changes = []
observed = []
source_cache = {}
meta_base = dict(technicalPackagePath=str(T), foreignAuthorSeal=author_seal, independentSourceFirst=first_pin, independentSourceSeal=review_seal, wholeSourceCoverageEstablished=False, officialWholeConstantCompositionRequirement=False, newWholeSourceApprovals=0, newScientificFirstDecisionsByTechnicalIntegrator=0, newNativeDPAMVVotes=0, actualLearnerExecutionClaim=False, ownMeasurementExperimentOrDigitalProductClaim=False, humanApprovalClaim=False)

for row in author['records'][:7]:
    source = row['source']; path = source['normalExtractionPath']; before = read(path)
    source_cache[path] = before
    assert pin(source['primaryPDF']['path']) == source['primaryPDF']
    sg = source['wholeSource']; passage = source['wholePassage']
    hits = [g for g in before['sourceGoals'] if g['id'] == sg['id']]
    if row['ordinal'] in (1, 4):
        assert hits == [sg]
        assert [p for p in before['passages'] if p['id'] == passage['id']] == [passage]
        observed.append(dict(path=path, before=pin(path), action='read-only-existing-source-and-passage-exact', sourceGoalId=sg['id']))
        continue
    addition_path = A / ('candidate/extraction-additions/' + row['jurisdiction'][3:] + '.one-complete-general-data-operator.addition.pending.json')
    addition = read(addition_path)
    assert addition['sourceGoalsToAppend'] == [sg] and addition['passagesToAppend'] == [passage]
    assert not hits
    assert not any(p['id'] == passage['id'] for p in before['passages'])
    assert [d for d in before['sourceDocuments'] if d['key'] == addition['sourceDocument']['key']] == [addition['sourceDocument']]
    assert META not in before
    after = copy.deepcopy(before)
    after['sourceGoals'].append(sg); after['passages'].append(passage)
    after[META] = dict(meta_base, addedWholeSelectedSourceGoalIds=[sg['id']], currentSourceInventoryCountBefore=len(before['sourceGoals']), currentSourceInventoryCountAfter=len(after['sourceGoals']), allOldSourceGoalsPassagesAndMetadataRetainedExactly=True)
    assert after['sourceGoals'][:-1] == before['sourceGoals']
    assert after['passages'][:-1] == before['passages']
    assert {k:v for k,v in after.items() if k not in ('sourceGoals','passages',META)} == {k:v for k,v in before.items() if k not in ('sourceGoals','passages',META)}
    source_cache[path] = after
    changes.append(dict(path=path, kind='append-one-whole-sourceGoal-and-one-whole-passage', beforePin=pin(path), before=before, after=after, selectedRestore=dict(removeSourceGoalId=sg['id'],removePassageId=passage['id'],removeNewMetadataKey=META), newSourceGoalId=sg['id']))

for op in ops:
    path = op['normalFile']['path']; before = read(path); after = copy.deepcopy(before)
    cas = op['selectedDecisionCAS']; sid = op['sourceGoalId']; mapping = op['appendMappingIfPairAbsent']
    assert mapping == dict(legacyGoalId=sid,canonicalGoalId=GOAL,matchType='partial',reviewDecisionId=sid)
    assert before['sourceLandscapeId'] == op['sourceLandscapeId']
    if 'sourceExtractionPath' in before:
        assert before['sourceExtractionPath'] == op['sourceExtractionPath'], 'Actual alias extraction path drift; do not rebind historical contracts.'
    assert op['sourceExtractionPath'] in source_cache
    assert any(g['id'] == sid for g in source_cache[op['sourceExtractionPath']]['sourceGoals'])
    assert not any(m['legacyGoalId'] == sid and m['canonicalGoalId'] == GOAL for m in before['mappings'])
    assert META not in before
    selected_before = None
    if cas['action'] == 'replace-selected-whole-decision-after-exact-CAS':
        matches = [(idx,d) for idx,d in enumerate(before['decisions']) if d['sourceGoalId'] == sid]
        assert len(matches) == 1 and matches[0][1] == cas['before'], 'Selected whole decision drift; stop for object reconciliation.'
        idx, selected_before = matches[0]
        assert cas['after']['canonicalGoalIds'] == selected_before['canonicalGoalIds'] + [GOAL]
        assert cas['after']['rationale'].startswith(selected_before['rationale'] + ' ')
        assert {k:v for k,v in cas['after'].items() if k not in ('canonicalGoalIds','rationale')} == {k:v for k,v in selected_before.items() if k not in ('canonicalGoalIds','rationale')}
        after['decisions'][idx] = copy.deepcopy(cas['after'])
    else:
        assert cas['action'] == 'append-one-whole-decision-if-sourceGoalId-absent'
        assert not any(d['sourceGoalId'] == sid for d in before.get('decisions',[]))
        after.setdefault('decisions',[]).append(copy.deepcopy(cas['after']))
        idx = len(after['decisions'])-1
    after['decisions'][idx]['rationale'] += ' Technischer Nachtrag: Die begrenzte Partialbeziehung ist inzwischen im unabhängigen FIRST ' + first_pin['path'] + ' angenommen. Der vorangestellte Autorenhinweis auf eine damals ausstehende Prüfung bleibt historische Begründung; hier entsteht kein Ganzquellenabschluss und keine neue fachliche Stimme des technischen Integrators.'
    after['mappings'].append(mapping)
    after[META] = dict(meta_base, sourceExtractionPathForThisContribution=op['sourceExtractionPath'], addedPartialMappings=[mapping], allEarlierMappingRowsDecisionFieldsMetadataAndAppendTailsRetained=True)
    assert after['mappings'][:-1] == before['mappings']
    for old_idx,d in enumerate(before.get('decisions',[])):
        if old_idx != idx or selected_before is None:
            assert after['decisions'][old_idx] == d
    assert {k:v for k,v in after.items() if k not in ('mappings','decisions',META)} == {k:v for k,v in before.items() if k not in ('mappings','decisions',META)}
    changes.append(dict(path=path,kind='append-one-partial-tuple-and-selected-decision-only',beforePin=pin(path),before=before,after=after,selectedRestore=dict(sourceGoalId=sid,selectedWholeDecisionBefore=selected_before,decisionsKeyExistedBefore='decisions' in before,removeOneMapping=mapping,removeNewMetadataKey=META),sourceGoalId=sid,actualSourceExtractionPath=op['sourceExtractionPath']))

assert len(changes) == 20 and len(set(c['path'] for c in changes)) == 20
assert len(observed) == 2
spec = importlib.util.spec_from_file_location('stock','scripts/validate_schemas.py');mod = importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
assert not mod.curriculum_symlink_errors('.')
# Check every complete current preimage again immediately before any write.
for c in changes:
    assert pin(c['path']) == c['beforePin'], 'Concurrent whole-file change; regenerate the finite plan.'
for r in observed:
    assert pin(r['path']) == r['before']

def public_change(c):
    return {k:v for k,v in c.items() if k not in ('before','after')} | dict(beforeWholeObjectSHA256=digest(c['before']), afterWholeObjectSHA256=digest(c['after']),currentOldSourceGoals=len(c['before'].get('sourceGoals',[])),currentNewSourceGoals=len(c['after'].get('sourceGoals',[])),currentOldMappingRows=len(c['before'].get('mappings',[])),currentNewMappingRows=len(c['after'].get('mappings',[])),allUnrelatedWholeObjectsAndMetadataRetained=True)
result = dict(status='PASS',mode='APPLY_AFTER_ACTUAL_ROOT_GO' if args.apply_after_explicit_root_go else 'READ_ONLY_PREPARATION_NO_NORMAL_MUTATION',createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),foreignAuthorSeal=author_seal,independentSourceFirst=first_pin,independentSourceSeal=review_seal,exactLaterNormalWriteList=[c['path'] for c in changes],counts=dict(sourceInventoriesToAppend=5,oldSourceUnitsObservedReadOnly=2,mappingAliases=15,partialTuplesToAppend=15,totalNormalFiles=20),changes=[public_change(c) for c in changes],readOnlyOldSourceObjects=observed,thBoundary='Only current TH lower-secondary source inventory and its two lower aliases. Upper historical TH225 contracts and selected-process233/current upper successors are not read as a whole-rebase basis and are not written. Any changed lower alias extraction pointer causes STOP.',sourceAndPBoundariesUnchanged=True,currentWholeCAndPBinding=current_p_binding,slOutsideC7=True,newScientificVotes=0,stockCurriculumSymlinkErrors=0,normalWrites=0)
if args.apply_after_explicit_root_go:
    receipt_path = T / 'RECEIPT.applied-selected-normal-integration.json'
    assert not receipt_path.exists(), 'Applied receipt already exists; preserve history.'
    for c in changes:
        Path(c['path']).write_text(json.dumps(c['after'],ensure_ascii=False,indent=2)+'\n')
    for c in changes:
        assert read(c['path']) == c['after']
        assert pin(c['path'])['sha256'] == hashlib.sha256(Path(c['path']).read_bytes()).hexdigest()
    for r in observed:
        assert pin(r['path']) == r['before']
    assert not mod.curriculum_symlink_errors('.')
    result['normalWrites'] = len(changes)
    result['actualAfterPins'] = [pin(c['path']) for c in changes]
    result['actualRootGoReceipt'] = pin(args.root_go_receipt)
    receipt_path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
