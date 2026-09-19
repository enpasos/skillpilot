package com.skillpilot.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.ChampionTrialRequest;
import com.skillpilot.backend.api.ChampionTrialStatus;
import com.skillpilot.backend.domain.CurriculumChampion;
import com.skillpilot.backend.landscape.LearningGoal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** Derives trial state from existing assignment and completion evidence; no parallel mastery state. */
@Service
public class ChampionTrialService {
    private final LearnerGoalCompletionService completions;
    private final ChampionPracticeFingerprint fingerprints;
    private final ObjectMapper mapper;

    public ChampionTrialService(LearnerGoalCompletionService completions,
            ChampionPracticeFingerprint fingerprints, ObjectMapper mapper) {
        this.completions = completions;
        this.fingerprints = fingerprints;
        this.mapper = mapper;
    }

    public record Scope(String context, String label, boolean fullCoverage, Map<String, LearningGoal> goals,
                        boolean coreReady, int blockingFindings, boolean findingsAvailable) {
        public Scope(String context, String label, boolean fullCoverage, Map<String, LearningGoal> goals,
                boolean coreReady, int blockingFindings) {
            this(context, label, fullCoverage, goals, coreReady, blockingFindings, true);
        }
    }

    private record Evaluation(ChampionTrialStatus status, String digest) {}

    public ChampionTrialStatus status(CurriculumChampion champion, Scope scope) {
        return evaluate(champion, scope).status();
    }

    private Evaluation evaluate(CurriculumChampion champion, Scope scope) {
        Map<String, String> expected = expected(scope);
        Set<String> practiced = new java.util.HashSet<>();
        for (var completion : completions.getPracticeHistory(champion.getSkillpilotId())) {
            if (completion.getPracticeEvidence().stream().anyMatch(evidence ->
                    Set.of("coach_learning", "verified_recall").contains(evidence.source())
                    && evidence.recordedAt() != null && evidence.fingerprint() != null
                    && evidence.fingerprint().equals(expected.get(completion.getGoalId())))) {
                practiced.add(completion.getGoalId());
            }
        }
        boolean completeCoverage = !scope.goals().isEmpty() && expected.size() == scope.goals().size()
                && practiced.containsAll(scope.goals().keySet());
        boolean eligible = scope.coreReady() && scope.findingsAvailable()
                && scope.blockingFindings() == 0 && completeCoverage;
        String digest = scopeDigest(scope, expected);
        boolean confirmed = confirmations(champion).containsKey(digest);
        boolean started = champion.getTrialStartedAt() != null;
        boolean active = started && champion.getTrialPausedAt() == null && champion.getAssignmentEndedAt() == null;
        String state = started && eligible && confirmed ? "completed"
                : champion.getTrialConfirmationsJson() != null && !confirmations(champion).isEmpty() ? "stale"
                : !started ? "not_started"
                : active && scope.coreReady() ? "in_progress" : "paused";
        // A resumed extension with historical confirmation is actively being tried again.
        if ("stale".equals(state) && active && scope.coreReady()) state = "in_progress";
        return new Evaluation(new ChampionTrialStatus(state, scope.label(), scope.fullCoverage() ? "full" : "partial",
                scope.goals().size(), practiced.size(), scope.blockingFindings(),
                !started && champion.getAssignmentEndedAt() == null && scope.coreReady() && !scope.goals().isEmpty(),
                active && eligible && !confirmed, scope.findingsAvailable()), digest);
    }

    public void apply(CurriculumChampion champion, Scope scope, ChampionTrialRequest request) {
        if (request == null || request.action() == null) bad("Trial action required");
        if (champion.getAssignmentEndedAt() != null) conflict("Champion assignment has ended");
        Evaluation evaluation = evaluate(champion, scope);
        ChampionTrialStatus status = evaluation.status();
        switch (request.action()) {
            case "start" -> {
                if (!status.canStart()) conflict("Trial requires a nonempty named scope and core QA level M5");
                champion.setTrialScopeJson(scope.context());
                champion.setTrialStartedAt(Instant.now());
                champion.setTrialPausedAt(null);
            }
            case "pause" -> {
                if (champion.getTrialStartedAt() == null) conflict("Trial has not started");
                champion.setTrialPausedAt(Instant.now());
            }
            case "resume" -> {
                if (champion.getTrialStartedAt() == null || !scope.coreReady()) conflict("Trial cannot resume");
                champion.setTrialPausedAt(null);
            }
            case "complete" -> {
                if (!Boolean.TRUE.equals(request.confirmed())) bad("Explicit trial completion confirmation required");
                if ("completed".equals(status.state())) return;
                if (!status.canComplete()) conflict("Complete practical coverage and no known blocking findings required");
                Map<String, String> confirmations = new LinkedHashMap<>(confirmations(champion));
                confirmations.put(evaluation.digest(), Instant.now().toString());
                try {
                    champion.setTrialConfirmationsJson(mapper.writeValueAsString(confirmations));
                    // Further curriculum changes require an explicit resumption, not a permanent running label.
                    champion.setTrialPausedAt(Instant.now());
                } catch (Exception exception) {
                    throw new IllegalStateException("Cannot persist trial confirmation", exception);
                }
            }
            default -> bad("Unknown trial action");
        }
    }

    private Map<String, String> expected(Scope scope) {
        Map<String, String> result = new TreeMap<>();
        scope.goals().forEach((id, goal) -> {
            String fingerprint = fingerprints.forGoal(goal);
            if (fingerprint != null) result.put(id, fingerprint);
        });
        return result;
    }

    private String scopeDigest(Scope scope, Map<String, String> expected) {
        try {
            return ChampionPracticeFingerprint.digest(scope.context() + "\n" + mapper.writeValueAsString(expected));
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private Map<String, String> confirmations(CurriculumChampion champion) {
        if (champion.getTrialConfirmationsJson() == null) return Map.of();
        try {
            return mapper.readValue(champion.getTrialConfirmationsJson(), new TypeReference<Map<String, String>>() {});
        } catch (Exception exception) {
            // Corrupt evidence is not an approval.
            return Map.of();
        }
    }

    private static void bad(String reason) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, reason); }
    private static void conflict(String reason) { throw new ResponseStatusException(HttpStatus.CONFLICT, reason); }
}
