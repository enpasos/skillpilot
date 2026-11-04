**1.** $G(p)$ is the probability of rejecting the null hypothesis when the true defect proportion is $p$. Because the rejection probability of these right-sided binomial rules increases with $p$, $G(0.10)$ is the maximum type-I error probability under the stated null: a defect proportion actually equal to $10\%$ is classified as elevated.

**2.** Approximate graph readings are:

| Candidate | $G(0.10)$ | $G(0.20)$ | $1-G(0.20)$ |
|---|---:|---:|---:|
| A | 0.03 | 0.75 | 0.25 |
| B | 0.03 | 0.96 | 0.04 |
| C | 0.08 | 0.98 | 0.02 |

The last column is an additional presentation of the same information, not another given dataset. A binomial calculation gives the more precise pairs $(0.0267488;0.7529855)$ for A, $(0.0291257;0.9575071)$ for B and $(0.0781078;0.9844063)$ for C. This precision is not required. Reading deviations of about $0.01$ are acceptable provided the correct sides of the relevant boundary lines are identified.

**3.** The requirements are
$$G(0.10)\le0.05,\qquad 1-G(0.20)\le0.10,$$
equivalently $G(0.20)\ge0.90$. Only **B** meets both. A satisfies the error limit at $p=0.10$, but its power at $p=0.20$ is only about $0.75$. C frequently detects the increased proportion, but rejects too frequently at $p=0.10$. The selected rule is to sample $160$ items randomly and reject $H_0$ when at least $24$ are defective. Its remaining probability of not rejecting at $p=0.20$ is about $4\%$.

**Partial credit:** 1 point each for rejection probability and type-I interpretation; 1 point for each of the six correctly associated values. A correctly associated, graph-supported bound that sufficiently establishes the required side of the relevant boundary also receives the full 1 point. Incomplete or insufficient readings, or readings only partly associated with the correct curve, still receive proportional credit; for example, a correct graph-based bound that remains too coarse for the relevant limit may receive 0.5 points. Award 1 point for each translated requirement; 1 for B with $n,k$, 1 each for rejecting A and C with reasons, and 1 for explaining that B satisfies both requirements. Correct bounds and reasons may appear entirely in a table.



**Ordinary overall grading:** Partial credit yields exactly one total score. After the ordinary cap stated below, compare it with the single passing threshold. There are no part-pass fields or additional prerequisite-evidence requirements.

Credit relevant work wherever it appears in the submission, including tables, sketches, calculations and concise comments. Wording matching the reference and duplicate explanations in separate parts are unnecessary. Mathematically equivalent methods are accepted. Deduct for a local arithmetic, graph-reading, sign or copying error specifically and only once; award correctly executed follow-through. One incorrect value does not mean an entire core action is absent. Do not assume work not shown. This rubric grades only the new task; it changes neither graph rules nor existing mastery.

The raw total ranges from 0 to 14; the single passing threshold is 11. Before comparing with the threshold, cap the total at 10 if the entire submission contains no identifiable mathematical interpretation of the actual given curves, entirely ignores either requirement, or contains no reasoned candidate selection. Calculated values associated with the actual curves, suitable bounds, complementary probabilities and concise table explanations all count. Missing decimal values, one reading error or an explanation placed elsewhere do not by themselves trigger the cap.

