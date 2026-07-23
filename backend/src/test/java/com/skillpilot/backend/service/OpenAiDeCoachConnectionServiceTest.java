package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntent;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntentType;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeBindingGrant;
import com.skillpilot.backend.domain.OpenAiDeConnection;
import com.skillpilot.backend.domain.OpenAiDePendingLaunch;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeBindingGrantRepository;
import com.skillpilot.backend.repository.OpenAiDeConnectionRepository;
import com.skillpilot.backend.repository.OpenAiDePendingLaunchRepository;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.web.server.ResponseStatusException;

class OpenAiDeCoachConnectionServiceTest {

    private static final String SKILLPILOT_ID = "learner-secret-id";
    private static final String SIGNING_SECRET = "unit-test-signing-secret";
    private static final String BROWSER_SESSION = "spobs_unit-test-browser-session";

    private OpenAiDeBindingGrantRepository bindingGrants;
    private OpenAiDeConnectionRepository connections;
    private OpenAiDePendingLaunchRepository pendingLaunches;
    private LearnerRepository learners;
    private LearnerService learnerService;
    private LandscapeService landscapeService;
    private JdbcOperations jdbcOperations;
    private OpenAiDeCoachConnectionService service;
    private OpenAiDeProperties properties;
    private Learner learner;
    private Map<String, LearningLandscape> curricula;

    @BeforeEach
    void setUp() {
        bindingGrants = mock(OpenAiDeBindingGrantRepository.class);
        connections = mock(OpenAiDeConnectionRepository.class);
        pendingLaunches = mock(OpenAiDePendingLaunchRepository.class);
        learners = mock(LearnerRepository.class);
        learnerService = mock(LearnerService.class);
        landscapeService = mock(LandscapeService.class);
        jdbcOperations = mock(JdbcOperations.class);
        properties = new OpenAiDeProperties();
        properties.setWritesEnabled(true);
        properties.setMcpUrl("https://skillpilot.test/api/openai/de/mcp");
        properties.setChatgptUrl("https://chatgpt.com/");
        service = new OpenAiDeCoachConnectionService(
                bindingGrants,
                connections,
                pendingLaunches,
                learners,
                learnerService,
                landscapeService,
                jdbcOperations,
                properties,
                SIGNING_SECRET);
        learner = new Learner();
        learner.setSkillpilotId(SKILLPILOT_ID);
        learner.setSelectedCurriculum("math");
        curricula = new HashMap<>();
        allowCurriculum("math");
        allowCurriculum("science");
        when(landscapeService.getById(anyString()))
                .thenAnswer(invocation -> curricula.get(invocation.getArgument(0)));
        when(landscapeService.getClosure(anyString()))
                .thenAnswer(invocation -> {
                    LearningLandscape curriculum = curricula.get(invocation.getArgument(0));
                    return curriculum == null ? List.of() : List.of(curriculum);
                });
        when(learnerService.getLearner(SKILLPILOT_ID)).thenReturn(learner);
        when(learners.findBySkillpilotIdForUpdate(SKILLPILOT_ID)).thenReturn(Optional.of(learner));
        doAnswer(invocation -> {
            learner.setSelectedCurriculum(invocation.getArgument(1));
            return null;
        }).when(learnerService).setCurriculum(anyString(), anyString());
        doAnswer(invocation -> {
            learner.setActiveGoalId(invocation.getArgument(1));
            return null;
        }).when(learnerService).setActiveGoal(anyString(), anyString());
    }

    @Test
    void bindingGrantStoresOnlyHashAndReturnsStablePromptWithoutLearnerId() throws Exception {
        ArgumentCaptor<OpenAiDeBindingGrant> persisted = ArgumentCaptor.forClass(OpenAiDeBindingGrant.class);

        OpenAiDeCoachConnectionService.BindingGrant result = service.createBindingGrant(
                SKILLPILOT_ID,
                BROWSER_SESSION,
                request("web", "math", new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null)));

        verify(bindingGrants).saveAndFlush(persisted.capture());
        OpenAiDeBindingGrant entity = persisted.getValue();
        assertThat(result.token()).matches("^spodb_[A-Za-z0-9_-]{43}$");
        assertThat(entity.getTokenHash()).isEqualTo(hmac(result.token())).isNotEqualTo(result.token());
        assertThat(entity.getBrowserSessionHash()).isEqualTo(hmac(BROWSER_SESSION));
        assertThat(entity.getActiveBrowserSessionHash()).isEqualTo(hmac(BROWSER_SESSION));
        assertThat(result.response().chatgptUrl()).isEqualTo("https://chatgpt.com/");
        assertThat(result.response().prompt())
                .contains("SkillPilot Coach (Deutsch)")
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain(result.token());
        assertThat(result.response().toString()).doesNotContain(SKILLPILOT_ID).doesNotContain(result.token());
        assertThat(entity.getLearner()).isSameAs(learner);
        assertThat(entity.getSelectedCurriculum()).isEqualTo("math");
        assertThat(entity.getLaunchIntentType()).isEqualTo("CURRENT_UNIT");
    }

    @Test
    void bindingGrantRejectsMissingOrFalseProviderEligibilityBeforeAnyStateAccess() {
        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createBindingGrant(SKILLPILOT_ID, BROWSER_SESSION, null))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createBindingGrant(
                        SKILLPILOT_ID,
                        BROWSER_SESSION,
                        new OpenAiDeCoachStartRequest("de", "web", "math", false, null)))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));

        verifyNoInteractions(
                bindingGrants,
                connections,
                pendingLaunches,
                learners,
                learnerService,
                landscapeService,
                jdbcOperations);
    }

    @Test
    void bindingGrantCreatesOpaqueProviderSubjectAndCanBeConsumedOnlyOnce() throws Exception {
        String rawGrant = "spodb_raw-grant";
        OpenAiDeBindingGrant grant = validGrant();
        grant.setSelectedCurriculum("math");
        grant.setClient("verified-recall");
        grant.setLaunchIntentType("VERIFIED_RECALL");
        grant.setLaunchGoalId("memory-goal-42");
        grant.setLaunchBatchSize(6);
        when(bindingGrants.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(grant));
        ArgumentCaptor<OpenAiDeConnection> saved = ArgumentCaptor.forClass(OpenAiDeConnection.class);

        String subject = service.consumeBindingGrant(rawGrant, BROWSER_SESSION);

        verify(bindingGrants).findByTokenHashForUpdate(hmac(rawGrant));
        verify(connections).save(saved.capture());
        assertThat(subject).matches("^spod_[A-Za-z0-9_-]{43}$").doesNotContain(SKILLPILOT_ID);
        assertThat(saved.getValue().getLearner()).isSameAs(learner);
        assertThat(saved.getValue().getLastAuthorizedAt()).isNull();
        assertThat(grant.getConsumedAt()).isNotNull();
        assertThat(grant.getConnectionSubject()).isEqualTo(subject);
        assertThat(grant.getActiveBrowserSessionHash()).isNull();
        ArgumentCaptor<OpenAiDePendingLaunch> pending = ArgumentCaptor.forClass(OpenAiDePendingLaunch.class);
        verify(pendingLaunches).save(pending.capture());
        assertThat(pending.getValue().getConnectionSubject()).isEqualTo(subject);
        assertThat(pending.getValue().getSelectedCurriculum()).isEqualTo("math");
        assertThat(pending.getValue().getLaunchIntentType()).isEqualTo("VERIFIED_RECALL");
        assertThat(pending.getValue().getLaunchGoalId()).isEqualTo("memory-goal-42");
        assertThat(pending.getValue().getLaunchBatchSize()).isEqualTo(6);

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.consumeBindingGrant(rawGrant, BROWSER_SESSION))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void expiredBindingGrantDoesNotCreateConnection() {
        OpenAiDeBindingGrant grant = validGrant();
        grant.setExpiresAt(Instant.now().minusSeconds(1));
        when(bindingGrants.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(grant));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.consumeBindingGrant("expired", BROWSER_SESSION))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.GONE));

        verify(connections, never()).save(any(OpenAiDeConnection.class));
    }

    @Test
    void bindingGrantCannotBeConsumedFromAnotherBrowserSession() {
        OpenAiDeBindingGrant grant = validGrant();
        when(bindingGrants.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(grant));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.consumeBindingGrant("spodb_stolen", "spobs_other-browser"))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));

        assertThat(grant.getConsumedAt()).isNull();
        assertThat(grant.getActiveBrowserSessionHash()).isEqualTo(hmac(BROWSER_SESSION));
        verify(connections, never()).save(any(OpenAiDeConnection.class));
        verify(pendingLaunches, never()).save(any(OpenAiDePendingLaunch.class));
    }

    @Test
    void browserSessionCanHaveOnlyOneUnexpiredBindingGrant() {
        when(bindingGrants.findByActiveBrowserSessionHashForUpdate(hmac(BROWSER_SESSION)))
                .thenReturn(Optional.of(validGrant()));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createBindingGrant(
                        SKILLPILOT_ID,
                        BROWSER_SESSION,
                        request("web", "math", null)))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        verify(bindingGrants, never()).saveAndFlush(any(OpenAiDeBindingGrant.class));
    }

    @Test
    void launchRequiresAuthorizedProviderConnectionAndPersistsTypedCurrentUnitIntent() {
        OpenAiDeConnection connection = connection("spod_authorized");
        connection.setLastAuthorizedAt(Instant.now());
        connection.setOauthExpiresAt(futureExpiry());
        when(connections
                        .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfterOrderByCreatedAtDesc(
                                org.mockito.ArgumentMatchers.eq(SKILLPILOT_ID), any(Instant.class)))
                .thenReturn(Optional.of(connection));
        ArgumentCaptor<OpenAiDePendingLaunch> launch = ArgumentCaptor.forClass(OpenAiDePendingLaunch.class);

        var response = service.createPendingLaunch(
                SKILLPILOT_ID,
                request("web", "math", null));

        verify(pendingLaunches).save(launch.capture());
        assertThat(response.webUrl()).isEqualTo("https://chatgpt.com/");
        assertThat(response.prompt()).contains("SkillPilot Coach (Deutsch)");
        assertThat(response.toString()).doesNotContain(SKILLPILOT_ID);
        assertThat(launch.getValue().getConnectionSubject()).isEqualTo(connection.getSubject());
        assertThat(launch.getValue().getLaunchIntentType()).isEqualTo("CURRENT_UNIT");
        assertThat(launch.getValue().getConsumedAt()).isNotNull();
    }

    @Test
    void pendingLaunchRejectsMissingOrFalseProviderEligibilityBeforeAnyStateAccess() {
        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createPendingLaunch(SKILLPILOT_ID, null))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createPendingLaunch(
                        SKILLPILOT_ID,
                        new OpenAiDeCoachStartRequest("de", "web", "math", false, null)))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));

        verifyNoInteractions(
                bindingGrants,
                connections,
                pendingLaunches,
                learners,
                learnerService,
                landscapeService,
                jdbcOperations);
    }

    @Test
    void initialBindingDefersLearnerMutationUntilOAuthTokenWasIssued() {
        String goalId = "memory-goal-42";
        allowGoal("science", memoryGoalDefinition(goalId));
        ArgumentCaptor<OpenAiDeBindingGrant> persisted = ArgumentCaptor.forClass(OpenAiDeBindingGrant.class);

        var result = service.createBindingGrant(
                SKILLPILOT_ID,
                BROWSER_SESSION,
                request(
                        "verified-recall",
                        "science",
                        new LaunchIntent(LaunchIntentType.VERIFIED_RECALL, goalId, 7, null)));

        verify(learners, never()).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
        verify(learnerService, never()).setCurriculum(anyString(), anyString());
        verify(learnerService, never()).setActiveGoal(anyString(), anyString());
        verify(bindingGrants).saveAndFlush(persisted.capture());
        assertThat(learner.getSelectedCurriculum()).isEqualTo("math");
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(persisted.getValue().getLaunchIntentType()).isEqualTo("VERIFIED_RECALL");
        assertThat(persisted.getValue().getLaunchGoalId()).isEqualTo(goalId);
        assertThat(persisted.getValue().getLaunchBatchSize()).isEqualTo(7);
        assertThat(result.response().prompt())
                .contains("harte Kartenprüfung")
                .contains("7 Karten")
                .doesNotContain(goalId)
                .doesNotContain(SKILLPILOT_ID);
    }

    @Test
    void disabledWritesRejectStateChangingBindingBeforePersistingGrant() {
        String goalId = "memory-goal-42";
        allowGoal("science", memoryGoalDefinition(goalId));
        properties.setWritesEnabled(false);

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createBindingGrant(
                        SKILLPILOT_ID,
                        BROWSER_SESSION,
                        request(
                                "verified-recall",
                                "science",
                                new LaunchIntent(LaunchIntentType.VERIFIED_RECALL, goalId, 7, null))))
                .satisfies(exception -> assertThat(exception.getStatusCode())
                        .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));

        verify(bindingGrants, never()).saveAndFlush(any(OpenAiDeBindingGrant.class));
        verify(learnerService, never()).setCurriculum(anyString(), anyString());
        verify(learnerService, never()).setActiveGoal(anyString(), anyString());
    }

    @Test
    void firstOAuthTokenAppliesInitialRecallIntentAndThenMarksItConsumed() {
        String subject = "spod_new";
        String goalId = "memory-goal-42";
        OpenAiDeConnection current = connection(subject);
        OpenAiDePendingLaunch launch = pendingLaunch(subject, "science", "VERIFIED_RECALL", goalId, 7, null);
        when(connections.findLearnerSkillpilotIdBySubject(subject)).thenReturn(Optional.of(SKILLPILOT_ID));
        when(connections.findById(subject)).thenReturn(Optional.of(current));
        when(connections.findAllByLearnerSkillpilotIdAndRevokedAtIsNull(SKILLPILOT_ID))
                .thenReturn(List.of(current));
        when(pendingLaunches
                        .findFirstByConnectionSubjectAndConsumedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                                org.mockito.ArgumentMatchers.eq(subject), any(Instant.class)))
                .thenReturn(Optional.of(launch));
        allowGoal("science", memoryGoalDefinition(goalId));
        mockActiveGoal(memoryGoal(goalId));

        service.markOAuthConnected(subject, futureExpiry());

        verify(learners).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
        verify(learnerService).setCurriculum(SKILLPILOT_ID, "science");
        verify(learnerService).setActiveGoal(SKILLPILOT_ID, goalId);
        assertThat(current.getLastAuthorizedAt()).isNotNull();
        assertThat(current.getOauthExpiresAt()).isAfter(Instant.now());
        assertThat(launch.getConsumedAt()).isNotNull();
        verify(pendingLaunches).save(launch);
    }

    @Test
    void connectedAbiLaunchUsesTypedAuditFieldsAndNaturalPrompt() {
        String goalId = "68a262fc-43f4-5d23-af30-853870bfd45b";
        OpenAiDeConnection connection = connection("spod_authorized");
        connection.setLastAuthorizedAt(Instant.now());
        connection.setOauthExpiresAt(futureExpiry());
        when(connections
                        .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfterOrderByCreatedAtDesc(
                                org.mockito.ArgumentMatchers.eq(SKILLPILOT_ID), any(Instant.class)))
                .thenReturn(Optional.of(connection));
        ArgumentCaptor<OpenAiDePendingLaunch> persisted = ArgumentCaptor.forClass(OpenAiDePendingLaunch.class);
        allowGoal("math", examGoalDefinition(goalId, "LK", true));
        mockActiveGoal(examGoal(goalId, "LK"));

        var result = service.createPendingLaunch(
                SKILLPILOT_ID,
                request(
                        "abi26-mathe",
                        "math",
                        new LaunchIntent(LaunchIntentType.ABI26_EXAM, goalId, null, "lk")));

        verify(learnerService).setActiveGoal(SKILLPILOT_ID, goalId);
        verify(pendingLaunches).save(persisted.capture());
        assertThat(persisted.getValue().getLaunchIntentType()).isEqualTo("ABI26_EXAM");
        assertThat(persisted.getValue().getLaunchGoalId()).isEqualTo(goalId);
        assertThat(persisted.getValue().getLaunchCourseLevel()).isEqualTo("LK");
        assertThat(persisted.getValue().getConsumedAt()).isNotNull();
        assertThat(result.prompt())
                .contains("Prüfungsmodus")
                .contains("Leistungskurs")
                .doesNotContain(goalId);
    }

    @Test
    void verifiedRecallRejectsAnAtomicGoalThatIsNotMemoryOrSrs() {
        OpenAiDeConnection connection = connection("spod_authorized");
        connection.setLastAuthorizedAt(Instant.now());
        connection.setOauthExpiresAt(futureExpiry());
        when(connections
                        .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfterOrderByCreatedAtDesc(
                                org.mockito.ArgumentMatchers.eq(SKILLPILOT_ID), any(Instant.class)))
                .thenReturn(Optional.of(connection));
        allowGoal("math", ordinaryGoalDefinition("ordinary-goal"));
        mockActiveGoal(new FrontierGoal(
                "ordinary-goal",
                "Ordinary",
                "Ordinary atomic goal",
                "atomic",
                "tutor",
                "Active",
                List.of("GK"),
                List.of(),
                null,
                null,
                null,
                null));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createPendingLaunch(
                        SKILLPILOT_ID,
                        request(
                                "verified-recall",
                                "math",
                                new LaunchIntent(
                                        LaunchIntentType.VERIFIED_RECALL,
                                        "ordinary-goal",
                                        5,
                                        null))))
                .satisfies(exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).contains("Memory/SRS");
                });
    }

    @Test
    void abiLaunchRejectsAnyGoalOutsideTheKnownCourseCampaignPair() {
        OpenAiDeConnection connection = connection("spod_authorized");
        connection.setLastAuthorizedAt(Instant.now());
        connection.setOauthExpiresAt(futureExpiry());
        when(connections
                        .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfterOrderByCreatedAtDesc(
                                org.mockito.ArgumentMatchers.eq(SKILLPILOT_ID), any(Instant.class)))
                .thenReturn(Optional.of(connection));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createPendingLaunch(
                        SKILLPILOT_ID,
                        request(
                                "abi26-mathe",
                                "math",
                                new LaunchIntent(LaunchIntentType.ABI26_EXAM, "other-exam", null, "GK"))))
                .satisfies(exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).contains("course level");
                });
        verify(learnerService, never()).setActiveGoal(anyString(), anyString());
    }

    @Test
    void abiLaunchRejectsKnownCampaignGoalWithoutExamData() {
        String goalId = "53de0639-c08b-53dc-8f70-9b519b7ecbbd";
        authorizeExistingConnection();
        allowGoal("math", examGoalDefinition(goalId, "GK", false));
        mockActiveGoal(new FrontierGoal(
                goalId,
                "Exam",
                "Campaign goal without released exam data",
                "atomic",
                "exam",
                "Active",
                List.of("GK"),
                List.of(),
                null,
                null,
                null,
                null));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createPendingLaunch(
                        SKILLPILOT_ID,
                        request(
                                "abi26-mathe",
                                "math",
                                new LaunchIntent(LaunchIntentType.ABI26_EXAM, goalId, null, "GK"))))
                .satisfies(exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).contains("released exam goal");
                });
        verify(pendingLaunches, never()).save(any(OpenAiDePendingLaunch.class));
    }

    @Test
    void abiLaunchRejectsKnownCampaignGoalWithWrongCourseTag() {
        String goalId = "53de0639-c08b-53dc-8f70-9b519b7ecbbd";
        authorizeExistingConnection();
        allowGoal("math", examGoalDefinition(goalId, "LK", true));
        mockActiveGoal(examGoal(goalId, "LK"));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createPendingLaunch(
                        SKILLPILOT_ID,
                        request(
                                "abi26-mathe",
                                "math",
                                new LaunchIntent(LaunchIntentType.ABI26_EXAM, goalId, null, "GK"))))
                .satisfies(exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).contains("selected course level");
                });
        verify(pendingLaunches, never()).save(any(OpenAiDePendingLaunch.class));
    }

    @Test
    void bindingGrantRejectsInvalidRecallGoalWithoutMutatingLearnerState() {
        allowGoal("math", ordinaryGoalDefinition("ordinary-goal"));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createBindingGrant(
                        SKILLPILOT_ID,
                        BROWSER_SESSION,
                        request(
                                "verified-recall",
                                "math",
                                new LaunchIntent(
                                        LaunchIntentType.VERIFIED_RECALL,
                                        "ordinary-goal",
                                        5,
                                        null))))
                .satisfies(exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).contains("Memory/SRS");
                });

        verify(bindingGrants, never()).saveAndFlush(any(OpenAiDeBindingGrant.class));
        verify(learners, never()).findBySkillpilotIdForUpdate(anyString());
        verify(learnerService, never()).setCurriculum(anyString(), anyString());
        verify(learnerService, never()).setActiveGoal(anyString(), anyString());
    }

    @Test
    void firstOAuthTokenRevalidatesIntentBeforeAnyMutation() {
        String subject = "spod_new";
        String goalId = "memory-goal-42";
        OpenAiDeConnection current = connection(subject);
        OpenAiDePendingLaunch launch = pendingLaunch(subject, "math", "VERIFIED_RECALL", goalId, 7, null);
        when(connections.findLearnerSkillpilotIdBySubject(subject)).thenReturn(Optional.of(SKILLPILOT_ID));
        when(connections.findById(subject)).thenReturn(Optional.of(current));
        when(pendingLaunches
                        .findFirstByConnectionSubjectAndConsumedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                                org.mockito.ArgumentMatchers.eq(subject), any(Instant.class)))
                .thenReturn(Optional.of(launch));
        allowGoal("math", ordinaryGoalDefinition(goalId));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.markOAuthConnected(subject, futureExpiry()))
                .satisfies(exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).contains("Memory/SRS");
                });

        assertThat(current.getLastAuthorizedAt()).isNull();
        assertThat(launch.getConsumedAt()).isNull();
        verify(learnerService, never()).setCurriculum(anyString(), anyString());
        verify(learnerService, never()).setActiveGoal(anyString(), anyString());
        verify(pendingLaunches, never()).save(any(OpenAiDePendingLaunch.class));
        verify(connections, never()).save(current);
    }

    @Test
    void disabledWritesRejectDeferredLaunchWithoutConsumingOrMutatingIt() {
        String subject = "spod_new";
        String goalId = "memory-goal-42";
        OpenAiDeConnection current = connection(subject);
        OpenAiDePendingLaunch launch = pendingLaunch(subject, "science", "VERIFIED_RECALL", goalId, 7, null);
        when(connections.findLearnerSkillpilotIdBySubject(subject)).thenReturn(Optional.of(SKILLPILOT_ID));
        when(connections.findById(subject)).thenReturn(Optional.of(current));
        when(pendingLaunches
                        .findFirstByConnectionSubjectAndConsumedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                                org.mockito.ArgumentMatchers.eq(subject), any(Instant.class)))
                .thenReturn(Optional.of(launch));
        allowGoal("science", memoryGoalDefinition(goalId));
        properties.setWritesEnabled(false);

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.markOAuthConnected(subject, futureExpiry()))
                .satisfies(exception -> assertThat(exception.getStatusCode())
                        .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));

        assertThat(current.getLastAuthorizedAt()).isNull();
        assertThat(current.getOauthExpiresAt()).isNull();
        assertThat(launch.getConsumedAt()).isNull();
        assertThat(learner.getSelectedCurriculum()).isEqualTo("math");
        assertThat(learner.getActiveGoalId()).isNull();
        verify(learnerService, never()).setCurriculum(anyString(), anyString());
        verify(learnerService, never()).setActiveGoal(anyString(), anyString());
        verify(pendingLaunches, never()).save(any(OpenAiDePendingLaunch.class));
    }

    @Test
    void rejectsMalformedTypedLaunchIntentBeforeChangingLearnerState() {
        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createBindingGrant(
                        SKILLPILOT_ID,
                        BROWSER_SESSION,
                        request(
                                "verified-recall",
                                "math",
                                new LaunchIntent(LaunchIntentType.VERIFIED_RECALL, "goal", 0, null))))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));

        verify(learners, never()).findBySkillpilotIdForUpdate(anyString());
        verify(bindingGrants, never()).saveAndFlush(any(OpenAiDeBindingGrant.class));
    }

    @Test
    void cleanupDeletesExpiredBindingGrantsAndPendingLaunches() {
        ArgumentCaptor<Instant> pendingCutoff = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> bindingCutoff = ArgumentCaptor.forClass(Instant.class);
        Instant before = Instant.now();

        service.cleanupExpiredLaunchState();

        Instant after = Instant.now();
        verify(pendingLaunches).deleteByExpiresAtLessThanEqual(pendingCutoff.capture());
        verify(bindingGrants).deleteByExpiresAtLessThanEqual(bindingCutoff.capture());
        assertThat(pendingCutoff.getValue()).isBetween(before, after);
        assertThat(bindingCutoff.getValue()).isEqualTo(pendingCutoff.getValue());
    }

    @Test
    void cleanupRevokesOnlyRepositorySelectedAbandonedOauthConnectionsAndDeletesCodes() {
        OpenAiDeConnection abandoned = connection("spod_abandoned");
        OpenAiDeConnection authorized = connection("spod_authorized");
        authorized.setLastAuthorizedAt(Instant.now().minusSeconds(60));
        when(connections.findAllByLastAuthorizedAtIsNullAndRevokedAtIsNullAndCreatedAtLessThanEqual(any(Instant.class)))
                .thenReturn(List.of(abandoned));
        ArgumentCaptor<Instant> cutoff = ArgumentCaptor.forClass(Instant.class);
        Instant before = Instant.now().minus(properties.getLaunchTtl());

        service.cleanupExpiredLaunchState();

        Instant after = Instant.now().minus(properties.getLaunchTtl());
        verify(connections)
                .findAllByLastAuthorizedAtIsNullAndRevokedAtIsNullAndCreatedAtLessThanEqual(cutoff.capture());
        assertThat(cutoff.getValue()).isBetween(before, after);
        assertThat(abandoned.getRevokedAt()).isNotNull();
        assertThat(authorized.getRevokedAt()).isNull();
        verify(connections).saveAll(List.of(abandoned));
        verify(pendingLaunches).deleteAllByConnectionSubjectIn(List.of(abandoned.getSubject()));
        verify(jdbcOperations).update(
                "DELETE FROM oauth2_authorization WHERE principal_name = ?",
                abandoned.getSubject());
        verify(jdbcOperations).update(
                "DELETE FROM oauth2_authorization_consent WHERE principal_name = ?",
                abandoned.getSubject());
    }

    @Test
    void cleanupRevokesExpiredOauthConnectionsAndPurgesOnlyOldRevokedAuditRows() {
        OpenAiDeConnection expired = connection("spod_expired");
        expired.setLastAuthorizedAt(Instant.now().minusSeconds(120));
        expired.setOauthExpiresAt(Instant.now().minusSeconds(1));
        when(connections
                        .findAllByLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtLessThanEqual(
                                any(Instant.class)))
                .thenReturn(List.of(expired));
        ArgumentCaptor<Instant> retentionCutoff = ArgumentCaptor.forClass(Instant.class);
        Instant before = Instant.now().minusSeconds(30L * 24 * 60 * 60);

        service.cleanupExpiredLaunchState();

        Instant after = Instant.now().minusSeconds(30L * 24 * 60 * 60);
        assertThat(expired.getRevokedAt()).isNotNull();
        verify(connections).saveAll(List.of(expired));
        verify(pendingLaunches).deleteAllByConnectionSubjectIn(List.of(expired.getSubject()));
        verify(jdbcOperations).update(
                "DELETE FROM oauth2_authorization WHERE principal_name = ?",
                expired.getSubject());
        verify(jdbcOperations).update(
                "DELETE FROM oauth2_authorization_consent WHERE principal_name = ?",
                expired.getSubject());
        verify(connections).deleteByRevokedAtLessThanEqual(retentionCutoff.capture());
        assertThat(retentionCutoff.getValue()).isBetween(before, after);
    }

    @Test
    void expiredOauthCredentialsCannotResolveLearnerConnection() {
        OpenAiDeConnection expired = connection("spod_expired");
        expired.setLastAuthorizedAt(Instant.now().minusSeconds(60));
        expired.setOauthExpiresAt(Instant.now().minusSeconds(1));
        when(connections.findById(expired.getSubject())).thenReturn(Optional.of(expired));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.resolveSkillpilotId(expired.getSubject()))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));

        assertThat(expired.getLastUsedAt()).isNull();
        verify(connections, never()).save(expired);
    }

    @Test
    void authorizingNewConnectionRevokesOnlyOlderOpenAiDeConnectionAndOauthRows() {
        OpenAiDeConnection current = connection("spod_current");
        OpenAiDeConnection previous = connection("spod_previous");
        previous.setLastAuthorizedAt(Instant.now().minusSeconds(30));
        when(connections.findLearnerSkillpilotIdBySubject(current.getSubject()))
                .thenReturn(Optional.of(SKILLPILOT_ID));
        when(connections.findById(current.getSubject())).thenReturn(Optional.of(current));
        when(connections.findAllByLearnerSkillpilotIdAndRevokedAtIsNull(SKILLPILOT_ID))
                .thenReturn(java.util.List.of(previous, current));

        service.markOAuthConnected(current.getSubject(), futureExpiry());

        assertThat(current.getLastAuthorizedAt()).isNotNull();
        assertThat(previous.getRevokedAt()).isNotNull();
        verify(connections).saveAll(java.util.List.of(previous));
        verify(pendingLaunches).deleteAllByConnectionSubjectIn(java.util.List.of(previous.getSubject()));
        verify(jdbcOperations).update(
                "DELETE FROM oauth2_authorization WHERE principal_name = ?",
                previous.getSubject());
        verify(jdbcOperations).update(
                "DELETE FROM oauth2_authorization_consent WHERE principal_name = ?",
                previous.getSubject());
        verifyNoInteractions(bindingGrants);
    }

    private OpenAiDeBindingGrant validGrant() {
        OpenAiDeBindingGrant grant = new OpenAiDeBindingGrant();
        grant.setTokenHash("persisted-hash");
        grant.setLearner(learner);
        grant.setCreatedAt(Instant.now().minusSeconds(1));
        grant.setExpiresAt(Instant.now().plusSeconds(60));
        grant.setBrowserSessionHash(hmac(BROWSER_SESSION));
        grant.setActiveBrowserSessionHash(hmac(BROWSER_SESSION));
        return grant;
    }

    private OpenAiDeConnection connection(String subject) {
        OpenAiDeConnection connection = new OpenAiDeConnection();
        connection.setSubject(subject);
        connection.setLearner(learner);
        connection.setCreatedAt(Instant.now().minusSeconds(10));
        return connection;
    }

    private OpenAiDeConnection authorizeExistingConnection() {
        OpenAiDeConnection connection = connection("spod_authorized");
        connection.setLastAuthorizedAt(Instant.now());
        connection.setOauthExpiresAt(futureExpiry());
        when(connections
                        .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfterOrderByCreatedAtDesc(
                                org.mockito.ArgumentMatchers.eq(SKILLPILOT_ID), any(Instant.class)))
                .thenReturn(Optional.of(connection));
        return connection;
    }

    private void allowCurriculum(String curriculumId) {
        LearningLandscape curriculum = new LearningLandscape();
        curriculum.setLandscapeId(curriculumId);
        curriculum.setGoals(new java.util.ArrayList<>());
        curricula.put(curriculumId, curriculum);
    }

    private void allowGoal(String curriculumId, LearningGoal goal) {
        curricula.get(curriculumId).getGoals().add(goal);
    }

    private LearningGoal memoryGoalDefinition(String goalId) {
        LearningGoal goal = ordinaryGoalDefinition(goalId);
        goal.setNodeKind("memory");
        goal.setTags(List.of("memorization", "srs-deck:test"));
        return goal;
    }

    private LearningGoal examGoalDefinition(String goalId, String courseLevel, boolean withExamData) {
        LearningGoal goal = ordinaryGoalDefinition(goalId);
        goal.setNodeKind("exam");
        goal.setTags(List.of(courseLevel));
        goal.setExamData(withExamData ? new ExamData() : null);
        return goal;
    }

    private LearningGoal ordinaryGoalDefinition(String goalId) {
        LearningGoal goal = new LearningGoal();
        goal.setId(goalId);
        goal.setType("atomic");
        goal.setNodeKind("tutor");
        goal.setContains(List.of());
        goal.setTags(List.of());
        return goal;
    }

    private OpenAiDePendingLaunch pendingLaunch(
            String subject,
            String selectedCurriculum,
            String intentType,
            String goalId,
            Integer batchSize,
            String courseLevel) {
        OpenAiDePendingLaunch launch = new OpenAiDePendingLaunch();
        launch.setId("launch-42");
        launch.setLearner(learner);
        launch.setConnectionSubject(subject);
        launch.setCreatedAt(Instant.now().minusSeconds(1));
        launch.setExpiresAt(Instant.now().plusSeconds(60));
        launch.setSelectedCurriculum(selectedCurriculum);
        launch.setLaunchIntentType(intentType);
        launch.setLaunchGoalId(goalId);
        launch.setLaunchBatchSize(batchSize);
        launch.setLaunchCourseLevel(courseLevel);
        return launch;
    }

    private FrontierGoal memoryGoal(String goalId) {
        return new FrontierGoal(
                goalId,
                "Memory",
                "Atomic memory goal",
                "atomic",
                "memory",
                "Active",
                List.of("memorization", "srs-deck:test"),
                List.of(),
                null,
                null,
                null,
                null);
    }

    private FrontierGoal examGoal(String goalId, String courseLevel) {
        return new FrontierGoal(
                goalId,
                "Exam",
                "Released campaign exam",
                "atomic",
                "exam",
                "Active",
                List.of(courseLevel),
                List.of(),
                null,
                null,
                null,
                new ExamData());
    }

    private void mockActiveGoal(FrontierGoal activeGoal) {
        when(learnerService.getLearnerState(SKILLPILOT_ID)).thenReturn(new UnifiedLearnerStateResponse(
                SKILLPILOT_ID,
                null,
                List.of(),
                null,
                List.of(),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                null));
    }

    private OpenAiDeCoachStartRequest request(
            String client,
            String selectedCurriculum,
            LaunchIntent launchIntent) {
        return new OpenAiDeCoachStartRequest("de", client, selectedCurriculum, true, launchIntent);
    }

    private Instant futureExpiry() {
        return Instant.now().plusSeconds(3600);
    }

    private String hmac(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SIGNING_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
