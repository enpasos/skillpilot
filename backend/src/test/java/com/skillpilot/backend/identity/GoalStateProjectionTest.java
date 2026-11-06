package com.skillpilot.backend.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.skillpilot.backend.api.LearnerDataDTO;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.MasteryEntryDTO;
import com.skillpilot.backend.api.PortableSrsData;
import com.skillpilot.backend.api.SignedLearnerDataDTO;
import com.skillpilot.backend.completion.CompletionWorkflowState;
import com.skillpilot.backend.domain.LearnerGoalCompletion.PracticeEvidence;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;

class GoalStateProjectionTest {
    static final String OWNER = "ab000000-0000-4000-8000-000000000001";
    static final String OLD = "original_memory_goal";
    static final String CURRENT = "10000000-0000-4000-8000-000000000001";
    static final String UNCHANGED = "20000000-0000-4000-8000-000000000001";
    static final String SECRET = "synthetic-existing-hmac-contract";
    static final Instant TIME = Instant.parse("2026-10-01T10:00:00Z");
    static final LocalDate DAY = LocalDate.of(2026, 10, 1);
    final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    final GoalIdentityService.SnapshotIdentity snapshot = new GoalIdentityService.SnapshotIdentity(
            GoalIdentityService.Source.REPOSITORY, "synthetic-source-generation", "a".repeat(64));
    final GoalIdentityMap identities = new GoalIdentityMap(List.of(new GoalIdentityMap.Rename(OWNER, OLD, CURRENT)),
            Map.of(OLD, Set.of(OWNER), CURRENT, Set.of(OWNER), UNCHANGED, Set.of(OWNER)), Set.of(OLD, UNCHANGED));
    final GoalStateProjection projection = new GoalStateProjection(identities, snapshot, mapper);

    @Test void masteryAliasesDeduplicateOnlyEqualOriginalValuesAndTimesWithoutWrites() {
        var old = new MasteryEntryDTO(0.93, TIME);
        var original = new LinkedHashMap<String, MasteryEntryDTO>(); original.put(OLD, old); original.put(CURRENT, old);
        var result = projection.mastery(original);
        assertThat(result.snapshot()).isEqualTo(snapshot);
        assertThat(result.canonical()).containsExactlyEntriesOf(Map.of(CURRENT, old));
        assertThat(result.durable()).containsExactlyEntriesOf(Map.of(OLD, old));
        assertThat(original).hasSize(2);
        assertThatThrownBy(() -> result.canonical().put(UNCHANGED, old)).isInstanceOf(UnsupportedOperationException.class);
        assertThat(projection.mastery(Map.of(OLD, new MasteryEntryDTO(-0.0, TIME), CURRENT, new MasteryEntryDTO(0.0, TIME)))
                .canonical()).hasSize(1);
    }

    @Test void masteryValueAndTimestampConflictsCannotChooseMaxOrLatest() {
        for (var conflicting : List.of(new MasteryEntryDTO(0.0, TIME), new MasteryEntryDTO(1.0, TIME.plusSeconds(1))))
            assertThatThrownBy(() -> projection.mastery(Map.of(OLD, new MasteryEntryDTO(1.0, TIME), CURRENT, conflicting)))
                    .isInstanceOf(GoalIdentityException.class).hasMessageContaining("Conflicting alias state");
        assertThatThrownBy(() -> projection.mastery(Map.of(OLD, new MasteryEntryDTO(Double.NaN, TIME))))
                .isInstanceOf(GoalIdentityException.class);
    }

    @Test void srsComparisonNormalizesJsonValuesWithoutChangingCardsOrTheirPayloadBytes() {
        byte[] first = bytes("{\"card-original_memory_goal\":{\"id\":\"card-original_memory_goal\",\"interval\":1,\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-10-01T10:00:00Z\"}}}");
        byte[] equivalent = bytes("{\"card-original_memory_goal\":{\"verifiedRecall\":{\"passedAt\":\"2026-10-01T10:00:00Z\",\"status\":\"passed\"},\"interval\":1.0,\"id\":\"card-original_memory_goal\"}}");
        var input = new LinkedHashMap<String, GoalStateProjection.SrsState>();
        input.put(OLD, new GoalStateProjection.SrsState(first, TIME)); input.put(CURRENT, new GoalStateProjection.SrsState(equivalent, TIME));
        var result = projection.srs(input);
        assertThat(result.canonical()).containsOnlyKeys(CURRENT);
        assertThat(result.durable().get(OLD).json()).containsExactly(first);
        first[0] = 0; byte[] exposed = result.canonical().get(CURRENT).json(); exposed[0] = 0;
        assertThat(result.canonical().get(CURRENT).json()[0]).isEqualTo((byte) '{');
    }

    @Test void srsTimestampOrCardOutcomeConflictsAreRejected() {
        var passed = new GoalStateProjection.SrsState(bytes("{\"card\":{\"status\":\"passed\"}}"), TIME);
        for (var conflict : List.of(new GoalStateProjection.SrsState(passed.json(), TIME.plusSeconds(1)),
                new GoalStateProjection.SrsState(bytes("{\"card\":{\"status\":\"failed\"}}"), TIME)))
            assertThatThrownBy(() -> projection.srs(Map.of(OLD, passed, CURRENT, conflict)))
                    .isInstanceOf(GoalIdentityException.class).hasMessageContaining("Conflicting alias state");
    }

    @Test void focusPreservesCaptureTimesAndConflictsInsteadOfDeletingOrDefaulting() {
        var original = List.of(new GoalStateProjection.Focus(OLD, TIME), new GoalStateProjection.Focus(CURRENT, TIME));
        var result = projection.focus(original);
        assertThat(result.canonical()).containsExactly(new GoalStateProjection.Focus(CURRENT, TIME));
        assertThat(result.durable()).containsExactly(new GoalStateProjection.Focus(OLD, TIME));
        assertThat(original).hasSize(2);
        assertThatThrownBy(() -> projection.focus(List.of(original.getFirst(), new GoalStateProjection.Focus(CURRENT, TIME.plusSeconds(1)))))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("Conflicting alias state");
    }

    @Test void navigationTranslatesOnlyGoalFieldsAndDoesNotRenewAuthorization() {
        var direct = new CompletionWorkflowState.DirectAssessmentContext("claude", OLD, OLD, TIME);
        var workflow = new CompletionWorkflowState(OLD, "revision", "old-generation", OWNER, OLD, "required", OLD, direct);
        var original = new GoalStateProjection.Navigation(OLD, "TEACHING", 17, workflow);
        var result = projection.navigation(original);
        assertThat(result.canonical().activeGoalId()).isEqualTo(CURRENT);
        assertThat(result.canonical().workflow().currentGoalId()).isEqualTo(CURRENT);
        assertThat(result.canonical().workflow().directAssessment().goalId()).isEqualTo(CURRENT);
        assertThat(result.canonical().workflow().directAssessment().sessionBinding()).isEqualTo(OLD);
        assertThat(result.canonical().workflow().directAssessment().expiresAt()).isEqualTo(TIME);
        assertThat(result.canonical().workflow().curriculumGeneration()).isEqualTo("old-generation");
        assertThat(result.canonical().workflow().profileId()).isEqualTo(OLD);
        assertThat(result.canonical().revision()).isEqualTo(17);
        assertThat(result.durable()).isEqualTo(original);
    }

    @Test void planProjectionKeepsOriginalCaptureAndAllOrderedArrayAndInactiveSemantics() throws Exception {
        var block = new LearnerLearningPlanApi.Block(OLD, "learning", OLD, OLD, DAY, DAY.plusDays(1), null,
                List.of(OLD, CURRENT, UNCHANGED), List.of(), false);
        byte[] original = mapper.writeValueAsBytes(List.of(block));
        var capture = new GoalStateProjection.PlanCapture("plan-original", OWNER, 8, "historical-v2-fingerprint", TIME, TIME, original);
        var result = projection.plan(capture);
        assertThat(result.original().blocksJson()).containsExactly(original);
        assertThat(result.original().scopeFingerprint()).isEqualTo("historical-v2-fingerprint");
        assertThat(result.original().capturedAt()).isEqualTo(TIME);
        var projected = result.blocks().canonical().getFirst();
        assertThat(projected.id()).isEqualTo(OLD); assertThat(projected.title()).isEqualTo(OLD);
        assertThat(projected.goalId()).isEqualTo(CURRENT); assertThat(projected.goalIds()).isEmpty();
        assertThat(projected.atomicGoalIds()).containsExactly(CURRENT, CURRENT, UNCHANGED);
        assertThat(projected.active()).isFalse(); assertThat(projected.endDate()).isEqualTo(DAY.plusDays(1));
        original[0] = 0; assertThat(result.original().blocksJson()[0]).isEqualTo((byte) '[');
    }

    @Test void completionProjectionKeepsOriginalEventsAndNeverCreatesAnotherDailyCredit() {
        var practice = List.of(new PracticeEvidence("verified_recall", OLD, TIME));
        var first = new GoalStateProjection.Completion("event-old", OLD, DAY, TIME, 1, true, practice);
        var alias = new GoalStateProjection.Completion("event-alias", CURRENT, DAY, TIME, 1, true, practice);
        var result = projection.history(List.of(first, alias));
        assertThat(result.original()).containsExactly(first, alias);
        assertThat(result.events().canonical()).hasSize(1);
        assertThat(result.events().canonical().getFirst().goalId()).isEqualTo(CURRENT);
        assertThat(result.events().canonical().getFirst().practice()).isEqualTo(practice);
        assertThat(result.events().durable().getFirst().goalId()).isEqualTo(OLD);
        var changed = new GoalStateProjection.Completion("other", CURRENT, DAY, TIME.plusSeconds(1), 1, true, practice);
        assertThatThrownBy(() -> projection.history(List.of(first, changed))).isInstanceOf(GoalIdentityException.class);
    }

    @Test void snapshotMismatchAndWrongQualifiedOwnerFailClosed() {
        projection.requireSnapshot(snapshot);
        assertThatThrownBy(() -> projection.requireSnapshot(new GoalIdentityService.SnapshotIdentity(
                GoalIdentityService.Source.PACKAGE, snapshot.identity(), snapshot.generationSha256())))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("snapshot");
        assertThatThrownBy(() -> projection.mastery(Map.of(UNCHANGED + ":" + OLD, new MasteryEntryDTO(1, TIME))))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("owner");
    }

    @Test void signedOriginalDtoIsAuthenticatedBeforeProjectionAndRetainedUnmodified() throws Exception {
        var data = data(Map.of(OLD, new MasteryEntryDTO(1, TIME)), List.of(OLD), List.of(plan(OLD)), null);
        byte[] original = mapper.writeValueAsBytes(data);
        var signed = sign(data); var result = projection.prepareSignedImport(signed, SECRET);
        assertThat(result.originalDtoJson()).containsExactly(original);
        assertThat(result.originalSignature()).isEqualTo(signed.signature());
        assertThat(result.mastery().canonical()).containsOnlyKeys(CURRENT);
        assertThat(result.mastery().durable()).containsOnlyKeys(OLD);
        assertThat(result.focus().canonical()).containsExactly(CURRENT);
        assertThat(result.plans().durable().getFirst().blocks().getFirst().goalId()).isEqualTo(OLD);
        assertThat(mapper.writeValueAsBytes(data)).containsExactly(original);
        var translated = data(Map.of(CURRENT, new MasteryEntryDTO(1, TIME)), List.of(CURRENT), List.of(plan(CURRENT)), null);
        assertThatThrownBy(() -> projection.prepareSignedImport(new SignedLearnerDataDTO(data, sign(translated).signature()), SECRET))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("original archive signature");
    }

    @Test void invalidSignatureWinsBeforeAnyAliasOrStateValidation() {
        var malformed = data(Map.of("unmapped-symbol", new MasteryEntryDTO(1, TIME)), null, null, null);
        assertThatThrownBy(() -> projection.prepareSignedImport(new SignedLearnerDataDTO(malformed, "0".repeat(64)), SECRET))
                .isInstanceOf(GoalIdentityException.class).hasMessageContaining("original archive signature");
    }

    @Test void latePlanConflictRejectsTheWholeSignedIdentityPreparationWithoutPartialChanges() throws Exception {
        var data = data(Map.of(OLD, new MasteryEntryDTO(1, TIME)), List.of(OLD), List.of(plan(OLD), plan("unmapped-symbol")), null);
        byte[] before = mapper.writeValueAsBytes(data); var signed = sign(data);
        assertThatThrownBy(() -> projection.prepareSignedImport(signed, SECRET)).isInstanceOf(GoalIdentityException.class);
        assertThat(mapper.writeValueAsBytes(data)).containsExactly(before);
    }

    @Test void portablePlansDeduplicateOnlyAfterTheirTypedGoalFieldsAreNormalized() throws Exception {
        var archive = data(Map.of(), List.of(), List.of(plan(OLD), plan(CURRENT)), null);
        var result = projection.prepareSignedImport(sign(archive), SECRET);
        assertThat(result.plans().canonical()).hasSize(1);
        assertThat(result.plans().durable()).hasSize(1);
        var different = new LearnerLearningPlanApi.PortablePlan(OWNER, "different-label", plan(CURRENT).blocks());
        var conflict = data(Map.of(), List.of(), List.of(plan(OLD), different), null);
        assertThatThrownBy(() -> projection.prepareSignedImport(sign(conflict), SECRET)).isInstanceOf(GoalIdentityException.class)
                .hasMessageContaining("Conflicting alias state");
    }

    @Test void legacyOmissionsRemainDifferentFromExplicitEmptyRestoreGroups() throws Exception {
        var omitted = projection.prepareSignedImport(sign(data(null, null, null, null)), SECRET);
        assertThat(omitted.masteryPresent()).isFalse(); assertThat(omitted.focusPresent()).isFalse();
        assertThat(omitted.plansPresent()).isFalse(); assertThat(omitted.srsPresent()).isFalse();
        var explicit = projection.prepareSignedImport(sign(data(Map.of(), List.of(), List.of(), new PortableSrsData(1, Map.of()))), SECRET);
        assertThat(explicit.masteryPresent()).isTrue(); assertThat(explicit.focusPresent()).isTrue();
        assertThat(explicit.plansPresent()).isTrue(); assertThat(explicit.srsPresent()).isTrue();
    }

    @Test void portableVerifiedCardPayloadStaysExactAndMalformedRecallCannotPrepare() throws Exception {
        Map<String, Object> card = Map.of("card-unchanged", Map.of("id", OLD, "verifiedRecall", Map.of("status", "passed", "passedAt", TIME.toString())));
        var portable = new PortableSrsData(1, Map.of(OLD, card));
        var result = projection.prepareSignedImport(sign(data(Map.of(), List.of(), List.of(), portable)), SECRET);
        assertThat(CanonicalIdentityJson.parse(result.srs().canonical().get(CURRENT).json()))
                .isEqualTo(CanonicalIdentityJson.parse(mapper.writeValueAsBytes(card)));
        var invalid = new PortableSrsData(1, Map.of(OLD, Map.of("card", Map.of("verifiedRecall", Map.of("status", "passed")))));
        assertThatThrownBy(() -> projection.prepareSignedImport(sign(data(Map.of(), List.of(), List.of(), invalid)), SECRET))
                .isInstanceOf(GoalIdentityException.class);
    }

    private LearnerDataDTO data(Map<String, MasteryEntryDTO> mastery, List<String> focus,
            List<LearnerLearningPlanApi.PortablePlan> plans, PortableSrsData srs) {
        return new LearnerDataDTO(null, mastery, focus, Set.of(), plans, srs);
    }
    private LearnerLearningPlanApi.PortablePlan plan(String goal) {
        return new LearnerLearningPlanApi.PortablePlan(OWNER, "original-label", List.of(
                new LearnerLearningPlanApi.Block("block-unchanged", "learning", goal, OLD, DAY, DAY.plusDays(1), null, List.of(goal))));
    }
    private SignedLearnerDataDTO sign(LearnerDataDTO data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(bytes(SECRET), "HmacSHA256"));
        return new SignedLearnerDataDTO(data, java.util.HexFormat.of().formatHex(mac.doFinal(mapper.writeValueAsBytes(data))));
    }
    private static byte[] bytes(String value) { return value.getBytes(StandardCharsets.UTF_8); }
}
