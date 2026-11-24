# Developed multiphase exam `05cfd298`: model check with two measurement series (proposal, second author edition)

Written by agent F (Claude side, model Opus 5.5) on 24 Nov 2026 for the Codex workstream. **Unreviewed author
proposal**, revised once after both independent review rounds on the withdrawn edition `2f8fb6…`
(`reviews/MP-final-2f8fb6-round-{a,b}.response.json`, summary `MP-final-2f8fb6-fachlicher-befund.md`). Nothing in
any worktree was changed.

Files:

- `exam-mp-model-check-edition.goal.json`: the complete proposed goal object, id
  `05cfd298-cb80-54c4-a898-b521ef270843`, same top-level and `examData` field set and order as the present exam.
  Raw SHA-256 `00da776e5807fc11c602914f326fc3f86b88cc279e00c8f4d0190e03b5dae0a6`.
- this README.
- Scratch, not durable, directory `/tmp/claude-1000/-home-enpasos-projects-skillpilot/3bff852e-c33a-4d0f-8d8a-670213c2fcc3/scratchpad/e1/f/`:
  `build2.py` builds the payload from the approved 30/18 object and asserts every replacement, the byte identity of
  parts 1–4 and the decimal notation. `compute2.py` recomputes and asserts every number, the realism checks and
  the score enumeration; its output is in `compute2.out`. `crosscheck2.py` checks the table and the derived
  numbers printed in both languages. `revision.py` replicates `AssessmentMaterialRevision`. `log.md` is the work log.

## 1 Identity and base

- **New id.** The developed edition is a separate assessment, `05cfd298-cb80-54c4-a898-b521ef270843`. The present
  exam `2b9e565f-d9b4-5e23-b5b7-b7977cecff06` stays untouched: its task, rubric 30/18, empty coverage, evidence
  (`mp-current/`, round responses) and stored learner results. The integrator moves it to the historical
  assessment container. Old results never count for the new exam or for MOD.
- **Base text.** The base is the object in the second model's commit `e42f2a19c7` (identical to `50c2569407` and to
  `mp-current/approved-current.goal.json`, raw SHA-256 `472fce30…`). Materials 1–3, the calculation note, tasks 1–4,
  their German and English solutions and rows s1–s4 are byte-identical to it; `build2.py` asserts this.

## 2 What changed against the reviewed edition `2f8fb6…`

| Element | Edition 2f8fb6 | This edition |
|---|---|---|
| Material 4 | Car only; S position at first contact compared with a point released at the edge; no definition of what the model's range refers to | Two series at the same edge: a steel ball 0.10 m in diameter (compressed-air launcher, then rolling freely) and the 4.2 m car, three runs each, per-run light-gate speeds within 8.0 ± 0.20 m/s. Measured quantity for both: horizontal distance of the centre of mass S (ball centre; marker on the car) from the ramp edge at the instant of the body's first ground contact. The material states plainly that the model's range is exactly this quantity for a point S that starts at the edge horizontally and touches down when S has fallen 1.25 m. |
| Release wording | DE "fährt waagerecht über die Kante", EN "leaves the edge horizontally" | Both: the body moves horizontally towards the edge and on beyond it; the light gate measures the speed just before the edge. Only the model statement says that S starts exactly at the edge horizontally. |
| Air resistance | Acceleration bound 0.2 m/s²; learner had to turn it into a range bound | Team estimate given directly as a bound on the measured quantity: at most 0.05 m for both bodies. The learner must use it (K3). Realistic values from `compute2.py`: ball −0.008 m (drag and spin lift), car +0.006 m. |
| Judgement | Car incompatible; compulsory cause: tipping (K5) | Ball compatible, car incompatible, on a printed control result. Edge, height, g, speed range and air are matched, so the difference lies in the body, whose size the point-mass model neglects. No mechanism is required. |
| Mechanisms | Core | Optional extensions in 5d: a conditional hypothesis (V1); a justified "the data do not decide, this measurement would" (V2); a conditional consequence for stunt or model (V3). A cause asserted as certain earns nothing. |
| Carry-forward | Allowed in part 5 | A printed control result `[3.70 m; 4.39 m]` in part 5; part 5 is marked only against it and material 4; carry-forward from parts 3–4 is excluded there. Method credit for an error carried from part 3 stays in part 4. Copying the control result into part 4 earns nothing there. |
| Pass line | "without the complete model check …" | Refers to the five core contributions of 5a–5c and states that the three extensions in 5d are optional. |
| Spread, systematic | "streuen nur um 0.13 m", "systematisch" | "Volle Spannweite 0.13 m"; "in allen drei Versuchen auf derselben Seite"; the cause is left open. |
| Remedies | Partly unconditional | Conditional only ("falls …"). |
| Id | 2b9e565f | 05cfd298 |

Unchanged from 2f8fb6: requires WW and MOD, covered goals MOD only, `coveredStrands` [LI_BEWEGUNG, LI_TECHNIK],
`demandLevels` [AB1, AB2, AB3], 36 BE with pass at 28, rows s1–s4, decimal points in every new text, description
"E.1 datenbasierte Modellierung und Modellprüfung, 36 BE", `reviewStatus` `needs_review`.

Against the present 30/18 exam: the context paragraph and the list of materials gain one sentence each, Material 4,
the pass line and part 5 are new, the old part-5 solution is replaced and marking notes are added.

Notation: everything added uses decimal points like tasks 1–4. The only decimal commas left are the 13 in the
second model's German part-4 solution, which must stay byte-identical.

## 3 MOD description against part 5

MOD `d6dc0e02`: "Die lernende Person kann die Idealisierungen eines Bewegungsmodells wie Massepunkt und
Reibungsfreiheit begründen und angeben, wo die Modellvorhersagen an Grenzen stoßen."

| Clause | Task | Core | Evidence the data support |
|---|---|---|---|
| Idealisierungen eines Bewegungsmodells | 5a | K1 | Names the point mass and the neglected air resistance. |
| … wie Massepunkt … begründen | 5a | K2 | The textbook criterion applied where it holds: the ball's diameter 0.10 m is small against the range of about 4 m (2.5 %). Recognising that the same criterion fails for the 4.2 m car. |
| … und Reibungsfreiheit begründen | 5b | K3 | The team's bound of at most 0.05 m compared with the control-interval width 0.69 m or the car gap of at least 0.59 m: justified for both bodies, and it cannot explain the car. |
| … angeben, wo die Modellvorhersagen an Grenzen stoßen | 5c | K4 | Both series with ±0.05 m against the printed control result: ball inside (compatible), car below (incompatible). |
| (same clause: where and why, as far as the data reach) | 5c | K5 | Matched conditions (edge, height, g, speeds within the interval's allowance, air too small; mass absent from the model). The bodies differ in size relative to the range, so the model is adequate for the compact body and reaches its limit for the car. The cause is not required, and "not decidable from these data" is correct. |

## 4 Scoring arithmetic

Row s5 (10 BE), marked against the printed control result and material 4. 7 BE if all of K1–K5 are shown. If any
core is missing: 1 BE if at least one core or extension contribution is correct, otherwise 0. V1–V3 add 1 BE each,
only from 7. Possible values: 0, 1, 7, 8, 9, 10. Rows s1–s4 are unchanged (7, 6, 7, 6). Maximum 36, pass 28.

- A missing core, including a wrong or missing compatibility judgement (K4) or limit statement (K5), gives at most
  26 + 1 = **27 < 28**.
- The judgement is made on fixed data (the printed control result and material 4) and carry-forward is excluded in
  part 5. A wrong part-4 interval can no longer make a wrong verdict count. Round B's counter-case (±0.30 s, own
  interval [1.59; 6.60] m, "compatible") therefore fails K4: s5 ≤ 1, total ≤ 21.
- A learner with a wrong part-4 interval (s4 = 0) and a correct judgement on the control result can reach
  20 + 0 + 8 = 28, a pass that carries valid MOD evidence.
- Exhaustive enumeration in `compute2.py` over s1–s4 (all integer values), the five core flags, the three extension
  flags and a partial-contribution flag: 4446 passing combinations, **0** with any core missing or wrong.
- Core without extensions: parts 1–4 need 21 of 26. Core with all three extensions: 18 of 26.
- The 28 cut is unchanged. Both rounds confirm it is the smallest integer above the missing-core maximum of 27.

## 5 Worked numbers (from `compute2.out`)

- Parts 1–4, unchanged: t_F = 0.5048188 s, x = 4.0385502 m, interval [3.7035865; 4.3855140] m, printed outward as
  [3.70; 4.39] m, width 0.69 m.
- Ball (runs 1–3): gate speeds 7.9, 8.0, 8.1 m/s; measured 3.96, 4.05, 4.11 m; with ±0.05 m that gives [3.91; 4.01],
  [4.00; 4.10] and [4.06; 4.16] m, all inside the control interval. Own-speed predictions v·t_F are 3.988, 4.039 and
  4.089 m; the measured values lie within 0.03 m of them. Mean 4.04 m, full spread 0.15 m.
- Car (runs 4–6): gate speeds 8.0, 8.1, 7.9 m/s; measured 2.98, 3.06, 2.93 m; with ±0.05 m that gives [2.93; 3.03],
  [3.01; 3.11] and [2.88; 2.98] m. The largest upper end, 3.11 m, is 0.59 m below 3.70 m. Mean 2.99 m, 1.049 m
  (26.0 %) below the nominal 4.04 m. Full spread 0.13 m; largest deviation from the mean 0.07 m.
- Ratios: ball 0.10/4.04 = 0.025, car 4.2/4.04 = 1.04. The nominal wheelbase time 2.6/8.0 = 0.325 s (0.64 t_F)
  appears only in the optional hypothesis.

## 6 Realism

- **Ball.** A 4.11 kg steel ball, v²/(g r) = 130 at the edge: it leaves the edge at once, with its centre above the
  edge and no vertical velocity. Its contact point at touchdown is directly below its centre, and its centre then
  has dropped exactly 1.25 m. The model's assumptions are therefore physically realised. Drag (c_w 0.47) and a
  generous topspin lift (C_L 0.3, 0.09 N) give −0.008 m. The measured values are v·t_F plus deviations of at most
  0.03 m, inside the ±0.05 m uncertainty.
- **Car.** A rigid-body model (pivot about the rear contact until the rear wheels pass the edge, then free flight)
  over twelve parameter variants gives S at first contact between 2.68 and 3.07 m, depending on speed and
  parameters. Pitch inertia, S position, S height, wheelbase, overhang and bumper height were varied; the first
  contact is the front bumper or a front wheel. Each measured car value lies inside the model range for its gate
  speed (2.73–3.01 m at 8.0, 2.78–3.07 m at 8.1, 2.68–2.96 m at 7.9), and all lie far below 3.70 m. This model
  supports realism only; the task does not use it, and no mechanism is required. Translational air effect on the
  car: +0.006 m.
- **Team estimate 0.05 m.** Conservative against both realistic values. It is stated in the material as the
  team's estimate.

## 7 Required corrections of both rounds

Round A:

1. *Correct the point-particle criterion; distinguish ballistic S motion from geometry-dependent first contact;
   establish release origin, vertical drop and contact convention.* The fixed-orientation criterion is gone. K2 uses
   size against range for the ball, where all model assumptions are physically realised (§6), and the material
   defines the model's range and the measured quantity in identical terms (S, edge, first ground contact). For
   the car, release and drop are not asserted; their failure is what the data show.
2. *Remove mandatory certainty about cause and magnitude; recognise evidence-limited alternatives.* No cause and
   no magnitude are required. K5 accepts "the data do not establish the cause", and V2 rewards it with a
   deciding measurement. A certain cause earns nothing.
3. *Reconcile the horizontal-departure wording; treat 0.325 s as a nominal estimate.* Both languages describe
   the approach ("moves horizontally towards the edge and on beyond it"); only the model statement says S starts
   horizontally at the edge. The time 0.33 s appears only in the optional hypothesis, called nominal.
4. *Limit drag conclusions to what is bounded; signs; approximate versus strict bounds; orientation effects.* The
   bound is now on the measured quantity itself, for both bodies, stated as the team's estimate. No learner sign
   argument is needed. The rubric asks only for comparison with a relevant scale.
5. *Resolve K4 against carry-forward.* Part 5 is judged on a printed control result, and carry-forward is
   excluded there (§4).
6. *Align mandatory demands with protected cores.* Every compulsory demand of 5a–5c is a core. The direction and
   magnitude demands of the old 5c are gone, and 5d is labelled optional in the task, the pass line and the rubric.
7. *Both languages, solution, rubric, coverage.* The German and English task, solution and rubric are built
   together, and `crosscheck2.py` checks the table and the derived numbers printed in both languages. Coverage stays MOD
   only pending review.
8. *Bind future results to this revision; preserve historical semantics.* There is a new id; the old exam,
   rubric, evidence and results stay untouched (§1, §8).

Round B:

1. *Align material 4, part 5 and K2/K5 on launch reference, S state and first-contact event; credit COM versus
   contact geometry.* One definition for both series: S, the edge, the first ground contact. The model is stated in
   the same terms. The S-versus-contact-geometry distinction earns V1.
2. *Credit conditional mechanisms and justified non-identifiability; no compulsory sign, magnitude or cause.*
   V1 and V2 do exactly this; K5 requires none of them.
3. *K3 must support the range claim including the time-of-flight effect; consistent signs, accuracy, scope.* The
   bound is given directly on the measured quantity (team estimate). K3, the solution and the rubric all use the
   same 0.05 m and the same comparison.
4. *K4 against carry-forward; pass notice refers to the five cores, extensions optional.* Control result and no
   carry-forward in part 5 (§4). The pass line names the five cores in 5a–5c and the optional extensions in 5d.
5. *0.13 m is the full spread; limit the systematic claim; remedies conditional.* "Volle Spannweite" / "full
   spread"; "auf derselben Seite in allen drei Versuchen"; remedies begin with "falls" / "if".
6. *Withhold MOD on that revision; repair within WW+MOD and 28.* 2f8fb6 is withdrawn. This edition keeps WW+MOD and
   28/36 and claims MOD only on acceptance.

Unsupported inferences listed by the rounds (fixed orientation, rotation versus S trajectory, wheelbase time,
front-first contact, translational bound on contact geometry, three same-sided runs, verbal completeness): none is
asserted or required any more. The observation "the front touches down first" is reported as data only.

## 8 Integration (after an accepting review only)

- **Material revision** of this payload (`revision.py`): task `sha256:8bd5ca209bc0de9879be7ad652f89794f6ea2a235664f11107173986ccb6a89e`,
  rubric `sha256:d753b3e7b7e3c597406a131808ef6e0b7349c3f0a222002b67fdbad7a2c8f41e`, fingerprint
  `sha256:520ed65f30b4383555b7fa23bf77e75b4a65f628fe475f412d6195fd1ede66bc`. Any correction changes them.
- **Status.** Set `reviewStatus` to `released` and replace `reviewNote` with the review references only after
  acceptance. Until then the present 30/18 exam stays the voluntary LK extra. Putting an unreleased exam into
  `additionalVoluntaryAssessmentGoalIdsByView` would turn all LK extras into required ones
  (`draftSupplementaryAssessmentCannotExemptASectionOrDisappearFromItsPlan`).
- **Swap of ids.** Add `05cfd298` to the canonical Physics landscape (no `shortKey`, as exam goals of this kind carry
  none). Replace `2b9e565f` by `05cfd298` in the Hessian placement (generator `scripts/generate_hessen_physics_stage_views.py`,
  the E.1 voluntary LK rule in `he-e1-motion-practice.json`, the eight Hessian views) and move `2b9e565f` to the
  historical container. Update the tests that pin the old id at its place: `CompositionViewServiceTest`,
  `UnitLearningMaterialServiceTest`, `ClaudeV1CompletionRouteIntegrationTest` (`MULTIPHASE_EXTRA`),
  `checkHesseE1Preview.mjs` and `testPhysicsAssessmentProjection.ts`. Replace the content assertions on the 30/18
  edition in `testPhysicsGoalBookInputs.ts` with the new receipt. The old id also appears in the non-Hessian Land
  views and in `generate_laender_physics_stage_views.memberships.json`. Whether the new exam is placed there is a
  separate decision; `applicability` was copied unchanged.
- **Quality lanes.** A semantic-kind entry for `05cfd298` (`practiceAssessment`) in `physik.semantic-kinds.json`.
  The strict current-input review lane for a new goal. Regenerated curriculum-quality status: CQR-203 complete for
  the new exam. The historical exam leaves the active scope by the container mechanism.

## 9 Open points and doubts

1. **The car still has an S-based observable.** It is well defined and robust in the model (§6), but a reviewer
   may ask whether S can be marked accurately on a car. A side marker at the known S position is standard in
   crash and stunt video analysis.
2. **The ball is launched differently** (launcher, rolling) from the car (driving). The comparison relies on matched
   edge, height, g and speeds and on the air bound. Mass is excluded because the model does not contain it.
   Shape and rotation are part of what the point mass neglects, so the attribution "the body's size" is the
   point-mass idealisation itself, not a mechanism.
3. **The printed control result reveals part 4's answer.** Part 4 still asks for the derivation, and the marking
   notes say the control result earns nothing there. Part 4 becomes easier to check for the learner.
4. **K1 is close to recall**, because 5a and 5b name the topics. The protected substance is in K2–K5.
5. **Threshold 78 %** (old 60 %), as before.
6. **The extensions are rewarded only above the core.** A learner with a correct V2 but a missing core gets 1 BE.

## 10 What the reviewer should look at first

1. Material 4: are the two measured quantities and the model's range defined identically and unambiguously in
   both languages, and are the ball values (inside) and car values (outside) realistic?
2. Row s5 and §4: no pass with a missing or wrong core, no carry-forward route to a wrong verdict, and K5 asks only
   what the data support.
3. Whether 5a–5c evidence every clause of MOD (§3).
