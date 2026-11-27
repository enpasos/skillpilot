package com.skillpilot.backend.service;

import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.composition.CompositionViewExtensions;
import com.skillpilot.backend.landscape.PersonalizationScopeValue;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Adapts the two stored curriculum choices to the existing Flow 1 scope options. */
final class SubjectExtensionScope {
    static final String KEY = "extensionSelection";
    static final String BASE = "base";
    static final String MAXIMUM = "maximum";

    private SubjectExtensionScope() {}

    static String optionValue(Object stored) {
        if (stored instanceof List<?> list && list.isEmpty()) return BASE;
        return MAXIMUM.equals(stored) ? MAXIMUM : null;
    }

    static Object storedValue(String option) {
        return switch (option) {
            case BASE -> List.of();
            case MAXIMUM -> MAXIMUM;
            default -> throw new IllegalArgumentException("Unknown subject scope option: " + option);
        };
    }

    /** The PUT's stored value must describe the same change as the offered Flow 1 option. */
    static void validateCockpitChoice(Map<String, Object> submitted, PersonalizationPlan.Option currentOption) {
        if (currentOption == null || currentOption.kind() != PersonalizationPlan.OptionKind.SCOPE_VALUE
                || !KEY.equals(currentOption.scopeKey())
                || !Map.of(currentOption.landscapeId(), Map.of(KEY, storedValue(currentOption.scopeValue())))
                        .equals(submitted)) {
            throw new IllegalArgumentException("The submitted subject scope differs from the current choice");
        }
    }

    /** The caller has unwrapped the single supported legacy envelope and holds the learner lock. */
    static Map<String, Object> mergeCockpitSettings(Map<String, Object> previous, Map<String, Object> submitted) {
        if (submitted.containsKey("personalCurriculum") || submitted.containsKey(KEY)) {
            throw new IllegalArgumentException("Invalid personal curriculum payload");
        }
        var result = new LinkedHashMap<>(submitted);
        for (var entry : submitted.entrySet()) {
            if (!(entry.getValue() instanceof Map<?, ?> fields) || !fields.containsKey(KEY)) continue;
            Object selection = fields.get(KEY);
            CompositionViewExtensions.validateStoredSelection(selection);
            if (fields.keySet().equals(Set.of(KEY))
                    || !(previous.get(entry.getKey()) instanceof Map<?, ?> before)
                    || !Objects.equals(selection, before.get(KEY))) {
                throw new IllegalArgumentException("A current subject scope option is required to change the selection");
            }
        }

        boolean hasSavedSelection = false;
        for (var entry : previous.entrySet()) {
            if (!(entry.getValue() instanceof Map<?, ?> before) || !before.containsKey(KEY)) continue;
            hasSavedSelection = true;
            Object replacement = result.get(entry.getKey());
            var settings = replacement instanceof Map<?, ?> fields
                    ? new LinkedHashMap<Object, Object>(fields)
                    : new LinkedHashMap<>();
            settings.put(KEY, before.get(KEY));
            result.put(entry.getKey(), settings);
        }
        String flowKey = CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY;
        if (previous.get(flowKey) instanceof Map<?, ?> flow
                && (hasSavedSelection || Boolean.FALSE.equals(
                        flow.get(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY)))) {
            result.put(flowKey, flow);
        }
        return result;
    }

    static List<PersonalizationScopeValue> options(Map<String, Object> view) {
        if (!CompositionViewExtensions.supports(view)) return List.of();
        var groups = CompositionViewExtensions.groups(view);
        var extensions = groups.stream().flatMap(group -> group.deselectableExtensions().stream()).toList();
        if (extensions.isEmpty()) return List.of();
        boolean hasRequiredChoice = groups.stream().anyMatch(group -> group.minSelections() > 0);
        boolean hessePhysics = !hasRequiredChoice
                && "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a".equals(view.get("landscapeId"))
                && view.get("scope") instanceof Map<?, ?> scope && "DE-HE".equals(scope.get("jurisdiction"))
                && ("SekII".equals(scope.get("stage")) || "CrossStage".equals(scope.get("stage")));
        String baseDe = "Basis – die gemeinsamen Themen und Aufgaben.";
        String baseEn = "Base – the common topics and tasks.";
        if (hessePhysics) {
            baseDe = "Basis – die verbindlichen Themenfelder mit ihren Aufgaben.";
            baseEn = "Base – the required topics and their tasks.";
        } else if (hasRequiredChoice) {
            baseDe = "Basis – die gemeinsamen Themen und die bisher regulären Themen jeder Pflichtwahl.";
            baseEn = "Base – the common topics and the previously included topics in each required choice.";
        }
        var de = extensions.stream().map(CompositionViewExtensions.Extension::label).toList();
        var en = extensions.stream().map(CompositionViewExtensions.Extension::labelEn).toList();
        return List.of(value(BASE, baseDe, baseEn),
                value(MAXIMUM, "Alles – zusätzlich zur Basis lernst du " + String.join(", ", de) + ".",
                        "Everything – in addition to the base, you study " + String.join(", ", en) + "."));
    }

    private static PersonalizationScopeValue value(String id, String german, String english) {
        var option = new PersonalizationScopeValue();
        option.setValue(id);
        option.setLabel(german + " Du kannst die Wahl später ändern.");
        option.setLabelEn(english + " You can change this choice later.");
        return option;
    }
}
