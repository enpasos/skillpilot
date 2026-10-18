#!/usr/bin/env python3
"""Build only this additive technical proposal; never install a normal baseline."""
import copy
import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import zipfile

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
HEAD = '06a03ecbc193550b73d7d7b3af53a5a7e61b17fb'
REVIEWER = '/root/chemie_final_native_round_b_20261018'
NORMAL_BASELINE = Path('curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-baseline.json')
READ_CACHE = {}
PIN_CACHE = {}
NODE_CACHE = {}

def rel(p):
    return str(Path(p).resolve().relative_to(ROOT))

def sha(data):
    return hashlib.sha256(data).hexdigest()

def read(p):
    key = str(p)
    if key not in READ_CACHE:
        READ_CACHE[key] = json.loads((ROOT / p).read_text())
    return READ_CACHE[key]

def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def pin(p):
    p = Path(p)
    if p.is_absolute():
        p = p.relative_to(ROOT)
    key = str(p)
    if key not in PIN_CACHE:
        data = (ROOT / p).read_bytes()
        PIN_CACHE[key] = {'path': key, 'sha256': sha(data), 'bytes': len(data)}
    return dict(PIN_CACHE[key])

def evidence(p, pointer, meaning):
    item = pin(p)
    item.update(jsonPointer=pointer, scope=meaning)
    node = read(p)
    if pointer:
        for part in pointer.strip('/').split('/'):
            part = part.replace('~1', '/').replace('~0', '~')
            node = node[int(part)] if isinstance(node, list) else node[part]
    return item

def walk(value, pointer=''):
    if isinstance(value, dict):
        yield pointer, value
        for key, v in value.items():
            yield from walk(v, pointer + '/' + key.replace('~', '~0').replace('/', '~1'))
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from walk(v, pointer + '/' + str(i))

def path_nodes(document, target):
    key = id(document)
    if key not in NODE_CACHE:
        index = {}
        for pointer, node in walk(document):
            for name in ['path', 'relativePath', 'runtimePath']:
                p = node.get(name)
                if isinstance(p, str):
                    index.setdefault(p, []).append((pointer, node))
        NODE_CACHE[key] = index
    return NODE_CACHE[key].get(target, [])

assert (ROOT / '.git').exists(), ROOT
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip() == HEAD
diagnosis_path = Path('tmp/chemie450-ci-watch-failure.diagnosis-and-bounded-proposal.json')
diagnosis = read(diagnosis_path)
candidate_input = ROOT / 'tmp/chemie450-ci-watch-failure.bounded-baseline-candidate.json'
candidate_bytes = candidate_input.read_bytes()
assert sha(candidate_bytes) == '5519cc6671e45ba9d962a4cfc4f921b599f04d38d3e642e7ecd1461e983a24a2'
candidate = json.loads(candidate_bytes)
original_bytes = subprocess.check_output(['git', 'show', HEAD + ':' + str(NORMAL_BASELINE)], cwd=ROOT)
assert original_bytes == (ROOT / NORMAL_BASELINE).read_bytes()
original = json.loads(original_bytes)
(HERE / 'history').mkdir(exist_ok=True)
(HERE / 'candidate').mkdir(exist_ok=True)
(HERE / 'history/chemistry-evidence-watch-baseline.before.exact.json').write_bytes(original_bytes)
(HERE / 'candidate/chemistry-evidence-watch-baseline.bounded-candidate.json').write_bytes(candidate_bytes)
artifact = ROOT / 'tmp/chemie450-ci-watch-failure.artifact12135642700.zip'
assert sha(artifact.read_bytes()) == 'ebcfe045f5f1aa38ed4ae22cabb8863484550fa8bf563231a57c27f92531dd6e'
(HERE / 'history/failed-run39124585152-artifact12135642700.zip').write_bytes(artifact.read_bytes())
with zipfile.ZipFile(artifact) as z:
    for member in z.namelist():
        assert '/' not in member and member.endswith('.md')
        (HERE / 'history' / ('failed-CI.' + member)).write_bytes(z.read(member))
for source, dest in [
    ('tmp/chemie450-ci-watch-failure.job117666923952.log', 'history/failed-job117666923952.log'),
    ('tmp/chemie450-ci-watch-failure.previous-green.job117599595302.log', 'history/previous-green-job117599595302.log'),
    (str(diagnosis_path), 'history/DIAGNOSIS.original-readonly-proposal.json'),
    ('tmp/chemie450-ci-watch-failure.predecessor-control-byte-comparison.json', 'history/PREDECESSOR.original-control-byte-comparison.json'),
]:
    (HERE / dest).write_bytes((ROOT / source).read_bytes())

audit_path = BASE / 'chemie-current450-current737-original-source-audit-technical-20261018-v1/DIAGNOSIS.actual-stock-Chemistry-source-course-rules.json'
audit = read(audit_path)
ap_base = BASE / 'chemie-current450-final737-AP-and-all41-closure-checkpoint-technical-20261018-v1/INPUTS.actual-normal-production-and-read-pins.json'
ap_base_doc = read(ap_base)
ap_follow = BASE / 'chemie-current450-six-header-AP-all41-followup-technical-20261018-v1/INPUTS.actual-normal-production-and-read-pins.json'
ap_follow_doc = read(ap_follow)
ap_check = BASE / 'chemie-current450-six-header-AP-all41-followup-technical-20261018-v1/CHECK.actual737-stored-derived-applicability-and-all41-effective-closure.json'
ap_check_doc = read(ap_check)
ap_seal = BASE / 'chemie-current450-six-header-AP-all41-followup-technical-20261018-v1/SEAL.readonly-final737-checkpoint.json'
central_path = Path('docs/qa-ci/status/curriculum-quality-status.json')
central = read(central_path)
runtime_root = BASE / 'chemie-checkpoint-runtime-mapping-contract-readonly-b-20261018-v1'
runtime_end = runtime_root / 'followup-six-review-markers-actual-v1/POST.final-test-byte-integrity.receipt.json'
runtime_end_doc = read(runtime_end)
runtime61 = runtime_root / 'integration-actual-v1/INTEGRATION61.actual-byte-checks.receipt.json'
header6 = runtime_root / 'followup-six-review-markers-actual-v1/MARKERS6.full-before-blocks-and-byte-checks.receipt.json'
header_hh = runtime_root / 'followup-fixture-counts-and-hh-actual-v1/HH139.review-marker-removal.actual-byte-checks.receipt.json'
header_clarification = runtime_root / 'followup-six-review-markers-actual-v1/CLARIFICATION.runtime-decision-vs-cumulative-source-ledger.actual.json'

integration_files = [
    'chemie-current450-six-process-reviewed-source-integration-technical-20261018-v1/RECEIPT.actual-finite-normal-integration.json',
    'chemie-current450-single53-reviewed-source-integration-technical-20261018-v1/RECEIPT.actual-single53-source-CAS-integration.json',
    'chemie-current450-fourteen-method-reviewed-source-integration-technical-20261018-v1/RECEIPT.actual-fourteen-source-normal-integration.json',
    'chemie-current450-forty-content-reviewed-source-integration-technical-20261018-v1/RECEIPT.actual-C40-reviewed-source-normal-integration.json',
    'chemie-current450-BY-reviewed-source-view-integration-20261018-v1/RECEIPT.actual-BY62-view-and-three-foundations-integration.json',
    'chemie-current450-four-reviewed-nonBY-views-integration-20261018-v1/RECEIPT.actual-four-reviewed-views-and-two-foundation-targets.json',
    'chemie-current450-ten-machine-exam-releases-and-two-recovered-routes-integration-technical-20261018-v1/RECEIPT.actual-ten-reviewed-exam-releases-and-two-route-recoveries.json',
    'chemie-current450-T1-reviewed-twelve-normal-integration-technical-20261018-v1/RECEIPT.actual-T1-twelve-assessment-integration.json',
    'chemie-current450-T2-reviewed-nineteen-normal-integration-technical-20261018-v1/RECEIPT.actual-T2-nineteen-assessment-and-source-integration.json',
    'chemie-current450-T3-reviewed-seventeen-normal-integration-technical-20261018-v1/RECEIPT.actual-T3-seventeen-assessment-integration.json',
    'chemie-current450-T4-reviewed-sixteen-normal-integration-technical-20261018-v1/RECEIPT.actual-T4-sixteen-assessment-integration.json',
    'chemie-current450-T4-reviewed-two-operative-normal-integration-technical-20261018-v1/RECEIPT.actual-T4-two-operative-assessment-integration.json',
    'chemie-current450-T5-reviewed-eight-normal-integration-technical-20261018-v1/RECEIPT.actual-T5-eight-assessment-integration.json',
    'chemie-current450-reviewed-orientation-normal-integration-technical-20261018-v1/RECEIPT.actual-reviewed-orientation-normal-integration.json',
    'chemie-current450-three-reviewed-orientation-checkpoint-integration-technical-20261018-v1/RECEIPT.actual-three-orientation-SEM-P-checkpoint-integration.json',
    'chemie-current450-reviewed-pH-scopes-and-final-AP-integration-technical-20261018-v1/RECEIPT.actual-two-pH-scopes-and-five-final-AP-materializations.json',
    'chemie-current450-reviewed-TH-HB-live-source-metadata-integration-technical-20261018-v1/RECEIPT.actual-two-live-source-metadata-integration.json',
]
integrations = [(BASE / p, read(BASE / p)) for p in integration_files]
source_rules = [(i, r) for i, r in enumerate(audit['rules']) if r['id'] in ['CQR-000', 'CQR-003', 'CQR-004', 'CQR-005']]
assert len(source_rules) == 4 and all(r['status'] == 'pass' for _, r in source_rules)
central_rules = [(i, r) for i, r in enumerate(central['curricula'][1]['rules']) if r['id'] in ['CQR-000', 'CQR-003', 'CQR-004', 'CQR-005']]
assert len(central_rules) == 4 and all(r['status'] == 'pass' for _, r in central_rules)
bindings = []
for change in diagnosis['paths']:
    p = change['path']
    raw = subprocess.check_output(['git', 'show', HEAD + ':' + p], cwd=ROOT)
    assert raw == (ROOT / p).read_bytes(), p
    byte_pin = {'path': p, 'sha256': sha(raw), 'bytes': len(raw), 'commit': HEAD,
                'gitBlob': subprocess.check_output(['git', 'rev-parse', HEAD + ':' + p], cwd=ROOT, text=True).strip(),
                'workingBytesExactToCommit': True}
    category = ('source' if '/input/' in p else 'mapping' if '/mapping/' in p
                else 'view' if '/composition-views/' in p else 'canonical')
    refs = []
    # Every path is tied to an actual later compiler-read/input pin. Six changed
    # runtime headers use the explicit sparse follow-up after-pin, not stale base.
    fresh = [(f'/sixRawInputDeltas/{i}/after', r['after']) for i, r in enumerate(ap_follow_doc['sixRawInputDeltas']) if r['path'] == p]
    if fresh:
        for pointer, record in fresh:
            assert record['sha256'] == byte_pin['sha256']
            refs.append(evidence(ap_follow, pointer, 'Actual post-header compiler input raw bytes, independently rehashed.'))
    else:
        exact = [(ptr, node) for ptr, node in path_nodes(ap_base_doc, p) if node.get('sha256') == byte_pin['sha256']]
        assert exact, ('missing actual AP input pin', p)
        refs.append(evidence(ap_base, exact[0][0], 'Actual base compiler/view check input, rehashed unchanged by sparse six-header follow-up.'))
    if category in ['source', 'mapping']:
        old = [(i, r) for i, r in enumerate(audit['inputPins']) if r['path'] == p]
        if old:
            i, r = old[0]
            refs.append(evidence(audit_path, f'/inputPins/{i}',
                '10:19UTC source/course evaluator input; ' + ('raw bytes still exact.' if r['sha256'] == byte_pin['sha256'] else 'pre-runtime-fix raw bytes; bounded transition receipts below carry the change.')))
        else:
            assert p == 'curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_CHEMIE_SEKII_MSS_2022.source-extraction.json'
            refs.append(evidence(audit_path, '/mappingPipeline/sources/20',
                'Actual RP SekII source pipeline inventory; this remains an incomplete mapping pipeline, not a new whole-source approval. The evaluator separately pinned the selected-unit23 source carrier at /inputPins/133.'))
            refs.append(evidence(audit_path, '/inputPins/133',
                'Selected-unit23 scoped source carrier read by 10:19UTC evaluator; distinct from full normal RP source raw file.'))
        refs.extend(evidence(audit_path, f'/rules/{i}',
            'Existing bounded Chemistry stock source/course result at 10:19UTC; no new source/science vote.') for i, _ in source_rules)
        refs.extend(evidence(central_path, f'/curricula/1/rules/{i}',
            'Existing full central M6-cut source/course result at ' + central['generatedAt'] + '; predates six header-only transport fixes.') for i, _ in central_rules)
        if category == 'mapping' and old and old[0][1]['sha256'] != byte_pin['sha256']:
            matches = [(i, r) for i, r in enumerate(runtime_end_doc['runtimeFiles']) if r['path'] == p]
            assert len(matches) == 1
            i, record = matches[0]
            assert record['currentSha256'] == byte_pin['sha256'] and record['unchangedSinceAuthorizedInstall']
            refs.append(evidence(runtime_end, f'/runtimeFiles/{i}', 'Actual stable final runtime bytes after authorized alias/header integration and all145 backend tests.'))
            for fixpath in [runtime61, header6, header_hh]:
                document = read(fixpath)
                nodes = path_nodes(document, p)
                if nodes:
                    refs.append(evidence(fixpath, nodes[0][0], 'Actual path-specific bounded runtime integration; retained exact/mapping entry bytes and scientific review carriers preserved.'))
            if '/DE-SH/lower-secondary/' in p:
                refs.append(evidence(header_clarification, '', 'SH decision is cumulative and NOT whole-object-identical; six C7 metadata objects exact; removed raw decision preserved in audit.'))
    elif category == 'view':
        view = [(i, r) for i, r in enumerate(ap_check_doc['closure']['views']) if r['path'] == p]
        assert len(view) == 1
        refs.append(evidence(ap_check, f'/closure/views/{view[0][0]}',
            'Actual final scope, roles, target/parent vectors and complete effective transitive prerequisite closure; zero missing pairs.'))
        refs.append(evidence(ap_seal, '', 'Actual 11:41UTC independent post-six-header all41 follow-up, exact vector equality to sealed base.'))
    else:
        refs.extend([
            evidence(central_path, '/curricula/1', 'Existing central Chemistry M6 measurement: 260/450 strict, CQR-303 remains fail,190 remaining; not M7.'),
            evidence(BASE / 'chemie-current450-M6-commit-checkpoint-QS-technical-20261018-v1/FINAL.current-bindings-and-dependent-evidence.json', '/currentNormalInputs/0', 'Final QA checkpoint binds exact current canonical raw bytes.'),
            evidence(BASE / 'chemie-current450-M6-commit-checkpoint-QS-technical-20261018-v1/SEAL.local-core-and-dependent-QS.json', '', 'Existing local QA seal; open native/P/D findings and no new scientific first completions.'),
        ])
    # Retain concrete normal integration history only where the actual technical
    # receipt names this exact path. Earlier pins are transitions, never falsely
    # relabelled as current full-byte equality.
    for integration_path, document in integrations:
        matches = path_nodes(document, p)
        if matches:
            pointer, node = matches[-1]
            refs.append(evidence(integration_path, pointer,
                'Existing reviewed normal integration or preservation record naming this path; historical stage pin, combined with later final input/closure evidence.'))
    bindings.append({'path': p, 'change': change['change'], 'category': category,
                     'headRawBytes': byte_pin, 'beforeWatchRecord': change['before'],
                     'candidateWatchRecord': change['current'],
                     'effectiveHashMode': change['current'].get('hashMode', 'raw-bytes-v1'),
                     'technicalRecognitionOnly': True, 'evidence': refs})
assert len(bindings) == 142
write('BINDINGS.142-paths-current-HEAD-and-existing-evidence.json', {
    'role': 'BOUNDED_TECHNICAL_M6_SNAPSHOT_ACKNOWLEDGEMENT_PLAN_NOT_NEW_SCIENCE_D_M7_OR_HUMAN_VOTE',
    'head': HEAD, 'reviewerId': REVIEWER, 'records': bindings,
    'temporalQualification': '10:19UTC bounded source evaluator and11:36:54UTC full central report precede six header-only transport fixes. Existing byte-preservation receipts and actual11:41UTC AP/all41 follow-up carry these deltas. No fresh full source-evaluator run is claimed.',
    'RPQualification': 'The source evaluator records the full RP SekII source as incomplete in mappingPipeline/sources/20 and separately reads the selected-unit23 scoped source. Technical snapshot acknowledgement does not close this pipeline or promote a partial contribution to exact.'})

controls = [
    '.github/workflows/canonical_chemistry_evidence_watch.yml',
    'scripts/canonical_chemistry_evidence_watch.py',
    'scripts/run_canonical_chemistry_evidence_watch.sh',
    'curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json',
    'curricula/DE/Gymnasium/provenance/chemistry-bundesland-rollout-tracker.json',
    'app/scripts/config/curriculum-maturity-floor-policy.json',
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
]
protected = []
for p in controls:
    value = pin(p)
    assert (ROOT / p).read_bytes() == subprocess.check_output(['git', 'show', HEAD + ':' + p], cwd=ROOT)
    protected.append(value)
write('PROTECTED.controls-tracker-and-floors.exact.json', {'head': HEAD, 'files': protected, 'allExactToHEAD': True})

spec = importlib.util.spec_from_file_location('watch', ROOT / 'scripts/canonical_chemistry_evidence_watch.py')
watch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(watch)
manifest = watch.load_json(watch.MANIFEST_PATH)
for key in ['statusViewPath', 'deltaViewPath']:
    normal_view = manifest[key]
    view_bytes = (ROOT / normal_view).read_bytes()
    assert view_bytes == subprocess.check_output(['git', 'show', HEAD + ':' + normal_view], cwd=ROOT)
    (HERE / 'history' / ('before-normal.' + Path(normal_view).name)).write_bytes(view_bytes)
_, changed, added, removed, unchanged = watch.diff_records(manifest, original)
_, candidate_changed, candidate_added, candidate_removed, _ = watch.diff_records(manifest, candidate)
assert len(changed) == 138 and len(added) == 4 and not removed
assert not candidate_changed and not candidate_added and not candidate_removed
old_records = {r['relativePath']: r for r in original['watchedFiles']}
new_records = {r['relativePath']: r for r in candidate['watchedFiles']}
for p in diagnosis['unchangedPaths']:
    assert old_records[p] == new_records[p]
changed_metadata = [key for key in sorted(set(original) | set(candidate)) if key != 'watchedFiles' and original.get(key) != candidate.get(key)]
assert changed_metadata == ['updatedAt', 'watchedFileCount'], changed_metadata
assert len(old_records) == 156 and len(new_records) == 160
assert {r['path'] for r in bindings} == {r['path'] for r in diagnosis['paths']}
for p, record in new_records.items():
    if p in old_records:
        assert record.get('hashMode', 'raw-bytes-v1') == old_records[p].get('hashMode', 'raw-bytes-v1')
checks = {
    'role': 'ACTUAL_READ_ONLY_CANDIDATE_AND_PATH_BINDING_CHECK_NO_NORMAL_INSTALLATION',
    'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewerId': REVIEWER, 'head': HEAD,
    'baselineBefore': pin(NORMAL_BASELINE), 'candidate': pin(HERE / 'candidate/chemistry-evidence-watch-baseline.bounded-candidate.json'),
    'baselineRecordsBefore': 156, 'candidateRecords': 160,
    'currentDelta': {'changed': 138, 'added': 4, 'removed': 0},
    'candidateStockDiff': {'changed': 0, 'added': 0, 'removed': 0},
    'unchangedCompleteRecordsPreservedExactly': diagnosis['unchangedPaths'],
    'changedTopLevelMetadataOnly': changed_metadata,
    'all142RawInputsExactToHEAD': True,
    'categories': {c: sum(r['category'] == c for r in bindings) for c in ['canonical', 'source', 'mapping', 'view']},
    'allEvidencePointersExistAndEvidenceFilesPinned': True,
    'hashModesUnchanged': True,
    'protectedNormalFilesExactToHEAD': True,
    'normalBaselineInstalled': False, 'normalWritesByThisTask': 0,
    'fullBuildsOrSourceReevaluations': 0, 'newScienceDOrM7Votes': 0, 'humanApproval': False,
}
write('CHECK.actual-bounded-candidate-and142-bindings.json', checks)
write('PLAN.pending-independent-review-and-root-installation.json', {
    'role': 'PENDING_BOUNDED_TECHNICAL_M6_SNAPSHOT_ACKNOWLEDGEMENT_ONLY',
    'preparedAt': checks['checkedAt'], 'reviewerId': REVIEWER, 'head': HEAD,
    'status': 'prepared_not_installed_pending_independent_A_review',
    'failedCI': {'run': 39124585152, 'job': 117666923952, 'artifact': 12135642700,
                 'url': 'https://github.com/enpasos/skillpilot/actions/runs/39124585152/job/117666923952',
                 'actualFailure': 'unchanged watcher: changed=138 added=4 removed=0; self-test passed'},
    'candidate': checks['candidate'],
    'recognition': 'Only the intended reviewed M6 technical input snapshot is acknowledged. This creates no new scientific, D, M7 or human decision and no full source approval.',
    'openBoundaries': ['Chemistry remains M6.', 'CQR-303 remains failed;190/450 strict completions remain open.',
        'Existing D/P/A findings, native holds and inactive first passes remain open and unregistered.',
        'RP source pipeline and other existing source-mapping incompleteness remain as measured.',
        'No maturity threshold, tracker, manifest, hash mode, workflow or checker is changed.'],
    'prerequisitesForInstallation': ['Independent A validates this concrete sealed plan and candidate.',
        'Root authorizes narrow installation.', 'Recheck pinned HEAD and every142rawinput/18restrecord/control identity; stop on any new drift.'],
    'proposedNormalWriteAllowlist': [str(NORMAL_BASELINE),
        manifest['statusViewPath'], manifest['deltaViewPath']],
    'proposedStepsAfterApproval': [
        'Copy exact sealed candidate bytes to the normal baseline; do not capture-baseline all records.',
        'Render the two existing MDs with unchanged normal watcher commands.',
        'Run bash scripts/run_canonical_chemistry_evidence_watch.sh in full, preserving actual execution/logs.',
        'Verify only the three allowed normal paths changed;142selectedwatchrecords+updatedAt/watchedFileCount only;18completeoldrecords and all protected controls remain exact.',
        'Record actual success/failure additively. No build, commit or remote write.'],
    'installationExecuted': False, 'originalWatchExecutedForThisPlan': False,
})
print(json.dumps({'status': 'PASS_PLAN_ONLY', 'package': rel(HERE), 'candidate': checks['candidate'],
                  'categories': checks['categories'], 'unchangedCompleteRecords': 18}, ensure_ascii=False))
