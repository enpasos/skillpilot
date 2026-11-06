package com.skillpilot.backend.identity;

import static com.skillpilot.backend.identity.GoalIdentityService.require;
import static com.skillpilot.backend.identity.GoalIdentityService.isUuid;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Pure internal map. It grants neither source-proof acceptance nor runtime activation. */
final class GoalIdentityMap {
    record Rename(String landscapeId, String sourceGoalId, String targetGoalId) { }
    private final Map<String, Rename> aliases;
    private final Map<String, Set<String>> owners;
    private final Map<String, Set<String>> qualifiedOriginalSpellings;
    private final Map<String, Set<String>> originalSpellings;

    GoalIdentityMap(List<Rename> renames, Map<String, Set<String>> sourceOwners,
            Set<String> originalGoalIdsCaseFolded) {
        Map<String, Rename> index = new LinkedHashMap<>();
        Set<String> sources = new LinkedHashSet<>(), targets = new LinkedHashSet<>();
        for (Rename rule : renames) {
            require(rule.sourceGoalId() != null && !rule.sourceGoalId().isBlank()
                    && !rule.sourceGoalId().contains(":"), "Invalid original durable key");
            require(!isUuid(rule.sourceGoalId()), "This format repair must preserve every already-valid UUID");
            require(isUuid(rule.landscapeId()) && isUuid(rule.targetGoalId()), "Invalid identity owner/target UUID");
            require(!rule.sourceGoalId().equalsIgnoreCase(rule.targetGoalId()), "Identity rule is not a rename");
            require(sources.add(rule.sourceGoalId()), "Ambiguous original durable key");
            require(targets.add(rule.targetGoalId().toLowerCase(Locale.ROOT)), "Noninjective target identity");
        }
        for (Rename rule : renames) {
            require(!sources.contains(rule.targetGoalId()), "Identity alias chain or cycle");
            require(!originalGoalIdsCaseFolded.contains(rule.targetGoalId().toLowerCase(Locale.ROOT)),
                    "Target collides with an original snapshot identity");
            index.put(rule.sourceGoalId(), rule);
            require(index.putIfAbsent(uuidValueKey(rule.targetGoalId()), rule) == null, "Identity alias collision");
        }
        aliases = Map.copyOf(index);
        Map<String, Set<String>> ownerCopy = new LinkedHashMap<>();
        Map<String, Set<String>> spellings = new LinkedHashMap<>(), allSpellings = new LinkedHashMap<>();
        sourceOwners.forEach((id, values) -> values.forEach(owner -> {
            ownerCopy.computeIfAbsent(uuidValueKey(id), ignored -> new LinkedHashSet<>()).add(uuidValueKey(owner));
            spellings.computeIfAbsent(uuidValueKey(owner) + ":" + uuidValueKey(id), ignored -> new LinkedHashSet<>()).add(id);
            allSpellings.computeIfAbsent(uuidValueKey(id), ignored -> new LinkedHashSet<>()).add(id);
        }));
        Map<String, Set<String>> immutableOwners = new LinkedHashMap<>(), immutableSpellings = new LinkedHashMap<>(), immutableAll = new LinkedHashMap<>();
        ownerCopy.forEach((id, values) -> immutableOwners.put(id, Set.copyOf(values)));
        spellings.forEach((id, values) -> immutableSpellings.put(id, Set.copyOf(values)));
        allSpellings.forEach((id, values) -> immutableAll.put(id, Set.copyOf(values)));
        owners = Map.copyOf(immutableOwners); qualifiedOriginalSpellings = Map.copyOf(immutableSpellings);
        originalSpellings = Map.copyOf(immutableAll);
    }

    public String canonicalGoalId(String oldOrCurrentGoalReference) {
        String id = resolve(oldOrCurrentGoalReference);
        Rename rule = alias(id);
        return rule == null ? id : rule.targetGoalId();
    }

    public String storageGoalId(String oldOrCurrentGoalReference) {
        String id = resolve(oldOrCurrentGoalReference);
        Rename rule = alias(id);
        return rule == null ? id : rule.sourceGoalId();
    }

    private Rename alias(String id) {
        Rename found = aliases.get(id);
        return found != null || !isUuid(id) ? found : aliases.get(id.toLowerCase(Locale.ROOT));
    }

    private String resolve(String reference) {
        require(reference != null && !reference.isBlank() && reference.equals(reference.trim()), "Missing/invalid goal reference");
        String id = reference;
        int separator = reference.indexOf(':');
        if (separator >= 0) {
            require(separator > 0 && separator < reference.length() - 1
                    && reference.indexOf(':', separator + 1) < 0, "Invalid qualified goal reference");
            String owner = reference.substring(0, separator);
            id = reference.substring(separator + 1);
            Rename rule = alias(id);
            require(rule == null ? owners.getOrDefault(uuidValueKey(id), Set.of()).contains(uuidValueKey(owner))
                    : uuidValueKey(rule.landscapeId()).equals(uuidValueKey(owner)),
                    "Unknown or wrong qualified goal owner");
            if (rule == null) {
                Set<String> spellings = qualifiedOriginalSpellings.get(uuidValueKey(owner) + ":" + uuidValueKey(id));
                require(spellings != null && spellings.size() == 1, "Ambiguous original UUID spelling for qualified goal");
                id = spellings.iterator().next();
            }
        } else if (alias(id) == null && isUuid(id)) {
            Set<String> spellings = originalSpellings.get(uuidValueKey(id));
            if (spellings != null) {
                require(spellings.size() == 1, "Ambiguous original UUID spelling for unqualified goal");
                id = spellings.iterator().next();
            }
        }
        require(alias(id) != null || isUuid(id), "Unknown original goal identity");
        return id;
    }

    static String uuidValueKey(String id) {
        return isUuid(id) ? id.toLowerCase(Locale.ROOT) : id;
    }

}
