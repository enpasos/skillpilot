package com.skillpilot.backend.composition;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Reads the materializer's existing v1.3 index. It authors no placements or order. */
public final class StagePlanRuntimeIndex {
    private static final String INDEX = "curricula/DE/Gymnasium/stage-plans/generated/index.json";
    private static final TypeReference<Map<String, Object>> MAP = new TypeReference<>() {};
    private final Path root;
    private final ObjectMapper mapper;
    private final Map<String, Map<String, Object>> plans = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> views = new LinkedHashMap<>();
    private final Map<String, String> artifacts = new LinkedHashMap<>();
    private final Map<String, List<String>> canonicalChildren = new LinkedHashMap<>();
    private final Map<String, Object> indexSource;

    private StagePlanRuntimeIndex(Path curriculumDirectory, ObjectMapper mapper, boolean unavailable) {
        this.root = curriculumDirectory.toAbsolutePath().normalize().getParent();
        this.mapper = Objects.requireNonNull(mapper);
        this.indexSource = Map.of();
        require(unavailable, "invalid disabled reader construction");
    }

    /** Learner reads may fall back to compatibility presentation; QA uses the strict constructor. */
    public static StagePlanRuntimeIndex unavailable(Path curriculumDirectory, ObjectMapper mapper) {
        return new StagePlanRuntimeIndex(curriculumDirectory, mapper, true);
    }

    public StagePlanRuntimeIndex(Path curriculumDirectory, ObjectMapper mapper) {
        this.root = curriculumDirectory.toAbsolutePath().normalize().getParent();
        this.mapper = Objects.requireNonNull(mapper);
        Path path = root.resolve(INDEX);
        if (!Files.exists(path, LinkOption.NOFOLLOW_LINKS)) {
            require(!Files.exists(root.resolve("curricula/DE/Gymnasium/stage-plans/catalog.json")), "catalog exists without its generated index");
            indexSource = Map.of();
            return;
        }
        byte[] raw = bytes(INDEX);
        indexSource = Map.of("path", INDEX, "sha256", digest(raw));
        Map<String, Object> index = document(raw);
        require("https://skillpilot.com/schemas/curriculum-package/v1.3/stage-plan-projection-index.schema.json".equals(index.get("$schema"))
                && "1.0".equals(index.get("indexFormatVersion"))
                && "skillpilot-stage-plan-materializer-v1".equals(index.get("generatedBy"))
                && "canonical-gymnasium-21".equals(index.get("canonicalDomain")), "unsupported index identity/domain");
        Map<String, Object> catalogAuthority = pin(object(index.get("catalog")));
        Map<String, Object> activationAuthority = pin(object(index.get("activationSource")));
        require(Objects.equals(catalogAuthority.get("revision"), object(index.get("catalog")).get("revision")), "catalog revision differs from its raw authority");
        List<Map<String, Object>> canonical = objects(index.get("canonicalSources"));
        require(canonical.size() == 21, "the complete canonical 21-root inventory is required");
        Set<String> canonicalIds = new LinkedHashSet<>();
        Map<String, String> owners = new LinkedHashMap<>();
        for (Map<String, Object> source : canonical) {
            require(canonicalIds.add(string(source.get("landscapeId"))), "duplicate canonical identity");
            require(string(source.get("path")).startsWith("curricula/DE/Gymnasium/canonical/"), "canonical source outside its domain");
            Map<String, Object> landscape = pin(source);
            require(Objects.equals(landscape.get("landscapeId"), source.get("landscapeId")), "canonical source identity differs from its pin");
            for (Map<String, Object> goal : objects(landscape.get("goals"))) {
                String id = string(goal.get("id"));
                require(owners.putIfAbsent(id, string(source.get("landscapeId"))) == null, "ambiguous canonical goal identity");
                canonicalChildren.put(id, goal.containsKey("contains") ? strings(goal.get("contains")) : List.of());
            }
        }
        canonicalChildren.replaceAll((id, children) -> children.stream().map(ref -> {
            String[] parts = ref.split(":", -1); String child = parts[parts.length - 1];
            require(parts.length <= 2 && owners.containsKey(child) && (parts.length == 1 || parts[0].equals(owners.get(child))), "unresolved canonical child");
            return child;
        }).toList());
        List<Map<String, Object>> inventories = objects(index.get("inventorySources"));
        require(inventories.stream().anyMatch(source -> "curricula/curriculum_manifest.json".equals(source.get("path"))), "missing canonical manifest pin");
        for (Map<String, Object> source : inventories) pin(source);
        for (Map<String, Object> entry : objects(index.get("plans"))) {
            Map<String, Object> plan = object(entry.get("plan"));
            require(plan.equals(pin(object(entry.get("source")))), "embedded plan differs from its pinned authority");
            String id = string(plan.get("planId"));
            require(plans.putIfAbsent(id, plan) == null, "duplicate plan identity " + id);
            validatePlan(plan);
        }
        require(!plans.isEmpty(), "empty activated plan inventory");
        Set<Map<String, Object>> scopes = new LinkedHashSet<>();
        for (Map<String, Object> plan : plans.values()) require(scopes.add(object(plan.get("scope"))), "two plans claim one Land/duration scope");
        Map<String, String> sharedPlacements = new LinkedHashMap<>();
        for (Map<String, Object> entry : objects(index.get("views"))) {
            String id = string(entry.get("viewId"));
            require(views.putIfAbsent(id, entry) == null, "duplicate indexed view " + id);
            Map<String, Object> authority = pin(object(entry.get("source")));
            require("https://skillpilot.com/schemas/curriculum-package/v1.3/composition-view.schema.json".equals(authority.get("$schema"))
                    && "1.1".equals(authority.get("viewFormatVersion")) && id.equals(authority.get("viewId"))
                    && Objects.equals(entry.get("landscapeId"), authority.get("landscapeId")), "view source is not its declared v1.3 authority");
            Map<String, Object> artifact = pin(object(entry.get("artifact")));
            require(!CompositionViewExtensions.supports(artifact) && !CompositionViewExtensions.SCHEMA.equals(artifact.get("$schema"))
                    && !artifact.containsKey("electionGroups")
                    && !artifact.containsKey(CompositionViewExtensions.HISTORICAL_ASSESSMENT_PLACEMENTS), "composition view 1.3 cannot supply a stage-plan artifact");
            require(id.equals(artifact.get("viewId")) && Objects.equals(entry.get("scope"), artifact.get("scope"))
                    && Objects.equals(entry.get("landscapeId"), artifact.get("landscapeId")), "indexed view envelope differs from artifact " + id);
            String artifactPath = string(object(entry.get("artifact")).get("path"));
            require(artifactPath.startsWith("curricula/DE/Gymnasium/composition-views/"), "view artifact outside its domain");
            require(!artifacts.containsValue(artifactPath), "two indexed views claim one artifact path");
            artifacts.put(id, artifactPath);
            List<String> ids = strings(entry.get("planIds"));
            require(!ids.isEmpty() && new LinkedHashSet<>(ids).size() == ids.size(), "empty or duplicate selected plan IDs");
            Map<String, Object> binding = object(authority.get("planBinding"));
            List<String> authorityPlans = binding.containsKey("planIds") ? strings(binding.get("planIds")) : List.of(string(binding.get("planId")));
            require(new LinkedHashSet<>(ids).equals(new LinkedHashSet<>(authorityPlans)), "indexed plans differ from source view binding");
            for (String planId : ids) {
                Map<String, Object> plan = plans.get(planId);
                require(plan != null, "unknown selected plan " + planId);
                validateBindings(plan, entry, artifact);
                for (Map<String, Object> placement : objects(entry.get("placements"))) {
                    String key = planId + ":" + string(placement.get("goalId"));
                    String previous = sharedPlacements.putIfAbsent(key, string(placement.get("planUnitId")));
                    require(previous == null || previous.equals(placement.get("planUnitId")), "conflicting course/subject placement for " + key);
                }
            }
        }
        Map<String, Object> activation = object(index.get("activationInventory"));
        require(new LinkedHashSet<>(strings(activation.get("planIds"))).equals(new LinkedHashSet<>(strings(activationAuthority.get("planIds")))), "embedded activation plan set differs from its pinned authority");
        require(new LinkedHashSet<>(strings(activation.get("planIds"))).equals(plans.keySet()), "activation and indexed plans differ");
        Map<String, String> activatedViews = new LinkedHashMap<>();
        for (Map<String, Object> view : objects(activation.get("views"))) require(activatedViews.putIfAbsent(string(view.get("viewId")), string(view.get("outputPath"))) == null, "duplicate activated view");
        require(activatedViews.equals(artifacts), "activation and indexed artifacts differ");
        Map<String, String> sourceActivatedViews = new LinkedHashMap<>();
        for (Map<String, Object> view : objects(activationAuthority.get("views"))) require(sourceActivatedViews.putIfAbsent(string(view.get("viewId")), string(view.get("outputPath"))) == null, "duplicate activation-source view");
        require(sourceActivatedViews.equals(activatedViews), "embedded activation view set differs from its pinned authority");
        Map<String, String> catalogPlans = new LinkedHashMap<>();
        for (Map<String, Object> entry : objects(catalogAuthority.get("plans"))) require(catalogPlans.putIfAbsent(string(entry.get("planId")), string(entry.get("path"))) == null, "duplicate catalog plan");
        require(catalogPlans.keySet().equals(plans.keySet()), "catalog and indexed plan inventories differ");
        for (Map<String, Object> entry : objects(index.get("plans"))) require(Objects.equals(catalogPlans.get(object(entry.get("plan")).get("planId")), object(entry.get("source")).get("path")), "catalog plan source differs from index");
        Map<String, Map<String, Object>> catalogViews = new LinkedHashMap<>();
        for (Map<String, Object> entry : objects(catalogAuthority.get("views"))) require(catalogViews.putIfAbsent(string(entry.get("viewId")), entry) == null, "duplicate catalog view");
        require(catalogViews.keySet().equals(views.keySet()), "catalog and indexed view inventories differ");
        views.forEach((id, entry) -> require(Objects.equals(catalogViews.get(id).get("path"), object(entry.get("source")).get("path"))
                && Objects.equals(catalogViews.get(id).get("outputPath"), artifacts.get(id)), "catalog view paths differ from index"));
    }

    public boolean owns(String viewId) { return views.containsKey(viewId); }

    /** Source IDs are checked before metadata is added; the authored bytes stay untouched. */
    public Map<String, Object> instrument(Path file, Map<String, Object> view) {
        require(!view.containsKey("stagePlanProjection"), "persisted view cannot self-assert verified runtime metadata");
        String id = string(view.get("viewId"));
        Map<String, Object> indexed = views.get(id);
        if (indexed == null) return view;
        require(root.resolve(artifacts.get(id)).equals(file.toAbsolutePath().normalize()), "view ID collision outside its pinned artifact " + id);
        Map<String, String> units = new LinkedHashMap<>();
        for (Map<String, Object> binding : objects(indexed.get("structureBindings"))) units.put(string(binding.get("structureId")), string(binding.get("planUnitId")));
        Map<String, Object> copy = new LinkedHashMap<>(view);
        copy.put("rootNodes", instrumentNodes(objects(view.get("rootNodes")), units));
        return copy;
    }

    /** Select one already declared Land/duration plan. Missing scope never guesses a duration. */
    public Map<String, Object> bind(Map<String, Object> view, Map<String, String> requested) {
        List<String> sourceIds = view.containsKey("mergedFromViewIds") ? strings(view.get("mergedFromViewIds")) : List.of(string(view.get("viewId")));
        List<Map<String, Object>> indexed = sourceIds.stream().map(views::get).filter(Objects::nonNull).toList();
        if (indexed.isEmpty()) return view;
        require(indexed.size() == sourceIds.size(), "mixed indexed and legacy authorities in one merged view");
        Set<String> candidates = new LinkedHashSet<>(strings(indexed.getFirst().get("planIds")));
        indexed.forEach(entry -> candidates.retainAll(strings(entry.get("planIds"))));
        candidates.removeIf(id -> !scopeMatches(object(plans.get(id).get("scope")), requested));
        require(candidates.size() == 1, "selected Land/duration does not identify exactly one plan");
        Map<String, Object> plan = plans.get(candidates.iterator().next());
        Map<String, Map<String, Object>> units = unitMap(plan);
        List<Map<String, Object>> bindings = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        collectRuntimeBindings(objects(view.get("rootNodes")), units, bindings, seen);
        Set<String> required = new LinkedHashSet<>();
        for (Map<String, Object> source : indexed) for (Map<String, Object> placement : objects(source.get("placements"))) {
            for (String unit = string(placement.get("planUnitId")); units.containsKey(unit); unit = string(units.get(unit).get("parentUnitId"))) required.add(unit);
        }
        require(seen.containsAll(required), "native merge lost a target-bearing declared unit or its ancestor");
        Map<String, Map<String, Object>> actualBindings = new LinkedHashMap<>();
        bindings.forEach(binding -> actualBindings.put(string(binding.get("structureId")), binding));
        validateNodeBindings(objects(view.get("rootNodes")), actualBindings, units,
                string(object(plan.get("rootUnit")).get("id")), new LinkedHashSet<>());
        Map<String, Object> copy = new LinkedHashMap<>(view);
        copy.put("stagePlanProjection", Map.of("plan", plan, "indexSource", indexSource,
                "views", List.of(Map.of("viewId", view.get("viewId"), "planIds", List.of(plan.get("planId")), "structureBindings", bindings))));
        return copy;
    }

    private static List<Map<String, Object>> instrumentNodes(List<Map<String, Object>> nodes, Map<String, String> units) {
        return nodes.stream().map(node -> {
            Map<String, Object> copy = new LinkedHashMap<>(node);
            if ("structure".equals(node.get("kind"))) {
                String unit = units.get(string(node.get("id")));
                if (unit != null) copy.put("planUnitId", unit);
                copy.put("children", instrumentNodes(objects(node.get("children")), units));
            }
            return copy;
        }).toList();
    }

    private static void collectRuntimeBindings(List<Map<String, Object>> nodes, Map<String, Map<String, Object>> units,
            List<Map<String, Object>> result, Set<String> seen) {
        for (Map<String, Object> node : nodes) if ("structure".equals(node.get("kind"))) {
            if (node.containsKey("planUnitId")) {
                String id = string(node.get("planUnitId"));
                require(units.containsKey(id) && seen.add(id), "unknown or repeated plan unit after native merge " + id);
                Map<String, Object> binding = new LinkedHashMap<>(units.get(id));
                binding.remove("id"); binding.remove("label"); binding.remove("labelEn"); binding.remove("basis");
                binding.put("planUnitId", id); binding.put("structureId", node.get("id"));
                Map<String, Object> unit = units.get(id);
                String parent = string(unit.get("parentUnitId"));
                binding.put("order", units.containsKey(parent) ? strings(units.get(parent).get("children")).indexOf(id)
                        : "SekI".equals(unit.get("stage")) ? 0 : 1);
                result.add(binding);
            }
            collectRuntimeBindings(objects(node.get("children")), units, result, seen);
        }
    }

    private static boolean scopeMatches(Map<String, Object> scope, Map<String, String> requested) {
        return scope.entrySet().stream().allMatch(entry -> string(entry.getValue()).equalsIgnoreCase(requested.getOrDefault(entry.getKey(), "")));
    }

    private static void validatePlan(Map<String, Object> plan) {
        require("https://skillpilot.com/schemas/curriculum-package/v1.3/stage-plan.schema.json".equals(plan.get("$schema"))
                && "1.0".equals(plan.get("planFormatVersion")), "unsupported plan contract");
        Map<String, Object> root = object(plan.get("rootUnit"));
        Map<String, Map<String, Object>> units = unitMap(plan);
        List<String> stages = strings(root.get("children"));
        require(stages.size() == 2 && !stages.getFirst().equals(stages.getLast()), "root must declare exactly two distinct stages");
        Set<String> reached = new LinkedHashSet<>();
        for (int i = 0; i < 2; i++) {
            Map<String, Object> stage = units.get(stages.get(i));
            require(stage != null && "stage".equals(stage.get("kind")) && (i == 0 ? "SekI" : "SekII").equals(stage.get("stage"))
                    && Objects.equals(stage.get("parentUnitId"), root.get("id"))
                    && strings(stage.get("after")).equals(i == 0 ? List.of() : List.of(stages.getFirst())), "invalid declared root stage/order");
            require(reached.add(stages.get(i)), "duplicate stage");
            List<String> children = stage.containsKey("children") ? strings(stage.get("children")) : List.of();
            int previous = -1;
            for (int j = 0; j < children.size(); j++) {
                String id = children.get(j); Map<String, Object> child = units.get(id);
                require(child != null && reached.add(id) && Objects.equals(child.get("parentUnitId"), stages.get(i))
                        && Objects.equals(child.get("stage"), stage.get("stage")) && !child.containsKey("children")
                        && strings(child.get("after")).equals(j == 0 ? List.of() : List.of(children.get(j - 1))), "invalid nested parent/membership/order");
                int slot;
                if (i == 0) {
                    require("year".equals(child.get("kind")) && child.get("year") instanceof Number, "SekI children must be years");
                    Number year = (Number) child.get("year"); slot = year.intValue();
                    require(year.doubleValue() == slot && slot >= 1 && slot <= 13, "invalid year slot");
                } else {
                    require("phase".equals(child.get("kind")), "SekII children must be phases");
                    slot = List.of("E", "Q1", "Q2", "Q3", "Q4").indexOf(string(child.get("phase")));
                    require(slot >= 0, "invalid phase slot");
                }
                require(slot > previous, "backward or ambiguous temporal order"); previous = slot;
                Map<String, Object> basis = object(child.get("basis"));
                require(Set.of("officialSource", "reviewedStructure").contains(basis.get("kind")) && !strings(basis.get("references")).isEmpty(), "missing temporal source basis");
                if ("reviewedStructure".equals(basis.get("kind"))) string(basis.get("rationale"));
            }
        }
        require(reached.equals(units.keySet()), "unlisted or detached plan unit");
    }

    private void validateBindings(Map<String, Object> plan, Map<String, Object> indexed, Map<String, Object> artifact) {
        Map<String, Object> planScope = object(plan.get("scope")), viewScope = object(indexed.get("scope"));
        for (String dimension : List.of("schoolForm", "jurisdiction", "durationModel")) {
            if (viewScope.containsKey(dimension)) require(Objects.equals(viewScope.get(dimension), planScope.get(dimension)), "view and selected plan scope disagree");
        }
        Map<String, Map<String, Object>> units = unitMap(plan), bindings = new LinkedHashMap<>();
        Set<String> placed = new LinkedHashSet<>();
        for (Map<String, Object> placement : objects(indexed.get("placements"))) {
            require(placed.add(string(placement.get("goalId"))) && units.containsKey(placement.get("planUnitId")), "duplicate or unbound target placement");
            Map<String, Object> unit = units.get(placement.get("planUnitId"));
            require(!unit.containsKey("children") || strings(unit.get("children")).isEmpty(), "target is ambiguously placed at a temporal aggregate");
            String stage = string(viewScope.get("stage"));
            require(Set.of("CrossStage", "SekI", "SekII").contains(stage) && ("CrossStage".equals(stage) || stage.equals(unit.get("stage"))), "stage excerpt contains a target of another stage");
        }
        Set<String> seenUnits = new LinkedHashSet<>();
        for (Map<String, Object> binding : objects(indexed.get("structureBindings"))) {
            String structure = string(binding.get("structureId")), unitId = string(binding.get("planUnitId"));
            Map<String, Object> unit = units.get(unitId);
            require(unit != null && bindings.putIfAbsent(structure, binding) == null && seenUnits.add(unitId), "duplicate or unknown structure binding");
            String parent = string(unit.get("parentUnitId"));
            int order = units.containsKey(parent) ? strings(units.get(parent).get("children")).indexOf(unitId) : "SekI".equals(unit.get("stage")) ? 0 : 1;
            require(binding.get("order") instanceof Number && ((Number) binding.get("order")).doubleValue() == order, "binding order differs from declared membership");
            for (String field : List.of("stage", "after", "kind", "parentUnitId", "children", "year", "phase")) {
                if (binding.containsKey(field)) require(Objects.equals(binding.get(field), unit.get(field)), "binding contradicts declared unit " + field);
            }
        }
        Set<String> seenStructures = new LinkedHashSet<>();
        validateNodeBindings(objects(artifact.get("rootNodes")), bindings, units, string(object(plan.get("rootUnit")).get("id")), seenStructures);
        require(seenStructures.containsAll(bindings.keySet()), "binding names absent structure");
        Map<String, String> declared = new LinkedHashMap<>(), actual = new LinkedHashMap<>();
        for (Map<String, Object> placement : objects(indexed.get("placements"))) declared.put(string(placement.get("goalId")), string(placement.get("planUnitId")));
        Set<String> targets = CourseProfileCompositionViewMerger.resolvedAtomicTargets(objects(artifact.get("rootNodes")), canonicalChildren);
        collectActualPlacements(objects(artifact.get("rootNodes")), bindings, targets, null, actual);
        require(actual.equals(declared), "index placements disagree with actual role-resolved artifact paths");
    }

    private void collectActualPlacements(List<Map<String, Object>> nodes, Map<String, Map<String, Object>> bindings,
            Set<String> targets, String unit, Map<String, String> actual) {
        for (Map<String, Object> node : nodes) {
            if ("structure".equals(node.get("kind"))) {
                Map<String, Object> binding = bindings.get(node.get("id"));
                collectActualPlacements(objects(node.get("children")), bindings, targets, binding == null ? unit : string(binding.get("planUnitId")), actual);
            } else if (!"prerequisiteOnly".equals(node.get("projectionRole"))) {
                require(Set.of("canonicalSubtree", "goalEntry").contains(node.get("kind")), "unsupported artifact reference kind");
                String ref = string(node.get("goalId")), id = ref.substring(ref.indexOf(':') + 1);
                require(canonicalChildren.containsKey(id), "unknown artifact goal");
                Set<String> covered = new LinkedHashSet<>();
                List<String> pending = new ArrayList<>(List.of(id));
                for (int i = 0; i < pending.size(); i++) if (covered.add(pending.get(i)) && "canonicalSubtree".equals(node.get("kind"))) pending.addAll(canonicalChildren.get(pending.get(i)));
                for (String goal : covered) if (targets.contains(goal)) {
                    require(unit != null && actual.putIfAbsent(goal, unit) == null, "missing or repeated actual target placement");
                }
            }
        }
    }

    private static void validateNodeBindings(List<Map<String, Object>> nodes, Map<String, Map<String, Object>> bindings,
            Map<String, Map<String, Object>> units, String parent, Set<String> seen) {
        validateNodeBindings(nodes, bindings, units, parent, seen, new LinkedHashMap<>());
    }

    private static void validateNodeBindings(List<Map<String, Object>> nodes, Map<String, Map<String, Object>> bindings,
            Map<String, Map<String, Object>> units, String parent, Set<String> seen, Map<String, Integer> lastOrderByParent) {
        for (Map<String, Object> node : nodes) if ("structure".equals(node.get("kind"))) {
            require(!node.containsKey("extension"), "composition view 1.3 cannot supply a stage-plan artifact");
            String id = string(node.get("id")); require(seen.add(id), "duplicate artifact structure ID");
            Map<String, Object> binding = bindings.get(id); String next = parent;
            if (binding != null) {
                next = string(binding.get("planUnitId"));
                require(parent.equals(units.get(next).get("parentUnitId")), "runtime structure nesting contradicts declared parent");
                int order = units.containsKey(parent) ? strings(units.get(parent).get("children")).indexOf(next)
                        : "SekI".equals(units.get(next).get("stage")) ? 0 : 1;
                Integer previous = lastOrderByParent.put(parent, order);
                require(order >= 0 && (previous == null || order > previous), "actual unit order contradicts declared siblings");
            }
            // Unbound subject wrappers retain the same temporal parent and order cursor.
            // Missing empty units are allowed, but the visible subsequence must stay ordered.
            validateNodeBindings(objects(node.get("children")), bindings, units, next, seen, lastOrderByParent);
        }
    }

    private static Map<String, Map<String, Object>> unitMap(Map<String, Object> plan) {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        for (Map<String, Object> unit : objects(plan.get("units"))) require(result.putIfAbsent(string(unit.get("id")), unit) == null, "duplicate unit identity");
        return result;
    }
    private Map<String, Object> pin(Map<String, Object> source) {
        byte[] raw = bytes(string(source.get("path")));
        require(digest(raw).equals(source.get("sha256")), "stale raw source " + source.get("path"));
        return document(raw);
    }
    private byte[] bytes(String relative) {
        require(relative.matches("[A-Za-z0-9][A-Za-z0-9._/-]*") && !List.of(relative.split("/")).contains("..")
                && !List.of(relative.split("/")).contains(".") && !relative.contains("//"), "unsafe source path");
        Path path = root;
        for (String part : relative.split("/")) { path = path.resolve(part); require(!Files.isSymbolicLink(path), "symlink source path"); }
        require(Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS), "missing regular source " + relative);
        try { return Files.readAllBytes(path); } catch (IOException e) { throw new IllegalStateException("Cannot read stage-plan source " + relative, e); }
    }
    private Map<String, Object> document(byte[] raw) {
        try { return mapper.readValue(raw, MAP); } catch (IOException e) { throw new IllegalStateException("Invalid stage-plan source JSON", e); }
    }
    private static String digest(byte[] raw) {
        try { return "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw)); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    @SuppressWarnings("unchecked") private static Map<String, Object> object(Object value) {
        require(value instanceof Map<?, ?>, "expected object"); return (Map<String, Object>) value;
    }
    private static List<Map<String, Object>> objects(Object value) {
        require(value instanceof List<?>, "expected object array"); return ((List<?>) value).stream().map(StagePlanRuntimeIndex::object).toList();
    }
    private static List<String> strings(Object value) {
        require(value instanceof List<?>, "expected string array"); return ((List<?>) value).stream().map(StagePlanRuntimeIndex::string).toList();
    }
    private static String string(Object value) { require(value instanceof String && !((String) value).isBlank(), "expected nonempty string"); return (String) value; }
    private static void require(boolean valid, String message) { if (!valid) throw new IllegalStateException("Stage-plan runtime index: " + message); }
}
