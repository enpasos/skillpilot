package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.SkillpilotApplication;
import com.skillpilot.backend.api.CompletionAssessmentStart;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1CompletionContractRegistry;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1McpContractAdapter;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1SessionCoordinator;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.aop.support.AopUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

/** Two real application lifecycles and immutable repository generations share only a disposable PG schema.
 * No bean replacement, synthetic catalog, direct generation-string mutation, or production schema is used. */
@EnabledIfEnvironmentVariable(named = "SKILLPILOT_TEST_POSTGRES_URL", matches = "jdbc:postgresql://.+")
class AssessmentCompletionRestartIntegrationTest {
    private static final String PROFILE = "math-dot-product-projection";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PREPARATION = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String EXAM = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    private static final String CHOOSE = "choose_skillpilot_completion_route";
    private static final Path CANONICAL = Path.of("DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
    private static final Path PROFILE_PATH = Path.of("DE/Gymnasium/completion-profiles/" + PROFILE + ".json");
    @TempDir Path temporary;
    private final ObjectMapper files = new ObjectMapper();
    private final Map<Path, String> sourceHashes = new LinkedHashMap<>();

    @AfterEach void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @Test @Timeout(300)
    void realRestartRejectsOldBindingsAndImmediatelyUsesPersistedMasteryInTheNewGeneration() throws Exception {
        Path evidence = Path.of("../tmp/assessment-completion-restart/evidence.json");
        Files.deleteIfExists(evidence);
        Map<String, Object> evidenceResult;
        Path curricula = copyRequiredRepositoryInputs();
        Database database = Database.isolated();
        String learnerId = "completion-restart-passed-" + UUID.randomUUID();
        String runningLearnerId = "completion-restart-running-" + UUID.randomUUID();
        String oldGeneration;
        String oldFingerprint;
        String oldBinding;
        String oldProfileRevision;
        String oldSession;
        String oldReceipt;
        String runningSession;
        String runningEvaluation;
        Map<String, Object> passingArguments;
        Map<String, Object> oldSuccess;
        LevelCompletionActionRequest oldVoluntaryAction;
        CompletionProfileCatalog oldCatalog;
        ClaudeV1CompletionContractRegistry oldRegistry;
        Set<String> canonicalIds;
        try {
            try (var first = boot(database, curricula)) {
                Lane a = new Lane(first);
                oldCatalog = a.catalog(); oldRegistry = a.contract();
                oldGeneration = oldCatalog.generation(); oldFingerprint = oldRegistry.contractFingerprint();
                oldBinding = oldRegistry.bindingDigest(); oldProfileRevision = oldCatalog.profile(PROFILE).revision();
                canonicalIds = a.canonicalIds();
                assertThat(canonicalIds).contains(EXAM, PREPARATION);
                assertThat(AopUtils.isAopProxy(a.service())).isTrue();
                assertThat(AopUtils.isAopProxy(a.coordinator())).isTrue();
                a.createLearner(learnerId);
                oldSession = a.launchDirect(learnerId);
                oldReceipt = a.confirm(oldSession);
                var evaluation = a.successful(oldSession, ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM));
                passingArguments = a.writeArgs(learnerId, Map.of("goalId", EXAM, "earnedPoints", 10.0,
                        "evaluationCapability", evaluation.get("evaluationCapability")));
                oldSuccess = a.successful(oldSession, ClaudeV1Contract.TOOL_SET_MASTERY, passingArguments);
                assertThat(map(map(oldSuccess, "context"), "levelCompletion")).containsEntry("complete", true);
                assertThat(a.successful(oldSession, ClaudeV1Contract.TOOL_SET_MASTERY, passingArguments)).isEqualTo(oldSuccess);
                a.assertMasteryAndFocus(learnerId, true);
                var complete = a.service().getCoachLearnerState(learnerId).levelCompletion();
                var voluntary = complete.actions().stream().filter(action -> "learnGoal".equals(action.action())
                        && PREPARATION.equals(action.goalId())).findFirst().orElseThrow();
                oldVoluntaryAction = new LevelCompletionActionRequest(voluntary.action(), PROFILE, voluntary.goalId(),
                        voluntary.intent(), complete.learnerRevision());

                a.createLearner(runningLearnerId);
                runningSession = a.launchDirect(runningLearnerId);
                a.confirm(runningSession);
                runningEvaluation = (String) a.successful(runningSession, ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION,
                        Map.of("goalId", EXAM)).get("evaluationCapability");
                a.assertPrivate(learnerId, oldSession);
                a.assertPrivate(runningLearnerId, runningSession);

                // A real file change is visible to the watcher, but never hot-reloads A's pinned objects.
                ObjectNode changed = (ObjectNode) files.readTree(Files.readAllBytes(curricula.resolve(PROFILE_PATH)));
                changed.put("revision", oldProfileRevision + "-restart-B");
                Files.writeString(curricula.resolve(PROFILE_PATH), files.writerWithDefaultPrettyPrinter().writeValueAsString(changed));
                oldCatalog.verifyPinnedGeneration();
                assertThat(oldCatalog.available()).isFalse();
                assertThat(oldCatalog.generation()).isEqualTo(oldGeneration);
                assertThat(oldCatalog.profile(PROFILE).revision()).isEqualTo(oldProfileRevision);
                assertThat(a.call(oldSession, ClaudeV1Contract.TOOL_SET_MASTERY, passingArguments).isError()).isTrue();
                a.assertMasteryAndFocus(learnerId, true);
            }
            // The old context is fully closed before a separate boot constructs repositories, caches and MCP registration.
            try (var second = boot(database, curricula)) {
                Lane b = new Lane(second);
                assertThat(b.catalog()).isNotSameAs(oldCatalog);
                assertThat(b.contract()).isNotSameAs(oldRegistry);
                assertThat(b.catalog().available()).isTrue();
                assertThat(b.catalog().generation()).isNotEqualTo(oldGeneration);
                assertThat(b.catalog().profile(PROFILE).revision()).isEqualTo(oldProfileRevision + "-restart-B");
                assertThat(b.contract().contractFingerprint()).isEqualTo(oldFingerprint);
                assertThat(b.contract().bindingDigest()).isNotEqualTo(oldBinding);
                assertThat(b.canonicalIds()).isEqualTo(canonicalIds);
                b.assertMasteryAndFocus(learnerId, true);
                b.assertMasteryAndFocus(runningLearnerId, false);
                long beforeRejectedActions = b.version(learnerId);
                assertThat(map(b.context(oldSession), "completionContract")).containsEntry("status", "unavailable")
                        .doesNotContainKey("receiptCapability");
                assertThat(b.call(oldSession, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                        Map.of("receiptCapability", oldReceipt)).isError()).isTrue();
                assertThat(b.call(oldSession, ClaudeV1Contract.TOOL_SET_MASTERY, passingArguments).isError()).isTrue();
                assertThatThrownBy(() -> b.service().chooseLevelCompletion(learnerId, oldVoluntaryAction))
                        .isInstanceOf(ResponseStatusException.class)
                        .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode().value()).isEqualTo(409));
                assertThat(b.version(learnerId)).isEqualTo(beforeRejectedActions);
                assertThat(b.call(runningSession, ClaudeV1Contract.TOOL_SET_MASTERY,
                        b.writeArgs(runningLearnerId, Map.of("goalId", EXAM, "earnedPoints", 10.0,
                                "evaluationCapability", runningEvaluation))).isError()).isTrue();
                assertThat(b.service().getCoachLearnerState(runningLearnerId).activeGoal()).isNull();
                assertThat(b.service().getLearnerState(runningLearnerId).levelCompletion().directAssessmentRunning()).isFalse();
                b.assertMasteryAndFocus(runningLearnerId, false);

                // Explicitly leave the invalid old profile; no mastery or focus is reset.
                b.service().chooseLevelCompletion(learnerId,
                        new LevelCompletionActionRequest("leaveProfile", null, null, null, b.version(learnerId)));
                String freshSession = b.sessions().createFirstPartyLaunch(learnerId,
                        new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
                b.confirm(freshSession);
                String chooseProfile = ((List<?>) map(b.context(freshSession), "levelCompletion").get("choices")).stream()
                        .map(String::valueOf).filter(choice -> choice.startsWith("Abschnitt wählen: ")).findFirst().orElseThrow();
                var selected = b.successful(freshSession, CHOOSE, b.writeArgs(learnerId, Map.of("choice", chooseProfile)));
                assertThat(map(map(selected, "context"), "levelCompletion")).containsEntry("complete", true);
                var current = b.service().getCoachLearnerState(learnerId).levelCompletion();
                assertThat(current.calculationStatus()).isEqualTo("valid");
                assertThat(current.complete()).isTrue();
                assertThat(current.curriculumGeneration()).isEqualTo(b.catalog().generation());
                assertThat(current.profileRevision()).isEqualTo(oldProfileRevision + "-restart-B");
                assertThat(current.masteredTargetCount()).isEqualTo(1);
                assertThat(current.waivedTargetCount()).isEqualTo(1);
                b.assertMasteryAndFocus(learnerId, true);
                b.assertPrivate(learnerId, freshSession);
                b.assertPrivate(runningLearnerId, runningSession);
                assertThat(b.call(oldSession, ClaudeV1Contract.TOOL_SET_MASTERY, passingArguments).isError()).isTrue();
                assertThat(b.jdbc().queryForObject("SELECT COUNT(*) FROM databasechangelog WHERE id = ?",
                        Integer.class, "041-add-claude-completion-contract")).isEqualTo(1);
                evidenceResult = Map.of(
                        "passed", true, "applicationBoots", 2, "database", "isolated PostgreSQL schema",
                        "recordedAt", java.time.Instant.now().toString(),
                        "javaRuntime", System.getProperty("java.runtime.version"), "canonicalGoals", canonicalIds.size(),
                        "oldGeneration", oldGeneration, "newGeneration", b.catalog().generation(),
                        "profileRevisions", List.of(oldProfileRevision, current.profileRevision()),
                        "checks", List.of("real-mcp-success-before-restart", "no-hot-reload-under-old-hash",
                                "old-receipt-action-evaluation-and-replay-rejected", "live-direct-binding-recovered",
                                "existing-mastery-immediately-completes-new-profile", "new-session-and-receipt-work",
                                "unchanged-focus", "private-workflow-not-exported", "original-input-bytes-unchanged"));
            }
        } finally {
            database.close();
            for (var source : sourceHashes.entrySet()) assertThat(hash(source.getKey())).isEqualTo(source.getValue());
        }
        Files.createDirectories(evidence.getParent());
        files.writerWithDefaultPrettyPrinter().writeValue(evidence.toFile(), evidenceResult);
    }

    private Path copyRequiredRepositoryInputs() throws Exception {
        Path sourceRoot = Path.of("../curricula").toAbsolutePath().normalize();
        Path targetRoot = temporary.resolve("curricula");
        List<Path> inputs = new ArrayList<>(List.of(CANONICAL, PROFILE_PATH,
                Path.of("DE/Gymnasium/completion-scopes/" + PROFILE + ".json")));
        var profile = files.readTree(Files.readAllBytes(sourceRoot.resolve(PROFILE_PATH)));
        Set<String> reviews = new java.util.LinkedHashSet<>();
        reviews.add(profile.path("review").path("reference").asText());
        profile.path("rules").forEach(rule -> reviews.add(rule.path("reviewRef").asText()));
        for (String reference : reviews) {
            Path review = Path.of(reference);
            assertThat(review.startsWith("curricula")).isTrue();
            inputs.add(review.subpath(1, review.getNameCount()));
        }
        for (var goal : files.readTree(Files.readAllBytes(sourceRoot.resolve(CANONICAL))).path("goals")) {
            String source = goal.path("extendedData").path("vocabularySource").asText();
            if (!source.isBlank()) inputs.add(Path.of("DE/Gymnasium/memory-decks").resolve(Path.of(source).getFileName()));
        }
        for (Path relative : inputs.stream().distinct().toList()) {
            Path source = sourceRoot.resolve(relative).normalize();
            assertThat(source.startsWith(sourceRoot)).isTrue();
            assertThat(Files.isRegularFile(source)).as("Required repository input %s", relative).isTrue();
            sourceHashes.put(source, hash(source));
            Path target = targetRoot.resolve(relative); Files.createDirectories(target.getParent()); Files.copy(source, target);
        }
        return targetRoot;
    }

    private ConfigurableApplicationContext boot(Database database, Path curricula) {
        SpringApplication application = new SpringApplication(SkillpilotApplication.class);
        application.setAdditionalProfiles("test"); application.setRegisterShutdownHook(false);
        return application.run(
                "--server.address=127.0.0.1", "--server.port=0",
                "--skillpilot.landscapes.directory=" + curricula,
                "--skillpilot.curriculum.source=repository", "--skillpilot.completion.enabled=true",
                "--skillpilot.completion.enabled-profile-ids=" + PROFILE,
                "--skillpilot.completion.warmup-curriculum-ids=" + MATH,
                "--" + ClaudeV1TestProperties.ENABLED, "--" + ClaudeV1TestProperties.SIGNING_SECRET,
                "--" + ClaudeV1TestProperties.CAPABILITY_SECRET, "--" + ClaudeV1TestProperties.BETA_DISABLED,
                "--spring.datasource.url=" + database.url(), "--spring.datasource.username=completion_test",
                "--spring.datasource.password=" + database.password(),
                "--spring.datasource.driver-class-name=org.postgresql.Driver",
                "--spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect",
                "--spring.jpa.hibernate.ddl-auto=validate", "--spring.jpa.show-sql=false",
                "--spring.liquibase.enabled=true", "--spring.liquibase.default-schema=" + database.schema(),
                "--spring.liquibase.liquibase-schema=" + database.schema(),
                "--spring.jpa.properties.hibernate.default_schema=" + database.schema(),
                "--spring.datasource.hikari.maximum-pool-size=3", "--spring.main.banner-mode=off",
                "--logging.file.name=" + temporary.resolve("restart-test.log"), "--logging.level.root=WARN");
    }

    private record Database(JdbcTemplate admin, String url, String schema, String password) implements AutoCloseable {
        static Database isolated() {
            String raw = System.getenv("SKILLPILOT_TEST_POSTGRES_URL");
            URI uri = URI.create(raw.substring("jdbc:".length()));
            if (!"jdbc".equals(raw.substring(0, 4)) || !"postgresql".equals(uri.getScheme())
                    || !Set.of("localhost", "127.0.0.1").contains(uri.getHost())
                    || !"/skillpilot_completion_test".equals(uri.getPath()) || uri.getRawQuery() != null
                    || uri.getRawFragment() != null || uri.getRawUserInfo() != null
                    || !"completion_test".equals(System.getenv().getOrDefault("SKILLPILOT_TEST_POSTGRES_USER", "completion_test"))) {
                throw new IllegalArgumentException("Only the disposable loopback completion_test database/login is allowed");
            }
            String password = System.getenv().getOrDefault("SKILLPILOT_TEST_POSTGRES_PASSWORD", "");
            JdbcTemplate admin = new JdbcTemplate(new DriverManagerDataSource(raw, "completion_test", password));
            String schema = "completion_restart_" + UUID.randomUUID().toString().replace("-", "");
            admin.execute("CREATE SCHEMA " + schema);
            return new Database(admin, raw + "?currentSchema=" + schema, schema, password);
        }
        @Override public void close() {
            if (!schema.matches("completion_restart_[0-9a-f]{32}")) throw new IllegalStateException("Unsafe test schema");
            admin.execute("DROP SCHEMA IF EXISTS " + schema + " CASCADE");
        }
    }

    private record Lane(ConfigurableApplicationContext context) {
        LearnerService service() { return context.getBean(LearnerService.class); }
        LearnerRepository learners() { return context.getBean(LearnerRepository.class); }
        PlannedGoalRepository focus() { return context.getBean(PlannedGoalRepository.class); }
        MasteryRepository mastery() { return context.getBean(MasteryRepository.class); }
        ClaudeV1LearningSessionService sessions() { return context.getBean(ClaudeV1LearningSessionService.class); }
        ClaudeV1SessionCoordinator coordinator() { return context.getBean(ClaudeV1SessionCoordinator.class); }
        CompletionProfileCatalog catalog() { return context.getBean(CompletionProfileCatalog.class); }
        ClaudeV1CompletionContractRegistry contract() { return context.getBean(ClaudeV1CompletionContractRegistry.class); }
        ObjectMapper mapper() { return context.getBean(ObjectMapper.class); }
        JdbcTemplate jdbc() { return context.getBean(JdbcTemplate.class); }
        long version(String learner) { return learners().findById(learner).orElseThrow().getCoachStateRevision(); }
        Set<String> canonicalIds() { return context.getBean(LandscapeService.class).getById(MATH).getGoals().stream()
                .map(goal -> goal.getId()).collect(Collectors.toSet()); }
        void createLearner(String id) throws Exception {
            Learner learner = new Learner(); learner.setSkillpilotId(id); learner.setSelectedCurriculum(MATH);
            // Normal focus mode deliberately offers the unmastered preparation goal after the
            // assessment; strict global prerequisites would correctly suppress that action.
            learner.setAutoPilot(false); learner.setStrictMode(false);
            learner.setPersonalCurriculum(mapper().writeValueAsString(Map.of(MATH, Map.of("selected", true, "filterId", "GK+LK"))));
            learners().saveAndFlush(learner); focus().saveAndFlush(new PlannedGoal(learner, PREPARATION));
            service().chooseLevelCompletion(id, new LevelCompletionActionRequest("selectProfile", PROFILE, null, null, version(id)));
        }
        String launchDirect(String id) {
            return sessions().createFirstPartyLaunch(id, new ClaudeV1CoachStartRequest("de", "web-start",
                    new CompletionAssessmentStart(PROFILE, EXAM, version(id)))).learningSessionId();
        }
        String confirm(String session) throws Exception {
            String receipt = (String) map(context(session), "completionContract").get("receiptCapability");
            assertThat(successful(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", receipt))).containsEntry("confirmed", true);
            return receipt;
        }
        Map<String, Object> context(String session) throws Exception { return successful(session, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of()); }
        Map<String, Object> writeArgs(String id, Map<String, Object> extra) {
            var args = new LinkedHashMap<>(extra); args.put("expectedStateVersion", version(id));
            args.put("clientRequestId", UUID.randomUUID().toString()); return args;
        }
        McpSchema.CallToolResult call(String session, String tool, Map<String, Object> arguments) {
            SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(session, "unused", List.of(
                    new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ), new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
            var args = new LinkedHashMap<>(arguments); args.put("learningSessionId", session); args.put("language", "de");
            var spec = context.getBean(ClaudeV1McpContractAdapter.class).toolSpecifications().stream()
                    .filter(item -> tool.equals(item.tool().name())).findFirst().orElseThrow();
            return spec.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, args));
        }
        Map<String, Object> successful(String session, String tool, Map<String, Object> args) throws Exception {
            var result = call(session, tool, args); assertThat(result.isError()).as("%s: %s", tool, result.content()).isFalse();
            return mapper().readValue(((McpSchema.TextContent) result.content().getFirst()).text(), new TypeReference<>() {});
        }
        void assertMasteryAndFocus(String id, boolean passed) {
            var rows = mastery().findByLearner_SkillpilotId(id);
            if (passed) assertThat(rows).singleElement().satisfies(row -> {
                assertThat(row.getGoalKey()).isEqualTo(EXAM); assertThat(row.getValue()).isEqualTo(1.0);
            }); else assertThat(rows).isEmpty();
            assertThat(focus().findByLearner_SkillpilotId(id)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        }
        void assertPrivate(String id, String session) throws Exception {
            String serialized = mapper().writeValueAsString(learners().findById(id).orElseThrow());
            String exported = mapper().writeValueAsString(service().exportLearner(id));
            for (String document : List.of(serialized, exported)) assertThat(document)
                    .doesNotContain("completionWorkflow", "directAssessment", "sessionBinding", "completionContract", session);
            String hash = context.getBean(ClaudeV1SessionTokenCodec.class).hash(session);
            assertThat(context.getBean(ClaudeV1LearningSessionRepository.class).findByTokenHash(hash)).isPresent();
        }
    }
    @SuppressWarnings("unchecked") private static Map<String, Object> map(Map<String, Object> parent, String key) {
        assertThat(parent.get(key)).as(key).isInstanceOf(Map.class); return (Map<String, Object>) parent.get(key);
    }
    private static String hash(Path path) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(path)));
    }
}
