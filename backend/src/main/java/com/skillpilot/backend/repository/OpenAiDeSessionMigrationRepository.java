package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.OpenAiDeSessionMigration;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpenAiDeSessionMigrationRepository
        extends JpaRepository<OpenAiDeSessionMigration, String> {

    Optional<OpenAiDeSessionMigration> findBySourceTokenHashAndTargetContractMajor(
            String sourceTokenHash,
            int targetContractMajor);
}
