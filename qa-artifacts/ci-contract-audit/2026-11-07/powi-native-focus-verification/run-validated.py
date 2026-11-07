import pathlib,subprocess,json,time,hashlib,os,sys
OUT=pathlib.Path('/dev/shm/powi-native-validated-20261107');OLD=pathlib.Path('/dev/shm/powi-native-focus-verification-20261107');ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');FROZEN=OUT/'frozen-root';DEPS=(OUT/'dependencies-classpath.txt').read_text().strip();JAVA=ROOT/'tmp/amazon-corretto-25.0.2.10.1/bin/java'
J=lambda x:(json.dumps(x,indent=2,ensure_ascii=False)+'\n').encode()
variant,mode,label=sys.argv[1:4];pconly=len(sys.argv)>4 and sys.argv[4]=='pc-only'
cmd=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--ro-bind','/tmp/skillpilot-plan-gradle-20261022','/tmp/skillpilot-plan-gradle-20261022','--bind',str(OUT),str(OUT),'--ro-bind',str(FROZEN),str(FROZEN),'--ro-bind',str(OLD),str(OLD),'--ro-bind',str(FROZEN/'curricula'),str(ROOT/'curricula')]
policy='app/scripts/config/math-duration-split-spanning-tree-policy.json';cmd+=['--ro-bind',str(FROZEN/policy),str(ROOT/policy)]
if mode=='candidate':cmd+=['--ro-bind',str(OUT/'candidate.json'),str(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json')]
cmd+=['--chdir',str(ROOT),'--',str(JAVA),'-Xmx1024m','-Djava.io.tmpdir='+str(OUT)]
if pconly:cmd+=['-Dpowi.pcOnly=true']
cmd+=['-cp',str(OUT/'harness-classes')+':'+str(OLD/(variant+'-classes'))+':'+DEPS,'PowiNativeValidatedFocusProbe',str(ROOT),str(OUT),label]
start=time.time();receipt={'variant':variant,'mode':mode,'label':label,'pcOnly':pconly,'startedEpoch':start,'command':cmd,'commandInputsUseFrozenCurriculaOnly':True,'pid':None,'exitCode':None}
with (OUT/(label+'.stdout.txt')).open('wb') as stdout,(OUT/(label+'.stderr.txt')).open('wb') as stderr:
 process=subprocess.Popen(cmd,stdout=stdout,stderr=stderr);receipt['pid']=process.pid;(OUT/(label+'.execution.json')).write_bytes(J(receipt));print(json.dumps({'label':label,'pid':process.pid,'status':'running'}),flush=True);rc=process.wait()
receipt.update({'exitCode':rc,'finishedEpoch':time.time(),'seconds':time.time()-start,'terminalResultExists':(OUT/(label+'.json')).exists()});(OUT/(label+'.execution.json')).write_bytes(J(receipt));print(json.dumps({k:v for k,v in receipt.items() if k!='command'}),flush=True)
if rc!=0:print((OUT/(label+'.stderr.txt')).read_text()[-5000:]);sys.exit(rc)
