# Current inactive P/V validation

The unchanged repository export `validatePositiveGoalEvidenceRecordSemantics` validates the current P record against the goal in the raw 480-goal candidate, semantic kind `curricularAtomic`, and a resource dictionary whose sole URL is the goal primary image URL and whose value is the actual SHA-256 of the listed original inactive PNG. The checked current hash is `sha256:edf671ce57bceae95aac1bcab1a8293ad757e26cbd077e85bd8c3eea3f488dec`. The profile body is compared exactly with the reviewed raw record.

The unchanged `isGoalVisualizationAiApproved` export validates the own one-record V ledger: `assetSha256` and `aiApprovedAssetSha256` equal that exact prefixed hash; `aiApproved` is `yes`; `humanApproved` stays `no`.

P stays `ai_candidate` / `needs_human_review`, E1/G1, approved zero. Current image inspection was performed before FIRST. No active asset copy or changed validator was used. Terminal stdout contains the actual exported validator results; execution helpers remain outside curricula.
