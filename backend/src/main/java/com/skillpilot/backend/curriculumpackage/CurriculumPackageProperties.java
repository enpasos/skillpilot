package com.skillpilot.backend.curriculumpackage;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configuration for the opt-in, package-backed curriculum source. */
@ConfigurationProperties(prefix = "skillpilot.curriculum")
public class CurriculumPackageProperties {

    private CurriculumSourceMode source = CurriculumSourceMode.REPOSITORY;
    private String consumerVersion = "0.1.0";
    private final Packages packages = new Packages();

    public CurriculumSourceMode getSource() {
        return source;
    }

    public void setSource(CurriculumSourceMode source) {
        this.source = source;
    }

    public Packages getPackages() {
        return packages;
    }

    /** Stable curriculum-consumer API version, independent of the Gradle artifact qualifier. */
    public String getConsumerVersion() {
        return consumerVersion;
    }

    public void setConsumerVersion(String consumerVersion) {
        this.consumerVersion = consumerVersion;
    }

    public static final class Packages {
        private String storeDirectory = "../tmp/curriculum-package-store";
        private String activeLock = "locks/active.json";

        public String getStoreDirectory() {
            return storeDirectory;
        }

        public void setStoreDirectory(String storeDirectory) {
            this.storeDirectory = storeDirectory;
        }

        public String getActiveLock() {
            return activeLock;
        }

        public void setActiveLock(String activeLock) {
            this.activeLock = activeLock;
        }
    }
}
