package com.skillpilot.backend.openai.mcp.de;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.MemoryPracticeCard;
import com.skillpilot.backend.api.MemoryPracticeProgress;
import com.skillpilot.backend.api.MemoryPracticeResponse;
import com.skillpilot.backend.api.MemoryPracticeReviewRequest;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerCard;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchResultRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchResultResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchSavedResult;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/**
 * Synthetic in-memory domain states for model-driven replay, not real-host evidence.
 * The model chooses every model-visible tool call. The actual MCP adapter owns
 * schemas, projection, capabilities and contract errors. Facade answers below
 * mutate only this disposable fixture; none performs network or database access.
 */
final class OpenAiDialogReplayReviewFixtures {
    static final String ORIENTATION_ID = "orientation-dialog";
    static final String CONTENT_ID = "functions-dialog";
    static final String MEMORY_ID = "memory-dialog";
    static final String EXAM_ID = "exam-dialog";
    static final String SCOPE_ID = "scope-ephase-dialog";
    static final String INDEPENDENT_SCOPE_ID = "independent-root-dialog";
    static final String MEMORY_TITLE = "Lernkarten - Funktionen und Gleichungen";
    static final String SCOPE_TITLE = "E-Phase: Grundlagen der Analysis und mathematische Modelle";

    private OpenAiDialogReplayReviewFixtures() { }

    static OpenAiDialogReplayFixture create(String caseId) {
        OpenAiDialogReplayFixture fixture = new OpenAiDialogReplayFixture(caseId);
        Domain domain = new Domain(fixture);
        domain.configure();
        switch (caseId) {
            case "P2", "N2" -> fixture.state = domain.state(domain.orientation, List.of(domain.orientation));
            case "P3" -> {
                fixture.state = domain.state(domain.orientation, List.of(domain.orientation));
                domain.configureMemory();
            }
            case "P4", "N3" -> {
                fixture.state = domain.state(domain.exam, List.of(domain.exam));
                domain.configureExam();
            }
            case "P5" -> {
                domain.mastered.add("previously-mastered-dialog");
                fixture.state = domain.state(domain.content, domain.scopeRoots);
            }
            default -> throw new IllegalArgumentException("No review fixture for " + caseId);
        }
        if (Set.of("P4", "N3", "P5").contains(caseId)) {
            fixture.priorConversation = List.of(
                    Map.of("role", "user", "content", fixture.preparedMessage));
            fixture.domainState.put("setupEvidence", "Synthetic prepared-start user message outside measured turns; no assistant response or tool execution fabricated.");
        }
        domain.snapshot();
        return fixture;
    }

    private static final class Domain {
        private final OpenAiDialogReplayFixture fixture;
        private final Set<String> mastered = new LinkedHashSet<>();
        private final Set<String> scheduledCards = new LinkedHashSet<>();
        private final Set<String> verifiedCards = new LinkedHashSet<>();
        private final Map<String, String> ratings = new LinkedHashMap<>();
        private int savedRecallBatches;
        private final FrontierGoal orientation = goal(ORIENTATION_ID,
                "Warum Mathematik? – Denken, Muster & Zukunft",
                "Entdecke, wie Mathematik Veränderungen sichtbar macht und Entscheidungen unterstützt.",
                "tutor", "orientation", List.of("orientation", "motivation"), List.of(), null);
        private final FrontierGoal content = goal(CONTENT_ID,
                "Zwischen Tabelle, Graph und Funktionsterm wechseln",
                "Die lernende Person kann eine funktionale Zuordnung zwischen Tabelle, Graph und Term darstellen "
                        + "und erläutern, welche Darstellung Veränderungen über die Zeit besonders anschaulich macht.",
                "tutor", null, List.of(), List.of(new GoalSourceLink(
                        "goal-visualization", "Visualisierung: Tabelle, Graph und Term",
                        "/assets/goal-visualizations/mathematik/f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0/f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0.jpg",
                        "image", "SkillPilot", List.of(), "Isolierte Dialogtest-Referenz, keine Bildabnahme",
                        "de", "Synthetic test fixture", CONTENT_ID, "primary",
                        "Tabelle, Graph und Funktionsterm stellen dieselben Zuordnungen dar.", "pilot")), null);
        private final FrontierGoal memory = goal(MEMORY_ID, MEMORY_TITLE,
                "Rufe grundlegende Funktions- und Gleichungsregeln zuverlässig ab.",
                "memory", null, List.of("memorization", "srs-deck:dialog-functions"), List.of(), null);
        private final FrontierGoal exam = examGoal();
        private List<FrontierGoal> scopeRoots = List.of(
                cluster("scope-functions-dialog", "Funktionen und ihre Darstellung"),
                cluster(INDEPENDENT_SCOPE_ID, "Unabhängiger Lernfokus"));
        private final List<FrontierGoal> scopeOptions = List.of(
                cluster(SCOPE_ID, SCOPE_TITLE).withSelectionGoalIds(List.of(SCOPE_ID, INDEPENDENT_SCOPE_ID)),
                cluster("scope-sekii-dialog", "Sekundarstufe II (LK)")
                        .withSelectionGoalIds(List.of("scope-sekii-dialog", INDEPENDENT_SCOPE_ID)));
        private final List<MemoryPracticeCard> cards = List.of(
                card(1, "Wie berechnet man die Steigung einer Geraden aus zwei Punkten?", "m=(y₂-y₁)/(x₂-x₁), x₂≠x₁."),
                card(2, "Wie lauten Scheitelpunktform und Scheitelpunkt einer quadratischen Funktion?", "f(x)=a(x-d)²+e mit S(d|e), a≠0."),
                card(3, "Wie lautet der Satz vom Nullprodukt?", "Ein Produkt ist genau dann null, wenn mindestens ein Faktor null ist."),
                card(4, "Wie löst man a^x=b nach x auf (a>0, a≠1, b>0)?", "x=log_a(b); für a=e gilt x=ln(b)."),
                card(5, "Wie lautet die Rekursionsformel einer arithmetischen Folge?", "a_(n+1)=a_n+d."),
                card(6, "Wie lautet die explizite Formel einer geometrischen Folge?", "a_n=a_1·q^(n-1)."),
                card(7, "Wie multipliziert man Potenzen gleicher positiver Basis?", "x^a·x^b=x^(a+b)."),
                card(8, "Wie lautet die p-q-Formel für x²+px+q=0?", "x_(1,2)=-p/2 ± sqrt((p/2)²-q), reell bei nichtnegativer Diskriminante."));
        private Instant recallIssuedAt;
        private List<String> issuedRecallCardIds = List.of();

        Domain(OpenAiDialogReplayFixture fixture) {
            this.fixture = fixture;
        }

        void configure() {
            String learner = OpenAiDialogReplayFixture.LEARNER_ID;
            when(fixture.coachTools.showGoalVisualizationsInChat(learner)).thenReturn(true);
            when(fixture.coachTools.getOrientationOutlook(eq(learner), any())).thenReturn(
                    new OrientationOutlook(ORIENTATION_ID, List.of(
                            new OrientationOutlook.Path("change-and-models", "Veränderung, Wachstum und Modelle",
                                    "Wachstum mit Tabellen, Graphen und Funktionstermen verstehen und vergleichen.",
                                    List.of("Bakterienwachstum", "Wachstum von Pflanzen"),
                                    List.of(new OrientationOutlook.GoalReference(CONTENT_ID, content.title()),
                                            new OrientationOutlook.GoalReference("growth-model-dialog", "Wachstumsmodelle vergleichen")),
                                    List.of(CONTENT_ID)),
                            new OrientationOutlook.Path("data-and-decisions", "Daten, Zufall und Entscheidungen",
                                    "Daten verständlich darstellen und Unsicherheit von Entscheidungen beurteilen.",
                                    List.of("Umfragen", "Medizinische Studien"),
                                    List.of(new OrientationOutlook.GoalReference("data-dialog", "Daten auswerten")),
                                    List.of("data-dialog")))));
            when(fixture.coachTools.getUncompactedFrontier(learner)).thenAnswer(invocation -> List.of(content, memory));
            when(fixture.coachTools.getScopeOptions(learner)).thenAnswer(invocation -> scopeOptions);
            when(fixture.coachTools.setActiveGoal(eq(learner), any(ActiveGoalRequest.class))).thenAnswer(invocation -> {
                ActiveGoalRequest request = invocation.getArgument(1);
                FrontierGoal selected = List.of(content, memory).stream()
                        .filter(goal -> goal.id().equals(request.goalId())).findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Unknown fixture goal."));
                FrontierGoal active = fixture.state.activeGoal();
                boolean selectionOpen = "setActiveGoal".equals(fixture.state.stateMachine().requiredAction());
                if (!selectionOpen && active != null && !active.id().equals(selected.id())
                        && !Boolean.TRUE.equals(request.redirect())) {
                    throw new IllegalArgumentException("A mid-session fixture goal switch requires redirect=true.");
                }
                fixture.state = state(selected, scopeRoots);
                snapshot();
                return fixture.state;
            });
            when(fixture.coachTools.setScope(eq(learner), any(ScopeRequest.class))).thenAnswer(invocation -> {
                ScopeRequest request = invocation.getArgument(1);
                FrontierGoal selected = scopeOptions.stream().filter(option -> option.selectionGoalIds().equals(request.goalIds()))
                        .findFirst().orElseThrow(() -> new IllegalArgumentException("Unknown fixture scope."));
                scopeRoots = List.of(selected, cluster(INDEPENDENT_SCOPE_ID, "Unabhängiger Lernfokus"));
                fixture.state = state(fixture.state.activeGoal(), scopeRoots);
                snapshot();
                return fixture.state;
            });
            when(fixture.coachTools.setMastery(eq(learner), any(MasteryUpdateRequest.class))).thenAnswer(invocation -> {
                MasteryUpdateRequest request = invocation.getArgument(1);
                FrontierGoal active = fixture.state.activeGoal();
                if (active == null || !active.id().equals(request.goalId()) || "memory".equals(active.nodeKind())) {
                    return new CoachToolFacade.MasteryResult(CoachToolFacade.MasteryStatus.BAD_REQUEST, null, null, "Invalid active goal.");
                }
                mastered.add(request.goalId());
                fixture.state = ORIENTATION_ID.equals(request.goalId())
                        ? selectionState() : state(content, scopeRoots);
                UnifiedLearnerStateResponse successor = fixture.state;
                snapshot();
                return new CoachToolFacade.MasteryResult(CoachToolFacade.MasteryStatus.UPDATED,
                        new MasteryUpdateResponse(true, request.goalId(), 1.0, successor.frontier(),
                                successor.nextAllowedActions(), successor.learningState(), successor.activeGoal(),
                                successor.stateMachine(), successor.goals()), null, null);
            });
        }

        void configureExam() {
            when(fixture.coachTools.getExamEvaluation(eq(OpenAiDialogReplayFixture.LEARNER_ID),
                    any(CoachToolFacade.ExamEvaluationRequest.class))).thenAnswer(invocation -> {
                CoachToolFacade.ExamEvaluationRequest request = invocation.getArgument(1);
                if (!EXAM_ID.equals(request.goalId()) || !EXAM_ID.equals(fixture.state.activeGoal().id())) {
                    throw new IllegalArgumentException("Evaluation is only available for the active fixture exam.");
                }
                return new CoachToolFacade.ExamEvaluationResult(EXAM_ID, exam.examData().getSolutionContent(),
                        null, new CoachToolFacade.ExamScoring(25, 13, exam.examData().getScoring().getSteps().stream()
                                .map(step -> new CoachToolFacade.ExamScoringStep(step.getId(), step.getPoints(), step.getDescription())).toList()));
            });
        }

        void configureMemory() {
            String learner = OpenAiDialogReplayFixture.LEARNER_ID;
            when(fixture.coachTools.startMemoryPractice(eq(learner), eq("de"), any())).thenAnswer(invocation -> practice());
            when(fixture.coachTools.reviewMemoryPracticeCard(eq(learner), eq("de"), any())).thenAnswer(invocation -> {
                MemoryPracticeReviewRequest request = invocation.getArgument(2);
                if (!MEMORY_ID.equals(request.goalId()) || cards.stream().noneMatch(card -> card.cardId().equals(request.cardId()))) {
                    throw new IllegalArgumentException("Unknown fixture card.");
                }
                if (!List.of("known", "not_known").contains(request.rating())) throw new IllegalArgumentException("Invalid rating.");
                scheduledCards.add(request.cardId());
                ratings.put(request.cardId(), request.rating());
                snapshot();
                return practice();
            });
            when(fixture.coachTools.startVerifiedRecallBatch(eq(learner), eq("de"), eq(MEMORY_ID), anyInt()))
                    .thenAnswer(invocation -> {
                        int configuredSize = invocation.getArgument(3);
                        List<MemoryPracticeCard> pending = cards.stream().filter(card -> !verifiedCards.contains(card.cardId())).toList();
                        if (configuredSize < pending.size() || configuredSize > 20) {
                            throw new IllegalStateException("The configured fixture batch cannot hold the complete eight-card case; revalidate setup.");
                        }
                        recallIssuedAt = Instant.ofEpochMilli(Instant.now().toEpochMilli());
                        issuedRecallCardIds = pending.stream().map(MemoryPracticeCard::cardId).toList();
                        snapshot();
                        List<VerifiedRecallPromptCard> prompts = pending.stream()
                                .map(card -> new VerifiedRecallPromptCard(card.cardId(), card.front(), card.category())).toList();
                        return new VerifiedRecallPromptResponse(pending.isEmpty() ? "complete" : "ready",
                                "Beantworte den vollständigen ausgegebenen Prüfungsbatch ohne Hilfen.", learner,
                                MEMORY_ID, MEMORY_TITLE, cards.size(), verifiedCards.size(), pending.size(), pending.size(),
                                0, null, prompts.size(), prompts, prompts.isEmpty() ? null : prompts.getFirst().cardId(),
                                prompts.isEmpty() ? null : prompts.getFirst().prompt(), "Funktionen und Gleichungen", configuredSize, recallIssuedAt);
                    });
            when(fixture.coachTools.getVerifiedRecallAnswersBatch(eq(learner), eq("de"), any())).thenAnswer(invocation -> {
                VerifiedRecallBatchAnswerRequest request = invocation.getArgument(2);
                requireIssuedBatch(request.goalId(), request.cardIds(), request.issuedAt());
                return new VerifiedRecallBatchAnswerResponse("Vergleiche alle sichtbaren Antworten in der ausgegebenen Reihenfolge.",
                        MEMORY_ID, cards.stream().filter(card -> issuedRecallCardIds.contains(card.cardId()))
                                .map(card -> new VerifiedRecallBatchAnswerCard(card.cardId(), card.front(), card.back(), card.category())).toList());
            });
            when(fixture.coachTools.recordVerifiedRecallResultsBatch(eq(learner), eq("de"), any())).thenAnswer(invocation -> {
                VerifiedRecallBatchResultRequest request = invocation.getArgument(2);
                requireIssuedBatch(request.goalId(), request.cardIds(), request.issuedAt());
                if (!request.results().stream().map(result -> result.cardId()).toList().equals(issuedRecallCardIds)) {
                    throw new IllegalArgumentException("The fixture requires one complete ordered result batch.");
                }
                request.results().stream().filter(result -> Boolean.TRUE.equals(result.passed()))
                        .forEach(result -> verifiedCards.add(result.cardId()));
                boolean complete = verifiedCards.size() == cards.size();
                if (complete) mastered.add(MEMORY_ID);
                fixture.state = state(complete ? content : memory, scopeRoots);
                savedRecallBatches++;
                snapshot();
                return new VerifiedRecallBatchResultResponse(request.results().stream()
                        .map(result -> new VerifiedRecallBatchSavedResult(result.cardId(), Boolean.TRUE.equals(result.passed()))).toList(),
                        verifiedCards.size(), cards.size() - verifiedCards.size(), complete, complete ? MEMORY_ID : null,
                        null, fixture.state);
            });
            fixture.uiDriver = turnId -> ratePracticeBatch(turnId);
        }

        private void requireIssuedBatch(String goalId, List<String> cardIds, Instant issuedAt) {
            if (!MEMORY_ID.equals(goalId) || issuedRecallCardIds.isEmpty() || !issuedRecallCardIds.equals(cardIds)
                    || !Objects.equals(recallIssuedAt, issuedAt)) {
                throw new IllegalArgumentException("No matching issued fixture recall batch.");
            }
        }

        @SuppressWarnings("unchecked")
        private List<McpSchema.CallToolResult> ratePracticeBatch(String turnId) {
            if (!"rate".equals(turnId)) throw new IllegalArgumentException("Unsupported component action.");
            McpSchema.CallToolResult start = fixture.lastResults.get(OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE);
            if (start == null || Boolean.TRUE.equals(start.isError()) || start.meta() == null) {
                throw new IllegalStateException("No successfully opened memory-practice component.");
            }
            Map<String, Object> component = (Map<String, Object>) start.meta().get("skillpilotMemoryCard");
            Map<String, Object> batch = (Map<String, Object>) component.get("cardBatch");
            List<Map<String, Object>> issued = (List<Map<String, Object>>) batch.get("cards");
            if (issued.size() != cards.size()) throw new IllegalStateException("Fixture card batch changed; do not force eight ratings.");
            List<McpSchema.CallToolResult> results = new ArrayList<>();
            for (Map<String, Object> card : issued) {
                Map<String, Object> arguments = new LinkedHashMap<>();
                arguments.put("learningSessionId", component.get("learningSessionId"));
                arguments.put("goalId", component.get("goalId"));
                arguments.put("cardId", card.get("id"));
                arguments.put("rating", "known");
                arguments.put("reviewCapability", card.get("reviewCapability"));
                arguments.put("expectedStateVersion", fixture.currentStateVersion());
                arguments.put("clientRequestId", UUID.randomUUID().toString());
                McpSchema.CallToolResult result = fixture.call(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD, arguments);
                if (Boolean.TRUE.equals(result.isError())) throw new IllegalStateException("Component fixture rating failed.");
                results.add(result);
            }
            return List.copyOf(results);
        }

        private MemoryPracticeResponse practice() {
            List<MemoryPracticeCard> due = cards.stream().filter(card -> !scheduledCards.contains(card.cardId())).toList();
            return new MemoryPracticeResponse(due.isEmpty() ? "complete" : "ready",
                    "Bewerte jede gezeigte Karte selbst. Normales Üben ist keine bestandene Kartenprüfung.",
                    MEMORY_ID, MEMORY_TITLE, new MemoryPracticeProgress(cards.size(), due.size(), scheduledCards.size()), due);
        }

        private void snapshot() {
            Map<String, Double> mastery = new LinkedHashMap<>();
            mastered.forEach(id -> mastery.put(id, 1.0));
            fixture.domainState.put("personalCurriculum", Map.of("subject", "Mathematik", "stage", "Sekundarstufe II",
                    "courseProfile", Set.of("P4", "N3").contains(fixture.caseId) ? "GK" : "LK"));
            fixture.domainState.put("mastery", Map.copyOf(mastery));
            fixture.domainState.put("scopeGoalIds", scopeRoots.stream().map(FrontierGoal::id).toList());
            fixture.domainState.put("scheduledCardIds", List.copyOf(scheduledCards));
            fixture.domainState.put("cardRatings", Map.copyOf(ratings));
            fixture.domainState.put("verifiedCardIds", List.copyOf(verifiedCards));
            fixture.domainState.put("recallIssuedCardIds", issuedRecallCardIds);
            fixture.domainState.put("savedRecallBatches", savedRecallBatches);
        }

        private UnifiedLearnerStateResponse selectionState() {
            List<FrontierGoal> options = List.of(content, memory);
            return new UnifiedLearnerStateResponse(OpenAiDialogReplayFixture.LEARNER_ID, curriculum(), options,
                    goals(scopeRoots), List.of("setActiveGoal"), List.of(), Set.of(), "frontier", null,
                    new StateMachineInfo("FRONTIER", "setActiveGoal", options, List.of(), null));
        }

        private UnifiedLearnerStateResponse state(FrontierGoal active, List<FrontierGoal> planned) {
            String action = "orientation".equals(active.semanticKind()) ? "orientActiveGoal"
                    : "memory".equals(active.nodeKind()) ? "chooseMemoryMode" : "teachActiveGoal";
            return new UnifiedLearnerStateResponse(OpenAiDialogReplayFixture.LEARNER_ID, curriculum(), List.of(content, memory),
                    goals(planned), List.of(action), List.of(), Set.of(), "learning", active,
                    new StateMachineInfo("TEACHING", action, List.of(), List.of(), active));
        }

        private LearnerGoals goals(List<FrontierGoal> planned) {
            return new LearnerGoals(planned, mastered.size(), 5, new GoalStats(mastered.size(), 5),
                    new GoalStats(mastered.size(), 5), false);
        }
    }

    private static LandscapeSummary curriculum() {
        return new LandscapeSummary("math-curriculum-dialog", "Mathematik Oberstufe Hessen", "Isolierte Dialogtest-Fixture",
                "DE", "HE", "school", "Mathematik", "de", List.of());
    }

    private static FrontierGoal goal(String id, String title, String description, String nodeKind,
            String semanticKind, List<String> tags, List<GoalSourceLink> links, ExamData exam) {
        return new FrontierGoal(id, title, description, "atomic", nodeKind, semanticKind, "frontier",
                tags, links, null, null, null, exam);
    }

    private static FrontierGoal cluster(String id, String title) {
        return new FrontierGoal(id, title, "Persönlicher Lernfokus innerhalb des bestehenden Curriculums.",
                "cluster", null, null, "available", List.of(), List.of(), null, null, null, null);
    }

    private static MemoryPracticeCard card(int number, String front, String back) {
        return new MemoryPracticeCard("dialog-card-" + number, front, back, "Funktionen und Gleichungen");
    }

    private static FrontierGoal examGoal() {
        ExamData exam = new ExamData();
        exam.setReviewStatus("released");
        exam.setTaskContent("""
                B1 (Analysis – „Das Algenwachstum“, 25 BE)
                Die von Algen bedeckte Seefläche wird durch A(t)=500/(1+49·e^(-0,2t)) modelliert.
                t bezeichnet die Zeit in Tagen, A(t) die Fläche in m²; t≥0.
                1. Berechne die zu Beginn bedeckte Fläche. (4 BE)
                2. Bestimme den Grenzwert für t→∞ und interpretiere ihn im Sachzusammenhang. (4 BE)
                3. Bestimme den Zeitpunkt des schnellsten Wachstums und die zugehörige Wachstumsgeschwindigkeit. (6 BE)
                4. Ab Tag 30 wird die bedeckte Fläche täglich um 5 % verringert. Bestimme A(30),
                   formuliere ein Modell für t≥30 und bestimme, an welchem Tag die Fläche 10 m² erreicht. (6 BE)
                5. Begründe eine exponentielle Näherung für die Anfangsphase und erläutere,
                   weshalb langfristig das logistische Modell sinnvoller ist. (5 BE)
                """);
        exam.setSolutionContent("""
                1. A(0)=500/50=10 m².
                2. e^(-0,2t)→0, A(t)→500 m². Die maximal bedeckte Fläche ist im Modell auf 500 m² begrenzt.
                3. A'(t)=0,2·A(t)·(1-A(t)/500), Maximum bei A=250 m².
                   49e^(-0,2t)=1, t=ln(49)/0,2≈19,46 Tage; maximale Rate 25 m²/Tag.
                4. A(30)≈445,85 m²; A_neu(t)=445,85·0,95^(t-30).
                   t=30+ln(10/445,85)/ln(0,95)≈104,03 Tage.
                5. Für kleine t dominiert 49e^(-0,2t) im Nenner, also A(t)≈(500/49)e^(0,2t).
                   Anfangs annähernd exponentiell; das logistische Modell berücksichtigt die begrenzte Seefläche.
                Fachlich gleichwertige Lösungswege anerkennen. Die vollständige Musterabgabe erfüllt alle Kriterien.
                """);
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(25);
        scoring.setPassingPoints(13);
        List<ExamData.Step> steps = new ArrayList<>();
        int[] points = {4, 4, 6, 6, 5};
        List<String> criteria = List.of("Anfangswert berechnen und Einheit angeben.",
                "Grenzwert bestimmen und als maximal bedeckte Fläche interpretieren.",
                "Zeitpunkt und maximale Wachstumsgeschwindigkeit mit Begründung und Einheiten bestimmen.",
                "Anschlusswert, exponentielles Abnahmemodell und Zeitpunkt für 10 m² bestimmen.",
                "Anfangsnäherung begründen und Sättigungsgrenze des logistischen Modells erläutern.");
        for (int index = 0; index < points.length; index++) {
            ExamData.Step step = new ExamData.Step();
            step.setId("criterion-" + (index + 1));
            step.setPoints(points[index]);
            step.setDescription(criteria.get(index));
            steps.add(step);
        }
        scoring.setSteps(steps);
        exam.setScoring(scoring);
        return goal(EXAM_ID, "B1 (Analysis – „Das Algenwachstum“, 25 BE)",
                "Bearbeite die vollständige Prüfungsaufgabe selbstständig ohne Hilfen.", "exam", null,
                List.of("ExamTask"), List.of(), exam);
    }
}
