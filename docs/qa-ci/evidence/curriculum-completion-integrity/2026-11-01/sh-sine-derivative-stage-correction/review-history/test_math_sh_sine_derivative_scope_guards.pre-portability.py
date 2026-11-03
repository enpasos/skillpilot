"""Exercise the sealed SH materializer in isolated fixtures with Python assertions disabled."""
import copy
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
CAPSULE_PATH = Path("docs/qa-ci/evidence/curriculum-completion-integrity/2026-11-01/sh-sine-derivative-stage-correction")
CAPSULE = ROOT / CAPSULE_PATH
SCRIPT_PATH = Path("scripts/apply_math_sh_sine_derivative_scope.py")


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    manifest_bytes = (CAPSULE / "integration-manifest-v2.json").read_bytes()
    relocation_bytes = (CAPSULE / "capsule-relocation.json").read_bytes()
    script_bytes = (ROOT / SCRIPT_PATH).read_bytes()
    manifest = json.loads(manifest_bytes)
    relocation = json.loads(relocation_bytes)
    receipt = json.loads((ROOT / manifest["reviewReceipt"]["path"]).read_text())
    results = []
    with tempfile.TemporaryDirectory(prefix="skillpilot-sh-source-guards-") as directory:
        fixture = Path(directory)
        cap = fixture / CAPSULE_PATH
        cap.mkdir(parents=True)

        def copy_file(source, relative):
            target = fixture / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)

        for entry in relocation["files"]:
            copy_file(ROOT / entry["retainedPath"], entry["retainedPath"])
        for entry in manifest["files"]:
            copy_file(ROOT / entry["afterPath"], entry["afterPath"])
            copy_file(ROOT / entry["afterPath"], entry["path"])
        # Temporary local fixture only; no primary PDF/page/fulltext is added to durable evidence.
        copy_file(ROOT / receipt["primarySource"]["path"], receipt["primarySource"]["path"])
        (fixture / SCRIPT_PATH).parent.mkdir(parents=True, exist_ok=True)

        def reset():
            (cap / "integration-manifest-v2.json").write_bytes(manifest_bytes)
            (cap / "capsule-relocation.json").write_bytes(relocation_bytes)
            (fixture / SCRIPT_PATH).write_bytes(script_bytes)

        def execute(name, expected_message=None):
            result = subprocess.run([sys.executable, "-O", str(fixture / SCRIPT_PATH)], cwd=fixture,
                                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            if expected_message is None:
                require(result.returncode == 0, name + ": valid fixture failed: " + result.stdout)
            else:
                require(result.returncode != 0 and expected_message in result.stdout,
                        name + ": expected rejection was not observed: " + result.stdout)
            results.append({"case": name, "pythonAssertionsDisabled": True, "expectedExit": "zero" if expected_message is None else "nonzero",
                            "actualExitCode": result.returncode, "passed": True, "expectedRejection": expected_message})

        def alter_transport(entries, reseal=False):
            altered = copy.deepcopy(relocation)
            altered["files"] = entries
            data = (json.dumps(altered, indent=2) + "\n").encode()
            (cap / "capsule-relocation.json").write_bytes(data)
            if reseal:
                changed_manifest = copy.deepcopy(manifest)
                changed_manifest["capsuleRelocationSha256"] = digest(data)
                changed_bytes = (json.dumps(changed_manifest, ensure_ascii=False, indent=2) + "\n").encode()
                (cap / "integration-manifest-v2.json").write_bytes(changed_bytes)
                (fixture / SCRIPT_PATH).write_bytes(script_bytes.replace(digest(manifest_bytes).encode(), digest(changed_bytes).encode()))

        reset()
        execute("valid reviewed after-state and complete 28-file transport")
        for name, mutate in [
            ("removed relocation entry", lambda entries: entries.pop(0)),
            ("additional relocation entry", lambda entries: entries.append({"originalPath": "unexpected", "retainedPath": "unexpected", "sha256": "0" * 64})),
            ("renamed relocation destination", lambda entries: entries[0].update(retainedPath="renamed")),
            ("manipulated relocation hash", lambda entries: entries[0].update(sha256="0" * 64)),
        ]:
            reset()
            entries = copy.deepcopy(relocation["files"])
            mutate(entries)
            alter_transport(entries)
            execute(name, "relocation changed")

        reset()
        alter_transport(copy.deepcopy(relocation["files"])[1:], reseal=True)
        execute("resealed transport still missing a review-bound file", "exactly 28")
        reset()
        entries = copy.deepcopy(relocation["files"])
        entries[0]["originalPath"] = "unexpected-replacement"
        alter_transport(entries, reseal=True)
        execute("resealed count-preserving unexpected receipt transport member", "membership differs")
        reset()
        entries = copy.deepcopy(relocation["files"])
        entries[0]["sha256"] = "0" * 64
        alter_transport(entries, reseal=True)
        execute("resealed transport cannot replace the independent receipt hash", "hash differs from review binding")

        reset()
        retained = fixture / relocation["files"][0]["retainedPath"]
        original = retained.read_bytes()
        retained.write_bytes(b"tampered retained input")
        execute("retained input content tampering", "Retained evidence changed")
        retained.write_bytes(original)
        reset()
        live = fixture / manifest["files"][0]["path"]
        original = live.read_bytes()
        live.write_bytes(b"unreviewed live data")
        execute("unreviewed live after-file tampering", "Live inputs differ")
        live.write_bytes(original)
        reset()
        execute("valid fixture remains idempotent after negative probes")
    summary = {"schemaVersion": 1, "status": "PASS", "cases": results,
               "scriptPath": str(SCRIPT_PATH), "scriptSha256": digest(script_bytes),
               "manifestSha256": digest(manifest_bytes), "relocationSha256": digest(relocation_bytes),
               "historicalReceiptChanged": False, "liveProductFilesChangedByTests": False}
    (CAPSULE / "retained-transport-guard-tests.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(f"SH retained-transport guards passed: {len(results)} isolated cases under python -O.")


if __name__ == "__main__":
    main()
