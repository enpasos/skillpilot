package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfiguration;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeSecureOAuthTestServer;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeBindingGrantRepository;
import com.skillpilot.backend.repository.OpenAiDeConnectionRepository;
import com.skillpilot.backend.repository.OpenAiDeIdempotencyRecordRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import com.skillpilot.backend.repository.OpenAiDePendingLaunchRepository;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinator;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1SessionMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1SessionStateException;
import com.skillpilot.backend.service.LearnerService;
import io.modelcontextprotocol.spec.McpSchema;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;

/**
 * Vertical release gate for the OpenAI Coach V1.
 *
 * <p>The test starts the real application with H2 and drives the independent public learning-session,
 * app-only OAuth and MCP HTTP boundaries. Identity mapping, learner workflow services and repositories
 * are deliberately not mocked.</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:openai-de-coach-e2e;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.liquibase.enabled=true",
        "spring.security.oauth2.client.registration.github.client-id=e2e-test-client",
        "spring.security.oauth2.client.registration.github.client-secret=e2e-test-secret",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
        "skillpilot.claude.enabled=false",
        "skillpilot.openai.coach.v1.enabled=true",
        "skillpilot.openai.coach.v1.server-build=test-build",
        "skillpilot.openai.coach.v1.writes-enabled=true",
        "skillpilot.openai.coach.v1.oauth.enabled=true",
        "skillpilot.openai.coach.v1.mcp.enabled=true",
        "skillpilot.openai.coach.v1.mcp-url=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth-resource=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth.client-id=chatgpt-e2e-client",
        "skillpilot.openai.coach.v1.oauth.redirect-uris=https://chatgpt.com/connector/oauth/e2e-callback",
        "skillpilot.openai.coach.v1.oauth.protected-resource-metadata=https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp"
})
class OpenAiDeCoachEndToEndIntegrationTest {

    private static final String PERMANENT_SKILLPILOT_ID = "9aa02f4b-06fd-4d6b-a548-3ac71fa263d9";
    private static final String CURRICULUM_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATHEMATICS_CURRICULUM_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_MATHEMATICS_ROOT_FOCUS_ID =
            "c01b1ce9-a667-4a46-b251-ec33ae602b15";
    private static final String HESSEN_SEKII_MATH_LK_SCOPE_ID =
            "composition:de-he-gym-sekii-math-lk:structure:sek2-lk";
    private static final String CLIENT_ID = OpenAiDeSecureOAuthTestServer.confidentialClientId();
    private static final String CALLBACK = "https://chatgpt.com/connector/oauth/e2e-callback";
    private static final String VERIFIER = "openai-de-e2e-pkce-verifier-with-more-than-forty-three-characters";
    private static final Set<String> MUTATING_TOOLS = Set.of(
            OpenAiDeV1McpContractAdapter.SET_SCOPE,
            OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL,
            OpenAiDeV1McpContractAdapter.SET_MASTERY,
            OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULT);

    @LocalServerPort
    private int port;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private OpenAiDeBindingGrantRepository bindingGrantRepository;

    @Autowired
    private OpenAiDeConnectionRepository connectionRepository;

    @Autowired
    private OpenAiDeLearningSessionRepository learningSessionRepository;

    @Autowired
    private OpenAiDeIdempotencyRecordRepository idempotencyRecordRepository;

    @Autowired
    private OpenAiDePendingLaunchRepository pendingLaunchRepository;

    @Autowired
    private OpenAiDeV1McpSessionCoordinator sessionCoordinator;

    @Autowired
    private LearnerService learnerService;

    @Autowired
    @Qualifier("openAiDeAuthorizationService")
    private OAuth2AuthorizationService authorizationService;

    @Autowired
    private JdbcOperations jdbcOperations;

    private HttpClient browser;
    private final Map<String, Long> observedSessionVersions = new HashMap<>();

    @DynamicPropertySource
    static void secureOpenAiDeProperties(DynamicPropertyRegistry registry) {
        OpenAiDeSecureOAuthTestServer.registerConfidentialSecureProperties(registry);
    }

    @BeforeEach
    void setUp() {
        observedSessionVersions.clear();
        jdbcOperations.update("DELETE FROM oauth2_authorization_consent");
        jdbcOperations.update("DELETE FROM oauth2_authorization");
        pendingLaunchRepository.deleteAllInBatch();
        bindingGrantRepository.deleteAllInBatch();
        idempotencyRecordRepository.deleteAllInBatch();
        learningSessionRepository.deleteAllInBatch();
        connectionRepository.deleteAllInBatch();
        jdbcOperations.update(
                "DELETE FROM planned_goal WHERE skillpilot_id = ?",
                PERMANENT_SKILLPILOT_ID);
        jdbcOperations.update(
                "DELETE FROM mastery WHERE skillpilot_id = ?",
                PERMANENT_SKILLPILOT_ID);
        Learner learner = learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseGet(() -> {
            Learner created = new Learner();
            created.setSkillpilotId(PERMANENT_SKILLPILOT_ID);
            return created;
        });
        learner.setSelectedCurriculum(CURRICULUM_ID);
        learner.setPersonalCurriculum(configuredPersonalCurriculum());
        learner.setActiveGoalId(null);
        learner.setLearningStrategy("RANDOM");
        learner.setAutoPilot(false);
        learner.setStrictMode(false);
        learner.setShowGoalVisualizationsInChat(true);
        learner.setCoachStateRevision(0L);
        learnerRepository.saveAndFlush(learner);

        CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        browser = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Test
    void canonicalRevisionCoversTwoSessionsWebWritesIdempotencyAndRollback() throws Exception {
        String launchPath = "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID)
                + "/openai/v1/launch";
        String firstSessionId = objectMapper.readTree(postJson(
                        launchPath,
                        "{\"communicationLocale\":\"de\",\"client\":\"revision-a\","
                                + "\"providerEligibilityConfirmed\":true}",
                        Map.of()).body())
                .path("learningSessionId")
                .asText();
        String secondSessionId = objectMapper.readTree(postJson(
                        launchPath,
                        "{\"communicationLocale\":\"de\",\"client\":\"revision-b\","
                                + "\"providerEligibilityConfirmed\":true}",
                        Map.of()).body())
                .path("learningSessionId")
                .asText();
        assertThat(firstSessionId).isNotBlank().isNotEqualTo(secondSessionId);
        long baseRevision = learnerRepository.findById(PERMANENT_SKILLPILOT_ID)
                .orElseThrow()
                .getCoachStateRevision();

        String replayRequestId = UUID.randomUUID().toString();
        Map<String, Object> firstArguments = Map.of(
                "learningStrategy", "SEQUENTIAL",
                "expectedStateVersion", baseRevision,
                "clientRequestId", replayRequestId);
        AtomicInteger operationCalls = new AtomicInteger();

        McpSchema.CallToolResult first = sessionCoordinator.write(
                firstSessionId,
                "set_preferences_test",
                baseRevision,
                replayRequestId,
                firstArguments,
                metadata -> {
                    operationCalls.incrementAndGet();
                    learnerService.setPreferences(
                            PERMANENT_SKILLPILOT_ID,
                            "SEQUENTIAL",
                            null,
                            null);
                    return successfulCoordinatorResult(metadata);
                });
        McpSchema.CallToolResult exactReplay = sessionCoordinator.write(
                firstSessionId,
                "set_preferences_test",
                baseRevision,
                replayRequestId,
                firstArguments,
                metadata -> {
                    operationCalls.incrementAndGet();
                    throw new AssertionError("An exact retry must not execute its operation again.");
                });

        assertThat(operationCalls).hasValue(1);
        assertThat(first.structuredContent().toString())
                .contains("stateVersion=" + (baseRevision + 1L));
        assertThat(exactReplay.structuredContent().toString())
                .contains("stateVersion=" + (baseRevision + 1L));
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow()
                .getCoachStateRevision()).isEqualTo(baseRevision + 1L);

        assertThatThrownBy(() -> sessionCoordinator.write(
                        secondSessionId,
                        "set_preferences_test",
                        baseRevision,
                        UUID.randomUUID().toString(),
                        Map.of("learningStrategy", "RANDOM"),
                        this::successfulCoordinatorResult))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> assertThat(exception.code())
                                .isEqualTo(OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT));

        assertThatThrownBy(() -> sessionCoordinator.write(
                        firstSessionId,
                        "set_preferences_test",
                        baseRevision + 1L,
                        replayRequestId,
                        Map.of("learningStrategy", "RANDOM"),
                        this::successfulCoordinatorResult))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> assertThat(exception.code())
                                .isEqualTo(OpenAiDeV1SessionStateException.Code.IDEMPOTENCY_KEY_REUSED));
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow()
                .getCoachStateRevision()).isEqualTo(baseRevision + 1L);

        HttpResponse<String> webWrite = putJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/preferences",
                "{\"strictMode\":true,\"showGoalVisualizationsInChat\":false}");
        assertThat(webWrite.statusCode()).withFailMessage(webWrite.body()).isEqualTo(200);
        Learner afterWebWrite =
                learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        assertThat(afterWebWrite.getStrictMode()).isTrue();
        assertThat(afterWebWrite.getShowGoalVisualizationsInChat()).isFalse();
        assertThat(afterWebWrite.getCoachStateRevision()).isEqualTo(baseRevision + 2L);
        HttpResponse<String> webRead = get(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID));
        assertThat(webRead.statusCode()).withFailMessage(webRead.body()).isEqualTo(200);
        assertThat(objectMapper.readTree(webRead.body())
                .path("showGoalVisualizationsInChat")
                .asBoolean()).isFalse();

        assertThatThrownBy(() -> sessionCoordinator.write(
                        firstSessionId,
                        "set_preferences_test",
                        baseRevision + 1L,
                        UUID.randomUUID().toString(),
                        Map.of("autoPilot", true),
                        this::successfulCoordinatorResult))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> assertThat(exception.code())
                                .isEqualTo(OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT));

        long idempotencyRecordsBeforeRollback = idempotencyRecordRepository.count();
        String failedRequestId = UUID.randomUUID().toString();
        assertThatThrownBy(() -> sessionCoordinator.write(
                        firstSessionId,
                        "set_preferences_test",
                        baseRevision + 2L,
                        failedRequestId,
                        Map.of("autoPilot", true),
                        metadata -> {
                            learnerService.setPreferences(
                                    PERMANENT_SKILLPILOT_ID,
                                    null,
                                    true,
                                    null);
                            return McpSchema.CallToolResult.builder()
                                    .isError(true)
                                    .addTextContent("not confirmed")
                                    .structuredContent(Map.of("status", "conflict"))
                                    .build();
                        }))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> assertThat(exception.code())
                                .isEqualTo(OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT));

        Learner afterRollback =
                learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        assertThat(afterRollback.getLearningStrategy()).isEqualTo("SEQUENTIAL");
        assertThat(afterRollback.getStrictMode()).isTrue();
        assertThat(afterRollback.getAutoPilot()).isFalse();
        assertThat(afterRollback.getCoachStateRevision()).isEqualTo(baseRevision + 2L);
        assertThat(idempotencyRecordRepository.count()).isEqualTo(idempotencyRecordsBeforeRollback);
    }

    @Test
    void providerEligibilityIsRequiredAtLaunchBeforePersistence() throws Exception {
        String path = "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID)
                + "/openai/v1/launch";

        HttpResponse<String> missing = postJson(path, "{\"communicationLocale\":\"de\"}", Map.of());
        HttpResponse<String> rejected = postJson(
                path,
                "{\"communicationLocale\":\"de\",\"providerEligibilityConfirmed\":false}",
                Map.of());
        HttpResponse<String> nullRequest = postJson(path, "", Map.of());

        assertThat(missing.statusCode()).withFailMessage(missing.body()).isEqualTo(403);
        assertThat(rejected.statusCode()).withFailMessage(rejected.body()).isEqualTo(403);
        assertThat(nullRequest.statusCode()).withFailMessage(nullRequest.body()).isEqualTo(403);
        assertThat(bindingGrantRepository.count()).isZero();
        assertThat(connectionRepository.count()).isZero();
        assertThat(pendingLaunchRepository.count()).isZero();
        assertThat(learningSessionRepository.count()).isZero();

        HttpResponse<String> accepted = postJson(
                path,
                "{\"communicationLocale\":\"de\",\"providerEligibilityConfirmed\":true}",
                Map.of());

        assertThat(accepted.statusCode()).withFailMessage(accepted.body()).isEqualTo(200);
        assertThat(learningSessionRepository.count()).isEqualTo(1);
        assertThat(bindingGrantRepository.count()).isZero();
        assertThat(connectionRepository.count()).isZero();
        assertThat(pendingLaunchRepository.count()).isZero();
    }

    @Test
    void firstPartyLaunchFailsClosedUntilTheWebGuiLevelTwoConfigurationIsComplete() throws Exception {
        String path = "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID)
                + "/openai/v1/launch";
        String launch = """
                {"communicationLocale":"de","providerEligibilityConfirmed":true}
                """;
        Learner learner = learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();

        learner.setSelectedCurriculum(null);
        learner.setPersonalCurriculum(null);
        learnerRepository.saveAndFlush(learner);
        HttpResponse<String> missingCurriculum = postJson(path, launch, Map.of());
        assertThat(missingCurriculum.statusCode())
                .withFailMessage(missingCurriculum.body())
                .isEqualTo(409);
        assertThat(learningSessionRepository.count()).isZero();

        learner.setSelectedCurriculum(CURRICULUM_ID);
        learner.setPersonalCurriculum(null);
        learnerRepository.saveAndFlush(learner);
        HttpResponse<String> selectionPlan = postJson(path, launch, Map.of());
        assertThat(selectionPlan.statusCode())
                .withFailMessage(selectionPlan.body())
                .isEqualTo(409);
        assertThat(learningSessionRepository.count()).isZero();

        learner.setPersonalCurriculum("{not-valid-json");
        learnerRepository.saveAndFlush(learner);
        HttpResponse<String> invalidPlan = postJson(path, launch, Map.of());
        assertThat(invalidPlan.statusCode())
                .withFailMessage(invalidPlan.body())
                .isEqualTo(409);
        assertThat(learningSessionRepository.count()).isZero();
    }

    @Test
    void everyLaunchCreatesAFreshIndependentTwentyFourHourLearningSession() throws Exception {
        String path = "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID)
                + "/openai/v1/launch";

        HttpResponse<String> first = postJson(
                path,
                "{\"communicationLocale\":\"de\",\"client\":\"first\",\"providerEligibilityConfirmed\":true}",
                Map.of());
        HttpResponse<String> second = postJson(
                path,
                "{\"communicationLocale\":\"de\",\"client\":\"second\",\"providerEligibilityConfirmed\":true}",
                Map.of());

        assertThat(first.statusCode()).withFailMessage(first.body()).isEqualTo(200);
        assertThat(second.statusCode()).withFailMessage(second.body()).isEqualTo(200);
        JsonNode firstBody = objectMapper.readTree(first.body());
        JsonNode secondBody = objectMapper.readTree(second.body());
        String firstSessionId = firstBody.path("learningSessionId").asText();
        String secondSessionId = secondBody.path("learningSessionId").asText();
        assertThat(firstSessionId).startsWith("sps_").hasSize(47);
        assertThat(secondSessionId)
                .startsWith("sps_")
                .hasSize(47)
                .isNotEqualTo(firstSessionId);
        assertThat(firstBody.path("prompt").asText()).contains(firstSessionId);
        assertThat(secondBody.path("prompt").asText()).contains(secondSessionId);
        assertThat(learningSessionRepository.findAll())
                .hasSize(2)
                .allSatisfy(session -> {
                    assertThat(session.getStartedAt()).isBeforeOrEqualTo(session.getExpiresAt());
                    assertThat(Duration.between(session.getStartedAt(), session.getExpiresAt()))
                            .isEqualTo(Duration.ofHours(24));
                });
        assertThat(bindingGrantRepository.count()).isZero();
        assertThat(connectionRepository.count()).isZero();
        assertThat(pendingLaunchRepository.count()).isZero();
    }

    @Test
    void removedMcpRoutesReturnNotFoundInTheFullProviderRuntime() throws Exception {
        for (String path : List.of(
                "/api/openai/v1/mcp",
                "/api/openai/v1/v1/mcp",
                OpenAiDeV1ContractMetadata.PUBLIC_MCP_PATH)) {
            HttpResponse<String> response = get(path);
            assertThat(response.statusCode()).as(path).isEqualTo(404);
        }
    }

    @Test
    void appOnlyOAuthAndExplicitLearningSessionPersistLearnerStateWithoutExposingPermanentId()
            throws Exception {
        assertLegacyStateIsEmpty();

        String externalState = "chatgpt-e2e-state";
        String authorizePath = OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "?" + form(List.of(
                Map.entry("response_type", "code"),
                Map.entry("client_id", CLIENT_ID),
                Map.entry("redirect_uri", CALLBACK),
                Map.entry("scope", String.join(" ", List.of(
                        OpenAiDeOAuthConfiguration.READ_SCOPE,
                        OpenAiDeOAuthConfiguration.WRITE_SCOPE,
                        OpenAiDeOAuthConfiguration.OFFLINE_SCOPE))),
                Map.entry("state", externalState),
                Map.entry("code_challenge", challenge(VERIFIER)),
                Map.entry("code_challenge_method", "S256"),
                Map.entry("resource", OpenAiDeV1ContractMetadata.OAUTH_RESOURCE)));

        HttpResponse<String> authorize = get(authorizePath);
        assertThat(authorize.statusCode()).isEqualTo(302);
        URI consentUri = URI.create(authorize.headers().firstValue(HttpHeaders.LOCATION).orElseThrow());
        String consentState = parseQuery(consentUri.getRawQuery()).get("state");
        assertThat(consentState).isNotBlank();
        assertLegacyStateIsEmpty();

        HttpResponse<String> consent = get(consentUri.toString());
        assertThat(consent.statusCode()).isEqualTo(200);
        assertThat(consent.body())
                .contains("Authorize SkillPilot Coach v1")
                .contains("OAuth authorizes only the app")
                .doesNotContain(PERMANENT_SKILLPILOT_ID);

        HttpResponse<String> approval = postForm(
                OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT,
                List.of(
                        Map.entry("client_id", CLIENT_ID),
                        Map.entry("state", consentState),
                        Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE),
                        Map.entry("scope", OpenAiDeOAuthConfiguration.WRITE_SCOPE),
                        Map.entry("scope", OpenAiDeOAuthConfiguration.OFFLINE_SCOPE)));
        assertThat(approval.statusCode()).withFailMessage(approval.body()).isEqualTo(302);
        URI callback = URI.create(approval.headers().firstValue(HttpHeaders.LOCATION).orElseThrow());
        Map<String, String> callbackQuery = parseQuery(callback.getRawQuery());
        assertThat(callbackQuery.get("state")).isEqualTo(externalState);

        HttpResponse<String> token = postOpenAiAuthenticatedForm(
                OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT,
                List.of(
                        Map.entry("grant_type", "authorization_code"),
                        Map.entry("client_id", CLIENT_ID),
                        Map.entry("redirect_uri", CALLBACK),
                        Map.entry("code", callbackQuery.get("code")),
                        Map.entry("code_verifier", VERIFIER),
                        Map.entry("resource", OpenAiDeV1ContractMetadata.OAUTH_RESOURCE)));
        assertThat(token.statusCode()).withFailMessage(token.body()).isEqualTo(200);
        assertThat(token.body()).doesNotContain(PERMANENT_SKILLPILOT_ID);
        String accessToken = objectMapper.readTree(token.body()).path("access_token").asText();
        String refreshToken = objectMapper.readTree(token.body()).path("refresh_token").asText();
        assertThat(accessToken).isNotBlank();
        assertThat(refreshToken).isNotBlank();

        OAuth2Authorization authorization = authorizationService.findByToken(
                accessToken,
                OAuth2TokenType.ACCESS_TOKEN);
        assertThat(authorization).isNotNull();
        String applicationSubject = authorization.getPrincipalName();
        assertThat(applicationSubject)
                .startsWith("spoa_")
                .doesNotContain(PERMANENT_SKILLPILOT_ID)
                .isNotEqualTo(PERMANENT_SKILLPILOT_ID);
        assertThat(authorization.getPrincipalName())
                .isEqualTo(applicationSubject);
        assertLegacyStateIsEmpty();

        HttpResponse<String> modernDiscovery = postModernMcp(accessToken, """
                {"jsonrpc":"2.0","id":"discover-1","method":"server/discover","params":{
                  "_meta":{
                    "io.modelcontextprotocol/protocolVersion":"2026-07-28",
                    "io.modelcontextprotocol/clientInfo":{"name":"chatgpt-e2e","version":"1.0"},
                    "io.modelcontextprotocol/clientCapabilities":{}}}}
                """);
        assertThat(modernDiscovery.statusCode()).withFailMessage(modernDiscovery.body()).isEqualTo(400);
        assertThat(modernDiscovery.body()).isEmpty();

        HttpResponse<String> tools = postMcp(accessToken, """
                {"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
                """);
        assertMcpPayloadDoesNotExposeIdentity(tools, applicationSubject);
        assertThat(toolNames(tools))
                .hasSize(12)
                .contains(
                        OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                        OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                        OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE)
                .doesNotContain(
                        "open_skillpilot_start",
                        "issue_skillpilot_start_capability",
                        "set_skillpilot_curriculum",
                        "set_skillpilot_personalization");
        JsonNode bootstrapTool = toolDescriptor(tools, OpenAiDeV1McpContractAdapter.GET_CONTEXT);
        assertThat(bootstrapTool.path("title").asText())
                .isEqualTo("Start or continue the SkillPilot learning coach");
        assertThat(bootstrapTool.path("description").asText())
                .contains("Required to start or refresh a SkillPilot coaching turn")
                .contains("unless this turn already has a successful state-changing result")
                .contains("one-hour remaining-lifetime guard")
                .contains("Do not call it redundantly after such a fresh mutation successor")
                .contains("generic advice", "self-created curriculum", "invented goals")
                .contains("general subject questions unrelated to SkillPilot");
        JsonNode bootstrapInputSchema = bootstrapTool.path("inputSchema");
        assertThat(bootstrapInputSchema
                        .path("properties")
                        .path(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID)
                        .path("type")
                        .asText())
                .isEqualTo("string");
        assertThat(bootstrapInputSchema.path("required").valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .contains(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID);
        assertThat(bootstrapTool.path("annotations").path("readOnlyHint").asBoolean()).isTrue();

        JsonNode visualizationTool =
                toolDescriptor(tools, OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
        assertThat(visualizationTool.path("_meta").path("ui").path("resourceUri").asText())
                .isEqualTo(OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI);
        assertThat(visualizationTool.path("_meta").path("openai/outputTemplate").asText())
                .isEqualTo(OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI);

        JsonNode memoryPracticeTool =
                toolDescriptor(tools, OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE);
        assertThat(memoryPracticeTool.path("_meta").path("ui").path("resourceUri").asText())
                .isEqualTo(OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI);
        assertThat(memoryPracticeTool.path("_meta").path("openai/outputTemplate").asText())
                .isEqualTo(OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI);
        assertThat(memoryPracticeTool.path("description").asText())
                .contains("immediate next action")
                .contains("Do not infer that the component is unavailable")
                .contains("do not substitute a Cockpit link before attempting this call");

        HttpResponse<String> resources = postMcp(accessToken, """
                {"jsonrpc":"2.0","id":"resources-1","method":"resources/list","params":{}}
                """);
        assertMcpPayloadDoesNotExposeIdentity(resources, applicationSubject);
        List<String> expectedResourceUris = Stream.of(
                        Stream.of(
                                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                                OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI,
                                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_RESOURCE_URI),
                        OpenAiDeV1ContractMetadata.RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S
                                .stream()
                                .map(OpenAiDeV1ContractMetadata::goalVisualizationResourceUri))
                .flatMap(stream -> stream)
                .toList();
        assertThat(result(resources).path("resources").valueStream()
                        .map(resource -> resource.path("uri").asText())
                        .toList())
                .containsExactlyInAnyOrderElementsOf(expectedResourceUris);

        assertResourceReadableOverAuthenticatedMcp(
                accessToken,
                applicationSubject,
                "resource-active",
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_ARTIFACT_SHA256);
        assertResourceReadableOverModernCompatibilityMcp(
                accessToken,
                applicationSubject,
                "resource-active-modern-first",
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_ARTIFACT_SHA256);
        assertResourceReadableOverModernCompatibilityMcp(
                accessToken,
                applicationSubject,
                "resource-active-modern-repeated",
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_ARTIFACT_SHA256);
        assertResourceReadableOverAuthenticatedMcp(
                accessToken,
                applicationSubject,
                "resource-legacy-versioned",
                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_RESOURCE_URI,
                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256);
        int retainedResourceIndex = 0;
        for (String retainedSha256 :
                OpenAiDeV1ContractMetadata.RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S) {
            assertResourceReadableOverAuthenticatedMcp(
                    accessToken,
                    applicationSubject,
                    "resource-retained-" + retainedResourceIndex++,
                    OpenAiDeV1ContractMetadata.goalVisualizationResourceUri(retainedSha256),
                    retainedSha256);
        }
        assertResourceReadableOverAuthenticatedMcp(
                accessToken,
                applicationSubject,
                "resource-memory-practice",
                OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI,
                OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_ARTIFACT_SHA256);

        Learner configuredLearner = learnerRepository
                .findById(PERMANENT_SKILLPILOT_ID)
                .orElseThrow();
        assertThat(configuredLearner.getSelectedCurriculum()).isEqualTo(CURRICULUM_ID);
        JsonNode completedCurriculum =
                objectMapper.readTree(configuredLearner.getPersonalCurriculum());
        assertThat(completedCurriculum.path(CURRICULUM_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(completedCurriculum.path(CURRICULUM_ID).path("durationModel").asText())
                .isEqualTo("G9");
        assertThat(completedCurriculum.path(CURRICULUM_ID).path("stage").asText())
                .isEqualTo("SekII");
        assertThat(completedCurriculum.path(MATHEMATICS_CURRICULUM_ID).path("filterId").asText())
                .isEqualTo("LK");

        HttpResponse<String> initialLaunch = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/v1/launch",
                """
                {"communicationLocale":"de","client":"openai-v1-e2e",
                 "providerEligibilityConfirmed":true}
                """,
                Map.of());
        assertThat(initialLaunch.statusCode())
                .withFailMessage(initialLaunch.body())
                .isEqualTo(200);
        assertThat(initialLaunch.body()).doesNotContain(PERMANENT_SKILLPILOT_ID, applicationSubject);
        JsonNode initialLaunchBody = objectMapper.readTree(initialLaunch.body());
        String initialLearningSessionId = initialLaunchBody.path("learningSessionId").asText();
        assertThat(initialLearningSessionId).startsWith("sps_").hasSize(47);
        assertThat(initialLaunchBody.path("prompt").asText()).contains(initialLearningSessionId);
        assertThat(learningSessionRepository.findAll())
                .singleElement()
                .satisfies(session -> {
                    assertThat(session.getStartedAt()).isBeforeOrEqualTo(session.getExpiresAt());
                    assertThat(Duration.between(session.getStartedAt(), session.getExpiresAt()))
                            .isEqualTo(Duration.ofHours(24));
                    assertThat(session.getContractMajor()).isEqualTo(1);
                    assertThat(session.getStateSchemaVersion()).isEqualTo(1);
                    assertThat(session.getWorkflowVersion()).isEqualTo("coach@1.0");
                    assertThat(session.getCurriculumRevision()).isNotBlank();
                });
        assertLegacyStateIsEmpty();

        HttpResponse<String> initialRead = callTool(
                accessToken,
                2,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                "{}",
                initialLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(initialRead, applicationSubject);
        JsonNode initialResult = result(initialRead);
        assertThat(initialResult.path("isError").asBoolean()).isFalse();
        JsonNode initialContext = initialResult.path("structuredContent");
        assertThat(initialContext.path("curriculum").path("curriculumId").asText())
                .isEqualTo(CURRICULUM_ID);
        assertThat(initialContext.path("requiredAction").asText())
                .isNotIn("setCurriculum", "setPersonalization");
        assertThat(initialContext.path("curriculumCatalog").isMissingNode()).isTrue();
        assertThat(initialContext.path("personalizationHistory").isMissingNode()).isTrue();
        assertThat(initialContext.path("decision").isMissingNode()).isTrue();
        assertThat(initialContext.path("contractMajor").asInt()).isEqualTo(1);
        assertThat(initialContext.path("stateSchemaVersion").asInt()).isEqualTo(1);
        assertThat(initialContext.path("workflowVersion").asText()).isEqualTo("coach@1.0");
        assertThat(initialContext.path("curriculumRevision").asText()).isNotBlank();
        assertThat(initialContext.path("extensions").isObject()).isTrue();

        var initialSession = learningSessionRepository.findAll().getFirst();
        Instant originalExpiresAt = initialSession.getExpiresAt();
        initialSession.setExpiresAt(Instant.now().plus(Duration.ofMinutes(59)));
        learningSessionRepository.saveAndFlush(initialSession);
        HttpResponse<String> expiringSession = callTool(
                accessToken,
                19,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                "{}",
                initialLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(expiringSession, applicationSubject);
        JsonNode expiringSessionResult = objectMapper.readTree(expiringSession.body()).path("result");
        assertThat(expiringSessionResult.path("isError").asBoolean()).isTrue();
        JsonNode renewal = expiringSessionResult.path("structuredContent");
        assertThat(renewal.path("code").asText()).isEqualTo("SESSION_RENEWAL_REQUIRED");
        assertThat(renewal.path("minimumRemainingSeconds").asLong())
                .isEqualTo(OpenAiDeV1ContractMetadata.MINIMUM_ACTION_SESSION_REMAINING.toSeconds());
        assertThat(renewal.path("oauthConnectionValid").asBoolean()).isTrue();
        assertThat(renewal.path("startUrl").asText()).isEqualTo("https://skillpilot.test");
        assertThat(renewal.path("instruction").asText())
                .contains("SkillPilot", "Lernen starten", "neuen Chat");
        assertThat(renewal.has("recoveryTool")).isFalse();
        assertThat(renewal.has("recoveryPurpose")).isFalse();
        assertLegacyStateIsEmpty();

        initialSession.setExpiresAt(originalExpiresAt);
        learningSessionRepository.saveAndFlush(initialSession);
        learningSessionRepository.deleteById(initialSession.getTokenHash());
        learningSessionRepository.flush();
        HttpResponse<String> missingSession = callTool(
                accessToken,
                20,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                "{}",
                initialLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(missingSession, applicationSubject);
        JsonNode missingSessionResult = objectMapper.readTree(missingSession.body()).path("result");
        assertThat(missingSessionResult.path("isError").asBoolean()).isTrue();
        JsonNode missingSessionError = missingSessionResult.path("structuredContent");
        assertThat(missingSessionError.path("code").asText()).isEqualTo("SESSION_REQUIRED");
        assertThat(missingSessionError.path("startUrl").asText()).isEqualTo("https://skillpilot.test");
        assertThat(missingSessionError.path("instructions").path("de").asText())
                .contains("Lernen starten", "neuen Chat");
        assertThat(missingSessionError.path("instructions").path("en").asText())
                .contains("Start learning", "new chat");
        assertThat(missingSessionError.has("recoveryTool")).isFalse();
        assertLegacyStateIsEmpty();

        HttpResponse<String> restarted = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/v1/launch",
                """
                {"communicationLocale":"de","client":"openai-v1-e2e-restart",
                 "providerEligibilityConfirmed":true}
                """,
                Map.of());
        assertThat(restarted.statusCode()).withFailMessage(restarted.body()).isEqualTo(200);
        assertThat(restarted.body()).doesNotContain(PERMANENT_SKILLPILOT_ID, applicationSubject);
        JsonNode restartedBody = objectMapper.readTree(restarted.body());
        String resumedLearningSessionId = restartedBody.path("learningSessionId").asText();
        assertThat(resumedLearningSessionId)
                .startsWith("sps_")
                .hasSize(47)
                .isNotEqualTo(initialLearningSessionId);
        assertThat(restartedBody.path("prompt").asText()).contains(resumedLearningSessionId);
        assertThat(learningSessionRepository.findAll()).singleElement();
        assertLegacyStateIsEmpty();

        HttpResponse<String> resumed = callTool(
                accessToken,
                21,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                "{}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(resumed, applicationSubject);
        JsonNode resumedContext = result(resumed).path("structuredContent");
        assertThat(resumedContext.path("curriculum").path("curriculumId").asText())
                .isEqualTo(CURRICULUM_ID);
        assertThat(resumedContext.path("requiredAction").asText())
                .isNotIn("setCurriculum", "setPersonalization");
        assertThat(resumedContext.path("curriculumCatalog").isMissingNode()).isTrue();
        assertThat(resumedContext.path("personalizationHistory").isMissingNode()).isTrue();

        HttpResponse<String> webPersonalizationRead = get(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/personalization-plan");
        assertThat(webPersonalizationRead.statusCode())
                .withFailMessage(webPersonalizationRead.body())
                .isEqualTo(200);
        assertThat(objectMapper.readTree(webPersonalizationRead.body()).path("stage").asText())
                .isEqualTo("COMPLETE");


        HttpResponse<String> scopeNavigation = callTool(
                accessToken,
                10,
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                "{\"target\":\"scope\"}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(scopeNavigation, applicationSubject);
        JsonNode scopeNavigationContext = result(scopeNavigation).path("structuredContent");
        assertThat(scopeNavigationContext.path("target").asText()).isEqualTo("scope");
        assertThat(scopeNavigationContext.path("requiredAction").asText()).isEqualTo("setScope");
        JsonNode publishedNavigationOption = scopeNavigationContext.path("options").valueStream()
                .filter(option -> optionGoalIds(option).equals(List.of(HESSEN_SEKII_MATH_LK_SCOPE_ID)))
                .findFirst()
                .orElseThrow();
        List<String> publishedScopeGoalIds = optionGoalIds(publishedNavigationOption);

        HttpResponse<String> scopeWrite = callTool(
                accessToken,
                11,
                OpenAiDeV1McpContractAdapter.SET_SCOPE,
                scopeArguments(publishedScopeGoalIds),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(scopeWrite, applicationSubject);
        JsonNode scopeContext = result(scopeWrite).path("structuredContent");
        assertThat(scopeContext.path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(scopeContext.path("options")).isNotEmpty();
        assertThat(scopeContext.path("curriculum").path("curriculumId").asText())
                .isEqualTo(CURRICULUM_ID);
        assertThat(persistedScopeGoalIds()).containsExactlyElementsOf(publishedScopeGoalIds);

        Learner persistedAfterScope =
                learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        assertThat(persistedAfterScope.getActiveGoalId()).isNull();
        assertThat(objectMapper.readTree(persistedAfterScope.getPersonalCurriculum()))
                .isEqualTo(completedCurriculum);

        HttpResponse<String> idempotentScopeWrite = callTool(
                accessToken,
                12,
                OpenAiDeV1McpContractAdapter.SET_SCOPE,
                scopeArguments(optionGoalIds(publishedNavigationOption)),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(idempotentScopeWrite, applicationSubject);
        assertThat(result(idempotentScopeWrite)
                        .path("structuredContent")
                        .path("requiredAction")
                        .asText())
                .isEqualTo("setActiveGoal");
        assertThat(persistedScopeGoalIds()).containsExactlyElementsOf(publishedScopeGoalIds);
        assertThat(objectMapper.readTree(
                        learnerRepository.findById(PERMANENT_SKILLPILOT_ID)
                                .orElseThrow()
                                .getPersonalCurriculum()))
                .isEqualTo(completedCurriculum);

        HttpResponse<String> persistedRead = callTool(
                accessToken,
                13,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                "{}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(persistedRead, applicationSubject);
        JsonNode persistedContext = result(persistedRead).path("structuredContent");
        assertThat(persistedContext
                        .path("curriculum")
                        .path("curriculumId")
                        .asText())
                .isEqualTo(CURRICULUM_ID);

        String orientationGoalId = optionIdByLabel(
                persistedContext,
                "Warum Mathematik? – Denken, Muster & Zukunft");
        HttpResponse<String> activateOrientation = callTool(
                accessToken,
                14,
                OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL,
                objectMapper.writeValueAsString(Map.of(
                        "goalId", orientationGoalId,
                        "redirect", false)),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(activateOrientation, applicationSubject);
        JsonNode orientationContext = result(activateOrientation).path("structuredContent");
        assertThat(orientationContext.path("interactionMode").asText()).isEqualTo("orientation");
        assertThat(orientationContext.path("orientationOutlook").path("paths")).hasSize(3);
        long orientationStateVersion = orientationContext.path("stateVersion").asLong();
        assertThat(orientationContext.path("goalVisualization").path("goalId").asText())
                .isEqualTo(orientationGoalId);
        assertThat(orientationContext.path("goalVisualization").path("imageUrl").asText())
                .contains("/assets/goal-visualizations/mathematik/" + orientationGoalId + "/");
        assertThat(orientationContext.path("presentationAction").isMissingNode()).isTrue();
        assertThat(orientationContext.path("nextAllowedTools").valueStream().map(JsonNode::asText).toList())
                .contains(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);

        HttpResponse<String> renderOrientation = callTool(
                accessToken,
                140,
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                objectMapper.writeValueAsString(Map.of(
                        "goalId", orientationGoalId,
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                        orientationStateVersion)),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(renderOrientation, applicationSubject);
        JsonNode renderOrientationResult = result(renderOrientation);
        assertThat(renderOrientationResult.path("isError").asBoolean()).isFalse();
        assertThat(renderOrientationResult
                        .path("structuredContent")
                        .path("goalVisualization")
                        .path("goalId")
                        .asText())
                .isEqualTo(orientationGoalId);
        assertThat(renderOrientationResult.path("structuredContent").path("stateVersion").asLong())
                .isEqualTo(orientationStateVersion);

        OrientationOutlook authoritativeOutlook = learnerService.getCoachOrientationOutlook(
                PERMANENT_SKILLPILOT_ID,
                "de");
        assertThat(authoritativeOutlook).isNotNull();
        OrientationOutlook.Path selectedOrientationPath = authoritativeOutlook.paths().stream()
                .filter(path -> "space-and-linear-algebra".equals(path.pathId()))
                .findFirst()
                .orElseThrow();
        Set<String> selectedPathGoalIds = Set.copyOf(selectedOrientationPath.relatedGoalIds());
        assertThat(selectedPathGoalIds).isNotEmpty();

        // The path is a valid, reviewed orientation choice even though none of its
        // entry goals is available after the anchor alone. Completion must still
        // succeed, leave active-goal choice open, and expose the ordinary frontier.
        HttpResponse<String> completeOrientation = callTool(
                accessToken,
                15,
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                objectMapper.writeValueAsString(Map.of(
                        "goalId", orientationGoalId,
                        OpenAiDeV1McpContractAdapter.WORK_FEEDBACK,
                        "Du hast den gewählten Interessenpfad auf deine Lernziele bezogen.",
                        OpenAiDeV1McpContractAdapter.OUTCOME_FEEDBACK,
                        "Die Orientierung ist damit abgeschlossen.",
                        OpenAiDeV1McpContractAdapter.ORIENTATION_PATH_ID,
                        selectedOrientationPath.pathId())),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(completeOrientation, applicationSubject);
        JsonNode completionResult = result(completeOrientation).path("structuredContent");
        assertThat(completionResult.path("status").asText()).isEqualTo("updated");
        assertThat(completionResult.path("stateVersion").asLong())
                .isEqualTo(orientationStateVersion + 1L);
        JsonNode successorContext = completionResult.path("context");
        assertThat(successorContext.path("activeGoal").isMissingNode()
                        || successorContext.path("activeGoal").isNull())
                .isTrue();
        Set<String> successorFrontierIds = successorContext.path("frontier").valueStream()
                .map(goal -> goal.path("goalId").asText())
                .filter(goalId -> !goalId.isBlank())
                .collect(Collectors.toSet());
        assertThat(successorFrontierIds)
                .isNotEmpty()
                .doesNotContainAnyElementsOf(selectedPathGoalIds);
        assertThat(successorContext.path("orientationOutlook").isMissingNode()).isTrue();
        Learner afterOrientation = learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        assertThat(afterOrientation.getActiveGoalId()).isNull();
        assertThat(afterOrientation.getCoachStateRevision()).isEqualTo(orientationStateVersion + 1L);

        // A normal mastery write with sequential autopilot must return the successor
        // already selected by SkillPilot Core. The compact coach context must not
        // expose the remaining frontier as a competing learner choice.
        HttpResponse<String> autopilotPreferences = putJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/preferences",
                "{\"learningStrategy\":\"SEQUENTIAL\",\"autoPilot\":true}");
        assertThat(autopilotPreferences.statusCode())
                .withFailMessage(autopilotPreferences.body())
                .isEqualTo(200);

        HttpResponse<String> refreshedSelection = callTool(
                accessToken,
                16,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                "{}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(refreshedSelection, applicationSubject);
        JsonNode selectionContext = result(refreshedSelection).path("structuredContent");
        assertThat(selectionContext.path("requiredAction").asText()).isEqualTo("setActiveGoal");
        JsonNode ordinaryGoal = selectionContext.path("frontier").valueStream()
                .filter(goal -> "atomic".equals(goal.path("type").asText()))
                .filter(goal -> !"orientation".equals(goal.path("semanticKind").asText()))
                .filter(goal -> !"memory".equals(goal.path("nodeKind").asText()))
                .filter(goal -> !"exam".equals(goal.path("nodeKind").asText()))
                .findFirst()
                .orElseThrow();
        String completedOrdinaryGoalId = ordinaryGoal.path("goalId").asText();
        assertThat(selectionContext.path("options").valueStream()
                        .map(option -> option.path("id").asText())
                        .toList())
                .contains(completedOrdinaryGoalId);

        HttpResponse<String> activateOrdinaryGoal = callTool(
                accessToken,
                17,
                OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL,
                objectMapper.writeValueAsString(Map.of(
                        "goalId", completedOrdinaryGoalId,
                        "redirect", false)),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(activateOrdinaryGoal, applicationSubject);
        JsonNode activeOrdinaryContext = result(activateOrdinaryGoal).path("structuredContent");
        assertThat(activeOrdinaryContext.path("requiredAction").asText()).isEqualTo("teachActiveGoal");
        assertThat(activeOrdinaryContext.path("interactionMode").asText()).isEqualTo("chat");
        assertThat(activeOrdinaryContext.path("activeGoal").path("goalId").asText())
                .isEqualTo(completedOrdinaryGoalId);

        String workFeedback = "Dein Lösungsweg ist fachlich schlüssig und die Begründung trägt das Ergebnis.";
        String outcomeFeedback = "Das Lernziel ist vollständig erreicht.";

        HttpResponse<String> completeOrdinaryGoal = callTool(
                accessToken,
                18,
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                objectMapper.writeValueAsString(Map.of(
                        "goalId", completedOrdinaryGoalId,
                        OpenAiDeV1McpContractAdapter.WORK_FEEDBACK, workFeedback,
                        OpenAiDeV1McpContractAdapter.OUTCOME_FEEDBACK, outcomeFeedback)),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(completeOrdinaryGoal, applicationSubject);
        JsonNode masteryResult = result(completeOrdinaryGoal).path("structuredContent");
        assertThat(masteryResult.path("status").asText()).isEqualTo("updated");
        JsonNode completionHandoff = masteryResult.path("completionHandoff");
        assertThat(completionHandoff.path("completedGoalId").asText())
                .isEqualTo(completedOrdinaryGoalId);
        assertThat(completionHandoff.path("workFeedback").asText()).isEqualTo(workFeedback);
        assertThat(completionHandoff.path("outcomeFeedback").asText()).isEqualTo(outcomeFeedback);
        assertThat(completionHandoff.path("successorEvidenceReset").asBoolean()).isTrue();
        String completionText = result(completeOrdinaryGoal).path("content").toString();
        assertThat(completionText.indexOf(workFeedback)).isGreaterThanOrEqualTo(0);
        assertThat(completionText.indexOf(outcomeFeedback)).isGreaterThan(completionText.indexOf(workFeedback));
        JsonNode autopilotSuccessorContext = masteryResult.path("context");
        String successorGoalId = autopilotSuccessorContext.path("activeGoal").path("goalId").asText();
        long successorStateVersion = masteryResult.path("stateVersion").asLong();
        assertThat(successorGoalId).isNotBlank().isNotEqualTo(completedOrdinaryGoalId);
        assertThat(successorStateVersion).isPositive();
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow().getActiveGoalId())
                .isEqualTo(successorGoalId);
        assertThat(autopilotSuccessorContext.path("requiredAction").asText())
                .isEqualTo("teachActiveGoal");
        assertThat(autopilotSuccessorContext.path("interactionMode").asText()).isEqualTo("chat");
        assertThat(autopilotSuccessorContext.path("options")).isEmpty();
        assertThat(autopilotSuccessorContext.path("frontier")).isEmpty();
        assertThat(autopilotSuccessorContext.path("goalVisualization").path("goalId").asText())
                .isEqualTo(successorGoalId);
        assertThat(autopilotSuccessorContext
                        .path("goalVisualization")
                        .path("imageUrl")
                        .asText())
                .isNotBlank();
        assertThat(autopilotSuccessorContext.path("nextAllowedTools").valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .contains(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION)
                .doesNotContain(
                        OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                        OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL,
                        OpenAiDeV1McpContractAdapter.SET_MASTERY);
        assertThat(completionText.indexOf(autopilotSuccessorContext
                        .path("activeGoal")
                        .path("title")
                        .asText()))
                .isGreaterThan(completionText.indexOf(outcomeFeedback));

        // Regression for the second image in one chat: the mastery successor is
        // already the fresh authority. Render it immediately with the successor's
        // unchanged goal and state version, without reloading get_skillpilot_context.
        HttpResponse<String> renderAutopilotSuccessor = callTool(
                accessToken,
                180,
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                objectMapper.writeValueAsString(Map.of(
                        "goalId", successorGoalId,
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                        successorStateVersion)),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(renderAutopilotSuccessor, applicationSubject);
        JsonNode renderedSuccessor = result(renderAutopilotSuccessor).path("structuredContent");
        assertThat(renderedSuccessor.path("stateVersion").asLong())
                .isEqualTo(successorStateVersion);
        assertThat(renderedSuccessor.path("goalVisualization").path("goalId").asText())
                .isEqualTo(successorGoalId);

        HttpResponse<String> persistedSuccessorRead = callTool(
                accessToken,
                19,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                "{}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(persistedSuccessorRead, applicationSubject);
        JsonNode persistedSuccessorContext = result(persistedSuccessorRead).path("structuredContent");
        assertThat(persistedSuccessorContext.path("activeGoal").path("goalId").asText())
                .isEqualTo(successorGoalId);
        assertThat(persistedSuccessorContext.path("requiredAction").asText())
                .isEqualTo("teachActiveGoal");
        assertThat(persistedSuccessorContext.path("interactionMode").asText()).isEqualTo("chat");
        assertThat(persistedSuccessorContext.path("options")).isEmpty();
        assertThat(persistedSuccessorContext.path("frontier")).isEmpty();
        assertThat(persistedSuccessorContext.path("nextAllowedTools").valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .doesNotContain(
                        OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                        OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL);

        HttpResponse<String> accidentalGoalNavigation = callTool(
                accessToken,
                20,
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                objectMapper.writeValueAsString(Map.of("target", "goal")),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(accidentalGoalNavigation, applicationSubject);
        JsonNode guardedGoalNavigation = result(accidentalGoalNavigation).path("structuredContent");
        assertThat(guardedGoalNavigation.path("requiredAction").asText()).isEqualTo("teachActiveGoal");
        assertThat(guardedGoalNavigation.path("options")).isEmpty();
        assertThat(guardedGoalNavigation.path("instruction").asText())
                .contains("keine Lernzielauswahl", "früheren Zieloptionen");

        HttpResponse<String> explicitGoalNavigation = callTool(
                accessToken,
                21,
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                objectMapper.writeValueAsString(Map.of("target", "goal", "redirect", true)),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(explicitGoalNavigation, applicationSubject);
        JsonNode redirectOptions = result(explicitGoalNavigation)
                .path("structuredContent")
                .path("options");
        assertThat(redirectOptions).isNotEmpty();
        assertThat(redirectOptions.valueStream()
                        .map(option -> option.path("id").asText())
                        .toList())
                .doesNotContain(successorGoalId);
        String redirectedGoalId = redirectOptions.get(0).path("id").asText();
        assertThat(redirectedGoalId).isNotBlank().isNotEqualTo(successorGoalId);

        HttpResponse<String> redirectGoal = callTool(
                accessToken,
                22,
                OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL,
                objectMapper.writeValueAsString(Map.of(
                        "goalId", redirectedGoalId,
                        "redirect", true)),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(redirectGoal, applicationSubject);
        assertThat(result(redirectGoal)
                        .path("structuredContent")
                        .path("activeGoal")
                        .path("goalId")
                        .asText())
                .isEqualTo(redirectedGoalId);
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow().getActiveGoalId())
                .isEqualTo(redirectedGoalId);

        assertLegacyStateIsEmpty();
        assertThat(learningSessionRepository.count()).isEqualTo(1);

        HttpResponse<String> revocation = postOpenAiAuthenticatedForm(
                OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT,
                List.of(
                        Map.entry("client_id", CLIENT_ID),
                        Map.entry("token", refreshToken),
                        Map.entry("token_type_hint", "refresh_token")));
        assertThat(revocation.statusCode()).withFailMessage(revocation.body()).isEqualTo(200);
        OAuth2Authorization revokedAuthorization =
                authorizationService.findByToken(refreshToken, OAuth2TokenType.REFRESH_TOKEN);
        assertThat(revokedAuthorization).isNotNull();
        assertThat(revokedAuthorization.getRefreshToken().isInvalidated()).isTrue();
        assertThat(learningSessionRepository.count())
                .as("OAuth revocation does not revoke the independent learning session")
                .isEqualTo(1);
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID))
                .get()
                .extracting(Learner::getSelectedCurriculum)
                .isEqualTo(CURRICULUM_ID);
        assertLegacyStateIsEmpty();
    }

    private HttpResponse<String> get(String path) throws Exception {
        return browser.send(
                HttpRequest.newBuilder(localUri(path)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postJson(String path, String body, Map<String, String> headers) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(localUri(path))
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        headers.forEach(request::header);
        return browser.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> putJson(String path, String body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(localUri(path))
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(body))
                .build();
        return browser.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postForm(String path, List<Map.Entry<String, String>> parameters)
            throws Exception {
        HttpRequest request = HttpRequest.newBuilder(localUri(path))
                .header(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form(parameters)))
                .build();
        return browser.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postOpenAiAuthenticatedForm(
            String path,
            List<Map.Entry<String, String>> parameters) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(localUri(path))
                .header(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded")
                .header(
                        HttpHeaders.AUTHORIZATION,
                        OpenAiDeSecureOAuthTestServer.confidentialBasicAuthorization())
                .POST(HttpRequest.BodyPublishers.ofString(form(parameters)))
                .build();
        return browser.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postMcp(String accessToken, String body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(
                localUri(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH))
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .header(HttpHeaders.ACCEPT, "application/json, text/event-stream")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header("MCP-Protocol-Version", "2025-11-25");
        return browser.send(
                request
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postModernMcp(String accessToken, String body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(
                localUri(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH))
                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                        .header(HttpHeaders.ACCEPT, "application/json, text/event-stream")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .header("MCP-Protocol-Version", "2026-07-28")
                        .header("Mcp-Method", "server/discover");
        return browser.send(
                request.POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postModernMcp(
            String accessToken,
            String method,
            String name,
            String body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(
                localUri(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH))
                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                        .header(HttpHeaders.ACCEPT, "application/json, text/event-stream")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .header("MCP-Protocol-Version", "2026-07-28")
                        .header("Mcp-Method", method);
        if (name != null) {
            request.header("Mcp-Name", name);
        }
        return browser.send(
                request.POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private void assertResourceReadableOverAuthenticatedMcp(
            String accessToken,
            String applicationSubject,
            String requestId,
            String resourceUri,
            String expectedSha256)
            throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "jsonrpc", "2.0",
                "id", requestId,
                "method", "resources/read",
                "params", Map.of("uri", resourceUri)));
        HttpResponse<String> response = postMcp(accessToken, body);
        assertResourceResponse(
                response,
                applicationSubject,
                resourceUri,
                expectedSha256);
    }

    private void assertResourceReadableOverModernCompatibilityMcp(
            String accessToken,
            String applicationSubject,
            String requestId,
            String resourceUri,
            String expectedSha256)
            throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "jsonrpc", "2.0",
                "id", requestId,
                "method", "resources/read",
                "params", Map.of(
                        "uri", resourceUri,
                        "_meta", Map.of(
                                "io.modelcontextprotocol/protocolVersion", "2026-07-28",
                                "io.modelcontextprotocol/clientInfo", Map.of(
                                        "name", "chatgpt-e2e",
                                        "version", "1.0"),
                                "io.modelcontextprotocol/clientCapabilities", Map.of()))));
        HttpResponse<String> response = postModernMcp(
                accessToken,
                "resources/read",
                resourceUri,
                body);
        assertResourceResponse(
                response,
                applicationSubject,
                resourceUri,
                expectedSha256);
        assertThat(result(response).has("resultType")).isFalse();
        assertThat(result(response).has("ttlMs")).isFalse();
        assertThat(result(response).has("cacheScope")).isFalse();
    }

    private void assertResourceResponse(
            HttpResponse<String> response,
            String applicationSubject,
            String resourceUri,
            String expectedSha256)
            throws Exception {
        assertMcpPayloadDoesNotExposeIdentity(response, applicationSubject);
        JsonNode contents = result(response).path("contents");
        assertThat(contents).singleElement().satisfies(resource -> {
            assertThat(resource.path("uri").asText()).isEqualTo(resourceUri);
            assertThat(resource.path("mimeType").asText())
                    .isEqualTo(OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE);
            assertThat(resource.path("_meta").path("ui").path("domain").asText())
                    .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
            assertThat(sha256Hex(resource.path("text").asText())).isEqualTo(expectedSha256);
        });
    }

    private HttpResponse<String> callTool(
            String accessToken,
            int id,
            String toolName,
            String arguments,
            String learningSessionId)
            throws Exception {
        JsonNode parsed = objectMapper.readTree(arguments);
        if (!(parsed instanceof ObjectNode objectArguments)) {
            throw new IllegalArgumentException("MCP tool arguments must be a JSON object.");
        }
        objectArguments.put(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, learningSessionId);
        if (MUTATING_TOOLS.contains(toolName)) {
            objectArguments.put(
                    OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                    observedSessionVersions.getOrDefault(learningSessionId, 0L));
            objectArguments.put(
                    OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID,
                    UUID.randomUUID().toString());
        }
        HttpResponse<String> response = postMcp(accessToken, """
                {"jsonrpc":"2.0","id":%d,"method":"tools/call","params":{"name":"%s","arguments":%s}}
                """.formatted(
                        id,
                        toolName,
                        objectMapper.writeValueAsString(objectArguments)));
        JsonNode structuredContent = objectMapper.readTree(response.body())
                .path("result")
                .path("structuredContent");
        if (structuredContent.path("stateVersion").canConvertToLong()) {
            observedSessionVersions.put(
                    learningSessionId,
                    structuredContent.path("stateVersion").asLong());
        }
        return response;
    }

    private void assertLegacyStateIsEmpty() {
        assertThat(bindingGrantRepository.count()).isZero();
        assertThat(connectionRepository.count()).isZero();
        assertThat(pendingLaunchRepository.count()).isZero();
    }

    private void assertMcpPayloadDoesNotExposeIdentity(
            HttpResponse<String> response,
            String connectionSubject) {
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
        assertThat(response.body()).doesNotContain(PERMANENT_SKILLPILOT_ID, connectionSubject);
    }

    private JsonNode result(HttpResponse<String> response) throws Exception {
        JsonNode root = objectMapper.readTree(response.body());
        assertThat(root.path("error").isMissingNode()).withFailMessage(response.body()).isTrue();
        assertThat(root.path("result").path("isError").asBoolean()).withFailMessage(response.body()).isFalse();
        return root.path("result");
    }

    private McpSchema.CallToolResult successfulCoordinatorResult(
            OpenAiDeV1SessionMetadata metadata) {
        return McpSchema.CallToolResult.builder()
                .isError(false)
                .addTextContent("saved")
                .structuredContent(Map.of(
                        "contractMajor", metadata.contractMajor(),
                        "stateVersion", metadata.stateVersion(),
                        "stateSchemaVersion", metadata.stateSchemaVersion(),
                        "workflowVersion", metadata.workflowVersion(),
                        "curriculumRevision", metadata.curriculumRevision(),
                        "extensions", metadata.extensions()))
                .build();
    }

    private String optionIdByLabel(JsonNode context, String label) {
        List<JsonNode> matches = context.path("options").valueStream()
                .filter(option -> label.equals(option.path("label").asText()))
                .toList();
        assertThat(matches)
                .as("exactly one current option with label %s", label)
                .singleElement();
        String optionId = matches.getFirst().path("id").asText();
        assertThat(optionId)
                .as("opaque option ID for %s", label)
                .isNotBlank()
                .isNotEqualTo(label);
        return optionId;
    }

    private List<String> optionGoalIds(JsonNode option) {
        return option.path("goalIds").valueStream()
                .map(JsonNode::asText)
                .filter(goalId -> !goalId.isBlank())
                .toList();
    }

    private String scopeArguments(List<String> goalIds) throws Exception {
        return objectMapper.writeValueAsString(Map.of("goalIds", goalIds));
    }

    private List<String> persistedScopeGoalIds() {
        return jdbcOperations.queryForList(
                "SELECT goal_id FROM planned_goal WHERE skillpilot_id = ? ORDER BY goal_id",
                String.class,
                PERMANENT_SKILLPILOT_ID);
    }

    private String configuredPersonalCurriculum() {
        return """
                {
                  "%s": {
                    "selected": true,
                    "filterId": "DE-HE",
                    "durationModel": "G9",
                    "stage": "SekII"
                  },
                  "%s": {"selected": true, "filterId": "LK"},
                  "__skillpilot_stage_scope_sek1__": {"selected": false},
                  "__skillpilot_stage_scope_sek2__": {"selected": true},
                  "__skillpilotPersonalizationFlow": {
                    "rootLandscapeId": "%s",
                    "completedOptionIds": [],
                    "migrationCompleted": true
                  }
                }
                """.formatted(CURRICULUM_ID, MATHEMATICS_CURRICULUM_ID, CURRICULUM_ID);
    }

    private List<String> toolNames(HttpResponse<String> response) throws Exception {
        return objectMapper.readTree(response.body())
                .path("result")
                .path("tools")
                .valueStream()
                .map(tool -> tool.path("name").asText())
                .toList();
    }

    private JsonNode toolDescriptor(HttpResponse<String> response, String name) throws Exception {
        return objectMapper.readTree(response.body())
                .path("result")
                .path("tools")
                .valueStream()
                .filter(tool -> name.equals(tool.path("name").asText()))
                .findFirst()
                .orElseThrow();
    }

    private URI localUri(String path) {
        if (path.startsWith("http://") || path.startsWith("https://")) {
            URI external = URI.create(path);
            String local = external.getRawPath()
                    + (external.getRawQuery() == null ? "" : "?" + external.getRawQuery());
            return URI.create("http://127.0.0.1:" + port + local);
        }
        return URI.create("http://127.0.0.1:" + port + path);
    }

    private String form(List<Map.Entry<String, String>> parameters) {
        return parameters.stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private Map<String, String> parseQuery(String query) {
        return java.util.Arrays.stream(query.split("&"))
                .map(part -> part.split("=", 2))
                .collect(Collectors.toMap(
                        pair -> java.net.URLDecoder.decode(pair[0], StandardCharsets.UTF_8),
                        pair -> java.net.URLDecoder.decode(pair[1], StandardCharsets.UTF_8)));
    }

    private String challenge(String verifier) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(verifier.getBytes(StandardCharsets.US_ASCII));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
    }

    private String sha256Hex(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 must be available.", exception);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
