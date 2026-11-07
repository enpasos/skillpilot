import pathlib,json,subprocess,re,hashlib,time
W=pathlib.Path('/dev/shm/informatics-q2-implementation-20261107');R=pathlib.Path('/home/enpasos/projects/skillpilot');C=W/'candidate';p=C/'app/scripts/generateCurriculumQualityStatus.ts';s=p.read_text();old="const statusDir = resolve(repoRoot, 'docs/qa-ci/status')";assert old in s;s=s.replace(old,"const statusDir = '/dev/shm/informatics-q2-implementation-20261107/full-cqr-output'",1);probe=p.parent/'generateCurriculumQualityStatus.full-private.ts';probe.write_text(s);pins=[]
for i in range(25):
 cmd=[str(R/'app/node_modules/.bin/tsx'),str(probe)]
 with (W/'full-cqr.stdout').open('w')as out,(W/'full-cqr.stderr').open('w')as err:
  p=subprocess.Popen(cmd,stdout=out,stderr=err);receipt={'pid':p.pid,'attempt':i,'command':cmd,'started':time.time()};(W/'full-cqr.execution.json').write_text(json.dumps(receipt));rc=p.wait()
 receipt.update(exitCode=rc,finished=time.time());(W/'full-cqr.execution.json').write_text(json.dumps(receipt))
 if rc==0:break
 error=(W/'full-cqr.stderr').read_text();m=re.search(r"ENOENT.*?open '([^']+)'",error)
 if not m or not m[1].startswith(str(C)+'/'):print(error[-2500:]);break
 rel=pathlib.Path(m[1]).relative_to(C);src=R/rel
 if not src.is_file():print(error[-2500:]);break
 b=src.read_bytes();dest=C/rel;dest.parent.mkdir(exist_ok=True,parents=True);dest.write_bytes(b);pins.append({'path':str(rel),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)});print('frozen extra full-producer dependency',rel,flush=True)
(W/'full-cqr-extra-pins.json').write_text(json.dumps(pins,indent=2)+'\n');print('terminal ordinary full CQR',rc,flush=True)
raise SystemExit(rc)
