"""Apache-2.0: actual scoped native commands and physical frozen export."""
from pathlib import Path
from datetime import datetime, timezone
import json
import hashlib
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
ISO = ROOT / 'tmp/chemie-q1-fourteen-current-native-physically-isolated-20261005-v3'
assert ISO.exists() and (OWN / 'current-base-and-scoped-rebase.actual.receipt.json').exists()
helper = ISO / REL / 'bind-semantic-and-check-v8.mts'
shutil.copyfile(OWN / helper.name, helper)
commands = [('semantic-and-exact-v8-native-bind', ['app/node_modules/.bin/tsx', str(REL / helper.name)])]
for kind in ['acids-derivatives', 'soaps', 'preservatives']:
    cfg = str(REL / f'a-{kind}.config.json')
    commands += [(f'a-{kind}-targeted-native-binding', ['app/node_modules/.bin/tsx', 'app/scripts/semanticAtomicityReview.ts', f'--config={cfg}', '--write-fingerprints']), (f'a-{kind}-native-check', ['app/node_modules/.bin/tsx', 'app/scripts/semanticAtomicityReview.ts', f'--config={cfg}', '--mode=check'])]
commands += [
    ('m-current-targeted-native-binding', ['app/node_modules/.bin/tsx', 'app/scripts/memoryCardReview.ts', f'--config={REL}/m-current-full.config.json', '--write-fingerprints']),
    ('m-current-cards-visibility-native-check', ['app/node_modules/.bin/tsx', 'app/scripts/memoryCardReview.ts', f'--config={REL}/m-current-full.config.json', '--mode=check']),
    ('source-atlas-native-generate', ['app/node_modules/.bin/tsx', 'app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json']),
    ('source-atlas-native-check', ['app/node_modules/.bin/tsx', 'app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json', '--check']),
    ('p14-current-native-materialize', ['app/node_modules/.bin/tsx', 'app/scripts/materializePositiveGoalEvidenceCandidates.ts', '--config', str(REL / 'positive-evidence.config.json'), '--candidates', str(REL / 'positive-evidence.candidates.json'), '--write']),
    ('p14-current-native-check', ['app/node_modules/.bin/tsx', 'app/scripts/positiveGoalEvidenceReview.ts', f'--config={REL}/positive-evidence.config.json', '--mode=check']),
    ('d15-current-native-book-prepare', ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'prepare', '--config', str(REL / 'batch.config.json')]),
    ('d15-current-native-book-check', ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'check', '--config', str(REL / 'batch.config.json')]),
]
terminal = []
for name, args in commands:
    start = datetime.now(timezone.utc).isoformat()
    p = subprocess.run(args, cwd=ISO, capture_output=True, text=True)
    out, err = OWN / (name + '.stdout.txt'), OWN / (name + '.stderr.txt')
    out.write_text(p.stdout)
    err.write_text(p.stderr)
    terminal.append({'name': name, 'args': args, 'cwd': str(ISO), 'startedAtUTC': start, 'endedAtUTC': datetime.now(timezone.utc).isoformat(), 'actualExitCode': p.returncode, 'stdoutPath': str(out.relative_to(ROOT)), 'stdoutSHA256': hashlib.sha256(out.read_bytes()).hexdigest(), 'stderrPath': str(err.relative_to(ROOT)), 'stderrSHA256': hashlib.sha256(err.read_bytes()).hexdigest()})
    (OWN / 'native-preparation-terminal.actual.receipt.json').write_text(json.dumps({'status': 'running' if p.returncode == 0 else 'failed_closed', 'commands': terminal, 'activeWrites': 0, 'humanApproval': False}, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'command': name, 'actualExitCode': p.returncode, 'stdout': p.stdout[:220], 'stderr': p.stderr[:1000]}), flush=True)
    assert p.returncode == 0, p.stderr

model = json.loads((ISO / REL / 'native-finalbook/bundle/book-model.json').read_text())
manifest = json.loads((ISO / REL / 'native-finalbook/batch-manifest.json').read_text())
render = json.loads((ISO / REL / 'native-finalbook/bundle/book.pdf.render-manifest.json').read_text())
assert len(model['pages']) == 15 and manifest['curriculumAtomicDenominatorAtPreparation'] == 376
assert render['goalPageCount'] == 15 and render['physicalPageCount'] == 17
assert not list((ISO / REL / 'native-finalbook/round-a/results').iterdir())
assert not list((ISO / REL / 'native-finalbook/round-b/results').iterdir())
assert all(p['visualization']['approvedForPublication'] is False for p in model['pages'])
records = [json.loads(line) for line in (ISO / REL / 'positive-evidence.review.jsonl').read_text().splitlines()]
assert len(records) == 14 and all(r['status'] == 'needs_human_review' and r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1' for r in records)
shutil.copytree(ISO / REL / 'native-finalbook', OWN / 'native-finalbook')
for source in sorted((ISO / REL).iterdir()):
    if source.is_file() and source.name not in ['independent-seven-a-m-scientific-decisions.json', 'bind-semantic-and-check-v8.mts']:
        shutil.copyfile(source, OWN / source.name)

receipt = json.loads((OWN / 'current-base-and-scoped-rebase.actual.receipt.json').read_text())
export = OWN / 'prospective-input-tree'
exported = []
baseline_inputs = {x['path']: x for x in receipt['copiedPhysicalInputs']}
for source in sorted(ISO.rglob('*')):
    if not source.is_file() or source.is_symlink() or 'node_modules' in source.parts:
        continue
    rel = str(source.relative_to(ISO))
    if rel.startswith(str(REL) + '/'):
        continue
    before = baseline_inputs.get(rel)
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if before and before['activeBeforeSHA256'] == digest:
        continue
    # Export current future input deltas and generated source atlas, never code.
    if not rel.startswith(('curricula/', 'app/scripts/config/goal-books/', 'app/public/assets/goal-visualizations/chemie/', 'backend/src/main/resources/static/assets/goal-visualizations/chemie/')):
        continue
    target = export / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    exported.append({'futureActivePath': rel, 'prospectiveCopyPath': str(target.relative_to(ROOT)), 'sha256': 'sha256:' + digest, 'bytes': source.stat().st_size, 'baselineSHA256': 'sha256:' + before['activeBeforeSHA256'] if before and before['activeBeforeSHA256'] else None})
for rel in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json', 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']:
    assert rel in {r['futureActivePath'] for r in exported}
(OWN / 'prepared-prospective-input-tree.receipt.json').write_text(json.dumps({'status': 'inactive_current90_explicit_Q1_future_inputs', 'isolationRoot': str(ISO), 'files': exported, 'fullSnapshotResetPermitted': False, 'activeWrites': 0}, ensure_ascii=False, indent=2) + '\n')
(OWN / 'native-preparation-terminal.actual.receipt.json').write_text(json.dumps({'status': 'PASS_current90_physically_isolated_Q1_native_D15_ready', 'commands': terminal, 'nativeModelDigest': model['digest'], 'bundleFingerprint': manifest['artifacts']['bundleFingerprint'], 'reviewInputFingerprint': manifest['artifacts']['reviewInputFingerprint'], 'currentAtomicDenominator': 376, 'newScientificCandidates': 14, 'targetedExistingBinding': 1, 'goalPages': 15, 'physicalPages': 17, 'twoBlindRoundsReady': True, 'roundResultsEmptyAtExport': True, 'P14NeedsHumanReview': True, 'V8ExactlyApprovedMachine': True, 'globalQSRun': False, 'activeWrites': 0, 'humanApproval': False, 'strictClosure': 0}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'D15ready': True, 'modelDigest': model['digest'], 'bundleFingerprint': manifest['artifacts']['bundleFingerprint'], 'exportedInputDeltas': len(exported), 'activeWrites': 0}), flush=True)
