package com.skillpilot.backend.ai.visiblesession;

import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearningModeOption;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

    private record OptionTarget(
            String identity,
            String value,
            List<String> goalIds,
            List<String> filters,
            String modeAction) {

        private static OptionTarget value(String identity, String value) {
            return new OptionTarget(identity, value, List.of(), List.of(), null);
        }

        private static OptionTarget personalization(String identity, List<String> goalIds, List<String> filters) {
            return new OptionTarget(identity, null, List.copyOf(goalIds), List.copyOf(filters), null);
        }

        private static OptionTarget mode(String identity, String action) {
            return new OptionTarget(identity, null, List.of(), List.of(), action);
        }
    }

    private record SelectionPlan(
            String requiredAction,
            String selectionReference,
            List<OptionTarget> targets,
            VisibleCoachStateResponse.Selection display,
            boolean activeGoalRedirect) {
    }

    private final CoachToolFacade coachToolFacade;
    private final String publicBaseUrl;
    private final VisibleSessionAiStatePreparer statePreparer;

    public VisibleSessionService(
            CoachToolFacade coachToolFacade,
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl) {
        this.coachToolFacade = coachToolFacade;
        this.publicBaseUrl = normalizeBaseUrl(publicBaseUrl);
        this.statePreparer = new VisibleSessionAiStatePreparer(this.publicBaseUrl);
    }

    public VisibleCoachStateResponse getState(String chatSessionToken, String language) {
        return render(chatSessionToken, language, currentState(chatSessionToken), null);
    }

    public ActionOutcome requestNavigation(
            String chatSessionToken,
            String language,
            VisibleNavigationRequest request) {
        if (request == null || request.target() == null) {
            UnifiedLearnerStateResponse current = currentState(chatSessionToken);
            return outcome(
                    HttpStatus.BAD_REQUEST,
                    chatSessionToken,
                    language,
                    current,
                    localized(language, "Das Navigationsziel fehlt.", "The navigation target is missing."));
        }
        UnifiedLearnerStateResponse raw = coachToolFacade.getSessionState(chatSessionToken);
        UnifiedLearnerStateResponse current = statePreparer.prepare(raw);
        SelectionPlan plan = buildNavigationPlan(
                chatSessionToken,
                language,
                raw,
                current,
                request.target());
        if (plan == null) {
            return outcome(
                    HttpStatus.CONFLICT,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Für dieses Navigationsziel sind aktuell keine Optionen verfügbar.",
                            "No options are currently available for this navigation target."));
        }
        return new ActionOutcome(
                HttpStatus.OK,
                render(
                        chatSessionToken,
                        language,
                        current,
                        localized(language,
                                "Die gewünschte Navigation ist geöffnet. Zeige diese Auswahl sichtbar an und frage nach der Nummer, außer die aktuelle Nachricht wählt bereits genau eine Option eindeutig; dann wende diese Option sofort mit applyVisibleChoice an.",
                                "The requested navigation is open. Show these choices visibly and ask for the number unless the current message already identifies exactly one option unambiguously; then apply it immediately with applyVisibleChoice."),
                        plan,
                        false,
                        "selection",
                        List.of("getVisibleState", "requestVisibleNavigation", "applyVisibleChoice")));
    }

    public ActionOutcome choose(
            String chatSessionToken,
            String language,
            VisibleChoiceRequest request) {
        UnifiedLearnerStateResponse rawCurrent = coachToolFacade.getSessionState(chatSessionToken);
        UnifiedLearnerStateResponse current = statePreparer.prepare(rawCurrent);

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
        SelectionPlan plan = resolveSelectionPlan(
                chatSessionToken,
                language,
                rawCurrent,
                current,
                request.selectionReference());
        if (plan == null) {
            return outcome(
                    HttpStatus.CONFLICT,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Diese Auswahl ist nicht mehr aktuell. Zeige die aktuelle Auswahl erneut und frage noch einmal.",
                            "This selection is no longer current. Show the current choices and ask again."));
        }
        List<Integer> selectedNumbers = selectedChoiceNumbers(request);
        if (selectedNumbers.isEmpty()) {
            return outcome(
                    HttpStatus.BAD_REQUEST,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Gib mindestens eine gültige Auswahlnummer an.",
                            "Provide at least one valid choice number."));
        }
        if (!"setScope".equals(plan.requiredAction()) && selectedNumbers.size() != 1) {
            return outcome(
                    HttpStatus.BAD_REQUEST,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Für diesen Schritt ist genau eine Auswahlnummer erforderlich.",
                            "Exactly one choice number is required for this step."));
        }
        if (selectedNumbers.stream().anyMatch(number -> number < 1 || number > plan.targets().size())) {
            return outcome(
                    HttpStatus.BAD_REQUEST,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Mindestens eine Auswahlnummer existiert nicht. Zeige die aktuelle Auswahl erneut.",
                            "At least one choice number does not exist. Show the current choices again."));
        }

        List<OptionTarget> selectedTargets = selectedNumbers.stream()
                .map(number -> plan.targets().get(number - 1))
                .toList();
        OptionTarget target = selectedTargets.get(0);
        try {
            switch (plan.requiredAction()) {
                case "setCurriculum" -> {
                    UpdateCurriculumRequest curriculumRequest = new UpdateCurriculumRequest();
                    curriculumRequest.setCurriculumId(target.value());
                    coachToolFacade.setSessionCurriculum(chatSessionToken, curriculumRequest);
                }
                case "setScope" -> coachToolFacade.setSessionScope(
                        chatSessionToken,
                        new ScopeRequest(selectedTargets.stream().map(OptionTarget::value).toList()));
                case "setActiveGoal" -> coachToolFacade.setSessionActiveGoal(
                        chatSessionToken,
                        new ActiveGoalRequest(target.value(), plan.activeGoalRedirect()));
                case "setPersonalization" -> coachToolFacade.setSessionPersonalization(
                        chatSessionToken,
                        new PersonalizationRequest(Map.of(), target.goalIds(), target.filters()));
                case "chooseMemoryMode" -> {
                    if ("startVerifiedRecall".equals(target.modeAction())) {
                        return new ActionOutcome(
                                HttpStatus.OK,
                                render(
                                        chatSessionToken,
                                        language,
                                        current,
                                        localized(language,
                                                "Der Prüfmodus ist gewählt. Starte jetzt mit startVisibleVerifiedRecall und zeige die Kartenfrage sichtbar an.",
                                                "Verification mode is selected. Now call startVisibleVerifiedRecall and show the card prompt visibly."),
                                        null,
                                        true,
                                        "verifiedRecall",
                                        List.of(
                                                "getVisibleState",
                                                "requestVisibleNavigation",
                                                "startVisibleVerifiedRecall")));
                    }
                    return new ActionOutcome(
                            HttpStatus.OK,
                            render(
                                    chatSessionToken,
                                    language,
                                    current,
                                    localized(language,
                                            "Der Übungsmodus ist gewählt. Öffne das aktive Lernziel über den bereitgestellten Cockpit-Link.",
                                            "Practice mode is selected. Open the active learning goal through the provided cockpit link."),
                                    null,
                                    true,
                                    "cockpit",
                                    List.of("getVisibleState", "requestVisibleNavigation")));
                }
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
                UnifiedLearnerStateResponse changed = currentState(chatSessionToken);
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

        UnifiedLearnerStateResponse updated = currentState(chatSessionToken);
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
                UnifiedLearnerStateResponse current = currentState(chatSessionToken);
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
        UnifiedLearnerStateResponse updated = currentState(chatSessionToken);
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
        UnifiedLearnerStateResponse current = currentState(chatSessionToken);
        if (!isValidMasteryRequest(request)) {
            return outcome(
                    HttpStatus.BAD_REQUEST,
                    chatSessionToken,
                    language,
                    current,
                    localized(language,
                            "Die aktive Lernziel-ID ist erforderlich.",
                            "The active learning-goal ID is required."));
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
                new MasteryUpdateRequest(Map.of(request.goalId(), 1.0), request.goalId()));
        UnifiedLearnerStateResponse updated = currentState(chatSessionToken);
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

    public VisibleVerifiedRecallPromptResponse startVerifiedRecall(
            String chatSessionToken,
            String language,
            VerifiedRecallStartRequest request) {
        UnifiedLearnerStateResponse current = currentState(chatSessionToken);
        FrontierGoal active = requireActiveMemoryGoal(current, request == null ? null : request.goalId());
        VerifiedRecallPromptResponse response = coachToolFacade.startSessionVerifiedRecall(
                chatSessionToken,
                language,
                request == null
                        ? new VerifiedRecallStartRequest(active.id(), null, null)
                        : new VerifiedRecallStartRequest(active.id(), request.retest(), request.batchSize()));
        return visibleRecallPrompt(chatSessionToken, language, response);
    }

    public VisibleVerifiedRecallAnswerResponse getVerifiedRecallAnswer(
            String chatSessionToken,
            String language,
            VerifiedRecallAnswerRequest request) {
        UnifiedLearnerStateResponse current = currentState(chatSessionToken);
        FrontierGoal active = requireActiveMemoryGoal(current, request == null ? null : request.goalId());
        if (request == null || request.cardId() == null || request.cardId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cardId must not be empty.");
        }
        VerifiedRecallAnswerResponse response = coachToolFacade.getSessionVerifiedRecallAnswer(
                chatSessionToken,
                language,
                new VerifiedRecallAnswerRequest(active.id(), request.cardId()));
        return new VisibleVerifiedRecallAnswerResponse(
                relayFooter(chatSessionToken, response.goalId(), language),
                visibleRecallAnswerInstruction(language),
                response.goalId(),
                response.cardId(),
                response.prompt(),
                response.expectedAnswer(),
                response.category());
    }

    public VisibleVerifiedRecallResultResponse recordVerifiedRecallResult(
            String chatSessionToken,
            String language,
            VerifiedRecallResultRequest request) {
        UnifiedLearnerStateResponse current = currentState(chatSessionToken);
        FrontierGoal active = requireActiveMemoryGoal(current, request == null ? null : request.goalId());
        if (request == null || request.cardId() == null || request.cardId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cardId must not be empty.");
        }
        if (request.passed() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "passed must not be null.");
        }
        VerifiedRecallResultResponse response = coachToolFacade.recordSessionVerifiedRecallResult(
                chatSessionToken,
                language,
                new VerifiedRecallResultRequest(
                        active.id(),
                        request.cardId(),
                        request.passed(),
                        request.feedback()));
        VisibleVerifiedRecallState next = visibleRecallState(response.next());
        UnifiedLearnerStateResponse refreshed = currentState(chatSessionToken);
        FrontierGoal refreshedActiveGoal = activeGoal(refreshed);
        return new VisibleVerifiedRecallResultResponse(
                relayFooter(chatSessionToken, refreshedActiveGoal, language),
                response.savedCardId(),
                response.passed(),
                response.verifiedCards(),
                response.pendingCards(),
                response.masterySaved(),
                response.masteryGoalId(),
                visibleRecallResultInstruction(language, response.masterySaved()),
                next);
    }

    public VisibleExamEvaluationResponse getExamEvaluation(
            String chatSessionToken,
            String language,
            VisibleExamEvaluationRequest request) {
        UnifiedLearnerStateResponse state = currentState(chatSessionToken);
        FrontierGoal active = activeGoal(state);
        if (request == null || request.goalId() == null || request.goalId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "goalId must not be empty.");
        }
        if (active == null || !request.goalId().equals(active.id()) || !isExamGoal(active)
                || !statePreparer.isExamReadyForHardCheck(active)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The cited goal is not the active exam goal.");
        }
        ExamData exam = active.examData();
        String solution = localizedContent(
                language,
                exam == null ? null : exam.getSolutionContent(),
                exam == null ? null : exam.getSolutionContentEn());
        if (solution == null || solution.isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The active exam has no released evaluation data.");
        }
        return new VisibleExamEvaluationResponse(
                relayFooter(chatSessionToken, active.id(), language),
                active.id(),
                solution,
                visibleScoring(exam.getScoring()),
                localized(language,
                        "Bewerte jetzt die bereits vorliegende Lernendenantwort anhand von Lösung und Bewertungsraster. Speichere Mastery nur bei bestandenem Ergebnis.",
                        "Now evaluate the learner answer already provided against the solution and scoring rubric. Save mastery only for a passing result."));
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
        return render(
                chatSessionToken,
                language,
                state,
                instructionOverride,
                null,
                false,
                null,
                null);
    }

    private VisibleCoachStateResponse render(
            String chatSessionToken,
            String language,
            UnifiedLearnerStateResponse state,
            String instructionOverride,
            SelectionPlan forcedSelectionPlan,
            boolean suppressSelection,
            String interactionModeOverride,
            List<String> allowedActionsOverride) {
        FrontierGoal currentGoal = activeGoal(state);
        String action = requiredAction(state);
        SelectionPlan selectionPlan = suppressSelection
                ? null
                : forcedSelectionPlan != null
                        ? forcedSelectionPlan
                        : buildSelectionPlan(chatSessionToken, language, state);
        return new VisibleCoachStateResponse(
                relayFooter(chatSessionToken, currentGoal, language),
                state == null || state.learningState() == null ? "" : state.learningState(),
                action == null ? "" : action,
                interactionModeOverride == null
                        ? interactionMode(state, currentGoal, selectionPlan)
                        : interactionModeOverride,
                curriculum(state),
                visibleActiveGoal(state, currentGoal, language),
                currentGoal == null
                        ? List.of()
                        : visibleResources(
                                currentGoal.resourceLinks(),
                                cockpitUrl(
                                        state == null || state.curriculum() == null
                                                ? null
                                                : state.curriculum().getCurriculumId(),
                                        currentGoal.id()),
                                language),
                selectionPlan == null ? null : selectionPlan.display(),
                progress(state),
                completion(state),
                allowedActionsOverride == null
                        ? visibleAllowedActions(action, selectionPlan, currentGoal)
                        : List.copyOf(allowedActionsOverride),
                instructionOverride == null ? instructionForState(language, action) : instructionOverride);
    }

    /**
     * Translate the generic learner-state workflow into this package's exact
     * OpenAPI operation IDs. Legacy action names must never leak into the
     * Visible Session contract as if they were callable operations.
     */
    private List<String> visibleAllowedActions(
            String requiredAction,
            SelectionPlan selectionPlan,
            FrontierGoal activeGoal) {
        List<String> actions = new ArrayList<>();
        actions.add("getVisibleState");
        actions.add("requestVisibleNavigation");
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
        if ("chooseMemoryMode".equals(requiredAction)
                && activeGoal != null
                && isMemoryGoal(activeGoal)) {
            actions.add("startVisibleVerifiedRecall");
        }
        if (("teachActiveGoal".equals(requiredAction) || "setMastery".equals(requiredAction))
                && activeGoal != null
                && isExamGoal(activeGoal)
                && statePreparer.isExamReadyForHardCheck(activeGoal)) {
            actions.add("getVisibleExamEvaluation");
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
                targets.add(OptionTarget.value("curriculum:" + option.getCurriculumId(), option.getCurriculumId()));
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
            String curriculumId = state.curriculum() == null ? "" : state.curriculum().getCurriculumId();
            for (FrontierGoal option : options) {
                if (option == null || option.id() == null) {
                    continue;
                }
                targets.add(OptionTarget.value("goal:" + curriculumId + ":" + option.id(), option.id()));
                displayOptions.add(new VisibleCoachStateResponse.SelectionOption(
                        displayOptions.size() + 1,
                        option.title(),
                        compactText(option.description()),
                        "setActiveGoal".equals(action) ? option.id() : null));
            }
        } else if ("setPersonalization".equals(action)) {
            LandscapeSummary currentCurriculum = state.curriculum();
            String currentCurriculumId = currentCurriculum == null ? null : currentCurriculum.getCurriculumId();
            List<String> currentCurriculumIds = currentCurriculum == null
                    || currentCurriculumId == null
                    || currentCurriculumId.isBlank()
                            ? List.of()
                            : List.of(currentCurriculumId);
            List<LandscapeFilter> filters = currentCurriculum == null ? null : currentCurriculum.getFilters();
            if (filters != null && !filters.isEmpty()) {
                for (LandscapeFilter filter : filters) {
                    if (filter == null || filter.getId() == null || filter.getId().isBlank()) {
                        continue;
                    }
                    targets.add(OptionTarget.personalization(
                            "personalization:filter:" + currentCurriculumId + ":" + filter.getId(),
                            currentCurriculumIds,
                            List.of(filter.getId())));
                    displayOptions.add(new VisibleCoachStateResponse.SelectionOption(
                            displayOptions.size() + 1,
                            filter.getLabel() == null || filter.getLabel().isBlank()
                                    ? filter.getId()
                                    : filter.getLabel(),
                            null,
                            null));
                }
            } else {
                List<FrontierGoal> goalOptions = stateMachine.goalOptions();
                if (goalOptions != null) {
                    for (FrontierGoal option : goalOptions) {
                        if (option == null || option.id() == null || option.id().isBlank()) {
                            continue;
                        }
                        targets.add(OptionTarget.personalization(
                                "personalization:goal:" + currentCurriculumId + ":" + option.id(),
                                List.of(option.id()),
                                List.of()));
                        displayOptions.add(new VisibleCoachStateResponse.SelectionOption(
                                displayOptions.size() + 1,
                                option.title(),
                                compactText(option.description()),
                                null));
                    }
                }
            }
        } else if ("chooseMemoryMode".equals(action)) {
            List<LearningModeOption> modeOptions = stateMachine.modeOptions();
            if (modeOptions == null) {
                return null;
            }
            for (LearningModeOption option : modeOptions) {
                if (option == null || option.action() == null || option.action().isBlank()) {
                    continue;
                }
                FrontierGoal currentActiveGoal = activeGoal(state);
                String modeGoalId = option.goalId() == null || option.goalId().isBlank()
                        ? currentActiveGoal == null ? "" : currentActiveGoal.id()
                        : option.goalId();
                targets.add(OptionTarget.mode(
                        "memory-mode:" + modeGoalId + ":" + option.id() + ":" + option.action(),
                        option.action()));
                displayOptions.add(new VisibleCoachStateResponse.SelectionOption(
                        displayOptions.size() + 1,
                        memoryModeTitle(language, option),
                        memoryModeDescription(language, option),
                        null));
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
                        List.copyOf(displayOptions)),
                false);
    }

    private SelectionPlan resolveSelectionPlan(
            String chatSessionToken,
            String language,
            UnifiedLearnerStateResponse rawState,
            UnifiedLearnerStateResponse preparedState,
            String selectionReference) {
        SelectionPlan requiredPlan = buildSelectionPlan(chatSessionToken, language, preparedState);
        if (requiredPlan != null && requiredPlan.selectionReference().equals(selectionReference)) {
            return requiredPlan;
        }
        for (VisibleNavigationRequest.Target target : VisibleNavigationRequest.Target.values()) {
            SelectionPlan navigationPlan = buildNavigationPlan(
                    chatSessionToken,
                    language,
                    rawState,
                    preparedState,
                    target);
            if (navigationPlan != null && navigationPlan.selectionReference().equals(selectionReference)) {
                return navigationPlan;
            }
        }
        return null;
    }

    private SelectionPlan buildNavigationPlan(
            String chatSessionToken,
            String language,
            UnifiedLearnerStateResponse rawState,
            UnifiedLearnerStateResponse preparedState,
            VisibleNavigationRequest.Target target) {
        List<OptionTarget> targets = new ArrayList<>();
        List<VisibleCoachStateResponse.SelectionOption> displayOptions = new ArrayList<>();
        String requiredAction;

        switch (target) {
            case CURRICULUM -> {
                requiredAction = "setCurriculum";
                List<LandscapeSummary> curricula = coachToolFacade.getSessionCurriculumOptions(chatSessionToken);
                if (curricula != null) {
                    for (LandscapeSummary curriculum : curricula) {
                        if (curriculum == null || curriculum.getCurriculumId() == null) {
                            continue;
                        }
                        targets.add(OptionTarget.value(
                                "navigation:curriculum:" + curriculum.getCurriculumId(),
                                curriculum.getCurriculumId()));
                        displayOptions.add(new VisibleCoachStateResponse.SelectionOption(
                                displayOptions.size() + 1,
                                curriculum.getTitle(),
                                compactText(curriculum.getDescription()),
                                null));
                    }
                }
            }
            case PERSONALIZATION -> {
                requiredAction = "setPersonalization";
                LandscapeSummary curriculum = preparedState == null ? null : preparedState.curriculum();
                String curriculumId = curriculum == null ? null : curriculum.getCurriculumId();
                List<LandscapeFilter> filters = curriculum == null ? null : curriculum.getFilters();
                List<String> curriculumGoalIds = curriculum == null
                        || curriculumId == null
                        || curriculumId.isBlank()
                                ? List.of()
                                : List.of(curriculumId);
                if (filters != null) {
                    for (LandscapeFilter filter : filters) {
                        if (filter == null || filter.getId() == null || filter.getId().isBlank()) {
                            continue;
                        }
                        targets.add(OptionTarget.personalization(
                                "navigation:personalization:" + curriculumId + ":" + filter.getId(),
                                curriculumGoalIds,
                                List.of(filter.getId())));
                        displayOptions.add(new VisibleCoachStateResponse.SelectionOption(
                                displayOptions.size() + 1,
                                filter.getLabel() == null || filter.getLabel().isBlank()
                                        ? filter.getId()
                                        : filter.getLabel(),
                                null,
                                null));
                    }
                }
            }
            case SCOPE, GOAL -> {
                requiredAction = target == VisibleNavigationRequest.Target.SCOPE ? "setScope" : "setActiveGoal";
                List<FrontierGoal> source = target == VisibleNavigationRequest.Target.SCOPE
                        ? coachToolFacade.getSessionScopeOptions(chatSessionToken)
                        : rawState == null ? null : rawState.frontier();
                if ((source == null || source.isEmpty()) && rawState != null) {
                    source = rawState.frontier();
                }
                if (source == null || source.isEmpty()) {
                    source = rawState == null || rawState.stateMachine() == null
                            ? List.of()
                            : rawState.stateMachine().goalOptions();
                }
                List<FrontierGoal> preparedGoals = statePreparer.prepareNavigationGoals(source);
                if (preparedGoals == null) {
                    preparedGoals = List.of();
                }
                List<FrontierGoal> candidates;
                if (target == VisibleNavigationRequest.Target.GOAL) {
                    candidates = preparedGoals.stream()
                            .filter(goal -> "atomic".equals(goal.type()))
                            .toList();
                } else {
                    List<FrontierGoal> clusters = preparedGoals.stream()
                            .filter(goal -> "cluster".equals(goal.type()))
                            .toList();
                    candidates = clusters.isEmpty() ? preparedGoals : clusters;
                }
                for (FrontierGoal goal : candidates) {
                    if (goal == null || goal.id() == null || goal.id().isBlank()) {
                        continue;
                    }
                    String curriculumId = preparedState == null || preparedState.curriculum() == null
                            ? ""
                            : preparedState.curriculum().getCurriculumId();
                    targets.add(OptionTarget.value(
                            "navigation:" + target.value() + ":" + curriculumId + ":" + goal.id(),
                            goal.id()));
                    displayOptions.add(new VisibleCoachStateResponse.SelectionOption(
                            displayOptions.size() + 1,
                            goal.title(),
                            compactText(goal.description()),
                            target == VisibleNavigationRequest.Target.GOAL ? goal.id() : null));
                }
            }
            default -> throw new IllegalStateException("Unhandled navigation target: " + target);
        }

        if (targets.isEmpty()) {
            return null;
        }
        String referenceKind = "navigation:" + target.value();
        String reference = selectionReference(chatSessionToken, referenceKind, targets);
        return new SelectionPlan(
                requiredAction,
                reference,
                List.copyOf(targets),
                new VisibleCoachStateResponse.Selection(
                        reference,
                        navigationQuestion(language, target),
                        List.copyOf(displayOptions)),
                target == VisibleNavigationRequest.Target.GOAL);
    }

    private String navigationQuestion(String language, VisibleNavigationRequest.Target target) {
        return switch (target) {
            case CURRICULUM -> localized(language, "Zu welchem Lehrplan möchtest du wechseln?", "Which curriculum do you want to switch to?");
            case PERSONALIZATION -> localized(language, "Welche Ausprägung möchtest du verwenden?", "Which personalization option do you want to use?");
            case SCOPE -> localized(
                    language,
                    "Welche Bereiche sollen den neuen Fokus bilden? Nenne eine oder mehrere Nummern.",
                    "Which areas should form the new focus? Give one or more numbers.");
            case GOAL -> localized(language, "Zu welchem Lernziel möchtest du wechseln?", "Which learning goal do you want to switch to?");
        };
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
            FrontierGoal goal,
            String language) {
        if (goal == null) {
            return null;
        }
        String curriculumId = state == null || state.curriculum() == null
                ? null
                : state.curriculum().getCurriculumId();
        String goalCockpitUrl = cockpitUrl(curriculumId, goal.id());
        return new VisibleCoachStateResponse.ActiveGoal(
                goal.id(),
                goal.title(),
                goal.description(),
                visibleNodeKind(goal),
                goalCockpitUrl,
                visibleExamTask(goal.examData(), language));
    }

    private VisibleCoachStateResponse.ExamTask visibleExamTask(ExamData exam, String language) {
        if (exam == null) {
            return null;
        }
        String task = localizedContent(language, exam.getTaskContent(), exam.getTaskContentEn());
        Double maxPoints = exam.getScoring() == null ? null : exam.getScoring().getMaxPoints();
        boolean hasImage = task != null && task.startsWith("IMAGE_PATH: ");
        String visibleTask = hasImage
                ? task.replaceFirst("^IMAGE_PATH: [^\\r\\n]+(?:\\r?\\n){1,2}", "")
                : task;
        return new VisibleCoachStateResponse.ExamTask(
                visibleTask,
                maxPoints,
                hasImage);
    }

    private List<VisibleCoachStateResponse.Resource> visibleResources(
            List<GoalSourceLink> links,
            String goalCockpitUrl,
            String language) {
        List<VisibleCoachStateResponse.Resource> resources = new ArrayList<>();
        if (links != null) {
            for (GoalSourceLink link : links) {
                if (link == null || link.url() == null || link.url().isBlank()) {
                    continue;
                }
                boolean visualization = "goal-visualization".equals(link.type())
                        && "image".equals(link.resourceType());
                if (visualization && (goalCockpitUrl == null || goalCockpitUrl.isBlank())) {
                    continue;
                }
                String type = link.type() == null || link.type().isBlank()
                        ? "resource"
                        : link.type();
                String title = link.title() == null || link.title().isBlank()
                        ? type
                        : link.title();
                resources.add(new VisibleCoachStateResponse.Resource(
                        type,
                        title,
                        visualization ? goalCockpitUrl : link.url(),
                        visualization ? "cockpit" : link.resourceType(),
                        visualization ? "SkillPilot" : link.provider(),
                        link.altText(),
                        visualization));
            }
        }
        return List.copyOf(resources);
    }

    private VisibleCoachStateResponse.Progress progress(UnifiedLearnerStateResponse state) {
        LearnerGoals goals = state == null ? null : state.goals();
        if (goals == null) {
            return new VisibleCoachStateResponse.Progress(0, 0, null, null, false);
        }
        return new VisibleCoachStateResponse.Progress(
                goals.mastered_count(),
                goals.total_count(),
                goalProgress(goals.personalized()),
                goalProgress(goals.scope()),
                goals.scope_completed());
    }

    private VisibleCoachStateResponse.GoalProgress goalProgress(GoalStats stats) {
        return stats == null
                ? null
                : new VisibleCoachStateResponse.GoalProgress(stats.mastered_atomic(), stats.total_atomic());
    }

    private VisibleCoachStateResponse.Completion completion(UnifiedLearnerStateResponse state) {
        LearnerGoals goals = state == null ? null : state.goals();
        boolean scopeComplete = goals != null && goals.scope_completed();
        GoalStats personalized = goals == null ? null : goals.personalized();
        boolean curriculumComplete = personalized != null
                && personalized.total_atomic() > 0
                && personalized.mastered_atomic() >= personalized.total_atomic();
        return new VisibleCoachStateResponse.Completion(scopeComplete, curriculumComplete);
    }

    private String interactionMode(
            UnifiedLearnerStateResponse state,
            FrontierGoal goal,
            SelectionPlan selectionPlan) {
        VisibleCoachStateResponse.Completion completion = completion(state);
        if (goal == null && completion.curriculumComplete()) {
            return "complete";
        }
        if (selectionPlan != null) {
            return "selection";
        }
        if (goal != null && isExamGoal(goal)) {
            return "exam";
        }
        if (goal != null && isMemoryGoal(goal)) {
            return "verifiedRecall";
        }
        String action = requiredAction(state);
        if ("setPersonalization".equals(action) || "chooseMemoryMode".equals(action)) {
            return "cockpit";
        }
        return "chat";
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
        return relayFooter(chatSessionToken, goal == null ? null : goal.id(), language);
    }

    private String relayFooter(String chatSessionToken, String goalId, String language) {
        boolean english = language != null && language.trim().toLowerCase().startsWith("en");
        StringBuilder footer = new StringBuilder(english
                ? "— SkillPilot · Session: "
                : "— SkillPilot · Sitzung: ")
                .append(chatSessionToken);
        if (goalId != null && !goalId.isBlank()) {
            footer.append(english ? " · Learning goal ID: " : " · Lernziel-ID: ").append(goalId);
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
            case "setCurriculum", "setScope", "setActiveGoal", "setPersonalization", "chooseMemoryMode" -> localized(language,
                    "Zeige die nummerierte Auswahl sichtbar an und frage die lernende Person, außer ihre aktuelle Nachricht wählt bereits genau eine Option eindeutig; dann wende diese Option sofort an. Verwende nur Auswahlreferenz und gewählte Nummern.",
                    "Show the numbered choices visibly and ask the learner unless their current message already identifies exactly one option unambiguously; then apply that option immediately. Use only the selection reference and selected numbers.");
            case "teachActiveGoal", "setMastery" -> localized(language,
                    "Arbeite dialogisch am aktiven Lernziel. Speichere Mastery erst nach ausreichender Evidenz.",
                    "Coach the active learning goal dialogically. Save mastery only after sufficient evidence.");
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
        return localized(language,
                "Für den Schritt " + safeAction(requiredAction)
                        + " sind aktuell keine nummerierten Optionen verfügbar. Lade den Zustand neu oder öffne eine Navigation.",
                "No numbered options are currently available for " + safeAction(requiredAction)
                        + ". Reload state or request navigation.");
    }

    private String selectionQuestion(String language, String action) {
        return switch (action) {
            case "setCurriculum" -> localized(language, "Welchen Lehrplan möchtest du verwenden?", "Which curriculum do you want to use?");
            case "setScope" -> localized(
                    language,
                    "Welche Bereiche möchtest du auswählen? Nenne eine oder mehrere Nummern.",
                    "Which areas do you want to select? Give one or more numbers.");
            case "setPersonalization" -> localized(language, "Welche Ausprägung passt zu dir?", "Which option fits you?");
            case "chooseMemoryMode" -> localized(language, "Wie möchtest du mit diesem Lernkartenziel arbeiten?", "How do you want to work with this memory goal?");
            default -> localized(language, "Welches Lernziel möchtest du bearbeiten?", "Which learning goal do you want to work on?");
        };
    }

    private boolean isValidMasteryRequest(VisibleMasteryRequest request) {
        return request != null && request.goalId() != null && !request.goalId().isBlank();
    }

    private UnifiedLearnerStateResponse currentState(String chatSessionToken) {
        return statePreparer.prepare(coachToolFacade.getSessionState(chatSessionToken));
    }

    private List<Integer> selectedChoiceNumbers(VisibleChoiceRequest request) {
        if (request == null) {
            return List.of();
        }
        boolean hasSingle = request.choiceNumber() != null;
        boolean hasMultipleField = request.choiceNumbers() != null;
        if (hasSingle == hasMultipleField) {
            return List.of();
        }
        if (hasSingle) {
            return request.choiceNumber() > 0 ? List.of(request.choiceNumber()) : List.of();
        }
        if (request.choiceNumbers().isEmpty()
                || request.choiceNumbers().stream().anyMatch(number -> number == null || number <= 0)) {
            return List.of();
        }
        Set<Integer> unique = new LinkedHashSet<>(request.choiceNumbers());
        return unique.size() == request.choiceNumbers().size() ? List.copyOf(unique) : List.of();
    }

    private FrontierGoal requireActiveMemoryGoal(UnifiedLearnerStateResponse state, String requestedGoalId) {
        FrontierGoal active = activeGoal(state);
        if (active == null || !isMemoryGoal(active)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "There is no active memory goal.");
        }
        if (requestedGoalId != null && !requestedGoalId.isBlank() && !requestedGoalId.equals(active.id())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The cited goal is not the active memory goal.");
        }
        return active;
    }

    private VisibleVerifiedRecallPromptResponse visibleRecallPrompt(
            String chatSessionToken,
            String language,
            VerifiedRecallPromptResponse response) {
        if (response == null) {
            return null;
        }
        List<VisibleVerifiedRecallPromptResponse.Card> cards = response.cards() == null
                ? List.of()
                : response.cards().stream()
                        .map(this::visibleRecallCard)
                        .toList();
        return new VisibleVerifiedRecallPromptResponse(
                relayFooter(chatSessionToken, response.goalId(), language),
                response.status(),
                visibleRecallPromptInstruction(language, response.status(), response.instruction()),
                response.goalId(),
                response.goalTitle(),
                response.totalCards(),
                response.verifiedCards(),
                response.pendingCards(),
                response.eligibleCards(),
                response.blockedCards(),
                response.nextEligibleAt(),
                response.batchSize(),
                cards);
    }

    private VisibleVerifiedRecallState visibleRecallState(VerifiedRecallPromptResponse response) {
        if (response == null) {
            return null;
        }
        List<VisibleVerifiedRecallPromptResponse.Card> cards = response.cards() == null
                ? List.of()
                : response.cards().stream().map(this::visibleRecallCard).toList();
        return new VisibleVerifiedRecallState(
                response.status(),
                response.goalId(),
                response.goalTitle(),
                response.totalCards(),
                response.verifiedCards(),
                response.pendingCards(),
                response.eligibleCards(),
                response.blockedCards(),
                response.nextEligibleAt(),
                response.batchSize(),
                cards);
    }

    private VisibleVerifiedRecallPromptResponse.Card visibleRecallCard(VerifiedRecallPromptCard card) {
        return new VisibleVerifiedRecallPromptResponse.Card(card.cardId(), card.prompt(), card.category());
    }

    private String visibleRecallPromptInstruction(String language, String status, String fallback) {
        if ("ready".equals(status)) {
            return localized(
                    language,
                    "Stelle alle Kartenfragen als nummerierten Batch sichtbar, ohne Antworten oder Hilfen vorwegzunehmen. Rufe nach den Lernendenantworten je Karte getVisibleVerifiedRecallAnswer und danach recordVisibleVerifiedRecallResult auf.",
                    "Ask all card prompts visibly as one numbered batch without revealing answers or hints. After the learner answers, call getVisibleVerifiedRecallAnswer and then recordVisibleVerifiedRecallResult for each card.");
        }
        if ("complete".equals(status)) {
            return visibleRecallResultInstruction(language, true);
        }
        return replaceLegacyVisibleOperationNames(fallback);
    }

    private String visibleRecallAnswerInstruction(String language) {
        return localized(
                language,
                "Vergleiche die Lernendenantwort mit der erwarteten Antwort. Akzeptiere sachlich gleichwertige Formulierungen und rufe danach recordVisibleVerifiedRecallResult mit passed=true oder passed=false auf.",
                "Compare the learner answer with the expected answer. Accept substantively equivalent wording, then call recordVisibleVerifiedRecallResult with passed=true or passed=false.");
    }

    private String visibleRecallResultInstruction(String language, boolean masterySaved) {
        if (masterySaved) {
            return localized(
                    language,
                    "Alle erforderlichen Karten sind geprüft. Das Backend hat Mastery automatisch gespeichert; rufe setVisibleMastery nicht auf. Lade den Zustand nur neu, wenn das nächste Lernziel gewünscht ist.",
                    "All required cards are verified. The backend saved mastery automatically; do not call setVisibleMastery. Reload state only if the learner wants the next learning goal.");
        }
        return localized(
                language,
                "Das Kartenergebnis ist gespeichert. Folge next.status: Stelle bei ready die nächsten Karten; beende bei waiting die heutige Prüfung.",
                "The card result is saved. Follow next.status: ask the next cards when ready; stop today's verification when waiting.");
    }

    private String replaceLegacyVisibleOperationNames(String value) {
        if (value == null) {
            return null;
        }
        return value
                .replace("verified-recall/start", "startVisibleVerifiedRecall")
                .replace("getVerifiedRecallAnswer", "getVisibleVerifiedRecallAnswer")
                .replace("recordVerifiedRecallResult", "recordVisibleVerifiedRecallResult")
                .replace("setMastery", "setVisibleMastery");
    }

    private VisibleExamEvaluationResponse.Scoring visibleScoring(ExamData.Scoring scoring) {
        if (scoring == null) {
            return null;
        }
        List<VisibleExamEvaluationResponse.ScoringStep> steps = scoring.getSteps() == null
                ? List.of()
                : scoring.getSteps().stream()
                        .map(step -> new VisibleExamEvaluationResponse.ScoringStep(
                                step.getId(),
                                step.getPoints(),
                                step.getDescription()))
                        .toList();
        return new VisibleExamEvaluationResponse.Scoring(
                scoring.getMaxPoints(),
                scoring.getPassingPoints(),
                steps);
    }

    private boolean isExamGoal(FrontierGoal goal) {
        return goal != null && ("exam".equals(goal.nodeKind()) || goal.examData() != null);
    }

    private boolean isMemoryGoal(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        if ("memory".equals(goal.nodeKind())) {
            return true;
        }
        return goal.tags() != null && goal.tags().stream()
                .anyMatch(tag -> "memorization".equals(tag) || tag.startsWith("srs-deck:"));
    }

    private String visibleNodeKind(FrontierGoal goal) {
        if (isExamGoal(goal)) {
            return "exam";
        }
        return isMemoryGoal(goal) ? "memory" : "tutor";
    }

    private String memoryModeTitle(String language, LearningModeOption option) {
        return switch (option.action()) {
            case "openCockpitPractice" -> localized(language, "Im Cockpit üben", "Practice in the Cockpit");
            case "startVerifiedRecall" -> localized(language, "Mit Lerncoach prüfen", "Check with the learning coach");
            default -> option.title();
        };
    }

    private String memoryModeDescription(String language, LearningModeOption option) {
        return switch (option.action()) {
            case "openCockpitPractice" -> localized(
                    language,
                    "Öffne den SRS-Kartendrill im SkillPilot-Cockpit.",
                    "Open the SRS card drill in the SkillPilot Cockpit.");
            case "startVerifiedRecall" -> localized(
                    language,
                    "Prüfe die fälligen Karten im Chat ohne Hilfen.",
                    "Check the due cards in chat without hints.");
            default -> compactText(option.description());
        };
    }

    private String localizedContent(String language, String german, String english) {
        boolean useEnglish = language != null && language.trim().toLowerCase().startsWith("en");
        if (useEnglish && english != null && !english.isBlank()) {
            return english;
        }
        if (german != null && !german.isBlank()) {
            return german;
        }
        return english;
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
