"""Seal already executed technical native checks against final foreign 678 reviews.

This is a technical author handoff. It writes additive inert evidence only and
does not decide whole-material science, scope approval, or human release.
"""
from pathlib import Path
import copy
import hashlib
import json
import os
import subprocess
import jsonschema

ROOT = Path(__file__).resolve().parents[8]
Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
O = Q / 'wirtschaft-current678-SEM-P43-book-technical-author-b-followers-v1'
S = O / 'twentyone-qualified-past-author-review-notes-technical-successor-v2'
A = Q / 'wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1'
R = Q / 'wirtschaft-current678-remaining33-independent-combined-scope-root-v1'
M = Q / 'wirtschaft-current678-five-nav-status-practice-purpose-independent-merge-audit-v1'
V = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current678-international-operations-policy33-20261010-v17')


def read(path):
    return json.loads((ROOT / path).read_text())


def bind(path):
    p = ROOT / path
    data = p.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def check_binding(row):
    assert bind(row['path']) == row, row['path']
    return row


def write_new(path, obj):
    p = ROOT / path
    assert not p.exists(), str(path)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return bind(path)


def goal_map(doc):
    if isinstance(doc, list):
        rows = doc
    elif 'goals' in doc:
        rows = doc['goals']
    elif 'materials' in doc:
        rows = doc['materials']
    else:
        raise AssertionError(('Unknown whole material shape', list(doc)))
    return {row['id']: row for row in rows}


f = read(S / 'actual-v17-final237c-SEM678-P336685-book-technical-only-freeze.json')
b = read(O / 'actual-current678-five-native-Nav-FPs33-foreign-kind-only-author-inputs.json')
author_path = A / 'actual-final-current678-international-operations-policy33-fiveNav359-accesses718-current645.AUTHOR-handoff.json'
scope_path = R / 'actual-final-current678-remaining33-combined-scope-nav-status-independent-KEEP.handoff.receipt.json'
nav_path = M / 'actual-final-current678-five-whole-nav33-status16-existing-support-purpose-independent-KEEP.handoff.receipt.json'
author = read(author_path)
scope = read(scope_path)
nav = read(nav_path)
assert bind(author_path)['sha256'] == '595be106399887aaa1c4838bcf3ac1324593e7c97cd042d45f95ef5fafbfef51'
assert bind(scope_path)['sha256'] == '6132a9dd55c88f44bf9390b699d9a7e101f680196c4ed0cdd070e5071df337a9'
assert bind(nav_path)['sha256'] == 'e94388432d1f2ac198ea91d8a6033f7620ccd9c003a69efcfdeb25b16ffcc35d'
assert scope['decision'].startswith('KEEP_') and nav['role'].endswith('SEMANTICS_KEEP_ONLY')
assert author['wholeFinalAfterCAN'] == scope['wholeInert678'] == f['wholeAfterCAN'] == nav['actualReviewedWholeCurrent678']
assert scope['wholeAuthorFinalHandoff'] == bind(author_path)
assert scope['foreignIndividualWholeNavStatusPOnlyPurposeReview'] == bind(nav_path)
assert scope['allSevenRouteRulesPassInPrivateCandidate'] is True
assert scope['actualBeforeAfterRouteOccurrences'] == [174, 0]
assert scope['actualBeforeAfterRouteGoalIds'] == [33, 0]
assert scope['wholeOrdinaryTargetIds336SourceEvidence16_2134Memory10Cards66AndP336685Exact'] is True

for key in ['wholeBeforeCAN', 'wholeAfterCAN', 'oldRegistry', 'oldBookConfig', 'oldKindLedger', 'newSEM', 'newWholeP336', 'oldWholeP336Aggregate', 'candidateRegistry', 'candidateBookConfig', 'exact21NoteSourceFPFollowup']:
    check_binding(f[key])
for row in b['immutableOldInputCopies'].values():
    check_binding(row)
active_canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
assert bind(active_canonical)['sha256'] == f['wholeBeforeCAN']['sha256']
assert bind(f['oldRegistry']['path']) == b['immutableOldInputCopies']['Registry'] | {'path': f['oldRegistry']['path']}
assert bind(f['oldBookConfig']['path']) == b['immutableOldInputCopies']['BookConfig'] | {'path': f['oldBookConfig']['path']}

before = goal_map(read(f['wholeBeforeCAN']['path']))
after = goal_map(read(f['wholeAfterCAN']['path']))
nav_ids = set(b['allowedChangedOldGoalIds'])
new_ids = set(b['newQualifiedPracticeGoalIds'])
assert len(before) == 645 and len(after) == 678 and len(nav_ids) == 5 and len(new_ids) == 33
assert set(after) - set(before) == new_ids
assert all(before[g] == after[g] for g in before if g not in nav_ids)

old_sem = read(f['oldKindLedger']['path'])
new_sem = read(f['newSEM']['path'])
old_decisions = {r['goalId']: r for r in old_sem['decisions']}
new_decisions = {r['goalId']: r for r in new_sem['decisions']}
assert set(old_decisions) == set(before) and set(new_decisions) == set(after)
assert all(old_decisions[g] == new_decisions[g] for g in before if g not in nav_ids)
for g in nav_ids:
    assert {k: v for k, v in old_decisions[g].items() if k != 'sourceFingerprint'} == {k: v for k, v in new_decisions[g].items() if k != 'sourceFingerprint'}
assert new_sem['counts'] == {'total': 678, 'curricularAtomic': 336, 'practiceAssessment': 297, 'curricularArea': 32, 'memory': 10, 'orientation': 1, 'programStructure': 1, 'runtimeSupport': 1}
assert sorted(r['goalId'] for r in old_sem['decisions'] if r['semanticKind'] == 'curricularAtomic') == sorted(r['goalId'] for r in new_sem['decisions'] if r['semanticKind'] == 'curricularAtomic')
schema_path = 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'
schema_errors = [str(e) for e in jsonschema.Draft202012Validator(read(schema_path)).iter_errors(new_sem)]
assert not schema_errors, schema_errors

whole33_bindings = []
for package in f['foreignWholeScientificBindings']:
    check_binding(package['wholeForeignScientificReceipt'])
    check_binding(package['wholeQualifiedDraftInput'])
    drafts = goal_map(read(package['wholeQualifiedDraftInput']['path']))
    for g in package['materialIds']:
        candidate = copy.deepcopy(after[g])
        draft = drafts[g]
        assert candidate['examData']['reviewStatus'] == 'released'
        changed = [k for k in candidate['examData'] if candidate['examData'].get(k) != draft['examData'].get(k)]
        assert set(changed) == {'reviewStatus', 'reviewNote'}, (g, changed)
        candidate['examData']['reviewStatus'] = draft['examData']['reviewStatus']
        candidate['examData']['reviewNote'] = draft['examData']['reviewNote']
        assert candidate == draft, g
        assert new_decisions[g]['semanticKind'] == 'practiceAssessment'
        assert new_decisions[g]['decisionStatus'] == 'authoritative'
        whole33_bindings.append({'materialId': g, 'foreignWholeScience': package['wholeForeignScientificReceipt'], 'qualifiedWholeDraftInput': package['wholeQualifiedDraftInput'], 'actualOnlyMachineStatusAndAINoteChanged': True, 'kind': new_decisions[g]})
assert {r['materialId'] for r in whole33_bindings} == new_ids

cap = Path(b['privatePhysicalCapsule']) if isinstance(b['privatePhysicalCapsule'], str) else Path(b['privatePhysicalCapsule']['path'])
assert cap.is_dir(), cap
profile_configs = []
for row in f['all43ConfigChanges']:
    check_binding(row['old']); check_binding(row['new']); check_binding(row['reviewWholeBytesUnchanged'])
    old_cfg = read(row['old']['path']); new_cfg = read(row['new']['path'])
    assert [k for k in old_cfg if old_cfg[k] != new_cfg[k]] == ['semanticKindLedgerPath']
    assert new_cfg['semanticKindLedgerPath'] == f['newSEM']['path']
    assert old_cfg['reviewPath'] == new_cfg['reviewPath'] == row['reviewWholeBytesUnchanged']['path']
    for path in [row['old']['path'], row['new']['path'], new_cfg['reviewPath'], new_cfg['reviewCriteriaPath']]:
        private = cap / path
        original = ROOT / path
        assert private.is_file() and not private.is_symlink() and not os.path.samefile(private, original), path
        assert private.read_bytes() == original.read_bytes(), path
    profile_configs.append(row)
assert len(profile_configs) == 43
assert (ROOT / f['newWholeP336']['path']).read_bytes() == (ROOT / f['oldWholeP336Aggregate']['path']).read_bytes()

old_reg = read(f['oldRegistry']['path']); new_reg = read(f['candidateRegistry']['path'])
assert {k:v for k,v in old_reg.items() if k != 'subjects'} == {k:v for k,v in new_reg.items() if k != 'subjects'}
old_subjects = {r['subject']:r for r in old_reg['subjects']}
new_subjects = {r['subject']:r for r in new_reg['subjects']}
assert old_subjects.keys() == new_subjects.keys()
for subject in old_subjects:
    if subject != 'wirtschaftswissenschaften':
        assert old_subjects[subject] == new_subjects[subject]
econ_old = old_subjects['wirtschaftswissenschaften']; econ_new = new_subjects['wirtschaftswissenschaften']
assert sorted(k for k in econ_old if econ_old[k] != econ_new[k]) == ['positiveEvidenceConfigPaths', 'semanticKindLedgerPath']
assert econ_new['positiveEvidenceConfigPaths'] == f['newPconfigs'] and econ_new['semanticKindLedgerPath'] == f['newSEM']['path']
old_book = read(f['oldBookConfig']['path']); new_book = read(f['candidateBookConfig']['path'])
assert sorted(k for k in old_book if old_book[k] != new_book[k]) == ['evidenceReviewPaths', 'semanticKindLedgerPath']
assert new_book['semanticKindLedgerPath'] == f['newSEM']['path']
assert new_book['evidenceReviewPaths'] == [f['newWholeP336']['path']]

native43_path = S / 'actual-native43-configs-P336-final237c-SEM678-original-profiles-status-authority-FPs.v17-author-PASS.json'
native43 = read(native43_path)
assert native43['actualRecords'] == 336 and native43['actualOriginalCases'] == 685
assert native43['actualSEMGoals'] == 678 and native43['all678OfficialSourceFingerprintsCurrent'] is True
assert native43['actualNeedsHumanReview'] == 336 and native43['actualAIcandidateAuthority'] == 336 and native43['actualApprovedRecords'] == 0
assert native43['actualProfileSchemaSemanticDensityGoalProfileAndInputFingerprintErrors'] == 0
assert len(native43['configs']) == 43 and all(not r['errors'] for r in native43['configs'])
for name in ['actual-final237c-native43-positive.command-exit.json', 'actual21-notes-SEM-native.command-exit.json']:
    execution = read(S / name)
    assert execution['exit'] == 0 and execution['stderr'] == ''
assert read(S / 'actual21-official-sourceFPs-and657-other-rows-exact-native.receipt.json')['all678OfficialFingerprintsCurrent'] is True

all_artifacts = sorted(p for base in [ROOT / O, ROOT / V] for p in base.rglob('*') if p.is_file())
symlinks = [str(p.relative_to(ROOT)) for base in [ROOT / O, ROOT / V] for p in base.rglob('*') if p.is_symlink()]
assert not symlinks, symlinks
json_count = 0
for p in all_artifacts:
    if p.suffix == '.json':
        json.loads(p.read_text()); json_count += 1
paths = [str(p.relative_to(ROOT)) for p in all_artifacts]
ignore = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(paths) + '\n', cwd=ROOT, text=True, capture_output=True)
assert ignore.returncode == 1 and ignore.stdout == '' and ignore.stderr == '', ignore
guards = write_new(S / 'actual-final237c-SEM678-P43-book-fieldwise-and-foreign-binding-endguards.AUTHOR.json', {
    'role': 'TECHNICAL_AUTHOR_ACTUAL_ENDGUARDS_NOT_NEW_SCIENCE_OR_SCOPE_KEEP',
    'foreignFinalAuthor': bind(author_path), 'foreignFinalScope': bind(scope_path), 'foreignFinalNavStatus': bind(nav_path),
    'allFinal678InputBindingsExact': True, 'activeBefore645CANRegistryBookUnchanged': True,
    'oldNonNavWholeGoalsExact': 640, 'oldNonNavSemanticRowsExact': 640,
    'onlyFiveOldNavSourceFPsChanged': sorted(nav_ids), 'all645OldKindsStatusesBasesExact': True,
    'new33PracticeKindsFromForeignWholeScience': whole33_bindings,
    'semanticCounts': new_sem['counts'], 'semanticOntologySchema': bind(schema_path), 'semanticOntologySchemaErrors': schema_errors,
    'all43ConfigsOnlySemanticLedgerPointerChanges': profile_configs,
    'all43PrivateConfigReviewCriteriaInputsPhysicalExactAndNotSamefile': True,
    'current336OriginalProfiles685CasesReviewBytesAggregateInputFingerprintsExact': True,
    'nativeActual336NeedsHumanReviewAndAIcandidateNoApproved': True,
    'allOtherRegistrySubjectsWholeExact': True, 'EconomicsRegistryOnlySEMAndP43Pointers': True,
    'EconomicsBookOnlySEMAndAggregatePPointers': True,
    'actualNewCurricularScientificClosures': 0, 'restoredStrictBindings': 0, 'strictNet': 0,
    'actualParsedJSONArtifacts': json_count, 'ownArtifactSymlinks': 0, 'gitIgnoredOwnArtifacts': 0,
    'humanRelease': 'separate pending', 'M6': 'requires active integration and actual central/floor checks', 'activeWrites': 0,
})

manifest_paths = sorted(p for base in [ROOT / O, ROOT / V] for p in base.rglob('*') if p.is_file())
manifest = write_new(S / 'actual-final-current678-v17-technical-portable-whole-artifacts.manifest.json', {
    'role': 'IMMUTABLE_TECHNICAL_AUTHOR_ARTIFACTS_BEFORE_FINAL_HANDOFF',
    'files': [bind(p.relative_to(ROOT)) for p in manifest_paths],
    'foreignFinalAuthor': bind(author_path), 'foreignFinalScope': bind(scope_path), 'foreignFinalNavStatus': bind(nav_path),
    'whole678Measured': f['wholeAfterCAN'], 'allFinalNative43Executed': bind(native43_path), 'symlinks': 0, 'activeWrites': 0,
})
handoff = copy.deepcopy(f)
handoff['role'] = 'TECHNICAL_AUTHOR_READY_FOR_INDEPENDENT_ROOT_SEM_P43_BOOK_FIELD_REVIEW_AND_INTEGRATION'
handoff.pop('foreignCombined678ScopePending')
handoff['wholeAuthorIndex'] = check_binding(author['wholeV2Only21PastReviewNotesDeltaIndex'])
handoff['wholeAuthorHandoff'] = bind(author_path)
handoff['foreignCombined678ScopeKEEP'] = bind(scope_path)
handoff['foreignWholeNavStatusKEEP'] = bind(nav_path)
handoff['immutableOldRegistryBookSEMCopies'] = b['immutableOldInputCopies']
handoff['actualAll43NativeFinal237cProof'] = bind(native43_path)
handoff['actualAll43NativeFinal237cCommand'] = bind(S / 'actual-final237c-native43-positive.command-exit.json')
handoff['actualAll678OfficialFinal237cFPCommand'] = bind(S / 'actual21-notes-SEM-native.command-exit.json')
handoff['actualAll678OfficialFinal237cFPProof'] = f['exact21NoteSourceFPFollowup']
handoff['actualFinalTechnicalEndguards'] = guards
handoff['portableWholeTechnicalManifest'] = manifest
handoff['privatePhysicalCAP'] = str(cap)
handoff['wholeFinalTechnicalSourceFreeze'] = bind(S / 'actual-v17-final237c-SEM678-P336685-book-technical-only-freeze.json')
handoff['actualNativeCounts'] = {'configs': 43, 'positiveRecords': 336, 'originalCases': 685, 'semanticGoals': 678, 'curricularAtomic': 336, 'practiceAssessment': 297, 'needsHumanReview': 336, 'aiCandidateAuthority': 336, 'approved': 0, 'errors': 0}
handoff['foreignScopeActualRouteResult'] = {'before': [174, 33], 'after': [0, 0], 'newWholeBodyScienceClosures': 0, 'strictNet': 0, 'wholeContextBindings': 718, 'heldGKClosures': 22, 'existingPOnlyPracticeBindings': 16, 'sourceAndAll64OrdinaryMemoryPExact': True}
handoff['newIndependentScientificOrScopeDecisionsByTechnicalAuthor'] = 0
handoff['centralM6Reached'] = False
handoff['humanReviewReleaseTrial'] = 'separate pending, not supplied by machine QS'
final = write_new(S / 'actual-final-current678-final237c-SEM-P43-P336685-book-v17-technical-author.handoff.json', handoff)
print(json.dumps(final, ensure_ascii=False))
