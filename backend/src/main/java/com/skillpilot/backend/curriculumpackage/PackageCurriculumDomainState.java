package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Fully projected service input with immutable indexes for one exact package-lock generation.
 *
 * <p>Construction has no repository or classpath fallback. Every landscape comes from the
 * snapshot-bound canonical artifact, and every source mapping comes from the two verified package
 * evidence artifacts owned by the same package.
 */
public final class PackageCurriculumDomainState {

    private static final String MAPPING_ROLE = "mapping";
    private static final String SOURCE_INDEX_ROLE = "source-index";

    private final String generationSha256;
    private final List<SkillLandscape> landscapes;
    private final Map<String, SkillLandscape> landscapesById;
    private final Map<String, String> landscapeIdByGoalId;
    private final List<String> rootLandscapeIds;
    private final PackageLandscapeMappingState.Merged mappingState;

    private PackageCurriculumDomainState(
            String generationSha256,
            List<SkillLandscape> landscapes,
            Map<String, SkillLandscape> landscapesById,
            Map<String, String> landscapeIdByGoalId,
            List<String> rootLandscapeIds,
            PackageLandscapeMappingState.Merged mappingState) {
        this.generationSha256 = generationSha256;
        this.landscapes = List.copyOf(landscapes);
        this.landscapesById = immutableOrderedMap(landscapesById);
        this.landscapeIdByGoalId = immutableOrderedMap(landscapeIdByGoalId);
        this.rootLandscapeIds = List.copyOf(rootLandscapeIds);
        this.mappingState = Objects.requireNonNull(mappingState, "mappingState");
    }

    static PackageCurriculumDomainState load(
            CurriculumRuntimeSnapshot snapshot,
            CurriculumPackageArtifactReader artifactReader,
            ObjectMapper objectMapper) {
        Objects.requireNonNull(snapshot, "snapshot");
        Objects.requireNonNull(artifactReader, "artifactReader");
        ObjectMapper strictMapper = CurriculumPackageJson.strictCopy(
                Objects.requireNonNull(objectMapper, "objectMapper"));

        List<SkillLandscape> landscapes = new ArrayList<>();
        Map<String, SkillLandscape> landscapesById = new LinkedHashMap<>();
        Map<String, String> landscapeIdByGoalId = new LinkedHashMap<>();
        Map<String, Set<String>> landscapeIdsByPackage = new LinkedHashMap<>();
        Map<String, Set<String>> goalIdsByPackage = new LinkedHashMap<>();

        for (CurriculumRuntimeSnapshot.LandscapeDescriptor descriptor
                : snapshot.landscapesById().values()) {
            SkillLandscape landscape = parseLandscape(strictMapper, descriptor);
            validateDescriptorBinding(descriptor, landscape);
            if (landscape.getGoals() == null) {
                throw failure("Package landscape has no goals array: " + descriptor.landscapeId());
            }
            for (LearningGoal goal : landscape.getGoals()) {
                if (goal == null || isBlank(goal.getId())) {
                    throw failure("Package landscape contains a goal without id: " + descriptor.landscapeId());
                }
                String previousLandscape = landscapeIdByGoalId.putIfAbsent(
                        goal.getId(), descriptor.landscapeId());
                if (previousLandscape != null) {
                    throw failure("Goal id is ambiguous across package landscapes: " + goal.getId());
                }
                goalIdsByPackage
                        .computeIfAbsent(descriptor.packageId(), ignored -> new LinkedHashSet<>())
                        .add(goal.getId());
            }
            if (landscapesById.putIfAbsent(descriptor.landscapeId(), landscape) != null) {
                throw failure("Duplicate package landscapeId: " + descriptor.landscapeId());
            }
            landscapes.add(landscape);
            landscapeIdsByPackage
                    .computeIfAbsent(descriptor.packageId(), ignored -> new LinkedHashSet<>())
                    .add(descriptor.landscapeId());
        }

        if (!landscapesById.keySet().equals(snapshot.landscapesById().keySet())) {
            throw failure("Typed package landscapes are not the exact snapshot landscape set");
        }
        for (String rootLandscapeId : snapshot.rootLandscapeIds()) {
            CurriculumRuntimeSnapshot.LandscapeDescriptor descriptor =
                    snapshot.landscapesById().get(rootLandscapeId);
            if (descriptor == null || !"root".equals(descriptor.role())) {
                throw failure("Package rootLandscapeIds contains an unknown/non-root landscape: "
                        + rootLandscapeId);
            }
        }

        PackageLandscapeMappingCompiler mappingCompiler =
                new PackageLandscapeMappingCompiler(strictMapper);
        List<PackageLandscapeMappingState> packageMappingStates = new ArrayList<>();
        for (CurriculumRuntimeSnapshot.PackageDescriptor packageDescriptor : snapshot.packages()) {
            String packageId = packageDescriptor.packageId();
            Set<String> packageLandscapeIds = landscapeIdsByPackage.getOrDefault(packageId, Set.of());
            Set<String> packageGoalIds = goalIdsByPackage.getOrDefault(packageId, Set.of());
            List<String> packageRootIds = snapshot.rootLandscapeIds().stream()
                    .filter(rootId -> packageId.equals(snapshot.landscapesById().get(rootId).packageId()))
                    .toList();
            if (packageLandscapeIds.isEmpty() || packageRootIds.isEmpty()) {
                throw failure("Every active curriculum package must own at least one root landscape: "
                        + packageId);
            }
            CurriculumRuntimeSnapshot.Artifact mappingArtifact = exactlyOneArtifact(
                    snapshot,
                    packageId,
                    MAPPING_ROLE,
                    "source-to-canonical-mappings");
            CurriculumRuntimeSnapshot.Artifact sourceIndexArtifact = exactlyOneArtifact(
                    snapshot,
                    packageId,
                    SOURCE_INDEX_ROLE,
                    "official-source-index");
            byte[] mappingBytes = artifactReader.readVerified(
                    mappingArtifact, CurriculumPackageFileReader.MAX_CONTROL_BYTES);
            byte[] sourceIndexBytes = artifactReader.readVerified(
                    sourceIndexArtifact, CurriculumPackageFileReader.MAX_CONTROL_BYTES);
            String mappingTargetLandscapeId = readMappingTargetLandscapeId(
                    strictMapper, mappingBytes, packageId);
            if (!packageRootIds.contains(mappingTargetLandscapeId)) {
                throw failure("Package mapping target is not one of its catalog roots: "
                        + mappingTargetLandscapeId);
            }
            packageMappingStates.add(mappingCompiler.compile(
                    packageId,
                    mappingBytes,
                    sourceIndexBytes,
                    mappingTargetLandscapeId,
                    packageLandscapeIds,
                    packageGoalIds));
        }

        return new PackageCurriculumDomainState(
                snapshot.generationSha256(),
                landscapes,
                landscapesById,
                landscapeIdByGoalId,
                snapshot.rootLandscapeIds(),
                PackageLandscapeMappingState.merge(packageMappingStates));
    }

    public String generationSha256() {
        return generationSha256;
    }

    public List<SkillLandscape> landscapes() {
        return landscapes;
    }

    public Map<String, SkillLandscape> landscapesById() {
        return landscapesById;
    }

    public Map<String, String> landscapeIdByGoalId() {
        return landscapeIdByGoalId;
    }

    public List<String> rootLandscapeIds() {
        return rootLandscapeIds;
    }

    public PackageLandscapeMappingState.Merged mappingState() {
        return mappingState;
    }

    private static SkillLandscape parseLandscape(
            ObjectMapper objectMapper,
            CurriculumRuntimeSnapshot.LandscapeDescriptor descriptor) {
        try {
            return objectMapper.readValue(descriptor.json(), SkillLandscape.class);
        } catch (JsonProcessingException e) {
            throw failure("Cannot bind package landscape " + descriptor.landscapeId(), e);
        }
    }

    private static String readMappingTargetLandscapeId(
            ObjectMapper objectMapper,
            byte[] mappingBytes,
            String packageId) {
        try {
            var root = objectMapper.readTree(mappingBytes);
            var target = root == null ? null : root.get("targetLandscapeId");
            if (target == null || !target.isTextual() || isBlank(target.textValue())) {
                throw failure("Package mapping has no targetLandscapeId: " + packageId);
            }
            return target.textValue();
        } catch (java.io.IOException e) {
            throw failure("Cannot read package mapping targetLandscapeId: " + packageId, e);
        }
    }

    private static void validateDescriptorBinding(
            CurriculumRuntimeSnapshot.LandscapeDescriptor descriptor,
            SkillLandscape landscape) {
        requireEqual(descriptor.landscapeId(), landscape.getLandscapeId(), "landscapeId");
        requireEqual(descriptor.locale(), landscape.getLocale(), "locale");
        requireEqual(descriptor.frameworkId(), landscape.getFrameworkId(), "frameworkId");
        requireEqual(descriptor.subject(), landscape.getSubject(), "subject");
        requireOptionalEqual(descriptor.country(), landscape.getCountry(), "country");
        requireOptionalEqual(descriptor.region(), landscape.getRegion(), "region");
        requireOptionalEqual(descriptor.schoolForm(), landscape.getSchoolType(), "schoolForm/schoolType");
    }

    private static CurriculumRuntimeSnapshot.Artifact exactlyOneArtifact(
            CurriculumRuntimeSnapshot snapshot,
            String packageId,
            String role,
            String normalizationRole) {
        List<CurriculumRuntimeSnapshot.Artifact> matches = snapshot.artifactsByRole()
                .getOrDefault(role, List.of())
                .stream()
                .filter(artifact -> packageId.equals(artifact.packageId()))
                .toList();
        if (matches.size() != 1) {
            throw failure("Package must contain exactly one " + role + " artifact: " + packageId);
        }
        CurriculumRuntimeSnapshot.Artifact artifact = matches.get(0);
        if (!"application/json".equals(artifact.mediaType())
                || !"logical-artifact".equals(artifact.semanticBindingKind())
                || !normalizationRole.equals(artifact.normalizationRole())
                || artifact.runtimeRequired()) {
            throw failure("Package artifact binding disagrees with role " + role + ": " + packageId);
        }
        return artifact;
    }

    private static void requireEqual(String expected, String actual, String field) {
        if (isBlank(expected) || !expected.equals(actual)) {
            throw failure("Runtime catalog and landscape payload disagree on " + field);
        }
    }

    private static void requireOptionalEqual(String expected, String actual, String field) {
        if (expected != null && !expected.equals(actual)) {
            throw failure("Runtime catalog and landscape payload disagree on " + field);
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static <K, V> Map<K, V> immutableOrderedMap(Map<K, V> source) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(source));
    }

    private static CurriculumPackageException failure(String message) {
        return new CurriculumPackageException(message);
    }

    private static CurriculumPackageException failure(String message, Throwable cause) {
        return new CurriculumPackageException(message, cause);
    }
}
