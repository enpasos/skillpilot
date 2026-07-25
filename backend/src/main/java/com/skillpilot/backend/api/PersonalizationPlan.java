package com.skillpilot.backend.api;

import java.util.List;

/**
 * Provider-neutral plan for the next authored curriculum-personalization
 * decision.
 *
 * <p>The plan contains opaque option IDs. Provider adapters must submit those
 * IDs unchanged and must not reconstruct selections from labels, curriculum
 * graph edges, subjects, regions, or course names.</p>
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
        List<Option> navigationOptions,
        String problemCode) {

    public PersonalizationPlan {
        stage = stage == null ? Stage.INVALID : stage;
        options = options == null ? List.of() : List.copyOf(options);
        navigationOptions = navigationOptions == null ? List.of() : List.copyOf(navigationOptions);
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
                navigationOptions,
                null);
    }

    public boolean required() {
        return stage == Stage.SELECTION
                || stage == Stage.ROOT_FILTER
                || stage == Stage.DESCENDANT_FILTER;
    }

    public boolean valid() {
        return stage != Stage.INVALID;
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
            OptionKind kind) {

        public Option {
            kind = kind == null ? OptionKind.VALUE : kind;
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
                    OptionKind.VALUE);
        }
    }

    public enum OptionKind {
        /**
         * Selects one authored landscape or filter value.
         */
        VALUE,

        /**
         * Explicitly closes the current group instance once its minimum
         * cardinality has been met.
         */
        COMPLETE_GROUP
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
                navigationOptions,
                null);
    }

    public static PersonalizationPlan complete(List<Option> navigationOptions) {
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
                navigationOptions,
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
                problemCode == null || problemCode.isBlank()
                        ? "invalid-personalization-flow"
                        : problemCode);
    }
}
