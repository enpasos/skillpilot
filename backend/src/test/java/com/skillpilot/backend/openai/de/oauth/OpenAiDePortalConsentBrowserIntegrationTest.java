package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

/** The OAuth provider security lane supplies the lockfile-pinned headless browser. */
@EnabledIfEnvironmentVariable(named = "SKILLPILOT_OPENAI_PORTAL_BROWSER_TEST", matches = "true")
class OpenAiDePortalConsentBrowserIntegrationTest {

    @Test
    void oneRealBrowserConsentSubmissionReachesTheRegisteredPortalCallback() throws Exception {
        try (var fixture = OpenAiDeHostedCimdProfilesIntegrationTest.startBrowserConsentFixture()) {
            var browser = new ProcessBuilder("node", "scripts/openai_portal_consent_browser.mjs")
                    .directory(Path.of("..").toFile())
                    .redirectErrorStream(true);
            browser.environment().keySet().retainAll(Set.of("PATH", "HOME", "PLAYWRIGHT_BROWSERS_PATH", "LANG", "LC_ALL"));
            var process = browser.start();
            try {
                try (var input = process.getOutputStream()) {
                    new ObjectMapper().writeValue(input, Map.of(
                            "authorization", fixture.authorization().toString(), "callback", fixture.callback().toString()));
                }
                assertThat(process.waitFor(60, TimeUnit.SECONDS)).as("the Chromium consent run finishes").isTrue();
                String report = new String(process.getInputStream().readNBytes(512), StandardCharsets.UTF_8).strip();
                String safeStatus = report.matches("portal_consent_browser_failed phase=[a-z_]+ consent_http=[0-9]{1,3} approval_http=[0-9]{1,3}")
                        ? report : "no recognized browser receipt";
                assertThat(process.exitValue()).as("Chromium consent status: %s", safeStatus).isZero();
                assertThat(report.equals("portal_consent_browser_pass posts=1 callbacks=1"))
                        .as("the browser observed exactly one real consent POST and one callback").isTrue();
            } finally {
                if (process.isAlive()) {
                    process.descendants().forEach(ProcessHandle::destroyForcibly);
                    process.destroyForcibly();
                }
            }
        }
    }
}
