#!/usr/bin/env python3
"""Exercise embedded CI disk guards with inert commands; never clean the host."""
from functools import lru_cache
import os
import shlex
from pathlib import Path
import subprocess
import tempfile
import unittest

import yaml
import check_ci_curriculum_checkout as curriculum_checkout

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
        self.assertEqual(guarded, set(FULL_JOBS) | set(SPARSE_JOBS))
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

    def test_only_pinned_curriculum_jobs_select_the_bounded_policy(self):
        for job, configuration in workflow()['jobs'].items():
            mode = configuration.get('env', {}).get('SKILLPILOT_CI_CHECKOUT_MODE')
            if job in SPARSE_JOBS:
                self.assertEqual(configuration['runs-on'], 'ubuntu-24.04')
                self.assertEqual(mode, 'curriculum-sparse-v1')
                checkout = next(step for step in configuration['steps'] if step.get('uses') == 'actions/checkout@v6')
                self.assertIs(checkout['with']['sparse-checkout-cone-mode'], False)
                self.assertEqual(tuple(checkout['with']['sparse-checkout'].splitlines()), curriculum_checkout.SPARSE_PATTERNS)
                self.assertTrue(any(step.get('run') == 'python3 -B scripts/check_ci_curriculum_checkout.py --materialize-required-source-documents' for step in configuration['steps']))
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
