package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class PackageCompositionViewStateTest {

    @TempDir
    Path tempDir;

    private final ObjectMapper mapper = new ObjectMapper();

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

    @Test
    void rejectsDuplicateVisibleGoalsInAView() throws Exception {
        CurriculumRuntimeSnapshot snapshot = load(
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumRuntimeSnapshot.ViewDescriptor original = snapshot.viewsById().get("view-alpha");
        String invalidJson = mapper.writeValueAsString(Map.of(
                "viewId", "view-alpha",
                "landscapeId", "landscape-alpha",
                "scope", original.scope(),
                "rootNodes", List.of(
                        Map.of("kind", "goalEntry", "goalId", "goal-alpha"),
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
        return new CurriculumRuntimeSnapshot(
                snapshot.generationSha256(),
                snapshot.packages(),
                snapshot.rootLandscapeIds(),
                snapshot.landscapesById(),
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
