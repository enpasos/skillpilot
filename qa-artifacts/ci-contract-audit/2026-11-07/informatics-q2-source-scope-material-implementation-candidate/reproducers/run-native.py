import pathlib,subprocess,re,json,hashlib,time,os
W=pathlib.Path('/dev/shm/informatics-q2-implementation-20261107');R=pathlib.Path('/home/enpasos/projects/skillpilot');label=__import__('sys').argv[1];tree='frozen' if label.startswith('baseline') else 'candidate';pins=[]
for attempt in range(20):
 cmd=[str(R/'app/node_modules/.bin/tsx'),str(W/'native.mts'),str(W/tree),label]
 with (W/(label+'.stdout')).open('w')as out,(W/(label+'.stderr')).open('w')as err:
  p=subprocess.Popen(cmd,stdout=out,stderr=err);(W/(label+'.execution.json')).write_text(json.dumps({'pid':p.pid,'cmd':cmd,'startedAt':time.time(),'attempt':attempt}));code=p.wait()
 (W/(label+'.execution.json')).write_text(json.dumps({'pid':p.pid,'cmd':cmd,'exitCode':code,'finishedAt':time.time(),'attempt':attempt}))
 if code==0:break
 err=(W/(label+'.stderr')).read_text();m=re.search(r"ENOENT.*?open '([^']+)'",err)
 if not m or not m[1].startswith(str(W/tree)+'/'):print(err);break
 rel=pathlib.Path(m[1]).relative_to(W/tree);src=R/rel
 if not src.is_file():print(err);break
 raw=src.read_bytes();a=W/'frozen'/rel;b=W/'candidate'/rel;a.parent.mkdir(exist_ok=True,parents=True);a.write_bytes(raw);b.parent.mkdir(exist_ok=True,parents=True)
 if b.exists():b.unlink()
 os.link(a,b);pins.append({'path':str(rel),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
 print('froze required missing dependency',rel,flush=True)
(W/(label+'.discovered-dependencies.json')).write_text(json.dumps(pins,indent=2)+'\n');print('terminal',label,code)
raise SystemExit(code)
