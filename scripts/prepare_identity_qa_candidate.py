#!/usr/bin/env python3
"""Prepare isolated, proof-bound development QA roots; never apply a migration.

Only a private index is written. All source bytes come from the declared Git
snapshot or from hash-identical working-tree files. Binary inputs are explicit
read-only bwrap mounts, not writable links to repository assets.
"""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import posixpath
import re
import shutil
import subprocess
import sys
import tempfile


# Frozen v1 kernel reads this only for the v1 header discarded by Source-A.
# This is a supplemental tooling input, not another Source-A artifact pin.
SUPPLEMENTAL_KERNEL_INPUTS = {
    "contracts/canonical-goal-identity/v1/migration.schema.json":
        "e8b048980af263329378128d3e2e38a8245b00e43a36c18061c8407da648e15a",
}


def load_kernel(repo):
    spec = importlib.util.spec_from_file_location("identity_kernel", repo / "scripts/canonical_goal_identity_migration.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def read_inventory(path, repo):
    """Extract successful repository file reads from a controlled strace log."""
    found = set()
    for line in path.read_text().splitlines():
        if re.search(r"= -1\b", line):
            continue
        for quoted in re.findall(r'"((?:[^"\\]|\\.)*)"', line):
            try:
                value = json.loads('"' + quoted + '"')
            except ValueError:
                continue
            if value.startswith(str(repo) + "/"):
                value = value[len(str(repo)) + 1:]
                if not value.startswith(("app/node_modules/", ".git/", "tmp/")):
                    found.add(value)
    return found


def resolve_snapshot_read(snapshot, path):
    """Resolve Git directory links without consulting mutable worktree topology."""
    links, seen = [], set()
    while True:
        if path in seen:
            raise RuntimeError("Cyclic Git input alias: " + path)
        seen.add(path)
        parts = path.split("/")
        changed = False
        for length in range(1, len(parts) + 1):
            prefix = "/".join(parts[:length])
            entry = snapshot.entries.get(prefix)
            if not entry or entry[0] != "120000":
                continue
            target_raw = subprocess.check_output(["git", "-C", str(snapshot.root), "cat-file", "blob", entry[1]])
            target = target_raw.decode("utf-8")
            resolved = posixpath.normpath(posixpath.join(posixpath.dirname(prefix), target))
            if target.startswith("/") or resolved == ".." or resolved.startswith("../"):
                raise RuntimeError("External Git directory alias is not a candidate input: " + prefix)
            if length == len(parts) and not any(entry.startswith(resolved + "/") for entry in snapshot.entries):
                # File symlinks retain the existing exact-byte copy behavior.
                continue
            links.append({"path": prefix, "target": target, "gitObjectId": entry[1]})
            path = posixpath.join(resolved, *parts[length:])
            changed = True
            break
        if not changed:
            return path, links


def materialize_directory_links(roots, links):
    for root in roots:
        for item in sorted(links, key=lambda value: len(Path(value["path"]).parts)):
            target = root / item["path"]
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.is_symlink():
                if os.readlink(target) != item["target"]:
                    raise RuntimeError("Existing directory alias differs: " + str(target))
                continue
            if target.exists():
                # Never discard files or replace a populated private directory.
                target.rmdir()
            target.symlink_to(item["target"], target_is_directory=True)


def asset_forests(repo, base, original, candidate, copied, binaries, previous):
    """Group explicitly inventoried assets into four read-only directory mounts.

    Hard links never receive chmod/write operations. Private text asset bytes
    remain on tmpfs; only their directory entries are referenced by symlinks.
    No code or QA-review directory is overlaid.
    """
    prefixes = ("app/public/assets/goal-visualizations", "curricula/DE/Gymnasium/visualizations")
    needed_directories = {str(Path(item["path"]).parent) for item in copied
                          if any(item["path"].startswith(prefix + "/") for prefix in prefixes)}
    if not previous or not previous.get("assetForestRoot"):
        require_free = 200_000_000 + 8192 * len(needed_directories)
        if shutil.disk_usage(repo / "tmp").free < require_free:
            raise RuntimeError("Insufficient disk reserve for the bounded asset-link forest")
    forest = Path(previous["assetForestRoot"]) if previous and previous.get("assetForestRoot") else Path(tempfile.mkdtemp(prefix="identity-qa-assets-", dir=repo / "tmp"))
    binary_by_path = {item["path"]: item for item in binaries}
    directories = []
    for role, root in (("original", original), ("candidate", candidate)):
        for prefix in prefixes:
            destination = forest / role / prefix
            destination.mkdir(parents=True, exist_ok=True)
            count = 0
            for item in copied:
                path = item["path"]
                if not path.startswith(prefix + "/"):
                    continue
                target = forest / role / path
                target.parent.mkdir(parents=True, exist_ok=True)
                if path in binary_by_path:
                    source = Path(binary_by_path[path]["hostPath"])
                    if target.exists():
                        if target.stat().st_ino == source.stat().st_ino and target.stat().st_dev == source.stat().st_dev:
                            count += 1
                            continue
                        target.unlink()
                    os.link(source, target)
                else:
                    store = base / "asset-text" / role / path
                    store.parent.mkdir(parents=True, exist_ok=True)
                    if store.exists():
                        store.unlink()
                    os.link(root / path, store)
                    if target.is_symlink() or target.exists():
                        target.unlink()
                    target.symlink_to(store)
                count += 1
            directories.append({"rootRole": role, "path": prefix, "hostPath": str(destination), "selectedFiles": count})
    return str(forest), directories


def prepare(args):
    repo = args.repo_root.resolve()
    k = load_kernel(repo)
    raw = args.manifest.read_bytes()
    k.require(k.digest(raw) == args.accepted_manifest_sha256, "External manifest pin differs")
    proof = k.parse_json(raw)
    k.require(proof["baseCommit"] == args.expected_base_commit, "External source base differs")
    pins = {proof[key]["path"]: proof[key]["sha256"] for key in (
        "registry", "registrySchemaBinding", "schemaBinding", "canonicalJsonProfile", "verifier", "identityKernelBinding")}
    pins.update(SUPPLEMENTAL_KERNEL_INPUTS)
    for path, expected in pins.items():
        k.require(k.digest((repo / path).read_bytes()) == expected, "Contract/tool pin differs: " + path)
    schema = k.parse_json((repo / proof["schemaBinding"]["path"]).read_bytes())
    k.validate_closed_schema(proof, schema)
    snapshot = k.GitSnapshot(repo, args.expected_base_commit)
    base = args.output.resolve()
    previous = None
    if base.exists():
        k.require(args.extend, "Output must be a new private directory, or use --extend before running QA")
        previous = json.loads((base / "preparation.json").read_text())
        k.require(previous["sourceBase"] == args.expected_base_commit and previous["sourceProofRawSha256"] == args.accepted_manifest_sha256,
                  "Existing isolated root belongs to another source proof")
    base.mkdir(parents=True, exist_ok=bool(previous))
    original, candidate, run = (base / name for name in ("original80", "projectedA80", "run"))
    for root in (original, candidate, run):
        root.mkdir(exist_ok=bool(previous))
    bound = {item["path"]: item["sha256"] for item in proof["catalog"]["sourceFiles"]}
    for item in proof["documents"]:
        path, expected = item["path"], item["sourceSha256"]
        k.require(path not in bound or bound[path] == expected, "Inconsistent source binding")
        bound[path] = expected
    output_paths = json.loads(args.output_paths.read_text())["reportPaths"] if args.output_paths else []
    output_paths += ["docs/qa-ci/status/curriculum-quality-status.json", "docs/qa-ci/status/curriculum-quality-status.md", "docs/qa-ci/status/goal-source-rationale-coverage.json", "docs/qa-ci/status/goal-source-rationale-coverage.md"]
    k.require(not set(output_paths).intersection(bound), "A source cannot become a writable output")
    selected = set(bound)
    # Small explicit tooling/data closure; historical quality evidence comes
    # only from the bound inventory and successful runtime read inventory.
    for path in snapshot.entries:
        if Path(path).name in (".gitignore", ".gitattributes"):
            selected.add(path)
        if path.startswith("app/scripts/") and path.endswith((".ts", ".mts", ".js", ".mjs", ".json")):
            selected.add(path)
        if path.startswith("app/src/") and path.endswith((".ts", ".tsx", ".json")):
            selected.add(path)
        if path.startswith("app/public/data/") and path.endswith(".json"):
            selected.add(path)
        if path.startswith("contracts/") and path.endswith((".json", ".md")):
            selected.add(path)
        if path.startswith("curricula/") and "/quality/" not in path and path.endswith((".json", ".jsonl", ".csv", ".txt")):
            selected.add(path)
        if path.startswith("curricula/DE/Gymnasium/quality/release-model/") and path.endswith(".semantic-kinds.json"):
            selected.add(path)
    selected.update(path for path in ("app/package.json", "app/package-lock.json", "app/tsconfig.json", "app/tsconfig.node.json", "docs/qa-ci/applicability-accepted-warnings.json") if path in snapshot.entries)
    if args.output_paths:
        for entry in json.loads(args.output_paths.read_text())["configs"]:
            path = entry["configPath"]
            k.require(path in snapshot.entries, "Active review config is absent at pinned base: " + path)
            selected.add(path)
            config = k.parse_json(snapshot.read(path))
            for _, value, is_key in k.string_fields(config):
                if not is_key and value in snapshot.entries:
                    selected.add(value)
            review_path = config.get("reviewPath", "")
            default_cards = review_path.replace(".review.jsonl", ".cards.review.jsonl")
            if default_cards in snapshot.entries:
                selected.add(default_cards)
    directory_links = {item["path"]: item for item in previous.get("directorySymlinks", [])} if previous else {}
    for trace in args.read_trace:
        for path in read_inventory(trace, repo):
            actual_path, links = resolve_snapshot_read(snapshot, path)
            directory_links.update({item["path"]: item for item in links})
            if actual_path in snapshot.entries:
                selected.add(actual_path)
    selected.update(pins)
    # A report named by a review config is an output, never another input.
    selected.difference_update(output_paths)
    copied = previous["selectedFiles"] if previous else []
    binaries = previous["binaryReadOnlyMounts"] if previous else []
    git_fallbacks = previous["gitBlobFallbackPaths"] if previous else []
    total = previous["privateBytes"] if previous else 0
    selected.difference_update(item["path"] for item in copied)
    try:
        for index, path in enumerate(sorted(selected)):
            if index % 1000 == 0:
                print(json.dumps({"copyProgress": index, "selected": len(selected)}), flush=True)
            k.require(not path.startswith("/") and ".." not in Path(path).parts, "Unsafe path")
            source = repo / path
            try:
                current = source.read_bytes()
            except (OSError, ValueError):
                current = None
            # A-bound SHA256 or the exact pinned Git blob object proves equality
            # without decompressing a second multi-megabyte asset copy.
            mode, oid = snapshot.entries.get(path, (None, None))
            current_bound = current is not None and path in bound and k.digest(current) == bound[path]
            current_git = (current is not None and mode in ("100644", "100755")
                           and hashlib.sha1(b"blob " + str(len(current)).encode() + b"\0" + current).hexdigest() == oid)
            if path in pins:
                data = current
                k.require(data is not None and k.digest(data) == pins[path], "Pinned tool changed during preparation")
            elif current_bound or current_git:
                data = current
            else:
                # Git blob selection is authoritative even during live edits.
                data = snapshot.read(path)
                git_fallbacks.append(path)
            expected = k.digest(data)
            k.require(path not in bound or expected == bound[path], "Git source differs from A: " + path)
            dest = original / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            projected = candidate / path
            projected.parent.mkdir(parents=True, exist_ok=True)
            try:
                data.decode("utf-8")
                text = b"\0" not in data
            except UnicodeDecodeError:
                text = False
            if not text and current is not None and k.digest(current) == expected:
                # Mount targets contain no claimed asset bytes outside bwrap.
                dest.touch()
                projected.touch()
                binaries.append({"path": path, "hostPath": str(source), "sha256": expected, "bytes": len(data)})
            else:
                total += len(data)
                k.require(total < args.max_private_bytes, "Private byte budget exceeded")
                if dest.exists():
                    k.require(args.extend and k.digest(dest.read_bytes()) == expected, "Unexpected preexisting original input: " + path)
                else:
                    dest.write_bytes(data)
                k.require(k.digest(dest.read_bytes()) == expected, "Private original copy differs")
                if projected.exists():
                    k.require(args.extend and k.digest(projected.read_bytes()) == expected, "Unexpected preexisting candidate input: " + path)
                else:
                    os.link(dest, projected)
                k.require(k.digest(projected.read_bytes()) == expected, "Private candidate copy differs")
            source_kind = "supplemental-kernel-header" if path in SUPPLEMENTAL_KERNEL_INPUTS else "pinned-contract" if path in pins else "git-snapshot"
            copied.append({"path": path, "sha256": expected, "bytes": len(data), "source": source_kind,
                           "binaryReadOnlyMount": not text and current is not None and k.digest(current) == expected})
        materialize_directory_links((original, candidate), directory_links.values())
        changed = []
        for document in proof["documents"]:
            if document["handling"] == "preserve-exact-bytes":
                continue
            path = document["path"]
            before = k.parse_json((original / path).read_bytes())
            after = k.parse_json((original / path).read_bytes())
            for field in document["fields"]:
                k.set_field(after, field)
            data = k.stable(after)
            k.require(k.digest(data) == document["hypotheticalCanonicalSha256"], "Projection digest differs")
            k.inverse_proof(before, after, document["fields"])
            if document["fields"]:
                target = candidate / path
                target.unlink()
                target.write_bytes(data)
                k.require(k.digest(target.read_bytes()) == document["hypotheticalCanonicalSha256"], "Projected copy differs")
                k.require(target.stat().st_ino != (original / path).stat().st_ino, "Projection shares original inode")
                changed.append(path)
        # No shared index, hooks, config or worktree administration.
        object_dir = subprocess.check_output(["git", "rev-parse", "--git-path", "objects"], cwd=repo, text=True).strip()
        object_dir = str((repo / object_dir).resolve())
        git_environment = {key: value for key, value in os.environ.items()
                           if key not in ("GIT_INDEX_FILE", "GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR")}
        for root in (original, candidate):
            subprocess.run(["git", "init", "--quiet", str(root)], check=True, env=git_environment)
            alternate = root / ".git/objects/info/alternates"
            alternate.write_text(object_dir + "\n")
            subprocess.run(["git", "-C", str(root), "read-tree", args.expected_base_commit], check=True, env=git_environment)
            (root / "app/node_modules").mkdir(exist_ok=True)
        (base / "source-a.json").write_bytes(raw)
        k.require(k.digest((base / "source-a.json").read_bytes()) == args.accepted_manifest_sha256, "Copied A differs")
        for name, root in (("original", original), ("candidate", candidate)):
            for path in output_paths:
                slot = run / name / "outputs" / path
                slot.parent.mkdir(parents=True, exist_ok=True)
                if not slot.exists():
                    slot.write_bytes((root / path).read_bytes() if (root / path).is_file() else b"")
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                if target.exists():
                    target.unlink()
                target.touch()
        for name in ("tmp", "home", "npm-cache"):
            (run / name).mkdir(exist_ok=bool(previous))
        forest_root, directory_mounts = asset_forests(repo, base, original, candidate, copied, binaries, previous)
        receipt = {"schemaVersion": 1, "purpose": "isolated-development-qa-only", "runtimeActivationAllowed": False, "qaValidityClaimed": False,
                   "sourceBase": args.expected_base_commit, "sourceProofRawSha256": args.accepted_manifest_sha256,
                   "hostRepo": str(repo), "originalRoot": str(original), "candidateRoot": str(candidate), "nodeModules": str(repo / "app/node_modules"),
                   "privateBytes": total, "selectedFiles": copied, "projectedDocuments": changed, "gitBlobFallbackPaths": git_fallbacks,
                   "supplementalKernelHeaderInputs": SUPPLEMENTAL_KERNEL_INPUTS,
                   "binaryReadOnlyMounts": binaries, "assetForestRoot": forest_root, "directoryReadOnlyMounts": directory_mounts,
                   "directorySymlinks": sorted(directory_links.values(), key=lambda item: item["path"]),
                   "detachedOutputPaths": sorted(set(output_paths))}
        (base / "preparation.json").write_text(json.dumps(receipt, indent=2) + "\n")
        k.require(k.digest((base / "source-a.json").read_bytes()) == args.accepted_manifest_sha256, "A changed during preparation")
        launcher = base / "run-isolated.py"
        launcher.write_text(LAUNCHER)
        launcher.chmod(0o755)
        print(json.dumps({"preparedRoot": str(base), "files": len(copied), "privateBytes": total, "projectedDocuments": len(changed), "binaryMounts": len(binaries), "gitBlobFallbacks": len(git_fallbacks)}), flush=True)
    finally:
        snapshot.close()


LAUNCHER = '''#!/usr/bin/env python3
import argparse,hashlib,json,pathlib,subprocess,sys,tempfile
p=argparse.ArgumentParser();p.add_argument("root",choices=["original","candidate"]);p.add_argument("--allow-generated-outputs",action="store_true");p.add_argument("command",nargs=argparse.REMAINDER);a=p.parse_args()
b=pathlib.Path(__file__).resolve().parent;r=json.loads((b/"preparation.json").read_text());run=b/"run";root=pathlib.Path(r["originalRoot" if a.root=="original" else "candidateRoot"])
command=a.command[1:] if a.command[:1]==["--"] else a.command
if not command:raise SystemExit("A command is required after --")
for item in r["binaryReadOnlyMounts"]:
 if hashlib.sha256(pathlib.Path(item["hostPath"]).read_bytes()).hexdigest()!=item["sha256"]:raise SystemExit("Read-only host asset changed: "+item["hostPath"])
common=["--die-with-parent","--new-session","--unshare-net","--ro-bind","/","/","--proc","/proc","--dev","/dev","--ro-bind",str(b),str(b),"--bind",str(run),str(run),"--bind",str(run/"tmp"),"/tmp"]
for destination in (r["originalRoot"],r["candidateRoot"]):common += ["--ro-bind",r["nodeModules"],str(pathlib.Path(destination)/"app/node_modules")]
if a.allow_generated_outputs:
 for path in r["detachedOutputPaths"]:common += ["--bind",str(run/a.root/"outputs"/path),str(root/path)]
common += ["--setenv","HOME",str(run/"home"),"--setenv","TMPDIR","/tmp","--setenv","npm_config_cache",str(run/"npm-cache"),"--chdir",str(root/"app")]
# Grouped mounts contain only explicitly inventoried immutable assets and
# private text-asset links. They avoid bwrap's 9000-option ceiling.
covered=[]
for item in r.get("directoryReadOnlyMounts",[]):
 destination=pathlib.Path(r["originalRoot" if item["rootRole"]=="original" else "candidateRoot"])/item["path"]
 common += ["--ro-bind",item["hostPath"],str(destination)]
 covered.append(item["path"]+"/")
for item in r["binaryReadOnlyMounts"]:
 if any(item["path"].startswith(prefix) for prefix in covered):continue
 for destination in (r["originalRoot"],r["candidateRoot"]):common += ["--ro-bind",item["hostPath"],str(pathlib.Path(destination)/item["path"])]
if len(common)+len(command)>8500:raise SystemExit("Ungrouped asset mount inventory exceeds bwrap's argument limit")
with tempfile.TemporaryFile(dir=run/"tmp") as arguments:
 arguments.write(b"\\0".join(value.encode() for value in common)+b"\\0");arguments.seek(0)
 result=subprocess.run(["bwrap","--args",str(arguments.fileno()),"--"]+command,pass_fds=(arguments.fileno(),))
for item in r["binaryReadOnlyMounts"]:
 if hashlib.sha256(pathlib.Path(item["hostPath"]).read_bytes()).hexdigest()!=item["sha256"]:raise SystemExit("Host asset changed during QA")
raise SystemExit(result.returncode)
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--expected-base-commit", required=True)
    parser.add_argument("--accepted-manifest-sha256", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--read-trace", type=Path, action="append", default=[])
    parser.add_argument("--output-paths", type=Path)
    parser.add_argument("--max-private-bytes", type=int, default=12_000_000_000)
    parser.add_argument("--extend", action="store_true", help="Add reads from a completed trace before running QA; requires the same externally pinned proof")
    prepare(parser.parse_args())


if __name__ == "__main__":
    main()
