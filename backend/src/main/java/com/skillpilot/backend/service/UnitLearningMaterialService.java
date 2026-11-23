package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.ActiveGoalContext.PracticeExercise;
import com.skillpilot.backend.completion.UnitAssessmentContract;
import com.skillpilot.backend.completion.CompletionReviewBindings;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;

/** Unit introductions, activity references and exercise prompts shared by the map and the coach. */
public final class UnitLearningMaterialService {
    private record Key(String landscape, String view, String node) {}
    public record AssessmentBinding(String landscapeId, String viewId, String compositionNodeId,
            UnitAssessmentContract contract) {}
    public record OrientationBinding(String landscapeId, String viewId, String compositionNodeId,
            String orientationGoalId, List<String> guidedStudyOrder) {
        public String sectionGoalId() { return "composition:" + viewId + ":structure:" + compositionNodeId; }
    }
    public record Intro(String question, String promise, String scene, String imageUrl, String imageAlt,
            List<String> topics) {
        public Intro { topics = topics == null ? List.of() : List.copyOf(topics); }
    }
    public record SectionAssessmentPolicy(String unitContractRevision, String requiredPartsFingerprint,
            List<String> voluntaryAssessmentGoalIds, Map<String, List<String>> additionalVoluntaryAssessmentGoalIdsByView) {
        public SectionAssessmentPolicy {
            voluntaryAssessmentGoalIds = List.copyOf(voluntaryAssessmentGoalIds);
            var bound = new HashMap<String, List<String>>();
            if (additionalVoluntaryAssessmentGoalIdsByView != null) {
                additionalVoluntaryAssessmentGoalIdsByView.forEach((view, ids) -> bound.put(view, List.copyOf(ids)));
            }
            additionalVoluntaryAssessmentGoalIdsByView = Map.copyOf(bound);
        }

        public List<String> voluntaryAssessmentsFor(String view) {
            // A merged view contains the selected goals of each of its participating views.
            var ids = new LinkedHashSet<>(voluntaryAssessmentGoalIds);
            for (String component : viewComponents(view)) {
                ids.addAll(additionalVoluntaryAssessmentGoalIdsByView.getOrDefault(component, List.of()));
            }
            return List.copyOf(ids);
        }
    }
    public record IndividualAssessmentOffer(String targetGoalId, String assessmentGoalId) { }
    public record Exercise(PracticeExercise german, PracticeExercise english, boolean requiredForRegularLearning) { }

    public record Material(String flashcardGoalId, String assessmentGoalId, String orientationGoalId, Map<String, Intro> intro,
            Map<String, Exercise> exercises, UnitAssessmentContract assessmentContract,
            SectionAssessmentPolicy sectionAssessmentPolicy, List<String> guidedStudyOrder,
            List<IndividualAssessmentOffer> individualAssessmentOffers) {
        public Material(String flashcardGoalId, String assessmentGoalId, String orientationGoalId, Map<String, Intro> intro,
                Map<String, Exercise> exercises, UnitAssessmentContract assessmentContract,
                SectionAssessmentPolicy sectionAssessmentPolicy, List<String> guidedStudyOrder) {
            this(flashcardGoalId, assessmentGoalId, orientationGoalId, intro, exercises, assessmentContract,
                    sectionAssessmentPolicy, guidedStudyOrder, List.of());
        }
        public Material {
            individualAssessmentOffers = List.copyOf(individualAssessmentOffers);
            intro = Map.copyOf(intro);
            exercises = Map.copyOf(exercises);
            guidedStudyOrder = List.copyOf(guidedStudyOrder);
        }

        public String question(String language) { return localized(language).question(); }
        public String promise(String language) { return localized(language).promise(); }
        public Intro introduction(String language) { return localized(language); }

        public Optional<PracticeExercise> exercise(String goalId, String language) {
            if (goalId == null) return Optional.empty();
            return Optional.ofNullable(exercises.get(goalId))
                    .map(exercise -> "en".equalsIgnoreCase(language) ? exercise.english() : exercise.german());
        }

        private Intro localized(String language) {
            return "en".equalsIgnoreCase(language) ? intro.get("en") : intro.get("de");
        }
    }

    private final Map<Key, Material> materials;
    private final Map<String, String> reviewedPlanningReleases;

    private UnitLearningMaterialService(Map<Key, Material> materials, Map<String, String> reviewedPlanningReleases) {
        this.materials = Map.copyOf(materials);
        this.reviewedPlanningReleases = Map.copyOf(reviewedPlanningReleases);
    }

    public static UnitLearningMaterialService empty() {
        return new UnitLearningMaterialService(Map.of(), Map.of());
    }

    public static UnitLearningMaterialService fromRepository(Path directory, ObjectMapper mapper) throws IOException {
        Map<Key, Material> materials = new HashMap<>();
        try (Stream<Path> files = materialFiles(directory, mapper)) {
            for (Path file : files.toList()) {
                JsonNode data = mapper.readTree(file.toFile());
                JsonNode version = data.get("schemaVersion");
                if (version != null && (!version.isNumber() || !(version.decimalValue().compareTo(BigDecimal.ONE) == 0
                        || version.decimalValue().compareTo(BigDecimal.valueOf(2)) == 0
                        || version.decimalValue().compareTo(BigDecimal.valueOf(3)) == 0))) {
                    throw new IOException("Unsupported unit learning material version in " + file);
                }
                JsonNode unit = data.required("unit");
                int materialVersion = version == null ? 1 : version.asInt();
                boolean guidedEntry = materialVersion >= 2;
                if (guidedEntry) requiredText(unit, "orientationGoalId", file);
                for (JsonNode credit : unit.path("assessmentContract").path("planningCredits")) {
                    if (credit.has("orientation") && !guidedEntry) {
                        throw new IOException("An orientation credit requires version 2 unit learning material in " + file);
                    }
                }
                Map<String, Intro> intros = new HashMap<>();
                for (String language : new String[] {"de", "en"}) {
                    JsonNode intro = data.required("intro").required(language);
                    if (guidedEntry) {
                        for (String field : List.of("question", "promise", "scene", "imageUrl", "imageAlt")) {
                            requiredText(intro, field, file);
                        }
                        if (!intro.path("topics").isArray() || intro.path("topics").isEmpty()) {
                            throw new IOException("Missing unit introduction topics in " + file);
                        }
                    }
                    List<String> topics = mapper.readerForListOf(String.class).readValue(
                            intro.has("topics") ? intro.required("topics") : mapper.createArrayNode());
                    intros.put(language, new Intro(intro.required("question").asText(), intro.required("promise").asText(),
                            intro.path("scene").textValue(), intro.path("imageUrl").textValue(),
                            intro.path("imageAlt").textValue(), topics));
                }
                var exercises = readExercises(data.path("exercises"), materialVersion, file);
                Material material = new Material(unit.path("flashcardGoalId").textValue(),
                        unit.path("assessmentGoalId").textValue(), unit.path("orientationGoalId").textValue(),
                        intros, exercises,
                        unit.has("assessmentContract")
                                ? mapper.treeToValue(unit.required("assessmentContract"), UnitAssessmentContract.class)
                                : null, boundSectionPolicy(unit, mapper), readGuidedStudyOrder(data, materialVersion, file),
                        readIndividualOffers(data, materialVersion, exercises, file));
                String landscape = unit.required("landscapeId").asText();
                String node = unit.required("compositionNodeId").asText();
                for (JsonNode view : unit.required("viewIds")) {
                    Key key = new Key(landscape, view.asText(), node);
                    if (materials.putIfAbsent(key, material) != null) {
                        throw new IllegalArgumentException("Duplicate unit material for " + key + " in " + file);
                    }
                }
            }
        }
        Map<String, String> reviewed = new HashMap<>();
        Path catalog = directory.resolve("unit-learning-materials.json");
        if (Files.isRegularFile(catalog)) {
            var releases = mapper.readTree(catalog.toFile()).path("reviewedPlanningReleases");
            if (releases.isObject()) releases.fields().forEachRemaining(entry -> {
                if (entry.getValue().isTextual()) reviewed.put(entry.getKey(), entry.getValue().asText());
            });
        }
        return new UnitLearningMaterialService(materials, reviewed);
    }

    public boolean isReviewedPlanningRelease(com.skillpilot.backend.completion.UnitPlanningRelease release) {
        return release != null && release.review() != null && release.review().sha256() != null
                && release.review().sha256().equals(reviewedPlanningReleases.get(release.fingerprint()));
    }

    private static Stream<Path> materialFiles(Path directory, ObjectMapper mapper) throws IOException {
        Path catalog = directory.resolve("unit-learning-materials.json");
        if (!Files.exists(catalog)) {
            // Older repository releases shipped the initial materials in this folder.
            Path previous = directory.resolve("DE/Gymnasium/materials");
            return Files.isDirectory(previous) ? Files.walk(previous).filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith("-practice.json")) : Stream.empty();
        }
        JsonNode data = mapper.readTree(catalog.toFile());
        if (data.path("schemaVersion").asInt() != 1 || !data.path("materials").isArray()) {
            throw new IOException("Invalid unit material catalog " + catalog);
        }
        Path root = directory.toRealPath();
        var files = new ArrayList<Path>();
        for (JsonNode entry : data.required("materials")) {
            if (!entry.isTextual() || entry.asText().isBlank() || Path.of(entry.asText()).isAbsolute()) {
                throw new IOException("Expected a repository-relative unit material path in " + catalog);
            }
            Path file = root.resolve(entry.asText()).normalize();
            if (!file.startsWith(root) || !Files.isRegularFile(file) || !file.toRealPath().startsWith(root)) {
                throw new IOException("Missing or out-of-scope unit material " + entry.asText());
            }
            files.add(file);
        }
        return files.stream();
    }

    private static List<IndividualAssessmentOffer> readIndividualOffers(JsonNode data, int version,
            Map<String, Exercise> exercises, Path file) {
        var offers = data.path("individualAssessmentOffers");
        if (offers.isMissingNode()) return List.of();
        if (version < 3 || !offers.isArray() || offers.isEmpty()) {
            throw new IllegalArgumentException("Expected a version 3 individualAssessmentOffers list in " + file);
        }
        var result = new ArrayList<IndividualAssessmentOffer>();
        var assessments = new LinkedHashSet<String>();
        for (JsonNode entry : offers) {
            var target = requiredText(entry, "targetGoalId", file);
            var assessment = requiredText(entry, "assessmentGoalId", file);
            if (entry.size() != 2 || !exercises.containsKey(target) || target.equals(assessment) || !assessments.add(assessment)
                    || assessment.equals(data.required("unit").path("assessmentGoalId").textValue())) {
                throw new IllegalArgumentException("Invalid individual assessment offer in " + file);
            }
            result.add(new IndividualAssessmentOffer(target, assessment));
        }
        return List.copyOf(result);
    }

    public boolean hasIndividualOfferIn(Collection<String> goalIds) {
        return materials.values().stream().flatMap(material -> material.individualAssessmentOffers().stream())
                .anyMatch(offer -> goalIds.contains(offer.assessmentGoalId()));
    }

    private static List<String> readGuidedStudyOrder(JsonNode data, int version, Path file) {
        JsonNode entries = data.path("guidedStudyOrder");
        if (entries.isMissingNode()) return List.of();
        if (version < 3 || !entries.isArray() || entries.size() < 2) {
            throw new IllegalArgumentException("Expected a version 3 guidedStudyOrder with at least two goals in " + file);
        }
        var ids = new LinkedHashSet<String>();
        String opening = data.required("unit").path("orientationGoalId").textValue();
        for (JsonNode entry : entries) {
            String id = entry.textValue();
            if (id == null || id.isBlank() || !id.equals(id.strip()) || id.equals(opening) || !ids.add(id)) {
                throw new IllegalArgumentException("Invalid or repeated guidedStudyOrder goal in " + file);
            }
        }
        if (!ids.getLast().equals(data.required("unit").path("assessmentGoalId").textValue())) {
            throw new IllegalArgumentException("guidedStudyOrder must end with the unit's assessmentGoalId in " + file);
        }
        return List.copyOf(ids);
    }

    private static Map<String, Exercise> readExercises(JsonNode entries, int version, Path file) {
        if (entries.isMissingNode()) return Map.of();
        if (!entries.isArray()) throw new IllegalArgumentException("Expected array of unit exercises in " + file);
        Map<String, Exercise> exercises = new HashMap<>();
        for (JsonNode entry : entries) {
            String goal = requiredText(entry, "goalId", file);
            JsonNode required = entry.path("requiredForRegularLearning");
            if (!required.isMissingNode() && (version < 3 || !required.isBoolean())) {
                throw new IllegalArgumentException("Regular learning requirement needs a version 3 boolean in " + file);
            }
            var exercise = new Exercise(readExercise(entry.required("de"), file),
                    readExercise(entry.required("en"), file), required.asBoolean(false));
            if (exercises.putIfAbsent(goal, exercise) != null) {
                throw new IllegalArgumentException("Duplicate exercise for " + goal + " in " + file);
            }
        }
        return exercises;
    }

    private static PracticeExercise readExercise(JsonNode entry, Path file) {
        var criteria = new ArrayList<String>();
        var authored = entry.path("evidenceCriteria");
        if (!authored.isMissingNode()) {
            if (!authored.isArray()) throw new IllegalArgumentException("Expected evidence criteria in " + file);
            for (var criterion : authored) {
                if (!criterion.isTextual() || criterion.textValue().isBlank()) {
                    throw new IllegalArgumentException("Expected a written evidence criterion in " + file);
                }
                criteria.add(criterion.textValue());
            }
        }
        return new PracticeExercise(requiredText(entry, "title", file), requiredText(entry, "prompt", file), criteria);
    }

    private static String requiredText(JsonNode entry, String field, Path file) {
        String value = entry.path(field).textValue();
        if (value == null || value.isBlank()) throw new IllegalArgumentException("Missing exercise " + field + " in " + file);
        return value;
    }

    private static SectionAssessmentPolicy boundSectionPolicy(JsonNode unit, ObjectMapper mapper) {
        if (!unit.has("sectionAssessmentPolicy")) return null;
        try {
            var policy = mapper.treeToValue(unit.required("sectionAssessmentPolicy"), SectionAssessmentPolicy.class);
            var contract = unit.required("assessmentContract");
            String fingerprint = CompletionReviewBindings.canonicalHash(contract.required("parts"), mapper);
            var viewIds = mapper.readerForListOf(String.class).<List<String>>readValue(contract.required("viewIds"));
            var required = new LinkedHashSet<String>();
            contract.required("parts").forEach(part -> required.add(part.required("goalId").asText()));
            var common = policy.voluntaryAssessmentGoalIds();
            if (!viewIds.containsAll(policy.additionalVoluntaryAssessmentGoalIdsByView().keySet())
                    || common.size() != new LinkedHashSet<>(common).size()
                    || Stream.concat(common.stream(),
                            policy.additionalVoluntaryAssessmentGoalIdsByView().values().stream().flatMap(List::stream))
                            .anyMatch(id -> id.isBlank() || required.contains(id))) return null;
            for (var scoped : policy.additionalVoluntaryAssessmentGoalIdsByView().values()) {
                if (scoped.isEmpty() || scoped.size() != new LinkedHashSet<>(scoped).size()
                        || scoped.stream().anyMatch(common::contains)) return null;
            }
            return fingerprint.equals(policy.requiredPartsFingerprint())
                    && contract.required("revision").asText().equals(policy.unitContractRevision()) ? policy : null;
        } catch (Exception invalidBinding) {
            // Ordinary section requirements remain in force for an unreadable or unbound exception.
            return null;
        }
    }

    private static String[] viewComponents(String viewId) {
        return viewId.startsWith("merged:") ? viewId.substring(7).split("\\+", -1) : new String[] {viewId};
    }

    public Optional<Material> find(String landscapeId, String viewId, String compositionNodeId) {
        if (viewId == null || viewId.isBlank()) return Optional.empty();
        String[] views = viewComponents(viewId);
        Material selected = materials.get(new Key(landscapeId, views[0], compositionNodeId));
        for (String view : views) {
            if (selected == null || !selected.equals(materials.get(new Key(landscapeId, view, compositionNodeId)))) {
                return Optional.empty();
            }
        }
        return Optional.of(selected);
    }

    /** Recognizes unit markers even when their authored views are not currently selected. */
    public boolean isUnitOrientationGoal(String goalId) {
        return goalId != null && materials.values().stream()
                .anyMatch(material -> goalId.equals(material.orientationGoalId()));
    }

    /** Authored entry markers for the actual projected views, including exact merged-view bindings. */
    public List<OrientationBinding> orientationBindings(Collection<String> viewIds) {
        var result = new ArrayList<OrientationBinding>();
        var scopes = materials.keySet().stream().map(key -> new Key(key.landscape(), "", key.node()))
                .distinct().sorted(java.util.Comparator.comparing(Key::landscape).thenComparing(Key::node)).toList();
        for (String view : viewIds.stream().sorted().toList()) {
            for (var scope : scopes) {
                find(scope.landscape(), view, scope.node())
                        .filter(material -> material.orientationGoalId() != null && !material.orientationGoalId().isBlank())
                        .ifPresent(material -> result.add(new OrientationBinding(scope.landscape(), view, scope.node(),
                                material.orientationGoalId(), material.guidedStudyOrder())));
            }
        }
        return List.copyOf(result);
    }

    /** Current view bindings, independent of a learner's temporary focus or chosen route. */
    public List<AssessmentBinding> assessmentBindings(Collection<String> viewIds) {
        var result = new ArrayList<AssessmentBinding>();
        var scopes = materials.keySet().stream().map(key -> new Key(key.landscape(), "", key.node()))
                .distinct().sorted(java.util.Comparator.comparing(Key::landscape).thenComparing(Key::node)).toList();
        for (String view : viewIds.stream().sorted().toList()) {
            for (var scope : scopes) {
                find(scope.landscape(), view, scope.node()).map(Material::assessmentContract)
                        .filter(contract -> contract.appliesTo(view))
                        .ifPresent(contract -> result.add(new AssessmentBinding(scope.landscape(), view, scope.node(), contract)));
            }
        }
        return List.copyOf(result);
    }

    /** Exact catalog lookup; absence needs no traversal of the composition tree. */
    public Optional<AssessmentBinding> assessmentBindingForReference(String reference) {
        if (reference == null || !reference.startsWith("composition:")) return Optional.empty();
        int marker = reference.indexOf(":structure:", "composition:".length());
        if (marker < 0) return Optional.empty();
        String view = reference.substring("composition:".length(), marker);
        String node = reference.substring(marker + ":structure:".length());
        return materials.keySet().stream().filter(key -> node.equals(key.node())).map(Key::landscape).distinct()
                .sorted().map(landscape -> find(landscape, view, node).map(Material::assessmentContract)
                    .filter(contract -> contract.appliesTo(view))
                    .map(contract -> new AssessmentBinding(landscape, view, node, contract)))
                .flatMap(Optional::stream).findFirst();
    }
}
