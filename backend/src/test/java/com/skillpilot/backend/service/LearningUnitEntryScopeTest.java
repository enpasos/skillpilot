package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

class LearningUnitEntryScopeTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String ENTRY = "19b53458-3f94-5bcf-8fcd-e85444851cff";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    @TempDir Path directory;
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void installedEntryOwnsScopeAndStaleOriginalRootCannotOverrideIt() throws Exception {
        var landscapes = landscapes(false, false);
        assertThat(landscapes.isPersonalizationEntryRootForSubject(ENTRY, MATH)).isTrue();
        var config = config("DE-HE", "SekII", "G9");
        config.put(ROOT, Map.of("selected", true, "filterId", "DE-BY", "stage", "SekI", "durationModel", "G8"));
        config.get(MATH).put("durationModel", "G8");
        assertBothServices(landscapes, config, Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE",
                "stage", "SekII", "durationModel", "G9", "courseProfile", "GK+LK"));
    }

    @Test void missingEntryStageIsUnresolvedDespiteStaleOriginalAndSubjectStage() throws Exception {
        var config = config("DE-HE", null, null);
        config.put(ROOT, Map.of("stage", "SekII"));
        config.get(MATH).put("stage", "SekII");
        var expected = Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "courseProfile", "GK+LK");
        assertBothServices(landscapes(false, false), config, expected);
    }

    @Test void sekIHasNoCourseAndNonapplicableDurationStaysAbsent() throws Exception {
        assertBothServices(landscapes(false, false), config("DE-BB", "SekI", null),
                Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-BB", "stage", "SekI"));
    }

    @Test void originalAllIsNotTranslatedIntoANeighboringJurisdiction() throws Exception {
        assertBothServices(landscapes(false, false), config("ALL", "CrossStage", null),
                Map.of("schoolForm", "Gymnasium", "stage", "CrossStage", "courseProfile", "GK+LK"));
    }

    @Test void directMathSelectionIsNeverAnEntryAlias() throws Exception {
        assertThat(landscapes(false, false).isPersonalizationEntryRootForSubject(MATH, MATH)).isFalse();
    }

    @Test void changedContainmentCannotClaimEntryAuthority() throws Exception {
        assertThat(landscapes(true, false).isPersonalizationEntryRootForSubject(ENTRY, MATH)).isFalse();
    }

    @Test void changedPersonalizationSourceCannotClaimEntryAuthority() throws Exception {
        assertThat(landscapes(false, true).isPersonalizationEntryRootForSubject(ENTRY, MATH)).isFalse();
    }

    private void assertBothServices(LandscapeService landscapes, Map<String, Map<String, Object>> config,
                                    Map<String, String> expected) throws Exception {
        var learners = mock(LearnerService.class, CALLS_REAL_METHODS);
        ReflectionTestUtils.setField(learners, "landscapeService", landscapes);
        Map<String, String> actual = ReflectionTestUtils.invokeMethod(learners, "deriveCompositionScope", MATH, config, ENTRY);
        assertThat(actual).isEqualTo(expected);
        var curricula = mock(CurriculaService.class, CALLS_REAL_METHODS);
        ReflectionTestUtils.setField(curricula, "landscapeService", landscapes);
        ReflectionTestUtils.setField(curricula, "objectMapper", mapper);
        Map<String, String> summary = ReflectionTestUtils.invokeMethod(curricula, "deriveRuntimeCompositionScope", MATH,
                mapper.writeValueAsString(config), ENTRY);
        assertThat(summary).isEqualTo(expected);
    }

    private Map<String, Map<String, Object>> config(String jurisdiction, String stage, String duration) {
        var values = new LinkedHashMap<String, Object>();
        values.put("selected", true); values.put("filterId", jurisdiction);
        if (stage != null) values.put("stage", stage);
        if (duration != null) values.put("durationModel", duration);
        var config = new LinkedHashMap<String, Map<String, Object>>();
        config.put(ENTRY, values);
        config.put(MATH, new LinkedHashMap<>(Map.of("selected", true, "filterId", "GK+LK")));
        return config;
    }

    private LandscapeService landscapes(boolean badContains, boolean badFlow) throws Exception {
        var entry = mapper.readTree(Files.readString(Path.of("../curricula/DE/Gymnasium/learning-units/entries/math-entry-v1.de.json")));
        if (badContains) ((com.fasterxml.jackson.databind.node.ObjectNode) entry.path("goals").path(0)).putArray("contains");
        if (badFlow) ((com.fasterxml.jackson.databind.node.ObjectNode) entry).putObject("personalizationFlow");
        Files.writeString(directory.resolve("entry.json"), mapper.writeValueAsString(entry));
        Files.writeString(directory.resolve("math.json"), """
                {"landscapeId":"%s","title":"Math","frameworkId":"canonical-gymnasium-mathematik",
                 "goals":[{"id":"c01b1ce9-a667-4a46-b251-ec33ae602b15","title":"Math","type":"cluster","contains":["A"]},
                          {"id":"A","title":"A","contains":[]}]}
                """.formatted(MATH));
        var properties = new LandscapeProperties(); properties.setDirectory(directory.toString());
        var result = new LandscapeService(properties, mapper); result.pinRuntimeGeneration();
        return result;
    }
}
