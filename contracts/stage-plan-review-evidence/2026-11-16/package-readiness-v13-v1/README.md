# Explicit runtime 1.3 readiness selection

The evaluator now accepts the exact repository-pinned 1.3 contract directory
as an explicit option. The default remains the original runtime 1.0 policy.
The new report and policy retain all thirteen blocking checks and the unchanged
fifteen-check consumer runner. Old policy, schema and runner bytes are unchanged.

The original adversarial readiness suite and five focused 1.3 test methods pass,
including rejection of a missing human redistribution gate, a nonblocking
consumer gate, stale profile pins, false runtime identity and another runner.
An earlier manifest cannot become a current accepted package by selecting 1.3.
The selected contract is propagated to the separate validator process.

The global schema check initially rejected the restored authored source because
its draft goal array was mistaken for a runtime landscape. The correction
recognizes only its exact declared path and retained byte digest. No directory
or arbitrary goal collection is exempted; a modified byte fails. Its original
failure log remains beside the passing 120,706-file run.

These focused checks are not a full built-package consumer result, remote CI,
publication approval or deployment acceptance. Those remain separate evidence.
