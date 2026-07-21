package com.skillpilot.backend.ai.visiblesession;

import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Compact, provider-specific adapter for the visible-session Custom GPT.
 * Domain decisions remain in {@link CoachToolFacade}; this class only renders a
 * small relay-safe projection and resolves short-lived numbered selections.
 */
@Service
public class VisibleSessionService {

    public record ActionOutcome(HttpStatus status, VisibleCoachStateResponse response) {
    }

    private record OptionTarget(String identity, String value) {
    }

    private record SelectionPlan(
            String requiredAction,
            String selectionReference,
            List<OptionTarget> targets,
            VisibleCoachStateResponse.Selection display) {
    }

    private final CoachToolFacade coachToolFacade;
    private final String publicBaseUrl;

    public VisibleSessionService(
            CoachToolFacade coachToolFacade,
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl) {
        this.coachToolFacade = coachToolFacade;
        this.publicBaseUrl = normalizeBaseUrl(publicBaseUrl);
    }

    public VisibleCoachStateResponse getState(String chatSessionToken, String language) {
        return render(chatSessionToken, language, coachToolFacade.getSessionState(chatSessionToken), null);
    }

    public ActionOutcome choose(
            String chatSessionToken,
            String language,
            VisibleChoiceRequest request) {
        UnifiedLearnerStateResponse current = coachToolFacade.getSessionState(chatSessionToken);
        SelectionPlan plan = buildSelectionPlan(chatSessionToken, language, current);

        if (request == null || request.selectionReference() == null || request.selectionReference().isBlank()) {
            return outcome(
                    HttpStatus.BAD_REQUEST,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Die Auswahlreferenz fehlt. Zeige die aktuelle Auswahl erneut.",
                            "The selection reference is missing. Show the current choices again."));
        }
        if (plan == null) {
            return outcome(
                    HttpStatus.CONFLICT,
                    chatSessionToken,
                    language,
                    current,
                    noSelectionInstruction(language, requiredAction(current)));
        }
        if (!plan.selectionReference().equals(request.selectionReference())) {
            return outcome(
                    HttpStatus.CONFLICT,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Diese Auswahl ist nicht mehr aktuell. Zeige die aktuelle Auswahl erneut und frage noch einmal.",
                            "This selection is no longer current. Show the current choices and ask again."));
        }
        if (request.choiceNumber() < 1 || request.choiceNumber() > plan.targets().size()) {
            return outcome(
                    HttpStatus.BAD_REQUEST,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Diese Auswahlnummer existiert nicht. Zeige die aktuelle Auswahl erneut.",
                            "That choice number does not exist. Show the current choices again."));
        }

        OptionTarget target = plan.targets().get(request.choiceNumber() - 1);
        try {
            switch (plan.requiredAction()) {
                case "setCurriculum" -> {
                    UpdateCurriculumRequest curriculumRequest = new UpdateCurriculumRequest();
                    curriculumRequest.setCurriculumId(target.value());
                    coachToolFacade.setSessionCurriculum(chatSessionToken, curriculumRequest);
                }
                case "setScope" -> coachToolFacade.setSessionScope(
                        chatSessionToken,
                        new ScopeRequest(List.of(target.value())));
                case "setActiveGoal" -> coachToolFacade.setSessionActiveGoal(
                        chatSessionToken,
                        new ActiveGoalRequest(target.value(), false));
                default -> {
                    return outcome(
                            HttpStatus.CONFLICT,
                            chatSessionToken,
                            language,
                            current,
                            unsupportedInstruction(language, plan.requiredAction()));
                }
            }
        } catch (ResponseStatusException exception) {
            if (HttpStatus.CONFLICT.equals(exception.getStatusCode())) {
                UnifiedLearnerStateResponse changed = coachToolFacade.getSessionState(chatSessionToken);
                return outcome(
                        HttpStatus.CONFLICT,
                        chatSessionToken,
                        language,
                        changed,
                        localized(language,
                                "Der Lernzustand hat sich geändert. Zeige die aktuelle Auswahl erneut.",
                                "The learning state changed. Show the current choices again."));
            }
            throw exception;
        }

        UnifiedLearnerStateResponse updated = coachToolFacade.getSessionState(chatSessionToken);
        return outcome(
                HttpStatus.OK,
                chatSessionToken,
                language,
                updated,
                localized(language,
                        "Die Auswahl wurde übernommen. Folge jetzt der aktuellen erforderlichen Aktion.",
                        "The choice was applied. Now follow the current required action."));
    }

    public ActionOutcome setActiveGoal(
            String chatSessionToken,
            String language,
            VisibleActiveGoalRequest request) {
        try {
            coachToolFacade.setSessionActiveGoal(
                    chatSessionToken,
                    new ActiveGoalRequest(request.goalId(), request.redirect()));
        } catch (ResponseStatusException exception) {
            if (HttpStatus.CONFLICT.equals(exception.getStatusCode())) {
                UnifiedLearnerStateResponse current = coachToolFacade.getSessionState(chatSessionToken);
                return outcome(
                        HttpStatus.CONFLICT,
                        chatSessionToken,
                        language,
                        current,
                        localized(language,
                                "Das Lernziel kann im aktuellen Zustand nicht aktiviert werden. Folge dem jetzt angezeigten erforderlichen Schritt.",
                                "The learning goal cannot be activated in the current state. Follow the required step now shown."));
            }
            throw exception;
        }
        UnifiedLearnerStateResponse updated = coachToolFacade.getSessionState(chatSessionToken);
        return outcome(
                HttpStatus.OK,
                chatSessionToken,
                language,
                updated,
                localized(language,
                        "Das Lernziel wurde aktiviert. Arbeite nur an diesem Lernziel.",
                        "The learning goal is active. Work only on this learning goal."));
    }

    public ActionOutcome setMastery(
            String chatSessionToken,
            String language,
            VisibleMasteryRequest request) {
        UnifiedLearnerStateResponse current = coachToolFacade.getSessionState(chatSessionToken);
        if (!isValidMasteryRequest(request)) {
            return outcome(
                    HttpStatus.BAD_REQUEST,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Lernziel-ID und Mastery-Wert von 0 bis 1 sind erforderlich.",
                            "A learning-goal ID and a mastery value from 0 to 1 are required."));
        }

        FrontierGoal activeGoal = activeGoal(current);
        if (activeGoal == null || !request.goalId().equals(activeGoal.id())) {
            return outcome(
                    HttpStatus.CONFLICT,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Die angegebene Lernziel-ID ist nicht mehr das aktive Lernziel. Lade den aktuellen Zustand neu.",
                            "The cited learning-goal ID is no longer active. Reload the current state."));
        }

        CoachToolFacade.MasteryResult result = coachToolFacade.setSessionMastery(
                chatSessionToken,
                new MasteryUpdateRequest(Map.of(request.goalId(), request.mastery()), request.goalId()));
        UnifiedLearnerStateResponse updated = coachToolFacade.getSessionState(chatSessionToken);
        return switch (result.status()) {
            case UPDATED -> outcome(
                    HttpStatus.OK,
                    chatSessionToken,
                    language,
                    updated,
                    localized(language,
                            "Mastery wurde für die angegebene Lernziel-ID gespeichert.",
                            "Mastery was saved for the cited learning-goal ID."));
            case BAD_REQUEST -> outcome(
                    HttpStatus.BAD_REQUEST,
                    chatSessionToken,
                    language,
                    updated,
                    result.error());
            case CONFLICT -> outcome(
                    HttpStatus.CONFLICT,
                    chatSessionToken,
                    language,
                    updated,
                    localized(language,
                            "Der Lernzustand hat sich geändert. Folge dem jetzt angezeigten erforderlichen Schritt.",
                            "The learning state changed. Follow the required step now shown."));
        };
    }

    private ActionOutcome outcome(
            HttpStatus status,
            String chatSessionToken,
            String language,
            UnifiedLearnerStateResponse state,
            String instruction) {
        return new ActionOutcome(status, render(chatSessionToken, language, state, instruction));
    }

    private VisibleCoachStateResponse render(
            String chatSessionToken,
            String language,
            UnifiedLearnerStateResponse state,
            String instructionOverride) {
        FrontierGoal currentGoal = activeGoal(state);
        String action = requiredAction(state);
        SelectionPlan selectionPlan = buildSelectionPlan(chatSessionToken, language, state);
        return new VisibleCoachStateResponse(
                relayFooter(chatSessionToken, currentGoal, language),
                state == null || state.learningState() == null ? "" : state.learningState(),
                action == null ? "" : action,
                curriculum(state),
                visibleActiveGoal(state, currentGoal),
                selectionPlan == null ? null : selectionPlan.display(),
                visibleAllowedActions(action, selectionPlan),
                instructionOverride == null ? instructionForState(language, action) : instructionOverride);
    }

    /**
     * Translate the generic learner-state workflow into this package's exact
     * OpenAPI operation IDs. Legacy action names must never leak into the
     * Visible Session contract as if they were callable operations.
     */
    private List<String> visibleAllowedActions(String requiredAction, SelectionPlan selectionPlan) {
        List<String> actions = new ArrayList<>();
        actions.add("getVisibleState");
        if (selectionPlan != null) {
            actions.add("applyVisibleChoice");
        }
        if ("setActiveGoal".equals(requiredAction)
                || "teachActiveGoal".equals(requiredAction)
                || "setMastery".equals(requiredAction)) {
            actions.add("setVisibleActiveGoal");
        }
        if ("teachActiveGoal".equals(requiredAction) || "setMastery".equals(requiredAction)) {
            actions.add("setVisibleMastery");
        }
        return List.copyOf(actions);
    }

    private SelectionPlan buildSelectionPlan(
            String chatSessionToken,
            String language,
            UnifiedLearnerStateResponse state) {
        StateMachineInfo stateMachine = state == null ? null : state.stateMachine();
        if (stateMachine == null || stateMachine.requiredAction() == null) {
            return null;
        }
        String action = stateMachine.requiredAction();
        List<OptionTarget> targets = new ArrayList<>();
        List<VisibleCoachStateResponse.SelectionOption> displayOptions = new ArrayList<>();

        if ("setCurriculum".equals(action)) {
            List<LandscapeSummary> options = stateMachine.curriculumOptions();
            if (options == null) {
                return null;
            }
            for (LandscapeSummary option : options) {
                if (option == null || option.getCurriculumId() == null) {
                    continue;
                }
                targets.add(new OptionTarget("curriculum:" + option.getCurriculumId(), option.getCurriculumId()));
                displayOptions.add(new VisibleCoachStateResponse.SelectionOption(
                        displayOptions.size() + 1,
                        option.getTitle(),
                        compactText(option.getDescription()),
                        null));
            }
        } else if ("setScope".equals(action) || "setActiveGoal".equals(action)) {
            List<FrontierGoal> options = stateMachine.goalOptions();
            if (options == null) {
                return null;
            }
            for (FrontierGoal option : options) {
                if (option == null || option.id() == null) {
                    continue;
                }
                targets.add(new OptionTarget("goal:" + option.id(), option.id()));
                displayOptions.add(new VisibleCoachStateResponse.SelectionOption(
                        displayOptions.size() + 1,
                        option.title(),
                        compactText(option.description()),
                        "setActiveGoal".equals(action) ? option.id() : null));
            }
        } else {
            return null;
        }

        if (targets.isEmpty()) {
            return null;
        }
        String reference = selectionReference(chatSessionToken, action, targets);
        return new SelectionPlan(
                action,
                reference,
                List.copyOf(targets),
                new VisibleCoachStateResponse.Selection(
                        reference,
                        selectionQuestion(language, action),
                        List.copyOf(displayOptions)));
    }

    private String selectionReference(String chatSessionToken, String action, List<OptionTarget> targets) {
        StringBuilder input = new StringBuilder(chatSessionToken == null ? "" : chatSessionToken)
                .append('\n')
                .append(action == null ? "" : action);
        for (OptionTarget target : targets) {
            input.append('\n').append(target.identity());
        }
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(input.toString().getBytes(StandardCharsets.UTF_8));
            return "A-" + HexFormat.of().withUpperCase().formatHex(digest, 0, 6);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available.", exception);
        }
    }

    private VisibleCoachStateResponse.CurriculumSummary curriculum(UnifiedLearnerStateResponse state) {
        LandscapeSummary curriculum = state == null ? null : state.curriculum();
        if (curriculum == null) {
            return null;
        }
        return new VisibleCoachStateResponse.CurriculumSummary(
                curriculum.getTitle(),
                curriculum.getSubject());
    }

    private VisibleCoachStateResponse.ActiveGoal visibleActiveGoal(
            UnifiedLearnerStateResponse state,
            FrontierGoal goal) {
        if (goal == null) {
            return null;
        }
        String curriculumId = state == null || state.curriculum() == null
                ? null
                : state.curriculum().getCurriculumId();
        return new VisibleCoachStateResponse.ActiveGoal(
                goal.id(),
                goal.title(),
                goal.description(),
                goal.nodeKind(),
                cockpitUrl(curriculumId, goal.id()),
                goal.examData());
    }

    private FrontierGoal activeGoal(UnifiedLearnerStateResponse state) {
        if (state == null) {
            return null;
        }
        if (state.stateMachine() != null && state.stateMachine().activeGoal() != null) {
            return state.stateMachine().activeGoal();
        }
        return state.activeGoal();
    }

    private String requiredAction(UnifiedLearnerStateResponse state) {
        return state == null || state.stateMachine() == null
                ? null
                : state.stateMachine().requiredAction();
    }

    private String relayFooter(String chatSessionToken, FrontierGoal goal, String language) {
        boolean english = language != null && language.trim().toLowerCase().startsWith("en");
        StringBuilder footer = new StringBuilder(english
                ? "— SkillPilot · Session: "
                : "— SkillPilot · Sitzung: ")
                .append(chatSessionToken);
        if (goal != null && goal.id() != null && !goal.id().isBlank()) {
            footer.append(english ? " · Learning goal ID: " : " · Lernziel-ID: ").append(goal.id());
        }
        return footer.toString();
    }

    private String cockpitUrl(String curriculumId, String goalId) {
        if (goalId == null || goalId.isBlank()) {
            return null;
        }
        StringBuilder url = new StringBuilder(publicBaseUrl).append("/?");
        if (curriculumId != null && !curriculumId.isBlank()) {
            url.append("l=").append(queryValue(curriculumId)).append('&');
        }
        return url.append("goal=").append(queryValue(goalId)).toString();
    }

    private String instructionForState(String language, String requiredAction) {
        if (requiredAction == null || requiredAction.isBlank()) {
            return localized(language,
                    "Es ist keine weitere Backend-Aktion erforderlich.",
                    "No further backend action is required.");
        }
        return switch (requiredAction) {
            case "setCurriculum", "setScope", "setActiveGoal" -> localized(language,
                    "Wenn mehrere Optionen angezeigt werden, frage die lernende Person und verwende danach nur Auswahlreferenz und Nummer.",
                    "If several choices are shown, ask the learner and then use only the selection reference and number.");
            case "teachActiveGoal", "setMastery" -> localized(language,
                    "Arbeite dialogisch am aktiven Lernziel. Speichere Mastery erst nach ausreichender Evidenz.",
                    "Coach the active learning goal dialogically. Save mastery only after sufficient evidence.");
            case "chooseMemoryMode", "setPersonalization" -> unsupportedInstruction(language, requiredAction);
            default -> localized(language,
                    "Folge ausschließlich der angezeigten erforderlichen Aktion.",
                    "Follow only the required action shown.");
        };
    }

    private String unsupportedInstruction(String language, String requiredAction) {
        return localized(language,
                "Der erforderliche Schritt " + safeAction(requiredAction)
                        + " wird im Visible-Session-Pilot noch nicht im Chat unterstützt. Bitte im SkillPilot-Cockpit fortfahren.",
                "The required step " + safeAction(requiredAction)
                        + " is not yet supported in the Visible Session pilot. Continue in the SkillPilot cockpit.");
    }

    private String noSelectionInstruction(String language, String requiredAction) {
        if ("chooseMemoryMode".equals(requiredAction) || "setPersonalization".equals(requiredAction)) {
            return unsupportedInstruction(language, requiredAction);
        }
        return localized(language,
                "Im aktuellen Zustand ist keine nummerierte Auswahl offen. Folge der angezeigten erforderlichen Aktion.",
                "There is no numbered choice open in the current state. Follow the required action shown.");
    }

    private String selectionQuestion(String language, String action) {
        return switch (action) {
            case "setCurriculum" -> localized(language, "Welchen Lehrplan möchtest du verwenden?", "Which curriculum do you want to use?");
            case "setScope" -> localized(language, "Welchen Bereich möchtest du auswählen?", "Which area do you want to select?");
            default -> localized(language, "Welches Lernziel möchtest du bearbeiten?", "Which learning goal do you want to work on?");
        };
    }

    private boolean isValidMasteryRequest(VisibleMasteryRequest request) {
        if (request == null || request.goalId() == null || request.goalId().isBlank() || request.mastery() == null) {
            return false;
        }
        double value = request.mastery();
        return !Double.isNaN(value) && !Double.isInfinite(value) && value >= 0.0 && value <= 1.0;
    }

    private String compactText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= 500 ? trimmed : trimmed.substring(0, 500);
    }

    private String localized(String language, String german, String english) {
        return language != null && language.trim().toLowerCase().startsWith("en") ? english : german;
    }

    private String safeAction(String action) {
        return action == null || action.isBlank() ? "<unbekannt>" : action;
    }

    private String queryValue(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String normalizeBaseUrl(String value) {
        String base = value == null || value.isBlank() ? "https://skillpilot.com" : value.trim();
        return base.replaceAll("/+$", "");
    }
}
