# SPDX-License-Identifier: Apache-2.0
"""Root-released mechanical serialization of genuine D15+D1 own original science."""
from pathlib import Path
import datetime
import hashlib
import json
import shutil
import jsonschema

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
RELEASE = OWN.parent / 'preparation/ROOT_RELEASE.genuine-D15-D1-normal-transport-pair-only.json'
RELEASE_SHA = 'sha256:cb52abe695266fa0c50511643afdf0b427ea417dbcdb3d178206e7f375d49227'
E7 = 'e7c3d20e-4b13-560b-b8ee-c5abca8cc624'
EVIDENCE_KEYS = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe',
                 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
B_RATIONALE_KEYS = ['sourceFidelity', 'wordingAndAssessability', 'materialToGoalAndLimitations',
                    'figurePageAndRelations', 'courseBoundary']


def load(path):
    return json.loads(path.read_text())


def sha(body):
    return 'sha256:' + hashlib.sha256(body).hexdigest()


def ref(path):
    body = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': sha(body), 'bytes': len(body)}


def verify(row):
    path = REPO / row['path']
    assert ref(path) == row, path
    return path


def object_sha(value):
    return sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())


def put(path, value):
    assert path.is_relative_to(OWN) and not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


assert ref(RELEASE)['sha256'] == RELEASE_SHA
release = load(RELEASE)
assert release['goalPairs'] == 16 and release['expectedNormalSourceRecords'] == 32
refs = release['actualScientificInputs']
data = {name: load(verify(row)) for name, row in refs.items()}
assert not (OWN / 'TRANSPORT.genuine-D15-D1-own-original-science.exact.json').exists()
for row in load(OWN / 'FILES.finite-input-transport-only.before-FIRST-release.seal.json')['files']:
    verify(row)
e7_source_seal = OWN / 'e7-one/FILES.finite-actual-proper-e7-D1-source-only.seal.json'
for row in load(e7_source_seal)['files']:
    verify(row)
record_schema_path = REPO / 'contracts/goal-description-review/v1/goal-description-review-record.schema.json'
run_schema_path = REPO / 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'
record_validator = jsonschema.Draft202012Validator(load(record_schema_path))
run_validator = jsonschema.Draft202012Validator(load(run_schema_path), format_checker=jsonschema.FormatChecker())

first15_a = {row['goalId']: row for row in data['a15First']['decisions']}
first15_b = {row['goalId']: row for row in data['b15First']['goalReviews']}
six15_b = {row['goalId']: row for row in data['b15OwnSixFields']['goalReviews']}
assert len(first15_a) == len(first15_b) == len(six15_b) == 15
assert data['aE7First']['understandingEvidence'] == data['aE7ActualOnePage']['understandingEvidence']
assert data['bE7First']['understandingEvidence'] == data['bE7ActualOnePage']['understandingEvidence']
assert data['aE7ActualOnePage']['decisionForThisExactCurrentPage'] == 'keep'
assert data['bE7ActualOnePage']['decision'] == 'keep'

unknown_parameters = OWN / 'metadata/generation-parameters-unexposed.declaration.json'
put(unknown_parameters, {'actualGenerationParameters': 'not_exposed_by_runtime',
                         'temperature': None, 'seed': None, 'exactModel': None,
                         'differentProviderOrModelClaimed': False})
parameter_digest = ref(unknown_parameters)['sha256']
created = []
mapping = []
batch_outputs = []
for label, root, count in [('D15', OWN / 'native-bcp-fifteen', 15),
                           ('D1', OWN / 'e7-one/native-one', 1)]:
    manifest = load(root / 'batch-manifest.json')
    bundle = load(root / 'bundle/manifest.json')
    config = load(REPO / manifest['configPath'])
    assert len(config['goalIds']) == count
    assert (count == 15 and E7 not in config['goalIds']) or config['goalIds'] == [E7]
    side_records = {}
    side_runs = {}
    for side in ['a', 'b']:
        round_root = root / ('round-' + side)
        results = round_root / 'results'
        assert list(results.iterdir()) == []
        campaign = load(round_root / 'description-review-campaign.json')
        input_data = load(round_root / 'description-review-input.json')
        assert len(campaign['batches']) == 1 and input_data['goalCount'] == count
        batch = campaign['batches'][0]
        run_id = 'chemie-bcp-current426-' + label + '-original-independent-' + side + '-20261015-v1'
        records = []
        for goal in input_data['goals']:
            gid = goal['goalId']
            if label == 'D15' and side == 'a':
                original = first15_a[gid]
                evidence = original['understandingEvidence']
                rationale_parts = [original['reasonDe'], original['reasonEn']]
                decision = original['decision']
                bindings = original['bindings']
                assert bindings['goalFingerprint'] == goal['goalFingerprint']
                assert bindings['pageFingerprint'] == goal['pageFingerprint']
                for key in ['currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']:
                    assert bindings[key] == goal[key]
                science_refs = [refs['a15First']]
                evidence_source = refs['a15First']
            elif label == 'D15':
                original = first15_b[gid]
                own_six = six15_b[gid]
                evidence = own_six['understandingEvidence']
                rationale_parts = [original[key] for key in B_RATIONALE_KEYS]
                decision = original['decision']
                assert own_six['decision'] == decision
                assert own_six['priorWholeDescriptionFinding']['goalId'] == gid
                for row in [original, own_six]:
                    assert row['goalFingerprint'] == goal['goalFingerprint']
                    assert row['pageFingerprint'] == goal['pageFingerprint']
                for source_key, target_key in [('titleDe', 'currentTitleDe'), ('titleEn', 'currentTitleEn'),
                                               ('descriptionDe', 'currentDescriptionDe'), ('descriptionEn', 'currentDescriptionEn')]:
                    assert original[source_key] == goal[target_key]
                science_refs = [refs['b15First'], refs['b15OwnSixFields']]
                evidence_source = refs['b15OwnSixFields']
            elif side == 'a':
                original = data['aE7First']
                amendment = data['aE7ActualOnePage']
                evidence = original['understandingEvidence']
                rationale_parts = [original['rationaleDe'], original['rationaleEn'],
                                   amendment['pageContextRationaleDe'], amendment['pageContextRationaleEn']]
                decision = amendment['decisionForThisExactCurrentPage']
                assert original['decision'] == decision
                assert original['goalFingerprint'] == goal['goalFingerprint']
                assert amendment['goalFingerprint'] == goal['goalFingerprint']
                assert amendment['pageFingerprint'] == goal['pageFingerprint']
                assert amendment['understandingEvidence'] == evidence
                for key in ['currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']:
                    assert original[key] == goal[key]
                science_refs = [refs['aE7First'], refs['aE7ActualOnePage']]
                evidence_source = refs['aE7First']
            else:
                original = data['bE7First']
                amendment = data['bE7ActualOnePage']
                evidence = original['understandingEvidence']
                rationale_parts = list(original['rationale'].values()) + [amendment['rationale']]
                decision = amendment['decision']
                assert original['decision'] == decision
                assert amendment['understandingEvidence'] == evidence
                assert amendment['goalFingerprint'] == goal['goalFingerprint']
                assert amendment['pageFingerprint'] == goal['pageFingerprint']
                whole_goal = original['wholeCurrentGoal']
                for source_key, target_key in [('title', 'currentTitleDe'), ('titleEn', 'currentTitleEn'),
                                               ('description', 'currentDescriptionDe'), ('descriptionEn', 'currentDescriptionEn')]:
                    assert whole_goal[source_key] == goal[target_key]
                science_refs = [refs['bE7First'], refs['bE7ActualOnePage']]
                evidence_source = refs['bE7First']
            assert decision == 'keep' and set(evidence) == set(EVIDENCE_KEYS)
            assert all(isinstance(evidence[key], str) and evidence[key].strip() == evidence[key] for key in EVIDENCE_KEYS)
            rationale = '\n\n'.join(rationale_parts)
            assert len(rationale) <= 4000 and all(isinstance(text, str) and text.strip() == text for text in rationale_parts)
            if label == 'D1':
                assert goal['reviewContext']['evidenceProfile'] is None
            record = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
                      'schemaVersion': 1, 'recordId': 'chemie-bcp-' + label + '-' + side + '-' + gid,
                      'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
                      'bundleFingerprint': bundle['bundleFingerprint'], 'bookDigest': bundle['bookModelDigest'],
                      **{key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint',
                          'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
                      'decision': decision, 'understandingEvidence': evidence, 'rationale': rationale,
                      'evidenceProfileContract': 'positive-understanding-evidence-v2',
                      'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'}
            record_validator.validate(record)
            records.append(record)
            mapping.append({'batch': label, 'side': side, 'goalId': gid, 'recordId': record['recordId'],
                            'ownScientificSources': science_refs, 'ownSixFieldsSource': evidence_source,
                            'ownSixFieldsObjectSha256': object_sha(evidence), 'ownRationaleParts': rationale_parts,
                            'normalSixFieldsWordExact': True, 'peerFieldsUsed': False,
                            'decision': decision, 'pageFingerprint': goal['pageFingerprint']})
        body = ''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in records).encode()
        record_path = results / (batch['batchId'] + '.records.jsonl')
        assert not record_path.exists()
        record_path.write_bytes(body)
        if label == 'D15' and side == 'a':
            first_time = last_time = data['a15First']['createdAtUTC']
            time_sources = [{'artifact': refs['a15First'], 'field': 'createdAtUTC'}]
        elif label == 'D15':
            first_time = data['b15First']['reviewedAt']
            last_time = data['b15OwnSixFields']['reviewedAt']
            time_sources = [{'artifact': refs['b15First'], 'field': 'reviewedAt'},
                            {'artifact': refs['b15OwnSixFields'], 'field': 'reviewedAt'}]
        elif side == 'a':
            first_time = data['aE7First']['createdAtUTC']
            last_time = data['aE7ActualOnePage']['reviewedAtUTC']
            time_sources = [{'artifact': refs['aE7First'], 'field': 'createdAtUTC'},
                            {'artifact': refs['aE7ActualOnePage'], 'field': 'reviewedAtUTC'}]
        else:
            first_time = data['bE7First']['reviewedAt']
            last_time = data['bE7ActualOnePage']['reviewedAt']
            time_sources = [{'artifact': refs['bE7First'], 'field': 'reviewedAt'},
                            {'artifact': refs['bE7ActualOnePage'], 'field': 'reviewedAt'}]
        actual_role = '/root/chemie_bcp_current426_fresh_independent_description_' + side + '_20261015'
        observability_path = OWN / ('metadata/' + label + '-' + side + '.original-role-and-time-observability.json')
        put(observability_path, {'role': 'Truthful retrospective original-review transport metadata; no invented execution identity or duration',
             'actualObservedTaskRoleId': actual_role, 'reviewerLabelFromOriginal': data['a15First' if side == 'a' else 'b15First']['reviewer'],
             'runtimeExactProvider': None, 'runtimeExactModel': None, 'runtimeExactModelVersion': None,
             'requiredProviderAndModelSentinel': 'not_exposed_by_runtime', 'modelVersionOmitted': True,
             'originalObservedRecordingTimestampSources': time_sources,
             'manifestStartedAtSource': first_time, 'manifestCompletedAtSource': last_time,
             'timestampInterpretation': 'Only the observed FIRST/amendment recording instants bound the retrospective artifact interval. Actual runtime execution start/end and latency were not exposed and are not asserted. For a single FIRST the interval is its one recorded instant.',
             'newScientificGenerationOccurred': False, 'providerOrModelDiversityClaimed': False,
             'generationParameterExposureDeclaration': ref(unknown_parameters)})
        run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
               'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
               'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
               'bundleFingerprint': bundle['bundleFingerprint'], 'bookDigest': bundle['bookModelDigest'],
               'provider': 'not_exposed_by_runtime', 'model': 'not_exposed_by_runtime', 'role': 'subject_reviewer',
               'promptFamilyId': 'goal-description-understanding-evidence-review-v2',
               'promptFingerprint': bundle['promptFingerprint'], 'criteriaFingerprint': bundle['criteriaFingerprint'],
               'generationParametersFingerprint': parameter_digest, 'independenceGroupId': campaign['independenceGroupId'],
               'blindToOtherRuns': True, 'goalIds': batch['goalIds'],
               'inputArtifacts': [{'role': row['role'], 'digest': row['digest']} for row in bundle['artifacts']] +
                                 [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
               'startedAt': first_time, 'completedAt': last_time, 'status': 'completed', 'outputDigest': sha(body),
               'toolchainVersion': 'skillpilot-original-FIRST-technical-transport-v1'}
        run_validator.validate(run)
        run_path = results / (batch['batchId'] + '.run.json')
        put(run_path, run)
        created.extend([ref(record_path), ref(run_path)])
        side_records[side] = records
        side_runs[side] = {'run': ref(run_path), 'observability': ref(observability_path)}
    assert [row['goalId'] for row in side_records['a']] == config['goalIds'] == [row['goalId'] for row in side_records['b']]
    authoring = {'schemaVersion': 1, 'manifestId': 'chemie-bcp-current426-' + label + '-genuine-original-A-B-technical-20261015-v1',
                 'synthesizedBy': 'Root-authorized technical binder of genuine unchanged independent FIRSTs; no new scientific vote',
                 'decisions': []}
    for first, second in zip(side_records['a'], side_records['b']):
        assert first['decision'] == second['decision'] == 'keep'
        de = ('Mechanische Paarung der unveränderten eigenen Originalurteile A=' + first['recordId'] + ' und B=' + second['recordId'] +
              ': beide KEEP für den exakten aktuellen Ziel- und Seitenkontext. Die getrennten eigenen sechs DE/EN-Felder und vollständigen Originalbegründungen bleiben in den gebundenen Records erhalten. Keine neue wissenschaftliche Stimme, keine P-Freigabe aus NULL, keine Aufhebung des getrennten Runtime-360-UI-Befunds oder der globalen Bild-HOLDs; keine Humanfreigabe.')
        en = ('Mechanical pairing of unchanged own original judgments A=' + first['recordId'] + ' and B=' + second['recordId'] +
              ': both KEEP for the exact current goal and page context. Separate own six DE/EN fields and full original rationales remain in the bound records. No new scientific vote, no P from NULL, no clearance of the separate runtime360 UI finding or global image holds, and no human approval.')
        authoring['decisions'].append({'goalId': first['goalId'], 'resolutionDecision': 'keep_current',
                                      'evidenceRound': 'second', 'rationaleDe': de, 'rationaleEn': en})
    authoring_path = root / 'synthesis-authoring.json'
    put(authoring_path, authoring)
    batch_outputs.append({'batch': label, 'goalCount': count, 'configPath': manifest['configPath'],
                          'batchDirectory': root.relative_to(REPO).as_posix(),
                          'authoring': ref(authoring_path), 'runs': side_runs})

assert len(mapping) == 32 and sum(len(EVIDENCE_KEYS) for row in mapping) == 192
supplements = []
for side, name, pointer in [('a', 'aNineContextOnly', '/contextAmendments'), ('b', 'bNineContextOnly', '/contextOnlyReviews')]:
    src = verify(refs[name])
    dst = OWN / ('context-supplements/original-' + side + '-nine-context-only.whole-source.exact.json')
    assert not dst.exists()
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)
    assert dst.read_bytes() == src.read_bytes()
    supplements.append({'source': refs[name], 'exactCopy': ref(dst), 'contextRowsJsonPointer': pointer,
                        'normalD9Created': False, 'indexCreated': False})
put(OWN / 'OPEN.original-runtime360-observations-and-global-image-holds.preserved.json', {
    'role': 'Original independent UI observations and global holds remain open; neither is settled by description pairing',
    'aObservation': data['a15First']['separateUiObservation'],
    'bFindings': data['b15First']['separateRuntimePresentationFindings'],
    'originalSources': [refs['a15First'], refs['b15First']],
    'globalImageHoldsStillOpen': True, 'uiFindingClosed': False,
    'canonicalDescriptionChangedForUi': False, 'HumanApproval': False})
for row in refs.values():
    verify(row)
for row in load(OWN / 'FILES.finite-input-transport-only.before-FIRST-release.seal.json')['files']:
    verify(row)
for row in load(e7_source_seal)['files']:
    verify(row)
assert not (OWN / 'native-relations-nine/resolution-index.json').exists()
assert list((OWN / 'native-relations-nine/round-a/results').iterdir()) == []
assert list((OWN / 'native-relations-nine/round-b/results').iterdir()) == []
put(OWN / 'TRANSPORT.genuine-D15-D1-own-original-science.exact.json', {
    'schemaVersion': 1, 'role': 'Root-released mechanical own-original D15+D1 serialization; no independent science by technical role',
    'rootRelease': ref(RELEASE), 'exactOriginalScientificArtifactsAndSeals': refs,
    'batches': batch_outputs, 'normalRecords': 32, 'normalRuns': 4,
    'ownUnderstandingFieldsWordExact': 192, 'recordProvenance': mapping,
    'normalRecordAndRunClosedSchemasCheckedBeforeStock': [ref(record_schema_path), ref(run_schema_path)],
    'serializedOutputs': created, 'contextOnlySupplements': supplements,
    'unactivatedOriginalNineTransportUnchanged': True, 'historicalEightDFileWrites': 0,
    'newPFromNull': False, 'newScientificVotes': 0, 'newRenderRuns': 0, 'CentralRuns': 0})
print(json.dumps({'genuineOwnNormalRecords': 32, 'genuineIndependentRuns': 4, 'ownFieldsWordExact': 192,
                  'pairedScientificDecisions': 16, 'D9Fabricated': 0, 'newScienceVotes': 0}), flush=True)
