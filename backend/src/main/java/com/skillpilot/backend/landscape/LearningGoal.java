package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class LearningGoal {
    private String id;
    private String shortKey;
    private String title;
    private String titleEn;
    private String description;
    private String descriptionEn;
    private boolean core;
    private double weight;
    private List<String> tags;
    private DimensionTags dimensionTags;
    private List<String> requires;
    private List<String> contains;
    private List<String> examples;
    private String sourceRef;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getShortKey() {
        return shortKey;
    }

    public void setShortKey(String shortKey) {
        this.shortKey = shortKey;
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

    public String getDescriptionEn() {
        return descriptionEn;
    }

    public void setDescriptionEn(String descriptionEn) {
        this.descriptionEn = descriptionEn;
    }

    public boolean isCore() {
        return core;
    }

    public void setCore(boolean core) {
        this.core = core;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public DimensionTags getDimensionTags() {
        return dimensionTags;
    }

    public void setDimensionTags(DimensionTags dimensionTags) {
        this.dimensionTags = dimensionTags;
    }

    public List<String> getRequires() {
        return requires;
    }

    public void setRequires(List<String> requires) {
        this.requires = requires;
    }

    public List<String> getContains() {
        return contains;
    }

    public void setContains(List<String> contains) {
        this.contains = contains;
    }

    public List<String> getExamples() {
        return examples;
    }

    public void setExamples(List<String> examples) {
        this.examples = examples;
    }

    public String getSourceRef() {
        return sourceRef;
    }

    public void setSourceRef(String sourceRef) {
        this.sourceRef = sourceRef;
    }
}
