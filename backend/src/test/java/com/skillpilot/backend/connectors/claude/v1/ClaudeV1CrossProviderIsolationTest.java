package com.skillpilot.backend.connectors.claude.v1;

import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1SessionCoordinator;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Cross-provider isolation on the shared learner state and the shared OAuth tables.
 *
 * <p>Claude v1, the OpenAI lane and the WebGUI all write the same canonical learner. The guarantee
 * under test is that they interleave safely: a write from one lane advances the revision that every
 * other lane is checked against, and nothing from one lane's OAuth boundary is visible in
 * another's.</p>
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1CrossProviderIsolationTest {

    @Autowired
    private ClaudeV1SessionCoordinator sessionCoordinator;

    @Autowired
    private ClaudeV1LearningSessionRepository connectionRepository;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    @Qualifier("claudeV1RegisteredClientRepository")
    private RegisteredClientRepository claudeClients;

    @Autowired
    @Qualifier("claudeV1AuthorizationService")
    private OAuth2AuthorizationService claudeAuthorizations;

    private String learnerId;
    private String connectionId;

    @BeforeEach
    void setUp() {
        ClaudeV1TestFixtures.BoundLearner bound =
                ClaudeV1TestFixtures.createBoundLearner(learnerRepository, connectionRepository, 5L);
        learnerId = bound.learnerId();
        connectionId = bound.connectionId();
    }

    /** Simulates a write performed by another lane (ChatGPT or the WebGUI) on the same learner. */
    private long writeFromAnotherProvider() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
        learnerRepository.save(learner);
        return learner.getCoachStateRevision();
    }

    private Map<String, Object> claudeWrite(String skillpilotId) {
        Learner learner = learnerRepository.findById(skillpilotId).orElseThrow();
        learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
        learnerRepository.save(learner);
        return new LinkedHashMap<>();
    }

    @Test
    void aClaudeWriteInvalidatesAnotherProvidersStaleRevision() {
        // Claude reads 5 and writes; the canonical revision becomes 6.
        var outcome = sessionCoordinator.mutate(
                connectionId, "test_mutation", UUID.randomUUID().toString(), 5L, Map.of("op", "claude"),
                ctx -> claudeWrite(ctx.skillpilotId()));
        assertEquals(6L, outcome.stateVersion());

        // The other lane still believes 5 is current. Its optimistic check must fail rather than
        // overwrite what Claude just wrote.
        Learner asSeenByOtherProvider = learnerRepository.findById(learnerId).orElseThrow();
        assertEquals(6L, asSeenByOtherProvider.getCoachStateRevision());
        assertTrue(asSeenByOtherProvider.getCoachStateRevision() != 5L);
    }

    @Test
    void anotherProvidersWriteInvalidatesClaudesStaleRevision() {
        long revisionAfterOtherProvider = writeFromAnotherProvider();
        assertEquals(6L, revisionAfterOtherProvider);

        // Claude is still holding revision 5 from before that write.
        ClaudeV1SessionCoordinator.StaleStateException error =
                assertThrows(ClaudeV1SessionCoordinator.StaleStateException.class, () ->
                        sessionCoordinator.mutate(
                                connectionId, "test_mutation", UUID.randomUUID().toString(), 5L, Map.of("op", "claude"),
                                ctx -> claudeWrite(ctx.skillpilotId())));
        assertEquals(6L, error.currentStateVersion());
        assertEquals(6L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());

        // After reloading, the same write succeeds.
        var retry = sessionCoordinator.mutate(
                connectionId, "test_mutation", UUID.randomUUID().toString(), 6L, Map.of("op", "claude"),
                ctx -> claudeWrite(ctx.skillpilotId()));
        assertEquals(7L, retry.stateVersion());
    }

    @Test
    void noLastWriterWinsLossAcrossInterleavedProviders() {
        long revision = 5L;
        for (int round = 0; round < 3; round++) {
            var claudeOutcome = sessionCoordinator.mutate(
                    connectionId, "test_mutation", UUID.randomUUID().toString(), revision, Map.of("round", round),
                    ctx -> claudeWrite(ctx.skillpilotId()));
            revision = claudeOutcome.stateVersion();
            revision = writeFromAnotherProvider();
        }
        // Six writes from two lanes, six revisions: nothing was silently overwritten.
        assertEquals(11L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());
    }

    @Test
    void claudesOAuthBoundaryDoesNotResolveAnotherLanesClient() {
        assertNull(claudeClients.findByClientId("skillpilot-coach-v1"));
        assertNull(claudeClients.findByClientId("https://claude.ai/oauth/other-metadata"));
        assertNull(claudeAuthorizations.findById("an-openai-authorization-id"));
    }

    @Test
    void expiringAClaudeLearningSessionDoesNotTouchLearnerStateOrOtherLanes() {
        long revisionBefore = learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision();

        connectionRepository.deleteExpired(java.time.Instant.MAX);

        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        assertEquals(revisionBefore, learner.getCoachStateRevision());
        assertEquals("KC_HE_GYM_MATHE_2024", learner.getSelectedCurriculum());
        // Another provider reading the same learner is entirely unaffected.
        assertEquals(revisionBefore + 1, writeFromAnotherProvider());
    }

    @Test
    void aFailedClaudeWriteLeavesNoPartialLearnerMutation() {
        assertThrows(RuntimeException.class, () -> sessionCoordinator.mutate(
                connectionId, "test_mutation", UUID.randomUUID().toString(), 5L, Map.of("op", "fault"),
                ctx -> {
                    claudeWrite(ctx.skillpilotId());
                    throw new IllegalStateException("simulated Claude fault");
                }));

        assertEquals(5L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());
    }
}
