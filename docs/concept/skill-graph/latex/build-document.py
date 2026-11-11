#!/usr/bin/env python3
"""Compatibility wrapper around docs/concept/skill-graph/build_spec.py --all.

SPDX-License-Identifier: Apache-2.0
"""

from pathlib import Path
import subprocess
import sys


def main() -> None:
    target = Path(__file__).resolve().parents[1] / "build_spec.py"
    subprocess.run([sys.executable, str(target), "--all", *sys.argv[1:]], check=True)


if __name__ == "__main__":
    main()
