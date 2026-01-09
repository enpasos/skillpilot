package com.skillpilot.backend.landscape;

import java.util.List;

public class LandscapeSummary {
    private String curriculumId;
    private String title;
    private String description;
    private String country;
    private String region;
    private String type;
    private String subject;
    private String locale;
    private List<LandscapeFilter> filters;

    public LandscapeSummary(String curriculumId, String title, String description, String country, String region,
            String type, String subject, String locale, List<LandscapeFilter> filters) {
        this.curriculumId = curriculumId;
        this.title = title;
        this.description = description;
        this.country = country;
        this.region = region;
        this.type = type;
        this.subject = subject;
        this.locale = locale;
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

    public String getCountry() {
        return country;
    }

    public String getRegion() {
        return region;
    }

    public String getType() {
        return type;
    }

    public String getSubject() {
        return subject;
    }

    public String getLocale() {
        return locale;
    }
}
