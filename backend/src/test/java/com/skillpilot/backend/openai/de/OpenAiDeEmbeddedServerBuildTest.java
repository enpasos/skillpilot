package com.skillpilot.backend.openai.de;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class OpenAiDeEmbeddedServerBuildTest {

    private static final String SERVER_BUILD_TOKEN = "@skillpilotServerBuild@";
    private static final Pattern SERVER_BUILD_PROPERTY = Pattern.compile(
            "(?m)^\\s+server-build:\\s+\"?([0-9a-f]{40}|dev)\"?\\s*$");
    private static final Pattern SERVER_VERSION_PROPERTY = Pattern.compile(
            "(?m)^\\s+server-version:\\s+\"?([0-9a-f]{40}|dev)\"?\\s*$");
    private static final Pattern FULL_GIT_COMMIT = Pattern.compile("[0-9a-f]{40}");

    @Test
    void embedsExactGitCommitInApplicationResourceWithoutRuntimeOverride() throws IOException {
        String applicationYaml = new ClassPathResource("application.yml")
                .getContentAsString(StandardCharsets.UTF_8);

        assertThat(applicationYaml)
                .doesNotContain(SERVER_BUILD_TOKEN)
                .doesNotContain("SKILLPILOT_SERVER_BUILD");

        String expectedBuild = resolveGitCommitOrDev();
        assertSingleValue(applicationYaml, SERVER_BUILD_PROPERTY, expectedBuild);
        assertSingleValue(applicationYaml, SERVER_VERSION_PROPERTY, expectedBuild);
    }

    private static void assertSingleValue(String yaml, Pattern property, String expectedValue) {
        Matcher matcher = property.matcher(yaml);
        assertThat(matcher.find()).isTrue();
        assertThat(matcher.group(1)).isEqualTo(expectedValue);
        assertThat(matcher.find()).isFalse();
    }

    private static String resolveGitCommitOrDev() {
        Process process = null;
        try {
            process = new ProcessBuilder("git", "rev-parse", "--verify", "HEAD^{commit}")
                    .directory(Path.of("").toAbsolutePath().toFile())
                    .redirectError(ProcessBuilder.Redirect.DISCARD)
                    .start();
            if (!process.waitFor(10, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                return "dev";
            }
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8)
                    .trim();
            return process.exitValue() == 0 && FULL_GIT_COMMIT.matcher(output).matches()
                    ? output
                    : "dev";
        } catch (IOException exception) {
            return "dev";
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            return "dev";
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }
}
