import pathlib,json,hashlib,subprocess,datetime,gzip
R=pathlib.Path('/home/enpasos/projects/skillpilot');P=pathlib.Path(__file__).resolve().parent;W=pathlib.Path('/dev/shm/math-g17-first-bW32dz');C=W/'focus-classes';C.mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
cp=pathlib.Path('/dev/shm/backend-canonical-projection-scope-fixture-fix-20261107/classpath.txt').read_text().strip();java=R/'tmp/amazon-corretto-25.0.2.10.1/bin';rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
src=[R/'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java',R/'backend/src/main/java/com/skillpilot/backend/completion/CompletionProfileCompiler.java']
pins={str(p.relative_to(R)):sha(p)for p in src};guard=json.loads(pathlib.Path('/dev/shm/backend-canonical-projection-scope-fixture-fix-20261107/production-source-guard.json').read_bytes());assert all(sha(R/p)==h for p,h in guard['sources'].items())
records=[]
for name,cmd in [('compile',[str(java/'javac'),'-J-Xmx450m','-cp',cp,'-sourcepath',str(W/'no-source'),'-d',str(C),*[str(p)for p in src],str(P/'MathNativeFocusMethods.java')]),('execute',[str(java/'java'),'-Xmx450m','-cp',str(C)+':'+cp,'MathNativeFocusMethods',str(R/rel),str(W/'after.json'),str(W/'focus-methods.json')])]:
 t=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (P/('focus-'+name+'.stdout')).open('wb')as o,(P/('focus-'+name+'.stderr')).open('wb')as e:rc=subprocess.run(cmd,cwd=R,stdout=o,stderr=e).returncode
 records.append({'name':name,'command':cmd,'startedUTC':t,'finishedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':rc});assert rc==0,(name,(P/('focus-'+name+'.stderr')).read_text()[-1500:])
assert pins=={str(p.relative_to(R)):sha(p)for p in src}
(P/'focus-method-execution.json.gz').write_bytes(gzip.compress((json.dumps({'records':records,'actualCurrentRecompiledSources':pins,'other484ProductionSourcePinsVerified':True},indent=2)+'\n').encode(),mtime=0));(P/'focus-methods.json').write_bytes((W/'focus-methods.json').read_bytes());print([(r['revision'],r['scenario'],r['nativeServicePredicateAllowed'])for r in json.loads((W/'focus-methods.json').read_bytes())])
