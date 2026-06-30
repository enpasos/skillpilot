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
import java.time.LocalDate;
import java.time.ZoneId;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ResolvedGoalMapping;
import com.skillpilot.backend.events.LearnerStateChangedEvent;
import com.skillpilot.backend.util.BundeslandCodeNormalizer;
import org.springframework.context.ApplicationEventPublisher;
import com.skillpilot.backend.landscape.LearningLandscape;
import java.util.ArrayList;
import java.util.ArrayDeque;
import java.util.Comparator;
import java.util.Collections;
import java.util.Deque;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.io.InputStream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.CreateLearnerRequest;
import com.skillpilot.backend.api.ClientStateRequest;
import com.skillpilot.backend.api.ClientStateResponse;
import com.skillpilot.backend.api.ClientStateSnapshot;
import com.skillpilot.backend.api.CompatibilityArchiveResponse;
import com.skillpilot.backend.api.CompatibilityArchiveStateSnapshot;
import com.skillpilot.backend.api.BulkCanonicalGymnasiumCutoverResponse;
import com.skillpilot.backend.api.BulkCanonicalGymnasiumCutoverResult;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.LearnerDataDTO;
import com.skillpilot.backend.api.LearningModeOption;
import com.skillpilot.backend.api.MasteryEntryDTO;
import com.skillpilot.backend.api.SignedLearnerDataDTO;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import com.fasterxml.jackson.core.type.TypeReference;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.core.io.Resource;

@Service
public class LearnerService {

    private static final ZoneId VERIFIED_RECALL_DAY_ZONE = ZoneId.of("Europe/Berlin");
    private static final int LEGACY_VERIFIED_RECALL_BATCH_SIZE = 1;
    private static final int MAX_VERIFIED_RECALL_BATCH_SIZE = 20;

    private final LearnerRepository learnerRepository;
    private final LearnerClientStateRepository learnerClientStateRepository;
    private final MasteryRepository masteryRepository;
    private final PlannedGoalRepository plannedGoalRepository;
    private final LandscapeService landscapeService;
    private final GoalMappingService goalMappingService;
    private final DeckResourceService deckResourceService;
    private final CompositionViewService compositionViewService;

    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final TransactionTemplate transactionTemplate;

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

    private static final Set<String> COURSE_FILTER_IDS = Set.of("GK", "LK");
    private static final Set<String> DURATION_MODEL_FILTER_IDS = Set.of("G8", "G9");
    private static final String STAGE_SCOPE_SEK1_ID = "__skillpilot_stage_scope_sek1__";
    private static final String STAGE_SCOPE_SEK2_ID = "__skillpilot_stage_scope_sek2__";
    private static final String APPLICABILITY_DIMENSION_JURISDICTION = "jurisdiction";
    private static final String APPLICABILITY_DIMENSION_DURATION_MODEL = "durationModel";
    private static final String HESSEN_JURISDICTION_FILTER_ID = "DE-HE";
    private static final String BAVARIA_JURISDICTION_FILTER_ID = "DE-BY";
    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_GYMNASIUM_MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_GYMNASIUM_PHYSICS_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String CANONICAL_GYMNASIUM_CHEMISTRY_ID = "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0";
    private static final String CANONICAL_GYMNASIUM_BIOLOGY_ID = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String CANONICAL_GYMNASIUM_INFORMATICS_ID = "7d51b38c-a149-5407-bddc-d2ce7878b020";
    private static final String CANONICAL_GYMNASIUM_HISTORY_ID = "92406d94-e3c1-58ec-b7c6-12122278d25a";
    private static final String CANONICAL_GYMNASIUM_GERMAN_ID = "67bd301b-e11a-582d-94ba-4f4b1a4cefff";
    private static final String CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID = "51b60137-46e8-5498-973e-ea38bb32f327";
    private static final String CANONICAL_GYMNASIUM_ENGLISH_ID = "c8c84073-46ae-57ec-898a-882d08d7a72f";
    private static final String CANONICAL_GYMNASIUM_FRENCH_ID = "96a915cc-4fd6-5dc2-8cee-aaf3ab8c2977";
    private static final String CANONICAL_GYMNASIUM_LATIN_ID = "668cf206-941e-51f8-8704-3e8938631235";
    private static final String CANONICAL_GYMNASIUM_SPANISH_ID = "90eedebf-9ea8-5247-85dd-31c147f907c3";
    private static final String CANONICAL_GYMNASIUM_ITALIAN_ID = "25c6b527-10d6-5d92-9d76-fab23585f29b";
    private static final String CANONICAL_GYMNASIUM_RUSSIAN_ID = "242ba9bd-7ec7-5ec3-a15e-4f0f2b01aa37";
    private static final String CANONICAL_GYMNASIUM_POLISH_ID = "f145785b-0c44-5246-af66-8a153d202cb9";
    private static final String CANONICAL_GYMNASIUM_CZECH_ID = "0900df4c-beeb-5542-86f9-bd479c94746a";
    private static final String CANONICAL_GYMNASIUM_GREEK_ID = "70a2cb55-127b-5c6e-b518-4a1c9f4f77a0";
    private static final String CANONICAL_GYMNASIUM_CHINESE_ID = "8fdb83f5-b42a-5b36-ab5d-64edd4b2ab80";
    private static final String CANONICAL_GYMNASIUM_MUSIC_ID = "f620c251-c1e1-41c1-b4e1-b10950b43608";
    private static final String CANONICAL_GYMNASIUM_ECONOMICS_ID = "605bdaf6-32d5-56fd-8d92-5a80c2fd2901";
    private static final String HESSEN_GYMNASIUM_UPPER_ROOT_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";
    private static final String HESSEN_GYMNASIUM_UPPER_MATH_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private static final String HESSEN_GYMNASIUM_UPPER_PHYSICS_ID = "24f2ca0f-b94a-444e-bb70-677cb6f85c02";
    private static final String HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID = "2f391ba2-ba1e-40e4-a8d2-dff049516c13";
    private static final String HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID = "3e56aa75-c76c-4de5-883b-0aac98297846";
    private static final String HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID = "c1a02ddd-736d-4975-920b-18b03aff147f";
    private static final String HESSEN_GYMNASIUM_UPPER_HISTORY_ID = "bdc89685-73d3-446c-af5a-eaf642c07463";
    private static final String HESSEN_GYMNASIUM_UPPER_GERMAN_ID = "f1ba2118-853f-4aa0-bef5-4f749bc621ed";
    private static final String HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID = "1d0e9f8f-0087-49e4-8ea2-976e5a89b165";
    private static final String HESSEN_GYMNASIUM_UPPER_ENGLISH_ID = "bc2124fa-2974-46cc-85e7-2392e61250e1";
    private static final String HESSEN_GYMNASIUM_UPPER_FRENCH_ID = "30acd190-609c-4109-8ee7-06fc5594af19";
    private static final String HESSEN_GYMNASIUM_UPPER_LATIN_ID = "fe28bda8-03f3-4c4a-8286-7fcfce4eeac1";
    private static final String HESSEN_GYMNASIUM_UPPER_SPANISH_ID = "936efc61-a4d5-49fd-8694-085d1347db80";
    private static final String HESSEN_GYMNASIUM_UPPER_GREEK_ID = "c7209caa-18e5-4dd8-b68f-dd86e228d045";
    private static final String HESSEN_GYMNASIUM_UPPER_CHINESE_ID = "7651cbe2-5fb8-464d-b0c4-3e830cda41dd";
    private static final String HESSEN_GYMNASIUM_UPPER_MUSIC_ID = "a8c23058-6998-49f2-9f3b-a85e951d5ab0";
    private static final String HESSEN_GYMNASIUM_UPPER_ECONOMICS_ID = "a334a745-1d67-4e1d-86a5-dadc04f144d2";
    private static final String HESSEN_GYMNASIUM_LOWER_ROOT_ID = "f050ee48-6891-4f83-995f-0f8be5e31b7f";
    private static final String HESSEN_GYMNASIUM_LOWER_MATH_ID = "b167b4cd-4b78-4c84-a721-6b2adbbcab3c";
    private static final String HESSEN_GYMNASIUM_LOWER_PHYSICS_ID = "996d097a-cac2-4b5f-979a-b3a0b9803265";
    private static final String HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID = "bea90c22-b9c5-4c0c-9b10-89d875f50772";
    private static final String HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID = "71438941-0ceb-46ee-ad31-773cee700779";
    private static final String HESSEN_GYMNASIUM_LOWER_FRENCH_ID = "762de708-85fa-4324-958e-56002a318f7f";
    private static final String BAVARIA_GYMNASIUM_MATH_ID = "c1600692-e543-5cf2-a399-6bd96e6b817f";
    private static final String BAVARIA_GYMNASIUM_PHYSICS_ID = "42c2f7e3-91b4-5de8-bef0-d563440e9d52";
    private static final String BAVARIA_GYMNASIUM_CHEMISTRY_ID = "ff1ca997-b6cc-5ece-8e13-5498b4bbf808";
    private static final String BAVARIA_GYMNASIUM_BIOLOGY_ID = "357a7003-b636-570e-a0bd-6bb63518d2f6";
    private static final String BAVARIA_GYMNASIUM_CHINESE_ID = "40744ec5-7de1-5e41-9fc2-a1e774721644";
    private static final String BAVARIA_GYMNASIUM_INFORMATICS_ID = "1af3eba8-749f-5359-8f12-18f87b13616c";
    private static final String BAVARIA_GYMNASIUM_HISTORY_ID = "01c2ba7a-ebd4-5840-bc09-123d7b31c914";
    private static final String BAVARIA_GYMNASIUM_GERMAN_ID = "05f1cd27-5a58-5415-8fda-d4807067f70a";
    private static final String BAVARIA_GYMNASIUM_ENGLISH_ID = "9da8e86b-92dc-5ba0-827e-339400af2b38";
    private static final String BAVARIA_GYMNASIUM_GREEK_ID = "22703293-7307-5ad2-b158-efe6ae28c7c3";
    private static final String BAVARIA_GYMNASIUM_ECONOMICS_ID = "4959d7df-e430-5c1d-bb7b-873d6252a27f";
    private static final String BAVARIA_GYMNASIUM_POLITICS_SOCIETY_ID = "486a8278-39b2-5450-96f8-1076a47b655b";
    private static final String BAVARIA_GYMNASIUM_LATIN_ID = "c7eeaaa4-7c23-5ab7-8643-b7a03760cd6b";
    private static final String BAVARIA_GYMNASIUM_MUSIC_ID = "a00d70bf-3d3c-58fc-af4f-881b29635c2e";
    private static final String BAVARIA_GYMNASIUM_FRENCH_ID = "49aefe0c-f365-5f30-b84f-b9a7699e4f2c";
    private static final String BAVARIA_GYMNASIUM_SPANISH_ID = "8dba4715-f75e-5339-9e99-02236e4b80dd";
    private static final String BAVARIA_GYMNASIUM_ITALIAN_ID = "c7643536-1163-50d8-86a6-9645c8fd3e25";
    private static final String BAVARIA_GYMNASIUM_RUSSIAN_ID = "2b6e79f6-5130-56cb-9a2f-d08e6dc4b4d7";
    private static final String BAVARIA_GYMNASIUM_POLISH_ID = "21148204-794c-515d-ae20-c4d5cd4e56d8";
    private static final String BAVARIA_GYMNASIUM_CZECH_ID = "097f3667-2488-57b2-a3e0-2cb334e422a2";
    private static final String DEFAULT_COURSE_FILTER_ID = "GK";

    @Value("${skillpilot.security.signing-secret}")
    private String signingSecret;

    public LearnerService(
            LearnerRepository learnerRepository,
            LearnerClientStateRepository learnerClientStateRepository,
            MasteryRepository masteryRepository,
            PlannedGoalRepository plannedGoalRepository,
            LandscapeService landscapeService,
            GoalMappingService goalMappingService,
            DeckResourceService deckResourceService,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher) {
        this(
                learnerRepository,
                learnerClientStateRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                deckResourceService,
                null,
                objectMapper,
                eventPublisher,
                new NoOpTransactionManager());
    }

    @Autowired
    public LearnerService(
            LearnerRepository learnerRepository,
            LearnerClientStateRepository learnerClientStateRepository,
            MasteryRepository masteryRepository,
            PlannedGoalRepository plannedGoalRepository,
            LandscapeService landscapeService,
            GoalMappingService goalMappingService,
            DeckResourceService deckResourceService,
            CompositionViewService compositionViewService,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher,
            PlatformTransactionManager transactionManager) {
        this.learnerRepository = learnerRepository;
        this.learnerClientStateRepository = learnerClientStateRepository;
        this.masteryRepository = masteryRepository;
        this.plannedGoalRepository = plannedGoalRepository;
        this.landscapeService = landscapeService;
        this.goalMappingService = goalMappingService;
        this.deckResourceService = deckResourceService;
        this.compositionViewService = compositionViewService;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    private static final class NoOpTransactionManager implements PlatformTransactionManager {
        @Override
        public TransactionStatus getTransaction(TransactionDefinition definition) {
            return new SimpleTransactionStatus();
        }

        @Override
        public void commit(TransactionStatus status) {
            // no-op
        }

        @Override
        public void rollback(TransactionStatus status) {
            // no-op
        }
    }

    private static final class SrsCard {
        private final String id;
        private final String front;
        private final String back;
        private final String category;
        private final List<String> tags;

        private SrsCard(String id, String front, String back, String category, List<String> tags) {
            this.id = id;
            this.front = front;
            this.back = back;
            this.category = category;
            this.tags = tags;
        }
    }

    private record VerifiedRecallContext(
            LearningGoal goal,
            List<SrsCard> cards,
            Map<String, Object> srsState) {
    }

    private record VerifiedRecallDeckStatus(
            int verifiedCards,
            int pendingCards,
            int eligibleCards,
            int blockedCards,
            Instant nextEligibleAt) {
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

    private record CanonicalGymnasiumCutoverPlan(
            Map<String, Object> personalCurriculumConfig,
            List<String> normalizedPlannedGoalIds,
            String normalizedActiveGoalId,
            LearningState normalizedLearningState) {
    }

    private record BulkCanonicalGymnasiumCutoverCounters(
            int migratedCount,
            int eligibleCount,
            int alreadyCanonicalCount,
            int unsupportedCount,
            int noCurriculumCount,
            int notFoundCount,
            int errorCount) {
        private BulkCanonicalGymnasiumCutoverCounters incrementMigrated() {
            return new BulkCanonicalGymnasiumCutoverCounters(
                    migratedCount + 1,
                    eligibleCount,
                    alreadyCanonicalCount,
                    unsupportedCount,
                    noCurriculumCount,
                    notFoundCount,
                    errorCount);
        }

        private BulkCanonicalGymnasiumCutoverCounters incrementEligible() {
            return new BulkCanonicalGymnasiumCutoverCounters(
                    migratedCount,
                    eligibleCount + 1,
                    alreadyCanonicalCount,
                    unsupportedCount,
                    noCurriculumCount,
                    notFoundCount,
                    errorCount);
        }

        private BulkCanonicalGymnasiumCutoverCounters incrementAlreadyCanonical() {
            return new BulkCanonicalGymnasiumCutoverCounters(
                    migratedCount,
                    eligibleCount,
                    alreadyCanonicalCount + 1,
                    unsupportedCount,
                    noCurriculumCount,
                    notFoundCount,
                    errorCount);
        }

        private BulkCanonicalGymnasiumCutoverCounters incrementUnsupported() {
            return new BulkCanonicalGymnasiumCutoverCounters(
                    migratedCount,
                    eligibleCount,
                    alreadyCanonicalCount,
                    unsupportedCount + 1,
                    noCurriculumCount,
                    notFoundCount,
                    errorCount);
        }

        private BulkCanonicalGymnasiumCutoverCounters incrementNoCurriculum() {
            return new BulkCanonicalGymnasiumCutoverCounters(
                    migratedCount,
                    eligibleCount,
                    alreadyCanonicalCount,
                    unsupportedCount,
                    noCurriculumCount + 1,
                    notFoundCount,
                    errorCount);
        }

        private BulkCanonicalGymnasiumCutoverCounters incrementNotFound() {
            return new BulkCanonicalGymnasiumCutoverCounters(
                    migratedCount,
                    eligibleCount,
                    alreadyCanonicalCount,
                    unsupportedCount,
                    noCurriculumCount,
                    notFoundCount + 1,
                    errorCount);
        }

        private BulkCanonicalGymnasiumCutoverCounters incrementError() {
            return new BulkCanonicalGymnasiumCutoverCounters(
                    migratedCount,
                    eligibleCount,
                    alreadyCanonicalCount,
                    unsupportedCount,
                    noCurriculumCount,
                    notFoundCount,
                    errorCount + 1);
        }
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
        return getVocabularySource(goal, null);
    }

    private String getVocabularySource(LearningGoal goal, String language) {
        if (goal == null) {
            return null;
        }
        Map<String, Object> extended = goal.getExtendedData();
        if (extended == null) {
            return null;
        }
        Object source = extended.get("vocabularySource");
        Object sourceEn = extended.get("vocabularySourceEn");
        boolean preferEnglish = language != null && language.trim().toLowerCase(Locale.ROOT).startsWith("en");
        Object preferred = preferEnglish ? sourceEn : source;
        Object fallback = preferEnglish ? source : sourceEn;
        if (preferred instanceof String text && !text.isBlank()) {
            return text;
        }
        return fallback instanceof String text && !text.isBlank() ? text : null;
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
                String front = stringValue(cardMap.get("front"));
                String back = stringValue(cardMap.get("back"));
                String category = stringValue(cardMap.get("category"));
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
                cards.add(new SrsCard(id, front, back, category, tags));
            }
            return cards;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private static String stringValue(Object value) {
        return value instanceof String text ? text : null;
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

    private boolean isSrsMasteredByVerifiedRecall(List<SrsCard> cards, Map<String, Object> srsState) {
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
            if (!isVerifiedRecallPassed(stateMap.get("verifiedRecall"))) {
                return false;
            }
        }
        return true;
    }

    private boolean isVerifiedRecallPassed(Object value) {
        if (!(value instanceof Map<?, ?> verified)) {
            return false;
        }
        Object status = verified.get("status");
        Object passedAt = verified.get("passedAt");
        return "passed".equals(status) && passedAt instanceof String text && !text.isBlank();
    }

    private boolean wasVerifiedRecallTestedOn(Object value, Instant instant) {
        if (!(value instanceof Map<?, ?> verified) || instant == null) {
            return false;
        }
        Object lastTestedAt = verified.get("lastTestedAt");
        Instant testedAt = parseInstant(lastTestedAt);
        if (testedAt == null) {
            return false;
        }
        LocalDate testedDate = testedAt.atZone(VERIFIED_RECALL_DAY_ZONE).toLocalDate();
        LocalDate referenceDate = instant.atZone(VERIFIED_RECALL_DAY_ZONE).toLocalDate();
        return testedDate.equals(referenceDate);
    }

    private Instant parseInstant(Object value) {
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value instanceof Number number) {
            return Instant.ofEpochMilli(number.longValue());
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Instant.parse(text.trim());
            } catch (Exception ignored) {
                try {
                    long epochMillis = Long.parseLong(text.trim());
                    return Instant.ofEpochMilli(epochMillis);
                } catch (Exception ignoredAgain) {
                    return null;
                }
            }
        }
        return null;
    }

    private Instant nextVerifiedRecallEligibleAt(Instant now) {
        return now.atZone(VERIFIED_RECALL_DAY_ZONE)
                .toLocalDate()
                .plusDays(1)
                .atStartOfDay(VERIFIED_RECALL_DAY_ZONE)
                .toInstant();
    }

    private boolean isSrsGoalUnavailableForVerifiedRecall(String skillpilotId, LearningGoal goal) {
        if (goal == null || !isSrsGoal(goal)) {
            return false;
        }
        return !hasVerifiedRecallEligibleCardsToday(skillpilotId, goal);
    }

    private boolean hasVerifiedRecallEligibleCardsToday(String skillpilotId, LearningGoal goal) {
        if (goal == null || !isSrsGoal(goal)) {
            return false;
        }
        String source = getVocabularySource(goal);
        if (source == null || source.isBlank()) {
            return false;
        }
        List<SrsCard> cards = filterSrsCards(goal, loadSrsDeckCards(source));
        if (cards.isEmpty()) {
            return false;
        }
        VerifiedRecallDeckStatus status = summarizeVerifiedRecallDeck(
                cards,
                loadSrsState(skillpilotId, goal.getId()),
                Instant.now());
        return status.eligibleCards() > 0;
    }

    private List<FrontierGoal> filterVerifiedRecallAvailableMemoryGoals(
            String skillpilotId,
            List<FrontierGoal> goals) {
        if (goals == null || goals.isEmpty()) {
            return goals;
        }
        return goals.stream()
                .filter(goal -> !isMemoryFrontierGoalUnavailableForVerifiedRecall(skillpilotId, goal))
                .toList();
    }

    private boolean isMemoryFrontierGoalUnavailableForVerifiedRecall(String skillpilotId, FrontierGoal goal) {
        if (!isMemoryFrontierGoal(goal)) {
            return false;
        }
        LearningGoal definition = landscapeService.getGoalDefinition(goal.id());
        return definition == null || isSrsGoalUnavailableForVerifiedRecall(skillpilotId, definition);
    }

    private Map<String, Double> applySrsMasteryOverlay(String skillpilotId,
            Map<String, LearningGoal> goals,
            Map<String, Double> mastery) {
        if (goals == null || goals.isEmpty()) {
            return mastery;
        }
        Map<String, Double> result = new HashMap<>(mastery);
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
            boolean verified = isSrsMasteredByVerifiedRecall(filtered, srsState);
            result.put(goal.getId(), verified ? 1.0 : 0.0);
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
            if (isSrsMasteredByVerifiedRecall(filtered, srsState)) {
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
        Instant nowInstant = Instant.now();
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
            boolean verified = isSrsMasteredByVerifiedRecall(filtered, srsState);
            result.put(goal.getId(), new MasteryEntryDTO(verified ? 1.0 : 0.0, nowInstant));
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
    public VerifiedRecallPromptResponse startVerifiedRecall(
            String skillpilotId,
            String language,
            VerifiedRecallStartRequest request) {
        VerifiedRecallContext context = resolveVerifiedRecallContext(
                skillpilotId,
                request != null ? request.goalId() : null,
                language);
        return buildVerifiedRecallPromptResponse(
                skillpilotId,
                language,
                context,
                normalizeVerifiedRecallBatchSize(request != null ? request.batchSize() : null));
    }

    @Transactional(readOnly = true)
    public VerifiedRecallAnswerResponse getVerifiedRecallAnswer(
            String skillpilotId,
            String language,
            VerifiedRecallAnswerRequest request) {
        if (request == null || request.cardId() == null || request.cardId().isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall answer requires cardId.");
        }
        VerifiedRecallContext context = resolveVerifiedRecallContext(skillpilotId, request.goalId(), language);
        SrsCard card = findSrsCard(context.cards(), request.cardId());
        if (card == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Card is not part of this memorization goal.");
        }
        return new VerifiedRecallAnswerResponse(
                verifiedRecallAnswerInstruction(language),
                context.goal().getId(),
                card.id,
                card.front,
                card.back,
                card.category);
    }

    @Transactional
    public VerifiedRecallResultResponse recordVerifiedRecallResult(
            String skillpilotId,
            String language,
            VerifiedRecallResultRequest request) {
        if (request == null || request.cardId() == null || request.cardId().isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall result requires cardId.");
        }
        if (request.passed() == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall result requires passed=true or passed=false.");
        }

        VerifiedRecallContext context = resolveVerifiedRecallContext(skillpilotId, request.goalId(), language);
        SrsCard card = findSrsCard(context.cards(), request.cardId());
        if (card == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Card is not part of this memorization goal.");
        }

        Map<String, Object> nextState = new LinkedHashMap<>(context.srsState());
        Map<String, Object> cardState = toMutableStringObjectMap(nextState.get(card.id));
        cardState.put("id", card.id);

        Instant testedAt = Instant.now();
        Map<String, Object> previousVerified = toMutableStringObjectMap(cardState.get("verifiedRecall"));
        if (isVerifiedRecallPassed(previousVerified)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "Card has already been verified for this memorization goal.");
        }
        if (wasVerifiedRecallTestedOn(previousVerified, testedAt)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "Card has already been tested today.");
        }
        applyVerifiedRecallScheduling(cardState, request.passed(), testedAt, request.feedback());
        nextState.put(card.id, cardState);

        upsertClientState(skillpilotId, context.goal().getId(), new ClientStateRequest(testedAt, nextState));

        VerifiedRecallContext updatedContext = new VerifiedRecallContext(
                context.goal(),
                context.cards(),
                nextState);
        VerifiedRecallPromptResponse next = buildVerifiedRecallPromptResponse(
                skillpilotId,
                language,
                updatedContext,
                LEGACY_VERIFIED_RECALL_BATCH_SIZE);
        int verifiedCards = countVerifiedRecall(updatedContext.cards(), updatedContext.srsState());
        int pendingCards = Math.max(0, updatedContext.cards().size() - verifiedCards);
        boolean masterySaved = false;
        if (pendingCards == 0 && isSrsMasteredByVerifiedRecall(updatedContext.cards(), updatedContext.srsState())) {
            persistVerifiedRecallMastery(skillpilotId, context.goal());
            masterySaved = true;
        }
        return new VerifiedRecallResultResponse(
                card.id,
                request.passed(),
                verifiedCards,
                pendingCards,
                masterySaved,
                masterySaved ? context.goal().getId() : null,
                verifiedRecallResultInstruction(language, masterySaved),
                next);
    }

    private void persistVerifiedRecallMastery(String skillpilotId, LearningGoal goal) {
        if (goal == null || goal.getId() == null || goal.getId().isBlank()) {
            return;
        }
        Learner learner = learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        MasteryId id = new MasteryId(skillpilotId, goal.getId());
        Mastery mastery = masteryRepository.findById(id)
                .orElseGet(() -> new Mastery(learner, goal.getId(), 1.0));
        boolean masteryChanged = mastery.getValue() < 1.0;
        mastery.setValue(1.0);
        masteryRepository.save(mastery);

        boolean activeGoalCleared = goal.getId().equals(learner.getActiveGoalId());
        if (activeGoalCleared) {
            learner.setActiveGoalId(null);
            learner.setLearningState(LearningState.FRONTIER);
            learnerRepository.save(learner);
        }

        if (masteryChanged || activeGoalCleared) {
            eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "MASTERY_UPDATE"));
        }
    }

    private VerifiedRecallContext resolveVerifiedRecallContext(String skillpilotId, String requestedGoalId, String language) {
        Learner learner = getLearner(skillpilotId);
        String goalId = requestedGoalId != null && !requestedGoalId.isBlank()
                ? requestedGoalId.trim()
                : learner.getActiveGoalId();
        if (goalId == null || goalId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No active memorization goal. Set an active goal or provide goalId.");
        }

        LearningGoal goal = landscapeService.getGoalDefinition(goalId);
        if (goal == null) {
            throw new ResponseStatusException(NOT_FOUND, "Goal not found");
        }
        if (!isSrsGoal(goal)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "The selected goal is not a memorization/SRS goal.");
        }
        String source = getVocabularySource(goal, language);
        if (source == null || source.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "The memorization goal has no vocabulary source.");
        }

        List<SrsCard> cards = filterSrsCards(goal, loadSrsDeckCards(source));
        if (cards.isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No cards match this memorization goal.");
        }
        return new VerifiedRecallContext(goal, cards, loadSrsState(skillpilotId, goal.getId()));
    }

    private List<SrsCard> filterSrsCards(LearningGoal goal, List<SrsCard> cards) {
        if (cards == null || cards.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> filterTags = getSrsFilterTags(goal);
        if (filterTags.isEmpty()) {
            return cards;
        }
        return cards.stream()
                .filter(card -> card.tags != null && card.tags.stream().anyMatch(filterTags::contains))
                .collect(Collectors.toList());
    }

    private VerifiedRecallPromptResponse buildVerifiedRecallPromptResponse(
            String skillpilotId,
            String language,
            VerifiedRecallContext context,
            int batchSize) {
        Instant now = Instant.now();
        VerifiedRecallDeckStatus status = summarizeVerifiedRecallDeck(context.cards(), context.srsState(), now);
        List<SrsCard> nextCards = selectNextVerifiedRecallCards(context.cards(), context.srsState(), now, batchSize);
        if (nextCards.isEmpty()) {
            boolean complete = status.pendingCards() == 0;
            return new VerifiedRecallPromptResponse(
                    complete ? "complete" : "waiting",
                    complete
                            ? verifiedRecallCompleteInstruction(language)
                            : verifiedRecallWaitingInstruction(language, status),
                    skillpilotId,
                    context.goal().getId(),
                    context.goal().getTitle(),
                    context.cards().size(),
                    status.verifiedCards(),
                    status.pendingCards(),
                    status.eligibleCards(),
                    status.blockedCards(),
                    status.nextEligibleAt() != null ? status.nextEligibleAt().toString() : null,
                    0,
                    Collections.emptyList(),
                    null,
                    null,
                    null);
        }
        List<VerifiedRecallPromptCard> promptCards = nextCards.stream()
                .map(card -> new VerifiedRecallPromptCard(card.id, card.front, card.category))
                .toList();
        SrsCard firstCard = nextCards.get(0);
        return new VerifiedRecallPromptResponse(
                "ready",
                verifiedRecallPromptInstruction(language),
                skillpilotId,
                context.goal().getId(),
                context.goal().getTitle(),
                context.cards().size(),
                status.verifiedCards(),
                status.pendingCards(),
                status.eligibleCards(),
                status.blockedCards(),
                status.nextEligibleAt() != null ? status.nextEligibleAt().toString() : null,
                promptCards.size(),
                promptCards,
                firstCard.id,
                firstCard.front,
                firstCard.category);
    }

    private int countVerifiedRecall(List<SrsCard> cards, Map<String, Object> srsState) {
        if (cards == null || cards.isEmpty() || srsState == null || srsState.isEmpty()) {
            return 0;
        }
        int count = 0;
        for (SrsCard card : cards) {
            Object rawState = srsState.get(card.id);
            if (rawState instanceof Map<?, ?> stateMap && isVerifiedRecallPassed(stateMap.get("verifiedRecall"))) {
                count++;
            }
        }
        return count;
    }

    private SrsCard selectNextVerifiedRecallCard(List<SrsCard> cards, Map<String, Object> srsState) {
        return selectNextVerifiedRecallCard(cards, srsState, Instant.now());
    }

    private SrsCard selectNextVerifiedRecallCard(List<SrsCard> cards, Map<String, Object> srsState, Instant now) {
        List<SrsCard> selected = selectNextVerifiedRecallCards(
                cards,
                srsState,
                now,
                LEGACY_VERIFIED_RECALL_BATCH_SIZE);
        return selected.isEmpty() ? null : selected.get(0);
    }

    private List<SrsCard> selectNextVerifiedRecallCards(
            List<SrsCard> cards,
            Map<String, Object> srsState,
            Instant now,
            int batchSize) {
        if (cards == null || cards.isEmpty() || batchSize <= 0) {
            return Collections.emptyList();
        }
        List<SrsCard> selected = new ArrayList<>();
        for (SrsCard card : cards) {
            Object rawState = srsState != null ? srsState.get(card.id) : null;
            if (!(rawState instanceof Map<?, ?> stateMap)) {
                selected.add(card);
            } else {
                Object verified = stateMap.get("verifiedRecall");
                if (!isVerifiedRecallPassed(verified) && !wasVerifiedRecallTestedOn(verified, now)) {
                    selected.add(card);
                }
            }
            if (selected.size() >= batchSize) {
                return selected;
            }
        }
        return selected;
    }

    private int normalizeVerifiedRecallBatchSize(Integer requestedBatchSize) {
        if (requestedBatchSize == null) {
            return LEGACY_VERIFIED_RECALL_BATCH_SIZE;
        }
        return Math.max(LEGACY_VERIFIED_RECALL_BATCH_SIZE,
                Math.min(MAX_VERIFIED_RECALL_BATCH_SIZE, requestedBatchSize));
    }

    private VerifiedRecallDeckStatus summarizeVerifiedRecallDeck(
            List<SrsCard> cards,
            Map<String, Object> srsState,
            Instant now) {
        if (cards == null || cards.isEmpty()) {
            return new VerifiedRecallDeckStatus(0, 0, 0, 0, null);
        }
        int verifiedCards = 0;
        int eligibleCards = 0;
        int blockedCards = 0;
        for (SrsCard card : cards) {
            Object rawState = srsState != null ? srsState.get(card.id) : null;
            Object verified = rawState instanceof Map<?, ?> stateMap ? stateMap.get("verifiedRecall") : null;
            if (isVerifiedRecallPassed(verified)) {
                verifiedCards++;
            } else if (wasVerifiedRecallTestedOn(verified, now)) {
                blockedCards++;
            } else {
                eligibleCards++;
            }
        }
        int pendingCards = Math.max(0, cards.size() - verifiedCards);
        Instant nextEligibleAt = blockedCards > 0 ? nextVerifiedRecallEligibleAt(now) : null;
        return new VerifiedRecallDeckStatus(verifiedCards, pendingCards, eligibleCards, blockedCards, nextEligibleAt);
    }

    private SrsCard findSrsCard(List<SrsCard> cards, String cardId) {
        if (cards == null || cardId == null) {
            return null;
        }
        String normalized = cardId.trim();
        return cards.stream()
                .filter(card -> normalized.equals(card.id))
                .findFirst()
                .orElse(null);
    }

    private void applyVerifiedRecallScheduling(
            Map<String, Object> cardState,
            boolean passed,
            Instant testedAt,
            String feedback) {
        Map<String, Object> previousVerified = toMutableStringObjectMap(cardState.get("verifiedRecall"));
        int attempts = Math.max(0, numberValue(previousVerified.get("attempts"), 0).intValue()) + 1;
        int failures = Math.max(0, numberValue(previousVerified.get("failures"), 0).intValue()) + (passed ? 0 : 1);

        int previousRepetition = Math.max(0, numberValue(firstPresent(cardState, "repetition", "repetitions"), 0).intValue());
        double previousEf = Math.max(1.3, numberValue(firstPresent(cardState, "ef", "easeFactor"), 2.5).doubleValue());
        int previousInterval = Math.max(0, numberValue(cardState.get("interval"), 0).intValue());

        long now = testedAt.toEpochMilli();
        if (passed) {
            SrsReviewResult review = calculateSrsReview(5, previousInterval, previousEf, previousRepetition);
            cardState.put("interval", review.interval());
            cardState.put("repetition", review.repetition());
            cardState.put("ef", review.ef());
            cardState.put("nextReview", now + review.interval() * 24L * 60L * 60L * 1000L);
        } else {
            cardState.put("interval", 0);
            cardState.put("repetition", 0);
            cardState.put("ef", previousEf);
            cardState.put("nextReview", now);
        }
        cardState.put("lastReviewed", now);

        Map<String, Object> verified = new LinkedHashMap<>();
        verified.put("status", passed ? "passed" : "failed");
        verified.put("attempts", attempts);
        verified.put("failures", failures);
        verified.put("lastTestedAt", testedAt.toString());
        if (passed) {
            verified.put("passedAt", testedAt.toString());
            Object lastFailedAt = previousVerified.get("lastFailedAt");
            if (lastFailedAt instanceof String text && !text.isBlank()) {
                verified.put("lastFailedAt", text);
            }
        } else {
            verified.put("lastFailedAt", testedAt.toString());
            verified.put("nextEligibleAt", nextVerifiedRecallEligibleAt(testedAt).toString());
        }
        if (feedback != null && !feedback.isBlank()) {
            verified.put("lastFeedback", feedback.trim());
        }
        cardState.put("verifiedRecall", verified);
    }

    private record SrsReviewResult(int interval, int repetition, double ef) {
    }

    private SrsReviewResult calculateSrsReview(
            int quality,
            int lastInterval,
            double lastEf,
            int lastRepetition) {
        int interval;
        int repetition;
        double ef;
        if (quality >= 3) {
            if (lastRepetition == 0) {
                interval = 1;
            } else if (lastRepetition == 1) {
                interval = 6;
            } else {
                interval = Math.max(1, (int) Math.round(lastInterval * lastEf));
            }
            repetition = lastRepetition + 1;
            ef = lastEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            if (ef < 1.3) {
                ef = 1.3;
            }
        } else {
            interval = 0;
            repetition = 0;
            ef = lastEf;
        }
        return new SrsReviewResult(interval, repetition, ef);
    }

    private Map<String, Object> toMutableStringObjectMap(Object value) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (value instanceof Map<?, ?> map) {
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (entry.getKey() != null) {
                    result.put(String.valueOf(entry.getKey()), entry.getValue());
                }
            }
        }
        return result;
    }

    private Object firstPresent(Map<String, Object> map, String firstKey, String secondKey) {
        Object first = map.get(firstKey);
        return first != null ? first : map.get(secondKey);
    }

    private Number numberValue(Object value, double fallback) {
        if (value instanceof Number number) {
            return number;
        }
        if (value instanceof String text) {
            try {
                return Double.parseDouble(text.trim());
            } catch (Exception ignored) {
                return fallback;
            }
        }
        return fallback;
    }

    private boolean isEnglish(String language) {
        return language != null && language.trim().toLowerCase(Locale.ROOT).startsWith("en");
    }

    private String verifiedRecallPromptInstruction(String language) {
        return isEnglish(language)
                ? "Ask all returned card prompts as one numbered batch. Do not reveal expected answers before the learner has answered without help. Then call the answer tool and save passed or failed with the result tool for each card."
                : "Stelle alle zurückgegebenen Kartenfragen als einen nummerierten Batch. Verrate die erwarteten Antworten nicht, bevor die Antworten ohne Hilfe abgegeben wurden. Rufe danach je Karte das Antwort-Werkzeug auf und speichere passed oder failed mit dem Ergebnis-Werkzeug.";
    }

    private String verifiedRecallAnswerInstruction(String language) {
        return isEnglish(language)
                ? "Compare the learner answer with the expected answer. Accept equivalent wording when the substance is correct. Then call the result tool with passed=true or passed=false."
                : "Vergleiche die Lernendenantwort mit der erwarteten Antwort. Akzeptiere gleichwertige Formulierungen, wenn die Sache stimmt. Rufe danach das Ergebnis-Werkzeug mit passed=true oder passed=false auf.";
    }

    private String verifiedRecallCompleteInstruction(String language) {
        return isEnglish(language)
                ? "All required cards for this memorization goal are verified. Backend mastery is saved automatically; do not call setMastery. Reload state only if the learner wants the next goal."
                : "Alle erforderlichen Karten dieses Lernkartenziels sind hart geprüft. Das Backend speichert Mastery automatisch; rufe nicht setMastery auf. Lade den Zustand nur neu, wenn das nächste Ziel gewünscht ist.";
    }

    private String verifiedRecallResultInstruction(String language, boolean masterySaved) {
        if (masterySaved) {
            return verifiedRecallCompleteInstruction(language);
        }
        return isEnglish(language)
                ? "Card result saved. Continue with next.status: ask next.cards when ready; if waiting, stop today's flashcard verification."
                : "Kartenergebnis gespeichert. Folge next.status: bei ready nächste cards stellen; bei waiting die heutige Kartenprüfung beenden.";
    }

    private String verifiedRecallWaitingInstruction(String language, VerifiedRecallDeckStatus status) {
        if (isEnglish(language)) {
            return "No further flashcard exam item is available today. Explain mistakes if useful, but do not test today's failed cards again. Continue tomorrow for the remaining "
                    + status.pendingCards() + " card(s).";
        }
        return "Heute ist keine weitere Kartenprüfung verfügbar. Erkläre Fehler bei Bedarf, aber prüfe heute falsch beantwortete Karten nicht noch einmal. Weiter geht es morgen mit den verbleibenden "
                + status.pendingCards() + " Karte(n).";
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
        String projectionStateFilterId = resolveProjectionStateFilterId(learner);
        Map<String, Double> projected = applyCanonicalMasteryProjection(goals, result, projectionStateFilterId);
        return applySrsMasteryOverlay(skillpilotId, goals, projected);
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
        String projectionStateFilterId = resolveProjectionStateFilterId(learner);
        Map<String, MasteryEntryDTO> projected = applyCanonicalMasteryProjectionWithTimestamps(
                goals,
                result,
                projectionStateFilterId);
        return applySrsMasteryOverlayWithTimestamps(skillpilotId, goals, projected);
    }

    @Transactional(readOnly = true)
    public Map<String, MasteryEntryDTO> getMasteryProjectedToGoalIds(String skillpilotId, Set<String> goalIds) {
        if (skillpilotId == null || skillpilotId.isBlank() || goalIds == null || goalIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Learner learner = getLearner(skillpilotId);
        List<Mastery> mastered = masteryRepository.findByLearner_SkillpilotId(skillpilotId);
        Map<String, MasteryEntryDTO> result = new HashMap<>();
        for (Mastery m : mastered) {
            result.put(m.getGoalKey(), new MasteryEntryDTO(m.getValue(), m.getUpdatedAt()));
        }

        Map<String, LearningGoal> goals = new HashMap<>();
        for (String goalId : goalIds) {
            LearningGoal goal = landscapeService.getGoalDefinition(goalId);
            if (goal != null) {
                goals.put(goal.getId(), goal);
            }
        }

        String projectionStateFilterId = resolveProjectionStateFilterId(learner);
        Map<String, MasteryEntryDTO> projected = applyCanonicalMasteryProjectionWithTimestamps(
                goals,
                result,
                projectionStateFilterId);
        return applySrsMasteryOverlayWithTimestamps(skillpilotId, goals, projected);
    }

    private Map<String, Double> applyCanonicalMasteryProjection(Map<String, LearningGoal> goals,
            Map<String, Double> masteryMap,
            String stateFilterId) {
        if (goals == null || goals.isEmpty() || masteryMap == null || masteryMap.isEmpty()) {
            return masteryMap;
        }

        Map<String, Double> projected = new HashMap<>(masteryMap);
        boolean changed = false;

        for (ResolvedGoalMapping mapping : goalMappingService.getAllMappings()) {
            if (!"exact".equals(mapping.matchType())) {
                continue;
            }
            if (!mappingMatchesProjectionStateFilter(mapping, stateFilterId)) {
                continue;
            }
            Double legacyMastery = masteryMap.get(mapping.legacyGoalId());
            if (legacyMastery == null) {
                continue;
            }

            for (String canonicalGoalId : resolveCanonicalProjectionTargetIds(mapping.canonicalGoalId(), goals)) {
                double current = projected.getOrDefault(canonicalGoalId, 0.0);
                if (legacyMastery > current) {
                    projected.put(canonicalGoalId, legacyMastery);
                    changed = true;
                }
            }
        }

        return changed ? projected : masteryMap;
    }

    private Map<String, MasteryEntryDTO> applyCanonicalMasteryProjectionWithTimestamps(Map<String, LearningGoal> goals,
            Map<String, MasteryEntryDTO> masteryMap,
            String stateFilterId) {
        if (goals == null || goals.isEmpty() || masteryMap == null || masteryMap.isEmpty()) {
            return masteryMap;
        }

        Map<String, MasteryEntryDTO> projected = new HashMap<>(masteryMap);
        boolean changed = false;

        for (ResolvedGoalMapping mapping : goalMappingService.getAllMappings()) {
            if (!"exact".equals(mapping.matchType())) {
                continue;
            }
            if (!mappingMatchesProjectionStateFilter(mapping, stateFilterId)) {
                continue;
            }
            MasteryEntryDTO legacyEntry = masteryMap.get(mapping.legacyGoalId());
            if (legacyEntry == null) {
                continue;
            }

            for (String canonicalGoalId : resolveCanonicalProjectionTargetIds(mapping.canonicalGoalId(), goals)) {
                MasteryEntryDTO current = projected.get(canonicalGoalId);
                if (shouldReplaceProjectedEntry(current, legacyEntry)) {
                    projected.put(canonicalGoalId, legacyEntry);
                    changed = true;
                }
            }
        }

        return changed ? projected : masteryMap;
    }

    private List<String> resolveCanonicalProjectionTargetIds(String canonicalGoalId, Map<String, LearningGoal> visibleGoals) {
        if (canonicalGoalId == null || canonicalGoalId.isBlank()) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> targetIds = new LinkedHashSet<>();
        if (isProjectionTargetVisible(canonicalGoalId, visibleGoals)) {
            targetIds.add(canonicalGoalId);
        }
        collectSplitProjectionTargetIds(canonicalGoalId, canonicalGoalId, visibleGoals, targetIds, new HashSet<>());
        return new ArrayList<>(targetIds);
    }

    private void collectSplitProjectionTargetIds(
            String splitParentGoalId,
            String currentGoalId,
            Map<String, LearningGoal> visibleGoals,
            LinkedHashSet<String> targetIds,
            Set<String> visiting) {
        if (splitParentGoalId == null || currentGoalId == null || !visiting.add(currentGoalId)) {
            return;
        }

        try {
            LearningGoal current = resolveProjectionGoal(currentGoalId, visibleGoals);
            if (current == null || current.getContains() == null || current.getContains().isEmpty()) {
                return;
            }

            for (String childRef : current.getContains()) {
                String childId = resolveProjectionGoalRef(childRef, visibleGoals);
                if (childId == null || childId.isBlank()) {
                    continue;
                }
                LearningGoal child = resolveProjectionGoal(childId, visibleGoals);
                if (child == null) {
                    continue;
                }

                String splitFromCanonicalGoalId = landscapeService.resolveGoalProvenanceValue(
                        child,
                        "splitFromCanonicalGoalId");
                if (splitParentGoalId.equals(splitFromCanonicalGoalId)
                        && isProjectionTargetVisible(child.getId(), visibleGoals)) {
                    targetIds.add(child.getId());
                }

                collectSplitProjectionTargetIds(splitParentGoalId, child.getId(), visibleGoals, targetIds, visiting);
            }
        } finally {
            visiting.remove(currentGoalId);
        }
    }

    private LearningGoal resolveProjectionGoal(String goalId, Map<String, LearningGoal> visibleGoals) {
        if (goalId == null || goalId.isBlank()) {
            return null;
        }
        if (visibleGoals != null && !visibleGoals.isEmpty() && visibleGoals.containsKey(goalId)) {
            return visibleGoals.get(goalId);
        }
        return landscapeService.getGoalDefinition(goalId);
    }

    private String resolveProjectionGoalRef(String goalRef, Map<String, LearningGoal> visibleGoals) {
        if (goalRef == null || goalRef.isBlank()) {
            return null;
        }
        if (visibleGoals != null && !visibleGoals.isEmpty()) {
            String visibleGoalId = resolveGoalRef(goalRef, visibleGoals);
            if (visibleGoalId != null) {
                return visibleGoalId;
            }
        }

        LearningGoal goal = landscapeService.getGoalDefinition(goalRef);
        if (goal == null && goalRef.contains(":")) {
            goal = landscapeService.getGoalDefinition(goalRef.substring(goalRef.indexOf(':') + 1));
        }
        return goal == null ? null : goal.getId();
    }

    private boolean isProjectionTargetVisible(String goalId, Map<String, LearningGoal> visibleGoals) {
        return visibleGoals == null || visibleGoals.isEmpty() || visibleGoals.containsKey(goalId);
    }

    private boolean mappingMatchesProjectionStateFilter(ResolvedGoalMapping mapping, String stateFilterId) {
        if (stateFilterId == null || stateFilterId.isBlank()) {
            return true;
        }
        if (mapping == null) {
            return false;
        }
        String sourceJurisdiction = normalizeFilterId(
                landscapeService.resolveSourceLandscapeJurisdiction(mapping.sourceLandscapeId()));
        return stateFilterId.equals(sourceJurisdiction);
    }

    private boolean shouldReplaceProjectedEntry(MasteryEntryDTO current, MasteryEntryDTO candidate) {
        if (candidate == null) {
            return false;
        }
        if (current == null) {
            return true;
        }
        if (candidate.value() > current.value()) {
            return true;
        }
        if (candidate.value() < current.value()) {
            return false;
        }
        Instant currentTs = current.updatedAt();
        Instant candidateTs = candidate.updatedAt();
        if (currentTs == null) {
            return candidateTs != null;
        }
        if (candidateTs == null) {
            return false;
        }
        return candidateTs.isAfter(currentTs);
    }

    private String mapGoalIdForVisibleGoals(String goalId, Map<String, LearningGoal> visibleGoals, boolean allowPartial) {
        if (goalId == null || goalId.isBlank()) {
            return null;
        }
        if (visibleGoals == null || visibleGoals.isEmpty()) {
            return goalId;
        }
        if (visibleGoals.containsKey(goalId)) {
            return goalId;
        }
        List<ResolvedGoalMapping> mappings = goalMappingService.findAllByLegacyGoalId(goalId);
        if (!mappings.isEmpty()) {
            for (ResolvedGoalMapping mapping : mappings) {
                if (!allowPartial && !"exact".equals(mapping.matchType())) {
                    continue;
                }
                if (visibleGoals.containsKey(mapping.canonicalGoalId())) {
                    return mapping.canonicalGoalId();
                }
            }
        }
        if (isKnownCanonicalGoalId(goalId)) {
            return goalId;
        }
        String provenanceMappedGoalId = findCanonicalGoalIdByLegacySourceId(goalId, visibleGoals);
        if (provenanceMappedGoalId != null) {
            return provenanceMappedGoalId;
        }
        return goalId;
    }

    private boolean isKnownCanonicalGoalId(String goalId) {
        if (goalId == null || goalId.isBlank()) {
            return false;
        }
        String landscapeId = landscapeService.getLandscapeIdForGoal(goalId);
        if (landscapeId == null || landscapeId.isBlank()) {
            return false;
        }
        return isCanonicalGymnasiumLandscape(landscapeService.getById(landscapeId));
    }

    private String resolveGoalIdInVisibleGoals(String goalId, Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        String mappedGoalId = mapGoalIdForVisibleGoals(goalId, visibleGoals, allowPartial);
        if (mappedGoalId == null || mappedGoalId.isBlank()) {
            return null;
        }
        if (visibleGoals == null || visibleGoals.isEmpty()) {
            return mappedGoalId;
        }
        return visibleGoals.containsKey(mappedGoalId) ? mappedGoalId : null;
    }

    private List<String> mapGoalIdsForVisibleGoals(List<String> goalIds, Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        if (goalIds == null || goalIds.isEmpty()) {
            return Collections.emptyList();
        }
        LinkedHashSet<String> mappedGoalIds = new LinkedHashSet<>();
        for (String goalId : goalIds) {
            String mappedGoalId = mapGoalIdForVisibleGoals(goalId, visibleGoals, allowPartial);
            if (mappedGoalId != null && !mappedGoalId.isBlank()) {
                mappedGoalIds.add(mappedGoalId);
            }
        }
        return new ArrayList<>(mappedGoalIds);
    }

    private List<String> normalizePlannedGoalIdsForVisibleGoals(List<String> goalIds,
            Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        List<String> mappedGoalIds = mapGoalIdsForVisibleGoals(goalIds, visibleGoals, allowPartial);
        return collapseContainedGoalIds(mappedGoalIds, visibleGoals);
    }

    private List<String> resolvePlannedGoalIdsForScope(List<String> goalIds,
            Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        if (goalIds == null || goalIds.isEmpty()) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> resolvedGoalIds = new LinkedHashSet<>();
        for (String goalId : goalIds) {
            List<String> compositionGoalIds = resolveCompositionStructureGoalIds(goalId, visibleGoals, allowPartial);
            if (!compositionGoalIds.isEmpty()) {
                resolvedGoalIds.addAll(compositionGoalIds);
                continue;
            }

            String mappedGoalId = mapGoalIdForVisibleGoals(goalId, visibleGoals, allowPartial);
            if (mappedGoalId != null && !mappedGoalId.isBlank()) {
                resolvedGoalIds.add(mappedGoalId);
            }
        }

        return collapseContainedGoalIds(new ArrayList<>(resolvedGoalIds), visibleGoals);
    }

    private List<String> resolveCompositionStructureGoalIds(String goalId,
            Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        if (compositionViewService == null || goalId == null || goalId.isBlank()) {
            return Collections.emptyList();
        }

        CompositionViewService.CompositionStructureResolution resolution =
                compositionViewService.resolveStructureReference(goalId);
        if (resolution == null || resolution.referencedGoalIds().isEmpty()) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> mappedGoalIds = new LinkedHashSet<>();
        for (String referencedGoalId : resolution.referencedGoalIds()) {
            String mappedGoalId = mapGoalIdForVisibleGoals(referencedGoalId, visibleGoals, allowPartial);
            if (mappedGoalId != null && !mappedGoalId.isBlank()) {
                mappedGoalIds.add(mappedGoalId);
            }
        }
        return new ArrayList<>(mappedGoalIds);
    }

    private List<String> collapseContainedGoalIds(List<String> goalIds, Map<String, LearningGoal> visibleGoals) {
        if (goalIds == null || goalIds.isEmpty() || visibleGoals == null || visibleGoals.isEmpty()) {
            return goalIds == null ? Collections.emptyList() : goalIds;
        }

        LinkedHashSet<String> orderedGoalIds = new LinkedHashSet<>(goalIds);
        Set<String> redundantGoalIds = new HashSet<>();
        for (String goalId : orderedGoalIds) {
            if (!visibleGoals.containsKey(goalId)) {
                continue;
            }
            Set<String> descendants = new HashSet<>();
            collectDescendants(goalId, visibleGoals, descendants);
            redundantGoalIds.addAll(descendants);
        }

        return orderedGoalIds.stream()
                .filter(goalId -> !redundantGoalIds.contains(goalId))
                .toList();
    }

    private String findCanonicalGoalIdByLegacySourceId(String legacyGoalId, Map<String, LearningGoal> visibleGoals) {
        if (legacyGoalId == null || legacyGoalId.isBlank() || visibleGoals == null || visibleGoals.isEmpty()) {
            return null;
        }
        for (LearningGoal goal : visibleGoals.values()) {
            String sourceGoalId = landscapeService.resolveGoalProvenanceValue(goal, "sourceGoalId");
            if (legacyGoalId.equals(sourceGoalId)) {
                return goal.getId();
            }
        }
        return null;
    }

    @Transactional
    public MasteryUpdateResponse setMastery(String skillpilotId, MasteryUpdateRequest request) {
        Map<String, Double> requestedMastery = request == null ? null : request.mastery();
        if (request == null || requestedMastery == null || requestedMastery.isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "mastery must contain exactly one goal update.");
        }
        if (requestedMastery.size() != 1) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "mastery must contain exactly one goal update.");
        }

        Learner learner = learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));

        Map<String, LearningGoal> visibleGoals = Collections.emptyMap();
        if (learner.getSelectedCurriculum() != null && !learner.getSelectedCurriculum().isBlank()) {
            visibleGoals = getFilteredGoals(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        }

        String activeGoalId = resolveGoalIdInVisibleGoals(learner.getActiveGoalId(), visibleGoals, false);
        String requestedGoalId = request.goalId();
        requestedGoalId = mapGoalIdForVisibleGoals(requestedGoalId, visibleGoals, false);
        Map.Entry<String, Double> masteryEntry = requestedMastery.entrySet().iterator().next();
        if (masteryEntry.getKey() == null || masteryEntry.getKey().isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "mastery goalId must not be empty.");
        }
        if (masteryEntry.getValue() == null
                || masteryEntry.getValue().isNaN()
                || masteryEntry.getValue().isInfinite()
                || masteryEntry.getValue() < 0.0
                || masteryEntry.getValue() > 1.0) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "mastery value must be between 0.0 and 1.0.");
        }
        String masteryEntryGoalId = mapGoalIdForVisibleGoals(masteryEntry.getKey(), visibleGoals, false);
        if ((requestedGoalId == null || requestedGoalId.isBlank()) && masteryEntryGoalId != null) {
            requestedGoalId = masteryEntryGoalId;
        }
        if (requestedGoalId != null && !requestedGoalId.isBlank()
                && masteryEntryGoalId != null && !requestedGoalId.equals(masteryEntryGoalId)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "goalId must match the mastery map entry.");
        }
        if (activeGoalId != null && !activeGoalId.isBlank()
                && masteryEntryGoalId != null && !activeGoalId.equals(masteryEntryGoalId)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "mastery update must target the active goal.");
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
                        && effectiveGoalId.equals(masteryEntryGoalId)
                        && masteryEntry.getValue() < currentMastery;

                // Allow explicit correction (e.g. reset from 1.0 to 0.0) even if the goal
                // is currently outside the frontier.
                if (explicitCorrection) {
                    // continue with save flow
                } else if (currentMastery >= 0.9) {
                    UnifiedLearnerStateResponse state = getLearnerState(skillpilotId);
                    return new MasteryUpdateResponse(
                            true,
                            effectiveGoalId,
                            currentMastery,
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

        double masteryValue = masteryEntry.getValue();

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

        String sequentialAutopilotAnchorGoalId = masteryValue >= 0.9 ? effectiveGoalId : null;
        UnifiedLearnerStateResponse state = getLearnerState(skillpilotId, sequentialAutopilotAnchorGoalId);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "MASTERY_UPDATE"));
        return new MasteryUpdateResponse(
                true,
                effectiveGoalId,
                masteryValue,
                state.frontier(),
                state.nextAllowedActions(),
                state.learningState(),
                state.activeGoal(),
                state.stateMachine(),
                state.goals());
    }

    @Transactional(readOnly = true)
    public List<String> getPlannedGoals(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        List<String> storedPlannedGoals = getStoredPlannedGoals(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return storedPlannedGoals;
        }
        Map<String, LearningGoal> structuralGoals = getFilteredGoals(curriculumId, "{}");
        return normalizePlannedGoalIdsForVisibleGoals(storedPlannedGoals, structuralGoals, true);
    }

    private List<String> getStoredPlannedGoals(String skillpilotId) {
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
        if (learner.getSelectedCurriculum() != null && !learner.getSelectedCurriculum().isBlank()) {
            Map<String, LearningGoal> structuralGoals = getFilteredGoals(learner.getSelectedCurriculum(), "{}");
            saneTargetIds = new LinkedHashSet<>(normalizePlannedGoalIdsForVisibleGoals(new ArrayList<>(saneTargetIds),
                    structuralGoals, true));
        }
        final Set<String> normalizedTargetIds = saneTargetIds;

        List<PlannedGoal> toDelete = existing.stream()
                .filter(pg -> !normalizedTargetIds.contains(pg.getGoalId()))
                .toList();
        plannedGoalRepository.deleteAll(toDelete);

        List<PlannedGoal> toAdd = normalizedTargetIds.stream()
                .filter(id -> !existingIds.contains(id))
                .map(id -> new PlannedGoal(learner, id))
                .toList();
        plannedGoalRepository.saveAll(toAdd);

        // Validation: Verify Active Goal is still in Scope
        String storedActiveGoalId = learner.getActiveGoalId();
        if (storedActiveGoalId != null && !storedActiveGoalId.isBlank()) {
            String curriculumId = learner.getSelectedCurriculum();
            if (curriculumId != null) {
                Map<String, LearningGoal> allGoals = getFilteredGoals(curriculumId, learner.getPersonalCurriculum());
                Map<String, LearningGoal> structuralGoals = getFilteredGoals(curriculumId, "{}");
                List<String> newPlannedIds = new ArrayList<>(normalizedTargetIds);
                String activeGoalId = resolveGoalIdInVisibleGoals(storedActiveGoalId, allGoals, false);
                boolean activeGoalOutOfScope = activeGoalId != null
                        && isGoalOutOfPlannedScope(activeGoalId, newPlannedIds, structuralGoals, null);

                if (activeGoalOutOfScope) {
                    clearPersistedActiveGoal(learner, skillpilotId, "ACTIVE_GOAL_CLEARED_OUT_OF_SCOPE");
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

    @Transactional(readOnly = true)
    public void assertWritableLearningSession(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        if (!isReadOnlyCompatibilitySession(learner)
                && !isReadOnlyLowerSecondaryLegacySession(learner)
                && !isReadOnlyBavariaLegacySession(learner)) {
            return;
        }
        throw new ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT,
                "This retired legacy learner session is read-only. Use the canonical cutover flow before changing learner state.");
    }

    @Transactional(readOnly = true)
    public void assertActiveLearnerRouteAccess(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        if (!isReadOnlyCompatibilitySession(learner)) {
            return;
        }
        throw new ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT,
                "This compatibility-only learner session is retired as a normal learner route. Use the canonical cutover flow or download a compatibility archive instead.");
    }

    @Transactional(readOnly = true)
    public List<LearningLandscape> getLearnerLandscapeClosure(String skillpilotId, String landscapeId, String lang) {
        Learner learner = getLearner(skillpilotId);
        List<LearningLandscape> localizedClosure = landscapeService.getClosure(landscapeId, lang);
        Map<String, LearningGoal> visibleGoals = getFilteredGoals(landscapeId, learner.getPersonalCurriculum());
        if (localizedClosure == null || localizedClosure.isEmpty()) {
            return Collections.emptyList();
        }

        List<LearningLandscape> scopedClosure = new ArrayList<>();
        for (LearningLandscape landscape : localizedClosure) {
            List<LearningGoal> sourceGoals = landscape.getGoals();
            if (sourceGoals == null || sourceGoals.isEmpty()) {
                continue;
            }

            List<LearningGoal> filteredGoals = new ArrayList<>();
            for (LearningGoal goal : sourceGoals) {
                if (!visibleGoals.containsKey(goal.getId())) {
                    continue;
                }
                filteredGoals.add(cloneScopedGoal(goal, visibleGoals));
            }

            if (filteredGoals.isEmpty()) {
                continue;
            }

            LearningLandscape scopedLandscape = objectMapper.convertValue(landscape, LearningLandscape.class);
            scopedLandscape.setGoals(filteredGoals);
            if (scopedLandscape.getGoalPlacements() != null) {
                scopedLandscape.setGoalPlacements(scopedLandscape.getGoalPlacements().stream()
                        .filter(placement -> placement != null
                                && placement.getGoalId() != null
                                && visibleGoals.containsKey(placement.getGoalId()))
                        .collect(Collectors.toList()));
            }
            scopedClosure.add(scopedLandscape);
        }

        return scopedClosure;
    }

    private boolean isReadOnlyCompatibilitySession(Learner learner) {
        if (learner == null) {
            return false;
        }
        String curriculumId = learner.getSelectedCurriculum();
        return curriculumId != null
                && !curriculumId.isBlank()
                && landscapeService.isCompatibilityOnlyLandscape(curriculumId);
    }

    private boolean isReadOnlyLowerSecondaryLegacySession(Learner learner) {
        if (learner == null) {
            return false;
        }
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return false;
        }
        if (!HESSEN_GYMNASIUM_LOWER_ROOT_ID.equals(curriculumId)
                && !HESSEN_GYMNASIUM_LOWER_MATH_ID.equals(curriculumId)
                && !HESSEN_GYMNASIUM_LOWER_PHYSICS_ID.equals(curriculumId)
                && !HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID.equals(curriculumId)
                && !HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID.equals(curriculumId)
                && !HESSEN_GYMNASIUM_LOWER_FRENCH_ID.equals(curriculumId)) {
            return false;
        }
        List<String> storedPlannedGoals = plannedGoalRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())
                .stream()
                .map(PlannedGoal::getGoalId)
                .toList();
        HessenLowerSecondarySelection selection = inferLowerSecondarySelectionState(learner, storedPlannedGoals);
        return selection.mathSelected()
                || selection.physicsSelected()
                || selection.chemistrySelected()
                || selection.biologySelected()
                || selection.frenchSelected();
    }

    private boolean isReadOnlyBavariaLegacySession(Learner learner) {
        if (learner == null) {
            return false;
        }
        String curriculumId = learner.getSelectedCurriculum();
        return BAVARIA_GYMNASIUM_MATH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_PHYSICS_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_CHEMISTRY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_BIOLOGY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_CHINESE_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_INFORMATICS_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_HISTORY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_GERMAN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_ENGLISH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_GREEK_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_ECONOMICS_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_POLITICS_SOCIETY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_LATIN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_MUSIC_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_FRENCH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_SPANISH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_ITALIAN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_RUSSIAN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_POLISH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_CZECH_ID.equals(curriculumId);
    }

    @Transactional
    public void setCurriculum(String skillpilotId, String curriculumId) {
        String effectiveCurriculumId = curriculumId == null ? null : curriculumId.trim();
        if (effectiveCurriculumId == null || effectiveCurriculumId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "curriculumId must not be empty.");
        }
        if (landscapeService.getById(effectiveCurriculumId) == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid curriculum ID: " + effectiveCurriculumId);
        }
        if (landscapeService.isCompatibilityOnlyLandscape(effectiveCurriculumId)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    buildCompatibilityOnlyRetirementMessage(effectiveCurriculumId));
        }
        Learner learner = getLearner(skillpilotId);
        boolean curriculumChanged = !Objects.equals(learner.getSelectedCurriculum(), effectiveCurriculumId);
        learner.setSelectedCurriculum(effectiveCurriculumId);
        if (curriculumChanged) {
            learner.setActiveGoalId(null);
        }
        learner.setLearningState(LearningState.FRONTIER);
        learnerRepository.save(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "CURRICULUM_UPDATE"));
    }

    @Transactional
    public List<String> cutoverLegacyHessenGymnasiumToCanonical(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        String currentCurriculumId = learner.getSelectedCurriculum();
        if (currentCurriculumId == null || currentCurriculumId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No curriculum selected for cutover.");
        }
        if (CANONICAL_GYMNASIUM_ROOT_ID.equals(currentCurriculumId)) {
            materializeCanonicalMasteryFromExactMappings(skillpilotId);
            materializeCanonicalClientStateFromExactMappings(skillpilotId);
            return getPlannedGoals(skillpilotId);
        }
        if (!isSupportedCanonicalGymnasiumCutoverSource(currentCurriculumId)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Unsupported curriculum for canonical Gymnasium cutover: " + currentCurriculumId);
        }

        List<String> storedPlannedGoals = getStoredPlannedGoals(skillpilotId);
        CanonicalGymnasiumCutoverPlan plan = buildCanonicalGymnasiumCutoverPlan(learner, storedPlannedGoals);
        String personalCurriculumJson = writePersonalCurriculumConfig(plan.personalCurriculumConfig());

        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(personalCurriculumJson);
        learner.setActiveGoalId(null);
        learner.setLearningState(LearningState.FRONTIER);
        learnerRepository.save(learner);
        materializeCanonicalMasteryFromExactMappings(skillpilotId);
        materializeCanonicalClientStateFromExactMappings(skillpilotId);

        Learner refreshed = getLearner(skillpilotId);
        refreshed.setActiveGoalId(plan.normalizedActiveGoalId());
        refreshed.setLearningState(plan.normalizedLearningState());
        learnerRepository.save(refreshed);

        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "CURRICULUM_CUTOVER"));
        return plan.normalizedPlannedGoalIds();
    }

    @Transactional
    public List<String> cutoverLegacyHessenGymnasiumToCanonicalAndPersistPlannedGoals(String skillpilotId) {
        List<String> normalizedPlannedGoalIds = cutoverLegacyHessenGymnasiumToCanonical(skillpilotId);
        return setPlannedGoals(skillpilotId, new LinkedHashSet<>(normalizedPlannedGoalIds));
    }

    public BulkCanonicalGymnasiumCutoverResponse bulkCutoverLegacyHessenGymnasiumToCanonical(
            Set<String> requestedSkillpilotIds,
            boolean dryRun) {
        LinkedHashSet<String> skillpilotIds = requestedSkillpilotIds == null
                ? new LinkedHashSet<>()
                : requestedSkillpilotIds.stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(id -> !id.isBlank())
                        .collect(Collectors.toCollection(LinkedHashSet::new));

        List<BulkCanonicalGymnasiumCutoverResult> results = new ArrayList<>();
        BulkCanonicalGymnasiumCutoverCounters counters = new BulkCanonicalGymnasiumCutoverCounters(0, 0, 0, 0, 0, 0,
                0);

        for (String skillpilotId : skillpilotIds) {
            Learner learner = learnerRepository.findById(skillpilotId).orElse(null);
            if (learner == null) {
                results.add(new BulkCanonicalGymnasiumCutoverResult(
                        skillpilotId,
                        "not_found",
                        null,
                        null,
                        0,
                        "Learner not found."));
                counters = counters.incrementNotFound();
                continue;
            }

            String previousCurriculumId = learner.getSelectedCurriculum();
            if (previousCurriculumId == null || previousCurriculumId.isBlank()) {
                results.add(new BulkCanonicalGymnasiumCutoverResult(
                        skillpilotId,
                        "no_curriculum",
                        null,
                        null,
                        0,
                        "No curriculum selected for cutover."));
                counters = counters.incrementNoCurriculum();
                continue;
            }

            if (CANONICAL_GYMNASIUM_ROOT_ID.equals(previousCurriculumId)) {
                results.add(new BulkCanonicalGymnasiumCutoverResult(
                        skillpilotId,
                        "already_canonical",
                        previousCurriculumId,
                        previousCurriculumId,
                        getStoredPlannedGoals(skillpilotId).size(),
                        "Learner already uses Gymnasium (DE)."));
                counters = counters.incrementAlreadyCanonical();
                continue;
            }

            if (!isSupportedCanonicalGymnasiumCutoverSource(previousCurriculumId)) {
                results.add(new BulkCanonicalGymnasiumCutoverResult(
                        skillpilotId,
                        "unsupported_curriculum",
                        previousCurriculumId,
                        previousCurriculumId,
                        0,
                        "Unsupported curriculum for canonical Gymnasium cutover."));
                counters = counters.incrementUnsupported();
                continue;
            }

            if (dryRun) {
                List<String> normalizedPlannedGoalIds = buildCanonicalGymnasiumCutoverPlan(learner,
                        getStoredPlannedGoals(skillpilotId)).normalizedPlannedGoalIds();
                results.add(new BulkCanonicalGymnasiumCutoverResult(
                        skillpilotId,
                        "eligible",
                        previousCurriculumId,
                        CANONICAL_GYMNASIUM_ROOT_ID,
                        normalizedPlannedGoalIds.size(),
                        "Learner can be migrated without mastery-history loss."));
                counters = counters.incrementEligible();
                continue;
            }

            try {
                List<String> normalizedPlannedGoalIds = transactionTemplate.execute(
                        status -> cutoverLegacyHessenGymnasiumToCanonicalAndPersistPlannedGoals(skillpilotId));
                if (normalizedPlannedGoalIds == null) {
                    throw new IllegalStateException("Cutover transaction returned no result.");
                }
                results.add(new BulkCanonicalGymnasiumCutoverResult(
                        skillpilotId,
                        "migrated",
                        previousCurriculumId,
                        CANONICAL_GYMNASIUM_ROOT_ID,
                        normalizedPlannedGoalIds.size(),
                        "Learner migrated to Gymnasium (DE)."));
                counters = counters.incrementMigrated();
            } catch (RuntimeException ex) {
                results.add(new BulkCanonicalGymnasiumCutoverResult(
                        skillpilotId,
                        "error",
                        previousCurriculumId,
                        previousCurriculumId,
                        0,
                        ex.getMessage()));
                counters = counters.incrementError();
            }
        }

        return new BulkCanonicalGymnasiumCutoverResponse(
                dryRun,
                skillpilotIds.size(),
                counters.migratedCount(),
                counters.eligibleCount(),
                counters.alreadyCanonicalCount(),
                counters.unsupportedCount(),
                counters.noCurriculumCount(),
                counters.notFoundCount(),
                counters.errorCount(),
                results);
    }

    @Transactional
    public void setPersonalCurriculum(String skillpilotId, Map<String, Object> config, List<String> goalIds,
            List<String> filters) {
        Learner learner = getLearner(skillpilotId);

        Map<String, Object> finalConfig = normalizePersonalCurriculumPayload(config);

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
            String durationModel = effectiveFilters.stream()
                    .map(this::normalizeFilterId)
                    .filter(DURATION_MODEL_FILTER_IDS::contains)
                    .findFirst()
                    .orElse(null);
            String primaryFilter = effectiveFilters.stream()
                    .map(this::normalizeFilterId)
                    .filter(filter -> filter != null && !DURATION_MODEL_FILTER_IDS.contains(filter))
                    .findFirst()
                    .orElse(null);
            if (primaryFilter != null && !primaryFilter.isBlank()) {
                settings.put("filterId", primaryFilter);
            }
            if (durationModel != null) {
                settings.put("durationModel", durationModel);
            }
            finalConfig.put(landscapeId, settings);
        }

        try {
            String json = objectMapper.writeValueAsString(finalConfig);
            learner.setPersonalCurriculum(json);
            if (isSelectedInPersonalCurriculum(finalConfig.get(CANONICAL_GYMNASIUM_ROOT_ID))) {
                learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
            }
            learnerRepository.save(learner);
        } catch (Exception e) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid personalization config");
        }
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "PERSONALIZATION_UPDATE"));
    }

    private boolean isSelectedInPersonalCurriculum(Object rawConfig) {
        if (!(rawConfig instanceof Map<?, ?> config)) {
            return false;
        }
        Object selected = config.get("selected");
        return selected instanceof Boolean && (Boolean) selected;
    }

    private boolean isSupportedCanonicalGymnasiumCutoverSource(String curriculumId) {
        return HESSEN_GYMNASIUM_UPPER_ROOT_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_MATH_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_PHYSICS_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_HISTORY_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_GERMAN_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_ENGLISH_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_FRENCH_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_LATIN_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_SPANISH_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_GREEK_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_CHINESE_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_MUSIC_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_UPPER_ECONOMICS_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_ROOT_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_MATH_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_PHYSICS_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_FRENCH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_MATH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_PHYSICS_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_CHEMISTRY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_BIOLOGY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_CHINESE_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_INFORMATICS_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_HISTORY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_GERMAN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_ENGLISH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_GREEK_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_ECONOMICS_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_POLITICS_SOCIETY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_LATIN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_MUSIC_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_FRENCH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_SPANISH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_ITALIAN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_RUSSIAN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_POLISH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_CZECH_ID.equals(curriculumId);
    }

    private CanonicalGymnasiumCutoverPlan buildCanonicalGymnasiumCutoverPlan(Learner learner, List<String> storedPlannedGoals) {
        if (isSupportedHessenGymnasiumLowerCutoverSource(learner.getSelectedCurriculum())) {
            return buildLowerSecondaryCanonicalGymnasiumCutoverPlan(learner, storedPlannedGoals);
        }
        if (isSupportedBavariaGymnasiumCutoverSource(learner.getSelectedCurriculum())) {
            return buildBavariaCanonicalGymnasiumCutoverPlan(learner, storedPlannedGoals);
        }

        Map<String, Map<String, Object>> legacyConfig = parsePersonalCurriculumConfig(learner.getPersonalCurriculum());
        String currentCurriculumId = learner.getSelectedCurriculum();
        String activeGoalId = learner.getActiveGoalId();

        boolean mathSelected = HESSEN_GYMNASIUM_UPPER_MATH_ID.equals(currentCurriculumId);
        boolean physicsSelected = HESSEN_GYMNASIUM_UPPER_PHYSICS_ID.equals(currentCurriculumId);
        boolean chemistrySelected = HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID.equals(currentCurriculumId);
        boolean biologySelected = HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID.equals(currentCurriculumId);
        boolean informaticsSelected = HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID.equals(currentCurriculumId);
        boolean historySelected = HESSEN_GYMNASIUM_UPPER_HISTORY_ID.equals(currentCurriculumId);
        boolean germanSelected = HESSEN_GYMNASIUM_UPPER_GERMAN_ID.equals(currentCurriculumId);
        boolean politicsEconomicsSelected = HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID.equals(currentCurriculumId);
        boolean englishSelected = HESSEN_GYMNASIUM_UPPER_ENGLISH_ID.equals(currentCurriculumId);
        boolean frenchSelected = HESSEN_GYMNASIUM_UPPER_FRENCH_ID.equals(currentCurriculumId);
        boolean latinSelected = HESSEN_GYMNASIUM_UPPER_LATIN_ID.equals(currentCurriculumId);
        boolean spanishSelected = HESSEN_GYMNASIUM_UPPER_SPANISH_ID.equals(currentCurriculumId);
        boolean greekSelected = HESSEN_GYMNASIUM_UPPER_GREEK_ID.equals(currentCurriculumId);
        boolean chineseSelected = HESSEN_GYMNASIUM_UPPER_CHINESE_ID.equals(currentCurriculumId);
        boolean musicSelected = HESSEN_GYMNASIUM_UPPER_MUSIC_ID.equals(currentCurriculumId);
        boolean economicsSelected = HESSEN_GYMNASIUM_UPPER_ECONOMICS_ID.equals(currentCurriculumId);

        if (HESSEN_GYMNASIUM_UPPER_ROOT_ID.equals(currentCurriculumId)) {
            mathSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_MATH_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_MATH_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_MATH_ID);
            physicsSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_PHYSICS_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_PHYSICS_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_PHYSICS_ID);
            chemistrySelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID);
            biologySelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID);
            informaticsSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID);
            historySelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_HISTORY_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_HISTORY_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_HISTORY_ID);
            germanSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_GERMAN_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_GERMAN_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_GERMAN_ID);
            politicsEconomicsSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID);
            englishSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_ENGLISH_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_ENGLISH_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_ENGLISH_ID);
            frenchSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_FRENCH_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_FRENCH_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_FRENCH_ID);
            latinSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_LATIN_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_LATIN_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_LATIN_ID);
            spanishSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_SPANISH_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_SPANISH_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_SPANISH_ID);
            greekSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_GREEK_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_GREEK_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_GREEK_ID);
            chineseSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_CHINESE_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_CHINESE_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_CHINESE_ID);
            musicSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_MUSIC_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_MUSIC_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_MUSIC_ID);
            economicsSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_UPPER_ECONOMICS_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_UPPER_ECONOMICS_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_UPPER_ECONOMICS_ID);
            if (!mathSelected && !physicsSelected && !chemistrySelected && !biologySelected && !informaticsSelected
                    && !historySelected && !germanSelected && !politicsEconomicsSelected && !englishSelected
                    && !frenchSelected && !latinSelected && !spanishSelected && !greekSelected && !chineseSelected
                    && !musicSelected
                    && !economicsSelected) {
                mathSelected = true;
                physicsSelected = true;
                chemistrySelected = true;
                biologySelected = true;
                informaticsSelected = true;
                historySelected = true;
                germanSelected = true;
                politicsEconomicsSelected = true;
                englishSelected = true;
                frenchSelected = true;
                latinSelected = true;
                spanishSelected = true;
                greekSelected = true;
                chineseSelected = true;
                musicSelected = true;
                economicsSelected = true;
            }
        }

        if (physicsSelected) {
            mathSelected = true;
        }
        if (!mathSelected && !physicsSelected && !chemistrySelected && !biologySelected && !informaticsSelected
                && !historySelected && !germanSelected && !politicsEconomicsSelected && !englishSelected
                && !frenchSelected && !latinSelected && !spanishSelected && !greekSelected && !chineseSelected
                && !musicSelected
                && !economicsSelected) {
            mathSelected = true;
            chemistrySelected = true;
            biologySelected = true;
            informaticsSelected = true;
            historySelected = true;
            germanSelected = true;
            politicsEconomicsSelected = true;
            englishSelected = true;
            frenchSelected = true;
            latinSelected = true;
            spanishSelected = true;
            greekSelected = true;
            chineseSelected = true;
            musicSelected = true;
            economicsSelected = true;
        }

        String mathCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_MATH_ID,
                HESSEN_GYMNASIUM_UPPER_MATH_ID.equals(currentCurriculumId));
        String physicsCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_PHYSICS_ID,
                HESSEN_GYMNASIUM_UPPER_PHYSICS_ID.equals(currentCurriculumId));
        String chemistryCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID,
                HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID.equals(currentCurriculumId));
        String biologyCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID,
                HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID.equals(currentCurriculumId));
        String informaticsCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID,
                HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID.equals(currentCurriculumId));
        String historyCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_HISTORY_ID,
                HESSEN_GYMNASIUM_UPPER_HISTORY_ID.equals(currentCurriculumId));
        String germanCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_GERMAN_ID,
                HESSEN_GYMNASIUM_UPPER_GERMAN_ID.equals(currentCurriculumId));
        String politicsEconomicsCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID,
                HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID.equals(currentCurriculumId));
        String englishCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_ENGLISH_ID,
                HESSEN_GYMNASIUM_UPPER_ENGLISH_ID.equals(currentCurriculumId));
        String frenchCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_FRENCH_ID,
                HESSEN_GYMNASIUM_UPPER_FRENCH_ID.equals(currentCurriculumId));
        String latinCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_LATIN_ID,
                HESSEN_GYMNASIUM_UPPER_LATIN_ID.equals(currentCurriculumId));
        String spanishCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_SPANISH_ID,
                HESSEN_GYMNASIUM_UPPER_SPANISH_ID.equals(currentCurriculumId));
        String greekCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_GREEK_ID,
                HESSEN_GYMNASIUM_UPPER_GREEK_ID.equals(currentCurriculumId));
        String chineseCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_CHINESE_ID,
                HESSEN_GYMNASIUM_UPPER_CHINESE_ID.equals(currentCurriculumId));
        String musicCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_MUSIC_ID,
                HESSEN_GYMNASIUM_UPPER_MUSIC_ID.equals(currentCurriculumId));
        String economicsCourseFilterId = inferLegacyCourseFilterId(
                legacyConfig,
                HESSEN_GYMNASIUM_UPPER_ECONOMICS_ID,
                HESSEN_GYMNASIUM_UPPER_ECONOMICS_ID.equals(currentCurriculumId));

        String rootFilterId = resolveCanonicalGymnasiumRootFilterId(
                learner.getSelectedCurriculum(),
                HESSEN_JURISDICTION_FILTER_ID);
        Map<String, Object> personalCurriculumConfig = new LinkedHashMap<>();
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_ROOT_ID, createSelectionConfig(true, rootFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_MATH_ID, createSelectionConfig(mathSelected, mathCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_PHYSICS_ID,
                createSelectionConfig(physicsSelected, physicsCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_CHEMISTRY_ID,
                createSelectionConfig(chemistrySelected, chemistryCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_BIOLOGY_ID,
                createSelectionConfig(biologySelected, biologyCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_INFORMATICS_ID,
                createSelectionConfig(informaticsSelected, informaticsCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_HISTORY_ID,
                createSelectionConfig(historySelected, historyCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_GERMAN_ID,
                createSelectionConfig(germanSelected, germanCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID,
                createSelectionConfig(politicsEconomicsSelected, politicsEconomicsCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_ENGLISH_ID,
                createSelectionConfig(englishSelected, englishCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_FRENCH_ID,
                createSelectionConfig(frenchSelected, frenchCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_LATIN_ID,
                createSelectionConfig(latinSelected, latinCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_SPANISH_ID,
                createSelectionConfig(spanishSelected, spanishCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_GREEK_ID,
                createSelectionConfig(greekSelected, greekCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_CHINESE_ID,
                createSelectionConfig(chineseSelected, chineseCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_MUSIC_ID,
                createSelectionConfig(musicSelected, musicCourseFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_ECONOMICS_ID,
                createSelectionConfig(economicsSelected, economicsCourseFilterId));

        String personalCurriculumJson = writePersonalCurriculumConfig(personalCurriculumConfig);
        Map<String, LearningGoal> structuralGoals = new LinkedHashMap<>(getFilteredGoals(CANONICAL_GYMNASIUM_ROOT_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_MATH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_PHYSICS_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_CHEMISTRY_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_BIOLOGY_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_INFORMATICS_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_HISTORY_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_GERMAN_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_ENGLISH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_FRENCH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_LATIN_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_SPANISH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_GREEK_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_CHINESE_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_MUSIC_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_ECONOMICS_ID, "{}"));
        List<String> normalizedPlannedGoalIds = normalizeCutoverPlannedGoalIds(storedPlannedGoals, structuralGoals).stream()
                .filter(structuralGoals::containsKey)
                .toList();
        Map<String, LearningGoal> visibleGoals = getFilteredGoals(CANONICAL_GYMNASIUM_ROOT_ID, personalCurriculumJson);
        String normalizedActiveGoalId = resolveGoalIdInVisibleGoals(activeGoalId, visibleGoals, false);
        LearningGoal activeGoal = normalizedActiveGoalId != null ? visibleGoals.get(normalizedActiveGoalId) : null;
        LearningState normalizedLearningState = learner.getLearningState();
        if (normalizedActiveGoalId == null || activeGoal == null || !isAtomicGoal(activeGoal)) {
            normalizedActiveGoalId = null;
            normalizedLearningState = LearningState.FRONTIER;
        }

        return new CanonicalGymnasiumCutoverPlan(
                personalCurriculumConfig,
                normalizedPlannedGoalIds,
                normalizedActiveGoalId,
                normalizedLearningState != null ? normalizedLearningState : LearningState.FRONTIER);
    }

    private boolean isSupportedHessenGymnasiumLowerCutoverSource(String curriculumId) {
        return HESSEN_GYMNASIUM_LOWER_ROOT_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_MATH_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_PHYSICS_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID.equals(curriculumId)
                || HESSEN_GYMNASIUM_LOWER_FRENCH_ID.equals(curriculumId);
    }

    private boolean isSupportedBavariaGymnasiumCutoverSource(String curriculumId) {
        return BAVARIA_GYMNASIUM_MATH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_PHYSICS_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_CHEMISTRY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_BIOLOGY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_CHINESE_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_INFORMATICS_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_HISTORY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_GERMAN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_ENGLISH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_GREEK_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_ECONOMICS_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_POLITICS_SOCIETY_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_LATIN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_MUSIC_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_FRENCH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_SPANISH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_ITALIAN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_RUSSIAN_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_POLISH_ID.equals(curriculumId)
                || BAVARIA_GYMNASIUM_CZECH_ID.equals(curriculumId);
    }

    private record HessenLowerSecondarySelection(
            boolean mathSelected,
            boolean physicsSelected,
            boolean chemistrySelected,
            boolean biologySelected,
            boolean frenchSelected) {
    }

    private HessenLowerSecondarySelection inferLowerSecondarySelectionState(
            Learner learner,
            List<String> storedPlannedGoals) {
        Map<String, Map<String, Object>> legacyConfig = parsePersonalCurriculumConfig(learner.getPersonalCurriculum());
        String currentCurriculumId = learner.getSelectedCurriculum();
        String activeGoalId = learner.getActiveGoalId();

        boolean mathSelected = HESSEN_GYMNASIUM_LOWER_MATH_ID.equals(currentCurriculumId);
        boolean physicsSelected = HESSEN_GYMNASIUM_LOWER_PHYSICS_ID.equals(currentCurriculumId);
        boolean chemistrySelected = HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID.equals(currentCurriculumId);
        boolean biologySelected = HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID.equals(currentCurriculumId);
        boolean frenchSelected = HESSEN_GYMNASIUM_LOWER_FRENCH_ID.equals(currentCurriculumId);

        if (HESSEN_GYMNASIUM_LOWER_ROOT_ID.equals(currentCurriculumId)) {
            mathSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_LOWER_MATH_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_LOWER_MATH_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_MATH_ID);
            physicsSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_LOWER_PHYSICS_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_LOWER_PHYSICS_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_PHYSICS_ID);
            chemistrySelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID);
            biologySelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID);
            frenchSelected = readSelectedFlag(legacyConfig, HESSEN_GYMNASIUM_LOWER_FRENCH_ID)
                    || containsGoalFromLandscape(storedPlannedGoals, HESSEN_GYMNASIUM_LOWER_FRENCH_ID)
                    || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_FRENCH_ID);
            if (!mathSelected && !physicsSelected && !chemistrySelected && !biologySelected && !frenchSelected) {
                mathSelected = true;
                physicsSelected = true;
                chemistrySelected = true;
                biologySelected = true;
                frenchSelected = true;
            }
        }

        if (physicsSelected) {
            mathSelected = true;
        }

        if (!mathSelected && !physicsSelected && !chemistrySelected && !biologySelected && !frenchSelected) {
            mathSelected = true;
            physicsSelected = true;
            chemistrySelected = true;
            biologySelected = true;
            frenchSelected = true;
        }

        return new HessenLowerSecondarySelection(
                mathSelected,
                physicsSelected,
                chemistrySelected,
                biologySelected,
                frenchSelected);
    }

    private CanonicalGymnasiumCutoverPlan buildLowerSecondaryCanonicalGymnasiumCutoverPlan(
            Learner learner,
            List<String> storedPlannedGoals) {
        HessenLowerSecondarySelection selection = inferLowerSecondarySelectionState(learner, storedPlannedGoals);
        boolean mathSelected = selection.mathSelected();
        boolean physicsSelected = selection.physicsSelected();
        boolean chemistrySelected = selection.chemistrySelected();
        boolean biologySelected = selection.biologySelected();
        boolean frenchSelected = selection.frenchSelected();

        String rootFilterId = resolveCanonicalGymnasiumRootFilterId(
                learner.getSelectedCurriculum(),
                HESSEN_JURISDICTION_FILTER_ID);
        Map<String, Object> personalCurriculumConfig = new LinkedHashMap<>();
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_ROOT_ID, createSelectionConfig(true, rootFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_MATH_ID, createSelectionConfig(mathSelected, null));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_PHYSICS_ID, createSelectionConfig(physicsSelected, null));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_CHEMISTRY_ID, createSelectionConfig(chemistrySelected, null));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_BIOLOGY_ID, createSelectionConfig(biologySelected, null));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_FRENCH_ID, createSelectionConfig(frenchSelected, null));

        String personalCurriculumJson = writePersonalCurriculumConfig(personalCurriculumConfig);
        Map<String, LearningGoal> structuralGoals = new LinkedHashMap<>(getFilteredGoals(CANONICAL_GYMNASIUM_ROOT_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_MATH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_PHYSICS_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_CHEMISTRY_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_BIOLOGY_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_FRENCH_ID, "{}"));
        List<String> normalizedPlannedGoalIds = normalizeCutoverPlannedGoalIds(storedPlannedGoals, structuralGoals).stream()
                .filter(structuralGoals::containsKey)
                .toList();
        Map<String, LearningGoal> visibleGoals = getFilteredGoals(CANONICAL_GYMNASIUM_ROOT_ID, personalCurriculumJson);
        String activeGoalId = learner.getActiveGoalId();
        String normalizedActiveGoalId = resolveGoalIdInVisibleGoals(activeGoalId, visibleGoals, false);
        LearningGoal activeGoal = normalizedActiveGoalId != null ? visibleGoals.get(normalizedActiveGoalId) : null;
        LearningState normalizedLearningState = learner.getLearningState();
        if (normalizedActiveGoalId == null || activeGoal == null || !isAtomicGoal(activeGoal)) {
            normalizedActiveGoalId = null;
            normalizedLearningState = LearningState.FRONTIER;
        }

        return new CanonicalGymnasiumCutoverPlan(
                personalCurriculumConfig,
                normalizedPlannedGoalIds,
                normalizedActiveGoalId,
                normalizedLearningState != null ? normalizedLearningState : LearningState.FRONTIER);
    }

    private CanonicalGymnasiumCutoverPlan buildBavariaCanonicalGymnasiumCutoverPlan(
            Learner learner,
            List<String> storedPlannedGoals) {
        boolean mathSelected = BAVARIA_GYMNASIUM_MATH_ID.equals(learner.getSelectedCurriculum());
        boolean physicsSelected = BAVARIA_GYMNASIUM_PHYSICS_ID.equals(learner.getSelectedCurriculum());
        boolean chemistrySelected = BAVARIA_GYMNASIUM_CHEMISTRY_ID.equals(learner.getSelectedCurriculum());
        boolean biologySelected = BAVARIA_GYMNASIUM_BIOLOGY_ID.equals(learner.getSelectedCurriculum());
        boolean chineseSelected = BAVARIA_GYMNASIUM_CHINESE_ID.equals(learner.getSelectedCurriculum());
        boolean informaticsSelected = BAVARIA_GYMNASIUM_INFORMATICS_ID.equals(learner.getSelectedCurriculum());
        boolean historySelected = BAVARIA_GYMNASIUM_HISTORY_ID.equals(learner.getSelectedCurriculum());
        boolean germanSelected = BAVARIA_GYMNASIUM_GERMAN_ID.equals(learner.getSelectedCurriculum());
        boolean englishSelected = BAVARIA_GYMNASIUM_ENGLISH_ID.equals(learner.getSelectedCurriculum());
        boolean greekSelected = BAVARIA_GYMNASIUM_GREEK_ID.equals(learner.getSelectedCurriculum());
        boolean economicsSelected = BAVARIA_GYMNASIUM_ECONOMICS_ID.equals(learner.getSelectedCurriculum());
        boolean politicsEconomicsSelected = BAVARIA_GYMNASIUM_POLITICS_SOCIETY_ID.equals(learner.getSelectedCurriculum());
        boolean latinSelected = BAVARIA_GYMNASIUM_LATIN_ID.equals(learner.getSelectedCurriculum());
        boolean musicSelected = BAVARIA_GYMNASIUM_MUSIC_ID.equals(learner.getSelectedCurriculum());
        boolean frenchSelected = BAVARIA_GYMNASIUM_FRENCH_ID.equals(learner.getSelectedCurriculum());
        boolean spanishSelected = BAVARIA_GYMNASIUM_SPANISH_ID.equals(learner.getSelectedCurriculum());
        boolean italianSelected = BAVARIA_GYMNASIUM_ITALIAN_ID.equals(learner.getSelectedCurriculum());
        boolean russianSelected = BAVARIA_GYMNASIUM_RUSSIAN_ID.equals(learner.getSelectedCurriculum());
        boolean polishSelected = BAVARIA_GYMNASIUM_POLISH_ID.equals(learner.getSelectedCurriculum());
        boolean czechSelected = BAVARIA_GYMNASIUM_CZECH_ID.equals(learner.getSelectedCurriculum());

        if (physicsSelected) {
            mathSelected = true;
        }

        String rootFilterId = resolveCanonicalGymnasiumRootFilterId(
                learner.getSelectedCurriculum(),
                BAVARIA_JURISDICTION_FILTER_ID);
        Map<String, Object> personalCurriculumConfig = new LinkedHashMap<>();
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_ROOT_ID, createSelectionConfig(true, rootFilterId));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_MATH_ID, createSelectionConfig(mathSelected, null));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_PHYSICS_ID, createSelectionConfig(physicsSelected, null));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_CHEMISTRY_ID, createSelectionConfig(chemistrySelected, null));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_BIOLOGY_ID, createSelectionConfig(biologySelected, null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_CHINESE_ID,
                createSelectionConfig(chineseSelected, chineseSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_INFORMATICS_ID, createSelectionConfig(informaticsSelected, null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_HISTORY_ID,
                createSelectionConfig(historySelected, historySelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_GERMAN_ID,
                createSelectionConfig(germanSelected, germanSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_ENGLISH_ID,
                createSelectionConfig(englishSelected, englishSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_GREEK_ID,
                createSelectionConfig(greekSelected, greekSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(CANONICAL_GYMNASIUM_ECONOMICS_ID, createSelectionConfig(economicsSelected, null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID,
                createSelectionConfig(
                        politicsEconomicsSelected,
                        politicsEconomicsSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_LATIN_ID,
                createSelectionConfig(latinSelected, latinSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_MUSIC_ID,
                createSelectionConfig(musicSelected, musicSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_FRENCH_ID,
                createSelectionConfig(frenchSelected, frenchSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_SPANISH_ID,
                createSelectionConfig(spanishSelected, spanishSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_ITALIAN_ID,
                createSelectionConfig(italianSelected, italianSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_RUSSIAN_ID,
                createSelectionConfig(russianSelected, russianSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_POLISH_ID,
                createSelectionConfig(polishSelected, polishSelected ? DEFAULT_COURSE_FILTER_ID : null));
        personalCurriculumConfig.put(
                CANONICAL_GYMNASIUM_CZECH_ID,
                createSelectionConfig(czechSelected, czechSelected ? DEFAULT_COURSE_FILTER_ID : null));

        String personalCurriculumJson = writePersonalCurriculumConfig(personalCurriculumConfig);
        Map<String, LearningGoal> structuralGoals = new LinkedHashMap<>(getFilteredGoals(CANONICAL_GYMNASIUM_ROOT_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_MATH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_PHYSICS_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_CHEMISTRY_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_BIOLOGY_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_CHINESE_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_INFORMATICS_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_HISTORY_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_GERMAN_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_ENGLISH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_GREEK_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_ECONOMICS_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_LATIN_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_MUSIC_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_FRENCH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_SPANISH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_ITALIAN_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_RUSSIAN_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_POLISH_ID, "{}"));
        structuralGoals.putAll(getFilteredGoals(CANONICAL_GYMNASIUM_CZECH_ID, "{}"));
        List<String> normalizedPlannedGoalIds = normalizeCutoverPlannedGoalIds(storedPlannedGoals, structuralGoals).stream()
                .filter(structuralGoals::containsKey)
                .toList();
        Map<String, LearningGoal> visibleGoals = getFilteredGoals(CANONICAL_GYMNASIUM_ROOT_ID, personalCurriculumJson);
        String activeGoalId = learner.getActiveGoalId();
        String normalizedActiveGoalId = resolveGoalIdInVisibleGoals(activeGoalId, visibleGoals, false);
        LearningGoal activeGoal = normalizedActiveGoalId != null ? visibleGoals.get(normalizedActiveGoalId) : null;
        LearningState normalizedLearningState = learner.getLearningState();
        if (normalizedActiveGoalId == null || activeGoal == null || !isAtomicGoal(activeGoal)) {
            normalizedActiveGoalId = null;
            normalizedLearningState = LearningState.FRONTIER;
        }

        return new CanonicalGymnasiumCutoverPlan(
                personalCurriculumConfig,
                normalizedPlannedGoalIds,
                normalizedActiveGoalId,
                normalizedLearningState != null ? normalizedLearningState : LearningState.FRONTIER);
    }

    private String buildCompatibilityOnlyRetirementMessage(String curriculumId) {
        String jurisdiction = landscapeService.resolveSourceLandscapeJurisdiction(curriculumId);
        String canonicalFilterLabel = BundeslandCodeNormalizer.formatDisplayLabelEn(jurisdiction);
        if (canonicalFilterLabel != null) {
            return "This compatibility-only curriculum is retired. Select Gymnasium (DE) and use the canonical "
                    + canonicalFilterLabel + " filter instead.";
        }
        return "This compatibility-only curriculum is retired. Select Gymnasium (DE) instead.";
    }

    private String resolveCanonicalGymnasiumRootFilterId(String legacyCurriculumId, String fallbackFilterId) {
        String normalizedJurisdiction = BundeslandCodeNormalizer.normalize(
                landscapeService.resolveSourceLandscapeJurisdiction(legacyCurriculumId));
        if (normalizedJurisdiction != null) {
            return normalizedJurisdiction;
        }
        String normalizedFallback = BundeslandCodeNormalizer.normalize(fallbackFilterId);
        return normalizedFallback != null ? normalizedFallback : fallbackFilterId;
    }

    private Map<String, Map<String, Object>> parsePersonalCurriculumConfig(String personalCurriculumJson) {
        if (personalCurriculumJson == null || personalCurriculumJson.isBlank()) {
            return new HashMap<>();
        }
        try {
            Object parsed = objectMapper.readValue(personalCurriculumJson, Object.class);
            return coercePersonalCurriculumConfig(parsed);
        } catch (Exception ignored) {
            return new HashMap<>();
        }
    }

    private String resolveProjectionStateFilterId(Learner learner) {
        if (learner == null) {
            return null;
        }
        return resolveProjectionStateFilterId(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
    }

    private String resolveProjectionStateFilterId(String curriculumId, String personalCurriculumJson) {
        if (curriculumId == null || curriculumId.isBlank()) {
            return null;
        }
        Map<String, Map<String, Object>> config = parsePersonalCurriculumConfig(personalCurriculumJson);
        if (config.isEmpty()) {
            return null;
        }
        Map<String, Object> rootConfig = config.get(curriculumId);
        if (rootConfig == null) {
            return null;
        }
        Object filterId = rootConfig.get("filterId");
        if (!(filterId instanceof String textFilterId)) {
            return null;
        }
        String normalizedFilterId = normalizeFilterId(textFilterId);
        return isStateFilterId(normalizedFilterId) ? normalizedFilterId : null;
    }

    private Map<String, Object> normalizePersonalCurriculumPayload(Map<String, Object> config) {
        if (config == null || config.isEmpty()) {
            return new LinkedHashMap<>();
        }

        Object nestedConfig = config.get("personalCurriculum");
        if (config.size() == 1 && nestedConfig instanceof Map<?, ?> nestedMap) {
            Map<String, Object> normalized = new LinkedHashMap<>();
            for (Map.Entry<?, ?> entry : nestedMap.entrySet()) {
                if (entry.getKey() instanceof String key) {
                    normalized.put(key, entry.getValue());
                }
            }
            return normalized;
        }

        return new LinkedHashMap<>(config);
    }

    private Map<String, Map<String, Object>> coercePersonalCurriculumConfig(Object parsed) {
        if (!(parsed instanceof Map<?, ?> rawConfig)) {
            return new HashMap<>();
        }

        Object configCandidate = rawConfig;
        if (rawConfig.size() == 1 && rawConfig.get("personalCurriculum") instanceof Map<?, ?> nestedConfig) {
            configCandidate = nestedConfig;
        }

        if (!(configCandidate instanceof Map<?, ?> configMap)) {
            return new HashMap<>();
        }

        Map<String, Map<String, Object>> normalized = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : configMap.entrySet()) {
            if (!(entry.getKey() instanceof String key) || !(entry.getValue() instanceof Map<?, ?> valueMap)) {
                continue;
            }
            Map<String, Object> normalizedEntry = new LinkedHashMap<>();
            for (Map.Entry<?, ?> valueEntry : valueMap.entrySet()) {
                if (valueEntry.getKey() instanceof String valueKey) {
                    normalizedEntry.put(valueKey, valueEntry.getValue());
                }
            }
            normalized.put(key, normalizedEntry);
        }
        return normalized;
    }

    private boolean readSelectedFlag(Map<String, Map<String, Object>> config, String landscapeId) {
        Map<String, Object> entry = config.get(landscapeId);
        if (entry == null) {
            return false;
        }
        Object selected = entry.get("selected");
        return selected instanceof Boolean && (Boolean) selected;
    }

    private String inferLegacyCourseFilterId(Map<String, Map<String, Object>> config, String landscapeId,
            boolean currentLandscapeSelected) {
        Map<String, Object> entry = config.get(landscapeId);
        if (entry != null) {
            Object filterId = entry.get("filterId");
            String normalizedFilterId = normalizeFilterId(filterId instanceof String ? (String) filterId : null);
            if (COURSE_FILTER_IDS.contains(normalizedFilterId)) {
                return normalizedFilterId;
            }
        }
        return currentLandscapeSelected ? DEFAULT_COURSE_FILTER_ID : DEFAULT_COURSE_FILTER_ID;
    }

    private boolean containsGoalFromLandscape(List<String> goalIds, String landscapeId) {
        if (goalIds == null || goalIds.isEmpty()) {
            return false;
        }
        for (String goalId : goalIds) {
            if (goalBelongsToLandscape(goalId, landscapeId)) {
                return true;
            }
        }
        return false;
    }

    private boolean goalBelongsToLandscape(String goalId, String landscapeId) {
        if (goalId == null || goalId.isBlank() || landscapeId == null || landscapeId.isBlank()) {
            return false;
        }
        String resolvedLandscapeId = landscapeService.resolveLandscapeIdForGoalIncludingArchived(goalId);
        if (landscapeId.equals(resolvedLandscapeId)) {
            return true;
        }
        for (ResolvedGoalMapping mapping : goalMappingService.findAllByLegacyGoalId(goalId)) {
            if (landscapeId.equals(mapping.sourceLandscapeId())) {
                return true;
            }
        }
        return false;
    }

    private Map<String, Object> createSelectionConfig(boolean selected, String filterId) {
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("selected", selected);
        if (filterId != null && !filterId.isBlank()) {
            entry.put("filterId", filterId);
        }
        return entry;
    }

    private String writePersonalCurriculumConfig(Map<String, Object> config) {
        try {
            return objectMapper.writeValueAsString(config);
        } catch (Exception e) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to serialize personal curriculum config.");
        }
    }

    private boolean isAtomicGoal(LearningGoal goal) {
        return goal != null && (goal.getContains() == null || goal.getContains().isEmpty());
    }

    private List<String> normalizeCutoverPlannedGoalIds(List<String> goalIds, Map<String, LearningGoal> visibleGoals) {
        if (goalIds == null || goalIds.isEmpty() || visibleGoals == null || visibleGoals.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, String> canonicalIdsByLegacySourceId = collectCanonicalIdsByLegacySourceId(visibleGoals);
        LinkedHashSet<String> normalizedGoalIds = new LinkedHashSet<>();
        for (String goalId : goalIds) {
            if (goalId == null || goalId.isBlank()) {
                continue;
            }
            String provenanceMappedId = canonicalIdsByLegacySourceId.get(goalId);
            if (provenanceMappedId != null && visibleGoals.containsKey(provenanceMappedId)) {
                normalizedGoalIds.add(provenanceMappedId);
                continue;
            }
            boolean mappedToVisibleGoal = false;
            for (ResolvedGoalMapping mapping : goalMappingService.findAllByLegacyGoalId(goalId)) {
                if (visibleGoals.containsKey(mapping.canonicalGoalId())) {
                    normalizedGoalIds.add(mapping.canonicalGoalId());
                    mappedToVisibleGoal = true;
                }
            }
            if (mappedToVisibleGoal) {
                continue;
            }
            if (visibleGoals.containsKey(goalId)) {
                normalizedGoalIds.add(goalId);
            }
        }
        return collapseContainedGoalIds(new ArrayList<>(normalizedGoalIds), visibleGoals);
    }

    private Map<String, String> collectCanonicalIdsByLegacySourceId(Map<String, LearningGoal> visibleGoals) {
        Map<String, String> canonicalIdsByLegacySourceId = new HashMap<>();
        if (visibleGoals == null || visibleGoals.isEmpty()) {
            return canonicalIdsByLegacySourceId;
        }
        for (LearningGoal goal : visibleGoals.values()) {
            String sourceGoalId = landscapeService.resolveGoalProvenanceValue(goal, "sourceGoalId");
            if (sourceGoalId == null || sourceGoalId.isBlank()) {
                continue;
            }
            canonicalIdsByLegacySourceId.putIfAbsent(sourceGoalId, goal.getId());
        }
        return canonicalIdsByLegacySourceId;
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

        return frontier.stream()
                .filter(goalId -> !isSrsGoalUnavailableForVerifiedRecall(skillpilotId, allGoals.get(goalId)))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FrontierGoal> getRichFrontier(String skillpilotId) {
        return getRichFrontier(skillpilotId, true);
    }

    private List<FrontierGoal> getRichFrontier(String skillpilotId, boolean compactFrontier) {
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
        List<String> plannedIds = resolvePlannedGoalIdsForScope(getStoredPlannedGoals(skillpilotId), allStructuralGoals, true);

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

            if (isExamGoalUnavailableForHardCheck(goal)) {
                continue;
            }

            if (prerequisitesMet) {
                frontier.add(toFrontierGoal(goal, "Prerequisites met", null));
            }
        }
        frontier = new ArrayList<>(filterVerifiedRecallAvailableMemoryGoals(skillpilotId, frontier));

        // Compaction Logic: If frontier is too large, prefer atomic goals for
        // actionable next steps.
        if (compactFrontier && frontier.size() > 20) {
            List<FrontierGoal> atomic = frontier.stream()
                    .filter(g -> "atomic".equals(g.type()))
                    .toList();
            if (!atomic.isEmpty()) {
                List<FrontierGoal> balancedAtomic = compactAtomicFrontierAcrossPlannedScopes(
                        atomic,
                        plannedIds,
                        allStructuralGoals);
                if (!balancedAtomic.isEmpty()) {
                    return balancedAtomic;
                }
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

    private List<FrontierGoal> compactAtomicFrontierAcrossPlannedScopes(
            List<FrontierGoal> atomicFrontier,
            List<String> plannedIds,
            Map<String, LearningGoal> structuralGoals) {
        if (atomicFrontier == null || atomicFrontier.isEmpty()) {
            return Collections.emptyList();
        }
        if (plannedIds == null || plannedIds.size() <= 1 || structuralGoals == null || structuralGoals.isEmpty()) {
            return Collections.emptyList();
        }

        List<Deque<FrontierGoal>> buckets = new ArrayList<>();
        for (String plannedId : plannedIds) {
            if (plannedId == null || plannedId.isBlank() || !structuralGoals.containsKey(plannedId)) {
                continue;
            }
            Deque<FrontierGoal> bucket = buildSeededAtomicBucketForPlannedId(plannedId, atomicFrontier, structuralGoals);
            if (!bucket.isEmpty()) {
                buckets.add(bucket);
            }
        }

        if (buckets.size() <= 1) {
            return Collections.emptyList();
        }

        int[] quotas = allocateAtomicCompactionQuotas(buckets, 20);
        int[] consumedPerBucket = new int[buckets.size()];

        List<FrontierGoal> compacted = new ArrayList<>(20);
        Set<String> seen = new LinkedHashSet<>();
        while (compacted.size() < 20) {
            boolean addedInRound = false;
            for (int bucketIndex = 0; bucketIndex < buckets.size(); bucketIndex++) {
                if (consumedPerBucket[bucketIndex] >= quotas[bucketIndex]) {
                    continue;
                }
                Deque<FrontierGoal> bucket = buckets.get(bucketIndex);
                while (!bucket.isEmpty()) {
                    FrontierGoal next = bucket.removeFirst();
                    if (!seen.add(next.id())) {
                        continue;
                    }
                    compacted.add(next);
                    consumedPerBucket[bucketIndex]++;
                    addedInRound = true;
                    break;
                }
                if (compacted.size() >= 20) {
                    break;
                }
            }
            if (!addedInRound) {
                break;
            }
        }

        if (compacted.size() >= 20) {
            return compacted;
        }

        for (FrontierGoal goal : atomicFrontier) {
            if (!seen.add(goal.id())) {
                continue;
            }
            compacted.add(goal);
            if (compacted.size() >= 20) {
                break;
            }
        }

        return compacted;
    }

    private Deque<FrontierGoal> buildSeededAtomicBucketForPlannedId(
            String plannedId,
            List<FrontierGoal> atomicFrontier,
            Map<String, LearningGoal> structuralGoals) {
        Set<String> localScope = computeScope(List.of(plannedId), structuralGoals, Collections.emptyMap());
        Deque<FrontierGoal> rawBucket = buildAtomicBucketForScope(localScope, atomicFrontier);
        if (rawBucket.isEmpty()) {
            return rawBucket;
        }

        LearningGoal plannedGoal = structuralGoals.get(plannedId);
        if (plannedGoal == null || plannedGoal.getContains() == null || plannedGoal.getContains().isEmpty()) {
            return rawBucket;
        }

        List<FrontierGoal> rawOrder = new ArrayList<>(rawBucket);
        LinkedHashSet<String> seededIds = new LinkedHashSet<>();
        for (String childRef : plannedGoal.getContains()) {
            String childId = resolveGoalRef(childRef, structuralGoals);
            if (childId == null) {
                continue;
            }
            Set<String> childScope = computeScope(List.of(childId), structuralGoals, Collections.emptyMap());
            for (FrontierGoal goal : rawOrder) {
                if (childScope.contains(goal.id())) {
                    seededIds.add(goal.id());
                    break;
                }
            }
        }

        for (String childRef : plannedGoal.getContains()) {
            String childId = resolveGoalRef(childRef, structuralGoals);
            if (childId == null) {
                continue;
            }
            Set<String> childScope = computeScope(List.of(childId), structuralGoals, Collections.emptyMap());
            seedPrioritySkillGoal(rawOrder, childScope, structuralGoals, seededIds, true);
            seedPrioritySkillGoal(rawOrder, childScope, structuralGoals, seededIds, false);
        }

        if (seededIds.isEmpty()) {
            return rawBucket;
        }

        Deque<FrontierGoal> seededBucket = new ArrayDeque<>();
        Set<String> seen = new LinkedHashSet<>();
        for (String goalId : seededIds) {
            for (FrontierGoal goal : rawOrder) {
                if (goal.id().equals(goalId) && seen.add(goal.id())) {
                    seededBucket.addLast(goal);
                    break;
                }
            }
        }
        for (FrontierGoal goal : rawOrder) {
            if (seen.add(goal.id())) {
                seededBucket.addLast(goal);
            }
        }
        return seededBucket;
    }

    private void seedPrioritySkillGoal(
            List<FrontierGoal> rawOrder,
            Set<String> childScope,
            Map<String, LearningGoal> structuralGoals,
            LinkedHashSet<String> seededIds,
            boolean productiveFirst) {
        for (FrontierGoal goal : rawOrder) {
            if (!childScope.contains(goal.id())) {
                continue;
            }
            LearningGoal goalDefinition = structuralGoals.get(goal.id());
            if (matchesPrioritySkillSeed(goalDefinition, productiveFirst)) {
                seededIds.add(goal.id());
                return;
            }
        }
    }

    private boolean matchesPrioritySkillSeed(LearningGoal goal, boolean productiveFirst) {
        if (goal == null || goal.getTags() == null || goal.getTags().isEmpty()) {
            return false;
        }
        if (productiveFirst) {
            return goal.getTags().contains("skill:mediation")
                    || goal.getTags().contains("skill:writing")
                    || goal.getTags().contains("skill:schreiben");
        }
        return goal.getTags().contains("skill:intercultural");
    }

    private Deque<FrontierGoal> buildAtomicBucketForScope(Set<String> scope, List<FrontierGoal> atomicFrontier) {
        Deque<FrontierGoal> bucket = new ArrayDeque<>();
        if (scope == null || scope.isEmpty() || atomicFrontier == null || atomicFrontier.isEmpty()) {
            return bucket;
        }
        for (FrontierGoal goal : atomicFrontier) {
            if (scope.contains(goal.id())) {
                bucket.addLast(goal);
            }
        }
        return bucket;
    }

    private int[] allocateAtomicCompactionQuotas(List<Deque<FrontierGoal>> buckets, int limit) {
        int[] quotas = new int[buckets.size()];
        if (buckets.isEmpty() || limit <= 0) {
            return quotas;
        }

        int totalSize = buckets.stream().mapToInt(Deque::size).sum();
        if (totalSize <= limit) {
            for (int i = 0; i < buckets.size(); i++) {
                quotas[i] = buckets.get(i).size();
            }
            return quotas;
        }

        int preferredBasePerBucket = buckets.size() <= 2 ? 5 : 4;
        int basePerBucket = Math.max(1, Math.min(preferredBasePerBucket, limit / buckets.size()));
        double[] remainders = new double[buckets.size()];
        int assigned = 0;
        int totalRemainingCapacity = 0;
        for (int i = 0; i < buckets.size(); i++) {
            int bucketSize = buckets.get(i).size();
            if (bucketSize <= 0) {
                continue;
            }
            int quota = Math.min(basePerBucket, bucketSize);
            quotas[i] = quota;
            assigned += quota;
            totalRemainingCapacity += Math.max(0, bucketSize - quota);
        }

        if (assigned >= limit || totalRemainingCapacity <= 0) {
            while (assigned > limit) {
                int bestIndex = -1;
                for (int i = 0; i < quotas.length; i++) {
                    if (quotas[i] <= 1) {
                        continue;
                    }
                    if (bestIndex < 0 || quotas[i] > quotas[bestIndex]) {
                        bestIndex = i;
                    }
                }
                if (bestIndex < 0) {
                    break;
                }
                quotas[bestIndex]--;
                assigned--;
            }
            return quotas;
        }

        for (int i = 0; i < buckets.size(); i++) {
            int bucketSize = buckets.get(i).size();
            int remainingCapacity = Math.max(0, bucketSize - quotas[i]);
            if (remainingCapacity <= 0) {
                continue;
            }
            double exactAdditionalQuota = ((limit - assigned) * (double) remainingCapacity) / totalRemainingCapacity;
            int additionalQuota = (int) Math.floor(exactAdditionalQuota);
            additionalQuota = Math.min(additionalQuota, remainingCapacity);
            quotas[i] += additionalQuota;
            remainders[i] = exactAdditionalQuota - Math.floor(exactAdditionalQuota);
        }

        assigned = Arrays.stream(quotas).sum();

        while (assigned > limit) {
            int bestIndex = -1;
            for (int i = 0; i < quotas.length; i++) {
                if (quotas[i] <= 1) {
                    continue;
                }
                if (bestIndex < 0 || remainders[i] < remainders[bestIndex]) {
                    bestIndex = i;
                }
            }
            if (bestIndex < 0) {
                break;
            }
            quotas[bestIndex]--;
            assigned--;
        }

        while (assigned < limit) {
            int bestIndex = -1;
            for (int i = 0; i < quotas.length; i++) {
                if (quotas[i] >= buckets.get(i).size()) {
                    continue;
                }
                if (bestIndex < 0
                        || remainders[i] > remainders[bestIndex]
                        || (Double.compare(remainders[i], remainders[bestIndex]) == 0
                                && buckets.get(i).size() > buckets.get(bestIndex).size())) {
                    bestIndex = i;
                }
            }
            if (bestIndex < 0) {
                break;
            }
            quotas[bestIndex]++;
            assigned++;
        }

        return quotas;
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
        return getLearnerState(skillpilotId, null);
    }

    private UnifiedLearnerStateResponse getLearnerState(String skillpilotId, String sequentialAutopilotAnchorGoalId) {
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
                                full.getFilters(),
                                landscapeService.isCompatibilityOnlyLandscape(curriculumId)));
            }
        }

        List<FrontierGoal> frontier = getRichFrontier(skillpilotId);
        List<FrontierGoal> frontierAtomic = filterAtomicFrontier(frontier);

        // Build a map of all goals in the closure for quick lookup
        Map<String, LearningGoal> allGoals = new LinkedHashMap<>();
        Map<String, LearningGoal> structuralGoals = Collections.emptyMap();
        if (curriculumId != null) {
            allGoals = getFilteredGoals(curriculumId, learner.getPersonalCurriculum());
            structuralGoals = getFilteredGoals(curriculumId, "{}");
        }
        List<FrontierGoal> sequentialAutopilotSearchAtomic = frontierAtomic;
        if (sequentialAutopilotAnchorGoalId != null
                && !sequentialAutopilotAnchorGoalId.isBlank()
                && isSequentialLearningStrategy(learner)
                && Boolean.TRUE.equals(learner.getAutoPilot())) {
            sequentialAutopilotSearchAtomic = filterAtomicFrontier(getRichFrontier(skillpilotId, false));
        }

        List<String> storedPlannedGoalIds = getStoredPlannedGoals(skillpilotId);
        List<String> plannedIds = normalizePlannedGoalIdsForVisibleGoals(
                storedPlannedGoalIds,
                structuralGoals,
                true);
        List<String> plannedScopeIds = resolvePlannedGoalIdsForScope(
                storedPlannedGoalIds,
                structuralGoals,
                true);
        List<FrontierGoal> plannedRich = new ArrayList<>();

        for (String pid : plannedIds) {
            LearningGoal g = allGoals.get(pid);
            if (g == null) {
                g = structuralGoals.get(pid);
            }
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
            } else if (isCompositionStructureGoalId(pid)) {
                plannedRich.add(toCompositionStructureFrontierGoal(pid, "Planned"));
            } else {
                // True unknown (deleted or invalid ID)
                plannedRich.add(new FrontierGoal(pid, "Unknown Goal", "", "unknown", null, "Planned",
                        null, null, null, null, null, null));
            }
        }

        Set<String> scope = Collections.emptySet();
        if (curriculumId != null && !plannedScopeIds.isEmpty()) {
            scope = computeScope(plannedScopeIds, structuralGoals, Collections.emptyMap());
        }
        Map<String, Double> mastery = getMastery(skillpilotId);
        String storedActiveGoalId = learner.getActiveGoalId();
        String activeGoalId = resolveGoalIdInVisibleGoals(storedActiveGoalId, allGoals, false);
        boolean activeGoalMastered = activeGoalId != null && !activeGoalId.isBlank()
                && mastery.getOrDefault(activeGoalId, 0.0) >= 0.9;
        boolean activeGoalInvalidInView = storedActiveGoalId != null
                && !storedActiveGoalId.isBlank()
                && activeGoalId == null;
        boolean activeGoalIsCurrentViewGoal = storedActiveGoalId != null
                && !storedActiveGoalId.isBlank()
                && storedActiveGoalId.equals(activeGoalId);
        boolean activeGoalOutOfScope = activeGoalIsCurrentViewGoal
                && activeGoalId != null
                && isGoalOutOfPlannedScope(activeGoalId, plannedScopeIds, structuralGoals, scope);
        if (activeGoalMastered || activeGoalInvalidInView || activeGoalOutOfScope) {
            clearPersistedActiveGoal(
                    learner,
                    skillpilotId,
                    activeGoalInvalidInView
                            ? "ACTIVE_GOAL_CLEARED_INVALID_VIEW"
                            : activeGoalOutOfScope ? "ACTIVE_GOAL_CLEARED_OUT_OF_SCOPE" : "ACTIVE_GOAL_CLEARED_STALE");
            activeGoalId = null;
            activeGoalMastered = false;
        }
        if (activeGoalId != null && !activeGoalId.isBlank()) {
            LearningGoal activeLearningGoal = allGoals.get(activeGoalId);
            if (isSrsGoalUnavailableForVerifiedRecall(skillpilotId, activeLearningGoal)
                    || isExamGoalUnavailableForHardCheck(activeLearningGoal)) {
                clearPersistedActiveGoal(learner, skillpilotId, "ACTIVE_GOAL_CLEARED_UNAVAILABLE_HARD_CHECK");
                activeGoalId = null;
                activeGoalMastered = false;
            }
        }

        com.skillpilot.backend.api.GoalStats personalizedStats = computeAtomicStats(allGoals, null, mastery);
        com.skillpilot.backend.api.GoalStats scopeStats = plannedScopeIds.isEmpty()
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
                    Map<String, Map<String, Object>> config = parsePersonalCurriculumConfig(json);
                    for (Map.Entry<String, Map<String, Object>> configEntry : config.entrySet()) {
                        Map<String, Object> landscapeConfig = configEntry.getValue();
                        Object filterObj = landscapeConfig.get("filterId");
                        if (filterObj instanceof String) {
                            String f = (String) filterObj;
                            if (!activeFilters.contains(f)) {
                                activeFilters.add(f);
                            }
                        }
                        Object durationModelObj = landscapeConfig.get("durationModel");
                        if (durationModelObj instanceof String) {
                            String durationModel = normalizeFilterId((String) durationModelObj);
                            if (!CANONICAL_GYMNASIUM_ROOT_ID.equals(configEntry.getKey())
                                    && DURATION_MODEL_FILTER_IDS.contains(durationModel)
                                    && !activeFilters.contains(durationModel)) {
                                activeFilters.add(durationModel);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors
            }

            personalizationRequired = needsPersonalization(frontier, activeFilters);
        }

        activeGoalId = maybeAutoActivateFrontierGoal(
                learner,
                activeGoalId,
                frontierAtomic,
                sequentialAutopilotSearchAtomic,
                personalizationRequired,
                sequentialAutopilotAnchorGoalId,
                structuralGoals);
        activeGoalMastered = activeGoalId != null && !activeGoalId.isBlank()
                && mastery.getOrDefault(activeGoalId, 0.0) >= 0.9;

        FrontierGoal activeGoal = resolveActiveGoal(activeGoalId, allGoals);
        boolean activeGoalIsMemory = isMemoryFrontierGoal(activeGoal);

        if (curriculumId != null) {
            nextAllowedActions.add("setPersonalization");
            if (!personalizationRequired) {
                nextAllowedActions.add("setScope");
                nextAllowedActions.add("getFrontier");
                if (activeGoalId != null && !activeGoalId.isBlank() && !activeGoalMastered) {
                    if (activeGoalIsMemory) {
                        nextAllowedActions.add("chooseMemoryMode");
                        nextAllowedActions.add("startVerifiedRecall");
                    } else {
                        nextAllowedActions.add("setMastery");
                    }
                } else if (!frontierAtomic.isEmpty()) {
                    nextAllowedActions.add("setActiveGoal");
                }
            }
        }

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
                && frontier.isEmpty() && !plannedScopeIds.isEmpty()) {
            Map<String, Double> effectiveMastery = computeEffectiveMastery(allGoals, mastery);
            Map<String, LearningGoal> structuralForExpansion = structuralGoals;
            if (structuralForExpansion == null || structuralForExpansion.isEmpty()) {
                structuralForExpansion = getFilteredGoals(curriculumId, "{}");
            }
            Set<String> scopeForExpansion = scope;
            if (scopeForExpansion == null || scopeForExpansion.isEmpty()) {
                scopeForExpansion = computeScope(plannedScopeIds, structuralForExpansion, Collections.emptyMap());
            }
            scopeExpansionOptions = buildScopeExpansionOptions(curriculumId, allGoals, structuralForExpansion,
                    scopeForExpansion, plannedScopeIds, storedPlannedGoalIds, effectiveMastery);
        }

        StateMachineInfo stateMachine = buildStateMachineInfo(curriculumId, frontier, frontierAtomic, activeGoal,
                activeGoalMastered, learningState, activeFilters, scopeExpansionOptions);

        return new UnifiedLearnerStateResponse(learner.getSkillpilotId(), curriculumSummary, frontier,
                new LearnerGoals(plannedRich, focusStats.mastered_atomic(), focusStats.total_atomic(),
                        personalizedStats, scopeStats, scopeCompleted),
                nextAllowedActions, activeFilters,
                learner.getCopySources(), learningState.name(), activeGoal, stateMachine);
    }

    private String maybeAutoActivateFrontierGoal(
            Learner learner,
            String activeGoalId,
            List<FrontierGoal> frontierAtomic,
            List<FrontierGoal> sequentialAutopilotSearchAtomic,
            boolean personalizationRequired,
            String sequentialAutopilotAnchorGoalId,
            Map<String, LearningGoal> structuralGoals) {
        if (!Boolean.TRUE.equals(learner.getAutoPilot())) {
            return activeGoalId;
        }
        if (activeGoalId != null && !activeGoalId.isBlank()) {
            return activeGoalId;
        }
        if (personalizationRequired || frontierAtomic == null || frontierAtomic.isEmpty()) {
            return activeGoalId;
        }

        FrontierGoal nextGoal = chooseAutopilotFrontierGoal(
                learner,
                frontierAtomic,
                sequentialAutopilotSearchAtomic,
                sequentialAutopilotAnchorGoalId,
                structuralGoals);
        if (nextGoal == null || nextGoal.id() == null || nextGoal.id().isBlank()) {
            return activeGoalId;
        }

        learner.setActiveGoalId(nextGoal.id());
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        eventPublisher.publishEvent(
                new LearnerStateChangedEvent(this, learner.getSkillpilotId(), "ACTIVE_GOAL_UPDATE_AUTOPILOT"));
        return nextGoal.id();
    }

    private FrontierGoal chooseAutopilotFrontierGoal(
            Learner learner,
            List<FrontierGoal> frontierAtomic,
            List<FrontierGoal> sequentialAutopilotSearchAtomic,
            String sequentialAutopilotAnchorGoalId,
            Map<String, LearningGoal> structuralGoals) {
        if (frontierAtomic == null || frontierAtomic.isEmpty()) {
            return null;
        }
        if (isSequentialLearningStrategy(learner)
                && sequentialAutopilotAnchorGoalId != null
                && !sequentialAutopilotAnchorGoalId.isBlank()) {
            FrontierGoal localNext = findSequentialLocalFrontierGoal(
                    sequentialAutopilotAnchorGoalId,
                    sequentialAutopilotSearchAtomic == null || sequentialAutopilotSearchAtomic.isEmpty()
                            ? frontierAtomic
                            : sequentialAutopilotSearchAtomic,
                    structuralGoals);
            if (localNext != null) {
                return localNext;
            }
            return null;
        }
        return frontierAtomic.get(0);
    }

    private boolean isSequentialLearningStrategy(Learner learner) {
        return learner != null && "SEQUENTIAL".equalsIgnoreCase(learner.getLearningStrategy());
    }

    private FrontierGoal findSequentialLocalFrontierGoal(
            String anchorGoalId,
            List<FrontierGoal> frontierAtomic,
            Map<String, LearningGoal> structuralGoals) {
        if (anchorGoalId == null
                || anchorGoalId.isBlank()
                || frontierAtomic == null
                || frontierAtomic.isEmpty()
                || structuralGoals == null
                || structuralGoals.isEmpty()) {
            return null;
        }

        LinkedHashMap<String, FrontierGoal> frontierById = new LinkedHashMap<>();
        for (FrontierGoal goal : frontierAtomic) {
            if (goal != null && goal.id() != null && !goal.id().isBlank()) {
                frontierById.putIfAbsent(goal.id(), goal);
            }
        }
        if (frontierById.isEmpty()) {
            return null;
        }

        Map<String, Set<String>> parentMap = buildParentMap(structuralGoals);
        return findSequentialLocalFrontierGoal(
                anchorGoalId,
                frontierById,
                structuralGoals,
                parentMap,
                new HashSet<>());
    }

    private FrontierGoal findSequentialLocalFrontierGoal(
            String anchorGoalId,
            Map<String, FrontierGoal> frontierById,
            Map<String, LearningGoal> structuralGoals,
            Map<String, Set<String>> parentMap,
            Set<String> visitedAnchors) {
        if (anchorGoalId == null || anchorGoalId.isBlank() || !visitedAnchors.add(anchorGoalId)) {
            return null;
        }

        List<String> parentIds = orderedLocalParentIds(anchorGoalId, parentMap, structuralGoals);
        boolean hasLocalFollowingSibling = false;
        for (String parentId : parentIds) {
            LocalParentFrontierSearch nextInParent = findNextFrontierAfterChildInParent(
                    parentId,
                    anchorGoalId,
                    frontierById,
                    structuralGoals);
            if (nextInParent.goal() != null) {
                return nextInParent.goal();
            }
            hasLocalFollowingSibling = hasLocalFollowingSibling || nextInParent.hasFollowingSibling();
        }

        if (hasLocalFollowingSibling) {
            return null;
        }

        for (String parentId : parentIds) {
            FrontierGoal nextAfterParent = findSequentialLocalFrontierGoal(
                    parentId,
                    frontierById,
                    structuralGoals,
                    parentMap,
                    visitedAnchors);
            if (nextAfterParent != null) {
                return nextAfterParent;
            }
        }

        return null;
    }

    private record LocalParentFrontierSearch(FrontierGoal goal, boolean hasFollowingSibling) {
    }

    private List<String> orderedLocalParentIds(
            String goalId,
            Map<String, Set<String>> parentMap,
            Map<String, LearningGoal> structuralGoals) {
        Set<String> parentIds = parentMap.getOrDefault(goalId, Collections.emptySet());
        if (parentIds.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, Integer> descendantCountCache = new HashMap<>();
        return parentIds.stream()
                .sorted(Comparator.comparingInt(parentId ->
                        countStructuralDescendants(parentId, structuralGoals, descendantCountCache, new HashSet<>())))
                .toList();
    }

    private int countStructuralDescendants(
            String goalId,
            Map<String, LearningGoal> structuralGoals,
            Map<String, Integer> cache,
            Set<String> visiting) {
        Integer cached = cache.get(goalId);
        if (cached != null) {
            return cached;
        }
        if (goalId == null || goalId.isBlank() || !visiting.add(goalId)) {
            return 0;
        }

        LearningGoal goal = structuralGoals.get(goalId);
        int count = 0;
        if (goal != null && goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, structuralGoals);
                if (childId == null) {
                    continue;
                }
                count += 1 + countStructuralDescendants(childId, structuralGoals, cache, visiting);
            }
        }

        visiting.remove(goalId);
        cache.put(goalId, count);
        return count;
    }

    private LocalParentFrontierSearch findNextFrontierAfterChildInParent(
            String parentId,
            String childId,
            Map<String, FrontierGoal> frontierById,
            Map<String, LearningGoal> structuralGoals) {
        LearningGoal parent = structuralGoals.get(parentId);
        if (parent == null || parent.getContains() == null || parent.getContains().isEmpty()) {
            return new LocalParentFrontierSearch(null, false);
        }

        boolean afterChild = false;
        boolean hasFollowingSibling = false;
        for (String siblingRef : parent.getContains()) {
            String siblingId = resolveGoalRef(siblingRef, structuralGoals);
            if (siblingId == null) {
                continue;
            }
            if (!afterChild) {
                afterChild = siblingId.equals(childId);
                continue;
            }
            hasFollowingSibling = true;
            FrontierGoal next = findFirstFrontierInSubtree(siblingId, frontierById, structuralGoals, new HashSet<>());
            if (next != null) {
                return new LocalParentFrontierSearch(next, true);
            }
        }
        return new LocalParentFrontierSearch(null, hasFollowingSibling);
    }

    private FrontierGoal findFirstFrontierInSubtree(
            String goalId,
            Map<String, FrontierGoal> frontierById,
            Map<String, LearningGoal> structuralGoals,
            Set<String> visiting) {
        FrontierGoal direct = frontierById.get(goalId);
        if (direct != null) {
            return direct;
        }
        if (goalId == null || goalId.isBlank() || !visiting.add(goalId)) {
            return null;
        }

        LearningGoal goal = structuralGoals.get(goalId);
        if (goal != null && goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, structuralGoals);
                if (childId == null) {
                    continue;
                }
                FrontierGoal next = findFirstFrontierInSubtree(childId, frontierById, structuralGoals, visiting);
                if (next != null) {
                    visiting.remove(goalId);
                    return next;
                }
            }
        }

        visiting.remove(goalId);
        return null;
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
        } else if (activeGoal != null && !activeGoalMastered && isMemoryFrontierGoal(activeGoal)) {
            requiredAction = "chooseMemoryMode";
            goalOptions = List.of(activeGoal);
        } else if (activeGoal != null && !activeGoalMastered) {
            requiredAction = "teachActiveGoal";
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

        List<LearningModeOption> modeOptions = activeGoal != null && !activeGoalMastered && isMemoryFrontierGoal(activeGoal)
                ? buildMemoryModeOptions(activeGoal)
                : Collections.emptyList();
        return new StateMachineInfo(state, requiredAction, goalOptions, curriculumOptions, activeGoal, modeOptions);
    }

    private List<LearningModeOption> buildMemoryModeOptions(FrontierGoal activeGoal) {
        if (activeGoal == null) {
            return Collections.emptyList();
        }
        return List.of(
                new LearningModeOption(
                        "practice",
                        "Im Cockpit üben",
                        "Öffne den SRS-Kartendrill im Cockpit für fällige Karten und Wiederholung.",
                        "openCockpitPractice",
                        "cockpit",
                        activeGoal.id()),
                new LearningModeOption(
                        "verify",
                        "Mit Lerncoach prüfen",
                        "Schalte in den harten Kartenprüfmodus: Nutze verified-recall/start, frage ohne Hilfe ab, hole danach die erwartete Antwort und speichere passed oder failed.",
                        "startVerifiedRecall",
                        "gpt",
                        activeGoal.id()));
    }

    private boolean isMemoryFrontierGoal(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        if ("memory".equals(goal.nodeKind())) {
            return true;
        }
        if (goal.tags() == null) {
            return false;
        }
        return goal.tags().stream().anyMatch(tag -> "memorization".equals(tag) || tag.startsWith("srs-deck:"));
    }

    private List<FrontierGoal> buildScopeExpansionOptions(String curriculumId, Map<String, LearningGoal> filteredGoals,
            Map<String, LearningGoal> structuralGoals, Set<String> scope, List<String> plannedIds,
            List<String> storedPlannedIds, Map<String, Double> effectiveMastery) {
        if (plannedIds == null || plannedIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<FrontierGoal> compositionOptions = buildCompositionScopeExpansionOptions(
                filteredGoals,
                scope,
                storedPlannedIds,
                effectiveMastery);
        if (!compositionOptions.isEmpty()) {
            return compositionOptions;
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

    private List<FrontierGoal> buildCompositionScopeExpansionOptions(
            Map<String, LearningGoal> filteredGoals,
            Set<String> scope,
            List<String> storedPlannedIds,
            Map<String, Double> effectiveMastery) {
        if (compositionViewService == null || storedPlannedIds == null || storedPlannedIds.isEmpty()) {
            return Collections.emptyList();
        }

        LinkedHashMap<String, FrontierGoal> options = new LinkedHashMap<>();
        for (String storedPlannedId : storedPlannedIds) {
            if (!isCompositionStructureGoalId(storedPlannedId)) {
                continue;
            }
            List<CompositionViewService.CompositionStructureResolution> siblings =
                    compositionViewService.findFollowingScopeSiblings(storedPlannedId);
            for (CompositionViewService.CompositionStructureResolution sibling : siblings) {
                if (sibling == null || sibling.syntheticGoalId() == null || sibling.syntheticGoalId().isBlank()) {
                    continue;
                }
                List<String> mappedReferenceIds = sibling.referencedGoalIds().stream()
                        .map(goalId -> mapGoalIdForVisibleGoals(goalId, filteredGoals, true))
                        .filter(goalId -> goalId != null && filteredGoals.containsKey(goalId))
                        .distinct()
                        .toList();
                if (mappedReferenceIds.isEmpty()) {
                    continue;
                }
                if (scope != null && !scope.isEmpty() && mappedReferenceIds.stream().allMatch(scope::contains)) {
                    continue;
                }
                boolean siblingCompleted = mappedReferenceIds.stream()
                        .allMatch(goalId -> effectiveMastery != null
                                && effectiveMastery.getOrDefault(goalId, 0.0) >= 0.9);
                if (siblingCompleted) {
                    continue;
                }

                FrontierGoal option = isCompositionStructureGoalId(sibling.syntheticGoalId())
                        ? toCompositionStructureFrontierGoal(sibling.syntheticGoalId(), "Scope expansion")
                        : toFrontierGoal(filteredGoals.get(mappedReferenceIds.get(0)), "Scope expansion", null);
                if (option != null) {
                    options.putIfAbsent(option.id(), option);
                }
                break;
            }
        }

        return new ArrayList<>(options.values());
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

        Map<String, LearningGoal> visibleGoals = Collections.emptyMap();
        if (learner.getSelectedCurriculum() != null && !learner.getSelectedCurriculum().isBlank()) {
            visibleGoals = getFilteredGoals(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        }
        String effectiveGoalId = resolveGoalIdInVisibleGoals(goalId, visibleGoals, false);
        if (effectiveGoalId == null || effectiveGoalId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "goalId must be an atomic goal from the current frontier.");
        }
        if (isExamGoalUnavailableForHardCheck(visibleGoals.get(effectiveGoalId))) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "goalId must reference a released, concrete exam goal.");
        }

        List<FrontierGoal> frontierAtomic = filterAtomicFrontier(getRichFrontier(skillpilotId));
        boolean allowed = frontierAtomic.stream().anyMatch(goal -> goal.id().equals(effectiveGoalId));
        if (!allowed) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "goalId must be an atomic goal from the current frontier.");
        }

        String currentActiveGoalId = learner.getActiveGoalId();
        if (currentActiveGoalId != null && !currentActiveGoalId.isBlank() && currentActiveGoalId.equals(effectiveGoalId)) {
            return;
        }

        learner.setActiveGoalId(effectiveGoalId);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "ACTIVE_GOAL_UPDATE"));
    }

    private boolean isExamGoalUnavailableForHardCheck(LearningGoal goal) {
        if (goal == null || !isExamGoal(goal)) {
            return false;
        }
        return !isExamDataReadyForHardCheck(goal.getExamData());
    }

    private boolean isExamGoal(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        return "exam".equalsIgnoreCase(goal.getNodeKind()) || goal.getExamData() != null;
    }

    private boolean isExamDataReadyForHardCheck(com.skillpilot.backend.landscape.ExamData exam) {
        if (exam == null) {
            return false;
        }
        if (hasBlockingExamReviewStatus(exam.getReviewStatus())) {
            return false;
        }
        if (containsPlaceholderExamText(exam)) {
            return false;
        }
        return hasScoringStructure(exam)
                && exam.getTaskContent() != null
                && !exam.getTaskContent().isBlank()
                && exam.getSolutionContent() != null
                && !exam.getSolutionContent().isBlank();
    }

    private boolean hasBlockingExamReviewStatus(String reviewStatus) {
        if (reviewStatus == null || reviewStatus.isBlank()) {
            return false;
        }
        return !"released".equals(reviewStatus.trim().toLowerCase(Locale.ROOT));
    }

    private boolean containsPlaceholderExamText(com.skillpilot.backend.landscape.ExamData exam) {
        String task = normalizeExamTextForInspection(exam.getTaskContent());
        String solution = normalizeExamTextForInspection(exam.getSolutionContent());
        if (task.matches("^eine materialgestuetzte j\\d+[- ]uebungsaufgabe\\b.*")) {
            return true;
        }
        if (task.matches("^eine integrative sek[- ]i[- ]abschlussaufgabe\\b.*")) {
            return true;
        }
        if (task.contains("uebungsaufgabe verbindet") && !hasExamSubtaskMarkers(task)) {
            return true;
        }
        return solution.startsWith("die loesung zeigt ")
                && !hasExamSubtaskMarkers(task)
                && !task.matches(".*\\b\\d+[,.]?\\d*\\b.*");
    }

    private boolean hasExamSubtaskMarkers(String normalizedTask) {
        return normalizedTask.matches("(?s).*(?:\\b1\\.|\\ba\\)|\\baufgabe\\s+1\\b|\\bteilaufgabe\\b).*");
    }

    private String normalizeExamTextForInspection(String value) {
        if (value == null) {
            return "";
        }
        return value
                .toLowerCase(Locale.ROOT)
                .replace("ü", "ue")
                .replace("ä", "ae")
                .replace("ö", "oe")
                .replace("ß", "ss")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean hasScoringStructure(com.skillpilot.backend.landscape.ExamData exam) {
        com.skillpilot.backend.landscape.ExamData.Scoring scoring = exam.getScoring();
        return scoring != null
                && scoring.getMaxPoints() > 0
                && scoring.getPassingPoints() > 0
                && scoring.getSteps() != null
                && !scoring.getSteps().isEmpty();
    }

    private boolean isCompositionStructureGoalId(String goalId) {
        return goalId != null && goalId.startsWith("composition:") && goalId.contains(":structure:");
    }

    private FrontierGoal toCompositionStructureFrontierGoal(String goalId, String reason) {
        CompositionViewService.CompositionStructureResolution resolution = compositionViewService == null
                ? null
                : compositionViewService.resolveStructureReference(goalId);
        String title = resolution == null || resolution.label() == null || resolution.label().isBlank()
                ? "Geplanter Lernbereich"
                : resolution.label();
        String description = resolution == null || resolution.referencedGoalIds().isEmpty()
                ? ""
                : "Geplanter Lernbereich aus der Curriculum-Ansicht.";
        return new FrontierGoal(
                goalId,
                title,
                description,
                "cluster",
                "tutor",
                reason,
                List.of("synthetic:program-unit"),
                Collections.emptyList(),
                null,
                null,
                null,
                null);
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
                trimToNull(readString(rawLink.get("license"))),
                trimToNull(readString(rawLink.get("skillpilotId"))),
                trimToNull(readString(rawLink.get("role"))),
                trimToNull(readString(rawLink.get("altText"))),
                trimToNull(readString(rawLink.get("reviewStatus"))));
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
        return getAvailableBaseCurricula(true);
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.landscape.LandscapeSummary> getAvailableBaseCurricula(boolean includeCompatibility) {
        return landscapeService.getBaseCurricula(includeCompatibility);
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.landscape.LandscapeSummary> getAvailableLandscapes() {
        return getAvailableLandscapes(true);
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.landscape.LandscapeSummary> getAvailableLandscapes(boolean includeCompatibility) {
        return landscapeService.getOverview("de", includeCompatibility).getSummaries();
    }

    @Transactional
    public void materializeCanonicalMasteryFromExactMappings(String skillpilotId) {
        if (skillpilotId == null || skillpilotId.isBlank()) {
            return;
        }

        Learner learner = learnerRepository.findById(skillpilotId).orElse(null);
        if (learner == null) {
            return;
        }

        List<Mastery> mastered = masteryRepository.findByLearner_SkillpilotId(skillpilotId);
        if (mastered.isEmpty()) {
            return;
        }

        Map<String, Mastery> masteryByGoalKey = new HashMap<>();
        for (Mastery mastery : mastered) {
            masteryByGoalKey.put(mastery.getGoalKey(), mastery);
        }

        for (ResolvedGoalMapping mapping : goalMappingService.getAllMappings()) {
            if (!"exact".equals(mapping.matchType())) {
                continue;
            }

            Mastery legacyMastery = masteryByGoalKey.get(mapping.legacyGoalId());
            if (legacyMastery == null) {
                continue;
            }

            MasteryEntryDTO candidateEntry = new MasteryEntryDTO(legacyMastery.getValue(), legacyMastery.getUpdatedAt());
            for (String canonicalGoalId : resolveCanonicalProjectionTargetIds(mapping.canonicalGoalId(), null)) {
                Mastery canonicalMastery = masteryByGoalKey.get(canonicalGoalId);
                MasteryEntryDTO currentEntry = canonicalMastery == null
                        ? null
                        : new MasteryEntryDTO(canonicalMastery.getValue(), canonicalMastery.getUpdatedAt());
                if (!shouldReplaceProjectedEntry(currentEntry, candidateEntry)) {
                    continue;
                }

                if (canonicalMastery == null) {
                    canonicalMastery = new Mastery(learner, canonicalGoalId, legacyMastery.getValue());
                } else {
                    canonicalMastery.setValue(legacyMastery.getValue());
                }
                masteryRepository.saveAndFlush(canonicalMastery);
                if (legacyMastery.getUpdatedAt() != null) {
                    masteryRepository.updateTimestamp(skillpilotId, canonicalGoalId, legacyMastery.getUpdatedAt());
                }
                masteryByGoalKey.put(canonicalGoalId, canonicalMastery);
            }
        }
    }

    @Transactional
    public void materializeCanonicalClientStateFromExactMappings(String skillpilotId) {
        if (skillpilotId == null || skillpilotId.isBlank()) {
            return;
        }

        Learner learner = learnerRepository.findById(skillpilotId).orElse(null);
        if (learner == null) {
            return;
        }

        List<LearnerClientState> clientStates = learnerClientStateRepository.findByLearner_SkillpilotId(skillpilotId);
        if (clientStates.isEmpty()) {
            return;
        }

        Map<String, LearnerClientState> clientStateByNodeId = new HashMap<>();
        for (LearnerClientState clientState : clientStates) {
            if (clientState == null || clientState.getId() == null) {
                continue;
            }
            String nodeId = clientState.getId().getNodeId();
            if (nodeId == null || nodeId.isBlank()) {
                continue;
            }
            clientStateByNodeId.put(nodeId, clientState);
        }

        for (ResolvedGoalMapping mapping : goalMappingService.getAllMappings()) {
            if (!"exact".equals(mapping.matchType())) {
                continue;
            }

            LearnerClientState legacyClientState = clientStateByNodeId.get(mapping.legacyGoalId());
            if (!hasPersistableClientState(legacyClientState)) {
                continue;
            }

            LearnerClientState canonicalClientState = clientStateByNodeId.get(mapping.canonicalGoalId());
            if (!shouldReplaceProjectedClientState(canonicalClientState, legacyClientState)) {
                continue;
            }

            if (canonicalClientState == null) {
                canonicalClientState = new LearnerClientState(
                        learner,
                        mapping.canonicalGoalId(),
                        legacyClientState.getClientState(),
                        legacyClientState.getClientStateUpdatedAt());
            } else {
                canonicalClientState.setClientState(legacyClientState.getClientState());
                canonicalClientState.setClientStateUpdatedAt(legacyClientState.getClientStateUpdatedAt());
            }

            learnerClientStateRepository.save(canonicalClientState);
            clientStateByNodeId.put(mapping.canonicalGoalId(), canonicalClientState);
        }
    }

    private boolean hasPersistableClientState(LearnerClientState clientState) {
        return clientState != null
                && hasPersistableClientStatePayload(clientState.getClientState());
    }

    private boolean hasPersistableClientStatePayload(String clientStateJson) {
        if (clientStateJson == null || clientStateJson.isBlank()) {
            return false;
        }
        try {
            Map<String, Object> parsed = objectMapper.readValue(
                    clientStateJson,
                    new TypeReference<Map<String, Object>>() {
                    });
            return parsed != null && !parsed.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    private boolean shouldReplaceProjectedClientState(LearnerClientState current, LearnerClientState candidate) {
        if (!hasPersistableClientState(candidate)) {
            return false;
        }
        if (!hasPersistableClientState(current)) {
            return true;
        }

        Instant currentTs = current.getClientStateUpdatedAt();
        Instant candidateTs = candidate.getClientStateUpdatedAt();
        if (currentTs == null) {
            return candidateTs != null || !Objects.equals(current.getClientState(), candidate.getClientState());
        }
        if (candidateTs == null) {
            return false;
        }
        return candidateTs.isAfter(currentTs);
    }

    @Transactional(readOnly = true)
    public Set<String> getFilteredAtomicGoalIds(
            String curriculumId,
            String personalCurriculumJson,
            String topicId,
            boolean ignoreCourseFilters) {
        Map<String, LearningGoal> filteredGoals = getFilteredGoals(curriculumId, personalCurriculumJson, ignoreCourseFilters);
        if (filteredGoals.isEmpty()) {
            return Collections.emptySet();
        }
        if (topicId == null || topicId.isBlank()) {
            return filteredGoals.values().stream()
                    .filter(goal -> goal.getContains() == null || goal.getContains().isEmpty())
                    .map(LearningGoal::getId)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        }
        Set<String> atomicIds = new LinkedHashSet<>();
        collectVisibleAtomicGoalIds(topicId, filteredGoals, atomicIds, new HashSet<>());
        return atomicIds;
    }

    private Map<String, LearningGoal> getFilteredGoals(String curriculumId, String personalCurriculumJson) {
        return getFilteredGoals(curriculumId, personalCurriculumJson, false);
    }

    private Map<String, LearningGoal> getFilteredGoals(String curriculumId, String personalCurriculumJson,
            boolean ignoreCourseFilters) {
        List<LearningLandscape> closure = landscapeService.getClosure(curriculumId);
        LearningLandscape root = landscapeService.getById(curriculumId);
        if (root != null && closure.stream().noneMatch(l -> l.getLandscapeId().equals(root.getLandscapeId()))) {
            closure = new ArrayList<>(closure);
            closure.add(root);
        }

        Map<String, Map<String, Object>> config = parsePersonalCurriculumConfig(personalCurriculumJson);

        String rootFilterId = null;
        String rootDurationModel = null;
        if (!config.isEmpty()) {
            Map<String, Object> rootConfig = config.get(curriculumId);
            if (rootConfig != null) {
                Object rootFilterObj = rootConfig.get("filterId");
                if (rootFilterObj instanceof String) {
                    rootFilterId = normalizeFilterId((String) rootFilterObj);
                }
                Object rootDurationObj = rootConfig.get("durationModel");
                if (rootDurationObj instanceof String) {
                    rootDurationModel = normalizeFilterId((String) rootDurationObj);
                }
            }
        }

        Map<String, Set<String>> mappedCanonicalGoalIdsByState = new HashMap<>();
        Map<String, Boolean> canonicalStateCoverageCache = new HashMap<>();
        Map<String, LearningGoal> allGoals = new LinkedHashMap<>();
        for (LearningLandscape l : closure) {
            // Filter by landscape selection
            // Default to selected if no config exists, or if explicitly selected
            boolean isSelected = true;
            String filterId = null;
            String durationModel = null;

            if (!config.isEmpty()) {
                Map<String, Object> landscapeConfig = config.get(l.getLandscapeId());
                if (landscapeConfig != null) {
                    Object selectedObj = landscapeConfig.get("selected");
                    if (selectedObj instanceof Boolean) {
                        isSelected = (Boolean) selectedObj;
                    }
                    Object filterObj = landscapeConfig.get("filterId");
                    if (filterObj instanceof String) {
                        filterId = normalizeFilterId((String) filterObj);
                    }
                    Object durationObj = landscapeConfig.get("durationModel");
                    if (durationObj instanceof String) {
                        durationModel = normalizeFilterId((String) durationObj);
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

            List<String> effectiveFilterIds = new ArrayList<>();
            if (filterId != null && !filterId.isBlank()) {
                effectiveFilterIds.add(filterId);
            }
            if (rootFilterId != null && !rootFilterId.isBlank() && !l.getLandscapeId().equals(curriculumId)
                    && !effectiveFilterIds.contains(rootFilterId)) {
                effectiveFilterIds.add(rootFilterId);
            }
            if (durationModel != null && DURATION_MODEL_FILTER_IDS.contains(durationModel)
                    && !effectiveFilterIds.contains(durationModel)) {
                effectiveFilterIds.add(durationModel);
            } else if (rootDurationModel != null && DURATION_MODEL_FILTER_IDS.contains(rootDurationModel)
                    && !l.getLandscapeId().equals(curriculumId)
                    && !effectiveFilterIds.contains(rootDurationModel)) {
                effectiveFilterIds.add(rootDurationModel);
            }

            if (l.getGoals() != null) {
                for (LearningGoal g : l.getGoals()) {
                    if (!matchesAllEffectiveFilters(g, l, effectiveFilterIds, ignoreCourseFilters, mappedCanonicalGoalIdsByState,
                            canonicalStateCoverageCache)) {
                        continue;
                    }
                    allGoals.put(g.getId(), g);
                }
            }
        }
        if (!ignoreCourseFilters) {
            return applyCompositionViewScope(curriculumId, allGoals, config, closure);
        }
        return allGoals;
    }

    private Map<String, LearningGoal> applyCompositionViewScope(
            String curriculumId,
            Map<String, LearningGoal> allGoals,
            Map<String, Map<String, Object>> config,
            List<LearningLandscape> closure) {
        if (compositionViewService == null
                || curriculumId == null
                || curriculumId.isBlank()
                || allGoals == null
                || allGoals.isEmpty()
                || config == null
                || config.isEmpty()
                || closure == null
                || closure.isEmpty()) {
            return allGoals;
        }

        LinkedHashSet<String> referencedGoalIds = new LinkedHashSet<>();
        LinkedHashSet<String> fallbackGoalIds = new LinkedHashSet<>();
        for (LearningLandscape landscape : closure) {
            if (!isCompositionViewCandidate(curriculumId, landscape, config)) {
                continue;
            }
            Map<String, String> requestedScope = deriveCompositionScope(landscape.getLandscapeId(), config);
            if (requestedScope.isEmpty()) {
                addFilteredLandscapeGoalIds(landscape, allGoals, fallbackGoalIds);
                continue;
            }
            Map<String, Object> matchedView =
                    compositionViewService.findMatchingView(landscape.getLandscapeId(), requestedScope);
            if (matchedView == null || matchedView.isEmpty()) {
                addFilteredLandscapeGoalIds(landscape, allGoals, fallbackGoalIds);
                continue;
            }
            LinkedHashSet<String> landscapeReferencedGoalIds = new LinkedHashSet<>();
            collectCompositionViewGoalReferences(matchedView.get("rootNodes"), landscapeReferencedGoalIds);
            if (landscapeReferencedGoalIds.isEmpty()) {
                addFilteredLandscapeGoalIds(landscape, allGoals, fallbackGoalIds);
            } else {
                referencedGoalIds.addAll(landscapeReferencedGoalIds);
            }
        }

        if (referencedGoalIds.isEmpty() && fallbackGoalIds.isEmpty()) {
            return allGoals;
        }

        LinkedHashSet<String> visibleGoalIds = new LinkedHashSet<>();
        for (String referencedGoalId : referencedGoalIds) {
            collectCompositionGoalAndDescendants(referencedGoalId, allGoals, visibleGoalIds, new HashSet<>());
        }
        visibleGoalIds.addAll(fallbackGoalIds);
        if (visibleGoalIds.isEmpty()) {
            return allGoals;
        }
        addCompositionAncestors(allGoals, visibleGoalIds);

        Map<String, LearningGoal> scopedGoals = new LinkedHashMap<>();
        for (Map.Entry<String, LearningGoal> entry : allGoals.entrySet()) {
            if (visibleGoalIds.contains(entry.getKey())) {
                scopedGoals.put(entry.getKey(), entry.getValue());
            }
        }
        return scopedGoals.isEmpty() ? allGoals : scopedGoals;
    }

    private void addFilteredLandscapeGoalIds(
            LearningLandscape landscape,
            Map<String, LearningGoal> allGoals,
            Set<String> goalIds) {
        if (landscape == null || landscape.getGoals() == null || allGoals == null || allGoals.isEmpty() || goalIds == null) {
            return;
        }
        for (LearningGoal goal : landscape.getGoals()) {
            if (goal != null && allGoals.containsKey(goal.getId())) {
                goalIds.add(goal.getId());
            }
        }
    }

    private boolean isCompositionViewCandidate(
            String curriculumId,
            LearningLandscape landscape,
            Map<String, Map<String, Object>> config) {
        if (!isCanonicalGymnasiumLandscape(landscape)) {
            return false;
        }
        String landscapeId = landscape.getLandscapeId();
        if (landscapeId == null || landscapeId.isBlank() || CANONICAL_GYMNASIUM_ROOT_ID.equals(landscapeId)) {
            return false;
        }
        if (landscapeId.equals(curriculumId)) {
            return true;
        }
        if (!config.containsKey(landscapeId)) {
            return false;
        }
        return readSelectedFlag(config, landscapeId);
    }

    private Map<String, String> deriveCompositionScope(String landscapeId, Map<String, Map<String, Object>> config) {
        String rootFilterId = readFilterId(config, CANONICAL_GYMNASIUM_ROOT_ID);
        String landscapeFilterId = readFilterId(config, landscapeId);
        String jurisdiction = resolveJurisdictionFilter(rootFilterId, landscapeFilterId);
        String stage = inferCompositionStageScope(config);
        String courseProfile = normalizeCourseProfileScope(landscapeFilterId);
        String durationModel = resolveDurationModelScope(
                readScopeValue(config, landscapeId, "durationModel"),
                readScopeValue(config, CANONICAL_GYMNASIUM_ROOT_ID, "durationModel"),
                rootFilterId,
                landscapeFilterId);

        if (jurisdiction == null && stage == null && courseProfile == null && durationModel == null) {
            return Collections.emptyMap();
        }

        Map<String, String> scope = new LinkedHashMap<>();
        scope.put("schoolForm", "Gymnasium");
        if (jurisdiction != null) {
            scope.put("jurisdiction", jurisdiction);
        }
        if (stage != null) {
            scope.put("stage", stage);
        }
        if (courseProfile != null && !"SekI".equals(stage)) {
            scope.put("courseProfile", courseProfile);
        }
        if (durationModel != null) {
            scope.put("durationModel", durationModel);
        }
        return scope;
    }

    private String readFilterId(Map<String, Map<String, Object>> config, String landscapeId) {
        Map<String, Object> entry = config.get(landscapeId);
        if (entry == null) {
            return null;
        }
        Object filterId = entry.get("filterId");
        return filterId instanceof String textFilterId ? normalizeFilterId(textFilterId) : null;
    }

    private String readScopeValue(Map<String, Map<String, Object>> config, String landscapeId, String key) {
        Map<String, Object> entry = config.get(landscapeId);
        if (entry == null) {
            return null;
        }
        Object value = entry.get(key);
        return value instanceof String textValue ? normalizeFilterId(textValue) : null;
    }

    private String resolveJurisdictionFilter(String... filterCandidates) {
        for (String filterCandidate : filterCandidates) {
            String jurisdiction = BundeslandCodeNormalizer.normalize(filterCandidate);
            if (jurisdiction != null && !jurisdiction.isBlank()) {
                return jurisdiction;
            }
        }
        return null;
    }

    private String resolveDurationModelScope(String... candidates) {
        for (String candidate : candidates) {
            String durationModel = normalizeDurationModelScope(candidate);
            if (durationModel != null) {
                return durationModel;
            }
        }
        return null;
    }

    private String normalizeDurationModelScope(String value) {
        String normalized = normalizeFilterId(value);
        if (normalized == null) {
            return null;
        }
        if ("DURATIONMODEL:G8".equals(normalized) || "DURATION-MODEL:G8".equals(normalized)) {
            return "G8";
        }
        if ("DURATIONMODEL:G9".equals(normalized) || "DURATION-MODEL:G9".equals(normalized)) {
            return "G9";
        }
        return DURATION_MODEL_FILTER_IDS.contains(normalized) ? normalized : null;
    }

    private String normalizeCourseProfileScope(String filterId) {
        String normalized = normalizeFilterId(filterId);
        if (normalized == null) {
            return null;
        }
        if ("ALL".equals(normalized) || "GK+LK".equals(normalized)) {
            return "GK+LK";
        }
        return COURSE_FILTER_IDS.contains(normalized) ? normalized : null;
    }

    private String inferCompositionStageScope(Map<String, Map<String, Object>> config) {
        boolean sek1Selected = readSelectedFlag(config, STAGE_SCOPE_SEK1_ID, true);
        boolean sek2Selected = readSelectedFlag(config, STAGE_SCOPE_SEK2_ID, true);
        if (sek1Selected && sek2Selected) {
            return "CrossStage";
        }
        if (sek1Selected) {
            return "SekI";
        }
        if (sek2Selected) {
            return "SekII";
        }
        return null;
    }

    private boolean readSelectedFlag(Map<String, Map<String, Object>> config, String configId, boolean defaultValue) {
        if (config == null || config.isEmpty()) {
            return defaultValue;
        }
        Map<String, Object> entry = config.get(configId);
        if (entry == null) {
            return defaultValue;
        }
        Object selected = entry.get("selected");
        return selected instanceof Boolean selectedFlag ? selectedFlag : defaultValue;
    }

    @SuppressWarnings("unchecked")
    private void collectCompositionViewGoalReferences(Object rawNodes, Set<String> goalIds) {
        if (!(rawNodes instanceof List<?> nodeList)) {
            return;
        }
        for (Object rawNode : nodeList) {
            if (!(rawNode instanceof Map<?, ?> node)) {
                continue;
            }
            Object kind = node.get("kind");
            if (!(kind instanceof String kindText)) {
                continue;
            }
            switch (kindText) {
                case "structure" -> collectCompositionViewGoalReferences(node.get("children"), goalIds);
                case "canonicalSubtree", "goalEntry" -> {
                    Object goalId = node.get("goalId");
                    if (goalId instanceof String goalIdText && !goalIdText.isBlank()) {
                        goalIds.add(goalIdText);
                    }
                }
                case "landscapeEntry" -> {
                    Object landscapeId = node.get("landscapeId");
                    if (landscapeId instanceof String landscapeIdText && !landscapeIdText.isBlank()) {
                        LearningLandscape landscape = landscapeService.getById(landscapeIdText);
                        if (landscape != null && landscape.getGoals() != null) {
                            landscape.getGoals().stream()
                                    .filter(goal -> goal.getTags() != null && goal.getTags().contains("root"))
                                    .findFirst()
                                    .map(LearningGoal::getId)
                                    .ifPresent(goalIds::add);
                        }
                    }
                }
                default -> {
                }
            }
        }
    }

    private void collectCompositionGoalAndDescendants(
            String goalRef,
            Map<String, LearningGoal> allGoals,
            Set<String> visibleGoalIds,
            Set<String> visiting) {
        String goalId = resolveGoalRef(goalRef, allGoals);
        if (goalId == null || goalId.isBlank() || !visiting.add(goalId)) {
            return;
        }
        LearningGoal goal = allGoals.get(goalId);
        if (goal == null) {
            visiting.remove(goalId);
            return;
        }
        visibleGoalIds.add(goalId);
        if (goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                collectCompositionGoalAndDescendants(childRef, allGoals, visibleGoalIds, visiting);
            }
        }
        visiting.remove(goalId);
    }

    private void addCompositionAncestors(Map<String, LearningGoal> allGoals, Set<String> visibleGoalIds) {
        boolean changed;
        do {
            changed = false;
            for (LearningGoal goal : allGoals.values()) {
                if (goal == null || visibleGoalIds.contains(goal.getId()) || goal.getContains() == null) {
                    continue;
                }
                for (String childRef : goal.getContains()) {
                    String childId = resolveGoalRef(childRef, allGoals);
                    if (childId != null && visibleGoalIds.contains(childId)) {
                        visibleGoalIds.add(goal.getId());
                        changed = true;
                        break;
                    }
                }
            }
        } while (changed);
    }

    private boolean matchesAllEffectiveFilters(LearningGoal goal, LearningLandscape landscape, List<String> effectiveFilterIds,
            boolean ignoreCourseFilters,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState, Map<String, Boolean> canonicalStateCoverageCache) {
        if (effectiveFilterIds == null || effectiveFilterIds.isEmpty()) {
            return true;
        }
        for (String filterId : effectiveFilterIds) {
            if (!matchesFilter(goal, landscape, filterId, ignoreCourseFilters, mappedCanonicalGoalIdsByState,
                    canonicalStateCoverageCache)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchesFilter(LearningGoal goal, LearningLandscape landscape, String filterId,
            boolean ignoreCourseFilters,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState, Map<String, Boolean> canonicalStateCoverageCache) {
        String normalizedFilterId = normalizeFilterId(filterId);
        if (normalizedFilterId == null || normalizedFilterId.isBlank()) {
            return true;
        }
        if ("ALL".equals(normalizedFilterId)) {
            return true;
        }
        if (COURSE_FILTER_IDS.contains(normalizedFilterId)) {
            if (ignoreCourseFilters) {
                return true;
            }
            return matchesCourseFilter(goal, normalizedFilterId);
        }
        if (isStateFilterId(normalizedFilterId)) {
            return matchesStateFilter(goal, landscape, normalizedFilterId, mappedCanonicalGoalIdsByState,
                    canonicalStateCoverageCache);
        }
        if (DURATION_MODEL_FILTER_IDS.contains(normalizedFilterId)) {
            return matchesDurationModelFilter(goal, normalizedFilterId);
        }
        return matchesTagFilter(goal, normalizedFilterId);
    }

    private boolean isStateFilterId(String filterId) {
        return BundeslandCodeNormalizer.isStateFilterId(filterId);
    }

    private void collectVisibleAtomicGoalIds(
            String goalId,
            Map<String, LearningGoal> filteredGoals,
            Set<String> atomicIds,
            Set<String> visiting) {
        if (goalId == null || goalId.isBlank() || !visiting.add(goalId)) {
            return;
        }
        LearningGoal goal = filteredGoals.get(goalId);
        if (goal == null) {
            goal = landscapeService.getGoalDefinition(goalId);
        }
        if (goal == null) {
            visiting.remove(goalId);
            return;
        }
        List<String> contains = goal.getContains();
        if (contains == null || contains.isEmpty()) {
            if (filteredGoals.containsKey(goal.getId())) {
                atomicIds.add(goal.getId());
            }
            visiting.remove(goalId);
            return;
        }
        for (String childRef : contains) {
            String childId = resolveGoalRef(childRef, filteredGoals);
            if (childId == null) {
                LearningGoal child = landscapeService.getGoalDefinition(childRef);
                if (child == null && childRef.contains(":")) {
                    child = landscapeService.getGoalDefinition(childRef.substring(childRef.indexOf(':') + 1));
                }
                childId = child != null ? child.getId() : null;
            }
            if (childId != null) {
                collectVisibleAtomicGoalIds(childId, filteredGoals, atomicIds, visiting);
            }
        }
        visiting.remove(goalId);
    }

    private boolean matchesCourseFilter(LearningGoal goal, String filterId) {
        List<String> tags = goal.getTags();
        if (tags == null || tags.isEmpty()) {
            return true;
        }
        if (tags.contains(filterId)) {
            return true;
        }
        String releaseCourseLevel = goal.getRelease() != null ? normalizeFilterId(goal.getRelease().getCourseLevel()) : null;
        if (filterId.equals(releaseCourseLevel)) {
            return true;
        }
        boolean hasExplicitCourseRestriction = tags.contains("GK") || tags.contains("LK")
                || (releaseCourseLevel != null && !releaseCourseLevel.isBlank());
        return !hasExplicitCourseRestriction;
    }

    private boolean matchesStateFilter(LearningGoal goal, LearningLandscape landscape, String filterId,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState, Map<String, Boolean> canonicalStateCoverageCache) {
        if (isCanonicalGymnasiumLandscape(landscape)) {
            Boolean explicitApplicabilityMatch = matchesApplicabilityDimension(goal, APPLICABILITY_DIMENSION_JURISDICTION,
                    filterId);
            if (explicitApplicabilityMatch != null) {
                if (explicitApplicabilityMatch.booleanValue()) {
                    return true;
                }
            }
            return hasCanonicalStateCoverage(goal.getId(), filterId, mappedCanonicalGoalIdsByState,
                    canonicalStateCoverageCache, new HashSet<>());
        }
        String landscapeState = normalizeBundeslandCode(landscape);
        if (landscapeState != null) {
            return landscapeState.equals(filterId);
        }
        return matchesTagFilter(goal, filterId);
    }

    private Boolean matchesApplicabilityDimension(LearningGoal goal, String dimension, String filterId) {
        if (goal == null || dimension == null || dimension.isBlank() || filterId == null || filterId.isBlank()) {
            return null;
        }
        Map<String, List<String>> applicability = goal.getApplicability();
        if (applicability == null || applicability.isEmpty() || !applicability.containsKey(dimension)) {
            return null;
        }
        List<String> configuredValues = applicability.get(dimension);
        if (configuredValues == null || configuredValues.isEmpty()) {
            return false;
        }
        String normalizedFilterId = normalizeFilterId(filterId);
        for (String configuredValue : configuredValues) {
            if (normalizedFilterId.equals(normalizeFilterId(configuredValue))) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesDurationModelFilter(LearningGoal goal, String filterId) {
        Boolean explicitApplicabilityMatch = matchesApplicabilityDimension(goal, APPLICABILITY_DIMENSION_DURATION_MODEL,
                filterId);
        if (explicitApplicabilityMatch != null) {
            return explicitApplicabilityMatch.booleanValue();
        }

        List<String> tags = goal.getTags();
        if (tags == null || tags.isEmpty()) {
            return true;
        }

        String normalizedFilterId = normalizeFilterId(filterId);
        boolean hasExplicitDurationRestriction = false;
        for (String tag : tags) {
            String normalizedTag = normalizeDurationModelTag(tag);
            if (normalizedTag == null) {
                continue;
            }
            hasExplicitDurationRestriction = true;
            if (normalizedTag.equals(normalizedFilterId)) {
                return true;
            }
        }
        return !hasExplicitDurationRestriction;
    }

    private boolean hasCanonicalStateCoverage(String goalId, String stateFilterId,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState,
            Map<String, Boolean> canonicalStateCoverageCache,
            Set<String> visitedGoalIds) {
        if (goalId == null || goalId.isBlank()) {
            return false;
        }
        if (!visitedGoalIds.add(goalId)) {
            return false;
        }

        try {
            String cacheKey = stateFilterId + "::" + goalId;
            Boolean cached = canonicalStateCoverageCache.get(cacheKey);
            if (cached != null) {
                return cached;
            }

            LearningGoal goal = landscapeService.getGoalDefinition(goalId);
            if (goal == null) {
                canonicalStateCoverageCache.put(cacheKey, false);
                return false;
            }

            boolean covered = hasStateProvenance(goal, stateFilterId)
                    || getMappedCanonicalGoalIdsForState(stateFilterId, mappedCanonicalGoalIdsByState).contains(goalId);

            if (!covered && goal.getContains() != null) {
                for (String childId : goal.getContains()) {
                    if (hasCanonicalStateCoverage(childId, stateFilterId, mappedCanonicalGoalIdsByState,
                            canonicalStateCoverageCache, visitedGoalIds)) {
                        covered = true;
                        break;
                    }
                }
            }

            canonicalStateCoverageCache.put(cacheKey, covered);
            return covered;
        } finally {
            visitedGoalIds.remove(goalId);
        }
    }

    private boolean hasStateProvenance(LearningGoal goal, String stateFilterId) {
        Map<String, Object> provenance = landscapeService.resolveGoalProvenance(goal);
        if (provenance.isEmpty()) {
            return false;
        }

        List<String> referencedLandscapeIds = new ArrayList<>();
        collectLandscapeIdsFromProvenanceValue(provenance.get("sourceLandscapeId"), referencedLandscapeIds);
        collectLandscapeIdsFromProvenanceValue(provenance.get("additionalSourceLandscapeIds"), referencedLandscapeIds);
        collectLandscapeIdsFromProvenanceValue(provenance.get("crossSubjectPrerequisiteLandscapeIds"),
                referencedLandscapeIds);

        for (String landscapeId : referencedLandscapeIds) {
            if (stateFilterId.equals(landscapeService.resolveSourceLandscapeJurisdiction(landscapeId))) {
                return true;
            }
        }
        return false;
    }

    private void collectLandscapeIdsFromProvenanceValue(Object value, List<String> target) {
        if (value instanceof String text) {
            if (!text.isBlank()) {
                target.add(text);
            }
            return;
        }
        if (value instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof String text && !text.isBlank()) {
                    target.add(text);
                }
            }
        }
    }

    private Set<String> getMappedCanonicalGoalIdsForState(String stateFilterId,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState) {
        return mappedCanonicalGoalIdsByState.computeIfAbsent(stateFilterId, key -> goalMappingService.getAllMappings().stream()
                .filter(mapping -> key.equals(landscapeService.resolveSourceLandscapeJurisdiction(mapping.sourceLandscapeId())))
                .map(ResolvedGoalMapping::canonicalGoalId)
                .collect(Collectors.toSet()));
    }

    private boolean isCanonicalGymnasiumLandscape(LearningLandscape landscape) {
        if (landscape == null) {
            return false;
        }
        String frameworkId = landscape.getFrameworkId();
        return frameworkId != null && frameworkId.startsWith("canonical-gymnasium");
    }

    private boolean matchesTagFilter(LearningGoal goal, String filterId) {
        List<String> tags = goal.getTags();
        return tags == null || tags.isEmpty() || tags.contains(filterId);
    }

    private String normalizeDurationModelTag(String value) {
        String normalized = normalizeFilterId(value);
        if (DURATION_MODEL_FILTER_IDS.contains(normalized)) {
            return normalized;
        }
        if ("DURATIONMODEL:G8".equals(normalized) || "DURATION-MODEL:G8".equals(normalized)) {
            return "G8";
        }
        if ("DURATIONMODEL:G9".equals(normalized) || "DURATION-MODEL:G9".equals(normalized)) {
            return "G9";
        }
        return null;
    }

    private String normalizeBundeslandCode(LearningLandscape landscape) {
        if (landscape == null) {
            return null;
        }
        return normalizeBundeslandCode(landscape.getRegion());
    }

    private String normalizeBundeslandCode(String region) {
        return BundeslandCodeNormalizer.normalize(region);
    }

    private String normalizeFilterId(String filterId) {
        if (filterId == null || filterId.isBlank()) {
            return null;
        }
        String normalized = filterId.trim().toUpperCase(Locale.ROOT);
        String normalizedBundesland = BundeslandCodeNormalizer.normalize(normalized);
        if (normalizedBundesland != null) {
            return normalizedBundesland;
        }
        if ("DURATIONMODEL:G8".equals(normalized) || "DURATION-MODEL:G8".equals(normalized)) {
            return "G8";
        }
        if ("DURATIONMODEL:G9".equals(normalized) || "DURATION-MODEL:G9".equals(normalized)) {
            return "G9";
        }
        return normalized;
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

    private LearningGoal cloneScopedGoal(LearningGoal goal, Map<String, LearningGoal> visibleGoals) {
        LearningGoal clonedGoal = objectMapper.convertValue(goal, LearningGoal.class);
        clonedGoal.setContains(filterVisibleGoalRefs(goal.getContains(), visibleGoals));
        clonedGoal.setRequires(filterVisibleGoalRefs(goal.getRequires(), visibleGoals));
        return clonedGoal;
    }

    private List<String> filterVisibleGoalRefs(List<String> refs, Map<String, LearningGoal> visibleGoals) {
        if (refs == null || refs.isEmpty() || visibleGoals == null || visibleGoals.isEmpty()) {
            return refs == null ? null : Collections.emptyList();
        }
        List<String> filtered = new ArrayList<>();
        for (String ref : refs) {
            if (resolveGoalRef(ref, visibleGoals) != null) {
                filtered.add(ref);
            }
        }
        return filtered;
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
        return buildSignedLearnerExport(learner, mastery, planned);
    }

    @Transactional(readOnly = true)
    public CompatibilityArchiveResponse exportCompatibilityArchive(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        if (!isReadOnlyCompatibilitySession(learner)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Compatibility archive export is only available for retired compatibility sessions.");
        }

        com.skillpilot.backend.landscape.LandscapeSummary frozenCurriculumSummary = landscapeService
                .getCompatibilityArchiveSummary(learner.getSelectedCurriculum());
        if (frozenCurriculumSummary == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Frozen compatibility archive metadata is missing for retired curriculum "
                            + learner.getSelectedCurriculum());
        }

        List<String> plannedGoals = getStoredPlannedGoals(skillpilotId);
        Map<String, MasteryEntryDTO> mastery = getStoredMasteryWithTimestamps(skillpilotId);
        CompatibilityArchiveStateSnapshot stateSnapshot = new CompatibilityArchiveStateSnapshot(
                learner.getSkillpilotId(),
                learner.getSelectedCurriculum(),
                learner.getPersonalCurriculum(),
                learner.getActiveGoalId(),
                learner.getLearningState() != null ? learner.getLearningState().name() : null,
                learner.getLearningStrategy(),
                learner.getAutoPilot(),
                learner.getStrictMode(),
                learner.getCreatedAt(),
                plannedGoals,
                mastery,
                learner.getCopySources(),
                parseClientStateSnapshot(learner.getClientState(), learner.getClientStateUpdatedAt()));
        SignedLearnerDataDTO recoveryExport = buildSignedLearnerExport(learner, mastery, plannedGoals);
        List<com.skillpilot.backend.api.MasteryHistoryEntry> history = getStoredMasteryHistory(skillpilotId);
        Map<String, ClientStateSnapshot> serverClientStates = learnerClientStateRepository
                .findByLearner_SkillpilotId(skillpilotId)
                .stream()
                .collect(Collectors.toMap(
                        entry -> entry.getId().getNodeId(),
                        entry -> parseClientStateSnapshot(entry.getClientState(), entry.getClientStateUpdatedAt()),
                        (left, right) -> right,
                        LinkedHashMap::new));

        return new CompatibilityArchiveResponse(
                "compatibility_retirement_archive",
                Instant.now(),
                frozenCurriculumSummary,
                stateSnapshot,
                recoveryExport,
                history,
                serverClientStates);
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

    private ClientStateSnapshot parseClientStateSnapshot(String json, Instant updatedAt) {
        Map<String, Object> state = Collections.emptyMap();
        if (json != null && !json.isBlank()) {
            try {
                state = objectMapper.readValue(
                        json,
                        new TypeReference<Map<String, Object>>() {
                        });
            } catch (Exception e) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                        "Stored client state is invalid");
            }
        }
        return new ClientStateSnapshot(updatedAt, state);
    }

    private SignedLearnerDataDTO buildSignedLearnerExport(
            Learner learner,
            Map<String, MasteryEntryDTO> mastery,
            List<String> plannedGoals) {
        LearnerDataDTO data = new LearnerDataDTO(learner, mastery, plannedGoals, learner.getCopySources());
        String signature = calculateSignature(data);
        return new SignedLearnerDataDTO(data, signature);
    }

    private Map<String, MasteryEntryDTO> getStoredMasteryWithTimestamps(String skillpilotId) {
        return masteryRepository.findByLearner_SkillpilotId(skillpilotId)
                .stream()
                .sorted(Comparator.comparing(Mastery::getGoalKey, Comparator.nullsLast(String::compareTo)))
                .collect(Collectors.toMap(
                        Mastery::getGoalKey,
                        mastery -> new MasteryEntryDTO(mastery.getValue(), mastery.getUpdatedAt()),
                        (left, right) -> right,
                        LinkedHashMap::new));
    }

    private List<com.skillpilot.backend.api.MasteryHistoryEntry> getStoredMasteryHistory(String skillpilotId) {
        return masteryRepository.findByLearner_SkillpilotId(skillpilotId)
                .stream()
                .filter(mastery -> mastery.getValue() >= 0.9)
                .sorted(Comparator
                        .comparing(Mastery::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Mastery::getGoalKey, Comparator.nullsLast(String::compareTo)))
                .map(mastery -> new com.skillpilot.backend.api.MasteryHistoryEntry(
                        mastery.getGoalKey(),
                        mastery.getUpdatedAt(),
                        mastery.getValue()))
                .toList();
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

    private boolean isGoalOutOfPlannedScope(
            String goalId,
            List<String> plannedIds,
            Map<String, LearningGoal> structuralGoals,
            Set<String> precomputedScope) {
        if (goalId == null || goalId.isBlank()) {
            return false;
        }
        if (plannedIds == null || plannedIds.isEmpty()) {
            return true;
        }
        if (structuralGoals == null || structuralGoals.isEmpty()) {
            return true;
        }
        Set<String> scope = precomputedScope != null
                ? precomputedScope
                : computeScope(plannedIds, structuralGoals, Collections.emptyMap());
        return !scope.contains(goalId);
    }

    private void clearPersistedActiveGoal(Learner learner, String skillpilotId, String changeType) {
        learner.setActiveGoalId(null);
        learner.setLearningState(LearningState.FRONTIER);
        learnerRepository.save(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, changeType));
    }

}
