package com.skillpilot.backend.ai;

import com.skillpilot.backend.api.CreateLearnerResponse;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.CreateLearnerRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.service.LearnerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping(value = "/api/ai/learners", produces = MediaType.APPLICATION_JSON_VALUE)
public class LearnerAiController {

    private final LearnerService learnerService;

    @Value("${skillpilot.public-base-url:https://skillpilot.com}")
    private String publicBaseUrl;

    public LearnerAiController(LearnerService learnerService) {
        this.learnerService = learnerService;
    }

    @PostMapping
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public CreateLearnerResponse createLearner(@RequestBody(required = false) CreateLearnerRequest request) {
        Learner learner = learnerService.createLearner(request);
        UnifiedLearnerStateResponse state = withAbsoluteExamAssetUrls(
                learnerService.getLearnerState(learner.getSkillpilotId()));

        // Optimization: If a curriculum is already selected (e.g. via topic),
        // don't return the huge list of available landscapes to save tokens.
        java.util.List<com.skillpilot.backend.landscape.LandscapeSummary> available = (learner
                .getSelectedCurriculum() != null && !learner.getSelectedCurriculum().isEmpty())
                        ? java.util.Collections.emptyList()
                        : learnerService.getAvailableBaseCurricula();

        return new CreateLearnerResponse(
                state,
                available);
    }

    @GetMapping("/{skillpilotId}/state")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse getLearnerState(@PathVariable String skillpilotId) {
        return withAbsoluteExamAssetUrls(learnerService.getLearnerState(skillpilotId));
    }

    @PostMapping("/{skillpilotId}/scope")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))

    public UnifiedLearnerStateResponse setScope(@PathVariable String skillpilotId, @RequestBody ScopeRequest request) {
        learnerService.setScope(skillpilotId, request.goalIds());
        return withAbsoluteExamAssetUrls(learnerService.getLearnerState(skillpilotId));
    }

    @PostMapping("/{skillpilotId}/active-goal")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse setActiveGoal(@PathVariable String skillpilotId,
            @Valid @RequestBody ActiveGoalRequest request) {
        UnifiedLearnerStateResponse state = learnerService.getLearnerState(skillpilotId);
        String requiredAction = state.stateMachine() != null ? state.stateMachine().requiredAction() : null;
        boolean redirect = Boolean.TRUE.equals(request.redirect());
        if (!"setActiveGoal".equals(requiredAction)) {
            if ("setMastery".equals(requiredAction) && redirect) {
                // Allow explicit user redirect while an active goal is locked.
            } else if (requiredAction != null) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "Required action is " + requiredAction + ". Follow stateMachine.requiredAction.");
            }
        }
        learnerService.setActiveGoal(skillpilotId, request.goalId());
        return withAbsoluteExamAssetUrls(learnerService.getLearnerState(skillpilotId));
    }

    @PostMapping("/{skillpilotId}/mastery")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public org.springframework.http.ResponseEntity<?> setMastery(
            @PathVariable String skillpilotId,
            @RequestBody(required = false) MasteryUpdateRequest request) {

        MasteryUpdateRequest effectiveRequest = request;

        if (effectiveRequest == null) {
            effectiveRequest = new MasteryUpdateRequest(null, null);
        } else if ((effectiveRequest.mastery() == null || effectiveRequest.mastery().isEmpty())
                && effectiveRequest.goalId() != null) {
            java.util.Map<String, Double> newMap = new java.util.HashMap<>();
            newMap.put(effectiveRequest.goalId(), 1.0);
            effectiveRequest = new MasteryUpdateRequest(newMap, effectiveRequest.goalId());
        }

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(skillpilotId);
        String requiredAction = state.stateMachine() != null ? state.stateMachine().requiredAction() : null;
        if (requiredAction != null && !"setMastery".equals(requiredAction)) {
            return org.springframework.http.ResponseEntity
                    .status(org.springframework.http.HttpStatus.CONFLICT)
                    .body(state);
        }

        try {
            MasteryUpdateResponse response = learnerService.setMastery(skillpilotId, effectiveRequest);
            return org.springframework.http.ResponseEntity.ok(withAbsoluteExamAssetUrls(response));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (org.springframework.http.HttpStatus.CONFLICT.equals(e.getStatusCode())) {
                UnifiedLearnerStateResponse conflictState = learnerService.getLearnerState(skillpilotId);
                return org.springframework.http.ResponseEntity
                        .status(org.springframework.http.HttpStatus.CONFLICT)
                        .body(withAbsoluteExamAssetUrls(conflictState));
            }
            throw e;
        }
    }

    @PostMapping("/{skillpilotId}/curriculum")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse setCurriculum(@PathVariable String skillpilotId,
            @RequestBody UpdateCurriculumRequest request) {
        learnerService.setCurriculum(skillpilotId, request.getCurriculumId());
        return withAbsoluteExamAssetUrls(learnerService.getLearnerState(skillpilotId));
    }

    @PostMapping("/{skillpilotId}/personalization")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))

    public UnifiedLearnerStateResponse setPersonalization(@PathVariable String skillpilotId,
            @RequestBody com.skillpilot.backend.api.PersonalizationRequest request) {
        learnerService.setPersonalCurriculum(skillpilotId, request.config(), request.goalIds(), request.filters());
        return withAbsoluteExamAssetUrls(learnerService.getLearnerState(skillpilotId));
    }

    private UnifiedLearnerStateResponse withAbsoluteExamAssetUrls(UnifiedLearnerStateResponse state) {
        if (state == null) {
            return null;
        }
        String baseUrl = resolveBaseUrl();
        if (baseUrl.isBlank()) {
            return state;
        }
        String assetBase = baseUrl + "/ai-assets";

        DeepLinkContext deepLinkContext = buildDeepLinkContext(state, baseUrl);
        com.skillpilot.backend.api.FrontierGoal activeGoal = rewriteExamData(state.activeGoal(), assetBase, deepLinkContext);
        List<com.skillpilot.backend.api.FrontierGoal> frontier = rewriteExamData(state.frontier(), assetBase, deepLinkContext);
        com.skillpilot.backend.api.StateMachineInfo sm = state.stateMachine();
        com.skillpilot.backend.api.StateMachineInfo smUpdated = sm == null ? null
                : new com.skillpilot.backend.api.StateMachineInfo(
                        sm.state(),
                        sm.requiredAction(),
                        rewriteExamData(sm.goalOptions(), assetBase, deepLinkContext),
                        sm.curriculumOptions(),
                        rewriteExamData(sm.activeGoal(), assetBase, deepLinkContext));

        return new UnifiedLearnerStateResponse(
                state.skillpilotId(),
                state.curriculum(),
                frontier,
                state.goals(),
                state.nextAllowedActions(),
                state.activeFilters(),
                state.copySources(),
                state.learningState(),
                activeGoal,
                smUpdated);
    }

    private MasteryUpdateResponse withAbsoluteExamAssetUrls(MasteryUpdateResponse response) {
        if (response == null) {
            return null;
        }
        String baseUrl = resolveBaseUrl();
        if (baseUrl.isBlank()) {
            return response;
        }
        String assetBase = baseUrl + "/ai-assets";
        DeepLinkContext deepLinkContext = buildDeepLinkContext(response, baseUrl);
        List<com.skillpilot.backend.api.FrontierGoal> frontier = rewriteExamData(response.frontier(), assetBase, deepLinkContext);
        com.skillpilot.backend.api.FrontierGoal activeGoal = rewriteExamData(response.activeGoal(), assetBase, deepLinkContext);
        com.skillpilot.backend.api.StateMachineInfo sm = response.stateMachine();
        com.skillpilot.backend.api.StateMachineInfo smUpdated = sm == null ? null
                : new com.skillpilot.backend.api.StateMachineInfo(
                        sm.state(),
                        sm.requiredAction(),
                        rewriteExamData(sm.goalOptions(), assetBase, deepLinkContext),
                        sm.curriculumOptions(),
                        rewriteExamData(sm.activeGoal(), assetBase, deepLinkContext));

        return new MasteryUpdateResponse(
                frontier,
                response.nextAllowedActions(),
                response.learningState(),
                activeGoal,
                smUpdated,
                response.goals());
    }

    private List<com.skillpilot.backend.api.FrontierGoal> rewriteExamData(
            List<com.skillpilot.backend.api.FrontierGoal> goals,
            String assetBase,
            DeepLinkContext deepLinkContext) {
        if (goals == null || goals.isEmpty()) {
            return goals;
        }
        return goals.stream()
                .map(goal -> rewriteExamData(goal, assetBase, deepLinkContext))
                .toList();
    }

    private com.skillpilot.backend.api.FrontierGoal rewriteExamData(
            com.skillpilot.backend.api.FrontierGoal goal,
            String assetBase,
            DeepLinkContext deepLinkContext) {
        if (goal == null || goal.examData() == null) {
            return goal;
        }
        com.skillpilot.backend.landscape.ExamData exam = goal.examData();
        com.skillpilot.backend.landscape.ExamData updated = new com.skillpilot.backend.landscape.ExamData();
        updated.setTaskContent(normalizeTaskContentForAi(goal.id(), goal.title(),
                rewriteAssetLinks(exam.getTaskContent(), assetBase)));
        updated.setTaskContentEn(normalizeTaskContentForAi(goal.id(), goal.title(),
                rewriteAssetLinks(exam.getTaskContentEn(), assetBase)));
        if (deepLinkContext != null && deepLinkContext.isComplete()) {
            updated.setTaskContent(
                    injectDeepLink(updated.getTaskContent(), buildDeepLink(deepLinkContext, goal.id())));
            updated.setTaskContentEn(
                    injectDeepLink(updated.getTaskContentEn(), buildDeepLink(deepLinkContext, goal.id())));
        }
        updated.setSolutionContent(rewriteAssetLinks(exam.getSolutionContent(), assetBase));
        updated.setSolutionContentEn(rewriteAssetLinks(exam.getSolutionContentEn(), assetBase));
        updated.setScoring(exam.getScoring());

        return new com.skillpilot.backend.api.FrontierGoal(
                goal.id(),
                goal.title(),
                goal.description(),
                goal.type(),
                goal.reason(),
                goal.tags(),
                updated);
    }

    private String rewriteAssetLinks(String content, String assetBase) {
        if (content == null || content.isBlank()) {
            return content;
        }
        Pattern pattern = Pattern.compile("\\((/assets/[^)]+)\\)");
        Matcher matcher = pattern.matcher(content);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String path = matcher.group(1);
            String normalized = path.startsWith("/assets/") ? path.substring("/assets".length()) : path;
            matcher.appendReplacement(sb, "(" + assetBase + normalized + ")");
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String normalizeTaskContentForAi(String goalId, String title, String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        Pattern imagePattern = Pattern.compile("!\\[[^\\]]*\\]\\(([^)]+)\\)");
        Matcher matcher = imagePattern.matcher(content);
        String firstUrl = null;
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            if (firstUrl == null) {
                firstUrl = matcher.group(1);
            }
            matcher.appendReplacement(sb, "");
        }
        matcher.appendTail(sb);
        String stripped = sb.toString().replaceAll("(?m)^\\s*$\\n?", "").trim();
        if (firstUrl == null || firstUrl.isBlank()) {
            return content;
        }
        String normalized = "![Direktes Bild](" + firstUrl + ")\n\n" + stripped;
        if ("bc60e300-96be-599a-89b6-8fcca380803d".equals(goalId)) {
            String inlineFixed = convertInlineMathToParens(stripped);
            normalized = buildExamPackagedContent(firstUrl, inlineFixed);
        }
        return normalized;
    }

    private String buildExamPackagedContent(String imageUrl, String body) {
        String safeBody = body == null ? "" : body.trim();
        return "![Direktes Bild](" + imageUrl + ")\n\n"
                + "**Prüfungsmodus – Mathematik LK (Analysis)**\n\n"
                + "Hinweis: Du bearbeitest jetzt eine prüfungsnahe Abituraufgabe.\n\n"
                + "Arbeite selbstständig, strukturiert und rechne sauber.\n"
                + "Ich gebe keine Hinweise während der Bearbeitung.\n\n"
                + "Originalaufgabe im Cockpit:\n"
                + "{{DEEPLINK}}\n\n"
                + "---\n\n"
                + safeBody + "\n\n"
                + "---\n\n"
                + "Bitte reiche deine vollständige Lösung in einer Nachricht ein (Text reicht, Skizze gern beschrieben).\n"
                + "Wenn du abbrechen möchtest, sag einfach Bescheid.";
    }

    private String convertInlineMathToParens(String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        Pattern pattern = Pattern.compile("(?<!\\$)\\$(?!\\$)(.+?)(?<!\\$)\\$(?!\\$)");
        Matcher matcher = pattern.matcher(content);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String inner = matcher.group(1).trim();
            String replacement = "\\\\(" + inner + "\\\\)";
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String injectDeepLink(String content, String deepLink) {
        if (content == null || content.isBlank() || deepLink == null || deepLink.isBlank()) {
            if (content == null) {
                return null;
            }
            return content.replace("Originalaufgabe im Cockpit:\n{{DEEPLINK}}\n\n", "");
        }
        if (content.contains("{{DEEPLINK}}")) {
            return content.replace("{{DEEPLINK}}", deepLink);
        }
        String marker = "![Direktes Bild](";
        int imageIndex = content.indexOf(marker);
        if (imageIndex >= 0) {
            int lineEnd = content.indexOf('\n', imageIndex);
            if (lineEnd > 0) {
                String imageLine = content.substring(imageIndex, lineEnd).trim();
                String rest = content.substring(lineEnd).trim();
                return imageLine + "\n\nOriginalaufgabe im Cockpit: " + deepLink + "\n\n" + rest;
            }
        }
        return "Originalaufgabe im Cockpit: " + deepLink + "\n\n" + content.trim();
    }

    private DeepLinkContext buildDeepLinkContext(UnifiedLearnerStateResponse state, String baseUrl) {
        if (state == null || baseUrl == null || baseUrl.isBlank()) {
            return null;
        }
        String curriculumId = state.curriculum() == null ? null : state.curriculum().getCurriculumId();
        return new DeepLinkContext(baseUrl, state.skillpilotId(), curriculumId);
    }

    private DeepLinkContext buildDeepLinkContext(MasteryUpdateResponse response, String baseUrl) {
        if (response == null || baseUrl == null || baseUrl.isBlank()) {
            return null;
        }
        return null;
    }

    private String buildDeepLink(DeepLinkContext ctx, String goalId) {
        if (ctx == null || !ctx.isComplete() || goalId == null || goalId.isBlank()) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        sb.append(ctx.baseUrl());
        if (!ctx.baseUrl().endsWith("/")) {
            sb.append('/');
        }
        sb.append("?skillpilotId=").append(urlEncode(ctx.skillpilotId()));
        if (ctx.curriculumId() != null && !ctx.curriculumId().isBlank()) {
            sb.append("&l=").append(urlEncode(ctx.curriculumId()));
        }
        sb.append("&goal=").append(urlEncode(goalId));
        return sb.toString();
    }

    private String urlEncode(String value) {
        try {
            return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            return value;
        }
    }

    private String resolveBaseUrl() {
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        baseUrl = baseUrl == null ? "" : baseUrl.replaceAll("/+$", "");
        if (baseUrl.isBlank()) {
            baseUrl = publicBaseUrl == null ? "" : publicBaseUrl.trim().replaceAll("/+$", "");
        }
        return baseUrl;
    }

    private record DeepLinkContext(String baseUrl, String skillpilotId, String curriculumId) {
        boolean isComplete() {
            return baseUrl != null && !baseUrl.isBlank() && skillpilotId != null && !skillpilotId.isBlank();
        }
    }

}
