import pathlib,json,subprocess,os,time,hashlib,sys
W=pathlib.Path(__file__).parent;R=pathlib.Path('/home/enpasos/projects/skillpilot');label=sys.argv[1];tree=W/('frozen'if label.startswith('baseline')else'candidate');manifest=json.loads((W/'frozen-manifest.json').read_text());cmd=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--bind',str(W),str(W),'--ro-bind',str(W/'frozen'),str(W/'frozen'),'--ro-bind',str(W/'candidate'),str(W/'candidate')]
for root in ['app/scripts','app/src','contracts']:cmd+=['--ro-bind',str(pathlib.Path(sys.argv[3])if root=='app/scripts'and len(sys.argv)>3 else tree/root),str(R/root)]
for row in manifest['files']:
 rel=row['path']
 if rel.startswith(('app/scripts/','app/src/','contracts/')):continue
 cmd+=['--ro-bind',str(tree/rel),str(R/rel)]
cmd+=['--setenv','TSX_DISABLE_CACHE','1','--setenv','TMPDIR','/tmp','--chdir',str(R),'--',str(R/'app/node_modules/.bin/tsx'),str(pathlib.Path(sys.argv[2])if len(sys.argv)>2 else W/'native_source.mts'),label];start=time.time()
with(W/(label+'.stdout')).open('w')as out,(W/(label+'.stderr')).open('w')as err:
 p=subprocess.Popen(cmd,stdout=out,stderr=err);(W/(label+'.execution.json')).write_text(json.dumps({'pid':p.pid,'command':cmd,'started':start}));rc=p.wait()
(W/(label+'.execution.json')).write_text(json.dumps({'pid':p.pid,'command':cmd,'started':start,'finished':time.time(),'exitCode':rc}));print(label,'terminal',rc)
if rc:print((W/(label+'.stderr')).read_text()[-6000:])
raise SystemExit(rc)
