"""Retain the actual projection facts without repeated whole authoring trees."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('input', type=Path)
parser.add_argument('input_sha256')
parser.add_argument('output', type=Path)
args = parser.parse_args()
actual = hashlib.sha256(args.input.read_bytes()).hexdigest()
if actual != args.input_sha256:
    raise SystemExit('Native input SHA-256 mismatch')
with gzip.open(args.input, 'rt', encoding='utf-8') as stream:
    native = json.load(stream)
keys = [
    'scope', 'personalCurriculumConfig', 'compositionViewIds',
    'targetGoalIds', 'wholeNavigationTargetGoalIds', 'prerequisiteOnlyGoalIds',
    'contextGoalIds', 'effectiveDirectPrerequisitesByContextGoalId',
    'neededContextGoalIdsAtM0', 'selectedProtectedTargetGoalIds',
    'uncoveredTargetGoalIds', 'uncoveredEndpointGoalIds',
    'unreadyAssessmentGoalIds', 'duplicateVisibleGoalPaths',
    'duplicateStructureIds', 'missingVisibleGoalIds', 'unexpectedVisibleGoalIds',
    'visibleGoalPaths', 'authoritative', 'passed',
]
result = {
    'kind': 'actual-native-empty-mastery-scope-facts-not-completion-acceptance',
    'originalNativeSha256': actual,
    'actualScopeCount': native['actualScopeCount'],
    'actualUnionCount': native['actualUnionCount'],
    'measurementRepositoryMutationCount': native['measurementRepositoryMutationCount'],
    'measurementEventCount': native['measurementEventCount'],
    'inertLearnerUnchanged': native['inertLearnerUnchanged'],
    'publicFocusClaimsExcluded': native['publicFocusClaimsExcluded'],
    'failedScopes': native['failedScopes'],
    'scopes': [{key: row[key] for key in keys} for row in native['scopes']],
}
if len(result['scopes']) != result['actualScopeCount']:
    raise SystemExit('Scope inventory mismatch')
with args.output.open('xb') as raw:
    with gzip.GzipFile(fileobj=raw, mode='wb', filename='', mtime=0) as stream:
        stream.write(json.dumps(result, ensure_ascii=False, sort_keys=True,
                                separators=(',', ':')).encode('utf-8'))
print(json.dumps({'scopes': result['actualScopeCount'],
                  'unions': result['actualUnionCount'],
                  'bytes': args.output.stat().st_size,
                  'sha256': hashlib.sha256(args.output.read_bytes()).hexdigest()}))
