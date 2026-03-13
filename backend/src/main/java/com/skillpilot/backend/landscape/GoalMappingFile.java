package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GoalMappingFile {

    private int version;
    private String sourceLandscapeId;
    private String targetLandscapeId;
    private List<GoalMappingEntry> mappings;

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public String getSourceLandscapeId() {
        return sourceLandscapeId;
    }

    public void setSourceLandscapeId(String sourceLandscapeId) {
        this.sourceLandscapeId = sourceLandscapeId;
    }

    public String getTargetLandscapeId() {
        return targetLandscapeId;
    }

    public void setTargetLandscapeId(String targetLandscapeId) {
        this.targetLandscapeId = targetLandscapeId;
    }

    public List<GoalMappingEntry> getMappings() {
        return mappings;
    }

    public void setMappings(List<GoalMappingEntry> mappings) {
        this.mappings = mappings;
    }
}
