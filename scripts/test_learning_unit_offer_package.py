#!/usr/bin/env python3
"""Small feature/profile closure corpus; no production image or ZIP copies."""
import base64
import copy
import hashlib
import json
import tempfile
from pathlib import Path
from jsonschema import Draft202012Validator
import curriculum_learning_unit_artifacts as units
import evaluate_curriculum_package_readiness as readiness


def run() -> None:
    contracts = Path(__file__).resolve().parents[1] / 'contracts/curriculum-package/v1.2'
    for offers in (False, True):
        readiness.select_contract_directory(contracts, offers=offers)
        trusted = readiness.trusted_contracts()
        assert trusted.profile['profileId'] == (units.OFFER_PROFILE_ID if offers else units.PROFILE_ID)
        assert trusted.policy['consumerSmokeRunner']['sha256'] == 'd0b8721c3830d1e616f9ee7c6053baecc18f67b52f404af4fad93e82bfec3dff', \
            'the offer profile must preserve the exact existing hermetic runner'
    with tempfile.TemporaryDirectory(prefix='learning-unit-offer-package.') as temporary:
        repo = Path(temporary)
        source = repo / 'curricula'
        contract_path = 'DE/Gymnasium/learning-units/contracts/unit/1.json'
        snapshot_path = 'DE/Gymnasium/learning-units/sources/unit.json'
        view_path = 'DE/Gymnasium/composition-views/mathematik/view.json'
        review_path = 'DE/Gymnasium/quality/learning-units/offer.md'
        binder_path = 'DE/Gymnasium/learning-units/offers/test.json'
        sha = lambda raw: hashlib.sha256(raw).hexdigest()

        def write(path, value):
            raw = value if isinstance(value, bytes) else json.dumps(value, sort_keys=True).encode()
            target = source / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(raw)
            return sha(raw)

        contract_sha = write(contract_path, {'contractId': 'unit', 'revision': '1'})
        snapshot_sha = write(snapshot_path, {'goals': []})
        view_sha = write(view_path, {'viewId': 'view'})
        review_sha = write(review_path, b'Independent bounded review PASS.\n')
        proof = repo / 'docs/dev/release-proof.json'
        proof.parent.mkdir(parents=True)
        proof.write_bytes(b'{"proof":"fixture-only"}\n')
        scope = dict(rootLandscapeId='root', landscapeId='math', schoolForm='Gymnasium', jurisdiction='ALL',
                     stage='CrossStage', durationModel=None, courseProfile='GK+LK')
        binder = {'schemaVersion': 1, 'semantics': 'current-learning-unit-offers-v1', 'revision': '1',
                  'resolverRevision': 'native-personal-curriculum-offers-v1',
                  'inputs': {view_path: view_sha, review_path: review_sha}, 'reviewRef': review_path,
                  'proof': {'path': 'docs/dev/release-proof.json', 'sha256': sha(proof.read_bytes())},
                  'offers': [{'scope': scope, 'coverage': 'partial', 'compositionViewIds': ['view'],
                              'inputPaths': [view_path], 'targetSetSha256': sha(b'[]'),
                              'prerequisiteOnlySetSha256': sha(b'[]'),
                              'rootContractRefs': [{'contractId': 'unit', 'revision': '1'}]}]}
        binder_sha = write(binder_path, binder)
        catalog = {'schemaVersion': 1, 'contracts': [{'path': contract_path, 'sha256': contract_sha, 'status': 'active',
                   'sourceSnapshotPath': snapshot_path, 'inputs': {snapshot_path: snapshot_sha, view_path: view_sha},
                   'assessmentInputs': {}, 'recallInputs': {}}],
                   'currentOfferBinding': {'path': binder_path, 'sha256': binder_sha}}
        write(units.CATALOG_PATH, catalog)
        configuration = {'catalogPath': 'curricula/' + units.CATALOG_PATH, 'outputDirectory': 'data/learning-units'}
        documents, inputs = units.compile_documents(repo, configuration, {'programUnits': []})
        assert len(documents) == 6 and len(inputs) == 6
        assert len({identity for _role, identity, _path, _value in documents}) == 6, 'shared view is retained only once'
        assert not any('release-proof' in item['sourcePath'] for item in inputs), 'proof-only input must not be copied'
        capabilities = units.catalog_capabilities(documents)
        assert capabilities == [units.CAPABILITY, units.OFFER_CAPABILITY]
        units.validate_package_documents(documents, capabilities=capabilities)
        rejected = 0

        def reject(call):
            nonlocal rejected
            try:
                call()
            except (ValueError, KeyError):
                rejected += 1
            else:
                raise AssertionError('Invalid current-offer package was accepted')

        reject(lambda: units.validate_package_documents(documents, capabilities=[units.CAPABILITY]))
        changed = copy.deepcopy(documents)
        changed_catalog = copy.deepcopy(catalog)
        changed_catalog['currentOfferBinding'] = None
        for _role, identity, _path, value in changed:
            if identity == units.CATALOG_PATH:
                raw = json.dumps(changed_catalog).encode()
                value['definition'].update(sha256=sha(raw), contentBase64=base64.b64encode(raw).decode())
        reject(lambda: units.validate_package_documents(changed, capabilities=capabilities))
        duplicate = copy.deepcopy(binder)
        duplicate['offers'].append(copy.deepcopy(duplicate['offers'][0]))
        duplicate_sha = write(binder_path, duplicate)
        altered_catalog = copy.deepcopy(catalog)
        altered_catalog['currentOfferBinding']['sha256'] = duplicate_sha
        write(units.CATALOG_PATH, altered_catalog)
        reject(lambda: units.compile_documents(repo, configuration, {}))
        write(binder_path, binder)
        write(units.CATALOG_PATH, catalog)
        proof.write_bytes(b'{"changed":"proof-only"}')
        # A later release needs fresh authoring evidence, while frozen package
        # validation never consults an external mutable proof file.
        reject(lambda: units.compile_documents(repo, configuration, {}))
        units.validate_package_documents(documents, capabilities=capabilities)
        proof.write_bytes(b'{"proof":"fixture-only"}\n')
        # A package-specific catalog has its own source identity and reuses the
        # exact frozen contracts. Catalog discovery must use its explicit role.
        package_catalog_path = 'DE/Gymnasium/learning-units/offers/package.catalog.json'
        write(package_catalog_path, catalog)
        package_configuration = {**configuration, 'catalogPath': 'curricula/' + package_catalog_path}
        package_documents, _ = units.compile_documents(repo, package_configuration, {})
        assert units.catalog_capabilities(package_documents) == capabilities
        units.validate_package_documents(package_documents, capabilities=capabilities)
        reject(lambda: units.validate_package_documents(documents + [package_documents[0]], capabilities=capabilities))
        # The distinct entry is installed; the complete original overview is
        # pinned provenance. Its authored flow permits only this finite rewrite.
        origin_path = 'DE/Gymnasium/canonical/overview.json'
        entry_path = 'DE/Gymnasium/learning-units/entries/entry.de.json'
        derivation_path = 'DE/Gymnasium/learning-units/entries/entry.derivation.json'
        origin = {'landscapeId': 'overview', 'filters': [{'id': 'ALL'}], 'personalizationFlow': {
            'version': '1', 'stages': [{'landscapeId': 'overview', 'landscapeIds': ['math', 'physics']} ]}}
        entry = {'landscapeId': 'entry', 'frameworkId': 'canonical-gymnasium-mathematics-entry-v1', 'schoolType': 'Gymnasium',
                 'filters': origin['filters'], 'personalizationFlow': {'version': '1', 'stages': [{'landscapeId': 'entry', 'landscapeIds': ['math']}]},
                 'goals': [{'id': 'entry-root', 'type': 'cluster', 'semanticKind': 'programStructure', 'contains': ['math-root']}]}
        derivation = {'schemaVersion': 1, 'semantics': 'reviewed-mathematics-package-entry-v1',
                      'originalOverviewPath': origin_path, 'originalOverviewSha256': write(origin_path, origin),
                      'entryPath': entry_path, 'entrySha256': write(entry_path, entry), 'entryLandscapeId': 'entry',
                      'entryRootGoalId': 'entry-root', 'mathematicsLandscapeId': 'math', 'mathematicsRootGoalId': 'math-root', 'reviewRef': review_path}
        entry_binder = copy.deepcopy(binder)
        entry_binder['inputs'].update({origin_path: derivation['originalOverviewSha256'], entry_path: derivation['entrySha256'],
                                     derivation_path: write(derivation_path, derivation)})
        entry_binder['entryDerivation'] = {'path': derivation_path, 'sha256': entry_binder['inputs'][derivation_path]}
        entry_binder['offers'][0]['scope']['rootLandscapeId'] = 'entry'
        entry_catalog = copy.deepcopy(catalog)
        entry_catalog['currentOfferBinding']['sha256'] = write(binder_path, entry_binder)
        write(package_catalog_path, entry_catalog)
        entry_documents, _ = units.compile_documents(repo, package_configuration, {})
        units.validate_package_documents(entry_documents, capabilities=capabilities)
        entry_profile = {'entryLandscape': {'sourcePath': 'curricula/' + entry_path, 'landscapeId': 'entry',
                                           'rootGoalId': 'entry-root', 'derivationPath': 'curricula/' + derivation_path},
                         'canonicalLandscape': {'landscapeId': 'math', 'rootGoalId': 'math-root'}, 'learningUnits': package_configuration}
        assert units.entry_landscape(repo, entry_profile) == entry
        bad_entry = copy.deepcopy(entry)
        bad_entry['personalizationFlow']['stages'][0]['landscapeIds'].append('physics')
        write(entry_path, bad_entry)
        reject(lambda: units.compile_documents(repo, package_configuration, {}))
        write(binder_path, binder)
        write(view_path, {'viewId': 'changed'})
        reject(lambda: units.compile_documents(repo, configuration, {}))
        old_schema = json.loads((Path(__file__).resolve().parents[1] /
            'contracts/curriculum-package/v1.2/runtime-catalog.schema.json').read_bytes())
        assert not Draft202012Validator(old_schema['properties']['capabilities']).is_valid(capabilities), \
            'the actual frozen old consumer schema must reject the mandatory new capability'
        print(f'Current-offer package: deduplicated exact inputs, proof separation, old-consumer rejection and {rejected} negative cases passed.')


if __name__ == '__main__':
    run()
