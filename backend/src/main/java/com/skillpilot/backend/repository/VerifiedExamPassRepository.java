package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.VerifiedExamPass;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerifiedExamPassRepository extends JpaRepository<VerifiedExamPass, UUID> {
    boolean existsByLearner_SkillpilotIdAndGoalIdAndFingerprint(String learnerId, String goalId, String fingerprint);

    Optional<VerifiedExamPass> findFirstByLearner_SkillpilotIdAndGoalIdOrderByPassedAtDescFingerprintAsc(
            String learnerId, String goalId);

    Optional<VerifiedExamPass> findByLearner_SkillpilotIdAndGoalIdAndFingerprint(
            String learnerId, String goalId, String fingerprint);

    List<VerifiedExamPass> findByLearner_SkillpilotIdOrderByGoalIdAscPassedAtDescFingerprintAsc(String learnerId);

    List<VerifiedExamPass> findByLearner_SkillpilotIdAndGoalIdOrderByPassedAtDescFingerprintAsc(
            String learnerId, String goalId);

    List<VerifiedExamPass> findByLearner_SkillpilotIdAndGoalIdIn(String learnerId, List<String> goalIds);
}
