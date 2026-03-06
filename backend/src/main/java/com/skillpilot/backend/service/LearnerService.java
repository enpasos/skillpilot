package com.skillpilot.backend.service;

import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerClientStateId;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.domain.PlannedGoal;
import java.time.Instant;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.events.LearnerStateChangedEvent;
import org.springframework.context.ApplicationEventPublisher;
import com.skillpilot.backend.landscape.LearningLandscape;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.io.InputStream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.CreateLearnerRequest;
import com.skillpilot.backend.api.ClientStateRequest;
import com.skillpilot.backend.api.ClientStateResponse;
import com.skillpilot.backend.api.ClientStateSnapshot;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.LearnerDataDTO;
import com.skillpilot.backend.api.MasteryEntryDTO;
import com.skillpilot.backend.api.SignedLearnerDataDTO;
import com.skillpilot.backend.api.StateMachineInfo;
import org.springframework.beans.factory.annotation.Value;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import com.fasterxml.jackson.core.type.TypeReference;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.core.io.Resource;

@Service
public class LearnerService {

    private final LearnerRepository learnerRepository;
    private final LearnerClientStateRepository learnerClientStateRepository;
    private final MasteryRepository masteryRepository;
    private final PlannedGoalRepository plannedGoalRepository;
    private final LandscapeService landscapeService;
    private final DeckResourceService deckResourceService;

    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;

    private static final Set<String> SRS_FILTER_EXCLUDE = Set.of(
            "structure",
            "root",
            "module",
            "lesson",
            "vocabulary",
            "grammar",
            "practice",
            "A1",
            "A2",
            "B1",
            "B2",
            "C1",
            "C2");

    @Value("${skillpilot.security.signing-secret}")
    private String signingSecret;

    public LearnerService(
            LearnerRepository learnerRepository,
            LearnerClientStateRepository learnerClientStateRepository,
            MasteryRepository masteryRepository,
            PlannedGoalRepository plannedGoalRepository,
            LandscapeService landscapeService,
            DeckResourceService deckResourceService,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher) {
        this.learnerRepository = learnerRepository;
        this.learnerClientStateRepository = learnerClientStateRepository;
        this.masteryRepository = masteryRepository;
        this.plannedGoalRepository = plannedGoalRepository;
        this.landscapeService = landscapeService;
        this.deckResourceService = deckResourceService;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
    }

    private static final class SrsCard {
        private final String id;
        private final List<String> tags;

        private SrsCard(String id, List<String> tags) {
            this.id = id;
            this.tags = tags;
        }
    }

    private static Long parseNextReview(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text) {
            String trimmed = text.trim();
            if (trimmed.isEmpty()) {
                return null;
            }
            try {
                return Long.parseLong(trimmed);
            } catch (NumberFormatException ignored) {
                // Fallback to ISO-8601 timestamp.
            }
            try {
                return Instant.parse(trimmed).toEpochMilli();
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    private boolean isSrsGoal(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        Map<String, Object> extended = goal.getExtendedData();
        if (extended != null && extended.get("vocabularySource") instanceof String) {
            return true;
        }
        List<String> tags = goal.getTags();
        if (tags == null) {
            return false;
        }
        for (String tag : tags) {
            if (tag == null) {
                continue;
            }
            if (tag.startsWith("srs-deck") || "memorization".equals(tag)) {
                return true;
            }
        }
        return false;
    }

    private String getVocabularySource(LearningGoal goal) {
        if (goal == null) {
            return null;
        }
        Map<String, Object> extended = goal.getExtendedData();
        if (extended == null) {
            return null;
        }
        Object source = extended.get("vocabularySource");
        return source instanceof String ? (String) source : null;
    }

    private List<String> getSrsFilterTags(LearningGoal goal) {
        List<String> tags = goal != null ? goal.getTags() : null;
        if (tags == null || tags.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> selectTags = new ArrayList<>();
        for (String tag : tags) {
            if (tag != null && tag.startsWith("select:")) {
                selectTags.add(tag);
            }
        }
        if (!selectTags.isEmpty()) {
            return selectTags;
        }
        List<String> filtered = new ArrayList<>();
        for (String tag : tags) {
            if (tag == null) {
                continue;
            }
            if (tag.startsWith("srs-deck")) {
                continue;
            }
            if (SRS_FILTER_EXCLUDE.contains(tag)) {
                continue;
            }
            filtered.add(tag);
        }
        return filtered;
    }

    private List<SrsCard> loadSrsDeckCards(String vocabularySource) {
        if (vocabularySource == null || vocabularySource.isBlank()) {
            return Collections.emptyList();
        }
        Resource resource = deckResourceService.resolveDeckResource(vocabularySource);
        if (resource == null || !resource.exists()) {
            return Collections.emptyList();
        }
        try (InputStream inputStream = resource.getInputStream()) {
            Map<String, Object> data = objectMapper.readValue(
                    inputStream,
                    new TypeReference<Map<String, Object>>() {
                    });
            Object cardsObj = data.get("cards");
            if (!(cardsObj instanceof List<?> cardsRaw)) {
                return Collections.emptyList();
            }
            List<SrsCard> cards = new ArrayList<>();
            for (Object raw : cardsRaw) {
                if (!(raw instanceof Map<?, ?> cardMap)) {
                    continue;
                }
                Object idObj = cardMap.get("id");
                if (idObj == null) {
                    continue;
                }
                String id = String.valueOf(idObj);
                Object tagsObj = cardMap.get("tags");
                List<String> tags = null;
                if (tagsObj instanceof List<?> tagList) {
                    List<String> collected = new ArrayList<>();
                    for (Object tag : tagList) {
                        if (tag != null) {
                            collected.add(String.valueOf(tag));
                        }
                    }
                    tags = collected;
                }
                cards.add(new SrsCard(id, tags));
            }
            return cards;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private Map<String, Object> loadSrsState(String skillpilotId, String nodeId) {
        LearnerClientStateId id = new LearnerClientStateId(skillpilotId, nodeId);
        LearnerClientState stored = learnerClientStateRepository.findById(id).orElse(null);
        if (stored == null || stored.getClientState() == null || stored.getClientState().isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(
                    stored.getClientState(),
                    new TypeReference<Map<String, Object>>() {
                    });
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private boolean isSrsMasteredToday(List<SrsCard> cards, Map<String, Object> srsState, long now) {
        if (cards == null || cards.isEmpty()) {
            return false;
        }
        if (srsState == null || srsState.isEmpty()) {
            return false;
        }
        for (SrsCard card : cards) {
            Object rawState = srsState.get(card.id);
            if (!(rawState instanceof Map<?, ?> stateMap)) {
                return false;
            }
            Object nextReviewValue = stateMap.get("nextReview");
            Long nextReview = parseNextReview(nextReviewValue);
            if (nextReview == null || nextReview <= now) {
                return false;
            }
        }
        return true;
    }

    private Map<String, Double> applySrsMasteryOverlay(String skillpilotId,
            Map<String, LearningGoal> goals,
            Map<String, Double> mastery) {
        if (goals == null || goals.isEmpty()) {
            return mastery;
        }
        Map<String, Double> result = new HashMap<>(mastery);
        long now = System.currentTimeMillis();
        for (LearningGoal goal : goals.values()) {
            if (!isSrsGoal(goal)) {
                continue;
            }
            String source = getVocabularySource(goal);
            if (source == null || source.isBlank()) {
                continue;
            }
            List<SrsCard> cards = loadSrsDeckCards(source);
            if (cards.isEmpty()) {
                result.put(goal.getId(), 0.0);
                continue;
            }
            List<String> filterTags = getSrsFilterTags(goal);
            List<SrsCard> filtered = cards;
            if (!filterTags.isEmpty()) {
                filtered = cards.stream()
                        .filter(card -> card.tags != null
                                && card.tags.stream().anyMatch(filterTags::contains))
                        .collect(Collectors.toList());
            }
            if (filtered.isEmpty()) {
                result.put(goal.getId(), 0.0);
                continue;
            }
            Map<String, Object> srsState = loadSrsState(skillpilotId, goal.getId());
            boolean masteredToday = isSrsMasteredToday(filtered, srsState, now);
            result.put(goal.getId(), masteredToday ? 1.0 : 0.0);
        }
        return result;
    }

    /**
     * Count how many SRS/flashcard goals in the given set are mastered by the user.
     * Used by CurriculaService for champion mastery counting.
     *
     * @param skillpilotId the user's skillpilot ID
     * @param goalIds      the set of goal IDs to check
     * @return count of mastered SRS goals
     */
    public long countSrsMastery(String skillpilotId, Set<String> goalIds) {
        if (skillpilotId == null || goalIds == null || goalIds.isEmpty()) {
            return 0;
        }
        long count = 0;
        long now = System.currentTimeMillis();
        for (String goalId : goalIds) {
            LearningGoal goal = landscapeService.getGoalDefinition(goalId);
            if (goal == null || !isSrsGoal(goal)) {
                continue;
            }
            String source = getVocabularySource(goal);
            if (source == null || source.isBlank()) {
                continue;
            }
            List<SrsCard> cards = loadSrsDeckCards(source);
            if (cards.isEmpty()) {
                continue;
            }
            List<String> filterTags = getSrsFilterTags(goal);
            List<SrsCard> filtered = cards;
            if (!filterTags.isEmpty()) {
                filtered = cards.stream()
                        .filter(card -> card.tags != null
                                && card.tags.stream().anyMatch(filterTags::contains))
                        .collect(Collectors.toList());
            }
            if (filtered.isEmpty()) {
                continue;
            }
            Map<String, Object> srsState = loadSrsState(skillpilotId, goalId);
            if (isSrsMasteredToday(filtered, srsState, now)) {
                count++;
            }
        }
        return count;
    }

    private Map<String, MasteryEntryDTO> applySrsMasteryOverlayWithTimestamps(String skillpilotId,
            Map<String, LearningGoal> goals,
            Map<String, MasteryEntryDTO> mastery) {
        if (goals == null || goals.isEmpty()) {
            return mastery;
        }
        Map<String, MasteryEntryDTO> result = new HashMap<>(mastery);
        long now = System.currentTimeMillis();
        Instant nowInstant = Instant.ofEpochMilli(now);
        for (LearningGoal goal : goals.values()) {
            if (!isSrsGoal(goal)) {
                continue;
            }
            String source = getVocabularySource(goal);
            if (source == null || source.isBlank()) {
                continue;
            }
            List<SrsCard> cards = loadSrsDeckCards(source);
            if (cards.isEmpty()) {
                result.put(goal.getId(), new MasteryEntryDTO(0.0, nowInstant));
                continue;
            }
            List<String> filterTags = getSrsFilterTags(goal);
            List<SrsCard> filtered = cards;
            if (!filterTags.isEmpty()) {
                filtered = cards.stream()
                        .filter(card -> card.tags != null
                                && card.tags.stream().anyMatch(filterTags::contains))
                        .collect(Collectors.toList());
            }
            if (filtered.isEmpty()) {
                result.put(goal.getId(), new MasteryEntryDTO(0.0, nowInstant));
                continue;
            }
            Map<String, Object> srsState = loadSrsState(skillpilotId, goal.getId());
            boolean masteredToday = isSrsMasteredToday(filtered, srsState, now);
            result.put(goal.getId(), new MasteryEntryDTO(masteredToday ? 1.0 : 0.0, nowInstant));
        }
        return result;
    }

    @Transactional
    public Learner createLearner(CreateLearnerRequest request) {
        Learner learner = new Learner();
        learner.setSkillpilotId(UUID.randomUUID().toString());
        learner.setLearningState(LearningState.FRONTIER);
        learner.setActiveGoalId(null);

        return learnerRepository.save(learner);
    }

    @Transactional
    public Learner createLearner() {
        return createLearner(null);
    }

    @Transactional(readOnly = true)
    public ClientStateSnapshot getClientState(String skillpilotId, String nodeId) {
        ensureLearnerExists(skillpilotId);
        LearnerClientStateId id = new LearnerClientStateId(skillpilotId, nodeId);
        LearnerClientState stored = learnerClientStateRepository.findById(id).orElse(null);

        Map<String, Object> state = Collections.emptyMap();
        Instant updatedAt = null;
        if (stored != null && stored.getClientState() != null && !stored.getClientState().isBlank()) {
            try {
                state = objectMapper.readValue(
                        stored.getClientState(),
                        new TypeReference<Map<String, Object>>() {
                        });
                updatedAt = stored.getClientStateUpdatedAt();
            } catch (Exception e) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                        "Stored client state is invalid");
            }
        }

        return new ClientStateSnapshot(updatedAt, state);
    }

    @Transactional
    public ClientStateResponse upsertClientState(String skillpilotId, String nodeId, ClientStateRequest request) {
        Learner learner = learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));

        if (request == null) {
            return new ClientStateResponse("ok", Instant.now(), 0);
        }

        Instant incomingAt = request.updatedAt() != null ? request.updatedAt() : Instant.now();
        LearnerClientStateId id = new LearnerClientStateId(skillpilotId, nodeId);
        LearnerClientState existing = learnerClientStateRepository.findById(id).orElse(null);
        if (existing != null && existing.getClientStateUpdatedAt() != null
                && request.updatedAt() != null && request.updatedAt().isBefore(existing.getClientStateUpdatedAt())) {
            return new ClientStateResponse("ok", existing.getClientStateUpdatedAt(), 0);
        }

        String json = "{}";
        int storedKeys = 0;
        if (request.srsState() != null) {
            try {
                json = objectMapper.writeValueAsString(request.srsState());
            } catch (Exception e) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Invalid client state payload");
            }
            storedKeys = request.srsState().size();
        }

        LearnerClientState record = existing != null
                ? existing
                : new LearnerClientState(learner, nodeId, json, incomingAt);
        record.setClientState(json);
        record.setClientStateUpdatedAt(incomingAt);
        learnerClientStateRepository.save(record);

        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "CLIENT_STATE_UPDATED", nodeId));
        return new ClientStateResponse("ok", Instant.now(), storedKeys);
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getMastery(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        List<Mastery> mastered = masteryRepository.findByLearner_SkillpilotId(skillpilotId);
        Map<String, Double> result = new HashMap<>();
        for (Mastery m : mastered) {
            result.put(m.getGoalKey(), m.getValue());
        }
        String curriculumId = learner.getSelectedCurriculum();
        Map<String, LearningGoal> goals = Collections.emptyMap();
        if (curriculumId != null) {
            goals = getFilteredGoals(curriculumId, learner.getPersonalCurriculum());
        }
        return applySrsMasteryOverlay(skillpilotId, goals, result);
    }

    @Transactional(readOnly = true)
    public Map<String, MasteryEntryDTO> getMasteryWithTimestamps(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        List<Mastery> mastered = masteryRepository.findByLearner_SkillpilotId(skillpilotId);
        Map<String, MasteryEntryDTO> result = new HashMap<>();
        for (Mastery m : mastered) {
            result.put(m.getGoalKey(), new MasteryEntryDTO(m.getValue(), m.getUpdatedAt()));
        }
        String curriculumId = learner.getSelectedCurriculum();
        Map<String, LearningGoal> goals = Collections.emptyMap();
        if (curriculumId != null) {
            goals = getFilteredGoals(curriculumId, learner.getPersonalCurriculum());
        }
        return applySrsMasteryOverlayWithTimestamps(skillpilotId, goals, result);
    }

    @Transactional
    public MasteryUpdateResponse setMastery(String skillpilotId, MasteryUpdateRequest request) {
        Learner learner = learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));

        String activeGoalId = learner.getActiveGoalId();
        String requestedGoalId = request.goalId();
        Map.Entry<String, Double> masteryEntry = null;
        if (request.mastery() != null && request.mastery().size() == 1) {
            masteryEntry = request.mastery().entrySet().iterator().next();
        }
        if ((requestedGoalId == null || requestedGoalId.isBlank()) && masteryEntry != null) {
            requestedGoalId = masteryEntry.getKey();
        }

        String effectiveGoalId = (activeGoalId != null && !activeGoalId.isBlank())
                ? activeGoalId
                : requestedGoalId;

        if (effectiveGoalId == null || effectiveGoalId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "No active goal selected and no goalId provided.");
        }

        if (activeGoalId == null || activeGoalId.isBlank()) {
            List<FrontierGoal> frontierAtomic = filterAtomicFrontier(getRichFrontier(skillpilotId));
            boolean allowed = frontierAtomic.stream().anyMatch(goal -> goal.id().equals(effectiveGoalId));
            if (!allowed) {
                Map<String, Double> masterySnapshot = getMastery(skillpilotId);
                double currentMastery = masterySnapshot.getOrDefault(effectiveGoalId, 0.0);
                boolean explicitCorrection = masteryEntry != null
                        && masteryEntry.getValue() != null
                        && effectiveGoalId.equals(masteryEntry.getKey())
                        && masteryEntry.getValue() < currentMastery;

                // Allow explicit correction (e.g. reset from 1.0 to 0.0) even if the goal
                // is currently outside the frontier.
                if (explicitCorrection) {
                    // continue with save flow
                } else if (currentMastery >= 0.9) {
                    UnifiedLearnerStateResponse state = getLearnerState(skillpilotId);
                    return new MasteryUpdateResponse(
                            state.frontier(),
                            state.nextAllowedActions(),
                            state.learningState(),
                            state.activeGoal(),
                            state.stateMachine(),
                            state.goals());
                } else {
                    throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                            "goalId must be an atomic goal from the current frontier.");
                }
            }
        }

        double masteryValue = 1.0;
        if (masteryEntry != null && effectiveGoalId.equals(masteryEntry.getKey()) && masteryEntry.getValue() != null) {
            masteryValue = masteryEntry.getValue();
        }

        // Prevent mastery on Cluster Goals (goals that contain other goals)
        com.skillpilot.backend.landscape.LearningGoal def = landscapeService.getGoalDefinition(effectiveGoalId);
        if (def != null && def.getContains() != null && !def.getContains().isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Cannot set mastery on cluster goals. Select an atomic goal first.");
        }

        MasteryId id = new MasteryId(skillpilotId, effectiveGoalId);
        double resolvedMasteryValue = masteryValue;
        Mastery mastery = masteryRepository.findById(id)
                .orElseGet(() -> new Mastery(learner, effectiveGoalId, resolvedMasteryValue));
        mastery.setValue(masteryValue);
        masteryRepository.save(mastery);

        // Clear active goal after mastery and return the new frontier/state
        learner.setActiveGoalId(null);
        learner.setLearningState(LearningState.FRONTIER);
        learnerRepository.save(learner);

        UnifiedLearnerStateResponse state = getLearnerState(skillpilotId);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "MASTERY_UPDATE"));
        return new MasteryUpdateResponse(
                state.frontier(),
                state.nextAllowedActions(),
                state.learningState(),
                state.activeGoal(),
                state.stateMachine(),
                state.goals());
    }

    @Transactional(readOnly = true)
    public List<String> getPlannedGoals(String skillpilotId) {
        ensureLearnerExists(skillpilotId);
        return plannedGoalRepository.findByLearner_SkillpilotId(skillpilotId)
                .stream()
                .map(PlannedGoal::getGoalId)
                .toList();
    }

    @Transactional
    public List<String> setPlannedGoals(String skillpilotId, Set<String> goalIds) {
        Learner learner = learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));

        List<PlannedGoal> existing = plannedGoalRepository.findByLearner_SkillpilotId(skillpilotId);
        Set<String> existingIds = existing.stream().map(PlannedGoal::getGoalId).collect(Collectors.toSet());

        Set<String> targetIds = goalIds == null ? Collections.emptySet() : goalIds;
        Set<String> saneTargetIds = targetIds.stream()
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());

        List<PlannedGoal> toDelete = existing.stream()
                .filter(pg -> !saneTargetIds.contains(pg.getGoalId()))
                .toList();
        plannedGoalRepository.deleteAll(toDelete);

        List<PlannedGoal> toAdd = saneTargetIds.stream()
                .filter(id -> !existingIds.contains(id))
                .map(id -> new PlannedGoal(learner, id))
                .toList();
        plannedGoalRepository.saveAll(toAdd);

        // Validation: Verify Active Goal is still in Scope
        String activeGoalId = learner.getActiveGoalId();
        if (activeGoalId != null && !activeGoalId.isBlank()) {
            String curriculumId = learner.getSelectedCurriculum();
            if (curriculumId != null) {
                // Must rebuild context to compute scope
                Map<String, LearningGoal> allGoals = getFilteredGoals(curriculumId, learner.getPersonalCurriculum());
                Map<String, List<String>> effectiveRequires = computeEffectiveRequires(allGoals);
                List<String> newPlannedIds = new ArrayList<>(saneTargetIds); // Use the new set

                Set<String> newScope = computeScope(newPlannedIds, allGoals, effectiveRequires);

                // If scope is empty (Plan cleared), active goal is usually invalid unless it's
                // a top-level module?
                // But setActiveGoal restricts to atomic frontier.
                // If plan is cleared, we are in overview. Active goal should probably be
                // cleared to be safe.
                boolean inScope = newScope.contains(activeGoalId);

                if (!inScope) {
                    learner.setActiveGoalId(null);
                    learner.setLearningState(LearningState.FRONTIER);
                    learnerRepository.save(learner);
                    eventPublisher.publishEvent(
                            new LearnerStateChangedEvent(this, skillpilotId, "ACTIVE_GOAL_CLEARED_BY_SCOPE"));
                }
            }
        }

        return getPlannedGoals(skillpilotId);
    }

    @Transactional
    public void setPreferences(String skillpilotId, String learningStrategy, Boolean autoPilot, Boolean strictMode) {
        Learner learner = getLearner(skillpilotId);
        if (learningStrategy != null) {
            learner.setLearningStrategy(learningStrategy);
        }
        if (autoPilot != null) {
            learner.setAutoPilot(autoPilot);
        }
        if (strictMode != null) {
            learner.setStrictMode(strictMode);
        }
    }

    @Transactional(readOnly = true)
    public Learner getLearner(String skillpilotId) {
        return learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
    }

    @Transactional
    public void setCurriculum(String skillpilotId, String curriculumId) {
        if (landscapeService.getById(curriculumId) == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid curriculum ID: " + curriculumId);
        }
        Learner learner = getLearner(skillpilotId);
        boolean curriculumChanged = !Objects.equals(learner.getSelectedCurriculum(), curriculumId);
        learner.setSelectedCurriculum(curriculumId);
        if (curriculumChanged) {
            learner.setActiveGoalId(null);
        }
        learner.setLearningState(LearningState.FRONTIER);
        learnerRepository.save(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "CURRICULUM_UPDATE"));
    }

    @Transactional
    public void setPersonalCurriculum(String skillpilotId, Map<String, Object> config, List<String> goalIds,
            List<String> filters) {
        Learner learner = getLearner(skillpilotId);

        Map<String, Object> finalConfig = config != null ? new HashMap<>(config) : new HashMap<>();

        java.util.Set<String> targetLandscapes = new java.util.HashSet<>();
        java.util.List<String> effectiveFilters = new java.util.ArrayList<>();
        if (filters != null) {
            effectiveFilters.addAll(filters);
        }

        if (goalIds != null) { // Only process if goalIds is not null
            for (String gid : goalIds) {
                if (gid == null || gid.isBlank())
                    continue;

                // 1. Is it a Landscape ID?
                if (landscapeService.getById(gid) != null) {
                    targetLandscapes.add(gid);
                    continue;
                }

                // 2. Is it a Goal ID?
                String landscapeId = landscapeService.getLandscapeIdForGoal(gid);
                if (landscapeId != null) {
                    targetLandscapes.add(landscapeId);
                    continue;
                }

                // 3. Fallback: Treat as filter if NOT explicitly provided in filters list?
                // Ideally, we trust the explicit list. But for backward compat, maybe keeps?
                // Let's assume strict separation now given tool change.
                // But if GPT mixes them in goalIds despite instructions, we should catch them.
                effectiveFilters.add(gid);
            }
        }

        learner.setLearningState(LearningState.FRONTIER);

        // If we have filters but no specific landscapes, apply to current (Root)
        if (targetLandscapes.isEmpty() && !effectiveFilters.isEmpty()) {
            String current = learner.getSelectedCurriculum();
            if (current != null) {
                targetLandscapes.add(current);
            }
        }

        // Apply configuration
        for (String landscapeId : targetLandscapes) {
            Map<String, Object> settings = (Map<String, Object>) finalConfig.getOrDefault(landscapeId, new HashMap<>());
            settings.put("selected", true);
            if (!effectiveFilters.isEmpty()) {
                // Apply the first found filter (usually only one, e.g. "LK")
                settings.put("filterId", effectiveFilters.get(0));
            }
            finalConfig.put(landscapeId, settings);
        }

        try {
            String json = objectMapper.writeValueAsString(finalConfig);
            learner.setPersonalCurriculum(json);
            learnerRepository.save(learner);
        } catch (Exception e) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid personalization config");
        }
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "PERSONALIZATION_UPDATE"));
    }

    @Transactional(readOnly = true)
    public List<String> getFrontier(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return Collections.emptyList();
        }

        Map<String, LearningGoal> allGoals = getFilteredGoals(curriculumId, learner.getPersonalCurriculum());
        Map<String, List<String>> effectiveRequires = computeEffectiveRequires(allGoals);
        Map<String, Double> masteryMap = getMastery(skillpilotId);
        Map<String, Double> effectiveMastery = computeEffectiveMastery(allGoals, masteryMap);
        Map<String, Double> effectivePrereqMastery = computeEffectivePrereqMastery(allGoals, masteryMap);

        List<String> frontier = new ArrayList<>();
        for (LearningGoal goal : allGoals.values()) {
            Double currentMastery = effectiveMastery.getOrDefault(goal.getId(), 0.0);
            if (currentMastery >= 0.9) {
                continue; // Already mastered
            }

            boolean prerequisitesMet = true;
            List<String> requires = effectiveRequires.getOrDefault(goal.getId(), goal.getRequires());
            if (requires != null) {
                for (String reqId : requires) {
                    String resolvedReqId = resolveGoalRef(reqId, allGoals);
                    if (resolvedReqId == null) {
                        // Ignore prerequisites not present in the filtered goal set
                        continue;
                    }
                    Double reqMastery = effectivePrereqMastery.getOrDefault(resolvedReqId, 0.0);
                    if (reqMastery < 0.9) {
                        prerequisitesMet = false;
                        break;
                    }
                }
            }

            if (prerequisitesMet) {
                frontier.add(goal.getId());
            }
        }

        return frontier;
    }

    @Transactional(readOnly = true)
    public List<FrontierGoal> getRichFrontier(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return Collections.emptyList();
        }

        // Check if strict mode is enabled
        boolean strictMode = Boolean.TRUE.equals(learner.getStrictMode());

        // 1. Get Filtered Goals (for display/frontier candidates)
        Map<String, LearningGoal> allFilteredGoals = getFilteredGoals(curriculumId, learner.getPersonalCurriculum());

        // 2. Get Unfiltered Goals (for structural traversal / scope calculation)
        // We need the FULL structure to find descendants, even if the parent is
        // filtered out.
        Map<String, LearningGoal> allStructuralGoals = getFilteredGoals(curriculumId, "{}");

        Map<String, Double> masteryMap = getMastery(skillpilotId);
        // Optimistic mode: apply filters first, then evaluate requires/mastery
        Map<String, Double> effectiveMastery = computeEffectiveMastery(allFilteredGoals, masteryMap);
        Map<String, List<String>> effectiveRequires = computeEffectiveRequires(allFilteredGoals);
        Map<String, Double> effectivePrereqMastery = computeEffectivePrereqMastery(allFilteredGoals, masteryMap);

        // For strict mode: compute global effective requires and prereq mastery
        Map<String, List<String>> globalEffectiveRequires = strictMode
                ? computeEffectiveRequires(allStructuralGoals)
                : effectiveRequires;
        Map<String, Double> globalEffectivePrereqMastery = strictMode
                ? computeEffectivePrereqMastery(allStructuralGoals, masteryMap)
                : effectivePrereqMastery;

        // Calculate Scope (Plan + Descendants + Prerequisites)
        List<String> plannedIds = getPlannedGoals(skillpilotId);

        // CRITICAL FIX: Use Structural (Unfiltered) Goals for Scope!
        // This ensures that if the User plans a Parent that is currently "Hidden" by a
        // filter,
        // we still find its children and include them in the scope.
        Set<String> scope = computeScope(plannedIds, allStructuralGoals, effectiveRequires);

        System.out.println("DEBUG_SKILLPILOT: getRichFrontier - Plan: " + plannedIds);
        System.out.println("DEBUG_SKILLPILOT: getRichFrontier - Scope Size: " + scope.size());
        System.out.println("DEBUG_SKILLPILOT: getRichFrontier - Strict Mode: " + strictMode);
        if (!plannedIds.isEmpty() && scope.size() < 10) {
            System.out.println("DEBUG_SKILLPILOT: Scope Content: " + scope);
        }

        if (scope.isEmpty()) {
            // If scope is empty (even if plannedGoals has "Phantom" IDs), return the Top
            // Level Modules
            // This ensures we don't show an empty screen if the Plan refers to deleted
            // content.
            // (Subjects)
            return getTopLevelModules(learner.getSelectedCurriculum(), allFilteredGoals);
        }

        List<FrontierGoal> frontier = new ArrayList<>();

        // Iterate FILTERED goals (what the user should see)
        for (LearningGoal goal : allFilteredGoals.values()) {
            // Filter by Scope (calculated from Structural)
            if (!plannedIds.isEmpty() && !scope.contains(goal.getId())) {
                continue;
            }
            Double currentMastery = effectiveMastery.getOrDefault(goal.getId(), 0.0);
            if (currentMastery >= 0.9) {
                continue;
            }

            boolean prerequisitesMet = true;
            // In strict mode, use global requires; otherwise use filtered requires
            List<String> requires = strictMode
                    ? globalEffectiveRequires.getOrDefault(goal.getId(), goal.getRequires())
                    : effectiveRequires.getOrDefault(goal.getId(), goal.getRequires());
            if (requires != null) {
                for (String reqId : requires) {
                    // In strict mode, resolve against ALL structural goals
                    Map<String, LearningGoal> lookupMap = strictMode ? allStructuralGoals : allFilteredGoals;
                    String resolvedReqId = resolveGoalRef(reqId, lookupMap);
                    if (resolvedReqId == null) {
                        if (strictMode) {
                            // In strict mode, unknown prerequisite means blocked
                            prerequisitesMet = false;
                            break;
                        }
                        // Optimistic: ignore prerequisites that are filtered out or unknown
                        continue;
                    }

                    // In strict mode, do NOT skip out-of-scope prerequisites
                    if (!strictMode && !plannedIds.isEmpty() && !scope.contains(resolvedReqId)) {
                        // PRAGMATIC FILTERING (optimistic mode only):
                        // If a prerequisite is NOT in scope (and we have a restricted scope), ignore
                        // it.
                        continue;
                    }

                    // In strict mode, use global mastery; otherwise use filtered prereq mastery
                    Double reqMastery = strictMode
                            ? globalEffectivePrereqMastery.getOrDefault(resolvedReqId, 0.0)
                            : effectivePrereqMastery.getOrDefault(resolvedReqId, 0.0);
                    if (reqMastery < 0.9) {
                        prerequisitesMet = false;
                        break;
                    }
                }
            }

            if (prerequisitesMet) {
                frontier.add(toFrontierGoal(goal, "Prerequisites met", null));
            }
        }

        // Compaction Logic: If frontier is too large, prefer atomic goals for
        // actionable next steps.
        if (frontier.size() > 20) {
            List<FrontierGoal> atomic = frontier.stream()
                    .filter(g -> "atomic".equals(g.type()))
                    .toList();
            if (!atomic.isEmpty()) {
                return atomic.subList(0, Math.min(atomic.size(), 20));
            }

            List<FrontierGoal> clusters = frontier.stream()
                    .filter(g -> "cluster".equals(g.type()))
                    .toList();
            if (!clusters.isEmpty()) {
                return clusters.subList(0, Math.min(clusters.size(), 20));
            }

            return frontier.subList(0, Math.min(frontier.size(), 20));
        }

        return frontier;
    }

    private Map<String, Double> computeEffectiveMastery(Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap) {
        Map<String, Double> cache = new HashMap<>();
        Set<String> visiting = new HashSet<>();
        for (String goalId : allGoals.keySet()) {
            computeEffectiveMastery(goalId, allGoals, masteryMap, cache, visiting);
        }
        return cache;
    }

    private double computeEffectiveMastery(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap, Map<String, Double> cache, Set<String> visiting) {
        Double cached = cache.get(goalId);
        if (cached != null) {
            return cached;
        }
        if (visiting.contains(goalId)) {
            return masteryMap.getOrDefault(goalId, 0.0);
        }
        visiting.add(goalId);

        LearningGoal goal = allGoals.get(goalId);
        double mastery = masteryMap.getOrDefault(goalId, 0.0);
        double effective = mastery;

        if (goal != null && goal.getContains() != null && !goal.getContains().isEmpty()) {
            List<Double> childValues = new ArrayList<>();
            for (String childId : goal.getContains()) {
                if (!allGoals.containsKey(childId)) {
                    continue;
                }
                childValues.add(computeEffectiveMastery(childId, allGoals, masteryMap, cache, visiting));
            }
            if (!childValues.isEmpty()) {
                effective = childValues.stream().min(Double::compareTo).orElse(mastery);
            }
        }

        visiting.remove(goalId);
        cache.put(goalId, effective);
        return effective;
    }

    private Map<String, Double> computeEffectivePrereqMastery(Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap) {
        Map<String, Double> cache = new HashMap<>();
        Set<String> visiting = new HashSet<>();
        for (String goalId : allGoals.keySet()) {
            computeEffectivePrereqMastery(goalId, allGoals, masteryMap, cache, visiting);
        }
        return cache;
    }

    private double computeEffectivePrereqMastery(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap, Map<String, Double> cache, Set<String> visiting) {
        Double cached = cache.get(goalId);
        if (cached != null) {
            return cached;
        }
        if (visiting.contains(goalId)) {
            return masteryMap.getOrDefault(goalId, 0.0);
        }
        visiting.add(goalId);

        LearningGoal goal = allGoals.get(goalId);
        double mastery = masteryMap.getOrDefault(goalId, 0.0);
        double effective = mastery;

        if (goal != null && goal.getContains() != null && !goal.getContains().isEmpty()) {
            List<String> childIds = new ArrayList<>();
            boolean hasCoreChild = false;
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, allGoals);
                if (childId == null) {
                    continue;
                }
                childIds.add(childId);
                LearningGoal child = allGoals.get(childId);
                if (child != null && isCoreForPrereqs(child)) {
                    hasCoreChild = true;
                }
            }

            List<Double> childValues = new ArrayList<>();
            for (String childId : childIds) {
                LearningGoal child = allGoals.get(childId);
                if (child == null) {
                    continue;
                }
                if (hasCoreChild && !isCoreForPrereqs(child)) {
                    continue;
                }
                childValues.add(computeEffectivePrereqMastery(childId, allGoals, masteryMap, cache, visiting));
            }
            if (!childValues.isEmpty()) {
                effective = childValues.stream().min(Double::compareTo).orElse(mastery);
            }
        }

        visiting.remove(goalId);
        cache.put(goalId, effective);
        return effective;
    }

    private boolean isCoreForPrereqs(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        List<String> tags = goal.getTags();
        if (tags == null || tags.isEmpty()) {
            return true;
        }
        return tags.contains("GK");
    }

    @Transactional
    public UnifiedLearnerStateResponse getLearnerState(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        com.skillpilot.backend.landscape.LandscapeSummary curriculumSummary = null;

        if (curriculumId != null) {
            LearningLandscape full = landscapeService.getById(curriculumId);
            if (full != null) {
                curriculumSummary = getAvailableLandscapes().stream()
                        .filter(s -> s.getCurriculumId().equals(curriculumId))
                        .findFirst()
                        .orElse(new com.skillpilot.backend.landscape.LandscapeSummary(
                                curriculumId,
                                full.getTitle() != null ? full.getTitle() : full.getSubject(),
                                full.getDescription(),
                                full.getCountry(),
                                full.getRegion(),
                                full.getSchoolType(),
                                full.getSubject(),
                                full.getLocale(),
                                full.getFilters()));
            }
        }

        List<FrontierGoal> frontier = getRichFrontier(skillpilotId);
        List<FrontierGoal> frontierAtomic = filterAtomicFrontier(frontier);

        List<String> plannedIds = getPlannedGoals(skillpilotId);
        List<FrontierGoal> plannedRich = new ArrayList<>();

        // Build a map of all goals in the closure for quick lookup
        Map<String, LearningGoal> allGoals = new HashMap<>();
        if (curriculumId != null) {
            allGoals = getFilteredGoals(curriculumId, learner.getPersonalCurriculum());
        }

        for (String pid : plannedIds) {
            LearningGoal g = allGoals.get(pid);
            if (g == null) {
                // Fallback: Goal might be filtered out by personalization, but since it's
                // planned, we want to see it.
                // Try to resolve it from the landscape service directly.
                String containerId = landscapeService.getLandscapeIdForGoal(pid);
                if (containerId != null) {
                    com.skillpilot.backend.landscape.LearningLandscape l = landscapeService.getById(containerId);
                    if (l != null && l.getGoals() != null) {
                        g = l.getGoals().stream().filter(goal -> goal.getId().equals(pid)).findFirst().orElse(null);
                    }
                }
            }

            if (g != null) {
                plannedRich.add(toFrontierGoal(g, "Planned", null));
            } else {
                // True unknown (deleted or invalid ID)
                plannedRich.add(new FrontierGoal(pid, "Unknown Goal", "", "unknown", null, "Planned",
                        null, null, null, null, null, null));
            }
        }

        Map<String, Double> mastery = getMastery(skillpilotId);
        String activeGoalId = learner.getActiveGoalId();
        boolean activeGoalMastered = activeGoalId != null && !activeGoalId.isBlank()
                && mastery.getOrDefault(activeGoalId, 0.0) >= 0.9;
        if (activeGoalMastered) {
            // Persistently clear stale active goals.
            learner.setActiveGoalId(null);
            learner.setLearningState(LearningState.FRONTIER);
            learnerRepository.save(learner);
            eventPublisher.publishEvent(
                    new LearnerStateChangedEvent(this, skillpilotId, "ACTIVE_GOAL_CLEARED_STALE"));
            activeGoalId = null;
            activeGoalMastered = false;
        }
        Map<String, LearningGoal> structuralGoals = Collections.emptyMap();
        Set<String> scope = Collections.emptySet();
        if (curriculumId != null && !plannedIds.isEmpty()) {
            structuralGoals = getFilteredGoals(curriculumId, "{}");
            scope = computeScope(plannedIds, structuralGoals, Collections.emptyMap());
        }

        com.skillpilot.backend.api.GoalStats personalizedStats = computeAtomicStats(allGoals, null, mastery);
        com.skillpilot.backend.api.GoalStats scopeStats = plannedIds.isEmpty()
                ? null
                : computeAtomicStats(allGoals, scope, mastery);
        com.skillpilot.backend.api.GoalStats focusStats = (scopeStats != null && scopeStats.total_atomic() > 0)
                ? scopeStats
                : personalizedStats;
        boolean scopeCompleted = scopeStats != null
                && scopeStats.total_atomic() > 0
                && scopeStats.mastered_atomic() >= scopeStats.total_atomic();

        List<String> nextAllowedActions = new ArrayList<>();
        if (curriculumId == null) {
            nextAllowedActions.add("setCurriculum");
        }
        List<String> activeFilters = new ArrayList<>();
        boolean personalizationRequired = false;
        if (curriculumId != null) {
            // Extract active filters from ALL configured landscapes (Aggregation)
            // This handles the case where personalization is on a child subject (e.g. Math
            // LK)
            // but the user is viewing the parent (Overview).
            try {
                String json = learner.getPersonalCurriculum();
                if (json != null && !json.isBlank()) {
                    Map<String, Map<String, Object>> config = objectMapper.readValue(json,
                            new com.fasterxml.jackson.core.type.TypeReference<>() {
                            });

                    for (Map<String, Object> landscapeConfig : config.values()) {
                        Object filterObj = landscapeConfig.get("filterId");
                        if (filterObj instanceof String) {
                            String f = (String) filterObj;
                            if (!activeFilters.contains(f)) {
                                activeFilters.add(f);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors
            }

            personalizationRequired = needsPersonalization(frontier, activeFilters);
            nextAllowedActions.add("setPersonalization");
            if (!personalizationRequired) {
                nextAllowedActions.add("setScope");
                nextAllowedActions.add("getFrontier");
                if (activeGoalId != null && !activeGoalId.isBlank() && !activeGoalMastered) {
                    nextAllowedActions.add("setMastery");
                } else if (!frontierAtomic.isEmpty()) {
                    nextAllowedActions.add("setActiveGoal");
                }
            }
        }

        FrontierGoal activeGoal = resolveActiveGoal(activeGoalId, allGoals);
        LearningState learningState = learner.getLearningState();
        if (learningState == null) {
            learningState = (activeGoalId == null || activeGoalId.isBlank() || activeGoalMastered)
                    ? LearningState.FRONTIER
                    : LearningState.TEACHING;
        } else if ((activeGoalId == null || activeGoalId.isBlank() || activeGoalMastered)
                && learningState == LearningState.TEACHING) {
            learningState = LearningState.FRONTIER;
        } else if (activeGoalId != null && !activeGoalId.isBlank() && !activeGoalMastered
                && learningState == LearningState.FRONTIER) {
            learningState = LearningState.TEACHING;
        }

        List<FrontierGoal> scopeExpansionOptions = Collections.emptyList();
        if (curriculumId != null && !personalizationRequired && activeGoal == null
                && frontier.isEmpty() && !plannedIds.isEmpty()) {
            Map<String, Double> effectiveMastery = computeEffectiveMastery(allGoals, mastery);
            Map<String, LearningGoal> structuralForExpansion = structuralGoals;
            if (structuralForExpansion == null || structuralForExpansion.isEmpty()) {
                structuralForExpansion = getFilteredGoals(curriculumId, "{}");
            }
            Set<String> scopeForExpansion = scope;
            if (scopeForExpansion == null || scopeForExpansion.isEmpty()) {
                scopeForExpansion = computeScope(plannedIds, structuralForExpansion, Collections.emptyMap());
            }
            scopeExpansionOptions = buildScopeExpansionOptions(curriculumId, allGoals, structuralForExpansion,
                    scopeForExpansion, plannedIds, effectiveMastery);
        }

        StateMachineInfo stateMachine = buildStateMachineInfo(curriculumId, frontier, frontierAtomic, activeGoal,
                activeGoalMastered, learningState, activeFilters, scopeExpansionOptions);

        return new UnifiedLearnerStateResponse(learner.getSkillpilotId(), curriculumSummary, frontier,
                new LearnerGoals(plannedRich, focusStats.mastered_atomic(), focusStats.total_atomic(),
                        personalizedStats, scopeStats, scopeCompleted),
                nextAllowedActions, activeFilters,
                learner.getCopySources(), learningState.name(), activeGoal, stateMachine);
    }

    private List<FrontierGoal> filterAtomicFrontier(List<FrontierGoal> frontier) {
        return frontier.stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .toList();
    }

    private StateMachineInfo buildStateMachineInfo(String curriculumId, List<FrontierGoal> frontier,
            List<FrontierGoal> frontierAtomic, FrontierGoal activeGoal, boolean activeGoalMastered,
            LearningState learningState, List<String> activeFilters, List<FrontierGoal> scopeExpansionOptions) {
        String state = curriculumId == null ? "SETUP" : learningState.name();
        String requiredAction = "getFrontier";
        List<FrontierGoal> goalOptions = Collections.emptyList();
        List<com.skillpilot.backend.landscape.LandscapeSummary> curriculumOptions = Collections.emptyList();

        if (curriculumId == null) {
            requiredAction = "setCurriculum";
            curriculumOptions = getAvailableBaseCurricula();
        } else if (activeGoal != null && !activeGoalMastered) {
            requiredAction = "setMastery";
            goalOptions = List.of(activeGoal);
        } else if (needsPersonalization(frontier, activeFilters)) {
            requiredAction = "setPersonalization";
            goalOptions = frontier;
        } else if (!frontierAtomic.isEmpty()) {
            requiredAction = "setActiveGoal";
            goalOptions = frontierAtomic;
        } else if (!frontier.isEmpty()) {
            requiredAction = "setScope";
            goalOptions = frontier;
        } else if (scopeExpansionOptions != null && !scopeExpansionOptions.isEmpty()) {
            requiredAction = "setScope";
            goalOptions = scopeExpansionOptions;
        }

        return new StateMachineInfo(state, requiredAction, goalOptions, curriculumOptions, activeGoal);
    }

    private List<FrontierGoal> buildScopeExpansionOptions(String curriculumId, Map<String, LearningGoal> filteredGoals,
            Map<String, LearningGoal> structuralGoals, Set<String> scope, List<String> plannedIds,
            Map<String, Double> effectiveMastery) {
        if (plannedIds == null || plannedIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Set<String>> parentMap = buildParentMap(structuralGoals);
        LinkedHashSet<String> candidateIds = new LinkedHashSet<>();

        for (String plannedId : plannedIds) {
            if (!structuralGoals.containsKey(plannedId)) {
                continue;
            }
            Set<String> parents = parentMap.getOrDefault(plannedId, Collections.emptySet());
            for (String parentId : parents) {
                LearningGoal parent = structuralGoals.get(parentId);
                if (parent == null || parent.getContains() == null) {
                    continue;
                }
                for (String childRef : parent.getContains()) {
                    String childId = resolveGoalRef(childRef, structuralGoals);
                    if (childId == null || scope.contains(childId)) {
                        continue;
                    }
                    if (!filteredGoals.containsKey(childId)) {
                        continue;
                    }
                    if (effectiveMastery != null && effectiveMastery.getOrDefault(childId, 0.0) >= 0.9) {
                        continue;
                    }
                    candidateIds.add(childId);
                }
            }
        }

        List<FrontierGoal> result = new ArrayList<>();
        for (String id : candidateIds) {
            LearningGoal g = filteredGoals.get(id);
            if (g == null) {
                continue;
            }
            result.add(toFrontierGoal(g, "Scope expansion", null));
        }

        if (!result.isEmpty()) {
            return result;
        }

        // Fallback: Offer top-level modules not already in scope
        List<FrontierGoal> topLevel = getTopLevelModules(curriculumId, filteredGoals);
        return topLevel.stream()
                .filter(g -> !scope.contains(g.id()))
                .filter(g -> effectiveMastery == null || effectiveMastery.getOrDefault(g.id(), 0.0) < 0.9)
                .map(g -> new FrontierGoal(
                        g.id(),
                        g.title(),
                        g.description(),
                        g.type(),
                        g.nodeKind(),
                        "Scope expansion",
                        g.tags(),
                        g.resourceLinks(),
                        g.sourceRef(),
                        g.sourceLicense(),
                        g.sourceLicenseUrl(),
                        g.examData()))
                .toList();
    }

    private Map<String, Set<String>> buildParentMap(Map<String, LearningGoal> allGoals) {
        Map<String, Set<String>> parentMap = new HashMap<>();
        for (LearningGoal parent : allGoals.values()) {
            if (parent.getContains() == null) {
                continue;
            }
            for (String childRef : parent.getContains()) {
                String childId = resolveGoalRef(childRef, allGoals);
                if (childId == null) {
                    continue;
                }
                parentMap.computeIfAbsent(childId, k -> new LinkedHashSet<>()).add(parent.getId());
            }
        }
        return parentMap;
    }

    private boolean needsPersonalization(List<FrontierGoal> frontier, List<String> activeFilters) {
        if (activeFilters != null && !activeFilters.isEmpty()) {
            return false;
        }
        for (FrontierGoal goal : frontier) {
            if (goal.tags() == null) {
                continue;
            }
            for (String tag : goal.tags()) {
                if ("GK".equals(tag) || "LK".equals(tag)) {
                    return true;
                }
            }
        }
        return false;
    }

    private com.skillpilot.backend.api.GoalStats computeAtomicStats(Map<String, LearningGoal> goals,
            Set<String> scope, Map<String, Double> mastery) {
        if (goals == null || goals.isEmpty()) {
            return new com.skillpilot.backend.api.GoalStats(0, 0);
        }

        long total = 0;
        long mastered = 0;
        for (LearningGoal g : goals.values()) {
            if ("cluster".equals(resolveNodeType(g))) {
                continue;
            }
            if (scope != null && !scope.isEmpty() && !scope.contains(g.getId())) {
                continue;
            }
            total++;
            if (mastery.getOrDefault(g.getId(), 0.0) >= 0.9) {
                mastered++;
            }
        }

        return new com.skillpilot.backend.api.GoalStats(mastered, total);
    }

    private String resolveNodeType(LearningGoal goal) {
        if (goal == null) {
            return "atomic";
        }
        String type = goal.getType();
        if (type != null && !type.isBlank()) {
            return type;
        }
        String resolved = (goal.getContains() != null && !goal.getContains().isEmpty()) ? "cluster" : "atomic";
        goal.setType(resolved);
        return resolved;
    }

    private String resolveNodeKind(LearningGoal goal) {
        if (goal == null) {
            return "tutor";
        }
        String kind = goal.getNodeKind();
        if (kind != null && !kind.isBlank()) {
            return kind;
        }
        String resolved = (goal.getExamData() != null) ? "exam" : "tutor";
        goal.setNodeKind(resolved);
        return resolved;
    }

    @Transactional
    public void setScope(String skillpilotId, List<String> goalIds) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No curriculum selected. Please select a curriculum first using updateCurriculum.");
        }

        if (goalIds == null || goalIds.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "goalIds must not be empty. String instructions are no longer supported.");
        }

        // Scope selection is exclusive: replace planned goals with the new scope.
        Set<String> newPlanned = new java.util.HashSet<>(goalIds);
        setPlannedGoals(skillpilotId, newPlanned);
        learner.setLearningState(LearningState.FRONTIER);
        learnerRepository.save(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "SCOPE_UPDATE"));
    }

    @Transactional
    public void setActiveGoal(String skillpilotId, String goalId) {
        Learner learner = getLearner(skillpilotId);
        if (goalId == null || goalId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "goalId must not be empty.");
        }

        String currentActiveGoalId = learner.getActiveGoalId();
        if (currentActiveGoalId != null && !currentActiveGoalId.isBlank() && currentActiveGoalId.equals(goalId)) {
            return;
        }

        List<FrontierGoal> frontierAtomic = filterAtomicFrontier(getRichFrontier(skillpilotId));
        boolean allowed = frontierAtomic.stream().anyMatch(goal -> goal.id().equals(goalId));
        if (!allowed) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "goalId must be an atomic goal from the current frontier.");
        }

        learner.setActiveGoalId(goalId);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "ACTIVE_GOAL_UPDATE"));
    }

    private FrontierGoal toFrontierGoal(LearningGoal goal, String reason, com.skillpilot.backend.landscape.ExamData examData) {
        if (goal == null) {
            return null;
        }
        List<Map<String, Object>> rawSourceLinks = extractRawSourceLinks(goal);
        Map<String, GoalSourceLink> dedupedLinks = new LinkedHashMap<>();
        rawSourceLinks.stream()
                .filter(link -> !"license".equalsIgnoreCase(readString(link.get("type"))))
                .map(this::toGoalSourceLink)
                .filter(Objects::nonNull)
                .forEach(link -> dedupedLinks.putIfAbsent(link.url(), link));
        List<GoalSourceLink> resourceLinks = new ArrayList<>(dedupedLinks.values());

        ProvenanceInfo provenance = extractProvenance(goal, rawSourceLinks);

        return new FrontierGoal(
                goal.getId(),
                goal.getTitle(),
                goal.getDescription(),
                resolveNodeType(goal),
                resolveNodeKind(goal),
                reason,
                goal.getTags(),
                resourceLinks,
                provenance.sourceRef(),
                provenance.sourceLicense(),
                provenance.sourceLicenseUrl(),
                examData);
    }

    private record ProvenanceInfo(String sourceRef, String sourceLicense, String sourceLicenseUrl) {
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractRawSourceLinks(LearningGoal goal) {
        if (goal == null) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> links = new ArrayList<>();

        appendRawLinks(links, goal.getResourceLinks());

        if (goal.getExtendedData() != null) {
            Object raw = goal.getExtendedData().get("sourceLinks");
            if (raw instanceof List<?> list) {
                appendRawLinks(links, list);
            }
        }

        Map<String, Object> legacyOerContent = goal.getOerContent();
        if (legacyOerContent != null) {
            String link = trimToNull(readString(legacyOerContent.get("link")));
            if (link != null) {
                Map<String, Object> synthesized = new HashMap<>();
                synthesized.put("type", "concept");
                synthesized.put("title", coalesce(
                        trimToNull(readString(legacyOerContent.get("source"))),
                        trimToNull(goal.getTitle())));
                synthesized.put("url", link);
                synthesized.put("resourceType", "oer");
                synthesized.put("provider", trimToNull(readString(legacyOerContent.get("source"))));
                Object sections = legacyOerContent.get("sections");
                if (sections instanceof List<?> list) {
                    List<String> normalizedSections = list.stream()
                            .filter(String.class::isInstance)
                            .map(String.class::cast)
                            .map(this::trimToNull)
                            .filter(Objects::nonNull)
                            .toList();
                    if (!normalizedSections.isEmpty()) {
                        synthesized.put("sections", normalizedSections);
                    }
                }
                String description = trimToNull(readString(legacyOerContent.get("description")));
                if (description != null) {
                    synthesized.put("description", description);
                }
                links.add(synthesized);
            }
        }

        return links;
    }

    @SuppressWarnings("unchecked")
    private void appendRawLinks(List<Map<String, Object>> target, List<?> entries) {
        if (entries == null) {
            return;
        }
        for (Object entry : entries) {
            if (entry instanceof Map<?, ?> map) {
                target.add((Map<String, Object>) map);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private ProvenanceInfo extractProvenance(LearningGoal goal, List<Map<String, Object>> rawSourceLinks) {
        String sourceRef = trimToNull(goal.getSourceRef());
        String sourceLicense = extractLicenseFromTags(goal.getTags());
        String sourceLicenseUrl = null;

        if (goal.getExtendedData() != null) {
            Object provenanceRaw = goal.getExtendedData().get("provenance");
            if (provenanceRaw instanceof Map<?, ?> map) {
                Map<String, Object> provenance = (Map<String, Object>) map;
                sourceRef = coalesce(trimToNull(readString(provenance.get("sourceUrl"))), sourceRef);
                sourceLicense = coalesce(trimToNull(readString(provenance.get("license"))), sourceLicense);
                sourceLicenseUrl = coalesce(trimToNull(readString(provenance.get("licenseUrl"))), sourceLicenseUrl);
            }
        }

        for (Map<String, Object> link : rawSourceLinks) {
            String type = readString(link.get("type"));
            String url = trimToNull(readString(link.get("url")));
            if (sourceRef == null && "concept".equalsIgnoreCase(type)) {
                sourceRef = url;
            }
            if ("license".equalsIgnoreCase(type)) {
                sourceLicense = coalesce(trimToNull(readString(link.get("license"))), sourceLicense);
                sourceLicenseUrl = coalesce(url, sourceLicenseUrl);
            }
        }

        return new ProvenanceInfo(sourceRef, sourceLicense, sourceLicenseUrl);
    }

    private GoalSourceLink toGoalSourceLink(Map<String, Object> rawLink) {
        String url = trimToNull(readString(rawLink.get("url")));
        if (url == null) {
            return null;
        }
        List<String> sections = null;
        Object rawSections = rawLink.get("sections");
        if (rawSections instanceof List<?> list) {
            sections = list.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(this::trimToNull)
                    .filter(Objects::nonNull)
                    .toList();
        }
        return new GoalSourceLink(
                trimToNull(readString(rawLink.get("type"))),
                trimToNull(readString(rawLink.get("title"))),
                url,
                trimToNull(readString(rawLink.get("resourceType"))),
                trimToNull(readString(rawLink.get("provider"))),
                sections,
                trimToNull(readString(rawLink.get("description"))),
                trimToNull(readString(rawLink.get("lang"))),
                trimToNull(readString(rawLink.get("license"))));
    }

    private String extractLicenseFromTags(List<String> tags) {
        if (tags == null) {
            return null;
        }
        for (String tag : tags) {
            if (tag == null) {
                continue;
            }
            if (tag.startsWith("license:")) {
                return trimToNull(tag.substring("license:".length()));
            }
        }
        return null;
    }

    private String readString(Object value) {
        return value instanceof String str ? str : null;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String coalesce(String first, String second) {
        return first != null ? first : second;
    }

    private FrontierGoal resolveActiveGoal(String goalId, Map<String, LearningGoal> allGoals) {
        if (goalId == null || goalId.isBlank()) {
            return null;
        }
        LearningGoal g = allGoals.get(goalId);
        if (g == null) {
            String containerId = landscapeService.getLandscapeIdForGoal(goalId);
            if (containerId != null) {
                LearningLandscape l = landscapeService.getById(containerId);
                if (l != null && l.getGoals() != null) {
                    g = l.getGoals().stream().filter(goal -> goal.getId().equals(goalId)).findFirst().orElse(null);
                }
            }
        }
        if (g == null) {
            return new FrontierGoal(goalId, "Unknown Goal", "", "unknown", null, "Active",
                    null, null, null, null, null, null);
        }
        return toFrontierGoal(g, "Active", g.getExamData());
    }

    private void ensureLearnerExists(String skillpilotId) {
        if (!learnerRepository.existsById(skillpilotId)) {
            throw new ResponseStatusException(NOT_FOUND, "Learner not found");
        }
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.landscape.LandscapeSummary> getAvailableBaseCurricula() {
        return landscapeService.getBaseCurricula();
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.landscape.LandscapeSummary> getAvailableLandscapes() {
        return landscapeService.getOverview().getSummaries();
    }

    private Map<String, LearningGoal> getFilteredGoals(String curriculumId, String personalCurriculumJson) {
        List<LearningLandscape> closure = landscapeService.getClosure(curriculumId);
        LearningLandscape root = landscapeService.getById(curriculumId);
        if (root != null && closure.stream().noneMatch(l -> l.getLandscapeId().equals(root.getLandscapeId()))) {
            closure = new ArrayList<>(closure);
            closure.add(root);
        }

        Map<String, Map<String, Object>> config = new HashMap<>();
        if (personalCurriculumJson != null && !personalCurriculumJson.isBlank()) {
            try {
                config = objectMapper.readValue(personalCurriculumJson,
                        new com.fasterxml.jackson.core.type.TypeReference<>() {
                        });
                if (config == null) {
                    config = new HashMap<>();
                }
            } catch (Exception e) {
                // Ignore invalid config
                config = new HashMap<>();
            }
        }

        Map<String, LearningGoal> allGoals = new HashMap<>();
        for (LearningLandscape l : closure) {
            // Filter by landscape selection
            // Default to selected if no config exists, or if explicitly selected
            boolean isSelected = true;
            String filterId = null;

            if (!config.isEmpty()) {
                Map<String, Object> landscapeConfig = config.get(l.getLandscapeId());
                if (landscapeConfig != null) {
                    Object selectedObj = landscapeConfig.get("selected");
                    if (selectedObj instanceof Boolean) {
                        isSelected = (Boolean) selectedObj;
                    }
                    Object filterObj = landscapeConfig.get("filterId");
                    if (filterObj instanceof String) {
                        filterId = (String) filterObj;
                    }
                } else {
                    // If config exists but this landscape is not in it, assume not selected (unless
                    // it's root?)
                    // For now, let's assume if config exists, we respect it strictly.
                    // But wait, the frontend sends config for ALL available landscapes.
                    // So if it's missing, it's safe to assume not selected or just default.
                    // Let's assume default is selected for safety if not specified?
                    // No, personalization usually means restriction.
                    // If config is present, we only include what's in config.
                    isSelected = false;
                    // Exception: The root curriculum itself should probably always be included?
                    if (l.getLandscapeId().equals(curriculumId)) {
                        isSelected = true;
                    }
                }
            }

            if (!isSelected) {
                continue;
            }

            if (l.getGoals() != null) {
                for (LearningGoal g : l.getGoals()) {
                    // Filter by tag if filterId is set
                    if (filterId != null && !filterId.isBlank()) {
                        boolean tagMatch = false;
                        if (g.getTags() == null || g.getTags().isEmpty() || g.getTags().contains(filterId)) {
                            tagMatch = true;
                        }
                        // Also check dimension tags if needed, but simple tags for now
                        if (!tagMatch) {
                            continue;
                        }
                    }
                    allGoals.put(g.getId(), g);
                }
            }
        }
        return allGoals;
    }

    // Package-private for testing
    Map<String, List<String>> computeEffectiveRequires(Map<String, LearningGoal> allGoals) {
        Map<String, List<String>> parentMap = new HashMap<>();
        for (LearningGoal goal : allGoals.values()) {
            List<String> contains = goal.getContains();
            if (contains == null) {
                continue;
            }
            for (String childRef : contains) {
                String resolvedChild = childRef;
                // Normalize "landscapeId:goalId" references if valid
                if (!allGoals.containsKey(resolvedChild) && childRef.contains(":")) {
                    String[] parts = childRef.split(":", 2);
                    if (parts.length == 2 && allGoals.containsKey(parts[1])) {
                        resolvedChild = parts[1];
                    }
                }
                if (!allGoals.containsKey(resolvedChild)) {
                    continue;
                }
                List<String> parents = parentMap.getOrDefault(resolvedChild, new ArrayList<>());
                parents.add(goal.getId());
                parentMap.put(resolvedChild, parents);
            }
        }

        Map<String, List<String>> memo = new HashMap<>();
        Set<String> visiting = new HashSet<>();

        for (String goalId : allGoals.keySet()) {
            collectEffectiveRequires(goalId, allGoals, parentMap, memo, visiting);
        }
        return memo;
    }

    private List<String> collectEffectiveRequires(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, List<String>> parentMap, Map<String, List<String>> memo, Set<String> visiting) {
        if (memo.containsKey(goalId)) {
            return memo.get(goalId);
        }
        if (visiting.contains(goalId)) {
            // Cycle guard: return direct requires only to avoid infinite recursion
            LearningGoal self = allGoals.get(goalId);
            List<String> direct = self != null && self.getRequires() != null ? self.getRequires()
                    : Collections.emptyList();
            memo.put(goalId, direct);
            return direct;
        }
        visiting.add(goalId);

        LinkedHashSet<String> effective = new LinkedHashSet<>();
        LearningGoal goal = allGoals.get(goalId);
        if (goal != null && goal.getRequires() != null) {
            effective.addAll(goal.getRequires());
        }

        List<String> parents = parentMap.getOrDefault(goalId, Collections.emptyList());
        for (String parentId : parents) {
            List<String> parentReqs = collectEffectiveRequires(parentId, allGoals, parentMap, memo, visiting);
            effective.addAll(parentReqs);
        }

        effective.remove(goalId); // avoid self-dependency through inheritance

        List<String> result = new ArrayList<>(effective);
        memo.put(goalId, result);
        visiting.remove(goalId);
        return result;
    }

    private String resolveGoalRef(String ref, Map<String, LearningGoal> allGoals) {
        if (ref == null || ref.isBlank() || allGoals == null || allGoals.isEmpty()) {
            return null;
        }
        if (allGoals.containsKey(ref)) {
            return ref;
        }
        if (ref.contains(":")) {
            String[] parts = ref.split(":", 2);
            if (parts.length == 2 && allGoals.containsKey(parts[1])) {
                return parts[1];
            }
        }
        String suffix = ":" + ref;
        for (String key : allGoals.keySet()) {
            if (key.endsWith(suffix)) {
                return key;
            }
        }
        return null;
    }

    private void collectDescendants(String goalId, Map<String, LearningGoal> allGoals, Set<String> result) {
        LearningGoal goal = allGoals.get(goalId);
        if (goal == null) {
            // Log warning?
            System.out.println("DEBUG_SKILLPILOT: collectDescendants failed to find goal: " + goalId);
            return;
        }
        if (goal.getContains() == null) {
            return;
        }
        for (String childRef : goal.getContains()) {
            String childId = childRef;
            boolean found = allGoals.containsKey(childId);

            // 1. Normalize "landscapeId:goalId" references if valid
            if (!found && childRef.contains(":")) {
                String[] parts = childRef.split(":", 2);
                if (parts.length == 2 && allGoals.containsKey(parts[1])) {
                    childId = parts[1];
                    found = true;
                }
            }

            // 2. Fuzzy Lookup: Try to find a key that ends with ":childRef"
            // This handles the case where the parent references "A" but the map has "S:A"
            if (!found) {
                final String suffix = ":" + childRef;
                for (String key : allGoals.keySet()) {
                    if (key.endsWith(suffix)) {
                        childId = key;
                        found = true;
                        break;
                    }
                }
            }

            if (result.add(childId)) { // Avoid cycles
                if (found) {
                    collectDescendants(childId, allGoals, result);
                } else {
                    System.out.println(
                            "DEBUG_SKILLPILOT: Could not resolve child: " + childRef + " for parent: " + goalId);
                }
            }
        }
    }

    private List<FrontierGoal> getTopLevelModules(String curriculumId, Map<String, LearningGoal> allGoals) {
        LearningLandscape curriculum = landscapeService.getById(curriculumId);
        if (curriculum == null || curriculum.getGoals() == null || curriculum.getGoals().isEmpty()) {
            return Collections.emptyList();
        }

        // Assume the first goal in the curriculum file is the root (e.g. "Program")
        // Or find the one that is "core" and has no parent within the file?
        // Usually the curriculum file defines the structure.
        // Let's take all goals defined in the curriculum file that are "roots" within
        // that file.

        // Better: The curriculum file usually defines a single root goal that contains
        // the subjects.
        // Let's iterate over goals in the curriculum landscape and find those that
        // contain others.

        List<FrontierGoal> roots = new ArrayList<>();
        for (LearningGoal g : curriculum.getGoals()) {
            if (g.getContains() != null && !g.getContains().isEmpty()) {
                for (String childRef : g.getContains()) {
                    String childId = childRef;
                    LearningGoal child = allGoals.get(childId);
                    if (child != null) {
                        roots.add(toFrontierGoal(child, "Module", null));
                    }
                }
                // If we found a container, we assume it's the root and we returned its
                // children.
                // We stop here to avoid returning the root itself or other things.
                // This assumes there is ONE main root in the curriculum file.
                if (!roots.isEmpty()) {
                    return roots;
                }
            }
        }
        return roots;
    }

    @Transactional(readOnly = true)
    public SignedLearnerDataDTO exportLearner(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        Map<String, MasteryEntryDTO> mastery = getMasteryWithTimestamps(skillpilotId);
        List<String> planned = getPlannedGoals(skillpilotId);
        LearnerDataDTO data = new LearnerDataDTO(learner, mastery, planned, learner.getCopySources());

        String signature = calculateSignature(data);
        return new SignedLearnerDataDTO(data, signature);
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.api.MasteryHistoryEntry> getHistory(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        Map<String, LearningGoal> goals = Collections.emptyMap();
        if (curriculumId != null && !curriculumId.isBlank()) {
            goals = getFilteredGoals(curriculumId, "{}");
        }
        final Set<String> goalIds = goals.isEmpty() ? Collections.emptySet() : new HashSet<>(goals.keySet());
        return masteryRepository.findByLearner_SkillpilotId(skillpilotId)
                .stream()
                .filter(m -> m.getValue() >= 0.9) // Only mastered goals count for velocity
                .filter(m -> isKnownHistoryGoal(m.getGoalKey(), goalIds))
                .map(m -> new com.skillpilot.backend.api.MasteryHistoryEntry(
                        m.getGoalKey(),
                        m.getUpdatedAt(),
                        m.getValue()))
                .sorted((a, b) -> b.timestamp().compareTo(a.timestamp())) // Newest first
                .toList();
    }

    private boolean isKnownHistoryGoal(String goalKey, Set<String> goalIds) {
        if (goalIds == null || goalIds.isEmpty()) {
            return true;
        }
        if (goalIds.contains(goalKey)) {
            return true;
        }
        if (goalKey != null) {
            int idx = goalKey.indexOf(':');
            if (idx >= 0 && idx < goalKey.length() - 1) {
                String suffix = goalKey.substring(idx + 1);
                return goalIds.contains(suffix);
            }
        }
        return false;
    }

    @Transactional
    public void importLearner(String skillpilotId, SignedLearnerDataDTO signedData) {
        // distinct verification logic
        String calculatedSignature = calculateSignature(signedData.data());
        if (!calculatedSignature.equals(signedData.signature())) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid data signature. Data may have been tampered with.");
        }

        LearnerDataDTO data = signedData.data();
        Learner existing = getLearner(skillpilotId);
        // ... rest of logic

        // Provenance / Chain of Custody
        if (data.copySources() != null) {
            existing.getCopySources().addAll(data.copySources());
        }
        if (data.learner() != null) {
            String sourceId = data.learner().getSkillpilotId();
            // Add immediate source if not self
            if (!sourceId.equals(skillpilotId)) {
                existing.getCopySources().add(new CopySource(sourceId, Instant.now()));
            }
        }

        // Restore Learner properties
        if (data.learner() != null) {
            existing.setSelectedCurriculum(data.learner().getSelectedCurriculum());
            existing.setPersonalCurriculum(data.learner().getPersonalCurriculum());
            if (data.learner().getClientState() != null) {
                existing.setClientState(data.learner().getClientState());
                existing.setClientStateUpdatedAt(data.learner().getClientStateUpdatedAt());
            }
            learnerRepository.save(existing);
        }

        // Restore Mastery with original timestamps
        if (data.mastery() != null) {
            for (Map.Entry<String, MasteryEntryDTO> entry : data.mastery().entrySet()) {
                MasteryId mid = new MasteryId(skillpilotId, entry.getKey());
                MasteryEntryDTO entryData = entry.getValue();
                Mastery m = masteryRepository.findById(mid)
                        .orElse(new Mastery(existing, entry.getKey(), entryData.value()));
                m.setValue(entryData.value());
                masteryRepository.saveAndFlush(m);
                // Restore original timestamp using native query (bypasses @PreUpdate)
                if (entryData.updatedAt() != null) {
                    masteryRepository.updateTimestamp(skillpilotId, entry.getKey(), entryData.updatedAt());
                }
            }
        }

        // Restore Planned Goals
        if (data.plannedGoals() != null) {
            setPlannedGoals(skillpilotId, new HashSet<>(data.plannedGoals()));
        }
    }

    private String calculateSignature(LearnerDataDTO data) {
        try {
            String json = objectMapper.writeValueAsString(data);
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacData = mac.doFinal(json.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hmacData);
        } catch (Exception e) {
            throw new RuntimeException("Error calculating signature", e);
        }
    }

    private Set<String> computeScope(List<String> plannedIds, Map<String, LearningGoal> allGoals,
            Map<String, List<String>> effectiveRequires) {
        // If no scope is set (plannedGoals empty), we conceptually have "no
        // restriction"
        // But for getRichFrontier, empty plan means "Top Level Modules".
        // However, this helper is for validating if a goal is IN scope.
        // If plan is empty, is everything in scope? Or nothing?
        // UI behavior: Empty plan -> Show top level. Active goal CANNOT be set if we
        // are at top level (usually).
        // Actually, if plan is empty, we are in "Overview Mode".
        if (plannedIds.isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> scope = new HashSet<>();
        // 1. Start with Plan
        // 1. Start with Plan (Only if they exist in current context)
        for (String pid : plannedIds) {
            if (allGoals.containsKey(pid)) {
                scope.add(pid);
            }
        }

        // 2. Add Descendants (e.g. Math -> Analysis)
        Set<String> descendants = new HashSet<>();
        for (String pid : plannedIds) {
            collectDescendants(pid, allGoals, descendants);
        }
        scope.addAll(descendants);

        // 3. Add Prerequisites (Transitive Closure) - DISABLED for "Pragmatic Approach"
        // User requested that focus should strictly be Plan + Descendants.
        // Prerequisites outside this scope should be ignored in getRichFrontier.
        return scope;
    }

}
