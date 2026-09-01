package com.skillpilot.backend.service;

import com.skillpilot.backend.api.LearnerRetentionResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.ClaudeConnectionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeConnectionRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;
import java.util.function.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

/** Owns the complete active-database lifecycle of a pseudonymous learner. */
@Service
public class LearnerLifecycleService {

    public static final Duration RETENTION_PERIOD = Duration.ofDays(365);

    private final LearnerRepository learners;
    private final ClaudeConnectionRepository claudeConnections;
    private final OpenAiDeConnectionRepository legacyOpenAiConnections;
    private final JdbcOperations jdbc;
    private final SseService sse;
    private final Clock clock;

    @Autowired
    public LearnerLifecycleService(
            LearnerRepository learners,
            ClaudeConnectionRepository claudeConnections,
            OpenAiDeConnectionRepository legacyOpenAiConnections,
            JdbcOperations jdbc,
            SseService sse) {
        this(learners, claudeConnections, legacyOpenAiConnections, jdbc, sse, Clock.systemUTC());
    }

    LearnerLifecycleService(
            LearnerRepository learners,
            ClaudeConnectionRepository claudeConnections,
            OpenAiDeConnectionRepository legacyOpenAiConnections,
            JdbcOperations jdbc,
            SseService sse,
            Clock clock) {
        this.learners = learners;
        this.claudeConnections = claudeConnections;
        this.legacyOpenAiConnections = legacyOpenAiConnections;
        this.jdbc = jdbc;
        this.sse = sse;
        this.clock = clock;
    }

    @Transactional
    public LearnerRetentionResponse resume(String skillpilotId) {
        Learner learner = requireLearnerForUpdate(skillpilotId);
        touch(learner, clock.instant());
        return response(learner);
    }

    @Transactional(readOnly = true)
    public LearnerRetentionResponse retention(String skillpilotId) {
        Learner learner = learners.findById(requireId(skillpilotId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner not found"));
        return response(learner);
    }

    /**
     * Runs one intentional first-party operation and records activity only if
     * the complete operation succeeds. Nested service transactions join this
     * learner-row lock, so cleanup cannot race past an accepted activity.
     */
    @Transactional
    public <T> T withActivity(String skillpilotId, Supplier<T> operation) {
        return withActivity(skillpilotId, operation, result -> true);
    }

    /**
     * Variant for provider adapters whose protocol returns an error result
     * instead of throwing. Such results commit neither learner-state changes
     * nor retention activity.
     */
    @Transactional
    public <T> T withActivity(
            String skillpilotId,
            Supplier<T> operation,
            Predicate<T> successfulResult) {
        Learner learner = requireLearnerForUpdate(skillpilotId);
        T result = operation.get();
        if (successfulResult.test(result)) {
            touch(learner, clock.instant());
        } else if (TransactionSynchronizationManager.isActualTransactionActive()) {
            // A protocol-level rejection may be returned after nested domain
            // code tentatively changed managed state. Keep the public contract
            // atomic: a rejected operation changes neither learner state nor
            // the retention clock.
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        }
        return result;
    }

    @Transactional
    public void withActivity(String skillpilotId, Runnable operation) {
        withActivity(skillpilotId, () -> {
            operation.run();
            return null;
        });
    }

    /** Touches an already locked learner in the caller's transaction. */
    public void touchLocked(Learner learner) {
        touch(learner, clock.instant());
    }

    @Transactional
    public void deleteConfirmed(String skillpilotId, String confirmationSkillpilotId) {
        String normalized = requireId(skillpilotId);
        if (!normalized.equals(confirmationSkillpilotId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "confirmationSkillpilotId must exactly match the learner being deleted");
        }
        Learner learner = requireLearnerForUpdate(normalized);
        deleteLocked(learner);
    }

    /** Deletes at most one locked batch and returns its exact size. */
    @Transactional
    public int deleteInactiveBatch(int batchSize) {
        if (batchSize < 1) {
            throw new IllegalArgumentException("batchSize must be positive");
        }
        Instant cutoff = clock.instant().minus(RETENTION_PERIOD);
        List<String> ids = learners.findInactiveSkillpilotIdsForUpdate(cutoff, batchSize);
        int deleted = 0;
        for (String id : ids) {
            Learner learner = learners.findBySkillpilotIdForUpdate(id).orElse(null);
            if (learner != null && !learner.getLastActivityAt().isAfter(cutoff)) {
                deleteLocked(learner);
                deleted++;
            }
        }
        return deleted;
    }

    private void deleteLocked(Learner learner) {
        String skillpilotId = learner.getSkillpilotId();
        Set<String> learnerOAuthPrincipals = new LinkedHashSet<>();
        learnerOAuthPrincipals.addAll(
                claudeConnections.findSubjectsByLearnerSkillpilotId(skillpilotId));
        learnerOAuthPrincipals.addAll(
                legacyOpenAiConnections.findSubjectsByLearnerSkillpilotId(skillpilotId));

        for (String principal : learnerOAuthPrincipals) {
            jdbc.update("DELETE FROM oauth2_authorization WHERE principal_name = ?", principal);
            jdbc.update("DELETE FROM oauth2_authorization_consent WHERE principal_name = ?", principal);
        }

        // The first production learner tables predate Liquibase and can have
        // installation-specific foreign-key names. Delete their rows directly
        // instead of relying on a constraint-renaming migration.
        jdbc.update("DELETE FROM learner_copy_sources WHERE learner_id = ?", skillpilotId);
        jdbc.update("DELETE FROM mastery WHERE skillpilot_id = ?", skillpilotId);
        jdbc.update("DELETE FROM planned_goal WHERE skillpilot_id = ?", skillpilotId);
        jdbc.update("DELETE FROM curriculum_champion WHERE skillpilot_id = ?", skillpilotId);
        jdbc.update("DELETE FROM learner_client_state WHERE skillpilot_id = ?", skillpilotId);
        jdbc.update("DELETE FROM learner_learning_plan WHERE learner_id = ?", skillpilotId);

        // A deleted ID must not remain as provenance on a different learner.
        learners.deleteInboundCopySourceReferences(skillpilotId);
        learners.delete(learner);
        learners.flush();
        afterCommit(() -> sse.forgetLearner(skillpilotId));
    }

    private Learner requireLearnerForUpdate(String skillpilotId) {
        return learners.findBySkillpilotIdForUpdate(requireId(skillpilotId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner not found"));
    }

    private static String requireId(String skillpilotId) {
        if (skillpilotId == null || skillpilotId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "skillpilotId must not be empty");
        }
        return skillpilotId;
    }

    private void touch(Learner learner, Instant now) {
        learner.setLastActivityAt(now);
        learners.save(learner);
    }

    private static LearnerRetentionResponse response(Learner learner) {
        Instant lastActivityAt = learner.getLastActivityAt();
        return new LearnerRetentionResponse(
                lastActivityAt,
                lastActivityAt.plus(RETENTION_PERIOD));
    }

    private static void afterCommit(Runnable action) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            action.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
    }
}
