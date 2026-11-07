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
    '-f', '-qq', '-yy', '-v', '-s', '65535',
    '-e', 'trace=%file,%network,read,pread64,readv,preadv,preadv2,close,dup,dup2,dup3,fcntl,getdents,getdents64,clone,clone3,fork,vfork,getcwd,mmap,close_range,unshare,setns,exit,exit_group,io_uring_setup,io_uring_register,io_uring_enter,open_by_handle_at,pidfd_getfd,process_vm_readv,ptrace',
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
    def __init__(self, root, role, files, directories, aliases=None, external_files=None, expected_tool_failures=(), required_discovery=()):
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

    def resolve(self, attempted, actual=None):
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
        require(binding is not None, 'Unclassified host input: ' + str(resolved))
        return resolved, binding, str(resolved)


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


def annotation(token):
    found = re.match(r'^(?:-?\d+|AT_FDCWD)<([^<>]+)>', token)
    return escaped_path(found[1]) if found else None


@dataclass
class Handle:
    path: Path
    binding: FileBinding | None
    logical: str
    directory: bool
    discovered: dict = field(default_factory=dict)
    discovery_eof: bool = False


@dataclass
class Process:
    cwd: list
    fds: dict
    group: int


def authenticate_trace(trace, initial_cwd, contract):
    """Return read facts or raise. Never returns a QA-readiness boolean."""
    contract.verify_bytes_and_aliases()
    events = calls(trace)
    require(events, 'Empty producer trace')
    root_pid = events[0][2]
    initial_cwd = Path(initial_cwd).resolve(strict=True)
    require(initial_cwd.is_relative_to(contract.root), 'Initial cwd is outside its physical role')
    processes = {root_pid: Process([initial_cwd], {}, root_pid)}
    exited, handles, facts, failures, source_reads = set(), [], {}, [], set()

    def fd(proc, token):
        if token.startswith('AT_FDCWD'):
            path = proc.cwd[0]
        else:
            descriptor = number(token)
            require(descriptor in proc.fds, 'FD has no traced open/dup/clone provenance: ' + token)
            path = proc.fds[descriptor][0].path
        if annotation(token):
            require(str(path) == annotation(token), 'FD/cwd annotation differs from reconstructed process state')
        return path

    def path_at(proc, directory, token):
        path = c_string(token)
        if path.startswith('/'):
            return Path(path)
        return fd(proc, directory) / path

    def check(path, syscall, failed, actual=None):
        if failed:
            errno = failed.split()[1] if len(failed.split()) > 1 else ''
            permitted = (syscall, str(path), errno) in contract.expected_tool_failures
            require(permitted and not path.is_relative_to(contract.root), 'Failed/unexplained input attempt: ' + str(path))
            failures.append({'syscall': syscall, 'path': str(path), 'errno': errno, 'category': 'tool-probe'})
            return None
        resolved, binding, logical = contract.resolve(path, actual)
        if binding:
            require(digest(resolved) == binding.sha256, 'Actual accessed bytes differ: ' + logical)
            fact = facts.setdefault((binding.category, logical), {'category': binding.category, 'path': logical,
                                    'sha256': binding.sha256, 'provenance': binding.provenance, 'observedOperations': []})
            if syscall not in fact['observedOperations']:
                fact['observedOperations'].append(syscall)
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
            child = number(result)
            require(child not in processes, 'PID reused inside one bounded trace')
            text = ','.join(args)
            processes[child] = Process(proc.cwd if 'CLONE_FS' in text else proc.cwd.copy(),
                                       proc.fds if 'CLONE_FILES' in text else proc.fds.copy(),
                                       proc.group if 'CLONE_THREAD' in text else child)
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
        elif name == 'getcwd':
            require(not failed and Path(c_string(args[0])) == proc.cwd[0], 'Actual cwd differs from process binding')
        elif name in ('open', 'openat', 'openat2'):
            path = path_at(proc, 'AT_FDCWD' if name == 'open' else args[0], args[0] if name == 'open' else args[1])
            flags = ','.join(args[1:] if name == 'open' else args[2:])
            require(not any(flag in flags for flag in ['O_WRONLY', 'O_RDWR', 'O_CREAT', 'O_TRUNC', 'O_TMPFILE']), 'Producer attempted a write-capable input open')
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
                proc.fds.pop(descriptor, None)
        elif name in ('dup', 'dup2', 'dup3', 'fcntl'):
            if failed:
                raise ValueError('Failed FD mutation/probe')
            if name == 'fcntl' and args[1] not in ('F_DUPFD', 'F_DUPFD_CLOEXEC', 'F_SETFD', 'F_GETFD', 'F_GETFL'):
                raise ValueError('Unsupported FD command: ' + args[1])
            descriptor = number(args[0])
            fd(proc, args[0])
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
        elif name in ('newfstatat', 'statx', 'faccessat', 'faccessat2', 'readlinkat', 'stat', 'lstat', 'access', 'readlink'):
            at = name in ('newfstatat', 'statx', 'faccessat', 'faccessat2', 'readlinkat')
            path = path_at(proc, args[0] if at else 'AT_FDCWD', args[1] if at else args[0])
            check(path, name, failed)
        else:
            raise ValueError('Unsupported traced syscall (not skipped): ' + name)
    require(set(processes) <= exited, 'Trace lacks successful termination for every process/thread group')
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
    return {'purpose': 'bounded-role-read-authentication-facts-not-qa-readiness', 'role': contract.role,
            'processCount': len(processes), 'files': sorted(facts.values(), key=lambda row: (row['category'], row['path'])),
            'actualSourceReadOrMapPaths': sorted(source_reads),
            'closedDirectoryDiscoveries': discoveries, 'explicitToolProbeFailures': failures}
