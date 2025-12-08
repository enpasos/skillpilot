package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DimensionTags {

    private String framework;
    private String demandLevel;
    private List<String> processCompetencies;
    private List<String> guidingIdeas;
    private String phase;
    private String area;
    private String topicCode;

    public String getFramework() {
        return framework;
    }

    public void setFramework(String framework) {
        this.framework = framework;
    }

    public String getDemandLevel() {
        return demandLevel;
    }

    public void setDemandLevel(String demandLevel) {
        this.demandLevel = demandLevel;
    }

    public List<String> getProcessCompetencies() {
        return processCompetencies;
    }

    public void setProcessCompetencies(List<String> processCompetencies) {
        this.processCompetencies = processCompetencies;
    }

    public List<String> getGuidingIdeas() {
        return guidingIdeas;
    }

    public void setGuidingIdeas(List<String> guidingIdeas) {
        this.guidingIdeas = guidingIdeas;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    @JsonProperty("topicCode")
    public String getTopicCode() {
        return topicCode;
    }

    public void setTopicCode(String topicCode) {
        this.topicCode = topicCode;
    }
}
