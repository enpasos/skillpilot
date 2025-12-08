package com.skillpilot.backend.landscape;

import java.util.List;

public class LandscapeSummary {
    private String curriculumId;
    private String title;
    private String description;
    private List<LandscapeFilter> filters;

    public LandscapeSummary(String curriculumId, String title, String description, List<LandscapeFilter> filters) {
        this.curriculumId = curriculumId;
        this.title = title;
        this.description = description;
        this.filters = filters;
    }

    public String getCurriculumId() {
        return curriculumId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public List<LandscapeFilter> getFilters() {
        return filters;
    }
}
