# SPDX-License-Identifier: Apache-2.0
"""Replay the existing native synthesis interface in a private packet mount.

The original config/manifest and all original round/run bytes stay unchanged.
No final index or registry attachment is requested while four goals are open.
"""
from pathlib import Path
from datetime import datetime, timezone
import gzip
import hashlib
import json
import subprocess
import time

P = Path(__file__).resolve().parent
R = P.parents[3]
I = P.with_name('math-g17-fifteen-description-blind-input-candidate')
D = I.relative_to(R).as_posix()

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def main():
    frame = json.loads((I / 'private-frame.json').read_bytes())
    base = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/',
            '--proc', '/proc', '--dev-bind', '/dev', '/dev', '--tmpfs', '/tmp',
            '--bind', str(P / 'packet'), str(I / 'packet')]
    for rel in ['bundle', 'round-a', 'round-b', 'batch-manifest.json', 'synthesis-authoring.json']:
        base += ['--ro-bind', str(P / 'packet' / rel), str(I / 'packet' / rel)]
    for overlay in frame['overlays']:
        src = Path(overlay['input'])
        if src.is_file():
            assert hashlib.sha256(src.read_bytes()).hexdigest() == overlay['sha256']
        base += ['--ro-bind', str(src), overlay['target']]
    base += ['--chdir', str(R), '--', str(R / 'app/node_modules/.bin/tsx')]
    commands = [
      ('dual-summary-write', ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'summarize', '--config', D+'/batch.config.json', '--write']),
      ('synthesis-write', ['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts', '--config', D+'/batch.config.json', '--authoring', D+'/packet/synthesis-authoring.json', '--write']),
      ('resolutions-write', ['app/scripts/materializeGoalDescriptionRolloutResolutions.ts', '--config', D+'/batch.config.json', '--synthesis-manifest', D+'/packet/synthesis-decisions.json', '--write']),
      ('dual-summary-check', ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'summarize', '--config', D+'/batch.config.json']),
      ('synthesis-check', ['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts', '--config', D+'/batch.config.json', '--authoring', D+'/packet/synthesis-authoring.json']),
      ('resolutions-check', ['app/scripts/materializeGoalDescriptionRolloutResolutions.ts', '--config', D+'/batch.config.json', '--synthesis-manifest', D+'/packet/synthesis-decisions.json']),
    ]
    execution = []
    for name, args in commands:
        start = datetime.now(timezone.utc).isoformat()
        tick = time.monotonic()
        with (P/(name+'.stdout')).open('wb') as out, (P/(name+'.stderr')).open('wb') as err:
            result = subprocess.run(base+args, stdout=out, stderr=err)
        row = {'step': name, 'argv': base+args, 'startedAtActualUTC': start,
               'completedAtActualUTC': datetime.now(timezone.utc).isoformat(),
               'elapsedSeconds': time.monotonic()-tick, 'exitCode': result.returncode}
        execution.append(row)
        write(P/'native-execution.json', execution)
        print(name, result.returncode, (P/(name+'.stdout')).read_text().strip(), flush=True)
        if result.returncode:
            print((P/(name+'.stderr')).read_text(), flush=True)
            raise SystemExit(result.returncode)
    before = json.loads(gzip.decompress((P/'protected-before.json.gz').read_bytes()))
    changed = [p for p, h in before.items() if hashlib.sha256((R/p).read_bytes()).hexdigest() != h]
    original_rows = [p.relative_to(R).as_posix() for p in I.rglob('*') if p.is_file()]
    new_original_files = [p for p in original_rows if p not in before]
    write(P/'postguard.json', {'protectedFileCount': len(before), 'changedFiles': changed,
         'newOriginalPackageFiles': new_original_files, 'allProtectedBytesUnchanged': not changed and not new_original_files,
         'nativeCommandsReadOnlyOutsidePrivatePacketMount': True, 'activeSourceCodeLedgerWrites': False,
         'roundOrRunMetadataWrites': False, 'finalizeCalled': False, 'resolutionIndexCreated': False,
         'registryAttached': False, 'combinedProducerRuns': 0, 'sourceAProbes': 0, 'gitActions': 0,
         'dbActions': 0, 'deployActions': 0, 'subagents': 0})
    assert not changed and not new_original_files
    assert len(list((P/'packet/resolutions').glob('*.resolution.json'))) == 11
    assert not (P/'packet/resolution-index.json').exists()
    print('Native six-step write/check complete; eleven resolutions, four deferrals; originals unchanged.', flush=True)

if __name__ == '__main__':
    main()
