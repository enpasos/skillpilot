package com.skillpilot.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = { "/privacy", "/privacy/" })
    public String privacy() {
        return "forward:/privacy/index.html";
    }

    @RequestMapping(value = { "/imprint", "/imprint/" })
    public String imprint() {
        return "forward:/imprint/index.html";
    }

    // Fallback für SPA-Routing, aber statische Seiten wie /privacy, /imprint,
    // /index.html sowie API-Routen ausnehmen
    @RequestMapping(value = "/{path:^(?!api|v3|swagger-ui|privacy|imprint|index\\.html|assets).*$}")
    public String redirect() {
        return "forward:/index.html";
    }
}
