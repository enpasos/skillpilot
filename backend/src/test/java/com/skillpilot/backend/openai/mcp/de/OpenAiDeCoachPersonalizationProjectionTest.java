package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class OpenAiDeCoachPersonalizationProjectionTest {

    private static final String ROOT_ID = "landscape-orbit-17";

    private final OpenAiDeCoachContextProjector projector = new OpenAiDeCoachContextProjector(
            new CoachStateProjection("https://skillpilot.test"),
            "https://skillpilot.test");

    @Test
    void projectsRootFilterOptionsWithOpaqueIdsAndWithoutTechnicalSelectionPayload() {
        PersonalizationPlan plan = selectionPlan(
                List.of(
                        option("po-dial-amber", ROOT_ID, "Panel Quartz", "dial-amber", "Choice Amber"),
                        option("po-dial-violet", ROOT_ID, "Panel Quartz", "dial-violet", "Choice Violet")));

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.options()).hasSize(2);
        OpenAiDeCoachContext.Option first = context.options().get(0);
        assertThat(first.id()).isEqualTo("po-dial-amber");
        assertThat(first.label()).isEqualTo("Choice Amber");
        assertThat(first.goalIds()).isEmpty();
        assertThat(first.filterIds()).isEmpty();
        OpenAiDeCoachContext.Option second = context.options().get(1);
        assertThat(second.id()).isEqualTo("po-dial-violet");
        assertThat(second.label()).isEqualTo("Choice Violet");
        assertThat(second.goalIds()).isEmpty();
        assertThat(second.filterIds()).isEmpty();
    }

    @Test
    void projectsDescendantFilterOptionsWithOpaqueIdsAndWithoutTechnicalSelectionPayload() {
        PersonalizationPlan plan = selectionPlan(
                List.of(
                        option(
                                "po-cobalt-shared",
                                "landscape-cobalt-23",
                                "Panel Cobalt",
                                "band-shared",
                                "Choice Shared"),
                        option(
                                "po-ember-shared",
                                "landscape-ember-41",
                                "Panel Ember",
                                "band-shared",
                                "Choice Shared")));

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.options()).hasSize(2);
        OpenAiDeCoachContext.Option first = context.options().get(0);
        assertThat(first.id()).isEqualTo("po-cobalt-shared");
        assertThat(first.label()).isEqualTo("Panel Cobalt – Choice Shared");
        assertThat(first.goalIds()).isEmpty();
        assertThat(first.filterIds()).isEmpty();
        OpenAiDeCoachContext.Option second = context.options().get(1);
        assertThat(second.id()).isEqualTo("po-ember-shared");
        assertThat(second.label()).isEqualTo("Panel Ember – Choice Shared");
        assertThat(second.goalIds()).isEmpty();
        assertThat(second.filterIds()).isEmpty();
    }

    @Test
    void projectsCourseProfilesPerSubjectWithoutConflatingThemWithLearningStage() {
        PersonalizationPlan plan = selectionPlan(
                List.of(
                        option(
                                "po-mathematics-lk",
                                "landscape-mathematics-71",
                                "Mathematik",
                                "LK",
                                "Leistungskurs"),
                        option(
                                "po-physics-gk",
                                "landscape-physics-83",
                                "Physik",
                                "GK",
                                "Grundkurs")));

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.options())
                .extracting(
                        OpenAiDeCoachContext.Option::id,
                        OpenAiDeCoachContext.Option::label)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple(
                                "po-mathematics-lk",
                                "Mathematik – Leistungskurs"),
                        org.assertj.core.groups.Tuple.tuple(
                                "po-physics-gk",
                                "Physik – Grundkurs"));
        assertThat(context.options()).allSatisfy(option -> {
            assertThat(option.goalIds()).isEmpty();
            assertThat(option.filterIds()).isEmpty();
        });

        JsonNode projected = new ObjectMapper().valueToTree(context.options());
        assertThat(projected.toString())
                .doesNotContain(
                        "landscape-mathematics-71",
                        "landscape-physics-83",
                        "\"LK\"",
                        "\"GK\"",
                        "Sekundarstufe");
    }

    @Test
    void projectsAFilterlessDescendantAsAnOpaqueSelectionOnlyStep() {
        String filterlessDescendantId = "landscape-saffron-59";
        PersonalizationPlan plan = selectionPlan(List.of(
                option(
                        "po-saffron-selection",
                        filterlessDescendantId,
                        "Panel Saffron",
                        null,
                        null)));

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.options()).singleElement().satisfies(option -> {
            assertThat(option.id()).isEqualTo("po-saffron-selection");
            assertThat(option.label()).isEqualTo("Panel Saffron");
            assertThat(option.goalIds()).isEmpty();
            assertThat(option.filterIds()).isEmpty();
        });
    }

    @Test
    void projectsAnExplicitGroupCompletionWithoutTechnicalCurriculumPayload() {
        PersonalizationPlan.Option finish = new PersonalizationPlan.Option(
                "po-finish-neutral",
                "stage-neutral",
                "group-neutral",
                "instance-neutral",
                null,
                null,
                null,
                null,
                PersonalizationPlan.OptionKind.COMPLETE_GROUP);
        PersonalizationPlan plan = selectionPlan(List.of(finish));

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.options()).singleElement().satisfies(option -> {
            assertThat(option.id()).isEqualTo("po-finish-neutral");
            assertThat(option.label()).isEqualTo("Auswahl abschließen");
            assertThat(option.description()).contains("keine weitere fachliche Option");
            assertThat(option.goalIds()).isEmpty();
            assertThat(option.filterIds()).isEmpty();
        });
    }

    @Test
    void projectsDurationScopeValuesWithCleanG8AndG9Labels() {
        PersonalizationPlan plan = selectionPlan(List.of(
                scopeValueOption("po-duration-g8", "durationModel", "G8", "G8"),
                scopeValueOption("po-duration-g9", "durationModel", "G9", "G9")));

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.options())
                .extracting(
                        OpenAiDeCoachContext.Option::id,
                        OpenAiDeCoachContext.Option::label)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("po-duration-g8", "G8"),
                        org.assertj.core.groups.Tuple.tuple("po-duration-g9", "G9"));
        assertThat(context.options()).allSatisfy(option -> {
            assertThat(option.goalIds()).isEmpty();
            assertThat(option.filterIds()).isEmpty();
        });

        JsonNode projected = new ObjectMapper().valueToTree(context.options());
        assertThat(projected.toString())
                .doesNotContain("durationModel", ROOT_ID, "stage-neutral", "group-neutral");
    }

    @Test
    void projectsLearningStageAsAnIndependentChoiceBeforeAnyFrontierGoals() {
        PersonalizationPlan plan = selectionPlan(List.of(
                scopeValueOption(
                        "po-stage-sek-i",
                        "stage",
                        "SekI",
                        "Sekundarstufe I"),
                scopeValueOption(
                        "po-stage-sek-ii",
                        "stage",
                        "SekII",
                        "Gymnasiale Oberstufe (Sekundarstufe II)"),
                scopeValueOption(
                        "po-stage-cross",
                        "stage",
                        "CrossStage",
                        "Sekundarstufe I und II")));

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.requiredAction()).isEqualTo("setPersonalization");
        assertThat(context.options())
                .extracting(
                        OpenAiDeCoachContext.Option::id,
                        OpenAiDeCoachContext.Option::label)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple(
                                "po-stage-sek-i",
                                "Sekundarstufe I"),
                        org.assertj.core.groups.Tuple.tuple(
                                "po-stage-sek-ii",
                                "Gymnasiale Oberstufe (Sekundarstufe II)"),
                        org.assertj.core.groups.Tuple.tuple(
                                "po-stage-cross",
                                "Sekundarstufe I und II"));
        assertThat(context.options()).allSatisfy(option -> {
            assertThat(option.goalIds()).isEmpty();
            assertThat(option.filterIds()).isEmpty();
        });

        JsonNode projected = new ObjectMapper().valueToTree(context.options());
        assertThat(projected.toString())
                .doesNotContain(
                        "\"stage\"",
                        "\"SekI\"",
                        "\"SekII\"",
                        "\"CrossStage\"",
                        ROOT_ID);
    }

    @Test
    void projectsOnlyUserFacingDecisionMetadataAndExplainsGeneralCardinality() {
        PersonalizationPlan plan = PersonalizationPlan.selection(
                "stage-technical-31",
                "Orientation lane",
                "group-technical-47",
                "Which panels do you want?",
                "instance-technical-59",
                2,
                4,
                1,
                List.of(
                        option("po-dial-amber", ROOT_ID, "Panel Quartz", "dial-amber", "Choice Amber"),
                        option("po-dial-violet", ROOT_ID, "Panel Quartz", "dial-violet", "Choice Violet")),
                List.of());

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.decision()).isEqualTo(new OpenAiDeCoachContext.Decision(
                "Orientation lane",
                "Which panels do you want?",
                2,
                4,
                1));
        assertThat(context.instruction())
                .contains(
                        "Orientation lane",
                        "Which panels do you want?",
                        "Mindestens 2 und höchstens 4",
                        "bisher ausgewählt: 1",
                        "mindestens eine Auswahl")
                .doesNotContain(
                        "stage-technical-31",
                        "group-technical-47",
                        "instance-technical-59");

        JsonNode decision = new ObjectMapper().valueToTree(context).path("decision");
        List<String> projectedFields = new ArrayList<>();
        decision.fieldNames().forEachRemaining(projectedFields::add);
        assertThat(projectedFields).containsExactlyInAnyOrder(
                "stageLabel",
                "groupLabel",
                "minSelections",
                "maxSelections",
                "selectedCount");
    }

    @Test
    void explainsExactSingleChoiceWithoutAssumingASubjectOrRegion() {
        PersonalizationPlan plan = PersonalizationPlan.selection(
                "stage-neutral",
                "Neutral stage",
                "group-neutral",
                "Choose one route",
                "instance-neutral",
                1,
                1,
                0,
                List.of(option(
                        "po-saffron-selection",
                        "landscape-saffron-59",
                        "Panel Saffron",
                        null,
                        null)),
                List.of());

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.instruction())
                .contains("Choose one route", "Genau eine Auswahl ist erforderlich", "bisher ausgewählt: 0")
                .doesNotContain("Hessen", "Mathematik", "Bundesland", "Kurs");
    }

    @Test
    void projectsBoundedPersonalizationHistoryWithoutTechnicalDecisionOrSelectionIds() {
        PersonalizationPlan.Option currentSelection = option(
                "po-current-private",
                ROOT_ID,
                "Panel Quartz",
                "dial-current-private",
                "Choice Current");
        PersonalizationPlan.Option completedSelection = option(
                "po-completed-private",
                "landscape-completed-private",
                "Panel Completed",
                "filter-completed-private",
                "Choice Completed");
        PersonalizationPlan.Option preservedSelection = scopeValueOption(
                "po-preserved-private",
                "durationModel-private",
                "G9-private",
                "G9");
        PersonalizationPlan plan = new PersonalizationPlan(
                PersonalizationPlan.Stage.SELECTION,
                "stage-current-private",
                "Current stage",
                "group-current-private",
                "Current question",
                "instance-current-private",
                1,
                2,
                1,
                List.of(currentSelection),
                List.of(currentSelection),
                List.of(currentSelection, completedSelection, preservedSelection),
                List.of(currentSelection),
                "rewind-current-opaque",
                List.of(new PersonalizationPlan.CompletedDecision(
                        "rewind-completed-opaque",
                        "stage-completed-private",
                        "Completed stage",
                        "group-completed-private",
                        "Completed question",
                        "instance-completed-private",
                        List.of(completedSelection))),
                List.of(new PersonalizationPlan.DecisionSummary(
                        "stage-preserved-private",
                        "Preserved stage",
                        "group-preserved-private",
                        "Preserved question",
                        "instance-preserved-private",
                        List.of(preservedSelection))),
                List.of(),
                false,
                null);

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.personalizationHistory()).isNotNull();
        assertThat(context.personalizationHistory().schemaVersion()).isEqualTo(1);
        assertThat(context.personalizationHistory().currentDecision())
                .isEqualTo(new OpenAiDeCoachContext.PersonalizationDecision(
                        "rewind-current-opaque",
                        "Current stage",
                        "Current question",
                        List.of("Choice Current")));
        assertThat(context.personalizationHistory().completedDecisions())
                .containsExactly(new OpenAiDeCoachContext.PersonalizationDecision(
                        "rewind-completed-opaque",
                        "Completed stage",
                        "Completed question",
                        List.of("Panel Completed – Choice Completed")));
        assertThat(context.personalizationHistory().preservedDecisions())
                .containsExactly(new OpenAiDeCoachContext.PersonalizationDecision(
                        null,
                        "Preserved stage",
                        "Preserved question",
                        List.of("G9")));

        String publicHistory = new ObjectMapper().valueToTree(context.personalizationHistory()).toString();
        assertThat(publicHistory)
                .contains("rewind-current-opaque", "rewind-completed-opaque")
                .doesNotContain(
                        "stage-current-private",
                        "group-current-private",
                        "instance-current-private",
                        "po-current-private",
                        "landscape-completed-private",
                        "filter-completed-private",
                        "durationModel-private",
                        "G9-private");
    }

    @Test
    void projectsHistoryFromAuthoritativeEnglishFlowAndOptionLabels() {
        PersonalizationPlan.Option current = new PersonalizationPlan.Option(
                "po-current",
                "stage-current",
                "group-current",
                "instance-current",
                ROOT_ID,
                "Deutsches Gymnasium",
                "profile",
                "Leistungskurs",
                null,
                null,
                null,
                PersonalizationPlan.OptionKind.VALUE,
                "German Gymnasium",
                "Advanced course",
                null);
        PersonalizationPlan.Option preservedScope = new PersonalizationPlan.Option(
                "po-scope",
                "stage-scope",
                "group-scope",
                "instance-scope",
                ROOT_ID,
                "Deutsches Gymnasium",
                null,
                null,
                "stage",
                "SekI",
                "Sekundarstufe I",
                PersonalizationPlan.OptionKind.SCOPE_VALUE,
                "German Gymnasium",
                null,
                "Lower secondary");
        PersonalizationPlan plan = PersonalizationPlan.selection(
                "stage-current",
                "Kurswahl",
                "Choose course",
                "group-current",
                "Welcher Kurs?",
                "Which course?",
                "instance-current",
                1,
                2,
                1,
                List.of(current),
                List.of(current),
                List.of(current, preservedScope),
                List.of(current),
                "rewind-current",
                List.of(new PersonalizationPlan.CompletedDecision(
                        "rewind-completed",
                        "stage-completed",
                        "Fachwahl",
                        "group-completed",
                        "Welches Fach?",
                        "instance-completed",
                        List.of(current),
                        "Choose subject",
                        "Which subject?")),
                List.of(new PersonalizationPlan.DecisionSummary(
                        "stage-scope",
                        "Lernabschnitt",
                        "group-scope",
                        "Welcher Abschnitt?",
                        "instance-scope",
                        List.of(preservedScope),
                        "Learning stage",
                        "Which stage?")),
                List.of());

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "en");

        assertThat(context.personalizationHistory().currentDecision())
                .isEqualTo(new OpenAiDeCoachContext.PersonalizationDecision(
                        "rewind-current",
                        "Choose course",
                        "Which course?",
                        List.of("Advanced course")));
        assertThat(context.personalizationHistory().completedDecisions().getFirst())
                .isEqualTo(new OpenAiDeCoachContext.PersonalizationDecision(
                        "rewind-completed",
                        "Choose subject",
                        "Which subject?",
                        List.of("Advanced course")));
        assertThat(context.personalizationHistory().preservedDecisions().getFirst())
                .isEqualTo(new OpenAiDeCoachContext.PersonalizationDecision(
                        null,
                        "Learning stage",
                        "Which stage?",
                        List.of("Lower secondary")));
    }

    @Test
    void acceptsExactly320CharacterSelectedLabelsAndFailsClosedAboveTheSchemaLimit() {
        String atLimit = "a".repeat(320);
        String aboveLimit = "b".repeat(321);

        OpenAiDeCoachContext accepted = projector.project(
                personalizationState(),
                completedScopePlan("rewind-at-limit", atLimit),
                true,
                "de");

        assertThat(accepted.personalizationHistory().completedDecisions().getFirst().selectedLabels())
                .containsExactly(atLimit);
        assertThatThrownBy(() -> projector.project(
                        personalizationState(),
                        completedScopePlan("rewind-above-limit", aboveLimit),
                        true,
                        "de"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("label exceeds");
    }

    @Test
    void deduplicatesEqualVisibleSelectionLabelsInStableOrderForItsOwnOutputSchema() {
        PersonalizationPlan.Option first = scopeValueOption(
                "po-first",
                "stage",
                "first",
                "Gleiches Label");
        PersonalizationPlan.Option second = scopeValueOption(
                "po-second",
                "stage",
                "second",
                "Gleiches Label");
        PersonalizationPlan plan = PersonalizationPlan.complete(
                List.of(first, second),
                List.of(new PersonalizationPlan.CompletedDecision(
                        "rewind-unique",
                        "stage",
                        "Stufe",
                        "group",
                        "Welche Stufe?",
                        "instance",
                        List.of(first, second))));

        OpenAiDeCoachContext context = projector.project(personalizationState(), plan, true, "de");

        assertThat(context.personalizationHistory().completedDecisions().getFirst().selectedLabels())
                .containsExactly("Gleiches Label");
    }

    @Test
    void failsClosedForDuplicateEditableRewindReferences() {
        PersonalizationPlan.Option selected = scopeValueOption(
                "po-selected",
                "stage",
                "value",
                "Auswahl");
        PersonalizationPlan plan = PersonalizationPlan.complete(
                List.of(selected),
                List.of(
                        new PersonalizationPlan.CompletedDecision(
                                "rewind-duplicate",
                                "stage-one",
                                "Stufe eins",
                                "group-one",
                                "Frage eins",
                                "instance-one",
                                List.of(selected)),
                        new PersonalizationPlan.CompletedDecision(
                                "rewind-duplicate",
                                "stage-two",
                                "Stufe zwei",
                                "group-two",
                                "Frage zwei",
                                "instance-two",
                                List.of(selected))));

        assertThatThrownBy(() -> projector.project(personalizationState(), plan, true, "de"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("duplicate rewind reference");
    }

    @Test
    void failsClosedWhenEditableHistoryHasNoNonBlankRewindReference() {
        PersonalizationPlan.Option selected = scopeValueOption(
                "po-selected",
                "stage",
                "SekI",
                "Sekundarstufe I");
        PersonalizationPlan currentWithoutRewind = PersonalizationPlan.selection(
                "stage",
                "Stufe",
                "group",
                "Welche Stufe?",
                "instance",
                1,
                2,
                1,
                List.of(selected),
                List.of(selected),
                List.of(selected),
                List.of(selected),
                " ",
                List.of(),
                List.of());
        PersonalizationPlan completedWithoutRewind = PersonalizationPlan.complete(
                List.of(selected),
                List.of(new PersonalizationPlan.CompletedDecision(
                        "",
                        "stage",
                        "Stufe",
                        "group",
                        "Welche Stufe?",
                        "instance",
                        List.of(selected))));

        assertThatThrownBy(() -> projector.project(
                        personalizationState(), currentWithoutRewind, true, "de"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("requires an opaque rewind reference");
        assertThatThrownBy(() -> projector.project(
                        personalizationState(), completedWithoutRewind, true, "de"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("requires an opaque rewind reference");
    }

    @Test
    void deserializesThePreLocalizedPlanJsonShapeWithNullEnglishAdditions() throws Exception {
        String legacyJson = """
                {
                  "stage":"COMPLETE",
                  "options":[],
                  "displayOptions":[],
                  "navigationOptions":[{
                    "optionId":"po-legacy",
                    "landscapeId":"legacy-landscape",
                    "landscapeLabel":"Legacy label",
                    "kind":"VALUE"
                  }],
                  "currentSelectedOptions":[],
                  "completedDecisions":[],
                  "preservedDecisions":[],
                  "pendingDecisions":[],
                  "canReopenMigratedPersonalization":false
                }
                """;

        PersonalizationPlan plan = new ObjectMapper().readValue(legacyJson, PersonalizationPlan.class);

        assertThat(plan.valid()).isTrue();
        assertThat(plan.stageLabelEn()).isNull();
        assertThat(plan.groupLabelEn()).isNull();
        assertThat(plan.navigationOptions()).singleElement().satisfies(option -> {
            assertThat(option.landscapeLabel()).isEqualTo("Legacy label");
            assertThat(option.landscapeLabelEn()).isNull();
            assertThat(option.filterLabelEn()).isNull();
            assertThat(option.scopeLabelEn()).isNull();
        });
    }

    private static PersonalizationPlan completedScopePlan(String rewindId, String selectedLabel) {
        PersonalizationPlan.Option selected = scopeValueOption(
                "po-selected",
                "stage",
                "value",
                selectedLabel);
        return PersonalizationPlan.complete(
                List.of(selected),
                List.of(new PersonalizationPlan.CompletedDecision(
                        rewindId,
                        "stage",
                        "Stufe",
                        "group",
                        "Welche Stufe?",
                        "instance",
                        List.of(selected))));
    }

    private static UnifiedLearnerStateResponse personalizationState() {
        LandscapeSummary root = new LandscapeSummary(
                ROOT_ID,
                "Panel Quartz",
                "Synthetic root",
                "ZZ",
                "ZZZ",
                "form-17",
                "subject-29",
                "zz-ZZ",
                List.of());
        return new UnifiedLearnerStateResponse(
                "synthetic-learner-73",
                root,
                List.of(),
                new LearnerGoals(
                        List.of(),
                        0,
                        0,
                        new GoalStats(0, 0),
                        new GoalStats(0, 0),
                        false),
                List.of("setPersonalization"),
                List.of(),
                Set.of(),
                "frontier",
                null,
                new StateMachineInfo(
                        "PERSONALIZATION",
                        "setPersonalization",
                        List.of(),
                        List.of(),
                        null));
    }

    private static PersonalizationPlan selectionPlan(
            List<PersonalizationPlan.Option> options) {
        return PersonalizationPlan.selection(
                "stage-neutral",
                "Neutral stage",
                "group-neutral",
                "Neutral group",
                "instance-neutral",
                1,
                1,
                0,
                options,
                options);
    }

    private static PersonalizationPlan.Option option(
            String optionId,
            String landscapeId,
            String landscapeLabel,
            String filterId,
            String filterLabel) {
        return new PersonalizationPlan.Option(
                optionId,
                "stage-neutral",
                "group-neutral",
                "instance-neutral",
                landscapeId,
                landscapeLabel,
                filterId,
                filterLabel);
    }

    private static PersonalizationPlan.Option scopeValueOption(
            String optionId,
            String scopeKey,
            String scopeValue,
            String scopeLabel) {
        return new PersonalizationPlan.Option(
                optionId,
                "stage-neutral",
                "group-neutral",
                "instance-neutral",
                ROOT_ID,
                "Panel Quartz",
                null,
                null,
                scopeKey,
                scopeValue,
                scopeLabel,
                PersonalizationPlan.OptionKind.SCOPE_VALUE);
    }
}
