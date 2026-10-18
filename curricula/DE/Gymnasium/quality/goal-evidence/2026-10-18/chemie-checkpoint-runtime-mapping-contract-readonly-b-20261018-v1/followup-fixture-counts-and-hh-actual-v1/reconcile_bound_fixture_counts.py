#!/usr/bin/env python3
"""Reconcile only pure total/exact/partial counts in the 29 observed failing Chemistry fixtures."""
import datetime
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[8]
OUT = pathlib.Path(__file__).resolve().parent
TEST = ROOT / 'backend/src/test/java/com/skillpilot/backend/landscape/GoalMappingRepositoryFixtureTest.java'
before = TEST.read_text()
initial = json.loads((OUT.parent / 'integration-actual-v1/BACKEND.after-alias-fix.actual-result.json').read_text())
methods = [v['test'].removesuffix('()') for v in initial['classes'][0]['failedTests'] if v['expectedActual'] is not None]
assert len(methods) == 29 and all('Chemistry' in v for v in methods)
expressions = dict(re.findall(r'private static final Path (\w+)\s*=\s*(.*?);', before, re.S))


def resolve_path(name):
    value = expressions[name].strip()
    if m := re.fullmatch(r'Path\.of\("([^"]+)"\)', value):
        return (ROOT / 'backend' / m[1]).resolve()
    if m := re.fullmatch(r'(\w+)\s*\.resolve\(\s*"([^"]+)"\s*\)', value):
        return resolve_path(m[1]) / m[2]
    raise ValueError((name, value))


patterns = [
    ('total', re.compile(r'assertThat\(file\.getMappings\(\)\)\.hasSize\((\d+)\);')),
    ('filtered', re.compile(r'assertThat\(file\.getMappings\(\)\)\.filteredOn\(entry -> "(exact|partial)"\.equals\(entry\.getMatchType\(\)\)\)\.hasSize\((\d+)\);')),
]
replacements = []
checks = []
for method in methods:
    match = re.search(r'\bvoid ' + method + r'\([^)]*\)[^{]*\{', before)
    assert match
    end = before.find('\n    @Test', match.end())
    body = before[match.start():end if end >= 0 else len(before)]
    fixture = re.search(r'readValue\((\w+)\.toFile\(\)', body)
    path = resolve_path(fixture[1])
    value = path.read_bytes()
    mappings = json.loads(value)['mappings']
    counts = {'total': len(mappings), 'exact': sum(v['matchType'] == 'exact' for v in mappings), 'partial': sum(v['matchType'] == 'partial' for v in mappings)}
    assert counts['total'] == counts['exact'] + counts['partial']
    for kind, pattern in patterns:
        for assertion in pattern.finditer(body):
            count_type = kind if kind == 'total' else assertion[1]
            group = 1 if kind == 'total' else 2
            previous = int(assertion[group])
            actual = counts[count_type]
            if previous != actual:
                replacements.append((match.start() + assertion.start(group), match.start() + assertion.end(group), str(actual)))
            checks.append({'method': method, 'countType': count_type, 'beforeExpected': previous, 'actualMappingRows': actual, 'newExpected': actual, 'changed': previous != actual, 'mappingFile': {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(value).hexdigest(), 'bytes': len(value)}})

after = before
for a, b, replacement in sorted(replacements, reverse=True):
    after = after[:a] + replacement + after[b:]


def mask_counts(value):
    value = re.sub(r'(assertThat\(file\.getMappings\(\)\)\.hasSize\()\d+(\);)', r'\1COUNT\2', value)
    return re.sub(r'(assertThat\(file\.getMappings\(\)\)\.filteredOn\(entry -> "(?:exact|partial)"\.equals\(entry\.getMatchType\(\)\)\)\.hasSize\()\d+(\);)', r'\1COUNT\2', value)


assert mask_counts(before) == mask_counts(after)
assert re.findall(r'@Test\s+void (\w+)\(', before) == re.findall(r'@Test\s+void (\w+)\(', after)
assert TEST.read_text() == before
TEST.write_text(after)
record = {'role': 'authorized static pre-final reconciliation of pure total/exact/partial counts in the 29 actually failed Chemistry fixture methods', 'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'testPath': str(TEST.relative_to(ROOT)), 'beforeSha256': hashlib.sha256(before.encode()).hexdigest(), 'afterSha256': hashlib.sha256(after.encode()).hexdigest(), 'affectedMethods': len(methods), 'pureCountAssertionsChecked': len(checks), 'countConstantsChanged': len(replacements), 'allOtherBytesUnchangedAfterMaskingOnlyPureCountLiterals': True, 'explicitIdentityTypeAndRetiredAssertionsUnchanged': True, 'same87TestMethods': len(re.findall(r'@Test\s+void (\w+)\(', after)) == 87, 'productionDataChanged': False, 'checks': checks}
(OUT / 'COUNTS.static-total-exact-partial.before-expected-actual.receipt.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: record[k] for k in ['affectedMethods', 'pureCountAssertionsChecked', 'countConstantsChanged', 'explicitIdentityTypeAndRetiredAssertionsUnchanged', 'same87TestMethods']}, indent=2))
