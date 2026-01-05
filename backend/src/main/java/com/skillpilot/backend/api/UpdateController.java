package com.skillpilot.backend.api;

import com.skillpilot.backend.service.SseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/ui")
@Tag(name = "UI Updates", description = "Real-time updates for the UI")
public class UpdateController {

    private final SseService sseService;

    public UpdateController(SseService sseService) {
        this.sseService = sseService;
    }

    @GetMapping(path = "/updates/{skillpilotId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream updates for a specific learner")
    public SseEmitter subscribe(@PathVariable String skillpilotId) {
        return sseService.subscribe(skillpilotId);
    }
}
