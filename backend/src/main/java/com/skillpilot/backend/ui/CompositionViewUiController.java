package com.skillpilot.backend.ui;

import com.skillpilot.backend.service.CompositionViewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/ui/composition-views", produces = MediaType.APPLICATION_JSON_VALUE)
public class CompositionViewUiController {

    private final CompositionViewService compositionViewService;

    public CompositionViewUiController(CompositionViewService compositionViewService) {
        this.compositionViewService = compositionViewService;
    }

    @GetMapping("/match")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public ResponseEntity<Map<String, Object>> matchCompositionView(
            @RequestParam String landscapeId,
            @RequestParam Map<String, String> params) {
        Map<String, String> requestedScope = new LinkedHashMap<>(params);
        requestedScope.remove("landscapeId");

        Map<String, Object> matchedView = compositionViewService.findMatchingView(landscapeId, requestedScope);
        if (matchedView == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(matchedView);
    }
}
