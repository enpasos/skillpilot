#!/usr/bin/env python3
"""Focused isolation tests; no repository or learner data is modified."""
import hashlib
import fcntl
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
import copy
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

    def materialized_pair(self, directory, output_paths=None, directory_aliases=False):
        top = Path(directory)
        repo, base = top / "host", top / "pair"
        subprocess.run(["git", "init", "-q", str(repo)], check=True)
        files = {
            "app/package-lock.json": b'{"lockfileVersion":3}\n',
            "app/package.json": b'{"name":"capture-fixture"}\n',
            "app/public/assets/goal-visualizations/a.bin": b"binary\x00asset",
            "not-selected/original.bin": b"index-only\x00",
            "app/scripts/fixture.js": b"authentic-tool\n",
        }
        graph_path = "curricula/DE/Gymnasium/canonical/fixture.json"
        graph = {"landscapeId": "fixture-owner", "goals": [{"id": "old-id", "title": "Original", "requires": [], "contains": []}]}
        files[graph_path] = json.dumps(graph).encode()
        if directory_aliases:
            files.update({"cases/real/review-input.json": b'{"review":"authentic"}\n',
                          "cases/other/review-input.json": b'{"review":"different"}\n'})
        for path, raw in files.items():
            target = repo / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(raw)
        if directory_aliases:
            (repo / "cases/alias").symlink_to("real", target_is_directory=True)
            (repo / "cases/chain").symlink_to("alias", target_is_directory=True)
        (repo / "app/node_modules/pkg").mkdir(parents=True)
        (repo / "app/node_modules/pkg/tool.js").write_text("installed fixture")
        subprocess.run(["git", "-C", str(repo), "add", *files,
                        *(["cases/alias", "cases/chain"] if directory_aliases else [])], check=True)
        subprocess.run(["git", "-C", str(repo), "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-qm", "Fixture"], check=True)
        commit = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
        kernel = prepare.load_kernel(Path(__file__).resolve().parents[1])
        after = copy.deepcopy(graph)
        after["goals"][0]["id"] = "00000000-0000-4000-8000-000000000001"
        asset_path = "app/public/assets/goal-visualizations/a.bin"
        proof = {"catalog": {"sourceFiles": [{"path": graph_path, "sha256": kernel.digest(files[graph_path])}]}, "documents": [
            {"path": graph_path, "handling": "project-typed-fields", "sourceSha256": kernel.digest(files[graph_path]),
             "hypotheticalCanonicalSha256": kernel.digest(kernel.stable(after)), "fields": [{"pointer": "/goals/0/id", "kind": "value", "before": "old-id", "after": after["goals"][0]["id"]}]},
            {"path": asset_path, "handling": "preserve-exact-bytes", "sourceSha256": kernel.digest(files[asset_path])},
        ]}
        raw = json.dumps(proof).encode()
        args = SimpleNamespace(expected_base_commit=commit, accepted_manifest_sha256=kernel.digest(raw), extend=False,
                               max_private_bytes=10000, max_binary_bytes=10000, max_dependency_bytes=10000, reserve_bytes=0,
                               accepted_dependency_tree_sha256=prepare.inventory_digest(prepare.dependency_inventory(repo / "app/node_modules")),
                               output_paths=output_paths, read_trace=[])
        if directory_aliases:
            trace = top / "read-trace.txt"
            trace.write_text("".join('1 openat(AT_FDCWD, ' + json.dumps(str(repo / path)) + ', O_RDONLY) = 3\n'
                                    for path in ("cases/chain/review-input.json", "cases/other/review-input.json")))
            args.read_trace = [trace]
        base.mkdir()
        snapshot = kernel.GitSnapshot(repo, commit)
        try:
            # Test only the materializer boundary, not a synthetic A authority.
            prepare.materialize(args, repo, kernel, proof, {}, snapshot, base, False, raw)
        finally:
            snapshot.close()
        receipt = json.loads((base / "preparation.json").read_text())
        return repo, base, receipt, graph_path, asset_path, graph, after

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_directory_alias_type_target_and_internal_resolution_rechecked_before_command(self):
        for role in ("original", "candidate"):
            for mutation in ("other", "directory", "outside", "cycle", "missing", "target-alias", "target-outside"):
                with self.subTest(role=role, mutation=mutation), tempfile.TemporaryDirectory(
                        prefix="capture-alias-boundary-", dir="/dev/shm") as directory:
                    _, base, receipt, _, _, _, _ = self.materialized_pair(directory, directory_aliases=True)
                    root = Path(receipt["originalRoot" if role == "original" else "candidateRoot"])
                    alias = root / "cases/alias"
                    pin = hashlib.sha256((base / "preparation.json").read_bytes()).hexdigest()
                    argv = ["python3", str(base / "run-isolated.py"), "--accepted-preparation-sha256", pin, role, "--"]
                    code = 'from pathlib import Path;assert "authentic" in (Path.cwd().parent/"cases/chain/review-input.json").read_text()'
                    accepted = subprocess.run(argv + ["python3", "-c", code], capture_output=True, text=True)
                    self.assertEqual(accepted.returncode, 0, accepted.stderr)
                    if mutation in ("missing", "target-alias", "target-outside"):
                        (root / "cases/real/review-input.json").unlink()
                        (root / "cases/real").rmdir()
                        if mutation != "missing":
                            (root / "cases/real").symlink_to("other" if mutation == "target-alias" else str(Path(directory)),
                                                           target_is_directory=True)
                    else:
                        alias.unlink()
                        if mutation == "directory":
                            alias.mkdir()
                            (alias / "review-input.json").write_bytes((root / "cases/real/review-input.json").read_bytes())
                        else:
                            alias.symlink_to({"other": "other", "outside": str(Path(directory)), "cycle": "chain"}[mutation],
                                             target_is_directory=True)
                    rejected = subprocess.run(argv + ["python3", "-c", "print('UNREACHABLE')"], capture_output=True, text=True)
                    self.assertNotEqual(rejected.returncode, 0, rejected.stdout)
                    self.assertIn("Directory alias", rejected.stderr)
                    self.assertNotIn("UNREACHABLE", rejected.stdout)

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_directory_alias_is_rechecked_after_command_for_both_roots(self):
        for role in ("original", "candidate"):
            with self.subTest(role=role), tempfile.TemporaryDirectory(prefix="capture-alias-post-", dir="/dev/shm") as directory:
                _, base, receipt, _, _, _, _ = self.materialized_pair(directory, directory_aliases=True)
                root = Path(receipt["originalRoot" if role == "original" else "candidateRoot"])
                pin = hashlib.sha256((base / "preparation.json").read_bytes()).hexdigest()
                # The command is read-only; the test mutates its own private input from outside bwrap.
                code = "import time;print('READY',flush=True);time.sleep(0.3)"
                run = subprocess.Popen(["python3", str(base / "run-isolated.py"), "--accepted-preparation-sha256", pin,
                    "original", "--", "python3", "-c", code], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                try:
                    self.assertEqual(run.stdout.readline().strip(), "READY")
                    alias = root / "cases/alias"
                    alias.unlink()
                    alias.symlink_to("other", target_is_directory=True)
                    stdout, stderr = run.communicate(timeout=10)
                    self.assertNotEqual(run.returncode, 0, stdout)
                    self.assertIn("Directory alias", stderr)
                finally:
                    if run.poll() is None:
                        run.kill()
                        run.communicate()

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_small_actual_git_materializer_has_private_assets_dependencies_projection_and_full_index(self):
        with tempfile.TemporaryDirectory(prefix="skillpilot-materializer-test-", dir="/dev/shm") as directory:
            repo, base, receipt, graph_path, asset_path, graph, after = self.materialized_pair(directory)
            self.assertEqual(receipt["captureFormat"], 3)
            self.assertEqual(json.loads((base / "original80" / graph_path).read_text()), graph)
            self.assertEqual(json.loads((base / "projectedA80" / graph_path).read_text()), after)
            self.assertNotEqual((base / "original80" / graph_path).stat().st_ino, (base / "projectedA80" / graph_path).stat().st_ino)
            listed = subprocess.check_output(["git", "-C", str(base / "original80"), "ls-files"], text=True).splitlines()
            self.assertIn("not-selected/original.bin", listed)
            self.assertFalse((base / "original80/not-selected/original.bin").exists())
            (repo / asset_path).write_bytes(b"changed-host")
            pin = hashlib.sha256((base / "preparation.json").read_bytes()).hexdigest()
            code = 'import pathlib;assert (pathlib.Path.cwd().parent/' + repr(asset_path) + ').read_bytes()==b"binary\\x00asset"'
            run = subprocess.run(["python3", str(base / "run-isolated.py"), "--accepted-preparation-sha256", pin,
                                  "candidate", "--", "python3", "-c", code], capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stderr)

    def private_pair(self, directory, grouped=False):
        top = Path(directory)
        repo, base = top / "host", top / "private-pair"
        subprocess.run(["git", "init", "--quiet", str(repo)], check=True)
        (repo / "app/node_modules/pkg").mkdir(parents=True)
        (repo / "app/package-lock.json").write_text('{"lockfileVersion":3}\n')
        (repo / "app/node_modules/pkg/code.js").write_text("installed-code")
        prefix = "curricula/DE/Gymnasium/visualizations/" if grouped else ""
        paths = [prefix + "asset.bin", prefix + "asset2.bin"]
        for path in paths:
            source = repo / path
            source.parent.mkdir(parents=True, exist_ok=True)
            source.write_bytes(b"asset-input\x00")
        subprocess.run(["git", "-C", str(repo), "add", "app/package-lock.json", *paths], check=True)
        subprocess.run(["git", "-C", str(repo), "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
                        "commit", "--quiet", "-m", "Capture fixture"], check=True)
        commit = subprocess.check_output(["git", "-C", str(repo), "rev-parse", "HEAD"], text=True).strip()
        kernel = prepare.load_kernel(Path(__file__).resolve().parents[1])
        snapshot = kernel.GitSnapshot(repo, commit)
        base.mkdir()
        try:
            store = prepare.PrivateBlobCapture(base / "capture", 1000, 0)
            binaries = [store.capture_git(snapshot, path) for path in paths]
            dependency_pin = prepare.inventory_digest(prepare.dependency_inventory(repo / "app/node_modules"))
            dependencies = prepare.capture_dependencies(snapshot, repo / "app/node_modules", base / "capture/node_modules", dependency_pin, 1000, 0)
        finally:
            snapshot.close()
        original, candidate, run = (base / name for name in ("original", "candidate", "run"))
        copied = []
        for root in (original, candidate):
            (root / "app/node_modules").mkdir(parents=True)
            (root / "source.txt").write_text("original-input")
            (root / "report.txt").write_text("private-output-placeholder")
            for path in paths:
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.touch()
        for name in ("tmp", "home", "npm-cache", "original/outputs", "candidate/outputs"):
            (run / name).mkdir(parents=True)
        for role in ("original", "candidate"):
            (run / role / "outputs/report.txt").write_text("old-report")
        tool = base / "capture-verifier.py"
        tool.write_bytes(Path(prepare.__file__).with_name("identity_qa_private_capture.py").read_bytes())
        receipt = {"captureFormat": 3, "hostRepo": str(repo), "gitObjects": str(repo / ".git/objects"),
                   "originalRoot": str(original), "candidateRoot": str(candidate), "nodeModules": dependencies["root"],
                   "dependencyCapture": dependencies, "binaryReadOnlyMounts": binaries, "detachedOutputPaths": ["report.txt"],
                   "captureTool": {"path": str(tool), "sha256": hashlib.sha256(tool.read_bytes()).hexdigest()}}
        if grouped:
            for label, root in (("original", original), ("candidate", candidate)):
                metadata = root / prefix / "metadata.json"
                metadata.write_text(label)
            copied = [{"path": path} for path in paths] + [{"path": prefix + "metadata.json"}]
            _, mounts = prepare.asset_forests(repo, base, original, candidate, copied, binaries, None)
            receipt["directoryReadOnlyMounts"] = mounts
        selected = [{"path": "source.txt", **prepare.file_binding(original / "source.txt"), "binaryReadOnlyMount": False}]
        selected += [{"path": item["path"], "sha256": item["sha256"], "bytes": item["bytes"], "binaryReadOnlyMount": True} for item in binaries]
        projected = []
        if grouped:
            metadata_path = prefix + "metadata.json"
            selected.append({"path": metadata_path, **prepare.file_binding(original / metadata_path), "binaryReadOnlyMount": False})
            projected.append({"path": metadata_path, **prepare.file_binding(candidate / metadata_path)})
        receipt.update({"selectedFiles": selected, "projectedDocuments": [item["path"] for item in projected], "projectedDocumentBindings": projected})
        (base / "preparation.json").write_text(json.dumps(receipt))
        launcher = base / "run-isolated.py"
        launcher.write_text(prepare.LAUNCHER)
        pin = hashlib.sha256((base / "preparation.json").read_bytes()).hexdigest()
        return repo, base, receipt, ["python3", str(launcher), "--accepted-preparation-sha256", pin]

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_private_capture_masks_host_and_keeps_only_outputs_writable(self):
        with tempfile.TemporaryDirectory(prefix="skillpilot-isolation-test-", dir="/dev/shm") as directory:
            repo, base, receipt, argv = self.private_pair(directory)
            (repo / "secret.txt").write_text("host-only")
            (repo / "asset.bin").write_bytes(b"changed-host")
            code = ('import pathlib,errno;root=pathlib.Path.cwd().parent;'
                    'assert all((root/name).read_bytes()==b"asset-input\\x00" for name in ["asset.bin","asset2.bin"]);'
                    'assert not pathlib.Path(' + repr(str(repo / "secret.txt")) + ').exists()\n'
                    'for p in [root/"source.txt",root/"asset.bin",root/"asset2.bin",root/"app/node_modules/pkg/code.js"]:\n'
                    ' try:p.write_text("bad");raise AssertionError("source writable")\n'
                    ' except OSError as e:assert e.errno==errno.EROFS\n'
                    '(root/"report.txt").write_text("new-report")\n')
            result = subprocess.run(argv + ["--allow-generated-outputs", "original", "--", "python3", "-c", code], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual((repo / "asset.bin").read_bytes(), b"changed-host")
            self.assertEqual((base / "original/report.txt").read_text(), "private-output-placeholder")
            self.assertEqual((base / "run/original/outputs/report.txt").read_text(), "new-report")
            capture = Path(receipt["binaryReadOnlyMounts"][0]["hostPath"])
            capture.chmod(0o600)
            capture.write_bytes(b"tampered-private")
            rejected = subprocess.run(argv + ["original", "--", "true"], capture_output=True, text=True)
            self.assertNotEqual(rejected.returncode, 0)
            self.assertIn("Private asset changed", rejected.stderr)

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_grouped_assets_link_private_captures_and_preserve_root_specific_text(self):
        with tempfile.TemporaryDirectory(prefix="skillpilot-forest-test-", dir="/dev/shm") as directory:
            repo, base, receipt, argv = self.private_pair(directory, grouped=True)
            prefix = "curricula/DE/Gymnasium/visualizations"
            (repo / prefix / "asset.bin").write_bytes(b"changed-host")
            for label in ("original", "candidate"):
                code = ('import pathlib;root=pathlib.Path.cwd().parent;prefix=root/' + repr(prefix)
                        + ';assert (prefix/"metadata.json").read_text()==' + repr(label)
                        + ';assert (prefix/"asset.bin").read_bytes()==b"asset-input\\x00"')
                result = subprocess.run(argv + [label, "--", "python3", "-c", code], capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
            mounted = Path(receipt["directoryReadOnlyMounts"][1]["hostPath"]) / "asset.bin"
            self.assertNotEqual(mounted.stat().st_ino, (repo / prefix / "asset.bin").stat().st_ino)

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_external_preparation_pin_dependency_tamper_and_run_lock_reject(self):
        with tempfile.TemporaryDirectory(prefix="skillpilot-boundary-test-", dir="/dev/shm") as directory:
            repo, base, receipt, argv = self.private_pair(directory)
            bad = argv[:]
            bad[-1] = "0" * 64
            self.assertNotEqual(subprocess.run(bad + ["original", "--", "true"], capture_output=True).returncode, 0)
            with (base / ".preparation.lock").open("a+b") as lock:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                blocked = subprocess.run(argv + ["original", "--", "true"], capture_output=True, text=True)
                self.assertNotEqual(blocked.returncode, 0)
            dependency = Path(receipt["nodeModules"]) / "pkg/code.js"
            dependency.chmod(0o600)
            dependency.write_text("changed-private-tool")
            rejected = subprocess.run(argv + ["original", "--", "true"], capture_output=True, text=True)
            self.assertNotEqual(rejected.returncode, 0)
            self.assertIn("Private dependency tree changed", rejected.stderr)

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_selected_tool_and_projected_goal_text_tamper_reject_before_command(self):
        for role in ("original", "candidate"):
            with self.subTest(role=role), tempfile.TemporaryDirectory(prefix="capture-text-repair-", dir="/dev/shm") as directory:
                _, base, _, graph, _, _, _ = self.materialized_pair(directory)
                path = base / ("original80/app/scripts/fixture.js" if role == "original" else "projectedA80/" + graph)
                path.chmod(0o600)
                if role == "original":
                    path.write_text("tampered-tool")
                else:
                    data = json.loads(path.read_text())
                    data["goals"][0]["title"] = "Not Original"
                    path.write_text(json.dumps(data))
                pin = hashlib.sha256((base / "preparation.json").read_bytes()).hexdigest()
                rejected = subprocess.run(["python3", str(base / "run-isolated.py"), "--accepted-preparation-sha256", pin,
                    role, "--", "python3", "-c", "print('UNREACHABLE')"], capture_output=True, text=True)
                self.assertNotEqual(rejected.returncode, 0)
                self.assertIn("Private text input changed: " + role, rejected.stderr)
                self.assertNotIn("UNREACHABLE", rejected.stdout)

    @unittest.skipUnless(shutil.which("bwrap"), "bwrap is required")
    def test_replaced_mounted_asset_rejects_even_when_private_store_is_authentic(self):
        with tempfile.TemporaryDirectory(prefix="capture-forest-repair-", dir="/dev/shm") as directory:
            _, base, receipt, _, asset, _, _ = self.materialized_pair(directory)
            mount = next(item for item in receipt["directoryReadOnlyMounts"]
                         if item["rootRole"] == "original" and item["path"] == "app/public/assets/goal-visualizations")
            mounted = Path(mount["hostPath"]) / "a.bin"
            mounted.unlink()
            mounted.write_bytes(b"wrong\x00overlay")
            store = next(item for item in receipt["binaryReadOnlyMounts"] if item["path"] == asset)
            self.assertEqual(hashlib.sha256(Path(store["hostPath"]).read_bytes()).hexdigest(), store["sha256"])
            pin = hashlib.sha256((base / "preparation.json").read_bytes()).hexdigest()
            rejected = subprocess.run(["python3", str(base / "run-isolated.py"), "--accepted-preparation-sha256", pin,
                "original", "--", "python3", "-c", "print('UNREACHABLE')"], capture_output=True, text=True)
            self.assertNotEqual(rejected.returncode, 0)
            self.assertIn("Mounted asset input changed", rejected.stderr)
            self.assertNotIn("UNREACHABLE", rejected.stdout)

    def test_unsafe_outputs_reject_before_any_outside_or_source_write(self):
        cases = ["absolute", "../../outside-capture-sentinel.txt", "C:\\outside.txt", "docs/../outside.txt", ".git/config",
                 "curricula/DE/Gymnasium/canonical/fixture.json", "app/scripts/fixture.js"]
        for case in cases:
            with self.subTest(case=case), tempfile.TemporaryDirectory(prefix="capture-output-repair-", dir="/dev/shm") as directory:
                sentinel = Path(directory) / "outside-capture-sentinel.txt"
                sentinel.write_text("DO NOT CHANGE")
                path = str(sentinel) if case == "absolute" else case
                config = Path(directory) / "outputs.json"
                config.write_text(json.dumps({"reportPaths": [path], "configs": []}))
                with self.assertRaisesRegex(ValueError, "Unsafe|Reserved|source input|not declared"):
                    self.materialized_pair(directory, output_paths=config)
                self.assertEqual(sentinel.read_text(), "DO NOT CHANGE")
                source = Path(directory) / "host/curricula/DE/Gymnasium/canonical/fixture.json"
                self.assertEqual(json.loads(source.read_text())["goals"][0]["title"], "Original")
                self.assertFalse((Path(directory) / "pair/preparation.json").exists())


if __name__ == "__main__":
    unittest.main()
