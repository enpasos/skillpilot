package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class OpenAiDeIdempotencyKey implements Serializable {

    @Column(name = "token_hash", nullable = false, length = 128)
    private String tokenHash;

    @Column(name = "client_request_id", nullable = false, length = 64)
    private String clientRequestId;

    protected OpenAiDeIdempotencyKey() {
    }

    public OpenAiDeIdempotencyKey(String tokenHash, String clientRequestId) {
        this.tokenHash = tokenHash;
        this.clientRequestId = clientRequestId;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public String getClientRequestId() {
        return clientRequestId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof OpenAiDeIdempotencyKey key)) {
            return false;
        }
        return Objects.equals(tokenHash, key.tokenHash)
                && Objects.equals(clientRequestId, key.clientRequestId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tokenHash, clientRequestId);
    }
}
