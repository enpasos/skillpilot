"""Repeat only the small frozen P mechanism in private RAM and read-only overlays."""
from pathlib import Path
import gzip
import hashlib
import json
import os
import shutil
import subprocess

root = Path(__file__).resolve().parents[4]
packet = Path(__file__).resolve().parent
work = Path(os.environ['SKILLPILOT_MATRIX_P_REPLAY_OUTPUT']).resolve()
assert not work.exists() and not work.is_relative_to(root)
work.mkdir(parents=True)
manifest = json.loads((packet / 'manifest.json').read_bytes())
for row in manifest['inputRefs'] + manifest['productionCodePins']:
    assert hashlib.sha256((root / row['path']).read_bytes()).hexdigest() == row['sha256'], row['path']
mid = 'ce198bc9-b014-52ba-814f-25cc3e020668'
stem = 'qa-artifacts/ci-contract-audit/2026-11-07/math-matrix-e4de-positive-context-successor/'
source_stem = root / 'qa-artifacts/ci-contract-audit/2026-11-07/math-inverse-image-native-prepared-candidate-v2'
for name, digest in [('before-native-prepare','967a9cf8f27c5ee678777401697ba8b69874dbc889f7cfe753267f7c5a05c318'),
                     ('after-native-import','e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06')]:
    raw = gzip.decompress((source_stem / ('candidate-source.' + name + '.json.gz')).read_bytes())
    assert hashlib.sha256(raw).hexdigest() == digest
    (work / (name + '.json')).write_bytes(raw)
current = json.loads((work / 'after-native-import.json').read_bytes())
private_packet = work / 'packet'
private_packet.mkdir()
for name in ['matrix.config.json','matrix.candidates.json','matrix.review.jsonl','diagram-retained.config.json',
             'diagram-retained.review.jsonl','native-positive-probe.mts']:
    shutil.copyfile(packet / name, private_packet / name)
asset_dirs = ['app/public/assets/goal-visualizations/mathematik/' + mid, 'curricula/DE/Gymnasium/visualizations/mathematik/' + mid]
for index, path in enumerate(asset_dirs):
    assert sum(p.stat().st_size for p in (root/path).iterdir() if p.is_file()) < 16*1024*1024
    shutil.copytree(root/path, work/str(index))
    shutil.copyfile(source_stem/(mid+'.png'), work/str(index)/(mid+'.png'))

def run(name, command, source='after-native-import.json', extra=()):
    args = ['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm',
            '--bind',str(private_packet),str(root/stem),'--ro-bind',str(work/source),
            str(root/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'),
            '--chdir',str(root),'--setenv','TMPDIR','/dev/shm']
    for index, path in enumerate(asset_dirs): args += ['--ro-bind',str(work/str(index)),str(root/path)]
    for a, b in extra: args += ['--ro-bind',str(a),str(root/b)]
    args += ['--',str(root/'app/node_modules/.bin/tsx'),*command]
    result = subprocess.run(args,capture_output=True)
    (work/(name+'.stdout.txt')).write_bytes(result.stdout)
    (work/(name+'.stderr.txt')).write_bytes(result.stderr)
    return result

probe = [stem+'native-positive-probe.mts']
assert run('before-original31',probe+['old31'],'before-native-prepare.json').returncode == 0
stale = run('after-original31',probe+['old31'])
assert stale.returncode == 1 and len(json.loads(stale.stdout)['errors']) == 1
materializer = ['app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',stem+'matrix.config.json',
                '--candidates',stem+'matrix.candidates.json']
assert run('actual-materialize',materializer+['--write']).returncode == 0
assert (private_packet/'matrix.review.jsonl').read_bytes() == (packet/'matrix.review.jsonl').read_bytes()
assert run('verify-materialize',materializer).returncode == 0
assert run('after-proposed31',probe+['new31']).returncode == 0
for field, value in [('description',' Zusätzlich allgemeine 3x3-Matrizen invertieren.'),
                     ('altText',' Ergänzter Bildkontext.'),('reviewStatus','pilot')]:
    changed = json.loads(json.dumps(current)); goal = next(g for g in changed['goals'] if g['id']==mid)
    if field == 'description': goal[field] += value
    elif field == 'altText': goal['resourceLinks'][0][field] += value
    else: goal['resourceLinks'][0][field] = value
    (work/(field+'.json')).write_text(json.dumps(changed,ensure_ascii=False)+'\n')
    result = run('negative-'+field,probe+['matrix1'],field+'.json')
    assert result.returncode == 1 and 'stale reviewInputFingerprint' in '\n'.join(json.loads(result.stdout)['errors'])
changed_asset = work/'changed.png'; changed_asset.write_bytes((source_stem/(mid+'.png')).read_bytes()+b'\n')
result = run('negative-asset',probe+['matrix1'],extra=[(changed_asset,asset_dirs[0]+'/'+mid+'.png')])
assert result.returncode == 1 and 'stale reviewInputFingerprint' in '\n'.join(json.loads(result.stdout)['errors'])
record = json.loads((packet/'matrix.review.jsonl').read_bytes())
for name, patch, cause in [('owner',{'landscapeId':record['landscapeId'].upper()},'landscapeId does not match'),
                           ('ai-approved',{'status':'approved'},'data/reviewAuthority must be equal to constant')]:
    file = work/(name+'.jsonl'); file.write_text(json.dumps({**record,**patch},ensure_ascii=False)+'\n')
    result = run('negative-'+name,probe+['matrix1'],extra=[(file,stem+'matrix.review.jsonl')])
    assert result.returncode == 1 and cause in '\n'.join(json.loads(result.stdout)['errors'])
config = json.loads((packet/'matrix.config.json').read_bytes()); config['requireApproved']=True
file = work/'human-required.json'; file.write_text(json.dumps(config)+'\n')
result = run('negative-human',probe+['matrix1'],extra=[(file,stem+'matrix.config.json')])
assert result.returncode == 1 and 'configured scope requires an approved profile' in '\n'.join(json.loads(result.stdout)['errors'])
assert run('negative-before-context',probe+['matrix1'],'before-native-prepare.json').returncode == 1
print('P-only replay passed: before31; one stale old matrix; native materialize/verify; proposed31;8 meaningful negatives. No active writes.')
