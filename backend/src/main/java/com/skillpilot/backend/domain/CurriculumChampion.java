package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Table(name = "curriculum_champion")
@DynamicUpdate
public class CurriculumChampion {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 36)
    private String id;

    @Column(name = "curriculum_id", nullable = false, length = 255)
    private String curriculumId;

    @Column(name = "topic_id", nullable = true, length = 255)
    private String topicId;

    @Column(name = "skillpilot_id", nullable = false, length = 80)
    private String skillpilotId;

    @Column(name = "github_id", nullable = false, length = 80)
    private String githubId;

    @Column(name = "issues_count", nullable = false)
    private int issuesCount = 0;

    @Column(name = "pull_requests_count", nullable = false)
    private int pullRequestsCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCurriculumId() {
        return curriculumId;
    }

    public void setCurriculumId(String curriculumId) {
        this.curriculumId = curriculumId;
    }

    public String getTopicId() {
        return topicId;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
    }

    public String getSkillpilotId() {
        return skillpilotId;
    }

    public void setSkillpilotId(String skillpilotId) {
        this.skillpilotId = skillpilotId;
    }

    public String getGithubId() {
        return githubId;
    }

    public void setGithubId(String githubId) {
        this.githubId = githubId;
    }

    public int getIssuesCount() {
        return issuesCount;
    }

    public void setIssuesCount(int issuesCount) {
        this.issuesCount = issuesCount;
    }

    public int getPullRequestsCount() {
        return pullRequestsCount;
    }

    public void setPullRequestsCount(int pullRequestsCount) {
        this.pullRequestsCount = pullRequestsCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    void ensureId() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
