package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeFalse;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.io.UncheckedIOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermission;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class PrunedFileTreeTest {
    @TempDir
    Path tempDir;

    @Test
    void prunesChildrenAndRetainsFileLinksWithoutFollowingDirectoryLinks() throws Exception {
        Path root = Files.createDirectory(tempDir.resolve("root"));
        Path active = Files.writeString(root.resolve("active.json"), "{}");
        Path external = Files.createDirectory(tempDir.resolve("external"));
        Path source = Files.writeString(external.resolve("source.json"), "{}");
        Path link = Files.createSymbolicLink(root.resolve("linked.json"), source);
        Files.createSymbolicLink(root.resolve("linked-directory"), external);
        Files.createSymbolicLink(root.resolve("broken.json"), external.resolve("missing.json"));
        Path excluded = Files.createDirectory(root.resolve("quality"));
        Files.createDirectories(excluded.resolve("nested"));
        Files.writeString(excluded.resolve("nested/candidate.json"), "{}");

        assertThat(PrunedFileTree.files(root, directory -> {
            assertThat(directory.startsWith(excluded) && !directory.equals(excluded)).isFalse();
            return directory.equals(excluded);
        }).stream().filter(Files::isRegularFile).sorted().toList()).containsExactly(active, link);
    }

    @Test
    void skipsAnUnreadableExcludedDirectory() throws Exception {
        Path root = Files.createDirectory(tempDir.resolve("root"));
        Path active = Files.writeString(root.resolve("active.json"), "{}");
        Path excluded = Files.createDirectory(root.resolve("quality"));
        assumeTrue(Files.getFileStore(excluded).supportsFileAttributeView("posix"));
        Set<PosixFilePermission> original = Files.getPosixFilePermissions(excluded);
        try {
            Files.setPosixFilePermissions(excluded, Set.of());
            assumeFalse(Files.isReadable(excluded), "A privileged process can bypass directory permissions");
            assertThat(PrunedFileTree.files(root, excluded::equals)).containsExactly(active);
        } finally {
            Files.setPosixFilePermissions(excluded, original);
        }
    }

    @Test
    void stillReportsAnUnreadableIncludedDirectory() throws Exception {
        Path root = Files.createDirectory(tempDir.resolve("root"));
        Path included = Files.createDirectory(root.resolve("canonical"));
        assumeTrue(Files.getFileStore(included).supportsFileAttributeView("posix"));
        Set<PosixFilePermission> original = Files.getPosixFilePermissions(included);
        try {
            Files.setPosixFilePermissions(included, Set.of());
            assumeFalse(Files.isReadable(included), "A privileged process can bypass directory permissions");
            assertThatThrownBy(() -> PrunedFileTree.files(root, directory -> false))
                    .isInstanceOf(UncheckedIOException.class)
                    .hasCauseInstanceOf(AccessDeniedException.class);
        } finally {
            Files.setPosixFilePermissions(included, original);
        }
    }

    @Test
    void preservesCheckedFailureForAnUnreadableScanRoot() throws Exception {
        Path root = Files.createDirectory(tempDir.resolve("root"));
        assumeTrue(Files.getFileStore(root).supportsFileAttributeView("posix"));
        Set<PosixFilePermission> original = Files.getPosixFilePermissions(root);
        try {
            Files.setPosixFilePermissions(root, Set.of());
            assumeFalse(Files.isReadable(root), "A privileged process can bypass directory permissions");
            assertThatThrownBy(() -> PrunedFileTree.files(root, directory -> false))
                    .isInstanceOf(AccessDeniedException.class);
        } finally {
            Files.setPosixFilePermissions(root, original);
        }
    }
}
