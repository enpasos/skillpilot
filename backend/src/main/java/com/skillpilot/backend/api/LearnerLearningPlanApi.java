package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Provider-neutral first-party WebGUI contract for learner-owned time plans. */
public final class LearnerLearningPlanApi {

    public static final String PREREQUISITE_SCHEDULE_CONFLICT_ERROR_CODE =
            "LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT";

    private LearnerLearningPlanApi() {
    }

    /** Safe first-party error envelope; details remain server-side. */
    public record ErrorResponse(String errorCode) {
    }

    /**
     * goalIds record the selected topic roots of a learning section or milestone.
     * An explicitly present list (including an empty list) replaces legacy goalId.
     * Missing active retains the historical active behavior.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Block(
            String id,
            String kind,
            String goalId,
            String title,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate startDate,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate endDate,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate date,
            List<String> atomicGoalIds,
            List<String> goalIds,
            @JsonProperty("active") Boolean active) {
        public Block(String id, String kind, String goalId, String title,
                LocalDate startDate, LocalDate endDate, LocalDate date, List<String> atomicGoalIds,
                List<String> goalIds) {
            this(id, kind, goalId, title, startDate, endDate, date, atomicGoalIds, goalIds, null);
        }

        public Block(String id, String kind, String goalId, String title,
                LocalDate startDate, LocalDate endDate, LocalDate date, List<String> atomicGoalIds) {
            this(id, kind, goalId, title, startDate, endDate, date, atomicGoalIds, null, null);
        }

        @JsonIgnore
        public boolean isActive() {
            return !Boolean.FALSE.equals(active);
        }

        public List<String> focusGoalIds() {
            return goalIds != null ? goalIds
                    : goalId == null || goalId.isBlank() ? List.of() : List.of(goalId);
        }
    }

    public record UpsertRequest(
            Long expectedRevision,
            String planLabel,
            List<Block> blocks) {
    }

    /** One subject plan in an atomic multi-subject activation request. */
    public record ActivationPlan(
            String landscapeId,
            Long expectedRevision,
            String planLabel,
            List<Block> blocks) {
    }

    public record ActivateRequest(
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf,
            List<ActivationPlan> plans) {
    }

    public record Period(
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate startDate,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate endDate) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CurrentBlock(
            String blockId,
            String kind,
            String title,
            String goalId,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate startDate,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate endDate) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Milestone(
            String blockId,
            String title,
            String goalId,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate date,
            List<String> goalIds) {
        public Milestone(String blockId, String title, String goalId, LocalDate date) {
            this(blockId, title, goalId, date, null);
        }
    }

    /** Read-only draft projection using the same status calculation as the live plan. */
    public record PreviewDay(
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate date,
            LearnerPlanTodayStatus status) {
    }

    public record PreviewResponse(
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf,
            List<PreviewDay> days) {
    }

    /** Read-only preview of the next prerequisite-satisfied atomic plan goal. */
    public record NextEligibleGoal(String goalId) {
    }

    public record Buffer(int totalWorkdays, int remainingWorkdays) {
    }

    public record PlanSummary(
            UUID planId,
            long revision,
            String landscapeId,
            String planLabel,
            boolean stale,
            Period period,
            CurrentBlock currentBlock,
            Milestone nextMilestone,
            Buffer buffer,
            NextEligibleGoal nextEligibleGoal,
            String continueReason,
            boolean canContinue,
            @JsonInclude(JsonInclude.Include.NON_NULL) LearnerPlanTodayStatus.LearningScope learningScope) {
        public PlanSummary(UUID planId, long revision, String landscapeId, String planLabel,
                boolean stale, Period period, CurrentBlock currentBlock, Milestone nextMilestone,
                Buffer buffer, NextEligibleGoal nextEligibleGoal, String continueReason, boolean canContinue) {
            this(planId, revision, landscapeId, planLabel, stale, period, currentBlock, nextMilestone,
                    buffer, nextEligibleGoal, continueReason, canContinue, null);
        }
    }

    public record PlanDetail(
            UUID planId,
            long revision,
            String landscapeId,
            String planLabel,
            boolean stale,
            Period period,
            CurrentBlock currentBlock,
            Milestone nextMilestone,
            Buffer buffer,
            NextEligibleGoal nextEligibleGoal,
            String continueReason,
            boolean canContinue,
            List<Block> blocks,
            @JsonInclude(JsonInclude.Include.NON_NULL) LearnerPlanTodayStatus.LearningScope learningScope) {
        public PlanDetail(UUID planId, long revision, String landscapeId, String planLabel,
                boolean stale, Period period, CurrentBlock currentBlock, Milestone nextMilestone,
                Buffer buffer, NextEligibleGoal nextEligibleGoal, String continueReason, boolean canContinue,
                List<Block> blocks) {
            this(planId, revision, landscapeId, planLabel, stale, period, currentBlock, nextMilestone,
                    buffer, nextEligibleGoal, continueReason, canContinue, blocks, null);
        }
    }

    public record CollectionResponse(
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf,
            boolean followLearningPlans,
            List<PlanSummary> plans,
            LearnerPlanTodayStatus status) {
    }

    public record ContinueRequest(
            Long expectedRevision,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf) {
    }

    public record ContinueResponse(
            UUID planId,
            long revision,
            String landscapeId,
            String focusGoalId,
            String activeGoalId,
            UnifiedLearnerStateResponse state) {
    }

    public record ReconcileRequest(
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf) {
    }

    /** Authoritative result of an automatic or explicitly requested plan transition. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TransitionResponse(
            UUID planId,
            Long revision,
            String landscapeId,
            String focusGoalId,
            String activeGoalId,
            boolean changed,
            UnifiedLearnerStateResponse state) {
    }

    /** Atomic publication result for one or more independently stored subject plans. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ActivateResponse(
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf,
            boolean followLearningPlans,
            List<PlanDetail> plans,
            UUID selectedPlanId,
            String selectedLandscapeId,
            String focusGoalId,
            String activeGoalId,
            UnifiedLearnerStateResponse state) {
    }

    /** Portable signed payload; ownership and database identity are intentionally absent. */
    public record PortablePlan(String landscapeId, String planLabel, List<Block> blocks) {
    }
}
