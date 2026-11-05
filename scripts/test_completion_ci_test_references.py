#!/usr/bin/env python3
"""Small adversarial fixtures for the static workflow test-reference gate."""

# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import tempfile
import unittest

import check_completion_ci_test_references as guard


class WorkflowTestReferenceTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='workflow-test-references-')
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.source = self.root / 'backend/src/test/java/example/ActualTest.java'
        self.source.parent.mkdir(parents=True)
        self.source.write_text('package example.service;\nclass ActualTest {}\n')
        self.workflow = self.root / 'workflow.yml'

    def check(self, selectors, required=None):
        reports = {'example.service.ActualTest': 14} if required is None else required
        self.workflow.write_text('run: >-\n  ./gradlew test ' + selectors
                                 + '\nrun: |\n  python3 - <<\'PY\'\n  required = '
                                 + repr(reports) + '\n  PY\n')
        return guard.check_workflow(self.root, self.workflow)

    def test_resolves_exact_method_and_wildcard_class_selectors(self):
        result = self.check("--tests 'example.service.ActualTest' "
                            '--tests="example.service.ActualTest.method" '
                            "--tests 'example.service.*Test' "
                            "--tests 'example.service.ActualTest.*PracticeSync*'")
        self.assertEqual(result['selectors'], 4)
        self.assertEqual(result['requiredReports'], 1)

    def test_wrong_package_selector_and_report_both_fail(self):
        with self.assertRaisesRegex(ValueError, 'Unresolved Gradle test selector') as raised:
            self.check("--tests 'example.wrong.ActualTest'", {'example.wrong.ActualTest': 14})
        self.assertIn('Unresolved required JUnit report class', str(raised.exception))

    def test_report_names_do_not_accept_method_or_wildcard_fallback(self):
        for name in ('example.service.ActualTest.method', 'example.service.*Test'):
            with self.subTest(name=name), self.assertRaisesRegex(ValueError, 'Unresolved required JUnit report'):
                self.check("--tests 'example.service.ActualTest'", {name: 14})

    def test_selector_does_not_drop_multiple_nonexistent_components(self):
        with self.assertRaisesRegex(ValueError, 'Unresolved Gradle test selector'):
            self.check("--tests 'example.service.ActualTest.Missing.method'")

    def test_declaration_package_overrides_file_path(self):
        self.source.write_text('package example.renamed;\nclass ActualTest {}\n')
        with self.assertRaisesRegex(ValueError, 'Unresolved Gradle test selector'):
            self.check("--tests 'example.service.ActualTest'")

    def test_matching_filename_without_class_declaration_is_rejected(self):
        self.source.write_text('package example.service;\nclass AnotherTest {}\n')
        with self.assertRaisesRegex(ValueError, 'No Java test classes'):
            self.check("--tests 'example.service.ActualTest'")

    def test_missing_selectors_or_report_map_fails_closed(self):
        with self.assertRaisesRegex(ValueError, 'No Gradle --tests'):
            self.check('')
        self.workflow.write_text("run: ./gradlew test --tests 'example.service.ActualTest'\n")
        with self.assertRaisesRegex(ValueError, 'No required JUnit report map'):
            guard.check_workflow(self.root, self.workflow)


if __name__ == '__main__':
    unittest.main()
