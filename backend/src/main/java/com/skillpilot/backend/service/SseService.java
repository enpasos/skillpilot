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

    private final Map<String, java.util.List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String skillpilotId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.computeIfAbsent(skillpilotId, k -> new java.util.concurrent.CopyOnWriteArrayList<>())
                .add(emitter);

        Runnable removeEmitter = () -> {
            java.util.List<SseEmitter> userEmitters = emitters.get(skillpilotId);
            if (userEmitters != null) {
                userEmitters.remove(emitter);
                if (userEmitters.isEmpty()) {
                    emitters.remove(skillpilotId);
                }
            }
        };

        emitter.onCompletion(removeEmitter);
        emitter.onTimeout(() -> {
            removeEmitter.run();
            emitter.complete();
        });
        emitter.onError((e) -> {
            removeEmitter.run();
            // emitter.completeWithError(e); // Often better to just let it die or specific
            // handling
        });

        return emitter;
    }

    @EventListener
    public void handleLearnerStateChanged(LearnerStateChangedEvent event) {
        String id = event.getSkillpilotId();
        java.util.List<SseEmitter> userEmitters = emitters.get(id);

        if (userEmitters != null) {
            // Send to all connected clients for this user
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("message")
                            .data(Map.of(
                                    "type", event.getChangeType(),
                                    "timestamp", System.currentTimeMillis())));
                } catch (IOException e) {
                    // Cleanup usually happens via callbacks, but we can force it if write fails
                    // However, avoiding concurrent modification during iteration is key.
                    // CopyOnWriteArrayList handles iteration safely.
                    // logging ignored for brevity
                }
            }
        }
    }
}
