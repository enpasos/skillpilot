"""Small standalone three-context replay; no authority/index activation or capsule expansion."""
from pathlib import Path
import os, json, gzip, hashlib, shutil, subprocess
root=Path(__file__).resolve().parents[4];packet=Path(__file__).resolve().parent
work=Path(os.environ['SKILLPILOT_MATH3_V_REPLAY_OUTPUT']).resolve()
assert not work.exists() and not work.is_relative_to(root);work.mkdir(parents=True)
manifest=json.loads((packet/'manifest.json').read_bytes())
for ref in manifest['inputRefs']+manifest['productionCodePins']:
    assert hashlib.sha256((root/ref['path']).read_bytes()).hexdigest()==ref['sha256'],ref['path']
source=root/'qa-artifacts/ci-contract-audit/2026-11-07/math-inverse-image-native-prepared-candidate-v2/candidate-source.after-native-import.json.gz'
raw=gzip.decompress(source.read_bytes());assert hashlib.sha256(raw).hexdigest()=='e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06'
(work/'source.json').write_bytes(raw);copy=work/'packet';copy.mkdir()
for name in ['candidate-index.json','foreign-evidence-controls.json','verify-three.mts']:shutil.copyfile(packet/name,copy/name)
shutil.copytree(packet/'receipts',copy/'receipts')
mid='ce198bc9-b014-52ba-814f-25cc3e020668';dirs=['app/public/assets/goal-visualizations/mathematik/'+mid,'curricula/DE/Gymnasium/visualizations/mathematik/'+mid]
args=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm','--bind',str(copy),str(packet),'--ro-bind',str(work/'source.json'),str(root/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')]
for i,p in enumerate(dirs):
    assert sum(f.stat().st_size for f in (root/p).iterdir()if f.is_file())<16*1024*1024
    shutil.copytree(root/p,work/str(i));shutil.copyfile(root/'qa-artifacts/ci-contract-audit/2026-11-07/math-inverse-image-native-prepared-candidate-v2'/f'{mid}.png',work/str(i)/f'{mid}.png')
    args+=['--ro-bind',str(work/str(i)),str(root/p)]
args+=['--chdir',str(root),'--setenv','TMPDIR','/dev/shm','--',str(root/'app/node_modules/.bin/tsx'),str(packet/'verify-three.mts')]
run=subprocess.run(args,capture_output=True);(work/'stdout.json').write_bytes(run.stdout);(work/'stderr.txt').write_bytes(run.stderr)
assert run.returncode==0,run.stderr.decode(errors='replace')
result=json.loads(run.stdout);assert result['positiveCount']==3 and result['targetedMetadataNegatives']==18
assert len(result['roleReads'])==13 and len(result['originalReferences'])==10
print('Actual unchanged reader replay passed:3 genuine contexts,18 negatives,13 role reads/10 original references; no active writes.')
