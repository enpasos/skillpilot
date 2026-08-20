package com.skillpilot.backend.connectors.claude.v1;

import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1BindingService;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1Connection;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Instant;
import java.util.UUID;

/** Shared setup for Claude v1 integration tests: one learner plus one bound connection. */
public final class ClaudeV1TestFixtures {

    public record BoundLearner(String learnerId, String connectionId) {}

    public static BoundLearner createBoundLearner(
            LearnerRepository learnerRepository,
            ClaudeV1ConnectionRepository connectionRepository,
            long initialRevision) {

        String learnerId = UUID.randomUUID().toString();
        Learner learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum("KC_HE_GYM_MATHE_2024");
        learner.setCoachStateRevision(initialRevision);
        learnerRepository.save(learner);

        String connectionId = "conn_claude_v1_" + UUID.randomUUID().toString().replace("-", "");
        connectionRepository.insertConnection(new ClaudeV1Connection(
                connectionId,
                learnerId,
                ClaudeV1BindingService.sha256Hex(learnerId),
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                ClaudeV1Connection.STATUS_ACTIVE,
                Instant.now(),
                Instant.now()));

        return new BoundLearner(learnerId, connectionId);
    }

    private ClaudeV1TestFixtures() {
    }
}
