package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.repository.*;
import com.skillpilot.backend.domain.*;
import com.skillpilot.backend.api.*;
import java.nio.file.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;

/** All review/source data here are synthetic TEST_ONLY fixtures. No real scientific acceptance. */
class CompositionSupplementContractTest {
    @TempDir Path directory;
    static final String M = CompositionSupplementService.MATH, P = CompositionSupplementService.PHYSICS;
    static final String ROOT = "de-gymnasium-root";
    static final String LEARNER = "TEST_ONLY_supplement_learner";
    final ObjectMapper mapper = new ObjectMapper();
    LandscapeService landscapes;
    CompositionSupplementService supplements;
    CompositionViewService views;
    LearnerService service;
    Learner learner;
    LearnerRepository learners;
    MasteryRepository mastery;
    PlannedGoalRepository planned;
    Map<String, LearningGoal> goals;
    Map<String, Object> mathView, physicsView;
    ObjectNode document, review;
    List<PlannedGoal> focus = new ArrayList<>();

    @BeforeEach void fixture() throws Exception {
        landscapes = mock(LandscapeService.class);
        goals = new LinkedHashMap<>();
        goals.put("TEST_ONLY_m0", goal("TEST_ONLY_m0", List.of()));
        goals.put("TEST_ONLY_m1", goal("TEST_ONLY_m1", List.of("TEST_ONLY_m0")));
        goals.put("TEST_ONLY_unrelated", goal("TEST_ONLY_unrelated", List.of()));
        goals.put("TEST_ONLY_p", goal("TEST_ONLY_p", List.of("TEST_ONLY_m1")));
        SkillLandscape math = landscape(M, "canonical-gymnasium-math", List.of(goals.get("TEST_ONLY_m0"), goals.get("TEST_ONLY_m1"), goals.get("TEST_ONLY_unrelated")));
        SkillLandscape physics = landscape(P, "canonical-gymnasium-physics", List.of(goals.get("TEST_ONLY_p")));
        SkillLandscape root = landscape(ROOT, "canonical-gymnasium", List.of());
        when(landscapes.getById(M)).thenReturn(math); when(landscapes.getById(P)).thenReturn(physics); when(landscapes.getById(ROOT)).thenReturn(root);
        when(landscapes.getClosure(ROOT)).thenReturn(List.of(root, physics)); // Math is NOT in graph closure
        when(landscapes.getClosure(eq(ROOT), anyString())).thenReturn(List.of(root, physics));
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(call -> goals.get(call.getArgument(0)));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenAnswer(call -> {
            String id = call.getArgument(0); return !goals.containsKey(id) ? null : id.equals("TEST_ONLY_p") ? P : M;
        });
        Map<String, String> scope = Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", "SekI", "durationModel", "G9");
        mathView = view("TEST_ONLY_math_base", M, scope, List.of(entry("TEST_ONLY_m0"), entry("TEST_ONLY_unrelated")));
        physicsView = view("TEST_ONLY_physics_base", P, scope, List.of(entry("TEST_ONLY_p"), support("TEST_ONLY_m0"), support("TEST_ONLY_m1")));
        writeView(mathView, "math"); writeView(physicsView, "physics");
        LandscapeProperties properties = new LandscapeProperties(); properties.setDirectory(directory.toString());
        NativeSupplementAcceptanceGate postNativeBoundary = (owner, goal) -> "a".repeat(64);
        // Explicit post-native-admission mechanics only. Production native authority
        // is separately exercised against the real registered 807/478 pipeline.
        supplements = new CompositionSupplementService(properties, mapper, landscapes, postNativeBoundary,
                Path.of("../contracts/composition-supplement/v1"));
        views = new CompositionViewService(properties, mapper, () -> {
            Map<String,List<String>> graph = new LinkedHashMap<>();goals.forEach((id, goal)->graph.put(id,goal.getContains()));return graph;
        }); views.setSupplementService(supplements);
        Files.writeString(directory.resolve("TEST_ONLY_source_evidence.json"), "{\"TEST_ONLY\":true}");
        Files.writeString(directory.resolve("TEST_ONLY_quality_evidence.json"), "{\"TEST_ONLY\":true}");
        document = mapper.createObjectNode();
        document.put("$schema", CompositionSupplementService.SCHEMA).put("supplementFormatVersion", "1.0")
                .put("supplementId", "TEST_ONLY_preparation").put("landscapeId", M).put("language", "de")
                .put("label", "TEST_ONLY Mathe-Vorbereitung").put("labelEn", "TEST_ONLY Mathematics preparation")
                .put("reviewPath", "TEST_ONLY_review.json");
        document.set("scope", mapper.valueToTree(scope)); document.set("compatibleBaseViewIds", mapper.valueToTree(List.of("TEST_ONLY_math_base")));
        document.set("rootNodes", mapper.valueToTree(List.of(Map.of("kind", "structure", "id", "TEST_ONLY_preparation_root", "label", "TEST_ONLY preparation", "children", List.of(entry("TEST_ONLY_m0"), entry("TEST_ONLY_m1"))))));
        review = mapper.createObjectNode();
        review.put("$schema", CompositionSupplementService.REVIEW_SCHEMA).put("reviewFormatVersion", "1.0")
                .put("reviewId", "TEST_ONLY_review").put("ownerLandscapeId", M).put("decision", "accepted")
                .put("authorId", "TEST_ONLY_author").put("reviewerId", "TEST_ONLY_independent_reviewer");
        review.set("scope", mapper.valueToTree(scope)); review.set("compatibleBaseViewIds", document.get("compatibleBaseViewIds"));
        review.set("baseViewBindings", mapper.valueToTree(List.of(Map.of("viewId", "TEST_ONLY_math_base", "viewSha256", sha(mathView)))));
        review.put("mathTeachingClosureSha256", supplements.teachingClosureSha256(Set.of("TEST_ONLY_m0", "TEST_ONLY_m1")));
        review.set("conditions", mapper.createArrayNode()); review.set("dissent", mapper.createArrayNode().add("TEST_ONLY retained dissent"));
        review.set("mathGoalBindings", mapper.valueToTree(List.of(binding("TEST_ONLY_m0", true), binding("TEST_ONLY_m1", true))));
        review.set("physicsGoalBindings", mapper.valueToTree(List.of(binding("TEST_ONLY_p", false))));
        review.set("physicsContext", mapper.valueToTree(Map.of("landscapeId", P, "viewId", "TEST_ONLY_physics_base", "viewSha256", sha(physicsView), "scope", scope)));
        review.set("sourceBindings", mapper.valueToTree(List.of(Map.of("sourceId", "TEST_ONLY_source", "subject", "Physics", "edition", "TEST_ONLY_edition", "cohort", "TEST_ONLY_cohort", "anchor", "TEST_ONLY_anchor", "officialUrl", "https://example.invalid/TEST_ONLY", "retainedEvidence", fileBinding("TEST_ONLY_source_evidence.json")))));
        review.set("targetAuthorizations", mapper.valueToTree(List.of(authorization("TEST_ONLY_m0"), authorization("TEST_ONLY_m1"))));
        persist();
        learners = mock(LearnerRepository.class); mastery = mock(MasteryRepository.class); planned = mock(PlannedGoalRepository.class);
        learner = new Learner(); learner.setSkillpilotId(LEARNER); learner.setSelectedCurriculum(ROOT);
        Map<String,Object> config = new LinkedHashMap<>();
        // Root scope is explicit; Math ordinary subject is explicitly not selected.
        config.put("DE_GYMNASIUM", Map.of("selected", true, "filterId", "DE-HE", "stage", "SekI", "durationModel", "G9"));
        config.put(P, Map.of("selected", true)); config.put(M, Map.of("selected", false));
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.existsById(LEARNER)).thenReturn(true);
        when(learners.findBySkillpilotIdForUpdate(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.save(any())).thenAnswer(call -> call.getArgument(0));
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of());
        when(planned.findByLearner_SkillpilotId(LEARNER)).thenAnswer(call -> List.copyOf(focus));
        when(planned.saveAll(any())).thenAnswer(call -> { List<PlannedGoal> result = new ArrayList<>(); ((Iterable<PlannedGoal>)call.getArgument(0)).forEach(result::add); focus.clear(); focus.addAll(result); return result; });
        doAnswer(call -> { focus.clear(); return null; }).when(planned).deleteByLearner_SkillpilotId(LEARNER);
        service = new LearnerService(learners, mock(LearnerClientStateRepository.class), mastery, planned,
                landscapes, mock(GoalMappingService.class), mock(DeckResourceService.class), views, mapper,
                mock(ApplicationEventPublisher.class), mock(PlatformTransactionManager.class));
        ReflectionTestUtils.setField(service, "signingSecret", "TEST_ONLY_supplement_secret");
    }

    @Test void strictLoaderSeparatesInferenceAuthorizationFromRegularMathSourceCoverage() {
        var supplement = supplements.validatedSupplements().getFirst();
        assertThat(supplement.targetGoalIds()).containsExactly("TEST_ONLY_m0", "TEST_ONLY_m1");
        assertThat(supplement.authorizationAccounting().totalAuthoredTargetAtomicGoals()).isEqualTo(2);
        assertThat(supplement.authorizationAccounting().reviewedDidacticSupplementAtomicGoals()).isEqualTo(2);
        assertThat(supplement.authorizationAccounting().regularSourceBackedAtomicGoals()).isZero();
        assertThat(supplement.authorizationAccounting().regularSourceClaimStillUnestablishedGoalIds()).hasSize(2);
        assertThat(views.findLearnerScopeView(M, supplement.scope()).get("viewId")).isEqualTo("TEST_ONLY_math_base");
    }

    @Test void mixedRegularMathAndInferredTargetsKeepSeparateExactSourceClaims() throws Exception {
        Files.writeString(directory.resolve("TEST_ONLY_math_source.json"), "{\"subject\":\"TEST_ONLY_Mathematics\"}");
        Map<String,Object> mathReview = new LinkedHashMap<>();
        mathReview.put("$schema", "https://skillpilot.com/schemas/composition-supplement/v1/regular-mathematics-source-review.schema.json");
        mathReview.put("reviewFormatVersion", "1.0"); mathReview.put("reviewId", "TEST_ONLY_regular_math_review");
        mathReview.put("ownerLandscapeId", M); mathReview.put("goalId", "TEST_ONLY_m0"); mathReview.put("goalSha256", sha(goals.get("TEST_ONLY_m0")));
        mathReview.put("scope", mapper.convertValue(document.get("scope"), Map.class));
        mathReview.put("decision", "accepted"); mathReview.put("authorId", "TEST_ONLY_math_author"); mathReview.put("reviewerId", "TEST_ONLY_math_peer"); mathReview.put("conditions", List.of());
        mathReview.put("wholeGoalCoverage", "TEST_ONLY accepted whole Math Goal/P, not a copied Physics claim");
        mathReview.put("reviewEvidence", fileBinding("TEST_ONLY_quality_evidence.json"));
        mathReview.put("sourceBinding", Map.of("sourceId", "TEST_ONLY_mathematics_source", "subject", "Mathematics", "edition", "TEST_ONLY_math_edition", "cohort", "TEST_ONLY_math_cohort", "anchor", "TEST_ONLY_math_anchor", "officialUrl", "https://example.invalid/TEST_ONLY_math", "retainedEvidence", fileBinding("TEST_ONLY_math_source.json")));
        mapper.writeValue(directory.resolve("TEST_ONLY_regular_review.json").toFile(), mathReview);
        ObjectNode auth = (ObjectNode)review.path("targetAuthorizations").get(0);
        auth.put("classification", "regular-mathematics-source-backed").put("regularMathematicsSourceCoverageClaim", true);
        auth.set("regularMathematicsSourceReview", mapper.valueToTree(fileBinding("TEST_ONLY_regular_review.json")));
        persist();
        var accounting = supplements.validatedSupplements().getFirst().authorizationAccounting();
        assertThat(accounting.totalAuthoredTargetAtomicGoals()).isEqualTo(2);
        assertThat(accounting.regularSourceBackedAtomicGoals()).isEqualTo(1);
        assertThat(accounting.reviewedDidacticSupplementAtomicGoals()).isEqualTo(1);
        assertThat(accounting.regularSourceClaimStillUnestablishedGoalIds()).containsExactly("TEST_ONLY_m1");
        ObjectNode wrongScope = (ObjectNode)mapper.valueToTree(mathReview);
        ((ObjectNode)wrongScope.get("scope")).put("stage", "SekII").put("courseProfile", "LK");
        mapper.writeValue(directory.resolve("TEST_ONLY_regular_review.json").toFile(), wrongScope);
        auth.set("regularMathematicsSourceReview", mapper.valueToTree(fileBinding("TEST_ONLY_regular_review.json"))); persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("different goal or scope");
    }

    @Test void actualCurrentNativeKindLedgerIsReadWithoutMutatingCanonicalGoals() throws Exception {
        LandscapeProperties properties = new LandscapeProperties(); properties.setDirectory(Path.of("../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json").toRealPath().getParent().getParent().getParent().getParent().toString());
        var nativeService = new CompositionSupplementService(properties, mapper, landscapes);
        for (var entry : Map.of("MATHEMATIK", List.of(M, "01217f4a-5221-5df9-b379-7b241fccf809"),
                "PHYSIK", List.of(P, "00245a43-eb89-47d2-92d7-21799dbec9f3")).entrySet()) {
            JsonNode source = mapper.readTree(Path.of("../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_" + entry.getKey() + ".de.json").toFile());
            JsonNode raw = null;
            for (JsonNode candidate : source.path("goals")) if (entry.getValue().get(1).equals(candidate.path("id").asText())) raw = candidate;
            assertThat(raw).isNotNull();
            LearningGoal goal = mapper.treeToValue(raw, LearningGoal.class);
            assertThat((String)ReflectionTestUtils.invokeMethod(nativeService, "nativeSemanticKind", entry.getValue().get(0), goal)).isEqualTo("curricularAtomic");
        }
    }

    @Test void inheritedClusterRequiresRemainInFixedTeachingClosureAndAnyDriftInvalidatesReview() throws Exception {
        LearningGoal cluster = goal("TEST_ONLY_cluster", List.of("TEST_ONLY_m0")); cluster.setContains(List.of("TEST_ONLY_m1")); cluster.setSemanticKind("curricularArea");
        goals.put(cluster.getId(), cluster);
        SkillLandscape math = landscapes.getById(M); var expanded = new ArrayList<>(math.getGoals()); expanded.add(cluster); math.setGoals(expanded);
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("stale effective Math teaching closure");
        review.put("mathTeachingClosureSha256", supplements.teachingClosureSha256(Set.of("TEST_ONLY_m0", "TEST_ONLY_m1"))); persist();
        assertThat(supplements.validatedSupplements()).hasSize(1);
        goals.get("TEST_ONLY_m1").setRequires(List.of());
        ((ArrayNode)document.path("rootNodes").get(0).path("children")).remove(0); persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("teaching closure");
    }

    @Test void staleWholeGoalSourceReviewAndInferenceFailClosed() throws Exception {
        var old = supplements.validatedSupplements().getFirst();
        goals.get("TEST_ONLY_m1").setDescription("TEST_ONLY changed whole P context");
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("stale complete Goal/P");
        goals.get("TEST_ONLY_m1").setDescription("TEST_ONLY full goal and P");
        Files.writeString(directory.resolve("TEST_ONLY_source_evidence.json"), "TEST_ONLY changed source");
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("stale review/source");
        Files.writeString(directory.resolve("TEST_ONLY_source_evidence.json"), "{\"TEST_ONLY\":true}");
        review.put("reviewerId", "TEST_ONLY_author"); persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("independent review");
        review.put("reviewerId", "TEST_ONLY_independent_reviewer"); review.put("decision", "held"); persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");
        review.put("decision", "accepted"); ((ObjectNode)review.path("targetAuthorizations").get(0)).put("regularMathematicsSourceCoverageClaim", true); persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");
        assertThatThrownBy(() -> supplements.requireSupplement(old.id(), "0".repeat(64))).isInstanceOf(IllegalStateException.class);
    }

    @Test void foreignTargetsUnknownFieldsMissingClosureAndViewDriftFailClosed() throws Exception {
        document.put("sixthDimension", "TEST_ONLY"); persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("schema validation");
        document.remove("sixthDimension");
        var children = (ArrayNode)document.path("rootNodes").get(0).path("children");
        ((ObjectNode)children.get(0)).put("goalId", "TEST_ONLY_p"); persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("foreign, missing");
        ((ObjectNode)children.get(0)).put("goalId", "TEST_ONLY_m0"); children.remove(0); persist();
        assertThatThrownBy(supplements::validatedSupplements).hasMessageContaining("teaching closure");
    }

    @Test void explicitSupplementOnlyAddsBoundedTargetsAndSelectionDoesNotAwardMastery() throws Exception {
        // Use actual canonical root constants in the service fixture.
        setActualRootAndScope();
        assertThat(targets()).containsExactly("TEST_ONLY_p");
        assertThat(service.getFrontier(LEARNER)).isEmpty();
        String initial = learner.getPersonalCurriculum();
        var offered = service.getCompositionSupplementOptions(LEARNER);
        var add = offered.options().stream().filter(option -> option.action().equals("ADD")).findFirst().orElseThrow();
        assertThat(add.additionalAtomicTargets()).isEqualTo(2);
        assertThat(add.targets()).extracting(CompositionSupplementOptions.Target::goalId).containsExactly("TEST_ONLY_m0", "TEST_ONLY_m1");
        assertThat(learner.getPersonalCurriculum()).isEqualTo(initial); // offer/decline/cancel is read-only
        learner.setCoachStateRevision(1);
        assertThatThrownBy(() -> service.applyCompositionSupplementOption(LEARNER, add.optionId())).hasMessageContaining("stale");
        assertThat(learner.getPersonalCurriculum()).isEqualTo(initial);
        var current = service.getCompositionSupplementOptions(LEARNER).options().getFirst();
        service.applyCompositionSupplementOption(LEARNER, current.optionId());
        assertThat(mapper.readTree(learner.getPersonalCurriculum()).path(M).path("selected").booleanValue()).isFalse();
        assertThat(targets()).containsExactlyInAnyOrder("TEST_ONLY_p", "TEST_ONLY_m0", "TEST_ONLY_m1").doesNotContain("TEST_ONLY_unrelated");
        assertThat(service.getPersonalCurriculumSubjectIds(LEARNER)).containsExactlyInAnyOrder(M, P);
        assertThat(service.getPlanningScope(LEARNER, M).totalAtomicGoalCount()).isEqualTo(2);
        assertThat(service.getPlanningScope(LEARNER, M).masteredAtomicGoalCount()).isZero();
        var preparationView = service.getSelectedCompositionDocuments(LEARNER, M).getFirst();
        String offeredMathFocus = "composition:" + preparationView.get("viewId") + ":structure:TEST_ONLY_preparation_root";
        service.setPlannedGoals(LEARNER, Set.of(offeredMathFocus)); // explicit first-party focus acceptance
        assertThat(service.getFrontier(LEARNER)).contains("TEST_ONLY_m0").doesNotContain("TEST_ONLY_p", "TEST_ONLY_m1");
        verify(mastery, never()).save(any());
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of(new Mastery(learner, "TEST_ONLY_p", 1.0)));
        assertThat(service.getFrontier(LEARNER)).contains("TEST_ONLY_m0");
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of());
        assertThatThrownBy(() -> service.applyCompositionSupplementOption(LEARNER, current.optionId())).hasMessageContaining("stale");
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of(new Mastery(learner, "TEST_ONLY_m0", 1.0), new Mastery(learner, "TEST_ONLY_m1", 0.5)));
        assertThat(service.getFrontier(LEARNER)).doesNotContain("TEST_ONLY_p");
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of(new Mastery(learner, "TEST_ONLY_m0", 1.0), new Mastery(learner, "TEST_ONLY_m1", 1.0)));
        assertThat(service.getFrontier(LEARNER)).doesNotContain("TEST_ONLY_p");
        assertThat(service.getPlanningScope(LEARNER, M).totalAtomicGoalCount()).isEqualTo(2);
        assertThat(service.getPlanningScope(LEARNER, M).masteredAtomicGoalCount()).isEqualTo(2);
        String beforeReturn = learner.getPersonalCurriculum();
        service.setPlannedGoals(LEARNER, Set.of("TEST_ONLY_p")); // explicit accepted return to original Physics target
        assertThat(learner.getPersonalCurriculum()).isEqualTo(beforeReturn);
        assertThat(service.getFrontier(LEARNER)).contains("TEST_ONLY_p");
        // A fresh closure projection retains the selected stable global targets.
        assertThat(service.getLearnerLandscapeClosure(LEARNER, learner.getSelectedCurriculum(), "de")).extracting(SkillLandscape::getLandscapeId).contains(M);
        String selectedConfig = learner.getPersonalCurriculum();
        focus.clear(); focus.add(new PlannedGoal(learner, "TEST_ONLY_p"));
        assertThat(service.getFrontier(LEARNER)).contains("TEST_ONLY_p");
        assertThat(learner.getPersonalCurriculum()).isEqualTo(selectedConfig); // return/focus does not unenroll
        var remove = service.getCompositionSupplementOptions(LEARNER).options().stream().filter(option -> option.action().equals("REMOVE")).findFirst().orElseThrow();
        service.applyCompositionSupplementOption(LEARNER, remove.optionId());
        assertThat(targets()).containsExactly("TEST_ONLY_p");
        verify(mastery, never()).delete(any()); verify(mastery, never()).save(any());
        verify(learners, atLeast(3)).findBySkillpilotIdForUpdate(LEARNER);
    }

    @Test void independentMathBaseAndTargetsSurviveSupplementRemovalWithBaseParentPriority() throws Exception {
        setActualRootAndScope();
        ObjectNode config = (ObjectNode)mapper.readTree(learner.getPersonalCurriculum());
        ((ObjectNode)config.get(M)).put("selected", true); learner.setPersonalCurriculum(config.toString());
        // Math may enter through the independently authored graph closure in this fixture.
        List<SkillLandscape> completeClosure = List.of(landscapes.getById(learner.getSelectedCurriculum()), landscapes.getById(P), landscapes.getById(M));
        when(landscapes.getClosure(learner.getSelectedCurriculum())).thenReturn(completeClosure);
        var add = service.getCompositionSupplementOptions(LEARNER).options().getFirst();
        assertThat(add.additionalAtomicTargets()).isEqualTo(1);
        service.applyCompositionSupplementOption(LEARNER, add.optionId());
        assertThat(targets()).containsExactlyInAnyOrder("TEST_ONLY_p", "TEST_ONLY_m0", "TEST_ONLY_m1", "TEST_ONLY_unrelated");
        var docs = service.getSelectedCompositionDocuments(LEARNER, M);
        assertThat(docs).hasSize(2);
        assertThat(mapper.writeValueAsString(docs.get(1))).doesNotContain("TEST_ONLY_m0");
        String remove = service.getCompositionSupplementOptions(LEARNER).options().stream().filter(option -> option.action().equals("REMOVE")).findFirst().orElseThrow().optionId();
        service.applyCompositionSupplementOption(LEARNER, remove);
        assertThat(targets()).containsExactlyInAnyOrder("TEST_ONLY_p", "TEST_ONLY_m0", "TEST_ONLY_unrelated");
        assertThat(mapper.readTree(learner.getPersonalCurriculum()).path(M).path("selected").booleanValue()).isTrue();
    }

    @Test void multipleSupplementsUseStableIdentityOrderAndRemovingOneRetainsTheOtherTargets() throws Exception {
        setActualRootAndScope();
        ObjectNode second = document.deepCopy(); second.put("supplementId", "TEST_ONLY_second").put("reviewPath", "TEST_ONLY_second_review.json");
        ObjectNode secondReview = review.deepCopy(); secondReview.put("supplementSha256", sha(second));
        mapper.writeValue(directory.resolve("TEST_ONLY_second_review.json").toFile(), secondReview);
        mapper.writeValue(directory.resolve("DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY_second.supplement.json").toFile(), second);
        service.applyCompositionSupplementOption(LEARNER, service.getCompositionSupplementOptions(LEARNER).options().getFirst().optionId());
        var next = service.getCompositionSupplementOptions(LEARNER).options().stream().filter(option -> option.action().equals("ADD")).findFirst().orElseThrow();
        assertThat(next.additionalAtomicTargets()).isZero(); // overlap remains in both fixed reviewed bundles
        service.applyCompositionSupplementOption(LEARNER, next.optionId());
        assertThat(targets()).containsExactlyInAnyOrder("TEST_ONLY_p", "TEST_ONLY_m0", "TEST_ONLY_m1");
        assertThat(service.getSelectedCompositionDocuments(LEARNER, M)).hasSize(1); // one visible parent
        var removeFirst = service.getCompositionSupplementOptions(LEARNER).options().stream().filter(option -> option.action().equals("REMOVE") && option.label().equals("TEST_ONLY_preparation")).findFirst().orElseThrow();
        service.applyCompositionSupplementOption(LEARNER, removeFirst.optionId());
        assertThat(targets()).containsExactlyInAnyOrder("TEST_ONLY_p", "TEST_ONLY_m0", "TEST_ONLY_m1");
        assertThat(mapper.readTree(learner.getPersonalCurriculum()).path(M).path(CompositionSupplementService.SELECTIONS)).hasSize(1);
    }

    @Test void staleSelectionAndUnsupportedSourceFailClosedButExplicitRemovalIsAvailable() throws Exception {
        setActualRootAndScope();
        var add = service.getCompositionSupplementOptions(LEARNER).options().getFirst();
        service.applyCompositionSupplementOption(LEARNER, add.optionId());
        goals.get("TEST_ONLY_m1").setDescription("TEST_ONLY changed P after selection");
        assertThatThrownBy(this::targets).hasMessageContaining("stale or incompatible");
        var remove = service.getCompositionSupplementOptions(LEARNER).options().getFirst();
        assertThat(remove.action()).isEqualTo("REMOVE");
        service.applyCompositionSupplementOption(LEARNER, remove.optionId());
        assertThat(targets()).containsExactly("TEST_ONLY_p");
        var packageModeLike = new CompositionViewService(new LandscapeProperties(), mapper);
        assertThatThrownBy(() -> packageModeLike.selectedSupplements(Map.of(M, Map.of(CompositionSupplementService.SELECTIONS, List.of()))))
                .hasMessageContaining("does not support");
    }

    @Test void unreviewedStageProfileAndViewBytesAreNeverOfferedAndRawSelectionWritesAreRejected() throws Exception {
        setActualRootAndScope();
        var supplement = supplements.validatedSupplements().getFirst();
        assertThatThrownBy(() -> views.validateSupplementContext(supplement, Map.of(), supplement.physicsScope(), true)).hasMessageContaining("incompatible");
        Map<String,Object> changed = new LinkedHashMap<>(physicsView); changed.put("title", "TEST_ONLY changed Physics view");
        writeView(changed, "physics");
        LandscapeProperties properties = new LandscapeProperties(); properties.setDirectory(directory.toString());
        var reloaded = new CompositionViewService(properties, mapper);
        assertThatThrownBy(() -> reloaded.validateSupplementContext(supplement, supplement.scope(), supplement.physicsScope(), true)).hasMessageContaining("incompatible");
        assertThatThrownBy(() -> service.setPersonalCurriculum(LEARNER, Map.of(M, Map.of(CompositionSupplementService.SELECTIONS, List.of())), null, null))
                .hasMessageContaining("explicit acceptance");
    }

    void setActualRootAndScope() throws Exception {
        String actualRoot = "de-gymnasium-root";
        try { actualRoot = (String)ReflectionTestUtils.getField(LearnerService.class, "CANONICAL_GYMNASIUM_ROOT_ID"); } catch (Exception ignored) {}
        String rootId = actualRoot;
        SkillLandscape root = landscape(rootId, "canonical-gymnasium-root", List.of());
        SkillLandscape physics = landscapes.getById(P);
        when(landscapes.getById(rootId)).thenReturn(root); when(landscapes.getClosure(rootId)).thenReturn(List.of(root, physics));
        when(landscapes.getClosure(eq(rootId), anyString())).thenReturn(List.of(root, physics));
        learner.setSelectedCurriculum(rootId);
        ObjectNode config = (ObjectNode)mapper.readTree(learner.getPersonalCurriculum());
        JsonNode scope = config.remove("DE_GYMNASIUM"); config.set(rootId, scope); learner.setPersonalCurriculum(config.toString());
    }
    Set<String> targets() {
        Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        return ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
    }
    LearningGoal goal(String id, List<String> requires) {
        LearningGoal goal = new LearningGoal(); goal.setId(id); goal.setTitle(id); goal.setDescription("TEST_ONLY full goal and P");
        goal.setRequires(requires); goal.setContains(List.of()); goal.setTags(List.of()); goal.setSemanticKind("curricularAtomic"); goal.setType("atomic"); goal.setWeight(1.0);
        return goal;
    }
    SkillLandscape landscape(String id, String framework, List<LearningGoal> goals) {
        SkillLandscape landscape = new SkillLandscape(); landscape.setLandscapeId(id); landscape.setFrameworkId(framework); landscape.setGoals(goals); landscape.setTitle("TEST_ONLY " + id); return landscape;
    }
    Map<String,Object> view(String id, String owner, Map<String,String> scope, List<Map<String,Object>> nodes) { return Map.of("viewId", id, "landscapeId", owner, "scope", scope, "rootNodes", nodes); }
    Map<String,Object> entry(String id) { return Map.of("kind", "goalEntry", "goalId", id); }
    Map<String,Object> support(String id) { return Map.of("kind", "goalEntry", "goalId", id, "projectionRole", "prerequisiteOnly"); }
    void writeView(Map<String,Object> view, String name) throws Exception { Path path = directory.resolve("DE/Gymnasium/composition-views/" + name + ".view.json"); Files.createDirectories(path.getParent()); mapper.writeValue(path.toFile(), view); }
    Map<String,Object> binding(String id, boolean quality) throws Exception {
        Map<String,Object> result = new LinkedHashMap<>(Map.of("goalId", id, "goalSha256", sha(goals.get(id)), "semanticKind", "curricularAtomic", "nativeAcceptanceSha256", "a".repeat(64)));
        return result;
    }
    Map<String,Object> authorization(String id) { return Map.of("goalId", id, "classification", "reviewed-didactic-mathematics-supplement-motivated-by-physics", "regularMathematicsSourceCoverageClaim", false, "physicsDependentGoalIds", List.of("TEST_ONLY_p"), "mandatoryOperation", "TEST_ONLY mandatory operation", "mathematicalInference", "TEST_ONLY inference", "inputAvailability", Map.of("mode", "supplied", "decision", "accepted", "rationale", "TEST_ONLY neutral supplied input"), "wholePerformanceAlternatives", "TEST_ONLY full alternatives", "minimality", "TEST_ONLY necessary operation", "decision", "accepted"); }
    Map<String,String> fileBinding(String path) throws Exception { return Map.of("path",path,"sha256",HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(directory.resolve(path))))); }
    String sha(Object value) { return CompositionSupplementService.sha(mapper.valueToTree(value)); }
    void persist() throws Exception { review.put("supplementSha256", sha(document)); mapper.writeValue(directory.resolve("TEST_ONLY_review.json").toFile(), review); Path path = directory.resolve("DE/Gymnasium/composition-supplements/mathematik/TEST_ONLY.supplement.json"); Files.createDirectories(path.getParent()); mapper.writeValue(path.toFile(), document); }
}
