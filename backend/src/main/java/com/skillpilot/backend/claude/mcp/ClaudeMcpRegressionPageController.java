package com.skillpilot.backend.claude.mcp;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/** Public, static instructions for the isolated Claude MCP regression baseline. */
@RestController
public class ClaudeMcpRegressionPageController {

    static final String PAGE_PATH = "/claude/mcp-regression";
    private static final String PAGE_RESOURCE = "claude-mcp-regression-report.html";
    private static final String CONTENT_SECURITY_POLICY = String.join("; ",
            "default-src 'none'",
            "style-src 'unsafe-inline'",
            "img-src 'self'",
            "base-uri 'none'",
            "form-action 'none'",
            "frame-ancestors 'none'");

    private final byte[] pageBytes;

    public ClaudeMcpRegressionPageController() {
        pageBytes = loadPage();
    }

    @GetMapping(value = { PAGE_PATH, PAGE_PATH + "/" }, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<byte[]> page() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8))
                .contentLength(pageBytes.length)
                .header("Content-Security-Policy", CONTENT_SECURITY_POLICY)
                .header("Referrer-Policy", "no-referrer")
                .header("X-Content-Type-Options", "nosniff")
                .body(pageBytes);
    }

    private static byte[] loadPage() {
        ClassPathResource resource = new ClassPathResource(PAGE_RESOURCE);
        try (InputStream stream = resource.getInputStream()) {
            return stream.readAllBytes();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load " + PAGE_RESOURCE, exception);
        }
    }
}
