# Independent content review of five downstream ordinary goals

Reviewer: delegated Codex AI reviewer, 13 November 2026. Findings only; no canonical, QA, registry, existing review, or status changes. No CQR or tests run by this reviewer. This report is not human approval, learner observation, runtime acceptance, review activation, or proof of prerequisite sufficiency.

AGENTS.md §2.5 was read before judgment. The actual complete tool-derived current JSON and full-text knowledge-context snapshots were read for all five goals; the secured-scope delta and before snapshots were consulted for the loss. No handwritten prerequisite closure substitutes for those snapshots. Active P owners were resolved from `curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json`; original-author candidates outside those active config scopes were not used as substitutes.

Finding: **08b80080 has a real unresolved loss of exponential derivative support in its current active P content.** The other four inspected goals' concrete current content does not need the lost exponential part of 858113c5. Their polynomial derivatives are secured through 623cd47f, factor/sum rules and the integer power rule. These are bounded content-impact judgments, not full sufficiency verdicts.

Shared secured references present in every current W:

- `623cd47f-6f9e-58a7-911c-69e4a8609a27`: Ganzrationale Funktionen ableiten.
- `dde9ae98-d97d-598b-92f4-f1616f4d75c8`: Faktor- und Summenregel beweisen und anwenden.
- `e9445479-c188-5c09-842d-faa5e8678099`: Potenzregel für ganzzahlige Exponenten exemplarisch begründen.
- `350fc8b1-ead0-4239-b28a-217cbd3bd1c3`: Monotonie und Extremstellen mit der ersten Ableitung untersuchen.
- `b3604df4-15a8-41c8-a8b0-50dadd698bd3`: Krümmung und Wendestellen mit der zweiten Ableitung untersuchen.

Lost in all five: `858113c5-e53b-57bb-b01f-ba95c3ddcb6f`, whose current description explicitly includes simple exponential and power functions as well as polynomials to degree 3. Polynomial623 does not supply an exponential derivative rule. The generic secured difference-quotient goal does not silently grant every catalogued elementary-function derivative competence.

All five current canonical objects were inspected completely (DE/EN descriptions, requirements, resourceLinks and remaining fields). None contains examData, cards or memory fields. The central active memory config `curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.config.json` points to `canonical-math-full.review.jsonl` and `canonical-math-full.cards.review.jsonl`: all five goal records say `no_memory_needed`; no matching card-review records were found. No standalone memory deck was used as support.

## 08b80080-4895-55df-8ca6-4e8c5eb0f9f5 — Funktionsklassen argumentativ vergleichen

Complete derived inputs: `current-08b80080-4895-55df-8ca6-4e8c5eb0f9f5.json`, `current-08b80080-4895-55df-8ca6-4e8c5eb0f9f5.txt`; corresponding before JSON/full text. Secured count: 82 → 81.

Active P config: `curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-aeae-notation-imagegen-p-rebind-v1/retained-fourteen.config.json`. Actual active record: `curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-aeae-notation-imagegen-p-rebind-v1/retained-fourteen.review.jsonl`, reviewId `canonical-math-m7-q4-argumentation-communication-image-bound-15-20260923-v1`, profile fingerprint `sha256:105c44d02d4571a98f17292fdc89e0f5fb0984d389b3248a9cd5a254b56ec489`. Current record status `needs_human_review`, authority `ai_candidate`; those statuses were not changed or upgraded.

Image directly inspected with view_image: `app/public/assets/goal-visualizations/mathematik/08b80080-4895-55df-8ca6-4e8c5eb0f9f5/08b80080-4895-55df-8ca6-4e8c5eb0f9f5.jpg` (sha256:4c60bd73d9d1fd83317dad33cebb33fd20314e714be0bbca96c96e32066d2a72).

Current tool-derived immediate secured basis: `d5feba00-4336-4f26-8dba-0537a797eddb` (Notwendige und hinreichende Bedingungen für Extrem- und Wendestellen unterscheiden); `e9c401b1-144d-525f-a148-a1113b2e82a8` (Polynomgleichungen in Funktionsuntersuchungen lösen); `2919b3f3-aca2-5add-beeb-de1b9e0eafd8` (Trigonometrische und ganzrationale Funktionen vergleichen).

**Verdict: current content still reaches into lost exponential differentiation; unresolved finding.** The description is broad (known classes, end behavior, extrema/inflections, roots), rather than polynomial-only. The active P `cubic-exponential` case compares x³−x with 2^x, requires justified conclusions and says formula structure and derivatives carry the comparison. Its core observable demand explicitly compares using formulas, derivatives and domains. The response asserts that 2^x strictly increases and has no extrema or inflection. The current W has no exponential-function goal or exponential derivative goal to support that derivative-based part. The image independently includes h(x)=2^x−4, its horizontal asymptote, no extrema/inflections and logarithmic root strategy. Polynomial623 plus factor/sum/power rules cover x³−x, not differentiation of 2^x. Algebraic exponential arguments might establish some conclusions, but that does not erase the actual active profile's derivative demand. Therefore an unconditional “unaffected” finding would be false.

The second active P `rational-quadratic` case uses 1/(x−1), poles, asymptotes and a shifted parabola. The secured integer power rule covers x⁻¹ but does not itself establish the general chain rule for the shifted reciprocal. A direct difference-quotient calculation is possible; this report does not claim automatic prerequisite sufficiency for that case. Domain/asymptote/logarithm/function-family preparation gaps are preexisting, distinct from loss of858. Secured goal `d5feba00-4336-4f26-8dba-0537a797eddb` supplies necessary/sufficient derivative criteria; `e9c401b1-144d-525f-a148-a1113b2e82a8` supplies polynomial equation strategies. Neither replaces exponential differentiation. Image inspected directly with view_image: quadratic, cubic and exponential rows match the stated comparison scope.

## 250daae6-58fd-59e4-8a11-f994e789ee47 — Einfache Parametertransformationen in Funktionsuntersuchungen nutzen

Complete derived inputs: `current-250daae6-58fd-59e4-8a11-f994e789ee47.json`, `current-250daae6-58fd-59e4-8a11-f994e789ee47.txt`; corresponding before JSON/full text. Secured count: 41 → 43.

Active P config: `curricula/DE/Gymnasium/quality/goal-evidence/2026-11-13/derivative-order-and-saddle-current-v1/math-b038a-retained-nine.config.json`. Actual active record: `curricula/DE/Gymnasium/quality/goal-evidence/2026-11-13/derivative-order-and-saddle-current-v1/math-b038a-retained-nine.review.jsonl`, reviewId `canonical-math-positive-evidence-b038a-derivative-applications-and-exponentials-13-v1`, profile fingerprint `sha256:721f3a5ef064983fbd7c903c09d9f2c4b89779e212db11aa9d14b2b1798b3639`. Current record status `needs_human_review`, authority `ai_candidate`; those statuses were not changed or upgraded.

Image directly inspected with view_image: `app/public/assets/goal-visualizations/mathematik/250daae6-58fd-59e4-8a11-f994e789ee47/250daae6-58fd-59e4-8a11-f994e789ee47.jpg` (sha256:d8141da896b7706ca44d81030935a88fff01101d3cd0d29b70b0d4c819639917).

Current tool-derived immediate secured basis: `b3604df4-15a8-41c8-a8b0-50dadd698bd3` (Krümmung und Wendestellen mit der zweiten Ableitung untersuchen); `7ba19509-8ee6-50e0-a411-a371f05b1801` (Verschiebungen und Streckungen von Funktionsgraphen erkennen).

**Verdict: no concrete need for lost exponential differentiation in inspected current content.** The active P uses reflected cubic −2(x³−3x)+1 and h_a=a x²+5 with a=1/2 or0; its general g′=a f′ identity is supplied by secured factor/sum rules. Extrema/inflections are transferred only for nonzero a, and a=0 is explicitly separated. The image is a vertical transformation of a parabola with positive/negative scaling and vertical shift. No exponential example or derivative calculation occurs. Secured `7ba19509-8ee6-50e0-a411-a371f05b1801` supplies graph shifts/stretches, and shared350/b360 plus623 supply the derivative behavior actually used. The generic “simple functions” description is not a license to generate arbitrary unsecured nonpolynomial examples. Polynomial/function-family foundation gaps remain preexisting; no full sufficiency approval.

## 2919b3f3-aca2-5add-beeb-de1b9e0eafd8 — Trigonometrische und ganzrationale Funktionen vergleichen

Complete derived inputs: `current-2919b3f3-aca2-5add-beeb-de1b9e0eafd8.json`, `current-2919b3f3-aca2-5add-beeb-de1b9e0eafd8.txt`; corresponding before JSON/full text. Secured count: 43 → 45.

Active P config: `curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-m7-p-stale-isolation-20260928-v1/retained-15/positive-evidence.config.json`. Actual active record: `curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-m7-p-stale-isolation-20260928-v1/retained-15/positive-evidence.review.jsonl`, reviewId `canonical-math-positive-evidence-v1-b030-atlas-context-recheck-18-current-v1`, profile fingerprint `sha256:259c6a85f4f66a5bded0caf52086823670c9f18c0215291551488192d5ad706c`. Current record status `needs_human_review`, authority `ai_candidate`; those statuses were not changed or upgraded.

Image directly inspected with view_image: `app/public/assets/goal-visualizations/mathematik/2919b3f3-aca2-5add-beeb-de1b9e0eafd8/2919b3f3-aca2-5add-beeb-de1b9e0eafd8.jpg` (sha256:3e1ee79d0b4b3e234fbd5d41b8bed4a0fc2898fb16ad86e40c4dbbcec5742cdf).

Current tool-derived immediate secured basis: `b3604df4-15a8-41c8-a8b0-50dadd698bd3` (Krümmung und Wendestellen mit der zweiten Ableitung untersuchen); `56fba457-ab98-5b96-963e-ec284458c17f` (Periodische Prozesse modellieren).

**Verdict: no concrete need for lost exponential differentiation in inspected current content.** Active P compares 2sin x+1 with −0.2x²+2x+1, seasonal polynomial versus sine fit, and cos t with local quadratic1−t²/2. Its trigonometric reasoning uses periodicity, boundedness, concrete zeros/symmetry and model horizon, not differentiation of sine/cosine. The image compares sin x with x³−x graphically by periodicity, boundedness and end behavior; it shows no trigonometric derivative formula. Secured `bbef7cf2-90fa-59fa-a115-8b651aab9231` (sine/cosine), `ea8e3dfb-7fd7-5d49-ae07-01864e6aa464` (periodic parameters), `56fba457-ab98-5b96-963e-ec284458c17f` (periodic models), `eda3a298-4965-525e-878d-f05b9e2d4503` (characteristic trig points through symmetry) and `ecd13e54-ab0e-550f-9400-66e13306635d` (trig equations) support that actual trig usage.623 covers any polynomial differentiation. The unsecured sine/cosine derivative goal is not needed for these concrete cases. Preexisting polynomial family/end-behavior preparation is not declared sufficient by this result.

## 6947245e-6bd7-52d7-9bc2-0c60cfa447c5 — Parameterwerte aus vorgegebenen Funktionseigenschaften bestimmen

Complete derived inputs: `current-6947245e-6bd7-52d7-9bc2-0c60cfa447c5.json`, `current-6947245e-6bd7-52d7-9bc2-0c60cfa447c5.txt`; corresponding before JSON/full text. Secured count: 74 → 73.

Active P config: `curricula/DE/Gymnasium/quality/goal-evidence/m7-j9-e-keep-fifteen-20260923-v1/positive-evidence.config.json`. Actual active record: `curricula/DE/Gymnasium/quality/goal-evidence/m7-j9-e-keep-fifteen-20260923-v1/positive-evidence.review.jsonl`, reviewId `canonical-math-positive-understanding-evidence-m7-j9-e-keep-fifteen-20260923-v1`, profile fingerprint `sha256:c9cd63abbefcd0e4f710fd199faacf846d3ca49d4c45d4ac5fc75cbc996d89d4`. Current record status `needs_human_review`, authority `ai_candidate`; those statuses were not changed or upgraded.

Image directly inspected with view_image: `app/public/assets/goal-visualizations/mathematik/6947245e-6bd7-52d7-9bc2-0c60cfa447c5/6947245e-6bd7-52d7-9bc2-0c60cfa447c5.jpg` (sha256:a2becc8b2b73b425cca04a59ecf0f1a2340523d8237efd66643ef82bbdd692fa).

Current tool-derived immediate secured basis: `b3604df4-15a8-41c8-a8b0-50dadd698bd3` (Krümmung und Wendestellen mit der zweiten Ableitung untersuchen); `e9c401b1-144d-525f-a148-a1113b2e82a8` (Polynomgleichungen in Funktionsuntersuchungen lösen).

**Verdict: no concrete need for lost exponential differentiation in inspected current content.** The description explicitly restricts to polynomial terms. Active P determines a from x²+a x+2 having root1 (a=−3), and b from x³+b x²+3x having inflection at2 (b=−6; second derivative6(x−2) changes sign). The image reconstructs x³−6x²+9x from polynomial root/extremum/inflection conditions. All differentiation here is polynomial and secured by623 and its rules. Secured `e9c401b1-144d-525f-a148-a1113b2e82a8` supports polynomial equations; shared350/b360 support actual extremum and curvature criteria. The image's verification panel only checks f′(1)=0 and f″(2)=0, without showing the additional sufficient check; this is a preexisting presentation limitation, not a newly lost exponential competence. Do not interpret the necessary equalities alone as sufficient. The active P does require the full curvature-change check. No full sufficiency approval.

## 79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16 — Ortskurven von Wendepunkten bestimmen (LK)

Complete derived inputs: `current-79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16.json`, `current-79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16.txt`; corresponding before JSON/full text. Secured count: 37 → 39.

Active P config: `curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-m7-p-checkpoint-20260928-v1/retained-4/positive-evidence.config.json`. Actual active record: `curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-m7-p-checkpoint-20260928-v1/retained-4/positive-evidence.review.jsonl`, reviewId `canonical-math-m7-astra-current-image-bound-positive-evidence-20260924-v1`, profile fingerprint `sha256:d460a22c6ccbc70f6809d88382e221e40a105f1dff5050d6099ea0384b04acde`. Current record status `needs_human_review`, authority `ai_candidate`; those statuses were not changed or upgraded.

Image directly inspected with view_image: `app/public/assets/goal-visualizations/mathematik/79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16/79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16.png` (sha256:848461785b9fb2dd31af3aa457f3b081503c1131202b6c7c5191455a6ac23756).

Current tool-derived immediate secured basis: `b3604df4-15a8-41c8-a8b0-50dadd698bd3` (Krümmung und Wendestellen mit der zweiten Ableitung untersuchen).

**Verdict: no concrete need for lost exponential differentiation in inspected current content.** The active P moving case f_a=x³−3a x² gives W=(a,−2a³), y=−2x³; the vertical case g_t=x³−3t²x+t gives W=(0,t), locus x=0. Both use polynomial derivatives through third order, substitution and parameter elimination. The image directly displays the cubic family, a=−1,0,1 and the correct locus y=−2x³.623 supplies repeated polynomial differentiation and sharedb360 supplies inflection checking; no exponential or other nonpolynomial derivative occurs. Parameter elimination and distinguishing a vertical locus are the target's own learning work, not presumed mastery of an unsecured successor. The description does not restrict all possible families to polynomials, so this result covers the actual current active cases/image, not arbitrary future families. Preexisting function-family/parameter foundation gaps remain; no full sufficiency approval.

## Boundary and next decision

No edge, goal wording, profile, image, registry or acceptance status was repaired to fit the knowledge context. The exponential finding for08b80080 was reported early to the parent reviewer. It needs a separate pedagogical modeling/content decision, with honest provenance, before anyone claims the removal harmless for all descendants. The four other bounded no-loss findings do not certify their complete prerequisite sets. In particular, the known missing catalogued function-family foundations must remain findings rather than being relabeled baseline knowledge or ignored. As AGENTS.md §2.5 states, the derived knowledge context is not yet sufficient to restrict the coach.

## Supplemental assessment 74e9a588-cd05-5007-a715-f360fdea9989

The parent identified this additional non-ordinary W-loser. Before judging its content, this reviewer invoked the actual current CLI twice, with `--full --json` and `--full`, exit0 both times, producing `current-74e9a588-cd05-5007-a715-f360fdea9989.json` and `.txt` alongside this report. The complete actual outputs were read. Its kind is assessment, W has40 ordinary secured goals, and its immediate basis is `79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16`; that goal and the shared623/dde9/e944/350/b360 goals above are secured. As an assessment it develops no new subject matter and may only use W.

Inspected the complete current canonical assessment object, including released examData, taskContent, solutionContent, scoring and empty resourceLinks. Also read every file currently in `curricula/DE/Gymnasium/assessments/mathematik/structural-split-route-follow-up-2026-08-16/q4/q4-inflection-locus/`: `draft_v1.md`, `solution_v1.md`, `simulated_review_v1.md`. The existing historical review's claims were not adopted as new acceptance evidence.

**Verdict: no need for lost858 exponential scope in the actual assessment.** It uses only f_a(x)=x³−3ax² for real a: compute W_a, eliminate a, check a=2. The solution differentiates to f′=3x²−6ax, f″=6x−6a, f‴=6, verifies the inflection, obtains W=(a,−2a³) and y=−2x³, then checks (2,−16). The rubric awards6+4+2=12BE, passing6; its derivative work is polynomial. The coveredGoalIds and sole direct prerequisite are794. No image or other resource is attached to this assessment. Polynomial623 and the secured794 locus procedure account for the derivative/locus work without the lost exponential rule. This bounded no-loss finding is no approval of global prerequisite sufficiency, release status, scoring effectiveness or actual learner performance.

## Read-only candidate edge assessment requested by root

Candidate: retain the early polynomial application edge350→623, and add only a direct prerequisite from late Q4 cross-class comparison `08b80080-4895-55df-8ca6-4e8c5eb0f9f5` to `858113c5-e53b-57bb-b01f-ba95c3ddcb6f`. This is a content-matching candidate: its active P and image actually use the exponential family, while the other four ordinary goals and supplemental assessment reviewed here use no lost exponential differentiation. It preserves08b's complete class-comparison scope without moving the additional demand into early350 or changing its polynomial content.

An in-memory check loaded the current complete canonical catalog through the repository's `loadCanonicalCatalog`, then used the actual `KnowledgeContextIndex` / `UnitGraph` before and after modifying only the in-memory08b requires list. No file was changed. Results:

-858 was not already in08b reach;858 did not reach08b.
- After the candidate edge,08b does not reach itself: no newly created cycle.
- Its direct atomic prerequisite list is2919b3f3,858113c5,d5feba00,e9c401b1; no direct prerequisite is reached through another member of that list, so this local direct set remains transitively minimal.
- The secured reach gain for08b is exactly858113c5; the reach of350 is byte-for-byte identical when sorted, so no new early demand is introduced.

These are read-only candidate checks, not activation or a replacement for the canonical complete validation after an authorized edit. Within this five-goal plus one-assessment impact scope, no other lost858-specific edge is indicated by actual content. Preexisting function-family, domain, logarithm, parameter or other foundation gaps are not repaired or declared sufficient by this candidate.
