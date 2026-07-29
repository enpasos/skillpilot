package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * Authored input for one dimension of an offering probe.
 *
 * <p>Exactly one value source is used: a literal {@code value}, a list of
 * probe {@code values}, or the selected value of an earlier personalization
 * group. A missing earlier value fails closed unless {@code required} is
 * explicitly {@code false}. An authored {@code omitValues} list can map
 * explicit umbrella selections such as a canonical all-jurisdictions view to
 * the absence of that probe dimension.</p>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = false)
public class PersonalizationScopeBinding {
    private String dimension;
    private String value;
    private List<String> values;
    private String selectedValueFromGroupId;
    private List<String> omitValues;
    private Boolean required;

    public String getDimension() {
        return dimension;
    }

    public void setDimension(String dimension) {
        this.dimension = dimension;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public List<String> getValues() {
        return values;
    }

    public void setValues(List<String> values) {
        this.values = values;
    }

    public String getSelectedValueFromGroupId() {
        return selectedValueFromGroupId;
    }

    public void setSelectedValueFromGroupId(String selectedValueFromGroupId) {
        this.selectedValueFromGroupId = selectedValueFromGroupId;
    }

    public List<String> getOmitValues() {
        return omitValues;
    }

    public void setOmitValues(List<String> omitValues) {
        this.omitValues = omitValues;
    }

    public Boolean getRequired() {
        return required;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }
}
