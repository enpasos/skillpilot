# J5 right-angle image hold: retain unaffected P-v2 records

The active image for `2231c29b-eb4e-51ae-9cb1-eb033bf16099` had a visually
false right-angle marking. Its current visualization was removed and archived
under `quality/goal-visualization-review/mathematik-2231-right-angle-hold-20260924-v1/`.
That changed its page input fingerprint, so the prior 20-record P-v2 owner
cannot remain active as one unit. The held goal is **not** accepted or counted.

`materialize-retained-nineteen.mjs --write` copies the other 19 JSONL records
byte-for-byte in their original order. It pins the old config and review SHA-256
values and verifies exact record IDs and AI-candidate statuses. Running the
script without `--write` checks the generated outputs. The original 20-record
package is left untouched. No human approval is asserted.
