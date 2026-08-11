package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.api.OpenAiDeLaunchResponse;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ui/learners/{skillpilotId}/openai/v1")
@ConditionalOnProperty(
        name = {"skillpilot.openai.coach.v1.enabled", "skillpilot.openai.coach.v1.oauth.enabled"},
        havingValue = "true")
public class OpenAiDeCoachUiController {

    private final OpenAiDeCoachConnectionService connectionService;

    public OpenAiDeCoachUiController(OpenAiDeCoachConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @PostMapping("/launch")
    public OpenAiDeLaunchResponse createLaunch(
            @PathVariable String skillpilotId,
            @RequestBody(required = false) OpenAiDeCoachStartRequest request) {
        return connectionService.createFirstPartyLaunch(skillpilotId, request);
    }
}
