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
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.server.ResponseStatusException;

class OpenAiDeCoachConnectionServiceTest {

    private static final String SKILLPILOT_ID = "learner-secret-id";
    private static final String SIGNING_SECRET = "unit-test-signing-secret";
    private static final String LEARNING_SESSION_ID = "sps_" + "A".repeat(43);

    private OpenAiDeLearningSessionRepository learningSessions;
    private LearnerRepository learners;
    private LearnerService learnerService;
    private LandscapeService landscapeService;
    private OpenAiDeCoachConnectionService service;
    private Learner learner;

    @BeforeEach
    void setUp() {
        learningSessions = mock(OpenAiDeLearningSessionRepository.class);
        learners = mock(LearnerRepository.class);
        learnerService = mock(LearnerService.class);
        landscapeService = mock(LandscapeService.class);

        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setWritesEnabled(true);
        properties.setChatgptUrl("https://chatgpt.com/");
        properties.setLearningSessionTtl(Duration.ofHours(24));
        service = new OpenAiDeCoachConnectionService(
                learningSessions,
                learners,
                learnerService,
                landscapeService,
                properties,
                SIGNING_SECRET);

        learner = new Learner();
        learner.setSkillpilotId(SKILLPILOT_ID);
        learner.setSelectedCurriculum("math");
        when(learnerService.getLearner(SKILLPILOT_ID)).thenReturn(learner);
        when(learners.findBySkillpilotIdForUpdate(SKILLPILOT_ID)).thenReturn(Optional.of(learner));
        when(landscapeService.getById("math")).thenReturn(mock(LearningLandscape.class));
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
                });
        assertThat(sessions.get(0).getTokenHash()).isNotEqualTo(first.learningSessionId());
        assertThat(sessions.get(1).getTokenHash()).isNotEqualTo(second.learningSessionId());
        assertThat(first.expiresAt()).isEqualTo(sessions.get(0).getExpiresAt());
        assertThat(second.expiresAt()).isEqualTo(sessions.get(1).getExpiresAt());
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

    private OpenAiDeCoachStartRequest currentUnitRequest() {
        return new OpenAiDeCoachStartRequest(
                "de",
                "web",
                "math",
                true,
                new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null));
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
