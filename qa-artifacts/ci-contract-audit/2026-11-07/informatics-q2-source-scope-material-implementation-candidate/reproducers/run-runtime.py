import pathlib,subprocess,json,time,sys,hashlib
W=pathlib.Path('/dev/shm/informatics-q2-implementation-20261107');R=pathlib.Path('/home/enpasos/projects/skillpilot');OLD=pathlib.Path('/dev/shm/powi-native-focus-verification-20261107');deps=pathlib.Path('/dev/shm/powi-native-validated-20261107/dependencies-classpath.txt').read_text().strip();java=R/'tmp/amazon-corretto-25.0.2.10.1/bin';classes=W/'harness-classes';classes.mkdir(exist_ok=True);cp=str(OLD/'branch-classes')+':'+deps
run=subprocess.run([str(java/'javac'),'-cp',cp,'-d',str(classes),str(W/'InfoNativeCandidateProbe.java')],capture_output=True,text=True);(W/'runtime-compile.stdout').write_text(run.stdout);(W/'runtime-compile.stderr').write_text(run.stderr);assert run.returncode==0,run.stderr
label=sys.argv[1] if len(sys.argv)>1 else 'candidate';tree=W/('frozen'if label=='baseline'else'candidate');cmd=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--ro-bind','/tmp/skillpilot-plan-gradle-20261022','/tmp/skillpilot-plan-gradle-20261022','--bind',str(W),str(W),'--ro-bind',str(OLD),str(OLD),'--ro-bind',str(tree/'curricula'),str(R/'curricula'),'--chdir',str(R),'--',str(java/'java'),'-Xmx1024m','-cp',str(classes)+':'+cp,'InfoNativeCandidateProbe',str(R),str(W),label]
t=time.time()
with (W/(label+'.runtime.stdout')).open('w')as o,(W/(label+'.runtime.stderr')).open('w')as e:
 p=subprocess.Popen(cmd,stdout=o,stderr=e);receipt={'pid':p.pid,'started':t,'command':cmd,'sourceSha256':hashlib.sha256((tree/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json').read_bytes()).hexdigest()};(W/(label+'.runtime.execution.json')).write_text(json.dumps(receipt));rc=p.wait()
receipt.update(exitCode=rc,finished=time.time());(W/(label+'.runtime.execution.json')).write_text(json.dumps(receipt));print('terminal',label,rc)
if rc:print((W/(label+'.runtime.stderr')).read_text()[-3000:])
raise SystemExit(rc)
