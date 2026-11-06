package com.skillpilot.backend.identity;

/** Runtime identity projection: constructible only from a separately validated B capability. */
public final class GoalIdentityService {
    public enum Source { REPOSITORY, PACKAGE }
    public record SnapshotIdentity(Source source, String identity, String generationSha256) {
        public SnapshotIdentity {
            require(source != null && identity != null && !identity.isBlank(), "Missing snapshot identity");
            require(isSha(generationSha256), "Invalid snapshot generation");
        }
    }

    private final GoalIdentityMap identities;
    private final SnapshotIdentity snapshot;
    private final String sourceProofSha256;

    private GoalIdentityService(GoalIdentityProofLoader.ValidatedActivation activation, SnapshotIdentity active) {
        require(activation != null, "Missing validated activation receipt");
        require(activation.snapshot().equals(active), "Stale or foreign activation snapshot");
        identities = activation.identities(); snapshot = active; sourceProofSha256 = activation.sourceProofSha256();
    }

    public static GoalIdentityService fromValidatedActivation(
            GoalIdentityProofLoader.ValidatedActivation activation, SnapshotIdentity active) {
        return new GoalIdentityService(activation, active);
    }

    public String canonicalGoalId(String reference) { return identities.canonicalGoalId(reference); }
    public String storageGoalId(String reference) { return identities.storageGoalId(reference); }
    public SnapshotIdentity snapshot() { return snapshot; }
    public String sourceProofSha256() { return sourceProofSha256; }

    static boolean isUuid(String value) {
        return value != null && value.matches("(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}");
    }
    static boolean isSha(String value) { return value != null && value.matches("[0-9a-f]{64}"); }
    static void require(boolean condition, String message) {
        if (!condition) throw new GoalIdentityException(message);
    }
}
