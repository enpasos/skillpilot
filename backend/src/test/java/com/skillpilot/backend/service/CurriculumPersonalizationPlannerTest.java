package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.landscape.PersonalizationFlow;
import com.skillpilot.backend.landscape.PersonalizationGroup;
import com.skillpilot.backend.landscape.PersonalizationOptionSource;
import com.skillpilot.backend.landscape.PersonalizationScopeValue;
import com.skillpilot.backend.landscape.PersonalizationSourceKind;
import com.skillpilot.backend.landscape.PersonalizationStage;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CurriculumPersonalizationPlannerTest {

    private static final String ROOT_ID = "landscape-orbit";
    private static final String ALTERNATE_ROOT_ID = "landscape-nova";
    private static final String COBALT_ID = "landscape-cobalt";
    private static final String EMBER_ID = "landscape-ember";
    private static final String SAFFRON_ID = "landscape-saffron";

    @Test
    void completesWithoutMandatoryChoicesWhenNoFlowIsAuthored() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");

        PersonalizationPlan plan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(plan.valid()).isTrue();
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        assertThat(plan.required()).isFalse();
        assertThat(plan.options()).isEmpty();
    }

    @Test
    void rejectsAnExplicitlyAuthoredFlowWithoutStages() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        root.setPersonalizationFlow(flow());

        PersonalizationPlan plan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(plan.valid()).isFalse();
        assertThat(plan.problemCode()).isEqualTo("personalization-stages-missing");
    }

    @Test
    void rejectsMissingOrBlankStageAndGroupLabels() {
        SkillLandscape root = landscape(
                ROOT_ID,
                "Orbit",
                filter("dial-a", "Dial A"));

        PersonalizationStage missingStageLabel = stage(
                "stage-mode",
                1,
                group(
                        "group-mode",
                        1,
                        1,
                        1,
                        landscapeFilters(ROOT_ID)));
        missingStageLabel.setLabel(" \t");
        root.setPersonalizationFlow(flow(missingStageLabel));

        PersonalizationPlan stagePlan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(stagePlan.valid()).isFalse();
        assertThat(stagePlan.problemCode()).isEqualTo("personalization-stage-invalid");

        PersonalizationGroup missingGroupLabel = group(
                "group-mode",
                1,
                1,
                1,
                landscapeFilters(ROOT_ID));
        missingGroupLabel.setLabel(null);
        root.setPersonalizationFlow(flow(stage("stage-mode", 1, missingGroupLabel)));

        PersonalizationPlan groupPlan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(groupPlan.valid()).isFalse();
        assertThat(groupPlan.problemCode()).isEqualTo("personalization-group-invalid");

        PersonalizationStage blankEnglishStageLabel = stage(
                "stage-mode",
                1,
                group(
                        "group-mode",
                        1,
                        1,
                        1,
                        landscapeFilters(ROOT_ID)));
        blankEnglishStageLabel.setLabelEn("\t");
        root.setPersonalizationFlow(flow(blankEnglishStageLabel));

        PersonalizationPlan englishStagePlan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(englishStagePlan.valid()).isFalse();
        assertThat(englishStagePlan.problemCode()).isEqualTo("personalization-stage-invalid");

        PersonalizationGroup blankEnglishGroupLabel = group(
                "group-mode",
                1,
                1,
                1,
                landscapeFilters(ROOT_ID));
        blankEnglishGroupLabel.setLabelEn("\n");
        root.setPersonalizationFlow(flow(stage("stage-mode", 1, blankEnglishGroupLabel)));

        PersonalizationPlan englishGroupPlan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(englishGroupPlan.valid()).isFalse();
        assertThat(englishGroupPlan.problemCode()).isEqualTo("personalization-group-invalid");
    }

    @Test
    void rejectsCaseInsensitiveDuplicatesInRestrictedFilterIds() {
        SkillLandscape root = landscape(
                ROOT_ID,
                "Orbit",
                filter("dial-a", "Dial A"),
                filter("dial-b", "Dial B"));
        PersonalizationOptionSource source = landscapeFilters(ROOT_ID);
        source.setFilterIds(List.of("dial-a", "DIAL-A"));
        root.setPersonalizationFlow(flow(stage(
                "stage-mode",
                1,
                group(
                        "group-mode",
                        1,
                        1,
                        1,
                        source))));

        PersonalizationPlan plan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(plan.valid()).isFalse();
        assertThat(plan.problemCode()).isEqualTo("personalization-filter-source-unresolved");
    }

    @Test
    void offersExactlyTheRootFiltersDeclaredByTheAuthoredFlow() {
        SkillLandscape root = landscape(
                ROOT_ID,
                "Orbit",
                filter("dial-a", "Dial A"),
                filter("dial-b", "Dial B"));
        root.setPersonalizationFlow(flow(stage(
                "stage-mode",
                1,
                group(
                        "group-mode",
                        1,
                        1,
                        1,
                        landscapeFilters(ROOT_ID)))));

        PersonalizationPlan plan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.stageId()).isEqualTo("stage-mode");
        assertThat(plan.groupId()).isEqualTo("group-mode");
        assertThat(plan.minSelections()).isEqualTo(1);
        assertThat(plan.maxSelections()).isEqualTo(1);
        assertThat(plan.selectedCount()).isZero();
        assertThat(plan.options())
                .extracting(
                        PersonalizationPlan.Option::landscapeId,
                        PersonalizationPlan.Option::filterId)
                .containsExactly(
                        tuple(ROOT_ID, "dial-a"),
                        tuple(ROOT_ID, "dial-b"));
        assertThat(plan.options())
                .extracting(PersonalizationPlan.Option::optionId)
                .allSatisfy(optionId -> assertThat(optionId).startsWith("po_"));
    }

    @Test
    void publishesCurrentAndLaterAuthoredDecisionsInFlowOrder() {
        SkillLandscape root = landscape(
                ROOT_ID,
                "Orbit",
                filter("dial-a", "Dial A"),
                filter("dial-b", "Dial B"));
        PersonalizationGroup currentGroup =
                group("group-setting", 1, 1, 1, landscapeFilters(ROOT_ID));
        currentGroup.setLabel("Welche Lernumgebung passt?");
        PersonalizationGroup laterGroupInSameStage =
                group("group-focus", 2, 1, 1, landscapeFilters(ROOT_ID));
        laterGroupInSameStage.setLabel("Welcher Schwerpunkt passt?");
        PersonalizationStage currentStage =
                stage("stage-entry", 1, laterGroupInSameStage, currentGroup);
        currentStage.setLabel("Einstieg");

        PersonalizationGroup finalGroup =
                group("group-format", 1, 1, 1, landscapeFilters(ROOT_ID));
        finalGroup.setLabel("Welches Zielformat passt?");
        PersonalizationStage finalStage =
                stage("stage-final", 2, finalGroup);
        finalStage.setLabel("Abschluss");

        root.setPersonalizationFlow(flow(finalStage, currentStage));

        PersonalizationPlan plan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.groupId()).isEqualTo("group-setting");
        assertThat(plan.pendingDecisions()).containsExactly(
                new PersonalizationPlan.DecisionPrompt(
                        "Einstieg",
                        "Welche Lernumgebung passt?"),
                new PersonalizationPlan.DecisionPrompt(
                        "Einstieg",
                        "Welcher Schwerpunkt passt?"),
                new PersonalizationPlan.DecisionPrompt(
                        "Abschluss",
                        "Welches Zielformat passt?"));
    }

    @Test
    void normalizesMixedCaseRestrictionsBeforeLabelAndOptionIdentityAreDerived() {
        SkillLandscape root = landscape(
                ROOT_ID,
                "Orbit",
                filter("Dial-Authored", "Authored dial"),
                filter("Dial-Other", "Other dial"));
        PersonalizationOptionSource mixedCaseRestriction = landscapeFilters(ROOT_ID);
        mixedCaseRestriction.setFilterIds(List.of("dIaL-aUtHoReD"));
        root.setPersonalizationFlow(flow(stage(
                "stage-mode",
                1,
                group(
                        "group-mode",
                        1,
                        1,
                        1,
                        mixedCaseRestriction))));

        PersonalizationPlan mixedCasePlan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        PersonalizationPlan.Option mixedCaseOption = mixedCasePlan.options().getFirst();
        assertThat(mixedCaseOption.filterId()).isEqualTo("Dial-Authored");
        assertThat(mixedCaseOption.filterLabel()).isEqualTo("Authored dial");

        mixedCaseRestriction.setFilterIds(List.of("Dial-Authored"));
        PersonalizationPlan canonicalPlan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, List.of(root), Map.of());

        assertThat(canonicalPlan.options().getFirst().optionId())
                .isEqualTo(mixedCaseOption.optionId());
    }

    @Test
    void normalizesSharedMixedCaseDynamicRestrictionsPerDeclaringLandscape() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(
                COBALT_ID,
                "Cobalt",
                filter("Shared-Band", "Cobalt shared band"));
        SkillLandscape ember = landscape(
                EMBER_ID,
                "Ember",
                filter("shared-band", "Ember shared band"));
        PersonalizationOptionSource restriction =
                filtersForSelectedLandscapes("group-landscape");
        restriction.setFilterIds(List.of("SHARED-BAND"));
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-landscape",
                        1,
                        group(
                                "group-landscape",
                                1,
                                2,
                                2,
                                landscapes(COBALT_ID, EMBER_ID))),
                stage(
                        "stage-profile",
                        2,
                        group(
                                "group-profile",
                                1,
                                1,
                                1,
                                restriction))));

        PersonalizationPlan cobaltPlan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root, cobalt, ember),
                config(
                        entry(COBALT_ID, true, null),
                        entry(EMBER_ID, true, null)));

        assertThat(cobaltPlan.options())
                .extracting(
                        PersonalizationPlan.Option::landscapeId,
                        PersonalizationPlan.Option::filterId,
                        PersonalizationPlan.Option::filterLabel)
                .containsExactly(tuple(
                        COBALT_ID,
                        "Shared-Band",
                        "Cobalt shared band"));

        PersonalizationPlan emberPlan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root, cobalt, ember),
                config(
                        entry(COBALT_ID, true, "shared-band"),
                        entry(EMBER_ID, true, null)));

        assertThat(emberPlan.options())
                .extracting(
                        PersonalizationPlan.Option::landscapeId,
                        PersonalizationPlan.Option::filterId,
                        PersonalizationPlan.Option::filterLabel)
                .containsExactly(tuple(
                        EMBER_ID,
                        "shared-band",
                        "Ember shared band"));
    }

    @Test
    void derivesFilterOptionsOnlyForLandscapesSelectedByAnEarlierAuthoredGroup() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(
                COBALT_ID,
                "Cobalt",
                filter("band-one", "Band One"),
                filter("band-two", "Band Two"));
        SkillLandscape ember = landscape(
                EMBER_ID,
                "Ember",
                filter("band-one", "Band One"),
                filter("band-two", "Band Two"));
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-landscape",
                        1,
                        group(
                                "group-landscape",
                                1,
                                1,
                                1,
                                landscapes(COBALT_ID, EMBER_ID))),
                stage(
                        "stage-band",
                        2,
                        group(
                                "group-band",
                                1,
                                1,
                                1,
                                filtersForSelectedLandscapes("group-landscape")))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root, cobalt, ember),
                config(entry(COBALT_ID, true, null)));

        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.stageId()).isEqualTo("stage-band");
        assertThat(plan.groupId()).isEqualTo("group-band");
        assertThat(plan.options())
                .extracting(
                        PersonalizationPlan.Option::landscapeId,
                        PersonalizationPlan.Option::filterId)
                .containsExactly(
                        tuple(COBALT_ID, "band-one"),
                        tuple(COBALT_ID, "band-two"));
    }

    @Test
    void rejectsARestrictedDynamicFilterVocabularyThatIsNotSharedByEveryUpstreamLandscape() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(
                COBALT_ID,
                "Cobalt",
                filter("cobalt-basic", "Cobalt Basic"));
        SkillLandscape ember = landscape(
                EMBER_ID,
                "Ember",
                filter("ember-basic", "Ember Basic"));
        PersonalizationOptionSource restrictedProfiles =
                filtersForSelectedLandscapes("group-landscape");
        restrictedProfiles.setFilterIds(List.of("cobalt-basic"));
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-landscape",
                        1,
                        group(
                                "group-landscape",
                                1,
                                1,
                                2,
                                landscapes(COBALT_ID, EMBER_ID))),
                stage(
                        "stage-profile",
                        2,
                        group(
                                "group-profile",
                                1,
                                1,
                                1,
                                restrictedProfiles))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root, cobalt, ember),
                Map.of());

        assertThat(plan.valid()).isFalse();
        assertThat(plan.problemCode())
                .isEqualTo("personalization-dynamic-filter-vocabulary-incompatible");
    }

    @Test
    void usesEachSelectedLandscapesOwnFilterVocabularyWhenNoDynamicRestrictionIsAuthored() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(
                COBALT_ID,
                "Cobalt",
                filter("cobalt-basic", "Cobalt Basic"));
        SkillLandscape ember = landscape(
                EMBER_ID,
                "Ember",
                filter("ember-basic", "Ember Basic"));
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-landscape",
                        1,
                        group(
                                "group-landscape",
                                1,
                                1,
                                2,
                                landscapes(COBALT_ID, EMBER_ID))),
                stage(
                        "stage-profile",
                        2,
                        group(
                                "group-profile",
                                1,
                                1,
                                1,
                                filtersForSelectedLandscapes("group-landscape")))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root, cobalt, ember),
                config(
                        entry(COBALT_ID, true, "cobalt-basic"),
                        entry(EMBER_ID, true, null)));

        assertThat(plan.valid()).isTrue();
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.groupInstanceId()).isEqualTo("group-profile:" + EMBER_ID);
        assertThat(plan.options())
                .extracting(
                        PersonalizationPlan.Option::landscapeId,
                        PersonalizationPlan.Option::filterId)
                .containsExactly(tuple(EMBER_ID, "ember-basic"));
    }

    @Test
    void keepsCourseProfilesPerSubjectAndLeavesStageAndDurationIndependent() {
        SkillLandscape root = landscape(ROOT_ID, "Gymnasium (DE)");
        SkillLandscape mathematics = landscape(
                COBALT_ID,
                "Mathematik",
                filter("GK", "Grundkurs"),
                filter("LK", "Leistungskurs"));
        SkillLandscape physics = landscape(
                EMBER_ID,
                "Physik",
                filter("GK", "Grundkurs"),
                filter("LK", "Leistungskurs"));
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-subject",
                        1,
                        group(
                                "group-subject",
                                1,
                                2,
                                2,
                                landscapes(COBALT_ID, EMBER_ID))),
                stage(
                        "stage-course-profile",
                        2,
                        group(
                                "group-course-profile",
                                1,
                                1,
                                1,
                                filtersForSelectedLandscapes("group-subject"))),
                stage(
                        "stage-learning-stage",
                        3,
                        group(
                                "group-learning-stage",
                                1,
                                1,
                                1,
                                scopeValues(
                                        ROOT_ID,
                                        "stage",
                                        scopeValue("SekI", "Sekundarstufe I"),
                                        scopeValue("SekII", "Sekundarstufe II"),
                                        scopeValue("CrossStage", "Sekundarstufe I und II")))),
                stage(
                        "stage-duration",
                        4,
                        group(
                                "group-duration",
                                1,
                                1,
                                1,
                                scopeValues(
                                        ROOT_ID,
                                        "durationModel",
                                        scopeValue("G8", "G8"),
                                        scopeValue("G9", "G9"))))));
        List<SkillLandscape> landscapes = List.of(root, mathematics, physics);

        Map<String, Object> unresolvedRoot = new LinkedHashMap<>();
        unresolvedRoot.put("selected", true);
        PersonalizationPlan stagePlan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(
                        Map.entry(ROOT_ID, unresolvedRoot),
                        entry(COBALT_ID, true, "LK"),
                        entry(EMBER_ID, true, "GK")));

        assertThat(stagePlan.valid()).isTrue();
        assertThat(stagePlan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(stagePlan.groupId()).isEqualTo("group-learning-stage");
        assertThat(stagePlan.options())
                .extracting(
                        PersonalizationPlan.Option::landscapeId,
                        PersonalizationPlan.Option::scopeKey,
                        PersonalizationPlan.Option::scopeValue)
                .containsExactly(
                        tuple(ROOT_ID, "stage", "SekI"),
                        tuple(ROOT_ID, "stage", "SekII"),
                        tuple(ROOT_ID, "stage", "CrossStage"));

        Map<String, Object> stageResolvedRoot = new LinkedHashMap<>(unresolvedRoot);
        stageResolvedRoot.put("stage", "CrossStage");
        PersonalizationPlan durationPlan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(
                        Map.entry(ROOT_ID, stageResolvedRoot),
                        entry(COBALT_ID, true, "LK"),
                        entry(EMBER_ID, true, "GK")));

        assertThat(durationPlan.valid()).isTrue();
        assertThat(durationPlan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(durationPlan.groupId()).isEqualTo("group-duration");
        assertThat(durationPlan.options())
                .extracting(
                        PersonalizationPlan.Option::scopeKey,
                        PersonalizationPlan.Option::scopeValue)
                .containsExactly(
                        tuple("durationModel", "G8"),
                        tuple("durationModel", "G9"));

        Map<String, Object> completeRoot = new LinkedHashMap<>(stageResolvedRoot);
        completeRoot.put("durationModel", "G9");
        PersonalizationPlan complete = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(
                        Map.entry(ROOT_ID, completeRoot),
                        entry(COBALT_ID, true, "LK"),
                        entry(EMBER_ID, true, "GK")));

        assertThat(complete.valid()).isTrue();
        assertThat(complete.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
    }

    @Test
    void offersExplicitCompletionAfterTheMinimumAndBeforeTheMaximum() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(COBALT_ID, "Cobalt");
        SkillLandscape ember = landscape(EMBER_ID, "Ember");
        SkillLandscape saffron = landscape(SAFFRON_ID, "Saffron");
        root.setPersonalizationFlow(flow(stage(
                "stage-landscape",
                1,
                group(
                        "group-landscape",
                        1,
                        1,
                        3,
                        landscapes(COBALT_ID, EMBER_ID, SAFFRON_ID)))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root, cobalt, ember, saffron),
                config(
                        entry(COBALT_ID, true, null),
                        entry(EMBER_ID, true, null)));

        assertThat(plan.valid()).isTrue();
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.selectedCount()).isEqualTo(2);
        assertThat(plan.options())
                .extracting(
                        PersonalizationPlan.Option::kind,
                        PersonalizationPlan.Option::landscapeId)
                .containsExactly(
                        tuple(PersonalizationPlan.OptionKind.VALUE, SAFFRON_ID),
                        tuple(PersonalizationPlan.OptionKind.COMPLETE_GROUP, null));
        assertThat(plan.navigationOptions())
                .extracting(
                        PersonalizationPlan.Option::landscapeId,
                        PersonalizationPlan.Option::filterId)
                .containsExactly(
                        tuple(COBALT_ID, null),
                        tuple(EMBER_ID, null),
                        tuple(SAFFRON_ID, null));
    }

    @Test
    void anExplicitCompletionAdvancesWithoutSelectingAnotherValue() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(COBALT_ID, "Cobalt");
        SkillLandscape ember = landscape(EMBER_ID, "Ember");
        root.setPersonalizationFlow(flow(stage(
                "stage-landscape",
                1,
                group(
                        "group-landscape",
                        1,
                        1,
                        2,
                        landscapes(COBALT_ID, EMBER_ID)))));
        List<SkillLandscape> landscapes = List.of(root, cobalt, ember);
        Map.Entry<String, Map<String, Object>> selection =
                entry(COBALT_ID, true, null);

        PersonalizationPlan pending = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(selection));
        PersonalizationPlan.Option finish = finishOption(pending);

        PersonalizationPlan completed = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(selection, completionEntry(finish)));

        assertThat(completed.valid()).isTrue();
        assertThat(completed.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        assertThat(completed.options()).isEmpty();
    }

    @Test
    void anOptionalGroupCanBeCompletedWithoutSelectingAValue() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(COBALT_ID, "Cobalt");
        SkillLandscape ember = landscape(EMBER_ID, "Ember");
        root.setPersonalizationFlow(flow(stage(
                "stage-landscape",
                1,
                group(
                        "group-landscape",
                        1,
                        0,
                        2,
                        landscapes(COBALT_ID, EMBER_ID)))));
        List<SkillLandscape> landscapes = List.of(root, cobalt, ember);

        PersonalizationPlan pending =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, landscapes, Map.of());

        assertThat(pending.options())
                .extracting(PersonalizationPlan.Option::kind)
                .containsExactly(
                        PersonalizationPlan.OptionKind.VALUE,
                        PersonalizationPlan.OptionKind.VALUE,
                        PersonalizationPlan.OptionKind.COMPLETE_GROUP);

        PersonalizationPlan completed = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(completionEntry(finishOption(pending))));

        assertThat(completed.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
    }

    @Test
    void aCompletionMarkerBeforeTheMinimumFailsClosed() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(COBALT_ID, "Cobalt");
        SkillLandscape ember = landscape(EMBER_ID, "Ember");
        SkillLandscape saffron = landscape(SAFFRON_ID, "Saffron");
        root.setPersonalizationFlow(flow(stage(
                "stage-landscape",
                1,
                group(
                        "group-landscape",
                        1,
                        2,
                        3,
                        landscapes(COBALT_ID, EMBER_ID, SAFFRON_ID)))));
        List<SkillLandscape> landscapes = List.of(root, cobalt, ember, saffron);
        PersonalizationPlan eligible = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(
                        entry(COBALT_ID, true, null),
                        entry(EMBER_ID, true, null)));

        PersonalizationPlan forged = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(completionEntry(finishOption(eligible))));

        assertThat(forged.valid()).isFalse();
        assertThat(forged.problemCode())
                .isEqualTo("personalization-completion-before-minimum");
    }

    @Test
    void dynamicInstancesRequireIndependentCompletionActions() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(
                COBALT_ID,
                "Cobalt",
                filter("band-one", "Band One"));
        SkillLandscape ember = landscape(
                EMBER_ID,
                "Ember",
                filter("band-two", "Band Two"));
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-landscape",
                        1,
                        group(
                                "group-landscape",
                                1,
                                2,
                                2,
                                landscapes(COBALT_ID, EMBER_ID))),
                stage(
                        "stage-band",
                        2,
                        group(
                                "group-band",
                                1,
                                0,
                                1,
                                filtersForSelectedLandscapes("group-landscape")))));
        List<SkillLandscape> landscapes = List.of(root, cobalt, ember);
        Map.Entry<String, Map<String, Object>> cobaltSelected =
                entry(COBALT_ID, true, null);
        Map.Entry<String, Map<String, Object>> emberSelected =
                entry(EMBER_ID, true, null);

        PersonalizationPlan first = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(cobaltSelected, emberSelected));
        PersonalizationPlan.Option firstFinish = finishOption(first);

        PersonalizationPlan second = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(
                        cobaltSelected,
                        emberSelected,
                        completionEntry(firstFinish)));
        PersonalizationPlan.Option secondFinish = finishOption(second);

        assertThat(first.groupInstanceId()).contains(COBALT_ID);
        assertThat(second.groupInstanceId()).contains(EMBER_ID);
        assertThat(secondFinish.optionId()).isNotEqualTo(firstFinish.optionId());
        assertThat(second.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);

        PersonalizationPlan completed = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(
                        cobaltSelected,
                        emberSelected,
                        completionEntry(firstFinish, secondFinish)));

        assertThat(completed.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
    }

    @Test
    void staleCompletionFromAnEarlierFlowShapeDoesNotCloseTheCurrentGroup() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(COBALT_ID, "Cobalt");
        SkillLandscape ember = landscape(EMBER_ID, "Ember");
        SkillLandscape saffron = landscape(SAFFRON_ID, "Saffron");
        List<SkillLandscape> landscapes = List.of(root, cobalt, ember, saffron);
        root.setPersonalizationFlow(flow(stage(
                "stage-landscape",
                1,
                group(
                        "group-landscape",
                        1,
                        1,
                        2,
                        landscapes(COBALT_ID, EMBER_ID)))));
        Map.Entry<String, Map<String, Object>> selected =
                entry(COBALT_ID, true, null);
        PersonalizationPlan oldPlan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(selected));
        PersonalizationPlan.Option staleFinish = finishOption(oldPlan);

        root.setPersonalizationFlow(flow(stage(
                "stage-landscape",
                1,
                group(
                        "group-landscape",
                        1,
                        1,
                        3,
                        landscapes(COBALT_ID, EMBER_ID, SAFFRON_ID)))));
        PersonalizationPlan currentPlan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                landscapes,
                config(selected, completionEntry(staleFinish)));

        assertThat(currentPlan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(finishOption(currentPlan).optionId())
                .isNotEqualTo(staleFinish.optionId());
    }

    @Test
    void rootNamespacesIdenticalValueAndCompletionOptionsAndCompletionState() {
        SkillLandscape firstRoot = landscape(ROOT_ID, "Orbit");
        SkillLandscape secondRoot = landscape(ALTERNATE_ROOT_ID, "Nova");
        SkillLandscape cobalt = landscape(COBALT_ID, "Cobalt");
        SkillLandscape ember = landscape(EMBER_ID, "Ember");
        firstRoot.setPersonalizationFlow(flow(stage(
                "stage-shared",
                1,
                group(
                        "group-shared",
                        1,
                        0,
                        2,
                        landscapes(COBALT_ID, EMBER_ID)))));
        secondRoot.setPersonalizationFlow(flow(stage(
                "stage-shared",
                1,
                group(
                        "group-shared",
                        1,
                        0,
                        2,
                        landscapes(COBALT_ID, EMBER_ID)))));
        List<SkillLandscape> landscapes =
                List.of(firstRoot, secondRoot, cobalt, ember);

        PersonalizationPlan firstPlan =
                CurriculumPersonalizationPlanner.plan(ROOT_ID, landscapes, Map.of());
        PersonalizationPlan secondPlan =
                CurriculumPersonalizationPlanner.plan(ALTERNATE_ROOT_ID, landscapes, Map.of());

        assertThat(firstPlan.options())
                .extracting(PersonalizationPlan.Option::optionId)
                .doesNotContainAnyElementsOf(secondPlan.options().stream()
                        .map(PersonalizationPlan.Option::optionId)
                        .toList());

        PersonalizationPlan secondWithFirstRootCompletion =
                CurriculumPersonalizationPlanner.plan(
                        ALTERNATE_ROOT_ID,
                        landscapes,
                        config(completionEntry(ROOT_ID, finishOption(firstPlan))));

        assertThat(secondWithFirstRootCompletion.stage())
                .isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(finishOption(secondWithFirstRootCompletion).optionId())
                .isEqualTo(finishOption(secondPlan).optionId())
                .isNotEqualTo(finishOption(firstPlan).optionId());
    }

    @Test
    void rejectsAResolverThatReturnsALandscapeWithAnotherIdentity() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape wrong = landscape(EMBER_ID, "Ember");
        root.setPersonalizationFlow(flow(stage(
                "stage-shared",
                1,
                group(
                        "group-shared",
                        1,
                        1,
                        1,
                        landscapes(COBALT_ID)))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                requestedId -> ROOT_ID.equals(requestedId) ? root : wrong,
                Map.of());

        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.INVALID);
        assertThat(plan.problemCode())
                .isEqualTo("personalization-landscape-source-unresolved");
    }

    @Test
    void doesNotOfferAlreadySelectedLandscapesWhileTheMinimumIsStillUnmet() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(COBALT_ID, "Cobalt");
        SkillLandscape ember = landscape(EMBER_ID, "Ember");
        SkillLandscape saffron = landscape(SAFFRON_ID, "Saffron");
        root.setPersonalizationFlow(flow(stage(
                "stage-landscape",
                1,
                group(
                        "group-landscape",
                        1,
                        2,
                        3,
                        landscapes(COBALT_ID, EMBER_ID, SAFFRON_ID)))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root, cobalt, ember, saffron),
                config(entry(COBALT_ID, true, null)));

        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.minSelections()).isEqualTo(2);
        assertThat(plan.maxSelections()).isEqualTo(3);
        assertThat(plan.selectedCount()).isEqualTo(1);
        assertThat(plan.options())
                .extracting(PersonalizationPlan.Option::landscapeId)
                .containsExactly(EMBER_ID, SAFFRON_ID)
                .doesNotContain(COBALT_ID);
        assertThat(plan.navigationOptions())
                .extracting(PersonalizationPlan.Option::landscapeId)
                .containsExactly(COBALT_ID, EMBER_ID, SAFFRON_ID);
    }

    @Test
    void arbitraryGoalContainsAndRequiresEdgesDoNotChangeExplicitFlowOptions() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(COBALT_ID, "Cobalt");
        SkillLandscape ember = landscape(EMBER_ID, "Ember");
        SkillLandscape graphOnly = landscape(SAFFRON_ID, "Saffron");
        root.setPersonalizationFlow(flow(stage(
                "stage-landscape",
                1,
                group(
                        "group-landscape",
                        1,
                        1,
                        2,
                        landscapes(COBALT_ID, EMBER_ID)))));
        List<SkillLandscape> authoredLandscapes =
                List.of(root, cobalt, ember, graphOnly);

        PersonalizationPlan beforeGraphEdges = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                authoredLandscapes,
                Map.of());

        LearningGoal upperGoal = goal(
                "goal-upper",
                List.of("goal-lower", SAFFRON_ID),
                List.of(COBALT_ID));
        LearningGoal lowerGoal = goal(
                "goal-lower",
                List.of(),
                List.of(SAFFRON_ID));
        root.setGoals(List.of(upperGoal, lowerGoal));

        PersonalizationPlan afterGraphEdges = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                authoredLandscapes,
                Map.of());

        assertThat(afterGraphEdges).isEqualTo(beforeGraphEdges);
        assertThat(afterGraphEdges.options())
                .extracting(PersonalizationPlan.Option::landscapeId)
                .containsExactly(COBALT_ID, EMBER_ID)
                .doesNotContain(SAFFRON_ID);
    }

    @Test
    void rejectsAnExistingLandscapeSelectionAboveTheAuthoredMaximum() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        SkillLandscape cobalt = landscape(COBALT_ID, "Cobalt");
        SkillLandscape ember = landscape(EMBER_ID, "Ember");
        root.setPersonalizationFlow(flow(stage(
                "stage-landscape",
                1,
                group(
                        "group-landscape",
                        1,
                        1,
                        1,
                        landscapes(COBALT_ID, EMBER_ID)))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root, cobalt, ember),
                config(
                        entry(COBALT_ID, true, null),
                        entry(EMBER_ID, true, null)));

        assertThat(plan.valid()).isFalse();
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.INVALID);
        assertThat(plan.problemCode()).isEqualTo("personalization-cardinality-exceeded");
    }

    @Test
    void offersAuthoredScopeValuesIndependentlyFromLandscapeFilters() {
        SkillLandscape root = landscape(
                ROOT_ID,
                "Orbit",
                filter("dial-a", "Dial A"),
                filter("dial-b", "Dial B"));
        root.setPersonalizationFlow(flow(stage(
                "stage-entry-scope",
                1,
                group(
                        "group-filter",
                        1,
                        1,
                        1,
                        landscapeFilters(ROOT_ID)),
                group(
                        "group-duration",
                        2,
                        1,
                        1,
                        scopeValues(
                                ROOT_ID,
                                "durationModel",
                                scopeValue("G8", "G8"),
                                scopeValue("G9", "G9"))))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root),
                config(entry(ROOT_ID, true, "dial-a")));

        assertThat(plan.valid()).isTrue();
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.groupId()).isEqualTo("group-duration");
        assertThat(plan.options())
                .extracting(
                        PersonalizationPlan.Option::kind,
                        PersonalizationPlan.Option::landscapeId,
                        PersonalizationPlan.Option::filterId,
                        PersonalizationPlan.Option::scopeKey,
                        PersonalizationPlan.Option::scopeValue,
                        PersonalizationPlan.Option::scopeLabel)
                .containsExactly(
                        tuple(
                                PersonalizationPlan.OptionKind.SCOPE_VALUE,
                                ROOT_ID,
                                null,
                                "durationModel",
                                "G8",
                                "G8"),
                        tuple(
                                PersonalizationPlan.OptionKind.SCOPE_VALUE,
                                ROOT_ID,
                                null,
                                "durationModel",
                                "G9",
                                "G9"));
    }

    @Test
    void recognizesConfiguredScopeValueAlongsideIndependentFilter() {
        SkillLandscape root = landscape(
                ROOT_ID,
                "Orbit",
                filter("dial-a", "Dial A"),
                filter("dial-b", "Dial B"));
        root.setPersonalizationFlow(flow(stage(
                "stage-entry-scope",
                1,
                group(
                        "group-filter",
                        1,
                        1,
                        1,
                        landscapeFilters(ROOT_ID)),
                group(
                        "group-duration",
                        2,
                        1,
                        1,
                        scopeValues(
                                ROOT_ID,
                                "durationModel",
                                scopeValue("G8", "G8"),
                                scopeValue("G9", "G9"))))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root),
                config(entryWithScope(ROOT_ID, true, "dial-a", "durationModel", "G9")));

        assertThat(plan.valid()).isTrue();
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
    }

    @Test
    void migrationCompletionSuppressesNewScopeChoiceUntilExplicitReopen() {
        SkillLandscape root = landscape(ROOT_ID, "Orbit");
        root.setPersonalizationFlow(flow(stage(
                "stage-entry-scope",
                1,
                group(
                        "group-duration",
                        1,
                        1,
                        1,
                        scopeValues(
                                ROOT_ID,
                                "durationModel",
                                scopeValue("G8", "G8"),
                                scopeValue("G9", "G9"))))));

        PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root),
                config(
                        entry(ROOT_ID, true, null),
                        migrationCompletionEntry()));

        assertThat(plan.valid()).isTrue();
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);

        Map<String, Object> reopenedConfig = new LinkedHashMap<>();
        reopenedConfig.putAll(config(
                entry(ROOT_ID, true, null),
                migrationCompletionEntry()));
        assertThat(CurriculumPersonalizationPlanner.reopenMigratedFlow(
                        reopenedConfig,
                        ROOT_ID))
                .isTrue();

        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> plannedConfig =
                (Map<String, Map<String, Object>>) (Map<?, ?>) reopenedConfig;
        PersonalizationPlan reopenedPlan = CurriculumPersonalizationPlanner.plan(
                ROOT_ID,
                List.of(root),
                plannedConfig);

        assertThat(reopenedPlan.valid()).isTrue();
        assertThat(reopenedPlan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(reopenedPlan.groupId()).isEqualTo("group-duration");
        assertThat(reopenedPlan.options())
                .extracting(PersonalizationPlan.Option::scopeValue)
                .containsExactly("G8", "G9");
    }

    @Test
    void canonicalizesOnlyAgainstTheDeclaringLandscapeAndPreservesAuthoredSpelling() {
        SkillLandscape cobalt = landscape(
                COBALT_ID,
                "Cobalt",
                filter("band-one", "Band One"));
        SkillLandscape ember = landscape(
                EMBER_ID,
                "Ember",
                filter("band-two", "Band Two"));

        assertThat(CurriculumPersonalizationPlanner.canonicalFilterId(
                        cobalt,
                        " BAND-ONE "))
                .isEqualTo("band-one");
        assertThat(CurriculumPersonalizationPlanner.canonicalFilterId(
                        ember,
                        "band-one"))
                .isNull();
    }

    private static SkillLandscape landscape(
            String id,
            String subject,
            LandscapeFilter... filters) {
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(id);
        landscape.setSubject(subject);
        landscape.setFilters(List.of(filters));
        return landscape;
    }

    private static LandscapeFilter filter(String id, String label) {
        LandscapeFilter filter = new LandscapeFilter();
        filter.setId(id);
        filter.setLabel(label);
        return filter;
    }

    private static LearningGoal goal(
            String id,
            List<String> contains,
            List<String> requires) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setContains(contains);
        goal.setRequires(requires);
        return goal;
    }

    private static PersonalizationFlow flow(PersonalizationStage... stages) {
        PersonalizationFlow flow = new PersonalizationFlow();
        flow.setVersion("1");
        flow.setStages(List.of(stages));
        return flow;
    }

    private static PersonalizationStage stage(
            String id,
            int order,
            PersonalizationGroup... groups) {
        PersonalizationStage stage = new PersonalizationStage();
        stage.setId(id);
        stage.setOrder(order);
        stage.setLabel(id);
        stage.setGroups(List.of(groups));
        return stage;
    }

    private static PersonalizationGroup group(
            String id,
            int order,
            int minSelections,
            int maxSelections,
            PersonalizationOptionSource source) {
        PersonalizationGroup group = new PersonalizationGroup();
        group.setId(id);
        group.setOrder(order);
        group.setLabel(id);
        group.setMinSelections(minSelections);
        group.setMaxSelections(maxSelections);
        group.setSource(source);
        return group;
    }

    private static PersonalizationOptionSource landscapeFilters(String landscapeId) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.LANDSCAPE_FILTERS);
        source.setLandscapeId(landscapeId);
        return source;
    }

    private static PersonalizationOptionSource landscapes(String... landscapeIds) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.LANDSCAPES);
        source.setLandscapeIds(List.of(landscapeIds));
        return source;
    }

    private static PersonalizationOptionSource filtersForSelectedLandscapes(
            String groupId) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.FILTERS_FOR_SELECTED_LANDSCAPES);
        source.setSelectedLandscapesFromGroupId(groupId);
        return source;
    }

    private static PersonalizationOptionSource scopeValues(
            String landscapeId,
            String scopeKey,
            PersonalizationScopeValue... values) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.SCOPE_VALUES);
        source.setLandscapeId(landscapeId);
        source.setScopeKey(scopeKey);
        source.setValues(List.of(values));
        return source;
    }

    private static PersonalizationScopeValue scopeValue(String value, String label) {
        PersonalizationScopeValue scopeValue = new PersonalizationScopeValue();
        scopeValue.setValue(value);
        scopeValue.setLabel(label);
        return scopeValue;
    }

    @SafeVarargs
    private static Map<String, Map<String, Object>> config(
            Map.Entry<String, Map<String, Object>>... entries) {
        Map<String, Map<String, Object>> config = new LinkedHashMap<>();
        for (Map.Entry<String, Map<String, Object>> entry : entries) {
            config.put(entry.getKey(), entry.getValue());
        }
        return config;
    }

    private static Map.Entry<String, Map<String, Object>> entry(
            String landscapeId,
            boolean selected,
            String filterId) {
        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("selected", selected);
        if (filterId != null) {
            settings.put("filterId", filterId);
        }
        return Map.entry(landscapeId, settings);
    }

    private static Map.Entry<String, Map<String, Object>> entryWithScope(
            String landscapeId,
            boolean selected,
            String filterId,
            String scopeKey,
            String scopeValue) {
        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("selected", selected);
        if (filterId != null) {
            settings.put("filterId", filterId);
        }
        settings.put(scopeKey, scopeValue);
        return Map.entry(landscapeId, settings);
    }

    private static Map.Entry<String, Map<String, Object>> migrationCompletionEntry() {
        return Map.entry(
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                        true));
    }

    private static PersonalizationPlan.Option finishOption(PersonalizationPlan plan) {
        return plan.options().stream()
                .filter(option -> option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                .findFirst()
                .orElseThrow();
    }

    private static Map.Entry<String, Map<String, Object>> completionEntry(
            PersonalizationPlan.Option... options) {
        return completionEntry(ROOT_ID, options);
    }

    private static Map.Entry<String, Map<String, Object>> completionEntry(
            String rootLandscapeId,
            PersonalizationPlan.Option... options) {
        return Map.entry(
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        rootLandscapeId,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        java.util.Arrays.stream(options)
                                .map(PersonalizationPlan.Option::optionId)
                                .toList()));
    }
}
