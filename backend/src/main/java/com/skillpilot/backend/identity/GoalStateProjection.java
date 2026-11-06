package com.skillpilot.backend.identity;

import static com.skillpilot.backend.identity.GoalIdentityService.require;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerDataDTO;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.MasteryEntryDTO;
import com.skillpilot.backend.api.SignedLearnerDataDTO;
import com.skillpilot.backend.completion.CompletionWorkflowState;
import com.skillpilot.backend.domain.LearnerGoalCompletion.PracticeEvidence;
import com.skillpilot.backend.service.srs.SrsPracticeStateGuard;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Pure internal identity projections, not a runtime capability or restore authorization.
 * No DI, entity mutation, repository access, Source-A factory or B activation.
 */
final class GoalStateProjection {
    record Pair<T>(T canonical, T durable, GoalIdentityService.SnapshotIdentity snapshot) { }
    record SrsState(byte[] json, Instant updatedAt) {
        SrsState { require(json != null, "Missing SRS payload"); json = json.clone(); }
        @Override public byte[] json() { return json.clone(); }
    }
    record Focus(String goalId, Instant createdAt) { }
    record Navigation(String activeGoalId, String learningState, long revision, CompletionWorkflowState workflow) { }
    record PlanCapture(String planId, String landscapeId, long revision, String scopeFingerprint,
            Instant capturedAt, Instant updatedAt, byte[] blocksJson) {
        PlanCapture { require(blocksJson != null, "Missing original plan capture"); blocksJson = blocksJson.clone(); }
        @Override public byte[] blocksJson() { return blocksJson.clone(); }
    }
    record ProjectedPlan(PlanCapture original, Pair<List<LearnerLearningPlanApi.Block>> blocks) { }
    record Completion(String eventId, String goalId, LocalDate date, Instant occurredAt,
            double value, boolean observedTransition, List<PracticeEvidence> practice) {
        Completion { require(practice != null, "Missing practice evidence list"); practice = List.copyOf(practice); }
    }
    record ProjectedHistory(List<Completion> original, Pair<List<Completion>> events) {
        ProjectedHistory { original = List.copyOf(original); }
    }
    /** All identity groups are prepared before return; domain/scope guards still must precede any future mutation. */
    record IdentityImportProjection(byte[] originalDtoJson, String originalSignature,
            Pair<Map<String, MasteryEntryDTO>> mastery, Pair<Map<String, SrsState>> srs,
            Pair<List<String>> focus, Pair<List<LearnerLearningPlanApi.PortablePlan>> plans,
            boolean masteryPresent, boolean srsPresent, boolean focusPresent, boolean plansPresent) {
        IdentityImportProjection { originalDtoJson = originalDtoJson.clone(); }
        @Override public byte[] originalDtoJson() { return originalDtoJson.clone(); }
    }

    private final GoalIdentityMap identities;
    private final GoalIdentityService.SnapshotIdentity snapshot;
    private final ObjectMapper mapper;

    GoalStateProjection(GoalIdentityMap identities, GoalIdentityService.SnapshotIdentity snapshot, ObjectMapper mapper) {
        require(identities != null && snapshot != null && mapper != null, "Missing state projection inputs");
        this.identities = identities; this.snapshot = snapshot; this.mapper = mapper.copy();
    }

    void requireSnapshot(GoalIdentityService.SnapshotIdentity active) {
        require(snapshot.equals(active), "State projection belongs to a stale or foreign snapshot");
    }

    Pair<Map<String, MasteryEntryDTO>> mastery(Map<String, MasteryEntryDTO> original) {
        return keyed(original, entry -> {
            require(entry != null && Double.isFinite(entry.value()), "Invalid original mastery value");
            return number(entry.value()) + ":" + entry.updatedAt();
        });
    }

    Pair<Map<String, SrsState>> srs(Map<String, SrsState> original) {
        return keyed(original, state -> {
            require(state != null, "Missing SRS state");
            var json = CanonicalIdentityJson.parse(state.json());
            require(json.isObject(), "SRS state must be an object");
            return CanonicalIdentityJson.digest(json) + ":" + state.updatedAt();
        });
    }

    Pair<List<Focus>> focus(List<Focus> original) {
        require(original != null, "Missing focus state");
        Map<String, Focus> canonical = new LinkedHashMap<>(), durable = new LinkedHashMap<>();
        for (Focus row : original) {
            require(row != null, "Invalid focus row");
            String current = identities.canonicalGoalId(row.goalId()), stored = identities.storageGoalId(row.goalId());
            put(canonical, current, new Focus(current, row.createdAt()), Objects::equals);
            put(durable, stored, new Focus(stored, row.createdAt()), Objects::equals);
        }
        return new Pair<>(List.copyOf(canonical.values()), List.copyOf(durable.values()), snapshot);
    }

    Pair<Navigation> navigation(Navigation original) {
        require(original != null, "Missing navigation state");
        return new Pair<>(navigation(original, identities::canonicalGoalId), navigation(original, identities::storageGoalId), snapshot);
    }

    ProjectedPlan plan(PlanCapture original) {
        require(original != null, "Missing plan capture");
        try {
            List<LearnerLearningPlanApi.Block> blocks = mapper.readValue(original.blocksJson(), new TypeReference<>() { });
            return new ProjectedPlan(original, blocks(blocks));
        } catch (GoalIdentityException invalid) { throw invalid; }
        catch (Exception invalid) { throw new GoalIdentityException("Invalid original plan blocks"); }
    }

    Pair<List<LearnerLearningPlanApi.Block>> blocks(List<LearnerLearningPlanApi.Block> original) {
        require(original != null, "Missing plan blocks");
        return new Pair<>(blocks(original, identities::canonicalGoalId), blocks(original, identities::storageGoalId), snapshot);
    }

    ProjectedHistory history(List<Completion> original) {
        require(original != null, "Missing completion history");
        Map<String, Completion> canonical = new LinkedHashMap<>(), durable = new LinkedHashMap<>();
        for (Completion event : original) {
            require(event != null && event.date() != null && event.occurredAt() != null && Double.isFinite(event.value()),
                    "Invalid original completion event");
            String current = identities.canonicalGoalId(event.goalId()), stored = identities.storageGoalId(event.goalId());
            put(canonical, current + ":" + event.date(), completion(event, current), GoalStateProjection::sameCompletion);
            put(durable, stored + ":" + event.date(), completion(event, stored), GoalStateProjection::sameCompletion);
        }
        return new ProjectedHistory(original, new Pair<>(List.copyOf(canonical.values()), List.copyOf(durable.values()), snapshot));
    }

    IdentityImportProjection prepareSignedImport(SignedLearnerDataDTO archive, String signingSecret) {
        require(archive != null && archive.data() != null && archive.signature() != null && signingSecret != null,
                "Missing signed original archive");
        try {
            // Exactly the current calculateSignature DTO serialization; never canonicalize IDs first.
            byte[] original = mapper.writeValueAsString(archive.data()).getBytes(StandardCharsets.UTF_8);
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = java.util.HexFormat.of().formatHex(mac.doFinal(original)).getBytes(StandardCharsets.UTF_8);
            require(MessageDigest.isEqual(expected, archive.signature().getBytes(StandardCharsets.UTF_8)), "Invalid original archive signature");
            LearnerDataDTO captured = mapper.readValue(original, LearnerDataDTO.class);
            Pair<Map<String, MasteryEntryDTO>> mastery = mastery(captured.mastery() == null ? Map.of() : captured.mastery());
            Map<String, SrsState> states = new LinkedHashMap<>();
            if (captured.srsData() != null) {
                require(captured.srsData().schemaVersion() == 1, "Unsupported original SRS archive version");
                SrsPracticeStateGuard.validatePortable(captured.srsData().states());
                captured.srsData().states().forEach((goal, state) -> {
                    try { states.put(goal, new SrsState(mapper.writeValueAsBytes(state), null)); }
                    catch (Exception invalid) { throw new GoalIdentityException("Invalid original SRS archive payload"); }
                });
            }
            Pair<Map<String, SrsState>> srs = srs(states);
            Pair<List<String>> focus = references(captured.plannedGoals());
            Pair<List<LearnerLearningPlanApi.PortablePlan>> plans = portablePlans(captured.learningPlans());
            // No partial result escapes when any later group failed; no mutation exists in this class.
            return new IdentityImportProjection(original, archive.signature(), mastery, srs, focus, plans,
                    captured.mastery() != null, captured.srsData() != null,
                    captured.plannedGoals() != null, captured.learningPlans() != null);
        } catch (GoalIdentityException invalid) { throw invalid; }
        catch (Exception invalid) { throw new GoalIdentityException("Invalid original archive state: " + invalid.getMessage()); }
    }

    private Pair<List<LearnerLearningPlanApi.PortablePlan>> portablePlans(List<LearnerLearningPlanApi.PortablePlan> original) {
        Map<String, LearnerLearningPlanApi.PortablePlan> canonical = new LinkedHashMap<>(), durable = new LinkedHashMap<>();
        if (original != null) for (var plan : original) {
            require(plan != null && GoalIdentityService.isUuid(plan.landscapeId()), "Invalid original portable plan");
            Pair<List<LearnerLearningPlanApi.Block>> projected = blocks(plan.blocks());
            String key = plan.landscapeId();
            put(canonical, key, new LearnerLearningPlanApi.PortablePlan(plan.landscapeId(), plan.planLabel(), projected.canonical()),
                    GoalStateProjection::samePortablePlan);
            put(durable, key, new LearnerLearningPlanApi.PortablePlan(plan.landscapeId(), plan.planLabel(), projected.durable()),
                    GoalStateProjection::samePortablePlan);
        }
        return new Pair<>(List.copyOf(canonical.values()), List.copyOf(durable.values()), snapshot);
    }

    private static boolean samePortablePlan(LearnerLearningPlanApi.PortablePlan left, LearnerLearningPlanApi.PortablePlan right) {
        return left.landscapeId().equals(right.landscapeId())
                && Objects.equals(left.planLabel(), right.planLabel()) && left.blocks().equals(right.blocks());
    }

    private Pair<List<String>> references(List<String> original) {
        if (original == null) return new Pair<>(List.of(), List.of(), snapshot);
        return new Pair<>(original.stream().map(identities::canonicalGoalId).toList(),
                original.stream().map(identities::storageGoalId).toList(), snapshot);
    }
    private List<LearnerLearningPlanApi.Block> blocks(List<LearnerLearningPlanApi.Block> original, Function<String, String> translate) {
        List<LearnerLearningPlanApi.Block> result = new ArrayList<>();
        for (var block : original) {
            require(block != null, "Invalid original plan block");
            result.add(new LearnerLearningPlanApi.Block(block.id(), block.kind(), optional(block.goalId(), translate),
                    block.title(), block.startDate(), block.endDate(), block.date(),
                    array(block.atomicGoalIds(), translate), array(block.goalIds(), translate), block.active()));
        }
        return List.copyOf(result);
    }
    private static Navigation navigation(Navigation original, Function<String, String> translate) {
        CompletionWorkflowState workflow = original.workflow();
        if (workflow != null) {
            var direct = workflow.directAssessment();
            if (direct != null) direct = new CompletionWorkflowState.DirectAssessmentContext(direct.provider(), direct.sessionBinding(),
                    translate.apply(direct.goalId()), direct.expiresAt());
            workflow = new CompletionWorkflowState(workflow.profileId(), workflow.profileRevision(), workflow.curriculumGeneration(),
                    workflow.curriculumId(), workflow.personalCurriculumDigest(), workflow.navigationIntent(),
                    optional(workflow.currentGoalId(), translate), direct);
        }
        return new Navigation(optional(original.activeGoalId(), translate), original.learningState(), original.revision(), workflow);
    }
    private static Completion completion(Completion source, String goal) {
        return new Completion(source.eventId(), goal, source.date(), source.occurredAt(), source.value(), source.observedTransition(), source.practice());
    }
    private static boolean sameCompletion(Completion left, Completion right) {
        return left.goalId().equals(right.goalId()) && left.date().equals(right.date()) && left.occurredAt().equals(right.occurredAt())
                && number(left.value()).equals(number(right.value())) && left.observedTransition() == right.observedTransition()
                && left.practice().equals(right.practice());
    }
    private <T> Pair<Map<String, T>> keyed(Map<String, T> original, Function<T, String> comparison) {
        require(original != null, "Missing keyed original state");
        Map<String, T> canonical = new LinkedHashMap<>(), durable = new LinkedHashMap<>();
        original.forEach((goal, value) -> {
            comparison.apply(value); // Validate even a unique row.
            put(canonical, identities.canonicalGoalId(goal), value, (a, b) -> comparison.apply(a).equals(comparison.apply(b)));
            put(durable, identities.storageGoalId(goal), value, (a, b) -> comparison.apply(a).equals(comparison.apply(b)));
        });
        return new Pair<>(Collections.unmodifiableMap(canonical), Collections.unmodifiableMap(durable), snapshot);
    }
    private static <T> void put(Map<String, T> target, String key, T value, java.util.function.BiPredicate<T, T> same) {
        T previous = target.putIfAbsent(key, value);
        require(previous == null || same.test(previous, value), "Conflicting alias state at " + key);
    }
    private static String number(double value) { return BigDecimal.valueOf(value).stripTrailingZeros().toPlainString(); }
    private static String optional(String value, Function<String, String> translate) {
        return value == null || value.isBlank() ? value : translate.apply(value);
    }
    private static List<String> array(List<String> values, Function<String, String> translate) {
        return values == null ? null : values.stream().map(translate).toList();
    }
}
