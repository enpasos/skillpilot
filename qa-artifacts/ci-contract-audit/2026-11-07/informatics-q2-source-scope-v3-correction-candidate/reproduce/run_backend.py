import pathlib,json,subprocess,time,hashlib,sys
W=pathlib.Path(__file__).parent;R=pathlib.Path('/home/enpasos/projects/skillpilot');label=sys.argv[1];tree=W/('frozen'if label.startswith('baseline')else'candidate');cmd=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--ro-bind','/tmp/skillpilot-plan-gradle-20261022','/tmp/skillpilot-plan-gradle-20261022','--bind',str(W),str(W),'--ro-bind',str(W/'frozen'),str(W/'frozen'),'--ro-bind',str(W/'candidate'),str(W/'candidate')]
cmd+=['--ro-bind','/dev/shm/powi-native-focus-verification-20261107','/dev/shm/powi-native-focus-verification-20261107']
for row in json.loads((W/'frozen-manifest.json').read_text())['files']:
 if row['path'].startswith('curricula/')and row['path'].endswith('.json'):cmd+=['--ro-bind',str(tree/row['path']),str(R/row['path'])]
java=R/'tmp/amazon-corretto-25.0.2.10.1/bin/java';cp=str(W/'backend-probe-classes')+':'+(W/'backend-classpath.txt').read_text();cmd+=['--chdir',str(R),'--',str(java),'-Xmx768m','-cp',cp,(sys.argv[2]if len(sys.argv)>2 else'V3InfoScopeProbe'),str(R),str(W),label];t=time.time()
with(W/(label+'.runtime.stdout')).open('w')as out,(W/(label+'.runtime.stderr')).open('w')as err:
 p=subprocess.Popen(cmd,stdout=out,stderr=err);(W/(label+'.runtime.execution.json')).write_text(json.dumps({'pid':p.pid,'command':cmd,'started':t}));rc=p.wait()
(W/(label+'.runtime.execution.json')).write_text(json.dumps({'pid':p.pid,'command':cmd,'started':t,'finished':time.time(),'exitCode':rc,'sourceSha256':hashlib.sha256((tree/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json').read_bytes()).hexdigest()}));print(label,'terminal',rc)
if rc:print((W/(label+'.runtime.stderr')).read_text()[-6000:])
raise SystemExit(rc)
