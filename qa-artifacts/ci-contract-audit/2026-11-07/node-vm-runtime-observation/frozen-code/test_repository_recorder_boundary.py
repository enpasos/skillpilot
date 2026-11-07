#!/usr/bin/env python3
"""Ordinary file/FD visibility checks; no trace editing or escape programs."""
import argparse
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
import test_repository_read_trace as fixture_module
from identity_qa_read_launcher import run_readonly
from identity_qa_read_trace import digest

EVIDENCE = None
RESULTS = []
JS = r'''import fs from 'node:fs';
const evidence = process.argv[2];
let writable = false, accessError;
try { fs.accessSync(evidence, fs.constants.W_OK); writable = true; }
catch(error) { accessError = error.code; }
const fdTargets = fs.readdirSync('/proc/self/fd').map(fd => {
  try { return {fd, target:fs.readlinkSync('/proc/self/fd/'+fd)}; }
  catch(error) { return {fd, closedDuringObservation:error.code}; }
});
console.log(JSON.stringify({
  evidenceEntries:fs.readdirSync(evidence),
  recorderFileExists:fs.existsSync(evidence+'/recorder.strace'),
  evidenceWritable:writable, accessError,
  namespacePids:fs.readdirSync('/proc').filter(name=>/^\d+$/.test(name)),
  pid:process.pid, ppid:process.ppid, fdTargets
}));
'''


class RecorderBoundaryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixture_module.ReadTraceTests.setUpClass()
        cls.fixture = fixture_module.ReadTraceTests('test_host_reads_are_not_ignored')
        cls.node = Path(shutil.which('node')).resolve(strict=True)

    @classmethod
    def tearDownClass(cls):
        fixture_module.ReadTraceTests.tearDownClass()

    def test_actual_recorder_files_and_descriptors_are_not_in_producer_view(self):
        for role, (root, _) in self.fixture.pair().items():
            with self.subTest(role=role):
                script = root / 'tool/recorder-visibility.mjs'
                script.write_text(JS)
                directory = Path(tempfile.mkdtemp(prefix='recorder-owned-', dir=self.fixture.base))
                directory.rmdir()
                launch = run_readonly(role, root, root, [str(self.node), str(script), str(directory)], directory)
                view = json.loads(launch.stdout)
                self.assertEqual(launch.returncode, 0)
                self.assertEqual(view['evidenceEntries'], [])
                self.assertFalse(view['recorderFileExists'])
                self.assertFalse(view['evidenceWritable'])
                self.assertEqual(view['accessError'], 'EROFS')
                self.assertNotIn(str(os.getpid()), view['namespacePids'])
                self.assertEqual(view['pid'], 2)
                self.assertEqual(view['ppid'], 1)
                targets = [entry.get('target', '') for entry in view['fdTargets']]
                self.assertTrue(targets)
                self.assertFalse(any(str(directory) in target or 'recorder.strace' in target for target in targets))
                self.assertTrue((directory / 'recorder.strace').is_file())
                self.assertEqual((directory / 'recorder.strace').stat().st_mode & 0o777, 0o600)
                self.assertEqual(directory.stat().st_mode & 0o777, 0o700)
                self.assertNotIn('--bind', launch.command)
                self.assertIn('--unshare-pid', launch.command)
                self.assertEqual(launch.command[0], '/usr/bin/strace')
                self.assertEqual(dict(launch.namespace_process_ids)[launch.producer_boundary['hostPid']], 2)
                record = {'role':role, 'ordinaryVisibilityAndPermissionChecks':'pass', 'producerView':view,
                          'launch':launch.receipt(), 'sourceReadAuthenticationClaimed':False}
                RESULTS.append(record)
                if EVIDENCE:
                    (EVIDENCE / (role + '.recorder.strace')).write_text(launch.recorder_trace)
                    (EVIDENCE / (role + '.producer.strace')).write_text(launch.trace)
                    (EVIDENCE / (role + '.stdout.json')).write_bytes(launch.stdout)
                    (EVIDENCE / (role + '.stderr.txt')).write_bytes(launch.stderr)
                    (EVIDENCE / (role + '.launch.json')).write_text(json.dumps(launch.receipt(), indent=2) + '\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('--evidence-dir', type=Path)
    known, rest = parser.parse_known_args()
    EVIDENCE = known.evidence_dir
    if EVIDENCE:
        EVIDENCE.mkdir(parents=True, exist_ok=False)
        (EVIDENCE / 'recorder-visibility.mjs').write_text(JS)
    program = unittest.main(argv=[sys.argv[0], *rest], exit=False)
    if EVIDENCE:
        (EVIDENCE / 'results.json').write_text(json.dumps({'purpose':'ordinary-recorder-namespace-visibility-not-QA-acceptance',
            'testsRun':program.result.testsRun, 'failures':len(program.result.failures), 'errors':len(program.result.errors),
            'skips':len(program.result.skipped), 'actualNativeRuns':RESULTS,
            'moduleSha256':digest(Path(__file__).with_name('identity_qa_read_launcher.py'))}, indent=2) + '\n')
    raise SystemExit(0 if program.result.wasSuccessful() else 1)
