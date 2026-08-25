package com.skillpilot.backend.connectors.claude.v1.publication;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Serves the explicitly prepared Claude direct-install beta catalog. */
@RestController
@ConditionalOnClaudeV1Enabled
@RequestMapping(ClaudeV1PluginPublicationController.PUBLIC_BASE_PATH)
public final class ClaudeV1PluginPublicationController {

    static final String PUBLIC_BASE_PATH = "/api/public/claude/plugins";
    static final String DEFAULT_INDEX_LOCATION = "classpath:claude-plugin-publication/index.json";
    static final String DEFAULT_RESOURCE_ROOT = "classpath:claude-plugin-publication/";

    private static final Logger LOGGER = LoggerFactory.getLogger(ClaudeV1PluginPublicationController.class);
    private static final CacheControl VERSIONED_CACHE = CacheControl
            .maxAge(365, TimeUnit.DAYS)
            .cachePublic()
            .immutable();
    private static final int MAXIMUM_INDEX_BYTES = 1024 * 1024;
    private static final int MAXIMUM_PLUGIN_BYTES = 50 * 1024 * 1024;
    private static final String EXPECTED_PLUGIN_ID = "skillpilot-coach-v1";
    private static final String EXPECTED_STATUS = "beta";
    private static final String EXPECTED_PLAN = "claude-pro";
    private static final String EXPECTED_INSTALL_SURFACE = "claude-web";
    private static final List<String> EXPECTED_TESTED_SURFACES = List.of(
            "claude-web", "claude-android");
    private static final Pattern PLUGIN_ID_PATTERN = Pattern.compile("[a-z0-9]+(?:-[a-z0-9]+)*");
    private static final Pattern VERSION_PATTERN = Pattern.compile(
            "[0-9]+\\.[0-9]+\\.[0-9]+(?:-[0-9A-Za-z]+(?:\\.[0-9A-Za-z]+)*)?");
    private static final Pattern SHA256_PATTERN = Pattern.compile("[0-9a-f]{64}");
    private static final Pattern FILENAME_PATTERN = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._-]*\\.plugin");
    private static final Pattern SUPPORT_EMAIL_PATTERN = Pattern.compile(
            "[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+");
    private static final Pattern CANONICAL_TIMESTAMP_PATTERN = Pattern.compile(
            "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z");

    private final ResourceLoader resourceLoader;
    private final ObjectReader indexReader;
    private final String indexLocation;
    private final String resourceRoot;
    private volatile CatalogSnapshot cachedSnapshot;

    @Autowired
    public ClaudeV1PluginPublicationController(
            ResourceLoader resourceLoader,
            ObjectMapper objectMapper) {
        this(resourceLoader, objectMapper, DEFAULT_INDEX_LOCATION, DEFAULT_RESOURCE_ROOT);
    }

    ClaudeV1PluginPublicationController(
            ResourceLoader resourceLoader,
            ObjectMapper objectMapper,
            String indexLocation,
            String resourceRoot) {
        this.resourceLoader = resourceLoader;
        this.indexReader = objectMapper.readerFor(PublicationIndex.class)
                .with(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .with(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES);
        this.indexLocation = indexLocation;
        this.resourceRoot = resourceRoot.endsWith("/") ? resourceRoot : resourceRoot + "/";
    }

    @GetMapping(value = "/index.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<byte[]> getIndex() {
        CatalogSnapshot snapshot = loadCatalogOrUnavailable();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Content-Type-Options", "nosniff")
                .contentLength(snapshot.indexBytes().length)
                .body(snapshot.indexBytes().clone());
    }

    @GetMapping(value = "/{pluginId}/{version}/sha256-{sha256}/{filename:.+}")
    public ResponseEntity<byte[]> download(
            @PathVariable String pluginId,
            @PathVariable String version,
            @PathVariable String sha256,
            @PathVariable String filename) {
        if (!PLUGIN_ID_PATTERN.matcher(pluginId).matches()
                || !VERSION_PATTERN.matcher(version).matches()
                || !SHA256_PATTERN.matcher(sha256).matches()
                || !isSafeFilename(filename)) {
            throw notFound();
        }

        String downloadUrl = canonicalDownloadUrl(pluginId, version, sha256, filename);
        PublishedArtifact artifact = loadCatalogOrUnavailable().artifactsByUrl().get(downloadUrl);
        if (artifact == null) {
            throw notFound();
        }

        return ResponseEntity.ok()
                .cacheControl(VERSIONED_CACHE)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + artifact.filename() + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .eTag("\"sha256-" + artifact.sha256() + "\"")
                .contentLength(artifact.bytes().length)
                .body(artifact.bytes().clone());
    }

    private CatalogSnapshot loadCatalogOrUnavailable() {
        CatalogSnapshot snapshot = cachedSnapshot;
        if (snapshot != null) {
            return snapshot;
        }
        synchronized (this) {
            snapshot = cachedSnapshot;
            if (snapshot != null) {
                return snapshot;
            }
            try {
                snapshot = loadCatalog();
                cachedSnapshot = snapshot;
                return snapshot;
            } catch (IOException | RuntimeException exception) {
                LOGGER.error("Claude plugin publication catalog is unavailable", exception);
                throw new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Plugin publication catalog unavailable.");
            }
        }
    }

    private CatalogSnapshot loadCatalog() throws IOException {
        byte[] indexBytes = readResource(
                resourceLoader.getResource(indexLocation),
                MAXIMUM_INDEX_BYTES,
                "publication index");
        PublicationIndex index = indexReader.readValue(indexBytes);
        validateIndex(index);

        Map<String, PublishedArtifact> artifactsByUrl = new HashMap<>();
        Set<String> pluginVersions = new HashSet<>();
        for (PluginEntry entry : index.plugins()) {
            validateEntry(entry);
            String versionKey = entry.id() + "@" + entry.version();
            if (!pluginVersions.add(versionKey)) {
                throw new IllegalStateException("Duplicate plugin version in publication index.");
            }

            String expectedUrl = canonicalDownloadUrl(
                    entry.id(), entry.version(), entry.sha256(), entry.filename());
            if (!expectedUrl.equals(entry.downloadUrl())) {
                throw new IllegalStateException("Non-canonical plugin download URL in publication index.");
            }

            String relativeResourcePath = expectedUrl.substring(PUBLIC_BASE_PATH.length() + 1);
            byte[] artifactBytes = readResource(
                    resourceLoader.getResource(resourceRoot + relativeResourcePath),
                    MAXIMUM_PLUGIN_BYTES,
                    "plugin artifact");
            if (artifactBytes.length != entry.bytes()) {
                throw new IllegalStateException("Plugin artifact byte count does not match publication index.");
            }
            if (!entry.sha256().equals(sha256(artifactBytes))) {
                throw new IllegalStateException("Plugin artifact digest does not match publication index.");
            }

            PublishedArtifact artifact = new PublishedArtifact(
                    entry.filename(), entry.sha256(), artifactBytes);
            if (artifactsByUrl.putIfAbsent(expectedUrl, artifact) != null) {
                throw new IllegalStateException("Duplicate plugin download URL in publication index.");
            }
        }
        return new CatalogSnapshot(indexBytes.clone(), Map.copyOf(artifactsByUrl));
    }

    private static void validateIndex(PublicationIndex index) {
        if (index == null
                || !Integer.valueOf(1).equals(index.schemaVersion())
                || !"beta".equals(index.channel())
                || !isIsoOffsetDateTime(index.preparedAt())
                || index.plugins() == null
                || index.plugins().size() != 1) {
            throw new IllegalStateException("Invalid Claude plugin publication index.");
        }
    }

    private static void validateEntry(PluginEntry entry) {
        if (entry == null
                || !EXPECTED_PLUGIN_ID.equals(entry.id())
                || !isNonBlank(entry.name())
                || !matches(VERSION_PATTERN, entry.version())
                || !EXPECTED_STATUS.equals(entry.status())
                || !isSafeFilename(entry.filename())
                || !entry.filename().equals(entry.id() + "-" + entry.version() + ".plugin")
                || entry.bytes() == null
                || entry.bytes() <= 0
                || entry.bytes() > MAXIMUM_PLUGIN_BYTES
                || !matches(SHA256_PATTERN, entry.sha256())
                || !isNonBlank(entry.downloadUrl())
                || !isHttpsUrl(entry.sourceUrl())
                || !isHttpsUrl(entry.privacyUrl())
                || !isHttpsUrl(entry.termsUrl())
                || !matches(SUPPORT_EMAIL_PATTERN, entry.supportEmail())
                || !validRequirements(entry.requirements())) {
            throw new IllegalStateException("Invalid plugin entry in publication index.");
        }
    }

    private static boolean validRequirements(Requirements requirements) {
        if (requirements == null
                || requirements.minimumAge() == null
                || requirements.minimumAge() != 18
                || !EXPECTED_PLAN.equals(requirements.plan())
                || !EXPECTED_INSTALL_SURFACE.equals(requirements.installSurface())
                || requirements.testedSurfaces() == null
                || !EXPECTED_TESTED_SURFACES.equals(requirements.testedSurfaces())
                || !Boolean.TRUE.equals(requirements.voiceMode())) {
            return false;
        }
        Set<String> uniqueSurfaces = new HashSet<>();
        for (String surface : requirements.testedSurfaces()) {
            if (!isNonBlank(surface) || !uniqueSurfaces.add(surface)) {
                return false;
            }
        }
        return true;
    }

    private static boolean isSafeFilename(String filename) {
        return matches(FILENAME_PATTERN, filename) && !filename.contains("..");
    }

    private static boolean isIsoOffsetDateTime(String value) {
        if (!matches(CANONICAL_TIMESTAMP_PATTERN, value)) {
            return false;
        }
        try {
            OffsetDateTime.parse(value);
            return true;
        } catch (DateTimeParseException exception) {
            return false;
        }
    }

    private static boolean isHttpsUrl(String value) {
        if (!isNonBlank(value)) {
            return false;
        }
        try {
            URI uri = new URI(value);
            return "https".equalsIgnoreCase(uri.getScheme())
                    && uri.getHost() != null
                    && !uri.getHost().isBlank()
                    && uri.getUserInfo() == null;
        } catch (URISyntaxException exception) {
            return false;
        }
    }

    private static boolean isNonBlank(String value) {
        return value != null && !value.isBlank();
    }

    private static boolean matches(Pattern pattern, String value) {
        return value != null && pattern.matcher(value).matches();
    }

    private static String canonicalDownloadUrl(
            String pluginId,
            String version,
            String sha256,
            String filename) {
        return PUBLIC_BASE_PATH + "/" + pluginId + "/" + version
                + "/sha256-" + sha256 + "/" + filename;
    }

    private static byte[] readResource(Resource resource, int maximumBytes, String label)
            throws IOException {
        if (!resource.exists() || !resource.isReadable()) {
            throw new IOException("Missing " + label + ".");
        }
        try (InputStream input = resource.getInputStream()) {
            byte[] bytes = input.readNBytes(maximumBytes + 1);
            if (bytes.length > maximumBytes) {
                throw new IOException("Oversized " + label + ".");
            }
            return bytes;
        }
    }

    private static String sha256(byte[] bytes) {
        try {
            return java.util.HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Plugin publication not found.");
    }

    private record CatalogSnapshot(byte[] indexBytes, Map<String, PublishedArtifact> artifactsByUrl) {
    }

    private record PublishedArtifact(String filename, String sha256, byte[] bytes) {
    }

    private record PublicationIndex(
            Integer schemaVersion,
            String channel,
            String preparedAt,
            List<PluginEntry> plugins) {
    }

    private record PluginEntry(
            String id,
            String name,
            String version,
            String status,
            String filename,
            Long bytes,
            String sha256,
            String downloadUrl,
            String sourceUrl,
            String privacyUrl,
            String termsUrl,
            String supportEmail,
            Requirements requirements) {
    }

    private record Requirements(
            Integer minimumAge,
            String plan,
            String installSurface,
            List<String> testedSurfaces,
            Boolean voiceMode) {
    }
}
