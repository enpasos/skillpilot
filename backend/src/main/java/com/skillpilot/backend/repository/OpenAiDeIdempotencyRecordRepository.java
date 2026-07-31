package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.OpenAiDeIdempotencyKey;
import com.skillpilot.backend.domain.OpenAiDeIdempotencyRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpenAiDeIdempotencyRecordRepository
        extends JpaRepository<OpenAiDeIdempotencyRecord, OpenAiDeIdempotencyKey> {
}
