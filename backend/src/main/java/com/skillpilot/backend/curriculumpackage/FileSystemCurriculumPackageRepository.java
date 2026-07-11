package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Reads an exact active lock from a prevalidated, content-addressed package store.
 * It deliberately has no discovery, installation, pinning, or implicit latest behavior.
 */
public final class FileSystemCurriculumPackageRepository implements CurriculumPackageRepository {

    static final String LOCK_FORMAT_VERSION = "1.0";
    static final String INSTALL_RECORD_FORMAT_VERSION = "1.0";
    static final String VALIDATOR_ID = "skillpilot-full-standalone-package-validator-v2";
    static final int VALIDATOR_REPORT_FORMAT_VERSION = 2;
    private static final long MAX_LOCK_BYTES = 4L * 1024L * 1024L;
    private static final long MAX_INSTALL_RECORD_BYTES = 4L * 1024L * 1024L;
    private static final long MAX_VALIDATION_REPORT_BYTES = 16L * 1024L * 1024L;
    private static final int MAX_ACTIVE_PACKAGES = 256;
    private static final Pattern SHA256 = Pattern.compile("^[a-f0-9]{64}$");
    private static final Pattern CONTENT_DIGEST = Pattern.compile("^sha256:[a-f0-9]{64}$");
    private static final Pattern PACKAGE_ID = Pattern.compile("^[a-z0-9]+(?:[._-][a-z0-9]+)+$");
    private static final Pattern PACKAGE_VERSION = Pattern.compile("^[0-9A-Za-z][0-9A-Za-z.+-]{0,127}$");
    private static final Pattern PORTABLE_SEGMENT = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9._-]{0,179}$");
    private static final Set<String> REQUIRED_GATES = Set.of(
            "inventory",
            "runtimeCatalog",
            "offlineSchemaCatalog",
            "hardReferenceClosure",
            "contentDigest",
            "assetBytes");

    private final CurriculumPackageProperties properties;
    private final ObjectMapper objectMapper;
    private final CurriculumPackageFileReader fileReader;

    public FileSystemCurriculumPackageRepository(
            CurriculumPackageProperties properties,
            ObjectMapper objectMapper,
            CurriculumPackageFileReader fileReader) {
        this.properties = properties;
        this.objectMapper = CurriculumPackageJson.strictCopy(objectMapper);
        this.fileReader = fileReader;
    }

    @Override
    public ActivePackageSet loadActivePackageSet() {
        requirePackageMode();
        Path storeRoot = checkedStoreRoot();
        String activeLockPath = properties.getPackages().getActiveLock();
        CurriculumPackageFileReader.validateRelativePath(activeLockPath, "active lock path");
        byte[] lockBytes = fileReader.readStoreControlFile(storeRoot, activeLockPath, MAX_LOCK_BYTES);
        String lockSha256 = CurriculumPackageFileReader.sha256(lockBytes);
        JsonNode lockNode = parseJson(lockBytes, "active package lock");
        requireExactFields(lockNode, Set.of("lockFormatVersion", "packages"), "active package lock");
        requireExactText(lockNode, "lockFormatVersion", LOCK_FORMAT_VERSION, "active package lock");
        JsonNode packagesNode = requiredArray(lockNode, "packages", "active package lock");
        if (packagesNode.isEmpty()) {
            throw failure("Active package lock must select at least one package");
        }
        if (packagesNode.size() > MAX_ACTIVE_PACKAGES) {
            throw failure("Active package lock exceeds " + MAX_ACTIVE_PACKAGES + " packages");
        }

        List<InstalledCurriculumPackage> packages = new ArrayList<>();
        Set<String> packageIds = new HashSet<>();
        String previousPackageId = null;
        for (int index = 0; index < packagesNode.size(); index += 1) {
            CurriculumPackageLock.Entry entry = parseLockEntry(packagesNode.get(index), index);
            if (!packageIds.add(entry.packageId())) {
                throw failure("Active package lock contains packageId more than once: " + entry.packageId());
            }
            if (previousPackageId != null && previousPackageId.compareTo(entry.packageId()) >= 0) {
                throw failure("Active package lock packages must be strictly sorted by packageId");
            }
            previousPackageId = entry.packageId();
            packages.add(loadInstalledPackage(storeRoot, entry));
        }
        return new ActivePackageSet(lockSha256, packages);
    }

    private CurriculumPackageLock.Entry parseLockEntry(JsonNode node, int index) {
        String context = "active package lock packages[" + index + "]";
        requireExactFields(node, Set.of(
                "packageId",
                "packageVersion",
                "releaseId",
                "outerZipSha256",
                "manifestSha256",
                "contentDigest",
                "archiveRoot",
                "closureDigest",
                "definitionIndexDigest",
                "installRecordSha256"), context);
        String packageId = requiredPatternText(node, "packageId", PACKAGE_ID, context);
        String packageVersion = requiredPatternText(node, "packageVersion", PACKAGE_VERSION, context);
        String releaseId = requiredText(node, "releaseId", context);
        if (!releaseId.equals(packageId + "@" + packageVersion)) {
            throw failure(context + ".releaseId must equal packageId@packageVersion");
        }
        return new CurriculumPackageLock.Entry(
                packageId,
                packageVersion,
                releaseId,
                requiredPatternText(node, "outerZipSha256", SHA256, context),
                requiredPatternText(node, "manifestSha256", SHA256, context),
                requiredPatternText(node, "contentDigest", CONTENT_DIGEST, context),
                requiredPatternText(node, "archiveRoot", PORTABLE_SEGMENT, context),
                requiredPatternText(node, "closureDigest", CONTENT_DIGEST, context),
                requiredPatternText(node, "definitionIndexDigest", CONTENT_DIGEST, context),
                requiredPatternText(node, "installRecordSha256", SHA256, context));
    }

    private InstalledCurriculumPackage loadInstalledPackage(
            Path storeRoot,
            CurriculumPackageLock.Entry entry) {
        String installRecordPath = "install-records/" + entry.outerZipSha256() + ".json";
        byte[] installRecordBytes = fileReader.readStoreControlFile(
                storeRoot,
                installRecordPath,
                MAX_INSTALL_RECORD_BYTES);
        if (!CurriculumPackageFileReader.sha256(installRecordBytes).equals(entry.installRecordSha256())) {
            throw failure("Install record SHA-256 drift for " + entry.releaseId());
        }
        JsonNode installRecord = parseJson(installRecordBytes, "install record " + entry.releaseId());
        validateInstallRecord(installRecord, entry);

        String reportPath = "validation-reports/" + entry.outerZipSha256() + ".json";
        byte[] reportBytes = fileReader.readStoreControlFile(storeRoot, reportPath, MAX_VALIDATION_REPORT_BYTES);
        String expectedReportSha256 = requiredPatternText(
                installRecord,
                "validationReportSha256",
                SHA256,
                "install record " + entry.releaseId());
        if (!CurriculumPackageFileReader.sha256(reportBytes).equals(expectedReportSha256)) {
            throw failure("Validation report SHA-256 drift for " + entry.releaseId());
        }
        long outerZipBytes = requirePositiveLong(
                installRecord,
                "outerZipBytes",
                "install record " + entry.releaseId());
        int validatedManifestFileCount = validateValidationReport(
                parseJson(reportBytes, "validation report " + entry.releaseId()),
                entry,
                outerZipBytes);

        Path packageRoot = storeRoot.resolve("objects")
                .resolve("sha256")
                .resolve(entry.outerZipSha256())
                .resolve(entry.archiveRoot())
                .normalize();
        assertDerivedDirectory(storeRoot, packageRoot, "package object root");
        InstalledCurriculumPackage installedPackage = new InstalledCurriculumPackage(
                entry,
                packageRoot,
                validatedManifestFileCount);
        byte[] manifestBytes = fileReader.readStoreControlFile(
                packageRoot,
                "metadata/manifest.json",
                CurriculumPackageFileReader.MAX_CONTROL_BYTES);
        if (!CurriculumPackageFileReader.sha256(manifestBytes).equals(entry.manifestSha256())) {
            throw failure("Manifest SHA-256 drift for " + entry.releaseId());
        }
        return installedPackage;
    }

    private void validateInstallRecord(JsonNode node, CurriculumPackageLock.Entry entry) {
        String context = "install record " + entry.releaseId();
        requireExactFields(node, Set.of(
                "installRecordFormatVersion",
                "outerZipSha256",
                "outerZipBytes",
                "manifestSha256",
                "closureDigest",
                "definitionIndexDigest",
                "packageId",
                "packageVersion",
                "releaseId",
                "contentDigest",
                "archiveRoot",
                "validationReportSha256"), context);
        requireExactText(node, "installRecordFormatVersion", INSTALL_RECORD_FORMAT_VERSION, context);
        requireExactText(node, "outerZipSha256", entry.outerZipSha256(), context);
        requirePositiveLong(node, "outerZipBytes", context);
        requireExactText(node, "manifestSha256", entry.manifestSha256(), context);
        requireExactText(node, "closureDigest", entry.closureDigest(), context);
        requireExactText(node, "definitionIndexDigest", entry.definitionIndexDigest(), context);
        requireExactText(node, "packageId", entry.packageId(), context);
        requireExactText(node, "packageVersion", entry.packageVersion(), context);
        requireExactText(node, "releaseId", entry.releaseId(), context);
        requireExactText(node, "contentDigest", entry.contentDigest(), context);
        requireExactText(node, "archiveRoot", entry.archiveRoot(), context);
        requiredPatternText(node, "validationReportSha256", SHA256, context);
    }

    private int validateValidationReport(
            JsonNode node,
            CurriculumPackageLock.Entry entry,
            long outerZipBytes) {
        String context = "validation report " + entry.releaseId();
        requireExactFields(node, Set.of(
                "counts",
                "diagnostics",
                "diagnosticsTruncated",
                "gates",
                "input",
                "package",
                "reportFormatVersion",
                "status",
                "validatorId"), context);
        requireExactInt(node, "reportFormatVersion", VALIDATOR_REPORT_FORMAT_VERSION, context);
        requireExactText(node, "validatorId", VALIDATOR_ID, context);
        requireExactText(node, "status", "valid", context);
        JsonNode diagnostics = requiredArray(node, "diagnostics", context);
        if (!diagnostics.isEmpty()) {
            throw failure(context + ".diagnostics must be empty");
        }
        JsonNode truncated = node.get("diagnosticsTruncated");
        if (truncated == null || !truncated.isBoolean() || truncated.booleanValue()) {
            throw failure(context + ".diagnosticsTruncated must be false");
        }

        JsonNode input = requiredObject(node, "input", context);
        requireExactFields(input, Set.of("bytes", "path", "sha256"), context + ".input");
        JsonNode inputBytes = input.get("bytes");
        if (inputBytes == null
                || !inputBytes.isIntegralNumber()
                || !inputBytes.canConvertToLong()
                || inputBytes.longValue() != outerZipBytes) {
            throw failure(context + ".input.bytes must equal the install record outerZipBytes");
        }
        requiredText(input, "path", context + ".input");
        requireExactText(input, "sha256", entry.outerZipSha256(), context + ".input");

        JsonNode packageNode = requiredObject(node, "package", context);
        requireExactFields(packageNode, Set.of(
                "archiveRoot",
                "contentDigest",
                "packageId",
                "packageVersion",
                "releaseId",
                "manifestSha256",
                "closureDigest",
                "definitionIndexDigest"), context + ".package");
        requireExactText(packageNode, "archiveRoot", entry.archiveRoot(), context + ".package");
        requireExactText(packageNode, "contentDigest", entry.contentDigest(), context + ".package");
        requireExactText(packageNode, "packageId", entry.packageId(), context + ".package");
        requireExactText(packageNode, "packageVersion", entry.packageVersion(), context + ".package");
        requireExactText(packageNode, "releaseId", entry.releaseId(), context + ".package");
        requireExactText(packageNode, "manifestSha256", entry.manifestSha256(), context + ".package");
        requireExactText(packageNode, "closureDigest", entry.closureDigest(), context + ".package");
        requireExactText(
                packageNode,
                "definitionIndexDigest",
                entry.definitionIndexDigest(),
                context + ".package");

        JsonNode counts = requiredObject(node, "counts", context);
        requireExactFields(counts, Set.of(
                "archiveEntries", "manifestFiles", "logicalArtifacts", "binaryResources"), context + ".counts");
        long archiveEntries = requireNonNegativeLong(counts, "archiveEntries", context + ".counts");
        long manifestFiles = requirePositiveLong(counts, "manifestFiles", context + ".counts");
        long logicalArtifacts = requireNonNegativeLong(counts, "logicalArtifacts", context + ".counts");
        long binaryResources = requireNonNegativeLong(counts, "binaryResources", context + ".counts");
        if (archiveEntries != manifestFiles + 2
                || logicalArtifacts > manifestFiles
                || binaryResources > manifestFiles) {
            throw failure(context + ".counts are not plausible");
        }

        JsonNode gates = requiredObject(node, "gates", context);
        requireExactFields(gates, REQUIRED_GATES, context + ".gates");
        for (String gateName : REQUIRED_GATES) {
            JsonNode gate = requiredObject(gates, gateName, context + ".gates");
            requireExactFields(gate, Set.of("diagnosticCodes", "diagnosticCount", "status"),
                    context + ".gates." + gateName);
            requireExactText(gate, "status", "passed", context + ".gates." + gateName);
            requireExactInt(gate, "diagnosticCount", 0, context + ".gates." + gateName);
            if (!requiredArray(gate, "diagnosticCodes", context + ".gates." + gateName).isEmpty()) {
                throw failure(context + ".gates." + gateName + ".diagnosticCodes must be empty");
            }
        }
        return Math.toIntExact(manifestFiles);
    }

    private Path checkedStoreRoot() {
        String configured = properties.getPackages().getStoreDirectory();
        if (configured == null || configured.isBlank()) {
            throw failure("skillpilot.curriculum.packages.store-directory must not be blank");
        }
        Path root = Path.of(configured).toAbsolutePath().normalize();
        if (Files.isSymbolicLink(root) || !Files.isDirectory(root, LinkOption.NOFOLLOW_LINKS)) {
            throw failure("Curriculum package store must be a real directory: " + root);
        }
        return root;
    }

    private static void assertDerivedDirectory(Path storeRoot, Path derived, String description) {
        if (!derived.startsWith(storeRoot)) {
            throw failure(description + " escapes package store");
        }
        Path cursor = storeRoot;
        Path relative = storeRoot.relativize(derived);
        for (Path segment : relative) {
            cursor = cursor.resolve(segment);
            if (Files.isSymbolicLink(cursor)
                    || !Files.isDirectory(cursor, LinkOption.NOFOLLOW_LINKS)) {
                throw failure(description + " must be a real directory: " + cursor);
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

    private void requirePackageMode() {
        if (properties.getSource() != CurriculumSourceMode.PACKAGE) {
            throw failure("Curriculum package repository is unavailable unless skillpilot.curriculum.source=package");
        }
    }

    static void requireExactFields(JsonNode node, Set<String> expected, String context) {
        if (node == null || !node.isObject()) {
            throw failure(context + " must be an object");
        }
        Set<String> actual = new HashSet<>();
        node.fieldNames().forEachRemaining(actual::add);
        if (!actual.equals(expected)) {
            throw failure(context + " fields differ; expected " + expected + ", found " + actual);
        }
    }

    static JsonNode requiredObject(JsonNode parent, String field, String context) {
        JsonNode value = parent.get(field);
        if (value == null || !value.isObject()) {
            throw failure(context + "." + field + " must be an object");
        }
        return value;
    }

    static JsonNode requiredArray(JsonNode parent, String field, String context) {
        JsonNode value = parent.get(field);
        if (value == null || !value.isArray()) {
            throw failure(context + "." + field + " must be an array");
        }
        return value;
    }

    static String requiredText(JsonNode parent, String field, String context) {
        JsonNode value = parent.get(field);
        if (value == null || !value.isTextual() || value.textValue().isBlank()) {
            throw failure(context + "." + field + " must be a non-blank string");
        }
        return value.textValue();
    }

    static String requiredPatternText(
            JsonNode parent,
            String field,
            Pattern pattern,
            String context) {
        String value = requiredText(parent, field, context);
        if (!pattern.matcher(value).matches()) {
            throw failure(context + "." + field + " has an invalid value");
        }
        return value;
    }

    static void requireExactText(JsonNode parent, String field, String expected, String context) {
        String actual = requiredText(parent, field, context);
        if (!expected.equals(actual)) {
            throw failure(context + "." + field + " must equal " + expected);
        }
    }

    static void requireExactInt(JsonNode parent, String field, int expected, String context) {
        JsonNode value = parent.get(field);
        if (value == null || !value.isIntegralNumber() || !value.canConvertToInt() || value.intValue() != expected) {
            throw failure(context + "." + field + " must equal " + expected);
        }
    }

    static long requirePositiveLong(JsonNode parent, String field, String context) {
        JsonNode value = parent.get(field);
        if (value == null || !value.isIntegralNumber() || !value.canConvertToLong() || value.longValue() <= 0) {
            throw failure(context + "." + field + " must be a positive integer");
        }
        return value.longValue();
    }

    static long requireNonNegativeLong(JsonNode parent, String field, String context) {
        JsonNode value = parent.get(field);
        if (value == null || !value.isIntegralNumber() || !value.canConvertToLong() || value.longValue() < 0) {
            throw failure(context + "." + field + " must be a non-negative integer");
        }
        return value.longValue();
    }

    static CurriculumPackageException failure(String message) {
        return new CurriculumPackageException(message);
    }

    static CurriculumPackageException failure(String message, Throwable cause) {
        return new CurriculumPackageException(message, cause);
    }
}
