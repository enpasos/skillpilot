package com.skillpilot.backend.landscape;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Predicate;

/** Lists file entries without descending into directories excluded by the caller. */
final class PrunedFileTree {
    private PrunedFileTree() {
    }

    static List<Path> files(Path root, Predicate<Path> excludedDirectory) throws IOException {
        List<Path> files = new ArrayList<>();
        // No FOLLOW_LINKS: directory symlinks retain Files.walk's traversal behavior.
        Files.walkFileTree(root, new SimpleFileVisitor<>() {
            @Override
            public FileVisitResult preVisitDirectory(Path directory, BasicFileAttributes attributes) {
                return excludedDirectory.test(directory)
                        ? FileVisitResult.SKIP_SUBTREE : FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attributes) {
                // Keep file symlinks so the caller's existing file predicate decides acceptance.
                files.add(file);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFileFailed(Path file, IOException exception) throws IOException {
                // The JDK opens a directory before preVisitDirectory; excluded trees may be unreadable.
                if (excludedDirectory.test(file)) {
                    return FileVisitResult.CONTINUE;
                }
                // Files.walk reports root failures directly and later traversal failures unchecked.
                if (file.equals(root)) {
                    throw exception;
                }
                throw new UncheckedIOException(exception);
            }

            @Override
            public FileVisitResult postVisitDirectory(Path directory, IOException exception) {
                if (exception != null) {
                    throw new UncheckedIOException(exception);
                }
                return FileVisitResult.CONTINUE;
            }
        });
        return files;
    }
}
