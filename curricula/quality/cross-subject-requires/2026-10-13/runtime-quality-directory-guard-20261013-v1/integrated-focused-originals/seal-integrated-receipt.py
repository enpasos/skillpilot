# Apache-2.0. Verify and preserve actual focused active-code integration evidence.
from pathlib import Path
from datetime import datetime, timezone
import collections
import hashlib
import json
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET

REPO = Path('/home/enpasos/projects/skillpilot')
BASE = REPO / 'tmp/cross-subject-requires/runtime-quality-directory-guard-integrated-20261013-v1'
AUTHOR = REPO / 'tmp/cross-subject-requires/runtime-quality-directory-guard-20261013'
ARCHIVE = REPO / 'curricula/quality/cross-subject-requires/2026-10-13/runtime-quality-directory-guard-20261013-v1'
TARGETS = ['backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java',
           'backend/src/test/java/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.java']

def binding(p):
    p = Path(p)
    return {'path': str(p.relative_to(REPO)), 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(),
            'bytes': p.stat().st_size}

def check(row, path_key='path', size_key='bytes'):
    p = REPO / row[path_key]
    actual = binding(p)
    assert actual['sha256'] == row['sha256'] and actual['bytes'] == row[size_key], p

pre = json.loads((BASE / 'pre-apply-inputs.integration.json').read_bytes())
execution = json.loads((BASE / 'actual-focused-execution.integration.json').read_bytes())
assert execution['exitCode'] == 0, execution
head = subprocess.check_output(['git', 'rev-parse', '--verify', 'HEAD^{commit}'], cwd=REPO, text=True).strip()
assert pre['actualHeadBefore'] == execution['headBefore'] == execution['headAfter'] == head
for row in pre['authorOriginals']['files'] + pre['productionBaseline']['files']:
    if row['path'] not in TARGETS:
        check(row, size_key='byteLength')
for row in pre['protectedResourceAndProviderFiles']:
    check(row)
active = [binding(REPO / rel) for rel in TARGETS]
for rel in TARGETS:
    assert (REPO / rel).read_bytes() == (AUTHOR / 'candidate' / rel).read_bytes()

old_index_path = ARCHIVE / 'artifact-index.preservation-v1.json'
assert binding(old_index_path)['sha256'] == 'sha256:bf25c83fb3341477e2ed6e7f7cfb9919fd5024f27e5c6ad9ac91527358691d8b'
original_index_bytes = old_index_path.read_bytes()
old_index = json.loads(original_index_bytes)
for row in old_index['artifacts']:
    check(row, path_key='storedPath')

suites = []
xml_paths = sorted((BASE / 'build/test-results/test').glob('TEST-*.xml'))
assert len(xml_paths) == 4
for p in xml_paths:
    root = ET.parse(p).getroot()
    suite = dict(xml=binding(p), name=root.attrib['name'],
                 tests=int(root.attrib['tests']), failures=int(root.attrib['failures']),
                 errors=int(root.attrib['errors']), skipped=int(root.attrib['skipped']),
                 cases=[{'name': c.attrib['name'], 'outcome': 'failed' if c.find('failure') is not None else 'skipped' if c.find('skipped') is not None else 'passed'} for c in root.findall('testcase')])
    assert suite['failures'] == suite['errors'] == suite['skipped'] == 0, suite
    suites.append(suite)
counts = {s['name']: s['tests'] for s in suites}
assert counts == {'com.skillpilot.backend.landscape.CurriculumDirectoryScanTest': 4,
                  'com.skillpilot.backend.landscape.PrunedFileTreeTest': 4,
                  'com.skillpilot.backend.landscape.LandscapeServiceTest': 53,
                  'com.skillpilot.backend.openai.de.OpenAiDeEmbeddedServerBuildTest': 1}, counts
assert sum(counts.values()) == 62
log_path = BASE / 'focused-integrated.tests.log'
log = log_path.read_text()
assert 'BUILD SUCCESSFUL' in log
assert 'INTEGRATED_QUALITY_GUARD java=25.0.2' in log
assert '> Task :compileJava\n' in log and '> Task :compileTestJava\n' in log
assert '> Task :processResources\n' in log
assert '> Task :generateClaudePluginPublication SKIPPED' in log
assert str(BASE / 'build/classes/java/main') in log
assert str(REPO / 'backend/src/main/java') in log
assert str(REPO / 'backend/src/test/java') in log
yaml_path = BASE / 'build/resources/main/application.yml'
yaml = yaml_path.read_text()
assert '@skillpilotServerBuild@' not in yaml and 'SKILLPILOT_SERVER_BUILD' not in yaml
stamp_values = {}
for key in ['server-build', 'server-version']:
    values = re.findall(r'^\s+' + key + r':\s+"?([0-9a-f]{40}|dev)"?\s*$', yaml, re.M)
    assert values == [head], (key, values, head)
    stamp_values[key] = values[0]
compiled_paths = [BASE / 'build/classes/java/main/com/skillpilot/backend/landscape/LandscapeService.class']
for package, name in [('landscape', 'CurriculumDirectoryScanTest'), ('landscape', 'PrunedFileTreeTest'),
                      ('landscape', 'LandscapeServiceTest'), ('openai/de', 'OpenAiDeEmbeddedServerBuildTest')]:
    compiled_paths.append(BASE / f'build/classes/java/test/com/skillpilot/backend/{package}/{name}.class')
assert compiled_paths[0].read_bytes() == (AUTHOR / 'build-candidate/classes/java/main/com/skillpilot/backend/landscape/LandscapeService.class').read_bytes()
for name in ['CurriculumDirectoryScanTest', 'PrunedFileTreeTest']:
    assert (BASE / f'build/classes/java/test/com/skillpilot/backend/landscape/{name}.class').read_bytes() == (AUTHOR / f'build-candidate/classes/java/test/com/skillpilot/backend/landscape/{name}.class').read_bytes()

receipt_path = BASE / 'integrated-focused-validation.receipt-v1.json'
receipt = {
    'schemaVersion': 1, 'recordedAt': datetime.now(timezone.utc).isoformat(),
    'actor': '/root/requires_parallel_review', 'model': 'gpt-6.1-sol', 'reasoningEffort': 'ultra',
    'status': 'PASS_exact_reviewed_guard_applied_and_actual_integrated_focused_tests',
    'authorization': pre['authority'], 'exactAppliedPatch': binding(AUTHOR / 'quality-directory-guard.patch'),
    'immutablePreIntegrationPreservationIndex': binding(old_index_path),
    'originalIndependentCodeReview': binding(REPO / 'tmp/cross-subject-requires/runtime-quality-directory-guard.independent-code-review-20261013-v1.json'),
    'actualApplicationReceipt': binding(BASE / 'actual-application.integration-receipt.json'),
    'preApplyInputs': binding(BASE / 'pre-apply-inputs.integration.json'),
    'actualExecution': execution, 'actualExecutionReceipt': binding(BASE / 'actual-focused-execution.integration.json'),
    'actualActiveSourceTargetsByteExactToApprovedCandidate': active,
    'actualCurrentSelectedTestSourceBindings': [binding(REPO / p) for p in [
        TARGETS[1], 'backend/src/test/java/com/skillpilot/backend/landscape/PrunedFileTreeTest.java',
        'backend/src/test/java/com/skillpilot/backend/landscape/LandscapeServiceTest.java',
        'backend/src/test/java/com/skillpilot/backend/openai/de/OpenAiDeEmbeddedServerBuildTest.java']],
    'freshActualCompiledClasses': [binding(p) for p in compiled_paths],
    'compiledGuardAndScanAndWalkerClassesByteExactToReviewedIsolatedClasses': True,
    'suites': suites, 'totalTests': 62, 'failures': 0, 'errors': 0, 'skipped': 0,
    'actualCorrettoRuntime': '25.0.2', 'log': binding(log_path),
    'gitAndResourceStamp': {'beforeApply': pre['actualHeadBefore'], 'beforeTests': execution['headBefore'],
                           'afterTests': execution['headAfter'], 'current': head,
                           'bothActualEmbeddedProperties': stamp_values,
                           'normalProcessResourcesFilteringActuallyExecuted': True,
                           'generatedApplicationResourceBinding': binding(yaml_path),
                           'runtimeStampOverrideUsed': False},
    'resourceScope': 'Only application.yml from main resources plus ordinary content JSON/test resources needed by these four filesystem/build-stamp classes. No copied 5.9GB didactic media or generated provider publication; this is not a complete distributable build or host test.',
    'unchangedOtherInputsAfterTests': {'otherOriginalAuthorInputs': 12, 'otherProductionJavaSources': 443,
                                     'protectedResourceAndProviderFiles': len(pre['protectedResourceAndProviderFiles']),
                                     'drift': 0, 'sealedPreIntegrationIndexAndEveryStoredOriginalUnchanged': True},
    'scopeLimits': {'previousFullCICoveredNewGuard': False, 'newFullCIRun': False,
                   'nativeOwnerRequiresPlacementSourceOrHostPackageAcceptanceCreated': False,
                   'goalIdsMasteryProviderAssetsOrSourceViewsChanged': False,
                   'publishedOrDeployed': False},
    'remainingGates': ['required broader CI on integrated guard not claimed here', 'host/package acceptance outside this focused guard integration',
                       'BY runtime landscape identity and shared-goal owner resolution remain separate'],
    'licensing': {'ownCodeTestsTechnicalCodeReviewAndExecutionMetadata': 'Apache-2.0',
                  'ownEducationalKnowledgeOrDidacticReviewIfPresent': 'CC-BY-4.0 only by material function',
                  'thirdPartyDependenciesExistingSourcePortions': 'Original rights retained; no blanket mixed-package grant'},
}
with receipt_path.open('x') as f:
    f.write(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
files = [BASE / 'pre-apply-inputs.integration.json', BASE / 'actual-application.integration-receipt.json',
         BASE / 'actual-focused-execution.integration.json', BASE / 'focused-integrated.init.gradle',
         BASE / 'run-focused-integrated.sh', log_path, receipt_path, *xml_paths, *compiled_paths, Path(__file__)]
assert len(files) == 17, len(files)
rows = []
for p in files:
    target = ARCHIVE / 'integrated-focused-originals' / p.relative_to(BASE)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        assert target.read_bytes() == p.read_bytes()
    else:
        shutil.copy2(p, target)
    b = binding(p)
    assert binding(target)['sha256'] == b['sha256'] and binding(target)['bytes'] == b['bytes']
    rows.append({'originalPath': b['path'], 'storedPath': str(target.relative_to(REPO)),
                 'sha256': b['sha256'], 'bytes': b['bytes'], 'provenanceRole': 'new-original-actual-authorized-integration-evidence'})
assert old_index_path.read_bytes() == original_index_bytes
integration_index_path = ARCHIVE / 'artifact-index.integrated-focused-preservation-v1.json'
integration_index = {'schemaVersion': 1, 'recordedAt': datetime.now(timezone.utc).isoformat(),
                     'status': 'exact_additive_actual_integrated_focused_evidence',
                     'preserverActor': '/root/requires_parallel_review',
                     'originalFileCount': len(rows), 'originalBytes': sum(r['bytes'] for r in rows), 'artifacts': rows,
                     'immutablePriorPreservationIndex': binding(old_index_path),
                     'actualIntegratedReceipt': binding(receipt_path), 'actualTests': {'count': 62, 'failures': 0, 'errors': 0, 'skipped': 0},
                     'scope': receipt['scopeLimits'], 'remainingGates': receipt['remainingGates'], 'licensing': receipt['licensing']}
with integration_index_path.open('x') as f:
    f.write(json.dumps(integration_index, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'integratedReceipt': binding(receipt_path), 'durableIntegrationIndex': binding(integration_index_path),
                  'tests': 62, 'sourceTargets': active, 'head': head, 'preservedOriginals': len(rows)}, indent=2))
