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
        "skillpilot.openai.coach.v1.secure-cookie=false",
        "skillpilot.openai.coach.v1.mcp-url=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth-resource=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth.client-id=chatgpt-e2e-client",
        "skillpilot.openai.coach.v1.oauth.redirect-uris=https://chatgpt.com/connector/oauth/e2e-callback",
        "skillpilot.openai.coach.v1.oauth.protected-resource-metadata=https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp"
})
class OpenAiDeCoachEndToEndIntegrationTest {

    private static final String PERMANENT_SKILLPILOT_ID = "SP-E2E-PERMANENT-ID-MUST-NOT-LEAK";
    private static final String CURRICULUM_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATHEMATICS_CURRICULUM_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_MATHEMATICS_ROOT_FOCUS_ID =
            "c01b1ce9-a667-4a46-b251-ec33ae602b15";
    private static final String LEGACY_HIDDEN_CURRICULUM_ID = "f050ee48-6891-4f83-995f-0f8be5e31b7f";
    private static final String COMPATIBILITY_CURRICULUM_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";
    private static final String HESSEN_SEKII_MATH_LK_SCOPE_ID =
            "composition:de-he-gym-sekii-math-lk:structure:sek2-lk";
    private static final String CLIENT_ID = OpenAiDeSecureOAuthTestServer.confidentialClientId();
    private static final String CALLBACK = "https://chatgpt.com/connector/oauth/e2e-callback";
    private static final String VERIFIER = "openai-de-e2e-pkce-verifier-with-more-than-forty-three-characters";
    private static final Set<String> MUTATING_TOOLS = Set.of(
            OpenAiDeV1McpContractAdapter.SET_CURRICULUM,
            OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
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
        learner.setSelectedCurriculum(null);
        learner.setPersonalCurriculum(null);
        learner.setActiveGoalId(null);
        learner.setLearningStrategy("RANDOM");
        learner.setAutoPilot(false);
        learner.setStrictMode(false);
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

        String replayRequestId = UUID.randomUUID().toString();
        Map<String, Object> firstArguments = Map.of(
                "learningStrategy", "SEQUENTIAL",
                "expectedStateVersion", 0L,
                "clientRequestId", replayRequestId);
        AtomicInteger operationCalls = new AtomicInteger();

        McpSchema.CallToolResult first = sessionCoordinator.write(
                firstSessionId,
                "set_preferences_test",
                0L,
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
                0L,
                replayRequestId,
                firstArguments,
                metadata -> {
                    operationCalls.incrementAndGet();
                    throw new AssertionError("An exact retry must not execute its operation again.");
                });

        assertThat(operationCalls).hasValue(1);
        assertThat(first.structuredContent().toString()).contains("stateVersion=1");
        assertThat(exactReplay.structuredContent().toString()).contains("stateVersion=1");
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow()
                .getCoachStateRevision()).isEqualTo(1L);

        assertThatThrownBy(() -> sessionCoordinator.write(
                        secondSessionId,
                        "set_preferences_test",
                        0L,
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
                        1L,
                        replayRequestId,
                        Map.of("learningStrategy", "RANDOM"),
                        this::successfulCoordinatorResult))
                .isInstanceOfSatisfying(
                        OpenAiDeV1SessionStateException.class,
                        exception -> assertThat(exception.code())
                                .isEqualTo(OpenAiDeV1SessionStateException.Code.IDEMPOTENCY_KEY_REUSED));
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow()
                .getCoachStateRevision()).isEqualTo(1L);

        HttpResponse<String> webWrite = putJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/preferences",
                "{\"strictMode\":true,\"showGoalVisualizationsInChat\":false}");
        assertThat(webWrite.statusCode()).withFailMessage(webWrite.body()).isEqualTo(200);
        Learner afterWebWrite =
                learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        assertThat(afterWebWrite.getStrictMode()).isTrue();
        assertThat(afterWebWrite.getShowGoalVisualizationsInChat()).isFalse();
        assertThat(afterWebWrite.getCoachStateRevision()).isEqualTo(2L);
        HttpResponse<String> webRead = get(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID));
        assertThat(webRead.statusCode()).withFailMessage(webRead.body()).isEqualTo(200);
        assertThat(objectMapper.readTree(webRead.body())
                .path("showGoalVisualizationsInChat")
                .asBoolean()).isFalse();

        assertThatThrownBy(() -> sessionCoordinator.write(
                        firstSessionId,
                        "set_preferences_test",
                        1L,
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
                        2L,
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
        assertThat(afterRollback.getCoachStateRevision()).isEqualTo(2L);
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
        HttpResponse<String> launch = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/v1/launch",
                """
                {"communicationLocale":"de","client":"openai-v1-e2e","providerEligibilityConfirmed":true}
                """,
                Map.of());
        assertThat(launch.statusCode()).withFailMessage(launch.body()).isEqualTo(200);
        assertThat(launch.body()).doesNotContain(PERMANENT_SKILLPILOT_ID);
        JsonNode launchBody = objectMapper.readTree(launch.body());
        String initialLearningSessionId = launchBody.path("learningSessionId").asText();
        assertThat(initialLearningSessionId).startsWith("sps_").hasSize(47);
        assertThat(launchBody.path("prompt").asText()).contains(initialLearningSessionId);
        assertThat(learningSessionRepository.findAll())
                .singleElement()
                .satisfies(session -> {
                    assertThat(session.getStartedAt()).isBeforeOrEqualTo(session.getExpiresAt());
                    assertThat(Duration.between(session.getStartedAt(), session.getExpiresAt()))
                            .isEqualTo(Duration.ofHours(24));
                });
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
                .contains(OpenAiDeV1McpContractAdapter.GET_CONTEXT, OpenAiDeV1McpContractAdapter.SET_CURRICULUM);
        JsonNode bootstrapTool = toolDescriptor(tools, OpenAiDeV1McpContractAdapter.GET_CONTEXT);
        assertThat(bootstrapTool.path("title").asText())
                .isEqualTo("Start or continue the SkillPilot learning coach");
        assertThat(bootstrapTool.path("description").asText())
                .contains("Always use this tool first")
                .contains("SkillPilot Coach v1")
                .contains("generic advice")
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
        List<String> expectedResourceUris = Stream.concat(
                        Stream.of(
                                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                                OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI,
                                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_RESOURCE_URI),
                        OpenAiDeV1ContractMetadata.RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S
                                .stream()
                                .map(OpenAiDeV1ContractMetadata::goalVisualizationResourceUri))
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

        HttpResponse<String> initialRead = callTool(
                accessToken,
                2,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                "{}",
                initialLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(initialRead, applicationSubject);
        JsonNode initialContext = result(initialRead).path("structuredContent");
        assertThat(initialContext.path("requiredAction").asText()).isEqualTo("setCurriculum");
        assertThat(initialContext.path("curriculum").isMissingNode()).isTrue();
        assertThat(initialContext.path("contractMajor").asInt()).isEqualTo(1);
        assertThat(initialContext.path("stateVersion").asLong()).isZero();
        assertThat(initialContext.path("stateSchemaVersion").asInt()).isEqualTo(1);
        assertThat(initialContext.path("workflowVersion").asText()).isEqualTo("coach@1.0");
        assertThat(initialContext.path("curriculumRevision").asText()).isNotBlank();
        assertThat(initialContext.path("extensions").isObject()).isTrue();

        var initialSession = learningSessionRepository.findAll().getFirst();
        assertThat(initialSession.getContractMajor()).isEqualTo(1);
        assertThat(initialSession.getStateVersion()).isZero();
        assertThat(initialSession.getStateSchemaVersion()).isEqualTo(1);
        assertThat(initialSession.getWorkflowVersion()).isEqualTo("coach@1.0");
        assertThat(initialSession.getCurriculumRevision()).isNotBlank();
        String initialLearningSessionHash = initialSession.getTokenHash();
        learningSessionRepository.deleteById(initialLearningSessionHash);
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
        assertThat(missingSessionResult.path("structuredContent").path("code").asText())
                .isEqualTo("SESSION_REQUIRED");
        assertLegacyStateIsEmpty();

        HttpResponse<String> restarted = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/v1/launch",
                """
                {"communicationLocale":"de","client":"openai-v1-e2e-restart","providerEligibilityConfirmed":true}
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
        assertLegacyStateIsEmpty();
        assertThat(learningSessionRepository.findAll())
                .singleElement()
                .satisfies(session -> {
                    assertThat(session.getStartedAt()).isBeforeOrEqualTo(session.getExpiresAt());
                    assertThat(Duration.between(session.getStartedAt(), session.getExpiresAt()))
                            .isEqualTo(Duration.ofHours(24));
                    assertThat(session.getContractMajor()).isEqualTo(1);
                    assertThat(session.getStateVersion()).isZero();
                    assertThat(session.getStateSchemaVersion()).isEqualTo(1);
                    assertThat(session.getWorkflowVersion()).isEqualTo("coach@1.0");
                    assertThat(session.getCurriculumRevision()).isNotBlank();
                });
        HttpResponse<String> resumed = callTool(
                accessToken,
                21,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                "{}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(resumed, applicationSubject);
        assertThat(result(resumed).path("structuredContent").path("requiredAction").asText())
                .isEqualTo("setCurriculum");

        HttpResponse<String> curriculumNavigation = callTool(
                accessToken,
                22,
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                "{\"target\":\"curriculum\"}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(curriculumNavigation, applicationSubject);
        JsonNode publishedCurriculumOptions =
                result(curriculumNavigation).path("structuredContent").path("options");
        assertThat(publishedCurriculumOptions.valueStream()
                .map(option -> option.path("id").asText())
                        .toList())
                .contains(CURRICULUM_ID)
                .doesNotContain(
                        MATHEMATICS_CURRICULUM_ID,
                        LEGACY_HIDDEN_CURRICULUM_ID,
                        COMPATIBILITY_CURRICULUM_ID);

        HttpResponse<String> unpublishedCurriculumWrite = callTool(
                accessToken,
                23,
                OpenAiDeV1McpContractAdapter.SET_CURRICULUM,
                "{\"curriculumId\":\"" + MATHEMATICS_CURRICULUM_ID + "\"}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(unpublishedCurriculumWrite, applicationSubject);
        JsonNode unpublishedCurriculumResult =
                objectMapper.readTree(unpublishedCurriculumWrite.body()).path("result");
        assertThat(unpublishedCurriculumResult.path("isError").asBoolean()).isTrue();
        assertThat(unpublishedCurriculumResult.path("structuredContent").path("status").asText())
                .isEqualTo("conflict");
        assertThat(unpublishedCurriculumResult.path("structuredContent").path("stateChanged").asBoolean())
                .isFalse();
        assertThat(unpublishedCurriculumResult.path("structuredContent")
                        .path("reloadContextAtMostOnce")
                        .asBoolean())
                .isTrue();
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow().getSelectedCurriculum())
                .isNull();

        HttpResponse<String> write = callTool(
                accessToken,
                3,
                OpenAiDeV1McpContractAdapter.SET_CURRICULUM,
                "{\"curriculumId\":\"" + CURRICULUM_ID + "\"}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(write, applicationSubject);
        JsonNode writtenContext = result(write).path("structuredContent");
        assertThat(writtenContext.path("curriculum").path("curriculumId").asText())
                .isEqualTo(CURRICULUM_ID);

        Learner persistedAfterWrite = learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        assertThat(persistedAfterWrite.getSelectedCurriculum()).isEqualTo(CURRICULUM_ID);
        assertThat(persistedAfterWrite.getPersonalCurriculum()).isNull();
        assertThat(persistedAfterWrite.getCoachStateRevision()).isEqualTo(1L);

        // A cockpit write participates in the same canonical conflict domain
        // as MCP. The old MCP envelope must become stale immediately.
        HttpResponse<String> cockpitWrite = putJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/curriculum",
                "{\"curriculumId\":\"" + CURRICULUM_ID + "\"}");
        assertThat(cockpitWrite.statusCode()).withFailMessage(cockpitWrite.body()).isEqualTo(200);
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow()
                .getCoachStateRevision()).isEqualTo(2L);

        HttpResponse<String> staleAfterCockpitWrite = callTool(
                accessToken,
                30,
                OpenAiDeV1McpContractAdapter.SET_CURRICULUM,
                "{\"curriculumId\":\"" + CURRICULUM_ID + "\"}",
                resumedLearningSessionId);
        JsonNode staleResult = objectMapper.readTree(staleAfterCockpitWrite.body()).path("result");
        assertThat(staleResult.path("isError").asBoolean()).isTrue();
        assertThat(staleResult.path("structuredContent").path("code").asText())
                .isEqualTo("STATE_VERSION_CONFLICT");
        assertThat(staleResult.path("structuredContent").path("stateVersion").asLong())
                .isEqualTo(2L);

        HttpResponse<String> refreshedCurriculumWrite = callTool(
                accessToken,
                31,
                OpenAiDeV1McpContractAdapter.SET_CURRICULUM,
                "{\"curriculumId\":\"" + CURRICULUM_ID + "\"}",
                resumedLearningSessionId);
        assertThat(result(refreshedCurriculumWrite)
                .path("structuredContent")
                .path("stateVersion")
                .asLong()).isEqualTo(3L);

        String jurisdictionOptionId = optionIdByLabel(writtenContext, "Hessen");
        HttpResponse<String> jurisdiction = callTool(
                accessToken,
                4,
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                optionArguments(jurisdictionOptionId),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(jurisdiction, applicationSubject);
        JsonNode jurisdictionContext = result(jurisdiction).path("structuredContent");
        assertThat(jurisdictionContext.path("requiredAction").asText()).isEqualTo("setPersonalization");
        assertThat(jurisdictionContext.path("options"))
                .extracting(option -> option.path("label").asText())
                .containsExactly("G8", "G9");
        assertThat(jurisdictionContext.path("options"))
                .allSatisfy(option -> {
                    assertThat(option.path("goalIds")).isEmpty();
                    assertThat(option.path("filterIds")).isEmpty();
                });

        Learner persistedAfterPersonalization =
                learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        JsonNode personalCurriculum =
                objectMapper.readTree(persistedAfterPersonalization.getPersonalCurriculum());
        assertThat(personalCurriculum.path(CURRICULUM_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(personalCurriculum.size()).isOne();

        String g9OptionId = optionIdByLabel(jurisdictionContext, "G9");
        HttpResponse<String> durationModel = callTool(
                accessToken,
                5,
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                optionArguments(g9OptionId),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(durationModel, applicationSubject);
        JsonNode durationContext = result(durationModel).path("structuredContent");
        assertThat(durationContext.path("requiredAction").asText()).isEqualTo("setPersonalization");
        assertThat(durationContext.path("options"))
                .extracting(option -> option.path("label").asText())
                .containsExactly(
                        "Sekundarstufe I",
                        "Gymnasiale Oberstufe (Sekundarstufe II)",
                        "Sekundarstufe I und II");

        Learner persistedAfterDuration =
                learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        JsonNode durationCurriculum =
                objectMapper.readTree(persistedAfterDuration.getPersonalCurriculum());
        assertThat(durationCurriculum.path(CURRICULUM_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(durationCurriculum.path(CURRICULUM_ID).path("durationModel").asText())
                .isEqualTo("G9");

        String upperSecondaryOptionId =
                optionIdByLabel(durationContext, "Gymnasiale Oberstufe (Sekundarstufe II)");
        HttpResponse<String> stage = callTool(
                accessToken,
                6,
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                optionArguments(upperSecondaryOptionId),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(stage, applicationSubject);
        JsonNode stageContext = result(stage).path("structuredContent");
        assertThat(stageContext.path("requiredAction").asText()).isEqualTo("setPersonalization");
        String mathematicsOptionId = optionIdByLabel(stageContext, "Mathematik");

        Learner persistedAfterStage =
                learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        JsonNode stageCurriculum =
                objectMapper.readTree(persistedAfterStage.getPersonalCurriculum());
        assertThat(stageCurriculum.path(CURRICULUM_ID).path("durationModel").asText())
                .isEqualTo("G9");
        assertThat(stageCurriculum.path(CURRICULUM_ID).path("stage").asText())
                .isEqualTo("SekII");
        assertThat(stageCurriculum
                        .path("__skillpilot_stage_scope_sek1__")
                        .path("selected")
                        .asBoolean())
                .isFalse();
        assertThat(stageCurriculum
                        .path("__skillpilot_stage_scope_sek2__")
                        .path("selected")
                        .asBoolean())
                .isTrue();

        HttpResponse<String> subject = callTool(
                accessToken,
                7,
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                optionArguments(mathematicsOptionId),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(subject, applicationSubject);
        JsonNode subjectContext = result(subject).path("structuredContent");
        assertThat(subjectContext.path("requiredAction").asText()).isEqualTo("setPersonalization");
        String finishSubjectGroupId = optionIdByLabel(subjectContext, "Auswahl abschließen");

        Learner persistedAfterSubject =
                learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        JsonNode subjectCurriculum =
                objectMapper.readTree(persistedAfterSubject.getPersonalCurriculum());
        assertThat(subjectCurriculum.path(CURRICULUM_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(subjectCurriculum.path(CURRICULUM_ID).path("stage").asText())
                .isEqualTo("SekII");
        assertThat(subjectCurriculum.path(MATHEMATICS_CURRICULUM_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(subjectCurriculum.path(MATHEMATICS_CURRICULUM_ID).has("filterId")).isFalse();

        HttpResponse<String> finishSubjectGroup = callTool(
                accessToken,
                8,
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                optionArguments(finishSubjectGroupId),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(finishSubjectGroup, applicationSubject);
        JsonNode profileContext = result(finishSubjectGroup).path("structuredContent");
        assertThat(profileContext.path("requiredAction").asText()).isEqualTo("setPersonalization");
        String courseProfileOptionId =
                optionIdByLabel(profileContext, "Mathematik – Leistungskurs");

        HttpResponse<String> courseProfile = callTool(
                accessToken,
                9,
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                optionArguments(courseProfileOptionId),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(courseProfile, applicationSubject);
        JsonNode courseContext = result(courseProfile).path("structuredContent");
        assertThat(courseContext.path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(courseContext.path("options")).isNotEmpty();
        assertThat(courseContext.path("options").valueStream())
                .allSatisfy(option -> assertThat(option.path("kind").asText()).isEqualTo("goal"));
        assertThat(courseContext.path("nextAllowedTools").valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .contains(OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL)
                .doesNotContain(OpenAiDeV1McpContractAdapter.SET_SCOPE);
        assertThat(persistedScopeGoalIds())
                .containsExactly(CANONICAL_MATHEMATICS_ROOT_FOCUS_ID);

        Learner persistedAfterCourseProfile =
                learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        JsonNode completedCurriculum =
                objectMapper.readTree(persistedAfterCourseProfile.getPersonalCurriculum());
        assertThat(completedCurriculum.path(CURRICULUM_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(completedCurriculum.path(CURRICULUM_ID).path("durationModel").asText())
                .isEqualTo("G9");
        assertThat(completedCurriculum.path(MATHEMATICS_CURRICULUM_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(completedCurriculum.path(MATHEMATICS_CURRICULUM_ID).path("filterId").asText())
                .isEqualTo("LK");
        assertThat(completedCurriculum.path(CURRICULUM_ID).path("stage").asText())
                .isEqualTo("SekII");

        HttpResponse<String> webLearnerRead = get(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID));
        assertThat(webLearnerRead.statusCode())
                .withFailMessage(webLearnerRead.body())
                .isEqualTo(200);
        JsonNode webLearner = objectMapper.readTree(webLearnerRead.body());
        assertThat(webLearner.path("selectedCurriculum").asText()).isEqualTo(CURRICULUM_ID);
        assertThat(objectMapper.readTree(webLearner.path("personalCurriculum").asText()))
                .isEqualTo(completedCurriculum);

        HttpResponse<String> webPersonalizationRead = get(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/personalization-plan");
        assertThat(webPersonalizationRead.statusCode())
                .withFailMessage(webPersonalizationRead.body())
                .isEqualTo(200);
        JsonNode webPersonalizationPlan =
                objectMapper.readTree(webPersonalizationRead.body());
        assertThat(webPersonalizationPlan.path("stage").asText()).isEqualTo("COMPLETE");
        List<JsonNode> webSelectedOptions = webPersonalizationPlan.path("completedDecisions").valueStream()
                .flatMap(decision -> decision.path("selectedOptions").valueStream())
                .toList();
        assertThat(webSelectedOptions)
                .extracting(option -> option.path("filterId").asText())
                .contains("DE-HE", "LK");
        assertThat(webSelectedOptions)
                .extracting(option -> option.path("scopeValue").asText())
                .contains("G9", "SekII");
        assertThat(webSelectedOptions)
                .extracting(option -> option.path("landscapeId").asText())
                .contains(MATHEMATICS_CURRICULUM_ID);

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

        HttpResponse<String> completeOrdinaryGoal = callTool(
                accessToken,
                18,
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                objectMapper.writeValueAsString(Map.of("goalId", completedOrdinaryGoalId)),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(completeOrdinaryGoal, applicationSubject);
        JsonNode masteryResult = result(completeOrdinaryGoal).path("structuredContent");
        assertThat(masteryResult.path("status").asText()).isEqualTo("updated");
        JsonNode autopilotSuccessorContext = masteryResult.path("context");
        String successorGoalId = autopilotSuccessorContext.path("activeGoal").path("goalId").asText();
        assertThat(successorGoalId).isNotBlank().isNotEqualTo(completedOrdinaryGoalId);
        assertThat(learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow().getActiveGoalId())
                .isEqualTo(successorGoalId);
        assertThat(autopilotSuccessorContext.path("requiredAction").asText())
                .isEqualTo("teachActiveGoal");
        assertThat(autopilotSuccessorContext.path("interactionMode").asText()).isEqualTo("chat");
        assertThat(autopilotSuccessorContext.path("options")).isEmpty();
        assertThat(autopilotSuccessorContext.path("frontier")).isEmpty();
        assertThat(autopilotSuccessorContext.path("nextAllowedTools").valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .doesNotContain(
                        OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                        OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL);

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

    private String optionArguments(String optionId) throws Exception {
        return objectMapper.writeValueAsString(Map.of("optionId", optionId));
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
