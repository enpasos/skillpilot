package com.skillpilot.backend.service;

import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.landscape.PersonalizationFlow;
import com.skillpilot.backend.landscape.PersonalizationGroup;
import com.skillpilot.backend.landscape.PersonalizationOptionSource;
import com.skillpilot.backend.landscape.PersonalizationScopeValue;
import com.skillpilot.backend.landscape.PersonalizationScopeBinding;
import com.skillpilot.backend.landscape.PersonalizationSourceKind;
import com.skillpilot.backend.landscape.PersonalizationStage;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

/**
 * Evaluates an explicitly authored curriculum-personalization flow.
 *
 * <p>The skill graph is intentionally absent from this implementation.
 * In particular, {@code contains} and {@code requires} never create user
 * choices. A curriculum without an authored flow has no mandatory guided
 * personalization. A malformed authored flow fails closed.</p>
 */
public final class CurriculumPersonalizationPlanner {

    static final String SUPPORTED_FLOW_VERSION = "1";
    static final String FLOW_STATE_CONFIG_KEY = "__skillpilotPersonalizationFlow";
    static final String ROOT_LANDSCAPE_ID_KEY = "rootLandscapeId";
    static final String COMPLETED_OPTION_IDS_KEY = "completedOptionIds";
    static final String MIGRATION_COMPLETED_KEY = "migrationCompleted";

    private CurriculumPersonalizationPlanner() {
    }

    public static PersonalizationPlan plan(
            String rootLandscapeId,
            Function<String, SkillLandscape> landscapeResolver,
            Map<String, Map<String, Object>> personalCurriculum) {
        return plan(rootLandscapeId, landscapeResolver, null, personalCurriculum);
    }

    public static PersonalizationPlan plan(
            String rootLandscapeId,
            Function<String, SkillLandscape> landscapeResolver,
            CurriculumPersonalizationOfferingResolver offeringResolver,
            Map<String, Map<String, Object>> personalCurriculum) {
        if (rootLandscapeId == null || rootLandscapeId.isBlank() || landscapeResolver == null) {
            return PersonalizationPlan.invalid("personalization-root-missing");
        }

        SkillLandscape root = landscapeResolver.apply(rootLandscapeId);
        if (root == null || !rootLandscapeId.equals(root.getLandscapeId())) {
            return PersonalizationPlan.invalid("personalization-root-unknown");
        }

        PersonalizationFlow flow = root.getPersonalizationFlow();
        if (flow == null) {
            return PersonalizationPlan.complete(List.of());
        }

        ValidationResult validation = validate(flow, landscapeResolver);
        if (!validation.valid()) {
            return PersonalizationPlan.invalid(validation.problemCode());
        }
        if (requiresOfferingResolver(validation.stages()) && offeringResolver == null) {
            return PersonalizationPlan.invalid("personalization-offering-source-unavailable");
        }

        Map<String, Map<String, Object>> config =
                personalCurriculum == null ? Map.of() : personalCurriculum;
        CompletionState completionState = completionState(config, rootLandscapeId);
        if (!completionState.valid()) {
            return PersonalizationPlan.invalid(completionState.problemCode());
        }
        if (completionState.migrationCompleted()) {
            return PersonalizationPlan.migratedComplete(migratedSelectedLandscapeOptions(
                    rootLandscapeId,
                    validation.stages(),
                    landscapeResolver,
                    config));
        }
        List<PersonalizationPlan.Option> navigationOptions = new ArrayList<>();
        List<PersonalizationPlan.CompletedDecision> completedDecisions = new ArrayList<>();
        Map<String, List<String>> selectedLandscapeIdsByGroup = new LinkedHashMap<>();
        Map<String, List<PersonalizationPlan.Option>> selectedOptionsByGroup = new LinkedHashMap<>();

        for (PersonalizationStage stage : validation.stages()) {
            for (PersonalizationGroup group : sortedGroups(stage)) {
                PersonalizationOptionSource source = group.getSource();
                List<GroupInstance> instances = resolveInstances(
                        rootLandscapeId,
                        stage,
                        group,
                        source,
                        landscapeResolver,
                        offeringResolver,
                        selectedLandscapeIdsByGroup,
                        selectedOptionsByGroup);
                if (instances == null) {
                    return PersonalizationPlan.invalid("personalization-upstream-state-invalid");
                }

                List<String> groupLandscapeSelections = new ArrayList<>();
                List<PersonalizationPlan.Option> groupSelections = new ArrayList<>();
                for (GroupInstance instance : instances) {
                    SelectionState state = evaluate(instance, config);
                    if (!state.valid()) {
                        return PersonalizationPlan.invalid(state.problemCode());
                    }
                    navigationOptions.addAll(instance.options());
                    groupSelections.addAll(state.selected());

                    if (selectsLandscapes(source.getKind())) {
                        groupLandscapeSelections.addAll(state.selectedLandscapeIds());
                    }

                    int min = group.getMinSelections();
                    int max = group.getMaxSelections();
                    if (state.selectedCount() > max) {
                        return PersonalizationPlan.invalid("personalization-cardinality-exceeded");
                    }
                    PersonalizationPlan.Option completionOption =
                            completionOption(rootLandscapeId, flow, stage, group, instance);
                    boolean explicitlyCompleted =
                            completionState.optionIds().contains(completionOption.optionId());
                    if (explicitlyCompleted && state.selectedCount() < min) {
                        return PersonalizationPlan.invalid(
                                "personalization-completion-before-minimum");
                    }
                    if (explicitlyCompleted || state.selectedCount() == max) {
                        if (max > 0 && !instance.options().isEmpty()) {
                            completedDecisions.add(new PersonalizationPlan.CompletedDecision(
                                    completionOption.optionId(),
                                    stage.getId(),
                                    firstNonBlank(stage.getLabel(), stage.getId()),
                                    group.getId(),
                                    firstNonBlank(group.getLabel(), group.getId()),
                                    instance.id(),
                                    state.selected()));
                        }
                        continue;
                    }

                    Set<String> selectedOptionIds = state.selected().stream()
                            .map(PersonalizationPlan.Option::optionId)
                            .collect(java.util.stream.Collectors.toSet());
                    List<PersonalizationPlan.Option> pendingValueOptions = instance.options().stream()
                            .filter(option -> !selectedOptionIds.contains(option.optionId()))
                            .toList();
                    if (state.selectedCount() < min) {
                        if (pendingValueOptions.isEmpty()) {
                            return PersonalizationPlan.invalid("personalization-cardinality-unreachable");
                        }
                        return PersonalizationPlan.selection(
                                stage.getId(),
                                firstNonBlank(stage.getLabel(), stage.getId()),
                                group.getId(),
                                firstNonBlank(group.getLabel(), group.getId()),
                                instance.id(),
                                min,
                                max,
                                state.selectedCount(),
                                pendingValueOptions,
                                instance.displayOptions(),
                                navigationOptions,
                                state.selected(),
                                completionOption.optionId(),
                                completedDecisions,
                                pendingDecisionPrompts(
                                        validation.stages(),
                                        stage.getId(),
                                        group.getId()));
                    }

                    List<PersonalizationPlan.Option> currentOptions =
                            new ArrayList<>(pendingValueOptions);
                    currentOptions.add(completionOption);
                    return PersonalizationPlan.selection(
                            stage.getId(),
                            firstNonBlank(stage.getLabel(), stage.getId()),
                            group.getId(),
                            firstNonBlank(group.getLabel(), group.getId()),
                            instance.id(),
                            min,
                            max,
                            state.selectedCount(),
                            currentOptions,
                            instance.displayOptions(),
                            navigationOptions,
                            state.selected(),
                            completionOption.optionId(),
                            completedDecisions,
                                pendingDecisionPrompts(
                                        validation.stages(),
                                        stage.getId(),
                                        group.getId()));
                }
                selectedOptionsByGroup.put(group.getId(), List.copyOf(groupSelections));
                if (selectsLandscapes(source.getKind())) {
                    selectedLandscapeIdsByGroup.put(group.getId(), List.copyOf(groupLandscapeSelections));
                }
            }
        }

        return PersonalizationPlan.complete(navigationOptions, completedDecisions);
    }

    /**
     * A cutover marker suppresses choices that did not exist in the legacy
     * source. Offering bindings may therefore be intentionally unresolved
     * until the learner explicitly reopens personalization. Preserve only
     * already selected, authored landscape candidates as navigation metadata;
     * this keeps the established runtime scope without admitting unknown
     * configuration entries or inferring any missing dimension.
     */
    private static List<PersonalizationPlan.Option> migratedSelectedLandscapeOptions(
            String rootLandscapeId,
            List<PersonalizationStage> stages,
            Function<String, SkillLandscape> landscapeResolver,
            Map<String, Map<String, Object>> config) {
        LinkedHashMap<String, PersonalizationPlan.Option> selected = new LinkedHashMap<>();
        for (PersonalizationStage stage : stages) {
            for (PersonalizationGroup group : sortedGroups(stage)) {
                PersonalizationOptionSource source = group.getSource();
                if (source == null
                        || !selectsLandscapes(source.getKind())
                        || source.getLandscapeIds() == null) {
                    continue;
                }
                for (String landscapeId : source.getLandscapeIds()) {
                    Map<String, Object> settings = config.get(landscapeId);
                    if (settings == null || !Boolean.TRUE.equals(settings.get("selected"))) {
                        continue;
                    }
                    SkillLandscape landscape = resolveExact(landscapeResolver, landscapeId);
                    if (landscape == null) {
                        continue;
                    }
                    PersonalizationPlan.Option option = option(
                            rootLandscapeId,
                            stage,
                            group,
                            group.getId(),
                            landscape,
                            null);
                    selected.putIfAbsent(option.optionId(), option);
                }
            }
        }
        return List.copyOf(selected.values());
    }

    /**
     * Source-compatible overload for tests and legacy callers. The list is
     * treated only as an ID resolver; its graph relationships are ignored.
     */
    public static PersonalizationPlan plan(
            String rootLandscapeId,
            List<SkillLandscape> authoredLandscapes,
            Map<String, Map<String, Object>> personalCurriculum) {
        return plan(rootLandscapeId, authoredLandscapes, null, personalCurriculum);
    }

    public static PersonalizationPlan plan(
            String rootLandscapeId,
            List<SkillLandscape> authoredLandscapes,
            CurriculumPersonalizationOfferingResolver offeringResolver,
            Map<String, Map<String, Object>> personalCurriculum) {
        Map<String, SkillLandscape> byId = new LinkedHashMap<>();
        if (authoredLandscapes != null) {
            for (SkillLandscape landscape : authoredLandscapes) {
                if (landscape != null
                        && landscape.getLandscapeId() != null
                        && !landscape.getLandscapeId().isBlank()) {
                    byId.putIfAbsent(landscape.getLandscapeId(), landscape);
                }
            }
        }
        return plan(rootLandscapeId, byId::get, offeringResolver, personalCurriculum);
    }

    /**
     * Resolves a submitted filter in the namespace of exactly one landscape.
     */
    public static String canonicalFilterId(SkillLandscape landscape, String candidate) {
        if (landscape == null
                || candidate == null
                || candidate.isBlank()
                || landscape.getFilters() == null) {
            return null;
        }
        String submitted = candidate.trim();
        return landscape.getFilters().stream()
                .filter(Objects::nonNull)
                .map(LandscapeFilter::getId)
                .filter(Objects::nonNull)
                .filter(authoredId -> !authoredId.isBlank())
                .filter(authoredId -> authoredId.equalsIgnoreCase(submitted))
                .findFirst()
                .orElse(null);
    }

    /**
     * Records one already revalidated group-completion option in the reserved
     * personalization-flow state. No curriculum landscape or filter is
     * selected by this operation.
     */
    static void recordGroupCompletion(
            Map<String, Object> personalCurriculum,
            String rootLandscapeId,
            PersonalizationPlan.Option option) {
        if (personalCurriculum == null
                || blank(rootLandscapeId)
                || option == null
                || option.kind() != PersonalizationPlan.OptionKind.COMPLETE_GROUP
                || blank(option.optionId())) {
            throw new IllegalArgumentException("A valid group-completion option is required");
        }

        Map<String, Object> flowState = mutableStringObjectMap(
                personalCurriculum.get(FLOW_STATE_CONFIG_KEY),
                "Invalid personalization completion state");
        Object existingRoot = flowState.get(ROOT_LANDSCAPE_ID_KEY);
        LinkedHashSet<String> completedOptionIds =
                rootLandscapeId.equals(existingRoot)
                        ? mutableCompletedOptionIds(
                                flowState.get(COMPLETED_OPTION_IDS_KEY),
                                "Invalid personalization completion state")
                        : new LinkedHashSet<>();
        if (!rootLandscapeId.equals(existingRoot)) {
            flowState.clear();
        }
        completedOptionIds.add(option.optionId());
        flowState.put(ROOT_LANDSCAPE_ID_KEY, rootLandscapeId);
        flowState.put(COMPLETED_OPTION_IDS_KEY, List.copyOf(completedOptionIds));
        personalCurriculum.put(FLOW_STATE_CONFIG_KEY, flowState);
    }

    /**
     * Marks a configuration imported by an explicit legacy cutover as already
     * personalized for exactly one authored root flow.
     *
     * <p>This marker never selects curricula, filters, goals, or mastery. It
     * only prevents a successfully migrated learner from being forced through
     * choices that did not exist in the source configuration.</p>
     */
    static void markMigrationCompleted(
            Map<String, Object> personalCurriculum,
            String rootLandscapeId) {
        if (personalCurriculum == null || blank(rootLandscapeId)) {
            throw new IllegalArgumentException("A personalization root is required");
        }

        Map<String, Object> flowState = mutableStringObjectMap(
                personalCurriculum.get(FLOW_STATE_CONFIG_KEY),
                "Invalid personalization completion state");
        Object existingRoot = flowState.get(ROOT_LANDSCAPE_ID_KEY);
        if (!rootLandscapeId.equals(existingRoot)) {
            flowState.clear();
            flowState.put(ROOT_LANDSCAPE_ID_KEY, rootLandscapeId);
            flowState.put(COMPLETED_OPTION_IDS_KEY, List.of());
        }
        flowState.put(MIGRATION_COMPLETED_KEY, true);
        personalCurriculum.put(FLOW_STATE_CONFIG_KEY, flowState);
    }

    /**
     * Reopens a previously migrated personalization flow for an explicit
     * learner-initiated launch.
     *
     * <p>Only the compatibility marker is removed. Existing subject choices,
     * per-subject course profiles, scope values and completed authored groups
     * remain untouched. This lets newly introduced independent dimensions be
     * collected without resetting the learner's existing configuration.</p>
     */
    static boolean reopenMigratedFlow(
            Map<String, Object> personalCurriculum,
            String rootLandscapeId) {
        if (personalCurriculum == null || blank(rootLandscapeId)) {
            return false;
        }
        Object rawFlowState = personalCurriculum.get(FLOW_STATE_CONFIG_KEY);
        if (!(rawFlowState instanceof Map<?, ?> rawMap)) {
            return false;
        }
        Map<String, Object> flowState = mutableStringObjectMap(
                rawMap,
                "Invalid personalization completion state");
        if (!rootLandscapeId.equals(flowState.get(ROOT_LANDSCAPE_ID_KEY))) {
            return false;
        }
        if (flowState.remove(MIGRATION_COMPLETED_KEY) == null) {
            return false;
        }
        personalCurriculum.put(FLOW_STATE_CONFIG_KEY, flowState);
        return true;
    }

    private static ValidationResult validate(
            PersonalizationFlow flow,
            Function<String, SkillLandscape> resolver) {
        if (!SUPPORTED_FLOW_VERSION.equals(flow.getVersion())) {
            return ValidationResult.invalid("personalization-flow-version-unsupported");
        }
        if (flow.getStages() == null || flow.getStages().isEmpty()) {
            return ValidationResult.invalid("personalization-stages-missing");
        }

        List<PersonalizationStage> stages = flow.getStages().stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(PersonalizationStage::getOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(PersonalizationStage::getId, Comparator.nullsLast(String::compareTo)))
                .toList();
        if (stages.size() != flow.getStages().size()) {
            return ValidationResult.invalid("personalization-stage-null");
        }

        Set<String> stageIds = new HashSet<>();
        Set<Integer> stageOrders = new HashSet<>();
        Set<String> groupIds = new HashSet<>();
        Map<String, PersonalizationGroup> earlierGroups = new LinkedHashMap<>();
        for (PersonalizationStage stage : stages) {
            if (blank(stage.getId())
                    || blank(stage.getLabel())
                    || presentButBlank(stage.getLabelEn())
                    || stage.getOrder() == null
                    || !stageIds.add(stage.getId())
                    || !stageOrders.add(stage.getOrder())
                    || stage.getGroups() == null
                    || stage.getGroups().isEmpty()
                    || stage.getGroups().stream().anyMatch(Objects::isNull)) {
                return ValidationResult.invalid("personalization-stage-invalid");
            }

            Set<Integer> groupOrders = new HashSet<>();
            for (PersonalizationGroup group : sortedGroups(stage)) {
                if (group == null
                        || blank(group.getId())
                        || blank(group.getLabel())
                        || presentButBlank(group.getLabelEn())
                        || group.getOrder() == null
                        || !groupIds.add(group.getId())
                        || !groupOrders.add(group.getOrder())
                        || group.getMinSelections() == null
                        || group.getMaxSelections() == null
                        || group.getMinSelections() < 0
                        || group.getMaxSelections() < group.getMinSelections()
                        || group.getSource() == null
                        || group.getSource().getKind() == null) {
                    return ValidationResult.invalid("personalization-group-invalid");
                }

                PersonalizationOptionSource source = group.getSource();
                String sourceProblem = validateSource(group, source, resolver, earlierGroups);
                if (sourceProblem != null) {
                    return ValidationResult.invalid(sourceProblem);
                }
                earlierGroups.put(group.getId(), group);
            }
        }
        return ValidationResult.valid(stages);
    }

    private static String validateSource(
            PersonalizationGroup group,
            PersonalizationOptionSource source,
            Function<String, SkillLandscape> resolver,
            Map<String, PersonalizationGroup> earlierGroups) {
        return switch (source.getKind()) {
            case LANDSCAPE_FILTERS -> {
                if (blank(source.getLandscapeId())
                        || nonEmpty(source.getLandscapeIds())
                        || !blank(source.getSelectedLandscapesFromGroupId())
                        || !blank(source.getScopeKey())
                        || nonEmpty(source.getValues())
                        || hasOfferingSourceFields(source)) {
                    yield "personalization-filter-source-invalid";
                }
                SkillLandscape landscape = resolveExact(resolver, source.getLandscapeId());
                if (landscape == null
                        || !authoredFiltersValid(landscape)
                        || !filtersResolve(landscape, source.getFilterIds())
                        || group.getMaxSelections() > 1
                        || group.getMinSelections() > authoredFilterIds(landscape).size()) {
                    yield "personalization-filter-source-unresolved";
                }
                yield null;
            }
            case LANDSCAPES -> {
                if (blankList(source.getLandscapeIds())
                        || !blank(source.getLandscapeId())
                        || !blank(source.getSelectedLandscapesFromGroupId())
                        || nonEmpty(source.getFilterIds())
                        || !blank(source.getScopeKey())
                        || nonEmpty(source.getValues())
                        || hasOfferingSourceFields(source)) {
                    yield "personalization-landscape-source-invalid";
                }
                Set<String> unique = new LinkedHashSet<>();
                boolean unresolved = source.getLandscapeIds().stream()
                        .anyMatch(id -> blank(id)
                                || !unique.add(id)
                                || resolveExact(resolver, id) == null);
                if (unresolved || group.getMaxSelections() > source.getLandscapeIds().size()) {
                    yield "personalization-landscape-source-unresolved";
                }
                yield null;
            }
            case FILTERS_FOR_SELECTED_LANDSCAPES -> {
                if (blank(source.getSelectedLandscapesFromGroupId())
                        || !blank(source.getLandscapeId())
                        || nonEmpty(source.getLandscapeIds())
                        || !blank(source.getScopeKey())
                        || nonEmpty(source.getValues())
                        || hasOfferingSourceFields(source)
                        || group.getMaxSelections() > 1) {
                    yield "personalization-dynamic-filter-source-invalid";
                }
                PersonalizationGroup upstream =
                        earlierGroups.get(source.getSelectedLandscapesFromGroupId());
                if (upstream == null
                        || upstream.getSource() == null
                        || !selectsLandscapes(upstream.getSource().getKind())) {
                    yield "personalization-upstream-group-invalid";
                }
                if (source.getFilterIds() != null) {
                    for (String landscapeId : upstream.getSource().getLandscapeIds()) {
                        SkillLandscape landscape = resolveExact(resolver, landscapeId);
                        if (landscape == null
                                || !authoredFiltersValid(landscape)) {
                            yield "personalization-dynamic-filter-unresolved";
                        }
                        /*
                         * V1 deliberately supports only one shared restricted
                         * filter vocabulary for all possible upstream
                         * landscapes. Heterogeneous vocabularies remain valid
                         * when filterIds is omitted; each selected landscape
                         * then contributes its own authored filters.
                         */
                        if (!filtersResolve(landscape, source.getFilterIds())) {
                            yield "personalization-dynamic-filter-vocabulary-incompatible";
                        }
                    }
                } else {
                    for (String landscapeId : upstream.getSource().getLandscapeIds()) {
                        SkillLandscape landscape = resolveExact(resolver, landscapeId);
                        if (landscape == null || !authoredFiltersValid(landscape)) {
                            yield "personalization-dynamic-filter-unresolved";
                        }
                    }
                }
                yield null;
            }
            case SCOPE_VALUES -> {
                if (blank(source.getLandscapeId())
                        || nonEmpty(source.getLandscapeIds())
                        || !blank(source.getSelectedLandscapesFromGroupId())
                        || nonEmpty(source.getFilterIds())
                        || blank(source.getScopeKey())
                        || !scopeValuesValid(source.getValues())
                        || hasOfferingSourceFields(source)) {
                    yield "personalization-scope-source-invalid";
                }
                SkillLandscape landscape = resolveExact(resolver, source.getLandscapeId());
                if (landscape == null
                        || group.getMaxSelections() > 1
                        || group.getMinSelections() > source.getValues().size()) {
                    yield "personalization-scope-source-unresolved";
                }
                yield null;
            }
            case OFFERED_LANDSCAPES -> {
                if (blankList(source.getLandscapeIds())
                        || !blank(source.getLandscapeId())
                        || !blank(source.getSelectedLandscapesFromGroupId())
                        || nonEmpty(source.getFilterIds())
                        || !blank(source.getScopeKey())
                        || nonEmpty(source.getValues())
                        || !blank(source.getTargetLandscapeId())
                        || source.getOptionalWhenUnavailable() != null
                        || !scopeBindingsValid(source.getScopeBindings(), earlierGroups, null)) {
                    yield "personalization-offered-landscape-source-invalid";
                }
                if (!landscapeIdsResolve(source.getLandscapeIds(), resolver)
                        || group.getMaxSelections() > source.getLandscapeIds().size()) {
                    yield "personalization-offered-landscape-source-unresolved";
                }
                yield null;
            }
            case OFFERED_FILTERS_FOR_SELECTED_LANDSCAPES -> {
                if (blank(source.getSelectedLandscapesFromGroupId())
                        || !blank(source.getLandscapeId())
                        || nonEmpty(source.getLandscapeIds())
                        || !nonEmpty(source.getFilterIds())
                        || blank(source.getScopeKey())
                        || nonEmpty(source.getValues())
                        || !blank(source.getTargetLandscapeId())
                        || !scopeBindingsValid(
                                source.getScopeBindings(),
                                earlierGroups,
                                source.getScopeKey())
                        || group.getMaxSelections() > 1) {
                    yield "personalization-offered-filter-source-invalid";
                }
                PersonalizationGroup upstream =
                        earlierGroups.get(source.getSelectedLandscapesFromGroupId());
                if (upstream == null
                        || upstream.getSource() == null
                        || !selectsLandscapes(upstream.getSource().getKind())) {
                    yield "personalization-upstream-group-invalid";
                }
                for (String landscapeId : upstream.getSource().getLandscapeIds()) {
                    SkillLandscape landscape = resolveExact(resolver, landscapeId);
                    if (landscape == null
                            || !authoredFiltersValid(landscape)
                            || !filtersResolve(landscape, source.getFilterIds())) {
                        yield "personalization-offered-filter-source-unresolved";
                    }
                }
                yield null;
            }
            case OFFERED_SCOPE_VALUES -> {
                boolean explicitCandidates = nonEmpty(source.getLandscapeIds())
                        && !blank(source.getTargetLandscapeId())
                        && blank(source.getSelectedLandscapesFromGroupId());
                boolean selectedCandidates = blankList(source.getLandscapeIds())
                        && blank(source.getTargetLandscapeId())
                        && !blank(source.getSelectedLandscapesFromGroupId());
                if (!blank(source.getLandscapeId())
                        || nonEmpty(source.getFilterIds())
                        || blank(source.getScopeKey())
                        || !scopeValuesValid(source.getValues())
                        || (!explicitCandidates && !selectedCandidates)
                        || !scopeBindingsValid(
                                source.getScopeBindings(),
                                earlierGroups,
                                source.getScopeKey())
                        || group.getMaxSelections() > 1) {
                    yield "personalization-offered-scope-source-invalid";
                }
                if (explicitCandidates
                        && (!landscapeIdsResolve(source.getLandscapeIds(), resolver)
                                || resolveExact(resolver, source.getTargetLandscapeId()) == null)) {
                    yield "personalization-offered-scope-source-unresolved";
                }
                if (selectedCandidates) {
                    PersonalizationGroup upstream =
                            earlierGroups.get(source.getSelectedLandscapesFromGroupId());
                    if (upstream == null
                            || upstream.getSource() == null
                            || !selectsLandscapes(upstream.getSource().getKind())) {
                        yield "personalization-upstream-group-invalid";
                    }
                }
                yield null;
            }
        };
    }

    private static List<GroupInstance> resolveInstances(
            String rootLandscapeId,
            PersonalizationStage stage,
            PersonalizationGroup group,
            PersonalizationOptionSource source,
            Function<String, SkillLandscape> resolver,
            CurriculumPersonalizationOfferingResolver offeringResolver,
            Map<String, List<String>> selectedLandscapeIdsByGroup,
            Map<String, List<PersonalizationPlan.Option>> selectedOptionsByGroup) {
        return switch (source.getKind()) {
            case LANDSCAPE_FILTERS -> {
                SkillLandscape landscape = resolveExact(resolver, source.getLandscapeId());
                yield List.of(filterInstance(
                        rootLandscapeId,
                        stage,
                        group,
                        landscape,
                        source.getFilterIds()));
            }
            case LANDSCAPES -> {
                List<PersonalizationPlan.Option> options = new ArrayList<>();
                for (String landscapeId : source.getLandscapeIds()) {
                    SkillLandscape landscape = resolveExact(resolver, landscapeId);
                    options.add(option(
                            rootLandscapeId,
                            stage,
                            group,
                            group.getId(),
                            landscape,
                            null));
                }
                yield List.of(new GroupInstance(group.getId(), List.copyOf(options)));
            }
            case FILTERS_FOR_SELECTED_LANDSCAPES -> {
                List<String> selected =
                        selectedLandscapeIdsByGroup.get(source.getSelectedLandscapesFromGroupId());
                if (selected == null) {
                    yield null;
                }
                List<GroupInstance> instances = new ArrayList<>();
                for (String landscapeId : selected) {
                    SkillLandscape landscape = resolveExact(resolver, landscapeId);
                    if (landscape == null) {
                        yield null;
                    }
                    GroupInstance instance = filterInstance(
                            rootLandscapeId,
                            stage,
                            group,
                            landscape,
                            source.getFilterIds());
                    if (!instance.options().isEmpty()) {
                        instances.add(instance);
                    }
                }
                yield List.copyOf(instances);
            }
            case SCOPE_VALUES -> {
                SkillLandscape landscape = resolveExact(resolver, source.getLandscapeId());
                String instanceId = group.getId()
                        + ":"
                        + landscape.getLandscapeId()
                        + ":scope:"
                        + source.getScopeKey();
                List<PersonalizationPlan.Option> options = source.getValues().stream()
                        .map(value -> scopeOption(
                                rootLandscapeId,
                                stage,
                                group,
                                instanceId,
                                landscape,
                                source.getScopeKey(),
                                value))
                        .toList();
                yield List.of(new GroupInstance(instanceId, options));
            }
            case OFFERED_LANDSCAPES -> {
                List<Map<String, String>> scopeProbes =
                        resolveScopeProbes(source.getScopeBindings(), selectedOptionsByGroup);
                if (scopeProbes == null) {
                    yield null;
                }
                List<PersonalizationPlan.Option> options = new ArrayList<>();
                List<PersonalizationPlan.Option> displayOptions = new ArrayList<>();
                for (String landscapeId : source.getLandscapeIds()) {
                    SkillLandscape landscape = resolveExact(resolver, landscapeId);
                    if (landscape == null) {
                        yield null;
                    }
                    PersonalizationPlan.Option landscapeOption = option(
                            rootLandscapeId,
                            stage,
                            group,
                            group.getId(),
                            landscape,
                            null);
                    displayOptions.add(landscapeOption);
                    if (hasReviewedOffering(
                            offeringResolver,
                            landscapeId,
                            scopeProbes,
                            null,
                            null)) {
                        options.add(landscapeOption);
                    }
                }
                yield List.of(new GroupInstance(
                        group.getId(),
                        List.copyOf(options),
                        List.copyOf(displayOptions)));
            }
            case OFFERED_FILTERS_FOR_SELECTED_LANDSCAPES -> {
                List<String> selected =
                        selectedLandscapeIdsByGroup.get(source.getSelectedLandscapesFromGroupId());
                List<Map<String, String>> scopeProbes =
                        resolveScopeProbes(source.getScopeBindings(), selectedOptionsByGroup);
                if (selected == null || scopeProbes == null) {
                    yield null;
                }
                List<GroupInstance> instances = new ArrayList<>();
                for (String landscapeId : selected) {
                    SkillLandscape landscape = resolveExact(resolver, landscapeId);
                    if (landscape == null) {
                        yield null;
                    }
                    List<String> offeredFilterIds = source.getFilterIds().stream()
                            .map(filterId -> canonicalFilterId(landscape, filterId))
                            .filter(Objects::nonNull)
                            .filter(filterId -> hasReviewedOffering(
                                    offeringResolver,
                                    landscapeId,
                                    scopeProbes,
                                    source.getScopeKey(),
                                    filterId))
                            .toList();
                    if (offeredFilterIds.isEmpty()
                            && Boolean.TRUE.equals(source.getOptionalWhenUnavailable())) {
                        continue;
                    }
                    String instanceId = group.getId()
                            + ":"
                            + landscape.getLandscapeId()
                            + ":offered-filters:"
                            + source.getScopeKey();
                    List<PersonalizationPlan.Option> options = offeredFilterIds.stream()
                            .map(filterId -> option(
                                    rootLandscapeId,
                                    stage,
                                    group,
                                    instanceId,
                                    landscape,
                                    filterId))
                            .toList();
                    instances.add(new GroupInstance(instanceId, options));
                }
                yield List.copyOf(instances);
            }
            case OFFERED_SCOPE_VALUES -> {
                List<Map<String, String>> scopeProbes =
                        resolveScopeProbes(source.getScopeBindings(), selectedOptionsByGroup);
                if (scopeProbes == null) {
                    yield null;
                }
                if (nonEmpty(source.getLandscapeIds())) {
                    SkillLandscape target =
                            resolveExact(resolver, source.getTargetLandscapeId());
                    if (target == null) {
                        yield null;
                    }
                    List<PersonalizationScopeValue> offeredValues = source.getValues().stream()
                            .filter(value -> source.getLandscapeIds().stream().anyMatch(candidateId ->
                                    hasReviewedOffering(
                                            offeringResolver,
                                            candidateId,
                                            scopeProbes,
                                            source.getScopeKey(),
                                            value.getValue())))
                            .toList();
                    if (offeredValues.isEmpty()
                            && Boolean.TRUE.equals(source.getOptionalWhenUnavailable())) {
                        yield List.of();
                    }
                    String instanceId = group.getId()
                            + ":"
                            + target.getLandscapeId()
                            + ":offered-scope:"
                            + source.getScopeKey();
                    List<PersonalizationPlan.Option> options = offeredValues.stream()
                            .map(value -> scopeOption(
                                    rootLandscapeId,
                                    stage,
                                    group,
                                    instanceId,
                                    target,
                                    source.getScopeKey(),
                                    value))
                            .toList();
                    yield List.of(new GroupInstance(instanceId, options));
                }

                List<String> selected =
                        selectedLandscapeIdsByGroup.get(source.getSelectedLandscapesFromGroupId());
                if (selected == null) {
                    yield null;
                }
                List<GroupInstance> instances = new ArrayList<>();
                for (String landscapeId : selected) {
                    SkillLandscape landscape = resolveExact(resolver, landscapeId);
                    if (landscape == null) {
                        yield null;
                    }
                    List<PersonalizationScopeValue> offeredValues = source.getValues().stream()
                            .filter(value -> hasReviewedOffering(
                                    offeringResolver,
                                    landscapeId,
                                    scopeProbes,
                                    source.getScopeKey(),
                                    value.getValue()))
                            .toList();
                    if (offeredValues.isEmpty()
                            && Boolean.TRUE.equals(source.getOptionalWhenUnavailable())) {
                        continue;
                    }
                    String instanceId = group.getId()
                            + ":"
                            + landscape.getLandscapeId()
                            + ":offered-scope:"
                            + source.getScopeKey();
                    List<PersonalizationPlan.Option> options = offeredValues.stream()
                            .map(value -> scopeOption(
                                    rootLandscapeId,
                                    stage,
                                    group,
                                    instanceId,
                                    landscape,
                                    source.getScopeKey(),
                                    value))
                            .toList();
                    instances.add(new GroupInstance(instanceId, options));
                }
                yield List.copyOf(instances);
            }
        };
    }

    private static List<Map<String, String>> resolveScopeProbes(
            List<PersonalizationScopeBinding> bindings,
            Map<String, List<PersonalizationPlan.Option>> selectedOptionsByGroup) {
        List<Map<String, String>> probes = new ArrayList<>();
        probes.add(new LinkedHashMap<>());

        for (PersonalizationScopeBinding binding : bindings) {
            boolean required = !Boolean.FALSE.equals(binding.getRequired());
            boolean selectedValueBinding =
                    !blank(binding.getSelectedValueFromGroupId());
            List<String> values;
            if (!blank(binding.getValue())) {
                values = List.of(binding.getValue());
            } else if (nonEmpty(binding.getValues())) {
                values = binding.getValues();
            } else {
                List<PersonalizationPlan.Option> selected =
                        selectedOptionsByGroup.get(binding.getSelectedValueFromGroupId());
                if (selected == null || selected.size() > 1) {
                    return null;
                }
                if (selected.isEmpty()) {
                    if (required) {
                        return null;
                    }
                    continue;
                }
                String selectedValue = selectedOptionValue(selected.getFirst());
                if (blank(selectedValue)) {
                    return null;
                }
                if (containsIgnoreCase(binding.getOmitValues(), selectedValue)) {
                    continue;
                }
                values = List.of(selectedValue);
            }

            List<Map<String, String>> next = new ArrayList<>();
            /*
             * An optional literal/value list deliberately probes both the
             * dimensioned and dimensionless authored variants. By contrast,
             * an already selected upstream value is authoritative: optional
             * means that the upstream group may have no value, not that a
             * committed G8/G9 (or similar value) may be silently dropped.
             * Any reviewed Sek-II duration fallback belongs in the offering
             * resolver, where it can be constrained by the full scope.
             */
            if (!required && !selectedValueBinding) {
                probes.forEach(probe -> next.add(new LinkedHashMap<>(probe)));
            }
            for (Map<String, String> probe : probes) {
                for (String value : values) {
                    Map<String, String> expanded = new LinkedHashMap<>(probe);
                    expanded.put(binding.getDimension(), value);
                    next.add(expanded);
                }
            }
            probes = next;
        }

        return probes.stream()
                .map(probe -> java.util.Collections.unmodifiableMap(new LinkedHashMap<>(probe)))
                .distinct()
                .toList();
    }

    private static boolean hasReviewedOffering(
            CurriculumPersonalizationOfferingResolver offeringResolver,
            String landscapeId,
            List<Map<String, String>> scopeProbes,
            String targetDimension,
            String targetValue) {
        if (offeringResolver == null || blank(landscapeId) || scopeProbes == null) {
            return false;
        }
        for (Map<String, String> probe : scopeProbes) {
            Map<String, String> requestedScope = new LinkedHashMap<>(probe);
            if (!blank(targetDimension) && !blank(targetValue)) {
                requestedScope.put(targetDimension, targetValue);
            }
            Map<String, String> resolvedScope =
                    offeringResolver.resolveScope(landscapeId, Map.copyOf(requestedScope));
            if (resolvedScope == null) {
                continue;
            }
            if (blank(targetDimension)) {
                return true;
            }
            String resolvedValue = resolvedScope.get(targetDimension);
            if (resolvedValue != null && resolvedValue.equalsIgnoreCase(targetValue)) {
                return true;
            }
        }
        return false;
    }

    private static String selectedOptionValue(PersonalizationPlan.Option option) {
        if (option == null) {
            return null;
        }
        if (!blank(option.scopeValue())) {
            return option.scopeValue();
        }
        if (!blank(option.filterId())) {
            return option.filterId();
        }
        return null;
    }

    private static boolean scopeBindingsValid(
            List<PersonalizationScopeBinding> bindings,
            Map<String, PersonalizationGroup> earlierGroups,
            String targetDimension) {
        if (bindings == null || bindings.isEmpty()) {
            return false;
        }
        Set<String> dimensions = new HashSet<>();
        for (PersonalizationScopeBinding binding : bindings) {
            if (binding == null
                    || blank(binding.getDimension())
                    || !dimensions.add(binding.getDimension())
                    || (!blank(targetDimension)
                            && targetDimension.equalsIgnoreCase(binding.getDimension()))) {
                return false;
            }
            int valueSourceCount = 0;
            if (!blank(binding.getValue())) {
                valueSourceCount += 1;
            }
            if (nonEmpty(binding.getValues())) {
                valueSourceCount += 1;
            }
            if (!blank(binding.getSelectedValueFromGroupId())) {
                valueSourceCount += 1;
            }
            if (valueSourceCount != 1
                    || !bindingValuesValid(binding.getValues())
                    || !bindingValuesValid(binding.getOmitValues())
                    || (nonEmpty(binding.getOmitValues())
                            && blank(binding.getSelectedValueFromGroupId()))) {
                return false;
            }
            if (!blank(binding.getSelectedValueFromGroupId())) {
                PersonalizationGroup upstream =
                        earlierGroups.get(binding.getSelectedValueFromGroupId());
                if (upstream == null
                        || upstream.getMaxSelections() == null
                        || upstream.getMaxSelections() > 1
                        || upstream.getSource() == null
                        || !sourceProvidesScopeValue(upstream.getSource().getKind())) {
                    return false;
                }
            }
        }
        return true;
    }

    private static boolean bindingValuesValid(List<String> values) {
        if (values == null) {
            return true;
        }
        if (values.isEmpty()) {
            return false;
        }
        Set<String> normalized = new HashSet<>();
        return values.stream().allMatch(value -> !blank(value)
                && normalized.add(value.trim().toLowerCase(java.util.Locale.ROOT)));
    }

    private static boolean containsIgnoreCase(List<String> values, String candidate) {
        return nonEmpty(values)
                && !blank(candidate)
                && values.stream().anyMatch(value -> value.equalsIgnoreCase(candidate));
    }

    private static boolean sourceProvidesScopeValue(PersonalizationSourceKind kind) {
        return kind == PersonalizationSourceKind.LANDSCAPE_FILTERS
                || kind == PersonalizationSourceKind.SCOPE_VALUES
                || kind == PersonalizationSourceKind.OFFERED_FILTERS_FOR_SELECTED_LANDSCAPES
                || kind == PersonalizationSourceKind.OFFERED_SCOPE_VALUES;
    }

    private static boolean selectsLandscapes(PersonalizationSourceKind kind) {
        return kind == PersonalizationSourceKind.LANDSCAPES
                || kind == PersonalizationSourceKind.OFFERED_LANDSCAPES;
    }

    /**
     * Resolves the authored group dependency closure for a targeted rewind.
     *
     * <p>Only explicit flow metadata creates dependencies: a group may consume
     * landscapes selected by an earlier group or a scope binding may consume
     * an earlier selected value. Authored order by itself is not a dependency,
     * so an independent later choice can survive a rewind.</p>
     */
    static Set<String> dependentGroupIds(
            PersonalizationFlow flow,
            String targetGroupId) {
        if (flow == null
                || flow.getStages() == null
                || blank(targetGroupId)) {
            return Set.of();
        }
        List<PersonalizationGroup> groups = flow.getStages().stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(
                                PersonalizationStage::getOrder,
                                Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(
                                PersonalizationStage::getId,
                                Comparator.nullsLast(String::compareTo)))
                .flatMap(stage -> sortedGroups(stage).stream())
                .filter(Objects::nonNull)
                .toList();
        if (groups.stream().noneMatch(group -> targetGroupId.equals(group.getId()))) {
            return Set.of();
        }

        LinkedHashSet<String> affected = new LinkedHashSet<>();
        affected.add(targetGroupId);
        boolean changed;
        do {
            changed = false;
            for (PersonalizationGroup group : groups) {
                if (group.getId() == null
                        || affected.contains(group.getId())
                        || group.getSource() == null) {
                    continue;
                }
                PersonalizationOptionSource source = group.getSource();
                boolean dependsOnAffected = affected.contains(
                        source.getSelectedLandscapesFromGroupId());
                if (!dependsOnAffected && source.getScopeBindings() != null) {
                    dependsOnAffected = source.getScopeBindings().stream()
                            .filter(Objects::nonNull)
                            .map(PersonalizationScopeBinding::getSelectedValueFromGroupId)
                            .anyMatch(affected::contains);
                }
                if (dependsOnAffected) {
                    affected.add(group.getId());
                    changed = true;
                }
            }
        } while (changed);
        return Set.copyOf(affected);
    }

    /**
     * Reads authored decision fields from sparse persisted configuration even
     * when normal planning stops at an earlier unanswered group.
     *
     * <p>This deliberately uses only the flow's explicit landscape allowlists,
     * authored value vocabularies and field ownership. It does not infer
     * options from graph relationships or treat the result as a currently
     * selectable offering. Inactive or unknown residual fields are returned
     * for cleanup, but are marked so they cannot be presented or replayed as
     * active choices.</p>
     */
    static List<StoredSelection> storedSelections(
            PersonalizationFlow flow,
            Function<String, SkillLandscape> landscapeResolver,
            Map<String, Map<String, Object>> config) {
        if (flow == null || flow.getStages() == null || config == null) {
            return List.of();
        }

        Map<String, List<String>> candidateLandscapeIdsByGroup =
                new LinkedHashMap<>();
        List<StoredSelection> selections = new ArrayList<>();
        List<PersonalizationStage> stages = flow.getStages().stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(
                                PersonalizationStage::getOrder,
                                Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(
                                PersonalizationStage::getId,
                                Comparator.nullsLast(String::compareTo)))
                .toList();

        for (PersonalizationStage stage : stages) {
            for (PersonalizationGroup group : sortedGroups(stage)) {
                if (group == null || blank(group.getId()) || group.getSource() == null) {
                    continue;
                }
                PersonalizationOptionSource source = group.getSource();
                PersonalizationSourceKind kind = source.getKind();
                if (kind == null) {
                    continue;
                }

                List<String> candidateLandscapeIds = switch (kind) {
                    case LANDSCAPE_FILTERS, SCOPE_VALUES ->
                        blank(source.getLandscapeId())
                                ? List.of()
                                : List.of(source.getLandscapeId());
                    case LANDSCAPES, OFFERED_LANDSCAPES ->
                        source.getLandscapeIds() == null
                                ? List.of()
                                : source.getLandscapeIds();
                    case FILTERS_FOR_SELECTED_LANDSCAPES,
                            OFFERED_FILTERS_FOR_SELECTED_LANDSCAPES ->
                        candidateLandscapeIdsByGroup.getOrDefault(
                                source.getSelectedLandscapesFromGroupId(),
                                List.of());
                    case OFFERED_SCOPE_VALUES -> !blank(source.getTargetLandscapeId())
                            ? List.of(source.getTargetLandscapeId())
                            : candidateLandscapeIdsByGroup.getOrDefault(
                                    source.getSelectedLandscapesFromGroupId(),
                                    List.of());
                };
                List<String> candidates = candidateLandscapeIds.stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(id -> !id.isBlank())
                        .distinct()
                        .toList();
                if (selectsLandscapes(kind)) {
                    candidateLandscapeIdsByGroup.put(group.getId(), candidates);
                }

                for (String landscapeId : candidates) {
                    Map<String, Object> settings = config.get(landscapeId);
                    if (settings == null) {
                        continue;
                    }
                    String instanceId;
                    switch (kind) {
                        case LANDSCAPE_FILTERS -> {
                            Object rawFilter = settings.get("filterId");
                            if (!(rawFilter instanceof String filterId)
                                    || filterId.isBlank()) {
                                continue;
                            }
                            String trimmedFilter = filterId.trim();
                            String canonicalFilter = canonicalFilterId(
                                    resolveExact(landscapeResolver, landscapeId),
                                    trimmedFilter);
                            boolean authoredFilter =
                                    canonicalFilter != null
                                            && (source.getFilterIds() == null
                                                    || containsIgnoreCase(
                                                            source.getFilterIds(),
                                                            canonicalFilter));
                            instanceId = source.getFilterIds() == null
                                    ? group.getId() + ":" + landscapeId
                                    : group.getId() + ":" + landscapeId + ":restricted";
                            selections.add(new StoredSelection(
                                    stage.getId(),
                                    firstNonBlank(stage.getLabel(), stage.getId()),
                                    group.getId(),
                                    firstNonBlank(group.getLabel(), group.getId()),
                                    instanceId,
                                    landscapeId,
                                    PersonalizationPlan.OptionKind.VALUE,
                                    canonicalFilter == null
                                            ? trimmedFilter
                                            : canonicalFilter,
                                    null,
                                    null,
                                    null,
                                    Boolean.TRUE.equals(settings.get("selected"))
                                            && authoredFilter));
                        }
                        case LANDSCAPES, OFFERED_LANDSCAPES -> {
                            if (!Boolean.TRUE.equals(settings.get("selected"))) {
                                continue;
                            }
                            selections.add(new StoredSelection(
                                    stage.getId(),
                                    firstNonBlank(stage.getLabel(), stage.getId()),
                                    group.getId(),
                                    firstNonBlank(group.getLabel(), group.getId()),
                                    group.getId(),
                                    landscapeId,
                                    PersonalizationPlan.OptionKind.VALUE,
                                    null,
                                    null,
                                    null,
                                    null,
                                    true));
                        }
                        case FILTERS_FOR_SELECTED_LANDSCAPES -> {
                            Object rawFilter = settings.get("filterId");
                            if (!(rawFilter instanceof String filterId)
                                    || filterId.isBlank()) {
                                continue;
                            }
                            String trimmedFilter = filterId.trim();
                            String canonicalFilter = canonicalFilterId(
                                    resolveExact(landscapeResolver, landscapeId),
                                    trimmedFilter);
                            boolean authoredFilter =
                                    canonicalFilter != null
                                            && (source.getFilterIds() == null
                                                    || containsIgnoreCase(
                                                            source.getFilterIds(),
                                                            canonicalFilter));
                            instanceId = source.getFilterIds() == null
                                    ? group.getId() + ":" + landscapeId
                                    : group.getId() + ":" + landscapeId + ":restricted";
                            selections.add(new StoredSelection(
                                    stage.getId(),
                                    firstNonBlank(stage.getLabel(), stage.getId()),
                                    group.getId(),
                                    firstNonBlank(group.getLabel(), group.getId()),
                                    instanceId,
                                    landscapeId,
                                    PersonalizationPlan.OptionKind.VALUE,
                                    canonicalFilter == null
                                            ? trimmedFilter
                                            : canonicalFilter,
                                    null,
                                    null,
                                    null,
                                    Boolean.TRUE.equals(settings.get("selected"))
                                            && authoredFilter));
                        }
                        case OFFERED_FILTERS_FOR_SELECTED_LANDSCAPES -> {
                            Object rawFilter = settings.get("filterId");
                            if (!(rawFilter instanceof String filterId)
                                    || filterId.isBlank()) {
                                continue;
                            }
                            String trimmedFilter = filterId.trim();
                            String canonicalFilter = canonicalFilterId(
                                    resolveExact(landscapeResolver, landscapeId),
                                    trimmedFilter);
                            boolean authoredFilter =
                                    canonicalFilter != null
                                            && containsIgnoreCase(
                                                    source.getFilterIds(),
                                                    canonicalFilter);
                            instanceId = group.getId()
                                    + ":"
                                    + landscapeId
                                    + ":offered-filters:"
                                    + source.getScopeKey();
                            selections.add(new StoredSelection(
                                    stage.getId(),
                                    firstNonBlank(stage.getLabel(), stage.getId()),
                                    group.getId(),
                                    firstNonBlank(group.getLabel(), group.getId()),
                                    instanceId,
                                    landscapeId,
                                    PersonalizationPlan.OptionKind.VALUE,
                                    canonicalFilter == null
                                            ? trimmedFilter
                                            : canonicalFilter,
                                    null,
                                    null,
                                    null,
                                    Boolean.TRUE.equals(settings.get("selected"))
                                            && authoredFilter));
                        }
                        case SCOPE_VALUES, OFFERED_SCOPE_VALUES -> {
                            if (blank(source.getScopeKey())) {
                                continue;
                            }
                            Object rawScope = settings.get(source.getScopeKey());
                            if (!(rawScope instanceof String scopeValue)
                                    || scopeValue.isBlank()) {
                                continue;
                            }
                            instanceId = group.getId()
                                    + ":"
                                    + landscapeId
                                    + (kind == PersonalizationSourceKind.SCOPE_VALUES
                                            ? ":scope:"
                                            : ":offered-scope:")
                                    + source.getScopeKey();
                            PersonalizationScopeValue authoredScope =
                                    source.getValues().stream()
                                    .filter(Objects::nonNull)
                                    .filter(value -> value.getValue() != null
                                            && value.getValue().equalsIgnoreCase(
                                                    scopeValue.trim()))
                                    .findFirst()
                                    .orElse(null);
                            String storedScopeValue = authoredScope == null
                                    ? scopeValue.trim()
                                    : authoredScope.getValue();
                            String scopeLabel = authoredScope == null
                                    ? scopeValue.trim()
                                    : firstNonBlank(
                                            authoredScope.getLabel(),
                                            authoredScope.getValue());
                            selections.add(new StoredSelection(
                                    stage.getId(),
                                    firstNonBlank(stage.getLabel(), stage.getId()),
                                    group.getId(),
                                    firstNonBlank(group.getLabel(), group.getId()),
                                    instanceId,
                                    landscapeId,
                                    PersonalizationPlan.OptionKind.SCOPE_VALUE,
                                    null,
                                    source.getScopeKey(),
                                    storedScopeValue,
                                    scopeLabel,
                                    Boolean.TRUE.equals(settings.get("selected"))
                                            && authoredScope != null));
                        }
                    }
                }
            }
        }
        return List.copyOf(selections);
    }

    /**
     * Resolves persisted group-completion tokens that are still valid for the
     * current authored instances.
     *
     * <p>This deliberately traverses the complete flow instead of stopping at
     * the first unanswered decision. Independent later groups can therefore
     * keep their completion state while a different branch is edited. Groups
     * whose explicit upstream bindings are unresolved do not contribute a
     * completion token.</p>
     */
    static List<PersonalizationPlan.Option> validCompletionOptions(
            String rootLandscapeId,
            Function<String, SkillLandscape> landscapeResolver,
            CurriculumPersonalizationOfferingResolver offeringResolver,
            Map<String, Map<String, Object>> personalCurriculum) {
        if (blank(rootLandscapeId) || landscapeResolver == null) {
            return List.of();
        }
        SkillLandscape root = resolveExact(landscapeResolver, rootLandscapeId);
        if (root == null || root.getPersonalizationFlow() == null) {
            return List.of();
        }
        PersonalizationFlow flow = root.getPersonalizationFlow();
        ValidationResult validation = validate(flow, landscapeResolver);
        if (!validation.valid()
                || (requiresOfferingResolver(validation.stages())
                        && offeringResolver == null)) {
            return List.of();
        }

        Map<String, Map<String, Object>> config =
                personalCurriculum == null ? Map.of() : personalCurriculum;
        CompletionState completionState = completionState(config, rootLandscapeId);
        if (!completionState.valid() || completionState.migrationCompleted()) {
            return List.of();
        }

        List<PersonalizationPlan.Option> validCompletions = new ArrayList<>();
        Map<String, List<String>> selectedLandscapeIdsByGroup = new LinkedHashMap<>();
        Map<String, List<PersonalizationPlan.Option>> selectedOptionsByGroup =
                new LinkedHashMap<>();
        for (PersonalizationStage stage : validation.stages()) {
            for (PersonalizationGroup group : sortedGroups(stage)) {
                PersonalizationOptionSource source = group.getSource();
                List<GroupInstance> instances = resolveInstances(
                        rootLandscapeId,
                        stage,
                        group,
                        source,
                        landscapeResolver,
                        offeringResolver,
                        selectedLandscapeIdsByGroup,
                        selectedOptionsByGroup);
                List<PersonalizationPlan.Option> groupSelections = new ArrayList<>();
                List<String> groupLandscapeSelections = new ArrayList<>();
                if (instances != null) {
                    for (GroupInstance instance : instances) {
                        SelectionState state = evaluate(instance, config);
                        if (!state.valid()
                                || state.selectedCount() > group.getMaxSelections()) {
                            continue;
                        }
                        groupSelections.addAll(state.selected());
                        if (selectsLandscapes(source.getKind())) {
                            groupLandscapeSelections.addAll(
                                    state.selectedLandscapeIds());
                        }
                        PersonalizationPlan.Option completion = completionOption(
                                rootLandscapeId,
                                flow,
                                stage,
                                group,
                                instance);
                        if (completionState.optionIds().contains(
                                        completion.optionId())
                                && state.selectedCount()
                                        >= group.getMinSelections()) {
                            validCompletions.add(completion);
                        }
                    }
                }
                selectedOptionsByGroup.put(
                        group.getId(),
                        List.copyOf(groupSelections));
                if (selectsLandscapes(source.getKind())) {
                    selectedLandscapeIdsByGroup.put(
                            group.getId(),
                            List.copyOf(groupLandscapeSelections));
                }
            }
        }
        return List.copyOf(validCompletions);
    }

    private static boolean requiresOfferingResolver(List<PersonalizationStage> stages) {
        return stages.stream()
                .flatMap(stage -> sortedGroups(stage).stream())
                .map(PersonalizationGroup::getSource)
                .filter(Objects::nonNull)
                .map(PersonalizationOptionSource::getKind)
                .anyMatch(kind -> kind == PersonalizationSourceKind.OFFERED_LANDSCAPES
                        || kind == PersonalizationSourceKind.OFFERED_FILTERS_FOR_SELECTED_LANDSCAPES
                        || kind == PersonalizationSourceKind.OFFERED_SCOPE_VALUES);
    }

    private static boolean hasOfferingSourceFields(PersonalizationOptionSource source) {
        return source != null
                && (!blank(source.getTargetLandscapeId())
                        || nonEmpty(source.getScopeBindings())
                        || source.getOptionalWhenUnavailable() != null);
    }

    private static boolean landscapeIdsResolve(
            List<String> landscapeIds,
            Function<String, SkillLandscape> resolver) {
        if (blankList(landscapeIds)) {
            return false;
        }
        Set<String> unique = new LinkedHashSet<>();
        return landscapeIds.stream().allMatch(id -> !blank(id)
                && unique.add(id)
                && resolveExact(resolver, id) != null);
    }

    private static GroupInstance filterInstance(
            String rootLandscapeId,
            PersonalizationStage stage,
            PersonalizationGroup group,
            SkillLandscape landscape,
            List<String> restrictedFilterIds) {
        String instanceId = restrictedFilterIds == null
                ? group.getId() + ":" + landscape.getLandscapeId()
                : group.getId() + ":" + landscape.getLandscapeId() + ":restricted";
        List<String> filterIds = restrictedFilterIds == null
                ? authoredFilterIds(landscape)
                : restrictedFilterIds.stream()
                        /*
                         * Restrictions are matched case-insensitively during
                         * validation, but metadata remains authoritative for
                         * identity and persistence. Normalize every valid
                         * restriction to the exact authored spelling before
                         * deriving labels or opaque option IDs.
                         */
                        .map(filterId -> canonicalFilterId(landscape, filterId))
                        .toList();
        List<PersonalizationPlan.Option> options = new ArrayList<>();
        for (String filterId : filterIds) {
            options.add(option(
                    rootLandscapeId,
                    stage,
                    group,
                    instanceId,
                    landscape,
                    filterId));
        }
        return new GroupInstance(instanceId, List.copyOf(options));
    }

    private static PersonalizationPlan.Option option(
            String rootLandscapeId,
            PersonalizationStage stage,
            PersonalizationGroup group,
            String instanceId,
            SkillLandscape landscape,
            String filterId) {
        String landscapeLabel = firstNonBlank(
                landscape.getSubject(),
                landscape.getTitle(),
                landscape.getLandscapeId());
        String filterLabel = null;
        if (filterId != null) {
            filterLabel = landscape.getFilters().stream()
                    .filter(Objects::nonNull)
                    .filter(filter -> filterId.equals(filter.getId()))
                    .map(filter -> firstNonBlank(filter.getLabel(), filter.getId()))
                    .findFirst()
                    .orElse(filterId);
        }
        return new PersonalizationPlan.Option(
                stableOptionId(
                        rootLandscapeId,
                        stage.getId(),
                        group.getId(),
                        instanceId,
                        landscape.getLandscapeId(),
                        filterId),
                stage.getId(),
                group.getId(),
                instanceId,
                landscape.getLandscapeId(),
                landscapeLabel,
                filterId,
                filterLabel,
                PersonalizationPlan.OptionKind.VALUE);
    }

    private static PersonalizationPlan.Option scopeOption(
            String rootLandscapeId,
            PersonalizationStage stage,
            PersonalizationGroup group,
            String instanceId,
            SkillLandscape landscape,
            String scopeKey,
            PersonalizationScopeValue scopeValue) {
        String landscapeLabel = firstNonBlank(
                landscape.getSubject(),
                landscape.getTitle(),
                landscape.getLandscapeId());
        return new PersonalizationPlan.Option(
                stableOptionId(
                        rootLandscapeId,
                        stage.getId(),
                        group.getId(),
                        instanceId,
                        landscape.getLandscapeId(),
                        "scope",
                        scopeKey,
                        scopeValue.getValue()),
                stage.getId(),
                group.getId(),
                instanceId,
                landscape.getLandscapeId(),
                landscapeLabel,
                null,
                null,
                scopeKey,
                scopeValue.getValue(),
                scopeValue.getLabel(),
                PersonalizationPlan.OptionKind.SCOPE_VALUE);
    }

    private static PersonalizationPlan.Option completionOption(
            String rootLandscapeId,
            PersonalizationFlow flow,
            PersonalizationStage stage,
            PersonalizationGroup group,
            GroupInstance instance) {
        List<String> identity = new ArrayList<>();
        identity.add("complete-group");
        identity.add(rootLandscapeId);
        identity.add(flow.getVersion());
        identity.add(stage.getId());
        identity.add(group.getId());
        identity.add(instance.id());
        identity.add(Integer.toString(group.getMinSelections()));
        identity.add(Integer.toString(group.getMaxSelections()));
        identity.addAll(instance.options().stream()
                .map(PersonalizationPlan.Option::optionId)
                .toList());
        return new PersonalizationPlan.Option(
                stableOptionId(identity.toArray(String[]::new)),
                stage.getId(),
                group.getId(),
                instance.id(),
                null,
                null,
                null,
                null,
                PersonalizationPlan.OptionKind.COMPLETE_GROUP);
    }

    private static SelectionState evaluate(
            GroupInstance instance,
            Map<String, Map<String, Object>> config) {
        if (instance.options().isEmpty()) {
            return SelectionState.valid(List.of());
        }

        List<PersonalizationPlan.Option> selected = new ArrayList<>();
        boolean scopeOnly = instance.options().stream()
                .allMatch(option -> option.kind() == PersonalizationPlan.OptionKind.SCOPE_VALUE);
        boolean landscapeOnly = !scopeOnly
                && instance.options().stream().allMatch(option -> option.filterId() == null);
        if (scopeOnly) {
            PersonalizationPlan.Option firstOption = instance.options().getFirst();
            Map<String, Object> settings = config.get(firstOption.landscapeId());
            if (settings != null) {
                String settingsProblem = validateRelevantSettings(settings);
                if (settingsProblem != null) {
                    return SelectionState.invalid(settingsProblem);
                }
                String scopeKey = firstOption.scopeKey();
                if (settings.containsKey(scopeKey)
                        && (!(settings.get(scopeKey) instanceof String value) || value.isBlank())) {
                    return SelectionState.invalid("personalization-config-scope-invalid");
                }
                String configuredScopeValue = configuredScopeValue(settings, scopeKey);
                if (Boolean.FALSE.equals(settings.get("selected"))) {
                    if (configuredScopeValue != null) {
                        return SelectionState.invalid("personalization-disabled-scope-state");
                    }
                } else if (configuredScopeValue != null) {
                    if (!Boolean.TRUE.equals(settings.get("selected"))) {
                        return SelectionState.invalid("personalization-scope-without-selection");
                    }
                    List<PersonalizationPlan.Option> matches = instance.options().stream()
                            .filter(option -> option.scopeValue() != null
                                    && option.scopeValue().equalsIgnoreCase(configuredScopeValue))
                            .toList();
                    if (matches.size() != 1) {
                        return SelectionState.invalid("personalization-config-scope-invalid");
                    }
                    selected.add(matches.getFirst());
                }
            }
        } else if (landscapeOnly) {
            for (PersonalizationPlan.Option option : instance.options()) {
                Map<String, Object> settings = config.get(option.landscapeId());
                String settingsProblem = validateRelevantSettings(settings);
                if (settingsProblem != null) {
                    return SelectionState.invalid(settingsProblem);
                }
                if (settings != null && Boolean.TRUE.equals(settings.get("selected"))) {
                    selected.add(option);
                }
            }
        } else {
            String landscapeId = instance.options().getFirst().landscapeId();
            Map<String, Object> settings = config.get(landscapeId);
            if (settings != null) {
                String settingsProblem = validateRelevantSettings(settings);
                if (settingsProblem != null) {
                    return SelectionState.invalid(settingsProblem);
                }
                if (Boolean.FALSE.equals(settings.get("selected"))) {
                    if (configuredFilter(settings) != null) {
                        return SelectionState.invalid("personalization-disabled-filter-state");
                    }
                } else {
                    String configuredFilter = configuredFilter(settings);
                    if (configuredFilter != null) {
                        if (!Boolean.TRUE.equals(settings.get("selected"))) {
                            return SelectionState.invalid("personalization-filter-without-selection");
                        }
                        List<PersonalizationPlan.Option> matches = instance.options().stream()
                                .filter(option -> option.filterId() != null
                                        && option.filterId().equalsIgnoreCase(configuredFilter))
                                .toList();
                        if (matches.size() != 1) {
                            return SelectionState.invalid("personalization-config-filter-invalid");
                        }
                        selected.add(matches.getFirst());
                    }
                }
            }
        }

        return SelectionState.valid(selected);
    }

    private static String validateRelevantSettings(Map<String, Object> settings) {
        if (settings == null) {
            return null;
        }
        if (settings.containsKey("selected") && !(settings.get("selected") instanceof Boolean)) {
            return "personalization-config-selected-invalid";
        }
        if (settings.containsKey("filterId")
                && (!(settings.get("filterId") instanceof String value) || value.isBlank())) {
            return "personalization-config-filter-invalid";
        }
        if (settings.containsKey("durationModel")
                && (!(settings.get("durationModel") instanceof String value) || value.isBlank())) {
            return "personalization-config-duration-invalid";
        }
        return null;
    }

    private static String configuredFilter(Map<String, Object> settings) {
        Object filterId = settings.get("filterId");
        if (filterId instanceof String value && !value.isBlank()) {
            return value.trim();
        }
        return null;
    }

    private static String configuredScopeValue(
            Map<String, Object> settings,
            String scopeKey) {
        Object rawValue = settings.get(scopeKey);
        if (rawValue instanceof String value && !value.isBlank()) {
            return value.trim();
        }
        return null;
    }

    private static boolean scopeValuesValid(List<PersonalizationScopeValue> values) {
        if (values == null || values.isEmpty()) {
            return false;
        }
        Set<String> unique = new HashSet<>();
        for (PersonalizationScopeValue value : values) {
            if (value == null
                    || blank(value.getValue())
                    || blank(value.getLabel())
                    || presentButBlank(value.getLabelEn())
                    || !unique.add(value.getValue().trim().toLowerCase(java.util.Locale.ROOT))) {
                return false;
            }
        }
        return true;
    }

    private static boolean filtersResolve(
            SkillLandscape landscape,
            List<String> restrictedFilterIds) {
        if (landscape == null) {
            return false;
        }
        if (restrictedFilterIds == null) {
            return true;
        }
        if (restrictedFilterIds.isEmpty()) {
            return false;
        }
        Set<String> unique = new HashSet<>();
        for (String filterId : restrictedFilterIds) {
            String normalizedFilterId = blank(filterId)
                    ? null
                    : filterId.trim().toLowerCase(java.util.Locale.ROOT);
            if (blank(filterId)
                    || !unique.add(normalizedFilterId)
                    || canonicalFilterId(landscape, filterId) == null) {
                return false;
            }
        }
        return true;
    }

    private static boolean authoredFiltersValid(SkillLandscape landscape) {
        if (landscape == null || landscape.getFilters() == null) {
            return true;
        }
        Set<String> ids = new HashSet<>();
        for (LandscapeFilter filter : landscape.getFilters()) {
            if (filter == null
                    || blank(filter.getId())
                    || !ids.add(filter.getId().toLowerCase(java.util.Locale.ROOT))) {
                return false;
            }
        }
        return true;
    }

    private static List<String> authoredFilterIds(SkillLandscape landscape) {
        if (landscape == null || landscape.getFilters() == null) {
            return List.of();
        }
        return landscape.getFilters().stream()
                .filter(Objects::nonNull)
                .map(LandscapeFilter::getId)
                .filter(id -> !blank(id))
                .toList();
    }

    private static List<PersonalizationGroup> sortedGroups(PersonalizationStage stage) {
        if (stage == null || stage.getGroups() == null) {
            return List.of();
        }
        return stage.getGroups().stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing(PersonalizationGroup::getOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(PersonalizationGroup::getId, Comparator.nullsLast(String::compareTo)))
                .toList();
    }

    /**
     * Returns descriptive labels for the current and all later authored
     * decisions. These labels help a conversational client ask for several
     * still-missing facts together without exposing or pre-authorizing any
     * future option.
     */
    private static List<PersonalizationPlan.DecisionPrompt> pendingDecisionPrompts(
            List<PersonalizationStage> stages,
            String currentStageId,
            String currentGroupId) {
        if (stages == null || blank(currentStageId) || blank(currentGroupId)) {
            return List.of();
        }

        List<PersonalizationPlan.DecisionPrompt> prompts = new ArrayList<>();
        boolean currentReached = false;
        for (PersonalizationStage stage : stages) {
            for (PersonalizationGroup group : sortedGroups(stage)) {
                if (!currentReached
                        && currentStageId.equals(stage.getId())
                        && currentGroupId.equals(group.getId())) {
                    currentReached = true;
                }
                if (currentReached) {
                    prompts.add(new PersonalizationPlan.DecisionPrompt(
                            firstNonBlank(stage.getLabel(), stage.getId()),
                            firstNonBlank(group.getLabel(), group.getId())));
                }
            }
        }
        return List.copyOf(prompts);
    }

    private static CompletionState completionState(
            Map<String, Map<String, Object>> config,
            String rootLandscapeId) {
        Map<String, Object> rawFlowState = config.get(FLOW_STATE_CONFIG_KEY);
        if (rawFlowState == null) {
            return CompletionState.valid(Set.of(), false);
        }
        Object rawRootLandscapeId = rawFlowState.get(ROOT_LANDSCAPE_ID_KEY);
        if (rawRootLandscapeId == null) {
            /*
             * Completion IDs created before root namespacing are deliberately
             * not trusted. Requiring the learner to close the current group
             * again is safer than replaying an unscoped marker.
             */
            return CompletionState.valid(Set.of(), false);
        }
        if (!(rawRootLandscapeId instanceof String storedRootLandscapeId)
                || blank(storedRootLandscapeId)) {
            return CompletionState.invalid("personalization-completion-state-invalid");
        }
        if (!rootLandscapeId.equals(storedRootLandscapeId)) {
            return CompletionState.valid(Set.of(), false);
        }
        Object rawMigrationCompleted = rawFlowState.get(MIGRATION_COMPLETED_KEY);
        if (rawMigrationCompleted != null && !(rawMigrationCompleted instanceof Boolean)) {
            return CompletionState.invalid("personalization-completion-state-invalid");
        }
        boolean migrationCompleted = Boolean.TRUE.equals(rawMigrationCompleted);
        Object rawCompletedOptionIds = rawFlowState.get(COMPLETED_OPTION_IDS_KEY);
        if (rawCompletedOptionIds == null) {
            return CompletionState.valid(Set.of(), migrationCompleted);
        }
        if (!(rawCompletedOptionIds instanceof List<?> values)) {
            return CompletionState.invalid("personalization-completion-state-invalid");
        }

        LinkedHashSet<String> optionIds = new LinkedHashSet<>();
        for (Object value : values) {
            if (!(value instanceof String optionId)
                    || optionId.isBlank()
                    || !optionIds.add(optionId)) {
                return CompletionState.invalid("personalization-completion-state-invalid");
            }
        }
        return CompletionState.valid(optionIds, migrationCompleted);
    }

    private static SkillLandscape resolveExact(
            Function<String, SkillLandscape> resolver,
            String requestedLandscapeId) {
        if (resolver == null || blank(requestedLandscapeId)) {
            return null;
        }
        SkillLandscape resolved = resolver.apply(requestedLandscapeId);
        return resolved != null && requestedLandscapeId.equals(resolved.getLandscapeId())
                ? resolved
                : null;
    }

    private static Map<String, Object> mutableStringObjectMap(
            Object rawValue,
            String problem) {
        if (rawValue == null) {
            return new LinkedHashMap<>();
        }
        if (!(rawValue instanceof Map<?, ?> rawMap)) {
            throw new IllegalArgumentException(problem);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
            if (!(entry.getKey() instanceof String key)) {
                throw new IllegalArgumentException(problem);
            }
            result.put(key, entry.getValue());
        }
        return result;
    }

    private static LinkedHashSet<String> mutableCompletedOptionIds(
            Object rawValue,
            String problem) {
        LinkedHashSet<String> optionIds = new LinkedHashSet<>();
        if (rawValue == null) {
            return optionIds;
        }
        if (!(rawValue instanceof List<?> values)) {
            throw new IllegalArgumentException(problem);
        }
        for (Object value : values) {
            if (!(value instanceof String optionId)
                    || optionId.isBlank()
                    || !optionIds.add(optionId)) {
                throw new IllegalArgumentException(problem);
            }
        }
        return optionIds;
    }

    private static String stableOptionId(String... fields) {
        StringBuilder canonical = new StringBuilder();
        for (String field : fields) {
            String value = field == null ? "" : field;
            canonical.append(value.length()).append(':').append(value).append('|');
        }
        UUID uuid = UUID.nameUUIDFromBytes(canonical.toString().getBytes(StandardCharsets.UTF_8));
        return "po_" + uuid;
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private static boolean presentButBlank(String value) {
        return value != null && value.isBlank();
    }

    private static boolean nonEmpty(List<?> values) {
        return values != null && !values.isEmpty();
    }

    private static boolean blankList(List<String> values) {
        return values == null || values.isEmpty();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (!blank(value)) {
                return value;
            }
        }
        return "";
    }

    private record GroupInstance(
            String id,
            List<PersonalizationPlan.Option> options,
            List<PersonalizationPlan.Option> displayOptions) {

        private GroupInstance(String id, List<PersonalizationPlan.Option> options) {
            this(id, options, options);
        }

        private GroupInstance {
            options = options == null ? List.of() : List.copyOf(options);
            displayOptions = displayOptions == null ? options : List.copyOf(displayOptions);
        }
    }

    record StoredSelection(
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            String landscapeId,
            PersonalizationPlan.OptionKind kind,
            String filterId,
            String scopeKey,
            String scopeValue,
            String scopeLabel,
            boolean activeAndAuthored) {
    }

    private record SelectionState(
            boolean valid,
            String problemCode,
            List<PersonalizationPlan.Option> selected) {

        static SelectionState valid(List<PersonalizationPlan.Option> selected) {
            return new SelectionState(true, null, List.copyOf(selected));
        }

        static SelectionState invalid(String problemCode) {
            return new SelectionState(false, problemCode, List.of());
        }

        int selectedCount() {
            return selected.size();
        }

        List<String> selectedLandscapeIds() {
            return selected.stream()
                    .map(PersonalizationPlan.Option::landscapeId)
                    .distinct()
                    .toList();
        }
    }

    private record CompletionState(
            boolean valid,
            String problemCode,
            Set<String> optionIds,
            boolean migrationCompleted) {

        static CompletionState valid(Set<String> optionIds, boolean migrationCompleted) {
            return new CompletionState(true, null, Set.copyOf(optionIds), migrationCompleted);
        }

        static CompletionState invalid(String problemCode) {
            return new CompletionState(false, problemCode, Set.of(), false);
        }
    }

    private record ValidationResult(
            boolean valid,
            String problemCode,
            List<PersonalizationStage> stages) {

        static ValidationResult valid(List<PersonalizationStage> stages) {
            return new ValidationResult(true, null, List.copyOf(stages));
        }

        static ValidationResult invalid(String problemCode) {
            return new ValidationResult(false, problemCode, List.of());
        }
    }
}
