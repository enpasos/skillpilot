package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "openai_de_idempotency")
public class OpenAiDeIdempotencyRecord {

    @EmbeddedId
    private OpenAiDeIdempotencyKey id;

    @Column(name = "tool_name", nullable = false, length = 128)
    private String toolName;

    @Column(name = "request_hash", nullable = false, length = 64)
    private String requestHash;

    @Column(name = "completed_state_version", nullable = false)
    private long completedStateVersion;

    @Column(name = "response_text", nullable = false, columnDefinition = "TEXT")
    private String responseText;

    @Column(name = "response_json", nullable = false, columnDefinition = "TEXT")
    private String responseJson;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public OpenAiDeIdempotencyKey getId() {
        return id;
    }

    public void setId(OpenAiDeIdempotencyKey id) {
        this.id = id;
    }

    public String getToolName() {
        return toolName;
    }

    public void setToolName(String toolName) {
        this.toolName = toolName;
    }

    public String getRequestHash() {
        return requestHash;
    }

    public void setRequestHash(String requestHash) {
        this.requestHash = requestHash;
    }

    public long getCompletedStateVersion() {
        return completedStateVersion;
    }

    public void setCompletedStateVersion(long completedStateVersion) {
        this.completedStateVersion = completedStateVersion;
    }

    public String getResponseText() {
        return responseText;
    }

    public void setResponseText(String responseText) {
        this.responseText = responseText;
    }

    public String getResponseJson() {
        return responseJson;
    }

    public void setResponseJson(String responseJson) {
        this.responseJson = responseJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
