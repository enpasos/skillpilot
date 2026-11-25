from pathlib import Path
p=Path('/tmp/e1-regroup-r2-runtime')
base=p/'snapshot/backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1CompletionRouteIntegrationTest.java'
original=base.read_text()
same=Path('/tmp/e1-plan-regroup-20261125/following.java').read_text()
same=same.replace('output.put("canContinue",view.canContinue());', '''output.put("canContinue",view.canContinue());
        output.put("today",learningPlans.getTodayStatus(learnerId,"de").subjects().getFirst());
        output.put("activePilot", org.springframework.test.util.ReflectionTestUtils.getField(learners, "unitAssessmentPilotEnabled"));
        output.put("test", "public-plan-continuation");''')
same=same.replace('assertThat(view.stale()).isFalse();','''assertThat(view.stale()).isFalse();
        assertThat(view.nextEligibleGoal()).isEqualTo(new LearnerLearningPlanApi.NextEligibleGoal(moved));
        assertThat(view.canContinue()).isTrue();
        assertThat(output.get(wholeFormerSection ? "automaticFocus" : "resumedFocus")).isEqualTo(moved);
        assertThat(output.get(wholeFormerSection ? "automaticActive" : "resumedActive")).isEqualTo(moved);''')
(p/'observeContinuation.java').write_text(same)
for setting in ('On','Off'):
    name='Round2'+setting+'IntegrationTest'
    source=original.replace('class ClaudeV1CompletionRouteIntegrationTest', 'class '+name).replace('jdbc:h2:mem:completion-mcp;', 'jdbc:h2:mem:regroup-round2-'+setting.lower()+';')
    if setting=='Off':
        source=source.replace('skillpilot.completion.unit-assessment-pilot-enabled=true','skillpilot.completion.unit-assessment-pilot-enabled=false')
    source=source[:source.rindex('}')]+same+'\n'+(p/'observeMulti.java').read_text()+'\n}\n'
    (p/'probes'/f'{name}.java').write_text(source)
(p/'probe.init.gradle').write_text(Path('/tmp/e1-plan-regroup-20261125/probe.init.gradle').read_text().replace('/tmp/e1-plan-regroup-20261125/probes', str(p/'probes')))
