# Native20 administrative ownership audit

The fresh main and F stock ledger loads both passed (exit 0): 15 active configs, 171 ordered claims. The ledger bytes and all 15 config bytes match across main and F. Ledger SHA-256: `5009d76ffc70449b9df727161c5499277115b72830b59793f489c25add17f72a`.

The JSON contains all old claim IDs and full original config metadata, including exact lexical and resolved paths, output paths, existing output artifacts, and temp directory observations. Fourteen configured outputs are absent. Only the historical d8 batch output exists; its content was not read.

Two fresh local /proc snapshots observed zero processes whose command/cwd matched scoped old config/output/temp paths and zero matching writable file descriptors. The current four-agent tree was observed twice. These bounded observations are not ownership locks, cannot guarantee future inactivity, and do not enumerate other conversations or hosts. Parent authorization permits the selected20 administrative handoff only inside the new capsule. No claims, configurations, F, main, historical capsules, or source files were changed by this audit.

Stock API: `loadGoalDescriptionRolloutInFlightLedger(configuredPath = DEFAULT_GOAL_DESCRIPTION_ROLLOUT_IN_FLIGHT_LEDGER_PATH)`, exported by `app/scripts/materializeGoalDescriptionRolloutBatch.ts` at lines 301–336. It validates the ledger and each referenced config and rejects duplicate subject/base/goal claims. It returns `ledger`, `ledgerBytes`, `ledgerPath`, `activeBatches`. Repository root follows the module file URL; changing cwd does not change it. Every listed config remains active regardless of output existence or historic completion. The schema contains no status/state fields.

The only executed stock function was this named ledger loader on main and F. No content selection, prepare, renderer, central, compiler, PDF, review, or science judgment was executed. All 38 source pins were rechecked unchanged after the loader completed.
