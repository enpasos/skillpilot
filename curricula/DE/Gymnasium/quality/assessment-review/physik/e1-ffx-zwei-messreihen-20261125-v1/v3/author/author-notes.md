## Author notes – v3 (final candidate; no further version possible)

**Replaced strings.** This version replaces `solutionContent`, `solutionContentEn` and the 8 step descriptions, with the same ids in the same order. The importer separately sets:
- step maxima to 3, 3, 4, 2, 3, 3, 4, 2;
- `passingPoints` to 20;
- `maxPoints` to 24.

The task, metadata, sources and coverage are unchanged.

**Not done.** No learner script was seen or marked. No expected totals were set. No reviewer acceptance or release is claimed.

**Lengths.** Lengths were estimated, not machine-counted:
- about 1,250–1,550 UTF-16 units per bilingual description;
- the law descriptions are the longest;
- all are intended to be below 2,000.

Run a `.length` check before import.

**Authorship.** Authored by a native Anthropic Claude model. Account identity is intentionally omitted.

### Partial points per series R
| Criterion | Facets |
|---|---|
| Own data 3 | setup 1/0.5/0 · runs 1/0.5/0 · pairs 1/0.5/0 |
| Own g 3 | method 1/0.5/0 · runs (a)+(b) 1/0.5/0, without ĝ only (a) 1/0.5 · runs compared 0.5 + ĝ stated 0.5 · cap 0.5 without any graphical determination |
| Law 4 | completeness 1.5/1/0.5/0 for 0/1/2/≥3 deficiencies + correspondence 2.5/0 · no law 0.5/0 |
| Limits A 2 | uncertainty 1/0.5/0 · variation 0.5/0 · bounded statement 0.5/0 |
| Limits B 2 | uncertainty 0.5/0 · variation 0.5/0 · comparison 1/0.5/0 |
| Slips | −0.5 once, from the origin criterion's total, floor 0; absorbed if that total is already 0; never moved |

### Correction → final clause
| Correction | Final clause |
|---|---|
| Missing estimate vs variant results | Disclosed links: a missing ĝ costs exactly 3. Limits (1) and (2) apply one rule; a recomputed combined value suffices and unshown per-run values are never required or supplied |
| Shared slip at a zeroed origin | Minor slips: fixed criterion order, first occurrence, deduction from the criterion total, floor 0, absorbed at the origin, never moved, no change to component decisions |
| Pass scope / initial conditions | Completeness counts genuine implicit equation evidence (x_0, v_0). Location, direction and t=0 must be stated. Section 'What a pass establishes' |
| Double effect of missing estimate; effect of missing A on B | Disclosed links; A not attempted → comparison 0 (A total ≤11) |
| Uncertainty combination | Comparison (i): the sum always counts; quadrature needs a stated independence reason, separate treatment of shared terms, or a conclusion robust under the sum |
| EN cordon; scale wording | Setup interpretation and setup facet, identical in DE/EN |
| Result statement vs law application; coefficient compatible with runs but no label | Correspondence clause: 0 without ĝ, source stays open, completeness credited; result 0.5 is booked separately under own g |
| Book value as A in B comparison; sanction justification | Compared series values (assignment only, no provenance); comparison further rules; sanction justified as an evidential-integrity judgment, booked only in its series |
| Trailing-zero dependence | Equality rule: G = 2×t² coefficient; resolution taken from the number with trailing zeros removed (max 0.1); match if \|G−ĝ\| ≤ (r_G+r_ĝ)/2 |
| Time-zero accuracy | Release bracket paragraph; release check (i); special case = 1 deficiency, not a slip, not inferred |
| Fitted vs used runs; pooled fits | Own g (2)(a)/(b); joint-fit clause |

### Capacity (full marks elsewhere)
**Laws:**
- one coefficient mismatch: 21.5;
- two mismatches: 19;
- one mismatch + four slips: 19.5;
- four slips: 22;
- one law absent: 20.5 (20 without release check); both absent: ≤17.

**Estimates:**
- one ĝ missing: 21;
- both missing: 18;
- one ĝ missing + a mismatch in the other series: 18.5.

**Graphical determination:**
- absent in one series: 21.5;
- absent in both: ≤19;
- A graph absent with B law absent: ≤18;
- A graph absent with B mismatch: 19;
- mirrored cases the same.

**Other:**
- completeness 0 in both series: 21;
- A not attempted: ≤11;
- B not attempted, or a sanction in one series: ≤12.

Graph absence and correspondence loss each cost ≥2.5. A pass therefore admits at most one such event.

### Guaranteed vs open at ≥20
**Guaranteed:**
- own measured runs in both series;
- at least one series with an actual graphical determination and a law numerically equal to that series' explicitly stated own estimate;
- at most 4 points missing.

**May remain open:**
- explicit origin location, direction, event t=0 and release checks, in both series (the equation still fixes the x_0 and v_0 values it encodes);
- one boundary variation;
- a full uncertainty justification;
- the second law.

The solution states that claims about complete laws or initial conditions require the criterion profile.

### Remaining policy limitations (for the concept owner)
1. The fixed weights cannot secure explicit initial conditions in any series; completeness has 1.5 per series.
2. Correspondence is binary. A transcription error in the coefficient loses 2.5. A run-compatible coefficient without an explicit estimate earns 0, as mandated.
3. The number-only rounding rule changes the v2 example: 4.85 t² now matches ĝ = 9.73, because it is numerically identical to ½·9.7. In contrast, 4.9 t² (G = 9.8) does not match.
4. B uncertainty needs both bases for its 0.5; A has a 0.5 tier for one basis.
5. If A is not attempted, B's comparison is also lost.
6. A slip whose origin is in a zeroed criterion costs nothing.
7. The release-identification method may be defined once for both series. B still needs its own application and early points.
8. The marker computes u_A+u_B only to test a quadratic conclusion; no other recomputation is made.
