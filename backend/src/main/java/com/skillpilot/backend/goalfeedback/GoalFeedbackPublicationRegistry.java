package com.skillpilot.backend.goalfeedback;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.Goal;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.LinkBinding;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.ResolvedContext;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.TrustedContext;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import javax.sql.DataSource;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.sql.init.dependency.DependsOnDatabaseInitialization;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * Hash-verifies current static book models, appends compact trusted snapshots
 * to Postgres and resolves both current and previously published PDF bindings.
 */
@Service
@DependsOnDatabaseInitialization
@ConditionalOnExpression("${skillpilot.goal-feedback.enabled:${SKILLPILOT_GOAL_FEEDBACK_ENABLED:false}}")
public class GoalFeedbackPublicationRegistry implements InitializingBean {

    private static final String INDEX_RESOURCE = "classpath:static/lernzielbuch/index.json";
    private static final Pattern MODEL_URL =
            Pattern.compile("/lernzielbuch/[A-Za-z0-9][A-Za-z0-9._-]{0,199}\\.book-model\\.json");
    private static final Pattern SHA256 = Pattern.compile("sha256:[0-9a-f]{64}");
    private static final Pattern STABLE_ID = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._:+-]{0,199}");
    private static final Pattern LOCALE = Pattern.compile("[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*");

    private final URI publicBaseUri;
    private final ObjectMapper objectMapper;
    private final GoalFeedbackCanonicalJson canonicalJson;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;
    private final Map<PublicationKey, PublishedBook> staticBooks;

    private volatile Map<PublicationKey, PublishedBook> snapshots = Map.of();

    public GoalFeedbackPublicationRegistry(
            ObjectMapper objectMapper,
            GoalFeedbackCanonicalJson canonicalJson,
            ResourceLoader resourceLoader,
            JdbcTemplate jdbc,
            PlatformTransactionManager transactionManager,
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl) {
        this.publicBaseUri = validatePublicBaseUri(publicBaseUrl);
        this.objectMapper = objectMapper;
        this.canonicalJson = canonicalJson;
        this.jdbc = jdbc;
        this.transactions = new TransactionTemplate(transactionManager);
        this.staticBooks = Map.copyOf(loadStaticBooks(objectMapper, resourceLoader));
    }

    @Override
    public void afterPropertiesSet() {
        transactions.executeWithoutResult(ignored -> {
            lockPublicationPromotion();
            boolean h2 = isH2(jdbc.getDataSource());
            Instant now = Instant.now();
            for (PublishedBook book : staticBooks.values()) {
                SnapshotIdentity snapshot = ingestSnapshot(book, now, h2);
                promoteCurrent(book.id(), snapshot, now);
            }
        });
        reloadDurableRegistry();
    }

    public Optional<ResolvedContext> resolve(LinkBinding binding) {
        PublicationKey key = new PublicationKey(binding.bookId(), binding.edition(), binding.bookDigest());
        PublishedBook book = snapshots.get(key);
        if (book == null) {
            book = loadDurableSnapshot(key).orElse(null);
            if (book == null) {
                return Optional.empty();
            }
            cacheSnapshot(key, book);
        }
        PublishedPage page = book.pagesByNumber().get(binding.page());
        if (page == null
                || !page.goalId().equals(binding.goalId())
                || !page.goalFingerprint().equals(binding.goalFingerprint())
                || !page.pageFingerprint().equals(binding.pageFingerprint())) {
            return Optional.empty();
        }
        String canonicalUrl = UriComponentsBuilder.fromUri(publicBaseUri)
                .pathSegment("lernzielbuch")
                .queryParam("book", book.id())
                .fragment("goal-" + page.goalId())
                .build()
                .encode()
                .toUriString();
        TrustedContext context = new TrustedContext(
                page.goalId(), page.goalFingerprint(), page.pageFingerprint(),
                book.id(), book.edition(), book.modelDigest(), book.locale(), book.title(),
                page.pageNumber(), canonicalUrl, book.renderManifestSha256());
        return Optional.of(new ResolvedContext(
                1,
                context,
                new Goal(page.title(), page.description(), page.breadcrumbs()),
                GoalFeedbackApi.SUBMISSION_ENDPOINT));
    }

    public boolean isCurrent(LinkBinding binding) {
        List<PublicationKey> current = jdbc.query("""
                SELECT snapshot.book_id, snapshot.edition, snapshot.book_digest
                FROM goal_feedback_publication_current publication
                JOIN goal_feedback_publication_snapshot snapshot ON snapshot.id = publication.snapshot_id
                WHERE publication.book_id = ?
                """,
                (resultSet, rowNumber) -> new PublicationKey(
                        resultSet.getString("book_id"), resultSet.getString("edition"),
                        resultSet.getString("book_digest")),
                binding.bookId());
        require(current.size() <= 1, "Duplicate current goal-book pointer: " + binding.bookId());
        if (current.isEmpty()) {
            return false;
        }
        PublicationKey key = current.getFirst();
        require(key.bookId().equals(binding.bookId()), "Invalid current goal-book snapshot pointer");
        return key.equals(new PublicationKey(binding.bookId(), binding.edition(), binding.bookDigest()));
    }

    private SnapshotIdentity ingestSnapshot(PublishedBook book, Instant now, boolean h2) {
        String snapshotJson = snapshotJson(book);
        UUID candidateId = UUID.randomUUID();
        Object[] values = {
                candidateId, book.id(), book.edition(), book.modelDigest(), book.modelSha256(),
                book.title(), book.locale(), book.renderManifestSha256(), snapshotJson, Timestamp.from(now)
        };
        Long existingCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM goal_feedback_publication_snapshot "
                        + "WHERE book_id = ? AND edition = ? AND book_digest = ?",
                Long.class,
                book.id(), book.edition(), book.modelDigest());
        if (h2 && existingCount != null && existingCount == 0) {
            jdbc.update("""
                    MERGE INTO goal_feedback_publication_snapshot
                        (id, book_id, edition, book_digest, model_sha256, title, locale,
                         render_manifest_fingerprint, snapshot_json, first_seen_at)
                    KEY (book_id, edition, book_digest)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, values);
        } else if (!h2) {
            jdbc.update("""
                    INSERT INTO goal_feedback_publication_snapshot
                        (id, book_id, edition, book_digest, model_sha256, title, locale,
                         render_manifest_fingerprint, snapshot_json, first_seen_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (book_id, edition, book_digest) DO NOTHING
                    """, values);
        }
        SnapshotRow stored = jdbc.queryForObject("""
                SELECT id, model_sha256, title, locale, render_manifest_fingerprint, snapshot_json, first_seen_at
                FROM goal_feedback_publication_snapshot
                WHERE book_id = ? AND edition = ? AND book_digest = ?
                """,
                (resultSet, rowNumber) -> new SnapshotRow(
                        resultSet.getObject("id", UUID.class),
                        resultSet.getString("model_sha256"), resultSet.getString("title"),
                        resultSet.getString("locale"), resultSet.getString("render_manifest_fingerprint"),
                        resultSet.getString("snapshot_json"), resultSet.getTimestamp("first_seen_at").toInstant()),
                book.id(), book.edition(), book.modelDigest());
        require(stored != null
                        && stored.modelSha256().equals(book.modelSha256())
                        && stored.title().equals(book.title())
                        && stored.locale().equals(book.locale())
                        && stored.renderManifestSha256().equals(book.renderManifestSha256())
                        && stored.snapshotJson().equals(snapshotJson),
                "Durable goal-book snapshot conflicts with verified static publication: " + book.id());
        return new SnapshotIdentity(stored.id(), stored.firstSeenAt());
    }

    private void lockPublicationPromotion() {
        Integer lock = jdbc.queryForObject(
                "SELECT id FROM goal_feedback_inbox_capacity WHERE id = 1 FOR UPDATE", Integer.class);
        require(lock != null && lock == 1, "Goal-feedback publication promotion lock is missing");
    }

    private void promoteCurrent(String bookId, SnapshotIdentity candidate, Instant now) {
        List<CurrentPublicationRow> current = jdbc.query("""
                SELECT publication.snapshot_id, snapshot.book_id, snapshot.first_seen_at
                FROM goal_feedback_publication_current publication
                JOIN goal_feedback_publication_snapshot snapshot ON snapshot.id = publication.snapshot_id
                WHERE publication.book_id = ?
                """,
                (resultSet, rowNumber) -> new CurrentPublicationRow(
                        resultSet.getObject("snapshot_id", UUID.class), resultSet.getString("book_id"),
                        resultSet.getTimestamp("first_seen_at").toInstant()),
                bookId);
        require(current.size() <= 1, "Duplicate current goal-book pointer: " + bookId);
        if (current.isEmpty()) {
            jdbc.update("""
                    INSERT INTO goal_feedback_publication_current (book_id, snapshot_id, updated_at)
                    VALUES (?, ?, ?)
                    """, bookId, candidate.id(), Timestamp.from(now));
            return;
        }
        CurrentPublicationRow existing = current.getFirst();
        require(existing.bookId().equals(bookId), "Invalid current goal-book snapshot pointer");
        if (!candidate.id().equals(existing.snapshotId())
                && candidate.firstSeenAt().isAfter(existing.firstSeenAt())) {
            int updated = jdbc.update("""
                    UPDATE goal_feedback_publication_current
                    SET snapshot_id = ?, updated_at = ?
                    WHERE book_id = ? AND snapshot_id = ?
                    """, candidate.id(), Timestamp.from(now), bookId, existing.snapshotId());
            require(updated == 1, "Concurrent goal-book promotion escaped the publication lock");
        }
    }

    private Optional<PublishedBook> loadDurableSnapshot(PublicationKey key) {
        List<PublishedBook> loaded = jdbc.query("""
                SELECT model_sha256, title, locale, render_manifest_fingerprint, snapshot_json
                FROM goal_feedback_publication_snapshot
                WHERE book_id = ? AND edition = ? AND book_digest = ?
                """,
                (resultSet, rowNumber) -> {
                    PublishedBook book = parseSnapshot(resultSet.getString("snapshot_json"));
                    require(key.equals(new PublicationKey(book.id(), book.edition(), book.modelDigest()))
                                    && resultSet.getString("model_sha256").equals(book.modelSha256())
                                    && resultSet.getString("title").equals(book.title())
                                    && resultSet.getString("locale").equals(book.locale())
                                    && resultSet.getString("render_manifest_fingerprint")
                                            .equals(book.renderManifestSha256()),
                            "Durable goal-book snapshot metadata mismatch: " + key.bookId());
                    return book;
                },
                key.bookId(), key.edition(), key.bookDigest());
        require(loaded.size() <= 1, "Duplicate durable goal-book snapshot");
        return loaded.stream().findFirst();
    }

    private void cacheSnapshot(PublicationKey key, PublishedBook book) {
        synchronized (this) {
            if (snapshots.containsKey(key)) {
                return;
            }
            Map<PublicationKey, PublishedBook> updated = new HashMap<>(snapshots);
            updated.put(key, book);
            snapshots = Map.copyOf(updated);
        }
    }

    void reloadDurableRegistry() {
        Map<PublicationKey, PublishedBook> loaded = new HashMap<>();
        jdbc.query("""
                SELECT book_id, edition, book_digest, model_sha256, title, locale,
                       render_manifest_fingerprint, snapshot_json
                FROM goal_feedback_publication_snapshot
                """, resultSet -> {
            PublicationKey key = new PublicationKey(
                    resultSet.getString("book_id"), resultSet.getString("edition"),
                    resultSet.getString("book_digest"));
            PublishedBook book = parseSnapshot(resultSet.getString("snapshot_json"));
            require(key.equals(new PublicationKey(book.id(), book.edition(), book.modelDigest()))
                            && resultSet.getString("model_sha256").equals(book.modelSha256())
                            && resultSet.getString("title").equals(book.title())
                            && resultSet.getString("locale").equals(book.locale())
                            && resultSet.getString("render_manifest_fingerprint")
                                    .equals(book.renderManifestSha256()),
                    "Durable goal-book snapshot metadata mismatch: " + key.bookId());
            require(loaded.put(key, book) == null, "Duplicate durable goal-book snapshot");
        });
        require(!loaded.isEmpty() && loaded.keySet().containsAll(staticBooks.keySet()),
                "Durable goal-book registry did not load static publications");
        snapshots = Map.copyOf(loaded);
    }

    private String snapshotJson(PublishedBook book) {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("bookId", book.id());
        root.put("title", book.title());
        root.put("locale", book.locale());
        root.put("edition", book.edition());
        root.put("bookDigest", book.modelDigest());
        root.put("modelSha256", book.modelSha256());
        root.put("renderManifestFingerprint", book.renderManifestSha256());
        ArrayNode pages = root.putArray("pages");
        book.pagesByNumber().values().stream()
                .sorted(Comparator.comparingInt(PublishedPage::pageNumber))
                .forEach(page -> {
                    ObjectNode item = pages.addObject();
                    item.put("pageNumber", page.pageNumber());
                    item.put("goalId", page.goalId());
                    item.put("title", page.title());
                    item.put("description", page.description());
                    ArrayNode breadcrumbs = item.putArray("breadcrumbs");
                    page.breadcrumbs().forEach(breadcrumbs::add);
                    item.put("goalFingerprint", page.goalFingerprint());
                    item.put("pageFingerprint", page.pageFingerprint());
                });
        return canonicalJson.serialize(root);
    }

    private PublishedBook parseSnapshot(String json) {
        JsonNode root = canonicalJson.parseStored(json);
        String id = requiredStableId(root, "bookId");
        String title = requiredText(root, "title", 500);
        String locale = requiredLocale(root, "locale");
        String edition = requiredStableId(root, "edition");
        String bookDigest = requiredDigest(root, "bookDigest");
        String modelSha256 = requiredDigest(root, "modelSha256");
        String manifest = requiredDigest(root, "renderManifestFingerprint");
        JsonNode entries = root.get("pages");
        require(entries != null && entries.isArray() && !entries.isEmpty(), "Durable goal-book pages are missing");
        return new PublishedBook(
                id, title, locale, edition, bookDigest, modelSha256, manifest,
                Map.copyOf(parsePages(id, entries)));
    }

    private Map<PublicationKey, PublishedBook> loadStaticBooks(ObjectMapper mapper, ResourceLoader loader) {
        JsonNode index = parse(mapper, read(loader.getResource(INDEX_RESOURCE), INDEX_RESOURCE), INDEX_RESOURCE);
        require(index.path("schemaVersion").asInt(-1) == 1, "Unsupported goal-book index schema");
        JsonNode entries = index.get("books");
        require(entries != null && entries.isArray() && !entries.isEmpty(), "Goal-book index is empty");
        Map<PublicationKey, PublishedBook> result = new HashMap<>();
        Set<String> currentBookIds = new HashSet<>();
        for (JsonNode entry : entries) {
            String id = requiredStableId(entry, "bookId");
            require(currentBookIds.add(id), "Duplicate current goal-book ID: " + id);
            String title = requiredText(entry, "title", 500);
            String locale = requiredLocale(entry, "locale");
            int pageCount = requiredPositiveInt(entry, "pageCount");
            JsonNode modelReference = requiredObject(entry, "model");
            String modelUrl = requiredText(modelReference, "url", 250);
            require(MODEL_URL.matcher(modelUrl).matches(), "Unsafe goal-book model URL: " + modelUrl);
            String modelSha256 = requiredDigest(modelReference, "sha256");
            String modelDigest = requiredDigest(modelReference, "modelDigest");
            String renderManifestSha256 = requiredDigest(requiredObject(entry, "pdf"), "renderManifestSha256");
            byte[] modelBytes = read(loader.getResource("classpath:static" + modelUrl), modelUrl);
            require(sha256(modelBytes).equals(modelSha256), "Goal-book model hash mismatch: " + modelUrl);
            JsonNode model = parse(mapper, modelBytes, modelUrl);
            JsonNode book = requiredObject(model, "book");
            require(id.equals(requiredStableId(book, "id")), "Goal-book ID mismatch: " + id);
            require(title.equals(requiredText(book, "title", 500)), "Goal-book title mismatch: " + id);
            require(locale.equals(requiredLocale(book, "locale")), "Goal-book locale mismatch: " + id);
            require(pageCount == requiredPositiveInt(book, "pageCount"), "Goal-book page count mismatch: " + id);
            String edition = requiredStableId(book, "edition");
            require(modelDigest.equals(requiredDigest(model, "digest")), "Goal-book digest mismatch: " + id);
            JsonNode pageEntries = model.get("pages");
            require(pageEntries != null && pageEntries.isArray() && pageEntries.size() == pageCount,
                    "Goal-book pages do not match pageCount: " + id);
            PublishedBook publishedBook = new PublishedBook(
                    id, title, locale, edition, modelDigest, modelSha256, renderManifestSha256,
                    Map.copyOf(parsePages(id, pageEntries)));
            PublicationKey key = new PublicationKey(id, edition, modelDigest);
            require(result.put(key, publishedBook) == null, "Duplicate goal-book publication: " + id);
        }
        return result;
    }

    private static Map<Integer, PublishedPage> parsePages(String bookId, JsonNode pageEntries) {
        Map<Integer, PublishedPage> pages = new HashMap<>();
        Set<String> goals = new HashSet<>();
        for (JsonNode page : pageEntries) {
            int pageNumber = requiredPositiveInt(page, "pageNumber");
            String goalId = requiredStableId(page, "goalId");
            String goalFingerprint = requiredDigest(page, "goalFingerprint");
            String pageFingerprint = requiredDigest(page, "pageFingerprint");
            String pageTitle = requiredText(page, "title", 1_000);
            String description = requiredText(page, "description", 8_000);
            JsonNode breadcrumbEntries = page.get("breadcrumbs");
            require(breadcrumbEntries != null && breadcrumbEntries.isArray()
                            && breadcrumbEntries.size() <= 100,
                    "Goal-book breadcrumbs missing: " + bookId + "/" + pageNumber);
            List<String> breadcrumbs = new ArrayList<>();
            for (JsonNode breadcrumb : breadcrumbEntries) {
                require(breadcrumb.isTextual() && !breadcrumb.textValue().isBlank()
                                && breadcrumb.textValue().length() <= 1_000,
                        "Invalid goal-book breadcrumb: " + bookId + "/" + pageNumber);
                breadcrumbs.add(breadcrumb.textValue());
            }
            PublishedPage publishedPage = new PublishedPage(
                    pageNumber, goalId, pageTitle, description, List.copyOf(breadcrumbs),
                    goalFingerprint, pageFingerprint);
            require(pages.put(pageNumber, publishedPage) == null,
                    "Duplicate goal-book page number: " + bookId + "/" + pageNumber);
            require(goals.add(goalId), "Duplicate goal-book goal ID: " + bookId + "/" + goalId);
        }
        return pages;
    }

    private static byte[] read(Resource resource, String label) {
        try (InputStream stream = resource.getInputStream()) {
            return stream.readAllBytes();
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to read goal-book publication resource: " + label, exception);
        }
    }

    private static JsonNode parse(ObjectMapper mapper, byte[] bytes, String label) {
        try {
            return mapper.readTree(bytes);
        } catch (IOException exception) {
            throw new IllegalStateException("Invalid goal-book publication JSON: " + label, exception);
        }
    }

    private static JsonNode requiredObject(JsonNode parent, String name) {
        JsonNode value = parent.get(name);
        require(value != null && value.isObject(), "Missing goal-book object: " + name);
        return value;
    }

    private static String requiredStableId(JsonNode parent, String name) {
        String value = requiredText(parent, name, 200);
        require(STABLE_ID.matcher(value).matches(), "Invalid stable goal-book ID: " + name);
        return value;
    }

    private static String requiredLocale(JsonNode parent, String name) {
        String value = requiredText(parent, name, 35);
        require(LOCALE.matcher(value).matches(), "Invalid goal-book locale: " + name);
        return value;
    }

    private static String requiredText(JsonNode parent, String name, int maximumLength) {
        JsonNode value = parent.get(name);
        require(value != null && value.isTextual(), "Missing goal-book text: " + name);
        String text = value.textValue();
        require(!text.isBlank() && text.trim().equals(text) && text.length() <= maximumLength,
                "Invalid goal-book text: " + name);
        return text;
    }

    private static String requiredDigest(JsonNode parent, String name) {
        String digest = requiredText(parent, name, 71);
        require(SHA256.matcher(digest).matches(), "Invalid goal-book digest: " + name);
        return digest;
    }

    private static int requiredPositiveInt(JsonNode parent, String name) {
        JsonNode value = parent.get(name);
        require(value != null && value.isIntegralNumber() && value.canConvertToInt() && value.intValue() >= 1,
                "Invalid goal-book integer: " + name);
        return value.intValue();
    }

    private static URI validatePublicBaseUri(String value) {
        try {
            URI uri = URI.create(value == null ? "" : value.trim());
            boolean loopback = "localhost".equalsIgnoreCase(uri.getHost())
                    || "127.0.0.1".equals(uri.getHost())
                    || "::1".equals(uri.getHost());
            require(uri.isAbsolute()
                            && ("https".equals(uri.getScheme()) || ("http".equals(uri.getScheme()) && loopback))
                            && uri.getHost() != null && uri.getUserInfo() == null
                            && (uri.getPath() == null || uri.getPath().isEmpty() || "/".equals(uri.getPath()))
                            && uri.getQuery() == null && uri.getFragment() == null,
                    "skillpilot.public-base-url must be an absolute HTTP(S) origin URL");
            return URI.create(uri.getScheme() + "://" + uri.getAuthority() + "/");
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("skillpilot.public-base-url must be an absolute HTTP(S) origin URL", exception);
        }
    }

    private static boolean isH2(DataSource dataSource) {
        try (var connection = dataSource.getConnection()) {
            return connection.getMetaData().getDatabaseProductName().toLowerCase().contains("h2");
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to identify goal-feedback database", exception);
        }
    }

    private static String sha256(byte[] bytes) {
        try {
            return "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new IllegalStateException(message);
        }
    }

    private record PublicationKey(String bookId, String edition, String bookDigest) {
    }

    private record SnapshotRow(
            UUID id, String modelSha256, String title, String locale,
            String renderManifestSha256, String snapshotJson, Instant firstSeenAt) {
    }

    private record SnapshotIdentity(UUID id, Instant firstSeenAt) {
    }

    private record CurrentPublicationRow(UUID snapshotId, String bookId, Instant firstSeenAt) {
    }

    private record PublishedBook(
            String id, String title, String locale, String edition, String modelDigest,
            String modelSha256, String renderManifestSha256,
            Map<Integer, PublishedPage> pagesByNumber) {
    }

    private record PublishedPage(
            int pageNumber, String goalId, String title, String description,
            List<String> breadcrumbs, String goalFingerprint, String pageFingerprint) {
    }
}
