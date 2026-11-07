#!/usr/bin/env python3
"""Replay small genuine capture counterexamples using retrievable frozen bytes.

No full QA pair or Source-A authority is synthesized. All writes are confined
to disposable scratch space and the caller's explicit result directory.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile


def require(value, message):
    if not value:
        raise ValueError(message)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[4])
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    repo, output = args.repo_root.resolve(strict=True), args.output.resolve()
    folder = Path(__file__).resolve().parent
    bindings = json.loads((folder / "replay-inputs.json").read_text())
    for row in bindings["boundFiles"]:
        raw = (repo / row["path"]).read_bytes()
        require(hashlib.sha256(raw).hexdigest() == row["sha256"] and len(raw) == row["bytes"], "Replay input differs: " + row["path"])
    output.mkdir(parents=True, exist_ok=False)

    def execute(label, stage, command, probe=False, final_tests=False):
        with tempfile.TemporaryDirectory(prefix="capture-frozen-replay-", dir="/dev/shm") as directory:
            scratch = Path(directory)
            (scratch / "tmp").mkdir()
            result_path = scratch / "result.json"
            argv = ["bwrap", "--die-with-parent", "--unshare-net", "--ro-bind", "/", "/", "--proc", "/proc", "--dev", "/dev",
                    "--tmpfs", "/dev/shm", "--bind", str(scratch), str(scratch), "--bind", str(scratch / "tmp"), "/tmp",
                    "--setenv", "PYTHONDONTWRITEBYTECODE", "1", "--setenv", "SKILLPILOT_CAPTURE_REVIEW_REPO", str(repo),
                    "--setenv", "SKILLPILOT_CAPTURE_REVIEW_OUTPUT", str(result_path), "--chdir", str(repo)]
            for name, path in bindings["stages"][stage].items():
                if final_tests and name.startswith("test_"):
                    path = bindings["stages"]["final19"][name]
                argv += ["--ro-bind", str(repo / path), str(repo / "scripts" / name)]
            run = subprocess.run(argv + ["--"] + command, capture_output=True, text=True)
            (output / (label + ".stdout.txt")).write_text(run.stdout)
            (output / (label + ".stderr.txt")).write_text(run.stderr)
            result = {"exitCode": run.returncode}
            if probe:
                result["probe"] = json.loads(result_path.read_text())
            (output / (label + ".json")).write_text(json.dumps(result, indent=2) + "\n")
            return result, run

    peer = str(repo / bindings["originalProbe"])
    before, before_run = execute("original-holds-before14", "before14", ["python3", "-B", peer], probe=True)
    after, after_run = execute("original-holds-final19", "final19", ["python3", "-B", peer], probe=True)
    require(before_run.returncode == after_run.returncode == 0, "Original counterprobe failed to run")
    old = {row["case"]: row for row in before["probe"]["results"]}
    new = {row["case"]: row for row in after["probe"]["results"]}
    for case in ("TEXT_SELECTED_INPUT_TAMPER", "PROJECTED_GRAPH_TEXT_TAMPER", "GROUPED_ASSET_ENTRY_REPLACEMENT"):
        require(old[case]["exitCode"] == 0 and new[case]["exitCode"] != 0, "Missing genuine original RED/GREEN: " + case)
        require("accepted" not in new[case]["stdout"], "Tampered command executed")
    case = "ABSOLUTE_OUTPUT_PATH_ESCAPES_CAPTURE"
    require(old[case]["outsideSentinelChanged"] and not new[case]["outsideSentinelChanged"] and new[case]["after"] == "DO NOT CHANGE",
            "Output sentinel counterexample did not close")
    for case in ("CONTROL_STORE_BLOB_TAMPER_REJECTED", "HOST_WORKTREE_VIA_PARENT_PROCESS_ROOT"):
        require(old[case]["exitCode"] != 0 and new[case]["exitCode"] != 0, "Existing negative control regressed")

    alias_probe = str(repo / bindings["aliasProbe"])
    alias_before, _ = execute("alias-hold-before17", "before17", ["python3", "-B", alias_probe], probe=True)
    alias_after, _ = execute("alias-hold-final19", "final19", ["python3", "-B", alias_probe], probe=True)
    old_alias, new_alias = alias_before["probe"], alias_after["probe"]
    require(alias_before["exitCode"] == alias_after["exitCode"] == 0, "Alias counterprobe failed to run")
    require(old_alias["baseline"]["exitCode"] == new_alias["baseline"]["exitCode"] == 0, "Authentic aliases no longer work")
    require(old_alias["afterAliasReplacement"]["exitCode"] == 0 and new_alias["afterAliasReplacement"]["exitCode"] != 0,
            "Missing genuine alias RED/GREEN")
    require("Directory alias target changed" in new_alias["afterAliasReplacement"]["stderr"], "Wrong alias rejection cause")
    require(old_alias["receiptByteIdentical"] and new_alias["receiptByteIdentical"]
            and old_alias["allSelectedPhysicalInputsStillMatch"] and new_alias["allSelectedPhysicalInputsStillMatch"],
            "Alias reproduction changed other bound inputs")

    tests = ["test_prepare_identity_qa_candidate.IsolationTests.test_directory_alias_type_target_and_internal_resolution_rechecked_before_command",
             "test_prepare_identity_qa_candidate.IsolationTests.test_directory_alias_is_rechecked_after_command_for_both_roots"]
    red_command = ["python3", "-B", "-m", "unittest", *tests, "-v"]
    # unittest module discovery requires the actual scripts directory on sys.path.
    red_command = ["python3", "-B", "-c", "import sys,unittest;sys.path.insert(0,'scripts');unittest.main(module=None,argv=['unittest']+sys.argv[1:])", *tests, "-v"]
    red, red_run = execute("new-alias-regressions-before17", "before17", red_command, final_tests=True)
    require(red["exitCode"] == 1 and "AssertionError: 0 == 0" in red_run.stderr and "Ran 2 tests" in red_run.stderr,
            "New regressions did not fail for the real old acceptance behavior")
    green, green_run = execute("all-final19-tests", "final19", ["python3", "-B", "-m", "unittest", "discover", "-s", "scripts", "-p", "test_*identity_qa*py", "-v"])
    require(green["exitCode"] == 0 and "Ran 19 tests" in green_run.stderr and "\nOK\n" in green_run.stderr
            and "skipped=" not in green_run.stderr, "Final exact no-skip suite failed")
    summary = {"status": "PASS", "originalHoldsClosed": ["CAP-PEER-01", "CAP-PEER-02", "CAP-PEER-03"],
               "directoryAliasHoldClosed": "CAP-PEER-04", "testMethods": 19, "skips": 0,
               "replayInputsSha256": hashlib.sha256((folder / "replay-inputs.json").read_bytes()).hexdigest(),
               "sourceWritesPerformed": False, "fullSourceAOrQaOrRuntimeApprovalClaimed": False}
    (output / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
