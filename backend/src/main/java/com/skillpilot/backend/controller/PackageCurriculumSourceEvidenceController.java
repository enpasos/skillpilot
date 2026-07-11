package com.skillpilot.backend.controller;

import com.skillpilot.backend.api.CurriculumSourceEvidenceResponse;
import com.skillpilot.backend.curriculumpackage.PackageSourceEvidenceState;
import java.util.concurrent.TimeUnit;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Serves one lazy, path-free source-evidence route from the exact active package generation. */
@RestController
@ConditionalOnProperty(prefix = "skillpilot.curriculum", name = "source", havingValue = "package")
public class PackageCurriculumSourceEvidenceController {

    private static final CacheControl VERSIONED_CACHE = CacheControl
            .maxAge(365, TimeUnit.DAYS)
            .cachePublic()
            .immutable();

    private final PackageSourceEvidenceState sourceEvidenceState;

    public PackageCurriculumSourceEvidenceController(PackageSourceEvidenceState sourceEvidenceState) {
        this.sourceEvidenceState = sourceEvidenceState;
    }

    @GetMapping(
            value = "/api/ui/curriculum-source-evidence/packages/"
                    + "{packageId}/{packageVersion}/goals/{goalId}",
            produces = "application/json")
    public ResponseEntity<CurriculumSourceEvidenceResponse> getGoalEvidence(
            @PathVariable String packageId,
            @PathVariable String packageVersion,
            @PathVariable String goalId,
            @RequestParam(required = false) String generation,
            @RequestParam(required = false) String jurisdiction) {
        PackageSourceEvidenceState.LookupResult result = sourceEvidenceState.lookup(
                packageId, packageVersion, goalId, generation, jurisdiction);
        return switch (result.status()) {
            case FOUND -> ResponseEntity.ok()
                    .cacheControl(VERSIONED_CACHE)
                    .eTag('"' + result.etag() + '"')
                    .body(result.evidence());
            case NO_CONTENT -> ResponseEntity.noContent()
                    .cacheControl(VERSIONED_CACHE)
                    .eTag('"' + sourceEvidenceState.generationSha256() + '"')
                    .build();
            case NOT_FOUND -> ResponseEntity.notFound().build();
            case INVALID -> ResponseEntity.badRequest().build();
        };
    }
}
