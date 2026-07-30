package com.skillpilot.backend.api;

import java.util.List;

/**
 * Provider-neutral plan for the next authored curriculum-personalization
 * decision.
 *
 * <p>The plan contains opaque option IDs. Provider adapters must submit only
 * IDs from {@link #options()} unchanged and must not reconstruct selections
 * from labels, {@link #displayOptions()}, curriculum graph edges, subjects,
 * regions, or course names.</p>
 */
public record PersonalizationPlan(
        Stage stage,
        String stageId,
        String stageLabel,
        String groupId,
        String groupLabel,
        String groupInstanceId,
        int minSelections,
        int maxSelections,
        int selectedCount,
        List<Option> options,
        List<Option> displayOptions,
        List<Option> navigationOptions,
        List<Option> currentSelectedOptions,
        String currentRewindId,
        List<CompletedDecision> completedDecisions,
        List<DecisionSummary> preservedDecisions,
        List<DecisionPrompt> pendingDecisions,
        boolean canReopenMigratedPersonalization,
        String problemCode) {

    public PersonalizationPlan {
        stage = stage == null ? Stage.INVALID : stage;
        options = options == null ? List.of() : List.copyOf(options);
        displayOptions = displayOptions == null ? List.of() : List.copyOf(displayOptions);
        navigationOptions = navigationOptions == null ? List.of() : List.copyOf(navigationOptions);
        currentSelectedOptions =
                currentSelectedOptions == null ? List.of() : List.copyOf(currentSelectedOptions);
        completedDecisions =
                completedDecisions == null ? List.of() : List.copyOf(completedDecisions);
        preservedDecisions =
                preservedDecisions == null ? List.of() : List.copyOf(preservedDecisions);
        pendingDecisions = pendingDecisions == null ? List.of() : List.copyOf(pendingDecisions);
    }

    /**
     * Compatibility constructor for older provider-neutral projections.
     */
    public PersonalizationPlan(Stage stage, List<Option> options, List<Option> navigationOptions) {
        this(
                stage,
                null,
                null,
                null,
                null,
                null,
                0,
                0,
                0,
                options,
                displayValueOptions(options),
                navigationOptions,
                List.of(),
                null,
                List.of(),
                List.of(),
                List.of(),
                false,
                null);
    }

    /**
     * Compatibility constructor for the plan shape before display-only
     * candidates were exposed separately.
     */
    public PersonalizationPlan(
            Stage stage,
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            int minSelections,
            int maxSelections,
            int selectedCount,
            List<Option> options,
            List<Option> navigationOptions,
            List<Option> currentSelectedOptions,
            String currentRewindId,
            List<CompletedDecision> completedDecisions,
            List<DecisionSummary> preservedDecisions,
            List<DecisionPrompt> pendingDecisions,
            boolean canReopenMigratedPersonalization,
            String problemCode) {
        this(
                stage,
                stageId,
                stageLabel,
                groupId,
                groupLabel,
                groupInstanceId,
                minSelections,
                maxSelections,
                selectedCount,
                options,
                displayValueOptions(options),
                navigationOptions,
                currentSelectedOptions,
                currentRewindId,
                completedDecisions,
                preservedDecisions,
                pendingDecisions,
                canReopenMigratedPersonalization,
                problemCode);
    }

    public boolean required() {
        return stage == Stage.SELECTION
                || stage == Stage.ROOT_FILTER
                || stage == Stage.DESCENDANT_FILTER;
    }

    public boolean valid() {
        return stage != Stage.INVALID;
    }

    public PersonalizationPlan withPreservedDecisions(
            List<DecisionSummary> decisions) {
        return new PersonalizationPlan(
                stage,
                stageId,
                stageLabel,
                groupId,
                groupLabel,
                groupInstanceId,
                minSelections,
                maxSelections,
                selectedCount,
                options,
                displayOptions,
                navigationOptions,
                currentSelectedOptions,
                currentRewindId,
                completedDecisions,
                decisions,
                pendingDecisions,
                canReopenMigratedPersonalization,
                problemCode);
    }

    public enum Stage {
        SELECTION,
        COMPLETE,
        INVALID,

        /**
         * Retained for source compatibility only. New plans use SELECTION with
         * explicit stage/group metadata.
         */
        @Deprecated
        ROOT_FILTER,
        @Deprecated
        DESCENDANT_FILTER
    }

    /**
     * One currently valid authored action. {@code optionId} is opaque and
     * deterministic for the referenced authored option. A
     * {@link OptionKind#COMPLETE_GROUP} option is a protocol action: it records
     * that the current group instance is complete without selecting a
     * landscape or filter.
     */
    public record Option(
            String optionId,
            String stageId,
            String groupId,
            String groupInstanceId,
            String landscapeId,
            String landscapeLabel,
            String filterId,
            String filterLabel,
            String scopeKey,
            String scopeValue,
            String scopeLabel,
            OptionKind kind) {

        public Option {
            kind = kind == null ? OptionKind.VALUE : kind;
        }

        /**
         * Compatibility constructor for the original authored option shape.
         */
        public Option(
                String optionId,
                String stageId,
                String groupId,
                String groupInstanceId,
                String landscapeId,
                String landscapeLabel,
                String filterId,
                String filterLabel,
                OptionKind kind) {
            this(
                    optionId,
                    stageId,
                    groupId,
                    groupInstanceId,
                    landscapeId,
                    landscapeLabel,
                    filterId,
                    filterLabel,
                    null,
                    null,
                    null,
                    kind);
        }

        /**
         * Compatibility constructor for authored value options.
         */
        public Option(
                String optionId,
                String stageId,
                String groupId,
                String groupInstanceId,
                String landscapeId,
                String landscapeLabel,
                String filterId,
                String filterLabel) {
            this(
                    optionId,
                    stageId,
                    groupId,
                    groupInstanceId,
                    landscapeId,
                    landscapeLabel,
                    filterId,
                    filterLabel,
                    null,
                    null,
                    null,
                    OptionKind.VALUE);
        }

        /**
         * Compatibility constructor used by legacy tests and projections.
         */
        public Option(
                String landscapeId,
                String landscapeLabel,
                String filterId,
                String filterLabel) {
            this(
                    null,
                    null,
                    null,
                    null,
                    landscapeId,
                    landscapeLabel,
                    filterId,
                    filterLabel,
                    null,
                    null,
                    null,
                    OptionKind.VALUE);
        }
    }

    public enum OptionKind {
        /**
         * Selects one authored landscape or filter value.
         */
        VALUE,

        /**
         * Selects one independently authored scope value, for example G8/G9.
         */
        SCOPE_VALUE,

        /**
         * Explicitly closes the current group instance once its minimum
         * cardinality has been met.
         */
        COMPLETE_GROUP
    }

    /**
     * Human-facing orientation for one still-open authored decision.
     *
     * <p>This is deliberately descriptive only. It exposes neither future
     * option IDs nor a mutation shortcut; provider adapters must still apply
     * only the currently valid {@link #options()} and reload the plan after
     * every successful mutation.</p>
     */
    public record DecisionPrompt(
            String stageLabel,
            String groupLabel) {
    }

    /**
     * One completed authored decision in traversal order.
     *
     * <p>{@code rewindId} is an opaque, root- and flow-bound reference. Clients
     * may submit it unchanged to reopen this decision, but must not derive it
     * from labels or option values. Only {@code selectedOptions} are exposed
     * here; {@link #navigationOptions()} deliberately retains its established
     * meaning as all candidates seen during traversal.</p>
     */
    public record CompletedDecision(
            String rewindId,
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            List<Option> selectedOptions) {

        public CompletedDecision {
            selectedOptions =
                    selectedOptions == null ? List.of() : List.copyOf(selectedOptions);
        }
    }

    /**
     * A persisted, independent decision that lies after the currently open
     * step. It is orientation only and therefore intentionally has no rewind
     * reference until traversal reaches it again.
     */
    public record DecisionSummary(
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            List<Option> selectedOptions) {

        public DecisionSummary {
            selectedOptions =
                    selectedOptions == null ? List.of() : List.copyOf(selectedOptions);
        }
    }

    /**
     * Returns only human-facing value candidates. Protocol actions such as
     * {@link OptionKind#COMPLETE_GROUP} must never be duplicated as display
     * choices.
     */
    private static List<Option> displayValueOptions(List<Option> options) {
        if (options == null) {
            return List.of();
        }
        return options.stream()
                .filter(option -> option != null
                        && option.kind() != OptionKind.COMPLETE_GROUP)
                .toList();
    }

    public static PersonalizationPlan selection(
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            int minSelections,
            int maxSelections,
            int selectedCount,
            List<Option> options,
            List<Option> navigationOptions) {
        return selection(
                stageId,
                stageLabel,
                groupId,
                groupLabel,
                groupInstanceId,
                minSelections,
                maxSelections,
                selectedCount,
                options,
                displayValueOptions(options),
                navigationOptions,
                List.of(),
                null,
                List.of(),
                List.of(),
                List.of(new DecisionPrompt(stageLabel, groupLabel)));
    }

    public static PersonalizationPlan selection(
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            int minSelections,
            int maxSelections,
            int selectedCount,
            List<Option> options,
            List<Option> navigationOptions,
            List<DecisionPrompt> pendingDecisions) {
        return selection(
                stageId,
                stageLabel,
                groupId,
                groupLabel,
                groupInstanceId,
                minSelections,
                maxSelections,
                selectedCount,
                options,
                displayValueOptions(options),
                navigationOptions,
                List.of(),
                null,
                List.of(),
                List.of(),
                pendingDecisions);
    }

    public static PersonalizationPlan selection(
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            int minSelections,
            int maxSelections,
            int selectedCount,
            List<Option> options,
            List<Option> displayOptions,
            List<Option> navigationOptions,
            List<Option> currentSelectedOptions,
            String currentRewindId,
            List<CompletedDecision> completedDecisions,
            List<DecisionPrompt> pendingDecisions) {
        return selection(
                stageId,
                stageLabel,
                groupId,
                groupLabel,
                groupInstanceId,
                minSelections,
                maxSelections,
                selectedCount,
                options,
                displayOptions,
                navigationOptions,
                currentSelectedOptions,
                currentRewindId,
                completedDecisions,
                List.of(),
                pendingDecisions);
    }

    public static PersonalizationPlan selection(
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            int minSelections,
            int maxSelections,
            int selectedCount,
            List<Option> options,
            List<Option> navigationOptions,
            List<Option> currentSelectedOptions,
            String currentRewindId,
            List<CompletedDecision> completedDecisions,
            List<DecisionPrompt> pendingDecisions) {
        return selection(
                stageId,
                stageLabel,
                groupId,
                groupLabel,
                groupInstanceId,
                minSelections,
                maxSelections,
                selectedCount,
                options,
                displayValueOptions(options),
                navigationOptions,
                currentSelectedOptions,
                currentRewindId,
                completedDecisions,
                List.of(),
                pendingDecisions);
    }

    public static PersonalizationPlan selection(
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            int minSelections,
            int maxSelections,
            int selectedCount,
            List<Option> options,
            List<Option> navigationOptions,
            List<Option> currentSelectedOptions,
            String currentRewindId,
            List<CompletedDecision> completedDecisions,
            List<DecisionSummary> preservedDecisions,
            List<DecisionPrompt> pendingDecisions) {
        return selection(
                stageId,
                stageLabel,
                groupId,
                groupLabel,
                groupInstanceId,
                minSelections,
                maxSelections,
                selectedCount,
                options,
                displayValueOptions(options),
                navigationOptions,
                currentSelectedOptions,
                currentRewindId,
                completedDecisions,
                preservedDecisions,
                pendingDecisions);
    }

    /**
     * Builds a selection plan whose visible candidates may be broader than
     * its currently valid mutation actions.
     *
     * <p>{@code displayOptions} is orientation only. Clients may submit only
     * opaque IDs present in {@code options}; this lets an authored flow show
     * unavailable choices without weakening its reviewed offering boundary.</p>
     */
    public static PersonalizationPlan selection(
            String stageId,
            String stageLabel,
            String groupId,
            String groupLabel,
            String groupInstanceId,
            int minSelections,
            int maxSelections,
            int selectedCount,
            List<Option> options,
            List<Option> displayOptions,
            List<Option> navigationOptions,
            List<Option> currentSelectedOptions,
            String currentRewindId,
            List<CompletedDecision> completedDecisions,
            List<DecisionSummary> preservedDecisions,
            List<DecisionPrompt> pendingDecisions) {
        return new PersonalizationPlan(
                Stage.SELECTION,
                stageId,
                stageLabel,
                groupId,
                groupLabel,
                groupInstanceId,
                minSelections,
                maxSelections,
                selectedCount,
                options,
                displayOptions,
                navigationOptions,
                currentSelectedOptions,
                currentRewindId,
                completedDecisions,
                preservedDecisions,
                pendingDecisions,
                false,
                null);
    }

    public static PersonalizationPlan complete(List<Option> navigationOptions) {
        return complete(navigationOptions, List.of());
    }

    public static PersonalizationPlan complete(
            List<Option> navigationOptions,
            List<CompletedDecision> completedDecisions) {
        return new PersonalizationPlan(
                Stage.COMPLETE,
                null,
                null,
                null,
                null,
                null,
                0,
                0,
                0,
                List.of(),
                List.of(),
                navigationOptions,
                List.of(),
                null,
                completedDecisions,
                List.of(),
                List.of(),
                false,
                null);
    }

    public static PersonalizationPlan migratedComplete(
            List<Option> navigationOptions) {
        return new PersonalizationPlan(
                Stage.COMPLETE,
                null,
                null,
                null,
                null,
                null,
                0,
                0,
                0,
                List.of(),
                List.of(),
                navigationOptions,
                List.of(),
                null,
                List.of(),
                List.of(),
                List.of(),
                true,
                null);
    }

    public static PersonalizationPlan invalid(String problemCode) {
        return new PersonalizationPlan(
                Stage.INVALID,
                null,
                null,
                null,
                null,
                null,
                0,
                0,
                0,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                null,
                List.of(),
                List.of(),
                List.of(),
                false,
                problemCode == null || problemCode.isBlank()
                        ? "invalid-personalization-flow"
                        : problemCode);
    }
}
