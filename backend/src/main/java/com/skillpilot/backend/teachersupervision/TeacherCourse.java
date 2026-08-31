package com.skillpilot.backend.teachersupervision;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "teacher_course")
public class TeacherCourse {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false, updatable = false)
    private TeacherWorkspace workspace;

    @Column(name = "course_label", nullable = false, length = 80)
    private String courseLabel;

    @Column(name = "teacher_display_name", nullable = false, length = 80)
    private String teacherDisplayName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    protected TeacherCourse() {
    }

    TeacherCourse(TeacherWorkspace workspace, String courseLabel, String teacherDisplayName) {
        this.id = UUID.randomUUID();
        this.workspace = workspace;
        this.courseLabel = courseLabel;
        this.teacherDisplayName = teacherDisplayName;
        this.createdAt = Instant.now();
    }

    @PrePersist
    void initialize() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    void close(Instant now) {
        if (closedAt == null) {
            closedAt = now;
        }
    }

    public UUID getId() {
        return id;
    }

    public TeacherWorkspace getWorkspace() {
        return workspace;
    }

    public String getCourseLabel() {
        return courseLabel;
    }

    public String getTeacherDisplayName() {
        return teacherDisplayName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getClosedAt() {
        return closedAt;
    }
}
