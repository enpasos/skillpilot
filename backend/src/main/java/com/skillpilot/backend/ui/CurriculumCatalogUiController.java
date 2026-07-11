package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.CurriculumCatalogResponse;
import com.skillpilot.backend.curriculumpackage.CurriculumCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Package-only discovery endpoint; repository authoring mode keeps its existing APIs. */
@RestController
@ConditionalOnProperty(prefix = "skillpilot.curriculum", name = "source", havingValue = "package")
@RequestMapping(value = "/api/ui/curriculum-catalog", produces = MediaType.APPLICATION_JSON_VALUE)
public class CurriculumCatalogUiController {

    private final CurriculumCatalogService catalogService;

    public CurriculumCatalogUiController(CurriculumCatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    @Operation(extensions = @Extension(properties = @ExtensionProperty(
            name = "x-openai-isConsequential",
            value = "false",
            parseValue = true)))
    public CurriculumCatalogResponse getCatalog() {
        return catalogService.getCatalog();
    }
}
