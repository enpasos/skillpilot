package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.GoalPlacement;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.service.DeclaredCourseUnitsTest;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "skillpilot.landscapes.directory=src/test/resources/declared-unit-course",
        "spring.datasource.url=jdbc:h2:mem:declared-unit-course;DB_CLOSE_DELAY=-1;NON_KEYWORDS=VALUE",
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED
})
@ActiveProfiles("test")
class ClaudeV1DeclaredUnitIntegrationTest {
    private static final String COURSE = "01be24fc-71de-4a7d-b184-b3ed25dcb0c1";
    private static final String PARENT_OPENING = "566839cb-9349-4eb9-a962-55d22202b212";
    private static final String CHILD_OPENING = "516d638b-d7b3-4706-8b5f-71001a304ba2";
    private static final String PARENT_GOAL = "cba16908-0500-4f69-a312-08d28cb4d668";
    private static final String CHILD_GOAL = "105efecc-09f5-419f-a6d3-b5f493c1921e";
    private static final String EXCLUDED_GOAL = "6a174926-12b1-4a7a-a7ca-080d0d9a08ac";
    private static final String DECK = "31293e99-4b97-442b-be38-b3642725b754";
    private static final String PARENT_CARD = "ab280be7-a544-4d66-8a9b-cfa68071b922";
    private static final String CHILD_CARD = "40611626-7671-42ad-88a4-bdb2c87682fb";

    @Autowired ClaudeV1McpContractAdapter adapter;
    @Autowired ClaudeV1CapabilityService capabilities;
    @Autowired ClaudeV1LearningSessionService sessions;
    @Autowired LearnerRepository learners;
    @Autowired PlannedGoalRepository plannedGoals;
    @Autowired LearnerService learnerService;
    @Autowired ObjectMapper mapper;
    private String learnerId;
    private String session;

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void declaredUnitsOpenAndOfferTheRightCardsThroughoutChat(boolean autoPilot) throws Exception {
        createLearner(autoPilot);
        newChat();
        assertThat(context().path("levelCompletion").path("calculationStatus").asText()).isEqualTo("valid");

        focus("Parent unit");
        JsonNode parentEntry = context();
        JsonNode parentOpening = activatePublished(parentEntry, PARENT_OPENING);
        assertThat(frontierIds(parentEntry)).doesNotContain(PARENT_GOAL, CHILD_OPENING, CHILD_GOAL);
        complete(parentOpening);
        JsonNode parentGoal = context();
        if (autoPilot) {
            assertThat(activeId(parentGoal)).isEqualTo(PARENT_GOAL);
        }
        assertBox(parentGoal, 0, 0);
        complete(activatePublished(parentGoal, PARENT_GOAL));

        JsonNode parentBoundary = context();
        assertBox(parentBoundary, 1, 1);
        assertCardPriority(parentBoundary, autoPilot);
        String parentScope = practiceScope(parentBoundary);
        assertThat(parentScope).isNotBlank();

        newChat();
        JsonNode resumed = context();
        assertThat(activeId(resumed)).isEqualTo(activeId(parentBoundary));
        assertBox(resumed, 1, 1);
        assertCardPriority(resumed, autoPilot);
        assertThat(practiceScope(resumed)).isEqualTo(parentScope);
        openPractice(resumed, PARENT_CARD);

        focus("Child unit");
        JsonNode childEntry = context();
        assertThat(frontierIds(childEntry)).doesNotContain(CHILD_GOAL);
        complete(activatePublished(childEntry, CHILD_OPENING));
        JsonNode childGoal = context();
        if (autoPilot) {
            assertThat(activeId(childGoal)).isEqualTo(CHILD_GOAL);
        }
        assertBox(childGoal, 0, 0);
        complete(activatePublished(childGoal, CHILD_GOAL));

        JsonNode childBoundary = context();
        assertBox(childBoundary, 1, 1);
        assertCardPriority(childBoundary, autoPilot);
        String childScope = practiceScope(childBoundary);
        assertThat(childScope).isNotBlank().isNotEqualTo(parentScope);
        markKnown(childBoundary, openPractice(childBoundary, CHILD_CARD));
        assertBox(context(), 0, 1);

        focus("Parent unit");
        JsonNode parentWithBothCards = context();
        assertBox(parentWithBothCards, 1, 2);
        assertThat(practiceScope(parentWithBothCards)).isEqualTo(parentScope);
        openPractice(parentWithBothCards, PARENT_CARD);

        focus("Child unit");
        JsonNode childCheck = context();
        assertBox(childCheck, 0, 1);
        passRecall(childCheck, childScope, CHILD_CARD);
        assertBox(context(), 0, 0);

        focus("Parent unit");
        JsonNode parentCheck = context();
        assertBox(parentCheck, 1, 1);
        passRecall(parentCheck, parentScope, PARENT_CARD);
        assertBox(context(), 0, 0);
        assertThat(context().path("levelCompletion").path("complete").asBoolean()).isTrue();
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void newlyDueUnitCardComesBeforeAutopilotCanStartTheDeck(boolean requestRecall) throws Exception {
        createLearner(true);
        newChat();

        focus("Parent unit");
        complete(activatePublished(context(), PARENT_OPENING));
        complete(activatePublished(context(), PARENT_GOAL));
        JsonNode parentBoundary = context();
        markKnown(parentBoundary, openPractice(parentBoundary, PARENT_CARD));
        assertBox(context(), 0, 1);

        // The entire course includes the deck as the next eligible goal after the child goal.
        focus("Synthetic course");
        complete(activatePublished(context(), CHILD_OPENING));
        complete(activatePublished(context(), CHILD_GOAL));

        JsonNode boundary = context();
        assertBox(boundary, 1, 1);
        assertCardPriority(boundary, true);
        String scope = practiceScope(boundary);
        assertThat(scope).isNotBlank().isNotEqualTo(practiceScope(parentBoundary));
        if (requestRecall) {
            passRecall(boundary, scope, CHILD_CARD);
            assertBox(context(), 0, 0);
        } else {
            markKnown(boundary, openPractice(boundary, CHILD_CARD));
            JsonNode afterPractice = context();
            assertThat(afterPractice.path("cardStep").path("proposeCheck").asBoolean()).isFalse();
            assertThat(activeId(afterPractice)).isEqualTo(DECK);

            newChat();
            assertThat(activeId(context())).isEqualTo(DECK);
        }
    }

    @Test
    void restoredPrerequisiteBelongsToItsUnitAndTheChildExportsCanonicalGoals() throws Exception {
        createLearner(false, "focused-test");
        newChat();
        List<String> childFocus = focus("Child unit");
        assertThat(childFocus).hasSize(1);
        assertThat(plannedGoals.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId)
                .containsExactlyElementsOf(childFocus);

        var exported = learnerService.getLearnerLandscapeClosure(learnerId, COURSE, "en").stream()
                .filter(landscape -> COURSE.equals(landscape.getLandscapeId())).findFirst().orElseThrow();
        var scope = exported.getPersonalCurriculumProjection();
        assertThat(scope.seedAtomicGoalIds()).contains(CHILD_GOAL).doesNotContain(PARENT_GOAL, EXCLUDED_GOAL);
        assertThat(scope.targetGoalIds()).contains(PARENT_GOAL, CHILD_GOAL).doesNotContain(EXCLUDED_GOAL);
        assertThat(scope.requiredByPaths().get(PARENT_GOAL)).contains(CHILD_GOAL, PARENT_GOAL);
        assertThat(exported.getGoals()).extracting(LearningGoal::getId)
                .contains(PARENT_GOAL, CHILD_GOAL, CHILD_OPENING)
                .doesNotContain(EXCLUDED_GOAL, childFocus.getFirst());
        assertThat(exported.getGoalPlacements()).filteredOn(placement -> "child".equals(placement.getUnitId()))
                .extracting(GoalPlacement::getGoalId).containsExactlyInAnyOrder(CHILD_GOAL, CHILD_OPENING);

        focus("Parent unit");
        complete(activatePublished(context(), PARENT_OPENING));
        complete(activatePublished(context(), PARENT_GOAL));

        JsonNode boundary = context();
        assertBox(boundary, 1, 1);
        openPractice(boundary, PARENT_CARD);
    }

    @Test
    void aPersistedFocusFromThePriorCatalogStillOpensTheChild(@TempDir Path priorCatalog) throws Exception {
        String storedFocus = DeclaredCourseUnitsTest.childFocusFromPriorCatalog(priorCatalog);
        createLearner(false);
        Learner learner = learners.findById(learnerId).orElseThrow();
        plannedGoals.saveAndFlush(new PlannedGoal(learner, storedFocus));

        learnerService.getLearnerState(learnerId);
        assertThat(plannedGoals.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId)
                .containsExactly(storedFocus);

        newChat();
        assertThat(frontierIds(context())).contains(CHILD_OPENING).doesNotContain(PARENT_OPENING);
    }

    private void createLearner(boolean autoPilot) throws Exception {
        createLearner(autoPilot, "all-test");
    }

    private void createLearner(boolean autoPilot, String filterId) throws Exception {
        learnerId = "declared-unit-" + UUID.randomUUID();
        Learner learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum(COURSE);
        learner.setAutoPilot(autoPilot);
        learner.setStrictMode(true);
        learner.setLearningStrategy("SEQUENTIAL");
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                COURSE, Map.of("selected", true, "filterId", filterId),
                "__skillpilotPersonalizationFlow", Map.of("rootLandscapeId", COURSE,
                        "completedOptionIds", List.of(), "migrationCompleted", true))));
        learners.saveAndFlush(learner);
    }

    private void newChat() throws Exception {
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("en", "web-start"))
                .learningSessionId();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(session, "unused",
                List.of(new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
        JsonNode pending = context().path("completionContract").path("receiptCapability");
        if (pending.isTextual()) {
            read(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", pending.asText()));
        }
    }

    private List<String> focus(String unitTitle) throws Exception {
        JsonNode navigation = read(ClaudeV1Contract.TOOL_GET_NAVIGATION_OPTIONS, Map.of());
        JsonNode selection = StreamSupport.stream(navigation.path("navigationOptions").spliterator(), false)
                .filter(option -> unitTitle.equals(option.path("title").asText()))
                .findFirst().orElseThrow(() -> new AssertionError("Missing published focus " + unitTitle + " in " + navigation));
        List<String> goalIds = StreamSupport.stream(selection.path("goalIds").spliterator(), false)
                .map(JsonNode::asText).toList();
        write(ClaudeV1Contract.TOOL_SET_FOCUS, navigation, Map.of("goalIds", goalIds));
        return goalIds;
    }

    private JsonNode activatePublished(JsonNode context, String expectedGoalId) throws Exception {
        if (!expectedGoalId.equals(activeId(context))) {
            assertThat(frontierIds(context)).contains(expectedGoalId);
            write(ClaudeV1Contract.TOOL_SET_ACTIVE_GOAL, context, Map.of("goalId", expectedGoalId));
            context = context();
        }
        assertThat(activeId(context)).isEqualTo(expectedGoalId);
        return context;
    }

    private void complete(JsonNode context) throws Exception {
        write(ClaudeV1Contract.TOOL_SET_MASTERY, context, Map.of("goalId", activeId(context)));
    }

    private void assertBox(JsonNode context, int due, int total) {
        JsonNode step = context.path("cardStep");
        assertThat(step.path("dueCards").asInt(-1)).as("due with active %s in %s", activeId(context), step).isEqualTo(due);
        assertThat(step.path("boxCards").asInt(-1)).as("box size in %s", step).isEqualTo(total);
    }

    private void assertCardPriority(JsonNode context, boolean autoPilot) {
        assertThat(context.path("cardStep").path("instruction").asText())
                .contains(autoPilot ? "call practiceAction first" : "offer the flashcards as the first option");
    }

    private JsonNode openPractice(JsonNode context, String expectedCardId) {
        JsonNode action = context.path("cardStep").path("practiceAction");
        assertThat(action.path("tool").asText()).isEqualTo(ClaudeV1Contract.TOOL_START_MEMORY_PRACTICE);
        assertThat(practiceArguments(context).path("goalId").asText()).isEqualTo(DECK);
        var response = call(action.path("tool").asText(), arguments(action.path("arguments")));
        JsonNode component = mapper.valueToTree(response.meta().get("skillpilotMemoryCard"));
        assertThat(component.path("practiceScopeId").asText()).isEqualTo(practiceScope(context));
        JsonNode cards = component.path("cardBatch").path("cards");
        assertThat(ids(cards)).containsExactly(expectedCardId);
        return cards.get(0);
    }

    private void markKnown(JsonNode context, JsonNode card) throws Exception {
        write(ClaudeV1Contract.TOOL_REVIEW_MEMORY_PRACTICE_CARD, context, Map.of(
                "goalId", practiceArguments(context).path("goalId").asText(),
                "cardId", card.path("id").asText(),
                "reviewCapability", card.path("reviewCapability").asText(),
                "rating", "known"));
    }

    private void passRecall(JsonNode context, String expectedScope, String expectedCardId) throws Exception {
        JsonNode action = context.path("cardStep").path("checkAction");
        assertThat(action.path("tool").asText()).isEqualTo(ClaudeV1Contract.TOOL_START_VERIFIED_RECALL);
        JsonNode batch = read(action.path("tool").asText(), arguments(action.path("arguments")));
        JsonNode cards = batch.path("cards");
        assertThat(cards.size()).isEqualTo(1);
        String submittedCardId = cards.get(0).path("cardId").asText();
        assertThat(submittedCardId).isEqualTo(expectedCardId);
        String batchCapability = batch.path("batchCapability").asText();
        var claim = capabilities.verifyRecallBatchCapability(batchCapability, session, null, version(context));
        assertThat(claim.practiceScopeId()).isEqualTo(expectedScope);
        assertThat(claim.cardIds()).containsExactly(expectedCardId);
        JsonNode answers = read(ClaudeV1Contract.TOOL_GET_VERIFIED_RECALL_ANSWERS, Map.of("batchCapability", batchCapability));
        write(ClaudeV1Contract.TOOL_RECORD_VERIFIED_RECALL_RESULTS, context, Map.of(
                "gradingCapability", answers.path("gradingCapability").asText(),
                "results", List.of(Map.of("cardId", submittedCardId, "passed", true))));
    }

    private JsonNode context() throws Exception {
        return read(ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of());
    }

    private JsonNode write(String name, JsonNode context, Map<String, ?> extra) throws Exception {
        Map<String, Object> args = new LinkedHashMap<>(extra);
        args.put("expectedStateVersion", version(context));
        args.put("clientRequestId", UUID.randomUUID().toString());
        return read(name, args);
    }

    private JsonNode read(String name, Map<String, ?> args) throws Exception {
        var response = call(name, args);
        if (response.structuredContent() != null) return mapper.valueToTree(response.structuredContent());
        return mapper.readTree(((McpSchema.TextContent) response.content().getFirst()).text());
    }

    private McpSchema.CallToolResult call(String name, Map<String, ?> args) {
        Map<String, Object> request = new LinkedHashMap<>(args);
        request.put("learningSessionId", session);
        request.put("language", "en");
        var tool = adapter.toolSpecifications().stream().filter(spec -> name.equals(spec.tool().name())).findFirst().orElseThrow();
        var response = tool.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(name, request));
        assertThat(response.isError()).as("%s returned %s", name, response.content()).isFalse();
        return response;
    }

    private Map<String, Object> arguments(JsonNode node) {
        return mapper.convertValue(node, new TypeReference<>() {});
    }

    private static String activeId(JsonNode context) { return context.path("activeGoal").path("id").asText(); }
    private static long version(JsonNode context) { return context.path("stateVersion").asLong(-1); }
    private static List<String> frontierIds(JsonNode context) { return ids(context.path("frontier")); }
    private static JsonNode practiceArguments(JsonNode context) { return context.path("cardStep").path("practiceAction").path("arguments"); }
    private static String practiceScope(JsonNode context) { return practiceArguments(context).path("practiceScopeId").asText(); }

    private static List<String> ids(JsonNode entries) {
        return StreamSupport.stream(entries.spliterator(), false).map(entry -> entry.path("id").asText()).toList();
    }
}
