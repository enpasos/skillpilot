import pathlib,json,subprocess,time,sys
W=pathlib.Path(__file__).parent;R=pathlib.Path('/home/enpasos/projects/skillpilot');label=sys.argv[1];cmd=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--bind',str(W),str(W)]
for root in ['app/scripts','app/src','contracts']:cmd+=['--ro-bind',str(W/'candidate'/root),str(R/root)]
m=json.loads((W/'frozen-manifest.json').read_text())
for row in m['files']:
 if row['path'].startswith('curricula/'):cmd+=['--ro-bind',str(W/'frozen'/row['path']),str(R/row['path'])]
scratch=W/(label+'-scratch');scratch.mkdir(exist_ok=True);cmd+=['--bind',str(scratch),str(R/'tmp'),'--setenv','TSX_DISABLE_CACHE','1','--chdir',str(R/'app'),'--']+sys.argv[2:];start=time.time()
with(W/(label+'.stdout')).open('w')as out,(W/(label+'.stderr')).open('w')as err:
 p=subprocess.Popen(cmd,stdout=out,stderr=err);(W/(label+'.execution.json')).write_text(json.dumps({'command':cmd,'pid':p.pid,'started':start}));rc=p.wait()
(W/(label+'.execution.json')).write_text(json.dumps({'command':cmd,'pid':p.pid,'started':start,'finished':time.time(),'exitCode':rc},indent=2)+'\n');print(label,'terminal',rc)
if rc:print((W/(label+'.stdout')).read_text()[-5000:]+(W/(label+'.stderr')).read_text()[-3000:])
raise SystemExit(rc)
