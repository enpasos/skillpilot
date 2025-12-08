package com.skillpilot.backend.ai;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.landscape.LandscapeService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;

@RestController
@RequestMapping(value = "/api/ai/landscapes", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:5173}")
public class LandscapeAiController {

    private final LandscapeService landscapeService;

    public LandscapeAiController(LandscapeService landscapeService) {
        this.landscapeService = landscapeService;
    }

    @GetMapping
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public LandscapeOverviewResponse listLandscapes() {
        return landscapeService.getOverview();
    }
}
