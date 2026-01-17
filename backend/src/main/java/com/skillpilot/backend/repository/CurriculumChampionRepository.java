package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.CurriculumChampion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurriculumChampionRepository extends JpaRepository<CurriculumChampion, String> {
    List<CurriculumChampion> findByCurriculumIdOrderByCreatedAtAsc(String curriculumId);

    Optional<CurriculumChampion> findByCurriculumIdAndGithubId(String curriculumId, String githubId);

    Optional<CurriculumChampion> findByCurriculumIdAndSkillpilotId(String curriculumId, String skillpilotId);

    List<CurriculumChampion> findByGithubId(String githubId);
}
