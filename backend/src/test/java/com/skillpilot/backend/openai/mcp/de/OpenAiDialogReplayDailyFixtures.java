package com.skillpilot.backend.openai.mcp.de;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/** Daily-plan simulated domain states; the MCP outputs are always produced by the real adapter. */
final class OpenAiDialogReplayDailyFixtures {
    private OpenAiDialogReplayDailyFixtures() {}

    static OpenAiDialogReplayFixture create(String caseId) {
        if (!Set.of("P1", "N1", "D1", "D2", "D3", "D4", "D5", "D6").contains(caseId)) {
            throw new IllegalArgumentException("Unsupported daily fixture");
        }
        var fixture = new OpenAiDialogReplayFixture(caseId);
        fixture.state = state("Mathematik", !Set.of("D2", "D4").contains(caseId));
        if (Set.of("P1", "N1").contains(caseId)) {
            fixture.sessionValid = false;
            fixture.preparedMessage = "";
            fixture.state = null;
            return fixture;
        }
        fixture.planStatus = status("Mathematik", "D2".equals(caseId), "D4".equals(caseId));
        when(fixture.coachTools.resumeLearningPlan(eq(OpenAiDialogReplayFixture.LEARNER_ID), any()))
                .thenAnswer(invocation -> {
                    fixture.state = state("Mathematik", true);
                    fixture.planStatus = status("Mathematik", false, false);
                    return transition(fixture, "Mathematik");
                });
        when(fixture.coachTools.switchLearningPlanSubject(
                eq(OpenAiDialogReplayFixture.LEARNER_ID), any(), any())).thenAnswer(invocation -> {
                    String subject = invocation.getArgument(2);
                    if (!Set.of("Mathematik", "Physik").contains(subject)) {
                        throw new IllegalArgumentException("Unpublished fixture subject");
                    }
                    fixture.state = state(subject, true);
                    fixture.planStatus = status(subject, false, false);
                    return transition(fixture, subject);
                });
        if (Set.of("D5", "D6").contains(caseId)) {
            fixture.state = state("Mathematik", true, true);
            // Setup context is separate from the measured next turn: no synthetic tool execution.
            fixture.priorConversation = List.of(
                    Map.of("role", "user", "content", fixture.preparedMessage));
        }
        fixture.domainState.put("personalCurriculum", List.of("Mathematik", "Physik"));
        return fixture;
    }

    private static LearnerLearningPlanApi.TransitionResponse transition(
            OpenAiDialogReplayFixture fixture, String subject) {
        return new LearnerLearningPlanApi.TransitionResponse(
                UUID.fromString("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"), 1L,
                subject.equals("Physik") ? "synthetic-physics" : "synthetic-math",
                "synthetic-focus", fixture.state.activeGoal().id(), true, fixture.state);
    }

    private static LearnerPlanTodayStatus status(String current, boolean resume, boolean blocked) {
        return new LearnerPlanTodayStatus(LocalDate.parse("2026-09-09"), true, resume,
                List.of(
                        new LearnerPlanTodayStatus.SubjectStatus("synthetic-math", "Mathematik",
                                21, 2, 19, 0, !resume && !blocked && current.equals("Mathematik"), !blocked),
                        new LearnerPlanTodayStatus.SubjectStatus("synthetic-physics", "Physik",
                                27, 0, 27, 0, !resume && !blocked && current.equals("Physik"), !blocked)),
                new LearnerPlanTodayStatus.Totals(48, 2, 46, 0), blocked ? 1 : 0);
    }

    private static UnifiedLearnerStateResponse state(String subject, boolean active) {
        return state(subject, active, false);
    }

    private static UnifiedLearnerStateResponse state(String subject, boolean active, boolean visualization) {
        boolean physics = subject.equals("Physik");
        List<GoalSourceLink> resources = visualization ? List.of(new GoalSourceLink(
                "goal-visualization", "Visualisierung: Tabelle, Graph und Term",
                "/assets/goal-visualizations/mathematik/f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0/f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0.jpg",
                "image", "SkillPilot", List.of(), "Isolierte Dialogtest-Referenz, keine Bildabnahme",
                "de", "Synthetic test fixture", "synthetic-math-goal", "primary",
                "Tabelle, Graph und Funktionsterm stellen dieselben Zuordnungen dar.", "pilot")) : List.of();
        FrontierGoal goal = new FrontierGoal(
                physics ? "synthetic-physics-goal" : "synthetic-math-goal",
                visualization ? "Zwischen Tabelle, Graph und Funktionsterm wechseln"
                        : physics ? "Kräfte darstellen" : "Brüche addieren",
                visualization ? "Die lernende Person kann eine funktionale Zuordnung zwischen Tabelle, Graph und Term darstellen."
                        : physics ? "Die lernende Person kann Kräfte als Pfeile darstellen."
                        : "Die lernende Person kann Brüche addieren und das Ergebnis begründen.",
                "atomic", "tutor", null, "frontier", List.of(), resources, null, null, null, null);
        return new UnifiedLearnerStateResponse(OpenAiDialogReplayFixture.LEARNER_ID,
                new LandscapeSummary(physics ? "synthetic-physics" : "synthetic-math", subject,
                        "", "DE", "HE", "school", subject, "de", List.of()),
                List.of(goal),
                new LearnerGoals(List.of(goal), 0, 1, new GoalStats(0, 1), new GoalStats(0, 1), false),
                List.of(active ? "teachActiveGoal" : "setActiveGoal"), List.of(), Set.of(),
                "learning", active ? goal : null,
                new StateMachineInfo(active ? "TEACHING" : "SELECTING",
                        active ? "teachActiveGoal" : "setActiveGoal", List.of(), List.of(), active ? goal : null));
    }
}
