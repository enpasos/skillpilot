from pathlib import Path
import hashlib,json,datetime,subprocess,os,shutil,tarfile,xml.etree.ElementTree as ET,sys
repo=Path.cwd(); pin='05a2b1c8c3'; out=repo/'tmp/e1-handover/reviews/backup-unreadable-plan/raw/bind';out.mkdir(exist_ok=True); s=Path('/tmp/e2-h-root/backup-bind-probe');s.mkdir(exist_ok=True)
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
needle='        learners.importLearner(learnerId, second);\n        var again'
extra='''
        String destinationId = learners.createLearner().getSkillpilotId();
        learners.importLearner(destinationId, second);
        var dest = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(destinationId, landscape).orElseThrow();
        assertThat(dest.getCurriculumId()).isEqualTo(kept.getCurriculumId());
        assertThat(dest.getScopeFingerprint()).isEqualTo(kept.getScopeFingerprint());
        assertThat(learners.getMastery(destinationId)).containsEntry(learned, 1.0);
        var exportedDestination = learners.exportLearner(destinationId);
        assertThat(exportedDestination.data().learningPlans()).filteredOn(p -> landscape.equals(p.landscapeId()))
                .singleElement().satisfies(p -> assertThat(p.blocks()).isEqualTo(unreadable));
        var fields = mapper.valueToTree(exportedDestination.data().learningPlans().getFirst());
        assertThat(fields.has("curriculumId") || fields.has("scopeFingerprint") || fields.has("capturedAt")).isFalse();
'''
assert tests.count(needle)==1; tests=tests.replace(needle,extra+needle)
needle2='        // Every reader of plans treats it as outdated, and none of them fails.'
extra2='''
        if (ownLandscape && followingPlans && (kind.equals("examTopicUnknown") || kind.equals("sectionUnknown"))) {
            var snap = learners.getLearnerState(learnerId);
            System.out.println("INDEPENDENT-PROBE kind=" + kind + " frontier=" + snap.frontier().size()
                    + " today=" + mapper.writeValueAsString(learningPlans.getCoachTodayStatus(learnerId,"de"))
                    + " canContinue=" + learningPlans.getPlan(learnerId,physics,today).canContinue());
            if (kind.equals("examTopicUnknown")) assertThat(snap.frontier()).isEmpty();
            else assertThat(snap.frontier()).isNotEmpty();
        }
'''
assert tests.count(needle2)==1; pp.write_text(tests.replace(needle2,extra2+needle2))
env=dict(os.environ, JAVA_HOME=str(repo/'tmp/ci-tools/amazon-corretto-25.0.2.10.1'), SKILLPILOT_BACKEND_BUILD_DIR=str(s/'build'))
env['PATH']=env['JAVA_HOME']+'/bin:'+str(repo/'tmp/ci-tools/node-v20.20.2-linux-x64/bin')+':'+env['PATH']
env['GRADLE_USER_HOME']=str(Path.home()/'.gradle')
pos='*.ClaudeV1CompletionRouteIntegrationTest.'; methods=['backupWithAPlanThatCannotBeReadTodayRestoresTheResultsAndKeepsThePlanAsOutdated','storedPlanWhoseExamTopicNoLongerResolvesIsOutdatedAndBreaksNoReader','backupWithAMalformedPlanIsStillRefusedAndChangesNothing']; replaces='plan = restoredOutdatedLearningPlan(learner, landscapeId, planLabel, portable.blocks(), exception);'; tx='@Transactional(readOnly = true, noRollbackFor = ResponseStatusException.class)\n    public List<String> resolveLearningPlanGoalIds'
assert orig.count(replaces)==2
if tx not in orig:
 import re
 m=re.search(r'@Transactional\(readOnly = true, noRollbackFor = ResponseStatusException.class\)\s+public .*? resolveLearningPlanGoalIds',orig);assert m; tx=m.group(0)
panels=[('head',orig,methods),('without-outdated',orig.replace(replaces,'throw exception;'),methods[:1]),('without-noRollbackFor',orig.replace(tx,tx.replace(', noRollbackFor = ResponseStatusException.class','')),methods[1:2])]
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
