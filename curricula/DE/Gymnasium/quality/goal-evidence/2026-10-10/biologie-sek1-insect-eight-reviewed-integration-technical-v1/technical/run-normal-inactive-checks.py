from pathlib import Path
import datetime
import hashlib
import json
import subprocess
import time

ROOT = Path.cwd()
OUT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-reviewed-integration-technical-v1')
CAPSULE = ROOT / 'tmp/m7-resumption-20261010/biologie-four-native-technical/isolated-biologie-four-native-h6w6nlaq'
CANON = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
KINDS = Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
QA = Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
CHECKS = OUT / 'checks'
CHECKS.mkdir(exist_ok=True)
entry = json.loads((OUT / 'reviewed-eight-integration.technical.entry.json').read_text())
plan = json.loads(Path(entry['actualRasterCopyPlan']['path']).read_text())


def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def put(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), str(path)
    path.write_bytes(value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode())


assert CAPSULE.is_dir() and CAPSULE.is_relative_to(ROOT / 'tmp')
normal_scripts = ['app/scripts/positiveGoalEvidenceReview.ts', 'app/scripts/generateGoalVisualizationQaLedgers.ts']
for script in normal_scripts:
    assert (ROOT / script).read_bytes() == (CAPSULE / script).read_bytes(), script
for active in entry['beforeActiveBindings']:
    assert sha(Path(active['path']).read_bytes()) == active['sha256'], active['path']
for asset in plan['assets']:
    existing = CAPSULE / ('app/public' + asset['learnerUrl'])
    assert sha(existing.read_bytes()) == asset['reviewedOriginal']['sha256'], str(existing)
for obj in entry['operativeOriginalAuthorP7AndSeparateCurrentP1']:
    for bound in [obj['config'], obj['exactAuthorRecords']]:
        source = Path(bound['path'])
        target = CAPSULE / source
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            assert target.read_bytes() == source.read_bytes(), str(target)
        else:
            target.write_bytes(source.read_bytes())

# Deliberate ignored selective-capsule preparation only. Root active files are never mutated.
for path in [CANON, KINDS, QA]:
    (CAPSULE / path).parent.mkdir(parents=True, exist_ok=True)
(CAPSULE / CANON).write_bytes(Path(entry['futureCanonicalCopy']['path']).read_bytes())
(CAPSULE / KINDS).write_bytes(KINDS.read_bytes())
(CAPSULE / QA).write_bytes(QA.read_bytes())
put('checks/existing-selective-capsule-reuse.actual.json', {
    'schemaVersion': 1, 'preparedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'capsule': str(CAPSULE.relative_to(ROOT)), 'capsuleAlreadyExisted': True,
    'normalScriptsByteExactToRoot': normal_scripts, 'reviewedEightPublicPNGsAlreadyPresentAndExact': True,
    'onlyCopiedInputs': ['reviewed479 canonical candidate', 'same current kinds', 'same current QA baseline', 'exact author future P7/P1 configs if missing'],
    'fullRepositoryCopy': False, 'newPublicationBundles': False, 'activeWrites': False,
})
runs = []


def run(label, args, cwd):
    command = [str(ROOT / 'app/node_modules/.bin/tsx')] + args
    start = time.monotonic()
    result = subprocess.run(command, cwd=cwd, text=True, capture_output=True)
    log = CHECKS / (label + '.actual.log.txt')
    assert not log.exists(), str(log)
    log.write_text(result.stdout + result.stderr)
    runs.append({'check': label, 'command': args, 'workingRootRole': 'active read-only root' if cwd == ROOT else 'ignored existing selective capsule',
                 'exitCode': result.returncode, 'durationSeconds': round(time.monotonic() - start, 3), 'logPath': str(log)})
    (CHECKS / 'normal-inactive-terminals.actual.json').write_text(json.dumps({
        'schemaVersion': 1, 'performedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'normalCheckersUnchanged': True, 'activeWrites': False, 'runs': runs,
    }, ensure_ascii=False, indent=2) + '\n')
    print(label, 'PASS' if result.returncode == 0 else 'FAIL', result.stdout.strip(), result.stderr.strip(), flush=True)
    if result.returncode:
        raise SystemExit(result.returncode)


run('normal-model-semantic-source-and-page-retention', [str(OUT / 'technical/check-normal-model-scopes.mts'), str(CAPSULE)], ROOT)
for obj in entry['operativeOriginalAuthorP7AndSeparateCurrentP1']:
    run('normal-author-P' + str(obj['count']) + '-future-canonical-path', ['app/scripts/positiveGoalEvidenceReview.ts', '--config=' + obj['config']['path'], '--mode=check'], CAPSULE)
run('normal-eight-QA-metadata-generation-capsule-only', ['app/scripts/generateGoalVisualizationQaLedgers.ts', '--subject=biologie'], CAPSULE)
generated = json.loads((CAPSULE / QA).read_text())
old_qa = json.loads(QA.read_text())
old_by = {row['goalId']: row for row in old_qa['records']}
ids = entry['goalIds']
paired = {row['goalId']: row for row in plan['pairedCurrentMachineKEEP']}
assets = {row['goalId']: row for row in plan['assets']}
for row in generated['records']:
    goal_id = row['goalId']
    if goal_id not in ids:
        assert row == old_by[goal_id], goal_id
        continue
    binding = paired[goal_id]
    assert row['assetSha256'] == assets[goal_id]['reviewedOriginal']['sha256']
    assert binding['aDecision'] == 'KEEP_MACHINE_CANDIDATE' and binding['bDecision'] == 'KEEP'
    row['aiApproved'] = 'yes'
    row['aiApprovedAssetSha256'] = row['assetSha256']
    row['aiReviewedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    row['aiReviewer'] = 'Two actual independent A/B machine reviewers; existing A technical integration only'
    row['aiNotes'] = ('Actual current original/360/680 raster and whole Native D/P reviewed in sealed independent rounds. A: '
                      + binding['aActualRationaleDe'] + ' B: ' + ' '.join(binding['bActualScienceFindingsDe'])
                      + ' Format: ' + binding['bActual360680FindingsDe']
                      + ' Exact A-origin=' + binding['aOrigin']['path'] + '; B-origin=' + binding['bOrigin']['path']
                      + '. Original FCC Ablock/Bkeep preserved historically; current correctedFCC assessed separately. '
                      + 'Generation is not approval. E1/G1 needs_human_review and separate human release gates remain; no third review, learner performance, course/source or human approval.')
    assert row['humanApproved'] == 'no'
changed_qa_ids = [row['goalId'] for row in generated['records'] if row != old_by[row['goalId']]]
assert set(changed_qa_ids) == set(ids) and len(changed_qa_ids) == 8
assert {key: value for key, value in generated.items() if key != 'records'} == {key: value for key, value in old_qa.items() if key != 'records'}
put('candidate/QA8.future-active.paired-current-machine.json', generated)
put('checks/normal-QA8-current-generation-and-exact-paired-KEEP.actual.json', {
    'schemaVersion': 1, 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'normalGeneratorUnchanged': True, 'generatedInIgnoredSelectiveCapsuleOnly': True,
    'onlyChangedCurrentQAGoalIds': changed_qa_ids, 'allOther386QARowsExact': True,
    'pairedActualMachineKeepBeforeApproval': True, 'originalFCCDissentRetained': True,
    'humanApproval': False, 'activeWrites': False, 'strictNetGain': 0,
})
for active in entry['beforeActiveBindings']:
    assert sha(Path(active['path']).read_bytes()) == active['sha256'], active['path']
print('PASS all four normal inactive terminals; futureQA8 paired actualKEEP; root active bytes exact and no new book/PDF', flush=True)
