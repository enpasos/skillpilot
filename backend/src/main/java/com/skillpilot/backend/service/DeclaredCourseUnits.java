package com.skillpilot.backend.service;

import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ProgramUnit;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.charset.StandardCharsets;
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
import java.util.function.Function;
import java.util.function.Predicate;

record DeclaredCourseUnits(List<Unit> units, Map<String, Unit> byFocus, Map<String, List<Unit>> byAtom,
        Set<String> rejectedOpenings) {
    static final DeclaredCourseUnits EMPTY = new DeclaredCourseUnits(List.of(), Map.of(), Map.of(), Set.of());

    record Unit(String landscapeId, String focusId, String scopeId, String label, String labelEn,
            Set<String> atoms, String openingId) {}

    Unit focus(String id) {
        return id == null ? null : byFocus.get(id);
    }

    List<Unit> path(String atomId) {
        return atomId == null ? List.of() : byAtom.getOrDefault(atomId, List.of());
    }

    static DeclaredCourseUnits build(List<SkillLandscape> courses, Map<String, LearningGoal> visible,
            Set<String> targets, Predicate<String> hasViews, Function<String, Set<String>> projectedAtoms) {
        var units = new LinkedHashMap<String, Unit>();
        var focuses = new LinkedHashMap<String, Unit>();
        var paths = new LinkedHashMap<String, List<Unit>>();
        var rejectedOpenings = new HashSet<String>();
        List<SkillLandscape> eligible = courses.stream()
                .filter(course -> course.getLandscapeId() != null
                        && course.getGoals() != null && course.getGoalPlacements() != null
                        && course.getProgramUnits() != null && course.getProgramUnits().stream()
                                .filter(Objects::nonNull).anyMatch(ProgramUnit::isLearningUnit)
                        && !hasViews.test(course.getLandscapeId()))
                .toList();
        if (eligible.isEmpty()) return EMPTY;
        var landscapesByGoal = new HashMap<String, String>();
        var sharedIds = new HashSet<String>();
        for (SkillLandscape course : courses) {
            if (course.getGoals() == null || course.getLandscapeId() == null) continue;
            for (LearningGoal goal : course.getGoals()) {
                if (goal == null || goal.getId() == null) continue;
                String previous = landscapesByGoal.putIfAbsent(goal.getId(), course.getLandscapeId());
                if (previous != null && !previous.equals(course.getLandscapeId())) sharedIds.add(goal.getId());
            }
        }
        for (SkillLandscape course : eligible) {
            String landscape = course.getLandscapeId();
            var declarations = new LinkedHashMap<String, ProgramUnit>();
            for (ProgramUnit unit : course.getProgramUnits()) {
                if (unit == null || unit.getId() == null || declarations.putIfAbsent(unit.getId(), unit) != null) {
                    declarations.clear();
                    break;
                }
            }
            if (declarations.isEmpty()) continue;
            var courseIds = new LinkedHashSet<String>();
            for (LearningGoal goal : course.getGoals()) {
                if (goal != null && goal.getId() != null && !sharedIds.contains(goal.getId())) {
                    courseIds.add(goal.getId());
                }
            }
            var owners = new LinkedHashMap<String, String>();
            var ambiguousOwners = new HashSet<String>();
            for (var placement : course.getGoalPlacements()) {
                if (placement == null || placement.getUnitId() == null
                        || (placement.getContext() != null && !placement.getContext().isEmpty())) continue;
                String goal = placement.getGoalId();
                if (!placement.isOwnership() || !courseIds.contains(goal) || !targets.contains(goal)
                        || !LearnerService.isAtomicGoal(visible.get(goal))) continue;
                String prior = owners.putIfAbsent(goal, placement.getUnitId());
                if (prior != null && !prior.equals(placement.getUnitId())) ambiguousOwners.add(goal);
            }
            ambiguousOwners.forEach(owners::remove);
            ambiguousOwners.stream().filter(goal -> LearnerService.isOrientationGoal(visible.get(goal)))
                    .forEach(rejectedOpenings::add);

            var atomPaths = new LinkedHashMap<String, List<String>>();
            var unitAtoms = new LinkedHashMap<String, Set<String>>();
            owners.forEach((goal, id) -> {
                ProgramUnit owner = declarations.get(id);
                List<String> ids = owner == null || !owner.isLearningUnit() ? List.of() : ancestors(id, declarations);
                if (ids.isEmpty()) {
                    if (LearnerService.isOrientationGoal(visible.get(goal))) rejectedOpenings.add(goal);
                    return;
                }
                atomPaths.put(goal, ids);
                ids.forEach(unit -> unitAtoms.computeIfAbsent(unit, ignored -> new LinkedHashSet<>()).add(goal));
            });
            if (unitAtoms.isEmpty()) continue;

            var byLocalId = new LinkedHashMap<String, Unit>();
            declarations.forEach((id, declaration) -> {
                Set<String> atoms = unitAtoms.get(id);
                if (atoms == null) return;
                String scopeId = stableId("scope", landscape, id);
                String focusId = stableId("focus", landscape, id);
                if (visible.containsKey(focusId) || focuses.containsKey(focusId)) return;
                List<String> openings = atoms.stream().filter(goal -> id.equals(owners.get(goal)))
                        .filter(goal -> LearnerService.isOrientationGoal(visible.get(goal))).toList();
                if (openings.size() > 1) rejectedOpenings.addAll(openings);
                Unit unit = new Unit(landscape, focusId, scopeId, declaration.getLabel(), declaration.getLabelEn(),
                        Collections.unmodifiableSet(new LinkedHashSet<>(atoms)),
                        openings.size() == 1 ? openings.getFirst() : null);
                units.put(focusId, unit);
                focuses.put(focusId, unit);
                byLocalId.put(id, unit);
            });

            // Several catalog aliases can identify the same unit. A catalog
            // cluster with equal membership in multiple units identifies none.
            var unitByAtoms = new HashMap<Set<String>, Unit>();
            var ambiguousScopes = new HashSet<Set<String>>();
            for (Unit unit : byLocalId.values()) {
                if (unitByAtoms.putIfAbsent(unit.atoms(), unit) != null) ambiguousScopes.add(unit.atoms());
            }
            ambiguousScopes.forEach(unitByAtoms::remove);
            for (String goalId : courseIds) {
                LearningGoal candidate = visible.get(goalId);
                if (candidate == null || LearnerService.isAtomicGoal(candidate)) continue;
                Unit alias = unitByAtoms.get(projectedAtoms.apply(goalId));
                if (alias != null) focuses.putIfAbsent(goalId, alias);
            }
            atomPaths.forEach((goal, ids) -> {
                if (ids.stream().allMatch(byLocalId::containsKey)) {
                    paths.put(goal, ids.stream().map(byLocalId::get).toList());
                }
            });
        }
        return units.isEmpty() && rejectedOpenings.isEmpty() ? EMPTY
                : new DeclaredCourseUnits(List.copyOf(units.values()), Map.copyOf(focuses), Map.copyOf(paths),
                        Set.copyOf(rejectedOpenings));
    }

    private static List<String> ancestors(String id, Map<String, ProgramUnit> declarations) {
        var result = new ArrayList<String>();
        var visited = new HashSet<String>();
        while (id != null) {
            ProgramUnit unit = declarations.get(id);
            if (unit == null || !visited.add(id)) return List.of();
            if (unit.isLearningUnit()) result.add(id);
            id = unit.getParentUnitId();
        }
        return result;
    }

    private static String stableId(String kind, String landscape, String unit) {
        return UUID.nameUUIDFromBytes(("skillpilot:declared-course-unit:" + kind + ":" + landscape + ":" + unit)
                .getBytes(StandardCharsets.UTF_8)).toString();
    }
}
