package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;

/**
 * One irreversible capability/request binding.
 *
 * <p>No SkillPilot ID, capability, learning-session token, request body or
 * plaintext response is persisted here.</p>
 */
@Entity
@Table(name = "openai_de_bootstrap_launch_attempt")
public class OpenAiDeBootstrapLaunchAttempt {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 36)
    private String id;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    @Column(name = "contract_major", nullable = false, updatable = false)
    private int contractMajor;

    @Column(name = "capability_fingerprint", nullable = false, updatable = false, length = 64)
    private String capabilityFingerprint;

    @Column(name = "capability_fingerprint_key_id", nullable = false, updatable = false, length = 80)
    private String capabilityFingerprintKeyId;

    @Column(name = "oauth_authorization_ref", nullable = false, updatable = false, length = 100)
    private String oauthAuthorizationReference;

    @Column(name = "capability_expires_at", nullable = false, updatable = false)
    private Instant capabilityExpiresAt;

    @Column(name = "client_request_id", nullable = false, updatable = false, length = 36)
    private String clientRequestId;

    @Column(name = "request_hmac_key_id", nullable = false, updatable = false, length = 80)
    private String requestHmacKeyId;

    @Column(name = "request_hmac", nullable = false, updatable = false, length = 64)
    private String requestHmac;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private OpenAiDeBootstrapAttemptStatus status;

    @Column(name = "terminal_code", length = 48)
    private String terminalCode;

    @Column(name = "response_schema_version")
    private Integer responseSchemaVersion;

    @Column(name = "response_key_id", length = 80)
    private String responseKeyId;

    @Column(name = "response_nonce", length = 64)
    private String responseNonce;

    @Column(name = "response_ciphertext", columnDefinition = "TEXT")
    private String responseCiphertext;

    @Column(name = "response_expires_at")
    private Instant responseExpiresAt;

    @Column(name = "attempt_retry_until", nullable = false)
    private Instant attemptRetryUntil;

    @Column(name = "bound_at", nullable = false, updatable = false)
    private Instant boundAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "record_expires_at", nullable = false)
    private Instant recordExpiresAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public long getVersion() {
        return version;
    }

    public int getContractMajor() {
        return contractMajor;
    }

    public void setContractMajor(int contractMajor) {
        this.contractMajor = contractMajor;
    }

    public String getCapabilityFingerprint() {
        return capabilityFingerprint;
    }

    public void setCapabilityFingerprint(String capabilityFingerprint) {
        this.capabilityFingerprint = capabilityFingerprint;
    }

    public String getCapabilityFingerprintKeyId() {
        return capabilityFingerprintKeyId;
    }

    public void setCapabilityFingerprintKeyId(String capabilityFingerprintKeyId) {
        this.capabilityFingerprintKeyId = capabilityFingerprintKeyId;
    }

    public String getOauthAuthorizationReference() {
        return oauthAuthorizationReference;
    }

    public void setOauthAuthorizationReference(String oauthAuthorizationReference) {
        this.oauthAuthorizationReference = oauthAuthorizationReference;
    }

    public Instant getCapabilityExpiresAt() {
        return capabilityExpiresAt;
    }

    public void setCapabilityExpiresAt(Instant capabilityExpiresAt) {
        this.capabilityExpiresAt = capabilityExpiresAt;
    }

    public String getClientRequestId() {
        return clientRequestId;
    }

    public void setClientRequestId(String clientRequestId) {
        this.clientRequestId = clientRequestId;
    }

    public String getRequestHmacKeyId() {
        return requestHmacKeyId;
    }

    public void setRequestHmacKeyId(String requestHmacKeyId) {
        this.requestHmacKeyId = requestHmacKeyId;
    }

    public String getRequestHmac() {
        return requestHmac;
    }

    public void setRequestHmac(String requestHmac) {
        this.requestHmac = requestHmac;
    }

    public OpenAiDeBootstrapAttemptStatus getStatus() {
        return status;
    }

    public void setStatus(OpenAiDeBootstrapAttemptStatus status) {
        this.status = status;
    }

    public String getTerminalCode() {
        return terminalCode;
    }

    public void setTerminalCode(String terminalCode) {
        this.terminalCode = terminalCode;
    }

    public Integer getResponseSchemaVersion() {
        return responseSchemaVersion;
    }

    public void setResponseSchemaVersion(Integer responseSchemaVersion) {
        this.responseSchemaVersion = responseSchemaVersion;
    }

    public String getResponseKeyId() {
        return responseKeyId;
    }

    public void setResponseKeyId(String responseKeyId) {
        this.responseKeyId = responseKeyId;
    }

    public String getResponseNonce() {
        return responseNonce;
    }

    public void setResponseNonce(String responseNonce) {
        this.responseNonce = responseNonce;
    }

    public String getResponseCiphertext() {
        return responseCiphertext;
    }

    public void setResponseCiphertext(String responseCiphertext) {
        this.responseCiphertext = responseCiphertext;
    }

    public Instant getResponseExpiresAt() {
        return responseExpiresAt;
    }

    public void setResponseExpiresAt(Instant responseExpiresAt) {
        this.responseExpiresAt = responseExpiresAt;
    }

    public Instant getAttemptRetryUntil() {
        return attemptRetryUntil;
    }

    public void setAttemptRetryUntil(Instant attemptRetryUntil) {
        this.attemptRetryUntil = attemptRetryUntil;
    }

    public Instant getBoundAt() {
        return boundAt;
    }

    public void setBoundAt(Instant boundAt) {
        this.boundAt = boundAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public Instant getRecordExpiresAt() {
        return recordExpiresAt;
    }

    public void setRecordExpiresAt(Instant recordExpiresAt) {
        this.recordExpiresAt = recordExpiresAt;
    }

    public void clearExpiredDelivery() {
        responseKeyId = null;
        responseNonce = null;
        responseCiphertext = null;
    }
}
