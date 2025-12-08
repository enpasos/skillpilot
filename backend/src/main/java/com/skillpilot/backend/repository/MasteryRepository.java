package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MasteryRepository extends JpaRepository<Mastery, MasteryId> {
    List<Mastery> findByLearner_SkillpilotId(String skillpilotId);
}
