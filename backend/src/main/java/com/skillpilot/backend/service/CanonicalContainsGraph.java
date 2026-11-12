package com.skillpilot.backend.service;

import java.util.AbstractMap;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * An immutable copy of the canonical contains graph: goal id to child references.
 *
 * <p>Neither the map nor its lists can change after creation. A consumer that
 * has compared one instance may therefore recognise the same instance as an
 * unchanged graph without comparing its content again. A supplier returns a
 * new instance whenever the underlying landscapes were loaded anew.</p>
 */
public final class CanonicalContainsGraph extends AbstractMap<String, List<String>> {
    private final Map<String, List<String>> contains;

    private CanonicalContainsGraph(Map<String, List<String>> contains) {
        this.contains = contains;
    }

    public static CanonicalContainsGraph copyOf(Map<String, List<String>> source) {
        Map<String, List<String>> copy = new LinkedHashMap<>();
        source.forEach((id, children) -> copy.put(id, children == null ? List.of() : List.copyOf(children)));
        return new CanonicalContainsGraph(Collections.unmodifiableMap(copy));
    }

    @Override
    public Set<Entry<String, List<String>>> entrySet() {
        return contains.entrySet();
    }

    @Override
    public List<String> get(Object key) {
        return contains.get(key);
    }

    @Override
    public boolean containsKey(Object key) {
        return contains.containsKey(key);
    }

    @Override
    public int size() {
        return contains.size();
    }
}
