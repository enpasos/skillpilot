package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.CreateLearnerResponse;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.ClientStateRequest;
import com.skillpilot.backend.api.ClientStateResponse;
import com.skillpilot.backend.api.ClientStateSnapshot;
import com.skillpilot.backend.api.ChatStartRequest;
import com.skillpilot.backend.api.ChatStartResponse;
import com.skillpilot.backend.api.CompatibilityArchiveResponse;
import com.skillpilot.backend.api.BulkCanonicalGymnasiumCutoverRequest;
import com.skillpilot.backend.api.BulkCanonicalGymnasiumCutoverResponse;
import com.skillpilot.backend.api.MasteryResponse;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.FrontierResponse;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.PersonalizationRewindRequest;
import com.skillpilot.backend.api.PlannedGoalsRequest;
import com.skillpilot.backend.api.PlannedGoalsResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.CreateLearnerRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdatePersonalCurriculumRequest;
import com.skillpilot.backend.api.LearnerDataDTO;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
@RestController
@RequestMapping(value = "/api/ui/learners", produces = MediaType.APPLICATION_JSON_VALUE)
public class LearnerUiController {

    private final LearnerService learnerService;
    private final ChatSessionService chatSessionService;

    public LearnerUiController(LearnerService learnerService, ChatSessionService chatSessionService) {
        this.learnerService = learnerService;
        this.chatSessionService = chatSessionService;
    }

    @PostMapping
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public CreateLearnerResponse createLearner(@RequestBody(required = false) CreateLearnerRequest request) {
        Learner learner = learnerService.createLearner(request);
        UnifiedLearnerStateResponse state = learnerService.getLearnerState(learner.getSkillpilotId());
        return new CreateLearnerResponse(
                state,
                learnerService.getAvailableLandscapes(false));
    }

    @GetMapping("/{skillpilotId}/state")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse getLearnerState(@PathVariable String skillpilotId) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getLearnerState(skillpilotId);
    }

    @GetMapping("/{skillpilotId}/personalization-plan")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public PersonalizationPlan getPersonalizationPlan(@PathVariable String skillpilotId) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getPersonalizationPlan(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/personalization-options")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public PersonalizationPlan applyPersonalizationOption(
            @PathVariable String skillpilotId,
            @RequestBody PersonalizationRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        if (request == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Personalization request is required.");
        }
        if (request.optionId() == null || request.optionId().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A current opaque personalization option is required.");
        }
        learnerService.patchPersonalCurriculum(
                skillpilotId,
                request.config(),
                request.goalIds(),
                request.filters(),
                request.optionId());
        return learnerService.getPersonalizationPlan(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/personalization-restart")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public PersonalizationPlan restartPersonalization(@PathVariable String skillpilotId) {
        learnerService.assertWritableLearningSession(skillpilotId);
        return learnerService.restartPersonalization(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/personalization-reopen")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public PersonalizationPlan reopenMigratedPersonalization(
            @PathVariable String skillpilotId) {
        learnerService.assertWritableLearningSession(skillpilotId);
        return learnerService.reopenMigratedPersonalization(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/personalization-rewind")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public PersonalizationPlan rewindPersonalization(
            @PathVariable String skillpilotId,
            @RequestBody(required = false) PersonalizationRewindRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        if (request == null
                || request.rewindId() == null
                || request.rewindId().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A current opaque personalization rewind reference is required.");
        }
        return learnerService.rewindPersonalization(skillpilotId, request.rewindId());
    }

    @GetMapping("/{skillpilotId}/landscapes/{landscapeId}/closure")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public java.util.List<com.skillpilot.backend.landscape.SkillLandscape> getLearnerLandscapeClosure(
            @PathVariable String skillpilotId,
            @PathVariable String landscapeId,
            @RequestParam(defaultValue = "de") String lang) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getLearnerLandscapeClosure(skillpilotId, landscapeId, lang);
    }

    @GetMapping("/{skillpilotId}/compatibility-archive")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public CompatibilityArchiveResponse exportCompatibilityArchive(@PathVariable String skillpilotId) {
        return learnerService.exportCompatibilityArchive(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/cutover/canonical-gymnasium")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse cutoverCanonicalGymnasium(@PathVariable String skillpilotId) {
        learnerService.cutoverLegacyHessenGymnasiumToCanonicalAndPersistPlannedGoals(skillpilotId);
        return learnerService.getLearnerState(skillpilotId);
    }

    @PostMapping("/cutover/canonical-gymnasium/bulk")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public BulkCanonicalGymnasiumCutoverResponse bulkCutoverCanonicalGymnasium(
            @Valid @RequestBody BulkCanonicalGymnasiumCutoverRequest request) {
        return learnerService.bulkCutoverLegacyHessenGymnasiumToCanonical(request.skillpilotIds(), request.dryRun());
    }

    @GetMapping("/{skillpilotId}/client-state/{nodeId}")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public ClientStateSnapshot getClientState(@PathVariable String skillpilotId, @PathVariable String nodeId) {
        return learnerService.getClientState(skillpilotId, nodeId);
    }

    @PutMapping("/{skillpilotId}/client-state/{nodeId}")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public ClientStateResponse upsertClientState(@PathVariable String skillpilotId, @PathVariable String nodeId,
            @RequestBody(required = false) ClientStateRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        return learnerService.upsertClientState(skillpilotId, nodeId, request);
    }

    @PostMapping("/{skillpilotId}/scope")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public void setScope(@PathVariable String skillpilotId, @RequestBody ScopeRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setScope(skillpilotId, request.goalIds());
    }

    @PostMapping("/{skillpilotId}/active-goal")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse setActiveGoal(@PathVariable String skillpilotId,
            @Valid @RequestBody ActiveGoalRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setActiveGoal(skillpilotId, request.goalId());
        return learnerService.getLearnerState(skillpilotId);
    }

    @GetMapping("/{skillpilotId}/mastery")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public MasteryResponse getMastery(@PathVariable String skillpilotId) {
        return new MasteryResponse(learnerService.getMastery(skillpilotId));
    }

    @GetMapping("/{skillpilotId}/frontier")
    @Operation(summary = "Get next learnable goals", description = "Computes the frontier for a learner – goals whose prerequisites are mastered (>= 0.9) and which are not yet fully mastered.", extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public FrontierResponse getFrontier(@PathVariable String skillpilotId) {
        return new FrontierResponse(learnerService.getFrontier(skillpilotId));
    }

    @GetMapping("/{skillpilotId}/planned")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public PlannedGoalsResponse getPlanned(@PathVariable String skillpilotId) {
        return new PlannedGoalsResponse(learnerService.getPlannedGoals(skillpilotId));
    }

    @PutMapping("/{skillpilotId}/planned")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public PlannedGoalsResponse setPlanned(
            @PathVariable String skillpilotId,
            @Valid @RequestBody PlannedGoalsRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        return new PlannedGoalsResponse(learnerService.setPlannedGoals(skillpilotId, request.goals()));
    }

    @GetMapping("/{skillpilotId}")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public Learner getLearner(@PathVariable String skillpilotId) {
        return learnerService.getLearner(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/chat-start")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public ChatStartResponse createChatStart(@PathVariable String skillpilotId,
            @RequestBody(required = false) ChatStartRequest request) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return chatSessionService.createStartCode(skillpilotId, request);
    }

    @PutMapping("/{skillpilotId}/curriculum")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public void updateCurriculum(@PathVariable String skillpilotId, @RequestBody UpdateCurriculumRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setCurriculum(skillpilotId, request.getCurriculumId());
    }

    @PutMapping("/{skillpilotId}/preferences")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public void updatePreferences(@PathVariable String skillpilotId,
            @RequestBody com.skillpilot.backend.api.PreferencesRequest request) {
        learnerService.setPreferences(skillpilotId, request.learningStrategy(), request.autoPilot(),
                request.strictMode());
    }

    @PutMapping("/{skillpilotId}/personal-curriculum")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public void updatePersonalCurriculum(@PathVariable String skillpilotId,
            @RequestBody UpdatePersonalCurriculumRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setPersonalCurriculum(skillpilotId, request, null, null);
    }

    @GetMapping("/{skillpilotId}/export")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public com.skillpilot.backend.api.SignedLearnerDataDTO exportLearner(@PathVariable String skillpilotId) {
        return learnerService.exportLearner(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/import")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public void importLearner(@PathVariable String skillpilotId,
            @RequestBody com.skillpilot.backend.api.SignedLearnerDataDTO data) {
        learnerService.importLearner(skillpilotId, data);
    }

    @GetMapping("/{skillpilotId}/history")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public java.util.List<com.skillpilot.backend.api.MasteryHistoryEntry> getHistory(
            @PathVariable String skillpilotId) {
        return learnerService.getHistory(skillpilotId);
    }
}
