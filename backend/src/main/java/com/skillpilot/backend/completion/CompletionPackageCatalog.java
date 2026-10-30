package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshot;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Collections;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/** Reads only verified, retained payloads from a loaded package generation. */
public final class CompletionPackageCatalog {
    public static final String CAPABILITY = "assessmentCompletionV1";
    private CompletionPackageCatalog() { }

    public record Documents(Map<String, CompletionProfileDefinition> profiles,
                            Map<String, CompletionScopeDefinition> scopes) {
        public Documents {
            profiles = Collections.unmodifiableMap(new TreeMap<>(profiles));
            scopes = Collections.unmodifiableMap(new TreeMap<>(scopes));
        }
    }

    public static Documents load(CurriculumRuntimeSnapshot snapshot, ObjectMapper mapper) throws Exception {
        ObjectMapper strict = mapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        Map<String, CompletionProfileDefinition> profiles = new TreeMap<>();
        Map<String, CompletionScopeDefinition> scopes = new TreeMap<>();
        Map<String, JsonNode> scopeDocuments = new TreeMap<>();
        Map<String, JsonNode> goals = new TreeMap<>();
        Map<String, Set<String>> reviewsByPackage = new LinkedHashMap<>();
        Map<String, String> profilePackages = new LinkedHashMap<>();
        Set<String> supportingPackages = new LinkedHashSet<>();
        snapshot.packages().stream().filter(p -> p.capabilities().contains(CAPABILITY))
                .forEach(p -> supportingPackages.add(p.packageId()));
        for (var landscape : snapshot.landscapesById().values()) {
            JsonNode document = strict.readTree(landscape.json());
            for (JsonNode goal : document.path("goals")) {
                String id = goal.path("id").asText();
                JsonNode prior = goals.putIfAbsent(id, goal);
                if (prior != null && !prior.equals(goal)) {
                    throw new IllegalArgumentException("Ambiguous packaged canonical goal: " + id);
                }
            }
        }
        for (String role : Set.of("completion-profile", "completion-scope", "completion-rule-review")) {
            for (var artifact : snapshot.artifactsByRole().getOrDefault(role, java.util.List.of())) {
                if (!supportingPackages.contains(artifact.packageId())) {
                    throw new IllegalArgumentException("Completion artifact lacks its package capability");
                }
                JsonNode wrapper = strict.readTree(artifact.contentBytes());
                JsonNode definition = wrapper.path("definition");
                String id = wrapper.path("id").asText();
                if ("completion-rule-review".equals(role)) {
                    String content = definition.path("content").asText();
                    String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                            .digest(content.getBytes(StandardCharsets.UTF_8)));
                    if (!hash.equals(definition.path("sha256").asText())) {
                        throw new IllegalArgumentException("Packaged completion review content hash differs");
                    }
                    reviewsByPackage.computeIfAbsent(artifact.packageId(), p -> new LinkedHashSet<>())
                            .add(artifact.relativePath());
                } else if ("completion-scope".equals(role)) {
                    CompletionScopeDefinition scope = strict.treeToValue(definition, CompletionScopeDefinition.class);
                    if (!id.equals(scope.id()) || scopes.putIfAbsent(id, scope) != null) {
                        throw new IllegalArgumentException("Duplicate packaged completion scope identity");
                    }
                    scopeDocuments.put(id, definition);
                } else {
                    CompletionProfileDefinition profile = strict.treeToValue(definition, CompletionProfileDefinition.class);
                    if (!id.equals(profile.id()) || profiles.putIfAbsent(id, profile) != null) {
                        throw new IllegalArgumentException("Duplicate packaged completion profile identity");
                    }
                    profilePackages.put(id, artifact.packageId());
                }
            }
        }
        Map<String, LearningGoal> graph = new TreeMap<>();
        for (var entry : goals.entrySet()) graph.put(entry.getKey(), strict.treeToValue(entry.getValue(), LearningGoal.class));
        for (CompletionProfileDefinition profile : profiles.values()) {
            CompletionScopeDefinition scope = scopes.get(profile.levelScopeRef());
            if (scope == null) throw new IllegalArgumentException("Packaged completion scope is missing");
            Set<String> reviewPaths = reviewsByPackage.getOrDefault(profilePackages.get(profile.id()), Set.of());
            if (profile.review() == null || !reviewPaths.contains(profile.review().reference())) {
                throw new IllegalArgumentException("Packaged completion review must be local to its package");
            }
            for (var rule : profile.rules()) if (!reviewPaths.contains(rule.reviewRef())) {
                throw new IllegalArgumentException("Packaged waiver rule review must be local to its package");
            }
            CompletionReviewBindings.validate(profile, scope, scopeDocuments.get(scope.id()), goals, strict);
            Set<String> targets = CompletionReviewBindings.targetGoals(scope, goals).keySet();
            new CompletionProfileCompiler().compile(profile, graph, targets, targets, snapshot.generationSha256());
        }
        return new Documents(profiles, scopes);
    }
}
