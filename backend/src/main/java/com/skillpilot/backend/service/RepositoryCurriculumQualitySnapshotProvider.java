package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.service.CurriculumQualitySnapshotProvider.CurriculumQualityEntry;
import com.skillpilot.backend.service.CurriculumQualitySnapshotProvider.CurriculumQualitySnapshot;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Loads the authoring-repository QA status for repository-backed curriculum runtime mode. */
@Component
@ConditionalOnProperty(
        prefix = "skillpilot.curriculum",
        name = "source",
        havingValue = "repository",
        matchIfMissing = true)
public final class RepositoryCurriculumQualitySnapshotProvider implements CurriculumQualitySnapshotProvider {

    private static final Logger log = LoggerFactory.getLogger(RepositoryCurriculumQualitySnapshotProvider.class);
    private static final String CANONICAL_GYMNASIUM_OVERVIEW_FRAMEWORK_ID = "canonical-gymnasium-overview";
    private static final String CANONICAL_GYMNASIUM_FRAMEWORK_PREFIX = "canonical-gymnasium";
    private static final List<Path> DEFAULT_STATUS_PATHS = List.of(
            Path.of("docs", "qa-ci", "status", "curriculum-quality-status.json"),
            Path.of("..", "docs", "qa-ci", "status", "curriculum-quality-status.json"));

    private final ObjectMapper objectMapper;
    private final List<Path> statusPaths;

    @Autowired
    public RepositoryCurriculumQualitySnapshotProvider(ObjectMapper objectMapper) {
        this(objectMapper, DEFAULT_STATUS_PATHS);
    }

    RepositoryCurriculumQualitySnapshotProvider(ObjectMapper objectMapper, List<Path> statusPaths) {
        this.objectMapper = objectMapper;
        this.statusPaths = List.copyOf(statusPaths);
    }

    @Override
    public CurriculumQualitySnapshot load() {
        Path statusPath = statusPaths.stream()
                .filter(Files::isRegularFile)
                .findFirst()
                .orElse(null);
        if (statusPath == null) {
            return CurriculumQualitySnapshot.empty();
        }

        try {
            JsonNode root = objectMapper.readTree(statusPath.toFile());
            JsonNode curricula = root.path("curricula");
            if (!curricula.isArray()) {
                return CurriculumQualitySnapshot.empty();
            }

            Map<String, CurriculumQualityEntry> byLandscapeId = new LinkedHashMap<>();
            Map<String, CurriculumQualityEntry> canonicalSubjects = new LinkedHashMap<>();
            for (JsonNode curriculum : curricula) {
                String landscapeId = text(curriculum, "landscapeId");
                String subject = text(curriculum, "subject");
                String maturity = text(curriculum, "maturity");
                if (landscapeId == null || subject == null || maturity == null) {
                    continue;
                }

                CurriculumQualityEntry entry = new CurriculumQualityEntry(
                        landscapeId,
                        subject,
                        maturity,
                        curriculum.path("goals").asLong(0),
                        curriculum.path("atomicGoals").asLong(0),
                        countRuleStatus(curriculum, "warn"),
                        countRuleStatus(curriculum, "fail"));
                byLandscapeId.put(landscapeId, entry);

                String frameworkId = text(curriculum, "frameworkId");
                if (frameworkId != null
                        && frameworkId.startsWith(CANONICAL_GYMNASIUM_FRAMEWORK_PREFIX)
                        && !CANONICAL_GYMNASIUM_OVERVIEW_FRAMEWORK_ID.equals(frameworkId)) {
                    canonicalSubjects.put(normalizeSubject(subject), entry);
                }
            }

            return new CurriculumQualitySnapshot(
                    Collections.unmodifiableMap(byLandscapeId),
                    Collections.unmodifiableMap(canonicalSubjects));
        } catch (Exception e) {
            log.warn("Failed to load curriculum quality status from {}", statusPath, e);
            return CurriculumQualitySnapshot.empty();
        }
    }

    private int countRuleStatus(JsonNode curriculum, String status) {
        int count = countRuleStatusInArray(curriculum.path("rules"), status);
        JsonNode scopes = curriculum.path("scopes");
        if (scopes.isArray()) {
            for (JsonNode scope : scopes) {
                count += countRuleStatusInArray(scope.path("rules"), status);
            }
        }
        return count;
    }

    private int countRuleStatusInArray(JsonNode rules, String status) {
        if (!rules.isArray()) {
            return 0;
        }
        int count = 0;
        for (JsonNode rule : rules) {
            if (status.equals(text(rule, "status"))) {
                count++;
            }
        }
        return count;
    }

    private String text(JsonNode node, String fieldName) {
        JsonNode value = node.path(fieldName);
        if (!value.isTextual()) {
            return null;
        }
        String text = value.asText().trim();
        return text.isEmpty() ? null : text;
    }

    private String normalizeSubject(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
