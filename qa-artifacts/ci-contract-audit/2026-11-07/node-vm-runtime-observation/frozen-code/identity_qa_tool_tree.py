#!/usr/bin/env python3
"""Bound private dependency-tree facts. No Source-A or QA acceptance API.

This first mount adapter uses the SAME absolute physical/namespace root.
The Preparer's per-role app/node_modules mount translation is not implemented.
"""
import json
from pathlib import Path
from types import MappingProxyType

from identity_qa_private_capture import (
    capture_dependencies, dependency_inventory, inventory_digest,
    private_directory, require, verify_private_hardlinks,
)
from identity_qa_read_trace import FileBinding, annotation, calls, c_string

_CAPTURE = object()
_BOUND = object()


def _event_key(event):
    start, end, pid, operation, arguments, result = event
    return start, end, pid, operation, tuple(arguments), result


class CapturedDependencyTree:
    """Minted only by an actual call to the existing capture implementation."""
    __slots__ = ('_token', '_root', '_private_root', '_rows_bytes', '_receipt_bytes', '_tree_sha256')

    def __init__(self, token, root, private_root, rows, receipt):
        require(token is _CAPTURE, 'An actual dependency capture is required')
        object.__setattr__(self, '_token', token)
        object.__setattr__(self, '_root', root)
        object.__setattr__(self, '_private_root', private_root)
        object.__setattr__(self, '_rows_bytes', json.dumps(rows, sort_keys=True, separators=(',', ':')).encode())
        object.__setattr__(self, '_receipt_bytes', json.dumps(receipt, sort_keys=True, separators=(',', ':')).encode())
        object.__setattr__(self, '_tree_sha256', receipt['treeSha256'])

    def __setattr__(self, name, value):
        raise TypeError('Captured dependency tree is immutable')

    @property
    def root(self):
        return self._root

    def verify(self):
        require(self._root.resolve(strict=True) == self._root and not self._root.is_symlink(), 'Captured dependency root changed')
        verify_private_hardlinks(self._private_root)
        rows = dependency_inventory(self._root)
        require(rows == json.loads(self._rows_bytes) and inventory_digest(rows) == self._tree_sha256,
                'Captured dependency membership/type/bytes changed')
        # Reuse the completed capture's internal-alias condition, too.
        for row in rows:
            if row['kind'] == 'symlink':
                require((self._root / row['path']).resolve(strict=True).is_relative_to(self._root),
                        'Captured dependency alias leaves its bound tree')
        return self

    def mount_binding(self):
        self.verify()
        return MappingProxyType({'source':str(self._root), 'target':str(self._root), 'readonly':True,
                                 'treeSha256':self._tree_sha256,
                                 'captureReceiptSha256':inventory_digest(json.loads(self._receipt_bytes))})

    def file_bindings(self):
        self.verify()
        return {str(self._root / row['path']):FileBinding('dependency', row['sha256'],
                'actual private complete dependency capture ' + self._tree_sha256)
                for row in json.loads(self._rows_bytes) if row['kind'] == 'file'}

    def directory_metadata(self):
        operations = frozenset(('statx', 'newfstatat', 'stat', 'lstat'))
        result = {str(self._root):operations}
        result.update({str(self._root / row['path']):operations for row in json.loads(self._rows_bytes) if row['kind'] == 'directory'})
        return result

    def receipt(self):
        return json.loads(self._receipt_bytes)


def capture_dependency_tree(snapshot, source, destination, accepted_tree_sha256, max_bytes, private_root, reserve_bytes=1_000_000_000):
    """Real copy and real Git-lock check; a verified flag/receipt cannot mint it."""
    private_root = Path(private_root).resolve(strict=True)
    destination = Path(destination).absolute()
    require(destination.is_relative_to(private_root) and destination != private_root, 'Dependency capture leaves its private scope')
    parent_relative = destination.parent.relative_to(private_root).as_posix()
    if parent_relative != '.':
        private_directory(private_root, parent_relative)
    receipt = capture_dependencies(snapshot, source, destination, accepted_tree_sha256, max_bytes, reserve_bytes)
    tree = CapturedDependencyTree(_CAPTURE, destination.resolve(strict=True), private_root, receipt['entries'], receipt)
    return tree.verify()


def require_capture(value):
    require(type(value) is CapturedDependencyTree and value._token is _CAPTURE,
            'Actual factory-minted dependency capture is required')
    return value.verify()


class BoundDependencyTree:
    """Actual capture + exact RO mount + genuine launch; no readiness result."""
    __slots__ = ('_token', '_capture', '_launch', '_entries', '_events')

    def __init__(self, token, capture, launch):
        require(token is _BOUND, 'A genuine readonly dependency launch is required')
        object.__setattr__(self, '_token', token)
        object.__setattr__(self, '_capture', capture)
        object.__setattr__(self, '_launch', launch)
        object.__setattr__(self, '_entries', MappingProxyType({row['path']:MappingProxyType(row) for row in json.loads(capture._rows_bytes)}))
        object.__setattr__(self, '_events', frozenset(_event_key(event) for event in calls(launch.trace)))

    def __setattr__(self, name, value):
        raise TypeError('Bound dependency tree is immutable')

    def verify(self, launch, contract=None):
        require(self._token is _BOUND and launch is self._launch, 'Dependency tree belongs to another actual launch')
        self._capture.verify()
        from identity_qa_read_launcher import require_actual_launch
        require_actual_launch(launch, launch.trace, launch.cwd, launch.root, launch.role)
        binding = dict(self._capture.mount_binding())
        require(sum(dict(item) == binding for item in launch.readonly_dependency_mounts) == 1,
                'Exact readonly dependency mount is absent or ambiguous')
        require(not self._capture.root.is_relative_to(launch.root) and not launch.root.is_relative_to(self._capture.root),
                'Curriculum/source root cannot be classified as dependency metadata')
        if contract is not None:
            require(contract.root == launch.root and contract.role == launch.role, 'Dependency role/root binding differs')
            for path, binding in self._capture.file_bindings().items():
                actual = contract.external_files.get(path)
                require(actual is not None and actual.category == 'dependency' and actual.sha256 == binding.sha256,
                        'Dependency file binding is missing or differs')
        return self

    def contains(self, path):
        return Path(path).is_relative_to(self._capture.root)

    def prove_negative_lookup(self, event, path, cwd):
        """Caller is the existing PID/cwd/dirfd trace interpreter, not a scope engine."""
        self.verify(self._launch)
        require(_event_key(event) in self._events, 'Negative lookup is absent from the actual launch trace')
        start, end, pid, operation, args, result = event
        require(result.startswith('-1 ENOENT '), 'Dependency absence needs actual ENOENT')
        at = operation in ('openat', 'statx', 'newfstatat')
        require(operation in ('open', 'openat', 'stat', 'lstat', 'statx', 'newfstatat', 'access'),
                'Unsupported negative dependency metadata operation')
        pathname = c_string(args[1] if at else args[0])
        require(pathname, 'Empty-path metadata is not a locator absence')
        path, cwd = Path(path), Path(cwd)
        if Path(pathname).is_absolute():
            expected = Path(pathname)
        elif not at or args[0].startswith('AT_FDCWD'):
            expected = cwd / pathname
        else:
            directory = annotation(args[0])
            require(directory is not None, 'Relative lookup lacks actual dirfd identity')
            expected = Path(directory) / pathname
        require(expected == path and self.contains(path), 'Negative lookup does not belong to the bound dependency root')
        flags = None
        if operation in ('open', 'openat'):
            flags = args[2] if at else args[1]
            parsed = set(flags.split('|'))
            require('O_RDONLY' in parsed and parsed <= {'O_RDONLY','O_CLOEXEC','O_DIRECTORY','O_NOFOLLOW','O_NONBLOCK','O_LARGEFILE'},
                    'Negative dependency open is not supported readonly metadata')
        elif operation == 'statx':
            flags = args[2]
            require(set(flags.split('|')) <= {'0','AT_SYMLINK_NOFOLLOW','AT_STATX_SYNC_AS_STAT','AT_NO_AUTOMOUNT'},
                    'Unsupported statx metadata flags')
        elif operation == 'newfstatat':
            flags = args[-1]
            require(set(flags.split('|')) <= {'0','AT_SYMLINK_NOFOLLOW','AT_NO_AUTOMOUNT'},
                    'Unsupported fstatat metadata flags')
        elif operation == 'access':
            flags = args[1]
            require(flags in ('F_OK','R_OK'), 'Unsupported access metadata flags')
        pending = list(path.relative_to(self._capture.root).parts)
        resolved, aliases, seen = [], [], set()
        while pending:
            state = (tuple(resolved), tuple(pending))
            require(state not in seen, 'Dependency alias resolution is cyclic')
            seen.add(state)
            part = pending.pop(0)
            if part == '.':
                continue
            if part == '..':
                require(resolved, 'Dependency locator leaves its bound root')
                resolved.pop()
                continue
            relative = '/'.join([*resolved, part])
            entry = self._entries.get(relative)
            if entry is None:
                return {'category':'dependency-metadata-absence', 'role':self._launch.role,
                        'launchTraceSha256':self._launch.trace_sha256, 'root':str(self._capture.root),
                        'treeSha256':self._capture._tree_sha256, 'pid':pid, 'traceEntry':start,
                        'cwd':str(cwd), 'dirfd':args[0] if at else None, 'requestedPath':pathname,
                        'resolvedAttempt':str(path), 'operation':operation, 'flags':flags, 'errno':'ENOENT',
                        'firstMissingComponent':relative, 'lastKnownDirectory':'/'.join(resolved) or '.',
                        'aliasHops':aliases, 'sourceInput':False}
            if entry['kind'] == 'symlink':
                target = entry['target']
                require(target and not target.startswith('/'), 'Dependency alias target is not internal')
                aliases.append({'path':relative, 'target':target})
                pending = list(Path(target).parts) + pending
            elif entry['kind'] == 'directory':
                resolved.append(part)
            else:
                require(not pending, 'Non-directory intermediate does not prove ENOENT')
                raise ValueError('Existing dependency file does not prove absence')
        raise ValueError('Existing dependency directory does not prove absence')


def bind_dependency_tree(capture, launch):
    require_capture(capture)
    from identity_qa_read_launcher import ReadLaunchEvidence, require_actual_launch
    require(type(launch) is ReadLaunchEvidence, 'A genuine actual readonly launch is required')
    require_actual_launch(launch, launch.trace, launch.cwd, launch.root, launch.role)
    result = BoundDependencyTree(_BOUND, capture, launch)
    return result.verify(launch)


def require_bound_tree(value, launch, contract):
    require(type(value) is BoundDependencyTree and value._token is _BOUND, 'A genuine launch-bound dependency tree is required')
    return value.verify(launch, contract)
