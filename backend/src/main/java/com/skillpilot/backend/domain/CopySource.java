package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

@Embeddable
public class CopySource implements Serializable {

    @Column(name = "source_id", nullable = false)
    private String sourceId;

    @Column(name = "copied_at", nullable = false)
    private Instant copiedAt;

    public CopySource() {
    }

    public CopySource(String sourceId, Instant copiedAt) {
        this.sourceId = sourceId;
        this.copiedAt = copiedAt;
    }

    public String getSourceId() {
        return sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }

    public Instant getCopiedAt() {
        return copiedAt;
    }

    public void setCopiedAt(Instant copiedAt) {
        this.copiedAt = copiedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        CopySource that = (CopySource) o;
        return Objects.equals(sourceId, that.sourceId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sourceId);
    }
}
