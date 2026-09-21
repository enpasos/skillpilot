package com.skillpilot.backend.content;

import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

/** Ordinary first-party Cockpit setting; provider tools only read resolved materials. */
@RestController
@RequestMapping(value = "/api/ui/learners/{learnerId}", produces = MediaType.APPLICATION_JSON_VALUE)
public class ContentSelectionController {
    private final ContentAvailability availability;
    private final ContentSelectionService selections;
    private final ContentCatalog catalog;
    private final ContentMaterialResolver materials;
    private final LearnerService learners;
    private final LearnerLifecycleService lifecycle;

    public ContentSelectionController(ContentAvailability availability,
            ContentSelectionService selections, ContentCatalog catalog, ContentMaterialResolver materials,
            LearnerService learners, LearnerLifecycleService lifecycle) {
        this.availability = availability;
        this.selections = selections;
        this.catalog = catalog;
        this.materials = materials;
        this.learners = learners;
        this.lifecycle = lifecycle;
    }

    public record SelectionResponse(long revision, Set<String> selectedPackageIds,
                                    List<ContentCatalog.PackageDescriptor> packages) {}

    @GetMapping("/content-selection")
    public SelectionResponse get(@PathVariable String learnerId,
            @RequestParam(defaultValue = "de") String lang, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        availability.requireEnabled();
        learners.assertActiveLearnerRouteAccess(learnerId);
        return describe(selections.selection(learnerId), lang);
    }

    @PutMapping(value = "/content-selection", consumes = MediaType.APPLICATION_JSON_VALUE)
    // The MVC boundary uses Boot's Jackson 3 tree, not the internal Jackson 2 mapper.
    public SelectionResponse put(@PathVariable String learnerId,
            @RequestParam(defaultValue = "de") String lang,
            @RequestBody JsonNode request, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        availability.requireEnabled();
        if (request == null || !request.isObject() || request.size() != 2
                || !request.path("expectedRevision").isIntegralNumber()
                || !request.path("expectedRevision").canConvertToLong()
                || request.path("expectedRevision").longValue() < 0
                || !request.path("selectedPackageIds").isArray()
                || request.path("selectedPackageIds").size() > 20) badRequest();
        List<String> ids = new ArrayList<>();
        for (JsonNode id : request.path("selectedPackageIds")) {
            if (!id.isString() || !id.stringValue().matches("[a-z0-9][a-z0-9-]{0,79}")) badRequest();
            ids.add(id.stringValue());
        }
        return lifecycle.withActivity(learnerId, () -> {
            learners.assertWritableLearningSession(learnerId);
            return describe(selections.update(learnerId, request.path("expectedRevision").longValue(), ids), lang);
        });
    }

    @GetMapping("/content-materials")
    public List<ContentMaterialResolver.ResolvedMaterial> materials(@PathVariable String learnerId,
            @RequestParam String goalId, @RequestParam(defaultValue = "de") String lang,
            HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        availability.requireEnabled();
        learners.assertActiveLearnerRouteAccess(learnerId);
        var learner = learners.getLearner(learnerId);
        if (learner.getSelectedCurriculum() == null) return List.of();
        boolean visible = learners.getLearnerLandscapeClosure(learnerId, learner.getSelectedCurriculum(), lang)
                .stream().flatMap(landscape -> landscape.getGoals().stream())
                .anyMatch(goal -> goalId.equals(goal.getId()));
        return visible ? materials.resolve(learnerId, goalId, lang) : List.of();
    }

    private SelectionResponse describe(ContentSelectionService.Selection selection, String lang) {
        return new SelectionResponse(selection.revision(), selection.selectedPackageIds(), catalog.packages(lang));
    }

    private static void badRequest() {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid content selection request");
    }
}
