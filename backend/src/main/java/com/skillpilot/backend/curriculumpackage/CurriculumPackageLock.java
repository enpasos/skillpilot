package com.skillpilot.backend.curriculumpackage;

import java.util.List;

/** Exact, immutable selection of already installed package objects. */
public record CurriculumPackageLock(String lockSha256, List<Entry> packages) {

    public CurriculumPackageLock {
        packages = List.copyOf(packages);
    }

    public record Entry(
            String packageId,
            String packageVersion,
            String releaseId,
            String outerZipSha256,
            String manifestSha256,
            String contentDigest,
            String archiveRoot,
            String closureDigest,
            String definitionIndexDigest,
            String installRecordSha256) {
    }
}
