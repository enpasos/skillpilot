package com.skillpilot.backend.curriculumpackage;

import java.nio.file.Path;

/** Package object selected by a verified active lock. Package paths stay package-private. */
public final class InstalledCurriculumPackage {

    private final CurriculumPackageLock.Entry lockEntry;
    private final Path packageRoot;
    private final int validatedManifestFileCount;

    InstalledCurriculumPackage(
            CurriculumPackageLock.Entry lockEntry,
            Path packageRoot,
            int validatedManifestFileCount) {
        this.lockEntry = lockEntry;
        this.packageRoot = packageRoot;
        this.validatedManifestFileCount = validatedManifestFileCount;
    }

    public CurriculumPackageLock.Entry lockEntry() {
        return lockEntry;
    }

    Path packageRoot() {
        return packageRoot;
    }

    int validatedManifestFileCount() {
        return validatedManifestFileCount;
    }
}
