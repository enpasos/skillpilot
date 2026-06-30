package com.skillpilot.backend.service;

import com.skillpilot.backend.events.LearnerStateChangedEvent;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private final Map<String, java.util.List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SseService.class);

    public SseEmitter subscribe(String skillpilotId) {
        log.info("SSE Subscribe request for learner: {}", skillpilotId);
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.computeIfAbsent(skillpilotId, k -> new java.util.concurrent.CopyOnWriteArrayList<>())
                .add(emitter);

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("{\"status\":\"connected\"}"));
        } catch (IOException e) {
            log.warn("Failed to send welcome message", e);
        }

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
        });

        return emitter;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleLearnerStateChanged(LearnerStateChangedEvent event) {
        String id = event.getSkillpilotId();
        log.info("SSE Processing event '{}' for learner: {}", event.getChangeType(), id);
        java.util.List<SseEmitter> userEmitters = emitters.get(id);

        if (userEmitters != null) {
            // Send to all connected clients for this user
            for (SseEmitter emitter : userEmitters) {
                try {
                    Map<String, Object> payload = new java.util.HashMap<>();
                    payload.put("type", event.getChangeType());
                    payload.put("timestamp", System.currentTimeMillis());
                    if (event.getNodeId() != null && !event.getNodeId().isBlank()) {
                        payload.put("nodeId", event.getNodeId());
                    }
                    String eventName = "message";
                    if ("CLIENT_STATE_UPDATED".equals(event.getChangeType())
                            && event.getNodeId() != null && !event.getNodeId().isBlank()) {
                        eventName = "client-state";
                    }
                    emitter.send(SseEmitter.event()
                            .name(eventName)
                            .data(payload));
                } catch (IOException e) {
                    log.warn("Failed to send SSE event", e);
                }
            }
        } else {
            log.debug("No active SSE emitters for learner: {}", id);
        }
    }

    @Scheduled(fixedRate = 25000)
    public void sendHeartbeat() {
        long now = System.currentTimeMillis();
        for (Map.Entry<String, java.util.List<SseEmitter>> entry : emitters.entrySet()) {
            java.util.List<SseEmitter> userEmitters = entry.getValue();
            if (userEmitters == null || userEmitters.isEmpty()) {
                emitters.remove(entry.getKey());
                continue;
            }
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("heartbeat")
                            .data(Map.of("timestamp", now)));
                } catch (IOException e) {
                    log.warn("Failed to send SSE heartbeat", e);
                    userEmitters.remove(emitter);
                }
            }
            if (userEmitters.isEmpty()) {
                emitters.remove(entry.getKey());
            }
        }
    }
}
