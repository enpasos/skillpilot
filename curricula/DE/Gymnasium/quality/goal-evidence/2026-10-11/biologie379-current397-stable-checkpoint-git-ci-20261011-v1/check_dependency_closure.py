"""Read-only Git portability audit of the current, already integrated checkpoint.

This report is technical evidence only. It does not grant curriculum, source,
image, human-review or release approval, and does not change the Git index.
"""
from collections import defaultdict, deque
from bisect import bisect_left
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
assert (ROOT / ".git").exists(), ROOT

def git_paths(*args):
    raw = subprocess.check_output(["git", "ls-files", "-z", *args], cwd=ROOT)
    return {p.decode() for p in raw.split(b"\0") if p}

tracked = git_paths("--cached")
committable = git_paths("--cached", "--others", "--exclude-standard")
changed = set(subprocess.check_output(
    ["git", "diff", "--name-only", "HEAD", "-z"], cwd=ROOT
).decode().split("\0")) - {""}
untracked = committable - tracked
committable_sorted = sorted(committable)
prefixes = ("curricula/", "app/", "docs/", "contracts/", "scripts/", "ai/")
path_pattern = re.compile(
    r"(?<![\w])(?:curricula|app|docs|contracts|scripts|ai)"
    r"(?:/[A-Za-z0-9_.@()+%=\-]+)+"
)

registry_path = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
registry = json.loads((ROOT / registry_path).read_text())
subjects = [s for s in registry["subjects"] if s["subject"] in {"chemie", "biologie"}]
seed_objects = {f"registry.subject:{s['subject']}": s for s in subjects}
seeds = [
    "app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json",
    "app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json",
    "app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json",
    "app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json",
    "app/scripts/config/goal-books/navigation/de-gym-biology-national-atlas.view.json",
    "app/scripts/config/goal-books/navigation/de-gym-chemistry-national-atlas.view.json",
    "curricula/DE/Gymnasium/composition-views/chemie/de-he-gk.view.json",
    "curricula/DE/Gymnasium/composition-views/chemie/de-he-lk.view.json",
]
integration_directory = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-current369-v6-dual-reviewed-active-integration-technical-20261011-v1"
integration_allowlist_path = integration_directory + "/CHECKPOINT.exact-active-and-original-evidence-allowlist.json"
integration_allowlist = json.loads((ROOT / integration_allowlist_path).read_text())
seeds.extend(integration_allowlist["exactUntrackedEvidenceDependencyPaths"])
seeds.extend(record["path"] for record in integration_allowlist["activePaths"] if not record["ignoredByGit"])
seeds.extend(record["path"] for record in integration_allowlist["mandatoryOwnEvidenceFiles"])
seeds.extend(record["path"] for record in integration_allowlist["historicalExactCasDependencyFiles"])
seeds.extend([
    integration_allowlist_path,
    integration_directory + "/FINAL.technical-active-Bio379-checkpoint.freeze.json",
])
seeds.extend(sys.argv[1:])
queue = deque(seeds)
queued = set(seeds)
expanded_dirs = set()
seen = set()
references = defaultdict(list)
missing = defaultdict(list)
json_errors = []
absolute_local_references = []
asset_urls = set()

def visit(value, source, context=""):
    if isinstance(value, dict):
        for key, item in value.items():
            visit(item, source, f"{context}.{key}".strip("."))
    elif isinstance(value, list):
        for i, item in enumerate(value):
            visit(item, source, f"{context}[{i}]")
    elif isinstance(value, str):
        if value.startswith("/assets/goal-visualizations/"):
            asset_urls.add(value)
            matches = ["app/public" + value]
        else:
            # Operative path fields and sealed file tables are exact values.
            # Historical prose routing is not an executable transitive input.
            matches = [value] if value.startswith(prefixes) and not any(c in value for c in "\n\t ;") else []
            field_name = context.rsplit(".", 1)[-1].lower()
            if not matches and (field_name.endswith("path") or field_name in {"artifactdirectory", "reviewrecordsdirectory", "resultsdirectory", "reviewrunsdirectory"}) and not value.startswith(("/", "https:")) and not any(c in value for c in "\n\t ;"):
                # Standalone D indices resolve their dual-summary/resolution
                # paths relative to the directory that owns the index.
                local_relative = (ROOT / source).parent / value
                if local_relative.exists() and local_relative.resolve().is_relative_to(ROOT):
                    matches = [local_relative.resolve().relative_to(ROOT).as_posix()]
            if not matches and source.endswith(("biologie.qa.json", "chemie.qa.json")):
                # Actual independent image-review seals are intentionally kept
                # in the QA notes; retain those explicit JSON provenance links.
                matches = [p.rstrip(".") for p in path_pattern.findall(value) if p.rstrip(".").endswith(".json")]
        if value.startswith(("/home/", "/tmp/")):
            absolute_local_references.append({"source": source, "context": context, "value": value})
        for relative in matches:
            # Colons, explanatory punctuation and remote schema URLs are not
            # accepted as local file bindings.
            relative = relative.rstrip(".")
            path = ROOT / relative
            reference = {"source": source, "context": context}
            if path.is_file() or path.is_symlink():
                references[relative].append(reference)
                if relative not in queued:
                    queue.append(relative)
                    queued.add(relative)
            elif path.is_dir():
                references[relative].append(reference)
                # Normal record/capture directories are executable inputs.
                # Include only committable files, never ignored scratch trees.
                directory_field = context.rsplit(".", 1)[-1].lower()
                needs_directory_contents = any(x in directory_field for x in ["reviewrecords", "recordsdir", "resultsdir", "runsdir"]) or directory_field == "artifactdirectory" or (directory_field == "outputdirectory" and "/source-views/" in relative)
                if needs_directory_contents and relative not in expanded_dirs:
                    expanded_dirs.add(relative)
                    prefix = relative.rstrip("/") + "/"
                    position = bisect_left(committable_sorted, prefix)
                    while position < len(committable_sorted) and committable_sorted[position].startswith(prefix):
                        child = committable_sorted[position]
                        if child not in queued:
                            queue.append(child)
                            queued.add(child)
                        position += 1
            else:
                # Bundle manifests use virtual paths relative to their bundle;
                # inactive compiler outputPath values are destinations, not
                # mandatory input bindings.
                bundle_relative = (ROOT / source).parent / relative
                if context.rsplit(".", 1)[-1].lower() == "outputpath":
                    continue
                if bundle_relative.is_file() and bundle_relative.resolve().is_relative_to(ROOT):
                    resolved_relative = bundle_relative.resolve().relative_to(ROOT).as_posix()
                    references[resolved_relative].append(reference)
                    if resolved_relative not in queued:
                        queue.append(resolved_relative)
                        queued.add(resolved_relative)
                elif source.endswith("review-bundle-manifest.json") and relative.startswith("contracts/"):
                    bundled_schema = (ROOT / source).parent.parent / "bundle" / relative
                    if bundled_schema.is_file():
                        resolved_relative = bundled_schema.relative_to(ROOT).as_posix()
                        references[resolved_relative].append(reference)
                        if resolved_relative not in queued:
                            queue.append(resolved_relative)
                            queued.add(resolved_relative)
                    else:
                        missing[relative].append(reference)
                else:
                    missing[relative].append(reference)

for source, obj in seed_objects.items():
    visit(obj, source)
while queue:
    relative = queue.popleft()
    if relative in seen:
        continue
    seen.add(relative)
    path = ROOT / relative
    if path.is_symlink():
        try:
            resolved = path.resolve(strict=True)
            if resolved.is_relative_to(ROOT):
                target = resolved.relative_to(ROOT).as_posix()
                queue.append(target)
                references[target].append({"source": relative, "context": "symlinkTarget"})
        except (OSError, RuntimeError):
            pass
    if path.suffix in {".json", ".jsonl"} and path.is_file() and (relative in changed or relative in untracked):
        try:
            if path.suffix == ".jsonl":
                for number, line in enumerate(path.read_text().splitlines(), 1):
                    if line.strip():
                        visit(json.loads(line), relative, f"line[{number}]")
            else:
                visit(json.loads(path.read_text()), relative)
        except (OSError, ValueError) as exc:
            json_errors.append({"path": relative, "error": str(exc)})

# Image provenance is beside canonical image bytes, rather than in the goal
# link. Retain all committable files beside each currently bound new image.
for url in asset_urls:
    canonical_dir = "curricula/DE/Gymnasium/visualizations/" + url.removeprefix("/assets/goal-visualizations/").rsplit("/", 1)[0]
    prefix = canonical_dir + "/"
    position = bisect_left(committable_sorted, prefix)
    while position < len(committable_sorted) and committable_sorted[position].startswith(prefix):
        seen.add(committable_sorted[position])
        position += 1

stage_files = sorted((seen & untracked) | (seen & changed))
stage_files.extend(p for p in [registry_path, "app/scripts/testGoalBookSourceAtlasInputs.ts",
    "docs/legal/ai-transparency-inventory.json", "docs/qa-ci/status/curriculum-quality-status.json",
    "docs/qa-ci/status/curriculum-quality-status.md",
    "curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json"]
    if p in changed and p not in stage_files)
stage_files.extend(p for p in changed if p.startswith("docs/qa-ci/status/") and p not in stage_files)
stage_files.sort()

symlinks = []
for relative in sorted(seen):
    path = ROOT / relative
    if not path.is_symlink():
        continue
    raw_target = str(path.readlink())
    state = {"path": relative, "target": raw_target}
    try:
        resolved = path.resolve(strict=True)
        state["targetWithinRepository"] = resolved.is_relative_to(ROOT)
        state["resolvedTarget"] = resolved.relative_to(ROOT).as_posix() if resolved.is_relative_to(ROOT) else str(resolved)
        state["targetInGitIndex"] = state["resolvedTarget"] in tracked
        state["targetCommittable"] = state["resolvedTarget"] in committable
    except (OSError, RuntimeError) as exc:
        state["error"] = str(exc)
    symlinks.append(state)

sizes = {p: (ROOT / p).stat().st_size for p in stage_files if (ROOT / p).is_file()}
new_by_package = defaultdict(lambda: {"files": 0, "bytes": 0})
for path in sorted(seen & untracked):
    parts = path.split("/")
    package = "/".join(parts[:8]) if "goal-evidence" in parts else str(Path(path).parent)
    new_by_package[package]["files"] += 1
    if (ROOT / path).is_file():
        new_by_package[package]["bytes"] += (ROOT / path).stat().st_size

report = {
    "schemaVersion": 1,
    "kind": "read-only-technical-git-dependency-audit",
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "head": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT).decode().strip(),
    "scienceApproval": False,
    "humanApproval": False,
    "gitIndexMutated": False,
    "seedSubjects": [s["subject"] for s in subjects],
    "activeRegistrySha256": "sha256:" + hashlib.sha256((ROOT / registry_path).read_bytes()).hexdigest(),
    "reachableCommittableFileCount": len(seen & committable),
    "reachableFileCount": len(seen),
    "referencedUntrackedFileCount": len(seen & untracked),
    "referencedNonCommittableFiles": sorted(seen - committable),
    "stageProposalFileCount": len(stage_files),
    "stageProposalBytes": sum(sizes.values()),
    "newFilesByPackage": dict(sorted(new_by_package.items())),
    "symlinks": symlinks,
    "jsonParseErrors": json_errors,
    "missingLexicalReferences": [{"path": p, "references": refs[:20]} for p, refs in sorted(missing.items())],
    "absoluteLocalReferences": absolute_local_references,
    "limits": [
        "This is the checkpoint delta dependency closure: unchanged indexed files are retained as existing Git base dependencies, without recursively reopening historical reviews.",
        "Lexical dependency discovery includes historical routing notes and receipts; missing lexical references require triage, not automatic rejection or approval.",
        "Files present in the Git index may still be absent from HEAD; the root must stage the proposed complete dependency set before a clean-checkout CI claim.",
        "New, inert Biology/Chemistry candidates are not added unless the current operative checkpoint refers to their bytes.",
        "This audit does not rerun scientific reviews or grant source, image or human approval.",
    ],
}
OUT.mkdir(parents=True, exist_ok=True)
(OUT / "dependency-closure.actual.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
(OUT / "stage-proposal.paths.txt").write_text("\n".join(stage_files) + "\n")
(OUT / "stage-proposal.paths.nul").write_bytes(b"\0".join(p.encode() for p in stage_files) + b"\0")
print(json.dumps({k: report[k] for k in ["reachableFileCount", "referencedUntrackedFileCount", "stageProposalFileCount", "stageProposalBytes"]}))
print("lexical-missing", len(missing), "absolute-local", len(absolute_local_references), "JSON-errors", len(json_errors), "symlinks", len(symlinks))
