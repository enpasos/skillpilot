#!/usr/bin/env python3
"""Run the FWU-to-JSON reverse compiler twice in an isolated namespace.

Only the validated FWU ZIP, its DPK-008c receipt, the byte-bound reverse
compiler, and a tiny sandbox entry point cross the namespace boundary.  The
repository (including the original JSON candidate and ontology checkout) is
masked, networking is unshared, outputs are private, and strace evidence is
retained for both byte-identical builds.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import stat
import struct
import subprocess
import sys
import tempfile
import time
from typing import Any, BinaryIO, Mapping, Sequence
import zipfile


REPO_ROOT = Path(__file__).resolve().parents[1]
RUNNER_PATH = Path(__file__).resolve()
DEFAULT_COMPILER = (
    REPO_ROOT / "scripts/reconstruct_json_curriculum_package_from_fwu_owl.py"
)
SANDBOX_ENTRY = REPO_ROOT / "scripts/fwu_owl_reverse_compiler_sandbox_entry.py"
REPORT_SCHEMA_ID = (
    "https://skillpilot.com/schemas/curriculum-package/v1/"
    "fwu-owl-reverse-compilation-report.schema.json"
)
VALIDATOR_ID = "skillpilot-fwu-owl-reverse-compilation-validator-v1"
COMPILER_ID = "skillpilot-fwu-owl-reverse-compiler-v1"
COMPILER_VERSION = "1.0.0"
RUNNER_ID = "skillpilot-fwu-owl-reverse-hermetic-runner"
RUNNER_VERSION = "1.0.0"
SANDBOX_ENTRY_ID = "skillpilot-fwu-owl-reverse-sandbox-entry"
SANDBOX_ENTRY_VERSION = "1.0.0"
FULL_PACKAGE_VALIDATOR = (
    REPO_ROOT / "scripts/validate_full_standalone_curriculum_package.py"
)
FULL_PACKAGE_VALIDATOR_ID = "skillpilot-full-standalone-package-validator-v2"
FULL_PACKAGE_VALIDATOR_VERSION = "2.0.0"
REPORT_SCHEMA_PATH = (
    REPO_ROOT
    / "contracts/curriculum-package/v1/fwu-owl-reverse-compilation-report.schema.json"
)
REPORT_CONTRACT_VALIDATOR = (
    REPO_ROOT / "scripts/validate_curriculum_fwu_owl_reverse_compilation_contract.py"
)
SOURCE_DATE_EPOCH = 315_532_800
SANDBOX_PYTHON_LINK = Path("/usr/bin/python3")
SANDBOX_PYTHON_MINIMUM = (3, 10)
HOST_ROOT_SENTINELS = (
    "/boot",
    "/data",
    "/etc",
    "/home",
    "/media",
    "/mnt",
    "/root",
    "/run",
    "/srv",
    "/var",
)
FWU_VALIDATOR_ID = "skillpilot-fwu-owl-package-validator-v1"
FWU_GATES = (
    "archive-security",
    "manifest-schema",
    "profile-contract",
    "inventory",
    "contract-bindings",
    "offline-schema-catalog",
    "semantic-content-index",
    "field-registry-coverage",
    "rdf-syntax",
    "rdf-segment-order",
    "rdf-bundle",
    "core-binding",
    "ontology-profile",
    "shacl",
    "owl2-dl",
    "reasoner",
    "binary-sidecars",
    "reproducibility",
)
SANDBOX_ENVIRONMENT = {
    "HOME": "/tmp",
    "LANG": "C.UTF-8",
    "LC_ALL": "C.UTF-8",
    "LOGNAME": "skillpilot",
    "PATH": "/opt/tools",
    "PYTHONHASHSEED": "0",
    "PYTHONNOUSERSITE": "1",
    "SOURCE_DATE_EPOCH": str(SOURCE_DATE_EPOCH),
    "TZ": "UTC",
    "USER": "skillpilot",
}
SHA256_RE = re.compile(r"^[a-f0-9]{64}$")
NETWORK_SYSCALL_RE = re.compile(
    r"\b(?:accept4?|bind|connect|getpeername|getsockname|getsockopt|listen|recvfrom|"
    r"recvmmsg|recvmsg|sendmmsg|sendmsg|sendto|setsockopt|shutdown|socket|socketpair)\("
)
SUCCESSFUL_OPEN_RE = re.compile(
    r'\bopen(?:at2|at)?\([^\n]*?"(/[^"\\]*(?:\\.[^"\\]*)*)"[^\n]*\)\s+=\s+[0-9]+'
)
OPEN_CALL_PATH_RE = re.compile(r'\bopen(?:at2|at)?\([^\n]*?"(/[^"\\]*(?:\\.[^"\\]*)*)"')
TRACE_PID_RE = re.compile(r"^(?:\[pid\s+)?([0-9]+)\]?\s+")
TRACE_CHILD_RE = re.compile(
    r"\b(?:clone|clone3|fork|vfork)\([^\n]*\)\s+=\s+([0-9]+)(?:\s|$)"
)
SANDBOX_ENTRY_EXEC_MARKERS = (
    'execve("/opt/tools/python3", ["/opt/tools/python3", "-I", "-S", "-B", '
    '"/opt/reverse-runner/sandbox-entry.py"',
)
SANDBOX_CORE_EXEC_MARKERS = (
    'execve("/opt/tools/python3", ["/opt/tools/python3", "-I", "-S", "-B", '
    '"/opt/reverse-runner/reconstruct.py"',
)


class InvalidInput(Exception):
    """A supplied package, receipt, path, or compiler violates the contract."""


class RunnerError(Exception):
    """The hermetic runner or a mandatory host tool could not operate."""


def reject_constant(value: str) -> None:
    raise InvalidInput(f"non-finite JSON number {value!r}")


def reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise InvalidInput(f"duplicate JSON key {key!r}")
        result[key] = value
    return result


def load_json_bytes(raw: bytes, label: str) -> Any:
    if len(raw) > 67_108_864:
        raise InvalidInput(f"{label} exceeds 64 MiB")
    try:
        value = json.loads(
            raw.decode("utf-8", "strict"),
            object_pairs_hook=reject_duplicate_keys,
            parse_constant=reject_constant,
        )
    except (UnicodeError, json.JSONDecodeError) as error:
        raise InvalidInput(f"{label} is not strict UTF-8 JSON: {error}") from error
    stack: list[tuple[Any, int]] = [(value, 0)]
    nodes = 0
    while stack:
        current, depth = stack.pop()
        nodes += 1
        if nodes > 5_000_000 or depth > 128:
            raise InvalidInput(f"{label} exceeds bounded JSON shape limits")
        if isinstance(current, float) and not math.isfinite(current):
            raise InvalidInput(f"{label} contains a non-finite number")
        if isinstance(current, dict):
            stack.extend((item, depth + 1) for pair in current.items() for item in pair)
        elif isinstance(current, list):
            stack.extend((item, depth + 1) for item in current)
    return value


def sha256_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def descriptor_identity(metadata: os.stat_result) -> tuple[int, ...]:
    return (
        metadata.st_dev,
        metadata.st_ino,
        metadata.st_mode,
        metadata.st_nlink,
        metadata.st_uid,
        metadata.st_gid,
        metadata.st_size,
        metadata.st_mtime_ns,
        metadata.st_ctime_ns,
    )


def hash_descriptor(descriptor: int, size: int) -> str:
    digest = hashlib.sha256()
    offset = 0
    while offset < size:
        chunk = os.pread(descriptor, min(8 * 1024 * 1024, size - offset), offset)
        if not chunk:
            raise RunnerError("pinned file ended while it was being hashed")
        digest.update(chunk)
        offset += len(chunk)
    if os.pread(descriptor, 1, size):
        raise RunnerError("pinned file grew while it was being hashed")
    return digest.hexdigest()


def open_absolute_directory_chain(path: Path) -> int:
    absolute = Path(os.path.abspath(os.fspath(path)))
    if not absolute.is_absolute() or ".." in absolute.parts:
        raise InvalidInput(f"directory path is not canonical absolute: {path}")
    flags = (
        os.O_RDONLY
        | getattr(os, "O_DIRECTORY", 0)
        | getattr(os, "O_NOFOLLOW", 0)
        | getattr(os, "O_CLOEXEC", 0)
    )
    descriptor = os.open("/", flags)
    try:
        for component in absolute.parts[1:]:
            child = os.open(component, flags, dir_fd=descriptor)
            metadata = os.fstat(child)
            if not stat.S_ISDIR(metadata.st_mode):
                os.close(child)
                raise InvalidInput(f"path component is not a directory: {absolute}")
            os.close(descriptor)
            descriptor = child
        return descriptor
    except BaseException:
        os.close(descriptor)
        raise


def open_or_create_absolute_directory_chain(path: Path) -> int:
    absolute = Path(os.path.abspath(os.fspath(path)))
    if not absolute.is_absolute() or ".." in absolute.parts:
        raise InvalidInput(f"directory path is not canonical absolute: {path}")
    flags = (
        os.O_RDONLY
        | getattr(os, "O_DIRECTORY", 0)
        | getattr(os, "O_NOFOLLOW", 0)
        | getattr(os, "O_CLOEXEC", 0)
    )
    descriptor = os.open("/", flags)
    try:
        for component in absolute.parts[1:]:
            try:
                child = os.open(component, flags, dir_fd=descriptor)
            except FileNotFoundError:
                os.mkdir(component, 0o700, dir_fd=descriptor)
                child = os.open(component, flags, dir_fd=descriptor)
            metadata = os.fstat(child)
            if not stat.S_ISDIR(metadata.st_mode):
                os.close(child)
                raise InvalidInput(f"path component is not a directory: {absolute}")
            os.close(descriptor)
            descriptor = child
        return descriptor
    except BaseException:
        os.close(descriptor)
        raise


class PinnedFile:
    """No-follow file descriptor whose identity and complete bytes stay bound."""

    def __init__(self, path: Path, *, maximum: int, allow_empty: bool = False) -> None:
        self.path = Path(os.path.abspath(os.fspath(path)))
        if not self.path.name:
            raise InvalidInput(f"input path has no filename: {path}")
        try:
            self.anchor_descriptor: int | None = open_absolute_directory_chain(
                self.path.parent
            )
        except OSError as error:
            raise InvalidInput(
                f"cannot open nofollow parent chain for {self.path}: {error}"
            ) from error
        self.anchor_name: str | None = self.path.name
        if not hasattr(os, "O_NOFOLLOW") or not hasattr(os, "pread"):
            os.close(self.anchor_descriptor)
            raise RunnerError("no-follow descriptor binding is unavailable")
        try:
            lexical = os.stat(
                self.anchor_name,
                dir_fd=self.anchor_descriptor,
                follow_symlinks=False,
            )
            if not stat.S_ISREG(lexical.st_mode):
                raise InvalidInput(
                    f"input is not a regular non-symlink file: {self.path}"
                )
            self.descriptor = os.open(
                self.anchor_name,
                os.O_RDONLY | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0),
                dir_fd=self.anchor_descriptor,
            )
        except OSError as error:
            os.close(self.anchor_descriptor)
            self.anchor_descriptor = None
            raise InvalidInput(
                f"cannot open no-follow input {self.path}: {error}"
            ) from error
        except BaseException:
            os.close(self.anchor_descriptor)
            self.anchor_descriptor = None
            raise
        try:
            self._finish_initialization(lexical, maximum, allow_empty)
        except BaseException:
            os.close(self.descriptor)
            os.close(self.anchor_descriptor)
            self.anchor_descriptor = None
            raise

    @classmethod
    def from_directory(
        cls,
        directory_descriptor: int,
        name: str,
        display_path: Path,
        *,
        maximum: int,
        allow_empty: bool = False,
    ) -> "PinnedFile":
        if not name or "/" in name or name in {".", ".."}:
            raise InvalidInput(f"unsafe descriptor-relative filename: {name!r}")
        self = cls.__new__(cls)
        self.path = Path(os.path.abspath(os.fspath(display_path)))
        self.anchor_descriptor = os.dup(directory_descriptor)
        self.anchor_name = name
        try:
            lexical = os.stat(
                name,
                dir_fd=self.anchor_descriptor,
                follow_symlinks=False,
            )
            self.descriptor = os.open(
                name,
                os.O_RDONLY | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0),
                dir_fd=self.anchor_descriptor,
            )
            self._finish_initialization(lexical, maximum, allow_empty)
            return self
        except BaseException:
            if getattr(self, "descriptor", -1) >= 0:
                os.close(self.descriptor)
            os.close(self.anchor_descriptor)
            raise

    def _lexical_stat(self) -> os.stat_result:
        if self.anchor_descriptor is None:
            return os.lstat(self.path)
        return os.stat(
            self.anchor_name,
            dir_fd=self.anchor_descriptor,
            follow_symlinks=False,
        )

    def _finish_initialization(
        self, lexical: os.stat_result, maximum: int, allow_empty: bool
    ) -> None:
        metadata = os.fstat(self.descriptor)
        try:
            if not stat.S_ISREG(metadata.st_mode):
                raise InvalidInput(f"input is not regular: {self.path}")
            if (metadata.st_dev, metadata.st_ino) != (lexical.st_dev, lexical.st_ino):
                raise InvalidInput(
                    f"input path changed while it was opened: {self.path}"
                )
            if (
                metadata.st_size < 0
                or (metadata.st_size == 0 and not allow_empty)
                or metadata.st_size > maximum
            ):
                raise InvalidInput(f"input size is outside its limit: {self.path}")
            self.identity = descriptor_identity(metadata)
            self.path_identity = (lexical.st_dev, lexical.st_ino, lexical.st_mode)
            self.size = metadata.st_size
            self.sha256 = hash_descriptor(self.descriptor, self.size)
            after = os.fstat(self.descriptor)
            lexical_after = self._lexical_stat()
            if (
                descriptor_identity(after) != self.identity
                or (
                    lexical_after.st_dev,
                    lexical_after.st_ino,
                    lexical_after.st_mode,
                )
                != self.path_identity
            ):
                raise InvalidInput(f"input changed during initial hashing: {self.path}")
        except OSError as error:
            raise InvalidInput(
                f"cannot bind descriptor-relative input {self.path}: {error}"
            ) from error

    def read(self, maximum: int | None = None) -> bytes:
        if maximum is not None and self.size > maximum:
            raise InvalidInput(f"input exceeds read limit: {self.path}")
        chunks: list[bytes] = []
        offset = 0
        while offset < self.size:
            chunk = os.pread(
                self.descriptor, min(8 * 1024 * 1024, self.size - offset), offset
            )
            if not chunk:
                raise InvalidInput(f"could not read complete pinned input: {self.path}")
            chunks.append(chunk)
            offset += len(chunk)
        raw = b"".join(chunks)
        self.assert_unchanged()
        return raw

    def duplicate(self) -> BinaryIO:
        return os.fdopen(os.dup(self.descriptor), "rb")

    def assert_unchanged(self) -> None:
        before = descriptor_identity(os.fstat(self.descriptor))
        digest = hash_descriptor(self.descriptor, self.size)
        after = descriptor_identity(os.fstat(self.descriptor))
        try:
            lexical = self._lexical_stat()
        except OSError as error:
            raise InvalidInput(f"pinned input path disappeared: {self.path}") from error
        if (
            before != self.identity
            or after != self.identity
            or (lexical.st_dev, lexical.st_ino, lexical.st_mode) != self.path_identity
            or digest != self.sha256
        ):
            raise InvalidInput(f"pinned input changed during execution: {self.path}")

    def assert_identity_unchanged(self) -> None:
        metadata = os.fstat(self.descriptor)
        try:
            lexical = self._lexical_stat()
        except OSError as error:
            raise InvalidInput(f"pinned input path disappeared: {self.path}") from error
        if (
            descriptor_identity(metadata) != self.identity
            or (lexical.st_dev, lexical.st_ino, lexical.st_mode) != self.path_identity
        ):
            raise InvalidInput(f"pinned input identity changed: {self.path}")

    def binding(self, *, include_path: bool = False) -> dict[str, Any]:
        result: dict[str, Any] = {
            "file": self.path.name,
            "bytes": self.size,
            "sha256": self.sha256,
        }
        if include_path:
            result["path"] = str(self.path)
        return result

    def close(self) -> None:
        if getattr(self, "descriptor", -1) >= 0:
            os.close(self.descriptor)
            self.descriptor = -1
        if getattr(self, "anchor_descriptor", None) is not None:
            os.close(self.anchor_descriptor)
            self.anchor_descriptor = None

    def __enter__(self) -> "PinnedFile":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()


def absolute_without_resolving(path: Path) -> Path:
    expanded = path.expanduser()
    if ".." in expanded.parts:
        raise InvalidInput(f"path must not contain '..': {path}")
    return Path(os.path.abspath(os.fspath(expanded)))


def assert_no_symlink_components(path: Path) -> None:
    absolute = absolute_without_resolving(path)
    cursor = Path(absolute.anchor)
    for component in absolute.parts[1:]:
        cursor /= component
        try:
            metadata = os.lstat(cursor)
        except FileNotFoundError:
            return
        except OSError as error:
            raise InvalidInput(
                f"cannot inspect path component {cursor}: {error}"
            ) from error
        if stat.S_ISLNK(metadata.st_mode):
            raise InvalidInput(f"symlink path component is forbidden: {cursor}")


def ensure_directory(path: Path) -> Path:
    absolute = absolute_without_resolving(path)
    descriptor = open_or_create_absolute_directory_chain(absolute)
    os.close(descriptor)
    return absolute


def create_fresh_private_directory(path: Path) -> Path:
    absolute = absolute_without_resolving(path)
    parent_descriptor = open_or_create_absolute_directory_chain(absolute.parent)
    try:
        os.mkdir(absolute.name, 0o700, dir_fd=parent_descriptor)
    except FileExistsError as error:
        os.close(parent_descriptor)
        raise InvalidInput(
            f"output directory must be fresh and absent: {absolute}"
        ) from error
    try:
        descriptor = os.open(
            absolute.name,
            os.O_RDONLY
            | getattr(os, "O_DIRECTORY", 0)
            | getattr(os, "O_NOFOLLOW", 0)
            | getattr(os, "O_CLOEXEC", 0),
            dir_fd=parent_descriptor,
        )
    finally:
        os.close(parent_descriptor)
    metadata = os.fstat(descriptor)
    if not stat.S_ISDIR(metadata.st_mode):
        os.close(descriptor)
        raise RunnerError(f"could not create private output directory: {absolute}")
    os.fchmod(descriptor, 0o700)
    os.close(descriptor)
    return absolute


def safe_atomic_write(path: Path, raw: bytes) -> None:
    absolute = absolute_without_resolving(path)
    parent_descriptor = open_or_create_absolute_directory_chain(absolute.parent)
    try:
        existing = os.stat(
            absolute.name, dir_fd=parent_descriptor, follow_symlinks=False
        )
    except FileNotFoundError:
        existing = None
    if existing is not None and not stat.S_ISREG(existing.st_mode):
        os.close(parent_descriptor)
        raise InvalidInput(f"unsafe report target: {absolute}")
    temporary = f".{absolute.name}.tmp-{os.getpid()}"
    descriptor = os.open(
        temporary,
        os.O_WRONLY
        | os.O_CREAT
        | os.O_EXCL
        | getattr(os, "O_NOFOLLOW", 0)
        | getattr(os, "O_CLOEXEC", 0),
        0o600,
        dir_fd=parent_descriptor,
    )
    try:
        with os.fdopen(descriptor, "wb", closefd=False) as handle:
            handle.write(raw)
            handle.flush()
            os.fsync(handle.fileno())
    finally:
        os.close(descriptor)
    os.replace(
        temporary,
        absolute.name,
        src_dir_fd=parent_descriptor,
        dst_dir_fd=parent_descriptor,
    )
    os.fsync(parent_descriptor)
    os.close(parent_descriptor)


def safe_atomic_write_at(directory_descriptor: int, name: str, raw: bytes) -> None:
    if not name or "/" in name or name in {".", ".."}:
        raise InvalidInput(f"unsafe descriptor-relative output name: {name!r}")
    temporary = f".{name}.tmp-{os.getpid()}"
    descriptor = os.open(
        temporary,
        os.O_WRONLY
        | os.O_CREAT
        | os.O_EXCL
        | getattr(os, "O_NOFOLLOW", 0)
        | getattr(os, "O_CLOEXEC", 0),
        0o600,
        dir_fd=directory_descriptor,
    )
    try:
        with os.fdopen(descriptor, "wb", closefd=False) as handle:
            handle.write(raw)
            handle.flush()
            os.fsync(handle.fileno())
    finally:
        os.close(descriptor)
    os.replace(
        temporary,
        name,
        src_dir_fd=directory_descriptor,
        dst_dir_fd=directory_descriptor,
    )
    os.fsync(directory_descriptor)


def require_tool(name: str) -> Path:
    candidate = shutil.which(name)
    if candidate is None:
        raise RunnerError(f"required hermetic runner tool is unavailable: {name}")
    try:
        path = Path(candidate).resolve(strict=True)
    except OSError as error:
        raise RunnerError(f"cannot resolve required tool {name}: {error}") from error
    assert_no_symlink_components(path)
    metadata = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(metadata.st_mode) or metadata.st_mode & 0o111 == 0:
        raise RunnerError(f"required tool is not a regular executable: {path}")
    return path


def require_sandbox_python() -> Path:
    """Resolve the distribution Python used only inside the minimal namespace."""

    try:
        path = SANDBOX_PYTHON_LINK.resolve(strict=True)
    except OSError as error:
        raise RunnerError(
            f"required sandbox Python is unavailable at {SANDBOX_PYTHON_LINK}: {error}"
        ) from error
    assert_no_symlink_components(path)
    try:
        path.relative_to("/usr")
    except ValueError as error:
        raise RunnerError(
            f"sandbox Python must resolve below /usr: {SANDBOX_PYTHON_LINK} -> {path}"
        ) from error
    metadata = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(metadata.st_mode) or metadata.st_mode & 0o111 == 0:
        raise RunnerError(f"sandbox Python is not a regular executable: {path}")
    return path


def validate_sandbox_python(python: PinnedFile) -> dict[str, Any]:
    """Execute the pinned descriptor and require a stdlib-capable Python >= 3.10."""

    # The independent validator deliberately rejects /proc/self/fd aliases as
    # symlink inputs.  It opens these lexical paths through its own no-follow
    # directory chain; this runner keeps the original output/evidence dirfds
    # pinned and rechecks the output binding before accepting its receipt.
    command = [
        f"/proc/self/fd/{python.descriptor}",
        "-I",
        "-S",
        "-B",
        "-c",
        (
            "import json,sqlite3,sys,sysconfig,zipfile;"
            "print(json.dumps({"
            "'version':list(sys.version_info[:3]),"
            "'stdlib':sysconfig.get_path('stdlib'),"
            "'platstdlib':sysconfig.get_path('platstdlib'),"
            "'multiarch':sysconfig.get_config_var('MULTIARCH')"
            "},sort_keys=True,separators=(',',':')))"
        ),
    ]
    try:
        result = subprocess.run(
            command,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=30,
            check=False,
            pass_fds=(python.descriptor,),
            env={
                "LANG": "C.UTF-8",
                "LC_ALL": "C.UTF-8",
                "PATH": "/usr/bin",
                "TZ": "UTC",
            },
        )
    except (OSError, subprocess.SubprocessError) as error:
        raise RunnerError(f"cannot execute pinned sandbox Python: {error}") from error
    try:
        value = json.loads(result.stdout.strip())
        version = tuple(value["version"])
    except (json.JSONDecodeError, KeyError, TypeError) as error:
        raise RunnerError(
            "pinned sandbox Python did not emit its strict runtime identity: "
            + result.stdout[-1_000:]
        ) from error
    if (
        result.returncode != 0
        or len(version) != 3
        or any(not isinstance(item, int) for item in version)
        or version[:2] < SANDBOX_PYTHON_MINIMUM
    ):
        raise RunnerError(
            "sandbox Python must be executable, stdlib-complete, and >= 3.10: "
            f"exit={result.returncode}, version={version!r}"
        )
    if not isinstance(value, dict):
        raise RunnerError("sandbox Python runtime identity is not an object")
    for key in ("stdlib", "platstdlib", "multiarch"):
        if not isinstance(value.get(key), str) or not value[key]:
            raise RunnerError(f"sandbox Python did not report a usable {key}")
    python.assert_unchanged()
    return value


def sandbox_runtime_roots(python_info: Mapping[str, Any]) -> tuple[Path, ...]:
    """Return only the stdlib and native-library trees needed by system Python."""

    multiarch = str(python_info["multiarch"])
    required = {
        Path(str(python_info["stdlib"])),
        Path("/usr/lib") / multiarch,
    }
    candidates = {
        *required,
        Path(str(python_info["platstdlib"])),
        Path("/usr/lib64"),
    }
    roots: list[Path] = []
    for candidate in sorted(candidates, key=str):
        try:
            resolved = candidate.resolve(strict=True)
            metadata = resolved.stat(follow_symlinks=False)
        except FileNotFoundError:
            if candidate in required:
                raise RunnerError(
                    f"required sandbox runtime root is unavailable: {candidate}"
                )
            continue
        except OSError as error:
            raise RunnerError(
                f"cannot inspect sandbox runtime root {candidate}: {error}"
            ) from error
        try:
            below_usr_lib = resolved.is_relative_to("/usr/lib")
        except AttributeError:
            below_usr_lib = Path("/usr/lib") in resolved.parents
        if not below_usr_lib and resolved != Path("/usr/lib64"):
            raise RunnerError(
                f"sandbox runtime root must resolve below /usr/lib: {candidate} -> {resolved}"
            )
        assert_no_symlink_components(resolved)
        if (
            not stat.S_ISDIR(metadata.st_mode)
            or metadata.st_uid != 0
            or metadata.st_mode & 0o022
        ):
            raise RunnerError(
                f"sandbox runtime root must be a root-owned non-writable directory: {candidate}"
            )
        roots.append(resolved)
    return tuple(roots)


def sandbox_runtime_symlinks(
    runtime_roots: Sequence[Path],
) -> tuple[tuple[str, str], ...]:
    links = [("usr/lib", "/lib")]
    if Path("/usr/lib64") in runtime_roots:
        links.append(("usr/lib64", "/lib64"))
    return tuple(links)


def sandbox_root_entries(
    runtime_roots: Sequence[Path], runtime_symlinks: Sequence[tuple[str, str]]
) -> list[str]:
    entries = {"dev", "opt", "proc", "tmp", "usr"}
    entries.update(Path(destination).name for _, destination in runtime_symlinks)
    if not runtime_roots:
        raise RunnerError("sandbox runtime mount set is empty")
    return sorted(entries)


def paths_overlap(first: Path, second: Path) -> bool:
    first_resolved = first.resolve(strict=False)
    second_resolved = second.resolve(strict=False)
    return (
        first_resolved == second_resolved
        or first_resolved in second_resolved.parents
        or second_resolved in first_resolved.parents
    )


def validate_path_layout(args: argparse.Namespace) -> None:
    full_validator_path = absolute_without_resolving(
        getattr(args, "full_validator", FULL_PACKAGE_VALIDATOR)
    )
    input_paths = [
        absolute_without_resolving(args.fwu_owl_zip),
        absolute_without_resolving(args.validation_report),
        absolute_without_resolving(args.compiler),
        absolute_without_resolving(SANDBOX_ENTRY),
        full_validator_path,
    ]
    for path in input_paths:
        assert_no_symlink_components(path)
        try:
            metadata = os.lstat(path)
        except OSError as error:
            raise InvalidInput(
                f"required input is unavailable: {path}: {error}"
            ) from error
        if not stat.S_ISREG(metadata.st_mode):
            raise InvalidInput(f"required input is not a regular file: {path}")
    for index, first in enumerate(input_paths):
        for second in input_paths[index + 1 :]:
            first_metadata = os.stat(first, follow_symlinks=False)
            second_metadata = os.stat(second, follow_symlinks=False)
            if (first_metadata.st_dev, first_metadata.st_ino) == (
                second_metadata.st_dev,
                second_metadata.st_ino,
            ):
                raise InvalidInput(f"input aliases are forbidden: {first} / {second}")

    output = absolute_without_resolving(args.output_dir)
    evidence = absolute_without_resolving(args.evidence_dir)
    report = absolute_without_resolving(args.report)
    for path in (output, evidence, report):
        assert_no_symlink_components(path)
    if output.exists() or evidence.exists():
        raise InvalidInput(
            "output and evidence directories must both be fresh and absent"
        )
    if paths_overlap(output, evidence):
        raise InvalidInput("output and evidence directories must be disjoint")
    if (
        report == output
        or report == evidence
        or report in output.parents
        or report in evidence.parents
    ):
        raise InvalidInput(
            "external report may not be an ancestor of private output roots"
        )
    if output in report.parents or evidence in report.parents:
        raise InvalidInput("external report must be outside private output roots")
    if output.parent != report.parent or evidence.parent != report.parent:
        raise InvalidInput(
            "output, evidence, and report must be direct siblings under one pinned parent"
        )
    for input_path in input_paths:
        if paths_overlap(output, input_path) or paths_overlap(evidence, input_path):
            raise InvalidInput(f"private output root overlaps an input: {input_path}")
        if report.resolve(strict=False) == input_path.resolve(strict=True):
            raise InvalidInput(f"external report aliases an input: {input_path}")
    try:
        output.resolve(strict=False).relative_to(report.parent.resolve(strict=False))
        evidence.resolve(strict=False).relative_to(report.parent.resolve(strict=False))
    except ValueError as error:
        raise InvalidInput(
            "output and evidence roots must be below the report parent"
        ) from error
    args.fwu_owl_zip, args.validation_report, args.compiler = input_paths[:3]
    args.full_validator = full_validator_path
    args.output_dir, args.evidence_dir, args.report = output, evidence, report


def report_relative(path: Path, report: Path) -> str:
    try:
        relative = path.resolve(strict=True).relative_to(
            report.parent.resolve(strict=True)
        )
    except (OSError, ValueError) as error:
        raise RunnerError(
            f"evidence path is outside the report root: {path}"
        ) from error
    return relative.as_posix()


def validate_fwu_receipt(
    fwu: PinnedFile, receipt: PinnedFile
) -> tuple[dict[str, Any], str, str]:
    value = load_json_bytes(receipt.read(67_108_864), "DPK-008c validation receipt")
    if not isinstance(value, dict):
        raise InvalidInput("DPK-008c validation receipt must be an object")
    if (
        value.get("validatorId") != FWU_VALIDATOR_ID
        or value.get("reportFormatVersion") != 1
        or value.get("status") != "valid"
        or value.get("diagnostics") != []
    ):
        raise InvalidInput("DPK-008c receipt is not a clean validator-v1 success")
    report_input = value.get("input")
    package = value.get("package")
    if not isinstance(report_input, dict) or not isinstance(package, dict):
        raise InvalidInput("DPK-008c receipt lacks bound input/package identities")
    manifest_sha = report_input.get("manifestSha256")
    content_digest = package.get("contentDigest")
    if (
        report_input.get("bytes") != fwu.size
        or report_input.get("sha256") != fwu.sha256
        or not isinstance(manifest_sha, str)
        or SHA256_RE.fullmatch(manifest_sha) is None
        or not isinstance(content_digest, str)
        or re.fullmatch(r"sha256:[a-f0-9]{64}", content_digest) is None
    ):
        raise InvalidInput("DPK-008c receipt does not bind the supplied FWU ZIP")
    gates = value.get("gates")
    if not isinstance(gates, list) or [
        item.get("id") for item in gates if isinstance(item, dict)
    ] != list(FWU_GATES):
        raise InvalidInput("DPK-008c receipt does not carry the exact ordered 18 gates")
    if any(
        not isinstance(item, dict) or item.get("status") != "passed" for item in gates
    ):
        raise InvalidInput("DPK-008c receipt has a non-passing production gate")
    binding = {
        "path": str(receipt.path),
        "bytes": receipt.size,
        "sha256": receipt.sha256,
        "validatorId": FWU_VALIDATOR_ID,
        "reportFormatVersion": 1,
        "status": "valid",
        "packageZipSha256": fwu.sha256,
        "manifestSha256": manifest_sha,
        "gates": [{"id": gate, "status": "passed"} for gate in FWU_GATES],
    }
    return binding, manifest_sha, content_digest


def derive_core_report_expectations(
    fwu: PinnedFile, receipt_value: Mapping[str, Any]
) -> dict[str, Any]:
    package = receipt_value.get("package")
    if not isinstance(package, dict):
        raise InvalidInput("DPK-008c receipt lacks package metadata")
    registry_binding = package.get("fieldSemanticsRegistry")
    source_binding = package.get("sourceJsonPackage")
    archive_root = package.get("archiveRoot")
    if (
        not isinstance(registry_binding, dict)
        or not isinstance(source_binding, dict)
        or not isinstance(archive_root, str)
        or not archive_root.endswith(".fwu-owl")
    ):
        raise InvalidInput("DPK-008c receipt lacks Core-report source bindings")
    registry_path = registry_binding.get("path")
    if (
        not isinstance(registry_path, str)
        or registry_path.startswith("/")
        or ".." in Path(registry_path).parts
    ):
        raise InvalidInput("DPK-008c receipt has an unsafe registry path")
    try:
        with (
            fwu.duplicate() as handle,
            zipfile.ZipFile(handle, "r", allowZip64=False) as archive,
        ):
            registry_raw = archive.read(f"{archive_root}/{registry_path}")
    except (KeyError, OSError, zipfile.BadZipFile) as error:
        raise InvalidInput(
            f"cannot read bound registry from FWU ZIP: {error}"
        ) from error
    if len(registry_raw) != registry_binding.get("bytes") or sha256_bytes(
        registry_raw
    ) != registry_binding.get("sha256"):
        raise InvalidInput("FWU registry bytes differ from DPK-008c receipt")
    registry = load_json_bytes(registry_raw, "embedded FWU field registry")
    if not isinstance(registry, dict) or not isinstance(registry.get("entries"), list):
        raise InvalidInput("embedded FWU field registry is malformed")
    release_id = package.get("releaseId")
    if not isinstance(release_id, str):
        raise InvalidInput("DPK-008c receipt lacks releaseId")
    return {
        "sourceFwuOwl": {
            "bytes": fwu.size,
            "sha256": fwu.sha256,
            "manifestSha256": package.get("manifestSha256"),
            "releaseId": release_id,
            "contentDigest": package.get("contentDigest"),
        },
        "registry": {
            "id": registry.get("registryId"),
            "version": registry.get("version"),
            "sha256": sha256_bytes(registry_raw),
            "entryCount": len(registry["entries"]),
        },
    }


def pinned_file_binding(
    pinned: PinnedFile, path: Path, report: Path | None = None
) -> dict[str, Any]:
    pinned.assert_unchanged()
    return {
        "path": report_relative(path, report) if report is not None else str(path),
        "bytes": pinned.size,
        "sha256": pinned.sha256,
    }


def single_file_tree_manifest(
    root: Path, path: Path, pinned: PinnedFile
) -> dict[str, Any]:
    digest = hashlib.sha256()
    relative = path.relative_to(root).as_posix()
    digest.update(relative.encode("utf-8"))
    digest.update(b"\0")
    digest.update(str(pinned.size).encode("ascii"))
    digest.update(b"\0")
    digest.update(pinned.sha256.encode("ascii"))
    digest.update(b"\n")
    return {
        "formatVersion": 1,
        "bytes": pinned.size,
        "sha256": digest.hexdigest(),
        "files": [{"path": relative, "bytes": pinned.size, "sha256": pinned.sha256}],
    }


def parse_checksum_rows(raw: bytes) -> dict[str, str]:
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeError as error:
        raise InvalidInput("reconstructed SHA256SUMS is not UTF-8") from error
    if not text.endswith("\n") or "\r" in text:
        raise InvalidInput("reconstructed SHA256SUMS is not canonical LF text")
    result: dict[str, str] = {}
    for line in text.splitlines():
        match = re.fullmatch(r"([a-f0-9]{64})  ([^\r\n]+)", line)
        if match is None or match.group(2) in result:
            raise InvalidInput("reconstructed SHA256SUMS has a malformed/duplicate row")
        result[match.group(2)] = match.group(1)
    if list(result) != sorted(result):
        raise InvalidInput("reconstructed SHA256SUMS is not path-sorted")
    return result


def inspect_reconstructed_zip(
    path: Path,
    *,
    expected_content_digest: str,
    expected_counts: Mapping[str, int] | None,
    pinned: PinnedFile | None = None,
) -> tuple[dict[str, Any], PinnedFile, str]:
    if not path.name.endswith(".reconstructed.json.zip"):
        raise InvalidInput(
            "reconstructed package name must end in .reconstructed.json.zip: "
            f"{path.name}"
        )
    if pinned is None:
        pinned = PinnedFile(path, maximum=3_500_000_000)
    try:
        with (
            pinned.duplicate() as handle,
            zipfile.ZipFile(handle, "r", allowZip64=False) as archive,
        ):
            infos = archive.infolist()
            names = [item.filename for item in infos]
            if not names or names != sorted(names) or len(names) != len(set(names)):
                raise InvalidInput(
                    "reconstructed ZIP inventory is empty, unsorted, or duplicated"
                )
            if any(item.is_dir() or item.filename.endswith("/") for item in infos):
                raise InvalidInput("reconstructed ZIP contains a directory entry")
            roots = {name.split("/", 1)[0] for name in names if "/" in name}
            if len(roots) != 1:
                raise InvalidInput("reconstructed ZIP has no exact archive root")
            root = next(iter(roots))
            if not root.endswith(".json") or any(
                not name.startswith(root + "/") for name in names
            ):
                raise InvalidInput(
                    "reconstructed ZIP root is not one closed *.json root"
                )

            def read(relative: str, maximum: int = 67_108_864) -> bytes:
                try:
                    info = archive.getinfo(f"{root}/{relative}")
                except KeyError as error:
                    raise InvalidInput(f"reconstructed ZIP lacks {relative}") from error
                if info.file_size > maximum:
                    raise InvalidInput(f"reconstructed entry exceeds limit: {relative}")
                return archive.read(info)

            manifest_raw = read("metadata/manifest.json")
            manifest = load_json_bytes(manifest_raw, "reconstructed manifest")
            if not isinstance(manifest, dict) or not isinstance(
                manifest.get("files"), list
            ):
                raise InvalidInput("reconstructed manifest lacks a files inventory")
            checksum_rows = parse_checksum_rows(read("metadata/SHA256SUMS"))
            relative_names = {name[len(root) + 1 :] for name in names}
            manifest_paths = [
                item.get("path") if isinstance(item, dict) else None
                for item in manifest["files"]
            ]
            if (
                any(not isinstance(item, str) for item in manifest_paths)
                or len(set(manifest_paths)) != len(manifest_paths)
                or set(manifest_paths)
                != relative_names - {"metadata/manifest.json", "metadata/SHA256SUMS"}
            ):
                raise InvalidInput(
                    "reconstructed manifest is not the exact non-self inventory"
                )
            if set(checksum_rows) != relative_names - {"metadata/SHA256SUMS"}:
                raise InvalidInput(
                    "reconstructed SHA256SUMS is not the exact non-self inventory"
                )
            if checksum_rows.get("metadata/manifest.json") != sha256_bytes(
                manifest_raw
            ):
                raise InvalidInput(
                    "reconstructed SHA256SUMS does not bind its manifest"
                )
            index_records = [
                item
                for item in manifest["files"]
                if isinstance(item, dict)
                and item.get("role") == "semantic-content-index"
            ]
            if len(index_records) != 1:
                raise InvalidInput(
                    "reconstructed manifest lacks one semantic-content-index record"
                )
            index_binding = index_records[0]
            if (
                not isinstance(index_binding.get("path"), str)
                or index_binding.get("mediaType") != "application/json"
                or index_binding.get("runtimeRequired") is not True
                or index_binding.get("validationSchemaId")
                != "https://skillpilot.com/schemas/curriculum-package/v1/semantic-content-index.schema.json"
                or index_binding.get("semanticBinding")
                != {"kind": "excluded-generated"}
            ):
                raise InvalidInput(
                    "reconstructed semantic-content-index record has an invalid binding"
                )
            index_raw = read(index_binding["path"])
            if index_binding.get("bytes") != len(index_raw) or index_binding.get(
                "sha256"
            ) != sha256_bytes(index_raw):
                raise InvalidInput(
                    "reconstructed semantic-content-index record hash/size differs"
                )
            semantic_index = load_json_bytes(
                index_raw, "reconstructed semantic content index"
            )
            if not isinstance(semantic_index, dict):
                raise InvalidInput(
                    "reconstructed semantic content index is not an object"
                )
            logical = semantic_index.get("logicalArtifacts")
            binary_index = semantic_index.get("binaryResources")
            if not isinstance(logical, list) or not isinstance(binary_index, list):
                raise InvalidInput(
                    "reconstructed semantic content index lacks artifact arrays"
                )
            content_digest = manifest.get("contentDigest")
            if (
                content_digest != expected_content_digest
                or semantic_index.get("contentDigest") != content_digest
            ):
                raise InvalidInput(
                    "reconstructed package changed the bound semantic content digest"
                )
            binary_files = [
                item
                for item in manifest["files"]
                if isinstance(item, dict) and item.get("role") == "binary-asset"
            ]
            counts = {
                "zipEntries": len(infos),
                "manifestFiles": len(manifest["files"]),
                "checksumRows": len(checksum_rows),
                "logicalArtifacts": len(logical),
                "binaryResources": len(binary_files),
                "binaryBytes": sum(int(item.get("bytes", 0)) for item in binary_files),
            }
            if len(binary_index) != counts["binaryResources"]:
                raise InvalidInput(
                    "reconstructed binary-asset/resource counts disagree"
                )
            if expected_counts is not None:
                differences = {
                    key: {"expected": expected, "actual": counts[key]}
                    for key, expected in expected_counts.items()
                    if counts[key] != expected
                }
                if differences:
                    raise InvalidInput(
                        f"reconstructed package counts differ from explicit expectations: {differences!r}"
                    )
            output = {
                "path": "",  # Filled only after the caller establishes report locality.
                "bytes": pinned.size,
                "sha256": pinned.sha256,
                "manifestSha256": sha256_bytes(manifest_raw),
                "contentDigest": content_digest,
                "counts": counts,
            }
            pinned.assert_unchanged()
            return output, pinned, root
    except BaseException:
        pinned.close()
        raise


def open_directory_descriptor(path: Path) -> tuple[int, tuple[int, ...]]:
    descriptor = open_absolute_directory_chain(path)
    metadata = os.fstat(descriptor)
    if not stat.S_ISDIR(metadata.st_mode):
        os.close(descriptor)
        raise RunnerError(f"private output descriptor is not a directory: {path}")
    return descriptor, (
        metadata.st_dev,
        metadata.st_ino,
        metadata.st_mode,
        metadata.st_uid,
        metadata.st_gid,
    )


def open_child_directory_descriptor(
    parent_descriptor: int, name: str
) -> tuple[int, tuple[int, ...]]:
    if not name or "/" in name or name in {".", ".."}:
        raise InvalidInput(f"unsafe child directory name: {name!r}")
    descriptor = os.open(
        name,
        os.O_RDONLY
        | getattr(os, "O_DIRECTORY", 0)
        | getattr(os, "O_NOFOLLOW", 0)
        | getattr(os, "O_CLOEXEC", 0),
        dir_fd=parent_descriptor,
    )
    metadata = os.fstat(descriptor)
    if not stat.S_ISDIR(metadata.st_mode):
        os.close(descriptor)
        raise RunnerError(f"child descriptor is not a directory: {name}")
    return descriptor, (
        metadata.st_dev,
        metadata.st_ino,
        metadata.st_mode,
        metadata.st_uid,
        metadata.st_gid,
    )


def directory_descriptor_identity(descriptor: int) -> tuple[int, ...]:
    metadata = os.fstat(descriptor)
    return (
        metadata.st_dev,
        metadata.st_ino,
        metadata.st_mode,
        metadata.st_uid,
        metadata.st_gid,
    )


def assert_directory_path_identity(
    path: Path, descriptor: int, expected: tuple[int, ...]
) -> None:
    parent_descriptor = open_absolute_directory_chain(path.parent)
    try:
        lexical = os.stat(path.name, dir_fd=parent_descriptor, follow_symlinks=False)
    except OSError as error:
        os.close(parent_descriptor)
        raise RunnerError(
            f"private directory path disappeared: {path}: {error}"
        ) from error
    os.close(parent_descriptor)
    lexical_identity = (
        lexical.st_dev,
        lexical.st_ino,
        lexical.st_mode,
        lexical.st_uid,
        lexical.st_gid,
    )
    if (
        directory_descriptor_identity(descriptor) != expected
        or lexical_identity != expected
        or not stat.S_ISDIR(lexical.st_mode)
    ):
        raise RunnerError(f"private directory path identity changed: {path}")


def trace_mentions_path(line: str, path: str) -> bool:
    """Match one quoted absolute path itself or a child, never a substring."""

    return re.search(r'"' + re.escape(path) + r"(?:/|\")", line) is not None


def trace_audit(trace: Path, forbidden_paths: Sequence[str]) -> tuple[int, int]:
    try:
        text = trace.read_text(encoding="utf-8", errors="strict")
    except (OSError, UnicodeError) as error:
        raise RunnerError(f"cannot read sandbox trace {trace}: {error}") from error
    return trace_text_audit(text, forbidden_paths)


def trace_text_audit(text: str, forbidden_paths: Sequence[str]) -> tuple[int, int]:
    # The trace selector contains only file and network syscalls.  Count every
    # network syscall, including AF_UNIX/AF_NETLINK and unsuccessful attempts.
    network_attempts = sum(
        1 for line in text.splitlines() if NETWORK_SYSCALL_RE.search(line)
    )
    forbidden_reads = 0
    pending_forbidden: set[int] = set()
    for line in text.splitlines():
        pid_match = TRACE_PID_RE.match(line)
        pid = int(pid_match.group(1)) if pid_match is not None else -1
        if pid in pending_forbidden and "<... " in line and " resumed>" in line:
            pending_forbidden.remove(pid)
            if "= -1 ENOENT" not in line and "= -1 ENOTDIR" not in line:
                forbidden_reads += 1
            continue
        if not any(trace_mentions_path(line, path) for path in forbidden_paths):
            continue
        if "execve(" in line:
            # Masked sentinels are argv values for the namespace probe; their
            # appearance in execve does not constitute a filesystem read.
            continue
        if "<unfinished ...>" in line:
            pending_forbidden.add(pid)
            continue
        # The sandbox entry deliberately probes each masked sentinel.  Only a
        # failed lookup is permitted; a successful stat/open is a data leak.
        if "= -1 ENOENT" not in line and "= -1 ENOTDIR" not in line:
            forbidden_reads += 1
    forbidden_reads += len(pending_forbidden)
    return network_attempts, forbidden_reads


def filter_sandbox_trace(raw: bytes) -> tuple[bytes, dict[str, Any]]:
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeError as error:
        raise RunnerError(f"host raw trace is not UTF-8: {error}") from error
    if not text.endswith("\n"):
        raise RunnerError("host raw trace is not canonical LF text")
    active: set[int] = set()
    parents: dict[int, int | None] = {}
    process_records: dict[int, dict[str, Any]] = {}
    selected: list[str] = []
    for line in text.splitlines():
        pid_match = TRACE_PID_RE.match(line)
        if pid_match is None:
            continue
        pid = int(pid_match.group(1))
        entry_exec = all(marker in line for marker in SANDBOX_ENTRY_EXEC_MARKERS)
        core_exec = all(marker in line for marker in SANDBOX_CORE_EXEC_MARKERS)
        if entry_exec:
            active.add(pid)
            parents.setdefault(pid, None)
            process_records[pid] = {
                "tracePid": pid,
                "parentTracePid": parents[pid],
                "role": "entry",
                "execveLineSha256": sha256_bytes(line.encode("utf-8")),
            }
        if core_exec and pid not in active:
            entry_pids = [
                item["tracePid"]
                for item in process_records.values()
                if item["role"] == "entry"
            ]
            if len(entry_pids) == 1:
                active.add(pid)
                parents[pid] = entry_pids[0]
        if pid not in active:
            continue
        selected.append(line)
        child_match = TRACE_CHILD_RE.search(line)
        if child_match is not None:
            child = int(child_match.group(1))
            active.add(child)
            parents[child] = pid
        if core_exec:
            process_records[pid] = {
                "tracePid": pid,
                "parentTracePid": parents.get(pid),
                "role": "core",
                "execveLineSha256": sha256_bytes(line.encode("utf-8")),
            }
    roles = [record["role"] for record in process_records.values()]
    if roles.count("entry") != 1 or roles.count("core") != 1 or not selected:
        diagnostic = [
            line
            for line in text.splitlines()
            if "execve(" in line or TRACE_CHILD_RE.search(line)
        ][-20:]
        raise RunnerError(
            "host trace did not recover exactly one sandbox Entry/Core tree: "
            + " | ".join(diagnostic)
        )
    filtered = ("\n".join(selected) + "\n").encode("utf-8")
    manifest = {
        "manifestId": "skillpilot-sandbox-trace-process-tree-v1",
        "formatVersion": 1,
        "sourceTrace": {"bytes": len(raw), "sha256": sha256_bytes(raw)},
        "entrypoint": {
            "executable": "/opt/tools/python3",
            "script": "/opt/reverse-runner/sandbox-entry.py",
        },
        "processes": sorted(
            process_records.values(), key=lambda item: item["tracePid"]
        ),
        "filteredTrace": {
            "bytes": len(filtered),
            "sha256": sha256_bytes(filtered),
            "lineCount": len(selected),
        },
    }
    return filtered, manifest


def runtime_closure_manifest(
    trace_raw: bytes,
    runtime_roots: Sequence[Path],
    runtime_symlinks: Sequence[tuple[str, str]],
    sandbox_python: PinnedFile,
    python_info: Mapping[str, Any],
    python_elf_interpreter: Mapping[str, Any],
    trace_tool_runtime: Mapping[str, Any],
) -> dict[str, Any]:
    try:
        lines = trace_raw.decode("utf-8", "strict").splitlines()
    except UnicodeError as error:
        raise RunnerError(f"runtime trace is not UTF-8: {error}") from error
    traced_paths: set[str] = set()
    pending_paths: dict[int, str] = {}
    for line in lines:
        match = SUCCESSFUL_OPEN_RE.search(line)
        if match is not None:
            traced_paths.add(match.group(1))
            continue
        pid_match = TRACE_PID_RE.match(line)
        pid = int(pid_match.group(1)) if pid_match is not None else -1
        call_match = OPEN_CALL_PATH_RE.search(line)
        if call_match is not None and "<unfinished ...>" in line:
            pending_paths[pid] = call_match.group(1)
            continue
        if pid in pending_paths and "<... " in line and " resumed>" in line:
            raw_result = line.rsplit("=", 1)[-1].strip()
            if re.match(r"[0-9]+(?:<|\s|$)", raw_result):
                traced_paths.add(pending_paths[pid])
            pending_paths.pop(pid, None)
    paths: set[Path] = set()
    for traced_path in traced_paths:
        raw = bytes(traced_path, "utf-8").decode("unicode_escape")
        try:
            resolved = Path(raw).resolve(strict=True)
        except OSError:
            continue
        if not any(
            resolved == root or root in resolved.parents for root in runtime_roots
        ):
            continue
        try:
            metadata = resolved.stat(follow_symlinks=False)
        except OSError as error:
            raise RunnerError(
                f"cannot inspect traced runtime file {resolved}: {error}"
            ) from error
        if stat.S_ISREG(metadata.st_mode):
            paths.add(resolved)
    if not paths:
        raise RunnerError(
            "runtime trace did not recover any opened regular runtime files"
        )
    records: list[dict[str, Any]] = []
    for path in sorted(paths, key=str):
        assert_no_symlink_components(path)
        with PinnedFile(path, maximum=1_000_000_000) as pinned:
            records.append(
                {"path": str(path), "bytes": pinned.size, "sha256": pinned.sha256}
            )
    version = ".".join(str(item) for item in python_info["version"])
    return {
        "manifestId": "skillpilot-sandbox-python-runtime-closure-v1",
        "formatVersion": 1,
        "python": {**tool_binding(sandbox_python), "version": version},
        "pythonElfInterpreter": dict(python_elf_interpreter),
        "traceToolRuntime": dict(trace_tool_runtime),
        "mounts": [
            {"source": str(root), "target": str(root), "readOnly": True}
            for root in runtime_roots
        ],
        "symlinks": [
            {"path": destination, "target": target}
            for target, destination in runtime_symlinks
        ],
        "files": records,
    }


def tool_binding(pinned: PinnedFile) -> dict[str, Any]:
    return {
        "path": str(pinned.path),
        "bytes": pinned.size,
        "sha256": pinned.sha256,
    }


def elf_interpreter_binding(executable: PinnedFile) -> dict[str, Any]:
    header = os.pread(executable.descriptor, 64, 0)
    if len(header) < 52 or header[:4] != b"\x7fELF":
        raise RunnerError(f"executable is not ELF: {executable.path}")
    elf_class, data_encoding = header[4], header[5]
    if elf_class not in {1, 2} or data_encoding not in {1, 2}:
        raise RunnerError(f"unsupported ELF class/encoding: {executable.path}")
    endian = "<" if data_encoding == 1 else ">"
    header_format = endian + ("HHIIIIIHHHHHH" if elf_class == 1 else "HHIQQQIHHHHHH")
    header_values = struct.unpack_from(header_format, header, 16)
    program_offset = int(header_values[4])
    program_entry_size = int(header_values[8])
    program_count = int(header_values[9])
    program_format = endian + ("IIIIIIII" if elf_class == 1 else "IIQQQQQQ")
    minimum_entry_size = struct.calcsize(program_format)
    if (
        program_entry_size < minimum_entry_size
        or program_count <= 0
        or program_count > 1024
    ):
        raise RunnerError(f"ELF program-header table is invalid: {executable.path}")
    interpreter: bytes | None = None
    for index in range(program_count):
        raw = os.pread(
            executable.descriptor,
            program_entry_size,
            program_offset + index * program_entry_size,
        )
        if len(raw) != program_entry_size:
            raise RunnerError(
                f"ELF program-header table is truncated: {executable.path}"
            )
        values = struct.unpack_from(program_format, raw)
        if values[0] != 3:
            continue
        offset = int(values[1] if elf_class == 1 else values[2])
        size = int(values[4] if elf_class == 1 else values[5])
        if size <= 1 or size > 4096:
            raise RunnerError(f"ELF PT_INTERP size is invalid: {executable.path}")
        interpreter = os.pread(executable.descriptor, size, offset)
        break
    if interpreter is None or not interpreter.endswith(b"\0"):
        raise RunnerError(f"ELF executable lacks one PT_INTERP: {executable.path}")
    try:
        path = Path(interpreter[:-1].decode("utf-8", "strict")).resolve(strict=True)
    except (OSError, UnicodeError) as error:
        raise RunnerError(
            f"cannot resolve ELF PT_INTERP for {executable.path}: {error}"
        ) from error
    if not path.is_absolute():
        raise RunnerError(f"ELF PT_INTERP is not absolute: {executable.path}")
    assert_no_symlink_components(path)
    with PinnedFile(path, maximum=1_000_000_000) as pinned:
        return tool_binding(pinned)


def capture_process_runtime(
    process: subprocess.Popen[str], expected_executable: PinnedFile
) -> list[dict[str, Any]]:
    executable_path: Path | None = None
    maps_raw: str | None = None
    stable_paths: set[str] | None = None
    stable_observations = 0
    for _ in range(200):
        try:
            executable_path = Path(os.readlink(f"/proc/{process.pid}/exe")).resolve(
                strict=True
            )
            maps_raw = Path(f"/proc/{process.pid}/maps").read_text(
                encoding="utf-8", errors="strict"
            )
        except (FileNotFoundError, ProcessLookupError):
            if process.poll() is not None:
                break
        except (OSError, UnicodeError) as error:
            raise RunnerError(
                f"cannot inspect host trace-tool runtime: {error}"
            ) from error
        if executable_path == expected_executable.path and maps_raw:
            observed_paths = {
                fields[5].removesuffix(" (deleted)")
                for line in maps_raw.splitlines()
                if len(fields := line.split(None, 5)) == 6 and fields[5].startswith("/")
            }
            if observed_paths == stable_paths:
                stable_observations += 1
            else:
                stable_paths = observed_paths
                stable_observations = 1
            if stable_observations >= 3:
                break
        time.sleep(0.005)
    if (
        executable_path != expected_executable.path
        or maps_raw is None
        or stable_paths is None
        or stable_observations < 3
    ):
        raise RunnerError("could not bind the live pinned strace process runtime")
    paths = {expected_executable.path}
    for raw_path in stable_paths:
        try:
            path = Path(raw_path).resolve(strict=True)
            metadata = path.stat(follow_symlinks=False)
        except OSError as error:
            raise RunnerError(
                f"cannot bind mapped strace runtime file {raw_path}: {error}"
            ) from error
        if stat.S_ISREG(metadata.st_mode):
            paths.add(path)
    bindings: list[dict[str, Any]] = []
    for path in sorted(paths, key=str):
        assert_no_symlink_components(path)
        with PinnedFile(path, maximum=1_000_000_000) as pinned:
            header = os.pread(pinned.descriptor, 6, 0)
            if header[:4] != b"\x7fELF":
                if path == expected_executable.path:
                    raise RunnerError(
                        "live pinned strace executable is not an ELF mapping"
                    )
                continue
            if len(header) != 6 or header[4] not in {1, 2} or header[5] not in {1, 2}:
                raise RunnerError(f"mapped strace ELF is unsupported: {path}")
            bindings.append(tool_binding(pinned))
    return bindings


def sandbox_command(
    *,
    bwrap: PinnedFile,
    sandbox_python: PinnedFile,
    compiler: PinnedFile,
    sandbox_entry: PinnedFile,
    fwu: PinnedFile,
    validation_receipt: PinnedFile,
    output_descriptor: int,
    evidence_descriptor: int,
    runtime_roots: Sequence[Path],
    runtime_symlinks: Sequence[tuple[str, str]],
    host_network_namespace: str,
    host_root_sentinels: Sequence[str],
    forbidden_paths: Sequence[str],
) -> list[str]:
    command = [
        f"/proc/self/fd/{bwrap.descriptor}",
        "--clearenv",
        "--die-with-parent",
        "--new-session",
        "--unshare-user",
        "--unshare-pid",
        "--unshare-net",
        "--unshare-ipc",
        "--unshare-uts",
        "--cap-drop",
        "ALL",
    ]
    for root in runtime_roots:
        command.extend(("--ro-bind", str(root), str(root)))
    for target, destination in runtime_symlinks:
        command.extend(("--symlink", target, destination))
    command.extend(
        [
            "--tmpfs",
            "/tmp",
            "--tmpfs",
            "/opt",
            "--dir",
            "/opt/input",
            "--dir",
            "/opt/tools",
            "--dir",
            "/opt/reverse-runner",
            "--dir",
            "/opt/output",
            "--dir",
            "/opt/evidence",
            "--ro-bind-fd",
            str(fwu.descriptor),
            "/opt/input/candidate.fwu-owl.zip",
            "--ro-bind-fd",
            str(validation_receipt.descriptor),
            "/opt/input/validation-report.json",
            "--ro-bind-fd",
            str(compiler.descriptor),
            "/opt/reverse-runner/reconstruct.py",
            "--ro-bind-fd",
            str(sandbox_entry.descriptor),
            "/opt/reverse-runner/sandbox-entry.py",
            "--ro-bind-fd",
            str(sandbox_python.descriptor),
            "/opt/tools/python3",
            "--bind-fd",
            str(output_descriptor),
            "/opt/output",
            "--bind-fd",
            str(evidence_descriptor),
            "/opt/evidence",
            "--proc",
            "/proc",
            "--dev",
            "/dev",
            "--chdir",
            "/tmp",
        ]
    )
    for name, value in sorted(SANDBOX_ENVIRONMENT.items()):
        command.extend(("--setenv", name, value))
    command.extend(
        [
            "/opt/tools/python3",
            "-I",
            "-S",
            "-B",
            "/opt/reverse-runner/sandbox-entry.py",
            "--compiler",
            "/opt/reverse-runner/reconstruct.py",
            "--fwu-owl-zip",
            "/opt/input/candidate.fwu-owl.zip",
            "--validation-report",
            "/opt/input/validation-report.json",
            "--output-dir",
            "/opt/output/package",
            "--compiler-report",
            "/opt/evidence/compiler-report.json",
            "--isolation-probe",
            "/opt/evidence/isolation-probe.json",
            "--host-network-namespace",
            host_network_namespace,
        ]
    )
    expected_root_entries = sandbox_root_entries(runtime_roots, runtime_symlinks)
    for entry in expected_root_entries:
        command.extend(("--expected-root-entry", entry))
    for path in host_root_sentinels:
        command.extend(("--host-root-sentinel", path))
    for path in forbidden_paths:
        command.extend(("--masked-path", path))
    return command


def run_isolated_build(
    *,
    run_id: str,
    fwu: PinnedFile,
    validation_receipt: PinnedFile,
    compiler: PinnedFile,
    sandbox_entry: PinnedFile,
    bwrap: PinnedFile,
    strace: PinnedFile,
    sandbox_python: PinnedFile,
    output_root: Path,
    evidence_root: Path,
    output_root_descriptor: int,
    evidence_root_descriptor: int,
    external_report: Path,
    content_digest: str,
    core_expectations: Mapping[str, Any],
    runtime_roots: Sequence[Path],
    runtime_symlinks: Sequence[tuple[str, str]],
    python_info: Mapping[str, Any],
    python_elf_interpreter: Mapping[str, Any],
    host_network_namespace: str,
    host_root_sentinels: Sequence[str],
    forbidden_paths: Sequence[str],
    expected_counts: Mapping[str, int] | None,
) -> tuple[dict[str, Any], dict[str, Any], PinnedFile]:
    run_output = output_root / run_id
    run_evidence = evidence_root / run_id
    sandbox_evidence = run_evidence / "sandbox-output"
    os.mkdir(run_id, 0o700, dir_fd=output_root_descriptor)
    os.mkdir(run_id, 0o700, dir_fd=evidence_root_descriptor)
    output_descriptor, output_identity = open_child_directory_descriptor(
        output_root_descriptor, run_id
    )
    run_evidence_descriptor, evidence_root_identity = open_child_directory_descriptor(
        evidence_root_descriptor, run_id
    )
    os.mkdir("sandbox-output", 0o700, dir_fd=run_evidence_descriptor)
    evidence_descriptor, evidence_identity = open_child_directory_descriptor(
        run_evidence_descriptor, "sandbox-output"
    )
    trace_descriptor = os.open(
        "host-raw.strace",
        os.O_WRONLY
        | os.O_CREAT
        | os.O_EXCL
        | getattr(os, "O_NOFOLLOW", 0)
        | getattr(os, "O_CLOEXEC", 0),
        0o600,
        dir_fd=run_evidence_descriptor,
    )
    command = sandbox_command(
        bwrap=bwrap,
        sandbox_python=sandbox_python,
        compiler=compiler,
        sandbox_entry=sandbox_entry,
        fwu=fwu,
        validation_receipt=validation_receipt,
        output_descriptor=output_descriptor,
        evidence_descriptor=evidence_descriptor,
        runtime_roots=runtime_roots,
        runtime_symlinks=runtime_symlinks,
        host_network_namespace=host_network_namespace,
        host_root_sentinels=host_root_sentinels,
        forbidden_paths=forbidden_paths,
    )
    traced_command = [
        f"/proc/self/fd/{strace.descriptor}",
        "-f",
        "-qq",
        "-yy",
        "-s",
        "4096",
        "-e",
        "trace=%file,%network,%process",
        "-o",
        f"/proc/self/fd/{trace_descriptor}",
        *command,
    ]
    try:
        process = subprocess.Popen(
            traced_command,
            cwd=REPO_ROOT,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            pass_fds=(
                fwu.descriptor,
                validation_receipt.descriptor,
                compiler.descriptor,
                sandbox_entry.descriptor,
                sandbox_python.descriptor,
                strace.descriptor,
                bwrap.descriptor,
                output_descriptor,
                evidence_descriptor,
                trace_descriptor,
            ),
        )
        trace_runtime_files = capture_process_runtime(process, strace)
        try:
            stdout, _ = process.communicate(timeout=7_200)
        except subprocess.TimeoutExpired as error:
            process.kill()
            process.communicate()
            raise RunnerError(
                f"isolated reverse compiler {run_id} timed out"
            ) from error
        result = subprocess.CompletedProcess(
            traced_command, process.returncode, stdout=stdout
        )
    except (OSError, subprocess.SubprocessError) as error:
        raise RunnerError(
            f"cannot execute isolated reverse compiler {run_id}: {error}"
        ) from error
    finally:
        try:
            os.fsync(trace_descriptor)
        finally:
            os.close(trace_descriptor)

    assert_directory_path_identity(run_output, output_descriptor, output_identity)
    assert_directory_path_identity(
        run_evidence, run_evidence_descriptor, evidence_root_identity
    )
    assert_directory_path_identity(
        sandbox_evidence, evidence_descriptor, evidence_identity
    )

    raw_trace_path = run_evidence / "host-raw.strace"
    raw_trace_pinned = PinnedFile.from_directory(
        run_evidence_descriptor,
        raw_trace_path.name,
        raw_trace_path,
        maximum=1_000_000_000,
    )
    raw_trace = raw_trace_pinned.read()
    filtered_trace, process_tree_manifest = filter_sandbox_trace(raw_trace)
    safe_atomic_write_at(run_evidence_descriptor, "filesystem.strace", filtered_trace)
    safe_atomic_write_at(
        run_evidence_descriptor,
        "trace-process-tree-manifest.json",
        (json.dumps(process_tree_manifest, indent=2, sort_keys=True) + "\n").encode(
            "utf-8"
        ),
    )
    trace_elf_interpreter = elf_interpreter_binding(strace)
    trace_tool_runtime = {
        "executable": tool_binding(strace),
        "elfInterpreter": trace_elf_interpreter,
        "libraries": [
            binding
            for binding in trace_runtime_files
            if binding["path"] not in {str(strace.path), trace_elf_interpreter["path"]}
        ],
    }

    safe_atomic_write_at(
        run_evidence_descriptor, "sandbox.log", result.stdout.encode("utf-8")
    )
    if result.returncode != 0:
        probe_detail = ""
        failed_probe = sandbox_evidence / "isolation-probe.json"
        if failed_probe.is_file():
            try:
                probe_detail = failed_probe.read_text(encoding="utf-8")[-2_000:]
            except (OSError, UnicodeError):
                probe_detail = ""
        raise RunnerError(
            f"isolated reverse compiler {run_id} exited {result.returncode}: "
            + "sandbox log:\n"
            + result.stdout[-2_000:]
            + "\nisolation probe:\n"
            + probe_detail[-1_000:]
        )
    trace_path = run_evidence / "filesystem.strace"
    probe_path = sandbox_evidence / "isolation-probe.json"
    compiler_report_path = sandbox_evidence / "compiler-report.json"
    trace_pinned = PinnedFile.from_directory(
        run_evidence_descriptor,
        trace_path.name,
        trace_path,
        maximum=1_000_000_000,
    )
    probe_pinned = PinnedFile.from_directory(
        evidence_descriptor,
        probe_path.name,
        probe_path,
        maximum=67_108_864,
    )
    compiler_report_pinned = PinnedFile.from_directory(
        evidence_descriptor,
        compiler_report_path.name,
        compiler_report_path,
        maximum=67_108_864,
    )
    trace_raw = trace_pinned.read()
    probe = load_json_bytes(probe_pinned.read(67_108_864), f"{run_id} isolation probe")
    if (
        not isinstance(probe, dict)
        or probe.get("status") != "passed"
        or probe.get("compilerExitCode") != 0
    ):
        raise RunnerError(f"isolated build {run_id} did not pass its namespace probe")
    checks = probe.get("checks")
    expected_root_entries = sandbox_root_entries(runtime_roots, runtime_symlinks)
    expected_host_sentinels = [
        {"path": path, "accessible": False} for path in host_root_sentinels
    ]
    expected_masked_paths = [
        {"path": path, "accessible": False} for path in forbidden_paths
    ]
    if (
        not isinstance(checks, dict)
        or checks.get("originalJsonProvided") is not False
        or checks.get("rootEntries") != expected_root_entries
        or checks.get("temporaryNames") != []
        or checks.get("optNames")
        != ["evidence", "input", "output", "reverse-runner", "tools"]
        or checks.get("networkNamespaceIsolated") is not True
        or checks.get("pythonExecutable") != "/opt/tools/python3"
        or checks.get("pythonIsolated") is not True
        or checks.get("pythonNoSite") is not True
        or checks.get("traceFdClosed") is not True
        or trace_descriptor not in checks.get("closedInheritedDescriptors", [])
        or checks.get("hostRootSentinels") != expected_host_sentinels
        or checks.get("maskedPaths") != expected_masked_paths
    ):
        raise RunnerError(f"isolated build {run_id} observed a forbidden input")
    try:
        trace_text = trace_raw.decode("utf-8", "strict")
    except UnicodeError as error:
        raise RunnerError(f"isolated trace is not UTF-8: {error}") from error
    network_attempts, forbidden_reads = trace_text_audit(
        trace_text, (*host_root_sentinels, *forbidden_paths)
    )
    if network_attempts or forbidden_reads:
        raise RunnerError(
            f"isolated build {run_id} violated trace policy: "
            f"network={network_attempts}, forbiddenReads={forbidden_reads}"
        )
    if os.listdir(output_descriptor) != ["package"]:
        raise RunnerError(f"isolated build {run_id} output root is not closed")
    package_descriptor = os.open(
        "package",
        os.O_RDONLY
        | getattr(os, "O_DIRECTORY", 0)
        | getattr(os, "O_NOFOLLOW", 0)
        | getattr(os, "O_CLOEXEC", 0),
        dir_fd=output_descriptor,
    )
    package_names = os.listdir(package_descriptor)
    packages = [name for name in package_names if name.endswith(".json.zip")]
    if len(packages) != 1 or len(package_names) != 1:
        raise RunnerError(
            f"isolated build {run_id} must emit exactly one JSON ZIP, got "
            f"{len(packages)} packages / {len(package_names)} entries"
        )
    package_path = run_output / "package" / packages[0]
    pinned_package = PinnedFile.from_directory(
        package_descriptor,
        packages[0],
        package_path,
        maximum=3_500_000_000,
    )
    os.close(package_descriptor)
    output, pinned_output, archive_root = inspect_reconstructed_zip(
        package_path,
        expected_content_digest=content_digest,
        expected_counts=expected_counts,
        pinned=pinned_package,
    )
    output["path"] = report_relative(package_path, external_report)
    core_report = load_json_bytes(
        compiler_report_pinned.read(67_108_864), f"{run_id} reverse compiler report"
    )
    if not isinstance(core_report, dict):
        pinned_output.close()
        raise RunnerError(
            f"isolated build {run_id} emitted a non-object compiler report"
        )
    if (
        core_report.get("reverseCompilerId") != COMPILER_ID
        or core_report.get("reverseCompilerVersion") != COMPILER_VERSION
        or core_report.get("status") != "passed"
    ):
        pinned_output.close()
        raise RunnerError(
            f"isolated build {run_id} reported an unexpected compiler identity"
        )
    normalized_oracle = core_report.get("normalizedOracle")
    expected_core_output = {
        "archiveRoot": archive_root,
        "bytes": output["bytes"],
        "sha256": output["sha256"],
        "manifestSha256": output["manifestSha256"],
        "contentDigest": output["contentDigest"],
        "counts": output["counts"],
    }
    core_output = core_report.get("output")
    if not isinstance(core_output, dict):
        pinned_output.close()
        raise RunnerError(f"isolated build {run_id} lacks Core output evidence")
    observed_core_output = {key: core_output.get(key) for key in expected_core_output}
    expected_output_path = f"/opt/output/package/{package_path.name}"
    if (
        core_report.get("sourceFwuOwl") != core_expectations["sourceFwuOwl"]
        or core_report.get("registry") != core_expectations["registry"]
        or core_output.get("path") != expected_output_path
        or observed_core_output != expected_core_output
        or normalized_oracle
        != {
            "status": "passed",
            "expectedCount": output["counts"]["logicalArtifacts"],
            "verifiedCount": output["counts"]["logicalArtifacts"],
            "mismatchCount": 0,
        }
    ):
        pinned_output.close()
        raise RunnerError(
            f"isolated build {run_id} Core report differs from independent bindings"
        )
    output_manifest = single_file_tree_manifest(run_output, package_path, pinned_output)
    safe_atomic_write_at(
        run_evidence_descriptor,
        "output-tree-manifest.json",
        (json.dumps(output_manifest, indent=2, sort_keys=True) + "\n").encode("utf-8"),
    )
    runtime_manifest = runtime_closure_manifest(
        trace_raw,
        runtime_roots,
        runtime_symlinks,
        sandbox_python,
        python_info,
        python_elf_interpreter,
        trace_tool_runtime,
    )
    safe_atomic_write_at(
        run_evidence_descriptor,
        "runtime-closure-manifest.json",
        (json.dumps(runtime_manifest, indent=2, sort_keys=True) + "\n").encode("utf-8"),
    )
    host_evidence_pins = {
        name: PinnedFile.from_directory(
            run_evidence_descriptor,
            name,
            run_evidence / name,
            maximum=1_000_000_000,
            allow_empty=True,
        )
        for name in (
            "sandbox.log",
            "output-tree-manifest.json",
            "runtime-closure-manifest.json",
            "trace-process-tree-manifest.json",
        )
    }
    trace_binding = pinned_file_binding(trace_pinned, trace_path, external_report)
    trace_binding["forbiddenReadCount"] = forbidden_reads
    trace_binding["networkAttemptCount"] = network_attempts
    run = {
        "output": output,
        "validationReceipt": None,
    }
    evidence = {
        "exitCode": result.returncode,
        "trace": trace_binding,
        "compilerReport": pinned_file_binding(
            compiler_report_pinned, compiler_report_path, external_report
        ),
        "isolationProbe": pinned_file_binding(
            probe_pinned, probe_path, external_report
        ),
        "sandboxLog": pinned_file_binding(
            host_evidence_pins["sandbox.log"],
            run_evidence / "sandbox.log",
            external_report,
        ),
        "outputTreeManifest": pinned_file_binding(
            host_evidence_pins["output-tree-manifest.json"],
            run_evidence / "output-tree-manifest.json",
            external_report,
        ),
        "runtimeClosureManifest": pinned_file_binding(
            host_evidence_pins["runtime-closure-manifest.json"],
            run_evidence / "runtime-closure-manifest.json",
            external_report,
        ),
        "hostRawTrace": pinned_file_binding(
            raw_trace_pinned, raw_trace_path, external_report
        ),
        "traceProcessTreeManifest": pinned_file_binding(
            host_evidence_pins["trace-process-tree-manifest.json"],
            run_evidence / "trace-process-tree-manifest.json",
            external_report,
        ),
    }
    assert_directory_path_identity(run_output, output_descriptor, output_identity)
    assert_directory_path_identity(
        run_evidence, run_evidence_descriptor, evidence_root_identity
    )
    assert_directory_path_identity(
        sandbox_evidence, evidence_descriptor, evidence_identity
    )
    trace_pinned.close()
    probe_pinned.close()
    compiler_report_pinned.close()
    raw_trace_pinned.close()
    for pinned in host_evidence_pins.values():
        pinned.close()
    os.close(evidence_descriptor)
    os.close(run_evidence_descriptor)
    os.close(output_descriptor)
    return run, evidence, pinned_output


def validate_reconstructed_package(
    *,
    run_id: str,
    run: dict[str, Any],
    output: PinnedFile,
    evidence_root: Path,
    evidence_root_descriptor: int,
    external_report: Path,
    python: PinnedFile,
    validator: PinnedFile,
) -> dict[str, Any]:
    receipt_path = evidence_root / run_id / "full-package-validation-report.json"
    run_evidence_descriptor, _ = open_child_directory_descriptor(
        evidence_root_descriptor, run_id
    )
    command = [
        f"/proc/self/fd/{python.descriptor}",
        "-B",
        f"/proc/self/fd/{validator.descriptor}",
        "--zip",
        str(output.path),
        "--report",
        str(receipt_path),
    ]
    try:
        result = subprocess.run(
            command,
            cwd=REPO_ROOT,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=3_600,
            check=False,
            pass_fds=(
                python.descriptor,
                validator.descriptor,
            ),
        )
    except (OSError, subprocess.SubprocessError) as error:
        raise RunnerError(
            f"cannot validate reconstructed package {run_id}: {error}"
        ) from error
    safe_atomic_write_at(
        run_evidence_descriptor, "full-validator.log", result.stdout.encode("utf-8")
    )
    # The independent validator rehashes the complete ZIP and returns that
    # digest below; preserve descriptor/path identity here without a redundant
    # second multi-gigabyte host-side hash pass.
    output.assert_identity_unchanged()
    validator.assert_unchanged()
    python.assert_unchanged()
    if result.returncode != 0:
        raise RunnerError(
            f"full standalone validator rejected {run_id}: exit={result.returncode}; "
            + result.stdout[-2_000:]
        )
    receipt_pinned = PinnedFile.from_directory(
        run_evidence_descriptor,
        receipt_path.name,
        receipt_path,
        maximum=67_108_864,
    )
    receipt_raw = receipt_pinned.read(67_108_864)
    receipt = load_json_bytes(receipt_raw, f"{run_id} full-package validator receipt")
    if not isinstance(receipt, dict):
        raise RunnerError(
            f"full-package validator receipt for {run_id} is not an object"
        )
    gates = receipt.get("gates")
    expected_gate_ids = {
        "assetBytes",
        "contentDigest",
        "hardReferenceClosure",
        "inventory",
        "offlineSchemaCatalog",
        "runtimeCatalog",
    }
    if (
        receipt.get("validatorId") != FULL_PACKAGE_VALIDATOR_ID
        or receipt.get("reportFormatVersion") != 2
        or receipt.get("status") != "valid"
        or receipt.get("diagnostics") != []
        or not isinstance(gates, dict)
        or set(gates) != expected_gate_ids
        or any(
            not isinstance(value, dict)
            or value.get("status") != "passed"
            or value.get("diagnosticCount") != 0
            for value in gates.values()
        )
    ):
        raise RunnerError(
            f"full-package validator receipt for {run_id} is not clean v2 evidence"
        )
    receipt_input = receipt.get("input")
    receipt_package = receipt.get("package")
    if not isinstance(receipt_input, dict) or not isinstance(receipt_package, dict):
        raise RunnerError(f"full-package validator receipt for {run_id} lacks bindings")
    output_binding = run["output"]
    if (
        receipt_input.get("bytes") != output_binding["bytes"]
        or receipt_input.get("sha256") != output_binding["sha256"]
        or receipt_package.get("manifestSha256") != output_binding["manifestSha256"]
        or receipt_package.get("contentDigest") != output_binding["contentDigest"]
    ):
        raise RunnerError(
            f"full-package validator receipt for {run_id} binds another ZIP"
        )
    binding = pinned_file_binding(receipt_pinned, receipt_path, external_report)
    run["validationReceipt"] = {
        **binding,
        "validatorId": FULL_PACKAGE_VALIDATOR_ID,
        "status": "valid",
        "errorCount": 0,
        "packageZipSha256": output_binding["sha256"],
        "manifestSha256": output_binding["manifestSha256"],
    }
    receipt_pinned.close()
    log_path = evidence_root / run_id / "full-validator.log"
    with PinnedFile.from_directory(
        run_evidence_descriptor,
        log_path.name,
        log_path,
        maximum=67_108_864,
        allow_empty=True,
    ) as log_pinned:
        log_binding = pinned_file_binding(log_pinned, log_path, external_report)
    os.close(run_evidence_descriptor)
    return log_binding


def byte_identical(first: PinnedFile, second: PinnedFile) -> bool:
    if first.size != second.size or first.sha256 != second.sha256:
        return False
    offset = 0
    while offset < first.size:
        length = min(8 * 1024 * 1024, first.size - offset)
        if os.pread(first.descriptor, length, offset) != os.pread(
            second.descriptor, length, offset
        ):
            return False
        offset += length
    first.assert_identity_unchanged()
    second.assert_identity_unchanged()
    return True


def evidence_manifest_from_descriptor(
    root_descriptor: int, root: Path
) -> dict[str, Any]:
    records: list[dict[str, Any]] = []

    def visit(directory_descriptor: int, prefix: str) -> None:
        for name in sorted(os.listdir(directory_descriptor)):
            metadata = os.stat(name, dir_fd=directory_descriptor, follow_symlinks=False)
            relative = f"{prefix}/{name}" if prefix else name
            if stat.S_ISDIR(metadata.st_mode):
                child, _ = open_child_directory_descriptor(directory_descriptor, name)
                try:
                    visit(child, relative)
                finally:
                    os.close(child)
                continue
            if not stat.S_ISREG(metadata.st_mode) or metadata.st_nlink != 1:
                raise RunnerError(
                    f"evidence tree contains a non-regular or linked entry: {relative}"
                )
            if relative == "evidence-manifest.json":
                continue
            with PinnedFile.from_directory(
                directory_descriptor,
                name,
                root / relative,
                maximum=3_500_000_000,
                allow_empty=True,
            ) as pinned:
                records.append(
                    {"path": relative, "bytes": pinned.size, "sha256": pinned.sha256}
                )

    visit(root_descriptor, "")
    records.sort(key=lambda item: item["path"])
    digest = hashlib.sha256()
    total = 0
    for binding in records:
        total += int(binding["bytes"])
        digest.update(binding["path"].encode("utf-8"))
        digest.update(b"\0")
        digest.update(str(binding["bytes"]).encode("ascii"))
        digest.update(b"\0")
        digest.update(binding["sha256"].encode("ascii"))
        digest.update(b"\n")
    return {
        "formatVersion": 1,
        "bytes": total,
        "sha256": digest.hexdigest(),
        "files": records,
    }


def build_valid_report(
    *,
    fwu: PinnedFile,
    fwu_manifest_sha: str,
    content_digest: str,
    validation_binding: dict[str, Any],
    runner_script: PinnedFile,
    compiler: PinnedFile,
    sandbox_entry: PinnedFile,
    full_validator: PinnedFile,
    bwrap: PinnedFile,
    strace: PinnedFile,
    sandbox_python: PinnedFile,
    python_info: Mapping[str, Any],
    runtime_roots: Sequence[Path],
    evidence_manifest_binding: Mapping[str, Any],
    run_a: dict[str, Any],
    run_b: dict[str, Any],
    evidence_a: dict[str, Any],
    evidence_b: dict[str, Any],
) -> dict[str, Any]:
    return {
        "$schema": REPORT_SCHEMA_ID,
        "reportFormatVersion": 1,
        "validatorId": VALIDATOR_ID,
        "status": "valid",
        "runner": {
            "id": RUNNER_ID,
            "version": RUNNER_VERSION,
            "executable": {
                "path": str(runner_script.path),
                "bytes": runner_script.size,
                "sha256": runner_script.sha256,
            },
        },
        "sandboxEntry": {
            "id": SANDBOX_ENTRY_ID,
            "version": SANDBOX_ENTRY_VERSION,
            "executable": {
                "path": str(sandbox_entry.path),
                "bytes": sandbox_entry.size,
                "sha256": sandbox_entry.sha256,
            },
        },
        "input": {
            "fwuOwlPackage": {
                "path": str(fwu.path),
                "bytes": fwu.size,
                "sha256": fwu.sha256,
                "manifestSha256": fwu_manifest_sha,
                "contentDigest": content_digest,
            },
            "validationReceipt": validation_binding,
        },
        "compiler": {
            "id": COMPILER_ID,
            "version": COMPILER_VERSION,
            "executable": {
                "path": str(compiler.path),
                "bytes": compiler.size,
                "sha256": compiler.sha256,
            },
        },
        "packageValidator": {
            "id": FULL_PACKAGE_VALIDATOR_ID,
            "version": FULL_PACKAGE_VALIDATOR_VERSION,
            "executable": {
                "path": str(full_validator.path),
                "bytes": full_validator.size,
                "sha256": full_validator.sha256,
            },
        },
        "isolation": {
            "status": "passed",
            "mechanism": "bubblewrap-clearenv-readonly-input-strace-v1",
            "sandboxTool": tool_binding(bwrap),
            "traceTool": tool_binding(strace),
            "pythonRuntime": {
                "executable": tool_binding(sandbox_python),
                "version": ".".join(str(item) for item in python_info["version"]),
                "minimumVersion": ".".join(map(str, SANDBOX_PYTHON_MINIMUM)),
                "siteEnabled": False,
                "mountedRoots": [str(path) for path in runtime_roots],
            },
            "originalJsonPackageAccessible": False,
            "authoringCheckoutAccessible": False,
            "forwardExporterAccessible": False,
            "networkAccessible": False,
            "runA": evidence_a["trace"],
            "runB": evidence_b["trace"],
        },
        "runs": {"runA": run_a, "runB": run_b},
        "evidenceManifest": dict(evidence_manifest_binding),
        "reproducibility": {
            "status": "passed",
            "sourceDateEpoch": SOURCE_DATE_EPOCH,
            "locale": "C.UTF-8",
            "timezone": "UTC",
            "zipByteIdentical": True,
            "manifestByteIdentical": True,
        },
        "diagnostics": [],
        "diagnosticsTruncated": False,
    }


def execute(
    args: argparse.Namespace, *, expected_counts: Mapping[str, int] | None = None
) -> dict[str, Any]:
    validate_path_layout(args)
    bwrap_path = require_tool("bwrap")
    strace_path = require_tool("strace")
    sandbox_python_path = require_sandbox_python()
    host_python_path = Path(sys.executable).resolve(strict=True)
    assert_no_symlink_components(host_python_path)
    try:
        host_network_namespace = os.readlink("/proc/self/ns/net")
    except OSError as error:
        raise RunnerError(f"cannot inspect host network namespace: {error}") from error
    report_parent_descriptor = open_or_create_absolute_directory_chain(
        args.report.parent
    )
    report_parent_transferred = False
    try:
        os.mkdir(args.output_dir.name, 0o700, dir_fd=report_parent_descriptor)
        os.mkdir(args.evidence_dir.name, 0o700, dir_fd=report_parent_descriptor)
        output_root_descriptor, output_root_identity = open_child_directory_descriptor(
            report_parent_descriptor, args.output_dir.name
        )
        evidence_root_descriptor, evidence_root_identity = (
            open_child_directory_descriptor(
                report_parent_descriptor, args.evidence_dir.name
            )
        )
    except BaseException:
        os.close(report_parent_descriptor)
        raise

    pinned: list[PinnedFile] = []
    output_a: PinnedFile | None = None
    output_b: PinnedFile | None = None
    try:
        fwu = PinnedFile(args.fwu_owl_zip, maximum=3_500_000_000)
        validation_receipt = PinnedFile(args.validation_report, maximum=67_108_864)
        compiler = PinnedFile(args.compiler, maximum=16_777_216)
        runner_script = PinnedFile(RUNNER_PATH, maximum=16_777_216)
        sandbox_entry = PinnedFile(SANDBOX_ENTRY, maximum=16_777_216)
        bwrap = PinnedFile(bwrap_path, maximum=67_108_864)
        strace = PinnedFile(strace_path, maximum=67_108_864)
        sandbox_python = PinnedFile(sandbox_python_path, maximum=1_000_000_000)
        host_python = PinnedFile(host_python_path, maximum=1_000_000_000)
        full_validator = PinnedFile(args.full_validator, maximum=16_777_216)
        pinned.extend(
            [
                fwu,
                validation_receipt,
                compiler,
                runner_script,
                sandbox_entry,
                bwrap,
                strace,
                sandbox_python,
                host_python,
                full_validator,
            ]
        )
        python_info = validate_sandbox_python(sandbox_python)
        python_elf_interpreter = elf_interpreter_binding(sandbox_python)
        runtime_roots = sandbox_runtime_roots(python_info)
        runtime_symlinks = sandbox_runtime_symlinks(runtime_roots)
        validation_binding, fwu_manifest_sha, content_digest = validate_fwu_receipt(
            fwu, validation_receipt
        )
        receipt_value = load_json_bytes(
            validation_receipt.read(67_108_864), "DPK-008c validation receipt"
        )
        try:
            source_name = receipt_value["package"]["sourceJsonPackage"]["file"]
        except (KeyError, TypeError) as error:
            raise InvalidInput(
                "DPK-008c receipt lacks its source JSON package filename"
            ) from error
        if (
            not isinstance(source_name, str)
            or not source_name.endswith(".json.zip")
            or Path(source_name).name != source_name
        ):
            raise InvalidInput("DPK-008c source JSON package filename is unsafe")
        core_expectations = derive_core_report_expectations(fwu, receipt_value)
        forbidden_paths = (
            str(REPO_ROOT / ".git"),
            str(REPO_ROOT / "curricula"),
            str(REPO_ROOT / "app/scripts/buildFwuOwlCurriculumPackage.ts"),
            str(REPO_ROOT / "tmp/lehrplan-ontologie"),
            str(
                REPO_ROOT
                / "tmp/curriculum-release-model/full-standalone-package"
                / source_name
            ),
        )
        run_a, evidence_a, output_a = run_isolated_build(
            run_id="run-a",
            fwu=fwu,
            validation_receipt=validation_receipt,
            compiler=compiler,
            sandbox_entry=sandbox_entry,
            bwrap=bwrap,
            strace=strace,
            sandbox_python=sandbox_python,
            output_root=args.output_dir,
            evidence_root=args.evidence_dir,
            output_root_descriptor=output_root_descriptor,
            evidence_root_descriptor=evidence_root_descriptor,
            external_report=args.report,
            content_digest=content_digest,
            core_expectations=core_expectations,
            runtime_roots=runtime_roots,
            runtime_symlinks=runtime_symlinks,
            python_info=python_info,
            python_elf_interpreter=python_elf_interpreter,
            host_network_namespace=host_network_namespace,
            host_root_sentinels=HOST_ROOT_SENTINELS,
            forbidden_paths=forbidden_paths,
            expected_counts=expected_counts,
        )
        run_b, evidence_b, output_b = run_isolated_build(
            run_id="run-b",
            fwu=fwu,
            validation_receipt=validation_receipt,
            compiler=compiler,
            sandbox_entry=sandbox_entry,
            bwrap=bwrap,
            strace=strace,
            sandbox_python=sandbox_python,
            output_root=args.output_dir,
            evidence_root=args.evidence_dir,
            output_root_descriptor=output_root_descriptor,
            evidence_root_descriptor=evidence_root_descriptor,
            external_report=args.report,
            content_digest=content_digest,
            core_expectations=core_expectations,
            runtime_roots=runtime_roots,
            runtime_symlinks=runtime_symlinks,
            python_info=python_info,
            python_elf_interpreter=python_elf_interpreter,
            host_network_namespace=host_network_namespace,
            host_root_sentinels=HOST_ROOT_SENTINELS,
            forbidden_paths=forbidden_paths,
            expected_counts=expected_counts,
        )
        if not byte_identical(output_a, output_b):
            raise InvalidInput(
                "isolated reverse compiler builds are not byte-identical"
            )
        if run_a["output"]["manifestSha256"] != run_b["output"]["manifestSha256"]:
            raise InvalidInput(
                "isolated reverse compiler manifests are not byte-identical"
            )
        if (
            evidence_a["runtimeClosureManifest"]["sha256"]
            != evidence_b["runtimeClosureManifest"]["sha256"]
        ):
            raise InvalidInput(
                "isolated Python runtime closures are not byte-identical"
            )
        evidence_a["fullValidatorLog"] = validate_reconstructed_package(
            run_id="run-a",
            run=run_a,
            output=output_a,
            evidence_root=args.evidence_dir,
            evidence_root_descriptor=evidence_root_descriptor,
            external_report=args.report,
            python=host_python,
            validator=full_validator,
        )
        evidence_b["fullValidatorLog"] = validate_reconstructed_package(
            run_id="run-b",
            run=run_b,
            output=output_b,
            evidence_root=args.evidence_dir,
            evidence_root_descriptor=evidence_root_descriptor,
            external_report=args.report,
            python=host_python,
            validator=full_validator,
        )
        for _, run, evidence in (
            ("run-a", run_a, evidence_a),
            ("run-b", run_b, evidence_b),
        ):
            run["evidence"] = {
                key: evidence[key]
                for key in (
                    "compilerReport",
                    "isolationProbe",
                    "sandboxLog",
                    "outputTreeManifest",
                    "fullValidatorLog",
                    "runtimeClosureManifest",
                    "hostRawTrace",
                    "traceProcessTreeManifest",
                )
            }
        manifest = evidence_manifest_from_descriptor(
            evidence_root_descriptor, args.evidence_dir
        )
        safe_atomic_write_at(
            evidence_root_descriptor,
            "evidence-manifest.json",
            (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode("utf-8"),
        )
        with PinnedFile.from_directory(
            evidence_root_descriptor,
            "evidence-manifest.json",
            args.evidence_dir / "evidence-manifest.json",
            maximum=67_108_864,
        ) as evidence_manifest_pinned:
            evidence_manifest_binding = pinned_file_binding(
                evidence_manifest_pinned,
                args.evidence_dir / "evidence-manifest.json",
                args.report,
            )
        report = build_valid_report(
            fwu=fwu,
            fwu_manifest_sha=fwu_manifest_sha,
            content_digest=content_digest,
            validation_binding=validation_binding,
            runner_script=runner_script,
            compiler=compiler,
            sandbox_entry=sandbox_entry,
            full_validator=full_validator,
            bwrap=bwrap,
            strace=strace,
            sandbox_python=sandbox_python,
            python_info=python_info,
            runtime_roots=runtime_roots,
            evidence_manifest_binding=evidence_manifest_binding,
            run_a=run_a,
            run_b=run_b,
            evidence_a=evidence_a,
            evidence_b=evidence_b,
        )
        for item in pinned:
            item.assert_unchanged()
        output_a.assert_identity_unchanged()
        output_b.assert_identity_unchanged()
        assert_directory_path_identity(
            args.output_dir, output_root_descriptor, output_root_identity
        )
        assert_directory_path_identity(
            args.evidence_dir, evidence_root_descriptor, evidence_root_identity
        )
        args._report_parent_descriptor = report_parent_descriptor
        args._report_parent_identity = directory_descriptor_identity(
            report_parent_descriptor
        )
        report_parent_transferred = True
        return report
    finally:
        if output_a is not None:
            output_a.close()
        if output_b is not None:
            output_b.close()
        for item in reversed(pinned):
            item.close()
        os.close(evidence_root_descriptor)
        os.close(output_root_descriptor)
        if not report_parent_transferred:
            os.close(report_parent_descriptor)


FAKE_COMPILER_SOURCE = r"""#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
from pathlib import Path
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument("--fwu-owl-zip", required=True)
parser.add_argument("--validation-report", required=True)
parser.add_argument("--output-dir", required=True)
parser.add_argument("--report", required=True)
args = parser.parse_args()
trace_candidates = [Path("/opt/evidence/filesystem.strace")]
for process_fds in Path("/proc").glob("[0-9]*/fd"):
    try:
        descriptors = list(process_fds.iterdir())
    except OSError:
        continue
    for descriptor in descriptors:
        try:
            target = os.readlink(descriptor)
        except OSError:
            continue
        if target.endswith(("/host-raw.strace", "/filesystem.strace")):
            trace_candidates.append(descriptor)
for candidate in trace_candidates:
    if not candidate.exists():
        continue
    try:
        with candidate.open("ab") as trace_handle:
            trace_handle.write(b"compiler-tamper\n")
    except OSError:
        continue
    raise SystemExit("compiler unexpectedly wrote trusted trace evidence")
validation = json.loads(Path(args.validation_report).read_text(encoding="utf-8"))
content_digest = validation["package"]["contentDigest"]
fwu_path = Path(args.fwu_owl_zip)
fwu_raw = fwu_path.read_bytes()
registry_binding = validation["package"]["fieldSemanticsRegistry"]
with zipfile.ZipFile(fwu_path) as source_archive:
    registry_raw = source_archive.read(
        validation["package"]["archiveRoot"] + "/" + registry_binding["path"]
    )
registry = json.loads(registry_raw)
root = "fixture.json"
index = {
    "contentDigest": content_digest,
    "logicalArtifacts": [{"role": "fixture", "logicalId": "fixture"}],
    "binaryResources": [{"resourceId": "fixture-image"}],
}
index_raw = (json.dumps(index, sort_keys=True, separators=(",", ":")) + "\n").encode()
payload_raw = b'{"fixture":true}\n'
binary_raw = b"\x89PNG\r\n\x1a\n"
files = [
    {"path": "data/payload.json", "role": "release-support", "bytes": len(payload_raw), "sha256": hashlib.sha256(payload_raw).hexdigest()},
    {
        "path": "assets/fixture.png",
        "role": "binary-asset",
        "bytes": len(binary_raw),
        "sha256": hashlib.sha256(binary_raw).hexdigest(),
        "semanticBinding": {"kind": "binary-resource", "resourceId": "fixture-image"},
    },
    {
        "path": "metadata/semantic-content-index.json",
        "role": "semantic-content-index",
        "mediaType": "application/json",
        "bytes": len(index_raw),
        "sha256": hashlib.sha256(index_raw).hexdigest(),
        "runtimeRequired": True,
        "validationSchemaId": "https://skillpilot.com/schemas/curriculum-package/v1/semantic-content-index.schema.json",
        "semanticBinding": {"kind": "excluded-generated"},
    },
]
manifest = {
    "contentDigest": content_digest,
    "files": files,
}
manifest_raw = (json.dumps(manifest, sort_keys=True, separators=(",", ":")) + "\n").encode()
entries = {
    "assets/fixture.png": binary_raw,
    "data/payload.json": payload_raw,
    "metadata/manifest.json": manifest_raw,
    "metadata/semantic-content-index.json": index_raw,
}
checksums = "".join(
    f"{hashlib.sha256(raw).hexdigest()}  {path}\n"
    for path, raw in sorted(entries.items())
).encode()
entries["metadata/SHA256SUMS"] = checksums
output_dir = Path(args.output_dir)
output_dir.mkdir(parents=True, exist_ok=True)
output = output_dir / "fixture.reconstructed.json.zip"
with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_STORED, allowZip64=False) as archive:
    for relative, raw in sorted(entries.items()):
        info = zipfile.ZipInfo(f"{root}/{relative}", (1980, 1, 1, 0, 0, 0))
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        archive.writestr(info, raw)
report = {
    "reverseCompilerId": "skillpilot-fwu-owl-reverse-compiler-v1",
    "reverseCompilerVersion": "1.0.0",
    "status": "passed",
    "sourceFwuOwl": {
        "bytes": len(fwu_raw),
        "sha256": hashlib.sha256(fwu_raw).hexdigest(),
        "manifestSha256": validation["package"]["manifestSha256"],
        "releaseId": validation["package"]["releaseId"],
        "contentDigest": content_digest,
    },
    "registry": {
        "id": registry["registryId"],
        "version": registry["version"],
        "sha256": hashlib.sha256(registry_raw).hexdigest(),
        "entryCount": len(registry["entries"]),
    },
    "normalizedOracle": {
        "status": "passed",
        "expectedCount": 1,
        "verifiedCount": 1,
        "mismatchCount": 0,
    },
    "output": {
        "path": str(output),
        "archiveRoot": root,
        "bytes": output.stat().st_size,
        "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
        "manifestSha256": hashlib.sha256(manifest_raw).hexdigest(),
        "contentDigest": content_digest,
        "counts": {
            "zipEntries": 5,
            "manifestFiles": 3,
            "checksumRows": 4,
            "logicalArtifacts": 1,
            "binaryResources": 1,
            "binaryBytes": 8,
        },
    },
}
Path(args.report).write_text(json.dumps(report, sort_keys=True) + "\n", encoding="utf-8")
"""


FAKE_VALIDATOR_SOURCE = r"""#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument("--zip", required=True)
parser.add_argument("--report", required=True)
args = parser.parse_args()
path = Path(args.zip)
raw = path.read_bytes()
with zipfile.ZipFile(path) as archive:
    manifest_name = next(name for name in archive.namelist() if name.endswith("/metadata/manifest.json"))
    manifest_raw = archive.read(manifest_name)
    manifest = json.loads(manifest_raw)
gates = {
    name: {"status": "passed", "diagnosticCount": 0, "diagnosticCodes": []}
    for name in (
        "assetBytes", "contentDigest", "hardReferenceClosure", "inventory",
        "offlineSchemaCatalog", "runtimeCatalog",
    )
}
report = {
    "reportFormatVersion": 2,
    "validatorId": "skillpilot-full-standalone-package-validator-v2",
    "status": "valid",
    "input": {"path": str(path), "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()},
    "package": {"manifestSha256": hashlib.sha256(manifest_raw).hexdigest(), "contentDigest": manifest["contentDigest"]},
    "gates": gates,
    "diagnostics": [],
    "diagnosticsTruncated": False,
}
Path(args.report).write_text(json.dumps(report, sort_keys=True) + "\n", encoding="utf-8")
"""


def make_self_test_receipt(
    path: Path, fwu: Path, content_digest: str, registry_raw: bytes
) -> None:
    raw = fwu.read_bytes()
    receipt = {
        "reportFormatVersion": 1,
        "validatorId": FWU_VALIDATOR_ID,
        "status": "valid",
        "input": {
            "file": fwu.name,
            "bytes": len(raw),
            "sha256": sha256_bytes(raw),
            "manifestSha256": "1" * 64,
        },
        "package": {
            "archiveRoot": "fixture.fwu-owl",
            "contentDigest": content_digest,
            "fieldSemanticsRegistry": {
                "path": "contracts/registry.json",
                "bytes": len(registry_raw),
                "sha256": sha256_bytes(registry_raw),
            },
            "manifestSha256": "1" * 64,
            "releaseId": "org.skillpilot.fixture@1.0.0",
            "sourceJsonPackage": {"file": "self-test-original.json.zip"},
        },
        "gates": [
            {"id": gate, "status": "passed", "summary": "self-test"}
            for gate in FWU_GATES
        ],
        "diagnostics": [],
        "diagnosticsTruncated": False,
    }
    path.write_text(json.dumps(receipt, sort_keys=True) + "\n", encoding="utf-8")


def run_self_test() -> None:
    passed = 0
    tmp_root = ensure_directory(REPO_ROOT / "tmp")
    with tempfile.TemporaryDirectory(
        prefix="fwu-reverse-hermetic-selftest-", dir=tmp_root
    ) as directory:
        root = Path(directory)
        fwu = root / "fixture.fwu-owl.zip"
        registry_raw = (
            json.dumps(
                {"registryId": "fixture-registry", "version": "1.0.0", "entries": []},
                sort_keys=True,
            )
            + "\n"
        ).encode("utf-8")
        with zipfile.ZipFile(
            fwu, "w", compression=zipfile.ZIP_STORED, allowZip64=False
        ) as archive:
            archive.writestr("fixture.fwu-owl/contracts/registry.json", registry_raw)
        content_digest = "sha256:" + "2" * 64
        receipt = root / "fwu-validation-report.json"
        make_self_test_receipt(receipt, fwu, content_digest, registry_raw)
        compiler = root / "fake-reverse-compiler.py"
        compiler.write_text(FAKE_COMPILER_SOURCE, encoding="utf-8")
        validator = root / "fake-full-validator.py"
        validator.write_text(FAKE_VALIDATOR_SOURCE, encoding="utf-8")
        report = root / "reverse-report.json"
        args = argparse.Namespace(
            fwu_owl_zip=fwu,
            validation_report=receipt,
            compiler=compiler,
            full_validator=validator,
            output_dir=root / "output",
            evidence_dir=root / "evidence",
            report=report,
        )
        result = execute(args)
        os.close(args._report_parent_descriptor)
        del args._report_parent_descriptor
        if result["status"] != "valid" or result["diagnostics"] != []:
            raise RunnerError("self-test deterministic isolated builds did not pass")
        passed += 1
        if result["runs"]["runA"]["output"]["counts"] != {
            "zipEntries": 5,
            "manifestFiles": 3,
            "checksumRows": 4,
            "logicalArtifacts": 1,
            "binaryResources": 1,
            "binaryBytes": 8,
        }:
            raise RunnerError("self-test reconstructed ZIP counts differ")
        passed += 1
        if not result["reproducibility"]["zipByteIdentical"]:
            raise RunnerError("self-test did not prove byte reproducibility")
        passed += 1
        isolation = result["isolation"]
        if any(
            isolation[key]
            for key in (
                "originalJsonPackageAccessible",
                "authoringCheckoutAccessible",
                "forwardExporterAccessible",
                "networkAccessible",
            )
        ):
            raise RunnerError("self-test isolation claims are not closed")
        passed += 1
        python_runtime = isolation.get("pythonRuntime")
        if (
            not isinstance(python_runtime, dict)
            or python_runtime.get("siteEnabled") is not False
            or python_runtime.get("minimumVersion") != "3.10"
            or not str(python_runtime.get("executable", {}).get("path", "")).startswith(
                "/usr/bin/python3"
            )
            or "/usr" in python_runtime.get("mountedRoots", [])
        ):
            raise RunnerError(
                "self-test Python runtime binding is not minimal and pinned"
            )
        passed += 1
        if any(
            isolation[run][field] != 0
            for run in ("runA", "runB")
            for field in ("forbiddenReadCount", "networkAttemptCount")
        ):
            raise RunnerError("self-test trace audit observed a forbidden operation")
        passed += 1
        for run_name in ("runA", "runB"):
            run = result["runs"][run_name]
            evidence = run.get("evidence", {})
            if set(evidence) != {
                "compilerReport",
                "isolationProbe",
                "sandboxLog",
                "outputTreeManifest",
                "fullValidatorLog",
                "runtimeClosureManifest",
                "hostRawTrace",
                "traceProcessTreeManifest",
            }:
                raise RunnerError("self-test per-run evidence set is incomplete")
            probe_path = (report.parent / evidence["isolationProbe"]["path"]).resolve(
                strict=True
            )
            probe = load_json_bytes(
                probe_path.read_bytes(), "self-test isolation probe"
            )
            checks = probe["checks"]
            if (
                checks.get("traceFdClosed") is not True
                or checks.get("networkNamespaceIsolated") is not True
                or checks.get("temporaryNames") != []
                or any(item["accessible"] for item in checks["hostRootSentinels"])
            ):
                raise RunnerError(
                    "self-test namespace probe did not close the host view"
                )
            runtime_path = (
                report.parent / evidence["runtimeClosureManifest"]["path"]
            ).resolve(strict=True)
            runtime_manifest = load_json_bytes(
                runtime_path.read_bytes(), "self-test runtime closure manifest"
            )
            trace_runtime = runtime_manifest.get("traceToolRuntime")
            if not isinstance(trace_runtime, dict):
                raise RunnerError("self-test runtime closure lacks trace-tool bindings")
            runtime_bindings = [
                trace_runtime.get("executable"),
                trace_runtime.get("elfInterpreter"),
                *trace_runtime.get("libraries", []),
            ]
            if not runtime_bindings or any(
                not isinstance(binding, dict) for binding in runtime_bindings
            ):
                raise RunnerError("self-test trace-tool runtime bindings are malformed")
            for binding in runtime_bindings:
                with PinnedFile(
                    Path(binding["path"]), maximum=1_000_000_000
                ) as runtime_file:
                    header = os.pread(runtime_file.descriptor, 6, 0)
                    if (
                        runtime_file.size != binding.get("bytes")
                        or runtime_file.sha256 != binding.get("sha256")
                        or len(header) != 6
                        or header[:4] != b"\x7fELF"
                        or header[4] not in {1, 2}
                        or header[5] not in {1, 2}
                    ):
                        raise RunnerError(
                            "self-test trace-tool runtime contains a non-ELF or drifted file"
                        )
        passed += 1
        synthetic_trace = root / "synthetic-network.strace"
        synthetic_trace.write_text(
            "1 socket(AF_UNIX, SOCK_STREAM, 0) = 3\n"
            '1 connect(3, {sa_family=AF_UNIX, sun_path="/tmp/x"}, 8) = -1 ENOENT\n'
            '1 sendto(3, "x", 1, 0, NULL, 0) = -1 ENOTCONN\n'
            '1 newfstatat(AT_FDCWD, "/home", 0x0, 0) = -1 ENOENT\n'
            '1 openat(AT_FDCWD, "/home/secret", O_RDONLY) = 4\n'
            '1 openat(AT_FDCWD, "/opt/reverse-runner/x", O_RDONLY) = 4\n',
            encoding="utf-8",
        )
        if trace_audit(synthetic_trace, ("/home", "/run")) != (3, 1):
            raise RunnerError(
                "self-test trace audit missed AF_UNIX/network or path boundaries"
            )
        passed += 1
        if any(
            result["runs"][run]["validationReceipt"]["status"] != "valid"
            for run in ("runA", "runB")
        ):
            raise RunnerError("self-test did not bind both full-validator receipts")
        passed += 1
        try:
            from jsonschema import Draft202012Validator

            schema = load_json_bytes(
                (
                    REPO_ROOT / "contracts/curriculum-package/v1/"
                    "fwu-owl-reverse-compilation-report.schema.json"
                ).read_bytes(),
                "reverse compilation report schema",
            )
            errors = list(Draft202012Validator(schema).iter_errors(result))
        except (ImportError, OSError) as error:
            raise RunnerError(
                f"cannot validate self-test report schema: {error}"
            ) from error
        if errors:
            raise RunnerError(
                "self-test report violates its schema: "
                + "; ".join(error.message for error in errors[:10])
            )
        passed += 1
        safe_atomic_write(report, render_report(result))
        contract_result = subprocess.run(
            [
                sys.executable,
                "-B",
                str(REPORT_CONTRACT_VALIDATOR),
                "--self-test",
            ],
            cwd=REPO_ROOT,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=60,
            check=False,
        )
        if contract_result.returncode != 0:
            raise RunnerError(
                "external contract validator self-test failed: "
                + contract_result.stdout[-2_000:]
            )
        passed += 1
        trace_path = (report.parent / result["isolation"]["runA"]["path"]).resolve(
            strict=True
        )
        trace_raw = trace_path.read_bytes()
        expected_trace_sha = result["isolation"]["runA"]["sha256"]
        trace_path.write_bytes(trace_raw + b"\n# bounded tamper\n")
        tampered_sha = sha256_bytes(trace_path.read_bytes())
        safe_atomic_write(trace_path, trace_raw)
        if (
            tampered_sha == expected_trace_sha
            or sha256_bytes(trace_path.read_bytes()) != expected_trace_sha
            or trace_path.read_bytes() != trace_raw
        ):
            raise RunnerError("self-test did not detect and recover trace tamper")
        passed += 1
        early_invalid = build_early_report(
            args,
            status="invalid",
            code="REVERSE_COMPILATION_INVALID",
            message="bounded synthetic invalid input",
        )
        early_error = build_early_report(
            args,
            status="error",
            code="REVERSE_COMPILATION_ERROR",
            message="bounded synthetic tool failure",
        )
        if (
            early_invalid["status"] != "invalid"
            or early_error["status"] != "error"
            or not early_invalid["diagnostics"]
            or not early_error["diagnostics"]
        ):
            raise RunnerError("early non-success receipts are not fail-closed")
        for status, early in (
            ("invalid", early_invalid),
            ("error", early_error),
        ):
            early_path = root / f"early-{status}.json"
            safe_atomic_write(early_path, render_report(early))
            checked = subprocess.run(
                [
                    sys.executable,
                    "-B",
                    str(REPORT_CONTRACT_VALIDATOR),
                    "--report",
                    str(early_path),
                ],
                cwd=REPO_ROOT,
                stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                timeout=60,
                check=False,
            )
            if checked.returncode != 0:
                raise RunnerError(
                    f"external contract rejected early {status} receipt: "
                    + checked.stdout[-2_000:]
                )
        passed += 1

        symlink = root / "symlink.fwu-owl.zip"
        symlink.symlink_to(fwu)
        try:
            PinnedFile(symlink, maximum=1_024)
        except InvalidInput:
            passed += 1
        else:
            raise RunnerError("self-test accepted a symlinked FWU input")

        real_parent = root / "real-parent"
        real_parent.mkdir()
        (real_parent / "input.bin").write_bytes(b"anchored")
        parent_symlink = root / "parent-symlink"
        parent_symlink.symlink_to(real_parent, target_is_directory=True)
        try:
            PinnedFile(parent_symlink / "input.bin", maximum=1_024)
        except InvalidInput:
            passed += 1
        else:
            raise RunnerError("self-test accepted a symlinked input parent")

        rename_parent = root / "rename-parent"
        rename_parent.mkdir()
        rename_input = rename_parent / "input.bin"
        rename_input.write_bytes(b"original")
        with PinnedFile(rename_input, maximum=1_024) as pinned_rename:
            moved_parent = root / "rename-parent-moved"
            rename_parent.rename(moved_parent)
            rename_parent.mkdir()
            (rename_parent / "input.bin").write_bytes(b"attacker")
            if pinned_rename.read() != b"original":
                raise RunnerError("self-test parent rename changed a pinned input")
            pinned_rename.assert_unchanged()
        passed += 1

        mutation = root / "mutation.bin"
        mutation.write_bytes(b"before")
        with PinnedFile(mutation, maximum=1_024) as pinned_mutation:
            mutation.write_bytes(b"after!")
            try:
                pinned_mutation.assert_unchanged()
            except InvalidInput:
                passed += 1
            else:
                raise RunnerError("self-test missed input mutation")

        bad_receipt = root / "bad-receipt.json"
        make_self_test_receipt(bad_receipt, fwu, content_digest, registry_raw)
        value = json.loads(bad_receipt.read_text(encoding="utf-8"))
        value["input"]["sha256"] = "f" * 64
        bad_receipt.write_text(json.dumps(value) + "\n", encoding="utf-8")
        with (
            PinnedFile(fwu, maximum=1_024) as pinned_fwu,
            PinnedFile(bad_receipt, maximum=67_108_864) as pinned_receipt,
        ):
            try:
                validate_fwu_receipt(pinned_fwu, pinned_receipt)
            except InvalidInput:
                passed += 1
            else:
                raise RunnerError("self-test accepted a receipt for another FWU ZIP")

        first_zip = next((root / "output/run-a").rglob("*.json.zip"))
        divergent = root / "divergent.json.zip"
        shutil.copyfile(first_zip, divergent)
        with divergent.open("ab") as handle:
            handle.write(b"different")
        with (
            PinnedFile(first_zip, maximum=3_500_000_000) as first,
            PinnedFile(divergent, maximum=3_500_000_000) as second,
        ):
            if byte_identical(first, second):
                raise RunnerError("self-test accepted non-identical double builds")
        passed += 1

        unsafe_root = root / "unsafe"
        unsafe_root.mkdir()
        victim = root / "victim"
        victim.mkdir()
        (unsafe_root / "output").symlink_to(victim, target_is_directory=True)
        unsafe_args = argparse.Namespace(
            fwu_owl_zip=fwu,
            validation_report=receipt,
            compiler=compiler,
            full_validator=validator,
            output_dir=unsafe_root / "output",
            evidence_dir=unsafe_root / "evidence",
            report=unsafe_root / "report.json",
        )
        try:
            validate_path_layout(unsafe_args)
        except InvalidInput:
            passed += 1
        else:
            raise RunnerError("self-test accepted a symlinked output root")

        evidence_manifest_path = root / "evidence/evidence-manifest.json"
        manifest = load_json_bytes(
            evidence_manifest_path.read_bytes(), "self-test evidence manifest"
        )
        if not isinstance(manifest, dict) or len(manifest.get("files", [])) < 12:
            raise RunnerError("self-test evidence manifest is incomplete")
        passed += 1

    print(f"FWU-OWL reverse hermetic runner self-test passed: {passed} guarantees.")


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Hermetically reverse-compile a validated FWU-OWL package twice."
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--fwu-owl-zip", type=Path)
    mode.add_argument("--self-test", action="store_true")
    parser.add_argument("--validation-report", type=Path)
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--evidence-dir", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--expect-entry-count", type=int)
    parser.add_argument("--expect-manifest-file-count", type=int)
    parser.add_argument("--expect-checksum-row-count", type=int)
    parser.add_argument("--expect-logical-artifact-count", type=int)
    parser.add_argument("--expect-binary-resource-count", type=int)
    parser.add_argument("--expect-binary-bytes", type=int)
    args = parser.parse_args(argv)
    args.compiler = DEFAULT_COMPILER
    if not args.self_test:
        missing = [
            flag
            for flag, value in (
                ("--validation-report", args.validation_report),
                ("--output-dir", args.output_dir),
                ("--evidence-dir", args.evidence_dir),
                ("--report", args.report),
            )
            if value is None
        ]
        if missing:
            parser.error("production mode requires " + ", ".join(missing))
    return args


def render_report(value: Mapping[str, Any]) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, allow_nan=False, indent=2, sort_keys=True)
        + "\n"
    ).encode("utf-8")


def validate_external_report(value: Mapping[str, Any]) -> None:
    try:
        from jsonschema import Draft202012Validator

        schema = load_json_bytes(
            REPORT_SCHEMA_PATH.read_bytes(), "reverse report schema"
        )
        errors = sorted(
            Draft202012Validator(schema).iter_errors(value),
            key=lambda item: list(item.absolute_path),
        )
    except (ImportError, OSError) as error:
        raise RunnerError(
            f"cannot validate external reverse report: {error}"
        ) from error
    if errors:
        rendered = "; ".join(
            f"/{'/'.join(map(str, error.absolute_path))}: {error.message}"
            for error in errors[:20]
        )
        raise RunnerError(
            f"external reverse report violates its trust-root schema: {rendered}"
        )


def optional_early_evidence(args: argparse.Namespace) -> dict[str, Any]:
    evidence: dict[str, Any] = {}
    try:
        with PinnedFile(RUNNER_PATH, maximum=16_777_216) as runner:
            evidence["runner"] = {
                "id": RUNNER_ID,
                "version": RUNNER_VERSION,
                "executable": {
                    "path": str(runner.path),
                    "bytes": runner.size,
                    "sha256": runner.sha256,
                },
            }
    except (InvalidInput, RunnerError, OSError):
        pass
    try:
        with PinnedFile(SANDBOX_ENTRY, maximum=16_777_216) as sandbox_entry:
            evidence["sandboxEntry"] = {
                "id": SANDBOX_ENTRY_ID,
                "version": SANDBOX_ENTRY_VERSION,
                "executable": {
                    "path": str(sandbox_entry.path),
                    "bytes": sandbox_entry.size,
                    "sha256": sandbox_entry.sha256,
                },
            }
    except (InvalidInput, RunnerError, OSError):
        pass
    try:
        with PinnedFile(args.compiler, maximum=16_777_216) as compiler:
            evidence["compiler"] = {
                "id": COMPILER_ID,
                "version": COMPILER_VERSION,
                "executable": {
                    "path": str(compiler.path),
                    "bytes": compiler.size,
                    "sha256": compiler.sha256,
                },
            }
    except (InvalidInput, RunnerError, OSError):
        pass
    try:
        validator_path = getattr(args, "full_validator", FULL_PACKAGE_VALIDATOR)
        with PinnedFile(validator_path, maximum=16_777_216) as validator:
            evidence["packageValidator"] = {
                "id": FULL_PACKAGE_VALIDATOR_ID,
                "version": FULL_PACKAGE_VALIDATOR_VERSION,
                "executable": {
                    "path": str(validator.path),
                    "bytes": validator.size,
                    "sha256": validator.sha256,
                },
            }
    except (InvalidInput, RunnerError, OSError):
        pass
    try:
        with (
            PinnedFile(args.fwu_owl_zip, maximum=3_500_000_000) as fwu,
            PinnedFile(args.validation_report, maximum=67_108_864) as receipt,
        ):
            validation_binding, manifest_sha, content_digest = validate_fwu_receipt(
                fwu, receipt
            )
            evidence["input"] = {
                "fwuOwlPackage": {
                    "path": str(fwu.path),
                    "bytes": fwu.size,
                    "sha256": fwu.sha256,
                    "manifestSha256": manifest_sha,
                    "contentDigest": content_digest,
                },
                "validationReceipt": validation_binding,
            }
    except (InvalidInput, RunnerError, OSError):
        pass
    return evidence


def build_early_report(
    args: argparse.Namespace, *, status: str, code: str, message: str
) -> dict[str, Any]:
    report: dict[str, Any] = {
        "$schema": REPORT_SCHEMA_ID,
        "reportFormatVersion": 1,
        "validatorId": VALIDATOR_ID,
        "status": status,
        "diagnostics": [{"code": code, "location": "/", "message": message[:4_000]}],
        "diagnosticsTruncated": False,
    }
    report.update(optional_early_evidence(args))
    validate_external_report(report)
    return report


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    if args.self_test:
        try:
            run_self_test()
            return 0
        except (InvalidInput, RunnerError) as error:
            print(
                f"FWU-OWL reverse hermetic self-test failed: {error}", file=sys.stderr
            )
            return 2
    try:
        # Establish the report target and all aliases before any mutation.  A
        # path-layout failure deliberately emits no receipt, because the target
        # itself has not earned write trust.
        validate_path_layout(args)
    except InvalidInput as error:
        print(f"FWU-OWL reverse compilation invalid: {error}", file=sys.stderr)
        return 1
    try:
        expected_counts = {
            key: value
            for key, value in (
                ("zipEntries", args.expect_entry_count),
                ("manifestFiles", args.expect_manifest_file_count),
                ("checksumRows", args.expect_checksum_row_count),
                ("logicalArtifacts", args.expect_logical_artifact_count),
                ("binaryResources", args.expect_binary_resource_count),
                ("binaryBytes", args.expect_binary_bytes),
            )
            if value is not None
        }
        if any(value < 0 for value in expected_counts.values()):
            raise InvalidInput("explicit expected counts must be non-negative")
        report = execute(args, expected_counts=expected_counts or None)
        validate_external_report(report)
        report_parent_descriptor = args._report_parent_descriptor
        assert_directory_path_identity(
            args.report.parent,
            report_parent_descriptor,
            args._report_parent_identity,
        )
        safe_atomic_write_at(
            report_parent_descriptor, args.report.name, render_report(report)
        )
        os.close(report_parent_descriptor)
        del args._report_parent_descriptor
        print(f"FWU-OWL reverse compilation valid: {args.report}")
        return 0
    except InvalidInput as error:
        if hasattr(args, "_report_parent_descriptor"):
            os.close(args._report_parent_descriptor)
            del args._report_parent_descriptor
        try:
            early = build_early_report(
                args,
                status="invalid",
                code="REVERSE_COMPILATION_INVALID",
                message=str(error),
            )
            safe_atomic_write(args.report, render_report(early))
        except (InvalidInput, RunnerError, OSError) as report_error:
            print(f"Could not persist invalid receipt: {report_error}", file=sys.stderr)
        print(f"FWU-OWL reverse compilation invalid: {error}", file=sys.stderr)
        return 1
    except RunnerError as error:
        if hasattr(args, "_report_parent_descriptor"):
            os.close(args._report_parent_descriptor)
            del args._report_parent_descriptor
        try:
            early = build_early_report(
                args,
                status="error",
                code="REVERSE_COMPILATION_ERROR",
                message=str(error),
            )
            safe_atomic_write(args.report, render_report(early))
        except (InvalidInput, RunnerError, OSError) as report_error:
            print(f"Could not persist error receipt: {report_error}", file=sys.stderr)
        print(f"FWU-OWL reverse compilation error: {error}", file=sys.stderr)
        return 2
    except Exception as error:  # noqa: BLE001 - convert unexpected failures to error evidence
        if hasattr(args, "_report_parent_descriptor"):
            os.close(args._report_parent_descriptor)
            del args._report_parent_descriptor
        message = f"{type(error).__name__}: {error}"
        try:
            early = build_early_report(
                args,
                status="error",
                code="REVERSE_COMPILATION_INTERNAL_ERROR",
                message=message,
            )
            safe_atomic_write(args.report, render_report(early))
        except (InvalidInput, RunnerError, OSError) as report_error:
            print(
                f"Could not persist internal-error receipt: {report_error}",
                file=sys.stderr,
            )
        print(f"FWU-OWL reverse compilation error: {message}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
