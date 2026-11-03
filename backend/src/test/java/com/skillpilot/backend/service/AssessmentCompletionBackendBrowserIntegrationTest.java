package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.skillpilot.backend.completion.CompletionWorkflowState;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1CompletionContractRegistry;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1McpContractAdapter;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import java.nio.file.attribute.PosixFilePermissions;

/** Real browser -> real HTTP -> production controllers/services -> ordinary isolated test repositories.
 * Run with SKILLPILOT_COMPLETION_BACKEND_BROWSER=true and Gradle --rerun-tasks after app npm ci
 * and playwright install chromium (the browser script and opt-in environment are not Gradle inputs).
 * This verifies the first-party launch boundary, not execution inside an external Claude host. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        "server.address=127.0.0.1",
        "spring.datasource.url=jdbc:h2:mem:completion-backend-browser;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE;LOCK_TIMEOUT=30000",
        "spring.jpa.show-sql=false"
})
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@EnabledIfEnvironmentVariable(named = "SKILLPILOT_COMPLETION_BACKEND_BROWSER", matches = "true")
class AssessmentCompletionBackendBrowserIntegrationTest {
    private static final String PROFILE = "automatic:personal-curriculum";
    // This synthetic 916-target / 139-assessment load fixture retains the fixed
    // 256 KiB transport budget; its measurements do not describe real Mathematics.
    private static final int COMPLETION_PAYLOAD_BUDGET = 256 * 1024;
    private static final String ROOT = CompletionTransportTestCurriculum.ROOT;
    private static final String MATH = ROOT;
    private static final String PREPARATION = CompletionTransportTestCurriculum.PREPARATION;
    private static final String EXAM = CompletionTransportTestCurriculum.EXAM;
    @LocalServerPort int port;
    @Autowired LearnerRepository learners;
    @Autowired PlannedGoalRepository focus;
    @Autowired MasteryRepository mastery;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired ClaudeV1CompletionContractRegistry completionContract;
    @Autowired ClaudeV1McpContractAdapter adapter;
    @Autowired LearnerService learnerService;

    @DynamicPropertySource
    static void isolatedCurriculum(DynamicPropertyRegistry properties) {
        properties.add("skillpilot.landscapes.directory", () -> CompletionTransportTestCurriculum.directory().toString());
    }

    @Test void directHttpLaunchUsesThePublishedAssessmentWithoutAProfileSelectionWrite() throws Exception {
        String id = createSyntheticLearner();
        URI base = URI.create("http://127.0.0.1:" + port + "/api/ui/learners/" + id + "/");
        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build()) {
            var previewResponse = client.send(HttpRequest.newBuilder(base.resolve("state"))
                    .timeout(Duration.ofSeconds(60)).GET().build(), HttpResponse.BodyHandlers.ofByteArray());
            assertThat(previewResponse.statusCode()).isEqualTo(200);
            JsonNode preview = mapper.readTree(previewResponse.body()).path("levelCompletion");
            assertThat(preview.path("profileId").asText()).isEqualTo(PROFILE);
            assertThat(preview.path("calculationStatus").asText()).isEqualTo("valid");
            assertThat(preview.hasNonNull("navigationIntent")).isFalse();
            JsonNode option = java.util.stream.StreamSupport.stream(preview.path("profileOptions").spliterator(), false)
                    .filter(entry -> PROFILE.equals(entry.path("profileId").asText())).findFirst().orElseThrow();
            assertThat(preview.path("targetCount").asInt()).isEqualTo(CompletionTransportTestCurriculum.TARGET_COUNT);
            assertThat(option.path("assessments").size()).isEqualTo(CompletionTransportTestCurriculum.ASSESSMENT_COUNT).isGreaterThan(24);
            JsonNode assessment = java.util.stream.StreamSupport.stream(option.path("assessments").spliterator(), false)
                    .filter(entry -> EXAM.equals(entry.path("goalId").asText())).findFirst().orElseThrow();
            assertThat(assessment.path("startAvailable").asBoolean()).isTrue();
            assertThat(learners.findById(id).orElseThrow().getCompletionWorkflow()).isNull();
            long revision = preview.path("learnerRevision").asLong();
            var launch = HttpRequest.newBuilder(base.resolve("claude/v1/launch"))
                    .timeout(Duration.ofSeconds(60)).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(Map.of(
                            "client", "web-start", "communicationLocale", "de",
                            "completionAssessment", Map.of("profileId", option.path("profileId").asText(),
                                    "goalId", EXAM, "expectedRevision", revision))))).build();
            var response = client.send(launch, HttpResponse.BodyHandlers.ofByteArray());
            assertThat(response.statusCode()).isEqualTo(200);
            JsonNode launchResult = mapper.readTree(response.body());
            assertThat(launchResult.path("prompt").asText()).isEqualTo(
                    "Nutze den SkillPilot-Coach-Skill und lerne mit meinem aktuellen SkillPilot-Lernkontext weiter."
                            + "\nlearningSessionId: " + launchResult.path("learningSessionId").asText());
            Learner persisted = learners.findById(id).orElseThrow();
            assertThat(persisted.getActiveGoalId()).isEqualTo(EXAM);
            assertThat(persisted.getCoachStateRevision()).isEqualTo(revision + 1);
            assertThat(mapper.readValue(persisted.getCompletionWorkflow(), CompletionWorkflowState.class)
                    .directAssessment().goalId()).isEqualTo(EXAM);
        }
        assertThat(mastery.findByLearner_SkillpilotId(id)).isEmpty();
        assertThat(focus.findByLearner_SkillpilotId(id)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM claude_v1_learning_session WHERE learner_id = ?",
                Integer.class, id)).isEqualTo(1);
    }

    @Test void mobileCockpitAndProviderStartUseRealHttpAndPersistOneOwnedAssessment() throws Exception {
        String id = createSyntheticLearner();
        Path app = Path.of("../app").toAbsolutePath().normalize();
        Path evidence = app.resolve("../tmp/level-completion-backend-browser").normalize();
        Files.createDirectories(evidence);
        // Delete only this test's previous summary, so a failed run cannot be
        // mistaken for fresh success by the enclosing Gradle/CI assertion.
        Files.deleteIfExists(evidence.resolve("evidence.json"));
        try (TestProcess browser = TestProcess.start(app, evidence.resolve("runner.log"), Map.of(
                "SKILLPILOT_COMPLETION_BACKEND_BROWSER", "true",
                "SKILLPILOT_COMPLETION_BROWSER_URL", "http://127.0.0.1:" + port,
                "SKILLPILOT_COMPLETION_BROWSER_LEARNER", id))) {
            browser.assertSuccessful();
        }
        var report = mapper.readTree(Files.readString(evidence.resolve("evidence.json")));
        assertThat(report.path("transport").asText()).isEqualTo("real-loopback-http");
        assertThat(report.path("checks").size()).isEqualTo(6);
        assertThat(report.path("hostAcceptance").asBoolean()).isFalse();

        // Independent database assertions establish that the browser exercised
        // a real committed session, not only correctly rendered JSON payloads.
        Learner persisted = learners.findById(id).orElseThrow();
        CompletionWorkflowState workflow = mapper.readValue(persisted.getCompletionWorkflow(), CompletionWorkflowState.class);
        assertThat(workflow.profileId()).isEqualTo(PROFILE);
        assertThat(workflow.directAssessment()).isNotNull();
        assertThat(workflow.directAssessment().provider()).isEqualTo("claude");
        assertThat(workflow.directAssessment().goalId()).isEqualTo(EXAM);
        assertThat(persisted.getActiveGoalId()).isEqualTo(EXAM);
        assertThat(persisted.getStrictMode()).isTrue();
        assertThat(persisted.getFollowLearningPlans()).isTrue();
        assertThat(persisted.getCoachStateRevision()).isEqualTo(report.path("runningRevision").asLong());
        assertThat(focus.findByLearner_SkillpilotId(id)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThat(mastery.findByLearner_SkillpilotId(id)).isEmpty();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM claude_v1_learning_session WHERE learner_id = ?",
                Integer.class, id)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT completion_contract FROM claude_v1_learning_session WHERE learner_id = ? AND token_hash = ?",
                String.class, id, workflow.directAssessment().sessionBinding())).isEqualTo(completionContract.pendingStamp());
    }

    @Test void failedAndSlowHttpRecoverAndConfirmedMcpResultHasAnAccessibleScopedExplanation() throws Exception {
        String id = createSyntheticLearner();
        Path app = Path.of("../app").toAbsolutePath().normalize();
        Path evidence = app.resolve("../tmp/level-completion-backend-browser").normalize();
        Files.createDirectories(evidence);
        Path ipc = Files.createTempDirectory(app.resolve("../tmp").normalize(), "completion-result-ipc-",
                PosixFilePermissions.asFileAttribute(PosixFilePermissions.fromString("rwx------")));
        Path sessionFile = ipc.resolve("session.json");
        try (TestProcess browser = TestProcess.start(app, evidence.resolve("runner-result.log"), Map.of(
                "SKILLPILOT_COMPLETION_BACKEND_BROWSER", "true",
                "SKILLPILOT_COMPLETION_BROWSER_URL", "http://127.0.0.1:" + port,
                "SKILLPILOT_COMPLETION_BROWSER_LEARNER", id,
                "SKILLPILOT_COMPLETION_BROWSER_RESULT", "true",
                "SKILLPILOT_COMPLETION_BROWSER_IPC", ipc.toString()))) {
            browser.awaitFile(sessionFile);
            assertThat(Files.getPosixFilePermissions(sessionFile)).isEqualTo(PosixFilePermissions.fromString("rw-------"));
            String session = mapper.readTree(Files.readString(sessionFile)).path("learningSessionId").asText();
            Files.delete(sessionFile); // Never retain even synthetic session credentials as test artifacts.
            SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(session, "unused", List.of(
                    new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                    new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
            try {
                JsonNode pending = mcp(session, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of());
                long beforeReceipt = learners.findById(id).orElseThrow().getCoachStateRevision();
                JsonNode receipt = mcp(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                        Map.of("receiptCapability", pending.path("completionContract").path("receiptCapability").asText()));
                assertThat(receipt.path("confirmed").asBoolean()).isTrue();
                assertThat(learners.findById(id).orElseThrow().getCoachStateRevision()).isEqualTo(beforeReceipt);
                JsonNode current = mcp(session, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of());
                assertThat(current.path("activeGoal").path("id").asText()).isEqualTo(EXAM);
                JsonNode evaluation = mcp(session, ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM));
                JsonNode saved = mcp(session, ClaudeV1Contract.TOOL_SET_MASTERY, Map.of(
                        "goalId", EXAM, "earnedPoints", 10.0,
                        "evaluationCapability", evaluation.path("evaluationCapability").asText(),
                        "expectedStateVersion", current.path("stateVersion").asLong(),
                        "clientRequestId", UUID.randomUUID().toString()));
                assertThat(saved.path("context").path("levelCompletion").path("complete").asBoolean()).isFalse();
                assertThat(learnerService.getLearnerState(id).levelCompletion().masteredAssessmentCount()).isEqualTo(1);
            } finally { SecurityContextHolder.clearContext(); }
            Files.writeString(ipc.resolve("result-ready"), "confirmed");
            browser.assertSuccessful();
        } finally {
            Files.deleteIfExists(sessionFile); Files.deleteIfExists(ipc.resolve("session.tmp"));
            Files.deleteIfExists(ipc.resolve("result-ready")); Files.deleteIfExists(ipc);
            SecurityContextHolder.clearContext();
        }
        JsonNode report = mapper.readTree(Files.readString(evidence.resolve("evidence-result.json")));
        assertThat(report.path("resultChecks").size()).isEqualTo(7);
        assertThat(report.path("hostAcceptance").asBoolean()).isFalse();
        assertThat(mastery.findByLearner_SkillpilotId(id)).singleElement().satisfies(result -> {
            assertThat(result.getGoalKey()).isEqualTo(EXAM); assertThat(result.getValue()).isEqualTo(1.0);
        });
        assertThat(learnerService.getLearnerState(id).levelCompletion().complete()).isFalse();
        assertThat(learnerService.getLearnerState(id).levelCompletion().masteredAssessmentCount()).isEqualTo(1);
        assertThat(learnerService.getLearnerState(id).levelCompletion().navigationIntent()).isEqualTo("paused");
        assertThat(learners.findById(id).orElseThrow().getActiveGoalId()).isNull();
        assertThat(focus.findByLearner_SkillpilotId(id)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
    }

    private JsonNode mcp(String session, String tool, Map<String, Object> fields) throws Exception {
        var arguments = new LinkedHashMap<>(fields);
        arguments.put("learningSessionId", session); arguments.put("language", "de");
        var definition = adapter.toolSpecifications().stream().filter(spec -> tool.equals(spec.tool().name())).findFirst().orElseThrow();
        var result = definition.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, arguments));
        assertThat(result.isError()).as("Actual MCP handler %s", tool).isFalse();
        return mapper.readTree(((McpSchema.TextContent) result.content().getFirst()).text());
    }

    @Test void recordWarmHttpStateCostWithAndWithoutProfileOnTheSameLearner() throws Exception {
        String id = createSyntheticLearner();
        URI stateUrl = URI.create("http://127.0.0.1:" + port + "/api/ui/learners/" + id + "/state");
        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build()) {
            var baseline = sampleState(client, stateUrl, false);
            long revision = ((JsonNode) baseline.get("lastState")).path("levelCompletion").path("learnerRevision").asLong();
            var select = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api/ui/learners/" + id + "/level-completion/actions"))
                    .timeout(Duration.ofSeconds(60)).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(Map.of(
                            "action", "selectProfile", "profileId", PROFILE, "expectedRevision", revision))))
                    .build();
            assertThat(client.send(select, HttpResponse.BodyHandlers.ofByteArray()).statusCode()).isEqualTo(200);
            var profiled = sampleState(client, stateUrl, true);
            JsonNode last = (JsonNode) profiled.remove("lastState");
            baseline.remove("lastState");
            var report = new LinkedHashMap<String, Object>();
            report.put("recordedAt", Instant.now().toString());
            report.put("transport", "real-loopback-http");
            report.put("database", "isolated H2, ordinary production repositories; PostgreSQL snapshot semantics tested separately");
            report.put("method", "3 warmups then 30 sequential GET /state requests per condition, automatic overview then explicit full-curriculum route, same learner/focus, autoPilot=false, strictMode=true; no network TLS");
            report.put("limitations", "One local process and a synthetic 916-target / 139-assessment Personal Curriculum; order/JIT/GC effects remain. Difference of p95 values is observational, not a paired causal estimate. No host acceptance or production capacity claim.");
            report.put("learnerSetup", Map.of("root", ROOT, "subject", MATH, "syntheticCurriculum", true, "stage", "CrossStage",
                    "targetFixtureSize", CompletionTransportTestCurriculum.TARGET_COUNT, "assessmentFixtureSize", CompletionTransportTestCurriculum.ASSESSMENT_COUNT, "focus", List.of(PREPARATION), "masteryRows", 0));
            report.put("profileId", last.path("levelCompletion").path("profileId").asText());
            report.put("profileRevision", last.path("levelCompletion").path("profileRevision").asText());
            report.put("curriculumGeneration", last.path("levelCompletion").path("curriculumGeneration").asText());
            report.put("targetCount", last.path("levelCompletion").path("targetCount").asInt());
            report.put("requiredAssessmentCount", last.path("levelCompletion").path("requiredAssessmentCount").asInt());
            report.put("withoutProfile", baseline);
            report.put("withProfile", profiled);
            double delta = ((Number) profiled.get("p95Millis")).doubleValue() - ((Number) baseline.get("p95Millis")).doubleValue();
            report.put("additionalP95Millis", delta);
            report.put("additionalP95BudgetMillis", 100);
            report.put("additionalP95WithinInformationalBudget", delta <= 100);
            int projectionBytes = mapper.writeValueAsBytes(last.path("levelCompletion")).length;
            report.put("levelCompletionJsonBytes", projectionBytes);
            report.put("levelCompletionBudgetBytes", COMPLETION_PAYLOAD_BUDGET);
            report.put("fullResponseBytesDelta", ((Number) profiled.get("lastResponseBytes")).intValue()
                    - ((Number) baseline.get("lastResponseBytes")).intValue());
            var environment = new LinkedHashMap<String, Object>();
            for (String key : List.of("java.version", "java.runtime.version", "java.vendor", "java.vm.name", "os.name", "os.version", "os.arch")) {
                environment.put(key, System.getProperty(key));
            }
            environment.put("availableProcessors", Runtime.getRuntime().availableProcessors());
            environment.put("maxHeapBytes", Runtime.getRuntime().maxMemory());
            environment.put("cpuModel", firstMatchingLine("/proc/cpuinfo", "model name"));
            environment.put("cpuAffinity", firstMatchingLine("/proc/self/status", "Cpus_allowed_list"));
            environment.put("cgroupCpuMax", optionalFile("/sys/fs/cgroup/cpu.max"));
            environment.put("cgroupMemoryMax", optionalFile("/sys/fs/cgroup/memory.max"));
            environment.put("githubSha", System.getenv().getOrDefault("GITHUB_SHA", "not supplied; local working tree"));
            report.put("environment", environment);
            Path output = Path.of("../tmp/level-completion-backend-browser/http-performance.json");
            Files.createDirectories(output.getParent());
            Files.writeString(output, mapper.writerWithDefaultPrettyPrinter().writeValueAsString(report));
            assertThat(projectionBytes).as("Full Personal Curriculum projection stays within its measured payload budget")
                    .isLessThan(COMPLETION_PAYLOAD_BUDGET);
        }
        assertThat(mastery.findByLearner_SkillpilotId(id)).isEmpty();
        assertThat(focus.findByLearner_SkillpilotId(id)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM claude_v1_learning_session WHERE learner_id = ?", Integer.class, id)).isZero();
    }

    @Test void aKnownUncoveredTargetInARealCurriculumCopyKeepsOrdinaryAndBoundAssessmentAccess(
            @org.junit.jupiter.api.io.TempDir Path temporary) throws Exception {
        String realRoot = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
        String realMath = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
        String preparation = "3016ec37-1c2e-47db-83f5-e767923bc97e";
        String exam = "e98672c6-871a-5d0b-889c-5afc51040f0d";
        Path original = Path.of("../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
        byte[] originalBytes = Files.readAllBytes(original);
        Path copy = CompletionTransportTestCurriculum.writeFaultedRealCopy(Path.of("../curricula"), temporary.resolve("curricula"));
        var application = new org.springframework.boot.SpringApplication(com.skillpilot.backend.SkillpilotApplication.class);
        application.setAdditionalProfiles("test"); application.setRegisterShutdownHook(false);
        try (var context = application.run("--server.address=127.0.0.1", "--server.port=0",
                "--skillpilot.landscapes.directory=" + copy.toAbsolutePath(), "--skillpilot.curriculum.source=repository",
                "--" + ClaudeV1TestProperties.ENABLED, "--" + ClaudeV1TestProperties.SIGNING_SECRET,
                "--" + ClaudeV1TestProperties.CAPABILITY_SECRET, "--" + ClaudeV1TestProperties.BETA_DISABLED,
                "--spring.datasource.url=jdbc:h2:mem:completion-invalid-copy-" + UUID.randomUUID()
                        + ";DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
                "--spring.jpa.show-sql=false", "--spring.main.banner-mode=off", "--logging.level.root=WARN")) {
            var service = context.getBean(LearnerService.class);
            var repository = context.getBean(LearnerRepository.class);
            var resultRows = context.getBean(MasteryRepository.class);
            var planned = context.getBean(PlannedGoalRepository.class);
            var sessionService = context.getBean(com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService.class);
            var sessionRows = context.getBean(com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository.class);
            var tokens = context.getBean(com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec.class);
            String config = mapper.writeValueAsString(Map.of(
                    realRoot, Map.of("selected", true, "filterId", "DE-HE", "stage", "CrossStage", "durationModel", "G9"),
                    realMath, Map.of("selected", true, "filterId", "GK+LK"),
                    "__skillpilot_stage_scope_sek1__", Map.of("selected", true),
                    "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                    CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                            CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, realRoot,
                            CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                            CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true)));
            List<String> learnerIds = new ArrayList<>();
            for (int index = 0; index < 2; index++) {
                Learner learner = new Learner(); String id = "completion-browser-" + UUID.randomUUID();
                learner.setSkillpilotId(id); learner.setSelectedCurriculum(realRoot); learner.setPersonalCurriculum(config);
                learner.setAutoPilot(false); learner.setStrictMode(false); learner.setFollowLearningPlans(false);
                learner = repository.saveAndFlush(learner); planned.saveAndFlush(new PlannedGoal(learner, preparation));
                learnerIds.add(id);
            }
            String id = learnerIds.getFirst(), peer = learnerIds.getLast();
            var inputs = service.getLearningPlanCompletionContext(id);
            assertThat(inputs.level2TargetGoalIds()).contains(CompletionTransportTestCurriculum.UNCOVERED);
            var atoms = inputs.level2TargetGoalIds().stream().filter(goal -> {
                var definition = inputs.canonicalGoals().get(goal);
                return definition.getContains() == null || definition.getContains().isEmpty();
            }).collect(java.util.stream.Collectors.toSet());
            var graph = new com.skillpilot.backend.completion.CompletionProfileCompiler().compileAutomatic(
                    inputs.canonicalGoals(), atoms, inputs.level2TargetGoalIds(), inputs.generation());
            assertThat(com.skillpilot.backend.completion.AutomaticCompletionIntegrity.uncoveredTargets(graph))
                    .contains(CompletionTransportTestCurriculum.UNCOVERED);
            assertThatThrownBy(() -> new com.skillpilot.backend.completion.CompletionEvaluator().evaluateAutomatic(graph, java.util.Set.of()))
                    .isInstanceOfSatisfying(com.skillpilot.backend.completion.CompletionCompilationException.class,
                            failure -> assertThat(failure.code()).isEqualTo("UNCOVERED_COMPLETION_TARGETS"));
            assertInvalidCompletion(service.getLearnerState(id).levelCompletion());
            assertThat(service.getFrontier(id)).contains(preparation);
            service.setActiveGoal(id, preparation);
            assertThat(repository.findById(id).orElseThrow().getActiveGoalId()).isEqualTo(preparation);
            long revision = repository.findById(id).orElseThrow().getCoachStateRevision();
            assertThatThrownBy(() -> service.chooseLevelCompletion(id, new com.skillpilot.backend.api.LevelCompletionActionRequest(
                    "selectProfile", PROFILE, null, null, revision))).isInstanceOfSatisfying(
                    org.springframework.web.server.ResponseStatusException.class,
                    failure -> assertThat(failure.getStatusCode().value()).isEqualTo(409));
            for (String provider : List.of("gemini", "openai")) assertThatThrownBy(() -> service.startCompletionAssessment(id,
                    new com.skillpilot.backend.api.CompletionAssessmentStart(PROFILE, exam, revision), provider,
                    "synthetic-untrusted-owner", Instant.now().plusSeconds(60)))
                    .isInstanceOfSatisfying(org.springframework.web.server.ResponseStatusException.class,
                            failure -> assertThat(failure.getStatusCode().value()).isEqualTo(409));
            int invalidPort = context.getEnvironment().getProperty("local.server.port", Integer.class);
            URI base = URI.create("http://127.0.0.1:" + invalidPort + "/api/ui/learners/" + id + "/");
            String session;
            try (HttpClient client = HttpClient.newHttpClient()) {
                var state = client.send(HttpRequest.newBuilder(base.resolve("state")).GET().build(), HttpResponse.BodyHandlers.ofString());
                assertThat(state.statusCode()).isEqualTo(200);
                assertThat(mapper.readTree(state.body()).path("levelCompletion").hasNonNull("complete")).isFalse();
                for (var rejected : List.of(Map.of("profileId", "automatic:forged", "goalId", exam, "expectedRevision", revision),
                        Map.of("profileId", PROFILE, "goalId", preparation, "expectedRevision", revision),
                        Map.of("profileId", PROFILE, "goalId", exam, "expectedRevision", revision - 1))) {
                    var request = HttpRequest.newBuilder(base.resolve("claude/v1/launch")).header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(Map.of(
                                    "client", "web-start", "communicationLocale", "de", "completionAssessment", rejected)))).build();
                    assertThat(client.send(request, HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(409);
                    assertThat(repository.findById(id).orElseThrow().getCoachStateRevision()).isEqualTo(revision);
                    assertThat(resultRows.findByLearner_SkillpilotId(id)).isEmpty();
                }
                var request = HttpRequest.newBuilder(base.resolve("claude/v1/launch")).header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(Map.of("client", "web-start", "communicationLocale", "de",
                                "completionAssessment", Map.of("profileId", PROFILE, "goalId", exam, "expectedRevision", revision))))).build();
                var started = client.send(request, HttpResponse.BodyHandlers.ofString());
                assertThat(started.statusCode()).isEqualTo(200);
                session = mapper.readTree(started.body()).path("learningSessionId").asText();
            }
            var stored = mapper.readValue(repository.findById(id).orElseThrow().getCompletionWorkflow(), CompletionWorkflowState.class);
            var sessionRow = sessionRows.findByTokenHash(tokens.hash(session)).orElseThrow();
            assertThat(stored.directAssessment().provider()).isEqualTo("claude");
            assertThat(stored.directAssessment().sessionBinding()).isEqualTo(sessionRow.tokenHash());
            assertThat(stored.directAssessment().expiresAt()).isEqualTo(sessionRow.expiresAt());
            assertThat(stored.directAssessment().goalId()).isEqualTo(exam);
            assertThat(sessionRow.learnerId()).isEqualTo(id);
            assertThat(repository.findById(id).orElseThrow().getCoachStateRevision()).isEqualTo(revision + 1);
            String peerSession = sessionService.createFirstPartyLaunch(peer,
                    new com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest("de", "web-start",
                            new com.skillpilot.backend.api.CompletionAssessmentStart(PROFILE, exam,
                                    repository.findById(peer).orElseThrow().getCoachStateRevision()))).learningSessionId();
            String receipt = invalidMcp(context, session, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of())
                    .path("completionContract").path("receiptCapability").asText();
            String peerReceipt = invalidMcp(context, peerSession, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of())
                    .path("completionContract").path("receiptCapability").asText();
            assertThat(invalidMcpRaw(context, session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", peerReceipt)).isError()).isTrue();
            invalidMcp(context, session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", receipt));
            invalidMcp(context, peerSession, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", peerReceipt));
            JsonNode evaluation = invalidMcp(context, session, ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", exam));
            var pass = new LinkedHashMap<String, Object>(); pass.put("goalId", exam); pass.put("earnedPoints", 10.0);
            pass.put("evaluationCapability", evaluation.path("evaluationCapability").asText());
            pass.put("clientRequestId", UUID.randomUUID().toString());
            pass.put("expectedStateVersion", repository.findById(peer).orElseThrow().getCoachStateRevision());
            assertThat(invalidMcpRaw(context, peerSession, ClaudeV1Contract.TOOL_SET_MASTERY, pass).isError()).isTrue();
            assertThat(resultRows.findByLearner_SkillpilotId(peer)).isEmpty();
            pass.put("clientRequestId", UUID.randomUUID().toString());
            pass.put("expectedStateVersion", repository.findById(id).orElseThrow().getCoachStateRevision());
            assertThat(invalidMcp(context, session, ClaudeV1Contract.TOOL_SET_MASTERY, pass).path("savedMastery").asDouble()).isEqualTo(1.0);
            assertInvalidCompletion(service.getLearnerState(id).levelCompletion());
            assertThat(resultRows.findByLearner_SkillpilotId(id)).singleElement().satisfies(result -> {
                assertThat(result.getGoalKey()).isEqualTo(exam); assertThat(result.getValue()).isEqualTo(1.0);
            });
            assertThat(service.getMastery(id).getOrDefault(preparation, 0.0)).isZero();
            assertThat(planned.findByLearner_SkillpilotId(id)).extracting(PlannedGoal::getGoalId).containsExactly(preparation);
        } finally {
            SecurityContextHolder.clearContext();
            assertThat(Files.readAllBytes(original)).isEqualTo(originalBytes);
        }
    }

    private static void assertInvalidCompletion(com.skillpilot.backend.api.LevelCompletionResponse completion) {
        assertThat(completion.calculationStatus()).isEqualTo("invalid");
        assertThat(completion.notice()).isEqualTo("completion_target_routes_uncovered");
        assertThat(completion.complete()).isNull();
        assertThat(completion.waivedTargetGoalIds()).isEmpty(); assertThat(completion.waiverDetails()).isEmpty();
        assertThat(completion.targetCount()).isZero(); assertThat(completion.waivedTargetCount()).isZero();
    }

    private static McpSchema.CallToolResult invalidMcpRaw(org.springframework.context.ConfigurableApplicationContext context,
            String session, String tool, Map<String, Object> extra) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(session, "unused", List.of(
                new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ), new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
        var arguments = new LinkedHashMap<String, Object>(extra); arguments.put("learningSessionId", session); arguments.put("language", "de");
        var definition = context.getBean(ClaudeV1McpContractAdapter.class).toolSpecifications().stream()
                .filter(spec -> tool.equals(spec.tool().name())).findFirst().orElseThrow();
        return definition.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, arguments));
    }

    private JsonNode invalidMcp(org.springframework.context.ConfigurableApplicationContext context,
            String session, String tool, Map<String, Object> extra) throws Exception {
        var result = invalidMcpRaw(context, session, tool, extra);
        assertThat(result.isError()).as("Actual invalid-copy MCP handler %s: %s", tool, result.content()).isFalse();
        return mapper.readTree(((McpSchema.TextContent) result.content().getFirst()).text());
    }

    private Map<String, Object> sampleState(HttpClient client, URI url, boolean profiled) throws Exception {
        List<Double> samples = new ArrayList<>();
        JsonNode last = null;
        int bytes = 0;
        var request = HttpRequest.newBuilder(url).timeout(Duration.ofSeconds(60)).GET().build();
        for (int index = -3; index < 30; index++) {
            long start = System.nanoTime();
            var response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
            double elapsed = (System.nanoTime() - start) / 1_000_000.0;
            assertThat(response.statusCode()).isEqualTo(200);
            last = mapper.readTree(response.body());
            assertThat(last.path("levelCompletion").path("calculationStatus").asText()).isEqualTo("valid");
            if (profiled) assertThat(last.path("levelCompletion").path("navigationIntent").asText()).isEqualTo("required");
            else assertThat(last.path("levelCompletion").hasNonNull("navigationIntent")).isFalse();
            assertThat(last.path("levelCompletion").path("directAssessmentRunning").asBoolean()).isFalse();
            bytes = response.body().length;
            if (index >= 0) samples.add(elapsed);
        }
        var sorted = new ArrayList<>(samples);
        Collections.sort(sorted);
        var result = new LinkedHashMap<String, Object>();
        result.put("warmupRequests", 3); result.put("measuredRequests", 30);
        result.put("percentileMethod", "nearest rank");
        result.put("samplesMillis", samples);
        result.put("p50Millis", sorted.get(14)); result.put("p95Millis", sorted.get(28));
        result.put("lastResponseBytes", bytes); result.put("lastState", last);
        return result;
    }

    private static String optionalFile(String file) {
        try { return Files.readString(Path.of(file)).strip(); }
        catch (Exception unavailable) { return "unavailable"; }
    }

    private static String firstMatchingLine(String file, String prefix) {
        return optionalFile(file).lines().filter(line -> line.startsWith(prefix)).findFirst().orElse("unavailable");
    }

    private String createSyntheticLearner() throws Exception {
        String id = "completion-browser-" + UUID.randomUUID();
        Learner learner = new Learner();
        learner.setSkillpilotId(id);
        learner.setSelectedCurriculum(ROOT);
        learner.setStrictMode(true);
        learner.setAutoPilot(false);
        learner.setFollowLearningPlans(true);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "stage", "CrossStage"))));
        learner = learners.saveAndFlush(learner);
        focus.saveAndFlush(new PlannedGoal(learner, PREPARATION));

        return id;
    }

    /** Owns the Node/Vite/Chromium lifetime, including a bounded failure path. */
    private record TestProcess(Process process, Path log) implements AutoCloseable {
        static TestProcess start(Path app, Path log, Map<String, String> environment) throws Exception {
            assertThat(app.resolve("node_modules/tsx/dist/cli.mjs")).isRegularFile();
            ProcessBuilder builder = new ProcessBuilder("node", "node_modules/tsx/dist/cli.mjs",
                    "scripts/testLevelCompletionBackendBrowser.ts");
            builder.directory(app.toFile());
            builder.environment().putAll(environment);
            builder.redirectErrorStream(true).redirectOutput(log.toFile());
            return new TestProcess(builder.start(), log);
        }

        void assertSuccessful() throws Exception {
            assertThat(process.waitFor(5, TimeUnit.MINUTES)).as("Browser timeout; see %s", log).isTrue();
            assertThat(process.exitValue()).withFailMessage("Browser failed:%n%s", Files.readString(log)).isZero();
        }

        void awaitFile(Path file) throws Exception {
            long deadline = System.nanoTime() + TimeUnit.MINUTES.toNanos(2);
            while (!Files.exists(file) && process.isAlive() && System.nanoTime() < deadline) Thread.sleep(25);
            assertThat(Files.isRegularFile(file)).withFailMessage("Browser did not reach its real-write stage:%n%s", Files.readString(log)).isTrue();
        }

        @Override public void close() throws Exception {
            // Descendants must be captured before the parent exits or they can
            // be reparented and outlive a failed/timeout browser run.
            var descendants = process.descendants().toList();
            descendants.reversed().forEach(ProcessHandle::destroy);
            if (process.isAlive()) process.destroy();
            if (!process.waitFor(5, TimeUnit.SECONDS)) process.destroyForcibly();
            descendants.stream().filter(ProcessHandle::isAlive).forEach(ProcessHandle::destroyForcibly);
        }
    }
}
