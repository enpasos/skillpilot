# MP `2b9e565f`: developed edition with a protected model check (proposal)

Written by agent F (Claude side, model Opus 5.5) on 24 Nov 2026 for the Codex workstream.
**Unreviewed author proposal.** Nothing in the repository was changed. The second model reviews it with
reviewers that did not author it and integrates it.

Files:

- `exam-mp-model-check-edition.goal.json` – the complete proposed goal object (same id, same top-level
  and `examData` field set and order as now). Raw SHA-256 `2f8fb6bacb78981267337e03a9d947cdc8144f51633c7f90f9eab2a419ea423d`.
- this README.
- Scratch (not durable): `/tmp/claude-1000/-home-enpasos-projects-skillpilot/3bff852e-c33a-4d0f-8d8a-670213c2fcc3/scratchpad/e1/f/build.py`
  (builds the payload from the current one with anchored, assert-checked replacements),
  `/tmp/claude-1000/-home-enpasos-projects-skillpilot/3bff852e-c33a-4d0f-8d8a-670213c2fcc3/scratchpad/e1/f/compute.py`
  (recomputes every number, the scoring arithmetic and the rigid-body realism check; output reproduced in §5 and §6),
  `/tmp/claude-1000/-home-enpasos-projects-skillpilot/3bff852e-c33a-4d0f-8d8a-670213c2fcc3/scratchpad/e1/f/revision.py`
  (replicates `AssessmentMaterialRevision`; it reproduces the four bound E.1 part revisions exactly).

## 1 Base text

`origin/feat/e1-kindeinheiten-nachweise` (head `f33d6c138e`, fetched 24 Nov) still carries the **old**
MP payload (requires VEC, three coverage claims, `[3.71; 4.39]`, no English bodies). The corrected text
the brief refers to exists only in the uncommitted working tree `/home/enpasos/projects/skillpilot-e1-nachweise`
(read only). The proposal is built on that working-tree goal object, which is byte-identical to
`…/e1-current-assessments-20261124-v1/mp-current/approved-current.goal.json` (raw SHA-256 `472fce30…`, the
dual-reviewed candidate of round 1). At 06:33 the second model's local commit `50c2569407` (not yet on
the remote when fetched) carries exactly this MP object. If a later text differs, rerun `build.py` on it:
every replacement asserts its anchor exists exactly once.

## 2 What changed, part by part

| Element | Change | Forced by |
|---|---|---|
| Context, first paragraph | One sentence added: the team checks the jump prediction with three test jumps. | New material |
| Context, list of materials | "… Material 3 … und Material 4 die Probesprünge." | New material |
| Materials 1–3 | Byte-identical. | – |
| Material 4 (new) | Decimal points throughout, like parts 1–4. Car length 4.2 m, wheelbase 2.6 m, centre of mass S about midway; three test jumps from the constant-speed phase; light-gate speeds 7.9 / 8.1 / 8.0 m/s; measured range = horizontal distance of S from the edge at the car's first ground contact: 2.98 / 3.06 / 2.93 m, each ±0.05 m; the front touches down first in all three videos; team estimate: air resistance changes the acceleration in any direction by at most 0.2 m/s². | Model check |
| Pass line (new, before the calculation note) | "Ab 28 von 36 BE ist die Prüfung bestanden. Ohne die vollständige Modellprüfung in Teilaufgabe 5 ist das nicht erreichbar." Same practice as C and D. | Transparency of the gate |
| Calculation note, tasks 1–4 | Byte-identical (DE and EN). | – |
| Task 5 | Old: "Nennen Sie zwei fachlich begründete Modellgrenzen der Rechnung. (4 BE)". New: model check with a) idealisations named, point particle and air resistance justified, b) measured values with uncertainty against the interval, c) direction and size of each violation, which idealisation fails, where and why (10 BE). | Brief |
| Solution 1–4 (DE and EN) | Byte-identical, including the second model's unrounded t_F and outward rounding. | – |
| Solution 5 | Replaced by the full worked model check (§5). | Brief |
| Marking notes (new, end of solution) | Level rule of row s5, cap, carry-forward, "a copied assumption is no justification", correctly rounded results earn full credit. | Gate; rounding false-fail risk at a higher threshold |
| `scoring` | `maxPoints` 30 → 36, `passingPoints` 18 → 28; s1–s4 byte-identical; s5 4 → 10 BE with a bilingual level description. | Gate arithmetic |
| `coveredGoalIds` | `[]` → `[MOD d6dc0e02]` | Brief |
| `coveredStrands` | `[LI_BEWEGUNG, LI_TECHNIK, LI_MATERIE]` → `[LI_BEWEGUNG, LI_TECHNIK]`, equal to `dimensionTags.guidingIdeas` as in the authoring scripts; nothing in the task concerns matter. | Consistency |
| `demandLevels` | unchanged `[AB1, AB2, AB3]` (parts 1–3 AB1/AB2, part 4 AB2, part 5 AB3). | – |
| `requires` | unchanged `[WW 89a8cf15, MOD d6dc0e02]` (R3: coverage ⊆ requires). | – |
| `description` / `descriptionEn` | "E.1/E.2 … 30 BE" → "E.1 datenbasierte Modellierung und Modellprüfung, 36 BE" (EN alike). The point count had to change; "E.2" was dropped because the exam returns to E.1. Optional. | Points |
| `reviewStatus` | `released` → `needs_review` until accepted (see §8, hazard). | Honesty |
| `reviewNote` | Rewritten to describe the edition (not part of the material revision). | – |
| `title`, `titleEn`, `tags`, `weight`, `dimensionTags`, `applicability`, `phase`, `type` | unchanged | – |

Parts 1 to 3 needed no change: the model check reuses their results.

## 3 MOD description against the task

MOD (`d6dc0e02`, current text on both branches): "Die lernende Person kann die Idealisierungen eines
Bewegungsmodells wie Massepunkt und Reibungsfreiheit begründen und angeben, wo die Modellvorhersagen an
Grenzen stoßen."

| Clause | Task part | Rubric (row s5) | Why it is real evidence here |
|---|---|---|---|
| Idealisierungen eines Bewegungsmodells (benennen) | 5a first sentence | K1 | The two idealisations of the calculation must be named; the constant g and the instantaneous horizontal take-off are accepted extras. |
| … wie **Massepunkt** … begründen | 5a second sentence | K2 | The car is 4.2 m long, the range 4.04 m: the textbook reason "small compared with the distances" is false and earns nothing. The learner must give the valid condition (the car keeps its orientation, so all parts move like S; equivalently: only S is followed and size/orientation do not matter at take-off and touchdown). |
| … und **Reibungsfreiheit** begründen | 5a third sentence | K3 | A quantitative estimate from the given bound (≤ 0.2 m/s²): range change of a few centimetres, compared with a relevant scale. A copied "Luftwiderstand wird vernachlässigt" does not count. |
| … angeben, **wo die Modellvorhersagen an Grenzen stoßen** | 5b | K4 | The prediction interval is confronted with measured values and their uncertainty; the verdict (inconsistent) and the reason why input uncertainties cannot be the cause. |
| (same clause: where and why) | 5c | K5 | The limit is located (transition at the edge), explained (front unsupported while the rear wheels still roll → tipping → S already descending / front touches down before S has fallen 1.25 m → shorter), and the competing idealisation is excluded by magnitude (K3). |

Deepening marks V1 (transition time 0.33 s against flight time 0.50 s), V2 (both drag components, −0.03 to
+0.04 m) and V3 (when the model would work / how to change stunt or model) add depth but are not needed
for the coverage claim.

## 4 Scoring arithmetic: no pass without the MOD evidence

Mechanisms that exist and were used (no new field): `maxPoints`, `passingPoints`, rubric rows whose
description fixes levels with a cap. This is the reviewed pattern of C (`c933b7d2`, 17/20, rows "0 / 1 /
2 = core / +1 each from this level") and D (`f13ca187`), which the round-1 reviewer described as "forces
level 2 in each row", and the native-total protection accepted for ZB in rounds 2 and 3 ("No separate
runtime gate is needed"). Nothing else exists: `ExamData.Step` has only `id`, `points`, `description` plus
hash-bound extra fields that no runtime reads, and AGENTS.md §4 forbids runtime qualifying evidence and
second per-part results. There is no per-part minimum.

Row s5 (10 BE): 0 without a correct contribution; **1** if at least one but not all of K1–K5; **7** if all
five; +1 each for V1–V3 only from 7. Possible values 0, 1, 7, 8, 9, 10.

- Maximum 36 = s1 7 + s2 6 + s3 7 + s4 6 + s5 10. Pass 28, allowed loss 8.
- Without all five core contributions: at most 26 + 1 = **27 < 28** → fail. This also covers four of five
  facets: no compensation between facets is possible.
- With the core level and no deepening: parts 1–4 need 21 of 26. With all deepening: 18 of 26.
- Exhaustive enumeration of all score vectors (s1 0–7, s2 0–6, s3 0–7, s4 0–6, s5 ∈ {0,1,7,8,9,10}):
  1147 passing vectors, **0** of them below the core level.
- At a pass a learner may omit at most one of parts 1–4 entirely (best totals 29/30/29/30). The exam
  claims only MOD, so this is consistent; WW stays a prerequisite, not a covered goal.
- Old edition for comparison: 30/18; omitting part 5 still gave 26.

Threshold 28/36 = 78 % (old 60 %). Any threshold that protects the row must exceed 26 + cap; the E.1 unit
exams run at 82–85 %. Alternative with the same protection if the reviewers prefer fewer points: s4 6 → 4
BE, 34/26 (76 %).

## 5 Complete worked solution (recomputed by `compute.py`)

Parts 1–4 unchanged: a₁ = 8.0/6.0 = 1.333 m/s² (interval means 1.6, 1.6, 0.8), a₂ = 0, a₃ = −2.0 m/s²;
trapezoids 3.2 + 9.6 + 14.4 + 16.0 + 12.0 = 55.2 m; t_F = √(2·1.25/9.81) = 0.504819 s, x = 4.038550 m;
x_min = 7.8·(t_F − 0.03) = 3.703586 m, x_max = 8.2·(t_F + 0.03) = 4.385514 m → [3.70; 4.39] m, width 0.682 m.

Part 5:

- a) Idealisations: point particle (car = its centre of mass S, no size, tilt or rotation) and no air
  resistance; the model also assumes a horizontal take-off exactly at the edge and constant g. Point
  particle: 4.2 m car vs 4.04 m range, so "small" is no reason; valid as long as the car keeps its
  orientation (all parts move like S; it then touches down on all wheels when S has fallen 1.25 m). Air
  resistance: horizontally ≤ ½·0.2·0.505² = 0.0255 m shorter; vertically g − 0.2 = 9.61 m/s² gives
  t ≤ 0.51004 s (+0.00523 s), x ≤ 4.0804 m (+0.042 m); together at the bound +0.016 m. Effect a few
  centimetres, small against the 0.7 m interval width → neglect justified.
- b) All measured values below 3.70 m; largest with uncertainty 3.06 + 0.05 = 3.11 m, gap 0.59 m; mean
  2.990 m (spread 0.13 m, sd 0.066 m), 1.049 m (26 %) below the nominal 4.04 m. Systematic. Input
  uncertainties are inside the interval; the light gate confirms 8.0 ± 0.2 m/s. Inconsistent.
- c) Air resistance: horizontal shorter, vertical longer, total −0.03 … +0.04 m, cannot explain ≈ 1 m.
  Point particle: front wheels pass the edge while the rear wheels roll on for 2.6/8.0 = 0.325 s = 0.64 t_F;
  the car tips forwards, S already descends when the car leaves the ramp and the front touches down before
  S has fallen 1.25 m → shorter, decimetres up to about 1 m possible; matches direction, size and the
  observation "front first". The limit lies at the transition from ramp to flight; air resistance stays
  negligible. Consequence: adequate if d/v ≪ t_F (compact body, much higher speed); for the stunt a slightly
  rising take-off ramp or rear ballast, then a new model and a new check.

## 6 Physical realism of Material 4

`compute.py` integrates a rigid car pivoting about its rear wheel contact (moving at 8 m/s) from the moment
the front axle passes the edge until the rear wheels leave (0.325 s), then free flight with constant
angular velocity until the first body point reaches the landing level 1.25 m below.

| Parameters (wheelbase d, S behind front axle, S height, pitch radius of gyration k) | tilt when rear leaves | S vertical speed then | S from edge at first contact | first contact |
|---|---|---|---|---|
| d 2.6, S midway, 0.55 m, k 1.25 m | 11.0° | −1.65 m/s | 2.96 m | front bumper |
| k 1.15 / 1.35 m | 11.8° / 10.2° | −1.77 / −1.53 m/s | 2.82 / 3.10 m | front bumper |
| S 1.15 / 1.45 m ahead of the rear axle | 10.9° / 11.0° | −1.46 / −1.82 m/s | 2.84 / 3.11 m | front bumper |
| S height 0.50 m; d 2.5 m | 11.1°; 10.1° | −1.66; −1.52 m/s | 2.91; 3.09 m | front bumper |

The measured values 2.93–3.06 m lie inside this range; the nose-first landing is what the material
reports. A real car leaving a horizontal 1.25 m edge at 8 m/s cannot land near the point-particle
prediction, so the compatibility verdict is clear by physics; the non-trivial judgement is the
attribution (both idealisations push the range the "short" way at first sight, only magnitude separates
them, and input uncertainties and speed are excluded by data). For scale: realistic air drag on such a car
is about 27 N, 0.02 m/s²; the 0.2 m/s² bound in the material is deliberately conservative.

The measured quantity is S's horizontal distance from the edge at the first ground contact. In the
point-particle model the point is S and "landing" means S has dropped 1.25 m, which for a level car is the
moment its wheels touch: the model predicts exactly the part-3/part-4 value for this quantity.

## 7 How the review objections are answered

| Objection (source) | Answer in this edition |
|---|---|
| "At 18/30 a learner can … omit s5 and obtain 26" (round1-a falsePassCheck); "s1+s2+s3 gives 20/30 with the uncertainty and model-limit parts blank" (round1-b); "kann der gesamte 4-BE-Teil bei einem 18/30-Pass fehlen" (status table, s5) | Without the full core of s5 the maximum is 27 < 28; enumeration finds no pass below the core. |
| "Die allgemeine Begründung der Idealisierungen, insbesondere des Massepunktmodells, ist nicht zwingend vollständig verlangt" (status table, s5) | K2 requires the point-particle justification with a valid condition, K3 the air-resistance justification with an estimate; both are core. |
| "The solution's model-limit bullets identify topics; they do not override s5's requirement for physical justification"; "an unexplained copied assumption is insufficient" (round1-a) | Row s5 and the marking notes state that a copied assumption fulfils neither K2 nor K3; K5 needs mechanism, direction and exclusion of the rival by magnitude. |
| "The learner must justify two limits, for example how drag changes the range … Merely repeating a supplied condition would fall short" (round1-b) | Task 5c asks for direction and size of each violation; K3/K5/V2 score exactly that. |
| "Requiring merely some task-6 points would still allow its distinct essential facets to compensate for one another" (ZB, round1-a) | The core level is a conjunction of K1–K5; 4 of 5 earns 1 BE. |
| False fail by valid rounding at a strict threshold (ZB, round2-b) | Threshold is not 100 %; marking notes: correctly rounded results earn full credit, interval limits rounded outwards. |
| The three old whole-goal claims (BZ, WW, MU) fail (both round-1 rows) | None is reclaimed. Part 4 still only propagates given bounds (no MU claim); WW stays a prerequisite; no frame or vector content. |
| "The product interval … has no stated confidence level" (round1-b scope limitation) | The verdict does not depend on one: the largest measured value plus its uncertainty is 0.59 m below the min/max-combination interval. |
| "Even 30/30 would not establish the missing whole-goal facets" (round1-a) | The edition claims only MOD, and every clause of MOD has a core criterion (§3). |
| AGENTS.md §4: review must test "whether passing without a claimed competence is possible" | §4 above. |

## 8 Versioning and bindings for the integrator

**Edition mechanism.** A changed task gets a new material revision; nothing else is needed for stored
results. `AssessmentMaterialRevision` hashes `{taskContent, solutionContent}` and `scoring` (with all
authored rubric fields) and binds the English bodies in the fingerprint; `VerifiedExamPass` is unique per
learner, goal and material fingerprint and stores earned, maximum and passing points of its own edition.
Existing rows and the binary mastery row of MP stay as they are. Revisions (computed with `revision.py`):

| Edition | taskRevision | rubricRevision | fingerprint |
|---|---|---|---|
| remote `f33d6c138e` (old text) | `sha256:659b9850cdcc120cc2aed56955e01693af74e8623908064dcd720a49cad839f8` | `sha256:d75ef07b70b1d9cb3ec7f00bafcdb06266e5f326a7daf72fea812dc8f5ceccef` | `sha256:289a46f9a1c29d4ab4e1cf3b854b01a7bbf3f43a5e4d6415a33efd9d42f62bfb` |
| working tree, reviewed 30/18 | `sha256:bd0be5f5971ecbe528c0effe3a2aff82c1b354099ceb54e622be7aae3ab3ff3e` | `sha256:d75ef07b…` (same) | `sha256:1f49912700972655c4a8f182d0933a2c6b34887c4d8ee52164447144151062e3` |
| this proposal | `sha256:08b5221766fcc4b86f6281e96be890ce9644181a62c0148943d086419cfdef8f` | `sha256:169f6e6ced3e98da2216aa14722389847836c45d3359ed1800251a108afc9211` | `sha256:4e2bd731475459c532bdeffaf735e6ef88f7e6400e45b46f945fb41a188a83e3` |

Any review correction changes these; recompute.

**Recognition claim (needs an explicit decision).** AGENTS.md §4: "a different recognition claim requires
a distinct assessment identity or an explicitly reviewed migration"; R5: later changes never grant
additional recognition to existing results. The brief keeps the id. Then the activation record must state
the reviewed migration: the MOD claim applies only to passes of this edition's material revision;
passes of earlier editions keep their meaning (no MOD credit, no backfill, no mastery write). Today no
runtime derives credit from `coveredGoalIds` (implicit recognition is not implemented; planning credits
are bound to reviewed releases and material revisions), so no code change is needed, but the record must
exist for the R5 runtime. Alternative, if the reviewers prefer: a new assessment id for the developed
edition, the old id kept as the 30/18 practice task.

**Must stay untouched:** stored learner results and `verified_exam_pass` rows; `mp-current/`,
round-1/2/3 responses and receipts (immutable evidence of the 30/18 edition); the V9 registry
`prerequisite-reduction-proof-registry.json` (MP is bound there; it already faces the strict current-input
review lane because `requires` changed); the four E.1 part bindings and the planning release of BES (MP is
no part and earns no planning credit).

**Must be done on integration:**

1. **Hazard: do not integrate with `needs_review` while MP is in the LK voluntary list.** The second
   model's working tree adds MP to `sectionAssessmentPolicy.additionalVoluntaryAssessmentGoalIdsByView` of
   `he-e1-motion-practice.json`. `LearnerService.voluntarySectionAssessments` returns an empty set as soon
   as any listed extra is not `released`, which turns ZB, FFX and MP into required assessments of the LK
   section (`ClaudeV1CompletionRouteIntegrationTest.draftSupplementaryAssessmentCannotExemptASectionOrDisappearFromItsPlan`
   shows exactly this). Integrate only after acceptance, then set `reviewStatus: released` and replace
   `reviewNote` with the review references.
2. Independent content review of task, solution, rubric, coverage and false-pass arithmetic in DE and EN,
   in the format of `e1-current-assessments-20261124-v1` (a new round directory or a new dated directory),
   plus a new activation receipt; the old `mp-current` receipt stays as the record of the 30/18 edition.
3. `app/scripts/testPhysicsGoalBookInputs.ts` (lines ~1236–1260 in the working tree) asserts the 30/18
   payload, `coveredGoalIds: []`, round-1 `recommendedPassingPoints 18` and the `mp-empty-native` CQR-203
   warning. These are content assertions, not placement pins: replace them with the new edition's receipt
   and a CQR-203 pass for MP (the native probe `native-contract/mp-empty-native.*` becomes historical).
4. Strict current-input review of MP in the V9 lane (goal changed again: description, examData).
5. Refresh the `sourceFingerprint` of MP in `curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json`
   (`practiceAssessment` stays).
6. Regenerate curriculum-quality status; CQR-203 for Physics Sek II should then count MP complete. Check
   that no floor drops.
7. Optional: after release, the course planner (`coursePlanTopicSelection`) will offer MP as whole-goal
   evidence for MOD because `coveredGoalIds` is non-empty; `individualAssessmentOffers` could name MP for
   MOD (exactly one covered goal), but this proposal does not ask for it.
8. Status entry in `codex-status.md`; CQR-203 for MP stays open until the release.

## 9 Open points and doubts

1. **Same identity.** See §8. I followed the brief, but §4 makes the migration statement mandatory.
2. **Clear compatibility verdict.** Physics forces a large deviation for a real car (§6). A measured value
   near 3.7 m would be unrealistic. The non-trivial part is the attribution. If reviewers want a closer
   verdict, the vehicle or the take-off would have to change, which touches parts 1–3.
3. **Threshold 78 %** instead of 60 %. A MOD-competent learner without deepening marks may lose only 5 BE
   in parts 1–4. Possible false fails by slips; the alternative weights are in §4.
4. **The level jump 1 → 7 in row s5** is unusual. Graders must decide K1–K5 one by one. A reviewer should
   judge whether an LLM grader applies it reliably; splitting s5 into two capped rows would force the
   threshold to about 92 %.
5. **K2 and the centre-of-mass theorem.** During free flight S follows the parabola even if the car rotates;
   the real failure is at take-off and touchdown. K2 therefore accepts "only S is followed, size and
   orientation irrelevant at take-off and touchdown" as equivalent; it does not require the theorem
   (not E.1). Check that K2 and K5 do not contradict each other in a grader's eyes.
6. **"Reibungsfreiheit" read as air resistance.** Rolling friction before the edge is excluded by the
   light gate; no other friction acts in flight. A reviewer may want one more sentence.
7. **Given drag bound.** The learner uses a stated bound, not a measured one; that is an estimate task
   (K3), not an experiment. The bound is conservative (§6).
8. **Material 4 with three nose-first test jumps** is rough on a car; "an instrumented test car" would be an
   editorial alternative without changing numbers.
9. **Decimal notation.** All text added by this edition (Material 4, part 5, its solution, the marking
   notes, row s5, in German and English) uses decimal points like the unchanged parts 1–4 of the task, so
   the German task body has no decimal comma (coordinator correction, 24 Nov; `build.py` asserts it). The
   only remaining decimal commas are the 13 in the second model's German part-4 solution, which had to stay
   byte-identical; harmonising them is an editorial follow-up that changes the task revision again.
10. **Bilingual style.** Row s5 is bilingual like the E.1 unit exams; s1–s4 stay German-only (unchanged).
11. **`dimensionTags`** unchanged; `PK1_EXPERIMENTIEREN` covers evaluating test-jump data at most.
12. **Description** "E.1" instead of "E.1/E.2" is my choice; revert if E.2 has a meaning I did not see.
13. **Workload** grows by 6 BE, about 15 minutes.

## 10 What the reviewer should look at first

1. Row s5 and §4: can a script pass without every K1–K5, and is "1 BE below the core" applied
   unambiguously?
2. K2 against K5 and §6: is the point-particle condition stated correctly, and is the edge-transition
   explanation of a 1 m shortfall physically sound and gradable at E.1?
3. §8 item 1 and the identity question before anything is integrated.
