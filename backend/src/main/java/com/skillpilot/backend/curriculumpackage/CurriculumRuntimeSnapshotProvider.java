package com.skillpilot.backend.curriculumpackage;

import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;

/** Atomically publishes only fully loaded package generations. */
public final class CurriculumRuntimeSnapshotProvider {

    private final JsonCurriculumPackageLoader loader;
    private final AtomicReference<CurriculumRuntimeSnapshot> active = new AtomicReference<>();

    public CurriculumRuntimeSnapshotProvider(JsonCurriculumPackageLoader loader) {
        this.loader = Objects.requireNonNull(loader, "loader");
        reload();
    }

    public CurriculumRuntimeSnapshot current() {
        CurriculumRuntimeSnapshot snapshot = active.get();
        if (snapshot == null) {
            throw new CurriculumPackageException("No package runtime snapshot is active");
        }
        return snapshot;
    }

    /**
     * A failed reload never changes the previously active snapshot.
     *
     * <p>Package activation is currently a process-start boundary. This method intentionally stays
     * package-private until a coordinator can publish the snapshot and every derived service state
     * as one generation.
     */
    synchronized CurriculumRuntimeSnapshot reload() {
        CurriculumRuntimeSnapshot candidate = loader.load();
        active.set(candidate);
        return candidate;
    }
}
