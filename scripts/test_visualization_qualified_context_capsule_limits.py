# SPDX-License-Identifier: Apache-2.0
"""Exercise resource limits through the real selector CLI and kernel parser."""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SELECTOR = Path(__file__).resolve().with_name("visualization_qualified_context_capsule.py")
INDEX74 = "234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785"
INDEX57 = "46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0"


class EffectiveResourceLimitTests(unittest.TestCase):
    def test_effective_limit_options_reject_before_reading_or_writing(self):
        # Duplicate flags use their final value; argparse also accepts equals
        # and unambiguous abbreviations. All must reach the same native guard.
        cases = (
            ("working", 192 * 1024 * 1024, "external192-MiB"),
            ("object", 256 * 1024 * 1024, "unchanged256-MiB"),
            ("embedded", 16 * 1024 * 1024, "unchanged16-MiB"),
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
                            "--accepted-census-sha256", INDEX74,
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

    def test_effective_index_option_selects_the_fixed74_limit(self):
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
                        "--maximum-working-bytes", str(192 * 1024 * 1024 + 1),
                    ]
                    if spelling == "duplicate":
                        arguments += ["--accepted-census-sha256", INDEX57,
                                      "--accepted-census-sha256", INDEX74]
                    elif spelling == "equals":
                        arguments += [f"--accepted-census-sha256={INDEX74}"]
                    else:
                        arguments += ["--accepted-census-s", INDEX74]
                    with self.subTest(action=action, spelling=spelling):
                        result = subprocess.run(
                            [sys.executable, "-B", str(SELECTOR), *arguments],
                            capture_output=True, text=True, timeout=10, check=False,
                        )
                        self.assertNotEqual(result.returncode, 0)
                        self.assertIn("external192-MiB", result.stderr)
                        self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
