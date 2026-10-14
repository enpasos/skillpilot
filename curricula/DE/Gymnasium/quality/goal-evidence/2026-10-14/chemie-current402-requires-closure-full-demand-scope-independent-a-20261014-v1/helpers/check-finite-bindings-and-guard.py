import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import jsonschema

review = Path(sys.argv[1])
spec = importlib.util.spec_from_file_location('stock_validate_schemas', 'scripts/validate_schemas.py')
stock = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stock)
schema = json.loads(Path('docs/landscape-runtime.schema.json').read_text())
manifest = json.loads((review / 'INPUTS.exact-whole-original-primary-policy-and-provenance-bindings.actual.json').read_text())
bindings = []
for binding in manifest['wholeOriginalInputs']:
    path = Path(binding['path'])
    raw = path.read_bytes()
    assert len(raw) == binding['bytes']
    assert 'sha256:' + hashlib.sha256(raw).hexdigest() == binding['rawSHA256']
    if path.suffix == '.json' or path.name.endswith('.json.snapshot'):
        json.loads(raw)
    bindings.append(binding['path'])
frozen = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current402-native47-finite-slice-technical-20261013-v1/candidate/canonical523.current402.keep47-held-images-retained.inactive.json')
raw = frozen.read_bytes()
assert hashlib.sha256(raw).hexdigest() == 'b913c70321ba68aadd6e7dda2779085a81fe8b64991839422072f3cbdc96bd9e'
assert raw == Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_bytes()
jsonschema.validate(json.loads(raw), schema)
parsed = []
rows = []
for path in sorted(review.rglob('*')):
    if path.suffix == '.json':
        assert stock.validate_file(str(path), schema)
        json.loads(path.read_text())
        parsed.append({'path': str(path), 'parsedJSON': True})
    elif path.suffix == '.jsonl':
        rows = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
        assert len(rows) == 24
        parsed.append({'path': str(path), 'parsedJSONLRecords': 24})
finding = json.loads(Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current402-source-discovery-and-original-obligations-technical-20261013-v1/FINDING.exact58-target-scope-versus-source-evidence-and12-original-obligations.actual.json').read_text())
expected = {(row['jurisdiction'], row['goalId']) for row in finding['unsupported58SourceCausePartition']['requiresOnly']}
actual = {(row['jurisdiction'], row['goalId']) for row in rows}
assert actual == expected and len(actual) == 24
errors = stock.curriculum_symlink_errors('.')
assert not errors, errors
files = [str(path) for path in review.rglob('*') if path.is_file()]
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(files) + '\n', text=True, capture_output=True)
assert ignored.returncode in [0, 1]
assert not ignored.stdout.strip(), ignored.stdout
symlinks = [str(path) for path in review.rglob('*') if path.is_symlink()]
assert not symlinks
result = {
    'schemaVersion': 1,
    'checkedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'stockValidator': 'scripts/validate_schemas.py:curriculum_symlink_errors',
    'globalCurriculumSymlinkErrors': errors,
    'globalGuard': 'PASS',
    'ownRootSymlinks': symlinks,
    'ignoredOwnFiles': ignored.stdout.splitlines(),
    'stockQualityArtifactJSONParsing': 'PASS',
    'finiteJSONAndJSONLParsed': parsed,
    'exact24CurrentClosureTuplesMatchedWithoutDuplicates': True,
    'allOriginalInputBindingsVerified': bindings,
    'canonicalWhole523RuntimeSchema': 'PASS',
    'schemaPath': 'docs/landscape-runtime.schema.json',
    'sourceFrozen402CanonicalRawSHA256': hashlib.sha256(raw).hexdigest(),
    'activeCanonicalExactlyEqualsFrozenSnapshotAtCheck': True,
    'activeEditsByReviewer': False,
    'noFullBuildRun': True,
}
(review / 'CHECK.finite-parse-stock-schema-global-symlink-and-preservation.actual.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'guard': 'PASS', 'canonicalRuntimeSchema': 'PASS', 'finiteParsed': len(parsed), 'inputBindings': len(bindings), 'exactTupleCount': len(actual)}))
