#!/usr/bin/env python3
"""Retry previously failing tests first, then run every backend gate."""

# SPDX-License-Identifier: Apache-2.0
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from xml.etree import ElementTree


CLASS_NAME = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*")
MAX_MANIFEST_BYTES = 256 * 1024
MAX_FAILED_SELECTORS = 512
METHOD_DISPLAY = re.compile(r"([A-Za-z_$][A-Za-z0-9_$]*)\(\)")


def valid_class_name(value):
    return isinstance(value, str) and len(value) <= 256 and CLASS_NAME.fullmatch(value) is not None


def read_failed_selectors(manifest):
    """The cache is advisory; unusable input always falls back to the full suite."""
    try:
        if manifest.stat().st_size > MAX_MANIFEST_BYTES:
            return []
        data = json.loads(manifest.read_text(encoding="utf-8"))
        if not isinstance(data, dict) or type(data.get("schemaVersion")) is not int or data["schemaVersion"] != 1:
            return []
        selectors = data.get("failedSelectors")
        if not isinstance(selectors, list) or len(selectors) > MAX_FAILED_SELECTORS:
            return []
        if not all(valid_class_name(name) for name in selectors):
            return []
        return sorted(set(selectors))
    except (OSError, UnicodeError, ValueError):
        return []


def write_failed_selectors(manifest, selectors):
    manifest.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=manifest.parent, delete=False) as stream:
        temporary = Path(stream.name)
        json.dump({"schemaVersion": 1, "failedSelectors": sorted(set(selectors))}, stream, indent=2)
        stream.write("\n")
    try:
        temporary.replace(manifest)
    finally:
        temporary.unlink(missing_ok=True)


def persist_advisory_selectors(manifest, selectors):
    try:
        write_failed_selectors(manifest, selectors)
        return True
    except OSError:
        print("Warning: could not write the advisory backend failure manifest.", flush=True)
        return False


def current_junit_failures(reports):
    selectors = set()
    valid_reports = 0
    for report in sorted(reports.glob("TEST-*.xml")):
        try:
            root = ElementTree.parse(report).getroot()
        except (OSError, ElementTree.ParseError):
            print("Ignoring an unreadable advisory JUnit report.", flush=True)
            continue
        if root.tag not in {"testsuite", "testsuites"}:
            print("Ignoring an advisory XML file that is not a JUnit report.", flush=True)
            continue
        valid_reports += 1
        for suite in root.iter("testsuite"):
            concrete = set()
            for case in suite.findall("testcase"):
                if case.find("failure") is None and case.find("error") is None:
                    continue
                name = case.get("classname")
                if valid_class_name(name):
                    method = METHOD_DISPLAY.fullmatch(case.get("name", ""))
                    concrete.add(f"{name}.{method[1]}" if method else name)
            selectors.update(concrete)
            # Only fall back to a whole class for suite-level errors without
            # usable failed testcases; otherwise it defeats method priority.
            try:
                failed = int(suite.get("failures", "0")) + int(suite.get("errors", "0")) > 0
            except ValueError:
                failed = False
            if not concrete and failed and valid_class_name(suite.get("name")):
                selectors.add(suite.get("name"))
    return sorted(selectors), valid_reports


def failed_selectors_from_junit(reports):
    return current_junit_failures(reports)[0]


def current_test_source(backend, name):
    # JUnit nested classes select their current outer source, without parsing
    # parameterized method display names or trusting cached shell patterns.
    outer, nested, remainder = name.partition("$")
    if nested and "." in remainder:
        return None
    outer = outer.replace(".", "/")
    for directory, suffix in [("src/test/java", ".java"), ("src/test/kotlin", ".kt")]:
        source = backend / directory / f"{outer}{suffix}"
        try:
            if source.is_file():
                return source
        except OSError:
            continue
    return None


def current_test_selector(backend, selector):
    source = current_test_source(backend, selector)
    if source:
        return current_class_selector(source, selector)
    class_name, _, method_name = selector.rpartition(".")
    source = current_test_source(backend, class_name)
    if not source:
        return None
    current_class = current_class_selector(source, class_name)
    if current_class != class_name:
        return current_class
    # This is deliberately only a declaration witness, not a Java parser.
    # An absent or unfamiliar declaration safely retries the current class.
    try:
        text = source.read_text(encoding="utf-8")
    except (OSError, UnicodeError):
        return class_name
    declaration = re.compile(
        rf"(?m)^\s*(?:(?:public|protected|private|static|final)\s+)*"
        rf"(?:void|fun)\s+{re.escape(method_name)}\s*\("
    )
    return selector if declaration.search(text) else class_name


def current_class_selector(source, name):
    outer, separator, nested = name.partition("$")
    if not separator:
        return name
    try:
        text = source.read_text(encoding="utf-8")
    except (OSError, UnicodeError):
        return outer
    for nested_name in nested.split("$"):
        declaration = re.compile(
            rf"\b(?:class|interface|enum|record|object)\s+{re.escape(nested_name)}(?=[\s<{{(:])"
        )
        if not declaration.search(text):
            return outer
    return name


def test_reports_directory(backend):
    configured = os.environ.get("SKILLPILOT_BACKEND_BUILD_DIR")
    build = Path(configured) if configured else Path("build")
    if not build.is_absolute():
        build = backend / build
    return build / "test-results" / "test"


def run_backend_ci(backend, manifest, reports=None, run=None):
    reports = reports or test_reports_directory(backend)
    execute = run or subprocess.run
    cached = read_failed_selectors(manifest)
    previous = sorted({current for name in cached if (current := current_test_selector(backend, name))})
    if previous != cached:
        print("Adjusted advisory selectors to current test sources.", flush=True)
    priority_attempted = False
    priority_succeeded = False
    try:
        # A failed compilation must not recycle XML from another invocation.
        if reports.exists():
            shutil.rmtree(reports)
        if previous:
            print(f"Running {len(previous)} previously failing backend test selectors first.", flush=True)
            command = ["./gradlew", "test", "--fail-fast"]
            for name in previous:
                command.extend(["--tests", name])
            priority_attempted = True
            result = execute(command, cwd=backend, shell=False, check=False)
            if result.returncode != 0:
                return result.returncode
            priority_succeeded = True
            # Clear both advisory failures and generated reports before the
            # mandatory unfiltered suite, even if it fails before running tests.
            persist_advisory_selectors(manifest, [])
            if reports.exists():
                shutil.rmtree(reports)
        print("Running the complete backend check without test filters.", flush=True)
        return execute(["./gradlew", "check"], cwd=backend, shell=False, check=False).returncode
    finally:
        try:
            current, valid_reports = current_junit_failures(reports)
        except OSError:
            current, valid_reports = [], 0
            print("Warning: could not read the advisory backend JUnit reports.", flush=True)
        if priority_attempted and not priority_succeeded:
            # --fail-fast may stop before another known failure is exercised.
            current = sorted(set(current).union(previous))
            if valid_reports == 0:
                print("No current JUnit reports; retained prior advisory selectors after the failed invocation.", flush=True)
        if persist_advisory_selectors(manifest, current):
            print(f"Recorded {len(current)} backend failure-priority hints.", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backend-dir", type=Path, default=Path(__file__).resolve().parents[1] / "backend")
    parser.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()
    try:
        return run_backend_ci(args.backend_dir.resolve(), args.manifest.resolve())
    except OSError as error:
        print(f"Backend CI runner failed: {error}", flush=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
