package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** Persisted issue record for an opaque capability; never contains the handle itself. */
@Entity
@Table(name = "openai_de_bootstrap_capability")
public class OpenAiDeBootstrapCapability {

    @Id
    @Column(name = "capability_fingerprint", nullable = false, updatable = false, length = 64)
    private String capabilityFingerprint;

    @Column(name = "fingerprint_key_id", nullable = false, updatable = false, length = 80)
    private String fingerprintKeyId;

    @Column(name = "schema_version", nullable = false, updatable = false)
    private int schemaVersion;

    @Column(name = "contract_major", nullable = false, updatable = false)
    private int contractMajor;

    @Column(name = "purpose", nullable = false, updatable = false, length = 80)
    private String purpose;

    @Column(name = "oauth_authorization_ref", nullable = false, updatable = false, length = 100)
    private String oauthAuthorizationReference;

    @Column(name = "oauth_client_id", nullable = false, updatable = false, length = 512)
    private String oauthClientId;

    @Column(name = "resource", nullable = false, updatable = false, length = 512)
    private String resource;

    @Column(name = "scopes", nullable = false, updatable = false, length = 255)
    private String scopes;

    @Column(name = "provider_notice_version", nullable = false, updatable = false, length = 80)
    private String providerNoticeVersion;

    @Column(name = "source_major_decision", nullable = false, length = 40, updatable = false)
    private String sourceMajorDecision;

    @Column(name = "policy_revision", nullable = false, updatable = false)
    private long policyRevision;

    @Column(name = "issuance_revision", nullable = false, updatable = false, length = 160)
    private String issuanceRevision;

    @Column(name = "issued_at", nullable = false, updatable = false)
    private Instant issuedAt;

    @Column(name = "expires_at", nullable = false, updatable = false)
    private Instant expiresAt;

    @Column(name = "record_expires_at", nullable = false)
    private Instant recordExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private OpenAiDeBootstrapCapabilityStatus status;

    @Column(name = "terminal_code", length = 48)
    private String terminalCode;

    @Column(name = "invalidated_at")
    private Instant invalidatedAt;

    public String getCapabilityFingerprint() {
        return capabilityFingerprint;
    }

    public void setCapabilityFingerprint(String capabilityFingerprint) {
        this.capabilityFingerprint = capabilityFingerprint;
    }

    public String getFingerprintKeyId() {
        return fingerprintKeyId;
    }

    public void setFingerprintKeyId(String fingerprintKeyId) {
        this.fingerprintKeyId = fingerprintKeyId;
    }

    public int getSchemaVersion() {
        return schemaVersion;
    }

    public void setSchemaVersion(int schemaVersion) {
        this.schemaVersion = schemaVersion;
    }

    public int getContractMajor() {
        return contractMajor;
    }

    public void setContractMajor(int contractMajor) {
        this.contractMajor = contractMajor;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getOauthAuthorizationReference() {
        return oauthAuthorizationReference;
    }

    public void setOauthAuthorizationReference(String oauthAuthorizationReference) {
        this.oauthAuthorizationReference = oauthAuthorizationReference;
    }

    public String getOauthClientId() {
        return oauthClientId;
    }

    public void setOauthClientId(String oauthClientId) {
        this.oauthClientId = oauthClientId;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getScopes() {
        return scopes;
    }

    public void setScopes(String scopes) {
        this.scopes = scopes;
    }

    public String getProviderNoticeVersion() {
        return providerNoticeVersion;
    }

    public void setProviderNoticeVersion(String providerNoticeVersion) {
        this.providerNoticeVersion = providerNoticeVersion;
    }

    public String getSourceMajorDecision() {
        return sourceMajorDecision;
    }

    public void setSourceMajorDecision(String sourceMajorDecision) {
        this.sourceMajorDecision = sourceMajorDecision;
    }

    public long getPolicyRevision() {
        return policyRevision;
    }

    public void setPolicyRevision(long policyRevision) {
        this.policyRevision = policyRevision;
    }

    public String getIssuanceRevision() {
        return issuanceRevision;
    }

    public void setIssuanceRevision(String issuanceRevision) {
        this.issuanceRevision = issuanceRevision;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(Instant issuedAt) {
        this.issuedAt = issuedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getRecordExpiresAt() {
        return recordExpiresAt;
    }

    public void setRecordExpiresAt(Instant recordExpiresAt) {
        this.recordExpiresAt = recordExpiresAt;
    }

    public OpenAiDeBootstrapCapabilityStatus getStatus() {
        return status;
    }

    public void setStatus(OpenAiDeBootstrapCapabilityStatus status) {
        this.status = status;
    }

    public String getTerminalCode() {
        return terminalCode;
    }

    public void setTerminalCode(String terminalCode) {
        this.terminalCode = terminalCode;
    }

    public Instant getInvalidatedAt() {
        return invalidatedAt;
    }

    public void setInvalidatedAt(Instant invalidatedAt) {
        this.invalidatedAt = invalidatedAt;
    }
}
