"""Static current-offer input shape/closure, independent of learner recognition.

The native backend resolver verifies actual target/support sets and hierarchy.
This release check binds only the finite declared runtime inputs. Proof-only
authoring reports are deliberately never read or added to the package closure.
"""
from __future__ import annotations

import hashlib
import re
from typing import Any, Callable, Mapping

SEMANTICS = 'current-learning-unit-offers-v1'
RESOLVER = 'native-personal-curriculum-offers-v1'
SCOPE_FIELDS = ('rootLandscapeId', 'landscapeId', 'schoolForm', 'jurisdiction', 'stage', 'durationModel', 'courseProfile')


def text(value: Any) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError('Offer binding requires nonempty text')
    return value


def sha256(value: Any) -> str:
    if not isinstance(value, str) or not re.fullmatch('[a-f0-9]{64}', value):
        raise ValueError('Offer binding requires an exact SHA-256')
    return value


def exact(value: Any, fields: set[str]) -> Mapping[str, Any]:
    if not isinstance(value, dict) or set(value) != fields:
        raise ValueError('Unsupported current-offer fields')
    return value


def references(value: Any) -> list[tuple[str, str]]:
    if not isinstance(value, list):
        raise ValueError('Offer contract references must be a list')
    result = [(text(exact(ref, {'contractId', 'revision'})['contractId']), text(ref['revision'])) for ref in value]
    if len(result) != len(set(result)):
        raise ValueError('Duplicate current-offer contract reference')
    return result


def validate(document: Any, source_path: Callable[[Any], str]) -> dict[str, str]:
    required = {'schemaVersion', 'semantics', 'revision', 'resolverRevision', 'inputs', 'reviewRef', 'proof', 'offers'}
    if not isinstance(document, dict) or set(document) - required - {'entryDerivation'} or not required <= set(document):
        raise ValueError('Unsupported current-offer fields')
    binder = document
    if type(binder['schemaVersion']) is not int or binder['schemaVersion'] != 1 or binder['semantics'] != SEMANTICS or binder['resolverRevision'] != RESOLVER:
        raise ValueError('Unsupported current-offer semantics or resolver')
    text(binder['revision'])
    if not isinstance(binder['inputs'], dict) or not binder['inputs']:
        raise ValueError('Current-offer inputs must be an explicit nonempty map')
    inputs = {source_path(path): sha256(digest) for path, digest in binder['inputs'].items()}
    if source_path(binder['reviewRef']) not in inputs:
        raise ValueError('Current-offer independent review is not pinned')
    if 'entryDerivation' in binder:
        derivation = exact(binder['entryDerivation'], {'path', 'sha256'})
        if inputs.get(source_path(derivation['path'])) != sha256(derivation['sha256']):
            raise ValueError('Current-offer entry derivation is not pinned')
    proof = exact(binder['proof'], {'path', 'sha256'})
    # This descriptor is release evidence, not an implicit runtime dependency.
    proof_path = text(proof['path'])
    if proof_path.startswith('/') or '\\' in proof_path or any(part in ('', '.', '..') for part in proof_path.split('/')):
        raise ValueError('Unsafe current-offer proof descriptor')
    sha256(proof['sha256'])
    offers = binder['offers']
    if not isinstance(offers, list) or not offers or len(offers) > 10000:
        raise ValueError('Current-offer rows must be a bounded nonempty list')
    scopes: set[tuple[Any, ...]] = set()
    for row in offers:
        offer = exact(row, {'scope', 'coverage', 'compositionViewIds', 'inputPaths', 'targetSetSha256', 'prerequisiteOnlySetSha256', 'rootContractRefs'})
        scope = exact(offer['scope'], set(SCOPE_FIELDS))
        key = tuple(None if scope[field] is None and field in ('durationModel', 'courseProfile') else text(scope[field]) for field in SCOPE_FIELDS)
        if key in scopes:
            raise ValueError('Duplicate exact current-offer scope key')
        scopes.add(key)
        if offer['coverage'] not in ('partial', 'complete'):
            raise ValueError('Unsupported current-offer coverage')
        for field in ('compositionViewIds', 'inputPaths'):
            values = offer[field]
            if not isinstance(values, list) or any(not isinstance(value, str) or not value.strip() for value in values) or len(values) != len(set(values)):
                raise ValueError('Invalid current-offer input or view identity list')
        if any(source_path(path) not in inputs for path in offer['inputPaths']):
            raise ValueError('Current-offer row references an unpinned runtime input')
        sha256(offer['targetSetSha256'])
        sha256(offer['prerequisiteOnlySetSha256'])
        references(offer['rootContractRefs'])
    return inputs


def validate_entry_derivation(binder: Mapping[str, Any], read: Callable[[str], bytes],
                              decode: Callable[[bytes], Any], source_path: Callable[[Any], str]) -> Mapping[str, Any] | None:
    """Bind the distinct installed entry without treating its origin as a runtime root."""
    if 'entryDerivation' not in binder:
        return None
    document = exact(decode(read(binder['entryDerivation']['path'])), {
        'schemaVersion', 'semantics', 'originalOverviewPath', 'originalOverviewSha256',
        'entryPath', 'entrySha256', 'entryLandscapeId', 'entryRootGoalId',
        'mathematicsLandscapeId', 'mathematicsRootGoalId', 'reviewRef'})
    if type(document['schemaVersion']) is not int or document['schemaVersion'] != 1 or document['semantics'] != 'reviewed-mathematics-package-entry-v1':
        raise ValueError('Unsupported mathematics package entry derivation')
    origin_path = source_path(document['originalOverviewPath'])
    if binder['inputs'].get(origin_path) != sha256(document['originalOverviewSha256']):
        raise ValueError('Mathematics entry origin is not pinned as derivation provenance')
    entry_path = source_path(document['entryPath'])
    if binder['inputs'].get(entry_path) != sha256(document['entrySha256']) or source_path(document['reviewRef']) not in binder['inputs']:
        raise ValueError('Mathematics entry or its independent derivation review is not pinned')
    for field in ('entryLandscapeId', 'entryRootGoalId', 'mathematicsLandscapeId', 'mathematicsRootGoalId'):
        text(document[field])
    if (document['entryLandscapeId'] == document['mathematicsLandscapeId']
            or document['entryRootGoalId'] == document['mathematicsRootGoalId']):
        raise ValueError('Mathematics package entry must have its own stable identity')
    entry = decode(read(entry_path))
    origin_raw = read(origin_path)
    origin = decode(origin_raw)
    if hashlib.sha256(origin_raw).hexdigest() != document['originalOverviewSha256']:
        raise ValueError('Mathematics entry origin bytes differ from reviewed provenance')
    goals = entry.get('goals') if isinstance(entry, dict) else None
    if (not isinstance(entry, dict) or entry.get('landscapeId') != document['entryLandscapeId'] or not isinstance(goals, list)
            or len(goals) != 1 or goals[0].get('id') != document['entryRootGoalId']
            or goals[0].get('contains') != [document['mathematicsRootGoalId']]):
        raise ValueError('Mathematics package entry must retain its exact single Math child')
    if any(row['scope']['rootLandscapeId'] != document['entryLandscapeId'] for row in binder['offers']):
        raise ValueError('Package offers must use the actual installed entry root')
    def project_flow(value: Any) -> Any:
        if isinstance(value, list):
            return [project_flow(child) for child in value]
        if isinstance(value, dict):
            return {key: ([document['mathematicsLandscapeId']] if key == 'landscapeIds'
                          else document['entryLandscapeId'] if key in ('landscapeId', 'targetLandscapeId') and child == origin['landscapeId']
                          else project_flow(child)) for key, child in value.items()}
        return value
    if (not isinstance(origin, dict) or origin.get('landscapeId') in (document['entryLandscapeId'], document['mathematicsLandscapeId'])
            or entry.get('filters') != origin.get('filters')
            or not isinstance(origin.get('personalizationFlow'), dict)
            or entry.get('personalizationFlow') != project_flow(origin['personalizationFlow'])):
        raise ValueError('Mathematics entry must retain the reviewed exact filter and preflow projection')
    return document
