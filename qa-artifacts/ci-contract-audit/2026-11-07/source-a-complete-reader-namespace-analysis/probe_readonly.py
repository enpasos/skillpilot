#!/usr/bin/env python3
"""Small diagnostic processes only; no QA producer, Git, or active mutations."""
import datetime
import gzip
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[3]
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
sha = lambda b: hashlib.sha256(b).hexdigest()
node = Path(shutil.which('node')).resolve(strict=True)
assert sha(node.read_bytes()) == '6295488653f0d93b0a157841746fef7e72cc4328cfb60c4bbe0ca2668a836ffd'
ram = Path(tempfile.mkdtemp(prefix='source-a-namespace-analysis-', dir='/dev/shm'))
entry = ram / 'pair/original80/app/node_modules/pkg/probe.cjs'
entry.parent.mkdir(parents=True)
js = r'''const Module=require('node:module');const path=require('node:path');
const anchors=[__filename,'/qa/pair/original80/app/node_modules/tsx/dist/cli.mjs','/qa/pair/projectedA80/app/scripts/reportDeepUnderstandingRollout.ts'];
let missing;try{require.resolve('skillpilot-controlled-missing-namespace-probe-20261107')}catch(e){missing=e.code}
console.log(JSON.stringify({execPath:process.execPath,version:process.version,globalPaths:Module.globalPaths,
  anchors:anchors.map(anchor=>({anchor,directories:Module._nodeModulePaths(path.dirname(anchor))})),missing}));
'''
entry.write_text(js)
entry.chmod(0o444)
env = {'PATH': '/usr/bin:/bin', 'LC_ALL': 'C'}
runs = []
for name, flags, extra in [
    ('current-cleared-environment', [], {}),
    ('explicit-empty-home-path', [], {'HOME': '/qa/home'}),
    ('optional-no-global-search-profile', ['--no-global-search-paths'], {'HOME': '/qa/home'}),
]:
    trace = ram / (name + '.strace')
    cmd = ['/usr/bin/strace', '-f', '-qq', '-yy', '-v', '-s', '65535', '-e', 'trace=%file', '-o', str(trace), str(node), *flags, str(entry)]
    t0 = datetime.datetime.now(datetime.timezone.utc).isoformat()
    p = subprocess.run(cmd, capture_output=True, env={**env, **extra}, cwd=entry.parent)
    t1 = datetime.datetime.now(datetime.timezone.utc).isoformat()
    assert p.returncode == 0, p.stderr
    result = json.loads(p.stdout)
    assert result['missing'] == 'MODULE_NOT_FOUND'
    if flags:
        assert result['globalPaths'] == []
    raw = trace.read_bytes()
    compressed = gzip.compress(raw, mtime=0)
    (OUT / (name + '.strace.gz')).write_bytes(compressed)
    runs.append({'name': name, 'command': cmd, 'environment': {**env, **extra}, 'cwd': str(entry.parent),
                 'startedAtActualUtc': t0, 'finishedAtActualUtc': t1, 'exitCode': p.returncode,
                 'stdout': result, 'stderr': p.stderr.decode(), 'traceRawSha256': sha(raw),
                 'traceRawBytes': len(raw), 'traceGzipSha256': sha(compressed),
                 'traceGzipPath': name + '.strace.gz'})
readelf = Path('/usr/bin/readelf')
elf = subprocess.run([str(readelf), '-l', '-d', str(node)], capture_output=True, env=env)
assert elf.returncode == 0
(OUT / 'node-readelf.txt').write_bytes(elf.stdout)
archive_cmd = ['python3', '-B', 'qa-artifacts/ci-contract-audit/2026-11-07/prepared-namespace-parent/verify-selected-evidence.py', '--check-current-code']
archive = subprocess.run(archive_cmd, capture_output=True, cwd=ROOT, env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'})
assert archive.returncode == 0, archive.stderr
report = {'startedAtActualUtc': started, 'finishedAtActualUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'purpose': 'diagnostic-native-node-search-construction-and-preserved-evidence-check-only',
          'node': {'path': str(node), 'sha256': sha(node.read_bytes())},
          'strace': {'path': '/usr/bin/strace', 'sha256': sha(Path('/usr/bin/strace').read_bytes())},
          'readelf': {'path': str(readelf), 'sha256': sha(readelf.read_bytes()), 'exitCode': elf.returncode,
                      'stdoutSha256': sha(elf.stdout), 'stdoutPath': 'node-readelf.txt'},
          'probeEntry': {'ramPath': str(entry), 'sha256': sha(entry.read_bytes()), 'code': js},
          'runs': runs,
          'historicalEvidenceVerification': {'command': archive_cmd, 'exitCode': archive.returncode,
                                             'stdout': archive.stdout.decode(), 'stderr': archive.stderr.decode(),
                                             'nativeTestsRepeated': False},
          'fullProducerOrNamespaceAcceptanceClaimed': False,
          'sourceAOrAQA02_03PassClaimed': False,
          'limits': ['Diagnostic trace runs use the ordinary host environment with explicitly cleared child environment, not the proposed namespace.',
                     'The two /qa anchors are path-construction inputs; no /qa files or future namespace were fabricated.',
                     'No failed path observed here is installed as a permission or whitelist.',
                     'readelf records the first executable layer only, not the complete transitive ELF/tool closure.',
                     'The optional no-global-search flag is a measured possible future profile, not a recommendation to alter existing producer semantics silently.']}
(OUT / 'readonly-probes.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'runs': len(runs), 'exitCodes': [r['exitCode'] for r in runs],
                  'historicalEvidenceVerifierExitCode': archive.returncode,
                  'ramRootRetained': str(ram)}, indent=2))
