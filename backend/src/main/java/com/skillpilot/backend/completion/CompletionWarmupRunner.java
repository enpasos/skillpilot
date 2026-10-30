package com.skillpilot.backend.completion;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/** Warms configured static bases before readiness, independently of learner transactions. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public final class CompletionWarmupRunner implements ApplicationRunner {
    public static final String DEFAULT_PILOT_CURRICULUM_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    public static final String DEFAULT_PILOT_CURRICULUM_IDS = DEFAULT_PILOT_CURRICULUM_ID
            + ",68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final Logger LOG = LoggerFactory.getLogger(CompletionWarmupRunner.class);
    private final CompletionApplicationService application;
    private final CompletionCanonicalGraphResolver resolver;
    private final List<String> curriculumIds;
    private String warmedGeneration;

    public CompletionWarmupRunner(CompletionApplicationService application, CompletionCanonicalGraphResolver resolver,
            @Value("${skillpilot.completion.warmup-curriculum-ids:" + DEFAULT_PILOT_CURRICULUM_IDS + "}") String ids) {
        this.application = application;
        this.resolver = resolver;
        Set<String> unique = new LinkedHashSet<>();
        Arrays.stream(ids.split(",")).map(String::trim).filter(id -> !id.isEmpty()).forEach(unique::add);
        this.curriculumIds = List.copyOf(unique);
    }

    @Override
    public synchronized void run(ApplicationArguments arguments) {
        CompletionProfileCatalog catalog = application.catalog();
        if (!catalog.enabled() || catalog.profiles().isEmpty()) return;
        if (!catalog.available()) throw new IllegalStateException("Completion warmup cannot use an unavailable curriculum generation");
        if (catalog.profiles().size() > 1) {
            throw new IllegalStateException("Completion pilot supports at most one enabled profile; configured "
                    + catalog.profiles().keySet());
        }
        String generation = catalog.generation();
        if (generation.equals(warmedGeneration)) return;
        if (curriculumIds.isEmpty()) {
            throw new IllegalStateException("Enabled completion profiles require explicit warmup-curriculum-ids");
        }
        long started = System.nanoTime();
        Set<String> warmedProfiles = new LinkedHashSet<>();
        Map<String, Set<String>> expectedContexts = new LinkedHashMap<>();
        int contexts = 0;
        for (String baseId : curriculumIds) {
            Map<String, LearningGoal> graph;
            try {
                graph = application.canonicalGraph(baseId, () -> resolver.load(baseId));
                if (graph.isEmpty()) throw new IllegalArgumentException("Canonical definition closure is empty");
            } catch (RuntimeException error) {
                throw new IllegalStateException("Completion warmup failed to load curriculum " + baseId
                        + " in generation " + generation, error);
            }
            boolean matched = false;
            for (var profile : catalog.profiles().values()) {
                var scope = catalog.scope(profile.levelScopeRef());
                if (scope == null) throw new IllegalStateException("Completion warmup profile " + profile.id()
                        + " has an unresolved scope in generation " + generation);
                // Configured bases may expose the same reviewed pilot through different
                // canonical closures. Each base must resolve its complete target scope.
                if (!scope.targetRootIds().stream().allMatch(graph::containsKey)) continue;
                matched = true;
                CompiledCompletionProfile compiled;
                try {
                    // This is a static superset, never a learner's Personal Curriculum.
                    // compile() checks actual Level-2 applicability again on cache hits.
                    compiled = application.compile(profile.id(), baseId, graph, graph.keySet());
                } catch (RuntimeException error) {
                    throw new IllegalStateException("Completion warmup failed for profile " + profile.id()
                            + ", curriculum " + baseId + ", generation " + generation, error);
                }
                if (compiled.assessmentGoalIds().size() > 1) {
                    throw new IllegalStateException("Completion pilot supports at most one required assessment per profile; found "
                            + compiled.assessmentGoalIds().size() + " for profile " + profile.id()
                            + ", curriculum " + baseId + ", generation " + generation);
                }
                warmedProfiles.add(profile.id());
                expectedContexts.computeIfAbsent(baseId, ignored -> new LinkedHashSet<>()).add(profile.id());
                contexts++;
            }
            if (!matched) throw new IllegalStateException("Completion warmup curriculum " + baseId
                    + " contains no complete scope for enabled profiles " + catalog.profiles().keySet()
                    + " in generation " + generation);
        }
        Set<String> missing = new LinkedHashSet<>(catalog.profiles().keySet());
        missing.removeAll(warmedProfiles);
        if (!missing.isEmpty()) throw new IllegalStateException("Completion warmup has no configured curriculum for profiles "
                + missing + " in generation " + generation);
        try {
            application.sealPreparedContexts(expectedContexts);
        } catch (RuntimeException error) {
            throw new IllegalStateException("Completion warmup cache cannot retain the configured static contexts in generation "
                    + generation, error);
        }
        if (!catalog.available() || !generation.equals(catalog.generation())) {
            throw new IllegalStateException("Completion curriculum generation changed during warmup");
        }
        warmedGeneration = generation;
        LOG.info("Warmed {} completion contexts across {} curriculum bases for generation {} in {} ms",
                contexts, curriculumIds.size(), generation, TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started));
    }
}
