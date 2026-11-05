"""Runtime 1.2 learning-unit sidecars. Source bytes and logical paths stay immutable.

This module validates static package closure, never learner recognition. The
backend remains the authority for assessment semantics and effective mastery.
"""
from __future__ import annotations

import base64
import hashlib
import json
import re
from pathlib import Path, PurePosixPath
from typing import Any, Mapping

PROFILE_ID = 'full-standalone-learning-units-v1'
CAPABILITY = 'learningUnitRecognitionV1'
NAMESPACE = 'https://skillpilot.com/schemas/curriculum-package/v1.2/'
CATALOG_SCHEMA_ID = NAMESPACE + 'runtime-catalog.schema.json'
ARTIFACT_SCHEMA_ID = NAMESPACE + 'learning-unit-artifact.schema.json'
LANDSCAPE_SCHEMA_ID = NAMESPACE + 'compiled-landscape.schema.json'
ROLES = {kind: 'learning-unit-' + kind for kind in ('catalog', 'contract', 'input')}
CATALOG_PATH = 'DE/Gymnasium/learning-units/catalog.json'



def requires_runtime(repo: Path) -> bool:
    """Retain archived recognition even after the last active unit is removed."""
    catalog = repo / 'curricula' / CATALOG_PATH
    if catalog.is_file():
        document = _json(catalog.read_bytes())
        if not isinstance(document, dict) or document.get('schemaVersion') != 1 or not isinstance(document.get('contracts'), list):
            raise ValueError('Invalid learning-unit catalog for runtime dispatch')
        if document['contracts']:
            return True
    landscape = repo / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
    return landscape.is_file() and any(unit.get('learningUnit') for unit in _json(landscape.read_bytes()).get('programUnits', []))


def extended_directory(directory: Path) -> bool:
    return (directory / 'profiles' / (PROFILE_ID + '.profile.json')).is_file()


def extra_schemas(directory: Path) -> tuple[tuple[str, Path], ...]:
    return tuple((NAMESPACE + name, directory / name) for name in (
        'runtime-catalog.schema.json', 'compiled-landscape.schema.json', 'learning-unit-artifact.schema.json'))


def source_path(value: Any) -> str:
    if not isinstance(value, str) or not re.fullmatch(r'DE/[A-Za-z0-9_./+-]+', value) or len(value) > 240:
        raise ValueError('Invalid curriculum-relative learning-unit source path')
    path = PurePosixPath(value)
    if any(part in ('', '.', '..') for part in value.split('/')) or str(path) != value:
        raise ValueError('Non-canonical learning-unit source path')
    return value


def _read(repo: Path, path: str) -> bytes:
    source = repo / 'curricula' / source_path(path)
    if source.is_symlink() or not source.resolve().is_relative_to((repo / 'curricula').resolve()) or not source.is_file():
        raise ValueError(f'Learning-unit source is not a contained regular curriculum file: {path}')
    return source.read_bytes()


def _json(raw: bytes) -> Any:
    def unique(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f'Duplicate learning-unit JSON key: {key}')
            result[key] = value
        return result
    return json.loads(raw, object_pairs_hook=unique, parse_constant=lambda _: (_ for _ in ()).throw(ValueError('Non-finite JSON')))


def _dependencies(catalog: Mapping[str, Any]) -> dict[str, str]:
    if catalog.get('schemaVersion') != 1 or not isinstance(catalog.get('contracts'), list):
        raise ValueError('Invalid learning-unit catalog')
    expected: dict[str, str] = {}
    for entry in catalog['contracts']:
        if not isinstance(entry, dict) or entry.get('status') not in ('active', 'archived'):
            raise ValueError('Invalid learning-unit catalog contract entry')
        pins = {entry['path']: entry['sha256'], **entry.get('inputs', {})}
        for path, digest in pins.items():
            source_path(path)
            if not isinstance(digest, str) or not re.fullmatch('[a-f0-9]{64}', digest):
                raise ValueError('Invalid learning-unit input digest')
            if path in expected and expected[path] != digest:
                raise ValueError('Conflicting learning-unit source pins')
            expected[path] = digest
        if entry.get('sourceSnapshotPath') not in entry.get('inputs', {}):
            raise ValueError('Learning-unit source snapshot is not pinned')
        for assessment in entry.get('assessmentInputs', {}).values():
            if any(assessment.get(field) not in pins for field in ('taskPath', 'rubricPath')):
                raise ValueError('Learning-unit assessment input is not pinned')
        for paths in entry.get('recallInputs', {}).values():
            if not isinstance(paths, list) or any(path not in pins for path in paths):
                raise ValueError('Learning-unit recall input is not pinned')
    return expected


def compile_documents(repo: Path, configuration: Mapping[str, Any], source_landscape: Mapping[str, Any]) -> tuple[list[tuple[str, str, str, Any]], list[dict[str, Any]]]:
    if configuration != {'catalogPath': 'curricula/' + CATALOG_PATH, 'outputDirectory': 'data/learning-units'}:
        raise ValueError('Unsupported learning-unit build configuration')
    catalog_bytes = _read(repo, CATALOG_PATH)
    catalog = _json(catalog_bytes)
    pins = _dependencies(catalog)
    kinds = {entry['path']: 'contract' for entry in catalog['contracts']}
    documents = []
    inputs = []
    for path in [CATALOG_PATH, *sorted(pins)]:
        raw = catalog_bytes if path == CATALOG_PATH else _read(repo, path)
        sha = hashlib.sha256(raw).hexdigest()
        if path != CATALOG_PATH and pins[path] != sha:
            raise ValueError(f'Stale learning-unit source input: {path}')
        kind = 'catalog' if path == CATALOG_PATH else kinds.get(path, 'input')
        artifact_path = 'data/learning-units/' + kind + '/' + hashlib.sha256(path.encode()).hexdigest()[:24] + '.json'
        wrapper = {'artifactFormatVersion': 1, 'artifactKind': kind, 'id': path,
                   'definition': {'sourcePath': path, 'sha256': sha, 'contentBase64': base64.b64encode(raw).decode('ascii')}}
        documents.append((ROLES[kind], path, artifact_path, wrapper))
        inputs.append({'sourcePath': 'curricula/' + path, 'sourceSha256': sha, 'artifactPath': artifact_path})
    validate_package_documents(documents, source_landscape)
    return documents, inputs


def validate_package_documents(documents: list[tuple[str, str, str, Any]], landscape: Mapping[str, Any] | None = None) -> None:
    values: dict[str, tuple[str, bytes]] = {}
    for role, logical_id, _path, wrapper in documents:
        if not isinstance(wrapper, dict) or set(wrapper) != {'artifactFormatVersion', 'artifactKind', 'id', 'definition'} or wrapper['artifactFormatVersion'] != 1:
            raise ValueError('Invalid learning-unit artifact envelope')
        kind = wrapper['artifactKind']
        definition = wrapper['definition']
        if ROLES.get(kind) != role or not isinstance(definition, dict) or set(definition) != {'sourcePath', 'sha256', 'contentBase64'}:
            raise ValueError('Invalid learning-unit artifact role/definition')
        path = source_path(definition['sourcePath'])
        if path != logical_id or wrapper['id'] != path or path in values:
            raise ValueError('Duplicate or mismatched learning-unit source identity')
        raw = base64.b64decode(definition['contentBase64'], validate=True)
        if hashlib.sha256(raw).hexdigest() != definition['sha256']:
            raise ValueError('Learning-unit exact source bytes mismatch')
        values[path] = (kind, raw)
    if CATALOG_PATH not in values or values[CATALOG_PATH][0] != 'catalog':
        raise ValueError('Learning-unit catalog sidecar is missing')
    catalog = _json(values[CATALOG_PATH][1])
    pins = _dependencies(catalog)
    if set(values) != {CATALOG_PATH, *pins}:
        raise ValueError('Learning-unit package input closure differs from its catalog')
    active: set[tuple[str, str]] = set()
    for entry in catalog['contracts']:
        path = entry['path']
        if values[path][0] != 'contract':
            raise ValueError('Catalog contract source has the wrong artifact role')
        contract = _json(values[path][1])
        if not isinstance(contract, dict):
            raise ValueError('Learning-unit contract is not an object')
        if entry['status'] == 'active':
            identity = (contract['contractId'], contract['revision'])
            if identity in active:
                raise ValueError('Duplicate active learning-unit contract identity')
            active.add(identity)
    for path, digest in pins.items():
        if path not in values or hashlib.sha256(values[path][1]).hexdigest() != digest:
            raise ValueError('Learning-unit package source pin does not match exact bytes')
    if landscape:
        metadata = {(unit['learningUnit']['contractId'], unit['learningUnit']['revision'])
                    for unit in landscape.get('programUnits', []) if unit.get('learningUnit')}
        if metadata != active:
            raise ValueError('Learning-unit active contracts and landscape metadata differ')
