package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRecord;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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
class ClaudeV1SessionCoordinatorTest {

    @Autowired
    private ClaudeV1SessionCoordinator sessionCoordinator;

    @Autowired
    private ClaudeV1ConnectionRepository connectionRepository;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private ClaudeV1IdempotencyRepository idempotencyRepository;

    @Autowired
    private ClaudeV1Properties properties;

    private String learnerId;
    private String connectionId;

    @BeforeEach
    void setUp() {
        ClaudeV1TestFixtures.BoundLearner bound =
                ClaudeV1TestFixtures.createBoundLearner(learnerRepository, connectionRepository, 10L);
        learnerId = bound.learnerId();
        connectionId = bound.connectionId();
    }

    /** Stand-in for a canonical write: advances the revision the way the domain rule would. */
    private Map<String, Object> advanceRevision(String skillpilotId, String marker) {
        Learner learner = learnerRepository.findById(skillpilotId).orElseThrow();
        learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
        learnerRepository.save(learner);
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("marker", marker);
        return summary;
    }

    @Test
    void readReportsTheCurrentRevisionAndTouchesNothing() {
        var outcome = sessionCoordinator.read(connectionId, ctx -> {
            assertEquals(learnerId, ctx.skillpilotId());
            return Map.<String, Object>of("stateVersion", ctx.stateVersion());
        });

        assertEquals(10L, outcome.stateVersion());
        assertEquals(10L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());
    }

    @Test
    void readHoldsAConsistentSnapshotUntilItsProjectionCompletes() throws Exception {
        CountDownLatch readEntered = new CountDownLatch(1);
        CountDownLatch releaseRead = new CountDownLatch(1);
        CountDownLatch mutationStarted = new CountDownLatch(1);
        CountDownLatch mutationEntered = new CountDownLatch(1);

        try (var executor = Executors.newFixedThreadPool(2)) {
            var read = executor.submit(() -> sessionCoordinator.read(connectionId, ctx -> {
                readEntered.countDown();
                try {
                    if (!releaseRead.await(5, TimeUnit.SECONDS)) {
                        throw new IllegalStateException("test read was not released");
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(e);
                }
                return ctx.stateVersion();
            }));
            assertTrue(readEntered.await(5, TimeUnit.SECONDS));

            var mutation = executor.submit(() -> {
                mutationStarted.countDown();
                return sessionCoordinator.mutate(
                        connectionId,
                        "test_mutation",
                        UUID.randomUUID().toString(),
                        10L,
                        Map.of("op", "after-read"),
                        ctx -> {
                            mutationEntered.countDown();
                            return advanceRevision(ctx.skillpilotId(), "after-read");
                        });
            });
            assertTrue(mutationStarted.await(5, TimeUnit.SECONDS));
            assertFalse(
                    mutationEntered.await(250, TimeUnit.MILLISECONDS),
                    "A write must not interleave with an in-progress state projection");

            releaseRead.countDown();
            assertEquals(10L, read.get(5, TimeUnit.SECONDS).stateVersion());
            assertEquals(11L, mutation.get(5, TimeUnit.SECONDS).stateVersion());
        } finally {
            releaseRead.countDown();
        }
    }

    @Test
    void mutateRejectsAStaleExpectedVersion() {
        ClaudeV1SessionCoordinator.StaleStateException error =
                assertThrows(ClaudeV1SessionCoordinator.StaleStateException.class, () ->
                        sessionCoordinator.mutate(
                                connectionId, "test_mutation", UUID.randomUUID().toString(), 7L, Map.of("op", "x"),
                                ctx -> advanceRevision(ctx.skillpilotId(), "should-not-run")));

        assertEquals(10L, error.currentStateVersion());
        assertEquals(10L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());
    }

    @Test
    void mutateReportsTheRevisionActuallyReached() {
        var outcome = sessionCoordinator.mutate(
                connectionId, "test_mutation", UUID.randomUUID().toString(), 10L, Map.of("op", "write"),
                ctx -> advanceRevision(ctx.skillpilotId(), "first"));

        // 11, read back from the learner, not 10+1 assumed by the caller.
        assertEquals(11L, outcome.stateVersion());
        assertEquals(11L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());
    }

    @Test
    void mutationCanBindItsContinuationToTheRevisionActuallyReached() {
        var outcome = sessionCoordinator.mutate(
                connectionId,
                "test_mutation",
                UUID.randomUUID().toString(),
                10L,
                Map.of("op", "continuation"),
                ctx -> {
                    Map<String, Object> result = advanceRevision(ctx.skillpilotId(), "continuation");
                    result.put("continuationStateVersion", ctx.currentStateVersion());
                    return result;
                });

        assertEquals(11L, outcome.value().get("continuationStateVersion"));
        assertEquals(outcome.stateVersion(), outcome.value().get("continuationStateVersion"));
    }

    @Test
    void anOperationThatDoesNotAdvanceTheRevisionIsRefused() {
        // Guards the canonical rule: a write that leaves the revision untouched is a bug, and
        // silently returning success would desynchronize every later optimistic check.
        assertThrows(IllegalStateException.class, () -> sessionCoordinator.mutate(
                connectionId, "test_mutation", UUID.randomUUID().toString(), 10L, Map.of("op", "noop"),
                ctx -> new LinkedHashMap<>()));
    }

    @Test
    void duplicateRequestsReplayWithoutASecondMutation() {
        String clientRequestId = UUID.randomUUID().toString();
        Map<String, Object> payload = Map.of("op", "write");

        var first = sessionCoordinator.mutate(
                connectionId, "test_mutation", clientRequestId, 10L, payload,
                ctx -> advanceRevision(ctx.skillpilotId(), "first"));
        assertEquals(11L, first.stateVersion());

        var replay = sessionCoordinator.mutate(
                connectionId, "test_mutation", clientRequestId, 10L, payload,
                ctx -> advanceRevision(ctx.skillpilotId(), "second"));

        assertEquals("first", replay.value().get("marker"));
        assertEquals(11L, replay.stateVersion());
        assertEquals(11L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());
    }

    @Test
    void reusingAClientRequestIdWithADifferentPayloadIsAConflict() {
        String clientRequestId = UUID.randomUUID().toString();
        sessionCoordinator.mutate(
                connectionId, "test_mutation", clientRequestId, 10L, Map.of("op", "write"),
                ctx -> advanceRevision(ctx.skillpilotId(), "first"));

        assertThrows(ClaudeV1SessionCoordinator.IdempotencyConflictException.class, () ->
                sessionCoordinator.mutate(
                        connectionId, "test_mutation", clientRequestId, 11L, Map.of("op", "different"),
                        ctx -> advanceRevision(ctx.skillpilotId(), "second")));
    }

    @Test
    void theSameRequestIdCannotReplayAResultFromAnotherTool() {
        String clientRequestId = UUID.randomUUID().toString();
        sessionCoordinator.mutate(
                connectionId, "tool_a", clientRequestId, 10L, Map.of("goalId", "g"),
                ctx -> advanceRevision(ctx.skillpilotId(), "first"));

        assertThrows(ClaudeV1SessionCoordinator.IdempotencyConflictException.class, () ->
                sessionCoordinator.mutate(
                        connectionId, "tool_b", clientRequestId, 11L, Map.of("goalId", "g"),
                        ctx -> advanceRevision(ctx.skillpilotId(), "wrong-tool")));
    }

    @Test
    void replayAfterALaterWriteIsRejectedAsStale() {
        String oldRequest = UUID.randomUUID().toString();
        Map<String, Object> oldPayload = Map.of("op", "first");
        sessionCoordinator.mutate(
                connectionId, "test_mutation", oldRequest, 10L, oldPayload,
                ctx -> advanceRevision(ctx.skillpilotId(), "first"));
        sessionCoordinator.mutate(
                connectionId, "test_mutation", UUID.randomUUID().toString(), 11L, Map.of("op", "later"),
                ctx -> advanceRevision(ctx.skillpilotId(), "later"));

        ClaudeV1SessionCoordinator.StaleStateException error = assertThrows(
                ClaudeV1SessionCoordinator.StaleStateException.class,
                () -> sessionCoordinator.mutate(
                        connectionId, "test_mutation", oldRequest, 10L, oldPayload,
                        ctx -> advanceRevision(ctx.skillpilotId(), "must-not-run")));
        assertEquals(12L, error.currentStateVersion());
    }

    @Test
    void canonicalRequestHashDoesNotDependOnMapInsertionOrder() {
        String clientRequestId = UUID.randomUUID().toString();
        Map<String, Object> firstOrder = new LinkedHashMap<>();
        firstOrder.put("b", 2);
        firstOrder.put("a", 1);
        Map<String, Object> secondOrder = new LinkedHashMap<>();
        secondOrder.put("a", 1);
        secondOrder.put("b", 2);

        sessionCoordinator.mutate(
                connectionId, "test_mutation", clientRequestId, 10L, firstOrder,
                ctx -> advanceRevision(ctx.skillpilotId(), "canonical"));
        var replay = sessionCoordinator.mutate(
                connectionId, "test_mutation", clientRequestId, 10L, secondOrder,
                ctx -> advanceRevision(ctx.skillpilotId(), "wrong"));

        assertEquals("canonical", replay.value().get("marker"));
        assertEquals(11L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());
    }

    @Test
    void expiredIdempotencyRowIsRemovedBeforeTheUniqueInsert() {
        String requestId = UUID.randomUUID().toString();
        Instant expired = Instant.now().minusSeconds(30);
        idempotencyRepository.save(new ClaudeV1IdempotencyRecord(
                UUID.randomUUID().toString(),
                connectionId,
                requestId,
                "expired-hash",
                "{}",
                9L,
                expired.minusSeconds(30),
                expired));

        var result = sessionCoordinator.mutate(
                connectionId, "test_mutation", requestId, 10L, Map.of("op", "fresh"),
                ctx -> advanceRevision(ctx.skillpilotId(), "fresh"));

        assertEquals(11L, result.stateVersion());
    }

    @Test
    void recallContinuationReplayNeverOutlivesItsCapability() {
        String requestId = UUID.randomUUID().toString();
        sessionCoordinator.mutate(
                connectionId,
                ClaudeV1Contract.TOOL_RECORD_VERIFIED_RECALL_RESULTS,
                requestId,
                10L,
                Map.of("op", "recall"),
                ctx -> advanceRevision(ctx.skillpilotId(), "recall"));

        assertTrue(idempotencyRepository.findLive(connectionId, requestId, Instant.now()).isPresent());
        assertTrue(idempotencyRepository.findLive(
                        connectionId,
                        requestId,
                        Instant.now().plus(properties.getCapabilityTtl()).plusSeconds(1))
                .isEmpty());
    }

    @Test
    void concurrentDuplicateCallsExecuteTheCanonicalMutationOnce() throws Exception {
        String requestId = UUID.randomUUID().toString();
        Map<String, Object> payload = Map.of("op", "parallel");
        AtomicInteger executions = new AtomicInteger();
        CountDownLatch start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> {
                start.await(5, TimeUnit.SECONDS);
                return sessionCoordinator.mutate(
                        connectionId, "test_mutation", requestId, 10L, payload,
                        ctx -> {
                            executions.incrementAndGet();
                            return advanceRevision(ctx.skillpilotId(), "parallel");
                        });
            });
            var second = executor.submit(() -> {
                start.await(5, TimeUnit.SECONDS);
                return sessionCoordinator.mutate(
                        connectionId, "test_mutation", requestId, 10L, payload,
                        ctx -> {
                            executions.incrementAndGet();
                            return advanceRevision(ctx.skillpilotId(), "parallel");
                        });
            });
            start.countDown();

            assertEquals(11L, first.get(10, TimeUnit.SECONDS).stateVersion());
            assertEquals(11L, second.get(10, TimeUnit.SECONDS).stateVersion());
        }
        assertEquals(1, executions.get());
        assertEquals(11L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());
    }

    @Test
    void anExceptionInsideTheOperationLeavesNoPartialMutation() {
        assertThrows(IllegalStateException.class, () -> sessionCoordinator.mutate(
                connectionId, "test_mutation", UUID.randomUUID().toString(), 10L, Map.of("op", "boom"),
                ctx -> {
                    advanceRevision(ctx.skillpilotId(), "partial");
                    throw new IllegalStateException("boom");
                }));

        assertEquals(10L, learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision());
    }

    @Test
    void aRevokedConnectionCanNeitherReadNorWrite() {
        connectionRepository.revokeConnection(connectionId);

        assertThrows(IllegalStateException.class, () ->
                sessionCoordinator.read(connectionId, ctx -> Map.<String, Object>of()));
        assertThrows(IllegalStateException.class, () -> sessionCoordinator.mutate(
                connectionId, "test_mutation", UUID.randomUUID().toString(), 10L, Map.of(),
                ctx -> advanceRevision(ctx.skillpilotId(), "x")));
    }

    @Test
    void anUnknownConnectionIsRefused() {
        assertThrows(IllegalStateException.class, () ->
                sessionCoordinator.read("conn_claude_v1_missing", ctx -> Map.<String, Object>of()));
        assertThrows(IllegalArgumentException.class, () ->
                sessionCoordinator.read("  ", ctx -> Map.<String, Object>of()));
    }

    @Test
    void revocationRemovesTheLearnerReferenceFromTheConnection() {
        connectionRepository.revokeConnection(connectionId);

        var connection = connectionRepository.findConnectionById(connectionId).orElseThrow();
        assertTrue(connection.skillpilotId().isBlank());
        // The learner itself survives: revoking Claude must not touch canonical state.
        assertTrue(learnerRepository.findById(learnerId).isPresent());
    }
}
