package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.ui.LearnerUiController;
import jakarta.persistence.EntityManager;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SubjectExtensionPersonalizationIntegrationTest {
    private static final String LEARNER = "subject-extension-personalization";
    private static final Path FIXTURE = Path.of("../contracts/composition-view/v1.3/examples/extensions");

    @Autowired LearnerService service;
    @Autowired LearnerUiController controller;
    @Autowired LearnerRepository learners;
    @Autowired EntityManager entityManager;
    @Autowired ObjectMapper json;
    @MockitoSpyBean LandscapeService landscapes;
    @MockitoSpyBean CompositionViewService views;

    @Test
    void bothPathsPersistBaseAndMaximumThroughFlowOne() throws Exception {
        var root = json.readValue(FIXTURE.resolve("root.json").toFile(), SkillLandscape.class);
        var subject = json.readValue(FIXTURE.resolve("subject.json").toFile(), SkillLandscape.class);
        String rootId = root.getLandscapeId();
        String subjectId = subject.getLandscapeId();
        var view = json.readValue(FIXTURE.resolve("neutral.view.json").toFile(),
                new TypeReference<Map<String, Object>>() {});
        doReturn(root).when(landscapes).getById(rootId);
        doReturn(subject).when(landscapes).getById(subjectId);
        doReturn(List.of(root, subject)).when(landscapes).getClosure(rootId);
        doReturn(List.of(root, subject)).when(landscapes).getClosure(eq(rootId), anyString());
        doReturn(List.of(subject)).when(landscapes).getClosure(subjectId);
        doReturn(List.of(subject)).when(landscapes).getClosure(eq(subjectId), anyString());
        doReturn(true).when(views).hasRepositoryExtensionViews(subjectId);
        doReturn(view).when(views).findLearnerScopeView(eq(subjectId), anyMap());
        for (var goal : subject.getGoals()) {
            doReturn(subjectId).when(landscapes).getLandscapeIdForGoal(goal.getId());
            doReturn(goal).when(landscapes).getGoalDefinition(goal.getId());
        }

        var learner = new Learner();
        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(rootId);
        learner.setAutoPilot(false);
        String legacy = json.writeValueAsString(Map.of(
                rootId, Map.of("selected", true, "stage", "SekII"),
                subjectId, Map.of("selected", true, "filterId", "GK", "stage", "SekII", "preference", "retained")));
        learner.setPersonalCurriculum(legacy);
        learners.saveAndFlush(learner);

        assertThat(service.getCoachPersonalizationPlan(LEARNER).canReopenMigratedPersonalization()).isTrue();
        assertThat(learners.findById(LEARNER).orElseThrow().getPersonalCurriculum()).isEqualTo(legacy);
        var plan = service.reopenMigratedPersonalization(LEARNER);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();
        for (boolean cockpit : List.of(true, false)) {
            for (String choice : List.of(SubjectExtensionScope.BASE, SubjectExtensionScope.MAXIMUM)) {
                if (!plan.required()) {
                    var extensionDecision = plan.completedDecisions().stream()
                            .filter(decision -> "extensionScope".equals(decision.groupId()))
                            .findFirst().orElseThrow();
                    plan = service.rewindPersonalization(LEARNER, extensionDecision.rewindId());
                }
                assertThat(plan.groupId()).isEqualTo("extensionScope");
                var option = plan.options().stream()
                        .filter(value -> choice.equals(value.scopeValue())).findFirst().orElseThrow();
                Object stored = SubjectExtensionScope.storedValue(choice);
                if (cockpit) {
                    mvc.perform(put("/api/ui/learners/{skillpilotId}/personal-curriculum", LEARNER)
                                    .param("optionId", option.optionId())
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(json.writeValueAsString(Map.of(subjectId, Map.of(SubjectExtensionScope.KEY, stored)))))
                            .andExpect(status().isOk());
                } else {
                    service.patchPersonalCurriculum(LEARNER, null, null, null, option.optionId());
                }
                learners.flush();
                entityManager.clear();
                var persisted = json.readTree(learners.findById(LEARNER).orElseThrow().getPersonalCurriculum());
                assertThat(persisted.path(subjectId).path(SubjectExtensionScope.KEY)).isEqualTo(json.valueToTree(stored));
                assertThat(persisted.path(subjectId).path("preference").asText()).isEqualTo("retained");
                plan = service.getPersonalizationPlan(LEARNER);
                assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
                assertThat(plan.canReopenMigratedPersonalization()).isFalse();
            }
        }
    }
}
