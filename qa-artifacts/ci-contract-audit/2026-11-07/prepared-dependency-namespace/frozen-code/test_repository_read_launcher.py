#!/usr/bin/env python3
"""Actual Node launcher/runtime controls, outside the protected Capture19 glob."""
import argparse
import hashlib
import json
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
import test_repository_read_trace as fixture_module
from identity_qa_read_trace import FileBinding, ReadContract, RuntimeObservationContract, authenticate_trace, digest
from identity_qa_read_launcher import ReadLaunchEvidence, run_readonly

EVIDENCE = None
RUNS = []
JS = """import {readFileSync,readdirSync} from 'node:fs';
const inputs=readdirSync('data',{withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.name).sort().map(name=>({name,bytes:readFileSync('data/'+name).length}));
try { if(process.argv[2]==='host')readFileSync(process.argv[3]);
if(process.argv[2]==='proc-host')readFileSync('/proc/self/root'+process.argv[3]);
if(process.argv[2]==='alias-host')readFileSync('escape/goal.json');
if(process.argv[2]==='host-directory')readdirSync('/dev/shm'); } catch(error) { }
console.log(JSON.stringify({inputs}));
"""


class LauncherTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixture_module.ReadTraceTests.setUpClass()
        cls.fixture = fixture_module.ReadTraceTests('test_host_reads_are_not_ignored')
        cls.node = Path(shutil.which('node')).resolve()
        cls.host = tempfile.TemporaryDirectory(prefix='read-launcher-host-', dir=Path(__file__).resolve().parents[1] / 'tmp')
        cls.host_file = Path(cls.host.name) / 'goal.json'
        cls.host_file.write_text('benign real host-escape counterexample\n')
        cls.external = {'/etc/ld.so.cache', '/etc/ssl/openssl.cnf', '/dev/null', str(cls.node)}
        for token in subprocess.check_output(['ldd', str(cls.node)], text=True).split():
            if token.startswith('/') and Path(token).is_file():
                cls.external.add(token)
        previous = Path(__file__).resolve().parents[1] / 'qa-artifacts/ci-contract-audit/2026-11-07/source-a-read-auth-first-boundary/node-current/original.strace'
        cls.measured_trace_sha = digest(previous)

    @classmethod
    def tearDownClass(cls):
        cls.host.cleanup()
        fixture_module.ReadTraceTests.tearDownClass()

    def context(self, role):
        root, old = self.fixture.pair()[role]
        script = root / 'tool/discovery.mjs'
        script.write_text(JS)
        files = dict(old.files)
        files['tool/discovery.mjs'] = FileBinding('tool', digest(script), 'exact actual Node discovery fixture code')
        dirs = dict(old.directories)
        dirs.update({'.': [], 'tool': []})
        external = {path: FileBinding('tool' if path in {str(self.node), '/etc/ssl/openssl.cnf', '/etc/ld.so.cache', '/dev/null'} else 'dependency',
                                     digest(path), 'explicit Node runtime/tool bytes bound before launch') for path in self.external}
        ancestors = {str(path): {'statx'} for path in root.parents if path != Path('/')}
        contract = ReadContract(root, role, files, dirs, aliases=dict(old.aliases), external_files=external,
                                external_directory_metadata=ancestors,
                                expected_tool_failures={('access', '/etc/ld.so.preload', 'ENOENT')}, required_discovery={'data'})
        rules = {
            '/proc/self/cgroup': {'operations': ['openat', 'read', 'close'], 'resultClass': 'volatile-kernel-observation'},
            '/proc/self/maps': {'operations': ['openat', 'newfstatat', 'read', 'close'], 'resultClass': 'volatile-kernel-observation'},
            '/proc/self/exe': {'operations': ['readlink'], 'resultClass': 'volatile-kernel-observation'},
            '/proc/meminfo': {'operations': ['openat', 'read', 'close'], 'resultClass': 'volatile-kernel-observation'},
            '/sys/fs/cgroup/non-systemd/memory.max': {'operations': ['openat'], 'resultClass': 'ENOENT-probe'},
            '/sys/fs/cgroup/non-systemd/memory.high': {'operations': ['openat'], 'resultClass': 'ENOENT-probe'},
        }
        runtime = RuntimeObservationContract(digest(self.node), platform.release(), self.measured_trace_sha, rules, absent_fd_probes=range(3, 17))
        return root, script, contract, runtime

    def launch(self, role, mode='normal'):
        root, script, contract, runtime = self.context(role)
        logs = Path(tempfile.mkdtemp(prefix='launcher-evidence-', dir=self.fixture.base))
        logs.rmdir()
        if mode == 'alias-host':
            (root / 'escape').unlink()
            (root / 'escape').symlink_to(self.host_file.parent, target_is_directory=True)
        evidence = run_readonly(role, root, root, [str(self.node), str(script), mode, str(self.host_file)], logs)
        self.assertEqual(evidence.returncode, 0, evidence.stderr.decode())
        runtime = RuntimeObservationContract(runtime.producer_sha256, runtime.kernel_release, evidence.trace_sha256,
                                             dict(runtime.paths), absent_fd_probes=runtime.absent_fd_probes)
        self.assertEqual([row['name'] for row in json.loads(evidence.stdout)['inputs']], [name for name, _ in self.fixture.git_data_selector])
        record = {'case': self.id().split('.')[-1] + '.' + role + '.' + mode, 'launch': evidence.receipt(), 'nativeProducerExitCode': 0}
        RUNS.append(record)
        if EVIDENCE:
            (EVIDENCE / (record['case'] + '.strace')).write_text(evidence.trace)
            (EVIDENCE / (record['case'] + '.recorder.strace')).write_text(evidence.recorder_trace)
        return root, contract, runtime, evidence, record

    def test_actual_two_role_node_discovery_with_bound_stdio_and_exact_runtime(self):
        for role in ('original', 'candidate'):
            with self.subTest(role=role):
                root, contract, runtime, evidence, record = self.launch(role)
                facts = authenticate_trace(evidence.trace, root, contract, launch=evidence, runtime=runtime)
                self.assertIn('data/goal.json', facts['actualSourceReadOrMapPaths'])
                self.assertTrue(facts['volatileRuntimeObservations'])
                self.assertTrue(facts['ownedLauncherTransportMetadata'])
                self.assertTrue(all(not row.get('immutableCurriculumInput', False) for row in facts['volatileRuntimeObservations']))
                record['boundedAuthenticationFacts'] = facts

    def test_actual_host_proc_alias_and_directory_reads_still_reject(self):
        for role in ('original', 'candidate'):
            for mode, pattern in [('host', 'Unclassified host input'), ('proc-host', 'Unclassified process/FD alias'),
                                  ('alias-host', 'Undeclared/changed input alias'), ('host-directory', 'Unclassified host input')]:
                with self.subTest(role=role, mode=mode):
                    root, contract, runtime, evidence, record = self.launch(role, mode)
                    with self.assertRaisesRegex(ValueError, pattern):
                        authenticate_trace(evidence.trace, root, contract, launch=evidence, runtime=runtime)
                    record['authenticationRejectedAsExpected'] = True

    def test_actual_role_trace_and_forged_launch_provenance_reject(self):
        root, contract, runtime, evidence, record = self.launch('original')
        wrong = ReadContract(root, 'candidate', dict(contract.files), dict(contract.directories))
        with self.assertRaisesRegex(ValueError, 'role/root/cwd differs'):
            authenticate_trace(evidence.trace, root, wrong, launch=evidence, runtime=runtime)
        with self.assertRaisesRegex(ValueError, 'factory-minted'):
            authenticate_trace(evidence.trace, root, contract, launch={'verified': True}, runtime=runtime)
        with self.assertRaisesRegex(ValueError, 'trace bytes differ'):
            authenticate_trace(evidence.trace + '\n', root, contract, launch=evidence, runtime=runtime)
        with self.assertRaisesRegex(ValueError, 'actual launcher'):
            authenticate_trace(evidence.trace, root, contract, runtime=runtime)
        for field in ('producer', 'kernel'):
            bad = RuntimeObservationContract('0' * 64 if field == 'producer' else runtime.producer_sha256,
                                             'unbound-kernel' if field == 'kernel' else runtime.kernel_release,
                                             runtime.measured_trace_sha256, dict(runtime.paths), absent_fd_probes=runtime.absent_fd_probes)
            with self.assertRaisesRegex(ValueError, 'tool/kernel context differs'):
                authenticate_trace(evidence.trace, root, contract, launch=evidence, runtime=bad)
        bad = RuntimeObservationContract(runtime.producer_sha256, runtime.kernel_release, '0' * 64,
                                         dict(runtime.paths), absent_fd_probes=runtime.absent_fd_probes)
        with self.assertRaisesRegex(ValueError, 'actual measured trace'):
            authenticate_trace(evidence.trace, root, contract, launch=evidence, runtime=bad)
        missing_path = dict(runtime.paths)
        del missing_path['/proc/self/maps']
        bad = RuntimeObservationContract(runtime.producer_sha256, runtime.kernel_release, runtime.measured_trace_sha256,
                                         missing_path, absent_fd_probes=runtime.absent_fd_probes)
        with self.assertRaisesRegex(ValueError, 'Unclassified process/FD alias'):
            authenticate_trace(evidence.trace, root, contract, launch=evidence, runtime=bad)
        missing_operation = {path: dict(rule) for path, rule in runtime.paths.items()}
        missing_operation['/proc/self/maps']['operations'] = ['openat', 'read', 'close']
        bad = RuntimeObservationContract(runtime.producer_sha256, runtime.kernel_release, runtime.measured_trace_sha256,
                                         missing_operation, absent_fd_probes=runtime.absent_fd_probes)
        with self.assertRaisesRegex(ValueError, 'Unmeasured runtime operation'):
            authenticate_trace(evidence.trace, root, contract, launch=evidence, runtime=bad)
        record['separateProvenanceMutationsRejected'] = ['wrong-role', 'forged-verified-JSON', 'changed-actual-trace', 'runtime-without-launcher',
                                                        'wrong-producer-SHA', 'wrong-kernel-context', 'wrong-runtime-trace-SHA',
                                                        'missing-measured-runtime-path', 'missing-measured-runtime-operation']

    def test_runtime_profile_has_no_prefix_or_other_pid_escape(self):
        for path in ('/proc/', '/proc/self/root', '/proc/1/maps', '/home/'):
            with self.assertRaisesRegex(ValueError, 'Unmeasured runtime path/prefix'):
                RuntimeObservationContract(digest(self.node), platform.release(), self.measured_trace_sha,
                                           {path: {'operations': ['openat'], 'resultClass': 'volatile-kernel-observation'}})
        with self.assertRaisesRegex(ValueError, 'actual launcher run'):
            ReadLaunchEvidence(object())


if __name__ == '__main__':
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('--evidence-dir', type=Path)
    known, rest = parser.parse_known_args()
    EVIDENCE = known.evidence_dir
    if EVIDENCE:
        EVIDENCE.mkdir(parents=True, exist_ok=False)
        (EVIDENCE / 'discovery.mjs').write_text(JS)
    program = unittest.main(argv=[sys.argv[0], *rest], exit=False)
    if EVIDENCE:
        (EVIDENCE / 'native-runs.json').write_text(json.dumps({'purpose': 'actual-Node-launcher-runtime-fixtures-not-SourceA-QA-pass',
            'testsRun': program.result.testsRun, 'failures': len(program.result.failures), 'errors': len(program.result.errors), 'skips': len(program.result.skipped),
            'actualNativeRuns': RUNS, 'capture19Changed': False}, ensure_ascii=False, indent=2) + '\n')
    raise SystemExit(0 if program.result.wasSuccessful() else 1)
