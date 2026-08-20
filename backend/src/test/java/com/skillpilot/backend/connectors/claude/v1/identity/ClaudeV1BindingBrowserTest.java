package com.skillpilot.backend.connectors.claude.v1.identity;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1BindingBrowserTest {

    private static final String CODE_CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

    @Autowired
    private ClaudeV1BindingService bindingService;

    @Autowired
    private ClaudeV1ConnectionRepository connectionRepository;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String learnerId;
    private String oauthState;

    @BeforeEach
    void setUp() {
        learnerId = UUID.randomUUID().toString();
        Learner learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum("KC_HE_GYM_MATHE_2024");
        learner.setCoachStateRevision(1L);
        learnerRepository.save(learner);

        oauthState = "state-" + UUID.randomUUID();
    }

    private String startBinding() {
        return startBinding(oauthState);
    }

    private String startBinding(String state) {
        return bindingService.createBindingTransaction(
                state,
                CODE_CHALLENGE,
                "S256",
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK,
                "skillpilot.read skillpilot.write");
    }

    @Test
    void aCompleteBindingProducesAnOpaqueConnection() {
        String handle = startBinding();
        assertNotNull(handle);

        String connectionId = bindingService.bindLearner(handle, learnerId);
        assertTrue(connectionId.startsWith("conn_claude_v1_"));
        // The connection id Claude sees is not derived from the permanent learner id.
        assertFalse(connectionId.contains(learnerId));

        ClaudeV1Connection connection = connectionRepository.findActiveConnectionById(connectionId).orElseThrow();
        assertEquals(learnerId, connection.skillpilotId());
        assertEquals(64, connection.learnerIdHash().length());
        assertNotEquals(ClaudeV1BindingService.sha256Hex(learnerId), connection.learnerIdHash(),
                "The audit correlation must be keyed, not a portable bare UUID digest");
    }

    @Test
    void theClearHandleIsNeverStored() {
        String handle = startBinding();

        // Rows are keyed by the digest; the clear handle resolves nothing.
        assertTrue(connectionRepository.findBindingTransactionById(handle).isEmpty());
        assertTrue(connectionRepository.findBindingTransactionById(
                ClaudeV1BindingService.sha256Hex(handle)).isPresent());
    }

    @Test
    void pendingTransactionDetailsResolveOnlyThroughTheClearOneTimeHandle() {
        String handle = startBinding();

        ClaudeV1BindingTransaction transaction = bindingService.requirePendingTransaction(handle);
        assertEquals(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID, transaction.registeredClientId());
        assertEquals(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK, transaction.redirectUri());

        assertThrows(IllegalArgumentException.class, () ->
                bindingService.requirePendingTransaction(ClaudeV1BindingService.sha256Hex(handle)));
        bindingService.bindLearner(handle, learnerId);
        assertThrows(IllegalStateException.class, () -> bindingService.requirePendingTransaction(handle));
    }

    @Test
    void theTransactionNeverHoldsThePermanentLearnerId() {
        String handle = startBinding();
        bindingService.bindLearner(handle, learnerId);

        ClaudeV1BindingTransaction transaction = connectionRepository
                .findBindingTransactionById(ClaudeV1BindingService.sha256Hex(handle))
                .orElseThrow();
        assertFalse(transaction.toString().contains(learnerId));
    }

    @Test
    void aBoundTransactionCanBeConsumedExactlyOnce() {
        String handle = startBinding();
        bindingService.bindLearner(handle, learnerId);

        ClaudeV1BindingTransaction transaction = bindingService.findBoundTransactionByState(oauthState).orElseThrow();
        assertTrue(bindingService.consumeBindingTransaction(transaction));
        // A replayed authorize request must not be able to reuse the same binding.
        assertFalse(bindingService.consumeBindingTransaction(transaction));
        assertTrue(bindingService.findBoundTransactionByState(oauthState).isEmpty());
    }

    @Test
    void theTransactionOnlyMatchesItsOwnAuthorizationRequest() {
        String handle = startBinding();
        bindingService.bindLearner(handle, learnerId);
        ClaudeV1BindingTransaction transaction = bindingService.findBoundTransactionByState(oauthState).orElseThrow();

        assertTrue(transaction.matchesAuthorizationRequest(
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK,
                CODE_CHALLENGE,
                "S256",
                transaction.scope(),
                transaction.resource()));

        // Knowing the state alone must not let a different client, callback or PKCE challenge
        // claim the binding.
        assertFalse(transaction.matchesAuthorizationRequest(
                ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID,
                ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK, CODE_CHALLENGE, "S256",
                transaction.scope(), transaction.resource()));
        assertFalse(transaction.matchesAuthorizationRequest(
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                "http://127.0.0.1:5000/callback", CODE_CHALLENGE, "S256",
                transaction.scope(), transaction.resource()));
        assertFalse(transaction.matchesAuthorizationRequest(
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK, "another-challenge", "S256",
                transaction.scope(), transaction.resource()));
        assertFalse(transaction.matchesAuthorizationRequest(
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK, CODE_CHALLENGE, "plain",
                transaction.scope(), transaction.resource()));
        assertFalse(transaction.matchesAuthorizationRequest(
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK, CODE_CHALLENGE, "S256",
                transaction.scope(), "https://attacker.example/mcp"));
    }

    @Test
    void aMalformedOrUnknownLearnerIdIsRefused() {
        assertThrows(IllegalArgumentException.class, () ->
                bindingService.bindLearner(startBinding("state-" + UUID.randomUUID()), "not-a-uuid"));
        assertThrows(IllegalArgumentException.class, () ->
                bindingService.bindLearner(startBinding("state-" + UUID.randomUUID()), "'; DROP TABLE learner; --"));

        // A well-formed id for a learner that does not exist must not silently create one.
        String unknownLearner = UUID.randomUUID().toString();
        assertThrows(Exception.class, () ->
                bindingService.bindLearner(startBinding("state-" + UUID.randomUUID()), unknownLearner));
        assertTrue(learnerRepository.findById(unknownLearner).isEmpty());
    }

    @Test
    void anUnknownHandleBindsNothing() {
        assertThrows(IllegalArgumentException.class, () ->
                bindingService.bindLearner("00".repeat(32), learnerId));
    }

    @Test
    void handlesAreUnpredictableAndSingleUsePerTransaction() {
        String first = startBinding("state-" + UUID.randomUUID());
        String second = startBinding("state-" + UUID.randomUUID());

        assertNotEquals(first, second);
        assertEquals(64, first.length(), "A handle is 32 random bytes rendered as hex");
    }

    @Test
    void malformedHandlesAreRejectedBeforeDatabaseLookup() {
        assertThrows(IllegalArgumentException.class, () -> bindingService.bindLearner("a".repeat(10_000), learnerId));
        assertThrows(IllegalArgumentException.class, () -> bindingService.bindLearner("A".repeat(64), learnerId));
    }

    @Test
    void concurrentDoubleSubmitCreatesExactlyOneConnection() throws Exception {
        String handle = startBinding();
        CountDownLatch start = new CountDownLatch(1);
        int successes = 0;
        int conflicts = 0;
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> {
                start.await(5, TimeUnit.SECONDS);
                return bindingService.bindLearner(handle, learnerId);
            });
            var second = executor.submit(() -> {
                start.await(5, TimeUnit.SECONDS);
                return bindingService.bindLearner(handle, learnerId);
            });
            start.countDown();
            for (var future : java.util.List.of(first, second)) {
                try {
                    assertNotNull(future.get(10, TimeUnit.SECONDS));
                    successes++;
                } catch (ExecutionException e) {
                    assertTrue(e.getCause() instanceof IllegalStateException);
                    conflicts++;
                }
            }
        }

        assertEquals(1, successes);
        assertEquals(1, conflicts);
        Integer connections = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM claude_v1_connection WHERE skillpilot_id = ?",
                Integer.class,
                learnerId);
        assertEquals(1, connections);
    }

    @Test
    void revocationClearsTheLearnerLinkButKeepsTheLearner() {
        String handle = startBinding();
        String connectionId = bindingService.bindLearner(handle, learnerId);
        bindingService.revokeConnection(connectionId);

        assertTrue(bindingService.findActiveConnection(connectionId).isEmpty());
        Optional<ClaudeV1Connection> revoked = connectionRepository.findConnectionById(connectionId);
        assertTrue(revoked.isPresent());
        assertTrue(revoked.get().skillpilotId().isBlank());
        assertTrue(revoked.get().learnerIdHash().isBlank());
        assertTrue(connectionRepository
                .findBindingTransactionById(ClaudeV1BindingService.sha256Hex(handle))
                .isEmpty());
        assertTrue(learnerRepository.findById(learnerId).isPresent());
    }
}
