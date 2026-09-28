# Two reworded Mathematics goals: current P-v2 binding

This package binds current DE/EN goal wording and the **unchanged** active JPGs
for two already illustrated curricularAtomic goals. The older candidate and
review packages remain intact. `materialize-candidates.mjs` SHA-pins the exact
older candidate files, verifies both current descriptions, and changes only
the affected example/evidence language. The generated P-v2 records are
`needs_human_review / ai_candidate`, E1/G1; they are not human approval.

- `09f47964…`: the current goal concerns the one-value-per-input function
  concept and correspondence of a **given** function's term, table and graph.
  The old P example inferred a term from a finite graph/table. Its replacement
  instead starts from a given rule, then tests agreement and detects a wrong
  table entry in a second given function. The active illustration presents
  one consistent `f(x)=2x` case; it does not prove uniqueness of a rule from
  finitely many points.
- `0e8417d7…`: the new qualifier *geeigneter* / *suitable* is respected. The
  existing cases `x e^x` and `(2x+1)e^(x²+x)` have verified elementary
  antiderivatives and independently test product structure versus the reverse
  chain rule. The profile makes no claim about arbitrary combinations.

Both asset SHA-256 values are bound in the P-v2 review input. The exact-image
review and 360-pixel preview are documented in
`../../../goal-visualization-review/mathematik-two-reworded-image-qa-2026-09-27.md`.
No image bytes were generated or changed. The image QA ledger retains prior
human/AI history; this package adds a current AI reinspection, not a new human
decision.

The earlier 12-goal and five-goal P bundles remain immutable. Their other
11 and four byte-identical review records are respectively retained by
`retained-first15-eleven.config.json` and `retained-q4-four.config.json`.
`materialize-retained-reviews.mjs` pins both historical source-file digests
and checks those derived slices. The two reworded IDs move only to this
package's current two-goal P review; no record is silently duplicated in the
central registry.

From the repository root:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-reworded-image-bound-current-v1/materialize-candidates.mjs
node curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-reworded-image-bound-current-v1/materialize-retained-reviews.mjs
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-reworded-image-bound-current-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-reworded-image-bound-current-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-reworded-image-bound-current-v1/positive-evidence.config.json
npm --prefix app run check:goal-visualization-qa -- --subject mathematik
```
