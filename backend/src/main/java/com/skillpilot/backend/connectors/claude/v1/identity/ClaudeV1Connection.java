package com.skillpilot.backend.connectors.claude.v1.identity;

import java.time.Instant;
import java.util.Objects;

/**
 * A durable link between one Claude client authorization and one pseudonymous SkillPilot learner.
 *
 * <p>{@code skillpilotId} is server-side only: it is required to call the canonical coach facade,
 * and it is never returned to Claude, placed in a tool argument, or used as the OAuth subject. The
 * opaque {@code id} is the subject Claude sees. {@code learnerIdHash} exists so operational
 * queries and audits can correlate connections without reading the permanent identifier.</p>
 */
public record ClaudeV1Connection(
        String id,
        String skillpilotId,
        String learnerIdHash,
        String registeredClientId,
        String status,
        Instant createdAt,
        Instant lastActivityAt) {

    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_REVOKED = "REVOKED";

    public ClaudeV1Connection {
        Objects.requireNonNull(id, "id");
        skillpilotId = skillpilotId == null ? "" : skillpilotId;
        learnerIdHash = learnerIdHash == null ? "" : learnerIdHash;
        Objects.requireNonNull(registeredClientId, "registeredClientId");
        Objects.requireNonNull(status, "status");
        Objects.requireNonNull(createdAt, "createdAt");
        Objects.requireNonNull(lastActivityAt, "lastActivityAt");
    }

    public boolean isActive() {
        return STATUS_ACTIVE.equals(status);
    }

    @Override
    public String toString() {
        // Prevents the permanent learner id from reaching a log line through an accidental
        // string interpolation of the record.
        return "ClaudeV1Connection[id=" + id + ", status=" + status + "]";
    }
}
