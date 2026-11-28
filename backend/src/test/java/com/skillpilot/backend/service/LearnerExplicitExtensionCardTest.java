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
import com.skillpilot.backend.api.ClientStateRequest;
import com.skillpilot.backend.api.MemoryPracticeCard;
import com.skillpilot.backend.api.MemoryPracticeReviewRequest;
import com.skillpilot.backend.api.MemoryPracticeStartRequest;
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
import java.util.function.BiFunction;
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
    private static final String PEER = "peer-memory-fixture";
    private static final String PEER_DECK = "peer-deck";
    private static final String PEER_ELECTIVE = "peer-elective";
    private static final String REGULAR = "regular-understanding";
    private static final String ELECTIVE = "other-understanding";
    private static final Instant PASSED_AT = Instant.parse("2026-10-20T08:00:00Z");

    @TempDir Path curriculum;
    private final ObjectMapper json = new ObjectMapper();
    private final Learner learner = new Learner();
    private final SrsCardStateStore state = mock(SrsCardStateStore.class);
    private final DeckResourceService decks = mock(DeckResourceService.class);
    private final MasteryRepository mastery = mock(MasteryRepository.class);
    private LearnerService service;
    private LandscapeService landscapes;
    private SkillLandscape subject;

    @BeforeEach
    void prepare() throws Exception {
        Path canonical = Path.of("src/test/resources/srs-regression-curriculum/DE/Gymnasium/canonical/memory-regression.de.json");
        subject = json.readValue(canonical.toFile(), SkillLandscape.class);
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
                    {"kind":"goalEntry","goalId":"advanced-target"},
                    {"kind":"structure","id":"elective","label":"Vertiefung","labelEn":"Extension",
                     "extension":{"id":"elective","groupId":"extras","previouslyRegular":true},
                     "children":[
                       {"kind":"goalEntry","goalId":"other-understanding"},
                       {"kind":"goalEntry","goalId":"preparation-understanding"},
                       {"kind":"goalEntry","goalId":"regular-understanding"}
                     ]}
                  ]
                }
                """);
        var landscapeProperties = new LandscapeProperties();
        landscapeProperties.setDirectory(curriculum.toString());
        var composition = new CompositionViewService(landscapeProperties, json);
        landscapes = mock(LandscapeService.class);
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
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of(new Mastery(learner, REGULAR, 1.0)));
        var mappings = mock(GoalMappingService.class);
        when(mappings.getAllMappings()).thenReturn(List.of());
        service = new LearnerService(learners, mock(LearnerClientStateRepository.class), mastery,
                mock(PlannedGoalRepository.class), landscapes, mappings, decks, composition, json,
                mock(ApplicationEventPublisher.class), mock(PlatformTransactionManager.class));
        when(state.loadNode(eq(LEARNER), anyString()))
                .thenReturn(new SrsCardStateStore.NodeState(null, Map.of(), null, null));
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
        assertThat(base.lockedCardIds()).containsExactly("elective");
        assertThat(base.srsState()).containsEntry("elective", archived);
        assertThatThrownBy(() -> service.startVerifiedRecallBatch(LEARNER, "de", DECK))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        failure -> assertThat(failure.getStatusCode().value()).isEqualTo(409));
        assertThatThrownBy(() -> service.startMemoryPractice(LEARNER, "de", new MemoryPracticeStartRequest(DECK)))
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
    void countedDeckMatchesLegacyAtMaximumAndBasisOnlyDropsExclusivelyRemovedOrigins() throws Exception {
        deck("""
                {"cards":[
                  {"id":"elective","front":"Q","back":"A","originGoalIds":["other-understanding"]},
                  {"id":"mixed","front":"Q","back":"A","originGoalIds":["regular-understanding","other-understanding"]},
                  {"id":"outside","front":"Q","back":"A","originGoalIds":["outside-understanding"]},
                  {"id":"mixed-outside","front":"Q","back":"A","originGoalIds":["other-understanding","outside-understanding"]},
                  {"id":"no-origin","front":"Q","back":"A"},
                  {"id":"retained-preparation","front":"Q","back":"A","originGoalIds":["preparation-understanding"]},
                  {"id":"retained-placement","front":"Q","back":"A","originGoalIds":["regular-understanding"]}
                ]}
                """);
        choose(null);
        var legacy = service.startVerifiedRecallBatch(LEARNER, "de", DECK);
        var legacySnapshot = service.getClientState(LEARNER, DECK);
        assertThat(legacy.totalCards()).isEqualTo(7);
        assertThat(legacySnapshot.excludedCardIds()).isEmpty();

        choose(List.of());
        var base = service.startVerifiedRecallBatch(LEARNER, "de", DECK);
        assertThat(base.totalCards()).isEqualTo(6);
        assertThat(base.cards()).extracting(VerifiedRecallPromptCard::cardId)
                .containsExactly("mixed", "outside", "mixed-outside", "no-origin", "retained-placement");
        var baseSnapshot = service.getClientState(LEARNER, DECK);
        assertThat(baseSnapshot.excludedCardIds()).containsExactly("elective");
        assertThat(baseSnapshot.lockedCardIds()).containsExactly("elective", "retained-preparation");

        choose("maximum");
        var maximum = service.startVerifiedRecallBatch(LEARNER, "de", DECK);
        var maximumSnapshot = service.getClientState(LEARNER, DECK);
        assertThat(maximum.totalCards()).isEqualTo(legacy.totalCards());
        assertThat(maximum.cards()).extracting(VerifiedRecallPromptCard::cardId)
                .containsExactlyElementsOf(legacy.cards().stream().map(VerifiedRecallPromptCard::cardId).toList());
        assertThat(maximumSnapshot.excludedCardIds()).isEqualTo(legacySnapshot.excludedCardIds());
        assertThat(maximumSnapshot.lockedCardIds()).isEqualTo(legacySnapshot.lockedCardIds());
    }

    @Test
    void maximumKeepsItsDeckWhenANeighborChoosesBasis() throws Exception {
        var peer = json.readValue("""
                {"landscapeId":"peer-memory-fixture","frameworkId":"canonical-gymnasium-peer-fixture","goals":[
                  {"id":"peer-deck","title":"Peer deck","type":"atomic","nodeKind":"memory",
                   "extendedData":{"vocabularySource":"/data/regression_fixture_deck.json"}},
                  {"id":"peer-elective","title":"Peer elective","type":"atomic"}
                ]}
                """, SkillLandscape.class);
        Files.writeString(curriculum.resolve("DE/Gymnasium/composition-views/peer.view.json"), """
                {
                  "$schema":"https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json",
                  "viewFormatVersion":"1.3",
                  "viewId":"peer-gk",
                  "landscapeId":"peer-memory-fixture",
                  "language":"de",
                  "scope":{"schoolForm":"Gymnasium","stage":"SekII","courseProfile":"GK"},
                  "electionGroups":[{"id":"extras","label":"Vertiefung","labelEn":"Extension","origin":"skillpilot","minSelections":0}],
                  "rootNodes":[
                    {"kind":"goalEntry","goalId":"peer-deck"},
                    {"kind":"structure","id":"peer-extra","label":"Vertiefung","labelEn":"Extension",
                     "extension":{"id":"peer-extra","groupId":"extras","previouslyRegular":true},
                     "children":[{"kind":"goalEntry","goalId":"peer-elective"}]}
                  ]
                }
                """);
        var closure = List.of(subject, peer);
        when(landscapes.getAll()).thenReturn(closure);
        when(landscapes.getById(PEER)).thenReturn(peer);
        when(landscapes.getClosure(SUBJECT)).thenReturn(closure);
        when(landscapes.getClosure(eq(SUBJECT), anyString())).thenReturn(closure);
        when(landscapes.getLandscapeIdForGoal(PEER_DECK)).thenReturn(PEER);
        when(landscapes.getLandscapeIdForGoal(PEER_ELECTIVE)).thenReturn(PEER);
        String crossSubjectDeck = """
                {"cards":[{"id":"peer-origin","front":"Q","back":"A","originGoalIds":["peer-elective"]}]}
                """;
        deck(crossSubjectDeck);
        when(decks.resolveDeckResource(PEER_DECK, "/data/regression_fixture_deck.json"))
                .thenReturn(new ByteArrayResource(crossSubjectDeck.getBytes(StandardCharsets.UTF_8)));
        var peerBasis = Map.of("selected", true, "filterId", "GK", "stage", "SekII", "extensionSelection", List.of());

        learner.setPersonalCurriculum(json.writeValueAsString(Map.of(SUBJECT, subjectSettings(null), PEER, peerBasis)));
        var legacy = service.startVerifiedRecallBatch(LEARNER, "de", DECK);
        assertThat(legacy.totalCards()).isOne();
        assertThat(service.getClientState(LEARNER, PEER_DECK).excludedCardIds()).containsExactly("peer-origin");

        learner.setPersonalCurriculum(json.writeValueAsString(Map.of(SUBJECT, subjectSettings("maximum"), PEER, peerBasis)));
        assertThat(service.getClientState(LEARNER, DECK).excludedCardIds()).isEmpty();
        var maximum = service.startVerifiedRecallBatch(LEARNER, "de", DECK);
        assertThat(maximum.totalCards()).isEqualTo(legacy.totalCards());
        assertThat(maximum.cards()).extracting(VerifiedRecallPromptCard::cardId).containsExactly("peer-origin");
    }

    @Test
    void cockpitSyncPreservesTheScheduleOfAnExcludedCard() throws Exception {
        deck("""
                {"cards":[
                  {"id":"elective","front":"Q","back":"A","originGoalIds":["other-understanding"]},
                  {"id":"regular","front":"Q","back":"A","originGoalIds":["regular-understanding"]}
                ]}
                """);
        choose(List.of());
        var archived = Map.<String, Object>of("id", "elective", "interval", 6, "repetition", 2);
        when(state.loadNode(LEARNER, DECK))
                .thenReturn(new SrsCardStateStore.NodeState(PASSED_AT, Map.of("elective", archived), null, null));

        var regular = Map.of("id", "regular", "interval", 1);
        var stale = Map.of("id", "elective", "interval", 1);
        service.upsertClientState(LEARNER, DECK,
                new ClientStateRequest(PASSED_AT, Map.of("regular", regular, "elective", stale), PASSED_AT));

        verify(state).replaceNode(eq(LEARNER), eq(DECK), eq(Map.of("elective", archived, "regular", regular)), any());
    }

    @Test
    void coachPracticeRejectsARatingWhileExcludedAndUsesTheOriginalScheduleWhenReselected() throws Exception {
        deck("""
                {"cards":[{"id":"elective","front":"Q","back":"A","originGoalIds":["other-understanding"]}]}
                """);
        when(mastery.findByLearner_SkillpilotId(LEARNER))
                .thenReturn(List.of(new Mastery(learner, ELECTIVE, 1.0)));
        var archived = Map.<String, Object>of("id", "elective", "interval", 6, "repetition", 2, "ef", 2.5);
        when(state.summaries(eq(LEARNER), anyCollection()))
                .thenReturn(Map.of(DECK, new SrsCardStateStore.NodeSummary(null,
                        Map.of("elective", SrsCardStateSummary.of(archived)))));
        when(state.updateCards(eq(LEARNER), eq(DECK), eq(List.of("elective")), any(), any()))
                .thenAnswer(invocation -> {
                    BiFunction<String, Map<String, Object>, Map<String, Object>> update = invocation.getArgument(3);
                    Map<String, Object> saved = update.apply("elective", new LinkedHashMap<>(archived));
                    assertThat(saved).containsEntry("repetition", 3).containsEntry("interval", 15);
                    return Map.of("elective", saved);
                });
        var start = new MemoryPracticeStartRequest(DECK);
        var rating = new MemoryPracticeReviewRequest(DECK, "elective", "known");

        choose("maximum");
        assertThat(service.startMemoryPractice(LEARNER, "de", start).cards())
                .extracting(MemoryPracticeCard::cardId).containsExactly("elective");

        choose(List.of());
        assertThatThrownBy(() -> service.reviewMemoryPracticeCard(LEARNER, "de", rating))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        failure -> assertThat(failure.getStatusCode().value()).isEqualTo(409));
        verify(state, never()).updateCards(anyString(), anyString(), anyList(), any(), any());

        choose("maximum");
        var result = service.reviewMemoryPracticeCard(LEARNER, "de", rating);
        assertThat(result.status()).isEqualTo("complete");
        assertThat(result.progress().dueCards()).isZero();
        verify(state).updateCards(eq(LEARNER), eq(DECK), eq(List.of("elective")), any(), any());
    }

    private void deck(String source) {
        when(decks.resolveDeckResource(DECK, "/data/regression_fixture_deck.json"))
                .thenReturn(new ByteArrayResource(source.getBytes(StandardCharsets.UTF_8)));
    }

    private void choose(Object extensions) throws Exception {
        learner.setPersonalCurriculum(json.writeValueAsString(Map.of(SUBJECT, subjectSettings(extensions))));
    }

    private Map<String, Object> subjectSettings(Object extensions) {
        var entry = new LinkedHashMap<String, Object>();
        entry.put("selected", true);
        entry.put("filterId", "GK");
        entry.put("stage", "SekII");
        if (extensions != null) entry.put("extensionSelection", extensions);
        return entry;
    }
}
