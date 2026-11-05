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

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / '.github/workflows/ci.yml'
PRE = 'Reserve disk space for the complete repository'
POST = 'Verify disk reserve after the complete checkout'
GIB = 1024 ** 3


@lru_cache(maxsize=1)
def workflow():
    return yaml.safe_load(WORKFLOW.read_text())


def full_checkout_jobs(document):
    return tuple(name for name, job in document['jobs'].items()
                 if any(step.get('uses', '').startswith('actions/checkout@')
                        and not step.get('with', {}).get('sparse-checkout')
                        for step in job['steps']))


JOBS = full_checkout_jobs(workflow())


def step_source(job, name):
    steps = [step for step in workflow()['jobs'][job]['steps'] if step.get('name') == name]
    if len(steps) != 1:
        raise AssertionError(f'Expected exactly one {name} in {job}')
    return steps[0]


def script(job, name):
    return step_source(job, name)['run']


def simulate(source, available, runner='github-hosted', system='Linux', docker_fail=False):
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
        full = set(full_checkout_jobs(document))
        self.assertTrue(full)
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
        for job in document['jobs'].keys() - full:
            self.assertFalse(any(step.get('name') in {PRE, POST} for step in document['jobs'][job]['steps']))

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
