package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class LearningUnitEntryDerivationTest {
    private static final String DESCRIPTOR = "DE/Gymnasium/learning-units/entries/math-entry-v1.derivation.json";
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void exactReviewedEntryOnlyExemptsOriginalOverviewAndDescriptorFromInstalledParity() throws Exception {
        var files = files();
        var descriptor = mapper.readTree(files.get(DESCRIPTOR));
        assertThat(LearningUnitEntryDerivation.validate(pointer(files), files, mapper))
                .containsExactlyInAnyOrder(DESCRIPTOR, descriptor.path("originalOverviewPath").asText())
                .doesNotContain(descriptor.path("entryPath").asText());
    }

    @Test void rebindingHashesCannotAuthorizeChangedFlowOrOldIdentityReuse() throws Exception {
        for (String mutation : java.util.List.of("flow", "identity", "contains")) {
            var files = files();
            ObjectNode descriptor = (ObjectNode) mapper.readTree(files.get(DESCRIPTOR));
            String path = descriptor.path("entryPath").asText();
            ObjectNode entry = (ObjectNode) mapper.readTree(files.get(path));
            if ("flow".equals(mutation)) entry.putObject("personalizationFlow");
            if ("identity".equals(mutation)) {
                String originalId = mapper.readTree(files.get(descriptor.path("originalOverviewPath").asText())).path("landscapeId").asText();
                entry.put("landscapeId", originalId); descriptor.put("entryLandscapeId", originalId);
            }
            if ("contains".equals(mutation)) ((ObjectNode) entry.path("goals").path(0)).putArray("contains").add("foreign-root");
            files.put(path, mapper.writeValueAsBytes(entry)); descriptor.put("entrySha256", digest(files.get(path)));
            files.put(DESCRIPTOR, mapper.writeValueAsBytes(descriptor));
            assertThatThrownBy(() -> LearningUnitEntryDerivation.validate(pointer(files), files, mapper))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test void missingReviewOrChangedOriginalCannotBeTreatedAsProvenance() throws Exception {
        var files = files();
        var descriptor = mapper.readTree(files.get(DESCRIPTOR));
        files.remove(descriptor.path("reviewRef").asText());
        assertThatThrownBy(() -> LearningUnitEntryDerivation.validate(pointer(files), files, mapper))
                .hasMessageContaining("pinned entry derivation input");
        var changed = files();
        changed.put(descriptor.path("originalOverviewPath").asText(), new byte[] {1});
        assertThatThrownBy(() -> LearningUnitEntryDerivation.validate(pointer(changed), changed, mapper))
                .hasMessageContaining("pinned entry derivation input");
    }

    private Map<String, byte[]> files() throws Exception {
        Path root = Path.of("../curricula");
        Map<String, byte[]> files = new LinkedHashMap<>();
        files.put(DESCRIPTOR, Files.readAllBytes(root.resolve(DESCRIPTOR)));
        var descriptor = mapper.readTree(files.get(DESCRIPTOR));
        for (String field : java.util.List.of("entryPath", "originalOverviewPath", "reviewRef")) {
            String path = descriptor.path(field).asText(); files.put(path, Files.readAllBytes(root.resolve(path)));
        }
        return files;
    }

    private static LearningUnitOfferBindings.Proof pointer(Map<String, byte[]> files) throws Exception {
        return new LearningUnitOfferBindings.Proof(DESCRIPTOR, digest(files.get(DESCRIPTOR)));
    }
    private static String digest(byte[] bytes) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
    }
}
