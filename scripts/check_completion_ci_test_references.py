#!/usr/bin/env python3
"""Resolve workflow test selectors and required JUnit reports before Gradle runs."""

# SPDX-License-Identifier: Apache-2.0
import argparse
import ast
import fnmatch
import io
from pathlib import Path
import re
import tokenize


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WORKFLOW = Path('.github/workflows/assessment-completion.yml')
PACKAGE = re.compile(r'^\s*package\s+([\w.]+)\s*;', re.MULTILINE)
SELECTOR = re.compile(r'''(?<!\S)--tests(?:\s+|=)(?:'([^'\n]+)'|"([^"\n]+)"|([^\s]+))''')
REQUIRED = re.compile(r'^\s*required\s*=\s*(\{)', re.MULTILINE)


def java_test_classes(root):
    classes = set()
    for source in (root / 'backend/src/test/java').rglob('*.java'):
        text = source.read_text(encoding='utf-8')
        # Package and class declarations are authoritative, rather than a guessed path.
        text = re.sub(r'/\*.*?\*/|//[^\n]*', '', text, flags=re.DOTALL)
        package = PACKAGE.search(text)
        declaration = re.search(r'\b(?:class|interface|enum|record)\s+' + re.escape(source.stem) + r'\b', text)
        if package and declaration:
            classes.add(f'{package[1]}.{source.stem}')
    if not classes:
        raise ValueError('No Java test classes found')
    return classes


def required_report_names(text):
    names = []
    for match in REQUIRED.finditer(text):
        literal = text[match.start(1):]
        lines = literal.splitlines(keepends=True)
        depth = 0
        for token in tokenize.generate_tokens(io.StringIO(literal).readline):
            if token.type == tokenize.OP:
                if token.string in '{[(':
                    depth += 1
                elif token.string in '}])':
                    depth -= 1
                if depth == 0:
                    row, column = token.end
                    expression = ''.join(lines[:row - 1]) + lines[row - 1][:column]
                    parsed = ast.parse(expression, mode='eval').body
                    required = ast.literal_eval(parsed)
                    if not isinstance(required, dict) or not required:
                        raise ValueError('Required report map must be a nonempty dictionary')
                    keys = [ast.literal_eval(key) for key in parsed.keys]
                    if len(keys) != len(set(keys)):
                        raise ValueError('Duplicate required report class')
                    if any(not isinstance(name, str) or type(minimum) is not int or minimum < 1
                           for name, minimum in required.items()):
                        raise ValueError('Required reports need class names and positive test minimums')
                    names.extend(required)
                    break
        else:
            raise ValueError('Unterminated required report map')
    if not names:
        raise ValueError('No required JUnit report map found')
    return names


def selector_classes(selector, classes):
    matches = {name for name in classes if fnmatch.fnmatchcase(name, selector)}
    if not matches and '.' in selector:
        # Gradle also permits Class.method and Class.*method* filters. Remove
        # exactly one method component; never fall back through package ancestors.
        class_selector, _ = selector.rsplit('.', 1)
        matches = {name for name in classes if fnmatch.fnmatchcase(name, class_selector)}
    return matches


def check_workflow(root, workflow):
    classes = java_test_classes(root)
    text = workflow.read_text(encoding='utf-8')
    selectors = [next(value for value in match.groups() if value is not None)
                 for match in SELECTOR.finditer(text)]
    if not selectors:
        raise ValueError('No Gradle --tests selectors found')
    reports = required_report_names(text)
    errors = [f'Unresolved Gradle test selector: {selector}'
              for selector in selectors if not selector_classes(selector, classes)]
    errors.extend(f'Unresolved required JUnit report class: {name}'
                  for name in reports if name not in classes)
    if errors:
        raise ValueError('\n'.join(errors))
    return {'selectors': len(selectors), 'requiredReports': len(reports), 'javaTestClasses': len(classes)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--workflow', type=Path, default=DEFAULT_WORKFLOW)
    args = parser.parse_args()
    workflow = args.workflow if args.workflow.is_absolute() else args.root / args.workflow
    try:
        counts = check_workflow(args.root, workflow)
    except (OSError, SyntaxError, ValueError, tokenize.TokenError) as error:
        parser.exit(1, f'{error}\n')
    print(f"Workflow test references valid: {counts['selectors']} selectors, "
          f"{counts['requiredReports']} required reports, {counts['javaTestClasses']} Java test classes")


if __name__ == '__main__':
    main()
