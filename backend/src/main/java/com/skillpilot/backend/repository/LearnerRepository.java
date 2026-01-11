package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.Learner;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LearnerRepository extends JpaRepository<Learner, String> {
    @Query("select l.createdAt from Learner l")
    List<Instant> findAllCreatedAt();
}
