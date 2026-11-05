#!/usr/bin/env python3
"""Exercise conformance planning and output refusal without building a package."""

# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import uuid

ROOT = Path(__file__).resolve().parents[1]
WRAPPER = ROOT / 'scripts/run_learning_units_package_conformance.sh'
RUNS = ROOT / 'tmp/curriculum-release-model/conformance-runs'
V2 = 'contracts/curriculum-package/v1.2/profiles/de-gymnasium-mathematik-learning-unit-offers-release-model-v2.profile.json'


class ConformancePlanTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='conformance-plan-test-')
        self.addCleanup(self.directory.cleanup)
        self.private = Path(self.directory.name)
        self.bin = self.private / 'bin'
        self.bin.mkdir()
        self.log = self.private / 'heavy.log'
        for command in ('bash', 'npm', 'npx', 'node', 'java', 'gradle', 'git', 'curl', 'zip', 'unzip'):
            path = self.bin / command
            path.write_text('#!/bin/sh\nprintf "%s\\n" "$0 $*" >> "$PLAN_TEST_HEAVY_LOG"\nexit 91\n')
            path.chmod(0o755)
        python = self.bin / 'python3'
        python.write_text('#!/bin/sh\nif [ "$1" = -B ] && { [ "$2" = - ] || [ "$2" = -c ]; }; then\n'
                          f'  exec "{sys.executable}" "$@"\nfi\n'
                          'printf "%s\\n" "python3 $*" >> "$PLAN_TEST_HEAVY_LOG"\nexit 91\n')
        python.chmod(0o755)
        self.env = {**os.environ, 'PATH': str(self.bin) + ':' + os.environ['PATH'],
                    'PLAN_TEST_HEAVY_LOG': str(self.log), 'SKILLPILOT_FULL_PACKAGE_CONFORMANCE': 'false'}

    def call(self, *args, full=False, plan=True):
        env = {**self.env, 'SKILLPILOT_FULL_PACKAGE_CONFORMANCE': str(full).lower()}
        return subprocess.run(['/bin/bash', str(WRAPPER), *args, *(['--plan'] if plan else [])],
                              cwd=ROOT, env=env, text=True, capture_output=True, timeout=30)

    def planned(self, *args, full=False):
        result = self.call(*args, full=full)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(self.log.exists(), 'Plan invoked a heavy tool')
        plan = json.loads(result.stdout)
        self.assertFalse(Path(plan['workDir']).exists())
        self.assertEqual(plan['executedQualificationGates'], [])
        return plan

    def fresh(self):
        RUNS.mkdir(parents=True, exist_ok=True)
        path = RUNS / ('plan-test-' + uuid.uuid4().hex)
        self.addCleanup(lambda: shutil.rmtree(path) if path.is_dir() and not path.is_symlink() else None)
        return path

    def test_legacy_profile_default_stays_nine_and_paths_are_fresh(self):
        first, second = self.planned(), self.planned()
        self.assertEqual(first['profileId'], 'de-gymnasium-mathematik-learning-unit-offers-release-model-v1')
        self.assertEqual(first['expectedContractCount'], 9)
        self.assertNotEqual(first['workDir'], second['workDir'])

    def test_v2_model_and_full_plan_keep_kind_and_mode_explicit(self):
        for full in (False, True):
            plan = self.planned('--producer-profile', V2, '--work-dir', str(self.fresh()), full=full)
            self.assertEqual(plan['expectedContractCount'], 21)
            self.assertEqual(plan['packageVersion'], '0.1.0-learning-unit-offers.2')
            self.assertEqual(plan['fullMode'], full)
            self.assertTrue(plan['offerProfile'])
            self.assertTrue(plan['packageProfile'].endswith('full-standalone-learning-unit-offers-v1.profile.json'))
            self.assertEqual([plan['expectedCounts'][key] for key in ('goals', 'programUnits', 'goalPlacements', 'views')], [1255, 35, 351, 98])

    def test_existing_empty_and_nonempty_targets_are_never_reused(self):
        for sentinel in (False, True):
            target = self.fresh()
            target.mkdir()
            if sentinel:
                (target / 'sentinel').write_bytes(b'must survive')
            result = self.call('--work-dir', str(target), plan=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('already exists', result.stderr)
            self.assertFalse(self.log.exists())
            if sentinel:
                self.assertEqual((target / 'sentinel').read_bytes(), b'must survive')

    def test_accepted_stores_descendants_and_traversal_are_rejected(self):
        old_lock = ROOT / 'tmp/curriculum-release-model/learning-unit-offers/provisioned-store/locks/active.json'
        before = hashlib.sha256(old_lock.read_bytes()).hexdigest() if old_lock.exists() else None
        for path in ('tmp/curriculum-release-model/learning-unit-offers',
                     'tmp/curriculum-release-model/learning-unit-offers/provisioned-store/new-child',
                     'tmp/math-learning-units/frozen-s2-runtime12',
                     'tmp/curriculum-release-model/learning-unit-offers-v3/provisioned-store',
                     'tmp/curriculum-release-model/conformance-runs/../escape'):
            with self.subTest(path=path):
                result = self.call('--work-dir', path, plan=False)
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(self.log.exists())
        if before:
            self.assertEqual(hashlib.sha256(old_lock.read_bytes()).hexdigest(), before)

    def test_symlink_leaf_cannot_reach_accepted_or_private_target(self):
        link = self.fresh()
        victim = self.private / 'victim'
        victim.mkdir()
        (victim / 'sentinel').write_bytes(b'safe')
        link.symlink_to(victim, target_is_directory=True)
        self.addCleanup(link.unlink)
        result = self.call('--work-dir', str(link), plan=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Symlink', result.stderr)
        self.assertEqual((victim / 'sentinel').read_bytes(), b'safe')
        self.assertFalse(self.log.exists())

    def test_reservation_is_exclusive_and_heavy_work_is_only_spied(self):
        target = self.fresh()
        self.planned('--producer-profile', V2, '--work-dir', str(target))
        result = self.call('--producer-profile', V2, '--work-dir', str(target), plan=False)
        self.assertEqual(result.returncode, 91, result.stderr)
        self.assertTrue((target / 'conformance-plan.json').is_file())
        self.assertIn('provision_pinned_fwu_ontology.sh', self.log.read_text())
        self.log.unlink()
        repeat = self.call('--producer-profile', V2, '--work-dir', str(target), plan=False)
        self.assertNotEqual(repeat.returncode, 0)
        self.assertFalse(self.log.exists())

    def test_unknown_profile_and_arguments_fail_without_heavy_work(self):
        for args in (('--producer-profile', 'does-not-exist.json'), ('--work-dir',), ('--unknown',)):
            with self.subTest(args=args):
                self.assertNotEqual(self.call(*args).returncode, 0)
                self.assertFalse(self.log.exists())

    def test_model_and_full_dispatch_forward_profile_and_fresh_paths(self):
        # Tiny model files and inert command records exercise shell routing.
        # No real compiler, ontology provisioner, Node build or ZIP executes.
        (self.bin / 'bash').write_text('#!/bin/sh\nexit 0\n')
        calls = self.private / 'dispatch.jsonl'
        self.env['PLAN_TEST_DISPATCH_LOG'] = str(calls)
        (self.bin / 'python3').write_text(f'#!{sys.executable}\n' + '''import json,os,pathlib,sys
args=sys.argv[1:]
if args[:2] in (['-B','-'], ['-B','-c']):
    os.execv(sys.executable,[sys.executable,*args])
with open(os.environ['PLAN_TEST_DISPATCH_LOG'],'a') as stream:
    stream.write(json.dumps(args)+'\\n')
if 'scripts/compile_curriculum_release_model.py' in args:
    output=pathlib.Path(args[args.index('--output')+1])
    output.mkdir()
    (output/'fixture.txt').write_text('identical small dispatch fixture')
''')
        for full in (False, True):
            target = self.fresh()
            if calls.exists():
                calls.unlink()
            if self.log.exists():
                self.log.unlink()
            result = self.call('--producer-profile', V2, '--work-dir', str(target), full=full, plan=False)
            self.assertEqual(result.returncode, 91 if full else 0, result.stderr)
            observed = [json.loads(line) for line in calls.read_text().splitlines()]
            compiles = [args for args in observed if 'scripts/compile_curriculum_release_model.py' in args]
            ledgers = [args for args in observed if 'scripts/generate_curriculum_package_redistribution_review.py' in args]
            self.assertEqual(len(compiles), 2)
            self.assertEqual(len(ledgers), 2)
            for args in compiles:
                self.assertEqual(args[args.index('--profile') + 1], str(ROOT / V2))
                self.assertEqual(Path(args[args.index('--output') + 1]).parent, target)
            for args in ledgers:
                self.assertEqual(args[args.index('--producer-profile') + 1], str(ROOT / V2))
            self.assertEqual(json.loads((target / 'conformance-plan.json').read_bytes())['fullMode'], full)
            self.assertEqual(self.log.exists(), full)
            if full:
                self.assertIn('export:full-standalone-package', self.log.read_text())

    def test_actual_main_ci_chooses_explicit_v2_model_route(self):
        text = (ROOT / '.github/workflows/ci.yml').read_text()
        self.assertIn('bash scripts/run_learning_units_package_conformance.sh', text)
        self.assertIn('--producer-profile ' + V2, text)
        self.assertIn('current-v3-model-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}', text)
        self.assertIn('SKILLPILOT_FULL_PACKAGE_CONFORMANCE=false', text)
        self.assertNotIn('remove_private_tree', WRAPPER.read_text())


if __name__ == '__main__':
    unittest.main()
