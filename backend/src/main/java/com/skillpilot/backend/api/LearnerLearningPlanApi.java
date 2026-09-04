package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Block(
            String id,
            String kind,
            String goalId,
            String title,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate startDate,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate endDate,
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate date,
            List<String> atomicGoalIds) {
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
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate date) {
    }

    public record Metrics(
            int dueThroughToday,
            int completedDueThroughToday,
            int openDueThroughToday,
            int dueToday,
            int completedDueToday,
            int openDueToday,
            int totalPlanned) {
    }

    /** Read-only preview of the next prerequisite-satisfied atomic plan goal. */
    public record NextEligibleGoal(String goalId) {
    }

    public record Buffer(int totalWorkdays, int remainingWorkdays) {
    }

    public record Pace(String status, String reason) {
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
            Metrics metrics,
            Buffer buffer,
            Pace pace,
            NextEligibleGoal nextEligibleGoal,
            String continueReason,
            boolean canContinue) {
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
            Metrics metrics,
            Buffer buffer,
            Pace pace,
            NextEligibleGoal nextEligibleGoal,
            String continueReason,
            boolean canContinue,
            List<Block> blocks) {
    }

    public record CollectionResponse(
            @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf,
            boolean followLearningPlans,
            List<PlanSummary> plans) {
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
