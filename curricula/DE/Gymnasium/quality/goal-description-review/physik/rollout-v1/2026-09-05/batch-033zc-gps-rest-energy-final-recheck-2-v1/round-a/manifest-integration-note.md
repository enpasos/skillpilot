# Round A manifest integration correction

On 2026-09-06, integration found that the reviewer had listed the supplied
`contracts/goal-description-review-record.schema.json` under the outer review
bundle's `finding_schema` role. Those are different contracts. The incorrectly
labelled optional entry was removed; it was not replaced with a claim that the
reviewer read the outer finding schema. The description-record schema remains
part of the supplied campaign context, with SHA-256
`b1d5fe108f157ebcb3e6b5c5f0376b3f4d88da935fab9aab79fac8a49b50b7ff`.

The batch input, prompt, criteria and run-manifest schema bindings remain
unchanged. No description record, judgment, evidence text, run identity,
independence group, execution parameter or timestamp was altered. The original
records digest remains
`sha256:26e3f5cbbd6c7ac1f4d3c297fe18b3784862b663935be3b7c9a5d7c984e11d26`.
This is a transport-metadata correction, not a new review or acceptance.

Both reviewers also renamed their own files byte-identically to the exact
campaign batch stems required by the existing loader. No validation rule was
relaxed.
