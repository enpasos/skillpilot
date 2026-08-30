package com.skillpilot.backend.goalfeedback;

import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.LinkBinding;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.ResolvedContext;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.SubmissionReceipt;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.http.CacheControl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/public/goal-feedback/v1")
@ConditionalOnExpression("${skillpilot.goal-feedback.enabled:${SKILLPILOT_GOAL_FEEDBACK_ENABLED:false}}")
public class GoalFeedbackPublicController {

    private static final Set<String> LINK_FIELDS = Set.of(
            "bookId", "edition", "goalId", "goalFingerprint", "pageFingerprint", "bookDigest", "page");
    private static final Pattern SAFE_ID = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._:+-]{0,199}");
    private static final Pattern SHA256 = Pattern.compile("sha256:[0-9a-f]{64}");
    private static final Pattern PAGE = Pattern.compile("[1-9][0-9]{0,3}");

    private final GoalFeedbackPublicationRegistry publications;
    private final GoalFeedbackSubmissionService submissions;

    public GoalFeedbackPublicController(
            GoalFeedbackPublicationRegistry publications,
            GoalFeedbackSubmissionService submissions) {
        this.publications = publications;
        this.submissions = submissions;
    }

    @GetMapping(path = "/context", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ResolvedContext> context(@RequestParam MultiValueMap<String, String> parameters) {
        if (!parameters.keySet().equals(LINK_FIELDS)
                || LINK_FIELDS.stream().anyMatch(key -> parameters.get(key) == null || parameters.get(key).size() != 1)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exactly seven context parameters are required");
        }
        String bookId = one(parameters, "bookId");
        String edition = one(parameters, "edition");
        String goalId = one(parameters, "goalId");
        String goalFingerprint = one(parameters, "goalFingerprint");
        String pageFingerprint = one(parameters, "pageFingerprint");
        String bookDigest = one(parameters, "bookDigest");
        String page = one(parameters, "page");
        if (!SAFE_ID.matcher(bookId).matches()
                || !SAFE_ID.matcher(edition).matches()
                || !SAFE_ID.matcher(goalId).matches()
                || !SHA256.matcher(goalFingerprint).matches()
                || !SHA256.matcher(pageFingerprint).matches()
                || !SHA256.matcher(bookDigest).matches()
                || !PAGE.matcher(page).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid context parameter");
        }
        ResolvedContext resolved = publications.resolve(new LinkBinding(
                        bookId,
                        edition,
                        goalId,
                        goalFingerprint,
                        pageFingerprint,
                        bookDigest,
                        Integer.parseInt(page)))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Published goal context not found"));
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(resolved);
    }

    @PostMapping(
            path = "/submissions",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SubmissionReceipt> submit(@RequestBody byte[] body) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .cacheControl(CacheControl.noStore())
                .body(submissions.submit(body));
    }

    private static String one(MultiValueMap<String, String> parameters, String key) {
        return parameters.get(key).getFirst();
    }
}
