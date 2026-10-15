#!/usr/bin/env python3
"""Technical package-v1 omission guard; synthetic TEST_ONLY files only."""
import importlib.util
import pathlib
import sys
import tempfile
import unittest

path = pathlib.Path(__file__).with_name("compile_curriculum_release_model.py")
spec = importlib.util.spec_from_file_location("supplement_candidate_compiler", path)
compiler = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = compiler
spec.loader.exec_module(compiler)

class GuardTest(unittest.TestCase):
    def test_package_v1_cannot_silently_omit_math_supplement_semantics(self):
        with tempfile.TemporaryDirectory(prefix="skillpilot-TEST_ONLY-package-supplement-") as tmp:
            root = pathlib.Path(tmp)
            profile = {"canonicalLandscape": {"landscapeId": "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced"}}
            compiler.reject_unsupported_composition_supplements(profile, root)
            directory = root / "curricula/DE/Gymnasium/composition-supplements/mathematik"
            directory.mkdir(parents=True)
            (directory / "TEST_ONLY.supplement.json").write_text("{}")
            with self.assertRaisesRegex(compiler.CompilationError, "composition-supplement-v1 is unsupported"):
                compiler.reject_unsupported_composition_supplements(profile, root)
            # An ordinary unrelated package keeps its existing semantics.
            compiler.reject_unsupported_composition_supplements({"canonicalLandscape": {"landscapeId": "other"}}, root)

if __name__ == "__main__":
    unittest.main()
