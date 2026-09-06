# Technical integration of round A

Before accepting the dual summary, the integrator removed two mislabeled
optional entries from the newly produced run manifest. Their original roles
`review_input_json` and `finding_schema` referred to the outer evidence bundle,
but their hashes identified the description-review V3 input and record schema.
An attempted relabeling was rejected because those additional roles are not
part of the run schema. The two actual read artifacts remain recorded here:

- `description-review-input.json`: SHA-256
  `dcabfba6f2af75c5462988399ca23a5b0a706ef105768caf0551ee0479249866`.
- `contracts/goal-description-review-record.schema.json`: SHA-256
  `b1d5fe108f157ebcb3e6b5c5f0376b3f4d88da935fab9aab79fac8a49b50b7ff`.

The campaign independently binds that input and schema; the run retains its
required exact batch, prompt and criteria bindings plus the run-schema digest.
No input, record, decision, output digest, timestamp or generation claim changed.

The execution-parameters sidecar was moved byte-identically from `results/`
to `round-a/execution-parameters.physics-b033zb-blind-a-20260905.json`.
Its SHA-256 remains
`0be9baa848355d24d00af9b52eee604687fd5b346b58bf7b6fa49077f645833b`.
The strict result directory now contains only its expected run and JSONL pair.
These mechanical corrections confer no review or human-approval authority.
