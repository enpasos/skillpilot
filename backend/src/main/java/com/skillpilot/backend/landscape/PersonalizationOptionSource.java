package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = false)
public class PersonalizationOptionSource {
    private PersonalizationSourceKind kind;
    private String landscapeId;
    private List<String> landscapeIds;
    private String selectedLandscapesFromGroupId;
    private List<String> filterIds;

    public PersonalizationSourceKind getKind() {
        return kind;
    }

    public void setKind(PersonalizationSourceKind kind) {
        this.kind = kind;
    }

    public String getLandscapeId() {
        return landscapeId;
    }

    public void setLandscapeId(String landscapeId) {
        this.landscapeId = landscapeId;
    }

    public List<String> getLandscapeIds() {
        return landscapeIds;
    }

    public void setLandscapeIds(List<String> landscapeIds) {
        this.landscapeIds = landscapeIds;
    }

    public String getSelectedLandscapesFromGroupId() {
        return selectedLandscapesFromGroupId;
    }

    public void setSelectedLandscapesFromGroupId(String selectedLandscapesFromGroupId) {
        this.selectedLandscapesFromGroupId = selectedLandscapesFromGroupId;
    }

    public List<String> getFilterIds() {
        return filterIds;
    }

    /**
     * Optional ordered restriction of the authored filters exposed by this
     * source.
     *
     * <p>IDs are a case-insensitive set. For
     * {@link PersonalizationSourceKind#FILTERS_FOR_SELECTED_LANDSCAPES}, flow
     * version 1 requires every restricted ID to resolve in every landscape
     * that the referenced upstream group can select. Per-landscape,
     * heterogeneous restricted lists are intentionally not representable in
     * version 1. Omit this field to expose each selected landscape's own
     * authored filter vocabulary instead.</p>
     */
    public void setFilterIds(List<String> filterIds) {
        this.filterIds = filterIds;
    }
}
