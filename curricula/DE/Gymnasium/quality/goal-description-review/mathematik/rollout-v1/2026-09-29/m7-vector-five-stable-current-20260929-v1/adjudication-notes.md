# Current-context adjudication notes: vector five

This AI review package is a machine-QS candidate, not a human approval. It is
bound to the current 807-goal Canon and the current GoalBook/source/page/image
context. Round A had access to the historical vector-eight review as background;
Round B was independently run without Round A, the historical vector-eight
records, or the seven-goal delta audit. Both native campaign validators passed
all five records. The dual summary is in `dual-summary.json`.

| Goal | Round A | Round B | Current adjudication |
| --- | --- | --- | --- |
| `571793bd` scalar multiplication | KEEP | KEEP | Current text is supported; manifest-bound strict resolution materialized. |
| `c63bbffd` addition/subtraction | KEEP | REVISE | Keep open for the precise inverse-operation wording below. |
| `72dfc164` linear combinations | KEEP | KEEP | Current text is supported; manifest-bound strict resolution materialized. |
| `54cfe5ce` spatial collinearity | KEEP | REVISE | Keep open for the zero-vector and geometric-direction boundary below. |
| `fb7a4fa0` spatial magnitude | KEEP | KEEP | Current text is supported; manifest-bound strict resolution materialized. |

For `c63bbffd`, Round A correctly explained subtraction as addition of the
opposite vector in its evidence profile, but the current learner-facing text
only says “rückgängig gemachte Verschiebung” / “reversed displacements”. It
does not identify which movement is reversed. Round B's local replacement is
mathematically clearer without changing the source scope or splitting the
competence:

> Die lernende Person kann Vektoren in Ebene und Raum komponentenweise addieren
> und subtrahieren und geometrisch erklären, dass Addition Verschiebungen
> verknüpft und Subtraktion die Addition des Gegenvektors ist.

> The learner can add and subtract vectors in the plane and in space
> component-wise and explain geometrically that addition combines
> displacements and subtraction adds the opposite vector.

For `54cfe5ce`, the current text asks for a geometric justification for any
pair of spatial vectors, while the zero vector has no direction. Round A's
evidence silently restricted its directional argument to nonzero vectors.
Round B made that mathematical boundary explicit and avoids unchecked
component quotients. Its proposed local replacement is:

> Die lernende Person kann anhand skalarer Vielfachheit der Komponenten prüfen,
> ob zwei Vektoren im Raum kollinear sind, den Nullvektor dabei gesondert
> berücksichtigen und die Entscheidung für zwei von null verschiedene
> Vektoren geometrisch deuten.

> The learner can use scalar-multiple relationships between components to
> test whether two vectors in space are collinear, handle the zero vector
> separately, and interpret the result geometrically when both vectors are
> nonzero.

These two revisions are not yet operative Canon text. Changing them requires
targeted current-context reviews and rebinding of affected evidence. They must
not be counted as strict D completions. The separate `d1352ce0` and `235ae698`
image defects were intentionally excluded from this package for their own
image-first review.

The `resolution-index.json` explicitly lists the two unresolved REVISE goals
as deferred and contains only the three KEEP/KEEP resolutions. Its standalone
`finalize` check passed. Central registry integration and the resulting live
five-gate count are separate steps.
