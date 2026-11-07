#!/usr/bin/env python3
"""Small real-Git/RO-bwrap/strace controls outside the Capture19 CI glob."""
import argparse
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
from identity_qa_read_trace import FileBinding, ReadContract, TRACE_OPTIONS, authenticate_trace, digest

EVIDENCE = None
RUNS = []
C_SOURCE = r'''
#include <unistd.h>
#include <fcntl.h>
#include <dirent.h>
#include <sys/wait.h>
#include <stdio.h>
#include <string.h>
static void consume(int fd){char b[4096];if(fd>=0){read(fd,b,sizeof b);close(fd);}}
static void file(const char *name){consume(open(name,O_RDONLY));}
int main(int argc,char **argv){
 if(argc>1&&!strcmp(argv[1],"emit-output")){write(1,"real native output\n",19);return 0;}
 char cwd[4096];getcwd(cwd,sizeof cwd);const char *mode=argv[1];
 if(!strcmp(mode,"host")){file(argv[2]);return 0;}
 if(!strcmp(mode,"escape")){file("escape/goal.json");return 0;}
 if(!strcmp(mode,"proc-alias")){int f=open("data/goal.json",O_RDONLY);char p[100];snprintf(p,sizeof p,"/proc/self/fd/%d",f);file(p);close(f);return 0;}
 if(!strcmp(mode,"write")){int f=open("data/goal.json",O_WRONLY|O_TRUNC);if(f>=0){close(f);return 9;}return 0;}
 if(!strcmp(mode,"fd-unbound")){int d=open("unselected",O_RDONLY|O_DIRECTORY);consume(openat(d,"goal.json",O_RDONLY));close(d);return 0;}
 int d=open("data",O_RDONLY|O_DIRECTORY);int q=fcntl(d,F_DUPFD_CLOEXEC,20);
 consume(openat(q,"goal.json",O_RDONLY));
 pid_t child=fork();
 if(!child){
  if(!strcmp(mode,"child-missing")){file("data/missing.config.json");_exit(0);}
  chdir(!strcmp(mode,"cwd-unbound")?"unselected":"other");
  file("goal.json");consume(openat(q,"goal.json",O_RDONLY));_exit(0);
 }
 waitpid(child,0,0);
 DIR *stream=fdopendir(d);if(!strcmp(mode,"partial-directory")){readdir(stream);}else if(strcmp(mode,"no-directory")){while(readdir(stream));}closedir(stream);
 file("alias/goal.json");file("data/space name.json");file("data/\303\244.json");
 file("tool/input.txt");file("dependency/input.txt");file("reports/generated.txt");close(q);
 return 0;
}
'''


def bind(category, raw, provenance):
    return FileBinding(category, hashlib.sha256(raw).hexdigest(), provenance)


class ReadTraceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        for tool in ('cc', 'git', 'bwrap', 'strace'):
            if not shutil.which(tool):
                raise RuntimeError('Required real native fixture tool is unavailable: ' + tool)
        cls.temp = tempfile.TemporaryDirectory(prefix='skillpilot-read-auth-native-', dir='/dev/shm')
        cls.base = Path(cls.temp.name)
        cls.binary = cls.base / 'producer'
        (cls.base / 'producer.c').write_text(C_SOURCE)
        subprocess.run(['cc', '-O0', '-o', str(cls.binary), str(cls.base / 'producer.c')], check=True)
        cls.output = subprocess.run([str(cls.binary), 'emit-output'], capture_output=True, check=True).stdout
        # These are explicit current native fixture tool/dependency locators,
        # pinned before the producer; they are not discovered from its trace.
        runtime_paths = ['/etc/ld.so.cache', '/lib/x86_64-linux-gnu/libc.so.6',
                         '/lib64/ld-linux-x86-64.so.2', str(cls.binary)]
        cls.external = {path: FileBinding('tool' if path in ('/etc/ld.so.cache', str(cls.binary)) else 'dependency',
                                        digest(path), 'explicit fixture runtime bytes captured before execution') for path in runtime_paths}
        kernel_path = Path(__file__).with_name('canonical_goal_identity_migration.py')
        spec = importlib.util.spec_from_file_location('fixture_identity_kernel', kernel_path)
        cls.kernel = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.kernel)
        cls.repo = cls.base / 'git-source'
        subprocess.run(['git', 'init', '-q', str(cls.repo)], check=True)
        cls.original = {'landscapeId': 'fixture-owner', 'goals': [{'id': 'legacy', 'requires': [], 'contains': []}]}
        cls.candidate = copy.deepcopy(cls.original)
        cls.fields = [{'pointer': '/goals/0/id', 'kind': 'value', 'before': 'legacy', 'after': '00000000-0000-4000-8000-000000000001'}]
        cls.kernel.set_field(cls.candidate, cls.fields[0])
        cls.kernel.inverse_proof(cls.original, cls.candidate, cls.fields)
        initial_files = {'data/goal.json': cls.kernel.stable(cls.original), 'data/space name.json': b'space\n',
                         'data/ä.json': b'utf8\n', 'data/required.config.json': b'{"scope":"pinned selector"}\n',
                         'other/goal.json': b'child-context\n', 'tool/input.txt': b'fixture-tool\n',
                         'dependency/input.txt': b'fixture-dependency\n'}
        for path, raw in initial_files.items():
            (cls.repo / path).parent.mkdir(parents=True, exist_ok=True)
            (cls.repo / path).write_bytes(raw)
        (cls.repo / 'alias').symlink_to('data', target_is_directory=True)
        subprocess.run(['git', '-C', str(cls.repo), 'add', '.'], check=True)
        subprocess.run(['git', '-C', str(cls.repo), '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'Original fixture'], check=True)
        cls.commit = subprocess.check_output(['git', '-C', str(cls.repo), 'rev-parse', 'HEAD'], text=True).strip()
        cls.git_files = {path: subprocess.check_output(['git', '-C', str(cls.repo), 'show', cls.commit + ':' + path]) for path in initial_files}
        cls.git_original_bytes = cls.git_files['data/goal.json']
        directory_tree = subprocess.check_output(['git', '-C', str(cls.repo), 'ls-tree', '-z', cls.commit + ':data'])
        cls.git_data_selector = sorted((entry.split(b'\t')[1].decode(), 'file') for entry in directory_tree.split(b'\0') if entry)
        cls.git_alias = subprocess.check_output(['git', '-C', str(cls.repo), 'show', cls.commit + ':alias']).decode()
        cls.projected_bytes = cls.kernel.stable(cls.candidate)
        cls.outside = cls.base / 'outside'
        cls.outside.mkdir()
        (cls.outside / 'goal.json').write_text('unclassified host input\n')
        if EVIDENCE:
            subprocess.run(['git', '-C', str(cls.repo), 'bundle', 'create', str(EVIDENCE.resolve() / 'fixture.git.bundle'), 'HEAD'], check=True)
            shutil.copyfile(cls.binary, EVIDENCE / 'producer.bin')
            (EVIDENCE / 'fixture-bindings.json').write_text(json.dumps({
                'originalGitCommit': cls.commit, 'gitBundle': 'fixture.git.bundle', 'gitBundleSha256': digest(EVIDENCE / 'fixture.git.bundle'),
                'originalGitFiles': {path: {'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)} for path, raw in cls.git_files.items()},
                'candidateTypedFields': cls.fields, 'candidateGoalSha256': hashlib.sha256(cls.projected_bytes).hexdigest(),
                'existingKernel': str(kernel_path), 'existingKernelSha256': digest(kernel_path),
                'directorySelectorFromActualGitLsTree': cls.git_data_selector, 'aliasTextFromActualGitBlob': cls.git_alias,
                'nativeOutputProducer': {'argv': [str(cls.binary), 'emit-output'], 'exitCode': 0, 'stdoutSha256': hashlib.sha256(cls.output).hexdigest()},
                'explicitFixtureRuntimeBindings': {path: {'sha256': row.sha256, 'category': row.category, 'provenance': row.provenance} for path, row in cls.external.items()},
                'fullProductionSourceAValidationClaimed': False,
            }, ensure_ascii=False, indent=2) + '\n')

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def pair(self):
        container = Path(tempfile.mkdtemp(prefix='case-', dir=self.base))
        roots = {}
        for role, raw in [('original', self.git_original_bytes), ('candidate', self.projected_bytes)]:
            root = container / role
            for name in ['data', 'other', 'tool', 'dependency', 'reports', 'unselected']:
                (root / name).mkdir(parents=True)
            files = {**self.git_files, 'data/goal.json': raw, 'reports/generated.txt': self.output}
            for path, value in files.items():
                (root / path).write_bytes(value)
            (root / 'unselected/goal.json').write_bytes(b'exists but not a selected input\n')
            (root / 'alias').symlink_to('data', target_is_directory=True)
            (root / 'escape').symlink_to(self.outside, target_is_directory=True)
            bindings = {name: bind('source', value,
                         'exact Git blob ' + self.commit if role == 'original' else 'fixture-only existing-kernel typed projection with inverse equality') for name, value in files.items()}
            for path, category in [('tool/input.txt', 'tool'), ('dependency/input.txt', 'dependency'), ('reports/generated.txt', 'output')]:
                bindings[path] = bind(category, files[path], 'actual fixture producer exit0/stdout SHA' if category == 'output' else 'separate explicit fixture ' + category + ' bytes')
            directories = {'data': self.git_data_selector,
                           'other': [('goal.json', 'file')], 'unselected': [('goal.json', 'file')]}
            contract = ReadContract(root, role, bindings, directories, aliases={'alias': self.git_alias}, external_files=self.external,
                                    expected_tool_failures={('access', '/etc/ld.so.preload', 'ENOENT')}, required_discovery={'data'})
            roots[role] = (root, contract)
        return roots

    def native(self, root, mode, role):
        logs = Path(tempfile.mkdtemp(prefix='evidence-', dir=self.base))
        trace = logs / 'reads.strace'
        command = ['bwrap', '--die-with-parent', '--unshare-net', '--clearenv', '--setenv', 'PATH', '/usr/bin:/bin',
                   '--setenv', 'LC_ALL', 'C', '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp',
                   '--ro-bind', str(self.base), str(self.base), '--bind', str(logs), str(logs), '--chdir', str(root), '--',
                   '/usr/bin/strace', *TRACE_OPTIONS, '-o', str(trace), str(self.binary), mode, str(self.outside / 'goal.json')]
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        text = trace.read_text()
        name = self.id().split('.')[-1] + '.' + role + '.' + mode
        record = {'case': name, 'producerExitCode': result.returncode, 'command': command,
                  'traceSha256': digest(trace), 'traceBytes': trace.stat().st_size,
                  'producerBinarySha256': digest(self.binary), 'originalGitCommit': self.commit,
                  'nativeTestOnlyNotProductionSourceAValidation': True}
        RUNS.append(record)
        if EVIDENCE:
            (EVIDENCE / (name + '.strace')).write_text(text)
        return text, record

    def reject_for_both(self, mode, pattern, mutate=None):
        for role, (root, contract) in self.pair().items():
            with self.subTest(role=role):
                if mutate:
                    mutate(root, contract)
                text, record = self.native(root, mode, role)
                if mode == 'write':
                    self.assertIn('EROFS', text)
                    self.assertEqual(digest(root / 'data/goal.json'), contract.files['data/goal.json'].sha256)
                with self.assertRaisesRegex(ValueError, pattern):
                    authenticate_trace(text, root, contract)
                record['authenticationRejectedAsExpected'] = True
                record['expectedFailure'] = pattern

    def test_actual_pid_cwd_dirfd_dup_alias_utf8_discovery_and_provenance_for_both_roles(self):
        for role, (root, contract) in self.pair().items():
            with self.subTest(role=role):
                text, record = self.native(root, 'positive', role)
                facts = authenticate_trace(text, root, contract)
                self.assertEqual(facts['processCount'], 2)
                self.assertEqual(facts['closedDirectoryDiscoveries']['data'], self.git_data_selector)
                self.assertEqual(set(row['category'] for row in facts['files']), {'source', 'tool', 'dependency', 'output'})
                self.assertIn('data/goal.json', facts['actualSourceReadOrMapPaths'])
                self.assertEqual((root / 'data/goal.json').read_bytes(), self.git_original_bytes if role == 'original' else self.projected_bytes)
                record['authenticatedFacts'] = facts

    def test_child_failed_input_is_not_discarded(self):
        self.reject_for_both('child-missing', 'Failed/unexplained input')

    def test_fd_relative_unknown_input_is_rejected(self):
        self.reject_for_both('fd-unbound', 'Unbound role input')

    def test_child_cwd_unknown_input_is_rejected(self):
        self.reject_for_both('cwd-unbound', 'Unbound role input')

    def test_host_reads_are_not_ignored(self):
        self.reject_for_both('host', 'Unclassified host input')

    def test_external_and_proc_aliases_are_not_silently_bound(self):
        self.reject_for_both('escape', 'Undeclared/changed input alias')
        self.reject_for_both('proc-alias', 'Unclassified process/FD alias')

    def test_internal_alias_retarget_between_two_selected_inputs_is_rejected(self):
        def mutate(root, _):
            (root / 'alias').unlink()
            (root / 'alias').symlink_to('other', target_is_directory=True)
        self.reject_for_both('positive', 'Declared alias changed', mutate)

    def test_missing_and_extra_directory_entries_are_rejected(self):
        def extra(root, _):
            (root / 'data/extra.config.json').write_text('unselected config\n')
        self.reject_for_both('positive', 'Directory discovery missing/extra', extra)
        def omitted(root, contract):
            (root / 'data/required.config.json').unlink()
            entries = dict(contract.files)
            del entries['data/required.config.json']
            # Simulate an incomplete successful-read seed. The independently
            # pinned Git directory selector still demands this real config.
            contract.files = entries
        self.reject_for_both('positive', 'Directory discovery missing/extra', omitted)

    def test_original_bytes_and_candidate_projection_bytes_are_not_interchangeable(self):
        for role, (root, contract) in self.pair().items():
            other = self.projected_bytes if role == 'original' else self.git_original_bytes
            (root / 'data/goal.json').write_bytes(other)
            text, record = self.native(root, 'positive', role)
            with self.assertRaisesRegex(ValueError, 'Role bytes differ'):
                authenticate_trace(text, root, contract)
            record['authenticationRejectedAsExpected'] = True

    def test_real_partial_directory_discovery_is_not_complete(self):
        self.reject_for_both('partial-directory', 'Directory discovery lacks EOF')

    def test_real_omitted_required_directory_discovery_is_not_complete(self):
        self.reject_for_both('no-directory', 'Required directory discovery was not executed')

    def test_actual_source_writes_fail_in_readonly_mount(self):
        self.reject_for_both('write', 'write-capable input open')

    def test_actual_trace_requires_current_cwd_lineage_and_complete_discovery(self):
        root, contract = self.pair()['original']
        text, record = self.native(root, 'positive', 'original')
        # The producer remains one actual run; these are explicitly separate
        # trace-integrity mutations, not fabricated successful producer runs.
        with self.assertRaisesRegex(ValueError, 'Actual cwd differs'):
            authenticate_trace(text, root / 'other', contract)
        no_clone = '\n'.join(line for line in text.splitlines() if ' clone(' not in line)
        with self.assertRaisesRegex(ValueError, 'PID has no traced process lineage'):
            authenticate_trace(no_clone, root, contract)
        no_eof = '\n'.join(line for line in text.splitlines() if not ('getdents64(' in line and '[], ' in line))
        with self.assertRaisesRegex(ValueError, 'Directory discovery lacks EOF'):
            authenticate_trace(no_eof, root, contract)
        no_exit = '\n'.join(line for line in text.splitlines() if 'exit_group(' not in line)
        with self.assertRaisesRegex(ValueError, 'successful termination'):
            authenticate_trace(no_exit, root, contract)
        record['separateTraceIntegrityMutationsRejected'] = ['initial-cwd', 'removed-clone-lineage', 'missing-discovery-EOF', 'missing-process-termination']


if __name__ == '__main__':
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('--evidence-dir', type=Path)
    known, rest = parser.parse_known_args()
    EVIDENCE = known.evidence_dir
    if EVIDENCE:
        EVIDENCE.mkdir(parents=True, exist_ok=False)
        (EVIDENCE / 'producer.c').write_text(C_SOURCE)
    program = unittest.main(argv=[sys.argv[0], *rest], exit=False)
    if EVIDENCE:
        (EVIDENCE / 'native-runs.json').write_text(json.dumps({'purpose': 'bounded-native-read-authentication-fixtures-not-SourceA-readiness',
            'testsRun': program.result.testsRun, 'failures': len(program.result.failures), 'errors': len(program.result.errors), 'skips': len(program.result.skipped),
            'actualNativeRuns': RUNS, 'originalCapture19SuiteChanged': False}, ensure_ascii=False, indent=2) + '\n')
    raise SystemExit(0 if program.result.wasSuccessful() else 1)
