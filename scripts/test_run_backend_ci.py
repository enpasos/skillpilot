"""Failure-priority CI never replaces the full backend suite."""

# SPDX-License-Identifier: Apache-2.0
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock

import run_backend_ci


class BackendCiFailurePriorityTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory()
        self.addCleanup(self.scratch.cleanup)
        self.backend = Path(self.scratch.name) / "backend with spaces"
        self.backend.mkdir()
        self.manifest = self.backend / "advisory.json"
        self.reports = self.backend / "build/test-results/test"
        self.commands = []
        source = self.backend / "src/test/java/com/skillpilot"
        source.mkdir(parents=True)
        for name in ["FormerFailureTest", "ExampleTest"]:
            (source / f"{name}.java").write_text(f"package com.skillpilot;\nclass {name} {{\n    void failingMethod() {{}}\n    class Nested {{}}\n}}\n")

    def report(self, name="com.skillpilot.ExampleTest", failure=True, error=False, method="case[1]"):
        self.reports.mkdir(parents=True, exist_ok=True)
        status = '<error message="failure"/>' if error else '<failure message="failure"/>' if failure else ''
        path = self.reports / f"TEST-{name}.xml"
        path.write_text(f'<testsuite name="{name}" failures="0" errors="0"><testcase classname="{name}" name="{method}">{status}</testcase></testsuite>')

    def invoke(self, callback):
        def execute(command, **kwargs):
            self.commands.append(command)
            self.assertEqual(self.backend, kwargs["cwd"])
            self.assertFalse(kwargs["shell"])
            self.assertFalse(kwargs["check"])
            return subprocess.CompletedProcess(command, callback(command))
        return run_backend_ci.run_backend_ci(self.backend, self.manifest, self.reports, execute)

    def cached_classes(self, classes):
        run_backend_ci.write_failed_selectors(self.manifest, classes)

    def test_missing_manifest_runs_full_check_and_records_real_failures(self):
        def full(command):
            self.report()
            return 7
        self.assertEqual(7, self.invoke(full))
        self.assertEqual([["./gradlew", "check"]], self.commands)
        self.assertEqual(["com.skillpilot.ExampleTest"], run_backend_ci.read_failed_selectors(self.manifest))

    def test_corrupt_and_unsafe_advisory_input_falls_back_to_full_suite(self):
        for text in ["not json", "[]", '{"schemaVersion":true,"failedSelectors":[]}', '{"schemaVersion":1,"failedSelectors":["--tests"]}', '{"schemaVersion":1,"failedSelectors":["A*; echo secret"]}']:
            with self.subTest(text=text):
                self.commands.clear()
                self.manifest.write_text(text)
                self.assertEqual(0, self.invoke(lambda command: 0))
                self.assertEqual([["./gradlew", "check"]], self.commands)

    def test_failed_priority_run_stops_immediately_and_saves_current_classes(self):
        self.cached_classes(["com.skillpilot.FormerFailureTest"])
        def priority(command):
            self.report("com.skillpilot.FormerFailureTest", error=True)
            return 1
        self.assertEqual(1, self.invoke(priority))
        self.assertEqual([["./gradlew", "test", "--fail-fast", "-PbackendFailurePriorityPreflight=true", "--tests", "com.skillpilot.FormerFailureTest"]], self.commands)
        self.assertEqual(["com.skillpilot.FormerFailureTest"], run_backend_ci.read_failed_selectors(self.manifest))

    def test_successful_priority_run_always_runs_unfiltered_check_and_clears_cache(self):
        self.cached_classes(["com.skillpilot.FormerFailureTest"])
        def run(command):
            if command[1] == "test":
                self.report("com.skillpilot.FormerFailureTest", failure=False)
            else:
                self.assertEqual([], run_backend_ci.read_failed_selectors(self.manifest))
                self.assertFalse(self.reports.exists())
            return 0
        self.assertEqual(0, self.invoke(run))
        self.assertEqual([
            ["./gradlew", "test", "--fail-fast", "-PbackendFailurePriorityPreflight=true", "--tests", "com.skillpilot.FormerFailureTest"],
            ["./gradlew", "check"],
        ], self.commands)
        self.assertEqual([], run_backend_ci.read_failed_selectors(self.manifest))

    def test_no_discovered_priority_match_still_runs_full_check_and_preserves_its_result(self):
        # A former @Test can remain declared as an ordinary helper method.
        for full_exit in [0, 3]:
            with self.subTest(full_exit=full_exit):
                self.commands.clear()
                self.cached_classes(["com.skillpilot.ExampleTest.failingMethod"])
                def run(command):
                    if command[1] == "test":
                        self.assertIn("-PbackendFailurePriorityPreflight=true", command)
                        return 0  # No current JUnit report for the obsolete selector.
                    self.assertEqual(["./gradlew", "check"], command)
                    self.report("com.skillpilot.FormerFailureTest", failure=full_exit != 0)
                    return full_exit
                self.assertEqual(full_exit, self.invoke(run))
                self.assertEqual(2, len(self.commands))
                self.assertEqual(["com.skillpilot.FormerFailureTest"] if full_exit else [], run_backend_ci.read_failed_selectors(self.manifest))

    def test_full_suite_failure_replaces_successful_priority_reports(self):
        self.cached_classes(["com.skillpilot.FormerFailureTest"])
        def run(command):
            if command[1] == "test":
                self.report("com.skillpilot.FormerFailureTest", failure=False)
                return 0
            self.report("com.skillpilot.NewFailureTest")
            return 3
        self.assertEqual(3, self.invoke(run))
        self.assertEqual(["com.skillpilot.NewFailureTest"], run_backend_ci.read_failed_selectors(self.manifest))

    def test_failure_before_tests_never_reuses_old_xml_and_retains_advisory(self):
        self.cached_classes(["com.skillpilot.FormerFailureTest"])
        self.report("com.skillpilot.StaleTest")
        self.assertEqual(2, self.invoke(lambda command: 2))
        self.assertEqual(["com.skillpilot.FormerFailureTest"], run_backend_ci.read_failed_selectors(self.manifest))

    def test_priority_success_then_compilation_failure_keeps_empty_manifest(self):
        self.cached_classes(["com.skillpilot.FormerFailureTest"])
        def run(command):
            if command[1] == "test":
                self.report("com.skillpilot.FormerFailureTest", failure=False)
                return 0
            return 2
        self.assertEqual(2, self.invoke(run))
        self.assertEqual([], run_backend_ci.read_failed_selectors(self.manifest))

    def test_parameterized_methods_and_duplicates_select_class_not_method(self):
        self.cached_classes(["com.skillpilot.ExampleTest$Nested", "com.skillpilot.ExampleTest$Nested"])
        self.assertEqual(0, self.invoke(lambda command: 0))
        self.assertEqual(["./gradlew", "test", "--fail-fast", "-PbackendFailurePriorityPreflight=true", "--tests", "com.skillpilot.ExampleTest$Nested"], self.commands[0])
        self.report(method="parameterCase[1: compound description]", error=True)
        self.assertEqual(["com.skillpilot.ExampleTest"], run_backend_ci.failed_selectors_from_junit(self.reports))

    def test_exception_still_updates_advisory_manifest_from_current_junit(self):
        self.cached_classes(["com.skillpilot.FormerFailureTest"])
        def crash(command):
            self.report("com.skillpilot.CurrentFailureTest")
            raise OSError("synthetic launch failure")
        with self.assertRaises(OSError):
            self.invoke(crash)
        self.assertEqual(["com.skillpilot.CurrentFailureTest", "com.skillpilot.FormerFailureTest"], run_backend_ci.read_failed_selectors(self.manifest))

    def test_initialization_errors_without_test_cases_and_malformed_xml(self):
        self.reports.mkdir(parents=True)
        (self.reports / "TEST-init.xml").write_text('<testsuite name="com.skillpilot.InitTest" errors="1" failures="0"/>')
        (self.reports / "TEST-corrupt.xml").write_text("not xml")
        self.assertEqual(["com.skillpilot.InitTest"], run_backend_ci.failed_selectors_from_junit(self.reports))

    def test_ordinary_method_prioritizes_only_the_failed_method(self):
        self.report(method="failingMethod()")
        self.assertEqual(["com.skillpilot.ExampleTest.failingMethod"], run_backend_ci.failed_selectors_from_junit(self.reports))
        self.cached_classes(run_backend_ci.failed_selectors_from_junit(self.reports))
        self.assertEqual(1, self.invoke(lambda command: 1))
        self.assertEqual([["./gradlew", "test", "--fail-fast", "-PbackendFailurePriorityPreflight=true", "--tests", "com.skillpilot.ExampleTest.failingMethod"]], self.commands)

    def test_failed_suite_does_not_add_whole_class_to_method_selector(self):
        self.reports.mkdir(parents=True)
        (self.reports / "TEST-method.xml").write_text('<testsuite name="com.skillpilot.ExampleTest" failures="1"><testcase classname="com.skillpilot.ExampleTest" name="failingMethod()"><failure/></testcase></testsuite>')
        self.assertEqual(["com.skillpilot.ExampleTest.failingMethod"], run_backend_ci.failed_selectors_from_junit(self.reports))

    def test_removed_or_renamed_method_falls_back_to_current_class(self):
        self.cached_classes(["com.skillpilot.ExampleTest.removedMethod"])
        self.assertEqual(1, self.invoke(lambda command: 1))
        self.assertEqual([["./gradlew", "test", "--fail-fast", "-PbackendFailurePriorityPreflight=true", "--tests", "com.skillpilot.ExampleTest"]], self.commands)

    def test_removed_nested_method_falls_back_to_existing_nested_class(self):
        self.cached_classes(["com.skillpilot.ExampleTest$Nested.removedMethod"])
        self.assertEqual(1, self.invoke(lambda command: 1))
        self.assertEqual([["./gradlew", "test", "--fail-fast", "-PbackendFailurePriorityPreflight=true", "--tests", "com.skillpilot.ExampleTest$Nested"]], self.commands)

    def test_removed_nested_class_falls_back_to_existing_outer_class(self):
        self.cached_classes(["com.skillpilot.ExampleTest$Removed"])
        self.assertEqual(1, self.invoke(lambda command: 1))
        self.assertEqual([["./gradlew", "test", "--fail-fast", "-PbackendFailurePriorityPreflight=true", "--tests", "com.skillpilot.ExampleTest"]], self.commands)

    def test_fail_fast_keeps_known_failures_not_yet_exercised(self):
        self.cached_classes(["com.skillpilot.ExampleTest.failingMethod", "com.skillpilot.FormerFailureTest"])
        def stopped_early(command):
            self.report("com.skillpilot.ExampleTest", method="failingMethod()")
            return 1
        self.assertEqual(1, self.invoke(stopped_early))
        self.assertEqual(["com.skillpilot.ExampleTest.failingMethod", "com.skillpilot.FormerFailureTest"], run_backend_ci.read_failed_selectors(self.manifest))

    def test_well_formed_non_junit_xml_retains_priority_hints(self):
        self.cached_classes(["com.skillpilot.ExampleTest.failingMethod"])
        def wrong_xml(command):
            self.reports.mkdir(parents=True)
            (self.reports / "TEST-invalid.xml").write_text("<not-junit/>")
            return 2
        self.assertEqual(2, self.invoke(wrong_xml))
        self.assertEqual(["com.skillpilot.ExampleTest.failingMethod"], run_backend_ci.read_failed_selectors(self.manifest))

    def test_manifest_write_failure_does_not_skip_full_check_or_veto_its_exit(self):
        for full_exit in [0, 3]:
            with self.subTest(full_exit=full_exit):
                self.commands.clear()
                self.cached_classes(["com.skillpilot.ExampleTest.failingMethod"])
                with mock.patch.object(run_backend_ci, "write_failed_selectors", side_effect=OSError("synthetic cache error")):
                    self.assertEqual(full_exit, self.invoke(lambda command: 0 if command[1] == "test" else full_exit))
                self.assertEqual(["./gradlew", "check"], self.commands[1])

    def test_source_stat_error_falls_back_to_full_check(self):
        self.cached_classes(["com.skillpilot.ExampleTest.failingMethod"])
        with mock.patch.object(Path, "is_file", side_effect=OSError("synthetic source stat error")):
            self.assertEqual(3, self.invoke(lambda command: 3))
        self.assertEqual([["./gradlew", "check"]], self.commands)

    def test_junit_read_error_cannot_override_actual_gradle_exit(self):
        with mock.patch.object(run_backend_ci, "current_junit_failures", side_effect=OSError("synthetic report error")):
            self.assertEqual(3, self.invoke(lambda command: 3))

    def test_removed_or_renamed_class_falls_back_to_full_check(self):
        self.cached_classes(["com.skillpilot.RemovedTest"])
        self.assertEqual(0, self.invoke(lambda command: 0))
        self.assertEqual([["./gradlew", "check"]], self.commands)
        self.assertEqual([], run_backend_ci.read_failed_selectors(self.manifest))

    def test_malformed_priority_junit_does_not_claim_prior_failure_fixed(self):
        self.cached_classes(["com.skillpilot.FormerFailureTest"])
        def broken_report(command):
            self.reports.mkdir(parents=True)
            (self.reports / "TEST-corrupt.xml").write_text("not xml")
            return 2
        self.assertEqual(2, self.invoke(broken_report))
        self.assertEqual(["com.skillpilot.FormerFailureTest"], run_backend_ci.read_failed_selectors(self.manifest))


if __name__ == "__main__":
    unittest.main()
