package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningLandscape;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;

import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping(value = "/api/ui/landscapes", produces = MediaType.APPLICATION_JSON_VALUE)
@CrossOrigin(origins = "${cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174}")
public class LandscapeUiController {

    private final LandscapeService landscapeService;

    public LandscapeUiController(LandscapeService landscapeService) {
        this.landscapeService = landscapeService;
    }

    @GetMapping
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public LandscapeOverviewResponse listLandscapes(
            @RequestParam(defaultValue = "de") String lang,
            @RequestParam(defaultValue = "true") boolean includeCompatibility) {
        return landscapeService.getOverview(lang, includeCompatibility);
    }

    @GetMapping("/{landscapeId}")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public LearningLandscape getLandscape(@PathVariable String landscapeId) {
        assertCompatibilityLandscapeRouteActive(landscapeId);
        return landscapeService.getById(landscapeId);
    }

    @GetMapping("/{landscapeId}/closure")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public List<LearningLandscape> getLandscapeClosure(@PathVariable String landscapeId,
            @RequestParam(defaultValue = "de") String lang) {
        assertCompatibilityLandscapeRouteActive(landscapeId);
        return landscapeService.getClosure(landscapeId, lang);
    }

    private void assertCompatibilityLandscapeRouteActive(String landscapeId) {
        if (!landscapeService.isCompatibilityOnlyLandscape(landscapeId)) {
            return;
        }
        throw new ResponseStatusException(
                CONFLICT,
                "This compatibility-only landscape route is retired. Use /api/ui/landscapes?includeCompatibility=true for frozen summaries, /api/ui/curricula/{curriculumId}/topics for frozen topic metadata, or the learner compatibility archive for retired learner sessions.");
    }

}
