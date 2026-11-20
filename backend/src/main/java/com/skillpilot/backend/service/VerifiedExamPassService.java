package com.skillpilot.backend.service;

import com.skillpilot.backend.api.LearnerDataDTO;
import com.skillpilot.backend.api.VerifiedExamPassResponse;
import com.skillpilot.backend.completion.AssessmentMaterialRevision;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.VerifiedExamPass;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.VerifiedExamPassRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VerifiedExamPassService {
    private static final Pattern REVISION = Pattern.compile("sha256:[0-9a-f]{64}");
    private final LearnerRepository learners;
    private final VerifiedExamPassRepository passes;

    public VerifiedExamPassService(LearnerRepository learners, VerifiedExamPassRepository passes) {
        this.learners = learners;
        this.passes = passes;
    }

    /** Call after verifying the exam evaluation, inside the transaction that accepts the result. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void record(String learnerId, String goalId, AssessmentMaterialRevision revision,
            double earnedPoints, double maxPoints, double passingPoints) {
        record(learnerId, goalId, revision, earnedPoints, maxPoints, passingPoints, List.of());
    }

    /** Grant only the bindings resolved for this verified evaluation by the caller's idempotent write. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void record(String learnerId, String goalId, AssessmentMaterialRevision revision,
            double earnedPoints, double maxPoints, double passingPoints, Collection<String> planningCreditBindingIds) {
        validate(goalId, revision, earnedPoints, maxPoints, passingPoints);
        validateBindings(planningCreditBindingIds);
        // The same learner lock serializes assessment writes, retries, restore and learner deletion.
        var learner = learners.findBySkillpilotIdForUpdate(learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown learner."));
        var existing = passes.findByLearner_SkillpilotIdAndGoalIdAndFingerprint(learnerId, goalId, revision.fingerprint());
        var pass = existing.orElseGet(() -> passes.save(new VerifiedExamPass(learner, goalId, revision.taskRevision(),
                revision.rubricRevision(), revision.fingerprint(), earnedPoints, maxPoints, passingPoints, Instant.now())));
        requireMatchingMaterial(pass, revision, maxPoints, passingPoints);
        pass.addPlanningCreditBindings(planningCreditBindingIds);
    }

    private static void validateBindings(Collection<String> ids) {
        if (ids == null || ids.stream().anyMatch(id -> !isRevision(id))) {
            throw new IllegalArgumentException("A planning credit requires a versioned binding.");
        }
    }

    private static void requireMatchingMaterial(VerifiedExamPass row, AssessmentMaterialRevision revision,
            double maxPoints, double passingPoints) {
        if (!row.getTaskRevision().equals(revision.taskRevision())
                || !row.getRubricRevision().equals(revision.rubricRevision())
                || row.getMaxPoints() != maxPoints || row.getPassingPoints() != passingPoints) {
            throw new IllegalArgumentException("Conflicting verified exam material.");
        }
    }

    private static void validate(String goalId, AssessmentMaterialRevision revision,
            double earnedPoints, double maxPoints, double passingPoints) {
        if (goalId == null || goalId.isBlank() || goalId.length() > 255 || !goalId.equals(goalId.strip())) {
            throw new IllegalArgumentException("A verified pass requires a valid exam goal ID.");
        }
        if (revision == null || !isRevision(revision.taskRevision()) || !isRevision(revision.rubricRevision())
                || !isRevision(revision.fingerprint())) {
            throw new IllegalArgumentException("A verified pass requires task, rubric and material revisions.");
        }
        if (!Double.isFinite(earnedPoints) || !Double.isFinite(maxPoints) || !Double.isFinite(passingPoints)
                || passingPoints <= 0 || earnedPoints < passingPoints || earnedPoints > maxPoints) {
            throw new IllegalArgumentException("A verified pass requires a passing score within the released rubric.");
        }
    }

    @Transactional(readOnly = true)
    public Optional<VerifiedExamPassResponse> latestForGoal(String learnerId, String goalId) {
        return passes.findFirstByLearner_SkillpilotIdAndGoalIdOrderByPassedAtDescFingerprintAsc(learnerId, goalId)
                .map(VerifiedExamPassService::receipt);
    }

    @Transactional(readOnly = true)
    public List<VerifiedExamPassResponse> findForGoal(String learnerId, String goalId) {
        return passes.findByLearner_SkillpilotIdAndGoalIdOrderByPassedAtDescFingerprintAsc(learnerId, goalId)
                .stream().map(VerifiedExamPassService::receipt).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, List<VerifiedExamPassResponse>> findForGoals(String learnerId, List<String> goalIds) {
        Map<String, List<VerifiedExamPassResponse>> byGoal = new LinkedHashMap<>();
        for (var row : passes.findByLearner_SkillpilotIdAndGoalIdIn(learnerId, goalIds)) {
            byGoal.computeIfAbsent(row.getGoalId(), key -> new ArrayList<>()).add(receipt(row));
        }
        return byGoal;
    }

    @Transactional(readOnly = true)
    public Map<String, List<VerifiedExamPassResponse>> export(String learnerId) {
        Map<String, List<VerifiedExamPassResponse>> byGoal = new LinkedHashMap<>();
        for (var row : passes.findByLearner_SkillpilotIdOrderByGoalIdAscPassedAtDescFingerprintAsc(learnerId)) {
            byGoal.computeIfAbsent(row.getGoalId(), key -> new ArrayList<>()).add(receipt(row));
        }
        return byGoal;
    }

    /** Imports with matching signatures can also be copies from other learners. */
    @Transactional(propagation = Propagation.MANDATORY)
    void restoreOwnArchive(Learner learner, LearnerDataDTO archive, boolean privateSigningKey) {
        var byGoal = archive.verifiedExamPasses();
        String targetId = learner.getSkillpilotId();
        if (byGoal == null || byGoal.isEmpty() || archive.learner() == null
                || !targetId.equals(archive.learner().getSkillpilotId())) return;
        if (!privateSigningKey) {
            // A public development key can acknowledge rows already present, but cannot authenticate a lost receipt.
            var stored = export(targetId);
            if (byGoal.entrySet().stream().allMatch(entry -> entry.getValue() != null
                    && entry.getValue().stream().allMatch(archived -> stored.getOrDefault(entry.getKey(), List.of())
                            .stream().anyMatch(existing -> alreadyRecorded(existing, archived))))) return;
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "A private archive signing key is required to restore exam receipts.");
        }
        try {
            restoreReceipts(learner, byGoal);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verified exam history.", ex);
        }
    }

    private static boolean alreadyRecorded(VerifiedExamPassResponse existing, VerifiedExamPassResponse archived) {
        return archived != null && existing.planningCreditBindingIds().containsAll(archived.planningCreditBindingIds())
                && new VerifiedExamPassResponse(existing.passedAt(), existing.earnedPoints(), existing.maxPoints(),
                        existing.passingPoints(), existing.taskRevision(), existing.rubricRevision(), existing.fingerprint(),
                        archived.planningCreditBindingIds()).equals(archived);
    }

    private void restoreReceipts(Learner learner, Map<String, List<VerifiedExamPassResponse>> byGoal) {
        byGoal.forEach((goalId, receipts) -> {
            if (receipts == null) throw new IllegalArgumentException("Missing exam receipts.");
            for (var receipt : receipts) {
                if (receipt == null || receipt.passedAt() == null) {
                    throw new IllegalArgumentException("An exam receipt requires its historical passing date.");
                }
                var revision = new AssessmentMaterialRevision(
                        receipt.taskRevision(), receipt.rubricRevision(), receipt.fingerprint());
                validate(goalId, revision, receipt.earnedPoints(), receipt.maxPoints(), receipt.passingPoints());
                validateBindings(receipt.planningCreditBindingIds());
                var existing = passes.findByLearner_SkillpilotIdAndGoalIdAndFingerprint(
                        learner.getSkillpilotId(), goalId, receipt.fingerprint());
                var row = existing.orElseGet(() -> passes.save(new VerifiedExamPass(learner, goalId, receipt.taskRevision(),
                        receipt.rubricRevision(), receipt.fingerprint(), receipt.earnedPoints(), receipt.maxPoints(),
                        receipt.passingPoints(), receipt.passedAt())));
                requireMatchingMaterial(row, revision, receipt.maxPoints(), receipt.passingPoints());
                row.retainEarliestPass(receipt.passedAt(), receipt.earnedPoints());
                row.addPlanningCreditBindings(receipt.planningCreditBindingIds());
            }
        });
    }

    private static VerifiedExamPassResponse receipt(VerifiedExamPass row) {
        return new VerifiedExamPassResponse(row.getPassedAt(), row.getEarnedPoints(), row.getMaxPoints(),
                row.getPassingPoints(), row.getTaskRevision(), row.getRubricRevision(), row.getFingerprint(),
                row.getPlanningCreditBindingIds());
    }

    private static boolean isRevision(String value) {
        return value != null && REVISION.matcher(value).matches();
    }
}
