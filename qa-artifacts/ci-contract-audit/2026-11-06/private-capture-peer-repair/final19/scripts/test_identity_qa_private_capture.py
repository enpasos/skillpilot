#!/usr/bin/env python3
"""Small genuine Git/capture counterexamples; no production or QA writes."""
import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import identity_qa_private_capture as capture_module
from types import SimpleNamespace
from identity_qa_private_capture import (
    PrivateBlobCapture, capture_dependencies, dependency_inventory, freeze_capture,
    inventory_digest, snapshot_blob,
)


class CaptureTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="skillpilot-private-capture-", dir="/dev/shm")
        self.root = Path(self.temp.name)
        self.repo = self.root / "host"
        subprocess.run(["git", "init", "-q", str(self.repo)], check=True)
        self.entries = {}

    def tearDown(self):
        for directory, _, _ in os.walk(self.root):
            os.chmod(directory, 0o700)
        self.temp.cleanup()

    def blob(self, path, raw, mode="100644"):
        oid = subprocess.check_output(["git", "-C", str(self.repo), "hash-object", "-w", "--stdin"], input=raw).decode().strip()
        self.entries[path] = (mode, oid)
        return oid

    def snapshot(self):
        def read(path):
            return subprocess.check_output(["git", "-C", str(self.repo), "cat-file", "blob", self.entries[path][1]])
        return SimpleNamespace(root=self.repo, entries=self.entries, read=read)

    def test_binary_capture_is_private_deduplicated_and_survives_host_mutation(self):
        raw = b"authentic\x00binary"
        self.blob("a.bin", raw)
        self.blob("b.bin", raw)
        host = self.repo / "a.bin"
        host.write_bytes(raw)
        store = PrivateBlobCapture(self.root / "capture", 1000, 0)
        a = store.capture_git(self.snapshot(), "a.bin", host.read_bytes())
        b = store.capture_git(self.snapshot(), "b.bin")
        self.assertEqual(a["hostPath"], b["hostPath"])
        self.assertEqual(store.bytes, len(raw))
        self.assertNotEqual(host.stat().st_ino, Path(a["hostPath"]).stat().st_ino)
        host.write_bytes(b"changed")
        self.assertEqual(Path(a["hostPath"]).read_bytes(), raw)
        self.assertEqual(host.read_bytes(), b"changed")

    def test_wrong_git_bytes_bound_sha_and_tampered_existing_store_reject(self):
        self.blob("a.bin", b"correct\x00")
        store = PrivateBlobCapture(self.root / "capture", 1000, 0)
        with self.assertRaisesRegex(ValueError, "pinned Git blob"):
            store.capture_git(self.snapshot(), "a.bin", b"wrong\x00")
        with self.assertRaisesRegex(ValueError, "bound SHA"):
            store.capture_git(self.snapshot(), "a.bin", expected_sha256="0" * 64)
        receipt = store.capture_git(self.snapshot(), "a.bin")
        target = Path(receipt["hostPath"])
        target.chmod(0o600)
        target.write_bytes(b"bad")
        with self.assertRaisesRegex(ValueError, "not authentic"):
            store.capture_git(self.snapshot(), "a.bin")

    def test_git_file_and_directory_aliases_are_bound_not_read_from_host(self):
        self.blob("actual/a.bin", b"correct\x00")
        self.blob("dir-link", b"actual", "120000")
        self.blob("file-link", b"actual/a.bin", "120000")
        for path in ("dir-link/a.bin", "file-link"):
            receipt = PrivateBlobCapture(self.root / path.replace("/", "_"), 1000, 0).capture_git(self.snapshot(), path)
            self.assertEqual(receipt["resolvedGitPath"], "actual/a.bin")
            self.assertEqual(len(receipt["gitAliases"]), 1)
            self.assertEqual(Path(receipt["hostPath"]).read_bytes(), b"correct\x00")
        self.blob("external", b"../../outside", "120000")
        self.blob("cycle", b"cycle", "120000")
        for path, pattern in [("external", "External"), ("cycle", "Cyclic")]:
            with self.assertRaisesRegex(ValueError, pattern):
                snapshot_blob(self.snapshot(), path)

    def modules(self):
        source = self.repo / "modules"
        (source / ".bin").mkdir(parents=True)
        (source / "package").mkdir()
        (source / "package/tool.js").write_text("#!/usr/bin/env node\nconsole.log(1)\n")
        (source / "package/tool.js").chmod(0o755)
        (source / ".bin/tool").symlink_to("../package/tool.js")
        self.blob("app/package-lock.json", b'{"lockfileVersion":3}\n')
        return source

    def test_dependency_tree_copied_once_with_separate_pin_and_git_lock(self):
        source = self.modules()
        rows = dependency_inventory(source)
        receipt = capture_dependencies(self.snapshot(), source, self.root / "private/modules", inventory_digest(rows), 1000, 0)
        private = Path(receipt["root"])
        self.assertEqual(dependency_inventory(private), rows)
        self.assertEqual((private / ".bin/tool").read_text(), (source / "package/tool.js").read_text())
        self.assertFalse(receipt["installedBytesClaimedAsGitContents"])
        self.assertEqual(receipt["gitLockBinding"]["gitObjectId"], self.entries["app/package-lock.json"][1])
        self.assertNotEqual((private / "package/tool.js").stat().st_ino, (source / "package/tool.js").stat().st_ino)
        (source / "package/tool.js").write_text("changed")
        self.assertIn("console.log(1)", (private / ".bin/tool").read_text())
        freeze_capture(self.root / "private")
        with self.assertRaisesRegex(ValueError, "already frozen"):
            PrivateBlobCapture(self.root / "private", 1000, 0)

    def test_dependency_wrong_pin_external_links_and_special_inputs_reject(self):
        source = self.modules()
        with self.assertRaisesRegex(ValueError, "dependency-tree pin"):
            capture_dependencies(self.snapshot(), source, self.root / "wrong", "0" * 64, 1000, 0)
        (source / "escape").symlink_to("../../outside")
        with self.assertRaisesRegex(ValueError, "escapes"):
            dependency_inventory(source)
        (source / "escape").unlink()
        os.mkfifo(source / "pipe")
        with self.assertRaisesRegex(ValueError, "Special"):
            dependency_inventory(source)

    def test_capture_budget_and_symlink_store_fail_closed(self):
        self.blob("a.bin", b"too large")
        store = PrivateBlobCapture(self.root / "capture", 2, 0)
        with self.assertRaisesRegex(ValueError, "budget"):
            store.capture_git(self.snapshot(), "a.bin")
        (self.root / "bad").mkdir()
        (self.root / "bad/blobs").symlink_to(self.repo, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "cannot be a symlink"):
            PrivateBlobCapture(self.root / "bad", 1000, 0)

    def test_host_hardlink_cannot_be_reused_as_private_capture(self):
        raw = b"authentic\x00"
        self.blob("a.bin", raw)
        host = self.repo / "a.bin"
        host.write_bytes(raw)
        store = PrivateBlobCapture(self.root / "capture", 1000, 0)
        target = store.root / "blobs" / hashlib.sha256(raw).hexdigest()
        os.link(host, target)
        with self.assertRaisesRegex(ValueError, "hardlinks outside"):
            store.capture_git(self.snapshot(), "a.bin")

    def test_dependency_mutation_during_copy_rejects(self):
        source = self.modules()
        expected = inventory_digest(dependency_inventory(source))
        opener = capture_module.open_regular_at
        calls = 0
        def changed(root, path):
            nonlocal calls
            calls += 1
            if calls == 2:
                (source / "package/tool.js").write_text("mutated between inventory and copy")
            return opener(root, path)
        with patch.object(capture_module, "open_regular_at", side_effect=changed):
            with self.assertRaisesRegex(ValueError, "changed while being captured"):
                capture_dependencies(self.snapshot(), source, self.root / "private-modules", expected, 1000, 0)


if __name__ == "__main__":
    unittest.main()
