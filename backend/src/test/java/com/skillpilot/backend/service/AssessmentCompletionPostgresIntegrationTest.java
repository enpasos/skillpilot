package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.CompletionAssessmentStart;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.completion.CompletionApplicationService;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.completion.CompletionProfileDefinition;
import com.skillpilot.backend.completion.CompletionScopeDefinition;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1SessionCoordinator;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.aopalliance.intercept.MethodInterceptor;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.aop.framework.Advised;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.interceptor.TransactionInterceptor;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Actual PostgreSQL/Spring-proxy evidence, deliberately separate from the H2 suite.
 * Requires a disposable loopback skillpilot_completion_test database. Every run uses
 * its own schema and the real Liquibase migrations; no production schema is touched.
 */
@SpringBootTest(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        "skillpilot.completion.enabled=true",
        "skillpilot.completion.enabled-profile-ids=math-dot-product-projection",
        "spring.jpa.show-sql=false",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect",
        "spring.datasource.driver-class-name=org.postgresql.Driver"
})
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@org.springframework.context.annotation.Import(AssessmentCompletionPostgresIntegrationTest.ProviderReadConfiguration.class)
@EnabledIfEnvironmentVariable(named = "SKILLPILOT_TEST_POSTGRES_URL", matches = "jdbc:postgresql://.+")
class AssessmentCompletionPostgresIntegrationTest {
    private static final String PROFILE = "math-dot-product-projection";
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PREPARATION = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String EXAM = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    private static final String SCHEMA = "completion_snapshot_" + UUID.randomUUID().toString().replace("-", "");
    private static JdbcTemplate schemaAdmin;
    private static DriverManagerDataSource independentDataSource;

    @Autowired LearnerService learners;
    @Autowired LearnerRepository learnerRepository;
    @Autowired PlannedGoalRepository focus;
    @Autowired ClaudeV1SessionCoordinator coordinator;
    @Autowired ClaudeV1LearningSessionService sessions;
    @Autowired com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1CompletionContractRegistry completionContract;
    @Autowired com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository sessionRepository;
    @Autowired com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec sessionTokens;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactions;
    @Autowired com.skillpilot.backend.repository.MasteryRepository masteryRepository;
    @Autowired com.skillpilot.backend.repository.LearnerClientStateRepository clientStates;
    @Autowired com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository openAiSessions;
    @Autowired com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinator openAiCoordinator;
    @Autowired com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider openAiRevision;
    @Autowired com.skillpilot.backend.connectors.gemini.v1.mcp.GeminiV1SessionCoordinator geminiCoordinator;
    @PersistenceContext EntityManager entityManager;

    private Object originalApplication;
    private MethodInterceptor readProbe;
    private String learnerId;
    private String sessionId;
    private long initialRevision;

    @DynamicPropertySource
    static void postgres(DynamicPropertyRegistry properties) {
        String url = System.getenv("SKILLPILOT_TEST_POSTGRES_URL");
        if (url == null || !url.startsWith("jdbc:postgresql://")) {
            throw new IllegalStateException("An explicit disposable PostgreSQL URL is required");
        }
        URI address = URI.create(url.substring("jdbc:".length()));
        if (!List.of("localhost", "127.0.0.1").contains(address.getHost())
                || !"/skillpilot_completion_test".equals(address.getPath())
                || address.getRawQuery() != null || address.getRawFragment() != null
                || address.getRawUserInfo() != null) {
            throw new IllegalArgumentException("Use only the disposable loopback skillpilot_completion_test database");
        }
        String username = System.getenv().getOrDefault("SKILLPILOT_TEST_POSTGRES_USER", "completion_test");
        String password = System.getenv().getOrDefault("SKILLPILOT_TEST_POSTGRES_PASSWORD", "");
        schemaAdmin = new JdbcTemplate(new DriverManagerDataSource(url, username, password));
        schemaAdmin.execute("CREATE SCHEMA " + SCHEMA);
        String scopedUrl = url + "?currentSchema=" + SCHEMA;
        independentDataSource = new DriverManagerDataSource(scopedUrl, username, password);
        properties.add("spring.datasource.url", () -> scopedUrl);
        properties.add("spring.datasource.username", () -> username);
        properties.add("spring.datasource.password", () -> password);
        properties.add("spring.datasource.hikari.maximum-pool-size", () -> "4");
        properties.add("spring.datasource.hikari.connection-init-sql", () -> "SET lock_timeout = '5s'");
        properties.add("spring.liquibase.default-schema", () -> SCHEMA);
        properties.add("spring.liquibase.liquibase-schema", () -> SCHEMA);
        properties.add("spring.jpa.properties.hibernate.default_schema", () -> SCHEMA);
    }

    @AfterAll
    static void removeOnlyThisTestSchema() {
        if (schemaAdmin != null && SCHEMA.matches("completion_snapshot_[0-9a-f]{32}")) {
            schemaAdmin.execute("DROP SCHEMA IF EXISTS " + SCHEMA + " CASCADE");
        }
    }

    @BeforeEach
    void createCommittedAssessmentSession() throws Exception {
        originalApplication = ReflectionTestUtils.getField(learners, "completionApplicationService");
        Path base = Path.of("../curricula/DE/Gymnasium");
        var profile = mapper.readValue(Files.readString(base.resolve("completion-profiles/" + PROFILE + ".json")),
                CompletionProfileDefinition.class);
        var scope = mapper.readValue(Files.readString(base.resolve("completion-scopes/" + PROFILE + ".json")),
                CompletionScopeDefinition.class);
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(PROFILE, profile), Map.of(PROFILE, scope), "postgres-test-generation")));

        Learner learner = new Learner();
        learnerId = "completion-pg-" + UUID.randomUUID();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum(ROOT);
        Map<String, Object> config = new LinkedHashMap<>();
        config.put(ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "CrossStage", "durationModel", "G9"));
        config.put("__skillpilot_stage_scope_sek1__", Map.of("selected", true));
        config.put("__skillpilot_stage_scope_sek2__", Map.of("selected", true));
        config.put(MATH, Map.of("selected", true, "filterId", "GK+LK"));
        config.put(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true));
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        learner.setAutoPilot(false);
        learnerRepository.saveAndFlush(learner);
        focus.saveAndFlush(new PlannedGoal(learner, PREPARATION));
        var selected = learners.chooseLevelCompletion(learnerId,
                new LevelCompletionActionRequest("selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        var launch = sessions.createFirstPartyLaunch(learnerId,
                new ClaudeV1CoachStartRequest("de", "web-start",
                        new CompletionAssessmentStart(PROFILE, EXAM, selected.levelCompletion().learnerRevision())));
        sessionId = launch.learningSessionId();
        // Transaction tests begin after the separately tested real MCP receipt handshake.
        sessionRepository.updateCompletionContract(sessionTokens.hash(sessionId), completionContract.confirmedStamp());
        initialRevision = currentRevision(independentJdbc());
        assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
        assertThat(AopUtils.isAopProxy(learners)).isTrue();
        assertThat(AopUtils.isAopProxy(coordinator)).isTrue();
    }

    @AfterEach
    void restoreProxiesAndCatalog() {
        if (readProbe != null) ((Advised) learners).removeAdvice(readProbe);
        if (originalApplication != null) {
            ReflectionTestUtils.setField(learners, "completionApplicationService", originalApplication);
        }
    }

    @Test
    void independentPublicReadKeepsOneRealRepeatableReadSnapshotWhileAnotherWriterCommits() throws Exception {
        AtomicBoolean observed = new AtomicBoolean();
        AtomicReference<UnifiedLearnerStateResponse> secondRead = new AtomicReference<>();
        readProbe = invocation -> {
            if (!"getCoachLearnerState".equals(invocation.getMethod().getName())
                    || !observed.compareAndSet(false, true)) return invocation.proceed();
            // Appended after Spring's transaction advisor: this is the production public
            // method's own transaction, not a test-created outer transaction.
            assertSqlTransaction("repeatable read", "on");
            var first = (UnifiedLearnerStateResponse) invocation.proceed();
            assertThat(first.levelCompletion().complete()).isFalse();
            assertThat(first.levelCompletion().learnerRevision()).isEqualTo(initialRevision);
            var writer = Executors.newSingleThreadExecutor();
            try {
                writer.submit(() -> successfulWrite("snapshot-writer")).get(30, TimeUnit.SECONDS);
            } finally {
                // Do not wait for a blocked writer while holding the read transaction
                // whose accidental row lock this test is intended to catch.
                writer.shutdownNow();
            }
            // The real write completed while the reader remains open. A FOR UPDATE in
            // the read would fail in PostgreSQL read-only mode or block this writer.
            assertThat(currentRevision(independentJdbc())).isGreaterThan(initialRevision);
            entityManager.clear(); // Do not mistake Hibernate's first-level cache for MVCC.
            secondRead.set(learners.getCoachLearnerState(learnerId));
            assertThat(currentRevision(jdbc)).isEqualTo(initialRevision);
            assertThat(examMasteryRows(jdbc)).isZero();
            return first;
        };
        Advised proxy = (Advised) learners;
        assertThat(List.of(proxy.getAdvisors())).anyMatch(advisor -> advisor.getAdvice() instanceof TransactionInterceptor);
        proxy.addAdvice(readProbe);

        var first = learners.getCoachLearnerState(learnerId);
        assertThat(observed).isTrue();
        assertThat(secondRead.get().levelCompletion()).isEqualTo(first.levelCompletion());
        var current = learners.getCoachLearnerState(learnerId);
        assertThat(current.levelCompletion().complete()).isTrue();
        assertThat(current.levelCompletion().learnerRevision()).isGreaterThan(initialRevision);
    }

    @Test
    void coordinatedReadRetainsItsExistingWritableLockedTransaction() {
        var result = coordinator.read(sessionId, context -> {
            assertSqlTransaction("repeatable read", "off");
            Long transaction = jdbc.queryForObject("SELECT txid_current()", Long.class);
            var state = learners.getCoachLearnerState(context.skillpilotId());
            assertSqlTransaction("repeatable read", "off");
            assertThat(jdbc.queryForObject("SELECT txid_current()", Long.class)).isEqualTo(transaction);
            assertThat(state.levelCompletion().learnerRevision()).isEqualTo(context.stateVersion());
            return state;
        });
        assertThat(result.stateVersion()).isEqualTo(initialRevision);
        assertThat(result.value().activeGoal().id()).isEqualTo(EXAM);
        assertThat(currentRevision(independentJdbc())).isEqualTo(initialRevision);
        assertThat(examMasteryRows(independentJdbc())).isZero();
    }

    @Test
    void coordinatedWriteSeesItsOwnUncommittedCompletionAndExactReplayDoesNotRunAgain() {
        AtomicInteger calls = new AtomicInteger();
        Map<String, Object> arguments = Map.of("goalId", EXAM);
        var written = coordinator.mutate(sessionId, ClaudeV1Contract.TOOL_SET_MASTERY,
                "one-write", initialRevision, arguments, context -> {
                    calls.incrementAndGet();
                    assertSqlTransaction("read committed", "off");
                    var update = learners.setMastery(learnerId, new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM));
                    entityManager.flush();
                    var state = learners.getCoachLearnerState(learnerId);
                    assertThat(update.levelCompletion().complete()).isTrue();
                    assertThat(state.levelCompletion().complete()).isTrue();
                    assertThat(state.levelCompletion().learnerRevision()).isEqualTo(context.currentStateVersion());
                    assertThat(state.levelCompletion().directAssessmentRunning()).isFalse();
                    assertThat(state.activeGoal()).isNull();
                    // Independent PostgreSQL connection cannot see these writes yet.
                    assertThat(examMasteryRows(independentJdbc())).isZero();
                    assertThat(currentRevision(independentJdbc())).isEqualTo(initialRevision);
                    assertSqlTransaction("read committed", "off");
                    return Map.of("complete", state.levelCompletion().complete(), "stateVersion", context.currentStateVersion());
                });
        var replayed = coordinator.mutate(sessionId, ClaudeV1Contract.TOOL_SET_MASTERY,
                "one-write", initialRevision, arguments, context -> {
                    calls.incrementAndGet();
                    throw new AssertionError("An exact replay must not re-enter the ended assessment");
                });
        assertThat(replayed.stateVersion()).isEqualTo(written.stateVersion());
        assertThat(replayed.value()).containsOnlyKeys("complete", "stateVersion").containsEntry("complete", true);
        assertThat(((Number) replayed.value().get("stateVersion")).longValue()).isEqualTo(written.stateVersion());
        assertThat(calls).hasValue(1);
        assertThat(examMasteryRows(independentJdbc())).isEqualTo(1);
        assertThat(learners.getCoachLearnerState(learnerId).levelCompletion().complete()).isTrue();
    }

    @Test
    void failedOuterWriteRollsBackMasteryWorkflowRevisionAndReplayRecordTogether() {
        assertThatThrownBy(() -> coordinator.mutate(sessionId, ClaudeV1Contract.TOOL_SET_MASTERY,
                "rolled-back-write", initialRevision, Map.of("goalId", EXAM), context -> {
                    var update = learners.setMastery(learnerId, new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM));
                    entityManager.flush();
                    assertThat(update.levelCompletion().complete()).isTrue();
                    throw new SyntheticRollback();
                })).isInstanceOf(SyntheticRollback.class);
        assertThat(examMasteryRows(independentJdbc())).isZero();
        assertThat(currentRevision(independentJdbc())).isEqualTo(initialRevision);
        var state = learners.getCoachLearnerState(learnerId);
        assertThat(state.levelCompletion().complete()).isFalse();
        assertThat(state.levelCompletion().directAssessmentRunning()).isTrue();
        assertThat(state.activeGoal().id()).isEqualTo(EXAM);
        assertThat(independentJdbc().queryForObject(
                "SELECT count(*) FROM claude_v1_session_idempotency WHERE client_request_id = ?",
                Integer.class, "rolled-back-write")).isZero();
    }

    /** Actual production coordinator proxies and JDBC repositories, without enabling OAuth/HTTP
     * hosts in this database-only lane. Provider handles are valid committed fixture sessions. */
    @org.springframework.boot.test.context.TestConfiguration(proxyBeanMethods = false)
    static class ProviderReadConfiguration {
        @org.springframework.context.annotation.Bean
        com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider providerProbeRevision(
                com.skillpilot.backend.landscape.LandscapeProperties landscapes,
                com.skillpilot.backend.curriculumpackage.CurriculumPackageProperties packages,
                org.springframework.beans.factory.ObjectProvider<com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshotProvider> snapshots) {
            return new com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider(
                    new com.skillpilot.backend.openai.de.OpenAiDeProperties(), packages, landscapes, snapshots);
        }

        @org.springframework.context.annotation.Bean
        com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinator providerProbeOpenAi(
                com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository sessions,
                LearnerRepository learners,
                com.skillpilot.backend.repository.OpenAiDeIdempotencyRecordRepository replays,
                com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider revision) {
            return new com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinator(
                    sessions, learners, replays, new com.skillpilot.backend.openai.de.OpenAiDeProperties(),
                    revision, "postgres-provider-probe-dedicated-test-secret");
        }

        @org.springframework.context.annotation.Bean
        com.skillpilot.backend.connectors.gemini.v1.mcp.GeminiV1SessionCoordinator providerProbeGemini(
                LearnerRepository learners, JdbcTemplate jdbc, ObjectMapper mapper) {
            var properties = com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestProperties.validProperties();
            return new com.skillpilot.backend.connectors.gemini.v1.mcp.GeminiV1SessionCoordinator(learners,
                    new com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionRepository(jdbc),
                    new com.skillpilot.backend.connectors.gemini.v1.persistence.GeminiV1IdempotencyRepository(jdbc),
                    new com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1SessionTokenCodec(properties),
                    properties, mapper);
        }
    }

    private record ProviderProjection(long revision, UnifiedLearnerStateResponse state,
            com.skillpilot.backend.api.ClientStateSnapshot practice) { }

    @ParameterizedTest
    @ValueSource(strings = {"claude", "openai", "gemini"})
    void providerConflictRollsBackBeforeAnExplicitFreshContextReadsCommittedMasteryRecallAndRevision(String provider)
            throws Exception {
        String memory = "4eefbd04-9e49-41ea-a087-9ad6ac71ec5a";
        String cardId = "provider-concurrent-practice-card";
        String handle = providerSession(provider);
        AtomicBoolean firstLock = new AtomicBoolean(true);
        AtomicInteger contextCalls = new AtomicInteger();
        AtomicInteger masteryReads = new AtomicInteger();
        AtomicInteger recallReads = new AtomicInteger();
        AtomicReference<Long> committedRevision = new AtomicReference<>();
        List<Integer> completions = new java.util.concurrent.CopyOnWriteArrayList<>();
        long readerThread = Thread.currentThread().threadId();
        MethodInterceptor lockProbe = invocation -> {
            if (!"findBySkillpilotIdForUpdate".equals(invocation.getMethod().getName())
                    || !learnerId.equals(invocation.getArguments()[0])
                    || Thread.currentThread().threadId() != readerThread) return invocation.proceed();
            assertSqlTransaction("repeatable read", "off");
            TransactionSynchronizationManager.registerSynchronization(
                    new org.springframework.transaction.support.TransactionSynchronization() {
                        @Override public void afterCompletion(int status) { completions.add(status); }
                    });
            if (firstLock.getAndSet(false)) {
                // The production session lookup already established the outer RR snapshot.
                // Read the old revision, then let an independent legitimate service write commit.
                assertThat(currentRevision(jdbc)).isEqualTo(initialRevision);
                var writer = Executors.newSingleThreadExecutor();
                try {
                    writer.submit(() -> new org.springframework.transaction.support.TransactionTemplate(transactions)
                            .execute(status -> {
                                successfulWrite("provider-writer-" + provider);
                                learners.upsertClientState(learnerId, memory, new com.skillpilot.backend.api.ClientStateRequest(
                                        java.time.Instant.now(), Map.of(cardId, Map.of("id", cardId, "interval", 6))));
                                return null;
                            })).get(30, TimeUnit.SECONDS);
                } finally { writer.shutdownNow(); }
                committedRevision.set(currentRevision(independentJdbc()));
                assertThat(committedRevision.get()).isGreaterThan(initialRevision);
            } else {
                assertThat(completions).containsExactly(
                        org.springframework.transaction.support.TransactionSynchronization.STATUS_ROLLED_BACK);
            }
            return invocation.proceed(); // PostgreSQL itself raises 40001 on the obsolete snapshot.
        };
        MethodInterceptor masteryProbe = invocation -> {
            if ("findByLearner_SkillpilotId".equals(invocation.getMethod().getName())
                    && learnerId.equals(invocation.getArguments()[0])
                    && Thread.currentThread().threadId() == readerThread) {
                assertSqlTransaction("repeatable read", "off"); masteryReads.incrementAndGet();
                @SuppressWarnings("unchecked")
                var rows = (List<com.skillpilot.backend.domain.Mastery>) invocation.proceed();
                assertThat(rows).singleElement().satisfies(row -> {
                    assertThat(row.getGoalKey()).isEqualTo(EXAM);
                    assertThat(row.getValue()).isEqualTo(1.0);
                });
                return rows;
            }
            return invocation.proceed();
        };
        MethodInterceptor recallProbe = invocation -> {
            if ("findByLearnerAndNodeIds".equals(invocation.getMethod().getName())
                    && learnerId.equals(invocation.getArguments()[0])
                    && Thread.currentThread().threadId() == readerThread) {
                assertSqlTransaction("repeatable read", "off"); recallReads.incrementAndGet();
                @SuppressWarnings("unchecked")
                var rows = (List<com.skillpilot.backend.domain.LearnerClientState>) invocation.proceed();
                assertThat(rows).anySatisfy(row -> {
                    assertThat(row.getId().getNodeId()).isEqualTo(memory);
                    assertThat(row.getClientState()).contains(cardId).contains("\"interval\":6");
                });
                return rows;
            }
            return invocation.proceed();
        };
        var learnerProxy = (Advised) learnerRepository;
        var masteryProxy = (Advised) masteryRepository;
        var recallProxy = (Advised) clientStates;
        learnerProxy.addAdvice(0, lockProbe);
        masteryProxy.addAdvice(0, masteryProbe);
        recallProxy.addAdvice(0, recallProbe);
        java.util.function.LongFunction<ProviderProjection> read = revision -> {
            contextCalls.incrementAndGet();
            assertThat(revision).isEqualTo(committedRevision.get());
            assertThat(currentRevision(jdbc)).isEqualTo(revision);
            return new ProviderProjection(revision, learners.getCoachLearnerState(learnerId),
                    learners.getClientState(learnerId, memory));
        };
        try {
            Throwable conflict = org.assertj.core.api.Assertions.catchThrowable(() -> readProvider(provider, handle, read));
            assertThat(conflict).isInstanceOf(org.springframework.dao.PessimisticLockingFailureException.class);
            assertThat(sqlState(conflict)).isEqualTo("40001");
            assertThat(contextCalls).hasValue(0); // no partial success or automatic operation replay
            assertThat(masteryReads).hasValue(0);
            assertThat(recallReads).hasValue(0);
            assertThat(completions).containsExactly(
                    org.springframework.transaction.support.TransactionSynchronization.STATUS_ROLLED_BACK);
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isFalse();

            // A distinct explicit call revalidates its session in a fresh outer transaction.
            ProviderProjection fresh = readProvider(provider, handle, read);
            assertThat(fresh.revision()).isEqualTo(committedRevision.get());
            assertThat(fresh.state().skillpilotId()).isEqualTo(learnerId);
            assertThat(fresh.state().levelCompletion().learnerRevision()).isEqualTo(committedRevision.get());
            assertThat(fresh.state().levelCompletion().masteredTargetCount()).isEqualTo(1);
            assertThat(fresh.state().learningUnits().recognizedGoalIds()).containsExactly(PREPARATION);
            assertThat(fresh.practice().srsState()).containsEntry(cardId, Map.of("id", cardId, "interval", 6));
            assertThat(contextCalls).hasValue(1);
            assertThat(masteryReads).hasValue(1);
            assertThat(recallReads).hasValue(1);
            assertThat(completions).containsExactly(
                    org.springframework.transaction.support.TransactionSynchronization.STATUS_ROLLED_BACK,
                    org.springframework.transaction.support.TransactionSynchronization.STATUS_COMMITTED);
            assertThat(examMasteryRows(independentJdbc())).isEqualTo(1);
            assertThat(currentRevision(independentJdbc())).isEqualTo(committedRevision.get());
        } finally {
            learnerProxy.removeAdvice(lockProbe);
            masteryProxy.removeAdvice(masteryProbe);
            recallProxy.removeAdvice(recallProbe);
        }
    }

    private ProviderProjection readProvider(String provider, String handle,
            java.util.function.LongFunction<ProviderProjection> read) {
        return switch (provider) {
            case "claude" -> coordinator.readForCoachContext(handle, context -> read.apply(context.stateVersion())).value();
            case "gemini" -> geminiCoordinator.read(handle, context -> read.apply(context.stateVersion())).value();
            case "openai" -> {
                AtomicReference<ProviderProjection> projection = new AtomicReference<>();
                openAiCoordinator.read(handle, metadata -> {
                    projection.set(read.apply(metadata.stateVersion()));
                    return io.modelcontextprotocol.spec.McpSchema.CallToolResult.builder()
                            .structuredContent(Map.of("coherent", true)).build();
                });
                yield projection.get();
            }
            default -> throw new IllegalArgumentException(provider);
        };
    }

    private String providerSession(String provider) {
        java.time.Instant now = java.time.Instant.now();
        if ("claude".equals(provider)) return sessionId;
        if ("gemini".equals(provider)) {
            var codec = new com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1SessionTokenCodec(
                    com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestProperties.validProperties());
            String token = codec.issue();
            new com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionRepository(jdbc)
                    .insert(new com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSession(
                            codec.hash(token), learnerId, now, now.plusSeconds(86400), "de", initialRevision));
            assertThat(AopUtils.isAopProxy(geminiCoordinator)).isTrue();
            return token;
        }
        String token = "test-openai-provider-" + UUID.randomUUID();
        var session = new com.skillpilot.backend.domain.OpenAiDeLearningSession();
        session.setTokenHash(ReflectionTestUtils.invokeMethod(openAiCoordinator, "hash", token));
        session.setLearner(learnerRepository.findById(learnerId).orElseThrow());
        session.setStartedAt(now); session.setExpiresAt(now.plusSeconds(86400));
        session.setContractMajor(com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata.CONTRACT_MAJOR);
        session.setStateSchemaVersion(com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata.STATE_SCHEMA_VERSION);
        session.setWorkflowVersion(new com.skillpilot.backend.openai.de.OpenAiDeProperties().getWorkflowVersion());
        session.setCurriculumRevision(openAiRevision.currentRevision());
        session.setCommunicationLocale("de"); session.setStateVersion(initialRevision); session.setVerifiedRecallBatchSize(1);
        openAiSessions.saveAndFlush(session);
        assertThat(AopUtils.isAopProxy(openAiCoordinator)).isTrue();
        return token;
    }

    private static String sqlState(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof java.sql.SQLException sql && sql.getSQLState() != null) return sql.getSQLState();
        }
        return null;
    }

    private Map<String, Object> successfulWrite(String requestId) {
        return coordinator.mutate(sessionId, ClaudeV1Contract.TOOL_SET_MASTERY, requestId, initialRevision,
                Map.of("goalId", EXAM), context -> {
                    var update = learners.setMastery(learnerId, new MasteryUpdateRequest(Map.of(EXAM, 1.0), EXAM));
                    return Map.of("complete", update.levelCompletion().complete(), "stateVersion", context.currentStateVersion());
                }).value();
    }

    private void assertSqlTransaction(String isolation, String readOnly) {
        assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isTrue();
        assertThat(jdbc.queryForObject("SHOW transaction_isolation", String.class)).isEqualTo(isolation);
        assertThat(jdbc.queryForObject("SHOW transaction_read_only", String.class)).isEqualTo(readOnly);
    }

    private JdbcTemplate independentJdbc() { return new JdbcTemplate(independentDataSource); }

    private long currentRevision(JdbcTemplate database) {
        return database.queryForObject("SELECT coach_state_revision FROM learner WHERE skillpilot_id = ?", Long.class, learnerId);
    }

    private int examMasteryRows(JdbcTemplate database) {
        return database.queryForObject("SELECT count(*) FROM mastery WHERE skillpilot_id = ? AND goal_key = ?", Integer.class, learnerId, EXAM);
    }

    private static final class SyntheticRollback extends RuntimeException { }
}
