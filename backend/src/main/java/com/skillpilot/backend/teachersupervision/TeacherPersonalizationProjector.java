package com.skillpilot.backend.teachersupervision;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.ScopeProjection;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.SubjectProjection;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/** Converts private Level-2 JSON into a deliberately small teacher-facing projection. */
final class TeacherPersonalizationProjector {

    record Projection(
            String fingerprint,
            String rootLandscapeId,
            ScopeProjection scope,
            List<SubjectProjection> subjects) {
    }

    private final ObjectMapper objectMapper;
    private final LandscapeService landscapeService;

    TeacherPersonalizationProjector(ObjectMapper objectMapper, LandscapeService landscapeService) {
        this.objectMapper = objectMapper;
        this.landscapeService = landscapeService;
    }

    Projection project(Learner learner) {
        String raw = learner.getPersonalCurriculum();
        JsonNode config = parseObject(raw);
        JsonNode wrappedConfig = config.get("personalCurriculum");
        if (wrappedConfig != null && wrappedConfig.isObject()) {
            config = wrappedConfig;
        }
        String rootLandscapeId = clean(learner.getSelectedCurriculum());
        JsonNode rootConfig = rootLandscapeId == null ? null : config.path(rootLandscapeId);
        String jurisdiction = text(rootConfig, "filterId");
        String durationModel = text(rootConfig, "durationModel");
        String stage = text(rootConfig, "stage");
        ScopeProjection scope = new ScopeProjection(jurisdiction, durationModel, stage);

        List<SubjectProjection> subjects = selectedSubjects(
                config,
                rootLandscapeId,
                jurisdiction,
                durationModel,
                stage);
        if (subjects.isEmpty() && rootLandscapeId != null && selected(rootConfig)) {
            SkillLandscape rootLandscape = landscapeService.getById(rootLandscapeId);
            if (rootLandscape != null) {
                subjects = List.of(subjectProjection(
                        rootLandscape,
                        rootConfig,
                        jurisdiction,
                        durationModel,
                        stage));
            }
        }
        subjects = subjects.stream()
                .sorted(Comparator.comparing(SubjectProjection::landscapeId))
                .toList();
        return new Projection(
                projectionFingerprint(rootLandscapeId, scope, subjects),
                rootLandscapeId,
                scope,
                List.copyOf(subjects));
    }

    private List<SubjectProjection> selectedSubjects(
            JsonNode config,
            String rootLandscapeId,
            String jurisdiction,
            String durationModel,
            String stage) {
        List<SubjectProjection> subjects = new ArrayList<>();
        Iterator<Map.Entry<String, JsonNode>> fields = config.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            if (entry.getKey().equals(rootLandscapeId) || !selected(entry.getValue())) {
                continue;
            }
            SkillLandscape landscape = landscapeService.getById(entry.getKey());
            if (landscape == null) {
                continue;
            }
            subjects.add(subjectProjection(
                    landscape,
                    entry.getValue(),
                    jurisdiction,
                    durationModel,
                    stage));
        }
        return subjects;
    }

    private SubjectProjection subjectProjection(
            SkillLandscape landscape,
            JsonNode subjectConfig,
            String jurisdiction,
            String rootDurationModel,
            String rootStage) {
        return new SubjectProjection(
                landscape.getLandscapeId(),
                clean(landscape.getSubject()),
                first(
                        clean(landscape.getTitle()),
                        first(clean(landscape.getSubject()), landscape.getLandscapeId())),
                text(subjectConfig, "filterId"),
                jurisdiction,
                first(text(subjectConfig, "durationModel"), rootDurationModel),
                first(text(subjectConfig, "stage"), rootStage));
    }

    private JsonNode parseObject(String raw) {
        if (raw == null || raw.isBlank()) {
            return objectMapper.createObjectNode();
        }
        try {
            JsonNode parsed = objectMapper.readTree(raw);
            return parsed != null && parsed.isObject() ? parsed : objectMapper.createObjectNode();
        } catch (Exception ignored) {
            return objectMapper.createObjectNode();
        }
    }

    private static boolean selected(JsonNode node) {
        return node != null && node.isObject() && node.path("selected").asBoolean(false);
    }

    private static String text(JsonNode node, String field) {
        if (node == null || !node.isObject()) {
            return null;
        }
        JsonNode value = node.get(field);
        return value != null && value.isTextual() ? clean(value.asText()) : null;
    }

    private static String first(String preferred, String fallback) {
        return preferred != null ? preferred : fallback;
    }

    private static String projectionFingerprint(
            String rootLandscapeId,
            ScopeProjection scope,
            List<SubjectProjection> subjects) {
        StringBuilder canonical = new StringBuilder("teacher-personalization-v1");
        append(canonical, rootLandscapeId);
        append(canonical, scope.jurisdiction());
        append(canonical, scope.durationModel());
        append(canonical, scope.stage());
        for (SubjectProjection subject : subjects) {
            append(canonical, subject.landscapeId());
            append(canonical, subject.filterId());
            append(canonical, subject.jurisdiction());
            append(canonical, subject.durationModel());
            append(canonical, subject.stage());
        }
        return "sha256:" + TeacherSupervisionTokenCodec.sha256(canonical.toString());
    }

    private static void append(StringBuilder target, String value) {
        String normalized = value == null ? "" : value;
        target.append('|').append(normalized.length()).append(':').append(normalized);
    }

    private static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
