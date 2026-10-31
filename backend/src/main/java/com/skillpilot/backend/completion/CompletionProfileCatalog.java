package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.PrunedFileTree;
import com.skillpilot.backend.service.DeckResourceService;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Collections;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.ObjectProvider;
import com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshotProvider;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Pinned curriculum generation; authored profiles remain available to historical validation only. */
@Component
public class CompletionProfileCatalog {
    private final boolean enabled;
    private final boolean automatic;
    private final Map<String, CompletionProfileDefinition> profiles;
    private final Map<String, CompletionScopeDefinition> scopes;
    private final Path root;
    private final Map<Path, Stamp> stamps;
    private final String generation;
    private volatile boolean available;

    @Autowired
    public CompletionProfileCatalog(
            LandscapeProperties properties, ObjectMapper objectMapper,
            LandscapeService landscapes, GoalMappingService mappings, DeckResourceService decks,
            @Value("${skillpilot.completion.enabled:true}") boolean enabled,
            @Value("${skillpilot.completion.enabled-profile-ids:}") String allowedProfiles,
            @Value("${skillpilot.curriculum.source:repository}") String source,
            ObjectProvider<CurriculumRuntimeSnapshotProvider> packageSnapshots) {
        this(properties, objectMapper, landscapes, mappings, decks, enabled, allowedProfiles, source,
                packageSnapshots, true);
    }

    private CompletionProfileCatalog(LandscapeProperties properties, ObjectMapper objectMapper,
            LandscapeService landscapes, GoalMappingService mappings, DeckResourceService decks,
            boolean enabled, String allowedProfiles, String source,
            ObjectProvider<CurriculumRuntimeSnapshotProvider> packageSnapshots, boolean automatic) {
        this.enabled = enabled;
        this.automatic = automatic;
        this.root = "repository".equals(source)
                ? Path.of(properties.getDirectory()).toAbsolutePath().normalize() : null;
        if (!enabled) {
            profiles = Map.of(); scopes = Map.of(); stamps = Map.of(); generation = "disabled";
            available = false;
            return;
        }
        if ("package".equals(source)) {
            CurriculumRuntimeSnapshotProvider provider = packageSnapshots == null ? null : packageSnapshots.getIfAvailable();
            if (provider == null) throw new IllegalStateException("Completion requires the active package snapshot");
            try {
                var snapshot = provider.current();
                if (automatic) {
                    // The package loader has already verified the immutable graph
                    // generation. Automatic demand needs no completion extension.
                    profiles = Map.of();
                    scopes = Map.of();
                } else {
                    var documents = CompletionPackageCatalog.load(snapshot, objectMapper);
                    Map<String, CompletionProfileDefinition> allowed = new TreeMap<>(documents.profiles());
                    Set<String> selected = allowedProfileIds(allowedProfiles);
                    if (!allowed.keySet().containsAll(selected)) {
                        throw new IllegalArgumentException("Unknown allowlisted packaged completion profile");
                    }
                    if (!selected.isEmpty()) allowed.keySet().retainAll(selected);
                    profiles = Collections.unmodifiableMap(allowed);
                    scopes = documents.scopes();
                }
                stamps = Map.of();
                generation = snapshot.generationSha256();
                available = automatic ? !snapshot.packages().isEmpty() : snapshot.packages().stream()
                        .anyMatch(p -> p.capabilities().contains(CompletionPackageCatalog.CAPABILITY));
            } catch (Exception e) {
                throw new IllegalStateException("Cannot initialize packaged completion catalog", e);
            }
            return;
        }
        if (!"repository".equals(source)) throw new IllegalArgumentException("Unknown curriculum source");
        try {
            // Capture before parsing. Reading a profile first and hashing it later can
            // otherwise associate old parsed data with a new source generation.
            Map<Path, Input> captured = capture(runtimeInputs());
            Map<String, CompletionScopeDefinition> loadedScopes = Map.of();
            Map<String, CompletionProfileDefinition> loadedProfiles = Map.of();
            if (!automatic) {
                ObjectMapper strictMapper = objectMapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
                Map<String, Path> scopePaths = new TreeMap<>();
                loadedScopes = load(root.resolve("DE/Gymnasium/completion-scopes"), captured, scopePaths, strictMapper,
                        CompletionScopeDefinition.class, CompletionScopeDefinition::id);
                loadedProfiles = load(root.resolve("DE/Gymnasium/completion-profiles"), captured, new TreeMap<>(), strictMapper,
                        CompletionProfileDefinition.class, CompletionProfileDefinition::id);
                Set<String> allowed = allowedProfileIds(allowedProfiles);
                if (!loadedProfiles.keySet().containsAll(allowed)) {
                    throw new IllegalArgumentException("Unknown allowlisted completion profile");
                }
                if (!allowed.isEmpty()) loadedProfiles.keySet().retainAll(allowed);
                if (loadedProfiles.isEmpty()) {
                    profiles = Map.of(); scopes = Map.of(); stamps = Map.of(); generation = "no-completion-profiles";
                    available = false;
                    return;
                }
                Map<String, JsonNode> goalInputs = goalInputs(captured, strictMapper);
                for (CompletionProfileDefinition definition : loadedProfiles.values()) {
                    CompletionScopeDefinition scope = loadedScopes.get(definition.levelScopeRef());
                    if (scope == null) {
                        throw new IllegalArgumentException("Unresolved completion scope: " + definition.levelScopeRef());
                    }
                    if (definition.review() == null) throw new IllegalArgumentException("Missing completion review");
                    captureReview(definition.review().reference(), captured);
                    for (var rule : definition.rules()) captureReview(rule.reviewRef(), captured);
                    validateReviewBindings(definition, scope, captured.get(scopePaths.get(scope.id())).bytes(),
                            goalInputs, strictMapper);
                }
            }
            // Pin methods force a fresh reload, bypassing ordinary two-second checks.
            // This startup publication stays unavailable if any input changes meanwhile.
            mappings.pinRuntimeGeneration();
            landscapes.pinRuntimeGeneration();
            decks.pinRuntimeGeneration();
            verifyUnchanged(captured);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            Map<Path, Stamp> observed = new LinkedHashMap<>();
            for (var entry : captured.entrySet()) {
                Path input = entry.getKey();
                digest.update(root.relativize(input).toString().replace('\\', '/').getBytes(StandardCharsets.UTF_8));
                digest.update((byte) 0);
                digest.update(entry.getValue().bytes());
                digest.update((byte) 0);
                observed.put(input, entry.getValue().stamp());
            }
            profiles = Collections.unmodifiableMap(loadedProfiles);
            scopes = Collections.unmodifiableMap(loadedScopes);
            generation = HexFormat.of().formatHex(digest.digest());
            stamps = Collections.unmodifiableMap(observed);
            available = true;
        } catch (Exception e) {
            throw new IllegalStateException(automatic ? "Cannot initialize automatic completion generation"
                    : "Cannot initialize reviewed completion catalog", e);
        }
    }

    /** Historical repository authoring fixture; production uses the automatic constructor above. */
    public CompletionProfileCatalog(LandscapeProperties properties, ObjectMapper objectMapper,
            LandscapeService landscapes, GoalMappingService mappings, DeckResourceService decks,
            boolean enabled, String allowedProfiles, String source) {
        this(properties, objectMapper, landscapes, mappings, decks, enabled, allowedProfiles, source, null, false);
    }

    private static Set<String> allowedProfileIds(String value) {
        Set<String> ids = new LinkedHashSet<>();
        Arrays.stream(value.split(",")).map(String::trim).filter(s -> !s.isEmpty()).forEach(ids::add);
        return ids;
    }

    /** Test fixture constructor; production always uses the configured generation above. */
    public CompletionProfileCatalog(Map<String, CompletionProfileDefinition> profiles,
            Map<String, CompletionScopeDefinition> scopes, String generation) {
        this(profiles, scopes, generation, false);
    }

    /** Explicit automatic-generation fixture; the three-argument fixture preserves historical profile tests. */
    public CompletionProfileCatalog(Map<String, CompletionProfileDefinition> profiles,
            Map<String, CompletionScopeDefinition> scopes, String generation, boolean automatic) {
        this.enabled = true; this.root = null; this.stamps = Map.of();
        this.automatic = automatic;
        this.profiles = Map.copyOf(profiles); this.scopes = Map.copyOf(scopes);
        this.generation = generation; this.available = true;
    }

    public boolean enabled() { return enabled; }
    public boolean automatic() { return automatic; }
    public boolean available() { return available; }
    public String generation() { return generation; }
    public Map<String, CompletionProfileDefinition> profiles() { return profiles; }
    public CompletionProfileDefinition profile(String id) { return profiles.get(id); }
    public CompletionScopeDefinition scope(String id) { return scopes.get(id); }

    @Scheduled(fixedDelayString = "${skillpilot.completion.generation-check-ms:2000}")
    public void verifyPinnedGeneration() {
        if (!available || root == null) return;
        try {
            Set<Path> expectedRuntime = new LinkedHashSet<>(stamps.keySet());
            Set<Path> currentRuntime = new LinkedHashSet<>(runtimeInputs());
            // Additional review files are bound above but are outside the pruned runtime tree.
            currentRuntime.addAll(expectedRuntime.stream().filter(p -> !isRuntimeJson(p)).toList());
            if (!expectedRuntime.equals(currentRuntime)) { available = false; return; }
            for (Map.Entry<Path, Stamp> entry : stamps.entrySet()) {
                if (!entry.getValue().equals(stamp(entry.getKey()))) { available = false; return; }
            }
        } catch (IOException | RuntimeException e) {
            available = false;
        }
    }

    private List<Path> runtimeInputs() throws IOException {
        return new ArrayList<>(PrunedFileTree.files(root, p -> !p.equals(root)
                && (Set.of("quality", ".git", "node_modules").contains(p.getFileName().toString())
                    || automatic && (p.equals(root.resolve("DE/Gymnasium/completion-profiles"))
                        || p.equals(root.resolve("DE/Gymnasium/completion-scopes")))))
                .stream().filter(Files::isRegularFile).filter(this::isRuntimeJson)
                .map(p -> p.toAbsolutePath().normalize()).sorted().toList());
    }

    private boolean isRuntimeJson(Path path) {
        String name = path.getFileName().toString();
        return name.endsWith(".json") || name.endsWith(".json.snapshot");
    }

    private static Map<Path, Input> capture(List<Path> paths) throws IOException {
        Map<Path, Input> inputs = new TreeMap<>();
        for (Path path : paths) {
            Stamp before = stamp(path);
            byte[] bytes = Files.readAllBytes(path);
            if (!before.equals(stamp(path))) throw new IOException("Curriculum changed during capture");
            inputs.put(path, new Input(bytes, before));
        }
        return inputs;
    }

    private void captureReview(String reference, Map<Path, Input> inputs) throws IOException {
        if (reference == null || reference.isBlank()) throw new IllegalArgumentException("Missing review reference");
        Path review = root.getParent().resolve(reference).toAbsolutePath().normalize();
        if (!review.startsWith(root) || !review.toString().endsWith(".md")
                || !Files.isRegularFile(review, LinkOption.NOFOLLOW_LINKS)
                || !review.toRealPath().startsWith(root.toRealPath())) {
            throw new IllegalArgumentException("Completion review must name a checked-in curriculum Markdown artifact");
        }
        if (!inputs.containsKey(review)) inputs.putAll(capture(List.of(review)));
    }

    private void verifyUnchanged(Map<Path, Input> inputs) throws IOException {
        Set<Path> expected = new LinkedHashSet<>(inputs.keySet());
        Set<Path> actual = new LinkedHashSet<>(runtimeInputs());
        actual.addAll(expected.stream().filter(p -> !isRuntimeJson(p)).toList());
        if (!expected.equals(actual)) throw new IOException("Curriculum inventory changed during pinning");
        for (var entry : inputs.entrySet()) {
            if (!entry.getValue().stamp().equals(stamp(entry.getKey()))
                    || !Arrays.equals(entry.getValue().bytes(), Files.readAllBytes(entry.getKey()))) {
                throw new IOException("Curriculum bytes changed during pinning");
            }
        }
    }

    private static Map<String, JsonNode> goalInputs(Map<Path, Input> inputs, ObjectMapper mapper) throws IOException {
        Map<String, JsonNode> goals = new LinkedHashMap<>();
        for (var entry : inputs.entrySet()) {
            JsonNode document = mapper.readTree(entry.getValue().bytes());
            if (document == null || !document.path("goals").isArray()) continue;
            for (JsonNode goal : document.path("goals")) {
                String id = goal.path("id").asText("");
                if (id.isBlank()) continue;
                if (!goals.containsKey(id)) goals.put(id, goal);
                else if (goals.get(id) == null || !goals.get(id).equals(goal)) goals.put(id, null);
            }
        }
        return goals;
    }

    static void validateReviewBindings(CompletionProfileDefinition profile, CompletionScopeDefinition scope,
            byte[] scopeBytes, Map<String, JsonNode> goals, ObjectMapper mapper) throws Exception {
        CompletionReviewBindings.validate(profile, scope, mapper.readTree(scopeBytes), goals, mapper);
    }

    static String canonicalHash(JsonNode node, ObjectMapper mapper) throws Exception {
        return CompletionReviewBindings.canonicalHash(node, mapper);
    }

    private static Stamp stamp(Path p) throws IOException {
        BasicFileAttributes a = Files.readAttributes(p, BasicFileAttributes.class);
        return new Stamp(a.size(), a.lastModifiedTime().toString(), String.valueOf(a.fileKey()));
    }
    private record Stamp(long size, String modifiedAt, String fileKey) { }
    private record Input(byte[] bytes, Stamp stamp) { }

    private static <T> Map<String, T> load(Path directory, Map<Path, Input> inputs, Map<String, Path> paths,
            ObjectMapper mapper, Class<T> type,
            java.util.function.Function<T, String> id) throws IOException {
        Map<String, T> result = new TreeMap<>();
        for (var input : inputs.entrySet()) {
            Path path = input.getKey();
            if (!directory.equals(path.getParent()) || !path.toString().endsWith(".json")) continue;
            T entry = mapper.readValue(input.getValue().bytes(), type);
            String identity = id.apply(entry);
            if (identity == null || identity.isBlank() || result.putIfAbsent(identity, entry) != null) {
                throw new IllegalArgumentException("Missing or duplicate completion artifact identity");
            }
            paths.put(identity, path);
        }
        return result;
    }
}
