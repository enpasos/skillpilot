#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Materialize only the explicitly bound author canonical into repository tmp.

This does not produce semantic decisions, reviews, source approvals or a report.
It is supplied for future review preparation and was not executed by the author.
"""
import argparse
import hashlib
import json
from pathlib import Path


def digest_bytes(value):
    return "sha256:" + hashlib.sha256(value).hexdigest()


def object_digest(value):
    body = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return digest_bytes(body.encode("utf-8"))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    package = Path(__file__).resolve().parent.parent
    repo = next(p for p in package.parents if (p / "app").is_dir() and (p / "AGENTS.md").is_file())
    output = (repo / args.output).resolve()
    if not output.is_relative_to(repo / "tmp"):
        raise ValueError("Author materialization output must stay under repository tmp/")
    sparse = json.loads((package / "candidate/CANONICAL.sparse-whole-goal-replacements.author.json").read_text())
    base_bytes = (repo / sparse["base"]["path"]).read_bytes()
    if digest_bytes(base_bytes) != sparse["base"]["sha256"]:
        raise ValueError("Bound original canonical changed")
    canonical = json.loads(base_bytes)
    position = {g["id"]: i for i, g in enumerate(canonical["goals"])}
    original_ids = set(position)
    for item in sparse["changes"]:
        index = position[item["goalId"]]
        if object_digest(canonical["goals"][index]) != item["beforeWholeObjectSha256"]:
            raise ValueError("Whole original goal differs: " + item["goalId"])
        if object_digest(item["after"]) != item["afterWholeObjectSha256"]:
            raise ValueError("Sparse author body differs: " + item["goalId"])
        canonical["goals"][index] = item["after"]
    if original_ids != {g["id"] for g in canonical["goals"]}:
        raise ValueError("A stable ID was removed or added")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(canonical, ensure_ascii=False, indent=2) + "\n")
    print("Unselected author canonical materialized; no semantic ledger, reviews or gates created.")


if __name__ == "__main__":
    main()
