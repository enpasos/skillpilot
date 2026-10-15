package com.skillpilot.backend.api;

import java.util.List;
import com.skillpilot.backend.service.CompositionSupplementService.AuthorizationAccounting;

/** First-party only. Opaque option includes an exact, previewed target change. */
public record CompositionSupplementOptions(List<Option> options, String problemCode) {
    public record Target(String goalId, String title, String titleEn) {}
    public record Option(String optionId, String label, String labelEn, String action,
            String mathCourseProfile, List<Target> targets, int additionalAtomicTargets,
            AuthorizationAccounting authorizationAccounting) {}
}
