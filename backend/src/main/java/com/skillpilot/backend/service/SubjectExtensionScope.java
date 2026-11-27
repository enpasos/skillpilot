package com.skillpilot.backend.service;

import com.skillpilot.backend.composition.CompositionViewExtensions;
import com.skillpilot.backend.landscape.PersonalizationScopeValue;
import java.util.List;
import java.util.Map;

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

    static List<PersonalizationScopeValue> options(Map<String, Object> view) {
        if (!CompositionViewExtensions.supports(view)) return List.of();
        var groups = CompositionViewExtensions.groups(view);
        var extensions = groups.stream().flatMap(group -> group.deselectableExtensions().stream()).toList();
        if (extensions.isEmpty()) return List.of();
        boolean hessePhysics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a".equals(view.get("landscapeId"))
                && view.get("scope") instanceof Map<?, ?> scope && "DE-HE".equals(scope.get("jurisdiction"))
                && groups.stream().noneMatch(group -> group.minSelections() > 0);
        boolean hasRequiredChoice = groups.stream().anyMatch(group -> group.minSelections() > 0);
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
                value(MAXIMUM, "Alles – zur Basis kommen folgende Themen und Aufgaben hinzu: " + String.join(", ", de) + ".",
                        "Everything – the base also includes these topics and tasks: " + String.join(", ", en) + "."));
    }

    private static PersonalizationScopeValue value(String id, String german, String english) {
        var option = new PersonalizationScopeValue();
        option.setValue(id);
        option.setLabel(german + " Du kannst die Wahl später ändern.");
        option.setLabelEn(english + " You can change this choice later.");
        return option;
    }
}
