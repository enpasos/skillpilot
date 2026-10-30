package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.*;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CompletionApplicabilityTest {
    @Test void allTargetSubjectsMustMatchDeclaredRestrictions() {
        var restrictions = Map.of("jurisdiction", List.of("DE-HE", "DE-BY"));
        CompletionApplicability.requireMatches(restrictions,
                List.of(Map.of("jurisdiction", "de-he"), Map.of("jurisdiction", "DE-BY")));
        assertThatThrownBy(() -> CompletionApplicability.requireMatches(restrictions,
                List.of(Map.of("jurisdiction", "DE-HE"), Map.of("jurisdiction", "DE-NW"))))
                .isInstanceOf(CompletionApplicationService.ScopeNotApplicableException.class);
    }

    @Test void unresolvedAndUnsupportedDimensionsNeverBecomeImplicitPermission() {
        assertThatThrownBy(() -> CompletionApplicability.requireMatches(Map.of("stage", List.of("SekII")),
                List.of(Map.of("courseProfile", "LK"))))
                .isInstanceOf(CompletionApplicability.UnresolvedScopeException.class);
        assertThatThrownBy(() -> CompletionApplicability.requireMatches(Map.of("futureDimension", List.of("x")), List.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test void reusesExistingCombinedStageAndCourseScopeCompatibility() {
        CompletionApplicability.requireMatches(Map.of("stage", List.of("SekII"), "courseProfile", List.of("LK")),
                List.of(Map.of("stage", "CrossStage", "courseProfile", "GK+LK")));
        assertThatThrownBy(() -> CompletionApplicability.requireMatches(Map.of("courseProfile", List.of("LK")),
                List.of(Map.of("courseProfile", "GK"))))
                .isInstanceOf(CompletionApplicationService.ScopeNotApplicableException.class);
    }
}
