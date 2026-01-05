package com.skillpilot.backend.service;

import com.skillpilot.backend.events.LearnerStateChangedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String skillpilotId) {
        // Timeout 30 minutes, or use Long.MAX_VALUE for "infinite" but risky
        // Let's use 30 minutes for now to keep connections reasonably fresh
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.put(skillpilotId, emitter);

        emitter.onCompletion(() -> emitters.remove(skillpilotId));
        emitter.onTimeout(() -> {
            emitters.remove(skillpilotId);
            emitter.complete();
        });
        emitter.onError((e) -> {
            emitters.remove(skillpilotId);
            emitter.completeWithError(e);
        });

        return emitter;
    }

    @EventListener
    public void handleLearnerStateChanged(LearnerStateChangedEvent event) {
        String id = event.getSkillpilotId();
        SseEmitter emitter = emitters.get(id);

        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(Map.of(
                                "type", event.getChangeType(),
                                "timestamp", System.currentTimeMillis())));
            } catch (IOException e) {
                emitters.remove(id);
                emitter.completeWithError(e);
            }
        }
    }
}
