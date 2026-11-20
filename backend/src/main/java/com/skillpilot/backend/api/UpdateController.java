package com.skillpilot.backend.api;

import com.skillpilot.backend.service.SseService;
import com.skillpilot.backend.repository.LearnerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.server.ResponseStatusException;

@RestController
@Tag(name = "UI Updates", description = "Real-time updates for the UI")
public class UpdateController {

    public static final String STREAM_PATH = "/api/ui/updates/{skillpilotId}";

    private final SseService sseService;
    private final LearnerRepository learnerRepository;

    public UpdateController(SseService sseService, LearnerRepository learnerRepository) {
        this.sseService = sseService;
        this.learnerRepository = learnerRepository;
    }

    @GetMapping(path = STREAM_PATH, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream updates for a specific learner")
    @Transactional
    public SseEmitter subscribe(@PathVariable String skillpilotId) {
        if (learnerRepository.findBySkillpilotIdForUpdate(skillpilotId).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner not found");
        }
        return sseService.subscribe(skillpilotId);
    }
}
