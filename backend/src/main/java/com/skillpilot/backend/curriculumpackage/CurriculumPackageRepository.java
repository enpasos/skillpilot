package com.skillpilot.backend.curriculumpackage;

import java.util.List;

/** Read-only access to the exact package set selected by the active lock. */
public interface CurriculumPackageRepository {

    ActivePackageSet loadActivePackageSet();

    record ActivePackageSet(String lockSha256, List<InstalledCurriculumPackage> packages) {
        public ActivePackageSet {
            packages = List.copyOf(packages);
        }
    }
}
