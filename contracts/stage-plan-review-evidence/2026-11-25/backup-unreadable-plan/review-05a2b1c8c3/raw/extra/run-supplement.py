from pathlib import Path
import hashlib,json,datetime,subprocess,os,shutil,xml.etree.ElementTree as ET
repo=Path.cwd();out=repo/'tmp/e1-handover/reviews/backup-unreadable-plan/raw/extra';scratch=out/'native';scratch.mkdir(exist_ok=True);pin=subprocess.check_output(['git','rev-parse','05a2b1c8c3^{commit}'],cwd=repo).decode().strip();assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip()==pin
with subprocess.Popen(['git','archive',pin,'backend','.java-version'],cwd=repo,stdout=subprocess.PIPE) as p:subprocess.run(['tar','xf','-','-C',str(scratch)],stdin=p.stdout,check=True)
for d in ['app','ai','scripts','curricula','contracts','docs','content']:(scratch/d).mkdir(exist_ok=True)
if not (scratch/'.git').exists():
 subprocess.run(['git','init','-q'],cwd=scratch,check=True);(scratch/'.git/objects/info/alternates').write_text(subprocess.check_output(['git','rev-parse','--path-format=absolute','--git-path','objects'],cwd=repo).decode());subprocess.run(['git','update-ref','refs/heads/review',pin],cwd=scratch,check=True);subprocess.run(['git','symbolic-ref','HEAD','refs/heads/review'],cwd=scratch,check=True)
p=next((scratch/'backend/src/test').rglob('ClaudeV1CompletionRouteIntegrationTest.java'));text=p.read_text();marker=text.rfind('\n}');assert marker>0
extra=r'''
    @Test
    void supplementalRawShapeCheckIsNormalizationAcceptanceNotCanonicalStorage() throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", "GK");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        String atom = required.stream().filter(id -> !CompletionProfileCompiler.isAssessment(landscapeDefinitions.getGoalDefinition(id))
                && !CompletionProfileCompiler.isMemory(landscapeDefinitions.getGoalDefinition(id))).findFirst().orElseThrow();
        var raw = new LearnerLearningPlanApi.Block(" section ", " LEARNING ", " " + section + " ", " E.1 ", monday, monday,
                null, List.of(" " + atom + " ", atom), List.of(" " + section + " ", section), true);
        var form = LearnerLearningPlanService.class.getDeclaredMethod("requireWellFormedBlocks", String.class, List.class);
        form.setAccessible(true);
        assertThatCode(() -> form.invoke(null, physics, List.of(raw))).doesNotThrowAnyException();
        var saved = learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(raw)), today);
        var normalized = saved.blocks().getFirst();
        assertThat(normalized.id()).isEqualTo("section");
        assertThat(normalized.kind()).isEqualTo("learning");
        assertThat(normalized.atomicGoalIds()).containsExactly(atom);
        assertThat(normalized.goalIds()).containsExactly(section);
        assertThat(normalized).isNotEqualTo(raw);
        assertThatCode(() -> form.invoke(null, physics, saved.blocks())).doesNotThrowAnyException();
        System.out.println("SUPPLEMENT-Q2 " + mapper.writeValueAsString(Map.of("rawAccepted",true,"saveNormalized",true,
                "normalizedStoredBlocksAccepted",true,"rawKind",raw.kind(),"savedKind",normalized.kind(),
                "rawAtoms",raw.atomicGoalIds().size(),"storedAtoms",normalized.atomicGoalIds().size())));
    }

    @ParameterizedTest
    @CsvSource({"course,true", "course,false", "duration,true", "duration,false", "stage,true", "stage,false"})
    void supplementalOrdinaryScopeChangeWithoutExamDoesNotPoisonTransaction(String change, boolean following) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", "GK");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var required = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var block = new LearnerLearningPlanApi.Block("section", "learning", section, "E.1", monday, monday,
                null, required, List.of(section), true);
        learningPlans.upsert(learnerId, physics,new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(block)), today);
        configureHessianMotionUnit(change.equals("duration") ? "G8" : "G9", change.equals("stage") ? "CrossStage" : "SekII",change.equals("course") ? "LK" : "GK");
        transactions.executeWithoutResult(status -> {
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            learner.setFollowLearningPlans(following);learnerRepository.saveAndFlush(learner);
        });
        var before = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId,physics).orElseThrow();
        String bytes = before.getBlocksJson();long revision = before.getRevision();
        assertThatCode(() -> learningPlans.getPlans(learnerId,today)).doesNotThrowAnyException();
        assertThatCode(() -> learningPlans.getPlan(learnerId,physics,today)).doesNotThrowAnyException();
        assertThatCode(() -> learningPlans.getTodayStatus(learnerId,"de")).doesNotThrowAnyException();
        assertThatCode(() -> learningPlans.getCoachTodayStatus(learnerId,"de")).doesNotThrowAnyException();
        assertThatCode(() -> learners.getLearnerState(learnerId)).doesNotThrowAnyException();
        assertThatCode(() -> learningPlans.reconcile(learnerId,new LearnerLearningPlanApi.ReconcileRequest(today))).doesNotThrowAnyException();
        assertThatCode(() -> learningPlans.resumeExplicitly(learnerId,new LearnerLearningPlanApi.ReconcileRequest(today))).doesNotThrowAnyException();
        var after = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId,physics).orElseThrow();
        assertThat(after.getBlocksJson()).isEqualTo(bytes);assertThat(after.getRevision()).isEqualTo(revision);
        System.out.println("SUPPLEMENT-Q4 " + mapper.writeValueAsString(Map.of("change",change,"following",following,
                "readerAndReconcileCallsPassed",7,"planBytesUnchanged",true,"revisionUnchanged",true,
                "stale",learningPlans.getPlan(learnerId,physics,today).stale())));
    }
'''
p.write_text(text[:marker]+extra+text[marker:]);(out/'probe-methods.java.txt').write_text(extra)
env=dict(os.environ,JAVA_HOME=str(repo/'tmp/ci-tools/amazon-corretto-25.0.2.10.1'),SKILLPILOT_BACKEND_BUILD_DIR=str(scratch/'build'));env['PATH']=env['JAVA_HOME']+'/bin:'+str(repo/'tmp/ci-tools/node-v20.20.2-linux-x64/bin')+':'+env['PATH'];env['GRADLE_USER_HOME']=str(Path.home()/'.gradle');env['PROBE_REPO']=str(repo);env['PROBE_SCRATCH']=str(scratch)
bind='mount --make-rprivate /; for d in app ai scripts curricula contracts docs content; do mount --bind "$PROBE_REPO/$d" "$PROBE_SCRATCH/$d"; mount -o remount,ro,bind "$PROBE_SCRATCH/$d"; done; exec "$@"'
cmd=['./gradlew','--offline','--no-daemon','--max-workers=2','-PbackendTestForks=1','test','--init-script',str(out/'only-probe-class.init.gradle'),'--tests','*.ClaudeV1CompletionRouteIntegrationTest.supplementalRawShapeCheckIsNormalizationAcceptanceNotCanonicalStorage','--tests','*.ClaudeV1CompletionRouteIntegrationTest.supplementalOrdinaryScopeChangeWithoutExamDoesNotPoisonTransaction'];start=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (out/'native.log').open('wb') as log:rc=subprocess.run(['unshare','-Ur','-m','bash','-euo','pipefail','-c',bind,'--',*cmd],cwd=scratch/'backend',env=env,stdout=log,stderr=subprocess.STDOUT).returncode
suites=[]
for xml in (scratch/'build/test-results/test').glob('TEST-*.xml'):
 shutil.copy2(xml,out/xml.name);tree=ET.parse(xml);suites.append({k:tree.getroot().get(k) for k in ['name','tests','failures','errors','skipped']})
receipt={'head':pin,'started':start,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':rc,'command':cmd,'readOnlyNativeBindMounts':True,'productionJavaSourceEdited':False,'trackedFilesEdited':False,'mainServiceSha256':hashlib.sha256((scratch/'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java').read_bytes()).hexdigest(),'planServiceSha256':hashlib.sha256((scratch/'backend/src/main/java/com/skillpilot/backend/service/LearnerLearningPlanService.java').read_bytes()).hexdigest(),'supplementalTestMethodsSha256':hashlib.sha256(extra.encode()).hexdigest(),'suites':suites}
(out/'native.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt),flush=True)
