package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ExamData {
    private String reviewStatus;
    private List<String> coveredGoalIds;
    private List<String> coveredStrands;
    private List<String> demandLevels;
    private String sourceArtifactPath;
    private String taskContent;
    private String taskContentEn;
    private String solutionContent;
    private String solutionContentEn;
    private Scoring scoring;

    public String getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(String reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public List<String> getCoveredGoalIds() {
        return coveredGoalIds;
    }

    public void setCoveredGoalIds(List<String> coveredGoalIds) {
        this.coveredGoalIds = coveredGoalIds;
    }

    public List<String> getCoveredStrands() {
        return coveredStrands;
    }

    public void setCoveredStrands(List<String> coveredStrands) {
        this.coveredStrands = coveredStrands;
    }

    public List<String> getDemandLevels() {
        return demandLevels;
    }

    public void setDemandLevels(List<String> demandLevels) {
        this.demandLevels = demandLevels;
    }

    public String getSourceArtifactPath() {
        return sourceArtifactPath;
    }

    public void setSourceArtifactPath(String sourceArtifactPath) {
        this.sourceArtifactPath = sourceArtifactPath;
    }

    public String getTaskContent() {
        return taskContent;
    }

    public void setTaskContent(String taskContent) {
        this.taskContent = taskContent;
    }

    public String getTaskContentEn() {
        return taskContentEn;
    }

    public void setTaskContentEn(String taskContentEn) {
        this.taskContentEn = taskContentEn;
    }

    public String getSolutionContent() {
        return solutionContent;
    }

    public void setSolutionContent(String solutionContent) {
        this.solutionContent = solutionContent;
    }

    public String getSolutionContentEn() {
        return solutionContentEn;
    }

    public void setSolutionContentEn(String solutionContentEn) {
        this.solutionContentEn = solutionContentEn;
    }

    public Scoring getScoring() {
        return scoring;
    }

    public void setScoring(Scoring scoring) {
        this.scoring = scoring;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Scoring {
        private double maxPoints;
        private double passingPoints;
        private List<Step> steps;

        public double getMaxPoints() {
            return maxPoints;
        }

        public void setMaxPoints(double maxPoints) {
            this.maxPoints = maxPoints;
        }

        public double getPassingPoints() {
            return passingPoints;
        }

        public void setPassingPoints(double passingPoints) {
            this.passingPoints = passingPoints;
        }

        public List<Step> getSteps() {
            return steps;
        }

        public void setSteps(List<Step> steps) {
            this.steps = steps;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Step {
        private String id;
        private double points;
        private String description;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public double getPoints() {
            return points;
        }

        public void setPoints(double points) {
            this.points = points;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
