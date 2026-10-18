# SPDX-License-Identifier: Apache-2.0
"""One exact reviewed warning append and a new pinned native-review input cut."""
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone

B = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
A = B + 'chemie-current450-current737-original-source-audit-technical-20261018-v1/'
P = B + 'chemie-current450-final-native-input-prerequisites-technical-20261018-v1/'
O = Path(B + 'chemie-current450-final-native-root-cut-technical-20261018-v1')
C = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
S = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
R = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
W = 'docs/qa-ci/applicability-accepted-warnings.json'

def read(p):
    return json.loads(Path(p).read_text())

def pin(p):
    b = Path(p).read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def check(p):
    assert pin(p['path']) == {k: p[k] for k in ['path', 'sha256', 'bytes']}, 'Pinned input drift: ' + p['path']

def write(name, value):
    with (O / name).open('x') as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write('\n')

assert not O.exists(), 'Preserve the existing final cut; never rerun this writer'
seal = A + 'FREEZE.technical.sha256.json'
assert pin(seal)['sha256'] == 'a9e41242bf5a0724598a9daef9abfa44f490e9ba0b0d668cad4f270fc9a9bf31', 'Source audit seal drift'
for p in read(seal)['files']:
    check(p)
proposal = read(A + 'PROPOSAL.exact-one-pH-APV201-acceptance-append-CAS.pending.json')
diagnosis = read(A + 'DIAGNOSIS.actual-stock-Chemistry-source-course-rules.json')
for p in diagnosis['inputPins']:
    check(p)
rules = {r['id']: r for r in diagnosis['rules']}
assert all(rules[r]['status'] == 'pass' for r in ['CQR-000', 'CQR-003', 'CQR-004', 'CQR-005']), 'Source or course gate remains open'
matcher = read(A + 'CHECK.unchanged-warning-matcher-one-candidate-acceptance.json')
assert matcher['afterRule']['status'] == 'pass' and matcher['afterMetrics']['activeWarnings'] == 0, 'Reviewed warning append does not close its exact gate'
guard = read(B + 'chemie-current450-pH-two-reviewed-scope-metadata-author-20261018-v1/GUARD.current-inputs-and828-other-M7-files-exact.json')
for p in guard['protectedOtherSubjectPins']:
    check(p)
check(proposal['registryBeforeFilePin'])
old_raw = Path(W).read_text()
old = read(W)
candidate_path = A + 'CANDIDATE.applicability-accepted-warnings.single-pH-append.pending.json'
candidate_raw = Path(candidate_path).read_text()
candidate = json.loads(candidate_raw)
assert len(old['acceptedWarnings']) == 110 and old['acceptedWarnings'] == proposal['beforeWholeAcceptedWarnings'], 'Prior acceptance objects drifted'
assert candidate['acceptedWarnings'] == old['acceptedWarnings'] + [proposal['candidateAppendEntry']], 'Only one exact append is authorized'
assert candidate_raw.startswith(old_raw[:old_raw.rfind('\n  ]')]), 'Prior acceptance raw object bytes changed'
assert proposal['candidateAppendEntry']['goalId'] == '4216a708-d9c4-5582-ad7c-65d81643f0d3', 'Wrong warning goal'
g = next(g for g in read(C)['goals'] if g['id'] == proposal['candidateAppendEntry']['goalId'])
goal_hash = hashlib.sha256(json.dumps(g, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
assert goal_hash == proposal['candidateAppendEntry']['evidence']['currentGoalObjectSHA256'], 'Reviewed pH whole-goal pin stale'
assert g['extendedData']['applicabilityOverrides']['jurisdiction'] == ['DE-BY', 'DE-HE', 'DE-NI'], 'Scope authority drift'

O.mkdir()
(O / 'accepted-warnings.before.snapshot').write_text(old_raw)
Path(W).write_text(candidate_raw)
assert pin(W) == dict(pin(candidate_path), path=W), 'Normal warning registry differs from the exact reviewed candidate'
warning_receipt = 'RECEIPT.actual-one-reviewed-pH-warning-acceptance.json'
write(warning_receipt, {
    'role': 'ONE_EXACT_REVIEWED_MACHINE_APPLICABILITY_WARNING_ACCEPTANCE',
    'authorAuditSeal': pin(seal), 'before': proposal['registryBeforeFilePin'], 'after': pin(W),
    'warningKey': proposal['exactWarningKey'], 'acceptedEntry': proposal['candidateAppendEntry'],
    'rootReview': 'Intentional BY/HE/NI LK common pH assessment remains separate from the HB-only digital endpoint; actual independent scope review and all41 checks support this exact boundary.',
    'oldGlobalAcceptanceObjectsAndBytesPreserved': 110, 'oldChemistryAcceptanceObjectsPreserved': 87,
    'matcherResultForExactAppliedBytes': matcher['afterRule'],
    'compilerWarningRemoved': False, 'gateFiltersOrThresholdsChanged': False,
    'sourceCoverageOrNewScientificOrHumanApproval': False,
})

operation_paths = {
    'support169': B + 'chemie-current450-reviewed169-existing-target-support-normal-integration-technical-20261018-v1/RECEIPT.actual169-existing-target-support-integration.json',
    'practice75Release': B + 'chemie-current450-reviewed75-machine-assessment-releases-technical-20261018-v1/RECEIPT.actual-75-machine-assessment-design-releases.json',
    'THHBMetadata': B + 'chemie-current450-reviewed-TH-HB-live-source-metadata-integration-technical-20261018-v1/RECEIPT.actual-two-live-source-metadata-integration.json',
    'applicabilityApply': B + 'chemie-current450-reviewed-pH-scopes-and-final-AP-integration-technical-20261018-v1/RECEIPT.actual-two-pH-scopes-and-five-final-AP-materializations.json',
}
operations = {k: pin(v) for k, v in operation_paths.items()}
views = [pin(p) for p in sorted(Path('curricula/DE/Gymnasium/composition-views/chemie').glob('*.view.json'))]
assert len(views) == 41, 'Final cut requires all41 views'
for p in guard['protectedOtherSubjectPins']:
    check(p)
extra = {p['path']: pin(p['path']) for p in diagnosis['inputPins']}
extra[W] = pin(W)
for p in guard['protectedOtherSubjectPins']:
    extra[p['path']] = p
extra[seal] = pin(seal)
scope_receipt = 'RECEIPT.actual-final-source-view-applicability-cut.json'
write(scope_receipt, {
    'role': 'ACTUAL_FINAL_CHEMISTRY_NATIVE_INPUT_CUT_NOT_NATIVE_REVIEW_OR_M7',
    'frozenUTC': datetime.now(timezone.utc).isoformat(),
    'canonical': pin(C), 'semanticKinds': pin(S), 'normalRegistry': pin(R),
    'operationReceipts': operations, 'warningAcceptanceReceipt': pin(O / warning_receipt),
    'sourceCourseRules': [rules[r] for r in ['CQR-000', 'CQR-003', 'CQR-004', 'CQR-005']],
    'sourceAuditEvidence': pin(A + 'DIAGNOSIS.actual-stock-Chemistry-source-course-rules.json'),
    'all41CompositionViewPins': views, 'ordinaryGoals': 450, 'canonicalNodes': 737,
    'protectedOtherSubjectFilesByteExact': 828, 'nativeBindingRosterNotGuessed': True,
    'newDescriptionReviewsOrM7OrHumanApprovalClaimed': False,
})
plan = read(P + 'FINAL-CUT.root-plan.pending.template.json')
plan.update({
    'finalScopeApplied': True, 'canonical': pin(C), 'semanticKinds': pin(S), 'normalRegistry': pin(R),
    'finalScopeReceipt': pin(O / scope_receipt), 'finalApplicabilityReceipt': operations['applicabilityApply'],
    'finalOperationReceipts': operations, 'finalCompositionViewPins': views,
    'additionalInputGuards': list(extra.values()) + [pin(O / warning_receipt)],
})
write('FINAL-CUT.actual-root-plan.json', plan)
(O / 'freeze-writer.py').write_bytes(Path(__file__).read_bytes())
write('SEAL.actual-root-final-cut.json', {'role': 'FINAL_INPUT_PINS_ONLY_NOT_REVIEW_ACCEPTANCE', 'files': [pin(p) for p in sorted(O.iterdir())]})
print(json.dumps({'warningAppendApplied': True, 'oldEntriesPreserved': 110, 'sourceRulesPassed': ['CQR-000', 'CQR-003', 'CQR-004', 'CQR-005'], 'finalPlan': str(O / 'FINAL-CUT.actual-root-plan.json'), 'nativeModelBuilt': False}))
