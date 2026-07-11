#!/usr/bin/env python3
"""Provision validated curriculum ZIPs into a locked content-addressed store.

The runtime is deliberately read-only.  This command is the sole local writer for
the package store: it quarantines an input, invokes the independent finished-ZIP
validator, extracts an exact tree without ``extractall``, promotes immutable
evidence, and changes the active package set only through an explicit CAS.
"""

from __future__ import annotations

import argparse
import contextlib
import fcntl
import hashlib
import json
import os
import re
import stat
import subprocess
import sys
import tempfile
import time
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Iterator, Mapping, Sequence

sys.dont_write_bytecode = True

from jsonschema import Draft202012Validator  # noqa: E402


REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_DIR = REPO_ROOT / "contracts" / "curriculum-package" / "v1"
PROFILE_PATH = CONTRACT_DIR / "profiles" / "full-standalone-v1.profile.json"
VALIDATOR_PATH = Path(__file__).resolve().with_name(
    "validate_full_standalone_curriculum_package.py"
)

VALIDATOR_ID = "skillpilot-full-standalone-package-validator-v2"
VALIDATOR_REPORT_FORMAT_VERSION = 2
INSTALL_RECORD_FORMAT_VERSION = "1.0"
LOCK_FORMAT_VERSION = "1.0"
REQUIRED_GATES = (
    "inventory",
    "runtimeCatalog",
    "offlineSchemaCatalog",
    "hardReferenceClosure",
    "contentDigest",
    "assetBytes",
)

SHA256_RE = re.compile(r"^[a-f0-9]{64}$")
DIGEST_RE = re.compile(r"^sha256:[a-f0-9]{64}$")
PACKAGE_ID_RE = re.compile(r"^[a-z0-9]+(?:[._-][a-z0-9]+)+$")
SEMVER_RE = re.compile(
    r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)"
    r"(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
)
SOFTWARE_RANGE_RE = re.compile(
    r"^>=(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*) "
    r"<(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$"
)
PORTABLE_SEGMENT_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,179}$")
PORTABLE_PATH_RE = re.compile(
    r"^[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*$"
)
WINDOWS_RESERVED = {
    "con",
    "prn",
    "aux",
    "nul",
    *(f"com{number}" for number in range(1, 10)),
    *(f"lpt{number}" for number in range(1, 10)),
}
ARCHIVE_SUFFIXES = (
    ".7z",
    ".bz2",
    ".gz",
    ".rar",
    ".tar",
    ".tar.bz2",
    ".tar.gz",
    ".tgz",
    ".zip",
)
ARCHIVE_MAGICS = (
    b"PK\x03\x04",
    b"PK\x05\x06",
    b"PK\x07\x08",
    b"7z\xbc\xaf\x27\x1c",
    b"\x1f\x8b",
    b"BZh",
    b"Rar!\x1a\x07",
    b"\xfd7zXZ\x00",
)
READ_CHUNK = 4 * 1024 * 1024
MAX_CONTROL_BYTES = 64 * 1024 * 1024
MAX_REPORT_BYTES = 16 * 1024 * 1024
MAX_INSTALL_RECORD_BYTES = 4 * 1024 * 1024
MAX_LOCK_BYTES = 4 * 1024 * 1024
MAX_INSTALLED_RECORDS = 100_000
DEFAULT_VALIDATOR_TIMEOUT_SECONDS = 1_800


class ProvisioningError(RuntimeError):
    """Base class with a stable process-exit classification."""


class PackageRejected(ProvisioningError):
    """The candidate, store state, compatibility, or CAS request is invalid."""


class TrustFailure(ProvisioningError):
    """Trusted tooling or an I/O/security boundary could not be established."""


class DuplicateJsonKey(ValueError):
    def __init__(self, key: str) -> None:
        super().__init__(f"duplicate JSON object key {key!r}")
        self.key = key


@dataclass(frozen=True)
class StoreLayout:
    root: Path
    quarantine: Path
    staging: Path
    objects: Path
    validation_reports: Path
    install_records: Path
    locks: Path
    lock_history: Path
    process_lock: Path


@dataclass(frozen=True)
class QuarantinedZip:
    path: Path
    descriptor: int
    sha256: str
    size: int
    identity: tuple[int, int, int, int, int, int]

    def close(self) -> None:
        os.close(self.descriptor)


@dataclass(frozen=True)
class VerifiedInstall:
    record: dict[str, Any]
    record_bytes: bytes
    record_sha256: str
    report: dict[str, Any]
    report_bytes: bytes
    manifest: dict[str, Any]
    manifest_bytes: bytes
    package_root: Path


def reject_duplicate_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise DuplicateJsonKey(key)
        result[key] = value
    return result


def parse_json_bytes(raw: bytes, description: str, *, maximum: int) -> Any:
    if len(raw) > maximum:
        raise PackageRejected(f"{description} exceeds {maximum} bytes")

    def reject_constant(value: str) -> Any:
        raise ValueError(f"non-finite JSON constant {value!r}")

    try:
        text = raw.decode("utf-8", "strict")
        decoder = json.JSONDecoder(
            object_pairs_hook=reject_duplicate_pairs,
            parse_constant=reject_constant,
        )
        value, offset = decoder.raw_decode(text)
        if text[offset:].strip():
            raise ValueError("trailing JSON token")
        return value
    except (UnicodeError, json.JSONDecodeError, DuplicateJsonKey, ValueError) as error:
        raise PackageRejected(f"Cannot parse {description}: {error}") from error


def object_value(value: Any, description: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise PackageRejected(f"{description} must be a JSON object")
    return value


def stable_json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    ).encode("utf-8")


def sha256_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha256_file_descriptor(descriptor: int, expected_size: int | None = None) -> str:
    digest = hashlib.sha256()
    offset = 0
    while True:
        chunk = os.pread(descriptor, READ_CHUNK, offset)
        if not chunk:
            break
        digest.update(chunk)
        offset += len(chunk)
    if expected_size is not None and offset != expected_size:
        raise TrustFailure(
            f"File size changed while hashing: expected {expected_size}, read {offset}"
        )
    return digest.hexdigest()


def sha256_regular_file(path: Path, *, maximum: int | None = None) -> tuple[str, int]:
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(path, flags)
    except OSError as error:
        raise TrustFailure(f"Cannot open regular file {path}: {error}") from error
    try:
        info = os.fstat(descriptor)
        if not stat.S_ISREG(info.st_mode):
            raise TrustFailure(f"Expected regular file: {path}")
        if maximum is not None and info.st_size > maximum:
            raise PackageRejected(f"{path} exceeds {maximum} bytes")
        return sha256_file_descriptor(descriptor, info.st_size), info.st_size
    finally:
        os.close(descriptor)


def read_regular_file(path: Path, description: str, *, maximum: int) -> bytes:
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(path, flags)
    except OSError as error:
        raise TrustFailure(f"Cannot open {description} {path}: {error}") from error
    try:
        info = os.fstat(descriptor)
        if not stat.S_ISREG(info.st_mode):
            raise TrustFailure(f"{description} must be a regular non-symlink file: {path}")
        if info.st_size > maximum:
            raise PackageRejected(f"{description} exceeds {maximum} bytes")
        raw = bytearray()
        while len(raw) < info.st_size:
            chunk = os.read(descriptor, min(READ_CHUNK, info.st_size - len(raw)))
            if not chunk:
                break
            raw.extend(chunk)
        if len(raw) != info.st_size:
            raise TrustFailure(f"{description} changed while reading: {path}")
        return bytes(raw)
    finally:
        os.close(descriptor)


def path_is_portable(path: str, *, maximum_bytes: int) -> bool:
    if (
        not path
        or path.startswith("/")
        or "\\" in path
        or len(path.encode("utf-8")) > maximum_bytes
        or not PORTABLE_PATH_RE.fullmatch(path)
    ):
        return False
    for segment in path.split("/"):
        if (
            segment in {"", ".", ".."}
            or segment.endswith((".", " "))
            or segment.casefold().split(".", 1)[0] in WINDOWS_RESERVED
        ):
            return False
    return True


def assert_no_path_prefix_collisions(paths: Iterable[str], description: str) -> None:
    ordered = sorted(paths)
    lowered: dict[str, str] = {}
    for path in ordered:
        key = path.casefold()
        previous = lowered.get(key)
        if previous is not None:
            raise PackageRejected(
                f"{description} has a portable path collision: {previous!r}, {path!r}"
            )
        lowered[key] = path
    path_set = set(ordered)
    for path in ordered:
        parts = path.split("/")
        for length in range(1, len(parts)):
            prefix = "/".join(parts[:length])
            if prefix in path_set:
                raise PackageRejected(
                    f"{description} has a file/directory prefix collision: {prefix!r}, {path!r}"
                )


def require_exact_keys(value: Mapping[str, Any], expected: set[str], description: str) -> None:
    actual = set(value)
    if actual != expected:
        raise PackageRejected(
            f"{description} fields differ; missing={sorted(expected - actual) or '-'}, "
            f"unknown={sorted(actual - expected) or '-'}"
        )


def require_text(value: Mapping[str, Any], field: str, description: str) -> str:
    item = value.get(field)
    if not isinstance(item, str) or not item:
        raise PackageRejected(f"{description}.{field} must be non-empty text")
    return item


def require_sha(value: Mapping[str, Any], field: str, description: str) -> str:
    item = require_text(value, field, description)
    if not SHA256_RE.fullmatch(item):
        raise PackageRejected(f"{description}.{field} must be lowercase SHA-256")
    return item


def require_digest(value: Mapping[str, Any], field: str, description: str) -> str:
    item = require_text(value, field, description)
    if not DIGEST_RE.fullmatch(item):
        raise PackageRejected(f"{description}.{field} must be sha256:<lowercase hash>")
    return item


def require_integer(
    value: Mapping[str, Any], field: str, description: str, *, minimum: int, maximum: int
) -> int:
    item = value.get(field)
    if not isinstance(item, int) or isinstance(item, bool) or not minimum <= item <= maximum:
        raise PackageRejected(
            f"{description}.{field} must be an integer in {minimum}..{maximum}"
        )
    return item


def trusted_json(path: Path, description: str) -> dict[str, Any]:
    raw = read_regular_file(path, description, maximum=MAX_CONTROL_BYTES)
    return object_value(
        parse_json_bytes(raw, description, maximum=MAX_CONTROL_BYTES), description
    )


def load_profile() -> dict[str, Any]:
    profile = trusted_json(PROFILE_PATH, "trusted package profile")
    if profile.get("profileFormatVersion") != 1 or profile.get("profileId") != "full-standalone-v1":
        raise TrustFailure("Unexpected trusted full-standalone package profile")
    limits = profile.get("archiveLimits")
    if not isinstance(limits, dict):
        raise TrustFailure("Trusted package profile has no archiveLimits")
    return profile


def load_operational_validators() -> dict[str, Draft202012Validator]:
    bindings = {
        "report": (
            CONTRACT_DIR / "full-package-validation-report.schema.json",
            "https://skillpilot.com/schemas/curriculum-package/v1/full-package-validation-report.schema.json",
        ),
        "record": (
            CONTRACT_DIR / "installed-package-record.schema.json",
            "https://skillpilot.com/schemas/curriculum-package/v1/installed-package-record.schema.json",
        ),
        "lock": (
            CONTRACT_DIR / "active-package-lock.schema.json",
            "https://skillpilot.com/schemas/curriculum-package/v1/active-package-lock.schema.json",
        ),
    }
    validators: dict[str, Draft202012Validator] = {}
    for name, (path, expected_id) in bindings.items():
        schema = trusted_json(path, f"trusted operational {name} schema")
        try:
            Draft202012Validator.check_schema(schema)
        except Exception as error:
            raise TrustFailure(f"Invalid trusted operational schema {path}: {error}") from error
        if schema.get("$id") != expected_id:
            raise TrustFailure(f"Unexpected operational schema identity for {path}")
        validators[name] = Draft202012Validator(schema)
    return validators


def validate_schema(
    value: Any, validator: Draft202012Validator, description: str
) -> None:
    errors = sorted(
        validator.iter_errors(value),
        key=lambda item: (
            tuple(str(part) for part in item.absolute_path),
            item.message,
        ),
    )
    if errors:
        first = errors[0]
        location = "/" + "/".join(str(part) for part in first.absolute_path)
        raise PackageRejected(f"{description} violates its schema at {location}: {first.message}")


def lstat_directory(path: Path, description: str) -> os.stat_result:
    try:
        info = path.lstat()
    except OSError as error:
        raise TrustFailure(f"Cannot inspect {description} {path}: {error}") from error
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
        raise TrustFailure(f"{description} must be a real directory: {path}")
    return info


def ensure_absolute_directory_tree(path: Path, *, final_mode: int = 0o700) -> None:
    absolute = Path(os.path.abspath(path))
    if not absolute.is_absolute():
        raise TrustFailure(f"Store path is not absolute: {path}")
    parts = absolute.parts
    current = Path(parts[0])
    for index, part in enumerate(parts[1:], start=1):
        current = current / part
        try:
            info = current.lstat()
        except FileNotFoundError:
            mode = final_mode if index == len(parts) - 1 else 0o755
            try:
                current.mkdir(mode=mode)
            except OSError as error:
                raise TrustFailure(f"Cannot create directory {current}: {error}") from error
            info = current.lstat()
        except OSError as error:
            raise TrustFailure(f"Cannot inspect path component {current}: {error}") from error
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
            raise TrustFailure(f"Symlink/non-directory path component is forbidden: {current}")


def ensure_private_child(parent: Path, name: str) -> Path:
    if not PORTABLE_SEGMENT_RE.fullmatch(name):
        raise TrustFailure(f"Unsafe internal store directory name: {name!r}")
    child = parent / name
    try:
        child.mkdir(mode=0o700)
    except FileExistsError:
        pass
    except OSError as error:
        raise TrustFailure(f"Cannot create store directory {child}: {error}") from error
    info = lstat_directory(child, "store directory")
    if hasattr(os, "getuid") and info.st_uid != os.getuid():
        raise TrustFailure(f"Store directory is not owned by the provisioning user: {child}")
    if stat.S_IMODE(info.st_mode) & 0o022:
        raise TrustFailure(f"Store directory must not be group/world writable: {child}")
    return child


def prepare_store(path: Path) -> StoreLayout:
    root = Path(os.path.abspath(path))
    ensure_absolute_directory_tree(root)
    info = lstat_directory(root, "package store")
    if hasattr(os, "getuid") and info.st_uid != os.getuid():
        raise TrustFailure(f"Package store is not owned by the provisioning user: {root}")
    if stat.S_IMODE(info.st_mode) & 0o022:
        raise TrustFailure(f"Package store must not be group/world writable: {root}")
    quarantine = ensure_private_child(root, "quarantine")
    staging = ensure_private_child(root, "staging")
    objects = ensure_private_child(root, "objects")
    sha_root = ensure_private_child(objects, "sha256")
    reports = ensure_private_child(root, "validation-reports")
    records = ensure_private_child(root, "install-records")
    locks = ensure_private_child(root, "locks")
    history = ensure_private_child(locks, "history")
    return StoreLayout(
        root=root,
        quarantine=quarantine,
        staging=staging,
        objects=sha_root,
        validation_reports=reports,
        install_records=records,
        locks=locks,
        lock_history=history,
        process_lock=root / ".provisioner.lock",
    )


@contextlib.contextmanager
def exclusive_store_lock(layout: StoreLayout) -> Iterator[None]:
    flags = (
        os.O_RDWR
        | os.O_CREAT
        | getattr(os, "O_CLOEXEC", 0)
        | getattr(os, "O_NOFOLLOW", 0)
    )
    try:
        descriptor = os.open(layout.process_lock, flags, 0o600)
    except OSError as error:
        raise TrustFailure(f"Cannot open provisioner lock: {error}") from error
    try:
        info = os.fstat(descriptor)
        if not stat.S_ISREG(info.st_mode):
            raise TrustFailure("Provisioner lock must be a regular file")
        if hasattr(os, "getuid") and info.st_uid != os.getuid():
            raise TrustFailure("Provisioner lock is not owned by the provisioning user")
        if stat.S_IMODE(info.st_mode) & 0o022:
            raise TrustFailure("Provisioner lock must not be group/world writable")
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        yield
    finally:
        with contextlib.suppress(OSError):
            fcntl.flock(descriptor, fcntl.LOCK_UN)
        os.close(descriptor)


def fsync_directory(path: Path) -> None:
    flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0)
    descriptor = os.open(path, flags)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def write_immutable(path: Path, raw: bytes) -> None:
    if path.exists() or path.is_symlink():
        require_store_file_metadata(path, "immutable store file", mode=0o444)
        existing = read_regular_file(path, "immutable store file", maximum=max(len(raw), MAX_REPORT_BYTES))
        if existing != raw:
            raise TrustFailure(f"Immutable store identity conflict: {path}")
        return
    temporary = path.with_name(f".{path.name}.tmp-{os.getpid()}-{time.time_ns()}")
    flags = (
        os.O_WRONLY
        | os.O_CREAT
        | os.O_EXCL
        | getattr(os, "O_CLOEXEC", 0)
        | getattr(os, "O_NOFOLLOW", 0)
    )
    descriptor = -1
    try:
        descriptor = os.open(temporary, flags, 0o600)
        view = memoryview(raw)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:
                raise TrustFailure(f"Short write to {temporary}")
            view = view[written:]
        os.fchmod(descriptor, 0o444)
        os.fsync(descriptor)
        os.close(descriptor)
        descriptor = -1
        try:
            os.link(temporary, path, follow_symlinks=False)
        except FileExistsError:
            existing = read_regular_file(
                path, "immutable store file", maximum=max(len(raw), MAX_REPORT_BYTES)
            )
            if existing != raw:
                raise TrustFailure(f"Immutable store identity conflict: {path}")
        fsync_directory(path.parent)
    finally:
        if descriptor >= 0:
            os.close(descriptor)
        with contextlib.suppress(OSError):
            temporary.unlink()


def atomic_replace(
    path: Path,
    raw: bytes,
    *,
    before_replace: Callable[[], None] | None = None,
) -> str:
    temporary = path.with_name(f".{path.name}.tmp-{os.getpid()}-{time.time_ns()}")
    flags = (
        os.O_WRONLY
        | os.O_CREAT
        | os.O_EXCL
        | getattr(os, "O_CLOEXEC", 0)
        | getattr(os, "O_NOFOLLOW", 0)
    )
    descriptor = -1
    try:
        descriptor = os.open(temporary, flags, 0o600)
        view = memoryview(raw)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:
                raise TrustFailure(f"Short write to {temporary}")
            view = view[written:]
        os.fchmod(descriptor, 0o444)
        os.fsync(descriptor)
        os.close(descriptor)
        descriptor = -1
        if before_replace is not None:
            before_replace()
        os.replace(temporary, path)
        fsync_directory(path.parent)
        return sha256_bytes(raw)
    finally:
        if descriptor >= 0:
            os.close(descriptor)
        with contextlib.suppress(OSError):
            temporary.unlink()


def file_identity(info: os.stat_result) -> tuple[int, int, int, int, int, int]:
    return (
        info.st_dev,
        info.st_ino,
        info.st_size,
        info.st_mtime_ns,
        info.st_ctime_ns,
        info.st_nlink,
    )


def quarantine_input(
    source: Path, layout: StoreLayout, *, outer_limit: int
) -> QuarantinedZip:
    source_path = Path(os.path.abspath(source))
    source_flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    try:
        source_descriptor = os.open(source_path, source_flags)
    except OSError as error:
        raise TrustFailure(f"Cannot open input ZIP {source_path}: {error}") from error
    temporary_path = layout.quarantine / f".candidate-{os.getpid()}-{time.time_ns()}.tmp"
    quarantine_path = temporary_path
    target_descriptor = -1
    try:
        before = os.fstat(source_descriptor)
        if not stat.S_ISREG(before.st_mode):
            raise PackageRejected("Input ZIP must be a regular non-symlink file")
        if before.st_size <= 0 or before.st_size > outer_limit:
            raise PackageRejected(
                f"Input ZIP size {before.st_size} is outside 1..{outer_limit}"
            )
        target_flags = (
            os.O_RDWR
            | os.O_CREAT
            | os.O_EXCL
            | getattr(os, "O_CLOEXEC", 0)
            | getattr(os, "O_NOFOLLOW", 0)
        )
        target_descriptor = os.open(temporary_path, target_flags, 0o600)
        digest = hashlib.sha256()
        copied = 0
        while copied < before.st_size:
            chunk = os.read(source_descriptor, min(READ_CHUNK, before.st_size - copied))
            if not chunk:
                break
            digest.update(chunk)
            view = memoryview(chunk)
            while view:
                written = os.write(target_descriptor, view)
                if written <= 0:
                    raise TrustFailure("Short write while quarantining package")
                view = view[written:]
            copied += len(chunk)
        after = os.fstat(source_descriptor)
        if copied != before.st_size or file_identity(before) != file_identity(after):
            raise TrustFailure("Input ZIP changed while being copied to quarantine")
        os.fsync(target_descriptor)
        target_info = os.fstat(target_descriptor)
        if target_info.st_size != copied:
            raise TrustFailure("Quarantine copy size differs from input")
        final_path = layout.quarantine / f"{digest.hexdigest()}.zip"
        if final_path.exists() or final_path.is_symlink():
            require_store_file_metadata(final_path, "stale quarantine ZIP", mode=0o400)
            existing_hash, existing_size = sha256_regular_file(
                final_path, maximum=outer_limit
            )
            if existing_hash != digest.hexdigest() or existing_size != copied:
                raise TrustFailure(
                    "Stale deterministic quarantine path has different bytes"
                )
            final_path.unlink()
            fsync_directory(layout.quarantine)
        # Keep the source object writable for rename on hardened filesystems, then
        # make the deterministic validator path read-only before publishing it.
        os.fchmod(target_descriptor, 0o600)
        os.rename(temporary_path, final_path)
        quarantine_path = final_path
        os.fchmod(target_descriptor, 0o400)
        os.fsync(target_descriptor)
        fsync_directory(layout.quarantine)
        return QuarantinedZip(
            final_path,
            target_descriptor,
            digest.hexdigest(),
            copied,
            file_identity(os.fstat(target_descriptor)),
        )
    except Exception:
        if target_descriptor >= 0:
            os.close(target_descriptor)
        with contextlib.suppress(OSError):
            temporary_path.unlink()
        if quarantine_path != temporary_path:
            with contextlib.suppress(OSError):
                quarantine_path.unlink()
        raise
    finally:
        os.close(source_descriptor)


def assert_quarantine_unchanged(candidate: QuarantinedZip, *, rehash: bool) -> None:
    info = os.fstat(candidate.descriptor)
    if file_identity(info) != candidate.identity:
        raise TrustFailure("Quarantine ZIP identity changed during validation/extraction")
    if rehash and sha256_file_descriptor(candidate.descriptor, candidate.size) != candidate.sha256:
        raise TrustFailure("Quarantine ZIP bytes changed during validation/extraction")


def run_finished_validator(
    candidate: QuarantinedZip,
    layout: StoreLayout,
    *,
    timeout_seconds: int,
    validator_path: Path = VALIDATOR_PATH,
) -> tuple[dict[str, Any], bytes]:
    report_path = layout.staging / f"validator-{os.getpid()}-{time.time_ns()}.json"
    command = [
        sys.executable,
        "-B",
        str(validator_path),
        "--zip",
        str(candidate.path),
        "--report",
        str(report_path),
    ]
    environment = os.environ.copy()
    environment["PYTHONDONTWRITEBYTECODE"] = "1"
    try:
        completed = subprocess.run(
            command,
            cwd=REPO_ROOT,
            env=environment,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout_seconds,
            check=False,
            close_fds=True,
            text=False,
        )
    except subprocess.TimeoutExpired as error:
        raise TrustFailure(
            f"Finished-package validator timed out after {timeout_seconds}s"
        ) from error
    except OSError as error:
        raise TrustFailure(f"Cannot execute finished-package validator: {error}") from error
    try:
        report_bytes = read_regular_file(
            report_path, "finished-package validator report", maximum=MAX_REPORT_BYTES
        )
    finally:
        with contextlib.suppress(OSError):
            report_path.unlink()
    if completed.returncode == 2:
        message = completed.stderr.decode("utf-8", "replace")[:1000]
        raise TrustFailure(f"Finished-package validator unavailable: {message}")
    if completed.returncode not in {0, 1}:
        raise TrustFailure(
            f"Finished-package validator returned unexpected exit {completed.returncode}"
        )
    report = object_value(
        parse_json_bytes(
            report_bytes,
            "finished-package validator report",
            maximum=MAX_REPORT_BYTES,
        ),
        "finished-package validator report",
    )
    if stable_json_bytes(report) != report_bytes:
        raise TrustFailure("Finished-package validator report is not canonical JSON")
    if (completed.returncode == 0) != (report.get("status") == "valid"):
        raise TrustFailure("Finished-package validator exit/report status mismatch")
    if completed.returncode != 0:
        diagnostics = report.get("diagnostics")
        codes = []
        if isinstance(diagnostics, list):
            codes = [str(item.get("code")) for item in diagnostics[:10] if isinstance(item, dict)]
        raise PackageRejected(
            "Finished-package validation rejected the ZIP"
            + (f": {', '.join(codes)}" if codes else "")
        )
    return report, report_bytes


def validate_report_binding(
    report: dict[str, Any],
    candidate: QuarantinedZip,
    validator: Draft202012Validator,
) -> dict[str, Any]:
    validate_schema(report, validator, "finished-package validator report")
    if (
        report.get("reportFormatVersion") != VALIDATOR_REPORT_FORMAT_VERSION
        or report.get("validatorId") != VALIDATOR_ID
        or report.get("status") != "valid"
    ):
        raise PackageRejected("Only a valid validator-v2 report is installable")
    input_binding = object_value(report.get("input"), "validator report input")
    if input_binding.get("sha256") != candidate.sha256 or input_binding.get("bytes") != candidate.size:
        raise PackageRejected("Validator report does not bind the quarantined ZIP")
    package = object_value(report.get("package"), "validator report package")
    package_id = require_text(package, "packageId", "validator report package")
    package_version = require_text(package, "packageVersion", "validator report package")
    if not PACKAGE_ID_RE.fullmatch(package_id) or not SEMVER_RE.fullmatch(package_version):
        raise PackageRejected("Validator report contains malformed package identity")
    if package.get("releaseId") != f"{package_id}@{package_version}":
        raise PackageRejected("Validator report releaseId differs from packageId@packageVersion")
    archive_root = require_text(package, "archiveRoot", "validator report package")
    if not PORTABLE_SEGMENT_RE.fullmatch(archive_root):
        raise PackageRejected("Validator report archiveRoot is not portable")
    require_sha(package, "manifestSha256", "validator report package")
    require_digest(package, "contentDigest", "validator report package")
    require_digest(package, "closureDigest", "validator report package")
    require_digest(package, "definitionIndexDigest", "validator report package")
    gates = object_value(report.get("gates"), "validator report gates")
    require_exact_keys(gates, set(REQUIRED_GATES), "validator report gates")
    for name in REQUIRED_GATES:
        gate = object_value(gates[name], f"validator report gate {name}")
        if gate != {"diagnosticCodes": [], "diagnosticCount": 0, "status": "passed"}:
            raise PackageRejected(f"Validator report gate {name} did not pass exactly")
    if report.get("diagnostics") != [] or report.get("diagnosticsTruncated") is not False:
        raise PackageRejected("Valid validator report must have no diagnostics")
    counts = object_value(report.get("counts"), "validator report counts")
    manifest_files = require_integer(
        counts, "manifestFiles", "validator report counts", minimum=1, maximum=59_998
    )
    archive_entries = require_integer(
        counts, "archiveEntries", "validator report counts", minimum=3, maximum=60_000
    )
    if archive_entries != manifest_files + 2:
        raise PackageRejected("Validator report archive/manifest counts are inconsistent")
    return package


def zip_entry_mode(info: zipfile.ZipInfo) -> int:
    return (info.external_attr >> 16) & 0xFFFF


def validate_zip_info(
    info: zipfile.ZipInfo,
    *,
    root: str,
    limits: Mapping[str, Any],
) -> str:
    name = info.filename
    if info.is_dir() or name.endswith("/"):
        raise PackageRejected(f"Directory ZIP entries are forbidden: {name!r}")
    mode = zip_entry_mode(info)
    if info.is_dir() or (info.external_attr & 0x10) or (mode and not stat.S_ISREG(mode)):
        raise PackageRejected(f"ZIP entry is not a regular file: {name!r}")
    if info.flag_bits not in {0, 0x0800} or info.comment:
        raise PackageRejected(f"ZIP entry has unsupported flags/comment: {name!r}")
    if info.compress_type not in {zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED}:
        raise PackageRejected(f"ZIP entry uses unsupported compression: {name!r}")
    prefix = f"{root}/"
    if not name.startswith(prefix):
        raise PackageRejected(f"ZIP entry is outside archiveRoot {root!r}: {name!r}")
    relative = name[len(prefix) :]
    try:
        full_path_bytes = len(name.encode("utf-8", "strict"))
    except UnicodeError as error:
        raise PackageRejected(f"ZIP entry path is not lossless UTF-8: {name!r}") from error
    if full_path_bytes > int(limits["archivePathBytes"]):
        raise PackageRejected(f"Full ZIP entry path exceeds profile: {name!r}")
    if not path_is_portable(relative, maximum_bytes=int(limits["archivePathBytes"])):
        raise PackageRejected(f"Unsafe ZIP entry path: {relative!r}")
    if relative.casefold().endswith(ARCHIVE_SUFFIXES):
        raise PackageRejected(f"Nested archive path is forbidden: {relative!r}")
    if info.file_size < 0 or info.file_size > int(limits["genericEntryBytes"]):
        raise PackageRejected(f"ZIP entry size exceeds profile: {relative!r}")
    if relative.endswith(".json") and info.file_size > int(limits["jsonEntryBytes"]):
        raise PackageRejected(f"JSON ZIP entry size exceeds profile: {relative!r}")
    if (
        relative.startswith("assets/goal-visualizations/")
        and info.file_size > int(limits["goalVisualizationBytes"])
    ):
        raise PackageRejected(
            f"Goal-visualization ZIP entry size exceeds profile: {relative!r}"
        )
    if info.compress_size <= 0 and info.file_size > 0:
        raise PackageRejected(f"ZIP entry has impossible compressed size: {relative!r}")
    if info.file_size and info.compress_size:
        if info.file_size / info.compress_size > int(limits["maxEntryCompressionRatio"]):
            raise PackageRejected(f"ZIP entry compression ratio exceeds profile: {relative!r}")
    return relative


def parse_manifest_files(
    manifest: dict[str, Any], *, path_limit: int
) -> dict[str, dict[str, Any]]:
    raw_files = manifest.get("files")
    if not isinstance(raw_files, list) or not raw_files:
        raise PackageRejected("Package manifest must contain file records")
    if len(raw_files) > 59_998:
        raise PackageRejected("Package manifest exceeds file-record limit")
    records: dict[str, dict[str, Any]] = {}
    for index, raw_record in enumerate(raw_files):
        record = object_value(raw_record, f"manifest.files[{index}]")
        path = require_text(record, "path", f"manifest.files[{index}]")
        if not path_is_portable(path, maximum_bytes=path_limit):
            raise PackageRejected(f"Unsafe manifest file path: {path!r}")
        if path in {"metadata/manifest.json", "metadata/SHA256SUMS"}:
            raise PackageRejected(f"Manifest inventories excluded path {path!r}")
        if path in records:
            raise PackageRejected(f"Duplicate manifest file path: {path!r}")
        require_sha(record, "sha256", f"manifest.files[{index}]")
        require_integer(
            record,
            "bytes",
            f"manifest.files[{index}]",
            minimum=0,
            maximum=8_000_000_000,
        )
        records[path] = record
    assert_no_path_prefix_collisions(records, "manifest inventory")
    return records


def parse_checksum_file(raw: bytes, expected_paths: set[str]) -> dict[str, str]:
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeError as error:
        raise PackageRejected("SHA256SUMS is not UTF-8") from error
    if not text.endswith("\n"):
        raise PackageRejected("SHA256SUMS must end with one newline")
    lines = text.splitlines()
    records: dict[str, str] = {}
    for line in lines:
        if len(line) < 67 or line[64:66] != "  ":
            raise PackageRejected("Malformed SHA256SUMS record")
        digest = line[:64]
        path = line[66:]
        if not SHA256_RE.fullmatch(digest) or path in records:
            raise PackageRejected("Malformed or duplicate SHA256SUMS record")
        records[path] = digest
    if set(records) != expected_paths:
        raise PackageRejected(
            "SHA256SUMS path set differs from manifest plus metadata/manifest.json"
        )
    if lines != [f"{records[path]}  {path}" for path in sorted(records)]:
        raise PackageRejected("SHA256SUMS records are not in canonical path order")
    return records


def read_zip_member_limited(
    archive: zipfile.ZipFile, info: zipfile.ZipInfo, *, maximum: int
) -> bytes:
    if info.file_size > maximum:
        raise PackageRejected(f"ZIP member {info.filename!r} exceeds {maximum} bytes")
    with archive.open(info, "r") as source:
        raw = source.read(maximum + 1)
        if len(raw) > maximum or len(raw) != info.file_size:
            raise PackageRejected(f"ZIP member size drift: {info.filename!r}")
        if source.read(1):
            raise PackageRejected(f"ZIP member has trailing bytes: {info.filename!r}")
        return raw


def looks_like_nested_archive(prefix: bytes) -> bool:
    if any(prefix.startswith(magic) for magic in ARCHIVE_MAGICS):
        return True
    # POSIX tar magic is stored at byte offset 257 in the first 512-byte block.
    return len(prefix) >= 262 and prefix[257:262] == b"ustar"


def ensure_stage_parent(root: Path, relative: str) -> Path:
    parent = root
    for segment in relative.split("/")[:-1]:
        parent = parent / segment
        try:
            parent.mkdir(mode=0o700)
        except FileExistsError:
            info = parent.lstat()
            if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
                raise TrustFailure(f"Unsafe staging path component: {parent}")
        except OSError as error:
            raise TrustFailure(f"Cannot create staging directory {parent}: {error}") from error
    return parent


def extract_one(
    archive: zipfile.ZipFile,
    info: zipfile.ZipInfo,
    root: Path,
    relative: str,
    *,
    expected_bytes: int,
    expected_sha256: str,
) -> None:
    parent = ensure_stage_parent(root, relative)
    target = parent / relative.split("/")[-1]
    flags = (
        os.O_WRONLY
        | os.O_CREAT
        | os.O_EXCL
        | getattr(os, "O_CLOEXEC", 0)
        | getattr(os, "O_NOFOLLOW", 0)
    )
    try:
        descriptor = os.open(target, flags, 0o600)
    except OSError as error:
        raise TrustFailure(f"Cannot create extracted file {target}: {error}") from error
    digest = hashlib.sha256()
    total = 0
    try:
        with archive.open(info, "r") as source:
            while True:
                chunk = source.read(READ_CHUNK)
                if not chunk:
                    break
                total += len(chunk)
                if total > expected_bytes:
                    raise PackageRejected(f"Extracted file exceeds declared bytes: {relative}")
                digest.update(chunk)
                view = memoryview(chunk)
                while view:
                    written = os.write(descriptor, view)
                    if written <= 0:
                        raise TrustFailure(f"Short write while extracting {relative}")
                    view = view[written:]
        if total != expected_bytes or digest.hexdigest() != expected_sha256:
            raise PackageRejected(f"Extracted file hash/size differs: {relative}")
        os.fchmod(descriptor, 0o444)
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def make_tree_read_only(root: Path) -> None:
    directories: list[Path] = []
    for current, names, files in os.walk(root, topdown=True, followlinks=False):
        current_path = Path(current)
        info = current_path.lstat()
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
            raise TrustFailure(f"Extracted tree contains unsafe directory: {current_path}")
        directories.append(current_path)
        for name in names:
            child = current_path / name
            child_info = child.lstat()
            if stat.S_ISLNK(child_info.st_mode) or not stat.S_ISDIR(child_info.st_mode):
                raise TrustFailure(f"Extracted tree contains unsafe path: {child}")
        for name in files:
            child = current_path / name
            child_info = child.lstat()
            if stat.S_ISLNK(child_info.st_mode) or not stat.S_ISREG(child_info.st_mode):
                raise TrustFailure(f"Extracted tree contains unsafe file: {child}")
            child.chmod(0o444)
    for directory in reversed(directories):
        directory.chmod(0o555)
        fsync_directory(directory)


def remove_private_tree(path: Path) -> None:
    """Remove one provisioner-owned staging tree even after read-only hardening."""
    if not path.exists() and not path.is_symlink():
        return
    if path.is_symlink():
        path.unlink()
        return
    for current, directories, files in os.walk(path, topdown=False, followlinks=False):
        current_path = Path(current)
        with contextlib.suppress(OSError):
            current_path.chmod(0o700)
        for name in files:
            child = current_path / name
            with contextlib.suppress(OSError):
                child.chmod(0o600)
            with contextlib.suppress(OSError):
                child.unlink()
        for name in directories:
            child = current_path / name
            with contextlib.suppress(OSError):
                child.chmod(0o700)
            with contextlib.suppress(OSError):
                child.rmdir()
    with contextlib.suppress(OSError):
        path.chmod(0o700)
    with contextlib.suppress(OSError):
        path.rmdir()


def extract_validated_zip(
    candidate: QuarantinedZip,
    report: dict[str, Any],
    package_binding: dict[str, Any],
    layout: StoreLayout,
    profile: dict[str, Any],
) -> tuple[Path, dict[str, Any], bytes]:
    limits = object_value(profile["archiveLimits"], "package profile archiveLimits")
    stage = Path(tempfile.mkdtemp(prefix="extract-", dir=layout.staging))
    stage.chmod(0o700)
    object_container = stage / candidate.sha256
    object_container.mkdir(mode=0o700)
    archive_root = package_binding["archiveRoot"]
    extracted_root = object_container / archive_root
    extracted_root.mkdir(mode=0o700)
    try:
        with os.fdopen(os.dup(candidate.descriptor), "rb", closefd=True) as raw_handle:
            raw_handle.seek(0)
            with zipfile.ZipFile(raw_handle, "r", allowZip64=False) as archive:
                infos = archive.infolist()
                if len(infos) != report["counts"]["archiveEntries"]:
                    raise PackageRejected("ZIP entry count differs from validator report")
                relative_infos: dict[str, zipfile.ZipInfo] = {}
                total_uncompressed = 0
                total_compressed = 0
                image_lane_bytes = 0
                for info in infos:
                    relative = validate_zip_info(
                        info, root=archive_root, limits=limits
                    )
                    if relative in relative_infos:
                        raise PackageRejected(f"Duplicate ZIP entry: {relative!r}")
                    relative_infos[relative] = info
                    total_uncompressed += info.file_size
                    total_compressed += info.compress_size
                    if relative.startswith("assets/goal-visualizations/"):
                        image_lane_bytes += info.file_size
                if len(relative_infos) > int(limits["entryCount"]):
                    raise PackageRejected("ZIP entry count exceeds profile")
                if total_uncompressed > int(limits["totalUncompressedBytes"]):
                    raise PackageRejected("ZIP uncompressed bytes exceed profile")
                if image_lane_bytes > int(limits["imageLaneBytes"]):
                    raise PackageRejected("Goal-visualization image lane exceeds profile")
                if total_compressed and total_uncompressed / total_compressed > int(
                    limits["maxTotalCompressionRatio"]
                ):
                    raise PackageRejected("ZIP total compression ratio exceeds profile")
                assert_no_path_prefix_collisions(relative_infos, "ZIP inventory")
                manifest_info = relative_infos.get("metadata/manifest.json")
                sums_info = relative_infos.get("metadata/SHA256SUMS")
                if manifest_info is None or sums_info is None:
                    raise PackageRejected("ZIP lacks manifest or SHA256SUMS")
                manifest_bytes = read_zip_member_limited(
                    archive, manifest_info, maximum=64 * 1024 * 1024
                )
                if sha256_bytes(manifest_bytes) != package_binding["manifestSha256"]:
                    raise PackageRejected("Manifest hash differs from validator-v2 report")
                manifest = object_value(
                    parse_json_bytes(
                        manifest_bytes,
                        "package manifest",
                        maximum=64 * 1024 * 1024,
                    ),
                    "package manifest",
                )
                for field in (
                    "archiveRoot",
                    "releaseId",
                    "packageId",
                    "packageVersion",
                    "contentDigest",
                ):
                    if manifest.get(field) != package_binding.get(field):
                        raise PackageRejected(
                            f"Manifest {field} differs from validator-v2 report"
                        )
                records = parse_manifest_files(
                    manifest, path_limit=int(limits["archivePathBytes"])
                )
                expected_tree = set(records) | {
                    "metadata/manifest.json",
                    "metadata/SHA256SUMS",
                }
                if set(relative_infos) != expected_tree:
                    raise PackageRejected("ZIP inventory differs from exact manifest inventory")
                if len(records) != report["counts"]["manifestFiles"]:
                    raise PackageRejected("Manifest record count differs from validator report")
                sums_bytes = read_zip_member_limited(
                    archive, sums_info, maximum=16 * 1024 * 1024
                )
                checksums = parse_checksum_file(
                    sums_bytes, set(records) | {"metadata/manifest.json"}
                )
                if checksums["metadata/manifest.json"] != sha256_bytes(manifest_bytes):
                    raise PackageRejected("SHA256SUMS does not bind the manifest bytes")
                expected_metadata: dict[str, tuple[int, str]] = {
                    path: (int(record["bytes"]), str(record["sha256"]))
                    for path, record in records.items()
                }
                for path, record in records.items():
                    if checksums.get(path) != record["sha256"]:
                        raise PackageRejected(f"SHA256SUMS differs from manifest for {path}")
                expected_metadata["metadata/manifest.json"] = (
                    len(manifest_bytes),
                    sha256_bytes(manifest_bytes),
                )
                expected_metadata["metadata/SHA256SUMS"] = (
                    len(sums_bytes),
                    sha256_bytes(sums_bytes),
                )
                for relative in sorted(relative_infos):
                    expected_bytes, expected_sha = expected_metadata[relative]
                    info = relative_infos[relative]
                    if info.file_size != expected_bytes:
                        raise PackageRejected(
                            f"ZIP member size differs from inventory: {relative}"
                        )
                    with archive.open(info, "r") as source:
                        prefix = source.read(512)
                    if (
                        relative not in {"metadata/manifest.json", "metadata/SHA256SUMS"}
                        and looks_like_nested_archive(prefix)
                    ):
                        raise PackageRejected(f"Nested archive magic is forbidden: {relative}")
                    extract_one(
                        archive,
                        info,
                        extracted_root,
                        relative,
                        expected_bytes=expected_bytes,
                        expected_sha256=expected_sha,
                    )
        make_tree_read_only(extracted_root)
        object_container.chmod(0o555)
        fsync_directory(object_container)
        return object_container, manifest, manifest_bytes
    except Exception:
        remove_private_tree(stage)
        raise


def relative_package_tree(root: Path) -> tuple[set[str], set[str]]:
    files_result: set[str] = set()
    directories_result: set[str] = set()
    for current, directories, files in os.walk(root, topdown=True, followlinks=False):
        current_path = Path(current)
        info = current_path.lstat()
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
            raise TrustFailure(f"Package object contains unsafe directory: {current_path}")
        if hasattr(os, "getuid") and info.st_uid != os.getuid():
            raise TrustFailure(f"Package object directory ownership drift: {current_path}")
        if stat.S_IMODE(info.st_mode) != 0o555:
            raise PackageRejected(f"Package object directory mode drift: {current_path}")
        for name in directories:
            child = current_path / name
            child_info = child.lstat()
            if stat.S_ISLNK(child_info.st_mode) or not stat.S_ISDIR(child_info.st_mode):
                raise TrustFailure(f"Package object contains unsafe path: {child}")
            if hasattr(os, "getuid") and child_info.st_uid != os.getuid():
                raise TrustFailure(f"Package object directory ownership drift: {child}")
            if stat.S_IMODE(child_info.st_mode) != 0o555:
                raise PackageRejected(f"Package object directory mode drift: {child}")
            directories_result.add(child.relative_to(root).as_posix())
        for name in files:
            child = current_path / name
            child_info = child.lstat()
            if stat.S_ISLNK(child_info.st_mode) or not stat.S_ISREG(child_info.st_mode):
                raise TrustFailure(f"Package object contains unsafe file: {child}")
            if hasattr(os, "getuid") and child_info.st_uid != os.getuid():
                raise TrustFailure(f"Package object file ownership drift: {child}")
            if stat.S_IMODE(child_info.st_mode) != 0o444:
                raise PackageRejected(f"Package object file mode drift: {child}")
            files_result.add(child.relative_to(root).as_posix())
    return files_result, directories_result


def require_store_file_metadata(path: Path, description: str, *, mode: int) -> None:
    try:
        info = path.lstat()
    except OSError as error:
        raise TrustFailure(f"Cannot inspect {description} {path}: {error}") from error
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
        raise TrustFailure(f"{description} must be a regular non-symlink file: {path}")
    if hasattr(os, "getuid") and info.st_uid != os.getuid():
        raise TrustFailure(f"{description} ownership drift: {path}")
    if stat.S_IMODE(info.st_mode) != mode:
        raise PackageRejected(
            f"{description} mode drift: expected {mode:04o}, "
            f"found {stat.S_IMODE(info.st_mode):04o}"
        )


def verify_package_tree(
    package_root: Path,
    manifest_sha256: str,
    *,
    expected_manifest_count: int | None = None,
) -> tuple[dict[str, Any], bytes]:
    lstat_directory(package_root, "package object root")
    manifest_path = package_root / "metadata" / "manifest.json"
    sums_path = package_root / "metadata" / "SHA256SUMS"
    manifest_bytes = read_regular_file(
        manifest_path, "package manifest", maximum=64 * 1024 * 1024
    )
    if sha256_bytes(manifest_bytes) != manifest_sha256:
        raise PackageRejected("Installed package manifest SHA-256 drift")
    manifest = object_value(
        parse_json_bytes(manifest_bytes, "package manifest", maximum=64 * 1024 * 1024),
        "package manifest",
    )
    records = parse_manifest_files(manifest, path_limit=240)
    if expected_manifest_count is not None and len(records) != expected_manifest_count:
        raise PackageRejected("Installed package manifest record count drift")
    expected_tree = set(records) | {"metadata/manifest.json", "metadata/SHA256SUMS"}
    actual_tree, actual_directories = relative_package_tree(package_root)
    if actual_tree != expected_tree:
        raise PackageRejected(
            "Installed package tree differs from manifest; "
            f"missing={sorted(expected_tree - actual_tree)[:10]}, "
            f"unexpected={sorted(actual_tree - expected_tree)[:10]}"
        )
    expected_directories: set[str] = set()
    for relative in expected_tree:
        parts = relative.split("/")
        for length in range(1, len(parts)):
            expected_directories.add("/".join(parts[:length]))
    if actual_directories != expected_directories:
        raise PackageRejected(
            "Installed package directory tree differs from inventory; "
            f"missing={sorted(expected_directories - actual_directories)[:10]}, "
            f"unexpected={sorted(actual_directories - expected_directories)[:10]}"
        )
    sums_bytes = read_regular_file(
        sums_path, "package SHA256SUMS", maximum=16 * 1024 * 1024
    )
    checksums = parse_checksum_file(
        sums_bytes, set(records) | {"metadata/manifest.json"}
    )
    if checksums["metadata/manifest.json"] != manifest_sha256:
        raise PackageRejected("Installed SHA256SUMS manifest binding drift")
    for relative, record in records.items():
        path = package_root / Path(relative)
        actual_hash, actual_bytes = sha256_regular_file(
            path, maximum=max(int(record["bytes"]), 1)
        )
        if actual_bytes != record["bytes"] or actual_hash != record["sha256"]:
            raise PackageRejected(f"Installed package file drift: {relative}")
        if checksums.get(relative) != actual_hash:
            raise PackageRejected(f"Installed SHA256SUMS drift: {relative}")
    return manifest, manifest_bytes


def record_path(layout: StoreLayout, outer_sha256: str) -> Path:
    if not SHA256_RE.fullmatch(outer_sha256):
        raise PackageRejected("outerZipSha256 must be 64 lowercase hex characters")
    return layout.install_records / f"{outer_sha256}.json"


def report_path(layout: StoreLayout, outer_sha256: str) -> Path:
    if not SHA256_RE.fullmatch(outer_sha256):
        raise PackageRejected("outerZipSha256 must be 64 lowercase hex characters")
    return layout.validation_reports / f"{outer_sha256}.json"


def validate_install_record_semantics(record: dict[str, Any]) -> None:
    package_id = require_text(record, "packageId", "install record")
    package_version = require_text(record, "packageVersion", "install record")
    if record.get("releaseId") != f"{package_id}@{package_version}":
        raise PackageRejected("Install record releaseId differs from packageId@packageVersion")


def verify_install(
    layout: StoreLayout,
    outer_sha256: str,
    validators: dict[str, Draft202012Validator],
) -> VerifiedInstall:
    record_file = record_path(layout, outer_sha256)
    require_store_file_metadata(record_file, "installed-package record", mode=0o444)
    record_bytes = read_regular_file(
        record_file, "installed-package record", maximum=MAX_INSTALL_RECORD_BYTES
    )
    record = object_value(
        parse_json_bytes(
            record_bytes, "installed-package record", maximum=MAX_INSTALL_RECORD_BYTES
        ),
        "installed-package record",
    )
    if stable_json_bytes(record) != record_bytes:
        raise PackageRejected("Installed-package record is not canonical JSON")
    validate_schema(record, validators["record"], "installed-package record")
    validate_install_record_semantics(record)
    if record["outerZipSha256"] != outer_sha256:
        raise PackageRejected("Install record outer ZIP identity differs from filename")
    report_file = report_path(layout, outer_sha256)
    require_store_file_metadata(report_file, "stored validation report", mode=0o444)
    report_bytes = read_regular_file(
        report_file, "stored validation report", maximum=MAX_REPORT_BYTES
    )
    if sha256_bytes(report_bytes) != record["validationReportSha256"]:
        raise PackageRejected("Stored validation report SHA-256 drift")
    report = object_value(
        parse_json_bytes(
            report_bytes, "stored validation report", maximum=MAX_REPORT_BYTES
        ),
        "stored validation report",
    )
    if stable_json_bytes(report) != report_bytes:
        raise PackageRejected("Stored validation report is not canonical JSON")
    validate_schema(report, validators["report"], "stored validation report")
    if report.get("validatorId") != VALIDATOR_ID or report.get("status") != "valid":
        raise PackageRejected("Stored validation report is not valid validator-v2 evidence")
    bindings = {
        "outerZipSha256": report["input"]["sha256"],
        "outerZipBytes": report["input"]["bytes"],
        "manifestSha256": report["package"]["manifestSha256"],
        "closureDigest": report["package"]["closureDigest"],
        "definitionIndexDigest": report["package"]["definitionIndexDigest"],
        "packageId": report["package"]["packageId"],
        "packageVersion": report["package"]["packageVersion"],
        "releaseId": report["package"]["releaseId"],
        "contentDigest": report["package"]["contentDigest"],
        "archiveRoot": report["package"]["archiveRoot"],
    }
    for field, expected in bindings.items():
        if record.get(field) != expected:
            raise PackageRejected(f"Install record/report binding drift: {field}")
    object_container = layout.objects / outer_sha256
    container_info = lstat_directory(object_container, "content-addressed object container")
    if hasattr(os, "getuid") and container_info.st_uid != os.getuid():
        raise TrustFailure("Content-addressed object container ownership drift")
    if stat.S_IMODE(container_info.st_mode) != 0o555:
        raise PackageRejected("Content-addressed object container mode drift")
    children = list(object_container.iterdir())
    package_root = object_container / record["archiveRoot"]
    if children != [package_root] and {child.name for child in children} != {record["archiveRoot"]}:
        raise PackageRejected("Content-addressed object container has unexpected entries")
    manifest, manifest_bytes = verify_package_tree(
        package_root,
        record["manifestSha256"],
        expected_manifest_count=report["counts"]["manifestFiles"],
    )
    for field in (
        "archiveRoot",
        "packageId",
        "packageVersion",
        "releaseId",
        "contentDigest",
    ):
        if manifest.get(field) != record[field]:
            raise PackageRejected(f"Installed manifest/install-record drift: {field}")
    return VerifiedInstall(
        record=record,
        record_bytes=record_bytes,
        record_sha256=sha256_bytes(record_bytes),
        report=report,
        report_bytes=report_bytes,
        manifest=manifest,
        manifest_bytes=manifest_bytes,
        package_root=package_root,
    )


def assert_release_identity_available(
    layout: StoreLayout, record: dict[str, Any]
) -> None:
    paths = sorted(layout.install_records.glob("*.json"))
    if len(paths) > MAX_INSTALLED_RECORDS:
        raise TrustFailure("Installed-package record count exceeds operational limit")
    for path in paths:
        if path.name == f"{record['outerZipSha256']}.json":
            continue
        raw = read_regular_file(
            path, "installed-package record", maximum=MAX_INSTALL_RECORD_BYTES
        )
        existing = object_value(
            parse_json_bytes(raw, "installed-package record", maximum=MAX_INSTALL_RECORD_BYTES),
            "installed-package record",
        )
        if existing.get("releaseId") == record["releaseId"]:
            raise PackageRejected(
                f"Immutable releaseId already exists with different ZIP: {record['releaseId']}"
            )


def verify_existing_object_before_reuse(
    target: Path,
    package_binding: dict[str, Any],
    manifest_count: int,
) -> None:
    container_info = lstat_directory(target, "existing content-addressed object container")
    if hasattr(os, "getuid") and container_info.st_uid != os.getuid():
        raise TrustFailure("Existing content-addressed object ownership drift")
    if stat.S_IMODE(container_info.st_mode) != 0o555:
        raise PackageRejected("Existing content-addressed object mode drift")
    archive_root = package_binding["archiveRoot"]
    children = list(target.iterdir())
    if {child.name for child in children} != {archive_root}:
        raise PackageRejected(
            "Existing content-addressed object has an unexpected archive-root set"
        )
    manifest, _raw = verify_package_tree(
        target / archive_root,
        package_binding["manifestSha256"],
        expected_manifest_count=manifest_count,
    )
    for field in (
        "archiveRoot",
        "packageId",
        "packageVersion",
        "releaseId",
        "contentDigest",
    ):
        if manifest.get(field) != package_binding[field]:
            raise PackageRejected(
                f"Existing content-addressed object identity drift: {field}"
            )


def promote_object(
    layout: StoreLayout,
    staged_container: Path,
    outer_sha256: str,
    package_binding: dict[str, Any],
    manifest_count: int,
) -> None:
    target = layout.objects / outer_sha256
    if target.exists() or target.is_symlink():
        verify_existing_object_before_reuse(
            target, package_binding, manifest_count
        )
        remove_private_tree(staged_container.parent)
        return
    try:
        # Some hardened filesystems require write mode on the renamed directory
        # itself.  The object is still unreferenced at this point; harden it again
        # immediately after the atomic directory rename and before evidence/lock
        # publication.
        staged_container.chmod(0o700)
        os.rename(staged_container, target)
        target.chmod(0o555)
        fsync_directory(target)
        fsync_directory(layout.objects)
    except FileExistsError:
        pass
    except OSError as error:
        raise TrustFailure(f"Cannot promote content-addressed package object: {error}") from error
    finally:
        remove_private_tree(staged_container.parent)


def install_package(
    source: Path,
    layout: StoreLayout,
    profile: dict[str, Any],
    validators: dict[str, Draft202012Validator],
    *,
    timeout_seconds: int,
    validator_path: Path = VALIDATOR_PATH,
) -> VerifiedInstall:
    limits = object_value(profile["archiveLimits"], "package profile archiveLimits")
    candidate = quarantine_input(
        source, layout, outer_limit=int(limits["outerZipBytes"])
    )
    staged_container: Path | None = None
    try:
        existing_record = record_path(layout, candidate.sha256)
        if existing_record.exists():
            installed = verify_install(layout, candidate.sha256, validators)
            if installed.record["outerZipBytes"] != candidate.size:
                raise TrustFailure("Existing install has impossible outer ZIP size collision")
            assert_quarantine_unchanged(candidate, rehash=True)
            return installed
        report, report_bytes = run_finished_validator(
            candidate,
            layout,
            timeout_seconds=timeout_seconds,
            validator_path=validator_path,
        )
        assert_quarantine_unchanged(candidate, rehash=True)
        package_binding = validate_report_binding(
            report, candidate, validators["report"]
        )
        staged_container, manifest, _manifest_bytes = extract_validated_zip(
            candidate, report, package_binding, layout, profile
        )
        assert_quarantine_unchanged(candidate, rehash=True)
        report_sha = sha256_bytes(report_bytes)
        record = {
            "installRecordFormatVersion": INSTALL_RECORD_FORMAT_VERSION,
            "outerZipSha256": candidate.sha256,
            "outerZipBytes": candidate.size,
            "manifestSha256": package_binding["manifestSha256"],
            "closureDigest": package_binding["closureDigest"],
            "definitionIndexDigest": package_binding["definitionIndexDigest"],
            "packageId": package_binding["packageId"],
            "packageVersion": package_binding["packageVersion"],
            "releaseId": package_binding["releaseId"],
            "contentDigest": package_binding["contentDigest"],
            "archiveRoot": package_binding["archiveRoot"],
            "validationReportSha256": report_sha,
        }
        validate_schema(record, validators["record"], "installed-package record")
        validate_install_record_semantics(record)
        for field in (
            "archiveRoot",
            "packageId",
            "packageVersion",
            "releaseId",
            "contentDigest",
        ):
            if manifest.get(field) != record[field]:
                raise PackageRejected(f"Extracted manifest/install record mismatch: {field}")
        assert_release_identity_available(layout, record)
        record_bytes = stable_json_bytes(record)
        promote_object(
            layout,
            staged_container,
            candidate.sha256,
            package_binding,
            report["counts"]["manifestFiles"],
        )
        staged_container = None
        write_immutable(report_path(layout, candidate.sha256), report_bytes)
        write_immutable(record_path(layout, candidate.sha256), record_bytes)
        installed = verify_install(layout, candidate.sha256, validators)
        return installed
    finally:
        if staged_container is not None:
            remove_private_tree(staged_container.parent)
        candidate.close()
        with contextlib.suppress(OSError):
            candidate.path.unlink()
        with contextlib.suppress(OSError):
            fsync_directory(layout.quarantine)


def read_active_lock(
    layout: StoreLayout,
    validator: Draft202012Validator,
) -> tuple[dict[str, Any] | None, bytes | None, str | None]:
    path = layout.locks / "active.json"
    if not path.exists() and not path.is_symlink():
        return None, None, None
    require_store_file_metadata(path, "active package lock", mode=0o444)
    raw = read_regular_file(path, "active package lock", maximum=MAX_LOCK_BYTES)
    lock = object_value(
        parse_json_bytes(raw, "active package lock", maximum=MAX_LOCK_BYTES),
        "active package lock",
    )
    if stable_json_bytes(lock) != raw:
        raise PackageRejected("Active package lock is not canonical JSON")
    validate_schema(lock, validator, "active package lock")
    validate_lock_semantics(lock)
    return lock, raw, sha256_bytes(raw)


def validate_lock_semantics(lock: dict[str, Any]) -> None:
    packages = lock.get("packages")
    if not isinstance(packages, list) or not packages:
        raise PackageRejected("Active package lock must select at least one package")
    ids: list[str] = []
    for index, raw in enumerate(packages):
        entry = object_value(raw, f"active lock packages[{index}]")
        package_id = require_text(entry, "packageId", f"active lock packages[{index}]")
        package_version = require_text(
            entry, "packageVersion", f"active lock packages[{index}]"
        )
        if entry.get("releaseId") != f"{package_id}@{package_version}":
            raise PackageRejected("Active lock releaseId differs from packageId@packageVersion")
        ids.append(package_id)
    if ids != sorted(ids) or len(ids) != len(set(ids)):
        raise PackageRejected("Active package lock entries must be strictly sorted by packageId")


def parse_semver(value: str, description: str) -> tuple[int, int, int, tuple[str, ...] | None]:
    match = SEMVER_RE.fullmatch(value)
    if not match:
        raise PackageRejected(f"Malformed {description}: {value!r}")
    prerelease = tuple(match.group(4).split(".")) if match.group(4) else None
    if prerelease:
        for identifier in prerelease:
            if identifier.isdigit() and len(identifier) > 1 and identifier.startswith("0"):
                raise PackageRejected(f"Malformed {description}: leading-zero prerelease")
    return int(match.group(1)), int(match.group(2)), int(match.group(3)), prerelease


def compare_semver(
    left: tuple[int, int, int, tuple[str, ...] | None],
    right: tuple[int, int, int, tuple[str, ...] | None],
) -> int:
    if left[:3] != right[:3]:
        return -1 if left[:3] < right[:3] else 1
    left_pre = left[3]
    right_pre = right[3]
    if left_pre == right_pre:
        return 0
    if left_pre is None:
        return 1
    if right_pre is None:
        return -1
    for a, b in zip(left_pre, right_pre):
        if a == b:
            continue
        if a.isdigit() and b.isdigit():
            return -1 if int(a) < int(b) else 1
        if a.isdigit() != b.isdigit():
            return -1 if a.isdigit() else 1
        return -1 if a < b else 1
    return (-1 if len(left_pre) < len(right_pre) else 1)


def require_consumer_compatible(manifest: dict[str, Any], consumer_version: str) -> None:
    consumer = parse_semver(consumer_version, "consumer version")
    expression = require_text(
        manifest, "supportedSkillpilotSoftware", "package manifest"
    )
    match = SOFTWARE_RANGE_RE.fullmatch(expression)
    if not match:
        raise PackageRejected(
            f"Unsupported supportedSkillpilotSoftware expression: {expression!r}"
        )
    lower = (int(match.group(1)), int(match.group(2)), int(match.group(3)), None)
    upper = (int(match.group(4)), int(match.group(5)), int(match.group(6)), None)
    if compare_semver(lower, upper) >= 0:
        raise PackageRejected("Package software range is empty/reversed")
    if compare_semver(consumer, lower) < 0 or compare_semver(consumer, upper) >= 0:
        raise PackageRejected(
            f"Consumer {consumer_version} is outside supportedSkillpilotSoftware {expression}"
        )


def manifest_role_path(manifest: dict[str, Any], role: str) -> str:
    matches = [
        record.get("path")
        for record in manifest.get("files", [])
        if isinstance(record, dict)
        and record.get("role") == role
        and record.get("runtimeRequired") is True
    ]
    if len(matches) != 1 or not isinstance(matches[0], str):
        raise PackageRejected(f"Manifest must contain exactly one runtimeRequired {role}")
    return matches[0]


def canonical_key(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def read_manifest_role_json(
    installed: VerifiedInstall,
    role: str,
    description: str,
) -> dict[str, Any]:
    relative = manifest_role_path(installed.manifest, role)
    raw = read_regular_file(
        installed.package_root / Path(relative),
        description,
        maximum=64 * 1024 * 1024,
    )
    return object_value(
        parse_json_bytes(raw, description, maximum=64 * 1024 * 1024),
        description,
    )


def verify_activation_set(
    installs: Sequence[VerifiedInstall], consumer_version: str
) -> None:
    package_ids: set[str] = set()
    definitions: dict[str, tuple[str, str]] = {}
    landscapes: dict[str, tuple[str, str | None]] = {}
    views: dict[str, tuple[str, str | None]] = {}
    offerings: dict[str, tuple[str, str | None]] = {}
    resources: dict[str, tuple[str, str | None]] = {}
    public_urls: dict[str, tuple[str, str | None]] = {}
    offering_references: list[tuple[str, str, list[str]]] = []
    for installed in installs:
        package_id = installed.record["packageId"]
        if package_id in package_ids:
            raise PackageRejected(f"Activation selects packageId more than once: {package_id}")
        package_ids.add(package_id)
        require_consumer_compatible(installed.manifest, consumer_version)
        catalog = read_manifest_role_json(
            installed, "runtime-catalog", "runtime catalog"
        )
        capabilities = catalog.get("capabilities")
        if not isinstance(capabilities, list) or not all(
            isinstance(item, str) for item in capabilities
        ):
            raise PackageRejected("Runtime catalog capabilities must be a string array")
        if "embeddedDependencies" in capabilities:
            raise PackageRejected(
                "Current package consumer does not support embeddedDependencies"
            )
        raw_landscapes = catalog.get("landscapes")
        if not isinstance(raw_landscapes, list):
            raise PackageRejected("Runtime catalog landscapes must be an array")
        local_landscapes: set[str] = set()
        for raw_landscape in raw_landscapes:
            landscape = object_value(raw_landscape, "runtime catalog landscape")
            landscape_id = require_text(
                landscape, "landscapeId", "runtime catalog landscape"
            )
            role = require_text(landscape, "role", "runtime catalog landscape")
            if role not in {"root", "module"}:
                raise PackageRejected(
                    f"Current package consumer does not support landscape role {role!r}"
                )
            if landscape_id in local_landscapes or landscape_id in landscapes:
                raise PackageRejected(
                    f"Ambiguous cross-package landscapeId: {landscape_id}"
                )
            local_landscapes.add(landscape_id)
            landscapes[landscape_id] = (package_id, role)
        raw_views = catalog.get("views")
        if not isinstance(raw_views, list):
            raise PackageRejected("Runtime catalog views must be an array")
        for raw_view in raw_views:
            view = object_value(raw_view, "runtime catalog view")
            view_id = require_text(view, "viewId", "runtime catalog view")
            landscape_id = require_text(
                view, "landscapeId", "runtime catalog view"
            )
            if view_id in views:
                raise PackageRejected(f"Ambiguous cross-package viewId: {view_id}")
            views[view_id] = (package_id, landscape_id)
        raw_offerings = catalog.get("offeredScopes")
        if not isinstance(raw_offerings, list):
            raise PackageRejected("Runtime catalog offeredScopes must be an array")
        for raw_offering in raw_offerings:
            offering = object_value(raw_offering, "runtime catalog offering")
            offering_id = require_text(
                offering, "offeringId", "runtime catalog offering"
            )
            landscape_id = require_text(
                offering, "landscapeId", "runtime catalog offering"
            )
            if offering_id in offerings:
                raise PackageRejected(
                    f"Ambiguous cross-package offeringId: {offering_id}"
                )
            offerings[offering_id] = (package_id, landscape_id)
            resolution = object_value(
                offering.get("viewResolution"), "runtime catalog viewResolution"
            )
            view_ids = resolution.get("viewIds")
            if not isinstance(view_ids, list) or not all(
                isinstance(item, str) and item for item in view_ids
            ):
                raise PackageRejected("Offering viewIds must be non-empty strings")
            offering_references.append((offering_id, landscape_id, list(view_ids)))
        raw_resources = catalog.get("resources")
        if not isinstance(raw_resources, list):
            raise PackageRejected("Runtime catalog resources must be an array")
        for raw_resource in raw_resources:
            resource = object_value(raw_resource, "runtime catalog resource")
            resource_id = require_text(
                resource, "resourceId", "runtime catalog resource"
            )
            landscape_id = require_text(
                resource, "landscapeId", "runtime catalog resource"
            )
            if resource_id in resources:
                raise PackageRejected(
                    f"Ambiguous cross-package resourceId: {resource_id}"
                )
            resources[resource_id] = (package_id, landscape_id)
        resource_index = read_manifest_role_json(
            installed, "resource-index", "resource index"
        )
        index_resources = resource_index.get("resources")
        if not isinstance(index_resources, list):
            raise PackageRejected("Resource index resources must be an array")
        index_ids: set[str] = set()
        for raw_resource in index_resources:
            resource = object_value(raw_resource, "resource index entry")
            resource_id = require_text(resource, "resourceId", "resource index entry")
            index_ids.add(resource_id)
            if resource.get("delivery") == "external":
                external_url = require_text(
                    resource, "externalUrl", "external resource index entry"
                )
                if not external_url.startswith("https://"):
                    raise PackageRejected(
                        f"External resource URL must use HTTPS: {resource_id}"
                    )
            public_url = resource.get("publicUrl")
            if public_url is not None:
                if not isinstance(public_url, str) or not public_url:
                    raise PackageRejected("Resource publicUrl must be non-empty text")
                if public_url in public_urls:
                    raise PackageRejected(
                        f"Ambiguous cross-package resource publicUrl: {public_url}"
                    )
                public_urls[public_url] = (package_id, resource_id)
        catalog_resource_ids = {
            require_text(item, "resourceId", "runtime catalog resource")
            for item in raw_resources
            if isinstance(item, dict)
        }
        if index_ids != catalog_resource_ids:
            raise PackageRejected(
                "Resource index is not the exact runtime-catalog resource set"
            )
        closure = read_manifest_role_json(
            installed, "dependency-closure", "dependency closure"
        )
        if closure.get("closureDigest") != installed.record["closureDigest"]:
            raise PackageRejected("Dependency closure digest differs from install record")
        if closure.get("definitionIndexDigest") != installed.record["definitionIndexDigest"]:
            raise PackageRejected("Definition-index digest differs from install record")
        if closure.get("embeddedFragments") not in ([], None):
            raise PackageRejected(
                "Current package consumer does not support embedded-fragment activation"
            )
        raw_definitions = closure.get("definitions")
        if not isinstance(raw_definitions, list):
            raise PackageRejected("Dependency closure definitions must be an array")
        for raw_definition in raw_definitions:
            definition = object_value(raw_definition, "dependency closure definition")
            key = canonical_key(definition.get("key"))
            binding = (
                require_text(definition, "ownerPackageId", "dependency closure definition"),
                require_digest(definition, "definitionDigest", "dependency closure definition"),
            )
            previous = definitions.setdefault(key, binding)
            if previous != binding:
                raise PackageRejected(f"Cross-package definition conflict for {key}")
    for offering_id, landscape_id, view_ids in offering_references:
        if landscape_id not in landscapes:
            raise PackageRejected(
                f"Offering references unknown landscapeId: {offering_id}"
            )
        for view_id in view_ids:
            view_binding = views.get(view_id)
            if view_binding is None or view_binding[1] != landscape_id:
                raise PackageRejected(
                    f"Offering references unknown or foreign viewId: {offering_id}"
                )


def lock_entry(installed: VerifiedInstall) -> dict[str, Any]:
    record = installed.record
    return {
        "packageId": record["packageId"],
        "packageVersion": record["packageVersion"],
        "releaseId": record["releaseId"],
        "outerZipSha256": record["outerZipSha256"],
        "manifestSha256": record["manifestSha256"],
        "contentDigest": record["contentDigest"],
        "archiveRoot": record["archiveRoot"],
        "closureDigest": record["closureDigest"],
        "definitionIndexDigest": record["definitionIndexDigest"],
        "installRecordSha256": installed.record_sha256,
    }


def require_expected_active(actual: str | None, expected: str) -> None:
    expected_value = None if expected == "none" else expected
    if expected_value is not None and not SHA256_RE.fullmatch(expected_value):
        raise PackageRejected(
            "--expected-active-sha256 must be 'none' or 64 lowercase hex characters"
        )
    if actual != expected_value:
        raise PackageRejected(
            f"Active-lock CAS mismatch: expected {expected_value or 'none'}, "
            f"found {actual or 'none'}"
        )


def publish_lock(
    layout: StoreLayout,
    lock: dict[str, Any],
    validators: dict[str, Draft202012Validator],
    *,
    base_sha256: str | None,
    base_bytes: bytes | None,
) -> str:
    validate_schema(lock, validators["lock"], "candidate active package lock")
    validate_lock_semantics(lock)
    raw = stable_json_bytes(lock)
    lock_sha = sha256_bytes(raw)
    _latest, latest_bytes, latest_sha = read_active_lock(layout, validators["lock"])
    if latest_sha != base_sha256 or latest_bytes != base_bytes:
        raise PackageRejected(
            "Active package lock changed after validation and before CAS publication"
        )
    if base_sha256 is not None:
        if base_bytes is None or sha256_bytes(base_bytes) != base_sha256:
            raise TrustFailure("Observed active lock bytes/hash are inconsistent")
        write_immutable(
            layout.lock_history / f"{base_sha256}.json", base_bytes
        )
    write_immutable(layout.lock_history / f"{lock_sha}.json", raw)

    def final_cas_check() -> None:
        _observed, observed_bytes, observed_sha = read_active_lock(
            layout, validators["lock"]
        )
        if observed_sha != base_sha256 or observed_bytes != base_bytes:
            raise PackageRejected(
                "Active package lock changed immediately before CAS replacement"
            )

    atomic_replace(
        layout.locks / "active.json",
        raw,
        before_replace=final_cas_check,
    )
    return lock_sha


def activate(
    layout: StoreLayout,
    outer_hashes: Sequence[str],
    expected_active: str,
    consumer_version: str,
    validators: dict[str, Draft202012Validator],
) -> tuple[str, list[VerifiedInstall]]:
    _current, current_raw, current_sha = read_active_lock(layout, validators["lock"])
    require_expected_active(current_sha, expected_active)
    if not outer_hashes:
        raise PackageRejected("Activation needs at least one --outer-sha256")
    installs = [verify_install(layout, value, validators) for value in outer_hashes]
    installs.sort(key=lambda item: item.record["packageId"])
    verify_activation_set(installs, consumer_version)
    lock = {
        "lockFormatVersion": LOCK_FORMAT_VERSION,
        "packages": [lock_entry(item) for item in installs],
    }
    return publish_lock(
        layout,
        lock,
        validators,
        base_sha256=current_sha,
        base_bytes=current_raw,
    ), installs


def rollback(
    layout: StoreLayout,
    target_sha: str,
    expected_active: str,
    consumer_version: str,
    validators: dict[str, Draft202012Validator],
) -> tuple[str, list[VerifiedInstall]]:
    if not SHA256_RE.fullmatch(target_sha):
        raise PackageRejected("--to-lock-sha256 must be 64 lowercase hex characters")
    _current, current_raw, current_sha = read_active_lock(layout, validators["lock"])
    require_expected_active(current_sha, expected_active)
    target_path = layout.lock_history / f"{target_sha}.json"
    require_store_file_metadata(target_path, "historical package lock", mode=0o444)
    target_raw = read_regular_file(
        target_path, "historical package lock", maximum=MAX_LOCK_BYTES
    )
    if sha256_bytes(target_raw) != target_sha:
        raise PackageRejected("Historical package lock hash drift")
    target = object_value(
        parse_json_bytes(target_raw, "historical package lock", maximum=MAX_LOCK_BYTES),
        "historical package lock",
    )
    if stable_json_bytes(target) != target_raw:
        raise PackageRejected("Historical package lock is not canonical JSON")
    validate_schema(target, validators["lock"], "historical package lock")
    validate_lock_semantics(target)
    installs: list[VerifiedInstall] = []
    for entry in target["packages"]:
        installed = verify_install(layout, entry["outerZipSha256"], validators)
        expected = lock_entry(installed)
        if expected != entry:
            raise PackageRejected(
                f"Historical lock/install evidence drift for {entry['releaseId']}"
            )
        installs.append(installed)
    verify_activation_set(installs, consumer_version)
    published_sha = publish_lock(
        layout,
        target,
        validators,
        base_sha256=current_sha,
        base_bytes=current_raw,
    )
    if published_sha != target_sha:
        raise TrustFailure("Historical lock changed during rollback publication")
    return target_sha, installs


def status_document(
    layout: StoreLayout, validators: dict[str, Draft202012Validator]
) -> dict[str, Any]:
    active, _raw, active_sha = read_active_lock(layout, validators["lock"])
    installed_rows: list[dict[str, Any]] = []
    paths = sorted(layout.install_records.glob("*.json"))
    if len(paths) > MAX_INSTALLED_RECORDS:
        raise TrustFailure("Installed-package record count exceeds operational limit")
    for path in paths:
        stem = path.stem
        if not SHA256_RE.fullmatch(stem):
            raise TrustFailure(f"Unexpected install-record filename: {path.name}")
        installed = verify_install(layout, stem, validators)
        record = installed.record
        installed_rows.append(
            {
                "packageId": record["packageId"],
                "packageVersion": record["packageVersion"],
                "releaseId": record["releaseId"],
                "outerZipSha256": record["outerZipSha256"],
                "contentDigest": record["contentDigest"],
            }
        )
    installed_rows.sort(key=lambda item: (item["packageId"], item["packageVersion"], item["outerZipSha256"]))
    return {
        "statusFormatVersion": 1,
        "store": str(layout.root),
        "activeLockSha256": active_sha,
        "active": active,
        "installed": installed_rows,
    }


def output_operation(operation: str, **fields: Any) -> None:
    document = {"operation": operation, "status": "passed", **fields}
    sys.stdout.buffer.write(stable_json_bytes(document))


def store_argument(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--store",
        type=Path,
        default=(
            Path(os.environ["SKILLPILOT_CURRICULUM_PACKAGE_STORE"])
            if os.environ.get("SKILLPILOT_CURRICULUM_PACKAGE_STORE")
            else None
        ),
        required=not bool(os.environ.get("SKILLPILOT_CURRICULUM_PACKAGE_STORE")),
        help=(
            "private curriculum-package store; alternatively set "
            "SKILLPILOT_CURRICULUM_PACKAGE_STORE"
        ),
    )


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    install_parser = subparsers.add_parser("install", help="validate and install one ZIP")
    store_argument(install_parser)
    install_parser.add_argument("--zip", type=Path, required=True)
    install_parser.add_argument(
        "--validator-timeout-seconds",
        type=int,
        default=DEFAULT_VALIDATOR_TIMEOUT_SECONDS,
    )

    verify_parser = subparsers.add_parser("verify", help="rehash one installed object")
    store_argument(verify_parser)
    verify_parser.add_argument("--outer-sha256", required=True)

    activate_parser = subparsers.add_parser("activate", help="CAS-activate an exact package set")
    store_argument(activate_parser)
    activate_parser.add_argument("--outer-sha256", action="append", required=True)
    activate_parser.add_argument("--expected-active-sha256", required=True)
    activate_parser.add_argument("--consumer-version", required=True)

    rollback_parser = subparsers.add_parser("rollback", help="CAS-restore a historical package lock")
    store_argument(rollback_parser)
    rollback_parser.add_argument("--to-lock-sha256", required=True)
    rollback_parser.add_argument("--expected-active-sha256", required=True)
    rollback_parser.add_argument("--consumer-version", required=True)

    status_parser = subparsers.add_parser("status", help="show active and installed identities")
    store_argument(status_parser)

    self_test_parser = subparsers.add_parser(
        "self-test", help="run the bounded synthetic lifecycle/adversarial suite"
    )
    self_test_parser.add_argument("--verbose", action="store_true")

    return parser.parse_args(argv)


def run(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    if args.command == "self-test":
        test_path = Path(__file__).resolve().with_name(
            "test_curriculum_package_provisioner.py"
        )
        if test_path.is_symlink() or not test_path.is_file():
            raise TrustFailure(f"Provisioner self-test script is unavailable: {test_path}")
        command = [sys.executable, "-B", str(test_path)]
        if args.verbose:
            command.append("--verbose")
        try:
            completed = subprocess.run(
                command,
                cwd=REPO_ROOT,
                stdin=subprocess.DEVNULL,
                check=False,
                close_fds=True,
            )
        except OSError as error:
            raise TrustFailure(f"Cannot execute provisioner self-test: {error}") from error
        return completed.returncode
    if args.command == "install" and not 1 <= args.validator_timeout_seconds <= 86_400:
        raise PackageRejected("--validator-timeout-seconds must be in 1..86400")
    profile = load_profile()
    validators = load_operational_validators()
    layout = prepare_store(args.store)
    with exclusive_store_lock(layout):
        if args.command == "install":
            installed = install_package(
                args.zip,
                layout,
                profile,
                validators,
                timeout_seconds=args.validator_timeout_seconds,
            )
            output_operation(
                "install",
                outerZipSha256=installed.record["outerZipSha256"],
                installRecordSha256=installed.record_sha256,
                packageId=installed.record["packageId"],
                packageVersion=installed.record["packageVersion"],
                releaseId=installed.record["releaseId"],
                contentDigest=installed.record["contentDigest"],
            )
        elif args.command == "verify":
            installed = verify_install(layout, args.outer_sha256, validators)
            output_operation(
                "verify",
                outerZipSha256=installed.record["outerZipSha256"],
                installRecordSha256=installed.record_sha256,
                releaseId=installed.record["releaseId"],
                manifestFiles=installed.report["counts"]["manifestFiles"],
            )
        elif args.command == "activate":
            lock_sha, installs = activate(
                layout,
                args.outer_sha256,
                args.expected_active_sha256,
                args.consumer_version,
                validators,
            )
            output_operation(
                "activate",
                activeLockSha256=lock_sha,
                releases=[item.record["releaseId"] for item in installs],
            )
        elif args.command == "rollback":
            lock_sha, installs = rollback(
                layout,
                args.to_lock_sha256,
                args.expected_active_sha256,
                args.consumer_version,
                validators,
            )
            output_operation(
                "rollback",
                activeLockSha256=lock_sha,
                releases=[item.record["releaseId"] for item in installs],
            )
        elif args.command == "status":
            sys.stdout.buffer.write(stable_json_bytes(status_document(layout, validators)))
        else:  # pragma: no cover - argparse makes this unreachable
            raise TrustFailure(f"Unsupported command {args.command!r}")
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    try:
        return run(argv)
    except PackageRejected as error:
        print(f"REJECTED: {error}", file=sys.stderr)
        return 1
    except (TrustFailure, OSError) as error:
        print(f"TRUST/IO ERROR: {error}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("TRUST/IO ERROR: interrupted", file=sys.stderr)
        return 2
    except Exception as error:  # fail closed without a traceback in operator output
        print(f"TRUST/IO ERROR: unexpected {type(error).__name__}: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
