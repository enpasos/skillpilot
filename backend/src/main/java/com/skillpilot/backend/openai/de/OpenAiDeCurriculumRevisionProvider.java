package com.skillpilot.backend.openai.de;

import com.skillpilot.backend.curriculumpackage.CurriculumPackageProperties;
import com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshotProvider;
import com.skillpilot.backend.curriculumpackage.CurriculumSourceMode;
import com.skillpilot.backend.landscape.LandscapeProperties;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Derives the curriculum revision from the immutable package generation or
 * from repository JSON that can affect the loaded curriculum runtime. QA
 * ledgers are deliberately excluded.
 */
@Component
@ConditionalOnProperty(name = "skillpilot.openai.coach.de.v1.enabled", havingValue = "true")
public final class OpenAiDeCurriculumRevisionProvider {

    private static final byte[] DOMAIN =
            "skillpilot-curriculum-runtime-v1".getBytes(StandardCharsets.UTF_8);

    private final String currentRevision;

    public OpenAiDeCurriculumRevisionProvider(
            OpenAiDeProperties openAiProperties,
            CurriculumPackageProperties packageProperties,
            LandscapeProperties landscapeProperties,
            ObjectProvider<CurriculumRuntimeSnapshotProvider> packageSnapshots) {
        String derived = packageProperties.getSource() == CurriculumSourceMode.PACKAGE
                ? packageRevision(packageSnapshots.getIfAvailable())
                : repositoryRevision(Path.of(landscapeProperties.getDirectory()));
        String expected = trimToNull(openAiProperties.getCurriculumRevision());
        if (expected != null && !expected.equals(derived)) {
            throw new IllegalStateException(
                    "Configured OpenAI-DE curriculum revision does not match the loaded runtime: expected "
                            + expected + " but derived " + derived + ".");
        }
        this.currentRevision = derived;
    }

    public String currentRevision() {
        return currentRevision;
    }

    static String repositoryRevision(Path root) {
        Path normalizedRoot = root.toAbsolutePath().normalize();
        if (!Files.isDirectory(normalizedRoot)) {
            throw new IllegalStateException(
                    "Cannot derive OpenAI-DE curriculum revision: directory is missing: "
                            + normalizedRoot);
        }
        try {
            List<Path> inputs;
            try (var paths = Files.walk(normalizedRoot)) {
                inputs = paths.filter(Files::isRegularFile)
                        .filter(path -> isRuntimeJson(normalizedRoot, path))
                        .sorted((left, right) -> relative(normalizedRoot, left)
                                .compareTo(relative(normalizedRoot, right)))
                        .toList();
            }
            if (inputs.isEmpty()) {
                throw new IllegalStateException(
                        "Cannot derive OpenAI-DE curriculum revision: no runtime JSON inputs in "
                                + normalizedRoot);
            }
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            updateFramed(digest, DOMAIN);
            byte[] buffer = new byte[8192];
            for (Path input : inputs) {
                updateFramed(
                        digest,
                        relative(normalizedRoot, input).getBytes(StandardCharsets.UTF_8));
                try (InputStream stream = Files.newInputStream(input)) {
                    int count;
                    while ((count = stream.read(buffer)) >= 0) {
                        if (count > 0) {
                            digest.update(buffer, 0, count);
                        }
                    }
                }
                digest.update((byte) 0);
            }
            return "curricula-sha256@" + HexFormat.of().formatHex(digest.digest());
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not read curriculum inputs for the OpenAI-DE revision.", exception);
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Could not derive the OpenAI-DE curriculum revision.", exception);
        }
    }

    private static String packageRevision(CurriculumRuntimeSnapshotProvider snapshots) {
        if (snapshots == null) {
            throw new IllegalStateException(
                    "Package curriculum source is active without a runtime snapshot.");
        }
        return "curriculum-package@" + snapshots.current().generationSha256();
    }

    private static boolean isRuntimeJson(Path root, Path path) {
        String name = path.getFileName().toString();
        if (!(name.endsWith(".json") || name.endsWith(".json.snapshot"))) {
            return false;
        }
        for (Path component : root.relativize(path)) {
            if ("quality".equals(component.toString())) {
                return false;
            }
        }
        return true;
    }

    private static String relative(Path root, Path path) {
        return root.relativize(path.toAbsolutePath().normalize())
                .toString()
                .replace('\\', '/');
    }

    private static void updateFramed(MessageDigest digest, byte[] value) {
        digest.update(ByteBuffer.allocate(Integer.BYTES).putInt(value.length).array());
        digest.update(value);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
