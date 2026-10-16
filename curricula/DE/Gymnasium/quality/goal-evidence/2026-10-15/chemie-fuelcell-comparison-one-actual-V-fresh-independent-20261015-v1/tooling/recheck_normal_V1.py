"""Recheck this single accepted image record in a new sparse host, without writes to evidence."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import tempfile


def main():
    package = Path(__file__).resolve().parent.parent
    repo = next(p for p in package.parents if (p / 'AGENTS.md').is_file() and (p / 'app').is_dir())
    evidence = json.loads((package / 'checks/STOCK.current-exact-format-aliases-and-QA438-preserved.actual.json').read_text())
    transport = json.loads((package / 'CAS.portable-source-to-normal-alias-only.json').read_text())
    host = Path(tempfile.mkdtemp(prefix='chemie-fuelcell-V1-', dir=repo / 'tmp'))
    for source in evidence['physicalStockSources']:
        src = repo / source['path']
        data = src.read_bytes()
        if len(data) != source['bytes'] or 'sha256:' + hashlib.sha256(data).hexdigest() != source['sha256']:
            raise RuntimeError('Stock source drift: ' + source['path'])
        dst = host / source['path']
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
    (host / 'app/node_modules').symlink_to(repo / 'app/node_modules')
    landscape = host / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
    landscape.parent.mkdir(parents=True)
    shutil.copyfile(package / 'candidate/one-whole-goal.explicit-bounded-QA-generator-input.json', landscape)
    for entry in transport['normalAliases']:
        source = entry['physicalRepositorySource']
        data = (repo / source['path']).read_bytes()
        if 'sha256:' + hashlib.sha256(data).hexdigest() != source['sha256']:
            raise RuntimeError('Reviewed image drift')
        dst = host / entry['normalAlias']
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(data)
    qa = host / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
    qa.parent.mkdir(parents=True)
    shutil.copyfile(package / 'qa/V1.exact-normal-alias-transport.ai-reviewed.json', qa)
    command = [str(repo / 'app/node_modules/.bin/tsx'),
               str(host / 'app/scripts/generateGoalVisualizationQaLedgers.ts'), '--subject=chemie', '--check']
    result = subprocess.run(command, cwd=host, capture_output=True, text=True)
    (host / 'normal-check.actual.txt').write_text(result.stdout + result.stderr)
    print(json.dumps({'host': str(host), 'exitCode': result.returncode,
                      'scope': 'Exactly one whole current goal and its image QA record'}, indent=2))
    raise SystemExit(result.returncode)


if __name__ == '__main__':
    main()
