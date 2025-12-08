package com.skillpilot.backend.landscape;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "skillpilot.landscapes")
public class LandscapeProperties {

    /** Directory containing landscape JSON files. */
    private String directory = "../curricula";

    public String getDirectory() {
        return directory;
    }

    public void setDirectory(String directory) {
        this.directory = directory;
    }
}
