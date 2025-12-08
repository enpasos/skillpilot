package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class LearningLandscape {
    private String landscapeId;
    private String locale;
    private String subject;
    private String frameworkId;
    private String title;
    private String titleEn;
    private String description;
    private String descriptionEn;
    private List<LandscapeFilter> filters;
    private List<LearningGoal> goals;

    public String getLandscapeId() {
        return landscapeId;
    }

    public void setLandscapeId(String landscapeId) {
        this.landscapeId = landscapeId;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getFrameworkId() {
        return frameworkId;
    }

    public void setFrameworkId(String frameworkId) {
        this.frameworkId = frameworkId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTitleEn() {
        return titleEn;
    }

    public void setTitleEn(String titleEn) {
        this.titleEn = titleEn;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Getter and Setter for descriptionEn
    public String getDescriptionEn() {
        return descriptionEn;
    }

    public void setDescriptionEn(String descriptionEn) {
        this.descriptionEn = descriptionEn;
    }

    public List<LandscapeFilter> getFilters() {
        return filters;
    }

    public void setFilters(List<LandscapeFilter> filters) {
        this.filters = filters;
    }

    public List<LearningGoal> getGoals() {
        return goals;
    }

    public void setGoals(List<LearningGoal> goals) {
        this.goals = goals;
    }
}
