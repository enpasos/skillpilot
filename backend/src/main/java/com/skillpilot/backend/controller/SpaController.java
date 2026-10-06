package com.skillpilot.backend.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    private final ResourceLoader resources;

    public SpaController(ResourceLoader resources) {
        this.resources = resources;
    }

    // The catalog's /plugins/** SPA route otherwise takes precedence over
    // Spring's static-resource handler and returns index.html for a real ZIP.
    @GetMapping("/plugins/gemini/{filename:.+\\.zip}")
    public ResponseEntity<Resource> geminiSkillDownload(@PathVariable String filename) {
        if (filename.length() > 128
                || !filename.matches("[A-Za-z0-9][A-Za-z0-9._-]*\\.zip")
                || filename.contains("..")) {
            return ResponseEntity.notFound().build();
        }
        Resource archive = resources.getResource("classpath:/static/plugins/gemini/" + filename);
        if (!archive.exists() || !archive.isReadable()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .cacheControl(CacheControl.noCache())
                .body(archive);
    }

    // Generic SPA forwarding for all non-API, non-asset paths.
    // This allows deep linking (e.g. /whitepaper/de, /learner/..., etc.) without
    // explicit registration.
    // We exclude paths starting with /api, /v3, /swagger-ui, /oauth2, /login,
    // /assets, and paths
    // that likely point to files (contain a dot).
    // Note: If you have deep routes with dots (e.g. /docs/v1.0/intro), you might
    // need to adjust the regex.
    //
    // IMPORTANT: Do NOT match /oauth2/** or /login/** - those must be handled by
    // Spring Security.
    // We use specific path patterns instead of a catch-all to avoid intercepting
    // security paths.
    @RequestMapping(value = {
            "/curricula/**",
            "/lernzielbuch",
            "/lernziel-feedback",
            "/learner/**",
            "/whitepaper",
            "/whitepaper/{path:[^\\.]*}",
            "/quickstart",
            "/quickstart/**",
            "/start",
            "/start/**",
            "/mobi",
            "/mobi/**",
            "/faq",
            "/faq/**",
            "/plugins",
            "/plugins/**",
            "/legal",
            "/legal/**",
            "/privacy",
            "/privacy/**",
            "/imprint",
            "/imprint/**",
            "/stats",
            "/stats/**",
            "/users",
            "/users/**",
            "/successes",
            "/successes/**",
            "/directory/**",
            "/statistics/**",
            "/halloffame/**",
            "/curricula",
            "/learner",
            "/directory",
            "/statistics",
            "/halloffame",
            "/trainer",
            "/trainer/**",
            "/explorer",
            "/explorer/**"
    })
    public String redirect() {
        return "forward:/index.html";
    }

    // Catch-all for the root path and any other SPA routes not explicitly listed
    // above
    // that don't start with protected prefixes
    @RequestMapping(value = "/")
    public String redirectRoot() {
        return "forward:/index.html";
    }
}
