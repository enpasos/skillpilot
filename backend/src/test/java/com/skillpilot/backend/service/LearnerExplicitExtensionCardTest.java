package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.srs.SrsCardStateStore;
import com.skillpilot.backend.service.srs.SrsCardStateSummary;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.server.ResponseStatusException;

class LearnerExplicitExtensionCardTest {
    private static final String SUBJECT = "memory-regression-fixture";
    private static final String DECK = "fixture-deck";
    private static final String LEARNER = "extension-cards-fixture";
    private static final String REGULAR = "regular-understanding";
    private static final Instant PASSED_AT = Instant.parse("2026-10-20T08:00:00Z");

    @TempDir Path curriculum;
    private final ObjectMapper json = new ObjectMapper();
    private final Learner learner = new Learner();
    private final SrsCardStateStore state = mock(SrsCardStateStore.class);
    private final DeckResourceService decks = mock(DeckResourceService.class);
    private LearnerService service;

    @BeforeEach
    void prepare() throws Exception {
        Path canonical = Path.of("src/test/resources/srs-regression-curriculum/DE/Gymnasium/canonical/memory-regression.de.json");
        var subject = json.readValue(canonical.toFile(), SkillLandscape.class);
        Path views = Files.createDirectories(curriculum.resolve("DE/Gymnasium/composition-views"));
        Files.writeString(views.resolve("memory-extended.view.json"), """
                {
                  "$schema":"https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json",
                  "viewFormatVersion":"1.3",
                  "viewId":"memory-extended-gk",
                  "landscapeId":"memory-regression-fixture",
                  "language":"de",
                  "scope":{"schoolForm":"Gymnasium","stage":"SekII","courseProfile":"GK"},
                  "electionGroups":[{"id":"extras","label":"Vertiefung","labelEn":"Extension","origin":"skillpilot","minSelections":0}],
                  "rootNodes":[
                    {"kind":"goalEntry","goalId":"fixture-deck"},
                    {"kind":"goalEntry","goalId":"regular-understanding"},
                    {"kind":"structure","id":"elective","label":"Vertiefung","labelEn":"Extension",
                     "extension":{"id":"elective","groupId":"extras","previouslyRegular":true},
                     "children":[{"kind":"goalEntry","goalId":"other-understanding"}]}
                  ]
                }
                """);
        var landscapeProperties = new LandscapeProperties();
        landscapeProperties.setDirectory(curriculum.toString());
        var composition = new CompositionViewService(landscapeProperties, json);
        var landscapes = mock(LandscapeService.class);
        when(landscapes.getAll()).thenReturn(List.of(subject));
        when(landscapes.getById(SUBJECT)).thenReturn(subject);
        when(landscapes.getClosure(SUBJECT)).thenReturn(List.of(subject));
        when(landscapes.getClosure(eq(SUBJECT), anyString())).thenReturn(List.of(subject));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenReturn(SUBJECT);
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(invocation -> subject.getGoals().stream()
                .filter(goal -> goal.getId().equals(invocation.getArgument(0))).findFirst().orElse(null));

        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(SUBJECT);
        learner.setLearningState(LearningState.TEACHING);
        learner.setActiveGoalId(DECK);
        var learners = mock(LearnerRepository.class);
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.findBySkillpilotIdForUpdate(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.existsById(LEARNER)).thenReturn(true);
        var mastery = mock(MasteryRepository.class);
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of(new Mastery(learner, REGULAR, 1.0)));
        var mappings = mock(GoalMappingService.class);
        when(mappings.getAllMappings()).thenReturn(List.of());
        service = new LearnerService(learners, mock(LearnerClientStateRepository.class), mastery,
                mock(PlannedGoalRepository.class), landscapes, mappings, decks, composition, json,
                mock(ApplicationEventPublisher.class), mock(PlatformTransactionManager.class));
        ReflectionTestUtils.setField(service, "cardStateStore", state);
    }

    @Test
    void changingExtensionScopeKeepsAnOldPassButAnEmptyDeckIsNotOffered() throws Exception {
        deck("""
                {"cards":[{"id":"elective","front":"Q","back":"A","originGoalIds":["other-understanding"]}]}
                """);
        var archived = Map.<String, Object>of("id", "elective", "verifiedRecall",
                Map.of("status", "passed", "passedAt", PASSED_AT.toString()));
        when(state.loadNode(LEARNER, DECK))
                .thenReturn(new SrsCardStateStore.NodeState(PASSED_AT, Map.of("elective", archived), null, null));
        when(state.summaries(eq(LEARNER), anyCollection()))
                .thenReturn(Map.of(DECK, new SrsCardStateStore.NodeSummary(null,
                        Map.of("elective", SrsCardStateSummary.of(archived)))));

        choose(null);
        assertThat(service.getMastery(LEARNER)).containsEntry(DECK, 1.0);
        assertThat(service.getClientState(LEARNER, DECK).excludedCardIds()).isEmpty();

        choose(List.of());
        assertThat(service.getMastery(LEARNER)).containsEntry(DECK, 0.0);
        var base = service.getClientState(LEARNER, DECK);
        assertThat(base.excludedCardIds()).containsExactly("elective");
        assertThat(base.srsState()).containsEntry("elective", archived);
        assertThatThrownBy(() -> service.startVerifiedRecallBatch(LEARNER, "de", DECK))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        failure -> assertThat(failure.getStatusCode().value()).isEqualTo(409));

        choose("maximum");
        assertThat(service.getMastery(LEARNER)).containsEntry(DECK, 1.0);
        var maximum = service.getClientState(LEARNER, DECK);
        assertThat(maximum.excludedCardIds()).isEmpty();
        assertThat(maximum.srsState()).containsEntry("elective", archived);
        verify(state, never()).replaceNode(anyString(), anyString(), anyMap(), any());
        verify(state, never()).updateCards(anyString(), anyString(), anyList(), any(), any());
    }

    @Test
    void mixedCardsStayInTheVerifiedRecallTotalAndUseTheirCountedOrigin() throws Exception {
        deck("""
                {"cards":[
                  {"id":"elective","front":"Q","back":"A","originGoalIds":["other-understanding"]},
                  {"id":"mixed","front":"Q","back":"A","originGoalIds":["regular-understanding","other-understanding"]}
                ]}
                """);
        choose(List.of());
        var base = service.startVerifiedRecallBatch(LEARNER, "de", DECK);
        assertThat(base.totalCards()).isOne();
        assertThat(base.cards()).extracting(VerifiedRecallPromptCard::cardId).containsExactly("mixed");

        choose("maximum");
        var maximum = service.startVerifiedRecallBatch(LEARNER, "de", DECK);
        assertThat(maximum.totalCards()).isEqualTo(2);
        assertThat(maximum.cards()).isEmpty();
    }

    private void deck(String source) {
        when(decks.resolveDeckResource(DECK, "/data/regression_fixture_deck.json"))
                .thenReturn(new ByteArrayResource(source.getBytes(StandardCharsets.UTF_8)));
    }

    private void choose(Object extensions) throws Exception {
        var entry = new LinkedHashMap<String, Object>();
        entry.put("selected", true);
        entry.put("filterId", "GK");
        entry.put("stage", "SekII");
        if (extensions != null) entry.put("extensionSelection", extensions);
        learner.setPersonalCurriculum(json.writeValueAsString(Map.of(SUBJECT, entry)));
    }
}
