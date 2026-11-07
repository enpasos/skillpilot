#!/usr/bin/env python3
"""Actual readonly trace launcher and stdio provenance; no QA acceptance API."""
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import stat
import subprocess
from types import MappingProxyType

from identity_qa_read_trace import TRACE_OPTIONS, arguments, calls, c_string, number, traced_pid

_TOKEN = object()


def _sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


class ReadLaunchEvidence:
    """Only minted after a real launch; not a Source-A/QA-ready capability."""
    __slots__ = ('_token', 'root', 'role', 'cwd', 'argv', 'command', 'trace', 'returncode', 'stdout', 'stderr',
                 'stdio', 'tool_context', 'trace_sha256', 'recorder_trace', 'recorder_trace_sha256',
                 'producer_boundary', 'namespace_process_ids', 'evidence_directory', 'readonly_dependency_mounts',
                 'aborted_identity_observations')

    def __init__(self, token, **values):
        if token is not _TOKEN:
            raise ValueError('Read-launch evidence requires an actual launcher run')
        object.__setattr__(self, '_token', token)
        for key, value in values.items():
            object.__setattr__(self, key, value)

    def __setattr__(self, name, value):
        raise TypeError('Actual read-launch evidence is immutable')

    def receipt(self):
        return {'purpose': 'actual-read-launch-provenance-not-qa-acceptance', 'role': self.role, 'root': str(self.root),
                'cwd': str(self.cwd), 'argv': list(self.argv), 'command': list(self.command), 'producerExitCode': self.returncode,
                'traceSha256': self.trace_sha256, 'stdoutSha256': hashlib.sha256(self.stdout).hexdigest(),
                'stderrSha256': hashlib.sha256(self.stderr).hexdigest(), 'stdio': {str(k): dict(v) for k, v in self.stdio.items()},
                'recorderTraceSha256': self.recorder_trace_sha256, 'producerBoundary': dict(self.producer_boundary),
                'namespaceProcessIds': dict(self.namespace_process_ids),
                'readonlyDependencyMounts': [dict(item) for item in self.readonly_dependency_mounts],
                'abortedNonInputIdentityObservations': [json.loads(item) for item in self.aborted_identity_observations],
                'recorderProtection': {'recorderOutsideProducerPidNamespace': True,
                    'evidenceDirectory': str(self.evidence_directory), 'producerView': 'empty-readonly-tmpfs',
                    'writableEvidenceMounts': [], 'stdoutStderr': 'controller-owned-pipes'},
                'toolKernelContext': dict(self.tool_context), 'runtimeActivationAllowed': False, 'qaValidityClaimed': False}


def require_actual_launch(evidence, trace, cwd, root, role):
    if not isinstance(evidence, ReadLaunchEvidence) or evidence._token is not _TOKEN:
        raise ValueError('Actual factory-minted read-launch evidence is required')
    if evidence.returncode != 0 or hashlib.sha256(trace.encode()).hexdigest() != evidence.trace_sha256:
        raise ValueError('Producer failed or actual trace bytes differ from its launch')
    if hashlib.sha256(evidence.recorder_trace.encode()).hexdigest() != evidence.recorder_trace_sha256:
        raise ValueError('Controller recorder bytes differ from their launch binding')
    if evidence.cwd != Path(cwd).resolve(strict=True) or evidence.root != Path(root).resolve(strict=True) or evidence.role != role:
        raise ValueError('Actual launch role/root/cwd differs')
    return evidence


def _producer_trace(recorder_trace, sandbox_command, argv):
    """Retain the full pinned-bwrap prelude; select all producer descendants.

    Only the controller calls this after its own real launch. The boundary is
    the first successful exec of the exact executable AND ordered argv. No
    earlier secondary executable is permitted. This is not an arbitrary trace
    acceptance or user-supplied prelude exemption.
    """
    events = calls(recorder_trace)

    def exec_argv(event):
        args = event[4]
        if event[3] != 'execve' or not args[1].startswith('[') or not args[1].endswith(']'):
            raise ValueError('Recorder boundary needs unabbreviated execve argv')
        return c_string(args[0]), tuple(c_string(item) for item in arguments(args[1][1:-1]))

    if not events or events[0][3] != 'execve' or number(events[0][5]) != 0 or exec_argv(events[0]) != (sandbox_command[0], sandbox_command):
        raise ValueError('Actual recorder trace does not start with its bound bwrap command')
    known = {events[0][2]}
    boundary = None
    for event in events[1:]:
        _, _, pid, operation, _, result = event
        if pid not in known:
            raise ValueError('Recorder prelude lacks actual process lineage')
        if operation in ('clone', 'clone3', 'fork', 'vfork') and not result.startswith('-1 '):
            known.add(traced_pid(result))
        if operation == 'execve':
            if number(result) != 0 or exec_argv(event) != (argv[0], argv):
                raise ValueError('Unexpected secondary executable before the producer boundary')
            boundary = event
            break
    if boundary is None:
        raise ValueError('Actual bound producer exec was not observed')
    descendants, groups, namespace_ids = {boundary[2]}, {boundary[2]: boundary[2]}, {}
    aborted = []
    for event in events:
        start, _, pid, operation, args, result = event
        if start < boundary[0] or pid not in descendants:
            continue
        if operation in ('clone', 'clone3', 'fork', 'vfork') and not result.startswith('-1 '):
            child = traced_pid(result)
            if child in descendants:
                raise ValueError('Producer PID reused during the bounded launch')
            descendants.add(child)
            groups[child] = groups[pid] if 'CLONE_THREAD' in ','.join(args) else child
        if operation == 'getpid':
            if result == '?':
                from identity_qa_trace_lifecycle import prove_aborted_identity_probe
                aborted.append(prove_aborted_identity_probe(events,event,groups,namespace_ids))
                continue
            try:
                local_pid = number(result)
            except ValueError as error:
                raise ValueError('Uninterpretable actual getpid result at recorder line ' + str(start)
                                 + ', host PID ' + str(pid) + ': ' + repr(result)) from error
            group = groups[pid]
            if traced_pid(result) != group:
                raise ValueError('Observed getpid host group disagrees with actual clone lineage')
            if local_pid <= 0 or namespace_ids.get(group, local_pid) != local_pid:
                raise ValueError('Actual producer PID-namespace observations disagree')
            namespace_ids[group] = local_pid
    lines = recorder_trace.splitlines(keepends=True)
    selected = []
    for index, line in enumerate(lines):
        match = re.match(r'^\s*(?:\[pid\s+)?(\d+)\]?\s+', line)
        if index >= boundary[0] and match and int(match[1]) in descendants:
            selected.append(line)
    return ''.join(selected), MappingProxyType(namespace_ids), MappingProxyType({
        'recorderLine': boundary[0], 'hostPid': boundary[2], 'executable': argv[0],
        'argv': argv, 'selection': 'exact-first-producer-exec-and-all-descendants',
        'fullPreludePreserved': True}), tuple(json.dumps(item,sort_keys=True) for item in aborted)


def run_readonly(role, root, cwd, argv, evidence_directory, dependency_captures=()):
    """Run a small real command. Source-A validation remains an upstream duty.

    The host tree is RO, not a confidential-host sandbox. Every unclassified
    host read must still be rejected by the trace authenticator. The recorder
    is outside the producer PID/mount namespaces; its directory is hidden by
    an empty readonly mount. No writable source/evidence slot, stdin payload,
    shell command or inherited environment is used.
    """
    root, cwd = Path(root).resolve(strict=True), Path(cwd).resolve(strict=True)
    if role not in ('original', 'candidate') or not cwd.is_relative_to(root):
        raise ValueError('Invalid physical role/cwd')
    argv = tuple(str(item) for item in argv)
    if not argv or not Path(argv[0]).is_absolute():
        raise ValueError('Producer executable must be an exact absolute path')
    directory = Path(evidence_directory).resolve(strict=False)
    if directory.is_relative_to(root) or root.is_relative_to(directory):
        raise ValueError('Writable trace evidence must be outside the source role')
    from identity_qa_tool_tree import require_capture
    dependency_captures = tuple(dependency_captures)
    dependency_mounts = tuple(require_capture(item).mount_binding() for item in dependency_captures)
    for index, binding in enumerate(dependency_mounts):
        source = Path(binding['source'])
        if any(source.is_relative_to(other) or other.is_relative_to(source) for other in (root, directory)):
            raise ValueError('Dependency mount overlaps source/evidence scope')
        if any(source.is_relative_to(Path(item['source'])) or Path(item['source']).is_relative_to(source)
               for item in dependency_mounts[:index]):
            raise ValueError('Dependency mount scopes overlap')
    directory.mkdir(parents=True, mode=0o700, exist_ok=False)
    trace_file = directory / 'recorder.strace'
    descriptor = os.open(trace_file, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_CLOEXEC, 0o600)
    os.close(descriptor)
    tools = {'producer': Path(argv[0]).resolve(strict=True), 'strace': Path('/usr/bin/strace'), 'bwrap': Path('/usr/bin/bwrap')}
    before = {name: _sha(path) for name, path in tools.items()}
    context = {'kernelRelease': platform.release(), 'kernelMachine': platform.machine(),
               'kernelBootId': Path('/proc/sys/kernel/random/boot_id').read_text().strip(),
               'producerExecutable': str(tools['producer']), 'producerSha256': before['producer'],
               'straceSha256': before['strace'], 'bwrapSha256': before['bwrap'],
               'environment': 'cleared; PATH=/usr/bin:/bin; LC_ALL=C; PYTHONDONTWRITEBYTECODE=1',
               'osObservationBytesImmutable': False}
    mounts = tuple(value for item in dependency_mounts for value in ('--ro-bind', item['source'], item['target']))
    sandbox_command = ('/usr/bin/bwrap', '--die-with-parent', '--unshare-net', '--unshare-pid', '--clearenv', '--setenv', 'PATH', '/usr/bin:/bin',
               '--setenv', 'LC_ALL', 'C', '--setenv', 'PYTHONDONTWRITEBYTECODE', '1', '--ro-bind', '/', '/',
               '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp', '--ro-bind', str(root), str(root),
               *mounts,
               '--tmpfs', str(directory), '--remount-ro', str(directory), '--chdir', str(cwd), '--', *argv)
    # Recorder and its FD stay outside the producer PID/mount namespaces. No
    # writable trace/provenance pathname is mounted into the producer.
    command = ('/usr/bin/strace', *TRACE_OPTIONS, '-o', str(trace_file), *sandbox_command)
    # Own all three descriptors before their metadata becomes provenance.
    with open('/dev/null', 'rb') as stdin:
        null_stat = os.fstat(stdin.fileno())
        if not stat.S_ISCHR(null_stat.st_mode) or (os.major(null_stat.st_rdev), os.minor(null_stat.st_rdev)) != (1, 3):
            raise ValueError('Launcher stdin is not the actual /dev/null device')
        process = subprocess.Popen(command, stdin=stdin, stdout=subprocess.PIPE, stderr=subprocess.PIPE, close_fds=True,
                                   env={'PATH': '/usr/bin:/bin', 'LC_ALL': 'C', 'PYTHONDONTWRITEBYTECODE': '1'})
        pipe_stats = {1: os.fstat(process.stdout.fileno()), 2: os.fstat(process.stderr.fileno())}
        if not all(stat.S_ISFIFO(value.st_mode) for value in pipe_stats.values()):
            process.kill()
            process.communicate()
            raise ValueError('Launcher did not create its own stdout/stderr pipes')
        stdio = {0: MappingProxyType({'kind': 'stdin-null', 'path': '/dev/null', 'deviceMajor': 1, 'deviceMinor': 3})}
        stdio.update({fd: MappingProxyType({'kind': 'output-pipe', 'pipeInode': value.st_ino}) for fd, value in pipe_stats.items()})
        stdout, stderr = process.communicate()
    if before != {name: _sha(path) for name, path in tools.items()}:
        raise ValueError('Actual launcher/tool bytes changed during the run')
    for capture in dependency_captures:
        require_capture(capture)
    recorder_trace = trace_file.read_text()
    # Preserve the exact interpreted snapshot independently of the recorder's
    # file, including a failing parse; no producer can see/write this directory.
    (directory / 'interpreted-recorder.strace').write_text(recorder_trace)
    if process.returncode != 0:
        raise ValueError('Actual readonly producer failed: ' + stderr.decode(errors='replace'))
    trace, namespace_ids, boundary, aborted = _producer_trace(recorder_trace, sandbox_command, argv)
    return ReadLaunchEvidence(_TOKEN, root=root, role=role, cwd=cwd, argv=argv, command=command, trace=trace,
                              returncode=process.returncode, stdout=stdout, stderr=stderr,
                              stdio=MappingProxyType(stdio), tool_context=MappingProxyType(context),
                              trace_sha256=hashlib.sha256(trace.encode()).hexdigest(), recorder_trace=recorder_trace,
                              recorder_trace_sha256=hashlib.sha256(recorder_trace.encode()).hexdigest(),
                              producer_boundary=boundary, namespace_process_ids=namespace_ids, evidence_directory=directory,
                              readonly_dependency_mounts=dependency_mounts, aborted_identity_observations=aborted)
