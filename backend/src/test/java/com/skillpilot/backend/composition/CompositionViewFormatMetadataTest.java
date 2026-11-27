package com.skillpilot.backend.composition;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CompositionViewFormatMetadataTest {
    private static final String SOURCE = "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json";
    private static final String RUNTIME = "https://skillpilot.com/schemas/curriculum-package/v1.3/runtime-composition-view.schema.json";

    @Test
    void preservesOnlyTheExplicitlyBoundComponentAndItsLanguage() {
        Map<String, Object> source = Map.of("viewFormatVersion", "1.2", "$schema", SOURCE, "language", "de-DE");
        Map<String, Object> runtime = Map.of("viewFormatVersion", "1.2", "$schema", RUNTIME, "language", "de-DE");
        assertThat(CompositionViewFormatMetadata.mergeSourceViews(List.of(source, source))).isEqualTo(source);
        assertThat(CompositionViewFormatMetadata.mergeRuntimeViews(List.of(runtime, runtime))).isEqualTo(runtime);
        assertThatThrownBy(() -> CompositionViewFormatMetadata.mergeSourceViews(List.of(runtime))).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> CompositionViewFormatMetadata.mergeRuntimeViews(List.of(source))).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> CompositionViewFormatMetadata.mergeSourceViews(List.of(source, runtime))).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void requiresAValidConsistentLanguageForNewComponentsAndAcceptsHeaderlessLegacy() {
        Map<String, Object> source = Map.of("viewFormatVersion", "1.2", "$schema", SOURCE, "language", "de");
        for (Object bad : List.of("", " ", "de_foo", 7)) {
            Map<String, Object> invalid = new LinkedHashMap<>(source);
            invalid.put("language", bad);
            assertThatThrownBy(() -> CompositionViewFormatMetadata.mergeSourceViews(List.of(invalid))).isInstanceOf(IllegalStateException.class);
        }
        Map<String, Object> missing = new LinkedHashMap<>(source);
        missing.remove("language");
        assertThatThrownBy(() -> CompositionViewFormatMetadata.mergeSourceViews(List.of(missing))).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> CompositionViewFormatMetadata.mergeSourceViews(List.of(source,
                Map.of("viewFormatVersion", "1.2", "$schema", SOURCE, "language", "en"))))
                .isInstanceOf(IllegalStateException.class);
        assertThat(CompositionViewFormatMetadata.mergeSourceViews(List.of(Map.of(), Map.of()))).isEmpty();
        assertThat(CompositionViewFormatMetadata.mergeRuntimeViews(List.of(Map.of(), Map.of("viewFormatVersion", "1.0"))))
                .containsEntry("viewFormatVersion", "1.0");
    }
}
