package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Builds one immutable runtime-discovery snapshot from an exact active package lock. */
public final class JsonCurriculumPackageLoader {

    private static final String MANIFEST_SCHEMA_ID =
            "https://skillpilot.com/schemas/curriculum-package/v1/package-manifest.schema.json";
    private static final String RUNTIME_CATALOG_SCHEMA_ID =
            "https://skillpilot.com/schemas/curriculum-package/v1/runtime-catalog.schema.json";
    private static final String RELEASE_PROFILE = "full-standalone-v1";
    private static final String PACKAGE_FORMAT_VERSION = "1.0";
    private static final String RUNTIME_CONTRACT_VERSION = "1.0";
    private static final Pattern SHA256 = Pattern.compile("^[a-f0-9]{64}$");
    private static final Pattern CONTENT_DIGEST = Pattern.compile("^sha256:[a-f0-9]{64}$");
    private static final Pattern COMPARATOR = Pattern.compile("^(>=|<=|>|<|=)?([0-9]+)[.]([0-9]+)[.]([0-9]+)$");
    private static final Set<String> ALLOWED_CAPABILITIES = Set.of(
            "compositionViews",
            "memoryCards",
            "goalVisualizations",
            "embeddedDependencies",
            "examNodes");

    private final CurriculumPackageProperties properties;
    private final CurriculumPackageRepository repository;
    private final CurriculumPackageFileReader fileReader;
    private final ObjectMapper objectMapper;

    public JsonCurriculumPackageLoader(
            CurriculumPackageProperties properties,
            CurriculumPackageRepository repository,
            CurriculumPackageFileReader fileReader,
            ObjectMapper objectMapper) {
        this.properties = properties;
        this.repository = repository;
        this.fileReader = fileReader;
        this.objectMapper = CurriculumPackageJson.strictCopy(objectMapper);
    }

    public CurriculumRuntimeSnapshot load() {
        CurriculumPackageRepository.ActivePackageSet active = repository.loadActivePackageSet();
        List<CurriculumRuntimeSnapshot.PackageDescriptor> packageDescriptors = new ArrayList<>();
        List<String> rootLandscapeIds = new ArrayList<>();
        Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> landscapes = new LinkedHashMap<>();
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = new LinkedHashMap<>();
        Map<String, CurriculumRuntimeSnapshot.OfferingDescriptor> offerings = new LinkedHashMap<>();
        Map<CurriculumRuntimeSnapshot.DeckKey, CurriculumRuntimeSnapshot.DeckDescriptor> decks = new LinkedHashMap<>();
        Map<String, CurriculumRuntimeSnapshot.ResourceDescriptor> resources = new LinkedHashMap<>();
        Map<String, CurriculumRuntimeSnapshot.ResourceDescriptor> resourcesByPublicUrl = new LinkedHashMap<>();
        Map<String, String> aliases = new LinkedHashMap<>();
        Map<String, DefinitionBinding> definitions = new HashMap<>();

        for (InstalledCurriculumPackage installedPackage : active.packages()) {
            LoadedPackage loaded = loadPackage(installedPackage);
            packageDescriptors.add(loaded.packageDescriptor());
            loaded.landscapes().forEach((id, descriptor) ->
                    CurriculumRuntimeSnapshot.putUnique(landscapes, id, descriptor, "landscapeId"));
            for (String rootId : loaded.rootLandscapeIds()) {
                rootLandscapeIds.add(rootId);
            }
            loaded.views().forEach((id, descriptor) ->
                    CurriculumRuntimeSnapshot.putUnique(views, id, descriptor, "viewId"));
            loaded.offerings().forEach((id, descriptor) ->
                    CurriculumRuntimeSnapshot.putUnique(offerings, id, descriptor, "offeringId"));
            loaded.decks().forEach((key, descriptor) ->
                    CurriculumRuntimeSnapshot.putUnique(decks, key, descriptor, "deck key"));
            loaded.resources().forEach((id, descriptor) -> {
                CurriculumRuntimeSnapshot.putUnique(resources, id, descriptor, "resourceId");
                if (descriptor.publicUrl() != null) {
                    CurriculumRuntimeSnapshot.putUnique(
                            resourcesByPublicUrl,
                            descriptor.publicUrl(),
                            descriptor,
                            "resource publicUrl");
                }
            });
            CurriculumRuntimeSnapshot.putUnique(
                    aliases,
                    installedPackage.lockEntry().packageId(),
                    loaded.migrationAliasesJson(),
                    "package migration aliases");
            mergeDefinitions(definitions, loaded.definitions());
        }

        for (CurriculumRuntimeSnapshot.OfferingDescriptor offering : offerings.values()) {
            if (!landscapes.containsKey(offering.landscapeId())) {
                throw failure("Offering references unknown landscapeId: " + offering.offeringId());
            }
            for (String viewId : offering.viewIds()) {
                CurriculumRuntimeSnapshot.ViewDescriptor view = views.get(viewId);
                if (view == null || !view.landscapeId().equals(offering.landscapeId())) {
                    throw failure("Offering references an unknown or foreign viewId: " + offering.offeringId());
                }
            }
        }

        return new CurriculumRuntimeSnapshot(
                active.lockSha256(),
                packageDescriptors,
                rootLandscapeIds,
                landscapes,
                views,
                offerings,
                decks,
                resources,
                resourcesByPublicUrl,
                aliases,
                definitions.size());
    }

    private LoadedPackage loadPackage(InstalledCurriculumPackage installedPackage) {
        CurriculumPackageLock.Entry lock = installedPackage.lockEntry();
        byte[] manifestBytes = fileReader.readStoreControlFile(
                installedPackage.packageRoot(),
                "metadata/manifest.json",
                CurriculumPackageFileReader.MAX_CONTROL_BYTES);
        if (!CurriculumPackageFileReader.sha256(manifestBytes).equals(lock.manifestSha256())) {
            throw failure("Manifest SHA-256 drift for " + lock.releaseId());
        }
        JsonNode manifest = parseJson(manifestBytes, "package manifest " + lock.releaseId());
        requireExactText(manifest, "$schema", MANIFEST_SCHEMA_ID, "package manifest");
        requireExactText(manifest, "packageFormatVersion", PACKAGE_FORMAT_VERSION, "package manifest");
        requireExactText(manifest, "runtimeContractVersion", RUNTIME_CONTRACT_VERSION, "package manifest");
        requireExactText(manifest, "releaseProfile", RELEASE_PROFILE, "package manifest");
        requireExactText(manifest, "variant", "json", "package manifest");
        requireExactText(manifest, "packageId", lock.packageId(), "package manifest");
        requireExactText(manifest, "packageVersion", lock.packageVersion(), "package manifest");
        requireExactText(manifest, "releaseId", lock.releaseId(), "package manifest");
        requireExactText(manifest, "contentDigest", lock.contentDigest(), "package manifest");
        requireExactText(manifest, "archiveRoot", lock.archiveRoot(), "package manifest");
        requireCompatibleSoftware(requiredText(manifest, "supportedSkillpilotSoftware", "package manifest"));

        Map<String, ManifestFile> files = parseManifestFiles(manifest);
        if (files.size() != installedPackage.validatedManifestFileCount()) {
            throw failure("Manifest file count differs from validator-v2 evidence for " + lock.releaseId());
        }
        Set<String> verifiedPaths = new HashSet<>();
        ManifestFile catalogFile = exactlyOneRole(files, "runtime-catalog");
        JsonNode catalog = readJsonArtifact(installedPackage, catalogFile, verifiedPaths);
        requireExactText(catalog, "$schema", RUNTIME_CATALOG_SCHEMA_ID, "runtime catalog");
        requireExactText(catalog, "catalogVersion", "1.0", "runtime catalog");
        requireExactText(catalog, "runtimeContractVersion", RUNTIME_CONTRACT_VERSION, "runtime catalog");
        JsonNode releaseBinding = requiredObject(catalog, "releaseBinding", "runtime catalog");
        requireExactText(releaseBinding, "releaseId", lock.releaseId(), "runtime catalog releaseBinding");
        requireExactText(releaseBinding, "contentDigest", lock.contentDigest(), "runtime catalog releaseBinding");
        List<CurriculumRuntimeSnapshot.ScopeDimension> scopeDimensions = parseScopeDimensions(catalog);
        List<String> capabilities = requiredUniqueTextList(catalog, "capabilities", "runtime catalog");
        for (String capability : capabilities) {
            if (!ALLOWED_CAPABILITIES.contains(capability)) {
                throw failure("Runtime catalog declares an unknown capability: " + capability);
            }
        }
        if (capabilities.contains("embeddedDependencies")) {
            throw failure("embeddedDependencies capability is not supported by the DPK-006a loader");
        }

        JsonNode indexes = requiredObject(catalog, "artifactIndexes", "runtime catalog");
        String viewIndexPath = requiredRelativePath(indexes, "compositionViewsPath", "artifactIndexes");
        String cardIndexPath = requiredRelativePath(indexes, "cardsPath", "artifactIndexes");
        String resourceIndexPath = requiredRelativePath(indexes, "resourcesPath", "artifactIndexes");
        String aliasesPath = requiredRelativePath(indexes, "migrationAliasesPath", "artifactIndexes");
        JsonNode closureBinding = requiredObject(catalog, "dependencyClosure", "runtime catalog");
        requireExactText(closureBinding, "strategy", "embedded-transitive-v1", "dependencyClosure");
        if (!requiredArray(closureBinding, "externalRuntimeDependencies", "dependencyClosure").isEmpty()) {
            throw failure("Runtime catalog declares external runtime dependencies for " + lock.releaseId());
        }
        String closurePath = requiredRelativePath(closureBinding, "path", "dependencyClosure");

        JsonNode viewIndex = readJsonArtifact(
                installedPackage,
                requiredRole(files, viewIndexPath, "composition-view-index"),
                verifiedPaths);
        JsonNode cardIndex = readJsonArtifact(
                installedPackage,
                requiredRole(files, cardIndexPath, "card-index"),
                verifiedPaths);
        JsonNode resourceIndex = readJsonArtifact(
                installedPackage,
                requiredRole(files, resourceIndexPath, "resource-index"),
                verifiedPaths);
        ManifestFile aliasesFile = requiredRole(files, aliasesPath, "migration-aliases");
        byte[] aliasesBytes = readArtifactBytes(installedPackage, aliasesFile, verifiedPaths);
        parseJson(aliasesBytes, "migration aliases " + lock.releaseId());
        String aliasesJson = decodeUtf8(aliasesBytes, "migration aliases " + lock.releaseId());
        JsonNode closure = readJsonArtifact(
                installedPackage,
                requiredRole(files, closurePath, "dependency-closure"),
                verifiedPaths);
        List<DefinitionRecord> definitions = validateClosure(closure, lock);

        Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> landscapes = loadLandscapes(
                installedPackage, catalog, files, verifiedPaths);
        List<String> roots = readRootLandscapeIds(catalog, landscapes);
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views = loadViews(
                installedPackage, catalog, viewIndex, files, verifiedPaths);
        Map<String, CurriculumRuntimeSnapshot.OfferingDescriptor> offerings = loadOfferings(
                installedPackage.lockEntry().packageId(), catalog, views);
        Map<CurriculumRuntimeSnapshot.DeckKey, CurriculumRuntimeSnapshot.DeckDescriptor> decks = loadDecks(
                installedPackage, catalog, cardIndex, files, verifiedPaths);
        Map<String, CurriculumRuntimeSnapshot.ResourceDescriptor> resources = loadResources(
                installedPackage, catalog, resourceIndex, files);
        validateLocalCatalogBindings(landscapes, views, offerings, decks, resources);

        for (ManifestFile file : files.values()) {
            if (!verifiedPaths.contains(file.path())) {
                fileReader.verifyArtifact(
                        installedPackage,
                        file.path(),
                        file.bytes(),
                        file.sha256());
                verifiedPaths.add(file.path());
            }
        }

        CurriculumRuntimeSnapshot.PackageDescriptor descriptor = new CurriculumRuntimeSnapshot.PackageDescriptor(
                lock.packageId(),
                lock.packageVersion(),
                lock.releaseId(),
                lock.outerZipSha256(),
                lock.manifestSha256(),
                lock.contentDigest(),
                lock.closureDigest(),
                lock.definitionIndexDigest(),
                scopeDimensions,
                capabilities);
        return new LoadedPackage(
                descriptor,
                roots,
                landscapes,
                views,
                offerings,
                decks,
                resources,
                aliasesJson,
                definitions);
    }

    private void validateLocalCatalogBindings(
            Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> landscapes,
            Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views,
            Map<String, CurriculumRuntimeSnapshot.OfferingDescriptor> offerings,
            Map<CurriculumRuntimeSnapshot.DeckKey, CurriculumRuntimeSnapshot.DeckDescriptor> decks,
            Map<String, CurriculumRuntimeSnapshot.ResourceDescriptor> resources) {
        for (CurriculumRuntimeSnapshot.LandscapeDescriptor landscape : landscapes.values()) {
            if (landscape.role().equals("root")) {
                if (landscape.parentLandscapeId() != null) {
                    throw failure("Root landscape must not have parentLandscapeId: " + landscape.landscapeId());
                }
                CurriculumRuntimeSnapshot.OfferingDescriptor defaultOffering =
                        offerings.get(landscape.defaultOfferingId());
                if (defaultOffering == null
                        || !defaultOffering.landscapeId().equals(landscape.landscapeId())) {
                    throw failure("Root landscape has no valid defaultOfferingId: " + landscape.landscapeId());
                }
            } else if (landscape.role().equals("module")) {
                assertModuleReachesRoot(landscape, landscapes);
            }
        }
        for (CurriculumRuntimeSnapshot.ViewDescriptor view : views.values()) {
            if (!landscapes.containsKey(view.landscapeId())) {
                throw failure("View references a landscape outside its standalone package: " + view.viewId());
            }
        }
        for (CurriculumRuntimeSnapshot.OfferingDescriptor offering : offerings.values()) {
            if (!landscapes.containsKey(offering.landscapeId())) {
                throw failure("Offering references a landscape outside its standalone package: "
                        + offering.offeringId());
            }
        }
        for (CurriculumRuntimeSnapshot.DeckDescriptor deck : decks.values()) {
            if (!landscapes.containsKey(deck.landscapeId())) {
                throw failure("Deck references a landscape outside its standalone package: " + deck.key());
            }
        }
        for (CurriculumRuntimeSnapshot.ResourceDescriptor resource : resources.values()) {
            if (!landscapes.containsKey(resource.landscapeId())) {
                throw failure("Resource references a landscape outside its standalone package: " + resource.resourceId());
            }
        }
    }

    private void assertModuleReachesRoot(
            CurriculumRuntimeSnapshot.LandscapeDescriptor module,
            Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> landscapes) {
        Set<String> visited = new LinkedHashSet<>();
        CurriculumRuntimeSnapshot.LandscapeDescriptor current = module;
        while (current.role().equals("module")) {
            if (!visited.add(current.landscapeId())) {
                throw failure("Module landscape parent chain is cyclic: " + module.landscapeId());
            }
            String parentId = current.parentLandscapeId();
            current = parentId == null ? null : landscapes.get(parentId);
            if (current == null) {
                throw failure("Module landscape has an unknown parentLandscapeId: " + module.landscapeId());
            }
        }
        if (!current.role().equals("root")) {
            throw failure("Module landscape parent chain does not end at a root: " + module.landscapeId());
        }
    }

    private Map<String, ManifestFile> parseManifestFiles(JsonNode manifest) {
        JsonNode filesNode = requiredArray(manifest, "files", "package manifest");
        Map<String, ManifestFile> files = new LinkedHashMap<>();
        for (int index = 0; index < filesNode.size(); index += 1) {
            JsonNode node = filesNode.get(index);
            String context = "package manifest files[" + index + "]";
            String path = requiredRelativePath(node, "path", context);
            String role = requiredText(node, "role", context);
            String mediaType = requiredText(node, "mediaType", context);
            long bytes = requiredNonNegativeLong(node, "bytes", context);
            String sha256 = requiredPatternText(node, "sha256", SHA256, context);
            JsonNode runtimeRequired = node.get("runtimeRequired");
            if (runtimeRequired == null || !runtimeRequired.isBoolean()) {
                throw failure(context + ".runtimeRequired must be boolean");
            }
            ManifestFile file = new ManifestFile(path, role, mediaType, bytes, sha256, runtimeRequired.booleanValue());
            if (files.putIfAbsent(path, file) != null) {
                throw failure("Duplicate manifest path: " + path);
            }
        }
        return files;
    }

    private List<DefinitionRecord> validateClosure(JsonNode closure, CurriculumPackageLock.Entry lock) {
        requireExactText(closure, "closureFormatVersion", "1.0", "dependency closure");
        requireExactText(closure, "closureStatus", "complete", "dependency closure");
        requireExactText(closure, "closureDigest", lock.closureDigest(), "dependency closure");
        requireExactText(closure, "definitionIndexDigest", lock.definitionIndexDigest(), "dependency closure");
        if (!requiredArray(closure, "externalRuntimeDependencies", "dependency closure").isEmpty()
                || !requiredArray(closure, "unresolvedHardReferences", "dependency closure").isEmpty()) {
            throw failure("Dependency closure is not standalone for " + lock.releaseId());
        }
        JsonNode binding = requiredObject(closure, "releaseBinding", "dependency closure");
        requireExactText(binding, "packageId", lock.packageId(), "dependency closure releaseBinding");
        requireExactText(binding, "packageVersion", lock.packageVersion(), "dependency closure releaseBinding");
        requireExactText(binding, "releaseId", lock.releaseId(), "dependency closure releaseBinding");
        requireExactText(binding, "contentDigest", lock.contentDigest(), "dependency closure releaseBinding");

        JsonNode definitions = requiredArray(closure, "definitions", "dependency closure");
        List<DefinitionRecord> records = new ArrayList<>();
        for (int index = 0; index < definitions.size(); index += 1) {
            JsonNode definition = definitions.get(index);
            String context = "dependency closure definitions[" + index + "]";
            JsonNode key = requiredObject(definition, "key", context);
            String canonicalKey = canonicalJson(key);
            String owner = requiredText(definition, "ownerPackageId", context);
            String digest = requiredPatternText(definition, "definitionDigest", CONTENT_DIGEST, context);
            records.add(new DefinitionRecord(canonicalKey, owner, digest));
        }
        return records;
    }

    private List<CurriculumRuntimeSnapshot.ScopeDimension> parseScopeDimensions(JsonNode catalog) {
        JsonNode dimensions = requiredArray(catalog, "scopeDimensions", "runtime catalog");
        List<CurriculumRuntimeSnapshot.ScopeDimension> result = new ArrayList<>();
        Set<String> dimensionIds = new LinkedHashSet<>();
        for (int index = 0; index < dimensions.size(); index += 1) {
            JsonNode dimension = dimensions.get(index);
            String context = "runtime catalog scopeDimensions[" + index + "]";
            String id = requiredText(dimension, "id", context);
            if (!dimensionIds.add(id)) {
                throw failure("Duplicate runtime catalog scope dimension: " + id);
            }
            List<String> values = requiredUniqueTextList(dimension, "values", context);
            if (values.isEmpty()) {
                throw failure(context + ".values must not be empty");
            }
            Set<String> declaredValues = new LinkedHashSet<>(values);
            List<CurriculumRuntimeSnapshot.ScopeComposite> composites = new ArrayList<>();
            Set<String> compositeValues = new LinkedHashSet<>();
            JsonNode compositesNode = dimension.get("composites");
            if (compositesNode != null) {
                if (!compositesNode.isArray()) {
                    throw failure(context + ".composites must be an array");
                }
                for (int compositeIndex = 0; compositeIndex < compositesNode.size(); compositeIndex += 1) {
                    JsonNode composite = compositesNode.get(compositeIndex);
                    String compositeContext = context + ".composites[" + compositeIndex + "]";
                    String value = requiredText(composite, "value", compositeContext);
                    List<String> members = requiredUniqueTextList(composite, "members", compositeContext);
                    if (!declaredValues.contains(value)
                            || !compositeValues.add(value)
                            || members.size() < 2
                            || members.stream().anyMatch(member -> member.equals(value)
                                    || !declaredValues.contains(member))) {
                        throw failure(compositeContext
                                + " must name a unique declared composite with distinct declared members");
                    }
                    composites.add(new CurriculumRuntimeSnapshot.ScopeComposite(value, members));
                }
            }
            result.add(new CurriculumRuntimeSnapshot.ScopeDimension(id, values, composites));
        }
        return List.copyOf(result);
    }

    private Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> loadLandscapes(
            InstalledCurriculumPackage installedPackage,
            JsonNode catalog,
            Map<String, ManifestFile> files,
            Set<String> verifiedPaths) {
        Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> result = new LinkedHashMap<>();
        JsonNode entries = requiredArray(catalog, "landscapes", "runtime catalog");
        for (int index = 0; index < entries.size(); index += 1) {
            JsonNode entry = entries.get(index);
            String context = "runtime catalog landscapes[" + index + "]";
            String id = requiredText(entry, "landscapeId", context);
            String role = requiredText(entry, "role", context);
            if (role.equals("embedded-fragment")) {
                throw failure("embedded-fragment landscapes are not supported by the DPK-006a loader");
            }
            if (!role.equals("root") && !role.equals("module")) {
                throw failure(context + ".role is unsupported: " + role);
            }
            String path = requiredRelativePath(entry, "artifactPath", context);
            ManifestFile file = files.get(path);
            if (file == null
                    || !file.role().equals("canonical-landscape")
                    || !file.runtimeRequired()) {
                throw failure("Landscape artifact is missing or has the wrong manifest role: " + path);
            }
            byte[] bytes = readArtifactBytes(installedPackage, file, verifiedPaths);
            JsonNode document = parseJson(bytes, "landscape " + id);
            requireExactText(document, "landscapeId", id, "landscape " + id);
            String defaultOfferingId = optionalText(entry, "defaultOfferingId");
            CurriculumRuntimeSnapshot.Artifact artifact = artifact(installedPackage, file);
            CurriculumRuntimeSnapshot.LandscapeDescriptor descriptor =
                    new CurriculumRuntimeSnapshot.LandscapeDescriptor(
                            installedPackage.lockEntry().packageId(),
                            id,
                            role,
                            requiredText(entry, "locale", context),
                            requiredText(entry, "frameworkId", context),
                            requiredText(entry, "subject", context),
                            optionalText(entry, "country"),
                            optionalText(entry, "region"),
                            optionalText(entry, "schoolForm"),
                            defaultOfferingId,
                            optionalText(entry, "parentLandscapeId"),
                            artifact,
                            decodeUtf8(bytes, "landscape " + id));
            CurriculumRuntimeSnapshot.putUnique(result, id, descriptor, "landscapeId inside package");
        }
        return result;
    }

    private List<String> readRootLandscapeIds(
            JsonNode catalog,
            Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> landscapes) {
        JsonNode roots = requiredArray(catalog, "rootLandscapeIds", "runtime catalog");
        List<String> result = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (JsonNode root : roots) {
            if (!root.isTextual() || !seen.add(root.textValue())) {
                throw failure("Runtime catalog rootLandscapeIds must be unique strings");
            }
            CurriculumRuntimeSnapshot.LandscapeDescriptor descriptor = landscapes.get(root.textValue());
            if (descriptor == null || !descriptor.role().equals("root")) {
                throw failure("Runtime catalog names an unknown/non-root landscape: " + root.textValue());
            }
            result.add(root.textValue());
        }
        if (result.isEmpty()) {
            throw failure("Runtime catalog must expose at least one root landscape");
        }
        Set<String> declaredRootRoles = new LinkedHashSet<>();
        landscapes.forEach((id, descriptor) -> {
            if (descriptor.role().equals("root")) {
                declaredRootRoles.add(id);
            }
        });
        if (!declaredRootRoles.equals(new LinkedHashSet<>(result))) {
            throw failure("Runtime catalog rootLandscapeIds is not the exact root-role landscape set");
        }
        return result;
    }

    private Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> loadViews(
            InstalledCurriculumPackage installedPackage,
            JsonNode catalog,
            JsonNode index,
            Map<String, ManifestFile> files,
            Set<String> verifiedPaths) {
        Map<String, CatalogArtifact> catalogEntries = parseCatalogArtifacts(
                requiredArray(catalog, "views", "runtime catalog"),
                "viewId",
                "runtime catalog views");
        JsonNode indexEntries = requiredArray(index, "views", "composition view index");
        Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> result = new LinkedHashMap<>();
        for (int position = 0; position < indexEntries.size(); position += 1) {
            JsonNode entry = indexEntries.get(position);
            String context = "composition view index views[" + position + "]";
            String id = requiredText(entry, "viewId", context);
            String path = requiredRelativePath(entry, "artifactPath", context);
            String landscapeId = requiredText(entry, "landscapeId", context);
            CatalogArtifact catalogEntry = catalogEntries.get(id);
            if (catalogEntry == null
                    || !catalogEntry.path().equals(path)
                    || !catalogEntry.landscapeId().equals(landscapeId)) {
                throw failure("Composition view index disagrees with runtime catalog for " + id);
            }
            ManifestFile file = requiredRole(files, path, "composition-view");
            byte[] bytes = readArtifactBytes(installedPackage, file, verifiedPaths);
            JsonNode document = parseJson(bytes, "composition view " + id);
            requireExactText(document, "viewId", id, "composition view " + id);
            requireExactText(document, "landscapeId", landscapeId, "composition view " + id);
            Map<String, String> scope = requiredStringMap(entry, "scope", context);
            CurriculumRuntimeSnapshot.ViewDescriptor descriptor = new CurriculumRuntimeSnapshot.ViewDescriptor(
                    installedPackage.lockEntry().packageId(),
                    id,
                    landscapeId,
                    requiredText(entry, "language", context),
                    scope,
                    artifact(installedPackage, file),
                    decodeUtf8(bytes, "composition view " + id));
            CurriculumRuntimeSnapshot.putUnique(result, id, descriptor, "viewId inside package");
        }
        if (!result.keySet().equals(catalogEntries.keySet())) {
            throw failure("Composition view index is not the exact runtime-catalog view set");
        }
        return result;
    }

    private Map<String, CurriculumRuntimeSnapshot.OfferingDescriptor> loadOfferings(
            String packageId,
            JsonNode catalog,
            Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views) {
        Map<String, CurriculumRuntimeSnapshot.OfferingDescriptor> result = new LinkedHashMap<>();
        JsonNode entries = requiredArray(catalog, "offeredScopes", "runtime catalog");
        for (int index = 0; index < entries.size(); index += 1) {
            JsonNode entry = entries.get(index);
            String context = "runtime catalog offeredScopes[" + index + "]";
            String id = requiredText(entry, "offeringId", context);
            String landscapeId = requiredText(entry, "landscapeId", context);
            Map<String, String> scope = requiredStringMap(entry, "scope", context);
            JsonNode resolution = requiredObject(entry, "viewResolution", context);
            String mode = requiredText(resolution, "mode", context + ".viewResolution");
            if (!mode.equals("single") && !mode.equals("merge")) {
                throw failure(context + ".viewResolution.mode is unsupported: " + mode);
            }
            List<String> viewIds = requiredUniqueTextList(resolution, "viewIds", context + ".viewResolution");
            String mergeDimension = optionalText(resolution, "mergeDimension");
            if ((mode.equals("single") && viewIds.size() != 1)
                    || (mode.equals("merge") && viewIds.size() < 2)) {
                throw failure(context + ".viewResolution view count disagrees with mode");
            }
            if ((mode.equals("single") && mergeDimension != null)
                    || (mode.equals("merge") && mergeDimension == null)) {
                throw failure(context + ".viewResolution mergeDimension disagrees with mode");
            }
            for (String viewId : viewIds) {
                CurriculumRuntimeSnapshot.ViewDescriptor view = views.get(viewId);
                if (view == null || !view.landscapeId().equals(landscapeId)) {
                    throw failure(context + " references an unknown or foreign viewId: " + viewId);
                }
            }
            CurriculumRuntimeSnapshot.OfferingDescriptor descriptor =
                    new CurriculumRuntimeSnapshot.OfferingDescriptor(
                            packageId,
                            id,
                            landscapeId,
                            scope,
                            mode,
                            mergeDimension,
                            viewIds);
            CurriculumRuntimeSnapshot.putUnique(result, id, descriptor, "offeringId inside package");
        }
        return result;
    }

    private Map<CurriculumRuntimeSnapshot.DeckKey, CurriculumRuntimeSnapshot.DeckDescriptor> loadDecks(
            InstalledCurriculumPackage installedPackage,
            JsonNode catalog,
            JsonNode index,
            Map<String, ManifestFile> files,
            Set<String> verifiedPaths) {
        Map<String, CatalogArtifact> catalogEntries = new LinkedHashMap<>();
        JsonNode catalogDecks = requiredArray(catalog, "decks", "runtime catalog");
        for (int indexPosition = 0; indexPosition < catalogDecks.size(); indexPosition += 1) {
            JsonNode entry = catalogDecks.get(indexPosition);
            String context = "runtime catalog decks[" + indexPosition + "]";
            String key = requiredText(entry, "deckId", context) + "\u0000" + requiredText(entry, "locale", context);
            CatalogArtifact value = new CatalogArtifact(
                    requiredText(entry, "landscapeId", context),
                    requiredRelativePath(entry, "artifactPath", context));
            if (catalogEntries.putIfAbsent(key, value) != null) {
                throw failure("Duplicate deckId/locale in runtime catalog: " + key);
            }
        }
        Map<CurriculumRuntimeSnapshot.DeckKey, CurriculumRuntimeSnapshot.DeckDescriptor> result = new LinkedHashMap<>();
        JsonNode indexDecks = requiredArray(index, "decks", "card index");
        Set<String> matched = new HashSet<>();
        for (int position = 0; position < indexDecks.size(); position += 1) {
            JsonNode entry = indexDecks.get(position);
            String context = "card index decks[" + position + "]";
            String deckId = requiredText(entry, "deckId", context);
            String locale = requiredText(entry, "language", context);
            String catalogKey = deckId + "\u0000" + locale;
            String landscapeId = requiredText(entry, "landscapeId", context);
            String path = requiredRelativePath(entry, "artifactPath", context);
            CatalogArtifact catalogEntry = catalogEntries.get(catalogKey);
            if (catalogEntry == null
                    || !catalogEntry.landscapeId().equals(landscapeId)
                    || !catalogEntry.path().equals(path)) {
                throw failure("Card index disagrees with runtime catalog for " + deckId + "@" + locale);
            }
            matched.add(catalogKey);
            ManifestFile file = requiredRole(files, path, "card-deck");
            byte[] bytes = readArtifactBytes(installedPackage, file, verifiedPaths);
            JsonNode document = parseJson(bytes, "card deck " + deckId + "@" + locale);
            requireExactText(document, "deckId", deckId, "card deck");
            requireExactText(document, "language", locale, "card deck");
            requireExactText(document, "landscapeId", landscapeId, "card deck");
            CurriculumRuntimeSnapshot.DeckKey key = new CurriculumRuntimeSnapshot.DeckKey(
                    installedPackage.lockEntry().packageId(), deckId, locale);
            CurriculumRuntimeSnapshot.DeckDescriptor descriptor = new CurriculumRuntimeSnapshot.DeckDescriptor(
                    key,
                    landscapeId,
                    artifact(installedPackage, file),
                    decodeUtf8(bytes, "card deck " + deckId + "@" + locale));
            CurriculumRuntimeSnapshot.putUnique(result, key, descriptor, "deck key inside package");
        }
        if (!matched.equals(catalogEntries.keySet())) {
            throw failure("Card index is not the exact runtime-catalog deck set");
        }
        return result;
    }

    private Map<String, CurriculumRuntimeSnapshot.ResourceDescriptor> loadResources(
            InstalledCurriculumPackage installedPackage,
            JsonNode catalog,
            JsonNode index,
            Map<String, ManifestFile> files) {
        Map<String, JsonNode> catalogEntries = indexObjectsById(
                requiredArray(catalog, "resources", "runtime catalog"),
                "resourceId",
                "runtime catalog resources");
        Map<String, CurriculumRuntimeSnapshot.ResourceDescriptor> result = new LinkedHashMap<>();
        JsonNode indexEntries = requiredArray(index, "resources", "resource index");
        for (int position = 0; position < indexEntries.size(); position += 1) {
            JsonNode entry = indexEntries.get(position);
            String context = "resource index resources[" + position + "]";
            String id = requiredText(entry, "resourceId", context);
            JsonNode catalogEntry = catalogEntries.get(id);
            if (catalogEntry == null) {
                throw failure("Resource index contains an unknown resourceId: " + id);
            }
            String delivery = requiredText(entry, "delivery", context);
            requireExactText(catalogEntry, "delivery", delivery, "runtime catalog resource " + id);
            String mediaType = requiredText(entry, "mediaType", context);
            requireExactText(catalogEntry, "mediaType", mediaType, "runtime catalog resource " + id);
            String landscapeId = requiredText(entry, "landscapeId", context);
            requireExactText(catalogEntry, "landscapeId", landscapeId, "runtime catalog resource " + id);
            String resourceKind = requiredText(entry, "resourceKind", context);
            String catalogResourceKind = requiredText(
                    catalogEntry, "resourceKind", "runtime catalog resource " + id);
            String ownerGoalId = optionalText(entry, "ownerGoalId");
            String catalogGoalId = optionalText(catalogEntry, "goalId");
            if (ownerGoalId == null) {
                ownerGoalId = catalogGoalId;
            } else if (catalogGoalId != null && !ownerGoalId.equals(catalogGoalId)) {
                throw failure("Resource ownerGoalId disagrees with runtime catalog for " + id);
            }
            String publicUrl = normalizePublicUrl(optionalText(entry, "publicUrl"), id);
            String externalUrl = normalizeExternalUrl(optionalText(entry, "externalUrl"), id);
            CurriculumRuntimeSnapshot.Artifact artifact = null;
            if (delivery.equals("embedded")) {
                if (!resourceKind.equals(catalogResourceKind)) {
                    throw failure("Embedded resourceKind disagrees with runtime catalog for " + id);
                }
                requireBoolean(entry, "runtimeRequired", true, context);
                requireBoolean(catalogEntry, "runtimeRequired", true, "runtime catalog resource " + id);
                String path = requiredRelativePath(entry, "artifactPath", context);
                requireExactText(catalogEntry, "artifactPath", path, "runtime catalog resource " + id);
                ManifestFile file = requiredRole(files, path, "binary-asset");
                if (!file.mediaType().equals(mediaType)) {
                    throw failure("Resource mediaType disagrees with manifest for " + id);
                }
                artifact = artifact(installedPackage, file);
            } else if (delivery.equals("external")) {
                requireBoolean(entry, "runtimeRequired", false, context);
                requireBoolean(catalogEntry, "runtimeRequired", false, "runtime catalog resource " + id);
                String catalogExternalUrl = normalizeExternalUrl(
                        optionalText(catalogEntry, "externalUrl"), id);
                if (externalUrl == null || !externalUrl.equals(catalogExternalUrl)) {
                    throw failure("External resource URL disagrees with runtime catalog for " + id);
                }
            } else {
                throw failure("Unsupported resource delivery for " + id + ": " + delivery);
            }
            CurriculumRuntimeSnapshot.ResourceDescriptor descriptor =
                    new CurriculumRuntimeSnapshot.ResourceDescriptor(
                            installedPackage.lockEntry().packageId(),
                            id,
                            landscapeId,
                            ownerGoalId,
                            resourceKind,
                            catalogResourceKind,
                            delivery,
                            mediaType,
                            publicUrl,
                            externalUrl,
                            artifact);
            CurriculumRuntimeSnapshot.putUnique(result, id, descriptor, "resourceId inside package");
        }
        if (!result.keySet().equals(catalogEntries.keySet())) {
            throw failure("Resource index is not the exact runtime-catalog resource set");
        }
        return result;
    }

    private Map<String, CatalogArtifact> parseCatalogArtifacts(JsonNode entries, String idField, String context) {
        Map<String, CatalogArtifact> result = new LinkedHashMap<>();
        for (int index = 0; index < entries.size(); index += 1) {
            JsonNode entry = entries.get(index);
            String entryContext = context + "[" + index + "]";
            String id = requiredText(entry, idField, entryContext);
            CatalogArtifact artifact = new CatalogArtifact(
                    requiredText(entry, "landscapeId", entryContext),
                    requiredRelativePath(entry, "artifactPath", entryContext));
            if (result.putIfAbsent(id, artifact) != null) {
                throw failure("Duplicate " + idField + " in " + context + ": " + id);
            }
        }
        return result;
    }

    private Map<String, JsonNode> indexObjectsById(JsonNode entries, String idField, String context) {
        Map<String, JsonNode> result = new LinkedHashMap<>();
        for (int index = 0; index < entries.size(); index += 1) {
            JsonNode entry = entries.get(index);
            String id = requiredText(entry, idField, context + "[" + index + "]");
            if (result.putIfAbsent(id, entry) != null) {
                throw failure("Duplicate " + idField + " in " + context + ": " + id);
            }
        }
        return result;
    }

    private JsonNode readJsonArtifact(
            InstalledCurriculumPackage installedPackage,
            ManifestFile file,
            Set<String> verifiedPaths) {
        return parseJson(
                readArtifactBytes(installedPackage, file, verifiedPaths),
                file.role() + " " + file.path());
    }

    private byte[] readArtifactBytes(
            InstalledCurriculumPackage installedPackage,
            ManifestFile file,
            Set<String> verifiedPaths) {
        if (!file.runtimeRequired()) {
            throw failure("Runtime artifact is not marked runtimeRequired: " + file.path());
        }
        byte[] bytes = fileReader.readVerifiedArtifact(
                installedPackage,
                file.path(),
                file.bytes(),
                file.sha256(),
                CurriculumPackageFileReader.MAX_CONTROL_BYTES);
        verifiedPaths.add(file.path());
        return bytes;
    }

    private CurriculumRuntimeSnapshot.Artifact artifact(
            InstalledCurriculumPackage installedPackage,
            ManifestFile file) {
        return new CurriculumRuntimeSnapshot.Artifact(
                installedPackage,
                file.path(),
                file.role(),
                file.mediaType(),
                file.bytes(),
                file.sha256());
    }

    private ManifestFile requiredRole(Map<String, ManifestFile> files, String path, String role) {
        ManifestFile file = files.get(path);
        if (file == null || !file.role().equals(role) || !file.runtimeRequired()) {
            throw failure("Missing runtimeRequired manifest role " + role + " at " + path);
        }
        return file;
    }

    private ManifestFile exactlyOneRole(Map<String, ManifestFile> files, String role) {
        List<ManifestFile> matches = files.values().stream().filter(file -> file.role().equals(role)).toList();
        if (matches.size() != 1 || !matches.get(0).runtimeRequired()) {
            throw failure("Manifest must contain exactly one runtimeRequired " + role);
        }
        return matches.get(0);
    }

    private void mergeDefinitions(Map<String, DefinitionBinding> merged, List<DefinitionRecord> definitions) {
        for (DefinitionRecord definition : definitions) {
            DefinitionBinding binding = new DefinitionBinding(definition.ownerPackageId(), definition.definitionDigest());
            DefinitionBinding previous = merged.putIfAbsent(definition.canonicalKey(), binding);
            if (previous != null && !previous.equals(binding)) {
                throw failure("Cross-package definition conflict for key " + definition.canonicalKey());
            }
        }
    }

    private String canonicalJson(JsonNode node) {
        try {
            return objectMapper.writeValueAsString(sortNode(node));
        } catch (IOException e) {
            throw failure("Cannot canonicalize definition key", e);
        }
    }

    private JsonNode sortNode(JsonNode node) {
        if (node.isObject()) {
            ObjectNode sorted = objectMapper.createObjectNode();
            List<String> fields = new ArrayList<>();
            node.fieldNames().forEachRemaining(fields::add);
            fields.sort(Comparator.naturalOrder());
            for (String field : fields) {
                sorted.set(field, sortNode(node.get(field)));
            }
            return sorted;
        }
        if (node.isArray()) {
            ArrayNode copy = objectMapper.createArrayNode();
            node.forEach(value -> copy.add(sortNode(value)));
            return copy;
        }
        return node.deepCopy();
    }

    private void requireCompatibleSoftware(String range) {
        SemanticVersion consumer = SemanticVersion.parse(properties.getConsumerVersion(), "consumer version");
        String[] terms = range.trim().split("\\s+");
        if (terms.length == 0) {
            throw failure("supportedSkillpilotSoftware must not be empty");
        }
        for (String term : terms) {
            Matcher matcher = COMPARATOR.matcher(term);
            if (!matcher.matches()) {
                throw failure("Unsupported supportedSkillpilotSoftware expression: " + range);
            }
            SemanticVersion bound = new SemanticVersion(
                    Integer.parseInt(matcher.group(2)),
                    Integer.parseInt(matcher.group(3)),
                    Integer.parseInt(matcher.group(4)),
                    null);
            int comparison = consumer.compareTo(bound);
            String operator = matcher.group(1) == null ? "=" : matcher.group(1);
            boolean matches = switch (operator) {
                case ">=" -> comparison >= 0;
                case ">" -> comparison > 0;
                case "<=" -> comparison <= 0;
                case "<" -> comparison < 0;
                case "=" -> comparison == 0;
                default -> false;
            };
            if (!matches) {
                throw failure("Configured curriculum consumer version " + properties.getConsumerVersion()
                        + " is outside supportedSkillpilotSoftware " + range);
            }
        }
    }

    private JsonNode parseJson(byte[] bytes, String description) {
        try {
            JsonNode node = objectMapper.readTree(bytes);
            if (node == null || !node.isObject()) {
                throw failure(description + " must be a JSON object");
            }
            CurriculumPackageJson.validateTree(node, description);
            return node;
        } catch (IOException e) {
            throw failure("Cannot parse " + description, e);
        }
    }

    private static String decodeUtf8(byte[] bytes, String description) {
        try {
            return StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes))
                    .toString();
        } catch (CharacterCodingException e) {
            throw failure(description + " is not valid UTF-8", e);
        }
    }

    private static Map<String, String> requiredStringMap(JsonNode parent, String field, String context) {
        JsonNode object = requiredObject(parent, field, context);
        Map<String, String> result = new LinkedHashMap<>();
        object.fields().forEachRemaining(entry -> {
            if (!entry.getValue().isTextual() || entry.getValue().textValue().isBlank()) {
                throw failure(context + "." + field + "." + entry.getKey() + " must be non-blank text");
            }
            result.put(entry.getKey(), entry.getValue().textValue());
        });
        return result;
    }

    private static List<String> requiredUniqueTextList(JsonNode parent, String field, String context) {
        JsonNode array = requiredArray(parent, field, context);
        List<String> result = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        for (JsonNode value : array) {
            if (!value.isTextual() || value.textValue().isBlank() || !seen.add(value.textValue())) {
                throw failure(context + "." + field + " must contain unique non-blank strings");
            }
            result.add(value.textValue());
        }
        return result;
    }

    private static String normalizePublicUrl(String value, String resourceId) {
        if (value == null) {
            return null;
        }
        if (!value.startsWith("/")
                || value.startsWith("//")
                || value.contains("\\")
                || value.contains("?")
                || value.contains("#")
                || value.contains("/../")
                || value.endsWith("/..")) {
            throw failure("Resource has an unsafe publicUrl: " + resourceId);
        }
        return value;
    }

    private static String normalizeExternalUrl(String value, String resourceId) {
        if (value == null) {
            return null;
        }
        try {
            URI uri = new URI(value);
            if (!uri.isAbsolute()
                    || uri.getHost() == null
                    || uri.getUserInfo() != null
                    || !uri.getScheme().equalsIgnoreCase("https")) {
                throw failure("Resource has an unsafe externalUrl: " + resourceId);
            }
            return uri.toASCIIString();
        } catch (URISyntaxException error) {
            throw failure("Resource has an invalid externalUrl: " + resourceId, error);
        }
    }

    private static void requireBoolean(JsonNode parent, String field, boolean expected, String context) {
        JsonNode value = parent.get(field);
        if (value == null || !value.isBoolean() || value.booleanValue() != expected) {
            throw failure(context + "." + field + " must equal " + expected);
        }
    }

    private static JsonNode requiredObject(JsonNode parent, String field, String context) {
        return FileSystemCurriculumPackageRepository.requiredObject(parent, field, context);
    }

    private static JsonNode requiredArray(JsonNode parent, String field, String context) {
        return FileSystemCurriculumPackageRepository.requiredArray(parent, field, context);
    }

    private static String requiredText(JsonNode parent, String field, String context) {
        return FileSystemCurriculumPackageRepository.requiredText(parent, field, context);
    }

    private static String requiredPatternText(JsonNode parent, String field, Pattern pattern, String context) {
        return FileSystemCurriculumPackageRepository.requiredPatternText(parent, field, pattern, context);
    }

    private static void requireExactText(JsonNode parent, String field, String expected, String context) {
        FileSystemCurriculumPackageRepository.requireExactText(parent, field, expected, context);
    }

    private static String requiredRelativePath(JsonNode parent, String field, String context) {
        String value = requiredText(parent, field, context);
        CurriculumPackageFileReader.validateRelativePath(value, context + "." + field);
        return value;
    }

    private static long requiredNonNegativeLong(JsonNode parent, String field, String context) {
        JsonNode value = parent.get(field);
        if (value == null || !value.isIntegralNumber() || !value.canConvertToLong() || value.longValue() < 0) {
            throw failure(context + "." + field + " must be a non-negative integer");
        }
        return value.longValue();
    }

    private static String optionalText(JsonNode parent, String field) {
        JsonNode value = parent.get(field);
        return value != null && value.isTextual() && !value.textValue().isBlank() ? value.textValue() : null;
    }

    private static CurriculumPackageException failure(String message) {
        return new CurriculumPackageException(message);
    }

    private static CurriculumPackageException failure(String message, Throwable cause) {
        return new CurriculumPackageException(message, cause);
    }

    private record ManifestFile(
            String path,
            String role,
            String mediaType,
            long bytes,
            String sha256,
            boolean runtimeRequired) {
    }

    private record CatalogArtifact(String landscapeId, String path) {
    }

    private record DefinitionRecord(String canonicalKey, String ownerPackageId, String definitionDigest) {
    }

    private record DefinitionBinding(String ownerPackageId, String definitionDigest) {
    }

    private record LoadedPackage(
            CurriculumRuntimeSnapshot.PackageDescriptor packageDescriptor,
            List<String> rootLandscapeIds,
            Map<String, CurriculumRuntimeSnapshot.LandscapeDescriptor> landscapes,
            Map<String, CurriculumRuntimeSnapshot.ViewDescriptor> views,
            Map<String, CurriculumRuntimeSnapshot.OfferingDescriptor> offerings,
            Map<CurriculumRuntimeSnapshot.DeckKey, CurriculumRuntimeSnapshot.DeckDescriptor> decks,
            Map<String, CurriculumRuntimeSnapshot.ResourceDescriptor> resources,
            String migrationAliasesJson,
            List<DefinitionRecord> definitions) {
    }

    private record SemanticVersion(int major, int minor, int patch, String prerelease)
            implements Comparable<SemanticVersion> {
        static SemanticVersion parse(String value, String description) {
            if (value == null) {
                throw failure(description + " must not be null");
            }
            String normalized = value.trim();
            String withoutBuild = normalized.split("[+]", 2)[0];
            int prereleaseSeparator = withoutBuild.indexOf('-');
            String core = prereleaseSeparator >= 0
                    ? withoutBuild.substring(0, prereleaseSeparator)
                    : withoutBuild;
            String prerelease = prereleaseSeparator >= 0
                    ? withoutBuild.substring(prereleaseSeparator + 1)
                    : null;
            if (prerelease != null && prerelease.isBlank()) {
                throw failure(description + " has an empty prerelease identifier: " + value);
            }
            if (prerelease != null) {
                for (String identifier : prerelease.split("[.]", -1)) {
                    if (!identifier.matches("[0-9A-Za-z-]+")
                            || (identifier.matches("[0-9]+") && !identifier.matches("0|[1-9][0-9]*"))) {
                        throw failure(description + " has an invalid prerelease identifier: " + value);
                    }
                }
            }
            Matcher matcher = Pattern.compile("^(\\d+)\\.(\\d+)\\.(\\d+)$").matcher(core);
            if (!matcher.matches()) {
                throw failure(description + " must be an explicit semantic version: " + value);
            }
            return new SemanticVersion(
                    Integer.parseInt(matcher.group(1)),
                    Integer.parseInt(matcher.group(2)),
                    Integer.parseInt(matcher.group(3)),
                    prerelease);
        }

        @Override
        public int compareTo(SemanticVersion other) {
            int majorComparison = Integer.compare(major, other.major);
            if (majorComparison != 0) {
                return majorComparison;
            }
            int minorComparison = Integer.compare(minor, other.minor);
            if (minorComparison != 0) {
                return minorComparison;
            }
            int patchComparison = Integer.compare(patch, other.patch);
            if (patchComparison != 0) {
                return patchComparison;
            }
            if (prerelease == null && other.prerelease == null) {
                return 0;
            }
            if (prerelease == null) {
                return 1;
            }
            if (other.prerelease == null) {
                return -1;
            }
            String[] leftIdentifiers = prerelease.split("[.]", -1);
            String[] rightIdentifiers = other.prerelease.split("[.]", -1);
            int sharedLength = Math.min(leftIdentifiers.length, rightIdentifiers.length);
            for (int index = 0; index < sharedLength; index += 1) {
                String left = leftIdentifiers[index];
                String right = rightIdentifiers[index];
                if (!left.matches("[0-9A-Za-z-]+") || !right.matches("[0-9A-Za-z-]+")) {
                    throw failure("Consumer version has an invalid prerelease identifier");
                }
                boolean leftNumeric = left.matches("0|[1-9][0-9]*");
                boolean rightNumeric = right.matches("0|[1-9][0-9]*");
                int comparison;
                if (leftNumeric && rightNumeric) {
                    comparison = compareNumericIdentifier(left, right);
                } else if (leftNumeric) {
                    comparison = -1;
                } else if (rightNumeric) {
                    comparison = 1;
                } else {
                    comparison = left.compareTo(right);
                }
                if (comparison != 0) {
                    return comparison;
                }
            }
            return Integer.compare(leftIdentifiers.length, rightIdentifiers.length);
        }

        private static int compareNumericIdentifier(String left, String right) {
            int lengthComparison = Integer.compare(left.length(), right.length());
            return lengthComparison != 0 ? lengthComparison : left.compareTo(right);
        }
    }
}
