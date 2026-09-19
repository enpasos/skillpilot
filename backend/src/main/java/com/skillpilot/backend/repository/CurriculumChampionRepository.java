package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.CurriculumChampion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurriculumChampionRepository extends JpaRepository<CurriculumChampion, String> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select c from CurriculumChampion c where c.id = :id")
    Optional<CurriculumChampion> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") String id);

    List<CurriculumChampion> findByCurriculumIdOrderByCreatedAtAsc(String curriculumId);

    List<CurriculumChampion> findAllByCurriculumIdAndGithubId(String curriculumId, String githubId);

    Optional<CurriculumChampion> findByCurriculumIdAndTopicIdAndGithubId(String curriculumId, String topicId,
            String githubId);

    Optional<CurriculumChampion> findByCurriculumIdAndSkillpilotId(String curriculumId, String skillpilotId);

    Optional<CurriculumChampion> findByCurriculumIdAndTopicIdAndSkillpilotId(String curriculumId, String topicId,
            String skillpilotId);

    List<CurriculumChampion> findByGithubId(String githubId);
}
