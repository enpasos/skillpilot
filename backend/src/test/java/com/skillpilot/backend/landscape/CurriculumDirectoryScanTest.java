package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class CurriculumDirectoryScanTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @TempDir
    Path tempDir;

    @Test
    void preservesMappingFilesSortedOrderFingerprintsAndSymlinkReloads() throws Exception {
        // A configured root named quality is accepted: the exclusion is relative to this root.
        Path root = Files.createDirectory(tempDir.resolve("quality"));
        Path archive = writeMapping(root.resolve("DE/Gymnasium/archive/mapping/active.json"), "archive", "canonical");
        Path first = writeMapping(root.resolve("mapping/a.json"), "first", "canonical");
        Path second = writeMapping(root.resolve("mapping/b.json"), "second", "canonical");
        Path source = writeMapping(tempDir.resolve("external/source.json"), "linked", "before");
        Path link = Files.createSymbolicLink(root.resolve("mapping/linked.json"), source);
        Path uppercase = writeMapping(root.resolve("mapping/zcase/Quality/active.json"), "uppercase", "canonical");
        Path neighbor = writeMapping(root.resolve("quality-neighbor/mapping/active.json"), "neighbor", "canonical");
        Files.createSymbolicLink(root.resolve("mapping/directory-link"), source.getParent());
        Path ignored = writeMapping(root.resolve("mapping/quality/nested/candidate.json"), "first", "conflict");
        writeMapping(root.resolve("other/quality/mapping/candidate.json"), "first", "conflict");
        Files.writeString(root.resolve("mapping/malformed.review.json"), "{");
        List<Path> expected = List.of(archive, first, second, link, uppercase, neighbor);

        GoalMappingService service = new GoalMappingService(properties(root), objectMapper);

        assertThat(service.getAllMappings()).extracting(ResolvedGoalMapping::sourceFile)
                .containsExactlyElementsOf(expected.stream().map(Path::toString).toList());
        long previousFingerprint = legacyMappingFingerprint(root);
        assertThat(readLong(service, "lastLoadedFingerprint")).isEqualTo(previousFingerprint);
        assertThat(invokeLong(service, "computeFingerprint")).isEqualTo(previousFingerprint);

        writeMapping(ignored, "first", "another-conflict");
        Files.setLastModifiedTime(ignored, FileTime.fromMillis(System.currentTimeMillis() + 10_000));
        assertThat(invokeLong(service, "computeFingerprint")).isEqualTo(previousFingerprint);

        writeMapping(source, "linked", "after");
        Files.setLastModifiedTime(source, FileTime.fromMillis(System.currentTimeMillis() + 20_000));
        resetReloadCheck(service);
        assertThat(service.findByLegacyGoalId("linked")).get()
                .extracting(ResolvedGoalMapping::canonicalGoalId, ResolvedGoalMapping::sourceFile)
                .containsExactly("after", link.toString());
        assertThat(readLong(service, "lastLoadedFingerprint")).isEqualTo(legacyMappingFingerprint(root))
                .isNotEqualTo(previousFingerprint);
    }

    @Test
    void preservesLandscapeScopeSortedDuplicateChoiceAndFileSymlinkReloads() throws Exception {
        Path root = Files.createDirectory(tempDir.resolve("curricula"));
        Path first = writeLandscape(root.resolve("DE/Gymnasium/canonical/a.json"), "current", "First");
        Path duplicate = writeLandscape(root.resolve("DE/Gymnasium/canonical/b.json"), "current", "Duplicate");
        Path source = writeLandscape(tempDir.resolve("external/source.json"), "linked", "Before");
        Path link = Files.createSymbolicLink(first.getParent().resolve("linked.json"), source);
        Path neighbor = writeLandscape(root.resolve("DE/Gymnasium/quality-neighbor/active.json"), "neighbor", "Neighbor");
        Path otherQuality = writeLandscape(root.resolve("other/quality/active.json"), "other-quality", "Accepted");
        Path ignored = writeLandscape(root.resolve("DE/Gymnasium/quality/nested/candidate.json"), "current", "Candidate");
        Files.createSymbolicLink(root.resolve("directory-link"), source.getParent());
        for (Path file : List.of(first, duplicate, link, neighbor, otherQuality)) {
            Files.setLastModifiedTime(file, FileTime.fromMillis(10_000));
        }
        Files.setLastModifiedTime(ignored, FileTime.fromMillis(30_000));

        LandscapeService service = new LandscapeService(properties(root), objectMapper);

        assertThat(service.getAll()).extracting(SkillLandscape::getLandscapeId)
                .containsExactly("current", "linked", "neighbor", "other-quality");
        assertThat(service.getById("current").getTitle()).isEqualTo("First");
        assertThat(readLong(service, "lastLoadedFingerprint")).isEqualTo(10_000);
        assertThat(invokeLong(service, "getLatestTimestamp", root)).isEqualTo(10_000);

        writeLandscape(ignored, "current", "Changed candidate");
        Files.setLastModifiedTime(ignored, FileTime.fromMillis(40_000));
        assertThat(invokeLong(service, "getLatestTimestamp", root)).isEqualTo(10_000);

        writeLandscape(source, "linked", "After");
        Files.setLastModifiedTime(source, FileTime.fromMillis(20_000));
        resetReloadCheck(service);
        assertThat(service.getById("linked").getTitle()).isEqualTo("After");
        assertThat(readLong(service, "lastLoadedFingerprint")).isEqualTo(20_000);
        assertThat(service.getById("current").getTitle()).isEqualTo("First");
    }

    private Path writeMapping(Path file, String legacyGoalId, String canonicalGoalId) throws Exception {
        Files.createDirectories(file.getParent());
        Files.writeString(file, objectMapper.writeValueAsString(Map.of(
                "version", 1, "sourceLandscapeId", "source", "targetLandscapeId", "target",
                "mappings", List.of(Map.of("legacyGoalId", legacyGoalId,
                        "canonicalGoalId", canonicalGoalId, "matchType", "exact")))));
        return file;
    }

    private Path writeLandscape(Path file, String id, String title) throws Exception {
        Files.createDirectories(file.getParent());
        Files.writeString(file, objectMapper.writeValueAsString(Map.of(
                "landscapeId", id, "title", title, "goals", List.of(Map.of("id", id + "-goal", "title", title)))));
        return file;
    }

    private long legacyMappingFingerprint(Path root) throws Exception {
        long fingerprint = 1;
        // Compare with the original accepted Files.walk input, not just the new walker's output.
        try (var files = Files.walk(root)) {
            for (Path file : files.filter(Files::isRegularFile).filter(path -> {
                String filename = path.getFileName().toString().toLowerCase(Locale.ROOT);
                for (Path segment : root.relativize(path)) {
                    if (segment.toString().equals("quality")) {
                        return false;
                    }
                }
                if (!filename.endsWith(".json") || filename.endsWith(".review.json")) {
                    return false;
                }
                for (Path segment : path) {
                    if (segment.toString().equals("mapping")) {
                        return true;
                    }
                }
                return false;
            }).sorted().toList()) {
                fingerprint = 31 * fingerprint + root.relativize(file).toString().hashCode();
                fingerprint = 31 * fingerprint + Files.getLastModifiedTime(file).toMillis();
            }
        }
        return fingerprint;
    }

    private LandscapeProperties properties(Path root) {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(root.toString());
        return properties;
    }

    private long readLong(Object service, String name) throws Exception {
        Field field = service.getClass().getDeclaredField(name);
        field.setAccessible(true);
        return field.getLong(service);
    }

    private long invokeLong(Object service, String name, Path... argument) throws Exception {
        Method method = argument.length == 0 ? service.getClass().getDeclaredMethod(name)
                : service.getClass().getDeclaredMethod(name, Path.class);
        method.setAccessible(true);
        return (long) method.invoke(service, (Object[]) argument);
    }

    private void resetReloadCheck(Object service) throws Exception {
        Field field = service.getClass().getDeclaredField("lastReloadCheck");
        field.setAccessible(true);
        field.setLong(service, 0);
    }
}
