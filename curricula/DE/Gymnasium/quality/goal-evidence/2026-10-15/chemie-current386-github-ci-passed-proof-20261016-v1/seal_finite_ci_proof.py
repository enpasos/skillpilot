"""Bind public API subsets to the actual local HEAD, without Git or workflow writes."""
import datetime
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = next(p for p in ROOT.parents if (p / 'AGENTS.md').is_file())
HEAD = '0d2d23b3fba59eff06fc01834ebab072d92437b4'


def ref(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}


def write_new(path, value):
    with path.open('x') as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write('\n')


def metadata(name):
    return json.loads((ROOT / (name + '.actual-public-metadata.json')).read_text())


def fields(name):
    return metadata(name)['publicFields']


repository = fields('repository')
remote = fields('remote-main')
commit = fields('commit')
main = fields('main-run')
jobs = fields('main-jobs')
checks = fields('head-checkruns')
workflows = fields('head-workflows')
legacy = fields('head-status')
assert repository['full_name'] == 'enpasos/skillpilot' and repository['private'] is False
actual_local = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=REPO, capture_output=True, text=True, check=True).stdout.strip()
assert actual_local == remote['object']['sha'] == commit['sha'] == HEAD
assert remote['ref'] == 'refs/heads/main'
assert main['id'] == 38809729979 and main['head_sha'] == HEAD
assert main['status'] == 'completed' and main['conclusion'] == 'success'
assert jobs['total_count'] == len(jobs['jobs']) == 8
assert checks['total_count'] == len(checks['check_runs']) == 16
assert workflows['total_count'] == len(workflows['workflow_runs']) == 5
for job in jobs['jobs']:
    assert job['status'] == 'completed' and job['conclusion'] == 'success'
    assert job['run_id'] == main['id']
for group in [checks['check_runs'], workflows['workflow_runs']]:
    for item in group:
        assert item['head_sha'] == HEAD
        assert item['status'] == 'completed' and item['conclusion'] == 'success'
assert legacy['sha'] == HEAD and legacy['total_count'] == 0 and legacy['statuses'] == []
new_d_selector = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-eight-final-written-page-bindings-a-20261016-v1/FINAL.own-current-D8-normalrecords-and-exact-inputs.selector.json'
uncommitted_probe = subprocess.run(['git', 'cat-file', '-e', HEAD + ':' + new_d_selector], cwd=REPO, capture_output=True, text=True)
assert uncommitted_probe.returncode != 0
local = {
    'format': 'finite local read-only commit binding v1',
    'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'repository': repository['full_name'], 'actualLocalHead': actual_local,
    'remoteMainFromIndependentActualApi': remote['object']['sha'],
    'commitUrl': commit['html_url'],
    'newOwnEightReviewOutputSelector': new_d_selector,
    'newOwnEightReviewOutputSelectorPresentInCommittedTree': False,
    'readOnlyCommands': [['git', 'rev-parse', 'HEAD'], ['git', 'cat-file', '-e', HEAD + ':' + new_d_selector]],
    'gitWorkflowOrRemoteMutation': False,
}
write_new(ROOT / 'local-head.actual-read-only-binding.json', local)
names = ['repository', 'remote-main', 'commit', 'main-run', 'main-jobs', 'head-checkruns', 'head-workflows', 'head-status']
api_refs = [ref(ROOT / (name + '.actual-public-metadata.json')) for name in names]
proof = {
    'format': 'finite live public GitHub CI passed proof v1',
    'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'repository': repository['full_name'], 'repositoryPublic': True,
    'headSha': HEAD, 'localHeadEqualsActualRemoteMain': True,
    'commitUrl': commit['html_url'], 'mainRunUrl': main['html_url'],
    'mainRunId': main['id'], 'mainRunStatus': main['status'], 'mainRunConclusion': main['conclusion'],
    'mainRunJobs': {'success': 8, 'total': 8},
    'headCheckRuns': {'success': 16, 'total': 16},
    'headWorkflowRuns': {'success': 5, 'total': 5},
    'allFiniteApiCollectionsFullyReturned': True,
    'apiObservations': [{'endpoint': metadata(name)['endpoint'], 'retrievedAt': metadata(name)['retrievedAt']} for name in names],
    'earlierSnapshotWasNotUsedAsLiveProof': True,
    'checkCountChangeFromTaskSnapshot': {'previousCountReportedInTask': 14, 'actualCurrentCount': 16, 'note': 'Current head has two successful Claude Support Synthetic runs; each contributes Synthetic Unit Tests and Live Read-Only Synthetic. Both current runs are preserved in the finite workflow subset.'},
    'legacyCommitStatusApi': {'state': legacy['state'], 'total_count': 0, 'statuses': [], 'interpretation': 'The legacy statuses collection is empty. Its pending aggregate is preserved verbatim and is not asserted to be a pending Actions/check-run result. Success statements here refer explicitly to the independently read check-runs and Actions workflows/jobs.'},
    'scopeDe': 'Der Live-Nachweis gilt exakt für den bereits committeten Baum 0d2d23b3fba59eff06fc01834ebab072d92437b4, den im Auftrag als committed386 bezeichneten Stand. Er berechnet diese fachliche 386-Zuordnung nicht neu. Die acht neuen uncommitteten Review-Ergebnisse und andere uncommittete Änderungen werden nicht als durch diesen CI-Lauf geprüft behauptet.',
    'newUntrackedEightReviewResultsCiTested': False,
    'localBinding': ref(ROOT / 'local-head.actual-read-only-binding.json'),
    'finitePublicApiSubsets': api_refs,
    'rawLogsDownloaded': False, 'rawApiResponsesHeadersStderrOrDebugSaved': False,
    'privateAccountFieldsOrEmailsSaved': False,
    'gitMutation': False, 'workflowDispatchOrCancel': False, 'pluginUsed': False,
    'HumanApproval': False, 'HumanTrial': False,
}
proof_path = ROOT / 'PROOF.actual-head-public-ci-passed.json'
write_new(proof_path, proof)
seal_path = ROOT / 'FILES.finite-public-ci-proof.seal.json'
files = sorted(p for p in ROOT.iterdir() if p.is_file())
write_new(seal_path, {'schemaVersion': 1, 'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'files': [ref(p) for p in files]})
print(json.dumps({'proof': ref(proof_path), 'seal': ref(seal_path), 'headSha': HEAD, 'mainRunUrl': main['html_url'], 'jobs': '8/8 success', 'checks': '16/16 success', 'workflows': '5/5 success'}, ensure_ascii=False, indent=2))
