package com.skillpilot.backend.connectors.claude.v1.web;

import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** First-party WebGUI launch boundary for Claude v1. */
@RestController
@RequestMapping("/api/ui/learners/{skillpilotId}/claude/v1")
@ConditionalOnClaudeV1Enabled
public class ClaudeV1CoachUiController {

    private final ClaudeV1LearningSessionService learningSessions;

    public ClaudeV1CoachUiController(ClaudeV1LearningSessionService learningSessions) {
        this.learningSessions = learningSessions;
    }

    @PostMapping("/launch")
    public ResponseEntity<ClaudeV1LaunchResponse> createLaunch(
            @PathVariable String skillpilotId,
            @RequestBody ClaudeV1CoachStartRequest request) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(learningSessions.createFirstPartyLaunch(skillpilotId, request));
    }
}
