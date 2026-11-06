#!/usr/bin/env python3
"""Focused isolation tests; no repository or learner data is modified."""
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from types import SimpleNamespace

spec = importlib.util.spec_from_file_location("prepare", Path(__file__).with_name("prepare_identity_qa_candidate.py"))
prepare = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare)


class IsolationTests(unittest.TestCase):
    def test_git_directory_alias_is_preserved_and_external_alias_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory) / "repo"
            subprocess.run(["git", "init", "--quiet", str(repo)], check=True)
            def blob(value):
                return subprocess.check_output(["git", "-C", str(repo), "hash-object", "-w", "--stdin"], input=value.encode()).decode().strip()
            snapshot = SimpleNamespace(root=repo, entries={"cases/alias": ("120000", blob("real")),
                "cases/real/review-bundle-manifest.json": ("100644", blob("authentic"))})
            actual, links = prepare.resolve_snapshot_read(snapshot, "cases/alias/review-bundle-manifest.json")
            self.assertEqual(actual, "cases/real/review-bundle-manifest.json")
            roots = [Path(directory) / name for name in ("original", "candidate")]
            for root in roots:
                (root / "cases/real").mkdir(parents=True)
                (root / actual).write_text("authentic")
            prepare.materialize_directory_links(roots, links)
            for root in roots:
                self.assertTrue((root / "cases/alias").is_symlink())
                self.assertEqual((root / "cases/alias/review-bundle-manifest.json").read_text(), "authentic")
            snapshot.entries["cases/alias"] = ("120000", blob("../../outside"))
            with self.assertRaisesRegex(RuntimeError, "External"):
                prepare.resolve_snapshot_read(snapshot, "cases/alias/review-bundle-manifest.json")

    def test_inventory_ignores_failed_reads_and_dependency_tree(self):
        with tempfile.TemporaryDirectory() as directory:
            trace = Path(directory) / "reads"
            trace.write_text('1 openat(AT_FDCWD, "/repo/curricula/good.json", O_RDONLY) = 3\n'
                             '1 openat(AT_FDCWD, "/repo/curricula/missing.json", O_RDONLY) = -1 ENOENT\n'
                             '1 openat(AT_FDCWD, "/repo/app/node_modules/pkg/a.js", O_RDONLY) = 4\n')
            self.assertEqual(prepare.read_inventory(trace, Path("/repo")), {"curricula/good.json"})

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_launcher_keeps_sources_read_only_and_detaches_outputs(self):
        with tempfile.TemporaryDirectory(prefix="skillpilot-isolation-test-", dir="/dev/shm") as directory:
            base = Path(directory)
            original, candidate, run = (base / name for name in ("original", "candidate", "run"))
            for root in (original, candidate):
                (root / "app/node_modules").mkdir(parents=True)
                (root / "source.txt").write_text("original-input")
                (root / "report.txt").write_text("private-output-placeholder")
                (root / "asset.bin").touch()
                (root / "asset2.bin").touch()
            modules = base / "modules"
            modules.mkdir()
            asset = base / "host-asset.bin"
            asset.write_bytes(b"asset-input\x00")
            for name in ("tmp", "home", "npm-cache", "original/outputs"):
                (run / name).mkdir(parents=True)
            (run / "original/outputs/report.txt").write_text("old-report")
            receipt = {"originalRoot": str(original), "candidateRoot": str(candidate), "nodeModules": str(modules),
                       "binaryReadOnlyMounts": [{"path": name, "hostPath": str(asset), "sha256": hashlib.sha256(asset.read_bytes()).hexdigest()} for name in ("asset.bin", "asset2.bin")],
                       "detachedOutputPaths": ["report.txt"]}
            (base / "preparation.json").write_text(json.dumps(receipt))
            launcher = base / "run-isolated.py"
            launcher.write_text(prepare.LAUNCHER.replace("mountsPerLayer=1200", "mountsPerLayer=1"))
            code = 'import pathlib,errno;root=pathlib.Path.cwd().parent\nassert all((root/name).read_bytes()==b"asset-input\\x00" for name in ["asset.bin","asset2.bin"])\nfor p in [root/"source.txt",root/"asset.bin",root/"asset2.bin"]:\n try:p.write_text("bad");raise AssertionError("source writable")\n except OSError as e:assert e.errno==errno.EROFS\n(root/"report.txt").write_text("new-report")\n'
            result = subprocess.run(["python3", str(launcher), "--allow-generated-outputs", "original", "--", "python3", "-c", code], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual((original / "source.txt").read_text(), "original-input")
            self.assertEqual(asset.read_bytes(), b"asset-input\x00")
            self.assertEqual((original / "report.txt").read_text(), "private-output-placeholder")
            self.assertEqual((run / "original/outputs/report.txt").read_text(), "new-report")
            asset.write_bytes(b"changed")
            rejected = subprocess.run(["python3", str(launcher), "original", "--", "true"], capture_output=True, text=True)
            self.assertNotEqual(rejected.returncode, 0)
            self.assertIn("Read-only host asset changed", rejected.stderr)

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_grouped_assets_preserve_each_root_and_never_write_host_links(self):
        with tempfile.TemporaryDirectory(prefix="skillpilot-asset-forest-test-", dir="/dev/shm") as directory:
            base = Path(directory)
            repo, original, candidate, run = (base / name for name in ("host", "original", "candidate", "run"))
            (repo / "tmp").mkdir(parents=True)
            asset = repo / "host.bin"
            asset.write_bytes(b"immutable-host\x00")
            before_mode = asset.stat().st_mode
            prefix = "curricula/DE/Gymnasium/visualizations"
            binary_path, text_path = prefix + "/asset.bin", prefix + "/metadata.json"
            for label, root in (("original", original), ("candidate", candidate)):
                (root / prefix).mkdir(parents=True)
                (root / "app/public/assets/goal-visualizations").mkdir(parents=True)
                (root / "app/node_modules").mkdir(parents=True)
                (root / binary_path).touch()
                (root / text_path).write_text(label)
            for name in ("tmp", "home", "npm-cache"):
                (run / name).mkdir(parents=True)
            modules = base / "modules"
            modules.mkdir()
            binaries = [{"path": binary_path, "hostPath": str(asset), "sha256": hashlib.sha256(asset.read_bytes()).hexdigest()}]
            copied = [{"path": binary_path}, {"path": text_path}]
            _, mounts = prepare.asset_forests(repo, base, original, candidate, copied, binaries, None)
            receipt = {"originalRoot": str(original), "candidateRoot": str(candidate), "nodeModules": str(modules),
                       "binaryReadOnlyMounts": binaries, "directoryReadOnlyMounts": mounts, "detachedOutputPaths": []}
            (base / "preparation.json").write_text(json.dumps(receipt))
            launcher = base / "run-isolated.py"
            launcher.write_text(prepare.LAUNCHER)
            for label in ("original", "candidate"):
                code = ('import pathlib,errno;root=pathlib.Path.cwd().parent;prefix=root/' + repr(prefix)
                        + ';assert (prefix/"metadata.json").read_text()==' + repr(label)
                        + ';assert (prefix/"asset.bin").read_bytes()==b"immutable-host\\x00"\n'
                        + 'for path in [prefix/"metadata.json",prefix/"asset.bin"]:\n'
                        + ' try:path.write_bytes(b"bad");raise AssertionError("writable input")\n'
                        + ' except OSError as e:assert e.errno==errno.EROFS\n')
                result = subprocess.run(["python3", str(launcher), label, "--", "python3", "-c", code], capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(asset.read_bytes(), b"immutable-host\x00")
            self.assertEqual(asset.stat().st_mode, before_mode)
            self.assertEqual((original / text_path).read_text(), "original")
            self.assertEqual((candidate / text_path).read_text(), "candidate")


if __name__ == "__main__":
    unittest.main()
