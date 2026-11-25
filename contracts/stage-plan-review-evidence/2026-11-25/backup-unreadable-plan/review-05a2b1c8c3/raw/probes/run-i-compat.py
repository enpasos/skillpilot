from pathlib import Path
import hashlib,json,datetime,subprocess,os,shutil,tarfile,xml.etree.ElementTree as ET,sys
repo=Path.cwd(); pin='05a2b1c8c3'; out=repo/'tmp/e1-handover/reviews/backup-unreadable-plan/raw/compat';out.mkdir(exist_ok=True); s=Path('/tmp/e2-h-root/backup-compat-probe');s.mkdir(exist_ok=True)
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
sha=git('rev-parse',pin+'^{commit}').decode().strip(); assert git('rev-parse','HEAD').decode().strip()==sha
with subprocess.Popen(['git','archive',sha,'backend','.java-version'],cwd=repo,stdout=subprocess.PIPE) as p:subprocess.run(['tar','xf','-','-C',str(s)],stdin=p.stdout,check=True)
for entry in ['app','ai','scripts','curricula','contracts','docs','content']:(s/entry).mkdir(exist_ok=True)
if not (s/'.git').exists():
 subprocess.run(['git','init','-q'],cwd=s,check=True)
 (s/'.git/objects/info/alternates').write_text(git('rev-parse','--path-format=absolute','--git-path','objects').decode())
 subprocess.run(['git','update-ref','refs/heads/review',sha],cwd=s,check=True)
 subprocess.run(['git','symbolic-ref','HEAD','refs/heads/review'],cwd=s,check=True)
svc=next((s/'backend/src/main').rglob('LearnerService.java')); orig=svc.read_text(); pp=next((s/'backend/src/test').rglob('ClaudeV1CompletionRouteIntegrationTest.java')); tests=pp.read_text()
env=dict(os.environ, JAVA_HOME=str(repo/'tmp/ci-tools/amazon-corretto-25.0.2.10.1'), SKILLPILOT_BACKEND_BUILD_DIR=str(s/'build'))
env['PATH']=env['JAVA_HOME']+'/bin:'+str(repo/'tmp/ci-tools/node-v20.20.2-linux-x64/bin')+':'+env['PATH']
env['GRADLE_USER_HOME']=str(Path.home()/'.gradle')
pos='*.LearnerServiceTest.';panels=[('prior-foreign-subject-contract',orig,['signedPlanImportRejectsAtomicGoalsOutsideThePersonalSubjectScope'])]
env['PROBE_REPO']=str(repo);env['PROBE_SCRATCH']=str(s)
bind='mount --make-rprivate /; for d in app ai scripts curricula contracts docs content; do mount --bind "$PROBE_REPO/$d" "$PROBE_SCRATCH/$d"; mount -o remount,ro,bind "$PROBE_SCRATCH/$d"; done; exec "$@"'
for tag,code,sel in panels:
 svc.write_text(code); cmd=['./gradlew','--offline','--no-daemon','--max-workers=2','-PbackendTestForks=1','test']
 for m in sel: cmd+=['--tests',pos+m]
 start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (out/(tag+'.log')).open('wb') as f: rc=subprocess.run(['unshare','-Ur','-m','bash','-euo','pipefail','-c',bind,'--',*cmd],cwd=s/'backend',env=env,stdout=f,stderr=subprocess.STDOUT).returncode
 xmls=list((s/'build/test-results/test').glob('TEST-*.xml')); rd=[]
 for xml in xmls:
  shutil.copy2(xml,out/(tag+'-'+xml.name)); tree=ET.parse(xml);rd.append({k:tree.getroot().get(k) for k in ['name','tests','failures','errors','skipped']})
 result={'head':sha,'panel':tag,'started':start,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':rc,'javaSourceSha256':hashlib.sha256(svc.read_bytes()).hexdigest(),'testsSourceSha256':hashlib.sha256(pp.read_bytes()).hexdigest(),'suites':rd}
 (out/(tag+'.actual.json')).write_text(json.dumps(result,indent=2)+'\n');print(tag,rc,rd,flush=True)
 if not rd:break
