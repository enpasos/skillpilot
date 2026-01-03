package com.skillpilot.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Generic SPA forwarding for all non-API, non-asset paths.
    // This allows deep linking (e.g. /whitepaper/de, /learner/..., etc.) without
    // explicit registration.
    // We exclude paths starting with /api, /v3, /swagger-ui, /assets, and paths
    // that likely point to files (contain a dot).
    // Note: If you have deep routes with dots (e.g. /docs/v1.0/intro), you might
    // need to adjust the regex.
    @RequestMapping(value = "/**/{path:[^\\.]*}")
    public String redirect() {
        return "forward:/index.html";
    }
}
