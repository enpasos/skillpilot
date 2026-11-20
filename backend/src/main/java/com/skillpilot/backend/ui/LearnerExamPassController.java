package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.VerifiedExamPassResponse;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.service.VerifiedExamPassService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/ui/learners/{skillpilotId}/exam-passes", produces = MediaType.APPLICATION_JSON_VALUE)
public class LearnerExamPassController {
    private final LearnerService learners;
    private final VerifiedExamPassService passes;

    public LearnerExamPassController(LearnerService learners, VerifiedExamPassService passes) {
        this.learners = learners;
        this.passes = passes;
    }

    @GetMapping("/{goalId}")
    public List<VerifiedExamPassResponse> getExamPasses(@PathVariable String skillpilotId,
            @PathVariable String goalId, HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        learners.assertActiveLearnerRouteAccess(skillpilotId);
        return passes.findForGoal(skillpilotId, goalId);
    }
}
