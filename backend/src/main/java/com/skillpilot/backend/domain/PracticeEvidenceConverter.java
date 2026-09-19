package com.skillpilot.backend.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Compact append-only practice provenance within an existing completion ledger row. */
@Converter
public class PracticeEvidenceConverter implements AttributeConverter<List<LearnerGoalCompletion.PracticeEvidence>, String> {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<LearnerGoalCompletion.PracticeEvidence> values) {
        if (values == null || values.isEmpty()) return null;
        try {
            return MAPPER.writeValueAsString(values.stream().map(value -> Map.of(
                    "source", value.source(), "fingerprint", value.fingerprint(), "recordedAt", value.recordedAt().toString())).toList());
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid practice evidence", exception);
        }
    }

    @Override
    public List<LearnerGoalCompletion.PracticeEvidence> convertToEntityAttribute(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            var root = MAPPER.readTree(json);
            if (!root.isArray()) return new ArrayList<>();
            List<LearnerGoalCompletion.PracticeEvidence> result = new ArrayList<>();
            for (var entry : root) {
                String source = entry.path("source").asText();
                String fingerprint = entry.path("fingerprint").asText();
                if ((!"coach_learning".equals(source) && !"verified_recall".equals(source))
                        || !fingerprint.matches("[0-9a-f]{64}")) return new ArrayList<>();
                result.add(new LearnerGoalCompletion.PracticeEvidence(source, fingerprint,
                        Instant.parse(entry.path("recordedAt").asText())));
            }
            return result;
        } catch (Exception exception) {
            return new ArrayList<>(); // Malformed provenance never grants practice approval.
        }
    }
}
