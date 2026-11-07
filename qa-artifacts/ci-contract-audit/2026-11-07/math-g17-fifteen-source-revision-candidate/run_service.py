from pathlib import Path
import json,hashlib,subprocess,datetime,os
R=Path('/home/enpasos/projects/skillpilot');P=Path(__file__).resolve().parent;s=json.loads((P/'private-workspace.json').read_bytes());W=Path(s['workspace']);C=W/'service-classes';C.mkdir(exist_ok=True);cp=Path('/dev/shm/backend-canonical-projection-scope-fixture-fix-20261107/classpath.txt').read_text().strip();jdk=R/'tmp/amazon-corretto-25.0.2.10.1/bin';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();guard=json.loads(Path('/dev/shm/backend-canonical-projection-scope-fixture-fix-20261107/production-source-guard.json').read_bytes());assert all(sha(R/p)==h for p,h in guard['sources'].items());src=[R/'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java',R/'backend/src/main/java/com/skillpilot/backend/completion/CompletionProfileCompiler.java'];records=[]
def run(name,argv):
 t=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (P/(name+'.stdout')).open('wb')as o,(P/(name+'.stderr')).open('wb')as e:rc=subprocess.run(argv,cwd=R,stdout=o,stderr=e).returncode
 records.append({'name':name,'argv':argv,'startedUTC':t,'finishedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':rc});(P/'service-execution.json').write_text(json.dumps({'records':records,'all484ProductionSourcesMatchedBaseline':True},indent=2)+'\n');assert rc==0,(name,(P/(name+'.stderr')).read_text()[-2000:])
run('service-compile',[str(jdk/'javac'),'-J-Xmx450m','-cp',cp,'-sourcepath',str(W/'empty-sourcepath'),'-d',str(C),*[str(p)for p in src],str(P/'MathFifteenPublicReplay.java')])
agent=next(Path('/tmp/skillpilot-plan-gradle-20261022/caches/modules-2/files-2.1/net.bytebuddy/byte-buddy-agent').rglob('*.jar'))
for revision in ['before','after']:
 prefix=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind',str(W),str(W),'--chdir',str(R)]
 if revision=='after':prefix+=['--ro-bind',str(W/'after.json'),str(R/s['source'])]
 run('public-'+revision,prefix+['--',str(jdk/'java'),'-Djava.io.tmpdir='+str(W/'tmp'),'-Xmx1000m','-javaagent:'+str(agent),'-cp',str(C)+':'+cp,'com.skillpilot.backend.service.MathFifteenPublicReplay',str(W/('public-'+revision+'.json'))])
b=json.loads((W/'public-before.json').read_bytes());a=json.loads((W/'public-after.json').read_bytes());assert b==a,'Actual publicPC/frontier changed';(P/'public-service-before-after.json').write_text(json.dumps({'actualPublicScenarios':len(b),'beforeAfterExactlyEqual':True,'before':b,'after':a,'noActualDatabaseOrLearnerWrites':True},indent=2)+'\n');print('Native public PC/frontier replay equal',len(b))
