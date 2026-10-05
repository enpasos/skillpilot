# SPDX-License-Identifier: Apache-2.0
"""Capture terminal evidence for the requested stable checkpoint, without shell pipelines."""
import concurrent.futures
import datetime
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent

PLAN = {
    "final-docs": [
        ("final-generated-doc-notices", ["npm", "--prefix", "app", "run", "check:generated-doc-notices"]),
        ("final-generated-status-registry", ["npm", "--prefix", "app", "run", "check:generated-status-registry"]),
        ("final-docs-links", ["npm", "--prefix", "app", "run", "check:docs-links"]),
        ("final-docs-indexes", ["npm", "--prefix", "app", "run", "check:docs-indexes"]),
        ("final-terminology", ["npm", "--prefix", "app", "run", "check:terminology"]),
    ],
    "inventory-recheck": [
        ("ai-transparency-inventory-after-measured-refresh", ["npm", "--prefix", "app", "run", "check:ai-transparency-inventory"]),
    ],
    "chemistry-watch-refresh": [
        ("chemistry-watch-capture-reviewed-baseline", ["python", "-B", "scripts/canonical_chemistry_evidence_watch.py", "capture-baseline"]),
        ("chemistry-watch-after-reviewed-integration", ["bash", "scripts/run_canonical_chemistry_evidence_watch.sh"]),
    ],
    "stable-copy-rechecks": [
        ("assets-after-completed-runtime-copy", ["npm", "--prefix", "app", "run", "check:goal-visualization-assets"]),
        ("schemas-after-completed-candidate-freezes", ["python", "-B", "scripts/validate_schemas.py"]),
    ],
    "affected-layer-a": [
        ("chemistry-evidence-watch", ["python", "-B", "scripts/canonical_chemistry_evidence_watch.py", "check-delta"]),
        ("course-level-mapping-consistency", ["npm", "--prefix", "app", "run", "test:course-level-mapping-consistency"]),
        ("curriculum-spelling", ["node", "scripts/check_curriculum_spelling.mjs"]),
        ("memory-card-review-check", ["npm", "--prefix", "app", "run", "quality:memory-card-review:check:all"]),
        ("visualization-approval-coverage", ["npm", "--prefix", "app", "run", "check:goal-visualization-approval-coverage"]),
        ("visualization-coverage-parity", ["npm", "--prefix", "app", "run", "check:goal-visualization-qa-coverage-parity"]),
        ("dependency-audit", ["npm", "--prefix", "app", "audit", "--audit-level=high"]),
    ],
    "affected-rechecks": [
        ("assets-after-historical-preservation", ["npm", "--prefix", "app", "run", "check:goal-visualization-assets"]),
        ("schemas-after-final-candidate-exports", ["python", "-B", "scripts/validate_schemas.py"]),
    ],
    "base": [
        ("schemas", ["python", "-B", "scripts/validate_schemas.py"]),
        ("central-five-gates", ["app/node_modules/.bin/tsx", "app/scripts/reportDeepUnderstandingRollout.ts", "--config=curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json", "--mode=check", "--format=json"]),
        ("graph", ["npm", "--prefix", "app", "run", "validate:graph"]),
        ("composition-views", ["npm", "--prefix", "app", "run", "validate:composition-views"]),
        ("view-filters", ["npm", "--prefix", "app", "run", "validate:view-filters"]),
        ("competency-wording", ["python", "-B", "scripts/validate_competency_wording.py"]),
        ("visualization-assets", ["npm", "--prefix", "app", "run", "check:goal-visualization-assets"]),
        ("visualization-qa", ["npm", "--prefix", "app", "run", "check:goal-visualization-qa", "--", "--subjects=mathematik,physik,chemie,biologie"]),
    ],
    "derived-status": [
        ("source-coverage-status", ["npm", "--prefix", "app", "run", "quality:source-coverage-audit"]),
        ("memory-review-status", ["npm", "--prefix", "app", "run", "quality:memory-card-review:report:all"]),
        ("curriculum-quality-status", ["npm", "--prefix", "app", "run", "quality:curriculum-status"]),
        ("protected-maturity-floors", ["npm", "--prefix", "app", "run", "check:curriculum-maturity-floors"]),
    ],
    "docs": [
        ("generated-doc-notices", ["npm", "--prefix", "app", "run", "check:generated-doc-notices"]),
        ("generated-status-registry", ["npm", "--prefix", "app", "run", "check:generated-status-registry"]),
        ("docs-links", ["npm", "--prefix", "app", "run", "check:docs-links"]),
        ("docs-indexes", ["npm", "--prefix", "app", "run", "check:docs-indexes"]),
        ("terminology", ["npm", "--prefix", "app", "run", "check:terminology"]),
        ("diff-whitespace", ["git", "diff", "--check"]),
    ],
    "build": [
        ("prepare-runtime-assets", ["npm", "--prefix", "app", "run", "prepare:runtime-assets"]),
        ("application-build", ["npm", "--prefix", "app", "run", "build:application"]),
        ("ai-transparency-inventory", ["npm", "--prefix", "app", "run", "check:ai-transparency-inventory"]),
    ],
}

def run(item):
    name, argv = item
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = subprocess.run(argv, cwd=ROOT, capture_output=True, check=False)
    stdout = OWN / f"{name}.stdout.txt"
    stderr = OWN / f"{name}.stderr.txt"
    stdout.write_bytes(result.stdout)
    stderr.write_bytes(result.stderr)
    receipt = {
        "argv": argv, "startedAtUTC": started,
        "completedAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "exitCode": result.returncode,
        "stdoutPath": str(stdout.relative_to(ROOT)),
        "stdoutSha256": "sha256:" + hashlib.sha256(result.stdout).hexdigest(),
        "stderrPath": str(stderr.relative_to(ROOT)),
        "stderrSha256": "sha256:" + hashlib.sha256(result.stderr).hexdigest(),
        "evidenceAuthority": "actual_machine_check_only",
        "humanApprovalClaimed": False,
    }
    if name == "central-five-gates":
        report = json.loads(result.stdout)
        (OWN / "central-current.report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        receipt["blockingIssueCount"] = report["blockingIssueCount"]
        receipt["strictCounts"] = {s["subject"]: f'{s["strictComplete"]}/{s["denominator"]}' for s in report["subjects"]}
    (OWN / f"{name}.terminal.receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"check": name, "exitCode": result.returncode}), flush=True)
    if result.returncode:
        print((result.stdout + result.stderr).decode("utf-8", errors="replace")[-5000:], flush=True)
    return receipt

if __name__ == "__main__":
    group = sys.argv[1]
    assert group in PLAN, group
    if group in {"base", "docs", "final-docs", "affected-layer-a"}:
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            receipts = list(pool.map(run, PLAN[group]))
    else:
        receipts = []
        for item in PLAN[group]:
            receipt = run(item)
            receipts.append(receipt)
            if receipt["exitCode"]:
                break
    (OWN / f"{group}.terminal-summary.json").write_text(json.dumps(receipts, ensure_ascii=False, indent=2) + "\n")
    sys.exit(0 if all(r["exitCode"] == 0 for r in receipts) and len(receipts) == len(PLAN[group]) else 1)
