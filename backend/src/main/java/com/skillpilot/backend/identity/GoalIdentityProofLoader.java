package com.skillpilot.backend.identity;

/**
 * Runtime boundary B. No receipt can activate identity aliases until the actual
 * output/state/snapshot verifier is implemented and independently reviewed.
 * SourceIdentityProofVerifier is restricted to isolated QA candidate projection.
 */
public final class GoalIdentityProofLoader {
    public static final class ValidatedActivation {
        private final GoalIdentityMap identities;
        private final GoalIdentityService.SnapshotIdentity snapshot;
        private final String sourceProofSha256;
        private ValidatedActivation(GoalIdentityMap identities, GoalIdentityService.SnapshotIdentity snapshot,
                String sourceProofSha256) {
            this.identities = identities; this.snapshot = snapshot; this.sourceProofSha256 = sourceProofSha256;
        }
        GoalIdentityMap identities() { return identities; }
        GoalIdentityService.SnapshotIdentity snapshot() { return snapshot; }
        String sourceProofSha256() { return sourceProofSha256; }
    }

    public GoalIdentityService load(byte[] activationReceipt, GoalIdentityService.SnapshotIdentity activeSnapshot) {
        throw new GoalIdentityException("Runtime identity activation is unavailable: real output, state and snapshot receipt verification is not implemented");
    }
}
