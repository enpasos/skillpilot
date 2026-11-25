## Author notes – v1 (sole candidate of this request)

**Changed fields only:** `examData.solutionContent`, `examData.solutionContentEn`, `examData.scoring.passingPoints` (23 → 20), and `examData.scoring.steps[0..7].description`. Step ids, order, 3-point maxima, `maxPoints` 24, `reviewStatus`, `taskContent`/`taskContentEn`, `reviewNote`, `coveredGoalIds`, `coveredStrands`, `demandLevels` and `sourceArtifactPath` are byte-for-byte the baseline values. In both solution texts the two explanatory physics paragraphs are retained. The only edit there is a typo fix in EN paragraph 2 (`At120` → `At 120`). The obsolete 23/24 grading paragraph is replaced by the complete marking text. No task wording change; no new acceptance is claimed. The reviewNote is kept as historical metadata.

**Partial-point table (per series R = A/B, 3 points per criterion):**

| Criterion | Facets (lowest applicable level per facet) |
|---|---|
| Own data | setup 1/0.5/0 · runs 1/0.5/0 · pairs 1/0.5/0 |
| Own g | method 1/0.5/0 · scope over valid runs 1/0.5/0 · run comparison 0.5 + explicitly stated own estimate 0.5 |
| Law | P (release check) 1/0.5/0 · E (x_0, direction, t=0, v_0) 1 / 0.5 if one missing / 0 if ≥2 missing; equal → 1+P+E; different or no own estimate → min(1; P+E); no law or no t² term → P |
| Limits A | uncertainty 1/0.5/0 · boundary variation 1/0.5/0 · bounded statement 1/0.5/0 |
| Limits + comparison B | uncertainty 1/0.5/0 · variation 0.5/0 · bounded statement 0.5/0 · quantitative A/B comparison 1/0.5/0 |

The explicit law row works as follows when the coefficient is equal:
- Missing release check: 2.
- One missing element among origin, time origin, direction and v_0: 2.5.
- Two missing elements: 2.
- Missing law: P.

When the coefficient differs, or no own estimate is stated, the law row gives exactly 1, provided P and E are otherwise complete.

Global rules:
- A series that is not attempted scores 0 for that series.
- An evidenced maintained misconception scores 0 for that series.
- Each isolated slip costs 0.5 once, at its origin; consistent follow-on errors are not deducted again.
- Missing evidence is a gap under the tables, not a slip.
- Pass mark is 20/24. There is no other pass condition.

**Why the law/estimate separation avoids double deduction:**
- *Own g* judges how the estimate was obtained: method, how many and which runs, comparison of runs, and whether an estimate is stated.
- The law criterion only compares two explicitly written numbers: the law coefficient (or half of it, if written as g/2) and the stated own estimate of the same series. The comparison uses a half-last-digit tolerance and explicitly excludes uncertainty overlap.
- Adding runs can therefore change *own g* but cannot change the law score, as long as the equation and the stated estimate stay unchanged.
- The precedence clause sends any law/estimate difference exclusively to the law table, never to the slip rule.
- The only intended cross-link is the existence of an explicitly stated estimate, which the concept fixes as the law's reference number. Without a stated estimate, *own g* loses 0.5 and the law is capped at 1. The quality of the estimate never enters the law score.
- A joint A+B fit is evidence only for B's comparison facet.

**2,000-unit limit:** each step description is drafted DE+EN at roughly 1,600–1,850 UTF-16 units, with no surrogate-pair characters. I had no tools here, so these counts are estimates, not machine-verified. Run a mechanical `.length` check before release; the law descriptions are the longest.

**Released clauses supporting the required future blind cases** (no scripts or totals created here):
1. *Four small slips:* clauses `Kleine Versehen`/`Minor slips` and `Reihenfolge`/`Order` step 4 apply. Each slip costs 0.5 once at its origin and follow-on errors are free, leaving the 4-point slack intact.
2. *One missing facet:* the facet tables apply. Any single facet costs at most 1, except the law-equality facet, which costs 2 (2.5 if the stated estimate is also absent). All of these stay within the slack.
3. *B entirely absent:* clause `Nicht bearbeitete Untersuchung` applies. B scores 0, so the maximum total is 12.
4. *Maintained misconception:* the three-part visible-evidence clause (a)–(c) applies, and `Order` step 2 removes that series' 12 points. The script must visibly contain:
   - the self-identified inserted value presented as measured;
   - a documented pointing-out of the task instruction;
   - later retention of the claim.
   Without all three, the script is marked normally.
5. *Own stated estimate is 9.81 and used in the law:* the law row `Gleich (auch 9,81 m/s²)` applies, giving 1+P+E. The derivation is judged only under *own g*.
6. *Law coefficient differs from the stated estimate:* the law row gives min(1; P+E), which is exactly 1 when P and E are otherwise complete. The no-slip precedence applies.
7. *No own estimate but a plausible law value:* the same law row applies, together with the rule that the source of a number is never inferred. In addition, the stated-estimate part of *own g* (3) is 0.
8. *Joint A+B fit:* three clauses apply.
   - `Zuordnung` and the comparison rule: a joint A+B value is not a series estimate.
   - B limits (4): the joint fit counts only as additional comparison evidence.
   - *Own g* (2): a joint fit within one series remains a valid route to that series estimate.

**Open points for reviewers:**
- B's boundary variation is weighted 0.5 (A's is 1) to fit the A/B comparison into B's 3 points.
- The rule that the last-stated series estimate counts is a deterministic tie-break.
- The half-last-digit tolerance accepts a coarse estimate (for example, one stated only to the units place) as equal to a finer coefficient. Over-precision is handled as a rounding slip.
