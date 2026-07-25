package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class LearningLandscape {
    @JsonProperty("$schema")
    private String schema;
    private String landscapeFormatVersion;
    @JsonProperty("landscapeId")
    @JsonAlias("id")
    private String landscapeId;
    private String locale;
    private String subject;
    private String frameworkId;
    private String title;
    private String titleEn;
    private String description;
    private String descriptionEn;
    private String country;
    private String region;
    private String schoolType;
    private Boolean compatibilityOnly;
    private Boolean legacyHiddenByDefault;
    private List<LandscapeFilter> filters;
    private PersonalizationFlow personalizationFlow;
    private List<ProgramUnit> programUnits;
    private List<GoalPlacement> goalPlacements;
    private List<CompetencyCatalogEntry> competencyCatalog;
    private List<LearningGoal> goals;

    @JsonProperty("$schema")
    public String getSchema() {
        return schema;
    }

    @JsonProperty("$schema")
    public void setSchema(String schema) {
        this.schema = schema;
    }

    public String getLandscapeFormatVersion() {
        return landscapeFormatVersion;
    }

    public void setLandscapeFormatVersion(String landscapeFormatVersion) {
        this.landscapeFormatVersion = landscapeFormatVersion;
    }

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

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getSchoolType() {
        return schoolType;
    }

    public void setSchoolType(String schoolType) {
        this.schoolType = schoolType;
    }

    public Boolean getCompatibilityOnly() {
        return compatibilityOnly;
    }

    public void setCompatibilityOnly(Boolean compatibilityOnly) {
        this.compatibilityOnly = compatibilityOnly;
    }

    public Boolean getLegacyHiddenByDefault() {
        return legacyHiddenByDefault;
    }

    public void setLegacyHiddenByDefault(Boolean legacyHiddenByDefault) {
        this.legacyHiddenByDefault = legacyHiddenByDefault;
    }

    public List<LandscapeFilter> getFilters() {
        return filters;
    }

    public void setFilters(List<LandscapeFilter> filters) {
        this.filters = filters;
    }

    public PersonalizationFlow getPersonalizationFlow() {
        return personalizationFlow;
    }

    public void setPersonalizationFlow(PersonalizationFlow personalizationFlow) {
        this.personalizationFlow = personalizationFlow;
    }

    public List<ProgramUnit> getProgramUnits() {
        return programUnits;
    }

    public void setProgramUnits(List<ProgramUnit> programUnits) {
        this.programUnits = programUnits;
    }

    public List<GoalPlacement> getGoalPlacements() {
        return goalPlacements;
    }

    public void setGoalPlacements(List<GoalPlacement> goalPlacements) {
        this.goalPlacements = goalPlacements;
    }

    public List<CompetencyCatalogEntry> getCompetencyCatalog() {
        return competencyCatalog;
    }

    public void setCompetencyCatalog(List<CompetencyCatalogEntry> competencyCatalog) {
        this.competencyCatalog = competencyCatalog;
    }

    public List<LearningGoal> getGoals() {
        return goals;
    }

    public void setGoals(List<LearningGoal> goals) {
        this.goals = goals;
    }
}
