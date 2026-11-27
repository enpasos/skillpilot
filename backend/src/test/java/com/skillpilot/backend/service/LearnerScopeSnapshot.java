package com.skillpilot.backend.service;

import static java.nio.file.StandardOpenOption.CREATE_NEW;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.PersonalCurriculumLearningScope;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Collection;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;

/** Optional before/after measurement of the native projection for each authored view. */
public final class LearnerScopeSnapshot {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final int FORMAT_VERSION = 1;

    public static void main(String[] args) throws Exception {
        if (args.length == 2 && "record".equals(args[0])) {
            var checkout = Path.of("..").toRealPath();
            var requested = Path.of(args[1]).toAbsolutePath().normalize();
            var output = requested.getParent().toRealPath().resolve(requested.getFileName());
            if (output.startsWith(checkout)) {
                throw new IllegalArgumentException("Write the learner scope snapshot outside the checkout: " + output);
            }
            var snapshot = record(checkout.resolve("curricula/DE/Gymnasium"));
            Files.write(output, JSON.writerWithDefaultPrettyPrinter().writeValueAsBytes(snapshot), CREATE_NEW);
        } else if (args.length == 3 && "compare".equals(args[0])) {
            var changes = compare(readSnapshot(Path.of(args[1])), readSnapshot(Path.of(args[2])));
            System.out.println(JSON.writerWithDefaultPrettyPrinter().writeValueAsString(changes));
        } else {
            throw new IllegalArgumentException("Usage: learnerScopeSnapshot record /tmp/output.json"
                    + " | compare /tmp/before.json /tmp/after.json");
        }
    }

    private static Snapshot readSnapshot(Path path) throws Exception {
        var snapshot = JSON.readValue(path.toFile(), Snapshot.class);
        if (snapshot == null || snapshot.formatVersion() != FORMAT_VERSION || snapshot.views() == null ||
                snapshot.views().values().stream().anyMatch(digests -> digests == null ||
                        !isSha256(digests.sortedScopeSha256()) || !isSha256(digests.visibleOrderAndTitlesSha256()))) {
            throw new IllegalArgumentException("Unsupported learner scope snapshot: " + path);
        }
        return snapshot;
    }

    private static boolean isSha256(String digest) {
        return digest != null && digest.matches("[0-9a-f]{64}");
    }

    private static Changes compare(Snapshot before, Snapshot after) {
        var shared = before.views().keySet().stream().filter(after.views()::containsKey).sorted().toList();
        return new Changes(
                before.views().keySet().stream().filter(id -> !after.views().containsKey(id)).sorted().toList(),
                after.views().keySet().stream().filter(id -> !before.views().containsKey(id)).sorted().toList(),
                shared.stream().filter(id -> !before.views().get(id).sortedScopeSha256()
                        .equals(after.views().get(id).sortedScopeSha256())).toList(),
                shared.stream().filter(id -> !before.views().get(id).visibleOrderAndTitlesSha256()
                        .equals(after.views().get(id).visibleOrderAndTitlesSha256())).toList());
    }

    private static Snapshot record(Path gymnasium) throws Exception {
        Map<String, SkillLandscape> catalog = new LinkedHashMap<>();
        try (var files = Files.list(gymnasium.resolve("canonical"))) {
            for (var file : files.filter(path -> path.toString().endsWith(".json")).sorted().toList()) {
                var landscape = JSON.readValue(file.toFile(), SkillLandscape.class);
                if (catalog.put(landscape.getLandscapeId(), landscape) != null) {
                    throw new IllegalArgumentException("Duplicate landscape: " + landscape.getLandscapeId());
                }
            }
        }

        var selectedView = new AtomicReference<Map<String, Object>>();
        var views = mock(CompositionViewService.class);
        when(views.isAuthoritativeForLandscape(anyString())).thenAnswer(call ->
                call.getArgument(0).equals(selectedView.get().get("landscapeId")));
        when(views.findLearnerScopeView(anyString(), anyMap())).thenAnswer(call -> {
            var view = selectedView.get();
            return call.getArgument(0).equals(view.get("landscapeId")) ? view : null;
        });

        var service = serviceForCatalog(catalog, views);
        Map<String, ViewDigests> measurements = new TreeMap<>();
        try (var files = Files.walk(gymnasium.resolve("composition-views"))) {
            for (var file : files.filter(path -> path.toString().endsWith(".view.json")).sorted().toList()) {
                var view = JSON.readValue(file.toFile(), new TypeReference<Map<String, Object>>() {});
                String id = view.get("viewId") instanceof String value ? value : "";
                String subject = view.get("landscapeId") instanceof String value ? value : "";
                if (id.isBlank() || !catalog.containsKey(subject)) {
                    throw new IllegalArgumentException("Missing view ID or unknown landscape: " + file);
                }
                if (measurements.containsKey(id)) throw new IllegalArgumentException("Duplicate view: " + id);
                // Preserve the individual authored document, even when the usual matcher merges its scope.
                selectedView.set(view);
                measurements.put(id, measure(service, subject));
            }
        }
        return new Snapshot(FORMAT_VERSION, measurements);
    }

    private static ViewDigests measure(LearnerService service, String subject) throws Exception {
        String selection = JSON.writeValueAsString(Map.of(subject,
                Map.of("selected", true, "filterId", "LK", "stage", "CrossStage")));
        var publicAtoms = service.getFilteredAtomicGoalIds(subject, selection, null, false);
        Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", subject, selection);
        Map<String, LearningGoal> visible = ReflectionTestUtils.invokeMethod(projection, "visibleGoals");
        var orderedGoals = visible.values().stream()
                .map(goal -> new VisibleGoal(goal.getId(), goal.getTitle())).toList();

        Map<String, Object> scope = new TreeMap<>();
        scope.put("publicAtomicGoalIds", sorted(publicAtoms));
        for (var field : List.of("targetGoalIds", "prerequisiteOnlyGoalIds", "compositionViewIds", "presentationRootGoalIds")) {
            scope.put(field, sorted(ReflectionTestUtils.invokeMethod(projection, field)));
        }
        scope.put("visibleGoals", sorted(visible.keySet()));
        for (var field : List.of("structuralGoals", "canonicalPrerequisiteGoals")) {
            Map<String, ?> goals = ReflectionTestUtils.invokeMethod(projection, field);
            scope.put(field, sorted(goals.keySet()));
        }
        Boolean applied = ReflectionTestUtils.invokeMethod(projection, "compositionViewApplied");
        scope.put("compositionViewApplied", applied);
        PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(projection, "learningScope");
        scope.put("hasLearningScope", learning != null);
        if (learning != null) {
            scope.put("seedAtomicGoalIds", sorted(learning.seedAtomicGoalIds()));
            scope.put("learningAtomicGoalIds", sorted(learning.learningAtomicGoalIds()));
            scope.put("requiredByPaths", new TreeMap<>(learning.requiredByPaths()));
        }
        return new ViewDigests(digest(scope), digest(orderedGoals));
    }

    private static String digest(Object payload) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(JSON.writeValueAsBytes(payload)));
    }

    private static List<String> sorted(Collection<String> ids) {
        return ids.stream().sorted().toList();
    }

    private static LearnerService serviceForCatalog(Map<String, SkillLandscape> catalog, CompositionViewService views) {
        Map<String, LearningGoal> byGoal = new LinkedHashMap<>();
        Map<String, String> owners = new LinkedHashMap<>();
        catalog.values().forEach(landscape -> landscape.getGoals().forEach(goal -> {
            byGoal.put(goal.getId(), goal);
            owners.put(goal.getId(), landscape.getLandscapeId());
        }));
        var landscapes = mock(LandscapeService.class);
        when(landscapes.getAll()).thenReturn(List.copyOf(catalog.values()));
        when(landscapes.getById(anyString())).thenAnswer(call -> catalog.get(call.getArgument(0)));
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(call -> byGoal.get(call.getArgument(0)));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenAnswer(call -> owners.get(call.getArgument(0)));
        when(landscapes.getClosure(anyString())).thenAnswer(call -> List.of(catalog.get(call.getArgument(0))));
        return new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), landscapes, mock(GoalMappingService.class),
                mock(DeckResourceService.class), views, JSON, mock(ApplicationEventPublisher.class),
                mock(PlatformTransactionManager.class));
    }

    private record Snapshot(int formatVersion, Map<String, ViewDigests> views) {}
    private record ViewDigests(String sortedScopeSha256, String visibleOrderAndTitlesSha256) {}
    private record VisibleGoal(String id, String title) {}
    private record Changes(List<String> missingViews, List<String> addedViews, List<String> sortedScopeChangedViews,
            List<String> visibleOrderOrTitlesChangedViews) {}
}
