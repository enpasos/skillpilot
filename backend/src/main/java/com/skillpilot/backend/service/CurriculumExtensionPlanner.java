package com.skillpilot.backend.service;

import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_CONFIRM;
import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_DESELECT;
import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_INDIVIDUAL;
import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_MAXIMUM;
import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_MINIMUM;
import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_SELECT;
import static com.skillpilot.backend.service.CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY;
import static com.skillpilot.backend.service.CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY;
import static com.skillpilot.backend.service.CurriculumPersonalizationPlanner.stableOptionId;

import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationPlan.ExtensionGroup;
import com.skillpilot.backend.api.PersonalizationPlan.ExtensionMember;
import com.skillpilot.backend.api.PersonalizationPlan.ExtensionStage;
import com.skillpilot.backend.api.PersonalizationPlan.Option;
import com.skillpilot.backend.api.PersonalizationPlan.OptionKind;
import com.skillpilot.backend.composition.CompositionViewExtensions.Group;
import com.skillpilot.backend.landscape.PersonalizationStage;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.BiFunction;
import java.util.function.Function;

final class CurriculumExtensionPlanner {
    static final String STAGE = "extensions";
    private static final String SELECTION = "extensionSelection";
    private static final String DRAFT = "extensionDraft";
    private static final String INDIVIDUAL = "individual";
    private static final String MINIMUM = "minimum";
    private static final String MAXIMUM = "maximum";
    private static final String SCOPE = "scope";
    private static final String LANDSCAPE = "landscapeId";
    private static final String MODE = "mode";

    private CurriculumExtensionPlanner() {}

    static PersonalizationPlan plan(String root, PersonalizationStage stage, List<String> subjects,
            Function<String, SkillLandscape> landscapes,
            BiFunction<String, Map<String, Map<String, Object>>, List<Group>> resolver,
            Map<String, Map<String, Object>> config, List<Option> navigation,
            List<PersonalizationPlan.CompletedDecision> completed) {
        for (String subject : subjects) {
            Map<String, Object> subjectSettings = config.getOrDefault(subject, Map.of());
            Object saved = subjectSettings.get(SELECTION);
            List<String> savedIds = saved instanceof List<?> values ? selectionIds(values) : List.of();
            if (subjectSettings.containsKey(SELECTION)
                    && !MAXIMUM.equals(saved) && (!(saved instanceof List<?>) || savedIds == null)) {
                return PersonalizationPlan.invalid("personalization-extension-selection-invalid");
            }
            List<Group> groups = resolver.apply(subject, config);
            if (groups.isEmpty() || MAXIMUM.equals(saved)
                    || (saved instanceof List<?> && meetsMinimum(groups, Set.copyOf(savedIds)))) {
                continue;
            }

            String scope = scopeId(root, subject, config, groups);
            Draft draft = readDraft(root, subject, scope, config.get(FLOW_STATE_CONFIG_KEY), savedIds);
            if (draft == null) return PersonalizationPlan.invalid("personalization-extension-draft-invalid");
            return subjectPlan(stage, landscapes.apply(subject), scope, groups, draft, navigation, completed);
        }
        return PersonalizationPlan.complete(navigation, completed);
    }

    private static PersonalizationPlan subjectPlan(PersonalizationStage stage, SkillLandscape landscape, String scope,
            List<Group> groups, Draft draft, List<Option> navigation,
            List<PersonalizationPlan.CompletedDecision> completed) {
        String subject = landscape.getLandscapeId();
        Set<String> selected = Set.copyOf(draft.ids());
        boolean minimum = MINIMUM.equals(draft.mode());
        List<Group> displayed = minimum
                ? groups.stream().filter(group -> countSelected(group, selected) < group.minSelections()).toList()
                : groups;
        List<Option> options = new ArrayList<>();
        List<Option> selectedOptions = new ArrayList<>();
        String revision = stableOptionId(scope, draft.mode(), String.join("\u0000", draft.ids()));
        int min = groups.stream().mapToInt(Group::minSelections).sum();
        int available = groups.stream().mapToInt(group -> group.extensions().size()).sum();
        for (Group group : displayed) {
            group.extensions().forEach(member -> {
                boolean chosen = selected.contains(member.id());
                var option = option(revision, scope, subject, group.id(), member.id(), member.label(), member.labelEn(),
                        chosen ? EXTENSION_DESELECT : EXTENSION_SELECT);
                if (chosen) selectedOptions.add(option);
                if (!minimum || !chosen) options.add(option);
            });
        }
        if (minimum) {
            options.add(option(revision, scope, subject, STAGE, null, "Einzelauswahl", "Individual selection", EXTENSION_INDIVIDUAL));
        }
        options.add(option(revision, scope, subject, STAGE, null, "Minimum", "Minimum", EXTENSION_MINIMUM));
        options.add(option(revision, scope, subject, STAGE, null, "Maximum", "Maximum", EXTENSION_MAXIMUM));
        if (meetsMinimum(groups, selected)) {
            options.add(option(revision, scope, subject, STAGE, null, "Auswahl bestätigen", "Confirm selection", EXTENSION_CONFIRM));
        }
        int count = groups.stream().mapToInt(group -> countSelected(group, selected)).sum();
        var plan = PersonalizationPlan.selection(stage.getId(), stage.getLabel(), stage.getLabelEn(),
                STAGE, stage.getLabel(), stage.getLabelEn(), subject, min, available, count,
                options, List.of(), navigation, selectedOptions, null, completed, List.of());
        return plan.withExtensionStage(new ExtensionStage(subject, landscape.getTitle(), landscape.getTitleEn(), draft.mode(),
                displayed.stream().map(group -> new ExtensionGroup(group.id(), groupInstance(subject, group.id()), group.label(), group.labelEn(),
                        group.origin(), group.minSelections(), group.rule(),
                        group.extensions().stream().map(member -> new ExtensionMember(member.id(),
                                member.label(), member.labelEn(), member.previouslyRegular())).toList())).toList(),
                draft.ids()));
    }

    static void apply(String root, Map<String, Object> config, PersonalizationPlan plan, Option option) {
        ExtensionStage stage = Objects.requireNonNull(plan.extensionStage());
        String subject = stage.landscapeId();
        Map<String, Object> settings = objectMap(config.get(subject));
        Map<String, Object> flow = objectMap(config.get(FLOW_STATE_CONFIG_KEY));
        if (!root.equals(flow.get(ROOT_LANDSCAPE_ID_KEY))) flow.clear();
        flow.put(ROOT_LANDSCAPE_ID_KEY, root);
        List<String> ids = new ArrayList<>(stage.selectedIds());
        if (option.kind() == EXTENSION_CONFIRM || option.kind() == EXTENSION_MAXIMUM) {
            settings.put(SELECTION, option.kind() == EXTENSION_MAXIMUM ? MAXIMUM : List.copyOf(ids));
            config.put(subject, settings);
            flow.remove(DRAFT);
        } else {
            String mode = stage.mode();
            switch (option.kind()) {
                case EXTENSION_SELECT -> ids.add(option.scopeValue());
                case EXTENSION_DESELECT -> ids.remove(option.scopeValue());
                case EXTENSION_INDIVIDUAL -> mode = INDIVIDUAL;
                case EXTENSION_MINIMUM -> {
                    if (!MINIMUM.equals(mode)) {
                        for (ExtensionGroup group : stage.groups()) {
                            List<String> members = group.extensions().stream().map(ExtensionMember::id).toList();
                            if (members.stream().filter(ids::contains).count() > group.minSelections()) {
                                ids.removeAll(members);
                            }
                        }
                    }
                    mode = MINIMUM;
                }
                default -> throw new IllegalArgumentException("Unsupported extension action");
            }
            flow.put(DRAFT, Map.of(LANDSCAPE, subject, SCOPE, option.scopeKey(), MODE, mode,
                    SELECTION, List.copyOf(ids)));
        }
        config.put(FLOW_STATE_CONFIG_KEY, flow);
    }

    static boolean retainStoredSelections(Map<String, Map<String, Object>> stored, Map<String, Object> incoming) {
        for (var entry : incoming.entrySet()) {
            if (entry.getValue() instanceof Map<?, ?> settings && settings.containsKey(SELECTION)) {
                var previous = stored.getOrDefault(entry.getKey(), Map.of());
                if (!previous.containsKey(SELECTION) || !Objects.equals(settings.get(SELECTION), previous.get(SELECTION))) {
                    return false;
                }
            }
        }
        stored.forEach((subject, previous) -> {
            if (previous.containsKey(SELECTION)) {
                var settings = objectMap(incoming.get(subject));
                settings.put(SELECTION, previous.get(SELECTION));
                incoming.put(subject, settings);
            }
        });
        return true;
    }

    private static Draft readDraft(String root, String subject, String scope, Map<String, Object> flow,
            List<String> savedIds) {
        if (flow != null && root.equals(flow.get(ROOT_LANDSCAPE_ID_KEY))
                && flow.get(DRAFT) instanceof Map<?, ?> draft
                && subject.equals(draft.get(LANDSCAPE)) && scope.equals(draft.get(SCOPE))) {
            Object mode = draft.get(MODE);
            Object selection = draft.get(SELECTION);
            List<String> ids = selection instanceof List<?> values ? selectionIds(values) : null;
            return ids == null || !INDIVIDUAL.equals(mode) && !MINIMUM.equals(mode)
                    ? null : new Draft((String) mode, ids);
        }
        return new Draft(INDIVIDUAL, savedIds);
    }

    private static boolean meetsMinimum(List<Group> groups, Set<String> selected) {
        return groups.stream().allMatch(group -> countSelected(group, selected) >= group.minSelections());
    }

    private static int countSelected(Group group, Set<String> selected) {
        return (int) group.extensions().stream().filter(member -> selected.contains(member.id())).count();
    }

    private static String scopeId(String root, String subject, Map<String, Map<String, Object>> config, List<Group> groups) {
        List<String> parts = new ArrayList<>(List.of(STAGE, root, subject));
        new TreeMap<>(config).forEach((id, settings) -> {
            if (!FLOW_STATE_CONFIG_KEY.equals(id)) {
                parts.add(id);
                parts.add(new TreeMap<>(settings).toString());
            }
        });
        groups.forEach(group -> {
            parts.add(group.id());
            parts.add(group.origin());
            parts.add(Integer.toString(group.minSelections()));
            parts.add(new TreeMap<>(group.rule()).toString());
            group.extensions().forEach(member -> parts.add(member.id()));
        });
        return stableOptionId(parts.toArray(String[]::new));
    }

    private static Option option(String revision, String scope, String subject, String group, String value, String label,
            String labelEn, OptionKind kind) {
        return new Option(stableOptionId(revision, group, kind.name(), value == null ? "" : value),
                STAGE, group, value == null ? subject : groupInstance(subject, group),
                subject, null, null, null, scope, value, label, kind, null, null, labelEn);
    }

    private static String groupInstance(String subject, String group) {
        return stableOptionId(STAGE, subject, group);
    }

    private static List<String> selectionIds(List<?> values) {
        Set<String> ids = new LinkedHashSet<>();
        for (Object value : values) {
            if (!(value instanceof String id) || id.isBlank() || !id.equals(id.trim()) || !ids.add(id)) return null;
        }
        return List.copyOf(ids);
    }

    private static Map<String, Object> objectMap(Object raw) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (raw instanceof Map<?, ?> map) {
            map.forEach((key, value) -> {
                if (key instanceof String name) result.put(name, value);
            });
        }
        return result;
    }

    private record Draft(String mode, List<String> ids) {}
}
