#!/usr/bin/env python3
"""Bind unchanged readiness gates and the scoped consumer proof to runtime 1.3."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "contracts/curriculum-package/v1"
TARGET = BASE.parent / "v1.3"
RUNNER = ROOT / "scripts/run_package_consumer_smoke_v13.py"


def generated_documents() -> dict[Path, bytes]:
    report = json.loads((BASE / "package-readiness-report.schema.json").read_bytes())
    report_id = report["$id"].replace("/v1/", "/v1.3/")
    report["$id"] = report_id
    report["properties"]["$schema"]["const"] = report_id
    report["properties"]["scope"]["const"] = "json-full-standalone-v1.3"
    report["properties"]["policy"]["properties"]["id"]["const"] = "full-standalone-v1.3-readiness-v1"
    report["title"] = "SkillPilot JSON curriculum package readiness report for runtime 1.3"
    report["description"] = (
        "Strict readiness evidence for json/full-standalone-v1.3. The candidate dialect "
        "still denotes package format 1.0; runtime identity is bound by the exact policy. "
        "All base readiness gates, including human redistribution and self-executed "
        "hermetic consumer evidence, remain mandatory."
    )
    encode = lambda value: (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()
    consumer = json.loads((BASE / "package-consumer-smoke-report.schema.json").read_bytes())
    consumer_id = consumer["$id"].replace("/v1/", "/v1.3/")
    consumer["$id"] = consumer_id
    consumer["properties"]["$schema"]["const"] = consumer_id
    consumer["properties"]["runner"]["properties"]["version"]["const"] = "1.1.0"
    consumer_bytes = encode(consumer)
    report_bytes = encode(report)
    profile_path = TARGET / "profiles/full-standalone-v1.3.profile.json"
    profile_bytes = profile_path.read_bytes()
    profile = json.loads(profile_bytes)
    if profile["profileId"] != "full-standalone-v1.3" or profile["compatibility"]["runtimeContractVersion"] != "1.3":
        raise ValueError("Unexpected runtime 1.3 profile")
    policy = json.loads((BASE / "profiles/full-standalone-v1.readiness-policy.json").read_bytes())
    policy["policyId"] = "full-standalone-v1.3-readiness-v1"
    policy["scope"] = "json-full-standalone-v1.3"
    policy["target"].update(profile["compatibility"])
    policy["target"]["releaseProfile"] = profile["profileId"]
    policy["target"]["releaseProfileContract"] = {
        "id": profile["profileId"], "sha256": hashlib.sha256(profile_bytes).hexdigest(),
    }
    policy["reportSchema"] = {"id": report_id, "sha256": hashlib.sha256(report_bytes).hexdigest()}
    policy["consumerSmokeReportSchema"] = {
        "id": consumer_id, "sha256": hashlib.sha256(consumer_bytes).hexdigest(),
    }
    runner_bytes = RUNNER.read_bytes()
    policy["consumerSmokeRunner"] = {
        "id": "skillpilot-package-consumer-smoke", "version": "1.1.0",
        "path": RUNNER.relative_to(ROOT).as_posix(), "bytes": len(runner_bytes),
        "sha256": hashlib.sha256(runner_bytes).hexdigest(),
    }
    return {
        TARGET / "package-readiness-report.schema.json": report_bytes,
        TARGET / "package-consumer-smoke-report.schema.json": consumer_bytes,
        TARGET / "profiles/full-standalone-v1.3.readiness-policy.json": encode(policy),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    for path, expected in generated_documents().items():
        if args.check:
            if not path.is_file() or path.read_bytes() != expected:
                raise SystemExit(f"Stale explicit runtime 1.3 readiness binding: {path.relative_to(ROOT)}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(expected)
    print("Runtime 1.3 readiness bindings verified; all gates retained, scoped runner pinned separately from v1.")


if __name__ == "__main__":
    main()
