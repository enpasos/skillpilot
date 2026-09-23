# Independent substantive check of proof/problem P candidates

Reviewed: 2026-09-21, completed against the source snapshot recorded at 21:12:39 UTC.

Reviewer: Codex independent review agent `/root/oer_compact_tests`, separate from the root agent that authored the candidates. Exact serving model/revision is not exposed; this does **not** claim model diversity.

## Scope and result

All 20 positive-understanding profiles and all 40 bilingual application cases were read against their current canonical goals. All 19 active goal images were actually opened to check whether a purported demonstration merely repeats the teaching example. Goal `1e164a09-0a2b-55ab-b927-08a4a278f72b` has no current image. This is a bounded **P-content countercheck**, not a third D round, a new V adjudication, a human approval, or a global completion report.

**Result: three targeted revisions are required.** Seventeen profiles have no substantive P finding in this review; three profiles have one affected case each. This is not a claim that 17 goals have completed all five gates. In particular, the existing D holds remain independent of this review. One new P finding affects the previously integrated `current17` subset and must not be overlooked merely because its D review passed.

- `c5ea9b97-746f-5e8b-9fe1-26a8406ac3a9`: the first contradiction case repeats the complete proof displayed in its own image. This goal belongs to `current17`.
- `01217f4a-5221-5df9-b379-7b241fccf809`: the second strategy case repeats the image's summation identity and highlighted method. This goal already has a D hold.
- `a288231e-e4bb-5c65-b018-b79a51ca87d8`: the fence case expects an equality although the prompt only states availability of material. This goal already has a D hold.

No original candidate, materialized record, canonical goal, image, central registry, or in-flight ledger was changed by this reviewer. Corrected profiles must be authored in a new version and rechecked; the original review snapshot remains intact.

## Exact reviewed sources

Paths are repository-relative. SHA-256 values below describe the bytes reviewed, not a substitute for the substantive observations that follow.

| Source | SHA-256 |
| --- | --- |
| `curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-m7-proof-problem20-20260921-v1.candidates.json` | `667cef30ab3f5cf6700f72036e3b77a4921307274eea0b2568a5a3d32a31be28` |
| `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json` | `ee31c20e64a2584c3be3a6fcacfe32a2d55bf95f079dbeb0234d1b06dffc47c6` |
| `curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md` | `12063457ee847a35af2b29f203ff7dbc9a383f91cf4fafc3a5162015d73a4816` |

The candidate authoring timestamp is `2026-09-21T20:56:00.908Z`. Each profile is an E1/G1 AI candidate; two independent demonstrations, fresh variation and independent transfer are explicitly required. These flags describe the intended contract, not proof that the authored examples meet it.

The separate integration receipt `integration-current-17.receipt.json` records 17 D integrations and excludes `f84ea3d8-c255-552a-998a-202e42843f56`, `01217f4a-5221-5df9-b379-7b241fccf809`, and `a288231e-e4bb-5c65-b018-b79a51ca87d8`. This countercheck does not alter those D decisions. It reports the newly found P issue for `c5ea9b97` to the integrating author.

## Findings and bounded correction recommendations

### P-01 — An entire visible proof is reused as an independent demonstration

- Goal: `c5ea9b97-746f-5e8b-9fe1-26a8406ac3a9`, **Beweis durch Widerspruch**.
- Case: `no-smallest-positive`.
- Mathematical validity: correct. Assuming a smallest positive real number r gives `0 < r/2 < r`, a contradiction.
- Evidence defect: the current image already gives that same assumption, construction and contradiction, with s instead of r. A variable rename creates no fresh demonstration. With only two authored cases, the other, valid `irrational-root` case does not cure this duplication.
- Image actually inspected: `app/public/assets/goal-visualizations/mathematik/c5ea9b97-746f-5e8b-9fe1-26a8406ac3a9/c5ea9b97-746f-5e8b-9fe1-26a8406ac3a9.jpg`.
- Image SHA-256: `3c4baf860fceb7bb983f79d55a0bc54dcf00d1d39871530e77ad68ffa0a61772`.
- Recommended replacement: a different elementary contradiction situation, for example proving that for arbitrary real `a < b` there exists a real number strictly between them. Assume there is none, construct `m = (a+b)/2`, and justify both `m-a = (b-a)/2 > 0` and `b-m = (b-a)/2 > 0` before drawing the contradiction. This remains within the current proof competence and needs no unstated number-theory theorem. Do not supply the solution as a learner-facing hint and then count its repetition as independent work.
- Preserve: the correctly reasoned `irrational-root` case, including its explicitly supplied parity lemma, unless another binding change requires review.

### P-02 — Strategy choice is preselected by the teaching image

- Goal: `01217f4a-5221-5df9-b379-7b241fccf809`, **Beweisstrategien vergleichen und wählen (LK)**.
- Case: `sum-strategy`.
- Mathematical validity: the summation formula and the induction step are correct; a comparison of induction and contradiction can be meaningful.
- Evidence defect: the image shows precisely `1+…+n = n(n+1)/2` with the induction option visibly checked. The case's requested explanation adds something, but its central example and selected strategy are not fresh. It should not be retained as the second independent case where a simple alternative is available.
- Image actually inspected: `app/public/assets/goal-visualizations/mathematik/01217f4a-5221-5df9-b379-7b241fccf809/01217f4a-5221-5df9-b379-7b241fccf809.jpg`.
- Image SHA-256: `aacb77f75615e1e9ae07702f281a53387e76517db191a363456c888ef31b9aa5`.
- Recommended replacement: compare direct algebra and induction for `S_n = 1+2+…+2^(n-1) = 2^n-1`, integers `n ≥ 1`. Induction has base `S_1=1` and step `S_(n+1)=S_n+2^n`; the direct argument subtracts `S_n` from `2S_n`. Both are valid and a reasoned choice of either must be accepted. The competence is comparing strategies, not guessing a uniquely permitted technique.
- Preserve: `parity-choice`; it distinguishes a direct approach from the productive contrapositive using the definition of evenness.

### P-03 — Available fence is not automatically an equality constraint

- Goal: `a288231e-e4bb-5c65-b018-b79a51ca87d8`, **Gegebenes und Gesuchtes bestimmen**.
- Case: `fence-data`.
- Both DE and EN prompts say that 24 m of fence are available. That initially gives `2x+y ≤ 24`, not `2x+y = 24`.
- The expected equality is appropriate if all the fence must be used. It is also true at the positive-area maximum, but proving saturation of an inequality constraint adds reasoning that the deliberately bounded AB1 identification task did not request.
- Concrete distinction: `x=3 m, y=4 m` respects availability (`2x+y=10 m ≤24 m`) but violates the expected equality. A learner should not be marked wrong for identifying the genuine availability constraint.
- Recommended smallest correction: explicitly state in **both** languages that all 24 m must be used on the three un-walled sides, with an adequately long straight wall. Then `x>0`, `y>0`, `2x+y=24` and `0<x<12` follow without solving the optimization task. Preserve the instruction not to optimize.
- The current image's four-sided perimeter example is not the same task; it does not repair the wording defect and does not itself create a further P freshness finding.
- Preserve: `ticket-data`, which correctly uses an inequality and a nonnegative-integer unknown.

## Case-by-case substantive observations

For every row, both `taskDemand`, `expectedPerformance` and `understandingFocus` were compared in German and English. No change of mathematical meaning between the languages was found. The fence ambiguity occurs in both languages, so translation agreement does not make it valid. All general arguments below were checked symbolically; finite computational samples are only supplementary checks.

| Goal / cases | Independent mathematical and scope check | Variation and image check / result |
| --- | --- | --- |
| `50b9426f-ebec-526d-8b9d-e61d9707a46e` — `even-definition`; `reciprocal-domain` | `n=2k` with integers n,k correctly defines evenness; `x·(1/x)=1` requires real `x≠0`. Both tasks clarify terms and domains without quietly requiring a proof. | Integer definition versus real definedness is a genuine change. The image uses `x²=4` and a changed universe, not these answers. No P finding. |
| `1e164a09-0a2b-55ab-b927-08a4a278f72b` — `square-test`; `fixed-perimeter` | `x=1/2` gives `1/4<1/2`; −1,0,1,2 examine distinct regions and boundaries. Perimeter-20 rectangles `(5,5)`, `(3,7)`, `(0.1,9.9)` have areas 25,21,0.99. The expected response correctly separates plausibility from proof of a global maximum. | Numeric sign regions versus geometric symmetry/extreme aspect ratios; no calculus or optimization proof demanded. No active image to copy. No P finding. |
| `04118376-6dd8-532e-ab38-be22017ba93d` — `root-square`; `divide-order` | `√(x²)=|x|` for all reals, equal to x exactly for `x≥0`. Division preserves strict order for `c>0`, reverses it for `c<0`, and is undefined for `c=0`; all three cases are distinguished. | Truth domain versus sign-dependent order transfer. The image's `1/x` example only supplies a general definedness idea, not these answers. No P finding. |
| `3de1d5b0-0a26-5124-b066-92b65a882c5e` — `multiple-six`; `same-square` | `n=6k=3(2k)` proves the divisibility statement for every admissible integer. Real numbers 2 and −2 have the same square but are unequal, refuting the converse-like claim. | A general positive derivation and a genuine counterexample; not merely two positive spot checks. Image uses even squares / prime 2, different claims. No P finding. |
| `591cb948-f313-5b1c-a9cb-3df8162eeb8b` — `divisibility-chain`; `geometry-chain` | `12|n ⇒ 4|n ⇒ 2|n` follows through integer factors. Square ⇒ rectangle ⇒ parallelogram follows from the relevant definitions; an oblique parallelogram blocks the converse. | Image has `12⇒6⇒3` with one numeric example, not the required symbolic explanations of the revised chain. Geometry supplies a separate structural transfer. No P finding. |
| `2b497114-66ce-5f38-9b4d-dd17a2f4088f` — `cancel-zero`; `converse-four` | Dividing `x²=x` by x loses the solution 0; `x(x−1)=0` recovers exactly 0 and 1. Being even is not sufficient for divisibility by 4: 10 is a valid counterexample. Both responses repair/explain the error rather than just naming it. | Lost solution versus invalid converse. Image uses `(x−1)/(x−1)` and its excluded value; the new arguments must be constructed. No P finding. |
| `a8d4eb81-b77a-53e3-813a-dbfeed09f1bf` — `all-positive-square`; `exists-fixed-square` | Negation of `∀x∈ℝ: x²>0` is `∃x∈ℝ: x²≤0`, witnessed by 0. `∃n∈ℤ: n²=n` is true at 0 or 1; its universal negation is false. Quantifiers and predicates are both negated correctly. | Universal and existential cases, symbolic wording plus witnesses. Generic quantifier pictures do not disclose the arithmetic conclusions. No P finding. |
| `09e85220-afc3-5357-b5bc-c4b2c17e85aa` — `sum-of-squares`; `rectangle-area` | For `(a+b)²=a²+b²`, `(1,1)` gives 4 versus 2, `(1,−1)` gives 0 versus 2, and `(0,2)` gives equality. Area-36 rectangles yield perimeters 24,26,30,74 for the listed pairs. Examples do not establish the global minimum. | Systematic sign/zero cases versus geometry with a fixed invariant. Own image tests `n²−n` evenness, not either task. No P finding. |
| `e2d56885-a204-54b4-8717-a46d029ef416` — `positive-product`; `equal-sides` | `(-2)(-3)=6>0` disproves the asserted positive signs. A rhombus of side 2 and angles 60°,120°,60°,120° is a realizable non-square with four equal sides. | Sign construction versus geometric construction, each checks premise and failed conclusion. Image uses divisibility by 4, not these constructions. No P finding. |
| `f84ea3d8-c255-552a-998a-202e42843f56` — `equal-squares-refutation`; `perimeter-refutation` | `x=-3` satisfies `x²=9` but not `x=3`. Rectangles 2×8 and 5×5 both have perimeter 20 but areas 16 and 25. The expected response states claim, admissible object, contradiction and consequence. | Numeric versus geometric refutation, different from the image's rectangle/square claim. No P finding; existing D/image hold is **not** cleared by this result. |
| `d21a1303-50fc-5e38-aeda-eeae3392c74b` — `odd-sum`; `square-inequality` | `(2k+1)+(2l+1)=2(k+l+1)` proves evenness, with integer witnesses. `(a−b)²≥0` rearranges to `a²+b²≥2ab` for all real a,b. Generality is justified, not inferred from samples. | Image proves the sum of two even numbers; odd inputs require a changed representation. The real inequality provides independent structural transfer. No P finding. |
| `c5ea9b97-746f-5e8b-9fe1-26a8406ac3a9` — `no-smallest-positive`; `irrational-root` | The halving contradiction is correct. For √2, assume a reduced ratio p/q; `p²=2q²` gives p even, then q even, contradicting reduction. The needed square/parity lemma is explicitly supplied, so no additional hidden theorem is demanded. | **P-01:** first case repeats the complete own-image proof. Second case is different and valid but cannot alone supply the required two fresh demonstrations. Revision required. |
| `5c632c68-fc34-582e-8581-ae9e55ab538f` — `odd-number-sum`; `factorial-bound` | Odd-number sum: base n=1; `n²+(2n+1)=(n+1)²`. Factorial bound: base `1!=2⁰`; `(n+1)n!≥2·2^(n−1)=2^n` since `n+1≥2`. Hypothesis and domain `n≥1` are sound. | Identity versus inequality; neither task is the image's `1+…+n` identity. No P finding. |
| `f2df01c0-355e-5e51-973f-d31b0eed28ec` — `divisibility-writeup`; `triangle-writeup` | Given divisibility ingredients combine as `3k+3l=3(k+l)`. For an equilateral triangle, the explicitly provided equal-angle and angle-sum facts give three 60° angles. The learner must make assumptions, variable meanings, steps and conclusion clear. | Algebraic versus geometric presentation. Supplied ingredients are appropriate to this presentation goal, not a failure to invent a new theorem. Image is an organizational outline with an evenness snippet, not either completed write-up. No P finding. |
| `01217f4a-5221-5df9-b379-7b241fccf809` — `parity-choice`; `sum-strategy` | `n²` odd ⇒ n odd is efficiently proved contrapositively with `n=2k ⇒ n²=2(2k²)`. The summation induction is algebraically correct, and alternative valid proofs are not forbidden. | **P-02:** second case duplicates the own-image identity and checked strategy. Preserve the first; replace the second with a genuinely different method comparison. Existing D hold remains. |
| `4ae439c0-ce3c-5c96-9755-9899bc70e948` — `larger-number`; `radical-equivalence` | `∀x∈ℝ ∃y∈ℝ: y>x` has witness `x+1`, not a single y larger than every x. For `√(x+2)=x`, equality requires `x≥0`; under that condition squaring is equivalent, candidates 2 and −1 reduce to 2. Root definedness alone (`x≥−2`) is correctly not enough. | Image's `x+1>x` gives a related witness, but not the two-quantifier order analysis or the rejection of a uniform maximum. Radical equivalence supplies a new, separate formalization context. No P finding. |
| `dd1d9f9c-0a4e-5d01-95d8-f6993163b20c` — `cancel-assumed-equality`; `induction-without-base` | With `a=b=1`, the first illegal step is cancelling `a−b=0`; earlier subtraction/factorization is valid. The false identity “sum of n odd numbers = n²+1” has a valid conditional induction algebra but a false base (`1≠2`). The missing base, not the step algebra, is the defect. | A concealed zero divisor versus an invalid induction foundation. Image illustrates another rational-expression domain restriction; identifying the first invalid step in a chain requires additional work. No P finding. |
| `a288231e-e4bb-5c65-b018-b79a51ca87d8` — `fence-data`; `ticket-data` | **P-03:** “available” gives `2x+y≤24`; the expected equality needs explicit full use or an extra optimization argument. Ticket budget correctly gives `60+8n≤180` with integer `n≥0`; computing the maximum is deliberately not required. | Continuous lengths versus integral headcount is meaningful variation. The fence wording must be fixed without expanding the goal into optimization. Existing D hold remains. |
| `14173f5e-d3ba-51e5-b510-49ecd0abad90` — `tariff-question`; `consecutive-question` | With `A=10+2n`, `B=25`, integer `n≥0`, “lohnt” needs an explicitly chosen `<` (cheaper) or `≤` (not more expensive) criterion; no solution is demanded. The consecutive-integer question becomes `∀n∈ℤ: 2|n(n+1)`, equivalently an integer-witness formulation. | The image also uses tariffs, but the flat-rate comparison and ambiguity clarification require new formulation; the separate quantified proof target is a substantial transfer, not another numerical tariff instance. No P finding. |
| `c1a23239-08c5-5fe2-a68f-f2075fdeb454` — `trip-plan`; `pool-plan` | Trip: `(25·7+240−90)/25=13` per person; the required ordered subproblems matter more than the final number. Pool: `4·2·0.75=6 m³=6000 L`, then `6000/50=120 min=2 h`. Unit conversion must precede applying the filling rate. | Aggregating/splitting a budget versus volume, units and rate. Image gives only a school-festival decomposition, not these plans or results. Equivalent valid step orders are allowed. No P finding. |

## Supplementary local verification and limits

A bounded read-only Node assertion run passed for the 20/40 counts, bilingual field presence, E1/G1 and coverage settings, all explicitly listed numerical counterexamples and rectangle calculations, the induction algebra on small integer samples, the radical candidates, trip budget, pool units and the available-fence counterexample. The new geometric-sum recommendation was also spot-checked. General mathematical validity was reviewed symbolically above; sampling is not being represented as proof.

The 19 opened images were the active files under `app/public/assets/goal-visualizations/mathematik/<goalId>/<goalId>.jpg` at review time. No images were changed. Similar teaching patterns alone were not treated as defects: for example, a divisibility chain with a new symbolic justification and a separate geometry transfer is not equivalent to copying a complete visible proof. The findings target actual loss of independence or an incorrect task constraint.

No global report, curriculum build, human adjudication or learner execution was performed by this countercheck. Remaining dispositions are AI review recommendations. A later version that fixes the three findings needs a focused delta check; it should reuse these other substantive observations when their bindings remain unchanged.
