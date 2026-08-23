package com.skillpilot.backend.connectors.claude.v1;

import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSession;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Instant;
import java.util.UUID;

/** Shared setup for Claude v1 integration tests: one learner plus one 24-hour session. */
public final class ClaudeV1TestFixtures {

    public record BoundLearner(String learnerId, String connectionId) {}

    public static BoundLearner createBoundLearner(
            LearnerRepository learnerRepository,
            ClaudeV1LearningSessionRepository sessionRepository,
            long initialRevision) {

        String learnerId = UUID.randomUUID().toString();
        Learner learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum("KC_HE_GYM_MATHE_2024");
        learner.setCoachStateRevision(initialRevision);
        learnerRepository.save(learner);

        ClaudeV1Properties properties = new ClaudeV1Properties();
        properties.setSigningSecret(ClaudeV1TestProperties.SIGNING_SECRET_VALUE);
        ClaudeV1SessionTokenCodec tokenCodec = new ClaudeV1SessionTokenCodec(properties);
        String connectionId = tokenCodec.issue();
        Instant startedAt = Instant.now();
        sessionRepository.insert(new ClaudeV1LearningSession(
                tokenCodec.hash(connectionId),
                learnerId,
                startedAt,
                startedAt.plus(ClaudeV1LearningSessionService.SESSION_TTL),
                "de",
                initialRevision));

        return new BoundLearner(learnerId, connectionId);
    }

    private ClaudeV1TestFixtures() {
    }
}
