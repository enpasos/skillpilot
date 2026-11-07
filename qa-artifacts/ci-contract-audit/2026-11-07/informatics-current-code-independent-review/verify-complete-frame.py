from pathlib import Path
import gzip,json,hashlib,tarfile
R=Path('/home/enpasos/projects/skillpilot');D=Path(__file__).resolve().parent;P=D.parent/'informatics-e-reviewed-current-definition-candidate';W=Path('/dev/shm/informatics-e-reviewed-current-20261107');f=json.loads(gzip.decompress((P/'input-frame-code-pins-and-postguards.json.gz').read_bytes()));h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();changes={r['path']:r for r in json.loads((P/'changed-files.json').read_bytes())['files']};drift=[]
for row in f['activeCodeInputFiles']:
 rel=row['path'];active=h(R/rel);native=h(W/'native-code'/rel);expected=changes[rel]['afterSha256'] if rel in changes else row['sha256']
 if active!=row['sha256'] or native!=expected:drift.append({'path':rel,'active':active,'expectedActive':row['sha256'],'native':native,'expectedNative':expected})
for row in f['catalogInputs']:
 if h(R/row['path'])!=row['activeSha256'] or h(W/'candidate'/row['path'])!=row['candidateSha256']:drift.append(row)
for row in changes.values():
 rel=row['path'];assert h(W/'candidate'/rel)==row['afterSha256'];assert (h(R/rel) if (R/rel).exists() else None)==row['activeBeforeSha256']
 if rel.startswith(('app/scripts/','contracts/curriculum-assessment-coverage/')):assert h(W/'native-code'/rel)==row['afterSha256']
with tarfile.open(P/'candidate-overlay.tar.gz') as t:
 files={x.name:hashlib.sha256(t.extractfile(x).read()).hexdigest() for x in t.getmembers() if x.isfile()}
assert files=={path:row['afterSha256'] for path,row in changes.items()}
for name,inv,seal in [('informatics-e-reviewed-current-definition-candidate','15c694336f9ab314861e6ba6a3a05672cdfdfb0b53c520f17241a65026c097e2','47ae9d47d191cb5144cefbe17bb6b235b82bf0eea9f6f946aeec84bd95fef513'),('informatics-current-definition-revision-plan','c5b1b4bec076cbd1e346cc063c88348f9683e177a9098a947d4b016171146e14','08ef79d009d8ab9d4e308f2d3e10cde77368683739b85e0aeff308f4125d5ca1')]:
 p=D.parent/name;assert h(p/'inventory.json')==inv;assert h(p/'seal.json')==seal
 for row in json.loads((p/'inventory.json').read_bytes())['payloads']:assert h(p/row['path'])==row['sha256']
assert not drift
r={'status':'PASS','activeCodeFilesRechecked':len(f['activeCodeInputFiles']),'executedNativeCodeInputsMatchPinnedOverlayOnOriginalFrame':True,'catalogInputsRechecked':len(f['catalogInputs']),'overlayFilesRechecked':len(changes),'candidateAndPlanSealsAndPayloadsStillExact':True,'drift':drift,'activeApplication':False}
(D/'complete-frame-postguard.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
