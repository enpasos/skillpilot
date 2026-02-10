package com.skillpilot.backend.service;

import com.skillpilot.backend.landscape.LandscapeProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

@Service
public class DeckResourceService {

    private static final Logger log = LoggerFactory.getLogger(DeckResourceService.class);
    private static final Pattern DECK_FILENAME_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._-]+_deck(?:[._][a-z]{2})?\\.json$",
            Pattern.CASE_INSENSITIVE);
    private static final long INDEX_REFRESH_INTERVAL_MS = 2_000L;

    private final LandscapeProperties landscapeProperties;
    private final Object deckIndexLock = new Object();
    private volatile Map<String, Path> deckIndex = Collections.emptyMap();
    private volatile long deckIndexUpdatedAt = 0L;
    private volatile String indexedRoot = "";

    public DeckResourceService(LandscapeProperties landscapeProperties) {
        this.landscapeProperties = landscapeProperties;
    }

    public Resource resolveDeckResource(String vocabularySource) {
        String normalized = normalizeDeckPath(vocabularySource);
        if (normalized == null) {
            return null;
        }

        String fileName = extractFileName(normalized);
        if (fileName == null || !DECK_FILENAME_PATTERN.matcher(fileName).matches()) {
            return null;
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
            deckIndexUpdatedAt = refreshedNow;
            indexedRoot = rootKey;
        }
    }

    private Map<String, Path> buildDeckIndex(Path curriculaRoot) {
        Map<String, Path> index = new HashMap<>();
        try (Stream<Path> paths = Files.walk(curriculaRoot)) {
            paths.filter(Files::isRegularFile)
                    .filter(path -> path.getParent() != null && "json".equals(path.getParent().getFileName().toString()))
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
            log.warn("Could not index deck files under {}", curriculaRoot, e);
        }
        return Map.copyOf(index);
    }
}

