from pathlib import Path
import datetime
import hashlib
import json
import os
import subprocess
import sys

import jsonschema
from referencing import Registry, Resource

ROOT = Path.cwd()
sys.path.insert(0, str(ROOT))
from scripts.validate_schemas import curriculum_symlink_errors, validate_file

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
OUT = BASE / 'biologie-sek1-insect-eight-original-seven-plus-current-fcc-one-dual-resolution-technical-20261010-v1'
ORIGINAL = BASE / 'biologie-sek1-insect-eight-raster-native-technical-author-20261010-v1'
CURRENT = BASE / 'biologie-sek1-insect-eight-frog-adult-targeted-raster-native-author-successor-v2'
FCC = 'fcc20f50-8eb3-5d6c-b37f-5be13c7d314e'


def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def binding(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': sha(data), 'bytes': len(data)}


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), str(path)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


groups = json.loads((OUT / 'native-groups.technical.json').read_text())
receipt = json.loads((OUT / 'exact-native-copy-and-scientific-freeze-verification.actual.json').read_text())
terminals = json.loads((OUT / 'checks/normal-terminal-results.actual.json').read_text())
assert len(terminals['runs']) == 12 and all(run['exitCode'] == 0 for run in terminals['runs'])
resolved = []
indexes = []
for group in groups:
    folder = OUT / group['group']
    index = json.loads((folder / 'resolution-index.json').read_text())
    synthesis = json.loads((folder / 'synthesis-decisions.json').read_text())
    expected_ids = [goal_id for goal_id in group['goalIds'] if not (goal_id == FCC and group['group'].startswith('original-eight'))]
    assert [record['goalId'] for record in index['resolutions']] == expected_ids
    assert all(record['strictDescriptionComplete'] for record in index['resolutions'])
    if group['group'].startswith('original-eight'):
        assert index['deferredGoalIds'] == [FCC]
        assert len(synthesis['decisions']) == 7
        assert len(synthesis['deferredGoals']) == 1
        deferred = synthesis['deferredGoals'][0]
        assert (deferred['goalId'], deferred['firstDecision'], deferred['secondDecision']) == (FCC, 'block', 'keep')
    else:
        assert not index.get('deferredGoalIds')
        assert not synthesis.get('deferredGoals')
        assert expected_ids == [FCC]
    for record in index['resolutions']:
        resolution = json.loads((folder / record['resolutionPath']).read_text())
        assert sha((folder / record['resolutionPath']).read_bytes()) == record['resolutionDigest']
        assert resolution['synthesis']['authority'] == 'ai_synthesis'
        assert resolution['synthesis']['humanAttestation'] is None
    resolved.extend(expected_ids)
    indexes.append({'group': group['group'], 'normalConfig': binding(Path(group['configPath'])),
                    'normalResolutionIndex': binding(folder / 'resolution-index.json'),
                    'normalDualSummary': binding(folder / 'dual-summary.json'),
                    'explicitSynthesisManifest': binding(folder / 'synthesis-decisions.json'),
                    'currentDescriptionOnlyReady': len(expected_ids),
                    'historicalOriginalDeferredGoalIds': index.get('deferredGoalIds', []),
                    'liveM7IntersectionCounted': False})
assert len(resolved) == len(set(resolved)) == 8

# Ordinary parser and explicit existing closed contracts; no new checker exceptions.
resources = []
for path in sorted(Path('contracts').rglob('*.schema.json')):
    schema = json.loads(path.read_text())
    if isinstance(schema, dict) and '$id' in schema:
        resources.append((schema['$id'], Resource.from_contents(schema)))
registry = Registry().with_resources(resources)
runtime = json.loads(Path('docs/landscape-runtime.schema.json').read_text())
record_schema = json.loads(Path('contracts/goal-description-review/v1/goal-description-review-record.schema.json').read_text())
parsed = []
closed = []
jsonl_lines = 0
jsonl_records = 0
for path in sorted(OUT.rglob('*')):
    if not path.is_file():
        continue
    if path.suffix == '.json':
        value = json.loads(path.read_text())
        assert validate_file(str(path), runtime), str(path)
        parsed.append(str(path))
        if isinstance(value, dict) and isinstance(value.get('$schema'), str) and value['$schema'].startswith('https://skillpilot.com/schemas/'):
            contract = Path('contracts') / value['$schema'].split('/schemas/', 1)[1]
            jsonschema.Draft202012Validator(json.loads(contract.read_text()), registry=registry).validate(value)
            closed.append(str(path))
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            assert line.strip(), str(path)
            value = json.loads(line)
            jsonl_lines += 1
            if path.name.endswith('.records.jsonl'):
                jsonschema.Draft202012Validator(record_schema, registry=registry).validate(value)
                jsonl_records += 1
assert jsonl_records == 18 and jsonl_lines == 36

# Normal symlink guard is read-only Git discovery, not a full curriculum QS/build.
symlink_errors = curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors
committable_result = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', str(OUT)],
                                    text=False, capture_output=True, check=True)
committable = set(os.fsdecode(path) for path in committable_result.stdout.split(b'\0') if path)
own_regular_and_links = [path for path in sorted(OUT.rglob('*')) if path.is_file() or path.is_symlink()]
assert all(str(path) in committable for path in own_regular_and_links), [str(path) for path in own_regular_and_links if str(path) not in committable]
for item in receipt['immutableSeals'] + receipt['scientificBoundArtifactsVerified']:
    assert sha(Path(item['path']).read_bytes()) == item['sha256'], item['path']
for item in receipt['copies']:
    assert sha(Path(item['targetPath']).read_bytes()) == item['sha256'], item['targetPath']
dump(OUT / 'checks/targeted-closed-schema-json-jsonl-and-portability.actual.json', {
    'schemaVersion': 1, 'performedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'ordinaryValidateFileAllOwnJsonPassed': True, 'parsedOwnJsonFiles': parsed,
    'explicitExistingClosedContractCheckedFiles': closed,
    'completeJsonlLines': jsonl_lines, 'closedDescriptionRecords': jsonl_records,
    'ordinaryCurriculumSymlinkErrors': symlink_errors, 'portableDirectoryLinks': receipt['portableBundleLinks'],
    'allOwnFilesCommittable': True, 'verifiedOwnRegularFilesAndLinks': len(own_regular_and_links),
    'immutableBoundInputsReverifiedUnchanged': len(receipt['scientificBoundArtifactsVerified']),
    'normalTerminalChecksPassed': 12, 'noCheckerOrSchemaException': True,
})

entry = {
    'schemaVersion': 1,
    'entryRole': 'Completed normal technical description dual synthesis: exact original7 plus separately targeted currentFCC1',
    'technicalCompletedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'technicalIntegrator': 'Codex existing independent A reviewer; technical synthesis after both sealed independent FIRSTs, not a third independent or human review',
    'immutableScientificAndAuthorSeals': receipt['immutableSeals'],
    'exactScientificBindingCount': len(receipt['scientificBoundArtifactsVerified']),
    'exactCopyReceipt': binding(OUT / 'exact-native-copy-and-scientific-freeze-verification.actual.json'),
    'actualWholeBothRecordComparison': binding(OUT / 'actual-both-records-comparison-and-explicit-evidence-selection.technical.json'),
    'groups': indexes, 'allEightActualCurrentGoalIds': resolved,
    'normalTerminalChecks': binding(OUT / 'checks/normal-terminal-results.actual.json'),
    'targetedSchemaAndPortability': binding(OUT / 'checks/targeted-closed-schema-json-jsonl-and-portability.actual.json'),
    'descriptionReview': {
        'originalCampaignGoalCount': 8, 'originalCurrentStrictResolutions': 7,
        'originalDeferredGoalIds': [FCC], 'originalFCCActualDecisions': {'first': 'block', 'second': 'keep'},
        'currentTargetedFCCStrictResolutions': 1, 'currentFCCActualDecisions': {'first': 'keep', 'second': 'keep'},
        'totalEightCurrentDOnlyReady': 8, 'allActualBilingualRecordsCompared': True,
        'sixAEvidenceFieldsSelectedLiterally': True, 'goalwiseBCaseLimitsPreserved': True,
        'currentCanonicalDescriptionsChanged': False, 'artificialTwoKeepDeferrals': 0,
        'historicalFCCOriginalImageRetrospectivelyApproved': False,
    },
    'operativePositiveNativeContexts': {
        'currentSevenAuthorConfig': binding(CURRENT / 'positive/seven-original-current-raster.P.exact.config.json'),
        'currentSevenAuthorRecords': binding(CURRENT / 'positive/seven-original-current-raster.P.exact.jsonl'),
        'currentOneAuthorConfig': binding(CURRENT / 'positive/one-fcc-current-raster.P.author.config.json'),
        'currentOneAuthorRecords': binding(CURRENT / 'positive/one-fcc-current-raster.P.author.review.jsonl'),
        'authorReviewIdsRetained': True, 'independentAPRecordsAndBPRecordsAreSupplementary': True,
        'scienceAndSixteenBilingualCasesUnchanged': True, 'needsHumanReview': True,
        'contract': 'positive-understanding-evidence-v2', 'authority': 'ai_candidate',
        'evidenceLevel': 'E1', 'generationLevel': 'G1', 'humanApprovals': 0,
    },
    'protectedBaseline': {'goalObjects': 479, 'curricularAtomic': 394, 'strictGoalIds': 327,
                          'role': 'Exact original source-package baseline; concurrent current central report remains authoritative',
                          'mathematicsProtectedM7': 807, 'physicsProtectedM7': 478},
    'otherGateBoundaries': {
        'sourcesAndCourses': 'Eight frozen immediate BY operators and all pre-existing whole source/course obligations remain exact; no new general source or course approval',
        'atomicityAndMemory': 'Original exact A/M science and card decisions remain historical; targeted normal retention receipts live in independent/author packages, not a fresh generic A/M approval here',
        'visualization': 'Actual independent original7 and correctedFCC1 raster/native/case judgments are in sealed A/B packages; normal technical D materialization alone grants no V approval',
        'newHumanApproval': False, 'newHumanTrial': False,
    },
    'modelEvidence': {'provider': 'OpenAI', 'exactModelVersion': 'unknown', 'samplingParameters': 'unknown',
                      'modelDiversityEstablished': False,
                      'normalLexicalDiversityOutputIsNotEvidence': True,
                      'independence': 'Distinct agents with actual FIRSTs sealed before peer judgments; no exact model diversity inferred'},
    'scopeAndProgress': {'activeRegistryWrites': False, 'activeAssetWrites': False,
                         'checkerOrGateWrites': False, 'scientificFirstOrFinalWrites': False,
                         'newActiveScientificCompletions': 0, 'activeRestoredBindings': 0,
                         'strictNetGain': 0, 'wholeM7Complete': False, 'humanReleaseGatesSeparate': True},
    'nextAuthorizedUse': 'Parent may integrate these two ordinary indexes with exact operative author P7/P1 and separately valid A/M/V/source bindings; current central five-gate report owns strict completion and live denominator',
}
entry_path = OUT / 'completed-original7-plus-currentFCC1-normal-dual-technical.entry.json'
dump(entry_path, entry)
assert validate_file(str(entry_path), runtime)
freeze = {
    'schemaVersion': 1, 'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Final additive normal technical dual synthesis; original scientific FIRSTs, actual dissent and operative P7/P1 preserved',
    'wholeOwnRegularFiles': [binding(path) for path in sorted(OUT.rglob('*'))
                             if path.is_file() and not path.is_symlink() and path.name != 'FINAL.technical.freeze.json'],
    'portableExactBundleLinks': receipt['portableBundleLinks'],
    'scientificAndAuthorInputsReverifiedUnchanged': receipt['immutableSeals'],
    'entry': binding(entry_path), 'normalTerminalChecksPassed': 12,
    'targetedSchemaAndPortabilityPassed': True, 'activeStrictNetGain': 0,
    'humanApproval': False, 'humanTrial': False,
}
freeze_path = OUT / 'FINAL.technical.freeze.json'
dump(freeze_path, freeze)
assert validate_file(str(freeze_path), runtime)
print('PASS twelve normal terminals, explicit closed contracts, ordinary parser/symlink guard, committability and all immutable inputs exact')
print('ENTRY', binding(entry_path))
print('FREEZE', binding(freeze_path))
print('Own files sealed', len(freeze['wholeOwnRegularFiles']), 'JSON', len(parsed), 'JSONL lines', jsonl_lines, 'closedRecords', jsonl_records)
