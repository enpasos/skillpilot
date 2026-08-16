# Goal-description authoring approvals

This directory contains durable, fingerprint-bound authoring change sets for
human-approved learning-goal description revisions. A change set records the
review-time German and English text, the exact approved replacements, the
original goal and page fingerprints, the source-reconciliation digest, and the
verbatim approval instruction.

The records are deliberately narrower than the AI review-record schema. They
do not promote temporary understanding, observable-performance, transfer, or
evidence-profile candidates. They also do not approve graph changes, images,
memory-card decisions, semantic classifications, publication, deployment, or
the frozen OpenAI Coach V1 contract. Those lanes retain their own review and
fingerprint requirements.

Validate the committed receipt against the current canonical graph with:

```bash
node curricula/DE/Gymnasium/quality/goal-description-review/validate-authoring-change-set.mjs
```

While the ignored review workspace is still available, also verify every
record against the exact reconciliation source:

```bash
node curricula/DE/Gymnasium/quality/goal-description-review/validate-authoring-change-set.mjs --require-source
```

`changeSetDigest` is SHA-256 over recursively key-sorted JSON after removing
the top-level `changeSetDigest` field.

