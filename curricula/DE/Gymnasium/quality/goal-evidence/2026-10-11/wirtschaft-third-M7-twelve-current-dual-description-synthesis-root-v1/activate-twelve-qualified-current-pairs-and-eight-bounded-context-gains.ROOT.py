import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
Q = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
REG = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'

def read(p):
    return json.loads(Path(p).read_text())

def binding(p):
    p = Path(p)
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}

def verify_binding(b):
    p = ROOT / b['path']
    assert binding(p)['sha256'] == b['sha256'], b['path']
    return p

def verify_seal(p):
    d = read(p)
    for b in d['artifacts']:
        verify_binding(b)
    return binding(p)

def write_new(p, d):
    assert not p.exists(), str(p)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

assert ROOT.name == 'skillpilot', ROOT
assert binding(REG)['sha256'] == 'sha256:fb9998278c22566f0afe64d534702d1fe7c40df25691ac02d635cdf9b6da34da'
before_reg = read(REG)
assert before_reg == read(HERE / 'registry-before-current-D12.EXACT.json')
candidate = read(HERE / 'registry.only-twelve-qualified-current-D-pairs.INERT.config.json')
old_subject = next(s for s in before_reg['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
new_subject = next(s for s in candidate['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
assert len(old_subject['resolutionIndexPaths']) == 49
assert len(old_subject['resolutionSupersessions']) == 105
assert new_subject['resolutionIndexPaths'][:49] == old_subject['resolutionIndexPaths']
assert new_subject['resolutionSupersessions'][:105] == old_subject['resolutionSupersessions']
assert len(new_subject['resolutionIndexPaths']) == 51
assert len(new_subject['resolutionSupersessions']) == 116
expected = copy.deepcopy(before_reg)
expected_subject = next(s for s in expected['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
expected_subject['resolutionIndexPaths'] = new_subject['resolutionIndexPaths']
expected_subject['resolutionSupersessions'] = new_subject['resolutionSupersessions']
assert candidate == expected, 'Only Economics 2 indices and 11 terminal supersession edges permitted'

before = read(HERE / 'before246.actual-native.raw.txt')['subjects'][0]
after = read(HERE / 'candidateD12.actual-native.raw.txt')['subjects'][0]
old_ids, new_ids = set(before['strictCompleteGoalIds']), set(after['strictCompleteGoalIds'])
assert len(old_ids) == 246 and len(new_ids) == 257 and old_ids <= new_ids
gains = new_ids - old_ids
# Select only actual report IDs; the remaining gains retain existing science.
new_science = {g for g in gains if g.startswith(('13705b9f-', '479fb87a-', '543bf91f-'))}
assert len(new_science) == 3
restored = gains - new_science
assert len(restored) == 8
canonical = read(ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
goals = {g['id']: g for g in canonical['goals']}
book_cfg_path = ROOT / 'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
book_cfg = read(book_cfg_path)
assert binding(book_cfg_path)['sha256'] == 'sha256:c5546fd53b0f5d35ab92b2fec9b48097035b0534292d0ce09d8c31a2a47950f9'
profiles_path = Q / 'wirtschaft-two-P-terminology-followup-to-current-D-recommendations-AUTHOR-INERT-root-v1/positive346.only-two-qualified-P-terminology-fields.INERT.jsonl'
assert binding(profiles_path)['sha256'] == 'sha256:bb9f3ca8ff59e9fb63418ae9c34ae06871e191f5542807879e406e4ef30784a7'
profiles = {g['goalId']: g for g in map(json.loads, profiles_path.read_text().splitlines())}
guards = [binding(REG), binding(book_cfg_path), binding(profiles_path), binding(ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')]
proofs = []
folder = Q / 'wirtschaft-forty-nine-valid-D2-current-owner-page-scoping-AUTHOR-INERT-c-v1/whole49-current-and-original-contexts'
for gid in sorted(restored - {'6de44afa-7f91-5fa4-9292-ec06e86e97a4', 'f1f73ebe-286a-52e8-a2e1-4383ece6e9ec'}):
    p = folder / (gid + '.READONLY.json')
    d = read(p)
    assert d['actualWholeCurrentGoal'] == goals[gid]
    assert d['actualWholeCurrentPositiveRecord'] == profiles[gid]
    for old in d['wholeOriginalBothReviewInputs']:
        g = old['wholeOriginalGoalInput']
        assert g['canonicalContext'] == d['nativeCurrentCanonicalContext']
        assert g['reviewContext']['evidenceProfile'] == profiles[gid]
        assert g['reviewContext']['page']['visualization'] == d['currentNativePage']['visualization']
        assert g['currentTitleDe'] == goals[gid]['title']
        assert g['currentTitleEn'] == goals[gid]['titleEn']
        assert g['currentDescriptionDe'] == goals[gid]['description']
        assert g['currentDescriptionEn'] == goals[gid]['descriptionEn']
        verify_binding(old['wholePhysicalInputBinding'])
    for old in d['wholeOriginalBothScientificRecordsAndRuns']:
        verify_binding(old['wholeRunPhysicalBinding'])
        original_round = next(r for r in d['selectedExistingSciencePair']['existingIndependentRounds'] if r['round'] == old['round'])
        results_path = verify_binding(original_round['actualResults'])
        raw_record = next(r for r in map(json.loads, results_path.read_text().splitlines()) if r['goalId'] == gid)
        assert raw_record == old['wholeOriginalScientificRecord']
    guards.append(binding(p))
    proofs.append({'goalId': gid, 'wholeOriginalBothCanonicalContextsDEENPositiveProfilesAndVisualMetadataExact': True, 'wholePageExactClaim': False, 'meaningChanges': 'Page positions and internal/external presentation of the same neighbors; 048/4fef narrowed poverty prerequisite independently qualified by A.', 'newDescriptionReviews': 0, 'existingWholeContextProof': binding(p)})

sixde_folder = Q / 'wirtschaft-6de-historical-null-P-current-two-case-context-independent-required-gate-READONLY-v1'
sixde_seal = sixde_folder / 'SEALED-independent-6de-old-null-P-current-whole-two-case-context-KEEP.READONLY.json'
sixde = read(sixde_folder / 'actual-independent-6de-old-null-P-current-two-case-and-accepted-synthesis-context-KEEP.READONLY.receipt.json')
assert sixde['decision'] == 'KEEP' and sixde['oldPWasActuallyNullForBothOriginalReviews']
assert not sixde['oldPWholeParityWithCurrent'] and sixde['activeWrites'] == 0 and sixde['newNativeD2ReviewRuns'] == 0
sixde_binding = verify_seal(sixde_seal)
proofs.append({'goalId': sixde['goalId'], 'decision': 'KEEP current bounded context compatible', 'independentProof': sixde_binding, 'rootActualWholeRead': 'Both current cases, original D2 and selected B synthesis distinguish remittances from skilled services, intended from actual return and contacts from accessible implemented knowledge. Root read the complete independent two bilingual answers and counterexamples. Historical missing P and create recommendations preserved; no whole-P parity assertion or new historical review.'})
guards.append(sixde_binding)

f1 = 'f1f73ebe-286a-52e8-a2e1-4383ece6e9ec'
inv_path = Q / 'wirtschaft-current-D246-open100-whole-binding-package-scoping-READONLY-c-v1/actual-current100-six-disjoint-packages-and-current49-concrete-owner-context-inputs.READONLY.json'
inv = read(inv_path)
row = next(r for r in inv['current100Rows'] if r['goalId'] == f1)
selected = row['existingOriginalTwoRoundPair']
pages = read(verify_binding(inv['nativePostRootP2Pages']))
current_page = next(p for p in pages['wholeCurrentOpenPages'] if p['goalId'] == f1)
current_context = next(p['context'] for p in pages['wholeCurrentCanonicalContexts'] if p['goalId'] == f1)
for old in selected['existingIndependentRounds']:
    inp_path = verify_binding(old['reviewInput'])
    old_goal = next(g for g in read(inp_path)['goals'] if g['goalId'] == f1)
    assert old_goal['canonicalContext'] == current_context
    assert old_goal['reviewContext']['evidenceProfile'] == profiles[f1]
    assert old_goal['reviewContext']['page']['visualization'] == current_page['visualization']
    assert all(old_goal[k] == goals[f1][v] for k,v in [('currentTitleDe','title'),('currentTitleEn','titleEn'),('currentDescriptionDe','description'),('currentDescriptionEn','descriptionEn')])
    verify_binding(old['actualResults'])
    verify_binding(old['runManifest'])
    guards.extend([binding(inp_path), old['actualResults'], old['runManifest']])
verify_binding(selected['synthesisManifest'])
proofs.append({'goalId': f1, 'decision': 'KEEP current bounded context compatible', 'wholeOriginalBothDEENCanonicalContextsProfilesAndVisualMetadataExact': True, 'originalPActuallyPresent': True, 'rootActualWholeRead': 'Both original complete D records and accepted synthesis were read. The current unchanged P has 20/60,30/15,50/25 value-added/employment shares and 100→150 output with 30%→24% agriculture. Sector-average relative productivity is 1/3,2,2; it does not determine each worker. Agricultural absolute output is 30→36, +20%, despite the smaller share. Skills, transport, jobs and access condition a possible growth path; a sector transition proves neither universal stages nor universal household gains. Current neighbor ec70 explicitly practices two such analyses; fed15 and 9b6 remain separate indicator/resource extensions. Positions and internal/external links preserve the same ordinary competence, and the title change of unrelated Q4 poverty goal adds no f1 requirement.', 'newDescriptionReviews': 0, 'newSourceOrVisualizationApproval': False})

receipt = {'status': 'ACTUAL_BOUNDED_CONTEXT_QUALIFICATION_BEFORE_REGISTRY_ACTIVATION', 'recordedAt': datetime.now(timezone.utc).isoformat(), 'reviewer': '/root integration; original independent reviewers preserved', 'qualifiedIndirectContextGains': proofs, 'inputGuards': guards, 'newHistoricalReviews': 0, 'humanApproval': False, 'historicalArtifactsMutated': False, 'wholeSourceApproval': False}
write_new(HERE / '09-actual-eight-indirect-context-gains-whole-meaning-qualified-before-activation.ROOT.receipt.json', receipt)
for g in guards:
    verify_binding(g)
REG.write_text(json.dumps(candidate, ensure_ascii=False, indent=2) + '\n')
assert read(REG) == candidate
write_new(HERE / '10-actual-twelve-current-dual-pairs-and-eight-contexts-registry-activation.receipt.json', {'status': 'ACTUAL_GUARDED_ECONOMICS_ONLY_ACTIVATION', 'recordedAt': datetime.now(timezone.utc).isoformat(), 'activeRegistry': binding(REG), 'currentQualifiedNativeBefore': 246, 'currentQualifiedNativeAfter': 257, 'netStrictGain': 11, 'newScientificStrictCompletions': sorted(new_science), 'restoredBindingsStrictCompletions': sorted(restored), 'newScientificDualReviewPairsIntegrated': 12, 'newPairsStillBlockedByOtherHistoricalContextChains': 9, 'lostStrictIds': [], 'addedIndices': 2, 'addedTerminalSupersessionEdges': 11, 'foreignRegistrySubjectsWholeExact': True, 'centralReportRemains225UntilStableBundledGeneration': True, 'M7Achieved': False, 'humanApproval': False})
print(json.dumps({'activated': True, 'qualifiedNative': 257, 'newScienceStrict': 3, 'restoredStrict': 8, 'registry': binding(REG)}, ensure_ascii=False))
