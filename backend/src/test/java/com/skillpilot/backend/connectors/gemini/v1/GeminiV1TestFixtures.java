package com.skillpilot.backend.connectors.gemini.v1;

import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSession;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionRepository;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionService;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1SessionTokenCodec;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Instant;
import java.util.UUID;

/** Real canonical learner plus a separate temporary Gemini session, with no chat data. */
public final class GeminiV1TestFixtures {
    public record BoundLearner(String learnerId, String connectionId) {}

    public static BoundLearner createBoundLearner(
            LearnerRepository learnerRepository,
            GeminiV1LearningSessionRepository sessionRepository,
            long initialRevision) {
        String learnerId = UUID.randomUUID().toString();
        Learner learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum("KC_HE_GYM_MATHE_2024");
        learner.setCoachStateRevision(initialRevision);
        learnerRepository.save(learner);

        GeminiV1SessionTokenCodec codec = new GeminiV1SessionTokenCodec(GeminiV1TestProperties.validProperties());
        String token = codec.issue();
        Instant startedAt = Instant.now();
        sessionRepository.insert(new GeminiV1LearningSession(codec.hash(token), learnerId,
                startedAt, startedAt.plus(GeminiV1LearningSessionService.SESSION_TTL), "de", initialRevision));
        return new BoundLearner(learnerId, token);
    }

    private GeminiV1TestFixtures() {}
}
