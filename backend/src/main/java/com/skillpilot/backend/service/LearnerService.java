package com.skillpilot.backend.service;

import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.domain.PlannedGoal;
import java.time.Instant;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.CreateLearnerRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.LearnerDataDTO;
import com.skillpilot.backend.api.SignedLearnerDataDTO;
import org.springframework.beans.factory.annotation.Value;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class LearnerService {

    private final LearnerRepository learnerRepository;
    private final MasteryRepository masteryRepository;
    private final PlannedGoalRepository plannedGoalRepository;
    private final LandscapeService landscapeService;
    private final ObjectMapper objectMapper;

    @Value("${skillpilot.security.signing-secret}")
    private String signingSecret;

    public LearnerService(
            LearnerRepository learnerRepository,
            MasteryRepository masteryRepository,
            PlannedGoalRepository plannedGoalRepository,
            LandscapeService landscapeService,
            ObjectMapper objectMapper) {
        this.learnerRepository = learnerRepository;
        this.masteryRepository = masteryRepository;
        this.plannedGoalRepository = plannedGoalRepository;
        this.landscapeService = landscapeService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Learner createLearner(CreateLearnerRequest request) {
        Learner learner = new Learner();
        learner.setSkillpilotId(UUID.randomUUID().toString());

        // Explicitly ignore topic in request for clean initialization
        // if (request != null && request.topic() != null && !request.topic().isBlank())
        // {
        // LearningLandscape match =
        // landscapeService.findCurriculumByTopic(request.topic());
        // if (match != null) {
        // learner.setSelectedCurriculum(match.getLandscapeId());
        // }
        // }

        return learnerRepository.save(learner);
    }

    @Transactional
    public Learner createLearner() {
        return createLearner(null);
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getMastery(String skillpilotId) {
        ensureLearnerExists(skillpilotId);
        List<Mastery> mastered = masteryRepository.findByLearner_SkillpilotId(skillpilotId);
        Map<String, Double> result = new HashMap<>();
        for (Mastery m : mastered) {
            result.put(m.getGoalKey(), m.getValue());
        }
        return result;
    }

    @Transactional
    public MasteryUpdateResponse setMastery(String skillpilotId, MasteryUpdateRequest request) {
        Learner learner = learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));

        for (Map.Entry<String, Double> entry : request.mastery().entrySet()) {
            String goalKey = entry.getKey();

            // Prevent mastery on Cluster Goals (goals that contain other goals)
            com.skillpilot.backend.landscape.LearningGoal def = landscapeService.getGoalDefinition(goalKey);
            if (def != null && def.getContains() != null && !def.getContains().isEmpty()) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Cannot master cluster goal '" + (def.getTitle() != null ? def.getTitle() : goalKey)
                                + "'. Please master atomic sub-goals instead.");
            }

            double value = entry.getValue();
            MasteryId id = new MasteryId(skillpilotId, goalKey);
            Mastery mastery = masteryRepository.findById(id).orElseGet(() -> new Mastery(learner, goalKey, value));
            mastery.setValue(value);
            masteryRepository.save(mastery);
        }

        // Return the new frontier immediately
        List<FrontierGoal> newFrontier = getRichFrontier(skillpilotId);
        return new MasteryUpdateResponse(newFrontier);
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

        return getPlannedGoals(skillpilotId);
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
        learner.setSelectedCurriculum(curriculumId);
        learnerRepository.save(learner);
    }

    @Transactional
    public void setPersonalCurriculum(String skillpilotId, Map<String, Object> config, List<String> goalIds) {
        Learner learner = getLearner(skillpilotId);

        Map<String, Object> finalConfig = config != null ? new HashMap<>(config) : new HashMap<>();

        if (goalIds != null && !goalIds.isEmpty()) {
            for (String gid : goalIds) {
                // Check if it is a landscape ID directly
                if (landscapeService.getById(gid) != null) {
                    Map<String, Object> settings = new HashMap<>();
                    settings.put("selected", true);
                    finalConfig.put(gid, settings);
                    continue;
                }

                // Check which landscape contains this goal
                String landscapeId = landscapeService.getLandscapeIdForGoal(gid);
                if (landscapeId != null) {
                    Map<String, Object> settings = new HashMap<>();
                    settings.put("selected", true);
                    finalConfig.put(landscapeId, settings);
                } else {
                    // Fallback: Treat 'gid' as a filter/tag for the current curriculum
                    // e.g. "LK", "GK"
                    String current = learner.getSelectedCurriculum();
                    if (current != null) {
                        Map<String, Object> settings = (Map<String, Object>) finalConfig.getOrDefault(current,
                                new HashMap<>());
                        settings.put("selected", true);
                        settings.put("filterId", gid); // Treat the unknown ID as a filter tag
                        finalConfig.put(current, settings);
                    }
                }
            }
        }

        try {
            String json = objectMapper.writeValueAsString(finalConfig);
            learner.setPersonalCurriculum(json);
            learnerRepository.save(learner);
        } catch (Exception e) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid personalization config");
        }
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

        List<String> frontier = new ArrayList<>();
        for (LearningGoal goal : allGoals.values()) {
            Double currentMastery = masteryMap.getOrDefault(goal.getId(), 0.0);
            if (currentMastery >= 0.9) {
                continue; // Already mastered
            }

            boolean prerequisitesMet = true;
            List<String> requires = effectiveRequires.getOrDefault(goal.getId(), goal.getRequires());
            if (requires != null) {
                for (String reqId : requires) {
                    Double reqMastery = masteryMap.getOrDefault(reqId, 0.0);
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

        Map<String, LearningGoal> allGoals = getFilteredGoals(curriculumId, learner.getPersonalCurriculum());
        Map<String, Double> masteryMap = getMastery(skillpilotId);
        Map<String, List<String>> effectiveRequires = computeEffectiveRequires(allGoals);

        // Calculate Scope (Plan + Descendants + Prerequisites)
        List<String> plannedIds = getPlannedGoals(skillpilotId);

        // If no scope is set (plannedGoals empty), return the Top Level Modules
        // (Subjects)
        if (plannedIds.isEmpty()) {
            return getTopLevelModules(learner.getSelectedCurriculum(), allGoals);
        }

        // Calculate scope based on planned goals
        Set<String> scope = new HashSet<>();
        // 1. Start with Plan
        scope.addAll(plannedIds);

        // 2. Add Descendants (e.g. Math -> Analysis)
        Set<String> descendants = new HashSet<>();
        for (String pid : plannedIds) {
            collectDescendants(pid, allGoals, descendants);
        }
        scope.addAll(descendants);

        // 3. Add Prerequisites (e.g. Analysis -> Algebra)
        Set<String> prerequisites = new HashSet<>();
        for (String sid : scope) {
            List<String> reqs = effectiveRequires.get(sid);
            if (reqs != null) {
                prerequisites.addAll(reqs);
            }
        }
        scope.addAll(prerequisites);

        List<FrontierGoal> frontier = new ArrayList<>();

        for (LearningGoal goal : allGoals.values()) {
            // Filter by Scope if Plan exists
            if (!plannedIds.isEmpty() && !scope.contains(goal.getId())) {
                continue;
            }
            Double currentMastery = masteryMap.getOrDefault(goal.getId(), 0.0);
            if (currentMastery >= 0.9) {
                continue;
            }

            boolean prerequisitesMet = true;
            List<String> requires = effectiveRequires.getOrDefault(goal.getId(), goal.getRequires());
            if (requires != null) {
                for (String reqId : requires) {
                    Double reqMastery = masteryMap.getOrDefault(reqId, 0.0);
                    if (reqMastery < 0.9) {
                        prerequisitesMet = false;
                        break;
                    }
                }
            }

            if (prerequisitesMet) {
                String type = (goal.getContains() != null && !goal.getContains().isEmpty()) ? "cluster" : "atomic";
                frontier.add(new FrontierGoal(
                        goal.getId(),
                        goal.getTitle(),
                        goal.getDescription(),
                        type,
                        "Prerequisites met",
                        goal.getTags()));
            }
        }

        // Compaction Logic: If frontier is too large, prefer clusters
        if (frontier.size() > 20) {
            List<FrontierGoal> clusters = frontier.stream()
                    .filter(g -> "cluster".equals(g.type()))
                    .toList();

            if (!clusters.isEmpty()) {
                return clusters;
            }
            // If no clusters but still huge, maybe limit to top 20?
            // For now, let's just return the top 20 to avoid token overflow.
            return frontier.subList(0, Math.min(frontier.size(), 20));
        }

        return frontier;
    }

    @Transactional(readOnly = true)
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
                                full.getFilters()));
            }
        }

        List<FrontierGoal> frontier = getRichFrontier(skillpilotId);

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
                String type = (g.getContains() != null && !g.getContains().isEmpty()) ? "cluster" : "atomic";
                plannedRich.add(new FrontierGoal(
                        g.getId(),
                        g.getTitle(),
                        g.getDescription(),
                        type,
                        "Planned",
                        g.getTags()));
            } else {
                // True unknown (deleted or invalid ID)
                plannedRich.add(new FrontierGoal(pid, "Unknown Goal", "", "unknown", "Planned", null));
            }
        }

        Map<String, Double> mastery = getMastery(skillpilotId);
        long masteredCount = mastery.values().stream().filter(v -> v >= 0.9).count();
        long totalCount = 0;
        if (curriculumId != null) {
            totalCount = allGoals.size();
        }

        List<String> nextAllowedActions = new ArrayList<>();
        if (curriculumId == null) {
            nextAllowedActions.add("setCurriculum");
        }
        List<String> activeFilters = new ArrayList<>();
        if (curriculumId != null) {
            nextAllowedActions.add("setPersonalization");
            nextAllowedActions.add("setScope");
            nextAllowedActions.add("getFrontier");
            nextAllowedActions.add("setMastery");

            // Extract active filters for the current curriculum
            try {
                String json = learner.getPersonalCurriculum();
                if (json != null && !json.isBlank()) {
                    Map<String, Map<String, Object>> config = objectMapper.readValue(json,
                            new com.fasterxml.jackson.core.type.TypeReference<>() {
                            });
                    Map<String, Object> landscapeConfig = config.get(curriculumId);
                    if (landscapeConfig != null) {
                        Object filterObj = landscapeConfig.get("filterId");
                        if (filterObj instanceof String) {
                            activeFilters.add((String) filterObj);
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }

        return new UnifiedLearnerStateResponse(learner.getSkillpilotId(), curriculumSummary, frontier,
                new LearnerGoals(plannedRich, masteredCount, totalCount), nextAllowedActions, activeFilters,
                learner.getCopySources());
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

        Set<String> newPlanned = new java.util.HashSet<>(getPlannedGoals(skillpilotId));
        newPlanned.addAll(goalIds);
        setPlannedGoals(skillpilotId, newPlanned);
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
                        if (g.getTags() != null && g.getTags().contains(filterId)) {
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

    private void collectDescendants(String goalId, Map<String, LearningGoal> allGoals, Set<String> result) {
        LearningGoal goal = allGoals.get(goalId);
        if (goal == null || goal.getContains() == null) {
            return;
        }
        for (String childRef : goal.getContains()) {
            String childId = childRef;
            if (result.add(childId)) { // Avoid cycles
                collectDescendants(childId, allGoals, result);
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
                        String type = (child.getContains() != null && !child.getContains().isEmpty()) ? "cluster"
                                : "atomic";
                        roots.add(new FrontierGoal(
                                child.getId(),
                                child.getTitle(),
                                child.getDescription(),
                                type,
                                "Module",
                                child.getTags()));
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
        Map<String, Double> mastery = getMastery(skillpilotId);
        List<String> planned = getPlannedGoals(skillpilotId);
        LearnerDataDTO data = new LearnerDataDTO(learner, mastery, planned, learner.getCopySources());

        String signature = calculateSignature(data);
        return new SignedLearnerDataDTO(data, signature);
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
            learnerRepository.save(existing);
        }

        // Restore Mastery
        if (data.mastery() != null) {
            for (Map.Entry<String, Double> entry : data.mastery().entrySet()) {
                MasteryId mid = new MasteryId(skillpilotId, entry.getKey());
                Mastery m = masteryRepository.findById(mid)
                        .orElse(new Mastery(existing, entry.getKey(), entry.getValue()));
                m.setValue(entry.getValue());
                masteryRepository.save(m);
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

}
