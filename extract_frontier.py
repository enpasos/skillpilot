#!/usr/bin/env python3
"""Extract a simple phase-local frontier snapshot from a landscape JSON."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


DEFAULT_INPUT = Path("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json")
DEFAULT_OUTPUT = Path("tmp/frontier.txt")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="?", default=str(DEFAULT_INPUT))
    parser.add_argument("--phase", default="E")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with input_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)

    nodes = []
    for goal in data.get("goals", []):
        tags = goal.get("dimensionTags", {})
        if tags.get("phase") == args.phase and not goal.get("requires"):
            nodes.append(f"- [{goal['id']}] {goal['title']}")

    with output_path.open("w", encoding="utf-8") as handle:
        handle.write("\n".join(nodes))


if __name__ == "__main__":
    main()
