package com.skillpilot.backend.service;

import com.skillpilot.backend.curriculumpackage.PackageCurriculumResourceState;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.PrunedFileTree;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

public class DeckResourceService {

    private static final Logger log = LoggerFactory.getLogger(DeckResourceService.class);
    private static final Pattern DECK_FILENAME_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._-]+(?:_deck|_flashcards_[A-Za-z0-9._-]+)(?:[._][a-z]{2})?\\.json$",
            Pattern.CASE_INSENSITIVE);
    private static final long INDEX_REFRESH_INTERVAL_MS = 2_000L;

    private final LandscapeProperties landscapeProperties;
    private final PackageCurriculumResourceState packageResourceState;
    private final Object deckIndexLock = new Object();
    private volatile Map<String, Path> deckIndex = Collections.emptyMap();
    private volatile long deckIndexUpdatedAt = 0L;
    private volatile String indexedRoot = "";
    private volatile Map<String, byte[]> pinnedDecks;

    /** Keep deck bytes in the same immutable repository generation as landscapes and mappings. */
    public void pinRuntimeGeneration() throws IOException {
        if (packageResourceState != null) return;
        synchronized (deckIndexLock) {
            if (pinnedDecks != null) return;
            Path root = Path.of(landscapeProperties.getDirectory()).toAbsolutePath().normalize();
            Map<String, byte[]> bytes = new HashMap<>();
            for (Map.Entry<String, Path> entry : buildDeckIndex(root, true).entrySet()) {
                bytes.put(entry.getKey(), Files.readAllBytes(entry.getValue()));
            }
            pinnedDecks = Collections.unmodifiableMap(bytes);
        }
    }

    public DeckResourceService(LandscapeProperties landscapeProperties) {
        this.landscapeProperties = java.util.Objects.requireNonNull(landscapeProperties, "landscapeProperties");
        this.packageResourceState = null;
    }

    public DeckResourceService(PackageCurriculumResourceState packageResourceState) {
        this.landscapeProperties = null;
        this.packageResourceState = java.util.Objects.requireNonNull(packageResourceState, "packageResourceState");
    }

    public Resource resolveDeckResource(String vocabularySource) {
        if (packageResourceState != null) {
            return null;
        }
        return resolveRepositoryDeckResource(vocabularySource);
    }

    public Resource resolveDeckResource(String goalId, String vocabularySource) {
        if (packageResourceState == null) {
            return resolveRepositoryDeckResource(vocabularySource);
        }
        return packageResourceState.resolveGoalDeck(goalId, vocabularySource)
                .map(DeckResourceService::asResource)
                .orElse(null);
    }

    private Resource resolveRepositoryDeckResource(String vocabularySource) {
        String normalized = normalizeDeckPath(vocabularySource);
        if (normalized == null) {
            return null;
        }

        String fileName = extractFileName(normalized);
        if (fileName == null || !DECK_FILENAME_PATTERN.matcher(fileName).matches()) {
            return null;
        }
        Map<String, byte[]> pinned = pinnedDecks;
        if (pinned != null) {
            byte[] bytes = pinned.get(fileName);
            return bytes == null ? null : new ByteArrayResource(bytes.clone(), "pinned curriculum deck " + fileName) {
                @Override public String getFilename() { return fileName; }
            };
        }

        Optional<Path> curriculumDeck = resolveDeckFromCurricula(fileName);
        if (curriculumDeck.isPresent()) {
            return new FileSystemResource(curriculumDeck.get());
        }

        ClassPathResource classPathResource = new ClassPathResource("static/" + normalized);
        if (classPathResource.exists()) {
            return classPathResource;
        }
        return null;
    }

    private static Resource asResource(PackageCurriculumResourceState.ResolvedArtifact artifact) {
        return new ByteArrayResource(artifact.bytes(), "package deck " + artifact.href()) {
            @Override
            public String getFilename() {
                return artifact.filename();
            }
        };
    }

    private String normalizeDeckPath(String vocabularySource) {
        if (vocabularySource == null || vocabularySource.isBlank()) {
            return null;
        }
        if (vocabularySource.startsWith("http://") || vocabularySource.startsWith("https://")) {
            return null;
        }
        String normalized = vocabularySource.trim();
        if (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        if (!normalized.startsWith("data/")) {
            normalized = "data/" + normalized;
        }
        return normalized;
    }

    private String extractFileName(String normalizedDeckPath) {
        int index = normalizedDeckPath.lastIndexOf('/');
        if (index < 0 || index >= normalizedDeckPath.length() - 1) {
            return normalizedDeckPath;
        }
        return normalizedDeckPath.substring(index + 1);
    }

    private Optional<Path> resolveDeckFromCurricula(String fileName) {
        Path curriculaRoot = Path.of(landscapeProperties.getDirectory()).toAbsolutePath().normalize();
        if (!Files.isDirectory(curriculaRoot)) {
            return Optional.empty();
        }

        refreshDeckIndexIfNeeded(curriculaRoot);
        return Optional.ofNullable(deckIndex.get(fileName));
    }

    private void refreshDeckIndexIfNeeded(Path curriculaRoot) {
        long now = System.currentTimeMillis();
        String rootKey = curriculaRoot.toString();
        if (rootKey.equals(indexedRoot) && (now - deckIndexUpdatedAt) < INDEX_REFRESH_INTERVAL_MS) {
            return;
        }

        synchronized (deckIndexLock) {
            long refreshedNow = System.currentTimeMillis();
            if (rootKey.equals(indexedRoot) && (refreshedNow - deckIndexUpdatedAt) < INDEX_REFRESH_INTERVAL_MS) {
                return;
            }
            deckIndex = buildDeckIndex(curriculaRoot);
            // A slow traversal must not consume the next refresh interval.
            deckIndexUpdatedAt = System.currentTimeMillis();
            indexedRoot = rootKey;
        }
    }

    private Map<String, Path> buildDeckIndex(Path curriculaRoot) {
        return buildDeckIndex(curriculaRoot, false);
    }

    private Map<String, Path> buildDeckIndex(Path curriculaRoot, boolean failOnReadError) {
        Map<String, Path> index = new HashMap<>();
        try {
            PrunedFileTree.files(curriculaRoot,
                            path -> !path.equals(curriculaRoot) && "quality".equals(path.getFileName().toString()))
                    .stream()
                    .filter(Files::isRegularFile)
                    .filter(this::isDeckSourceFile)
                    .forEach(path -> {
                        String fileName = path.getFileName().toString();
                        if (!DECK_FILENAME_PATTERN.matcher(fileName).matches()) {
                            return;
                        }
                        Path normalized = path.toAbsolutePath().normalize();
                        Path existing = index.get(fileName);
                        if (existing == null || normalized.toString().compareTo(existing.toString()) < 0) {
                            index.put(fileName, normalized);
                        }
                    });
        } catch (IOException e) {
            if (failOnReadError) throw new IllegalStateException("Cannot pin unreadable curriculum decks", e);
            log.warn("Could not index deck files under {}", curriculaRoot, e);
        }
        return Map.copyOf(index);
    }

    private boolean isDeckSourceFile(Path path) {
        if (path.getParent() == null) {
            return false;
        }
        String directoryName = path.getParent().getFileName().toString();
        return "json".equals(directoryName) || "memory-decks".equals(directoryName);
    }
}
