package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class PackageCompositionViewStateTest {

    @TempDir
    Path tempDir;

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void voluntaryOnlySectionPreservesThreeDisjointSetsAndSourceRoleProvenance() throws Exception {
        var snapshot = voluntaryFixture(false, List.of(
                Map.of("kind", "goalEntry", "goalId", "regular"),
                Map.of("kind", "goalEntry", "goalId", "support", "projectionRole", "prerequisiteOnly"),
                Map.of("kind", "structure", "id", "offers", "label", "Offers", "children", List.of(
                        Map.of("kind", "goalEntry", "goalId", "offer", "projectionRole", "voluntary"),
                        Map.of("kind", "goalEntry", "goalId", "task", "projectionRole", "voluntary")))), List.of());
        var resolved = PackageCompositionViewState.load(snapshot, mapper).resolveOffering("offering-alpha");
        assertThat(resolved.targetAtomicGoalIds()).containsExactly("regular");
        assertThat(resolved.prerequisiteOnlyAtomicGoalIds()).containsExactlyInAnyOrder("support", "implicit", "coverageOnly");
        assertThat(resolved.voluntaryAtomicGoalIds()).containsExactlyInAnyOrder("offer", "task");
        assertThat(resolved.sourceRolesByViewId().get("view-alpha")).isEqualTo(resolved.atomicRoles());
        assertThatThrownBy(() -> resolved.atomicRoles().put("offer", "target")).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> resolved.sourceRolesByViewId().get("view-alpha").put("offer", "target"))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void mandatoryClosureUsesEffectiveTargetAtomsAndInheritedPrerequisites() throws Exception {
        var dormant = voluntaryFixture(false, List.of(
                Map.of("kind", "canonicalSubtree", "goalId", "overrideRoot"),
                Map.of("kind", "goalEntry", "goalId", "support", "projectionRole", "prerequisiteOnly"),
                Map.of("kind", "goalEntry", "goalId", "offer", "projectionRole", "voluntary")), List.of());
        var resolved = PackageCompositionViewState.load(dormant, mapper).resolveOffering("offering-alpha");
        assertThat(resolved.targetAtomicGoalIds()).containsExactly("regular");
        assertThat(resolved.prerequisiteOnlyAtomicGoalIds()).containsExactlyInAnyOrder("support", "implicit");
        assertThat(resolved.voluntaryAtomicGoalIds()).containsExactly("offer");
        var inherited = voluntaryFixture(false,
                List.of(Map.of("kind", "goalEntry", "goalId", "inheritedChild")), List.of());
        var inheritedView = PackageCompositionViewState.load(inherited, mapper).resolveOffering("offering-alpha");
        assertThat(inheritedView.targetAtomicGoalIds()).containsExactly("inheritedChild");
        assertThat(inheritedView.prerequisiteOnlyAtomicGoalIds()).containsExactly("offer");
        var template = Map.<String, Object>of("kind", "goalEntry", "goalId", "support", "projectionRole", "prerequisiteOnly", "acquisitionPlacement", true);
        var repeatedTemplates = voluntaryFixture(false, List.of(
                Map.of("kind", "structure", "id", "first", "label", "First", "children", List.of(template)),
                Map.of("kind", "structure", "id", "second", "label", "Second", "children", List.of(template)),
                Map.of("kind", "goalEntry", "goalId", "offer", "projectionRole", "voluntary")), List.of());
        var templates = PackageCompositionViewState.load(repeatedTemplates, mapper).resolveOffering("offering-alpha");
        assertThat(templates.prerequisiteOnlyAtomicGoalIds()).containsExactly("support");
        assertThat(templates.voluntaryAtomicGoalIds()).containsExactly("offer");
        for (String role : List.of("target", "prerequisiteOnly")) {
            var emptyCluster = voluntaryFixture(false,
                    List.of(Map.of("kind", "goalEntry", "goalId", "emptyCluster", "projectionRole", role)), List.of());
            var empty = PackageCompositionViewState.load(emptyCluster, mapper).resolveOffering("offering-alpha");
            assertThat(empty.targetAtomicGoalIds()).isEmpty();
            assertThat(empty.prerequisiteOnlyAtomicGoalIds()).isEmpty();
        }
    }

    @Test
    void voluntaryMergeKeepsRequiredRoleAndOriginalRolesInBothSourceOrders() throws Exception {
        var offer = Map.<String, Object>of("kind", "goalEntry", "goalId", "offer", "projectionRole", "voluntary");
        var task = Map.<String, Object>of("kind", "goalEntry", "goalId", "task", "projectionRole", "voluntary");
        var target = Map.<String, Object>of("kind", "goalEntry", "goalId", "offer");
        for (boolean reverse : List.of(false, true)) {
            var snapshot = voluntaryFixture(true, reverse ? List.of(target) : List.of(offer, task),
                    reverse ? List.of(offer, task) : List.of(target));
            var resolved = PackageCompositionViewState.load(snapshot, mapper).resolveOffering("offering-alpha");
            assertThat(resolved.targetAtomicGoalIds()).containsExactly("offer");
            assertThat(resolved.voluntaryAtomicGoalIds()).containsExactly("task");
            assertThat(resolved.sourceRolesByViewId().get(reverse ? "view-alpha-secondary" : "view-alpha"))
                    .containsEntry("offer", "voluntary");
            assertThat(resolved.sourceRolesByViewId().get(reverse ? "view-alpha" : "view-alpha-secondary"))
                    .containsEntry("offer", "target");
        }
        var snapshot = voluntaryFixture(true,
                List.of(Map.of("kind", "goalEntry", "goalId", "dependent")), List.of(offer));
        var resolved = PackageCompositionViewState.load(snapshot, mapper).resolveOffering("offering-alpha");
        assertThat(resolved.targetAtomicGoalIds()).containsExactly("dependent");
        assertThat(resolved.prerequisiteOnlyAtomicGoalIds()).containsExactlyInAnyOrder("offer", "support");
        assertThat(resolved.voluntaryAtomicGoalIds()).isEmpty();
        assertThat(resolved.sourceRolesByViewId().get("view-alpha-secondary")).containsEntry("offer", "voluntary");
    }

    @Test
    void voluntaryContractRejectsDuplicateAndOpaquePlacesRolesAndMandatoryDependencies() throws Exception {
        var offer = Map.<String, Object>of("kind", "goalEntry", "goalId", "offer", "projectionRole", "voluntary");
        for (var nodes : List.of(
                List.of(offer, offer),
                List.of(offer, Map.<String, Object>of("kind", "canonicalSubtree", "goalId", "all")),
                List.of(offer, Map.<String, Object>of("kind", "goalEntry", "goalId", "offer", "projectionRole", "prerequisiteOnly")),
                List.of(offer, Map.<String, Object>of("kind", "goalEntry", "goalId", "all")),
                List.of(Map.<String, Object>of("kind", "goalEntry", "goalId", "all", "projectionRole", "voluntary")),
                List.of(Map.<String, Object>of("kind", "goalEntry", "goalId", "emptyCluster", "projectionRole", "voluntary")),
                List.of(Map.<String, Object>of("kind", "goalEntry", "goalId", "offer", "projectionRole", "voluntary", "acquisitionPlacement", true)),
                List.of(offer, Map.<String, Object>of("kind", "goalEntry", "goalId", "dependent")),
                List.of(offer, Map.<String, Object>of("kind", "goalEntry", "goalId", "coverageDependent")),
                List.of(offer, Map.<String, Object>of("kind", "goalEntry", "goalId", "inheritedChild")),
                List.of(offer, Map.<String, Object>of("kind", "goalEntry", "goalId", "task")))) {
            var snapshot = voluntaryFixture(false, nodes, List.of());
            assertThatThrownBy(() -> PackageCompositionViewState.load(snapshot, mapper))
                    .as(nodes.toString()).isInstanceOf(CurriculumPackageException.class);
        }
    }

    @Test
    void nationalMergePreservesRequiredDominanceAndEachSourceRoleWithoutActivatingOptionalPaths() throws Exception {
        var offer = Map.<String, Object>of("kind", "goalEntry", "goalId", "offer", "projectionRole", "voluntary");
        var he = List.<Map<String, Object>>of(Map.of("kind", "structure", "id", "he-offers", "label", "HE", "children", List.of(offer)));
        var ni = List.<Map<String, Object>>of(Map.of("kind", "structure", "id", "ni-offers", "label", "NI", "children", List.of(offer)));
        var allVoluntary = asNationalMerge(voluntaryFixture(true, he, ni));
        var voluntary = PackageCompositionViewState.load(allVoluntary, mapper).resolveOffering("offering-alpha");
        assertThat(voluntary.targetAtomicGoalIds()).isEmpty();
        assertThat(voluntary.voluntaryAtomicGoalIds()).containsExactly("offer");
        assertThat(voluntary.sourceRolesByViewId().values()).allSatisfy(roles -> assertThat(roles).containsEntry("offer", "voluntary"));
        assertThat(voluntary.document().get("rootNodes").toString()).doesNotContain("ni-offers");
        var optionalPath = asNationalMerge(voluntaryFixture(true,
                List.of(Map.of("kind", "goalEntry", "goalId", "task", "projectionRole", "voluntary")), ni));
        var dormant = PackageCompositionViewState.load(optionalPath, mapper).resolveOffering("offering-alpha");
        assertThat(dormant.targetAtomicGoalIds()).isEmpty();
        assertThat(dormant.voluntaryAtomicGoalIds()).containsExactlyInAnyOrder("offer", "task");
        assertThat(dormant.sourceRolesByViewId().get("view-alpha")).containsEntry("offer", "prerequisiteOnly");

        var requiredSnapshot = asNationalMerge(voluntaryFixture(true,
                List.of(Map.of("kind", "goalEntry", "goalId", "dependent")), ni));
        var required = PackageCompositionViewState.load(requiredSnapshot, mapper).resolveOffering("offering-alpha");
        assertThat(required.targetAtomicGoalIds()).containsExactly("dependent");
        assertThat(required.prerequisiteOnlyAtomicGoalIds()).containsExactlyInAnyOrder("support", "offer");
        assertThat(required.voluntaryAtomicGoalIds()).isEmpty();
        assertThat(required.sourceRolesByViewId().get("view-alpha-secondary")).containsEntry("offer", "voluntary");

        var targetSnapshot = asNationalMerge(voluntaryFixture(true, he,
                List.of(Map.of("kind", "goalEntry", "goalId", "offer"))));
        var target = PackageCompositionViewState.load(targetSnapshot, mapper).resolveOffering("offering-alpha");
        assertThat(target.targetAtomicGoalIds()).containsExactly("offer");
        assertThat(target.voluntaryAtomicGoalIds()).isEmpty();
        assertThat(target.sourceRolesByViewId().get("view-alpha")).containsEntry("offer", "voluntary");
        assertThat(target.sourceRolesByViewId().get("view-alpha-secondary")).containsEntry("offer", "target");
    }

    private CurriculumRuntimeSnapshot asNationalMerge(CurriculumRuntimeSnapshot snapshot) throws Exception {
        var original = snapshot.packages().getFirst();
        var dimensions = new java.util.ArrayList<>(original.scopeDimensions());
        dimensions.add(new CurriculumRuntimeSnapshot.ScopeDimension("jurisdiction", List.of("DE-HE", "DE-NI", "DE"),
                List.of(new CurriculumRuntimeSnapshot.ScopeComposite("DE", List.of("DE-HE", "DE-NI")))));
        var descriptor = new CurriculumRuntimeSnapshot.PackageDescriptor(original.packageId(), original.packageVersion(), original.releaseId(),
                original.outerZipSha256(), original.manifestSha256(), original.contentDigest(), original.closureDigest(), original.definitionIndexDigest(),
                dimensions, original.capabilities());
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>();
        for (var view : snapshot.viewsById().values()) {
            var scope = new LinkedHashMap<>(view.scope());
            scope.put("courseProfile", "GK");
            scope.put("jurisdiction", view.viewId().equals("view-alpha") ? "DE-HE" : "DE-NI");
            Map<String, Object> document = mapper.readValue(view.json(), new TypeReference<>() {});
            document.put("scope", scope);
            views.put(view.viewId(), new CurriculumRuntimeSnapshot.ViewDescriptor(view.packageId(), view.viewId(), view.landscapeId(),
                    view.language(), scope, view.artifact(), mapper.writeValueAsString(document)));
        }
        var old = snapshot.offeringsById().get("offering-alpha");
        var scope = new LinkedHashMap<>(old.scope());
        scope.put("courseProfile", "GK"); scope.put("jurisdiction", "DE");
        var offering = new CurriculumRuntimeSnapshot.OfferingDescriptor(old.packageId(), old.offeringId(), old.landscapeId(), scope,
                "merge", "jurisdiction", old.viewIds());
        return new CurriculumRuntimeSnapshot(snapshot.generationSha256(), List.of(descriptor), snapshot.rootLandscapeIds(), snapshot.landscapesById(),
                views, Map.of(offering.offeringId(), offering), snapshot.decksByKey(), snapshot.resourcesById(), snapshot.resourcesByPublicUrl(),
                snapshot.artifactsByKey(), snapshot.migrationAliasesJsonByPackageId(), snapshot.definitionCount());
    }

    private CurriculumRuntimeSnapshot voluntaryFixture(boolean merge, List<Map<String, Object>> first,
            List<Map<String, Object>> second) throws Exception {
        var snapshot = load(merge ? mergeSpec() : CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        var original = snapshot.landscapesById().get("landscape-alpha");
        String landscapeJson = mapper.writeValueAsString(Map.of("landscapeId", original.landscapeId(), "goals", List.of(
                Map.of("id", "all", "contains", List.of("regular", "support", "implicit", "offer", "task", "dependent", "coverageOnly", "coverageDependent", "inherited")),
                Map.of("id", "regular", "requires", List.of("implicit")),
                Map.of("id", "support", "requires", List.of("offer")), Map.of("id", "implicit"), Map.of("id", "offer"),
                Map.of("id", "task", "requires", List.of("support", "coverageOnly"), "examData", Map.of("coveredGoalIds", List.of("offer"))),
                Map.of("id", "coverageOnly", "examData", Map.of("coveredGoalIds", List.of("offer"))),
                Map.of("id", "coverageDependent", "requires", List.of("coverageOnly")),
                Map.of("id", "inherited", "contains", List.of("inheritedChild"), "requires", List.of("offer")),
                Map.of("id", "inheritedChild"),
                Map.of("id", "overrideRoot", "contains", List.of("regular", "support")),
                Map.of("id", "emptyCluster", "type", "cluster", "contains", List.of()),
                Map.of("id", "dependent", "requires", List.of("support", "offer")))));
        var landscape = new CurriculumRuntimeSnapshot.LandscapeDescriptor(original.packageId(), original.landscapeId(),
                original.role(), original.locale(), original.frameworkId(), original.subject(), original.country(), original.region(),
                original.schoolForm(), original.defaultOfferingId(), original.parentLandscapeId(), original.artifact(), landscapeJson);
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>();
        for (var view : snapshot.viewsById().values()) {
            String json = mapper.writeValueAsString(Map.of("$schema", "https://skillpilot.com/schemas/curriculum-package/v1.4/runtime-composition-view.schema.json",
                    "viewFormatVersion", "1.3", "language", view.language(), "viewId", view.viewId(), "landscapeId", view.landscapeId(),
                    "scope", view.scope(), "rootNodes", view.viewId().equals("view-alpha") ? first : second));
            views.put(view.viewId(), new CurriculumRuntimeSnapshot.ViewDescriptor(view.packageId(), view.viewId(), view.landscapeId(),
                    view.language(), view.scope(), view.artifact(), json));
        }
        return copy(snapshot, Map.of(landscape.landscapeId(), landscape), views, snapshot.offeringsById());
    }

    @Test
    void resolvesOnlyTheExactPublishedScopeAndKeepsDocumentsImmutable() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));

        PackageCompositionViewState state = PackageCompositionViewState.load(snapshot, mapper);

        assertThat(state.generationSha256()).isEqualTo(snapshot.generationSha256());
        assertThat(state.isManagedLandscape("landscape-alpha")).isTrue();
        assertThat(state.viewsById()).containsOnlyKeys("view-alpha");
        assertThat(state.offeringsById()).containsOnlyKeys("offering-alpha");
        assertThat(state.offeringsByScope()).hasSize(1);
        assertThat(state.defaultOfferingsByLandscapeId()).containsOnlyKeys("landscape-alpha");
        assertThat(state.resolveDefault("landscape-alpha"))
                .extracting(PackageCompositionViewState.ResolvedView::runtimeViewId)
                .isEqualTo("view-alpha");
        assertThat(state.resolveDocument(
                        "landscape-alpha",
                        Map.of("schoolForm", "Gymnasium", "courseProfile", "GK")))
                .containsEntry("viewId", "view-alpha");
        assertThat(state.resolve(
                        "landscape-alpha",
                        Map.of("schoolForm", "Gymnasium", "courseProfile", "gk")))
                .isNull();
        assertThat(state.resolve(
                        "landscape-alpha",
                        Map.of("schoolForm", "Gymnasium", "courseProfile", "GK", "extra", "value")))
                .isNull();
        assertThat(state.findViewById("merged:view-alpha+view-beta")).isNull();
        assertThatThrownBy(() -> state.findViewDocumentById("view-alpha").put("poison", true))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> ((List<?>) state.findViewDocumentById("view-alpha").get("rootNodes"))
                        .add(null))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void resolvesOnlyExplicitCompositeMergeInDeclaredMemberOrder() throws Exception {
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.PackageSpec merge = new CurriculumPackageTestFixture.PackageSpec(
                base.suffix(),
                base.packageId(),
                base.landscapeId(),
                base.hashCharacter(),
                base.closureHashCharacter(),
                base.indexHashCharacter(),
                base.definitionKey(),
                base.definitionOwner(),
                base.definitionDigest(),
                base.moduleLandscapeId(),
                true,
                base.externalUrlScheme());
        PackageCompositionViewState state = PackageCompositionViewState.load(load(merge), mapper);

        PackageCompositionViewState.ResolvedView resolved = state.resolveOffering("offering-alpha");

        assertThat(resolved.resolutionMode()).isEqualTo("merge");
        assertThat(resolved.sourceViewIds())
                .containsExactly("view-alpha", "view-alpha-secondary");
        assertThat(resolved.runtimeViewId()).startsWith("offering-view:");
        assertThat(resolved.document())
                .containsEntry("viewId", resolved.runtimeViewId())
                .containsEntry("mergedFromViewIds", resolved.sourceViewIds());
        assertThat(state.findViewById(resolved.runtimeViewId())).isEqualTo(resolved);
        assertThat(state.resolve(
                        "landscape-alpha",
                        Map.of("schoolForm", "Gymnasium", "courseProfile", "GK")))
                .isNull();
    }

    @Test
    void runtimePartialOrderMergePreservesItsOwnSchemaLanguageAndAcquisitionMarkers() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(mergeSpec());
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = runtimePartialOrderViews(snapshot);
        PackageCompositionViewState state = PackageCompositionViewState.load(
                copy(snapshot, views, snapshot.offeringsById()), mapper);
        var resolved = state.resolveOffering("offering-alpha");
        for (Map<String, Object> document : List.of(resolved.document(), state.findViewDocumentById(resolved.runtimeViewId()))) {
            assertThat(document).containsEntry("viewFormatVersion", "1.2").containsEntry("language", "de-DE")
                    .containsEntry("$schema", "https://skillpilot.com/schemas/curriculum-package/v1.3/runtime-composition-view.schema.json");
            assertThat(document.get("rootNodes").toString()).contains("acquisitionPlacement=true");
            assertThatThrownBy(() -> document.put("language", "en"))
                    .isInstanceOf(UnsupportedOperationException.class);
        }
    }

    @Test
    void runtimePartialOrderMergeRejectsUnknownMixedAndSourceOnlyFormatEnvelopes() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(mergeSpec());
        for (String mutation : List.of("old-version", "unknown-version", "source-schema", "unknown-schema", "missing-language", "wrong-language-type")) {
            Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = runtimePartialOrderViews(snapshot);
            var original = views.get("view-alpha-secondary");
            Map<String, Object> document = mapper.readValue(original.json(), new TypeReference<>() {});
            switch (mutation) {
                case "old-version" -> document.put("viewFormatVersion", "1.0");
                case "unknown-version" -> document.put("viewFormatVersion", "9.9");
                case "source-schema" -> document.put("$schema", "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json");
                case "unknown-schema" -> document.put("$schema", "https://example.invalid/view.schema.json");
                case "missing-language" -> document.remove("language");
                case "wrong-language-type" -> document.put("language", 42);
                default -> throw new AssertionError(mutation);
            }
            views.put(original.viewId(), new CurriculumRuntimeSnapshot.ViewDescriptor(
                    original.packageId(), original.viewId(), original.landscapeId(), original.language(),
                    original.scope(), original.artifact(), mapper.writeValueAsString(document)));
            assertThatThrownBy(() -> PackageCompositionViewState.load(copy(snapshot, views, snapshot.offeringsById()), mapper))
                    .as(mutation).isInstanceOf(CurriculumPackageException.class);
        }
    }

    private Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> runtimePartialOrderViews(CurriculumRuntimeSnapshot snapshot) throws Exception {
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>();
        for (var original : snapshot.viewsById().values()) {
            String document = mapper.writeValueAsString(Map.of(
                    "$schema", "https://skillpilot.com/schemas/curriculum-package/v1.3/runtime-composition-view.schema.json",
                    "viewFormatVersion", "1.2", "language", original.language(),
                    "viewId", original.viewId(), "landscapeId", original.landscapeId(), "scope", original.scope(),
                    "rootNodes", List.of(Map.of("kind", "structure", "id", "topic", "label", "Topic", "children", List.of(
                            Map.of("kind", "goalEntry", "goalId", "goal-alpha"),
                            Map.of("kind", "goalEntry", "goalId", "unmapped-goal-alpha", "projectionRole", "prerequisiteOnly", "acquisitionPlacement", true))))));
            views.put(original.viewId(), new CurriculumRuntimeSnapshot.ViewDescriptor(
                    original.packageId(), original.viewId(), original.landscapeId(), original.language(),
                    original.scope(), original.artifact(), document));
        }
        return views;
    }

    private static CurriculumPackageTestFixture.PackageSpec mergeSpec() {
        var base = CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        return new CurriculumPackageTestFixture.PackageSpec(base.suffix(), base.packageId(), base.landscapeId(),
                base.hashCharacter(), base.closureHashCharacter(), base.indexHashCharacter(), base.definitionKey(),
                base.definitionOwner(), base.definitionDigest(), base.moduleLandscapeId(), true, base.externalUrlScheme());
    }

    @Test
    void deduplicatesVisibleGoalAcrossProfileEquivalentMergeBranches() throws Exception {
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.PackageSpec merge = new CurriculumPackageTestFixture.PackageSpec(
                base.suffix(),
                base.packageId(),
                base.landscapeId(),
                base.hashCharacter(),
                base.closureHashCharacter(),
                base.indexHashCharacter(),
                base.definitionKey(),
                base.definitionOwner(),
                base.definitionDigest(),
                base.moduleLandscapeId(),
                true,
                base.externalUrlScheme());
        CurriculumRuntimeSnapshot snapshot = load(merge);
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.ViewDescriptor descriptor : snapshot.viewsById().values()) {
            boolean isLk = descriptor.viewId().endsWith("secondary");
            String structureId = isLk ? "branch-lk" : "branch-gk";
            String goalKind = isLk ? "canonicalSubtree" : "goalEntry";
            String document = mapper.writeValueAsString(Map.of(
                    "viewId", descriptor.viewId(),
                    "landscapeId", descriptor.landscapeId(),
                    "scope", descriptor.scope(),
                    "rootNodes", List.of(Map.of(
                            "kind", "structure",
                            "id", structureId,
                            "children", List.of(Map.of("kind", goalKind, "goalId", "goal-alpha"))))));
            views.put(descriptor.viewId(), new CurriculumRuntimeSnapshot.ViewDescriptor(
                    descriptor.packageId(),
                    descriptor.viewId(),
                    descriptor.landscapeId(),
                    descriptor.language(),
                    descriptor.scope(),
                    descriptor.artifact(),
                    document));
        }

        PackageCompositionViewState state = PackageCompositionViewState.load(
                copy(snapshot, views, snapshot.offeringsById()), mapper);
        PackageCompositionViewState.ResolvedView resolved = state.resolveOffering("offering-alpha");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rootNodes =
                (List<Map<String, Object>>) resolved.document().get("rootNodes");
        assertThat(rootNodes).singleElement().satisfies(root -> {
            assertThat(root).containsEntry("id", "branch-gk-lk");
            assertThat((List<?>) root.get("children"))
                    .singleElement()
                    .satisfies(child -> {
                        assertThat(((Map<?, ?>) child).get("kind")).isEqualTo("canonicalSubtree");
                        assertThat(((Map<?, ?>) child).get("goalId")).isEqualTo("goal-alpha");
                    });
        });
    }

    @ParameterizedTest
    @ValueSource(strings = {"subtree", "leaf", "excludedLeaf"})
    void deduplicatesStrictlyContainedSiblingReferenceAcrossCourseProfiles(String gkReference) throws Exception {
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.PackageSpec merge = new CurriculumPackageTestFixture.PackageSpec(
                base.suffix(),
                base.packageId(),
                base.landscapeId(),
                base.hashCharacter(),
                base.closureHashCharacter(),
                base.indexHashCharacter(),
                base.definitionKey(),
                base.definitionOwner(),
                base.definitionDigest(),
                base.moduleLandscapeId(),
                true,
                base.externalUrlScheme());
        CurriculumRuntimeSnapshot snapshot = load(merge);

        CurriculumRuntimeSnapshot.LandscapeDescriptor originalLandscape =
                snapshot.landscapesById().get("landscape-alpha");
        String landscapeJson = mapper.writeValueAsString(Map.of(
                "landscapeId", originalLandscape.landscapeId(),
                "goals", List.of(
                        Map.of("id", "broad-goal", "contains", List.of("narrow-goal")),
                        Map.of("id", "narrow-goal", "contains", List.of()))));
        CurriculumRuntimeSnapshot.LandscapeDescriptor landscape =
                new CurriculumRuntimeSnapshot.LandscapeDescriptor(
                        originalLandscape.packageId(),
                        originalLandscape.landscapeId(),
                        originalLandscape.role(),
                        originalLandscape.locale(),
                        originalLandscape.frameworkId(),
                        originalLandscape.subject(),
                        originalLandscape.country(),
                        originalLandscape.region(),
                        originalLandscape.schoolForm(),
                        originalLandscape.defaultOfferingId(),
                        originalLandscape.parentLandscapeId(),
                        originalLandscape.artifact(),
                        landscapeJson);

        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.ViewDescriptor descriptor : snapshot.viewsById().values()) {
            boolean isLk = descriptor.viewId().endsWith("secondary");
            List<Map<String, Object>> references = "excludedLeaf".equals(gkReference) && !isLk
                    ? List.of(
                            Map.of("kind", "canonicalSubtree", "goalId", "broad-goal"),
                            Map.of("kind", "goalEntry", "goalId", "narrow-goal", "projectionRole", "prerequisiteOnly"))
                    : List.of(Map.of(
                            "kind", !isLk && "leaf".equals(gkReference) ? "goalEntry" : "canonicalSubtree",
                            "goalId", isLk ? "broad-goal" : "narrow-goal"));
            String document = mapper.writeValueAsString(Map.of(
                    "viewId", descriptor.viewId(),
                    "landscapeId", descriptor.landscapeId(),
                    "scope", descriptor.scope(),
                    "rootNodes", List.of(Map.of(
                            "kind", "structure",
                            "id", isLk ? "branch-lk" : "branch-gk",
                            "children", references))));
            views.put(descriptor.viewId(), new CurriculumRuntimeSnapshot.ViewDescriptor(
                    descriptor.packageId(),
                    descriptor.viewId(),
                    descriptor.landscapeId(),
                    descriptor.language(),
                    descriptor.scope(),
                    descriptor.artifact(),
                    document));
        }

        CurriculumRuntimeSnapshot candidate = copy(
                snapshot,
                Map.of(landscape.landscapeId(), landscape),
                views,
                snapshot.offeringsById());
        PackageCompositionViewState state = PackageCompositionViewState.load(candidate, mapper);
        PackageCompositionViewState.ResolvedView resolved = state.resolveOffering("offering-alpha");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rootNodes =
                (List<Map<String, Object>>) resolved.document().get("rootNodes");
        assertThat(rootNodes).singleElement().satisfies(root -> {
            assertThat(root).containsEntry("id", "branch-gk-lk");
            assertThat((List<?>) root.get("children"))
                    .singleElement()
                    .satisfies(child -> {
                        assertThat(((Map<?, ?>) child).get("kind"))
                                .isEqualTo("canonicalSubtree");
                        assertThat(((Map<?, ?>) child).get("goalId"))
                                .isEqualTo("broad-goal");
                    });
        });
    }

    @Test
    void mergesSameGoalAcrossProjectionRolesWithTargetDominance() throws Exception {
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.PackageSpec merge = new CurriculumPackageTestFixture.PackageSpec(
                base.suffix(),
                base.packageId(),
                base.landscapeId(),
                base.hashCharacter(),
                base.closureHashCharacter(),
                base.indexHashCharacter(),
                base.definitionKey(),
                base.definitionOwner(),
                base.definitionDigest(),
                base.moduleLandscapeId(),
                true,
                base.externalUrlScheme());
        CurriculumRuntimeSnapshot snapshot = load(merge);
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.ViewDescriptor descriptor : snapshot.viewsById().values()) {
            Map<String, Object> node = new LinkedHashMap<>();
            node.put("kind", "goalEntry");
            node.put("goalId", "goal-alpha");
            if (!descriptor.viewId().endsWith("secondary")) {
                node.put("projectionRole", "prerequisiteOnly");
            }
            String document = mapper.writeValueAsString(Map.of(
                    "viewId", descriptor.viewId(),
                    "landscapeId", descriptor.landscapeId(),
                    "scope", descriptor.scope(),
                    "rootNodes", List.of(node)));
            views.put(descriptor.viewId(), new CurriculumRuntimeSnapshot.ViewDescriptor(
                    descriptor.packageId(),
                    descriptor.viewId(),
                    descriptor.landscapeId(),
                    descriptor.language(),
                    descriptor.scope(),
                    descriptor.artifact(),
                    document));
        }

        PackageCompositionViewState state = PackageCompositionViewState.load(
                copy(snapshot, views, snapshot.offeringsById()), mapper);
        PackageCompositionViewState.ResolvedView resolved = state.resolveOffering("offering-alpha");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rootNodes =
                (List<Map<String, Object>>) resolved.document().get("rootNodes");
        assertThat(rootNodes).singleElement()
                .satisfies(node -> assertThat(node)
                        .containsEntry("goalId", "goal-alpha")
                        .containsEntry("projectionRole", "target"));
    }

    @Test
    void allowsSameGoalOncePerProjectionRoleWithinOneView() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumRuntimeSnapshot.ViewDescriptor original = snapshot.viewsById().get("view-alpha");
        String document = mapper.writeValueAsString(Map.of(
                "viewId", original.viewId(),
                "landscapeId", original.landscapeId(),
                "scope", original.scope(),
                "rootNodes", List.of(
                        Map.of(
                                "kind", "goalEntry",
                                "goalId", "goal-alpha",
                                "projectionRole", "target"),
                        Map.of(
                                "kind", "goalEntry",
                                "goalId", "goal-alpha",
                                "projectionRole", "prerequisiteOnly"))));
        CurriculumRuntimeSnapshot.ViewDescriptor view = new CurriculumRuntimeSnapshot.ViewDescriptor(
                original.packageId(),
                original.viewId(),
                original.landscapeId(),
                original.language(),
                original.scope(),
                original.artifact(),
                document);

        PackageCompositionViewState state = PackageCompositionViewState.load(
                copy(snapshot, Map.of(original.viewId(), view), snapshot.offeringsById()), mapper);

        assertThat(state.viewsById()).containsKey(original.viewId());
    }

    @ParameterizedTest
    @ValueSource(strings = {"goalEntry", "canonicalSubtree"})
    void allowsOverlappingPrerequisiteReferencesWithoutAddingVisiblePlacements(String referenceKind) throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumRuntimeSnapshot.ViewDescriptor original = snapshot.viewsById().get("view-alpha");
        List<Map<String, String>> nodes = List.of(
                Map.of("kind", "canonicalSubtree", "goalId", "goal-alpha", "projectionRole", "prerequisiteOnly"),
                Map.of("kind", referenceKind, "goalId", "goal-alpha", "projectionRole", "prerequisiteOnly"),
                Map.of("kind", "goalEntry", "goalId", "goal-alpha", "projectionRole", "target"));
        String document = mapper.writeValueAsString(Map.of(
                "viewId", original.viewId(),
                "landscapeId", original.landscapeId(),
                "scope", original.scope(),
                "rootNodes", nodes));
        CurriculumRuntimeSnapshot.ViewDescriptor view = new CurriculumRuntimeSnapshot.ViewDescriptor(
                original.packageId(), original.viewId(), original.landscapeId(), original.language(),
                original.scope(), original.artifact(), document);

        PackageCompositionViewState state = PackageCompositionViewState.load(
                copy(snapshot, Map.of(original.viewId(), view), snapshot.offeringsById()), mapper);

        assertThat(state.resolveDefault(original.landscapeId()).document().get("rootNodes"))
                .isEqualTo(nodes);
    }

    @Test
    void loadsAllCurrentMathViewsAndExactCourseProfileOfferings() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        Path curricula = Path.of("../curricula/DE/Gymnasium");
        String landscapeJson = Files.readString(curricula.resolve(
                "canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json"));
        String landscapeId = mapper.readTree(landscapeJson).path("landscapeId").asText();
        var originalPackage = snapshot.packages().getFirst();
        var originalView = snapshot.viewsById().get("view-alpha");
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>();
        Map<String, CurriculumRuntimeSnapshot.OfferingDescriptor> offerings = new LinkedHashMap<>();
        Map<String, Set<String>> dimensionValues = new LinkedHashMap<>();
        Map<Map<String, String>, Map<String, String>> profilePairs = new LinkedHashMap<>();
        try (var files = Files.list(curricula.resolve("composition-views/mathematik"))) {
            for (Path file : files.filter(path -> path.toString().endsWith(".view.json")).sorted().toList()) {
                String document = Files.readString(file);
                JsonNode authoredView = mapper.readTree(document);
                if ("1.2".equals(authoredView.path("viewFormatVersion").asText())) {
                    // This resolver fixture uses source nodes, but its package
                    // envelope must match the real compiler's registered runtime
                    // component. Closed payload projection is tested in Python.
                    ObjectNode runtime = authoredView.deepCopy();
                    runtime.put("$schema", "https://skillpilot.com/schemas/curriculum-package/v1.3/runtime-composition-view.schema.json");
                    runtime.put("language", originalView.language());
                    stripSourceOnlyViewFixtureFields(runtime.path("rootNodes"));
                    document = mapper.writeValueAsString(runtime);
                }
                String viewId = authoredView.path("viewId").asText();
                Map<String, String> scope = mapper.convertValue(authoredView.get("scope"), new TypeReference<>() { });
                assertThat(authoredView.path("landscapeId").asText()).isEqualTo(landscapeId);
                views.put(viewId, new CurriculumRuntimeSnapshot.ViewDescriptor(
                        originalPackage.packageId(), viewId, landscapeId, originalView.language(), scope,
                        originalView.artifact(), document));
                String offeringId = "single:" + viewId;
                offerings.put(offeringId, new CurriculumRuntimeSnapshot.OfferingDescriptor(
                        originalPackage.packageId(), offeringId, landscapeId, scope, "single", null, List.of(viewId)));
                scope.forEach((key, value) -> dimensionValues.computeIfAbsent(
                        key, ignored -> new LinkedHashSet<>()).add(value));
                Map<String, String> commonScope = new LinkedHashMap<>(scope);
                String profile = commonScope.remove("courseProfile");
                if ("GK".equals(profile) || "LK".equals(profile)) {
                    assertThat(profilePairs.computeIfAbsent(Map.copyOf(commonScope), ignored -> new LinkedHashMap<>())
                            .put(profile, viewId)).as("Unique profile in %s", commonScope).isNull();
                }
            }
        }
        for (var pair : profilePairs.entrySet()) {
            if (!pair.getValue().keySet().equals(Set.of("GK", "LK"))) {
                continue;
            }
            Map<String, String> combinedScope = new LinkedHashMap<>(pair.getKey());
            combinedScope.put("courseProfile", "GK+LK");
            List<String> sourceViewIds = List.of(pair.getValue().get("GK"), pair.getValue().get("LK"));
            String offeringId = "combined:" + sourceViewIds.getFirst();
            offerings.put(offeringId, new CurriculumRuntimeSnapshot.OfferingDescriptor(
                    originalPackage.packageId(), offeringId, landscapeId, combinedScope,
                    "merge", "courseProfile", sourceViewIds));
        }
        dimensionValues.get("courseProfile").add("GK+LK");
        var descriptor = new CurriculumRuntimeSnapshot.PackageDescriptor(
                originalPackage.packageId(), originalPackage.packageVersion(), originalPackage.releaseId(),
                originalPackage.outerZipSha256(), originalPackage.manifestSha256(), originalPackage.contentDigest(),
                originalPackage.closureDigest(), originalPackage.definitionIndexDigest(),
                dimensionValues.entrySet().stream().map(entry -> new CurriculumRuntimeSnapshot.ScopeDimension(
                        entry.getKey(), List.copyOf(entry.getValue()), "courseProfile".equals(entry.getKey())
                                ? List.of(new CurriculumRuntimeSnapshot.ScopeComposite("GK+LK", List.of("GK", "LK")))
                                : List.of())).toList(),
                originalPackage.capabilities());
        var originalLandscape = snapshot.landscapesById().get("landscape-alpha");
        var landscape = new CurriculumRuntimeSnapshot.LandscapeDescriptor(
                descriptor.packageId(), landscapeId, originalLandscape.role(), originalLandscape.locale(),
                originalLandscape.frameworkId(), originalLandscape.subject(), originalLandscape.country(),
                originalLandscape.region(), originalLandscape.schoolForm(), offerings.keySet().iterator().next(), null,
                originalLandscape.artifact(), landscapeJson);
        var candidate = new CurriculumRuntimeSnapshot(
                snapshot.generationSha256(), List.of(descriptor), List.of(landscapeId), Map.of(landscapeId, landscape),
                views, offerings, snapshot.decksByKey(), snapshot.resourcesById(),
                snapshot.resourcesByPublicUrl(), snapshot.artifactsByKey(), snapshot.migrationAliasesJsonByPackageId(),
                snapshot.definitionCount());

        PackageCompositionViewState state = PackageCompositionViewState.load(candidate, mapper);

        int expectedViewCount = mapper.readTree(Files.readString(Path.of(
                "../contracts/curriculum-package/v1.3/profiles/de-gymnasium-mathematik-release-model-v1.3.profile.json")))
                .path("expectedCounts").path("views").asInt();
        long expectedCompositeCount = profilePairs.values().stream()
                .filter(pair -> pair.keySet().equals(Set.of("GK", "LK"))).count();
        assertThat(state.viewsById()).hasSize(expectedViewCount);
        assertThat(state.offeringsById()).hasSize(expectedViewCount + (int) expectedCompositeCount);
        for (var offering : offerings.values()) {
            var resolved = state.resolveOffering(offering.offeringId());
            assertThat(resolved).as(offering.offeringId())
                    .isEqualTo(state.resolve(landscapeId, offering.scope()));
            assertThat(resolved.sourceViewIds()).containsExactlyElementsOf(offering.viewIds());
        }
        for (var view : views.values()) {
            JsonNode resolvedView = mapper.valueToTree(state.findViewDocumentById(view.viewId()));
            assertThat(resolvedView)
                    .as("Unchanged package-envelope fixture %s", view.viewId()).isEqualTo(mapper.readTree(view.json()));
        }
    }

    private static void stripSourceOnlyViewFixtureFields(JsonNode nodes) {
        for (JsonNode node : nodes) {
            if (!(node instanceof ObjectNode object)) continue;
            if ("structure".equals(object.path("kind").asText())) {
                object.remove(List.of("canonicalSourceGoalId", "canonicalSourceNode", "canonicalSourcePhase",
                        "placementEvidence", "labelEn", "originalCanonicalSubtree"));
                stripSourceOnlyViewFixtureFields(object.path("children"));
            } else if ("goalEntry".equals(object.path("kind").asText())) {
                object.remove("placementEvidence");
            }
        }
    }

    @Test
    void rejectsUnsupportedProjectionRole() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumRuntimeSnapshot.ViewDescriptor original = snapshot.viewsById().get("view-alpha");
        String document = mapper.writeValueAsString(Map.of(
                "viewId", original.viewId(),
                "landscapeId", original.landscapeId(),
                "scope", original.scope(),
                "rootNodes", List.of(Map.of(
                        "kind", "goalEntry",
                        "goalId", "goal-alpha",
                        "projectionRole", "reviewOnly"))));
        CurriculumRuntimeSnapshot.ViewDescriptor invalid = new CurriculumRuntimeSnapshot.ViewDescriptor(
                original.packageId(),
                original.viewId(),
                original.landscapeId(),
                original.language(),
                original.scope(),
                original.artifact(),
                document);

        assertThatThrownBy(() -> PackageCompositionViewState.load(
                        copy(snapshot, Map.of(original.viewId(), invalid), snapshot.offeringsById()), mapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Unsupported projectionRole");
    }

    @Test
    void rejectsProjectionRoleOnLandscapeEntry() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumRuntimeSnapshot.ViewDescriptor original = snapshot.viewsById().get("view-alpha");
        String document = mapper.writeValueAsString(Map.of(
                "viewId", original.viewId(),
                "landscapeId", original.landscapeId(),
                "scope", original.scope(),
                "rootNodes", List.of(Map.of(
                        "kind", "landscapeEntry",
                        "landscapeId", original.landscapeId(),
                        "projectionRole", "prerequisiteOnly"))));
        CurriculumRuntimeSnapshot.ViewDescriptor invalid = new CurriculumRuntimeSnapshot.ViewDescriptor(
                original.packageId(),
                original.viewId(),
                original.landscapeId(),
                original.language(),
                original.scope(),
                original.artifact(),
                document);

        assertThatThrownBy(() -> PackageCompositionViewState.load(
                        copy(snapshot, Map.of(original.viewId(), invalid), snapshot.offeringsById()), mapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("only supported on canonicalSubtree and goalEntry");
    }

    @Test
    void rejectsConflictingMetadataForMergedNode() throws Exception {
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.PackageSpec merge = new CurriculumPackageTestFixture.PackageSpec(
                base.suffix(),
                base.packageId(),
                base.landscapeId(),
                base.hashCharacter(),
                base.closureHashCharacter(),
                base.indexHashCharacter(),
                base.definitionKey(),
                base.definitionOwner(),
                base.definitionDigest(),
                base.moduleLandscapeId(),
                true,
                base.externalUrlScheme());
        CurriculumRuntimeSnapshot snapshot = load(merge);
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>();
        for (CurriculumRuntimeSnapshot.ViewDescriptor descriptor : snapshot.viewsById().values()) {
            String label = descriptor.viewId().endsWith("secondary") ? "LK label" : "GK label";
            String document = mapper.writeValueAsString(Map.of(
                    "viewId", descriptor.viewId(),
                    "landscapeId", descriptor.landscapeId(),
                    "scope", descriptor.scope(),
                    "rootNodes", List.of(Map.of(
                            "kind", "goalEntry",
                            "goalId", "goal-alpha",
                            "displayLabel", label))));
            views.put(descriptor.viewId(), new CurriculumRuntimeSnapshot.ViewDescriptor(
                    descriptor.packageId(),
                    descriptor.viewId(),
                    descriptor.landscapeId(),
                    descriptor.language(),
                    descriptor.scope(),
                    descriptor.artifact(),
                    document));
        }

        assertThatThrownBy(() -> PackageCompositionViewState.load(
                        copy(snapshot, views, snapshot.offeringsById()), mapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Conflicting node metadata");
    }

    @Test
    void treatsEveryPackagedLandscapeAsManagedEvenWithoutOwnOffering() throws Exception {
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.PackageSpec withModule = new CurriculumPackageTestFixture.PackageSpec(
                base.suffix(),
                base.packageId(),
                base.landscapeId(),
                base.hashCharacter(),
                base.closureHashCharacter(),
                base.indexHashCharacter(),
                base.definitionKey(),
                base.definitionOwner(),
                base.definitionDigest(),
                "module-alpha",
                false,
                base.externalUrlScheme());

        PackageCompositionViewState state = PackageCompositionViewState.load(load(withModule), mapper);

        assertThat(state.isManagedLandscape("landscape-alpha")).isTrue();
        assertThat(state.isManagedLandscape("module-alpha")).isTrue();
        assertThat(state.resolve("module-alpha", Map.of())).isNull();
    }

    @ParameterizedTest
    @ValueSource(strings = {"goalEntry", "canonicalSubtree"})
    void rejectsDuplicateVisibleGoalsInAView(String referenceKind) throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumRuntimeSnapshot.ViewDescriptor original = snapshot.viewsById().get("view-alpha");
        String invalidJson = mapper.writeValueAsString(Map.of(
                "viewId", "view-alpha",
                "landscapeId", "landscape-alpha",
                "scope", original.scope(),
                "rootNodes", List.of(
                        Map.of("kind", referenceKind, "goalId", "goal-alpha"),
                        Map.of("kind", "goalEntry", "goalId", "goal-alpha"))));
        CurriculumRuntimeSnapshot.ViewDescriptor invalid = new CurriculumRuntimeSnapshot.ViewDescriptor(
                original.packageId(),
                original.viewId(),
                original.landscapeId(),
                original.language(),
                original.scope(),
                original.artifact(),
                invalidJson);

        assertThatThrownBy(() -> PackageCompositionViewState.load(
                        copy(snapshot, Map.of("view-alpha", invalid), snapshot.offeringsById()), mapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("more than once");
    }

    @Test
    void rejectsLandscapeEntryWithoutResolvableRootGoal() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumRuntimeSnapshot.ViewDescriptor original = snapshot.viewsById().get("view-alpha");
        String invalidJson = mapper.writeValueAsString(Map.of(
                "viewId", original.viewId(),
                "landscapeId", original.landscapeId(),
                "scope", original.scope(),
                "rootNodes", List.of(Map.of(
                        "kind", "landscapeEntry",
                        "landscapeId", original.landscapeId()))));
        CurriculumRuntimeSnapshot.ViewDescriptor invalid = new CurriculumRuntimeSnapshot.ViewDescriptor(
                original.packageId(),
                original.viewId(),
                original.landscapeId(),
                original.language(),
                original.scope(),
                original.artifact(),
                invalidJson);

        assertThatThrownBy(() -> PackageCompositionViewState.load(
                        copy(snapshot, Map.of(original.viewId(), invalid), snapshot.offeringsById()), mapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("no resolvable root goal");
    }

    @Test
    void rejectsUnpublishedViewsAndSingleScopeDrift() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumRuntimeSnapshot.ViewDescriptor original = snapshot.viewsById().get("view-alpha");
        String orphanJson = mapper.writeValueAsString(Map.of(
                "viewId", "view-orphan",
                "landscapeId", "landscape-alpha",
                "scope", original.scope(),
                "rootNodes", List.of()));
        CurriculumRuntimeSnapshot.ViewDescriptor orphan = new CurriculumRuntimeSnapshot.ViewDescriptor(
                original.packageId(),
                "view-orphan",
                original.landscapeId(),
                original.language(),
                original.scope(),
                original.artifact(),
                orphanJson);
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>(snapshot.viewsById());
        views.put(orphan.viewId(), orphan);

        assertThatThrownBy(() -> PackageCompositionViewState.load(
                        copy(snapshot, views, snapshot.offeringsById()), mapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("not reachable from an offering");

        CurriculumRuntimeSnapshot.OfferingDescriptor originalOffering =
                snapshot.offeringsById().get("offering-alpha");
        CurriculumRuntimeSnapshot.OfferingDescriptor drifted = new CurriculumRuntimeSnapshot.OfferingDescriptor(
                originalOffering.packageId(),
                originalOffering.offeringId(),
                originalOffering.landscapeId(),
                Map.of("schoolForm", "Gymnasium", "courseProfile", "LK"),
                originalOffering.resolutionMode(),
                originalOffering.mergeDimension(),
                originalOffering.viewIds());

        assertThatThrownBy(() -> PackageCompositionViewState.load(
                        copy(snapshot, snapshot.viewsById(), Map.of("offering-alpha", drifted)), mapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("scope disagrees");
    }

    private CurriculumRuntimeSnapshot load(CurriculumPackageTestFixture.PackageSpec spec) throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(mapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(tempDir.resolve(spec.suffix()), spec);
        CurriculumPackageProperties properties = new CurriculumPackageProperties();
        properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.setConsumerVersion("0.1.0");
        properties.getPackages().setStoreDirectory(store.root().toString());
        CurriculumPackageFileReader reader = new CurriculumPackageFileReader();
        CurriculumPackageRepository repository = new FileSystemCurriculumPackageRepository(
                properties, mapper, reader);
        return new JsonCurriculumPackageLoader(properties, repository, reader, mapper).load();
    }

    private static CurriculumRuntimeSnapshot copy(
            CurriculumRuntimeSnapshot snapshot,
            Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views,
            Map<String, CurriculumRuntimeSnapshot.OfferingDescriptor> offerings) {
        return copy(snapshot, snapshot.landscapesById(), views, offerings);
    }

    private static CurriculumRuntimeSnapshot copy(
            CurriculumRuntimeSnapshot snapshot,
            Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> landscapes,
            Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views,
            Map<String, CurriculumRuntimeSnapshot.OfferingDescriptor> offerings) {
        return new CurriculumRuntimeSnapshot(
                snapshot.generationSha256(),
                snapshot.packages(),
                snapshot.rootLandscapeIds(),
                landscapes,
                views,
                offerings,
                snapshot.decksByKey(),
                snapshot.resourcesById(),
                snapshot.resourcesByPublicUrl(),
                snapshot.artifactsByKey(),
                snapshot.migrationAliasesJsonByPackageId(),
                snapshot.definitionCount());
    }
}
