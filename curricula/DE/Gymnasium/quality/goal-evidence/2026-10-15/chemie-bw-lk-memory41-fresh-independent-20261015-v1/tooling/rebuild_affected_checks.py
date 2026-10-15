"""Rebuild the two ordinary memory checks in a fresh sparse host; never edit evidence.

Run from any checkout containing this package and its repository-relative inputs.
The expected current scientific result is exit 1 from each memory check.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil
import subprocess
import tempfile


def main():
    package = Path(__file__).resolve().parent.parent
    repo = next(p for p in package.parents if (p / 'AGENTS.md').is_file() and (p / 'app').is_dir())
    manifest = json.loads((package / 'checks/REBUILD.sparse-normal-aliases.json').read_text())
    host = Path(tempfile.mkdtemp(prefix='chemie-memory41-affected-checks-', dir=repo / 'tmp'))
    for source in manifest['physicalProductionCopies']:
        src = repo / source['path']
        data = src.read_bytes()
        if len(data) != source['bytes'] or 'sha256:' + hashlib.sha256(data).hexdigest() != source['sha256']:
            raise RuntimeError('Production input drift: ' + source['path'])
        dst = host / source['path']
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
    for alias in manifest['aliases']:
        dst = host / alias['normalAlias']
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists():
            dst.symlink_to(repo / alias['physicalRepositorySource'])
    (host / 'app/node_modules').symlink_to(repo / 'app/node_modules')
    results = []
    for label in ['old-nine', 'old-nine-plus-whole-BW']:
        config = (package / 'config' / (label + '.independent.memory.json')).relative_to(repo)
        args = [str(repo / 'app/node_modules/.bin/tsx'), str(host / 'app/scripts/memoryCardReview.ts'),
                '--mode=check', '--config=' + str(config)]
        started = datetime.now(timezone.utc).isoformat()
        completed = subprocess.run(args, cwd=repo, capture_output=True, text=True)
        output = host / (label + '.normal.actual.txt')
        output.write_text(completed.stdout + completed.stderr)
        results.append({'label': label, 'startedAt': started, 'exitCode': completed.returncode,
                        'output': str(output), 'expectedOriginalExitCode': 1})
    print(json.dumps({'host': str(host), 'results': results}, indent=2))


if __name__ == '__main__':
    main()
