#!/usr/bin/env python3
"""Bounded, fail-closed authentication of a controlled Linux strace read log.

This is a byte/read-inventory primitive, not a Source-A verifier, readiness
result, activation capability, or arbitrary-command sandbox. A production
caller must first execute the genuine Source-A verifier and supply the exact
Git/original and verified field-projection/candidate byte bindings. Dependency,
tool and current-run output provenance must be supplied separately.

Required trace options are exported below. No existing Capture19/preparer or
producer is changed. Unsupported/ambiguous constructs are errors, never skips.
"""
from dataclasses import dataclass, field
import hashlib
import os
from pathlib import Path
import re
from types import MappingProxyType


TRACE_OPTIONS = (
    '-f', '-qq', '-yy', '--decode-pids=pidns', '-v', '-s', '65535',
    '-e', 'trace=%file,%network,read,pread64,readv,preadv,preadv2,close,dup,dup2,dup3,fcntl,pipe,pipe2,eventfd,eventfd2,getdents,getdents64,clone,clone3,fork,vfork,getcwd,getpid,mmap,close_range,unshare,setns,exit,exit_group,io_uring_setup,io_uring_register,io_uring_enter,open_by_handle_at,pidfd_getfd,process_vm_readv,ptrace',
    '-e', 'raw=read,pread64,readv,preadv,preadv2',
)


def require(value, message):
    if not value:
        raise ValueError(message)


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


@dataclass(frozen=True)
class FileBinding:
    category: str
    sha256: str
    provenance: str

    def __post_init__(self):
        require(self.category in ('source', 'tool', 'dependency', 'output'), 'Unknown input provenance category')
        require(re.fullmatch(r'[a-f0-9]{64}', self.sha256), 'Invalid input SHA256')
        require(bool(self.provenance), 'Each input needs explicit provenance')


class ReadContract:
    """An explicit lower-level binding, never a substitute for verified A."""
    def __init__(self, root, role, files, directories, aliases=None, external_files=None, expected_tool_failures=(), required_discovery=(), external_directory_metadata=None):
        root = Path(root).absolute()
        require(root.resolve(strict=True) == root and root.is_dir(), 'Physical role root cannot be an alias')
        require(role in ('original', 'candidate'), 'Unknown physical role')
        self.root, self.role = root, role
        for name in [*files, *(aliases or {})]:
            require(not name.startswith('/') and all(p not in ('.', '..', '') for p in name.split('/')),
                    'Unsafe logical binding path: ' + name)
        for name in directories:
            require(name == '.' or (not name.startswith('/') and all(p not in ('.', '..', '') for p in name.split('/'))),
                    'Unsafe directory binding path: ' + name)
        self.files = MappingProxyType(dict(files))
        self.directories = MappingProxyType({name: tuple(sorted(entries)) for name, entries in directories.items()})
        self.aliases = MappingProxyType(dict(aliases or {}))
        self.external_files = MappingProxyType({str(Path(path).resolve(strict=True)): binding for path, binding in (external_files or {}).items()})
        require(all(item.category in ('tool', 'dependency') for item in self.external_files.values()),
                'Host paths cannot be source/output inputs')
        self.expected_tool_failures = frozenset(expected_tool_failures)
        allowed_metadata = frozenset(('statx', 'newfstatat', 'stat', 'lstat'))
        self.external_directory_metadata = MappingProxyType({str(Path(path).resolve(strict=True)): frozenset(operations)
                                                              for path, operations in (external_directory_metadata or {}).items()})
        require(all(operations and operations <= allowed_metadata for operations in self.external_directory_metadata.values()),
                'External directories permit only exact declared metadata operations')
        self.required_discovery = frozenset(required_discovery)
        require(self.required_discovery <= self.directories.keys(), 'Required discovery lacks an independent directory binding')

    def verify_bytes_and_aliases(self):
        for name, target in self.aliases.items():
            path = self.root / name
            require(path.is_symlink() and os.readlink(path) == target, 'Declared alias changed: ' + name)
            require(not target.startswith('/') and path.resolve(strict=True).is_relative_to(self.root), 'Alias escapes physical role: ' + name)
        for name, binding in self.files.items():
            path = self.root / name
            require(path.resolve(strict=True).is_relative_to(self.root), 'Input escapes physical role: ' + name)
            require(path.is_file() and digest(path) == binding.sha256, 'Role bytes differ: ' + self.role + ':' + name)
        for name, binding in self.external_files.items():
            require(digest(name) == binding.sha256, 'Tool/dependency bytes differ: ' + name)
        for name in self.external_directory_metadata:
            require(Path(name).is_dir(), 'Tool metadata directory type differs: ' + name)

    def resolve(self, attempted, actual=None, operation=None):
        attempted = Path(attempted)
        # Kernel magic links are not silently equated with a source file.
        require(not str(attempted).startswith(('/proc/', '/dev/fd/')), 'Unclassified process/FD alias: ' + str(attempted))
        inside = attempted.is_relative_to(self.root)
        if inside:
            current = self.root
            for part in attempted.relative_to(self.root).parts:
                current /= part
                if current.is_symlink():
                    logical = str(current.relative_to(self.root))
                    require(logical in self.aliases and os.readlink(current) == self.aliases[logical], 'Undeclared/changed input alias: ' + logical)
        resolved = attempted.resolve(strict=False)
        if inside:
            require(resolved.is_relative_to(self.root), 'Host escape from physical role: ' + str(attempted))
        if actual is not None:
            require(Path(actual) == resolved, 'Kernel FD path disagrees with PID/cwd/dirfd resolution: ' + str(attempted))
        if resolved.is_relative_to(self.root):
            logical = str(resolved.relative_to(self.root))
            if logical in self.files:
                return resolved, self.files[logical], logical
            if logical in self.directories:
                return resolved, None, logical
            raise ValueError('Unbound role input: ' + self.role + ':' + logical)
        binding = self.external_files.get(str(resolved))
        if binding is None and operation in self.external_directory_metadata.get(str(resolved), ()):
            return resolved, None, str(resolved)
        require(binding is not None, 'Unclassified host input: ' + str(resolved))
        return resolved, binding, str(resolved)


class RuntimeObservationContract:
    """Exact measured OS observations, explicitly NOT immutable source bytes.

    No prefix, arbitrary PID, host-file, or Source-A/QA-authority exception.
    A reviewed environment-specific profile and genuine launch are required.
    """
    NODE_VM_PATH = '/proc/sys/vm/overcommit_memory'
    # Closed measured Node20.20.2 profile, not an arbitrary executable label.
    NODE_VM_EXECUTABLE_SHA256 = '6295488653f0d93b0a157841746fef7e72cc4328cfb60c4bbe0ca2668a836ffd'
    OBSERVED_PATHS = frozenset(('/proc/self/cgroup', '/proc/self/maps', '/proc/self/exe', '/proc/meminfo', NODE_VM_PATH,
                                '/sys/fs/cgroup/non-systemd/memory.max', '/sys/fs/cgroup/non-systemd/memory.high'))

    @classmethod
    def measured_node_vm_rule(cls):
        return {'operations':['openat','read','close'], 'resultClass':'volatile-kernel-observation',
                'executableSha256':cls.NODE_VM_EXECUTABLE_SHA256,
                'openFlags':'O_RDONLY|O_CLOEXEC', 'readBytes':1}

    def __init__(self, producer_sha256, kernel_release, measured_trace_sha256, paths, absent_fd_probes=()):
        require(re.fullmatch(r'[a-f0-9]{64}', producer_sha256) and re.fullmatch(r'[a-f0-9]{64}', measured_trace_sha256),
                'Runtime profile needs actual tool and measured-trace byte bindings')
        require(paths and set(paths) <= self.OBSERVED_PATHS, 'Unmeasured runtime path/prefix is not allowed')
        self.producer_sha256, self.kernel_release, self.measured_trace_sha256 = producer_sha256, kernel_release, measured_trace_sha256
        allowed = {'openat', 'read', 'pread64', 'readv', 'newfstatat', 'close', 'readlink'}
        frozen_rules = {}
        for path, rule in paths.items():
            if path == self.NODE_VM_PATH:
                measured = self.measured_node_vm_rule()
                require(set(rule) == set(measured)
                        and type(rule['readBytes']) is int
                        and {**rule, 'operations':frozenset(rule['operations'])} == {**measured, 'operations':frozenset(measured['operations'])}
                        and producer_sha256 == self.NODE_VM_EXECUTABLE_SHA256,
                        'Node VM observation needs the exact measured Node executable/operations/flags/read width')
            else:
                require(set(rule) == {'operations', 'resultClass'}, 'Invalid runtime observation properties')
            require(set(rule['operations']) <= allowed and rule['operations'], 'Invalid runtime observation operations')
            require(rule['resultClass'] in ('volatile-kernel-observation', 'ENOENT-probe'), 'Invalid runtime observation classification')
            frozen_rules[path] = MappingProxyType({**rule, 'operations':frozenset(rule['operations'])})
        self.paths = MappingProxyType(frozen_rules)
        self.absent_fd_probes = frozenset(absent_fd_probes)
        require(self.absent_fd_probes <= set(range(3, 17)), 'Unmeasured absent-FD probe range')

    def verify_launch(self, evidence):
        require(evidence.tool_context['producerSha256'] == self.producer_sha256
                and evidence.tool_context['kernelRelease'] == self.kernel_release,
                'Runtime profile tool/kernel context differs from the actual launch')
        require(self.measured_trace_sha256 == evidence.trace_sha256, 'Runtime profile is not bound to this actual measured trace')
        observed, fd_probes = set(), set()
        for _, _, _, operation, args, result in calls(evidence.trace):
            position = 1 if operation in ('openat', 'openat2', 'statx', 'newfstatat', 'readlinkat') else 0
            if operation in ('open', 'openat', 'openat2', 'readlink', 'readlinkat', 'stat', 'statx', 'lstat', 'newfstatat'):
                if args[position].startswith('"'):
                    observed.add(c_string(args[position]))
            if operation == 'fcntl' and args[1:] == ['F_SETFD', 'FD_CLOEXEC'] and result.startswith('-1 EBADF'):
                fd_probes.add(number(args[0]))
        require(set(self.paths) <= observed, 'Runtime profile contains a path not actually observed in the bound run')
        require(self.absent_fd_probes <= fd_probes, 'Runtime profile contains an unobserved absent-FD probe')

    def check_node_vm_context(self, evidence, executable, group):
        require(self.NODE_VM_PATH in self.paths, 'Exact Node VM observation rule is not declared')
        from identity_qa_read_launcher import ReadLaunchEvidence, require_actual_launch
        require(type(evidence) is ReadLaunchEvidence, 'Actual Node VM launch evidence is required')
        require_actual_launch(evidence, evidence.trace, evidence.cwd, evidence.root, evidence.role)
        self.verify_launch(evidence)
        expected = Path(evidence.tool_context['producerExecutable'])
        require(executable is not None and Path(executable).resolve(strict=True) == expected
                and digest(executable) == self.NODE_VM_EXECUTABLE_SHA256
                and evidence.tool_context['producerSha256'] == self.NODE_VM_EXECUTABLE_SHA256,
                'Node VM observation is not from the exact bound Node executable')
        require(group in evidence.namespace_process_ids, 'Node VM observation lacks actual PID-group provenance')
        return {'executable':str(expected), 'executableSha256':self.NODE_VM_EXECUTABLE_SHA256,
                'namespaceThreadGroup':evidence.namespace_process_ids[group],
                'launchTraceSha256':evidence.trace_sha256,
                'kernelRelease':evidence.tool_context['kernelRelease'], 'kernelBootId':evidence.tool_context['kernelBootId']}


def c_string(token):
    require(token.startswith('"') and token.endswith('"'), 'Truncated/non-string pathname')
    return escaped_path(token[1:-1])


def escaped_path(text):
    # -yy FD annotations use the same escaped UTF-8 bytes without quotes.
    raw, index = bytearray(), 0
    simple = {'a': 7, 'b': 8, 'f': 12, 'n': 10, 'r': 13, 't': 9, 'v': 11, '\\': 92, '"': 34}
    while index < len(text):
        if text[index] != '\\':
            raw.extend(text[index].encode('utf-8'))
            index += 1
            continue
        index += 1
        require(index < len(text), 'Truncated pathname escape')
        octal = re.match(r'[0-7]{1,3}', text[index:])
        hex_byte = re.match(r'x([a-fA-F0-9]{2})', text[index:])
        if octal:
            raw.append(int(octal[0], 8))
            index += len(octal[0])
        elif hex_byte:
            raw.append(int(hex_byte[1], 16))
            index += 3
        else:
            require(text[index] in simple, 'Unsupported pathname escape')
            raw.append(simple[text[index]])
            index += 1
    try:
        return raw.decode('utf-8')
    except UnicodeError as error:
        raise ValueError('Unsupported pathname encoding') from error


def arguments(text):
    result, start, stack, quoted, escaped = [], 0, [], False, False
    for i, char in enumerate(text):
        if quoted:
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == '"':
                quoted = False
        elif char == '"':
            quoted = True
        elif char in '([{<':
            stack.append(char)
        elif char == '>' and i > 0 and text[i - 1] == '=':
            # strace can render in/out structs as `{...} => {...}`.
            continue
        elif char in ')]}>':
            require(bool(stack) and '([{<'[')]}>'.index(char)] == stack.pop(), 'Unbalanced trace argument')
        elif char == ',' and not stack:
            result.append(text[start:i].strip())
            start = i + 1
    require(not stack and not quoted, 'Truncated trace arguments')
    result.append(text[start:].strip())
    return result


def calls(trace):
    completed, pending = [], {}
    for order, line in enumerate(trace.splitlines()):
        prefix = re.match(r'^\s*(?:\[pid\s+)?(\d+)\]?\s+(.*)$', line)
        require(prefix is not None, 'Trace must preserve every PID')
        pid, text = int(prefix[1]), prefix[2]
        if text.startswith('--- '):
            continue
        require(not text.startswith('+++ killed'), 'Traced producer was killed')
        if text.startswith('+++ exited'):
            continue
        if '<unfinished ...>' in text:
            require(pid not in pending, 'Multiple unfinished calls for a PID')
            pending[pid] = (order, text.replace('<unfinished ...>', ''))
            continue
        if text.startswith('<... '):
            resume = re.match(r'^<\.\.\. (\w+) resumed>(.*)$', text)
            require(resume is not None and pid in pending, 'Resumed syscall lacks its actual entry')
            start, prior = pending.pop(pid)
            require(prior.startswith(resume[1] + '('), 'Mismatched resumed syscall')
            text, start_order = prior + resume[2], start
        else:
            start_order = order
        match = re.match(r'^(\w+)\((.*)\)\s+=\s+(.*)$', text)
        require(match is not None, 'Unknown or truncated syscall line')
        require('...' not in match[2], 'Abbreviated input/discovery trace')
        completed.append((start_order, order, pid, match[1], arguments(match[2]), match[3]))
    require(not pending, 'Trace ends with unfinished syscalls')
    return sorted(completed)


def number(token):
    found = re.match(r'^(-?(?:0x[0-9a-f]+|\d+))', token)
    require(found is not None, 'Missing numeric syscall result/FD')
    return int(found[1], 0) if found[1].startswith(('0x', '-0x')) else int(found[1])


def traced_pid(token):
    """strace host-PID lineage when a child is in a nested PID namespace."""
    local_pid = number(token)
    suffix = token[len(str(local_pid)):].strip()
    if not suffix:
        return local_pid
    translated = re.fullmatch(r"/\* (\d+) in strace's PID NS \*/", suffix)
    require(translated is not None, 'Missing/unrecognized kernel PID-namespace translation')
    return int(translated[1])


def annotation(token):
    found = re.match(r'^(?:-?\d+|AT_FDCWD)<(.+)>', token)
    if not found:
        return None
    value = re.sub(r'<(?:char|block) \d+:\d+>$', '', found[1])
    require('<' not in value and '>' not in value, 'Unsupported nested FD annotation')
    return escaped_path(value)


@dataclass
class Handle:
    path: Path
    binding: FileBinding | None
    logical: str
    directory: bool
    discovered: dict = field(default_factory=dict)
    discovery_eof: bool = False
    runtime_path: str | None = None
    transport: str | None = None
    runtime_reads: int = 0
    runtime_closed: bool = False


@dataclass
class Process:
    cwd: list
    fds: dict
    group: int
    executable: Path | None = None


def authenticate_trace(trace, initial_cwd, contract, launch=None, runtime=None, dependency_trees=()):
    """Return read facts or raise. Never returns a QA-readiness boolean."""
    contract.verify_bytes_and_aliases()
    if launch is not None:
        from identity_qa_read_launcher import require_actual_launch
        require_actual_launch(launch, trace, initial_cwd, contract.root, contract.role)
    if runtime is not None:
        require(launch is not None, 'Runtime observations need actual launcher provenance')
        runtime.verify_launch(launch)
    from identity_qa_tool_tree import require_bound_tree
    bound_trees = tuple(require_bound_tree(tree, launch, contract) for tree in dependency_trees)
    events = calls(trace)
    require(events, 'Empty producer trace')
    root_pid = events[0][2]
    initial_cwd = Path(initial_cwd).resolve(strict=True)
    require(initial_cwd.is_relative_to(contract.root), 'Initial cwd is outside its physical role')
    processes = {root_pid: Process([initial_cwd], {}, root_pid)}
    exited, handles, facts, failures, source_reads = set(), [], {}, [], set()
    runtime_facts, transport_facts, metadata_facts, node_vm_handles = [], [], [], []

    def fd(proc, token):
        if token.startswith('AT_FDCWD'):
            path = proc.cwd[0]
        else:
            descriptor = number(token)
            if descriptor not in proc.fds and launch is not None and descriptor in launch.stdio:
                spec = launch.stdio[descriptor]
                actual = annotation(token)
                if spec['kind'] == 'stdin-null':
                    require(actual == '/dev/null' and '<char 1:3>' in token, 'Inherited stdin differs from bound launcher /dev/null')
                    handle = Handle(Path('/dev/null'), None, 'launcher:stdin', False, transport='launcher-stdin')
                else:
                    expected = 'pipe:[' + str(spec['pipeInode']) + ']'
                    require(actual == expected, 'Inherited output pipe differs from actual launcher ownership')
                    handle = Handle(Path(expected), None, 'launcher:output:' + str(descriptor), False, transport='launcher-output')
                proc.fds[descriptor] = (handle, False)
                transport_facts.append({'pid': pid, 'descriptor': descriptor, 'origin': handle.logical, 'kernelFdIdentity': actual})
            require(descriptor in proc.fds, 'FD has no traced open/dup/clone provenance: ' + token)
            path = proc.fds[descriptor][0].path
        if annotation(token):
            require(str(path) == annotation(token), 'FD/cwd annotation differs from reconstructed process state')
        return path

    def observe_runtime(path, operation, failed=None, actual=None, byte_count=None, open_flags=None, requested_bytes=None):
        rule = runtime.paths[path]
        require(operation in rule['operations'], 'Unmeasured runtime operation: ' + path + ':' + operation)
        if failed:
            require(rule['resultClass'] == 'ENOENT-probe' and failed.split()[1] == 'ENOENT', 'Unmeasured runtime failure')
        else:
            require(rule['resultClass'] == 'volatile-kernel-observation', 'Previously absent runtime probe unexpectedly exists')
        namespace_group = launch.namespace_process_ids.get(proc.group) if launch is not None else proc.group
        require(not path.startswith('/proc/self/') or namespace_group is not None, 'Runtime self path lacks actual PID-namespace provenance')
        target = '/proc/' + str(namespace_group) + path[len('/proc/self'):] if path.startswith('/proc/self/') else path
        if actual is not None:
            require(actual == target, 'Runtime self path does not belong to traced process group')
        extra = {}
        if path == runtime.NODE_VM_PATH:
            extra = runtime.check_node_vm_context(launch, proc.executable, proc.group)
            if operation == 'openat':
                require(open_flags == rule['openFlags'], 'Node VM observation open flags differ')
            elif operation == 'read':
                require(requested_bytes == rule['readBytes'] and byte_count == rule['readBytes'],
                        'Node VM observation read width differs')
        runtime_facts.append({'pid': pid, 'threadGroup': proc.group, 'declaredPath': path, 'kernelPath': target,
                              'operation': operation, 'resultClass': rule['resultClass'], 'bytesReported': byte_count,
                              'contentSha256': None, 'immutableCurriculumInput': False, **extra})
        return Path(target)

    def path_at(proc, directory, token):
        path = c_string(token)
        if path.startswith('/'):
            return Path(path)
        return fd(proc, directory) / path

    def check(path, syscall, failed, actual=None):
        if failed:
            matching = [tree for tree in bound_trees if tree.contains(path)]
            require(len(matching) <= 1, 'Negative dependency lookup has ambiguous bound roots')
            if matching:
                failures.append(matching[0].prove_negative_lookup((start, end, pid, name, args, result), path, proc.cwd[0]))
                return None
            errno = failed.split()[1] if len(failed.split()) > 1 else ''
            permitted = (syscall, str(path), errno) in contract.expected_tool_failures
            require(permitted and not path.is_relative_to(contract.root), 'Failed/unexplained input attempt: ' + str(path))
            failures.append({'syscall': syscall, 'path': str(path), 'errno': errno, 'category': 'tool-probe'})
            return None
        resolved, binding, logical = contract.resolve(path, actual, syscall)
        if binding:
            require(digest(resolved) == binding.sha256, 'Actual accessed bytes differ: ' + logical)
            fact = facts.setdefault((binding.category, logical), {'category': binding.category, 'path': logical,
                                    'sha256': binding.sha256, 'provenance': binding.provenance, 'observedOperations': []})
            if syscall not in fact['observedOperations']:
                fact['observedOperations'].append(syscall)
        elif not resolved.is_relative_to(contract.root):
            metadata_facts.append({'pid': pid, 'path': str(resolved), 'operation': syscall,
                                   'category': 'tool-directory-metadata-only', 'directoryContentsRead': False})
        return resolved, binding, logical

    for start, end, pid, name, args, result in events:
        require(pid in processes, 'PID has no traced process lineage: ' + str(pid))
        proc = processes[pid]
        failed = result if result.startswith('-1 ') else None
        if name in ('exit', 'exit_group'):
            require(number(args[0]) == 0, 'Producer process exited unsuccessfully')
            exited.update(p for p, state in processes.items() if (state.group == proc.group if name == 'exit_group' else p == pid))
        elif name in ('clone', 'clone3', 'fork', 'vfork'):
            if failed:
                continue
            child = traced_pid(result)
            require(child not in processes, 'PID reused inside one bounded trace')
            text = ','.join(args)
            processes[child] = Process(proc.cwd if 'CLONE_FS' in text else proc.cwd.copy(),
                                       proc.fds if 'CLONE_FILES' in text else proc.fds.copy(),
                                       proc.group if 'CLONE_THREAD' in text else child, proc.executable)
        elif name in ('unshare', 'setns', 'close_range'):
            raise ValueError('Unsupported namespace/FD-range mutation: ' + name)
        elif name in ('chdir', 'fchdir'):
            require(start == end, 'Overlapping cwd mutation needs stronger trace ordering')
            if not failed:
                destination = path_at(proc, 'AT_FDCWD', args[0]) if name == 'chdir' else fd(proc, args[0])
                resolved = check(destination, name, None)[0]
                require(resolved.is_dir(), 'cwd is not a bound directory')
                proc.cwd[0] = resolved
            else:
                raise ValueError('Failed cwd mutation')
        elif name == 'getpid':
            require(not failed and number(result) > 0, 'Failed process identity observation')
            require(launch is None or launch.namespace_process_ids.get(proc.group) == number(result),
                    'Process identity differs from actual PID-namespace observation')
        elif name == 'getcwd':
            require(not failed and Path(c_string(args[0])) == proc.cwd[0], 'Actual cwd differs from process binding')
        elif name in ('open', 'openat', 'openat2'):
            path = path_at(proc, 'AT_FDCWD' if name == 'open' else args[0], args[0] if name == 'open' else args[1])
            flags = ','.join(args[1:] if name == 'open' else args[2:])
            require(not any(flag in flags for flag in ['O_WRONLY', 'O_RDWR', 'O_CREAT', 'O_TRUNC', 'O_TMPFILE']), 'Producer attempted a write-capable input open')
            if runtime is not None and str(path) in runtime.paths:
                target = observe_runtime(str(path), name, failed, annotation(result), open_flags=flags)
                if not failed:
                    handle = Handle(target, None, str(path), False, runtime_path=str(path))
                    if str(path) == runtime.NODE_VM_PATH:
                        node_vm_handles.append(handle)
                    proc.fds[number(result)] = (handle, 'O_CLOEXEC' in flags)
                continue
            checked = check(path, name, failed, annotation(result))
            if checked:
                require(annotation(result) is not None, 'Successful open lacks actual kernel FD path (-yy required)')
                resolved, binding, logical = checked
                handle = Handle(resolved, binding, logical, binding is None)
                handles.append(handle)
                proc.fds[number(result)] = (handle, 'O_CLOEXEC' in flags)
        elif name == 'close':
            descriptor = number(args[0])
            if not failed:
                if descriptor in proc.fds and proc.fds[descriptor][0].runtime_path:
                    handle = proc.fds[descriptor][0]
                    if handle.runtime_path == runtime.NODE_VM_PATH:
                        require(handle.runtime_reads == 1 and not handle.runtime_closed,
                                'Node VM observation lacks its exact read/close sequence')
                        handle.runtime_closed = True
                    observe_runtime(handle.runtime_path, name)
                proc.fds.pop(descriptor, None)
        elif name in ('pipe', 'pipe2', 'eventfd', 'eventfd2'):
            require(launch is not None and not failed, 'Internal transport lacks actual launch provenance')
            if name in ('pipe', 'pipe2'):
                descriptors = re.findall(r'(\d+<pipe:\[\d+\]>)', args[0])
                require(len(descriptors) == 2 and annotation(descriptors[0]) == annotation(descriptors[1]), 'Incomplete internal pipe identity')
            else:
                descriptors = [result]
                require(annotation(result) == 'anon_inode:[eventfd]', 'Unknown internal eventfd identity')
            for token in descriptors:
                identity = annotation(token)
                handle = Handle(Path(identity), None, 'internal:' + name, False, transport='internal-control')
                proc.fds[number(token)] = (handle, 'CLOEXEC' in ','.join(args))
                transport_facts.append({'pid': pid, 'descriptor': number(token), 'origin': name, 'kernelFdIdentity': identity})
        elif name in ('dup', 'dup2', 'dup3', 'fcntl'):
            if failed:
                if (runtime is not None and name == 'fcntl' and number(args[0]) in runtime.absent_fd_probes
                        and number(args[0]) not in proc.fds and args[1:] == ['F_SETFD', 'FD_CLOEXEC'] and failed.split()[1] == 'EBADF'):
                    runtime_facts.append({'pid': pid, 'descriptor': number(args[0]), 'operation': 'fcntl F_SETFD FD_CLOEXEC',
                                          'resultClass': 'EBADF-probe', 'immutableCurriculumInput': False})
                    continue
                raise ValueError('Failed FD mutation/probe')
            descriptor = number(args[0])
            fd(proc, args[0])
            if name == 'fcntl' and args[1] == 'F_SETFL' and proc.fds[descriptor][0].transport:
                continue
            if name == 'fcntl' and args[1] not in ('F_DUPFD', 'F_DUPFD_CLOEXEC', 'F_SETFD', 'F_GETFD', 'F_GETFL'):
                raise ValueError('Unsupported FD command: ' + args[1])
            if name == 'fcntl' and args[1] in ('F_GETFD', 'F_GETFL'):
                continue
            if name == 'fcntl' and args[1] == 'F_SETFD':
                proc.fds[descriptor] = (proc.fds[descriptor][0], 'FD_CLOEXEC' in args[2])
            else:
                proc.fds[number(result)] = (proc.fds[descriptor][0], 'CLOEXEC' in ','.join(args[1:]))
        elif name in ('read', 'pread64', 'readv', 'preadv', 'preadv2', 'mmap'):
            if name == 'mmap':
                if 'MAP_ANONYMOUS' in args[3]:
                    continue
                token = args[4]
            else:
                token = args[0]
            require(not failed, 'Failed FD read/map')
            fd(proc, token)
            handle = proc.fds[number(token)][0]
            if handle.runtime_path:
                observe_runtime(handle.runtime_path, name, byte_count=number(result),
                                requested_bytes=number(args[2]) if name == 'read' else None)
                if handle.runtime_path == runtime.NODE_VM_PATH:
                    require(handle.runtime_reads == 0, 'Node VM observation has an extra read')
                    handle.runtime_reads += 1
                continue
            if handle.transport:
                require(handle.transport == 'internal-control' or (handle.transport == 'launcher-stdin' and number(result) == 0),
                        'Unbound transport payload read')
                continue
            require(not handle.directory, 'Directory read without getdents discovery')
            check(handle.path, name, None)
            if handle.binding.category == 'source' and (name == 'mmap' or number(result) > 0 or handle.path.stat().st_size == 0):
                source_reads.add(handle.logical)
        elif name == 'getdents64':
            require(not failed, 'Failed directory discovery')
            fd(proc, args[0])
            handle = proc.fds[number(args[0])][0]
            require(handle.directory, 'getdents on a non-directory binding')
            if number(result) == 0:
                handle.discovery_eof = True
            entries = re.findall(r'd_type=(DT_\w+), d_name=("(?:[^"\\]|\\.)*")', args[1])
            require(args[1].startswith('[') and args[1].endswith(']') and args[1].count('d_ino=') == len(entries),
                    'Incomplete directory-entry decoding')
            require((number(result) == 0) == (args[1] == '[]'), 'Directory result/entry-list mismatch')
            for kind, token in entries:
                entry = c_string(token)
                if entry in ('.', '..'):
                    continue
                require(kind in ('DT_REG', 'DT_DIR', 'DT_LNK'), 'Unsupported directory entry type')
                handle.discovered[entry] = {'DT_REG': 'file', 'DT_DIR': 'directory', 'DT_LNK': 'symlink'}[kind]
        elif name in ('execve', 'execveat'):
            path = path_at(proc, 'AT_FDCWD' if name == 'execve' else args[0], args[0] if name == 'execve' else args[1])
            check(path, name, failed)
            if not failed:
                proc.fds = {descriptor: value for descriptor, value in proc.fds.items() if not value[1]}
                proc.executable = path.resolve(strict=True)
        elif name in ('newfstatat', 'statx', 'faccessat', 'faccessat2', 'readlinkat', 'stat', 'lstat', 'access', 'readlink'):
            at = name in ('newfstatat', 'statx', 'faccessat', 'faccessat2', 'readlinkat')
            path = path_at(proc, args[0] if at else 'AT_FDCWD', args[1] if at else args[0])
            if runtime is not None and name == 'readlink' and str(path) == '/proc/self/exe':
                require(not failed and proc.executable is not None and Path(c_string(args[1])) == proc.executable,
                        'Runtime executable identity differs from actual traced exec')
                observe_runtime(str(path), name)
                check(proc.executable, 'runtime-executable-identity', None)
                continue
            if at and c_string(args[1]) == '' and not args[0].startswith('AT_FDCWD'):
                handle = proc.fds[number(args[0])][0]
                if handle.runtime_path:
                    observe_runtime(handle.runtime_path, name)
                    continue
                if handle.transport:
                    require(not failed, 'Failed owned transport metadata probe')
                    continue
            check(path, name, failed)
        else:
            raise ValueError('Unsupported traced syscall (not skipped): ' + name)
    require(set(processes) <= exited, 'Trace lacks successful termination for every process/thread group')
    require(all(handle.runtime_reads == 1 and handle.runtime_closed for handle in node_vm_handles),
            'Node VM observation lacks its complete read/close sequence')
    discoveries = {}
    for handle in handles:
        if handle.discovered or handle.discovery_eof:
            require(handle.discovery_eof, 'Directory discovery lacks EOF')
            expected = contract.directories[handle.logical]
            require(tuple(sorted(handle.discovered.items())) == expected, 'Directory discovery missing/extra/type-changed: ' + handle.logical)
            discoveries[handle.logical] = list(expected)
    require(contract.required_discovery <= discoveries.keys(), 'Required directory discovery was not executed')
    require(source_reads, 'Authenticated source-read scope is empty')
    contract.verify_bytes_and_aliases()
    for tree in bound_trees:
        require_bound_tree(tree, launch, contract)
    return {'purpose': 'bounded-role-read-authentication-facts-not-qa-readiness', 'role': contract.role,
            'processCount': len(processes), 'files': sorted(facts.values(), key=lambda row: (row['category'], row['path'])),
            'actualSourceReadOrMapPaths': sorted(source_reads),
            'closedDirectoryDiscoveries': discoveries, 'explicitToolProbeFailures': failures,
            'ownedLauncherTransportMetadata': transport_facts, 'volatileRuntimeObservations': runtime_facts,
            'explicitToolDirectoryMetadata': metadata_facts}
