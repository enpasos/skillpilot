# NI learner-view adoption: inactive, reviewed-data proposal

This is a necessary follow-up to the NI18 integration. The actual current NI source atlas includes all eighteen subject goals. Its curricular-atomic source view excludes memory nodes. The existing learner-facing SekI and CrossStage/GK composition views did not yet reference the new NI supplement, so the old isolated candidate visibility views did not establish learner-view adoption.

## Exact proposed changes

Append only the existing canonical subtree `9cd0dbbc-9507-5879-8c4f-df54529969ec` after the final existing SekI subtree in each of:

- `curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json`, inside `biology-seki`.
- `curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json`, the existing CrossStage/GK reference view.

Each original line is retained, with only one comma and one subtree line added. The subtree has 21 nodes: one cluster, eighteen subject goals, and two memory goals. Every new node has explicit jurisdiction `DE-NI`; the source scopes are SekI and the whole actual source clauses retain their grade bands. No new SekII or LK offering is created. The actual backend selects committed learner views only when the stage anchor matches exactly. The existing CrossStage reference remains CrossStage. Existing scopes, projection roles, all old targets, motivation and canonical prerequisite edges are unchanged.

The two memory goals are `1a7d8063-5b3b-55fd-b8ea-8701d876888e` and `b00dd3d9-8589-584c-a8cf-12efb4856dfe`, linked to the ordinary required-memory goals `87ce1746-9904-56ad-9705-ffabbd918c5b` and `9425347d-25bd-5095-9198-7574f255c938`. Both current canonical decks and all actual DE/EN cards remain byte-exact.

The new additive `full-memory.current-learner-views.config.json` uses the unchanged, frozen current383 memory/card science ledgers, the two actual learner-view paths, and `visibilityScopeCoverageRequired:true`. The default Biology memory config is proposed to use exactly the same scopes and current ledgers. The only registry change is Biology's memory-config path. The exact raw registry splice preserves every other registry byte.

## Actual focused results

- Native composition compilation: no errors and no new findings; SekI whole targets147→168, existing CrossStage/GK415→436.
- Both actual composition-role collectors and filters: only NI gains the21-node branch over2views×16jurisdictions×2duration compatibility filters×2course filters. All old targets and roles are retained.
- All20 new ordinary/memory nodes have every transitive prerequisite visible in the NI/SekI learner view, including the existing motivation anchor.
- The existing46 Biology/Chemistry projection contracts: only NI Biology G8/G9 compatibility-test counts change88→108, adding exactly18 ordinary goals plus2memory goals. All other44 complete target-ID sets remain exact. The normative NI duration policy remainsG9; measuring the existing G8 compatibility contract makes no curricular G8 claim.
- Final native memory checker Exit0:383 current decisions,10 memory-required decisions,3 traced memory goals,3 canonical decks,6 localized deck files,54 localized card rows,27 kept primary cards,2 actual learner-view scopes,17 visible required-memory occurrences,0 missing/stale/untraced/visibility issues.
- Two negative native witnesses, separately excluding each new memory node from both proposed views: expected Exit1 and two corresponding per-view visibility issues. Inputs restored afterward. Final native check uses the minimal-line candidate bytes.
- Actual native current-versus-prospective full-book comparison: every whole383 page is exact, current original-source exports are exact, all67 current strict IDs are protected, and71 authorizing input files are byte-exact. No D/P/A/V science data or M/card decision row changes.
- Unmodified generic active-memory-config discovery against all10 current default configs and the exact future registry: Exit0. Other registry subjects are exact.

The first source-consumer comparison failed because the small temporary input root lacked the read-only `mapping` alias. Its stdout/stderr/Exit1 receipt is preserved. Adding that input alias allowed the second actual comparison to pass; no source data, checker rule or evidence gate was changed.

## Integration handoff

`guarded-exact-five-destination-adoption-plan.candidate.json` contains exact before/after SHA256s, candidate paths, and the five destinations. Root must independently review the two whole views and the scope proof before applying. It must then perform the actual current central/M/config-discovery/composition/projection/maturity checks and regenerate the native current memory audit. No application has occurred in this dossier.

The Q1-three author task stopped at four input snapshots; their exact hashes are preserved in `q1-paused-four-inputs.actual.freeze.json`. No Q1 science or native book was generated.

This work adds0 scientific closures and claims no human approval, human trial, learner observation, backend API/Java test, release, or publication. Existing67 strict Biology closures and all other subject quality floors stay protected. Physical code stays in ignored `tmp/biologie-ni-current-learner-view-adoption-candidate-v1-native-root`; sources, history, decks and assets are read-only aliases, with no full repository or asset copies.
