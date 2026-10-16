"""Read-only finite GitHub API projection. Never emit raw API, stderr, headers or debug."""
import datetime
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = 'enpasos/skillpilot'
HEAD = '0d2d23b3fba59eff06fc01834ebab072d92437b4'
RUN = 38809729979
TASKS = {
    'repository': f'repos/{REPO}',
    'remote-main': f'repos/{REPO}/git/ref/heads/main',
    'commit': f'repos/{REPO}/commits/{HEAD}',
    'main-run': f'repos/{REPO}/actions/runs/{RUN}',
    'main-jobs': f'repos/{REPO}/actions/runs/{RUN}/jobs?per_page=100&filter=latest',
    'head-checkruns': f'repos/{REPO}/commits/{HEAD}/check-runs?per_page=100&filter=latest',
    'head-workflows': f'repos/{REPO}/actions/runs?head_sha={HEAD}&per_page=100',
    'head-status': f'repos/{REPO}/commits/{HEAD}/status?per_page=100',
}


def subset(value, keys):
    return {key: value.get(key) for key in keys}


def run_fields(value):
    return subset(value, ['id', 'name', 'head_branch', 'head_sha', 'run_number', 'run_attempt',
                          'event', 'status', 'conclusion', 'workflow_id', 'html_url', 'created_at', 'updated_at'])


def main():
    task = sys.argv[1]
    endpoint = TASKS[task]
    env = dict(os.environ)
    for key in ['GH_DEBUG', 'DEBUG', 'GH_FORCE_TTY']:
        env.pop(key, None)
    env['GH_PROMPT_DISABLED'] = '1'
    result = subprocess.run(['gh', 'api', '--method', 'GET', endpoint], capture_output=True, text=True, env=env, timeout=90)
    if result.returncode:
        print(json.dumps({'task': task, 'status': 'api_command_failed', 'exitCode': result.returncode, 'rawOutputSuppressed': True}))
        return 1
    try:
        value = json.loads(result.stdout)
    except json.JSONDecodeError:
        print(json.dumps({'task': task, 'status': 'api_response_not_json', 'rawOutputSuppressed': True}))
        return 1
    if task == 'repository':
        projected = subset(value, ['full_name', 'private', 'visibility', 'html_url', 'default_branch'])
    elif task == 'remote-main':
        projected = {'ref': value['ref'], 'object': subset(value['object'], ['type', 'sha', 'url'])}
    elif task == 'commit':
        projected = subset(value, ['sha', 'html_url'])
        projected['parents'] = [subset(parent, ['sha', 'html_url']) for parent in value['parents']]
    elif task == 'main-run':
        projected = run_fields(value)
    elif task == 'main-jobs':
        projected = {'total_count': value['total_count'], 'jobs': [subset(job, ['id', 'name', 'status', 'conclusion', 'started_at', 'completed_at', 'html_url', 'run_id', 'run_attempt']) for job in value['jobs']]}
    elif task == 'head-checkruns':
        projected = {'total_count': value['total_count'], 'check_runs': [subset(check, ['id', 'name', 'head_sha', 'status', 'conclusion', 'started_at', 'completed_at', 'html_url', 'details_url']) for check in value['check_runs']]}
    elif task == 'head-workflows':
        projected = {'total_count': value['total_count'], 'workflow_runs': [run_fields(run) for run in value['workflow_runs']]}
    else:
        projected = {'sha': value['sha'], 'state': value['state'], 'total_count': value['total_count'],
                     'statuses': [subset(status, ['context', 'state', 'target_url', 'updated_at']) for status in value['statuses']]}
    output = {'format': 'finite public GitHub CI API field projection v1',
              'retrievedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'method': 'GET', 'endpoint': endpoint, 'repository': REPO, 'requestedHead': HEAD,
              'publicFields': projected, 'rawResponseHeadersStderrDebugStored': False}
    path = ROOT / (task + '.actual-public-metadata.json')
    with path.open('x') as stream:
        json.dump(output, stream, ensure_ascii=False, indent=2)
        stream.write('\n')
    print(json.dumps({'task': task, 'status': 'saved', 'path': str(path), 'bytes': path.stat().st_size}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
