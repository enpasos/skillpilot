# SPDX-License-Identifier: Apache-2.0
"""Read-only normal binding/JSON/source membership validation for sealed Bio8v4."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[7]
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
OWN = BASE / 'biologie-bio8-v4-targeted-genuine-independent-a-20261010-v1'
AUTHOR = BASE / 'biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
errors = []
verified = {}
parsed = {}
committable = set(subprocess.check_output(
    ['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--'],
    cwd=ROOT).decode().split('\0'))


def check_binding(b):
    relative = b['path']
    p = ROOT / relative
    if Path(relative).is_absolute() or '..' in Path(relative).parts:
        errors.append({'type': 'nonportable_binding', 'path': relative})
        return
    if not p.is_file() or p.is_symlink():
        errors.append({'type': 'nonregular_binding', 'path': relative})
        return
    actual = {'path': relative, 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(),
              'bytes': p.stat().st_size}
    if actual['sha256'] != b['sha256'] or actual['bytes'] != b['bytes']:
        errors.append({'type': 'changed_binding', 'expected': b, 'actual': actual})
    if relative not in committable:
        errors.append({'type': 'noncommittable_binding', 'path': relative})
    verified[relative] = actual


def read_json(relative):
    relative = str(relative)
    if relative not in parsed:
        try:
            parsed[relative] = json.loads((ROOT / relative).read_text())
        except (ValueError, OSError) as exc:
            errors.append({'type': 'json_parse', 'path': relative, 'error': str(exc)})
            return None
    return parsed[relative]


author_freeze_path = AUTHOR / 'FINAL.Bio8-targeted-text-source-image-author.freeze.json'
entry_path = AUTHOR / 'neutral-Bio8-targeted-text-source-image-author.portable-final.entry.json'
sealed = [
    (author_freeze_path, '34cf86ae2468236d9cc4945f5b3020d155516c545398cdff117ffd344c29501f'),
    (entry_path, '1fe501ac051b373b15244bfb2312bf0383b939ea384d53152801c7ef120cd53d'),
    (OWN / 'FIRST.independent-a.scientific-findings.json',
     '949f6c29956af591c2bf0b21d71d3ff6c9be1d3f62f5b30e178f4a449cf29804'),
    (OWN / 'AFTER-FIRST.inherited-protected-three.current-context.decisions.json',
     'd32885e80c3a57867d37cf9f2f5ae6e2472bfb69ca2d0043de876ce0178b9a90'),
]
for relative, expected in sealed:
    p = ROOT / relative
    check_binding({'path': str(relative), 'sha256': 'sha256:' + expected,
                   'bytes': p.stat().st_size})

author_freeze = read_json(author_freeze_path)
for b in author_freeze['bindings']:
    check_binding(b)
check_binding(author_freeze['entry'])
for fn in ['FIRST.independent-a.freeze.json', 'AFTER-FIRST.inherited-protected-three.freeze.json']:
    freeze = read_json(OWN / fn)
    for key in ['first', 'addendum']:
        if key in freeze:
            check_binding(freeze[key])
    for key in ['inputBindings', 'ownEvidenceBindings', 'bindings']:
        for b in freeze.get(key, []):
            check_binding(b)

# Parse every bound JSON/JSONL and all own output without reading report text.
parse_paths = set(verified) | {
    str(p.relative_to(ROOT)) for p in (ROOT / OWN).rglob('*')
    if p.is_file() and p.suffix in {'.json', '.jsonl'}
}
jsonl_line_count = 0
for relative in sorted(parse_paths):
    p = ROOT / relative
    if p.suffix == '.json':
        read_json(relative)
    elif p.suffix == '.jsonl':
        for number, line in enumerate(p.read_text().splitlines(), 1):
            if not line.strip():
                continue
            try:
                json.loads(line)
                jsonl_line_count += 1
            except ValueError as exc:
                errors.append({'type': 'jsonl_parse', 'path': relative,
                               'line': number, 'error': str(exc)})

# Exact full source witnesses: this is membership, not whole-operator clearance.
source = read_json(AUTHOR / 'sources/whole31-pairs-and35-direct-operators.current-author.json')
source_checks = []
for r in source['records']:
    mapping = read_json(r['wholeMapping']['path'])
    extraction = read_json(r['wholeExtraction']['path'])
    checks = {
        'wholeLiteralSourceGoalExact': r['wholeLiteralSourceGoal'] in extraction['sourceGoals'],
        'wholeMappingRecordExact': r['wholeMappingRecord'] in mapping['mappings'],
        'wholeSourceDecisionExact': r['wholeSourceDecision'] in mapping['decisions'],
        'canonicalEndpointExact': r['wholeMappingRecord']['canonicalGoalId'] == r['canonicalGoalId'],
        'sourceIdExact': r['wholeMappingRecord']['legacyGoalId'] == r['wholeLiteralSourceGoal']['id'],
    }
    for key in ['wholeMapping', 'wholeExtraction', 'actualPrimaryBytes']:
        check_binding(r[key])
    if not all(checks.values()):
        errors.append({'type': 'whole_source_membership', 'canonicalGoalId': r['canonicalGoalId'],
                       'checks': checks})
    source_checks.append({'canonicalGoalId': r['canonicalGoalId'],
                          'sourceGoalId': r['wholeLiteralSourceGoal']['id'], 'checks': checks})

# Validate our D decisions through the actual normal native record schema.
import jsonschema
schema_path = AUTHOR / 'native/affected-current-native/round-a/contracts/goal-description-review-record.schema.json'
validator = jsonschema.Draft202012Validator(read_json(schema_path))
d_records = 0
for fn in ['D3.independent-a.records.jsonl', 'inherited-protected3.D.independent-a.records.jsonl']:
    for number, line in enumerate((ROOT / OWN / fn).read_text().splitlines(), 1):
        if line.strip():
            d_records += 1
            for exc in validator.iter_errors(json.loads(line)):
                errors.append({'type': 'normal_D_schema', 'path': str(OWN / fn),
                               'line': number, 'error': exc.message})

spec = importlib.util.spec_from_file_location('skillpilot_validate_schemas', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(ROOT)
for error in symlink_errors:
    errors.append({'type': 'curriculum_symlink_error', 'error': error})

receipt = {
    'schemaVersion': 1,
    'role': 'normal_technical_validation_after_sealed_FIRST',
    'authorFreezeBindings': len(author_freeze['bindings']),
    'uniqueExactRegularCommittableBindings': len(verified),
    'parsedJSONFiles': len(parsed), 'parsedJSONLLines': jsonl_line_count,
    'normalDSchemaRecordCount': d_records, 'wholeSourceRecordCount': len(source_checks),
    'wholeSourceRecordChecks': source_checks,
    'curriculumSymlinkErrors': symlink_errors,
    'sourceMembershipEqualsWholeOperatorClearance': False,
    'protected353ActiveEquality': False,
    'protected353ActiveDifferencesAlreadyPreciselyReviewed': 3,
    'humanApproval': 0, 'humanTrial': False, 'strictActiveGain': 0,
    'errors': errors, 'errorCount': len(errors),
    'verifiedBindings': sorted(verified.values(), key=lambda b: b['path']),
}
(ROOT / OWN / 'FINAL.normal-technical-closure.actual.json').write_text(
    json.dumps(receipt, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({k: v for k, v in receipt.items()
                  if k not in {'wholeSourceRecordChecks', 'verifiedBindings'}},
                 indent=2, ensure_ascii=False))
sys.exit(1 if errors else 0)
