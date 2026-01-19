package com.skillpilot.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

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
            "/learner/**",
            "/whitepaper",
            "/whitepaper/{path:[^\\.]*}",
            "/directory/**",
            "/statistics/**",
            "/halloffame/**",
            "/curricula",
            "/learner",
            "/whitepaper",
            "/directory",
            "/statistics",
            "/halloffame"
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
