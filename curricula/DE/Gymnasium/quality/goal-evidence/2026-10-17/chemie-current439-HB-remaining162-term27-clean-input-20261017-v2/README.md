# HB remaining162 / term27 — neutral finite review input

`INPUT.remaining162-term27.neutral.json` contains source ordinals **71–232**
and all **27 mandatory term sets**. Source goals, clause/operator/course/scope
information and original passages come from the pinned accepted HB232
inventory. Source fidelity is not reopened.

Only proposed union carrier UUIDs, component carrier sets and term-to-carrier
proposals are taken from authorship. Author decisions, rationales, deficit
assertions and independent verdicts are excluded. Empty proposal lists are not
coverage judgments. Ordinals **147/149** are explicitly marked as separately
running preliminary checks; no findings are imported.

## Whole bodies without repeated P439 copies

The input pins one central **C54** canonical file and the selected **P439 from
HB-five-paired-P-integration-v2**. The whole-body index records each UUID,
one-based canonical list position, one-based P record line, raw line SHA256
(including its line ending) and exact whole-goal/profile value SHA256.
Whole-value hash serialization is defined in the input. No full P439 copy is
created in this packet.

The input is about 670 kB. There are **207 unique proposed carriers**:

- 185 used by clause proposals; 148 used by term proposals.
- 33 overlap the previous 54-carrier input; three overlap the five updated
  profile inputs; the union overlaps **34** carriers.
- **173** fall outside those two earlier input sets.
- All 33 overlapping canonical goal bodies are identical to the previous
  54-carrier input; **31** profile bodies are also identical. Two overlapping
  profiles have the separately supplied P5 successors. All three overlapping
  P5 scientific profile bodies exactly match the selected current P439 bodies.

These are identity/read-reuse counts, not scientific completion or approval
counts. Reuse actual prior reading of identical full scientific bodies. Read
changed bodies and current context before making a new binding judgment.
Current P record wrappers do not turn reuse into native D/context approval.

## Read-only selector

From any checkout location, with Python 3:

```bash
python3 -B curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-HB-remaining162-term27-clean-input-20261017-v2/select_whole.py --ordinal 71
```

Repeat `--ordinal` to select several clauses, or use `--term-set 1` through
`--term-set 27`. The helper prints the source record, complete original passage
and each needed **whole** canonical goal and scientific P body once per call.
It verifies central files, positions, UUIDs and hashes before printing bodies.
`--summary` prints technical identity counts only.

To avoid reprinting an already read carrier, repeat `--seen GOAL_UUID` for the
actual UUIDs already read in full. The helper writes no state file. It omits
the P review-status/reason wrapper, not scientific profile content. Supply
`--seen` only for actual whole-body reading at the matching identity; it is not
an assertion of prior acceptance.

No new materials, profiles, source mappings, semantic goals, reviews or
completion claims are created. Canonical/active data and Git remain untouched;
the inputs are inactive candidates with final source/D/context integration
still separate. Topic choice, GK/LK, optionality and distinct BcP scope remain
as in the original source.
