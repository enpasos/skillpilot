package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Synthetic trusted-provisioner evidence for bounded backend unit tests.
 * Genuine validator/extraction/store integration belongs to DPK-006b.
 */
final class CurriculumPackageTestFixture {

    private static final List<String> GATES = List.of(
            "inventory",
            "runtimeCatalog",
            "offlineSchemaCatalog",
            "hardReferenceClosure",
            "contentDigest",
            "assetBytes");

    private final ObjectMapper mapper;

    CurriculumPackageTestFixture(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    TestStore create(Path storeRoot, PackageSpec... specs) throws IOException {
        Files.createDirectories(storeRoot.resolve("locks"));
        Files.createDirectories(storeRoot.resolve("install-records"));
        Files.createDirectories(storeRoot.resolve("validation-reports"));
        List<PackageFixture> packages = new ArrayList<>();
        List<Map<String, Object>> lockEntries = new ArrayList<>();
        for (PackageSpec spec : specs) {
            PackageFixture packageFixture = createPackage(storeRoot, spec);
            packages.add(packageFixture);
            lockEntries.add(packageFixture.lockEntry());
        }
        Path lockPath = storeRoot.resolve("locks/active.json");
        writeJson(lockPath, Map.of(
                "lockFormatVersion", "1.0",
                "packages", lockEntries));
        return new TestStore(storeRoot, lockPath, List.copyOf(packages));
    }

    private PackageFixture createPackage(Path storeRoot, PackageSpec spec) throws IOException {
        String repeated = String.valueOf(spec.hashCharacter()).repeat(64);
        String outerZipSha256 = repeated;
        String contentDigest = "sha256:" + repeated;
        String closureDigest = "sha256:" + String.valueOf(spec.closureHashCharacter()).repeat(64);
        String definitionIndexDigest = "sha256:" + String.valueOf(spec.indexHashCharacter()).repeat(64);
        String packageVersion = "1.0.0";
        String releaseId = spec.packageId() + "@" + packageVersion;
        String archiveRoot = "fixture-" + spec.suffix();
        String landscapeId = spec.landscapeId();
        String viewId = "view-" + spec.suffix();
        String secondaryViewId = "view-" + spec.suffix() + "-secondary";
        String offeringId = "offering-" + spec.suffix();
        String deckId = "deck-" + spec.suffix();
        String resourceId = "resource-" + spec.suffix();
        String publicUrl = "/assets/fixture-" + spec.suffix() + ".png";
        String externalResourceId = "external-resource-" + spec.suffix();
        String externalUrl = spec.externalUrlScheme() + "://example.org/tool/" + spec.suffix();
        Path packageRoot = storeRoot.resolve("objects/sha256")
                .resolve(outerZipSha256)
                .resolve(archiveRoot);

        Map<String, byte[]> artifacts = new LinkedHashMap<>();
        artifacts.put("data/canonical/landscape.json", jsonBytes(Map.ofEntries(
                Map.entry("landscapeId", landscapeId),
                Map.entry("locale", "de-DE"),
                Map.entry("frameworkId", "fixture-framework"),
                Map.entry("subject", "Fixture subject"),
                Map.entry("country", "DE"),
                Map.entry("schoolType", "Gymnasium"),
                Map.entry("goals", List.of(Map.of(
                        "id", "goal-" + spec.suffix(),
                        "title", "Fixture goal",
                        "applicability", Map.of("jurisdiction", List.of("DE-HE"))))))));
        if (spec.moduleLandscapeId() != null) {
            artifacts.put("data/canonical/module.landscape.json", jsonBytes(Map.ofEntries(
                    Map.entry("landscapeId", spec.moduleLandscapeId()),
                    Map.entry("locale", "de-DE"),
                    Map.entry("frameworkId", "fixture-framework"),
                    Map.entry("subject", "Fixture subject module"),
                    Map.entry("goals", List.of(Map.of(
                            "id", "module-goal-" + spec.suffix(),
                            "title", "Module fixture goal"))))));
        }
        String sourceCollectionId = "source-collection-" + spec.suffix();
        String sourceLandscapeId = "source-landscape-" + spec.suffix();
        String sourceGoalId = "source-goal-" + spec.suffix();
        String mappingCollectionId = "mapping-collection-" + spec.suffix();
        artifacts.put("data/sources/source-index.json", jsonBytes(Map.ofEntries(
                Map.entry("$schema", "https://skillpilot.com/schemas/curriculum-package/v1/official-source-index.schema.json"),
                Map.entry("sourceIndexFormatVersion", "1.0"),
                Map.entry("targetLandscapeId", landscapeId),
                Map.entry("sourceCollectionCount", 1),
                Map.entry("sourceDocumentCount", 1),
                Map.entry("collections", List.of(Map.ofEntries(
                        Map.entry("sourceCollectionId", sourceCollectionId),
                        Map.entry("sourceLandscapeId", sourceLandscapeId),
                        Map.entry("jurisdiction", "DE-BY"),
                        Map.entry("subject", "Fixture subject"),
                        Map.entry("stage", "SekI"),
                        Map.entry("documentCount", 1),
                        Map.entry("documents", List.of(Map.ofEntries(
                                Map.entry("sourceDocumentId", sourceCollectionId + ":core"),
                                Map.entry("sourceKey", "core"),
                                Map.entry("title", "Fixture curriculum source"),
                                Map.entry("role", "binding-core"),
                                Map.entry("semanticType", "curriculum"),
                                Map.entry("official", true),
                                Map.entry("url", "https://example.org/curriculum/" + spec.suffix()))))))))));
        artifacts.put("data/mappings/source-to-canonical.json", jsonBytes(Map.ofEntries(
                Map.entry("$schema", "https://skillpilot.com/schemas/curriculum-package/v1/source-to-canonical-mappings.schema.json"),
                Map.entry("mappingFormatVersion", "1.0"),
                Map.entry("targetLandscapeId", landscapeId),
                Map.entry("mappingCollectionCount", 1),
                Map.entry("decisionCount", 1),
                Map.entry("mappingEdgeCount", 1),
                Map.entry("collections", List.of(Map.ofEntries(
                        Map.entry("mappingCollectionId", mappingCollectionId),
                        Map.entry("sourceCollectionId", sourceCollectionId),
                        Map.entry("sourceLandscapeId", sourceLandscapeId),
                        Map.entry("targetLandscapeId", landscapeId),
                        Map.entry("jurisdiction", "DE-BY"),
                        Map.entry("subject", "Fixture subject"),
                        Map.entry("stage", "SekI"),
                        Map.entry("inputDecisionCount", 1),
                        Map.entry("mappingEdgeCount", 1),
                        Map.entry("edges", List.of(Map.of(
                                "sourceGoalId", sourceGoalId,
                                "canonicalGoalId", "goal-" + spec.suffix(),
                                "matchType", "exact")))))))));
        List<Map<String, Object>> viewIndexEntries = new ArrayList<>();
        viewIndexEntries.add(Map.of(
                        "viewId", viewId,
                        "landscapeId", landscapeId,
                        "language", "de-DE",
                        "scope", Map.of("schoolForm", "Gymnasium", "courseProfile", "GK"),
                        "artifactPath", "data/views/fixture.view.json"));
        if (spec.mergeOffering()) {
            viewIndexEntries.add(Map.of(
                    "viewId", secondaryViewId,
                    "landscapeId", landscapeId,
                    "language", "de-DE",
                    "scope", Map.of("schoolForm", "Gymnasium", "courseProfile", "LK"),
                    "artifactPath", "data/views/fixture-secondary.view.json"));
        }
        artifacts.put("data/views/index.json", jsonBytes(Map.of("views", viewIndexEntries)));
        artifacts.put("data/views/fixture.view.json", jsonBytes(Map.of(
                "viewId", viewId,
                "landscapeId", landscapeId,
                "scope", Map.of("schoolForm", "Gymnasium", "courseProfile", "GK"),
                "rootNodes", List.of())));
        if (spec.mergeOffering()) {
            artifacts.put("data/views/fixture-secondary.view.json", jsonBytes(Map.of(
                    "viewId", secondaryViewId,
                    "landscapeId", landscapeId,
                    "scope", Map.of("schoolForm", "Gymnasium", "courseProfile", "LK"),
                    "rootNodes", List.of())));
        }
        artifacts.put("data/cards/card-index.json", jsonBytes(Map.of(
                "decks", List.of(Map.of(
                        "deckId", deckId,
                        "landscapeId", landscapeId,
                        "language", "de-DE",
                        "artifactPath", "data/cards/fixture.de.json")))));
        artifacts.put("data/cards/fixture.de.json", jsonBytes(Map.of(
                "deckId", deckId,
                "landscapeId", landscapeId,
                "language", "de-DE",
                "title", "Fixture deck",
                "cards", List.of(Map.of("id", "card-" + spec.suffix(), "front", "F", "back", "B")))));
        artifacts.put("data/resources/resource-index.json", jsonBytes(Map.of(
                "resources", List.of(Map.ofEntries(
                        Map.entry("resourceId", resourceId),
                        Map.entry("landscapeId", landscapeId),
                        Map.entry("ownerGoalId", "goal-" + spec.suffix()),
                        Map.entry("resourceKind", "goal-visualization"),
                        Map.entry("delivery", "embedded"),
                        Map.entry("runtimeRequired", true),
                        Map.entry("mediaType", "image/png"),
                        Map.entry("publicUrl", publicUrl),
                        Map.entry("artifactPath", "assets/fixture.png")),
                        Map.ofEntries(
                                Map.entry("resourceId", externalResourceId),
                                Map.entry("landscapeId", landscapeId),
                                Map.entry("ownerGoalId", "goal-" + spec.suffix()),
                                Map.entry("resourceKind", "tool"),
                                Map.entry("delivery", "external"),
                                Map.entry("runtimeRequired", false),
                                Map.entry("mediaType", "text/html"),
                                Map.entry("externalUrl", externalUrl))))));
        artifacts.put("data/runtime/migration-aliases.json", jsonBytes(Map.of(
                "aliasFormatVersion", "1.0",
                "aliases", List.of())));
        artifacts.put("metadata/audit.json", jsonBytes(Map.of(
                "auditFormatVersion", "1.0",
                "note", "Non-runtime fixture evidence")));
        artifacts.put("assets/fixture.png", new byte[] {1, 2, 3, 4});

        Map<String, Object> closure = new LinkedHashMap<>();
        closure.put("closureFormatVersion", "1.0");
        closure.put("closureStatus", "complete");
        closure.put("closureDigest", closureDigest);
        closure.put("definitionIndexDigest", definitionIndexDigest);
        closure.put("externalRuntimeDependencies", List.of());
        closure.put("unresolvedHardReferences", List.of());
        closure.put("releaseBinding", Map.of(
                "packageId", spec.packageId(),
                "packageVersion", packageVersion,
                "releaseId", releaseId,
                "contentDigest", contentDigest));
        closure.put("definitions", List.of(Map.of(
                "key", Map.of("kind", "goal", "id", spec.definitionKey()),
                "ownerPackageId", spec.definitionOwner(),
                "definitionDigest", spec.definitionDigest())));
        artifacts.put("data/runtime/dependency-closure.json", jsonBytes(closure));

        Map<String, Object> catalog = new LinkedHashMap<>();
        catalog.put("$schema", "https://skillpilot.com/schemas/curriculum-package/v1/runtime-catalog.schema.json");
        catalog.put("catalogVersion", "1.0");
        catalog.put("runtimeContractVersion", "1.0");
        catalog.put("releaseBinding", Map.of("releaseId", releaseId, "contentDigest", contentDigest));
        catalog.put("artifactIndexes", Map.of(
                "compositionViewsPath", "data/views/index.json",
                "cardsPath", "data/cards/card-index.json",
                "resourcesPath", "data/resources/resource-index.json",
                "migrationAliasesPath", "data/runtime/migration-aliases.json"));
        catalog.put("dependencyClosure", Map.of(
                "strategy", "embedded-transitive-v1",
                "path", "data/runtime/dependency-closure.json",
                "externalRuntimeDependencies", List.of()));
        catalog.put("rootLandscapeIds", List.of(landscapeId));
        catalog.put("scopeDimensions", List.of(
                Map.of("id", "schoolForm", "values", List.of("Gymnasium")),
                Map.of(
                        "id", "courseProfile",
                        "values", List.of("GK", "LK", "GK+LK"),
                        "composites", List.of(Map.of(
                                "value", "GK+LK",
                                "members", List.of("GK", "LK"))))));
        catalog.put("capabilities", List.of(
                "compositionViews",
                "memoryCards",
                "goalVisualizations"));
        List<Map<String, Object>> landscapeEntries = new ArrayList<>();
        landscapeEntries.add(Map.ofEntries(
                Map.entry("landscapeId", landscapeId),
                Map.entry("role", "root"),
                Map.entry("locale", "de-DE"),
                Map.entry("frameworkId", "fixture-framework"),
                Map.entry("subject", "Fixture subject"),
                Map.entry("country", "DE"),
                Map.entry("schoolForm", "Gymnasium"),
                Map.entry("defaultOfferingId", offeringId),
                Map.entry("artifactPath", "data/canonical/landscape.json")));
        if (spec.moduleLandscapeId() != null) {
            landscapeEntries.add(Map.ofEntries(
                    Map.entry("landscapeId", spec.moduleLandscapeId()),
                    Map.entry("role", "module"),
                    Map.entry("locale", "de-DE"),
                    Map.entry("frameworkId", "fixture-framework"),
                    Map.entry("subject", "Fixture subject module"),
                    Map.entry("parentLandscapeId", landscapeId),
                    Map.entry("artifactPath", "data/canonical/module.landscape.json")));
        }
        catalog.put("landscapes", landscapeEntries);
        List<Map<String, Object>> catalogViews = new ArrayList<>();
        catalogViews.add(Map.of(
                "viewId", viewId,
                "landscapeId", landscapeId,
                "scope", Map.of("schoolForm", "Gymnasium", "courseProfile", "GK"),
                "artifactPath", "data/views/fixture.view.json"));
        if (spec.mergeOffering()) {
            catalogViews.add(Map.of(
                    "viewId", secondaryViewId,
                    "landscapeId", landscapeId,
                    "scope", Map.of("schoolForm", "Gymnasium", "courseProfile", "LK"),
                    "artifactPath", "data/views/fixture-secondary.view.json"));
        }
        catalog.put("views", catalogViews);
        Map<String, Object> resolution = spec.mergeOffering()
                ? Map.of(
                        "mode", "merge",
                        "mergeDimension", "courseProfile",
                        "viewIds", List.of(viewId, secondaryViewId))
                : Map.of("mode", "single", "viewIds", List.of(viewId));
        catalog.put("offeredScopes", List.of(Map.of(
                "offeringId", offeringId,
                "landscapeId", landscapeId,
                "scope", Map.of(
                        "schoolForm", "Gymnasium",
                        "courseProfile", spec.mergeOffering() ? "GK+LK" : "GK"),
                "viewResolution", resolution)));
        catalog.put("decks", List.of(Map.of(
                "deckId", deckId,
                "landscapeId", landscapeId,
                "locale", "de-DE",
                "artifactPath", "data/cards/fixture.de.json")));
        catalog.put("resources", List.of(Map.ofEntries(
                Map.entry("resourceId", resourceId),
                Map.entry("landscapeId", landscapeId),
                Map.entry("goalId", "goal-" + spec.suffix()),
                Map.entry("resourceKind", "goal-visualization"),
                Map.entry("delivery", "embedded"),
                Map.entry("runtimeRequired", true),
                Map.entry("mediaType", "image/png"),
                Map.entry("artifactPath", "assets/fixture.png")),
                Map.ofEntries(
                        Map.entry("resourceId", externalResourceId),
                        Map.entry("landscapeId", landscapeId),
                        Map.entry("goalId", "goal-" + spec.suffix()),
                        Map.entry("resourceKind", "external-tool"),
                        Map.entry("delivery", "external"),
                        Map.entry("runtimeRequired", false),
                        Map.entry("mediaType", "text/html"),
                        Map.entry("externalUrl", externalUrl))));
        artifacts.put("data/runtime/catalog.json", jsonBytes(catalog));

        Map<String, String> roles = new LinkedHashMap<>(Map.ofEntries(
                Map.entry("data/canonical/landscape.json", "canonical-landscape"),
                Map.entry("data/views/index.json", "composition-view-index"),
                Map.entry("data/views/fixture.view.json", "composition-view"),
                Map.entry("data/cards/card-index.json", "card-index"),
                Map.entry("data/cards/fixture.de.json", "card-deck"),
                Map.entry("data/resources/resource-index.json", "resource-index"),
                Map.entry("data/runtime/migration-aliases.json", "migration-aliases"),
                Map.entry("data/runtime/dependency-closure.json", "dependency-closure"),
                Map.entry("data/runtime/catalog.json", "runtime-catalog"),
                Map.entry("data/mappings/source-to-canonical.json", "mapping"),
                Map.entry("data/sources/source-index.json", "source-index"),
                Map.entry("metadata/audit.json", "audit-report"),
                Map.entry("assets/fixture.png", "binary-asset")));
        if (spec.moduleLandscapeId() != null) {
            roles.put("data/canonical/module.landscape.json", "canonical-landscape");
        }
        if (spec.mergeOffering()) {
            roles.put("data/views/fixture-secondary.view.json", "composition-view");
        }
        List<Map<String, Object>> manifestFiles = new ArrayList<>();
        for (Map.Entry<String, byte[]> artifact : artifacts.entrySet()) {
            String path = artifact.getKey();
            writeBytes(packageRoot.resolve(path), artifact.getValue());
            String role = roles.get(path);
            Map<String, Object> semanticBinding;
            if (role.equals("binary-asset")) {
                semanticBinding = Map.of(
                        "kind", "binary-resource",
                        "resourceId", resourceId);
            } else if (role.equals("audit-report")) {
                semanticBinding = Map.of("kind", "excluded-generated");
            } else {
                String normalizationRole = switch (role) {
                    case "mapping" -> "source-to-canonical-mappings";
                    case "source-index" -> "official-source-index";
                    default -> role;
                };
                semanticBinding = Map.of(
                        "kind", "logical-artifact",
                        "logicalId", "fixture:" + path,
                        "normalizationRole", normalizationRole);
            }
            manifestFiles.add(Map.ofEntries(
                    Map.entry("path", path),
                    Map.entry("role", role),
                    Map.entry("mediaType", path.endsWith(".json") ? "application/json" : "image/png"),
                    Map.entry("bytes", artifact.getValue().length),
                    Map.entry("sha256", CurriculumPackageFileReader.sha256(artifact.getValue())),
                    Map.entry(
                            "runtimeRequired",
                            !path.equals("metadata/audit.json")
                                    && !path.equals("data/mappings/source-to-canonical.json")
                                    && !path.equals("data/sources/source-index.json")),
                    Map.entry("semanticBinding", semanticBinding),
                    Map.entry("licenseExpression", "Apache-2.0"),
                    Map.entry("provenanceClass", "software-contract"),
                    Map.entry("redistributionStatus", "allowed")));
        }

        Map<String, Object> manifest = new LinkedHashMap<>();
        manifest.put("$schema", "https://skillpilot.com/schemas/curriculum-package/v1/package-manifest.schema.json");
        manifest.put("packageFormatVersion", "1.0");
        manifest.put("runtimeContractVersion", "1.0");
        manifest.put("releaseProfile", "full-standalone-v1");
        manifest.put("variant", "json");
        manifest.put("packageId", spec.packageId());
        manifest.put("packageVersion", packageVersion);
        manifest.put("releaseId", releaseId);
        manifest.put("contentDigest", contentDigest);
        manifest.put("archiveRoot", archiveRoot);
        manifest.put("supportedSkillpilotSoftware", ">=0.1.0 <1.0.0");
        manifest.put("files", manifestFiles);
        byte[] manifestBytes = jsonBytes(manifest);
        Path manifestPath = packageRoot.resolve("metadata/manifest.json");
        writeBytes(manifestPath, manifestBytes);
        String manifestSha256 = CurriculumPackageFileReader.sha256(manifestBytes);

        long outerZipBytes = 1234L + spec.suffix().length();
        Map<String, Object> gates = new LinkedHashMap<>();
        for (String gate : GATES) {
            gates.put(gate, Map.of(
                    "diagnosticCodes", List.of(),
                    "diagnosticCount", 0,
                    "status", "passed"));
        }
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("counts", Map.of(
                "archiveEntries", artifacts.size() + 2,
                "manifestFiles", artifacts.size(),
                "logicalArtifacts", roles.values().stream()
                        .filter(role -> !role.equals("binary-asset") && !role.equals("audit-report"))
                        .count(),
                "binaryResources", 1));
        report.put("diagnostics", List.of());
        report.put("diagnosticsTruncated", false);
        report.put("gates", gates);
        report.put("input", Map.of("bytes", outerZipBytes, "path", "/fixture/package.zip", "sha256", outerZipSha256));
        report.put("package", Map.of(
                "archiveRoot", archiveRoot,
                "contentDigest", contentDigest,
                "packageId", spec.packageId(),
                "packageVersion", packageVersion,
                "releaseId", releaseId));
        @SuppressWarnings("unchecked")
        Map<String, Object> reportPackage = (Map<String, Object>) report.get("package");
        Map<String, Object> reportPackageV2 = new LinkedHashMap<>(reportPackage);
        reportPackageV2.put("manifestSha256", manifestSha256);
        reportPackageV2.put("closureDigest", closureDigest);
        reportPackageV2.put("definitionIndexDigest", definitionIndexDigest);
        report.put("package", reportPackageV2);
        report.put("reportFormatVersion", 2);
        report.put("status", "valid");
        report.put("validatorId", "skillpilot-full-standalone-package-validator-v2");
        byte[] reportBytes = jsonBytes(report);
        Path reportPath = storeRoot.resolve("validation-reports/" + outerZipSha256 + ".json");
        writeBytes(reportPath, reportBytes);

        Map<String, Object> installRecord = new LinkedHashMap<>();
        installRecord.put("installRecordFormatVersion", "1.0");
        installRecord.put("outerZipSha256", outerZipSha256);
        installRecord.put("outerZipBytes", outerZipBytes);
        installRecord.put("manifestSha256", manifestSha256);
        installRecord.put("closureDigest", closureDigest);
        installRecord.put("definitionIndexDigest", definitionIndexDigest);
        installRecord.put("packageId", spec.packageId());
        installRecord.put("packageVersion", packageVersion);
        installRecord.put("releaseId", releaseId);
        installRecord.put("contentDigest", contentDigest);
        installRecord.put("archiveRoot", archiveRoot);
        installRecord.put("validationReportSha256", CurriculumPackageFileReader.sha256(reportBytes));
        byte[] installRecordBytes = jsonBytes(installRecord);
        Path installRecordPath = storeRoot.resolve("install-records/" + outerZipSha256 + ".json");
        writeBytes(installRecordPath, installRecordBytes);

        Map<String, Object> lockEntry = new LinkedHashMap<>();
        lockEntry.put("packageId", spec.packageId());
        lockEntry.put("packageVersion", packageVersion);
        lockEntry.put("releaseId", releaseId);
        lockEntry.put("outerZipSha256", outerZipSha256);
        lockEntry.put("manifestSha256", manifestSha256);
        lockEntry.put("contentDigest", contentDigest);
        lockEntry.put("archiveRoot", archiveRoot);
        lockEntry.put("closureDigest", closureDigest);
        lockEntry.put("definitionIndexDigest", definitionIndexDigest);
        lockEntry.put("installRecordSha256", CurriculumPackageFileReader.sha256(installRecordBytes));
        return new PackageFixture(
                spec,
                packageRoot,
                manifestPath,
                reportPath,
                installRecordPath,
                Map.copyOf(lockEntry),
                landscapeId,
                viewId,
                offeringId,
                deckId,
                resourceId,
                publicUrl,
                externalResourceId,
                externalUrl);
    }

    void writeJson(Path path, Object value) throws IOException {
        writeBytes(path, jsonBytes(value));
    }

    JsonNode readJson(Path path) throws IOException {
        return mapper.readTree(path.toFile());
    }

    private byte[] jsonBytes(Object value) throws IOException {
        return mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(value);
    }

    private static void writeBytes(Path path, byte[] bytes) throws IOException {
        Files.createDirectories(path.getParent());
        Files.write(path, bytes);
    }

    record PackageSpec(
            String suffix,
            String packageId,
            String landscapeId,
            char hashCharacter,
            char closureHashCharacter,
            char indexHashCharacter,
            String definitionKey,
            String definitionOwner,
            String definitionDigest,
            String moduleLandscapeId,
            boolean mergeOffering,
            String externalUrlScheme) {

        static PackageSpec packageSpec(String suffix, char hashCharacter) {
            return new PackageSpec(
                    suffix,
                    "org.example." + suffix,
                    "landscape-" + suffix,
                    hashCharacter,
                    hashCharacter == 'f' ? 'e' : (char) (hashCharacter + 1),
                    hashCharacter == 'f' ? 'd' : (char) (hashCharacter + 2),
                    "shared-goal",
                    "org.example.owner",
                    "sha256:" + "9".repeat(64),
                    null,
                    false,
                    "https");
        }
    }

    record TestStore(Path root, Path lockPath, List<PackageFixture> packages) {
    }

    record PackageFixture(
            PackageSpec spec,
            Path packageRoot,
            Path manifestPath,
            Path validationReportPath,
            Path installRecordPath,
            Map<String, Object> lockEntry,
            String landscapeId,
            String viewId,
            String offeringId,
            String deckId,
            String resourceId,
            String publicUrl,
            String externalResourceId,
            String externalUrl) {
    }
}
