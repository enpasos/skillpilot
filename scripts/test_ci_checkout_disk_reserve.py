#!/usr/bin/env python3
"""Exercise embedded CI disk guards with inert commands; never clean the host."""
from functools import lru_cache
import os
import re
import shlex
import shutil
from pathlib import Path
import subprocess
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
import hashlib
import json

import yaml
import check_ci_curriculum_checkout as curriculum_checkout
import check_ci_openai_edge_checkout as edge_checkout

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / '.github/workflows/ci.yml'
PRE = 'Reserve disk space for selected repository inputs'
POST = 'Verify disk reserve after checkout'
GIB = 1024 ** 3


@lru_cache(maxsize=1)
def workflow():
    return yaml.safe_load(WORKFLOW.read_text())


def full_checkout_jobs(document):
    return tuple(name for name, job in document['jobs'].items()
                 if any(step.get('uses', '').startswith('actions/checkout@')
                        and not step.get('with', {}).get('sparse-checkout')
                        for step in job['steps']))


FULL_JOBS = full_checkout_jobs(workflow())
SPARSE_JOBS = ('goal-book-publication', 'frontend-ci', 'graph-validation')
EDGE_JOB = 'openai-v1-public-edge-ci'
JOBS = tuple(name for name, job in workflow()['jobs'].items()
             if any(step.get('name') == PRE for step in job['steps']))


def step_source(job, name):
    steps = [step for step in workflow()['jobs'][job]['steps'] if step.get('name') == name]
    if len(steps) != 1:
        raise AssertionError(f'Expected exactly one {name} in {job}')
    return steps[0]


def script(job, name):
    return step_source(job, name)['run']


def simulate(source, available, runner='github-hosted', system='Linux', docker_fail=False, checkout_mode='full'):
    # Every destructive entry point is shadowed. Fake sudo records arguments and
    # NEVER dispatches its command; direct destructive calls fail the test.
    with tempfile.TemporaryDirectory(prefix='ci-disk-guard-') as directory:
        root = Path(directory)
        binaries = root / 'bin'
        binaries.mkdir()
        workspace = root / 'workspace'
        workspace.mkdir()
        log = root / 'sudo.log'
        commands = {
            'sudo': '''#!/bin/sh
printf '%s\n' "$*" >> "$CI_DISK_TEST_LOG"
if [ "${1-}" = docker ] && [ "$CI_DISK_TEST_DOCKER_FAIL" = 1 ]; then exit 1; fi
''',
            'df': '''#!/bin/sh
if [ "${1-}" = -B1 ]; then printf 'Avail\n%s\n' "$CI_DISK_TEST_BYTES";
else printf 'synthetic filesystem information\n'; fi
''',
            'du': '#!/bin/sh\nprintf "synthetic Git size\\n"\n',
        }
        for name in ('rm', 'find', 'docker', 'apt-get'):
            commands[name] = '#!/bin/sh\necho "Unexpected direct destructive command" >&2\nexit 97\n'
        for name, content in commands.items():
            path = binaries / name
            path.write_text(content)
            path.chmod(0o755)
        env = {**os.environ, 'PATH': f'{binaries}:/usr/bin:/bin',
               'RUNNER_ENVIRONMENT': runner, 'RUNNER_OS': system,
               'SKILLPILOT_CI_CHECKOUT_MODE': checkout_mode,
               'GITHUB_WORKSPACE': str(workspace),
               'CI_DISK_TEST_LOG': str(log), 'CI_DISK_TEST_BYTES': str(available),
               'CI_DISK_TEST_DOCKER_FAIL': str(int(docker_fail))}
        # Exercise the optional toolcache branch independently of the host's
        # installed directories. All other predicates use the ordinary builtin.
        bootstrap = '''function [() {
  if [[ "${1-}" == -d && "${2-}" == /opt/hostedtoolcache && "${3-}" == ']' ]]; then return 0; fi
  builtin [ "$@"
}
'''
        result = subprocess.run(['/bin/bash', '-s'], input=bootstrap + source,
                                text=True, cwd=workspace, env=env,
                                capture_output=True, timeout=10)
        return result, log.read_text() if log.exists() else ''


class CheckoutDiskReserveTest(unittest.TestCase):
    def test_all_full_checkouts_use_the_shared_guard_mappings(self):
        document = workflow()
        guarded = set(JOBS)
        self.assertTrue(FULL_JOBS)
        self.assertEqual(guarded, set(FULL_JOBS) | set(SPARSE_JOBS) | {EDGE_JOB})
        text = WORKFLOW.read_text()
        for anchor in ('reserve_repository_disk', 'verify_repository_disk'):
            self.assertEqual(text.count(f'&{anchor}'), 1)
            self.assertEqual(text.count(f'*{anchor}'), len(JOBS) - 1)
        self.assertNotIn('<<:', text)
        for job in JOBS:
            with self.subTest(job=job):
                steps = document['jobs'][job]['steps']
                before = next(i for i, step in enumerate(steps) if step.get('name') == PRE)
                checkout = next(i for i, step in enumerate(steps) if step.get('uses') == 'actions/checkout@v6')
                after = next(i for i, step in enumerate(steps) if step.get('name') == POST)
                self.assertEqual((before, after), (checkout - 1, checkout + 1))
                self.assertEqual(step_source(job, PRE)['working-directory'], '${{ runner.temp }}')
                self.assertEqual(step_source(job, POST)['working-directory'], '${{ github.workspace }}')
                self.assertEqual(step_source(job, PRE), step_source(JOBS[0], PRE))
                self.assertEqual(step_source(job, POST), step_source(JOBS[0], POST))
                for name in (PRE, POST):
                    subprocess.run(['/bin/bash', '-n'], input=script(job, name), text=True, check=True)
        for job in document['jobs'].keys() - guarded:
            self.assertFalse(any(step.get('name') in {PRE, POST} for step in document['jobs'][job]['steps']))

    def test_only_declared_sparse_jobs_select_their_bounded_policy(self):
        for job, configuration in workflow()['jobs'].items():
            mode = configuration.get('env', {}).get('SKILLPILOT_CI_CHECKOUT_MODE')
            if job in SPARSE_JOBS:
                self.assertEqual(configuration['runs-on'], 'ubuntu-24.04')
                self.assertEqual(mode, 'curriculum-sparse-v1')
                checkout = next(step for step in configuration['steps'] if step.get('uses') == 'actions/checkout@v6')
                self.assertIs(checkout['with']['sparse-checkout-cone-mode'], False)
                self.assertEqual(tuple(line for line in checkout['with']['sparse-checkout'].splitlines()
                                       if line and not line.startswith('#')), curriculum_checkout.SPARSE_PATTERNS)
                self.assertTrue(any(step.get('run') == 'python3 -B scripts/check_ci_curriculum_checkout.py --materialize-required-source-documents' for step in configuration['steps']))
            elif job == EDGE_JOB:
                self.assertEqual(mode, 'openai-edge-sparse-v1')
                checkout = next(step for step in configuration['steps'] if step.get('uses') == 'actions/checkout@v6')
                self.assertIs(checkout['with']['sparse-checkout-cone-mode'], False)
                self.assertEqual(tuple(checkout['with']['sparse-checkout'].splitlines()), edge_checkout.SPARSE_PATTERNS)
                self.assertTrue(any(step.get('run') == 'python3 -B scripts/check_ci_openai_edge_checkout.py' for step in configuration['steps']))
            else:
                self.assertIsNone(mode)
        self.assertIn('npx --no-install tsx scripts/testCiCurriculumCheckoutInputs.ts',
                      str(workflow()['jobs']['goal-book-publication']['steps']))

    def test_bounded_budget_comes_from_selected_bytes_plus_existing_git_and_build_reserves(self):
        required = curriculum_checkout.SOURCE_BUDGET_BYTES + curriculum_checkout.GIT_RESERVE_BYTES + curriculum_checkout.BUILD_RESERVE_BYTES
        self.assertLess(required, 52 * GIB)
        for available, expected in [(required, 0), (required - 1, 1), (52 * GIB, 0)]:
            result, _ = simulate(script(SPARSE_JOBS[0], PRE), available, checkout_mode='curriculum-sparse-v1')
            self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
        result, _ = simulate(script(SPARSE_JOBS[0], PRE), 100 * GIB, checkout_mode='unknown')
        self.assertNotEqual(result.returncode, 0)

    def test_explicit_ci_evidence_closure_has_exact_current_byte_pins(self):
        required = curriculum_checkout.required_ci_evidence_documents()
        self.assertEqual(len(required), 25)
        for path, digest in required.items():
            self.assertTrue(curriculum_checkout.explicitly_included(path), path)
            self.assertTrue(curriculum_checkout.selected(path), path)
            curriculum_checkout.verify_required_document(path, digest)
        self.assertEqual(sum((ROOT / path).stat().st_size for path in required), 31_537_347)

    def test_ci_evidence_binding_rejects_unsafe_duplicate_stale_missing_or_symlink_inputs(self):
        with tempfile.TemporaryDirectory(prefix='ci-evidence-input-') as temporary:
            root = Path(temporary)
            relative = 'curricula/DE/Gymnasium/quality/current/image.png'
            target = root / relative
            target.parent.mkdir(parents=True)
            target.write_bytes(b'current evidence')
            digest = 'sha256:' + hashlib.sha256(target.read_bytes()).hexdigest()
            registry = root / curriculum_checkout.CI_EVIDENCE_REGISTRY
            registry.parent.mkdir(parents=True)
            entry = {'path': relative, 'sha256': digest, 'purpose': 'fixture'}
            def write(entries):
                registry.write_text(json.dumps({'schemaVersion': 1,
                    'semantics': 'curriculum-ci-explicit-quality-binary-inputs-v1', 'inputs': entries}))
            with patch.object(curriculum_checkout, 'ROOT', root):
                write([entry])
                self.assertEqual(curriculum_checkout.required_ci_evidence_documents(), {relative: digest})
                curriculum_checkout.verify_required_document(relative, digest)
                for changes in ({'path': '../outside.png'}, {'path': relative.replace('/current/', '/current/../')},
                                {'path': relative.replace('image', '*')}, {'sha256': 'sha256:stale'}):
                    write([{**entry, **changes}])
                    with self.assertRaisesRegex(ValueError, 'Unsafe CI evidence'):
                        curriculum_checkout.required_ci_evidence_documents()
                write([entry, entry])
                with self.assertRaisesRegex(ValueError, 'Duplicate CI evidence'):
                    curriculum_checkout.required_ci_evidence_documents()
                target.write_bytes(b'changed evidence')
                with self.assertRaisesRegex(ValueError, 'bytes differ'):
                    curriculum_checkout.verify_required_document(relative, digest)
                target.unlink()
                with self.assertRaisesRegex(ValueError, 'regular file'):
                    curriculum_checkout.verify_required_document(relative, digest)
                target.symlink_to(registry)
                with self.assertRaisesRegex(ValueError, 'regular file'):
                    curriculum_checkout.verify_required_document(relative, digest)

    def test_real_git_sparse_matching_preserves_metadata_and_current_binary_inputs(self):
        required_paths = sorted(curriculum_checkout.required_source_documents())
        paths = [*required_paths,
            'curricula/DE/Gymnasium/quality/archive/a.png', 'curricula/DE/Gymnasium/quality/a.pdf',
            'curricula/DE/HE/quality/archive/a.jpg', 'curricula/DE/Gymnasium/quality/a.zip',
            'curricula/DE/Gymnasium/quality/archive/a.jpeg', 'curricula/DE/Gymnasium/quality/a.PNG',
            'curricula/DE/Gymnasium/quality/archive/a.json', 'curricula/DE/Gymnasium/quality/a.review.jsonl',
            'curricula/DE/Gymnasium/quality/a.md', 'curricula/DE/Gymnasium/quality/a.svg',
            'curricula/DE/Gymnasium/input/original.pdf', 'curricula/DE/Gymnasium/visualizations/current.png',
            'app/public/assets/goal-visualizations/current.jpg', 'app/scripts/config/goal-books/current.json',
            'contracts/goal-book/v1/model.schema.json', 'backend/src/main/resources/widget.html',
        ]
        with tempfile.TemporaryDirectory(prefix='ci-sparse-matcher-') as temporary:
            directory = Path(temporary)
            def git(*arguments, **kwargs):
                return subprocess.run(['git', '-c', 'core.trustctime=false', '-c', 'core.hooksPath=/dev/null',
                                       '-c', 'user.name=CI fixture', '-c', 'user.email=ci-fixture@example.invalid',
                                       '-C', temporary, *arguments], check=True, capture_output=True, text=True, **kwargs)
            git('init', '--quiet')
            for path in paths:
                target = directory / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(b'fixture\n')
            git('add', '.')
            git('commit', '--quiet', '-m', 'private sparse-pattern fixture')
            git('sparse-checkout', 'set', '--no-cone', '--stdin', input='\n'.join(curriculum_checkout.SPARSE_PATTERNS) + '\n')
            git('sparse-checkout', 'add', '--stdin', input='\n'.join('/' + path for path in required_paths) + '\n')
            for path in paths:
                self.assertEqual((directory / path).exists(), curriculum_checkout.selected(path), path)

    def test_openai_edge_budget_keeps_existing_git_and_build_reserves(self):
        self.assertEqual(edge_checkout.GIT_RESERVE_BYTES, 15 * GIB)
        self.assertEqual(edge_checkout.BUILD_RESERVE_BYTES, 8 * GIB)
        evidence = edge_checkout.inventory()
        self.assertLess(evidence['retainedBytes'], edge_checkout.SOURCE_BUDGET_BYTES)
        required = evidence['requiredPreCheckoutBytes']
        for available, expected in [(required, 0), (required - 1, 1), (52_192_530_432, 0)]:
            result, _ = simulate(script(EDGE_JOB, PRE), available, checkout_mode='openai-edge-sparse-v1')
            self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
        # A sparse policy must never lower the gate on the remaining full jobs.
        result, _ = simulate(script(JOBS[0], PRE), 52_192_530_432)
        self.assertNotEqual(result.returncode, 0)

    def test_partial_clone_inventory_never_fetches_omitted_historical_blobs(self):
        with tempfile.TemporaryDirectory(prefix='ci-partial-clone-') as temporary:
            root = Path(temporary)
            author = root / 'author'
            author.mkdir()
            def git(directory, *arguments, input=None):
                return subprocess.check_output(['git', '-c', 'core.trustctime=false', '-c', 'core.hooksPath=/dev/null',
                    '-c', 'user.name=CI fixture', '-c', 'user.email=ci-fixture@example.invalid', *arguments],
                    cwd=directory, input=input, stderr=subprocess.PIPE)
            git(author, 'init', '--quiet')
            required = 'curricula/DE/Gymnasium/quality/primary/required.pdf'
            ignored = 'curricula/DE/Gymnasium/quality/archive/ignored.png'
            contents = {'app/code.txt': b'code\n', required: b'%PDF-' + os.urandom(16384),
                        ignored: b'PNG' + os.urandom(32768)}
            for relative, content in contents.items():
                path = author / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(content)
            git(author, 'add', '.')
            git(author, 'commit', '--quiet', '-m', 'private partial-clone fixture')
            origin = root / 'origin.git'
            git(root, 'clone', '--quiet', '--bare', str(author), str(origin))
            git(origin, 'config', 'uploadpack.allowFilter', 'true')
            object_ids = {path: git(author, 'rev-parse', 'HEAD:' + path).decode().strip() for path in contents}
            def clone(name):
                target = root / name
                git(root, 'clone', '--quiet', '--filter=blob:none', '--no-checkout', origin.as_uri(), str(target))
                git(target, 'sparse-checkout', 'set', '--no-cone', '--stdin',
                    input=('\n'.join(curriculum_checkout.SPARSE_PATTERNS) + '\n').encode())
                git(target, 'checkout', '--quiet', 'HEAD')
                return target
            def missing(target):
                return {line[1:] for line in git(target, 'rev-list', '--objects', '--all', '--missing=print')
                        .decode().splitlines() if line.startswith('?')}
            old = clone('old')
            self.assertEqual(missing(old), {object_ids[required], object_ids[ignored]})
            git(old, 'ls-tree', '-rlz', 'HEAD')
            self.assertNotIn(object_ids[ignored], missing(old), 'The old -l query really triggers the unwanted lazy fetch')

            current = clone('current')
            with patch.object(curriculum_checkout, 'ROOT', current), patch.object(curriculum_checkout,
                    'required_source_documents', return_value={required: 'sha256:' + hashlib.sha256(contents[required]).hexdigest()}), \
                    patch.object(curriculum_checkout, 'required_ci_evidence_documents', return_value={
                        required: 'sha256:' + hashlib.sha256(contents[required]).hexdigest()}), \
                    patch.object(curriculum_checkout, 'SPARSE_PATTERNS', curriculum_checkout.BASE_SPARSE_PATTERNS + ('/' + required,)):
                with patch.object(curriculum_checkout, 'SPARSE_PATTERNS', curriculum_checkout.SPARSE_PATTERNS + ('/' + ignored,)):
                    with self.assertRaisesRegex(ValueError, 'closure differs from registry'):
                        curriculum_checkout.inventory(verify_files=False)
                self.assertIn(object_ids[ignored], missing(current), 'Unregistered inclusion fails before fetching its blob')
                result = curriculum_checkout.inventory(verify_files=False)
                expected_bytes = len(contents['app/code.txt']) + len(contents[required])
                self.assertEqual(result['retainedBytes'], expected_bytes)
                self.assertEqual((result['trackedFiles'], result['retainedFiles'], result['omittedFiles']), (3, 2, 1))
                self.assertIsNone(result['omittedBytes'])
                self.assertEqual(missing(current), {object_ids[ignored]})
                self.assertFalse((current / required).exists(), 'Size preflight has not materialized the PDF')
                with patch.dict(os.environ, {'RUNNER_ENVIRONMENT': 'github-hosted', 'RUNNER_OS': 'Linux'}):
                    with patch.object(curriculum_checkout, 'SOURCE_BUDGET_BYTES', expected_bytes - 1):
                        with self.assertRaisesRegex(ValueError, 'exceed reviewed source budget'):
                            curriculum_checkout.materialize_required_documents()
                    self.assertFalse((current / required).exists(), 'Overbudget inputs fail before sparse worktree reload')
                    with patch.object(curriculum_checkout.shutil, 'disk_usage', return_value=SimpleNamespace(free=9 * GIB)):
                        loaded = curriculum_checkout.materialize_required_documents()
                    self.assertEqual(loaded['requiredSourceDocuments'], 1)
                    self.assertEqual((current / required).read_bytes(), contents[required])
                    self.assertFalse((current / ignored).exists())
                    self.assertEqual(missing(current), {object_ids[ignored]})

    def test_actual_edge_checks_consume_only_the_declared_sparse_inputs(self):
        with tempfile.TemporaryDirectory(prefix='ci-openai-edge-inputs-') as temporary:
            root = Path(temporary)
            for path in edge_checkout.REQUIRED_PATHS:
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(ROOT / path, target)
            excluded = ('curricula/archive.png', 'app/public/goal.png', 'unrelated.txt')
            for path in excluded:
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(b'Excluded fixture, never a repository asset.\n')
            def git(*arguments, **kwargs):
                return subprocess.run(['git', '-c', 'core.trustctime=false', '-c', 'core.hooksPath=/dev/null',
                                       '-c', 'user.name=CI fixture', '-c', 'user.email=ci-fixture@example.invalid',
                                       '-C', temporary, *arguments], check=True, capture_output=True, text=True, **kwargs)
            git('init', '--quiet')
            git('add', '.')
            git('commit', '--quiet', '-m', 'private edge input fixture')
            git('sparse-checkout', 'set', '--no-cone', '--stdin', input='\n'.join(edge_checkout.SPARSE_PATTERNS) + '\n')
            self.assertTrue(all((root / path).is_file() for path in edge_checkout.REQUIRED_PATHS))
            self.assertFalse(any((root / path).exists() for path in excluded))
            self.assertEqual(edge_checkout.inventory(root)['retainedFiles'], len(edge_checkout.REQUIRED_PATHS))
            for command in edge_checkout.CHECK_COMMANDS:
                result = subprocess.run(command, cwd=root, text=True, capture_output=True, timeout=180,
                                        env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'})
                self.assertEqual(result.returncode, 0, f'{command}:\n{result.stdout}\n{result.stderr}')
                counts = re.findall(r'Ran ([1-9][0-9]*) tests? in', result.stderr)
                if command[0] == 'python3':
                    self.assertEqual(len(counts), 1, result.stderr)
                if command[-1] == '--static':
                    self.assertEqual(len(counts), 2, result.stderr)
                    self.assertIn('CHECK openai_v1_mtls_static PASS', result.stdout)
                self.assertNotIn('skipped=', result.stderr)
                print(f'Actual edge sparse-input check {command}: executed suite counts {counts or ["shell syntax"]}')
            (root / 'deploy/openai-mtls/openai-root-ca.pem').unlink()
            with self.assertRaises(FileNotFoundError):
                edge_checkout.inventory(root)

    def test_self_hosted_and_non_linux_are_rejected_before_any_cleanup(self):
        for runner, system in [('self-hosted', 'Linux'), ('github-hosted', 'Windows'), ('', 'Linux')]:
            with self.subTest(runner=runner, system=system):
                result, log = simulate(script(JOBS[0], PRE), 100 * GIB, runner, system)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(log, '')

    def test_pre_checkout_requires_the_full_66_gib_after_cleanup(self):
        result, _ = simulate(script(JOBS[0], PRE), 66 * GIB - 1)
        self.assertEqual(result.returncode, 1)
        self.assertIn('Full checkout needs', result.stdout)
        self.assertIn(str(66 * GIB), result.stdout)

    def test_exact_pre_checkout_budget_passes_and_preserves_needed_toolchains(self):
        result, log = simulate(script(JOBS[0], PRE), 66 * GIB)
        self.assertEqual(result.returncode, 0, result.stderr)
        lines = log.splitlines()
        self.assertEqual(len(lines), 4, lines)
        self.assertTrue(lines[0].startswith('rm -rf -- /usr/local/lib/android '))
        self.assertIn('! -name Python ! -name Java* ! -iname node*', lines[1])
        self.assertEqual(lines[2:], ['docker image prune --all --force', 'apt-get clean'])
        self.assertNotIn('rm -rf -- /opt/hostedtoolcache', log)
        self.assertNotIn('GITHUB_WORKSPACE', log)

    def test_toolcache_predicate_preserves_python_java_and_node_variants(self):
        result, log = simulate(script(JOBS[0], PRE), 66 * GIB)
        self.assertEqual(result.returncode, 0, result.stderr)
        args = shlex.split(next(line for line in log.splitlines() if line.startswith('find ')))
        predicate = args[2:args.index('-exec')]
        with tempfile.TemporaryDirectory(prefix='ci-toolcache-predicate-') as directory:
            names = {'Python', 'Java_Temurin-Hotspot_jdk', 'node', 'Node', 'node24', 'Go', 'Ruby'}
            for name in names:
                (Path(directory) / name).mkdir()
            # Only print matches inside this newly created private directory.
            # The workflow's deletion action is deliberately never executed.
            found = subprocess.check_output(['/usr/bin/find', directory, *predicate, '-print'], text=True)
            self.assertEqual({Path(line).name for line in found.splitlines()}, {'Go', 'Ruby'})

    def test_optional_docker_failure_does_not_waive_the_required_budget(self):
        for available, expected in [(66 * GIB, 0), (66 * GIB - 1, 1)]:
            with self.subTest(available=available):
                result, _ = simulate(script(JOBS[0], PRE), available, docker_fail=True)
                self.assertEqual(result.returncode, expected)
                self.assertIn('::warning::Docker image cleanup unavailable', result.stdout)

    def test_post_checkout_budget_is_eight_gib_and_never_cleans(self):
        for available, expected in [(8 * GIB, 0), (8 * GIB - 1, 1)]:
            with self.subTest(available=available):
                result, log = simulate(script(JOBS[0], POST), available)
                self.assertEqual(result.returncode, expected)
                self.assertEqual(log, '')
                if expected:
                    self.assertIn('Dependencies and builds need', result.stdout)


if __name__ == '__main__':
    unittest.main(verbosity=2)
