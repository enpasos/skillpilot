package com.skillpilot.backend.openai.mcp.de.v1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeIdempotencyRecord;
import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeIdempotencyRecordRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OpenAiDeV1McpSessionCoordinatorTest {

    private static final String SESSION_ID =
            "sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    private static final String TOOL = "set_skillpilot_scope";
    private static final String CURRICULUM_REVISION =
            "curricula-sha256@" + "a".repeat(64);

    private Learner learner;
    private OpenAiDeLearningSession session;
    private AtomicReference<OpenAiDeLearningSession> resolvedSession;
    private AtomicReference<OpenAiDeIdempotencyRecord> persistedRequest;
    private OpenAiDeV1McpSessionCoordinator coordinator;

    @BeforeEach
    void setUp() {
        OpenAiDeLearningSessionRepository sessions =
                mock(OpenAiDeLearningSessionRepository.class);
        LearnerRepository learners = mock(LearnerRepository.class);
        OpenAiDeIdempotencyRecordRepository requests =
                mock(OpenAiDeIdempotencyRecordRepository.class);
        OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider =
                mock(OpenAiDeCurriculumRevisionProvider.class);
        OpenAiDeProperties properties = new OpenAiDeProperties();
        when(curriculumRevisionProvider.currentRevision()).thenReturn(CURRICULUM_REVISION);

        learner = new Learner();
        learner.setSkillpilotId("private-learner-id");
        session = new OpenAiDeLearningSession();
        session.setTokenHash("server-side-token-hash");
        session.setLearner(learner);
        session.setStartedAt(Instant.now().minusSeconds(5));
        session.setExpiresAt(Instant.now().plusSeconds(300));
        session.setContractMajor(OpenAiDeV1ContractMetadata.CONTRACT_MAJOR);
        session.setStateVersion(0L);
        session.setStateSchemaVersion(OpenAiDeV1ContractMetadata.STATE_SCHEMA_VERSION);
        session.setWorkflowVersion(properties.getWorkflowVersion());
        session.setCurriculumRevision(CURRICULUM_REVISION);
        session.setCommunicationLocale("en-GB");

        resolvedSession = new AtomicReference<>(session);
        when(sessions.findByTokenHashForUpdate(any()))
                .thenAnswer(invocation -> Optional.of(resolvedSession.get()));
        when(learners.findBySkillpilotIdForUpdate("private-learner-id"))
                .thenReturn(Optional.of(learner));
        when(learners.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        persistedRequest = new AtomicReference<>();
        when(requests.findById(any())).thenAnswer(invocation -> {
            OpenAiDeIdempotencyRecord record = persistedRequest.get();
            Object key = invocation.getArgument(0);
            return record != null && record.getId().equals(key)
                    ? Optional.of(record)
                    : Optional.empty();
        });
        when(requests.save(any())).thenAnswer(invocation -> {
            OpenAiDeIdempotencyRecord record = invocation.getArgument(0);
            persistedRequest.set(record);
            return record;
        });
        coordinator = new OpenAiDeV1McpSessionCoordinator(
                sessions,
                learners,
                requests,
                properties,
                curriculumRevisionProvider,
                "test-signing-secret");
    }

    @Test
    void successfulWriteAdvancesOnceAndExactRetryRestoresTheStoredResult() {
        String requestId = UUID.randomUUID().toString();
        AtomicInteger calls = new AtomicInteger();
        Map<String, Object> arguments = Map.of(
                "learningSessionId", SESSION_ID,
                "expectedStateVersion", 0,
                "clientRequestId", requestId,
                "goalIds", java.util.List.of("goal-a"));

        McpSchema.CallToolResult first = coordinator.write(
                SESSION_ID,
                TOOL,
                0L,
                requestId,
                arguments,
                metadata -> {
                    calls.incrementAndGet();
                    return success(metadata);
                });
        McpSchema.CallToolResult replay = coordinator.write(
                SESSION_ID,
                TOOL,
                0L,
                requestId,
                arguments,
                metadata -> {
                    calls.incrementAndGet();
                    return success(metadata);
                });

        assertThat(session.getStateVersion()).isEqualTo(1L);
        assertThat(calls).hasValue(1);
        assertThat(first.structuredContent().toString()).contains("stateVersion=1");
        assertThat(replay.structuredContent().toString()).contains("stateVersion=1");
        assertThat(replay.structuredContent().toString())
                .doesNotContain(SESSION_ID, "private-learner-id");
    }

    @Test
    void writeFromOneSessionInvalidatesStaleWriteFromAnotherSessionOfSameLearner() {
        coordinator.write(
                SESSION_ID,
                TOOL,
                0L,
                UUID.randomUUID().toString(),
                Map.of("selection", "a"),
                this::success);

        OpenAiDeLearningSession secondSession = sessionForSameLearner("second-session-token-hash");
        secondSession.setStateVersion(0L);
        resolvedSession.set(secondSession);

        assertThatThrownBy(() -> coordinator.write(
                        "sps_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
                        TOOL,
                        0L,
                        UUID.randomUUID().toString(),
                        Map.of("selection", "b"),
                        this::success))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> {
                            assertThat(exception.code())
                                    .isEqualTo(OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT);
                            assertThat(exception.metadata().stateVersion()).isEqualTo(1L);
                        });
        assertThat(secondSession.getStateVersion()).isZero();
        assertThat(learner.getCoachStateRevision()).isEqualTo(1L);
    }

    @Test
    void browserMutationInvalidatesStaleMcpWriteAndReadsExposeCanonicalRevision() {
        // Equivalent to a committed cockpit mutation: common LearnerService
        // write paths advance this persisted learner-scoped value.
        learner.setCoachStateRevision(4L);

        McpSchema.CallToolResult read = coordinator.read(SESSION_ID, this::success);
        assertThat(read.structuredContent().toString())
                .contains("stateVersion=4", "communicationLocale=en-GB");

        assertThatThrownBy(() -> coordinator.write(
                        SESSION_ID,
                        TOOL,
                        0L,
                        UUID.randomUUID().toString(),
                        Map.of("selection", "stale"),
                        this::success))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> {
                            assertThat(exception.code())
                                    .isEqualTo(OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT);
                            assertThat(exception.metadata().stateVersion()).isEqualTo(4L);
                        });
        assertThat(session.getStateVersion()).isZero();
    }

    @Test
    void staleVersionAndReusedRequestIdHaveStableCodesWithoutAnotherMutation() {
        String requestId = UUID.randomUUID().toString();
        Map<String, Object> original = Map.of("selection", "a");
        coordinator.write(
                SESSION_ID,
                TOOL,
                0L,
                requestId,
                original,
                this::success);

        assertThatThrownBy(() -> coordinator.write(
                        SESSION_ID,
                        TOOL,
                        0L,
                        UUID.randomUUID().toString(),
                        Map.of("selection", "b"),
                        this::success))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> assertThat(exception.code())
                                .isEqualTo(OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT));
        assertThatThrownBy(() -> coordinator.write(
                        SESSION_ID,
                        TOOL,
                        1L,
                        requestId,
                        Map.of("selection", "different"),
                        this::success))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> assertThat(exception.code())
                                .isEqualTo(OpenAiDeV1SessionStateException.Code.IDEMPOTENCY_KEY_REUSED));
        assertThat(session.getStateVersion()).isEqualTo(1L);
    }

    @Test
    void unavailablePinnedRevisionFailsClosed() {
        session.setWorkflowVersion("coach@0.9");

        assertThatThrownBy(() -> coordinator.read(SESSION_ID, this::success))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> assertThat(exception.code())
                                .isEqualTo(OpenAiDeV1SessionStateException.Code.SESSION_VERSION_UNAVAILABLE));
    }

    private OpenAiDeLearningSession sessionForSameLearner(String tokenHash) {
        OpenAiDeLearningSession another = new OpenAiDeLearningSession();
        another.setTokenHash(tokenHash);
        another.setLearner(learner);
        another.setStartedAt(session.getStartedAt());
        another.setExpiresAt(session.getExpiresAt());
        another.setContractMajor(session.getContractMajor());
        another.setStateVersion(learner.getCoachStateRevision());
        another.setStateSchemaVersion(session.getStateSchemaVersion());
        another.setWorkflowVersion(session.getWorkflowVersion());
        another.setCurriculumRevision(session.getCurriculumRevision());
        another.setCommunicationLocale(session.getCommunicationLocale());
        return another;
    }

    private McpSchema.CallToolResult success(OpenAiDeV1SessionMetadata metadata) {
        return McpSchema.CallToolResult.builder()
                .isError(false)
                .addTextContent("gespeichert")
                .structuredContent(Map.of(
                        "contractMajor", metadata.contractMajor(),
                        "stateVersion", metadata.stateVersion(),
                        "stateSchemaVersion", metadata.stateSchemaVersion(),
                        "workflowVersion", metadata.workflowVersion(),
                        "curriculumRevision", metadata.curriculumRevision(),
                        "communicationLocale", metadata.communicationLocale(),
                        "extensions", metadata.extensions()))
                .build();
    }
}
