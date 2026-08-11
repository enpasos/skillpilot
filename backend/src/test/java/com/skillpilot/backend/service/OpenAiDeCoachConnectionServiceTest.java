package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntent;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntentType;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.springframework.web.server.ResponseStatusException;

class OpenAiDeCoachConnectionServiceTest {

    private static final String SKILLPILOT_ID = "learner-secret-id";
    private static final String SIGNING_SECRET = "unit-test-signing-secret";
    private static final String LEARNING_SESSION_ID = "sps_" + "A".repeat(43);
    private static final String ABI26_GK_GOAL_ID = "53de0639-c08b-53dc-8f70-9b519b7ecbbd";
    private static final String ABI26_LK_GOAL_ID = "68a262fc-43f4-5d23-af30-853870bfd45b";

    private OpenAiDeLearningSessionRepository learningSessions;
    private LearnerRepository learners;
    private LearnerService learnerService;
    private LandscapeService landscapeService;
    private OpenAiDeProperties properties;
    private OpenAiDeCoachConnectionService service;
    private Learner learner;

    @BeforeEach
    void setUp() {
        learningSessions = mock(OpenAiDeLearningSessionRepository.class);
        learners = mock(LearnerRepository.class);
        learnerService = mock(LearnerService.class);
        landscapeService = mock(LandscapeService.class);
        OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider =
                mock(OpenAiDeCurriculumRevisionProvider.class);
        when(curriculumRevisionProvider.currentRevision())
                .thenReturn("curricula-sha256@" + "a".repeat(64));

        properties = new OpenAiDeProperties();
        properties.setWritesEnabled(true);
        properties.setChatgptUrl("https://chatgpt.com/");
        properties.setLearningSessionTtl(Duration.ofHours(24));
        service = new OpenAiDeCoachConnectionService(
                learningSessions,
                learners,
                learnerService,
                landscapeService,
                properties,
                curriculumRevisionProvider,
                SIGNING_SECRET);

        learner = new Learner();
        learner.setSkillpilotId(SKILLPILOT_ID);
        learner.setSelectedCurriculum("math");
        when(learnerService.getLearner(SKILLPILOT_ID)).thenReturn(learner);
        when(learnerService.reopenPersonalizationForExplicitLaunch(any(Learner.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(learners.findBySkillpilotIdForUpdate(SKILLPILOT_ID)).thenReturn(Optional.of(learner));
        when(landscapeService.getById("math")).thenReturn(mock(SkillLandscape.class));
    }

    @Test
    void everyUiLaunchCreatesFreshIndependentSessionWithExactAbsoluteLifetime() {
        ArgumentCaptor<OpenAiDeLearningSession> persisted =
                ArgumentCaptor.forClass(OpenAiDeLearningSession.class);

        var first = service.createLaunch(SKILLPILOT_ID, currentUnitRequest());
        var second = service.createLaunch(SKILLPILOT_ID, currentUnitRequest());

        verify(learningSessions, org.mockito.Mockito.times(2)).save(persisted.capture());
        List<OpenAiDeLearningSession> sessions = persisted.getAllValues();
        assertThat(first.learningSessionId()).matches("^sps_[A-Za-z0-9_-]{43}$");
        assertThat(second.learningSessionId()).matches("^sps_[A-Za-z0-9_-]{43}$");
        assertThat(first.learningSessionId()).isNotEqualTo(second.learningSessionId());
        assertThat(first.prompt())
                .contains(first.learningSessionId(), "learningSessionId")
                .doesNotContain(SKILLPILOT_ID);
        assertThat(second.prompt())
                .contains(second.learningSessionId(), "learningSessionId")
                .doesNotContain(SKILLPILOT_ID);
        assertThat(sessions)
                .allSatisfy(session -> {
                    assertThat(session.getLearner()).isSameAs(learner);
                    assertThat(session.getTokenHash()).isNotBlank();
                    assertThat(Duration.between(session.getStartedAt(), session.getExpiresAt()))
                            .isEqualTo(Duration.ofHours(24));
                    assertThat(session.getStateVersion()).isEqualTo(learner.getCoachStateRevision());
                    assertThat(session.getCurriculumRevision())
                            .isEqualTo("curricula-sha256@" + "a".repeat(64));
                    assertThat(session.getCommunicationLocale()).isEqualTo("de");
                });
        assertThat(sessions.get(0).getTokenHash()).isNotEqualTo(first.learningSessionId());
        assertThat(sessions.get(1).getTokenHash()).isNotEqualTo(second.learningSessionId());
        assertThat(first.expiresAt()).isEqualTo(sessions.get(0).getExpiresAt());
        assertThat(second.expiresAt()).isEqualTo(sessions.get(1).getExpiresAt());
    }

    @Test
    void gatedFirstPartyDiagnosticTtlAppliesOnceAndTheNextLaunchReturnsToTwentyFourHours() {
        properties.setDiagnosticSessionTtlEnabled(true);
        ArgumentCaptor<OpenAiDeLearningSession> persisted =
                ArgumentCaptor.forClass(OpenAiDeLearningSession.class);

        var diagnostic = service.createFirstPartyLaunch(
                SKILLPILOT_ID,
                currentUnitRequest(5_400));
        var normal = service.createFirstPartyLaunch(SKILLPILOT_ID, currentUnitRequest());

        verify(learningSessions, org.mockito.Mockito.times(2)).save(persisted.capture());
        List<OpenAiDeLearningSession> sessions = persisted.getAllValues();
        assertThat(Duration.between(sessions.get(0).getStartedAt(), sessions.get(0).getExpiresAt()))
                .isEqualTo(Duration.ofMinutes(90));
        assertThat(Duration.between(sessions.get(1).getStartedAt(), sessions.get(1).getExpiresAt()))
                .isEqualTo(Duration.ofHours(24));
        assertThat(diagnostic.expiresAt()).isEqualTo(sessions.get(0).getExpiresAt());
        assertThat(normal.expiresAt()).isEqualTo(sessions.get(1).getExpiresAt());
        assertThat(properties.getLearningSessionTtl()).isEqualTo(Duration.ofHours(24));
    }

    @Test
    void firstPartyDiagnosticTtlFailsClosedUnlessExplicitlyEnabled() {
        assertThat(properties.isDiagnosticSessionTtlEnabled()).isFalse();

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createFirstPartyLaunch(
                        SKILLPILOT_ID,
                        currentUnitRequest(5_400)))
                .satisfies(exception -> {
                    assertThat(exception.getStatusCode().value()).isEqualTo(400);
                    assertThat(exception.getReason()).contains("disabled");
                });

        verify(learningSessions, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void diagnosticTtlRejectsOneHourOrLessAndAnythingBeyondTwentyFourHours() {
        properties.setDiagnosticSessionTtlEnabled(true);

        for (int invalidSeconds : List.of(3_600, 86_401)) {
            assertThatExceptionOfType(ResponseStatusException.class)
                    .isThrownBy(() -> service.createFirstPartyLaunch(
                            SKILLPILOT_ID,
                            currentUnitRequest(invalidSeconds)))
                    .satisfies(exception -> assertThat(exception.getStatusCode().value())
                            .isEqualTo(400));
        }

        verify(learningSessions, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void diagnosticTtlAcceptsTheFirstSecondBeyondTheRenewalWindow() {
        properties.setDiagnosticSessionTtlEnabled(true);
        ArgumentCaptor<OpenAiDeLearningSession> persisted =
                ArgumentCaptor.forClass(OpenAiDeLearningSession.class);

        service.createFirstPartyLaunch(SKILLPILOT_ID, currentUnitRequest(3_601));

        verify(learningSessions).save(persisted.capture());
        assertThat(Duration.between(
                persisted.getValue().getStartedAt(),
                persisted.getValue().getExpiresAt()))
                .isEqualTo(Duration.ofSeconds(3_601));
    }

    @Test
    void diagnosticTtlAcceptsTheNormalTwentyFourHourBoundaryExactly() {
        properties.setDiagnosticSessionTtlEnabled(true);
        ArgumentCaptor<OpenAiDeLearningSession> persisted =
                ArgumentCaptor.forClass(OpenAiDeLearningSession.class);

        var response = service.createFirstPartyLaunch(
                SKILLPILOT_ID,
                currentUnitRequest(86_400));

        verify(learningSessions).save(persisted.capture());
        OpenAiDeLearningSession session = persisted.getValue();
        assertThat(properties.getLearningSessionTtl()).isEqualTo(Duration.ofHours(24));
        assertThat(Duration.between(session.getStartedAt(), session.getExpiresAt()))
                .isEqualTo(Duration.ofHours(24));
        assertThat(response.expiresAt()).isEqualTo(session.getExpiresAt());
    }

    @Test
    void internalBootstrapEntryPointNeverAcceptsTheDiagnosticTtl() {
        properties.setDiagnosticSessionTtlEnabled(true);

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createLaunch(SKILLPILOT_ID, currentUnitRequest(5_400)))
                .satisfies(exception -> {
                    assertThat(exception.getStatusCode().value()).isEqualTo(400);
                    assertThat(exception.getReason()).contains("first-party UI launch");
                });

        verify(learningSessions, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void currentUnitLaunchPreparesAutopilotGoalBeforePinningSessionRevision() {
        learner.setAutoPilot(true);
        learner.setActiveGoalId(null);
        learner.setCoachStateRevision(12L);
        when(learnerService.getLearnerState(SKILLPILOT_ID)).thenAnswer(invocation -> {
            learner.setActiveGoalId("prepared-next-goal");
            learner.setCoachStateRevision(13L);
            return null;
        });
        ArgumentCaptor<OpenAiDeLearningSession> persisted =
                ArgumentCaptor.forClass(OpenAiDeLearningSession.class);

        service.createLaunch(SKILLPILOT_ID, currentUnitRequest());

        org.mockito.InOrder ordered = org.mockito.Mockito.inOrder(learnerService, learningSessions);
        ordered.verify(learnerService).getLearnerState(SKILLPILOT_ID);
        ordered.verify(learningSessions).save(persisted.capture());
        assertThat(persisted.getValue().getStateVersion()).isEqualTo(13L);
        assertThat(persisted.getValue().getLearner().getActiveGoalId())
                .isEqualTo("prepared-next-goal");
    }

    @ParameterizedTest
    @MethodSource("launchPromptCases")
    void launchPromptIsMinimalAndKeepsExactlyOneSessionForEveryIntentAndLocale(
            String communicationLocale,
            LaunchIntent launchIntent,
            String expectedInstruction) {
        if (launchIntent.type() == LaunchIntentType.VERIFIED_RECALL) {
            prepareAtomicLaunchGoal(
                    launchIntent.goalId(),
                    "memory",
                    List.of("memorization", "srs-deck:test"),
                    null);
        } else if (launchIntent.type() == LaunchIntentType.ABI26_EXAM) {
            prepareAtomicLaunchGoal(
                    launchIntent.goalId(),
                    "exam",
                    List.of(launchIntent.courseLevel()),
                    new ExamData());
        }

        OpenAiDeCoachStartRequest request = new OpenAiDeCoachStartRequest(
                communicationLocale,
                "web",
                "math",
                true,
                launchIntent);

        var response = service.createLaunch(SKILLPILOT_ID, request);

        assertThat(response.prompt())
                .isEqualTo(expectedInstruction
                        + "\nlearningSessionId: "
                        + response.learningSessionId())
                .containsOnlyOnce(response.learningSessionId())
                .doesNotContain(SKILLPILOT_ID);
        if (launchIntent.goalId() != null) {
            assertThat(response.prompt()).doesNotContain(launchIntent.goalId());
        }
    }

    @Test
    void validExplicitSessionResolvesLearnerWithoutUsingOAuthAsLearnerIdentity() throws Exception {
        OpenAiDeLearningSession persisted = persistedSession(Instant.now().plusSeconds(60));
        when(learningSessions.findById(hmac(LEARNING_SESSION_ID))).thenReturn(Optional.of(persisted));

        assertThat(service.resolveActiveLearningSessionSkillpilotId(LEARNING_SESSION_ID))
                .isEqualTo(SKILLPILOT_ID);
    }

    @Test
    void missingMalformedUnknownOrExpiredSessionFailsClosed() throws Exception {
        when(learningSessions.findById(hmac(LEARNING_SESSION_ID))).thenReturn(Optional.empty());

        assertThatExceptionOfType(OpenAiDeLearningSessionRequiredException.class)
                .isThrownBy(() -> service.resolveActiveLearningSessionSkillpilotId(null));
        assertThatExceptionOfType(OpenAiDeLearningSessionRequiredException.class)
                .isThrownBy(() -> service.resolveActiveLearningSessionSkillpilotId("sps_short"));
        assertThatExceptionOfType(OpenAiDeLearningSessionRequiredException.class)
                .isThrownBy(() -> service.resolveActiveLearningSessionSkillpilotId(LEARNING_SESSION_ID));

        OpenAiDeLearningSession expired = persistedSession(Instant.now().minusSeconds(1));
        when(learningSessions.findById(hmac(LEARNING_SESSION_ID))).thenReturn(Optional.of(expired));
        assertThatExceptionOfType(OpenAiDeLearningSessionRequiredException.class)
                .isThrownBy(() -> service.resolveActiveLearningSessionSkillpilotId(LEARNING_SESSION_ID));
    }

    @Test
    void scheduledCleanupDeletesOnlyExpiredLearningSessions() {
        service.cleanupExpiredLearningSessions();

        verify(learningSessions).deleteByExpiresAtLessThanEqual(any(Instant.class));
    }

    @Test
    void launchRequiresExplicitProviderEligibilityConfirmation() {
        OpenAiDeCoachStartRequest request = new OpenAiDeCoachStartRequest(
                "de",
                "web",
                "math",
                false,
                new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createLaunch(SKILLPILOT_ID, request))
                .satisfies(exception -> assertThat(exception.getStatusCode().value()).isEqualTo(403));
    }

    @Test
    void launchNormalizesAndPinsEnglishCommunicationLocale() {
        ArgumentCaptor<OpenAiDeLearningSession> persisted =
                ArgumentCaptor.forClass(OpenAiDeLearningSession.class);
        OpenAiDeCoachStartRequest request = new OpenAiDeCoachStartRequest(
                "en-gb",
                "web",
                "math",
                true,
                new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null));

        var response = service.createLaunch(SKILLPILOT_ID, request);

        verify(learningSessions).save(persisted.capture());
        assertThat(persisted.getValue().getCommunicationLocale()).isEqualTo("en-GB");
        assertThat(response.prompt())
                .contains("Use SkillPilot Coach v1 and continue.", "learningSessionId: ")
                .doesNotContain("Verwende die App", SKILLPILOT_ID);
    }

    @Test
    void launchRejectsMalformedOrUnsupportedCommunicationLocale() {
        for (String locale : List.of("en_US", "fr")) {
            OpenAiDeCoachStartRequest request = new OpenAiDeCoachStartRequest(
                    locale,
                    "web",
                    "math",
                    true,
                    new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null));

            assertThatExceptionOfType(ResponseStatusException.class)
                    .isThrownBy(() -> service.createLaunch(SKILLPILOT_ID, request))
                    .satisfies(exception -> assertThat(exception.getStatusCode().value()).isEqualTo(400));
        }
    }

    private OpenAiDeCoachStartRequest currentUnitRequest() {
        return currentUnitRequest(null);
    }

    private OpenAiDeCoachStartRequest currentUnitRequest(Integer diagnosticSessionTtlSeconds) {
        return new OpenAiDeCoachStartRequest(
                "de",
                "web",
                "math",
                true,
                new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null),
                diagnosticSessionTtlSeconds);
    }

    private static Stream<Arguments> launchPromptCases() {
        return Stream.of(
                Arguments.of(
                        "de",
                        new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null),
                        "Verwende SkillPilot Coach v1 und fahre fort."),
                Arguments.of(
                        "en",
                        new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null),
                        "Use SkillPilot Coach v1 and continue."),
                Arguments.of(
                        "de",
                        new LaunchIntent(LaunchIntentType.VERIFIED_RECALL, "memory-goal", 7, null),
                        "Verwende SkillPilot Coach v1 und starte eine harte Kartenprüfung mit 7 Karten."),
                Arguments.of(
                        "en",
                        new LaunchIntent(LaunchIntentType.VERIFIED_RECALL, "memory-goal", 7, null),
                        "Use SkillPilot Coach v1 and start a strict recall check with 7 cards."),
                Arguments.of(
                        "de",
                        new LaunchIntent(LaunchIntentType.ABI26_EXAM, ABI26_GK_GOAL_ID, null, "GK"),
                        "Verwende SkillPilot Coach v1 und starte die Mathematik-Abiturprüfung (Grundkurs)."),
                Arguments.of(
                        "de",
                        new LaunchIntent(LaunchIntentType.ABI26_EXAM, ABI26_LK_GOAL_ID, null, "LK"),
                        "Verwende SkillPilot Coach v1 und starte die Mathematik-Abiturprüfung (Leistungskurs)."),
                Arguments.of(
                        "en",
                        new LaunchIntent(LaunchIntentType.ABI26_EXAM, ABI26_GK_GOAL_ID, null, "GK"),
                        "Use SkillPilot Coach v1 and start the mathematics Abitur exam (basic course)."),
                Arguments.of(
                        "en",
                        new LaunchIntent(LaunchIntentType.ABI26_EXAM, ABI26_LK_GOAL_ID, null, "LK"),
                        "Use SkillPilot Coach v1 and start the mathematics Abitur exam (advanced course)."));
    }

    private void prepareAtomicLaunchGoal(
            String goalId,
            String nodeKind,
            List<String> tags,
            ExamData examData) {
        LearningGoal goal = new LearningGoal();
        goal.setId(goalId);
        goal.setType("atomic");
        goal.setNodeKind(nodeKind);
        goal.setTags(tags);
        goal.setContains(List.of());
        goal.setExamData(examData);

        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId("math");
        landscape.setGoals(List.of(goal));
        when(landscapeService.getById("math")).thenReturn(landscape);
        when(landscapeService.getClosure("math")).thenReturn(List.of(landscape));

        learner.setActiveGoalId(goalId);
        FrontierGoal activeGoal = new FrontierGoal(
                goalId,
                "Test goal",
                "Test description",
                "atomic",
                nodeKind,
                "Prerequisites met",
                tags,
                List.of(),
                null,
                null,
                null,
                examData);
        UnifiedLearnerStateResponse learnerState = new UnifiedLearnerStateResponse(
                SKILLPILOT_ID,
                null,
                List.of(activeGoal),
                null,
                List.of(),
                List.of(),
                Set.of(),
                "frontier",
                activeGoal,
                null);
        when(learnerService.getLearnerState(SKILLPILOT_ID)).thenReturn(learnerState);
    }

    private OpenAiDeLearningSession persistedSession(Instant expiresAt) throws Exception {
        OpenAiDeLearningSession session = new OpenAiDeLearningSession();
        session.setTokenHash(hmac(LEARNING_SESSION_ID));
        session.setLearner(learner);
        session.setStartedAt(expiresAt.minus(Duration.ofHours(24)));
        session.setExpiresAt(expiresAt);
        return session;
    }

    private String hmac(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SIGNING_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }
}
