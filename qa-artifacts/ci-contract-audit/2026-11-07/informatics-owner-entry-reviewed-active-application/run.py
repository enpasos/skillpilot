from pathlib import Path
import sys,json,subprocess,hashlib,datetime,os
root=Path('/home/enpasos/projects/skillpilot');b=Path(__file__).parent;author=Path('/dev/shm/informatics-owner-entry-readiness-repair-s0nr8nmh');sha=lambda x:hashlib.sha256(x).hexdigest()
def run(name,command,cwd):
 rec={'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':command,'cwd':str(cwd)}
 with (b/(name+'.stdout')).open('wb') as out,(b/(name+'.stderr')).open('wb') as err:
  p=subprocess.Popen(command,cwd=cwd,stdout=out,stderr=err,env={**os.environ,'TMPDIR':str(b),'npm_config_cache':str(b/'npm-cache')});rec['pid']=p.pid;(b/(name+'.json')).write_text(json.dumps(rec,indent=2)+'\n');code=p.wait()
 rec.update(exitCode=code,finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),stdoutSha256=sha((b/(name+'.stdout')).read_bytes()),stderrSha256=sha((b/(name+'.stderr')).read_bytes()));(b/(name+'.json')).write_text(json.dumps(rec,indent=2)+'\n');print(name,code,flush=True)
 if code:raise SystemExit(code)
mode=sys.argv[1]
if mode=='backend':
 old=json.loads((author/'final-compile.json').read_text())['command'];cp=old[old.index('-cp')+1].split(':');cp=[str(b/'classes')]+[p for p in cp if p!=str(author/'classes')]
 sources=['backend/src/main/java/com/skillpilot/backend/service/LearnerService.java','backend/src/main/java/com/skillpilot/backend/ui/LearnerUiController.java','backend/src/test/java/com/skillpilot/backend/ui/LearnerUiControllerPersonalizationTest.java','backend/src/test/java/com/skillpilot/backend/service/CanonicalSubjectScopeReadinessTest.java','backend/src/test/java/com/skillpilot/backend/service/CurriculumPersonalizationPlannerTest.java']
 guard=json.loads((b/'active-source-guard.json').read_text());assert all(sha((root/p).read_bytes())==guard['activeFiles'][p] for p in sources if p in guard['activeFiles'])
 javac=[old[0],'-J-Djava.io.tmpdir='+str(b),'-cp',':'.join(cp),'-sourcepath',str(b/'empty-sourcepath'),'-d',str(b/'classes')]+[str(root/p) for p in sources]+[str(b/'RunFocusedTests.java')]
 wrap=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm','--']
 run('active-javac-complete-test-classpath',wrap+javac,root)
 j=json.loads((author/'junit-execution.json').read_text())['command'];j[j.index('-cp')+1]=':'.join(cp);j.insert(1,'-Djava.io.tmpdir='+str(b));run('active-junit',wrap+j,root)
else:
 scripts={'labels':'testPersonalCurriculumEditorLabels.tsx','startup':'testLearnerViewStartupUi.ts','setup':'testSessionSetupCompletionUi.ts'}
 cmd=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm','--bind',str(b/'repository-tmp'),str(root/'tmp'),'--chdir',str(root/'app'),'--setenv','TMPDIR',str(b),'--setenv','npm_config_cache',str(b/'npm-cache'),'--setenv','GIT_INDEX_FILE',str(b/'workspace.index.readonly'),'--','./node_modules/.bin/tsx','scripts/'+scripts[mode]]
 run('active-'+mode,cmd,root/'app')
