package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = false)
public class PersonalizationGroup {
    private String id;
    private Integer order;
    private String label;
    private String labelEn;
    private Integer minSelections;
    private Integer maxSelections;
    private PersonalizationOptionSource source;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getLabelEn() {
        return labelEn;
    }

    public void setLabelEn(String labelEn) {
        this.labelEn = labelEn;
    }

    public Integer getMinSelections() {
        return minSelections;
    }

    public void setMinSelections(Integer minSelections) {
        this.minSelections = minSelections;
    }

    public Integer getMaxSelections() {
        return maxSelections;
    }

    public void setMaxSelections(Integer maxSelections) {
        this.maxSelections = maxSelections;
    }

    public PersonalizationOptionSource getSource() {
        return source;
    }

    public void setSource(PersonalizationOptionSource source) {
        this.source = source;
    }
}
