package com.skillpilot.backend.api;

import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;
import java.util.Map;

public class LandscapeOverviewResponse {
    private List<LandscapeSummary> summaries;
    private Map<String, Object> hierarchy;

    public LandscapeOverviewResponse(List<LandscapeSummary> summaries, Map<String, Object> hierarchy) {
        this.summaries = summaries;
        this.hierarchy = hierarchy;
    }

    public List<LandscapeSummary> getSummaries() {
        return summaries;
    }

    public void setSummaries(List<LandscapeSummary> summaries) {
        this.summaries = summaries;
    }

    public Map<String, Object> getHierarchy() {
        return hierarchy;
    }

    public void setHierarchy(Map<String, Object> hierarchy) {
        this.hierarchy = hierarchy;
    }
}
