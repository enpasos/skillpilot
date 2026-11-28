package com.skillpilot.backend.service;

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
        var extensions = groups.stream().flatMap(group -> group.extensions().stream()).toList();
        if (extensions.isEmpty()) return List.of();
        boolean hessePhysics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a".equals(view.get("landscapeId"))
                && view.get("scope") instanceof Map<?, ?> scope && "DE-HE".equals(scope.get("jurisdiction"))
                && ("SekII".equals(scope.get("stage")) || "CrossStage".equals(scope.get("stage")));
        String baseDe = "Basis – die gemeinsamen Themen und Aufgaben.";
        String baseEn = "Base – the common topics and tasks.";
        if (hessePhysics) {
            baseDe = "Basis – die verbindlichen Themenfelder mit ihren Aufgaben.";
            baseEn = "Base – the required topics and their tasks.";
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
