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
        validate(goalId, revision, earnedPoints, maxPoints, passingPoints);
        // The same learner lock serializes assessment writes, retries, restore and learner deletion.
        var learner = learners.findBySkillpilotIdForUpdate(learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown learner."));
        if (!passes.existsByLearner_SkillpilotIdAndGoalIdAndFingerprint(learnerId, goalId, revision.fingerprint())) {
            passes.save(new VerifiedExamPass(learner, goalId, revision.taskRevision(), revision.rubricRevision(),
                    revision.fingerprint(), earnedPoints, maxPoints, passingPoints, Instant.now()));
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
                    && stored.getOrDefault(entry.getKey(), List.of()).containsAll(entry.getValue()))) return;
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "A private archive signing key is required to restore exam receipts.");
        }
        try {
            restoreReceipts(learner, byGoal);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verified exam history.", ex);
        }
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
                var existing = passes.findByLearner_SkillpilotIdAndGoalIdAndFingerprint(
                        learner.getSkillpilotId(), goalId, receipt.fingerprint());
                if (existing.isEmpty()) {
                    passes.save(new VerifiedExamPass(learner, goalId, receipt.taskRevision(), receipt.rubricRevision(),
                            receipt.fingerprint(), receipt.earnedPoints(), receipt.maxPoints(), receipt.passingPoints(),
                            receipt.passedAt()));
                } else {
                    var row = existing.get();
                    if (!row.getTaskRevision().equals(receipt.taskRevision())
                            || !row.getRubricRevision().equals(receipt.rubricRevision())
                            || row.getMaxPoints() != receipt.maxPoints() || row.getPassingPoints() != receipt.passingPoints()) {
                        throw new IllegalArgumentException("Conflicting signed exam material.");
                    }
                    row.retainEarliestPass(receipt.passedAt(), receipt.earnedPoints());
                }
            }
        });
    }

    private static VerifiedExamPassResponse receipt(VerifiedExamPass row) {
        return new VerifiedExamPassResponse(row.getPassedAt(), row.getEarnedPoints(), row.getMaxPoints(),
                row.getPassingPoints(), row.getTaskRevision(), row.getRubricRevision(), row.getFingerprint());
    }

    private static boolean isRevision(String value) {
        return value != null && REVISION.matcher(value).matches();
    }
}
