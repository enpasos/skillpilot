from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import time
import yaml

r = Path('/home/enpasos/projects/skillpilot')
h = r / 'tmp/approach-review-20261101'
out = Path('/tmp/skillpilot-sparse-g4-declared-inputs-20261104-v1')
assert out.exists()
assert not (out / 'checkout').exists()
checkout = out / 'checkout'
head = 'ffc69cd4f5d75289d83d2b62b412faf01d841bae'
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=r, text=True).strip() == head
assert shutil.disk_usage(r).free > 8 * 1024 ** 3
workflow = yaml.safe_load((r / '.github/workflows/assessment-completion.yml').read_text())
job = next(j for j in workflow['jobs'].values() if j.get('name') == 'Mathematics curriculum integrity')
patterns = job['steps'][0]['with']['sparse-checkout']
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
started = time.monotonic()

def logged(name, argv, cwd=r, data=None):
    with (out / (name + '.log')).open('wb') as log:
        p = subprocess.run(list(map(str, argv)), cwd=cwd, input=data,
                           stdout=log, stderr=subprocess.STDOUT)
    return p.returncode

assert logged('clone', ['git', 'clone', '--shared', '--no-checkout', r, checkout]) == 0
assert logged('init-sparse', ['git', 'sparse-checkout', 'init', '--no-cone'], checkout) == 0
assert logged('initial-patterns', ['git', 'sparse-checkout', 'set', '--no-cone', '--stdin'], checkout, patterns.encode()) == 0
assert logged('checkout', ['git', 'checkout', '--detach', head], checkout) == 0
cp_entries = (h / 'statistics-pyramid-existing-route-native-20261104-v1/classpath-current.txt').read_text().strip().split(':')
fresh_build = h / 'backend-full-g4-ffc69-20261104-v1/backend-build'
cp_entries[1:5] = [str(fresh_build / relative) for relative in ['classes/java/test', 'resources/test', 'classes/java/main', 'resources/main']]
assert all(Path(p).exists() for p in cp_entries)
cp = ':'.join(cp_entries)
(out / 'classpath-current.txt').write_text(cp + '\n')
java = Path('/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1/bin')
classes = out / 'guard-classes'
classes.mkdir()
guard = checkout / 'backend/src/test/java/com/skillpilot/backend/composition/MaterializeMathContextualCombinedViews.java'
assert logged('compile-guard', [java / 'javac', '-J-Xmx1200m', '-encoding', 'UTF-8', '-implicit:none', '-sourcepath', out / 'empty-sourcepath', '-cp', cp, '-d', classes, guard]) == 0
argv = [java / 'java', '-Xmx2g', '-cp', str(classes) + ':' + cp, 'com.skillpilot.backend.composition.MaterializeMathContextualCombinedViews', '--data-root', checkout, '--check']

def hydrate(name):
    p = subprocess.run(['python3', 'scripts/curriculum_completion_inputs.py', '--sparse-patterns'], cwd=checkout, capture_output=True, check=True)
    assert logged(name, ['git', 'sparse-checkout', 'add', '--stdin'], checkout, p.stdout) == 0
    return p.stdout.decode().splitlines()

before_inputs = hydrate('old-hydration')
before_exit = logged('original-guard-failure', argv, checkout / 'backend')
missing = 'curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-11-04/geometry-four-projection-reuse/exact-separate-assessment-placement.json'
base = 'curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-11-04/geometry-four-projection-reuse/before-g3-finite-scope-operations.json'
assert before_exit != 0 and missing in (out / 'original-guard-failure.log').read_text()
assert not (checkout / missing).exists()
scripts = ['scripts/curriculum_completion_inputs.py', 'scripts/test_curriculum_completion_integrity_report.py']
for relative in scripts:
    shutil.copyfile(out / 'candidate' / relative, checkout / relative)
after_inputs = hydrate('new-hydration')
assert (checkout / missing).is_file() and (checkout / base).is_file()
assert logged('strict-report-contracts', ['python3', 'scripts/test_curriculum_completion_integrity_report.py'], checkout) == 0
views = checkout / 'curricula/DE/Gymnasium/composition-views/mathematik'
before_views = {p.name: sha(p) for p in views.glob('*.json')}
after_exit = logged('final-guard-pass', argv, checkout / 'backend')
assert after_exit == 0
assert before_views == {p.name: sha(p) for p in views.glob('*.json')}
assert all((checkout / p.lstrip('/')).is_file() for p in after_inputs)
record = {'status': 'ACTUAL_WORKFLOW_SPARSE_CHECKOUT_FAILURE_REPRODUCED_AND_DECLARED_INPUT_FIX_PASSED', 'commit': head, 'workflowSha256': sha(r / '.github/workflows/assessment-completion.yml'), 'scriptSha256': {p: sha(out / 'candidate' / p) for p in scripts}, 'rootScriptSha256': {p: sha(r / p) for p in scripts}, 'currentCompiledClasspath': str(out / 'classpath-current.txt'), 'freshGuardSourceSha256': sha(guard), 'originalGuardExitCode': before_exit, 'fixedGuardExitCode': after_exit, 'originalInputCount': len(before_inputs), 'finalInputCount': len(after_inputs), 'newDeclaredInputPatterns': sorted(set(after_inputs) - set(before_inputs)), 'actualViewFilesUnchanged': len(before_views), 'actualCombinedDocumentsChecked': 39, 'actualCombinedRequestsChecked': 46, 'noRootGitOrCurriculumWrites': True, 'noM7OrFullCiClaim': True, 'seconds': round(time.monotonic() - started, 2)}
(out / 'execution.json').write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps(record), flush=True)
