package com.skillpilot.backend.connectors.claude.v1.publication;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ClaudeV1PluginPublicationControllerTest {

    private static final String PLUGIN_ID = "skillpilot-coach-v1";
    private static final String VERSION = "1.0.2";
    private static final String FILENAME = "skillpilot-coach-v1-1.0.2.plugin";
    private static final byte[] PLUGIN_BYTES = "deterministic-plugin-fixture\n"
            .getBytes(StandardCharsets.UTF_8);

    @TempDir
    Path temporaryDirectory;

    @Test
    void servesValidatedIndexWithoutCachingOrSniffing() throws Exception {
        Fixture fixture = fixture();

        fixture.mockMvc().perform(get(ClaudeV1PluginPublicationController.PUBLIC_BASE_PATH + "/index.json"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json(fixture.indexJson()))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("no-store")))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string(HttpHeaders.CONTENT_LENGTH,
                        Integer.toString(fixture.indexJson().getBytes(StandardCharsets.UTF_8).length)));
    }

    @Test
    void servesOnlyRegisteredVersionedArtifactWithImmutableHeaders() throws Exception {
        Fixture fixture = fixture();

        fixture.mockMvc().perform(get(fixture.downloadUrl()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_OCTET_STREAM))
                .andExpect(content().bytes(PLUGIN_BYTES))
                .andExpect(header().string(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + FILENAME + "\""))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("max-age=31536000")))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("public")))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("immutable")))
                .andExpect(header().string(HttpHeaders.ETAG, "\"sha256-" + fixture.sha256() + "\""))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string(HttpHeaders.CONTENT_LENGTH,
                        Integer.toString(PLUGIN_BYTES.length)));
    }

    @Test
    void rejectsUnknownVersionHashAndFilename() throws Exception {
        Fixture fixture = fixture();
        String base = ClaudeV1PluginPublicationController.PUBLIC_BASE_PATH + "/" + PLUGIN_ID;

        fixture.mockMvc().perform(get(base + "/1.0.1/sha256-" + fixture.sha256() + "/" + FILENAME))
                .andExpect(status().isNotFound());
        fixture.mockMvc().perform(get(base + "/" + VERSION + "/sha256-"
                        + "0".repeat(64) + "/" + FILENAME))
                .andExpect(status().isNotFound());
        fixture.mockMvc().perform(get(base + "/" + VERSION + "/sha256-"
                        + fixture.sha256() + "/another.plugin"))
                .andExpect(status().isNotFound());
    }

    @Test
    void failsClosedWhenRegisteredArtifactBytesDoNotMatchIndex() throws Exception {
        Fixture fixture = fixture();
        Files.writeString(fixture.artifactPath(), "tampered\n", StandardCharsets.UTF_8);

        fixture.mockMvc().perform(get(ClaudeV1PluginPublicationController.PUBLIC_BASE_PATH + "/index.json"))
                .andExpect(status().isServiceUnavailable());
        fixture.mockMvc().perform(get(fixture.downloadUrl()))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void failsClosedForUnknownIndexFields() throws Exception {
        Fixture fixture = fixture();
        Files.writeString(
                fixture.indexPath(),
                fixture.indexJson().replace("\"channel\": \"beta\",",
                        "\"channel\": \"beta\",\n  \"unexpected\": true,"),
                StandardCharsets.UTF_8);

        fixture.mockMvc().perform(get(ClaudeV1PluginPublicationController.PUBLIC_BASE_PATH + "/index.json"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void failsClosedForNonCanonicalBetaRequirements() throws Exception {
        Fixture fixture = fixture();
        Files.writeString(
                fixture.indexPath(),
                fixture.indexJson().replace("\"plan\": \"claude-pro\"", "\"plan\": \"Claude Pro\""),
                StandardCharsets.UTF_8);

        fixture.mockMvc().perform(get(ClaudeV1PluginPublicationController.PUBLIC_BASE_PATH + "/index.json"))
                .andExpect(status().isServiceUnavailable());
    }

    private Fixture fixture() throws IOException {
        String digest = sha256(PLUGIN_BYTES);
        String downloadUrl = ClaudeV1PluginPublicationController.PUBLIC_BASE_PATH
                + "/" + PLUGIN_ID + "/" + VERSION + "/sha256-" + digest + "/" + FILENAME;
        Path root = temporaryDirectory.resolve("claude-plugin-publication");
        Path artifactPath = root
                .resolve(PLUGIN_ID)
                .resolve(VERSION)
                .resolve("sha256-" + digest)
                .resolve(FILENAME);
        Files.createDirectories(artifactPath.getParent());
        Files.write(artifactPath, PLUGIN_BYTES);

        String indexJson = """
                {
                  "schemaVersion": 1,
                  "channel": "beta",
                  "preparedAt": "2026-08-25T06:30:00.000Z",
                  "plugins": [
                    {
                      "id": "%s",
                      "name": "SkillPilot Coach",
                      "version": "%s",
                      "status": "beta",
                      "filename": "%s",
                      "bytes": %d,
                      "sha256": "%s",
                      "downloadUrl": "%s",
                      "sourceUrl": "https://github.com/enpasos/skillpilot",
                      "privacyUrl": "https://mcp-claude-v1.skillpilot.com/privacy",
                      "termsUrl": "https://skillpilot.com/legal",
                      "supportEmail": "support@skillpilot.com",
                      "requirements": {
                        "minimumAge": 18,
                        "plan": "claude-pro",
                        "installSurface": "claude-web",
                        "testedSurfaces": ["claude-web", "claude-android"],
                        "voiceMode": true
                      }
                    }
                  ]
                }
                """.formatted(
                        PLUGIN_ID,
                        VERSION,
                        FILENAME,
                        PLUGIN_BYTES.length,
                        digest,
                        downloadUrl);
        Path indexPath = root.resolve("index.json");
        Files.writeString(indexPath, indexJson, StandardCharsets.UTF_8);

        ClaudeV1PluginPublicationController controller = new ClaudeV1PluginPublicationController(
                new DefaultResourceLoader(),
                new ObjectMapper(),
                indexPath.toUri().toString(),
                root.toUri().toString());
        return new Fixture(
                MockMvcBuilders.standaloneSetup(controller).build(),
                indexJson,
                downloadUrl,
                digest,
                indexPath,
                artifactPath);
    }

    private static String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    private record Fixture(
            MockMvc mockMvc,
            String indexJson,
            String downloadUrl,
            String sha256,
            Path indexPath,
            Path artifactPath) {
    }
}
