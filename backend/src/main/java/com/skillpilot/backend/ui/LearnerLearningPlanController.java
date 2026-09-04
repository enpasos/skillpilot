package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.service.LearningPlanPrerequisiteScheduleConflictException;
import com.skillpilot.backend.service.LearnerLearningPlanService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** First-party-only HTTP surface for plans owned by the SkillPilot-ID holder. */
@RestController
@RequestMapping(
        value = "/api/ui/learners/{skillpilotId}/learning-plans",
        produces = MediaType.APPLICATION_JSON_VALUE)
public class LearnerLearningPlanController {

    private final LearnerLearningPlanService learningPlans;
    private final LearnerService learners;
    private final LearnerLifecycleService lifecycle;

    public LearnerLearningPlanController(
            LearnerLearningPlanService learningPlans,
            LearnerService learners,
            LearnerLifecycleService lifecycle) {
        this.learningPlans = learningPlans;
        this.learners = learners;
        this.lifecycle = lifecycle;
    }

    @ExceptionHandler(LearningPlanPrerequisiteScheduleConflictException.class)
    public ResponseEntity<LearnerLearningPlanApi.ErrorResponse> handlePrerequisiteScheduleConflict() {
        return ResponseEntity.badRequest()
                .cacheControl(CacheControl.noStore())
                .body(new LearnerLearningPlanApi.ErrorResponse(
                        LearnerLearningPlanApi.PREREQUISITE_SCHEDULE_CONFLICT_ERROR_CODE));
    }

    @GetMapping
    public ResponseEntity<LearnerLearningPlanApi.CollectionResponse> getPlans(
            @PathVariable String skillpilotId,
            @RequestParam(required = false) LocalDate asOf,
            HttpServletResponse response) {
        noStore(response);
        learners.assertActiveLearnerRouteAccess(skillpilotId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(learningPlans.getPlans(skillpilotId, asOf));
    }

    @GetMapping("/by-landscape")
    public ResponseEntity<LearnerLearningPlanApi.PlanDetail> getPlan(
            @PathVariable String skillpilotId,
            @RequestParam String landscapeId,
            @RequestParam(required = false) LocalDate asOf,
            HttpServletResponse response) {
        noStore(response);
        learners.assertActiveLearnerRouteAccess(skillpilotId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(learningPlans.getPlan(skillpilotId, landscapeId, asOf));
    }

    @PutMapping(value = "/by-landscape", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LearnerLearningPlanApi.PlanDetail> putPlan(
            @PathVariable String skillpilotId,
            @RequestParam String landscapeId,
            @RequestParam(required = false) LocalDate asOf,
            @RequestBody LearnerLearningPlanApi.UpsertRequest request,
            HttpServletResponse response) {
        noStore(response);
        LearnerLearningPlanApi.PlanDetail detail = lifecycle.withActivity(skillpilotId, () -> {
            learners.assertWritableLearningSession(skillpilotId);
            return learningPlans.upsert(skillpilotId, landscapeId, request, asOf);
        });
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(detail);
    }

    /** POST carries unsaved drafts, but does not count as learner activity or mutate state. */
    @PostMapping(value = "/preview", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LearnerLearningPlanApi.PreviewResponse> previewPlans(
            @PathVariable String skillpilotId,
            @RequestBody LearnerLearningPlanApi.ActivateRequest request,
            HttpServletResponse response) {
        noStore(response);
        learners.assertActiveLearnerRouteAccess(skillpilotId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(learningPlans.previewPlans(skillpilotId, request));
    }

    @PostMapping(value = "/activate", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LearnerLearningPlanApi.ActivateResponse> activatePlans(
            @PathVariable String skillpilotId,
            @RequestBody LearnerLearningPlanApi.ActivateRequest request,
            HttpServletResponse response) {
        noStore(response);
        LearnerLearningPlanApi.ActivateResponse result = lifecycle.withActivity(skillpilotId, () -> {
            learners.assertWritableLearningSession(skillpilotId);
            return learningPlans.activatePlans(skillpilotId, request);
        });
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }

    @PostMapping(value = "/reconcile", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LearnerLearningPlanApi.TransitionResponse> reconcile(
            @PathVariable String skillpilotId,
            @RequestBody LearnerLearningPlanApi.ReconcileRequest request,
            HttpServletResponse response) {
        noStore(response);
        LearnerLearningPlanApi.TransitionResponse result = lifecycle.withActivity(skillpilotId, () -> {
            learners.assertWritableLearningSession(skillpilotId);
            return learningPlans.reconcile(skillpilotId, request);
        });
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }

    @PostMapping(value = "/{planId}/continue", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LearnerLearningPlanApi.ContinueResponse> continuePlan(
            @PathVariable String skillpilotId,
            @PathVariable UUID planId,
            @RequestBody LearnerLearningPlanApi.ContinueRequest request,
            HttpServletResponse response) {
        noStore(response);
        LearnerLearningPlanApi.ContinueResponse result = lifecycle.withActivity(skillpilotId, () -> {
            learners.assertWritableLearningSession(skillpilotId);
            return learningPlans.continuePlan(skillpilotId, planId, request);
        });
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }

    @PostMapping(value = "/{planId}/switch", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LearnerLearningPlanApi.TransitionResponse> switchPlan(
            @PathVariable String skillpilotId,
            @PathVariable UUID planId,
            @RequestBody LearnerLearningPlanApi.ContinueRequest request,
            HttpServletResponse response) {
        noStore(response);
        LearnerLearningPlanApi.TransitionResponse result = lifecycle.withActivity(skillpilotId, () -> {
            learners.assertWritableLearningSession(skillpilotId);
            return learningPlans.switchPlan(skillpilotId, planId, request);
        });
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
    }

    private static void noStore(HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
    }
}
