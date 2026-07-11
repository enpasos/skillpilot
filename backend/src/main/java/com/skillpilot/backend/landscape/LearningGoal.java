package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonSetter;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class LearningGoal {
    private String id;
    private String shortKey;
    private String title;
    private String titleEn;
    private String description;
    private String descriptionEn;
    private Boolean core;
    private double weight;
    private List<String> tags;
    private DimensionTags dimensionTags;
    private List<String> requires;
    private List<String> contains;
    private List<String> examples;
    private java.util.Map<String, java.util.List<String>> applicability;
    private String sourceRef;
    private List<java.util.Map<String, Object>> resourceLinks;
    private List<String> competencyRefs;
    private java.util.Map<String, Object> extendedData;
    private ReleaseMetadata release;
    private String courseLevel;
    private String themenfeld;
    private List<String> leitideen;
    private List<String> kompetenzen;
    private ExperimentData experimentData;
    private String phase;
    private Boolean semanticAtomic;
    private String semanticKind;
    // Explicit node type ("atomic" | "cluster"), optional for backward compatibility
    private String type;
    // Explicit node kind ("exam" | "tutor" | "memory"), optional for backward compatibility
    private String nodeKind;

    public java.util.Map<String, Object> getExtendedData() {
        return extendedData;
    }

    public void setExtendedData(java.util.Map<String, Object> extendedData) {
        this.extendedData = extendedData;
    }

    public ReleaseMetadata getRelease() {
        return release;
    }

    public void setRelease(ReleaseMetadata release) {
        this.release = release;
    }

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

    @JsonIgnore
    public boolean isCore() {
        return Boolean.TRUE.equals(core);
    }

    @JsonGetter("core")
    public Boolean getCore() {
        return core;
    }

    @JsonSetter("core")
    public void setCore(Boolean core) {
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

    public java.util.Map<String, java.util.List<String>> getApplicability() {
        return applicability;
    }

    public void setApplicability(java.util.Map<String, java.util.List<String>> applicability) {
        this.applicability = applicability;
    }

    public String getSourceRef() {
        return sourceRef;
    }

    public void setSourceRef(String sourceRef) {
        this.sourceRef = sourceRef;
    }

    public List<java.util.Map<String, Object>> getResourceLinks() {
        return resourceLinks;
    }

    public void setResourceLinks(List<java.util.Map<String, Object>> resourceLinks) {
        this.resourceLinks = resourceLinks;
    }

    public List<String> getCompetencyRefs() {
        return competencyRefs;
    }

    public void setCompetencyRefs(List<String> competencyRefs) {
        this.competencyRefs = competencyRefs;
    }

    public String getCourseLevel() {
        return courseLevel;
    }

    public void setCourseLevel(String courseLevel) {
        this.courseLevel = courseLevel;
    }

    public String getThemenfeld() {
        return themenfeld;
    }

    public void setThemenfeld(String themenfeld) {
        this.themenfeld = themenfeld;
    }

    public List<String> getLeitideen() {
        return leitideen;
    }

    public void setLeitideen(List<String> leitideen) {
        this.leitideen = leitideen;
    }

    public List<String> getKompetenzen() {
        return kompetenzen;
    }

    public void setKompetenzen(List<String> kompetenzen) {
        this.kompetenzen = kompetenzen;
    }

    public ExperimentData getExperimentData() {
        return experimentData;
    }

    public void setExperimentData(ExperimentData experimentData) {
        this.experimentData = experimentData;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public Boolean getSemanticAtomic() {
        return semanticAtomic;
    }

    public void setSemanticAtomic(Boolean semanticAtomic) {
        this.semanticAtomic = semanticAtomic;
    }

    public String getSemanticKind() {
        return semanticKind;
    }

    public void setSemanticKind(String semanticKind) {
        this.semanticKind = semanticKind;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getNodeKind() {
        return nodeKind;
    }

    public void setNodeKind(String nodeKind) {
        this.nodeKind = nodeKind;
    }

    private ExamData examData;

    public ExamData getExamData() {
        return examData;
    }

    public void setExamData(ExamData examData) {
        this.examData = examData;
    }
}
