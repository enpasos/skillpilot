#!/usr/bin/env python3
"""Cross-language tests for registered completion fields and structural RDF.

The fixture is emitted by the TypeScript semantic compiler. Python reconstructs
its actual RDF without importing the forward compiler or trusting source fields.
"""
from __future__ import annotations

import copy
import io
import json
from pathlib import Path
import sys
import tempfile

from reconstruct_json_curriculum_package_from_fwu_owl import (
    Artifact, ArtifactReconstructor, Registry, ReverseCompilerError, TripleStore, js_uri_component,
    completion_content_license, recover_license_documents, sha256_bytes, load_artifacts,
)
from curriculum_fwu_completion_semantics import (
    CLASSES, DATA_PROPERTIES, OBJECT_PROPERTIES, SP, validate_completion_assertions,
)


def main() -> None:
    license_payloads = {'licenses/Apache-2.0.txt': b'Apache license bytes', 'licenses/CC-BY-4.0.txt': b'Content license bytes'}
    class LicenseCarrier:
        manifest = {'licenseDocuments': [{'licenseId': name, 'path': 'licenses/' + name + '.txt'} for name in ('Apache-2.0', 'CC-BY-4.0')],
                    'files': [{'role': 'license', 'licenseExpression': name, 'path': path,
                               'bytes': len(raw), 'sha256': sha256_bytes(raw)}
                              for name in ('Apache-2.0', 'CC-BY-4.0')
                              for path, raw in license_payloads.items() if path == 'licenses/' + name + '.txt']}
        def read(self, path):
            return license_payloads[path]
    recovered_payloads, recovered_records = {}, []
    documents = recover_license_documents(LicenseCarrier(), recovered_payloads, recovered_records)
    assert documents == [{'licenseId': 'Apache-2.0', 'path': 'LICENSE'}, {'licenseId': 'CC-BY-4.0', 'path': 'LICENSES/CC-BY-4.0.txt'}]
    assert recovered_payloads['LICENSE'] == license_payloads['licenses/Apache-2.0.txt']
    assert recovered_payloads['LICENSES/CC-BY-4.0.txt'] == license_payloads['licenses/CC-BY-4.0.txt']
    license_payloads['licenses/CC-BY-4.0.txt'] = b'changed content license bytes'
    try:
        recover_license_documents(LicenseCarrier(), {}, [])
    except ReverseCompilerError:
        pass
    else:
        raise AssertionError('A changed license document was accepted')
    policy = 'Owner scope notice'
    review = {'projectLicenseGrant': {'contentLicenseExpression': 'CC-BY-4.0', 'scope': 'skillpilot-owned-contributions',
              'decisionAuthority': 'project-owner', 'doesNotClearRedistribution': True, 'policyText': policy,
              'policySha256': 'sha256:' + sha256_bytes(policy.encode())},
              'classDecisions': [{'artifactRoles': ['completion-profile', 'completion-scope', 'completion-rule-review'],
                                 'provenanceClass': 'skillpilot-authored', 'redistributionStatus': 'review-required'}]}
    for role in ('completion-profile', 'completion-scope', 'completion-rule-review'):
        assert completion_content_license(role, review) == ('CC-BY-4.0', 'allowed')
    assert completion_content_license('source-index', review) == (None, 'review-required')
    prior_grant = copy.deepcopy(review)
    prior_grant['classDecisions'].append({'classId': 'source', 'artifactRoles': ['source-index'],
        'redistributionStatus': 'allowed', 'licenseExpression': 'CC-BY-4.0', 'decisionStatus': 'human-approved',
        'reviewer': 'Prior source rights review', 'reviewedAt': '2026-09-21', 'reviewEvidence': [{'reference': 'prior grant'}]})
    assert completion_content_license('source-index', prior_grant) == ('CC-BY-4.0', 'allowed')
    prior_grant['classDecisions'][-1]['reviewEvidence'] = []
    try:
        completion_content_license('source-index', prior_grant)
    except ReverseCompilerError:
        pass
    else:
        raise AssertionError('An incomplete prior license decision was accepted')
    invalid = copy.deepcopy(review)
    invalid['classDecisions'][0]['provenanceClass'] = 'third-party'
    try:
        completion_content_license('completion-profile', invalid)
    except ReverseCompilerError:
        pass
    else:
        raise AssertionError('Reverse compiler relicensed third-party content')
    assert review['classDecisions'][0]['redistributionStatus'] == 'review-required'
    identity_source = type('IdentityCarrier', (), {'manifest': {'releaseId': 'fixture@1.0.0'}})()
    indexed = {'logicalArtifacts': [{'role': role, 'logicalId': 'shared-identity', 'normalizedBytes': 2,
                                     'normalizedSha256': '0' * 64, 'recordSha256': '1' * 64}
                                    for role in ('completion-profile', 'completion-scope')]}
    distinct = load_artifacts(identity_source, indexed)
    assert distinct[0].logical_id == distinct[1].logical_id
    assert distinct[0].key != distinct[1].key and distinct[0].root_iri != distinct[1].root_iri
    indexed['logicalArtifacts'].append(indexed['logicalArtifacts'][0])
    try:
        load_artifacts(identity_source, indexed)
    except ReverseCompilerError:
        pass
    else:
        raise AssertionError('Duplicate role/ID identity was accepted')
    fixture = json.loads(Path(sys.argv[1]).read_bytes())
    root = Path(__file__).resolve().parents[1]
    registry = Registry((root / 'contracts/curriculum-package/v1.1/profiles/skillpilot-fwu-field-semantics-completion-v1.registry.json').read_bytes())
    base = 'https://skillpilot.de/id/curriculum-package/' + js_uri_component(fixture['releaseId'])
    with tempfile.TemporaryDirectory(prefix='completion-rdf-tests-') as directory:
        store = TripleStore(Path(directory) / 'rdf.sqlite')
        try:
            for segment in fixture['segments'].values():
                store.ingest(io.BytesIO(segment.encode()))
            store.finish()
            reconstructed = []
            for source in fixture['artifacts']:
                role, logical_id = source['role'], source['logicalId']
                iri = base + '/artifact/' + js_uri_component(role) + '/' + js_uri_component(logical_id)
                if role.startswith('completion-') or role == 'canonical-landscape':
                    if role == 'canonical-landscape':
                        iri = base + '/landscape/' + js_uri_component(logical_id)
                    artifact = Artifact(logical_id, role, role, source['normalizedBytes'], source['normalizedSha256'], '0' * 64, iri)
                    document = ArtifactReconstructor(store, registry, base).reconstruct(artifact)
                    assert document == source['document'], 'Registered field reconstruction changed completion policy'
                    reconstructed.append((role, iri, document))
            validate_completion_assertions(store, reconstructed, base)
            checks = 1
            # Type membership is part of the independently checked RDF model.
            rdf_type = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            for class_name in CLASSES:
                store.connection.execute('SAVEPOINT mutation')
                changed = store.connection.execute('DELETE FROM triples WHERE p=? AND o=?', (rdf_type, SP + class_name)).rowcount
                assert changed > 0, f'Fixture does not exercise {class_name}'
                try:
                    validate_completion_assertions(store, reconstructed, base)
                except ValueError:
                    checks += 1
                else:
                    raise AssertionError(f'Deletion of {class_name} membership was accepted')
                store.connection.execute('ROLLBACK TO mutation')
                store.connection.execute('RELEASE mutation')
            store.connection.execute('SAVEPOINT mutation')
            store.connection.execute('INSERT INTO triples VALUES(?,?,?,?,?,?)',
                                     (base + '/unexpected', rdf_type, 1, SP + 'CompletionScope', '', ''))
            try:
                validate_completion_assertions(store, reconstructed, base)
            except ValueError:
                checks += 1
            else:
                raise AssertionError('An additional completion class membership was accepted')
            store.connection.execute('ROLLBACK TO mutation')
            store.connection.execute('RELEASE mutation')
            # Every separate relation/revision matters even when the JSON literal
            # and its normalized digest are both intact.
            for predicate in (*OBJECT_PROPERTIES, *DATA_PROPERTIES):
                store.connection.execute('SAVEPOINT mutation')
                changed = store.connection.execute('DELETE FROM triples WHERE p=?', (SP + predicate,)).rowcount
                assert changed > 0, f'Fixture does not exercise {predicate}'
                try:
                    validate_completion_assertions(store, reconstructed, base)
                except ValueError:
                    pass
                else:
                    raise AssertionError(f'Deletion of {predicate} was accepted')
                store.connection.execute('ROLLBACK TO mutation')
                store.connection.execute('RELEASE mutation')
                checks += 1
            store.connection.execute('SAVEPOINT mutation')
            store.connection.execute('UPDATE triples SET o=? WHERE p=?', (base + '/goal/missing', SP + 'requiresMasteredAssessment'))
            try:
                validate_completion_assertions(store, reconstructed, base)
            except ValueError:
                checks += 1
            else:
                raise AssertionError('A changed assessment IRI was accepted')
            store.connection.execute('ROLLBACK TO mutation')
            store.connection.execute('RELEASE mutation')
            store.connection.execute('SAVEPOINT mutation')
            store.connection.execute('INSERT INTO triples VALUES(?,?,?,?,?,?)',
                                     (base + '/unexpected', SP + 'hasCompletionScope', 1, base + '/other-scope', '', ''))
            try:
                validate_completion_assertions(store, reconstructed, base)
            except ValueError:
                checks += 1
            else:
                raise AssertionError('An additional completion relation was accepted')
            store.connection.execute('ROLLBACK TO mutation')
            store.connection.execute('RELEASE mutation')
            dangling_scope = copy.deepcopy(reconstructed)
            next(doc for role, _, doc in dangling_scope if role == 'completion-profile')['definition']['levelScopeRef'] = 'missing-scope'
            try:
                validate_completion_assertions(store, dangling_scope, base)
            except ValueError:
                checks += 1
            else:
                raise AssertionError('A dangling completion scope was accepted')
            dangling = copy.deepcopy(reconstructed)
            profile = next(doc for role, _, doc in dangling if role == 'completion-profile')
            profile['definition']['rules'][0]['assessmentGoalIds'] = ['missing']
            try:
                validate_completion_assertions(store, dangling, base)
            except ValueError:
                checks += 1
            else:
                raise AssertionError('Dangling assessment ID was accepted')
            # The JSON carrier is also independently required. A structural
            # graph alone cannot reconstruct arbitrary reviewed rule metadata.
            entry = next(e for e in registry.by_role['completion-profile'] if e.pattern == ('definition',))
            predicate = registry.iri(entry.data['rdfMapping']['canonicalJsonLiteral']['predicate'])
            store.connection.execute('DELETE FROM triples WHERE p=?', (predicate,))
            original = next(a for a in fixture['artifacts'] if a['role'] == 'completion-profile')
            iri = next(iri for role, iri, _ in reconstructed if role == 'completion-profile')
            artifact = Artifact(original['logicalId'], 'completion-profile', 'completion-profile', original['normalizedBytes'], original['normalizedSha256'], '0' * 64, iri)
            try:
                ArtifactReconstructor(store, registry, base).reconstruct(artifact)
            except ReverseCompilerError:
                checks += 1
            else:
                raise AssertionError('Missing lossless completion anchor was accepted')
        finally:
            store.close()
        flow = fixture['optionalFlow']
        flow_store = TripleStore(Path(directory) / 'flow-rdf.sqlite')
        try:
            for segment in flow['segments'].values():
                flow_store.ingest(io.BytesIO(segment.encode()))
            flow_store.finish()
            iri = base + '/landscape/' + js_uri_component(flow['logicalId'])
            def flow_artifact():
                return Artifact(flow['logicalId'], 'canonical-landscape', 'canonical-landscape', flow['normalizedBytes'], flow['normalizedSha256'], '0' * 64, iri)
            assert ArtifactReconstructor(flow_store, registry, base).reconstruct(flow_artifact()) == flow['document']
            flow_store.connection.execute('DELETE FROM triples WHERE p=?', (SP + 'personalizationFlowJson',))
            try:
                ArtifactReconstructor(flow_store, registry, base).reconstruct(flow_artifact())
            except ReverseCompilerError as error:
                assert 'oracle mismatch' in str(error)
                checks += 1
            else:
                raise AssertionError('An originally present personalization flow disappeared')
        finally:
            flow_store.close()
    print(f'Completion JSON↔RDF roundtrip and mutation tests passed ({checks} checks).')


if __name__ == '__main__':
    main()
