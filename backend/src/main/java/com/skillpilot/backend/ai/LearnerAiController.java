package com.skillpilot.backend.ai;

import com.skillpilot.backend.api.CreateLearnerResponse;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.CreateLearnerRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.service.LearnerService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;

@RestController
@RequestMapping(value = "/api/ai/learners", produces = MediaType.APPLICATION_JSON_VALUE)
public class LearnerAiController {

    private final LearnerService learnerService;

    public LearnerAiController(LearnerService learnerService) {
        this.learnerService = learnerService;
    }

    @PostMapping
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public CreateLearnerResponse createLearner(@RequestBody(required = false) CreateLearnerRequest request) {
        Learner learner = learnerService.createLearner(request);
        UnifiedLearnerStateResponse state = learnerService.getLearnerState(learner.getSkillpilotId());

        // Optimization: If a curriculum is already selected (e.g. via topic),
        // don't return the huge list of available landscapes to save tokens.
        java.util.List<com.skillpilot.backend.landscape.LandscapeSummary> available = (learner
                .getSelectedCurriculum() != null && !learner.getSelectedCurriculum().isEmpty())
                        ? java.util.Collections.emptyList()
                        : learnerService.getAvailableBaseCurricula();

        return new CreateLearnerResponse(
                state,
                available);
    }

    @GetMapping("/{skillpilotId}/state")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse getLearnerState(@PathVariable String skillpilotId) {
        return learnerService.getLearnerState(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/scope")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))

    public UnifiedLearnerStateResponse setScope(@PathVariable String skillpilotId, @RequestBody ScopeRequest request) {
        learnerService.setScope(skillpilotId, request.goalIds());
        return learnerService.getLearnerState(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/mastery")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public MasteryUpdateResponse setMastery(
            @PathVariable String skillpilotId,
            @Valid @RequestBody MasteryUpdateRequest request) {

        MasteryUpdateRequest effectiveRequest = request;

        // Convenience for AI: If generic map is missing but goalId is provided,
        // construct it.
        if ((request.mastery() == null || request.mastery().isEmpty()) && request.goalId() != null) {
            java.util.Map<String, Double> newMap = new java.util.HashMap<>();
            newMap.put(request.goalId(), 1.0);
            effectiveRequest = new MasteryUpdateRequest(newMap, request.goalId());
        } else if (request.mastery() == null || request.mastery().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Either 'mastery' map or 'goalId' is required.");
        }

        learnerService.setMastery(skillpilotId, effectiveRequest);
        return new MasteryUpdateResponse(learnerService.getRichFrontier(skillpilotId));
    }

    @PostMapping("/{skillpilotId}/curriculum")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse setCurriculum(@PathVariable String skillpilotId,
            @RequestBody UpdateCurriculumRequest request) {
        learnerService.setCurriculum(skillpilotId, request.getCurriculumId());
        return learnerService.getLearnerState(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/personalization")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))

    public UnifiedLearnerStateResponse setPersonalization(@PathVariable String skillpilotId,
            @RequestBody com.skillpilot.backend.api.PersonalizationRequest request) {
        learnerService.setPersonalCurriculum(skillpilotId, request.config(), request.goalIds());
        return learnerService.getLearnerState(skillpilotId);
    }
}
