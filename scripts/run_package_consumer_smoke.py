#!/usr/bin/env python3
"""Build and execute the hermetic package-only SkillPilot consumer smoke proof."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import secrets
import shutil
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterable


REPO_ROOT = Path(__file__).resolve().parents[1]
RUNNER_PATH = REPO_ROOT / "scripts/run_package_consumer_smoke.py"
APP_ROOT = REPO_ROOT / "app"
BACKEND_ROOT = REPO_ROOT / "backend"
JAVA_VERSION_PATH = REPO_ROOT / ".java-version"
CORRETTO_VERSION_PATH = REPO_ROOT / ".corretto-version"
SCHEMA_PATH = REPO_ROOT / "contracts/curriculum-package/v1/package-consumer-smoke-report.schema.json"
REPORT_SCHEMA_ID = "https://skillpilot.com/schemas/curriculum-package/v1/package-consumer-smoke-report.schema.json"
RUNNER_ID = "skillpilot-package-consumer-smoke"
RUNNER_VERSION = "1.0.0"
CONSUMER_API_VERSION = "0.1.0"
SANDBOX_JAVA_HOME = "/opt/skillpilot-jdk"
SANDBOX_TOOL_DIRECTORY = "/opt/skillpilot-host-tools"
FUNCTIONAL_CHECK_IDS = (
    "app-shell.served",
    "catalog.package-discovery",
    "catalog.root-landscape-resolved",
    "landscape.transitive-runtime-closure",
    "offering.default-resolved",
    "composition-view.resolved",
    "learning.frontier-computed",
    "cards.deck-loaded",
    "cards.verified-recall-loaded",
    "resources.goal-visualization-bytes",
    "migration.aliases-loaded",
    "source-evidence.goal-lookup",
    "fallback.legacy-route-rejected",
    "fallback.repository-data-unavailable",
    "fallback.raw-data-route-rejected",
)
POISON_SENTINEL_PATTERNS = (
    ("repository.curricula", ("curricula",)),
    ("repository.app-public-data", ("app/public/data", "public/data")),
    ("repository.app-source-data", ("app/src/data", "frontend/src/data", "src/data")),
    (
        "repository.docs-quality-status",
        ("docs/qa-ci/status", "qa-ci/status", "curriculum-quality-status.json"),
    ),
    (
        "repository.backend-static-data",
        ("backend/src/main/resources/static/data", "main/resources/static/data"),
    ),
)
FILE_SYSCALL_PATTERN = re.compile(
    r"\b(?:open|openat|openat2|stat|statx|lstat|newfstatat|access|faccessat|faccessat2|readlink|readlinkat|"
    r"execve|chdir|mkdir|mkdirat|unlink|unlinkat|rename|renameat|renameat2)\("
)
SUCCESSFUL_ALIAS_OPEN_PATTERN = re.compile(
    r'\bopenat\([^\n]*"[^"\n]*migration-aliases\.json"[^\n]*O_RDONLY[^\n]*\)\s*=\s*'
    r'(?P<fd>[0-9]+)<(?P<resolved>[^>]*migration-aliases\.json)>'
)
SHA256_PATTERN = re.compile(r"^[a-f0-9]{64}$")

# The readiness policy pins this top-level runner. These additional pins make
# every directly executed/copied helper an explicit input of that trust anchor.
# Update them intentionally whenever one of the named helpers changes.
PINNED_HELPER_SHA256 = {
    "app/scripts/buildPackageConsumerFrontend.ts": "376b6f26df3a502c7b702f8a30761123e9a911862fb49f08cf89109c9e3f630c",
    "app/vite.config.ts": "b0e9d80887401b2497e9a9affdb7c152b5c6d810f8834c273992203ee36ed315",
    "backend/src/main/resources/action-regression-openapi.yaml": "17f9f7283c13148d3d19fa7c041e56c67938cc3b4ffe3b621a0918d43d805f87",
    "backend/src/main/resources/action-regression-report.html": "a8531a620b3d923cfdc3b9f8839d99d9b60edf01795c33fd84b2572c06ae59fe",
    "backend/src/main/resources/claude-mcp-regression-report.html": "0237929c224ab7cf1e512cfedbb31e2401766d80a4b5e16bc937dcbf5b01addf",
    "scripts/package_consumer_browser_smoke.cjs": "b5fae928700ba0092a599a854322598a228be8716e84407f1a0d2b4a62a47b05",
    "scripts/package_consumer_runtime.init.gradle": "e084d70053a16a9a499a3cab7e807035d9179ee0f318f26318de798f096b470b",
    "scripts/package_consumer_sandbox_entry.py": "32c348c4912271f3773705477bd4f2d86ad332ed2a68a92498188f45879499d3",
    "scripts/package_consumer_smoke_http.py": "d9617437722a6a651f35f1e8e614e98db4569e97d9ff519a9e10d2c70101acbb",
}

BACKEND_CLASSPATH_RESOURCES = (
    "backend/src/main/resources/action-regression-openapi.yaml",
    "backend/src/main/resources/action-regression-report.html",
    "backend/src/main/resources/claude-mcp-regression-report.html",
)


class SmokeFailure(RuntimeError):
    pass


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()


def canonical_document(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> tuple[int, str]:
    digest = hashlib.sha256()
    size = 0
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    descriptor = os.open(path, flags)
    metadata = os.fstat(descriptor)
    if not stat.S_ISREG(metadata.st_mode):
        os.close(descriptor)
        raise SmokeFailure(f"Expected a regular file: {path}")
    with os.fdopen(descriptor, "rb") as handle:
        while chunk := handle.read(4 * 1024 * 1024):
            size += len(chunk)
            digest.update(chunk)
    return size, digest.hexdigest()


def collect_regular_files(root: Path) -> list[Path]:
    if root.is_symlink() or not root.is_dir():
        raise SmokeFailure(f"Tree root must be a non-symlink directory: {root}")
    files: list[Path] = []
    for path in sorted(root.rglob("*"), key=lambda item: item.relative_to(root).as_posix()):
        if path.is_symlink():
            raise SmokeFailure(f"Symlink is forbidden in runtime assembly: {path}")
        if path.is_file():
            files.append(path)
        elif not path.is_dir():
            raise SmokeFailure(f"Non-regular runtime assembly entry: {path}")
    return files


def tree_manifest(root: Path) -> tuple[dict[str, Any], tuple[int, str]]:
    digest = hashlib.sha256()
    total = 0
    entries: list[dict[str, Any]] = []
    for path in collect_regular_files(root):
        relative = path.relative_to(root).as_posix()
        size, file_hash = sha256_file(path)
        total += size
        entries.append({"path": relative, "bytes": size, "sha256": file_hash})
        digest.update(relative.encode())
        digest.update(b"\0")
        digest.update(str(size).encode())
        digest.update(b"\0")
        digest.update(file_hash.encode())
        digest.update(b"\n")
    if total == 0:
        raise SmokeFailure(f"Runtime assembly tree is empty: {root}")
    binding = (total, digest.hexdigest())
    return {
        "manifestFormatVersion": 1,
        "digestAlgorithm": "sha256(path-utf8 NUL decimal-bytes NUL file-sha256 LF)",
        "bytes": total,
        "sha256": binding[1],
        "files": entries,
    }, binding


def digest_tree(root: Path) -> tuple[int, str]:
    return tree_manifest(root)[1]


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise SmokeFailure(f"Cannot read JSON {path}: {error}") from error


def read_regular_bytes(path: Path) -> bytes:
    size, expected_hash = sha256_file(path)
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    descriptor = os.open(path, flags)
    try:
        content = b""
        with os.fdopen(descriptor, "rb", closefd=False) as handle:
            content = handle.read()
    finally:
        os.close(descriptor)
    if len(content) != size or sha256_bytes(content) != expected_hash:
        raise SmokeFailure(f"File changed while being read: {path}")
    return content


def require_tool(name: str) -> str:
    resolved = shutil.which(name)
    if not resolved:
        raise SmokeFailure(f"Required hermetic consumer tool is unavailable: {name}")
    return str(Path(resolved).resolve())


def read_version_pin(path: Path) -> str:
    assert_no_symlink_components(path)
    try:
        value = read_regular_bytes(path).decode("utf-8").strip()
    except OSError as error:
        raise SmokeFailure(f"Version pin cannot be read: {path}: {error}") from error
    except UnicodeDecodeError as error:
        raise SmokeFailure(f"Version pin is not UTF-8: {path}") from error
    if not value or not re.fullmatch(r"[0-9A-Za-z.+_-]+", value):
        raise SmokeFailure(f"Version pin is empty or malformed: {path}")
    return value


def inspect_java_runtime_layout(executable: Path) -> dict[str, Any]:
    """Resolve one conventional JDK home and bind its exact filesystem identity."""

    try:
        canonical = executable.resolve(strict=True)
    except OSError as error:
        raise SmokeFailure(f"Java executable cannot be resolved: {executable}: {error}") from error
    if canonical.name != "java" or canonical.parent.name != "bin":
        raise SmokeFailure(
            f"Java executable must have the conventional <jdk>/bin/java layout: {canonical}"
        )
    java_home = canonical.parent.parent
    for path in (java_home, canonical.parent, canonical):
        assert_no_symlink_components(path)
    home_metadata = java_home.stat(follow_symlinks=False)
    bin_metadata = canonical.parent.stat(follow_symlinks=False)
    java_metadata = canonical.stat(follow_symlinks=False)
    if not stat.S_ISDIR(home_metadata.st_mode) or not stat.S_ISDIR(bin_metadata.st_mode):
        raise SmokeFailure(f"Java home/bin layout is not made of real directories: {canonical}")
    if not stat.S_ISREG(java_metadata.st_mode) or java_metadata.st_mode & 0o111 == 0:
        raise SmokeFailure(f"Java launcher is not a regular executable: {canonical}")
    return {
        "executable": canonical,
        "home": java_home,
        "homeIdentity": (home_metadata.st_dev, home_metadata.st_ino),
        "javaIdentity": (java_metadata.st_dev, java_metadata.st_ino),
    }


def validate_pinned_java_runtime(executable: Path) -> dict[str, Any]:
    runtime = inspect_java_runtime_layout(executable)
    expected_java = read_version_pin(JAVA_VERSION_PATH)
    expected_corretto = read_version_pin(CORRETTO_VERSION_PATH)
    release_path = runtime["home"] / "release"
    assert_no_symlink_components(release_path)
    try:
        release_text = read_regular_bytes(release_path).decode("utf-8")
    except OSError as error:
        raise SmokeFailure(f"JDK release metadata cannot be read: {release_path}: {error}") from error
    except UnicodeDecodeError as error:
        raise SmokeFailure(f"JDK release metadata is not UTF-8: {release_path}") from error
    release_values: dict[str, str] = {}
    for line in release_text.splitlines():
        if "=" not in line:
            continue
        name, value = line.split("=", 1)
        release_values[name] = value.strip().strip('"')
    if (
        release_values.get("JAVA_VERSION") != expected_java
        or release_values.get("IMPLEMENTOR") != "Amazon.com Inc."
        or release_values.get("IMPLEMENTOR_VERSION") != f"Corretto-{expected_corretto}"
    ):
        raise SmokeFailure(
            "Resolved Java home does not match .java-version/.corretto-version release metadata"
        )
    result = subprocess.run(
        [str(runtime["executable"]), "-version"],
        env={"HOME": "/nonexistent", "LANG": "C", "LC_ALL": "C", "TZ": "UTC"},
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=30,
        check=False,
    )
    version_match = re.search(r'\bversion\s+"([^"]+)"', result.stdout)
    corretto_match = re.search(r"\bCorretto-([0-9A-Za-z.+_-]+)", result.stdout)
    if (
        result.returncode != 0
        or version_match is None
        or corretto_match is None
        or version_match.group(1) != expected_java
        or corretto_match.group(1) != expected_corretto
    ):
        raise SmokeFailure(
            "Resolved Java launcher does not match the repository's exact Amazon Corretto pins"
        )
    runtime["javaVersion"] = expected_java
    runtime["correttoVersion"] = expected_corretto
    return runtime


def open_java_runtime_fds(runtime: dict[str, Any]) -> tuple[int, int]:
    """Open the JDK tree and launcher without following mutable path aliases."""

    directory_flags = (
        os.O_RDONLY
        | getattr(os, "O_DIRECTORY", 0)
        | getattr(os, "O_NOFOLLOW", 0)
        | getattr(os, "O_CLOEXEC", 0)
    )
    file_flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0)
    home_fd = os.open(runtime["home"], directory_flags)
    bin_fd: int | None = None
    java_fd: int | None = None
    try:
        if (os.fstat(home_fd).st_dev, os.fstat(home_fd).st_ino) != runtime["homeIdentity"]:
            raise SmokeFailure("Java home changed before its sandbox bind")
        bin_fd = os.open("bin", directory_flags, dir_fd=home_fd)
        java_fd = os.open("java", file_flags, dir_fd=bin_fd)
        java_metadata = os.fstat(java_fd)
        if (
            not stat.S_ISREG(java_metadata.st_mode)
            or java_metadata.st_mode & 0o111 == 0
            or (java_metadata.st_dev, java_metadata.st_ino) != runtime["javaIdentity"]
        ):
            raise SmokeFailure("Java launcher changed before its sandbox bind")
        result = (home_fd, java_fd)
        home_fd = -1
        java_fd = None
        return result
    finally:
        if bin_fd is not None:
            os.close(bin_fd)
        if java_fd is not None:
            os.close(java_fd)
        if home_fd >= 0:
            os.close(home_fd)


def absolute_without_resolving(path: Path) -> Path:
    if ".." in Path(path).parts:
        raise SmokeFailure(f"Path must not contain '..': {path}")
    return Path(os.path.abspath(os.fspath(path)))


def assert_no_symlink_components(path: Path) -> None:
    absolute = absolute_without_resolving(path)
    current = Path(absolute.anchor)
    for component in absolute.parts[1:]:
        current /= component
        try:
            metadata = os.lstat(current)
        except FileNotFoundError:
            continue
        if stat.S_ISLNK(metadata.st_mode):
            raise SmokeFailure(f"Symlink path component is forbidden: {current}")


def preflight_output_path(path: Path) -> Path:
    target = absolute_without_resolving(path)
    no_follow = getattr(os, "O_NOFOLLOW", None)
    directory_flag = getattr(os, "O_DIRECTORY", None)
    if no_follow is None or directory_flag is None:
        raise SmokeFailure("No-follow directory-descriptor support is required")
    flags = os.O_RDONLY | no_follow | directory_flag | getattr(os, "O_CLOEXEC", 0)
    parent_fd = os.open(target.anchor, flags)
    try:
        for component in target.parts[1:-1]:
            try:
                metadata = os.stat(component, dir_fd=parent_fd, follow_symlinks=False)
            except FileNotFoundError:
                return target
            if stat.S_ISLNK(metadata.st_mode):
                raise SmokeFailure(f"Output parent has a symlink component: {component}")
            if not stat.S_ISDIR(metadata.st_mode):
                raise SmokeFailure(f"Output parent is not a directory: {component}")
            next_fd = os.open(component, flags, dir_fd=parent_fd)
            os.close(parent_fd)
            parent_fd = next_fd
        try:
            metadata = os.stat(target.name, dir_fd=parent_fd, follow_symlinks=False)
        except FileNotFoundError:
            return target
        if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode):
            raise SmokeFailure(f"Unsafe output target: {target}")
        return target
    finally:
        os.close(parent_fd)


def same_inode(first: Path, second: Path) -> bool:
    try:
        first_metadata = first.stat(follow_symlinks=False)
        second_metadata = second.stat(follow_symlinks=False)
    except FileNotFoundError:
        return False
    return (
        first_metadata.st_dev == second_metadata.st_dev
        and first_metadata.st_ino == second_metadata.st_ino
    )


def safe_atomic_write(path: Path, content: bytes) -> None:
    target = absolute_without_resolving(path)
    no_follow = getattr(os, "O_NOFOLLOW", None)
    directory_flag = getattr(os, "O_DIRECTORY", None)
    if no_follow is None or directory_flag is None:
        raise SmokeFailure("No-follow directory-descriptor support is required")
    directory_flags = os.O_RDONLY | no_follow | directory_flag | getattr(os, "O_CLOEXEC", 0)
    parent_fd = os.open(target.anchor, directory_flags)
    temporary_name: str | None = None
    try:
        for component in target.parts[1:-1]:
            try:
                metadata = os.stat(component, dir_fd=parent_fd, follow_symlinks=False)
            except FileNotFoundError:
                try:
                    os.mkdir(component, 0o755, dir_fd=parent_fd)
                except FileExistsError:
                    pass
                metadata = os.stat(component, dir_fd=parent_fd, follow_symlinks=False)
            if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISDIR(metadata.st_mode):
                raise SmokeFailure(f"Unsafe output parent component: {component}")
            next_fd = os.open(component, directory_flags, dir_fd=parent_fd)
            os.close(parent_fd)
            parent_fd = next_fd
        try:
            metadata = os.stat(target.name, dir_fd=parent_fd, follow_symlinks=False)
        except FileNotFoundError:
            metadata = None
        if metadata is not None and (
            stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode)
        ):
            raise SmokeFailure(f"Unsafe output target: {target}")
        descriptor: int | None = None
        for _attempt in range(20):
            candidate = f".{target.name}.{secrets.token_hex(12)}.tmp"
            try:
                descriptor = os.open(
                    candidate,
                    os.O_WRONLY | os.O_CREAT | os.O_EXCL | no_follow | getattr(os, "O_CLOEXEC", 0),
                    0o600,
                    dir_fd=parent_fd,
                )
            except FileExistsError:
                continue
            temporary_name = candidate
            break
        if descriptor is None or temporary_name is None:
            raise SmokeFailure("Cannot allocate atomic output file")
        try:
            with os.fdopen(descriptor, "wb") as handle:
                descriptor = None
                handle.write(content)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary_name, target.name, src_dir_fd=parent_fd, dst_dir_fd=parent_fd)
            temporary_name = None
            os.fsync(parent_fd)
        finally:
            if descriptor is not None:
                os.close(descriptor)
    finally:
        if temporary_name is not None:
            try:
                os.unlink(temporary_name, dir_fd=parent_fd)
            except FileNotFoundError:
                pass
        os.close(parent_fd)


def verify_pinned_helpers() -> dict[str, dict[str, Any]]:
    bindings: dict[str, dict[str, Any]] = {}
    for relative, expected_hash in sorted(PINNED_HELPER_SHA256.items()):
        path = REPO_ROOT / relative
        assert_no_symlink_components(path)
        size, actual_hash = sha256_file(path)
        if expected_hash != actual_hash:
            raise SmokeFailure(
                f"Pinned package-consumer helper differs: {relative}: {actual_hash} != {expected_hash}"
            )
        bindings[relative] = {"bytes": size, "sha256": actual_hash}
    return bindings


def copy_backend_classpath_resources(classes_target: Path) -> None:
    resource_root = Path("backend/src/main/resources")
    for relative in BACKEND_CLASSPATH_RESOURCES:
        relative_path = Path(relative)
        try:
            classpath_path = relative_path.relative_to(resource_root)
        except ValueError as error:
            raise SmokeFailure(f"Backend classpath resource is outside its source root: {relative}") from error
        if classpath_path.is_absolute() or ".." in classpath_path.parts:
            raise SmokeFailure(f"Backend classpath resource has an unsafe target path: {relative}")
        if relative not in PINNED_HELPER_SHA256:
            raise SmokeFailure(f"Backend classpath resource is not pinned: {relative}")
        source = REPO_ROOT / relative_path
        assert_no_symlink_components(source)
        _size, actual_hash = sha256_file(source)
        if actual_hash != PINNED_HELPER_SHA256[relative]:
            raise SmokeFailure(f"Backend classpath resource differs from its pin: {relative}")
        target = classes_target / classpath_path
        if target.exists():
            raise SmokeFailure(f"Backend classpath resource collides with a compiled output: {classpath_path}")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)


def assert_safe_work_directory(path: Path) -> None:
    lexical = absolute_without_resolving(path)
    tmp_root = absolute_without_resolving(REPO_ROOT / "tmp")
    try:
        relative = lexical.relative_to(tmp_root)
    except ValueError as error:
        raise SmokeFailure(f"Work directory must be below repository tmp/: {path}") from error
    if not relative.parts:
        raise SmokeFailure("Repository tmp/ itself cannot be the package-consumer work directory")
    assert_no_symlink_components(tmp_root)
    assert_no_symlink_components(lexical)


def paths_overlap(first: Path, second: Path) -> bool:
    return (
        first == second
        or first in second.parents
        or second in first.parents
    )


def validate_runner_paths(
    zip_path: Path,
    store: Path,
    report_path: Path,
    work: Path,
) -> None:
    """Reject every destructive alias/overlap before work cleanup or writes."""

    for input_path in (zip_path, store):
        assert_no_symlink_components(input_path)
    if not zip_path.is_file() or zip_path.is_symlink():
        raise SmokeFailure(f"Input ZIP must be a non-symlink regular file: {zip_path}")
    if not store.is_dir() or store.is_symlink():
        raise SmokeFailure(f"Package store must be a non-symlink directory: {store}")
    assert_safe_work_directory(work)
    report = preflight_output_path(report_path)

    zip_actual = zip_path.resolve(strict=True)
    store_actual = store.resolve(strict=True)
    work_actual = work.resolve(strict=False)
    if paths_overlap(work_actual, store_actual):
        raise SmokeFailure("Consumer work directory must be disjoint from package store")
    if paths_overlap(work_actual, zip_actual):
        raise SmokeFailure("Consumer work directory must be disjoint from input ZIP")
    if paths_overlap(report, work_actual):
        raise SmokeFailure("Consumer report must be disjoint from consumer work")
    if report == zip_actual or same_inode(report, zip_actual):
        raise SmokeFailure("Consumer report must differ from input ZIP")
    if report == store_actual or store_actual in report.parents:
        raise SmokeFailure("Consumer report must be outside package store")

    protected_checkout = (REPO_ROOT / "tmp/lehrplan-ontologie").resolve(strict=False)
    if paths_overlap(work_actual, protected_checkout):
        raise SmokeFailure(
            "Consumer work directory must be disjoint from tmp/lehrplan-ontologie"
        )
    if report == protected_checkout or protected_checkout in report.parents:
        raise SmokeFailure(
            "Consumer report must be outside tmp/lehrplan-ontologie"
        )


def prepare_empty_directory(path: Path) -> None:
    path = absolute_without_resolving(path)
    assert_safe_work_directory(path)
    if path.exists():
        if path.is_symlink() or not path.is_dir():
            raise SmokeFailure(f"Unsafe existing work directory: {path}")
        shutil.rmtree(path)
    path.mkdir(parents=True)
    assert_safe_work_directory(path)


def run_command(
    command: list[str],
    *,
    cwd: Path,
    env: dict[str, str] | None = None,
    timeout: int = 900,
) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        command,
        cwd=cwd,
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
        check=False,
    )
    if result.returncode != 0:
        tail = "\n".join(result.stdout.splitlines()[-100:])
        raise SmokeFailure(f"Command failed ({result.returncode}): {' '.join(command)}\n{tail}")
    return result


def selected_package_binding(store: Path, zip_path: Path) -> tuple[dict[str, Any], dict[str, Any], bytes]:
    lock_path = store / "locks/active.json"
    assert_no_symlink_components(lock_path)
    lock_bytes = read_regular_bytes(lock_path)
    lock = json.loads(lock_bytes)
    packages = lock.get("packages")
    if not isinstance(packages, list) or len(packages) != 1 or not isinstance(packages[0], dict):
        raise SmokeFailure("Consumer smoke requires an active lock with exactly one package")
    selected = packages[0]
    required = {
        "packageId",
        "packageVersion",
        "releaseId",
        "outerZipSha256",
        "manifestSha256",
        "contentDigest",
        "archiveRoot",
        "closureDigest",
        "definitionIndexDigest",
        "installRecordSha256",
    }
    if set(selected) != required:
        raise SmokeFailure(f"Active package lock entry fields differ: {set(selected)} != {required}")
    zip_bytes, zip_hash = sha256_file(zip_path)
    if selected["outerZipSha256"] != zip_hash:
        raise SmokeFailure("Input ZIP bytes differ from the active package lock")
    if zip_bytes <= 0:
        raise SmokeFailure("Input ZIP is empty")
    active_lock_hash = sha256_bytes(lock_bytes)
    return selected, {
        "name": zip_path.name,
        "bytes": zip_bytes,
        "sha256": zip_hash,
        "packageId": selected["packageId"],
        "packageVersion": selected["packageVersion"],
        "releaseId": selected["releaseId"],
        "archiveRoot": selected["archiveRoot"],
        "manifestSha256": selected["manifestSha256"],
        "contentDigest": selected["contentDigest"],
        "closureDigest": selected["closureDigest"],
        "definitionIndexDigest": selected["definitionIndexDigest"],
    }, lock_bytes


def installed_package_root(store: Path, selected: dict[str, Any]) -> Path:
    root = store / "objects/sha256" / selected["outerZipSha256"] / selected["archiveRoot"]
    assert_no_symlink_components(root)
    if not root.is_dir() or root.is_symlink():
        raise SmokeFailure(f"Installed package object root is unavailable: {root}")
    return root


def find_deck_routes(package_root: Path) -> tuple[str, str]:
    manifest = load_json(package_root / "metadata/manifest.json")
    records = [entry for entry in manifest.get("files", []) if entry.get("role") == "card-deck"]
    if not records or not isinstance(records[0].get("path"), str):
        raise SmokeFailure("Installed package manifest has no card-deck artifact")
    relative = records[0]["path"]
    return f"/data/{Path(relative).name}", f"/{relative}"


def build_frontend(frontend: Path) -> tuple[int, str]:
    # Invoke the pinned builder directly rather than trusting a mutable npm
    # script indirection. TypeScript compilation remains a separate exact tool
    # invocation and the resulting closed artifact is hashed below.
    run_command(
        [
            "node",
            str(APP_ROOT / "node_modules/typescript/bin/tsc"),
            "-b",
        ],
        cwd=APP_ROOT,
        timeout=600,
    )
    result = run_command(
        [
            "node",
            str(APP_ROOT / "node_modules/tsx/dist/cli.mjs"),
            str(APP_ROOT / "scripts/buildPackageConsumerFrontend.ts"),
            "--out-dir",
            str(frontend),
        ],
        cwd=APP_ROOT,
        timeout=600,
    )
    if "publicDirectoryCopied" not in result.stdout:
        raise SmokeFailure("Package-consumer frontend builder emitted no closed build report")
    forbidden = [frontend / "data", frontend / "ai-assets", frontend / "assets/goal-visualizations"]
    if any(path.exists() for path in forbidden):
        raise SmokeFailure("Package-consumer frontend contains repository curriculum data")
    return digest_tree(frontend)


def copy_playwright_runtime(assembly: Path) -> tuple[str, str, tuple[int, str]]:
    playwright_source = APP_ROOT / "node_modules/playwright"
    playwright_core_source = APP_ROOT / "node_modules/playwright-core"
    for source in (playwright_source, playwright_core_source):
        assert_no_symlink_components(source)
        if not source.is_dir() or source.is_symlink():
            raise SmokeFailure(f"Pinned Playwright runtime package is unavailable: {source}")
        collect_regular_files(source)
    metadata = load_json(playwright_source / "package.json")
    version = metadata.get("version")
    if version != "1.59.1":
        raise SmokeFailure(f"Package-consumer smoke requires Playwright 1.59.1, got {version!r}")

    executable_result = run_command(
        [
            "node",
            "-e",
            "const {chromium}=require('./app/node_modules/playwright');process.stdout.write(chromium.executablePath())",
        ],
        cwd=REPO_ROOT,
        timeout=30,
    )
    executable = Path(executable_result.stdout.strip())
    assert_no_symlink_components(executable)
    if not executable.is_file() or executable.is_symlink():
        raise SmokeFailure(f"Installed Playwright Chromium executable is unavailable: {executable}")
    browser_source = executable.parent.parent
    if browser_source.parent.name != "ms-playwright" or not browser_source.name.startswith("chromium-"):
        raise SmokeFailure(f"Unexpected Playwright browser layout: {executable}")
    collect_regular_files(browser_source)

    module_target = assembly / "playwright/node_modules"
    module_target.mkdir(parents=True)
    shutil.copytree(playwright_source, module_target / "playwright")
    shutil.copytree(playwright_core_source, module_target / "playwright-core")
    browser_target = assembly / "browser" / browser_source.name
    browser_target.parent.mkdir()
    shutil.copytree(browser_source, browser_target)
    relative_executable = executable.relative_to(browser_source)
    sandbox_executable = Path("/opt/skillpilot-runtime/browser") / browser_source.name / relative_executable
    return version, sandbox_executable.as_posix(), digest_tree(assembly / "playwright")


def build_backend_assembly(
    work: Path,
    assembly: Path,
    java_runtime: dict[str, Any],
) -> tuple[int, str]:
    build_directory = work / "backend-build"
    classpath_path = work / "backend-runtime-classpath.txt"
    env = dict(os.environ)
    env["JAVA_HOME"] = str(java_runtime["home"])
    env["PATH"] = f"{java_runtime['home']}/bin:{env.get('PATH', '')}"
    env["SKILLPILOT_BACKEND_BUILD_DIR"] = str(build_directory)
    run_command(
        [
            "./gradlew",
            "--no-daemon",
            "-I",
            str(REPO_ROOT / "scripts/package_consumer_runtime.init.gradle"),
            "writePackageConsumerRuntimeClasspath",
            f"-PpackageConsumerClasspathOutput={classpath_path}",
        ],
        cwd=BACKEND_ROOT,
        env=env,
        timeout=900,
    )
    classes = build_directory / "classes/java/main"
    if not classes.is_dir():
        raise SmokeFailure(f"Backend compilation produced no main classes: {classes}")
    shutil.copytree(classes, assembly / "classes")
    copy_backend_classpath_resources(assembly / "classes")
    dependency_root = assembly / "deps"
    dependency_root.mkdir()
    seen_names: dict[str, str] = {}
    for raw in classpath_path.read_text(encoding="utf-8").splitlines():
        source = Path(raw)
        if not source.is_file() or source.suffix != ".jar":
            raise SmokeFailure(f"Backend runtime classpath has a non-jar entry: {source}")
        _size, digest = sha256_file(source)
        prior = seen_names.get(source.name)
        if prior is not None and prior != digest:
            raise SmokeFailure(f"Backend dependency basename collision: {source.name}")
        if prior is None:
            seen_names[source.name] = digest
            shutil.copy2(source, dependency_root / source.name)
    if not any(path.name.startswith("h2-") for path in dependency_root.iterdir()):
        raise SmokeFailure("Hermetic backend assembly has no H2 runtime driver")
    return digest_tree(assembly)


def runtime_configuration() -> dict[str, Any]:
    return {
        "configurationFormatVersion": 1,
        "consumer": "SkillPilot",
        "consumerApiVersion": CONSUMER_API_VERSION,
        "javaMainClass": "com.skillpilot.backend.SkillpilotApplication",
        "javaOptions": ["-Xmx1536m"],
        "classpath": [
            "/opt/skillpilot-runtime/classes",
            "/opt/skillpilot-runtime/frontend-classpath",
            "/opt/skillpilot-runtime/deps/*",
        ],
        "applicationArguments": [
            "--server.port=18080",
            "--server.address=127.0.0.1",
            "--skillpilot.curriculum.source=package",
            f"--skillpilot.curriculum.consumer-version={CONSUMER_API_VERSION}",
            "--skillpilot.curriculum.packages.store-directory=/opt/curriculum-store",
            "--skillpilot.curriculum.packages.active-lock=locks/active.json",
            "--spring.datasource.url=jdbc:h2:mem:consumer-smoke;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
            "--spring.datasource.driver-class-name=org.h2.Driver",
            "--spring.datasource.username=sa",
            "--spring.datasource.password=",
            "--spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
            "--spring.jpa.hibernate.ddl-auto=create-drop",
            "--spring.jpa.show-sql=false",
            "--spring.liquibase.enabled=false",
            "--spring.security.oauth2.client.registration.github.client-id=consumer-smoke",
            "--spring.security.oauth2.client.registration.github.client-secret=consumer-smoke",
            "--skillpilot.security.signing-secret=consumer-smoke-not-production",
            "--logging.file.name=/opt/runtime-output/backend.log",
            "--logging.level.root=INFO",
        ],
    }


SANDBOX_ENVIRONMENT = {
    "HOME": "/tmp",
    "JAVA_HOME": SANDBOX_JAVA_HOME,
    "LANG": "C.UTF-8",
    "LC_ALL": "C.UTF-8",
    "LOGNAME": "skillpilot",
    "PWD": "/tmp",
    "PYTHONDONTWRITEBYTECODE": "1",
    "TMPDIR": "/tmp",
    "TZ": "UTC",
    "USER": "skillpilot",
    "XDG_CACHE_HOME": "/tmp/.cache",
    "XDG_CONFIG_HOME": "/tmp/.config",
}


def execute_sandbox(
    assembly: Path,
    store: Path,
    evidence_bundle: Path,
    java_runtime: dict[str, Any],
    node_path: str,
) -> int:
    repository = str(REPO_ROOT)
    node_executable = Path(node_path)
    python_executable = Path(require_tool("python3"))
    strace_executable = Path(require_tool("strace"))
    for name, executable in (
        ("node", node_executable),
        ("python3", python_executable),
        ("strace", strace_executable),
    ):
        assert_no_symlink_components(executable)
        metadata = executable.stat(follow_symlinks=False)
        if executable.name != name and name != "python3":
            raise SmokeFailure(f"Resolved {name} executable has an unexpected basename: {executable}")
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_mode & 0o111 == 0:
            raise SmokeFailure(f"Resolved {name} tool is not a regular executable: {executable}")

    # Keep PATH closed: the sandbox can resolve only the FD-bound JDK plus the
    # two exact host-tool symlinks below. In particular, /usr/bin/java can
    # never become a compatibility fallback for classes built by the pinned JDK.
    sandbox_path = f"{SANDBOX_JAVA_HOME}/bin:{SANDBOX_TOOL_DIRECTORY}"
    java_home_fd, java_executable_fd = open_java_runtime_fds(java_runtime)
    try:
        command = [
            require_tool("bwrap"),
            "--clearenv",
            "--die-with-parent",
            "--new-session",
            "--unshare-user",
            "--unshare-pid",
            "--unshare-net",
            "--unshare-ipc",
            "--unshare-uts",
            "--ro-bind",
            "/",
            "/",
            "--tmpfs",
            "/opt",
            "--ro-bind",
            str(assembly),
            "/opt/skillpilot-runtime",
            "--ro-bind",
            str(store),
            "/opt/curriculum-store",
            "--bind",
            str(evidence_bundle),
            "/opt/runtime-output",
            # Preserve allowed package inputs first, then hide both the checkout
            # and /tmp. The JDK is mounted afterwards from already-open FDs, so
            # a Corretto installation below the masked checkout remains usable.
            "--tmpfs",
            repository,
            "--tmpfs",
            "/tmp",
            "--ro-bind-fd",
            str(java_home_fd),
            SANDBOX_JAVA_HOME,
            "--ro-bind-fd",
            str(java_executable_fd),
            f"{SANDBOX_JAVA_HOME}/bin/java",
            "--dir",
            SANDBOX_TOOL_DIRECTORY,
            "--symlink",
            str(node_executable),
            f"{SANDBOX_TOOL_DIRECTORY}/node",
            "--symlink",
            str(python_executable),
            f"{SANDBOX_TOOL_DIRECTORY}/python3",
            "--proc",
            "/proc",
            "--dev",
            "/dev",
            "--chdir",
            "/tmp",
        ]
        for name, value in (*sorted(SANDBOX_ENVIRONMENT.items()), ("PATH", sandbox_path)):
            command.extend(("--setenv", name, value))
        command.extend([
            str(strace_executable),
            "-f",
            "-qq",
            "-yy",
            "-s",
            "4096",
            "-e",
            "trace=%file,%network",
            "-o",
            "/opt/runtime-output/filesystem.strace",
            str(python_executable),
            "/opt/skillpilot-runtime/package_consumer_sandbox_entry.py",
        ])
        result = subprocess.run(
            command,
            cwd=REPO_ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=750,
            check=False,
            pass_fds=(java_home_fd, java_executable_fd),
        )
        if (
            (os.fstat(java_home_fd).st_dev, os.fstat(java_home_fd).st_ino)
            != java_runtime["homeIdentity"]
            or (os.fstat(java_executable_fd).st_dev, os.fstat(java_executable_fd).st_ino)
            != java_runtime["javaIdentity"]
        ):
            raise SmokeFailure("FD-bound Java runtime changed during sandbox execution")
    finally:
        os.close(java_executable_fd)
        os.close(java_home_fd)
    safe_atomic_write(evidence_bundle / "sandbox.log", result.stdout.encode())
    return result.returncode


def trace_has_external_network(trace: str) -> bool:
    for line in trace.splitlines():
        # An attempted connect that the isolated network namespace rejects is
        # expected. Only a successful non-loopback operation violates policy.
        result = re.search(r"\)\s+=\s+(-?[0-9]+)", line)
        if result is None or int(result.group(1)) < 0:
            continue
        ipv4 = re.findall(r'inet_addr\("([0-9.]+)"\)', line)
        if any(not address.startswith("127.") and address != "0.0.0.0" for address in ipv4):
            return True
        ipv6 = re.findall(r'inet_pton\(AF_INET6, "([0-9a-fA-F:]+)"', line)
        if any(address not in {"::", "::1"} for address in ipv6):
            return True
    return False


def traced_file_paths(trace: str) -> list[str]:
    paths: list[str] = []
    for line in trace.splitlines():
        if FILE_SYSCALL_PATTERN.search(line) is None:
            continue
        for raw in re.findall(r'"((?:\\.|[^"\\])*)"', line):
            try:
                decoded = json.loads(f'"{raw}"')
            except json.JSONDecodeError:
                decoded = raw
            paths.append(decoded.replace("\\", "/"))
    return paths


def poison_sentinel_observed(paths: list[str], patterns: tuple[str, ...]) -> bool:
    for candidate in paths:
        normalized = re.sub(r"/(?:\./)+", "/", candidate.lower())
        segments = [segment for segment in normalized.split("/") if segment not in {"", ".", ".."}]
        for pattern in patterns:
            lowered = pattern.lower()
            if lowered == "curricula":
                if "curricula" in segments:
                    return True
            elif lowered == "curriculum-quality-status.json":
                if segments and segments[-1] == lowered:
                    return True
            elif lowered in "/".join(segments):
                return True
    return False


def build_report(
    *,
    input_binding: dict[str, Any],
    selected: dict[str, Any],
    lock_bytes: bytes,
    frontend_binding: tuple[int, str],
    backend_binding: tuple[int, str],
    configuration_binding: tuple[int, str],
    runner_binding: tuple[int, str],
    assembly_binding: tuple[int, str],
    evidence_bundle: Path,
    sandbox_status: int,
) -> dict[str, Any]:
    diagnostics: list[dict[str, str]] = []
    trace_path = evidence_bundle / "filesystem.strace"
    if trace_path.is_file():
        trace_bytes, trace_hash = sha256_file(trace_path)
        trace_text = trace_path.read_text(encoding="utf-8", errors="replace")
    else:
        trace_bytes, trace_hash, trace_text = 0, None, ""
        diagnostics.append({"code": "FILESYSTEM_TRACE_MISSING", "message": "The isolated runtime emitted no filesystem trace."})

    isolation_path = evidence_bundle / "isolation-probe.json"
    isolation_probe = load_json(isolation_path) if isolation_path.is_file() else {
        "sourceCheckoutAccessible": True,
        "repositoryMountAccessible": True,
        "networkPolicy": "unknown",
        "packageStoreReadOnly": False,
        "environmentKeys": [],
    }
    traced_paths = traced_file_paths(trace_text)
    poison = []
    for sentinel_id, patterns in POISON_SENTINEL_PATTERNS:
        observed = poison_sentinel_observed(traced_paths, patterns)
        poison.append({"id": sentinel_id, "result": "observed" if observed else "not-observed"})
        if observed:
            diagnostics.append({"code": "REPOSITORY_SENTINEL_OBSERVED", "message": f"Runtime trace observed {sentinel_id}."})
    if trace_has_external_network(trace_text):
        diagnostics.append({"code": "EXTERNAL_NETWORK_OBSERVED", "message": "Runtime trace contains a non-loopback IP address."})

    expected_environment_keys = sorted((*SANDBOX_ENVIRONMENT, "PATH"))
    if isolation_probe.get("environmentKeys") != expected_environment_keys:
        diagnostics.append({
            "code": "SANDBOX_ENVIRONMENT_NOT_CLEARED",
            "message": (
                "Isolated consumer environment differs from the explicit allowlist: "
                f"{isolation_probe.get('environmentKeys')} != {expected_environment_keys}"
            ),
        })

    http_path = evidence_bundle / "http-smoke.json"
    if http_path.is_file():
        http_result = load_json(http_path)
        diagnostics.extend(http_result.get("diagnostics", []))
        by_id = {entry["id"]: entry for entry in http_result.get("checks", [])}
    else:
        by_id = {}
        diagnostics.append({"code": "HTTP_SMOKE_MISSING", "message": "The isolated runtime emitted no HTTP smoke result."})

    alias_lines = [line for line in trace_text.splitlines() if SUCCESSFUL_ALIAS_OPEN_PATTERN.search(line)]
    alias_evidence_path = evidence_bundle / "evidence/migration.aliases-loaded.json"
    if alias_lines:
        alias_evidence = canonical_json({
            "id": "migration.aliases-loaded",
            "result": "passed",
            "traceMatches": alias_lines[:20],
        })
        alias_evidence_path.parent.mkdir(parents=True, exist_ok=True)
        safe_atomic_write(alias_evidence_path, alias_evidence)
        by_id["migration.aliases-loaded"] = {
            "id": "migration.aliases-loaded",
            "result": "passed",
            "evidenceSha256": sha256_bytes(alias_evidence),
        }
    else:
        by_id["migration.aliases-loaded"] = {
            "id": "migration.aliases-loaded",
            "result": "failed",
            "evidenceSha256": None,
        }
        diagnostics.append({"code": "MIGRATION_ALIASES_NOT_TRACED", "message": "Runtime did not trace a package migration-alias artifact read."})

    browser_path = evidence_bundle / "browser-smoke.json"
    if browser_path.is_file():
        browser_result = load_json(browser_path)
        if browser_result.get("status") != "passed" or browser_result.get("diagnostics"):
            for entry in browser_result.get("diagnostics", []):
                diagnostics.append({
                    "code": entry.get("code", "BROWSER_SMOKE_FAILED"),
                    "message": str(entry.get("message", "Browser smoke failed"))[:2000],
                })
        else:
            app_shell_evidence_path = evidence_bundle / "evidence/app-shell.served.json"
            if app_shell_evidence_path.is_file() and by_id.get("app-shell.served", {}).get("result") == "passed":
                app_shell_evidence = load_json(app_shell_evidence_path)
                browser_bytes = read_regular_bytes(browser_path)
                app_shell_evidence["browserExecution"] = {
                    "result": "passed",
                    "evidenceBytes": len(browser_bytes),
                    "evidenceSha256": sha256_bytes(browser_bytes),
                    "renderedContent": browser_result["packageCase"]["renderedContent"],
                    "catalogFailureMarker": browser_result["failClosedCase"]["marker"],
                }
                combined_bytes = canonical_json(app_shell_evidence)
                safe_atomic_write(app_shell_evidence_path, combined_bytes)
                by_id["app-shell.served"]["evidenceSha256"] = sha256_bytes(combined_bytes)
            else:
                diagnostics.append({
                    "code": "BROWSER_EVIDENCE_UNBOUND",
                    "message": "Browser evidence could not be bound into the app-shell functional check.",
                })
    else:
        diagnostics.append({"code": "BROWSER_SMOKE_MISSING", "message": "The isolated runtime emitted no browser smoke result."})

    checks = [by_id.get(check_id, {"id": check_id, "result": "not-run", "evidenceSha256": None}) for check_id in FUNCTIONAL_CHECK_IDS]
    passed = sum(entry["result"] == "passed" for entry in checks)
    failed = sum(entry["result"] == "failed" for entry in checks)
    not_run = sum(entry["result"] == "not-run" for entry in checks)

    isolation_ok = (
        trace_hash is not None
        and trace_bytes > 0
        and not isolation_probe["sourceCheckoutAccessible"]
        and not isolation_probe["repositoryMountAccessible"]
        and isolation_probe["networkPolicy"] == "loopback-only"
        and isolation_probe["packageStoreReadOnly"]
        and isolation_probe.get("environmentKeys") == expected_environment_keys
        and all(entry["result"] == "not-observed" for entry in poison)
        and not trace_has_external_network(trace_text)
    )
    if sandbox_status != 0:
        diagnostics.append({"code": "SANDBOX_PROCESS_FAILED", "message": f"Isolated consumer exited with status {sandbox_status}."})
    status = "passed" if passed == 15 and isolation_ok and sandbox_status == 0 and not diagnostics else "failed"
    diagnostics.sort(key=lambda entry: (entry["code"], entry["message"]))

    frontend_bytes, frontend_hash = frontend_binding
    backend_bytes, backend_hash = backend_binding
    configuration_bytes, configuration_hash = configuration_binding
    runner_bytes, runner_hash = runner_binding
    assembly_bytes, assembly_hash = assembly_binding
    evidence_bytes, evidence_hash = digest_tree(evidence_bundle)
    return {
        "$schema": REPORT_SCHEMA_ID,
        "reportFormatVersion": 1,
        "runner": {
            "id": RUNNER_ID,
            "version": RUNNER_VERSION,
            "scriptBytes": runner_bytes,
            "scriptSha256": runner_hash,
        },
        "status": status,
        "input": input_binding,
        "activation": {
            "activeLockBytes": len(lock_bytes),
            "activeLockSha256": sha256_bytes(lock_bytes),
            "activeLock": json.loads(lock_bytes),
            "generationSha256": sha256_bytes(lock_bytes),
            "packageCount": 1,
            "selectedPackage": selected,
        },
        "application": {
            "consumer": "SkillPilot",
            "consumerApiVersion": CONSUMER_API_VERSION,
            "frontendBytes": frontend_bytes,
            "frontendSha256": frontend_hash,
            "backendBytes": backend_bytes,
            "backendSha256": backend_hash,
            "configurationBytes": configuration_bytes,
            "configurationSha256": configuration_hash,
            "assemblyBytes": assembly_bytes,
            "assemblySha256": assembly_hash,
        },
        "evidenceBundle": {"bytes": evidence_bytes, "sha256": evidence_hash},
        "isolation": {
            "mechanism": "bubblewrap user/pid/net/ipc/uts namespaces; hidden repository; read-only package store; strace file/network audit",
            "hermetic": isolation_ok,
            "sourceCheckoutAccessible": bool(isolation_probe["sourceCheckoutAccessible"]),
            "repositoryMountAccessible": bool(isolation_probe["repositoryMountAccessible"]),
            "networkPolicy": isolation_probe["networkPolicy"],
            "packageStoreReadOnly": bool(isolation_probe["packageStoreReadOnly"]),
            "filesystemTraceBytes": trace_bytes,
            "filesystemTraceSha256": trace_hash,
            "poisonSentinels": poison,
        },
        "functionalChecks": checks,
        "summary": {"required": 15, "passed": passed, "failed": failed, "notRun": not_run},
        "diagnostics": diagnostics,
    }


def validate_report(report: dict[str, Any]) -> None:
    try:
        import jsonschema
    except ImportError as error:
        raise SmokeFailure("jsonschema is required to validate consumer-smoke evidence") from error
    schema = load_json(SCHEMA_PATH)
    validator = jsonschema.Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(report), key=lambda item: list(item.absolute_path))
    if errors:
        messages = [f"/{'/'.join(map(str, error.absolute_path))}: {error.message}" for error in errors[:20]]
        raise SmokeFailure("Consumer smoke report violates its schema:\n" + "\n".join(messages))


def self_test() -> None:
    verify_pinned_helpers()
    pinned_runtime = validate_pinned_java_runtime(Path(require_tool("java")))
    if pinned_runtime["executable"] != pinned_runtime["home"] / "bin/java":
        raise SmokeFailure("Pinned Java layout did not resolve to one exact JDK home")
    root = REPO_ROOT / "tmp/package-consumer-smoke-self-test"
    prepare_empty_directory(root)
    try:
        (root / "a").write_bytes(b"alpha")
        (root / "nested").mkdir()
        (root / "nested/b").write_bytes(b"beta")
        first = digest_tree(root)
        second = digest_tree(root)
        if first != second or first[0] != 9 or not SHA256_PATTERN.fullmatch(first[1]):
            raise SmokeFailure("Runtime tree digest is not deterministic")
        classpath_fixture = root / "backend-classpath"
        classpath_fixture.mkdir()
        copy_backend_classpath_resources(classpath_fixture)
        expected_classpath_files = {
            Path(relative).relative_to("backend/src/main/resources").as_posix()
            for relative in BACKEND_CLASSPATH_RESOURCES
        }
        observed_classpath_files = {
            path.relative_to(classpath_fixture).as_posix()
            for path in classpath_fixture.rglob("*")
            if path.is_file()
        }
        if observed_classpath_files != expected_classpath_files:
            raise SmokeFailure("Hermetic backend classpath resource allowlist did not copy its exact file set")
        for relative in BACKEND_CLASSPATH_RESOURCES:
            classpath_path = Path(relative).relative_to("backend/src/main/resources")
            if (classpath_fixture / classpath_path).read_bytes() != (REPO_ROOT / relative).read_bytes():
                raise SmokeFailure(f"Pinned backend classpath resource was not copied unchanged: {relative}")
        print("PASS pinned backend classpath resources are copied into the hermetic assembly")
        if not trace_has_external_network('connect(1, {sin_addr=inet_addr("203.0.113.1")}, 16) = 0'):
            raise SmokeFailure("External network trace was not detected")
        if trace_has_external_network('connect(1, {sin_addr=inet_addr("203.0.113.1")}, 16) = -1 ENETUNREACH'):
            raise SmokeFailure("Rejected external-network probe was treated as successful")
        if trace_has_external_network('connect(1, {sin_addr=inet_addr("127.0.0.1")}, 16) = 0'):
            raise SmokeFailure("Loopback trace was rejected")
        poison_trace = (
            'statx(AT_FDCWD, "../docs/qa-ci/status/curriculum-quality-status.json", '
            'AT_STATX_SYNC_AS_STAT, STATX_ALL, 0x0) = -1 ENOENT\n'
            'newfstatat(AT_FDCWD, "curricula", 0x0, 0) = -1 ENOENT\n'
            'openat(AT_FDCWD, "frontend/src/data/x.json", O_RDONLY) = 3</tmp/x.json>\n'
        )
        poison_paths = traced_file_paths(poison_trace)
        if not poison_sentinel_observed(poison_paths, ("docs/qa-ci/status", "curriculum-quality-status.json")):
            raise SmokeFailure("Relative repository quality poison was not detected")
        if not poison_sentinel_observed(poison_paths, ("curricula",)):
            raise SmokeFailure("Failed relative curricula poison attempt was not detected")
        if not poison_sentinel_observed(poison_paths, ("frontend/src/data",)):
            raise SmokeFailure("Successful frontend source-data poison attempt was not detected")
        if SUCCESSFUL_ALIAS_OPEN_PATTERN.search(
            'openat(AT_FDCWD, "/opt/curriculum-store/a/migration-aliases.json", O_RDONLY) '
            '= 17</opt/curriculum-store/a/migration-aliases.json>'
        ) is None:
            raise SmokeFailure("Successful migration-alias FD trace was not recognized")
        if SUCCESSFUL_ALIAS_OPEN_PATTERN.search(
            'openat(AT_FDCWD, "migration-aliases.json", O_RDONLY) = -1 ENOENT'
        ) is not None:
            raise SmokeFailure("Failed migration-alias open was accepted")

        destruction_root = root / "destruction-guards"
        destruction_root.mkdir()
        fixture_zip = destruction_root / "input.zip"
        fixture_zip.write_bytes(b"original zip bytes")
        fixture_store = destruction_root / "store"
        fixture_store.mkdir()
        store_marker = fixture_store / "store-marker"
        store_marker.write_bytes(b"original store bytes")
        safe_report = destruction_root / "safe-report.json"

        def expect_pre_mutation_rejection(
            label: str,
            *,
            zip_value: Path,
            store_value: Path,
            report_value: Path,
            work_value: Path,
            protected_files: tuple[Path, ...],
        ) -> None:
            snapshots = {path: path.read_bytes() for path in protected_files}
            work_existed = work_value.exists()
            try:
                main(
                    [
                        "--zip",
                        str(zip_value),
                        "--store",
                        str(store_value),
                        "--report",
                        str(report_value),
                        "--work-dir",
                        str(work_value),
                    ]
                )
            except SmokeFailure:
                pass
            else:
                raise SmokeFailure(f"Destructive runner paths were accepted: {label}")
            if any(path.read_bytes() != content for path, content in snapshots.items()):
                raise SmokeFailure(f"Runner corrupted a protected input: {label}")
            if not work_existed and work_value.exists():
                raise SmokeFailure(f"Runner mutated work before rejecting paths: {label}")

        expect_pre_mutation_rejection(
            "report equals ZIP",
            zip_value=fixture_zip,
            store_value=fixture_store,
            report_value=fixture_zip,
            work_value=destruction_root / "work-report-equals-zip",
            protected_files=(fixture_zip, store_marker),
        )
        expect_pre_mutation_rejection(
            "report below store",
            zip_value=fixture_zip,
            store_value=fixture_store,
            report_value=fixture_store / "report.json",
            work_value=destruction_root / "work-report-in-store",
            protected_files=(fixture_zip, store_marker),
        )
        report_zip_link = destruction_root / "report-zip-link.json"
        report_zip_link.symlink_to(fixture_zip)
        expect_pre_mutation_rejection(
            "report symlink aliases ZIP",
            zip_value=fixture_zip,
            store_value=fixture_store,
            report_value=report_zip_link,
            work_value=destruction_root / "work-report-zip-link",
            protected_files=(fixture_zip, store_marker),
        )
        store_parent_link = destruction_root / "store-parent-link"
        store_parent_link.symlink_to(fixture_store, target_is_directory=True)
        expect_pre_mutation_rejection(
            "report parent symlink aliases store",
            zip_value=fixture_zip,
            store_value=fixture_store,
            report_value=store_parent_link / "report.json",
            work_value=destruction_root / "work-report-store-link",
            protected_files=(fixture_zip, store_marker),
        )
        report_zip_hardlink = destruction_root / "report-zip-hardlink.json"
        os.link(fixture_zip, report_zip_hardlink)
        expect_pre_mutation_rejection(
            "report hardlink aliases ZIP",
            zip_value=fixture_zip,
            store_value=fixture_store,
            report_value=report_zip_hardlink,
            work_value=destruction_root / "work-report-zip-hardlink",
            protected_files=(fixture_zip, store_marker),
        )

        work_containing_zip = destruction_root / "work-containing-zip"
        work_containing_zip.mkdir()
        contained_zip = work_containing_zip / "input.zip"
        contained_zip.write_bytes(b"contained zip bytes")
        expect_pre_mutation_rejection(
            "work contains ZIP",
            zip_value=contained_zip,
            store_value=fixture_store,
            report_value=safe_report,
            work_value=work_containing_zip,
            protected_files=(contained_zip, store_marker),
        )
        expect_pre_mutation_rejection(
            "work inside store",
            zip_value=fixture_zip,
            store_value=fixture_store,
            report_value=safe_report,
            work_value=fixture_store / "runner-work",
            protected_files=(fixture_zip, store_marker),
        )
        work_containing_store = destruction_root / "work-containing-store"
        contained_store = work_containing_store / "store"
        contained_store.mkdir(parents=True)
        contained_store_marker = contained_store / "marker"
        contained_store_marker.write_bytes(b"contained store bytes")
        expect_pre_mutation_rejection(
            "work contains store",
            zip_value=fixture_zip,
            store_value=contained_store,
            report_value=safe_report,
            work_value=work_containing_store,
            protected_files=(fixture_zip, contained_store_marker),
        )
        work_containing_report = destruction_root / "work-containing-report"
        work_containing_report.mkdir()
        work_marker = work_containing_report / "marker"
        work_marker.write_bytes(b"original work bytes")
        expect_pre_mutation_rejection(
            "report inside work",
            zip_value=fixture_zip,
            store_value=fixture_store,
            report_value=work_containing_report / "report.json",
            work_value=work_containing_report,
            protected_files=(fixture_zip, store_marker, work_marker),
        )
        protected_checkout = REPO_ROOT / "tmp/lehrplan-ontologie"
        try:
            validate_runner_paths(
                fixture_zip,
                fixture_store,
                safe_report,
                protected_checkout,
            )
        except SmokeFailure:
            pass
        else:
            raise SmokeFailure("Known tmp/lehrplan-ontologie checkout was not protected")
        print("PASS runner rejects ZIP/store/report/work aliases before any mutation")

        bad_java = root / "bad-java-layout/launcher/java"
        bad_java.parent.mkdir(parents=True)
        bad_java.write_text("#!/bin/sh\nexit 0\n", encoding="utf-8")
        bad_java.chmod(0o755)
        try:
            inspect_java_runtime_layout(bad_java)
        except SmokeFailure:
            pass
        else:
            raise SmokeFailure("Non-conventional Java home layout was accepted")

        # The fixture deliberately lives below the checkout path that bwrap
        # masks. Only the already-open home/launcher FDs can carry it across
        # that boundary; PATH contains no host directory to fall back to.
        masked_java_home = root / "masked-checkout-jdk"
        masked_java = masked_java_home / "bin/java"
        masked_java.parent.mkdir(parents=True)
        masked_java.write_text("#!/bin/sh\nprintf '%s\\n' fd-bound-java\n", encoding="utf-8")
        masked_java.chmod(0o755)
        try:
            validate_pinned_java_runtime(masked_java)
        except SmokeFailure:
            pass
        else:
            raise SmokeFailure("Unpinned Java runtime was accepted")
        masked_runtime = inspect_java_runtime_layout(masked_java)
        masked_home_fd, masked_java_fd = open_java_runtime_fds(masked_runtime)
        try:
            masked_command = [
                require_tool("bwrap"),
                "--clearenv",
                "--die-with-parent",
                "--new-session",
                "--unshare-user",
                "--unshare-pid",
                "--ro-bind",
                "/",
                "/",
                "--tmpfs",
                "/opt",
                "--tmpfs",
                str(REPO_ROOT),
                "--tmpfs",
                "/tmp",
                "--ro-bind-fd",
                str(masked_home_fd),
                SANDBOX_JAVA_HOME,
                "--ro-bind-fd",
                str(masked_java_fd),
                f"{SANDBOX_JAVA_HOME}/bin/java",
                "--proc",
                "/proc",
                "--dev",
                "/dev",
                "--chdir",
                "/tmp",
                "--setenv",
                "PATH",
                f"{SANDBOX_JAVA_HOME}/bin",
                "/bin/sh",
                "-c",
                (
                    'test ! -e "$1" && '
                    f'test "$(command -v java)" = "{SANDBOX_JAVA_HOME}/bin/java" && '
                    'test "$(java)" = fd-bound-java && '
                    f'test "$({SANDBOX_JAVA_HOME}/bin/java)" = fd-bound-java'
                ),
                "java-fd-bind-self-test",
                str(masked_java),
            ]
            masked_result = subprocess.run(
                masked_command,
                cwd=REPO_ROOT,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                timeout=30,
                check=False,
                pass_fds=(masked_home_fd, masked_java_fd),
            )
        finally:
            os.close(masked_java_fd)
            os.close(masked_home_fd)
        if masked_result.returncode != 0:
            raise SmokeFailure(
                "FD-bound Java was not executable after checkout masking or used a host fallback: "
                + masked_result.stdout[-1000:]
            )
        print("PASS masked-checkout Java executes only through stable read-only FD bind")

        bwrap_trace = root / "capability.strace"
        capability_code = (
            "import errno,os,socket;"
            "assert 'SKILLPILOT_HOST_ENV_POISON' not in os.environ;"
            "s=socket.socket();s.bind(('127.0.0.1',0));s.close();"
            "s=socket.socket();s.settimeout(1);"
            "r=s.connect_ex(('192.0.2.1',9));s.close();"
            "assert r in (errno.ENETUNREACH,errno.EHOSTUNREACH,errno.EACCES);"
            "open('/tmp/package-consumer-capability','wb').write(b'ok')"
        )
        capability_command = [
            require_tool("bwrap"),
            "--clearenv",
            "--die-with-parent",
            "--new-session",
            "--unshare-user",
            "--unshare-pid",
            "--unshare-net",
            "--unshare-ipc",
            "--unshare-uts",
            "--ro-bind",
            "/",
            "/",
            "--tmpfs",
            "/tmp",
            "--bind",
            str(root),
            "/tmp/out",
            "--proc",
            "/proc",
            "--dev",
            "/dev",
            "--setenv",
            "HOME",
            "/tmp",
            "--setenv",
            "PATH",
            "/usr/bin:/bin",
            "strace",
            "-f",
            "-qq",
            "-yy",
            "-e",
            "trace=%file,%network",
            "-o",
            "/tmp/out/capability.strace",
            "python3",
            "-c",
            capability_code,
        ]
        capability_env = dict(os.environ)
        capability_env["SKILLPILOT_HOST_ENV_POISON"] = "must-be-cleared"
        run_command(capability_command, cwd=REPO_ROOT, env=capability_env, timeout=30)
        capability_trace = bwrap_trace.read_text(encoding="utf-8", errors="replace")
        if "package-consumer-capability" not in capability_trace or "</tmp/package-consumer-capability>" not in capability_trace:
            raise SmokeFailure("Actual bwrap/strace capability did not emit -yy file-descriptor evidence")
        if trace_has_external_network(capability_trace):
            raise SmokeFailure("Actual bwrap network namespace allowed external network access")
    finally:
        shutil.rmtree(root, ignore_errors=True)
    print("Package-consumer smoke runner self-test passed.")


def parse_args(argv: Iterable[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--zip", type=Path)
    parser.add_argument("--store", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--work-dir", type=Path, default=REPO_ROOT / "tmp/package-consumer-smoke")
    parser.add_argument("--self-test", action="store_true")
    return parser.parse_args(list(argv))


def main(argv: Iterable[str] = sys.argv[1:]) -> int:
    args = parse_args(argv)
    if args.self_test:
        self_test()
        return 0
    if args.zip is None or args.store is None or args.report is None:
        raise SmokeFailure("--zip, --store, and --report are required")
    zip_path = absolute_without_resolving(args.zip)
    store = absolute_without_resolving(args.store)
    report_path = absolute_without_resolving(args.report)
    work = absolute_without_resolving(args.work_dir)
    validate_runner_paths(zip_path, store, report_path, work)
    prepare_empty_directory(work)

    require_tool("bwrap")
    require_tool("strace")
    java_runtime = validate_pinned_java_runtime(Path(require_tool("java")))
    node_path = require_tool("node")
    helper_bindings = verify_pinned_helpers()
    runner_binding = sha256_file(RUNNER_PATH)
    selected, input_binding, lock_bytes = selected_package_binding(store, zip_path)
    package_root = installed_package_root(store, selected)
    legacy_route, raw_route = find_deck_routes(package_root)
    _store_manifest_before, store_binding_before = tree_manifest(store)

    frontend = work / "frontend"
    frontend_binding = build_frontend(frontend)
    assembly = work / "assembly"
    assembly.mkdir()
    backend_binding = build_backend_assembly(work, assembly, java_runtime)
    shutil.copytree(frontend, assembly / "frontend-classpath/static")
    for helper in (
        "scripts/package_consumer_smoke_http.py",
        "scripts/package_consumer_sandbox_entry.py",
        "scripts/package_consumer_browser_smoke.cjs",
    ):
        shutil.copy2(REPO_ROOT / helper, assembly / Path(helper).name)
    playwright_version, browser_executable, playwright_binding = copy_playwright_runtime(assembly)

    configuration_bytes = canonical_document(runtime_configuration())
    safe_atomic_write(assembly / "runtime-configuration.json", configuration_bytes)
    configuration_binding = (len(configuration_bytes), sha256_bytes(configuration_bytes))
    expected = {
        "activeLockSha256": sha256_bytes(lock_bytes),
        "selectedPackage": selected,
        "legacyDeckRoute": legacy_route,
        "rawDeckRoute": raw_route,
        "hostRepositoryPath": str(REPO_ROOT),
        "hostSourceCheckoutPath": str(REPO_ROOT / "tmp/lehrplan-ontologie"),
        "playwrightVersion": playwright_version,
        "browserExecutablePath": browser_executable,
    }
    safe_atomic_write(assembly / "expected.json", canonical_json(expected))
    assembly_inputs = {
        "bindingFormatVersion": 1,
        "runner": {"path": RUNNER_PATH.relative_to(REPO_ROOT).as_posix(), "bytes": runner_binding[0], "sha256": runner_binding[1]},
        "pinnedHelpers": helper_bindings,
        "frontend": {"bytes": frontend_binding[0], "sha256": frontend_binding[1]},
        "backend": {"bytes": backend_binding[0], "sha256": backend_binding[1]},
        "playwrightModules": {"bytes": playwright_binding[0], "sha256": playwright_binding[1]},
        "configuration": {"bytes": configuration_binding[0], "sha256": configuration_binding[1]},
    }
    safe_atomic_write(assembly / "assembly-inputs.json", canonical_document(assembly_inputs))
    assembly_manifest, assembly_binding = tree_manifest(assembly)
    safe_atomic_write(work / "assembly-manifest.json", canonical_document(assembly_manifest))

    evidence_bundle = work / "evidence-bundle"
    evidence_bundle.mkdir()
    sandbox_status = execute_sandbox(assembly, store, evidence_bundle, java_runtime, node_path)

    # Re-bind every immutable input after the isolated execution. Any change,
    # including a lock/store/ZIP/helper/assembly TOCTOU, invalidates the proof.
    post_selected, post_input_binding, post_lock_bytes = selected_package_binding(store, zip_path)
    if post_selected != selected or post_input_binding != input_binding or post_lock_bytes != lock_bytes:
        raise SmokeFailure("Package ZIP or active lock changed during consumer execution")
    if tree_manifest(store)[1] != store_binding_before:
        raise SmokeFailure("Installed package store changed during consumer execution")
    if tree_manifest(assembly)[1] != assembly_binding:
        raise SmokeFailure("Runtime assembly changed during consumer execution")
    if sha256_file(RUNNER_PATH) != runner_binding or verify_pinned_helpers() != helper_bindings:
        raise SmokeFailure("Runner or pinned helper changed during consumer execution")
    if validate_pinned_java_runtime(java_runtime["executable"]) != java_runtime:
        raise SmokeFailure("Pinned Java runtime changed during consumer execution")

    report = build_report(
        input_binding=input_binding,
        selected=selected,
        lock_bytes=lock_bytes,
        frontend_binding=frontend_binding,
        backend_binding=backend_binding,
        configuration_binding=configuration_binding,
        runner_binding=runner_binding,
        assembly_binding=assembly_binding,
        evidence_bundle=evidence_bundle,
        sandbox_status=sandbox_status,
    )
    evidence_manifest, evidence_binding = tree_manifest(evidence_bundle)
    if report["evidenceBundle"] != {"bytes": evidence_binding[0], "sha256": evidence_binding[1]}:
        raise SmokeFailure("Final evidence tree differs from the report binding")
    safe_atomic_write(work / "evidence-bundle-manifest.json", canonical_document(evidence_manifest))
    validate_report(report)
    safe_atomic_write(report_path, canonical_document(report))
    if report["status"] != "passed":
        raise SmokeFailure(f"Package-consumer smoke failed; report written to {report_path}")
    print(f"Package-consumer smoke passed: {report_path}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (SmokeFailure, OSError, subprocess.TimeoutExpired, json.JSONDecodeError) as error:
        print(f"FAIL package-consumer smoke: {error}", file=sys.stderr)
        sys.exit(1)
