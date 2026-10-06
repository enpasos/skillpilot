package com.skillpilot.backend.connectors.gemini.v1.web;

import com.skillpilot.backend.connectors.gemini.v1.ConditionalOnGeminiV1Enabled;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** First-party WebGUI launch boundary for Gemini v1. */
@RestController
@RequestMapping("/api/ui/learners/{skillpilotId}/gemini/v1")
@ConditionalOnGeminiV1Enabled
public class GeminiV1CoachUiController {

    private final GeminiV1LearningSessionService learningSessions;

    public GeminiV1CoachUiController(GeminiV1LearningSessionService learningSessions) {
        this.learningSessions = learningSessions;
    }

    @PostMapping("/launch")
    public ResponseEntity<GeminiV1LaunchResponse> createLaunch(
            @PathVariable String skillpilotId,
            @RequestBody GeminiV1CoachStartRequest request) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(learningSessions.createFirstPartyLaunch(skillpilotId, request));
    }
}
