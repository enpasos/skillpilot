package com.skillpilot.backend.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * Immutable, separately authored optional content. It never alters curriculum goals and never
 * fetches provider pages at runtime. Invalid optional configuration disables this catalog rather
 * than making learning or application startup depend on external material.
 */
@Component
public final class ContentCatalog {
    private static final Logger LOG = LoggerFactory.getLogger(ContentCatalog.class);
    private static final int MAX_PACKAGES = 20;
    private static final int MAX_MATERIALS_PER_PACKAGE = 1000;

    public record Index(int schemaVersion, List<String> packages) {}
    public record Provider(String name, String url, String relationship) {}
    public record Review(String checkedAt, String authority, String rationale) {}
    public record Material(
            String id, String title, String titleEn, String url, String resourceType,
            String language, String status, List<String> goalIds, List<String> sections,
            Review review) {}
    public record ContentPackage(
            int schemaVersion, String packageId, String version, String title, String titleEn,
            String description, String descriptionEn, Provider provider, String access,
            String aiUsage, String status, List<Material> materials) {}
    public record PackageDescriptor(
            String packageId, String version, String title, String description,
            String providerName, String providerUrl, String access, String aiUsage,
            int materialCount) {}
    public record MatchedMaterial(ContentPackage contentPackage, Material material) {}

    private final List<ContentPackage> contentPackages;

    @Autowired
    public ContentCatalog(ObjectMapper objectMapper) {
        List<ContentPackage> loaded;
        try {
            Index index;
            try (var input = new ClassPathResource("content/catalog.json").getInputStream()) {
                index = objectMapper.readValue(input, Index.class);
            }
            if (index.schemaVersion() != 1 || index.packages() == null
                    || index.packages().size() > MAX_PACKAGES) {
                throw new IllegalArgumentException("Unsupported content catalog");
            }
            List<ContentPackage> packages = new ArrayList<>();
            Set<String> paths = new HashSet<>();
            for (String path : index.packages()) {
                if (path == null || !path.matches("[a-z0-9-]+/[0-9]+\\.[0-9]+\\.[0-9]+/package\\.json")
                        || !paths.add(path)) {
                    throw new IllegalArgumentException("Invalid content package path");
                }
                try (var input = new ClassPathResource("content/" + path).getInputStream()) {
                    packages.add(objectMapper.readValue(input, ContentPackage.class));
                }
            }
            loaded = validate(packages);
        } catch (IOException | RuntimeException exception) {
            // Do not log provider metadata, full exception messages, or any learner information.
            LOG.warn("Optional content catalog unavailable or invalid; continuing without external materials");
            loaded = List.of();
        }
        this.contentPackages = loaded;
    }

    /** Explicit validation entry point for synthetic provider/contract tests. */
    ContentCatalog(List<ContentPackage> packages) {
        this.contentPackages = validate(packages);
    }

    public List<PackageDescriptor> packages(String locale) {
        return contentPackages.stream()
                .filter(item -> "active".equals(item.status()))
                .map(item -> new PackageDescriptor(
                        item.packageId(), item.version(), localized(item.title(), item.titleEn(), locale),
                        localized(item.description(), item.descriptionEn(), locale),
                        item.provider().name(), item.provider().url(), item.access(), item.aiUsage(),
                        (int) item.materials().stream().filter(material -> "active".equals(material.status())).count()))
                .toList();
    }

    public boolean hasActivePackage(String packageId) {
        return contentPackages.stream().anyMatch(item -> item.packageId().equals(packageId)
                && "active".equals(item.status()));
    }

    public List<MatchedMaterial> materialsForGoal(Set<String> selectedPackageIds, String goalId) {
        if (selectedPackageIds == null || selectedPackageIds.isEmpty() || goalId == null || goalId.isBlank()) {
            return List.of();
        }
        return contentPackages.stream()
                .filter(item -> "active".equals(item.status()) && selectedPackageIds.contains(item.packageId()))
                .flatMap(item -> item.materials().stream()
                        .filter(material -> "active".equals(material.status()) && material.goalIds().contains(goalId))
                        .map(material -> new MatchedMaterial(item, material)))
                .toList();
    }

    static String localized(String value, String englishValue, String locale) {
        return locale != null && locale.toLowerCase(Locale.ROOT).startsWith("en")
                && englishValue != null && !englishValue.isBlank() ? englishValue : value;
    }

    private static List<ContentPackage> validate(List<ContentPackage> packages) {
        if (packages == null || packages.size() > MAX_PACKAGES) {
            throw new IllegalArgumentException("Invalid content packages");
        }
        Set<String> packageIds = new HashSet<>();
        List<ContentPackage> validated = new ArrayList<>();
        for (ContentPackage item : packages) {
            if (item == null || item.schemaVersion() != 1 || !identifier(item.packageId())
                    || !packageIds.add(item.packageId()) || item.version() == null
                    || !item.version().matches("[0-9]+\\.[0-9]+\\.[0-9]+")
                    || !Set.of("active", "inactive").contains(item.status() == null ? "" : item.status())
                    || !"public-link".equals(item.access()) || !"link-only".equals(item.aiUsage())
                    || item.provider() == null || !"independent-mapping".equals(item.provider().relationship())
                    || item.materials() == null || item.materials().size() > MAX_MATERIALS_PER_PACKAGE) {
                throw new IllegalArgumentException("Invalid content package");
            }
            requireText(item.title(), 200);
            requireOptionalText(item.titleEn(), 200);
            requireText(item.description(), 1000);
            requireOptionalText(item.descriptionEn(), 1000);
            requireText(item.provider().name(), 200);
            URI provider = requirePublicUrl(item.provider().url());
            List<Material> materials = new ArrayList<>();
            Set<String> materialIds = new HashSet<>();
            for (Material material : item.materials()) {
                if (material == null || !identifier(material.id()) || !materialIds.add(material.id())
                        || !Set.of("article", "simulation").contains(
                                material.resourceType() == null ? "" : material.resourceType())
                        || !Set.of("active", "inactive").contains(material.status() == null ? "" : material.status())
                        || material.language() == null || !material.language().matches("[a-z]{2}(?:-[A-Z]{2})?")
                        || material.goalIds() == null || material.goalIds().isEmpty() || material.goalIds().size() > 64
                        || material.sections() == null || material.sections().size() > 20
                        || material.review() == null) {
                    throw new IllegalArgumentException("Invalid content material");
                }
                requireText(material.title(), 300);
                requireOptionalText(material.titleEn(), 300);
                URI link = requirePublicUrl(material.url());
                if (!link.getHost().equalsIgnoreCase(provider.getHost())) {
                    throw new IllegalArgumentException("Content link outside declared provider");
                }
                for (String goalId : material.goalIds()) {
                    if (goalId == null || !goalId.matches("[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}")) {
                        throw new IllegalArgumentException("Invalid public goal reference");
                    }
                }
                if (new HashSet<>(material.goalIds()).size() != material.goalIds().size()) {
                    throw new IllegalArgumentException("Duplicate goal reference");
                }
                material.sections().forEach(section -> requireText(section, 300));
                requireText(material.review().checkedAt(), 10);
                LocalDate.parse(material.review().checkedAt());
                if (!Set.of("ai", "human").contains(material.review().authority())) {
                    throw new IllegalArgumentException("Invalid mapping review authority");
                }
                requireText(material.review().rationale(), 2000);
                materials.add(new Material(material.id(), material.title(), material.titleEn(), material.url(),
                        material.resourceType(), material.language(), material.status(),
                        List.copyOf(material.goalIds()), List.copyOf(material.sections()), material.review()));
            }
            validated.add(new ContentPackage(item.schemaVersion(), item.packageId(), item.version(),
                    item.title(), item.titleEn(), item.description(), item.descriptionEn(), item.provider(),
                    item.access(), item.aiUsage(), item.status(), List.copyOf(materials)));
        }
        return List.copyOf(validated);
    }

    private static boolean identifier(String value) {
        return value != null && value.matches("[a-z0-9][a-z0-9-]{0,79}");
    }

    private static URI requirePublicUrl(String value) {
        requireText(value, 2048);
        URI uri = URI.create(value);
        String host = uri.getHost();
        if (!"https".equals(uri.getScheme()) || host == null || !host.contains(".")
                || host.matches("[0-9.]+") || host.contains(":") || host.endsWith(".localhost")
                || host.endsWith(".local") || uri.getUserInfo() != null || uri.getPort() != -1
                || uri.getRawQuery() != null || !value.equals(value.trim())) {
            throw new IllegalArgumentException("Only static public HTTPS content URLs are permitted");
        }
        return uri;
    }

    private static void requireText(String value, int maxLength) {
        if (value == null || value.isBlank() || value.length() > maxLength
                || value.codePoints().anyMatch(character -> Character.isISOControl(character)
                        || Character.getType(character) == Character.FORMAT)) {
            throw new IllegalArgumentException("Invalid bounded content metadata");
        }
    }

    private static void requireOptionalText(String value, int maxLength) {
        if (value != null) {
            requireText(value, maxLength);
        }
    }
}
