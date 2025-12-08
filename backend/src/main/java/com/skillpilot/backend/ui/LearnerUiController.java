package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.CreateLearnerResponse;
import com.skillpilot.backend.api.MasteryResponse;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.FrontierResponse;
import com.skillpilot.backend.api.PlannedGoalsRequest;
import com.skillpilot.backend.api.PlannedGoalsResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.CreateLearnerRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdatePersonalCurriculumRequest;
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
@RequestMapping(value = "/api/ui/learners", produces = MediaType.APPLICATION_JSON_VALUE)
public class LearnerUiController {

    private final LearnerService learnerService;

    public LearnerUiController(LearnerService learnerService) {
        this.learnerService = learnerService;
    }

    @PostMapping
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public CreateLearnerResponse createLearner(@RequestBody(required = false) CreateLearnerRequest request) {
        Learner learner = learnerService.createLearner(request);
        UnifiedLearnerStateResponse state = learnerService.getLearnerState(learner.getSkillpilotId());
        return new CreateLearnerResponse(
                state,
                learnerService.getAvailableLandscapes());
    }

    @GetMapping("/{skillpilotId}/state")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse getLearnerState(@PathVariable String skillpilotId) {
        return learnerService.getLearnerState(skillpilotId);
    }

    @PostMapping("/{skillpilotId}/scope")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public void setScope(@PathVariable String skillpilotId, @RequestBody ScopeRequest request) {
        learnerService.setScope(skillpilotId, request.goalIds());
    }

    @GetMapping("/{skillpilotId}/mastery")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public MasteryResponse getMastery(@PathVariable String skillpilotId) {
        return new MasteryResponse(learnerService.getMastery(skillpilotId));
    }

    @PutMapping("/{skillpilotId}/mastery")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public MasteryUpdateResponse setMastery(
            @PathVariable String skillpilotId,
            @Valid @RequestBody MasteryUpdateRequest request) {
        learnerService.setMastery(skillpilotId, request);
        return new MasteryUpdateResponse(learnerService.getRichFrontier(skillpilotId));
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
        return new PlannedGoalsResponse(learnerService.setPlannedGoals(skillpilotId, request.goals()));
    }

    @GetMapping("/{skillpilotId}")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public Learner getLearner(@PathVariable String skillpilotId) {
        return learnerService.getLearner(skillpilotId);
    }

    @PutMapping("/{skillpilotId}/curriculum")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public void updateCurriculum(@PathVariable String skillpilotId, @RequestBody UpdateCurriculumRequest request) {
        learnerService.setCurriculum(skillpilotId, request.getCurriculumId());
    }

    @PutMapping("/{skillpilotId}/personal-curriculum")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public void updatePersonalCurriculum(@PathVariable String skillpilotId,
            @RequestBody UpdatePersonalCurriculumRequest request) {
        learnerService.setPersonalCurriculum(skillpilotId, request, null);
    }
}
