package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.Learner;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearnerRepository extends JpaRepository<Learner, String> {
}
