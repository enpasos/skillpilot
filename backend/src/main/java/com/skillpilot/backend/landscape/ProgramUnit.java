package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * One entry of the landscape placement layer. Kind {@code learningUnit} (curriculum-package
 * runtime contract 1.2) additionally carries an English label, a learning promise in both
 * languages, a dated revision and the reviewed coverage of its own assessments; those fields are
 * absent for every other kind and are only serialized when present.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProgramUnit {
    public static final String LEARNING_UNIT_KIND = "learningUnit";

    private String id;
    private String kind;
    private String label;
    private String shortLabel;
    private Integer order;
    private String parentUnitId;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String labelEn;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String promise;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String promiseEn;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String revision;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<CoverageReview> coverageReviews;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getShortLabel() {
        return shortLabel;
    }

    public void setShortLabel(String shortLabel) {
        this.shortLabel = shortLabel;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public String getParentUnitId() {
        return parentUnitId;
    }

    public void setParentUnitId(String parentUnitId) {
        this.parentUnitId = parentUnitId;
    }

    public String getLabelEn() {
        return labelEn;
    }

    public void setLabelEn(String labelEn) {
        this.labelEn = labelEn;
    }

    public String getPromise() {
        return promise;
    }

    public void setPromise(String promise) {
        this.promise = promise;
    }

    public String getPromiseEn() {
        return promiseEn;
    }

    public void setPromiseEn(String promiseEn) {
        this.promiseEn = promiseEn;
    }

    public String getRevision() {
        return revision;
    }

    public void setRevision(String revision) {
        this.revision = revision;
    }

    public List<CoverageReview> getCoverageReviews() {
        return coverageReviews;
    }

    public void setCoverageReviews(List<CoverageReview> coverageReviews) {
        this.coverageReviews = coverageReviews;
    }

    @JsonIgnore
    public boolean isLearningUnit() {
        return LEARNING_UNIT_KIND.equals(kind);
    }

    /**
     * Reviewed coverage evidence (rule R2) of one own assessment of the unit: the reviewed goals, the
     * review record and the canonical hashes of the reviewed task/solution and rubric. Static
     * curriculum data only; it never carries a learner result.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CoverageReview {
        private String assessmentGoalId;
        private List<String> goalIds;
        private String reference;
        private String taskRevision;
        private String rubricRevision;

        public String getAssessmentGoalId() {
            return assessmentGoalId;
        }

        public void setAssessmentGoalId(String assessmentGoalId) {
            this.assessmentGoalId = assessmentGoalId;
        }

        public List<String> getGoalIds() {
            return goalIds;
        }

        public void setGoalIds(List<String> goalIds) {
            this.goalIds = goalIds;
        }

        public String getReference() {
            return reference;
        }

        public void setReference(String reference) {
            this.reference = reference;
        }

        public String getTaskRevision() {
            return taskRevision;
        }

        public void setTaskRevision(String taskRevision) {
            this.taskRevision = taskRevision;
        }

        public String getRubricRevision() {
            return rubricRevision;
        }

        public void setRubricRevision(String rubricRevision) {
            this.rubricRevision = rubricRevision;
        }
    }
}
