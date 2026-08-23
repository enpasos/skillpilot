package com.skillpilot.backend.connectors.claude.v1.web;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Serves the provider-specific Claude v1 privacy notice without restoring any binding route. */
@RestController
@ConditionalOnClaudeV1Enabled
public class ClaudeV1PrivacyController {

    @GetMapping(value = ClaudeV1Contract.INTERNAL_PRIVACY_PATH, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getPrivacyPage() {
        try (InputStream in = new ClassPathResource("claude-connector-v1/privacy.html").getInputStream()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .cacheControl(CacheControl.noStore())
                    .header("Content-Security-Policy",
                            "default-src 'none'; style-src 'self' 'unsafe-inline'; "
                                    + "img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'")
                    .header("Referrer-Policy", "no-referrer")
                    .header("X-Content-Type-Options", "nosniff")
                    .header("X-Frame-Options", "DENY")
                    .body(new String(in.readAllBytes(), StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "Resource not found.");
        }
    }
}
