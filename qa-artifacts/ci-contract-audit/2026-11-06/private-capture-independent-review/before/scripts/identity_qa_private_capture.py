#!/usr/bin/env python3
"""Private byte capture for isolated QA; no learner/runtime activation API."""
import hashlib
import json
import os
from pathlib import Path
import posixpath
import shutil
import stat
import subprocess
import tempfile


def require(value, message):
    if not value:
        raise ValueError(message)


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def git_blob_oid(raw):
    return hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()


def relative_path(path):
    require(isinstance(path, str) and path and not path.startswith("/")
            and all(part not in ("", ".", "..") for part in path.split("/")), "Unsafe capture path")
    return path


def snapshot_blob(snapshot, logical):
    """Bind file/directory symlink hops and terminal bytes to pinned Git blobs."""
    path, aliases, seen = relative_path(logical), [], set()
    while True:
        require(path not in seen, "Cyclic Git input alias: " + logical)
        seen.add(path)
        parts = path.split("/")
        for size in range(1, len(parts) + 1):
            prefix = "/".join(parts[:size])
            entry = snapshot.entries.get(prefix)
            if not entry or entry[0] != "120000":
                continue
            raw = subprocess.check_output(["git", "-C", str(snapshot.root), "cat-file", "blob", entry[1]])
            require(git_blob_oid(raw) == entry[1], "Git alias blob differs: " + prefix)
            target = raw.decode("utf-8")
            require(target and "\0" not in target and not target.startswith("/"), "External Git input alias: " + prefix)
            resolved = posixpath.normpath(posixpath.join(posixpath.dirname(prefix), target, *parts[size:]))
            require(resolved != ".." and not resolved.startswith("../"), "External Git input alias: " + prefix)
            aliases.append({"path": prefix, "target": target, "gitObjectId": entry[1]})
            path = relative_path(resolved)
            break
        else:
            require(path in snapshot.entries, "Missing Git capture input: " + path)
            mode, oid = snapshot.entries[path]
            require(mode in ("100644", "100755"), "Unsupported Git capture mode")
            return path, mode, oid, aliases


def private_write(path, raw, mode=0o444):
    """Own inode only: never chmod or write through a host/source hardlink."""
    require(not path.is_symlink() and not path.exists(), "Capture destination already exists")
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".capture-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(raw)
            stream.flush()
            os.fsync(stream.fileno())
            os.fchmod(stream.fileno(), mode)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


class PrivateBlobCapture:
    def __init__(self, root, max_bytes, reserve_bytes=1_000_000_000, private_root=None):
        self.root, self.max_bytes, self.reserve_bytes = Path(root), max_bytes, reserve_bytes
        self.private_root = Path(private_root).resolve() if private_root else self.root.resolve()
        require(self.root.resolve().is_relative_to(self.private_root), "Blob store is outside its private scope")
        require(max_bytes > 0 and reserve_bytes >= 0, "Invalid private capture budget")
        require(not self.root.is_symlink(), "Capture root cannot be a symlink")
        self.root.mkdir(parents=True, exist_ok=True, mode=0o700)
        require(not (self.root / "frozen.json").exists(), "Private capture is already frozen")
        require(not (self.root / "blobs").is_symlink(), "Private blob directory cannot be a symlink")
        (self.root / "blobs").mkdir(exist_ok=True)
        self.bytes = sum(path.stat().st_size for path in (self.root / "blobs").glob("*") if path.is_file())

    def capture_git(self, snapshot, logical, raw=None, expected_sha256=None):
        require(not Path(snapshot.root).resolve().is_relative_to(self.private_root), "Host repository is inside the private capture scope")
        actual, mode, oid, aliases = snapshot_blob(snapshot, logical)
        raw = snapshot.read(actual) if raw is None else raw
        require(git_blob_oid(raw) == oid, "Captured bytes differ from pinned Git blob: " + logical)
        sha = digest(raw)
        require(expected_sha256 is None or sha == expected_sha256, "Captured bytes differ from bound SHA: " + logical)
        target = self.root / "blobs" / sha
        if target.exists() or target.is_symlink():
            require(not target.is_symlink() and target.is_file() and target.stat().st_size == len(raw)
                    and digest(target.read_bytes()) == sha, "Existing private blob is not authentic")
            if target.stat().st_nlink > 1:
                verify_private_hardlinks(self.private_root)
        else:
            require(self.bytes + len(raw) <= self.max_bytes, "Private binary capture budget exceeded")
            require(shutil.disk_usage(self.root).free - len(raw) >= self.reserve_bytes, "Private capture reserve would be exhausted")
            private_write(target, raw)
            self.bytes += len(raw)
        return {"path": logical, "resolvedGitPath": actual, "gitMode": mode, "gitObjectId": oid,
                "gitAliases": aliases, "hostPath": str(target.resolve()), "sha256": sha, "bytes": len(raw),
                "source": "private-git-blob-capture"}


def dependency_inventory(root):
    """Actual tree content, modes and internal symlinks; never follow a link out."""
    root = Path(root)
    require(root.is_dir() and not root.is_symlink(), "Dependency root must be a physical directory")
    rows = []
    for directory, directories, files in os.walk(root, followlinks=False):
        for name in sorted(directories + files):
            path = Path(directory) / name
            relative = path.relative_to(root).as_posix()
            info = path.lstat()
            if stat.S_ISLNK(info.st_mode):
                target = os.readlink(path)
                resolved = posixpath.normpath(posixpath.join(posixpath.dirname(relative), target))
                require(target and not target.startswith("/") and resolved != ".." and not resolved.startswith("../"),
                        "Dependency symlink escapes its private tree: " + relative)
                rows.append({"path": relative, "kind": "symlink", "target": target})
            elif stat.S_ISDIR(info.st_mode):
                rows.append({"path": relative, "kind": "directory"})
            else:
                require(stat.S_ISREG(info.st_mode), "Special dependency input is not permitted: " + relative)
                with open_regular_at(root, relative) as stream:
                    raw = stream.read()
                rows.append({"path": relative, "kind": "file", "sha256": digest(raw), "bytes": len(raw),
                             "executable": bool(info.st_mode & 0o111)})
    require(any(row["kind"] == "file" for row in rows), "Dependency file scope is empty")
    return sorted(rows, key=lambda row: row["path"])


def open_regular_at(root, relative):
    parts = relative_path(relative).split("/")
    directory = os.open(root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        for part in parts[:-1]:
            next_directory = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=directory)
            os.close(directory)
            directory = next_directory
        fd = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW, dir_fd=directory)
        try:
            require(stat.S_ISREG(os.fstat(fd).st_mode), "Dependency input is not a regular file")
            return os.fdopen(fd, "rb")
        except BaseException:
            os.close(fd)
            raise
    finally:
        os.close(directory)


def inventory_digest(rows):
    return digest(json.dumps(rows, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode())


def capture_dependencies(snapshot, source, destination, accepted_tree_sha256, max_bytes, reserve_bytes=1_000_000_000):
    """Installed bytes are separately pinned tool inputs, not claimed Git code."""
    source, destination = Path(source), Path(destination)
    rows = dependency_inventory(source)
    require(inventory_digest(rows) == accepted_tree_sha256, "External installed dependency-tree pin differs")
    lock_path = "app/package-lock.json"
    actual, mode, oid, aliases = snapshot_blob(snapshot, lock_path)
    lock = snapshot.read(actual)
    require(git_blob_oid(lock) == oid, "Pinned dependency lock differs from Git")
    total = sum(row.get("bytes", 0) for row in rows)
    require(0 < total <= max_bytes, "Private dependency capture budget exceeded")
    require(not destination.exists() and not destination.is_symlink(), "Dependency capture destination already exists")
    destination.mkdir(parents=True, mode=0o700)
    require(shutil.disk_usage(destination).free - total >= reserve_bytes, "Private dependency capture reserve would be exhausted")
    for row in rows:
        target = destination / row["path"]
        if row["kind"] == "directory":
            target.mkdir(parents=True, exist_ok=True)
        elif row["kind"] == "symlink":
            target.parent.mkdir(parents=True, exist_ok=True)
            target.symlink_to(row["target"])
        else:
            with open_regular_at(source, row["path"]) as stream:
                raw = stream.read()
            require(len(raw) == row["bytes"] and digest(raw) == row["sha256"], "Dependency changed while being captured: " + row["path"])
            private_write(target, raw, 0o555 if row["executable"] else 0o444)
    for row in rows:
        if row["kind"] == "symlink":
            require((destination / row["path"]).resolve(strict=True).is_relative_to(destination.resolve()), "Captured dependency link escapes tree")
    require(dependency_inventory(destination) == rows, "Private dependency tree differs from accepted capture")
    return {"root": str(destination.resolve()), "treeSha256": accepted_tree_sha256, "bytes": total, "entries": rows,
            "gitLockBinding": {"path": lock_path, "resolvedGitPath": actual, "gitObjectId": oid, "sha256": digest(lock), "bytes": len(lock)},
            "installedBytesClaimedAsGitContents": False}


def freeze_capture(root):
    root = Path(root)
    private_write(root / "frozen.json", b'{"purpose":"private-qa-input-freeze","runtimeActivationAllowed":false}\n')
    for directory, directories, files in os.walk(root, topdown=False, followlinks=False):
        for name in files:
            path = Path(directory) / name
            if not path.is_symlink():
                os.chmod(path, 0o555 if path.stat().st_mode & 0o111 else 0o444)
        os.chmod(directory, 0o555)


def verify_private_hardlinks(root):
    """Every regular inode's complete hardlink set must stay inside the pair."""
    counts, links = {}, {}
    for directory, _, files in os.walk(root, followlinks=False):
        for name in files:
            path = Path(directory) / name
            info = path.lstat()
            if not stat.S_ISREG(info.st_mode):
                continue
            key = (info.st_dev, info.st_ino)
            counts[key] = counts.get(key, 0) + 1
            links[key] = info.st_nlink
    require(all(counts[key] == number for key, number in links.items()), "Private input inode has hardlinks outside the private root")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Measure installed dependency inputs without copying or approving them")
    parser.add_argument("--dependency-inventory", type=Path, required=True)
    args = parser.parse_args()
    rows = dependency_inventory(args.dependency_inventory)
    print(json.dumps({"dependencyRoot": str(args.dependency_inventory.resolve()),
                      "treeSha256": inventory_digest(rows), "entries": len(rows),
                      "files": sum(row["kind"] == "file" for row in rows),
                      "logicalBytes": sum(row.get("bytes", 0) for row in rows),
                      "sourceWrites": False, "qaValidityClaimed": False}, sort_keys=True))
