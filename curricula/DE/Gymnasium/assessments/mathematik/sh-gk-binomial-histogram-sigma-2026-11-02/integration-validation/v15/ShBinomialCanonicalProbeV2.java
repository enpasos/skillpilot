package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.landscape.ExamTaskReadiness;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.file.Path;
import java.util.*;

/** Canonical contract and RP support probe. No repositories, writes, learner data or SQL. */
public class ShBinomialCanonicalProbeV2 {
    private static final String TASK = "c6536bfb-e658-5bf5-b207-7caeca98632c";
    private static final String ROOT = "c01b1ce9-a667-4a46-b251-ec33ae602b15";
    private static final String SIGMA = "8ad2c9c4-9362-5cb9-8fc1-e3815bfa504d";
    private static final Set<String> COVERED = Set.of("da95ab35-bac2-54f2-b38f-8b612cde8b54",
            "e495fa38-b198-5280-a405-9e41cafd6d17", "7d41b805-0fd8-5ac3-980d-79112a27c1b4",
            "9dfd0e4a-d7ea-5ce2-906e-678f0cf978b0");

    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    private static Map<String, JsonNode> nodes(JsonNode source) {
        Map<String, JsonNode> result = new TreeMap<>();
        source.path("goals").forEach(node -> check(result.put(node.path("id").asText(), node) == null, "duplicate ID"));
        return result;
    }

    private static Map<String, LearningGoal> goals(ObjectMapper mapper, Map<String, JsonNode> nodes) throws Exception {
        Map<String, LearningGoal> result = new TreeMap<>();
        for (var entry : nodes.entrySet()) result.put(entry.getKey(), mapper.treeToValue(entry.getValue(), LearningGoal.class));
        return result;
    }

    private static Set<String> atoms(Map<String, LearningGoal> goals, String id, Set<String> visiting) {
        check(visiting.add(id), "contains cycle " + id);
        var goal = goals.get(id);
        check(goal != null, "unknown contains ref " + id);
        Set<String> result = new TreeSet<>();
        if (goal.getContains().isEmpty()) result.add(id);
        else for (String child : goal.getContains()) result.addAll(atoms(goals, child, new HashSet<>(visiting)));
        return result;
    }

    public static void main(String[] args) throws Exception {
        var mapper = new ObjectMapper();
        var oldRaw = mapper.readTree(Path.of(args[0]).toFile());
        var newRaw = mapper.readTree(Path.of(args[1]).toFile());
        var frozen = mapper.readTree(Path.of(args[2]).toFile());
        var oldNodes = nodes(oldRaw);
        var newNodes = nodes(newRaw);
        var before = goals(mapper, oldNodes);
        var after = goals(mapper, newNodes);
        Set<String> expectedIds = new TreeSet<>(oldNodes.keySet()); expectedIds.add(TASK);
        check(newNodes.keySet().equals(expectedIds) && !oldNodes.containsKey(TASK), "exactly one new stable assessment ID");
        Set<String> changedExisting = new TreeSet<>();
        for (String id : oldNodes.keySet()) if (!oldNodes.get(id).equals(newNodes.get(id))) changedExisting.add(id);
        check(changedExisting.equals(Set.of(ROOT)), "existing task/goal changed outside root");
        ObjectNode rootBefore = oldNodes.get(ROOT).deepCopy(), rootAfter = newNodes.get(ROOT).deepCopy();
        rootBefore.remove(List.of("contains", "weight")); rootAfter.remove(List.of("contains", "weight"));
        check(rootBefore.equals(rootAfter), "root fields outside contains/weight changed");
        List<String> children = new ArrayList<>(before.get(ROOT).getContains()); children.add(TASK);
        check(children.equals(after.get(ROOT).getContains()), "exact root child append");
        Set<String> oldRootAtoms = atoms(before, ROOT, new HashSet<>()), newRootAtoms = atoms(after, ROOT, new HashSet<>());
        Set<String> expectedAtoms = new TreeSet<>(oldRootAtoms); expectedAtoms.add(TASK);
        check(newRootAtoms.equals(expectedAtoms), "unique root atomic union changed unexpectedly");
        check(oldNodes.get(ROOT).path("weight").asInt() == oldRootAtoms.size(), "old root unique atom weight");
        check(newNodes.get(ROOT).path("weight").asInt() == newRootAtoms.size(), "new root unique atom weight");
        check(newRaw.path("goalPlacements").size() == oldRaw.path("goalPlacements").size() + 1, "one Q3 placement");
        for (int i = 0; i < oldRaw.path("goalPlacements").size(); i++)
            check(oldRaw.path("goalPlacements").get(i).equals(newRaw.path("goalPlacements").get(i)), "old program placement changed");
        var placement = newRaw.path("goalPlacements").get(oldRaw.path("goalPlacements").size());
        check(placement.equals(mapper.readTree("{\"goalId\":\"" + TASK + "\",\"unitId\":\"de-gym-math-q3\",\"relation\":\"primary\",\"context\":{\"jurisdiction\":\"DE-SH\",\"schoolForm\":\"Gymnasium\",\"stage\":\"SekII\"}}")), "exact SH Q3 placement");
        var task = after.get(TASK);
        var taskNode = newNodes.get(TASK);
        for (String field : List.of("taskContent", "taskContentEn", "solutionContent", "solutionContentEn", "scoring", "coveredGoalIds"))
            check(taskNode.path("examData").path(field).equals(frozen.path("examData").path(field)), "frozen V2 changed: " + field);
        check(task.getRequires().equals(List.of(SIGMA)), "genuine Sigma preparation changed");
        check(new TreeSet<>(task.getExamData().getCoveredGoalIds()).equals(new TreeSet<>(COVERED)), "four whole-goal coverage contracts");
        check(!task.getExamData().getCoveredGoalIds().contains(SIGMA), "whole Sigma coverage must remain absent");
        check(taskNode.path("resourceLinks").isEmpty(), "automatic answer-bearing goal visualization");
        check(taskNode.path("extendedData").equals(mapper.readTree("{\"applicabilityMappingInheritance\":\"boundary\",\"applicabilityOverrides\":{\"jurisdiction\":[\"DE-SH\"]}}")), "exact own SH applicability boundary");
        check(ExamTaskReadiness.isReady(task.getExamData()), "new assessment readiness");
        var scoring = task.getExamData().getScoring();
        check(scoring.getMaxPoints() == 20 && scoring.getPassingPoints() == 12, "20/12 rubric");
        check(scoring.getSteps().stream().mapToDouble(step -> step.getPoints()).sum() == 20, "points total");
        for (var entry : after.entrySet()) {
            for (String id : entry.getValue().getContains()) check(after.containsKey(id), "unknown contains reference " + id);
            for (String id : entry.getValue().getRequires()) check(after.containsKey(id), "unknown requires reference " + id);
        }
        var compiler = new CompletionProfileCompiler();
        Set<String> targetsBefore = new TreeSet<>(), targetsAfter = new TreeSet<>();
        before.forEach((id, g) -> { if (g.getContains().isEmpty()) targetsBefore.add(id); });
        after.forEach((id, g) -> { if (g.getContains().isEmpty()) targetsAfter.add(id); });
        var graphBefore = compiler.compileAutomatic(before, targetsBefore, targetsBefore, "sh-binomial-canonical-before");
        var graphAfter = compiler.compileAutomatic(after, targetsAfter, targetsAfter, "sh-binomial-canonical-after");
        Set<String> expectedAssessments = new TreeSet<>(graphBefore.assessmentGoalIds()); expectedAssessments.add(TASK);
        check(graphAfter.assessmentGoalIds().equals(expectedAssessments), "exactly one genuine assessment");
        var newTaskGraph = compiler.compileAutomatic(after, Set.of(TASK), Set.of(TASK), "sh-binomial-whole-task");
        check(newTaskGraph.contextGoalIds().containsAll(COVERED) && newTaskGraph.contextGoalIds().contains(SIGMA), "real task preparation context");
        var protectedNewTaskSupport = new TreeSet<String>();
        for (String id : newTaskGraph.contextGoalIds()) if (!id.equals(TASK)
                && (CompletionProfileCompiler.isAssessment(after.get(id)) || CompletionProfileCompiler.isMemory(after.get(id))))
            protectedNewTaskSupport.add(id);
        check(protectedNewTaskSupport.isEmpty(), "new task must not introduce hidden memory or assessment preparation");
        var diagnosticBefore = compiler.compileAutomatic(before, oldRootAtoms, oldRootAtoms, "canonical-diagnostic-before");
        var diagnosticAfter = compiler.compileAutomatic(after, newRootAtoms, newRootAtoms, "canonical-diagnostic-after");
        var expectedDiagnosticProtected = new TreeSet<>(diagnosticBefore.protectedTargetGoalIds()); expectedDiagnosticProtected.add(TASK);
        check(diagnosticAfter.protectedTargetGoalIds().equals(expectedDiagnosticProtected), "canonical diagnostic gains exactly the new protected task");
        check(diagnosticBefore.protectedTargetGoalIds().size() == 172 && diagnosticAfter.protectedTargetGoalIds().size() == 173, "honest172to173 canonical diagnostic obligations");
        var rp = new ArrayList<Map<String, Object>>();
        var union = new TreeSet<String>();
        for (String id : List.of("64f37348-20f7-55b1-82a8-8fc388087577", "926d0551-4537-569e-b6ad-fc33bb17546e")) {
            check(oldNodes.get(id).equals(newNodes.get(id)), "RP whole task changed");
            var previous = compiler.compileAutomatic(before, Set.of(id), Set.of(id), "rp-before");
            var current = compiler.compileAutomatic(after, Set.of(id), Set.of(id), "rp-after");
            check(previous.contextGoalIds().equals(current.contextGoalIds()), "RP complete support context changed");
            check(previous.directPrerequisites(id).equals(current.directPrerequisites(id)), "RP effective direct requirements changed");
            var support = new TreeSet<>(current.contextGoalIds()); support.remove(id); union.addAll(support);
            rp.add(Map.of("taskGoalId", id, "taskRootExcluded", true, "supportCount", support.size(),
                    "supportGoalIds", support, "effectiveDirectPrerequisiteIds", current.directPrerequisites(id)));
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "NATIVE_EXACT_NEW_SH_ASSESSMENT_ROOT_UNION_DAG_READINESS_FROZEN_V2_AND_RP_SUPPORT_PASS_NOT_OFFER_ACCEPTANCE");
        result.put("newGoalId", TASK); result.put("canonicalGoalCountBefore", before.size()); result.put("canonicalGoalCountAfter", after.size());
        result.put("changedExistingGoalIds", changedExisting); result.put("newAssessmentIds", Set.of(TASK));
        result.put("rootUniqueAtomicCountBefore", oldRootAtoms.size()); result.put("rootUniqueAtomicCountAfter", newRootAtoms.size());
        result.put("allReferencesContainsRawRequiresAndExpandedDagPass", true);
        result.put("oldTasksGoalsAndPlacementsUnchanged", true); result.put("frozenV2TaskSolutionRubricPreparationCoverageUnchanged", true);
        result.put("newTaskFullContextGoalIds", new TreeSet<>(newTaskGraph.contextGoalIds()));
        result.put("newTaskEffectiveDirectPrerequisiteIds", newTaskGraph.directPrerequisites(TASK));
        result.put("newTaskProtectedSupportGoalIds", protectedNewTaskSupport);
        result.put("canonicalDiagnostic", Map.of(
                "authoritativeOfferedScope", false, "targetCountBefore", oldRootAtoms.size(), "targetCountAfter", newRootAtoms.size(),
                "protectedObligationCountBefore", diagnosticBefore.protectedTargetGoalIds().size(),
                "protectedObligationCountAfter", diagnosticAfter.protectedTargetGoalIds().size(),
                "addedTargetAndProtectedGoalIds", Set.of(TASK),
                "separateFrom154AuthoritativeCountryOfferings", true));
        result.put("rpTasks", rp); result.put("rpSupportUnion", union);
        mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[3]).toFile(), result);
    }
}
