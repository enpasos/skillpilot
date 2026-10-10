from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import json
import subprocess
import sys
from jsonschema import Draft202012Validator

OUT = Path(__file__).resolve().parent
ROOT = next(p for p in OUT.parents if (p / 'AGENTS.md').is_file())

def read(p):
    return json.loads(p.read_text())

def bind(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha256(p.read_bytes()).hexdigest()}

assembly_path = OUT / 'actual-final-nine-reviewed-Q2-materials-and-independent-kind-with-bounded-navigation-author-candidate.receipt.json'
assembly = read(assembly_path)
native_path = OUT / 'actual-native-CAN425-reviewed-Q2-nine-ordinary311-P311624-owner-current-production.function-bound-successor-v2.result.json'
native = read(native_path)
nav_path = ROOT / native['independentNavigationReceipt']['path']
nav = read(nav_path)
assert bind(nav_path) == native['independentNavigationReceipt']
assert nav['decision'] == 'KEEP' and nav['author'] == '/root' and nav['reviewer'] != '/root'
assert nav['authorFrozenHandoff']['sha256'] == bind(assembly_path)['sha256']
for item in assembly['frozenInputs']:
    assert bind(ROOT / item['path']) == item
for key in ['actualAcceptedWholeNineMaterials', 'independentWholeKindDecisions', 'navigationAuthorSuccessor', 'actualInertFrame425']:
    item = assembly[key]
    assert bind(ROOT / item['path']) == item
for key in ['actualSemanticLedger', 'actualCurrentNativeBook', 'retainedNegativeFirstAttemptTerminal']:
    item = native[key]
    assert bind(ROOT / item['path']) == item
assert read(OUT / 'actual-native-reviewed-Q2-nine.function-bound-successor-v2.terminal.json')['exitCode'] == 0
assert read(OUT / 'actual-native-reviewed-Q2-nine.terminal.json')['exitCode'] == 1
assert native['graph']['status'] == native['type']['status'] == 'pass'
assert native['ordinaryPages'] == native['positiveProfiles'] == 311
assert native['retainedWholeCases'] == 624
assert native['all425ActualCurrentSemanticInputFingerprintsMatch']
assert native['wholeNativeBookFromSuccessfulFirstLoadReusedExactly']
assert not native['repeatedBookBuildPerformed']
rows = native['actualOwnerRowsAgainstE9']
assert len(rows) == 311 and sum(not r['wholeExact'] for r in rows) == 44
assert {f for r in rows for f in r['actualChangedFields']} == {'externalReverseRequires', 'pageFingerprint'}
assert len(native['originalD46OwnerRows']) == 311
assert sum(not r['wholeExact'] for r in native['originalD46OwnerRows']) == 142
rules = {r['id']: r for r in native['actualCurrentProductionRules']['rules']}
assert rules['CQR-101']['metrics']['missingTerminalPath'] == 87
assert rules['CQR-102']['metrics']['missingDirectTerminalPath'] == 87
assert all(rules[k]['status'] == 'pass' for k in ['CQR-103', 'CQR-104', 'CQR-201', 'CQR-202', 'CQR-203'])
assert rules['CQR-202']['metrics']['concreteExamData'] == 46
assert rules['CQR-203']['metrics']['releasedCoverageCompleteExamData'] == 46
frame = read(ROOT / assembly['actualInertFrame425']['path'])
assert len(frame['goals']) == 425
errors = [{'path': list(e.path), 'message': e.message} for e in Draft202012Validator(read(ROOT / 'docs/landscape-runtime.schema.json')).iter_errors(frame)]
assert not errors, errors
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors
symlink_errors = curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors
parsed = []
for p in sorted(OUT.iterdir()):
    if p.suffix == '.json':
        raw = p.read_bytes()
        assert raw.endswith(b'\n')
        json.loads(raw)
        parsed.append(bind(p))
inputs = [ROOT / x['path'] for x in assembly['frozenInputs']] + [nav_path] + list(OUT.iterdir())
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--'] + [str(p.relative_to(ROOT)) for p in inputs], cwd=ROOT, capture_output=True, text=True)
assert not ignored.stdout.strip(), ignored.stdout
result = {
    'at': datetime.now(timezone.utc).isoformat(),
    'integrator': '/root',
    'decision': 'KEEP',
    'scope': 'Nine independently reviewed whole Q2 materials, separately reviewed bounded navigation wording, and actual native CAN425 semantic/book/production-route closure in an isolated candidate.',
    'assembly': bind(assembly_path),
    'independentNavigationReview': bind(nav_path),
    'actualNativeResult': bind(native_path),
    'actualFrame425': assembly['actualInertFrame425'],
    'wholeMachineReviewedMaterialBodies': 9,
    'uniqueCurrentWholeGoalPerformanceContracts': 44,
    'old415WholeGoalsAnd56WholeExamDataExact': True,
    'all425CurrentSemanticInputBindingsVerified': True,
    'ordinaryPages': 311,
    'positiveProfiles': 311,
    'wholePositiveCases': 624,
    'positiveStatus': 'E1/G1 ai_candidate needs_human_review',
    'currentProductionProfileUnchanged': True,
    'executableSelectorFunctionsAndWholeSourceVerified': True,
    'actualReleasedTerminalMaterials': 46,
    'priorReleasedTerminalMaterials': 37,
    'actualMissingTerminalPaths': 87,
    'priorMissingTerminalPaths': 127,
    'netNewReachableTerminalPaths': 40,
    'ownerPageDeltaAgainstE9': 44,
    'ownerPageDeltaAgainstHistoricalD46': 142,
    'ownerPageDeltaFieldsAgainstE9': ['externalReverseRequires', 'pageFingerprint'],
    'wholeFrameSchemaErrors': errors,
    'curriculumSymlinkErrors': symlink_errors,
    'wholeWrittenJsonFilesParsed': parsed,
    'ignoredInputs': [],
    'preservedFirstAttempt': 'The original native book load succeeded. Its later profile comparison failed because function-valued selectors were omitted in recorded JSON. Both the negative result and the full book were retained. The additive successor guarded serializable metadata and whole executable source separately, without a repeated book build or a changed production selector.',
    'dualIndependentCurrentOwnerPageDGateApproved': False,
    'source125WholeCourseAndTargetRolesApproved': False,
    'liveWrites': False,
    'humanApproval': False,
    'newStrictAcademicClosures': 0,
    'restoredStrictBindings': 0,
    'strictNetGain': 0,
    'nextStep': 'Combine only independently accepted Q3, Q1/Q4 and Katalog materials, finish the current source/target-role integration, and independently review affected final owner pages before central M7 checks.'
}
p = OUT / 'actual-final-nine-reviewed-Q2-native-CAN425-existing-navigation-and-current-production-bounded-KEEP.receipt.json'
with p.open('x') as f:
    f.write(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
read(p)
print(json.dumps({'receipt': bind(p), 'wholeMachineReviewedMaterials': 9, 'ordinaryPages': 311, 'actualReleasedTerminalMaterials': 46, 'missingTerminalPaths': 87, 'strictNetGain': 0}))
