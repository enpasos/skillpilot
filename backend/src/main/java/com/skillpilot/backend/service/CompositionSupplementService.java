package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/** Explicit, Math-owned Gymnasium preparation. Never part of ordinary view matching.
 * V1 is deliberately bounded to authored structures and atomic goal entries. */
public final class CompositionSupplementService {
    public static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    public static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    public static final String SELECTIONS = "supplementSelections";
    public static final String SCHEMA = "https://skillpilot.com/schemas/composition-supplement/v1/composition-supplement.schema.json";
    public static final String REVIEW_SCHEMA = "https://skillpilot.com/schemas/composition-supplement/v1/didactic-inference-review.schema.json";
    private static final Set<String> DIMENSIONS = Set.of("schoolForm", "jurisdiction", "stage", "durationModel", "courseProfile");
    private final Path root;
    private final ObjectMapper mapper;
    private final LandscapeService landscapes;
    private final CompositionSupplementSchemaValidator schemas;
    private final NativeSupplementAcceptanceGate nativeAcceptance;

    public CompositionSupplementService(LandscapeProperties properties, ObjectMapper mapper, LandscapeService landscapes) {
        this(properties, mapper, landscapes,
                new RegisteredNativeSupplementAcceptance(Path.of(properties.getDirectory()).toAbsolutePath().normalize().getParent(), mapper),
                Path.of(properties.getDirectory()).toAbsolutePath().normalize().getParent().resolve("contracts/composition-supplement/v1"));
    }

    CompositionSupplementService(LandscapeProperties properties, ObjectMapper mapper, LandscapeService landscapes,
            NativeSupplementAcceptanceGate nativeAcceptance, Path schemaDirectory) {
        this.root = Path.of(properties.getDirectory()).toAbsolutePath().normalize();
        this.mapper = mapper; this.landscapes = landscapes;
        this.schemas = new CompositionSupplementSchemaValidator(schemaDirectory, mapper);
        this.nativeAcceptance = java.util.Objects.requireNonNull(nativeAcceptance);
    }

    public record AuthorizationAccounting(int totalAuthoredTargetAtomicGoals,
            int regularSourceBackedAtomicGoals, int reviewedDidacticSupplementAtomicGoals,
            int unresolvedTargetAtomicGoals, List<String> regularSourceClaimStillUnestablishedGoalIds, int orientationTargetGoals) {}

    public record Supplement(String id, String label, String labelEn, Map<String, String> scope,
            List<String> compatibleBaseViewIds, Map<String, String> baseViewSha256, String physicsViewId,
            String physicsViewSha256, Map<String, String> physicsScope, Set<String> physicsDependentGoalIds,
            List<String> targetGoalIds, String authorizationSha256, Map<String, Object> document,
            AuthorizationAccounting authorizationAccounting) {}

    /** No cache: acceptance/import/projection rechecks current source, Goal/P and review bytes. */
    public List<Supplement> validatedSupplements() {
        Path directory = root.resolve("DE/Gymnasium/composition-supplements/mathematik");
        if (!Files.exists(directory, java.nio.file.LinkOption.NOFOLLOW_LINKS)) return List.of();
        assertOwnedPath(directory);
        try (var paths = Files.walk(directory)) {
            boolean authored = paths.peek(this::assertOwnedPath).anyMatch(path ->
                    Files.isRegularFile(path, java.nio.file.LinkOption.NOFOLLOW_LINKS)
                            && path.toString().endsWith(".supplement.json"));
            if (!authored) return List.of();
        } catch (IOException exception) { throw failure("cannot read authored supplement directory", exception); }
        return nativeAcceptance.withSnapshot(() -> validateAuthoredDirectory(directory));
    }

    private List<Supplement> validateAuthoredDirectory(Path directory) {
        try (var paths = Files.walk(directory)) {
            List<Supplement> result = new ArrayList<>();
            Set<String> ids = new LinkedHashSet<>();
            for (Path path : paths.peek(this::assertOwnedPath).filter(p -> Files.isRegularFile(p, java.nio.file.LinkOption.NOFOLLOW_LINKS))
                    .filter(p -> p.toString().endsWith(".supplement.json")).sorted().toList()) {
                Supplement supplement = validate(read(path));
                require(ids.add(supplement.id()), "duplicate supplement identity");
                result.add(supplement);
            }
            return List.copyOf(result);
        } catch (IOException e) { throw failure("cannot read authored supplement directory", e); }
    }

    public Supplement requireSupplement(String id, String authorizationSha256) {
        return validatedSupplements().stream()
                .filter(s -> s.id().equals(id) && s.authorizationSha256().equals(authorizationSha256))
                .findFirst().orElseThrow(() -> failure("unknown or stale supplement; remove or review this selection"));
    }

    public List<Supplement> selected(Map<String, Map<String, Object>> config) {
        List<Supplement> selected = new ArrayList<>();
        for (var entry : config.entrySet()) {
            Object raw = entry.getValue().get(SELECTIONS);
            if (raw == null) continue;
            require(MATH.equals(entry.getKey()), "supplement owner must be canonical Gymnasium Mathematics");
            require(raw instanceof List<?>, "supplementSelections must be an explicit list");
            Set<String> ids = new LinkedHashSet<>();
            for (Object value : (List<?>) raw) {
                JsonNode selection = mapper.valueToTree(value);
                schemas.validate(selection, "supplement-selection.schema.json");
                closed(selection, Set.of("supplementId", "authorizationSha256"));
                String id = text(selection, "supplementId");
                require(ids.add(id), "duplicate supplement selection");
                selected.add(requireSupplement(id, text(selection, "authorizationSha256")));
            }
        }
        return selected.stream().sorted(java.util.Comparator.comparing(Supplement::id)).toList();
    }

    public Supplement validate(JsonNode document) {
        schemas.validate(document, "composition-supplement.schema.json");
        closed(document, Set.of("$schema", "supplementFormatVersion", "supplementId", "landscapeId", "language",
                "label", "labelEn", "compatibleBaseViewIds", "scope", "rootNodes", "reviewPath"));
        require(SCHEMA.equals(text(document, "$schema")) && "1.0".equals(text(document, "supplementFormatVersion")), "unsupported supplement schema");
        require(MATH.equals(text(document, "landscapeId")), "supplement must be Math-owned");
        require(Set.of("de", "en").contains(text(document, "language")), "unsupported language");
        String id = text(document, "supplementId");
        require(id.matches("[A-Za-z0-9][A-Za-z0-9._:+-]{0,299}"), "invalid supplement ID");
        Map<String, String> scope = scope(document.get("scope"));
        List<String> baseIds = strings(document.get("compatibleBaseViewIds"));
        require(!baseIds.isEmpty(), "an exact Math base view anchor is required");
        SkillLandscape math = landscapes.getById(MATH);
        require(math != null && math.getGoals() != null, "Math owner unavailable");
        Map<String, LearningGoal> goals = new LinkedHashMap<>();
        math.getGoals().forEach(g -> goals.put(g.getId(), g));
        LinkedHashSet<String> targetIds = new LinkedHashSet<>();
        validateNodes(document.get("rootNodes"), goals, targetIds, new LinkedHashSet<>(), 0);
        require(!targetIds.isEmpty(), "empty supplement");
        // A selected bundle must teach its whole local prerequisite closure; it cannot
        // rely on unselected ordinary Mathematics or on mastery-dependent target shrinking.
        TeachingGraph teachingGraph=teachingGraph(goals);
        for (String target : targetIds) {
            Set<String> required = effectivePrerequisiteClosure(target, teachingGraph);
            require(targetIds.containsAll(required), "supplement omits its Math teaching closure");
        }
        JsonNode review = read(boundPath(text(document, "reviewPath")));
        schemas.validate(review, "didactic-inference-review.schema.json");
        closed(review, Set.of("$schema", "reviewFormatVersion", "reviewId", "supplementSha256", "ownerLandscapeId",
                "scope", "compatibleBaseViewIds", "decision", "authorId", "reviewerId", "conditions", "dissent",
                "mathGoalBindings", "mathTeachingClosureSha256", "baseViewBindings", "physicsContext", "physicsGoalBindings", "sourceBindings", "targetAuthorizations"));
        require(REVIEW_SCHEMA.equals(text(review, "$schema")) && Set.of("1.0", "1.1").contains(text(review, "reviewFormatVersion")), "unsupported inference review schema");
        text(review, "reviewId");
        require(MATH.equals(text(review, "ownerLandscapeId")), "wrong inference owner");
        require("accepted".equals(text(review, "decision")), "supplement review is not accepted");
        require(!text(review, "authorId").equals(text(review, "reviewerId")), "independent review required");
        require(review.path("conditions").isArray() && review.path("conditions").isEmpty(), "conditional review is not active authorization");
        require(review.path("dissent").isArray(), "retained dissent array is required");
        require(sha(document).equals(text(review, "supplementSha256")), "stale supplement review");
        require(scope.equals(scope(review.get("scope"))) && baseIds.equals(strings(review.get("compatibleBaseViewIds"))), "review context differs");
        validateGoalBindings(review.get("mathGoalBindings"), MATH, targetIds, true);
        require(teachingClosureSha256(targetIds).equals(text(review, "mathTeachingClosureSha256")), "stale effective Math teaching closure");
        Map<String, String> baseHashes = new LinkedHashMap<>();
        JsonNode viewBindings = review.get("baseViewBindings");
        require(viewBindings != null && viewBindings.isArray(), "exact base view bytes required");
        for (JsonNode binding : viewBindings) {
            closed(binding, Set.of("viewId", "viewSha256"));
            require(baseHashes.putIfAbsent(text(binding, "viewId"), text(binding, "viewSha256")) == null, "duplicate base view binding");
        }
        require(baseHashes.keySet().equals(new LinkedHashSet<>(baseIds)), "base view binding set differs");
        JsonNode physics = review.get("physicsContext");
        closed(physics, Set.of("landscapeId", "viewId", "viewSha256", "scope"));
        require(PHYSICS.equals(text(physics, "landscapeId")), "wrong motivation owner");
        Map<String, String> physicsScope = scope(physics.get("scope"));
        String physicsView = text(physics, "viewId");
        require(review.path("physicsGoalBindings").isArray() && !review.path("physicsGoalBindings").isEmpty(), "whole Physics Goal/P binding required");
        Set<String> physicsIds = validateGoalBindings(review.get("physicsGoalBindings"), PHYSICS, null, false);
        JsonNode sources = review.get("sourceBindings");
        require(sources != null && sources.isArray() && !sources.isEmpty(), "official Physics source identity required");
        for (JsonNode source : sources) {
            closed(source, Set.of("sourceId", "subject", "edition", "cohort", "anchor", "officialUrl", "retainedEvidence"));
            require("Physics".equals(text(source, "subject")), "Physics evidence must remain explicitly Physics evidence");
            for (String key : List.of("sourceId", "edition", "cohort", "anchor", "officialUrl")) text(source, key);
            require(text(source, "officialUrl").startsWith("https://"), "official source URL required");
            validateFileBinding(source.get("retainedEvidence"));
        }
        JsonNode authorizations = review.get("targetAuthorizations");
        require(authorizations != null && authorizations.isArray(), "target authorizations required");
        Set<String> authorized = new LinkedHashSet<>();
        Set<String> regularSourceBacked = new LinkedHashSet<>();
        Set<String> orientations = new LinkedHashSet<>();
        for (JsonNode auth : authorizations) {
            closed(auth, Set.of("goalId", "classification", "regularMathematicsSourceCoverageClaim", "physicsDependentGoalIds",
                    "mandatoryOperation", "mathematicalInference", "inputAvailability", "wholePerformanceAlternatives", "minimality", "decision",
                    "regularMathematicsSourceReview", "orientationRationale", "completionContract"));
            String goalId = text(auth, "goalId");
            require(targetIds.contains(goalId) && authorized.add(goalId), "target authorization set mismatch");
            String classification = text(auth, "classification");
            require(auth.path("regularMathematicsSourceCoverageClaim").isBoolean(), "explicit source-claim distinction required");
            boolean orientation="orientation".equals(nativeSemanticKind(MATH,goals.get(goalId)));
            if (orientation) {
                require("1.1".equals(text(review,"reviewFormatVersion"))&&"reviewed-mathematics-orientation-preparation".equals(classification),"Orientation requires its explicit typed review lane");
                require(!auth.path("regularMathematicsSourceCoverageClaim").booleanValue()&&!auth.has("regularMathematicsSourceReview"),"Orientation never certifies official content coverage");
                require("orientation-binary-completion-v1".equals(text(auth,"completionContract")),"Unknown orientation completion contract");text(auth,"orientationRationale");
                for(String field:List.of("mandatoryOperation","mathematicalInference","inputAvailability","wholePerformanceAlternatives","minimality"))require(!auth.has(field),"Orientation is not assessed mathematical performance");
                orientations.add(goalId);
            } else if ("regular-mathematics-source-backed".equals(classification)) {
                require(auth.path("regularMathematicsSourceCoverageClaim").booleanValue(), "regular lane requires its separate whole-Math source review");
                validateRegularMathematicsSourceReview(auth.get("regularMathematicsSourceReview"), goalId, scope);
                regularSourceBacked.add(goalId);
            } else {
                require("reviewed-didactic-mathematics-supplement-motivated-by-physics".equals(classification), "unsupported authorization lane");
                require(!auth.path("regularMathematicsSourceCoverageClaim").booleanValue()
                        && !auth.has("regularMathematicsSourceReview"), "inference never grants regular Math source coverage");
            }
            List<String> dependents = strings(auth.get("physicsDependentGoalIds"));
            require(!dependents.isEmpty() && physicsIds.containsAll(dependents), "unbound Physics dependent");
            require(dependents.stream().allMatch(dependent -> dependsOn(dependent, goalId, new LinkedHashSet<>())),
                    "Math target is not in the actual Physics prerequisite closure");
            require("accepted".equals(text(auth, "decision")), "unaccepted target authorization");
            if(orientation) continue;
            require(!auth.has("orientationRationale")&&!auth.has("completionContract"),"Content cannot use orientation semantics");
            for (String key : List.of("mandatoryOperation", "mathematicalInference", "wholePerformanceAlternatives", "minimality")) text(auth, key);
            JsonNode availability = auth.get("inputAvailability");
            closed(availability, Set.of("mode", "decision", "rationale"));
            require(Set.of("supplied", "retained", "independently-derived").contains(text(availability, "mode"))
                    && "accepted".equals(text(availability, "decision")), "input availability remains unresolved");
            text(availability, "rationale");
        }
        require(authorized.equals(targetIds), "not every target is independently authorized");
        // This accounting is a conjunctive runtime admission check, separate from the
        // unchanged regular-source predicate and canonical quality denominator.
        AuthorizationAccounting accounting = new AuthorizationAccounting(targetIds.size(), regularSourceBacked.size(),
                authorized.size() - regularSourceBacked.size() - orientations.size(), targetIds.size() - authorized.size(),
                targetIds.stream().filter(goalId -> !regularSourceBacked.contains(goalId)&&!orientations.contains(goalId)).toList(),orientations.size());
        require(accounting.unresolvedTargetAtomicGoals() == 0, "unresolved supplemental target authorization");
        String authorizationDigest = sha(mapper.valueToTree(Map.of("supplement", document, "review", review)));
        Map<String, Object> runtimeView = new LinkedHashMap<>();
        runtimeView.put("viewId", "supplement:" + id);
        runtimeView.put("landscapeId", MATH);
        runtimeView.put("language", text(document, "language"));
        runtimeView.put("scope", scope);
        runtimeView.put("rootNodes", mapper.convertValue(document.get("rootNodes"), List.class));
        return new Supplement(id, text(document, "label"), text(document, "labelEn"), scope,
                baseIds, Collections.unmodifiableMap(baseHashes), physicsView, text(physics, "viewSha256"), physicsScope, Set.copyOf(physicsIds),
                List.copyOf(targetIds), authorizationDigest,
                Collections.unmodifiableMap(runtimeView), accounting);
    }

    /** A complete accepted Math source decision, never a Physics provenance alias.
     * The same atom may be regular here and inferred in a different exact scope. */
    private void validateRegularMathematicsSourceReview(JsonNode binding, String goalId, Map<String, String> expectedScope) {
        validateFileBinding(binding);
        JsonNode review = read(boundPath(text(binding, "path")));
        schemas.validate(review, "regular-mathematics-source-review.schema.json");
        closed(review, Set.of("$schema", "reviewFormatVersion", "reviewId", "ownerLandscapeId", "goalId", "goalSha256",
                "scope", "decision", "authorId", "reviewerId", "conditions", "sourceBinding", "wholeGoalCoverage", "reviewEvidence"));
        require("https://skillpilot.com/schemas/composition-supplement/v1/regular-mathematics-source-review.schema.json".equals(text(review, "$schema"))
                && "1.0".equals(text(review, "reviewFormatVersion")), "unsupported regular Math source review");
        require(MATH.equals(text(review, "ownerLandscapeId")) && goalId.equals(text(review, "goalId"))
                && expectedScope.equals(scope(review.get("scope"))), "regular Math source review has a different goal or scope");
        require(sha(mapper.valueToTree(landscapes.getGoalDefinition(goalId))).equals(text(review, "goalSha256")), "stale whole Math Goal/P source decision");
        require("accepted".equals(text(review, "decision")) && !text(review, "authorId").equals(text(review, "reviewerId")), "independent accepted regular Math source review required");
        require(review.path("conditions").isArray() && review.path("conditions").isEmpty(), "conditional Math source claim remains unresolved");
        text(review, "reviewId"); text(review, "wholeGoalCoverage"); validateFileBinding(review.get("reviewEvidence"));
        JsonNode source = review.get("sourceBinding");
        closed(source, Set.of("sourceId", "subject", "edition", "cohort", "anchor", "officialUrl", "retainedEvidence"));
        require("Mathematics".equals(text(source, "subject")), "regular Mathematics coverage cannot use Physics provenance");
        for (String key : List.of("sourceId", "edition", "cohort", "anchor", "officialUrl")) text(source, key);
        require(text(source, "officialUrl").startsWith("https://"), "official Math source URL required");
        validateFileBinding(source.get("retainedEvidence"));
    }

    private boolean dependsOn(String current, String wanted, Set<String> visited) {
        if (current.equals(wanted)) return true;
        if (!visited.add(current)) return false;
        LearningGoal goal = landscapes.getGoalDefinition(current);
        if (goal == null) return false;
        for (String ref : goal.getRequires() == null ? List.<String>of() : goal.getRequires()) {
            String id = ref.contains(":") ? ref.substring(ref.indexOf(':') + 1) : ref;
            if (dependsOn(id, wanted, visited)) return true;
        }
        for (String ref : goal.getContains() == null ? List.<String>of() : goal.getContains()) {
            if (dependsOn(ref, wanted, visited)) return true;
        }
        return false;
    }

    private Set<String> validateGoalBindings(JsonNode bindings, String owner, Set<String> expected, boolean gates) {
        require(bindings != null && bindings.isArray(), "complete Goal/P bindings required");
        Set<String> ids = new LinkedHashSet<>();
        for (JsonNode binding : bindings) {
            closed(binding, Set.of("goalId", "goalSha256", "semanticKind", "nativeAcceptanceSha256", "orientationContextBindingSha256"));
            String id = text(binding, "goalId");
            require(ids.add(id) && owner.equals(landscapes.getLandscapeIdForGoal(id)), "wrong or duplicate goal owner");
            LearningGoal goal = landscapes.getGoalDefinition(id);
            require(goal != null && sha(mapper.valueToTree(goal)).equals(text(binding, "goalSha256")), "stale complete Goal/P binding");
            String actualKind = nativeSemanticKind(owner, goal);
            require(text(binding,"semanticKind").equals(actualKind),"stale or unavailable native semantic kind");
            if("orientation".equals(actualKind)&&MATH.equals(owner)) {
                require(!binding.has("nativeAcceptanceSha256"),"Orientation cannot use content native P/D/A/M/V");
                require(nativeAcceptance.requireOrientationAccepted(owner,goal).equals(text(binding,"orientationContextBindingSha256")),"stale registered Math orientation source/Kind context");
            } else {
                require("curricularAtomic".equals(actualKind)&&!binding.has("orientationContextBindingSha256"),"unsupported supplemental noncontent kind");
                require(nativeAcceptance.requireAccepted(owner,goal).equals(text(binding,"nativeAcceptanceSha256")),"stale or unaccepted registered native Kind/D/P/A/M/V and external P identity");
            }
        }
        require(expected == null || ids.equals(expected), "review omits target or closure goals");
        return ids;
    }

    /** Existing repository atoms keep their current canonical Goal unchanged.
     * Their authoritative Kind lives in the native, fingerprinted migration ledger. */
    private String nativeSemanticKind(String owner, LearningGoal goal) {
        if (goal.getSemanticKind() != null) return goal.getSemanticKind();
        String subject = MATH.equals(owner) ? "mathematik" : "physik";
        JsonNode ledger = read(boundPath("DE/Gymnasium/quality/release-model/" + subject + ".semantic-kinds.json"));
        require(owner.equals(text(ledger, "sourceLandscapeId"))
                && "semantic-kind-source-fingerprint-v1".equals(text(ledger, "sourceFingerprintContractId")), "unknown native Kind ledger");
        JsonNode source = read(boundPath("DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_" + subject.toUpperCase(java.util.Locale.ROOT) + ".de.json"));
        JsonNode rawGoal = null;
        for (JsonNode candidate : source.path("goals")) if (goal.getId().equals(candidate.path("id").asText())) rawGoal = candidate;
        require(rawGoal != null, "native Kind goal missing");
        var fields = mapper.createArrayNode();
        for (String key : List.of("id", "type", "nodeKind", "title", "titleEn", "description", "descriptionEn", "tags",
                "contains", "requires", "semanticAtomic", "dimensionTags", "examData", "extendedData", "release")) {
            ObjectNode field = mapper.createObjectNode().put("path", "/" + key);
            if (!rawGoal.has(key)) field.put("state", "missing");
            else {
                field.put("state", "value"); JsonNode value = rawGoal.get(key);
                if ("tags".equals(key)) {
                    List<String> tags = strings(value).stream().sorted().toList(); value = mapper.valueToTree(tags);
                }
                field.set("value", value);
            }
            fields.add(field);
        }
        String fingerprint = "sha256:" + sha(mapper.createObjectNode()
                .put("domain", "skillpilot:semantic-kind-source-fingerprint:v1").set("fields", fields));
        JsonNode decision = null;
        for (JsonNode candidate : ledger.path("decisions")) if (goal.getId().equals(candidate.path("goalId").asText())) {
            require(decision == null, "duplicate native Kind decision"); decision = candidate;
        }
        require(decision != null && "authoritative".equals(text(decision, "decisionStatus"))
                && fingerprint.equals(text(decision, "sourceFingerprint")), "stale native Kind decision");
        return text(decision, "semanticKind");
    }

    /** Authoring binding for exact effective atomic prerequisites plus all
     * canonical ancestors that can carry inherited requires. No teaching target is inferred. */
    public String teachingClosureSha256(Set<String> targetIds) {
        Map<String, LearningGoal> goals = new LinkedHashMap<>();
        landscapes.getById(MATH).getGoals().forEach(goal -> goals.put(goal.getId(), goal));
        Map<String, Object> bindings = new TreeMap<>();
        TeachingGraph graph=teachingGraph(goals);
        for (String target : targetIds) {
            List<LearningGoal> ancestors = new ArrayList<>();
            collectAncestors(target, graph, ancestors);
            Map<String, String> ancestorBindings = new TreeMap<>();
            ancestors.forEach(goal -> ancestorBindings.put(goal.getId(), sha(mapper.valueToTree(goal))));
            bindings.put(target, Map.of("effectivePrerequisites", effectivePrerequisiteClosure(target, graph).stream().sorted().toList(),
                    "ancestorGoalBindings", ancestorBindings));
        }
        return sha(mapper.valueToTree(bindings));
    }

    /** Parent and pending indexes remove repeated DAG paths without changing
     * inherited requires, atomic expansion or the final closure/origin sets. */
    private record TeachingGraph(Map<String,LearningGoal> goals,Map<String,List<LearningGoal>> parents) {}
    private TeachingGraph teachingGraph(Map<String,LearningGoal> goals) {
        Map<String,List<LearningGoal>> parents=new LinkedHashMap<>();
        for(LearningGoal parent:goals.values())for(String child:parent.getContains()==null?List.<String>of():parent.getContains())
            parents.computeIfAbsent(child,key->new ArrayList<>()).add(parent);
        return new TeachingGraph(goals,parents);
    }
    private Set<String> effectivePrerequisiteClosure(String id,Map<String,LearningGoal> goals) {
        return effectivePrerequisiteClosure(id,teachingGraph(goals));
    }
    private Set<String> effectivePrerequisiteClosure(String id,TeachingGraph graph) {
        LinkedHashSet<String> required=new LinkedHashSet<>(),visited=new LinkedHashSet<>(),pending=new LinkedHashSet<>();
        java.util.ArrayDeque<String> queue=new java.util.ArrayDeque<>();queue.add(id);pending.add(id);
        while(!queue.isEmpty()) {
            String current=queue.remove();pending.remove(current);
            if(!visited.add(current))continue;
            require(visited.size()<=10000,"oversized closure");LearningGoal goal=graph.goals().get(current);
            require(goal!=null,"foreign or missing Math prerequisite");
            List<LearningGoal> ancestors=new ArrayList<>();collectAncestors(current,graph,ancestors);ancestors.add(goal);
            for(LearningGoal ancestor:ancestors)for(String ref:ancestor.getRequires()==null?List.<String>of():ancestor.getRequires()) {
                String unqualified=ref.contains(":")?ref.substring(ref.indexOf(':')+1):ref;
                require(graph.goals().containsKey(unqualified),"foreign or missing Math prerequisite");
                expandRequiredAtomic(unqualified,graph.goals(),required,new LinkedHashSet<>());
            }
            for(String requiredId:required)if(!visited.contains(requiredId)&&pending.add(requiredId))queue.add(requiredId);
        }
        require(!required.contains(id),"requires cycle");return required;
    }
    private void collectAncestors(String id,Map<String,LearningGoal> goals,List<LearningGoal> result,Set<String> visited) {
        collectAncestors(id,teachingGraph(goals),result);
    }
    private void collectAncestors(String id,TeachingGraph graph,List<LearningGoal> result) {
        collectAncestors(id,graph,result,new LinkedHashSet<>(),new LinkedHashSet<>(),new LinkedHashSet<>());
    }
    private void collectAncestors(String id,TeachingGraph graph,List<LearningGoal> result,Set<String> active,Set<String> expanded,Set<String> emitted) {
        require(active.add(id),"contains cycle");
        if(!expanded.contains(id)) {
            for(LearningGoal parent:graph.parents().getOrDefault(id,List.of())) {
                if(emitted.add(parent.getId()))result.add(parent);
                collectAncestors(parent.getId(),graph,result,active,expanded,emitted);
            }
            expanded.add(id);
        }
        active.remove(id);
    }

    private void expandRequiredAtomic(String id, Map<String, LearningGoal> goals, Set<String> result, Set<String> visited) {
        require(visited.add(id), "contains cycle in prerequisite closure");
        LearningGoal goal = goals.get(id);
        require(goal != null, "missing closure goal");
        if (goal.getContains() == null || goal.getContains().isEmpty()) result.add(id);
        else for (String child : goal.getContains()) expandRequiredAtomic(child, goals, result, visited);
        visited.remove(id);
    }

    private void validateNodes(JsonNode nodes, Map<String, LearningGoal> goals, Set<String> targets, Set<String> structureIds, int depth) {
        require(nodes != null && nodes.isArray() && !nodes.isEmpty() && depth < 32, "invalid supplemental composition tree");
        for (JsonNode node : nodes) {
            String kind = text(node, "kind");
            if ("structure".equals(kind)) {
                closed(node, Set.of("kind", "id", "label", "children"));
                require(structureIds.add(text(node, "id")), "duplicate structure identity"); text(node, "label");
                validateNodes(node.get("children"), goals, targets, structureIds, depth + 1);
            } else {
                require("goalEntry".equals(kind), "v1 supports only structures and owner-local atomic goal entries");
                closed(node, Set.of("kind", "goalId", "projectionRole", "displayLabel"));
                require(!node.has("projectionRole") || "target".equals(text(node, "projectionRole")), "supplement targets must be explicit Math targets");
                String id = text(node, "goalId");
                LearningGoal goal = goals.get(id);
                require(goal != null && (goal.getContains() == null || goal.getContains().isEmpty()), "foreign, missing or non-atomic supplemental target");
                require(targets.add(id), "duplicate supplemental target");
            }
        }
    }

    private Map<String, String> scope(JsonNode node) {
        closed(node, DIMENSIONS);
        Map<String, String> result = new LinkedHashMap<>();
        node.fieldNames().forEachRemaining(key -> result.put(key, text(node, key)));
        require("Gymnasium".equals(result.get("schoolForm")) && Set.of("SekI", "SekII").contains(result.get("stage")), "explicit Gymnasium stage required");
        require(result.containsKey("jurisdiction") && result.get("jurisdiction").matches("DE(?:-[A-Z]{2})?"), "exact jurisdiction required");
        require(!"SekI".equals(result.get("stage")) || !result.containsKey("courseProfile"), "SekI has no inferred course profile");
        require(!"SekII".equals(result.get("stage")) || Set.of("GK", "LK", "GK+LK").contains(result.getOrDefault("courseProfile", "")), "explicit Math course profile required");
        require(!result.containsKey("durationModel") || Set.of("G8", "G9").contains(result.get("durationModel")), "invalid duration");
        return Collections.unmodifiableMap(result);
    }

    private void validateFileBinding(JsonNode node) {
        closed(node, Set.of("path", "sha256"));
        try { require(hash(Files.readAllBytes(boundPath(text(node, "path")))).equals(text(node, "sha256")), "stale review/source evidence"); }
        catch (IOException e) { throw failure("missing retained evidence", e); }
    }

    private Path boundPath(String value) {
        Path path = root.resolve(value).normalize();
        require(!Path.of(value).isAbsolute() && path.startsWith(root), "evidence escapes curriculum root");
        assertOwnedPath(path);
        return path;
    }

    private void assertOwnedPath(Path path) {
        require(path.normalize().startsWith(root), "path escapes curriculum root");
        Path current = root;
        for (Path part : root.relativize(path.normalize())) {
            current = current.resolve(part);
            require(!Files.isSymbolicLink(current), "symbolic authorization path is forbidden");
        }
        try { require(path.toRealPath().startsWith(root.toRealPath()), "path escapes curriculum root"); }
        catch (IOException e) { throw failure("missing retained evidence", e); }
    }

    private JsonNode read(Path path) {
        assertOwnedPath(path);
        try { require(Files.size(path) <= 8_000_000, "oversized supplement evidence"); return mapper.readTree(path.toFile()); }
        catch (IOException e) { throw failure("cannot parse authored supplement evidence", e); }
    }
    private static void closed(JsonNode node, Set<String> fields) {
        require(node != null && node.isObject(), "closed object required");
        node.fieldNames().forEachRemaining(key -> require(fields.contains(key), "unknown supplemental field " + key));
    }
    private static String text(JsonNode node, String key) {
        JsonNode value = node == null ? null : node.get(key);
        require(value != null && value.isTextual() && !value.textValue().isBlank() && value.textValue().equals(value.textValue().trim()), "missing/invalid " + key);
        return value.textValue();
    }
    private static List<String> strings(JsonNode node) {
        require(node != null && node.isArray(), "explicit string list required");
        List<String> result = new ArrayList<>();
        for (JsonNode value : node) { require(value.isTextual() && !value.textValue().isBlank() && !result.contains(value.textValue()), "invalid/duplicate list member"); result.add(value.textValue()); }
        return List.copyOf(result);
    }
    public static String sha(JsonNode node) { return hash(canonical(node).toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)); }
    private static JsonNode canonical(JsonNode node) {
        if (node.isObject()) {
            ObjectNode out = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode();
            TreeMap<String, JsonNode> children = new TreeMap<>(); node.fields().forEachRemaining(e -> children.put(e.getKey(), e.getValue()));
            children.forEach((key, value) -> out.set(key, canonical(value))); return out;
        }
        if (node.isArray()) {
            var out = com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.arrayNode(); node.forEach(value -> out.add(canonical(value))); return out;
        }
        return node;
    }
    public static String hashBytes(byte[] bytes) { return hash(bytes); }
    private static String hash(byte[] bytes) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
        catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    private static void require(boolean condition, String message) { if (!condition) throw failure(message); }
    private static IllegalStateException failure(String message) { return new IllegalStateException("Invalid Mathematics preparation: " + message); }
    private static IllegalStateException failure(String message, Exception cause) { return new IllegalStateException("Invalid Mathematics preparation: " + message, cause); }
}
