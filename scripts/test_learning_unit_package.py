#!/usr/bin/env python3
"""Small exact-byte/closure regression corpus; no full curriculum or image copy."""
import base64
import copy
import hashlib
import json
import tempfile
from pathlib import Path

from jsonschema import Draft202012Validator
import curriculum_learning_unit_artifacts as units


def run() -> None:
    with tempfile.TemporaryDirectory(prefix='learning-unit-package.') as temporary:
        repo = Path(temporary)
        base = repo / 'curricula'
        assert not units.requires_runtime(repo), 'unaffected repositories retain legacy dispatch'
        contract_path = 'DE/Gymnasium/learning-units/fixture.json'
        source_path = 'DE/Gymnasium/learning-units/inputs/fixture.source.json'
        review_path = 'DE/Gymnasium/quality/learning-units/fixture.md'
        raw = {contract_path: b'{\n  "contractId": "unit", "revision": "1"\n}\n',
               source_path: b'{"goals":[]}\n', review_path: 'Unabhängige Prüfung.\n'.encode()}
        for path, content in raw.items():
            destination = base / path
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(content)
        catalog = {'schemaVersion': 1, 'contracts': [{'path': contract_path,
            'sha256': hashlib.sha256(raw[contract_path]).hexdigest(), 'status': 'active',
            'sourceSnapshotPath': source_path,
            'inputs': {path: hashlib.sha256(raw[path]).hexdigest() for path in (source_path, review_path)},
            'assessmentInputs': {}, 'recallInputs': {}}]}
        destination = base / units.CATALOG_PATH
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(catalog, indent=2) + '\n')
        archived = copy.deepcopy(catalog)
        archived['contracts'][0]['status'] = 'archived'
        destination.write_text(json.dumps(archived))
        assert units.requires_runtime(repo), 'archived recognition must select a capable consumer without active unit metadata'
        destination.write_text('{}')
        try:
            units.requires_runtime(repo)
        except ValueError:
            pass
        else:
            raise AssertionError('A malformed catalog must not silently dispatch to a legacy consumer')
        destination.write_text(json.dumps(catalog, indent=2) + '\n')
        landscape = {'programUnits': [{'id': 'unit', 'learningUnit': {'contractId': 'unit', 'revision': '1'}}]}
        documents, inputs = units.compile_documents(repo, {'catalogPath': 'curricula/' + units.CATALOG_PATH,
            'outputDirectory': 'data/learning-units'}, landscape)
        assert len(documents) == 4 and len(inputs) == 4
        checks = 0
        def rejected(changed):
            nonlocal checks
            try:
                units.validate_package_documents(changed, landscape)
            except (ValueError, KeyError):
                checks += 1
                return
            raise AssertionError('Invalid learning-unit package was accepted')
        rejected(documents[1:])
        rejected(documents + [documents[0]])
        rejected(documents[:-1])
        changed = copy.deepcopy(documents)
        changed[1][3]['definition']['contentBase64'] = base64.b64encode(b'altered').decode()
        rejected(changed)
        changed = copy.deepcopy(documents)
        changed[1][3]['definition']['sourcePath'] = 'DE/../escape.json'
        rejected(changed)
        changed = copy.deepcopy(documents)
        changed[1][3]['id'] = 'wrong'
        rejected(changed)
        # Exact source bytes, including whitespace and final newline, survive a package roundtrip.
        for _role, path, _output, wrapper in documents:
            assert base64.b64decode(wrapper['definition']['contentBase64']) == (base / path).read_bytes()
        # A consumer pinned to the immutable old schema rejects the new metadata rather than discarding it.
        schema = json.loads((Path(__file__).resolve().parents[1] / 'contracts/curriculum-package/v1/compiled-landscape.schema.json').read_bytes())
        unit_schema = {**schema['$defs']['programUnit'], '$defs': schema['$defs']}
        assert not Draft202012Validator(unit_schema).is_valid(landscape['programUnits'][0] | {'kind': 'module', 'label': 'Unit'})
        # New consumers preserve explicit empty required-child bindings, without changing omission semantics.
        metadata = {'contractId': 'unit', 'revision': '1', 'placementRevision': '1',
                    'promise': {'de': 'Du kannst projizieren.'}, 'introduction': {'de': 'Untersuche Schatten.'}}
        for schema_path in ('docs/landscape-runtime.schema.json',
                            'contracts/curriculum-package/v1.2/compiled-landscape.schema.json'):
            schema = json.loads((Path(__file__).resolve().parents[1] / schema_path).read_bytes())
            validator = Draft202012Validator({**schema['$defs']['programUnit'], '$defs': schema['$defs']})
            candidate = {'id': 'unit', 'kind': 'module', 'label': 'Unit', 'learningUnit': metadata}
            assert validator.is_valid(candidate)
            assert validator.is_valid(candidate | {'learningUnit': metadata | {'requiredChildUnitIds': []}})
            assert validator.is_valid(candidate | {'learningUnit': metadata | {'requiredChildUnitIds': ['child']}})
            assert not validator.is_valid(candidate | {'learningUnit': metadata | {'requiredChildUnitIds': ['child', 'child']}})
            assert not validator.is_valid(candidate | {'learningUnit': metadata | {'requiredChildUnitIds': [False]}})
        print(f'Learning-unit package: exact-byte roundtrip, closed input set, old-consumer rejection, required-child schema parity and {checks} adversarial mutations passed.')


if __name__ == '__main__':
    run()
