package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerClientStateId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearnerClientStateRepository extends JpaRepository<LearnerClientState, LearnerClientStateId> {
}
