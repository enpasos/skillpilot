package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfiguration;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeSecureOAuthTestServer;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeBindingGrantRepository;
import com.skillpilot.backend.repository.OpenAiDeConnectionRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import com.skillpilot.backend.repository.OpenAiDePendingLaunchRepository;
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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
 * Vertical release gate for the German OpenAI coach.
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
        "skillpilot.openai.de.enabled=true",
        "skillpilot.openai.de.writes-enabled=true",
        "skillpilot.openai.de.oauth.enabled=true",
        "skillpilot.openai.de.mcp.enabled=true",
        "skillpilot.openai.de.secure-cookie=false",
        "skillpilot.openai.de.mcp-url=https://skillpilot.test/api/openai/de/mcp",
        "skillpilot.openai.de.oauth.client-id=chatgpt-e2e-client",
        "skillpilot.openai.de.oauth.redirect-uris=https://chatgpt.com/connector/oauth/e2e-callback",
        "skillpilot.openai.de.oauth.protected-resource-metadata=https://skillpilot.test/api/openai/de/oauth/protected-resource"
})
class OpenAiDeCoachEndToEndIntegrationTest {

    private static final String PERMANENT_SKILLPILOT_ID = "SP-E2E-PERMANENT-ID-MUST-NOT-LEAK";
    private static final String CURRICULUM_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATHEMATICS_CURRICULUM_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String LEGACY_HIDDEN_CURRICULUM_ID = "f050ee48-6891-4f83-995f-0f8be5e31b7f";
    private static final String COMPATIBILITY_CURRICULUM_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";
    private static final String CLIENT_ID = OpenAiDeSecureOAuthTestServer.confidentialClientId();
    private static final String CALLBACK = "https://chatgpt.com/connector/oauth/e2e-callback";
    private static final String VERIFIER = "openai-de-e2e-pkce-verifier-with-more-than-forty-three-characters";

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
    private OpenAiDePendingLaunchRepository pendingLaunchRepository;

    @Autowired
    @Qualifier("openAiDeAuthorizationService")
    private OAuth2AuthorizationService authorizationService;

    @Autowired
    private JdbcOperations jdbcOperations;

    private HttpClient browser;

    @DynamicPropertySource
    static void secureOpenAiDeProperties(DynamicPropertyRegistry registry) {
        OpenAiDeSecureOAuthTestServer.registerConfidentialSecureProperties(registry);
    }

    @BeforeEach
    void setUp() {
        jdbcOperations.update("DELETE FROM oauth2_authorization_consent");
        jdbcOperations.update("DELETE FROM oauth2_authorization");
        pendingLaunchRepository.deleteAllInBatch();
        bindingGrantRepository.deleteAllInBatch();
        learningSessionRepository.deleteAllInBatch();
        connectionRepository.deleteAllInBatch();
        Learner learner = learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseGet(() -> {
            Learner created = new Learner();
            created.setSkillpilotId(PERMANENT_SKILLPILOT_ID);
            return created;
        });
        learner.setSelectedCurriculum(null);
        learner.setPersonalCurriculum(null);
        learner.setActiveGoalId(null);
        learnerRepository.saveAndFlush(learner);

        CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        browser = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Test
    void providerEligibilityIsRequiredAtLaunchBeforePersistence() throws Exception {
        String path = "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID)
                + "/openai/de/launch";

        HttpResponse<String> missing = postJson(path, "{\"language\":\"de\"}", Map.of());
        HttpResponse<String> rejected = postJson(
                path,
                "{\"language\":\"de\",\"providerEligibilityConfirmed\":false}",
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
                "{\"language\":\"de\",\"providerEligibilityConfirmed\":true}",
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
                + "/openai/de/launch";

        HttpResponse<String> first = postJson(
                path,
                "{\"language\":\"de\",\"client\":\"first\",\"providerEligibilityConfirmed\":true}",
                Map.of());
        HttpResponse<String> second = postJson(
                path,
                "{\"language\":\"de\",\"client\":\"second\",\"providerEligibilityConfirmed\":true}",
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
    void removedLegacyUiEndpointsReturnNotFound() throws Exception {
        HttpResponse<String> connectStart = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/connect-start",
                "{\"language\":\"de\",\"providerEligibilityConfirmed\":true}",
                Map.of());
        HttpResponse<String> status = get(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/status");

        assertThat(connectStart.statusCode()).isEqualTo(404);
        assertThat(status.statusCode()).isEqualTo(404);
        assertThat(learningSessionRepository.count()).isZero();
        assertThat(bindingGrantRepository.count()).isZero();
        assertThat(connectionRepository.count()).isZero();
        assertThat(pendingLaunchRepository.count()).isZero();
    }

    @Test
    void appOnlyOAuthAndExplicitLearningSessionPersistLearnerStateWithoutExposingPermanentId()
            throws Exception {
        HttpResponse<String> launch = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/launch",
                """
                {"language":"de","client":"openai-de-e2e","providerEligibilityConfirmed":true}
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
                Map.entry("resource", "https://skillpilot.test/api/openai/de/mcp")));

        HttpResponse<String> authorize = get(authorizePath);
        assertThat(authorize.statusCode()).isEqualTo(302);
        URI consentUri = URI.create(authorize.headers().firstValue(HttpHeaders.LOCATION).orElseThrow());
        String consentState = parseQuery(consentUri.getRawQuery()).get("state");
        assertThat(consentState).isNotBlank();
        assertLegacyStateIsEmpty();

        HttpResponse<String> consent = get(consentUri.toString());
        assertThat(consent.statusCode()).isEqualTo(200);
        assertThat(consent.body())
                .contains("ChatGPT-App f&uuml;r SkillPilot autorisieren")
                .contains("OAuth autorisiert nur die App")
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
                        Map.entry("resource", "https://skillpilot.test/api/openai/de/mcp")));
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
                .contains(OpenAiDeCoachMcpContract.GET_CONTEXT, OpenAiDeCoachMcpContract.SET_CURRICULUM);
        JsonNode bootstrapTool = toolDescriptor(tools, OpenAiDeCoachMcpContract.GET_CONTEXT);
        assertThat(bootstrapTool.path("title").asText())
                .isEqualTo("SkillPilot-Lerncoach starten oder fortsetzen");
        assertThat(bootstrapTool.path("description").asText())
                .contains("immer zuerst")
                .contains("SkillPilot Coach (Deutsch)")
                .contains("allgemeine Lernberatung")
                .contains("nicht für allgemeine Fachfragen ohne SkillPilot-Bezug");
        JsonNode bootstrapInputSchema = bootstrapTool.path("inputSchema");
        assertThat(bootstrapInputSchema
                        .path("properties")
                        .path(OpenAiDeCoachMcpContract.LEARNING_SESSION_ID)
                        .path("type")
                        .asText())
                .isEqualTo("string");
        assertThat(bootstrapInputSchema.path("required").valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .contains(OpenAiDeCoachMcpContract.LEARNING_SESSION_ID);
        assertThat(bootstrapTool.path("annotations").path("readOnlyHint").asBoolean()).isTrue();

        HttpResponse<String> initialRead = callTool(
                accessToken,
                2,
                OpenAiDeCoachMcpContract.GET_CONTEXT,
                "{}",
                initialLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(initialRead, applicationSubject);
        JsonNode initialContext = result(initialRead).path("structuredContent");
        assertThat(initialContext.path("requiredAction").asText()).isEqualTo("setCurriculum");
        assertThat(initialContext.path("curriculum").isMissingNode()).isTrue();

        String initialLearningSessionHash = learningSessionRepository.findAll().getFirst().getTokenHash();
        learningSessionRepository.deleteById(initialLearningSessionHash);
        learningSessionRepository.flush();
        HttpResponse<String> missingSession = callTool(
                accessToken,
                20,
                OpenAiDeCoachMcpContract.GET_CONTEXT,
                "{}",
                initialLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(missingSession, applicationSubject);
        JsonNode missingSessionResult = objectMapper.readTree(missingSession.body()).path("result");
        assertThat(missingSessionResult.path("isError").asBoolean()).isTrue();
        assertThat(missingSessionResult.path("structuredContent").path("code").asText())
                .isEqualTo("SESSION_REQUIRED");
        assertLegacyStateIsEmpty();

        HttpResponse<String> restarted = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/launch",
                """
                {"language":"de","client":"openai-de-e2e-restart","providerEligibilityConfirmed":true}
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
                });
        HttpResponse<String> resumed = callTool(
                accessToken,
                21,
                OpenAiDeCoachMcpContract.GET_CONTEXT,
                "{}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(resumed, applicationSubject);
        assertThat(result(resumed).path("structuredContent").path("requiredAction").asText())
                .isEqualTo("setCurriculum");

        HttpResponse<String> curriculumNavigation = callTool(
                accessToken,
                22,
                OpenAiDeCoachMcpContract.GET_NAVIGATION,
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
                OpenAiDeCoachMcpContract.SET_CURRICULUM,
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
                OpenAiDeCoachMcpContract.SET_CURRICULUM,
                "{\"curriculumId\":\"" + CURRICULUM_ID + "\"}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(write, applicationSubject);
        JsonNode writtenContext = result(write).path("structuredContent");
        assertThat(writtenContext.path("curriculum").path("curriculumId").asText())
                .isEqualTo(CURRICULUM_ID);

        Learner persistedAfterWrite = learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        assertThat(persistedAfterWrite.getSelectedCurriculum()).isEqualTo(CURRICULUM_ID);
        assertThat(persistedAfterWrite.getPersonalCurriculum()).isNull();

        String jurisdictionOptionId = optionIdByLabel(writtenContext, "Hessen");
        HttpResponse<String> jurisdiction = callTool(
                accessToken,
                4,
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
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
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
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
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
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
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
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
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
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
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
                optionArguments(courseProfileOptionId),
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(courseProfile, applicationSubject);
        JsonNode courseContext = result(courseProfile).path("structuredContent");
        assertThat(courseContext.path("requiredAction").asText()).isNotEqualTo("setPersonalization");
        assertThat(courseContext.path("options")).isNotEmpty();
        assertThat(courseContext.path("options"))
                .anySatisfy(option -> assertThat(option.path("goalIds")).isNotEmpty());

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

        HttpResponse<String> persistedRead = callTool(
                accessToken,
                10,
                OpenAiDeCoachMcpContract.GET_CONTEXT,
                "{}",
                resumedLearningSessionId);
        assertMcpPayloadDoesNotExposeIdentity(persistedRead, applicationSubject);
        assertThat(result(persistedRead)
                        .path("structuredContent")
                        .path("curriculum")
                        .path("curriculumId")
                        .asText())
                .isEqualTo(CURRICULUM_ID);

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
        HttpRequest.Builder request = OpenAiDeSecureOAuthTestServer.withVerifiedMtlsEdge(
                HttpRequest.newBuilder(localUri("/api/openai/de/mcp"))
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .header(HttpHeaders.ACCEPT, "application/json, text/event-stream")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header("MCP-Protocol-Version", "2025-11-25"));
        return browser.send(
                request
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postModernMcp(String accessToken, String body) throws Exception {
        HttpRequest.Builder request = OpenAiDeSecureOAuthTestServer.withVerifiedMtlsEdge(
                HttpRequest.newBuilder(localUri("/api/openai/de/mcp"))
                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                        .header(HttpHeaders.ACCEPT, "application/json, text/event-stream")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .header("MCP-Protocol-Version", "2026-07-28")
                        .header("Mcp-Method", "server/discover"));
        return browser.send(
                request.POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> callTool(
            String accessToken,
            int id,
            String toolName,
            String arguments,
            String learningSessionId)
            throws Exception {
        return postMcp(accessToken, """
                {"jsonrpc":"2.0","id":%d,"method":"tools/call","params":{"name":"%s","arguments":%s}}
                """.formatted(id, toolName, withLearningSession(arguments, learningSessionId)));
    }

    private String withLearningSession(String arguments, String learningSessionId) throws Exception {
        JsonNode parsed = objectMapper.readTree(arguments);
        if (!(parsed instanceof ObjectNode objectArguments)) {
            throw new IllegalArgumentException("MCP tool arguments must be a JSON object.");
        }
        objectArguments.put(OpenAiDeCoachMcpContract.LEARNING_SESSION_ID, learningSessionId);
        return objectMapper.writeValueAsString(objectArguments);
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

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
