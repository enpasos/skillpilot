from pathlib import Path
import concurrent.futures, datetime, hashlib, json, os, subprocess, sys, time

R = Path('/home/enpasos/projects/skillpilot')
O = Path(__file__).resolve().parent
node = Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
env = dict(os.environ)
env['PATH'] = str(Path(node).parent) + os.pathsep + env['PATH']
env['FONTCONFIG_FILE'] = '/tmp/skillpilot-native-liberation-fonts-4dyn_jva/fonts.conf'
env['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH'] = '/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome'
node_version = subprocess.check_output([node, '--version'], env=env, text=True).strip()
assert node_version.startswith('v20.'), node_version
tasks = {
    '01.graph': 'validate:graph',
    '02.assets': 'check:goal-visualization-assets',
    '03.composition-views': 'validate:composition-views',
    '04.view-filters': 'validate:view-filters',
    '05.source-landscape-registry': 'check:source-landscape-registry',
    '06.deep-understanding-rollout': 'test:deep-understanding-rollout',
}
selected = sys.argv[1:]
assert selected and len(selected) == len(set(selected)) and all(x in tasks for x in selected)
code_files = {
    '01.graph': 'app/scripts/validateGraph.ts',
    '02.assets': 'scripts/check_goal_visualization_assets.mjs',
    '03.composition-views': 'app/scripts/validateCompositionViews.ts',
    '04.view-filters': 'app/scripts/validateViewFilters.ts',
    '05.source-landscape-registry': 'app/scripts/checkSourceLandscapeRegistry.ts',
    '06.deep-understanding-rollout': 'app/scripts/testDeepUnderstandingRollout.ts',
}
def binding(path):
    p = R / path
    return {'path': path, 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()
def execute(label):
    script = tasks[label]
    raw_path = O / f'{label}.raw.txt'
    receipt_path = O / f'{label}.actual-command.READONLY.json'
    assert not raw_path.exists() and not receipt_path.exists(), label
    before = [binding(code_files[label]), binding('app/package.json'), binding('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'), binding('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')]
    argv = ['npm', '--prefix', 'app', 'run', script]
    started = now()
    start = time.monotonic()
    print(json.dumps({'label': label, 'state': 'started', 'UTC': started, 'script': script}), flush=True)
    with raw_path.open('xb') as f:
        proc = subprocess.run(argv, cwd=R, env=env, stdout=f, stderr=subprocess.STDOUT)
    completed = now()
    after = [binding(x['path']) for x in before]
    receipt = {
        'status': 'PASS' if proc.returncode == 0 else 'FAIL',
        'label': label, 'argv': argv, 'workingDirectory': str(R),
        'startedAtUTC': started, 'completedAtUTC': completed,
        'elapsedSeconds': round(time.monotonic() - start, 3), 'exitCode': proc.returncode,
        'nodePath': node, 'nodeVersion': node_version,
        'environmentSelectedNonPrivateValues': {'PATHNodePrefix': str(Path(node).parent), 'FONTCONFIG_FILE': env['FONTCONFIG_FILE'], 'GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH': env['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH']},
        'inputsBefore': before, 'inputsAfter': after, 'observedInputsWholeExact': before == after,
        'rawLogPath': str(raw_path), 'rawLogSha256': 'sha256:' + hashlib.sha256(raw_path.read_bytes()).hexdigest(), 'rawLogBytes': raw_path.stat().st_size,
        'newTestsOrRuntimeChanges': 0, 'activeCurriculumRegistryOrCodeWritesByRunner': 0,
        'ownReceiptsOutsideRepositoryOnly': True,
    }
    with receipt_path.open('x') as f:
        f.write(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'label': label, 'state': 'completed', 'UTC': completed, 'exitCode': proc.returncode, 'elapsedSeconds': receipt['elapsedSeconds'], 'observedInputsWholeExact': before == after, 'receipt': str(receipt_path)}), flush=True)
    return proc.returncode
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    results = list(pool.map(execute, selected))
sys.exit(0 if all(v == 0 for v in results) else 1)
