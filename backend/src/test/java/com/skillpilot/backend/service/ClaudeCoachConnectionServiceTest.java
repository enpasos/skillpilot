package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.ChatStartRequest;
import com.skillpilot.backend.api.ClaudeLaunchResponse;
import com.skillpilot.backend.domain.ClaudeBindingGrant;
import com.skillpilot.backend.domain.ClaudeConnection;
import com.skillpilot.backend.domain.ClaudePendingLaunch;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.ClaudeBindingGrantRepository;
import com.skillpilot.backend.repository.ClaudeConnectionRepository;
import com.skillpilot.backend.repository.ClaudePendingLaunchRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.web.server.ResponseStatusException;

class ClaudeCoachConnectionServiceTest {

    private static final String SKILLPILOT_ID = "learner-secret-id";
    private static final String SIGNING_SECRET = "unit-test-signing-secret";
    private static final String MCP_URL = "https://skillpilot.test/api/claude/mcp/";

    private ClaudeBindingGrantRepository bindingGrantRepository;
    private ClaudeConnectionRepository connectionRepository;
    private ClaudePendingLaunchRepository pendingLaunchRepository;
    private LearnerRepository learnerRepository;
    private LearnerService learnerService;
    private JdbcOperations jdbcOperations;
    private ClaudeCoachConnectionService service;
    private Learner learner;

    @BeforeEach
    void setUp() {
        bindingGrantRepository = mock(ClaudeBindingGrantRepository.class);
        connectionRepository = mock(ClaudeConnectionRepository.class);
        pendingLaunchRepository = mock(ClaudePendingLaunchRepository.class);
        learnerRepository = mock(LearnerRepository.class);
        learnerService = mock(LearnerService.class);
        jdbcOperations = mock(JdbcOperations.class);
        service = new ClaudeCoachConnectionService(
                bindingGrantRepository,
                connectionRepository,
                pendingLaunchRepository,
                learnerRepository,
                learnerService,
                jdbcOperations,
                Duration.ofMinutes(5),
                Duration.ofMinutes(5),
                SIGNING_SECRET,
                MCP_URL);
        learner = learner(SKILLPILOT_ID, "math");
        when(learnerService.getLearner(SKILLPILOT_ID)).thenReturn(learner);
        when(learnerRepository.findBySkillpilotIdForUpdate(SKILLPILOT_ID)).thenReturn(Optional.of(learner));
    }

    @Test
    void createBindingGrantPersistsOnlyItsHashAndKeepsSecretAndLearnerIdOutOfResponse() throws Exception {
        when(connectionRepository.existsByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNull(
                        SKILLPILOT_ID))
                .thenReturn(false);
        ArgumentCaptor<ClaudeBindingGrant> persisted = ArgumentCaptor.forClass(ClaudeBindingGrant.class);

        ClaudeCoachConnectionService.BindingGrant result = service.createBindingGrant(
                SKILLPILOT_ID,
                new ChatStartRequest("de", "web", "math", null));

        verify(bindingGrantRepository).save(persisted.capture());
        ClaudeBindingGrant entity = persisted.getValue();
        assertThat(result.token()).matches("^spcb_[A-Za-z0-9_-]{43}$");
        assertThat(entity.getTokenHash())
                .isEqualTo(hmac(result.token()))
                .isNotEqualTo(result.token())
                .doesNotContain(result.token());
        assertThat(entity.getLearner()).isSameAs(learner);
        assertThat(entity.getConsumedAt()).isNull();
        assertThat(entity.getConnectionSubject()).isNull();

        assertThat(result.response().installUrl())
                .startsWith("https://claude.ai/customize/connectors?")
                .contains("connectorUrl=https%3A%2F%2Fskillpilot.test%2Fapi%2Fclaude%2Fmcp")
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain(result.token());
        assertThat(result.response().toString())
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain(result.token());
        assertThat(result.response().connected()).isFalse();

        verify(learnerService).assertActiveLearnerRouteAccess(SKILLPILOT_ID);
        verify(learnerService).getLearner(SKILLPILOT_ID);
        verify(connectionRepository)
                .existsByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNull(SKILLPILOT_ID);
        verifyNoMoreInteractions(bindingGrantRepository, connectionRepository, learnerService);
        verifyNoInteractions(pendingLaunchRepository, learnerRepository);
    }

    @Test
    void consumeBindingGrantCreatesOpaqueSubjectAndCanUseTheGrantOnlyOnce() throws Exception {
        String rawGrant = "spcb_raw-grant-value";
        ClaudeBindingGrant grant = validGrant(learner);
        when(bindingGrantRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(grant));
        ArgumentCaptor<String> hashLookup = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<ClaudeConnection> savedConnection = ArgumentCaptor.forClass(ClaudeConnection.class);

        String subject = service.consumeBindingGrant(rawGrant);

        assertThat(subject)
                .matches("^spc_[A-Za-z0-9_-]{43}$")
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain(rawGrant);
        verify(bindingGrantRepository).findByTokenHashForUpdate(hashLookup.capture());
        assertThat(hashLookup.getValue()).isEqualTo(hmac(rawGrant)).isNotEqualTo(rawGrant);
        verify(connectionRepository).save(savedConnection.capture());
        verify(learnerRepository).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
        assertThat(savedConnection.getValue().getSubject()).isEqualTo(subject);
        assertThat(savedConnection.getValue().getLearner()).isSameAs(learner);
        assertThat(savedConnection.getValue().getLastAuthorizedAt()).isNull();
        assertThat(grant.getConsumedAt()).isNotNull();
        assertThat(grant.getConnectionSubject()).isEqualTo(subject);
        verify(bindingGrantRepository).save(grant);

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.consumeBindingGrant(rawGrant))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        verify(bindingGrantRepository, times(2)).findByTokenHashForUpdate(hmac(rawGrant));
        verify(connectionRepository, times(1)).save(any(ClaudeConnection.class));
        verify(bindingGrantRepository, times(1)).save(grant);
        verifyNoMoreInteractions(bindingGrantRepository, connectionRepository, learnerRepository);
        verifyNoInteractions(pendingLaunchRepository, learnerService);
    }

    @Test
    void consumeBindingGrantRejectsExpiredGrantWithoutCreatingConnection() {
        ClaudeBindingGrant grant = validGrant(learner);
        grant.setExpiresAt(Instant.now().minusSeconds(1));
        when(bindingGrantRepository.findByTokenHashForUpdate(anyString())).thenReturn(Optional.of(grant));

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.consumeBindingGrant("spcb_expired"))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.GONE));

        verify(bindingGrantRepository).findByTokenHashForUpdate(anyString());
        verify(bindingGrantRepository, never()).save(any(ClaudeBindingGrant.class));
        verifyNoInteractions(connectionRepository, pendingLaunchRepository, learnerRepository, learnerService);
    }

    @Test
    void marksConnectionAuthorizedOnlyAfterOAuthTokenIssuance() {
        ClaudeConnection connection = new ClaudeConnection();
        connection.setSubject("spc_oauth-subject");
        connection.setLearner(learner);
        connection.setCreatedAt(Instant.now().minusSeconds(10));
        when(connectionRepository.findLearnerSkillpilotIdBySubject(connection.getSubject()))
                .thenReturn(Optional.of(SKILLPILOT_ID));
        when(connectionRepository.findById(connection.getSubject())).thenReturn(Optional.of(connection));
        when(connectionRepository.findAllByLearnerSkillpilotIdAndRevokedAtIsNull(SKILLPILOT_ID))
                .thenReturn(java.util.List.of(connection));

        service.markOAuthConnected(connection.getSubject());

        assertThat(connection.getLastAuthorizedAt()).isNotNull();
        verify(connectionRepository).findLearnerSkillpilotIdBySubject(connection.getSubject());
        verify(learnerRepository).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
        verify(connectionRepository).findById(connection.getSubject());
        verify(connectionRepository).save(connection);
        verify(connectionRepository).findAllByLearnerSkillpilotIdAndRevokedAtIsNull(SKILLPILOT_ID);
        verifyNoInteractions(
                bindingGrantRepository,
                pendingLaunchRepository,
                learnerService,
                jdbcOperations);
    }

    @Test
    void newlyAuthorizedConnectionAtomicallyReplacesOlderClaudeAccess() {
        ClaudeConnection current = connection("spc_current", learner);
        ClaudeConnection previous = connection("spc_previous", learner);
        previous.setLastAuthorizedAt(Instant.now().minusSeconds(60));
        when(connectionRepository.findLearnerSkillpilotIdBySubject(current.getSubject()))
                .thenReturn(Optional.of(SKILLPILOT_ID));
        when(connectionRepository.findById(current.getSubject())).thenReturn(Optional.of(current));
        when(connectionRepository.findAllByLearnerSkillpilotIdAndRevokedAtIsNull(SKILLPILOT_ID))
                .thenReturn(java.util.List.of(previous, current));

        service.markOAuthConnected(current.getSubject());

        assertThat(current.getLastAuthorizedAt()).isNotNull();
        assertThat(current.getRevokedAt()).isNull();
        assertThat(previous.getRevokedAt()).isNotNull();
        verify(connectionRepository).saveAll(java.util.List.of(previous));
        verify(pendingLaunchRepository).deleteAllByConnectionSubjectIn(java.util.List.of(previous.getSubject()));
        verify(jdbcOperations).update(
                "DELETE FROM oauth2_authorization WHERE principal_name = ?",
                previous.getSubject());
        verify(jdbcOperations).update(
                "DELETE FROM oauth2_authorization_consent WHERE principal_name = ?",
                previous.getSubject());
    }

    @Test
    void disconnectRevokesEveryClaudeSubjectAndDeletesItsOauthGrants() {
        ClaudeConnection first = connection("spc_first", learner);
        ClaudeConnection second = connection("spc_second", learner);
        when(connectionRepository.findAllByLearnerSkillpilotIdAndRevokedAtIsNull(SKILLPILOT_ID))
                .thenReturn(java.util.List.of(first, second));

        service.disconnect(SKILLPILOT_ID);

        assertThat(first.getRevokedAt()).isNotNull();
        assertThat(second.getRevokedAt()).isNotNull();
        verify(connectionRepository).saveAll(java.util.List.of(first, second));
        verify(pendingLaunchRepository).deleteAllByConnectionSubjectIn(
                java.util.List.of(first.getSubject(), second.getSubject()));
        verify(learnerRepository).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
        for (ClaudeConnection connection : java.util.List.of(first, second)) {
            verify(jdbcOperations).update(
                    "DELETE FROM oauth2_authorization WHERE principal_name = ?",
                    connection.getSubject());
            verify(jdbcOperations).update(
                    "DELETE FROM oauth2_authorization_consent WHERE principal_name = ?",
                    connection.getSubject());
        }
    }

    @Test
    void pendingLaunchExposesNoLearnerIdAndIsConsumedOnlyOnce() {
        ChatStartRequest request = new ChatStartRequest("en-US", "web", "math", "ignored transport text");
        ArgumentCaptor<ClaudePendingLaunch> persistedLaunch = ArgumentCaptor.forClass(ClaudePendingLaunch.class);
        ClaudeConnection connection = new ClaudeConnection();
        connection.setSubject("spc_existing-subject");
        connection.setLearner(learner);
        connection.setCreatedAt(Instant.now().minusSeconds(10));
        connection.setLastAuthorizedAt(Instant.now().minusSeconds(5));
        when(connectionRepository
                        .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullOrderByCreatedAtDesc(
                                SKILLPILOT_ID))
                .thenReturn(Optional.of(connection));

        ClaudeLaunchResponse response = service.createPendingLaunch(SKILLPILOT_ID, request);

        verify(pendingLaunchRepository).save(persistedLaunch.capture());
        ClaudePendingLaunch launch = persistedLaunch.getValue();
        assertThat(response.toString())
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain(launch.getId());
        assertThat(response.webUrl()).isEqualTo("https://claude.ai/new");
        assertThat(response.desktopUrl())
                .startsWith("claude://claude.ai/new?q=")
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain(launch.getId());
        assertThat(launch.getConnectionSubject()).isEqualTo(connection.getSubject());

        when(connectionRepository.findById(connection.getSubject())).thenReturn(Optional.of(connection));
        when(pendingLaunchRepository
                        .findFirstByConnectionSubjectAndConsumedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                                org.mockito.ArgumentMatchers.eq(connection.getSubject()),
                                any(Instant.class)))
                .thenAnswer(invocation -> launch.getConsumedAt() == null
                        && launch.getExpiresAt().isAfter(invocation.getArgument(1, Instant.class))
                                ? Optional.of(launch)
                                : Optional.empty());

        Optional<ClaudeCoachConnectionService.PendingLaunch> first =
                service.consumePendingLaunch(connection.getSubject());
        Optional<ClaudeCoachConnectionService.PendingLaunch> second =
                service.consumePendingLaunch(connection.getSubject());

        assertThat(first).isPresent();
        assertThat(first.orElseThrow().toString()).doesNotContain(SKILLPILOT_ID);
        assertThat(first.orElseThrow().id()).isEqualTo(launch.getId());
        assertThat(first.orElseThrow().language()).isEqualTo("en");
        assertThat(first.orElseThrow().selectedCurriculum()).isEqualTo("math");
        assertThat(second).isEmpty();
        assertThat(launch.getConsumedAt()).isNotNull();
        verify(pendingLaunchRepository, times(2))
                .findFirstByConnectionSubjectAndConsumedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                        org.mockito.ArgumentMatchers.eq(connection.getSubject()),
                        any(Instant.class));
        verify(pendingLaunchRepository, times(2)).save(launch);
        verify(connectionRepository, times(2)).findById(connection.getSubject());
        verify(connectionRepository, times(2)).save(connection);
        verify(connectionRepository)
                .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullOrderByCreatedAtDesc(
                        SKILLPILOT_ID);
        verify(learnerService).assertActiveLearnerRouteAccess(SKILLPILOT_ID);
        verify(learnerService).getLearner(SKILLPILOT_ID);
        verify(learnerRepository).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
        verifyNoMoreInteractions(
                bindingGrantRepository,
                connectionRepository,
                pendingLaunchRepository,
                learnerRepository,
                learnerService);
    }

    @Test
    void pendingLaunchRequiresAnEstablishedClaudeConnection() {
        when(connectionRepository
                        .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullOrderByCreatedAtDesc(
                                SKILLPILOT_ID))
                .thenReturn(Optional.empty());

        assertThatExceptionOfType(ResponseStatusException.class)
                .isThrownBy(() -> service.createPendingLaunch(
                        SKILLPILOT_ID,
                        new ChatStartRequest("de", "web", "math", null)))
                .satisfies(exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        verify(learnerService).assertActiveLearnerRouteAccess(SKILLPILOT_ID);
        verify(learnerService).getLearner(SKILLPILOT_ID);
        verify(connectionRepository)
                .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullOrderByCreatedAtDesc(
                        SKILLPILOT_ID);
        verify(learnerRepository).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
        verifyNoInteractions(bindingGrantRepository, pendingLaunchRepository);
    }

    private static Learner learner(String skillpilotId, String selectedCurriculum) {
        Learner value = new Learner();
        value.setSkillpilotId(skillpilotId);
        value.setSelectedCurriculum(selectedCurriculum);
        return value;
    }

    private static ClaudeBindingGrant validGrant(Learner learner) {
        ClaudeBindingGrant grant = new ClaudeBindingGrant();
        grant.setTokenHash("persisted-hash");
        grant.setLearner(learner);
        grant.setCreatedAt(Instant.now().minusSeconds(1));
        grant.setExpiresAt(Instant.now().plusSeconds(60));
        return grant;
    }

    private static ClaudeConnection connection(String subject, Learner learner) {
        ClaudeConnection connection = new ClaudeConnection();
        connection.setSubject(subject);
        connection.setLearner(learner);
        connection.setCreatedAt(Instant.now().minusSeconds(10));
        return connection;
    }

    private static String hmac(String value) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SIGNING_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
    }
}
