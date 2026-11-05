package com.skillpilot.backend.curriculumpackage;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionCanonicalGraphResolver;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.completion.learningunit.*;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.repository.*;
import com.skillpilot.backend.service.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Actual installed ZIP/loader/native-projector parity. No fabricated package descriptor or goal payload. */
public final class ActualInstalledLearningUnitOffers {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String ENTRY = "19b53458-3f94-5bcf-8fcd-e85444851cff";
    private static final String REPOSITORY_ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String A = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String Q = "e98672c6-871a-5d0b-889c-5afc51040f0d";

    public static void main(String[] args) throws Exception {
        if (args.length != 3) throw new IllegalArgumentException("Arguments: actual-provisioned-store repository-native-report output-report");
        Path store = Path.of(args[0]).toAbsolutePath().normalize();
        Path referencePath = Path.of(args[1]).toAbsolutePath().normalize();
        byte[] referenceBytes = Files.readAllBytes(referencePath);
        JsonNode reference = MAPPER.readTree(referenceBytes);
        require(reference.path("scopes").size() == 182, "Expected exactly182 real repository configurations");
        var properties = new CurriculumPackageProperties(); properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.getPackages().setStoreDirectory(store.toString());
        var reader = new CurriculumPackageFileReader();
        var loader = new JsonCurriculumPackageLoader(properties,
                new FileSystemCurriculumPackageRepository(properties, MAPPER, reader), reader, MAPPER);
        long start = System.nanoTime();
        var provider = new CurriculumRuntimeSnapshotProvider(loader);
        var snapshot = provider.current();
        long loadNanos = System.nanoTime() - start;
        require(snapshot.packages().size() == 1 && snapshot.packages().getFirst().capabilities().contains(LearningUnitOfferBindings.CAPABILITY),
                "Actual installed package omits exact offer capability");
        require(snapshot.landscapesById().keySet().equals(Set.of(ENTRY, MATH))
                && Set.copyOf(snapshot.rootLandscapeIds()).equals(Set.of(ENTRY, MATH)), "Actual package must install distinct Entry+unchanged Math only");
        var entryViews = snapshot.viewsById().values().stream().filter(view -> ENTRY.equals(view.landscapeId())).toList();
        require(entryViews.size() == 1, "Actual Entry must retain exactly its reviewed derived navigation view");
        var entryView = entryViews.getFirst();
        JsonNode entryViewJson = MAPPER.readTree(entryView.json());
        require(entryView.scope().equals(Map.of("schoolForm", "Gymnasium"))
                && entryViewJson.path("rootNodes").equals(MAPPER.valueToTree(List.of(Map.of("kind", "landscapeEntry", "landscapeId", MATH)))),
                "Actual Entry view changes its single unchanged Mathematics navigation target");
        var entryOfferings = snapshot.offeringsById().values().stream().filter(offer -> ENTRY.equals(offer.landscapeId())).toList();
        require(entryOfferings.size() == 1 && entryOfferings.getFirst().viewIds().equals(List.of(entryView.viewId())),
                "Actual Entry lacks its exact default offering/view binding");
        var artifactReader = new CurriculumPackageArtifactReader(reader);
        var domain = PackageCurriculumDomainState.load(snapshot, artifactReader, MAPPER);
        var mappings = new GoalMappingService(domain.mappingState(), MAPPER, domain.nativeMappingDocumentsByPackage());
        Map<String, String> nativeMappingDigests = new TreeMap<>();
        domain.nativeMappingDocumentsByPackage().values().forEach(documents -> documents.forEach((path, bytes) -> {
            try {
                String hash = digest(bytes);
                require(hash.equals(reference.path("nativeMapperInputSha256").path("curricula/" + path).asText()),
                        "Operational native input differs from actual repository execution: " + path);
                nativeMappingDigests.put(path, hash);
            } catch (java.security.NoSuchAlgorithmException unavailable) { throw new IllegalStateException(unavailable); }
            catch (Exception invalid) { throw new IllegalStateException(invalid); }
        }));
        var landscapes = new LandscapeService(MAPPER, mappings, domain);
        var views = new CompositionViewService(PackageCompositionViewState.load(snapshot, MAPPER));
        var entryResponse = new com.skillpilot.backend.ui.CompositionViewUiController(views).matchCompositionView(
                ENTRY, Map.of("landscapeId", ENTRY, "schoolForm", "Gymnasium"));
        require(entryResponse.getStatusCode().value() == 200 && entryResponse.getBody() != null
                && entryView.viewId().equals(entryResponse.getBody().get("viewId")), "Actual Entry default HTTP seam omits its exact navigation JSON");
        require(views.findEntryNavigationView(MATH, Map.of("schoolForm", "Gymnasium")) == null,
                "Direct Math must not infer a missing subject stage through entry navigation");
        require(landscapes.isPersonalizationEntryRootForSubject(ENTRY, MATH), "Installed Entry lacks its actual root/containment/preflow authority");
        require(!landscapes.isPersonalizationEntryRootForSubject(MATH, MATH), "Direct Math was incorrectly aliased to Entry");
        @SuppressWarnings("unchecked") ObjectProvider<CurriculumRuntimeSnapshotProvider> snapshots = mock(ObjectProvider.class);
        when(snapshots.getIfAvailable()).thenReturn(provider);
        long heapBefore = usedHeap(); start = System.nanoTime();
        var units = new LearningUnitApplicationService(new LandscapeProperties(), MAPPER, landscapes,
                new CompletionCanonicalGraphResolver(landscapes, MAPPER), "package", snapshots);
        long admissionNanos = System.nanoTime() - start, heapAfter = usedHeap();
        require(units.hasContracts() && units.catalog().quarantined().isEmpty(), "Actual installed frozen catalog is unavailable/quarantined");
        @SuppressWarnings("unchecked") Map<String, byte[]> pinnedSourceInputs = ReflectionTestUtils.invokeMethod(
                LearningUnitApplicationService.class, "packageInputs", snapshot, MAPPER);
        var sourceBindings = new LearningUnitPackageBindings(snapshot, pinnedSourceInputs, MAPPER);
        String currentCanonicalSource = "DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json";
        sourceBindings.validateCurrentOfferInput(currentCanonicalSource, pinnedSourceInputs.get(currentCanonicalSource));
        var learner = new Learner(); learner.setSkillpilotId("installed-offer-proof"); learner.setSelectedCurriculum(ENTRY);
        var learners = mock(LearnerRepository.class); when(learners.findById(learner.getSkillpilotId())).thenReturn(Optional.of(learner));
        when(learners.findBySkillpilotIdForUpdate(learner.getSkillpilotId())).thenReturn(Optional.of(learner));
        when(learners.existsById(learner.getSkillpilotId())).thenReturn(true);
        var outcomes = mock(MasteryRepository.class); Map<String, Double> explicit = new LinkedHashMap<>();
        when(outcomes.findByLearner_SkillpilotId(learner.getSkillpilotId())).thenAnswer(call -> explicit.entrySet().stream()
                .map(entry -> new Mastery(learner, entry.getKey(), entry.getValue())).toList());
        var states = mock(LearnerClientStateRepository.class);
        var resources = PackageCurriculumResourceState.load(snapshot, domain, artifactReader);
        var decks = new DeckResourceService(resources);
        var service = new LearnerService(learners, states, outcomes, mock(PlannedGoalRepository.class), landscapes,
                mappings, decks, MAPPER, mock(ApplicationEventPublisher.class));
        ReflectionTestUtils.setField(service, "compositionViewService", views);
        ReflectionTestUtils.setField(service, "learningUnitApplicationService", units);
        ReflectionTestUtils.setField(service, "completionCanonicalGraphResolver", new CompletionCanonicalGraphResolver(landscapes, MAPPER));
        var completionCatalog = new com.skillpilot.backend.completion.CompletionProfileCatalog(new LandscapeProperties(),
                MAPPER, landscapes, mappings, decks, true, "", "package", snapshots);
        ReflectionTestUtils.setField(service, "completionApplicationService",
                new com.skillpilot.backend.completion.CompletionApplicationService(completionCatalog));
        List<Map<String, Object>> unresolvedEntryCases = new ArrayList<>();
        for (String config : Arrays.asList(null, "{}", MAPPER.writeValueAsString(Map.of(
                ENTRY, Map.of("selected", true, "filterId", "DE-HE"), MATH, Map.of("selected", true, "filterId", "LK"))))) {
            learner.setPersonalCurriculum(config);
            var current = (LearningUnitOfferBindings.ResolvedOfferContext) ReflectionTestUtils.invokeMethod(service, "learningUnitOfferContext", learner);
            require(current.scopeKey() == null && current.targetIds().isEmpty(), "Entry without explicit stage became a subject target scope");
            require(service.getFrontier(learner.getSkillpilotId()).isEmpty(), "Entry navigation became the raw UI frontier");
            require(service.getRichFrontier(learner.getSkillpilotId()).isEmpty(), "Entry navigation became a learning frontier");
            var coach = service.getCoachLearnerState(learner.getSkillpilotId());
            require(coach.goals().personalized().total_atomic() == 0, "Coach counted unresolved Entry navigation as subject acquisition");
            require(!coach.goals().scope_completed(), "Unresolved Entry scope was reported complete");
            explicit.put(Q, 1.0); var global = service.getMasteryResponse(learner.getSkillpilotId()); explicit.clear();
            require(global.mastery().get(Q) == 1.0 && global.learningUnits().recognizedGoalIds().equals(List.of(A))
                    && "valid".equals(global.learningUnits().calculationStatus())
                    && "unresolved".equals(global.learningUnits().offerBinding().status()), "Missing stage withdrew historical global M/I");
            try { service.setActiveGoal(learner.getSkillpilotId(), A); throw new IllegalStateException("Unresolved Entry accepted direct start"); }
            catch (org.springframework.web.server.ResponseStatusException rejected) {
                require(rejected.getStatusCode().value() == 409, "Unresolved Entry direct start did not use the normal PC guard");
            }
            unresolvedEntryCases.add(Map.of("configuration", config == null ? "absent" : config.equals("{}") ? "empty" : "missing-stage",
                    "atomicTargetCount", 0, "frontierCount", 0, "rawUiFrontierCount", 0, "coachAtomicTargetCount", 0, "directStartStatus", 409,
                    "globalRecognitionPreserved", true));
        }
        List<Map<String, Object>> rows = new ArrayList<>(); Set<String> scopeIds = new LinkedHashSet<>();
        List<Map<String, String>> failures = new ArrayList<>();
        for (JsonNode row : reference.path("scopes")) {
            String scopeId = row.path("scopeId").asText(); require(scopeIds.add(scopeId), "Duplicate repository configuration");
            try {
            require(row.path("projectionResolved").asBoolean() && "valid".equals(row.path("learningUnitReadModel").path("offerBinding").path("status").asText()),
                    "Repository reference is not a valid actual native offer: " + scopeId);
            @SuppressWarnings("unchecked") Map<String, Map<String, Object>> config = MAPPER.convertValue(row.path("personalCurriculum"), Map.class);
            Map<String, Object> entryConfig = config.remove(REPOSITORY_ROOT);
            require(entryConfig != null, "Repository configuration lacks its actual root"); config.put(ENTRY, entryConfig);
            String flowKey = (String) ReflectionTestUtils.getField(CurriculumPersonalizationPlanner.class, "FLOW_STATE_CONFIG_KEY");
            String flowRootKey = (String) ReflectionTestUtils.getField(CurriculumPersonalizationPlanner.class, "ROOT_LANDSCAPE_ID_KEY");
            if (config.containsKey(flowKey)) {
                Map<String, Object> flow = new LinkedHashMap<>(config.get(flowKey));
                require(REPOSITORY_ROOT.equals(flow.get(flowRootKey)),
                        "Repository fixture flow root differs from its declared selected root");
                flow.put(flowRootKey, ENTRY);
                config.put(flowKey, flow);
            }
            learner.setPersonalCurriculum(MAPPER.writeValueAsString(config));
            Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", ENTRY,
                    learner.getPersonalCurriculum(), false);
            Set<String> allTargets = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
            Set<String> consumedViews = ReflectionTestUtils.invokeMethod(projection, "compositionViewIds");
            var context = (LearningUnitOfferBindings.ResolvedOfferContext) ReflectionTestUtils.invokeMethod(service, "learningUnitOfferContext", learner);
            require(context != null && context.scopeKey() != null && ENTRY.equals(context.scopeKey().rootLandscapeId()), "Package did not resolve its actual Entry key: " + scopeId);
            JsonNode expectedContext = row.path("nativeOfferContext");
            var expectedScope = ((com.fasterxml.jackson.databind.node.ObjectNode) expectedContext.path("scopeKey")).deepCopy(); expectedScope.put("rootLandscapeId", ENTRY);
            require(MAPPER.valueToTree(context.scopeKey()).equals(expectedScope), "Semantic scope dimensions differ: " + scopeId);
            require(context.targetIds().equals(ids(expectedContext.path("targetIds"))), "Actual native package targets differ: " + scopeId
                    + "; missing=" + difference(ids(expectedContext.path("targetIds")), context.targetIds())
                    + "; extra=" + difference(context.targetIds(), ids(expectedContext.path("targetIds")))
                    + "; actualViews=" + context.compositionViewIds() + "; expectedViews=" + expectedContext.path("compositionViewIds"));
            require(context.prerequisiteOnlyIds().equals(ids(expectedContext.path("prerequisiteOnlyIds"))), "Actual native package support differs: " + scopeId);
            require(context.compositionViewIds().equals(ids(expectedContext.path("compositionViewIds"))), "Actual native package physical views differ: " + scopeId);
            var model = units.readModel(units.evaluate(learner.getSkillpilotId(), Set.of()), context, Set.of());
            var currentOffers = (LearningUnitOfferBindings) ReflectionTestUtils.getField(units, "currentOffers");
            require("valid".equals(model.calculationStatus()) && "valid".equals(model.offerBinding().status()),
                    "Actual installed offer is unavailable: " + scopeId + "; " + currentOffers.resolve(context).failure()
                            + "; current unit readiness: " + units.catalog().currentReadinessFailures());
            require(model.recognizedGoalIds().isEmpty(), "Empty explicit mastery gained competence");
            require(MAPPER.valueToTree(model.offerBinding().rootContractRefs()).equals(row.path("learningUnitReadModel").path("offerBinding").path("rootContractRefs")),
                    "Actual selected acquisition roots differ: " + scopeId);
            Map<String, LearningGoal> effective = ReflectionTestUtils.invokeMethod(service, "completionGraph", learner, projection);
            var compiled = new CompletionProfileCompiler().compileAutomatic(effective, context.targetIds(), allTargets,
                    "actual-installed-offer-native-projection-proof");
            Map<String, List<String>> atomicR = new TreeMap<>();
            compiled.contextGoalIds().forEach(id -> atomicR.put(id, compiled.directPrerequisites(id)));
            require(MAPPER.valueToTree(atomicR).equals(row.path("atomicPrerequisites")), "Actual full atomic prerequisite graph differs: " + scopeId);
            Map<String, Object> result = new TreeMap<>(); result.put("scopeId", scopeId); result.put("actualPackageScope", context.scopeKey());
            result.put("targetCount", context.targetIds().size()); result.put("targetSetSha256", LearningUnitOfferBindings.setDigest(context.targetIds()));
            result.put("supportCount", context.prerequisiteOnlyIds().size()); result.put("supportSetSha256", LearningUnitOfferBindings.setDigest(context.prerequisiteOnlyIds()));
            result.put("physicalViewIds", new TreeSet<>(context.compositionViewIds())); result.put("rootContractRefs", model.offerBinding().rootContractRefs());
            result.put("allActuallyConsumedViewIds", new TreeSet<>(consumedViews));
            result.put("entryNavigationViewConsumed", consumedViews.contains(entryView.viewId()));
            result.put("exactActualProjectionParity", true); rows.add(result);
            } catch (RuntimeException invalid) {
                failures.add(Map.of("scopeId", scopeId, "failure", String.valueOf(invalid.getMessage())));
            }
        }
        if (!failures.isEmpty()) {
            Path diagnostic = Path.of(args[2] + ".failures.json");
            Files.createDirectories(diagnostic.toAbsolutePath().getParent());
            MAPPER.writerWithDefaultPrettyPrinter().writeValue(diagnostic.toFile(), Map.of(
                    "proof", "actual-installed-offer-native-parity-FAILED", "packageGenerationSha256", snapshot.generationSha256(),
                    "repositoryNativeReportSha256", digest(referenceBytes), "exactScopeCount", rows.size(), "failedScopeCount", failures.size(),
                    "failures", failures));
            throw new IllegalStateException("Actual installed/native parity failed in " + failures.size()
                    + " of182 configurations; exact=" + rows.size() + "; diagnostic=" + diagnostic);
        }
        explicit.put(Q, 1.0); clearInvocations(outcomes, states);
        start = System.nanoTime(); var mastery = service.getMasteryResponse(learner.getSkillpilotId()); long readNanos = System.nanoTime() - start;
        Set<String> mastered = new LinkedHashSet<>(); mastery.mastery().forEach((id, value) -> { if (com.skillpilot.backend.domain.Mastery.isMastered(value)) mastered.add(id); });
        require(mastered.equals(Set.of(Q)) && !mastery.mastery().containsKey(A)
                && mastery.learningUnits().recognizedGoalIds().equals(List.of(A)), "Actual coherent mastery does not preserve explicit Q/global I separation");
        verify(outcomes, times(1)).findByLearner_SkillpilotId(learner.getSkillpilotId());
        learner.setSelectedCurriculum(MATH);
        var direct = service.getMasteryResponse(learner.getSkillpilotId());
        require("unresolved".equals(direct.learningUnits().offerBinding().status()) && direct.learningUnits().recognizedGoalIds().equals(List.of(A)),
                "Direct Math selection invented an Entry offer or withdrew historical recognition");
        learner.setPersonalCurriculum(null);
        require(!views.isEntryNavigationDefault(MATH)
                && !service.getFilteredAtomicGoalIds(MATH, null, null, false).isEmpty(),
                "Existing direct Mathematics canonical default was incorrectly disabled with Entry navigation");
        verify(outcomes, never()).save(any()); verify(states, never()).save(any());
        require(Arrays.equals(referenceBytes, Files.readAllBytes(referencePath)), "Repository reference changed during comparison");
        Map<String, String> classBindings = new TreeMap<>();
        for (String name : List.of(JsonCurriculumPackageLoader.class.getName(), PackageCurriculumDomainState.class.getName(),
                PackageCompositionViewState.class.getName(), LearnerService.class.getName(), LandscapeService.class.getName(),
                CompositionViewService.class.getName(), com.skillpilot.backend.ui.CompositionViewUiController.class.getName(),
                GoalMappingService.class.getName(), CompletionCanonicalGraphResolver.class.getName(),
                CompletionProfileCompiler.class.getName(), LearningUnitApplicationService.class.getName(), LearningUnitOfferBindings.class.getName(),
                LearningUnitPackageBindings.class.getName(), LearningUnitCatalog.class.getName(), LearningUnitCompiler.class.getName(),
                LearningUnitEvaluator.class.getName(), LearningUnitSourceBindings.class.getName(),
                "com.skillpilot.backend.completion.learningunit.LearningUnitPackageRegistryBindings",
                "com.skillpilot.backend.completion.learningunit.LearningUnitEntryDerivation", SrsGoalCardSelection.class.getName())) {
            Class<?> type = Class.forName(name);
            try (var input = type.getResourceAsStream("/" + name.replace('.', '/') + ".class")) { classBindings.put(name, digest(input.readAllBytes())); }
        }
        Map<String, Object> report = new TreeMap<>(); report.put("schemaVersion", 1); report.put("proof", "actual-installed-learning-unit-offers-182-native-parity");
        report.put("javaVersion", System.getProperty("java.runtime.version")); report.put("javaVendor", System.getProperty("java.vendor"));
        report.put("packageStore", store.toString()); report.put("packageGenerationSha256", snapshot.generationSha256()); report.put("packages", snapshot.packages());
        report.put("repositoryNativeReportSha256", digest(referenceBytes)); report.put("repositoryNativeScopeCount", reference.path("scopes").size());
        report.put("actualPackageScopeCount", rows.size()); report.put("all182ActualNativeProjectionsEqual", true); report.put("scopes", rows);
        report.put("installedEntryView", Map.of("viewId", entryView.viewId(), "landscapeId", entryView.landscapeId(),
                "artifactPath", entryView.artifact().relativePath(), "artifactSha256", entryView.artifact().sha256(), "definition", entryViewJson));
        report.put("installedEntryDefaultOffering", entryOfferings.getFirst());
        report.put("entryNavigationController", Map.of("status", entryResponse.getStatusCode().value(),
                "viewId", entryResponse.getBody().get("viewId"), "directMathWithoutStageUnresolved", true));
        report.put("unresolvedEntryProjectionCases", unresolvedEntryCases);
        report.put("directMathCanonicalDefaultRetained", true);
        report.put("operationalNativeMappingInputSha256", nativeMappingDigests);
        List<List<String>> operationalTuples = mappings.getAllMappings().stream().map(mapping -> List.of(
                mapping.sourceLandscapeId(), mapping.targetLandscapeId(), mapping.legacyGoalId(),
                mapping.canonicalGoalId(), mapping.matchType())).sorted(Comparator.comparing(Object::toString)).toList();
        report.put("operationalNativeMappingTupleCount", operationalTuples.size());
        report.put("operationalNativeMappingTupleSha256", digest(MAPPER.writeValueAsBytes(operationalTuples)));
        report.put("compiledReviewEvidenceMappingTupleCount", domain.mappingState().mappings().size());
        report.put("admittedContractCount", units.catalog().definitions().size()); report.put("quarantinedContracts", units.catalog().quarantined());
        report.put("coherentPublicMastery", mastery); report.put("directMathOfferStatus", direct.learningUnits().offerBinding().status());
        report.put("measurement", Map.of("snapshotLoadNanos", loadNanos, "catalogAdmissionNanos", admissionNanos,
                "usedHeapBeforeAdmissionBytes", heapBefore, "usedHeapAfterAdmissionBytes", heapAfter, "onePublicMasteryReadNanos", readNanos,
                "boundary", "Local actual installed package/native service. Repositories mocked with one explicit M batch; no HTTP/SQL or host acceptance claim."));
        report.put("productionClassSha256", classBindings);
        Path output = Path.of(args[2]); Files.createDirectories(output.toAbsolutePath().getParent()); MAPPER.writerWithDefaultPrettyPrinter().writeValue(output.toFile(), report);
    }
    private static Set<String> ids(JsonNode values) { Set<String> result = new LinkedHashSet<>(); values.forEach(value -> result.add(value.asText())); return result; }
    private static Set<String> difference(Set<String> left, Set<String> right) { Set<String> result = new TreeSet<>(left); result.removeAll(right); return result; }
    private static long usedHeap() { return Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory(); }
    private static String digest(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
    private static void require(boolean condition, String message) { if (!condition) throw new IllegalStateException(message); }
}
