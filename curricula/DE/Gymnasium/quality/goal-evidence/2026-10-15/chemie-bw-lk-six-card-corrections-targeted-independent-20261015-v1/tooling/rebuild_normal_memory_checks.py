"""Rebuild the exact two memory checks in a new sparse host; preserve sealed evidence."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import tempfile


def main():
    package = Path(__file__).resolve().parent.parent
    repo = next(p for p in package.parents if (p / 'AGENTS.md').is_file() and (p / 'app').is_dir())
    manifest = json.loads((package / 'checks/REBUILD.current-six-corrected-sparse-host.json').read_text())
    host = Path(tempfile.mkdtemp(prefix='chemie-six-corrected-memory-', dir=repo / 'tmp'))
    for source in manifest['physicalProductionCopies']:
        src = repo / source['path']
        data = src.read_bytes()
        if len(data) != source['bytes'] or 'sha256:' + hashlib.sha256(data).hexdigest() != source['sha256']:
            raise RuntimeError('Stock source drift: ' + source['path'])
        dst = host / source['path']
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
    for entry in manifest['aliases']:
        dst = host / entry['normalAlias']
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists():
            dst.symlink_to(repo / entry['physicalRepositorySource'])
    (host / 'app/node_modules').symlink_to(repo / 'app/node_modules')
    outputs = []
    for label, expected in [('old-nine', 1), ('old-nine-plus-whole-BW', 0)]:
        cfg = (package / 'config' / (label + '.current-corrected.memory.json')).relative_to(repo)
        args = [str(repo / 'app/node_modules/.bin/tsx'), str(host / 'app/scripts/memoryCardReview.ts'),
                '--mode=check', '--config=' + str(cfg)]
        result = subprocess.run(args, cwd=repo, text=True, capture_output=True)
        raw = host / (label + '.actual.txt')
        raw.write_text(result.stdout + result.stderr)
        outputs.append({'label': label, 'exitCode': result.returncode,
                        'originalExpectedExitCode': expected, 'rawOutput': str(raw)})
    print(json.dumps({'host': str(host), 'results': outputs}, indent=2))


if __name__ == '__main__':
    main()
