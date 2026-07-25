package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * Authored, provider-neutral sequence of learner personalization decisions.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = false)
public class PersonalizationFlow {
    private String version;
    private List<PersonalizationStage> stages;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public List<PersonalizationStage> getStages() {
        return stages;
    }

    public void setStages(List<PersonalizationStage> stages) {
        this.stages = stages;
    }
}
