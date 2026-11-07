# SPDX-License-Identifier: Apache-2.0
"""Exercise the fixed 132 transport through the real selector CLI and parser.

The historical 74 suite remains separate. This suite adds 24 option-parser cases
and 6 real underbudget cases without private workspace fixtures or output copies.
"""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


REPOSITORY = Path(__file__).resolve().parents[4]
SELECTOR = REPOSITORY / "scripts/visualization_qualified_context_capsule.py"
INDEX132 = "d047c2125157f07f87c7186bc95136679e6e5fa9045ded315cf957f533acedd3"
INDEX_PATH = "contracts/goal-visualization-context/v1/qualified-context-index-math58-132-g17-fifteen-2026-11-07.candidate.json"
INDEX57 = "46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0"


class EffectiveResourceLimitTests(unittest.TestCase):
    def test_effective_limit_options_reject_before_reading_or_writing(self):
        # Duplicate flags use their final value; argparse also accepts equals
        # and unambiguous abbreviations. All must reach the same native guard.
        cases = (
            ("working", 308 * 1024 * 1024, "external308-MiB"),
            ("object", 282 * 1024 * 1024, "external282-MiB"),
            ("embedded", 14 * 1024 * 1024, "external14-MiB"),
        )
        with tempfile.TemporaryDirectory(prefix="visualization-limit-test-") as directory:
            root = Path(directory)
            for action in ("build", "materialize"):
                for kind, limit, message in cases:
                    option = f"--maximum-{kind}-bytes"
                    for spelling in ("duplicate", "equals", "abbreviated"):
                        output = root / f"{action}-{kind}-{spelling}"
                        arguments = [
                            action,
                            "--repository-root", str(root / "absent-repository"),
                            "--accepted-commit", "25a6f2164a81a7e6ae50db3557d20521fecf5124",
                            "--accepted-census-sha256", INDEX132,
                            "--output", str(output),
                        ]
                        if spelling == "duplicate":
                            arguments += [option, str(limit), option, str(limit + 1)]
                        elif spelling == "equals":
                            arguments += [f"{option}={limit + 1}"]
                        else:
                            arguments += [f"--maximum-{kind}-b", str(limit + 1)]
                        with self.subTest(action=action, kind=kind, spelling=spelling):
                            result = subprocess.run(
                                [sys.executable, "-B", str(SELECTOR), *arguments],
                                capture_output=True, text=True, timeout=10, check=False,
                            )
                            self.assertNotEqual(result.returncode, 0)
                            self.assertIn(message, result.stderr)
                            self.assertFalse(output.exists())

    def test_effective_index_option_selects_the_fixed132_limit(self):
        with tempfile.TemporaryDirectory(prefix="visualization-index-test-") as directory:
            root = Path(directory)
            for action in ("build", "materialize"):
                for spelling in ("duplicate", "equals", "abbreviated"):
                    output = root / f"{action}-{spelling}"
                    arguments = [
                        action,
                        "--repository-root", str(root / "absent-repository"),
                        "--accepted-commit", "25a6f2164a81a7e6ae50db3557d20521fecf5124",
                        "--output", str(output),
                        "--maximum-working-bytes", str(308 * 1024 * 1024 + 1),
                    ]
                    if spelling == "duplicate":
                        arguments += ["--accepted-census-sha256", INDEX57,
                                      "--accepted-census-sha256", INDEX132]
                    elif spelling == "equals":
                        arguments += [f"--accepted-census-sha256={INDEX132}"]
                    else:
                        arguments += ["--accepted-census-s", INDEX132]
                    with self.subTest(action=action, spelling=spelling):
                        result = subprocess.run(
                            [sys.executable, "-B", str(SELECTOR), *arguments],
                            capture_output=True, text=True, timeout=10, check=False,
                        )
                        self.assertNotEqual(result.returncode, 0)
                        self.assertIn("external308-MiB", result.stderr)
                        self.assertFalse(output.exists())


    def test_actual_underbudgets_reject_before_output(self):
        # These are the measured, byte-exact 132 closure totals, rather than
        # goal-count estimates. Passing the other limits avoids an unrelated
        # resource check masking the specific budget under test. The working
        # limit executes index_originals over the actual portable repo inputs;
        # the object/embedded guards execute before any output/capsule read.
        measured = {
            "working": 322145781,
            "object": 295355809,
            "embedded": 14589626,
        }
        maxima = {
            "working": 308 * 1024 * 1024,
            "object": 282 * 1024 * 1024,
            "embedded": 14 * 1024 * 1024,
        }
        with tempfile.TemporaryDirectory(prefix="visualization-underbudget-test-") as directory:
            root = Path(directory)
            for action in ("build", "materialize"):
                for kind, actual in measured.items():
                    output = root / f"{action}-{kind}"
                    arguments = [
                        action,
                        "--repository-root", str(REPOSITORY),
                        "--accepted-commit", "25a6f2164a81a7e6ae50db3557d20521fecf5124",
                        "--accepted-census-sha256", INDEX132,
                        "--census-path", INDEX_PATH,
                        "--output", str(output),
                        "--capsule", str(root / "unread-capsule"),
                        "--accepted-capsule-sha256", "0" * 64,
                    ]
                    for name, maximum in maxima.items():
                        arguments += [f"--maximum-{name}-bytes",
                                      str(actual - 1 if name == kind else maximum)]
                    with self.subTest(action=action, kind=kind):
                        result = subprocess.run(
                            [sys.executable, "-B", str(SELECTOR), *arguments],
                            capture_output=True, text=True, timeout=30, check=False,
                        )
                        self.assertNotEqual(result.returncode, 0)
                        self.assertIn(f"Fixed132 actual {kind} bytes exceed caller budget",
                                      result.stderr)
                        self.assertFalse(output.exists())
                        self.assertFalse((root / "unread-capsule").exists())


if __name__ == "__main__":
    unittest.main()
