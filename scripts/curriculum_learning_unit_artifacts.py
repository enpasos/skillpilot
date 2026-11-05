"""Runtime 1.2 learning-unit sidecars. Source bytes and logical paths stay immutable.

This module validates static package closure, never learner recognition. The
backend remains the authority for assessment semantics and effective mastery.
"""
from __future__ import annotations

import base64
import hashlib
import json
import re
import zipfile
from pathlib import Path, PurePosixPath
from typing import Any, Mapping
import curriculum_learning_unit_offers as offer_bindings
import curriculum_learning_unit_semantic_inputs as semantic_inputs

PROFILE_ID = 'full-standalone-learning-units-v1'
CAPABILITY = 'learningUnitRecognitionV1'
OFFER_CAPABILITY = 'learningUnitOfferBindingsV1'
OFFER_PROFILE_ID = 'full-standalone-learning-unit-offers-v1'
OFFER_BUILD_PROFILE_ID = 'de-gymnasium-mathematik-learning-unit-offers-release-model-v1'
NAMESPACE = 'https://skillpilot.com/schemas/curriculum-package/v1.2/'
CATALOG_SCHEMA_ID = NAMESPACE + 'runtime-catalog.schema.json'
OFFER_CATALOG_SCHEMA_ID = NAMESPACE + 'offer-runtime-catalog.schema.json'
ARTIFACT_SCHEMA_ID = NAMESPACE + 'learning-unit-artifact.schema.json'
LANDSCAPE_SCHEMA_ID = NAMESPACE + 'compiled-landscape.schema.json'
OFFER_LANDSCAPE_SCHEMA_ID = NAMESPACE + 'offer-compiled-landscape.schema.json'
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


def extra_schemas(directory: Path, profile_id: str | None = None) -> tuple[tuple[str, Path], ...]:
    names = ('runtime-catalog.schema.json', 'compiled-landscape.schema.json', 'learning-unit-artifact.schema.json')
    if profile_id == OFFER_PROFILE_ID:
        names += ('offer-runtime-catalog.schema.json', 'offer-compiled-landscape.schema.json')
    return tuple((NAMESPACE + name, directory / name) for name in names)


def offered_profile_from_input(path: Path) -> bool:
    """Bounded profile dispatch only; the full validator still authenticates everything.

    An untrusted ID can select only the one software-pinned additive profile.
    Invalid containers fall through to the normal bounded diagnostic path.
    """
    try:
        limit = 64 * 1024 * 1024
        if path.suffix == '.json':
            if path.stat().st_size > limit:
                return False
            raw = path.read_bytes()
        else:
            with zipfile.ZipFile(path) as archive:
                entries = archive.infolist()
                if len(entries) > 60000:
                    return False
                candidates = [entry for entry in entries if re.fullmatch(r'[^/]+/metadata/manifest\.json', entry.filename)]
                if len(candidates) != 1:
                    return False
                entry = candidates[0]
                if entry.file_size > limit or entry.file_size > max(1, entry.compress_size) * 100:
                    return False
                with archive.open(entry) as stream:
                    raw = stream.read(limit + 1)
                if len(raw) > limit:
                    return False
        value = _json(raw)
        return isinstance(value, dict) and value.get('releaseProfile') == OFFER_PROFILE_ID
    except (OSError, ValueError, KeyError, RecursionError, zipfile.BadZipFile):
        return False


def catalog_capabilities(documents: list[tuple[str, str, str, Any]]) -> list[str]:
    catalogs = [wrapper for role, _identity, _path, wrapper in documents if role == ROLES['catalog']]
    if len(catalogs) != 1:
        raise ValueError('Learning-unit artifacts must have exactly one catalog')
    catalog = _json(base64.b64decode(catalogs[0]['definition']['contentBase64'], validate=True))
    return [CAPABILITY, OFFER_CAPABILITY] if 'currentOfferBinding' in catalog else [CAPABILITY]


def has_current_offer(repo: Path, catalog_path: str = CATALOG_PATH) -> bool:
    return 'currentOfferBinding' in _json(_read(repo, catalog_path))


def current_build_profile_id(repo: Path) -> str:
    return OFFER_BUILD_PROFILE_ID if has_current_offer(repo) else 'de-gymnasium-mathematik-learning-units-release-model-v1'


def entry_landscape(repo: Path, profile: Mapping[str, Any]) -> Mapping[str, Any] | None:
    """The entry is an authored definition, never a shortened canonical overview."""
    if 'entryLandscape' not in profile:
        return None
    configuration = profile['entryLandscape']
    entry = _json(_read(repo, configuration['sourcePath'].removeprefix('curricula/')))
    goals = entry.get('goals') if isinstance(entry, dict) else None
    root_id = profile['canonicalLandscape']['rootGoalId']
    if (not isinstance(entry, dict) or entry.get('landscapeId') != configuration['landscapeId']
            or entry.get('landscapeId') == profile['canonicalLandscape']['landscapeId']
            or entry.get('schoolType') != 'Gymnasium'
            or entry.get('frameworkId') != 'canonical-gymnasium-mathematics-entry-v1'
            or not isinstance(goals, list) or len(goals) != 1
            or goals[0].get('id') != configuration['rootGoalId']
            or goals[0].get('id') == root_id or goals[0].get('contains') != [root_id]
            or goals[0].get('requires', []) or goals[0].get('type') != 'cluster'
            or goals[0].get('semanticKind') != 'programStructure'
            or any(goals[0].get(field) for field in ('examData', 'resourceLinks', 'taskContent', 'taskContentEn'))
            or any(entry.get(field) for field in ('programUnits', 'goalPlacements', 'competencyCatalog'))):
        raise ValueError('Invalid explicit Mathematics package entry definition')
    catalog_path = profile['learningUnits']['catalogPath'].removeprefix('curricula/')
    catalog = _json(_read(repo, catalog_path))
    if 'currentOfferBinding' not in catalog:
        raise ValueError('Explicit Mathematics entry requires its current-offer binding')
    binder = _json(_read(repo, catalog['currentOfferBinding']['path']))
    offer_bindings.validate(binder, source_path)
    derivation = offer_bindings.validate_entry_derivation(binder, lambda path: _read(repo, path), _json, source_path)
    if (not derivation or binder['entryDerivation']['path'] != configuration['derivationPath'].removeprefix('curricula/')
            or derivation['entryPath'] != configuration['sourcePath'].removeprefix('curricula/')
            or derivation['entryLandscapeId'] != configuration['landscapeId']
            or derivation['entryRootGoalId'] != configuration['rootGoalId']
            or derivation['mathematicsLandscapeId'] != profile['canonicalLandscape']['landscapeId']
            or derivation['mathematicsRootGoalId'] != root_id):
        raise ValueError('Mathematics entry build selection differs from reviewed derivation')
    return entry


def source_path(value: Any) -> str:
    if not isinstance(value, str) or not re.fullmatch(r'DE/[A-Za-z0-9_./+-]+', value) or len(value) > 240:
        raise ValueError('Invalid curriculum-relative learning-unit source path')
    path = PurePosixPath(value)
    if any(part in ('', '.', '..') for part in value.split('/')) or str(path) != value:
        raise ValueError('Non-canonical learning-unit source path')
    return value


def artifact_identity(path: str) -> str:
    """Keep old IDs byte-exact; a long source locator is not an artifact path."""
    if len(path) <= 180 and re.fullmatch(r'[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*', path):
        return path
    return 'learning-unit-source:sha256:' + hashlib.sha256(path.encode('utf-8')).hexdigest()


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
    if (not isinstance(catalog, dict) or set(catalog) - {'schemaVersion', 'contracts', 'currentOfferBinding'}
            or type(catalog.get('schemaVersion')) is not int or catalog.get('schemaVersion') != 1 or not isinstance(catalog.get('contracts'), list)):
        raise ValueError('Invalid learning-unit catalog')
    expected: dict[str, str] = {}
    for entry in catalog['contracts']:
        if not isinstance(entry, dict) or entry.get('status') not in ('active', 'archived'):
            raise ValueError('Invalid learning-unit catalog contract entry')
        if set(entry) - {'path', 'sha256', 'status', 'sourceSnapshotPath', 'inputs', 'assessmentInputs', 'recallInputs', 'recallBindingSemantics'}:
            raise ValueError('Unsupported learning-unit catalog entry fields')
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
            if (not isinstance(assessment, dict) or not {'taskPath', 'rubricPath'} <= set(assessment)
                    or set(assessment) - {'taskPath', 'rubricPath', 'taskVariants'}):
                raise ValueError('Unsupported assessment input fields')
            if any(assessment.get(field) not in pins for field in ('taskPath', 'rubricPath')):
                raise ValueError('Learning-unit assessment input is not pinned')
        for paths in entry.get('recallInputs', {}).values():
            if not isinstance(paths, list) or any(path not in pins for path in paths):
                raise ValueError('Learning-unit recall input is not pinned')
    if 'currentOfferBinding' in catalog:
        pointer = offer_bindings.exact(catalog['currentOfferBinding'], {'path', 'sha256'})
        path = source_path(pointer['path'])
        if not path.startswith('DE/Gymnasium/learning-units/offers/') or not path.endswith('.json'):
            raise ValueError('Current-offer binding must use the explicit offers source root')
        digest = offer_bindings.sha256(pointer['sha256'])
        if path in expected and expected[path] != digest:
            raise ValueError('Conflicting current-offer binding pin')
        expected[path] = digest
    return expected


def _offer_dependencies(catalog: Mapping[str, Any], read: Any) -> dict[str, str]:
    if 'currentOfferBinding' not in catalog:
        return {}
    pointer = catalog['currentOfferBinding']
    raw = read(pointer['path'])
    if hashlib.sha256(raw).hexdigest() != pointer['sha256']:
        raise ValueError('Current-offer binding source bytes differ from its pointer')
    return offer_bindings.validate(_json(raw), source_path)


def compile_documents(repo: Path, configuration: Mapping[str, Any], source_landscape: Mapping[str, Any]) -> tuple[list[tuple[str, str, str, Any]], list[dict[str, Any]]]:
    if (set(configuration) != {'catalogPath', 'outputDirectory'}
            or configuration['outputDirectory'] != 'data/learning-units'
            or not isinstance(configuration['catalogPath'], str)
            or not configuration['catalogPath'].startswith('curricula/')):
        raise ValueError('Unsupported learning-unit build configuration')
    catalog_path = source_path(configuration['catalogPath'].removeprefix('curricula/'))
    if catalog_path != CATALOG_PATH and (not catalog_path.startswith('DE/Gymnasium/learning-units/offers/') or not catalog_path.endswith('.catalog.json')):
        raise ValueError('Unsupported learning-unit catalog source root')
    catalog_bytes = _read(repo, catalog_path)
    catalog = _json(catalog_bytes)
    pins = _dependencies(catalog)
    if 'currentOfferBinding' in catalog:
        binder = _json(_read(repo, catalog['currentOfferBinding']['path']))
        offer_bindings.validate(binder, source_path)
        derivation = offer_bindings.validate_entry_derivation(binder, lambda path: _read(repo, path), _json, source_path)
        if derivation and hashlib.sha256(_read(repo, derivation['originalOverviewPath'])).hexdigest() != derivation['originalOverviewSha256']:
            raise ValueError('Mathematics entry origin differs from reviewed derivation provenance')
        proof = binder['proof']
        proof_path = repo / proof['path']
        if (proof_path.is_symlink() or not proof_path.resolve().is_relative_to(repo.resolve())
                or not proof_path.is_file() or proof_path.stat().st_size > 64 * 1024 * 1024
                or hashlib.sha256(proof_path.read_bytes()).hexdigest() != proof['sha256']):
            raise ValueError('Current-offer release proof is missing or stale; it is not a runtime input')
    for path, digest in _offer_dependencies(catalog, lambda path: _read(repo, path)).items():
        if path in pins and pins[path] != digest:
            raise ValueError('Conflicting current-offer runtime input pin')
        pins[path] = digest
    kinds = {entry['path']: 'contract' for entry in catalog['contracts']}
    documents = []
    inputs = []
    if catalog_path in pins:
        raise ValueError('Catalog cannot recursively include its own source')
    for path in [catalog_path, *sorted(pins)]:
        raw = catalog_bytes if path == catalog_path else _read(repo, path)
        sha = hashlib.sha256(raw).hexdigest()
        if path != catalog_path and pins[path] != sha:
            raise ValueError(f'Stale learning-unit source input: {path}')
        kind = 'catalog' if path == catalog_path else kinds.get(path, 'input')
        artifact_path = 'data/learning-units/' + kind + '/' + hashlib.sha256(path.encode()).hexdigest()[:24] + '.json'
        identity = artifact_identity(path)
        wrapper = {'artifactFormatVersion': 1, 'artifactKind': kind, 'id': identity,
                   'definition': {'sourcePath': path, 'sha256': sha, 'contentBase64': base64.b64encode(raw).decode('ascii')}}
        documents.append((ROLES[kind], identity, artifact_path, wrapper))
        inputs.append({'sourcePath': 'curricula/' + path, 'sourceSha256': sha, 'artifactPath': artifact_path})
    validate_package_documents(documents, source_landscape)
    return documents, inputs


def validate_package_documents(documents: list[tuple[str, str, str, Any]], landscape: Mapping[str, Any] | None = None,
                               capabilities: list[str] | None = None) -> None:
    values: dict[str, tuple[str, bytes]] = {}
    for role, logical_id, _path, wrapper in documents:
        if not isinstance(wrapper, dict) or set(wrapper) != {'artifactFormatVersion', 'artifactKind', 'id', 'definition'} or wrapper['artifactFormatVersion'] != 1:
            raise ValueError('Invalid learning-unit artifact envelope')
        kind = wrapper['artifactKind']
        definition = wrapper['definition']
        if ROLES.get(kind) != role or not isinstance(definition, dict) or set(definition) != {'sourcePath', 'sha256', 'contentBase64'}:
            raise ValueError('Invalid learning-unit artifact role/definition')
        path = source_path(definition['sourcePath'])
        if artifact_identity(path) != logical_id or wrapper['id'] != logical_id or path in values:
            raise ValueError('Duplicate or mismatched learning-unit source identity')
        raw = base64.b64decode(definition['contentBase64'], validate=True)
        if hashlib.sha256(raw).hexdigest() != definition['sha256']:
            raise ValueError('Learning-unit exact source bytes mismatch')
        values[path] = (kind, raw)
    catalogs = [path for path, (kind, _raw) in values.items() if kind == 'catalog']
    if len(catalogs) != 1:
        raise ValueError('Learning-unit package must have exactly one catalog sidecar')
    catalog_path = catalogs[0]
    catalog = _json(values[catalog_path][1])
    pins = _dependencies(catalog)
    for path, digest in _offer_dependencies(catalog, lambda path: values[path][1]).items():
        if path in pins and pins[path] != digest:
            raise ValueError('Conflicting current-offer runtime input pin')
        pins[path] = digest
    if capabilities is not None and (OFFER_CAPABILITY in capabilities) != ('currentOfferBinding' in catalog):
        raise ValueError('Current-offer pointer requires its exact mandatory capability')
    if set(values) != {catalog_path, *pins}:
        raise ValueError('Learning-unit package input closure differs from its catalog')
    active: set[tuple[str, str]] = set()
    identities: set[tuple[str, str]] = set()
    for entry in catalog['contracts']:
        path = entry['path']
        if values[path][0] != 'contract':
            raise ValueError('Catalog contract source has the wrong artifact role')
        contract = _json(values[path][1])
        if not isinstance(contract, dict):
            raise ValueError('Learning-unit contract is not an object')
        identities.add((contract['contractId'], contract['revision']))
        if entry['status'] == 'active':
            identity = (contract['contractId'], contract['revision'])
            if identity in active:
                raise ValueError('Duplicate active learning-unit contract identity')
            active.add(identity)
    for path, digest in pins.items():
        if path not in values or hashlib.sha256(values[path][1]).hexdigest() != digest:
            raise ValueError('Learning-unit package source pin does not match exact bytes')
    semantic_inputs.validate(catalog, lambda path: values[path][1], _json, source_path)
    if 'currentOfferBinding' in catalog:
        binder = _json(values[catalog['currentOfferBinding']['path']][1])
        offer_bindings.validate_entry_derivation(binder, lambda path: values[path][1], _json, source_path)
        if any(ref not in identities for row in binder['offers'] for ref in offer_bindings.references(row['rootContractRefs'])):
            raise ValueError('Current-offer root references an absent immutable contract')
    if landscape and 'currentOfferBinding' not in catalog:
        metadata = {(unit['learningUnit']['contractId'], unit['learningUnit']['revision'])
                    for unit in landscape.get('programUnits', []) if unit.get('learningUnit')}
        if metadata != active:
            raise ValueError('Learning-unit active contracts and landscape metadata differ')
