package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Explicit source of user-selectable curriculum-personalization options.
 *
 * <p>These sources are deliberately independent of the competence graph.
 * Neither {@code contains} nor {@code requires} may be interpreted as a
 * personalization decision.</p>
 */
public enum PersonalizationSourceKind {
    LANDSCAPE_FILTERS("landscapeFilters"),
    LANDSCAPES("landscapes"),
    FILTERS_FOR_SELECTED_LANDSCAPES("filtersForSelectedLandscapes"),
    SCOPE_VALUES("scopeValues");

    private final String wireValue;

    PersonalizationSourceKind(String wireValue) {
        this.wireValue = wireValue;
    }

    @JsonValue
    public String wireValue() {
        return wireValue;
    }

    @JsonCreator
    public static PersonalizationSourceKind fromWireValue(String value) {
        if (value == null) {
            return null;
        }
        for (PersonalizationSourceKind kind : values()) {
            if (kind.wireValue.equals(value)) {
                return kind;
            }
        }
        throw new IllegalArgumentException("Unsupported personalization source kind: " + value);
    }
}
